# Gamification patterns for Curious Workshop

Research date: 4 September 2026  
Scope: official product pages, help centres, design/engineering posts, and platform guidance from Duolingo, Brilliant, Khan Academy, Finch, Elevate, Apple, Android, and W3C.

## Executive recommendation

The right model is **not “never scroll.”** It is:

- **Browsing and progression screens scroll.** A Path is a journey and benefits from a long, spatial canvas. Duolingo explicitly calls its Home path a “long scroll” and provides a floating control to return to the learner’s current position.
- **Active learning screens behave like single-focus game scenes.** Keep the current Problem, answer interaction, progress, and primary action visible together on a typical phone. Longer explanations can expand or scroll, but `Check`, `Continue`, and retry actions remain pinned and the interface scrolls only enough to reveal the new feedback.
- **Do not hard-code a no-scroll layout.** Larger accessibility text, translated copy, long equations, landscape phones, and small devices must still reflow and scroll safely. The goal is “no required scrolling for the normal primary decision,” not “overflow is forbidden.”

For Curious Workshop, the Home screen should fit in one viewport, the Path should become a literal vertically scrolling illustrated route, and each quest Problem should feel like one playable scene at a time.

## What successful products actually do

### 1. Scrolling is contextual

Duolingo’s Path is deliberately vertical, linear, and scrollable. Each circle represents a level; practice and Stories are placed directly into the route. Its own FAQ acknowledges the long scroll and describes a floating arrow that returns learners to their current position. The rationale is clarity: learners should always know the best next step. ([Duolingo Home redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/))

