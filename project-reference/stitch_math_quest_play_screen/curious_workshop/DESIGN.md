---
name: Curious Workshop
version: 2.0.0
status: canonical
colors:
  canvas: '#FFF8EE'
  surface: '#FFFDF8'
  surface-soft: '#F5F3FF'
  border: '#D8D5CA'
  primary: '#4F46E5'
  primary-dark: '#3730A3'
  teaching: '#0E7490'
  reward: '#F97316'
  reward-text: '#431407'
  success: '#047857'
  success-soft: '#ECFDF5'
  warning: '#B45309'
  warning-soft: '#FFFBEB'
  error: '#B91C1C'
  error-soft: '#FEF2F2'
  text: '#1F2937'
  text-secondary: '#667085'
  text-tertiary: '#64748B'
  inverse-text: '#FFFFFF'
typography:
  display-mobile: 800 32px/40px Plus Jakarta Sans
  display-desktop: 800 40px/48px Plus Jakarta Sans
  headline-lg: 700 28px/36px Plus Jakarta Sans
  headline-md: 700 22px/30px Plus Jakarta Sans
  headline-sm: 700 18px/26px Plus Jakarta Sans
  body-lg: 400 18px/28px Plus Jakarta Sans
  body: 400 16px/24px Plus Jakarta Sans
  body-sm: 400 14px/20px Plus Jakarta Sans
  label: 700 14px/20px Plus Jakarta Sans
  label-sm: 700 12px/16px Plus Jakarta Sans
  math-editable: 600 20px/32px JetBrains Mono
radii:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  12: 48px
---

# Curious Workshop design system

This is the canonical visual and interaction specification for web, iOS, and Android. No screen or component may introduce a second raw color, type scale, radius, spacing scale, mascot identity, or reward vocabulary.

## Product character

Curious Workshop is a fast, game-like mathematics tutor for learners aged 10–18. It should feel energetic and tactile without looking childish. Essential instructions and controls use plain language. Workshop language is reserved for Prism’s dialogue, celebrations, and light Boss Problem decoration.

## Core interaction rules

- One visually dominant next action per screen.
- Recognition over recall: instructions remain visible while the learner acts.
- Selection never submits automatically.
- Feedback appears immediately after Check and preserves spatial context.
- Incorrect Attempt → short diagnostic → interactive Repair Activity → retry original Problem → Transfer Problem.
- Global difficulty changes after three comparable Attempts; teaching can happen immediately.
- Every published Skill remains playable. Recommendation is highlighted, never enforced through locking.
- Photographed working is optional and mainly used in Boss Problems.
- Streak, XP, levels, weekly goals, and learning milestones use one shared data source.

## Layout

- Minimum phone width: 360px; phone gutter: 16px.
- Focused quest column: max 560px.
- General application shell: max 1200px.
- Play Home and each active Problem, feedback, diagnostic, Repair Activity, retry, and completion state fit as one focused scene at default text size on a common phone. The learner never has to scroll to find the primary decision.
- Path intentionally uses a spatial route and may scroll as the world expands. Learning Journal, Statistics, and Settings may also scroll because they are browsing/reference surfaces.
- Never prohibit overflow: large text, long mathematics, translation, landscape, and small screens must reflow and scroll safely.
- Mobile is one column. Tablet may pair the Problem with optional working or explanation. Desktop keeps quests centered; Path and Me may use wider grids.
- Fixed action trays respect safe areas and virtual keyboards and never cover content.
- At 200% text size, content reflows without clipping, overlap, or horizontal scrolling.

## Prism tutor-guide

Prism is the tutor and navigation guide, not a selectable decorative mascot. Prism knows the current Skill, Attempt, likely misconception, and next action. Every appearance must orient, teach, respond, or transition. Use a reusable state set: `ready` on Play, `leading` at the current Path node, `thinking` for hints and diagnostics, `celebrate` after a correct answer or three-Problem checkpoint, `support` after a mistake, `checking` during photographed-work Evaluation, and `victory` at quest completion.

- Large: Play and Quest Complete.
- Medium: feedback, diagnostic, Repair Activity, and Boss Problem introductions.
- Small/peeking: ordinary Problems, where the mathematics remains primary.
- Absent: camera viewfinder and dense Statistics when the character would distract.
- Speech bubbles appear only when Prism is actually speaking. Reduced Motion uses the final static pose.
- MVP recognition comes from visible Path progress, specific learning evidence, real personal records, and contextual milestone celebrations. There is no standalone badge or Achievement collection.

## Path world

