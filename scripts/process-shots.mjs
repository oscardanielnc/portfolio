/**
 * Turns the raw screenshots in view/ into web-sized WebP in public/projects/.
 *
 * The cards crop every plate to 16:10 from the top, so the crop happens HERE rather than
 * in the browser: shipping pixels that CSS then throws away is wasted bandwidth.
 *
 * Run locally with `npm run shots`; the output is committed, so the Cloudflare build never
 * has to process an image. sharp is a devDependency and never reaches the browser.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'projects');

const RATIO = 16 / 10;

/**
 * left: how much to trim off the left edge of the source before cropping to ratio
 *       (used to drop app sidebars that read as noise at card size).
 * width: final rendered width, sized for 2x on the widest card it appears in.
 */
const jobs = [
  { src: 'tickerlens.png', out: 'tickerlens.webp', left: 280, width: 1200 },
  { src: 'tvbot.png', out: 'tvindicators.webp', left: 0, width: 1000 },
  { src: 'osint.png', out: 'exposure.webp', left: 0, width: 1000 },
  { src: 'estudia.png', out: 'estudia.webp', left: 0, width: 720 },
];

await mkdir(outDir, { recursive: true });

const manifest = [];
for (const job of jobs) {
  const src = sharp(join(root, 'view', job.src));
  const { width: sw = 0, height: sh = 0 } = await src.metadata();

  const availableWidth = sw - job.left;
  // Largest top-anchored 16:10 window that fits inside the source.
  const cropWidth = Math.min(availableWidth, Math.round(sh * RATIO));
  const cropHeight = Math.round(cropWidth / RATIO);

  // Two widths so phones do not download the desktop plate.
  for (const [suffix, width] of [['', job.width], ['@sm', Math.round(job.width / 2)]]) {
    const buf = await sharp(join(root, 'view', job.src))
      .extract({ left: job.left, top: 0, width: cropWidth, height: cropHeight })
      .resize({ width })
      .webp({ quality: 76, effort: 6 })
      .toBuffer();

    const name = job.out.replace('.webp', `${suffix}.webp`);
    await writeFile(join(outDir, name), buf);
    manifest.push({
      file: name,
      source: `${sw}x${sh}`,
      crop: `${cropWidth}x${cropHeight}`,
      out: `${width}x${Math.round(width / RATIO)}`,
      kb: +(buf.length / 1024).toFixed(1),
    });
  }
}

console.table(manifest);
