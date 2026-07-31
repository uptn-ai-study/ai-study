/**
 * DIALED // COLOR - Premium Logic & Color Math Engine
 * Inspired by dialed.gg
 */

// 1. 상태 관리 객체 (Game State)
const state = {
  difficulty: 'normal',
  colorsToMemorize: 3,
  revealTime: 6000,
  targetColors: [], // { h, s, b, rgb, lab }
  userGuesses: [],  // { h, s, b, rgb, lab }
  scores: [],
  currentRoundIndex: 0,
  timerInterval: null, // requestAnimationFrame ID
  timerTimeout: null,
  toastTimeout: null
};

// 2. DOM 요소 취득
const screens = {
  start: document.getElementById('screen-start'),
  reveal: document.getElementById('screen-reveal'),
  recall: document.getElementById('screen-recall'),
  results: document.getElementById('screen-results')
};

const elements = {
  btnStart: document.getElementById('btn-start-game'),
  btnSubmit: document.getElementById('btn-submit-color'),
  btnRestart: document.getElementById('btn-restart'),
  btnShare: document.getElementById('btn-share'),
  btnShowStats: document.getElementById('btn-show-stats'),
  btnCloseStats: document.getElementById('btn-close-stats'),
  btnClearStats: document.getElementById('btn-clear-stats'),
  modalStats: document.getElementById('modal-stats'),
  logoHome: document.getElementById('logo-home'),
  
  // Reveal screen elements
  revealTimerBar: document.getElementById('reveal-timer-bar'),
  revealTimerCountdownLarge: document.getElementById('reveal-timer-countdown-large'),
  revealColorGrid: document.getElementById('reveal-color-grid'),
  revealRoundTitle: document.getElementById('reveal-round-title'),
  
  // Recall screen elements
  progressDots: document.getElementById('progress-dots'),
  progressText: document.getElementById('progress-step-text'),
  recallTargetTile: document.getElementById('recall-target-tile'),
  recallGuessTile: document.getElementById('recall-guess-tile'),
  
  // Recall sliders
  inputHue: document.getElementById('input-hue'),
  inputSat: document.getElementById('input-sat'),
  inputBri: document.getElementById('input-bri'),
  valHue: document.getElementById('val-hue'),
  valSat: document.getElementById('val-sat'),
  valBri: document.getElementById('val-bri'),
  
  // Results screen elements
  resultGrandScore: document.getElementById('result-grand-score'),
  resultRatingBadge: document.getElementById('result-rating-badge'),
  resultRoundsList: document.getElementById('result-rounds-list'),
  startLeaderboard: document.getElementById('start-leaderboard'),
  recentRecordsList: document.getElementById('recent-records-list'),
  
  // Stats modal elements
  statTotalGames: document.getElementById('stat-total-games'),
  statBestScore: document.getElementById('stat-best-score'),
  statAvgScore: document.getElementById('stat-avg-score'),
  statsTableBody: document.getElementById('stats-table-body'),
  
  toastContainer: document.getElementById('toast-container')
};

// ==========================================================================
// 3. 색상 수학 엔진 (Color Conversion & CIEDE2000 Math)
// ==========================================================================

/**
 * HSB (HSV)를 RGB로 변환
 * H: [0, 360], S: [0, 100], B: [0, 100]
 */
function hsbToRgb(h, s, b) {
  s = s / 100;
  b = b / 100;
  
  const c = b * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = b - c;
  
  let r = 0, g = 0, bVal = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; bVal = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; bVal = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; bVal = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; bVal = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; bVal = c;
  } else if (300 <= h && h <= 360) {
    r = c; g = 0; bVal = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bVal + m) * 255)
  };
}

/**
 * RGB를 sRGB 감마 보정을 적용하여 XYZ D65 공간으로 변환
 */
function rgbToXyz(r, g, b) {
  let rL = r / 255;
  let gL = g / 255;
  let bL = b / 255;

  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  rL *= 100;
  gL *= 100;
  bL *= 100;

  // D65 광원 기준 변환 매트릭스
  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;

  return { x, y, z };
}

