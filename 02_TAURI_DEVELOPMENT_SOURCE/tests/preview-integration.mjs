import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Window } from "happy-dom";

const root = new URL("../", import.meta.url);
const listHtml = await readFile(new URL("app/index.html", root), "utf8");
const html = await readFile(new URL("app/notice.html", root), "utf8");
const adminHtml = await readFile(new URL("app/admin.html", root), "utf8");
const membersHtml = await readFile(new URL("app/members.html", root), "utf8");
const publishHtml = await readFile(new URL("app/publish.html", root), "utf8");
const manageHtml = await readFile(new URL("app/manage.html", root), "utf8");
const styles = await readFile(new URL("app/styles.css", root), "utf8");
const script = await readFile(new URL("app/main.js", root), "utf8");
const listScript = await readFile(new URL("app/list.js", root), "utf8");
const font = await readFile(new URL("app/assets/fonts/PretendardVariable.woff2", root));
const fontLicense = await readFile(new URL("app/assets/fonts/Pretendard-LICENSE.txt", root), "utf8");
const officialNoticeUrl = "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9";

function boot() {
  const window = new Window({ url: "http://127.0.0.1:4173/notice.html?notice=neulpum-2026" });
  const page = html.replace(/<script src="\.\/main\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(script);
  return window;
}

function bootList() {
  const window = new Window({ url: "http://127.0.0.1:4173/" });
  const page = listHtml.replace(/<script src="\.\/list\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.eval(listScript);
  return window;
}

function bootMockNoticeWithoutSourceUrl() {
  const window = new Window({ url: "http://127.0.0.1:4173/notice.html?notice=mock-no-source" });
  const page = html.replace(/<script src="\.\/main\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify([
    {
      id: "mock-no-source",
      title: "가상 공고",
      category: "대학생활",
      department: "가상 부서",
      date: "2026.07.23",
      status: "안내",
      sourceTitle: "가상 샘플 원문",
      sourceUrl: "",
      publishedAt: "2026.07.23",
      sourceType: "mock",
      dataMethod: "가상 샘플",
      reviewed: false,
      reviewedAt: "",
      sourcePrefix: "가상 샘플",
      summary: "프로토타입 검증용 가상 공고입니다.",
      facts: { period: "가상 일정", eligibility: "가상 대상", field: "가상 분야" },
      faqs: [{ id: "mock-faq", question: "가상 질문인가요?", answer: "가상 샘플입니다.", source: "가상 샘플" }],
    },
  ]));
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
const listWindow = bootList();
const listDocument = listWindow.document;
const mockWindow = bootMockNoticeWithoutSourceUrl();
const mockDocument = mockWindow.document;

assert.equal(listDocument.querySelector("#notice"), null, "공고 선택 화면에는 상세 공고 본문이 없어야 합니다.");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 4, "공고 선택 화면에는 여러 공고가 4열 카드로 표시되어야 합니다.");
assert.match(listDocument.querySelector(".notice-list-item").href, /notice\.html\?notice=/, "공고 선택 시 별도 상세 페이지로 이동해야 합니다.");
assert.match(listDocument.querySelector("#header-auth-link").textContent, /관리자 로그인/, "학생용 공고 목록에서는 관리자용 로그인임을 명확히 알려야 합니다.");
assert.match(document.querySelector("#notice-title").textContent, /늘품 12기 2학기 수습 임원 모집/, "공식 공고 제목이 표시되어야 합니다.");
assert.match(document.querySelector("#header-auth-link").textContent, /관리자 로그인/, "학생용 공고 상세에서는 관리자용 로그인임을 명확히 알려야 합니다.");
assert.equal(document.querySelector("#notice-list"), null, "상세 페이지에는 공고 선택 목록이 없어야 합니다.");
assert.equal(document.querySelector(".notice-list-back").getAttribute("href"), "./index.html", "상세 공고에서 공고 선택 화면으로 돌아갈 수 있어야 합니다.");
assert.match(adminHtml, /href="\.\/index\.html"[^>]*>[\s\S]*?공고 목록으로/, "관리자 메뉴에서 공고 목록으로 돌아갈 수 있어야 합니다.");
assert.match(membersHtml, /href="\.\/admin\.html"[^>]*>[\s\S]*?관리자 메뉴로/, "관리자 관리 화면에서 관리자 메뉴로 돌아갈 수 있어야 합니다.");
assert.match(publishHtml, /href="\.\/admin\.html"[^>]*>[\s\S]*?관리자 메뉴로/, "AI 공고 공개 화면에서 관리자 메뉴로 돌아갈 수 있어야 합니다.");
assert.match(manageHtml, /href="\.\/admin\.html"[^>]*>[\s\S]*?관리자 메뉴로/, "공개 공고 관리 화면에서 관리자 메뉴로 돌아갈 수 있어야 합니다.");
assert.equal(document.querySelectorAll(".faq-item").length, 3, "P0 FAQ 3개가 표시되어야 합니다.");
assert.match(document.querySelector(".example-notice").textContent, /공고 기반 답변/, "입력 화면에 공고 기반 답변임을 알려야 합니다.");
assert.match(document.querySelector(".source-line").textContent, /공식 공고 내용을 확인해 작성한 답변/, "공식 공고 기반 답변임을 알려야 합니다.");
assert.equal(document.querySelector("#source-title").textContent, "입학처 공식 홍보대사 늘품 12기 2학기 수습 위원 모집 공고", "상세 화면에 원문 제목이 표시되어야 합니다.");
assert.equal(document.querySelector("#source-department").textContent, "입학전형관리팀", "상세 화면에 게시 부서가 표시되어야 합니다.");
assert.equal(document.querySelector("#source-published-at").textContent, "2026.07.20", "상세 화면에 게시일이 표시되어야 합니다.");
assert.equal(document.querySelector("#source-type").textContent, "이미지", "상세 화면에 원문 형식이 표시되어야 합니다.");
assert.equal(document.querySelector("#data-method").textContent, "실제 공고 기반 재구성", "상세 화면에 데이터 작성 방식이 표시되어야 합니다.");
assert.equal(document.querySelector("#review-status-text").textContent, "검수 완료", "상세 화면에 관리자 검수 여부가 표시되어야 합니다.");
assert.equal(document.querySelector("#reviewed-at").textContent, "2026.07.23", "상세 화면에 검수일이 표시되어야 합니다.");
assert.equal(document.querySelector("#source-original-link").href, officialNoticeUrl, "상세 화면 원문 보기 링크가 공식 공고 원문을 가리켜야 합니다.");
assert.equal(mockDocument.querySelector("#mock-source-note").hidden, false, "가상 샘플 공고에는 가상 데이터 안내 문구가 표시되어야 합니다.");
assert.match(mockDocument.querySelector("#mock-source-note").textContent, /프로토타입 검증을 위한 가상 샘플/, "가상 샘플 안내 문구가 정확해야 합니다.");
assert.equal(mockDocument.querySelector("#source-original-link").hidden, true, "원문 URL이 없으면 상세 화면 원문 보기 링크를 숨겨야 합니다.");
assert.equal(mockDocument.querySelector("#answer-source-link").hidden, true, "원문 URL이 없으면 답변 원문 링크를 숨겨야 합니다.");

