# Quadratic equations: curriculum, prototype, and game direction

Date: 2026-09-05
Status: exploration and recommendation. The user has changed the MVP target to Class 10 Quadratic Equations. Rendering technology and game mechanics below are proposals, not approval to rebuild the prototypes or adopt an engine.

Latest scope update: the user has deferred 3D/Blender and requested focus on the continuous learning loop and ingestion engine. The game/platform exploration below is retained for reference; current engine recommendations are in [Quadratic learning engine design](./quadratic-learning-engine-design.md).

## Recommendation

Build **Prism's Quadratic Workshop**: a responsive mathematics tutor presented as a small, tactile invention game. Use a 2.5D workshop for orientation and visible progression, clear 2D mathematical workspaces for learning, and optionally Blender-authored artwork or a small real-time 3D scene after a device-tested comparison.

Keep Expo/React Native Web and the server-owned adaptive learning engine. Do not move the MVP to Unreal. Retain the three-band rule policy with learner-specific prerequisite checks; use the supplied Graphify extraction as draft curriculum input.

The new entry point is textbook Chapter 4, Quadratic Equations. The rest of the supplied Class 10 book is reference/prerequisite material for this release, not a commitment to implement every chapter. Earlier Class 6/Chapter 1 decisions in the current canonical documents are superseded by the user's new scope. The old fraction screens remain visual references.

## What the new folders contain

`class10math/` contains 18 PDFs: 14 chapters, two appendices, answers/hints, and preliminary pages. The preliminaries identify the NCERT Class X Mathematics reprint 2026–27. Inspected the inventory and opening text of every PDF, the complete Quadratic Equations chapter in text and rendered form, and relevant references in Polynomials, Linear Equations, and Answers/Hints.

The quadratic source is [jemh104.pdf](../class10math/jemh104.pdf): 11 PDF pages, with instructional content on printed pages 38–47 and a note page at 48. It covers identification/standard form, modelling situations, roots, factorisation, the quadratic formula, discriminant, and contextual validation. It explicitly assumes prior Class IX factorisation. The formula is presented in the Nature of Roots section and used in examples; there is no substantial standalone completing-the-square teaching sequence in this file. Add a reviewed explanatory bridge where the tutor needs one instead of claiming it is already taught here.

Polynomials provides useful supporting coverage for degree, zeroes, graph intersections, and factorisation. The answers PDF supplies a separate reference for exercises, but extraction of radicals and fractions is imperfect; mathematical notation requires visual verification and deterministic checks before publication.

The Graphify folder includes a readable report, an interactive graph, a curriculum extraction, and a graph export. No content was modified in those folders.

## Graphify: useful draft, with a deliberate import step

The [curriculum extraction](../quadratic-equations-graphify/curriculum-extraction.json) has **38 nodes and 60 relationships**, including 21 `prerequisite_for` relationships. There are no missing endpoints or cycles in that prerequisite subset. Its scope covers nine broad prerequisite nodes, eight teaching modules, assessable Skills, application families, and exercise references.

Before using it in the adaptive engine:

| Finding | Required adjustment |
|---|---|
| `graph.json` declares `directed: false`, although source/target tuples are preserved and the HTML draws arrows | Import typed directional relationships from the extraction and validate orientation. Do not traverse this as an undirected learning dependency graph. |
| It mixes `contains`, `precedes`, `supports`, `develops_skill`, `assessed_by`, and prerequisites | Only applicable prerequisite relationships guide readiness checks. Document order and course membership are not learning barriers. |
| Real Numbers and Arithmetic combines signed numbers, fractions, squares, and square roots | Split into assessable foundations with separate checks and repair assets. A sign error should not trigger the entire Real Numbers chapter. |
| Geometry combines area, perimeter, and Pythagoras | Attach these only to relevant application templates. They are not mandatory for every quadratic-solving activity. |
| Splitting the middle term is linked as a prerequisite to solving linear factors | Make this method-specific: a learner can solve already-factorised equations without learning to split a middle term first. |
| Formula use is marked prerequisite to discriminant work | Review teaching intent: coefficient substitution and arithmetic can support an introductory discriminant task without full mastery of applying the entire formula. |
| `source_location` says “PDF pp. 38–47” | Store printed page and actual PDF page separately, plus exercise/example identifiers and the source file hash. |
| `learning_status: taught` and numeric confidence are graph metadata | They do not record learner Mastery, expert approval, or a calibrated probability of correctness. |
| Nodes/links lack runtime assessment and teaching assets | Add Problem templates, accepted evidence, diagnostics, repairs, Transfer families, support modes, versioning, and review status. |

