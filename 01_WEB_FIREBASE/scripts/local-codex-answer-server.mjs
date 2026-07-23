import { createServer } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = resolve(root, "app");
const host = process.env.CODEX_ANSWER_HOST || "127.0.0.1";
const port = Number(process.env.CODEX_ANSWER_PORT || 4174);
const models = (process.env.CODEX_ANSWER_MODELS || "gpt-5.3-codex-spark,")
  .split(",")
  .map((item) => item.trim())
  .filter((item, index, list) => item || index === list.length - 1);
const timeoutMs = Number(process.env.CODEX_ANSWER_TIMEOUT_MS || 120000);
const codexCommand = process.env.CODEX_ANSWER_COMMAND || "codex";
const maxBodyBytes = 128 * 1024;
const maxNoticeTextChars = 12000;
const readerEndpoint = "https://r.jina.ai/";
const allowedNoticeHost = "web.kangnam.ac.kr";

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".png", "image/png"],
  [".woff2", "font/woff2"],
]);

function getCodexSpawn() {
  if (process.env.CODEX_ANSWER_COMMAND) {
    return { command: process.env.CODEX_ANSWER_COMMAND, prefixArgs: [], shell: process.platform === "win32" };
  }

  const appData = process.env.APPDATA || "";
  const codexJs = appData ? join(appData, "npm", "node_modules", "@openai", "codex", "bin", "codex.js") : "";
  if (codexJs && existsSync(codexJs)) {
    return { command: process.execPath, prefixArgs: [codexJs], shell: false };
  }

  return { command: codexCommand, prefixArgs: [], shell: process.platform === "win32" };
}

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function validateNoticeUrl(value) {
  const url = new URL(String(value || ""));
  if (url.protocol !== "https:" || url.hostname !== allowedNoticeHost) {
    throw new Error("Only official Kangnam University notice URLs can be used.");
  }
  return url.toString();
}

function normalizeQuestion(value) {
  return String(value || "").trim().slice(0, 200);
}

function collectRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.byteLength;
      if (size > maxBodyBytes) {
        rejectBody(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      resolveBody(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", rejectBody);
  });
}

async function fetchNoticeText(sourceUrl) {
  const response = await fetch(`${readerEndpoint}${sourceUrl}`, {
    headers: {
      "Accept": "text/plain",
      "User-Agent": "KangnamNoticeGuideLocalCodex/1.0",
    },
  });

  if (!response.ok) return "";
  return (await response.text()).slice(0, maxNoticeTextChars);
}

function getImageUrls(body, sourceUrl) {
  const urls = [
    ...(Array.isArray(body.imageUrls) ? body.imageUrls : []),
    body.sourceImageUrl || "",
    body.imageUrl || "",
  ];

  return [...new Set(urls
    .map((url) => String(url || "").trim())
    .filter(Boolean)
    .map((url) => {
      try {
        return new URL(url, sourceUrl).toString();
      } catch {
        return "";
      }
    })
    .filter(Boolean))]
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.hostname === allowedNoticeHost && parsed.toString() !== sourceUrl;
      } catch {
        return false;
      }
    })
    .slice(0, 4);
}

function buildPrompt({ question, sourceUrl, notice, noticeText, imageUrls }) {
  return [
    "You are answering a student question about a Kangnam University notice.",
    "Answer in Korean only.",
    "Use only the official notice text, saved notice data, and original image URLs provided below.",
    "The saved notice data is approved app data. If the official notice text is garbled or incomplete, use the saved notice data first.",
    "If saved facts directly answer the question, answer from those facts instead of saying the notice cannot be confirmed.",
    "Do not browse the local filesystem, do not run commands, and do not modify files.",
    "If the answer is not supported by the provided notice data, say that it cannot be confirmed from the official notice.",
    "Keep the answer concise and practical.",
    "Return only the answer text. Do not include markdown fences.",
    "",
    "[Student question]",
    question,
    "",
    "[Official notice URL]",
    sourceUrl,
    "",
    "[Original image URLs]",
    imageUrls.length > 0 ? imageUrls.join("\n") : "No image URLs",
    "",
    "[Official notice text]",
    noticeText || "No readable notice text was extracted.",
    "",
    "[Approved saved notice data]",
    `Title: ${notice.title || "Needs confirmation"}`,
    `Department: ${notice.department || "Needs confirmation"}`,
    `Summary: ${notice.summary || "None"}`,
    `Saved facts: ${JSON.stringify(notice.facts || {})}`,
  ].join("\n");
}

