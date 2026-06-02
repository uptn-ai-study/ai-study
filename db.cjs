const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'roulette.db'));

// WAL 모드: 동시 읽기 성능 향상
db.pragma('journal_mode = WAL');

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    points INTEGER NOT NULL DEFAULT 10000,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    probability REAL NOT NULL,
    weekly_limit INTEGER NOT NULL DEFAULT 9999,
    points_value INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS win_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    won_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
  );
`);

// 경품 데이터 시딩 (이미 있으면 스킵)
const rewardCount = db.prepare('SELECT COUNT(*) as cnt FROM rewards').get();
if (rewardCount.cnt === 0) {
  const insertReward = db.prepare(
    'INSERT INTO rewards (name, label, color, probability, weekly_limit, points_value) VALUES (?, ?, ?, ?, ?, ?)'
  );
  // 확률 합계 = 1.0
  insertReward.run('꽝',         '꽝',           '#374151', 0.55, 9999, 0);
  insertReward.run('포인트 +5',  '+5P',          '#6366f1', 0.20, 9999, 5);
  insertReward.run('포인트 +10', '+10P',         '#8b5cf6', 0.12, 9999, 10);
  insertReward.run('포인트 +20', '+20P',         '#a78bfa', 0.07, 9999, 20);
  insertReward.run('편의점 커피', '☕ 커피',      '#f59e0b', 0.04, 5,    0);
  insertReward.run('스타벅스 1잔','⭐ 스벅',     '#10b981', 0.015, 2,   0);
  insertReward.run('치킨 기프티콘','🍗 치킨',   '#ef4444', 0.005, 1,    0);
}

module.exports = db;
