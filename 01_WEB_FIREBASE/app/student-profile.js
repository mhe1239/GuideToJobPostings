"use strict";

(function registerStudentProfile(global) {
  const STORAGE_PREFIX = "kangnamStudentProfileV1:";
  const ENROLLMENT_STATUSES = Object.freeze(["재학생", "휴학생", "졸업생"]);
  const INTERESTS = Object.freeze(["비교과 프로그램", "장학", "취업", "행사", "학사"]);

  function hashIdentifier(value) {
    let hash = 2166136261;
    for (const character of String(value || "").trim().toLowerCase()) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function getStorageKey(user) {
    const identifier = String(user?.uid || "").trim()
      || (user?.email ? `local-${hashIdentifier(user.email)}` : "");
    return identifier ? `${STORAGE_PREFIX}${identifier}` : "";
  }

  function normalize(profile = {}) {
    const enrollmentStatus = ENROLLMENT_STATUSES.includes(profile.enrollmentStatus)
      ? profile.enrollmentStatus
      : "";
    const grade = ["1", "2", "3", "4"].includes(String(profile.grade || ""))
      ? String(profile.grade)
      : "";
    const interests = Array.isArray(profile.interests)
      ? [...new Set(profile.interests.filter((interest) => INTERESTS.includes(interest)))]
      : [];

    return {
      enrollmentStatus,
      grade,
      transferStudent: profile.transferStudent === true,
      interests,
      filterEnabled: profile.filterEnabled !== false,
      savedAt: typeof profile.savedAt === "string" ? profile.savedAt : "",
    };
  }

  function load(user) {
    const key = getStorageKey(user);
    if (!key) return normalize();

    try {
      return normalize(JSON.parse(global.localStorage?.getItem(key) || "{}"));
    } catch {
      return normalize();
    }
  }

  function save(user, profile) {
    const key = getStorageKey(user);
    if (!key) throw new Error("로그인한 학생 계정을 확인할 수 없습니다.");

    const normalized = normalize({
      ...profile,
      savedAt: new Date().toISOString(),
    });
    global.localStorage?.setItem(key, JSON.stringify(normalized));
    return normalized;
  }

  function clear(user) {
    const key = getStorageKey(user);
    if (key) global.localStorage?.removeItem(key);
  }

  function setFilterEnabled(user, enabled) {
    return save(user, {
      ...load(user),
      filterEnabled: enabled === true,
    });
  }

  function isConfigured(profile) {
    const normalized = normalize(profile);
    return Boolean(normalized.enrollmentStatus && normalized.interests.length > 0);
  }

  function toSummary(profile) {
    const normalized = normalize(profile);
    return [
      normalized.enrollmentStatus,
      normalized.grade ? `${normalized.grade}학년` : "",
      normalized.transferStudent ? "편입생" : "",
      ...normalized.interests,
    ].filter(Boolean);
  }

  global.KANGNAM_STUDENT_PROFILE = Object.freeze({
    enrollmentStatuses: ENROLLMENT_STATUSES,
    interests: INTERESTS,
    normalize,
    load,
    save,
    clear,
    setFilterEnabled,
    isConfigured,
    toSummary,
  });
})(window);
