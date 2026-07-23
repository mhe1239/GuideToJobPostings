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
    sourceTitle: "입학처 공식 홍보대사 늘품 12기 2학기 수습 위원 모집 공고",
    sourceUrl: "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9",
    publishedAt: "2026.07.20",
    sourceType: "image",
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
  },
  {
    id: "internet-counselor-2026",
    title: "[한국지능정보사회진흥원] 2026년도 제12회 인터넷중독전문상담사 자격검정 시행",
    category: "대학생활",
    department: "학생지원 관련 부서",
    date: "2026.07.20",
    status: "안내",
    sourceTitle: "2026년도 제12회 인터넷중독전문상담사 자격검정 시행 공고",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.20",
    sourceType: "html",
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
  },
  {
    id: "jazz-concert-2026",
    title: "[수원시립미술관] 7월 문화가 있는 날 재즈 콘서트 개최",
    category: "대학생활",
    department: "학생지원 관련 부서",
    date: "2026.07.16",
    status: "안내",
    sourceTitle: "7월 문화가 있는 날 재즈 콘서트 개최 공고",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.16",
    sourceType: "html",
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
  },
  {
    id: "student-support-program-2026",
    title: "2026학년도 대학생활 지원 비교과 프로그램 참여 안내",
    category: "비교과 프로그램",
    department: "학생지원 관련 부서",
    date: "2026.07.15",
    status: "모집 중",
    sourceTitle: "2026학년도 대학생활 지원 비교과 프로그램 참여 안내 공고",
    sourceUrl: "https://web.kangnam.ac.kr/menu/e4058249224f49ab163131ce104214fb.do",
    publishedAt: "2026.07.15",
    sourceType: "html",
    dataMethod: "실제 공고 기반 재구성",
    reviewed: true,
    reviewedAt: "2026.07.23",
  },
]);

const listElements = {
  authLink: document.querySelector("#header-auth-link"),
  noticeList: document.querySelector("#notice-list"),
  countLabel: document.querySelector("#notice-count-label"),
};

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

function getNotices() {
  const deletedIds = loadDeletedNoticeIds();
  const merged = [...loadPublishedNotices(), ...DEFAULT_NOTICES];
  return merged
    .filter((notice, index, list) => list.findIndex((item) => item.id === notice.id) === index)
    .filter((notice) => !deletedIds.has(notice.id))
    .filter((notice) => (notice.approvalStatus || "published") === "published");
}

function createNoticeLink(notice) {
  const link = document.createElement("a");
  const top = document.createElement("div");
  const category = document.createElement("span");
  const status = document.createElement("span");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const action = document.createElement("span");
  link.className = "notice-list-item";
  link.href = `./notice.html?notice=${encodeURIComponent(notice.id)}`;
  top.className = "notice-card-top";
  category.className = "notice-card-category";
  status.className = "notice-card-status";
  action.className = "notice-card-action";
  category.textContent = notice.category;
  status.textContent = notice.status;
  title.textContent = notice.title;
  meta.textContent = `${notice.department} · ${notice.date}`;
  action.textContent = "상세 FAQ 보기";
  top.append(category, status);
  link.append(top, title, meta, action);
  return link;
}

function renderNoticeList() {
  const notices = getNotices();
  listElements.countLabel.textContent = `${notices.length}개`;
  listElements.noticeList.replaceChildren(...notices.map(createNoticeLink));
}

function initListAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) return;

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    if (!listElements.authLink) return;
    listElements.authLink.href = user ? "./admin.html" : "./login.html";
    listElements.authLink.lastChild.textContent = user ? "관리자 메뉴" : "관리자 로그인";
  });
}

renderNoticeList();
window.addEventListener("kangnam-firebase-ready", initListAuth, { once: true });
initListAuth();
