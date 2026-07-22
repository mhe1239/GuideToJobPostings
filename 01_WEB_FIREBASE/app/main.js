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
