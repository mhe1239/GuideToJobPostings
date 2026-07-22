"use strict";

const SAMPLE_NOTICE = Object.freeze({
  title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집",
  department: "입학전형관리팀",
  sourcePrefix: "공식 공고 카드뉴스",
});

const FAQS = Object.freeze([
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
]);

const ANSWER_RULES = Object.freeze([
  {
    keywords: ["휴학생", "휴학"],
    answer: "공고에는 지원 자격이 재학생 및 편입생으로 안내되어 있습니다. 휴학생 지원 가능 여부는 공식 공고의 문의처를 통해 추가로 확인해 주세요.",
    source: "지원 자격",
  },
  {
    keywords: ["편입생", "편입"],
    answer: "편입생은 지원할 수 있습니다. 공고의 다른 활동 조건도 함께 확인해 주세요.",
    source: "지원 자격",
  },
  {
    keywords: ["신청기간", "신청일", "기간", "언제", "마감"],
    answer: FAQS[0].answer,
    source: FAQS[0].source,
  },
  {
    keywords: ["지원자격", "자격", "대상", "재학생", "연속활동"],
    answer: FAQS[1].answer,
    source: FAQS[1].source,
  },
  {
    keywords: ["모집분야", "분야", "기획국", "홍보국", "콘텐츠", "디자인", "인원"],
    answer: FAQS[2].answer,
    source: FAQS[2].source,
  },
  {
    keywords: ["회의", "정기회의", "활동시간", "월요일"],
    answer: "학기 중 정기회의는 매주 월요일 17시 40분, 방학 중 정기회의는 격주 월요일 12시입니다. 정기회의 참석이 가능해야 합니다.",
    source: "지원 자격 > 정기회의 참석 조건",
  },
  {
    keywords: ["학생회", "중복활동", "겸직"],
    answer: "학생회 활동과 병행할 수 없습니다.",
    source: "지원 자격 > 활동 제한",
  },
  {
    keywords: ["지원방법", "신청방법", "어떻게", "qr", "큐알"],
    answer: "카드뉴스 하단 QR 코드로 신청서를 작성해 제출합니다. 정확한 신청 경로는 공식 공고 원문 링크에서 확인해 주세요.",
    source: "지원 방법",
  },
  {
    keywords: ["문의처", "문의", "연락처", "전화", "담당부서"],
    answer: "담당 부서는 입학전형관리팀입니다. 개인정보 보호를 위해 연락처는 앱에 복사하지 않았으니 공식 공고의 문의처를 확인해 주세요.",
    source: "공고 등록 부서 및 문의처",
  },
]);

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
  elements.answerSource.textContent = `${SAMPLE_NOTICE.sourcePrefix} > ${result.source}`;
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

renderFaqs();
updateQuestionCount();

const adminReview = {
  authForm: document.querySelector("#auth-form"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
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
  } else {
    title.textContent = `${currentUser.email} · ${ROLE_LABELS[currentRole]}`;
    subtitle.textContent = currentRole === "owner"
      ? "관리자 관리, 초안 수정, 학생 공개를 모두 사용할 수 있습니다."
      : currentRole === "editor"
        ? "초안 수정과 학생 공개를 사용할 수 있습니다."
        : "학생 보기 권한입니다. 관리자 작업은 잠겨 있습니다.";
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

async function handleEmailLogin(event) {
  event.preventDefault();
  const firebase = window.KANGNAM_FIREBASE;
  const email = adminReview.authEmail.value.trim();
  const password = adminReview.authPassword.value;

  if (!firebase) {
    setAuthMessage("Firebase 설정을 불러오지 못했습니다. 배포 환경에서 다시 시도해 주세요.");
    return;
  }

  try {
    await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      setAuthMessage("로그인 정보가 맞지 않습니다. Firebase Authentication에 등록된 계정인지 확인해 주세요.");
    } else {
      setAuthMessage(error.message);
    }
  }
}

async function handleGoogleLogin() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setAuthMessage("Firebase 설정을 불러오지 못했습니다. 배포 환경에서 다시 시도해 주세요.");
    return;
  }

  try {
    await firebase.signInWithPopup();
  } catch (error) {
    setAuthMessage(error.message);
  }
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
  adminReview.authForm.addEventListener("submit", handleEmailLogin);
  adminReview.googleLoginButton.addEventListener("click", handleGoogleLogin);
  adminReview.logoutButton.addEventListener("click", handleLogout);
  adminReview.memberForm.addEventListener("submit", handleMemberSubmit);
  adminReview.form.addEventListener("submit", handleDraftGeneration);
  adminReview.checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateApprovalState));
  adminReview.approveButton.addEventListener("click", handleDraftApproval);
  window.addEventListener("kangnam-firebase-ready", initAuth, { once: true });
  initAuth();
}
