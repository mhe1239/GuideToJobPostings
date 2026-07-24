# 학교 공고 실시간 가져오기 적용

## 작업 범위

- `publish.html`의 학교 홈페이지 공고 가져오기를 Worker API 기반 실시간 목록 조회로 전환했습니다.
- 강남대학교 공지 목록 HTML의 `detailLink` `data-params`에서 `encMenuSeq`, `encMenuBoardSeq`를 읽어 각 공고별 공식 상세 URL을 생성합니다.
- 실시간 조회 실패 또는 빈 응답 시 기존 `school-notices.mock.json` 10개 목록으로 자동 대체합니다.
- 웹 앱과 Tauri 앱의 중복 소스를 동기화했습니다.

## 검증

- `01_WEB_FIREBASE`: `npm run lint`, `npm test`, `npm run build`
- `02_TAURI_DEVELOPMENT_SOURCE`: `npm run test:preview`, `npm run build`
- Worker 문법 확인: `node --check 01_WEB_FIREBASE/worker/src/index.js`
- 민감정보 검색: 새 API 키, 개인정보, `.env` 노출 없음

## 참고

- Tauri build 중 기존 linker 경고 1건이 표시됐지만 빌드 산출물은 정상 생성됐습니다.
