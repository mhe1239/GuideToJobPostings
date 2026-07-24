# 공식 원문 링크 오류 수정

## 배경

- 상세 공고의 공식 원문 링크가 `error.jsp`로 이동하는 문제가 확인되었습니다.
- 원인은 학교 공고 가져오기 샘플 데이터의 `encMenuBoardSeq` 값이 실제 게시글 키가 아닌 `schoolnotice01` 같은 내부 샘플 번호였기 때문입니다.

## 변경 사항

- 학교 공고 샘플 10건의 `sourceUrl`을 실제 학교 홈페이지 공고 상세 URL 형식으로 교체했습니다.
- 공고 저장, 목록, 상세 화면에서 `encMenuBoardSeq=schoolnoticeNN` 형식의 placeholder URL을 공식 출처로 인정하지 않도록 검증을 추가했습니다.
- 통합 미리보기 테스트에 학교 공고 샘플 URL 검증과 초안 공개 승인 후 출처 URL 회귀 검사를 추가했습니다.

## 검증

- `01_WEB_FIREBASE`: `npm run lint`, `npm test`, `npm run build`
- `02_TAURI_DEVELOPMENT_SOURCE`: `npm run test:preview`, `npm run build`
- `git diff --check`
- 민감정보 문자열 검색: 새 민감정보 없음
