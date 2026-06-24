# uptn-ai-study 바이브코딩 스터디 워크플로우

> Claude Code에 첨부해서 팀 규칙을 자동으로 따르게 하는 가이드입니다.
> 작업 시작 전 이 파일을 첨부하고 "WORKFLOW_v3.md 기준으로 작업해줘"라고 말해주세요.

---

## 기술 스택

모든 프로토타입은 아래 기술 스택을 기본으로 개발합니다.

| 항목 | 내용 |
|---|---|
| 프레임워크 | Vue 3 |
| 언어 | TypeScript |
| 빌드 도구 | Vite |

### Claude Code 시작 시 전달할 프롬프트

새 프로토타입을 시작할 때 아래 내용을 함께 전달해주세요.

```text
기술 스택
- Vue 3
- TypeScript
- Vite

요구사항
- TypeScript 타입 정의 필수
- 재사용 가능한 컴포넌트 구조
- Vercel 배포 가능한 프로젝트 구조
```

---

## 우리가 쓰는 도구

| 도구 | 비유 | 하는 일 |
|---|---|---|
| GitHub (Org) | 팀 사무실 | 팀원 각자의 레포를 한 곳에서 관리 |
| Vercel | 출판사 | 코드를 인터넷 주소(URL)로 만들어줌 |
| Supabase | 엑셀 서버 | 로그인·데이터 저장 (필요할 때만) |

---

## 기본 개념

| 개념 | 비유 | 설명 |
|---|---|---|
| Org 계정 | 🏢 회사 | uptn-ai-study 라는 팀 공간. 팀원 레포가 모두 여기에 모임 |
| 개인 레포 | 🏠 내 작업실 | 본인 이름으로 만들어진 레포. 여기서만 작업 (Owner가 미리 생성) |
| 폴더 | 📁 서랍 | 프로토타입마다 폴더 하나씩 추가 |
| Vercel 프로젝트 | 🌐 개별 URL | 폴더마다 Vercel 프로젝트 1개 → URL 1개 |

---

## 레포 & Vercel 구조

```
uptn-ai-study/alice/         ← GitHub 레포 (1개)
├── proto-01-crypto/         → Vercel 프로젝트 alice-proto01 (URL 1개)
├── proto-02-dashboard/      → Vercel 프로젝트 alice-proto02 (URL 1개)
└── proto-03-chatbot/        → Vercel 프로젝트 alice-proto03 (URL 1개)
```

> GitHub 레포는 1개, Vercel 프로젝트는 프로토타입 수만큼 생성됩니다.

---

## 팀 규칙

- **본인 레포에서만 작업** — 남의 레포는 절대 건드리지 않기
- **새 프로토타입은 폴더로 구분** — `proto-01/`, `proto-02/` 식으로 본인 레포 안에 추가
- **Vercel은 프로토타입마다 새 프로젝트** — 같은 레포를 import하되 Root Directory만 해당 폴더로 지정
- **push = 자동 배포** — push하면 연동된 Vercel 프로젝트 전체 자동 재배포

---

## 전체 흐름

```
Org 초대 수락 → 로컬 파일 첫 Push → Vercel 연동 (proto-01) → URL 슬랙 공유
                                           ↓ 새 프로토타입 추가 시
                             폴더 추가 → Push → Vercel 새 프로젝트 (proto-02) → URL 공유
```

---

## STEP 1. Org 초대 수락

**무엇을 하는 단계인가요?**
`uptn-ai-study` Org에 접근 권한을 받는 단계입니다.

**어떻게 하나요?**
리더(홍정민)가 Org Collaborator로 초대하면 이메일이 옵니다.
이메일에서 **Accept invitation** 클릭하면 끝.

> GitHub 계정이 없는 팀원은 github.com에서 먼저 개인 계정을 만들어주세요.

---

## STEP 2. 로컬 파일 첫 Push — 최초 1회

**무엇을 하는 단계인가요?**
내 컴퓨터에 있는 작업 파일을 GitHub 레포에 처음으로 올리는 단계입니다.
레포는 Owner가 이미 만들어뒀으므로 Clone 없이 바로 Push합니다.

**어떻게 하나요?**
터미널(명령 프롬프트)에서 아래 순서대로 입력하세요.

```bash
# 1. 작업 파일이 있는 폴더로 이동
cd 본인_작업_폴더_경로
# 예) cd D:\claudestudy

# 2. Git 초기화 & 커밋
git init
git add .
git commit -m "first commit"

# 3. GitHub 레포 연결 & Push
git remote add origin https://github.com/uptn-ai-study/본인이름.git
git branch -M main
git push -u origin main
```

> 💡 레포 주소는 github.com/uptn-ai-study/본인이름 에서 초록색 **Code** 버튼 → HTTPS 탭에서 복사하세요.

---

## STEP 3. 새 프로토타입 시작하기 — 프로토타입마다

**무엇을 하는 단계인가요?**
새 프로토타입을 만들 때마다 레포 안에 새 폴더를 추가하는 단계입니다.

**어떻게 하나요?**
Claude Code에게 이렇게 말하면 됩니다:

> "proto-02-dashboard 폴더를 만들고 여기서 대시보드 프로토타입 시작해줘"

폴더 이름 규칙: `proto-번호-설명`
예) `proto-02-dashboard`, `proto-03-chatbot`

---

## STEP 4. 작업 내용 저장하고 올리기 (Push) — 작업할 때마다

