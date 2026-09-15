import { all, create, fraction } from 'mathjs';
const { parse } = create(all, { number: 'BigNumber', precision: 80 });
const zero = fraction(0);
const one = fraction(1);
import { quadratic, polynomialTex } from '../../lib/visual-math.js';

export { quadratic, polynomialTex };
export function inspectQuadratic({ a, b, c }) {
  const result = quadratic(a, b, c);
  return {
    ...result,
    equation: `${polynomialTex(a, b, c)}=0`,
    domain: 'real numbers',
  };
}

// A restricted polynomial interpreter. No eval/compile, functions, assignments,
// indexing or user-controlled property access. Exact structure, degree <= 4.
function polynomial(text) {
  if (text.length > 250) throw new Error('Expression is too long');
  const tree = parse(
    text.replaceAll('²', '^2').replaceAll('−', '-').replaceAll('×', '*'),
  );
  let visited = 0;
  const clean = (a) => {
    while (a.length > 1 && a.at(-1).equals(zero)) a.pop();
    return a;
  };
  const add = (a, b, sign = 1) =>
    clean(
      Array.from({ length: Math.max(a.length, b.length) }, (_, i) =>
        (a[i] || zero).add((b[i] || zero).mul(sign)),
      ),
    );
  const mul = (a, b) => {
    if (a.length + b.length > 6)
      throw new Error('Degree above supported range');
    const r = Array(a.length + b.length - 1).fill(zero);
    a.forEach((v, i) =>
      b.forEach((w, j) => {
        r[i + j] = r[i + j].add(v.mul(w));
      }),
    );
    return clean(r);
  };
  function visit(n) {
    if (++visited > 80) throw new Error('Expression is too complex');
    if (
      n.isConstantNode &&
      n.value?.isBigNumber &&
      n.value.isFinite() &&
      Math.abs(n.value.e) <= 100 &&
      n.value.abs().lt(1e6)
    )
      return [fraction(n.value.toFixed())];
    if (n.isSymbolNode && n.name === 'x') return [zero, one];
    if (n.isParenthesisNode) return visit(n.content);
    if (!n.isOperatorNode)
      throw new Error('Only polynomial arithmetic in x is supported');
    const a = visit(n.args[0]);
    if (n.fn === 'unaryMinus') return a.map((v) => v.neg());
    if (n.fn === 'unaryPlus') return a;
    const b = visit(n.args[1]);
    if (n.fn === 'add') return add(a, b);
    if (n.fn === 'subtract') return add(a, b, -1);
    if (n.fn === 'multiply') return mul(a, b);
    if (n.fn === 'divide' && b.length === 1 && !b[0].equals(zero))
      return a.map((v) => v.div(b[0]));
    if (
      n.fn === 'pow' &&
      b.length === 1 &&
      Number.isInteger(b[0].valueOf()) &&
      b[0].valueOf() >= 0 &&
      b[0].valueOf() <= 4
    ) {
      let r = [one];
      for (let i = 0; i < b[0].valueOf(); i++) r = mul(r, a);
      return r;
    }
    throw new Error('This operation needs a domain-aware check');
  }
  const result = visit(tree);
  if (
    result.some(
      (n) => !Number.isFinite(n.valueOf()) || Math.abs(n.valueOf()) > 1e12,
    )
  )
    throw new Error('Numbers outside supported range');
  return result;
}
function equation(text) {
  const sides = text.split('=');
  if (sides.length !== 2) throw new Error('Use exactly one equals sign');
  const a = polynomial(sides[0]),
    b = polynomial(sides[1]);
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) =>
    (a[i] || zero).sub(b[i] || zero),
  );
}
export function compareMath({ left, right }) {
  try {
    const equations = left.includes('=') || right.includes('=');
    if (equations && !(left.includes('=') && right.includes('=')))
      return {
        status: 'unsupported',
        reason: 'Compare two expressions or two equations.',
      };
    const a = equations ? equation(left) : polynomial(left),
      b = equations ? equation(right) : polynomial(right);
    let scale = one;
    if (equations) {
      const pivot = b.findIndex((v) => !v.equals(zero));
      if (pivot >= 0) scale = (a[pivot] || zero).div(b[pivot]);
      if (scale.equals(zero))
        return {
          status: 'different',
          reason: 'One equation is an identity; the other is not.',
        };
    }
    const equivalent = Array.from(
      { length: Math.max(a.length, b.length) },
      (_, i) => (a[i] || zero).equals(scale.mul(b[i] || zero)),
    ).every(Boolean);
    return {
      status: equivalent
        ? 'equivalent'
        : equations
          ? 'unsupported'
          : 'different',
      leftCoefficients: a.map((n) => n.toFraction()),
      rightCoefficients: b.map((n) => n.toFraction()),
      reason: equivalent
        ? 'Verified by polynomial coefficients, allowing a nonzero constant scale for equations.'
        : equations
          ? 'Not constant multiples. Solution-set equivalence needs another method; do not mark wrong from this result.'
          : 'Polynomial coefficients differ.',
    };
  } catch (e) {
    return { status: 'unsupported', reason: e.message };
  }
}
