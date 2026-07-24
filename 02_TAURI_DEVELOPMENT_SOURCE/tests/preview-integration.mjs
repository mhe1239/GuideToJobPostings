import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Window } from "happy-dom";

const root = new URL("../", import.meta.url);
const listHtml = await readFile(new URL("app/index.html", root), "utf8");
const html = await readFile(new URL("app/notice.html", root), "utf8");
const loginHtml = await readFile(new URL("app/login.html", root), "utf8");
const profileHtml = await readFile(new URL("app/profile.html", root), "utf8");
const adminHtml = await readFile(new URL("app/admin.html", root), "utf8");
const membersHtml = await readFile(new URL("app/members.html", root), "utf8");
const publishHtml = await readFile(new URL("app/publish.html", root), "utf8");
const manageHtml = await readFile(new URL("app/manage.html", root), "utf8");
const styles = await readFile(new URL("app/styles.css", root), "utf8");
const script = await readFile(new URL("app/main.js", root), "utf8");
const answerServiceScript = await readFile(new URL("app/answer-service.js", root), "utf8");
const accountAccessScript = await readFile(new URL("app/account-access.js", root), "utf8");
const headerAccountScript = await readFile(new URL("app/header-account.js", root), "utf8");
const studentProfileScript = await readFile(new URL("app/student-profile.js", root), "utf8");
const profileScript = await readFile(new URL("app/profile.js", root), "utf8");
const loginScript = await readFile(new URL("app/login.js", root), "utf8");
const noticeSortScript = await readFile(new URL("app/notice-sort.js", root), "utf8");
const listScript = await readFile(new URL("app/list.js", root), "utf8");
const adminGuardScript = await readFile(new URL("app/admin-guard.js", root), "utf8");
const adminScript = await readFile(new URL("app/admin.js", root), "utf8");
const schoolNoticeMockJson = await readFile(new URL("app/school-notices.mock.json", root), "utf8");
const schoolNoticeMocks = JSON.parse(schoolNoticeMockJson);
const font = await readFile(new URL("app/assets/fonts/PretendardVariable.woff2", root));
const fontLicense = await readFile(new URL("app/assets/fonts/Pretendard-LICENSE.txt", root), "utf8");
const officialNoticeUrl = "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9";
const liveSchoolNotices = schoolNoticeMocks.slice(0, 10).map((notice, index) => ({
  ...notice,
  id: `school-live-${index + 1}`,
  title: `실시간 공고 ${index + 1}`,
  department: "실시간부서",
  publishedAt: "2026.07.24",
  sourceType: "html",
  sourceUrl: `https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuBoardSeq=${"a".repeat(31)}${index}&encMenuSeq=6583b62b7f31b68788e66e9b0788e192`,
}));

assert.equal(schoolNoticeMocks.length, 10, "학교 홈페이지 가져오기 샘플은 최근 공고 10개를 유지해야 합니다.");
assert.equal(
  schoolNoticeMocks.every((notice) => /^https:\/\/web\.kangnam\.ac\.kr\/menu\/board\/info\//.test(notice.sourceUrl)),
  true,
  "학교 홈페이지 가져오기 샘플은 공식 공고 상세 URL을 출처로 가져야 합니다.",
);
assert.doesNotMatch(schoolNoticeMockJson, /encMenuBoardSeq=schoolnotice\d+/i, "학교 홈페이지 가져오기 샘플에는 가짜 게시글 번호를 저장하지 않아야 합니다.");

function boot() {
  const window = new Window({ url: "http://127.0.0.1:4173/notice.html?notice=neulpum-2026" });
  const page = html
    .replace(/<script src="\.\/answer-service\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/main\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(answerServiceScript);
  window.eval(script);
  return window;
}

function bootList() {
  const window = new Window({ url: "http://127.0.0.1:4173/" });
  const page = listHtml.replace(/<script src="\.\/list\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.eval(noticeSortScript);
  window.eval(listScript);
  return window;
}

async function bootListAsAccount(user, role = "owner") {
  const window = new Window({ url: "http://127.0.0.1:4173/" });
  const page = listHtml
    .replace(/<script src="\.\/account-access\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/list\.js[^"]*" defer><\/script>/, "");
  let signedOut = false;
  window.document.write(page);
  window.document.close();
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback(user),
    signOut: async () => {
      signedOut = true;
    },
  };
  window.KANGNAM_NOTICE_STORE = {
    ready: Promise.resolve({ db: {} }),
    getAdminRole: async () => role,
    getFriendlyError: () => "권한 확인 실패",
  };
  window.eval(accountAccessScript);
  window.eval(headerAccountScript);
  window.eval(noticeSortScript);
  window.eval(listScript);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  return { window, get signedOut() { return signedOut; } };
}

function bootListWithStorage(publishedNotices, deletedIds = []) {
  const window = new Window({ url: "http://127.0.0.1:4173/" });
  const page = listHtml.replace(/<script src="\.\/list\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify(publishedNotices));
  window.localStorage.setItem("kangnamDeletedNoticeIds", JSON.stringify(deletedIds));
  window.eval(noticeSortScript);
  window.eval(listScript);
  return window;
}

function bootNoticeWithStorage(noticeId, publishedNotices, deletedIds = []) {
  const window = new Window({ url: `http://127.0.0.1:4173/notice.html?notice=${encodeURIComponent(noticeId)}` });
  const page = html
    .replace(/<script src="\.\/answer-service\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/main\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify(publishedNotices));
  window.localStorage.setItem("kangnamDeletedNoticeIds", JSON.stringify(deletedIds));
  window.eval(answerServiceScript);
  window.eval(script);
  return window;
}

function bootLoginMarkup() {
  const window = new Window({ url: "http://127.0.0.1:4173/login.html" });
  const page = loginHtml.replace(/<script[^>]*><\/script>/g, "");
  window.document.write(page);
  window.document.close();
  return window;
}

async function bootLogoutToGuestList() {
  const window = new Window({ url: "http://127.0.0.1:4173/login.html?returnTo=profile.html&stay=1" });
  const page = loginHtml.replace(/<script[^>]*><\/script>/g, "");
  window.document.write(page);
  window.document.close();
  let authCallback = () => {};
  const user = {
    uid: "logout-student",
    email: "student@kangnam.ac.kr",
    displayName: "김강남",
  };
  window.KANGNAM_FIREBASE = {
    auth: {},
    getRedirectResult: async () => null,
    onAuthStateChanged: (_auth, callback) => {
      authCallback = callback;
      callback(user);
    },
    signOut: async () => authCallback(null),
  };
  window.KANGNAM_ACCOUNT_ACCESS = {
    resolveAccount: async () => ({ type: "student", role: "viewer", isAdmin: false }),
    getSafeStudentReturnUrl: () => new URL("./profile.html", window.location.href).href,
  };
  window.eval(loginScript);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  click(window, "#login-logout-button");
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  return window;
}

async function bootStudentProfilePage() {
  const window = new Window({ url: "http://127.0.0.1:4173/profile.html" });
  const page = profileHtml.replace(/<script[^>]*><\/script>/g, "");
  window.document.write(page);
  window.document.close();
  const user = {
    uid: "preview-student",
    email: "student@kangnam.ac.kr",
    displayName: "김강남",
  };
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback(user),
    signOut: async () => {},
  };
  window.KANGNAM_ACCOUNT_ACCESS = {
    resolveAccount: async () => ({ type: "student", role: "viewer", isAdmin: false }),
  };
  window.eval(studentProfileScript);
  window.eval(profileScript);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  return window;
}

async function bootListWithStudentProfile() {
  const window = new Window({ url: "http://127.0.0.1:4173/index.html" });
  const page = listHtml
    .replace(/<script src="\.\/student-profile\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/list\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  const user = {
    uid: "saved-student",
    email: "student@kangnam.ac.kr",
    displayName: "김강남",
  };
  window.eval(studentProfileScript);
  window.KANGNAM_STUDENT_PROFILE.save(user, {
    enrollmentStatus: "재학생",
    grade: "2",
    transferStudent: false,
    interests: ["비교과 프로그램"],
  });
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback(user),
  };
  window.KANGNAM_ACCOUNT_ACCESS = {
    resolveAccount: async () => ({ type: "student", role: "viewer", isAdmin: false }),
    getLoginUrl: () => "./login.html",
  };
  window.eval(headerAccountScript);
  window.eval(noticeSortScript);
  window.eval(listScript);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  return window;
}

function bootAccountAccess() {
  const window = new Window({ url: "http://127.0.0.1:4173/login.html?returnTo=notice.html%3Fnotice%3Dneulpum-2026" });
  window.KANGNAM_FIREBASE = { roleLists: { owners: [], editors: [] } };
  window.KANGNAM_NOTICE_STORE = {
    ready: Promise.resolve({ db: {} }),
    getAdminRole: async (email) => email === "editor@kangnam.ac.kr" ? "editor" : null,
    getFriendlyError: () => "권한 확인 실패",
  };
  window.eval(accountAccessScript);
  return window;
}

function bootMockNoticeWithoutSourceUrl() {
  const window = new Window({ url: "http://127.0.0.1:4173/notice.html?notice=mock-no-source" });
  const page = html
    .replace(/<script src="\.\/answer-service\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/main\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify([
    {
      id: "mock-no-source",
      title: "확인 공고",
      category: "대학생활",
      department: "학생지원팀",
      date: "2026.07.23",
      status: "안내",
      sourceTitle: "확인 공고 원문",
      sourceUrl: "",
      sourceImageUrl: "https://example.invalid/missing-notice.png",
      imageUrls: ["https://example.invalid/missing-notice.png"],
      publishedAt: "2026.07.23",
      sourceType: "mock",
      dataMethod: "공고 정보 기반",
      reviewed: false,
      reviewedAt: "",
      sourcePrefix: "공고 정보",
      summary: "세부 내용을 확인할 수 있는 공고입니다.",
      facts: { period: "일정 확인 필요", eligibility: "대상 확인 필요", field: "분야 확인 필요" },
      faqs: [{ id: "mock-faq", question: "세부 내용을 어디에서 확인하나요?", answer: "공고 원문에서 확인해 주세요.", source: "공고 정보" }],
    },
  ]));
  window.eval(answerServiceScript);
  window.eval(script);
  return window;
}

function bootNoticeWithStaleStoredSource() {
  const window = new Window({ url: "http://127.0.0.1:4173/notice.html?notice=neulpum-2026" });
  const page = html
    .replace(/<script src="\.\/answer-service\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/main\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.localStorage.setItem("kangnamFirestoreAuthoritativeV2", "true");
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify([
    {
      id: "neulpum-2026",
      title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집",
      category: "비교과 프로그램",
      department: "입학전형관리팀",
      date: "2026.07.20",
      status: "마감 임박",
      sourceUrl: "",
      summary: "캐시에 남아 있던 이전 형식의 공고입니다.",
      facts: { period: "7월 20일 ~ 8월 2일" },
      faqs: [],
    },
  ]));
  window.eval(answerServiceScript);
  window.eval(script);
  return window;
}

function bootPublish({ publishedNotices = [], deletedNoticeIds = [], schoolNoticeResult = null, schoolNoticeError = null } = {}) {
  const window = new Window({ url: "http://127.0.0.1:4173/publish.html" });
  const page = publishHtml
    .replace(/<script src="\.\/admin-guard\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/admin\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback({ email: "admin@kangnam.ac.kr" }),
    signOut: async () => {},
  };
  window.localStorage.setItem("kangnamManagedMembers", JSON.stringify([
    { email: "admin@kangnam.ac.kr", role: "owner" },
  ]));
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify(publishedNotices));
  window.localStorage.setItem("kangnamDeletedNoticeIds", JSON.stringify(deletedNoticeIds));
  window.alert = () => {
    throw new Error("완료 안내는 브라우저 alert를 사용하지 않아야 합니다.");
  };
  let schoolNoticeMockFetchCount = 0;
  window.fetch = async (url) => {
    if (String(url).includes("school-notices.mock.json")) {
      schoolNoticeMockFetchCount += 1;
      return {
        ok: true,
        json: async () => JSON.parse(schoolNoticeMockJson),
      };
    }

    return {
      ok: true,
      text: async () => [
        "Title: URL 입력 테스트 공고",
        "",
        "신청 기간 7월 23일 ~ 8월 10일",
        "지원 자격 강남대학교 재학생",
        "모집 분야 비교과 프로그램",
        "지원 방법 온라인 신청서 제출",
        "문의 학생지원팀",
      ].join("\n"),
    };
  };
  window.KANGNAM_NOTICE_STORE = {
    ready: Promise.resolve({ db: {} }),
    getAdminRole: async () => "owner",
    getFriendlyError: (error) => error?.message || "공용 저장소 오류",
    loadSchoolNotices: async () => {
      if (schoolNoticeError) throw schoolNoticeError;
      return schoolNoticeResult;
    },
  };
  window.__getSchoolNoticeMockFetchCount = () => schoolNoticeMockFetchCount;
  window.eval(adminGuardScript);
  window.eval(adminScript);
  return window;
}

