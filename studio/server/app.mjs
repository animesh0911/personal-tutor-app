import express from 'express';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { promisify } from 'node:util';
import {
  Account,
  Login,
  StartSession,
  StudentAction,
} from '../shared/contracts.mjs';
import { catalog } from './curriculum.mjs';
import { AppError } from './tutor.mjs';

const scrypt = promisify(scryptCallback);
const digest = (token) => createHash('sha256').update(token).digest('hex');
function tokenOf(req) {
  return (
    req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('studio_session='))
      ?.slice(15) || ''
  );
}
async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${Buffer.from(await scrypt(password, salt, 64)).toString('hex')}`;
}
async function passwordMatches(password, hash) {
  const [salt, key] = hash.split(':');
  const actual = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(key, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createApp({ store, tutor, origin, secureCookies = false }) {
  const app = express();
  app.disable('x-powered-by');
  const validOrigin = new URL(origin);
  app.use('/api', (req, res, next) => {
    res.set({
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
    });
    if (req.headers.host !== validOrigin.host)
      return res.status(403).json({ error: 'Unrecognized host.' });
    if (
      !['GET', 'HEAD'].includes(req.method) &&
      req.headers.origin !== validOrigin.origin
    )
      return res
        .status(403)
        .json({ error: 'Please open the studio directly and try again.' });
    next();
  });
  app.use('/api', express.json({ limit: '24kb' }));
  const authAttempts = new Map();
  function authLimit(req, res, next) {
    const now = Date.now(),
      key = req.socket.remoteAddress;
    for (const [ip, entry] of authAttempts)
      if (entry.until < now) authAttempts.delete(ip);
    const record = authAttempts.get(key) || { count: 0, until: now + 600000 };
    record.count++;
    authAttempts.set(key, record);
    if (record.count > 20)
      return res
        .status(429)
        .json({ error: 'Too many sign-in attempts. Please wait ten minutes.' });
    next();
  }
  function auth(req, _res, next) {
    req.user = store.authenticate(digest(tokenOf(req)));
    if (!req.user) throw new AppError(401, 'Please sign in to continue.');
    next();
  }
  function signIn(res, user) {
    const token = randomBytes(32).toString('hex');
    store.login(digest(token), user.id, Date.now() + 7 * 86400000);
    res.cookie('studio_session', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: secureCookies,
      path: '/',
      maxAge: 7 * 86400000,
    });
  }
  app.get('/api/health', (_req, res) => res.json(tutor.health()));
  app.get('/api/bootstrap', (req, res) => {
    const user = store.authenticate(digest(tokenOf(req)));
    res.json({
      user,
      catalog,
      connection: tutor.health(),
      dashboard: user ? tutor.dashboard(user.id) : null,
    });
  });
  app.post('/api/register', authLimit, async (req, res) => {
    const { email, password, ...profile } = Account.parse(req.body);
    const hash = await passwordHash(password);
    let user;
    try {
      user = store.createUser(email, hash, profile);
    } catch (e) {
      if (e.code === 'ERR_SQLITE_ERROR' && e.message.includes('UNIQUE'))
        throw new AppError(
          409,
          'That email is already registered. Sign in instead.',
        );
      throw e;
    }
    signIn(res, user);
    res.status(201).json({ user });
  });
  app.post('/api/login', authLimit, async (req, res) => {
    const { email, password } = Login.parse(req.body),
      found = store.userByEmail(email);
    // Run the expensive comparison for unknown users as well.
    const hash =
      found?.password || '00000000000000000000000000000000:' + '00'.repeat(64);
    if (!(await passwordMatches(password, hash)) || !found)
      throw new AppError(401, 'The email or password does not match.');
    const user = store.user(found.id);
    signIn(res, user);
    res.json({ user });
  });
  app.post('/api/logout', (req, res) => {
    store.logout(digest(tokenOf(req)));
    res.clearCookie('studio_session', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: secureCookies,
    });
    res.json({ ok: true });
  });
  app.get('/api/dashboard', auth, (req, res) =>
    res.json(tutor.dashboard(req.user.id)),
  );
  app.post('/api/sessions', auth, (req, res) =>
    res.status(202).json(tutor.start(req.user, StartSession.parse(req.body))),
  );
  app.get('/api/sessions/:id', auth, (req, res) =>
    res.json(tutor.publicState(tutor.state(req.params.id, req.user.id))),
  );
  app.post('/api/sessions/:id/actions', auth, (req, res) =>
    res
      .status(202)
      .json(
        tutor.act(req.user.id, req.params.id, StudentAction.parse(req.body)),
      ),
  );
  app.post('/api/sessions/:id/retry', auth, (req, res) =>
    res.status(202).json(tutor.retry(req.user.id, req.params.id)),
  );
  app.post('/api/sessions/:id/pause', auth, async (req, res) =>
    res.json(await tutor.stop(req.user.id, req.params.id)),
  );
  app.post('/api/sessions/:id/finish', auth, async (req, res) =>
    res.json(await tutor.stop(req.user.id, req.params.id, true)),
  );
  app.get('/api/sessions/:id/events', auth, (req, res) => {
    const state = tutor.state(req.params.id, req.user.id);
    res.set({
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    const send = (snapshot) => {
      if (!store.authenticate(digest(tokenOf(req)))) {
        res.end();
        return;
      }
      res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
    };
    send(tutor.publicState(state));
    const channel = `session:${state.id}`;
    tutor.on(channel, send);
    const ping = setInterval(() => {
      if (!store.authenticate(digest(tokenOf(req)))) {
        res.end();
        return;
      }
      res.write(': heartbeat\n\n');
    }, 15000);
    req.on('close', () => {
      clearInterval(ping);
      tutor.off(channel, send);
    });
  });
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: 'Endpoint not found.' }),
  );
  app.use((err, _req, res, _next) => {
    if (err.name === 'ZodError')
      return res.status(400).json({
        error: err.issues?.[0]?.message || 'Please check your input.',
      });
    if (err.type === 'entity.too.large')
      return res.status(413).json({ error: 'That submission is too long.' });
    if (err.type === 'entity.parse.failed')
      return res.status(400).json({ error: 'The request could not be read.' });
    res.status(err.status || 500).json({
      error: err.status
        ? err.message
        : 'Something went wrong. Your saved work is safe.',
    });
  });
  return app;
}
