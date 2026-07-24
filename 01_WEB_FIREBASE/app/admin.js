"use strict";

const ROLE_LABELS = Object.freeze({
  owner: "관리자 관리, 수정 및 공개 가능",
  editor: "수정 및 공개 가능",
  viewer: "보기만 가능",
});

const READER_ENDPOINT = "https://r.jina.ai/";
const MAX_NOTICE_CHARS = 9000;
const PUBLISHED_NOTICES_KEY = "kangnamPublishedNotices";
const DELETED_NOTICES_KEY = "kangnamDeletedNoticeIds";
const SCHOOL_NOTICE_MOCK_URL = "./school-notices.mock.json";
const PLACEHOLDER_BOARD_SEQ_PATTERN = /^schoolnotice\d+$/i;
const RECRUITMENT_STATUSES = Object.freeze(["모집 예정", "모집 중", "마감 임박", "마감"]);
const UNKNOWN_ELIGIBILITY = "공고 원문에서 확인 필요";
const LEGACY_DEFAULT_NOTICE_URL =
  "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9";
const OFFICIAL_NOTICE_SOURCE_ERROR = "공식 원문 출처 URL이 확인되지 않아 저장할 수 없습니다. 학교 홈페이지의 공고 상세 URL을 다시 선택하거나 입력해 주세요.";

