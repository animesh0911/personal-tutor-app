import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEngine } from '../lib/engine.js';
const pack = JSON.parse(
  readFileSync(new URL('../content/quadratics.json', import.meta.url)),
);
const engine = createEngine(pack),
  NOW = Date.UTC(2026, 8, 5, 12),
  DAY = 86400000;
const answer = (q) =>
  Array.isArray(q.answer) ? q.answer.join(',') : String(q.answer);
const step = (s, action, extra = {}, time = NOW) =>
  engine.transition(s, { action, ...extra }, time);
function ready(id) {
  let s = engine.freshState();
  s = step(s, 'start', { skill: id });
  for (const p of engine.skills[id].prerequisites) {
    s.progress[p].readyUntil = NOW + DAY;
  }
  s.active.queue = [];
  return step(s, 'continue');
}
function solve(s) {
  return step(s, 'answer', { answer: answer(engine.questions[s.active.qid]) });
}
function wrong(s) {
  const q = engine.questions[s.active.qid];
  return step(s, 'answer', {
    answer:
      q.type === 'choice' ? q.choices.find((x) => x !== q.answer) : '987654',
  });
}

test('chapter coverage, source mapping, unique IDs, and acyclic prerequisites', () => {
  assert.equal(pack.skills.filter((s) => !s.foundation).length, 6);
  assert.equal(
    new Set(pack.questions.map((q) => q.id)).size,
    pack.questions.length,
  );
  function visit(id, seen = []) {
    assert(!seen.includes(id));
    for (const p of engine.skills[id].prerequisites) {
      assert(engine.skills[p]);
      visit(p, [...seen, id]);
    }
  }
  for (const s of pack.skills) {
    visit(s.id);
    assert.equal(s.source.pdfPage, s.source.printedPage - 37);
    assert(s.lesson.steps.length >= 3);
    for (const b of s.foundation ? [0] : [0, 1, 2])
      assert(
        pack.questions.filter((q) => q.skill === s.id && q.band === b).length >=
          5,
        `${s.id}, band ${b}`,
      );
  }
  for (const q of pack.questions) {
    assert(q.hints.length >= 2);
    assert(q.source.origin);
    if (q.type === 'choice') {
      assert(q.choices.includes(q.answer));
      assert.equal(q.choices.length, new Set(q.choices).size);
    }
  }
});
test('independent mathematical checks of authored numeric answers', () => {
  for (const q of pack.questions) {
    const c = q.check;
    if (!c) continue;
    let expected;
    if (c.kind === 'quadratic') {
      const rs = [...new Set(q.answer)];
      for (const x of rs)
        assert(Math.abs(c.a * x * x + c.b * x + c.c) < 1e-7, q.id);
      assert(Math.abs(q.answer[0] + q.answer[1] + c.b / c.a) < 1e-7, q.id);
      assert(Math.abs(q.answer[0] * q.answer[1] - c.c / c.a) < 1e-7, q.id);
      continue;
    }
    if (c.kind === 'square') expected = c.n * c.n;
    if (c.kind === 'substitution') expected = c.a * c.x * c.x + c.b * c.x + c.c;
    if (c.kind === 'linear') expected = -c.b / c.a;
    if (c.kind === 'sqrtdivide') expected = Math.sqrt(c.n) / c.d;
    if (c.kind === 'rectangle') {
      assert.equal(c.w * (c.w + c.extra), c.area);
      expected = c.w;
    }
    if (c.kind === 'hall') {
      assert.equal(c.w * (c.k * c.w + c.extra), c.area);
      expected = c.k * c.w + c.extra;
    }
    if (c.kind === 'pair') {
      assert.equal(q.answer[0] + q.answer[1], c.sum);
      assert.equal(q.answer[0] * q.answer[1], c.product);
      continue;
    }
    if (c.kind === 'coefficient') {
      assert.equal(q.answer, String(c.b));
      continue;
    }
    if (c.kind === 'nature') {
      const d = c.b * c.b - 4 * c.a * c.c;
      assert.equal(
        q.answer,
        d > 1e-8
          ? 'Two distinct real roots'
          : d < -1e-8
            ? 'No real roots'
            : 'One repeated real root',
      );
      continue;
    }
    if (c.kind === 'verify') {
      const zero = Math.abs(c.a * c.x * c.x + c.b * c.x + c.c) < 1e-8;
      assert.equal(q.answer.startsWith('Yes'), zero);
      continue;
    }
    if (c.kind === 'no-real') {
      assert(c.b * c.b - 4 * c.a * c.c < 0);
      continue;
    }
    if (expected !== undefined)
      assert(
        Math.abs(
          (Array.isArray(q.answer) ? q.answer[0] : q.answer) - expected,
        ) < 1e-8,
        q.id,
      );
  }
});
test('roots accept order, negative fractions and repeated roots, but not omitted roots or invalid input', () => {
  const q = pack.questions.find(
    (q) => q.skill === 'factor' && q.math === '2x^2+x-6=0',
  );
  assert(engine.evaluate(q, '3/2, -2'));
  assert(engine.evaluate(q, '-2,1.500'));
  assert(!engine.evaluate(q, '1.5'));
  assert(!engine.evaluate(q, '-2,1.6'));
  assert.throws(() => engine.evaluate(q, '1/0'));
  assert.throws(() => engine.evaluate(q, 'alert(1)'));
  const repeated = pack.questions.find((q) => q.math === '9x^2-6x+1=0');
  assert(engine.evaluate(repeated, '1/3'));
  assert(engine.evaluate(repeated, '1/3, 1/3'));
});
test('unknown prerequisites are checked and recent evidence skips them', () => {
  let s = step(engine.freshState(), 'start', { skill: 'factor' });
  assert.equal(s.active.stage, 'intro');
  s = step(s, 'continue');
  assert.equal(s.active.role, 'diagnostic');
  assert.equal(s.active.skill, 'pairs');
  const r = ready('factor');
  assert.equal(r.active.role, 'practice');
  assert.equal(r.active.skill, 'factor');
});
test('readiness check does not claim independent mastery', () => {
  let s = step(
    step(engine.freshState(), 'start', { skill: 'factor' }),
    'continue',
  );
  s = solve(s);
  assert(s.progress.pairs.readyUntil > NOW);
  assert.equal(s.progress.pairs.independent, 0);
  assert.equal(s.progress.pairs.completed, false);
});
test('known learner completes six questions and reaches standard success without a global level', () => {
  let s = ready('factor');
  for (let i = 0; i < 6; i++) {
    s = solve(s);
    s = step(s, 'continue');
  }
  assert.equal(s.active.stage, 'complete');
  assert.equal(s.xp, 120);
  assert.equal(s.progress.factor.completed, true);
  assert.equal(s.progress.factor.band, 2);
  assert.equal(s.progress.factor.dueAt, NOW + 3 * DAY);
  assert.equal(s.progress.pairs.band, 0);
});
test('hint and successful retry do not count as independent evidence', () => {
  let s = ready('factor');
  s = step(s, 'hint');
  s = solve(s);
  assert.equal(s.progress.factor.independent, 0);
  assert.equal(s.progress.factor.window.length, 0);
  assert.equal(s.xp, 10);
  let r = ready('factor');
  r = wrong(r);
  r = step(r, 'continue');
  r = solve(r);
  assert.equal(r.progress.factor.independent, 0);
  assert.equal(r.progress.factor.window.length, 1);
  assert.equal(r.progress.factor.window[0].correct, false);
});
test('a factorisation obstacle diagnoses, repairs, checks, returns to original, then gives a different question', () => {
  let s = ready('factor');
  const original = s.active.qid;
  s = wrong(s);
  s = step(s, 'continue');
  s = wrong(s);
  s = step(s, 'continue');
  assert.equal(s.active.skill, 'pairs');
  assert.equal(s.active.role, 'diagnostic');
  s = wrong(s);
  s = step(s, 'continue');
  assert.equal(s.active.stage, 'lesson');
  assert.equal(s.active.skill, 'pairs');
  s = step(s, 'continue');
  assert.equal(s.active.role, 'repair');
  s = solve(s);
  s = step(s, 'continue');
  assert.equal(s.active.role, 'repair-check');
  s = solve(s);
  s = step(s, 'continue');
  assert.equal(s.active.qid, original);
  assert.equal(s.active.role, 'retry');
  s = solve(s);
  s = step(s, 'continue');
  assert.equal(s.active.role, 'transfer');
  assert.notEqual(s.active.qid, original);
});
test('different prerequisite success routes to a different repair', () => {
  let s = ready('factor');
  s = wrong(s);
  s = step(s, 'continue');
  s = wrong(s);
  s = step(s, 'continue');
  s = solve(s);
  s = step(s, 'continue');
  assert.equal(s.active.skill, 'zero');
  s = wrong(s);
  s = step(s, 'continue');
  assert.equal(s.active.stage, 'lesson');
  assert.equal(s.active.skill, 'zero');
});
test('an unresolved repair is bounded and can end without claiming completion', () => {
  let s = step(
    step(engine.freshState(), 'start', { skill: 'factor' }),
    'continue',
  );
  for (let i = 0; i < 40 && s.active.stage !== 'complete'; i++) {
    if (s.active.stage === 'question') s = wrong(s);
    else s = step(s, 'continue');
  }
  assert.equal(s.active.endReason, 'pause');
  assert.equal(s.sessionsCompleted, 0);
  assert.equal(s.progress.factor.completed, false);
});
test('due review is recommended later without erasing achievements', () => {
  let s = ready('factor');
  for (let i = 0; i < 6; i++) {
    s = solve(s);
    s = step(s, 'continue');
  }
  const v = engine.view(s, NOW + 4 * DAY);
  assert.equal(v.reviewDue, true);
  assert.equal(v.recommended, 'factor');
  assert(v.progress.factor.completed);
});
test('finite pool can be revisited without granting duplicate XP or false fresh evidence', () => {
  let s = ready('recognise');
  for (let i = 0; i < 25; i++) {
    if (s.active.stage === 'complete')
      s = step(s, 'start', { skill: 'recognise' });
    if (
      s.active.stage === 'intro' ||
      s.active.stage === 'lesson' ||
      s.active.stage === 'feedback'
    )
      s = step(s, 'continue');
    else if (s.active.stage === 'question') s = solve(s);
  }
  const qid = s.active.qid;
  s.active.stage = 'question';
  s.active.failures = 0;
  s.active.assisted = false;
  s.active.role = 'practice';
  s.history[qid] = { last: NOW, rewarded: true };
  const before = s.xp,
    ind = s.progress.recognise.independent;
  s = solve(s);
  assert.equal(s.xp, before);
  assert.equal(s.progress.recognise.independent, ind);
});
test('client view never includes question answer keys or unrevealed hints', () => {
  let s = ready('factor');
  const v = engine.view(s);
  assert(!('answer' in v.active.question));
  assert.equal(v.active.question.hints.length, 0);
  assert(!('questions' in v));
  s = step(s, 'hint');
  assert.equal(engine.view(s).active.question.hints.length, 1);
});
test('serialised state preserves the original return question during a repair', () => {
  let s = ready('factor');
  const qid = s.active.qid;
  s = wrong(s);
  s = step(s, 'continue');
  s = wrong(s);
  s = step(s, 'continue');
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(restored.active.saved.qid, qid);
  assert.deepEqual(engine.view(restored, NOW), engine.view(s, NOW));
});

