"use strict";

const SAMPLE_NOTICE = Object.freeze({
  title: "2026학년도 비교과 프로그램 모집",
  department: "비교과교육센터",
  sourcePrefix: "2026학년도 비교과 프로그램 모집 공고문",
});

const FAQS = Object.freeze([
  {
    id: "application-period",
    question: "신청 기간은 언제인가요?",
    answer: "신청 기간은 7월 20일부터 7월 31일까지입니다. 마감일 이후에는 신청할 수 없습니다.",
    source: "신청 안내 > 신청 기간",
  },
  {
    id: "required-documents",
    question: "제출 서류는 무엇인가요?",
    answer: "온라인 신청서와 재학증명서가 필요합니다. 두 서류 모두 신청 기간 안에 제출해 주세요.",
    source: "신청 안내 > 제출 서류",
  },
  {
    id: "contact",
    question: "문의처는 어디인가요?",
    answer: "비교과교육센터에서 문의를 받습니다. 가상 연락처는 031-000-0000이며, 운영시간은 평일 09:00부터 17:00까지입니다.",
    source: "공고문 하단 > 담당 부서 안내",
  },
]);

const ANSWER_RULES = Object.freeze([
  {
    keywords: ["휴학생", "휴학"],
    answer: "휴학생은 신청 대상이 아닙니다. 이번 프로그램은 신청일 기준 재학생을 대상으로 합니다.",
    source: "신청 자격 > 지원 대상",
  },
  {
    keywords: ["편입생", "편입"],
    answer: "편입생은 신청 가능합니다. 신청일 기준 재학 중이라면 다른 재학생과 같은 절차로 신청할 수 있습니다.",
    source: "신청 자격 > 지원 대상",
  },
  {
    keywords: ["신청기간", "신청일", "기간", "언제", "마감"],
    answer: FAQS[0].answer,
    source: FAQS[0].source,
  },
  {
    keywords: ["제출서류", "서류", "준비물", "재학증명서"],
    answer: FAQS[1].answer,
    source: FAQS[1].source,
  },
  {
    keywords: ["문의처", "문의", "연락처", "전화", "담당부서"],
    answer: FAQS[2].answer,
    source: FAQS[2].source,
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