Official Duolingo exercise imagery, by contrast, consistently depicts a single prompt, its answer interaction, and an immediate green/red feedback tray as one focused scene. This supports a useful pattern: **scroll to choose where to play; do not make the learner hunt vertically while playing.** ([Duolingo Explain My Answer](https://blog.duolingo.com/explain-my-answer-now-free/), [Duolingo listening practice](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-listening-skills/))

Apple’s scroll-view guidance does not discourage scrolling. It says to use system scrolling, make overflow apparent, avoid nested scroll views on the same axis, and scroll only as much as necessary when revealing selected or newly relevant content. Apple also requires primary content to avoid horizontal scrolling. ([Apple scroll views](https://developer.apple.com/design/human-interface-guidelines/scroll-views), [Apple UI design tips](https://developer.apple.com/design/tips/))

**Apply to Curious Workshop**

| Screen type | Recommended mobile behaviour |
|---|---|
| Play Home | One viewport at common phone sizes: Prism, today’s quest, `Start quest`, streak/XP summary, bottom navigation. |
| Path | Intentional vertical scroll with a visible winding route, partial next destination, and `Back to Maya`/current-location floating control after the learner scrolls away. |
| Chapter overview | Prefer an inline chapter header on the Path or a compact bottom sheet after tapping a landmark; avoid a second long card catalogue. |
| Problem | One prompt and one interaction scene. Progress and exit stay at the top; primary action stays pinned at the bottom. |
| Feedback / Repair | Concise first response fits above the pinned action. Let deeper explanation expand or scroll without removing the learner from the Problem. |
| Capture | Full-screen camera. Review/confirm is a separate single-focus scene. |
| Learning Journal / statistics / settings | Normal vertical scroll is appropriate; these are reference surfaces, not active play. |

### 2. Mascots work when they have a job

Duolingo intentionally placed characters in the majority of exercises, gave each one a unique correct-answer reaction, and added mid-lesson animations to celebrate runs of success. Its design guidance says characters should be expressive, posed, and emotionally legible rather than static decoration. Duo’s product role is consistently defined as a motivating, supportive, persistent cheerleader. ([Building Duolingo’s characters](https://blog.duolingo.com/building-character/), [Duolingo character guidelines](https://design.duolingo.com/illustration/characters), [Duo voice and tone](https://design.duolingo.com/writing/duo))

Finch goes further: its bird is the core emotional object. Completing goals gives the bird energy, sends it on adventures, and earns resources for clothes and home customisation. The bird can be touched, reacts, grows, returns with stories, and anchors the Home screen. ([Finch new-user guide](https://help.finchcare.com/hc/en-us/articles/42149821015693-New-User-Guide), [Finch Home](https://help.finchcare.com/hc/en-us/articles/37780000231309-Exploring-the-Finch-Home-Page), [Finch energy and rewards](https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones))

**Apply to Prism**

Prism should be a **learning companion and state indicator**, not a logo pasted into the header. Give it a small, reusable state set for the MVP:

1. `ready` — waves beside today’s quest on Play.
2. `leading` — physically stands at Maya’s current node on the Path.
3. `thinking` — offers a short hint or asks the diagnostic question.
4. `celebrate` — reacts immediately to a correct answer or three-Problem checkpoint.
5. `support` — acknowledges a mistake without looking sad or punitive, then points toward the Repair Activity.
6. `checking` — watches the uploaded working being evaluated without pretending the result is known.
7. `victory` — becomes the hero of Quest Complete.

Presence by surface:

- **Large:** Play hero, first Path viewport, Quest Complete.
- **Medium:** feedback, diagnostic, Repair Activity, Boss Problem introduction.
- **Small or peeking:** ordinary Problem screens, so Prism adds personality without competing with the mathematics.
- **Absent when useful:** camera viewfinder and dense statistics.

Use speech bubbles only when Prism is actually speaking. Let normal interface labels remain the app’s voice. A handful of expressive poses is more coherent and more production-friendly than one generic static illustration everywhere.

### 3. A Path should be spatial, legible, and motivating

Duolingo changed from a learner-directed skill tree to a guided path because learners were unsure what to do next. The route mixes new content, spaced review, Stories, and practice; sections are smaller; completed content remains replayable. ([Duolingo Home redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/))

Brilliant’s Learning Paths are ordered sequences from foundational to advanced ideas with interactive lessons and practice checkpoints, while its underlying recommendation system can still choose the appropriate next Problem. Brilliant explicitly describes its visible level system as a deliberately simpler representation of the more complex prerequisite graph underneath—it exists to give learners clear, satisfying milestones. ([Brilliant Learning Paths](https://brilliant.org/help/features/what-are-learning-paths/), [Brilliant’s learning method](https://brilliant.org/about/))

**Apply to the Curious Workshop Path**

- Replace the stacked cards with a **literal illustrated route** that snakes down the screen.
- Use a Curious Workshop metaphor unique to this product: a glowing cable/track connecting workshop stations, not Duolingo’s green stepping stones.
- Put **Prism at the learner’s current station**. The recommended next node gets the strongest halo and the only persistent `Play` label.
- Show completed nodes with stars/checks, current with motion/halo, and future playable nodes with normal colour—not locks.
- Make each concept a recognisable landmark rather than another card:
  - Equal Parts Bench
  - Fraction Wall Studio
  - Number Line Rails
  - Compare Canyon
  - Add & Subtract Lab
  - Fraction Forge (Boss)
- Mix node types along the route: Problem set, visual Repair Activity, review checkpoint, story/real-world challenge, and Boss Problem. This creates variety while preserving one obvious next action.
- When a node is tapped, open a compact anchored card or bottom sheet with title, purpose, estimated time, and `Play`; do not navigate to a verbose intermediate screen.
- Keep a compact chapter banner at section boundaries and show the next boundary partly onscreen to signal that the world continues.

### 4. Short sessions need visible, bounded progress

Duolingo describes its lessons as bite-sized and taking only a few minutes. It found that allowing one lesson to extend a streak, while tracking the larger daily goal separately, reduced the barrier to habit formation and improved retention in its experiment. ([Duolingo teaching method](https://blog.duolingo.com/duolingo-teaching-method/), [Duolingo streak experiment](https://blog.duolingo.com/improving-the-streak/))

Brilliant positions learning around roughly 15 minutes a day, guided bite-sized lessons, and one concept at a time. Elevate’s recommended daily workout is a bounded set of 3–5 games and its Today tab shows the daily workout, streak, and recent/favourite games. ([Brilliant Learn by doing](https://brilliant.org/landing/learn-computer-science-basics/), [Elevate workouts](https://support.elevateapp.com/hc/en-us/articles/4402971366299-What-is-the-difference-between-workouts-and-games), [Elevate Today tab](https://support.elevateapp.com/hc/en-us/articles/4402924805275-How-do-I-use-the-app))

**Apply to the 10-minute / six-Problem quest**

- Before starting: `6 Problems · about 10 min`.
- During play: persistent semantic progress such as `Problem 2 of 6`, not only six unlabeled dots.
- At Problem 3: a two-second checkpoint reaction from Prism, then continue. This is also where the adaptation decision can occur.
- At completion: one compact summary—XP earned, one learning insight, streak status, and a clear `Finish` button. Offer one optional bonus Problem after the main completion, never before the learner has an exit.
- A streak should require completion of one quest (or later one defined minimum activity). Weekly goal progress remains a separate mechanic so “keep the habit” and “do more today” do not become the same requirement.

### 5. The learning interaction itself must feel like play

Brilliant’s official product description is especially relevant to this app: visual explanations, hands-on manipulation, and concrete computation come before more advanced combinations. Its Problems use math input, drag-and-drop, and directly manipulated visual models. Feedback is immediate and specific to the learner’s action. Its tutor can see the current interactive and layer visual help into the same context. ([Brilliant interactives](https://brilliant.org/help/features/how-do-i-use-interactives-on-brilliant/), [Brilliant’s learning method](https://brilliant.org/about/), [Brilliant tutor](https://brilliant.org/help/features/how-does-koji-work/))

Khanmigo similarly uses guiding questions and small steps, offers focused action bubbles such as asking for help or simpler words, and supports text, voice, image, and math input. Khan Academy evaluates tutoring partly by whether the learner can answer the next Problem after receiving help—not just whether the conversation sounded helpful. ([Khanmigo Tutor Me](https://www.khanacademy.org/khan-for-educators/k4e-us-demo/xb78db74671c953a7%3Aget-to-know-khan-academy/xb78db74671c953a7%3Aexplore-the-student-experience/v/getting-help-with-tutor-me), [Khan Academy’s current tutor learnings](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/))

**Apply to Curious Workshop**

- Default to direct manipulation where it illuminates the concept: shade a fraction bar, drag pieces to make an equivalent fraction, place a value on a number line, pair equivalent cards, or build a denominator visually.
- Keep multiple choice and typed math for appropriate Problems; do not force photo upload into ordinary play.
- After a mistake, show a one-line diagnosis and a visual action immediately. Put longer AI dialogue behind simple choices such as `Show me`, `Use a picture`, `Use simpler words`, or `Let me try`.
- Keep teaching in the same scene whenever possible. The learner should return to the original Problem with their work preserved.
- Measure the repair by the retry and a near-neighbour transfer Problem, not by whether the learner opened an explanation.

### 6. Rewards should reflect effort and learning state

Duolingo uses immediate correct-answer reactions, mid-lesson celebrations, XP, streaks, achievements, and animated completion moments. Its current exercise feedback also offers an optional explanation for both right and wrong answers. ([Building Duolingo’s characters](https://blog.duolingo.com/building-character/), [Duolingo product highlights](https://blog.duolingo.com/product-highlights/), [Explain My Answer](https://blog.duolingo.com/explain-my-answer-now-free/))

Khan Academy explicitly separates effort points from mastery: energy points measure effort and are not a measure of ability, while badges recognise different behaviours and avatars evolve through activity. ([Khan Academy points, badges, and avatars](https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-))

Finch converts completed actions into both immediate energy and longer-term cosmetic/customisation rewards. It also gives the mascot a visible consequence: energy enables an adventure, and repeated goals can hatch a companion. ([Finch energy and rewards](https://help.finchcare.com/hc/en-us/articles/37780134479757-Energy-vs-Rainbow-Stones), [Finch Micropet Lab](https://help.finchcare.com/hc/en-us/articles/37780505907469-Using-the-Micropet-Lab))

**Apply to the MVP**

- Award XP for completing attempts and Repair Activities, not only correct answers.
- Keep mastery/difficulty separate from XP. “Level 4 fractions” should mean something different from “340 XP earned.”
- Use immediate feedback: colour + icon + short text + optional haptic/sound + Prism reaction. Never make colour or animation the only signal.
- At three Problems, celebrate momentum; at six, celebrate completion; reserve the largest animation for a genuine milestone or Boss victory.
- Show streak, XP, and weekly goal on Home. In active Problems, keep only quest progress; extra counters compete with the math.
- Later, connect learning to Prism customisation or workshop upgrades. For the MVP, expressive states and a few earned cosmetic accents are enough to test attachment without building a full economy.

## Accessibility and HCI constraints

This audience includes children, teenagers, learners with dyslexia/dyscalculia, and learners using small or older phones. “Game-like” should not mean visually noisy.

- Design for one-screen Problems at default text size, but support reflow and vertical scrolling at large text sizes. WCAG 2.2 requires content/functionality to survive text resizing and reflow. ([WCAG 2.2](https://www.w3.org/TR/WCAG22/))
- Use minimum 44 × 44 pt touch targets on iOS and 48 × 48 dp on Android. ([Apple UI design tips](https://developer.apple.com/design/tips/), [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps))
- Maintain at least 4.5:1 contrast for ordinary text and do not encode correct/incorrect/current/completed using colour alone. ([WCAG 2.2](https://www.w3.org/TR/WCAG22/))
- Give icons names, controls roles/states, and feedback live announcements. Progress must be readable as text (`Problem 2 of 6`).
- Every drag interaction needs an accessible tap/button alternative. Photo input needs typed answer or math-keyboard fallback.
- Honour reduced-motion preferences. Mascot state must remain understandable in its static final pose.
- Keep the primary action in a consistent bottom location and ensure keyboard/screen-reader focus is not hidden beneath it.
- Keep explanations short first, with `Read aloud`, `Show visually`, and `Use simpler words` available in context. Brilliant reports that layered audio, visual overlays, and conversational guidance reduce reading load and allow multiple channels of engagement. ([Brilliant accessibility for dyscalculia](https://brilliant.org/help/features/is-brilliant-good-for-learners-with-dyscalculia/))

## Concrete redesign brief

### Play Home

- Fit the functional content within the initial viewport.
- Prism occupies roughly the upper third and points toward one large `Start today’s quest` control.
- Keep `7-day streak`, `340 / 500 XP`, and `3 / 5 weekly goal` visible but subordinate.
- Show a small continuation hook: `Next: Equivalent fractions` or `Prism found a shortcut for you`.

### Path

- Make this the primary scroll-heavy surface.
- Use a full-width, vertically winding workshop track with 5–7 visible stations across roughly two phone heights.
- Position nodes alternately left/right/centre with generous spacing and small environmental props.
- Place Prism at the current node; use a subtle idle motion unless reduced motion is enabled.
- Keep all released nodes playable. Recommended is brighter; future nodes are quieter, not disabled.
- After scrolling away, show a floating `Return to current` compass/Prism control.

### Quest Problem

- Treat each Problem as a full-height game scene: compact top progress, Problem prompt, one interaction, pinned action.
- Keep Prism as a small contextual presence, not the focal point while solving.
- Avoid separate cards for title, instruction, question, hint, and answer. Use hierarchy and whitespace inside one coherent scene.

### Feedback, repair, and completion

- Feedback appears immediately from the bottom with a Prism reaction.
- `Correct`: one reason it works plus `Continue`; optional `Why?` expansion.
- `Not yet`: one precise observation plus `Show me` or `Try again`; do not dump a paragraph.
- Repair is visual/manipulable and returns directly to the preserved original Problem.
- Completion gives Prism the stage and shows only the reward, learning insight, streak/goal progress, and exit/bonus choice.

## Priority order

1. Rebuild Path as a literal workshop journey with Prism at the current node.
2. Redesign active quest states to fit the primary decision in one viewport with a pinned action.
3. Create the seven Prism states and place them consistently across the journey.
4. Reduce card-within-card composition and replace some answer grids with fraction manipulatives.
5. Keep Home one-screen; leave scrolling for Path and reference screens.
6. Validate on a small phone, with 200% text, reduced motion, screen reader, keyboard, and both iOS/Android target-size rules.

## Bottom line

The competitive pattern is not “put every feature above the fold.” It is **one obvious action per scene, a spatial route for long-term progress, a companion who reacts meaningfully, and short feedback loops that visibly change the learner’s world.** Curious Workshop should scroll where the journey benefits from space and feel screen-by-screen where the learner is actively solving.

## Addendum: achievements and Prism as tutor-guide

Research date: 4 September 2026  
Scope: current first-party product and design material from Duolingo, Brilliant, and Khan Academy.

### Do successful learning apps use badges?

Yes, but badges are usually a **secondary record of meaningful milestones**, not the main reason to return each day.

- Duolingo has Achievements and personal-record awards, but its own description places the collection on the Profile as a trophy shelf. The examples recognise substantial or distinctive events—long streaks, personal bests, league results, and major course milestones. Duolingo presents achievements as one layer alongside the stronger daily systems of lessons, streaks, XP, friends, and leaderboards. ([Duolingo achievement badges](https://blog.duolingo.com/achievement-badges/))
- Khan Academy also awards badges for behaviours such as reaching mastery, completing units, or earning effort points. It explicitly separates those effort points from mastery or ability. ([Khan Academy points, badges, and avatars](https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars))
- Brilliant takes the more relevant approach for this MVP: it says most retention growth comes from excellent content delivery, intentionally avoids packing in too many game incentives, and concentrates on a few core loops such as progress levels, streaks, XP, and leagues. ([Brilliant’s learning method](https://brilliant.org/about/))

**MVP decision:** remove `Achievements` as a primary navigation destination. A grid of generic medals creates visual inventory without improving the next learning decision, and producing enough distinctive, desirable awards is a separate product and illustration project. Do not remove recognition entirely. Replace the standalone screen with:

1. **Journey progress on Path:** completed stations, Boss victories, chapter completion, and Prism visibly moving forward.
2. **Personal bests inside Me:** longest streak, hardest skill mastered, Problems repaired, and completed chapters—real data, not invented badge names.
3. **Milestone moments in context:** a short, designed celebration when the event occurs, then a compact entry in the learner’s history.
4. **One optional `Milestones` section later:** add it only after there are enough rare, meaningful accomplishments to make opening the collection worthwhile.

Avoid emojis as finished iconography. They vary by platform and make the product look assembled rather than authored. Use a small custom visual language based on the workshop world—engraved station seals, Prism-made artifacts, completed machine parts, or chapter keepsakes—and reserve those assets for real milestones.

### Prism must be a character system, not a repeated sticker

Duolingo says characters only have lasting impact when they appear where learners spend most of their time. It designed them into the majority of exercises, gave them distinct correct-answer reactions, and uses mid-lesson character moments. Duo and the cast also cheer, encourage, and appear throughout the course. ([Duolingo character design](https://blog.duolingo.com/building-character/), [Duolingo teaching method](https://blog.duolingo.com/duolingo-teaching-method/))

For a tutor-guide, Brilliant’s Koji is the stronger functional reference: Koji sees the exact Problem and the learner’s current work, pinpoints the misunderstanding, guides thinking step by step, and can highlight or manipulate the learning surface instead of switching to a generic chat. ([How Koji works](https://brilliant.org/help/features/how-does-koji-work/))

**Prism’s product contract:** Prism knows where Maya is, what she attempted, why the current step matters, and what she should do next. Every appearance must perform one of four jobs:

- **Orient:** “We’re learning equivalent fractions. This station takes about 10 minutes.”
- **Teach:** point to, draw on, split, combine, or animate the exact mathematical representation being discussed.
- **Respond:** react specifically to Maya’s choice—celebrate the working strategy or name the misconception in one sentence.
- **Transition:** lead Maya to the Repair Activity, back to the preserved Problem, or onward to the next station.

Prism should persist across the product, but not at one size or in one pose:

| Surface | Prism’s job and treatment |
|---|---|
| Welcome / setup | Full character, introduces itself directly, demonstrates personality in one line. |
| Play Home | Large tutor greeting tied to today’s exact quest and recent learning state. |
| Path | Physical guide standing at the current station; points toward the recommended next node and moves after completion. |
| Problem | Small coach near the prompt or work area; quiet until help or feedback is needed. |
| Hint / diagnostic | Medium, attentive pose; points to the relevant number, step, or visual model. |
| Repair Activity | Active teaching pose; directly manipulates or annotates the learning object. |
| Correct | Brief specific reaction, then gets out of the way of `Continue`. |
| Incorrect | Curious/supportive reaction plus one precise observation; never a generic sad face. |
| Checking uploaded work | Looks at the same work and indicates the step currently being checked; does not imply a result early. |
| Completion / Boss victory | Full scene with a visible change to Prism or the workshop world. |
| Me / settings / statistics | Small portrait or none unless Prism is interpreting a learning insight; avoid decorative repetition. |

### Character design requirements

Prism needs a production-ready character sheet before more screens are polished:

- One unmistakable silhouette readable at 40 px; do not rely on facial detail to recognise it.
- Front, three-quarter, side, and back turnarounds with consistent proportions.
- Clear construction rules for body geometry, eyes, hands/pointing mechanism, colour, outline, and shadow.
- At least eight authored expressions/poses: welcome, ready, point, think, explain, support, celebrate, and victory.
- A speaking system with concise speech bubbles, plus silent poses so Prism does not chatter on every screen.
- A visual teaching toolkit: pointer/beam, highlight ring, sketch line, fraction pieces, number-line marker, and step annotation.
- Static equivalents for every animated state and reduced-motion support.
- Consistent personality: curious, clever, patient, slightly mischievous, and never babyish. Duolingo’s character work emphasises a strong silhouette, simple geometry, large expressive eyes, distinct poses, and a coherent visual world; it also notes that this quality required extensive iteration rather than one generic mascot asset. ([Duo redesign](https://blog.duolingo.com/reshaping-duo/), [Duolingo character design](https://blog.duolingo.com/building-character/))

### Immediate product changes

1. Keep `Achievements` removed from navigation; use the agreed three-item navigation: `Play`, `Path`, `Me`, with Settings reached from Me.
2. Replace the current badge grid with a compact `Your journey so far` section inside `Me` using actual learning milestones.
3. Replace emoji medals and props with a coherent starter set of workshop illustrations.
4. Redesign Prism once as a detailed character system; then replace every temporary mascot mark from that shared source.
5. Make Prism’s speech state-aware. Copy must come from current Problem, attempt, misconception, and next action—not generic encouragement.
6. In Repair Activities, give Prism at least one genuine visual teaching action. That is the first proof that Prism is the tutor, not merely the brand mascot.
