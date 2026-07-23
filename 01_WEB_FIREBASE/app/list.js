"use strict";

const PUBLISHED_NOTICES_KEY = "kangnamPublishedNotices";
const DELETED_NOTICES_KEY = "kangnamDeletedNoticeIds";
const FILTER_ALL = "전체";
const RECRUITMENT_STATUSES = Object.freeze(["모집 예정", "모집 중", "마감"]);
const UNKNOWN_ELIGIBILITY = "공고 원문에서 확인 필요";

const DEFAULT_NOTICES = Object.freeze([
  {
    id: "neulpum-2026",
    title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집",
    category: "비교과 프로그램",
    department: "입학전형관리팀",
    date: "2026.07.20",
    status: "모집 중",
    recruitmentStatus: "모집 중",
    eligibleEnrollmentStatus: ["재학생"],
    eligibleGrades: "",
    transferStudentEligible: true,
    graduateEligible: null,
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
    category: "취업",
    department: "학생지원 관련 부서",
    date: "2026.07.20",
    status: "안내",
    recruitmentStatus: "모집 예정",
    eligibleEnrollmentStatus: [],
    eligibleGrades: "",
    transferStudentEligible: null,
    graduateEligible: null,
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
    recruitmentStatus: "모집 중",
    eligibleEnrollmentStatus: ["재학생"],
    eligibleGrades: "",
    transferStudentEligible: null,
    graduateEligible: null,
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
  emptyMessage: document.querySelector("#filter-empty"),
  resetButton: document.querySelector("#filter-reset-button"),
  filterButtons: [...document.querySelectorAll("[data-filter-type]")],
};

const activeFilters = {
  category: FILTER_ALL,
  recruitmentStatus: FILTER_ALL,
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

function normalizeRecruitmentStatus(status) {
  if (RECRUITMENT_STATUSES.includes(status)) return status;
  if (!status) return "모집 중";
  if (status.includes("예정")) return "모집 예정";
  if (status.includes("마감")) return "마감";
  if (status.includes("모집")) return "모집 중";
  return "모집 중";
}

function getNoticeCategory(notice) {
  return notice.category || "비교과 프로그램";
}

function getNoticeRecruitmentStatus(notice) {
  return normalizeRecruitmentStatus(notice.recruitmentStatus || notice.status);
}

function formatEligibleGrades(notice) {
  return notice.eligibleGrades || UNKNOWN_ELIGIBILITY;
}

function getEnrollmentChips(notice) {
  return Array.isArray(notice.eligibleEnrollmentStatus) ? notice.eligibleEnrollmentStatus.filter(Boolean) : [];
}

function getCardEligibilityChips(notice) {
  const chips = [...getEnrollmentChips(notice)];
  if (notice.eligibleGrades) chips.push(notice.eligibleGrades);
  if (notice.transferStudentEligible === true) chips.push("편입생 가능");
  if (notice.graduateEligible === true) chips.push("졸업생 가능");
  return chips.length > 0 ? chips.slice(0, 3) : [UNKNOWN_ELIGIBILITY];
}

function getFilteredNotices(notices) {
  return notices.filter((notice) => {
    const matchesCategory = activeFilters.category === FILTER_ALL || getNoticeCategory(notice) === activeFilters.category;
    const matchesStatus = activeFilters.recruitmentStatus === FILTER_ALL || getNoticeRecruitmentStatus(notice) === activeFilters.recruitmentStatus;
    return matchesCategory && matchesStatus;
  });
}

function updateFilterButtons() {
  listElements.filterButtons.forEach((button) => {
    const type = button.dataset.filterType;
    const isActive = activeFilters[type] === button.dataset.filterValue;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setFilter(type, value) {
  activeFilters[type] = value;
  renderNoticeList();
}

function createNoticeLink(notice) {
  const link = document.createElement("a");
  const top = document.createElement("div");
  const category = document.createElement("span");
  const status = document.createElement("span");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const eligibility = document.createElement("div");
  const action = document.createElement("span");
  link.className = "notice-list-item";
  link.href = `./notice.html?notice=${encodeURIComponent(notice.id)}`;
  top.className = "notice-card-top";
  category.className = "notice-card-category";
  status.className = "notice-card-status";
  eligibility.className = "notice-card-eligibility";
  action.className = "notice-card-action";
  category.textContent = getNoticeCategory(notice);
  status.textContent = getNoticeRecruitmentStatus(notice);
  title.textContent = notice.title;
  meta.textContent = `${notice.department} · ${notice.date}`;
  action.textContent = "상세 FAQ 보기";
  eligibility.setAttribute("aria-label", "지원 가능 대상");
  eligibility.replaceChildren(
    ...getCardEligibilityChips(notice).map((chipText) => {
      const chip = document.createElement("span");
      chip.textContent = chipText;
      return chip;
    }),
  );
  top.append(category, status);
  link.append(top, title, meta, eligibility, action);
  return link;
}

function renderNoticeList() {
  const notices = getFilteredNotices(getNotices());
  listElements.countLabel.textContent = `${notices.length}개`;
  if (listElements.emptyMessage) {
    listElements.emptyMessage.hidden = notices.length > 0;
  }
  listElements.noticeList.replaceChildren(...notices.map(createNoticeLink));
  updateFilterButtons();
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

listElements.filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filterType, button.dataset.filterValue));
});

listElements.resetButton?.addEventListener("click", () => {
  activeFilters.category = FILTER_ALL;
  activeFilters.recruitmentStatus = FILTER_ALL;
  renderNoticeList();
});

renderNoticeList();
window.addEventListener("kangnam-firebase-ready", initListAuth, { once: true });
initListAuth();
