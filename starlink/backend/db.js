import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'starlink.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    likes TEXT NOT NULL DEFAULT '[]',
    dislikes TEXT NOT NULL DEFAULT '[]',
    current_feeling TEXT,
    skills_offer TEXT NOT NULL DEFAULT '[]',
    skills_need TEXT NOT NULL DEFAULT '[]',
    star_brightness REAL DEFAULT 1.0,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    position_z REAL NOT NULL,
    created_at TEXT NOT NULL,
    is_demo INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    user_a_id TEXT NOT NULL,
    user_b_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    shared_likes TEXT DEFAULT '[]',
    shared_dislikes TEXT DEFAULT '[]',
    skill_match INTEGER DEFAULT 0,
    skill_match_details TEXT DEFAULT '{}',
    spark TEXT DEFAULT '{}',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exchanges (
    id TEXT PRIMARY KEY,
    proposer_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    proposer_gives TEXT NOT NULL,
    receiver_gives TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    location TEXT,
    time_slot TEXT,
    rating_proposer TEXT,
    rating_receiver TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cohorts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    access_code TEXT UNIQUE NOT NULL,
    organizer_name TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cohort_members (
    cohort_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at TEXT NOT NULL,
    PRIMARY KEY (cohort_id, user_id)
  );
`);

// --- User helpers ---

function parseUserJSON(user) {
  if (!user) return null;
  return {
    ...user,
    likes: JSON.parse(user.likes || '[]'),
    dislikes: JSON.parse(user.dislikes || '[]'),
    skills_offer: JSON.parse(user.skills_offer || '[]'),
    skills_need: JSON.parse(user.skills_need || '[]'),
    is_demo: user.is_demo === 1,
  };
}

function parseConnectionJSON(conn) {
  if (!conn) return null;
  return {
    ...conn,
    shared_likes: JSON.parse(conn.shared_likes || '[]'),
    shared_dislikes: JSON.parse(conn.shared_dislikes || '[]'),
    skill_match_details: JSON.parse(conn.skill_match_details || '{}'),
    spark: JSON.parse(conn.spark || '{}'),
    skill_match: conn.skill_match === 1,
  };
}

export function getAllUsers() {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return rows.map(parseUserJSON);
}

export function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return parseUserJSON(row);
}

export function createUser(data) {
  const stmt = db.prepare(`
    INSERT INTO users (id, name, avatar_color, likes, dislikes, current_feeling,
      skills_offer, skills_need, star_brightness, position_x, position_y, position_z,
      created_at, is_demo)
    VALUES (@id, @name, @avatar_color, @likes, @dislikes, @current_feeling,
      @skills_offer, @skills_need, @star_brightness, @position_x, @position_y, @position_z,
      @created_at, @is_demo)
  `);

  stmt.run({
    ...data,
    likes: JSON.stringify(data.likes || []),
    dislikes: JSON.stringify(data.dislikes || []),
    skills_offer: JSON.stringify(data.skills_offer || []),
    skills_need: JSON.stringify(data.skills_need || []),
    star_brightness: data.star_brightness ?? 1.0,
    is_demo: data.is_demo ? 1 : 0,
  });

  return getUserById(data.id);
}

// --- Connection helpers ---

export function getAllConnections() {
  const rows = db.prepare('SELECT * FROM connections ORDER BY score DESC').all();
  return rows.map(parseConnectionJSON);
}

export function getConnectionsByUserId(userId) {
  const rows = db.prepare(`
    SELECT c.*,
      ua.name as user_a_name, ua.avatar_color as user_a_color,
      ua.likes as user_a_likes, ua.skills_offer as user_a_skills_offer,
      ua.skills_need as user_a_skills_need, ua.current_feeling as user_a_feeling,
      ub.name as user_b_name, ub.avatar_color as user_b_color,
      ub.likes as user_b_likes, ub.skills_offer as user_b_skills_offer,
      ub.skills_need as user_b_skills_need, ub.current_feeling as user_b_feeling
    FROM connections c
    JOIN users ua ON c.user_a_id = ua.id
    JOIN users ub ON c.user_b_id = ub.id
    WHERE c.user_a_id = ? OR c.user_b_id = ?
    ORDER BY c.score DESC
  `).all(userId, userId);

  return rows.map(row => ({
    ...parseConnectionJSON(row),
    user_a: {
      id: row.user_a_id,
      name: row.user_a_name,
      avatar_color: row.user_a_color,
      likes: JSON.parse(row.user_a_likes || '[]'),
      skills_offer: JSON.parse(row.user_a_skills_offer || '[]'),
      skills_need: JSON.parse(row.user_a_skills_need || '[]'),
      current_feeling: row.user_a_feeling,
    },
    user_b: {
      id: row.user_b_id,
      name: row.user_b_name,
      avatar_color: row.user_b_color,
      likes: JSON.parse(row.user_b_likes || '[]'),
      skills_offer: JSON.parse(row.user_b_skills_offer || '[]'),
      skills_need: JSON.parse(row.user_b_skills_need || '[]'),
      current_feeling: row.user_b_feeling,
    },
  }));
}

export function getConnectionById(id) {
  const row = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
  return parseConnectionJSON(row);
}

export function createConnection(data) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO connections
      (id, user_a_id, user_b_id, score, shared_likes, shared_dislikes,
       skill_match, skill_match_details, spark, created_at)
    VALUES
      (@id, @user_a_id, @user_b_id, @score, @shared_likes, @shared_dislikes,
       @skill_match, @skill_match_details, @spark, @created_at)
  `);

  stmt.run({
    ...data,
    shared_likes: JSON.stringify(data.shared_likes || []),
    shared_dislikes: JSON.stringify(data.shared_dislikes || []),
    skill_match: data.skill_match ? 1 : 0,
    skill_match_details: JSON.stringify(data.skill_match_details || {}),
    spark: JSON.stringify(data.spark || {}),
  });

  return getConnectionById(data.id);
}

