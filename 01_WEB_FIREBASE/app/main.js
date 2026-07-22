"use strict";

const PUBLISHED_NOTICES_KEY = "kangnamPublishedNotices";
const DELETED_NOTICES_KEY = "kangnamDeletedNoticeIds";

const DEFAULT_NOTICES = Object.freeze([
  {
    id: "neulpum-2026",
    title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집",
    category: "비교과 프로그램",
    department: "입학전형관리팀",
    date: "2026.07.20",
    status: "모집 중",
    sourcePrefix: "공식 공고 카드뉴스",
    sourceUrl: "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9",
    summary: "강남대학교 입학처 공식 홍보대사 늘품의 2026학년도 2학기 수습 임원을 모집합니다. 공식 카드뉴스 공고의 핵심 내용을 확인한 뒤 FAQ 또는 질문하기를 이용해 주세요.",
    facts: {
      period: "7월 20일(월)–8월 2일(일) 17:00",
      eligibility: "강남대학교 재학생 및 편입생",
      field: "기획국·대외홍보국·콘텐츠디자인국",
    },
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
    category: "대학생활",
    department: "학생지원 관련 부서",
    date: "2026.07.20",
    status: "안내",
    sourcePrefix: "공식 공고 원문",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    summary: "외부 기관 자격검정 시행 안내 공고입니다. 신청 기간, 응시 자격, 접수 방법은 공식 공고 원문에서 확인해야 합니다.",
    facts: {
      period: "공식 공고 원문 확인",
      eligibility: "자격검정 응시 희망자",
      field: "인터넷중독전문상담사",
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
    category: "대학생활",
    department: "학생지원 관련 부서",
    date: "2026.07.16",
    status: "안내",
    sourcePrefix: "공식 공고 원문",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    summary: "외부 문화 행사 참여 안내 공고입니다. 일정, 장소, 참여 방법은 공식 공고 원문을 기준으로 확인해야 합니다.",
    facts: {
      period: "7월 문화가 있는 날",
      eligibility: "관심 있는 학생",
      field: "재즈 콘서트",
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
    sourcePrefix: "공식 공고 원문",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    summary: "대학생활 적응과 역량 강화를 돕는 비교과 프로그램 참여 안내 공고입니다. 신청 기간과 참여 방법은 공식 공고 원문 기준으로 확인해야 합니다.",
    facts: {
      period: "공식 공고 원문 확인",
      eligibility: "강남대학교 재학생",
      field: "대학생활 지원 비교과 프로그램",
    },
    faqs: [
      { id: "period", question: "신청 기간은 언제인가요?", answer: "정확한 신청 기간은 공식 공고 원문에서 확인해야 합니다.", source: "신청 기간" },
      { id: "eligibility", question: "누가 참여할 수 있나요?", answer: "강남대학교 재학생 대상 프로그램으로 안내됩니다. 세부 제한은 공식 공고 원문을 확인해 주세요.", source: "참여 대상" },
      { id: "method", question: "신청 방법은 무엇인가요?", answer: "공식 공고 원문에 안내된 신청 경로를 확인해 주세요.", source: "신청 방법" },
    ],
  },
]);

let notices = getPublishedNotices();
let activeNotice = getInitialNotice();
let FAQS = activeNotice.faqs;
let ANSWER_RULES = buildAnswerRules(activeNotice);

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
  sourceLineText: document.querySelector("#source-line-text"),
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

  const merged = [...stored, ...DEFAULT_NOTICES];
  return merged
    .filter((notice, index, list) => list.findIndex((item) => item.id === notice.id) === index)
    .filter((notice) => !deletedIds.has(notice.id));
}

function getInitialNotice() {
  const selectedId = new URLSearchParams(window.location.search).get("notice");
  return notices.find((notice) => notice.id === selectedId) || notices[0];
}

function buildAnswerRules(notice) {
  const faqRules = notice.faqs.map((faq) => ({
    keywords: faq.question.split(/[\s?.,·~()[\]{}'"“”‘’_-]+/).filter((word) => word.length >= 2),
    answer: faq.answer,
    source: faq.source,
  }));

  return [
    {
      keywords: ["편입생", "편입"],
      answer: notice.facts.eligibility.includes("편입생")
        ? "편입생은 지원할 수 있습니다. 공고의 다른 활동 조건도 함께 확인해 주세요."
        : notice.facts.eligibility,
      source: "지원 자격",
    },
    {
      keywords: ["휴학생", "휴학"],
      answer: "휴학생 지원 가능 여부는 공식 공고의 지원 자격과 문의처를 통해 추가로 확인해 주세요.",
      source: "지원 자격",
    },
    ...faqRules,
    {
      keywords: ["신청기간", "신청일", "기간", "언제", "마감", "일정"],
      answer: notice.facts.period,
      source: "핵심 정보 > 신청 기간",
    },
    {
      keywords: ["지원자격", "자격", "대상", "재학생", "편입생", "휴학생"],
      answer: notice.facts.eligibility,
      source: "핵심 정보 > 지원 대상",
    },
    {
      keywords: ["모집분야", "분야", "인원", "프로그램", "행사"],
      answer: notice.facts.field,
      source: "핵심 정보 > 모집 분야",
    },
    {
      keywords: ["문의처", "문의", "연락처", "전화", "담당부서"],
      answer: `담당 부서는 ${notice.department}입니다. 정확한 연락처는 공식 공고 원문에서 확인해 주세요.`,
      source: "공고 등록 부서 및 문의처",
    },
  ];
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
      link.innerHTML = `
        <span>${notice.category}</span>
        <strong></strong>
        <small>${notice.department} · ${notice.date}</small>
      `;
      link.querySelector("strong").textContent = notice.title;
      return link;
    }),
  );
}

