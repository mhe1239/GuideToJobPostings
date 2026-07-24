import assert from "node:assert/strict";
import { createServer } from "node:net";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const root = new URL("../", import.meta.url);
const answerServiceSource = await readFile(new URL("app/answer-service.js", root), "utf8");
const worker = (await import(new URL("worker/src/index.js", root))).default;
const localServerPath = fileURLToPath(new URL("scripts/local-codex-answer-server.mjs", root));
const officialNoticeUrl = "https://web.kangnam.ac.kr/menu/board/info/example.do?id=123";
const officialImageUrl = "https://web.kangnam.ac.kr/files/notice-card.png";

const sampleNotice = {
  title: "2026학년도 비교과 프로그램 모집",
  department: "학생지원팀",
  summary: "재학생 대상 비교과 프로그램입니다.",
  sourceUrl: officialNoticeUrl,
  sourceImageUrl: officialImageUrl,
  imageUrls: [officialImageUrl, officialImageUrl],
  facts: {
    period: "7월 20일부터 7월 31일까지",
    eligibility: "강남대학교 재학생 및 편입생",
    field: "비교과 프로그램",
    documents: "참가 신청서",
    operation: "8월부터 11월까지",
  },
  faqs: [
    {
      question: "신청 기간은 언제인가요?",
      answer: "7월 20일부터 7월 31일까지입니다.",
      source: "공고문 신청 기간",
    },
  ],
};

function loadAnswerService(fetchImpl, publicConfig = {}) {
  const sandbox = {
    URL,
    fetch: fetchImpl,
    console: {
      warn() {},
      error() {},
      log() {},
    },
  };
  sandbox.window = { KANGNAM_PUBLIC_CONFIG: publicConfig };
  vm.createContext(sandbox);
  vm.runInContext(answerServiceSource, sandbox, { filename: "answer-service.js" });

  return {
    service: sandbox.window.KANGNAM_ANSWER_SERVICE,
    setFetch(nextFetch) {
      sandbox.fetch = nextFetch;
    },
  };
}

async function getFreePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
  });
  return port;
}

async function startLocalAnswerServer() {
  const port = await getFreePort();
  const child = spawn(process.execPath, [localServerPath], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      CODEX_ANSWER_HOST: "127.0.0.1",
      CODEX_ANSWER_PORT: String(port),
    },
  });

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  await new Promise((resolveReady, rejectReady) => {
    const cleanup = () => {
      clearInterval(poll);
      clearTimeout(timeout);
      child.off("exit", handleExit);
    };
    const handleExit = (code) => {
      cleanup();
      rejectReady(new Error(`Local answer server exited early (${code}). ${stderr}`));
    };
    const poll = setInterval(() => {
      if (stdout.includes("Local Codex answer server:")) {
        cleanup();
        resolveReady();
      }
    }, 20);
    const timeout = setTimeout(() => {
      cleanup();
      rejectReady(new Error(`Local answer server did not start. ${stderr}`));
    }, 5000);

    child.once("exit", handleExit);
  });

  return {
    child,
    origin: `http://127.0.0.1:${port}`,
  };
}

async function stopChild(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 2000)),
  ]);
}

