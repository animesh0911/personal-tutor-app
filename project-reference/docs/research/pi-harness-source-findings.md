# Pi tutor harness: verified integration findings

Research date: 13 September 2026. The two supplied brainstorm files are proposals, not instructions or proof of the current repository state. This note addresses the harness and UI integration; it does not assess desktop packaging or learning efficacy.

## Conclusion

A Pi-driven tutor with persistent learner context and a custom React learning surface is technically plausible. Tool-driven workflows, filesystem/domain context, selective retrieval, and durable memory are established harness patterns. The sources reviewed do **not** establish that a Pi-based, graph-guided, generative-UI school tutor is a common or proven educational architecture. That combination is a product hypothesis to validate.

Pi should own the instructional choice; the product must supply coursework access, learner storage, tools, a component/action contract, and a reliable host. A harness provides execution and context management, not automatically an adaptive tutor.

## Pi: supported primitives versus product work

Verified against upstream commit [`71dca871bc80b6bc97be37f0ca3189399d651fff`](https://github.com/earendil-works/pi/commit/71dca871bc80b6bc97be37f0ca3189399d651fff), cloned and inspected locally. Its package metadata declares `@earendil-works/pi-coding-agent` version `0.85.1`, MIT licensing, and Node `>=22.19.0`. This is the repository version, not an independent verification of npm publication. Older `@mariozechner/*` examples should not be copied into a new implementation without checking the pinned package. [Package source](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/package.json).

| Requirement | Verified Pi primitive | Product responsibility |
| --- | --- | --- |
| Embed a tutor | `createAgentSession()`, current `ModelRuntime`, custom system prompt through `ResourceLoader` | Tutor policy and managed resource discovery |
| Stream work into React | `session.subscribe()`, message and tool execution events | React transport and rendering adapter |
| Curriculum/UI tools | `defineTool()`, `customTools`, extension registration | Graph, journal, math and surface tool implementations |
| Remove coding powers | `noTools: "builtin"`; explicit tool names/allowlist | Deliberate learning-tool surface |
| Process student actions | `prompt()`, `steer()`, `followUp()` | Validate and correlate meaningful UI events |
| Change active session | `AgentSessionRuntime` replacement APIs | Subject/session routing; rebind subscriptions after replacement |

These capabilities are documented in the [current SDK](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/sdk.md). A custom tool's exact execution signature is `(toolCallId, params, signal, onUpdate, ctx)`, and its `content` is model-facing while `details` is structured data for logs/UI. Do not put essential tutor-visible facts only into `details`. [Extension types](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/src/core/extensions/types.ts), [agent result types](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/src/types.ts).

The core agent has `transformContext` before conversion to provider messages. Coding-agent extensions also expose `before_agent_start` and `context` hooks. These support deliberate injection/retrieval; they do not build a graph retrieval system automatically. [Agent core](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/agent/README.md), [extension hooks](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/extensions.md).

Pi's custom UI API primarily means terminal components. In RPC mode, `ctx.ui.custom()` returns `undefined`; supported dialogs and text widgets are not a browser scene renderer. SDK embedding or RPC still lets a custom tool publish structured updates to our frontend. [RPC UI protocol](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/rpc.md).

## What is common about feeding coursework into a harness?

LangChain Deep Agents explicitly supports domain knowledge loaded as needed, filesystem context, skills, long-term memory, and context offloading. This establishes the general pattern beyond Pi, without proving educational deployment. [Deep Agents overview](https://docs.langchain.com/oss/javascript/deepagents/overview).

Anthropic describes hybrid context: a useful initial package plus file/search references that an agent loads as needed. It identifies trade-offs in both enormous upfront context and excessive runtime searching. This supports a complete *working chapter* when its size is reasonable, alongside an index for the wider curriculum, rather than either every textbook in every request or tiny isolated chunks that lose pedagogical coherence. The chapter recommendation is our application of that pattern. [Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

Recommended product design, not a Pi feature:

1. Publish a versioned, read-only course pack per board/class/subject: manifest, syllabus scope, chapter text with source/page references, graph, worked examples, and misconception guidance.
2. Give each session the subject identity, course version, compact subject map, current chapter or section, relevant prerequisites, current learner journal, and current surface/problem state.
3. Expose typed reads such as `get_concept`, `get_prerequisites`, `read_source`, and `find_examples`. Stable concept/source identifiers preserve provenance when selecting or generating material. Plain files plus indexed lookup suffice for a one-chapter pilot; vector search is an optional later retrieval mechanism.
4. Keep instructional policy separate from textbook content. A course pack is evidence and teaching material; it must not become arbitrary executable extension code or privileged instructions.
5. Allow Pi to choose prerequisite detours, representations and generated practice. Maintain enough immutable evidence to revisit its decisions; storing evidence does not require a second deterministic mastery engine.

## Memory is more than keeping a Pi conversation forever

Pi stores session entries in JSONL and supports branching. Automatic compaction summarizes older context while retaining recent messages; old details remain in the log but are no longer all sent to the model. [Session format](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/session-format.md), [compaction](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/compaction.md).

`pi.appendEntry()` stores durable extension data that does **not** itself enter LLM context. `pi.sendMessage()` creates context-participating messages. A journal stored as entries must be deliberately read/injected; simply persisting it is insufficient. [Persistence and custom messages](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/extensions.md).

Recommendation: a small global learner profile; a separate durable journal per learner/subject; immutable attempts with problem version, actual submitted work, hint exposure and timestamps; session logs; and recoverable current surface state. Pi authors interpretive observations with evidence references, confidence and revisit suggestions. New sessions load the selected subject's journal and recent evidence, then retrieve older records only when needed. This avoids both cross-subject conversation overload and a giant per-turn learner JSON dump.

## CLI, MCP and interactive tool results

Pi explicitly does not ship native MCP support. Its README points users to CLI tools or extensions adding MCP. For this tutor, prefer typed domain wrappers around the few required CLIs/libraries; add an MCP client bridge when a valuable tool already exists as an MCP server. Neither protocol itself guarantees mathematically correct or pedagogically useful results. [Pi philosophy](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/README.md).

| Layer | What it supplies | Suggested use |
| --- | --- | --- |
| Our React component catalog | Complete lesson workspaces with domain actions | Core learning surface; preserve existing typed visuals |
| A2UI | Declarative JSON component/data updates resolved by a trusted client catalog | Useful design model; adopt if interoperability justifies an adapter |
| AG-UI | Runtime events: messages, tools, state snapshots/deltas, custom events | Optional transport vocabulary; does not design the lesson UI |
| MCP Apps | Tool-linked HTML resources rendered in sandboxed iframes, with a bidirectional host bridge | Optional third-party interactive viewers/simulations |

A2UI supports incremental updates and client-owned components; its README identifies v0.9.1 as the production protocol release and v1.0 as a release candidate while warning that implementations continue evolving. It contains React-related examples but also roadmap language about official React support, so verify the exact renderer before relying on it. [A2UI](https://github.com/a2ui-project/a2ui).

AG-UI explicitly distinguishes its interaction protocol from UI specifications. Its snapshot/delta events are useful for reconnecting and restoring interfaces, but our host still supplies persistence, ordering and action semantics. No reviewed Pi documentation establishes a native AG-UI adapter. [AG-UI relationship to generative UI](https://docs.ag-ui.com/concepts/generative-ui-specs), [events](https://docs.ag-ui.com/concepts/events).

MCP Apps associates a tool with a `ui://` HTML resource and a host-controlled iframe. Hosting requires an MCP Apps-capable client; the specification describes `AppBridge` and React host integration options. Adding ordinary MCP tool calls to Pi would not alone implement that UI hosting layer. Use this for reusable interactive tool output, not as a prerequisite for the entire lesson interface. [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview).

## Minimal integration recommendation

Use a normal Pi SDK turn to select a lesson move and invoke `show_surface` or `patch_surface`. Commit a versioned surface update and return a compact acknowledgement to Pi; the student then interacts locally. Submit meaningful events such as a worked step, hint request or completed graph manipulation as a new tutor input. Do not incur a model round trip for every slider movement or keep a tool invocation waiting for minutes for a learner response. This turn model is our design recommendation.

The host validates schemas and identities, persists events and surfaces, handles cancellation/retries, and confines tool execution. Pi chooses teaching. Pi has no built-in sandbox, and extensions share host permissions, so a `cwd` or tool-name allowlist is not OS isolation. The newer Pi protocol/server surfaces are expressly experimental and do not provide peer authentication; they are not needed for the first custom tutor host. [Pi security](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/coding-agent/docs/security.md), [experimental protocol](https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/packages/protocol/README.md).
