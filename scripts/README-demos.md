# Demo recordings

The project cards used to show still screenshots. A screenshot proves a project exists;
it does not show that it works. These two scripts drive the **live deployments** with
Playwright and turn the result into small MP4s that the cards play in place of the plate.

Nothing here runs on Cloudflare. Recording and encoding happen locally, the output is
committed, and the build stays as fast as it was.

```
npm run demos            # record everything, then process it
npm run demos:record     # just record  → view/demos/*.webm  (gitignored, large)
npm run demos:process    # just encode  → public/demos/*.mp4 (committed, small)
```

`demos:record` accepts demo names, which is what you want while iterating on one flow:

```
npm run demos:record -- tickerlens     # then: npm run demos:process
```

`npm run demos -- tickerlens` does **not** work: npm appends the argument to the last
command in the chain, so the name reaches the processor instead of the recorder. Use the
two scripts separately when you are targeting one demo. The processor always re-encodes
everything it finds, which is cheap and keeps the output consistent.

## Requirements

- **Playwright + Chromium** — `npm install` then `npx playwright install chromium`.
- **ffmpeg** — `winget install Gyan.FFmpeg`. The processor looks on `PATH`, then in
  winget's package directory, so a shell opened before the install still works. Override
  with `FFMPEG_DIR` if it lives somewhere else.

## Credentials

Estudia is the only flow behind a login. It reads the account from the environment and
skips itself when the variables are missing, so no password is ever written into this
repository. Put them in `.env.local`, which is already gitignored — `demos:record` loads
it automatically:

```
ESTUDIA_USER=...
ESTUDIA_PASSWORD=...
```

Exposure Dashboard needs no account. An earlier version of this file claimed it was behind
a login; that was wrong, and came from grepping the page for "password" and matching its
**results** panel, `Contraseñas y credenciales`. It is recorded like any other demo.

## Adding or changing a flow

Flows live in `record-demos.mjs`. Each is a name, a viewport, a URL and a `run(page, mark)`
that drives the app. Three helpers exist because recordings read differently from tests:

- `click(page, locator)` moves a visible pointer to the element before pressing it. Tests
  teleport; a recording that teleports looks like the UI is operating itself.
- `peck(page, text)` types one character at a time. A pasted string reads as a cut.
- `glide(page, distance)` scrolls in small increments so motion reads as scrolling.

**`mark('skip-start')` / `mark('skip-end')` cut a stretch out of the finished clip.** Use
it for honest-but-unwatchable waiting: TickerLens really did take 102 seconds to retrieve
and write its NVDA analysis, and Mi Peso really does spend three seconds booting SQLite
out of WebAssembly. The marks are timestamps rather than hardcoded timecodes precisely
because those numbers change on every run.

Anchor a scroll to an element rather than to a pixel distance. Fixed distances worked
until TickerLens returned a longer analysis, and then the clip scrolled straight past the
one section worth showing.

## Encoding

`process-demos.mjs` holds a per-demo `crf`, because the cost of a frame depends on what is
in it: Mi Peso is flat dark panels and lands around 77 kB, while the dense light tables in
TickerLens and tvbot cost several times that. The plate renders about 544 px wide, so body
text in these clips is never read from the card — it needs to register as a wall of cited
analysis, not to be legible, and that is what buys the compression.

Portrait recordings are letterboxed into the 16:10 plate on `--bg-raised`, so a phone app
reads as a phone app instead of as a broken aspect ratio.

## How the cards play them

The site ships no JavaScript and `strip-hydration.mjs` fails the build if that ever stops
being true, so the player is just `<video autoplay muted loop playsinline preload="none">`.
Two consequences worth knowing:

- Browsers pause offscreen autoplaying video on their own, so only the card in view is
  decoding. This is free and needs no observer.
- Nothing can pause a video from CSS. Under `prefers-reduced-motion: reduce` the video is
  hidden and a still poster takes its place, which works because browsers do not autoplay
  a `display: none` video.

## Explainers

Kepler cannot be recorded: it is archived, so there is no longer anything running to point
a browser at. Its plate is authored instead of captured, as a
[HyperFrames](https://hyperframes.heygen.com) composition under `explainers/<name>/`.

```
cd explainers/kepler
npx hyperframes check     # lint + runtime + layout + motion + contrast
npx hyperframes render -o renders/kepler.mp4 -f 24 -q high
cd ../.. && npm run demos:process
```

`demos:process` picks up `explainers/<name>/renders/<name>.mp4` automatically and encodes
it to the same widths and the same budget as a recording, so the card cannot tell them
apart.

ffmpeg has to be on `PATH` for the HyperFrames CLI specifically — unlike `demos:process`,
it does not know about winget's install location. In a shell opened before the install:

```
export PATH="$PATH:$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin"
```

Two rules these compositions follow, and should keep following:

**No invented data.** Kepler's explainer uses only figures the project actually published —
seven sleeves, 3.4% against a 10% budget, 18 days live. There is no animated equity curve,
because a line that looks like real performance and is not is the one dishonest thing a
portfolio cannot afford. Each composition carries a permanent `SCHEMATIC · PUBLISHED
FIGURES` label for the same reason.

**Authored text is English.** The recordings are of Spanish-language apps, which is simply
what those apps are. Authored copy is a choice, and the site's default locale is English,
so it follows the default rather than the apps. The Spanish page currently shows the same
English explainer; a second render per locale is the fix if that ever matters enough.

Compositions set `fit: 'contain'` in `content/site.ts`. A long copy column stretches a
featured card, and the plate stretches with it — cropping a recording is harmless, but
cropping a diagram eats the words it was built around.

## Recording a tool that searches for people

Exposure Dashboard is the one flow where *what* it searches for is a privacy decision
rather than a staging choice, because the result is published on the site.

It searches Oscar's own PUCP address — the one already printed in the site's own footer.
That specific choice is what makes the recording safe.

The first attempt searched his GitHub handle instead, and that was the mistake. A handle
search matches on name, so it came back full of other real people called Oscar Daniel with
their TikTok, Instagram and Facebook profiles attached, and the mix changed on every run:
one search returned sixteen of his own accounts, the next returned none and ten
collisions. Clamping the scroll to stay above them did work, but it clamped so hard the
clip never reached the results and the card ended up showing statistics instead of the
product.

**An address belongs to one person, so the collision cannot happen.** Every row a mail
search returns is his. That is a property of the identifier rather than of a filter, which
is why it can be relied on, and it is why this flow scrolls freely through its results
where the handle version could not. If you ever point this flow at a handle, a name or a
document number, the clamp has to come back.

Each take records what was on screen when it finished — viewport bottom, page height and
row count — as a mark in its sidecar JSON, so a recording can be audited after the fact
instead of trusted.

Never type into the password verifier. That field is not part of the demo.
