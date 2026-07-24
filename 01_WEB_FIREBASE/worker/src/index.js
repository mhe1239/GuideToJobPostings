const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const READER_ENDPOINT = "https://r.jina.ai/";
const ALLOWED_NOTICE_HOST = "web.kangnam.ac.kr";
const MAX_QUESTION_CHARS = 200;
const MAX_NOTICE_TEXT_CHARS = 12000;
const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_ROLES = new Set(["owner", "editor", "viewer"]);
const ROLE_RANK = Object.freeze({ viewer: 0, editor: 1, owner: 2 });
const GOOGLE_CERTS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const MAX_NOTICE_JSON_CHARS = 24000;

let cachedFirebaseKeys = null;
let cachedFirebaseKeysExpiresAt = 0;

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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  return ALLOWED_ROLES.has(role) ? role : "viewer";
}

function cleanJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function normalizeNoticeForD1(value) {
  const notice = cleanJson(value);
  const id = String(notice.id || "").trim().slice(0, 120);
  const title = String(notice.title || "").trim().slice(0, 240);
  if (!id || !title) {
    const error = new Error("공고 ID와 제목이 필요합니다.");
    error.status = 400;
    error.code = "INVALID_NOTICE";
    throw error;
  }

  const approvalStatus = ["draft", "review", "published", "declined"].includes(notice.approvalStatus)
    ? notice.approvalStatus
    : "draft";
  const normalized = {
    ...notice,
    id,
    title,
    approvalStatus,
    isPublished: approvalStatus === "published",
    updatedAt: Number.isInteger(notice.updatedAt) ? notice.updatedAt : Date.now(),
  };
  const serialized = JSON.stringify(normalized);
  if (serialized.length > MAX_NOTICE_JSON_CHARS) {
    const error = new Error("공고 데이터가 너무 큽니다.");
    error.status = 400;
    error.code = "NOTICE_TOO_LARGE";
    throw error;
  }
  return { notice: normalized, serialized };
}

function assertD1(env) {
  if (!env.ADMINS_DB) {
    throw new Error("ADMINS_DB D1 binding is not configured.");
  }
  return env.ADMINS_DB;
}

function base64UrlToBytes(value) {
  const base64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJwtPart(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}

async function getFirebaseJwks() {
  if (cachedFirebaseKeys && Date.now() < cachedFirebaseKeysExpiresAt) {
    return cachedFirebaseKeys;
  }

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) throw new Error("Unable to load Firebase public keys.");
  const payload = await response.json();
  const maxAge = /max-age=(\d+)/.exec(response.headers.get("cache-control") || "")?.[1];
  cachedFirebaseKeys = payload.keys || [];
  cachedFirebaseKeysExpiresAt = Date.now() + (Number(maxAge || 3600) * 1000);
  return cachedFirebaseKeys;
}

async function verifyFirebaseToken(token, env) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Missing Firebase ID token.");

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJwtPart(headerPart);
  const payload = decodeJwtPart(payloadPart);
  const projectId = env.FIREBASE_PROJECT_ID || "guide-to-job-postings";
  const now = Math.floor(Date.now() / 1000);

  if (header.alg !== "RS256") throw new Error("Unsupported token signature.");
  if (payload.aud !== projectId) throw new Error("Invalid Firebase audience.");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("Invalid Firebase issuer.");
  if (!payload.exp || Number(payload.exp) <= now) throw new Error("Firebase token has expired.");
  if (!payload.email) throw new Error("Firebase token does not include an email.");

  const keys = await getFirebaseJwks();
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Firebase signing key was not found.");

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    base64UrlToBytes(signaturePart),
    new TextEncoder().encode(`${headerPart}.${payloadPart}`),
  );
  if (!valid) throw new Error("Invalid Firebase token signature.");

  return {
    email: normalizeEmail(payload.email),
    uid: payload.user_id || payload.sub || "",
  };
}

async function requireFirebaseUser(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  try {
    return await verifyFirebaseToken(token, env);
  } catch (error) {
    error.status = 401;
    error.code = "UNAUTHENTICATED";
    throw error;
  }
}

