# Open-source stack for a controlled educational diagram language

Research date: 2026-09-05  
Scope: a web-first AI tutor that will also ship through Expo/React Native on iOS and Android. Sources are official project documentation, repositories, standards, and license pages.

## Decision

Do **not** build a universal diagram engine, and do **not** allow the LLM to generate arbitrary SVG, HTML, JavaScript, Mermaid, or library configuration.

Build a small, versioned product-owned `DiagramSpec` and route each approved diagram kind to an open-source renderer:

- `react-native-svg` for the portable drawing surface and the small set of high-frequency school-math manipulatives;
- KaTeX for mathematical notation;
- JSXGraph for interactive coordinate geometry and function plots on the web;
- Vega-Lite for conventional data charts;
- specialist adapters later for chemistry or simulations.

This reuses mature rendering and interaction code while keeping the tutoring product's visual vocabulary, accessibility, validation, and pedagogy under control. There is no single permissively licensed library that covers fractions, geometry, charts, circuits, molecules, biology figures, accessibility, and native rendering well.

For the Class 6 Math MVP, only four to six custom semantic renderers should be necessary: fraction bar, fraction circle, number line, area/grid model, place-value blocks, and simple labelled shape. These are reusable primitives, not chapter-specific drawings. Richer geometry and charts are delegated to JSXGraph and Vega-Lite.

## What can be reused