**무엇을 하는 단계인가요?**
작업한 코드를 GitHub에 올리는 단계입니다.
올리는 순간 연동된 Vercel 프로젝트들이 자동으로 재배포됩니다.

> push = GitHub에 저장 = Vercel 자동 재배포. 항상 같이 일어납니다.

**어떻게 하나요?**
Claude Code에게 이렇게 말하면 됩니다:

> "지금까지 작업한 내용을 GitHub에 올려줘"

터미널에서 직접 하려면:

```bash
git add .
git commit -m "작업 내용 간단히 설명"
git push
```

---

## STEP 5. Vercel 배포 연동 — 프로토타입마다

**무엇을 하는 단계인가요?**
프로토타입 폴더마다 Vercel 프로젝트를 1개씩 만들어서 개별 URL을 갖는 단계입니다.
같은 레포를 반복해서 import하되, **Root Directory만 해당 폴더로 바꿔주면** 됩니다.

**어떻게 하나요?**

```
1. vercel.com 접속 → Add New Project 클릭
2. uptn-ai-study/본인이름 레포 선택 → Import
3. ⭐ Root Directory 칸에 해당 폴더명 입력
   예) proto-01-crypto
4. Deploy 클릭 → URL 생성 완료
5. 슬랙에 URL 공유 🎉
```

**프로토타입이 늘어날 때마다 위 과정을 반복합니다.**

```
proto-01 → Root Directory: proto-01-crypto    → https://alice-proto01.vercel.app
proto-02 → Root Directory: proto-02-dashboard → https://alice-proto02.vercel.app
proto-03 → Root Directory: proto-03-chatbot   → https://alice-proto03.vercel.app
```

> ⚠️ **반드시 본인 레포(`uptn-ai-study/본인이름`)만 import** 하세요.

> ⚠️ Vercel 가입은 **본인 개인 GitHub 계정**으로 해야 Hobby(무료) 플랜 사용 가능합니다.

---

## STEP 6. Supabase 연동 — DB 필요할 때만

**언제 필요한가요?**
회원가입, 로그인, 데이터 저장 같은 기능이 필요할 때 붙이세요.
처음부터 필요한 건 아닙니다.

**어떻게 하나요?**

### 6-1. Supabase 프로젝트 생성 & 키 복사
1. supabase.com → 가입 → New project 생성
2. Settings → API에서 아래 두 값을 복사해두기:
   - `Project URL` (예: `https://xxxx.supabase.co`)
   - `anon public` key (긴 문자열)

### 6-2. 로컬 .env 파일 설정
Claude Code에게:
> "`.env` 파일 만들고 `.gitignore`에 추가해줘. Supabase URL은 `xxx` 이고 anon key는 `yyy` 야"

그러면 Claude Code가 자동으로:
- `.env` 파일에 키 저장
- `.gitignore`에 `.env` 추가 → GitHub에 키 노출 방지 ✅

### 6-3. Vercel에 환경변수 등록 ← ⚠️ 반드시 해야 함!

`.env` 파일은 `.gitignore`로 GitHub에 올라가지 않기 때문에, **Vercel에도 키를 별도로 등록해야** 배포된 서비스가 Supabase에 접근할 수 있습니다.

```
1. vercel.com → 해당 프로토타입 프로젝트 클릭
2. 상단 메뉴 Project Settings 클릭
3. 왼쪽 사이드바에서 Environment Variables 클릭
4. 아래 두 변수를 각각 추가:

   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://xxxx.supabase.co

   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: (anon public 키 값)

5. Save 클릭
6. 상단 Deployments 탭 → 최신 배포의 ⋯ 메뉴 → Redeploy 클릭
```

> ⚠️ **Redeploy를 해야 환경변수가 적용됩니다.** Save만 하고 끝내면 반영이 안 돼요.

> ⚠️ API 키를 코드 안에 직접 쓰면 GitHub에 공개됩니다. 반드시 환경변수로 관리하세요.

---

## 프로토타입 상태 관리

각자 레포의 `README.md`에 아래 표를 만들어 관리해주세요.

```markdown
| 폴더명 | 서비스 이름 | Vercel URL | 상태 |
|---|---|---|---|
| proto-01-crypto | 크립토 위시웰 | https://alice-proto01.vercel.app | ✅ 완성 |
| proto-02-dashboard | 대시보드 | https://alice-proto02.vercel.app | 🔄 진행중 |
| proto-03-chatbot | AI 챗봇 | - | ⭐ 디벨롭 예정 |
```

상태 표시: `✅ 완성` / `🔄 진행중` / `⭐ 디벨롭 예정` / `⏸ 보류`

---

## 한눈에 요약

| 항목 | 내용 |
|---|---|
| Org | uptn-ai-study · 팀 사무실 |
| 레포 | 팀원 각자 1개 · Owner가 미리 생성 (본인 이름) |
| 첫 Push | 로컬 폴더에서 git init → remote 연결 → push (Clone 불필요) |
| 폴더 | 프로토타입마다 추가 (proto-01/, proto-02/ ...) |
| Vercel | 프로토타입마다 New Project · 같은 레포 · Root Directory만 변경 |
| 기술 스택 | Vue 3 + TypeScript + Vite |
| 명령어 | Claude Code에게 말로 시키면 됨 |
| 비용 | GitHub Free + Vercel Hobby + Supabase Free = 전부 무료 $0 |

---

*uptn-ai-study 바이브코딩 스터디 | 2026*
