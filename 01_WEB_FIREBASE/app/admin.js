"use strict";

const ROLE_LABELS = Object.freeze({
  owner: "관리자 관리, 수정 및 공개 가능",
  editor: "수정 및 공개 가능",
  viewer: "보기만 가능",
});

const READER_ENDPOINT = "https://r.jina.ai/http://r.jina.ai/http://";
const MAX_NOTICE_CHARS = 9000;
const PUBLISHED_NOTICES_KEY = "kangnamPublishedNotices";
const LEGACY_DEFAULT_NOTICE_URL =
  "https://web.kangnam.ac.kr/menu/board/info/e4058249224f49ab163131ce104214fb.do?encMenuSeq=1056addfbd6d939580620e461b59b641&encMenuBoardSeq=a7b3df1e7d8db98470571c15d25c72a9";

const NOTICE_SECTIONS = Object.freeze([
  { key: "period", label: "신청 기간", keywords: ["접수", "기간", "마감", "일정", "발표"] },
  { key: "eligibility", label: "지원 자격", keywords: ["지원자격", "지원 자격", "대상", "재학생", "편입생", "휴학생"] },
  { key: "field", label: "모집 분야", keywords: ["모집 분야", "모집분야", "모집 인원", "모집인원", "분야"] },
  { key: "method", label: "신청 방법", keywords: ["지원 방법", "신청 방법", "지원서", "신청서", "QR", "큐알"] },
  { key: "contact", label: "문의처", keywords: ["문의", "담당", "등록자", "부서", "연락"] },
]);

const adminPage = {
  authBadge: document.querySelector("#admin-auth-badge") || document.querySelector("#review-status"),
  authState: document.querySelector("#admin-auth-state"),
  logoutButton: document.querySelector("#admin-logout-button"),
  restrictedAreas: [...document.querySelectorAll("[data-requires-admin]")],
  memberList: document.querySelector("#member-list"),
  memberForm: document.querySelector("#member-form"),
  memberEmail: document.querySelector("#member-email"),
  memberRole: document.querySelector("#member-role"),
  form: document.querySelector("#admin-ingest-form"),
  urlInput: document.querySelector("#official-notice-url"),
  generateButton: document.querySelector("#generate-draft-button"),
  chip: document.querySelector("#draft-chip"),
  empty: document.querySelector("#draft-empty"),
  fields: document.querySelector("#draft-fields"),
  summary: document.querySelector("#draft-summary"),
  faq: document.querySelector("#draft-faq"),
  evidence: document.querySelector("#draft-evidence"),
  checkboxes: [...document.querySelectorAll(".approval-checkbox")],
  approveButton: document.querySelector("#approve-draft-button"),
  note: document.querySelector("#approval-note"),
  publishedList: document.querySelector("#published-list"),
  publishedCountChip: document.querySelector("#published-count-chip"),
  publishedNote: document.querySelector("#published-note"),
  savePublishedButton: document.querySelector("#save-published-button"),
  deletePublishedButton: document.querySelector("#delete-published-button"),
};

let currentUser = null;
let currentRole = "viewer";
let managedMembers = loadManagedMembers();
let generatedDraftUrl = "";
let currentDraftNotice = null;
let selectedPublishedId = "";

function loadManagedMembers() {
  try {
    return JSON.parse(window.localStorage.getItem("kangnamManagedMembers") || "[]");
  } catch {
    return [];
  }
}

function saveManagedMembers() {
  window.localStorage.setItem("kangnamManagedMembers", JSON.stringify(managedMembers));
}

