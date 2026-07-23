"use strict";

const loginElements = {
  googleButton: document.querySelector("#login-google-button"),
  logoutButton: document.querySelector("#login-logout-button"),
  state: document.querySelector("#login-state"),
};

function setLoginState(title, message) {
  const strong = loginElements.state.querySelector("strong");
  const span = loginElements.state.querySelector("span");
  strong.textContent = title;
  span.textContent = message;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function resolveLoginRole(email) {
  const normalized = normalizeEmail(email);
  const primaryAdmin = normalizeEmail(window.KANGNAM_ADMIN_CONFIG?.primaryAdminEmail);
  const owners = window.KANGNAM_FIREBASE?.roleLists?.owners || [];
  const editors = window.KANGNAM_FIREBASE?.roleLists?.editors || [];
  if (normalized && (normalized === primaryAdmin || owners.map(normalizeEmail).includes(normalized))) return "관리자 관리 가능";
  if (normalized && editors.map(normalizeEmail).includes(normalized)) return "수정 및 공개 가능";
  return "관리자 권한 없음";
}

function canOpenAdmin(email) {
  return resolveLoginRole(email) !== "관리자 권한 없음";
}

function goToAdminPage() {
  window.location.assign("./admin.html");
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
        setLoginState(`${result.user.email} · ${resolveLoginRole(result.user.email)}`, "로그인되었습니다. 관리자 메뉴로 이동합니다.");
        if (canOpenAdmin(result.user.email)) goToAdminPage();
      }
    })
    .catch((error) => {
      setLoginState("로그인 실패", error.message);
    });

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    if (!user) {
      loginElements.logoutButton.disabled = true;
      setLoginState("로그인 대기", "Google 계정으로 로그인하면 역할을 확인합니다.");
      return;
    }

    loginElements.logoutButton.disabled = false;
    const role = resolveLoginRole(user.email);
    if (!canOpenAdmin(user.email)) {
      setLoginState(`${user.email} · ${role}`, "이 계정은 관리자 목록에 없습니다. 최고 관리자 계정으로 다시 로그인해 주세요.");
      return;
    }
    setLoginState(`${user.email} · ${role}`, "로그인되었습니다. 관리자 메뉴로 이동합니다.");
    goToAdminPage();
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
window.addEventListener("kangnam-firebase-ready", initLoginAuth, { once: true });
initLoginAuth();
