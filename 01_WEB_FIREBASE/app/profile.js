"use strict";

const profileElements = {
  accountTitle: document.querySelector("#profile-account-title"),
  accountEmail: document.querySelector("#profile-account-email"),
  accountStatus: document.querySelector("#profile-account-status"),
  logoutButton: document.querySelector("#profile-logout-button"),
  form: document.querySelector("#student-profile-form"),
  saveButton: document.querySelector("#profile-save-button"),
  enrollmentRadios: [...document.querySelectorAll("input[name='profile-enrollment-status']")],
  enrollmentError: document.querySelector("#profile-enrollment-error"),
  grade: document.querySelector("#profile-grade"),
  transfer: document.querySelector("#profile-transfer"),
  interestCheckboxes: [...document.querySelectorAll("input[name='profile-interest']")],
  interestsError: document.querySelector("#profile-interests-error"),
  previewTitle: document.querySelector("#profile-preview-title"),
  previewCopy: document.querySelector("#profile-preview-copy"),
  formStatus: document.querySelector("#profile-form-status"),
};

let currentStudent = null;
let profileAuthInitialized = false;
let profileAuthUpdateId = 0;

function getProfileStore() {
  return window.KANGNAM_STUDENT_PROFILE;
}

function maskEmail(value) {
  const [localPart, domain] = String(value || "").split("@");
  if (!localPart || !domain) return "학교 계정";
  return `${localPart.slice(0, 2)}***@${domain}`;
}

function setAccountStatus(message, state = "loading") {
  profileElements.accountStatus.dataset.state = state;
  profileElements.accountStatus.lastChild.textContent = message;
}

function setFormStatus(message, state = "") {
  profileElements.formStatus.textContent = message;
  profileElements.formStatus.dataset.state = state;
}

function setFormEnabled(enabled) {
  profileElements.form.querySelectorAll("input, select, button").forEach((control) => {
    control.disabled = !enabled;
  });
}

function readForm() {
  return {
    enrollmentStatus: profileElements.enrollmentRadios.find((radio) => radio.checked)?.value || "",
    grade: profileElements.grade.value,
    transferStudent: profileElements.transfer.checked,
    interests: profileElements.interestCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value),
  };
}

function fillForm(profile) {
  const normalized = getProfileStore().normalize(profile);
  profileElements.enrollmentRadios.forEach((radio) => {
    radio.checked = radio.value === normalized.enrollmentStatus;
  });
  profileElements.grade.value = normalized.grade;
  profileElements.transfer.checked = normalized.transferStudent;
  profileElements.interestCheckboxes.forEach((checkbox) => {
    checkbox.checked = normalized.interests.includes(checkbox.value);
  });
  updatePreview();
}

function clearValidationErrors() {
  profileElements.enrollmentError.hidden = true;
  profileElements.interestsError.hidden = true;
}

function updatePreview() {
  const profile = readForm();
  const summary = getProfileStore()?.toSummary(profile) || [];
  profileElements.previewTitle.textContent = summary.length > 0
    ? summary.join(" · ")
    : "조건을 선택해 주세요";
  profileElements.previewCopy.textContent = getProfileStore()?.isConfigured(profile)
    ? "저장하면 공고 목록에서 이 조건에 맞는 공고가 자동으로 표시됩니다."
    : "재학 상태와 관심 분야를 선택하면 맞춤 공고를 적용할 수 있습니다.";
}

function validate(profile) {
  const hasEnrollmentStatus = Boolean(profile.enrollmentStatus);
  const hasInterests = profile.interests.length > 0;
  profileElements.enrollmentError.hidden = hasEnrollmentStatus;
  profileElements.interestsError.hidden = hasInterests;

  if (!hasEnrollmentStatus) {
    profileElements.enrollmentRadios[0]?.focus();
  } else if (!hasInterests) {
    profileElements.interestCheckboxes[0]?.focus();
  }
  return hasEnrollmentStatus && hasInterests;
}

function getProfileLoginUrl() {
  const loginUrl = new URL("./login.html", window.location.href);
  loginUrl.searchParams.set("returnTo", "profile.html");
  return loginUrl.href;
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  clearValidationErrors();
  setFormStatus("");

  const profile = readForm();
  if (!validate(profile)) {
    setFormStatus("필수 항목을 확인해 주세요.", "error");
    return;
  }

  try {
    profileElements.saveButton.disabled = true;
    profileElements.saveButton.textContent = "저장 중";
    getProfileStore().save(currentStudent, profile);
    setFormStatus("내 정보를 저장했습니다. 맞춤 공고 목록으로 이동합니다.", "success");
    window.setTimeout(() => window.location.assign("./index.html"), 450);
  } catch (error) {
    profileElements.saveButton.disabled = false;
    profileElements.saveButton.textContent = "저장하고 맞춤 공고 보기";
    setFormStatus(error.message || "내 정보를 저장하지 못했습니다. 다시 시도해 주세요.", "error");
  }
}

async function handleProfileLogout() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) return;
  profileElements.logoutButton.disabled = true;
  setAccountStatus("로그아웃 중", "loading");
  await firebase.signOut();
}

function initProfileAuth() {
  if (profileAuthInitialized) return;
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    setAccountStatus("로그인 설정을 불러오지 못했습니다.", "error");
    setFormStatus("페이지를 새로고침한 뒤 다시 시도해 주세요.", "error");
    return;
  }
  profileAuthInitialized = true;

  firebase.onAuthStateChanged(firebase.auth, async (user) => {
    const updateId = ++profileAuthUpdateId;
    if (!user) {
      currentStudent = null;
      setFormEnabled(false);
      setAccountStatus("로그인이 필요합니다.", "error");
      window.location.replace(getProfileLoginUrl());
      return;
    }

    setAccountStatus("학생 권한 확인 중", "loading");
    const account = await (window.KANGNAM_ACCOUNT_ACCESS?.resolveAccount(user)
      || Promise.resolve({ isAdmin: false }));
    if (updateId !== profileAuthUpdateId) return;

    if (account.isAdmin) {
      setAccountStatus("관리자 메뉴로 이동합니다.", "success");
      window.location.replace("./admin.html");
      return;
    }

    currentStudent = user;
    profileElements.accountTitle.textContent = user.displayName || "강남대학교 학생";
    profileElements.accountEmail.textContent = maskEmail(user.email);
    profileElements.logoutButton.disabled = false;
    setFormEnabled(true);
    setAccountStatus("학생 계정으로 로그인됨", "success");

    const savedProfile = getProfileStore().load(user);
    fillForm(savedProfile);
    setFormStatus(
      getProfileStore().isConfigured(savedProfile)
        ? "저장된 내 정보를 불러왔습니다."
        : "처음 한 번만 조건을 저장하면 다음 로그인부터 자동으로 적용됩니다.",
      getProfileStore().isConfigured(savedProfile) ? "success" : "",
    );
  });
}

profileElements.form.addEventListener("submit", handleProfileSubmit);
profileElements.logoutButton.addEventListener("click", handleProfileLogout);
profileElements.form.addEventListener("change", () => {
  clearValidationErrors();
  setFormStatus("");
  updatePreview();
});
setFormEnabled(false);
window.addEventListener("kangnam-firebase-ready", initProfileAuth, { once: true });
initProfileAuth();