function renderAuthState() {
  if (adminPage.authBadge) {
    adminPage.authBadge.textContent = ROLE_LABELS[currentRole];
    adminPage.authBadge.dataset.state = currentRole === "owner" ? "approved" : "review";
  }

  const title = adminPage.authState?.querySelector("strong");
  const subtitle = adminPage.authState?.querySelector("span");
  if (title && subtitle) {
    if (!currentUser) {
      title.textContent = "로그아웃 상태";
      subtitle.textContent = "기본 권한은 학생 보기입니다. Google 로그인 후 관리자 작업을 사용할 수 있습니다.";
    } else {
      title.textContent = `${currentUser.email} · ${ROLE_LABELS.owner}`;
      subtitle.textContent = "관리자 관리, AI 초안 수정, 학생 페이지 공개가 가능합니다.";
    }
  }

  if (adminPage.logoutButton) adminPage.logoutButton.disabled = !currentUser;
}

function updateAccess() {
  const allowed = currentRole === "owner";
  adminPage.restrictedAreas.forEach((area) => {
    area.classList.toggle("locked", !allowed);
    area.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !allowed;
    });
  });
  renderAuthState();
  renderMembers();
  renderPublishedNotices();
  updateApprovalState();
}

function renderMembers() {
  if (!adminPage.memberList) return;
  const members = [
    ...(currentUser ? [{ email: currentUser.email, role: "owner", source: "Google 로그인" }] : []),
    ...managedMembers,
  ];

  if (members.length === 0) {
    adminPage.memberList.innerHTML = "<p class=\"member-empty\">로그인한 관리자 계정이 없습니다.</p>";
    return;
  }

  adminPage.memberList.replaceChildren(
    ...members.map((member) => {
      const row = document.createElement("div");
      const email = document.createElement("strong");
      const role = document.createElement("span");
      const source = document.createElement("small");
      email.textContent = member.email;
      role.textContent = ROLE_LABELS[member.role] || ROLE_LABELS.viewer;
      source.textContent = member.source || "브라우저 저장";
      row.append(email, role, source);
      return row;
    }),
  );
}

function updateApprovalState() {
  if (!adminPage.approveButton) return;
  const ready = adminPage.fields && !adminPage.fields.hidden;
  const checked = adminPage.checkboxes.every((checkbox) => checkbox.checked);
  adminPage.approveButton.disabled = !(currentRole === "owner" && ready && checked);

  const canManagePublished = currentRole === "owner" && Boolean(selectedPublishedId);
  if (adminPage.savePublishedButton) adminPage.savePublishedButton.disabled = !canManagePublished;
  if (adminPage.deletePublishedButton) adminPage.deletePublishedButton.disabled = !canManagePublished;
}

function resetDraftForUrlChange() {
  if (!adminPage.urlInput || adminPage.urlInput.value.trim() === generatedDraftUrl) return;

  generatedDraftUrl = "";
  if (adminPage.fields) adminPage.fields.hidden = true;
  if (adminPage.empty) adminPage.empty.hidden = false;
  if (adminPage.summary) adminPage.summary.value = "";
  if (adminPage.faq) adminPage.faq.value = "";
  if (adminPage.evidence) adminPage.evidence.value = "";
  if (adminPage.chip) adminPage.chip.textContent = "미생성";
  if (adminPage.note) adminPage.note.textContent = "새 URL이 입력되었습니다. 초안을 다시 생성해 주세요.";
  adminPage.checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateApprovalState();
}

function clearLegacyDefaultNoticeUrl() {
  if (!adminPage.urlInput) return;
  const value = adminPage.urlInput.value.trim();
  const defaultValue = adminPage.urlInput.defaultValue.trim();

  if (value === LEGACY_DEFAULT_NOTICE_URL || defaultValue === LEGACY_DEFAULT_NOTICE_URL) {
    adminPage.urlInput.value = "";
    adminPage.urlInput.defaultValue = "";
    adminPage.urlInput.removeAttribute("value");
    adminPage.urlInput.placeholder = "https://web.kangnam.ac.kr/...";
    resetDraftForUrlChange();
  }
}

function handleMemberSubmit(event) {
  event.preventDefault();
  if (currentRole !== "owner") return;

  const email = adminPage.memberEmail.value.trim().toLowerCase();
  if (!email) return;

  managedMembers = managedMembers.filter((member) => member.email !== email);
  managedMembers.push({ email, role: adminPage.memberRole.value });
  saveManagedMembers();
  adminPage.memberEmail.value = "";
  renderMembers();
}