The Graph Report calls degree-one nodes “isolated”; these are weakly connected, not necessarily disconnected. Degree alone is not evidence of a bad prerequisite. Judge the graph by teaching correctness and coverage, not its appearance or community count.

Review feasibility language: a nonnegative discriminant establishes real solutions to the equation, but those roots may still violate positive length, age, integer, or other contextual constraints. Teach both checks. Use “no real roots” in this chapter; do not silently expand the course to complex-number instruction.

## A chapter route learners can understand

Proposed visible stations:

1. **Find the quadratic:** simplify equations, identify degree, recognise `a ≠ 0`, and identify signed coefficients.
2. **Test a root:** substitute candidate values and see whether the equation holds.
3. **Build the factors:** connect expansion to factorisation and learn the zero-product property.
4. **Find both roots:** solve each linear factor and verify the complete answer.
5. **Use the formula:** substitute coefficients, handle signs, square roots, `±`, and division by `2a`.
6. **Predict the roots:** connect the discriminant to two distinct, repeated, or no real roots.
7. **Build a model:** translate a meaningful situation into an equation, solve, and keep only context-valid solutions.

Introduce a simple application as the opening hook, then return to richer modelling after the necessary Skills. This differs from treating the textbook's linear order as a rigid lock. All published stations remain playable. Mixed Practice initially combines published Skills within quadratics and relevant reviewed foundations.

Each station contains atomic assessable Skills; it is not one giant Mastery score. Three difficulty bands remain useful within those Skills: foundational, standard, stretch. Do not classify factorisation as globally easy and formula as globally hard; each has its own demands and support choices.

## How the actual game could work

The central premise: the learner and Prism bring a workshop back to life, one small apparatus or construction at a time. Mathematics is the action that changes the object. Navigation should never require walking an avatar to a lesson.

### Three game directions

| Direction | Core interaction | Strength | Cost/risk |
|---|---|---|---|
| **Living Workshop — recommended** | Build factors, test roots, repair apparatus; see persistent workshop changes | Extends the selected Workshop Journey and Prism identity naturally | Requires meaningful visual interactions and a modest art library |
| **Puzzle Rooms** | Solve a sequence of mathematical mechanisms to reveal the next room | Strong short-term curiosity and clear endings | Bespoke puzzle authoring is expensive; hints must preserve learning, not become escape-room riddles |
| **Miniature Builder** | Design gardens, structures, and other constrained objects using quadratics | Connects modelling and context-valid roots to visible consequences | Simulation and free construction can overwhelm the chapter scope; suitable for selected Boss Problems |

Use the Living Workshop as the shell and borrow a bounded construction task for a Boss Problem. These are design hypotheses, not evidence that children will return daily.

### Four reusable mathematical interactions

**Factor bench.** Arrange one `x²` tile, five `x` tiles, and six unit tiles into a rectangle. Label its dimensions `x + 2` and `x + 3`; connect the layout to `(x + 2)(x + 3) = x² + 5x + 6`. Offer tap-select/tap-place and keyboard controls alongside dragging. This visual demonstrates the identity with positive geometric dimensions; a later symbolic step can discuss negative roots without pretending negative physical lengths are drawable.

