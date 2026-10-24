/**
 * The avatar model: loading, clip preparation, glowing piping, glasses, and the
 * measurement of every clip's space so it can be fitted on screen without being cut.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/** Bones the code drives or measures. Mixamo names, sanitised by three.js. */
export interface Rig {
  head: THREE.Bone;
  neck: THREE.Bone;
  spine2: THREE.Bone;
  all: Map<string, THREE.Bone>;
  /** Rest pose of the head and neck, before any clip. */
  restHead: THREE.Quaternion;
  restNeck: THREE.Quaternion;
}

export async function loadAvatar(url: string) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;
  const all = new Map<string, THREE.Bone>();
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.frustumCulled = false;   // skinned bounds lie when the pose moves far from bind
    }
    if ((o as THREE.Bone).isBone) all.set(o.name, o as THREE.Bone);
  });
  const need = (name: string) => {
    const b = all.get(name);
    if (!b) throw new Error(`avatar: bone ${name} is missing`);
    return b;
  };
  const head = need('mixamorigHead');
  const neck = need('mixamorigNeck');
  const rig: Rig = {
    head,
    neck,
    spine2: need('mixamorigSpine2'),
    all,
    restHead: head.quaternion.clone(),
    restNeck: neck.quaternion.clone(),
  };
  for (const clip of gltf.animations) prepareClip(clip);
  addLightLines(root);
  addGlasses(head);
  return { root, rig, clips: gltf.animations };
}

/**
 * Head and neck tracks are removed (the look-at drives them), and the hips keep their
 * first-frame X and Z so every clip plays in place instead of walking off the stage.
 */
function prepareClip(clip: THREE.AnimationClip) {
  clip.tracks = clip.tracks.filter((t) => !/mixamorig(Neck|Head)\.quaternion/.test(t.name));
  for (const t of clip.tracks) {
    if (!/mixamorigHips\.position/.test(t.name)) continue;
    const v = t.values;
    const x0 = v[0] ?? 0;
    const z0 = v[2] ?? 0;
    for (let i = 0; i < v.length; i += 3) {
      v[i] = x0;
      v[i + 2] = z0;
    }
  }
}

/** The light-blue piping of the hoodie glows: an emissive mask built from its texture pixels. */
function addLightLines(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
    if (!mesh.isMesh || !mat?.map) return;
    const img = mat.map.image as CanvasImageSource & { width: number; height: number };
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i]!, g = p[i + 1]!, b = p[i + 2]!;
      const v = b > 150 && b - r > 28 && g > r ? 255 : 0;   // light blue
      p[i] = p[i + 1] = p[i + 2] = v;
      p[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    const mask = new THREE.CanvasTexture(c);
    mask.flipY = mat.map.flipY;
    mask.colorSpace = THREE.SRGBColorSpace;
    mat.emissive = new THREE.Color('#7fbcff');
    mat.emissiveMap = mask;
    mat.emissiveIntensity = 1.6;
    mat.needsUpdate = true;
    mesh.userData.glow = mat;
  });
}

/**
 * Oscar wears glasses; the generated model came without them, so they are modelled
 * here: two octagonal rims, lenses, a double bridge and temples back to the ears.
 */
function addGlasses(head: THREE.Bone) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: '#111318', metalness: 0.7, roughness: 0.3 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#dbe9ff', transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0, depthWrite: false,
  });
  const W = 0.0907, H = 0.064, C = 0.025, R = 0.0036;   // half width, half height, corner cut, wire radius
  const shape: [number, number][] = [
    [-W + C, H], [W - C, H], [W, H - C], [W, -H + C * 1.6], [W - C * 1.6, -H], [-W + C * 1.6, -H], [-W, -H + C * 1.6], [-W, H - C],
  ];
  const lens = (cx: number) => {
    const curve = new THREE.CatmullRomCurve3(shape.map(([x, y]) => new THREE.Vector3(cx + x, y, 0)), true, 'catmullrom', 0.05);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, R, 8, true), metal));
    const l = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(shape.map(([x, y]) => new THREE.Vector2(x, y)))), glass);
    l.position.set(cx, 0, -0.002);
    g.add(l);
  };
  const gap = 0.024;
  lens(-(W + gap));
  lens(W + gap);
  const bar = (a: THREE.Vector3, b: THREE.Vector3) =>
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 4, R * 0.9, 6), metal));
  bar(new THREE.Vector3(-gap, H - 0.004, 0), new THREE.Vector3(gap, H - 0.004, 0));
  bar(new THREE.Vector3(-gap, H * 0.25, 0.004), new THREE.Vector3(gap, H * 0.25, 0.004));
  const tx = 2 * W + gap;
  for (const s of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * tx, H * 0.55, 0),
      new THREE.Vector3(s * (tx + 0.04), H * 0.5, -0.06),
      new THREE.Vector3(s * (tx + 0.06), H * 0.4, -0.2),
      new THREE.Vector3(s * (tx + 0.055), H * 0.1, -0.27),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, R * 0.9, 6), metal));
  }
  g.traverse((o) => { o.castShadow = (o as THREE.Mesh).isMesh; });
  // placed in world space in front of the eyes, then parented to the head (which sits at the chin)
  head.updateWorldMatrix(true, false);
  head.add(g);
  g.position.copy(head.worldToLocal(new THREE.Vector3(0.003, 1.268, 0.31)));
  const hq = new THREE.Quaternion();
  head.getWorldQuaternion(hq);
  g.quaternion.copy(hq.invert());
  g.rotateX(-0.06);
}