function buildReaderUrl(url) {
  return `${READER_ENDPOINT}${url}`;
}

function cleanReaderText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeMarkdownLinks(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function getNoticeTitle(markdown, url) {
  const title = markdown.match(/^Title:\s*(.+)$/m)?.[1]?.trim();
  if (title) return title;

  const heading = markdown.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim();
  if (heading) return removeMarkdownLinks(heading);

  try {
    return new URL(url).hostname;
  } catch {
    return "공식 공고";
  }
}

function toNoticeLines(markdown) {
  const noisy = [
    "사이트맵",
    "전체메뉴",
    "메뉴닫기",
    "메뉴 열기",
    "통합검색",
    "개인정보처리방침",
    "Copyright",
    "관련기관",
    "SNS",
    "LOGIN",
  ];

  return cleanReaderText(markdown)
    .split("\n")
    .map((line) => removeMarkdownLinks(line).replace(/^[*#>\-\d. ]+/, "").trim())
    .filter((line) => line.length >= 2)
    .filter((line) => !noisy.some((word) => line.includes(word)))
    .slice(0, 240);
}

function extractImageSources(markdown) {
  const imageUrls = [];
  const imagePattern = /!\[[^\]]*]\((https?:\/\/[^)\s]+)[^)]*\)/g;
  const filePattern = /\[([^\]]+\.(?:png|jpe?g|webp|gif|pdf))]\((https?:\/\/[^)]+)\)/gi;
  let match = imagePattern.exec(markdown);

  while (match) {
    imageUrls.push(match[1]);
    match = imagePattern.exec(markdown);
  }

  match = filePattern.exec(markdown);
  while (match) {
    imageUrls.push(match[2]);
    match = filePattern.exec(markdown);
  }

  return [...new Set(imageUrls)]
    .filter((url) => !/blogger|youtube|flickr|logo|common\/.*images/i.test(url))
    .slice(0, 4);
}

function findSection(lines, keywords) {
  const index = lines.findIndex((line) => keywords.some((keyword) => line.toLocaleLowerCase("ko-KR").includes(keyword.toLocaleLowerCase("ko-KR"))));
  if (index === -1) return "";

  return lines
    .slice(index, index + 5)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .slice(0, 260);
}

function analyzeNotice(markdown, sourceUrl) {
  const title = getNoticeTitle(markdown, sourceUrl);
  const lines = toNoticeLines(markdown);
  const sections = NOTICE_SECTIONS.map((section) => ({
    ...section,
    text: findSection(lines, section.keywords),
  }));
  const images = extractImageSources(markdown);
  const bodyPreview = lines.join("\n").slice(0, MAX_NOTICE_CHARS);

  return { title, lines, sections, images, bodyPreview, sourceUrl };
}

function fallbackText(label, text) {
  return text || `${label}은 공식 공고 원문에서 관리자 확인이 필요합니다.`;
}

