import { onRequest } from "firebase-functions/v2/https";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const READER_ENDPOINT = "https://r.jina.ai/http://r.jina.ai/http://";
const ALLOWED_NOTICE_HOST = "web.kangnam.ac.kr";
const MAX_QUESTION_CHARS = 200;
const MAX_NOTICE_TEXT_CHARS = 12000;
const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function setCors(response) {
  response.set("Access-Control-Allow-Origin", "https://guide-to-job-postings.web.app");
  response.set("Vary", "Origin");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function normalizeQuestion(value) {
  return String(value || "").trim().slice(0, MAX_QUESTION_CHARS);
}

function validateNoticeUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    throw new Error("공식 공고 URL 형식이 올바르지 않습니다.");
  }

  if (url.protocol !== "https:" || url.hostname !== ALLOWED_NOTICE_HOST) {
    throw new Error("강남대학교 공식 공고 URL만 질문할 수 있습니다.");
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

  return [...new Set(urls)].filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === ALLOWED_NOTICE_HOST;
    } catch {
      return false;
    }
  });
}

function getProvidedImageUrls(body, sourceUrl) {
  const urls = [
    ...(Array.isArray(body.imageUrls) ? body.imageUrls : []),
    body.sourceImageUrl || "",
    body.imageUrl || "",
  ];

  return [...new Set(urls.map((url) => toAbsoluteUrl(url, sourceUrl)).filter(Boolean))]
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.hostname === ALLOWED_NOTICE_HOST;
      } catch {
        return false;
      }
    });
}

async function fetchText(url, accept = "text/html,text/plain;q=0.9") {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "KangnamNoticeGuide/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`원문을 읽지 못했습니다. HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchNoticeContext(sourceUrl) {
  const [htmlResult, readerResult] = await Promise.allSettled([
    fetchText(sourceUrl),
    fetchText(`${READER_ENDPOINT}${sourceUrl}`, "text/plain"),
  ]);

  const html = htmlResult.status === "fulfilled" ? htmlResult.value : "";
  const readerText = readerResult.status === "fulfilled" ? readerResult.value : "";
  const text = [readerText, stripHtml(html)].filter(Boolean).join("\n\n").slice(0, MAX_NOTICE_TEXT_CHARS);

  if (!text && !html) {
    throw new Error("공식 공고 원문을 읽지 못했습니다.");
  }

  return {
    html,
    text: text || "원문 텍스트를 추출하지 못했습니다. 제공된 이미지와 저장된 공고 정보를 우선 확인하세요.",
    imageUrls: extractImageUrls(html, sourceUrl),
  };
}

async function fetchImagePart(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8",
      "User-Agent": "KangnamNoticeGuide/1.0",
    },
  });

  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) return null;

  return {
    inline_data: {
      mime_type: contentType.split(";")[0],
      data: bytes.toString("base64"),
    },
  };
}

function buildPrompt({ question, notice, sourceUrl, noticeText, imageUrls }) {
  return [
    "너는 강남대학교 공고 질문 답변 도우미다.",
    "아래 공식 공고 원문 텍스트와 첨부/원문 이미지 내용만 근거로 한국어로 답변한다.",
    "원문에 없는 내용은 추정하지 말고 '공식 공고 원문에서 확인되지 않습니다'라고 말한다.",
    "신청 기간, 지원 자격, 제출 서류, 담당 부서 같은 항목은 원문과 충돌하지 않게 짧고 명확하게 답한다.",
    "답변 끝에는 근거가 된 원문 위치나 이미지 확인 여부를 한 문장으로 붙인다.",
    "",
    `[사용자 질문]\n${question}`,
    "",
    `[현재 저장된 공고 정보]\n제목: ${notice.title || "확인 필요"}\n부서: ${notice.department || "확인 필요"}\n요약: ${notice.summary || "없음"}\n저장된 핵심 정보: ${JSON.stringify(notice.facts || {})}`,
    "",
    `[공식 공고 URL]\n${sourceUrl}`,
    "",
    `[원문 이미지 URL]\n${imageUrls.length > 0 ? imageUrls.join("\n") : "이미지 URL 없음"}`,
    "",
    `[공식 공고 원문 텍스트]\n${noticeText}`,
  ].join("\n");
}

function extractGeminiText(payload) {
  return (payload?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
}

async function callGemini(parts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    throw new Error(payload?.error?.message || `Gemini 답변 생성 실패: HTTP ${response.status}`);
  }

  const answer = extractGeminiText(payload);
  if (!answer) throw new Error("Gemini가 빈 답변을 반환했습니다.");
  return answer;
}

export const askNotice = onRequest(
  {
    region: "asia-northeast3",
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request, response) => {
    setCors(response);
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }
    if (request.method !== "POST") {
      sendJson(response, 405, { status: "error", message: "POST 요청만 지원합니다." });
      return;
    }

    try {
      const question = normalizeQuestion(request.body?.question);
      if (!question) {
        sendJson(response, 400, { status: "error", message: "질문을 입력해 주세요." });
        return;
      }

      const sourceUrl = validateNoticeUrl(request.body?.sourceUrl);
      const notice = typeof request.body?.notice === "object" && request.body.notice ? request.body.notice : {};
      const context = await fetchNoticeContext(sourceUrl);
      const imageUrls = [...new Set([
        ...getProvidedImageUrls(request.body || {}, sourceUrl),
        ...context.imageUrls,
      ])].slice(0, MAX_IMAGE_COUNT);
      const imageParts = (await Promise.all(imageUrls.map(fetchImagePart))).filter(Boolean);
      const prompt = buildPrompt({
        question,
        notice,
        sourceUrl,
        noticeText: context.text,
        imageUrls,
      });
      const answer = await callGemini([{ text: prompt }, ...imageParts]);

      sendJson(response, 200, {
        status: "success",
        answer,
        source: imageParts.length > 0 ? "공식 공고 원문 및 이미지" : "공식 공고 원문",
        sourceUrl,
        imageCount: imageParts.length,
      });
    } catch (error) {
      console.error("askNotice failed", error);
      sendJson(response, 500, {
        status: "error",
        message: error.message || "답변을 생성하지 못했습니다.",
      });
    }
  },
);
