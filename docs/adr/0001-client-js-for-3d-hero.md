# 0001 — Client-side JavaScript for the 3D hero

- **Status:** Accepted. The React Three Fiber choice is replaced by [0002](0002-avatar-stage-outside-react.md)
- **Date:** 2026-10-22

## Context

The site ships no client JavaScript. `scripts/strip-hydration.mjs` removes React's
hydration payload and fails the build on any `'use client'`. The new home is a 3D
avatar in the centre of a rotating wheel (About, Projects, Experience, Stack) that
follows the pointer, and the Projects page draws a price line on scroll. None of that
works without JavaScript.

## Options

| Option | Verdict |
|---|---|
| React Three Fiber + GSAP in one client island | **Chosen.** Own code, fits Next and React, explainable in an interview |
| Spline scene | Rejected. Look-at comes built in, but less control and the code is not ours |
| Pre-rendered sprite of head angles | Rejected. Lighter, but no real 3D and no animations |

## Decision

- JavaScript runs only in the hero island and the Projects scroll scene
- Every section keeps its own URL and is plain static HTML, readable with JS off
- The 3D scene loads after the text; `prefers-reduced-motion` and no-JS get a still image
- The `strip-hydration` step is removed from `build` when the first client component
  lands. The guard is not weakened

## Consequences

- Bundle grows (three.js). Lighthouse is measured before and after; LCP must not regress
- Contact is a fixed button outside the wheel, so it never depends on the 3D scene
