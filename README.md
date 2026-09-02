# oscarnavarro.dev

Personal site and portfolio. Next.js 15 (App Router, TypeScript strict), Tailwind CSS v4,
statically exported to flat files and served from Cloudflare Pages.

No server, no API routes, no SSR. No runtime dependencies beyond React and Next.
No analytics, no tracking scripts. One typeface (Geist), self-hosted at build time by
`next/font` — the browser never contacts Google.

- English: `/`
- Spanish: `/es/`

## Build

```bash
npm ci
npm run build      # next build --turbopack, then scripts/strip-hydration.mjs → out/
```

The build runs **Turbopack**. Next's webpack builder crashes on Node 22 and newer inside
its WebAssembly hasher (`WasmHash._updateWithBuffer`), which made `npm run build` fail on
any current Node while still working on Cloudflare's Node 20. Turbopack builds on both.

`npm run build` ends by removing React's hydration payload from the exported HTML.
Nothing on this site is interactive in JavaScript — every control is a native anchor or a
CSS state — so the ~90 kB (brotli) of runtime Next ships would boot, hydrate a tree nobody
touches, and change nothing. Dropping it is worth about a second of LCP on mobile.

`scripts/strip-hydration.mjs` **fails the build** if it finds a `'use client'` directive
anywhere in `app/`, `components/`, `lib/` or `content/`, so a page whose JavaScript
silently does not run can never ship. If you add real interactivity, remove the
`&& node scripts/strip-hydration.mjs` from the `build` script — do not weaken the guard.

| | |
|---|---|
| **Build command** | `npm run build` |
| **Output directory** | `out` |
| **Node version** | 20 or newer (developed on 24) |
| **Install command** | `npm ci` |

`npm run preview` serves `out/` locally on <http://localhost:4173> the way Cloudflare Pages
does (directory indexes, Brotli/gzip, immutable caching for `/_next/static`). Use it for
honest Lighthouse numbers — a plain uncompressed static server understates performance.

## CVs

Two files, one per locale, both in `public/`:

| Locale | File |
|---|---|
| `/` | `Oscar-Navarro-CV.pdf` |
| `/es/` | `Oscar-Navarro-CV-ES.pdf` |

The paths live in `site.cv` in `content/site.ts`; each locale picks its own through `cvHref`.

## Project screenshots

`view/` holds the raw screenshots. `npm run shots` crops each one to 16:10 from the top and
writes two WebP widths per project into `public/projects/` — the cards crop to 16:10, so the
crop happens at build-prep time rather than being thrown away by CSS in the browser. The
output is committed; the Cloudflare build never processes an image.

Every project now leads with a recording rather than a screenshot, so these stills are the
fallback path: they stay in `content/site.ts` and still render for any card that has no
`video`.

## Demo recordings

Each project card plays a short muted clip of the software actually running. Screenshots
prove a project exists; these show that it works.

```bash
npm run demos            # record every live demo, then encode
npm run demos:record     # Playwright drives the live deployments → view/demos/ (gitignored)
npm run demos:process    # ffmpeg → public/demos/*.mp4 (committed, ~2.8 MB for all six)
```

Kepler has nothing left to record — it is archived — so its plate is authored instead, as a
HyperFrames composition under `explainers/`. `demos:process` encodes recordings and
explainers identically.

The player is plain HTML, because `strip-hydration.mjs` still guarantees no JavaScript
ships: `<video autoplay muted loop playsinline preload="none">` with a poster. Browsers
pause offscreen autoplaying video themselves, so only the card in view decodes.

Full detail, including the credentials contract and the rules the explainers follow, is in
[`scripts/README-demos.md`](scripts/README-demos.md).

## Response headers

`public/_headers` is copied verbatim into the deploy. It sets year-long immutable caching for
the content-hashed assets under `/_next/static` (Cloudflare Pages otherwise defaults to four
hours) plus HSTS, `X-Frame-Options`, and a referrer policy.

