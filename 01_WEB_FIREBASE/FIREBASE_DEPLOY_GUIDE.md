# 강남대 공고 길잡이 배포 안내

이 프로젝트는 Firebase Hosting으로 정적 앱을 배포하고, 상세 공고 질문 답변만 Cloudflare Worker를 통해 Gemini API로 처리합니다.

Firebase는 계속 사용합니다. Cloudflare Worker는 브라우저에 Gemini API 키가 노출되지 않도록 중간 서버 역할만 합니다.

## 준비

1. Firebase CLI에 로그인합니다.
2. Cloudflare 계정에 로그인합니다.
3. `.env.local`에는 공개 설정만 둡니다.
4. Gemini API 키는 Cloudflare Worker Secret으로만 설정합니다.

```bash
npm install -g firebase-tools
firebase login
npm --prefix worker install
```

## Cloudflare Worker 배포

Gemini 답변 기능을 사용하려면 Worker Secret으로 `GEMINI_API_KEY`를 설정해야 합니다.

```bash
npm --prefix worker exec wrangler secret put GEMINI_API_KEY
npm run deploy:worker
```

배포 후 표시되는 Worker URL을 `.env.local`의 `ANSWER_API_ENDPOINT`에 넣고 웹 앱을 다시 빌드합니다.

```env
ANSWER_API_ENDPOINT=https://example.workers.dev
```

Google API 키가 HTTP referrer 제한만 걸린 브라우저용 키이면 Cloudflare Worker에서 차단될 수 있습니다. Worker Secret에 넣는 키는 서버 호출이 가능해야 하며, API 제한을 둘 경우 Generative Language API 호출이 허용되어야 합니다.

## Firebase Hosting 배포

```bash
npm run build
npm run deploy
```

Firebase Hosting은 Spark 무료 요금제로 유지할 수 있습니다. Firebase Functions는 사용하지 않습니다.

## 검증 명령

```bash
npm run build
npm run lint
```

데스크톱 앱 변경이 함께 있을 때는 `02_TAURI_DEVELOPMENT_SOURCE`에서 제공되는 검증 명령도 실행합니다.

```bash
npm run test:preview
npm run build
```

## 로컬 Codex CLI 답변 서버

Gemini 크레딧이나 외부 API 키 없이 내 컴퓨터의 Codex CLI로 질문하기를 테스트하려면 로컬 전용 서버를 실행합니다.

```bash
npm run dev:codex-answer
```

실행 후 `http://127.0.0.1:4174/notice.html?notice=neulpum-2026`에서 질문하기를 사용하면 같은 서버의 `/api/askNotice`가 Codex CLI를 호출합니다. 기본 설정은 `gpt-5.3-codex-spark`를 먼저 시도하고, 계정에서 지원되지 않으면 Codex CLI 기본 모델로 내려갑니다. 필요하면 실행 전에 `CODEX_ANSWER_MODELS` 환경 변수로 쉼표 구분 모델 목록을 지정할 수 있습니다.

이 서버는 `127.0.0.1`에서만 열리며 배포용 기능이 아닙니다. 공개 Firebase Hosting에서는 사용자의 로컬 Codex CLI에 접근할 수 없습니다.

## 주의사항

- Gemini API 키를 앱 코드, Firebase Hosting 파일, Git에 넣지 않습니다.
- `.env`, `.env.local`, `.dev.vars`는 커밋하지 않습니다.
- Worker는 `https://web.kangnam.ac.kr` 원문 공고 URL만 받습니다.
- 원문 텍스트는 Jina Reader 경로로 읽고, 저장된 원문 이미지 URL이 있으면 Gemini 요청에 함께 첨부합니다.
- Worker 또는 Gemini 호출이 실패하면 사용자 화면은 기존 저장 공고 기반 답변으로 내려갑니다.
- 로컬 Codex CLI 답변 서버는 개발과 시연 용도로만 사용합니다.