/**
 * XYZ를 CIELAB (L*, a*, b*)로 변환
 */
function xyzToLab(x, y, z) {
  // D65 레퍼런스 백색점
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let vX = x / refX;
  let vY = y / refY;
  let vZ = z / refZ;

  vX = vX > 0.008856 ? Math.pow(vX, 1 / 3) : (7.787 * vX) + (16 / 116);
  vY = vY > 0.008856 ? Math.pow(vY, 1 / 3) : (7.787 * vY) + (16 / 116);
  vZ = vZ > 0.008856 ? Math.pow(vZ, 1 / 3) : (7.787 * vZ) + (16 / 116);

  const L = (116 * vY) - 16;
  const a = 500 * (vX - vY);
  const b = 200 * (vY - vZ);

  return { L, a, b };
}

/**
 * HSB 값을 전달받아 직접 CIELAB 오브젝트 구하기
 */
function hsbToLab(h, s, b) {
  const rgb = hsbToRgb(h, s, b);
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

/**
 * CIEDE2000 (ΔE₀₀) 색상 거리 계산 알고리즘
 * 두 색상의 LAB 값을 인자로 받아 정밀한 차이를 산정
 */
function ciede2000(lab1, lab2) {
  const L1 = lab1.L, a1 = lab1.a, b1 = lab1.b;
  const L2 = lab2.L, a2 = lab2.a, b2 = lab2.b;
  
  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;
  
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (C1 + C2) / 2;
  
  const avgC7 = Math.pow(avgC, 7);
  const G = 0.5 * (1 - Math.sqrt(avgC7 / (avgC7 + Math.pow(25, 7))));
  
  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);
  
  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
  const avgCPrime = (C1Prime + C2Prime) / 2;
  
  let h1Prime = Math.atan2(b1, a1Prime) * rad2deg;
  if (h1Prime < 0) h1Prime += 360;
  let h2Prime = Math.atan2(b2, a2Prime) * rad2deg;
  if (h2Prime < 0) h2Prime += 360;
  
  let avgHPrime = (h1Prime + h2Prime) / 2;
  if (Math.abs(h1Prime - h2Prime) > 180) {
    avgHPrime = (h1Prime + h2Prime + 360) / 2;
  }
  
  const T = 1 - 0.17 * Math.cos((avgHPrime - 30) * deg2rad)
            + 0.24 * Math.cos(2 * avgHPrime * deg2rad)
            + 0.32 * Math.cos((3 * avgHPrime + 6) * deg2rad)
            - 0.20 * Math.cos((4 * avgHPrime - 63) * deg2rad);
            
  let deltaHPrime = h2Prime - h1Prime;
  if (Math.abs(deltaHPrime) > 180) {
    if (h2Prime <= h1Prime) {
      deltaHPrime += 360;
    } else {
      deltaHPrime -= 360;
    }
  }
  
  const deltaLPrime = L2 - L1;
  const deltaCPrime = C2Prime - C1Prime;
  const deltaHP_val = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltaHPrime / 2) * deg2rad);
  
  const avgLPrime = (L1 + L2) / 2;
  const SL = 1 + (0.015 * Math.pow(avgLPrime - 50, 2)) / Math.sqrt(20 + Math.pow(avgLPrime - 50, 2));
  const SC = 1 + 0.045 * avgCPrime;
  const SH = 1 + 0.015 * avgCPrime * T;
  
  const deltaRo = 30 * Math.exp(-Math.pow((avgHPrime - 275) / 25, 2));
  const avgCPrime7 = Math.pow(avgCPrime, 7);
  const RC = 2 * Math.sqrt(avgCPrime7 / (avgCPrime7 + Math.pow(25, 7)));
  const RT = -Math.sin(2 * deltaRo * deg2rad) * RC;
  
  const kL = 1;
  const kC = 1;
  const kH = 1;
  
  const deltaE = Math.sqrt(
    Math.pow(deltaLPrime / (kL * SL), 2) +
    Math.pow(deltaCPrime / (kC * SC), 2) +
    Math.pow(deltaHP_val / (kH * SH), 2) +
    RT * (deltaCPrime / (kC * SC)) * (deltaHP_val / (kH * SH))
  );
  
  return deltaE;
}

