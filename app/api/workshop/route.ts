import { getDb } from '@/db';
import { engine } from '@/lib/learning';
export const dynamic = 'force-dynamic';
const COOKIE = 'cw_session';
function response(body: unknown, status = 200, cookie?: string) {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  if (cookie) headers['Set-Cookie'] = cookie;
  return Response.json(body, { status, headers });
}
const hex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
async function digest(value: string) {
  return hex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
  );
}
async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
      },
      key,
      256,
    ),
  );
}
function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function cookie(token: string, req: Request, clear = false) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : 2592000}${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`;
}
async function current(req: Request) {
  const token = req.headers
    .get('cookie')
    ?.split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1);
  if (!token) return null;
  return getDb()
    .prepare(
      'SELECT users.id, users.name, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.hash = ? AND sessions.expires_at > ?',
    )
    .bind(await digest(token), Date.now())
    .first<{ id: string; name: string; email: string }>();
}
async function stateFor(id: string) {
  const row = await getDb()
    .prepare('SELECT state, revision FROM learning WHERE user_id = ?')
    .bind(id)
    .first<{ state: string; revision: number }>();
  if (!row) throw new Error('Your progress could not be loaded.');
  return { state: JSON.parse(row.state), revision: row.revision };
}
async function payload(user: { id: string; name: string; email: string }) {
  const row = await stateFor(user.id);
  return {
    user: { name: user.name, email: user.email },
    ...engine.view(row.state),
  };
}
export async function GET(req: Request) {
  try {
    const user = await current(req);
    return response(user ? await payload(user) : { user: null });
  } catch {
    return response(
      { error: 'We couldn’t load your workshop. Please try again.' },
      503,
    );
  }
}
export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    if (!origin || origin !== new URL(req.url).origin)
      return response(
        { error: 'Please use the workshop page to make this request.' },
        403,
      );
    if (!req.headers.get('content-type')?.includes('application/json'))
      return response({ error: 'Expected a JSON request.' }, 415);
    const raw = await req.text();
    if (raw.length > 6000)
      return response({ error: 'That request is too large.' }, 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return response({ error: 'Invalid request.' }, 400);
    }
    const db = getDb(),
      now = Date.now();
    if (body.action === 'register' || body.action === 'login') {
      const email = String(body.email || '')
          .trim()
          .toLowerCase(),
        password = String(body.password || ''),
        name = String(body.name || '').trim();
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254 ||
        password.length < 10 ||
        password.length > 128
      )
        return response(
          { error: 'Use a valid email and a password with 10–128 characters.' },
          400,
        );
      if (body.action === 'register' && (name.length < 1 || name.length > 40))
        return response({ error: 'Enter a name with 1–40 characters.' }, 400);
      const keys = [
        await digest('email:' + email),
        await digest(
          'visitor:' +
            (req.headers.get('cf-connecting-ip') ||
              req.headers.get('oai-authenticated-user-id') ||
              'local'),
        ),
      ];
      for (const [i, key] of keys.entries()) {
        const limit = await db
          .prepare(
            'INSERT INTO auth_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at <= ? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING count',
          )
          .bind(key, now + 900000, now, now)
          .first<{ count: number }>();
        if ((limit?.count || 0) > (i === 0 ? 10 : 60))
          return response(
            {
              error:
                'Too many sign-in attempts. Please try again in 15 minutes.',
            },
            429,
          );
      }
      let user = await db
        .prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first<{
          id: string;
          name: string;
          email: string;
          password: string;
          salt: string;
        }>();
      if (body.action === 'register') {
        if (user)
          return response(
            {
              error:
                'Unable to create this account. If you already registered, try signing in.',
            },
            409,
          );
        const salt = crypto.randomUUID(),
          passwordHash = await hashPassword(password, salt),
          id = crypto.randomUUID();
        try {
          await db.batch([
            db
              .prepare(
                'INSERT INTO users (id,email,name,password,salt,created_at) VALUES (?,?,?,?,?,?)',
              )
              .bind(id, email, name, passwordHash, salt, now),
            db
              .prepare(
                'INSERT INTO learning (user_id,revision,state) VALUES (?,0,?)',
              )
              .bind(id, JSON.stringify(engine.freshState())),
          ]);
        } catch {
          return response(
            {
              error:
                'Unable to create this account. Try signing in if you already registered.',
            },
            409,
          );
        }
        user = { id, email, name, password: passwordHash, salt };
      } else {
        const candidate = await hashPassword(
          password,
          user?.salt || 'unregistered-account',
        );
        if (!user || !equal(candidate, user.password))
          return response(
            { error: 'Email or password doesn’t match. Please try again.' },
            401,
          );
      }
      const token = crypto.randomUUID() + crypto.randomUUID();
      await db.batch([
        db
          .prepare(
            'INSERT INTO sessions (hash,user_id,expires_at) VALUES (?,?,?)',
          )
          .bind(await digest(token), user.id, now + 2592000000),
        db.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now),
        db.prepare('DELETE FROM auth_limits WHERE key = ?').bind(keys[0]),
      ]);
      return response(await payload(user), 200, cookie(token, req));
    }
    const user = await current(req);
    if (!user)
      return response(
        { error: 'Please sign in to continue.', signedOut: true },
        401,
      );
    if (body.action === 'logout') {
      const token =
        req.headers
          .get('cookie')
          ?.split(';')
          .map((x) => x.trim())
          .find((x) => x.startsWith(COOKIE + '='))
          ?.slice(COOKIE.length + 1) || '';
      await db
        .prepare('DELETE FROM sessions WHERE hash = ?')
        .bind(await digest(token))
        .run();
      return response({ user: null }, 200, cookie('', req, true));
    }
    if (typeof body.requestId !== 'string' || body.requestId.length > 80)
      return response({ error: 'Please retry from the workshop.' }, 400);
    const row = await stateFor(user.id);
    if (row.state.lastRequest === body.requestId)
      return response({
        user: { name: user.name, email: user.email },
        ...engine.view(row.state),
      });
    if (row.revision !== body.revision)
      return response(
        {
          error: 'Your progress changed in another tab. We’ve refreshed it.',
          refresh: true,
        },
        409,
      );
    let next;
    try {
      next = engine.transition(row.state, body, now);
    } catch (e) {
      return response(
        { error: e instanceof Error ? e.message : 'Please try that again.' },
        400,
      );
    }
    next.revision = row.revision + 1;
    next.lastRequest = body.requestId;
    const result = await db
      .prepare(
        'UPDATE learning SET state = ?, revision = ? WHERE user_id = ? AND revision = ?',
      )
      .bind(JSON.stringify(next), next.revision, user.id, row.revision)
      .run();
    if (result.meta.changes !== 1)
      return response(
        {
          error: 'Your progress changed in another tab. We’ve refreshed it.',
          refresh: true,
        },
        409,
      );
    return response({
      user: { name: user.name, email: user.email },
      ...engine.view(next),
    });
  } catch {
    return response(
      {
        error:
          'We couldn’t save that just now. Your last saved progress is safe. Please try again.',
      },
      503,
    );
  }
}
