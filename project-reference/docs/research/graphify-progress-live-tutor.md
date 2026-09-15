# Graphify progress maps and a question-specific live tutor

Research and design proposal, 6 September 2026. This records proposed functionality; it does not implement an LLM endpoint or alter current progression.

## Recommendation

Use the existing graph as curriculum metadata and put each student's progress over it. Keep the six child-facing chapter milestones and reveal a small prerequisite branch when relevant. Add an optional **Check my step** tutor within each question. Start with typed mathematical working and an explicit submit button; voice and handwriting can follow after the tutoring quality is measured.

These are two separate additions. A live progress map needs no LLM call. The tutor helps interpret reasoning but must not independently award mastery or permanently rewrite the prerequisite graph.

## What the sources actually support

Graphify exports a queryable knowledge graph, an HTML explorer, and a report. Its README describes graph traversal and distinguishes explicit versus inferred relationships. Code extraction is local and deterministic; semantic extraction of documents/PDFs uses a model. These are useful curriculum-authoring and retrieval capabilities. Its documented functionality does not provide our student mastery model or establish that inferred edges are pedagogically valid. We should treat extraction as a draft for review. [Official Graphify repository](https://github.com/Graphify-Labs/graphify).

Hello Interview describes students working through a problem step by step, explaining their thinking, and receiving personalized feedback for each step; its System Design mode also reads a whiteboard. This supports borrowing the interaction pattern. It does not establish learning efficacy for Class 10 mathematics, reveal the product's internal architecture, or prove continuous assessment on every keystroke. [Official Guided Practice overview](https://www.hellointerview.com/practice/overview).

## What is already in our files

The local [graph](../../quadratic-equations-graphify/graph.json) has 38 nodes: 12 skills, 9 prerequisites, 8 modules, 5 application families, 3 assessments, and one course. Its 60 links include 21 `prerequisite_for` edges as well as membership, assessment, teaching-order, and application relationships. A course, exercise collection, and learning skill should not each become an equivalent game level. The [README](../../quadratic-equations-graphify/README.md) explains source-to-target prerequisite direction and inferred confidence.

Important normalization issue: the graph file declares `directed: false`, even though named relationships such as `prerequisite_for` carry direction. Import those edges by their documented source/target semantics. Do not feed the entire file into an undirected traversal and use shortest paths as teaching order. Check the resulting prerequisite-only graph for cycles and review any contradictions.

The [content pack](../../quadratic-workshop/content/quadratics.json) already links all 13 app Skills to existing graph IDs through `graphIds`. All IDs resolve. Mappings are many-to-many: `pairs` and `factor` both link to `skill_split_middle`; `signed` and `roots-arithmetic` both link to `prereq_real_numbers`. Consequently a completed app Skill must not automatically paint every linked raw node mastered. A module can also contain several distinct competencies.

The [engine](../../quadratic-workshop/lib/engine.js) already maintains per-Skill evidence, bands, completion and review times. `active.target` is the session's goal; `active.skill` is what the learner is currently doing. `active.role` and `active.stage` distinguish intro, diagnostic, repair, retry, transfer and review. These values already provide the answer to “which node am I on?” without AI inference.

## Lean graph implementation

Keep three small records, using the existing content and student state wherever possible:

- Curriculum: stable app Skill IDs, reviewed prerequisite IDs, existing graph IDs and source references.
- Student evidence: the current per-Skill progress object, recent independent outcomes, assistance and review date.
- Active activity: goal Skill, current Skill, question, role and stage; saved return question when repairing a prerequisite.

The normal map displays the six chapter milestones. Node presentation has separate dimensions so “current” does not overwrite “completed”: base state is not started, practising, or completed; badges can say here now, support activity, or review due. Inside a node show Foundational / Standard / Stretch and an evidence-based checkpoint indicator. These are question difficulty bands within a Skill, not labels applied to a child's intelligence.

For example, a learner solving by factorisation gets stuck on signed factor pairs. Keep **Factor it out** as the goal and highlight **Find the factor pair** as the current support activity, connected by “This helps with your question.” After the repair, highlight the original question again and then ask a fresh transfer question. The learner sees a useful detour, not lost progress. Another learner with recent prerequisite evidence skips that branch.

A full graph explorer can remain an optional teacher/content-author view. If raw graph-node progress is later required, author explicit coverage rules per node, with a partial state and a list of contributing Skill evidence; do not infer completion merely from `graphIds` membership. Regenerate the graph only when curriculum changes and preserve stable app Skill IDs across versions.

## Live tutor experience

Each question gets a **Talk through this question** or **Check my step** panel alongside the existing final-answer submission. It begins with “What have you tried?” The learner types one equation or explains a decision, sees a math preview, and submits that step. The response acknowledges a specific correct idea, identifies at most one obstacle, and asks one useful next question. A visual can accompany that prompt.

Example question: solve `x² − 5x + 6 = 0`.

1. Student: “I need two numbers that multiply to 6. I chose 2 and 3.”
2. Tutor: “Their product is right. What does their sum need to be to match −5?” The factor-pair visual shows product and sum separately.
3. Student: “−2 and −3, because their product is 6 and their sum is −5.”
4. Tutor: “That matches both conditions. How would you write the two brackets?”
5. The learner finishes, receives supported-practice credit, and gets a different unassisted question before any mastery promotion.

A learner already comfortable with factorisation could receive one compact prompt. A learner struggling with negative multiplication could get a signed-number visual and a short existing prerequisite activity. Personalization should use observed working and recent Skill evidence, not a speculative permanent 'weak student' classification.

## Small backend boundary

Use one authenticated tutor endpoint and one bounded conversation per question. The server resolves the authenticated learner's current question and state; it must not trust a client-supplied answer key or learner ID. Send only the current question, canonical solution and alternative-method rubric, relevant lesson/source excerpt, immediate reviewed prerequisites, current band, recent relevant errors, assistance state and a short conversation history. The whole graph and all account history are unnecessary.

Request a bounded structured result such as:

```json
{
  "stepAssessment": "needs_check",
  "message": "The product is right. Check the sum against the middle coefficient.",
  "nextPrompt": "What must the two numbers add to?",
  "suspectedSkillId": "pairs",
  "suggestedAction": "continue",
  "visual": { "kind": "existing_question_visual", "focus": "sum" }
}
```

Allowed assessments should include valid, needs check, unclear, and unable to verify. Skill IDs and actions must come from the pack. Begin with a reference to a vetted existing visual plus a whitelisted focus; later permit strictly validated numeric parameters for the renderer's existing semantic specs. Never execute generated JavaScript, HTML or arbitrary plotting expressions. JSON/schema validity does not establish mathematical truth.

The LLM's suspected prerequisite is a hypothesis. It can propose a short probe; a deterministic planner decides whether to offer the existing repair. It cannot write the student's band, completion flag or XP directly. If a gap lies outside our reviewed pack, the MVP can give a clearly identified supplementary explanation with bounded examples, but should not silently create a new assessed node or lock the learner behind an unreviewed dependency. Queue repeated missing-skill patterns for content review.

## Correctness and learning evidence

Keep the current final-answer grader authoritative. For intermediate algebra, add small deterministic checks for supported forms: coefficient identities, expansion/factor multiplication, substitution, arithmetic, and roots. Accept alternative valid methods and expression rearrangements; do not match only the author's exact strings. Equation equivalence requires domain-aware handling: dividing by an expression can lose roots, and squaring can introduce extraneous solutions. Finite numeric spot checks alone are not proof of equivalence.

Where parsing or verification is unsupported, the tutor should ask for clarification or say it cannot verify that step, instead of declaring it correct. Test wrong sign changes, dropped roots, repeated/no-real roots, incomplete working, valid alternative methods, and attempts to elicit the complete answer. Evaluate misleading positive feedback and answer leakage with an educator-reviewed set before enabling this for learners.

Treat the current question as assisted when individualized feedback is actually delivered, including “that step is correct.” Opening an empty panel or a failed request need not count as help. Persist that assistance before returning feedback; a refresh or parallel tab must not restore independent credit. Tutor encouragement is feedback, not proof of mastery. Subsequent independent transfer/review responses still control progression. Evidence before a hint can be retained separately later, but the lean MVP should use a conservative assisted flag.

Use request IDs and question/session revisions to prevent duplicate calls and stale responses appearing on a different question. Put API credentials server-side, set turn/token budgets, and fall back to authored hints during timeouts. Send pseudonymous academic context instead of account names/emails; keep a defined short retention period for children's free-text working and make its use clear. These are design requirements, not claims that a provider configuration already exists.

## Suggested order

1. Finish the visual lesson and repair experience already being built.
2. Expose current goal/current activity and prerequisite detours on the existing map, using state already available.
3. Pilot typed **Check my step** for factorisation and the formula, with existing visuals and independent final grading.
4. Expand the same tutor to all question families after measuring mathematical feedback quality, independent next-question success, latency and per-session cost. Add voice or handwriting only when the typed loop is useful.

This preserves the MVP's simple content JSON and deterministic learning loop. Graphify helps organize and audit what is taught; the tutor supplies a more responsive explanation at the precise point of difficulty.
