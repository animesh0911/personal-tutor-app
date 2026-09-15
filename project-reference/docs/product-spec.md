# Curious Workshop responsive web MVP specification

Date: 2026-09-05  
Status: approved conversation synthesis; canonical product specification  
Tracker: [local MVP tickets](../.scratch/personal-tutor-mvp/issues/README.md)

## Problem Statement

Class 6 mathematics learners need a simple, enjoyable way to practise independently at their own level. Existing textbook explanations and answer checkers often stop at right or wrong. They do not reliably identify the earliest obstacle, teach the smallest missing idea in an engaging form, return the learner to the original Problem, and verify that the learning transfers.

The product must feel like a game learners want to revisit, without turning active play into a dashboard or an exam workflow. It must launch as a responsive consumer web app in three weeks, work deliberately on desktop and laptop as well as phone browsers, and preserve a practical path to iOS and Android.

## Solution

Curious Workshop presents short Class 6 Mathematics Problems through Chapter Play, Mixed Practice, and a roughly ten-minute Daily Quest. A learner answers through a suitable Learning Interaction or, for selected Boss Problems, submits photographed working. Every Attempt receives immediate useful feedback.

When a Skill is new, Prism offers a short introduction with prerequisite checks selected from that learner's evidence. Recent independent evidence can skip a check; unknown prerequisites receive a small diagnostic; supported gaps receive immediate teaching and a fresh check before returning to the target Skill. This is a local learning interaction, not a placement test. Missing foundations may come from reviewed supplemental content outside the supplied textbook.

When an answer is wrong or reveals uncertainty, the system forms an evidence-backed Misconception Hypothesis, uses a tiny diagnostic when necessary, and lets Prism teach through a short interactive Repair Activity. The learner returns to the original Problem and then completes a changed-values Transfer Problem. Difficulty and Mastery are reconsidered after every three comparable Attempts.

The three-week release is a responsive web product built with Expo and React Native Web. The selected desktop direction is Workshop Journey: a purposeful desktop shell, literal spatial Path, focused quest stage, and contextual Prism tutor-guide. The same backend, contracts, design tokens, and most learning components remain usable for later iOS and Android clients.

## User Stories

1. As a guardian, I want to sign in with Google or Apple, so that I do not manage another password.
2. As a guardian, I want to confirm the learner setup and privacy notice, so that I understand what learning and photo data may be processed.
3. As a learner, I want to choose a nickname and begin with the first Chapter, so that setup is short and requires no placement test.
4. As a learner, I want one obvious Daily Quest action on Play, so that I can begin within seconds.
5. As a learner, I want to see my streak, XP, weekly goal, and current Chapter without crowding the Problem, so that progress feels motivating.
6. As a learner, I want a literal illustrated Path with Prism at the recommended Skill, so that progress feels like a journey.
7. As a learner, I want every published Skill to remain playable, so that recommendation never becomes a lock.
8. As a learner, I want to choose a Chapter and play its Skills, so that I control what I practise.
9. As a learner, I want Mixed Practice across published Chapters without exam language, so that I can combine topics casually.
10. As a learner, I want each active Problem to feel like one focused game scene, so that I do not hunt through a page for the action.
11. As a learner using a laptop or desktop, I want layouts designed for my screen rather than stretched phone cards, so that the product feels intentional.
12. As a keyboard user, I want to complete the entire flow with visible focus and standard controls, so that I am not blocked by pointer-only interactions.
13. As a learner, I want choice, short-answer, and interactive Problems, so that learning is more active than reading paragraphs.
14. As a learner, I want selection and submission to be separate actions, so that an accidental tap does not submit my answer.
15. As a learner, I want feedback after every Attempt whether it is right or wrong, so that every Problem teaches me something.
16. As a learner, I want a correct answer explained briefly when useful, so that success still strengthens understanding.
17. As a learner, I want the app to acknowledge uncertainty instead of confidently misreading me, so that incorrect AI interpretation does not become a false diagnosis.
18. As a learner, I want Prism to identify the first likely obstacle in plain language, so that I know what to fix.
19. As a learner, I want a tiny diagnostic when the cause is unclear, so that one slip does not permanently lower my level.
20. As a learner, I want a short visual or interactive Repair Activity, so that I am not sent back to another textbook paragraph.
21. As a learner, I want to return quickly to my original Problem, so that the explanation has an immediate purpose.
22. As a learner, I want a changed-values Transfer Problem after repair, so that I can prove I understand independently.
23. As a learner, I want the next Problem to become easier, similar, or harder based on recent evidence, so that practice follows my current Skill mastery.
24. As a learner, I want older Prerequisite Skills taught simply even if they were introduced years earlier, so that missing foundations do not stop progress.
25. As a learner, I want Learning Visuals to use one clear visual language, so that diagrams do not change style between explanations.
26. As a learner using assistive technology, I want mathematical speech and text equivalents for every essential visual, so that diagrams are not the only source of meaning.
27. As a learner, I want Prism to guide, teach, react, and transition consistently, so that the character feels like my tutor rather than decoration.
28. As a learner, I want to photograph working only when it genuinely helps, especially in a Boss Problem, so that ordinary play does not require paper and camera use.
29. As a learner, I want to confirm or correct uncertain photo transcription, so that OCR errors are not treated as mathematical errors.
30. As a learner, I want quest progress to survive refreshes and brief disconnections, so that I do not lose work.
31. As a learner, I want a Learning Journal of actual repairs, Transfer successes, and personal records, so that progress feels meaningful without a generic badge gallery.
32. As a learner, I want concise completion feedback showing learning, XP, streak, and weekly-goal changes, so that finishing feels satisfying.
33. As a guardian, I want account deletion and short photo retention, so that the learner's data is not kept unnecessarily.
34. As a curriculum publisher, I want textbook-derived content stored as a versioned Curriculum Pack, so that adding a grade, subject, or country changes data rather than application screens.
35. As a curriculum publisher, I want generated Problems, solutions, prerequisites, and Repair Activities to pass automated and expert review, so that children do not receive unverified live content.
36. As a developer, I want one observable learning workflow and replaceable AI adapters, so that failures and model changes are testable without LangGraph or MCP.
37. As a learner, I want a new Skill's introduction to check only the relevant prerequisites that are uncertain for me, so that familiar material does not delay me and missing foundations receive help before I get stuck.
38. As a learner, I want the app to teach a needed foundation even when it is absent from my textbook, so that textbook coverage does not limit the help I can receive.