async function runCodexOnce(prompt, modelName) {
  const isolatedRoot = resolve(tmpdir(), `kangnam-codex-answer-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(isolatedRoot, { recursive: true });

  const outputPath = join(isolatedRoot, "answer.txt");
  const args = [
    "--ask-for-approval", "never",
    "exec",
    "--sandbox", "read-only",
    "--ephemeral",
    "--skip-git-repo-check",
    "--cd", isolatedRoot,
    "--output-last-message", outputPath,
    "-",
  ];
  if (modelName) {
    args.splice(0, 0, "--model", modelName);
  }

  try {
    await new Promise((resolveRun, rejectRun) => {
      const codexSpawn = getCodexSpawn();
      const child = spawn(codexSpawn.command, [...codexSpawn.prefixArgs, ...args], {
        cwd: isolatedRoot,
        shell: codexSpawn.shell,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          NO_COLOR: "1",
        },
      });

      let stderr = "";
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        rejectRun(new Error("Codex answer timed out."));
      }, timeoutMs);

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });

      child.on("error", (error) => {
        clearTimeout(timer);
        rejectRun(error);
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolveRun();
          return;
        }
        rejectRun(new Error(stderr.trim() || `Codex exited with code ${code}.`));
      });

      child.stdin.end(prompt);
    });

    const answer = (await readFile(outputPath, "utf8")).trim();
    if (!answer) throw new Error("Codex returned an empty answer.");
    return answer;
  } finally {
    await rm(isolatedRoot, { recursive: true, force: true }).catch(() => {});
  }
}

async function runCodex(prompt) {
  const errors = [];
  for (const modelName of models) {
    try {
      return await runCodexOnce(prompt, modelName);
    } catch (error) {
      errors.push(`${modelName || "default"}: ${error.message || error}`);
      const message = String(error.message || error);
      if (!/not supported|Unknown model|invalid_request_error/i.test(message)) break;
    }
  }

  throw new Error(errors.join("\n"));
}

async function handleAskNotice(request, response) {
  try {
    const body = JSON.parse(await collectRequestBody(request) || "{}");
    const question = normalizeQuestion(body.question);
    if (!question) {
      jsonResponse(response, 400, { status: "error", message: "Please enter a question." });
      return;
    }

    const sourceUrl = validateNoticeUrl(body.sourceUrl);
    const notice = typeof body.notice === "object" && body.notice ? body.notice : {};
    const [noticeText, imageUrls] = await Promise.all([
      fetchNoticeText(sourceUrl),
      Promise.resolve(getImageUrls(body, sourceUrl)),
    ]);
    const answer = await runCodex(buildPrompt({ question, sourceUrl, notice, noticeText, imageUrls }));

    jsonResponse(response, 200, {
      status: "success",
      answer,
      source: "local Codex CLI",
      sourceUrl,
      imageCount: imageUrls.length,
    });
  } catch (error) {
    console.error("local Codex answer failed", error);
    jsonResponse(response, 500, {
      status: "error",
      message: error.message || "Unable to generate an answer with local Codex.",
    });
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = resolve(appRoot, `.${normalize(pathname)}`);

  if (!filePath.startsWith(appRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(filePath)) || "application/octet-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = createServer((request, response) => {
  if (request.method === "OPTIONS") {
    jsonResponse(response, 204, {});
    return;
  }

  const url = new URL(request.url || "/", `http://${host}:${port}`);
  if (url.pathname === "/api/askNotice" && request.method === "POST") {
    handleAskNotice(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

server.listen(port, host, () => {
  console.log(`Local Codex answer server: http://${host}:${port}`);
  console.log(`Codex models: ${models.map((item) => item || "default").join(" -> ")}`);
});