const ADMIN_DEFAULT_NOTICES = Object.freeze([
  {
    id: "neulpum-2026",
    title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 위원 모집",
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
    sourceUrl: LEGACY_DEFAULT_NOTICE_URL,
    publishedAt: "2026.07.20",
    sourceType: "image",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "입학처 공식 홍보대사 늘품 수습 위원 모집 공고입니다. 공식 원문과 관리자 검수 내용을 함께 확인하세요.",
    facts: {
      period: "7월 20일 ~ 8월 2일 17:00",
      eligibility: "강남대학교 재학생 및 편입생",
      field: "기획국, 대외홍보국, 콘텐츠디자인국",
      documents: "지원서",
      operation: "2026학년도 2학기",
    },
    faqs: [
      { id: "period", question: "신청 기간은 언제인가요?", answer: "7월 20일부터 8월 2일 17:00까지입니다.", source: "모집 일정" },
      { id: "eligibility", question: "누가 신청할 수 있나요?", answer: "강남대학교 재학생 및 편입생이 지원할 수 있습니다.", source: "지원 자격" },
    ],
  },
  {
    id: "internet-counselor-2026",
    title: "2026년도 제2회 인터넷중독전문상담사 자격검정 시행",
    category: "취업",
    department: "학생지원 관련 부서",
    date: "2026.07.20",
    status: "안내",
    recruitmentStatus: "모집 예정",
    eligibleEnrollmentStatus: [],
    eligibleGrades: "",
    transferStudentEligible: null,
    graduateEligible: null,
    sourceTitle: "2026년도 제2회 인터넷중독전문상담사 자격검정 시행 공고",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.20",
    sourceType: "html",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "인터넷중독전문상담사 자격검정 시행 안내 공고입니다. 세부 일정과 자격은 공식 공고 원문을 확인하세요.",
    facts: {
      period: "공식 공고 원문 확인",
      eligibility: "자격검정 응시 요건 확인",
      field: "인터넷중독전문상담사",
      documents: "공식 공고 원문 확인",
      operation: "공식 공고 원문 확인",
    },
    faqs: [
      { id: "period", question: "신청 기간은 어디서 확인하나요?", answer: "정확한 신청 기간은 공식 공고 원문에서 확인해야 합니다.", source: "공식 공고 원문" },
    ],
  },
  {
    id: "jazz-concert-2026",
    title: "7월 문화가 있는 날 재즈 콘서트 개최",
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
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.16",
    sourceType: "html",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "문화 행사 참여 안내 공고입니다. 일정, 장소, 참여 방법은 공식 공고 원문 기준으로 확인하세요.",
    facts: {
      period: "7월 문화가 있는 날",
      eligibility: "관심 있는 학생",
      field: "재즈 콘서트",
      documents: "해당 없음 또는 공식 공고 원문 확인",
      operation: "공식 공고 원문 확인",
    },
    faqs: [
      { id: "schedule", question: "행사 일정은 언제인가요?", answer: "공식 공고 원문에서 정확한 일정을 확인하세요.", source: "행사 일정" },
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
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.15",
    sourceType: "html",
    imageUrls: [],
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
    summary: "대학생활 적응과 역량 강화를 돕는 비교과 프로그램 참여 안내 공고입니다.",
    facts: {
      period: "공식 공고 원문 확인",
      eligibility: "강남대학교 재학생",
      field: "대학생활 지원 비교과 프로그램",
      documents: "공식 공고 원문 확인",
      operation: "공식 공고 원문 확인",
    },
    faqs: [
      { id: "method", question: "신청 방법은 무엇인가요?", answer: "공식 공고 원문에 안내된 신청 경로를 확인하세요.", source: "신청 방법" },
    ],
  },
]);

const NOTICE_SECTIONS = Object.freeze([
  { key: "period", label: "신청 기간", keywords: ["접수", "기간", "마감", "일정", "발표"] },
  { key: "eligibility", label: "지원 자격", keywords: ["지원자격", "지원 자격", "대상", "재학생", "편입생", "휴학생"] },
  { key: "field", label: "모집 분야", keywords: ["모집 분야", "모집분야", "모집 인원", "모집인원", "분야"] },
  { key: "method", label: "신청 방법", keywords: ["지원 방법", "신청 방법", "지원서", "신청서", "QR", "큐알"] },
  { key: "contact", label: "문의처", keywords: ["문의", "담당", "등록자", "부서", "연락"] },
]);

const MOCK_SCHOOL_NOTICES = Object.freeze([
  {
    id: "mock-school-01",
    title: "2026학년도 비교과 프로그램 참가자 모집",
    department: "학생지원팀",
    publishedAt: "2026.07.23",
    sourceType: "html",
    sourceUrl: LEGACY_DEFAULT_NOTICE_URL,
    imageUrls: [],
    category: "비교과 프로그램",
    status: "모집 중",
    recruitmentStatus: "모집 중",
    eligibleEnrollmentStatus: ["재학생"],
    eligibleGrades: "전체 학년",
    transferStudentEligible: null,
    graduateEligible: null,
    summary: "학생 역량 강화를 위한 비교과 프로그램 참가자를 모집하는 공고입니다.",
    facts: { period: "7월 23일 ~ 8월 5일", eligibility: "강남대학교 재학생", field: "비교과 프로그램", documents: "참가 신청서", operation: "2026학년도 2학기" },
  },
  { id: "mock-school-02", title: "2026학년도 2학기 장학금 신청 안내", department: "장학복지팀", publishedAt: "2026.07.22", sourceType: "pdf", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "장학", status: "안내", recruitmentStatus: "모집 예정", eligibleEnrollmentStatus: ["재학생"], eligibleGrades: "2~4학년", transferStudentEligible: null, graduateEligible: false, summary: "2학기 장학금 신청 절차와 제출 서류를 안내하는 공고입니다.", facts: { period: "7월 22일 ~ 8월 9일", eligibility: "장학금 신청 희망 재학생", field: "교내 장학", documents: "신청서, 증빙서류", operation: "2026학년도 2학기" } },
  { id: "mock-school-03", title: "학생 상담 프로그램 참여자 모집", department: "학생상담센터", publishedAt: "2026.07.21", sourceType: "image", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "비교과 프로그램", status: "모집 중", recruitmentStatus: "모집 중", eligibleEnrollmentStatus: ["재학생", "휴학생"], eligibleGrades: "", transferStudentEligible: null, graduateEligible: null, summary: "학생 심리 지원을 위한 상담 프로그램 참여자를 모집하는 공고입니다.", facts: { period: "7월 21일 ~ 7월 31일", eligibility: "상담 참여 희망 학생", field: "상담 프로그램", documents: "온라인 신청서", operation: "8월 중" } },
  { id: "mock-school-04", title: "휴학 및 복학 신청 기간 안내", department: "학사관리팀", publishedAt: "2026.07.20", sourceType: "html", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "학사", status: "안내", recruitmentStatus: "모집 예정", eligibleEnrollmentStatus: ["재학생", "휴학생"], eligibleGrades: "전체 학년", transferStudentEligible: null, graduateEligible: false, summary: "휴학과 복학 신청 기간, 신청 경로를 안내하는 공고입니다.", facts: { period: "7월 20일 ~ 8월 14일", eligibility: "휴학 또는 복학 예정 학생", field: "학적 변동", documents: "신청서 및 사유서", operation: "2026학년도 2학기" } },
  { id: "mock-school-05", title: "진로 취업 특강 참가 신청 안내", department: "대학일자리플러스센터", publishedAt: "2026.07.19", sourceType: "image", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "취업", status: "모집 중", recruitmentStatus: "모집 중", eligibleEnrollmentStatus: ["재학생"], eligibleGrades: "3~4학년", transferStudentEligible: true, graduateEligible: true, summary: "진로 설계와 취업 준비를 돕는 특강 참가 신청 공고입니다.", facts: { period: "7월 19일 ~ 7월 29일", eligibility: "강남대학교 재학생 및 졸업예정자", field: "진로 취업 특강", documents: "참가 신청서", operation: "8월 1일" } },
  { id: "mock-school-06", title: "교내 봉사활동 모집 안내", department: "사회봉사센터", publishedAt: "2026.07.18", sourceType: "pdf", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "행사", status: "모집 중", recruitmentStatus: "모집 중", eligibleEnrollmentStatus: ["재학생"], eligibleGrades: "", transferStudentEligible: null, graduateEligible: null, summary: "교내 봉사활동 참여 인원과 활동 일정을 안내하는 공고입니다.", facts: { period: "7월 18일 ~ 8월 1일", eligibility: "봉사활동 참여 희망 학생", field: "교내 봉사", documents: "활동 신청서", operation: "8월 중" } },
  { id: "mock-school-07", title: "도서관 이용 교육 신청 안내", department: "중앙도서관", publishedAt: "2026.07.17", sourceType: "html", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "학사", status: "안내", recruitmentStatus: "마감", eligibleEnrollmentStatus: [], eligibleGrades: "", transferStudentEligible: null, graduateEligible: null, summary: "도서관 자료 검색과 전자자료 활용 교육 신청 공고입니다.", facts: { period: "7월 17일 ~ 7월 30일", eligibility: "강남대학교 구성원", field: "도서관 이용 교육", documents: "온라인 신청", operation: "8월 첫째 주" } },
  { id: "mock-school-08", title: "국제교류 프로그램 설명회 안내", department: "국제교류팀", publishedAt: "2026.07.16", sourceType: "image", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "행사", status: "안내", recruitmentStatus: "모집 예정", eligibleEnrollmentStatus: ["재학생"], eligibleGrades: "2~4학년", transferStudentEligible: true, graduateEligible: false, summary: "교환학생과 단기 연수 프로그램 설명회 일정을 안내하는 공고입니다.", facts: { period: "7월 16일 ~ 7월 25일", eligibility: "국제교류 프로그램 관심 학생", field: "설명회", documents: "사전 신청서", operation: "7월 28일" } },
  { id: "mock-school-09", title: "캡스톤디자인 팀 모집 안내", department: "교육혁신팀", publishedAt: "2026.07.15", sourceType: "pdf", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "비교과 프로그램", status: "모집 중", recruitmentStatus: "모집 중", eligibleEnrollmentStatus: ["재학생"], eligibleGrades: "3~4학년", transferStudentEligible: true, graduateEligible: false, summary: "캡스톤디자인 프로젝트 팀 구성과 신청 방법을 안내하는 공고입니다.", facts: { period: "7월 15일 ~ 8월 7일", eligibility: "캡스톤디자인 참여 학생", field: "팀 프로젝트", documents: "팀 신청서, 계획서", operation: "2026학년도 2학기" } },
  { id: "mock-school-10", title: "장애학생 지원 서비스 신청 안내", department: "장애학생지원센터", publishedAt: "2026.07.14", sourceType: "html", sourceUrl: LEGACY_DEFAULT_NOTICE_URL, category: "장학", status: "안내", recruitmentStatus: "마감", eligibleEnrollmentStatus: [], eligibleGrades: "", transferStudentEligible: null, graduateEligible: null, summary: "장애학생 학습 지원 서비스 신청 절차를 안내하는 공고입니다.", facts: { period: "상시 신청", eligibility: "지원 서비스가 필요한 학생", field: "학습 지원 서비스", documents: "신청서, 관련 증빙", operation: "학기 중" } },
]);

const SOURCE_TYPE_LABELS = Object.freeze({
  image: "이미지",
  pdf: "PDF",
  html: "HTML",
  mock: "공고 정보",
});

const APPROVAL_STATUS_LABELS = Object.freeze({
  draft: "초안",
  review: "검수 필요",
  published: "공개",
  declined: "보류",
});

const ADMIN_SOURCE_LABELS = Object.freeze({
  "cloudflare-d1": "공용 관리자 저장소",
  "Cloudflare D1": "공용 관리자 저장소",
  "공용 저장소": "공용 관리자 저장소",
  firestore: "Firebase 관리자 저장소",
  Firestore: "Firebase 관리자 저장소",
  local: "브라우저 저장",
  bootstrap: "초기 관리자",
  "bootstrap-transfer": "초기 관리자 위임",
  "Google 로그인": "Google 로그인",
  "google-login": "Google 로그인",
});

const adminPage = {
  authBadge: document.querySelector("#admin-auth-badge") || document.querySelector("#review-status"),
  authState: document.querySelector("#admin-auth-state"),
  logoutButton: document.querySelector("#admin-logout-button"),
  restrictedAreas: [...document.querySelectorAll("[data-requires-admin]")],
  memberList: document.querySelector("#member-list"),
  memberForm: document.querySelector("#member-form"),
  memberEmail: document.querySelector("#member-email"),
  memberRole: document.querySelector("#member-role"),
  form: document.querySelector("#admin-ingest-form"),
  inputModeRadios: [...document.querySelectorAll("input[name='notice-input-mode']")],
  urlPanel: document.querySelector("#url-input-panel"),
  listPanel: document.querySelector("#notice-list-panel"),
  urlInput: document.querySelector("#official-notice-url"),
  loadSchoolNoticesButton: document.querySelector("#load-school-notices-button"),
  simulateSchoolErrorButton: document.querySelector("#simulate-school-error-button"),
  schoolImportStatus: document.querySelector("#school-import-status"),
  schoolNoticeList: document.querySelector("#school-notice-list"),
  selectedNoticePanel: document.querySelector("#selected-notice-panel"),
  selectedNoticeTitle: document.querySelector("#selected-notice-title"),
  selectedNoticeSource: document.querySelector("#selected-notice-source"),
  generateButton: document.querySelector("#generate-draft-button"),
  chip: document.querySelector("#draft-chip"),
  empty: document.querySelector("#draft-empty"),
  fields: document.querySelector("#draft-fields"),
  title: document.querySelector("#draft-title"),
  summary: document.querySelector("#draft-summary"),
  faq: document.querySelector("#draft-faq"),
  evidence: document.querySelector("#draft-evidence"),
  approveButton: document.querySelector("#sticky-approve-draft-button"),
  declineButton: document.querySelector("#sticky-decline-draft-button"),
  note: document.querySelector("#approval-note"),
  publishActionBar: document.querySelector("#publish-action-bar"),
  publishActionClose: document.querySelector("#publish-action-close"),
  publishSelectionSummary: document.querySelector("#publish-selection-summary"),
  publishCheckSummary: document.querySelector("#publish-check-summary"),
  publishedList: document.querySelector("#published-list"),
  publishedCountChip: document.querySelector("#published-count-chip"),
  publishedNote: document.querySelector("#published-note"),
  publishedBulkToolbar: document.querySelector("#published-bulk-toolbar"),
  publishedSelectAll: document.querySelector("#published-select-all"),
  publishedBulkSummary: document.querySelector("#published-bulk-summary"),
  bulkDeletePublishedButton: document.querySelector("#bulk-delete-published-button"),
  bulkDeclinePublishedButton: document.querySelector("#bulk-decline-published-button"),
  bulkPublishPublishedButton: document.querySelector("#bulk-publish-published-button"),
  savePublishedButton: document.querySelector("#save-published-button"),
  deletePublishedButton: document.querySelector("#delete-published-button"),
};

let currentUser = null;
let currentRole = "viewer";
let managedMembers = loadManagedMembers();
let generatedDraftUrl = "";
let currentDraftNotice = null;
let selectedPublishedId = "";
let selectedMockNoticeId = "";
let selectedPublishedIds = new Set();
let noticeInputMode = "url";
let schoolNoticeLoadState = "idle";
let importedSchoolNotices = [];
let currentApprovalStatus = "draft";
let publishActionBarDismissed = false;

function setAdminNote(message) {
  if (adminPage.note) adminPage.note.textContent = message;
  if (adminPage.publishedNote) adminPage.publishedNote.textContent = message;
}

function updateCheckboxState(checkbox, checked, indeterminate = false) {
  if (!checkbox) return;
  checkbox.checked = checked;
  checkbox.indeterminate = indeterminate;
}

function getSelectedPublishedNotices() {
  const notices = getManageableNotices();
  const noticeIds = new Set(notices.map((notice) => notice.id));
  selectedPublishedIds = new Set([...selectedPublishedIds].filter((id) => noticeIds.has(id)));
  return notices.filter((notice) => selectedPublishedIds.has(notice.id));
}

function updatePublishedBulkState() {
  if (!adminPage.publishedBulkToolbar) return;
  const notices = getManageableNotices();
  const noticeIds = new Set(notices.map((notice) => notice.id));
  selectedPublishedIds = new Set([...selectedPublishedIds].filter((id) => noticeIds.has(id)));
  const selectedCount = selectedPublishedIds.size;
  const allowed = canEditAndPublish();

  adminPage.publishedBulkToolbar.hidden = notices.length === 0;
  if (adminPage.publishedBulkSummary) {
    adminPage.publishedBulkSummary.textContent = selectedCount > 0 ? `${selectedCount}개 선택됨` : "0개 선택됨";
  }
  updateCheckboxState(
    adminPage.publishedSelectAll,
    selectedCount > 0 && selectedCount === notices.length,
    selectedCount > 0 && selectedCount < notices.length,
  );
  const disabled = !allowed || selectedCount === 0;
  if (adminPage.bulkDeletePublishedButton) adminPage.bulkDeletePublishedButton.disabled = disabled;
  if (adminPage.bulkDeclinePublishedButton) adminPage.bulkDeclinePublishedButton.disabled = disabled;
  if (adminPage.bulkPublishPublishedButton) adminPage.bulkPublishPublishedButton.disabled = disabled;
  adminPage.publishedList?.querySelectorAll(".published-checkbox").forEach((checkbox) => {
    checkbox.checked = selectedPublishedIds.has(checkbox.dataset.noticeId);
  });
}

function togglePublishedBulkSelection(noticeId, checked) {
  if (!getManageableNotices().some((notice) => notice.id === noticeId)) return;
  if (checked) {
    selectedPublishedIds.add(noticeId);
  } else {
    selectedPublishedIds.delete(noticeId);
  }
  updatePublishedBulkState();
}

function handlePublishedSelectAllChange() {
  if (!adminPage.publishedSelectAll) return;
  selectedPublishedIds = adminPage.publishedSelectAll.checked
    ? new Set(getManageableNotices().map((notice) => notice.id))
    : new Set();
  updatePublishedBulkState();
}

function setApprovalStatus(status) {
  currentApprovalStatus = status;
  const label = APPROVAL_STATUS_LABELS[status] || status;
  if (adminPage.chip) {
    adminPage.chip.textContent = label;
    adminPage.chip.dataset.status = status;
  }
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

function normalizeMemberEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getBootstrapAdminEmail() {
  return normalizeMemberEmail(window.localStorage.getItem("kangnamAdminBootstrapEmail"));
}

function setBootstrapAdminEmail(email) {
  const normalizedEmail = normalizeMemberEmail(email);
  if (normalizedEmail) {
    window.localStorage.setItem("kangnamAdminBootstrapEmail", normalizedEmail);
  }
}

function clearBootstrapAdminEmail() {
  window.localStorage.removeItem("kangnamAdminBootstrapEmail");
}

function getAdminSourceLabel(source) {
  return ADMIN_SOURCE_LABELS[source] || source || ADMIN_SOURCE_LABELS.local;
}

function getManagedMember(email) {
  const normalizedEmail = normalizeMemberEmail(email);
  return managedMembers.find((member) => normalizeMemberEmail(member.email) === normalizedEmail);
}

function getRenderableMembers() {
  const bootstrapEmail = getBootstrapAdminEmail();
  const records = new Map();
  const currentUserEmail = normalizeMemberEmail(currentUser?.email);

  managedMembers.forEach((member) => {
    const email = normalizeMemberEmail(member.email);
    if (!email) return;
    records.set(email, {
      ...member,
      email,
      role: member.role || "viewer",
      source: member.source || "local",
    });
  });

  if (bootstrapEmail && !records.has(bootstrapEmail)) {
    records.set(bootstrapEmail, { email: bootstrapEmail, role: "owner", source: "bootstrap" });
  }

  if (currentUserEmail) {
    const existing = records.get(currentUserEmail);
    records.set(currentUserEmail, {
      email: currentUserEmail,
      role: existing?.role || currentRole,
      source: existing?.source || "google-login",
    });
  }

  return [...records.values()].map((member) => ({
    ...member,
    role: member.email === bootstrapEmail ? "owner" : member.role,
    isBootstrap: member.email === bootstrapEmail,
    isCurrentUser: currentUserEmail === member.email,
  }));
}

function countOwners(members = getRenderableMembers()) {
  return members.filter((member) => member.role === "owner").length;
}

function roleRank(role) {
  return { viewer: 0, editor: 1, owner: 2 }[role] || 0;
}

function canManageMembers() {
  return currentRole === "owner";
}

function canEditAndPublish() {
  return roleRank(currentRole) >= roleRank("editor");
}

function applyRoleVisibility() {
  document.querySelectorAll("[data-required-role]").forEach((element) => {
    const requiredRole = element.dataset.requiredRole;
    const visible = roleRank(currentRole) >= roleRank(requiredRole);
    element.dataset.roleHidden = visible ? "false" : "true";
    element.setAttribute("aria-hidden", visible ? "false" : "true");
    element.querySelectorAll("a, button, input, select, textarea").forEach((control) => {
      control.tabIndex = visible ? 0 : -1;
    });
  });
}

function renderAuthState() {
  if (adminPage.authBadge) {
    adminPage.authBadge.textContent = ROLE_LABELS[currentRole];
    adminPage.authBadge.dataset.state = currentRole === "owner" ? "approved" : "review";
  }

  const title = adminPage.authState?.querySelector("strong");
  const subtitle = adminPage.authState?.querySelector("span");
  if (title && subtitle) {
    if (!currentUser) {
      title.textContent = "로그아웃 상태";
      subtitle.textContent = "기본 권한은 학생 보기입니다. Google 로그인 후 관리자 작업을 사용할 수 있습니다.";
    } else {
      title.textContent = `${currentUser.email} · ${ROLE_LABELS[currentRole] || ROLE_LABELS.viewer}`;
      subtitle.textContent = "관리자 관리, AI 초안 수정, 학생 페이지 공개가 가능합니다.";
    }
  }

  if (adminPage.logoutButton) adminPage.logoutButton.disabled = !currentUser;
}

function updateAccess() {
  const allowed = canEditAndPublish();
  renderMembers();
  renderMockSchoolNotices();
  renderPublishedNotices();
  applyRoleVisibility();
  adminPage.restrictedAreas.forEach((area) => {
    area.classList.toggle("locked", !allowed);
    area.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !allowed;
    });
  });
  if (adminPage.memberForm) {
    adminPage.memberForm.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = !canManageMembers();
    });
  }
  setSchoolImportState(schoolNoticeLoadState, adminPage.schoolImportStatus?.textContent || "가져오기 버튼을 누르면 최근 공고 10개를 불러옵니다.");
  renderAuthState();
  updateApprovalState();
}

