/**
 * Removes React's hydration payload from the exported HTML.
 *
 * Every interactive thing on this site is a native anchor or a CSS state: there are no
 * client components, no event handlers and no state. The bundle Next ships is therefore
 * ~90 kB (brotli) of runtime that boots, hydrates a tree nobody will ever interact with,
 * and changes nothing on screen. On a real mobile connection that costs about a second
 * of LCP, which is the difference between 90 and ~99 in Lighthouse.
 *
 * THE GUARD BELOW IS THE POINT. The moment any component becomes a client component this
 * script fails the build rather than shipping a page whose JavaScript silently does not
 * run. If you add interactivity, delete the `strip` step from the build script — do not
 * weaken the guard.
 */
import { readdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'out');

async function walk(dir, filter) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path, filter)));
    else if (filter(path)) found.push(path);
  }
  return found;
}

// ---------------------------------------------------------------- guard
const sources = await Promise.all(
  ['app', 'components', 'lib', 'content'].map((d) =>
    walk(join(root, d), (p) => ['.ts', '.tsx'].includes(extname(p))).catch(() => []),
  ),
);

const clientComponents = [];
for (const path of sources.flat()) {
  const text = await readFile(path, 'utf8');
  if (/^\s*['"]use client['"]/m.test(text)) clientComponents.push(path);
}

if (clientComponents.length > 0) {
  console.error(
    '\nstrip-hydration: found client components, so the page needs its JavaScript:\n' +
      clientComponents.map((p) => `  ${p}`).join('\n') +
      '\n\nRemove the `strip` step from the build script instead of running this.\n',
  );
  process.exit(1);
}

// ---------------------------------------------------------------- strip
const htmlFiles = await walk(out, (p) => p.endsWith('.html'));
let htmlSaved = 0;

for (const path of htmlFiles) {
  const before = await readFile(path, 'utf8');
  const after = before
    // Chunk tags, both the async loaders in <head> and the bootstrap at the end of <body>.
    .replace(/<script[^>]*src="\/_next\/[^"]*"[^>]*><\/script>/g, '')
    // The inline flight payload React streams for hydration.
    .replace(/<script>\s*\(self\.__next_f[\s\S]*?<\/script>/g, '')
    .replace(/<script>\s*self\.__next_f[\s\S]*?<\/script>/g, '')
    // Script preloads. Stylesheet and font preloads are left alone.
    .replace(/<link[^>]*rel="preload"[^>]*as="script"[^>]*>/g, '');

  if (after !== before) {
    htmlSaved += Buffer.byteLength(before) - Buffer.byteLength(after);
    await writeFile(path, after);
  }
}

// ---------------------------------------------------------------- sweep
let assetsSaved = 0;

for (const dir of [join(out, '_next', 'static', 'chunks')]) {
  const files = await walk(dir, () => true).catch(() => []);
  for (const f of files) assetsSaved += (await stat(f)).size;
  await rm(dir, { recursive: true, force: true });
}

// RSC payloads exist only for the client router, which no longer loads.
for (const f of await walk(out, (p) => p.endsWith('.txt') && !p.endsWith('robots.txt'))) {
  assetsSaved += (await stat(f)).size;
  await rm(f, { force: true });
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
console.log(
  `strip-hydration: ${htmlFiles.length} pages, ${kb(htmlSaved)} of inline payload and ` +
    `${kb(assetsSaved)} of scripts removed`,
);

// ---------------------------------------------------------------- verify
for (const path of htmlFiles) {
  const text = await readFile(path, 'utf8');
  if (/<script[^>]*src=/.test(text) || /__next_f/.test(text)) {
    console.error(`strip-hydration: ${path} still references scripts`);
    process.exit(1);
  }
  if (!/<\/body>/.test(text)) {
    console.error(`strip-hydration: ${path} looks truncated`);
    process.exit(1);
  }
}
