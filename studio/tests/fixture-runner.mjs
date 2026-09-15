// Only injected by tests. The shipped runtime never imports a scripted tutor.
import rootExplanation from './root-explanation.json' with { type: 'json' };
export async function fixtureRunner({ state, event, tools }) {
  const call = async (name, args) =>
    JSON.parse(
      (
        await tools
          .find((t) => t.name === name)
          .execute(crypto.randomUUID(), args)
      ).content[0].text,
    );
  await new Promise((r) => setTimeout(r, 100));
  if (event.requestedSkill === 'verify') {
    const q = await call('new_question', {
      skillId: 'verify',
      title: 'Check a root',
      prompt: 'Check x = 1 and x = 4 by substitution.',
      coefficients: { a: 1, b: -5, c: 4 },
      task: 'verify',
      candidate: 1,
      challengeReason: 'Connect substitution to zero.',
    });
    await call('present_activity', {
      title: 'Checking roots',
      skillId: 'verify',
      goalSkillId: 'verify',
      mode: 'worked-example',
      prompt: 'See what happens when you substitute a value.',
      problemId: q.id,
      components: [
        rootExplanation,
        { kind: 'equation', title: 'Show your thinking' },
      ],
    });
    return;
  }
  if (event.kind === 'submit') {
    await call('record_observation', {
      skillId: 'factor',
      note: 'You found the right product. We are exploring how the signs affect the sum.',
      confidence: 'tentative',
      status: 'practising',
      evidenceIds: [event.evidence.id],
      revisitInDays: 2,
    });
    await call('give_feedback', {
      tone: 'question',
      text: 'The product is right. What should the two numbers add up to?',
      nextAction: 'try-again',
    });
  } else if (event.kind === 'hint' || event.kind === 'exploration') {
    await call('give_feedback', {
      tone: 'hint',
      text: 'Look for a pair whose product is 6 and whose sum is −5. What do you notice about the signs?',
      nextAction: 'try-again',
    });
  } else if (event.kind === 'explain-differently') {
    await call('present_activity', {
      title: 'Meet the curve',
      skillId: 'factor',
      goalSkillId: 'factor',
      mode: 'explore',
      prompt: 'Move the point and observe where the curve meets the x-axis.',
      problemId: state.activity.problemId,
      components: [
        {
          kind: 'parabola',
          title: 'A quadratic in motion',
          coefficients: { a: 1, b: -5, c: 6 },
          revealRoots: false,
        },
      ],
    });
  } else {
    const coefficients =
      event.kind === 'new-question'
        ? { a: 1, b: -7, c: 10 }
        : { a: 1, b: -5, c: 6 };
    const q = await call('new_question', {
      skillId: 'factor',
      title: 'Find the hidden pair',
      prompt: 'Solve this equation by factorising.',
      coefficients,
      task: 'solve',
      candidate: null,
      challengeReason: 'Explore signs in factorisation.',
    });
    await call('set_learning_plan', {
      summary:
        'Explore factor pairs, then connect them to the roots of a quadratic.',
      steps: [
        {
          skillId: 'factor',
          reason: 'Build confidence with signed factor pairs.',
        },
        { skillId: 'verify', reason: 'Check roots by substitution.' },
      ],
    });
    await call('present_activity', {
      title:
        event.kind === 'new-question'
          ? 'A fresh pair of possibilities'
          : 'Find the hidden pair',
      skillId: 'factor',
      goalSkillId: 'factor',
      mode: 'practice',
      prompt: 'Two numbers can unlock this equation. What pair would you try?',
      problemId: q.id,
      components: [
        { kind: 'equation', title: 'Show your thinking' },
        {
          kind: 'factor-pairs',
          title: 'Explore a pair',
          sum: coefficients.b,
          product: coefficients.c,
        },
      ],
    });
  }
}