/**
 * CIEDE2000 색차를 점수 (0.00 ~ 10.00)로 맵핑
 * 델타 E가 0이면 10점, 1.5 이하이면 우수한 판정, 20 이상이면 0점에 가깝게 지수 감쇠 곡선 적용
 */
function calculateMatchScore(deltaE) {
  // 지수 감쇠 곡선 상수 k = 0.065
  const rawScore = 10 * Math.exp(-0.065 * deltaE);
  // 소수점 둘째 자리 반올림
  const score = Math.max(0, Math.min(10, rawScore));
  return parseFloat(score.toFixed(2));
}

// ==========================================================================
// 4. 게임 흐름 컨트롤러 (Game Flow Controller)
// ==========================================================================

/**
 * 화면 전환 제어 함수
 */
function showScreen(screenId) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });
  screens[screenId].classList.add('active');
  state.status = screenId;
}

/**
 * 랜덤한 고품질 색상 정보 생성
 * 칙칙하지 않고 식별하기 아름다운 파스텔/네온 톤 중심
 */
function generateRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 35) + 55; // 55% ~ 90% (선명한 채도)
  const b = Math.floor(Math.random() * 40) + 50; // 50% ~ 90% (적절한 밝기)
  const rgb = hsbToRgb(h, s, b);
  const lab = hsbToLab(h, s, b);
  
  return { h, s, b, rgb, lab };
}

/**
 * 게임 초기화 및 시작
 */
function startGame() {
  // 1. 난이도 정보 수집
  const activeDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
  state.difficulty = activeDifficulty;
  
  state.colorsToMemorize = 3; // 항상 3개 고정
  
  if (activeDifficulty === 'easy') {
    state.revealTime = 8000; // 8초
  } else if (activeDifficulty === 'normal') {
    state.revealTime = 6000; // 6초
  } else if (activeDifficulty === 'hard') {
    state.revealTime = 4000; // 4초
  }
  
  // 상태 초기화
  state.targetColors = [];
  state.userGuesses = [];
  state.scores = [];
  state.currentRoundIndex = 0;
  
  // 대상 색상 리스트 생성 (3개)
  for (let i = 0; i < state.colorsToMemorize; i++) {
    state.targetColors.push(generateRandomColor());
  }
  
  // 첫 번째 색상 암기 단계 시작
  setupRevealPhase(0);
}

/**
 * 특정 라운드의 암기 화면 셋업 및 가동
 */
function setupRevealPhase(index) {
  state.currentRoundIndex = index;
  
  // 라운드 타이틀 텍스트 변경
  elements.revealRoundTitle.textContent = `라운드 ${index + 1} / 3`;
  
  // 2. 암기 화면 렌더링 - 1개의 색상 타일만 출력
  elements.revealColorGrid.innerHTML = '';
  const color = state.targetColors[index];
  const tile = document.createElement('div');
  tile.className = 'color-tile';
  tile.style.backgroundColor = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  elements.revealColorGrid.appendChild(tile);
  
  // 화면 전환
  showScreen('reveal');
  
  // 3. 암기 타이머 기동
  startRevealTimer();
}

/**
 * 소수점 2자리 표시 고정밀 카운트다운 타이머 (requestAnimationFrame 기반)
 */
