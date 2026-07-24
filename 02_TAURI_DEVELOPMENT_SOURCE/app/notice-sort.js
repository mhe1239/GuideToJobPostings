"use strict";

(() => {
  const CLOSED_BUCKET = 2;
  const UNKNOWN_DEADLINE_BUCKET = 1;
  const ACTIVE_BUCKET = 0;

  function createValidDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year
      || date.getMonth() !== month - 1
      || date.getDate() !== day
    ) {
      return null;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function getReferenceYear(notice, now) {
    const source = `${notice?.publishedAt || ""} ${notice?.date || ""}`;
    const matchedYear = source.match(/\b(20\d{2})\b/);
    return matchedYear ? Number(matchedYear[1]) : now.getFullYear();
  }

  function parseDeadlineText(value, fallbackYear) {
    const text = String(value || "").trim();
    if (!text) return null;

    const candidates = [];
    const numericPattern = /(20\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/g;
    const koreanPattern = /(?:(20\d{2})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일/g;

    for (const match of text.matchAll(numericPattern)) {
      candidates.push({
        index: match.index,
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      });
    }
    for (const match of text.matchAll(koreanPattern)) {
      candidates.push({
        index: match.index,
        year: match[1] ? Number(match[1]) : null,
        month: Number(match[2]),
        day: Number(match[3]),
      });
    }

    candidates.sort((left, right) => left.index - right.index);
    let rollingYear = fallbackYear;
    let previousMonth = 0;
    let deadline = null;

    candidates.forEach((candidate) => {
      let year = candidate.year || rollingYear;
      if (
        candidate.year === null
        && previousMonth >= 10
        && candidate.month <= 3
        && candidate.month < previousMonth
      ) {
        year += 1;
      }
      rollingYear = year;
      previousMonth = candidate.month;
      const parsed = createValidDate(year, candidate.month, candidate.day);
      if (parsed) deadline = parsed;
    });

    return deadline;
  }

  function getNoticeDeadline(notice, now = new Date()) {
    const fallbackYear = getReferenceYear(notice, now);
    const periodSection = Array.isArray(notice?.sections)
      ? notice.sections.find((section) => section?.key === "period")?.text
      : "";
    const candidates = [
      notice?.deadline,
      notice?.endDate,
      notice?.applicationEndDate,
      notice?.facts?.deadline,
      notice?.facts?.endDate,
      notice?.facts?.period,
      notice?.period,
      periodSection,
    ];

    for (const candidate of candidates) {
      const parsed = parseDeadlineText(candidate, fallbackYear);
      if (parsed) return parsed;
    }
    return null;
  }

  function hasClosedStatus(notice) {
    const status = String(notice?.recruitmentStatus || notice?.status || "").trim();
    return status.includes("마감") && !status.includes("임박");
  }

  function getNoticeSortState(notice, now) {
    const deadline = getNoticeDeadline(notice, now);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const deadlineTime = deadline?.getTime() ?? Number.POSITIVE_INFINITY;
    const closed = hasClosedStatus(notice) || (Number.isFinite(deadlineTime) && deadlineTime < today.getTime());
    const bucket = closed
      ? CLOSED_BUCKET
      : Number.isFinite(deadlineTime)
        ? ACTIVE_BUCKET
        : UNKNOWN_DEADLINE_BUCKET;
    const publishedDate = parseDeadlineText(notice?.publishedAt || notice?.date, now.getFullYear());

    return {
      bucket,
      deadlineTime,
      publishedTime: publishedDate?.getTime() ?? 0,
    };
  }

  function sortNoticesByDeadline(notices, options = {}) {
    const now = options.now ? new Date(options.now) : new Date();
    return notices
      .map((notice, index) => ({
        notice,
        index,
        state: getNoticeSortState(notice, now),
      }))
      .sort((left, right) => {
        if (left.state.bucket !== right.state.bucket) {
          return left.state.bucket - right.state.bucket;
        }
        if (left.state.bucket === ACTIVE_BUCKET) {
          const deadlineDifference = left.state.deadlineTime - right.state.deadlineTime;
          if (deadlineDifference !== 0) return deadlineDifference;
        }
        if (left.state.bucket === CLOSED_BUCKET) {
          const leftDeadline = Number.isFinite(left.state.deadlineTime) ? left.state.deadlineTime : 0;
          const rightDeadline = Number.isFinite(right.state.deadlineTime) ? right.state.deadlineTime : 0;
          if (leftDeadline !== rightDeadline) return rightDeadline - leftDeadline;
        }
        if (left.state.publishedTime !== right.state.publishedTime) {
          return right.state.publishedTime - left.state.publishedTime;
        }
        return left.index - right.index;
      })
      .map(({ notice }) => notice);
  }

  globalThis.KANGNAM_NOTICE_SORT = Object.freeze({
    getNoticeDeadline,
    sortNoticesByDeadline,
  });
})();
