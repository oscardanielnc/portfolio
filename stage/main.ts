/**
 * The avatar stage. Turns the static page into: the avatar in the centre of a rotating
 * wheel of the four sections, a portal that opens each section full screen, and the
 * avatar's dock beside the content. Loaded as one module after the HTML is on screen;
 * if WebGL is missing, the page stays as it is, fully readable.
 */
import * as THREE from 'three';
import { createScene } from './scene';
import { loadAvatar, measureClips, type Rig } from './avatar';
import { GROUPS, HOME_REST_MS, IDLE, Motion, SELECT_MAX_MS } from './motion';
import { reduceMotion, Sections } from './sections';

interface StageData { model: string; colors: string[]; copy: string; copied: string; selected: string; email: string }

const html = document.documentElement;
html.classList.add('js');   // the inline mark may have been withdrawn on a very slow load
const data = JSON.parse(document.getElementById('stage-data')?.textContent ?? '{}') as StageData;
const IDS = ['about', 'projects', 'experience', 'stack'];
const clamp = THREE.MathUtils.clamp;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);   // easeInOutCubic

/* ---------- Boot: without WebGL the page stays the readable static version ---------- */
const canvas = document.getElementById('stage') as HTMLCanvasElement;
let stage: ReturnType<typeof createScene>;
try {
  stage = createScene(canvas);
} catch {
  html.classList.remove('js');
  throw new Error('stage: WebGL is not available, keeping the static page');
}
const { renderer, scene, camera, rim, floor, ring, halo } = stage;
html.classList.add('stage-on');

const footer = document.getElementById('contact')!;
const hint = document.getElementById('hint')!;
const wheelNav = document.getElementById('wheel')!;
const wheelEls = [...wheelNav.querySelectorAll<HTMLAnchorElement>('a[data-go]')];
const portalRing = document.getElementById('portalRing')!;
const sections = new Sections({ go: (i, x, y) => switchSection(i, x, y), back: () => requestBack() });
const panel = sections.panel;
panel.hidden = true;

/* ---------- State ---------- */
let mode: 'home' | 'section' = 'home';
let avatar: THREE.Object3D | null = null;
let rig: Rig | null = null;
let motion: Motion | null = null;
let boxes = new Map<string, THREE.Box3>();
let lastInput = -1e9;
let wanderAt = 0;
const wheel = { k: 0, angle: 0, open: -1, lockUntil: 0, acc: 0 };   // k: integer steps, front = k mod 4
const view = { t: 0 };                                               // 0 = home layout, 1 = section layout
const placement = { from: 0, to: 0, start: 0, dur: 1000 };
const headScreen = { x: 0.5, y: 0.62 };

