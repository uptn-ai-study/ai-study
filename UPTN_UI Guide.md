# UI 공통 규약
> UI-KIT.md 기준 · 서비스 고유 내용 제외 · 최종 업데이트 2026.06.05

---

## 목차

1. [CSS 변수 선언](#1-css-변수-선언)
2. [Typography](#2-typography)
3. [Spacing](#3-spacing)
4. [Border Radius](#4-border-radius)
5. [Shadow](#5-shadow)
6. [Button](#6-button)
7. [Input Field](#7-input-field)
8. [Card](#8-card)
9. [Bottom Sheet](#9-bottom-sheet)
10. [Tab Bar](#10-tab-bar)
11. [Badge & Chip](#11-badge--chip)
12. [List Item](#12-list-item)
13. [Empty State](#13-empty-state)
14. [FAB](#14-fab)
15. [핵심 원칙](#15-핵심-원칙)

---

## 1. CSS 변수 선언

```css
:root {
  --primary:       #5F46FF;
  --primary-dark:  #4A35E0;
  --primary-light: #EEEAFF;
  --primary-200:   #F2F0FF;
  --primary-dim:   rgba(95,70,255,0.10);
  --card-bg:       #FFFFFF;
  --muted-bg:      #F5F5F8;
  --border:        #E5E7EB;
  --text-1:        #111827;
  --text-2:        #6B7280;
  --text-3:        #9CA3AF;
  --success:       #10B981;
  --error:         #EF4444;
}
```

### Color Tokens

| 역할 | 토큰 | HEX |
| :--- | :--- | :--- |
| Primary | `--primary` | `#5F46FF` |
| Primary Dark (Pressed) | `--primary-dark` | `#4A35E0` |
| Primary Light | `--primary-light` | `#EEEAFF` |
| Primary 200 (Secondary BG) | `--primary-200` | `#F2F0FF` |
| Primary Dim (10%) | `--primary-dim` | `rgba(95,70,255,0.10)` |
| Card BG | `--card-bg` | `#FFFFFF` |
| Muted BG | `--muted-bg` | `#F5F5F8` |
| Border | `--border` | `#E5E7EB` |
| Text Primary | `--text-1` | `#111827` |
| Text Secondary | `--text-2` | `#6B7280` |
| Text Muted | `--text-3` | `#9CA3AF` |
| Success | `--success` | `#10B981` |
| Error | `--error` | `#EF4444` |
| Overlay | — | `rgba(0,0,0,0.50)` |

---

## 2. Typography

> 폰트 로드: `https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/SUIT-Variable.min.css`

```css
body {
  font-family: 'SUIT Variable', 'SUIT', -apple-system, sans-serif;
}
```

### Type Scale

| 스타일 | Size | Weight | Letter-spacing | 기본 색상 |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 36px | 700 | -0.5px | `#111827` |
| **Title 1** | 28px | 700 | -0.3px | `#111827` |
| **Title 2** | 22px | 700 | -0.3px | `#111827` |
| **Title 3** | 18px | 700 | -0.3px | `#111827` |
| **Title 4** | 16px | 700 | -0.3px | `#111827` |
| **Body 1** | 15px | 400 | 0 | `#111827` |
| **Body 2** | 14px | 400 | 0 | `#6B7280` |
| **Caption 1** | 13px | 400 | -0.2px | `#6B7280` |
| **Caption 2** | 12px | 400 | -0.2px | `#9CA3AF` |

---

## 3. Spacing

> **4px Base Grid** 사용

| 토큰 | 값 | 사용처 |
| :--- | :--- | :--- |
| `space-1` | 4px | 최소 간격 |
| `space-2` | 8px | 뱃지 패딩, 인접 요소 간격 |
| `space-3` | 12px | 카드 내부 요소 간격 |
| `space-4` | 16px | 카드 패딩 |
| `space-5` | 20px | 화면 좌우 여백 |
| `space-6` | 24px | 섹션 간격, 바텀시트 패딩 |
| `space-8` | 32px | 큰 섹션 구분 |

---

## 4. Border Radius

| 토큰 | 값 | 사용처 |
| :--- | :--- | :--- |
| `radius-sm` | 8px | 작은 뱃지 |
| `radius-md` | 12px | **버튼**, 인풋 필드, 정보 행 카드 |
| `radius-lg` | 16px | **카드** |
| `radius-xl` | 20px | 큰 카드 |
| `radius-2xl` | 24px | **바텀시트** 상단 |
| `radius-full` | 9999px | pill 버튼, 뱃지 |

---

## 5. Shadow

| 레벨 | CSS | 사용처 |
| :--- | :--- | :--- |
| **Level 0** | `none` | 기본 |
| **Level 1** | `0 1px 4px rgba(0,0,0,0.06)` | 카드, 리스트 아이템 |
| **Level 2** | `0 4px 16px rgba(0,0,0,0.10)` | 드롭다운 |
| **Level 3** | `0 -4px 24px rgba(0,0,0,0.10)` | 바텀시트 |
| **FAB** | `0 4px 20px rgba(0,0,0,0.25)` | 플로팅 액션 버튼 |

---

## 6. Button

### 높이 기준

| 종류 | 높이 | 용도 |
| :--- | :--- | :--- |
| Primary CTA | 56px | 화면 단독 주요 액션 |
| Primary Medium / Secondary | 48px | 나란히 배치 CTA |
| Gray | 44px | 저위계 보조 액션 |
| Outline Pill | 40px | 소형 보조 액션 |

### 6-1. Primary — Full Width CTA

```css
.btn-primary {
  width: 100%; height: 56px;
  background: #5F46FF; color: #FFFFFF;
  font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
  border-radius: 12px; border: none; cursor: pointer;
}
.btn-primary:active { background: #4A35E0; }
```

### 6-2. Primary Medium — 나란히 배치형

```css
.btn-row { display: flex; gap: 10px; }

.btn-primary-md {
  flex: 1; height: 48px;
  background: #5F46FF; color: #FFFFFF;
  font-size: 15px; font-weight: 600; letter-spacing: -0.3px;
  border-radius: 12px; border: none; cursor: pointer;
}
```

### 6-3. Secondary

```css
.btn-secondary {
  flex: 1; height: 48px;
  background: #F2F0FF; color: #5F46FF;
  font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
  border-radius: 12px; border: none; cursor: pointer;
}
```

### 6-4. Gray — 보조 액션

```css
.btn-gray {
  flex: 1; height: 44px;
  background: #F5F5F8; color: #6B7280;
  border: 1px solid #E5E7EB;
  font-size: 13px; font-weight: 600; letter-spacing: -0.3px;
  border-radius: 12px; cursor: pointer;
}
```

### 6-5. Outline Pill — 소형

```css
.btn-outline-pill {
  height: 40px; padding: 0 20px;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  color: #374151; font-size: 14px; font-weight: 500;
  border-radius: 9999px; cursor: pointer;
}
```

### 6-6. Text Button

```css
.btn-text {
  background: none; border: none;
  color: #5F46FF; font-size: 15px; font-weight: 500;
  cursor: pointer; padding: 0 4px;
}
```

---

## 7. Input Field

```css
.input-field {
  width: 100%; height: 52px;
  padding: 0 44px 0 16px;
  background: #FFFFFF; border: 1.5px solid #E5E7EB;
  border-radius: 12px; font-size: 15px; color: #111827; outline: none;
}
.input-field:focus { border: 2px solid #5F46FF; }
.input-field::placeholder { color: #9CA3AF; }
```

---

## 8. Card

### Standard Card

```css
.card {
  background: #FFFFFF; border-radius: 16px;
  padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
```

### Info Row Card

```css
.info-row-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: #FFFFFF;
  border: 1px solid #E5E7EB; border-radius: 12px;
}
.info-row-label { font-size: 14px; color: #6B7280; }
.info-row-value { font-size: 14px; font-weight: 600; color: #111827; }
```

---

## 9. Bottom Sheet

```css
.bs-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.50);
  display: flex; align-items: flex-end;
  z-index: 200;
}

.bs-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  padding: 12px 12px 28px;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.10);
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.32,1,.55,1);
}
.bs-sheet.open { transform: translateY(0); }

.bs-handle {
  width: 36px; height: 4px;
  background: #E5E7EB; border-radius: 2px;
}

.bs-header {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 0 8px;
}
.bs-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
.bs-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  font-size: 13px; color: #6B7280; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
```

```html
<div class="bs-overlay">
  <div class="bs-sheet open">
    <div class="bs-handle"></div>
    <div class="bs-header">
      <span class="bs-title">제목</span>
      <button class="bs-close">✕</button>
    </div>
    <!-- 콘텐츠 -->
    <button class="btn-primary">확인</button>
  </div>
</div>
```

> Vue 구현 시 마운트 후 `requestAnimationFrame`으로 `.open` 클래스를 추가해 슬라이드업 트리거

---

## 10. Tab Bar

### Top Tab Bar (높이 46px)

```css
.top-tabs {
  height: 46px; display: flex;
  background: #FFFFFF; border-bottom: 1px solid #E5E7EB; flex-shrink: 0;
}
.top-tab {
  flex: 1; border: none; background: none;
  font-size: 15px; font-weight: 400; color: #9CA3AF; cursor: pointer; position: relative;
}
.top-tab.active { font-weight: 700; color: #111827; }
.top-tab.active::after {
  content: ''; position: absolute; bottom: 0; left: 10%; right: 10%;
  height: 2px; background: #111827; border-radius: 2px 2px 0 0;
}
```

### Content Tab Bar (높이 48px)

```css
.tab-bar { display: flex; border-bottom: 1px solid #F3F4F6; background: #FFFFFF; }
.tab-item {
  flex: 1; height: 48px; background: none; border: none;
  font-size: 16px; font-weight: 400; color: #9CA3AF; cursor: pointer; position: relative;
}
.tab-item.active { font-weight: 700; color: #111827; }
.tab-item.active::after {
  content: ''; position: absolute; bottom: 0; left: 10%; right: 10%;
  height: 2px; background: #111827; border-radius: 2px;
}
```

---

## 11. Badge & Chip

### Badge

| 종류 | 배경 | 텍스트 | Radius |
| :--- | :--- | :--- | :--- |
| Success | `#10B981` | `#fff` · 12px · 600 | 6px |
| Primary | `#5F46FF` | `#fff` · 11px · 600 | 6px |
| Error | `#EF4444` | `#fff` · 12px · 600 | 6px |
| Count | `rgba(0,0,0,0.35)` | `#fff` · 12px · 600 | 9999px |

```css
.badge-success { background: #10B981; color: #fff; font-size: 12px; padding: 3px 9px; border-radius: 6px; }
.badge-primary { background: #5F46FF; color: #fff; font-size: 11px; padding: 3px 9px; border-radius: 6px; }
.badge-error   { background: #EF4444; color: #fff; font-size: 12px; padding: 3px 9px; border-radius: 6px; }
.badge-count   { background: rgba(0,0,0,0.35); color: #fff; font-size: 12px; padding: 3px 10px; border-radius: 9999px; }
```

### Chip (필터)

```css
.chip {
  border: 1.5px solid #5F46FF; color: #5F46FF;
  font-size: 13px; font-weight: 500;
  border-radius: 9999px; padding: 6px 14px;
  background: transparent; cursor: pointer;
}
.chip.active { background: #5F46FF; color: #FFFFFF; }
```

---

## 12. List Item

```css
.list-item {
  display: flex; align-items: center; gap: 12px;
  background: #FFFFFF; border-radius: 16px;
  padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.list-thumb {
  width: 48px; height: 48px; border-radius: 12px;
  background: #EEEAFF; display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.list-info  { flex: 1; min-width: 0; }
.list-title { font-size: 15px; font-weight: 600; letter-spacing: -0.2px; color: #111827; }
.list-sub   { font-size: 13px; color: #6B7280; margin-top: 2px; }
.list-arrow { font-size: 14px; color: #9CA3AF; }
```

---

## 13. Empty State

```css
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; padding: 40px 20px; gap: 10px;
}
.empty-icon { font-size: 48px; opacity: .35; }
.empty-text { font-size: 16px; font-weight: 700; color: #6B7280; }
```

---

## 14. FAB

```css
.fab {
  background: #1F2937; width: 52px; height: 52px;
  border-radius: 9999px; box-shadow: 0 4px 20px rgba(0,0,0,.25);
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
}
```

---

## 15. 핵심 원칙

| # | 원칙 | 내용 |
| :--- | :--- | :--- |
| 1 | **Primary 통일** | `#5F46FF` 단일 컬러 — 버튼·포커스·링크·강조 전반 |
| 2 | **Hover 없음** | 웹뷰 특성상 버튼 hover 색 변경 사용 안 함. `:active`(pressed)만 적용 |
| 3 | **카드 분리** | 흰 카드 + Level 1 그림자로 배경에서 분리. 별도 테두리 불필요 |
| 4 | **버튼 높이 고정** | CTA `56px` · Medium/Secondary `48px` · Gray `44px` · Pill `40px` |
| 5 | **Secondary 버튼** | `#F2F0FF` 배경 + `#5F46FF` 텍스트 — Primary와 나란히 배치 시 사용 |
| 6 | **바텀시트** | `border-radius: 24px 24px 0 0` · 슬라이드업 애니메이션 필수 |

---

*디자인 변경 시 `UI-KIT.md`를 기준으로 본 파일도 함께 업데이트 해주세요.*
