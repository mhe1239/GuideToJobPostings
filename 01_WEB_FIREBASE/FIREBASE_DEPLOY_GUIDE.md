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

## 주의사항

- Gemini API 키를 앱 코드, Firebase Hosting 파일, Git에 넣지 않습니다.
- `.env`, `.env.local`, `.dev.vars`는 커밋하지 않습니다.
- Worker는 `https://web.kangnam.ac.kr` 원문 공고 URL만 받습니다.
- 원문 텍스트는 Jina Reader 경로로 읽고, 저장된 원문 이미지 URL이 있으면 Gemini 요청에 함께 첨부합니다.
- Worker 또는 Gemini 호출이 실패하면 사용자 화면은 기존 저장 공고 기반 답변으로 내려갑니다.
