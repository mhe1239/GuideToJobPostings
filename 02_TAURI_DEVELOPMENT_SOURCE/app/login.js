"use strict";

const loginElements = {
  googleButton: document.querySelector("#login-google-button"),
  logoutButton: document.querySelector("#login-logout-button"),
  state: document.querySelector("#login-state"),
  adminActions: document.querySelectorAll("[data-admin-action]"),
};

const LOGIN_ROLE_RANK = Object.freeze({ viewer: 0, editor: 1, owner: 2 });

function setLoginState(title, message) {
  const strong = loginElements.state.querySelector("strong");
  const span = loginElements.state.querySelector("span");
  strong.textContent = title;
  span.textContent = message;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function loadManagedMembers() {
  try {
    const members = JSON.parse(window.localStorage.getItem("kangnamManagedMembers") || "[]");
    return Array.isArray(members) ? members : [];
  } catch {
    return [];
  }
}

function resolveLoginRoleKey(email) {
  const normalized = normalizeEmail(email);
  const primaryAdmin = normalizeEmail(window.KANGNAM_ADMIN_CONFIG?.primaryAdminEmail);
  const owners = window.KANGNAM_FIREBASE?.roleLists?.owners || [];
  const editors = window.KANGNAM_FIREBASE?.roleLists?.editors || [];
  const managedMember = loadManagedMembers().find((member) => normalizeEmail(member.email) === normalized);
  const bootstrapAdmin = normalizeEmail(window.localStorage.getItem("kangnamAdminBootstrapEmail"));
  if (normalized && (normalized === primaryAdmin || normalized === bootstrapAdmin || owners.map(normalizeEmail).includes(normalized))) return "owner";
  if (managedMember?.role === "owner") return "owner";
  if (managedMember?.role === "editor" || editors.map(normalizeEmail).includes(normalized)) return "editor";
  return "viewer";
}

function resolveLoginRole(email) {
  const role = resolveLoginRoleKey(email);
  if (role === "owner") return "관리자 관리 가능";
  if (role === "editor") return "수정 및 공개 가능";
  return "관리자 권한 없음";
}

function canOpenAdmin(email) {
  return LOGIN_ROLE_RANK[resolveLoginRoleKey(email)] >= LOGIN_ROLE_RANK.editor;
}

function renderLoginActions(user) {
  const role = user ? resolveLoginRoleKey(user.email) : "viewer";
  loginElements.adminActions.forEach((action) => {
    const minRole = action.dataset.minRole || "editor";
    action.hidden = LOGIN_ROLE_RANK[role] < LOGIN_ROLE_RANK[minRole];
  });
  if (loginElements.logoutButton) {
    loginElements.logoutButton.disabled = !user;
    loginElements.logoutButton.textContent = user && role === "viewer" ? "로그아웃 후 다른 계정 선택" : "로그아웃";
  }
  if (loginElements.googleButton) {
    loginElements.googleButton.hidden = Boolean(user);
  }
}

function initLoginAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setLoginState("Firebase Auth 대기 중", "인증 설정을 불러오는 중입니다.");
    return;
  }

  firebase.getRedirectResult?.()
    .then((result) => {
      if (result?.user) {
        renderLoginActions(result.user);
        const message = canOpenAdmin(result.user.email)
          ? "관리자 작업 버튼을 선택해 이동하세요."
          : "이 계정은 관리자 목록에 없습니다. 최고 관리자 계정으로 다시 로그인해 주세요.";
        setLoginState(`${result.user.email} · ${resolveLoginRole(result.user.email)}`, message);
      }
    })
    .catch((error) => {
      setLoginState("로그인 실패", error.message);
    });

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    if (!user) {
      renderLoginActions(null);
      setLoginState("로그인 대기", "Google 계정으로 로그인하면 역할을 확인합니다.");
      return;
    }

    renderLoginActions(user);
    const role = resolveLoginRole(user.email);
    if (!canOpenAdmin(user.email)) {
      setLoginState(`${user.email} · ${role}`, "이 계정은 관리자 목록에 없습니다. 최고 관리자 계정으로 다시 로그인해 주세요.");
      return;
    }
    setLoginState(`${user.email} · ${role}`, "관리자 작업 버튼을 선택해 이동하세요.");
  });
}

async function handleGoogleLogin() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setLoginState("Firebase Auth 오류", "인증 설정을 불러오지 못했습니다.");
    return;
  }

  try {
    setLoginState("Google 로그인 중", "Google 계정 선택 창을 확인해 주세요.");
    await firebase.signInWithPopup();
  } catch (error) {
    if (firebase.signInWithRedirect) {
      setLoginState("Google 로그인으로 이동", "팝업 로그인이 막혀 전체 화면 로그인으로 전환합니다.");
      await firebase.signInWithRedirect();
      return;
    }

    setLoginState("로그인 실패", error.message);
  }
}

async function handleLogout() {
  const firebase = window.KANGNAM_FIREBASE;
  if (firebase) await firebase.signOut();
}

loginElements.googleButton.addEventListener("click", handleGoogleLogin);
loginElements.logoutButton.addEventListener("click", handleLogout);
renderLoginActions(null);
window.addEventListener("kangnam-firebase-ready", initLoginAuth, { once: true });
initLoginAuth();