function startRevealTimer() {
  const startTime = Date.now();
  elements.revealTimerBar.style.transform = 'scaleX(1)';
  elements.revealTimerCountdownLarge.textContent = (state.revealTime / 1000).toFixed(2);
  
  if (state.timerInterval) cancelAnimationFrame(state.timerInterval);
  if (state.timerTimeout) clearTimeout(state.timerTimeout);
  
  function tick() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, state.revealTime - elapsed);
    const remainingSec = remaining / 1000;
    
    // 소수점 2자리로 초 카운트 표시
    elements.revealTimerCountdownLarge.textContent = remainingSec.toFixed(2);
    
    const ratio = remaining / state.revealTime;
    elements.revealTimerBar.style.transform = `scaleX(${ratio})`;
    
    if (remaining <= 0) {
      cancelAnimationFrame(state.timerInterval);
      elements.revealTimerCountdownLarge.textContent = '0.00';
      elements.revealTimerBar.style.transform = 'scaleX(0)';
      
      // 암기 종료 -> 조작 복원 단계 진입
      state.timerTimeout = setTimeout(() => {
        startRecallPhase();
      }, 200);
    } else {
      state.timerInterval = requestAnimationFrame(tick);
    }
  }
  
  state.timerInterval = requestAnimationFrame(tick);
}

/**
 * 조작 복원(Recall) 단계 진입 및 해당 라운드 조작 셋업
 */
function startRecallPhase() {
  // 프로그레스 도트(Dots) 최초 1회 생성 또는 업데이트
  if (state.currentRoundIndex === 0) {
    elements.progressDots.innerHTML = '';
    for (let i = 0; i < state.colorsToMemorize; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      elements.progressDots.appendChild(dot);
    }
  }
  
  setupRound(state.currentRoundIndex);
  showScreen('recall');
}

/**
 * 라운드 셋업 (특정 색상 복원 시작)
 */
function setupRound(index) {
  // 텍스트 인덱스 변경
  elements.progressText.textContent = `색상 ${index + 1} / ${state.colorsToMemorize}`;
  
  // 프로그레스 도트 액티브 처리
  const dots = elements.progressDots.querySelectorAll('.dot');
  dots.forEach((dot, idx) => {
    dot.className = 'dot';
    if (idx < index) dot.classList.add('completed');
    if (idx === index) dot.classList.add('active');
  });
  
  // 조작값 기본값 초기화 (Hue=180, Sat=50, Bri=50)
  elements.inputHue.value = 180;
  elements.inputSat.value = 50;
  elements.inputBri.value = 50;
  
  // UI 동기화
  updateGuessUI();
  
  // 버튼 텍스트 변경
  if (index === state.colorsToMemorize - 1) {
    elements.btnSubmit.textContent = '최종 점수 확인하기';
  } else {
    elements.btnSubmit.textContent = '색상 확정하기';
  }
}

/**
 * 슬라이더 값 변경에 따른 조작 타일 및 백그라운드 그라디언트 동적 동기화
 */
function updateGuessUI() {
  const h = parseInt(elements.inputHue.value);
  const s = parseInt(elements.inputSat.value);
  const b = parseInt(elements.inputBri.value);
  
  // 텍스트 수치 표시 업데이트
  elements.valHue.textContent = `${h}°`;
  elements.valSat.textContent = `${s}%`;
  elements.valBri.textContent = `${b}%`;
  
  // 나만의 다이얼 RGB 계산 및 타일 컬러 반영
  const guessRgb = hsbToRgb(h, s, b);
  elements.recallGuessTile.style.backgroundColor = `rgb(${guessRgb.r}, ${guessRgb.g}, ${guessRgb.b})`;
  
  // 채도(Saturation) 슬라이더 그라디언트 트랙 업데이트 (S=0 ~ S=100)
  const satLeft = hsbToRgb(h, 0, b);
  const satRight = hsbToRgb(h, 100, b);
  elements.inputSat.style.background = `linear-gradient(to right, rgb(${satLeft.r}, ${satLeft.g}, ${satLeft.b}) 0%, rgb(${satRight.r}, ${satRight.g}, ${satRight.b}) 100%)`;
  
  // 명도(Brightness) 슬라이더 그라디언트 트랙 업데이트 (B=0 ~ B=100)
  const briLeft = hsbToRgb(h, s, 0);
  const briRight = hsbToRgb(h, s, 100);
  elements.inputBri.style.background = `linear-gradient(to right, rgb(${briLeft.r}, ${briLeft.g}, ${briLeft.b}) 0%, rgb(${briRight.r}, ${briRight.g}, ${briRight.b}) 100%)`;
}