## Implementation Decisions

- **Release surface:** the MVP is a responsive web app. iOS and Android are later releases, not three-week deliverables.
- **Universal client:** use Expo, React Native, TypeScript, Expo Router, and React Native Web. Share domain contracts, learning components, and design tokens; isolate browser/native authentication, camera, secure storage, and platform polish behind adapters.
- **Desktop web:** Workshop Journey variant B is canonical. Play uses a compact top application bar and today's short route; Path owns the larger spatial journey; focused learning states suppress global navigation and center the quest stage. Target 1440 x 900 and 1280 x 800 explicitly.
- **Responsive behavior:** Play and normal active learning decisions fit one common-phone viewport at default text size. Path and reference surfaces intentionally scroll. All surfaces still reflow and scroll safely for long math, small devices, landscape, and 200% text.
- **Navigation:** top-level destinations are Play, Path, and Me. Me links to Statistics, Learning Journal, and Settings. There is no standalone Achievements destination.
- **Game layer:** include XP, streak, weekly goal, quest progress, Path movement, personal records, and contextual celebrations. Keep friends, leaderboards, leagues, messaging, shops, lives, and a badge economy outside the MVP.
- **Prism:** Prism is a stateful tutor-guide with ready, leading, thinking, support, celebrate, checking, and victory states. Every appearance must orient, teach, respond, or transition; Prism is absent when it would distract.
- **Learning loop:** `present -> Attempt -> immediate feedback -> diagnostic when needed -> Repair Activity -> retry original Problem -> Transfer Problem -> update evidence -> next Problem`.
- **Prerequisite-aware introduction:** before the first target Problem when a Skill is new, use the reviewed prerequisite graph and learner-specific evidence to select a short introduction, any needed checks, and immediate prerequisite teaching. Observe a check before revealing its solution. A fresh follow-up checks learning; watching an explanation is not proof of understanding. Retain the target Skill and resume it after the detour, or save it for later when the foundation needs a longer activity.
- **Dynamic prerequisite path:** prerequisite relationships belong to shared curriculum data; the subset checked or taught varies by Learner Profile, target Problem, and supported solution method. Recent independent evidence, unknown/stale evidence, supported gaps, and conflicting evidence produce different actions. Unknown is not low Mastery. Intro diagnostics and guided micro-checks inform immediate support without counting as independent Attempts in the three-Attempt adaptation window. Cap an introductory diagnostic sequence at two checks before teaching or offering a bounded next action; do not recursively test the entire graph. All published Skills remain playable.
- **Adaptation:** update difficulty after every three comparable Attempts. Deterministic policy owns Mastery changes; the LLM may recommend, explain, and rank hypotheses but does not silently assign learner ability.
- **Evaluation:** use deterministic validation for choice, numeric, fraction, and constrained-expression answers. Use structured multimodal/model output for open working, First Likely Error, evidence, confidence, and proposed teaching moves. Confidence gates can produce a diagnostic or `cannot_assess` outcome.
- **AI cadence:** feedback is not delayed until the third Problem. Clear deterministic results return immediately; one compact model synthesis after three comparable Attempts may rank misconceptions and recommend the next difficulty.
- **Content:** the first Curriculum Pack is English Class 6 Mathematics derived from the supplied textbook. The learner starts at Chapter 1 without placement. All published content is playable. Quadratic equations are included as an advanced Class 6 Path destination as explicitly requested, with their prerequisites represented as Skills.
- **Practice modes:** support Chapter Play and Mixed Practice over published content. There is no formal subject-wide test in the MVP.
- **Learning Interactions:** initial families are choice, short answer, interactive step/arrangement, and optional photographed working for selected Boss Problems. There is no unrestricted tutor chat or learner-authored “explain it as…” field in the main flow.
- **Learning Visuals:** own a versioned semantic `DiagramSpec`, not a drawing engine. Use `react-native-svg` for common primitives, KaTeX for math notation, restricted JSXGraph for geometry/plots, and restricted Vega-Lite for data charts. All adapters consume Curious Workshop design tokens.
- **Model boundary:** the model emits validated structured data. It cannot emit executable JavaScript, HTML, arbitrary SVG paths, callbacks, remote assets, or visual tokens.
- **Backend:** Supabase Auth, Postgres, private Storage, RLS, and short Edge Functions. The backend owns authorization, quest state, content publication, Attempt records, Evaluation, Mastery, and problem selection.
- **Authentication:** browser-based Google and Apple provider login creates a Guardian Account and one Learner Profile. No school, teacher, classroom, or admin relationship exists in the consumer flow.
- **Orchestration:** implement the live loop as explicit TypeScript state transitions. LangGraph and MCP are not required for the MVP.
- **Content publication:** AI drafts structured curriculum artifacts; automated solvers and validation check them; a mathematics expert approves canonical material and exceptions before a versioned pack reaches learners.
- **Foundations outside the textbook:** authoring checks prerequisite coverage beyond the source textbook. An LLM may propose missing Skills, relationships, diagnostics, and teaching content using approved earlier-grade sources or explicitly identified model-origin drafts. Supplemental material passes the same mathematical, pedagogical, accessibility, and expert publication checks as textbook-derived material. Never invent textbook citations or treat model confidence as approval. Runtime first reuses approved supplemental content; a genuinely uncovered need creates a content-gap record and offers available approved help or another activity while preserving the target. It does not deliver an unreviewed new lesson live.
- **Privacy:** collect minimal account/profile data, keep photos private, strip metadata where practical, use short retention, scrub logs, avoid advertising/session replay, and provide deletion.

