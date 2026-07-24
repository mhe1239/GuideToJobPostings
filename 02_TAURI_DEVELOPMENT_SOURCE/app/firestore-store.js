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

  function normalizeNotice(notice) {
    const cleaned = cleanDocument(notice || {});
    if (!cleaned.id || !cleaned.title) {
      throw new FirestoreBudgetError("공고 ID와 제목이 필요합니다.", "INVALID_NOTICE");
    }
    return {
      ...cleaned,
      id: String(cleaned.id).slice(0, 120),
      title: String(cleaned.title).slice(0, 240),
      approvalStatus: cleaned.approvalStatus || "draft",
      updatedAt: Date.now(),
    };
  }

  function mapDocuments(snapshot) {
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  }

  async function loadPublishedNotices() {
    const api = await ready;
    if (!api?.db) return { notices: [], source: "local", guarded: false };

    await reserveUsage({ reads: LIMITS.noticesPerRequest + 1, writes: 1 });
    const publishedQuery = api.query(
      api.collection(api.db, "notices"),
      api.where("approvalStatus", "==", "published"),
      api.limit(LIMITS.noticesPerRequest),
    );
    const snapshot = await api.getDocs(publishedQuery);
    const notices = mapDocuments(snapshot)
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    return { notices, source: "firestore", guarded: true };
  }

  async function loadAllNotices() {
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
    const api = await ready;
    if (!api?.db) {
      return { saved: false, source: "local", reason: "Firestore가 연결되지 않았습니다." };
    }

    const normalized = normalizeNotice(notice);
    await reserveUsage({ reads: 1, writes: 2 });
    await api.setDoc(api.doc(api.db, "notices", normalized.id), normalized, { merge: true });
    return { saved: true, source: "firestore", notice: normalized };
  }

  async function deleteNotice(noticeId) {
    const api = await ready;
    if (!api?.db) {
      return { deleted: false, source: "local", reason: "Firestore가 연결되지 않았습니다." };
    }

    await reserveUsage({ reads: 1, writes: 1, deletes: 1 });
    await api.deleteDoc(api.doc(api.db, "notices", String(noticeId).slice(0, 120)));
    return { deleted: true, source: "firestore" };
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  async function getAdminRole(email) {
    const api = await ready;
    const normalizedEmail = normalizeEmail(email);
    if (!api?.db || !normalizedEmail) return null;

    await reserveUsage({ reads: 2, writes: 1 });
    const snapshot = await api.getDoc(api.doc(api.db, "admins", normalizedEmail));
    const role = snapshot.exists() ? snapshot.data()?.role : null;
    return ALLOWED_ROLES.includes(role) ? role : null;
  }

  async function loadAdmins() {
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
    const api = await ready;
    const email = normalizeEmail(admin?.email);
    const role = ALLOWED_ROLES.includes(admin?.role) ? admin.role : "viewer";
    if (!api?.db) return { saved: false, source: "local" };
    if (!email) throw new FirestoreBudgetError("관리자 이메일이 필요합니다.", "INVALID_ADMIN");

    await reserveUsage({ reads: 1, writes: 2 });
    await api.setDoc(api.doc(api.db, "admins", email), {
      email,
      role,
      updatedAt: Date.now(),
    }, { merge: true });
    return { saved: true, source: "firestore" };
  }

  async function deleteAdmin(email) {
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
