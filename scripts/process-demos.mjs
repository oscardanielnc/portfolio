/**
 * Turns the raw recordings in view/demos/ into the small MP4 pair that ships in
 * public/demos/, plus a still poster.
 *
 * Sibling of process-shots.mjs and it follows the same rule: every expensive operation
 * happens here, locally, and the output is committed, so the Cloudflare build never
 * transcodes anything. ffmpeg is a local tool, not a dependency of the site.
 *
 * Weight is the whole design constraint. These clips sit below the fold on a personal
 * site, so they are muted, short, 24fps, and encoded to roughly the byte budget of a
 * decent JPEG — not to the quality a video player would want.
 *
 * A recording carries a sidecar JSON with marks. A `skip-start` / `skip-end` pair is a
 * stretch the flow asked to cut, which is how the 12 seconds of TickerLens waiting on a
 * real retrieval pipeline stops being 12 seconds of a spinner.
 *
 * Filenames carry a content hash, and content/demos.ts is generated from them. This is not
 * decoration. These files first shipped at stable names under Cloudflare's default
 * `max-age=14400`, so re-recording a demo left every previous visitor watching four hours
 * of a video that no longer existed in the repository — which is exactly what happened,
 * and it looked like the site was broken rather than cached. A new encode is a new URL.
 */
import { mkdir, readdir, readFile, writeFile, stat, rm, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'view', 'demos');
const explainerDir = join(root, 'explainers');
const outDir = join(root, 'public', 'demos');

/**
 * winget installs ffmpeg outside the PATH of an already-open shell, so fall back to
 * where it puts it rather than failing on a fresh machine.
 */
function resolveFfmpeg(name) {
  if (process.env.FFMPEG_DIR) return join(process.env.FFMPEG_DIR, name);
  const winget = join(
    process.env.LOCALAPPDATA ?? '',
    'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe',
    'ffmpeg-9.0.1-full_build/bin',
    name,
  );
  return existsSync(winget) ? winget : name; // else assume it is on PATH
}

const FFMPEG = resolveFfmpeg('ffmpeg.exe');
const FFPROBE = resolveFfmpeg('ffprobe.exe');

const RATIO = 16 / 10;
/** Widest the plate is ever rendered is ~34rem, so 1000 covers 2x without waste. */
const WIDTHS = [['', 1000], ['@sm', 500]];
/** Matches --bg-raised, so a portrait clip pads into the card instead of onto black. */
const PAD = '0x0d0d14';

/**
 * posterAt is a fraction of the finished cut. crf is per-demo because the cost of a frame
 * depends entirely on what is in it: Mi Peso is flat dark panels and compresses to almost
 * nothing, while TickerLens and tvbot are dense tables and body text over a light ground,
 * which is the expensive case. The plate renders about 544px wide, so that text is never
 * read from the card anyway — it needs to register as a wall of cited analysis, not to be
 * legible, and that is worth several hundred kilobytes.
 */
const jobs = {
  tickerlens: { posterAt: 0.72, crf: 34 },
  kepler: { posterAt: 0.62, crf: 30 },
  exposure: { posterAt: 0.62, crf: 35 },
  tvindicators: { posterAt: 0.15, crf: 34 },
  mipeso: { posterAt: 0.55, crf: 30 },
  estudia: { posterAt: 0.5, crf: 33 },
};

async function duration(file) {
  const { stdout } = await run(FFPROBE, [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ]);
  return parseFloat(stdout.trim());
}

/** Complement of the marked skip ranges: the parts of the take that survive the cut. */
function keepSegments(marks, total) {
  const skips = [];
  for (let i = 0; i < marks.length; i++) {
    if (marks[i].name !== 'skip-start') continue;
    const end = marks.slice(i + 1).find((m) => m.name === 'skip-end');
    if (end) skips.push([marks[i].at, end.at]);
  }
  if (!skips.length) return [[0, total]];

  const keep = [];
  let cursor = 0;
  for (const [from, to] of skips) {
    if (from > cursor) keep.push([cursor, from]);
    cursor = to;
  }
  if (cursor < total) keep.push([cursor, total]);
  return keep.filter(([a, b]) => b - a > 0.4);
}

/**
 * Landscape clips scale straight to the plate. Portrait ones are letterboxed into it,
 * which reads as "this is a phone app" rather than as a broken aspect ratio.
 */
function geometry(width, phone) {
  const height = Math.round(width / RATIO / 2) * 2;
  if (!phone) return { height, chain: `scale=${width}:${height}:flags=lanczos` };
  const inner = Math.round(height * 0.94 / 2) * 2;
  return {
    height,
    chain: `scale=-2:${inner}:flags=lanczos,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${PAD}`,
  };
}

function filterGraph(segments, chain) {
  const parts = segments.map(
    ([from, to], i) => `[0:v]trim=start=${from.toFixed(3)}:end=${to.toFixed(3)},setpts=PTS-STARTPTS[s${i}]`,
  );
  const concat = `${segments.map((_, i) => `[s${i}]`).join('')}concat=n=${segments.length}:v=1:a=0[cut]`;
  return `${parts.join(';')};${concat};[cut]fps=24,${chain}[out]`;
}

await mkdir(outDir, { recursive: true });

/**
 * Two kinds of source, one encoder. Recordings of live apps come out of Playwright as
 * WebM; the explainers under explainers/<name>/ are HyperFrames compositions rendered to
 * MP4. They land in the same place, at the same widths, under the same budget, because
 * the card cannot tell them apart and neither should the pipeline.
 */
const takes = [];

