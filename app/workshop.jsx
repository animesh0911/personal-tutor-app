'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Lightbulb,
  LogOut,
  Map,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  User,
  X,
} from 'lucide-react';
import { MathText, Rich } from '@/components/learning/math-text';
import { LearningVisual } from '@/components/learning/learning-visual';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Brand() {
  return (
    <a className="brand" href="#play" aria-label="Curious Workshop home">
      <span className="brand-mark">◇</span>
      <span>
        curious<span className="brand-light">workshop</span>
      </span>
    </a>
  );
}
function Primary({ children, ...props }) {
  return (
    <Button className="primary" {...props}>
      {children}
    </Button>
  );
}
function Secondary({ children, ...props }) {
  return (
    <Button variant="outline" className="secondary" {...props}>
      {children}
    </Button>
  );
}
function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
const statusLabels = {
  new: 'Not started',
  'in-progress': 'In progress',
  practised: 'Practised',
  completed: 'Completed',
};
function MilestoneProgress({ progress, bands }) {
  const checkpoint = progress.checkpoint || {
    correct: 0,
    attempted: 0,
    results: [null, null, null],
  };
  return (
    <div className="milestone-progress">
      <div className="milestone-progress-heading">
        <Badge tone={progress.completed ? 'green' : 'teal'}>
          {statusLabels[progress.status] || 'In progress'}
        </Badge>
        <span>{bands[progress.band]} practice</span>
      </div>
      {progress.completed ? (
        <p>
          <CheckCircle2 size={16} /> Milestone completed. Stretch practice is
          optional.
        </p>
      ) : (
        <>
          <div className="checkpoint">
            <div
              className="checkpoint-slots"
              aria-label={`${checkpoint.correct} correct from ${checkpoint.attempted} independent answers in this checkpoint`}
            >
              {checkpoint.results.map((r, i) => (
                <span
                  key={i}
                  className={
                    r === true ? 'passed' : r === false ? 'retry' : 'pending'
                  }
                  aria-label={
                    r === true
                      ? 'Correct'
                      : r === false
                        ? 'Needs practice'
                        : 'Not answered'
                  }
                >
                  {r === true ? '✓' : r === false ? '↻' : '·'}
                </span>
              ))}
            </div>
            <span>
              {checkpoint.correct}/3 correct · {checkpoint.attempted}/3 checked
            </span>
          </div>
          <p>
            {progress.band === 0
              ? 'Get 3/3 independently to move to Standard.'
              : 'Get 3/3 independently at Standard to complete this milestone.'}{' '}
            Hints help you learn; hinted answers don’t fill this checkpoint.
          </p>
        </>
      )}
      <span className="milestone-evidence">
        {progress.solved || 0} different questions solved
        {progress.sessionsCompleted
          ? ` · ${progress.sessionsCompleted} practice session${progress.sessionsCompleted === 1 ? '' : 's'} completed`
          : ''}
      </span>
    </div>
  );
}
const buttonLabels = {
  retry: 'Try again',
  probe: 'Continue',
  repair: 'Show me how',
  check: 'Try one on your own',
  return: 'Back to your question',
  investigate: 'Find the missing step',
  next: 'Next question',
};