/**
 * 사용자가 입력한 Guess 최종 확정 및 채점
 */
function submitColor() {
  const h = parseInt(elements.inputHue.value);
  const s = parseInt(elements.inputSat.value);
  const b = parseInt(elements.inputBri.value);
  
  const guessRgb = hsbToRgb(h, s, b);
  const guessLab = hsbToLab(h, s, b);
  
  // 추측 데이터 기록
  state.userGuesses.push({ h, s, b, rgb: guessRgb, lab: guessLab });
  
  // 색차 채점 연산
  const target = state.targetColors[state.currentRoundIndex];
  const deltaE = ciede2000(target.lab, guessLab);
  const score = calculateMatchScore(deltaE);
  
  state.scores.push({
    score: score,
    deltaE: deltaE,
    deltaH: h - target.h,
    deltaS: s - target.s,
    deltaB: b - target.b
  });
  
  // 다음 라운드 진행 판단
  if (state.currentRoundIndex < state.colorsToMemorize - 1) {
    // 다음 라운드 암기(Reveal) 단계로 이동 (색상 1개씩 순차 진행)
    setupRevealPhase(state.currentRoundIndex + 1);
  } else {
    // 모든 라운드 종료 -> 결과 분석 화면 진입
    finishGame();
  }
}

/**
 * 최종 결과 종합 및 결과창 표출
 */
