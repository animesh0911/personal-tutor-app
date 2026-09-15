import { z } from 'zod';

export const skillIds = [
  'signed',
  'coefficients',
  'substitute',
  'pairs',
  'zero',
  'linear',
  'roots-arithmetic',
  'recognise',
  'verify',
  'factor',
  'formula',
  'discriminant',
  'model',
];
export const SkillId = z.enum(skillIds);
const short = z.string().trim().min(1).max(160);
const prose = z.string().trim().min(1).max(2400);
const number = z.number().min(-1000).max(1000);
export const Coefficients = z
  .object({
    a: number.refine((n) => n !== 0, 'A quadratic needs a nonzero a'),
    b: number,
    c: number,
  })
  .strict();
export const Component = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('equation'), title: short }).strict(),
  z
    .object({
      kind: z.literal('substitution'),
      title: short,
      coefficients: Coefficients,
      candidate: number,
    })
    .strict(),
  z
    .object({
      kind: z.literal('factor-pairs'),
      title: short,
      sum: number,
      product: number,
    })
    .strict(),
  z
    .object({
      kind: z.literal('parabola'),
      title: short,
      coefficients: Coefficients,
      revealRoots: z.boolean(),
    })
    .strict(),
  z
    .object({ kind: z.literal('explanation'), title: short, body: prose })
    .strict(),
]);
export const Activity = z
  .object({
    title: short,
    skillId: SkillId,
    goalSkillId: SkillId,
    mode: z.enum([
      'diagnostic',
      'practice',
      'explore',
      'worked-example',
      'review',
      'challenge',
    ]),
    prompt: prose,
    problemId: z.string().max(100).nullable(),
    components: z.array(Component).min(1).max(4),
  })
  .strict();
export const Feedback = z
  .object({
    tone: z.enum(['encouragement', 'hint', 'question', 'success', 'clarify']),
    text: prose,
    nextAction: z.enum(['try-again', 'continue', 'new-question']),
  })
  .strict();
export const NewQuestion = z
  .object({
    skillId: SkillId,
    title: short,
    prompt: prose,
    coefficients: Coefficients,
    task: z.enum(['solve', 'discriminant', 'nature', 'verify']),
    candidate: number.nullable(),
    challengeReason: short,
  })
  .strict();
export const Observation = z
  .object({
    skillId: SkillId,
    note: prose,
    confidence: z.enum(['tentative', 'supported', 'strong']),
    status: z.enum(['exploring', 'practising', 'ready-for-review', 'secure']),
    evidenceIds: z.array(z.string().max(100)).min(1).max(12),
    revisitInDays: z.number().int().min(0).max(60),
  })
  .strict();
export const LearningPlan = z
  .object({
    summary: prose,
    steps: z
      .array(z.object({ skillId: SkillId, reason: short }).strict())
      .min(1)
      .max(6),
  })
  .strict();
export const StudentAction = z
  .object({
    actionId: z.uuid(),
    activityId: z.uuid(),
    revision: z.number().int().nonnegative(),
    kind: z.enum([
      'submit',
      'hint',
      'continue',
      'new-question',
      'explain-differently',
      'exploration',
    ]),
    text: z.string().trim().max(3000).default(''),
  })
  .strict()
  .refine(
    (a) => a.kind !== 'submit' || a.text.length > 0,
    'Please enter your working first.',
  );
export const Account = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z.string().min(10).max(200),
    name: z.string().trim().min(1).max(40),
    grade: z.literal(10),
    board: z.literal('CBSE'),
  })
  .strict();
export const Login = Account.pick({ email: true, password: true });
export const StartSession = z
  .object({
    requestId: z.uuid(),
    subject: z.literal('mathematics'),
    skillId: SkillId.nullable().default(null),
  })
  .strict();
