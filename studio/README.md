# Prism: Pi-powered learning studio

The browser MVP lives alongside the original deterministic Quadratic Workshop. It uses React, a Node/Express host, SQLite, and the actual Pi SDK. Pi chooses the lesson, representation, new problems and learning recommendations. There is no production scripted-tutor mode or fixed-band progression engine in this studio.

## Run

Use Node **22.19 or newer**; development and live tests used Node 24.14. From `quadratic-workshop`:

```sh
npm install
```

Copy `studio/env.example` to `.env.studio` if that private file does not already exist. Set `TUTOR_API_KEY` to an OpenRouter API key. The current configuration uses `openrouter` / `qwen/qwen3.7-flash`; the provider and model can be changed to another supported Pi catalog entry. The app uses only this explicitly configured key, not credentials from a local Pi login. Never commit the private environment file.

For development:

```sh
npm run studio:dev
```

For the production build:

```sh
npm run studio:build
npm run studio:start
```

Open **http://localhost:4310**. Create an account, choose Class 10 / CBSE, then open Mathematics or a specific skill. Restart the server after changing the environment file. No separate Pi, Python or MCP server installation is needed. `npm run dev` still runs the original application.

## What the MVP includes

- Account registration/sign-in/sign-out; persistent learner identity; Class 10 CBSE setup; subject selection showing the available Mathematics pack.
- Six chapter skills and seven supporting skills; source-aligned lessons and 154 authored questions, plus Pi-generated quadratic questions.
- A dedicated learning path view, chapter/skill entry points, recommended next steps, saved subject journal, and review suggestions.
- Pi sessions with a custom teaching prompt and only explicit learning tools. Default coding tools, skill/extension discovery and unrelated context files are disabled.
- A composed React activity surface: equation working, interactive factor pairs, a substitution canvas, an interactive parabola, explanations and contextual feedback. Math notation uses KaTeX; numerical helpers are reused from the existing prototype. The lightweight parabola renderer is SVG, with keyboard-operable controls.
- Typed working, choices where supplied, hints, alternate explanations, fresh generated practice, exploration observations and finishing/resuming study sessions.
- Separate immutable attempts and Pi-authored interpretations. Evidence includes the activity/problem, curriculum version and whether assistance preceded a submitted step. New sessions load the subject journal, recent evidence, plan and previous activity. Pi session logs persist separately.
- Mathematical tools that compute quadratic roots/discriminants and compare a restricted polynomial grammar. Generated quadratic coefficients are checked before publication. Unsupported algebra is reported as unsupported, not incorrect; no JavaScript expressions are evaluated.
- Server-side solution keys and credentials; validated scene payloads, linked-problem/visual consistency, account isolation, duplicate-action handling, stale-revision rejection, authenticated SSE snapshots and reconnect polling.
- Durable attempts and current scenes before responses are emitted. Failed or interrupted turns offer a retry without re-submitting the evidence. An unfinished model run is marked interrupted when the server restarts.

Initial model responses are capped at 1,536 output tokens per call, with 18 tool calls and 90 seconds per learner turn, and 80 learner turns per study session. A visible update plus the required observation ends the agent loop. Short model follow-up is used if it omits a required visible response or learning observation. Limits are mechanical execution boundaries; Pi makes pedagogical decisions.

## Source and memory boundaries

`content/quadratics.json` is the existing structured chapter pack. `studio/content/graph.json` is copied from the retained Graphify output; `studio/content/source.txt` is the retained textbook text extraction. The runtime uses the structured lessons for reliable notation and exposes source text and raw graph relationships through a read tool. OCR text can flatten superscripts. Raw inferred edges are not mastery claims or hard gates.

SQLite and Pi logs default to `.studio-data/`, ignored by Git. Keep this directory to retain accounts, working and learning history. Use `STUDIO_DATA_DIR` to put it on a persistent disk. Database schema creation is automatic. Student drafts not yet submitted are retained in browser session storage; submitted working is persisted on the server. Browser draft storage is cleared on sign-out.

Do not run multiple server processes against one dataset: this MVP's active-turn locks live in one process. SQLite protects writes, but multi-process turn coordination and distributed streaming are not implemented. Do not treat the Pi log alone as learner memory; it is deliberately supplemented with evidence and observations.

## Tests

```sh
npm run studio:test
npm test
npx oxlint studio
npx playwright install chromium
npm run studio:build
npm run studio:test:e2e
```

The unit/API suite covers mathematical equivalence and root domains, graph prerequisites, real tool contracts, persistence/restart, private answers, isolation, authentication/CSRF, stale and duplicate actions, unsupported scenes, and provider failure/retry. The browser suite runs the full UI on desktop and a mobile viewport, including working restored after refresh and journal updates. It injects a clearly test-only scripted runner through the server constructor; the production entry point never imports it.

The explicit **live** test incurs API usage:

```sh
npm run studio:test:live
```

It uses the actual Pi SDK and configured provider to test a diagnostic, uncertain working, a changed explanation, new generated practice, and subject memory across a runtime/database restart. It writes synthetic-learner results under `studio/test-results/` and a temporary local directory; neither is part of the product dataset.

With the production server running, `node studio/tests/live-browser.mjs` additionally exercises the real-provider UI. This incurs API usage and creates a synthetic account in that server's dataset.

## Hosting

Use a long-running Node host with a persistent writable disk. The studio is not a static-only deployment and its Pi runtime does not run in the original Cloudflare Worker. Set `STUDIO_HOST=0.0.0.0`, the public `STUDIO_ORIGIN` (HTTPS), `STUDIO_PORT`, `STUDIO_DATA_DIR`, and provider credentials through the host's secret configuration. The reverse proxy must preserve the public Host header and support SSE without response buffering. HTTPS origin enables Secure cookies. Use one server instance for this MVP.

A container recipe is included:

```sh
docker build -f studio/Dockerfile -t prism-studio .
docker run --rm -p 4310:4310 --env-file .env.studio \
  -e STUDIO_HOST=0.0.0.0 -e STUDIO_ORIGIN=http://localhost:4310 \
  -v prism-data:/data prism-studio
```

The container recipe is optional; see the verification note for whether Docker was exercised in this environment. `.dockerignore` excludes local keys, account data and test artifacts. Back up the persistent dataset using SQLite's backup facility or with the application stopped; do not copy an active SQLite file without its WAL handling.

## Current product scope

This is a one-chapter browser MVP. Other classes/subjects, handwriting/OCR input, speech, external MCP integrations, desktop installers, cross-device offline AI and school administration are not part of this iteration. The current account flow has no email verification or self-service password reset. These are distinct additions, not silently implied by the setup screen.

Real-model teaching is probabilistic. Numeric checks do not prove that every generated word problem is unambiguous or that every mastery judgment is correct. The existing educator-review status of the pack is preserved. Learner pilots should measure independent transfer and delayed retention; model-selected difficulty and journal labels are provisional.

See `VERIFICATION.md` for the actual checks and observed limitations of this implementation.
