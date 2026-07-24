"use strict";

const PUBLISHED_NOTICES_KEY = "kangnamPublishedNotices";
const DELETED_NOTICES_KEY = "kangnamDeletedNoticeIds";
const UNKNOWN_ELIGIBILITY = "공고 원문에서 확인 필요";

const DEFAULT_NOTICES = Object.freeze([
  {
    id: "neulpum-2026",
    title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집",
    category: "비교과 프로그램",
    department: "입학전형관리팀",
    date: "2026.07.20",
    status: "마감 임박",
    recruitmentStatus: "마감 임박",
    eligibleEnrollmentStatus: ["재학생"],
    eligibleGrades: "",
    transferStudentEligible: true,
    graduateEligible: null,
    sourceTitle: "입학처 공식 홍보대사 늘품 12기 2학기 수습 위원 모집 공고",
    sourcePrefix: "공식 공고 카드뉴스",
    sourceUrl: "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9",
    publishedAt: "2026.07.20",
    sourceType: "image",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "강남대학교 입학처 공식 홍보대사 늘품의 2026학년도 2학기 수습 임원을 모집합니다. 공식 카드뉴스 공고의 핵심 내용을 확인한 뒤 FAQ 또는 질문하기를 이용해 주세요.",
    facts: {
      period: "7월 20일(월)–8월 2일(일) 17:00",
      eligibility: "강남대학교 재학생 및 편입생",
      field: "기획국·대외홍보국·콘텐츠디자인국",
      documents: "지원서",
      operation: "2026학년도 2학기",
    },
    originalSections: [
      {
        id: "overview",
        title: "\uD504\uB85C\uADF8\uB7A8 \uAC1C\uC694",
        type: "paragraph",
        content: "\uAC15\uB0A8\uB300\uD559\uAD50 \uC785\uD559\uCC98 \uACF5\uC2DD \uD64D\uBCF4\uB300\uC0AC \uB298\uD488 12\uAE30 2\uD559\uAE30 \uC218\uC2B5 \uC784\uC6D0\uC744 \uBAA8\uC9D1\uD569\uB2C8\uB2E4.",
      },
      {
        id: "schedule",
        title: "\uBAA8\uC9D1 \uC77C\uC815",
        type: "list",
        items: ["\uC2E0\uCCAD \uAE30\uAC04: 7\uC6D4 20\uC77C(\uC6D4)\uBD80\uD130 8\uC6D4 2\uC77C(\uC77C) 17:00\uAE4C\uC9C0", "\uD65C\uB3D9 \uAE30\uAC04: 2026\uD559\uB144\uB3C4 2\uD559\uAE30"],
      },
      {
        id: "eligibility",
        title: "\uC9C0\uC6D0 \uB300\uC0C1",
        type: "paragraph",
        content: "\uAC15\uB0A8\uB300\uD559\uAD50 \uC7AC\uD559\uC0DD \uBC0F \uD3B8\uC785\uC0DD\uC774 \uC9C0\uC6D0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      },
      {
        id: "fields",
        title: "\uBAA8\uC9D1 \uBD84\uC57C",
        type: "list",
        items: ["\uAE30\uD68D\uAD6D", "\uB300\uC678\uD64D\uBCF4\uAD6D", "\uCF58\uD150\uCE20\uB514\uC790\uC778\uAD6D"],
      },
      {
        id: "notice",
        title: "\uC720\uC758 \uC0AC\uD56D",
        type: "notice",
        content: "\uC544\uB798 \uB0B4\uC6A9\uC740 \uB4F1\uB85D\uB41C \uC6D0\uBCF8 \uACF5\uACE0 \uB0B4\uC6A9\uC744 \uC77D\uAE30 \uC27D\uAC8C \uC815\uB9AC\uD574 \uD45C\uC2DC\uD55C \uC601\uC5ED\uC785\uB2C8\uB2E4. \uC815\uD655\uD55C \uB0B4\uC6A9\uC740 \uACF5\uC2DD \uC6D0\uBB38\uC744 \uD568\uAED8 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
      },
    ],
    faqs: [
      {
        id: "application-period",
        question: "서류 접수 기간은 언제인가요?",
        answer: "1차 서류 접수는 7월 20일(월)부터 8월 2일(일) 오후 5시까지입니다.",
        source: "모집 일정 > 1차 서류 접수",
      },
      {
        id: "eligibility",
        question: "지원 자격은 무엇인가요?",
        answer: "강남대학교 재학생 및 편입생이 지원할 수 있습니다. 2026년 8월부터 한 학기 이상 연속 활동이 가능해야 합니다.",
        source: "지원 자격",
      },
      {
        id: "recruitment-fields",
        question: "어떤 분야를 모집하나요?",
        answer: "기획국 1명, 대외홍보국 2명, 콘텐츠디자인국 2명을 모집합니다. 콘텐츠디자인국은 영상 편집 가능자를 우대합니다.",
        source: "모집 분야 및 인원",
      },
    ],
  },
  {
    id: "internet-counselor-2026",
    title: "[한국지능정보사회진흥원] 2026년도 제12회 인터넷중독전문상담사 자격검정 시행",
    category: "취업",
    department: "학생지원 관련 부서",
    date: "2026.07.20",
    status: "안내",
    recruitmentStatus: "모집 예정",
    eligibleEnrollmentStatus: [],
    eligibleGrades: "",
    transferStudentEligible: null,
    graduateEligible: null,
    sourceTitle: "2026년도 제12회 인터넷중독전문상담사 자격검정 시행 공고",
    sourcePrefix: "공식 공고 원문",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.20",
    sourceType: "html",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "외부 기관 자격검정 시행 안내 공고입니다. 신청 기간, 응시 자격, 접수 방법은 공식 공고 원문에서 확인해야 합니다.",
    facts: {
      period: "공식 공고 원문 확인",
      eligibility: "자격검정 응시 희망자",
      field: "인터넷중독전문상담사",
      documents: "공식 공고 원문 확인",
      operation: "공식 공고 원문 확인",
    },
    faqs: [
      { id: "period", question: "신청 기간은 어디서 확인하나요?", answer: "정확한 신청 기간은 공식 공고 원문에서 확인해야 합니다.", source: "공식 공고 원문" },
      { id: "eligibility", question: "누가 신청할 수 있나요?", answer: "응시 자격은 자격검정 시행 안내의 지원 자격 항목을 확인해 주세요.", source: "응시 자격" },
      { id: "contact", question: "문의는 어디로 하나요?", answer: "공식 공고에 안내된 담당 기관 또는 담당 부서로 문의해 주세요.", source: "문의처" },
    ],
  },
  {
    id: "jazz-concert-2026",
    title: "[수원시립미술관] 7월 문화가 있는 날 재즈 콘서트 개최",
    category: "행사",
    department: "학생지원 관련 부서",
    date: "2026.07.16",
    status: "안내",
    recruitmentStatus: "마감",
    eligibleEnrollmentStatus: [],
    eligibleGrades: "",
    transferStudentEligible: null,
    graduateEligible: null,
    sourceTitle: "7월 문화가 있는 날 재즈 콘서트 개최 공고",
    sourcePrefix: "공식 공고 원문",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.16",
    sourceType: "html",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "외부 문화 행사 참여 안내 공고입니다. 일정, 장소, 참여 방법은 공식 공고 원문을 기준으로 확인해야 합니다.",
    facts: {
      period: "7월 문화가 있는 날",
      eligibility: "관심 있는 학생",
      field: "재즈 콘서트",
      documents: "해당 없음 또는 공식 공고 원문 확인",
      operation: "공식 공고 원문 확인",
    },
    faqs: [
      { id: "schedule", question: "행사 일정은 언제인가요?", answer: "공고 제목상 7월 문화가 있는 날 행사이며, 정확한 시간은 공식 공고 원문에서 확인해야 합니다.", source: "행사 일정" },
      { id: "method", question: "참여 방법은 무엇인가요?", answer: "참여 또는 예매 방법은 공식 공고 원문에 안내된 절차를 확인해 주세요.", source: "참여 방법" },
      { id: "contact", question: "문의는 어디로 하나요?", answer: "공식 공고의 문의처 또는 주관 기관 안내를 확인해 주세요.", source: "문의처" },
    ],
  },
  {
    id: "student-support-program-2026",
    title: "2026학년도 대학생활 지원 비교과 프로그램 참여 안내",
    category: "비교과 프로그램",
    department: "학생지원 관련 부서",
    date: "2026.07.15",
    status: "모집 중",
    recruitmentStatus: "모집 중",
    eligibleEnrollmentStatus: ["재학생"],
    eligibleGrades: "",
    transferStudentEligible: null,
    graduateEligible: null,
    sourceTitle: "2026학년도 대학생활 지원 비교과 프로그램 참여 안내 공고",
    sourcePrefix: "공식 공고 원문",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.15",
    sourceType: "html",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "대학생활 적응과 역량 강화를 돕는 비교과 프로그램 참여 안내 공고입니다. 신청 기간과 참여 방법은 공식 공고 원문 기준으로 확인해야 합니다.",
    facts: {
      period: "공식 공고 원문 확인",
      eligibility: "강남대학교 재학생",
      field: "대학생활 지원 비교과 프로그램",
      documents: "공식 공고 원문 확인",
      operation: "공식 공고 원문 확인",
    },
    faqs: [
      { id: "period", question: "신청 기간은 언제인가요?", answer: "정확한 신청 기간은 공식 공고 원문에서 확인해야 합니다.", source: "신청 기간" },
      { id: "eligibility", question: "누가 참여할 수 있나요?", answer: "강남대학교 재학생 대상 프로그램으로 안내됩니다. 세부 제한은 공식 공고 원문을 확인해 주세요.", source: "참여 대상" },
      { id: "method", question: "신청 방법은 무엇인가요?", answer: "공식 공고 원문에 안내된 신청 경로를 확인해 주세요.", source: "신청 방법" },
    ],
  },
]);

const SOURCE_TYPE_LABELS = Object.freeze({
  image: "이미지",
  pdf: "PDF",
  html: "HTML",
  mock: "공고 정보",
});

const DEFAULT_NOTICE_BY_ID = new Map(DEFAULT_NOTICES.map((notice) => [notice.id, notice]));
const NOTICE_FALLBACK_FIELDS = Object.freeze([
  "sourceTitle",
  "sourcePrefix",
  "sourceUrl",
  "publishedAt",
  "sourceType",
  "imageUrls",
  "sourceImageUrl",
  "originalContent",
  "originalSections",
  "dataMethod",
  "reviewed",
  "reviewedAt",
]);

function isBlankNoticeValue(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === "object") return Object.keys(value).length === 0;
  return value === undefined || value === null || String(value).trim() === "";
}

function isOfficialNoticeUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    const path = parsed.pathname.toLowerCase();
    const boardSeq = parsed.searchParams.get("encMenuBoardSeq") || "";
    if (parsed.protocol !== "https:" || parsed.hostname !== "web.kangnam.ac.kr") return false;
    if (/^schoolnotice\d+$/i.test(boardSeq)) return false;
    if (path.includes("/mock/") || path.includes("/common/")) return false;
    return !/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(path);
  } catch {
    return false;
  }
}

function shouldUseNoticeFallback(field, value) {
  if (field === "sourceUrl") return !isOfficialNoticeUrl(value);
  return isBlankNoticeValue(value);
}

function applyDefaultNoticeFallback(notice) {
  const fallback = DEFAULT_NOTICE_BY_ID.get(notice?.id);
  if (!fallback) return notice;

  const merged = { ...fallback, ...notice };
  NOTICE_FALLBACK_FIELDS.forEach((field) => {
    if (shouldUseNoticeFallback(field, merged[field]) && !isBlankNoticeValue(fallback[field])) {
      merged[field] = fallback[field];
    }
  });
  if (fallback.facts || notice.facts) {
    merged.facts = { ...(fallback.facts || {}), ...(notice.facts || {}) };
  }
  if ((!Array.isArray(merged.faqs) || merged.faqs.length === 0) && Array.isArray(fallback.faqs)) {
    merged.faqs = fallback.faqs;
  }
  return merged;
}

let notices = getPublishedNotices();
let activeNotice = getInitialNotice();
let FAQS = activeNotice.faqs;
let answerRequestId = 0;