/* ---------- The journey ---------- */
function enterHome() {
  mode = 'home';
  motion?.setBase(IDLE);
  motion?.run([{ clip: motion.pick('start') }]);
}
/** A section was chosen on the wheel: a celebration, then the portal. One click is enough. */
function openSection(i: number) {
  if (mode === 'section' || wheel.open >= 0) return;
  wheel.open = i;
  wheelEls.forEach((el, j) => el.classList.toggle('chosen', j === i));
  ripple(0); ripple(0.25); ripple(0.5);
  history.pushState({ stage: true }, '', `#${IDS[i]}`);
  const open = () => {
    mode = 'section';
    if (motion) motion.setBase(motion.pick('section'));
    showPanel(i);
  };
  if (!motion || reduceMotion) { open(); return; }
  motion.run([{ clip: motion.pick('select'), maxMs: SELECT_MAX_MS }, { fn: open }, { clip: motion.pick('start') }]);
}
function showPanel(i: number, from?: { x: number; y: number }) {
  sections.show(i);
  panel.style.clipPath = 'circle(0px at 50% 50%)';
  panel.hidden = false;
  const r = wheelEls[i]?.getBoundingClientRect();
  const c = from ?? (r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : homeCenter());
  openPortal(c.x, c.y, 1, () => sections.focusTitle());
  document.body.classList.add('in-section');
  wheelNav.classList.add('off');
  hint.classList.add('off');
  startView(1);
}
function closeSection() {
  if (mode === 'home' || portal.active) return;
  wheelEls.forEach((el) => el.classList.remove('chosen'));
  const c = homeCenter();
  openPortal(c.x, c.y, 0, () => { panel.hidden = true; sections.pauseVideos(); });
  document.body.classList.remove('in-section');
  wheelNav.classList.remove('off');
  wheel.open = -1;
  startView(0);
  enterHome();
}
/** Back to the wheel. Through history when the section added an entry, so the browser's back button agrees. */
function requestBack() {
  if (history.state?.stage) history.back();
  else { history.replaceState(null, '', location.pathname); closeSection(); }
}
/** From one section to another: the same portal, opened where you clicked. */
function switchSection(i: number, x: number, y: number) {
  if (mode !== 'section' || portal.active) return;
  if (i === sections.current) { sections.scroller.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  wheel.open = i;
  turnTo(i);
  history.replaceState(history.state, '', `#${IDS[i]}`);
  sections.show(i);
  panel.style.clipPath = 'circle(0px at 50% 50%)';
  openPortal(x, y, 1, () => sections.focusTitle());
  if (motion) {
    motion.setBase(motion.pick('section'));
    motion.run([{ clip: motion.pick('start') }]);
  }
}
/** Open a section with no ceremony: a shared link, or the browser's own navigation. */
function openDirect(i: number) {
  wheel.open = i;
  turnTo(i);
  wheel.angle = -wheel.k * Math.PI / 2;
  mode = 'section';
  if (motion) motion.setBase(motion.pick('section'));
  const c = homeCenter();
  showPanel(i, c);
}
window.addEventListener('popstate', () => {
  const i = IDS.indexOf(location.hash.slice(1));
  if (i < 0) { if (mode === 'section') closeSection(); return; }
  if (mode === 'section') switchSection(i, innerWidth / 2, innerHeight / 2);
  else openDirect(i);
});
function avatarTap() {
  if (!motion || portal.active || (mode === 'home' && wheel.open >= 0)) return;   // not while a section is opening
  motion.run([{ clip: motion.pick('home') }]);                                   // every click starts a new clip at once
}
function homeRest(now: number) {
  if (!motion || mode !== 'home' || motion.busy) return;
  if (now - Math.max(motion.baseSince, lastInput) > HOME_REST_MS) motion.run([{ clip: motion.pick('home') }]);
}

/* ---------- Portal: the section opens as a growing circle with a glowing rim ---------- */
const portal = { active: false, cx: 0, cy: 0, maxR: 0, dir: 1, start: 0, dur: 1000, done: undefined as undefined | (() => void) };
function openPortal(cx: number, cy: number, dir: 0 | 1, done?: () => void) {
  const maxR = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40;
  Object.assign(portal, { active: true, cx, cy, maxR, dir, start: performance.now(), dur: reduceMotion ? 1 : dir ? 1000 : 850, done });
  updatePortal(performance.now());
}
function updatePortal(now: number) {
  if (!portal.active) return;
  const k = Math.min(1, (now - portal.start) / portal.dur);
  const f = portal.dir ? ease(k) : 1 - ease(k);
  const r = f * portal.maxR;
  panel.style.clipPath = `circle(${r.toFixed(1)}px at ${portal.cx.toFixed(1)}px ${portal.cy.toFixed(1)}px)`;
  portalRing.style.width = portalRing.style.height = `${(2 * r).toFixed(1)}px`;
  portalRing.style.transform = `translate(${(portal.cx - r).toFixed(1)}px, ${(portal.cy - r).toFixed(1)}px)`;
  portalRing.style.opacity = (Math.sin(Math.PI * k) * 0.95).toFixed(3);
  if (k >= 1) {
    portal.active = false;
    portalRing.style.opacity = '0';
    panel.style.clipPath = portal.dir ? 'none' : 'circle(0px at 50% 50%)';
    portal.done?.();
  }
}
const homeCenter = () => ({ x: innerWidth / 2, y: innerHeight * 0.48 });

/* ---------- Layout: shared by CSS (custom properties) and the avatar's dock ---------- */
const LAYOUT = { narrow: false, short: false, railW: 260, dockH: 260, dockW: 150, bandH: 140, safe: { b: 0, l: 0 } };
const safeProbe = document.createElement('div');
safeProbe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:0 0 env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
document.body.append(safeProbe);
function layoutVars() {
  const W = innerWidth, H = innerHeight, cs = getComputedStyle(safeProbe);
  LAYOUT.safe = { b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  // band layout on phones and on tablets held upright; a lean rail on short screens held sideways
  LAYOUT.narrow = W <= 760 || (H > W && W < 900);
  LAYOUT.short = !LAYOUT.narrow && H < 560;
  document.body.classList.toggle('lay-band', LAYOUT.narrow);
  document.body.classList.toggle('lay-short', LAYOUT.short);
  LAYOUT.railW = Math.round(clamp(W * 0.21, 230, 320));
  LAYOUT.dockH = Math.round(clamp(H * 0.32, 170, 290));
  LAYOUT.bandH = Math.round(clamp(H * 0.19, 124, 180));
  LAYOUT.dockW = Math.round(clamp(W * 0.4, 130, 260));
  const s = html.style;
  s.setProperty('--rail-w', `${LAYOUT.railW}px`);
  s.setProperty('--dock-h', `${LAYOUT.dockH}px`);
  s.setProperty('--band-h', `${LAYOUT.bandH}px`);
  s.setProperty('--dock-w', `${LAYOUT.dockW}px`);
}
new ResizeObserver(() => html.style.setProperty('--foot-real', `${footer.offsetHeight}px`)).observe(footer);
/** Where the avatar may stand inside a section, in screen pixels. Text never goes there. */
function dockRect() {
  const H = innerHeight, s = LAYOUT.safe;
  if (LAYOUT.narrow) {   // phones: left part of the contact band
    return { x0: 10 + s.l, x1: 10 + s.l + LAYOUT.dockW, y0: H - s.b - LAYOUT.bandH + 12, y1: H - s.b - 10 };
  }
  const y1 = H - footer.offsetHeight - 16;   // wide screens: bottom of the rail, never above its links
  const nav = panel.querySelector('.secnav')?.getBoundingClientRect();
  const top = nav && nav.height ? nav.bottom + 14 : 0;
  return { x0: 18 + s.l, x1: LAYOUT.railW - 18, y0: Math.min(y1 - 80, Math.max(y1 - LAYOUT.dockH, top)), y1 };
}

/* ---------- Placement: big in the centre at home, inside the dock in a section ---------- */
function startView(to: number) {
  Object.assign(placement, { from: view.t, to, start: performance.now(), dur: reduceMotion ? 1 : to ? 1000 : 900 });
}
const DEFAULT_BOX = new THREE.Box3(new THREE.Vector3(-0.45, 0, -0.3), new THREE.Vector3(0.45, 1.8, 0.3));
// The box being fitted follows the clips on screen: it grows at once and shrinks slowly
const fitBox = DEFAULT_BOX.clone();
const fitTarget = new THREE.Box3();
function updateFitBox(dt: number) {
  fitTarget.makeEmpty();
  for (const name of motion?.visibleClips() ?? []) { const b = boxes.get(name); if (b) fitTarget.union(b); }
  if (fitTarget.isEmpty()) fitTarget.copy(DEFAULT_BOX);
  const grow = 1 - Math.exp(-dt * 14), shrink = 1 - Math.exp(-dt * 2.5);
  for (const ax of ['x', 'y', 'z'] as const) {
    const lo = fitTarget.min[ax], hi = fitTarget.max[ax];
    fitBox.min[ax] += (lo - fitBox.min[ax]) * (lo < fitBox.min[ax] ? grow : shrink);
    fitBox.max[ax] += (hi - fitBox.max[ax]) * (hi > fitBox.max[ax] ? grow : shrink);
  }
}
const v3 = new THREE.Vector3();
/** Screen box of a world box at the camera's current projection. */
function screenBox(b: THREE.Box3) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let c = 0; c < 8; c++) {
    v3.set(c & 1 ? b.max.x : b.min.x, c & 2 ? b.max.y : b.min.y, c & 4 ? b.max.z : b.min.z).project(camera);
    const x = ((v3.x + 1) / 2) * innerWidth, y = ((1 - v3.y) / 2) * innerHeight;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}
const toScreen = (v: THREE.Vector3) => ({ x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight });
let homeZ = 1;
let labelHalf = 40;
const wheelRadius = () => (LAYOUT.narrow ? WHEEL_R * 0.62 : WHEEL_R);
function updateView(dt: number) {
  const now = performance.now();
  const k = Math.min(1, (now - placement.start) / placement.dur);
  view.t = placement.from + (placement.to - placement.from) * ease(k);
  const W = innerWidth, H = innerHeight, cx = W / 2, cy = H / 2;
  updateFitBox(dt);
  // 1) at zoom 1 without offset: where the feet land, and the screen box of the pose
  camera.clearViewOffset();
  camera.zoom = 1;
  camera.updateProjectionMatrix();
  const feet1 = toScreen(v3.set(0, 0, 0).project(camera));
  const s = screenBox(fitBox);
  // 2) section: the largest zoom that fits the pose in the dock, on its floor, centred
  const D = dockRect();
  const zoomS = Math.min((D.x1 - D.x0) / (s.x1 - s.x0), (D.y1 - D.y0) / (s.y1 - s.y0));
  const ox = cx + zoomS * ((s.x0 + s.x1) / 2 - cx) - (D.x0 + D.x1) / 2;
  const oy = cy + zoomS * (s.y1 - cy) - D.y1;
  const feetS = { x: cx + zoomS * (feet1.x - cx) - ox, y: cy + zoomS * (feet1.y - cy) - oy };
  // 3) home: shrink (never grow) when the resting avatar and the front label do not fit
  //    between the header and the footer, as on a phone held sideways
  const regTop = (document.querySelector('header.top')?.getBoundingClientRect().bottom ?? 0) + 6;
  const regBot = H - footer.offsetHeight - hint.offsetHeight - 20;
  const h = screenBox(boxes.get(IDLE) ?? DEFAULT_BOX);
  const front = toScreen(v3.set(0, WHEEL_Y, wheelRadius()).project(camera));
  const hy1 = Math.max(h.y1, front.y + labelHalf);
  homeZ = Math.min(1, (regBot - regTop) / (hy1 - h.y0));
  const t0 = cy + homeZ * (h.y0 - cy), b0 = cy + homeZ * (hy1 - cy);
  let dy = 0;
  if (b0 > regBot) dy = regBot - b0;
  if (t0 + dy < regTop) dy = regTop - t0;
  const feetH = { x: cx + homeZ * (feet1.x - cx), y: cy + homeZ * (feet1.y - cy) + dy };
  // 4) blend, with a soft arc on the way
  const t = view.t;
  const zoom = homeZ + (zoomS - homeZ) * t;
  const tx = feetH.x + (feetS.x - feetH.x) * t;
  const ty = feetH.y + (feetS.y - feetH.y) * t - Math.sin(Math.PI * t) * H * 0.05;
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
  const f = toScreen(v3.set(0, 0, 0).project(camera));
  camera.setViewOffset(W, H, f.x - tx, f.y - ty, W, H);
  ring.visible = halo.visible = t < 0.98;
  (halo.material as THREE.MeshBasicMaterial).opacity = 0.08 * (1 - t);
  (floor.material as THREE.ShadowMaterial).opacity = 0.35 - 0.1 * t;
  dock = D;
  if (rig) {
    // where the face is on screen, for the look-at; and the avatar's box, for clicks
    rig.head.getWorldPosition(v3);
    v3.y += 0.22;
    v3.project(camera);
    headScreen.x = (v3.x + 1) / 2;
    headScreen.y = (v3.y + 1) / 2;
    updateAvatarRect();
  }
}
let dock = { x0: 0, y0: 0, x1: 0, y1: 0 };

/* ---------- Clicking the avatar ---------- */
const avatarRect = { x0: 0, y0: 0, x1: 0, y1: 0 };
const RECT_BONES = ['mixamorigHeadTop_End', 'mixamorigLeftHand', 'mixamorigRightHand', 'mixamorigLeftToeBase', 'mixamorigRightToeBase', 'mixamorigHips', 'mixamorigHead'];
function updateAvatarRect() {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const n of RECT_BONES) {
    const b = rig?.all.get(n);
    if (!b) continue;
    const p = toScreen(b.getWorldPosition(v3).project(camera));
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  }
  const padX = (x1 - x0) * 0.18 + 6, padY = (y1 - y0) * 0.06 + 6;
  Object.assign(avatarRect, { x0: x0 - padX, x1: x1 + padX, y0: y0 - padY, y1: y1 + padY });
}
const onAvatar = (x: number, y: number) => !!rig && x >= avatarRect.x0 && x <= avatarRect.x1 && y >= avatarRect.y0 && y <= avatarRect.y1;
const isControl = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.('footer, #wheel a, a, button, .lang');
addEventListener('pointermove', (e) => html.classList.toggle('over-avatar', onAvatar(e.clientX, e.clientY) && !isControl(e.target)));
// inside a section the canvas lets clicks through, so the avatar is caught here first
document.addEventListener('click', (e) => {
  if (mode !== 'section' || !onAvatar(e.clientX, e.clientY) || isControl(e.target)) return;
  e.preventDefault();
  e.stopPropagation();
  avatarTap();
}, true);

