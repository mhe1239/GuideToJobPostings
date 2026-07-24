import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [localServer, worker, configGenerator, rules] = await Promise.all([
  readFile(new URL("../scripts/local-codex-answer-server.mjs", import.meta.url), "utf8"),
  readFile(new URL("../worker/src/index.js", import.meta.url), "utf8"),
  readFile(new URL("../scripts/generate-firebase-config.mjs", import.meta.url), "utf8"),
  readFile(new URL("../firestore.rules", import.meta.url), "utf8"),
]);

test("security regression checks", async (t) => {
  await t.test("local Codex server rejects arbitrary browser origins", () => {
    assert.doesNotMatch(localServer, /Access-Control-Allow-Origin["']?\s*:\s*["']\*/);
    assert.match(localServer, /isAllowedApiOrigin/);
    assert.match(localServer, /filePath\.startsWith\(`\$\{appRoot\}\$\{sep\}`\)/);
  });

  await t.test("Gemini key is sent as a header rather than in the URL", () => {
    assert.doesNotMatch(worker, /generateContent\?key=/);
    assert.match(worker, /"x-goog-api-key": env\.GEMINI_API_KEY/);
    assert.match(worker, /This origin is not allowed/);
  });

  await t.test("notice answer worker reads official text and images only", () => {
    assert.match(worker, /fetchNoticeContext\(sourceUrl\)/);
    assert.match(worker, /fetchTextOrEmpty\(sourceUrl,\s*"text\/html/);
    assert.match(worker, /extractImageUrls\(html,\s*sourceUrl\)/);
    assert.match(worker, /data-src/);
    assert.match(worker, /srcset/);
    assert.match(worker, /response\.url && !isAllowedKangnamImageUrl\(response\.url\)/);
    assert.match(worker, /The original notice redirected to an untrusted URL/);
  });

  await t.test("school notice import is fetched server-side and mapped per notice", () => {
    assert.match(worker, /\/api\/admin\/school-notices/);
    assert.match(worker, /requireAdmin\(request,\s*env,\s*"editor"\)/);
    assert.match(worker, /parseSchoolNoticeList/);
    assert.match(worker, /detailLink/);
    assert.match(worker, /data-params/);
    assert.match(worker, /encMenuBoardSeq/);
    assert.match(worker, /encMenuSeq/);
  });

  await t.test("browser config does not expose administrator email lists", () => {
    assert.doesNotMatch(configGenerator, /FIREBASE_OWNER_EMAILS|FIREBASE_EDITOR_EMAILS/);
    assert.match(configGenerator, /owners:\s*\[\]/);
    assert.match(configGenerator, /editors:\s*\[\]/);
  });

  await t.test("Firestore list queries and writes have schema guards", () => {
    assert.match(rules, /request\.query\.limit <= 20/);
    assert.match(rules, /validNotice\(request\.resource\.data, noticeId\)/);
    assert.match(rules, /validAdmin\(request\.resource\.data, email\)/);
    assert.match(rules, /request\.auth\.token\.email != email/);
  });
});
