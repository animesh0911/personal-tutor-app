# Curious Workshop — Product Design Review

Reviewed: 4 September 2026  
Scope: 24 Google Stitch screen exports, their HTML prototypes, and both design-system documents.

## Executive verdict

The corrected screen set is now a coherent **implementation-ready interaction prototype**. It establishes one compact learning loop, a consistent product state, an open Path, consumer authentication, accessible controls, responsive phone layouts, and one canonical visual system. It is ready to guide product implementation; production work still requires real curriculum content, service/error states, security review, and testing with learners.

### Current scorecard

| Area | Score | Verdict |
|---|---:|---|
| Core learning-loop concept | 9/10 | Clear Problem → feedback → repair → retry → transfer loop |
| Game feel and motivation | 9/10 | Prism tutor-guide, Path progression, XP, streak, weekly goal, and contextual celebrations are coherent |
| HCI clarity | 9/10 | One dominant action, plain language, immediate state feedback |
| Cross-screen consistency | 9/10 | Shared state, tokens, components, vocabulary, and navigation |
| Accessibility | 8/10 | Semantic controls, 48 px targets, focus, keyboard radios, live feedback, reduced motion |
| Responsive/platform readiness | 8/10 | True 390 px QA, zero horizontal overflow, phone/tablet/web rules documented |
| Implementation readiness | 8/10 | Strong prototype source; production edge cases and learner testing remain |

### Remediation completed

- Rebuilt all 24 screen prototypes around one canonical state and design system.
- Regenerated all 24 PNG previews with a true 390 × 844 emulated viewport.
- Added automated viewport and horizontal-overflow assertions to the renderer.
- Made the main quest action persist at the bottom without covering reachable content.
- Added semantic single-select behavior, keyboard arrow navigation, visible focus, disabled states, and feedback announcements.
- Replaced ambiguous emoji controls with consistent CSS-drawn read-aloud and camera icons.
- Rebuilt Path as a literal illustrated journey with Prism at the recommended node rather than a stack of cards.
- Made Play Home and every active quest state non-scrolling at the default 390 × 844 test viewport while preserving accessible overflow for larger text and longer content.
- Added purposeful Prism states to Problems, correct/incorrect feedback, diagnostics, Repair Activity, retry, Path, and completion.
- Removed the generic emoji badge collection. The former Achievements screen is now a Prism-guided Learning Journal based on real learning evidence.
- Replaced temporary text faces with one authored, faceted Prism SVG system with ready, leading, thinking, support, celebrate, checking, and victory poses.
- Preserved this document’s original screen-by-screen findings below as the audit trail that drove the corrections.

## What should remain

- A three-destination shell: **Play, Path, Me**.
- One dominant action on Play: **Start quest**.
- A focused full-screen quest without bottom navigation.
- Large tactile answer targets and a clear selected state.
- Immediate correct/incorrect feedback in a persistent bottom action area.
- A short diagnostic followed by a visual, interactive Repair Activity.
- Retry of the original Problem, then a Transfer Problem.
- Mascot reactions, XP, streak, weekly goal, achievements, and quest completion.
- Optional photographed working for occasional Boss Problems—not as the default way to practise.
- Plain language, read-aloud access, reduced motion, and high-contrast options.

## P0 blockers — resolved

These were the original blockers. All eight are resolved in the current screen set.