for (const f of (await readdir(srcDir).catch(() => []))) {
  if (f.endsWith('.webm')) takes.push({ name: f.replace('.webm', ''), src: join(srcDir, f) });
}

for (const dir of (await readdir(explainerDir, { withFileTypes: true }).catch(() => []))) {
  if (!dir.isDirectory()) continue;
  const render = join(explainerDir, dir.name, 'renders', `${dir.name}.mp4`);
  if (existsSync(render)) takes.push({ name: dir.name, src: render, explainer: true });
}

if (!takes.length) {
  console.error('Nothing to process. Run `npm run demos:record`, or render an explainer.');
  process.exit(1);
}

const manifest = [];
/** Filled per demo, then written out as content/demos.ts for site.ts to import. */
const generated = {};

for (const { name, src, explainer } of takes) {
  const job = jobs[name] ?? { posterAt: 0.5, crf: 32 };
  // Explainers are authored, not recorded, so they carry no marks and need no cutting.
  const sidecar = explainer
    ? {}
    : await readFile(join(srcDir, `${name}.json`), 'utf8').then(JSON.parse).catch(() => ({}));

  const total = await duration(src);
  const segments = keepSegments(sidecar.marks ?? [], total);
  const kept = segments.reduce((sum, [a, b]) => sum + (b - a), 0);
  const phone = Boolean(sidecar.phone);

  /**
   * Encode the full-size cut first and hash it, so every file in this demo's set shares
   * one fingerprint and a re-encode can never reuse a URL.
   */
  const encode = async (dest, width, crf) => {
    const { height, chain } = geometry(width, phone);
    await rm(dest, { force: true });
    await run(FFMPEG, [
      '-v', 'error', '-y', '-i', src,
      '-filter_complex', filterGraph(segments, chain),
      '-map', '[out]',
      '-an',                                  // no audio track at all, not a silent one
      '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0',
      '-preset', 'veryslow',                  // slow here is free; bytes on the wire are not
      '-crf', String(crf),
      '-g', '48', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',              // moov atom first, so it starts without a full download
      dest,
    ]);
    return height;
  };

  const staging = join(outDir, `.staging-${name}.mp4`);
  await encode(staging, 1000, job.crf);
  const hash = createHash('sha256').update(await readFile(staging)).digest('hex').slice(0, 8);
  const stem = `${name}.${hash}`;

  // Anything left from an earlier hash is dead weight; the generated module never names it.
  for (const f of await readdir(outDir)) {
    if (f.startsWith(`${name}.`) && !f.startsWith(`${stem}`)) await rm(join(outDir, f), { force: true });
  }

  const main = join(outDir, `${stem}.mp4`);
  await rm(main, { force: true });
  await rename(staging, main);

  const { height } = geometry(1000, phone);
  manifest.push({ file: `${stem}.mp4`, out: `1000x${height}`, seconds: +kept.toFixed(1), kb: +((await stat(main)).size / 1024).toFixed(1) });

  const smallHeight = await encode(join(outDir, `${stem}@sm.mp4`), 500, job.crf + 2);
  manifest.push({
    file: `${stem}@sm.mp4`,
    out: `500x${smallHeight}`,
    seconds: +kept.toFixed(1),
    kb: +((await stat(join(outDir, `${stem}@sm.mp4`))).size / 1024).toFixed(1),
  });

  // Poster: a real frame from the finished cut, so it matches what the video opens on.
  const { chain } = geometry(1000, phone);
  const still = join(outDir, `.${name}-poster.png`);
  await run(FFMPEG, [
    '-v', 'error', '-y', '-i', src,
    // The comma needs a literal backslash for ffmpeg, hence the doubled escape here.
    '-filter_complex', `${filterGraph(segments, chain)};[out]select=gte(t\\,${(kept * job.posterAt).toFixed(2)})[p]`,
    '-map', '[p]', '-frames:v', '1', still,
  ]);
  const poster = join(outDir, `${stem}-poster.webp`);
  await sharp(still).resize({ width: 800 }).webp({ quality: 72, effort: 6 }).toFile(poster);
  await rm(still, { force: true });

  generated[name] = { src: `/demos/${stem}.mp4`, poster: `/demos/${stem}-poster.webp`, width: 1000, height };

  manifest.push({ file: `${stem}-poster.webp`, out: `800x${Math.round(800 / RATIO)}`, seconds: 0, kb: +((await stat(poster)).size / 1024).toFixed(1) });
}

// Beside the raw takes rather than in public/: this is a build report, not a site asset.
await writeFile(join(srcDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

/**
 * The hashed paths, as a module content/site.ts imports.
 *
 * Generated rather than kept by hand: a hash nobody can predict is not something to copy
 * across by eye, and a stale path here would ship a 404 in place of a plate.
 */
const entries = Object.keys(generated)
  .sort()
  // A folder name like `momentum-investor` is not a valid bare key, so quote those.
  .map((k) => `  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${JSON.stringify(generated[k])},`)
  .join('\n');

await writeFile(
  join(root, 'content', 'demos.ts'),
  [
    '/**',
    ' * Generated by scripts/process-demos.mjs. Do not edit by hand.',
    ' *',
    ' * Filenames carry a content hash so that a re-encode publishes a new URL. These are',
    ' * served immutable, and reusing a name left visitors watching a cached copy of a clip',
    ' * that had already been replaced in the repository.',
    ' */',
    'export const demos = {',
    entries,
    '} as const;',
    '',
  ].join('\n'),
);

console.table(manifest);
console.log(`total shipped: ${(manifest.reduce((s, m) => s + m.kb, 0) / 1024).toFixed(2)} MB`);
