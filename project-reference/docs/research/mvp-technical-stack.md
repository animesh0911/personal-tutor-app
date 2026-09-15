# Technical stack for the three-week responsive web tutoring MVP

Date: 2026-09-05
Status: updated after the web-first and Learning Visual decisions

## Executive recommendation

Build one universal TypeScript application with **React Native through Expo**, ship its responsive web target first, and use **Supabase** as the managed backend: Auth, Postgres, private Storage, Row Level Security (RLS), and a small number of Edge Functions. Call the OpenAI API only from an Edge Function. Model the learning loop as an explicit state column plus ordinary TypeScript transition functions, not as a LangGraph agent. Do not introduce MCP at runtime in the MVP.

This is production-oriented without pretending that a three-week release can support production scale, broad curriculum coverage, or fully autonomous content safety. The minimum deployable system is:

```text
Expo responsive web app
  (future iOS/Android clients share contracts and components)
    |
    | Supabase session JWT
    v
Supabase Auth + Postgres + private Storage
    |
    | authenticated Edge Function
    v
Learning policy/state machine -> OpenAI Responses API
                             -> deterministic validators
```

The web client renders the game and captures interactions; future native clients use the same authority boundary. The backend owns authorization, Attempt records, Mastery updates, Problem selection, prompt assembly, AI calls, and state transitions. A compromised client must not be able to award Mastery, read another learner's records, or obtain provider secrets.

React Native's own guidance recommends using a framework for new apps and identifies Expo as its recommended community framework. Expo is described as production-grade and avoids assembling navigation, native APIs, build tooling, and upgrade support independently. [React Native, “Use a framework to build React Native apps”](https://reactnative.dev/blog/2024/06/25/use-a-framework-to-build-react-native-apps) [React Native getting started](https://reactnative.dev/docs/environment-setup)

## Universal client stack

Use:

- current stable Expo SDK and TypeScript;
- Expo Router for file-based navigation and typed/deep-linkable routes;
- responsive React Native Web layouts for phone, tablet, 1280 x 800 laptop, and 1440 x 900 desktop;
- `expo-image-picker` for the optional photographed Boss Problem;
- `expo-secure-store` for locally persisted sensitive session material where the auth integration requires it;
- EAS web export/hosting or an equivalent static web deployment for the pilot;
- EAS Build and Submit after the web pilot when native distribution starts;
- Sentry for crash/error reporting with PII scrubbing and session replay disabled.

