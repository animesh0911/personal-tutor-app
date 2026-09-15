// Explicit opt-in: calls the configured provider and incurs API usage.
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { Store } from '../server/store.mjs';
import { Tutor } from '../server/tutor.mjs';

if (!process.env.TUTOR_API_KEY)
  throw new Error('Configure .env.studio before the live smoke test.');
const dir = mkdtempSync(join(tmpdir(), 'prism-live-')),
  path = join(dir, 'studio.sqlite');
let store = new Store(path);
const options = {
  dataDir: dir,
  provider: process.env.TUTOR_PROVIDER,
  model: process.env.TUTOR_MODEL,
  apiKey: process.env.TUTOR_API_KEY,
};
let tutor = new Tutor(store, options);
await tutor.initialize();
const user = store.createUser(
  `smoke-${crypto.randomUUID()}@example.test`,
  'not-used',
  { name: 'Mira', grade: 10, board: 'CBSE' },
);
const snapshots = [];
async function settle(id, label) {
  const start = Date.now();
  await tutor.running.get(id)?.done;
  const state = tutor.state(id, user.id);
  snapshots.push({
    label,
    elapsedMs: Date.now() - start,
    state: tutor.publicState(state),
    journal: store.observations(user.id),
    plan: store.plan(user.id),
  });
  console.log(
    JSON.stringify({
      label,
      status: state.status,
      activity: state.activity?.title,
      components: state.activity?.components.map((c) => c.kind),
      observations: store.observations(user.id).length,
      elapsedMs: Date.now() - start,
    }),
  );
  assert.equal(state.status, 'idle', state.error);
  assert.ok(state.activity);
  return state;
}
try {
  let state = tutor.start(user, {
    requestId: crypto.randomUUID(),
    subject: 'mathematics',
    skillId: 'factor',
  });
  state = await settle(state.id, 'initial lesson');
  tutor.act(user.id, state.id, {
    actionId: crypto.randomUUID(),
    activityId: state.activity.id,
    revision: state.revision,
    kind: 'submit',
    text: 'I think I need two numbers with the right product, but I am not sure how to choose the signs.',
  });
  state = await settle(state.id, 'respond to uncertain working');
  assert.ok(
    store.observations(user.id).length > 0,
    'The real tutor should record an evidence-backed observation.',
  );
  tutor.act(user.id, state.id, {
    actionId: crypto.randomUUID(),
    activityId: state.activity.id,
    revision: state.revision,
    kind: 'explain-differently',
    text: '',
  });
  state = await settle(state.id, 'request another representation');
  tutor.act(user.id, state.id, {
    actionId: crypto.randomUUID(),
    activityId: state.activity.id,
    revision: state.revision,
    kind: 'new-question',
    text: '',
  });
  state = await settle(state.id, 'generate fresh practice');
  assert.ok(
    state.activity.problemId?.startsWith('generated-'),
    'Fresh practice should exercise model-generated, checked questions.',
  );
  const oldId = state.id,
    priorJournal = store.observations(user.id).length;
  await tutor.close();
  store.close();
  store = new Store(path);
  tutor = new Tutor(store, options);
  await tutor.initialize();
  assert.equal(tutor.state(oldId, user.id).activity.id, state.activity.id);
  assert.equal(store.observations(user.id).length, priorJournal);
  state = tutor.start(user, {
    requestId: crypto.randomUUID(),
    subject: 'mathematics',
    skillId: null,
  });
  await settle(state.id, 'new session with persisted subject memory');
  console.log(
    'Live Pi smoke test passed, including restart and next-session memory.',
  );
} finally {
  await tutor.close();
  store.close();
  mkdirSync(resolve('studio/test-results'), { recursive: true });
  writeFileSync(
    resolve('studio/test-results/live-smoke.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        provider: options.provider,
        model: options.model,
        snapshots,
      },
      null,
      2,
    ),
  );
  console.log(`Local test records: ${dir}`);
}
