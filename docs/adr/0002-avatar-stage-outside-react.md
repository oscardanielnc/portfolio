# 0002 — The avatar stage is a plain module outside React

- **Status:** Accepted. Replaces the "React Three Fiber + GSAP" choice of [0001](0001-client-js-for-3d-hero.md)
- **Date:** 2026-10-23

## Context

0001 accepted client JavaScript for the 3D hero and assumed React Three Fiber in a client
island. The stage was then built and approved as a prototype in plain three.js: avatar,
wheel, portal, section panel, dock and every animation rule. The site's build strips
React's runtime from the exported HTML, which saves ~90 kB brotli and about a second of
LCP on mobile.

## Options

| Option | Verdict |
|---|---|
| Port the prototype to React Three Fiber in a `'use client'` island | Rejected. React would have to hydrate the whole page again (+90 kB), and the approved behaviour would be rewritten, not moved |
| **three.js module outside React, linked from the static page** | **Chosen.** React stays build-time only; the stage is the tested prototype, typed and split into modules |
| Keep the prototype as a separate HTML file | Rejected. Loses both locales, SEO and the content files as the single source |

## Decision

- `stage/` holds the stage in TypeScript: `scene.ts` (renderer, lights, floor), `avatar.ts`
  (model, glasses, glowing lines, clip measurement), `motion.ts` (clip queue, look-at,
  floor lift), `sections.ts` (panel DOM, index, videos), `main.ts` (wheel, portal, layout)
- `scripts/build-stage.mjs` bundles it with esbuild into one content-hashed module
- The page is complete HTML without it: all four sections are in the markup, and the
  stage only rearranges them. Without JavaScript or WebGL the site reads top to bottom
- `strip-hydration.mjs` keeps its guard against `'use client'` and now allows exactly one
  kind of script in the output: `/stage/*`

## Consequences

- The stage script is ~630 kB minified (~150 kB brotli, mostly three.js) plus the 1.4 MB
  model, both cached forever under hashed names. They load after the text is on screen
- Content is still edited only in `content/`; the stage reads labels from a JSON block the
  page writes
- Plain TypeScript is the skill to explain it, not a 3D React framework