1. **The incorrect state marks a correct answer as wrong.** The Problem asks which fraction equals `1/2`; `2/4` is selected, yet the screen displays incorrect feedback. This destroys trust in the evaluator.
2. **The default Problem is already selected.** `daily_quest_problem_1` and `daily_quest_selected_state_2_4` both show `2/4` selected. The initial state must have no selection and a disabled Check button; the selected state must enable Check.
3. **The Path contradicts the agreed open-content model.** It says “8/14 Unlocked,” contains “Unlock” actions, and locks the Boss Problem. All available MVP Skills must be playable; only the recommendation should be emphasized.
4. **Authentication contradicts the consumer MVP.** “Classroom Passcode or Email,” FERPA language, school sync, and class rank imply a school product. The agreed MVP uses Google and Apple guardian authentication with no school or admin dependency.
5. **The processing screen reveals the answer before processing finishes.** `checking_method` displays `5/6` and “RESULT CONFIRMED” while showing 68% analysis. Never claim confirmation before Evaluation completes.
6. **There is no canonical product state.** Screens disagree on quest length (5 vs 6), XP (340 vs 380), streak (5, 7, or 8), mastery/progress, learner level, and mascot name. Use one typed fixture to generate every prototype state.
7. **The Play-home screenshot export is broken.** `screen.png` contains `<FIFE Image failed to fetch>` rather than an image. Re-export it before visual sign-off.
8. **The two design-system files conflict.** They define different canvases, primary/secondary colors, typography scales, radii, and layout behavior. There must be one normative token source.

## Canonical journey

The screen architecture should communicate this sequence without explanation:

```text
Welcome → Google/Apple sign-in → Guardian confirmation → Learner setup → Play

Play → Problem → Select → Check
                     ├─ Correct → brief feedback → next Problem
                     └─ Incorrect → diagnostic → Repair Activity → retry original
                                                                  → Transfer Problem

Final Problem → Quest complete → Finish or optional bonus Problem

Path → Chapter → Skill or Boss Problem
Me → progress summary → Learning Journal / Statistics / Settings
```

Difficulty should update after each batch of three comparable Attempts. Incorrect answers can trigger immediate teaching without prematurely lowering the learner's overall difficulty.

## Screen-by-screen review

### Onboarding

#### 1. Welcome — Revise

**Keep:** Clear “Get started” action, mascot-led identity, short value proposition, and login link.  
**Change:** The hero is too tall and delays the action; the three feature cards repeat the headline. Put the CTA above the fold on a 667 px-tall phone. Use one sentence such as “Solve quick math quests that adapt to you.” Remove claims such as “designed with educators” or regulatory compliance until they are verified. “AI Lab” adds no useful meaning here.

#### 2. Authentication — P0 revise

**Keep:** Google and Apple as large, familiar, branded actions.  
**Change:** Remove “Classroom Passcode or Email.” Remove classroom/school language. Replace “Learner Guidance” with a single plain sentence explaining that a guardian should sign in. Keep legal links visually secondary, but readable. The screen needs loading, cancelled-login, provider-error, offline, and existing-account states.

#### 3. Guardian confirmation — Revise

**Keep:** Explicit confirmation and disabled-until-confirmed Continue action.  
**Change:** This screen says “Maya” before the learner has entered a nickname. Use “your learner.” Reduce the three large explanation blocks to two or three short bullets. “Personalized Growth Engine,” “Safety Lab,” and “Full Parental Data Control” are product jargon. Do not make unsupported COPPA/FERPA claims. The final consent language and data-handling flow need policy/legal review before launch.

#### 4. Learner setup — Revise

**Keep:** One nickname field, visual mascot selection, no placement test, and a clear Start learning action.  
**Change:** “Curious Identity,” “Lab Profile,” “Workshop Pathway,” and “Direct Access” create unnecessary decoding. Use “Choose a nickname,” “Pick a mascot,” and “Start with Chapter 1.” The selected mascot must expose a visible name and screen-reader state. The starting chapter must come from the supplied curriculum pack rather than being hardcoded as Fractions.

### Home and core quest

#### 5. Play home — Good direction; revise consistency

**Keep:** This is the best information hierarchy in the set: greeting, streak/XP, mascot, one Start quest button, time estimate, weekly goal, and bottom navigation.  
**Change:** Use one quest length everywhere; this screen says 5 mini puzzles while quest screens say 6. Avoid “Level 6 Explorer,” which can be confused with Class 6. Keep the bonus and weekly goal only if they fit without pushing Start quest down on small devices. Re-export the missing screenshot and design empty/new-learner, quest-in-progress, and completed-today variants.

#### 6. Daily quest — initial Problem — P0 revise

