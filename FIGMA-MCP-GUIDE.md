# Claude Code + Figma MCP 연결 가이드

> Claude Code에서 Figma 파일을 직접 읽고 코드로 변환하는 방법

---

## STEP 1 — Claude Code 설치

### 방법 A. 웹 (claude.ai/code)

1. [claude.ai/code](https://claude.ai/code) 접속
2. Anthropic 계정으로 로그인
3. 브라우저에서 바로 사용 가능 (별도 설치 불필요)

### 방법 B. 터미널 (CLI)

Node.js 18 이상이 설치되어 있어야 합니다.

```bash
npm install -g @anthropic-ai/claude-code
```

설치 후 프로젝트 폴더에서 실행:

```bash
cd 프로젝트폴더
claude
```

> **Windows** 사용자는 PowerShell 또는 Windows Terminal에서 실행합니다.

---

## STEP 2 — Figma MCP 서버 추가

Claude Code 대화창에서 `/mcp` 입력 → **Add MCP Server** 선택 후 아래 정보 입력:

| 항목 | 값 |
| :--- | :--- |
| Name | `figma` |
| Type | `http` |
| URL | `https://mcp.figma.com/mcp` |

저장하면 Figma MCP 서버가 목록에 추가됩니다.

> 이미 추가되어 있으면 이 단계는 건너뜁니다.

---

## STEP 3 — Figma 계정 인증

1. `/mcp` 입력 → Figma 서버 선택 → **Re-authenticate** 클릭

2. 터미널(또는 채팅창)에 아래와 같은 인증 URL이 출력됩니다:
   ```
   https://www.figma.com/oauth/mcp?response_type=code&client_id=...
   ```

3. **브라우저에서 접근할 Figma 파일의 계정으로 먼저 로그인** 확인

4. 위 URL을 브라우저 주소창에 붙여넣어 열기

5. Figma 승인 화면에서 **Allow** 클릭

6. 브라우저가 `localhost` 페이지로 리디렉션됨
   - 페이지가 안 열려도 정상입니다
   - 주소창에 표시된 URL 전체를 복사

7. 복사한 URL(`http://localhost:xxxxx/callback?code=...`)을 Claude에게 붙여넣기

> **계정 주의**: 인증 시 브라우저에 로그인된 Figma 계정으로 연결됩니다.  
> 다른 계정으로 바꾸려면 브라우저에서 Figma 계정 전환 후 Re-authenticate 진행.

---

## STEP 4 — 연결 확인

Claude에게 아래처럼 질문하면 연결된 계정을 확인할 수 있습니다:

```
지금 연결된 Figma 계정이 뭐야?
```

이메일과 팀 목록이 정상 출력되면 연결 완료입니다.

---

## STEP 5 — Figma 파일 활용

Figma URL을 Claude에게 전달하면 디자인을 읽어 코드로 변환해 줍니다.

**활용 예시 1 — 디자인 토큰 추출**
```
이 Figma 페이지에서 디자인 토큰(색상, 타이포그래피, 간격, border-radius)을
추출해서 tokens.css 파일로 만들어줘.

Figma URL: https://www.figma.com/design/xxxxx?node-id=xxxx
```

**활용 예시 2 — 컴포넌트 코드 변환**
```
이 Figma 컴포넌트를 Vue3 코드로 변환해줘.

Figma URL: https://www.figma.com/design/xxxxx?node-id=xxxx
```

**활용 예시 3 — 화면 구조 분석**
```
이 화면의 레이아웃 구조를 분석하고 HTML/CSS로 구현해줘.

Figma URL: https://www.figma.com/design/xxxxx?node-id=xxxx
```

---

## 자주 겪는 문제

| 증상 | 해결 방법 |
| :--- | :--- |
| 인증 URL이 안 뜸 | `/mcp` → Figma → **Re-authenticate** 다시 시도 |
| 브라우저가 자동으로 안 열림 | URL을 직접 복사해서 브라우저 주소창에 붙여넣기 |
| 다른 계정으로 바꾸고 싶음 | 브라우저 Figma 계정 전환 후 Re-authenticate |
| `"nothing selected"` 오류 | Figma 데스크탑 앱에서 원하는 레이어 직접 선택 후 재시도 |
| Rate limit 오류 | Figma Starter 플랜은 MCP 호출 횟수 제한 있음. 잠시 후 재시도 |
| 파일 접근 권한 없음 | 해당 Figma 파일에 연결 계정의 View 권한 필요 |

---

## 참고

- Claude Code 공식: [claude.ai/code](https://claude.ai/code)
- Figma MCP 서버: `https://mcp.figma.com/mcp`
- MCP 설정 관리: Claude Code 대화창에서 `/mcp` 입력
