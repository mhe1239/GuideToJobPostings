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
  },
  {
    id: "internet-counselor-2026",
    title: "[한국지능정보사회진흥원] 2026년도 제12회 인터넷중독전문상담사 자격검정 시행",
    category: "대학생활",
    department: "학생지원 관련 부서",
    date: "2026.07.20",
    status: "안내",
  },
  {
    id: "jazz-concert-2026",
    title: "[수원시립미술관] 7월 문화가 있는 날 재즈 콘서트 개최",
    category: "대학생활",
    department: "학생지원 관련 부서",
    date: "2026.07.16",
    status: "안내",
  },
  {
    id: "student-support-program-2026",
    title: "2026학년도 대학생활 지원 비교과 프로그램 참여 안내",
    category: "비교과 프로그램",
    department: "학생지원 관련 부서",
    date: "2026.07.15",
    status: "모집 중",
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
    .filter((notice) => !deletedIds.has(notice.id));
}

function createNoticeLink(notice) {
  const link = document.createElement("a");
  link.className = "notice-list-item";
  link.href = `./notice.html?notice=${encodeURIComponent(notice.id)}`;
  link.innerHTML = `
    <div class="notice-card-top">
      <span class="notice-card-category"></span>
      <span class="notice-card-status"></span>
    </div>
    <strong></strong>
    <small></small>
    <span class="notice-card-action">상세 FAQ 보기</span>
  `;
  link.querySelector(".notice-card-category").textContent = notice.category;
  link.querySelector(".notice-card-status").textContent = notice.status;
  link.querySelector("strong").textContent = notice.title;
  link.querySelector("small").textContent = `${notice.department} · ${notice.date}`;
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
    listElements.authLink.lastChild.textContent = user ? "관리자 메뉴" : "Google 로그인";
  });
}

renderNoticeList();
window.addEventListener("kangnam-firebase-ready", initListAuth, { once: true });
initListAuth();
