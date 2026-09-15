# Game platform options for the quadratic-equations MVP

Date: 2026-09-05
Status: research and proposal; does not replace the approved specification

## Recommendation

Keep the responsive Expo web application and make the Workshop Journey feel like a small, tactile game. Use clear 2D mathematical interactions, an illustrated/isometric workshop, and selectively add Blender-authored 3D assets. Trial one lightweight Three.js/React Three Fiber scene before committing to a fully 3D world. Do not move the MVP to Unreal Engine.

This is a product/engineering judgement, not evidence that any engine will improve retention. The existing design direction already requires one obvious action, focused Problem screens, meaningful Prism reactions, keyboard support, reduced motion, text equivalents, and a later native route. Those requirements favor a game presentation around the learning engine, with ordinary accessible controls retaining authority over answers and navigation. See [web design direction](../web-mvp-design-direction.md), [technical stack](mvp-technical-stack.md), and [gamification research](../gamification-patterns-research.md).

The user has changed the subject to Class 10 quadratic equations. Existing Class 6/fractions wording in canonical documents is therefore stale context, not a reason to keep a younger visual tone. Consider a stylish invention workshop rather than preschool character styling. Test that judgement with the actual learners.

## Options

| Approach | What learners see | Fit and tradeoff |
|---|---|---|
| 2D/2.5D Workshop | Illustrated stations, tactile tiles, animated mechanisms, short Prism reactions | Recommended base. Keeps the existing UI and learning-visual approach; depth can come from art and layering without a running 3D scene. |
| Browser 3D with Three.js/R3F | Small interactive diorama, animated Prism, one apparatus per mission | Feasible enhancement. Requires device profiling, scene optimization, accessible controls, and a non-3D fallback. |
| Blender assets | Authored models/animations exported into either of the above; pre-rendered artwork is another option | Recommended authoring option. Blender supplies art, not the app's learning engine or deployment platform. |
| Unreal native | Installed, fully immersive game with engine-controlled scenes and input | Technically possible but changes the delivery/product strategy and creates a separate client stack. Consider only if later research establishes that a full spatial game is central. |
| Unreal Pixel Streaming | Browser receives an interactive video stream from a remotely running Unreal application | Feasible delivery mechanism, poor MVP fit: remote rendering infrastructure and continuous streaming add operational and connectivity requirements. |

R3F is a React renderer for Three.js. Its documented native implementation uses `expo-gl` and `expo-asset`, so it offers a route to the planned Expo native targets. This is not proof of effortless portability: web/native imports, loaders, and physical-device testing remain necessary. [R3F installation and native guidance](https://r3f.docs.pmnd.rs/getting-started/installation)

R3F documents on-demand rendering and adaptive performance techniques. A mostly stationary workshop should render when it changes and reduce scene quality on weaker devices; it need not redraw indefinitely while a learner reads an explanation. [R3F performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)

Blender exports glTF/GLB meshes, materials, and supported animations for web/native runtimes. We would author a modest asset library, optimize it, and load it in the app; model-generated lesson content must not introduce arbitrary remote models or executable scene behavior. Blender's former Game Engine was removed in 2.80. [Blender glTF documentation](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html), [Blender release notes](https://www.blender.org/download/releases/2-80/)

## Unreal: distinguish browser rendering from streaming

Do not budget Unreal as a normal current-engine HTML5 export. Historical community HTML5 tooling targets UE4, including a maintained-source fork describing UE4.27.2/WebGL2; that is a separate engine/toolchain commitment, not the existing Expo web pipeline. The old Epic HTML5 documentation URL did not expose usable body text during this review, so this note does not rely on forum quotations as official documentation. [HTML5 extension maintainers' documentation](https://github.com/UnrealEngineHTML5/Documentation/blob/master/Platforms/HTML5/HTML5SDKRequirements/HTML5SDKRequirements.md), [UE4.27 HTML5 fork's own documentation](https://github.com/SpeculativeCoder/UnrealEngine-HTML5-ES3)

Epic's documented Pixel Streaming route runs the Unreal application remotely, renders/encodes there, and sends video/audio to browsers; keyboard, mouse, touch, and custom browser events travel back. This differs fundamentally from downloading a scene and rendering it on the student's device. [Epic Pixel Streaming overview](https://dev.epicgames.com/documentation/unreal-engine/overview-of-pixel-streaming-in-unreal-engine)

Epic lists hardware encoding requirements and WebRTC-capable client browsers. Individual learners would also need isolated application state/session routing: multiple viewers of one shared stream do not automatically become independent tutoring sessions. Capacity, concurrency, network delay, bandwidth, reconnect behavior, and cost require measured design work; no per-student cost estimate is justified yet. [Epic Pixel Streaming reference](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-pixel-streaming-reference), [official infrastructure repository](https://github.com/EpicGames/PixelStreamingInfrastructure)

My inference: this is unnecessary operating complexity for short daily mathematics sessions. It can be reconsidered for a later immersive experience, but visual quality alone is not a reason to stream the entire tutor.

## A concrete game treatment to test

Proposal: **Prism's Quadratic Workshop**. Today the learner repairs one apparatus. The same mathematical problem, evaluation policy, and adaptive prerequisites work whether the apparatus is illustrated or 3D.

1. Enter directly at the current station with one `Continue` action; no walking through a world to reach a lesson.
2. Use factor tiles to construct a rectangle, then connect the dimensions to a factorized quadratic. Keep algebra and signs explicit; an area metaphor must not silently treat negative lengths as physical lengths.
3. At a root-testing station, substitute a candidate value and show why the resulting expression becomes zero. Clearing a mechanism requires mathematical evidence, not dexterity.
4. Where curriculum-appropriate, show a parabola crossing/touching/missing the axis to connect roots to a visual. Do not make graph reading a compulsory new prerequisite for an algebraic method merely because the game looks attractive.
5. If a prerequisite gap appears, open a short tool lesson within the same station, then return to the original apparatus. A repair is help, not a lost life or punishment.
6. End with a visible workshop change and a plain statement of learning, such as “You found both roots and checked them.” Keep the exit clear; offer additional practice optionally.

These are design hypotheses. The durable motivation should come from satisfying manipulation, comprehensible feedback, agency, achievable sessions, and visible learning progress. No engine can guarantee that children will love it or return daily.

## Input and evaluation constraints

Keep mathematical text and answer controls outside the decorative canvas where practical. Offer tap-select/tap-place and keyboard alternatives to dragging, avoid required camera manipulation, preserve static/reduced-motion scenes, and expose visual conclusions in text. WCAG requires alternatives to nonessential dragging, keyboard operation, and relevant motion/interaction provisions; these need deliberate implementation in any rendering engine. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Before broad 3D investment, compare the same learning mission in 2D and a small optional 3D scene on a modest phone and laptop. Measure time to first usable Problem, input errors, completion, repair recovery, independent Transfer, and whether learners voluntarily return. Ask learners what felt enjoyable versus obstructive. Also check frame stability, loading, keyboard, screen reader, zoom, and reduced motion. Choose 3D only where it improves the experience without degrading learning or access.
