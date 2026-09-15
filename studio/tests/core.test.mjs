import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { compareMath, inspectQuadratic } from '../server/math.mjs';
import { generatedQuestion, pack, skills } from '../server/curriculum.mjs';
import { Store } from '../server/store.mjs';
import { Tutor } from '../server/tutor.mjs';
import { fixtureRunner } from './fixture-runner.mjs';

const fresh = () => {
  const dir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const store = new Store(join(dir, 'studio.db'));
  return {
    dir,
    store,
    cleanup: () => {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
};
const user = (store) =>
  store.createUser(`${randomUUID()}@example.com`, 'not-used-in-runtime-tests', {
    name: 'Mira',
    grade: 10,
    board: 'CBSE',
  });
const done = async (tutor, id) => {
  const job = tutor.running.get(id);
  if (job) await job.done;
};

await test('math tool accepts rearrangements and rejects wrong signs without treating unsupported algebra as false', () => {
  assert.equal(
    compareMath({ left: '(x-2)(x-3)', right: 'x^2-5x+6' }).status,
    'equivalent',
  );
  assert.equal(
    compareMath({ left: '(x+2)(x+3)', right: 'x^2-5x+6' }).status,
    'different',
  );
  assert.equal(
    compareMath({ left: '2x^2-10x+12=0', right: 'x^2-5x+6=0' }).status,
    'equivalent',
  );
  assert.equal(
    compareMath({ left: 'x^2=1', right: 'x=1' }).status,
    'unsupported',
  );
  assert.equal(compareMath({ left: 'x/x', right: '1' }).status, 'unsupported');
  assert.equal(
    compareMath({ left: 'x+0.00000000001', right: 'x' }).status,
    'different',
  );
  assert.equal(
    compareMath({ left: 'x/3+x/6', right: 'x/2' }).status,
    'equivalent',
  );
  for (const input of [
    'import("fs")',
    'a=2',
    'x.constructor',
    'sqrt(x)',
    '[1,2]',
    'x^999999',
    'x/0',
  ])
    assert.equal(
      compareMath({ left: input, right: 'x' }).status,
      'unsupported',
    );
});
await test('generated quadratics have consistent computed solutions across coefficients and root domains', () => {
  for (let a = -3; a <= 3; a++)
    for (let b = -8; b <= 8; b++)
      for (let c = -5; c <= 5; c++) {
        if (!a) continue;
        const r = inspectQuadratic({ a, b, c });
        assert.equal(r.roots.length, r.d < 0 ? 0 : r.d === 0 ? 1 : 2);
        for (const x of r.roots)
          assert.ok(Math.abs(a * x * x + b * x + c) < 1e-8);
      }
  assert.throws(() =>
    generatedQuestion({
      skillId: 'factor',
      title: 'Invalid',
      prompt: 'Solve.',
      coefficients: { a: 0, b: 1, c: 1 },
      task: 'solve',
      candidate: null,
      challengeReason: 'Test',
    }),
  );
});
await test('curriculum skill graph resolves all app prerequisites and is acyclic', () => {
  const map = new Map(skills.map((s) => [s.id, s]));
  const visit = (id, path) => {
    assert.ok(!path.has(id), `cycle at ${id}`);
    const s = map.get(id);
    assert.ok(s);
    for (const pre of s.prerequisites) visit(pre, new Set([...path, id]));
  };
  for (const s of skills) visit(s.id, new Set());
  assert.equal(pack.questions.length, 154);
});
await test('complete tool loop persists observations, hides keys, rejects stale actions and isolates learners', async () => {
  const f = fresh();
  try {
    const learner = user(f.store),
      other = user(f.store),
      tutor = new Tutor(f.store, { runner: fixtureRunner });
    await tutor.initialize();
    const start = {
      subject: 'mathematics',
      requestId: randomUUID(),
      skillId: 'factor',
    };
    const initial = tutor.start(learner, start);
    await done(tutor, initial.id);
    let state = tutor.state(initial.id, learner.id);
    assert.equal(state.status, 'idle');
    assert.ok(state.activity);
    assert.equal(tutor.start(learner, start).id, initial.id);
    assert.throws(() => tutor.state(initial.id, other.id), { status: 404 });
    assert.equal(tutor.publicState(state).problem.answer, undefined);
    assert.equal(tutor.publicState(state).piSessionFile, undefined);
    assert.equal(tutor.question(state.activity.problemId, other.id), undefined);
    const action = {
      actionId: randomUUID(),
      activityId: state.activity.id,
      revision: state.revision,
      kind: 'submit',
      text: '(x+2)(x+3)=0',
    };
    tutor.act(learner.id, initial.id, action);
    await done(tutor, initial.id);
    tutor.act(learner.id, initial.id, action);
    assert.equal(f.store.evidence(learner.id).length, 1);
    assert.throws(
      () => tutor.act(learner.id, initial.id, { ...action, text: 'changed' }),
      { status: 409 },
    );
    assert.throws(
      () =>
        tutor.act(learner.id, initial.id, {
          ...action,
          actionId: randomUUID(),
        }),
      { status: 409 },
    );
    assert.equal(f.store.observations(learner.id).length, 1);
    assert.equal(f.store.observations(other.id).length, 0);
    state = tutor.state(initial.id, learner.id);
    const tools = tutor.tools(state, { toolCount: 0 });
    await assert.rejects(
      tools
        .find((t) => t.name === 'record_observation')
        .execute('invalid', {
          skillId: 'factor',
          note: 'Invented',
          confidence: 'strong',
          status: 'secure',
          evidenceIds: ['not-real'],
          revisitInDays: 2,
        }),
    );
    await tutor.stop(learner.id, initial.id, true);
    assert.equal(tutor.state(initial.id, learner.id).completed, true);
  } finally {
    f.cleanup();
  }
});
await test('schema and numerical validation reject executable and mismatched scenes', async () => {
  const f = fresh();
  try {
    const learner = user(f.store),
      tutor = new Tutor(f.store, { runner: fixtureRunner });
    await tutor.initialize();
    const initial = tutor.start(learner, {
      subject: 'mathematics',
      requestId: randomUUID(),
      skillId: null,
    });
    await done(tutor, initial.id);
    const state = tutor.state(initial.id, learner.id),
      t = tutor
        .tools(state, { toolCount: 0 })
        .find((t) => t.name === 'present_activity');
    const base = {
      title: 'Bad scene',
      skillId: 'factor',
      goalSkillId: 'factor',
      mode: 'practice',
      prompt: 'Try',
      problemId: state.activity.problemId,
    };
    await assert.rejects(
      t.execute('missing-root-visual', {
        ...base,
        skillId: 'verify',
        goalSkillId: 'verify',
        problemId: null,
        mode: 'worked-example',
        components: [
          {
            kind: 'explanation',
            title: 'Checking roots',
            body: 'Substitute x = 1.',
          },
        ],
      }),
      /substitution visual/,
    );
    await assert.rejects(
      t.execute('bad', {
        ...base,
        components: [{ kind: 'html', code: '<script/>' }],
      }),
    );
    await assert.rejects(
      t.execute('bad2', {
        ...base,
        components: [
          {
            kind: 'parabola',
            title: 'Wrong equation',
            coefficients: { a: 1, b: 5, c: 6 },
            revealRoots: false,
          },
        ],
      }),
    );
  } finally {
    f.cleanup();
  }
});
await test('restart retains scene and evidence while interrupting unfinished turns', async () => {
  const f = fresh();
  try {
    const learner = user(f.store),
      tutor = new Tutor(f.store, { runner: fixtureRunner });
    await tutor.initialize();
    const s = tutor.start(learner, {
      subject: 'mathematics',
      requestId: randomUUID(),
      skillId: null,
    });
    await done(tutor, s.id);
    const saved = tutor.state(s.id, learner.id);
    saved.status = 'running';
    f.store.saveSession(saved);
    f.store.close();
    f.store = new Store(join(f.dir, 'studio.db'));
    const restored = f.store.session(s.id, learner.id);
    assert.equal(restored.status, 'interrupted');
    assert.deepEqual(restored.activity, saved.activity);
    f.store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});
await test('provider failure preserves submitted work and offers retry without duplicate evidence', async () => {
  const f = fresh();
  try {
    const learner = user(f.store),
      tutor = new Tutor(f.store, { runner: fixtureRunner });
    await tutor.initialize();
    const s = tutor.start(learner, {
      subject: 'mathematics',
      requestId: randomUUID(),
      skillId: null,
    });
    await done(tutor, s.id);
    const state = tutor.state(s.id, learner.id);
    tutor.options.runner = async () => {
      throw new Error('provider failure with SECRET');
    };
    tutor.act(learner.id, s.id, {
      actionId: randomUUID(),
      activityId: state.activity.id,
      revision: state.revision,
      kind: 'submit',
      text: 'x=2 or x=3',
    });
    await done(tutor, s.id);
    const failed = tutor.publicState(tutor.state(s.id, learner.id));
    assert.equal(failed.status, 'error');
    assert.equal(failed.working, 'x=2 or x=3');
    assert.ok(!JSON.stringify(failed).includes('SECRET'));
    tutor.options.runner = fixtureRunner;
    tutor.retry(learner.id, s.id);
    await done(tutor, s.id);
    assert.equal(f.store.evidence(learner.id).length, 1);
  } finally {
    f.cleanup();
  }
});

await test('retrofit substitution visual marks subsequent work as assisted', async () => {
  const f = fresh();
  const tutor = new Tutor(f.store, { runner: fixtureRunner });
  try {
    const learner = user(f.store);
    await tutor.initialize();
    const initial = tutor.start(learner, {
      subject: 'mathematics',
      requestId: randomUUID(),
      skillId: 'verify',
    });
    await done(tutor, initial.id);
    const state = tutor.state(initial.id, learner.id);
    // Simulate an older saved text/equation-only scene with unaided metadata.
    state.activity.components = [{ kind: 'equation', title: 'Working' }];
    state.assisted = false;
    f.store.saveSession(state);
    assert.equal(tutor.publicState(state).topicVisual.kind, 'substitution');
    tutor.act(learner.id, state.id, {
      kind: 'submit',
      text: 'It lands on zero.',
      actionId: randomUUID(),
      activityId: state.activity.id,
      revision: state.revision,
    });
    await done(tutor, state.id);
    assert.equal(f.store.evidence(learner.id)[0].assistanceBeforeAttempt, true);
  } finally {
    await tutor.close();
    f.cleanup();
  }
});
