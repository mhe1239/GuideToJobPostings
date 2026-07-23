# 강남대 공고 길잡이 웹 배포 안내

이 폴더는 `강남대 공고 길잡이` 공식 공고 기반 버전의 Firebase Hosting 배포용 파일입니다.

화면은 `app/` 폴더에 있고, 상세 공고 질문 답변은 `functions/`의 서버리스 함수가 Gemini API를 호출해 생성합니다. Gemini API 키는 클라이언트에 포함하지 않고 Firebase Functions 환경 변수로만 사용합니다.

## 준비

1. [Firebase Console](https://console.firebase.google.com/)에서 무료 Spark 플랜 프로젝트를 만듭니다.
2. Node.js와 npm이 설치된 컴퓨터에서 터미널을 엽니다.
3. 아래 명령으로 Firebase CLI를 설치하고 로그인합니다.

```bash
npm install -g firebase-tools
firebase login
```

## Firebase 프로젝트 연결

압축을 푼 이 폴더로 이동한 뒤 실행합니다.

```bash
firebase use --add
```

표시되는 목록에서 배포할 Firebase 프로젝트를 선택하고 별칭은 `default`로 입력합니다.

이 명령은 선택한 프로젝트 정보를 담은 `.firebaserc`를 현재 폴더에 생성합니다. 다른 사람의 `.firebaserc`는 전달받지 않아도 됩니다.

## 7일 검증 링크 배포

Gemini 답변 기능을 배포하려면 `.env.local` 또는 Firebase Functions 환경에 `GEMINI_API_KEY`를 설정해야 합니다. 선택적으로 `GEMINI_MODEL`을 지정할 수 있으며, 기본값은 `gemini-2.0-flash`입니다.

```bash
firebase hosting:channel:deploy fixed-review --expires 7d
```

완료 후 터미널에 표시되는 `https://...web.app` 주소를 검증자에게 전달합니다. Preview URL은 주소를 아는 누구나 접속할 수 있으므로 프로토타입 검증용으로만 사용합니다.

같은 링크를 최신 파일로 갱신할 때도 위 명령을 다시 실행합니다.

## 검증 링크 삭제

```bash
firebase hosting:channel:delete fixed-review
```

## 정식 주소 배포가 필요한 경우

검증 완료 후에만 실행합니다.

```bash
npm run deploy
```

## 주의사항

- `firebase init hosting`을 다시 실행할 필요가 없습니다.
- `app/index.html`을 덮어쓰면 안 됩니다.
- Public directory는 이미 `app`으로 설정되어 있습니다.
- Firebase SDK, Authentication, Functions를 사용합니다.
- Functions 배포 및 외부 Gemini API 호출에는 Firebase 프로젝트 설정과 요금제 조건을 확인해야 합니다.
- DMG는 Mac 설치용이며 이 웹 배포 ZIP에는 포함하지 않았습니다.