**Root tester.** For `(x − 2)(x − 3) = 0`, test `x = 2` and `x = 3` separately. The mechanism visibly reaches zero when either factor is zero. Show that these are alternative solutions, not a demand that both factors vanish simultaneously. Fade the scaffolding and later require independent root entry.

**Discriminant viewer.** Explore `y = x² − 4x + c` for `c = 3, 4, 5`. The discriminants are 4, 0, −4; the graph crosses, touches, or misses the x-axis. The learner predicts before moving the control, then links the result to the symbolic calculation. Keep this an optional representation when graph-reading is unfamiliar. An equation's mathematical correctness never depends on animation or a plotting approximation.

**Garden builder.** A rectangular garden has area 40 square units and length three units more than its width. Let width be `x`; derive `x(x + 3) = 40`. Solve `x² + 3x − 40 = 0`, yielding 5 and −8, then explain why the dimensions are 5 and 8. A 3D model can make the finished garden satisfying, while the equation and units remain readable on a flat panel. This is an original proposed example, not a quoted textbook exercise.

Avoid decorating unrelated multiple-choice questions with a game animation. The learner should manipulate or reason about the relationship the visual depicts. Also retain ordinary written mathematics and unassisted Transfer so interaction fluency does not masquerade as mathematical understanding.

## Prototype adjustments

The existing mobile and desktop prototypes establish useful foundations: warm canvas, consistent indigo/cyan roles, large actions, clear feedback, reduced-motion/keyboard intentions, and Prism. Preserve those strengths while changing the learning surface.

| Current prototype | Proposed adjustment |
|---|---|
| Play shows a dotted route, a large greeting, and a second quest card | Lead with one meaningful object and one Start/Continue action: “Build the factor machine.” Show the next learning objective and approximate time. Keep extra statistics secondary. |
| Fractions/Chapter 1/Class 6 throughout | Enter Class 10 Quadratic Equations at source Chapter 4. Make the tone confident and inventive; use older-learner testing before making Prism more or less cartoon-like. |
| Main Problem stage is mostly a picture and four choices | Use an equation workspace, tactile manipulation where useful, short typed steps, and root entry. Keep one dominant action. |
| Diagnostic answers route to the same repair; one desktop correct option is visually singled out | Remove answer leakage. Interpret each Attempt before branching; route to the specific foundation supported by the evidence. |
| Repair shows a finished equivalence and asks learners to repeat it | Let the learner complete one missing step. Use a fresh follow-up to distinguish understanding from copying. |
| Adaptive intro exists in docs but not as a prototype | Add ready-to-continue, unknown-prerequisite check, targeted teaching, and deeper-foundation/save-target states. |
| Boss prototype exposes a worked fraction conversion before assessment | For quadratics, start without revealing factors or coefficients that the learner is meant to identify. Record any requested solution help as support. |
| Progress is fixed at six Problems; the map depicts four numbered stages | Distinguish mission stages from counted assessment Problems. Keep optional diagnostics attached to the current stage and explain extra/deferred Transfer honestly. |
| Desktop auth jumps directly to setup | Carry over the guardian-confirmation flow and include error/cancel/recovery states. |
| Some buttons are inert and progress/rewards are fixtures | Make every published interaction work and derive learning/rewards from persisted evidence. Remove the prototype navigator in the app. |
| Statistics asserts a visual strategy is best for the learner | Describe observed evidence instead: “You solved two fresh factorisation Problems without hints.” Avoid fixed learning-style claims. |

Provide an uncluttered math keyboard: minus, fraction, exponent, square root, parentheses, and a way to enter two roots. Accept root order either way. Treat a repeated root as one distinct value with multiplicity two; do not force confusing duplicate entry. Support exact equivalent forms and clearly stated approximation rules. Distinguish “no real roots” from an unanswered input.

For working, preserve the original equation and show one step at a time with accessible prior-step history. Where supported, verify a step's mathematical equivalence; recognise valid alternative methods unless the Problem explicitly assesses a requested method. Do not reduce all quadratic Evaluation to a final-answer string match.

