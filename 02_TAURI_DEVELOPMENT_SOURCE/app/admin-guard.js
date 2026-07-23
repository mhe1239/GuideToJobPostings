"use strict";

const ADMIN_ROLE_STORAGE_KEY = "kangnamManagedMembers";
const ADMIN_BOOTSTRAP_KEY = "kangnamAdminBootstrapEmail";
const PRIMARY_ADMIN_MIGRATION_KEY = "kangnamPrimaryAdminSeeded20260723";
const ADMIN_BOOTSTRAP_TRANSFER_KEY = "kangnamBootstrapTransferred";
const ADMIN_ACCESS_SNAPSHOT_KEY = "kangnamLastAdminAccess";
const ADMIN_ROLE_RANK = Object.freeze({ viewer: 0, editor: 1, owner: 2 });

function normalizeAdminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readManagedMembers() {
  try {
    const members = JSON.parse(window.localStorage.getItem(ADMIN_ROLE_STORAGE_KEY) || "[]");
    return Array.isArray(members) ? members : [];
  } catch {
    return [];
  }
}

function writeManagedMembers(members) {
  window.localStorage.setItem(ADMIN_ROLE_STORAGE_KEY, JSON.stringify(members));
}

function getPrimaryAdminEmail() {
  return normalizeAdminEmail(window.KANGNAM_ADMIN_CONFIG?.primaryAdminEmail);
}

function getConfiguredRole(email) {
  const roleLists = window.KANGNAM_FIREBASE?.roleLists || {};
  const owners = Array.isArray(roleLists.owners) ? roleLists.owners.map(normalizeAdminEmail) : [];
  const editors = Array.isArray(roleLists.editors) ? roleLists.editors.map(normalizeAdminEmail) : [];
  if (owners.includes(email)) return "owner";
  if (editors.includes(email)) return "editor";
  return "";
}

function ensurePrimaryAdmin() {
  const primaryEmail = getPrimaryAdminEmail();
  if (!primaryEmail) return;

  const members = readManagedMembers();
  const primaryMember = members.find((member) => normalizeAdminEmail(member.email) === primaryEmail);
  const alreadySeeded = window.localStorage.getItem(PRIMARY_ADMIN_MIGRATION_KEY) === primaryEmail;
  const bootstrapTransferred = window.localStorage.getItem(ADMIN_BOOTSTRAP_TRANSFER_KEY) === "true";
  const shouldOwnBootstrap = !bootstrapTransferred;
  const primarySource = shouldOwnBootstrap ? "최고 관리자" : primaryMember?.source || "관리자 권한";
  if (alreadySeeded && primaryMember?.role === "owner" && primaryMember?.source === primarySource) return;

  if (shouldOwnBootstrap) window.localStorage.setItem(ADMIN_BOOTSTRAP_KEY, primaryEmail);
  const withoutPrimary = members.filter((member) => normalizeAdminEmail(member.email) !== primaryEmail);
  writeManagedMembers([
    { email: primaryEmail, role: "owner", source: primarySource },
    ...withoutPrimary,
  ]);
  window.localStorage.setItem(PRIMARY_ADMIN_MIGRATION_KEY, primaryEmail);
}

function resolveAdminRole(user) {
  ensurePrimaryAdmin();
  const email = normalizeAdminEmail(user?.email);
  if (!email) return "viewer";
  if (email === getPrimaryAdminEmail()) return "owner";
  const configuredRole = getConfiguredRole(email);
  if (configuredRole) return configuredRole;

  const members = readManagedMembers()
    .map((member) => ({ ...member, email: normalizeAdminEmail(member.email) }))
    .filter((member) => member.email);
  const matched = members.find((member) => member.email === email);
  if (matched && ADMIN_ROLE_RANK[matched.role] !== undefined) return matched.role;

  const bootstrapEmail = normalizeAdminEmail(window.localStorage.getItem(ADMIN_BOOTSTRAP_KEY));
  if (bootstrapEmail && bootstrapEmail === email) return "owner";

  if (!bootstrapEmail && members.length === 0) {
    window.localStorage.setItem(ADMIN_BOOTSTRAP_KEY, email);
    writeManagedMembers([{ email, role: "owner", source: "최고 관리자" }]);
    return "owner";
  }

  return "viewer";
}

function getRequiredRoles() {
  const roleText = document.body?.dataset.adminRoles || "owner editor";
  return roleText.split(/\s+/).filter(Boolean);
}

function isAllowedRole(role, requiredRoles = getRequiredRoles()) {
  return requiredRoles.includes(role);
}

function setGuardMessage(message) {
  const messageElement = document.querySelector("#admin-guard-message");
  if (messageElement) messageElement.textContent = message;
}

function redirectToStudentHome() {
  window.setTimeout(() => {
    window.location.assign("./index.html");
  }, 900);
}

function rememberAllowedAccess(user, role) {
  const email = normalizeAdminEmail(user?.email);
  if (!email || !isAllowedRole(role)) return;

  window.sessionStorage.setItem(ADMIN_ACCESS_SNAPSHOT_KEY, JSON.stringify({
    email,
    role,
    savedAt: Date.now(),
  }));
}

function waitForFirebase() {
  if (window.KANGNAM_FIREBASE) return Promise.resolve(window.KANGNAM_FIREBASE);

  return new Promise((resolve) => {
    window.addEventListener("kangnam-firebase-ready", () => resolve(window.KANGNAM_FIREBASE), { once: true });
    window.setTimeout(() => resolve(window.KANGNAM_FIREBASE || null), 1200);
  });
}

function waitForAdminConfig() {
  if (window.KANGNAM_ADMIN_CONFIG) return Promise.resolve();

  return new Promise((resolve) => {
    window.addEventListener("kangnam-admin-config-ready", () => resolve(), { once: true });
    window.setTimeout(resolve, 1200);
  });
}

async function checkAdminAccess() {
  document.body.dataset.adminGuard = "pending";
  setGuardMessage("관리자 권한을 확인하고 있습니다.");

  await waitForAdminConfig();
  const firebase = await waitForFirebase();
  if (!firebase?.onAuthStateChanged) {
    document.body.dataset.adminGuard = "denied";
    setGuardMessage("관리자만 접근 가능한 페이지입니다.");
    redirectToStudentHome();
    return { allowed: false, user: null, role: "viewer", reason: "signed-out" };
  }

  return new Promise((resolve) => {
    firebase.onAuthStateChanged(firebase.auth, (user) => {
      if (!user) {
        document.body.dataset.adminGuard = "denied";
        setGuardMessage("관리자만 접근 가능한 페이지입니다.");
        redirectToStudentHome();
        resolve({ allowed: false, user: null, role: "viewer", reason: "signed-out" });
        return;
      }

      const role = resolveAdminRole(user);
      if (!isAllowedRole(role)) {
        document.body.dataset.adminGuard = "denied";
        setGuardMessage("관리자 권한이 없습니다.");
        redirectToStudentHome();
        resolve({ allowed: false, user, role, reason: "forbidden" });
        return;
      }

      document.body.dataset.adminGuard = "allowed";
      rememberAllowedAccess(user, role);
      resolve({ allowed: true, user, role, reason: "allowed" });
    });
  });
}

const accessReady = checkAdminAccess();

window.KANGNAM_ADMIN_ACCESS = {
  ready: accessReady,
  isAllowedRole,
  resolveAdminRole,
  canManageMembers: (role) => role === "owner",
  canEditAndPublish: (role) => role === "owner" || role === "editor",
};
