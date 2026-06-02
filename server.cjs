const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// ── 유저별 인메모리 락 (더블클릭 / 중복 요청 방지) ──────────────────
const activeLocks = new Set();

// ── 미들웨어: 토큰으로 유저 조회 or 생성 ────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: '인증 토큰이 필요합니다.' });

  let user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
  if (!user) {
    db.prepare('INSERT INTO users (token, points) VALUES (?, 10000)').run(token);
    user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
  }
  req.user = user;
  next();
}

// ── GET /api/user : 포인트 잔액 + 최근 당첨내역 ──────────────────────
app.get('/api/user', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const history = db.prepare(`
    SELECT wh.won_at, r.name, r.label, r.color
    FROM win_history wh
    JOIN rewards r ON wh.reward_id = r.id
    WHERE wh.user_id = ?
    ORDER BY wh.won_at DESC
    LIMIT 20
  `).all(req.user.id);
  res.json({ points: user.points, history });
});

// ── POST /api/roulette : 룰렛 돌리기 ─────────────────────────────────
app.post('/api/roulette', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const SPIN_COST = 10;

  // 1. 중복 요청 락 체크
  if (activeLocks.has(userId)) {
    return res.status(429).json({ error: '이미 룰렛이 돌아가는 중입니다.' });
  }
  activeLocks.add(userId);

  try {
    // 2. 포인트 잔액 확인
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (user.points < SPIN_COST) {
      return res.status(400).json({ error: '포인트가 부족합니다.' });
    }

    // 3. 이번 주 고가 경품 당첨 횟수 조회 후 경품 필터링
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const allRewards = db.prepare('SELECT * FROM rewards').all();
    const eligibleRewards = allRewards.filter(r => {
      if (r.weekly_limit >= 9999) return true;
      const wonThisWeek = db.prepare(`
        SELECT COUNT(*) as cnt FROM win_history
        WHERE reward_id = ? AND won_at > ?
      `).get(r.id, weekAgo);
      return wonThisWeek.cnt < r.weekly_limit;
    });

    // 4. 가중치 기반 랜덤 당첨 결정
    const totalProb = eligibleRewards.reduce((sum, r) => sum + r.probability, 0);
    let rand = Math.random() * totalProb;
    let selected = eligibleRewards[eligibleRewards.length - 1]; // 폴백: 마지막
    for (const reward of eligibleRewards) {
      rand -= reward.probability;
      if (rand <= 0) { selected = reward; break; }
    }

    // 5. DB 트랜잭션: 포인트 차감 + (포인트 경품이면 가산) + 이력 저장
    const spinTransaction = db.transaction(() => {
      const newPoints = user.points - SPIN_COST + selected.points_value;
      db.prepare('UPDATE users SET points = ? WHERE id = ?').run(newPoints, userId);
      db.prepare('INSERT INTO win_history (user_id, reward_id) VALUES (?, ?)').run(userId, selected.id);
    });
    spinTransaction();

    // 6. 당첨 결과 반환 (룰렛의 몇 번째 칸인지 인덱스 포함)
    const rewardIndex = allRewards.findIndex(r => r.id === selected.id);
    const updatedUser = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
    res.json({ reward: selected, rewardIndex, newPoints: updatedUser.points });

  } finally {
    activeLocks.delete(userId);
  }
});

// ── POST /api/user/reset : 테스트용 포인트 리셋 ─────────────────────
app.post('/api/user/reset', authMiddleware, (req, res) => {
  db.prepare('UPDATE users SET points = 10000 WHERE id = ?').run(req.user.id);
  res.json({ points: 10000 });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`✅ 서버 실행 중: http://localhost:${PORT}`));
