# Curious Workshop Design System Specification

**Version:** 2.1.0  
**Status:** Canonical implementation companion  
**Primary source:** [`curious_workshop/DESIGN.md`](./curious_workshop/DESIGN.md)

This file translates the canonical design rules into implementation tokens. If a value conflicts with `DESIGN.md`, `DESIGN.md` wins and both files must be corrected together.

## Tokens

```ts
export const tokens = {
  color: {
    canvas: '#FFF8EE',
    surface: '#FFFDF8',
    surfaceSoft: '#F5F3FF',
    border: '#D8D5CA',
    primary: '#4F46E5',
    primaryDark: '#3730A3',
    teaching: '#0E7490',
    reward: '#F97316',
    rewardText: '#431407',
    success: '#047857',
    successSoft: '#ECFDF5',
    warning: '#B45309',
    warningSoft: '#FFFBEB',
    error: '#B91C1C',
    errorSoft: '#FEF2F2',
    text: '#1F2937',
    textSecondary: '#667085',
    textTertiary: '#64748B',
    inverseText: '#FFFFFF',
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  size: { minimumTarget: 48, actionHeight: 52, focusedColumn: 560, appShell: 1200 },
  motion: { press: 100, feedback: 220, celebration: 350 },
  diagram: {
    stroke: 3,
    axisStroke: 2,
    gridStroke: 1,
    labelGap: 8,
    minimumInteractiveTarget: 48,
    maximumAccentTones: 3,
  },
} as const;
```

## Typography

```ts
export const typography = {
  displayMobile: { fontFamily: 'PlusJakartaSans', fontSize: 32, lineHeight: 40, fontWeight: '800' },
  displayDesktop: { fontFamily: 'PlusJakartaSans', fontSize: 40, lineHeight: 48, fontWeight: '800' },
  headlineLg: { fontFamily: 'PlusJakartaSans', fontSize: 28, lineHeight: 36, fontWeight: '700' },
  headlineMd: { fontFamily: 'PlusJakartaSans', fontSize: 22, lineHeight: 30, fontWeight: '700' },
  headlineSm: { fontFamily: 'PlusJakartaSans', fontSize: 18, lineHeight: 26, fontWeight: '700' },
  bodyLg: { fontFamily: 'PlusJakartaSans', fontSize: 18, lineHeight: 28, fontWeight: '400' },
  body: { fontFamily: 'PlusJakartaSans', fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySm: { fontFamily: 'PlusJakartaSans', fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontFamily: 'PlusJakartaSans', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  labelSm: { fontFamily: 'PlusJakartaSans', fontSize: 12, lineHeight: 16, fontWeight: '700' },
  mathEditable: { fontFamily: 'JetBrainsMono', fontSize: 20, lineHeight: 32, fontWeight: '600' },
} as const;
```

## Required component contracts

Every production component exposes default, pressed, visible-focus, disabled, loading, and error behavior; accessible name, role, value/state, and announcements; large-text reflow; reduced-motion behavior; web keyboard behavior; native screen-reader order; and loading/offline/retry/cancellation states where relevant.

## Learning Visual contract

Production Learning Visuals render a versioned semantic `DiagramSpec`; routes and model output never provide raw SVG paths, HTML, JavaScript, callbacks, remote assets, fonts, colors, stroke widths, layout sizes, or animation timings. Renderer adapters receive the tokens above and translate the semantic spec to `react-native-svg`, KaTeX, restricted JSXGraph, or restricted Vega-Lite output.

Every Learning Visual provides a concise text equivalent, uses color plus shape/text for state, remains meaningful with motion disabled, and falls back to text-plus-math when validation or rendering fails. Math source and spoken meaning are stored independently of the selected renderer.

All prototype screens load [`canonical-state.js`](./canonical-state.js), [`shared.css`](./shared.css), and [`shared.js`](./shared.js). The HTML remains a prototype; production code must recreate the behavior semantically on every platform.
