/**
 * Records the live demos into raw WebM in view/demos/.
 *
 * The portfolio used to show still screenshots, which prove a project exists but not that
 * it works. These recordings drive the real deployments, so what ends up on the card is
 * the product actually running — not a mockup and not a re-creation.
 *
 * Playwright rather than a screen recorder because this has to be repeatable: when an app
 * changes, `npm run demos` regenerates the footage instead of someone re-recording by hand.
 *
 * Raw output is intentionally large and never committed. `npm run demos:process` turns it
 * into the small MP4 pair that ships.
 *
 * Estudia needs an account. The script reads ESTUDIA_USER / ESTUDIA_PASSWORD from the
 * environment and skips the flow when they are unset, so no credential ever lands in the
 * repository. See scripts/README-demos.md.
 */
import { mkdir, rm, readdir, rename, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'view', 'demos');

/** Desktop plates are cropped to 16:10 by the card, so record at that ratio directly. */
const DESKTOP = { width: 1280, height: 800 };
/** Mi Peso is a phone app. Recorded portrait; process-demos pads it into the 16:10 plate. */
const PHONE = { width: 420, height: 860 };

/**
 * Playwright's recorder captures the page, not the OS cursor, so a demo recorded without
 * this looks like the UI is operating itself. A synthetic pointer follows the same input
 * events Playwright dispatches, which makes the interaction readable.
 */
const CURSOR = `
  (() => {
    const draw = () => {
      if (document.getElementById('__demo_cursor')) return;
      const el = document.createElement('div');
      el.id = '__demo_cursor';
      el.style.cssText = [
        'position:fixed', 'z-index:2147483647', 'top:0', 'left:0',
        'width:22px', 'height:22px', 'margin:-11px 0 0 -11px',
        'border-radius:50%', 'pointer-events:none',
        'background:rgba(99,102,241,0.32)',
        'border:1.5px solid rgba(99,102,241,0.9)',
        'box-shadow:0 0 0 4px rgba(99,102,241,0.12)',
        'transition:transform 90ms ease-out, background 120ms ease-out',
        'opacity:0',
      ].join(';');
      document.documentElement.appendChild(el);
      addEventListener('mousemove', (e) => {
        el.style.opacity = '1';
        el.style.left = e.clientX + 'px';
        el.style.top = e.clientY + 'px';
      }, true);
      addEventListener('mousedown', () => {
        el.style.transform = 'scale(0.7)';
        el.style.background = 'rgba(99,102,241,0.55)';
      }, true);
      addEventListener('mouseup', () => {
        el.style.transform = 'scale(1)';
        el.style.background = 'rgba(99,102,241,0.32)';
      }, true);
    };
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', draw);
    else draw();
  })();
`;

/** Moves the pointer to an element in visible steps so the motion reads on camera. */
async function point(page, locator, { steps = 22 } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
  await page.waitForTimeout(320);
}

async function click(page, locator) {
  await point(page, locator);
  await page.mouse.down();
  await page.waitForTimeout(90);
  await page.mouse.up();
}

/** Scrolls by wheel in small increments so the motion reads as scrolling, not jumping. */
async function glide(page, distance, { chunks = 14, pause = 55 } = {}) {
  const step = Math.round(distance / chunks);
  for (let i = 0; i < chunks; i++) {
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(pause);
  }
}

/** Types one character at a time; a pasted string reads as a cut, not as use. */
async function peck(page, text, delay = 130) {
  for (const ch of text) {
    await page.keyboard.type(ch);
    await page.waitForTimeout(delay);
  }
}

