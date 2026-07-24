# Gemini Worker notice answer

## Goal

- 상세 공고 화면의 질문하기가 Cloudflare Worker를 통해 Gemini API를 호출하도록 유지합니다.
- 답변 생성 시 공식 강남대학교 원문 URL의 텍스트와 원문 이미지 후보를 함께 근거로 사용합니다.

## Changes

- Worker가 Reader 텍스트뿐 아니라 공식 원문 HTML도 읽어 본문 텍스트를 보강합니다.
- 원문 HTML의 `img`, `data-src`, `srcset`, `og:image`에서 이미지 URL을 추출해 Gemini 멀티모달 입력에 포함합니다.
- 공식 강남대학교 URL만 허용하고, 리다이렉트가 외부 URL로 빠지는 경우 원문 또는 이미지를 사용하지 않습니다.
- Gemini 모델은 `GEMINI_MODEL` env 값을 우선 사용하고, 설정 모델이 맞지 않는 경우 기본 Flash 모델 후보로 재시도합니다.

## Security

- Gemini API 키는 Worker env secret `GEMINI_API_KEY`로만 읽고 클라이언트 번들에 포함하지 않습니다.
- 학생 화면은 `/api/askNotice`만 호출하며 Gemini API URL이나 키를 직접 노출하지 않습니다.
- 사용자가 입력한 질문과 원문 텍스트는 HTML로 직접 삽입하지 않습니다.

## Verification

- Web, Worker, Tauri 검증 명령과 배포 결과는 작업 완료 응답에 기록합니다.
