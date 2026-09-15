export function questionCoefficients(q) {
  const value = q?.coefficients || q?.check;
  return value && ['a', 'b', 'c'].every((k) => Number.isFinite(value[k]))
    ? { a: value.a, b: value.b, c: value.c }
    : null;
}

// A topic's teaching surface is available even when a model omits its visual.
// Diagnostics without explanation remain unaided. Existing saved scenes benefit too.
export function topicVisual(activity, question, requested = false) {
  if (!activity || !['verify', 'substitute'].includes(activity.skillId))
    return null;
  if (activity.components.some((c) => c.kind === 'substitution')) return null;
  if (
    activity.mode === 'diagnostic' &&
    !requested &&
    !activity.components.some((c) => c.kind === 'explanation')
  )
    return null;
  const coefficients = questionCoefficients(question);
  if (!coefficients) return null;
  return {
    kind: 'substitution',
    title: 'See substitution in action',
    coefficients,
    candidate: 0,
  };
}