/* ---------- Ripples: the floor reacts like water when a section is chosen ---------- */
const ripples: { m: THREE.Mesh; t: number }[] = [];
function ripple(delay: number) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96), new THREE.MeshBasicMaterial({ color: '#bfe0ff', transparent: true, opacity: 0, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.003;
  m.scale.setScalar(0.6);
  scene.add(m);
  ripples.push({ m, t: -delay });
}
function updateRipples(dt: number) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]!;
    r.t += dt;
    if (r.t < 0) continue;
    const k = r.t / 1.4;
    r.m.scale.setScalar(0.6 + k * 2.4);
    (r.m.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - k);
    if (k >= 1) {
      scene.remove(r.m);
      r.m.geometry.dispose();
      (r.m.material as THREE.Material).dispose();
      ripples.splice(i, 1);
    }
  }
}

/* ---------- The wheel: real links placed every frame on a 3D ring around the avatar ---------- */
const WHEEL_R = 1.35, WHEEL_Y = 0.32;
const frontIndex = () => ((wheel.k % 4) + 4) % 4;
const ringColor = new THREE.Color();
function turnTo(i: number) {
  let d = i - frontIndex();
  if (d > 2) d -= 4;
  if (d < -2) d += 4;
  wheel.k += d;
}
function step(dir: number) {
  if (mode !== 'home' || performance.now() < wheel.lockUntil) return;
  wheel.k += dir;
  wheel.lockUntil = performance.now() + 380;
  hint.classList.add('off');
}
function updateWheel(dt: number) {
  wheel.angle += (-wheel.k * Math.PI / 2 - wheel.angle) * (1 - Math.exp(-dt * 7));
  const f = frontIndex();
  wheelEls.forEach((el, i) => {
    const th = (i * Math.PI) / 2 + wheel.angle;
    const R = wheelRadius();
    const p = toScreen(v3.set(Math.sin(th) * R, WHEEL_Y, Math.cos(th) * R).project(camera));
    const depth = (Math.cos(th) + 1) / 2;   // 1 front, 0 back
    const sc = (0.32 + 0.68 * Math.pow(depth, 1.6)) * (el.classList.contains('chosen') ? 1.08 : 1) * homeZ;
    el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${sc.toFixed(3)}) skewX(-7deg)`;
    el.style.opacity = (0.08 + 0.92 * Math.pow(depth, 2.2)).toFixed(3);
    el.style.zIndex = String(Math.round(depth * 10));
    el.classList.toggle('front', i === f);
    el.tabIndex = i === f ? 0 : -1;
    el.setAttribute('aria-current', String(i === f));
  });
  // the light of the section in front tints the floor ring and the rim light
  ringColor.set(data.colors[wheel.open >= 0 ? wheel.open : f] ?? '#9CCBFF');
  const ringMat = ring.material as THREE.MeshBasicMaterial;
  ringMat.color.lerp(ringColor, 1 - Math.exp(-dt * 4));
  (halo.material as THREE.MeshBasicMaterial).color.copy(ringMat.color);
  rim.color.lerp(ringColor, 1 - Math.exp(-dt * 4));
}
wheelEls.forEach((el, i) => el.addEventListener('click', (e) => {
  e.preventDefault();
  if (mode !== 'home') return;
  turnTo(i);
  openSection(i);
}));
addEventListener('wheel', (e) => {
  if ((e.target as HTMLElement).closest?.('#panel, footer')) return;
  wheel.acc += e.deltaY + e.deltaX;
  if (Math.abs(wheel.acc) > 40) { step(Math.sign(wheel.acc)); wheel.acc = 0; }
}, { passive: true });
let swipe: { x: number; y: number } | null = null;
canvas.addEventListener('pointerdown', (e) => { swipe = { x: e.clientX, y: e.clientY }; });
addEventListener('pointerup', (e) => {
  if (!swipe) return;
  const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
  swipe = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 8 && onAvatar(e.clientX, e.clientY)) { avatarTap(); return; }
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) step(Math.abs(dx) > Math.abs(dy) ? -Math.sign(dx) : Math.sign(dy));
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mode === 'section') { requestBack(); return; }
  if (mode !== 'home') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1);
});

/* ---------- Look at the pointer or finger; wander when idle ---------- */
function pointer(e: PointerEvent) {
  lastInput = performance.now();
  motion?.lookAt(e.clientX, e.clientY, headScreen);
}
addEventListener('pointermove', pointer);
addEventListener('pointerdown', pointer);

/* ---------- Contact: copy the address, and keep the section when switching language ---------- */
for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  btn.hidden = false;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.email);
      btn.textContent = data.copied;
    } catch {
      const r = document.createRange();
      r.selectNodeContents(btn.previousElementSibling ?? btn);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
      btn.textContent = data.selected;
    }
    setTimeout(() => { btn.textContent = data.copy; }, 1800);
  });
}
for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-lang]')) {
  a.addEventListener('click', () => { a.href = a.pathname + location.hash; });
}

/* ---------- Loop ---------- */
function resize() {
  layoutVars();
  stage.resize();
  labelHalf = parseFloat(getComputedStyle(wheelEls[0] ?? document.body).fontSize) * 0.55;
}
addEventListener('resize', resize);
resize();
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const now = performance.now();
  if (motion && avatar) {
    if (now - lastInput > 2500 && now > wanderAt) { motion.wander(); wanderAt = now + 1200 + Math.random() * 1800; }
    motion.update(dt, now);
    homeRest(now);
    const glow = 1.3 + Math.sin(now / 625) * 0.35;
    avatar.traverse((o) => { const m = o.userData.glow as THREE.MeshStandardMaterial | undefined; if (m) m.emissiveIntensity = glow; });
  }
  updateRipples(dt);
  updatePortal(now);
  updateView(dt);
  updateWheel(dt);
  (ring.material as THREE.MeshBasicMaterial).opacity = (0.45 + Math.sin(now / 625) * 0.12) * (1 - view.t);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// A shared link straight into a section opens it at once; the avatar joins when loaded
const initial = IDS.indexOf(location.hash.slice(1));
if (initial >= 0) openDirect(initial);

/* ---------- The avatar ---------- */
loadAvatar(data.model)
  .then((m) => {
    avatar = m.root;
    rig = m.rig;
    scene.add(avatar);
    motion = new Motion(avatar, rig, m.clips);
    const names = [...new Set([...GROUPS.start, ...GROUPS.home, ...GROUPS.section, IDLE])];
    boxes = measureClips(avatar, rig, motion.mixer, motion.actions, names);
    motion.start();
    html.classList.add('stage-ready');
    if (mode === 'section') {
      motion.setBase(motion.pick('section'));
      motion.run([{ clip: motion.pick('start') }]);
    } else setTimeout(enterHome, 400);
    if (location.search.includes('debug')) {
      Object.assign(window, {
        __stage: {
          open: (i: number) => { turnTo(i); openSection(i); },
          switch: (i: number) => switchSection(i, innerWidth / 2, innerHeight / 2),
          play: (n: string) => motion?.run([{ clip: n }]),
          setBase: (n: string) => motion?.setBase(n),
          dock: () => dock,
          mode: () => mode,
        },
      });
    }
  })
  .catch((err: unknown) => {
    html.classList.add('stage-failed');
    console.error('stage: the avatar could not load', err);
  });
