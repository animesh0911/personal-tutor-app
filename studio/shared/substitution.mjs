// Decimal inputs are compared exactly: a very small residual is still not zero.
function rational(value) {
  if (!Number.isFinite(value)) throw new Error('Use a finite number.');
  const [mantissa, exponent = '0'] = String(value).split('e');
  const places = (mantissa.split('.')[1] || '').length - Number(exponent);
  const digits = BigInt(mantissa.replace('.', ''));
  return places >= 0
    ? [digits, 10n ** BigInt(places)]
    : [digits * 10n ** BigInt(-places), 1n];
}
const multiply = ([a, b], [c, d]) => [a * c, b * d];
const add = ([a, b], [c, d]) => [a * d + c * b, b * d];
const numeric = ([a, b]) => Number(a) / Number(b);
export function substitute({ a, b, c }, value) {
  const x = rational(value);
  const terms = [
    multiply(rational(a), multiply(x, x)),
    multiply(rational(b), x),
    rational(c),
  ];
  const totals = terms.reduce(
    (all, term) => [...all, add(all.at(-1), term)],
    [[0n, 1n]],
  );
  return {
    terms: terms.map(numeric),
    totals: totals.map(numeric),
    result: numeric(totals.at(-1)),
    isRoot: totals.at(-1)[0] === 0n,
  };
}
