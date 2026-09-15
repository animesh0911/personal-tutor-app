(() => {
  const app = document.querySelector("#app");
  const query = new URLSearchParams(window.location.search);
  const screen = query.get("screen") || "play";

  const screens = [
    ["welcome", "Welcome"],
    ["auth", "Sign in"],
    ["setup", "Learner setup"],
    ["play", "Play Home"],
    ["path", "Path"],
    ["chapter", "Chapter"],
    ["quest", "Daily Quest"],
    ["repair", "Repair"],
    ["boss", "Boss Problem"],
    ["upload", "Photo working"],
    ["complete", "Quest Complete"],
    ["me", "Me"],
    ["settings", "Settings"],
  ];

  const href = (nextScreen, extras = {}) => {
    const params = new URLSearchParams({ screen: nextScreen, ...extras });
    return `?${params.toString()}`;
  };

  const icon = (name, className = "") => `<svg class="ui-icon ${className}" aria-hidden="true"><use href="../icons.svg#${name}"></use></svg>`;
  const prism = (pose, className, label) => `<div class="prism ${className}" data-prism="${pose}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}></div>`;

  const brand = () => `<a class="brand" href="${href("play")}" aria-label="Curious Workshop home"><span class="brand-mark" aria-hidden="true">C</span><span>Curious Workshop</span></a>`;

  const stats = () => `<div class="stat-pills" aria-label="Learning progress">
    <span class="stat-pill stat-pill--streak">${icon("flame")}<strong>7</strong><small>day streak</small></span>
    <span class="stat-pill">${icon("bolt")}<strong>340</strong><small>XP</small></span>
    <a class="profile-avatar" href="${href("me")}" aria-label="Open Maya's profile">M</a>
  </div>`;

  const appHeader = (active = "play") => `<header class="app-header">
    ${brand()}
    <nav class="top-nav" aria-label="Primary navigation">
      <a class="${active === "play" ? "is-active" : ""}" href="${href("play")}" ${active === "play" ? 'aria-current="page"' : ""}>Play</a>
      <a class="${active === "path" ? "is-active" : ""}" href="${href("path")}" ${active === "path" ? 'aria-current="page"' : ""}>Path</a>
      <a class="${active === "me" ? "is-active" : ""}" href="${href("me")}" ${active === "me" ? 'aria-current="page"' : ""}>Me</a>
    </nav>
    ${stats()}
  </header>`;

  const questHeader = (label, progress, backScreen = "play") => `<header class="quest-header">
    <a class="icon-action" href="${href(backScreen)}" aria-label="Exit ${label}">×</a>
    <div class="quest-progress"><span><strong>${label}</strong><small>Problem ${progress} of 6</small></span><div class="progress-track" role="progressbar" aria-label="Quest progress" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${progress}"><i style="width:${progress / 6 * 100}%"></i></div></div>
    <button class="quiet-action" type="button">Read aloud</button>
  </header>`;

  const designNavigator = () => `<details class="design-nav">
    <summary>Web screens</summary>
    <nav aria-label="Design mockup screens">${screens.map(([key, label]) => `<a class="${screen === key ? "is-current" : ""}" href="${href(key)}">${label}</a>`).join("")}</nav>
  </details>`;

  const play = () => `${appHeader("play")}
    <main id="main-content" class="page-shell play-layout">
      <section class="journey-board" aria-labelledby="play-title">
        <div class="board-heading"><div><span class="eyebrow">Today’s workshop</span><h1 id="play-title">Follow Prism to today’s quest</h1><p>A short route through Equivalent Fractions, made for your current pace.</p></div><span class="time-chip">About 10 min</span></div>
        <div class="daily-map" aria-label="Today's Daily Quest route">
          <svg class="route-line" viewBox="0 0 820 330" preserveAspectRatio="none" aria-hidden="true"><path d="M35 255 C140 330 190 120 310 182 S480 315 570 170 S708 63 790 112"/></svg>
          <div class="map-node is-complete" style="--x:9%;--y:74%"><span>1</span><small>Warm-up</small></div>
          <div class="map-node is-current" style="--x:36%;--y:48%">${prism("leading", "prism-traveler", "")}<span>2</span><small>Start here</small></div>
          <div class="map-node" style="--x:57%;--y:70%"><span>3</span><small>Build</small></div>
          <div class="map-node" style="--x:77%;--y:33%"><span>4</span><small>Power-up</small></div>
          <div class="map-finish" style="--x:92%;--y:20%" aria-hidden="true"><span></span><strong>Finish</strong></div>
          <div class="map-callout"><span class="quest-label"><i aria-hidden="true"></i>Daily Quest</span><h2>Equivalent Fractions</h2><p>6 Problems · Worth 120 XP</p><a class="primary-action" href="${href("quest", { state: "initial" })}">Start quest <span aria-hidden="true">→</span></a></div>
        </div>
      </section>
      <aside class="side-stack" aria-label="Prism and weekly progress">
        <section class="guide-panel">${prism("ready", "prism-large", "Prism welcomes Maya")}<div><span class="eyebrow">Prism says</span><h2>Hi, Maya</h2><p>Today we’ll turn the same amount into different-looking fractions.</p></div></section>
        <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Weekly goal</span><h2>Three down, two to go</h2></div><span class="count-chip">3/5</span></div><div class="week-track" aria-label="3 of 5 weekly quests complete"><span class="is-done"></span><span class="is-done"></span><span class="is-done"></span><span></span><span></span></div></section>
        <a class="chapter-link" href="${href("chapter")}"><span><small>Your Chapter</small><strong>Fractions · 60%</strong></span><span aria-hidden="true">→</span></a>
      </aside>
    </main>`;

  const path = () => `${appHeader("path")}
    <main id="main-content" class="page-shell path-layout">
      <section class="world-map" aria-labelledby="path-title">
        <div class="board-heading"><div><span class="eyebrow">Your Path</span><h1 id="path-title">Fractions Workshop</h1><p>Every published Skill is open. Prism highlights the best next stop.</p></div><button class="chapter-picker" type="button">Chapter 1 <span aria-hidden="true">⌄</span></button></div>
        <div class="path-canvas">
          <svg class="path-route" viewBox="0 0 880 620" preserveAspectRatio="none" aria-hidden="true"><path d="M120 555 C160 430 350 520 350 370 S185 250 340 160 S600 105 760 65"/></svg>
          <a class="skill-stop is-mastered" style="--x:13%;--y:85%" href="${href("quest")}"><span>✓</span><strong>Unit fractions</strong><small>Mastered</small></a>
          <a class="skill-stop is-recommended" style="--x:38%;--y:59%" href="${href("quest")}">${prism("leading", "prism-path", "")}<span>▶</span><strong>Equivalent fractions</strong><small>Recommended</small></a>
          <a class="skill-stop" style="--x:25%;--y:31%" href="${href("quest")}"><span>3</span><strong>Compare fractions</strong><small>Available</small></a>
          <a class="skill-stop" style="--x:57%;--y:20%" href="${href("quest")}"><span>4</span><strong>Add fractions</strong><small>Available</small></a>
          <a class="skill-stop is-boss" style="--x:84%;--y:9%" href="${href("boss")}"><span>★</span><strong>Fraction Forge</strong><small>Boss Problem</small></a>
          <div class="map-scenery map-scenery--one" aria-hidden="true"></div><div class="map-scenery map-scenery--two" aria-hidden="true"></div>
        </div>
      </section>
      <aside class="side-stack"><section class="guide-panel guide-panel--compact">${prism("leading", "prism-medium", "Prism points to Equivalent Fractions")}<div><span class="eyebrow">Try this next</span><h2>Equivalent Fractions</h2><p>You’re ready to practise showing the same amount in different ways.</p><a class="primary-action" href="${href("quest")}">Play this Skill <span aria-hidden="true">→</span></a></div></section><section class="panel"><span class="eyebrow">Chapter progress</span><h2>4 of 7 Skills strengthened</h2><div class="progress-track progress-track--large"><i style="width:57%"></i></div><a class="text-action" href="${href("chapter")}">View Chapter details →</a></section></aside>
    </main>`;

  const chapter = () => `${appHeader("path")}
    <main id="main-content" class="page-shell chapter-layout">
      <section class="chapter-main"><a class="back-link" href="${href("path")}">← Back to Path</a><div class="chapter-hero"><div><span class="eyebrow">Chapter 1</span><h1>Fractions</h1><p>Build, compare and use fractions through short visual Problems.</p><div class="progress-track progress-track--large"><i style="width:60%"></i></div><small>60% complete</small></div><div class="chapter-art" aria-hidden="true"><span style="--fill:50%"></span><span style="--fill:75%"></span><span style="--fill:33%"></span></div></div>
        <section class="recommended-card">${prism("leading", "prism-medium", "Prism recommends Equivalent Fractions")}<div><span class="quest-label"><i aria-hidden="true"></i>Recommended next</span><h2>Equivalent Fractions</h2><p>See why two fractions can represent the same amount.</p><span class="skill-meta">About 8 minutes · 6 Problems</span></div><a class="primary-action" href="${href("quest")}">Play <span aria-hidden="true">→</span></a></section>
        <div class="section-heading"><h2>All Skills</h2><span>Everything is playable</span></div><div class="skill-grid"><a class="skill-card is-mastered" href="${href("quest")}"><span class="skill-number">✓</span><div><strong>Unit fractions</strong><small>Mastered</small></div></a><a class="skill-card is-practising" href="${href("quest")}"><span class="skill-number">2</span><div><strong>Equivalent fractions</strong><small>Practising</small></div></a><a class="skill-card" href="${href("quest")}"><span class="skill-number">3</span><div><strong>Compare fractions</strong><small>Available</small></div></a><a class="skill-card" href="${href("quest")}"><span class="skill-number">4</span><div><strong>Add fractions</strong><small>Available</small></div></a><a class="skill-card" href="${href("quest")}"><span class="skill-number">5</span><div><strong>Fractions of quantities</strong><small>Available</small></div></a><a class="skill-card is-boss" href="${href("boss")}"><span class="skill-number">★</span><div><strong>The Fraction Forge</strong><small>Boss Problem · Available</small></div></a></div>
      </section>
      <aside class="side-stack"><section class="panel"><span class="eyebrow">This week</span><h2>You strengthened two Skills</h2><p>Equivalent fractions is the best next step based on your recent Attempts.</p></section><section class="panel source-note"><span class="eyebrow">What you’ll practise</span><ul><li>Represent fractions visually</li><li>Find equivalent fractions</li><li>Compare and combine fractions</li></ul></section></aside>
    </main>`;

  const quest = () => {
    const state = query.get("state") || "initial";
    const selected = query.get("answer") || (state === "correct" ? "two-fourths" : state === "incorrect" ? "one-third" : "");
    const feedback = state === "correct" ? `<div class="feedback feedback--correct" role="status"><div><strong>That’s it!</strong><span>Two fourths covers the same amount as one half.</span></div><a class="primary-action primary-action--success" href="${href("quest", { state: "initial", problem: "2" })}">Continue <span aria-hidden="true">→</span></a></div>` : state === "incorrect" ? `<div class="feedback feedback--incorrect" role="status">${prism("support", "prism-feedback", "Prism is ready to help")}<div><strong>Not quite—let’s look at the parts.</strong><span>We’ll use one quick visual to see what changed.</span></div><a class="primary-action" href="${href("repair", { step: "diagnostic" })}">Show me <span aria-hidden="true">→</span></a></div>` : `<div class="quest-action"><span>${selected ? "Answer selected" : "Choose one answer to continue"}</span><button class="primary-action" type="button" data-check-answer ${selected ? "" : "disabled"}>Check answer</button></div>`;
    const option = (id, label, fraction) => `<button class="answer-option ${selected === id ? "is-selected" : ""} ${state === "correct" && id === "two-fourths" ? "is-correct" : ""} ${state === "incorrect" && id === selected ? "is-incorrect" : ""}" type="button" role="radio" aria-checked="${selected === id}" data-answer="${id}"><span class="fraction"><span>${fraction.split("/")[0]}</span><i></i><span>${fraction.split("/")[1]}</span></span><small>${label}</small></button>`;
    return `${questHeader("Daily Quest", query.get("problem") || 1)}<main id="main-content" class="quest-shell"><section class="problem-stage"><div class="problem-heading"><div><span class="eyebrow">Equivalent Fractions</span><h1>Which fraction is equal to <span class="inline-fraction"><span>1</span><i></i><span>2</span></span>?</h1></div>${prism(state === "incorrect" ? "support" : state === "correct" ? "celebrate" : "thinking", "prism-peek", `Prism is ${state === "correct" ? "celebrating" : "following the Problem"}`)}</div><div class="fraction-visual" role="img" aria-label="A circle divided into two equal parts with one part shaded"><span></span></div><div class="answer-grid" role="radiogroup" aria-label="Choose a fraction">${option("one-third", "One third", "1/3")}${option("two-fourths", "Two fourths", "2/4")}${option("three-fourths", "Three fourths", "3/4")}${option("two-thirds", "Two thirds", "2/3")}</div></section></main><footer class="quest-footer">${feedback}</footer>`;
  };

  const repair = () => {
    const step = query.get("step") || "diagnostic";
    if (step === "diagnostic") return `${questHeader("Quick check", 1, "quest")}<main id="main-content" class="teaching-shell"><section class="teaching-card"><div class="teaching-guide">${prism("thinking", "prism-large", "Prism asks a quick check")}<div class="speech-bubble"><strong>Let’s check one small idea.</strong><span>This helps me choose the quickest way to explain it.</span></div></div><div class="micro-problem"><span class="eyebrow">Quick check</span><h1>What fraction is shaded?</h1><div class="quarter-disc" role="img" aria-label="One of four equal parts is shaded"></div><div class="compact-options"><a href="${href("repair", { step: "activity" })}">1/2</a><a href="${href("repair", { step: "activity" })}">1/3</a><a class="is-correct-choice" href="${href("repair", { step: "activity" })}">1/4</a><a href="${href("repair", { step: "activity" })}">3/4</a></div></div></section></main>`;
    return `${questHeader("Repair Activity", 1, "quest")}<main id="main-content" class="teaching-shell"><section class="repair-card"><div class="repair-copy">${prism("support", "prism-medium", "Prism explains equivalent fractions")}<span class="eyebrow">Prism’s visual</span><h1>The pieces changed. The amount did not.</h1><p>One half and two fourths shade the same amount of the whole.</p><div class="mode-actions"><button class="quiet-action is-active" type="button">Show visually</button><button class="quiet-action" type="button">Simpler words</button><button class="quiet-action" type="button">Read aloud</button></div></div><div class="equivalence-demo"><div class="fraction-bar fraction-bar--two" aria-label="One of two equal parts shaded"><span></span><span></span></div><strong>1/2</strong><div class="same-sign" aria-hidden="true">=</div><div class="fraction-bar fraction-bar--four" aria-label="Two of four equal parts shaded"><span></span><span></span><span></span><span></span></div><strong>2/4</strong><div class="repair-check"><span>Tap the fraction that matches one half.</span><div><button type="button">1/4</button><a href="${href("quest", { state: "initial", problem: "1", retry: "true" })}">2/4</a><button type="button">3/4</button></div></div></div></section></main>`;
  };

  const boss = () => `${questHeader("Boss Problem", 6, "chapter")}<main id="main-content" class="boss-shell"><section class="boss-stage"><div class="boss-heading">${prism("leading", "prism-medium", "Prism introduces the Fraction Forge")}<div><span class="eyebrow">The Fraction Forge</span><h1>Add <span class="math-text">2/3 + 1/6</span></h1><p>Show how you rename the fractions before adding them.</p></div><span class="reward-chip">Worth 50 XP</span></div><div class="fraction-work"><div><strong>2/3 = 4/6</strong><div class="six-strip"><i></i><i></i><i></i><i></i><span></span><span></span></div></div><div><strong>1/6</strong><div class="six-strip six-strip--orange"><i></i><span></span><span></span><span></span><span></span><span></span></div></div></div><div class="solve-actions"><div><label>Your answer</label><div class="fraction-input"><input inputmode="numeric" aria-label="Numerator" placeholder="?"><i></i><input inputmode="numeric" aria-label="Denominator" placeholder="?"></div></div><button class="primary-action" type="button">Check answer</button><span>or</span><a class="secondary-action" href="${href("upload", { state: "capture" })}">Upload my working</a></div></section></main>`;

  const upload = () => {
    const state = query.get("state") || "capture";
    if (state === "checking") return `${questHeader("Checking your working", 6, "boss")}<main id="main-content" class="upload-shell"><section class="checking-card">${prism("checking", "prism-large", "Prism checks the photographed working")}<span class="eyebrow">Prism is checking</span><h1>Reading each step…</h1><p>This normally takes a few seconds. You can keep this page open.</p><div class="checking-lines" aria-hidden="true"><span></span><span></span><span></span></div><a class="quiet-action" href="${href("boss")}">Cancel</a><a class="prototype-next" href="${href("upload", { state: "uncertain" })}">Show uncertainty state →</a></section></main>`;
    if (state === "uncertain") return `${questHeader("Confirm your working", 6, "boss")}<main id="main-content" class="upload-shell"><section class="uncertainty-card"><div class="scan-preview" aria-label="Uploaded handwritten solution preview"><span>2/3 + 1/6</span><span>4/6 + 1/6</span><mark>5/6</mark></div><div class="confirm-copy">${prism("thinking", "prism-medium", "Prism asks for confirmation")}<span class="eyebrow">One quick confirmation</span><h1>Did you write <span class="math-text">5/6</span> here?</h1><p>I want to make sure I evaluate what you actually wrote.</p><div class="stack-actions"><a class="primary-action" href="${href("complete")}">Yes, 5/6</a><button class="secondary-action" type="button">Edit answer</button><a class="text-action" href="${href("upload", { state: "capture" })}">Retake photo</a></div></div></section></main>`;
    return `${questHeader("Upload your working", 6, "boss")}<main id="main-content" class="upload-shell"><section class="capture-card"><div class="capture-frame"><div class="paper-example" aria-hidden="true"><span>2/3 + 1/6</span><i></i><span>4/6 + 1/6</span><i></i><span>5/6</span></div><div class="corner corner--tl"></div><div class="corner corner--tr"></div><div class="corner corner--bl"></div><div class="corner corner--br"></div></div><div class="capture-copy">${prism("checking", "prism-medium", "Prism helps photograph the working")}<span class="eyebrow">Show your method</span><h1>Keep the whole page inside the frame.</h1><p>Use clear light and make sure every step is visible.</p><div class="stack-actions"><a class="primary-action" href="${href("upload", { state: "checking" })}">Choose a photo</a><button class="secondary-action" type="button">Use camera</button><a class="text-action" href="${href("boss")}">Solve in the app instead</a></div></div></section></main>`;
  };

  const complete = () => `${appHeader("play")}<main id="main-content" class="complete-shell"><section class="victory-card"><div class="victory-art">${prism("victory", "prism-victory", "Prism celebrates quest completion")}<div class="burst" aria-hidden="true"></div></div><div class="victory-copy"><span class="eyebrow">Daily Quest complete</span><h1>Fractions clicked today.</h1><p>You used Equivalent Fractions on a new Problem without a hint.</p><div class="reward-row"><span>${icon("bolt")}<strong>+120 XP</strong><small>Quest reward</small></span><span>${icon("flame")}<strong>7 days</strong><small>Current streak</small></span><span><strong>4 of 5</strong><small>Weekly goal</small></span></div><div class="complete-actions"><a class="primary-action" href="${href("play")}">Finish</a><a class="secondary-action" href="${href("boss")}">Try a bonus Problem</a></div></div></section></main>`;

  const me = () => {
    const tab = query.get("tab") || "overview";
    const tabs = `<nav class="subnav" aria-label="Profile sections"><a class="${tab === "overview" ? "is-active" : ""}" href="${href("me", { tab: "overview" })}">Overview</a><a class="${tab === "journal" ? "is-active" : ""}" href="${href("me", { tab: "journal" })}">Learning Journal</a><a class="${tab === "statistics" ? "is-active" : ""}" href="${href("me", { tab: "statistics" })}">Statistics</a></nav>`;
    let content = `<section class="profile-grid"><div class="profile-hero">${prism("celebrate", "prism-large", "Prism celebrates Maya's progress")}<div><span class="eyebrow">Maya’s progress</span><h1>Level 4</h1><p>340 of 500 XP to the next level</p><div class="progress-track progress-track--large"><i style="width:68%"></i></div></div></div><div class="metric-grid"><article><strong>7 days</strong><span>Current streak</span></article><article><strong>4</strong><span>Skills strengthened</span></article><article><strong>3</strong><span>Quests this week</span></article></div><section class="panel learning-highlight"><span class="eyebrow">Prism noticed</span><h2>Equivalent Fractions clicked</h2><p>You used the idea correctly on a new Problem without asking for a hint.</p></section><section class="panel"><span class="eyebrow">Weekly goal</span><h2>3 of 5 quests complete</h2><div class="week-track"><span class="is-done"></span><span class="is-done"></span><span class="is-done"></span><span></span><span></span></div></section></section>`;
    if (tab === "journal") content = `<section class="journal-grid"><div><span class="eyebrow">Learning Journal</span><h1>Ideas that clicked</h1><p>Real moments from your learning—not generic badges.</p></div><article class="journal-entry is-featured">${prism("celebrate", "prism-medium", "Prism celebrates a learning milestone")}<div><span>Today · Fractions</span><h2>Equivalent fractions clicked</h2><p>You solved a changed-values Problem without a hint after using a visual Repair Activity.</p><strong>Independent transfer</strong></div></article><article class="journal-entry"><div class="journal-date">Tue</div><div><span>Fractions</span><h2>You found a useful visual strategy</h2><p>Fraction bars helped you compare two amounts accurately.</p></div></article><article class="journal-entry"><div class="journal-date">Mon</div><div><span>Number patterns</span><h2>You kept going after a tricky step</h2><p>You used Prism’s hint, corrected the step, and finished independently.</p></div></article></section>`;
    if (tab === "statistics") content = `<section class="statistics-grid"><div class="stats-heading"><div><span class="eyebrow">Learning statistics</span><h1>Your progress at a glance</h1><p>Short summaries of how you are learning.</p></div>${prism("leading", "prism-medium", "Prism points out Maya's progress")}</div><div class="metric-grid metric-grid--wide"><article><strong>7 days</strong><span>Current streak</span></article><article><strong>12 days</strong><span>Best streak</span></article><article><strong>4</strong><span>Skills strengthened</span></article><article><strong>18</strong><span>Problems this week</span></article></div><section class="panel chart-panel"><div><span class="eyebrow">This week</span><h2>Quest activity</h2><p>Three completed quests: Monday, Tuesday and Thursday.</p></div><div class="bar-chart" role="img" aria-label="Three quests completed this week"><span style="--h:62%"><small>M</small></span><span style="--h:82%"><small>T</small></span><span style="--h:18%"><small>W</small></span><span style="--h:72%"><small>T</small></span><span style="--h:10%"><small>F</small></span></div></section><section class="panel learning-highlight"><span class="eyebrow">Best next move</span><h2>Keep using visual fraction Problems</h2><p>You improve fastest when a diagram appears before the symbols.</p><a class="primary-action" href="${href("quest")}">Start a visual quest</a></section></section>`;
    return `${appHeader("me")}<main id="main-content" class="page-shell profile-shell"><header class="profile-header"><div><span class="eyebrow">Me</span><h1>Hi, Maya</h1></div><a class="quiet-action" href="${href("settings")}">${icon("settings")} Settings</a></header>${tabs}${content}</main>`;
  };

  const settings = () => `${appHeader("me")}<main id="main-content" class="settings-shell"><a class="back-link" href="${href("me")}">← Back to Me</a><div class="settings-heading"><div><span class="eyebrow">Settings</span><h1>Make the app work for you</h1><p>Adjust sound, movement, readability and account options.</p></div>${prism("ready", "prism-medium", "Prism stands beside settings")}</div><div class="settings-grid"><section class="settings-group"><h2>Learning experience</h2><label><span><strong>Read Problems aloud</strong><small>Show a read-aloud action during quests</small></span><input type="checkbox" role="switch" checked></label><label><span><strong>Sound effects</strong><small>Play short sounds for actions and rewards</small></span><input type="checkbox" role="switch" checked></label><label><span><strong>Haptics</strong><small>Available later in the mobile apps</small></span><input type="checkbox" role="switch" disabled></label></section><section class="settings-group"><h2>Comfort and access</h2><label><span><strong>Reduce motion</strong><small>Use static Prism poses and celebrations</small></span><input type="checkbox" role="switch"></label><label><span><strong>High contrast</strong><small>Increase separation between controls and surfaces</small></span><input type="checkbox" role="switch"></label><button class="settings-row" type="button"><span><strong>Text size</strong><small>Use your browser’s text and zoom controls</small></span><span>Default →</span></button></section><section class="settings-group"><h2>Account and privacy</h2><button class="settings-row" type="button"><span><strong>Guardian account</strong><small>Signed in with Google</small></span><span>Manage →</span></button><button class="settings-row" type="button"><span><strong>Your data</strong><small>View uploads and learning history</small></span><span>View →</span></button><button class="settings-row settings-row--danger" type="button"><span><strong>Delete account</strong><small>Permanently remove the Guardian Account and Learner Profile</small></span><span>→</span></button></section><section class="settings-group"><h2>Session</h2><button class="secondary-action secondary-action--full" type="button">Sign out</button></section></div></main>`;

  const welcome = () => `<main id="main-content" class="onboarding-shell"><header>${brand()}<a class="text-action" href="${href("auth")}">Already have an account? Sign in</a></header><section class="welcome-stage"><div class="welcome-copy"><span class="quest-label"><i aria-hidden="true"></i>Your personal math journey</span><h1>Math quests that learn how you learn.</h1><p>Solve quick Problems, get visual help from Prism, and build your own Path one Skill at a time.</p><a class="primary-action primary-action--large" href="${href("auth")}">Get started <span aria-hidden="true">→</span></a><small>Designed for independent Class 6 mathematics practice.</small></div><div class="welcome-world">${prism("ready", "prism-welcome", "Prism welcomes the learner")}<div class="speech-bubble"><strong>Hi, I’m Prism.</strong><span>I’ll guide you when a Problem gets tricky.</span></div><div class="floating-node node-one" aria-hidden="true">1/2</div><div class="floating-node node-two" aria-hidden="true">2/4</div><div class="floating-node node-three" aria-hidden="true">?</div></div></section></main>`;

  const auth = () => `<main id="main-content" class="onboarding-shell"><header>${brand()}<a class="text-action" href="${href("welcome")}">← Back</a></header><section class="auth-stage"><div class="auth-card"><span class="eyebrow">Guardian sign-in</span><h1>Save your learner’s progress</h1><p>A guardian signs in once. After that, daily learning stays one tap away.</p><div class="provider-actions"><a href="${href("setup")}"><span class="provider-mark provider-mark--google">G</span>Continue with Google</a><a href="${href("setup")}"><span class="provider-mark provider-mark--apple">●</span>Continue with Apple</a></div><small>By continuing, you agree to the Terms and acknowledge the Privacy Policy.</small></div><aside class="auth-guide">${prism("support", "prism-large", "Prism explains guardian sign-in")}<div class="speech-bubble"><strong>Your progress belongs to you.</strong><span>Sign-in keeps each Learner Profile and its Mastery history private.</span></div></aside></section></main>`;

  const setup = () => `<main id="main-content" class="onboarding-shell"><header>${brand()}<span class="step-label">Setup · 1 of 1</span></header><section class="setup-stage"><div class="setup-card"><span class="eyebrow">Learner setup</span><h1>What should Prism call you?</h1><p>This nickname appears inside your learning experience.</p><label for="nickname">Nickname</label><input id="nickname" value="Maya" autocomplete="nickname"><div class="setup-summary"><span><strong>Class 6</strong><small>Mathematics</small></span><span><strong>Chapter 1</strong><small>Start from the beginning</small></span></div><a class="primary-action primary-action--large" href="${href("play")}">Start learning <span aria-hidden="true">→</span></a></div><aside class="setup-guide">${prism("ready", "prism-large", "Prism waves hello to Maya")}<div class="speech-bubble"><strong>Hi, Maya!</strong><span>I’ll create short quests and explain ideas visually whenever you need me.</span></div></aside></section></main>`;

  const renderers = { welcome, auth, setup, play, path, chapter, quest, repair, boss, upload, complete, me, settings };
  const render = renderers[screen] || play;
  app.innerHTML = `${render()}${designNavigator()}`;
  document.title = `${screens.find(([key]) => key === screen)?.[1] || "Play Home"} — Curious Workshop Web Mockup`;

  document.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const params = new URLSearchParams(window.location.search);
      params.set("screen", "quest");
      params.set("state", "selected");
      params.set("answer", button.dataset.answer);
      window.location.search = params;
    });
  });

  document.querySelector("[data-check-answer]")?.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    params.set("screen", "quest");
    params.set("state", params.get("answer") === "two-fourths" ? "correct" : "incorrect");
    window.location.search = params;
  });
})();