function finishGame() {
  // 1. 점수 합산 (최대 30.00점 만점)
  const grandScore = state.scores.reduce((sum, item) => sum + item.score, 0);
  const finalGrandScore = parseFloat(grandScore.toFixed(2));
  
  // 2. DOM 반영
  elements.resultGrandScore.textContent = finalGrandScore.toFixed(2);
  
  // 등급 결정 (30점 만점에 비례)
  const badge = elements.resultRatingBadge;
  badge.className = 'rating-badge';
  
  let ratingText = '';
  if (finalGrandScore >= 28.50) {
    ratingText = 'Sensory Elite (감각의 지배자)';
    badge.classList.add('tier-s');
  } else if (finalGrandScore >= 27.00) {
    ratingText = 'Elite Observer (초감각 인지자)';
    badge.classList.add('tier-a');
  } else if (finalGrandScore >= 24.00) {
    ratingText = 'Accurate Observer (정밀 인지자)';
    badge.classList.add('tier-b');
  } else if (finalGrandScore >= 18.00) {
    ratingText = 'Normal Observer (평범한 인지자)';
    badge.classList.add('tier-c');
  } else {
    ratingText = 'Color Obscurant (색감 훈련 요망)';
  }
  badge.textContent = ratingText;
  
  // 3. 라운드별 미세 분석 아코디언 로우 렌더링
  elements.resultRoundsList.innerHTML = '';
  
  state.targetColors.forEach((target, idx) => {
    const guess = state.userGuesses[idx];
    const stat = state.scores[idx];
    
    // 채점별 이모지/클래스 분기
    let scoreClass = 'score-poor';
    if (stat.score >= 9.5) scoreClass = 'score-high';
    else if (stat.score >= 8.5) scoreClass = 'score-mid';
    else if (stat.score >= 7.0) scoreClass = 'score-low';
    
    const card = document.createElement('div');
    card.className = 'round-card glass-panel';
    
    // 절반 쪼개진 원형의 컬러 CSS 주입
    const targetRgbStr = `rgb(${target.rgb.r}, ${target.rgb.g}, ${target.rgb.b})`;
    const guessRgbStr = `rgb(${guess.rgb.r}, ${guess.rgb.g}, ${guess.rgb.b})`;
    
    card.innerHTML = `
      <div class="round-main-info">
        <div class="round-summary">
          <span class="round-num">#${idx + 1}</span>
          <div class="split-circle">
            <div class="split-left" style="background-color: ${targetRgbStr};"></div>
            <div class="split-right" style="background-color: ${guessRgbStr};"></div>
          </div>
          <span class="round-score-val ${scoreClass}">${stat.score.toFixed(2)} / 10.0</span>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="accordion-arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div class="round-details-panel">
        <div class="detail-row">
          <span class="detail-lbl">정답 색상 (Target HSB)</span>
          <span class="detail-val">H:${target.h}° S:${target.s}% B:${target.b}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-lbl">나의 색상 (Your HSB)</span>
          <span class="detail-val">H:${guess.h}° S:${guess.s}% B:${guess.b}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-lbl">색차 분석 (CIEDE2000 ΔE)</span>
          <span class="detail-val">${stat.deltaE.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-lbl">오차 세부 통계</span>
          <span class="detail-val">
            H: <span class="${stat.deltaH === 0 ? 'val-ok' : (stat.deltaH > 0 ? 'val-plus' : 'val-minus')}">${stat.deltaH > 0 ? '+' : ''}${stat.deltaH}°</span> | 
            S: <span class="${stat.deltaS === 0 ? 'val-ok' : (stat.deltaS > 0 ? 'val-plus' : 'val-minus')}">${stat.deltaS > 0 ? '+' : ''}${stat.deltaS}%</span> | 
            B: <span class="${stat.deltaB === 0 ? 'val-ok' : (stat.deltaB > 0 ? 'val-plus' : 'val-minus')}">${stat.deltaB > 0 ? '+' : ''}${stat.deltaB}%</span>
          </span>
        </div>
      </div>
    `;
    
    // 클릭 이벤트 바인딩 (아코디언 토글)
    card.querySelector('.round-main-info').addEventListener('click', () => {
      card.classList.toggle('expanded');
      const arrow = card.querySelector('.accordion-arrow');
      if (card.classList.contains('expanded')) {
        arrow.style.transform = 'rotate(180deg)';
      } else {
        arrow.style.transform = 'rotate(0deg)';
      }
    });
    
    elements.resultRoundsList.appendChild(card);
  });
  
  // 4. 로컬 스토리지에 결과 세션 영구 저장
  saveRecord({
    date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    difficulty: state.difficulty.toUpperCase(),
    score: finalGrandScore,
    tier: finalGrandScore >= 28.50 ? 'S' : (finalGrandScore >= 27.00 ? 'A' : (finalGrandScore >= 24.00 ? 'B' : (finalGrandScore >= 18.00 ? 'C' : 'F')))
  });
  
  // 화면 전환
  showScreen('results');
  
  // 시작 화면 리더보드 동기화
  renderRecentRecords();
}

// ==========================================================================
// 5. 로컬스토리지 기록 관리 (Data Storage)
// ==========================================================================

/**
 * 새로운 게임 전적 세션 저장
 */
function saveRecord(record) {
  const records = getRecords();
  records.unshift(record); // 최신 순 정렬
  localStorage.setItem('dialed_color_records', JSON.stringify(records));
}

/**
 * 저장된 기록 가져오기
 */
function getRecords() {
  const data = localStorage.getItem('dialed_color_records');
  return data ? JSON.parse(data) : [];
}

/**
 * 첫 화면에 최근 전적 리더보드 노출
 */
function renderRecentRecords() {
  const records = getRecords();
  if (records.length === 0) {
    elements.startLeaderboard.classList.add('hidden');
    return;
  }
  
  elements.startLeaderboard.classList.remove('hidden');
  elements.recentRecordsList.innerHTML = '';
  
  // 최대 최근 3개 노출
  records.slice(0, 3).forEach(rec => {
    const row = document.createElement('div');
    row.className = 'record-row';
    row.innerHTML = `
      <span class="record-date">${rec.date}</span>
      <span class="record-diff">${rec.difficulty}</span>
      <span class="record-score">${rec.score.toFixed(2)}점 (${rec.tier}등급)</span>
    `;
    elements.recentRecordsList.appendChild(row);
  });
}