test("AI answer pipeline", { concurrency: false }, async (t) => {
  await t.test("uses saved notice rules without a server call for non-official sources", async () => {
    let fetchCount = 0;
    const { service } = loadAnswerService(async () => {
      fetchCount += 1;
      throw new Error("fetch should not run");
    });

    const result = await service.generateAnswer("신청 기간이 언제인가요?", {
      ...sampleNotice,
      sourceUrl: "https://example.com/notice",
    });

    assert.equal(fetchCount, 0);
    assert.equal(result.status, "success");
    assert.match(result.answer, /7월 20일부터 7월 31일까지/);
  });

  await t.test("sends official notice context to the configured answer endpoint", async () => {
    let capturedRequest = null;
    const { service } = loadAnswerService(async (url, options) => {
      capturedRequest = {
        url: String(url),
        method: options.method,
        body: JSON.parse(options.body),
      };
      return new Response(JSON.stringify({
        status: "success",
        answer: "공식 공고를 바탕으로 생성한 답변입니다.",
        source: "official notice text",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }, {
      answerEndpoint: "https://answers.example.test/api/askNotice",
    });

    const result = await service.generateAnswer("모집 분야가 무엇인가요?", sampleNotice);

    assert.equal(capturedRequest.url, "https://answers.example.test/api/askNotice");
    assert.equal(capturedRequest.method, "POST");
    assert.equal(capturedRequest.body.sourceUrl, officialNoticeUrl);
    assert.deepEqual(capturedRequest.body.imageUrls, [officialImageUrl]);
    assert.equal(capturedRequest.body.notice.title, sampleNotice.title);
    assert.equal(result.status, "success");
  });

  await t.test("falls back to approved saved data when the remote answer service fails", async () => {
    const { service } = loadAnswerService(async () => new Response(JSON.stringify({
      status: "error",
      message: "temporary worker failure",
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }));

    const result = await service.generateAnswer("제출 서류가 무엇인가요?", sampleNotice);

    assert.equal(result.status, "success");
    assert.equal(result.answer, "참가 신청서");
    assert.equal(result.source, "핵심 정보 > 제출 서류");
  });

  await t.test("worker enforces methods, origins, and required questions", async () => {
    const env = {
      ALLOWED_ORIGINS: "https://guide-to-job-postings.web.app",
      GEMINI_API_KEY: "test-only-key",
    };

    const getResponse = await worker.fetch(new Request("https://worker.example.test/api/askNotice"), env);
    assert.equal(getResponse.status, 405);

    const optionsResponse = await worker.fetch(new Request("https://worker.example.test/api/askNotice", {
      method: "OPTIONS",
      headers: { Origin: "https://guide-to-job-postings.web.app" },
    }), env);
    assert.equal(optionsResponse.status, 204);
    assert.equal(optionsResponse.headers.get("Access-Control-Allow-Origin"), "https://guide-to-job-postings.web.app");

    const emptyResponse = await worker.fetch(new Request("https://worker.example.test/api/askNotice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://untrusted.example",
      },
      body: JSON.stringify({ question: "   " }),
    }), env);
    assert.equal(emptyResponse.status, 400);
    assert.equal(emptyResponse.headers.get("Access-Control-Allow-Origin"), null);
    assert.match((await emptyResponse.json()).message, /enter a question/i);
  });

  await t.test("worker builds a grounded Gemini request and filters external images", async () => {
    const originalFetch = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (input, options = {}) => {
      const url = String(input);
      calls.push({ url, options });

      if (url.startsWith("https://r.jina.ai/")) {
        return new Response("신청 기간은 7월 20일부터 7월 31일까지입니다.", { status: 200 });
      }
      if (url === officialImageUrl) {
        return new Response(new Uint8Array([1, 2, 3, 4]), {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }
      if (url.startsWith("https://generativelanguage.googleapis.com/")) {
        return new Response(JSON.stringify({
          candidates: [{
            content: {
              parts: [{ text: "신청 기간은 7월 20일부터 7월 31일까지입니다." }],
            },
          }],
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    };

    try {
      const response = await worker.fetch(new Request("https://worker.example.test/api/askNotice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://guide-to-job-postings.web.app",
        },
        body: JSON.stringify({
          question: "신청 기간이 언제인가요?",
          sourceUrl: officialNoticeUrl,
          imageUrls: [officialImageUrl, "https://external.example/image.png"],
          notice: sampleNotice,
        }),
      }), {
        ALLOWED_ORIGINS: "https://guide-to-job-postings.web.app",
        GEMINI_API_KEY: "test-only-key",
        GEMINI_MODEL: "gemini-test-model",
      });

      const payload = await response.json();
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://guide-to-job-postings.web.app");
      assert.equal(payload.status, "success");
      assert.equal(payload.imageCount, 1);
      assert.match(payload.source, /official notice text and images/);

      const geminiCall = calls.find(({ url }) => url.startsWith("https://generativelanguage.googleapis.com/"));
      assert.ok(geminiCall, "Gemini API request should be made by the Worker.");
      assert.match(geminiCall.url, /gemini-test-model:generateContent/);
      const geminiBody = JSON.parse(geminiCall.options.body);
      assert.equal(geminiBody.contents[0].parts.length, 2);
      assert.match(geminiBody.contents[0].parts[0].text, /신청 기간이 언제인가요/);
      assert.equal(calls.some(({ url }) => url === "https://external.example/image.png"), false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await t.test("worker rejects non-official notice URLs before external calls", async () => {
    const originalFetch = globalThis.fetch;
    const originalConsoleError = console.error;
    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      throw new Error("external fetch should not run");
    };
    console.error = () => {};

    try {
      const response = await worker.fetch(new Request("https://worker.example.test/api/askNotice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "신청 기간이 언제인가요?",
          sourceUrl: "https://example.com/not-allowed",
        }),
      }), {
        GEMINI_API_KEY: "test-only-key",
      });

      assert.ok([400, 500].includes(response.status));
      assert.match((await response.json()).message, /Only official Kangnam University notice URLs/);
      assert.equal(fetchCount, 0);
    } finally {
      globalThis.fetch = originalFetch;
      console.error = originalConsoleError;
    }
  });

  await t.test("local Codex server starts, serves the app, and validates input locally", async () => {
    const local = await startLocalAnswerServer();
    try {
      const pageResponse = await fetch(`${local.origin}/`);
      assert.equal(pageResponse.status, 200);
      assert.match(await pageResponse.text(), /강남대 공고 길잡이/);

      const emptyResponse = await fetch(`${local.origin}/api/askNotice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "" }),
      });
      assert.equal(emptyResponse.status, 400);
      assert.match((await emptyResponse.json()).message, /enter a question/i);

      const invalidSourceResponse = await fetch(`${local.origin}/api/askNotice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "신청 기간이 언제인가요?",
          sourceUrl: "https://example.com/not-allowed",
        }),
      });
      assert.equal(invalidSourceResponse.status, 500);
      assert.match((await invalidSourceResponse.json()).message, /Only official Kangnam University notice URLs/);
    } finally {
      await stopChild(local.child);
    }
  });
});
