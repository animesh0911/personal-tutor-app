import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PROJECT_ROOT = "/Users/animesh/personal_tutor_app";
const SCREENS_ROOT = path.join(PROJECT_ROOT, "stitch_math_quest_play_screen");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 1, mobile: true };

class Cdp {
  constructor(url) {
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.socket = new WebSocket(url);
    this.socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      const key = `${message.sessionId ?? "browser"}:${message.method}`;
      const waiters = this.events.get(key) ?? [];
      this.events.delete(key);
      for (const resolve of waiters) resolve(message.params);
    });
  }

  async open() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  once(method, sessionId) {
    const key = `${sessionId ?? "browser"}:${method}`;
    return new Promise((resolve) => {
      const waiters = this.events.get(key) ?? [];
      waiters.push(resolve);
      this.events.set(key, waiters);
    });
  }

  close() {
    this.socket.close();
  }
}

function waitForDebuggerUrl(child) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error("Chrome did not expose a debugging URL.")), 15_000);
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timeout);
      resolve(match[1]);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome exited before rendering (code ${code}).`));
    });
  });
}

async function renderScreen(cdp, screenDir) {
  const url = pathToFileURL(path.join(screenDir, "code.html")).href;
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", VIEWPORT, sessionId);

  const loaded = cdp.once("Page.loadEventFired", sessionId);
  await cdp.send("Page.navigate", { url }, sessionId);
  await loaded;
  await cdp.send(
    "Runtime.evaluate",
    { expression: "document.fonts.ready", awaitPromise: true, returnByValue: true },
    sessionId,
  );
  await cdp.send(
    "Runtime.evaluate",
    {
      expression: "new Promise((resolve) => { window.scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(resolve)); })",
      awaitPromise: true,
      returnByValue: true,
    },
    sessionId,
  );

  const { result } = await cdp.send(
    "Runtime.evaluate",
    {
      expression: "(() => { const header = document.querySelector('header'); const rect = header?.getBoundingClientRect(); return { innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, scrollY, isOneScreen: document.body.matches('.quest-screen, .one-screen'), header: rect ? { top: rect.top, height: rect.height, display: getComputedStyle(header).display } : null }; })()",
      returnByValue: true,
    },
    sessionId,
  );
  const metrics = result.value;
  if (metrics.innerWidth !== VIEWPORT.width || metrics.clientWidth !== VIEWPORT.width) {
    throw new Error(`Unexpected viewport for ${path.basename(screenDir)}: ${JSON.stringify(metrics)}`);
  }
  if (metrics.scrollWidth > VIEWPORT.width) {
    throw new Error(`Horizontal overflow in ${path.basename(screenDir)}: ${JSON.stringify(metrics)}`);
  }
  if (metrics.scrollY !== 0) {
    throw new Error(`Unexpected initial scroll in ${path.basename(screenDir)}: ${JSON.stringify(metrics)}`);
  }
  if (metrics.isOneScreen && metrics.scrollHeight > VIEWPORT.height + 1) {
    throw new Error(`Default one-screen scene scrolls in ${path.basename(screenDir)}: ${JSON.stringify(metrics)}`);
  }

  const { data } = await cdp.send(
    "Page.captureScreenshot",
    { format: "png", fromSurface: true, captureBeyondViewport: false },
    sessionId,
  );
  await writeFile(path.join(screenDir, "screen.png"), Buffer.from(data, "base64"));
  await cdp.send("Target.closeTarget", { targetId });
}

const profileDir = await mkdtemp(path.join(tmpdir(), "curious-workshop-chrome-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

let cdp;
try {
  cdp = new Cdp(await waitForDebuggerUrl(chrome));
  await cdp.open();
  const entries = await readdir(SCREENS_ROOT, { withFileTypes: true });
  const screenDirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(SCREENS_ROOT, entry.name);
    try {
      await readFile(path.join(directory, "code.html"));
      screenDirs.push(directory);
    } catch {
      // This directory is shared support content rather than a screen.
    }
  }
  screenDirs.sort();
  for (const directory of screenDirs) await renderScreen(cdp, directory);
  console.log(`Rendered ${screenDirs.length} design screens at ${VIEWPORT.width}x${VIEWPORT.height}.`);
} finally {
  cdp?.close();
  chrome.kill("SIGTERM");
  await rm(profileDir, { recursive: true, force: true });
}
