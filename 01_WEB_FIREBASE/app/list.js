"use strict";

const PUBLISHED_NOTICES_KEY = "kangnamPublishedNotices";
const DELETED_NOTICES_KEY = "kangnamDeletedNoticeIds";
const FIRESTORE_AUTHORITATIVE_KEY = "kangnamFirestoreAuthoritativeV2";
const FILTER_ALL = "전체";
const RECRUITMENT_STATUSES = Object.freeze(["모집 예정", "모집 중", "마감 임박", "마감"]);
const UNKNOWN_ELIGIBILITY = "공고 원문에서 확인 필요";

const DEFAULT_NOTICES = Object.freeze([
  {
    id: "neulpum-2026",
    title: "입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집",
    category: "비교과 프로그램",
    department: "입학전형관리팀",
    date: "2026.07.20",
    status: "마감 임박",
    recruitmentStatus: "마감 임박",
    eligibleEnrollmentStatus: ["재학생"],
    eligibleGrades: "",
    transferStudentEligible: true,
    graduateEligible: null,
    sourceTitle: "입학처 공식 홍보대사 늘품 12기 2학기 수습 위원 모집 공고",
    sourceUrl: "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9",
    publishedAt: "2026.07.20",
    sourceType: "image",
    imageUrls: [],
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
    imageUrls: [],
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
    imageUrls: [],
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
    imageUrls: [],
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
  enrollmentRadios: [...document.querySelectorAll("input[name='student-enrollment-status']")],
  gradeSelect: document.querySelector("#student-grade"),
  transferCheckbox: document.querySelector("#student-transfer"),
  interestCheckboxes: [...document.querySelectorAll("input[name='student-interest']")],
  personalizedResetButton: document.querySelector("#personalized-reset-button"),
  personalizedSummary: document.querySelector("#personalized-summary"),
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

function savePublishedNotices(notices) {
  window.localStorage.setItem(PUBLISHED_NOTICES_KEY, JSON.stringify(notices));
}

function setDataSyncStatus(message, state = "info") {
  let status = document.querySelector("#data-sync-status");
  if (!status) {
    status = document.createElement("p");
    status.id = "data-sync-status";
    status.className = "data-sync-status";
    status.setAttribute("role", "status");
    document.querySelector("main")?.prepend(status);
  }
  status.dataset.state = state;
  status.textContent = message;
  status.hidden = !message;
}

async function hydratePublishedNotices() {
  const store = window.KANGNAM_NOTICE_STORE;
  if (!store?.loadPublishedNotices) return;

  try {
    const result = await store.loadPublishedNotices();
    if (!String(result.source || "").startsWith("firestore")) return;
    savePublishedNotices(result.notices);
    window.localStorage.setItem(FIRESTORE_AUTHORITATIVE_KEY, "true");
    renderNoticeList();
    setDataSyncStatus("공용 공고 데이터를 최신 상태로 불러왔습니다.", "success");
  } catch (error) {
    const message = store.getFriendlyError(error);
    const state = error?.code === "FREE_TIER_LIMIT" ? "limit" : "error";
    setDataSyncStatus(`${message} 저장된 공고를 대신 표시합니다.`, state);
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
  const stored = loadPublishedNotices();
  const firestoreIsAuthoritative = window.localStorage.getItem(FIRESTORE_AUTHORITATIVE_KEY) === "true";
  const merged = firestoreIsAuthoritative ? stored : [...stored, ...DEFAULT_NOTICES];
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

function getStudentProfile() {
  return {
    enrollmentStatus: listElements.enrollmentRadios.find((radio) => radio.checked)?.value || "",
    grade: listElements.gradeSelect?.value || "",
    transferStudent: listElements.transferCheckbox?.checked === true,
    interests: listElements.interestCheckboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value),
  };
}

function hasPersonalizedConditions(profile = getStudentProfile()) {
  return Boolean(profile.enrollmentStatus || profile.grade || profile.transferStudent || profile.interests.length > 0);
}

function parseEligibleGradeNumbers(value) {
  if (!value) return null;
  if (value.includes("전체")) return [1, 2, 3, 4];
  const range = value.match(/([1-4])\s*~\s*([1-4])/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
  const grades = [...value.matchAll(/([1-4])학년/g)].map((match) => Number(match[1]));
  return grades.length > 0 ? grades : null;
}

function matchesEnrollmentStatus(notice, enrollmentStatus) {
  if (!enrollmentStatus) return true;
  if (enrollmentStatus === "졸업생") {
    return notice.graduateEligible !== false;
  }
  const statuses = getEnrollmentChips(notice);
  return statuses.length === 0 || statuses.includes(enrollmentStatus);
}

function matchesGrade(notice, grade) {
  if (!grade) return true;
  const eligibleGrades = parseEligibleGradeNumbers(notice.eligibleGrades);
  return eligibleGrades === null || eligibleGrades.includes(Number(grade));
}

function matchesTransferStatus(notice, transferStudent) {
  if (!transferStudent) return true;
  return notice.transferStudentEligible !== false;
}

function matchesInterests(notice, interests) {
  return interests.length === 0 || interests.includes(getNoticeCategory(notice));
}

function needsConditionConfirmation(notice, profile = getStudentProfile()) {
  if (!hasPersonalizedConditions(profile)) return false;
  if (profile.enrollmentStatus === "졸업생" && notice.graduateEligible === null) return true;
  if (profile.enrollmentStatus && profile.enrollmentStatus !== "졸업생" && getEnrollmentChips(notice).length === 0) return true;
  if (profile.grade && !notice.eligibleGrades) return true;
  if (profile.transferStudent && notice.transferStudentEligible === null) return true;
  return false;
}

function matchesStudentProfile(notice, profile) {
  return matchesEnrollmentStatus(notice, profile.enrollmentStatus)
    && matchesGrade(notice, profile.grade)
    && matchesTransferStatus(notice, profile.transferStudent)
    && matchesInterests(notice, profile.interests);
}

function getFilteredNotices(notices) {
  const profile = getStudentProfile();
  return notices.filter((notice) => {
    const matchesCategory = activeFilters.category === FILTER_ALL || getNoticeCategory(notice) === activeFilters.category;
    const matchesStatus = activeFilters.recruitmentStatus === FILTER_ALL || getNoticeRecruitmentStatus(notice) === activeFilters.recruitmentStatus;
    return matchesCategory && matchesStatus && matchesStudentProfile(notice, profile);
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

function updatePersonalizedSummary(profile = getStudentProfile()) {
  if (!listElements.personalizedSummary) return;
  if (!hasPersonalizedConditions(profile)) {
    listElements.personalizedSummary.textContent = "조건을 선택하면 목록에 즉시 반영됩니다. 입력 내용은 저장되지 않습니다.";
    return;
  }

  const selected = [
    profile.enrollmentStatus,
    profile.grade ? `${profile.grade}학년` : "",
    profile.transferStudent ? "편입생" : "",
    ...profile.interests,
  ].filter(Boolean);
  listElements.personalizedSummary.textContent = `선택 조건: ${selected.join(" · ")}. 조건 정보가 없는 공고는 제외하지 않고 조건 확인 필요로 표시합니다.`;
}

function createNoticeLink(notice) {
  const profile = getStudentProfile();
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
  link.dataset.status = getNoticeRecruitmentStatus(notice);
  top.className = "notice-card-top";
  category.className = "notice-card-category";
  status.className = "notice-card-status";
  status.dataset.status = getNoticeRecruitmentStatus(notice);
  eligibility.className = "notice-card-eligibility";
  action.className = "notice-card-action";
  category.textContent = getNoticeCategory(notice);
  status.textContent = getNoticeRecruitmentStatus(notice);
  title.textContent = notice.title;
  meta.textContent = `${notice.department} · ${notice.date}`;
  action.textContent = "상세 FAQ 보기";
  eligibility.setAttribute("aria-label", "지원 가능 대상");
  eligibility.replaceChildren(
    ...[
      ...getCardEligibilityChips(notice),
      ...(needsConditionConfirmation(notice, profile) ? ["조건 확인 필요"] : []),
    ].map((chipText) => {
      const chip = document.createElement("span");
      chip.textContent = chipText;
      if (chipText === "조건 확인 필요") chip.className = "condition-check-chip";
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
  updatePersonalizedSummary();
}

function getLocalAdminRole(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return "viewer";

  const firebase = window.KANGNAM_FIREBASE;
  const roleLists = firebase?.roleLists ?? { owners: [], editors: [] };
  if (roleLists.owners.includes(normalized)) return "owner";
  if (roleLists.editors.includes(normalized)) return "editor";

  try {
    const members = JSON.parse(window.localStorage.getItem("kangnamManagedMembers") || "[]");
    const matched = Array.isArray(members)
      ? members.find((member) => String(member.email || "").trim().toLowerCase() === normalized)
      : null;
    if (["owner", "editor", "viewer"].includes(matched?.role)) return matched.role;
  } catch {
    // Keep the header usable even when local member data is unavailable.
  }

  return "viewer";
}

async function getHeaderAdminRole(user) {
  const store = window.KANGNAM_NOTICE_STORE;
  try {
    const firestore = await store?.ready;
    if (firestore?.db && store?.getAdminRole) {
      return await store.getAdminRole(user.email) || "viewer";
    }
  } catch {
    // Fall back to local role data below.
  }
  return getLocalAdminRole(user.email);
}

function closeAccountMenu(authLink) {
  const menu = authLink?.parentElement?.querySelector(".account-menu-popover");
  if (!menu) return;
  menu.hidden = true;
  authLink.setAttribute("aria-expanded", "false");
}

function ensureAccountMenu(authLink) {
  if (!authLink) return null;
  let wrapper = authLink.closest(".account-menu");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "account-menu";
    authLink.parentNode.insertBefore(wrapper, authLink);
    wrapper.append(authLink);
  }

  let menu = wrapper.querySelector(".account-menu-popover");
  if (!menu) {
    menu = document.createElement("div");
    menu.className = "account-menu-popover";
    menu.id = "header-account-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    wrapper.append(menu);

    authLink.setAttribute("aria-haspopup", "menu");
    authLink.setAttribute("aria-controls", menu.id);
    authLink.setAttribute("aria-expanded", "false");

    authLink.addEventListener("click", (event) => {
      if (authLink.dataset.accountMenu !== "enabled") return;
      event.preventDefault();
      const expanded = authLink.getAttribute("aria-expanded") === "true";
      menu.hidden = expanded;
      authLink.setAttribute("aria-expanded", String(!expanded));
    });

    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) closeAccountMenu(authLink);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAccountMenu(authLink);
    });
  }

  return menu;
}

function renderAccountMenu(authLink, user, role) {
  const menu = ensureAccountMenu(authLink);
  if (!authLink || !menu) return;

  if (!user) {
    closeAccountMenu(authLink);
    authLink.dataset.accountMenu = "disabled";
    authLink.href = window.KANGNAM_ACCOUNT_ACCESS?.getLoginUrl() || "./login.html";
    authLink.lastChild.textContent = "로그인";
    menu.replaceChildren();
    return;
  }

  const canOpenAdmin = role === "owner" || role === "editor";
  authLink.dataset.accountMenu = "enabled";
  authLink.href = canOpenAdmin ? "./admin.html" : "./index.html";
  authLink.lastChild.textContent = "내 계정";

  const email = document.createElement("p");
  email.className = "account-menu-email";
  email.textContent = user.email || "로그인됨";

  const items = [];
  if (canOpenAdmin) {
    const adminLink = document.createElement("a");
    adminLink.href = "./admin.html";
    adminLink.textContent = "관리자 메뉴";
    adminLink.setAttribute("role", "menuitem");
    items.push(adminLink);
  }

  const homeLink = document.createElement("a");
  homeLink.href = "./index.html";
  homeLink.textContent = "공고 목록";
  homeLink.setAttribute("role", "menuitem");
  items.push(homeLink);

  const logoutButton = document.createElement("button");
  logoutButton.type = "button";
  logoutButton.textContent = "로그아웃";
  logoutButton.setAttribute("role", "menuitem");
  logoutButton.addEventListener("click", async () => {
    const firebase = window.KANGNAM_FIREBASE;
    if (firebase) await firebase.signOut();
    closeAccountMenu(authLink);
  });

  const divider = document.createElement("div");
  divider.className = "account-menu-divider";
  divider.setAttribute("role", "separator");

  menu.replaceChildren(email, ...items, divider, logoutButton);
}

function initListAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) return;

  let authUpdateId = 0;
  firebase.onAuthStateChanged(firebase.auth, async (user) => {
    if (!listElements.authLink) return;
    const updateId = ++authUpdateId;
    const accountAccess = window.KANGNAM_ACCOUNT_ACCESS;

    if (!user) {
      renderAccountMenu(listElements.authLink, null, "viewer");
      return;
    }

    const account = await (accountAccess?.resolveAccount(user)
      || Promise.resolve({ type: "student", isAdmin: false }));
    if (updateId !== authUpdateId) return;

    renderAccountMenu(listElements.authLink, user, account.role);
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

[...listElements.enrollmentRadios, ...listElements.interestCheckboxes].forEach((control) => {
  control.addEventListener("change", renderNoticeList);
});

listElements.gradeSelect?.addEventListener("change", renderNoticeList);
listElements.transferCheckbox?.addEventListener("change", renderNoticeList);

listElements.personalizedResetButton?.addEventListener("click", () => {
  listElements.enrollmentRadios.forEach((radio) => {
    radio.checked = radio.value === "";
  });
  if (listElements.gradeSelect) listElements.gradeSelect.value = "";
  if (listElements.transferCheckbox) listElements.transferCheckbox.checked = false;
  listElements.interestCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  renderNoticeList();
});

renderNoticeList();
window.addEventListener("kangnam-firebase-ready", initListAuth, { once: true });
initListAuth();
hydratePublishedNotices();
