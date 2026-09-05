import assert from 'node:assert/strict';
const base = process.env.WORKSHOP_TEST_URL || 'http://localhost:3000';
async function request(body, cookie = '', origin = base) {
  const r = await fetch(base + '/api/workshop', {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body ? { 'Content-Type': 'application/json', Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await r.text();
  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    result = { error: raw };
  }
  return {
    status: r.status,
    body: result,
    cookie: r.headers.get('set-cookie')?.split(';')[0],
    headers: r.headers,
  };
}
const initial = await request();
assert.equal(initial.body.user, null);
const email = `qa-${Date.now()}@example.test`,
  password = crypto.randomUUID();
const r = await request({
  action: 'register',
  name: 'Test learner',
  email,
  password,
});
assert.equal(r.status, 200, JSON.stringify(r.body));
assert(r.headers.get('set-cookie').includes('HttpOnly'));
assert(r.headers.get('set-cookie').includes('SameSite=Lax'));
const cookie = r.cookie;
const me = await request(null, cookie);
assert.equal(me.body.user.email, email);
assert.equal(me.body.xp, 0);
const id = crypto.randomUUID();
const command = {
  action: 'start',
  skill: 'factor',
  revision: me.body.revision,
  requestId: id,
};
const start = await request(command, cookie);
assert.equal(start.status, 200);
assert.equal(start.body.active.stage, 'intro');
const replay = await request(command, cookie);
assert.equal(replay.status, 200);
assert.equal(replay.body.revision, start.body.revision);
const conflict = await request(
  { ...command, requestId: crypto.randomUUID() },
  cookie,
);
assert.equal(conflict.status, 409);
const cont = await request(
  {
    action: 'continue',
    revision: start.body.revision,
    requestId: crypto.randomUUID(),
  },
  cookie,
);
assert.equal(cont.body.active.role, 'diagnostic');
assert(!('answer' in cont.body.active.question));
const resumed = await request(null, cookie);
assert.equal(resumed.body.active.question.id, cont.body.active.question.id);
const anonymous = await request({
  action: 'start',
  skill: 'factor',
  revision: 0,
  requestId: crypto.randomUUID(),
});
assert.equal(anonymous.status, 401);
const csrf = await request(
  { action: 'logout' },
  cookie,
  'https://untrusted.example',
);
assert.equal(csrf.status, 403);
const second = await request({
  action: 'register',
  name: 'Other learner',
  email: `second-${Date.now()}@example.test`,
  password,
});
assert.equal(second.status, 200);
assert.equal(second.body.active, null);
assert.equal(second.body.xp, 0);
const loggedOut = await request({ action: 'logout' }, cookie);
assert.equal(loggedOut.status, 200);
assert.equal((await request(null, cookie)).body.user, null);
const wrong = await request({
  action: 'login',
  email,
  password: password + 'no',
});
assert.equal(wrong.status, 401);
const signedIn = await request({ action: 'login', email, password });
assert.equal(signedIn.status, 200);
assert.equal(signedIn.body.active.question.id, cont.body.active.question.id);
console.log(
  'PASS: registration, password login, persistent resume, separate accounts, idempotency, stale revisions, CSRF, answer-key filtering, and logout.',
);
