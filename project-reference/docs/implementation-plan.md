# Curious Workshop web MVP implementation plan

Date: 2026-09-05  
Status: canonical three-week plan  
Source specification: [product-spec.md](./product-spec.md)  
Ticket index: [local MVP tickets](../.scratch/personal-tutor-mvp/issues/README.md)

## Delivery target

Deploy one responsive consumer web pilot that demonstrates the complete learning promise for published Class 6 Mathematics content:

`Play -> Daily Quest -> Attempt -> Evaluation -> Repair Activity -> retry -> Transfer Problem -> adaptation -> completion`

The pilot includes deliberate desktop/laptop layouts, a responsive phone-browser experience, Google and Apple login, persistent learner progress, Prism, Path, XP/streak/weekly goal, Learning Journal evidence, and one optional photographed Boss Problem flow.

## Week 1 — prove the vertical spine

- Establish the Expo/React Native Web application, responsive Workshop Journey shell, tokens, routes, and automated checks.
- Serve and render one real `ProblemDefinition` through the backend.
- Implement the first `DiagramSpec`/KaTeX renderers using design tokens.
- Add Google/Apple Guardian Account login and Learner Profile setup.
- Start and resume a six-Problem Daily Quest.

Exit criterion: a learner can authenticate and complete one persisted, curriculum-backed Problem on desktop and phone browser without hardcoded route content.

## Week 2 — complete the teaching loop

- Add deterministic checking and immediate feedback.
- Add structured model-assisted Evaluation with confidence and retrieval.
- Deliver Prism-led diagnostic and interactive Repair Activity.
- Add prerequisite-aware introductions: consult each learner's evidence, check uncertain foundations, teach supported gaps, and preserve the original target across bounded detours.
- Return to the original Problem, issue a Transfer Problem, and update Mastery after three comparable Attempts.
- Publish the reviewed first Curriculum Pack slice through the generic content pipeline.
- Include reviewed supplemental foundations absent from the textbook and a content-gap fallback for uncovered needs.

Exit criterion: the full incorrect-answer learning loop and learner-specific prerequisite introduction work end to end and are covered by journey-level tests, including a foundation absent from the textbook.

## Week 3 — make the product coherent and pilot-ready

- Extend the same contracts across the remaining published Skills and interaction families.
- Complete Play, Path, Chapter, Mixed Practice, Boss photo flow, Quest Complete, Me, Statistics, Learning Journal, and Settings.
- Implement XP, streak, weekly goal, personal records, and Prism state transitions from one source of truth.
- Complete AI/content eval gates, RLS/security/privacy controls, error/offline recovery, observability, accessibility, responsive/browser QA, and web deployment.

Exit criterion: an invited learner can use the deployed web pilot without designer/developer assistance, and invalid/uncertain AI or visual output fails safely.

## Dependency order

```text
001 Responsive web foundation
 ├─ 002 One curriculum Problem
 │   ├─ 004 Learning Visual system
 │   └─ 005 Persistent Daily Quest ─ 006 Deterministic Evaluation
 └─ 003 Guardian Account and Learner Profile ─┘

006 ─ 007 Evidence-controlled Evaluation ─ 008 Prism Repair Activity
008 ─ 009 Retry and Transfer ─ 010 Mastery adaptation
004 + 006 ─ 011 Curriculum Pack publication
010 + 011 ─ 012 Complete responsive learning journey
003 + 007 + 012 ─ 013 Photographed Boss Problem
005 + 009 + 010 ─ 014 Game loop and Learning Journal
007 + 008 + 011 ─ 015 AI/content quality gate
012 + 013 + 014 + 015 ─ 016 Pilot hardening and deployment
```

## Non-negotiable implementation rules

- Desktop web is a first-class surface; do not stretch mobile cards across a browser.
- Existing mobile prototypes remain references and are not overwritten by desktop mockups.
- No route hardcodes a chapter's Problem, answer, explanation, or diagram.
- LLM output is structured, validated, confidence-gated, and never executable drawing/UI code.
- Design tokens own visual treatment across every renderer.
- Immediate feedback happens per Attempt; difficulty synthesis happens after three comparable Attempts.
- All published Skills are playable. Recommendation is visual guidance, not locking.
- Prism performs a job whenever present.
- XP and streak are motivation signals, never Mastery.
- Accessibility and failure states are acceptance criteria, not a final polish ticket.
