const path = require('path');
const fs = require('fs');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'pathnotaken.db');
let db;

async function init() {
  db = await sqlite.open({ filename: DB_PATH, driver: sqlite3.Database });

  await db.exec(`PRAGMA journal_mode = WAL;`);

  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    passwordHash TEXT,
    createdAt TEXT
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    ownerId TEXT,
    careerId TEXT,
    title TEXT,
    weeks TEXT,
    createdAt TEXT,
    FOREIGN KEY(ownerId) REFERENCES users(id)
  );`);

  // Gamification table
  await db.exec(`CREATE TABLE IF NOT EXISTS user_gamification (
    userId TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streakDays INTEGER DEFAULT 0,
    lastActivityDate TEXT,
    tasksCompleted INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]',
    statistics TEXT DEFAULT '{}',
    FOREIGN KEY(userId) REFERENCES users(id)
  );`);

  // Portfolio projects table
  await db.exec(`CREATE TABLE IF NOT EXISTS portfolio_projects (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT,
    description TEXT,
    skills TEXT,
    githubUrl TEXT,
    liveUrl TEXT,
    imageUrl TEXT,
    completedAt TEXT,
    visibility TEXT DEFAULT 'public',
    FOREIGN KEY(userId) REFERENCES users(id)
  );`);

  // Skill tracking table
  await db.exec(`CREATE TABLE IF NOT EXISTS user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    skillId TEXT,
    proficiency INTEGER DEFAULT 1,
    lastPracticedAt TEXT,
    totalPracticeHours REAL DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  );`);

  // Career exploration history
  await db.exec(`CREATE TABLE IF NOT EXISTS career_explorations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    careerId TEXT,
    exploredAt TEXT,
    matchScore INTEGER,
    bookmarked INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  );`);

  // migrate existing users.json -> users table (if any)
  const usersJson = path.join(__dirname, 'data', 'users.json');
  if (fs.existsSync(usersJson)) {
    try {
      const raw = fs.readFileSync(usersJson, 'utf8') || '{}';
      const users = JSON.parse(raw || '{}');
      for (const u of Object.values(users)) {
        try {
          await db.run('INSERT OR IGNORE INTO users (id,email,name,passwordHash,createdAt) VALUES (?,?,?,?,?)', u.id, u.email, u.name || null, u.passwordHash || null, u.createdAt || new Date().toISOString());
        } catch (e) { /* ignore */ }
      }
    } catch (e) { console.error('user migration failed', e); }
  }

  // migrate roadmaps.json -> roadmaps table
  const roadmapsJson = path.join(__dirname, 'data', 'roadmaps.json');
  if (fs.existsSync(roadmapsJson)) {
    try {
      const raw = fs.readFileSync(roadmapsJson, 'utf8') || '{}';
      const items = JSON.parse(raw || '{}');
      for (const r of Object.values(items)) {
        try {
          await db.run('INSERT OR IGNORE INTO roadmaps (id,ownerId,careerId,title,weeks,createdAt) VALUES (?,?,?,?,?,?)', r.id, r.ownerId || null, r.careerId, r.title || null, JSON.stringify(r.weeks || []), r.createdAt || new Date().toISOString());
        } catch (e) { /* ignore */ }
      }
    } catch (e) { console.error('roadmap migration failed', e); }
  }
}

// initialize immediately
init().catch((err) => {
  console.error('Failed to initialize database', err);
});

module.exports = {
  get: (...args) => db.get(...args),
  all: (...args) => db.all(...args),
  run: (...args) => db.run(...args),
  exec: (...args) => db.exec(...args),
  rawDb: () => db,
};
