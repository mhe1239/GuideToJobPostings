import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../app/firestore-store.js", import.meta.url), "utf8");

function createSnapshot(data) {
  return {
    exists: () => data !== undefined,
    data: () => data,
  };
}

function createHarness({
  usage = { reads: 0, writes: 0, deletes: 0 },
  notices = [],
} = {}) {
  let currentUsage = { ...usage };
  const writes = [];
  const deletes = [];
  const queries = [];

  const api = {
    db: {},
    doc(_db, ...segments) {
      return { path: segments.join("/") };
    },
    collection(_db, name) {
      return { path: name };
    },
    where(field, operator, value) {
      return { type: "where", field, operator, value };
    },
    limit(value) {
      return { type: "limit", value };
    },
    query(collectionRef, ...constraints) {
      return { collectionRef, constraints };
    },
    async runTransaction(_db, callback) {
      let pendingUsage = null;
      const transaction = {
        async get(ref) {
          if (ref.path.startsWith("systemUsage/")) return createSnapshot(currentUsage);
          return createSnapshot(undefined);
        },
        set(ref, data) {
          if (ref.path.startsWith("systemUsage/")) pendingUsage = { ...data };
        },
      };
      const result = await callback(transaction);
      if (pendingUsage) currentUsage = pendingUsage;
      return result;
    },
    async getDocs(queryObject) {
      queries.push(queryObject);
      const whereConstraint = queryObject.constraints.find((item) => item.type === "where");
      const limitConstraint = queryObject.constraints.find((item) => item.type === "limit");
      const filtered = whereConstraint
        ? notices.filter((notice) => notice[whereConstraint.field] === whereConstraint.value)
        : notices;
      const limited = filtered.slice(0, limitConstraint?.value ?? filtered.length);
      return {
        docs: limited.map((notice) => ({
          id: notice.id,
          data: () => ({ ...notice }),
        })),
      };
    },
    async getDoc(ref) {
      return createSnapshot(notices.find((notice) => `admins/${notice.id}` === ref.path));
    },
    async setDoc(ref, data, options) {
      writes.push({ ref, data, options });
    },
    async deleteDoc(ref) {
      deletes.push(ref);
    },
  };

  const sandbox = {
    Date,
    Intl,
    JSON,
    Number,
    Object,
    Promise,
    String,
    console,
    setTimeout,
    window: {
      KANGNAM_FIRESTORE: api,
      addEventListener() {},
      setTimeout,
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "firestore-store.js" });

  return {
    store: sandbox.window.KANGNAM_NOTICE_STORE,
    getUsage: () => ({ ...currentUsage }),
    writes,
    deletes,
    queries,
  };
}

test("Firestore Spark guard", async (t) => {
  await t.test("keeps application budgets below the official free quotas", () => {
    const { store } = createHarness();
    assert.ok(store.limits.appReadsPerDay < store.limits.firestoreFreeReadsPerDay);
    assert.ok(store.limits.appWritesPerDay < store.limits.firestoreFreeWritesPerDay);
    assert.ok(store.limits.appDeletesPerDay < store.limits.firestoreFreeDeletesPerDay);
    assert.equal(store.limits.noticesPerRequest, 20);
  });

  await t.test("reserves estimated reads and guard writes atomically", async () => {
    const harness = createHarness();
    const result = await harness.store.reserveUsage({ reads: 21, writes: 1 });
    assert.equal(result.guarded, true);
    assert.deepEqual(harness.getUsage().reads, 21);
    assert.deepEqual(harness.getUsage().writes, 1);
  });

  await t.test("blocks before the conservative daily read budget is exceeded", async () => {
    const harness = createHarness({
      usage: { reads: 37990, writes: 100, deletes: 0 },
    });

    await assert.rejects(
      harness.store.reserveUsage({ reads: 21, writes: 1 }),
      (error) => error.code === "FREE_TIER_LIMIT",
    );
    assert.equal(harness.getUsage().reads, 37990);
  });

  await t.test("limits public notice reads to twenty published documents", async () => {
    const notices = Array.from({ length: 30 }, (_, index) => ({
      id: `notice-${index + 1}`,
      title: `공고 ${index + 1}`,
      approvalStatus: index === 29 ? "draft" : "published",
      updatedAt: index,
    }));
    const harness = createHarness({ notices });

    const result = await harness.store.loadPublishedNotices();
    assert.equal(result.notices.length, 20);
    assert.ok(result.notices.every((notice) => notice.approvalStatus === "published"));
    assert.equal(harness.queries[0].constraints.find((item) => item.type === "limit").value, 20);
  });

  await t.test("does not write a notice when the write safety budget is exhausted", async () => {
    const harness = createHarness({
      usage: { reads: 100, writes: 7999, deletes: 0 },
    });

    await assert.rejects(
      harness.store.saveNotice({
        id: "budget-test",
        title: "예산 보호 테스트",
        approvalStatus: "published",
      }),
      (error) => error.code === "FREE_TIER_LIMIT",
    );
    assert.equal(harness.writes.length, 0);
  });
});