export function getConnectionBetween(aId, bId) {
  const row = db.prepare(`
    SELECT * FROM connections
    WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)
  `).get(aId, bId, bId, aId);
  return parseConnectionJSON(row);
}

// --- Exchange helpers ---

export function createExchange(data) {
  const stmt = db.prepare(`
    INSERT INTO exchanges
      (id, proposer_id, receiver_id, proposer_gives, receiver_gives,
       status, location, time_slot, rating_proposer, rating_receiver, created_at)
    VALUES
      (@id, @proposer_id, @receiver_id, @proposer_gives, @receiver_gives,
       @status, @location, @time_slot, @rating_proposer, @rating_receiver, @created_at)
  `);

  stmt.run({
    status: 'pending',
    location: null,
    time_slot: null,
    rating_proposer: null,
    rating_receiver: null,
    ...data,
  });

  return db.prepare('SELECT * FROM exchanges WHERE id = ?').get(data.id);
}

export function updateExchange(id, data) {
  const allowed = ['status', 'location', 'time_slot', 'rating_proposer', 'rating_receiver'];
  const updates = Object.keys(data)
    .filter(k => allowed.includes(k))
    .map(k => `${k} = @${k}`)
    .join(', ');

  if (!updates) return db.prepare('SELECT * FROM exchanges WHERE id = ?').get(id);

  db.prepare(`UPDATE exchanges SET ${updates} WHERE id = @id`).run({ ...data, id });
  return db.prepare('SELECT * FROM exchanges WHERE id = ?').get(id);
}

export function getExchangesByProposerId(proposerId, since) {
  return db.prepare(
    'SELECT * FROM exchanges WHERE proposer_id = ? AND created_at >= ?'
  ).all(proposerId, since);
}

// --- Stats ---