function createDraftFromNotice(notice) {
  const period = notice.sections.find((section) => section.key === "period")?.text;
  const eligibility = notice.sections.find((section) => section.key === "eligibility")?.text;
  const field = notice.sections.find((section) => section.key === "field")?.text;
  const method = notice.sections.find((section) => section.key === "method")?.text;
  const contact = notice.sections.find((section) => section.key === "contact")?.text;
  const imageNote = notice.images.length > 0
    ? `이미지 공고 ${notice.images.length}개가 감지되어 Reader 추출 텍스트와 이미지 원문을 함께 검수해야 합니다.`
    : "이미지 공고 후보는 감지되지 않았습니다.";

  return {
    notice,
    summary:
      `${notice.title} 공고입니다.\n` +
      `- 핵심 일정: ${fallbackText("신청 기간", period)}\n` +
      `- 대상/자격: ${fallbackText("지원 자격", eligibility)}\n` +
      `- 신청/지원: ${fallbackText("신청 방법", method)}\n` +
      `- 검수 메모: ${imageNote}`,
    faq:
      `Q. 신청 기간은 언제인가요?\nA. ${fallbackText("신청 기간", period)}\n\n` +
      `Q. 누가 신청할 수 있나요?\nA. ${fallbackText("지원 자격", eligibility)}\n\n` +
      `Q. 모집 분야 또는 인원은 어떻게 되나요?\nA. ${fallbackText("모집 분야", field)}\n\n` +
      `Q. 신청 방법은 무엇인가요?\nA. ${fallbackText("신청 방법", method)}\n\n` +
      `Q. 문의는 어디로 하나요?\nA. ${fallbackText("문의처", contact)}`,
    evidence:
      `출처 URL: ${notice.sourceUrl}\n` +
      notice.sections
        .map((section) => `근거. ${section.label}: ${fallbackText(section.label, section.text)}`)
        .join("\n") +
      (notice.images.length > 0 ? `\n이미지/첨부 후보:\n${notice.images.map((url) => `- ${url}`).join("\n")}` : "") +
      `\n\n원문 추출 일부:\n${notice.bodyPreview.slice(0, 1200)}`,
  };
}

function createNoticeId(title, sourceUrl) {
  const slug = `${title}-${sourceUrl}`
    .toLocaleLowerCase("ko-KR")
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `published-${slug || Date.now()}`;
}

function parseFaqDraft(text) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const faqs = blocks.map((block, index) => {
    const question = block.match(/^Q\.\s*(.+)$/m)?.[1]?.trim() || `질문 ${index + 1}`;
    const answer = block.match(/^A\.\s*([\s\S]+)$/m)?.[1]?.trim() || "관리자 검수 후 답변을 입력해 주세요.";
    return {
      id: `published-faq-${index + 1}`,
      question,
      answer,
      source: "관리자 검수 초안",
    };
  });

  return faqs.length > 0 ? faqs : [
    {
      id: "published-faq-1",
      question: "공고 내용을 어디서 확인하나요?",
      answer: "공식 공고 원문과 관리자 검수 초안을 함께 확인해 주세요.",
      source: "관리자 검수 초안",
    },
  ];
}

function extractFactFromSummary(summary, label, fallback) {
  const match = summary.match(new RegExp(`- ${label}:\\s*(.+)`));
  return match?.[1]?.trim() || fallback;
}

function loadPublishedNotices() {
  try {
    return JSON.parse(window.localStorage.getItem(PUBLISHED_NOTICES_KEY) || "[]");
  } catch {
    return [];
  }
}

function buildPublishedNotice(baseNotice) {
  if (!baseNotice) return null;
  const summary = adminPage.summary.value.trim();
  const faq = adminPage.faq.value.trim();
  const sourceUrl = baseNotice.sourceUrl;
  const title = baseNotice.title;

  return {
    id: baseNotice.id || createNoticeId(title, sourceUrl),
    title,
    category: baseNotice.category || "대학생활",
    department: extractFactFromSummary(adminPage.evidence.value, "문의처", baseNotice.sections?.find((section) => section.key === "contact")?.text || baseNotice.department || "담당 부서 확인 필요"),
    date: baseNotice.date || new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, ""),
    status: baseNotice.status || "공개됨",
    sourcePrefix: "관리자 검수 공고",
    sourceUrl,
    summary: summary || `${title} 공고입니다. 공식 원문과 관리자 검수 내용을 함께 확인해 주세요.`,
    facts: {
      period: extractFactFromSummary(summary, "핵심 일정", "공식 공고 원문 확인"),
      eligibility: extractFactFromSummary(summary, "대상/자격", "공식 공고 원문 확인"),
      field: extractFactFromSummary(summary, "신청/지원", "공식 공고 원문 확인"),
    },
    faqs: parseFaqDraft(faq),
    isPublished: true,
    publishedAt: baseNotice.publishedAt || Date.now(),
    updatedAt: Date.now(),
  };
}