/**
 * Parts that must stay above the floor, with their margins. Some clips were retargeted
 * with the hips below the floor; each frame the lowest part is measured and the avatar
 * is lifted (see motion.ts).
 */
export const FLOOR_PARTS: Record<string, number> = {
  mixamorigHips: 0.14, mixamorigSpine2: 0.16, mixamorigHead: 0.12, mixamorigHeadTop_End: 0.08,
  mixamorigLeftFoot: 0.06, mixamorigRightFoot: 0.06, mixamorigLeftToeBase: 0.03, mixamorigRightToeBase: 0.03,
  mixamorigLeftLeg: 0.06, mixamorigRightLeg: 0.06, mixamorigLeftHand: 0.04, mixamorigRightHand: 0.04,
  mixamorigLeftForeArm: 0.05, mixamorigRightForeArm: 0.05,
};

const vTmp = new THREE.Vector3();
/** How much the current pose must be lifted so nothing goes through the floor. */
export function floorNeed(root: THREE.Object3D, rig: Rig) {
  root.position.y = 0;
  root.updateMatrixWorld(true);
  let need = 0;
  for (const [name, margin] of Object.entries(FLOOR_PARTS)) {
    const b = rig.all.get(name);
    if (!b) continue;
    b.getWorldPosition(vTmp);
    need = Math.max(need, margin - vTmp.y);
  }
  return Math.max(0, need - 0.03);   // the standing pose's own headroom is not a lift
}

/**
 * The space every clip takes, measured once: all its frames, on the real skinned mesh,
 * with the same floor lift the live loop applies. The layout fits these boxes on
 * screen, which is what keeps the chair, the swim or a flying kick from being cut.
 */
export function measureClips(root: THREE.Object3D, rig: Rig, mixer: THREE.AnimationMixer, actions: Map<string, THREE.AnimationAction>, names: string[]) {
  const boxes = new Map<string, THREE.Box3>();
  const v = new THREE.Vector3();
  const meshes: THREE.SkinnedMesh[] = [];
  root.traverse((o) => { if ((o as THREE.SkinnedMesh).isSkinnedMesh) meshes.push(o as THREE.SkinnedMesh); });
  for (const name of names) {
    const a = actions.get(name);
    if (!a) continue;
    const dur = a.getClip().duration;
    const box = new THREE.Box3();
    mixer.stopAllAction();
    a.reset();
    a.setLoop(THREE.LoopRepeat, Infinity);
    a.play();
    const N = 18;
    for (let i = 0; i <= N; i++) {
      a.time = (dur * i) / N;
      mixer.update(0);
      rig.neck.quaternion.copy(rig.restNeck);
      rig.head.quaternion.copy(rig.restHead);
      root.position.y = floorNeed(root, rig);
      root.updateMatrixWorld(true);
      for (const m of meshes) {
        const count = m.geometry.attributes.position!.count;
        for (let j = 0; j < count; j += 5) box.expandByPoint(m.getVertexPosition(j, v).applyMatrix4(m.matrixWorld));
      }
    }
    // room for the head turning towards the pointer
    box.min.x -= 0.07; box.max.x += 0.07; box.min.z -= 0.07; box.max.z += 0.07; box.max.y += 0.03;
    boxes.set(name, box);
  }
  mixer.stopAllAction();
  root.position.y = 0;
  return boxes;
}