export default function Workshop() {
  const [data, setData] = useState(null),
    [screen, setScreen] = useState('play'),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [mode, setMode] = useState('register'),
    [answer, setAnswer] = useState('');
  const latest = useRef(null),
    inFlight = useRef(false),
    pending = useRef(null),
    heading = useRef(null);
  function accept(d) {
    const old = latest.current;
    latest.current = d;
    setData(d);
    if (
      old?.active?.qid !== d.active?.qid ||
      old?.active?.stage !== d.active?.stage
    )
      setAnswer('');
  }
  function navigate(to) {
    window.location.hash = to;
    setScreen(to);
    setError('');
    setAnswer('');
    window.scrollTo({ top: 0 });
  }
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/workshop', {
        signal: AbortSignal.timeout(15000),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      accept(d);
    } catch (e) {
      setError(e.message || 'Your workshop couldn’t load. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  async function send(action, extra = {}) {
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    setError('');
    const signature = JSON.stringify({
      action,
      ...extra,
      revision: latest.current?.revision,
    });
    if (!pending.current || pending.current.signature !== signature)
      pending.current = { signature, requestId: crypto.randomUUID() };
    const body = {
      action,
      ...extra,
      revision: latest.current?.revision,
      requestId: pending.current.requestId,
    };
    try {
      const res = await fetch('/api/workshop', {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.refresh) await load();
        if (d.signedOut) accept({ user: null });
        pending.current = null;
        throw new Error(d.error);
      }
      pending.current = null;
      accept(d);
      return d;
    } catch (e) {
      setError(
        e.message ||
          'Couldn’t connect. Please try again; your progress is saved.',
      );
      return null;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  async function start(skill) {
    const d = await send('start', { skill });
    if (d) navigate('learn');
    return d;
  }
  async function auth(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const d = await send(mode, {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    });
    if (d) navigate('play');
  }
  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
    const update = () => {
      const route = window.location.hash.slice(1);
      setScreen(
        ['play', 'path', 'me', 'learn'].includes(route) ? route : 'play',
      );
    };
    queueMicrotask(update);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [data?.active?.qid, data?.active?.stage, screen]);
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const definitions = [
      {
        name: 'read_learning_progress',
        title: 'Read learning progress',
        description:
          'Read the signed-in learner’s milestone progress and recommended next activity.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => {
          const d = latest.current;
          if (!d?.user) throw new Error('Sign in first.');
          return { recommended: d.recommended, progress: d.progress, xp: d.xp };
        },
      },
      {
        name: 'start_milestone',
        title: 'Start a milestone',
        description:
          'Start or resume a quadratic-equations milestone and show the learning activity. This does not answer any questions.',
        inputSchema: {
          type: 'object',
          properties: {
            skill: {
              type: 'string',
              enum: [
                'recognise',
                'verify',
                'factor',
                'formula',
                'discriminant',
                'model',
              ],
            },
          },
          required: ['skill'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: async (input) => {
          if (!latest.current?.user) throw new Error('Sign in first.');
          if (
            !input ||
            typeof input.skill !== 'string' ||
            !latest.current.skills.some((s) => s.id === input.skill)
          )
            throw new Error('Choose a valid milestone.');
          const d = await start(input.skill);
          if (!d) throw new Error('The milestone could not start.');
          await new Promise((resolve) => requestAnimationFrame(resolve));
          return { skill: d.active.target, stage: d.active.stage };
        },
      },
    ];
    definitions.forEach((tool) => {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    });
    return () => lifecycle.abort();
  }, []);
  const a = data?.active;
  const errorBox = error ? (
    <div className="error-box" role="alert">
      <CircleHelp size={20} />
      <span>{error}</span>
      <Button
        variant="ghost"
        className="icon-button"
        aria-label="Dismiss message"
        onClick={() => setError('')}
      >
        <X size={18} />
      </Button>
    </div>
  ) : null;
  if (loading && !data)
    return (
      <main className="loading-scene">
        <Brand />
        <div className="loading-dot" />
        <h1>Opening your workshop…</h1>
        <p>Your next discovery is on its way.</p>
      </main>
    );
  if (!data && error)
    return (
      <main className="loading-scene">
        <Brand />
        <h1>Let’s try that again.</h1>
        {errorBox}
        <Primary onClick={load}>Reload workshop</Primary>
      </main>
    );
  if (!data?.user)
    return (
      <main className="welcome">
        <header className="welcome-header">
          <Brand />
          <span className="muted">CLASS 10 · MATHEMATICS</span>
        </header>
        <section className="welcome-grid auth-layout">
          <div>
            <span className="eyebrow">
              A LITTLE PRACTICE. A NEW POSSIBILITY.
            </span>
            <h1>
              Big equations.
              <br />
              <span>Small discoveries.</span>
            </h1>
            <p className="intro-copy">
              Find your way through quadratic equations. A useful hint, a small
              step, and that moment when it clicks.
            </p>
            <div className="equation-preview">
              <MathText block value="x^2-5x+6=(x-2)(x-3)" />
              <div>
                <Badge tone="green">x = 2</Badge>
                <span>or</span>
                <Badge tone="green">x = 3</Badge>
              </div>
            </div>
            <p className="welcome-note">
              <Sparkles size={20} /> Start where you are. We’ll work it out
              together.
            </p>
          </div>
          <section className="auth-card" aria-label="Your account">
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v);
                setError('');
              }}
            >
              <TabsList className="auth-tabs">
                <TabsTrigger value="register">Create account</TabsTrigger>
                <TabsTrigger value="login">Sign in</TabsTrigger>
              </TabsList>
            </Tabs>
            <h2>
              {mode === 'register'
                ? 'Make room for a little discovery.'
                : 'Welcome back.'}
            </h2>
            <p className="muted">
              {mode === 'register'
                ? 'Your progress, saved as you go.'
                : 'Pick up exactly where you left off.'}
            </p>
            <form onSubmit={auth}>
              {mode === 'register' && (
                <label className="field" htmlFor="account-name">
                  What should we call you?
                  <Input
                    id="account-name"
                    name="name"
                    autoComplete="nickname"
                    placeholder="Your first name"
                    required
                    maxLength={40}
                  />
                </label>
              )}
              <label className="field" htmlFor="account-email">
                Email
                <Input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  maxLength={254}
                />
              </label>
              <label className="field" htmlFor="account-password">
                Password
                <Input
                  id="account-password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  placeholder="At least 10 characters"
                  minLength={10}
                  maxLength={128}
                  required
                />
              </label>
              {errorBox}
              <Primary type="submit" disabled={busy}>
                {busy
                  ? 'One moment…'
                  : mode === 'register'
                    ? 'Start my journey'
                    : 'Back to my workshop'}
                <ArrowRight size={20} />
              </Primary>
            </form>
            <p className="auth-foot">
              A short session. As much help as you need.
            </p>
          </section>
        </section>
        <div className="welcome-bottom">
          <BookOpen size={18} />
          <span>Quadratic equations · NCERT Class 10</span>
          <span className="dot-divider">·</span>
          <span>6 milestones, at your pace</span>
        </div>
      </main>
    );
  const current =
      data.skills.find((s) => s.id === data.recommended) || data.skills[0],
    resume = a && a.stage !== 'complete';
  const navigation = (
    <nav aria-label="Main navigation">
      {[
        ['play', Play, 'Play'],
        ['path', Map, 'Path'],
        ['me', User, 'Me'],
      ].map(([id, Icon, label]) => (
        <a
          key={id}
          href={'#' + id}
          className={screen === id ? 'active' : ''}
          aria-current={screen === id ? 'page' : undefined}
        >
          <Icon size={20} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
  const frame = (body) => (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Brand />
          {screen === 'learn' ? (
            <Badge tone="teal">
              <BookOpen size={15} /> Quadratic equations
            </Badge>
          ) : (
            navigation
          )}
          <div className="xp-pill">
            <Star size={18} />
            <span>{data.xp} XP</span>
          </div>
        </div>
      </header>
      {screen !== 'learn' && <div className="mobile-nav">{navigation}</div>}
      <main className={screen === 'learn' ? 'lesson-shell' : 'app-shell'}>
        {errorBox}
        {body}
      </main>
      <footer className="app-footer">
        Curious Workshop <span>One discovery at a time.</span>
      </footer>
    </>
  );
  if (screen === 'learn' && a) {
    const support = ['diagnostic', 'repair', 'repair-check'].includes(a.role),
      isLesson = ['intro', 'lesson'].includes(a.stage),
      complete = a.stage === 'complete',
      q = a.question,
      feedback = a.feedback;
    const tag = isLesson
      ? a.stage === 'intro'
        ? 'A QUICK INTRODUCTION'
        : 'A LITTLE HELP'
      : a.role === 'diagnostic'
        ? 'QUICK CHECK'
        : a.role === 'repair'
          ? 'LET’S BUILD THIS TOGETHER'
          : a.role === 'repair-check'
            ? 'YOUR TURN, WITHOUT THE HINTS'
            : a.role === 'retry'
              ? 'BACK TO YOUR QUESTION'
              : a.role === 'transfer'
                ? 'TRY ANOTHER ONE'
                : a.role === 'review'
                  ? 'A LITTLE REFRESH'
                  : 'YOUR NEXT DISCOVERY';
    if (complete)
      return frame(
        <section className="completion">
          <div className="completion-icon">
            {a.endReason === 'pause' ? (
              <BookOpen size={42} />
            ) : (
              <CheckCircle2 size={48} />
            )}
          </div>
          <span className="eyebrow">
            {a.endReason === 'pause'
              ? 'PROGRESS SAVED'
              : data.progress[a.target]?.completed
                ? 'MILESTONE COMPLETED'
                : 'PRACTICE COMPLETE'}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {a.endReason === 'pause'
              ? 'A good place to pause.'
              : data.progress[a.target]?.completed
                ? `${a.targetInfo.title}: completed!`
                : 'Practice saved. Confidence growing.'}
          </h1>
          <p>
            {a.endReason === 'pause'
              ? 'This building block needs a little more time. Your progress is saved; you can return when you’re ready.'
              : `You worked through ${a.done} questions in ${a.targetInfo.title.toLowerCase()}. Every useful attempt moves you forward.`}
          </p>
          <div className="session-stats">
            <div>
              <strong>{a.done}</strong>
              <span>questions solved</span>
            </div>
            <div>
              <strong>+{data.xp - a.startXp}</strong>
              <span>XP earned</span>
            </div>
          </div>
          <div className="teaching-note">
            <Lightbulb size={22} />
            <p>
              {data.progress[a.target]?.completed
                ? 'You’ve demonstrated independent success at standard difficulty. We’ll bring this back for a refresh in a few days.'
                : 'Practice builds confidence. A few correct answers don’t tell the whole story—we’ll keep checking as you learn.'}
            </p>
          </div>
          <MilestoneProgress
            progress={data.progress[a.target]}
            bands={data.bands}
          />
          <Primary onClick={() => navigate('path')}>
            See my updated path <ArrowRight size={20} />
          </Primary>
          <a className="text-link" href="#path">
            Explore another milestone
          </a>
        </section>,
      );
    return frame(
      <>
        <div className="quest-top">
          <Button
            variant="ghost"
            className="text-button"
            onClick={() => navigate('play')}
          >
            <ArrowLeft size={18} /> Save & exit
          </Button>
          <span>
            {a.role === 'transfer' && a.done >= a.goal
              ? 'Final check after your repair'
              : `Question ${Math.min(a.done + 1, a.goal)} of ${a.goal}`}
            {support ? ' · building block' : ''}
          </span>
        </div>
        <Progress
          value={Math.min(100, (a.done / a.goal) * 100)}
          aria-label={`${a.done} of ${a.goal} questions solved`}
          className="quest-progress"
        />
        <div className="lesson-layout">
          <section className="work-card">
            <div className="work-label">
              <span className="eyebrow">{tag}</span>
              <Badge tone={support ? 'teal' : ''}>
                {support ? 'Building block' : data.bands[a.band]}
              </Badge>
            </div>
            <h1 className="quest-heading" ref={heading} tabIndex={-1}>
              {isLesson
                ? a.skillInfo.title
                : support
                  ? a.skillInfo.title
                  : a.targetInfo.title}
            </h1>
            {support && (
              <p className="return-note">
                This helps with{' '}
                <strong>{a.targetInfo.title.toLowerCase()}</strong>. We’ll come
                right back.
              </p>
            )}
            {isLesson ? (
              <>
                <LearningVisual
                  key={`${a.skill}-${a.stage}`}
                  spec={a.lesson.visual}
                />
                <div className="action-tray">
                  <Primary disabled={busy} onClick={() => send('continue')}>
                    {busy
                      ? 'Saving…'
                      : a.stage === 'intro'
                        ? 'Let’s try it'
                        : 'Try a small step'}
                    <ArrowRight size={20} />
                  </Primary>
                </div>
              </>
            ) : (
              <>
                <p className="question-prompt">{q?.prompt}</p>
                {q?.math && (
                  <div className="question-equation">
                    <MathText block value={q.math} />
                  </div>
                )}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (a.stage === 'question')
                      await send('answer', { answer });
                  }}
                >
                  {q?.type === 'choice' ? (
                    <RadioGroup
                      value={feedback?.answer || answer}
                      onValueChange={setAnswer}
                      aria-label="Choose an answer"
                      disabled={busy || a.stage === 'feedback'}
                      className="answer-options"
                    >
                      {q.choices.map((option, i) => (
                        <label
                          key={option}
                          className={`answer-option ${(feedback?.answer || answer) === option ? 'selected' : ''} ${feedback?.answer === option ? (feedback.correct ? 'correct' : 'incorrect') : ''}`}
                        >
                          <RadioGroupItem
                            value={option}
                            aria-label={option.replaceAll('$', '')}
                            className="answer-radio"
                          />
                          <span className="option-letter">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>
                            <Rich text={option} />
                          </span>
                          {feedback?.answer === option &&
                            (feedback.correct ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <RotateCcw size={20} />
                            ))}
                        </label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <label className="field answer-field">
                      Your answer
                      <Input
                        autoComplete="off"
                        value={feedback?.answer ?? answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={
                          q?.type === 'roots'
                            ? 'e.g. -2, 3/2'
                            : 'Enter a number'
                        }
                        disabled={busy || a.stage === 'feedback'}
                        maxLength={100}
                        aria-describedby="answer-help"
                      />
                      <span id="answer-help" className="muted">
                        {q?.type === 'roots'
                          ? 'Fractions or decimals are fine. Give each distinct root; order doesn’t matter.'
                          : 'Fractions or decimals are fine.'}{' '}
                        Decimals: accurate to 0.001.
                      </span>
                    </label>
                  )}
                  {a.stage === 'question' && q?.hints?.length > 0 && (
                    <div className="teaching-note hint-box">
                      <Lightbulb size={22} />
                      <div>
                        <strong>A nudge from Prism</strong>
                        <p>{q.hints[q.hints.length - 1]}</p>
                      </div>
                    </div>
                  )}
                  {q?.visual && <LearningVisual key={q.id} spec={q.visual} />}
                  {a.stage === 'feedback' ? (
                    <output
                      className={`feedback ${feedback.correct ? 'success' : 'support'}`}
                      aria-live="polite"
                    >
                      <div className="feedback-title">
                        {feedback.correct ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Lightbulb size={24} />
                        )}
                        <h2>{feedback.heading}</h2>
                        {feedback.xp > 0 && (
                          <Badge tone="orange">+{feedback.xp} XP</Badge>
                        )}
                      </div>
                      <p>{feedback.message}</p>
                      {feedback.milestoneCompleted && (
                        <div className="milestone-celebration">
                          <CheckCircle2 size={22} />
                          <div>
                            <strong>Milestone completed!</strong>
                            <span>
                              {a.targetInfo.title} now has a check on your Path.
                            </span>
                          </div>
                        </div>
                      )}
                      {feedback.correct && !support && (
                        <MilestoneProgress
                          progress={data.progress[a.target]}
                          bands={data.bands}
                        />
                      )}
                      <Primary
                        type="button"
                        disabled={busy}
                        onClick={() => send('continue')}
                      >
                        {busy
                          ? 'Saving…'
                          : feedback.next === 'next' && a.returnTransfer
                            ? 'Try a fresh question'
                            : feedback.next === 'next' && a.done >= a.goal
                              ? 'See my progress'
                              : buttonLabels[feedback.next]}
                        <ArrowRight size={20} />
                      </Primary>
                    </output>
                  ) : (
                    <div className="action-tray">
                      <Button
                        type="button"
                        variant="ghost"
                        className="hint-button"
                        disabled={busy || q?.hints?.length >= 2}
                        onClick={() => send('hint')}
                      >
                        <Lightbulb size={20} />
                        {q?.hints?.length ? 'Another hint' : 'A little help'}
                      </Button>
                      <Primary type="submit" disabled={busy || !answer.trim()}>
                        {busy ? 'Checking…' : 'Check answer'}
                        <Check size={20} />
                      </Primary>
                    </div>
                  )}
                </form>
              </>
            )}
          </section>
          <aside className="lesson-aside">
            <div className="aside-icon">
              <Target size={24} />
            </div>
            <h3>
              {support
                ? 'A small detour. Same destination.'
                : 'You’re building something.'}
            </h3>
            <p>
              {support
                ? 'A missing building block is just another thing to learn. Take your time with this one.'
                : a.targetInfo.tagline}
            </p>
            <div className="aside-divider" />
            <span className="eyebrow">YOUR SESSION</span>
            <p className="session-target">{a.targetInfo.title}</p>
            <p className="muted">
              Six questions, with room to learn in between.
            </p>
            <details className="why-details">
              <summary>Why this activity?</summary>
              <p>
                {support
                  ? 'We don’t yet have recent independent evidence for this building block, or a check showed it needs attention.'
                  : a.role === 'retry'
                    ? 'You’re returning to your original question after some help. This retry isn’t treated as independent mastery.'
                    : a.role === 'transfer'
                      ? 'This checks whether you can use what you just learned on another question.'
                      : a.role === 'review'
                        ? 'You previously showed independent success here. A delayed refresh helps check what stayed with you.'
                        : 'Your recent answers on this Skill guide the question band. Using a hint helps you learn without overstating independent success.'}
              </p>
            </details>
            <div className="source-note">
              <BookOpen size={16} />
              <span>
                {a.skillInfo.source.origin === 'supplementary-authored'
                  ? 'Supplementary foundation lesson'
                  : 'Based on NCERT Chapter 4'}
                <br />
                Reference: printed p. {a.skillInfo.source.printedPage}
              </span>
            </div>
          </aside>
        </div>
      </>,
    );
  }
  if (screen === 'path')
    return frame(
      <>
        <div className="page-heading">
          <span className="eyebrow">CHAPTER 04 · QUADRATIC EQUATIONS</span>
          <h1>Your path. Your pace.</h1>
          <p>
            Follow the next suggestion, or explore a milestone that interests
            you.
          </p>
        </div>
        <div className="path-layout">
          <section className="learning-path" aria-label="Chapter milestones">
            {data.skills.map((s, i) => (
              <article
                key={s.id}
                className={`path-stop ${s.id === data.recommended ? 'recommended' : ''} ${s.progress.completed ? 'done' : ''}`}
              >
                <div className="path-node">
                  {s.progress.completed ? (
                    <Check size={26} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </div>
                <div className="path-card">
                  <div className="path-title">
                    <span className="eyebrow">MILESTONE {i + 1}</span>
                    {s.id === data.recommended && (
                      <Badge>
                        {data.reviewDue ? 'Refresh due' : 'Try this next'}
                      </Badge>
                    )}
                  </div>
                  <h2>{s.title}</h2>
                  <p>{s.tagline}</p>
                  <MilestoneProgress progress={s.progress} bands={data.bands} />
                  <Button
                    className={
                      s.id === data.recommended ? 'primary' : 'secondary'
                    }
                    variant={s.id === data.recommended ? 'default' : 'outline'}
                    disabled={busy}
                    onClick={() => start(s.id)}
                  >
                    {resume && a.target === s.id
                      ? 'Continue'
                      : s.progress.completed
                        ? 'Practise again'
                        : 'Explore'}
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </article>
            ))}
          </section>
          <aside className="path-aside">
            <div className="teaching-note">
              <Lightbulb size={24} />
              <div>
                <h3>No locked doors.</h3>
                <p>
                  Every milestone is open. If something feels unfamiliar, we’ll
                  help with the building block you need.
                </p>
              </div>
            </div>
            <div className="chapter-progress">
              <span className="eyebrow">YOUR CHAPTER</span>
              <strong>
                {data.skills.filter((s) => s.progress.completed).length}{' '}
                <span>/ 6</span>
              </strong>
              <p>milestones completed</p>
              <Progress
                value={
                  (data.skills.filter((s) => s.progress.completed).length / 6) *
                  100
                }
                aria-label="Milestones completed"
              />
            </div>
          </aside>
        </div>
      </>,
    );
  if (screen === 'me')
    return frame(
      <>
        <div className="page-heading">
          <span className="eyebrow">YOUR LEARNING JOURNAL</span>
          <h1>A little more confident, {data.user.name}.</h1>
          <p>Look at what you’ve been working on.</p>
        </div>
        <section className="stats-row">
          <div>
            <Star />
            <strong>{data.xp}</strong>
            <span>XP earned</span>
          </div>
          <div>
            <Target />
            <strong>{data.totalAttempts}</strong>
            <span>answers checked</span>
          </div>
          <div>
            <CheckCircle2 />
            <strong>{data.sessionsCompleted}</strong>
            <span>sessions completed</span>
          </div>
        </section>
        <section className="journal-grid">
          <div>
            <h2>Your Skills</h2>
            <div className="skill-list">
              {data.skills.map((s) => (
                <div className="skill-row" key={s.id}>
                  <span
                    className={`skill-status ${s.progress.completed ? 'done' : ''}`}
                  >
                    {s.progress.completed ? (
                      <Check size={18} />
                    ) : (
                      <BookOpen size={18} />
                    )}
                  </span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>
                      {s.progress.attempts
                        ? `${s.progress.independent} independent successes · ${data.bands[s.progress.band]} practice`
                        : 'A new discovery waiting for you'}
                    </p>
                    <MilestoneProgress
                      progress={s.progress}
                      bands={data.bands}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="icon-button"
                    aria-label={`Practise ${s.title}`}
                    onClick={() => start(s.id)}
                    disabled={busy}
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
              ))}
            </div>
            <details className="foundation-details">
              <summary>Your building blocks</summary>
              {data.foundations.map((s) => (
                <div className="foundation-row" key={s.id}>
                  <span>{s.title}</span>
                  <span>
                    {s.progress.readyUntil > data.asOf
                      ? 'Ready to use'
                      : s.progress.attempts
                        ? 'More practice helps'
                        : 'Not checked yet'}
                  </span>
                </div>
              ))}
            </details>
          </div>
          <aside>
            <h2>Recent discoveries</h2>
            {data.recent.length ? (
              <div className="recent-list">
                {data.recent.slice(0, 6).map((r, i) => (
                  <div className="recent-item" key={`${r.at}-${i}`}>
                    {r.correct ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Lightbulb size={20} />
                    )}
                    <div>
                      <strong>
                        {
                          [...data.skills, ...data.foundations].find(
                            (s) => s.id === r.skill,
                          )?.title
                        }
                      </strong>
                      <p>
                        {r.correct
                          ? r.independent
                            ? 'Solved independently'
                            : 'Solved with support'
                          : 'A useful learning attempt'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-note">
                <BookOpen size={28} />
                <p>Your first practice session starts your journal.</p>
              </div>
            )}
            <div className="account-box">
              <strong>{data.user.name}</strong>
              <p>{data.user.email}</p>
              <Secondary
                disabled={busy}
                onClick={async () => {
                  const d = await send('logout');
                  if (d) navigate('play');
                }}
              >
                <LogOut size={18} /> Sign out
              </Secondary>
            </div>
          </aside>
        </section>
      </>,
    );
  return frame(
    <>
      <div className="page-heading play-heading">
        <div>
          <span className="eyebrow">YOUR DAILY DOSE OF DISCOVERY</span>
          <h1>
            {data.totalAttempts ? 'Welcome back' : 'Welcome in'},{' '}
            {data.user.name}.
          </h1>
          <p>Make a little room for an “aha!” moment.</p>
        </div>
        <Badge tone="teal">
          <BookOpen size={16} /> Class 10 · Chapter 4
        </Badge>
      </div>
      <div className="play-grid">
        <section className="next-card">
          <div className="next-card-top">
            <Badge tone="light">
              {resume
                ? 'READY WHEN YOU ARE'
                : data.reviewDue
                  ? 'TIME FOR A REFRESH'
                  : 'YOUR NEXT DISCOVERY'}
            </Badge>
            <span>
              <Clock3 size={16} /> About 8 minutes
            </span>
          </div>
          <h2>{resume ? a.targetInfo.title : current.title}</h2>
          <p>
            {resume
              ? 'Your place is saved. Let’s pick up where you left off.'
              : current.tagline}
          </p>
          <div className="play-equation">
            <MathText
              block
              value={
                (resume ? a.target : current.id) === 'factor'
                  ? 'x^2-5x+6=(x-2)(x-3)'
                  : (resume ? a.target : current.id) === 'formula'
                    ? 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}'
                    : 'ax^2+bx+c=0'
              }
            />
          </div>
          <div className="next-card-bottom">
            <Primary
              disabled={busy}
              onClick={() => (resume ? navigate('learn') : start(current.id))}
            >
              <Play size={20} />
              {resume ? 'Continue learning' : 'Let’s explore'}
              <ArrowRight size={20} />
            </Primary>
            <span>6 questions · help whenever you need it</span>
          </div>
        </section>
        <aside className="daily-note">
          <div className="aside-icon">
            <Lightbulb size={28} />
          </div>
          <span className="eyebrow">A NOTE FROM PRISM</span>
          <h2>You don’t need to know it all to begin.</h2>
          <p>
            If a step feels unfamiliar, we’ll slow down, unpack it, and try
            together.
          </p>
          <div className="note-bottom">
            <span>CURIOUS TODAY.</span>
            <span>MORE CONFIDENT TOMORROW.</span>
          </div>
        </aside>
      </div>
      <section className="journey-preview">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE BIG PICTURE</span>
            <h2>Your quadratic journey</h2>
          </div>
          <a className="text-link" href="#path">
            See my path <ArrowRight size={18} />
          </a>
        </div>
        <div className="journey-strip">
          {data.skills.map((s, i) => (
            <button
              key={s.id}
              className={`journey-step ${s.id === data.recommended ? 'current' : ''} ${s.progress.completed ? 'done' : ''}`}
              onClick={() => start(s.id)}
              disabled={busy}
            >
              <span className="journey-number">
                {s.progress.completed ? <Check size={22} /> : `0${i + 1}`}
              </span>
              <strong>{s.title}</strong>
              <span>
                {statusLabels[s.progress.status] || 'Not started'}
                {s.progress.status !== 'new' && !s.progress.completed && (
                  <>
                    <br />
                    {data.bands[s.progress.band]} ·{' '}
                    {s.progress.checkpoint.correct}/3 correct
                  </>
                )}
                {s.progress.solved > 0 && (
                  <>
                    <br />
                    {s.progress.solved} questions solved
                  </>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
      <div className="saved-note">
        <CheckCircle2 size={17} /> Progress saves automatically. Small steps
        count.
      </div>
    </>,
  );
}