## Testing Decisions

- Test externally observable behavior through the highest stable seams; do not assert component internals, prompt wording, or database layout.
- The primary journey test covers sign-in adapter -> Play -> Daily Quest -> Attempt -> Evaluation -> Repair Activity -> original Problem retry -> Transfer Problem -> Mastery evidence -> completion. It uses the real learning runtime and database with controlled auth, model, vision, and clock adapters.
- Contract tests cover `ProblemDefinition`, `Attempt`, `Evaluation`, `TeachingPlan`, `DiagramSpec`, Curriculum Pack versions, and state transitions.
- Deterministic validators and Mastery policy receive exhaustive unit/property tests.
- AI behavior uses a versioned evaluation dataset covering correctness, first-error localization, uncertainty, repair quality, age appropriateness, and solvability.
- Prerequisite-introduction journeys cover learners who know all, some, or none of the relevant foundations; conflicting/stale evidence; bounded deeper gaps; and a prerequisite absent from the textbook. Verify different support paths over one shared graph, fresh checks after teaching, preserved target/resume state, and no unapproved supplemental content reaching learners.
- Every Learning Visual renderer receives schema, semantic, accessibility, and screenshot regression tests. Invalid specs fall back safely.
- Responsive visual tests cover 390 x 844, tablet, 1280 x 800, and 1440 x 900. Browser QA covers Chrome, Safari, Firefox, and Edge.
- Accessibility verification includes keyboard-only completion, focus order, live announcements, math speech, text alternatives, contrast, reduced motion, and 200% reflow.
- Security tests cover RLS isolation, guardian-to-learner ownership, signed photo access, invalid uploads, replay/idempotency, rate limits, deletion, and retention.

## Out of Scope

- Native iOS/Android production releases and store submission during the three-week MVP.
- Science and other grades/countries at launch, while retaining data-driven extension points.
- Arbitrary external homework questions and general handwriting ingestion.
- Unrestricted chat, live voice conversation, generated video, or arbitrary learner prompting.
- Friends, leaderboards, leagues, messaging, social/user-generated content, shops, lives, or payments.
- School, teacher, classroom, and administrator products.
- A rich curriculum CMS; source-controlled packs and review reports are sufficient initially.
- A standalone Achievements/badge collection.
- LangGraph, runtime MCP, autonomous multi-agent tutoring, or a custom universal diagram engine.

## Further Notes

- Prototype fraction content is a UX fixture, not production content. Production routes render server-backed contracts.
- The closest complete manipulative reference, Mathigon Polypad, is not assumed to be a free commercial dependency. The MVP uses permissively licensed renderer libraries and its own semantic Learning Visual vocabulary.
- Success is measured first by useful Evaluation, successful retry, Transfer success, journey completion, and learner clarity; return rate is important but cannot substitute for learning evidence.
- Supporting research and decisions live in `docs/research/`, `docs/design-review.md`, `docs/gamification-patterns-research.md`, and `docs/web-mvp-design-direction.md`.