async function getStoredAdmin(db, email) {
  return db.prepare("SELECT email, role, source, created_at, updated_at FROM admins WHERE email = ?")
    .bind(normalizeEmail(email))
    .first();
}

async function getAdminRole(env, email) {
  const normalizedEmail = normalizeEmail(email);
  const bootstrapOwner = normalizeEmail(env.BOOTSTRAP_OWNER_EMAIL);
  if (bootstrapOwner && normalizedEmail === bootstrapOwner) {
    const db = assertD1(env);
    await db.prepare(`
      INSERT INTO admins (email, role, source, updated_at)
      VALUES (?, 'owner', 'bootstrap', CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET role = 'owner', updated_at = CURRENT_TIMESTAMP
    `).bind(normalizedEmail).run();
    return "owner";
  }

  const admin = await getStoredAdmin(assertD1(env), normalizedEmail);
  return normalizeRole(admin?.role);
}

async function requireAdmin(request, env, minimumRole = "viewer") {
  const user = await requireFirebaseUser(request, env);
  const role = await getAdminRole(env, user.email);
  if (ROLE_RANK[role] < ROLE_RANK[minimumRole]) {
    const error = new Error(minimumRole === "owner" ? "관리자 관리 권한이 없습니다." : "관리자 권한이 없습니다.");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }
  return { user, role };
}

async function handleAdminRole(request, env) {
  const { user, role } = await requireAdmin(request, env, "viewer");
  return jsonResponse(request, env, 200, {
    status: "success",
    email: user.email,
    role,
  });
}

async function handleListAdmins(request, env) {
  await requireAdmin(request, env, "owner");
  const rows = await assertD1(env)
    .prepare("SELECT email, role, source, created_at, updated_at FROM admins ORDER BY role, email LIMIT 50")
    .all();
  return jsonResponse(request, env, 200, {
    status: "success",
    members: rows.results || [],
  });
}

async function handleSaveAdmin(request, env) {
  await requireAdmin(request, env, "owner");
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const role = normalizeRole(body.role);
  if (!email) {
    return jsonResponse(request, env, 400, {
      status: "error",
      code: "INVALID_ADMIN",
      message: "관리자 이메일이 필요합니다.",
    });
  }

  await assertD1(env).prepare(`
    INSERT INTO admins (email, role, source, updated_at)
    VALUES (?, ?, 'cloudflare-d1', CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET role = excluded.role, updated_at = CURRENT_TIMESTAMP
  `).bind(email, role).run();

  return jsonResponse(request, env, 200, {
    status: "success",
    saved: true,
    member: { email, role, source: "cloudflare-d1" },
  });
}

async function handleDeleteAdmin(request, env, email) {
  const { user } = await requireAdmin(request, env, "owner");
  const normalizedEmail = normalizeEmail(email);
  const bootstrapOwner = normalizeEmail(env.BOOTSTRAP_OWNER_EMAIL);
  if (!normalizedEmail) {
    return jsonResponse(request, env, 400, {
      status: "error",
      code: "INVALID_ADMIN",
      message: "삭제할 관리자 이메일이 필요합니다.",
    });
  }
  if (normalizedEmail === bootstrapOwner || normalizedEmail === user.email) {
    return jsonResponse(request, env, 400, {
      status: "error",
      code: "OWNER_PROTECTED",
      message: "현재 최고 관리자는 삭제할 수 없습니다.",
    });
  }

  await assertD1(env).prepare("DELETE FROM admins WHERE email = ?").bind(normalizedEmail).run();
  return jsonResponse(request, env, 200, {
    status: "success",
    deleted: true,
  });
}

