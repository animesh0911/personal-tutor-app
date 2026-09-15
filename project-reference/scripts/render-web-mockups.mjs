import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PROJECT_ROOT = "/Users/animesh/personal_tutor_app";
const MOCKUP_ROOT = path.join(PROJECT_ROOT, "stitch_math_quest_play_screen/web_mvp_mockups");
const OUTPUT_ROOT = path.join(MOCKUP_ROOT, "renders");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };

const routes = [
  ["welcome", "screen=welcome"],
  ["auth", "screen=auth"],
  ["setup", "screen=setup"],
  ["play", "screen=play"],
  ["path", "screen=path"],
  ["chapter", "screen=chapter"],
  ["quest-initial", "screen=quest&state=initial"],
  ["quest-selected", "screen=quest&state=selected&answer=two-fourths"],
  ["quest-correct", "screen=quest&state=correct"],
  ["quest-incorrect", "screen=quest&state=incorrect"],
  ["diagnostic", "screen=repair&step=diagnostic"],
  ["repair", "screen=repair&step=activity"],
  ["boss", "screen=boss"],
  ["upload", "screen=upload&state=capture"],
  ["checking", "screen=upload&state=checking"],
  ["scan-uncertainty", "screen=upload&state=uncertain"],
  ["complete", "screen=complete"],
  ["me", "screen=me&tab=overview"],
  ["journal", "screen=me&tab=journal"],
  ["statistics", "screen=me&tab=statistics"],
  ["settings", "screen=settings"],
];

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

async function renderRoute(cdp, [name, search]) {
  const url = `${pathToFileURL(path.join(MOCKUP_ROOT, "code.html")).href}?${search}`;
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", VIEWPORT, sessionId);

  const loaded = cdp.once("Page.loadEventFired", sessionId);
  await cdp.send("Page.navigate", { url }, sessionId);
  await loaded;
  await cdp.send("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true, returnByValue: true }, sessionId);
  await cdp.send("Runtime.evaluate", {
    expression: "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);

  const { result } = await cdp.send("Runtime.evaluate", {
    expression: `(() => ({
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      unrenderedPrisms: [...document.querySelectorAll('[data-prism]')].filter((node) => !node.querySelector('svg')).length,
      screen: new URLSearchParams(location.search).get('screen')
    }))()`,
    returnByValue: true,
  }, sessionId);
  const metrics = result.value;
  if (metrics.innerWidth !== VIEWPORT.width || metrics.clientWidth !== VIEWPORT.width) {
    throw new Error(`Unexpected viewport for ${name}: ${JSON.stringify(metrics)}`);
  }
  if (metrics.scrollWidth > VIEWPORT.width) {
    throw new Error(`Horizontal overflow in ${name}: ${JSON.stringify(metrics)}`);
  }
  if (metrics.unrenderedPrisms > 0) {
    throw new Error(`Prism failed to render in ${name}: ${JSON.stringify(metrics)}`);
  }

  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  }, sessionId);
  await writeFile(path.join(OUTPUT_ROOT, `${name}-1440x900.png`), Buffer.from(data, "base64"));
  await cdp.send("Target.closeTarget", { targetId });
  return { name, scrollHeight: metrics.scrollHeight };
}

await mkdir(OUTPUT_ROOT, { recursive: true });
const profileDir = await mkdtemp(path.join(tmpdir(), "curious-workshop-web-chrome-"));
const chrome = spawn(CHROME, [
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
], { stdio: ["ignore", "ignore", "pipe"] });

let cdp;
try {
  cdp = new Cdp(await waitForDebuggerUrl(chrome));
  await cdp.open();
  const results = [];
  for (const route of routes) results.push(await renderRoute(cdp, route));
  console.log(`Rendered and checked ${results.length} web mockup states at ${VIEWPORT.width}x${VIEWPORT.height}.`);
  for (const result of results) console.log(`${result.name}: document height ${result.scrollHeight}px`);
} finally {
  cdp?.close();
  chrome.kill("SIGTERM");
  await rm(profileDir, { recursive: true, force: true });
}
