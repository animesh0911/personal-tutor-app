# Evidence-based engagement and visual direction

_Prepared 2026-09-04 for the Class 6 mathematics MVP. This note distinguishes research findings from product-design inferences. It is not a claim that a visual treatment can make a product “addictive.”_

## Executive conclusion

There is no credible evidence that a particular color palette makes children sustainably learn or return. The strongest defensible design strategy is to make learning itself rewarding: a clear short goal, appropriately difficult interactions, immediate informative feedback, small choices, visible evidence of competence, a safe recovery loop, and a clean stopping point. Color, character, motion, and sound should clarify that loop and give it emotional warmth; they should not become the loop.

For minors, optimize **voluntary return and learning**, not maximum time-on-device. Avoid infinite play, autoplay, intermittent/variable rewards, loss-framed streaks, social comparison, countdown pressure, or a mascot that expresses distress when the learner leaves.

## What the evidence supports

| Area | Evidence | Product implication | Confidence |
|---|---|---|---|
| Immediate feedback | A counterbalanced randomized trial with 243 secondary mathematics students found that computer-based immediate correctness feedback plus optional hints benefited both lower- and higher-prior-knowledge learners, with larger gains for lower-prior-knowledge learners. A separate randomized experiment found benefits of computer-generated feedback for second-grade mathematical problem solving and transfer. [Fyfe & Rittle-Johnson, 2016](https://doi.org/10.1016/j.jecp.2016.03.009); [Koedinger et al. trial report](https://pmc.ncbi.nlm.nih.gov/articles/PMC7334720/) | Respond after each interaction. Say what worked or offer one useful next step; do not hold all feedback until the end of three questions. | Moderate–high for learning; exact UI treatment remains a design question. |
| Process feedback | A 2024 meta-analysis of 116 digital-feedback interventions found a moderate overall effect (`0.41`); feedback content, especially process-focused feedback, explained learning differences, while receiving a reward did not significantly improve performance. Both immediate and delayed feedback showed benefits. [Van der Kleij et al., 2024](https://doi.org/10.1007/s10984-024-09501-4) | Make the feedback sentence instructional—name the useful strategy or next operation. Keep celebration brief and subordinate to that information. | Moderate–high. |
| Active attempt and transfer | Retrieval-practice experiments show that retrieving knowledge can improve later retention compared with restudy, though much landmark work used verbal material and should not be overgeneralized to every kind of math reasoning. [Roediger & Karpicke, 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x); [Karpicke & Roediger, 2008](https://doi.org/10.1126/science.1152408) | Keep explanations short, then ask the learner to act. After repair, use a new transfer problem rather than awarding mastery for watching. | High for retrieval generally; moderate for this exact math product. |
| Classroom retrieval | A systematic review of 50 classroom experiments (`n=5,374`) found that 57% of retrieval-practice effects were medium or large across varied ages, formats, delays, and feedback conditions. Only 6% of experiments came from outside WEIRD countries, so local validation matters. [Agarwal, Nunes & Blunt, 2021](https://eric.ed.gov/?id=EJ1319572) | Use low-stakes attempts and revisit important skills later, but test the cadence with Indian learners rather than claiming universality. | Moderate–high, with geographic generalizability caveat. |
| Mastery progression | A meta-analysis of 108 controlled mastery-learning evaluations reported positive effects on achievement and attitudes, particularly for weaker learners, with additional time costs and some completion problems in fully self-paced contexts. [Kulik, Kulik & Bangert-Drowns, 1990](https://doi.org/10.3102/00346543060002265) | Adapt scaffolding and show mastery progress, while preserving easy resume points and avoiding rigid gates that strand learners. | Moderate; older literature and heterogeneous implementations. |
| Gamification | A learning-gamification meta-analysis found small positive effects on cognitive, motivational, and behavioral outcomes, but effects were heterogeneous; in high-rigor subsets, motivational and behavioral effects were not robust. Game fiction helped behavior in some analyses but not cognitive or motivational outcomes. [Sailer & Homner, 2020](https://doi.org/10.1007/s10648-019-09498-w) | Use game structure to support good learning behavior—quests, clear progress, meaningful challenge—not as proof that points and badges cause durable motivation. Measure learning and voluntary return separately. | Moderate for small learning benefits; low for any single game mechanic. |
| Autonomy, competence, relatedness | Self-determination research across education associates more autonomous motivation and support for autonomy, competence, and relatedness with better engagement, learning, and well-being. [Ryan & Deci, 2020](https://doi.org/10.1016/j.cedpsych.2020.101860) | Offer bounded choices (hint now / try once; sound on/off), make progress legible, and use the companion to convey support—not control. | Moderate–high at principle level. |
| Rewards | A meta-analysis of 128 studies reported that expected tangible, engagement-contingent, completion-contingent, and performance-contingent rewards can undermine free-choice intrinsic motivation, while positive informational feedback increased interest/free-choice behavior. The reward literature contains debate, so avoid treating the exact effect sizes as universal. [Deci, Koestner & Ryan, 1999](https://selfdeterminationtheory.org/wp-content/uploads/2014/04/1999_DeciKoestnerRyan_Meta.pdf) | XP and stars should summarize demonstrated learning, not bribe time spent. Do not pay out for opening the app, watching an explanation, or grinding easy items. Praise strategy and correction, not intelligence. | Moderate; effects depend on context and reward framing. |
| Praise framing | Across six experiments, children praised for intelligence showed less adaptive achievement motivation than children praised for effort. [Mueller & Dweck, 1998](https://pubmed.ncbi.nlm.nih.gov/9686450/) | Prefer truthful, specific process language: “That strategy worked” or “You fixed the denominator step.” Avoid “You’re a genius.” Do not praise empty effort when the strategy was ineffective. | Moderate–high for avoiding trait/intelligence praise. |
| Pedagogical character | An umbrella review of 17 systematic reviews/meta-analyses found small positive effects of pedagogical agents on learning and motivation, but could not derive a reliable recipe for how a character should look. Gesture and facial-expression findings are mixed. [Schroeder, Davis & Yang, 2025](https://doi.org/10.1177/07356331241288476) | A mascot is reasonable, but must have an instructional job: point, demonstrate, acknowledge, and normalize repair. Its species, eye size, cuteness, and animation style are brand hypotheses to test with learners—not scientific facts. | Moderate for a small agent effect; low for visual specifics. |
| Relevant visuals vs decoration | A 2026 multi-level meta-analysis of 177 effect sizes found a small negative effect of seductive details on learning, mediated mainly by extraneous cognitive load. Earlier reviews also report mixed/context-dependent results. [Cheng et al., 2026](https://doi.org/10.1007/s10648-025-10099-z) | Keep the quest shell lively, but make the central work area calm. Animate fraction bars, number lines, and transformations because they teach; pause mascot idle motion while the learner reads or calculates. | Moderate–high for avoiding irrelevant detail. |
| Child-centred stopping | The American Academy of Pediatrics identifies autoplay, intermittent rewards, algorithmic recommendation, and social quantification as engagement-prolonging design and recommends child-centred designs that support agency and disengagement. It notes much digital-media evidence is observational. [AAP policy statement, 2026](https://publications.aap.org/pediatrics/article/157/2/e2025075320/206129/Digital-Ecosystems-Children-and-Adolescents-Policy) | End every 8–12 minute quest clearly. Show “Quest complete” and leave continuation as an explicit choice. No endless feed, surprise reward schedule, guilt, or obscured exit. | High as ethical/clinical guidance; causal evidence is more limited. |
| Privacy and nudges | The UK Information Commissioner’s Children’s Code requires best interests, high privacy by default, data minimisation, and prohibits nudging children to weaken privacy or provide unnecessary data. UNICEF’s RITEC work calls for play-centred, rights-respecting design informed by children. [ICO Children’s Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/); [UNICEF RITEC](https://www.unicef.org/innocenti/projects/responsible-innovation-technology-children) | Separate learning motivation from consent and data collection. Never attach XP, celebration, blocking friction, or mascot emotion to privacy choices. Conduct learner co-design/usability tests. | High as official guidance. |

## Claims the evidence does **not** justify

- **“Blue creates trust,” “orange creates excitement,” or “red makes users act.”** Color can affect affect/cognition, but effects are contextual, culturally learned as well as biological, and historically plagued by methodological problems. The field does not supply a universal engagement palette for children. [Elliot & Maier review](https://doi.org/10.1146/annurev-psych-010213-115035)
- **A scientifically optimal session length.** Ten minutes is a sensible MVP constraint, not an established universal optimum. Test 8–12 minutes with actual learners using completion, fatigue, return, and transfer—not time-on-app alone.
- **A scientifically optimal mascot shape.** Evidence supports the possible value of a pedagogical agent, not “an owl is better than a robot” or specific facial proportions.
- **More motion and sound produce more retention.** They can signal state and add affect, but irrelevant audiovisual details can distract. Their contribution should be tested experimentally.
- **A single “addictiveness” score.** High session frequency can coexist with weak learning, compulsive use, or reward grinding. The product should optimize a balanced metric set.

## Design inference for this product

The following is a reasoned starting hypothesis—not a direct experimental result.

### Recommended visual direction: **Curious Workshop**

A bright, tactile mathematical world in which shapes transform, connect, balance, split, and combine. It feels like a polished puzzle game rather than a classroom or cartoon nursery.

- **Shell:** energetic gradients, bold chapter landmarks, rounded geometry, a few large shapes.
- **Learning stage:** warm near-white surface, strong text contrast, one focal interaction, minimal decoration.
- **Shapes:** friendly and geometric; 16–24 px card radii, pill controls only for short actions, subtle 2–3 px outlines.
- **Illustration:** abstract mathematical objects and environments, not school desks, books, flags, uniforms, or culture-specific clichés.
- **Age range:** avoid baby proportions, stickers everywhere, candy visuals, or childish handwriting fonts. Use expressive display type sparingly and a highly legible sans-serif for all learning text.

### Palette roles

These colors are selected for differentiation, warmth, brand distinctiveness, and achievable contrast—not because a hue is proven to be addictive.

| Role | Starting token | Use |
|---|---:|---|
| Brand / primary | `#4F46E5` indigo | Primary actions, recommended path, major progress |
| Brand strong | `#3730A3` | Pressed states and white-text actions |
| Play accent | `#F97316` coral-orange | Celebration sparks and highlights; pair with dark text, not white body text |
| Teaching accent | `#0E7490` deep cyan | Hints, explanations, visual models |
| Growth / success | `#15803D` green | Confirmed understanding and transfer success |
| Guidance / current | `#7C3AED` violet | Current step or diagnostic guidance |
| Error / attention | `#B91C1C` | System errors or unsafe actions only; ordinary wrong answers use guidance colors |
| Canvas | `#F8FAFC` | Calm main background |
| Surface | `#FFFFFF` | Learning cards |
| Ink | `#172033` | Main text and math |
| Muted ink | `#526075` | Secondary text, subject to contrast testing |

Use color semantically and redundantly with icon, label, shape, or position. Validate all real foreground/background pairs to WCAG 2.2 AA; these hex values alone do not guarantee compliance in every component.

### Mascot concept: **the Shape-Shifter**

A small, gender-neutral, non-human companion made from two or three simple geometric pieces. It can stretch into a number-line pointer, divide into fraction parts, balance like an equation scale, or form an angle. This makes the character pedagogically relevant instead of decorative.

Role boundaries:

- **Guide:** points attention to the next meaningful action.
- **Co-thinker:** briefly shows uncertainty or a strategy, never claims omniscience.
- **Repair companion:** frames an error as useful evidence and demonstrates one manipulable idea.
- **Witness:** celebrates demonstrated transfer more strongly than routine correctness.
- **Never:** begs the learner to return, appears injured/sad when they exit, withholds affection, impersonates a human teacher, or turns privacy/commerce actions into play.

Keep four base poses for the MVP: idle, point/teach, think/repair, celebrate. Freeze or replace nonessential loops under reduced motion and while the learner is reading.

### Motion and sound

- 100–180 ms tactile press/selection feedback; 250–450 ms state transitions; reserve a 600–900 ms celebration for repair or quest completion.
- Use motion to preserve object continuity—e.g. a fraction piece moves into place or both equation sides rebalance.
- Avoid perpetual background motion, screen shake for wrong answers, random confetti, and animation that blocks the next action.
- Use a short, distinct confirmation sound; a soft neutral cue for “try another step”; a brief melodic phrase only for meaningful milestones. No alarm, buzzer, loss sound, or voice guilt.
- Sound and haptics default to optional, never carry meaning alone, and respect system/reduced-motion settings. Do not autoplay background music; give persistent independent audio control. [W3C audio-control guidance](https://www.w3.org/WAI/WCAG21/Understanding/audio-control)

### Engagement loop

1. **Return:** “Today’s 10-minute quest” shows one clear goal and a visible end.
2. **Attempt:** one focused, touch-first mathematical interaction at an appropriate level.
3. **Immediate evidence:** the interface confirms the reasoning or points to one next step.
4. **Agency:** learner chooses “try once” or “show a small hint” when appropriate.
5. **Repair:** a short interactive visual makes the missing relationship manipulable.
6. **Prove:** learner retries, then solves a transfer problem.
7. **Competence reward:** path advances; XP/stars describe what was mastered; the mascot gives a stronger celebration for successful repair.
8. **Stop:** a clear completion screen summarizes learning and offers “Done for today” as the primary action. Optional continued practice is explicit, finite, and never loss-framed.

The difficulty update can occur after three comparable interactions, but feedback remains immediate after each. Rewards must not scale with time spent, repeated easy-item grinding, or data sharing.

## What to test with Class 6 learners

Before treating this direction as the brand, test two or three prototypes with 8–12 learners and guardians:

1. Can learners identify the main action in under five seconds?
2. Does the mascot aid attention or distract from the mathematics?
3. Do learners interpret guidance states as supportive rather than as failure?
4. Can they stop after quest completion without feeling they lost something?
5. After 24–72 hours, can they solve a transfer item—not merely recall the animation?
6. Which of two palette/character variants feels inviting without seeming “for little kids”?

Run later A/B tests on one mechanic at a time. Primary outcomes: transfer success, independent hint-free attempts, quest completion, and voluntary return after a clean stop. Guardrails: total daily minutes, repeated easy-item grinding, distress reports, and guardian complaints.
