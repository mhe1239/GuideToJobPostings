# 2) Specs

이 문서는 강남대 공고 안내 웹, Tauri 데스크톱 패키지, Firebase/Worker 배포의 기술 기준을 정의합니다.

## Runtime / Core

- 웹 앱: 정적 HTML, CSS, JavaScript
- 모듈 형식: JavaScript ESM
- 배포: Firebase Hosting, Firestore Rules/Indexes
- 데스크톱: Tauri v2, Rust, WebView2/macOS WebKit
- Worker: Cloudflare Workers, D1, Wrangler
- 테스트: Node test runner, Happy DOM 기반 미리보기 통합 테스트
- 글꼴: 로컬 Pretendard Variable WOFF2

## 주요 명령

### Web/Firebase

위치: `01_WEB_FIREBASE`

- `npm run lint`: 웹/Worker JavaScript 문법 검사
- `npm test`: Firestore, 보안, 학생 프로필 테스트
- `npm run build`: Firebase 공개 설정 생성
- `npm run deploy`: Firebase Hosting, Firestore Rules, Indexes 배포
- `npm run deploy:worker`: Cloudflare Worker 배포

### Tauri

위치: `02_TAURI_DEVELOPMENT_SOURCE`

- `npm run test:preview`: 주요 화면 DOM 회귀 테스트
- `npm run build`: Tauri 앱과 설치 번들 빌드
- `npm run preview`: 정적 앱 미리보기
- `npm run dev`: Tauri 개발 실행

## 데이터와 API

- 공고 기본 데이터는 웹/Tauri 앱의 JavaScript 상수와 mock JSON을 기반으로 합니다.
- 공개 공고는 Firestore와 Cloudflare D1 API를 통해 보강될 수 있습니다.
- 저장 공고는 공식 강남대학교 URL(`https://web.kangnam.ac.kr`)만 공식 원문 링크로 사용합니다.
- mock URL, common asset URL, 이미지 파일 URL은 공식 원문 링크로 표시하지 않습니다.
- 답변 생성은 `answer-service.js`의 `generateAnswer(question, notice)` 인터페이스를 통해 호출합니다.
- 운영 Worker가 실패하거나 연결되지 않아도 로컬 fallback 답변은 유지될 수 있습니다.

## UI 구현 규칙

- 새 UI 라이브러리는 추가하지 않습니다.
- 기존 HTML 구조와 `styles.css` 디자인 토큰을 우선 사용합니다.
- 모바일 360px, 태블릿, 데스크톱에서 가로 overflow가 없도록 확인합니다.
- 버튼은 명확한 텍스트와 44px 이상의 터치 영역을 갖춥니다.
- 토글/아코디언은 `aria-expanded`, `aria-controls`를 사용합니다.
- 이미지에는 대체 텍스트와 실패 상태를 제공합니다.
- 긴 URL과 공고 원문은 줄바꿈 가능하게 처리합니다.

## 보안 규칙

- 사용자 입력, 원문 문자열, 외부 데이터는 `innerHTML`로 직접 삽입하지 않습니다.
- `.env`, API 키, 개인정보, 관리자 이메일 목록, 토큰을 커밋하지 않습니다.
- Firebase 공개 설정은 `scripts/generate-firebase-config.mjs`로 생성합니다.
- 관리자 권한과 Firestore 쓰기는 rules/API guard를 통해 제한합니다.
- 외부 링크는 새 탭에서 열 때 `rel="noopener noreferrer"`를 사용합니다.

## 검증 기준

기능 변경 후 가능한 범위에서 아래를 확인합니다.

- `npm run lint` in `01_WEB_FIREBASE`
- `npm test` in `01_WEB_FIREBASE`
- `npm run test:preview` in `02_TAURI_DEVELOPMENT_SOURCE`
- `npm run build` in `01_WEB_FIREBASE`
- Tauri 관련 변경 시 `npm run build` in `02_TAURI_DEVELOPMENT_SOURCE`
- 배포 변경 시 Firebase 실제 URL 확인

Cloudflare Workers 빌드/운영 답변 API는 현재 로컬 fallback과 분리해서 보고합니다. Worker 오류가 있어도 웹 상세/목록/로그인/관리자 기능은 별도 회귀로 확인해야 합니다.

## Git 규칙

- 기능: `feat: ...`
- 버그 수정: `fix: ...`
- 문서: `docs: ...`
- 리팩토링: `refactor: ...`
- 스타일: `style: ...`
- 기타 작업: `chore: ...`

작업 브랜치는 목적이 드러나게 만듭니다. 예: `docs/apply-austin-docs-architecture`, `fix/notice-source-link`.
