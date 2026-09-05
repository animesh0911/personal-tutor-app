// One deterministic loop. Content is data; no runtime model calls.
export function createEngine(pack) {
  const skills = Object.fromEntries(pack.skills.map((s) => [s.id, s]));
  const questions = Object.fromEntries(pack.questions.map((q) => [q.id, q]));
  const DAY = 86400000;
  const blankProgress = () => ({
    band: 0,
    window: [],
    independent: 0,
    attempts: 0,
    helped: 0,
    introduced: false,
    readyUntil: 0,
    completed: false,
    dueAt: 0,
    lastAt: 0,
  });
  function freshState() {
    return {
      packVersion: pack.version,
      revision: 0,
      progress: {},
      history: {},
      xp: 0,
      totalAttempts: 0,
      sessionsCompleted: 0,
      active: null,
      recent: [],
      lastRequest: null,
    };
  }
  function prog(s, id) {
    return (s.progress[id] ||= blankProgress());
  }
  function choose(s, id, band = 0, avoid = []) {
    const all = pack.questions.filter((q) => q.skill === id && q.band === band);
    const unused = all.filter((q) => !avoid.includes(q.id));
    const pool = unused.length
      ? unused
      : all.filter((q) => q.id !== avoid.at(-1));
    if (!pool.length)
      throw new Error('No question is available for this activity.');
    return pool.sort(
      (a, b) =>
        (s.history[a.id]?.last || 0) - (s.history[b.id]?.last || 0) ||
        a.id.localeCompare(b.id),
    )[0];
  }
  function setQuestion(s, id, role, qid) {
    const a = s.active,
      p = prog(s, id);
    const q = qid
      ? questions[qid]
      : choose(
          s,
          id,
          ['diagnostic', 'repair', 'repair-check'].includes(role) ? 0 : p.band,
          a.used.slice(-8),
        );
    a.skill = id;
    a.role = role;
    a.qid = q.id;
    a.stage = 'question';
    a.hints = 0;
    a.failures = 0;
    a.assisted = role === 'retry';
    a.feedback = null;
    if (!a.used.includes(q.id)) a.used.push(q.id);
  }
  function targetQuestion(s, now) {
    const a = s.active;
    if (a.saved) {
      const saved = a.saved;
      a.saved = null;
      setQuestion(s, saved.skill, 'retry', saved.qid);
      a.returnTransfer = true;
      return;
    }
    const p = prog(s, a.target);
    setQuestion(
      s,
      a.target,
      p.completed && p.dueAt <= now
        ? 'review'
        : a.returnTransfer
          ? 'transfer'
          : 'practice',
    );
    a.returnTransfer = false;
  }
  function nextProbe(s, now) {
    const a = s.active,
      id = a.queue.shift();
    if (id) {
      a.checked.push(id);
      setQuestion(s, id, 'diagnostic');
    } else targetQuestion(s, now);
  }
  function lesson(s, id, kind = 'repair') {
    const a = s.active;
    a.skill = id;
    a.stage = 'lesson';
    a.role = kind;
    a.feedback = null;
  }
  function finish(s, reason = 'complete') {
    s.active.stage = 'complete';
    s.active.endReason = reason;
    if (reason === 'complete') s.sessionsCompleted++;
  }
  function record(s, q, correct, answer, now) {
    const a = s.active,
      p = prog(s, q.skill),
      old = s.history[q.id];
    const independent =
      correct && !a.assisted && a.failures === 0 && a.hints === 0;
    const comparable =
      ['practice', 'transfer', 'review'].includes(a.role) &&
      !a.assisted &&
      a.failures === 0 &&
      (!old || now - old.last >= DAY);
    const earned = correct && !old?.rewarded ? (independent ? 20 : 10) : 0;
    if (comparable) {
      p.window.push({ correct, band: q.band });
      p.window = p.window.filter((x) => x.band === q.band).slice(-3);
      if (independent) p.independent++;
      if (p.window.length === 3) {
        const successes = p.window.filter((x) => x.correct).length;
        if (successes === 3) {
          p.band = Math.min(2, q.band + 1);
          p.readyUntil = now + 7 * DAY;
          if (q.band >= 1 && !skills[q.skill].foundation) {
            p.completed = true;
            p.dueAt = now + 3 * DAY;
          }
        } else if (successes <= 1) p.band = Math.max(0, q.band - 1);
        p.window = [];
      }
    }
    if (correct && a.role === 'review' && independent) p.dueAt = now + 3 * DAY;
    p.attempts++;
    p.lastAt = now;
    if (a.assisted) p.helped++;
    s.xp += earned;
    s.totalAttempts++;
    s.history[q.id] = { last: now, rewarded: !!old?.rewarded || correct };
    s.recent.unshift({
      skill: q.skill,
      qid: q.id,
      correct,
      independent,
      comparable,
      role: a.role,
      band: q.band,
      at: now,
      xp: earned,
      answer,
    });
    s.recent = s.recent.slice(0, 150);
    return { independent, earned };
  }
  function number(value) {
    const t = String(value).trim().replaceAll('−', '-');
    if (
      !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(
        t,
      )
    )
      return null;
    const parts = t.split('/').map(Number),
      n = parts.length === 2 ? parts[0] / parts[1] : parts[0];
    return Number.isFinite(n) ? n : null;
  }
  function evaluate(q, value) {
    if (typeof value !== 'string' || value.length > 300)
      throw new Error('Enter an answer first.');
    if (q.type === 'choice') {
      if (!q.choices.includes(value))
        throw new Error('Choose one of the answers.');
      return value === q.answer;
    }
    const values = value.split(',').map(number);
    if (values.some((v) => v === null) || !values.length)
      throw new Error(
        'Use a number or fraction, such as -2 or 3/2. Separate two roots with a comma.',
      );
    const expected = Array.isArray(q.answer) ? q.answer : [q.answer];
    const unique = (xs) => [...new Set(xs)].sort((a, b) => a - b);
    const actual = unique(values),
      wanted = unique(expected);
    return (
      actual.length === wanted.length &&
      actual.every((n, i) => Math.abs(n - wanted[i]) <= 0.001)
    );
  }
  function transition(input, command, now = Date.now()) {
    const s = structuredClone(input);
    const { action } = command;
    if (s.packVersion !== pack.version)
      throw new Error(
        'This lesson pack has changed. Please start a new practice session.',
      );
    if (action === 'start') {
      const id = command.skill;
      if (!skills[id] || skills[id].foundation)
        throw new Error('Choose a chapter milestone.');
      if (s.active && s.active.stage !== 'complete' && s.active.target === id)
        return s;
      const p = prog(s, id);
      s.active = {
        target: id,
        skill: id,
        stage: p.introduced ? 'question' : 'intro',
        role: 'practice',
        qid: null,
        used: [],
        checked: [],
        queue: skills[id].prerequisites
          .filter((x) => prog(s, x).readyUntil <= now)
          .slice(0, 2),
        saved: null,
        returnTransfer: false,
        done: 0,
        goal: 6,
        repairs: 0,
        startXp: s.xp,
        startedAt: now,
        feedback: null,
      };
      if (p.introduced) nextProbe(s, now);
      return s;
    }
    const a = s.active;
    if (!a) throw new Error('Start a practice session first.');
    if (action === 'continue') {
      if (a.stage === 'intro') {
        prog(s, a.target).introduced = true;
        nextProbe(s, now);
      } else if (a.stage === 'lesson') {
        if (a.role === 'target-repair') targetQuestion(s, now);
        else setQuestion(s, a.skill, 'repair');
      } else if (a.stage === 'feedback') {
        const next = a.feedback.next;
        if (next === 'retry') {
          a.stage = 'question';
          a.feedback = null;
        } else if (next === 'probe') nextProbe(s, now);
        else if (next === 'repair') {
          a.repairs++;
          if (a.repairs > 3) finish(s, 'pause');
          else lesson(s, a.skill);
        } else if (next === 'check') setQuestion(s, a.skill, 'repair-check');
        else if (next === 'return') {
          a.queue = [];
          targetQuestion(s, now);
        } else if (next === 'investigate') {
          a.saved = { qid: a.qid, skill: a.skill };
          a.queue = skills[a.skill].prerequisites
            .filter((x) => !a.checked.includes(x))
            .slice(0, 2);
          if (a.queue.length) nextProbe(s, now);
          else lesson(s, a.skill, 'target-repair');
        } else if (next === 'next') {
          if (a.done >= a.goal) finish(s);
          else targetQuestion(s, now);
        }
      } else throw new Error('This activity is already ready.');
      return s;
    }
    if (a.stage !== 'question')
      throw new Error('Continue to the next question first.');
    const q = questions[a.qid];
    if (action === 'hint') {
      a.assisted = true;
      a.hints = Math.min(q.hints.length, a.hints + 1);
      return s;
    }
    if (action !== 'answer') throw new Error('Unknown action.');
    const correct = evaluate(q, command.answer),
      result = record(s, q, correct, command.answer, now);
    let next, heading, message;
    if (correct) {
      heading = result.independent
        ? 'You’ve got it!'
        : 'That’s it. Keep going.';
      message = q.explanation;
      if (a.role === 'diagnostic') {
        prog(s, a.skill).readyUntil = now + 7 * DAY;
        next = 'probe';
      } else if (a.role === 'repair') next = 'check';
      else if (a.role === 'repair-check') {
        prog(s, a.skill).readyUntil = now + 7 * DAY;
        next = 'return';
      } else {
        a.done++;
        if (a.role === 'retry') a.returnTransfer = true;
        next = 'next';
      }
    } else {
      a.failures++;
      a.assisted = true;
      if (['diagnostic', 'repair-check'].includes(a.role)) {
        heading = 'Let’s give this a little attention.';
        message = 'A short example will help us find the missing step.';
        next = 'repair';
      } else if (a.failures === 1) {
        a.hints = Math.max(1, a.hints);
        heading = 'Not quite yet. Try this hint.';
        message = q.hints[0];
        next = 'retry';
      } else {
        heading = 'Let’s work out the tricky part.';
        message =
          a.role === 'repair'
            ? 'Let’s revisit the example together.'
            : 'We’ll check a building block, then come back to this exact question.';
        next = a.role === 'repair' ? 'repair' : 'investigate';
      }
    }
    a.stage = 'feedback';
    a.feedback = {
      correct,
      heading,
      message,
      next,
      xp: result.earned,
      independent: result.independent,
      answer: command.answer,
    };
    return s;
  }
  function view(s, now = Date.now()) {
    const main = pack.skills.filter((x) => !x.foundation),
      a = s.active;
    const due = main.find(
      (x) => s.progress[x.id]?.completed && s.progress[x.id].dueAt <= now,
    );
    const recommended =
      due || main.find((x) => !s.progress[x.id]?.completed) || main[0];
    let active = null;
    if (a) {
      const q = questions[a.qid];
      active = {
        ...a,
        skillInfo: skills[a.skill],
        targetInfo: skills[a.target],
        band: q?.band ?? s.progress[a.target]?.band ?? 0,
        lesson: ['intro', 'lesson'].includes(a.stage)
          ? skills[a.skill].lesson
          : null,
        question: q
          ? {
              id: q.id,
              prompt: q.prompt,
              math: q.math,
              type: q.type,
              choices: q.choices,
              hints: q.hints.slice(0, a.hints),
              source: q.source,
              revisit: !!s.history[q.id] && a.failures === 0,
            }
          : null,
      };
      delete active.queue;
      delete active.saved;
      delete active.used;
      delete active.checked;
    }
    return {
      asOf: now,
      revision: s.revision,
      packVersion: s.packVersion,
      xp: s.xp,
      totalAttempts: s.totalAttempts,
      sessionsCompleted: s.sessionsCompleted,
      progress: s.progress,
      active,
      recommended: recommended.id,
      reviewDue: !!due,
      skills: main.map((x) => ({
        ...x,
        progress: s.progress[x.id] || blankProgress(),
      })),
      foundations: pack.skills
        .filter((x) => x.foundation)
        .map((x) => ({
          id: x.id,
          title: x.title,
          progress: s.progress[x.id] || blankProgress(),
        })),
      recent: s.recent.slice(0, 20),
      source: pack.sources[0],
      bands: pack.policy.bands,
    };
  }
  return { freshState, transition, view, evaluate, skills, questions };
}
