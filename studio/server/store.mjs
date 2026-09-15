import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export class Store {
  constructor(path) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    this.db
      .exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, profile TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS logins (token TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), request_id TEXT NOT NULL, state TEXT NOT NULL, UNIQUE(user_id,request_id));
      CREATE TABLE IF NOT EXISTS evidence (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), session_id TEXT REFERENCES sessions(id), action_id TEXT NOT NULL, payload TEXT NOT NULL, UNIQUE(session_id,action_id));
      CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), session_id TEXT REFERENCES sessions(id), payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS plans (user_id TEXT PRIMARY KEY REFERENCES users(id), payload TEXT NOT NULL);
      PRAGMA user_version=1;`);
    for (const row of this.db.prepare('SELECT id,state FROM sessions').all()) {
      const state = JSON.parse(row.state);
      if (state.status === 'running')
        this.saveSession({
          ...state,
          status: 'interrupted',
          error: 'Your work is saved. Resume to continue after the restart.',
        });
    }
  }
  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }
  createUser(email, password, profile) {
    const id = randomUUID();
    this.db
      .prepare('INSERT INTO users VALUES (?,?,?,?)')
      .run(id, email, password, JSON.stringify(profile));
    return { id, ...profile };
  }
  userByEmail(email) {
    return this.db.prepare('SELECT * FROM users WHERE email=?').get(email);
  }
  user(id) {
    const r = this.db
      .prepare('SELECT id,profile FROM users WHERE id=?')
      .get(id);
    return r ? { id: r.id, ...JSON.parse(r.profile) } : null;
  }
  login(token, userId, expires) {
    this.db.prepare('DELETE FROM logins WHERE expires < ?').run(Date.now());
    this.db
      .prepare('INSERT INTO logins VALUES (?,?,?)')
      .run(token, userId, expires);
  }
  authenticate(token) {
    const r = this.db
      .prepare('SELECT user_id FROM logins WHERE token=? AND expires>?')
      .get(token, Date.now());
    return r ? this.user(r.user_id) : null;
  }
  logout(token) {
    this.db.prepare('DELETE FROM logins WHERE token=?').run(token);
  }
  session(id, userId) {
    const r = this.db
      .prepare('SELECT state FROM sessions WHERE id=? AND user_id=?')
      .get(id, userId);
    return r ? JSON.parse(r.state) : null;
  }
  sessions(userId) {
    return this.db
      .prepare(
        'SELECT state FROM sessions WHERE user_id=? ORDER BY rowid DESC LIMIT 30',
      )
      .all(userId)
      .map((r) => JSON.parse(r.state));
  }
  byRequest(userId, requestId) {
    const r = this.db
      .prepare('SELECT state FROM sessions WHERE user_id=? AND request_id=?')
      .get(userId, requestId);
    return r ? JSON.parse(r.state) : null;
  }
  saveSession(state) {
    this.db
      .prepare(
        'INSERT INTO sessions VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state',
      )
      .run(state.id, state.userId, state.requestId, JSON.stringify(state));
    return state;
  }
  question(id, userId) {
    const r = this.db
      .prepare('SELECT payload FROM questions WHERE id=? AND user_id=?')
      .get(id, userId);
    return r ? JSON.parse(r.payload) : null;
  }
  saveQuestion(question, userId) {
    this.db
      .prepare('INSERT INTO questions VALUES (?,?,?)')
      .run(question.id, userId, JSON.stringify(question));
    return question;
  }
  addEvidence(session, action) {
    const existing = this.db
      .prepare(
        'SELECT payload FROM evidence WHERE session_id=? AND action_id=?',
      )
      .get(session.id, action.actionId);
    if (existing)
      return { duplicate: true, evidence: JSON.parse(existing.payload) };
    const evidence = {
      id: randomUUID(),
      at: new Date().toISOString(),
      ...action,
      skillId: session.activity?.skillId,
      problemId: session.activity?.problemId,
      assistanceBeforeAttempt: session.assisted,
      curriculumVersion: session.curriculumVersion,
    };
    this.db
      .prepare('INSERT INTO evidence VALUES (?,?,?,?,?)')
      .run(
        evidence.id,
        session.userId,
        session.id,
        action.actionId,
        JSON.stringify(evidence),
      );
    return { duplicate: false, evidence };
  }
  evidenceByAction(sessionId, actionId, userId) {
    const r = this.db
      .prepare(
        'SELECT payload FROM evidence WHERE session_id=? AND action_id=? AND user_id=?',
      )
      .get(sessionId, actionId, userId);
    return r ? JSON.parse(r.payload) : null;
  }
  evidence(userId, skillId, limit = 40) {
    return this.db
      .prepare(
        'SELECT payload FROM evidence WHERE user_id=? ORDER BY rowid DESC LIMIT 400',
      )
      .all(userId)
      .map((r) => JSON.parse(r.payload))
      .filter((e) => !skillId || e.skillId === skillId)
      .slice(0, limit);
  }
  evidenceById(id, userId) {
    const r = this.db
      .prepare('SELECT payload FROM evidence WHERE id=? AND user_id=?')
      .get(id, userId);
    return r ? JSON.parse(r.payload) : null;
  }
  observations(userId) {
    return this.db
      .prepare(
        'SELECT payload FROM observations WHERE user_id=? ORDER BY rowid DESC LIMIT 100',
      )
      .all(userId)
      .map((r) => JSON.parse(r.payload));
  }
  observe(session, observation, toolCallId) {
    const id = `${session.id}:${toolCallId}`;
    const record = {
      ...observation,
      id,
      at: new Date().toISOString(),
      reviewAt: new Date(
        Date.now() + observation.revisitInDays * 86400000,
      ).toISOString(),
    };
    this.db
      .prepare('INSERT OR IGNORE INTO observations VALUES (?,?,?,?)')
      .run(id, session.userId, session.id, JSON.stringify(record));
    return record;
  }
  plan(userId) {
    const r = this.db
      .prepare('SELECT payload FROM plans WHERE user_id=?')
      .get(userId);
    return r ? JSON.parse(r.payload) : null;
  }
  savePlan(userId, plan) {
    this.db
      .prepare(
        'INSERT INTO plans VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload',
      )
      .run(userId, JSON.stringify({ ...plan, at: new Date().toISOString() }));
  }
  close() {
    this.db.close();
  }
}