click(window, '[data-faq-id="application-period"]');
assert.equal(document.querySelector("#answer-card").hidden, false, "FAQ를 선택하면 결과가 나타나야 합니다.");
assert.match(document.querySelector("#answer-copy").textContent, /8월 2일\(일\) 오후 5시까지/, "FAQ에 맞는 공식 공고 기반 답변이 표시되어야 합니다.");
assert.match(document.querySelector("#answer-source").textContent, /공식 공고 카드뉴스.*1차 서류 접수/, "공고문 출처가 표시되어야 합니다.");
assert.equal(document.querySelector(".example-badge").textContent, "답변", "결과 카드에 답변 표시가 있어야 합니다.");
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
assert.doesNotMatch(html + listHtml + script + listScript, /031-\d{3,4}-\d{4}/, "앱 데이터에 실제 또는 가상 전화번호를 복사하지 않아야 합니다.");
assert.doesNotMatch(html + listHtml + script + listScript, /(sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16})/, "대표적인 API 키 패턴이 없어야 합니다.");
assert.match(document.querySelector("#feedback-title").textContent, /확인할 내용/, "부서 피드백 메모가 화면에 표시되어야 합니다.");
assert.equal(document.querySelector('link[rel="preload"][as="font"]').getAttribute("href"), "./assets/fonts/PretendardVariable.woff2", "공통 글꼴을 렌더링 전에 불러와야 합니다.");
assert.match(styles, /font-family:\s*"Pretendard Variable"/, "Mac, Windows, 웹에서 공통 글꼴을 우선 사용해야 합니다.");
assert.match(styles, /\.notice-hero h1\s*\{[^}]*word-break:\s*keep-all/s, "상세 공고 제목은 한글 단어 중간에서 줄바꿈되지 않아야 합니다.");
assert.match(styles, /\.notice-hero h1\s*\{[^}]*overflow-wrap:\s*anywhere/s, "매우 긴 공고 제목은 좁은 화면에서도 영역을 넘지 않아야 합니다.");
assert.ok(font.byteLength > 1_000_000, "배포 가능한 공통 한글 글꼴 파일이 포함되어야 합니다.");
assert.match(fontLicense, /SIL OPEN FONT LICENSE Version 1\.1/, "글꼴 재배포 라이선스를 함께 제공해야 합니다.");

console.log("preview integration: 59 checks passed");