- Use a literal winding workshop journey with distinct landmarks rather than a vertical stack of dashboard cards.
- Prism stands at the recommended node. Recommended is the strongest visual state; completed uses a check; every published future node remains fully playable and never appears locked.
- Node taps reveal only the information needed to start: Skill name, purpose, duration, and Play.
- Preserve a product-specific visual metaphor and do not copy another product’s trade dress.

## Color and contrast

Indigo is for primary actions, selection, navigation, and progress. Teaching cyan is for hints, explanations, and read-aloud. Orange is for rewards and uses dark reward text. Dark green is for correct states. Crimson is for destructive actions and confirmed incorrect states.

Never communicate state through color alone. Normal text must meet 4.5:1 contrast; large text and essential UI boundaries must meet 3:1.

## Typography and mathematics

Use Plus Jakarta Sans for product copy. Reserve display type for welcome and celebration moments. JetBrains Mono is only for editable numerals and short expressions; use an accessible math renderer for fractions, roots, exponents, and equations. Supply spoken math and text equivalents for diagrams.

## Learning Visual language

- Content expresses visual meaning through a versioned semantic `DiagramSpec`, never through screen-specific markup or arbitrary model-generated SVG/HTML/JavaScript.
- Use one reusable renderer per visual family: fraction model, number line, area grid, place value, labelled shape, geometry/plot, and data chart.
- All renderers consume this design system's color, type, spacing, stroke, motion, and accessibility tokens; library defaults cannot create a competing theme.
- Use `react-native-svg` for common cross-platform primitives and KaTeX for web mathematics. Restricted JSXGraph and Vega-Lite adapters are allowed only for curriculum-required geometry, plots, and charts.
- The model supplies semantic values and an initial text equivalent. Application validators enforce mathematical consistency, size/range limits, and accessible fallback before rendering.
- Math and Learning Visuals must remain understandable without color, animation, pointer input, or the visual itself.

## Component rules

### Actions

- Minimum target 48×48px; primary action height 52px.
- Primary uses indigo, white label, and a dark-indigo 4px tactile lip.
- Secondary uses a surface fill, 2px border, and dark text.
- Required states: default, hover, keyboard focus, pressed, disabled, loading, success, and error.

### Answer options

- Minimum height 64px with a 2px border and 16px radius.
- Default: surface and neutral border.
- Selected: indigo border, soft-indigo fill, and check indicator.
- Correct: dark-green border, success-soft fill, icon, and text announcement.
- Incorrect: crimson border, error-soft fill, icon, and text announcement.
- Web radio groups use arrow-key navigation and roving focus.

### Feedback

- Appears in the fixed quest action tray after Check.
- Contains one status heading, no more than two short sentences, and one next action.
- Uses a polite live region and preserves the Problem and selected answer.

### Progress and rewards

- Use `Problem 1 of 6` plus a matching determinate bar everywhere.
- Before submission say `Worth 20 XP`; after success say `+20 XP`.
- Canonical mascot name: Prism.
- Reduced Motion uses static expression changes.

### Navigation

- Top level: Play, Path, Me.
- Focused quests suppress bottom navigation.
- Deep detail screens use Back without redundant bottom navigation.
- Web uses navigation links with `aria-current`; native apps use platform navigation semantics.

## Plain-language vocabulary

Use: Quick check, Choose an answer, Check answer, Show me, Try again, We’re checking each step, We couldn’t read this step, Your progress, Try this next.

Avoid essential labels such as Calibration Step, Workshop Telemetry, Analysis Phase, Curious Identity, Lab Access, Direct Access, and Optical Scan.

## Accessibility and platforms

- Visible 3px keyboard focus ring; full keyboard completion on web.
- VoiceOver/TalkBack order follows visual order.
- Dynamic Type/font scaling does not truncate essential text.
- Correct, incorrect, upload, and Evaluation states announce changes.
- All motion respects Reduced Motion.
- Charts include a text summary and values.
- Read aloud speaks meaning, such as “two fourths.”
- iOS supports safe areas, Dynamic Type, VoiceOver, Reduce Motion, native sheets, and Apple sign-in conventions.
- Android supports edge-to-edge insets, font scaling, TalkBack, predictive Back, native sheets, and Google sign-in conventions.
- Web supports semantic HTML, history/URLs, visible focus, keyboard operation, and 200% reflow.

## Required service states

Every relevant flow includes loading, offline, timeout, retry, and cancellation. Camera flows also cover permission denied, unavailable camera, invalid file, upload progress, and unreadable image. Authentication covers provider cancellation, provider error, offline, and existing-account recovery.