async function bootManageWithStorage(notices, deletedNoticeIds = []) {
  const window = new Window({ url: "http://127.0.0.1:4173/manage.html" });
  const page = manageHtml
    .replace(/<script src="\.\/admin-guard\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/admin\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.localStorage.setItem("kangnamManagedMembers", JSON.stringify([
    { email: "admin@kangnam.ac.kr", role: "owner" },
  ]));
  window.localStorage.setItem("kangnamPublishedNotices", JSON.stringify(notices));
  window.localStorage.setItem("kangnamDeletedNoticeIds", JSON.stringify(deletedNoticeIds));
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback({ email: "admin@kangnam.ac.kr" }),
    signOut: async () => {},
  };
  window.confirm = () => true;
  window.alert = () => {
    throw new Error("완료 안내는 브라우저 alert를 사용하지 않아야 합니다.");
  };
  window.eval(adminGuardScript);
  const result = await window.KANGNAM_ADMIN_ACCESS.ready;
  assert.equal(result.allowed, true, "관리자는 공개 공고 관리 화면에 접근할 수 있어야 합니다.");
  window.eval(adminScript);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  return window;
}

async function bootAdminGuard(pageHtml, user, members = [], url = "http://127.0.0.1:4173/admin.html") {
  const window = new Window({ url });
  const page = pageHtml
    .replace(/<script src="\.\/admin-guard\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/admin\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.localStorage.setItem("kangnamManagedMembers", JSON.stringify(members));
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback(user),
    signOut: async () => {},
  };
  window.eval(adminGuardScript);
  const result = await window.KANGNAM_ADMIN_ACCESS.ready;
  if (result.allowed) {
    window.eval(adminScript);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
  return window;
}

async function bootMembersWithSharedAdmins() {
  const window = new Window({ url: "http://127.0.0.1:4173/members.html" });
  const page = membersHtml
    .replace(/<script src="\.\/admin-guard\.js[^"]*" defer><\/script>/, "")
    .replace(/<script src="\.\/admin\.js[^"]*" defer><\/script>/, "");
  window.document.write(page);
  window.document.close();
  window.localStorage.setItem("kangnamAdminBootstrapEmail", "bootstrap@kangnam.ac.kr");
  window.localStorage.setItem("kangnamManagedMembers", JSON.stringify([
    { email: "owner@kangnam.ac.kr", role: "owner" },
  ]));
  window.KANGNAM_FIREBASE = {
    auth: {},
    onAuthStateChanged: (_auth, callback) => callback({ email: "owner@kangnam.ac.kr" }),
    signOut: async () => {},
  };
  window.KANGNAM_NOTICE_STORE = {
    ready: Promise.resolve({ db: {} }),
    getAdminRole: async () => "owner",
    loadAllNotices: async () => ({ notices: [], source: "cloudflare-d1" }),
    loadAdmins: async () => ({
      admins: [
        { email: "owner@kangnam.ac.kr", role: "owner" },
        { email: "editor@kangnam.ac.kr", role: "editor" },
      ],
      source: "cloudflare-d1",
    }),
    saveAdmin: async () => ({ saved: true, source: "cloudflare-d1" }),
    deleteAdmin: async () => ({ deleted: true, source: "cloudflare-d1" }),
    getFriendlyError: (error) => error?.message || "공용 저장소 오류",
  };
  window.eval(adminGuardScript);
  const result = await window.KANGNAM_ADMIN_ACCESS.ready;
  assert.equal(result.allowed, true, "공용 관리자 저장소 테스트 계정은 관리자 관리 화면에 접근할 수 있어야 합니다.");
  window.eval(adminScript);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
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

async function submitAndWait(window) {
  submit(window);
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

const window = boot();
const document = window.document;
const listWindow = bootList();
const listDocument = listWindow.document;
const loginWindow = bootLoginMarkup();
const loginDocument = loginWindow.document;
const loggedOutLoginWindow = await bootLogoutToGuestList();
const loggedOutLoginDocument = loggedOutLoginWindow.document;
const profileWindow = await bootStudentProfilePage();
const profileDocument = profileWindow.document;
const personalizedListWindow = await bootListWithStudentProfile();
const personalizedListDocument = personalizedListWindow.document;
const accountWindow = bootAccountAccess();
const accountMenu = await bootListAsAccount({ email: "owner@kangnam.ac.kr" }, "owner");
const accountMenuDocument = accountMenu.window.document;
const mockWindow = bootMockNoticeWithoutSourceUrl();
const mockDocument = mockWindow.document;
const staleSourceWindow = bootNoticeWithStaleStoredSource();
const staleSourceDocument = staleSourceWindow.document;
const publishWindow = bootPublish();
const publishDocument = publishWindow.document;
const signedOutAdminWindow = await bootAdminGuard(adminHtml, null);
const viewerAdminWindow = await bootAdminGuard(adminHtml, { email: "student@kangnam.ac.kr" }, [
  { email: "student@kangnam.ac.kr", role: "viewer" },
]);
const unknownAdminWindow = await bootAdminGuard(adminHtml, { email: "unknown@kangnam.ac.kr" });
const editorAdminWindow = await bootAdminGuard(adminHtml, { email: "editor@kangnam.ac.kr" }, [
  { email: "editor@kangnam.ac.kr", role: "editor" },
]);
const ownerMembersWindow = await bootAdminGuard(membersHtml, { email: "owner@kangnam.ac.kr" }, [
  { email: "owner@kangnam.ac.kr", role: "owner" },
], "http://127.0.0.1:4173/members.html");
const editorMembersWindow = await bootAdminGuard(membersHtml, { email: "editor@kangnam.ac.kr" }, [
  { email: "editor@kangnam.ac.kr", role: "editor" },
], "http://127.0.0.1:4173/members.html");
const sharedMembersWindow = await bootMembersWithSharedAdmins();
const sharedMembersDocument = sharedMembersWindow.document;

assert.equal(signedOutAdminWindow.document.body.dataset.adminGuard, "denied", "로그아웃 상태에서는 관리자 페이지 접근을 차단해야 합니다.");
assert.equal(signedOutAdminWindow.document.querySelector("#admin-guard-message").textContent, "관리자만 접근 가능한 페이지입니다.", "로그아웃 차단 안내 문구가 정확해야 합니다.");
assert.equal(viewerAdminWindow.document.body.dataset.adminGuard, "denied", "학생 권한은 관리자 메뉴에 접근할 수 없어야 합니다.");
assert.equal(viewerAdminWindow.document.querySelector("#admin-guard-message").textContent, "관리자 권한이 없습니다.", "학생 권한 차단 안내 문구가 정확해야 합니다.");
assert.equal(unknownAdminWindow.document.body.dataset.adminGuard, "denied", "등록되지 않은 로그인 계정은 학생으로 처리되어 관리자 메뉴에 접근할 수 없어야 합니다.");
assert.equal(unknownAdminWindow.localStorage.getItem("kangnamAdminBootstrapEmail"), null, "첫 로그인 계정을 브라우저에서 자동 관리자로 승격하면 안 됩니다.");
assert.equal(editorAdminWindow.document.body.dataset.adminGuard, "allowed", "수정 및 공개 가능 권한은 관리자 메뉴에 접근할 수 있어야 합니다.");
assert.equal(editorAdminWindow.document.querySelector('[href="./members.html"]').dataset.roleHidden, "true", "수정 및 공개 가능 권한은 관리자 관리 메뉴를 볼 수 없어야 합니다.");
assert.equal(editorAdminWindow.document.querySelector('[href="./publish.html"]').dataset.roleHidden, "false", "수정 및 공개 가능 권한은 AI 공고 생성 메뉴를 볼 수 있어야 합니다.");
assert.equal(ownerMembersWindow.document.body.dataset.adminGuard, "allowed", "관리자 관리 권한은 관리자 관리 페이지에 접근할 수 있어야 합니다.");
assert.equal(editorMembersWindow.document.body.dataset.adminGuard, "denied", "수정 및 공개 가능 권한은 관리자 관리 페이지 직접 접근도 차단되어야 합니다.");
assert.equal(editorMembersWindow.document.querySelector("#admin-guard-message").textContent, "관리자 권한이 없습니다.", "관리자 관리 직접 접근 차단 안내 문구가 정확해야 합니다.");
assert.match(sharedMembersDocument.querySelector("#member-list").textContent, /공용 관리자 저장소/, "Cloudflare D1 원본명 대신 사용자용 공용 저장소 이름을 표시해야 합니다.");
assert.match(sharedMembersDocument.querySelector("#member-list").textContent, /bootstrap@kangnam\.ac\.kr/, "초기 관리자는 공용 관리자 목록과 함께 표시되어야 합니다.");
const bootstrapDeleteButton = [...sharedMembersDocument.querySelectorAll(".member-list > div")]
  .find((row) => /bootstrap@kangnam\.ac\.kr/.test(row.textContent))
  ?.querySelector(".member-action-button.danger");
assert.equal(bootstrapDeleteButton?.disabled, false, "마지막 owner가 아니면 초기 관리자도 삭제할 수 있어야 합니다.");
setValue(sharedMembersWindow, "#member-email", "new-admin@kangnam.ac.kr");
setValue(sharedMembersWindow, "#member-role", "editor");
sharedMembersDocument.querySelector("#member-form").dispatchEvent(new sharedMembersWindow.Event("submit", { bubbles: true, cancelable: true }));
await new Promise((resolve) => sharedMembersWindow.setTimeout(resolve, 0));
assert.match(sharedMembersDocument.querySelector("#member-list").textContent, /new-admin@kangnam\.ac\.kr/, "관리자 추가 후 새 계정이 관리자 목록에 바로 표시되어야 합니다.");
assert.match(sharedMembersDocument.querySelector("#member-list").textContent, /수정 및 공개 가능/, "추가한 관리자 역할이 목록에 표시되어야 합니다.");

assert.equal(listDocument.querySelector("#notice"), null, "공고 선택 화면에는 상세 공고 본문이 없어야 합니다.");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 4, "공고 선택 화면에는 여러 공고가 4열 카드로 표시되어야 합니다.");
assert.match(listDocument.querySelector(".notice-list-item").href, /notice\.html\?notice=/, "공고 선택 시 별도 상세 페이지로 이동해야 합니다.");
assert.equal(listDocument.querySelector("#header-auth-link").closest(".account-menu") !== null, true, "공고 목록 헤더에는 로그인 상태 토글을 위한 계정 메뉴 컨테이너가 있어야 합니다.");
assert.equal(listDocument.querySelector("#header-auth-link").getAttribute("aria-controls"), "header-account-menu", "공고 목록 로그인 토글은 계정 메뉴 영역을 가리켜야 합니다.");
assert.equal(listDocument.querySelector("#header-account-menu").hidden, true, "로그인 전 계정 메뉴는 접힌 상태여야 합니다.");
assert.match(listDocument.querySelector("#header-auth-link").textContent, /^\s*로그인\s*$/, "학생용 공고 목록의 상단 진입점은 학생·관리자 공용 로그인으로 표시되어야 합니다.");
assert.match(accountMenuDocument.querySelector("#header-auth-link").textContent, /내 계정/, "로그인 상태에서는 헤더가 계정 메뉴 토글로 바뀌어야 합니다.");
assert.equal(accountMenuDocument.querySelector("#header-auth-link").getAttribute("aria-controls"), "header-account-menu", "로그인 상태의 계정 토글도 같은 메뉴 영역을 제어해야 합니다.");
click(accountMenu.window, "#header-auth-link");
assert.equal(accountMenuDocument.querySelector("#header-auth-link").getAttribute("aria-expanded"), "true", "계정 메뉴 토글은 열린 상태를 접근성 속성으로 알려야 합니다.");
assert.equal(accountMenuDocument.querySelector("#header-account-menu").hidden, false, "계정 메뉴가 펼쳐져야 합니다.");
assert.match(accountMenuDocument.querySelector(".account-menu-summary").textContent, /로그인 계정/, "계정 메뉴 상단에는 로그인 계정 정보 영역이 있어야 합니다.");
assert.match(accountMenuDocument.querySelector(".account-menu-role-badge").textContent, /관리자/, "관리자 계정 메뉴에는 권한 뱃지가 표시되어야 합니다.");
assert.ok(accountMenuDocument.querySelectorAll(".account-menu-icon").length >= 2, "계정 메뉴 항목에는 시각적 아이콘이 있어야 합니다.");
assert.match(accountMenuDocument.querySelector("#header-account-menu").textContent, /관리자 메뉴/, "관리자 권한 계정에는 관리자 메뉴 항목이 보여야 합니다.");
assert.doesNotMatch(accountMenuDocument.querySelector("#header-account-menu").textContent, /학생 페이지/, "관리자 권한 계정 토글에는 중복되는 학생 페이지 항목을 표시하지 않아야 합니다.");
assert.match(accountMenuDocument.querySelector("#header-account-menu").textContent, /로그아웃/, "계정 메뉴에는 로그아웃 항목이 있어야 합니다.");
accountMenuDocument.querySelector("#header-account-menu button").click();
assert.equal(accountMenu.signedOut, true, "계정 메뉴의 로그아웃 항목은 로그아웃을 실행해야 합니다.");
assert.match(listDocument.querySelector("#student-flow-title").textContent, /로그인 없이 공고를 확인/, "학생 화면은 로그인 없이 공고를 볼 수 있음을 알려야 합니다.");
assert.match(listDocument.querySelector(".user-flow-note").textContent, /하나의 학교 계정/, "학생·관리자 통합 로그인 안내가 표시되어야 합니다.");
assert.match(listDocument.querySelector(".user-flow-note").textContent, /학생은 로그인하지 않아도 공개된 공고를 볼 수 있습니다/, "학생 로그인 불필요 안내가 표시되어야 합니다.");
assert.equal(loginDocument.querySelectorAll("#login-google-button").length, 1, "학생과 관리자는 하나의 Google 로그인 버튼을 함께 사용해야 합니다.");
assert.equal(loginDocument.querySelectorAll(".login-route-guide > div").length, 2, "로그인 후 학생·관리자 자동 이동 안내가 각각 표시되어야 합니다.");
assert.match(loginDocument.querySelector("#login-title").textContent, /학교 계정으로 로그인/, "통합 로그인 제목이 표시되어야 합니다.");
assert.equal(loginDocument.querySelector("#login-state").getAttribute("aria-live"), "polite", "권한 확인 상태는 화면 읽기 프로그램에 안내되어야 합니다.");
assert.equal(loginDocument.querySelectorAll('a[href="./admin.html"], a[href="./members.html"], a[href="./publish.html"], a[href="./manage.html"]').length, 0, "로그인 전에는 역할 선택처럼 보이는 관리자 직행 버튼을 노출하지 않아야 합니다.");
assert.match(loggedOutLoginDocument.querySelector("#login-student-link").href, /\/index\.html$/, "로그아웃 후 로그인 없이 공고 보기는 내 정보가 아닌 공고 목록으로 이동해야 합니다.");
const studentAccount = await accountWindow.KANGNAM_ACCOUNT_ACCESS.resolveAccount({ email: "student@kangnam.ac.kr" });
const editorAccount = await accountWindow.KANGNAM_ACCOUNT_ACCESS.resolveAccount({ email: "editor@kangnam.ac.kr" });
assert.equal(studentAccount.type, "student", "관리자 목록에 없는 로그인 계정은 학생으로 자동 구분해야 합니다.");
assert.equal(studentAccount.isAdmin, false, "학생 계정에는 관리자 권한을 부여하면 안 됩니다.");
assert.equal(editorAccount.type, "admin", "Firestore에 등록된 관리자 계정은 관리자로 자동 구분해야 합니다.");
assert.equal(editorAccount.role, "editor", "등록된 관리자 역할을 유지해야 합니다.");
assert.match(accountWindow.KANGNAM_ACCOUNT_ACCESS.getSafeStudentReturnUrl(), /notice\.html\?notice=neulpum-2026$/, "학생은 로그인 전 보던 안전한 학생 페이지로 돌아가야 합니다.");
assert.match(accountWindow.KANGNAM_ACCOUNT_ACCESS.getSafeStudentReturnUrl("?returnTo=profile.html"), /profile\.html$/, "로그인 후 안전한 내 정보 화면으로 돌아갈 수 있어야 합니다.");
assert.match(accountWindow.KANGNAM_ACCOUNT_ACCESS.getSafeStudentReturnUrl("?returnTo=https%3A%2F%2Fevil.example%2F"), /index\.html$/, "외부 주소를 로그인 후 이동 경로로 사용할 수 없어야 합니다.");
assert.equal(profileDocument.querySelector("#profile-title").textContent, "내 정보", "학생용 내 정보 화면이 제공되어야 합니다.");
assert.match(profileDocument.querySelector("#profile-account-title").textContent, /김강남/, "로그인한 학생 계정 이름이 표시되어야 합니다.");
assert.match(profileDocument.querySelector("#profile-account-email").textContent, /\*\*\*/, "계정 이메일은 화면에서 일부를 가려 표시해야 합니다.");
assert.equal(profileDocument.querySelectorAll("input[name='profile-enrollment-status']").length, 3, "내 정보에서 재학 상태를 선택할 수 있어야 합니다.");
assert.equal(profileDocument.querySelectorAll("input[name='profile-interest']").length, 5, "내 정보에서 관심 분야를 선택할 수 있어야 합니다.");
assert.match(profileDocument.querySelector(".profile-privacy-note").textContent, /학번·전화번호·주소는 수집하지 않습니다/, "수집하지 않는 개인정보를 명확히 안내해야 합니다.");
click(profileWindow, "#profile-save-button");
assert.equal(profileDocument.querySelector("#profile-enrollment-error").hidden, false, "재학 상태가 비어 있으면 필수 입력 안내가 나타나야 합니다.");
assert.equal(profileDocument.querySelector("#profile-interests-error").hidden, false, "관심 분야가 비어 있으면 필수 입력 안내가 나타나야 합니다.");
click(profileWindow, "input[name='profile-enrollment-status'][value='재학생']");
click(profileWindow, "input[name='profile-interest'][value='비교과 프로그램']");
profileDocument.querySelector("#student-profile-form").dispatchEvent(new profileWindow.Event("submit", { bubbles: true, cancelable: true }));
assert.match(profileDocument.querySelector("#profile-form-status").textContent, /내 정보를 저장했습니다/, "정상 입력을 저장하면 완료 안내가 나타나야 합니다.");
assert.equal(personalizedListDocument.querySelectorAll(".notice-list-item").length, 2, "로그인한 학생의 관심 분야에 맞는 공고만 자동으로 표시해야 합니다.");
assert.match(personalizedListDocument.querySelector("#personalized-summary").textContent, /내 정보 적용/, "공고 목록에 적용된 학생 조건이 표시되어야 합니다.");
assert.equal(personalizedListDocument.querySelector("#student-grade").disabled, true, "로그인한 학생의 저장 조건은 목록 화면에서 임의로 바꾸지 못하게 해야 합니다.");
assert.equal(personalizedListDocument.querySelector("#personalized-profile-link"), null, "맞춤 공고 영역에는 중복되는 내 정보 수정 버튼을 표시하지 않아야 합니다.");
assert.equal(personalizedListDocument.querySelector("#personalized-reset-button").hidden, false, "맞춤 공고 영역에는 조건 초기화 버튼을 표시해야 합니다.");
assert.match(personalizedListDocument.querySelector("#header-auth-link").textContent, /내 계정/, "로그인한 학생의 상단 메뉴는 계정 토글로 표시되어야 합니다.");
click(personalizedListWindow, "#header-auth-link");
assert.match(personalizedListDocument.querySelector("#header-account-menu").textContent, /내 정보/, "로그인한 학생의 계정 메뉴에는 내 정보 경로가 있어야 합니다.");
assert.doesNotMatch(personalizedListDocument.querySelector("#header-account-menu").textContent, /공고 목록/, "로그인한 학생의 계정 메뉴에는 로고와 중복되는 공고 목록 항목을 표시하지 않아야 합니다.");
assert.equal(personalizedListDocument.querySelector("#personalization-toggle").hidden, false, "저장된 내 정보가 있으면 맞춤 공고 보기 토글을 표시해야 합니다.");
assert.equal(personalizedListDocument.querySelector("#personalization-toggle").getAttribute("aria-checked"), "true", "맞춤 공고 보기는 기본으로 켜져 있어야 합니다.");
assert.deepEqual(
  [...personalizedListDocument.querySelector(".personalized-actions").querySelectorAll("button")].map((button) => button.id),
  ["personalization-toggle", "personalized-reset-button"],
  "맞춤 공고 보기 버튼 다음에 조건 초기화 버튼이 표시되어야 합니다.",
);
click(personalizedListWindow, "#personalization-toggle");
assert.equal(personalizedListDocument.querySelectorAll(".notice-list-item").length, 4, "맞춤 공고 보기를 끄면 저장 정보를 지우지 않고 모든 공고를 표시해야 합니다.");
assert.match(personalizedListDocument.querySelector("#personalized-summary").textContent, /맞춤 조건을 껐습니다/, "맞춤 공고 보기를 끈 상태를 문장으로 안내해야 합니다.");
assert.equal(personalizedListDocument.querySelector("#personalization-toggle").getAttribute("aria-checked"), "false", "맞춤 공고 보기 끔 상태가 접근성 속성에 반영되어야 합니다.");
assert.equal(personalizedListDocument.querySelector("#student-grade").disabled, false, "맞춤 공고 보기를 끄면 조건을 직접 선택할 수 있어야 합니다.");
assert.equal(personalizedListDocument.querySelector("input[name='student-enrollment-status'][value='']").checked, true, "맞춤 공고 보기를 끄면 저장된 재학 상태 선택을 화면에서 해제해야 합니다.");
assert.equal(personalizedListDocument.querySelectorAll("input[name='student-interest']:checked").length, 0, "맞춤 공고 보기를 끄면 저장된 관심 분야 선택을 화면에서 해제해야 합니다.");
click(personalizedListWindow, "input[name='student-interest'][value='행사']");
assert.equal(personalizedListDocument.querySelectorAll(".notice-list-item").length, 1, "맞춤 공고 보기를 끈 뒤 선택한 임시 조건이 공고 목록에 반영되어야 합니다.");
assert.match(personalizedListDocument.querySelector("#personalized-summary").textContent, /임시 선택 조건/, "저장 정보와 구분되는 임시 조건임을 안내해야 합니다.");
click(personalizedListWindow, "#personalized-reset-button");
assert.equal(personalizedListDocument.querySelectorAll(".notice-list-item").length, 4, "조건 초기화 시 임시 선택을 해제하고 모든 공고를 표시해야 합니다.");
click(personalizedListWindow, "#personalization-toggle");
assert.equal(personalizedListDocument.querySelectorAll(".notice-list-item").length, 2, "맞춤 공고 보기를 다시 켜면 저장 조건을 즉시 재적용해야 합니다.");
assert.equal(personalizedListDocument.querySelector("#student-grade").disabled, true, "맞춤 공고 보기를 다시 켜면 저장 조건 입력을 잠가야 합니다.");
assert.equal(personalizedListDocument.querySelector("input[name='student-enrollment-status'][value='재학생']").checked, true, "맞춤 공고 보기를 다시 켜면 저장된 재학 상태를 복원해야 합니다.");
assert.equal(personalizedListDocument.querySelector("input[name='student-interest'][value='비교과 프로그램']").checked, true, "맞춤 공고 보기를 다시 켜면 저장된 관심 분야를 복원해야 합니다.");
assert.deepEqual([...listDocument.querySelectorAll(".user-flow-list strong")].map((item) => item.textContent), ["공고 선택", "핵심 정보 확인", "FAQ 확인", "질문하기", "출처 또는 담당 부서 확인"], "학생 흐름은 공고 선택부터 출처 확인까지 순서대로 표시되어야 합니다.");
assert.match(listDocument.querySelector("#personalized-search-title").textContent, /로그인 없이 조건을 선택/, "학생 맞춤형 공고 찾기는 로그인 없이 조건을 선택하게 안내해야 합니다.");
assert.equal(listDocument.querySelectorAll("input[name='student-enrollment-status']").length, 4, "맞춤형 탐색에는 재학 상태 선택지가 있어야 합니다.");
assert.equal(listDocument.querySelector("#student-grade").tagName, "SELECT", "맞춤형 탐색의 학년은 선택형 입력이어야 합니다.");
assert.equal(listDocument.querySelector("#student-transfer").type, "checkbox", "맞춤형 탐색의 편입 여부는 체크박스여야 합니다.");
assert.equal(listDocument.querySelectorAll("input[name='student-interest']").length, 5, "맞춤형 탐색에는 관심 분야 선택지가 있어야 합니다.");
click(listWindow, "input[name='student-enrollment-status'][value='휴학생']");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 2, "휴학생 조건을 선택하면 명확히 재학생 전용인 공고는 제외해야 합니다.");
assert.match(listDocument.querySelector("#personalized-summary").textContent, /휴학생/, "선택한 조건 요약이 표시되어야 합니다.");
assert.match(listDocument.querySelector(".notice-card-eligibility").textContent, /조건 확인 필요/, "조건 정보가 없는 공고는 자동 제외하지 않고 조건 확인 필요로 표시해야 합니다.");
click(listWindow, "input[name='student-interest'][value='장학']");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 0, "재학 상태와 관심 분야 조합에 맞는 공고가 없으면 목록이 비어야 합니다.");
assert.equal(listDocument.querySelector("#filter-empty").textContent, "조건에 맞는 공고가 없습니다.", "맞춤형 조건 결과 없음 문구가 표시되어야 합니다.");
click(listWindow, "#personalized-reset-button");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 4, "맞춤형 조건 초기화 시 모든 공개 공고가 다시 표시되어야 합니다.");
assert.equal(listDocument.querySelector("input[name='student-enrollment-status'][value='']").checked, true, "조건 초기화 시 재학 상태는 선택 안 함으로 돌아가야 합니다.");
assert.equal(listDocument.querySelector("#student-grade").value, "", "조건 초기화 시 학년 선택이 초기화되어야 합니다.");
assert.equal(listDocument.querySelector("#student-transfer").checked, false, "조건 초기화 시 편입 여부가 초기화되어야 합니다.");
assert.equal(listDocument.querySelectorAll("input[name='student-interest']:checked").length, 0, "조건 초기화 시 관심 분야가 초기화되어야 합니다.");
assert.equal(listWindow.localStorage.getItem("student-enrollment-status"), null, "맞춤형 조건은 localStorage에 저장하지 않아야 합니다.");
assert.equal(listDocument.querySelectorAll("[data-filter-type='category']").length, 6, "학생 공고 목록에는 카테고리 필터 6개가 표시되어야 합니다.");
assert.equal(listDocument.querySelectorAll("[data-filter-type='recruitmentStatus']").length, 5, "학생 공고 목록에는 마감 임박을 포함한 모집 상태 필터 5개가 표시되어야 합니다.");
assert.equal(listDocument.querySelector("[data-filter-type='recruitmentStatus'][data-filter-value='마감 임박']").textContent, "마감 임박", "마감 임박 필터가 표시되어야 합니다.");
assert.equal(listDocument.querySelector(".notice-list-item[data-status='마감 임박'] .notice-card-status").textContent, "마감 임박", "마감이 가까운 공고에는 마감 임박 상태가 표시되어야 합니다.");
assert.match(listDocument.querySelector(".notice-list-item[data-status='마감'] .notice-card-status").textContent, /^마감$/, "마감된 공고는 별도 마감 상태를 유지해야 합니다.");
click(listWindow, "[data-filter-type='recruitmentStatus'][data-filter-value='마감 임박']");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 1, "마감 임박 필터는 마감이 가까운 공고만 보여야 합니다.");
assert.match(listDocument.querySelector("#notice-list").textContent, /늘품/, "마감 임박 필터 결과에는 마감이 가까운 늘품 공고가 표시되어야 합니다.");
click(listWindow, "#filter-reset-button");
click(listWindow, "[data-filter-type='category'][data-filter-value='행사']");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 1, "카테고리 필터를 선택하면 목록이 즉시 줄어들어야 합니다.");
assert.match(listDocument.querySelector("#notice-list").textContent, /재즈 콘서트/, "행사 필터는 행사 공고만 보여야 합니다.");
assert.equal(listDocument.querySelector("[data-filter-type='category'][data-filter-value='행사']").getAttribute("aria-pressed"), "true", "선택한 카테고리 필터가 접근성 상태로 구분되어야 합니다.");
click(listWindow, "[data-filter-type='recruitmentStatus'][data-filter-value='모집 중']");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 0, "카테고리와 모집 상태 조합이 맞지 않으면 결과가 없어야 합니다.");
assert.equal(listDocument.querySelector("#filter-empty").hidden, false, "결과가 없으면 안내 문구가 표시되어야 합니다.");
assert.equal(listDocument.querySelector("#filter-empty").textContent, "조건에 맞는 공고가 없습니다.", "결과 없음 문구가 정확해야 합니다.");
click(listWindow, "#filter-reset-button");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 4, "필터 초기화 시 모든 공개 공고가 다시 표시되어야 합니다.");
assert.equal(listDocument.querySelector("#filter-empty").hidden, true, "필터 초기화 후 결과 없음 문구는 숨겨야 합니다.");
assert.equal(listDocument.querySelector("[data-filter-type='category'][data-filter-value='전체']").getAttribute("aria-pressed"), "true", "초기화 후 전체 카테고리 필터가 선택되어야 합니다.");
click(listWindow, "[data-filter-type='category'][data-filter-value='장학']");
assert.equal(listDocument.querySelectorAll(".notice-list-item").length, 0, "데이터가 없는 카테고리는 빈 결과를 보여야 합니다.");
click(listWindow, "#filter-reset-button");
assert.match(listDocument.querySelector(".notice-card-eligibility").textContent, /재학생/, "공고 카드에는 핵심 지원 대상 조건이 표시되어야 합니다.");
assert.match(listDocument.querySelector(".notice-card-eligibility").textContent, /편입생 가능/, "조건이 확인된 공고 카드는 편입생 가능 여부를 짧게 보여야 합니다.");
click(listWindow, "[data-filter-type='category'][data-filter-value='취업']");
assert.match(listDocument.querySelector(".notice-card-eligibility").textContent, /공고 원문에서 확인 필요/, "조건이 없는 공고 카드는 임의 추정 없이 확인 필요 문구를 보여야 합니다.");
click(listWindow, "#filter-reset-button");
assert.match(document.querySelector("#notice-title").textContent, /늘품 12기 2학기 수습 임원 모집/, "공식 공고 제목이 표시되어야 합니다.");
assert.equal(document.querySelector("#header-auth-link").closest(".account-menu") !== null, true, "상세 공고 헤더에도 로그인 상태 토글을 위한 계정 메뉴 컨테이너가 있어야 합니다.");
assert.equal(document.querySelector("#header-auth-link").getAttribute("aria-controls"), "header-account-menu", "상세 공고 로그인 토글은 계정 메뉴 영역을 가리켜야 합니다.");
assert.match(document.querySelector("#header-auth-link").textContent, /^\s*로그인\s*$/, "학생용 공고 상세의 상단 진입점은 학생·관리자 공용 로그인으로 표시되어야 합니다.");
assert.equal(document.querySelector("#notice-list"), null, "상세 페이지에는 공고 선택 목록이 없어야 합니다.");
assert.equal(document.querySelector(".notice-list-back").getAttribute("href"), "./index.html", "상세 공고에서 공고 선택 화면으로 돌아갈 수 있어야 합니다.");
assert.doesNotMatch(html, /notice-color-preview/, "상세 공고는 별도 색상 미리보기 없이 원래 파란색 테마를 사용해야 합니다.");
assert.ok(html.indexOf('class="notice-hero"') < html.indexOf('class="overview-section"'), "공고 제목과 핵심 정보가 프로그램 개요보다 먼저 나와야 합니다.");
assert.ok(html.indexOf('class="overview-section"') < html.indexOf('class="content-grid"'), "프로그램 개요가 FAQ와 질문 영역보다 먼저 나와야 합니다.");
assert.ok(html.indexOf('class="content-grid"') < html.indexOf('class="full-notice-section"'), "FAQ와 질문 영역 다음에 전체 공고 내용이 나와야 합니다.");
assert.ok(html.indexOf('class="full-notice-section"') < html.indexOf('class="source-section"'), "전체 공고 내용 다음에 출처 및 담당 부서가 나와야 합니다.");
assert.match(adminHtml, /href="\.\/index\.html"[^>]*>[\s\S]*?공고 목록으로/, "관리자 메뉴에서 공고 목록으로 돌아갈 수 있어야 합니다.");
assert.doesNotMatch(adminHtml, /class="auth-panel"|학교 계정으로 로그인|로그인 상태/, "관리자 메뉴에서는 불필요한 로그인 상태 패널을 표시하지 않아야 합니다.");
assert.match(adminHtml, /관리자 사용 흐름/, "관리자 메뉴에는 관리자용 핵심 흐름 안내가 표시되어야 합니다.");
assert.match(adminHtml, /공고 선택 또는 URL 입력[\s\S]*초안 생성[\s\S]*내용 검수[\s\S]*공개 또는 보류/, "관리자 흐름은 선택 또는 URL 입력부터 공개 또는 보류까지 표시되어야 합니다.");
assert.match(adminHtml, /관리자 로그인 후 공고 생성, 검수, 공개 관리 메뉴로 이동/, "관리자 화면 진입 경로가 명확해야 합니다.");
assert.ok(adminHtml.indexOf('class="admin-flow-section') < adminHtml.indexOf('class="admin-action-section'), "관리자 사용 흐름 다음에 실제 작업 메뉴가 표시되어야 합니다.");
assert.equal((adminHtml.match(/class="admin-menu-card(?:\s|")/g) || []).length, 4, "관리자 관리부터 로그아웃까지 네 개의 작업 버튼이 표시되어야 합니다.");
assert.match(adminHtml, /관리자 관리 열기[\s\S]*공고 생성 열기[\s\S]*공고 관리 열기[\s\S]*로그아웃하기/, "각 작업 카드가 누르는 버튼임을 알 수 있는 실행 문구가 표시되어야 합니다.");
assert.match(membersHtml, /href="\.\/admin\.html"[^>]*>[\s\S]*?관리자 메뉴로/, "관리자 관리 화면에서 관리자 메뉴로 돌아갈 수 있어야 합니다.");
assert.match(publishHtml, /href="\.\/admin\.html"[^>]*>[\s\S]*?관리자 메뉴로/, "AI 공고 공개 화면에서 관리자 메뉴로 돌아갈 수 있어야 합니다.");
assert.match(publishHtml, /<h2>보류 목록<\/h2>/, "공고 생성 화면 하단 목록은 보류 목록으로 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#published-list").getAttribute("aria-label"), "보류된 공고 목록", "보류 목록은 화면 읽기 프로그램에도 용도를 명확히 알려야 합니다.");
assert.ok(publishDocument.querySelector("#publish-action-bar"), "AI 공고 공개 화면에는 스크롤 중에도 사용할 수 있는 빠른 작업바가 있어야 합니다.");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, true, "빠른 작업바는 초안을 생성하기 전에는 숨겨야 합니다.");

