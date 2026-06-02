<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// ── 타입 ──────────────────────────────────────────────────────────────
interface Reward {
  id: number
  name: string
  label: string
  color: string
  probability: number
  weekly_limit: number
  points_value: number
}

interface HistoryItem {
  won_at: string
  name: string
  label: string
  color: string
}

// ── 상태 ──────────────────────────────────────────────────────────────
const token = ref('test-user-001')
const points = ref(0)
const history = ref<HistoryItem[]>([])
const isSpinning = ref(false)
const resultText = ref('')
const resultColor = ref('')
const showResult = ref(false)
const errorMsg = ref('')

// 룰렛 칸 (서버 rewards 순서와 동일하게 하드코딩)
const SLOTS = [
  { label: '꽝',       color: '#374151' },
  { label: '+5P',      color: '#6366f1' },
  { label: '+10P',     color: '#8b5cf6' },
  { label: '+20P',     color: '#a78bfa' },
  { label: '☕ 커피',  color: '#f59e0b' },
  { label: '⭐ 스벅',  color: '#10b981' },
  { label: '🍗 치킨',  color: '#ef4444' },
]

const SLOT_COUNT = SLOTS.length
const DEG_PER_SLOT = 360 / SLOT_COUNT

// SVG 파이 조각 계산
const svgSize = 300
const cx = svgSize / 2
const cy = svgSize / 2
const r = svgSize / 2 - 4

function polarToXY(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

const slicePaths = computed(() =>
  SLOTS.map((slot, i) => {
    const startDeg = i * DEG_PER_SLOT
    const endDeg = startDeg + DEG_PER_SLOT
    const start = polarToXY(startDeg, r)
    const end = polarToXY(endDeg, r)
    const largeArc = DEG_PER_SLOT > 180 ? 1 : 0
    const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`

    // 라벨 중심각
    const midDeg = startDeg + DEG_PER_SLOT / 2
    const labelPos = polarToXY(midDeg, r * 0.62)
    return { path, color: slot.color, label: slot.label, lx: labelPos.x, ly: labelPos.y }
  })
)

// 휠 회전 각도
const wheelRotation = ref(0)
const wheelStyle = computed(() => ({
  transform: `rotate(${wheelRotation.value}deg)`,
  transition: isSpinning.value
    ? 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)'
    : 'none',
}))

// ── API 헬퍼 ──────────────────────────────────────────────────────────
const authHeaders = computed(() => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token.value}`,
}))

async function fetchUser() {
  const res = await fetch('/api/user', { headers: authHeaders.value })
  if (!res.ok) return
  const data = await res.json()
  points.value = data.points
  history.value = data.history
}

async function spin() {
  if (isSpinning.value) return
  errorMsg.value = ''
  showResult.value = false
  isSpinning.value = true

  try {
    const res = await fetch('/api/roulette', {
      method: 'POST',
      headers: authHeaders.value,
    })
    const data = await res.json()

    if (!res.ok) {
      errorMsg.value = data.error ?? '오류가 발생했습니다.'
      isSpinning.value = false
      return
    }

    // 당첨 칸이 위쪽 포인터(0도)에 오도록 각도 계산
    // 각 칸의 중심각 = rewardIndex * DEG_PER_SLOT + DEG_PER_SLOT / 2
    const targetSlotCenter = data.rewardIndex * DEG_PER_SLOT + DEG_PER_SLOT / 2
    // 최소 5바퀴 + 해당 칸
    const extraSpins = 5 * 360
    const currentNorm = ((wheelRotation.value % 360) + 360) % 360
    const delta = (360 - targetSlotCenter - currentNorm + 360) % 360
    wheelRotation.value += extraSpins + delta

    setTimeout(() => {
      isSpinning.value = false
      resultText.value = data.reward.name
      resultColor.value = data.reward.color
      showResult.value = true
      points.value = data.newPoints
      fetchUser()
    }, 4200)
  } catch {
    errorMsg.value = '서버 연결에 실패했습니다.'
    isSpinning.value = false
  }
}

async function resetPoints() {
  await fetch('/api/user/reset', { method: 'POST', headers: authHeaders.value })
  await fetchUser()
}

function closeResult() {
  showResult.value = false
}

onMounted(fetchUser)
</script>

<template>
  <div class="app">
    <!-- 헤더 -->
    <header class="header">
      <h1 class="title">🎡 포인트 룰렛</h1>
      <div class="points-badge">
        <span class="points-label">보유 포인트</span>
        <span class="points-value">{{ points.toLocaleString() }}P</span>
      </div>
    </header>

    <!-- 테스트 토큰 입력 -->
    <div class="token-row">
      <input v-model="token" placeholder="인증 토큰" class="token-input" @change="fetchUser" />
      <button class="btn-reset" @click="resetPoints">🔄 10,000P 리셋</button>
    </div>

    <!-- 룰렛 -->
    <div class="wheel-wrapper">
      <!-- 포인터 -->
      <div class="pointer">▼</div>
      <div class="wheel-container" :style="wheelStyle">
        <svg :width="svgSize" :height="svgSize" :viewBox="`0 0 ${svgSize} ${svgSize}`">
          <g v-for="(s, i) in slicePaths" :key="i">
            <path :d="s.path" :fill="s.color" stroke="#0f172a" stroke-width="2" />
            <text
              :x="s.lx" :y="s.ly"
              text-anchor="middle" dominant-baseline="middle"
              fill="white" font-size="12" font-weight="700"
              font-family="'Pretendard', 'Inter', sans-serif"
            >{{ s.label }}</text>
          </g>
          <!-- 중앙 원 -->
          <circle :cx="cx" :cy="cy" r="20" fill="#0f172a" stroke="#6366f1" stroke-width="3"/>
          <circle :cx="cx" :cy="cy" r="8" fill="#6366f1" />
        </svg>
      </div>
    </div>

    <!-- 스핀 버튼 -->
    <button
      class="btn-spin"
      :disabled="isSpinning || points < 10"
      @click="spin"
    >
      <span v-if="isSpinning">🌀 돌아가는 중...</span>
      <span v-else-if="points < 10">포인트 부족</span>
      <span v-else>🎰 룰렛 돌리기 (−10P)</span>
    </button>

    <!-- 에러 메시지 -->
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

    <!-- 당첨 내역 -->
    <div class="history" v-if="history.length">
      <h2 class="history-title">최근 당첨 내역</h2>
      <ul class="history-list">
        <li v-for="(item, i) in history" :key="i" class="history-item">
          <span class="history-dot" :style="{ background: item.color }"></span>
          <span class="history-name">{{ item.name }}</span>
          <span class="history-date">{{ new Date(item.won_at).toLocaleString('ko-KR') }}</span>
        </li>
      </ul>
    </div>

    <!-- 당첨 결과 모달 -->
    <Transition name="modal">
      <div v-if="showResult" class="modal-overlay" @click="closeResult">
        <div class="modal-card" @click.stop>
          <div class="modal-icon" :style="{ background: resultColor }">🎉</div>
          <h2 class="modal-title">당첨!</h2>
          <p class="modal-reward" :style="{ color: resultColor }">{{ resultText }}</p>
          <p class="modal-points">잔여 포인트: {{ points.toLocaleString() }}P</p>
          <button class="btn-close" @click="closeResult">확인</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  min-height: 100vh;
  background: #0f172a;
  color: #f1f5f9;
  font-family: 'Inter', 'Apple SD Gothic Neo', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 48px;
  gap: 20px;
}

