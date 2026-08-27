/**
 * Generates public/og.png (1200x630) and public/apple-icon.png.
 *
 * Run locally with `npm run og`; the output is committed to the repository so the
 * Cloudflare Pages build never needs to rasterise anything. sharp is a devDependency
 * and is not shipped to the browser.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

const BG = '#08080c';
const INK = '#f4f4f8';
const MUTED = '#9b9bad';
const ACCENT = '#ff6b4a';
const ACCENT_2 = '#a78bfa';

const FONT = "'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Consolas', 'DejaVu Sans Mono', monospace";

const NAME = 'Oscar Daniel Navarro Cieza';
const HEADLINE = 'Frontend &amp; AI-Augmented Full-Stack Developer';
const LOCATION = 'Peru · Remote (UTC-5) — full overlap with US Eastern';
const DOMAIN = 'oscarnavarro.dev';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glowA" cx="0.1" cy="0.05" r="0.75">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.88" cy="0.12" r="0.7">
      <stop offset="0%" stop-color="${ACCENT_2}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${ACCENT_2}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="name" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="30%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="#9a9aa2"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#glowA)"/>
  <rect width="1200" height="630" fill="url(#glowB)"/>
  <rect x="0" y="0" width="1200" height="5" fill="${ACCENT}"/>

  <circle cx="104" cy="240" r="9" fill="${ACCENT}"/>

  <text x="140" y="252" font-family="${FONT}" font-size="66" font-weight="600"
        letter-spacing="-2.4" fill="url(#name)">${NAME}</text>

  <text x="140" y="308" font-family="${FONT}" font-size="34" font-weight="500"
        fill="${ACCENT}">${HEADLINE}</text>

  <text x="140" y="350" font-family="${FONT}" font-size="24" font-weight="400"
        fill="${MUTED}">${LOCATION}</text>

  <line x1="96" y1="470" x2="1104" y2="470" stroke="#23232e" stroke-width="1"/>

  <text x="96" y="522" font-family="${MONO}" font-size="24" fill="${MUTED}">${DOMAIN}</text>
  <text x="1104" y="522" text-anchor="end" font-family="${FONT}" font-size="22" fill="${MUTED}"
        >React · Next.js · TypeScript · Python</text>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${BG}"/>
  <path d="M32 13c10.5 0 19 8.5 19 19s-8.5 19-19 19-19-8.5-19-19 8.5-19 19-19Zm0 7.5A11.5 11.5 0 1 0 43.5 32 11.5 11.5 0 0 0 32 20.5Z" fill="${ACCENT}"/>
  <path d="M42 42.5 52.5 53" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/>
</svg>`;

await mkdir(publicDir, { recursive: true });

const ogPng = await sharp(Buffer.from(og), { density: 96 }).png({ compressionLevel: 9 }).toBuffer();
await writeFile(join(publicDir, 'og.png'), ogPng);

const iconPng = await sharp(Buffer.from(icon), { density: 300 })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(join(root, 'app', 'apple-icon.png'), iconPng);

// Grain tile. Rasterised here so the browser decodes a small PNG instead of running an
// feTurbulence filter on every paint, which cost ~0.9s of LCP under mobile throttling.
const noise = await sharp({
  create: {
    width: 128,
    height: 128,
    channels: 3,
    background: { r: 128, g: 128, b: 128 },
    noise: { type: 'gaussian', mean: 128, sigma: 42 },
  },
})
  .greyscale()
  .png({ compressionLevel: 9, colours: 32 })
  .toBuffer();
await writeFile(join(publicDir, 'noise.png'), noise);

console.log(`public/noise.png     ${(noise.length / 1024).toFixed(1)} kB`);
console.log(`public/og.png        ${(ogPng.length / 1024).toFixed(1)} kB`);
console.log(`app/apple-icon.png   ${(iconPng.length / 1024).toFixed(1)} kB`);
