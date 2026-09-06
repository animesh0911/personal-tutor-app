import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateVisual,
  quadratic,
  valueAt,
  factorCoefficients,
  factorPairs,
  plotBounds,
} from '../lib/visual-math.js';
import { createEngine } from '../lib/engine.js';
const pack = JSON.parse(
    readFileSync(new URL('../content/quadratics.json', import.meta.url)),
  ),
  engine = createEngine(pack);
test('every lesson and question has a valid numerical visual', () => {
  for (const s of pack.skills) assert(validateVisual(s.lesson.visual), s.id);
  for (const q of pack.questions) assert(validateVisual(q.visual), q.id);
});
test('question visuals use the question coefficients and factor products', () => {
  for (const q of pack.questions) {
    const v = q.visual,
      c = q.check;
    if (!c) continue;
    if (
      ['quadratic_plot', 'formula_steps', 'coefficient_cards'].includes(v.kind)
    )
      for (const k of ['a', 'b', 'c']) assert.equal(v[k], c[k], q.id + ' ' + k);
    if (v.kind === 'factor_grid') {
      const actual = factorCoefficients(v.factors);
      for (const [i, k] of ['a', 'b', 'c'].entries())
        assert(Math.abs(actual[i] - c[k]) < 1e-9, q.id);
    }
    if (v.kind === 'rectangle_area')
      for (const k of ['k', 'extra', 'area'])
        assert.equal(v[k], k === 'k' ? (c[k] ?? 1) : c[k], q.id);
    if (v.kind === 'signed_square') assert.equal(v.n, c.n, q.id);
  }
});
test('graph handles distinct, repeated, nonreal, linear and fractional roots', () => {
  assert.equal(quadratic(1, -4, 3).kind, 'distinct');
  assert.equal(quadratic(1, -4, 4).kind, 'repeated');
  assert.equal(quadratic(1, -4, 5).kind, 'none');
  assert.deepEqual(quadratic(0, 2, -3).roots, [1.5]);
  for (const q of pack.questions.filter((q) =>
    ['quadratic_plot', 'formula_steps'].includes(q.visual.kind),
  )) {
    const { a, b, c } = q.visual;
    for (const root of quadratic(a, b, c).roots)
      assert(Math.abs(valueAt(a, b, c, root)) < 1e-7, q.id);
    assert(plotBounds(a, b, c).every(Number.isFinite));
  }
});
test('factor-pair explorations include the required pair', () => {
  for (const q of pack.questions.filter((q) => q.visual.kind === 'factor_pair'))
    assert(
      factorPairs(q.visual.product).some(([a, b]) => a + b === q.visual.sum),
      q.id,
    );
});
test('unsupported or unbounded visual specifications are rejected', () => {
  const s = pack.skills[0].lesson.visual;
  for (const v of [
    null,
    {},
    { ...s, kind: 'javascript' },
    { ...s, version: 99 },
    { ...s, alt: '' },
    {
      version: 1,
      kind: 'quadratic_plot',
      a: Infinity,
      b: 0,
      c: 0,
      mode: 'roots',
      alt: 'bad',
    },
  ])
    assert.equal(validateVisual(v), false);
});
test('existing pack upgrade keeps progress and active question', () => {
  let s = engine.freshState();
  s = engine.transition(s, { action: 'start', skill: 'factor' });
  s.packVersion = pack.compatibleVersions[0];
  s.xp = 123;
  const oldProgress = structuredClone(s.progress);
  const next = engine.transition(s, { action: 'continue' });
  assert.equal(next.packVersion, pack.version);
  assert.equal(next.xp, 123);
  for (const id of Object.keys(oldProgress))
    assert.equal(next.progress[id].band, oldProgress[id].band);
  const unknown = { ...s, packVersion: 'unknown' };
  assert.throws(() => engine.transition(unknown, { action: 'continue' }));
});
test('question-specific visual is withheld until assistance or feedback', () => {
  let s = engine.freshState();
  s = engine.transition(s, { action: 'start', skill: 'recognise' });
  s.active.queue = [];
  s = engine.transition(s, { action: 'continue' });
  assert.equal(engine.view(s).active.question.visual, undefined);
  const before = s.xp;
  s = engine.transition(s, { action: 'hint' });
  assert(validateVisual(engine.view(s).active.question.visual));
  assert.equal(s.xp, before);
});