/**
 * 모달용 전체 전적 통계 대시보드 렌더링
 */
function renderStatsModal() {
  const records = getRecords();
  elements.statTotalGames.textContent = records.length;
  
  if (records.length === 0) {
    elements.statBestScore.textContent = '00.00';
    elements.statAvgScore.textContent = '00.00';
    elements.statsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">아직 도전 기록이 없습니다.</td></tr>`;
    return;
  }
  
  // 최고 점수 계산
  const bestScore = Math.max(...records.map(r => r.score));
  elements.statBestScore.textContent = bestScore.toFixed(2);
  
  // 평균 점수 계산
  const totalScoreSum = records.reduce((sum, r) => sum + r.score, 0);
  const avgScore = totalScoreSum / records.length;
  elements.statAvgScore.textContent = avgScore.toFixed(2);
  
  // 리더보드 테이블 렌더링 (최근 10회)
  elements.statsTableBody.innerHTML = '';
  records.slice(0, 10).forEach(rec => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rec.date}</td>
      <td><span style="font-size:0.75rem; font-weight:800; color:var(--color-secondary);">${rec.difficulty}</span></td>
      <td>${rec.score.toFixed(2)}</td>
      <td><span class="rating-badge ${rec.tier === 'S' ? 'tier-s' : (rec.tier === 'A' ? 'tier-a' : (rec.tier === 'B' ? 'tier-b' : (rec.tier === 'C' ? 'tier-c' : '')))}" style="padding:2px 8px; font-size:0.65rem;">${rec.tier}</span></td>
    `;
    elements.statsTableBody.appendChild(tr);
  });
}

/**
 * 통계 전체 데이터 삭제
 */
function clearStats() {
  if (confirm('정말로 모든 도전 기록을 초기화하시겠습니까? 데이터는 복구할 수 없습니다.')) {
    localStorage.removeItem('dialed_color_records');
    showToast('모든 전적 기록이 성공적으로 삭제되었습니다.');
    renderStatsModal();
    renderRecentRecords();
    elements.modalStats.classList.remove('active');
  }
}

// ==========================================================================
// 6. 소셜 미디어 바이럴 공유 & 토스트 피드백 (Social Share & Toast)
// ==========================================================================

/**
 * 클립보드 복사 공유 텍스트 빌더 및 복사 실행
 */
function shareResults() {
  const grandScore = parseFloat(elements.resultGrandScore.textContent);
  const diffStr = state.difficulty.toUpperCase();
  
  // 바이럴 이모지 블록 조합
  let emojiBlock = '';
  state.scores.forEach(stat => {
    if (stat.score >= 9.5) emojiBlock += '🟩';
    else if (stat.score >= 8.5) emojiBlock += '🟦';
    else if (stat.score >= 7.0) emojiBlock += '🟨';
    else if (stat.score >= 5.0) emojiBlock += '🟧';
    else emojiBlock += '🟥';
  });
  
  const shareText = `DIALED // COLOR CHALLENGE (${diffStr})\n최종 스코어: ${grandScore.toFixed(2)} / 30.00 만점\n결과 분석: ${emojiBlock}\n\n당신의 색상 복원 감각을 테스트해 보세요!\nPlay here: https://color-choice.vercel.app/`;
  
  navigator.clipboard.writeText(shareText).then(() => {
    showToast('공유용 분석 결과가 클립보드에 복사되었습니다! 소셜 미디어에 붙여넣기(Ctrl+V) 해보세요.');
  }).catch(err => {
    console.error('공유 텍스트 복사 실패:', err);
    showToast('클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.');
  });
}

/**
 * 커스텀 토스트 알림창 출력
 */
function showToast(message) {
  elements.toastContainer.innerHTML = '';
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 12 12 8 12"></polyline><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    <span>${message}</span>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  if (state.toastTimeout) clearTimeout(state.toastTimeout);
  state.toastTimeout = setTimeout(() => {
    toast.remove();
  }, 2800);
}

