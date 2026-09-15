import { readFileSync } from 'node:fs';
import { NewQuestion } from '../shared/contracts.mjs';
import { inspectQuadratic } from './math.mjs';
import { randomUUID } from 'node:crypto';

export const pack = JSON.parse(
  readFileSync(
    new URL('../../content/quadratics.json', import.meta.url),
    'utf8',
  ),
);
export const graph = JSON.parse(
  readFileSync(new URL('../content/graph.json', import.meta.url), 'utf8'),
);
export const source = readFileSync(
  new URL('../content/source.txt', import.meta.url),
  'utf8',
);
export const skills = pack.skills.map(
  ({ id, title, tagline, prerequisites, foundation, source, graphIds }) => ({
    id,
    title,
    tagline,
    prerequisites,
    foundation: !!foundation,
    source,
    graphIds,
  }),
);
export const catalog = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    chapter: 'Quadratic equations',
    grade: 10,
    board: 'CBSE',
    version: pack.version,
    skills,
    coverage: 'Quadratic Equations · NCERT Class X, Chapter 4',
  },
];
export function readCourse({ skillId, query = '' }) {
  if (skillId) {
    const skill = pack.skills.find((s) => s.id === skillId);
    return {
      skill,
      questions: pack.questions
        .filter((q) => q.skill === skillId)
        .map((q) => ({
          id: q.id,
          prompt: q.prompt,
          math: q.math,
          type: q.type,
        })),
      graphRelations: graph.links.filter(
        (e) =>
          skill.graphIds.includes(e.source) ||
          skill.graphIds.includes(e.target),
      ),
    };
  }
  if (query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = source
      .split('\n\n')
      .filter((s) => terms.some((t) => s.toLowerCase().includes(t)));
    return {
      excerpts: matches.slice(0, 12),
      source:
        'NCERT Class X Chapter 4. Extracted text may flatten superscripts; use the structured lessons for notation.',
    };
  }
  return {
    title: pack.title,
    version: pack.version,
    skills,
    relationships: graph.links,
  };
}
export function authoredQuestion(id) {
  return pack.questions.find((q) => q.id === id);
}
export function generatedQuestion(input) {
  const spec = NewQuestion.parse(input),
    checked = inspectQuadratic(spec.coefficients);
  if (spec.task === 'verify' && spec.candidate === null)
    throw new Error('A verify question requires a candidate value.');
  const { a, b, c } = spec.coefficients;
  const answer =
    spec.task === 'solve'
      ? checked.roots
      : spec.task === 'discriminant'
        ? checked.d
        : spec.task === 'nature'
          ? checked.kind
          : Math.abs(a * spec.candidate ** 2 + b * spec.candidate + c) < 1e-9;
  return {
    id: `generated-${randomUUID()}`,
    skill: spec.skillId,
    prompt: spec.prompt,
    math: checked.equation,
    type: 'working',
    answer,
    check: checked,
    coefficients: spec.coefficients,
    task: spec.task,
    candidate: spec.candidate,
    title: spec.title,
    challengeReason: spec.challengeReason,
    origin: 'generated',
    source: { id: 'chapter4', origin: 'generated-variation' },
    createdAt: new Date().toISOString(),
    curriculumVersion: pack.version,
  };
}
export function publicQuestion(q) {
  if (!q) return null;
  return {
    id: q.id,
    prompt: q.prompt,
    math: q.math,
    type: q.type,
    choices: q.choices,
    source: q.source,
    origin: q.origin || 'course-pack',
  };
}

export const courseBrief = `COURSE: CBSE Class 10 Mathematics, NCERT Quadratic Equations, chapter 4, curriculum ${pack.version}.
Coverage: recognition and standard form; roots; factorisation; quadratic formula; discriminant and nature of real roots; forming and interpreting equations in applications. Earlier-class skills are legitimate short prerequisite detours.
All equations ax^2+bx+c=0 require a != 0. Roots solve the equation; the discriminant is b^2-4ac. Distinguish two real roots, one repeated real root, and no real roots. Reject roots incompatible with a word problem's domain. Do not introduce complex arithmetic as assumed Class 10 knowledge. No evidence of mastery can be inferred merely from visiting a graph node.
The typed teaching map below projects raw Graphify IDs into assessable skills. Prerequisites are directed; raw graph membership and chapter order are not prerequisites. Inferred graph relationships are hypotheses, not validated teaching laws.
SKILLS AND LESSONS:\n${JSON.stringify(pack.skills)}
SOURCE REFERENCES: NCERT Class X Chapter 4, reprint 2026-27, printed pages 38-47. Structured lessons use checked mathematical notation; raw source extraction is available through read_course and can contain flattened exponents.
`;
