# Agent Working Agreement

이 문서는 이 저장소에서 작업하는 AI 에이전트와 개발자가 공유하는 작업 합의서입니다.  
기반 템플릿: https://github.com/EunHyeokJung/austin-docs-architecture

`docs/`는 프로젝트 구조, 기술 기준, 제품 범위와 후속 작업을 관리하는 단일 기준 문서입니다. 코드와 문서가 어긋나면 관련 문서를 먼저 갱신한 뒤 구현합니다.

## 작업 전 읽기

기능 구현, 배포, PR, 구조 변경 작업 전에는 아래 문서를 먼저 확인합니다.

- `docs/01-folder-architecture.md`
- `docs/02-specs.md`
- `docs/03-product-plan.md`
- `docs/todo/00-todo-list.md`

단순 질문, 상태 확인, 짧은 명령 출력 요청은 필요한 문서만 읽고 처리해도 됩니다.

## 작업 시작 체크리스트

- 현재 브랜치와 작업 트리가 의도한 상태인지 확인합니다.
- 기존 기능과 데이터 흐름을 먼저 확인한 뒤 구현합니다.
- 웹 배포본(`01_WEB_FIREBASE/app`)과 Tauri 앱(`02_TAURI_DEVELOPMENT_SOURCE/app`)의 중복 소스가 필요한 경우 함께 동기화합니다.
- 새 UI는 기존 HTML/CSS/JavaScript 패턴과 `styles.css` 토큰을 우선 사용합니다.
- 새 라이브러리는 사용자가 명시적으로 승인하지 않는 한 추가하지 않습니다.
- 사용자 입력이나 원문 문자열은 `innerHTML`로 직접 삽입하지 않습니다.
- API 키, 개인정보, 관리자 토큰, `.env` 내용이 커밋되지 않도록 확인합니다.
- 현재 요청과 관련된 TODO가 있으면 상세 TODO 문서를 읽고, 기존 제약과 이번 반영 범위를 사용자에게 먼저 알립니다.

## 검증 규칙

존재하는 명령만 실행합니다.

- 웹: `npm run lint`, `npm test`, `npm run build` in `01_WEB_FIREBASE`
- Tauri/통합 미리보기: `npm run test:preview`, `npm run build` in `02_TAURI_DEVELOPMENT_SOURCE`
- Worker: `npm --prefix worker run lint`, 필요 시 `npm run deploy:worker`

답변 생성 기능은 운영 Worker가 실패해도 로컬 fallback이 동작할 수 있습니다. 이 예외는 사용자에게 명확히 보고하고, 그 외 상세 페이지/목록/로그인/관리자 화면 오류는 별도로 수정합니다.

## GitHub 작업 규칙

- 새 기능/수정은 별도 브랜치에서 작업합니다.
- 커밋 타입은 `feat`, `fix`, `refactor`, `docs`, `style`, `chore` 중 하나를 사용합니다.
- PR에는 작업 목표, 주요 변경 사항, 확인 방법, 검증 결과, 구현하지 않은 범위를 적습니다.
- 병합 전 변경 파일과 민감정보 포함 여부를 확인합니다.

## 문서 업데이트 규칙

- 폴더 구조, 기술 스펙, 제품 범위가 바뀌면 `docs/01`, `docs/02`, `docs/03`을 함께 갱신합니다.
- 중요한 완료 작업은 `docs/reports/`에 기록합니다.
- 새 후속 작업은 다음 작업부터 `docs/todo/`에 별도 문서로 남기고, `docs/todo/00-todo-list.md`에도 한 줄 요약을 추가합니다.
- TODO를 완료하면 해당 TODO 문서를 삭제하거나 완료 처리하고, `docs/reports/`에 결과를 남깁니다.
- 관련 TODO를 이번 작업에 함께 처리할지 불분명하면 사용자에게 범위를 확인하고, 분리 요청을 받으면 현재 요청만 처리합니다.
- 작업 기록 파일은 가능한 경우 `yymmdd-HHMM-NN-작업키워드.md` 형식을 사용합니다.

## 우선순위

1. 사용자의 최신 요청
2. 보안과 데이터 보호
3. 기존 기능 회귀 방지
4. 현재 문서(`docs/`)의 운영 기준
5. 기존 코드 스타일과 최소 변경 원칙
