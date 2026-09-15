import test from 'node:test';
import assert from 'node:assert/strict';
import { substitute } from '../shared/substitution.mjs';
import { topicVisual } from '../server/topic-visual.mjs';
void test('substitution distinguishes roots, wrong candidates and tiny nonzero residuals', () => {
  const q = { a: 1, b: -5, c: 4 };
  assert.deepEqual(substitute(q, 1), {
    terms: [1, -5, 4],
    totals: [0, 1, -4, 0],
    result: 0,
    isRoot: true,
  });
  assert.equal(substitute(q, 4).isRoot, true);
  assert.equal(substitute(q, 2).result, -2);
  assert.equal(substitute(q, -1).result, 10);
  assert.equal(substitute({ a: 0.1, b: -0.3, c: 0.2 }, 1).isRoot, true);
  assert.equal(substitute({ a: 1, b: 0, c: -1 }, 1.000000000001).isRoot, false);
});
void test('saved teaching scenes get a matching substitution canvas without exposing answer keys', () => {
  const question = { check: { a: 1, b: -5, c: 4, answer: 'private' } };
  const activity = {
    skillId: 'verify',
    mode: 'worked-example',
    components: [{ kind: 'explanation' }],
  };
  const visual = topicVisual(activity, question);
  assert.deepEqual(visual.coefficients, { a: 1, b: -5, c: 4 });
  assert.equal(
    topicVisual({ ...activity, mode: 'diagnostic', components: [] }, question),
    null,
  );
  assert.equal(
    topicVisual(
      { ...activity, components: [{ kind: 'substitution' }] },
      question,
    ),
    null,
  );
});
