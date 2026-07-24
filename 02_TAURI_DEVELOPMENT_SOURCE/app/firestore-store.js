"use strict";

(function registerFirestoreStore(global) {
  const LIMITS = Object.freeze({
    firestoreFreeReadsPerDay: 50000,
    firestoreFreeWritesPerDay: 20000,
    firestoreFreeDeletesPerDay: 20000,
    appReadsPerDay: 38000,
    appWritesPerDay: 8000,
    appDeletesPerDay: 8000,
    noticesPerRequest: 20,
    adminsPerRequest: 20,
  });
  const MAX_RESERVATION = Object.freeze({ reads: 21, writes: 2, deletes: 1 });
  const ALLOWED_ROLES = Object.freeze(["viewer", "editor", "owner"]);
  const PUBLISHED_CACHE_KEY = "kangnamFirestorePublishedCacheV2";
  const PUBLISHED_CACHE_TTL_MS = 5 * 60 * 1000;

  class FirestoreBudgetError extends Error {
    constructor(message, code = "FREE_TIER_LIMIT") {
      super(message);
      this.name = "FirestoreBudgetError";
      this.code = code;
    }
  }

  function getPacificDateId(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function waitForFirestore() {
    if (global.KANGNAM_FIRESTORE) return Promise.resolve(global.KANGNAM_FIRESTORE);

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve(global.KANGNAM_FIRESTORE || null);
      };
      global.addEventListener?.("kangnam-firebase-ready", finish, { once: true });
      global.setTimeout(finish, 1500);
    });
  }

  const ready = waitForFirestore();

  function normalizeUnits(units = {}) {
    const normalized = {
      reads: Number(units.reads || 0),
      writes: Number(units.writes || 0),
      deletes: Number(units.deletes || 0),
    };

    Object.entries(normalized).forEach(([key, value]) => {
      if (!Number.isInteger(value) || value < 0 || value > MAX_RESERVATION[key]) {
        throw new FirestoreBudgetError("허용되지 않은 사용량 예약입니다.", "INVALID_RESERVATION");
      }
    });
    return normalized;
  }

  function assertWithinBudget(next) {
    if (next.reads > LIMITS.appReadsPerDay) {
      throw new FirestoreBudgetError("오늘의 무료 읽기 보호 한도에 도달했습니다. 내일 다시 이용해 주세요.");
    }
    if (next.writes > LIMITS.appWritesPerDay) {
      throw new FirestoreBudgetError("오늘의 무료 저장 보호 한도에 도달했습니다. 내일 다시 이용해 주세요.");
    }
    if (next.deletes > LIMITS.appDeletesPerDay) {
      throw new FirestoreBudgetError("오늘의 무료 삭제 보호 한도에 도달했습니다. 내일 다시 이용해 주세요.");
    }
  }

  async function reserveUsage(units) {
    const api = await ready;
    if (!api?.db || !api.runTransaction) {
      return { guarded: false, mode: "local" };
    }

    const delta = normalizeUnits(units);
    const date = getPacificDateId();
    const usageRef = api.doc(api.db, "systemUsage", date);

    const usage = await api.runTransaction(api.db, async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const current = snapshot.exists()
        ? snapshot.data()
        : { reads: 0, writes: 0, deletes: 0 };
      const next = {
        reads: Number(current.reads || 0) + delta.reads,
        writes: Number(current.writes || 0) + delta.writes,
        deletes: Number(current.deletes || 0) + delta.deletes,
      };
      assertWithinBudget(next);
      transaction.set(usageRef, {
        date,
        ...next,
        updatedAt: Date.now(),
      });
      return next;
    });

    return { guarded: true, mode: "firestore", date, usage, limits: LIMITS };
  }

  function cleanDocument(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function trimText(value, maxLength) {
    return String(value || "").trim().slice(0, maxLength);
  }

  function normalizeOfficialUrl(value, { required = false } = {}) {
    const candidate = trimText(value, 1500);
    if (!candidate && !required) return "";
    try {
      const parsed = new global.URL(candidate);
      const boardSeq = parsed.searchParams.get("encMenuBoardSeq") || "";
      if (parsed.protocol === "https:" && parsed.hostname === "web.kangnam.ac.kr" && !/^schoolnotice\d+$/i.test(boardSeq)) {
        return parsed.toString();
      }
    } catch {
      // A consistent validation error is returned below.
    }
    throw new FirestoreBudgetError("강남대학교 공식 공고 URL을 확인해 주세요.", "INVALID_NOTICE");
  }

  function clearPublishedCache() {
    try {
      global.sessionStorage?.removeItem(PUBLISHED_CACHE_KEY);
    } catch {
      // Cache failures must never block Firestore operations.
    }
  }

  function readPublishedCache() {
    try {
      const cached = JSON.parse(global.sessionStorage?.getItem(PUBLISHED_CACHE_KEY) || "null");
      if (!cached || !Array.isArray(cached.notices) || Date.now() >= Number(cached.expiresAt || 0)) {
        clearPublishedCache();
        return null;
      }
      return cached.notices;
    } catch {
      clearPublishedCache();
      return null;
    }
  }

  function writePublishedCache(notices) {
    try {
      global.sessionStorage?.setItem(PUBLISHED_CACHE_KEY, JSON.stringify({
        expiresAt: Date.now() + PUBLISHED_CACHE_TTL_MS,
        notices,
      }));
    } catch {
      // Firestore data remains usable when browser storage is unavailable.
    }
  }

  function normalizeNotice(notice) {
    const cleaned = cleanDocument(notice || {});
    if (!cleaned.id || !cleaned.title) {
      throw new FirestoreBudgetError("공고 ID와 제목이 필요합니다.", "INVALID_NOTICE");
    }
    const approvalStatus = ["draft", "review", "published", "declined"].includes(cleaned.approvalStatus)
      ? cleaned.approvalStatus
      : "draft";
    const normalizeNullableBoolean = (value) => (typeof value === "boolean" ? value : null);
    return {
      schemaVersion: 2,
      id: trimText(cleaned.id, 120),
      title: trimText(cleaned.title, 240),
      category: trimText(cleaned.category, 80),
      department: trimText(cleaned.department, 160),
      date: trimText(cleaned.date, 40),
      status: trimText(cleaned.status, 40),
      recruitmentStatus: trimText(cleaned.recruitmentStatus, 40),
      eligibleEnrollmentStatus: (Array.isArray(cleaned.eligibleEnrollmentStatus)
        ? cleaned.eligibleEnrollmentStatus
        : [])
        .map((value) => trimText(value, 40))
        .filter(Boolean)
        .slice(0, 8),
      eligibleGrades: trimText(cleaned.eligibleGrades, 80),
      transferStudentEligible: normalizeNullableBoolean(cleaned.transferStudentEligible),
      graduateEligible: normalizeNullableBoolean(cleaned.graduateEligible),
      summary: trimText(cleaned.summary, 4000),
      sourceUrl: normalizeOfficialUrl(cleaned.sourceUrl, { required: true }),
      sourceTitle: trimText(cleaned.sourceTitle, 300),
      sourcePrefix: trimText(cleaned.sourcePrefix, 80),
      sourceImageUrl: (() => {
        try {
          return normalizeOfficialUrl(cleaned.sourceImageUrl);
        } catch {
          return "";
        }
      })(),
      publishedAt: trimText(cleaned.publishedAt, 40),
      sourceType: trimText(cleaned.sourceType, 40),
      dataMethod: trimText(cleaned.dataMethod, 80),
      reviewed: cleaned.reviewed === true,
      reviewedAt: trimText(cleaned.reviewedAt, 40),
      imageUrls: (Array.isArray(cleaned.imageUrls) ? cleaned.imageUrls : [])
        .map((url) => {
          try {
            return normalizeOfficialUrl(url);
          } catch {
            return "";
          }
        })
        .filter(Boolean)
        .slice(0, 4),
      faqs: (Array.isArray(cleaned.faqs) ? cleaned.faqs : [])
        .slice(0, 10)
        .map((faq, index) => ({
          id: trimText(faq.id || `faq-${index + 1}`, 120),
          question: trimText(faq.question, 300),
          answer: trimText(faq.answer, 2000),
          source: trimText(faq.source, 300),
        })),
      facts: {
        period: trimText(cleaned.facts?.period, 500),
        eligibility: trimText(cleaned.facts?.eligibility, 500),
        field: trimText(cleaned.facts?.field, 500),
        documents: trimText(cleaned.facts?.documents, 500),
        operation: trimText(cleaned.facts?.operation, 500),
      },
      isPublished: approvalStatus === "published",
      approvalStatus,
      updatedAt: Date.now(),
    };
  }

  function mapDocuments(snapshot) {
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  }

  async function loadPublishedNotices() {
    const apiPayload = await requestPublicApi("/api/notices");
    const d1Notices = Array.isArray(apiPayload?.notices) ? apiPayload.notices : [];

    const api = await ready;
    if (!api?.db) return { notices: d1Notices, source: d1Notices.length > 0 ? "cloudflare-d1" : "local", guarded: d1Notices.length > 0 };

    const cachedNotices = readPublishedCache();
    if (cachedNotices) {
      return { notices: cachedNotices, source: "firestore-cache", guarded: true };
    }

    await reserveUsage({ reads: LIMITS.noticesPerRequest + 1, writes: 1 });
    const publishedQuery = api.query(
      api.collection(api.db, "notices"),
      api.where("approvalStatus", "==", "published"),
      api.limit(LIMITS.noticesPerRequest),
    );
    const snapshot = await api.getDocs(publishedQuery);
    const notices = [...d1Notices, ...mapDocuments(snapshot)]
      .filter((notice, index, list) => list.findIndex((item) => item.id === notice.id) === index)
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    writePublishedCache(notices);
    return { notices, source: d1Notices.length > 0 ? "cloudflare-d1+firestore" : "firestore", guarded: true };
  }

  async function loadAllNotices() {
    const apiPayload = await requestAdminApi("/api/admin/notices");
    if (apiPayload?.notices) {
      return { notices: apiPayload.notices, source: "cloudflare-d1", guarded: true };
    }

    const api = await ready;
    if (!api?.db) return { notices: [], source: "local", guarded: false };

    await reserveUsage({ reads: LIMITS.noticesPerRequest + 1, writes: 1 });
    const snapshot = await api.getDocs(api.query(
      api.collection(api.db, "notices"),
      api.limit(LIMITS.noticesPerRequest),
    ));
    const notices = mapDocuments(snapshot)
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    return { notices, source: "firestore", guarded: true };
  }

  async function saveNotice(notice) {
    const adminApiPayload = await requestAdminApi("/api/admin/notices", {
      method: "POST",
      body: JSON.stringify(notice || {}),
    });
    if (adminApiPayload?.saved) {
      clearPublishedCache();
      return { saved: true, source: "cloudflare-d1", notice: adminApiPayload.notice };
    }

    const api = await ready;
    if (!api?.db) {
      return { saved: false, source: "local", reason: "Firestore가 연결되지 않았습니다." };
    }

    const normalized = normalizeNotice(notice);
    await reserveUsage({ reads: 1, writes: 2 });
    await api.setDoc(api.doc(api.db, "notices", normalized.id), normalized, { merge: true });
    clearPublishedCache();
    return { saved: true, source: "firestore", notice: normalized };
  }

  async function deleteNotice(noticeId) {
    const adminApiPayload = await requestAdminApi(`/api/admin/notices/${encodeURIComponent(String(noticeId).slice(0, 120))}`, {
      method: "DELETE",
    });
    if (adminApiPayload?.deleted) {
      clearPublishedCache();
      return { deleted: true, source: "cloudflare-d1" };
    }

    const api = await ready;
    if (!api?.db) {
      return { deleted: false, source: "local", reason: "Firestore가 연결되지 않았습니다." };
    }

    await reserveUsage({ reads: 1, writes: 1, deletes: 1 });
    await api.deleteDoc(api.doc(api.db, "notices", String(noticeId).slice(0, 120)));
    clearPublishedCache();
    return { deleted: true, source: "firestore" };
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getAdminApiBase() {
    return String(global.KANGNAM_PUBLIC_CONFIG?.adminRoleEndpoint || "").replace(/\/$/, "");
  }

  async function getFirebaseIdToken() {
    const user = global.KANGNAM_FIREBASE?.auth?.currentUser;
    if (!user?.getIdToken) return "";
    return user.getIdToken();
  }

  async function requestAdminApi(path, options = {}) {
    const baseUrl = getAdminApiBase();
    if (!baseUrl) return null;

    const token = await getFirebaseIdToken();
    if (!token) return null;

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new FirestoreBudgetError(payload.message || "관리자 권한 서버 요청에 실패했습니다.", payload.code || "ADMIN_API_ERROR");
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function requestPublicApi(path) {
    const baseUrl = getAdminApiBase();
    if (!baseUrl) return null;

    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new FirestoreBudgetError(payload.message || "공용 데이터 요청에 실패했습니다.", payload.code || "PUBLIC_API_ERROR");
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function getAdminRole(email) {
    const apiPayload = await requestAdminApi("/api/admin/role");
    if (apiPayload?.role && ALLOWED_ROLES.includes(apiPayload.role)) {
      return apiPayload.role;
    }

    const api = await ready;
    const normalizedEmail = normalizeEmail(email);
    if (!api?.db || !normalizedEmail) return null;

    await reserveUsage({ reads: 2, writes: 1 });
    const snapshot = await api.getDoc(api.doc(api.db, "admins", normalizedEmail));
    const role = snapshot.exists() ? snapshot.data()?.role : null;
    return ALLOWED_ROLES.includes(role) ? role : null;
  }

  async function loadAdmins() {
    const apiPayload = await requestAdminApi("/api/admin/members");
    if (apiPayload?.members) {
      return {
        admins: apiPayload.members.map((admin) => ({
          ...admin,
          email: normalizeEmail(admin.email),
        })),
        source: "cloudflare-d1",
        guarded: true,
      };
    }

    const api = await ready;
    if (!api?.db) return { admins: [], source: "local", guarded: false };

    await reserveUsage({ reads: LIMITS.adminsPerRequest + 1, writes: 1 });
    const snapshot = await api.getDocs(api.query(
      api.collection(api.db, "admins"),
      api.limit(LIMITS.adminsPerRequest),
    ));
    return {
      admins: mapDocuments(snapshot).map((admin) => ({
        ...admin,
        email: normalizeEmail(admin.email || admin.id),
      })),
      source: "firestore",
      guarded: true,
    };
  }

  async function saveAdmin(admin) {
    const adminApiPayload = await requestAdminApi("/api/admin/members", {
      method: "POST",
      body: JSON.stringify(admin || {}),
    });
    if (adminApiPayload?.saved) {
      return { saved: true, source: "cloudflare-d1" };
    }

    const api = await ready;
    const email = normalizeEmail(admin?.email);
    const role = ALLOWED_ROLES.includes(admin?.role) ? admin.role : "viewer";
    if (!api?.db) return { saved: false, source: "local" };
    if (!email) throw new FirestoreBudgetError("관리자 이메일이 필요합니다.", "INVALID_ADMIN");

    await reserveUsage({ reads: 1, writes: 2 });
    await api.setDoc(api.doc(api.db, "admins", email), {
      schemaVersion: 2,
      email,
      role,
      updatedAt: Date.now(),
    }, { merge: true });
    return { saved: true, source: "firestore" };
  }

  async function deleteAdmin(email) {
    const adminApiPayload = await requestAdminApi(`/api/admin/members/${encodeURIComponent(normalizeEmail(email))}`, {
      method: "DELETE",
    });
    if (adminApiPayload?.deleted) {
      return { deleted: true, source: "cloudflare-d1" };
    }

    const api = await ready;
    const normalizedEmail = normalizeEmail(email);
    if (!api?.db) return { deleted: false, source: "local" };
    if (!normalizedEmail) throw new FirestoreBudgetError("관리자 이메일이 필요합니다.", "INVALID_ADMIN");

    await reserveUsage({ reads: 1, writes: 1, deletes: 1 });
    await api.deleteDoc(api.doc(api.db, "admins", normalizedEmail));
    return { deleted: true, source: "firestore" };
  }

  function getFriendlyError(error) {
    if (error?.code === "FREE_TIER_LIMIT") return error.message;
    if (error?.code === "permission-denied") return "Firestore 관리자 권한을 확인해 주세요.";
    return error?.message || "공용 데이터를 불러오지 못했습니다.";
  }

  global.KANGNAM_NOTICE_STORE = Object.freeze({
    ready,
    limits: LIMITS,
    reserveUsage,
    loadPublishedNotices,
    loadAllNotices,
    saveNotice,
    deleteNotice,
    getAdminRole,
    loadAdmins,
    saveAdmin,
    deleteAdmin,
    getFriendlyError,
  });
})(window);
