import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const sortScript = await readFile(new URL("app/notice-sort.js", root), "utf8");
const manageHtml = await readFile(new URL("app/manage.html", root), "utf8");
const adminScript = await readFile(new URL("app/admin.js", root), "utf8");

function loadNoticeSort() {
  const context = vm.createContext({});
  vm.runInContext(sortScript, context);
  return context.KANGNAM_NOTICE_SORT;
}

test("공고 마감일 정렬", async (t) => {
  const noticeSort = loadNoticeSort();
  const now = new Date(2026, 6, 24, 12);

  await t.test("진행 공고는 가까운 마감일 순서이고 마감 공고는 마지막이다", () => {
    const notices = [
      { id: "closed-old", recruitmentStatus: "마감", publishedAt: "2026.07.01", facts: { period: "7월 1일 ~ 7월 20일" } },
      { id: "unknown", recruitmentStatus: "모집 중", publishedAt: "2026.07.23", facts: { period: "공식 공고 원문 확인" } },
      { id: "active-later", recruitmentStatus: "모집 중", publishedAt: "2026.07.20", facts: { period: "7월 20일 ~ 7월 30일" } },
      { id: "closed-by-date", recruitmentStatus: "모집 중", publishedAt: "2026.07.10", facts: { period: "7월 10일 ~ 7월 23일" } },
      { id: "active-near", recruitmentStatus: "마감 임박", publishedAt: "2026.07.22", facts: { period: "7월 22일 ~ 7월 25일" } },
    ];

    const sorted = noticeSort.sortNoticesByDeadline(notices, { now });
    assert.deepEqual(
      Array.from(sorted, (notice) => notice.id),
      ["active-near", "active-later", "unknown", "closed-by-date", "closed-old"],
    );
    assert.deepEqual(Array.from(notices, (notice) => notice.id), [
      "closed-old",
      "unknown",
      "active-later",
      "closed-by-date",
      "active-near",
    ]);
  });

  await t.test("기간의 마지막 날짜를 마감일로 사용한다", () => {
    const deadline = noticeSort.getNoticeDeadline({
      publishedAt: "2026.07.20",
      facts: { period: "7월 20일(월)–8월 2일(일) 17:00" },
    }, now);
    assert.equal(deadline.getFullYear(), 2026);
    assert.equal(deadline.getMonth(), 7);
    assert.equal(deadline.getDate(), 2);
  });

  await t.test("연말에서 연초로 넘어가는 기간의 연도를 보정한다", () => {
    const deadline = noticeSort.getNoticeDeadline({
      publishedAt: "2026.12.15",
      facts: { period: "12월 20일 ~ 1월 5일" },
    }, now);
    assert.equal(deadline.getFullYear(), 2027);
    assert.equal(deadline.getMonth(), 0);
    assert.equal(deadline.getDate(), 5);
  });
});

test("공개 공고 관리에는 선택 해제 버튼을 표시하지 않는다", () => {
  assert.doesNotMatch(manageHtml, /clear-published-selection-button|>선택 해제</);
  assert.doesNotMatch(adminScript, /clearPublishedSelectionButton|clearPublishedBulkSelection/);
});
