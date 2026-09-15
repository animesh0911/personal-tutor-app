# Web MVP design direction

Date: 2026-09-05
Status: canonical desktop web direction for implementation

## Decision

Use the **Workshop Journey** direction (variant B of the desktop Play Home prototype) as the visual and structural basis for the responsive web MVP.

The web MVP is a separate design surface. The existing 390 × 844 mobile prototypes remain unchanged and continue to describe the future native/mobile-browser composition.

## Why this direction won

- It makes the learning experience feel like a game immediately without hiding the primary action.
- It uses desktop space for a meaningful route, Prism guidance, and progress rather than stretching mobile cards.
- It gives Prism a persistent role as tutor and guide.
- It preserves the agreed Play, Path, and Me information architecture.
- It can simplify to a focused quest stage while retaining a coherent product identity.

## Application rules

- Play shows a short route for today's Daily Quest.
- Path owns the larger spatial journey through Chapters and Skills.
- Focused learning states suppress global navigation and prioritize the current Problem and action.
- Prism appears only when guiding, teaching, reacting, or transitioning.
- Desktop mockups target 1440 × 900 and must remain usable at 1280 × 800.
- The desktop shell uses a compact top application bar with Play, Path, Me, streak/XP context, and the learner profile; focused quest states suppress global navigation.
- Laptop and desktop compositions are purpose-designed from the same components. They are not enlarged phone screenshots.
- Streak, XP, and weekly goal remain visible on Play and Me but leave the focused Problem surface.
- The former Achievements surface is a Learning Journal based on real learning evidence; there is no standalone badge collection.
- Web interactions support keyboard operation, visible focus, semantic navigation, 200% reflow, and reduced motion.

## Learning Visuals

- Production screens never hardcode a chapter-specific explanation or diagram into a route.
- The backend returns a versioned, validated `DiagramSpec`; deterministic adapters apply the Curious Workshop design tokens.
- Use `react-native-svg` for common fraction, number-line, grid, place-value, and labelled-shape visuals; KaTeX for notation; and restricted JSXGraph or Vega-Lite adapters when geometry, plots, or charts require them.
- Model output cannot choose colors, typography, layout dimensions, raw SVG paths, HTML, JavaScript, callbacks, or remote assets.
- Every Learning Visual includes a concise text equivalent and remains understandable with reduced motion.

## Prototype source

The three-way comparison remains in `stitch_math_quest_play_screen/web_play_home_prototype/` as a clearly marked throwaway design artifact. The selected direction is being applied independently in `stitch_math_quest_play_screen/web_mvp_mockups/`.
