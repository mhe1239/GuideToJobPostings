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

function resolveLoginRole(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const roleLists = window.KANGNAM_FIREBASE?.roleLists ?? { owners: [], editors: [] };

  if (roleLists.owners.includes(normalized)) return "관리자 관리 가능";
  if (roleLists.editors.includes(normalized)) return "수정 및 공개 가능";
  return "보기만 가능";
}

function initLoginAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setLoginState("Firebase Auth 대기 중", "인증 설정을 불러오는 중입니다.");
    return;
  }

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    if (!user) {
      loginElements.logoutButton.disabled = true;
      setLoginState("로그인 대기", "Google 계정으로 로그인하면 역할을 확인합니다.");
      return;
    }

    loginElements.logoutButton.disabled = false;
    setLoginState(`${user.email} · ${resolveLoginRole(user.email)}`, "로그인되었습니다. 메인 페이지에서 권한별 관리자 기능을 사용할 수 있습니다.");
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
