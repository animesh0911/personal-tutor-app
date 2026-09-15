# MVP verification

Verified locally on 14 September 2026 with Node 24.14.0, Chromium, and the actual Pi SDK using OpenRouter / anthropic/claude-sonnet-4.6.

## Results

- `npm run studio:test`: 8 tests passed. Mathematical tools, scene validation, account isolation, authentication/CSRF, durable evidence, stale and duplicate actions, restart recovery, and provider retry were exercised.
- `npm test`: all 26 existing prototype tests passed.
- `npx oxlint studio` and `npx tsc --noEmit`: passed.
- `npm run studio:build`: passed.
- `npm run studio:test:e2e`: desktop and mobile browser flows passed. These use the explicitly test-only runner to make UI assertions repeatable.
- `npm run studio:test:live`: five real-provider turns passed, including a diagnostic, uncertain working, another representation, a generated question, and a new session after reopening the database/runtime. Individual turns took approximately 11–14 seconds. Report: `test-results/live-smoke.json`.
- `node studio/tests/live-browser.mjs`: passed against the actual production server on localhost:4310. Registered a synthetic learner, requested factorisation, submitted uncertainty about signs, received an explanation and interactive factor-pair scene, generated fresh practice, finished the session, opened its journal and learning path. No browser JavaScript errors were reported; public question state omitted answer keys. Screenshots and report: `test-results/live-browser/`.
- Production `/` responds HTTP 200. The HTML fallback uses an explicit build root so Express correctly serves the hidden `.studio-dist` directory.
- Confirmed `.env.studio` and the SQLite dataset are ignored by Git. No provider key is bundled in client assets or configured through browser input.

Screenshots of the real lesson and learning path were visually inspected. Factor-pair controls now start with an unmatched pair rather than pre-filling a common answer. Build and desktop/mobile browser checks were repeated after this adjustment.

## Practical limits

This release covers Class 10 CBSE quadratic equations, including its supporting skills. It is a local browser MVP, not a Windows/macOS installer or a deployed service. The server must be running to use it. Accounts, evidence and model sessions persist locally in `.studio-data/`.

The Docker recipe was not built: the installed Docker client could not connect to a running daemon. Windows and macOS installer testing, additional subjects, and live multi-user load testing were not performed.

Live checks demonstrate integration and these sampled teaching behaviors; they are not a pedagogical effectiveness evaluation. Independent teacher review, learner trials, and delayed-retention measurement remain needed. Responses depend on provider availability and usually take several seconds. The app preserves submitted work and exposes retry on failure.

The repository's existing dependency audit still reports findings in the retained legacy Cloudflare/Drizzle toolchain. The newly introduced mathjs dependency was updated to 15.2.0 during implementation. This verification is not a comprehensive security audit or approval for public deployment.

## Root explanation and low-cost model update — 14 September 2026

Reproduced the user's exact persisted explanation in a browser regression fixture. The old single-dollar splitter interpreted the boundaries of `$$...$$` blocks incorrectly and swallowed prose into math. Recognizing display math before inline math fixes this; both display equations now render separately, with the intervening text intact. Display equations scroll within their card on narrow screens. A mobile regression also caught grid minimum-width overflow, fixed by constraining the activity column.

Added a substitution component with a candidate number input/slider, three colored term values, a running-total diagram and an exact-decimal zero check. Pi can choose it explicitly for examples. Linked verify/substitute teaching scenes also receive it automatically, including saved scenes; unaided diagnostics omit it. Subsequent attempts using that canvas are recorded as assisted.

Validation: 11 unit/API tests and 4 desktop/mobile browser tests passed; production build, scoped lint and TypeScript checks passed. The root browser regression uses the exact offending explanation and checks x=1 and x=4 as roots, x=2 as a non-root, intact prose, display math, and viewport width.

Qwen3.7 Flash passed the five-turn live Pi harness smoke test with the existing 1,536-token cap: diagnostic, feedback/observation, alternative representation, generated practice, and persistence across restart. Observed turn times were 4.9–6.6 seconds. Benchmark results do not establish equivalence to Sonnet's teaching quality. A subsequent live browser check encountered an upstream Qwen HTTP 429 rate limit; this is distinct from the fixed rendering bug.

Follow-up on 15 September: the real Qwen root-checking browser walkthrough passed (`node studio/tests/live-roots.mjs`), producing a standalone worked example with a substitution component and zero browser errors. Unlinked root explanations without that component are now rejected by the scene tool with a corrective message; an explicit help request also enables the canvas on linked diagnostics. Final unit/API checks (11), desktop/mobile browser checks (4), scoped lint and TypeScript checks passed. The running server uses Qwen3.7 Flash. The earlier upstream rate limit cleared on subsequent requests.
