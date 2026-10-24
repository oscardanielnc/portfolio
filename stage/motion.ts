/**
 * What the avatar does: the clip queue (the visitor's journey), the head following the
 * pointer, and the lift that keeps every clip above the floor.
 */
import * as THREE from 'three';
import { floorNeed, type Rig } from './avatar';

export const IDLE = 'Long_Breathe_and_Look_Around';
/** Animation groups chosen by Oscar on 2026-10-23. */
export const GROUPS = {
  /** Entering the page or a section. */
  start: ['Skip_Forward', 'Walking', 'Running', 'Hello_Run'],
  /** A section was chosen: plays, then the section opens. */
  select: ['Motivational_Cheer', 'Sitting_Clap', 'Flying_Fist_Kick', 'Wall_Flip'],
  /** Home after 10 s without input, and every click on the avatar. */
  home: ['Tightrope_Walk', 'Double_Blade_Spin', 'Rising_Flying_Kick', 'Thomas_Flair_to_Jump_Up', 'Big_Wave_Hello', 'Punch_Combo_2'],
  /** Resting inside a section. */
  section: ['Lie_on_Chair_Sunbathe_and_Sleep', 'Swim_Idle'],
} as const;
export type Group = keyof typeof GROUPS;
/** Too short alone: they loop a few times. */
const REPEATS: Record<string, number> = { Walking: 3, Running: 4 };
/** A click must answer fast: select clips never pass ~2.6 s. */
export const SELECT_MAX_MS = 2600;
export const HOME_REST_MS = 10000;

export type Step = { clip: string; maxMs?: number } | { fn: () => void };

const MAX_YAW = THREE.MathUtils.degToRad(55);
const MAX_UP = THREE.MathUtils.degToRad(25);
const MAX_DOWN = THREE.MathUtils.degToRad(30);