export function getStats() {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalConnections = db.prepare('SELECT COUNT(*) as count FROM connections').get().count;
  const totalExchanges = db.prepare('SELECT COUNT(*) as count FROM exchanges').get().count;
  const completedExchanges = db.prepare(
    "SELECT COUNT(*) as count FROM exchanges WHERE status = 'completed'"
  ).get().count;

  const avgScore = db.prepare('SELECT AVG(score) as avg FROM connections').get().avg || 0;

  const feelingCounts = db.prepare(`
    SELECT current_feeling, COUNT(*) as count
    FROM users
    WHERE current_feeling IS NOT NULL
    GROUP BY current_feeling
    ORDER BY count DESC
  `).all();

  const topConnections = db.prepare(`
    SELECT c.*, ua.name as user_a_name, ub.name as user_b_name
    FROM connections c
    JOIN users ua ON c.user_a_id = ua.id
    JOIN users ub ON c.user_b_id = ub.id
    ORDER BY c.score DESC
    LIMIT 5
  `).all().map(row => ({
    ...parseConnectionJSON(row),
    user_a_name: row.user_a_name,
    user_b_name: row.user_b_name,
  }));

  const skillDemand = db.prepare('SELECT skills_need FROM users').all()
    .flatMap(row => JSON.parse(row.skills_need || '[]'))
    .reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const topSkillsNeeded = Object.entries(skillDemand)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  return {
    total_users: totalUsers,
    total_connections: totalConnections,
    total_exchanges: totalExchanges,
    completed_exchanges: completedExchanges,
    avg_connection_score: Math.round(avgScore * 100) / 100,
    feeling_distribution: feelingCounts,
    top_connections: topConnections,
    top_skills_needed: topSkillsNeeded,
  };
}

export function deleteAllDemoData() {
  // Get demo user IDs
  const demoUsers = db.prepare('SELECT id FROM users WHERE is_demo = 1').all();
  const ids = demoUsers.map(u => u.id);

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(', ');
    db.prepare(`DELETE FROM cohort_members WHERE user_id IN (${placeholders})`).run(...ids);
    db.prepare(`DELETE FROM connections WHERE user_a_id IN (${placeholders}) OR user_b_id IN (${placeholders})`).run(...ids, ...ids);
    db.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).run(...ids);
  }

  // Also clear demo cohorts so they can be re-seeded cleanly
  db.prepare(`DELETE FROM cohorts WHERE access_code IN ('HACK25', 'CS540S', 'SELL3F')`).run();
}

// --- Cohort helpers ---

export function getCohorts() {
  return db.prepare(`
    SELECT c.*, COUNT(cm.user_id) as member_count
    FROM cohorts c
    LEFT JOIN cohort_members cm ON c.id = cm.cohort_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();
}

export function getCohortById(id) {
  return db.prepare('SELECT * FROM cohorts WHERE id = ?').get(id);
}

export function getCohortByCode(code) {
  return db.prepare('SELECT * FROM cohorts WHERE access_code = ?').get(code);
}

export function createCohort(data) {
  db.prepare(`
    INSERT INTO cohorts (id, name, description, access_code, organizer_name, created_at)
    VALUES (@id, @name, @description, @access_code, @organizer_name, @created_at)
  `).run(data);
  return getCohortById(data.id);
}

export function addCohortMember(cohortId, userId) {
  db.prepare(`
    INSERT OR IGNORE INTO cohort_members (cohort_id, user_id, joined_at)
    VALUES (?, ?, ?)
  `).run(cohortId, userId, new Date().toISOString());
}

export function getCohortMembers(cohortId) {
  const rows = db.prepare(`
    SELECT u.*
    FROM users u
    JOIN cohort_members cm ON u.id = cm.user_id
    WHERE cm.cohort_id = ?
    ORDER BY cm.joined_at ASC
  `).all(cohortId);
  return rows.map(parseUserJSON);
}

export function getCohortConnections(cohortId) {
  const rows = db.prepare(`
    SELECT c.*
    FROM connections c
    WHERE c.user_a_id IN (SELECT user_id FROM cohort_members WHERE cohort_id = ?)
      AND c.user_b_id IN (SELECT user_id FROM cohort_members WHERE cohort_id = ?)
    ORDER BY c.score DESC
  `).all(cohortId, cohortId);
  return rows.map(parseConnectionJSON);
}

export default db;