const livePublishWindow = bootPublish({
  schoolNoticeResult: { notices: liveSchoolNotices, source: "kangnam-school-live" },
});
const livePublishDocument = livePublishWindow.document;
await new Promise((resolve) => livePublishWindow.setTimeout(resolve, 0));
click(livePublishWindow, "input[value='list']");
click(livePublishWindow, "#load-school-notices-button");
await new Promise((resolve) => livePublishWindow.setTimeout(resolve, 500));
assert.equal(livePublishDocument.querySelectorAll(".school-notice-item").length, 10, "실시간 학교 공고 목록은 최근 10개를 표시해야 합니다.");
assert.match(livePublishDocument.querySelector("#school-import-status").textContent, /학교 홈페이지 최신 공고 10개/, "실시간 공고 출처를 성공 상태에 표시해야 합니다.");
assert.match(livePublishDocument.querySelector(".school-notice-item").textContent, /실시간 공고 1/, "실시간 목록이 있으면 저장된 JSON 대신 실시간 결과를 표시해야 합니다.");
assert.equal(livePublishWindow.__getSchoolNoticeMockFetchCount(), 0, "실시간 공고 목록을 받으면 로컬 JSON fallback을 요청하지 않아야 합니다.");

const fallbackPublishWindow = bootPublish({ schoolNoticeError: new Error("network down") });
const fallbackPublishDocument = fallbackPublishWindow.document;
await new Promise((resolve) => fallbackPublishWindow.setTimeout(resolve, 0));
click(fallbackPublishWindow, "input[value='list']");
click(fallbackPublishWindow, "#load-school-notices-button");
await new Promise((resolve) => fallbackPublishWindow.setTimeout(resolve, 500));
assert.equal(fallbackPublishDocument.querySelectorAll(".school-notice-item").length, 10, "실시간 공고 목록 실패 시 저장된 공고 목록으로 대체해야 합니다.");
assert.match(fallbackPublishDocument.querySelector("#school-import-status").textContent, /저장된 공고 목록 10개/, "fallback 사용 시 저장된 공고 목록 출처를 표시해야 합니다.");
assert.equal(fallbackPublishWindow.__getSchoolNoticeMockFetchCount(), 1, "실시간 공고 목록 실패 시 로컬 JSON fallback을 한 번 요청해야 합니다.");
assert.equal(publishDocument.querySelector("#publish-action-close").getAttribute("aria-label"), "하단 검수 액션바 닫기", "아이콘형 닫기 버튼에는 명확한 접근성 이름이 있어야 합니다.");
assert.match(publishDocument.querySelector("#published-list").textContent, /아직 보류된 공고가 없습니다/, "보류된 공고가 없으면 전용 빈 상태를 보여야 합니다.");
assert.equal(publishDocument.querySelector("#sticky-generate-draft-button"), null, "빠른 작업바에는 중복 초안 생성 버튼을 표시하지 않아야 합니다.");
assert.equal(publishDocument.querySelector("#sticky-edit-draft-button"), null, "빠른 작업바에는 별도 수정 버튼을 표시하지 않아야 합니다.");
for (const [pageName, pageHtml] of [
  ["관리자 관리", membersHtml],
  ["AI 공고 생성 및 공개", publishHtml],
  ["공개 공고 관리", manageHtml],
]) {
  assert.doesNotMatch(pageHtml, /class="auth-panel"|학교 계정으로 로그인|권한 상태|로그인 상태/, `${pageName} 화면에는 중복 로그인 상태 패널을 표시하지 않아야 합니다.`);
  assert.match(pageHtml, /class="admin-grid[^"]*admin-workspace-grid/, `${pageName} 화면은 넓어진 관리자 작업 공간을 사용해야 합니다.`);
}
assert.equal(publishDocument.querySelectorAll("input[name='notice-input-mode']").length, 2, "관리자는 URL 입력과 학교 공고 선택 중 입력 방식을 고를 수 있어야 합니다.");
assert.equal(publishDocument.querySelector("#notice-list-panel").hidden, true, "기본 입력 방식은 URL 직접 입력이어야 합니다.");
publishDocument.querySelector("#admin-ingest-form").dispatchEvent(new publishWindow.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(publishDocument.querySelector("#approval-note").textContent, "공고 URL을 입력하거나 공고를 선택해 주세요.", "URL도 선택 공고도 없으면 안내 문구를 표시해야 합니다.");
setValue(publishWindow, "#official-notice-url", officialNoticeUrl);
publishDocument.querySelector("#admin-ingest-form").dispatchEvent(new publishWindow.Event("submit", { bubbles: true, cancelable: true }));
await new Promise((resolve) => publishWindow.setTimeout(resolve, 0));
assert.equal(publishDocument.querySelector("#draft-fields").hidden, false, "URL 직접 입력으로 초안을 생성할 수 있어야 합니다.");
assert.match(publishDocument.querySelector("#draft-title").value, /URL 입력 테스트 공고/, "URL 입력 초안의 제목이 편집 필드에 표시되어야 합니다.");
assert.match(publishDocument.querySelector("#draft-summary").value, /URL 입력 테스트 공고/, "URL 입력 초안은 읽은 공고 제목을 반영해야 합니다.");
assert.equal(publishDocument.querySelector(".publish-completion-toast").textContent, "초안 생성을 완료했습니다.", "URL 입력 초안 생성 완료 시 비차단 완료 박스를 표시해야 합니다.");
assert.equal(publishDocument.querySelector(".publish-completion-toast").dataset.tone, "success", "초안 생성 완료 안내는 성공 상태로 표시해야 합니다.");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, false, "초안을 생성하면 빠른 작업바를 표시해야 합니다.");
click(publishWindow, "#publish-action-close");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, true, "닫기 버튼으로 빠른 작업바를 숨길 수 있어야 합니다.");
assert.equal(publishDocument.querySelector("#draft-fields").hidden, false, "빠른 작업바를 닫아도 작성 중인 초안은 유지되어야 합니다.");
assert.equal(publishDocument.body.classList.contains("has-publish-action-bar"), false, "빠른 작업바를 닫으면 본문 하단 여백도 제거해야 합니다.");
assert.equal(publishDocument.querySelector("#review-draft-button"), null, "생성 초안 하단에는 별도 검수 버튼을 표시하지 않아야 합니다.");
click(publishWindow, "input[value='list']");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, true, "학교 홈페이지 가져오기 모드로 이동하면 기존 빠른 작업바가 사라져야 합니다.");
assert.equal(publishDocument.querySelector("#url-input-panel").hidden, true, "목록 선택 모드에서는 URL 입력 영역을 숨겨야 합니다.");
assert.equal(publishDocument.querySelector("#notice-list-panel").hidden, false, "목록 선택 모드에서는 학교 공고 목록을 보여야 합니다.");
assert.equal(publishDocument.querySelectorAll(".school-notice-item").length, 0, "가져오기 전에는 공고 목록을 자동으로 표시하지 않아야 합니다.");
assert.match(publishDocument.querySelector(".mock-list-note").textContent, /학교 홈페이지 공고를 불러와 선택/, "학교 공고 가져오기 안내가 표시되어야 합니다.");
assert.doesNotMatch(publishDocument.querySelector(".mock-list-note").textContent, /프로토타입|시뮬레이션|예시 데이터/, "학교 공고 가져오기 안내에는 내부 검증 문구가 없어야 합니다.");
click(publishWindow, "#load-school-notices-button");
assert.equal(publishDocument.querySelector("#school-import-status").dataset.state, "loading", "가져오기 버튼 클릭 시 로딩 상태를 표시해야 합니다.");
assert.match(publishDocument.querySelector("#school-import-status").textContent, /가져오는 중/, "로딩 중 문구가 표시되어야 합니다.");
await new Promise((resolve) => publishWindow.setTimeout(resolve, 500));
assert.equal(publishDocument.querySelectorAll(".school-notice-item").length, 10, "학교 홈페이지 공고 선택 화면에는 최근 공고 10개 예시가 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#school-import-status").dataset.state, "success", "목록을 불러오면 성공 상태를 표시해야 합니다.");
assert.match(publishDocument.querySelector("#school-import-status").textContent, /두 번 클릭하면 바로 초안을 생성/, "공고 목록에 더블클릭 생성 방법을 안내해야 합니다.");
assert.doesNotMatch(publishDocument.querySelector(".mock-list-note").textContent, /프로토타입|시뮬레이션|예시 데이터/, "학교 공고 목록 안내에는 예시 데이터 문구가 없어야 합니다.");
assert.match(publishDocument.querySelector(".school-notice-state-label").textContent, /선택 가능/, "처리 전 공고는 선택 가능 상태로 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#school-bulk-toolbar"), null, "Codex 초안 생성의 학교 공고 선택 영역에는 체크 선택 도구를 표시하지 않아야 합니다.");
assert.equal(publishDocument.querySelectorAll(".school-notice-checkbox").length, 0, "학교 공고 선택 항목에는 개별 체크박스를 표시하지 않아야 합니다.");
const schoolNoticeItems = [...publishDocument.querySelectorAll(".school-notice-item")];
schoolNoticeItems[1].dispatchEvent(new publishWindow.MouseEvent("dblclick", { bubbles: true }));
await new Promise((resolve) => publishWindow.setTimeout(resolve, 0));
assert.match(publishDocument.querySelector("#draft-title").value, /장학금 신청 안내/, "학교 공고를 더블클릭하면 선택과 동시에 초안을 생성해야 합니다.");
assert.equal(publishDocument.querySelector("#draft-chip").textContent, "검수 필요", "더블클릭으로 생성한 초안도 검수 필요 상태로 표시되어야 합니다.");
assert.equal(publishDocument.querySelector(".publish-completion-toast").textContent, "초안 생성을 완료했습니다.", "학교 공고 초안 생성 완료 시에도 비차단 완료 박스를 표시해야 합니다.");
click(publishWindow, ".school-notice-item");
assert.equal(publishDocument.querySelector(".school-notice-item").getAttribute("aria-current"), "true", "공고를 선택하면 선택 상태가 명확히 표시되어야 합니다.");
assert.match(publishDocument.querySelector("#selected-notice-title").textContent, /2026학년도 비교과 프로그램 참가자 모집/, "선택한 공고 제목이 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, true, "새 공고를 선택해 기존 초안이 초기화되면 빠른 작업바를 다시 숨겨야 합니다.");
assert.match(publishDocument.querySelector("#selected-notice-source").textContent, /학생지원팀 · 2026\.07\.23 · HTML/, "선택한 공고 출처 정보가 표시되어야 합니다.");
publishDocument.querySelector("#admin-ingest-form").dispatchEvent(new publishWindow.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(publishDocument.querySelector("#draft-chip").textContent, "검수 필요", "목록 선택으로 만든 초안은 검수 필요 상태로 표시되어야 합니다.");
assert.match(publishDocument.querySelector("#draft-title").value, /2026학년도 비교과 프로그램 참가자 모집/, "목록 선택 초안의 제목이 편집 필드에 표시되어야 합니다.");
assert.match(publishDocument.querySelector("#publish-selection-summary").textContent, /2026학년도 비교과 프로그램 참가자 모집/, "초안 생성 후 빠른 작업바에 선택한 공고가 표시되어야 합니다.");
assert.match(publishDocument.querySelector("#approval-note").textContent, /원문과 세부 내용을 확인/, "목록 선택 초안은 공개 전 확인 안내를 표시해야 합니다.");
assert.doesNotMatch(publishDocument.querySelector("#approval-note").textContent, /프로토타입|가상|샘플|예시 데이터/, "목록 선택 초안 안내에는 내부 검증 문구가 없어야 합니다.");
assert.equal(publishDocument.querySelector(".approval-panel"), null, "공고 생성 페이지에는 별도 관리자 검수 체크 카드를 표시하지 않아야 합니다.");
assert.equal(publishDocument.querySelectorAll(".approval-checkbox").length, 0, "관리자 검수 안내는 체크박스 기능을 사용하지 않아야 합니다.");
assert.equal(publishDocument.querySelectorAll(".publish-action-buttons button").length, 2, "빠른 작업바에는 보류와 공개 승인 버튼만 표시해야 합니다.");
assert.equal(publishDocument.querySelector("#sticky-decline-draft-button").textContent, "보류", "빠른 작업바에 보류 버튼이 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#sticky-approve-draft-button").textContent, "공개 승인", "빠른 작업바에 공개 승인 버튼이 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#sticky-approve-draft-button").disabled, false, "초안 생성 후 공개 승인 버튼을 사용할 수 있어야 합니다.");
assert.equal(publishDocument.querySelector("#publish-check-summary").textContent, "마지막으로 확인하셨나요?", "빠른 작업바는 관리자에게 최종 확인 문구를 보여야 합니다.");
click(publishWindow, "input[value='url']");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, true, "학교 홈페이지에서 가져오기 영역을 벗어나면 빠른 작업바가 자동으로 사라져야 합니다.");
assert.equal(publishDocument.querySelector("#draft-fields").hidden, true, "입력 방식을 바꾸면 이전 방식의 초안 입력 항목을 숨겨야 합니다.");
click(publishWindow, "input[value='list']");
click(publishWindow, ".school-notice-item");
publishDocument.querySelector("#admin-ingest-form").dispatchEvent(new publishWindow.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, false, "학교 공고를 다시 선택해 초안을 생성하면 빠른 작업바가 다시 표시되어야 합니다.");
setValue(publishWindow, "#draft-title", "관리자가 수정한 비교과 프로그램 공고");
click(publishWindow, "#sticky-decline-draft-button");
await new Promise((resolve) => publishWindow.setTimeout(resolve, 0));
assert.equal(publishDocument.querySelector(".publish-completion-toast").textContent, "공고를 보류했습니다.", "보류 시 완료 안내 문구를 표시해야 합니다.");
assert.equal(publishDocument.querySelector(".publish-completion-toast").dataset.tone, "danger", "보류 완료 안내는 보류 버튼과 같은 위험 상태 색상을 사용해야 합니다.");
assert.equal(publishDocument.querySelector("#draft-fields").hidden, true, "보류 후 생성 초안 입력 항목을 숨겨야 합니다.");
assert.equal(publishDocument.querySelector("#draft-empty").hidden, false, "보류 후 초안 미생성 화면으로 돌아가야 합니다.");
assert.equal(publishDocument.querySelector("#draft-chip").textContent, "미생성", "보류 후 초안 상태를 미생성으로 초기화해야 합니다.");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, true, "보류 후 하단 액션바를 숨겨야 합니다.");
assert.equal(publishDocument.body.classList.contains("has-publish-action-bar"), false, "보류 후 하단 액션바용 본문 여백을 제거해야 합니다.");
assert.equal(publishDocument.querySelectorAll(".school-notice-item[aria-current='true']").length, 0, "보류 후 선택된 학교 공고 상태를 해제해야 합니다.");
assert.equal(publishDocument.querySelector(".published-item").dataset.approvalStatus, "declined", "관리자 목록에서 보류 상태가 표시되어야 합니다.");
assert.equal([...publishDocument.querySelectorAll(".published-item")].every((item) => item.dataset.approvalStatus === "declined"), true, "공고 생성 화면 하단에는 보류된 항목만 표시해야 합니다.");
assert.match(publishDocument.querySelector("#published-list").textContent, /관리자가 수정한 비교과 프로그램 공고/, "보류한 공고가 보류 목록에 표시되어야 합니다.");
assert.equal(publishDocument.querySelector(".school-notice-item").disabled, true, "처리 완료 공고는 다시 선택할 수 없어야 합니다.");
assert.equal(publishDocument.querySelector(".school-notice-item").dataset.processed, "true", "처리 완료 공고는 처리 상태 데이터가 표시되어야 합니다.");
assert.match(publishDocument.querySelector(".school-notice-state-label").textContent, /처리 완료/, "처리 완료 공고에는 처리 완료 상태를 표시해야 합니다.");
const declinedNotices = JSON.parse(publishWindow.localStorage.getItem("kangnamPublishedNotices"));
const declinedListWindow = bootListWithStorage(declinedNotices, JSON.parse(publishWindow.localStorage.getItem("kangnamDeletedNoticeIds")));
assert.doesNotMatch(declinedListWindow.document.querySelector("#notice-list").textContent, /관리자가 수정한 비교과 프로그램 공고/, "보류된 공고는 학생 목록에 표시되지 않아야 합니다.");
const nextSchoolNotice = [...publishDocument.querySelectorAll(".school-notice-item")].find((item) => !item.disabled);
nextSchoolNotice.dispatchEvent(new publishWindow.MouseEvent("dblclick", { bubbles: true }));
await new Promise((resolve) => publishWindow.setTimeout(resolve, 0));
setValue(publishWindow, "#draft-title", "공개 승인 테스트 공고");
assert.equal(publishDocument.querySelector("#publish-action-bar").hidden, false, "다른 초안을 생성하면 하단 액션바를 다시 표시해야 합니다.");
click(publishWindow, "#sticky-approve-draft-button");
await new Promise((resolve) => publishWindow.setTimeout(resolve, 0));
assert.equal(publishDocument.querySelector("#approval-note").textContent, "공고가 학생에게 공개되었습니다.", "공개 승인 시 안내 문구가 표시되어야 합니다.");
assert.equal(publishDocument.querySelector(".publish-completion-toast").textContent, "공고 공개 승인을 완료했습니다.", "공개 승인 완료 시 비차단 완료 박스를 표시해야 합니다.");
assert.equal(publishDocument.querySelector("#draft-chip").textContent, "공개", "공개 승인 시 생성 초안 상태가 공개로 바뀌어야 합니다.");
const approvedNotices = JSON.parse(publishWindow.localStorage.getItem("kangnamPublishedNotices"));
const approvedListWindow = bootListWithStorage(approvedNotices, JSON.parse(publishWindow.localStorage.getItem("kangnamDeletedNoticeIds")));
assert.match(approvedListWindow.document.querySelector("#notice-list").textContent, /공개 승인 테스트 공고/, "수정한 제목으로 공개 승인된 공고가 학생 목록에 표시되어야 합니다.");
const approvedSchoolNotice = approvedNotices.find((notice) => notice.title === "공개 승인 테스트 공고");
assert.ok(approvedSchoolNotice, "학교 공고 선택으로 공개 승인한 공고가 저장되어야 합니다.");
assert.match(approvedSchoolNotice.sourceUrl, /^https:\/\/web\.kangnam\.ac\.kr\/menu\/board\/info\//, "학교 공고 선택 초안은 공식 공고 상세 URL을 출처로 저장해야 합니다.");
assert.doesNotMatch(approvedSchoolNotice.sourceUrl, /\/mock\/|\/common\//, "학교 공고 선택 초안의 출처 URL에는 예시 또는 공통 파일 URL을 저장하지 않아야 합니다.");
assert.doesNotMatch(approvedSchoolNotice.sourceUrl, /encMenuBoardSeq=schoolnotice\d+/i, "학교 공고 선택 초안은 샘플 게시글 번호를 공식 출처 URL로 저장하지 않아야 합니다.");
const approvedDetailWindow = bootNoticeWithStorage(approvedSchoolNotice.id, approvedNotices, JSON.parse(publishWindow.localStorage.getItem("kangnamDeletedNoticeIds")));
click(approvedDetailWindow, "#full-notice-toggle");
assert.equal(approvedDetailWindow.document.querySelector("#full-notice-source-link").hidden, false, "공개된 상세 화면 전체 공고 영역에는 원문 링크가 보여야 합니다.");
assert.equal(approvedDetailWindow.document.querySelector("#full-notice-source-link").href, approvedSchoolNotice.sourceUrl, "전체 공고 영역 원문 링크는 공개 승인 때 저장한 공식 출처 URL을 가리켜야 합니다.");
assert.doesNotMatch(publishDocument.querySelector("#published-list").textContent, /공개 승인 테스트 공고/, "공개 승인된 공고는 보류 목록에 표시하지 않아야 합니다.");
assert.match(publishDocument.querySelector("#published-list").textContent, /관리자가 수정한 비교과 프로그램 공고/, "기존 보류 공고는 공개 승인 후에도 보류 목록에 남아야 합니다.");
assert.equal(publishDocument.querySelector("#published-bulk-toolbar").hidden, false, "보류 목록에는 일괄 선택 도구가 표시되어야 합니다.");
assert.equal(publishDocument.querySelector("#published-bulk-toolbar #clear-published-selection-button"), null, "보류 목록에는 별도 선택 해제 버튼을 표시하지 않아야 합니다.");
assert.equal(publishDocument.querySelector("#published-bulk-toolbar #bulk-decline-published-button"), null, "보류 목록에는 이미 보류된 공고를 다시 보류하는 버튼을 표시하지 않아야 합니다.");
assert.equal(publishDocument.querySelectorAll("#published-bulk-toolbar .bulk-selection-actions button").length, 1, "보류 목록 일괄 작업은 선택 공개만 제공해야 합니다.");
click(publishWindow, "#published-select-all");
assert.match(publishDocument.querySelector("#published-bulk-summary").textContent, /6개 선택됨/, "보류 목록 전체 선택 시 보이는 보류 공고 개수를 표시해야 합니다.");
click(publishWindow, "#bulk-publish-published-button");
await new Promise((resolve) => publishWindow.setTimeout(resolve, 0));
assert.equal(publishDocument.querySelector(".publish-completion-toast").textContent, "6개 공고를 공개했습니다.", "선택한 보류 공고를 한 번에 공개할 수 있어야 합니다.");
assert.equal(publishDocument.querySelectorAll(".published-item").length, 0, "일괄 공개 후 보류 목록은 비어야 합니다.");
assert.equal(publishDocument.querySelector("#simulate-school-error-button"), null, "공고 생성 화면에는 오류 시뮬레이션 버튼을 표시하지 않아야 합니다.");
assert.match(manageHtml, /href="\.\/admin\.html"[^>]*>[\s\S]*?관리자 메뉴로/, "공개 공고 관리 화면에서 관리자 메뉴로 돌아갈 수 있어야 합니다.");
const manageWindow = await bootManageWithStorage(JSON.parse(publishWindow.localStorage.getItem("kangnamPublishedNotices")), JSON.parse(publishWindow.localStorage.getItem("kangnamDeletedNoticeIds")));
const manageDocument = manageWindow.document;
assert.equal(manageDocument.querySelector("#published-list").getAttribute("aria-label"), "공개된 공고 목록", "공개 공고 관리 목록은 용도를 명확히 알려야 합니다.");
assert.equal([...manageDocument.querySelectorAll(".published-item")].every((item) => item.dataset.approvalStatus === "published"), true, "공개 공고 수정·삭제 화면에는 공개된 공고만 표시해야 합니다.");
assert.match(manageDocument.querySelector("#published-list").textContent, /공개 승인 테스트 공고/, "공개 승인된 공고는 공개 공고 관리 목록에 표시되어야 합니다.");
assert.match(manageDocument.querySelector("#published-list").textContent, /관리자가 수정한 비교과 프로그램 공고/, "보류에서 일괄 공개한 공고도 공개 공고 관리 목록에 표시되어야 합니다.");
assert.equal(manageDocument.querySelector("#published-bulk-toolbar").hidden, false, "공개 공고 관리 화면에는 일괄 선택 도구가 표시되어야 합니다.");
click(manageWindow, "#published-select-all");
assert.match(manageDocument.querySelector("#published-bulk-summary").textContent, /6개 선택됨/, "공개 공고 관리 화면에서 전체 선택 개수를 확인할 수 있어야 합니다.");
click(manageWindow, "#bulk-delete-published-button");
await new Promise((resolve) => manageWindow.setTimeout(resolve, 0));
assert.equal(manageDocument.querySelector(".publish-completion-toast").textContent, "6개 공고를 삭제했습니다.", "선택한 공개 공고를 한 번에 삭제할 수 있어야 합니다.");
assert.equal(JSON.parse(manageWindow.localStorage.getItem("kangnamPublishedNotices")).length, 0, "일괄 삭제한 공고는 저장 목록에서 제거되어야 합니다.");
const deletedNoticeIds = JSON.parse(manageWindow.localStorage.getItem("kangnamDeletedNoticeIds"));
const republishWindow = bootPublish({ publishedNotices: [], deletedNoticeIds });
const republishDocument = republishWindow.document;
await new Promise((resolve) => republishWindow.setTimeout(resolve, 0));
click(republishWindow, "input[value='list']");
click(republishWindow, "#load-school-notices-button");
await new Promise((resolve) => republishWindow.setTimeout(resolve, 500));
const republishSourceMock = schoolNoticeMocks.find((notice) => notice.sourceUrl === approvedSchoolNotice.sourceUrl);
assert.ok(republishSourceMock, "재등록 대상 공고는 학교 가져오기 목록에서 같은 원문 URL로 다시 찾을 수 있어야 합니다.");
const republishItems = [...republishDocument.querySelectorAll(".school-notice-item")];
assert.equal(republishItems.length, 10, "재등록 확인 시 학교 홈페이지 공고 목록을 다시 불러와야 합니다.");
const republishItem = republishItems.find((item) => item.dataset.noticeId === republishSourceMock.id || item.textContent.includes(republishSourceMock.title));
assert.ok(republishItem, "manage.html에서 삭제한 학교 공고는 publish.html 가져오기 목록에 다시 표시되어야 합니다.");
assert.equal(republishItem.disabled, false, "manage.html에서 삭제한 학교 공고는 publish.html에서 다시 선택할 수 있어야 합니다.");
republishItem.dispatchEvent(new republishWindow.MouseEvent("dblclick", { bubbles: true }));
await new Promise((resolve) => republishWindow.setTimeout(resolve, 0));
setValue(republishWindow, "#draft-title", "삭제 후 재등록 테스트 공고");
click(republishWindow, "#sticky-approve-draft-button");
await new Promise((resolve) => republishWindow.setTimeout(resolve, 0));
const republishedNotices = JSON.parse(republishWindow.localStorage.getItem("kangnamPublishedNotices"));
const republishedNotice = republishedNotices.find((notice) => notice.id === approvedSchoolNotice.id);
assert.ok(republishedNotice, "삭제했던 공고를 다시 공개하면 같은 ID로 저장되어야 합니다.");
assert.equal(republishedNotice.title, "삭제 후 재등록 테스트 공고", "삭제 후 재등록한 공고의 새 제목이 저장되어야 합니다.");
assert.equal(JSON.parse(republishWindow.localStorage.getItem("kangnamDeletedNoticeIds")).includes(approvedSchoolNotice.id), false, "재등록한 공고 ID는 삭제 목록에서 제거되어야 합니다.");
const republishedListWindow = bootListWithStorage(republishedNotices, JSON.parse(republishWindow.localStorage.getItem("kangnamDeletedNoticeIds")));
assert.match(republishedListWindow.document.querySelector("#notice-list").textContent, /삭제 후 재등록 테스트 공고/, "삭제했던 공고도 다시 공개하면 학생 목록에 다시 표시되어야 합니다.");
const duplicateSourceNotices = [
  {
    ...republishedNotice,
    id: "duplicate-source-a",
    title: "중복 출처 A 공고",
    summary: "A 공고만의 상세 내용입니다.",
    originalContent: "A 공고 전체 내용",
  },
  {
    ...republishedNotice,
    id: "duplicate-source-b",
    title: "중복 출처 B 공고",
    summary: "B 공고만의 상세 내용입니다.",
    originalContent: "B 공고 전체 내용",
  },
];
const duplicateSourceListWindow = bootListWithStorage(duplicateSourceNotices, []);
assert.match(duplicateSourceListWindow.document.querySelector("#notice-list").textContent, /중복 출처 A 공고/, "같은 원문 URL을 가진 첫 번째 공고도 목록에 유지되어야 합니다.");
assert.match(duplicateSourceListWindow.document.querySelector("#notice-list").textContent, /중복 출처 B 공고/, "같은 원문 URL을 가진 두 번째 공고도 목록에 유지되어야 합니다.");
const duplicateSourceDetailWindow = bootNoticeWithStorage("duplicate-source-b", duplicateSourceNotices, []);
assert.equal(duplicateSourceDetailWindow.document.querySelector("#notice-title").textContent, "중복 출처 B 공고", "상세 페이지는 sourceUrl이 같아도 notice ID에 맞는 공고 제목을 표시해야 합니다.");
assert.match(duplicateSourceDetailWindow.document.querySelector("#program-overview").textContent, /B 공고만의 상세 내용/, "상세 페이지는 sourceUrl이 같아도 notice ID에 맞는 공고 내용을 표시해야 합니다.");
assert.equal(duplicateSourceDetailWindow.document.querySelector("#source-original-link").href, republishedNotice.sourceUrl, "상세 페이지의 공식 원문 링크는 해당 공고의 sourceUrl을 유지해야 합니다.");
assert.equal(document.querySelectorAll(".faq-item").length, 3, "P0 FAQ 3개가 표시되어야 합니다.");
assert.equal(document.querySelectorAll(".key-facts > div").length, 6, "핵심 정보는 신청 기간, 지원 대상, 모집 분야, 제출 서류, 운영 기간, 담당 부서 6개 항목으로 표시되어야 합니다.");
assert.equal(document.querySelector("#fact-documents").textContent, "지원서", "핵심 정보에 제출 서류가 표시되어야 합니다.");
assert.equal(document.querySelector("#fact-operation").textContent, "2026학년도 2학기", "핵심 정보에 운영 기간이 표시되어야 합니다.");
assert.equal(document.querySelector("#fact-department").textContent, "입학전형관리팀", "핵심 정보에 담당 부서가 표시되어야 합니다.");
assert.equal(document.querySelector("#eligible-current-student").textContent, "가능", "상세 화면에는 재학생 가능 여부가 표시되어야 합니다.");
assert.equal(document.querySelector("#eligible-leave-student").textContent, "불가", "상세 화면에는 휴학생 가능 여부가 표시되어야 합니다.");
assert.equal(document.querySelector("#eligible-transfer-student").textContent, "가능", "상세 화면에는 편입생 가능 여부가 표시되어야 합니다.");
assert.equal(document.querySelector("#eligible-graduate").textContent, "공고 원문에서 확인 필요", "확인되지 않은 졸업생 조건은 추정하지 않아야 합니다.");
assert.equal(document.querySelector("#eligible-grades").textContent, "공고 원문에서 확인 필요", "확인되지 않은 대상 학년은 확인 필요로 표시해야 합니다.");
assert.equal(mockDocument.querySelector("#eligible-current-student").textContent, "공고 원문에서 확인 필요", "조건 필드가 없는 공고 상세는 확인 필요 문구를 표시해야 합니다.");
assert.match(document.querySelector("#program-overview").textContent, /늘품의 2026학년도 2학기 수습 임원/, "프로그램 개요가 공고 요약을 표시해야 합니다.");
assert.equal(document.querySelector("#full-documents").textContent, "지원서", "전체 공고 내용에도 제출 서류가 표시되어야 합니다.");
assert.equal(document.querySelector("#full-notice-panel").hidden, true, "전체 공고 내용은 기본 상태에서 닫혀 있어야 합니다.");
assert.equal(document.querySelector("#full-notice-toggle").getAttribute("aria-expanded"), "false", "전체 공고 토글 버튼은 닫힌 접근성 상태를 알려야 합니다.");
assert.equal(document.querySelector("#full-notice-toggle").getAttribute("aria-controls"), "full-notice-panel", "전체 공고 토글 버튼은 제어하는 영역을 가리켜야 합니다.");
click(window, "#full-notice-toggle");
assert.equal(document.querySelector("#full-notice-panel").hidden, false, "전체 공고 보기 버튼을 누르면 같은 페이지에서 내용이 펼쳐져야 합니다.");
assert.equal(document.querySelector("#full-notice-toggle").textContent, "전체 공고 내용 닫기", "열린 상태에서는 버튼 문구가 닫기로 바뀌어야 합니다.");
assert.equal(document.querySelector("#full-notice-toggle").getAttribute("aria-expanded"), "true", "전체 공고 토글 버튼은 열린 접근성 상태를 알려야 합니다.");
assert.match(document.querySelector("#full-notice-text").textContent, /신청 기간: 7월 20일/, "펼친 영역에는 저장된 전체 공고 텍스트가 표시되어야 합니다.");
assert.equal(document.querySelector("#full-notice-source-link").href, officialNoticeUrl, "펼친 영역에는 원문 링크가 표시되어야 합니다.");
assert.equal(document.querySelector("#full-notice-image-wrap").hidden, true, "원문 이미지 URL이 없으면 이미지 영역을 숨겨야 합니다.");
click(window, "#full-notice-toggle");
assert.equal(document.querySelector("#full-notice-panel").hidden, true, "전체 공고 닫기 버튼을 누르면 내용이 다시 닫혀야 합니다.");
assert.equal(document.querySelector("#full-notice-toggle").textContent, "전체 공고 내용 보기", "닫힌 상태에서는 버튼 문구가 보기로 돌아와야 합니다.");
assert.equal(mockDocument.querySelector("#full-notice-image-wrap").hidden, false, "원문 이미지 URL이 있으면 이미지 영역을 표시해야 합니다.");
assert.equal(mockDocument.querySelectorAll(".source-image-figure").length, 1, "imageUrls 배열의 이미지를 전체 공고 영역에 표시해야 합니다.");
assert.equal(mockDocument.querySelector(".source-image-link").href, "https://example.invalid/missing-notice.png", "이미지를 클릭하면 새 창에서 원본을 열 수 있어야 합니다.");
assert.match(mockDocument.querySelector(".source-image-link img").alt, /확인 공고 원문 원문 이미지 1/, "각 원문 이미지에는 대체 텍스트가 있어야 합니다.");
mockDocument.querySelector(".source-image-link img").dispatchEvent(new mockWindow.Event("error"));
assert.equal(mockDocument.querySelector(".image-fallback").hidden, false, "원문 이미지가 깨지면 대체 안내 문구를 보여야 합니다.");
assert.equal(mockDocument.querySelector(".image-fallback").textContent, "원문 이미지를 불러오지 못했습니다. 공식 원문 링크에서 확인해 주세요.", "이미지 오류 안내 문구가 정확해야 합니다.");
assert.equal(document.querySelector("#source-contact-department").textContent, "입학전형관리팀", "출처 및 담당 부서 섹션에 담당 부서가 표시되어야 합니다.");
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
assert.equal(staleSourceDocument.querySelector("#source-original-link").hidden, false, "같은 공고의 이전 저장 데이터에 원문 URL이 없어도 기본 원문 링크를 복구해야 합니다.");
assert.equal(staleSourceDocument.querySelector("#source-original-link").href, officialNoticeUrl, "이전 저장 데이터는 기본 공고의 공식 원문 링크로 보강되어야 합니다.");
assert.equal(staleSourceDocument.querySelector("#full-notice-source-link").href, officialNoticeUrl, "전체 공고 영역도 보강된 공식 원문 링크를 유지해야 합니다.");
assert.equal(mockDocument.querySelector("#mock-source-note").hidden, true, "출처 URL이 없는 공고에도 내부 검증 안내 문구를 표시하지 않아야 합니다.");
assert.doesNotMatch(mockDocument.body.textContent, /프로토타입|가상|샘플|피드백용|확인할 내용/, "상세 화면에는 내부 검증 문구가 없어야 합니다.");
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
assert.equal(typeof window.KANGNAM_ANSWER_SERVICE.generateAnswer, "function", "답변 생성 서비스는 generateAnswer 인터페이스를 제공해야 합니다.");
const mockServiceResult = await window.KANGNAM_ANSWER_SERVICE.generateAnswer("편입생도 지원 가능한가요?", window.KANGNAM_ANSWER_SERVICE ? { ...window.KANGNAM_ANSWER_SERVICE, faqs: [] } : {});
assert.equal(typeof mockServiceResult.status, "string", "mockAnswerService는 결과 상태를 반환해야 합니다.");
let capturedAnswerRequest = null;
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  capturedAnswerRequest = { url: String(url), body: JSON.parse(options.body) };
  return {
    ok: true,
    json: async () => ({ status: "success", answer: "Gemini 함수 답변", source: "공식 공고 원문 및 이미지" }),
  };
};
const geminiServiceResult = await window.KANGNAM_ANSWER_SERVICE.generateAnswer("이미지에 나온 모집 분야가 뭐야?", {
  sourceUrl: officialNoticeUrl,
  sourceImageUrl: "https://web.kangnam.ac.kr/example/notice-card.png",
  imageUrls: ["https://web.kangnam.ac.kr/example/notice-card.png"],
  title: "이미지 공고",
  department: "입학전형관리팀",
  summary: "이미지 공고 요약",
  facts: { field: "이미지 확인 필요" },
});
assert.equal(capturedAnswerRequest.url, "/api/askNotice", "공식 공고 질문은 서버리스 Gemini 함수로 전달해야 합니다.");
assert.equal(capturedAnswerRequest.body.sourceUrl, officialNoticeUrl, "Gemini 함수 요청에는 공식 공고 원문 URL이 포함되어야 합니다.");
assert.deepEqual(capturedAnswerRequest.body.imageUrls, ["https://web.kangnam.ac.kr/example/notice-card.png"], "Gemini 함수 요청에는 저장된 원문 이미지 URL이 포함되어야 합니다.");
assert.equal(geminiServiceResult.answer, "Gemini 함수 답변", "Gemini 함수가 성공하면 함수 답변을 표시해야 합니다.");
window.fetch = async () => {
  throw new Error("local preview has no answer function");
};

click(window, "#retry-button");
assert.equal(document.querySelector("#question-input").value, "", "다른 질문하기는 입력을 초기화해야 합니다.");
assert.equal(document.querySelector("#answer-card").hidden, true, "다른 질문하기는 이전 결과를 숨겨야 합니다.");

submit(window);
assert.equal(document.querySelector("#question-error").textContent, "질문을 입력해주세요.", "빈 입력 안내가 정확히 표시되어야 합니다.");
assert.equal(document.querySelector("#question-input").getAttribute("aria-invalid"), "true", "빈 입력 필드가 접근성 오류 상태여야 합니다.");

setValue(window, "#question-input", "편입생도 지원 가능한가요?");
submit(window);
assert.equal(document.querySelector("#answer-state").textContent, "생성 중", "질문 제출 시 loading 상태를 표시해야 합니다.");
await new Promise((resolve) => window.setTimeout(resolve, 0));
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
await submitAndWait(window);
assert.equal(document.querySelector("#answer-copy").textContent, "검색 결과가 없습니다. 담당 부서에 문의해주세요.", "준비되지 않은 질문은 실패 상태를 보여야 합니다.");
assert.equal(document.querySelector("#evidence-card").hidden, true, "검색 실패 시 근거를 임의로 표시하지 않아야 합니다.");
assert.ok(document.querySelector("#department-button"), "검색 실패 후에도 담당 부서로 이동할 수 있어야 합니다.");
window.fetch = originalFetch;

assert.doesNotMatch(script, /generativelanguage\.googleapis|GEMINI_API_KEY/, "상세 화면 스크립트에 Gemini API 키나 직접 호출 URL이 없어야 합니다.");
assert.doesNotMatch(answerServiceScript, /generativelanguage\.googleapis|GEMINI_API_KEY/, "답변 서비스는 Gemini API를 직접 호출하지 않아야 합니다.");
assert.match(answerServiceScript, /\/api\/askNotice/, "답변 서비스는 서버리스 답변 함수만 호출해야 합니다.");
assert.match(answerServiceScript, /generateAnswer\(question, notice\)/, "실제 AI 교체 지점은 generateAnswer(question, notice) 인터페이스여야 합니다.");
assert.doesNotMatch(html + listHtml + script + listScript, /031-\d{3,4}-\d{4}/, "앱 데이터에 실제 또는 가상 전화번호를 복사하지 않아야 합니다.");
assert.doesNotMatch(html + listHtml + script + listScript, /(sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16})/, "대표적인 API 키 패턴이 없어야 합니다.");
assert.equal(document.querySelector("#feedback-title"), null, "상세 화면에는 부서 피드백 메모를 표시하지 않아야 합니다.");
assert.equal(document.querySelector('link[rel="preload"][as="font"]').getAttribute("href"), "./assets/fonts/PretendardVariable.woff2", "공통 글꼴을 렌더링 전에 불러와야 합니다.");
assert.match(styles, /font-family:\s*"Pretendard Variable"/, "Mac, Windows, 웹에서 공통 글꼴을 우선 사용해야 합니다.");
assert.match(styles, /\.notice-hero h1\s*\{[^}]*word-break:\s*keep-all/s, "상세 공고 제목은 한글 단어 중간에서 줄바꿈되지 않아야 합니다.");
assert.match(styles, /\.notice-hero h1\s*\{[^}]*overflow-wrap:\s*anywhere/s, "매우 긴 공고 제목은 좁은 화면에서도 영역을 넘지 않아야 합니다.");
assert.match(styles, /\.key-facts\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/s, "핵심 정보는 데스크톱에서 정돈된 그리드로 표시되어야 합니다.");
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*\.key-facts\s*\{[\s\S]*grid-template-columns:\s*1fr/s, "모바일에서 핵심 정보는 한 열로 정렬되어야 합니다.");
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*\.full-notice-details\s*\{[\s\S]*grid-template-columns:\s*1fr/s, "모바일에서 전체 공고 내용도 한 열로 정렬되어야 합니다.");
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*\.user-flow-list,[\s\S]*\.admin-flow-section \.user-flow-list\s*\{[\s\S]*grid-template-columns:\s*1fr/s, "모바일에서 학생과 관리자 흐름은 세로로 정렬되어야 합니다.");
assert.match(styles, /\.admin-action-section\s*\{[^}]*background:\s*var\(--primary-50\)[^}]*border:\s*1px solid var\(--primary-100\)/s, "관리자 작업 버튼은 사용 흐름과 구분되는 별도 영역에 배치되어야 합니다.");
assert.match(styles, /\.admin-menu-card\s*\{[^}]*min-height:\s*218px[^}]*border:\s*2px solid var\(--primary-100\)[^}]*cursor:\s*pointer/s, "관리자 작업 카드는 크고 클릭 가능한 버튼 형태여야 합니다.");
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*\.admin-menu-card\s*\{[\s\S]*min-height:\s*202px/s, "모바일에서도 관리자 작업 버튼이 충분한 크기를 유지해야 합니다.");
assert.match(styles, /\.publish-action-bar\s*\{[^}]*position:\s*fixed[^}]*bottom:\s*18px/s, "AI 공고 공개 빠른 작업바는 스크롤 중에도 하단에 고정되어야 합니다.");
assert.match(styles, /\.publish-action-close\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s, "빠른 작업바 닫기 버튼은 모바일에서도 누르기 쉬운 44px 터치 영역을 가져야 합니다.");
assert.match(styles, /\.publish-action-close:focus-visible\s*\{[^}]*outline:/s, "빠른 작업바 닫기 버튼은 키보드 포커스를 명확히 표시해야 합니다.");
assert.match(styles, /\.publish-grid\s*\{[^}]*align-items:\s*start/s, "공고 입력 카드와 생성 초안 카드는 각 콘텐츠 높이에 맞춰야 합니다.");
assert.match(styles, /\.publish-grid \.draft-panel\s*\{[^}]*min-height:\s*0[^}]*align-self:\s*start/s, "생성 초안 카드에는 불필요한 최소 높이와 하단 여백이 없어야 합니다.");
assert.match(styles, /\.publish-action-summary strong\s*\{[^}]*white-space:\s*normal/s, "빠른 작업바의 최종 확인 문구는 잘리지 않고 줄바꿈되어야 합니다.");
assert.doesNotMatch(styles, /body\.notice-color-preview/, "상세 공고의 임시 색상 미리보기 스타일은 제거되어야 합니다.");
assert.match(styles, /\.bulk-selection-toolbar\s*\{[^}]*flex-wrap:\s*wrap[^}]*background:\s*var\(--primary-50\)[^}]*border:\s*1px solid var\(--primary-100\)/s, "일괄 선택 도구는 기존 관리자 블루 톤과 맞는 구분 영역으로 표시되어야 합니다.");
assert.match(styles, /\.bulk-select-all input,[\s\S]*\.bulk-item-check input\s*\{[^}]*accent-color:\s*var\(--primary-800\)/s, "일괄 선택 체크박스는 기본 접근성 입력과 포인트 색상을 사용해야 합니다.");
assert.match(styles, /\.school-notice-row\s*\{[^}]*display:\s*block/s, "학교 공고 선택 행은 체크박스 없이 카드 하나가 전체 폭을 사용해야 합니다.");
assert.match(styles, /\.published-row\s*\{[^}]*position:\s*relative/s, "공개 공고 카드의 체크박스는 카드 내부에 배치되어야 합니다.");
assert.match(styles, /\.published-row \.bulk-item-check\s*\{[^}]*position:\s*absolute[^}]*right:\s*10px[^}]*bottom:\s*10px/s, "공개 공고 체크박스는 각 카드의 오른쪽 아래에 표시되어야 합니다.");
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*\.publish-action-buttons\s*\{[\s\S]*grid-template-columns:\s*1fr 1fr/s, "모바일 빠른 작업바 버튼은 두 열로 정돈되어야 합니다.");
assert.doesNotMatch(styles, /@media \(max-width: 700px\)[\s\S]*\.school-notice-row\s*\{[\s\S]*grid-template-columns/s, "모바일에서도 학교 공고 선택 행은 별도 체크박스 열을 만들지 않아야 합니다.");
assert.match(styles, /\.publish-completion-toast\s*\{[^}]*top:\s*50%[^}]*left:\s*50%[^}]*background:\s*var\(--status-success-700\)[^}]*transform-origin:\s*center[^}]*animation:\s*publish-toast-grow/s, "완료 안내는 화면 중앙의 상태 박스로 표시되어야 합니다.");
assert.match(styles, /\.publish-completion-toast\[data-tone="danger"\]\s*\{[^}]*background:\s*var\(--status-danger-700\)/s, "보류 완료 안내는 보류 버튼과 같은 위험 상태 색상을 사용해야 합니다.");
assert.match(styles, /@keyframes publish-toast-grow[\s\S]*translate\(-50%,\s*-50%\) scale\(0\.88\)[\s\S]*translate\(-50%,\s*-50%\) scale\(1\)/, "완료 안내 박스는 화면 중앙에서 자연스럽게 나타나야 합니다.");
assert.doesNotMatch(adminScript, /window\.alert|alert\(/, "관리자 스크립트는 클릭이 필요한 alert 창을 사용하지 않아야 합니다.");
assert.match(styles, /\.full-notice-text\s*\{[^}]*overflow-wrap:\s*anywhere/s, "긴 전체 공고 텍스트는 화면 밖으로 넘치지 않아야 합니다.");
assert.match(styles, /\.source-image-link img,[\s\S]*\.full-notice-image-wrap img\s*\{[^}]*max-width:\s*100%/s, "원문 이미지는 모바일 폭을 넘지 않아야 합니다.");
assert.match(styles, /\.notice-card-status\[data-status="마감 임박"\]\s*\{[^}]*status-danger-700/s, "마감 임박 공고는 기존 위험 강조 디자인을 사용해야 합니다.");
assert.match(styles, /\.notice-list-item\[data-status="마감"\]\s*\{[^}]*opacity:\s*0\.86[^}]*filter:\s*grayscale/s, "마감된 공고 카드는 읽을 수 있는 수준으로 흐리게 구분해야 합니다.");
assert.match(styles, /\.login-route-guide\s*\{[^}]*grid-template-columns:\s*1fr 1fr/s, "통합 로그인 화면은 학생·관리자 이동 안내를 나란히 보여야 합니다.");
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*\.login-route-guide\s*\{[\s\S]*grid-template-columns:\s*1fr/s, "모바일에서는 학생·관리자 이동 안내가 한 열로 정렬되어야 합니다.");
assert.match(styles, /\.account-menu-popover\s*\{[^}]*width:\s*min\(304px,[^}]*border-radius:\s*12px[^}]*box-shadow:\s*0 22px 54px/s, "계정 드롭다운은 넓은 카드형 레이어와 부드러운 그림자를 사용해야 합니다.");
assert.match(styles, /\.account-menu-summary\s*\{[^}]*background:\s*var\(--primary-50\)[^}]*border:\s*1px solid var\(--primary-100\)/s, "계정 드롭다운 상단 정보 영역은 연한 블루 톤으로 구분해야 합니다.");
assert.match(styles, /\.account-menu-role-badge\s*\{[^}]*border-radius:\s*999px/s, "계정 권한은 작은 뱃지 형태로 표시해야 합니다.");
assert.match(styles, /\.account-menu-icon\s*\{[^}]*width:\s*18px/s, "계정 메뉴 항목은 아이콘을 함께 표시해야 합니다.");
assert.match(styles, /\.account-menu-logout:hover,[\s\S]*\.account-menu-logout:focus-visible\s*\{[^}]*background:\s*var\(--danger-100\)/s, "로그아웃 항목은 위험 동작 hover 배경으로 구분해야 합니다.");
assert.match(styles, /\.personalization-toggle\s*\{[^}]*min-height:\s*44px/s, "맞춤 공고 토글은 모바일에서도 누르기 쉬운 최소 높이를 가져야 합니다.");
assert.ok(font.byteLength > 1_000_000, "배포 가능한 공통 한글 글꼴 파일이 포함되어야 합니다.");
assert.match(fontLicense, /SIL OPEN FONT LICENSE Version 1\.1/, "글꼴 재배포 라이선스를 함께 제공해야 합니다.");

console.log("preview integration checks passed");
