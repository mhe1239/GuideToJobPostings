const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const READER_ENDPOINT = "https://r.jina.ai/";
const ALLOWED_NOTICE_HOST = "web.kangnam.ac.kr";
const MAX_QUESTION_CHARS = 200;
const MAX_NOTICE_TEXT_CHARS = 12000;
const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  return getAllowedOrigins(env).includes(origin) ? origin : "";
}

function jsonResponse(request, env, status, payload) {
  const corsOrigin = getCorsOrigin(request, env);
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(corsOrigin ? { "Access-Control-Allow-Origin": corsOrigin } : {}),
      "Vary": "Origin",
    },
  });
}

function optionsResponse(request, env) {
  const corsOrigin = getCorsOrigin(request, env);
  return new Response(null, {
    status: 204,
    headers: {
      ...(corsOrigin ? { "Access-Control-Allow-Origin": corsOrigin } : {}),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  });
}

function normalizeQuestion(value) {
  return String(value || "").trim().slice(0, MAX_QUESTION_CHARS);
}

function validateNoticeUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    throw new Error("Invalid official notice URL.");
  }

  if (url.protocol !== "https:" || url.hostname !== ALLOWED_NOTICE_HOST) {
    throw new Error("Only official Kangnam University notice URLs can be used.");
  }

  return url.toString();
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(value, baseUrl) {
  try {
    return new URL(String(value || ""), baseUrl).toString();
  } catch {
    return "";
  }
}

function isAllowedKangnamImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === ALLOWED_NOTICE_HOST;
  } catch {
    return false;
  }
}

function extractImageUrls(html, baseUrl) {
  const urls = [];
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
  ];

  patterns.forEach((pattern) => {
    for (const match of String(html || "").matchAll(pattern)) {
      const url = toAbsoluteUrl(match[1], baseUrl);
      if (url) urls.push(url);
    }
  });

  return [...new Set(urls)].filter(isAllowedKangnamImageUrl);
}

function getProvidedImageUrls(body, sourceUrl) {
  const urls = [
    ...(Array.isArray(body.imageUrls) ? body.imageUrls : []),
    body.sourceImageUrl || "",
    body.imageUrl || "",
  ];

  return [...new Set(urls
    .map((url) => String(url || "").trim())
    .filter(Boolean)
    .map((url) => toAbsoluteUrl(url, sourceUrl))
    .filter(Boolean))]
    .filter(isAllowedKangnamImageUrl);
}

async function fetchText(url, accept = "text/html,text/plain;q=0.9") {
  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      "Accept": accept,
      "User-Agent": "KangnamNoticeGuide/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to read the original notice. HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchTextOrEmpty(url, accept) {
  try {
    return await fetchText(url, accept);
  } catch (error) {
    console.warn("notice fetch failed", url, error?.message || error);
    return "";
  }
}

async function fetchNoticeContext(sourceUrl) {
  const readerText = await fetchTextOrEmpty(`${READER_ENDPOINT}${sourceUrl}`, "text/plain");
  const text = readerText.slice(0, MAX_NOTICE_TEXT_CHARS);

  return {
    html: "",
    text: text || "No readable notice text was extracted. Use the saved notice information and attached images first.",
    hasOriginalContent: Boolean(text),
    imageUrls: [],
  };
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

async function fetchImagePart(url) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "Accept": "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8",
        "User-Agent": "KangnamNoticeGuide/1.0",
      },
    });

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) return null;

    return {
      inline_data: {
        mime_type: contentType.split(";")[0],
        data: arrayBufferToBase64(buffer),
      },
    };
  } catch (error) {
    console.warn("notice image fetch failed", url, error?.message || error);
    return null;
  }
}

function buildPrompt({ question, notice, sourceUrl, noticeText, imageUrls }) {
  return [
    "You are an assistant that answers questions about Kangnam University notices.",
    "Answer in Korean only, based only on the official notice text and attached/original images below.",
    "Do not guess. If the notice does not contain the answer, say that it cannot be confirmed from the official notice.",
    "Keep the answer short, clear, and practical. Do not contradict the official notice.",
    "At the end, add one sentence describing whether the answer was grounded in text, images, or saved notice data.",
    "",
    `[User question]\n${question}`,
    "",
    `[Saved notice data]\nTitle: ${notice.title || "Needs confirmation"}\nDepartment: ${notice.department || "Needs confirmation"}\nSummary: ${notice.summary || "None"}\nSaved facts: ${JSON.stringify(notice.facts || {})}`,
    "",
    `[Official notice URL]\n${sourceUrl}`,
    "",
    `[Original image URLs]\n${imageUrls.length > 0 ? imageUrls.join("\n") : "No image URLs"}`,
    "",
    `[Official notice text]\n${noticeText}`,
  ].join("\n");
}

function extractGeminiText(payload) {
  return (payload?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
}

async function callGemini(env, parts) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY secret is not configured.");
  }

  const model = env.GEMINI_MODEL || "gemini-2.0-flash";
  const response = await fetch(`${GEMINI_ENDPOINT}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 700,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini answer generation failed: HTTP ${response.status}`);
  }

  const answer = extractGeminiText(payload);
  if (!answer) throw new Error("Gemini returned an empty answer.");
  return answer;
}

async function handleAskNotice(request, env) {
  let step = "parse request";
  try {
    const body = await request.json().catch(() => ({}));
    step = "normalize question";
    const question = normalizeQuestion(body.question);
    if (!question) {
      return jsonResponse(request, env, 400, { status: "error", message: "Please enter a question." });
    }

    step = "validate source URL";
    const sourceUrl = validateNoticeUrl(body.sourceUrl);
    const notice = typeof body.notice === "object" && body.notice ? body.notice : {};
    step = "read notice context";
    const context = await fetchNoticeContext(sourceUrl);
    step = "prepare image URLs";
    const imageUrls = [...new Set([
      ...getProvidedImageUrls(body, sourceUrl),
      ...context.imageUrls,
    ])]
      .filter((url) => url !== sourceUrl)
      .slice(0, MAX_IMAGE_COUNT);
    step = "read notice images";
    const imageParts = (await Promise.all(imageUrls.map(fetchImagePart))).filter(Boolean);
    step = "build prompt";
    const prompt = buildPrompt({
      question,
      notice,
      sourceUrl,
      noticeText: context.text,
      imageUrls,
    });
    step = "call Gemini";
    const answer = await callGemini(env, [{ text: prompt }, ...imageParts]);

    return jsonResponse(request, env, 200, {
      status: "success",
      answer,
      source: context.hasOriginalContent
        ? (imageParts.length > 0 ? "official notice text and images" : "official notice text")
        : "saved notice data",
      sourceUrl,
      imageCount: imageParts.length,
    });
  } catch (error) {
    throw new Error(`${step}: ${error.message || error}`);
  }
}

export default {
  async fetch(request, env) {
    const requestOrigin = request.headers.get("Origin") || "";
    if (requestOrigin && !getAllowedOrigins(env).includes(requestOrigin)) {
      return jsonResponse(request, env, 403, {
        status: "error",
        message: "This origin is not allowed.",
      });
    }

    if (request.method === "OPTIONS") return optionsResponse(request, env);
    if (request.method !== "POST") {
      return jsonResponse(request, env, 405, {
        status: "error",
        message: "Only POST requests are supported.",
      });
    }

    try {
      return await handleAskNotice(request, env);
    } catch (error) {
      console.error("askNotice failed", error);
      return jsonResponse(request, env, 500, {
        status: "error",
        message: error.message || "Unable to generate an answer.",
      });
    }
  },
};