Expo recommends Expo Router for new Expo apps. It supplies file-based routes, native navigation foundations, deep links, lazy route evaluation, and one navigation structure across iOS and Android. [Expo Router introduction](https://docs.expo.dev/router/introduction/)

Expo explicitly describes Expo Go as a limited playground and development builds as the production-grade native development environment. Native Google sign-in requires custom native code and therefore a development build. Use development builds when native work starts so authentication, camera permissions, release signing, and crash reporting are tested in the environment that will actually ship. [Expo development builds](https://docs.expo.dev/develop/development-builds/faq/) [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/)

EAS Build can build both platforms with `eas build --platform all`, supports internal tester distribution, and produces store-ready binaries. EAS Submit can upload them to the stores. [EAS Build](https://docs.expo.dev/build/introduction/) [Expo deployment workflow](https://docs.expo.dev/workflow/overview/)

Do not put curriculum rules or mastery logic into screen components. Organize the app around feature modules such as `auth`, `quest`, `problem`, `repair`, and `profile`; keep generated API types and generic domain types in a shared package. Client state should be limited to presentation state, an in-progress answer, and a recoverable request cache. The database remains the source of truth.

## Backend choice: Supabase over Firebase for this MVP

Both options are credible managed backends. Firebase Authentication supports Google and Apple sign-in, and Firestore Security Rules can enforce authenticated, user-based access. [Firebase Authentication](https://firebase.google.com/docs/auth) [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

Choose Supabase here because the core domain is relational:

- one account owns one or more learner profiles;
- learners have mastery estimates over skills;
- skills have prerequisite edges and curriculum alignments;
- quest sessions contain ordered attempts, interventions, and transfer results;
- content is versioned and linked to sources, rubrics, and validators.

Postgres expresses these relationships, constraints, joins, audit queries, and migrations directly. Supabase combines Postgres with Auth, Storage, RLS, and server-side TypeScript Edge Functions, reducing the number of services a small team must operate. Supabase has an official Expo React Native integration and an official social-auth example covering Apple and Google. [Supabase Expo quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) [Supabase Expo social auth](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth)

Firebase would be the stronger alternative if the team already has deep Firebase experience, wants Firebase Analytics/Crashlytics as the operational center, or the product is naturally document/event shaped. Its NoSQL data model is not a fatal problem, but it is less natural for inspecting and evolving this learning graph and evidence trail. In a three-week build, familiarity can override theoretical fit; absent that advantage, use Supabase.

### Recommended backend components

- **Supabase Auth:** identity federation and session issuance.
- **Postgres:** accounts, learner profiles, curriculum packs, skills, questions, quest sessions, attempts, interventions, mastery estimates, and audit metadata.
- **Private Storage:** optional handwritten-work images and internal curriculum source files.
- **Edge Functions:** `start-quest`, `submit-attempt`, `request-hint`, `complete-repair`, `delete-account`, and internal content ingestion/publishing endpoints if needed.
- **SQL migrations and generated database types:** schema changes are reviewed and reproducible.

Supabase documents Edge Functions as server-side TypeScript functions suitable for small AI inference and orchestration calls to providers such as OpenAI. It also warns that cold starts are possible and long-running work should move to background workers. Keep live quest functions short; run textbook ingestion as a local/CI authoring command in the MVP rather than inside the live request path. [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Authentication: Google and Apple, without inventing passwords

Use Supabase Auth as the identity broker:

- browser-based Google sign-in for the web MVP;
- browser-based Apple sign-in for the web MVP;
- native Google and Apple adapters when the iOS/Android phase begins.

Expo's Apple authentication module supports iOS, while Expo's Google guidance requires a development build and platform signing configuration. Supabase recommends native Sign in with Apple on Apple platforms and supports Google in native Android/iOS apps. [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/) [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google) [Supabase Apple sign-in](https://supabase.com/docs/guides/auth/social-login/auth-apple)

### Future App Store implications

Apple's App Review Guideline 4.8 says an app using a third-party/social login such as Google for its primary account must also offer an equivalent privacy-preserving login option, subject to listed exceptions. Sign in with Apple is the straightforward way to meet that expectation here. Apple also requires apps supporting account creation to offer account deletion within the app and expects a working demo account or fully featured demo mode for review. [Apple App Review Guidelines, 2.1, 4.8 and 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/) [Apple account-deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app)

Google Play likewise requires an in-app account-deletion path and a public web deletion/request URL when an app allows account creation. [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)

Implement deletion in week two, not as post-launch cleanup. It must remove the guardian account, learner profiles, attempts, mastery data, and uploaded images unless a documented legal retention duty applies. Revoke Sign in with Apple tokens during deletion, as Apple directs. Do not equate signing in with a social provider with parental consent; authentication establishes control of an account, not necessarily the legal relationship to a child.

## Guardian identity and learner profile can stay visually simple

The data model still needs two concepts even if the UI does not emphasize them:

- `account`: the adult-controlled Google/Apple authenticated identity;
- `learner_profile`: nickname/avatar, grade or curriculum choice, learning preferences, and mastery state.

For the MVP, automatically create one learner profile immediately after first sign-in and ask only for a nickname and Class 6 selection. The learner stays signed in on the family device, so daily play remains one tap. This costs roughly one table and one foreign key; it avoids permanently attaching a child's mastery record and uploads directly to an adult's provider identity and keeps the route open to multiple siblings later.

The parent-facing consent/privacy step occurs after provider sign-in and before creating the learner profile or accepting a photo. A product lawyer should review the exact flow before public launch. India’s Digital Personal Data Protection Act treats a person under 18 as a child. The final 2025 Rules use phased commencement, with the child-consent mechanics scheduled later than publication; build toward them now rather than treating the transition window as a reason to collect more data. A Google/Apple login by itself should not be treated as proof that the signer is the parent. [India Code, Digital Personal Data Protection Act 2023](https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf) [MeitY, Digital Personal Data Protection Rules 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

## AI integration and secret handling

The app calls an authenticated Edge Function. The Edge Function validates the session and account-to-learner ownership, reads approved problem/rubric context, calls the OpenAI Responses API, validates structured output, records the result, applies the deterministic learning policy, and returns a small UI response.

Never ship an OpenAI API key, Supabase secret/service key, Apple private key, Google client secret, or Sentry auth token in a browser or future native bundle. OpenAI explicitly says API keys must not be exposed in client-side apps and should be loaded from server environment variables or a key-management service. Supabase distinguishes the publishable key, which is designed for public clients when RLS is enabled, from secret keys that bypass RLS and must never be used in a browser/client. [OpenAI API authentication](https://platform.openai.com/docs/api-reference/authentication) [Supabase function secrets](https://supabase.com/docs/guides/functions/secrets)

Use strict request and response schemas. Record model, prompt version, curriculum-pack version, retrieved source IDs, latency, token use, confidence, and policy outcome, but do not put a child's name, provider email, raw photo, or full answer text into general-purpose logs. OpenAI states that API data is not used to train its models unless the customer opts in, while default abuse-monitoring logs may retain customer content for up to 30 days. Confirm the provider configuration and retention terms appropriate to this child-facing product before launch. [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)

OpenAI's under-18 API guidance calls for age-appropriate disclosures, content filters, monitoring/escalation paths and appropriate age assurance. It also says not to process personal data of children under 13, or the applicable age of digital consent, without first implementing Zero Data Retention. This makes provider data controls a launch requirement rather than a future optimization. [OpenAI under-18 API guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)

## Security baseline for minors

This product is intentionally directed at children, so “we only collect a nickname” does not remove child-privacy obligations. Photos, persistent identifiers, authentication data, and learning histories can all be sensitive.

Minimum technical controls:

1. Enable RLS on every exposed table and Storage bucket. Deny access by default, and test policies for cross-account access.
2. Authorize every Edge Function from the verified JWT and server-side account/learner relationship; never trust a client-provided `learner_id` alone.
3. Keep uploaded work in private Storage with short-lived authenticated or signed access. Supabase Storage uses RLS and denies uploads by default until policies are created. [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) [Supabase private downloads and signed URLs](https://supabase.com/docs/guides/storage/serving/downloads)
4. Strip image metadata where practical, compress images before upload, reject non-image files, enforce size limits, and delete originals on a short documented schedule after evaluation unless retention has an explicit learning purpose.
5. Collect no date of birth, address, school, phone, contacts, location, advertising identifier, or microphone recording in the MVP.
6. Use no advertising SDKs. Avoid third-party product analytics initially; write a small allow-listed first-party event table containing pseudonymous IDs and learning-loop events.
7. Add per-account/device rate limits, idempotency keys for attempt submission, bounded AI timeouts, and safe fallback responses.
8. Provide privacy notice, parental consent, data export/deletion contact, retention schedule, and in-app deletion before pilot distribution.

Google Play requires child-targeted apps to disclose collection through their APIs/SDKs and treats authentication, camera data, device data, and advertising identifiers as sensitive. It also restricts identifiers, location, and unapproved SDKs for child-directed services. [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335)

Apple requires care with children's data and makes the developer responsible for third-party SDK behavior. Kids Category apps face additional restrictions, including parental gates for some actions and strong limits on third-party analytics/advertising. Whether to enter the Kids Category is a product/legal choice, but avoiding the category does not avoid child-privacy law when the app is actually directed to children. [Apple App Review Guidelines, 1.3 and 5.1](https://developer.apple.com/app-store/review/guidelines/) [Apple child-safety guidance](https://developer.apple.com/kids/)

For later US distribution, COPPA generally requires covered child-directed services collecting personal information from under-13s to give parents notice, obtain verifiable parental consent, provide parental rights, protect data, and implement retention/deletion procedures. Photos containing a child's image and persistent identifiers are among the covered categories. [FTC COPPA six-step plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)

## The learning engine does not need LangGraph or MCP

The live loop is a bounded workflow, not an autonomous agent:

```text
QUEST_ACTIVE
  -> ATTEMPT_SUBMITTED
  -> FEEDBACK_READY
  -> NEXT_PROBLEM | DIAGNOSTIC
  -> REPAIR
  -> RETRY
  -> TRANSFER
  -> QUEST_COMPLETE
```

Implement allowed transitions as pure TypeScript functions and persist the current state and append-only events in Postgres. A single `submit-attempt` Edge Function can perform the transaction: load state, reject invalid/replayed transitions, evaluate, append evidence, update state, and return the next presentation. This is not a separate platform or major framework; it is ordinary business logic that must exist regardless of orchestration library.

LangGraph describes itself as a low-level runtime for long-running, stateful agents, emphasizing durable execution, checkpointing, streaming, and human-in-the-loop orchestration. Those are useful when an agent runs for a long time, dynamically chooses tools, pauses mid-run, or must resume complex branching work. They do not remove the need to define this app's states, authorization, domain records, failure behavior, or learning policy. Adding it now introduces another state/persistence abstraction alongside Postgres. [LangGraph overview](https://docs.langchain.com/oss/javascript/langgraph/overview)

MCP is an interoperability mechanism for exposing external resources and tools to models. The MVP's diagram generation, speech, solver, and retrieval calls are known internal dependencies; call them behind ordinary TypeScript interfaces. Adopt MCP later only if the same tools must be dynamically discovered or shared across different agent hosts. It would not reduce the work of creating pedagogically correct diagrams, securing requests, or validating outputs.

Revisit LangGraph when workflows become long-running and dynamically agentic—for example, multi-stage content authoring with human interrupts and recoverable jobs. Revisit MCP when outside content/tool providers must plug into the platform without bespoke adapters.

## Content validation: who does what in a consumer app?

No school is required. Validation is an internal publishing workflow, like editorial review in any consumer education product.

### Developer responsibility

- build the generic curriculum-pack schema and import command;
- preserve source/page provenance;
- run schema checks, duplicate checks, deterministic answer checks, independent model/solver comparisons, and regression evals;
- make disagreements and low-confidence items impossible to publish accidentally;
- version prompts, packs, and validators;
- build a minimal internal review page or export a reviewable spreadsheet/JSON report.

The developer validates **software invariants and evidence**, not whether an explanation is pedagogically good.

### Independent mathematics teacher responsibility

- approve the initial skill and prerequisite map;
- approve all remediation templates and worked examples;
- review every canonical assessment item in the small MVP set;
- review all items where solvers/models disagree or confidence is low;
- sample generated variants before each curriculum-pack release;
- review real, de-identified failure cases during the pilot.

The teacher is an internal contractor/adviser, not a school administrator and never appears in the learner's account flow. For three chapters, this can be a few focused review sessions. The consumer app remains self-serve.

### AI and automated checks

AI drafts skills, prerequisites, variants, misconceptions, hints, visual scripts, and explanations in a strict schema. Automated gates verify that references exist, constraints are satisfiable, answers are consistent, difficulty metadata is present, and independent solution paths agree. Only a published, immutable pack reaches children.

Do not build a rich content-management system in three weeks. For the MVP, store source JSON/Markdown in Git, generate a validation report, and have the teacher approve a versioned pull request or export. Build a web CMS only after the review workload proves its shape.

## Observability without surveilling children

Use two layers:

- Supabase's Logs Explorer and Edge Function invocation logs for backend failures and latency;
- Sentry for mobile crashes and symbolicated stack traces.

Supabase records API, Auth, Storage, Postgres, and Edge Function logs. Expo documents a Sentry integration for Android/iOS, EAS Build, source maps, and crash reporting. [Supabase logging](https://supabase.com/docs/guides/monitoring-and-debugging/logs) [Expo Sentry guide](https://docs.expo.dev/guides/using-sentry/)

Configure Sentry before the pilot, but turn off session replay and automatic screenshot/view capture, disable default collection that is not required, and scrub account emails, learner nicknames, answers, photos, auth headers, signed URLs, prompt bodies, and model outputs. Use random internal IDs and coarse device/app version metadata. Product analytics can initially be direct server-side events such as `quest_started`, `attempt_checked`, `repair_started`, `transfer_succeeded`, and `quest_completed`.

## Three-week implementation boundary

### Build now

- Expo TypeScript app, Expo Router, responsive web preview/production profiles, and real browser URLs;
- browser-based Google and Apple provider sign-in through Supabase Auth;
- one auto-created learner profile per authenticated account;
- three interaction types: choice, short answer, interactive step arrangement;
- optional photo upload only for a Boss Problem, with low-confidence fallback;
- one 10-minute quest loop and explicit state machine;
- Postgres schema, migrations, RLS, private Storage, Edge Functions;
- deterministic validation for MCQ, numeric, fraction, and constrained expression answers;
- server-side OpenAI call for structured diagnosis/explanation when required;
- mastery update after each three comparable attempts;
- a versioned `DiagramSpec` boundary with themed renderers: `react-native-svg` for common Learning Visuals, KaTeX for notation, and restricted JSXGraph/Vega-Lite adapters only when curriculum content requires them;
- versioned Git-based curriculum pack plus automated checks and teacher approval;
- in-app account deletion, privacy/consent screen, retention job/process;
- Sentry crash reporting with child-safe scrubbing and first-party learning events;
- desktop and responsive web layouts based on Workshop Journey, with a focused quest stage, literal Path, purposeful Prism states, keyboard completion, visible focus, 200% reflow, and reduced-motion behavior;
- one web pilot deployment verified on current Chrome, Safari, Firefox, and Edge.

### Explicitly defer

- LangGraph, LangChain, MCP, autonomous multi-agent tutoring;
- unrestricted chat and learner-authored custom prompts;
- live RAG over arbitrary textbook uploads;
- a full CMS or teacher/school dashboard;
- Apple OAuth on Android unless user testing shows demand;
- multiple learner profiles per guardian in the UI;
- friends, leaderboards, leagues, messaging, and user-generated social content;
- video generation, real-time voice conversation, arbitrary model-generated SVG/HTML/JavaScript, and a custom universal drawing engine;
- general handwriting transcription/editing and arbitrary homework ingestion;
- offline-first quest execution and conflict resolution;
- subscriptions and payments;
- third-party behavioral analytics, advertising, and session replay;
- broad country/grade/subject support before curriculum-pack import and eval quality is proven.
- TestFlight, App Store, Play Store, and native production delivery; these follow validation of the web learning loop.

## Decision summary

The fastest defensible stack is **Expo/React Native Web + EAS + Supabase + server-side OpenAI + Sentry**, with a tiny, explicit TypeScript learning state machine and a validated Learning Visual contract. Supabase wins over Firebase for this project's relational learning evidence and because it bundles the exact backend pieces needed. Google and Apple provider login remove password handling but do not remove account deletion, consent, child privacy, or identity-model responsibilities.

The content pipeline does not make the developer the math authority. The developer owns enforceable gates; a contracted teacher owns mathematical and pedagogical approval; automated solvers and model comparisons reduce the teacher's workload. That is the smallest responsible version of an LLM-heavy consumer tutoring product.
