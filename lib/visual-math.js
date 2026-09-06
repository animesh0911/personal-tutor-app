// Approved numerical diagram vocabulary. No expression evaluation or executable content.
const number = (n) =>
  typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 10000;
export function validateVisual(s) {
  if (
    !s ||
    s.version !== 1 ||
    typeof s.alt !== 'string' ||
    !s.alt.trim() ||
    s.alt.length > 1500
  )
    return false;
  switch (s.kind) {
    case 'quadratic_plot':
    case 'formula_steps':
      return (
        [s.a, s.b, s.c].every(number) &&
        (s.kind === 'quadratic_plot' || s.a !== 0) &&
        ['roots', 'discriminant', 'substitution'].includes(s.mode) &&
        (s.x === undefined || number(s.x))
      );
    case 'factor_grid':
    case 'zero_product':
      return (
        Array.isArray(s.factors) &&
        s.factors.length === 4 &&
        s.factors.every(number) &&
        s.factors[0] !== 0 &&
        s.factors[2] !== 0
      );
    case 'polynomial_terms':
      return (
        Array.isArray(s.terms) &&
        s.terms.length === 4 &&
        s.terms.every(number) &&
        s.terms.some((n) => n !== 0) &&
        typeof s.original === 'string' &&
        s.original.length < 250
      );
    case 'coefficient_cards':
      return [s.a, s.b, s.c].every(number) && s.a !== 0;
    case 'signed_square':
      return Number.isInteger(s.n) && Math.abs(s.n) <= 9;
    case 'square_root':
      return (
        Number.isInteger(Math.sqrt(s.n)) &&
        s.n >= 0 &&
        s.n <= 144 &&
        number(s.d) &&
        s.d > 0
      );
    case 'linear_balance':
      return [s.a, s.b].every(number) && s.a !== 0;
    case 'factor_pair':
      return (
        Number.isInteger(s.sum) &&
        Number.isInteger(s.product) &&
        Math.abs(s.sum) <= 100 &&
        s.product !== 0 &&
        Math.abs(s.product) <= 100
      );
    case 'rectangle_area':
      return (
        [s.k, s.extra, s.area].every(number) &&
        s.k > 0 &&
        s.extra >= 0 &&
        s.area > 0 &&
        s.area <= 5000
      );
    default:
      return false;
  }
}
export const tidy = (n) => (Math.abs(n) < 1e-9 ? 0 : n);
export function quadratic(a, b, c) {
  const d = tidy(b * b - 4 * a * c);
  if (a === 0)
    return {
      d: null,
      roots: b === 0 ? [] : [-c / b],
      kind: b === 0 ? 'constant' : 'linear',
      vertex: null,
    };
  const roots =
    d < 0
      ? []
      : d === 0
        ? [-b / (2 * a)]
        : [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort(
            (x, y) => x - y,
          );
  return {
    d,
    roots,
    kind: d < 0 ? 'none' : d === 0 ? 'repeated' : 'distinct',
    vertex: [-b / (2 * a), -d / (4 * a)],
  };
}
export const valueAt = (a, b, c, x) => tidy(a * x * x + b * x + c);
export function fmt(n) {
  const t = tidy(n);
  return Number.isInteger(t) ? String(t) : String(Number(t.toFixed(3)));
}
export function texNum(n) {
  const v = tidy(n);
  if (Number.isInteger(v)) return String(v);
  for (let d = 2; d <= 100; d++) {
    const p = Math.round(v * d);
    if (Math.abs(v - p / d) < 1e-10)
      return `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${d}}`;
  }
  return fmt(v);
}
export function polynomialTex(a, b, c) {
  const term = (n, power, first) => {
    if (!n) return '';
    const coeff = Math.abs(n) === 1 && power ? '' : texNum(Math.abs(n));
    return `${n < 0 ? '-' : first ? '' : '+'}${coeff}${power === 2 ? 'x^2' : power === 1 ? 'x' : ''}`;
  };
  return (
    [term(a, 2, true), term(b, 1, !a), term(c, 0, !a && !b)].join('') || '0'
  );
}
export const linearTex = (a, b) => polynomialTex(0, a, b);
export const factorCoefficients = ([p, q, r, s]) => [
  p * r,
  p * s + q * r,
  q * s,
];
export function factorPairs(product) {
  const pairs = [];
  for (let u = -Math.abs(product); u <= Math.abs(product); u++) {
    if (u === 0 || product % u !== 0) continue;
    const v = product / u;
    if (u <= v) pairs.push([u, v]);
  }
  // Put the desired pair in the pool without ordering it first.
  return pairs.sort((x, y) => x[0] - y[0]);
}
export function plotBounds(a, b, c) {
  const q = quadratic(a, b, c),
    xs = [0, ...q.roots, ...(q.vertex ? [q.vertex[0]] : [])];
  const low = Math.min(...xs) - 2,
    high = Math.max(...xs) + 2;
  const bottom = Math.min(-2, q.vertex?.[1] || 0, c),
    top = Math.max(2, q.vertex?.[1] || 0, c);
  const pad = Math.max(2, (top - bottom) * 0.3);
  return [low, top + pad, high, bottom - pad];
}
