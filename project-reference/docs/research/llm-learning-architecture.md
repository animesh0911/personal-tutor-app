# LLM-first learning architecture: evidence and recommendation

Date: 2026-09-04

## Executive conclusion

Build an **LLM-heavy, evidence-controlled** tutor, not an LLM-only grader.

An LLM can do much of the variable work: interpret a response, propose skill labels and misconception hypotheses, choose a teaching move, personalize wording and examples, and draft new content. It should not be the sole authority for mathematical correctness, prerequisite diagnosis, curriculum alignment, or mastery updates. Those decisions affect what a child learns next and need verifiable evidence, explicit uncertainty, and regression evaluations.

This does not require CBSE-specific business logic. The scalable pattern is to keep the engine generic and represent each curriculum as data: skills, relationships, problems, response contracts, rubrics, references, and approved teaching assets. Industry interoperability standards already separate these concerns. [1EdTech CASE](https://www.1edtech.org/standards/case) models competency frameworks and associations; [1EdTech QTI](https://www.1edtech.org/standards/qti/index) exchanges assessment items, interactions, scoring and results.

## What the evidence says

### Solving a problem is not the same as diagnosing a learner

LLMs can be strong problem solvers yet remain unreliable at locating the first error in another person's reasoning. A 2024 EMNLP study built 1,002 teacher-annotated stepwise solutions and found error localization challenging; grounding tutoring generation in a separate verifier produced more targeted, correct responses with fewer hallucinations. [Daheim et al., *Stepwise Verification and Remediation of Student Reasoning Errors with Large Language Model Tutors*](https://aclanthology.org/2024.emnlp-main.478/)

Later work reported that state-of-the-art LLMs still struggled to locate the first wrong step even when given a reference solution. [Maurya and Kochmar, *LLMs cannot spot math errors, even when allowed to peek into the solution*](https://aclanthology.org/2025.emnlp-main.553/)

The MathDial study similarly found that a capable solver is not automatically a capable tutor: baseline models produced factually wrong feedback or revealed answers too early, while tutoring improved when teacher moves and pedagogical structure were introduced. [Macina et al., *MathDial*](https://aclanthology.org/2023.findings-emnlp.372/)

Recent evaluation of authentic student work found that training could improve correctness classification and error localization, but generated feedback remained notably worse than teacher-written feedback and was often verbose or insufficiently targeted to the underlying misconception. [Hsu, Tang and Yen, *MathEDU*](https://aclanthology.org/2026.eacl-long.132/)

The practical implication is important: a wrong answer provides evidence, not proof, of a prerequisite gap. The system should form a hypothesis, ask one or two tiny discriminating questions, and update the learner model only after observing further evidence.

### RAG grounds content; it does not prove correctness

Textbook retrieval is useful for provenance, terminology, definitions, worked examples and curriculum-consistent explanation. It does not, by itself:

- turn a PDF into a skill dependency graph;
- prove that a student's algebraic step is valid;
- distinguish a misconception from a slip, ambiguous input or OCR error;
- validate that a generated problem has one appropriate answer;
- establish that remediation caused learning.

This is an architectural inference supported by provider APIs treating retrieval, output constraints, graders and evaluations as separate capabilities. OpenAI's Structured Outputs guarantee conformance to a supplied JSON Schema, but OpenAI explicitly notes that models can still produce incorrect values, including wrong mathematical steps. [OpenAI, *Introducing Structured Outputs in the API*](https://openai.com/index/introducing-structured-outputs-in-the-api/)

The same provider states that hallucinations remain a fundamental challenge and recommends rewarding appropriate uncertainty rather than forcing guesses. [OpenAI, *Why language models hallucinate*](https://openai.com/index/why-language-models-hallucinate/)

Therefore, use retrieval to supply approved sources and require source identifiers in the model's diagnosis. Use tools or reference data to validate exact claims wherever feasible.

### Personalization works best as an interaction policy, not unconstrained generation

OpenAI describes Study Mode as a structured learning interaction using guiding questions, scaffolding, personalized support and knowledge checks. This is closer to the desired product than requesting one long explanation. [OpenAI, *Introducing study mode*](https://openai.com/index/chatgpt-study-mode/)

For this app, remediation should be small and active:

1. name the immediate obstacle without labeling the child;
2. demonstrate one short visual or worked example;
3. ask the learner to complete the next small step;
4. return to the original problem;
5. use a changed-values transfer problem to test independent understanding.

The model can personalize the surface form—analogy, reading level, character dialogue, worked example, voice script—but should choose from a bounded set of pedagogical moves and must not silently overwrite the learner's skill state.

## A scalable model without subject hardcoding

Avoid both extremes:

- **Bad extreme A:** chapter-specific `if/else` code and database columns tied to CBSE Class 6.
- **Bad extreme B:** an uploaded textbook plus one prompt that asks the model to infer everything at runtime.

Instead, hardcode a small, generic learning ontology and import subject/country-specific instances.

Suggested entities:

- `CurriculumFramework`: CBSE/NCERT, Common Core, Cambridge, or another published framework.
- `Skill`: a portable capability, with aliases and framework alignments.
- `SkillRelation`: prerequisite, parent/child, equivalent, narrower/broader.
- `LearningResource`: source excerpt, diagram, narration, worked example or activity.
- `ProblemTemplate` and `ProblemInstance`: response type, variables, constraints and expected evidence.
- `Rubric` / `Validator`: reference solution, acceptable methods and machine checks.
- `AttemptEvidence`: observed response, correctness evidence, latency, hint use and confidence.
- `MisconceptionHypothesis`: candidate skill gap, evidence and confidence—not a permanent label.
- `Intervention`: selected pedagogical move and presented content.
- `TransferResult`: whether learning generalized to a fresh problem.
- `MasteryEstimate`: skill-specific state updated by an explicit policy.

CASE provides a standard representation for frameworks, competencies, hierarchical and cross-framework associations, rubrics and unique identifiers. It is a good conceptual and interchange model for portable curriculum packs. [1EdTech CASE overview](https://standards.1edtech.org/case/)

QTI provides a standard for exchanging items, tests, response interactions, scoring/results, accessible content and technology-enhanced interactions. It can inform content packaging even if the first internal JSON format is simpler. [1EdTech QTI 3 specification portal](https://www.1edtech.org/standards/qti/index)

This approach still requires content mapping. The scalable win is that mapping produces data rather than new application code.

## Recommended responsibility split

| Capability | LLM may own | Needs control or verification |
|---|---|---|
| Turn a source chapter into draft skills, examples and mappings | Yes, as an authoring assistant | Human/eval approval before publishing |
| Generate problem variants | Yes, within structured constraints | Solver/reference validation and sampled review |
| Parse typed or selected responses | Yes | Schema validation; exact input retained |
| Interpret handwriting/photo | Yes, later | User correction path and confidence thresholds |
| Check MCQ/numeric/fraction expressions | No need | Deterministic answer/rubric/symbolic checks |
| Evaluate open multi-step reasoning | Propose a structured judgment | Reference solution, verifier/tool, confidence and fallback |
| Infer misconception/prerequisite | Propose ranked hypotheses | One or two diagnostic probes before state change |
| Choose tone, analogy and teaching wording | Yes | Age/safety policy, retrieved sources and response limits |
| Decide the next problem | Recommend candidates | Explicit mastery/adaptation policy makes final choice |
| Update mastery | No | Deterministic policy over logged evidence |

This is not extensive hardcoding. Deterministic checking can be pluggable by response contract—exact match, numeric tolerance, fraction equivalence, symbolic equivalence, set equality, unit-aware value, rubric, or model-assisted open response. Unsupported response types can fall back to a confidence-gated model judgment without pretending to be definitive.

## Runtime evaluation flow

1. The client submits a structured attempt with problem ID, response and interaction evidence.
2. Cheap deterministic validators immediately handle MCQ, numeric and constrained symbolic responses.
3. Retrieval supplies the relevant curriculum skill, approved source fragments, rubric and acceptable methods.
4. For open work, an LLM returns strict structured output: correctness, first likely error, evidence, ranked hypotheses, confidence, suggested probe and proposed teaching move.
5. A verifier/tool checks exact mathematical claims when supported.
6. A policy layer chooses `accept`, `repair`, `probe`, or `cannot_assess` based on evidence and confidence.
7. The learner receives immediate feedback; remediation remains interactive and short.
8. After three comparable attempts, the policy updates mastery. A single wrong answer may trigger a probe, but should not demote mastery by itself.
9. A transfer problem confirms that the learner can use the repaired skill independently.

Persist every intermediate result so failures are debuggable and prompts/models can be re-evaluated offline.

## Does evaluating three questions in one call save money?

It can reduce cost modestly by amortizing repeated system instructions, curriculum context and tool descriptions across three attempts. It also produces one coherent adaptation recommendation. But it does **not** reduce the student response or output tokens, and one larger call can anchor later judgments on earlier answers, couple failures, increase latency, and delay useful feedback until the third problem.

Do not confuse a synchronous request containing three attempts with the provider's Batch API. OpenAI's Batch API is asynchronous, offers a 50% discount, and currently has a 24-hour completion window; it is inappropriate for a ten-minute interactive session. [OpenAI Batch API reference](https://platform.openai.com/docs/api-reference/batch/object)

Recommended compromise:

- validate each MCQ/numeric response immediately without an LLM;
- respond immediately to clear errors or successes;
- collect three comparable evidence records;
- make one LLM call after three items only for synthesis, misconception ranking and the next teaching/difficulty decision;
- if combining three open evaluations, require an independent result and confidence per item in an array, followed by a separate aggregate recommendation;
- benchmark this against three independent calls because cost optimization is worthwhile only if quality and latency remain acceptable.

Prompt caching and compact structured context may reduce repeated-input cost without withholding feedback. Treat current provider pricing and caching rules as deployment-time choices, not domain architecture.

## MCP and workflow orchestration

MCP is not a pedagogy engine, agent framework or workflow orchestrator. Its specification defines an interoperability protocol through which servers expose prompts, resources and executable tools to an LLM application. [Model Context Protocol server overview](https://modelcontextprotocol.io/specification/2025-06-18/server/index)

For the MVP, ordinary internal APIs or SDK calls are simpler for a solver, content store, diagram renderer and text-to-speech service. Add MCP when a tool genuinely needs to be interchangeable across model hosts or reused by other AI clients. Whether a diagram or voice capability is reached through MCP says nothing about whether its educational output is correct.

Likewise, LangGraph is optional. A fixed learning loop with a handful of explicit states is easier to implement and observe as normal backend application logic. Introduce a graph/agent framework only if runtime branching, resumability and tool orchestration become complex enough to justify it.

## Content ingestion: let the LLM do the labor, not the final approval

A generic curriculum-pack pipeline can minimize manual effort:

1. ingest licensed source material and preserve page/section provenance;
2. have an LLM draft skills, prerequisites, worked examples, misconception candidates and problem templates in a strict schema;
3. run automated checks for duplicates, broken references, unsatisfied prerequisites and solvability;
4. solve generated items with a separate tool/model and compare outcomes;
5. review a risk-based sample and all low-confidence/conflicting artifacts;
6. publish an immutable versioned pack;
7. run regression evals before changing models, prompts or packs.

The MVP can begin with fewer reviewed artifacts while still using this generic pipeline. What should not happen is live, unreviewed textbook-to-tutor generation for children with no quality gate.

## Minimum eval program before a pilot

Create a labeled set covering every supported response type and the intended three chapters. Include:

- correct solutions using different valid methods;
- incorrect final answers with correct intermediate reasoning;
- first-error annotations;
- arithmetic slips versus conceptual misconceptions;
- ambiguous, incomplete and adversarial inputs;
- generated problem solvability and age appropriateness;
- diagnosis precision and appropriate abstention;
- remediation factuality, brevity and non-answer-revealing behavior;
- transfer success after remediation;
- consistency across repeated runs and pinned model versions.

OpenAI provides Evals as an explicit facility for testing criteria across datasets and model configurations, reinforcing that production behavior must be measured rather than assumed. [OpenAI Evals API](https://platform.openai.com/docs/api-reference/evals)

For a child-facing pilot, make confident wrong feedback more costly in the eval score than an honest `cannot_assess` result.

## MVP decision

Use the LLM extensively, but constrain its authority:

- **Yes:** multimodal interpretation, structured hypothesis generation, engaging dialogue, analogies, examples, hints, draft content and cross-curriculum mapping.
- **No:** one unconstrained call as grader, prerequisite diagnostician, curriculum model, adaptation policy and tutor simultaneously.
- **No:** live RAG over PDFs as the complete content platform.
- **No:** MCP or LangGraph as assumed requirements.
- **Yes:** generic curriculum/skill data, deterministic validators where cheap, confidence-gated probes, explicit mastery policy and versioned evals.

This preserves the product's generic vision while making its most consequential decisions inspectable, testable and portable.