**Keep:** Focused shell, large Problem, illustration, large answer tiles, visible progress, Exit, and Read aloud.  
**Change:** No answer may be selected initially. Add a fixed bottom Check action, disabled until selection. “1 of 6” and the progress bar must communicate the same value. Show reward as “Worth 20 XP,” not as XP already received. The fraction illustration currently includes a partially clipped `1/2` label; either make it legible or remove it.

#### 7. Daily quest — selected state — Revise

**Keep:** Indigo border, tint, and check icon make selection obvious without relying on color alone.  
**Change:** The selected state is almost indistinguishable from the exported initial state. Enable and reveal the fixed Check action. Use proper single-select behavior: visible focus, keyboard arrows on web, screen-reader announcement, and no accidental submission when selecting.

#### 8. Daily quest — correct state — Revise

**Keep:** The answer remains visible, the feedback is immediate, the explanation is short, and Continue is obvious.  
**Change:** The header promises `+20 XP`, while the feedback awards `+10 XP`. Award once. Do not shift the entire composition enough to disorient the learner; preserve the Problem and options, then animate the feedback area. Announce “Correct” through a polite live region and move screen-reader focus to the feedback heading.

#### 9. Daily quest — incorrect state — P0 rebuild

**Keep:** Supportive tone and a clear “Show me” recovery action.  
**Change:** The selected `2/4` is mathematically correct for the shown Problem. Replace the fixture with a genuinely incorrect answer. State the observable issue, not a verdict about ability. Example: “Not quite. Let’s check how many equal parts make the whole.” Keep selected and correct-answer styling distinguishable, and do not reveal the correct option before the learner engages with the repair.

#### 10. Diagnostic check — Good pattern; simplify

**Keep:** One visual micro-Problem that tests a likely prerequisite is exactly the right interaction.  
**Change:** Replace “Calibration Step” and “unlock the next quest checkpoint” with “Quick check” and one direct instruction. The selected answer should not be prefilled. Explain why this check appeared only after the answer, not before. The progress indicator should say “1 quick check” rather than introducing an unexplained two-segment bar.

#### 11. Repair Activity — Good concept; redesign for system consistency

**Keep:** Side-by-side `1/2` and `2/4`, a single tap task, and a direct link back to the misunderstood relationship.  
**Change:** Remove the visible `RKLES` watermark/artifact. Do not preselect `2/4`. The large empty top area wastes attention and pushes the action down. Reuse the same quest header, type scale, palette, mascot, and answer components as the surrounding flow. If “Slice!” is interactive, make the before/after change obvious and provide a non-motion equivalent.

#### 12. Retry original Problem — Revise

**Keep:** “Try it again” and the familiar original visual preserve continuity.  
**Change:** Clear the previous answer rather than preselecting it. Keep the same Problem ID and wording so this is a true retry. Avoid adding a new UI system for headers and XP. After success, explicitly reinforce the repaired idea in one line, then continue.

#### 13. Transfer / Power-up challenge — Good direction; revise

**Keep:** The new `2/3 → 4/6` surface checks whether learning transfers and the Power-up framing adds game energy.  
**Change:** Begin unselected. “+30 XP” should mean “Worth +30 XP” until earned. Hide the hint behind a Hint action; the current bottom text nearly gives away the method. Adapt global difficulty after the third comparable Attempt, while using this transfer result as one learning signal.

#### 14. Quest complete — Good direction; revise reward clarity

**Keep:** Mascot celebration, strengthened Skill, XP, streak, weekly-goal progress, and an optional bonus action.  
**Change:** Three outline stars look like zero stars earned. Fill earned stars and explain the criterion only if stars affect anything. Reconcile XP with per-Problem awards and streak with the rest of the app. “Finish” should return to Play and be the dominant action; the bonus must remain clearly optional. Add a reduced-motion celebration.

### Path and chapter play

#### 15. Path — P0 simplify

