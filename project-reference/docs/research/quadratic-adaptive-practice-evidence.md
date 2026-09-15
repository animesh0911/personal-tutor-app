# Evidence for the quadratic adaptive learning loop

Research date: 2026-09-05. Scope: knowledge-component granularity, graph-driven progression, difficulty bands, diagnosis, teaching support, and review. This note proposes policies; it does not change the approved product specification or establish optimal thresholds.

## Recommendation

Use a reviewed Skill graph internally, with a smaller set of learner-facing missions. Keep three provisional Problem difficulty bands, but separate difficulty from teaching support and Skill-specific evidence. Do not require every learner to complete every graph node or all three bands. Include fresh independent checks and later mixed review in the learning loop.

No source reviewed here establishes that one graph node should equal one game level, that exactly three bands are optimal, or that three correct answers prove lasting Mastery. Those are product policies to evaluate, not research conclusions.

## Sources and findings

### 1. Skill granularity should serve diagnosis, not mirror document headings

CMU's official DataLab documentation explains that a learning activity can involve multiple knowledge components (KCs). It advises against decomposing indefinitely into atomic pieces: appropriate granularity depends on the course and activity. Performance data can suggest that a component should split, that a hidden component needs support, or that a learner is receiving unnecessary practice. [CMU DataLab: Key Concepts](https://www.cmu.edu/datalab/getting-started/key-concepts.html)

**App implication:** distinguish graph entities from assessable Skills. A theorem, worked example, textbook heading, and prerequisite procedure are not interchangeable level types. Give a Skill its own evidence record when an observable response can distinguish understanding and the distinction changes teaching. A mission may practise several Skills. This is an implementation inference from the KC model, not a tested recommendation about our game's navigation.

### 2. Different kinds of learning need different instructional choices

The original KLI framework defines KCs through performance on related tasks and distinguishes memory/fluency, refinement, and sense-making processes. It uses these distinctions to discuss why instructional choices should depend on the knowledge being acquired. [Koedinger, Corbett & Perfetti, 2012, Cognitive Science](https://doi.org/10.1111/j.1551-6709.2012.01245.x)

**App implication:** identifying coefficients, explaining why a zero product yields roots, and choosing a solution method need different evidence and teaching. An arithmetic error during a quadratic solution should not automatically lower every associated Skill. Store the target Skill, supporting Skills, observed step, assistance, and uncertainty. The paper is a theoretical framework informed by research, not a validation of our proposed classifier or graph.

### 3. Algebra teaching includes structure and strategy choice

The official IES algebra practice guide recommends analyzing solved Problems, recognizing algebraic structure, and deliberately choosing between strategies. It rates the first two recommendations as minimal evidence and the third as moderate evidence. Its scope is grades 6–12. [IES algebra practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/20)

**App implication:** include “Which method fits this equation, and why?” alongside calculation. For example, an already-factorised equation can teach the zero-product rule without requiring prior success at splitting the middle term. That is a mathematical design judgment: the graph should distinguish method requirements from a preferred teaching sequence. Do not force a single unbranching route through every method. The guide does not validate any specific prerequisite graph or automatic extraction tool.

### 4. Practice should alternate with explanation and recur after a delay

IES's organizing-instruction guide rates spacing, alternating worked solutions with Problems, and linking concrete and abstract representations as moderate-evidence recommendations. Retrieval quizzes to revisit material and deep explanatory questions receive strong ratings; introductory pre-questions and diagnostic allocation recommendations receive minimal ratings. [IES organizing instruction guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)

**App implication:** provide a short explanation, let the learner complete a step, and check a fresh independent Problem. Include later retrieval instead of declaring a Skill permanently finished. Keep introductory diagnostics brief and targeted. The guide does not establish our diagnostic count, exact review intervals, or a minimum number of correct answers. Those require pilot evaluation.

### 5. Mixed practice can develop the choice of method

A cluster-randomized study used the same Problems in different schedules across 54 grade-7 classes. After four months of practice and a review, an unannounced test one month later favored the mostly interleaved condition. The trial involved 787 learners in one Florida district. [IES original project and trial report](https://ies.ed.gov/use-work/awards/efficacy-study-interleaved-mathematics-practice)

**App implication:** after initial focused instruction, revisit several learned quadratic methods together so the learner must select a method from the Problem. Avoid an experience where “finished factorisation level” means never encountering it again. Limitations: this was grade-7 classroom practice, not our Class-10 adaptive app; its effect size is not a prediction for our product. It does not show that every early practice item should switch topics.

## Proposed MVP policy, to validate

- **Navigation:** missions represent meaningful goals such as “solve by factorisation.” Fine-grained support Skills live underneath them and appear when useful.
- **Prerequisites:** check relevant unknown Skills; skip recent independent evidence; offer approved repair for an observed gap. Treat an unknown Skill as unknown, not failed. Avoid recursively pretesting all ancestors.
- **Item bands:** foundational, standard, stretch are authoring metadata. A small Skill may only need one or two useful bands. Stretch is enrichment, not a universal progression gate.
- **Support:** guided, prompted, independent is a separate dimension. A learner can attempt a standard Problem with support, then receive a fresh standard Problem independently.
- **Difficulty features:** record coefficients, signs, number domain, number of steps, representation, and method-selection demand. “Harder” should not merely mean larger numbers.
- **Immediate loop:** Attempt → evaluate → discriminate plausible error causes when necessary → targeted repair → retry original → fresh independent check.
- **Longer loop:** accumulate Skill-specific evidence → choose next practice or mission → revisit after delay with mixed Problems. The existing three-comparable-Attempt window can remain a transparent starting rule; it must not block immediate help or imply certainty.
- **Evaluation:** measure independent fresh-item accuracy, delayed retention, method selection, unnecessary detours, and repeated failed repairs. Engagement alone does not establish learning.

## Ingestion consequences

For each publishable Skill, produce an observable objective, directed typed relationships, Problems with target/support Skill tags, reviewed solutions, diagnostics tied to plausible errors, explanatory blocks, and independent check variants. Preserve source provenance and mark added foundations separately. Require mathematical and teaching review before extracted graph relationships control learner routing. These are proposed engineering safeguards, not claims that an LLM-generated curriculum has been validated by the cited research.
