# Avatar

The signature element of the site: a 3D caricature of Oscar that greets the visitor,
sits in the centre of the section wheel and always looks at the pointer.

## Look

| | |
|---|---|
| Style | Designer vinyl toy: oversized head (~45% of height), small body, smooth matte finish |
| Likeness | Recognisable face from the source photos: face shape, eyes, brows, nose |
| Glasses | Always on: thin black metal frame, squared-octagonal lenses, double bridge. **Modelled as a separate mesh**: thin wire frames do not survive image-to-3D |
| Hair | Short sides, textured top styled upward with slightly spiky volume |
| Mood | Relaxed developer, friendly with a slightly mischievous smile |
| Palette | Soft pastel blues with white or near-black. **No orange** |
| Outfit | White hoodie with pastel-blue lines that glow softly (emissive), navy joggers, white sneakers with a soft-blue sole line |
| Hands | Separate thumb on both hands, needed for the thumbs-up |
| Light | Only the blue lines emit light. The avatar lives on the dark hero stage (see direction.md) |

## Pipeline

```
photos → 2D concept sheet (iterate the look) → image-to-3D → rig → animations → optimise → GLB
```

| Step | Tool | Output |
|---|---|---|
| Concept | Image model with the photos + prompt | Turnaround sheet (look reference) + front view without glasses, arms 45° away from the body (3D input) |
| 3D | Image-to-3D (Meshy, Tripo, Hunyuan3D; best of several) | Textured mesh |
| Rig | Mixamo auto-rigger or the generator's own | Humanoid skeleton with neck, head, thumbs |
| Animations | Mixamo library, Blender for custom ones | Clips listed below |
| Optimise | `gltf-transform` (resample, 1024 px WebP textures, meshopt) | `assets/avatar/oscar-v2.glb` |

Raw photos and working files live outside the repo, in `../avatar-src/`.
Only the final GLB is committed. `scripts/build-stage.mjs` publishes it under a hashed name.

## Animations

Chosen by Oscar on 2026-10-23. One clip is picked at random from each group, never the same
one twice in a row. Groups live in `stage/motion.ts`.

| Group | When | Clips |
|---|---|---|
| Start | Arriving at the home page, or right after a section opens | Skip forward, walking (x3), running (x4), hello run |
| Select | A wheel option is clicked. Sped up to 1.6x at most and cut at 2.6 s, then the section opens | Motivational cheer, sitting clap, flying kick, wall flip |
| Home | After 10 s without input on the home page, and on every click on the avatar | Tightrope walk, double blade spin, rising flying kick, Thomas flair, big wave hello, punch combo 2 |
| Section rest | Base pose for the whole visit to a section, still following the pointer | Lie on chair, swim idle |
| Home rest | Base pose on the home page | Long breathe and look around |

Not used: sit-ups, breakdance, shield push, golf, wave for help 2 and 4. About 20 clips in
total and 6 per group at most; each adds 5–100 kB.

## Behaviour

- The head follows the pointer or the last touch, never more than 90° from the neck. Neck and
  head tracks are removed from the clips. When the torso lies down or flips, the head goes
  with the body. After 2.5 s without input he looks around on his own
- Scroll, swipe or the arrow keys rotate the wheel; a click opens the section through a
  portal that grows from the clicked title. Esc, the back button or the browser's back close it
- **The avatar is never cut and never covers text.** Every clip is measured once at load
  (all its frames, on the skinned mesh) and the camera fits the clips on screen into a dock:
  the bottom of the dark rail on wide screens, the left of the contact band on phones and
  upright tablets. A bigger clip shrinks him smoothly and he grows back after it. At home
  he only shrinks when the screen is too short for him and the front label (a phone held sideways)
- Every section has an address (`/#projects`); opening one directly skips the select clip
- `prefers-reduced-motion`: no select clip, the portal is instant, videos do not play by
  themselves. Without JavaScript or WebGL the page is the plain document

## Budget

| | Target |
|---|---|
| GLB | ≤ 2 MB (now 1.44 MB with 17 clips) |
| Triangles | ≤ 30k (now ~31k) |
| Textures | ≤ 2048 px (now 1024 px WebP) |

## Reference

- Head follows the mouse with neck and spine bones, Mixamo clips:
  https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/
- Wheel around a central object: https://guillaumecolombel.fr/