Two Cloudflare features must stay **off** for this site:

- **Web Analytics** (Pages project → Settings) injects a third-party tracking beacon.
- **Email Address Obfuscation** (zone → Scrape Shield) rewrites the footer `mailto:` into
  `[email protected]` and a decoder script, so the contact address is unreadable without JS.

## Editing content

All copy lives in three typed files and nowhere else:

- `content/site.ts` — name, email, links, technology list, and each project's demo/repo URLs
  and stack. Locale-independent.
- `content/en.ts` — English copy.
- `content/es.ts` — Spanish copy.

Both locale files implement `Content` from `content/types.ts`, so a field added to one is a
type error until it is added to the other. Adding a project means adding it to `projectRefs`
in `site.ts` and to the `projects` array in both locale files.

`components/site-page.tsx` renders a `Content` object and is shared by both routes. The two
routes are separate root layouts (`app/(en)/` and `app/(es)/`) purely so each can set its own
`<html lang>`; there is no i18n library.

## Social preview image

`public/og.png` (1200×630) and `app/apple-icon.png` are generated and **committed**:

```bash
npm run og
```

The generator (`scripts/generate-og.mjs`) uses `sharp`, a devDependency. It is deliberately
not part of `npm run build`, so the Cloudflare build never has to rasterise anything.
Re-run it if the name, headline or accent colour changes.

## Connecting Cloudflare Pages

### 1. Create the project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorise GitHub and pick `oscardanielnc/portfolio`.
3. Configure the build:
   - Production branch: `main`
   - Framework preset: **Next.js (Static HTML Export)** — or **None**, which is equivalent here
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: `/`
4. Under **Environment variables**, add `NODE_VERSION` = `20` (Cloudflare's default image is
   older than what this project needs).
5. **Save and Deploy.** The first build publishes to `portfolio.pages.dev`.

Every push to `main` redeploys. Pushes to other branches create preview deployments.

### 2. Apex domain — oscarnavarro.dev

`oscarnavarro.dev` is already a zone in the same Cloudflare account, which makes this a
two-click operation; no manual DNS record is needed.

1. Open the Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `oscarnavarro.dev` → **Continue** → **Activate domain**.
3. Cloudflare creates a proxied `CNAME` flattened at the apex:
   `oscarnavarro.dev → portfolio.pages.dev` (orange cloud on). Apex CNAME flattening is what
   makes a `CNAME` legal at the root.
4. Wait for the status to go from *Initializing* to **Active**. The certificate is issued
   automatically; this normally takes a few minutes.

If DNS for the zone is *not* on Cloudflare, add the record yourself instead:
`CNAME  @  portfolio.pages.dev` (or an `ALIAS`/`ANAME` if the registrar supports it).

### 3. www subdomain

Repeat step 2 with `www.oscarnavarro.dev`. That produces:

```
CNAME  www  portfolio.pages.dev   (proxied)
```

Then redirect `www` to the apex so there is one canonical host — the `<link rel="canonical">`
tags point at the apex, and serving both hosts unredirected splits SEO signals.

**Rules → Redirect Rules → Create rule** on the `oscarnavarro.dev` zone:

- Name: `www to apex`
- If: **Hostname** *equals* `www.oscarnavarro.dev`
- Then: **Dynamic** redirect
  - Expression: `concat("https://oscarnavarro.dev", http.request.uri.path)`
  - Status: **301**
  - Preserve query string: on

### 4. After the first deploy

- Confirm <https://oscarnavarro.dev/sitemap.xml> and `/robots.txt` resolve.
- Paste the URL into the LinkedIn Post Inspector to warm the Open Graph cache for `og.png`.
- Confirm `https://www.oscarnavarro.dev` 301s to the apex.

## What the site deliberately does not have

Skill percentage bars, animated counters, typewriter effects, particle backgrounds, hijacked
scrolling, a contact form, testimonials, client logos, or an empty blog. These were excluded
on purpose; please do not add them back.
