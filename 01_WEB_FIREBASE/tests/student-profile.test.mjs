import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../app/student-profile.js", import.meta.url), "utf8");

function createHarness() {
  const values = new Map();
  const window = {
    localStorage: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(String(key), String(value));
      },
      removeItem(key) {
        values.delete(String(key));
      },
    },
  };
  const sandbox = {
    Date,
    JSON,
    Math,
    Object,
    Set,
    String,
    window,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "student-profile.js" });
  return { profile: window.KANGNAM_STUDENT_PROFILE, values };
}

test("student profile local storage", async (t) => {
  await t.test("saves only allowed matching fields for the signed-in uid", () => {
    const { profile, values } = createHarness();
    const saved = profile.save({ uid: "student-uid-1" }, {
      enrollmentStatus: "재학생",
      grade: "2",
      transferStudent: true,
      interests: ["장학", "취업", "허용되지 않은 값"],
      phone: "수집하면 안 되는 값",
    });

    assert.equal(saved.enrollmentStatus, "재학생");
    assert.equal(saved.grade, "2");
    assert.equal(saved.transferStudent, true);
    assert.deepEqual([...saved.interests], ["장학", "취업"]);
    assert.equal("phone" in saved, false);
    assert.equal(values.size, 1);
    assert.ok([...values.keys()][0].endsWith("student-uid-1"));
  });

  await t.test("does not place an email address in the localStorage key", () => {
    const { profile, values } = createHarness();
    profile.save({ email: "student@kangnam.ac.kr" }, {
      enrollmentStatus: "휴학생",
      interests: ["비교과 프로그램"],
    });

    const storageKey = [...values.keys()][0];
    assert.doesNotMatch(storageKey, /student@kangnam\.ac\.kr/);
    assert.match(storageKey, /kangnamStudentProfileV1:local-/);
  });

  await t.test("keeps profiles separate for different users and supports clearing", () => {
    const { profile } = createHarness();
    const firstUser = { uid: "first" };
    const secondUser = { uid: "second" };
    profile.save(firstUser, { enrollmentStatus: "재학생", interests: ["학사"] });
    profile.save(secondUser, { enrollmentStatus: "졸업생", interests: ["취업"] });

    assert.equal(profile.load(firstUser).enrollmentStatus, "재학생");
    assert.equal(profile.load(secondUser).enrollmentStatus, "졸업생");
    assert.equal(profile.isConfigured(profile.load(firstUser)), true);
    profile.clear(firstUser);
    assert.equal(profile.isConfigured(profile.load(firstUser)), false);
    assert.equal(profile.isConfigured(profile.load(secondUser)), true);
  });
});
