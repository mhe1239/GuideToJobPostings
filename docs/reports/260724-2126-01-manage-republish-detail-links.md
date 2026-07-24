# 공고 재등록 및 상세 링크 분리 수정

## 배경

- `manage.html`에서 삭제한 공고를 `publish.html`에서 다시 공개할 때 삭제 상태와 처리 완료 판정이 충돌할 수 있었습니다.
- 새 초안 저장 시 기존 공고를 `id`뿐 아니라 `sourceUrl` 기준으로도 제거하여, 같은 원문 URL을 참고하는 공고들이 하나로 합쳐질 수 있었습니다.

## 변경 사항

- 학교 공고 가져오기 처리 완료 판정을 공고 `id` 기준으로만 수행하도록 수정했습니다.
- 공개 승인 저장 시 기존 공고 제거 기준을 `id`로 한정하여 같은 원문 URL을 가진 공고도 개별 ID와 내용을 유지하도록 했습니다.
- 삭제 후 같은 학교 공고를 다시 공개할 수 있는지, 같은 `sourceUrl`의 두 공고가 목록/상세에서 각각 유지되는지 통합 테스트를 추가했습니다.

## 검증

- `01_WEB_FIREBASE`: `npm run lint`, `npm test`, `npm run build`
- `02_TAURI_DEVELOPMENT_SOURCE`: `npm run test:preview`, `npm run build`
- `git diff --check`
- 민감정보 문자열 검색: 새 민감정보 없음
