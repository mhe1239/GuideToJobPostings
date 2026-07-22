"use strict";

const ROLE_LABELS = Object.freeze({
  owner: "관리자 관리, 수정 및 공개 가능",
  editor: "수정 및 공개 가능",
  viewer: "보기만 가능",
});

const CODEX_DRAFT = Object.freeze({
  summary:
    "강남대학교 입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집 공고입니다. 지원 대상은 재학생 및 편입생이며, 1차 서류 접수는 7월 20일부터 8월 2일 17시까지입니다.",
  faq:
    "Q. 편입생도 지원할 수 있나요?\nA. 가능합니다. 공고의 지원 자격에 재학생 및 편입생으로 안내되어 있습니다.\n\nQ. 어떤 분야를 모집하나요?\nA. 기획국, 대외홍보국, 콘텐츠디자인국을 모집합니다.\n\nQ. 신청 방법은 무엇인가요?\nA. 공식 공고에 안내된 QR 코드 또는 원문 링크의 신청 경로를 확인해야 합니다.",
  evidence:
    "근거 1. 모집 일정 > 1차 서류 접수\n근거 2. 지원 자격 > 재학생 및 편입생\n근거 3. 모집 분야 및 인원\n근거 4. 공고 등록 부서 및 문의처",
});

const adminPage = {
  authBadge: document.querySelector("#admin-auth-badge") || document.querySelector("#review-status"),
  authState: document.querySelector("#admin-auth-state"),
  logoutButton: document.querySelector("#admin-logout-button"),
  restrictedAreas: [...document.querySelectorAll("[data-requires-admin]")],
  memberList: document.querySelector("#member-list"),
  memberForm: document.querySelector("#member-form"),
  memberEmail: document.querySelector("#member-email"),
  memberRole: document.querySelector("#member-role"),
  form: document.querySelector("#admin-ingest-form"),
  generateButton: document.querySelector("#generate-draft-button"),
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

let currentUser = null;
let currentRole = "viewer";
let managedMembers = loadManagedMembers();

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

function renderAuthState() {
  if (adminPage.authBadge) {
    adminPage.authBadge.textContent = ROLE_LABELS[currentRole];
    adminPage.authBadge.dataset.state = currentRole === "owner" ? "approved" : "review";
  }

  const title = adminPage.authState?.querySelector("strong");
  const subtitle = adminPage.authState?.querySelector("span");
  if (title && subtitle) {
    if (!currentUser) {
      title.textContent = "로그아웃 상태";
      subtitle.textContent = "기본 권한은 학생 보기입니다. Google 로그인 후 관리자 작업을 사용할 수 있습니다.";
    } else {
      title.textContent = `${currentUser.email} · ${ROLE_LABELS.owner}`;
      subtitle.textContent = "관리자 관리, AI 초안 수정, 학생 페이지 공개가 가능합니다.";
    }
  }

  if (adminPage.logoutButton) adminPage.logoutButton.disabled = !currentUser;
}

function updateAccess() {
  const allowed = currentRole === "owner";
  adminPage.restrictedAreas.forEach((area) => {
    area.classList.toggle("locked", !allowed);
    area.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !allowed;
    });
  });
  renderAuthState();
  renderMembers();
  updateApprovalState();
}

function renderMembers() {
  if (!adminPage.memberList) return;
  const members = [
    ...(currentUser ? [{ email: currentUser.email, role: "owner", source: "Google 로그인" }] : []),
    ...managedMembers,
  ];

  if (members.length === 0) {
    adminPage.memberList.innerHTML = "<p class=\"member-empty\">로그인한 관리자 계정이 없습니다.</p>";
    return;
  }

  adminPage.memberList.replaceChildren(
    ...members.map((member) => {
      const row = document.createElement("div");
      const email = document.createElement("strong");
      const role = document.createElement("span");
      const source = document.createElement("small");
      email.textContent = member.email;
      role.textContent = ROLE_LABELS[member.role] || ROLE_LABELS.viewer;
      source.textContent = member.source || "브라우저 저장";
      row.append(email, role, source);
      return row;
    }),
  );
}

function updateApprovalState() {
  if (!adminPage.approveButton) return;
  const ready = adminPage.fields && !adminPage.fields.hidden;
  const checked = adminPage.checkboxes.every((checkbox) => checkbox.checked);
  adminPage.approveButton.disabled = !(currentRole === "owner" && ready && checked);
}

function handleMemberSubmit(event) {
  event.preventDefault();
  if (currentRole !== "owner") return;

  const email = adminPage.memberEmail.value.trim().toLowerCase();
  if (!email) return;

  managedMembers = managedMembers.filter((member) => member.email !== email);
  managedMembers.push({ email, role: adminPage.memberRole.value });
  saveManagedMembers();
  adminPage.memberEmail.value = "";
  renderMembers();
}

function handleDraftGeneration(event) {
  event.preventDefault();
  if (currentRole !== "owner") return;

  adminPage.chip.textContent = "생성 중";
  adminPage.generateButton.disabled = true;
  adminPage.note.textContent = "Codex AI가 공식 링크를 기준으로 초안을 구성하고 있습니다.";

  window.setTimeout(() => {
    adminPage.empty.hidden = true;
    adminPage.fields.hidden = false;
    adminPage.summary.value = CODEX_DRAFT.summary;
    adminPage.faq.value = CODEX_DRAFT.faq;
    adminPage.evidence.value = CODEX_DRAFT.evidence;
    adminPage.chip.textContent = "검수 필요";
    adminPage.generateButton.disabled = false;
    adminPage.note.textContent = "초안을 검수한 뒤 모든 체크 항목을 완료해 주세요.";
    updateApprovalState();
  }, 700);
}

function handleDraftApproval() {
  if (currentRole !== "owner") return;
  adminPage.chip.textContent = "공개됨";
  adminPage.note.textContent = "승인된 초안이 학생 페이지에 공개되는 상태입니다.";
  adminPage.approveButton.disabled = true;
  adminPage.approveButton.textContent = "공개 완료";
}

async function handleLogout() {
  const firebase = window.KANGNAM_FIREBASE;
  if (firebase) await firebase.signOut();
}

function initAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    updateAccess();
    return;
  }

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    currentUser = user;
    currentRole = user ? "owner" : "viewer";
    updateAccess();
  });
}

adminPage.logoutButton?.addEventListener("click", handleLogout);
adminPage.memberForm?.addEventListener("submit", handleMemberSubmit);
adminPage.form?.addEventListener("submit", handleDraftGeneration);
adminPage.checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateApprovalState));
adminPage.approveButton?.addEventListener("click", handleDraftApproval);
window.addEventListener("kangnam-firebase-ready", initAuth, { once: true });
initAuth();
