import test from 'node:test';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../server/store.mjs';
import { Tutor } from '../server/tutor.mjs';
import { createApp } from '../server/app.mjs';
import { fixtureRunner } from './fixture-runner.mjs';

await test('HTTP accounts, CSRF, private questions, session access and logout', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'prism-http-')),
    store = new Store(join(dir, 'test.db'));
  const tutor = new Tutor(store, { runner: fixtureRunner });
  await tutor.initialize();
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const endpoint = `http://127.0.0.1:${server.address().port}`,
    origin = endpoint;
  server.on('request', createApp({ store, tutor, origin }));
  let cookie = '';
  async function request(path, body, headers = {}) {
    return fetch(endpoint + '/api' + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        Cookie: cookie,
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  try {
    const account = {
      email: 'mira@example.com',
      password: 'long-test-passphrase',
      name: 'Mira',
      grade: 10,
      board: 'CBSE',
    };
    assert.equal(
      (
        await request('/register', account, {
          Origin: 'https://untrusted.example',
        })
      ).status,
      403,
    );
    let r = await request('/register', account);
    assert.equal(r.status, 201);
    cookie = r.headers.get('set-cookie').split(';')[0];
    assert.match(r.headers.get('set-cookie'), /HttpOnly/);
    assert.match(r.headers.get('set-cookie'), /SameSite=Strict/);
    assert.equal((await request('/register', account)).status, 409);
    assert.equal(
      (
        await request('/login', {
          email: account.email,
          password: 'wrong-password-123',
        })
      ).status,
      401,
    );
    r = await request('/bootstrap');
    const bootstrap = await r.json();
    assert.equal(bootstrap.user.name, 'Mira');
    assert.ok(!JSON.stringify(bootstrap).includes('long-test-passphrase'));
    r = await request('/sessions', {
      requestId: crypto.randomUUID(),
      subject: 'mathematics',
      skillId: 'factor',
    });
    assert.equal(r.status, 202);
    const session = await r.json();
    await tutor.running.get(session.id)?.done;
    const firstCookie = cookie;
    r = await request('/sessions/' + session.id);
    const state = await r.json();
    assert.equal(state.status, 'idle');
    assert.equal(state.problem.answer, undefined);
    assert.equal(state.userId, undefined);
    r = await request('/register', {
      ...account,
      email: 'second@example.com',
      name: 'Sam',
    });
    cookie = r.headers.get('set-cookie').split(';')[0];
    assert.equal((await request('/sessions/' + session.id)).status, 404);
    assert.equal(
      (await request('/sessions/' + session.id + '/events')).status,
      404,
    );
    cookie = firstCookie;
    assert.equal((await request('/logout', {})).status, 200);
    assert.equal((await request('/dashboard')).status, 401);
  } finally {
    await tutor.close();
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
