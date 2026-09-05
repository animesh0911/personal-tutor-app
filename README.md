# Curious Workshop: quadratic equations prototype

A working web prototype with custom email/password registration, server-backed progress, a source-aligned JSON chapter pack, and one deterministic adaptive learning loop. It uses the existing Curious Workshop design tokens. The browser interface is JavaScript/JSX and CSS, with a small Worker-compatible API and SQLite/D1 persistence.

## Scope in this build

- Six playable milestones: recognise, verify roots, factorise, quadratic formula, discriminant, and model/interpret rectangular-area situations.
- Seven supporting Skills and 154 questions in `content/quadratics.json`.
- Short introductions, up to two initial prerequisite probes, immediate hints, targeted repairs, an unaided foundation check, original-question retry, another target question, and delayed review.
- Three provisional demand bands per chapter Skill. Three comparable first-attempt observations drive a band decision. Assisted success, diagnostics, repeated same-day items, and original-question retries do not count as independent progression evidence.
- Completing three independent standard questions marks a milestone completed and schedules review in three days. This is an MVP rule to evaluate, not proof of durable mastery. Completed milestones remain completed when review becomes due.
- Six solved target questions per session. Foundation checks/repairs do not increment that count. A repair episode is bounded and may end with a saved pause rather than a false completion.
- Durable sessions and original-problem return state, account isolation, revision conflict detection and idempotent submissions. Answer keys stay on the server.

## Content provenance

The pack was manually authored from the supplied NCERT Class X chapter, `class10math/jemh104.pdf` (Reprint 2026–27), and the typed Graphify extraction. Source pages distinguish printed page numbers from physical PDF pages. No ingestion service or live LLM is required.

Most items are original variations aligned to the source concepts. Supplementary foundations are explicitly labelled; they are not claimed to be quoted from the textbook. Graph IDs are retained as mappings, but raw graph nodes are not all treated as levels. The formula explanation adds instructional steps to the brief treatment in the chapter.

Numeric keys and the learning routes have automated checks. Recognition questions and explanations were source-checked during authoring. **Independent teacher review and a learner pilot are still pending.** This pack covers the core chapter concepts, not every textbook exercise or application family; ages, speed/time, circle/right-triangle applications and full worked-step assessment are not in this prototype.

## Run locally

Requires Node 22.13 or newer. From this directory:

```sh
npm install
npm run build
npx wrangler d1 execute DB --local --persist-to "$PWD/.wrangler/state" --config dist/server/wrangler.json --file drizzle/0000_nostalgic_deadpool.sql
npm run dev
```

Apply that migration once to a fresh local database. Hosted migrations are managed by Sites. The development database is ignored by Git and never included in deployments.

## Checks

```sh
npm test
npm run test:api
npx tsc --noEmit
npx oxlint app lib db tests
npm run build
```

The API smoke test needs the local server and creates disposable accounts in the local database. It checks registration/login, resume, account separation, duplicate submissions, stale revisions, CSRF rejection and logout. The standard whole-repository lint command also checks untouched starter components; those contain pre-existing lint violations. The authored application paths pass their scoped lint check.

Browser visual/interaction QA was not requested and has not been claimed. Optional feature-detected WebMCP tools expose progress reading and starting a milestone. A supported WebMCP validation context was not available; those optional tool contracts remain unverified. Ordinary UI operation does not depend on them.

## Account scope

Custom registration/sign-in uses salted PBKDF2 password hashing, opaque server sessions, HttpOnly/SameSite cookies (Secure on HTTPS), prepared queries, and sign-in rate limits. There is no Google/Apple login, email verification, password-reset email, or live-model service. The privately hosted prototype also has the hosting platform's owner-access gate, separate from the application's learner accounts.

## Files that matter

- `content/quadratics.json`: chapter content and provenance.
- `lib/engine.js`: question selection, evaluation and the learning loop.
- `app/workshop.jsx` and `app/globals.css`: learner experience.
- `app/api/workshop/route.ts`: registration, login, session and progress API.
- `db/schema.ts` and `drizzle/`: durable schema and migration.
- `tests/`: mathematical, adaptive-route and API checks.
