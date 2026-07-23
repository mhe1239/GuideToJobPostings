"use strict";

(() => {
  const MEMBER_KEY = "kangnamManagedMembers";
  const LOGIN_KEY = "kangnamAdminLogin";
  const ACCESS_KEY = "kangnamLastAdminAccess";
  const PUBLISHED_KEY = "kangnamPublishedNotices";
  const DELETED_KEY = "kangnamDeletedNoticeIds";
  const ROLE_RANK = Object.freeze({ viewer: 0, editor: 1, owner: 2 });
  const ROLE_LABEL = Object.freeze({
    owner: "관리자 관리, 수정 및 공개 가능",
    editor: "수정 및 공개 가능",
    viewer: "보기만 가능",
  });

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function getPrimaryEmail() {
    return normalizeEmail(window.KANGNAM_ADMIN_CONFIG?.primaryAdminEmail);
  }

  function getStoredLogin() {
    const stored = readJson(LOGIN_KEY, null) || (() => {
      try {
        return JSON.parse(window.sessionStorage.getItem(ACCESS_KEY) || "null");
      } catch {
        return null;
      }
    })();
    if (!stored?.email || !stored?.role) return null;
    if (Date.now() - Number(stored.savedAt || 0) > 24 * 60 * 60 * 1000) return null;
    return { email: normalizeEmail(stored.email), role: stored.role };
  }

  function getCurrentAccess() {
    const user = window.KANGNAM_FIREBASE?.auth?.currentUser;
    const email = normalizeEmail(user?.email);
    const primary = getPrimaryEmail();
    const roleLists = window.KANGNAM_FIREBASE?.roleLists || {};
    const owners = Array.isArray(roleLists.owners) ? roleLists.owners.map(normalizeEmail) : [];
    const editors = Array.isArray(roleLists.editors) ? roleLists.editors.map(normalizeEmail) : [];
    const stored = getStoredLogin();
    const members = readJson(MEMBER_KEY, []);
    const member = members.find((item) => normalizeEmail(item.email) === (email || stored?.email));

    if (email && (email === primary || owners.includes(email))) return { email, role: "owner" };
    if (email && editors.includes(email)) return { email, role: "editor" };
    if (member?.role) return { email: normalizeEmail(member.email), role: member.role };
    if (stored?.role) return stored;
    if (primary) return { email: primary, role: "owner" };
    return { email: "", role: "viewer" };
  }

  function can(role, required) {
    return (ROLE_RANK[role] || 0) >= (ROLE_RANK[required] || 0);
  }

  function rememberAccess(access) {
    if (!access.email || !can(access.role, "editor")) return;
    const snapshot = { email: access.email, role: access.role, savedAt: Date.now() };
    window.localStorage.setItem(LOGIN_KEY, JSON.stringify(snapshot));
    window.sessionStorage.setItem(ACCESS_KEY, JSON.stringify(snapshot));
  }

  function ensurePrimaryMember() {
    const primary = getPrimaryEmail();
    if (!primary) return;
    const members = readJson(MEMBER_KEY, []).filter((member) => normalizeEmail(member.email) !== primary);
    writeJson(MEMBER_KEY, [{ email: primary, role: "owner", source: "최고 관리자" }, ...members]);
  }

  function unlockAdminUi() {
    ensurePrimaryMember();
    const access = getCurrentAccess();
    const bodyRoles = (document.body.dataset.adminRoles || "owner editor").split(/\s+/).filter(Boolean);
    const allowed = bodyRoles.includes(access.role);

    if (allowed) {
      document.body.dataset.adminGuard = "allowed";
      rememberAccess(access);
    }

    const badge = $("#admin-auth-badge") || $("#review-status");
    if (badge) {
      badge.textContent = ROLE_LABEL[access.role] || ROLE_LABEL.viewer;
      badge.dataset.state = can(access.role, "editor") ? "approved" : "review";
    }

    const authState = $("#admin-auth-state");
    const title = authState?.querySelector("strong");
    const copy = authState?.querySelector("span");
    if (title && copy) {
      title.textContent = access.email ? `${access.email} · ${ROLE_LABEL[access.role]}` : "로그아웃 상태";
      copy.textContent = allowed ? "관리자 기능을 사용할 수 있습니다." : "현재 계정은 이 화면의 권한이 없습니다.";
    }

    $$(".auth-actions").forEach((area) => {
      area.hidden = Boolean(access.email && can(access.role, "editor"));
    });

    $$("[data-requires-admin]").forEach((area) => {
      area.classList.toggle("locked", !allowed);
      area.querySelectorAll("input, select, textarea, button").forEach((control) => {
        control.disabled = !allowed;
      });
    });

    $$("[data-required-role]").forEach((element) => {
      const visible = can(access.role, element.dataset.requiredRole || "viewer");
      element.dataset.roleHidden = visible ? "false" : "true";
      element.setAttribute("aria-hidden", visible ? "false" : "true");
      element.querySelectorAll("a, button, input, select, textarea").forEach((control) => {
        control.tabIndex = visible ? 0 : -1;
      });
    });

    const memberForm = $("#member-form");
    if (memberForm) {
      memberForm.querySelectorAll("input, select, button").forEach((control) => {
        control.disabled = !can(access.role, "owner");
      });
    }

    const logoutButton = $("#admin-logout-button");
    if (logoutButton) logoutButton.disabled = !access.email;

    return access;
  }

  function getSeedNotices() {
    return [
      {
        id: "seed-neulpum-2026",
        title: "샘플 공고: 늘품 12기 2학기 실습 위원 모집",
        department: "입학전형관리팀",
        date: "2026.07.20",
        category: "비교과 프로그램",
        status: "공개",
        recruitmentStatus: "모집 중",
        sourceUrl: "https://web.kangnam.ac.kr/",
        sourceTitle: "학교 홈페이지 공고",
        publishedAt: "2026.07.20",
        sourceType: "html",
        dataMethod: "관리자 검수",
        reviewed: true,
        reviewedAt: "2026.07.23",
        approvalStatus: "published",
        isPublished: true,
        summary: "관리자가 검수한 공고입니다. 실제 공고 URL로 초안을 생성한 뒤 공개 승인하면 이 목록에 저장됩니다.",
        facts: { period: "공식 공고 확인", eligibility: "공식 공고 확인", field: "공식 공고 확인", documents: "공식 공고 확인", operation: "공식 공고 확인" },
        faqs: [{ id: "seed-faq", question: "어디에서 원문을 확인하나요?", answer: "공식 공고 URL에서 확인해 주세요.", source: "공식 공고" }],
      },
    ];
  }

  function loadPublished() {
    return readJson(PUBLISHED_KEY, []);
  }

  function savePublished(notices) {
    writeJson(PUBLISHED_KEY, notices);
    window.dispatchEvent(new Event("storage"));
  }

  function loadDeleted() {
    return new Set(readJson(DELETED_KEY, []));
  }

  function saveDeleted(ids) {
    writeJson(DELETED_KEY, [...ids]);
  }

  function getManageableNotices() {
    const deleted = loadDeleted();
    const merged = [...loadPublished(), ...getSeedNotices()];
    return merged
      .filter((notice, index, list) => list.findIndex((item) => item.id === notice.id) === index)
      .filter((notice) => !deleted.has(notice.id));
  }

  function makeDraftFromUrl(url) {
    const host = (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return "공식 공고";
      }
    })();
    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");
    return {
      id: `published-${Date.now()}`,
      title: `공식 공고 초안 (${host})`,
      department: "담당 부서 확인 필요",
      date: today,
      category: "학교 공고",
      status: "검수 필요",
      recruitmentStatus: "모집 중",
      sourceUrl: url,
      sourceTitle: url,
      publishedAt: today,
      sourceType: "html",
      dataMethod: "Codex 초안",
      reviewed: false,
      reviewedAt: "",
      approvalStatus: "review",
      isPublished: false,
      summary: `공식 공고 URL을 기준으로 만든 검수용 초안입니다.\n- 원문 URL: ${url}\n- 일정: 공식 공고에서 확인 필요\n- 대상/자격: 공식 공고에서 확인 필요\n- 신청/지원: 공식 공고에서 확인 필요`,
      facts: { period: "공식 공고 확인 필요", eligibility: "공식 공고 확인 필요", field: "공식 공고 확인 필요", documents: "공식 공고 확인 필요", operation: "공식 공고 확인 필요" },
      faqs: [
        { id: "period", question: "신청 기간은 언제인가요?", answer: "공식 공고의 신청 기간 항목을 확인해 주세요.", source: "공식 공고" },
        { id: "eligibility", question: "누가 신청할 수 있나요?", answer: "지원 자격은 공식 공고에서 확인한 뒤 관리자 검수로 확정해 주세요.", source: "공식 공고" },
      ],
    };
  }

  function fillDraft(notice) {
    $("#draft-empty") && ($("#draft-empty").hidden = true);
    $("#draft-fields") && ($("#draft-fields").hidden = false);
    const summary = $("#draft-summary");
    const faq = $("#draft-faq");
    const evidence = $("#draft-evidence");
    const chip = $("#draft-chip");
    if (summary) summary.value = notice.summary || "";
    if (faq) faq.value = (notice.faqs || []).map((item) => `Q. ${item.question}\nA. ${item.answer}`).join("\n\n");
    if (evidence) evidence.value = `출처 URL: ${notice.sourceUrl}\n근거: 공식 공고 원문 확인 후 관리자 검수 필요`;
    if (chip) chip.textContent = notice.approvalStatus === "published" ? "공개" : "검수 필요";
    window.__kangnamCurrentDraft = notice;
    updateApprovalButtons();
  }

  function updateApprovalButtons() {
    const access = getCurrentAccess();
    const ready = !$("#draft-fields")?.hidden;
    const checked = $$(".approval-checkbox").every((box) => box.checked);
    const selectedId = window.__kangnamSelectedPublishedId;
    const canEdit = can(access.role, "editor");
    const edit = $("#edit-draft-button");
    const approve = $("#approve-draft-button");
    const decline = $("#decline-draft-button");
    const save = $("#save-published-button");
    const del = $("#delete-published-button");
    if (edit) edit.disabled = !(canEdit && ready);
    if (approve) approve.disabled = !(canEdit && ready && checked);
    if (decline) decline.disabled = !(canEdit && ready);
    if (save) save.disabled = !(canEdit && selectedId);
    if (del) del.disabled = !(canEdit && selectedId);
  }

  function renderMembers() {
    const list = $("#member-list");
    if (!list) return;
    ensurePrimaryMember();
    const members = readJson(MEMBER_KEY, []);
    if (members.length === 0) {
      list.innerHTML = '<p class="member-empty">등록된 관리자가 없습니다.</p>';
      return;
    }
    list.replaceChildren(...members.map((member) => {
      const row = document.createElement("div");
      const email = document.createElement("strong");
      const role = document.createElement("span");
      const source = document.createElement("small");
      email.textContent = normalizeEmail(member.email);
      role.textContent = ROLE_LABEL[member.role] || ROLE_LABEL.viewer;
      source.textContent = member.source || "브라우저 저장";
      row.append(email, role, source);
      return row;
    }));
  }

  function renderPublishedList() {
    const list = $("#published-list");
    if (!list) return;
    const notices = getManageableNotices();
    const chip = $("#published-count-chip");
    if (chip) chip.textContent = `${notices.length}개`;
    if (notices.length === 0) {
      list.innerHTML = '<p class="member-empty">공개된 공고가 없습니다.</p>';
      return;
    }
    list.replaceChildren(...notices.map((notice) => {
      const button = document.createElement("button");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      const state = document.createElement("small");
      button.type = "button";
      button.className = "published-item";
      title.textContent = notice.title;
      meta.textContent = `${notice.department || "담당 부서 확인"} · ${notice.date || notice.publishedAt || ""}`;
      state.className = "approval-state-label";
      state.textContent = notice.approvalStatus === "published" || notice.isPublished ? "공개" : "검수 필요";
      button.append(title, meta, state);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        window.__kangnamSelectedPublishedId = notice.id;
        fillDraft(notice);
        renderPublishedList();
      });
      if (window.__kangnamSelectedPublishedId === notice.id) button.setAttribute("aria-current", "true");
      return button;
    }));
    updateApprovalButtons();
  }

  function bindMemberForm() {
    const form = $("#member-form");
    if (!form || form.dataset.fixBound) return;
    form.dataset.fixBound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const access = getCurrentAccess();
      if (!can(access.role, "owner")) return;
      const input = $("#member-email");
      const roleInput = $("#member-role");
      const email = normalizeEmail(input?.value);
      if (!email) return;
      const members = readJson(MEMBER_KEY, []).filter((member) => normalizeEmail(member.email) !== email);
      members.push({ email, role: roleInput?.value || "viewer", source: "브라우저 저장" });
      writeJson(MEMBER_KEY, members);
      input.value = "";
      renderMembers();
      unlockAdminUi();
    }, true);
  }

  function bindPublishForm() {
    const form = $("#admin-ingest-form");
    if (!form || form.dataset.fixBound) return;
    form.dataset.fixBound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const access = getCurrentAccess();
      if (!can(access.role, "editor")) return;
      const mode = $("input[name='notice-input-mode']:checked")?.value || "url";
      const selected = window.__kangnamSelectedSchoolNotice;
      const url = mode === "list" ? selected?.sourceUrl : $("#official-notice-url")?.value.trim();
      if (!url) {
        const note = $("#approval-note");
        if (note) note.textContent = "공고 URL을 입력하거나 학교 공고를 선택해 주세요.";
        return;
      }
      fillDraft({ ...makeDraftFromUrl(url), ...(selected || {}), sourceUrl: url, title: selected?.title || makeDraftFromUrl(url).title });
      const note = $("#approval-note");
      if (note) note.textContent = "초안을 생성했습니다. 내용을 확인한 뒤 검수 항목을 체크하고 공개 승인하세요.";
    }, true);

    $("#load-school-notices-button")?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const list = $("#school-notice-list");
      const status = $("#school-import-status");
      if (status) status.textContent = "최근 공고 10개를 불러왔습니다.";
      let notices = [];
      try {
        const response = await fetch("./school-notices.mock.json", { headers: { Accept: "application/json" } });
        notices = await response.json();
      } catch {
        notices = [];
      }
      list?.replaceChildren(...notices.map((notice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "school-notice-item";
        button.innerHTML = `<strong></strong><span></span><small></small><em class="school-notice-state-label">선택 가능</em>`;
        button.querySelector("strong").textContent = notice.title;
        button.querySelector("span").textContent = `${notice.department} · ${notice.publishedAt}`;
        button.querySelector("small").textContent = (notice.sourceType || "html").toUpperCase();
        button.addEventListener("click", (clickEvent) => {
          clickEvent.preventDefault();
          window.__kangnamSelectedSchoolNotice = notice;
          $("#selected-notice-panel")?.classList.add("selected");
          const title = $("#selected-notice-title");
          const source = $("#selected-notice-source");
          if (title) title.textContent = notice.title;
          if (source) source.textContent = `${notice.department} · ${notice.publishedAt} · ${notice.sourceUrl}`;
          list.querySelectorAll(".school-notice-item").forEach((item) => item.removeAttribute("aria-current"));
          button.setAttribute("aria-current", "true");
        });
        return button;
      }));
    }, true);
  }

  function bindApprovalActions() {
    $$(".approval-checkbox").forEach((box) => box.addEventListener("change", updateApprovalButtons));
    $("#approve-draft-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const draft = window.__kangnamCurrentDraft;
      if (!draft || !can(getCurrentAccess().role, "editor")) return;
      const notice = { ...draft, approvalStatus: "published", isPublished: true, reviewed: true, reviewedAt: new Date().toISOString().slice(0, 10).replace(/-/g, ".") };
      const notices = loadPublished().filter((item) => item.id !== notice.id && item.sourceUrl !== notice.sourceUrl);
      savePublished([notice, ...notices].slice(0, 50));
      const deleted = loadDeleted();
      deleted.delete(notice.id);
      saveDeleted(deleted);
      window.__kangnamSelectedPublishedId = notice.id;
      fillDraft(notice);
      renderPublishedList();
      const note = $("#approval-note");
      if (note) note.textContent = "공고가 공개되었습니다.";
    }, true);
  }

  function bindManageActions() {
    $("#save-published-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const selectedId = window.__kangnamSelectedPublishedId;
      const current = window.__kangnamCurrentDraft;
      if (!selectedId || !current || !can(getCurrentAccess().role, "editor")) return;
      const updated = {
        ...current,
        sourceUrl: $("#official-notice-url")?.value || current.sourceUrl,
        summary: $("#draft-summary")?.value || current.summary,
        faqs: ($("#draft-faq")?.value || "").split(/\n{2,}/).filter(Boolean).map((block, index) => ({
          id: `faq-${index + 1}`,
          question: block.match(/^Q\.\s*(.+)$/m)?.[1]?.trim() || `질문 ${index + 1}`,
          answer: block.match(/^A\.\s*([\s\S]+)$/m)?.[1]?.trim() || block,
          source: "관리자 검수",
        })),
      };
      savePublished([updated, ...loadPublished().filter((notice) => notice.id !== selectedId)]);
      window.__kangnamCurrentDraft = updated;
      renderPublishedList();
      const note = $("#published-note") || $("#approval-note");
      if (note) note.textContent = "수정 사항을 저장했습니다.";
    }, true);

    $("#delete-published-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const selectedId = window.__kangnamSelectedPublishedId;
      if (!selectedId || !can(getCurrentAccess().role, "editor")) return;
      if (!window.confirm("선택한 공고를 삭제할까요?")) return;
      savePublished(loadPublished().filter((notice) => notice.id !== selectedId));
      const deleted = loadDeleted();
      deleted.add(selectedId);
      saveDeleted(deleted);
      window.__kangnamSelectedPublishedId = "";
      window.__kangnamCurrentDraft = null;
      $("#draft-empty") && ($("#draft-empty").hidden = false);
      $("#draft-fields") && ($("#draft-fields").hidden = true);
      renderPublishedList();
    }, true);
  }

  function boot() {
    unlockAdminUi();
    renderMembers();
    renderPublishedList();
    bindMemberForm();
    bindPublishForm();
    bindApprovalActions();
    bindManageActions();
    updateApprovalButtons();
  }

  window.addEventListener("kangnam-firebase-ready", boot);
  window.addEventListener("kangnam-admin-config-ready", boot);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
  window.setTimeout(boot, 500);
  window.setTimeout(boot, 1500);
})();