const elements = {
  faqList: document.querySelector("#faq-list"),
  questionForm: document.querySelector("#question-form"),
  questionInput: document.querySelector("#question-input"),
  questionCount: document.querySelector("#question-count"),
  questionError: document.querySelector("#question-error"),
  emptyResult: document.querySelector("#empty-result"),
  answerCard: document.querySelector("#answer-card"),
  answerState: document.querySelector("#answer-state"),
  askedQuestion: document.querySelector("#asked-question"),
  answerTitle: document.querySelector("#answer-title"),
  answerCopy: document.querySelector("#answer-copy"),
  evidenceCard: document.querySelector("#evidence-card"),
  answerSource: document.querySelector("#answer-source"),
  retryButton: document.querySelector("#retry-button"),
  departmentButton: document.querySelector("#department-button"),
  assistantView: document.querySelector("#assistant-view"),
  departmentView: document.querySelector("#department-view"),
  departmentBackButton: document.querySelector("#department-back-button"),
  departmentTitle: document.querySelector("#department-title"),
  notice: document.querySelector("#notice"),
  noticeList: document.querySelector("#notice-list"),
  noticeCountLabel: document.querySelector("#notice-count-label"),
  breadcrumbCategory: document.querySelector("#breadcrumb-category"),
  noticeMeta: document.querySelector("#notice-meta"),
  noticeTitle: document.querySelector("#notice-title"),
  heroSummary: document.querySelector(".hero-summary"),
  statusBadge: document.querySelector(".status-badge"),
  factPeriod: document.querySelector("#fact-period"),
  factEligibility: document.querySelector("#fact-eligibility"),
  factField: document.querySelector("#fact-field"),
  factDocuments: document.querySelector("#fact-documents"),
  factOperation: document.querySelector("#fact-operation"),
  factDepartment: document.querySelector("#fact-department"),
  eligibleCurrentStudent: document.querySelector("#eligible-current-student"),
  eligibleLeaveStudent: document.querySelector("#eligible-leave-student"),
  eligibleTransferStudent: document.querySelector("#eligible-transfer-student"),
  eligibleGraduate: document.querySelector("#eligible-graduate"),
  eligibleGrades: document.querySelector("#eligible-grades"),
  fullNoticeSummary: document.querySelector("#full-notice-summary"),
  fullNoticeToggle: document.querySelector("#full-notice-toggle"),
  fullNoticePanel: document.querySelector("#full-notice-panel"),
  fullNoticeText: document.querySelector("#full-notice-text"),
  fullNoticeDocumentTitle: document.querySelector("#full-notice-document-title"),
  fullSourceDepartment: document.querySelector("#full-source-department"),
  fullSourcePublishedAt: document.querySelector("#full-source-published-at"),
  fullSourceType: document.querySelector("#full-source-type"),
  fullSourceReviewed: document.querySelector("#full-source-reviewed"),
  fullPeriod: document.querySelector("#full-period"),
  fullEligibility: document.querySelector("#full-eligibility"),
  fullField: document.querySelector("#full-field"),
  fullDocuments: document.querySelector("#full-documents"),
  fullOperation: document.querySelector("#full-operation"),
  fullNoticeImageWrap: document.querySelector("#full-notice-image-wrap"),
  fullNoticeImageList: document.querySelector("#full-notice-image-list"),
  fullNoticeSourceLink: document.querySelector("#full-notice-source-link"),
  sourceLineText: document.querySelector("#source-line-text"),
  sourceTitle: document.querySelector("#source-title"),
  sourceDepartment: document.querySelector("#source-department"),
  sourceContactDepartment: document.querySelector("#source-contact-department"),
  sourcePublishedAt: document.querySelector("#source-published-at"),
  sourceType: document.querySelector("#source-type"),
  dataMethod: document.querySelector("#data-method"),
  reviewStatusText: document.querySelector("#review-status-text"),
  reviewedAt: document.querySelector("#reviewed-at"),
  mockSourceNote: document.querySelector("#mock-source-note"),
  sourceOriginalLink: document.querySelector("#source-original-link"),
  answerSourceLink: document.querySelector("#answer-source-link"),
  departmentSourceLink: document.querySelector(".department-source-link"),
  departmentDescription: document.querySelector(".department-description"),
  contactNote: document.querySelector(".contact-note"),
};