## A daily session worth returning to

Example session, with flexible duration:

1. **Resume immediately:** show the current workshop state and one useful goal. No long cinematic or daily-login ceremony.
2. **Check readiness quietly:** skip foundations with recent independent evidence; give a small check where evidence is unknown.
3. **Do something satisfying:** build or test one mathematical object. Keep Prism's instruction to one useful line.
4. **Teach at the point of need:** a sign error opens a short signed-number explanation in the same context; factorisation failure does not erase success with other Skills.
5. **Verify independence:** retry where appropriate, then answer a fresh Problem with less support.
6. **Leave a visible result:** the learner's workshop gains a functioning part or completed construction, and the Journal records the real learning evidence.
7. **Finish clearly:** celebrate briefly, provide a clear exit, and show an optional next goal for the next visit.

Offer a bounded choice between recommended practice and a learner-selected published station. Optional workshop styling could become an earned expression of ownership, but a shop/currency economy is unnecessary for the pilot. Never remove progress, punish missed days, withhold help through lives, or make Prism unhappy when the learner leaves. XP remains activity recognition and is separate from Mastery.

Test enjoyment, clarity, voluntary return, and independent learning together. More time spent navigating a 3D world is not automatically more engagement with mathematics. Ask Class 10 learners whether the workshop feels inventive or childish and whether they would choose to return without a reminder. A small exploratory cohort can find usability problems; it cannot prove learning efficacy or guaranteed retention.

## Rendering choices

See the primary-source [platform comparison](./research/quadratic-game-platforms.md).

- **2D/2.5D:** recommended default. An isometric room, coherent shadows, tactile objects, and short transformations can feel like a game without a full 3D engine.
- **Blender:** useful for designing Prism, apparatus, and room assets. Export images for the simplest route, or optimized GLB assets for real-time 3D. Blender is an authoring tool, not the live tutor runtime.
- **Three.js / React Three Fiber:** candidate for one optional workshop diorama or construction scene. Keep equations, essential controls, and accessible text outside the decorative canvas; provide a lightweight fallback and measure performance on modest devices.
- **Unreal:** feasible for an installed immersive game or remotely rendered Pixel Streaming. Those are materially different delivery commitments. Streaming requires infrastructure and connectivity beyond the current app plan. Reconsider only if a tested spatial game mechanic justifies that cost.

In every option, the backend still owns Attempt evaluation, Skill evidence, approved content, and next-action decisions. The renderer displays a validated state; no LLM generates executable scene code, physics rules, or arbitrary assets during play.

## Proposed implementation sequence without the old tickets

1. **Reconcile scope and audit content.** Update canonical Class 6/Chapter 1 assumptions, record the Class 10/Chapter 4 entry, import the typed graph, split essential foundation Skills, and build a source/review coverage matrix.
2. **Prove one complete quadratic loop.** Deliver root testing or simple factorisation with learner-specific intro, deterministic Evaluation, repair, fresh Transfer, saved progress, and one meaningful workshop change.
3. **Compare one visual treatment.** Put the same mission in tactile 2D/2.5D and an optional small 3D scene. Compare clarity, loading, control errors, accessibility, and independent Transfer before expanding 3D.
4. **Expand the chapter through the same contracts.** Standard form, factoring, roots, formula, discriminant, contextual applications, prerequisite support, and independent assessment coverage. Publish only reviewed material.
5. **Complete the consumer product.** Guardian/account flows, Path, Chapter/Mixed Practice, Daily Quest accounting, Journal, settings, optional Boss photo input, failure/recovery states, and deployment.
6. **Pilot and refine.** Verify real device performance and observe learners using the app without coaching. Adjust art, instruction length, support timing, and pacing based on what actually helps.

The priority is a genuinely usable and enjoyable learning interaction. Cinematic polish comes after one mission demonstrates that the game action, mathematical meaning, and adaptive support work together.