**Keep:** A visual journey is appropriate and more game-like than a textbook list. Recommended, mastered, and Boss states are useful.  
**Change:** Remove “8/14 Unlocked” and every locked-content implication. Use **Recommended**, **Practising**, **Mastered**, and **Available**. The 4,124 px scroll is too long, labels are tiny, and the line changes style without explaining meaning. Show one chapter at a time, with a chapter switcher or collapsed next chapter. Make every node and connector accessible independently of position and color.

#### 16. Chapter: Fractions — P0 simplify

**Keep:** Chapter summary, recommended-next card, progress, and direct Play action.  
**Change:** The long ten-row roadmap duplicates the Path and feels like a task manager. Show recommended next plus a compact list/grid of available Skills. Remove “Unlock” and the locked Boss state. Replace tiny repeated review controls with an overflow menu or a clearly labeled Review action. Do not hardcode this as the first Class 6 chapter until the curriculum pack is supplied.

#### 17. Boss Problem: The Fraction Forge — Revise heavily

**Keep:** Occasional multi-step challenges, optional photographed working, and strong thematic treatment can differentiate the app.  
**Change:** The forge metaphor currently obscures a simple fraction addition Problem with “thermal crucible,” “alloy bar,” “Heat/Core/Quench,” and “Forge Fraction Chamber.” Put the plain mathematical objective first and use the theme as decoration. Reduce to three major regions: progress, current Problem, actions. Keep “Solve in the app” primary and “Upload my working” secondary. Do not make success depend on understanding fictional terminology.

### Photographed working

#### 18. Upload working — Revise

**Keep:** Large Take photo action, gallery fallback, framing guidance, and read-aloud access.  
**Change:** The screen is too instructional before the camera opens. Use one sentence and two short tips; move the example and detailed guidance behind “How to take a clear photo.” Handle camera permission denied, unavailable camera, file type/size, upload progress, retry, and cancel. “AI Scan” is unnecessary labeling.

#### 19. Checking method — P0 rebuild

**Keep:** Showing that work is being checked can reduce uncertainty.  
**Change:** Never show “RESULT CONFIRMED” or the final answer before Evaluation completes. Remove fake technical stages such as “Optical Scan,” “validating multiplier,” and “Analysis Phase 2 of 3”; they add delay and imply precision the system may not have. Use a short honest state: “Reading your work…” then “Checking each step…”. If it takes longer than a few seconds, show a time-neutral progress animation, Cancel, and background/retry behavior.

#### 20. Scan uncertainty — Good recovery model; simplify

**Keep:** It identifies the exact ambiguous region and offers retake or manual entry. This is the right trust-preserving fallback.  
**Change:** Make the primary question immediately actionable: “Did you write 5/6?” with **Yes, 5/6**, **Edit answer**, and **Retake photo**. Hide confidence percentages and optical terminology. The confirmation card is currently obscured by the sticky action tray. Respect bottom safe-area insets and never cover content. Keep “Skip step analysis” only if its consequence is explained in plain language.

### Profile, rewards, and settings

#### 21. Me — P0 simplify

**Keep:** Profile, XP progress, streak, weekly goal, recent learning evidence, and mascot customization belong here.  
**Change:** This screen tries to be profile, dashboard, settings, wardrobe, and analytics at once. Keep learner/Prism, XP-to-next-level, three summary stats, weekly goal, one recent evidence item, and links to Statistics, Learning Journal, Customize Prism, and Settings. Remove “Rank #12 in Class,” school sync, and any classroom assumptions. Fix the streak and level fixtures.

#### 22. Learning Journal — Replace Achievements

**Keep:** A compact record of meaningful progress and personal bests can motivate repeat practice.  
**Change:** Remove the generic badge grid and emoji iconography. Show actual evidence such as repaired Skills, successful Transfer Problems, completed Chapters, hardest strengthened Skill, and streak/quest personal records. Prism may interpret one current insight but should not appear as decorative repetition.

#### 23. Learning statistics — Good content; simplify language

