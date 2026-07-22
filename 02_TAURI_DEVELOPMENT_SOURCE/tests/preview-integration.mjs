import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Window } from "happy-dom";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("app/index.html", root), "utf8");
const styles = await readFile(new URL("app/styles.css", root), "utf8");
const script = await readFile(new URL("app/main.js", root), "utf8");
const font = await readFile(new URL("app/assets/fonts/PretendardVariable.woff2", root));
const fontLicense = await readFile(new URL("app/assets/fonts/Pretendard-LICENSE.txt", root), "utf8");
const officialNoticeUrl = "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9";

function boot() {
  const window = new Window({ url: "http://127.0.0.1:4173/" });
  const page = html.replace('<script src="./main.js" defer></script>', "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(script);
  return window;
}

function setValue(window, selector, value) {
  const element = window.document.querySelector(selector);
  element.value = value;
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, `${selector} 요소가 있어야 합니다.`);
  element.click();
}

function submit(window) {
  const form = window.document.querySelector("#question-form");
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
}

const window = boot();
const document = window.document;

assert.match(document.querySelector("#notice-title").textContent, /늘품 12기 2학기 수습 임원 모집/, "공식 공고 제목이 표시되어야 합니다.");
assert.equal(document.querySelectorAll(".faq-item").length, 3, "P0 FAQ 3개가 표시되어야 합니다.");
assert.match(document.querySelector(".example-notice").textContent, /실제 AI를 호출하지 않고/, "가상 예시 답변임을 입력 화면에 알려야 합니다.");
assert.match(document.querySelector(".source-line").textContent, /자동 AI·OCR 추출 결과가 아닌/, "이미지 공고가 자동 추출된 결과가 아님을 알려야 합니다.");

click(window, '[data-faq-id="application-period"]');
assert.equal(document.querySelector("#answer-card").hidden, false, "FAQ를 선택하면 결과가 나타나야 합니다.");
assert.match(document.querySelector("#answer-copy").textContent, /8월 2일\(일\) 오후 5시까지/, "FAQ에 맞는 공식 공고 기반 예시 답변이 표시되어야 합니다.");
assert.match(document.querySelector("#answer-source").textContent, /공식 공고 카드뉴스.*1차 서류 접수/, "공고문 출처가 표시되어야 합니다.");
assert.equal(document.querySelector(".example-badge").textContent, "가상 예시 답변", "결과 카드에도 가상 예시 답변 표시가 있어야 합니다.");
assert.equal(document.querySelector("#answer-source-link").href, officialNoticeUrl, "답변 아래 링크가 공식 공고 원문을 가리켜야 합니다.");
assert.equal(document.querySelector("#answer-source-link").target, "_blank", "공식 공고는 새 창에서 열려야 합니다.");
assert.match(document.querySelector("#answer-source-link").rel, /noopener/, "외부 링크는 열린 페이지와 앱 창을 분리해야 합니다.");

click(window, "#retry-button");
assert.equal(document.querySelector("#question-input").value, "", "다른 질문하기는 입력을 초기화해야 합니다.");
assert.equal(document.querySelector("#answer-card").hidden, true, "다른 질문하기는 이전 결과를 숨겨야 합니다.");

submit(window);
assert.equal(document.querySelector("#question-error").textContent, "질문을 입력해주세요.", "빈 입력 안내가 정확히 표시되어야 합니다.");
assert.equal(document.querySelector("#question-input").getAttribute("aria-invalid"), "true", "빈 입력 필드가 접근성 오류 상태여야 합니다.");

setValue(window, "#question-input", "편입생도 지원 가능한가요?");
submit(window);
assert.match(document.querySelector("#answer-copy").textContent, /편입생은 지원할 수 있습니다/, "정상 입력에 핵심 답변이 표시되어야 합니다.");
assert.equal(document.querySelector("#evidence-card").hidden, false, "정상 결과에는 근거 카드가 표시되어야 합니다.");

click(window, "#department-button");
assert.equal(document.querySelector("#department-view").hidden, false, "담당 부서 보기 버튼이 부서 안내를 표시해야 합니다.");
assert.match(document.querySelector(".department-details").textContent, /입학전형관리팀/, "공식 공고의 담당 부서가 표시되어야 합니다.");
assert.equal(document.querySelector(".department-source-link").href, officialNoticeUrl, "담당 부서 안내에서도 공식 문의처를 확인할 수 있어야 합니다.");

click(window, "#department-back-button");
assert.equal(document.querySelector("#department-view").hidden, true, "공고로 돌아가기는 부서 안내를 닫아야 합니다.");
assert.equal(document.querySelector("#question-input").value, "", "공고로 돌아가면 새 질문을 입력할 수 있어야 합니다.");

setValue(window, "#question-input", "주차권은 어디서 받나요?");
submit(window);
assert.equal(document.querySelector("#answer-copy").textContent, "검색 결과가 없습니다. 담당 부서에 문의해주세요.", "준비되지 않은 질문은 실패 상태를 보여야 합니다.");
assert.equal(document.querySelector("#evidence-card").hidden, true, "검색 실패 시 근거를 임의로 표시하지 않아야 합니다.");
assert.ok(document.querySelector("#department-button"), "검색 실패 후에도 담당 부서로 이동할 수 있어야 합니다.");

assert.doesNotMatch(script, /fetch\s*\(/, "브라우저에서 외부 AI API를 호출하지 않아야 합니다.");
assert.doesNotMatch(html + script, /031-\d{3,4}-\d{4}/, "앱 데이터에 실제 또는 가상 전화번호를 복사하지 않아야 합니다.");
assert.doesNotMatch(html + script, /(sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16})/, "대표적인 API 키 패턴이 없어야 합니다.");
assert.match(document.querySelector("#feedback-title").textContent, /확인할 내용/, "부서 피드백 메모가 화면에 표시되어야 합니다.");
assert.equal(document.querySelector('link[rel="preload"][as="font"]').getAttribute("href"), "./assets/fonts/PretendardVariable.woff2", "공통 글꼴을 렌더링 전에 불러와야 합니다.");
assert.match(styles, /font-family:\s*"Pretendard Variable"/, "Mac, Windows, 웹에서 공통 글꼴을 우선 사용해야 합니다.");
assert.ok(font.byteLength > 1_000_000, "배포 가능한 공통 한글 글꼴 파일이 포함되어야 합니다.");
assert.match(fontLicense, /SIL OPEN FONT LICENSE Version 1\.1/, "글꼴 재배포 라이선스를 함께 제공해야 합니다.");

console.log("preview integration: 33 checks passed");