| Need | Reuse | License | Where it runs | Recommendation |
|---|---|---:|---|---|
| Fractions, number lines, area grids, labelled shapes | [`react-native-svg`](https://github.com/software-mansion/react-native-svg) primitives (`Circle`, `Rect`, `Path`, `Polygon`, text) | MIT | iOS, Android, React Native Web, plain React web | **Core MVP surface.** Implement a thin semantic layer on top. |
| Equations and mathematical notation | [KaTeX](https://github.com/KaTeX/KaTeX) | MIT | Web/DOM | **Use on web.** Keep LaTeX as source data and hide the renderer behind a platform interface for native. |
| Geometry, coordinate planes, draggable points, function plots | [JSXGraph](https://jsxgraph.org/home/) | MIT or LGPL (dual licensed) | Browser; SVG or Canvas; multi-touch | **Use the MIT option** for rich web interactives. On native, initially embed the web renderer or provide a native adapter only for heavily used interactions. |
| Bar, line, scatter, histogram and other data charts | [Vega-Lite](https://vega.github.io/vega-lite/docs/) | BSD-3-Clause | Browser-oriented JavaScript; compiles declarative JSON to Vega | **Use a restricted subset.** Its JSON grammar and published schema are a good fit for validated generated content. |
| Safe parsing of plot expressions | [math.js](https://mathjs.org/docs/expressions/) | Apache-2.0 | Browser, Node.js, JavaScript runtimes | Optional. Parse to an AST and allowlist nodes/operators; never use JavaScript `eval`. |
| Hand-drawn rendering treatment | [Rough.js](https://github.com/rough-stuff/rough) | MIT | Browser SVG or Canvas | Optional visual effect, not a semantic dependency. It has a small primitive API but its latest listed release is old, so isolate it behind styling. |
| Geometry computation/drawing utilities | [Mathigon Euclid.ts](https://github.com/mathigon/euclid.js/) | MIT | TypeScript; SVG and Canvas drawing tools | Optional helper if JSXGraph is too large for static geometry. It is not a full manipulative system. |
| Advanced animated React math visualizations | [Mafs](https://github.com/stevenpetryk/mafs) | MIT | React in the browser | Useful for prototypes or selected interactives, but not the core because it is web/React-specific and code-authored rather than a ready educational content schema. |
| Flow/process diagrams | [Mermaid](https://github.com/mermaid-js/mermaid) | MIT | Browser/JavaScript | Later only. It is useful for flowcharts, not fraction models or textbook geometry, and its broad text grammar is a poor direct LLM boundary. |

### Why `react-native-svg` is the base

The official project supports React Native on iOS and Android and includes a compatibility layer for the web; Expo also documents it as available on Android, iOS and web, with interactive and animated SVG primitives. That makes it the lowest-risk base for visuals which must eventually be identical across all three clients. [Project and license](https://github.com/software-mansion/react-native-svg) · [Expo integration](https://docs.expo.dev/versions/latest/sdk/svg/)

A fraction model is not a new illustration every time. It is one renderer with parameters such as denominator, highlighted parts, representation (`bar` or `circle`), labels, and animation state. The same applies to a number line, area grid, place-value blocks, and a labelled polygon. Implementing these few semantic components is substantially smaller than building a drawing engine.

Use W3C SVG semantics on web. SVG 2 defines `title` and `desc` as descriptive elements and requires selected descriptions to be exposed through platform accessibility APIs. Meaningful graphical groups can also carry accessible names. [SVG 2 document structure](https://www.w3.org/TR/SVG/latest/struct.html) · [SVG accessibility mappings](https://www.w3.org/TR/svg-aam-1.0/)

### KaTeX versus MathJax

KaTeX is the pragmatic MVP choice: it is MIT-licensed, fast, and its default `htmlAndMathml` output includes MathML for accessibility. It also exposes limits such as `maxSize` and `maxExpand`, and keeps commands that can load external resources or alter HTML disabled when `trust` is false. [KaTeX license](https://github.com/KaTeX/KaTeX) · [output options](https://katex.org/docs/options) · [security guidance](https://github.com/KaTeX/KaTeX/security)

MathJax is a valid alternative when advanced accessibility is the deciding requirement. It is Apache-2.0 licensed and includes semantic enrichment, speech generation, interactive expression exploration, and assistive MathML components. It is a larger accessibility platform rather than the lightest notation renderer. [MathJax accessibility components](https://docs.mathjax.org/en/latest/web/components/accessibility.html) · [license FAQ](https://docs.mathjax.org/en/stable/misc/faq.html)

Recommendation: use KaTeX for the MVP, retain the original LaTeX plus a human-readable spoken form in content, and test screen-reader output. Because rendering is behind `MathRenderer`, switching selected screens to MathJax later does not change stored lesson content.

### JSXGraph for coordinate geometry and plotting

JSXGraph covers interactive geometry, function plotting, charts, and data visualization; it is standalone JavaScript, supports multi-touch, and renders with SVG or Canvas. It is dual licensed under MIT or LGPL, so the project can select the MIT license. [Official feature and license page](https://jsxgraph.org/home/) · [official repository](https://github.com/jsxgraph/jsxgraph)

Do not expose JSXGraph's full API to the model. The application should accept a small `geometry_plot` spec—bounds, axes, points, segments, polygons, and allowlisted mathematical expressions—and translate it to JSXGraph calls. This prevents vendor lock-in and makes a later native renderer possible.

### Vega-Lite for data-handling questions

Vega-Lite is a high-level grammar for interactive graphics. Its specifications are JSON objects, it publishes a JSON schema, and it compiles to lower-level Vega specifications. This is useful for bar charts, line plots, scatter plots, and data-handling lessons without inventing chart layout. It is BSD-3-Clause licensed. [Official overview](https://vega.github.io/vega-lite/docs/) · [specification structure](https://vega.github.io/vega-lite/docs/spec.html) · [license](https://github.com/vega/vega-lite/blob/main/LICENSE)

Still do not accept arbitrary Vega-Lite from the LLM. Permit only selected marks, encodings, scales, labels, data size, and interaction types. Apply the app's colors, font sizes, axis styling, and motion rules after generation. For native clients, either render the validated chart through an isolated web adapter or compile it to a sanitized static SVG when interaction is unnecessary.

Apache ECharts is a credible alternative, with Apache-2.0 licensing and both Canvas and SVG renderers. It has a broader chart product surface, but Vega-Lite's smaller declarative grammar and JSON-schema orientation are a better fit for a controlled generated-content boundary. [Apache ECharts repository and license](https://github.com/apache/echarts) · [renderer guidance](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/)

## A product-owned `DiagramSpec`

The `DiagramSpec` should express teaching intent, not pixels and not a vendor's complete API.

```ts
type DiagramSpecV1 =
  | {
      version: 1;
      kind: "fraction_model";
      model: "bar" | "circle";
      numerator: number;
      denominator: number;
      compareWith?: { numerator: number; denominator: number };
      labels: "fraction" | "none";
      altText: string;
    }
  | {
      version: 1;
      kind: "number_line";
      min: number;
      max: number;
      step: number;
      points: Array<{ value: number; label?: string; tone?: "focus" | "neutral" }>;
      arrows?: Array<{ from: number; to: number; label?: string }>;
      altText: string;
    }
  | {
      version: 1;
      kind: "geometry";
      viewport: { xMin: number; xMax: number; yMin: number; yMax: number };
      objects: Array<PointSpec | SegmentSpec | PolygonSpec | CircleSpec | AngleSpec>;
      altText: string;
    }
  | {
      version: 1;
      kind: "data_chart";
      chart: "bar" | "line" | "scatter";
      data: Array<Record<string, string | number>>;
      x: AxisSpec;
      y: AxisSpec;
      altText: string;
    };
```

Important boundaries:

- no raw SVG paths from the model in V1;
- no HTML, CSS, JavaScript callbacks, URLs, data URIs, or remote assets;
- no arbitrary JSXGraph, Vega, Mermaid, KaTeX trust options, or event handlers;
- no expression evaluated as JavaScript;
- no model-selected colors, fonts, stroke widths, animation durations, or viewport sizes;
- every spec includes a concise text equivalent, and the teaching response also works without the image;
- every kind and schema is versioned so cached lessons remain reproducible.

[JSON Schema](https://json-schema.org/specification) provides standard Core and Validation specifications and published meta-schemas. Use it (or generated equivalent runtime validators) at the model boundary, then add semantic checks that a generic schema cannot express.

## Generation and validation pipeline

```text
Teaching planner
      |
      v
LLM emits DiagramSpec JSON
      |
      v
1. JSON-schema validation
2. semantic validation
3. pedagogical consistency check
4. deterministic renderer adapter
      |
      +--> RN SVG primitives
      +--> KaTeX
      +--> JSXGraph
      +--> Vega-Lite
      |
      v
rendered visual + text equivalent + cached spec
```

Schema validation is necessary but insufficient. Semantic validation should enforce, for example:

- `0 <= numerator <= denominator` unless an improper fraction is deliberately requested;
- denominator, tick count, object count, label length, and coordinate ranges stay within UI-tested limits;
- marked number-line values lie inside the range and align to allowed steps;
- geometry references point to existing object IDs and are not degenerate unless the lesson asks about degeneracy;
- chart fields exist, all data are finite, and axes do not visually misrepresent the data;
- the diagram's values agree with the problem, worked solution, and final answer;
- high-stakes visual claims are verified with deterministic math, not a second LLM opinion alone.

For plotted expressions, a parser such as math.js can produce an expression tree, but its own documentation warns that evaluating arbitrary expressions can carry security risks. Accept only a small AST/operator allowlist and impose evaluation/time/sample limits. [math.js parsing](https://mathjs.org/docs/reference/functions/parse.html) · [Apache-2.0 license](https://github.com/josdejong/mathjs/blob/develop/LICENSE)

Renderers should be deterministic for the same versioned spec. Store the spec, renderer version, and generated text equivalent; cache output; and use visual-regression snapshots for representative device sizes. Reject invalid diagrams and fall back to a text-plus-formula explanation rather than trying to render partially trusted output.

## Science expansion

There is no equivalent single diagram grammar for all school science. Add specialist `kind` adapters only when a curriculum need appears.

| Later need | Candidate | License/status | Constraint |
|---|---|---|---|
| 2D chemical structures and editing | [Kekule.js](https://www.npmjs.com/package/kekule) | MIT | Browser/Node toolkit; validate molecular input and build a dedicated chemistry adapter. |
| 3D molecular visualization | [3Dmol.js](https://github.com/3dmol/3Dmol.js) | Permissive BSD | WebGL/browser; suitable for an optional rich web/native-WebView activity, not a generic SVG diagram. |
| Large biomolecular structures | [NGL](https://github.com/nglviewer/ngl) | MIT | Browser/WebGL and more appropriate for higher-level biology than the first school-science MVP. |
| Circuits | [CircuitJS1](https://github.com/sharpie7/circuitjs1) | GPL | A complete browser simulator, not a permissive diagram component. Requires product/license review before integration. |
| Full interactive science simulations | [PhET source](https://phet.colorado.edu/en/about/source-code) | Most simulation repos GPL; PhET says it does not offer its source code under a separate commercial license | Do not treat it as a permissive proprietary-app dependency. Integration requires accepting the applicable GPL obligations and legal review; link/embedding rights and content/assets must be checked separately. |

Basic forces, free-body diagrams, circuits-as-static-pictures, cells, and lab apparatus will still need small domain-specific semantic renderers or curated assets. Reuse SVG primitives and layout utilities, but own the educational schema. A molecule viewer cannot reliably produce a pedagogically correct force diagram, and a chart library cannot represent a circuit's electrical semantics.

## Attractive options that should not become the default

### Mathigon Polypad

Polypad is the closest product-level reference: its public API documents serializable JSON state and manipulatives including number lines, fraction bars, fraction circles, algebra tiles, axes, probability tools, and charts. [Polypad API documentation](https://mathigon.io/polypad/)

However, Mathigon's own FAQ says its technology is licensed to organisations and publishers for commercial use, and that Mathigon itself may be used only for non-commercial purposes without an agreement. Therefore, do not assume that the hosted Polypad bundle or its content is a free commercial dependency. It is valuable as interaction research; contact Mathigon if licensing the complete manipulative system could save enough work. [Mathigon commercial-use FAQ](https://mathigon.org/faqs)

Individual Mathigon libraries can have different licenses. For example, Euclid.ts is explicitly MIT-licensed, while the complete product/content has different terms. Review each exact package and asset rather than treating the organisation as one license.

### GeoGebra

GeoGebra is powerful but a poor default licensing assumption for a commercial consumer app. Its official license page says the complete software/materials are free for non-commercial use and commercial use requires a special agreement; source, installers, language files, services, and materials have different terms. [GeoGebra license and FAQ](https://www.geogebra.org/license)

### Raw LLM-generated SVG or Mermaid

This appears fast but transfers layout, styling, security, cross-platform differences, accessibility, and correctness to probabilistic output. It also makes the UI inconsistent and difficult to test. Use the model to choose a diagram kind and values; use deterministic code to draw it.

## MVP implementation boundary

Build now:

1. `DiagramSpecV1` plus JSON Schema and semantic validators.
2. A renderer registry: `kind -> renderer`.
3. `react-native-svg` renderers for `fraction_model`, `number_line`, `area_grid`, `place_value`, and `labelled_shape`.
4. A `MathRenderer` with KaTeX on web and a stored spoken/text equivalent.
5. A restricted Vega-Lite adapter only when the Class 6 source material requires data charts.
6. A restricted JSXGraph adapter only when the source material requires draggable geometry or plots.
7. Golden-spec tests, unit tests for validators, and screenshot tests at small phone, large phone, tablet, and web widths.

Defer:

- general-purpose free drawing;
- arbitrary model-generated illustrations;
- chemistry, circuits, 3D, and PhET-style simulations;
- a native Skia engine. [React Native Skia](https://github.com/Shopify/react-native-skia) is a capable MIT-licensed high-performance 2D engine, but it adds complexity the Class 6 diagram set does not yet justify. Adopt it only if profiling shows SVG animation or object-count limits.

## Bottom line

Most low-level work can be reused. The app does **not** need to draw circles, paths, equations, coordinate systems, chart axes, touch handles, or molecule models from scratch. The small piece worth owning is the educational vocabulary that says what a visual means and constrains how it may be rendered.

The practical split is:

- open source owns rendering mechanics;
- `DiagramSpec` owns semantic intent;
- deterministic validators own correctness and safety;
- the design system owns visual treatment;
- the LLM selects and fills approved structures, but never executes drawing code.

That architecture scales by adding a new validated `kind` and adapter, rather than hardcoding a new diagram for every chapter, class, subject, or country.
