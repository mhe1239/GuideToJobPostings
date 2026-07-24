# 강남대 공고 길잡이 배포 안내

이 프로젝트는 Firebase Hosting으로 정적 앱을 배포하고, Cloud Firestore에 검수 공고와 관리자 역할을 저장합니다. 상세 공고 질문 답변만 Cloudflare Worker를 통해 Gemini API로 처리합니다.

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

Firebase 콘솔에서 Cloud Firestore 데이터베이스를 Standard 모드로 하나만 생성합니다. Spark 무료 요금제를 유지하고 TTL, 백업, 복원, 추가 데이터베이스는 사용하지 않습니다.

첫 번째 관리자 로그인 전에 Firebase 콘솔의 Firestore에서 다음 문서를 직접 한 번 생성합니다. 실제 이메일은 저장소나 `.env.local`에 넣지 않고 콘솔에서만 입력합니다.

```text
컬렉션: admins
문서 ID: Google 로그인에 사용할 관리자 이메일
필드:
  email: 같은 관리자 이메일
  role: owner
  updatedAt: 현재 시각을 숫자로 입력
```

이 최초 문서가 없으면 모든 로그인 사용자는 학생 권한으로 처리됩니다. 이후 owner가 관리자 화면에서 editor 또는 owner를 추가할 수 있습니다.

```bash
npm run build
npm run deploy
```

`npm run deploy`는 Hosting과 Firestore 보안 규칙을 함께 배포합니다. Firebase Functions는 사용하지 않습니다.

## Spark 무료 한도 보호

Firestore 공식 무료 한도보다 낮은 앱 내부 보호 한도를 사용합니다.

| 항목 | Firestore 무료 한도 | 앱 차단 기준 |
| --- | ---: | ---: |
| 문서 읽기 | 50,000회/일 | 38,000회/일 |
| 문서 쓰기 | 20,000회/일 | 8,000회/일 |
| 문서 삭제 | 20,000회/일 | 8,000회/일 |

- 학생 공고 목록은 요청당 최대 20개만 읽습니다.
- 모든 Firestore 작업은 `systemUsage/{미국 태평양 날짜}` 문서에 사용 예정량을 먼저 예약합니다.
- 앱 차단 기준을 넘는 작업은 실제 조회·저장·삭제 전에 중단됩니다.
- 한도에 도달하면 학생에게 저장된 공고를 대신 보여주고, 관리자는 저장·삭제를 진행할 수 없습니다.
- 이 카운터는 앱에서 발생시키는 정상 요청을 위한 보수적 보호 장치입니다. Firebase 콘솔 작업이나 외부 스크립트 사용량까지 정확히 측정하는 결제 시스템은 아니므로 Firebase 콘솔의 Firestore Usage도 함께 확인합니다.
- Spark 요금제 자체가 무료 한도를 넘은 유료 사용을 허용하지 않는 마지막 안전장치입니다.

## 검증 명령

```bash
npm run build
npm run lint
npm test
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