function getSelectedMockNotice() {
  return importedSchoolNotices.find((notice) => notice.id === selectedMockNoticeId) || MOCK_SCHOOL_NOTICES.find((notice) => notice.id === selectedMockNoticeId) || null;
}

function getMockNoticeSourceText(notice) {
  if (!notice) return "공고 URL을 입력하거나 공고를 선택해 주세요.";
  return `${notice.department} · ${notice.publishedAt} · ${SOURCE_TYPE_LABELS[notice.sourceType] || "확인 필요"} · ${notice.sourceUrl}`;
}

function updateSelectedNoticeSummary() {
  if (!adminPage.selectedNoticeTitle || !adminPage.selectedNoticeSource) return;
  const selectedNotice = getSelectedMockNotice();

  if (noticeInputMode === "list" && selectedNotice) {
    adminPage.selectedNoticePanel?.classList.add("selected");
    adminPage.selectedNoticeTitle.textContent = selectedNotice.title;
    adminPage.selectedNoticeSource.textContent = getMockNoticeSourceText(selectedNotice);
    return;
  }

  adminPage.selectedNoticePanel?.classList.remove("selected");
  adminPage.selectedNoticeTitle.textContent = "아직 선택된 공고가 없습니다.";
  adminPage.selectedNoticeSource.textContent = noticeInputMode === "url"
    ? "공식 공고 URL을 직접 입력해 주세요."
    : "공고 URL을 입력하거나 공고를 선택해 주세요.";
}

function getProcessedNoticeKeys() {
  const processed = new Set();
  loadPublishedNotices().forEach((notice) => {
    if (notice.id) processed.add(notice.id);
  });
  return processed;
}

function isProcessedSchoolNotice(notice) {
  const processed = getProcessedNoticeKeys();
  return processed.has(notice.id);
}

function setSchoolImportState(state, message) {
  schoolNoticeLoadState = state;
  if (adminPage.schoolImportStatus) {
    adminPage.schoolImportStatus.textContent = message;
    adminPage.schoolImportStatus.dataset.state = state;
  }
  if (adminPage.loadSchoolNoticesButton) {
    adminPage.loadSchoolNoticesButton.disabled = !canEditAndPublish() || state === "loading";
    adminPage.loadSchoolNoticesButton.textContent = state === "loading" ? "가져오는 중..." : "학교 홈페이지에서 가져오기";
  }
  if (adminPage.simulateSchoolErrorButton) {
    adminPage.simulateSchoolErrorButton.disabled = !canEditAndPublish() || state === "loading";
  }
}

function normalizeImportedSchoolNotice(item) {
  const detail = MOCK_SCHOOL_NOTICES.find((notice) => notice.id === item.id || notice.sourceUrl === item.sourceUrl);
  const merged = { ...detail, ...item };
  merged.sourceUrl = getOfficialNoticeSourceUrl(item.sourceUrl) || getOfficialNoticeSourceUrl(detail?.sourceUrl);
  return merged;
}

function getOfficialNoticeSourceUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    const path = parsed.pathname.toLowerCase();
    const boardSeq = parsed.searchParams.get("encMenuBoardSeq") || "";
    if (parsed.protocol !== "https:" || parsed.hostname !== "web.kangnam.ac.kr") return "";
    if (PLACEHOLDER_BOARD_SEQ_PATTERN.test(boardSeq)) return "";
    if (path.includes("/mock/") || path.includes("/common/")) return "";
    if (/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(path)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

async function loadSchoolNoticeList({ simulateError = false } = {}) {
  if (!canEditAndPublish()) return;
  selectedMockNoticeId = "";
  importedSchoolNotices = [];
  renderMockSchoolNotices();
  updateSelectedNoticeSummary();
  setSchoolImportState("loading", "학교 공고 목록을 가져오는 중입니다.");

  await new Promise((resolve) => window.setTimeout(resolve, 450));

  try {
    if (simulateError) throw new Error("simulated school notice load failure");
    const response = await fetch(SCHOOL_NOTICE_MOCK_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`mock list load failed: ${response.status}`);
    const notices = await response.json();
    importedSchoolNotices = notices.slice(0, 10).map(normalizeImportedSchoolNotice);
    setSchoolImportState("success", "최근 공고 10개를 불러왔습니다. 한 번 클릭하면 선택하고, 두 번 클릭하면 바로 초안을 생성합니다.");
  } catch (error) {
    console.error("학교 공고 목록 가져오기 실패", error);
    importedSchoolNotices = [];
    setSchoolImportState("error", "학교 공고 목록을 불러오지 못했습니다. URL을 직접 입력해 주세요.");
  }

  renderMockSchoolNotices();
}

function renderMockSchoolNotices() {
  if (!adminPage.schoolNoticeList) return;
  if (schoolNoticeLoadState === "idle") {
    adminPage.schoolNoticeList.replaceChildren();
    updateSelectedNoticeSummary();
    setSchoolImportState("idle", "가져오기 버튼을 누르면 최근 공고 10개를 불러옵니다.");
    return;
  }

  if (schoolNoticeLoadState === "loading") {
    const loading = document.createElement("div");
    loading.className = "school-notice-state";
    loading.textContent = "학교 공고 목록을 가져오는 중입니다.";
    adminPage.schoolNoticeList.replaceChildren(loading);
    return;
  }

  if (schoolNoticeLoadState === "error") {
    const error = document.createElement("div");
    error.className = "school-notice-state error";
    error.textContent = "학교 공고 목록을 불러오지 못했습니다. URL을 직접 입력해 주세요.";
    adminPage.schoolNoticeList.replaceChildren(error);
    updateSelectedNoticeSummary();
    return;
  }

  adminPage.schoolNoticeList.replaceChildren(
    ...importedSchoolNotices.map((notice) => {
      const processed = isProcessedSchoolNotice(notice);
      const row = document.createElement("div");
      const button = document.createElement("button");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      const type = document.createElement("small");
      const state = document.createElement("em");
      row.className = "school-notice-row";
      row.dataset.processed = String(processed);
      button.type = "button";
      button.className = "school-notice-item";
      button.dataset.noticeId = notice.id;
      button.disabled = processed;
      button.dataset.processed = String(processed);
      button.setAttribute("aria-pressed", String(notice.id === selectedMockNoticeId));
      if (notice.id === selectedMockNoticeId) button.setAttribute("aria-current", "true");
      title.textContent = notice.title;
      meta.textContent = `${notice.department} · ${notice.publishedAt}`;
      type.textContent = SOURCE_TYPE_LABELS[notice.sourceType] || "확인 필요";
      state.className = "school-notice-state-label";
      state.textContent = processed ? "처리 완료" : "선택 가능";
      button.title = processed
        ? "이미 처리한 공고입니다."
        : "한 번 클릭하면 선택하고, 두 번 클릭하면 바로 초안을 생성합니다.";
      button.append(title, meta, type, state);
      button.addEventListener("click", () => selectMockSchoolNotice(notice.id));
      button.addEventListener("dblclick", () => {
        if (selectedMockNoticeId !== notice.id) selectMockSchoolNotice(notice.id);
        void generateDraft();
      });
      row.append(button);
      return row;
    }),
  );
  updateSelectedNoticeSummary();
}

function updateMockSchoolNoticeSelection() {
  adminPage.schoolNoticeList?.querySelectorAll(".school-notice-item").forEach((button) => {
    const isSelected = button.dataset.noticeId === selectedMockNoticeId;
    button.setAttribute("aria-pressed", String(isSelected));
    if (isSelected) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  updateSelectedNoticeSummary();
}

function selectMockSchoolNotice(noticeId) {
  const notice = importedSchoolNotices.find((notice) => notice.id === noticeId);
  if (!notice || isProcessedSchoolNotice(notice)) return;
  selectedMockNoticeId = noticeId;
  resetDraftSelectionState("학교 홈페이지 공고가 선택되었습니다. 초안을 생성해 주세요.");
  updateMockSchoolNoticeSelection();
  updateApprovalState();
}

function setNoticeInputMode(mode) {
  noticeInputMode = mode;
  if (adminPage.urlPanel) adminPage.urlPanel.hidden = mode !== "url";
  if (adminPage.listPanel) adminPage.listPanel.hidden = mode !== "list";
  if (mode === "url") selectedMockNoticeId = "";
  resetDraftSelectionState(mode === "url" ? "공식 공고 URL을 입력해 주세요." : "학교 홈페이지에서 가져오기 버튼을 눌러 공고 목록을 불러와 주세요.");
  renderMockSchoolNotices();
  updateApprovalState();
}

function resetDraftSelectionState(message) {
  publishActionBarDismissed = false;
  generatedDraftUrl = "";
  currentDraftNotice = null;
  if (adminPage.fields) adminPage.fields.hidden = true;
  if (adminPage.empty) adminPage.empty.hidden = false;
  if (adminPage.title) adminPage.title.value = "";
  if (adminPage.summary) adminPage.summary.value = "";
  if (adminPage.faq) adminPage.faq.value = "";
  if (adminPage.evidence) adminPage.evidence.value = "";
  setApprovalStatus("draft");
  if (adminPage.chip) adminPage.chip.textContent = "미생성";
  if (adminPage.note) adminPage.note.textContent = message;
}

function renderMembers() {
  if (!adminPage.memberList) return;
  const members = getRenderableMembers();
  const ownerCount = countOwners(members);
  const currentUserIsBootstrap = normalizeMemberEmail(currentUser?.email) === getBootstrapAdminEmail();

  if (members.length === 0) {
    adminPage.memberList.innerHTML = "<p class=\"member-empty\">로그인한 관리자 계정이 없습니다.</p>";
    return;
  }

  adminPage.memberList.replaceChildren(
    ...members.map((member) => {
      const row = document.createElement("div");
      const details = document.createElement("div");
      const email = document.createElement("strong");
      const role = document.createElement("span");
      const source = document.createElement("small");
      const actions = document.createElement("div");
      email.textContent = member.email;
      role.textContent = ROLE_LABELS[member.role] || ROLE_LABELS.viewer;
      source.textContent = member.isBootstrap ? "초기 관리자" : getAdminSourceLabel(member.source);
      details.className = "member-details";
      details.append(email, role, source);
      actions.className = "member-actions";

      if (canManageMembers()) {
        const canTransferBootstrap = currentUserIsBootstrap && !member.isCurrentUser;
        if (canTransferBootstrap) {
          const transferButton = document.createElement("button");
          transferButton.className = "button secondary member-action-button";
          transferButton.type = "button";
          transferButton.textContent = "초기 관리자 위임";
          transferButton.setAttribute("aria-label", `${member.email}에게 초기 관리자 권한 위임`);
          transferButton.addEventListener("click", () => handleBootstrapTransfer(member.email));
          actions.append(transferButton);
        }

        const deleteButton = document.createElement("button");
        const deleteWouldRemoveLastOwner = member.role === "owner" && ownerCount <= 1;
        deleteButton.className = "button danger member-action-button";
        deleteButton.type = "button";
        deleteButton.textContent = "삭제";
        deleteButton.disabled = member.isCurrentUser || deleteWouldRemoveLastOwner;
        deleteButton.setAttribute("aria-label", `${member.email} 관리자 삭제`);
        deleteButton.addEventListener("click", () => handleMemberDelete(member.email));
        actions.append(deleteButton);
      }

      row.append(details, actions);
      return row;
    }),
  );
}

function updateApprovalState() {
  const ready = Boolean(adminPage.fields && !adminPage.fields.hidden);
  const allowed = canEditAndPublish();
  if (adminPage.approveButton) {
    adminPage.approveButton.disabled = !(allowed && ready);
  }
  if (adminPage.declineButton) {
    adminPage.declineButton.disabled = !(allowed && ready);
  }

  const canManagePublished = allowed && Boolean(selectedPublishedId);
  if (adminPage.savePublishedButton) adminPage.savePublishedButton.disabled = !canManagePublished;
  if (adminPage.deletePublishedButton) adminPage.deletePublishedButton.disabled = !canManagePublished;
  updatePublishedBulkState();
  updatePublishActionBar();
}

function getPublishSelectionLabel() {
  const selectedNotice = getSelectedMockNotice();
  if (noticeInputMode === "list") return selectedNotice?.title || "공고 선택 전";
  return adminPage.urlInput?.value.trim() ? "URL 입력됨" : "URL 입력 전";
}

function updatePublishActionBar() {
  if (!adminPage.publishActionBar) return;

  const allowed = canEditAndPublish();
  const ready = Boolean(adminPage.fields && !adminPage.fields.hidden);
  const visible = allowed && ready && !publishActionBarDismissed;

  adminPage.publishActionBar.hidden = !visible;
  document.body.classList.toggle("has-publish-action-bar", visible);

  if (adminPage.publishSelectionSummary && ready) {
    adminPage.publishSelectionSummary.textContent = `${getPublishSelectionLabel()} · 제목, 일정, 지원 자격과 답변 근거를 확인해 주세요.`;
  }
  if (adminPage.publishCheckSummary) adminPage.publishCheckSummary.textContent = "마지막으로 확인하셨나요?";
}

function handlePublishActionBarClose() {
  publishActionBarDismissed = true;
  updatePublishActionBar();
}

let publishCompletionToastTimer = 0;

function showPublishCompletionToast(message, tone = "success") {
  const existingToast = document.querySelector(".publish-completion-toast");
  if (existingToast) existingToast.remove();
  window.clearTimeout(publishCompletionToastTimer);

  const toast = document.createElement("div");
  toast.className = "publish-completion-toast";
  toast.dataset.tone = tone;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  document.body.append(toast);

  publishCompletionToastTimer = window.setTimeout(() => {
    toast.classList.add("is-hiding");
    window.setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function resetDraftForUrlChange() {
  if (noticeInputMode !== "url") return;
  if (!adminPage.urlInput || adminPage.urlInput.value.trim() === generatedDraftUrl) return;

  resetDraftSelectionState("새 URL이 입력되었습니다. 초안을 다시 생성해 주세요.");
  updateApprovalState();
}

function clearLegacyDefaultNoticeUrl() {
  if (!adminPage.urlInput) return;
  const value = adminPage.urlInput.value.trim();
  const defaultValue = adminPage.urlInput.defaultValue.trim();

  if (value === LEGACY_DEFAULT_NOTICE_URL || defaultValue === LEGACY_DEFAULT_NOTICE_URL) {
    adminPage.urlInput.value = "";
    adminPage.urlInput.defaultValue = "";
    adminPage.urlInput.removeAttribute("value");
    adminPage.urlInput.placeholder = "https://web.kangnam.ac.kr/...";
    resetDraftForUrlChange();
  }
}

async function handleMemberSubmit(event) {
  event.preventDefault();
  if (!canManageMembers()) return;

  const email = normalizeMemberEmail(adminPage.memberEmail.value);
  if (!email) return;

  let result = null;
  try {
    result = await window.KANGNAM_NOTICE_STORE?.saveAdmin({
      email,
      role: adminPage.memberRole.value,
    });
  } catch (error) {
    setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
    return;
  }

  managedMembers = managedMembers.filter((member) => normalizeMemberEmail(member.email) !== email);
  managedMembers.push({ email, role: adminPage.memberRole.value, source: result?.source || "local" });
  saveManagedMembers();
  adminPage.memberEmail.value = "";
  renderMembers();
}

async function handleMemberDelete(email) {
  if (!canManageMembers()) return;
  const normalizedEmail = normalizeMemberEmail(email);
  const member = getRenderableMembers().find((item) => item.email === normalizedEmail);
  if (!member || member.isCurrentUser) return;
  if (member.role === "owner" && countOwners() <= 1) {
    showPublishCompletionToast("관리자 관리 권한을 가진 계정은 최소 1개 이상 필요합니다.");
    return;
  }

  const confirmed = window.confirm(`${normalizedEmail} 관리자 권한을 삭제할까요?`);
  if (!confirmed) return;

  try {
    await window.KANGNAM_NOTICE_STORE?.deleteAdmin(normalizedEmail);
  } catch (error) {
    setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
    return;
  }

  managedMembers = managedMembers.filter((item) => normalizeMemberEmail(item.email) !== normalizedEmail);
  if (member.isBootstrap) clearBootstrapAdminEmail();
  saveManagedMembers();
  renderMembers();
}

async function handleBootstrapTransfer(email) {
  if (!canManageMembers()) return;
  const targetEmail = normalizeMemberEmail(email);
  if (!targetEmail || targetEmail === normalizeMemberEmail(currentUser?.email)) return;
  const targetMember = getManagedMember(targetEmail) || {};

  const confirmed = window.confirm(`${targetEmail} 계정에 초기 관리자 권한을 넘길까요?\n위임 후 해당 계정은 관리자 관리 권한을 갖습니다.`);
  if (!confirmed) return;

  try {
    await window.KANGNAM_NOTICE_STORE?.saveAdmin({ email: targetEmail, role: "owner" });
  } catch (error) {
    setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
    return;
  }

  managedMembers = managedMembers.filter((member) => normalizeMemberEmail(member.email) !== targetEmail);
  managedMembers.push({ ...targetMember, email: targetEmail, role: "owner", source: "bootstrap-transfer" });
  setBootstrapAdminEmail(targetEmail);
  saveManagedMembers();
  currentRole = getManagedMember(normalizeMemberEmail(currentUser?.email))?.role || "viewer";
  updateAccess();
}

function buildReaderUrl(url) {
  return `${READER_ENDPOINT}${url}`;
}

function cleanReaderText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeMarkdownLinks(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function getNoticeTitle(markdown, url) {
  const title = markdown.match(/^Title:\s*(.+)$/m)?.[1]?.trim();
  if (title) return title;

  const heading = markdown.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim();
  if (heading) return removeMarkdownLinks(heading);

  try {
    return new URL(url).hostname;
  } catch {
    return "공식 공고";
  }
}

function toNoticeLines(markdown) {
  const noisy = [
    "사이트맵",
    "전체메뉴",
    "메뉴닫기",
    "메뉴 열기",
    "통합검색",
    "개인정보처리방침",
    "Copyright",
    "관련기관",
    "SNS",
    "LOGIN",
  ];

  return cleanReaderText(markdown)
    .split("\n")
    .map((line) => removeMarkdownLinks(line).replace(/^[*#>\-\d. ]+/, "").trim())
    .filter((line) => line.length >= 2)
    .filter((line) => !noisy.some((word) => line.includes(word)))
    .slice(0, 240);
}

function extractImageSources(markdown) {
  const imageUrls = [];
  const imagePattern = /!\[[^\]]*]\((https?:\/\/[^)\s]+)[^)]*\)/g;
  const filePattern = /\[([^\]]+\.(?:png|jpe?g|webp|gif|pdf))]\((https?:\/\/[^)]+)\)/gi;
  let match = imagePattern.exec(markdown);

  while (match) {
    imageUrls.push(match[1]);
    match = imagePattern.exec(markdown);
  }

  match = filePattern.exec(markdown);
  while (match) {
    imageUrls.push(match[2]);
    match = filePattern.exec(markdown);
  }

  return [...new Set(imageUrls)]
    .filter(isNoticeContentImageUrl)
    .slice(0, 4);
}

function isNoticeContentImageUrl(url) {
  const normalized = String(url || "").toLowerCase();
  if (!normalized) return false;
  const blocked = [
    "blogger",
    "youtube",
    "flickr",
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
    if (/^(logo|sns|icon|btn|symbol|emblem)[._-]/i.test(file)) return false;
  } catch {
    return false;
  }

  return true;
}

function findSection(lines, keywords) {
  const index = lines.findIndex((line) => keywords.some((keyword) => line.toLocaleLowerCase("ko-KR").includes(keyword.toLocaleLowerCase("ko-KR"))));
  if (index === -1) return "";

  return lines
    .slice(index, index + 5)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .slice(0, 260);
}

function analyzeNotice(markdown, sourceUrl) {
  const title = getNoticeTitle(markdown, sourceUrl);
  const lines = toNoticeLines(markdown);
  const sections = NOTICE_SECTIONS.map((section) => ({
    ...section,
    text: findSection(lines, section.keywords),
  }));
  const images = extractImageSources(markdown);
  const bodyPreview = lines.join("\n").slice(0, MAX_NOTICE_CHARS);

  return { title, lines, sections, images, bodyPreview, sourceUrl };
}

function fallbackText(label, text) {
  return text || `${label}은 공식 공고 원문에서 관리자 확인이 필요합니다.`;
}

function createDraftFromNotice(notice) {
  const period = notice.sections.find((section) => section.key === "period")?.text;
  const eligibility = notice.sections.find((section) => section.key === "eligibility")?.text;
  const field = notice.sections.find((section) => section.key === "field")?.text;
  const method = notice.sections.find((section) => section.key === "method")?.text;
  const contact = notice.sections.find((section) => section.key === "contact")?.text;
  const imageNote = notice.images.length > 0
    ? `이미지 공고 ${notice.images.length}개가 감지되어 Reader 추출 텍스트와 이미지 원문을 함께 검수해야 합니다.`
    : "이미지 공고 후보는 감지되지 않았습니다.";

  return {
    notice,
    summary:
      `${notice.title} 공고입니다.\n` +
      `- 핵심 일정: ${fallbackText("신청 기간", period)}\n` +
      `- 대상/자격: ${fallbackText("지원 자격", eligibility)}\n` +
      `- 신청/지원: ${fallbackText("신청 방법", method)}\n` +
      `- 검수 메모: ${imageNote}`,
    faq:
      `Q. 신청 기간은 언제인가요?\nA. ${fallbackText("신청 기간", period)}\n\n` +
      `Q. 누가 신청할 수 있나요?\nA. ${fallbackText("지원 자격", eligibility)}\n\n` +
      `Q. 모집 분야 또는 인원은 어떻게 되나요?\nA. ${fallbackText("모집 분야", field)}\n\n` +
      `Q. 신청 방법은 무엇인가요?\nA. ${fallbackText("신청 방법", method)}\n\n` +
      `Q. 문의는 어디로 하나요?\nA. ${fallbackText("문의처", contact)}`,
    evidence:
      `출처 URL: ${notice.sourceUrl}\n` +
      notice.sections
        .map((section) => `근거. ${section.label}: ${fallbackText(section.label, section.text)}`)
        .join("\n") +
      (notice.images.length > 0 ? `\n이미지/첨부 후보:\n${notice.images.map((url) => `- ${url}`).join("\n")}` : "") +
      `\n\n원문 추출 일부:\n${notice.bodyPreview.slice(0, 1200)}`,
  };
}

function createDraftNoticeFromMock(mockNotice) {
  const sections = [
    { key: "period", label: "신청 기간", text: mockNotice.facts.period },
    { key: "eligibility", label: "지원 자격", text: mockNotice.facts.eligibility },
    { key: "field", label: "모집 분야", text: mockNotice.facts.field },
    { key: "method", label: "신청 방법", text: mockNotice.facts.documents },
    { key: "contact", label: "문의처", text: mockNotice.department },
  ];

  return {
    ...mockNotice,
    sourceTitle: mockNotice.title,
    sourcePrefix: "학교 홈페이지 공고",
    isMockChoice: true,
    dataMethod: "학교 공고 선택",
    date: mockNotice.publishedAt,
    sections,
    images: [],
    bodyPreview:
      `${mockNotice.title}\n\n${mockNotice.summary}\n\n` +
      sections.map((section) => `${section.label}: ${section.text}`).join("\n"),
  };
}

function createNoticeId(title, sourceUrl) {
  const slug = `${title}-${sourceUrl}`
    .toLocaleLowerCase("ko-KR")
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `published-${slug || Date.now()}`;
}

function parseFaqDraft(text) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const faqs = blocks.map((block, index) => {
    const question = block.match(/^Q\.\s*(.+)$/m)?.[1]?.trim() || `질문 ${index + 1}`;
    const answer = block.match(/^A\.\s*([\s\S]+)$/m)?.[1]?.trim() || "관리자 검수 후 답변을 입력해 주세요.";
    return {
      id: `published-faq-${index + 1}`,
      question,
      answer,
      source: "관리자 검수 초안",
    };
  });

  return faqs.length > 0 ? faqs : [
    {
      id: "published-faq-1",
      question: "공고 내용을 어디서 확인하나요?",
      answer: "공식 공고 원문과 관리자 검수 초안을 함께 확인해 주세요.",
      source: "관리자 검수 초안",
    },
  ];
}

function extractFactFromSummary(summary, label, fallback) {
  const match = summary.match(new RegExp(`- ${label}:\\s*(.+)`));
  return match?.[1]?.trim() || fallback;
}

function loadPublishedNotices() {
  try {
    return JSON.parse(window.localStorage.getItem(PUBLISHED_NOTICES_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadDeletedNoticeIds() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(DELETED_NOTICES_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveDeletedNoticeIds(deletedIds) {
  window.localStorage.setItem(DELETED_NOTICES_KEY, JSON.stringify([...deletedIds]));
}

function savePublishedNotices(notices) {
  window.localStorage.setItem(PUBLISHED_NOTICES_KEY, JSON.stringify(notices));
}

async function hydrateFirestoreAdminData() {
  const store = window.KANGNAM_NOTICE_STORE;
  if (!store) return;

  try {
    const [noticeResult, adminResult] = await Promise.all([
      store.loadAllNotices(),
      currentRole === "owner"
        ? store.loadAdmins()
        : Promise.resolve({ admins: [], source: "local" }),
    ]);

    if (noticeResult.source === "firestore") {
      savePublishedNotices(noticeResult.notices);
    }
    if (adminResult.source === "firestore" || adminResult.source === "cloudflare-d1") {
      managedMembers = adminResult.admins.map((admin) => ({
        email: admin.email,
        role: admin.role,
        source: adminResult.source,
      }));
      const bootstrapEmail = getBootstrapAdminEmail();
      const hasBootstrap = managedMembers.some((member) => normalizeMemberEmail(member.email) === bootstrapEmail);
      if (bootstrapEmail && !hasBootstrap) {
        managedMembers.push({ email: bootstrapEmail, role: "owner", source: "bootstrap" });
      }
      saveManagedMembers();
    }
    renderPublishedNotices();
    renderMembers();
    setAdminNote("Firestore 공용 데이터를 최신 상태로 불러왔습니다.");
  } catch (error) {
    setAdminNote(`${store.getFriendlyError(error)} 저장된 관리자 화면 데이터를 대신 표시합니다.`);
  }
}

async function saveNoticeToSharedStore(notice) {
  const store = window.KANGNAM_NOTICE_STORE;
  if (!store?.saveNotice) return { saved: false, source: "local" };
  return store.saveNotice(notice);
}

async function deleteNoticeFromSharedStore(noticeId) {
  const store = window.KANGNAM_NOTICE_STORE;
  if (!store?.deleteNotice) return { deleted: false, source: "local" };
  return store.deleteNotice(noticeId);
}

function normalizeRecruitmentStatus(status) {
  if (RECRUITMENT_STATUSES.includes(status)) return status;
  if (!status) return "모집 중";
  if (status.includes("예정")) return "모집 예정";
  if (status.includes("마감")) return "마감";
  if (status.includes("모집")) return "모집 중";
  return "모집 중";
}

function getGeneratedEligibilityFields(baseNotice) {
  return {
    eligibleEnrollmentStatus: Array.isArray(baseNotice.eligibleEnrollmentStatus) ? baseNotice.eligibleEnrollmentStatus : [],
    eligibleGrades: baseNotice.eligibleGrades || "",
    transferStudentEligible: baseNotice.transferStudentEligible ?? null,
    graduateEligible: baseNotice.graduateEligible ?? null,
  };
}

function getManageableNotices() {
  const deletedIds = loadDeletedNoticeIds();
  const merged = [...loadPublishedNotices(), ...ADMIN_DEFAULT_NOTICES];
  return merged
    .filter((notice, index, list) => list.findIndex((item) => item.id === notice.id) === index)
    .filter((notice) => notice.approvalStatus || !deletedIds.has(notice.id));
}

function getNoticeApprovalStatus(notice) {
  return notice.approvalStatus || (notice.isPublished === false ? "draft" : "published");
}

function getVisibleManagedNotices() {
  const notices = getManageableNotices();
  if (adminPage.publishActionBar) {
    return notices.filter((notice) => getNoticeApprovalStatus(notice) === "declined");
  }
  if (adminPage.savePublishedButton || adminPage.deletePublishedButton) {
    return notices.filter((notice) => getNoticeApprovalStatus(notice) === "published");
  }
  return notices;
}

function getPublishedListEmptyMessage() {
  if (adminPage.publishActionBar) return "아직 보류된 공고가 없습니다.";
  if (adminPage.savePublishedButton || adminPage.deletePublishedButton) return "아직 공개된 공고가 없습니다.";
  return "표시할 공고가 없습니다.";
}

function buildModeratedNotice(baseNotice, approvalStatus) {
  if (!baseNotice) return null;
  const title = adminPage.title?.value.trim() || baseNotice.title;
  const summary = adminPage.summary.value.trim();
  const faq = adminPage.faq.value.trim();
  const sourceUrl = getOfficialNoticeSourceUrl(baseNotice.sourceUrl);
  if (!sourceUrl) {
    setAdminNote(OFFICIAL_NOTICE_SOURCE_ERROR);
    return null;
  }
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");

  return {
    id: baseNotice.id || createNoticeId(title, sourceUrl),
    title,
    category: baseNotice.category || "대학생활",
    department: extractFactFromSummary(adminPage.evidence.value, "문의처", baseNotice.sections?.find((section) => section.key === "contact")?.text || baseNotice.department || "담당 부서 확인 필요"),
    date: baseNotice.date || today,
    status: approvalStatus === "published" ? (baseNotice.status || "공개됨") : "검수 중",
    recruitmentStatus: normalizeRecruitmentStatus(baseNotice.recruitmentStatus || baseNotice.status),
    ...getGeneratedEligibilityFields(baseNotice),
    approvalStatus,
    sourcePrefix: "관리자 검수 공고",
    sourceTitle: baseNotice.sourceTitle || title,
    sourceUrl,
    sourceImageUrl: baseNotice.sourceImageUrl || baseNotice.imageUrls?.[0] || baseNotice.images?.[0] || "",
    imageUrls: [...new Set([...(baseNotice.imageUrls || []), ...(baseNotice.images || []), baseNotice.sourceImageUrl || ""].filter(Boolean))],
    publishedAt: baseNotice.publishedAt || baseNotice.date || today,
    sourceType: baseNotice.sourceType || (baseNotice.images?.length > 0 ? "image" : "html"),
    dataMethod: baseNotice.isMockChoice ? "학교 공고 선택" : "AI 초안",
    reviewed: approvalStatus === "published",
    reviewedAt: approvalStatus === "published" ? today : "",
    summary: summary || `${title} 공고입니다. 공식 원문과 관리자 검수 내용을 함께 확인해 주세요.`,
    originalContent: baseNotice.originalContent || summary || baseNotice.bodyPreview || "",
    originalSections: Array.isArray(baseNotice.originalSections) ? baseNotice.originalSections : [],
    facts: {
      period: extractFactFromSummary(summary, "핵심 일정", "공식 공고 원문 확인"),
      eligibility: extractFactFromSummary(summary, "대상/자격", "공식 공고 원문 확인"),
      field: extractFactFromSummary(summary, "신청/지원", "공식 공고 원문 확인"),
      documents: extractFactFromSummary(summary, "신청/지원", "공식 공고 원문 확인"),
      operation: baseNotice.sections?.find((section) => section.key === "period")?.text || "공식 공고 원문 확인",
    },
    faqs: parseFaqDraft(faq),
    isPublished: approvalStatus === "published",
    updatedAt: Date.now(),
  };
}

async function saveModeratedNotice(approvalStatus) {
  const moderatedNotice = buildModeratedNotice(currentDraftNotice, approvalStatus);
  if (!moderatedNotice) return null;

  try {
    await saveNoticeToSharedStore(moderatedNotice);
  } catch (error) {
    setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
    return null;
  }

  const notices = loadPublishedNotices().filter((notice) => notice.id !== moderatedNotice.id);
  notices.unshift(moderatedNotice);
  savePublishedNotices(notices.slice(0, 20));
  const deletedIds = loadDeletedNoticeIds();
  if (approvalStatus === "published") {
    deletedIds.delete(moderatedNotice.id);
  } else {
    deletedIds.add(moderatedNotice.id);
  }
  saveDeletedNoticeIds(deletedIds);
  selectedPublishedId = moderatedNotice.id;
  currentDraftNotice = moderatedNotice;
  renderPublishedNotices();
  renderMockSchoolNotices();
  updateApprovalState();
  return moderatedNotice;
}

function renderPublishedNotices() {
  if (!adminPage.publishedList) return;
  const notices = getVisibleManagedNotices();

  adminPage.publishedCountChip.textContent = `${notices.length}개`;
  if (notices.length === 0) {
    adminPage.publishedList.innerHTML = `<p class="member-empty">${getPublishedListEmptyMessage()}</p>`;
    selectedPublishedId = "";
    selectedPublishedIds = new Set();
    updateApprovalState();
    return;
  }

  if (!notices.some((notice) => notice.id === selectedPublishedId)) {
    selectedPublishedId = "";
  }

  adminPage.publishedList.replaceChildren(
    ...notices.map((notice) => {
      const row = document.createElement("div");
      const checkboxLabel = document.createElement("label");
      const checkbox = document.createElement("input");
      const checkboxText = document.createElement("span");
      const button = document.createElement("button");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      const state = document.createElement("small");
      row.className = "published-row";
      checkboxLabel.className = "bulk-item-check";
      checkbox.type = "checkbox";
      checkbox.className = "published-checkbox";
      checkbox.dataset.noticeId = notice.id;
      checkbox.checked = selectedPublishedIds.has(notice.id);
      checkbox.setAttribute("aria-label", `${notice.title} 일괄 선택`);
      checkboxText.textContent = "선택";
      checkboxLabel.append(checkbox, checkboxText);
      checkbox.addEventListener("change", () => togglePublishedBulkSelection(notice.id, checkbox.checked));
      button.type = "button";
      button.className = "published-item";
      button.dataset.noticeId = notice.id;
      button.dataset.approvalStatus = getNoticeApprovalStatus(notice);
      if (notice.id === selectedPublishedId) button.setAttribute("aria-current", "true");
      title.textContent = notice.title;
      meta.textContent = `${notice.department} · ${notice.date}${notice.approvalStatus ? "" : " · 기본 공고"}`;
      state.className = "approval-state-label";
      state.textContent = APPROVAL_STATUS_LABELS[getNoticeApprovalStatus(notice)] || "공개";
      button.append(title, meta, state);
      button.addEventListener("click", () => selectPublishedNotice(notice.id));
      row.append(checkboxLabel, button);
      return row;
    }),
  );
  updatePublishedBulkState();
  updateApprovalState();
}

function formatFaqDraft(faqs) {
  return faqs.map((faq) => `Q. ${faq.question}\nA. ${faq.answer}`).join("\n\n");
}

function selectPublishedNotice(noticeId) {
  const notice = getVisibleManagedNotices().find((item) => item.id === noticeId);
  if (!notice || !canEditAndPublish()) return;

  publishActionBarDismissed = false;
  selectedPublishedId = notice.id;
  currentDraftNotice = notice;
  generatedDraftUrl = notice.sourceUrl;
  adminPage.urlInput.value = notice.sourceUrl;
  adminPage.empty.hidden = true;
  adminPage.fields.hidden = false;
  if (adminPage.title) adminPage.title.value = notice.title;
  adminPage.summary.value = notice.summary;
  adminPage.faq.value = formatFaqDraft(notice.faqs || []);
  adminPage.evidence.value = `출처 URL: ${notice.sourceUrl}\n근거. 신청 기간: ${notice.facts?.period || "공식 공고 원문 확인"}\n근거. 지원 자격: ${notice.facts?.eligibility || "공식 공고 원문 확인"}\n근거. 신청/지원: ${notice.facts?.field || "공식 공고 원문 확인"}`;
  setApprovalStatus(notice.approvalStatus || "published");
  setAdminNote(adminPage.publishActionBar
    ? "보류된 공고를 불러왔습니다. 내용을 다시 검수해 공개하거나 계속 보류할 수 있습니다."
    : "공개된 공고를 불러왔습니다. 수정 후 저장하거나 삭제할 수 있습니다.");
  renderPublishedNotices();
  updateApprovalState();
}

async function handlePublishedSave() {
  if (!canEditAndPublish() || !selectedPublishedId || !currentDraftNotice) return;
  const updatedNotice = buildModeratedNotice(currentDraftNotice, currentDraftNotice.approvalStatus || currentApprovalStatus);
  if (!updatedNotice) return;

  try {
    await saveNoticeToSharedStore(updatedNotice);
  } catch (error) {
    setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
    return;
  }

  const notices = loadPublishedNotices().filter((notice) => notice.id !== selectedPublishedId);
  notices.unshift(updatedNotice);
  savePublishedNotices(notices);
  const deletedIds = loadDeletedNoticeIds();
  if ((updatedNotice.approvalStatus || "published") === "published") {
    deletedIds.delete(updatedNotice.id);
  } else {
    deletedIds.add(updatedNotice.id);
  }
  saveDeletedNoticeIds(deletedIds);
  setAdminNote("공개된 공고 수정 사항을 저장했습니다.");
  setApprovalStatus(updatedNotice.approvalStatus || "draft");
  renderPublishedNotices();
  updateApprovalState();
}

async function handlePublishedDelete() {
  if (!canEditAndPublish() || !selectedPublishedId) return;
  const notice = getVisibleManagedNotices().find((item) => item.id === selectedPublishedId);
  const title = notice?.title || "선택한 공고";
  const confirmed = window.confirm(`"${title}" 공고를 삭제할까요?\n삭제하면 학생 페이지 목록과 상세 페이지에서 보이지 않습니다.`);
  if (!confirmed) return;

  try {
    await deleteNoticeFromSharedStore(selectedPublishedId);
  } catch (error) {
    setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
    return;
  }

  const notices = loadPublishedNotices().filter((notice) => notice.id !== selectedPublishedId);
  savePublishedNotices(notices);
  const deletedIds = loadDeletedNoticeIds();
  deletedIds.add(selectedPublishedId);
  saveDeletedNoticeIds(deletedIds);
  selectedPublishedId = "";
  currentDraftNotice = null;
  generatedDraftUrl = "";
  adminPage.urlInput.value = "";
  adminPage.empty.hidden = false;
  adminPage.fields.hidden = true;
  if (adminPage.title) adminPage.title.value = "";
  adminPage.summary.value = "";
  adminPage.faq.value = "";
  adminPage.evidence.value = "";
  setApprovalStatus("draft");
  setAdminNote("공개된 공고를 삭제했습니다.");
  renderPublishedNotices();
  updateApprovalState();
}

function resetPublishedEditorState(message) {
  selectedPublishedId = "";
  currentDraftNotice = null;
  generatedDraftUrl = "";
  if (adminPage.urlInput) adminPage.urlInput.value = "";
  if (adminPage.empty) adminPage.empty.hidden = false;
  if (adminPage.fields) adminPage.fields.hidden = true;
  if (adminPage.title) adminPage.title.value = "";
  if (adminPage.summary) adminPage.summary.value = "";
  if (adminPage.faq) adminPage.faq.value = "";
  if (adminPage.evidence) adminPage.evidence.value = "";
  setApprovalStatus("draft");
  setAdminNote(message);
}

function buildBulkApprovalNotice(baseNotice, approvalStatus) {
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");
  return {
    ...baseNotice,
    approvalStatus,
    status: approvalStatus === "published" ? (baseNotice.status && baseNotice.status !== "검수 중" ? baseNotice.status : "공개됨") : "검수 중",
    reviewed: approvalStatus === "published",
    reviewedAt: approvalStatus === "published" ? today : "",
    isPublished: approvalStatus === "published",
    updatedAt: Date.now(),
  };
}

async function handlePublishedBulkStatus(approvalStatus) {
  if (!canEditAndPublish()) return;
  const selectedNotices = getSelectedPublishedNotices();
  if (selectedNotices.length === 0) return;

  const updatedNotices = selectedNotices.map((notice) => buildBulkApprovalNotice(notice, approvalStatus));
  for (const notice of updatedNotices) {
    try {
      await saveNoticeToSharedStore(notice);
    } catch (error) {
      setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
      return;
    }
  }

  const updatedIds = new Set(updatedNotices.map((notice) => notice.id));
  const remainingNotices = loadPublishedNotices().filter((notice) => !updatedIds.has(notice.id));
  savePublishedNotices([...updatedNotices, ...remainingNotices].slice(0, 20));
  const deletedIds = loadDeletedNoticeIds();
  updatedNotices.forEach((notice) => {
    if (approvalStatus === "published") {
      deletedIds.delete(notice.id);
    } else {
      deletedIds.add(notice.id);
    }
  });
  saveDeletedNoticeIds(deletedIds);

  const changedCount = updatedNotices.length;
  selectedPublishedIds = new Set();
  if (updatedIds.has(selectedPublishedId)) {
    resetPublishedEditorState(approvalStatus === "published"
      ? `${changedCount}개 공고를 공개 상태로 변경했습니다.`
      : `${changedCount}개 공고를 보류 상태로 변경했습니다.`);
  } else {
    setAdminNote(approvalStatus === "published"
      ? `${changedCount}개 공고를 공개 상태로 변경했습니다.`
      : `${changedCount}개 공고를 보류 상태로 변경했습니다.`);
  }
  renderPublishedNotices();
  renderMockSchoolNotices();
  updateApprovalState();
  showPublishCompletionToast(approvalStatus === "published"
    ? `${changedCount}개 공고를 공개했습니다.`
    : `${changedCount}개 공고를 보류했습니다.`,
  approvalStatus === "published" ? "success" : "danger");
}

async function handlePublishedBulkDelete() {
  if (!canEditAndPublish()) return;
  const selectedNotices = getSelectedPublishedNotices();
  if (selectedNotices.length === 0) return;
  const confirmed = window.confirm(`선택한 ${selectedNotices.length}개 공고를 삭제할까요?\n삭제하면 학생 페이지 목록과 상세 페이지에서 보이지 않습니다.`);
  if (!confirmed) return;

  for (const notice of selectedNotices) {
    try {
      await deleteNoticeFromSharedStore(notice.id);
    } catch (error) {
      setAdminNote(window.KANGNAM_NOTICE_STORE?.getFriendlyError(error) || error.message);
      return;
    }
  }

  const deletedIdsToApply = new Set(selectedNotices.map((notice) => notice.id));
  const notices = loadPublishedNotices().filter((notice) => !deletedIdsToApply.has(notice.id));
  savePublishedNotices(notices);
  const deletedIds = loadDeletedNoticeIds();
  deletedIdsToApply.forEach((noticeId) => deletedIds.add(noticeId));
  saveDeletedNoticeIds(deletedIds);
  selectedPublishedIds = new Set();
  resetPublishedEditorState(`${deletedIdsToApply.size}개 공고를 삭제했습니다.`);
  renderPublishedNotices();
  renderMockSchoolNotices();
  updateApprovalState();
  showPublishCompletionToast(`${deletedIdsToApply.size}개 공고를 삭제했습니다.`, "danger");
}

async function fetchNoticeMarkdown(url) {
  const response = await fetch(buildReaderUrl(url), {
    headers: { Accept: "text/plain" },
  });

  if (!response.ok) {
    throw new Error(`공식 링크를 읽지 못했습니다. HTTP ${response.status}`);
  }

  return response.text();
}

async function generateDraft() {
  if (!canEditAndPublish()) return;

  if (noticeInputMode === "url" && !adminPage.urlInput?.value.trim()) {
    setAdminNote("공고 URL을 입력하거나 공고를 선택해 주세요.");
    setApprovalStatus("draft");
    return;
  }

  if (noticeInputMode === "list" && !selectedMockNoticeId) {
    setAdminNote("공고 URL을 입력하거나 공고를 선택해 주세요.");
    setApprovalStatus("draft");
    return;
  }

  publishActionBarDismissed = false;
  if (adminPage.chip) adminPage.chip.textContent = "생성 중";
  adminPage.generateButton.disabled = true;
  updatePublishActionBar();
  adminPage.note.textContent = noticeInputMode === "url"
    ? "공식 링크의 텍스트와 이미지 공고 후보를 수집하고 있습니다."
    : "선택한 학교 공고를 바탕으로 초안을 생성하고 있습니다.";

  try {
    if (noticeInputMode === "list") {
      const selectedNotice = getSelectedMockNotice();
      const notice = createDraftNoticeFromMock(selectedNotice);
      const draft = createDraftFromNotice(notice);
      currentDraftNotice = notice;
      generatedDraftUrl = notice.sourceUrl;

      adminPage.empty.hidden = true;
      adminPage.fields.hidden = false;
      adminPage.title.value = notice.title;
      adminPage.summary.value = draft.summary;
      adminPage.faq.value = draft.faq;
      adminPage.evidence.value = draft.evidence;
      setApprovalStatus("review");
      adminPage.note.textContent = `${notice.title} 공고 기준으로 생성했습니다. 원문과 세부 내용을 확인한 뒤 공개해 주세요.`;
      updateApprovalState();
      showPublishCompletionToast("초안 생성을 완료했습니다.");
      return;
    }

    const sourceUrl = getOfficialNoticeSourceUrl(adminPage.urlInput?.value.trim());
    if (!sourceUrl) throw new Error("강남대학교 공식 공고 상세 URL을 입력해 주세요.");
    adminPage.urlInput.value = sourceUrl;

    const markdown = await fetchNoticeMarkdown(sourceUrl);
    const notice = analyzeNotice(markdown, sourceUrl);
    const draft = createDraftFromNotice(notice);
    currentDraftNotice = notice;

    adminPage.empty.hidden = true;
    adminPage.fields.hidden = false;
    adminPage.title.value = notice.title;
    adminPage.summary.value = draft.summary;
    adminPage.faq.value = draft.faq;
    adminPage.evidence.value = draft.evidence;
    setApprovalStatus("review");
    generatedDraftUrl = sourceUrl;
    adminPage.note.textContent = `${notice.title} 기준으로 생성했습니다. 이미지 공고가 포함된 경우 원문 이미지와 함께 검수해 주세요.`;
    updateApprovalState();
    showPublishCompletionToast("초안 생성을 완료했습니다.");
  } catch (error) {
    if (adminPage.chip) adminPage.chip.textContent = "생성 실패";
    adminPage.note.textContent = `${error.message} Firebase Functions 없이 Hosting만 쓰는 현재 배포에서는 일부 링크가 브라우저 보안 정책에 막힐 수 있습니다.`;
  } finally {
    adminPage.generateButton.disabled = false;
    updatePublishActionBar();
  }
}

async function handleDraftGeneration(event) {
  event.preventDefault();
  await generateDraft();
}

async function handleDraftApproval() {
  if (!canEditAndPublish()) return;
  const notice = await saveModeratedNotice("published");
  if (!notice) return;
  setApprovalStatus("published");
  adminPage.note.textContent = "공고가 학생에게 공개되었습니다.";
  adminPage.approveButton.textContent = "공개 승인";
  showPublishCompletionToast("공고 공개 승인을 완료했습니다.");
}

async function handleDraftDecline() {
  if (!canEditAndPublish()) return;
  const notice = await saveModeratedNotice("declined");
  if (!notice) return;
  selectedMockNoticeId = "";
  if (adminPage.urlInput) adminPage.urlInput.value = "";
  resetDraftSelectionState(noticeInputMode === "list"
    ? "공고를 선택해 초안을 생성해 주세요."
    : "공식 공고 URL을 입력해 주세요.");
  renderMockSchoolNotices();
  updateApprovalState();
  showPublishCompletionToast("공고를 보류했습니다.", "danger");
}

async function handleLogout() {
  const firebase = window.KANGNAM_FIREBASE;
  if (firebase) await firebase.signOut();
  window.location.assign("./index.html");
}

async function initAuth() {
  const access = window.KANGNAM_ADMIN_ACCESS;
  if (!access?.ready) {
    currentUser = null;
    currentRole = "viewer";
    updateAccess();
    return;
  }

  const result = await access.ready;
  if (!result.allowed) return;
  currentUser = result.user;
  currentRole = result.role;
  managedMembers = loadManagedMembers();
  updateAccess();
  await hydrateFirestoreAdminData();
}

adminPage.logoutButton?.addEventListener("click", handleLogout);
adminPage.memberForm?.addEventListener("submit", handleMemberSubmit);
adminPage.form?.addEventListener("submit", handleDraftGeneration);
adminPage.urlInput?.addEventListener("input", resetDraftForUrlChange);
adminPage.loadSchoolNoticesButton?.addEventListener("click", () => loadSchoolNoticeList());
adminPage.simulateSchoolErrorButton?.addEventListener("click", () => loadSchoolNoticeList({ simulateError: true }));
adminPage.inputModeRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) setNoticeInputMode(radio.value);
  });
});
adminPage.savePublishedButton?.addEventListener("click", handlePublishedSave);
adminPage.deletePublishedButton?.addEventListener("click", handlePublishedDelete);
adminPage.publishedSelectAll?.addEventListener("change", handlePublishedSelectAllChange);
adminPage.bulkDeletePublishedButton?.addEventListener("click", handlePublishedBulkDelete);
adminPage.bulkDeclinePublishedButton?.addEventListener("click", () => handlePublishedBulkStatus("declined"));
adminPage.bulkPublishPublishedButton?.addEventListener("click", () => handlePublishedBulkStatus("published"));
adminPage.publishActionClose?.addEventListener("click", handlePublishActionBarClose);
clearLegacyDefaultNoticeUrl();
renderMockSchoolNotices();
adminPage.approveButton?.addEventListener("click", handleDraftApproval);
adminPage.declineButton?.addEventListener("click", handleDraftDecline);
window.addEventListener("kangnam-firebase-ready", initAuth, { once: true });
initAuth();
