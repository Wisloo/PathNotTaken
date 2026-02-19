/**
 * Database abstraction layer — supports both SQLite (local dev) and PostgreSQL (production).
 *
 * Behaviour:
 *   • If DATABASE_URL env var is set (starts with "postgres"), use pg (PostgreSQL).
 *   • Otherwise fall back to SQLite file at data/pathnotaken.db.
 *
 * Exports a uniform API so route files don't need to care which driver is active:
 *   db.get(sql, ...params)   → first matching row or undefined
 *   db.all(sql, ...params)   → array of rows
 *   db.run(sql, ...params)   → { changes, lastID }
 *   db.exec(sql)             → run raw DDL / multi-statement SQL
 */

const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_PG = DATABASE_URL.startsWith('postgres');

/* ------------------------------------------------------------------ */
/*  PostgreSQL adapter                                                */
/* ------------------------------------------------------------------ */
function createPgAdapter() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });

  /** Convert `?` placeholders → $1, $2, … */
  function rewrite(sql) {
    let idx = 0;
    return sql.replace(/\?/g, () => `$${++idx}`);
  }

  return {
    async get(sql, ...params) {
      const { rows } = await pool.query(rewrite(sql), params);
      return rows[0];
    },
    async all(sql, ...params) {
      const { rows } = await pool.query(rewrite(sql), params);
      return rows;
    },
    async run(sql, ...params) {
      const res = await pool.query(rewrite(sql), params);
      return { changes: res.rowCount, lastID: null };
    },
    async exec(sql) {
      await pool.query(sql);
    },
    async close() {
      await pool.end();
    },
    pool,
  };
}

/* ------------------------------------------------------------------ */
/*  SQLite adapter (local development)                                */
/* ------------------------------------------------------------------ */
async function createSqliteAdapter() {
  const sqlite = require('sqlite');
  const sqlite3 = require('sqlite3');
  const DB_PATH = path.join(__dirname, '..', 'data', 'pathnotaken.db');

  const raw = await sqlite.open({ filename: DB_PATH, driver: sqlite3.Database });
  await raw.exec('PRAGMA journal_mode = WAL;');

  return {
    get: (...args) => raw.get(...args),
    all: (...args) => raw.all(...args),
    run: (...args) => raw.run(...args),
    exec: (...args) => raw.exec(...args),
    async close() { await raw.close(); },
    rawDb: raw,
  };
}

/* ------------------------------------------------------------------ */
/*  Schema creation + migration                                       */
/* ------------------------------------------------------------------ */
async function migrate(db) {
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    "passwordHash" TEXT,
    "createdAt" TEXT
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    "ownerId" TEXT,
    "careerId" TEXT,
    title TEXT,
    weeks TEXT,
    "createdAt" TEXT
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS user_gamification (
    "userId" TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    "streakDays" INTEGER DEFAULT 0,
    "lastActivityDate" TEXT,
    "tasksCompleted" INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]',
    statistics TEXT DEFAULT '{}'
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS portfolio_projects (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    title TEXT,
    description TEXT,
    skills TEXT,
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "imageUrl" TEXT,
    "completedAt" TEXT,
    visibility TEXT DEFAULT 'public'
  );`);

  // Auto-increment tables differ per driver
  if (IS_PG) {
    await db.exec(`CREATE TABLE IF NOT EXISTS user_skills (
      id SERIAL PRIMARY KEY,
      "userId" TEXT,
      "skillId" TEXT,
      proficiency INTEGER DEFAULT 1,
      "lastPracticedAt" TEXT,
      "totalPracticeHours" REAL DEFAULT 0
    );`);

    await db.exec(`CREATE TABLE IF NOT EXISTS career_explorations (
      id SERIAL PRIMARY KEY,
      "userId" TEXT,
      "careerId" TEXT,
      "exploredAt" TEXT,
      "matchScore" INTEGER,
      bookmarked INTEGER DEFAULT 0
    );`);
  } else {
    await db.exec(`CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      skillId TEXT,
      proficiency INTEGER DEFAULT 1,
      lastPracticedAt TEXT,
      totalPracticeHours REAL DEFAULT 0
    );`);

    await db.exec(`CREATE TABLE IF NOT EXISTS career_explorations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      careerId TEXT,
      exploredAt TEXT,
      matchScore INTEGER,
      bookmarked INTEGER DEFAULT 0
    );`);
  }

  // ---------- Legacy JSON migration (SQLite only / first run) ----------
  if (!IS_PG) {
    const usersJson = path.join(__dirname, 'data', 'users.json');
    if (fs.existsSync(usersJson)) {
      try {
        const raw = fs.readFileSync(usersJson, 'utf8') || '{}';
        const users = JSON.parse(raw || '{}');
        for (const u of Object.values(users)) {
          try {
            await db.run(
              'INSERT OR IGNORE INTO users (id,email,name,passwordHash,createdAt) VALUES (?,?,?,?,?)',
              u.id, u.email, u.name || null, u.passwordHash || null, u.createdAt || new Date().toISOString()
            );
          } catch (e) { /* ignore duplicates */ }
        }
      } catch (e) { console.error('user migration failed', e); }
    }

    const roadmapsJson = path.join(__dirname, 'data', 'roadmaps.json');
    if (fs.existsSync(roadmapsJson)) {
      try {
        const raw = fs.readFileSync(roadmapsJson, 'utf8') || '{}';
        const items = JSON.parse(raw || '{}');
        for (const r of Object.values(items)) {
          try {
            await db.run(
              'INSERT OR IGNORE INTO roadmaps (id,ownerId,careerId,title,weeks,createdAt) VALUES (?,?,?,?,?,?)',
              r.id, r.ownerId || null, r.careerId, r.title || null, JSON.stringify(r.weeks || []), r.createdAt || new Date().toISOString()
            );
          } catch (e) { /* ignore duplicates */ }
        }
      } catch (e) { console.error('roadmap migration failed', e); }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Initialisation — deferred-proxy so callers can require() sync     */
/* ------------------------------------------------------------------ */
let dbInstance = null;
let initPromise = null;

function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      if (IS_PG) {
        console.log('🐘 Using PostgreSQL via DATABASE_URL');
        dbInstance = createPgAdapter();
      } else {
        console.log('🗄️  Using SQLite (local development)');
        dbInstance = await createSqliteAdapter();
      }
      await migrate(dbInstance);
    })();
  }
  return initPromise;
}

// Kick off init immediately
ensureInit().catch((err) => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});

module.exports = {
  get:   async (...args) => { await ensureInit(); return dbInstance.get(...args); },
  all:   async (...args) => { await ensureInit(); return dbInstance.all(...args); },
  run:   async (...args) => { await ensureInit(); return dbInstance.run(...args); },
  exec:  async (...args) => { await ensureInit(); return dbInstance.exec(...args); },
  close: async ()        => { if (dbInstance) await dbInstance.close(); },
  /** @returns {'pg'|'sqlite'} */
  get driver() { return IS_PG ? 'pg' : 'sqlite'; },
};