const flows = [
  {
    name: 'tickerlens',
    viewport: DESKTOP,
    url: 'https://tickerlens.oscarnavarro.dev/',
    /**
     * The pitch is "type a ticker, get a cited case", so the shot has to reach the
     * citation chips. Without them it is just another dashboard with a chart.
     */
    async run(page, mark) {
      await page.waitForTimeout(1200);
      await click(page, page.getByPlaceholder(/Busca un ticker/i).first());
      await peck(page, 'NVDA');
      await page.waitForTimeout(400);
      await click(page, page.getByRole('button', { name: /Analizar/i }).first());

      // Real retrieval takes 10-20s. Keeping a beat of the loading state is honest —
      // sitting through all of it is not, so the rest gets marked for the cutting room.
      await page.waitForTimeout(1400);
      mark('skip-start');
      // "Análisis de IA" is a static section header and shows up before a single token
      // does, so waiting on it cut to a half-written analysis. "Balance" is the last
      // block the model writes, which makes it the honest signal that streaming is done.
      await page.getByText(/^\s*Balance\s*$/).first().waitFor({ timeout: 120_000 });
      await page.waitForTimeout(900);
      mark('skip-end');
      await page.waitForTimeout(2200);
      await glide(page, 1200);
      await page.waitForTimeout(1200);

      /**
       * Fixed scroll distances overshot the analysis entirely and landed in the news
       * column. The prose block is over a thousand pixels tall, so anchor its heading to
       * the top of the viewport and crawl, keeping the citation chips beside each claim
       * on screen long enough to read at card size.
       */
      await page.evaluate(() => {
        const h = [...document.querySelectorAll('h1,h2,h3')].find((n) => /Análisis de IA/i.test(n.textContent));
        if (h) window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
      });
      await page.waitForTimeout(3000);
      await glide(page, 430, { chunks: 16, pause: 75 });
      await page.waitForTimeout(2600);
      await glide(page, 430, { chunks: 16, pause: 75 });
      await page.waitForTimeout(2400);
    },
  },
  {
    name: 'tvindicators',
    viewport: DESKTOP,
    url: 'https://tvbot.oscarnavarro.dev/',
    /**
     * Dashboard first for the equity curve, then Evaluación, which is the part that
     * actually distinguishes the project: live expectancy measured against backtest.
     */
    async run(page) {
      await page.waitForTimeout(2500);
      await glide(page, 1100);
      await page.waitForTimeout(1600);
      await glide(page, -1100);
      await page.waitForTimeout(700);
      await click(page, page.getByText('Evaluación', { exact: false }).first());
      await page.waitForTimeout(3000);
      await glide(page, 1500);
      await page.waitForTimeout(2200);
    },
  },
  {
    name: 'mipeso',
    viewport: PHONE,
    device: 'phone',
    // The app follows the system theme and its own landing is dark, as is this site.
    colorScheme: 'dark',
    url: 'https://weightlog.oscarnavarro.dev/app/',
    /**
     * "Two taps" is the claim, so the recording is two taps: enter a weight, watch the BMI
     * band resolve, then the calendar and the progress curve it feeds.
     */
    async run(page, mark) {
      // SQLite compiled to WebAssembly has to download and boot before anything paints,
      // so the take opens on a blank screen. Real, but not worth three seconds of the clip.
      mark('skip-start');
      await page.getByPlaceholder('00.0').first().waitFor({ timeout: 30_000 });
      await page.waitForTimeout(600);
      mark('skip-end');
      await page.waitForTimeout(1000);
      await click(page, page.getByPlaceholder('00.0').first());
      await peck(page, '62.5', 200);
      await page.waitForTimeout(500);
      await click(page, page.getByRole('button', { name: /Registrar/i }).first());
      await page.waitForTimeout(2600);
      await click(page, page.getByText('Calendario', { exact: false }).first());
      await page.waitForTimeout(2800);
      await click(page, page.getByText('Progreso', { exact: false }).first());
      await page.waitForTimeout(3000);
    },
  },
  {
    name: 'exposure',
    viewport: DESKTOP,
    // Its own UI is dark, like this site, so no theme override is needed.
    colorScheme: 'dark',
    url: 'https://exposure.oscarnavarro.dev/',
    /**
     * This one searches real people, so what it searches for is not an arbitrary choice.
     * The target is Oscar's own public GitHub handle: the only identifier whose subject
     * has consented to appearing in this recording, and one already linked from the
     * portfolio itself. Do not point this flow at anybody else, and never type anything
     * into the password verifier — that field is not part of the demo.
     */
    async run(page, mark) {
      await page.waitForTimeout(1400);
      await click(page, page.locator('textarea').first());
      await peck(page, 'oscardanielnc', 95);
      // The type-detection chip resolves on its own; it is worth a beat because
      // "I work out what kind of identifier this is" is a claim the card makes.
      await page.waitForTimeout(1700);
      await click(page, page.getByRole('button', { name: /Buscar todo/i }));

      // Thirteen collectors against live sources takes around 25 seconds.
      await page.waitForTimeout(1500);
      mark('skip-start');
      await page.getByText(/Hallazgos/i).first().waitFor({ timeout: 180_000 });
      await page.waitForTimeout(1200);
      mark('skip-end');

      /**
       * Hard limit, computed from this run rather than assumed.
       *
       * Searching Oscar's handle also returns name-collision matches: other real people
       * called Oscar Daniel, with their profile links, bios and follower counts. He
       * consented to appearing here; they did not. The result set changes between runs —
       * one search returned 16 profiles, the next returned 6 — so the mentions section
       * moves, and no fixed scroll distance can promise to stay above it.
       *
       * So measure where the first mention actually is and never let the bottom of the
       * frame reach it. If there is no safe room at all, the take simply does not scroll.
       */
      const ceiling = await page.evaluate(() => {
        const leaf = (re) =>
          [...document.querySelectorAll('*')]
            .filter((n) => n.children.length === 0 && re.test(n.textContent))
            .map((n) => n.getBoundingClientRect().top + scrollY);
        const mentions = leaf(/Mención en/i);
        const firstMention = mentions.length ? Math.min(...mentions) : Infinity;
        return Math.max(0, Math.floor(Math.min(firstMention, document.documentElement.scrollHeight) - innerHeight - 70));
      });

      await page.waitForTimeout(2800); // the score, the counts, the credentials verdict
      if (ceiling > 120) {
        await glide(page, Math.min(ceiling, 620), { chunks: 16, pause: 70 });
        await page.waitForTimeout(2600); // the sources panel: which collectors answered
      } else {
        await page.waitForTimeout(2600);
      }

      // Proof, in the take's own log, that the frame never reached a third party's row.
      const bottom = await page.evaluate(() => Math.round(scrollY + innerHeight));
      mark(`viewport-bottom-${bottom}-ceiling-${ceiling}`);
    },
  },
  {
    name: 'estudia',
    viewport: DESKTOP,
    url: 'https://study.oscarnavarro.dev/',
    needsAuth: true,
    /**
     * Signs in from the environment, never from a literal, and the whole sign-in sits
     * inside a skip so it never reaches the finished clip. That is belt and braces — the
     * field is a real password input and renders masked — but a recording is a file that
     * gets copied around, and the login is dead weight in the demo regardless.
     *
     * The product is a three-stage pipeline, so the clip walks all three: the material,
     * the summary written from it, and the exam generated out of that.
     */
    async run(page, mark) {
      // From frame zero: the take would otherwise open on two seconds of empty login form
      // while the app boots, which is both blank and beside the point.
      mark('skip-start', 0);
      await page.locator('#usuario').fill(process.env.ESTUDIA_USER);
      await page.locator('#clave').fill(process.env.ESTUDIA_PASSWORD);
      await page.getByRole('button', { name: /^Entrar$/i }).click();
      await page.getByText(/Nuevo tema/i).first().waitFor({ timeout: 60_000 });
      await page.waitForTimeout(900);
      mark('skip-end');

      await page.waitForTimeout(1700);
      await click(page, page.getByText('Sistema Cardiovascular').first());
      await page.getByRole('button', { name: /Tomar examen/i }).waitFor({ timeout: 60_000 });
      await page.waitForTimeout(2200);

      // The summary runs past six thousand pixels. Two screens is enough to show it is
      // real prose off real photographs rather than a stub.
      await glide(page, 1500, { chunks: 18, pause: 65 });
      await page.waitForTimeout(1800);
      await glide(page, 1500, { chunks: 18, pause: 65 });
      await page.waitForTimeout(1500);

      await click(page, page.getByRole('button', { name: /Tomar examen/i }));
      await page.waitForTimeout(2500);
      await click(page, page.getByRole('button', { name: /^Difícil$/i }));
      await page.waitForTimeout(1100);
      await click(page, page.getByRole('button', { name: /^Iniciar examen$/i }));

      // A fresh set takes over two minutes to formulate; a cached one returns at once.
      // Waiting on the question rather than on a duration handles both.
      await page.waitForTimeout(1600);
      mark('skip-start');
      await page.getByText(/Pregunta\s*1\s*\//i).first().waitFor({ timeout: 420_000 });
      mark('skip-end');

      await page.waitForTimeout(3800); // long enough to read the clinical vignette
      const answers = page.locator('main button').filter({ hasNotText: /oscar|Salir|Volver/i });
      const target = (await answers.count()) ? answers.first() : page.getByRole('button').nth(2);
      await click(page, target);
      await page.waitForTimeout(3400); // the grading is the whole point of the shot
    },
  },
];

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const selected = only.length ? flows.filter((f) => only.includes(f.name)) : flows;

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const flow of selected) {
  if (flow.needsAuth && !(process.env.ESTUDIA_USER && process.env.ESTUDIA_PASSWORD)) {
    console.log(`skip  ${flow.name} — set ESTUDIA_USER and ESTUDIA_PASSWORD to record it`);
    continue;
  }

  const tmp = join(outDir, `.tmp-${flow.name}`);
  await rm(tmp, { recursive: true, force: true });

  const context = await browser.newContext({
    ...(flow.device === 'phone' ? devices['Pixel 7'] : {}),
    viewport: flow.viewport,
    deviceScaleFactor: 1,
    recordVideo: { dir: tmp, size: flow.viewport },
    locale: 'es-ES',
    colorScheme: flow.colorScheme ?? 'light',
  });
  await context.addInitScript(CURSOR);

  const page = await context.newPage();

  /**
   * Timestamps for the processor, in seconds from the first frame. A flow marks the
   * stretches it wants cut — waiting on a real API is honest but unwatchable — and
   * process-demos drops them. Recording the marks beats hardcoding timecodes, which
   * would drift the moment an endpoint answered faster or slower.
   */
  const t0 = Date.now();
  const marks = [];
  /** `at` overrides the clock, which is how a flow cuts from the very first frame. */
  const mark = (name, at) => marks.push({ name, at: at ?? (Date.now() - t0) / 1000 });

  let error = null;
  try {
    await page.goto(flow.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await flow.run(page, mark);
  } catch (e) {
    error = e.message.split('\n')[0];
  }

  await context.close(); // flushes the video file to disk
  const [file] = await readdir(tmp);
  const dest = join(outDir, `${flow.name}.webm`);
  await rm(dest, { force: true });
  await rename(join(tmp, file), dest);
  await rm(tmp, { recursive: true, force: true });
  await writeFile(
    join(outDir, `${flow.name}.json`),
    JSON.stringify({ name: flow.name, viewport: flow.viewport, phone: flow.device === 'phone', marks }, null, 2) + '\n',
  );

  results.push({ demo: flow.name, size: `${flow.viewport.width}x${flow.viewport.height}`, status: error ?? 'ok' });
  console.log(`${error ? 'warn' : 'done'}  ${flow.name}${error ? ` — ${error}` : ''}`);
}

await browser.close();
console.table(results);
