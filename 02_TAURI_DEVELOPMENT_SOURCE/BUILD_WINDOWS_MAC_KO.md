# Tauri 설치앱 빌드 안내

모든 명령은 `02_TAURI_DEVELOPMENT_SOURCE` 폴더에서 실행합니다.

## Windows

사전에 다음 항목을 설치합니다.

1. Node.js LTS
2. Rust MSVC 툴체인
3. Microsoft C++ Build Tools의 `Desktop development with C++`
4. Microsoft Edge WebView2 Runtime

PowerShell에서 실행합니다.

```powershell
npm ci
npm run test:preview
npm run build
```

정상적으로 완료되면 일반적으로 다음 위치에 설치파일이 생성됩니다.

```text
src-tauri\target\release\bundle\nsis\*-setup.exe
src-tauri\target\release\bundle\msi\*.msi
```

MSI 생성 과정에서 `light.exe` 오류가 발생하면 Windows 선택적 기능에서 VBSCRIPT가 활성화되어 있는지 확인합니다.

## macOS

Node.js LTS, Rust와 Xcode Command Line Tools가 필요합니다.

```bash
npm ci
npm run test:preview
npm run build
```

Apple Silicon Mac에서는 일반적으로 다음 결과가 생성됩니다.

```text
src-tauri/target/release/bundle/macos/Kangnam Notice Guide.app
src-tauri/target/release/bundle/dmg/Kangnam Notice Guide_1.0.0_aarch64.dmg
```

## 배포 서명

이 소스에는 Apple Developer ID나 Windows 코드 서명 인증서가 들어 있지 않습니다. 로컬 검증용 설치파일은 만들 수 있지만 다른 사람에게 배포할 때 macOS Gatekeeper 또는 Windows SmartScreen 경고가 표시될 수 있습니다. 정식 배포에서는 각 운영체제의 서명 인증서를 별도로 구성해야 합니다.

## 수정 후 확인

```bash
node --check app/main.js
npm run test:preview
npm run build
```

프로젝트에는 별도 lint 명령이 없습니다.