export class Motion {
  readonly mixer: THREE.AnimationMixer;
  readonly actions = new Map<string, THREE.AnimationAction>();
  current: THREE.AnimationAction | null = null;
  base: THREE.AnimationAction;
  busy = false;
  /** When the avatar last started resting on its base clip. */
  baseSince = performance.now();
  private queue: Step[] = [];
  private deadline = Infinity;
  private lastPick: Partial<Record<Group, string>> = {};
  private readonly look = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, w: 1 };
  private lift = 0;
  private readonly spineAnim = new THREE.Quaternion();
  private spineSaved = false;

  constructor(private readonly root: THREE.Object3D, private readonly rig: Rig, clips: THREE.AnimationClip[]) {
    this.mixer = new THREE.AnimationMixer(root);
    for (const clip of clips) this.actions.set(clip.name, this.mixer.clipAction(clip));
    const idle = this.actions.get(IDLE);
    if (!idle) throw new Error(`avatar: clip ${IDLE} is missing`);
    this.base = idle;
    this.mixer.addEventListener('finished', (e) => { if (e.action === this.current) this.next(); });
  }

  start() {
    this.base.play();
    this.baseSince = performance.now();
  }

  /** A random clip of the group: never the last one picked, never the one already playing. */
  pick(group: Group) {
    const playing = this.current?.getClip().name;
    const all = GROUPS[group].filter((n) => this.actions.has(n));
    const fresh = all.filter((n) => n !== this.lastPick[group] && n !== playing);
    const pool = fresh.length ? fresh : all;
    const name = pool[Math.floor(Math.random() * pool.length)] ?? IDLE;
    this.lastPick[group] = name;
    return name;
  }

  run(steps: Step[]) {
    this.queue = steps.slice();
    this.busy = true;
    this.next();
  }

  private next(): void {
    const step = this.queue.shift();
    if (!step) return this.settle();
    if ('fn' in step) {
      step.fn();
      return this.next();
    }
    const a = this.actions.get(step.clip);
    if (!a) return this.next();
    a.reset();
    a.setLoop(THREE.LoopRepeat, REPEATS[step.clip] ?? 1);
    a.clampWhenFinished = true;
    a.timeScale = 1;
    this.deadline = Infinity;
    if (step.maxMs) {
      // up to 1.6x faster; if it is still longer, it is cut at the deadline with a crossfade
      const dur = a.getClip().duration * 1000;
      a.timeScale = Math.min(1.6, Math.max(1, dur / step.maxMs));
      this.deadline = performance.now() + step.maxMs;
    }
    const from = this.current ?? this.base;
    a.play();
    if (from !== a) from.crossFadeTo(a, 0.35, false);
    this.current = a;
  }

  private settle(): void {
    const from = this.current;
    this.current = null;
    this.busy = false;
    this.base.reset().play();
    if (from && from !== this.base) from.crossFadeTo(this.base, 0.45, false);
    this.baseSince = performance.now();
  }

  /** The clip the avatar rests on when nothing else plays. */
  setBase(name: string) {
    const next = this.actions.get(name);
    if (!next || next === this.base) return;
    const old = this.base;
    this.base = next;
    if (!this.current) {
      this.base.reset().play();
      old.crossFadeTo(this.base, 0.45, false);
    } else old.stop();
  }

  /** Names of the clips visible right now (a crossfade shows two). */
  visibleClips() {
    const out: string[] = [];
    for (const [name, a] of this.actions) if (a.isRunning() && a.getEffectiveWeight() > 0.02) out.push(name);
    return out;
  }

  /** Point the head at a screen position, relative to where the face is on screen. */
  lookAt(x: number, y: number, head: { x: number; y: number }) {
    const dx = x / window.innerWidth - head.x;
    this.look.tYaw = THREE.MathUtils.clamp(dx * 2.2, -1, 1) * MAX_YAW;
    const dy = 1 - y / window.innerHeight - head.y;
    this.look.tPitch = dy > 0 ? Math.min(dy * 2.2, 1) * MAX_UP : Math.max(dy * 2.0, -1) * MAX_DOWN;
  }

  /** With nobody moving the pointer, he looks around on his own. */
  wander() {
    if (Math.random() < 0.3) {
      this.look.tYaw = 0;
      this.look.tPitch = 0;
    } else {
      this.look.tYaw = (Math.random() * 2 - 1) * MAX_YAW * 0.7;
      this.look.tPitch = (Math.random() * 1.4 - 0.5) * MAX_UP * 0.6;
    }
  }

  update(dt: number, now: number) {
    // The mixer only writes a bone when its animated value changes, so the spine's extra
    // turn from the last frame is undone first; without this it accumulates into spins.
    if (this.spineSaved) this.rig.spine2.quaternion.copy(this.spineAnim);
    this.mixer.update(dt);
    if (this.current && now > this.deadline) {
      this.deadline = Infinity;
      this.next();
    }
    this.applyLook(dt);
    this.spineSaved = true;
    const need = floorNeed(this.root, this.rig);
    this.lift += (need - this.lift) * (1 - Math.exp(-dt * (need > this.lift ? 18 : 6)));
    this.root.position.y = this.lift;
  }

  private readonly q = new THREE.Quaternion();
  private readonly qLook = new THREE.Quaternion();
  private readonly qParent = new THREE.Quaternion();
  private readonly qRoot = new THREE.Quaternion();
  private readonly euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly up = new THREE.Vector3();

  private applyLook(dt: number) {
    const L = this.look;
    const k = 1 - Math.exp(-dt * 6);
    L.yaw += (L.tYaw - L.yaw) * k;
    L.pitch += (L.tPitch - L.pitch) * k;
    // How upright the torso is: when it lies down, flips or spins, the head goes with the body
    this.root.updateMatrixWorld(true);
    this.rig.spine2.getWorldQuaternion(this.q);
    const upright = this.up.set(0, 1, 0).applyQuaternion(this.q).y;
    // section rest clips (chair, swimming) lean a lot but must keep looking at the visitor
    const playing = (this.current ?? this.base).getClip().name;
    const minUp = (GROUPS.section as readonly string[]).includes(playing) ? 0.1 : 0.55;
    const wTarget = THREE.MathUtils.clamp((upright - minUp) / 0.3, 0, 1);
    L.w += (wTarget - L.w) * (1 - Math.exp(-dt * 8));
    // the spine follows a little
    this.spineAnim.copy(this.rig.spine2.quaternion);
    this.euler.set(0, L.yaw * 0.18 * L.w, 0);
    this.rig.spine2.quaternion.multiply(this.q.setFromEuler(this.euler));
    // neck at rest; the head gets an absolute orientation in world space, blended by uprightness
    this.rig.neck.quaternion.copy(this.rig.restNeck);
    this.root.updateMatrixWorld(true);
    this.root.getWorldQuaternion(this.qRoot);
    this.euler.set(-L.pitch, L.yaw, 0);
    this.qLook.setFromEuler(this.euler);
    const desired = this.qRoot.multiply(this.qLook);
    this.rig.head.parent!.getWorldQuaternion(this.qParent);
    const local = this.qParent.invert().multiply(desired);
    // never more than 90° from the neck: after a spin the body may face away, the head must not
    const ang = 2 * Math.acos(Math.min(1, Math.abs(this.rig.restHead.dot(local))));
    const t = ang > Math.PI / 2 ? Math.PI / 2 / ang : 1;
    this.rig.head.quaternion.copy(this.rig.restHead).slerp(local, L.w * t);
  }
}
