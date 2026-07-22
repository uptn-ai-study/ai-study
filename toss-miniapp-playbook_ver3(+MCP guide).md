# 토스 미니앱 출시 플레이북 (v2 + Console MCP)

> Vercel에 배포된 웹뷰 기반 프로젝트를 토스 미니앱으로 출시하는 팀원들을 위한 실전 체크리스트입니다.
> 기존 플레이북에 **Claude Code + Apps in Toss Console MCP** 사용법을 추가한 통합본입니다.

---

## 0. 전체 흐름 한눈에 보기

```text
① 콘솔 앱 등록 → ② SDK 연동 (granite.config.ts) → ③ 샌드박스 테스트
→ ④ 빌드 (.ait 생성) → ⑤ 토스앱 테스트 (QR)
→ ⑥ 검토 요청 → ⑦ 출시
```

전체 과정은 보통 영업일 기준 3~5일 정도 걸려요.
(콘솔 앱 등록 승인 1~2일 + 검토 요청 1~2일 포함)

시간이 걸리는 단계이니 미루지 말고 가장 먼저 ①번부터 신청해 주세요.

---

## 0-1. Toss Mini App Development Rules

토스 미니앱은 일반 웹 프로젝트와 개발 환경이 조금 다릅니다.
아래 규칙을 기본으로 개발해 주세요.

### Platform

* Mobile First
* Toss Mini App WebView 환경 기준
* iOS 우선 대응

### UI / UX

* 화면 기준 너비: 390px
* Safe Area 대응 필수
* 터치 영역 최소 44px 이상 권장
* 로딩 상태 / 빈 상태 / 에러 상태 고려

### Navigation

* 탭 사용 시 토스 제공 컴포넌트 사용 권장
* 자체 플로팅 탭바 구현 지양

### Performance

* 최종 번들 크기 100MB 이하
* 이미지 최적화 권장

### Deployment

* HTTPS 환경 필수
* Vercel 배포 기준

---

## 0-2. Claude Prompt Template

새 프로젝트를 시작할 때 아래 템플릿을 Claude Code에 전달하면 좋아요.

```text
이 프로젝트는 토스 미니앱입니다.

기술스택
- Vue3
- Typescript
- Vite

개발 환경
- Mobile First
- Toss Mini App WebView
- Safe Area 대응

요구사항
- Toss Mini App Ready 코드 작성
- 반응형 모바일 UI
- 재사용 가능한 컴포넌트 구조
- Typescript 타입 정의 필수

산출물
- 바로 Github Push 및 Vercel 배포 가능한 프로젝트 구조

아래 PRD를 기반으로 구현해 주세요.

[PRD 붙여넣기]
```

---

## 1. 콘솔 앱 등록 체크리스트

* [ ] 앱인토스 콘솔에서 워크스페이스 생성 완료
* [ ] 콘솔에 앱 등록 신청 (appName, 앱 이름, 아이콘, 브랜드 컬러 입력)
* [ ] 앱 등록에 입력한 정보를 그대로 메모해두기

  * 앱 이름
  * appName
  * 컬러 코드
  * 아이콘 파일
* [ ] 승인 완료 확인 (보통 영업일 1~2일 소요)

---

## 2. 기존 웹 프로젝트(Vercel 배포본) SDK 연동 체크리스트

이미 Vercel에 배포된 웹 프로젝트가 있다는 전제로 진행해요.

### [스터디 권장사항] 프로젝트 구조 가이드

우리 스터디는 각자 본인 레포지토리 안에서 프로토타입을 폴더 단위로 관리하고 있어요.

예시

```text
uptn-ai-study/alice/
├── proto-01-crypto/
├── proto-02-dashboard/
└── toss-miniapp-booknook/
```

토스 미니앱도 동일하게 **본인 레포에 새 폴더를 생성**하여 작업하면 됩니다.

### 권장 작업 방식

* [ ] 본인 레포에 토스 미니앱 전용 폴더 생성
* [ ] 해당 폴더 안에서 SDK 연동 및 개발 진행

폴더명 예시

```text
toss-miniapp-booknook
toss-miniapp-cryptowell
```

### Vercel 배포 시 주의사항

* [ ] Vercel 프로젝트 생성 시 Root Directory를 미니앱 폴더로 지정
* [ ] 기존 프로젝트 배포에 영향이 없는지 확인
* [ ] Preview URL에서 정상 동작 확인

예시

```text
Root Directory

toss-miniapp-booknook
```

### SDK 파일 체크리스트

* [ ] SDK 설치

```bash
npm install @apps-in-toss/web-framework
npx ait init
```

* [ ] granite.config.ts 파일 생성 확인

* [ ] appName을 콘솔 등록 값과 동일하게 입력

* [ ] brand.displayName을 콘솔 등록 앱 이름과 동일하게 입력

* [ ] brand.primaryColor를 콘솔 등록 컬러와 동일하게 입력

* [ ] brand.icon을 콘솔 업로드 이미지 URL과 동일하게 입력

* [ ] TDS 설치 여부 결정 후 필요 시 설치