/* 헤더 */
.header {
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
.points-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.4);
  border-radius: 12px;
  padding: 6px 14px;
}
.points-label { font-size: 10px; color: #94a3b8; }
.points-value { font-size: 18px; font-weight: 800; color: #a78bfa; }

/* 토큰 입력 */
.token-row {
  width: 100%;
  max-width: 420px;
  display: flex;
  gap: 8px;
}
.token-input {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
}
.btn-reset {
  background: #1e293b;
  border: 1px solid #475569;
  color: #94a3b8;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-reset:hover { border-color: #6366f1; color: #a78bfa; }

/* 룰렛 */
.wheel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pointer {
  position: absolute;
  top: -14px;
  font-size: 26px;
  color: #f1f5f9;
  z-index: 10;
  filter: drop-shadow(0 0 8px rgba(99,102,241,0.9));
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
}
.wheel-container {
  border-radius: 50%;
  box-shadow:
    0 0 0 5px #1e293b,
    0 0 0 8px #6366f1,
    0 0 40px rgba(99,102,241,0.5);
}

/* 스핀 버튼 */
.btn-spin {
  width: 100%;
  max-width: 420px;
  padding: 18px;
  font-size: 17px;
  font-weight: 800;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 20px rgba(99,102,241,0.5);
  transition: all 0.2s;
  letter-spacing: -0.3px;
}
.btn-spin:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(99,102,241,0.7);
}
.btn-spin:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.error-msg { color: #f87171; font-size: 14px; }

/* 당첨 내역 */
.history { width: 100%; max-width: 420px; }
.history-title {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1e293b;
  border-radius: 10px;
  padding: 10px 14px;
}
.history-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.history-name { flex: 1; font-size: 14px; font-weight: 600; }
.history-date { font-size: 11px; color: #64748b; }

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}
.modal-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 24px;
  padding: 36px 32px;
  text-align: center;
  width: 88%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.modal-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}
.modal-title { font-size: 26px; font-weight: 900; }
.modal-reward { font-size: 22px; font-weight: 800; }
.modal-points { font-size: 14px; color: #94a3b8; }
.btn-close {
  margin-top: 8px;
  padding: 12px 40px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

/* 모달 트랜지션 */
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.9); }
</style>