function createElement(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createArrowIcon() {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const path = document.createElementNS(namespace, "path");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", "0 0 24 24");
  path.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
  svg.append(path);
  return svg;
}

function getPublishedNotices() {
  let stored = [];
  let deletedIds = new Set();
  try {
    stored = JSON.parse(window.localStorage.getItem(PUBLISHED_NOTICES_KEY) || "[]");
  } catch {
    stored = [];
  }
  try {
    deletedIds = new Set(JSON.parse(window.localStorage.getItem(DELETED_NOTICES_KEY) || "[]"));
  } catch {
    deletedIds = new Set();
  }

  const firestoreIsAuthoritative = window.localStorage.getItem("kangnamFirestoreAuthoritativeV2") === "true";
  const merged = firestoreIsAuthoritative ? stored : [...stored, ...DEFAULT_NOTICES];
  return merged
    .map(applyDefaultNoticeFallback)
    .filter((notice, index, list) => list.findIndex((item) => item.id === notice.id) === index)
    .filter((notice) => !deletedIds.has(notice.id))
    .filter((notice) => (notice.approvalStatus || "published") === "published");
}

function getInitialNotice() {
  const selectedId = new URLSearchParams(window.location.search).get("notice");
  return notices.find((notice) => notice.id === selectedId) || notices[0];
}

function formatNoticeDate(value, fallback = "확인 필요") {
  if (!value) return fallback;
  if (typeof value === "number") {
    return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");
  }
  return value;
}

function getSourceTypeLabel(sourceType) {
  return SOURCE_TYPE_LABELS[sourceType] || "확인 필요";
}

function getFact(notice, key) {
  return notice.facts?.[key] || "확인 필요";
}

function getEnrollmentStatuses(notice) {
  return Array.isArray(notice.eligibleEnrollmentStatus) ? notice.eligibleEnrollmentStatus : [];
}

function formatEligibilityFlag(value) {
  if (value === true) return "가능";
  if (value === false) return "불가";
  return UNKNOWN_ELIGIBILITY;
}

function formatEnrollmentStatus(notice, status) {
  const statuses = getEnrollmentStatuses(notice);
  if (statuses.includes(status)) return "가능";
  if (statuses.length > 0) return "불가";
  return UNKNOWN_ELIGIBILITY;
}

function renderEligibilityTargets() {
  elements.eligibleCurrentStudent.textContent = formatEnrollmentStatus(activeNotice, "재학생");
  elements.eligibleLeaveStudent.textContent = formatEnrollmentStatus(activeNotice, "휴학생");
  elements.eligibleTransferStudent.textContent = formatEligibilityFlag(activeNotice.transferStudentEligible);
  elements.eligibleGraduate.textContent = formatEligibilityFlag(activeNotice.graduateEligible);
  elements.eligibleGrades.textContent = activeNotice.eligibleGrades || UNKNOWN_ELIGIBILITY;
}

function getOfficialSourceUrl(notice) {
  const sourceUrl = String(notice?.sourceUrl || "").trim();
  if (!sourceUrl) return "";

  try {
    const parsed = new URL(sourceUrl);
    const path = parsed.pathname.toLowerCase();
    const boardSeq = parsed.searchParams.get("encMenuBoardSeq") || "";
    if (parsed.protocol !== "https:" || parsed.hostname !== "web.kangnam.ac.kr") return "";
    if (/^schoolnotice\d+$/i.test(boardSeq)) return "";
    if (path.includes("/mock/") || path.includes("/common/")) return "";
    if (/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(path)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function hasSourceUrl(notice) {
  return Boolean(getOfficialSourceUrl(notice));
}

function setSourceLink(link, url) {
  if (!link) return;
  const visible = Boolean(url && String(url).trim());
  link.hidden = !visible;
  if (visible) {
    link.href = url;
  } else {
    link.removeAttribute("href");
  }
}

function getSourceImageUrls(notice) {
  const imageUrls = [
    ...(Array.isArray(notice.imageUrls) ? notice.imageUrls : []),
    ...(Array.isArray(notice.images) ? notice.images : []),
    notice.sourceImageUrl || "",
    notice.imageUrl || "",
  ];
  return [...new Set(imageUrls.filter(isNoticeContentImageUrl))];
}

function isNoticeContentImageUrl(url) {
  const normalized = String(url || "").toLowerCase();
  if (!normalized) return false;
  const blocked = [
    "logo",
    "sns",
    "icon",
    "btn_",
    "header",
    "footer",
    "common/",
    "/common",
    "site",
    "symbol",
    "emblem",
    "kangnam_university",
    "kangnamuniversity",
  ];
  if (blocked.some((word) => normalized.includes(word))) return false;

  try {
    const parsed = new URL(url);
    const file = parsed.pathname.split("/").pop() || "";
    return !/^(logo|sns|icon|btn|symbol|emblem)[._-]/i.test(file);
  } catch {
    return false;
  }
}

function createSourceImageFigure(imageUrl, index) {
  const figure = document.createElement("figure");
  const link = document.createElement("a");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  const fallback = document.createElement("p");

  figure.className = "source-image-figure";
  link.className = "source-image-link";
  link.href = imageUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `\uC6D0\uBB38 \uC774\uBBF8\uC9C0 ${index + 1} \uC0C8 \uD0ED\uC5D0\uC11C \uBCF4\uAE30`);
  image.src = imageUrl;
  image.alt = `${activeNotice.sourceTitle || activeNotice.title} \uC6D0\uBB38 \uC774\uBBF8\uC9C0 ${index + 1}`;
  image.loading = "lazy";
  caption.textContent = `\uC6D0\uBB38 \uC774\uBBF8\uC9C0 ${index + 1} - \uC120\uD0DD\uD558\uBA74 \uC0C8 \uD0ED\uC5D0\uC11C \uC6D0\uBCF8\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
  fallback.className = "image-fallback";
  fallback.hidden = true;
  fallback.textContent = "\uC6D0\uBB38 \uC774\uBBF8\uC9C0\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uACF5\uC2DD \uC6D0\uBB38 \uB9C1\uD06C\uC5D0\uC11C \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
  image.addEventListener("error", () => {
    link.hidden = true;
    fallback.hidden = false;
  });
  image.addEventListener("load", () => {
    link.hidden = false;
    fallback.hidden = true;
  });
  link.append(image);
  figure.append(link, caption, fallback);
  return figure;
}

function renderSourceImages(notice) {
  const imageUrls = getSourceImageUrls(notice);
  elements.fullNoticeImageWrap.hidden = imageUrls.length === 0;
  elements.fullNoticeImageList.replaceChildren(...imageUrls.map(createSourceImageFigure));
}

function normalizeOriginalText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isOrderedLine(line) {
  return /^\s*(?:\d+[\.)]|[\uAC00-\uD7A3][\.)])\s+/.test(line);
}

function isBulletLine(line) {
  return /^\s*(?:[-*\u2022\u318D]|[\u25CB\u25E6\u25AA\u25AB])\s*/.test(line);
}

function cleanListMarker(line) {
  return line.replace(/^\s*(?:\d+[\.)]|[\uAC00-\uD7A3][\.)]|[-*\u2022\u318D\u25CB\u25E6\u25AA\u25AB])\s*/, "").trim();
}

function createNoticeParagraph(text) {
  return createElement("p", "full-notice-paragraph", text);
}

function createNoticeList(items, ordered = false) {
  const list = document.createElement(ordered ? "ol" : "ul");
  list.className = "full-notice-list";
  list.replaceChildren(...items.map((item) => createElement("li", "", item)));
  return list;
}

function createNoticeCallout(text) {
  const note = createElement("p", "full-notice-callout", text);
  note.setAttribute("role", "note");
  return note;
}

function createNoticeTable(section) {
  const wrap = createElement("div", "full-notice-table-wrap");
  const table = document.createElement("table");
  const rows = Array.isArray(section.rows) ? section.rows : [];
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    (Array.isArray(row) ? row : []).forEach((cell, index) => {
      const tag = index === 0 ? "th" : "td";
      const node = createElement(tag, "", String(cell || ""));
      if (tag === "th") node.scope = "row";
      tr.append(node);
    });
    table.append(tr);
  });
  if (!rows.length && Array.isArray(section.items)) {
    section.items.forEach((item) => {
      const tr = document.createElement("tr");
      tr.append(createElement("td", "", item));
      table.append(tr);
    });
  }
  wrap.append(table);
  return wrap;
}

function renderTextBlocks(text) {
  const lines = normalizeOriginalText(text).split("\n");
  const nodes = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (isBulletLine(line) || isOrderedLine(line)) {
      const ordered = isOrderedLine(line);
      const items = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current || (ordered ? !isOrderedLine(current) : !isBulletLine(current))) break;
        items.push(cleanListMarker(current));
        index += 1;
      }
      nodes.push(createNoticeList(items, ordered));
      continue;
    }

    nodes.push(createNoticeParagraph(line));
    index += 1;
  }

  return nodes;
}

function createSectionNode(section, index) {
  const article = document.createElement("section");
  article.className = `full-notice-content-section ${section.type === "notice" ? "is-notice" : ""}`.trim();
  article.id = section.id || `full-notice-section-${index + 1}`;

  if (section.title) {
    article.append(createElement("h4", "", section.title));
  }

  if (section.type === "list") {
    article.append(createNoticeList(Array.isArray(section.items) ? section.items : [], false));
  } else if (section.type === "notice") {
    article.append(createNoticeCallout(section.content || (Array.isArray(section.items) ? section.items.join("\n") : "")));
  } else if (section.type === "table") {
    article.append(createNoticeTable(section));
  } else {
    article.append(...renderTextBlocks(section.content || ""));
  }

  return article;
}

function getOriginalSections(notice) {
  return Array.isArray(notice.originalSections)
    ? notice.originalSections.filter((section) => section && typeof section === "object")
    : [];
}

function renderFullNoticeContent(notice) {
  try {
    const sections = getOriginalSections(notice);
    const content = normalizeOriginalText(notice.originalContent);
    const nodes = sections.length
      ? sections.map(createSectionNode)
      : content
        ? renderTextBlocks(content)
        : [createNoticeCallout("\uB4F1\uB85D\uB41C \uC804\uCCB4 \uACF5\uACE0 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uACF5\uC2DD \uC6D0\uBB38\uC5D0\uC11C \uC138\uBD80 \uB0B4\uC6A9\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.")];
    elements.fullNoticeText.replaceChildren(...nodes);
  } catch (error) {
    console.error("full notice render failed", error);
    elements.fullNoticeText.replaceChildren(createNoticeCallout("\uC804\uCCB4 \uACF5\uACE0 \uB0B4\uC6A9\uC744 \uD45C\uC2DC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uACF5\uC2DD \uC6D0\uBB38\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694."));
  }
}

function createChevronIcon(expanded) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const path = document.createElementNS(namespace, "path");
  svg.setAttribute("class", "toggle-icon");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", "0 0 24 24");
  path.setAttribute("d", expanded ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6");
  svg.append(path);
  return svg;
}

function setFullNoticeExpanded(expanded) {
  if (!elements.fullNoticeToggle || !elements.fullNoticePanel) return;
  const label = expanded ? "\uC804\uCCB4 \uACF5\uACE0 \uB0B4\uC6A9 \uB2EB\uAE30" : "\uC804\uCCB4 \uACF5\uACE0 \uB0B4\uC6A9 \uBCF4\uAE30";
  elements.fullNoticePanel.hidden = !expanded;
  elements.fullNoticeToggle.setAttribute("aria-expanded", String(expanded));
  elements.fullNoticeToggle.replaceChildren(createElement("span", "", label), createChevronIcon(expanded));
}

function renderNoticeList() {
  if (!elements.noticeList) return;

  elements.noticeCountLabel.textContent = `${notices.length}개`;
  elements.noticeList.replaceChildren(
    ...notices.map((notice) => {
      const link = document.createElement("a");
      link.className = "notice-list-item";
      link.href = `./notice.html?notice=${encodeURIComponent(notice.id)}`;
      if (notice.id === activeNotice.id) link.setAttribute("aria-current", "true");
      link.append(
        createElement("span", "", notice.category),
        createElement("strong", "", notice.title),
        createElement("small", "", `${notice.department} · ${notice.date}`),
      );
      return link;
    }),
  );
}

function selectNotice(noticeId) {
  const nextNotice = notices.find((notice) => notice.id === noticeId);
  if (!nextNotice) return;

  activeNotice = nextNotice;
  FAQS = activeNotice.faqs;
  window.history.replaceState({}, "", `./notice.html?notice=${encodeURIComponent(activeNotice.id)}`);
  renderNotice();
  renderNoticeList();
  renderFaqs();
  resetQuestion();
  setFullNoticeExpanded(false);
  elements.notice.focus({ preventScroll: true });
  elements.notice.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderNotice() {
  const sourceUrl = getOfficialSourceUrl(activeNotice);
  const sourceType = activeNotice.sourceType || (sourceUrl ? "html" : "mock");
  const dataMethod = activeNotice.dataMethod || (sourceType === "mock" ? "공고 정보 기반" : "실제 공고 기반 재구성");
  const reviewed = activeNotice.reviewed === true;
  const period = getFact(activeNotice, "period");
  const eligibility = getFact(activeNotice, "eligibility");
  const field = getFact(activeNotice, "field");
  const documents = getFact(activeNotice, "documents");
  const operation = getFact(activeNotice, "operation");
  const department = activeNotice.department || "확인 필요";
  document.title = `강남대 공고 길잡이 — ${activeNotice.title}`;
  elements.breadcrumbCategory.textContent = activeNotice.category;
  elements.noticeMeta.textContent = `${department} · ${activeNotice.category} · ${formatNoticeDate(activeNotice.publishedAt || activeNotice.date)}`;
  elements.noticeTitle.textContent = activeNotice.title;
  elements.heroSummary.textContent = activeNotice.summary;
  elements.statusBadge.lastChild.textContent = ` ${activeNotice.status}`;
  elements.statusBadge.dataset.status = activeNotice.recruitmentStatus || activeNotice.status;
  elements.factPeriod.textContent = period;
  elements.factEligibility.textContent = eligibility;
  elements.factField.textContent = field;
  elements.factDocuments.textContent = documents;
  elements.factOperation.textContent = operation;
  elements.factDepartment.textContent = department;
  renderEligibilityTargets();
  elements.fullNoticeSummary.textContent = "아래 내용은 등록된 원본 공고 내용을 읽기 쉽게 정리해 표시한 영역입니다. 정확한 내용은 공식 원문을 함께 확인해 주세요.";
  elements.fullNoticeDocumentTitle.textContent = activeNotice.sourceTitle || activeNotice.title;
  elements.fullSourceDepartment.textContent = department;
  elements.fullSourcePublishedAt.textContent = formatNoticeDate(activeNotice.publishedAt || activeNotice.date, "");
  elements.fullSourceType.textContent = getSourceTypeLabel(sourceType);
  elements.fullSourceReviewed.textContent = reviewed ? "검수 완료" : "검수 필요";
  renderFullNoticeContent(activeNotice);
  elements.fullPeriod.textContent = period;
  elements.fullEligibility.textContent = eligibility;
  elements.fullField.textContent = field;
  elements.fullDocuments.textContent = documents;
  elements.fullOperation.textContent = operation;
  setSourceLink(elements.fullNoticeSourceLink, sourceUrl);
  renderSourceImages(activeNotice);
  elements.sourceLineText.textContent = activeNotice.isPublished
    ? "관리자가 검수 후 공개한 공고 초안입니다. 세부 내용은 공식 공고 원문과 함께 확인해 주세요."
    : "공식 공고 내용을 확인해 작성한 답변입니다.";
  elements.sourceTitle.textContent = activeNotice.sourceTitle || activeNotice.title;
  elements.sourceDepartment.textContent = department;
  elements.sourceContactDepartment.textContent = department;
  elements.sourcePublishedAt.textContent = formatNoticeDate(activeNotice.publishedAt || activeNotice.date);
  elements.sourceType.textContent = getSourceTypeLabel(sourceType);
  elements.dataMethod.textContent = dataMethod;
  elements.reviewStatusText.textContent = reviewed ? "검수 완료" : "검수 전";
  elements.reviewedAt.textContent = reviewed ? formatNoticeDate(activeNotice.reviewedAt) : "검수 전";
  elements.mockSourceNote.hidden = true;
  setSourceLink(elements.sourceOriginalLink, sourceUrl);
  setSourceLink(elements.answerSourceLink, sourceUrl);
  setSourceLink(elements.departmentSourceLink, sourceUrl);
  elements.departmentTitle.textContent = `${department}으로 문의해 주세요`;
  elements.departmentDescription.textContent = "FAQ와 답변으로 해결되지 않은 문의를 담당합니다.";
  elements.contactNote.textContent = `문의 시 “${activeNotice.title}” 공고를 확인했다고 말씀해 주세요.`;
  setFullNoticeExpanded(false);
}

function renderFaqs() {
  const fragment = document.createDocumentFragment();

  FAQS.forEach((faq, index) => {
    const button = createElement("button", "faq-item");
    button.type = "button";
    button.dataset.faqId = faq.id;
    button.setAttribute("aria-label", `${faq.question} 답변 보기`);
    button.append(
      createElement("span", "", `0${index + 1}`),
      createElement("strong", "", faq.question),
      createArrowIcon(),
    );
    button.addEventListener("click", () => selectFaq(faq, button));
    fragment.append(button);
  });

  elements.faqList.replaceChildren(fragment);
}

function updateQuestionCount() {
  elements.questionCount.textContent = String(elements.questionInput.value.length);
}

function clearQuestionError() {
  elements.questionInput.removeAttribute("aria-invalid");
  elements.questionError.hidden = true;
  elements.questionError.textContent = "";
}

function setQuestionError(message) {
  elements.questionInput.setAttribute("aria-invalid", "true");
  elements.questionError.textContent = message;
  elements.questionError.hidden = false;
  elements.questionInput.focus();
}

function deactivateFaqs() {
  elements.faqList.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("active");
    item.removeAttribute("aria-current");
  });
}

function activateFaq(button) {
  deactivateFaqs();
  button.classList.add("active");
  button.setAttribute("aria-current", "true");
}

function showAnswer(question, result) {
  elements.emptyResult.hidden = true;
  elements.answerCard.hidden = false;
  elements.answerCard.classList.remove("no-result", "is-loading", "is-error");
  elements.answerCard.setAttribute("tabindex", "-1");
  elements.askedQuestion.textContent = question;
  elements.answerTitle.textContent = "답변";
  elements.answerCopy.textContent = result.answer;
  elements.answerSource.textContent = `${activeNotice.sourcePrefix} > ${result.source}`;
  setSourceLink(elements.answerSourceLink, getOfficialSourceUrl(activeNotice));
  elements.answerState.textContent = "답변 찾음";
  elements.evidenceCard.hidden = false;
  focusResultOnSmallScreen();
}

function showNoResult(question) {
  elements.emptyResult.hidden = true;
  elements.answerCard.hidden = false;
  elements.answerCard.classList.remove("is-loading", "is-error");
  elements.answerCard.classList.add("no-result");
  elements.answerCard.setAttribute("tabindex", "-1");
  elements.askedQuestion.textContent = question;
  elements.answerTitle.textContent = "검색 결과 없음";
  elements.answerCopy.textContent = "검색 결과가 없습니다. 담당 부서에 문의해주세요.";
  elements.answerSource.textContent = "";
  elements.answerState.textContent = "답변 없음";
  elements.evidenceCard.hidden = true;
  focusResultOnSmallScreen();
}

function showLoading(question) {
  elements.emptyResult.hidden = true;
  elements.answerCard.hidden = false;
  elements.answerCard.classList.remove("no-result", "is-error");
  elements.answerCard.classList.add("is-loading");
  elements.answerCard.setAttribute("tabindex", "-1");
  elements.askedQuestion.textContent = question;
  elements.answerTitle.textContent = "답변 생성 중";
  elements.answerCopy.textContent = "공고 내용을 확인하고 있습니다.";
  elements.answerSource.textContent = "";
  elements.answerState.textContent = "생성 중";
  elements.evidenceCard.hidden = true;
}

function showAnswerError(question) {
  elements.emptyResult.hidden = true;
  elements.answerCard.hidden = false;
  elements.answerCard.classList.remove("no-result", "is-loading");
  elements.answerCard.classList.add("is-error");
  elements.answerCard.setAttribute("tabindex", "-1");
  elements.askedQuestion.textContent = question;
  elements.answerTitle.textContent = "답변 생성 실패";
  elements.answerCopy.textContent = "답변을 생성하지 못했습니다. 잠시 후 다시 시도하거나 담당 부서에 문의해 주세요.";
  elements.answerSource.textContent = "";
  elements.answerState.textContent = "오류";
  elements.evidenceCard.hidden = true;
  focusResultOnSmallScreen();
}

function renderAnswerState(state, question, result = null) {
  if (state === "loading") showLoading(question);
  if (state === "success") showAnswer(question, result);
  if (state === "empty") showNoResult(question);
  if (state === "error") showAnswerError(question);
}

function focusResultOnSmallScreen() {
  if (window.innerWidth <= 920) {
    elements.answerCard.focus({ preventScroll: true });
    if (typeof elements.answerCard.scrollIntoView === "function") {
      elements.answerCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

function selectFaq(faq, button) {
  clearQuestionError();
  elements.questionInput.value = faq.question;
  updateQuestionCount();
  activateFaq(button);
  showAnswer(faq.question, faq);
}

async function requestGeneratedAnswer(question) {
  const answerService = window.KANGNAM_ANSWER_SERVICE;
  if (!answerService?.generateAnswer) {
    throw new Error("answer service is not available");
  }
  return answerService.generateAnswer(question, activeNotice);
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  const question = elements.questionInput.value.trim();
  const currentRequestId = answerRequestId + 1;
  answerRequestId = currentRequestId;

  clearQuestionError();
  deactivateFaqs();

  if (!question) {
    setQuestionError("질문을 입력해주세요.");
    return;
  }

  try {
    renderAnswerState("loading", question);
    const result = await requestGeneratedAnswer(question);
    if (currentRequestId !== answerRequestId) return;
    if (result?.status === "success") {
      renderAnswerState("success", question, result);
    } else {
      renderAnswerState("empty", question);
    }
  } catch (error) {
    console.error("답변 생성 실패", error);
    if (currentRequestId === answerRequestId) renderAnswerState("error", question);
  }
}

function resetQuestion() {
  elements.questionInput.value = "";
  updateQuestionCount();
  clearQuestionError();
  deactivateFaqs();
  elements.answerCard.hidden = true;
  elements.answerCard.classList.remove("no-result", "is-loading", "is-error");
  elements.emptyResult.hidden = false;
  elements.questionInput.focus();
}

function showDepartment() {
  elements.assistantView.hidden = true;
  elements.departmentView.hidden = false;
  elements.departmentTitle.setAttribute("tabindex", "-1");
  elements.departmentTitle.focus();
}

function returnToNotice() {
  elements.departmentView.hidden = true;
  elements.assistantView.hidden = false;
  resetQuestion();
  elements.notice.focus({ preventScroll: true });
  if (typeof elements.notice.scrollIntoView === "function") {
    elements.notice.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setDataSyncStatus(message, state = "info") {
  let status = document.querySelector("#data-sync-status");
  if (!status) {
    status = document.createElement("p");
    status.id = "data-sync-status";
    status.className = "data-sync-status";
    status.setAttribute("role", "status");
    document.querySelector("main")?.prepend(status);
  }
  status.dataset.state = state;
  status.textContent = message;
  status.hidden = !message;
}

async function hydratePublishedNotices() {
  const store = window.KANGNAM_NOTICE_STORE;
  if (!store?.loadPublishedNotices) return;

  try {
    const result = await store.loadPublishedNotices();
    if (!String(result.source || "").startsWith("firestore")) return;
    window.localStorage.setItem(PUBLISHED_NOTICES_KEY, JSON.stringify(result.notices));
    window.localStorage.setItem("kangnamFirestoreAuthoritativeV2", "true");
    const selectedId = new URLSearchParams(window.location.search).get("notice");
    notices = getPublishedNotices();
    activeNotice = notices.find((notice) => notice.id === selectedId)
      || notices.find((notice) => notice.id === activeNotice.id)
      || notices[0];
    FAQS = activeNotice.faqs || [];
    renderNotice();
    renderNoticeList();
    renderFaqs();
    setDataSyncStatus("공용 공고 데이터를 최신 상태로 불러왔습니다.", "success");
  } catch (error) {
    const message = store.getFriendlyError(error);
    const state = error?.code === "FREE_TIER_LIMIT" ? "limit" : "error";
    setDataSyncStatus(`${message} 저장된 공고를 대신 표시합니다.`, state);
  }
}

elements.questionForm.addEventListener("submit", handleQuestionSubmit);
elements.questionInput.addEventListener("input", () => {
  updateQuestionCount();
  if (!elements.questionError.hidden) clearQuestionError();
});
elements.retryButton.addEventListener("click", resetQuestion);
elements.departmentButton.addEventListener("click", showDepartment);
elements.departmentBackButton.addEventListener("click", returnToNotice);
function toggleFullNotice() {
  const expanded = elements.fullNoticeToggle.getAttribute("aria-expanded") === "true";
  setFullNoticeExpanded(!expanded);
}

elements.fullNoticeToggle.addEventListener("click", toggleFullNotice);
elements.fullNoticeToggle.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggleFullNotice();
});
renderNotice();
renderNoticeList();
renderFaqs();
updateQuestionCount();
hydratePublishedNotices();

const adminReview = {
  googleLoginButton: document.querySelector("#google-login-button"),
  logoutButton: document.querySelector("#logout-button"),
  authState: document.querySelector("#auth-state"),
  roleCards: [...document.querySelectorAll("[data-role-card]")],
  restrictedPanels: [...document.querySelectorAll("[data-requires-role]")],
  memberList: document.querySelector("#member-list"),
  memberForm: document.querySelector("#member-form"),
  memberEmail: document.querySelector("#member-email"),
  memberRole: document.querySelector("#member-role"),
  form: document.querySelector("#admin-ingest-form"),
  urlInput: document.querySelector("#official-notice-url"),
  generateButton: document.querySelector("#generate-draft-button"),
  status: document.querySelector("#review-status"),
  chip: document.querySelector("#draft-chip"),
  empty: document.querySelector("#draft-empty"),
  fields: document.querySelector("#draft-fields"),
  summary: document.querySelector("#draft-summary"),
  faq: document.querySelector("#draft-faq"),
  evidence: document.querySelector("#draft-evidence"),
  checkboxes: [...document.querySelectorAll(".approval-checkbox")],
  approveButton: document.querySelector("#approve-draft-button"),
  note: document.querySelector("#approval-note"),
};

const ROLE_LABELS = Object.freeze({
  owner: "관리자 관리 가능",
  editor: "수정 및 공개 가능",
  viewer: "학생 계정",
});

const ROLE_RANK = Object.freeze({
  viewer: 0,
  editor: 1,
  owner: 2,
});

let currentUser = null;
let currentRole = "viewer";
let currentAccountType = "guest";
let managedMembers = loadManagedMembers();

const CODEX_DRAFT = Object.freeze({
  summary:
    "강남대학교 입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집 공고입니다. 지원 대상은 재학생 및 편입생이며, 1차 서류 접수는 7월 20일부터 8월 2일 17시까지입니다.",
  faq:
    "Q. 편입생도 지원할 수 있나요?\nA. 가능합니다. 공고의 지원 자격에 재학생 및 편입생으로 안내되어 있습니다.\n\nQ. 어떤 분야를 모집하나요?\nA. 기획국, 대외홍보국, 콘텐츠디자인국을 모집합니다.\n\nQ. 신청 방법은 무엇인가요?\nA. 공식 공고에 안내된 QR 코드 또는 원문 링크의 신청 경로를 확인해야 합니다.",
  evidence:
    "근거 1. 모집 일정 > 1차 서류 접수\n근거 2. 지원 자격 > 재학생 및 편입생\n근거 3. 모집 분야 및 인원\n근거 4. 공고 등록 부서 및 문의처",
});

function setReviewStatus(text, state) {
  adminReview.status.textContent = text;
  adminReview.status.dataset.state = state;
}

function updateApprovalState() {
  const ready = adminReview.fields && !adminReview.fields.hidden;
  const checked = adminReview.checkboxes.every((checkbox) => checkbox.checked);
  adminReview.approveButton.disabled = !(ready && checked && can("editor"));
}

function handleDraftGeneration(event) {
  event.preventDefault();
  if (!can("editor")) {
    adminReview.note.textContent = "수정 및 공개 권한이 있는 계정으로 로그인해야 초안을 생성할 수 있습니다.";
    return;
  }
  setReviewStatus("Codex 분석 중", "working");
  adminReview.chip.textContent = "생성 중";
  adminReview.generateButton.disabled = true;
  adminReview.note.textContent = "공식 링크를 기준으로 학생용 FAQ 초안을 구성하고 있습니다.";

  window.setTimeout(() => {
    adminReview.empty.hidden = true;
    adminReview.fields.hidden = false;
    adminReview.summary.value = CODEX_DRAFT.summary;
    adminReview.faq.value = CODEX_DRAFT.faq;
    adminReview.evidence.value = CODEX_DRAFT.evidence;
    adminReview.chip.textContent = "검수 필요";
    setReviewStatus("관리자 검수 대기", "review");
    adminReview.generateButton.disabled = false;
    adminReview.note.textContent = "초안을 수정한 뒤 검수 항목을 모두 체크해 주세요.";
    updateApprovalState();
  }, 700);
}

function handleDraftApproval() {
  if (!can("editor")) return;
  setReviewStatus("공개 승인 완료", "approved");
  adminReview.chip.textContent = "승인됨";
  adminReview.note.textContent = "승인된 초안은 학생용 FAQ와 답변 근거로 공개되는 상태입니다.";
  adminReview.approveButton.disabled = true;
  adminReview.approveButton.textContent = "승인 완료";
}

function can(requiredRole) {
  return ROLE_RANK[currentRole] >= ROLE_RANK[requiredRole];
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function loadManagedMembers() {
  try {
    return JSON.parse(window.localStorage.getItem("kangnamManagedMembers") || "[]");
  } catch {
    return [];
  }
}

function saveManagedMembers() {
  window.localStorage.setItem("kangnamManagedMembers", JSON.stringify(managedMembers));
}

function resolveRole(email) {
  if (!email) return "viewer";
  const normalized = normalizeEmail(email);
  const firebase = window.KANGNAM_FIREBASE;
  const roleLists = firebase?.roleLists ?? { owners: [], editors: [] };
  const managed = managedMembers.find((member) => normalizeEmail(member.email) === normalized);

  if (managed) return managed.role;
  if (roleLists.owners.includes(normalized)) return "owner";
  if (roleLists.editors.includes(normalized)) return "editor";
  return "viewer";
}

function renderMembers() {
  if (!adminReview.memberList) return;

  const firebase = window.KANGNAM_FIREBASE;
  const seededOwners = firebase?.roleLists?.owners ?? [];
  const seededEditors = firebase?.roleLists?.editors ?? [];
  const seeded = [
    ...seededOwners.map((email) => ({ email, role: "owner", source: "env" })),
    ...seededEditors.map((email) => ({ email, role: "editor", source: "env" })),
  ];
  const members = [...seeded, ...managedMembers];

  if (members.length === 0) {
    adminReview.memberList.innerHTML = "<p class=\"member-empty\">등록된 관리자 계정이 없습니다.</p>";
    return;
  }

  adminReview.memberList.replaceChildren(
    ...members.map((member) => {
      const row = document.createElement("div");
      const email = document.createElement("strong");
      const role = document.createElement("span");
      const source = document.createElement("small");
      email.textContent = member.email;
      role.textContent = ROLE_LABELS[member.role] || ROLE_LABELS.viewer;
      source.textContent = member.source === "env" ? "env 고정" : "브라우저 저장";
      row.append(email, role, source);
      return row;
    }),
  );
}

function renderAuthState() {
  const title = adminReview.authState?.querySelector("strong");
  const subtitle = adminReview.authState?.querySelector("span");

  if (!title || !subtitle) return;

  if (!currentUser) {
    title.textContent = "로그아웃 상태";
    subtitle.textContent = "로그인하지 않아도 공개된 공고와 FAQ를 볼 수 있습니다.";
  } else {
    title.textContent = currentAccountType === "admin"
      ? `관리자 계정 · ${ROLE_LABELS[currentRole]}`
      : "학생 계정으로 로그인됨";
    subtitle.textContent = currentRole === "owner"
      ? "관리자 관리, 초안 수정, 학생 공개를 모두 사용할 수 있습니다."
      : currentRole === "editor"
        ? "초안 수정과 학생 공개를 사용할 수 있습니다."
        : "공개된 공고와 FAQ를 학생 권한으로 이용합니다.";
  }

  if (adminReview.logoutButton) adminReview.logoutButton.disabled = !currentUser;
}

function updateRoleAccess() {
  adminReview.roleCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.roleCard === currentRole);
  });

  adminReview.restrictedPanels.forEach((panel) => {
    const required = panel.dataset.requiresRole;
    const allowed = can(required);
    panel.classList.toggle("locked", !allowed);
    panel.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !allowed;
    });
  });

  renderAuthState();
  renderMembers();
  updateApprovalState();
}

function setAuthMessage(message) {
  const subtitle = adminReview.authState?.querySelector("span");
  if (subtitle) subtitle.textContent = message;
}

async function handleLogout() {
  const firebase = window.KANGNAM_FIREBASE;
  if (firebase) await firebase.signOut();
}

function handleMemberSubmit(event) {
  event.preventDefault();
  if (!can("owner")) return;

  const email = normalizeEmail(adminReview.memberEmail.value);
  const role = adminReview.memberRole.value;
  if (!email) return;

  managedMembers = managedMembers.filter((member) => normalizeEmail(member.email) !== email);
  managedMembers.push({ email, role });
  saveManagedMembers();
  adminReview.memberEmail.value = "";
  renderMembers();
}

function initAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setAuthMessage("Firebase Auth 설정을 기다리는 중입니다.");
    updateRoleAccess();
    return;
  }

  let authUpdateId = 0;
  firebase.onAuthStateChanged(firebase.auth, async (user) => {
    const updateId = ++authUpdateId;
    currentUser = user;
    if (!user) {
      currentRole = "viewer";
      currentAccountType = "guest";
      updateRoleAccess();
      return;
    }

    const account = await (window.KANGNAM_ACCOUNT_ACCESS?.resolveAccount(user)
      || Promise.resolve({ type: "student", role: "viewer", isAdmin: false }));
    if (updateId !== authUpdateId) return;
    currentRole = account.isAdmin ? account.role : "viewer";
    currentAccountType = account.isAdmin ? "admin" : "student";
    updateRoleAccess();
  });
}

if (adminReview.form) {
  adminReview.logoutButton.addEventListener("click", handleLogout);
  adminReview.memberForm.addEventListener("submit", handleMemberSubmit);
  adminReview.form.addEventListener("submit", handleDraftGeneration);
  adminReview.checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateApprovalState));
  adminReview.approveButton.addEventListener("click", handleDraftApproval);
  window.addEventListener("kangnam-firebase-ready", initAuth, { once: true });
  initAuth();
}
