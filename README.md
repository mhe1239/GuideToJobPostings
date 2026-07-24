# 강남대 공고 길잡이 전달 패키지

이 저장소는 웹 배포와 Mac·Windows 설치앱 빌드에 필요한 파일을 구분해 제공합니다.

## 01_WEB_FIREBASE

Windows 또는 Mac에서 HTML, CSS, JavaScript를 수정하고 Firebase Hosting에 배포할 수 있는 파일입니다.

- `app/index.html`: 화면 구조
- `app/styles.css`: 공통 글꼴과 화면 디자인
- `app/main.js`: 공식 공고 기반 FAQ·예시 답변과 사용자 흐름
- `app/answer-service.js`: 서버 AI 답변 요청과 저장 공고 기반 폴백
- `app/firestore-store.js`: Firestore 공용 공고·관리자 저장과 Spark 무료 한도 보호
- `firestore.rules`: 공개 공고 읽기와 관리자 쓰기 권한 규칙
- `app/assets/fonts`: Mac·Windows·웹 공통 Pretendard Variable 1.3.9와 OFL 라이선스
- `firebase.json`: Firebase Hosting 설정
- `FIREBASE_DEPLOY_GUIDE.md`: 배포 방법

## 02_TAURI_DEVELOPMENT_SOURCE

Mac DMG와 Windows MSI·NSIS 설치파일을 만들 수 있는 전체 Tauri v2 개발 소스입니다.

- `app`: 설치앱에 포함되는 웹 화면
- `src-tauri`: Rust 진입점, 창 설정, CSP, 권한, 아이콘, Cargo 잠금 파일
- `scripts`: Mac·Windows 공용 실행 래퍼
- `tests`: 자동 기능 검사
- `package.json`, `package-lock.json`: Node 의존성과 고정 버전
- `BUILD_WINDOWS_MAC_KO.md`: 운영체제별 준비 및 빌드 방법

## 수정할 때의 기준

현재 브랜치에서 두 폴더의 `app` 내용은 동일합니다. 이후 웹과 설치앱을 계속 동일하게 유지하려면 `02_TAURI_DEVELOPMENT_SOURCE/app`을 기준으로 수정하고, Firebase 배포 전에 변경된 `app` 폴더를 `01_WEB_FIREBASE/app`에도 동일하게 반영합니다.

글꼴은 CDN이나 운영체제 설치 글꼴에 의존하지 않고 패키지 내부의 동일한 WOFF2 파일을 사용합니다. 다만 macOS WebKit과 Windows WebView2의 픽셀 안티앨리어싱에는 운영체제별 미세한 차이가 있을 수 있습니다.

공식 공고 원문과 저장된 이미지 URL을 바탕으로 Cloudflare Worker가 Gemini 답변을 요청하며, 호출 실패 시 저장된 FAQ·규칙 답변으로 전환합니다. Gemini API 키는 브라우저나 저장소가 아닌 Worker Secret에만 보관합니다. 답변과 담당 부서 화면에서 강남대학교 공식 공고 원문·이미지 링크를 확인할 수 있습니다.

## 실제 AI 연결 준비

학생 질문 답변은 `app/answer-service.js`의 `generateAnswer(question, notice)` 인터페이스를 통해 동작합니다. 공식 강남대학교 공고 URL이면 Cloudflare Worker를 호출하고, 서버 답변을 사용할 수 없으면 `mockAnswerService`가 저장된 공고 데이터와 FAQ를 기반으로 답변합니다.

Firestore는 검수 공고와 관리자 역할을 여러 기기에서 공유합니다. Spark 무료 한도보다 낮은 앱 내부 일일 예산을 두고, 학생 목록은 요청당 최대 20개로 제한합니다. 설정과 최초 관리자 등록 방법은 `01_WEB_FIREBASE/FIREBASE_DEPLOY_GUIDE.md`를 따릅니다.

설치파일 빌드 결과는 빌드 시각, 운영체제, 서명 여부에 따라 파일 해시가 달라질 수 있지만 앱의 HTML·CSS·JavaScript와 포함 글꼴은 같은 소스를 사용합니다.
