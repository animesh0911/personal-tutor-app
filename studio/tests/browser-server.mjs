import { resolve } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';
import { Store } from '../server/store.mjs';
import { Tutor } from '../server/tutor.mjs';
import { createApp } from '../server/app.mjs';
import { fixtureRunner } from './fixture-runner.mjs';

const dir = mkdtempSync(join(tmpdir(), 'prism-browser-')),
  store = new Store(join(dir, 'test.db'));
const tutor = new Tutor(store, {
  runner: fixtureRunner,
  provider: 'test-fixture',
  model: 'scripted-ui-test',
});
await tutor.initialize();
const app = createApp({ store, tutor, origin: 'http://localhost:4311' });
const dist = resolve('.studio-dist');
app.use(express.static(dist, { index: false }));
app.get('/{*path}', (_req, res) => res.sendFile('index.html', { root: dist }));
const server = app.listen(4311, '127.0.0.1', () =>
  console.log('Test-only browser fixture on 4311'),
);
async function close() {
  await tutor.close();
  server.closeAllConnections();
  server.close();
  store.close();
  rmSync(dir, { recursive: true, force: true });
}
process.on('SIGTERM', close);
process.on('SIGINT', close);
