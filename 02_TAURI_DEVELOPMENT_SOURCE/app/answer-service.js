"use strict";

(function registerAnswerService(global) {
  const EMPTY_RESULT = Object.freeze({ status: "empty", answer: "", source: "" });
  const DEFAULT_ANSWER_ENDPOINT = "/api/askNotice";

  function getFact(notice, key) {
    return notice.facts?.[key] || "확인 필요";
  }

  function normalizeQuestion(value) {
    return value
      .toLocaleLowerCase("ko-KR")
      .replace(/[\s?!.,·~()[\]{}'"“”‘’_-]/g, "");
  }

  function buildAnswerRules(notice) {
    const period = getFact(notice, "period");
    const eligibility = getFact(notice, "eligibility");
    const field = getFact(notice, "field");
    const documents = getFact(notice, "documents");
    const operation = getFact(notice, "operation");
    const faqRules = (notice.faqs || []).map((faq) => ({
      keywords: faq.question.split(/[\s?.,·~()[\]{}'"“”‘’_-]+/).filter((word) => word.length >= 2),
      answer: faq.answer,
      source: faq.source,
    }));

    return [
      {
        keywords: ["편입생", "편입"],
        answer: eligibility.includes("편입생")
          ? "편입생은 지원할 수 있습니다. 공고의 다른 활동 조건도 함께 확인해 주세요."
          : eligibility,
        source: "지원 자격",
      },
      {
        keywords: ["휴학생", "휴학"],
        answer: "휴학생 지원 가능 여부는 공식 공고의 지원 자격과 문의처를 통해 추가로 확인해 주세요.",
        source: "지원 자격",
      },
      ...faqRules,
      {
        keywords: ["신청기간", "신청일", "기간", "언제", "마감", "일정"],
        answer: period,
        source: "핵심 정보 > 신청 기간",
      },
      {
        keywords: ["지원자격", "자격", "대상", "재학생", "편입생", "휴학생"],
        answer: eligibility,
        source: "핵심 정보 > 지원 대상",
      },
      {
        keywords: ["모집분야", "분야", "인원", "프로그램", "행사"],
        answer: field,
        source: "핵심 정보 > 모집 분야",
      },
      {
        keywords: ["제출서류", "서류", "지원서", "신청서"],
        answer: documents,
        source: "핵심 정보 > 제출 서류",
      },
      {
        keywords: ["운영기간", "활동기간", "운영", "활동"],
        answer: operation,
        source: "핵심 정보 > 운영 기간",
      },
      {
        keywords: ["문의처", "문의", "연락처", "전화", "담당부서"],
        answer: `담당 부서는 ${notice.department}입니다. 정확한 연락처는 공식 공고 원문에서 확인해 주세요.`,
        source: "공고 등록 부서 및 문의처",
      },
    ];
  }

  function getSourceImageUrls(notice) {
    return [...new Set([
      ...(Array.isArray(notice.imageUrls) ? notice.imageUrls : []),
      ...(Array.isArray(notice.images) ? notice.images : []),
      notice.sourceImageUrl || "",
      notice.imageUrl || "",
    ].filter(Boolean))];
  }

  function hasOfficialSourceUrl(notice) {
    try {
      const url = new URL(notice?.sourceUrl || "");
      return url.protocol === "https:" && url.hostname === "web.kangnam.ac.kr";
    } catch {
      return false;
    }
  }

  async function generateRuleAnswer(question, notice) {
    const normalized = normalizeQuestion(question);
    const answer = buildAnswerRules(notice).find((rule) =>
      rule.keywords.some((keyword) => normalized.includes(normalizeQuestion(keyword))),
    );

    if (!answer) return EMPTY_RESULT;
    return { status: "success", answer: answer.answer, source: answer.source };
  }

  async function generateGeminiAnswer(question, notice) {
    const endpoint = global.KANGNAM_PUBLIC_CONFIG?.answerEndpoint || DEFAULT_ANSWER_ENDPOINT;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        sourceUrl: notice.sourceUrl,
        imageUrls: getSourceImageUrls(notice),
        notice: {
          title: notice.title,
          department: notice.department,
          summary: notice.summary,
          facts: notice.facts,
        },
      }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || "Gemini 답변을 생성하지 못했습니다.");
    }

    return result;
  }

  async function generateAnswer(question, notice) {
    if (hasOfficialSourceUrl(notice)) {
      try {
        const result = await generateGeminiAnswer(question, notice);
        if (result?.status === "success" && result.answer) return result;
      } catch (error) {
        console.warn("Gemini answer failed, falling back to saved notice rules.", error);
      }
    }

    return generateRuleAnswer(question, notice);
  }

  global.KANGNAM_ANSWER_SERVICE = Object.freeze({
    generateAnswer,
    mockAnswerService: Object.freeze({ generateAnswer: generateRuleAnswer }),
  });
})(window);
