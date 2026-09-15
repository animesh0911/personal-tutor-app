import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import express from 'express';
import { Store } from './store.mjs';
import { Tutor } from './tutor.mjs';
import { createApp } from './app.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dev = process.argv.includes('--dev');
const port = Number(process.env.STUDIO_PORT || 4310),
  host = process.env.STUDIO_HOST || '127.0.0.1';
const origin = process.env.STUDIO_ORIGIN || `http://localhost:${port}`;
const dataDir = resolve(
  process.env.STUDIO_DATA_DIR || resolve(root, '.studio-data'),
);
const store = new Store(resolve(dataDir, 'studio.sqlite'));
const tutor = new Tutor(store, {
  dataDir,
  provider: process.env.TUTOR_PROVIDER || 'openrouter',
  model: process.env.TUTOR_MODEL || 'qwen/qwen3.7-flash',
  apiKey: process.env.TUTOR_API_KEY,
});
await tutor.initialize();
const app = createApp({
  store,
  tutor,
  origin,
  secureCookies: origin.startsWith('https:'),
});
let vite;
if (dev) {
  const { createServer } = await import('vite');
  vite = await createServer({
    configFile: resolve(root, 'studio/vite.config.mjs'),
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
} else {
  const dist = resolve(root, '.studio-dist');
  if (!existsSync(resolve(dist, 'index.html')))
    throw new Error('Build the studio first: npm run studio:build');
  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    });
    next();
  });
  app.use(express.static(dist, { index: false }));
  app.get('/{*path}', (_req, res) =>
    res.sendFile('index.html', { root: dist }),
  );
}
const server = app.listen(port, host, () =>
  console.log(
    `Prism studio: ${origin}\nTutor: ${tutor.ready ? 'configured' : 'API key setup required'}`,
  ),
);
let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  await tutor.close();
  await vite?.close();
  server.closeAllConnections();
  server.close();
  store.close();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