test('finishing a supported session visibly updates that milestone without falsely claiming independent completion', () => {
  let s = ready('factor');
  for (let i = 0; i < 6; i++) {
    s = step(s, 'hint');
    s = solve(s);
    s = step(s, 'continue');
  }
  const milestone = engine.view(s, NOW).skills.find((x) => x.id === 'factor');
  assert.equal(s.active.stage, 'complete');
  assert.equal(milestone.progress.completed, false);
  assert.equal(
    milestone.progress.sessionsCompleted,
    1,
    'Path should show the completed practice session',
  );
  assert.equal(milestone.progress.status, 'practised');
});

test('milestone progress updates on the sixth solved answer, before the final Continue click', () => {
  let s = ready('factor');
  for (let i = 0; i < 6; i++) {
    s = step(s, 'hint');
    s = solve(s);
    if (i < 5) s = step(s, 'continue');
  }
  assert.equal(s.active.stage, 'feedback');
  assert.equal(
    engine.view(s, NOW).skills.find((x) => x.id === 'factor').progress.status,
    'practised',
  );
  assert.equal(s.sessionsCompleted, 1);
  s = step(s, 'continue');
  assert.equal(s.sessionsCompleted, 1);
});

test('legacy progress exposes the saved band and checkpoint without inventing mastery', () => {
  const s = engine.freshState();
  s.progress.recognise = {
    band: 1,
    window: [{ correct: true, band: 1 }],
    independent: 4,
    attempts: 6,
    helped: 2,
    introduced: true,
    completed: false,
    dueAt: 0,
    lastAt: NOW,
  };
  const p = engine
    .view(s, NOW)
    .skills.find((x) => x.id === 'recognise').progress;
  assert.equal(p.status, 'in-progress');
  assert.deepEqual(p.checkpoint.results, [true, null, null]);
  assert.equal(p.checkpoint.correct, 1);
  assert.equal(p.completed, false);
});

test('a repair on the last question still leads to a fresh transfer before completing practice', () => {
  let s = ready('factor');
  for (let i = 0; i < 5; i++) {
    s = solve(s);
    s = step(s, 'continue');
  }
  s = wrong(s);
  s = step(s, 'continue');
  s = wrong(s);
  s = step(s, 'continue');
  s = wrong(s);
  s = step(s, 'continue');
  s = step(s, 'continue');
  s = solve(s);
  s = step(s, 'continue');
  s = solve(s);
  s = step(s, 'continue');
  assert.equal(s.active.role, 'retry');
  s = solve(s);
  s = step(s, 'continue');
  assert.equal(s.active.role, 'transfer');
  assert.equal(s.active.stage, 'question');
  assert.equal(s.sessionsCompleted, 0);
  s = solve(s);
  assert.equal(s.sessionsCompleted, 1);
  s = step(s, 'continue');
  assert.equal(s.active.stage, 'complete');
});