function savePublishedNotice() {
  const publishedNotice = buildPublishedNotice(currentDraftNotice);
  if (!publishedNotice) return;

  const notices = loadPublishedNotices().filter((notice) => notice.id !== publishedNotice.id && notice.sourceUrl !== publishedNotice.sourceUrl);
  notices.unshift(publishedNotice);
  window.localStorage.setItem(PUBLISHED_NOTICES_KEY, JSON.stringify(notices.slice(0, 20)));
  selectedPublishedId = publishedNotice.id;
  renderPublishedNotices();
}

function renderPublishedNotices() {
  if (!adminPage.publishedList) return;
  const notices = loadPublishedNotices();

  adminPage.publishedCountChip.textContent = `${notices.length}개`;
  if (notices.length === 0) {
    adminPage.publishedList.innerHTML = "<p class=\"member-empty\">아직 공개된 공고가 없습니다.</p>";
    selectedPublishedId = "";
    return;
  }

  adminPage.publishedList.replaceChildren(
    ...notices.map((notice) => {
      const button = document.createElement("button");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      button.type = "button";
      button.className = "published-item";
      button.dataset.noticeId = notice.id;
      if (notice.id === selectedPublishedId) button.setAttribute("aria-current", "true");
      title.textContent = notice.title;
      meta.textContent = `${notice.department} · ${notice.date}`;
      button.append(title, meta);
      button.addEventListener("click", () => selectPublishedNotice(notice.id));
      return button;
    }),
  );
}

function formatFaqDraft(faqs) {
  return faqs.map((faq) => `Q. ${faq.question}\nA. ${faq.answer}`).join("\n\n");
}

function selectPublishedNotice(noticeId) {
  const notice = loadPublishedNotices().find((item) => item.id === noticeId);
  if (!notice || currentRole !== "owner") return;

  selectedPublishedId = notice.id;
  currentDraftNotice = notice;
  generatedDraftUrl = notice.sourceUrl;
  adminPage.urlInput.value = notice.sourceUrl;
  adminPage.empty.hidden = true;
  adminPage.fields.hidden = false;
  adminPage.summary.value = notice.summary;
  adminPage.faq.value = formatFaqDraft(notice.faqs || []);
  adminPage.evidence.value = `출처 URL: ${notice.sourceUrl}\n근거. 신청 기간: ${notice.facts?.period || "공식 공고 원문 확인"}\n근거. 지원 자격: ${notice.facts?.eligibility || "공식 공고 원문 확인"}\n근거. 신청/지원: ${notice.facts?.field || "공식 공고 원문 확인"}`;
  adminPage.chip.textContent = "수정 중";
  adminPage.note.textContent = "공개된 공고를 불러왔습니다. 수정 후 저장하거나 삭제할 수 있습니다.";
  adminPage.checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });
  renderPublishedNotices();
}

function handlePublishedSave() {
  if (currentRole !== "owner" || !selectedPublishedId || !currentDraftNotice) return;
  const updatedNotice = buildPublishedNotice(currentDraftNotice);
  if (!updatedNotice) return;

  const notices = loadPublishedNotices().map((notice) => (notice.id === selectedPublishedId ? updatedNotice : notice));
  window.localStorage.setItem(PUBLISHED_NOTICES_KEY, JSON.stringify(notices));
  adminPage.note.textContent = "공개된 공고 수정 사항을 저장했습니다.";
  adminPage.chip.textContent = "수정 저장됨";
  renderPublishedNotices();
}