function selectNotice(noticeId) {
  const nextNotice = notices.find((notice) => notice.id === noticeId);
  if (!nextNotice) return;

  activeNotice = nextNotice;
  FAQS = activeNotice.faqs;
  ANSWER_RULES = buildAnswerRules(activeNotice);
  window.history.replaceState({}, "", `./notice.html?notice=${encodeURIComponent(activeNotice.id)}`);
  renderNotice();
  renderNoticeList();
  renderFaqs();
  resetQuestion();
  elements.notice.focus({ preventScroll: true });
  elements.notice.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderNotice() {
  document.title = `강남대 공고 길잡이 — ${activeNotice.title}`;
  elements.breadcrumbCategory.textContent = activeNotice.category;
  elements.noticeMeta.textContent = `${activeNotice.department} · ${activeNotice.category} · ${activeNotice.date}`;
  elements.noticeTitle.textContent = activeNotice.title;
  elements.heroSummary.textContent = activeNotice.summary;
  elements.statusBadge.lastChild.textContent = ` ${activeNotice.status}`;
  elements.factPeriod.textContent = activeNotice.facts.period;
  elements.factEligibility.textContent = activeNotice.facts.eligibility;
  elements.factField.textContent = activeNotice.facts.field;
  elements.sourceLineText.textContent = activeNotice.isPublished
    ? "관리자가 검수 후 공개한 공고 초안입니다. 세부 내용은 공식 공고 원문과 함께 확인해 주세요."
    : "공식 공고 내용을 확인해 작성한 프로토타입입니다. 답변은 자동 AI·OCR 추출 결과가 아닌 미리 준비된 예시입니다.";
  elements.answerSourceLink.href = activeNotice.sourceUrl;
  elements.departmentSourceLink.href = activeNotice.sourceUrl;
  elements.departmentTitle.textContent = `${activeNotice.department}으로 문의해 주세요`;
  elements.departmentDescription.textContent = "FAQ와 예시 답변으로 해결되지 않은 문의를 담당합니다.";
  elements.contactNote.textContent = `문의 시 “${activeNotice.title}” 공고를 확인했다고 말씀해 주세요.`;
}

function renderFaqs() {
  const fragment = document.createDocumentFragment();

  FAQS.forEach((faq, index) => {
    const button = createElement("button", "faq-item");
    button.type = "button";
    button.dataset.faqId = faq.id;
    button.setAttribute("aria-label", `${faq.question} 예시 답변 보기`);
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

function normalizeQuestion(value) {
  return value
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s?!.,·~()\[\]{}'"“”‘’_-]/g, "");
}

function findExampleAnswer(question) {
  const normalized = normalizeQuestion(question);
  return ANSWER_RULES.find((rule) => rule.keywords.some((keyword) => normalized.includes(normalizeQuestion(keyword)))) ?? null;
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
  elements.answerCard.classList.remove("no-result");
  elements.answerCard.setAttribute("tabindex", "-1");
  elements.askedQuestion.textContent = question;
  elements.answerTitle.textContent = "예시 답변";
  elements.answerCopy.textContent = result.answer;
  elements.answerSource.textContent = `${activeNotice.sourcePrefix} > ${result.source}`;
  elements.answerSourceLink.href = activeNotice.sourceUrl;
  elements.answerState.textContent = "답변 찾음";
  elements.evidenceCard.hidden = false;
  focusResultOnSmallScreen();
}

function showNoResult(question) {
  elements.emptyResult.hidden = true;
  elements.answerCard.hidden = false;
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

function handleQuestionSubmit(event) {
  event.preventDefault();
  const question = elements.questionInput.value.trim();

  clearQuestionError();
  deactivateFaqs();

  if (!question) {
    setQuestionError("질문을 입력해주세요.");
    return;
  }

  try {
    const result = findExampleAnswer(question);
    if (result) {
      showAnswer(question, result);
    } else {
      showNoResult(question);
    }
  } catch (error) {
    console.error("예시 답변 생성 실패", error);
    showNoResult(question);
  }
}

function resetQuestion() {
  elements.questionInput.value = "";
  updateQuestionCount();
  clearQuestionError();
  deactivateFaqs();
  elements.answerCard.hidden = true;
  elements.answerCard.classList.remove("no-result");
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

elements.questionForm.addEventListener("submit", handleQuestionSubmit);
elements.questionInput.addEventListener("input", () => {
  updateQuestionCount();
  if (!elements.questionError.hidden) clearQuestionError();
});
elements.retryButton.addEventListener("click", resetQuestion);
elements.departmentButton.addEventListener("click", showDepartment);
elements.departmentBackButton.addEventListener("click", returnToNotice);

renderNotice();
renderNoticeList();
renderFaqs();
updateQuestionCount();

const adminReview = {
  headerAuthLink: document.querySelector("#header-auth-link"),
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
  viewer: "보기만 가능",
});

const ROLE_RANK = Object.freeze({
  viewer: 0,
  editor: 1,
  owner: 2,
});

let currentUser = null;
let currentRole = "viewer";
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
  if (email) return "owner";
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
    subtitle.textContent = "학생 보기 권한으로 공개된 공고와 FAQ만 볼 수 있습니다.";
    if (adminReview.headerAuthLink) {
      adminReview.headerAuthLink.href = "./login.html";
      adminReview.headerAuthLink.lastChild.textContent = "Google 로그인";
    }
  } else {
    title.textContent = `${currentUser.email} · ${ROLE_LABELS[currentRole]}`;
    subtitle.textContent = currentRole === "owner"
      ? "관리자 관리, 초안 수정, 학생 공개를 모두 사용할 수 있습니다."
      : currentRole === "editor"
        ? "초안 수정과 학생 공개를 사용할 수 있습니다."
        : "학생 보기 권한입니다. 관리자 작업은 잠겨 있습니다.";
    if (adminReview.headerAuthLink) {
      adminReview.headerAuthLink.href = "./admin.html";
      adminReview.headerAuthLink.lastChild.textContent = "관리자 메뉴";
    }
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

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    currentUser = user;
    currentRole = user ? resolveRole(user.email) : "viewer";
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
