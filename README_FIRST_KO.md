# 강남대 공고 길잡이 전달 패키지

이 ZIP은 웹 배포와 Mac·Windows 설치앱 빌드에 필요한 파일을 구분해 제공합니다.

## 01_WEB_FIREBASE

Windows 또는 Mac에서 HTML, CSS, JavaScript를 수정하고 Firebase Hosting에 배포할 수 있는 파일입니다.

- `app/index.html`: 화면 구조
- `app/styles.css`: 공통 글꼴과 화면 디자인
- `app/main.js`: 가상 FAQ·답변과 사용자 흐름
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

처음 압축된 상태에서 두 폴더의 `app` 내용은 동일합니다. 이후 웹과 설치앱을 계속 동일하게 유지하려면 `02_TAURI_DEVELOPMENT_SOURCE/app`을 기준으로 수정하고, Firebase 배포 전에 변경된 `app` 폴더를 `01_WEB_FIREBASE/app`에도 동일하게 반영합니다.

글꼴은 CDN이나 운영체제 설치 글꼴에 의존하지 않고 패키지 내부의 동일한 WOFF2 파일을 사용합니다. 다만 macOS WebKit과 Windows WebView2의 픽셀 안티앨리어싱에는 운영체제별 미세한 차이가 있을 수 있습니다.

실제 AI, 외부 API, API 키, 로그인 정보, 실제 개인정보는 포함하지 않았습니다. 화면의 `031-000-0000`은 실제 연락처가 아닌 가상 번호입니다.

설치파일 빌드 결과는 빌드 시각, 운영체제, 서명 여부에 따라 파일 해시가 달라질 수 있지만 앱의 HTML·CSS·JavaScript와 포함 글꼴은 같은 소스를 사용합니다.

