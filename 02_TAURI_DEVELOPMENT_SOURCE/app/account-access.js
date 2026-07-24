"use strict";

(function registerAccountAccess(global) {
  const ADMIN_ROLES = Object.freeze(["owner", "editor"]);
  const LOCAL_ADMIN_STORAGE_KEY = "kangnamManagedMembers";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isLocalPreviewOrigin() {
    const protocol = global.location?.protocol || "";
    const hostname = global.location?.hostname || "";
    return protocol === "file:"
      || ["127.0.0.1", "localhost", "tauri.localhost"].includes(hostname);
  }

  function readLocalAdminRole(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !isLocalPreviewOrigin()) return null;

    try {
      const members = JSON.parse(global.localStorage?.getItem(LOCAL_ADMIN_STORAGE_KEY) || "[]");
      const matched = Array.isArray(members)
        ? members.find((member) => normalizeEmail(member?.email) === normalizedEmail)
        : null;
      if (ADMIN_ROLES.includes(matched?.role)) return matched.role;
    } catch {
      // Local preview data is optional. Unknown accounts remain students.
    }

    const roleLists = global.KANGNAM_FIREBASE?.roleLists || { owners: [], editors: [] };
    if ((roleLists.owners || []).map(normalizeEmail).includes(normalizedEmail)) return "owner";
    if ((roleLists.editors || []).map(normalizeEmail).includes(normalizedEmail)) return "editor";
    return null;
  }

  async function resolveAccount(user) {
    const email = normalizeEmail(user?.email);
    if (!email) {
      return Object.freeze({
        type: "guest",
        role: "viewer",
        isAdmin: false,
        source: "signed-out",
        warning: "",
      });
    }

    let role = null;
    let source = "student-default";
    let warning = "";

    try {
      const store = global.KANGNAM_NOTICE_STORE;
      const firestore = await store?.ready;
      if (firestore?.db && typeof store?.getAdminRole === "function") {
        role = await store.getAdminRole(email);
        source = "firestore";
      } else {
        role = readLocalAdminRole(email);
        source = "local";
      }
    } catch (error) {
      warning = global.KANGNAM_NOTICE_STORE?.getFriendlyError?.(error)
        || "관리자 권한을 확인하지 못해 학생 화면으로 이동합니다.";
    }

    const isAdmin = ADMIN_ROLES.includes(role);
    return Object.freeze({
      type: isAdmin ? "admin" : "student",
      role: isAdmin ? role : "viewer",
      isAdmin,
      source,
      warning,
    });
  }

  function getSafeStudentReturnUrl(search = global.location?.search || "") {
    const fallback = new global.URL("./index.html", global.location?.href || "http://localhost/");
    const rawReturnTo = new global.URLSearchParams(search).get("returnTo");
    if (!rawReturnTo) return fallback.href;

    try {
      const candidate = new global.URL(rawReturnTo, fallback);
      const allowedPage = /\/(?:index|notice)\.html$/u.test(candidate.pathname);
      if (candidate.origin === fallback.origin && allowedPage) return candidate.href;
    } catch {
      // Invalid or cross-origin return paths fall back to the student home.
    }
    return fallback.href;
  }

  function getCurrentStudentReturnPath() {
    const location = global.location;
    if (!location) return "index.html";
    const pageName = location.pathname.split("/").pop() || "index.html";
    if (!["index.html", "notice.html"].includes(pageName)) return "index.html";
    return `${pageName}${location.search || ""}`;
  }

  function getLoginUrl({ stay = false } = {}) {
    const loginUrl = new global.URL("./login.html", global.location?.href || "http://localhost/");
    loginUrl.searchParams.set("returnTo", getCurrentStudentReturnPath());
    if (stay) loginUrl.searchParams.set("stay", "1");
    return `${loginUrl.pathname}${loginUrl.search}`;
  }

  global.KANGNAM_ACCOUNT_ACCESS = Object.freeze({
    resolveAccount,
    getSafeStudentReturnUrl,
    getCurrentStudentReturnPath,
    getLoginUrl,
  });
})(window);