**Keep:** Streak, weekly activity, mastered Skills, chapter progress, improvement highlight, and a recommended next action are useful.  
**Change:** Replace “Workshop Telemetry,” “laboratory,” “mental model clicked,” and “Most-Practised Lab” with direct learner language. Keep no more than four primary insights above the recommendation. Every chart needs a text summary for screen readers; bars cannot rely on height/color alone. Explain accuracy/mastery percentages or omit them. Fix the shared streak and progress data.

#### 24. Settings — Revise heavily

**Keep:** Read aloud, sound, haptics, reduced motion, high contrast, notifications, privacy, sign out, and account deletion are the right categories.  
**Change:** Remove “Station v2.4,” “AI Copilot,” and other decorative system terminology. Use short labels with optional supporting text. Do not repeat bottom navigation on this deep detail screen unless that is the consistent platform rule. Account deletion needs confirmation, reauthentication, clear consequences, and a recovery/grace policy decided before implementation. Regulatory and “ad-free forever” claims must match actual policy.

## Design-system review

### 1. Establish one source of truth

`curious_workshop_design_system_spec.md` and `curious_workshop/DESIGN.md` disagree on foundational choices:

| Token area | Specification A | Specification B |
|---|---|---|
| Canvas | `#F8F9FF` | `#FFF8EE` |
| Primary | `#4F46E5` | `#3525CD` / `#4F46E5` |
| Secondary | `#0EA5E9` | `#006781` / `#0E7490` |
| Display size | 28 px | 32–40 px |
| XL radius | 20 px | 24 px |
| Content max width | 480 px | 1,200 px with desktop split layout |

Choose one semantic token file, then generate web, iOS, and Android values from it. The warm canvas and indigo/cyan/orange identity are distinctive; keep them, but eliminate duplicate raw values in components.

### 2. Correct contrast failures

Measured examples from the current tokens:

| Pair | Contrast | Result for normal text |
|---|---:|---|
| `#94A3B8` on white | 2.56:1 | Fail |
| White on success `#10B981` | 2.54:1 | Fail |
| White on reward orange `#F97316` | 2.80:1 | Fail |
| White on error `#EF4444` | 3.76:1 | Fail |
| `#667085` on warm canvas | 4.72:1 | Pass AA |
| Primary text `#1F2937` on warm canvas | 13.92:1 | Pass AAA |

Practical replacements include `#64748B` for tertiary text on white (4.76:1), `#047857` for success buttons with white text (5.48:1), dark brown `#431407` on orange (5.58:1), and `#B91C1C` for destructive buttons with white text (6.47:1). Re-test every state, including disabled controls and chart labels.

### 3. Add missing component states

Every interactive component needs documented default, hover, keyboard focus, pressed, selected, disabled, loading, success, error, and offline behavior where applicable. Add:

- A fixed quest action tray that respects safe areas and the virtual keyboard.
- Input errors and instructions associated programmatically with their fields.
- Skeleton/loading, empty, partial-data, retry, and offline patterns.
- Camera permission, upload, scan uncertainty, Evaluation timeout, and service-unavailable states.
- Toast/banner rules and screen-reader announcements.
- Long-copy and large-text reflow rules.
- A single reward vocabulary and XP/streak animation specification.

### 4. Replace decorative math typography with real math rendering

JetBrains Mono is useful for numerals and editable expressions, but it is not a mathematical layout engine. Use accessible semantic math on web and a tested native renderer for stacked fractions, superscripts, roots, equations, and spoken alternatives. Every diagram requires a concise text equivalent; read-aloud should speak `2/4` as “two fourths,” not “two slash four.”

### 5. Define responsive and platform behavior

The current designs are mobile compositions. Only 7 of 24 HTML files contain responsive breakpoint classes. Define separate behavior rather than merely widening cards:

- **Small phone:** 360 px minimum, all actions reachable without overlap at 200% text size.
- **Large phone:** preserve one-column focus and use safe areas.
- **Tablet:** center the Problem and use extra width for optional explanation/working, not more clutter.
- **Web desktop:** one focused central play column; Path and Me may use wider grids. Full keyboard operation and visible focus are mandatory.
- **iOS:** Dynamic Type, VoiceOver order, Reduce Motion, safe areas, native sheets, and platform sign-in conventions.
- **Android:** font scaling, TalkBack order, predictive back, edge-to-edge insets, native sheets, and platform sign-in conventions.

