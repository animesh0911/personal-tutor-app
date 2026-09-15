import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Compass,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Pause,
  RefreshCw,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/lora/latin-400-italic.css';
import {
  FactorPairs,
  HeroGraph,
  MathText,
  Parabola,
  PrismMark,
  Rich,
  Substitution,
} from './visuals.jsx';
import './style.css';

async function api(path, body) {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined
      ? {}
      : { method: 'POST', body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.error || 'Something went wrong. Please try again.',
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
const navigate = (route) => {
  window.location.hash = route;
};
const dateLabel = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
const statusLabel = (status) =>
  ({
    exploring: 'Exploring',
    practising: 'Building confidence',
    'ready-for-review': 'Ready to revisit',
    secure: 'Looking strong',
  })[status] || 'Not explored yet';
function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const listener = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);
  return route;
}
function Brand() {
  return (
    <a href="#/" className="brand">
      <PrismMark />
      <span>
        prism<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
function ErrorNotice({ text, clear }) {
  return text ? (
    <div className="error-notice" role="alert">
      <CircleHelp size={18} />
      <span>{text}</span>
      {clear && (
        <button
          className="icon-button"
          aria-label="Dismiss message"
          onClick={clear}
        >
          <X size={16} />
        </button>
      )}
    </div>
  ) : null;
}
function Busy({ text = 'Prism is thinking through your next step' }) {
  return (
    <output className="thinking">
      <span className="thinking-dots">
        <i />
        <i />
        <i />
      </span>
      <span>{text}</span>
    </output>
  );
}

function Welcome({ onAuth }) {
  const [mode, setMode] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(
        mode === 'login' ? '/login' : '/register',
        mode === 'login' ? fields : { ...fields, grade: 10, board: 'CBSE' },
      );
      await onAuth();
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <Brand />
        <span className="header-note">
          A little more understanding, every day.
        </span>
        <button
          className="secondary-button"
          onClick={() => {
            setMode('login');
            setError('');
          }}
        >
          Sign in <ArrowUpRight size={15} />
        </button>
      </header>
      <main className="welcome-main">
        <div className="welcome-copy">
          <span className="pill">
            <span className="live-dot" /> YOUR PERSONAL LEARNING STUDIO
          </span>
          <h1>
            Less memorising.
            <br />
            More <em>“I get it.”</em>
          </h1>
          <p>
            A tutor that meets you where you are. Explore ideas, work things
            out, and find the explanation that makes it click.
          </p>
          <button
            className="primary-button large-button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Find your starting point <ArrowRight size={19} />
          </button>
          <div className="welcome-proof">
            <span>
              <Check size={15} /> Learn at your own pace
            </span>
            <span>
              <Check size={15} /> Think with interactive visuals
            </span>
          </div>
        </div>
        <HeroGraph />
      </main>
      <section className="welcome-bottom">
        <div>
          <span className="number-chip">01</span>
          <h3>Start where you are</h3>
          <p>A little exploration helps Prism understand what you know.</p>
        </div>
        <div>
          <span className="number-chip">02</span>
          <h3>Make ideas tangible</h3>
          <p>Move a point. Try a pair. See the mathematics come to life.</p>
        </div>
        <div>
          <span className="number-chip">03</span>
          <h3>Build your own understanding</h3>
          <p>Thoughtful practice and a path that grows with you.</p>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>MADE FOR CURIOUS MINDS</span>
        <span>Starting with Class 10 · Mathematics</span>
      </footer>
      {mode && (
        <div className="modal-backdrop">
          <dialog
            ref={(node) => {
              if (node && !node.open) node.showModal();
            }}
            onCancel={() => setMode(null)}
            className="auth-modal"
            aria-labelledby="auth-title"
          >
            <button
              className="modal-close icon-button"
              aria-label="Close sign in"
              onClick={() => setMode(null)}
            >
              <X size={20} />
            </button>
            <PrismMark />
            <span className="eyebrow">YOUR NEXT LITTLE BREAKTHROUGH</span>
            <h2 id="auth-title">
              {mode === 'login' ? 'Welcome back.' : 'Make yourself at home.'}
            </h2>
            <p className="muted">
              {mode === 'login'
                ? 'Your learning path is right where you left it.'
                : 'A few details, then we’ll find a good place to begin.'}
            </p>
            <ErrorNotice text={error} />
            <form onSubmit={submit}>
              {mode !== 'login' && (
                <label>
                  What should we call you?
                  <input
                    name="name"
                    type="text"
                    autoFocus
                    autoComplete="name"
                    maxLength={40}
                    required
                    placeholder="Your first name"
                  />
                </label>
              )}
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoFocus={mode === 'login'}
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  minLength={10}
                  maxLength={200}
                  required
                  placeholder="At least 10 characters"
                />
              </label>
              {mode !== 'login' && (
                <div className="class-picker">
                  <label>
                    Your class
                    <select aria-label="Your class" defaultValue="10">
                      <option value="10">Class 10</option>
                    </select>
                  </label>
                  <label>
                    Curriculum
                    <select aria-label="Your curriculum" defaultValue="CBSE">
                      <option value="CBSE">CBSE · NCERT</option>
                    </select>
                  </label>
                </div>
              )}
              <button className="primary-button full-width" disabled={busy}>
                {busy
                  ? 'Getting things ready…'
                  : mode === 'login'
                    ? 'Return to my studio'
                    : 'Create my studio'}
                <ArrowRight size={17} />
              </button>
            </form>
            <p className="auth-switch">
              {mode === 'login' ? 'New here?' : 'Already have a studio?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
              >
                {mode === 'login' ? 'Get started' : 'Sign in'}
              </button>
            </p>
          </dialog>
        </div>
      )}
    </div>
  );
}

function Sidebar({ user, route, logout, open, close }) {
  return (
    <>
      <button
        className={`sidebar-scrim ${open ? 'open' : ''}`}
        aria-label="Close navigation"
        onClick={close}
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Brand />
        <div className="school-label">
          YOUR STUDIO
          <span>
            Class {user.grade} · {user.board}
          </span>
        </div>
        <nav aria-label="Main navigation">
          <a
            className={route === '/' ? 'selected' : ''}
            href="#/"
            onClick={close}
          >
            <Home size={18} /> My subjects
          </a>
          <a
            className={
              route.startsWith('/study') || route === '/path' ? 'selected' : ''
            }
            href="#/path"
            onClick={close}
          >
            <Compass size={18} /> Learning path
          </a>
          <a
            className={route === '/journal' ? 'selected' : ''}
            href="#/journal"
            onClick={close}
          >
            <BookOpen size={18} /> My journal
          </a>
        </nav>
        <div className="sidebar-note">
          <Sprout size={23} />
          <p>Understanding takes a little exploring.</p>
          <span>You’re in the right place.</span>
        </div>
        <div className="profile-row">
          <span className="avatar">{user.name[0].toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Curious mind</small>
          </div>
          <button
            className="icon-button"
            title="Sign out"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}

function Dashboard({ user, catalog, dashboard, connection, start, busy }) {
  const recent = dashboard.sessions.find((s) => !s.completed),
    mainSkills = catalog[0].skills.filter((s) => !s.foundation);
  const touched = mainSkills.filter((s) => dashboard.skills[s.id]).length;
  return (
    <main className="dashboard">
      <div className="page-heading">
        <span className="eyebrow">A FRESH PERSPECTIVE</span>
        <h1>
          Make room for a little
          <br />
          <em>discovery, {user.name}.</em>
        </h1>
        <p className="muted">
          Choose a subject. We’ll take it one good question at a time.
        </p>
      </div>
      {recent && (
        <div className="resume-banner">
          <div className="resume-icon">
            <Compass size={22} />
          </div>
          <div>
            <span className="eyebrow">PICK UP YOUR THREAD</span>
            <strong>{recent.title}</strong>
            <p>Your working and your next step are saved.</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => navigate(`/study/${recent.id}`)}
          >
            Continue learning <ArrowRight size={16} />
          </button>
        </div>
      )}
      {!connection.ready && (
        <div className="connection-notice">
          <span className="status-dot amber" />
          <span>
            Your studio is ready. Your tutor’s connection still needs to be set
            up.
          </span>
        </div>
      )}
      <div className="section-title">
        <h2>Your subjects</h2>
        <span>CLASS 10 · CBSE</span>
      </div>
      <section className="subject-grid">
        <article className="subject-card">
          <div className="subject-illustration">
            <svg viewBox="0 0 360 155" aria-hidden="true">
              <path d="M25 116H335M180 18V145" stroke="#bbc7b0" />
              <path
                d="M63 20Q180 220 297 20"
                fill="none"
                stroke="#547052"
                strokeWidth="3"
              />
              <circle cx="108" cy="82" r="6" fill="#d6a44b" />
              <circle cx="252" cy="82" r="6" fill="#d6a44b" />
            </svg>
            <span className="subject-symbol">x²</span>
            <span className="chapter-tag">CHAPTER 04</span>
          </div>
          <div className="subject-card-body">
            <div className="subject-card-top">
              <span className="eyebrow">PATTERNS · POSSIBILITIES · PROOFS</span>
              <span className="available-tag">Ready to explore</span>
            </div>
            <h2>Mathematics</h2>
            <p>Quadratic equations</p>
            <div className="subject-progress">
              <div>
                <span
                  style={{ width: `${(touched / mainSkills.length) * 100}%` }}
                />
              </div>
              <small>
                {touched} of {mainSkills.length} ideas explored
              </small>
            </div>
            <button
              className="primary-button full-width"
              disabled={busy || !connection.ready}
              onClick={() => start(null)}
            >
              {busy ? 'Opening your studio…' : 'Explore mathematics'}
              <ArrowRight size={18} />
            </button>
          </div>
        </article>
        <aside className="daily-note">
          <span className="note-star">✳</span>
          <span className="eyebrow">A DIFFERENT KIND OF PRACTICE</span>
          <h2>
            You don’t have to
            <br />
            know it <em>yet.</em>
          </h2>
          <p>
            Try an idea. Ask for another way to see it. Your path will change as
            your understanding grows.
          </p>
          <span className="hand-note">That’s what learning is for.</span>
        </aside>
      </section>
      <div className="section-title">
        <h2>Inside this chapter</h2>
        <span>CHOOSE YOUR OWN START</span>
      </div>
      <section className="chapter-skills">
        {mainSkills.map((skill, i) => (
          <button
            key={skill.id}
            className="skill-tile"
            disabled={busy || !connection.ready}
            onClick={() => start(skill.id)}
          >
            <span className="skill-number">0{i + 1}</span>
            <div>
              <strong>{skill.title}</strong>
              <span>
                {dashboard.skills[skill.id]
                  ? statusLabel(dashboard.skills[skill.id].status)
                  : skill.tagline}
              </span>
            </div>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </section>
      {dashboard.plan && (
        <section className="plan-summary">
          <Sparkles size={20} />
          <div>
            <span className="eyebrow">PRISM’S RECOMMENDATION</span>
            <p>{dashboard.plan.summary}</p>
          </div>
        </section>
      )}
    </main>
  );
}

function Trail({ catalog, dashboard, activity }) {
  const main = catalog[0].skills.filter((s) => !s.foundation),
    title = (id) => catalog[0].skills.find((s) => s.id === id)?.title || id;
  return (
    <aside className="trail">
      <span className="eyebrow">THE BIGGER PICTURE</span>
      <h3>Your learning trail</h3>
      <p className="muted">Small steps. Connected ideas.</p>
      <ol className="trail-list">
        {main.map((s, i) => (
          <li
            key={s.id}
            className={
              activity?.goalSkillId === s.id
                ? 'current'
                : dashboard.skills[s.id]
                  ? 'visited'
                  : ''
            }
          >
            <span className="trail-dot">
              {dashboard.skills[s.id] ? <Check size={12} /> : i + 1}
            </span>
            <div>
              <strong>{s.title}</strong>
              <small>
                {activity?.goalSkillId === s.id
                  ? 'Exploring now'
                  : statusLabel(dashboard.skills[s.id]?.status)}
              </small>
            </div>
          </li>
        ))}
      </ol>
      {activity && activity.skillId !== activity.goalSkillId && (
        <div className="detour">
          <Sprout size={19} />
          <strong>A useful little detour</strong>
          <p>
            {title(activity.skillId)} helps with{' '}
            {title(activity.goalSkillId).toLowerCase()}.
          </p>
        </div>
      )}
      {dashboard.plan && (
        <div className="trail-plan">
          <span className="eyebrow">WHERE WE COULD GO NEXT</span>
          {dashboard.plan.steps.slice(0, 3).map((s) => (
            <div key={s.skillId}>
              <strong>{title(s.skillId)}</strong>
              <p>{s.reason}</p>
            </div>
          ))}
        </div>
      )}
      <a className="text-button" href="#/journal">
        Open my learning journal <ArrowUpRight size={15} />
      </a>
    </aside>
  );
}

const draftKey = (s) => `prism-draft:${s.id}:${s.activity?.id}`;
function Study({ id, catalog, dashboard, refreshDashboard }) {
  const [session, setSession] = useState(null),
    [error, setError] = useState(''),
    [connected, setConnected] = useState(true),
    [submitting, setSubmitting] = useState(false),
    [text, setText] = useState('');
  const sessionRef = useRef(null),
    inputRef = useRef(null),
    pendingAction = useRef(null);
  const receive = useCallback(
    (next) => {
      const old = sessionRef.current;
      if (!old || old.activity?.id !== next.activity?.id) {
        let draft = '';
        try {
          draft = sessionStorage.getItem(draftKey(next)) || '';
        } catch {}
        setText(draft || next.working || '');
      }
      sessionRef.current = next;
      setSession(next);
      if (old?.status === 'running' && next.status !== 'running')
        void refreshDashboard();
    },
    [refreshDashboard],
  );
  useEffect(() => {
    let disposed = false;
    const load = () =>
      api(`/sessions/${id}`)
        .then((s) => {
          if (!disposed) receive(s);
        })
        .catch((e) => {
          if (!disposed) setError(e.message);
        });
    void load();
    const events = new EventSource(`/api/sessions/${id}/events`);
    events.addEventListener('snapshot', (event) => {
      if (!disposed) {
        setConnected(true);
        receive(JSON.parse(event.data));
      }
    });
    events.onopen = () => setConnected(true);
    events.onerror = () => setConnected(false);
    const poll = setInterval(load, 10000);
    return () => {
      disposed = true;
      events.close();
      clearInterval(poll);
    };
  }, [id, receive]);
  function draft(value) {
    setText(value);
    if (session)
      try {
        sessionStorage.setItem(draftKey(session), value);
      } catch {}
  }
  async function act(kind, value = '') {
    if (!session?.activity || submitting) return;
    setError('');
    setSubmitting(true);
    const fingerprint = `${session.activity.id}:${kind}:${value}`;
    if (pendingAction.current?.fingerprint !== fingerprint)
      pendingAction.current = { fingerprint, id: crypto.randomUUID() };
    try {
      const next = await api(`/sessions/${id}/actions`, {
        kind,
        text: value,
        actionId: pendingAction.current.id,
        activityId: session.activity.id,
        revision: session.revision,
      });
      pendingAction.current = null;
      receive(next);
    } catch (e) {
      setError(e.message);
      if (e.status === 409) {
        pendingAction.current = null;
        receive(await api(`/sessions/${id}`));
      }
    } finally {
      setSubmitting(false);
    }
  }
  async function sessionCommand(command) {
    setError('');
    setSubmitting(true);
    try {
      receive(await api(`/sessions/${id}/${command}`, {}));
      await refreshDashboard();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }
  if (!session)
    return (
      <main className="study-loading">
        <ErrorNotice text={error} />
        {!error && <Busy text="Opening your saved workspace" />}
        <a className="text-button" href="#/">
          Back to my subjects
        </a>
      </main>
    );
  const active = session.activity,
    busy = session.status === 'running' || submitting,
    blocked =
      busy ||
      session.completed ||
      ['error', 'interrupted'].includes(session.status);
  return (
    <div className="study-layout">
      <main className="study-main">
        <div className="study-topline">
          <a href="#/">Mathematics</a>
          <ChevronRight size={14} />
          <span>Quadratic equations</span>
          <button
            className="text-button finish-button"
            disabled={submitting}
            onClick={() => sessionCommand('finish')}
          >
            {session.completed ? 'Session saved' : 'Finish session'}
            <CheckCircle2 size={15} />
          </button>
        </div>
        {!connected && (
          <div className="connection-notice" aria-live="polite">
            Reconnecting… Your work stays here.
          </div>
        )}
        <ErrorNotice text={error} clear={() => setError('')} />
        {session.completed ? (
          <section className="completion-card">
            <div className="completion-icon">
              <Sprout size={36} />
            </div>
            <span className="eyebrow">A LITTLE FURTHER THAN BEFORE</span>
            <h1>
              Good work
              <br />
              <em>thinking it through.</em>
            </h1>
            <p>
              Your working and learning observations are saved. Come back for a
              fresh question when you’re ready.
            </p>
            <div className="completion-actions">
              <a href="#/" className="primary-button">
                Back to my subjects <ArrowRight size={17} />
              </a>
              <a href="#/journal" className="secondary-button">
                See my journal
              </a>
            </div>
          </section>
        ) : (
          <>
            {active && (
              <>
                <div className="activity-heading">
                  <div className="activity-meta">
                    <span className="pill">
                      {active.mode.replace('-', ' ').toUpperCase()}
                    </span>
                    <span>ONE IDEA AT A TIME</span>
                  </div>
                  <h1>{active.title}</h1>
                  <p>
                    <Rich text={active.prompt} />
                  </p>
                </div>
                {session.problem && (
                  <div className="problem-card">
                    <span className="eyebrow">YOUR QUESTION</span>
                    <p>
                      <Rich text={session.problem.prompt} />
                    </p>
                    <MathText value={session.problem.math} block />
                    {session.problem.source?.printedPage && (
                      <small>
                        NCERT-aligned · p. {session.problem.source.printedPage}
                      </small>
                    )}
                    {session.problem.origin === 'generated' && (
                      <small>A fresh question for this learning session</small>
                    )}
                  </div>
                )}
                <div className="activity-components">
                  {[
                    ...(session.topicVisual ? [session.topicVisual] : []),
                    ...active.components,
                  ]
                    .filter((c) => c.kind !== 'equation')
                    .map((c, i) =>
                      c.kind === 'substitution' ? (
                        <Substitution
                          key={`${active.id}:${i}`}
                          component={c}
                          onExplore={(v) => act('exploration', v)}
                          disabled={blocked}
                        />
                      ) : c.kind === 'factor-pairs' ? (
                        <FactorPairs
                          key={`${active.id}:${i}`}
                          component={c}
                          onExplore={(v) => act('exploration', v)}
                          disabled={blocked}
                        />
                      ) : c.kind === 'parabola' ? (
                        <Parabola
                          key={`${active.id}:${i}`}
                          component={c}
                          onExplore={(v) => act('exploration', v)}
                          disabled={blocked}
                        />
                      ) : (
                        <section
                          className="explanation-card"
                          key={`${active.id}:${i}`}
                        >
                          <Lightbulb size={20} />
                          <div>
                            <h3>{c.title}</h3>
                            <p>
                              <Rich text={c.body} />
                            </p>
                          </div>
                        </section>
                      ),
                    )}
                </div>
                <form
                  className="working-card"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void act('submit', text);
                  }}
                >
                  <div className="working-heading">
                    <label htmlFor="working">
                      {active.components.find((c) => c.kind === 'equation')
                        ?.title || 'What do you notice?'}
                    </label>
                    <span>YOUR THINKING MATTERS</span>
                  </div>
                  {session.problem?.choices && (
                    <div className="choice-grid">
                      {session.problem.choices.map((choice, i) => {
                        const label =
                          typeof choice === 'string'
                            ? choice
                            : (choice.label ?? String(choice.value));
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={blocked}
                            className={
                              text === label ? 'choice selected' : 'choice'
                            }
                            onClick={() => draft(label)}
                          >
                            <Rich text={label} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <textarea
                    id="working"
                    ref={inputRef}
                    value={text}
                    onChange={(e) => draft(e.target.value)}
                    placeholder="Try a step, explain your thinking, or tell Prism where you’re stuck…"
                    maxLength={3000}
                    rows={3}
                    disabled={session.completed}
                    aria-describedby="working-help"
                  />
                  <div className="math-shortcuts">
                    {['x²', '√', '−', '='].map((symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        title={`Insert ${symbol}`}
                        onClick={() => {
                          const field = inputRef.current,
                            start = field.selectionStart,
                            end = field.selectionEnd;
                          draft(
                            text.slice(0, start) + symbol + text.slice(end),
                          );
                          field.focus();
                        }}
                      >
                        {symbol}
                      </button>
                    ))}
                    <span id="working-help">
                      Equations or words. Both are welcome.
                    </span>
                  </div>
                  <div className="working-actions">
                    <button
                      type="button"
                      className="text-button"
                      disabled={blocked}
                      onClick={() => act('hint')}
                    >
                      <Lightbulb size={16} /> A small hint
                    </button>
                    <button
                      className="primary-button"
                      disabled={blocked || !text.trim()}
                    >
                      Check my step <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
                {session.feedback && (
                  <section
                    className={`feedback-card ${session.feedback.tone}`}
                    aria-live="polite"
                  >
                    <div className="feedback-avatar">
                      <PrismMark />
                    </div>
                    <div>
                      <span className="eyebrow">PRISM</span>
                      <p>
                        <Rich text={session.feedback.text} />
                      </p>
                      {session.feedback.nextAction !== 'try-again' && (
                        <button
                          className="text-button"
                          disabled={blocked}
                          onClick={() => act(session.feedback.nextAction)}
                        >
                          {session.feedback.nextAction === 'new-question'
                            ? 'Try a fresh question'
                            : 'Take the next step'}
                          <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  </section>
                )}
                <div className="lesson-options">
                  <button
                    className="text-button"
                    disabled={blocked}
                    onClick={() => act('explain-differently')}
                  >
                    <RefreshCw size={15} /> Show me another way
                  </button>
                  <button
                    className="text-button"
                    disabled={blocked}
                    onClick={() => act('new-question')}
                  >
                    <Sparkles size={15} /> Give me a fresh question
                  </button>
                </div>
              </>
            )}
            {busy && (
              <div className="busy-row">
                <Busy
                  text={
                    active
                      ? 'Prism is working with your thinking'
                      : 'Finding a good place to begin'
                  }
                />
                <button
                  className="icon-button"
                  title="Pause tutor"
                  aria-label="Pause tutor"
                  onClick={() => sessionCommand('pause')}
                >
                  <Pause size={16} />
                </button>
              </div>
            )}
            {['error', 'interrupted'].includes(session.status) && (
              <div className="recovery-card" aria-live="polite">
                <CircleHelp size={22} />
                <div>
                  <strong>We kept your place.</strong>
                  <p>{session.error}</p>
                  <button
                    className="secondary-button"
                    disabled={submitting}
                    onClick={() => sessionCommand('retry')}
                  >
                    Resume with Prism <RefreshCw size={15} />
                  </button>
                </div>
              </div>
            )}
            {!active && busy && (
              <div className="activity-skeleton" aria-hidden="true">
                <span />
                <span />
                <div />
                <span />
              </div>
            )}
            <p className="workspace-footnote">
              <Sprout size={14} /> An idea explored is a step forward.
            </p>
          </>
        )}
      </main>
      <Trail catalog={catalog} dashboard={dashboard} activity={active} />
    </div>
  );
}

function LearningPath({ dashboard, catalog, start, busy, connection }) {
  const all = catalog[0].skills,
    title = (id) => all.find((s) => s.id === id)?.title || id;
  return (
    <main className="journal-page">
      <div className="page-heading">
        <span className="eyebrow">EVERY IDEA CONNECTS TO ANOTHER</span>
        <h1>
          A path through
          <br />
          <em>the possibilities.</em>
        </h1>
        <p className="muted">
          Start anywhere. Prism can help with useful foundations along the way.
        </p>
      </div>
      {dashboard.plan && (
        <section className="plan-summary">
          <Compass size={21} />
          <div>
            <span className="eyebrow">YOUR CURRENT RECOMMENDATION</span>
            <p>{dashboard.plan.summary}</p>
          </div>
        </section>
      )}
      <div className="path-map">
        {all
          .filter((s) => !s.foundation)
          .map((s, i) => (
            <article
              key={s.id}
              className={`path-node ${dashboard.skills[s.id] ? 'explored' : ''}`}
            >
              <span className="path-index">0{i + 1}</span>
              <div className="path-node-content">
                <span className="observation-tag">
                  {statusLabel(dashboard.skills[s.id]?.status)}
                </span>
                <h2>{s.title}</h2>
                <p>{s.tagline}</p>
                {s.prerequisites.length > 0 && (
                  <div className="prerequisite-chips">
                    <span>BUILDS ON</span>
                    {s.prerequisites.map((p) => (
                      <button
                        key={p}
                        disabled={busy || !connection.ready}
                        onClick={() => start(p)}
                      >
                        {title(p)}
                        <ArrowUpRight size={11} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="secondary-button"
                disabled={busy || !connection.ready}
                onClick={() => start(s.id)}
              >
                Explore <ArrowRight size={15} />
              </button>
            </article>
          ))}
      </div>
      <p className="path-note">
        This map follows the chapter’s connected skills. Observations describe
        your recent working, not a permanent measure of ability.
      </p>
    </main>
  );
}

function Journal({ dashboard, catalog }) {
  const title = (id) => catalog[0].skills.find((s) => s.id === id)?.title || id;
  return (
    <main className="journal-page">
      <div className="page-heading">
        <span className="eyebrow">THE THINGS YOU’RE FIGURING OUT</span>
        <h1>
          Your understanding,
          <br />
          <em>taking shape.</em>
        </h1>
        <p className="muted">
          Observations from your actual working. Always open to a fresh
          perspective.
        </p>
      </div>
      <div className="journal-stats">
        <div>
          <strong>{dashboard.attempts}</strong>
          <span>steps submitted</span>
        </div>
        <div>
          <strong>
            {Object.values(dashboard.skills).filter(Boolean).length}
          </strong>
          <span>ideas explored</span>
        </div>
        <div>
          <strong>
            {dashboard.sessions.filter((s) => s.completed).length}
          </strong>
          <span>sessions wrapped up</span>
        </div>
      </div>
      {dashboard.observations.length ? (
        <section className="journal-entries">
          {dashboard.observations.map((o) => (
            <article key={o.id} className="journal-entry">
              <span className="journal-date">{dateLabel(o.at)}</span>
              <div>
                <span className="observation-tag">{statusLabel(o.status)}</span>
                <h3>{title(o.skillId)}</h3>
                <p>
                  <Rich text={o.note} />
                </p>
                <div className="journal-entry-footer">
                  <span>
                    {o.confidence === 'tentative'
                      ? 'An early observation'
                      : 'Based on your working'}
                  </span>
                  <span>Revisit {dateLabel(o.reviewAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-journal">
          <BookOpen size={34} />
          <h2>Your story starts with a question.</h2>
          <p>
            As you work with Prism, your ideas, progress and useful next steps
            will appear here.
          </p>
          <a href="#/" className="primary-button">
            Explore mathematics <ArrowRight size={16} />
          </a>
        </section>
      )}
    </main>
  );
}

function App() {
  const route = useRoute(),
    [data, setData] = useState(null),
    [error, setError] = useState(''),
    [starting, setStarting] = useState(false),
    [sidebarOpen, setSidebarOpen] = useState(false);
  const refresh = useCallback(async () => {
    const next = await api('/bootstrap');
    setData(next);
  }, []);
  const refreshDashboard = useCallback(async () => {
    try {
      const dashboard = await api('/dashboard');
      setData((d) => ({ ...d, dashboard }));
    } catch (e) {
      if (e.status === 401) {
        await refresh();
        navigate('/');
      }
    }
  }, [refresh]);
  useEffect(() => {
    api('/bootstrap')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  const signedIn = !!data?.user;
  useEffect(() => {
    if (signedIn)
      api('/dashboard')
        .then((dashboard) => setData((d) => ({ ...d, dashboard })))
        .catch(() => {});
  }, [route, signedIn]);
  async function start(skillId) {
    setStarting(true);
    setError('');
    try {
      const s = await api('/sessions', {
        requestId: crypto.randomUUID(),
        subject: 'mathematics',
        skillId,
      });
      navigate(`/study/${s.id}`);
      await refreshDashboard();
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  }
  async function logout() {
    await api('/logout', {});
    try {
      sessionStorage.clear();
    } catch {}
    navigate('/');
    await refresh();
  }
  if (!data)
    return (
      <div className="app-loading">
        <Brand />
        {error ? (
          <>
            <ErrorNotice text={error} />
            <button
              className="secondary-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </>
        ) : (
          <Busy text="Opening your studio" />
        )}
      </div>
    );
  if (!data.user) return <Welcome onAuth={refresh} />;
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content').focus();
        }}
      >
        Skip to content
      </a>
      <Sidebar
        user={data.user}
        route={route}
        logout={logout}
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
      />
      <div className="app-content" id="main-content" tabIndex={-1}>
        <header className="app-topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <span className="topbar-breadcrumb">
            MY STUDIO <ChevronRight size={12} />{' '}
            {route === '/journal'
              ? 'LEARNING JOURNAL'
              : route.startsWith('/study')
                ? 'MATHEMATICS'
                : 'SUBJECTS'}
          </span>
          <span className="tutor-status">
            <span
              className={`status-dot ${data.connection.ready ? '' : 'amber'}`}
            />
            {data.connection.ready
              ? 'Prism is here for you'
              : 'Tutor connection pending'}
          </span>
        </header>
        <div className="global-error">
          <ErrorNotice text={error} clear={() => setError('')} />
        </div>
        {route.startsWith('/study/') ? (
          <Study
            key={route}
            id={route.split('/')[2]}
            catalog={data.catalog}
            dashboard={data.dashboard}
            refreshDashboard={refreshDashboard}
          />
        ) : route === '/path' ? (
          <LearningPath {...data} start={start} busy={starting} />
        ) : route === '/journal' ? (
          <Journal dashboard={data.dashboard} catalog={data.catalog} />
        ) : (
          <Dashboard {...data} start={start} busy={starting} />
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
