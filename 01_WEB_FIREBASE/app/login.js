"use strict";

const loginElements = {
  googleButton: document.querySelector("#login-google-button"),
  logoutButton: document.querySelector("#login-logout-button"),
  studentLink: document.querySelector("#login-student-link"),
  state: document.querySelector("#login-state"),
};

let loginAuthInitialized = false;
let authResolutionId = 0;
let redirectStarted = false;

function setLoginState(title, message) {
  const strong = loginElements.state.querySelector("strong");
  const span = loginElements.state.querySelector("span");
  strong.textContent = title;
  span.textContent = message;
}

function getAccountAccess() {
  return window.KANGNAM_ACCOUNT_ACCESS;
}

function shouldStayOnLoginPage() {
  return new URLSearchParams(window.location.search).get("stay") === "1";
}

function getStudentDestination() {
  return getAccountAccess()?.getSafeStudentReturnUrl(window.location.search)
    || new URL("./index.html", window.location.href).href;
}

function updateSignedOutState() {
  loginElements.googleButton.hidden = false;
  loginElements.logoutButton.disabled = true;
  loginElements.studentLink.href = getStudentDestination();
  loginElements.studentLink.textContent = "로그인 없이 공고 보기";
  setLoginState("로그인 대기", "로그인 후 계정 권한을 자동으로 확인합니다.");
}

async function handleAuthenticatedUser(user) {
  const resolutionId = ++authResolutionId;
  loginElements.googleButton.disabled = true;
  loginElements.logoutButton.disabled = false;
  setLoginState("계정 권한 확인 중", "등록된 관리자 계정인지 안전하게 확인하고 있습니다.");

  const access = await (getAccountAccess()?.resolveAccount(user)
    || Promise.resolve({ type: "student", role: "viewer", isAdmin: false, warning: "" }));
  if (resolutionId !== authResolutionId) return;

  const isAdmin = access.isAdmin === true;
  const destination = isAdmin ? new URL("./admin.html", window.location.href).href : getStudentDestination();
  const title = isAdmin ? "관리자 계정 확인" : "학생 계정 확인";
  const message = access.warning
    || (isAdmin ? "관리자 메뉴로 자동 이동합니다." : "학생 화면으로 자동 이동합니다.");

  loginElements.googleButton.hidden = true;
  loginElements.googleButton.disabled = false;
  loginElements.studentLink.href = destination;
  loginElements.studentLink.textContent = isAdmin ? "관리자 메뉴로 이동" : "학생 화면으로 이동";
  setLoginState(title, message);

  if (shouldStayOnLoginPage() || redirectStarted) return;
  redirectStarted = true;
  window.setTimeout(() => window.location.assign(destination), 350);
}

function initLoginAuth() {
  if (loginAuthInitialized) return;
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setLoginState("Firebase Auth 대기 중", "인증 설정을 불러오는 중입니다.");
    return;
  }
  loginAuthInitialized = true;

  firebase.getRedirectResult?.()
    .then(() => {})
    .catch((error) => {
      setLoginState("로그인 실패", error.message);
    });

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    if (!user) {
      authResolutionId += 1;
      redirectStarted = false;
      updateSignedOutState();
      return;
    }
    handleAuthenticatedUser(user);
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
  updateSignedOutState();
}

loginElements.googleButton.addEventListener("click", handleGoogleLogin);
loginElements.logoutButton.addEventListener("click", handleLogout);
window.addEventListener("kangnam-firebase-ready", initLoginAuth, { once: true });
initLoginAuth();