## Accessibility audit of the exported HTML

The generated HTML is a visual prototype, not production-ready accessible code:

- 0 of 24 files define `focus-visible` styling.
- Only 3 of 24 include reduced-motion handling.
- 0 files use `aria-live` for answer feedback or asynchronous Evaluation status.
- 0 files use `aria-describedby` to connect instructions/errors with controls.
- 4 files omit the document language.
- Custom radio groups expose partial ARIA state but do not implement a complete keyboard interaction model.
- Several low-contrast tokens fail WCAG 2.2 AA.
- Sticky bottom action areas can obscure content.
- Charts and visual fraction models need text equivalents.
- The navigation implementation should use real navigation links on web; a `tablist` pattern is only appropriate when it implements actual tab behavior.

### Accessibility acceptance criteria

- Full task completion with keyboard only on web.
- Logical screen-reader order, meaningful labels, and status announcements.
- Minimum 48 × 48 logical-pixel touch targets; the spec's 40 × 40 back button is inconsistent and must become 48 × 48.
- Text contrast at least 4.5:1; large text and essential UI boundaries at least 3:1.
- Reflow at 200% text size with no clipping, overlap, or hidden action.
- Reduced-motion equivalents for mascot movement, button springs, progress, and celebration.
- Correct zoom, orientation, safe-area, and virtual-keyboard behavior.
- Error recovery never requires color, memory of a previous screen, or re-entering data unnecessarily.

## Language and content rules

The visual style can be playful; the instructions should be plain. A learner should never have to translate the brand metaphor before solving mathematics.

Prefer:

- “Quick check” over “Calibration Step.”
- “We’re checking each step” over “Analysis Phase 2 of 3.”
- “Choose a nickname” over “Curious Identity.”
- “Your progress” over “Workshop Telemetry.”
- “Try this next” over “Workshop Pathway — Direct Access.”
- “We couldn’t read this step” over confidence percentages and optical-scan language.

Use the domain terms in `CONTEXT.md` consistently: Learner, Problem, Attempt, Evaluation, Repair Activity, Skill, Mastery, Path, and Boss Problem. Keep thematic words for titles, rewards, and mascot dialogue—not essential controls or explanations.

## Canonical prototype fixture

Before regenerating any screen, create one shared fixture and never type these values manually into individual prompts:

```text
Learner: Maya
Guardian account: authenticated
Class: 6
Subject: Mathematics
Mascot: Prism
Learner progression level: 4
XP: 340 / 500
Current streak: 7 days
Best streak: 12 days
Weekly goal: 3 / 5 quests before today's quest
Daily Quest length: 6 Problems, approximately 10 minutes
Current chapter: supplied curriculum pack's Chapter 1
Current Skill: Equivalent Fractions (prototype content only)
Path access: all published Skills are playable
Recommendation: one Skill highlighted, never enforced
```

On completion, derive all values: streak becomes 8 only if today's quest had not already counted; weekly goal becomes 4/5; XP becomes the exact previous value plus the quest's awarded total.

## Recommended correction order

1. Merge the two design-system documents into one token source and one component/state inventory.
2. Create the canonical fixture and correct every mathematical/product-state contradiction.
3. Regenerate and validate the eight core states: Play, initial Problem, selected, correct, incorrect, diagnostic, Repair Activity, retry/transfer.
4. Simplify onboarding and remove school-product assumptions.
5. Simplify Path, Chapter, Boss, and handwritten-work flows.
6. Split Me into a summary plus Statistics, Learning Journal, and Settings destinations; do not reintroduce the removed badge gallery.
7. Add accessibility behavior and failure/empty/loading states.
8. Produce and test small-phone, large-phone, tablet, and desktop variants before implementation handoff.

The design should be approved only after one complete clickable prototype can be used from sign-in through an incorrect answer, repair, successful retry, Transfer Problem, and quest completion without explanation from the designer.
