# 강남대 공고 길잡이

대학 공고의 FAQ와 질문 검색 경험을 검증하는 1-Day Tauri v2 프로토타입입니다. React 없이 정적 HTML, CSS, JavaScript로 구현했습니다.

공식 강남대학교 공고의 카드뉴스 이미지에 공개된 내용을 바탕으로 공고, FAQ, 답변 예시를 구성했습니다. 답변 아래에서 공식 원문과 이미지를 확인할 수 있습니다. 실제 AI·OCR이나 외부 API는 호출하지 않습니다.

Mac, Windows, 웹에서 같은 글꼴 파일을 사용하도록 Pretendard Variable 1.3.9를 앱 내부에 포함했습니다. 글꼴은 SIL Open Font License 1.1에 따라 재배포하며 라이선스 전문은 `app/assets/fonts/Pretendard-LICENSE.txt`에 있습니다.

## 구현 범위

- `입학처 공식 홍보대사 늘품 12기 2학기 수습 임원 모집` 공식 공고 기반 핵심 정보
- FAQ 3개 선택 및 예시 답변 표시
- 학생 질문 입력과 준비된 가상 예시 답변 연결
- 답변별 공고문 근거와 공식 원문·이미지 링크, 담당 부서 안내
- 빈 입력 및 검색 결과 없음 상태
- 다른 질문하기, 담당 부서 보기, 공고로 돌아가기 흐름
- 부서 피드백에서 검증할 가정과 질문
- 320px 이상 모바일 반응형 레이아웃과 키보드 포커스

FAQ 검색, 질문 자동완성, 실제 AI, PDF 업로드, RAG 검색, 관리자 FAQ 관리는 이번 P0 범위에 포함하지 않았습니다.

## 프로젝트 구조

```text
app/
  assets/fonts/        공통 Pretendard Variable 글꼴과 라이선스
  index.html          공고, FAQ, 질문, 답변, 부서 및 피드백 화면
  styles.css          디자인 토큰, 상태 및 모바일 반응형 스타일
  main.js             가상 FAQ·답변 데이터와 사용자 흐름
scripts/
  run-tauri.mjs       Windows/macOS Tauri 실행 래퍼
src-tauri/
  src/                Rust 진입점
  capabilities/       Tauri v2 기본 권한
  icons/              macOS/Windows/모바일 앱 아이콘
  tauri.conf.json     창, 빌드, 번들, CSP 설정
tests/
  preview-integration.mjs
```

## 실행 방법

Node.js, npm, Rust, Cargo가 필요합니다.

```bash
npm install
npm run preview
```

터미널에 표시되는 주소(기본 `http://127.0.0.1:5173`)를 브라우저에서 엽니다. 다른 포트를 사용하려면 다음과 같이 실행합니다.

```bash
npm run preview -- --port 4173
```

Tauri 개발 앱은 다음 명령으로 실행합니다.

```bash
npm run dev
```

## 검증 및 빌드

```bash
node --check app/main.js
npm run test:preview
npm run build
```

현재 별도 lint 스크립트는 없습니다. 통합 테스트는 FAQ 선택, 정상 질문, 빈 입력, 검색 실패, 다시 질문, 담당 부서 이동과 가상 예시 답변 표시를 확인합니다.

macOS 빌드 결과물은 일반적으로 아래에 생성됩니다.

```text
src-tauri/target/release/bundle/macos/Kangnam Notice Guide.app
src-tauri/target/release/bundle/dmg/Kangnam Notice Guide_1.0.0_aarch64.dmg
```

로컬 빌드는 별도 Apple 개발자 인증서 없이 실행 검증할 수 있도록 ad-hoc 서명됩니다. 다른 사용자에게 배포하면서 Gatekeeper 경고를 피하려면 Apple Developer ID 인증서와 공증 환경 변수를 별도로 구성해야 합니다.

선택된 전체 Xcode의 라이선스가 아직 동의되지 않았지만 Command Line Tools가 설치된 경우, 실행 래퍼가 데스크톱 빌드에 필요한 Command Line Tools를 해당 명령에서만 자동 사용합니다. Command Line Tools도 없거나 전체 Xcode를 직접 사용하려면 먼저 다음을 완료합니다.

```bash
sudo xcodebuild -license accept
```

Windows에서는 Microsoft C++ Build Tools, WebView2 Runtime, Rust MSVC toolchain이 필요합니다. 결과물은 일반적으로 `src-tauri/target/release/bundle/` 아래에 생성됩니다.

## 보안 메모

- 브라우저 코드에 API 키나 인증 정보를 저장하지 않습니다.
- 실제 AI·OCR 및 네트워크 요청을 사용하지 않습니다. 공식 공고 링크는 사용자가 선택할 때만 브라우저에서 열립니다.
- 모든 결과는 프론트엔드의 가상 JSON 데이터에서 결정적으로 선택됩니다.
- 사용자 입력은 `innerHTML`로 삽입하지 않고 `textContent`로 표시합니다.
- Tauri CSP는 로컬 자산과 IPC만 허용합니다.
