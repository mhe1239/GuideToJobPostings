# 1) 폴더 아키텍처

이 저장소는 강남대학교 공고 안내 서비스를 웹 배포본과 Tauri 데스크톱 패키지로 함께 관리합니다.

## Top-level 구조

```text
.
├─ 01_WEB_FIREBASE
│  ├─ app
│  ├─ scripts
│  ├─ tests
│  ├─ worker
│  ├─ firebase.json
│  ├─ firestore.rules
│  └─ firestore.indexes.json
├─ 02_TAURI_DEVELOPMENT_SOURCE
│  ├─ app
│  ├─ scripts
│  ├─ tests
│  └─ src-tauri
├─ artifacts
├─ docs
│  ├─ 01-folder-architecture.md
│  ├─ 02-specs.md
│  ├─ 03-product-plan.md
│  ├─ reports
│  └─ todo
├─ AGENTS.md
├─ README.md
├─ README_FIRST_KO.md
└─ OFFICIAL_ASSET_SOURCE.md
```

## 주요 책임

### `01_WEB_FIREBASE`

Firebase Hosting에 배포되는 웹 앱입니다.

- `app/index.html`, `app/list.js`: 학생용 공고 목록과 맞춤 필터
- `app/notice.html`, `app/main.js`: 공고 상세, FAQ, 질문하기, 전체 공고 보기
- `app/admin.html`, `app/admin.js`: 관리자 공고 처리와 공개 관리
- `app/manage.html`, `app/members.html`: 관리자 운영 화면
- `app/firestore-store.js`: Firestore/D1 연동과 저장 데이터 정규화
- `app/answer-service.js`: 질문 답변 인터페이스와 로컬 fallback
- `app/styles.css`: 전역 스타일, 반응형, 접근성 상태
- `scripts/generate-firebase-config.mjs`: `.env.local` 기반 공개 Firebase 설정 생성
- `tests`: 보안, Firestore 제한, 학생 프로필 회귀 테스트
- `worker`: Cloudflare Worker/D1 기반 답변 및 공고 API

### `02_TAURI_DEVELOPMENT_SOURCE`

Windows/macOS 데스크톱 설치 파일을 만드는 Tauri v2 소스입니다.

- `app`: Tauri에 포함되는 정적 웹 화면
- `tests/preview-integration.mjs`: Happy DOM 기반 주요 화면 회귀 테스트
- `scripts/run-tauri.mjs`: Tauri 실행/빌드 래퍼
- `src-tauri`: Rust 진입점, 권한, CSP, 아이콘, 번들 설정

### `docs`

AI 에이전트와 개발자를 위한 운영 문서입니다.

- `01-folder-architecture.md`: 저장소 구조와 폴더 책임
- `02-specs.md`: 기술 스택, 보안, 검증, 배포 규칙
- `03-product-plan.md`: 제품 목표와 기능 범위
- `reports`: 완료 작업과 의사결정 기록
- `todo`: 후속 작업 목록과 상세 TODO

## 중복 앱 소스 관리

`01_WEB_FIREBASE/app`과 `02_TAURI_DEVELOPMENT_SOURCE/app`은 같은 사용자 경험을 제공해야 합니다.  
공통 화면이나 스크립트를 바꾸는 경우 일반적으로 두 위치를 함께 수정합니다.

예외가 필요한 경우 PR 설명에 이유를 남깁니다.

## 기존 문서와의 관계

- `README_FIRST_KO.md`: 저장소 패키지 안내
- `README.md`: 프로젝트 소개
- `01_WEB_FIREBASE/FIREBASE_DEPLOY_GUIDE.md`: Firebase 배포 안내
- `02_TAURI_DEVELOPMENT_SOURCE/BUILD_WINDOWS_MAC_KO.md`: 데스크톱 빌드 안내
- `OFFICIAL_ASSET_SOURCE.md`: 공식 로고/브랜드 자산 출처

위 문서는 유지하며, 운영 기준은 `AGENTS.md`와 `docs/`에서 요약 관리합니다.