// ==========================================================================
// 7. 인터랙티브 썸 세부 튜닝 버튼 핸들러 (Fine-Tuning Controls)
// ==========================================================================
function bindFineTuningButtons() {
  document.querySelectorAll('.tune-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const control = e.currentTarget.getAttribute('data-control');
      const dir = parseInt(e.currentTarget.getAttribute('data-dir'));
      
      let inputEl = null;
      let step = 1;
      
      if (control === 'hue') {
        inputEl = elements.inputHue;
        step = 1; // 1도씩 조작
      } else if (control === 'sat') {
        inputEl = elements.inputSat;
        step = 1; // 1%씩 조작
      } else if (control === 'bri') {
        inputEl = elements.inputBri;
        step = 1; // 1%씩 조작
      }
      
      if (inputEl) {
        let val = parseInt(inputEl.value) + (dir * step);
        const min = parseInt(inputEl.min);
        const max = parseInt(inputEl.max);
        
        // Hue의 경우 360도를 순환(Wrap-around) 하도록 처리
        if (control === 'hue') {
          if (val < min) val = max - 1;
          if (val >= max) val = min;
        } else {
          val = Math.max(min, Math.min(max, val));
        }
        
        inputEl.value = val;
        updateGuessUI();
      }
    });
  });
}

/**
 * 난이도 선택에 따른 시작 화면의 동적 테마(색상, 테두리, 버튼) 변경
 */
function updateDifficultyTheme() {
  const activeRadio = document.querySelector('input[name="difficulty"]:checked');
  if (!activeRadio) return;
  const activeDifficulty = activeRadio.value;
  const container = document.querySelector('.app-container');
  if (container) {
    container.classList.remove('theme-easy', 'theme-normal', 'theme-hard');
    container.classList.add(`theme-${activeDifficulty}`);
  }
}

/**
 * 타이머 중단 및 게임 초기화 후 홈 화면(로비)으로 강제 리다이렉트
 */
function goToHome() {
  // 1. 진행 중인 타이머 및 requestAnimationFrame 완전 차단
  if (state.timerInterval) cancelAnimationFrame(state.timerInterval);
  if (state.timerTimeout) clearTimeout(state.timerTimeout);
  
  // 2. 게임 상태 초기화
  state.targetColors = [];
  state.userGuesses = [];
  state.scores = [];
  state.currentRoundIndex = 0;
  
  // 3. 로비로 이동 및 전적 갱신
  showScreen('start');
  renderRecentRecords();
}

// ==========================================================================
// 8. 초기 이벤트 바인딩 및 부팅
// ==========================================================================
function init() {
  // 이벤트 바인더
  elements.btnStart.addEventListener('click', startGame);
  elements.btnSubmit.addEventListener('click', submitColor);
  elements.btnRestart.addEventListener('click', startGame);
  elements.btnShare.addEventListener('click', shareResults);
  elements.logoHome.addEventListener('click', goToHome);
  
  // 모달 제어
  elements.btnShowStats.addEventListener('click', () => {
    renderStatsModal();
    elements.modalStats.classList.add('active');
  });
  
  elements.btnCloseStats.addEventListener('click', () => {
    elements.modalStats.classList.remove('active');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === elements.modalStats) {
      elements.modalStats.classList.remove('active');
    }
  });
  
  elements.btnClearStats.addEventListener('click', clearStats);
  
  // 슬라이더 조작 실시간 리스너 바인딩
  elements.inputHue.addEventListener('input', updateGuessUI);
  elements.inputSat.addEventListener('input', updateGuessUI);
  elements.inputBri.addEventListener('input', updateGuessUI);
  
  // 세부 조정 버튼 바인딩
  bindFineTuningButtons();
  
  // 첫 화면 기록 불러오기 및 렌더링
  renderRecentRecords();
  
  // 난이도 라디오 변경 이벤트 리스너 바인딩 및 초기 테마 렌더링
  document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', updateDifficultyTheme);
  });
  updateDifficultyTheme();
}

// 부팅 시작
document.addEventListener('DOMContentLoaded', init);