function parseNoticeRows(rows = []) {
  return rows
    .map((row) => {
      try {
        return JSON.parse(row.notice_json);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

async function handleListPublishedNotices(request, env) {
  const rows = await assertD1(env).prepare(`
    SELECT notice_json FROM notices
    WHERE approval_status = 'published'
    ORDER BY updated_at DESC
    LIMIT 50
  `).all();
  return jsonResponse(request, env, 200, {
    status: "success",
    notices: parseNoticeRows(rows.results || []),
    source: "cloudflare-d1",
  });
}

async function handleListAllNotices(request, env) {
  await requireAdmin(request, env, "editor");
  const rows = await assertD1(env).prepare(`
    SELECT notice_json FROM notices
    ORDER BY updated_at DESC
    LIMIT 50
  `).all();
  return jsonResponse(request, env, 200, {
    status: "success",
    notices: parseNoticeRows(rows.results || []),
    source: "cloudflare-d1",
  });
}

async function handleSaveNotice(request, env) {
  await requireAdmin(request, env, "editor");
  const { notice, serialized } = normalizeNoticeForD1(await request.json().catch(() => ({})));
  await assertD1(env).prepare(`
    INSERT INTO notices (id, approval_status, notice_json, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      approval_status = excluded.approval_status,
      notice_json = excluded.notice_json,
      updated_at = excluded.updated_at
  `).bind(notice.id, notice.approvalStatus, serialized, notice.updatedAt).run();

  return jsonResponse(request, env, 200, {
    status: "success",
    saved: true,
    source: "cloudflare-d1",
    notice,
  });
}

async function handleDeleteNotice(request, env, noticeId) {
  await requireAdmin(request, env, "editor");
  const id = String(noticeId || "").trim().slice(0, 120);
  if (!id) {
    return jsonResponse(request, env, 400, {
      status: "error",
      code: "INVALID_NOTICE",
      message: "삭제할 공고 ID가 필요합니다.",
    });
  }
  await assertD1(env).prepare("DELETE FROM notices WHERE id = ?").bind(id).run();
  return jsonResponse(request, env, 200, {
    status: "success",
    deleted: true,
    source: "cloudflare-d1",
  });
}

async function handleAdminRequest(request, env, url) {
  if (request.method === "GET" && url.pathname === "/api/admin/role") {
    return handleAdminRole(request, env);
  }
  if (request.method === "GET" && url.pathname === "/api/admin/members") {
    return handleListAdmins(request, env);
  }
  if (request.method === "POST" && url.pathname === "/api/admin/members") {
    return handleSaveAdmin(request, env);
  }
  if (request.method === "DELETE" && url.pathname.startsWith("/api/admin/members/")) {
    return handleDeleteAdmin(request, env, decodeURIComponent(url.pathname.replace("/api/admin/members/", "")));
  }
  if (request.method === "GET" && url.pathname === "/api/admin/notices") {
    return handleListAllNotices(request, env);
  }
  if (request.method === "POST" && url.pathname === "/api/admin/notices") {
    return handleSaveNotice(request, env);
  }
  if (request.method === "DELETE" && url.pathname.startsWith("/api/admin/notices/")) {
    return handleDeleteNotice(request, env, decodeURIComponent(url.pathname.replace("/api/admin/notices/", "")));
  }
  return jsonResponse(request, env, 404, {
    status: "error",
    message: "Admin API route was not found.",
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
    const url = new URL(request.url);
    const requestOrigin = request.headers.get("Origin") || "";
    if (requestOrigin && !getAllowedOrigins(env).includes(requestOrigin)) {
      return jsonResponse(request, env, 403, {
        status: "error",
        message: "This origin is not allowed.",
      });
    }

    if (request.method === "OPTIONS") return optionsResponse(request, env);
    if (request.method === "GET" && url.pathname === "/api/notices") {
      return handleListPublishedNotices(request, env);
    }
    if (url.pathname.startsWith("/api/admin/")) {
      try {
        return await handleAdminRequest(request, env, url);
      } catch (error) {
        console.error("admin api failed", error);
        return jsonResponse(request, env, error.status || 500, {
          status: "error",
          code: error.code || "ADMIN_API_ERROR",
          message: error.message || "관리자 권한 요청을 처리하지 못했습니다.",
        });
      }
    }

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