```bash
npm install @toss/tds-mobile @toss/tds-mobile-ait @emotion/react@^11 react@^18 react-dom@^18
```

* [ ] CORS Origin 허용

```text
https://<appName>.apps.tossmini.com
https://<appName>.private-apps.tossmini.com
```

* [ ] API 서버 HTTPS 확인
* [ ] 쿠키 로그인 사용 시 토큰 기반 인증 전환

---

## 3. 샌드박스 테스트 체크리스트

* [ ] npm run dev 실행
* [ ] 샌드박스 앱 정상 노출 확인
* [ ] 실기기 테스트 시 --host 활성화
* [ ] web.host를 접근 가능한 IP로 변경
* [ ] 로그인 / 화면 이동 / API 통신 확인
* [ ] 콘솔 에러 확인

Android

```text
chrome://inspect
```

iOS

```text
Safari 개발자 도구
```

---

## 4. 빌드 & 토스앱 테스트 체크리스트

* [ ] npm run build 실행
* [ ] .ait 파일 생성 확인
* [ ] 번들 용량 100MB 이하 확인
* [ ] 앱 출시 메뉴에서 .ait 업로드
* [ ] QR 코드 테스트 진행

조건

* 토스앱 로그인 상태
* 워크스페이스 멤버
* 만 19세 이상

* [ ] 최소 1회 이상 테스트 완료

---

## 5. 검토 요청 전 최종 체크리스트

* [ ] 콘솔 앱 이름 = granite.config.ts brand.displayName

* [ ] 콘솔 아이콘 = granite.config.ts brand.icon

* [ ] 로고 600x600 정사각형

* [ ] 로고 배경 존재

* [ ] 브랜드명 한글 사용 권장

* [ ] 탭바 사용 시 토스 플로팅 탭바 형태 유지

* [ ] 탭 개수 2~5개

---

## 6. 반려 사례 모음

### 사례 1. 브랜드 아이콘 불일치 [실사례]

반려 사유

* granite.config.ts에 콘솔과 다른 아이콘 사용

원인

* 콘솔 아이콘 변경 후 코드 미반영

해결

* 콘솔 이미지 링크 재복사 후 brand.icon 수정

재발 방지

* [ ] 콘솔 이미지 변경 시 코드도 수정
* [ ] 검토 요청 전 이미지 직접 비교

---

### 사례 2. 미니앱 이름 불일치 [실사례]

반려 사유

* 콘솔 이름과 앱 이름 불일치

원인

* 띄어쓰기
* 영문/한글 차이
* 약어 사용

해결

* 콘솔 이름 복사 후 그대로 사용

재발 방지

* [ ] 한 글자까지 동일한지 확인
* [ ] 콘솔 원문 복사 후 사용

---

## 7. 출시 후 운영: Claude Code + Console MCP 연동

### 왜 사용하는가?

Apps in Toss Console MCP를 연결하면 브라우저에서 콘솔을 열지 않아도
Claude Code에서 자연어로 다음 작업을 수행할 수 있습니다.

* 워크스페이스 조회
* 미니앱 조회/수정
* 검수 상태 확인
* 번들 업로드 및 롤백
* DAU/세션 조회
* 푸시 템플릿 조회
* 광고/인앱결제 관리

> 현재 Console MCP는 Claude(Code)에서 지원됩니다.

### 1) Claude Code 설치

```bash
npm install -g @anthropic-ai/claude-code
```

로그인

```bash
claude login
```

### 2) Console MCP 등록

터미널에서 실행

```bash
claude mcp add --transport http apps-in-toss-console https://mcp.toss.im/adapters/apps-in-toss-console/mcp --client-id mcp-gateway
```

등록 확인

```bash
claude mcp list
```

### 3) 인증

Claude Code 실행

```bash
claude
```

Claude Code 안에서

```text
/mcp
```

* apps-in-toss-console 선택
* Authenticate
* Toss SSO 로그인
* 비즈 로그인
* Connected 확인

### 4) 사용 예시

**워크스페이스**

```text
내 워크스페이스 목록 조회해줘.
```

**미니앱**

```text
내 미니앱 목록을 조회해줘.
```

```text
유튜브 추천템 저장소의 현재 검수 상태를 확인해줘.
```

**대시보드**

```text
최근 7일 DAU와 세션을 조회해줘.
```

**푸시**

```text
등록된 푸시 템플릿을 보여줘.
```

### ⚠️ 권장사항

초기에는 항상 아래처럼 요청하는 것을 추천합니다.

```text
조회만 하고 수정은 하지 마.
```

Console MCP는 조회뿐 아니라 수정, 검수 신청, 번들 업로드, 푸시 예약 등
실제 운영 작업도 수행할 수 있습니다.

### 추천 프롬프트

```text
Apps in Toss Console MCP를 사용해서
내 워크스페이스와 미니앱 목록을 조회해줘.
아무것도 수정하지 말고 조회만 해줘.
```

```text
현재 라이브 번들 버전과 검수 상태를 알려줘.
```

```text
최근 7일 DAU와 세션을 표로 정리해줘.
```