function handlePublishedDelete() {
  if (currentRole !== "owner" || !selectedPublishedId) return;
  const notices = loadPublishedNotices().filter((notice) => notice.id !== selectedPublishedId);
  window.localStorage.setItem(PUBLISHED_NOTICES_KEY, JSON.stringify(notices));
  selectedPublishedId = "";
  currentDraftNotice = null;
  generatedDraftUrl = "";
  adminPage.urlInput.value = "";
  adminPage.empty.hidden = false;
  adminPage.fields.hidden = true;
  adminPage.summary.value = "";
  adminPage.faq.value = "";
  adminPage.evidence.value = "";
  adminPage.chip.textContent = "미생성";
  adminPage.note.textContent = "공개된 공고를 삭제했습니다.";
  adminPage.checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  renderPublishedNotices();
}

async function fetchNoticeMarkdown(url) {
  const response = await fetch(buildReaderUrl(url), {
    headers: { Accept: "text/plain" },
  });

  if (!response.ok) {
    throw new Error(`공식 링크를 읽지 못했습니다. HTTP ${response.status}`);
  }

  return response.text();
}

async function handleDraftGeneration(event) {
  event.preventDefault();
  if (currentRole !== "owner") return;

  adminPage.chip.textContent = "생성 중";
  adminPage.generateButton.disabled = true;
  adminPage.note.textContent = "공식 링크의 텍스트와 이미지 공고 후보를 수집하고 있습니다.";

  try {
    const sourceUrl = new URL(adminPage.urlInput?.value.trim()).toString();
    adminPage.urlInput.value = sourceUrl;

    const markdown = await fetchNoticeMarkdown(sourceUrl);
    const notice = analyzeNotice(markdown, sourceUrl);
    const draft = createDraftFromNotice(notice);
    currentDraftNotice = notice;

    adminPage.empty.hidden = true;
    adminPage.fields.hidden = false;
    adminPage.summary.value = draft.summary;
    adminPage.faq.value = draft.faq;
    adminPage.evidence.value = draft.evidence;
    adminPage.chip.textContent = "검수 필요";
    generatedDraftUrl = sourceUrl;
    adminPage.note.textContent = `${notice.title} 기준으로 생성했습니다. 이미지 공고가 포함된 경우 원문 이미지와 함께 검수해 주세요.`;
    updateApprovalState();
  } catch (error) {
    adminPage.chip.textContent = "생성 실패";
    adminPage.note.textContent = `${error.message} Firebase Functions 없이 Hosting만 쓰는 현재 배포에서는 일부 링크가 브라우저 보안 정책에 막힐 수 있습니다.`;
  } finally {
    adminPage.generateButton.disabled = false;
  }
}

function handleDraftApproval() {
  if (currentRole !== "owner") return;
  savePublishedNotice();
  adminPage.chip.textContent = "공개됨";
  adminPage.note.textContent = "승인된 초안이 학생 페이지 목록에 공개되었습니다. 학생 페이지에서 선택해 확인할 수 있습니다.";
  adminPage.approveButton.disabled = true;
  adminPage.approveButton.textContent = "공개 완료";
}

async function handleLogout() {
  const firebase = window.KANGNAM_FIREBASE;
  if (firebase) await firebase.signOut();
}

function initAuth() {
  const firebase = window.KANGNAM_FIREBASE;
  if (!firebase) {
    updateAccess();
    return;
  }

  firebase.onAuthStateChanged(firebase.auth, (user) => {
    currentUser = user;
    currentRole = user ? "owner" : "viewer";
    updateAccess();
  });
}

adminPage.logoutButton?.addEventListener("click", handleLogout);
adminPage.memberForm?.addEventListener("submit", handleMemberSubmit);
adminPage.form?.addEventListener("submit", handleDraftGeneration);
adminPage.urlInput?.addEventListener("input", resetDraftForUrlChange);
adminPage.savePublishedButton?.addEventListener("click", handlePublishedSave);
adminPage.deletePublishedButton?.addEventListener("click", handlePublishedDelete);
clearLegacyDefaultNoticeUrl();
adminPage.checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateApprovalState));
adminPage.approveButton?.addEventListener("click", handleDraftApproval);
window.addEventListener("kangnam-firebase-ready", initAuth, { once: true });
initAuth();
