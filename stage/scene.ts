/**
 * Renderer, camera, lights and the floor of the stage.
 *
 * The canvas is transparent: the page shows through it, the dark stage at home and the
 * section panel when one is open. Everything here is created once, at boot.
 */
import * as THREE from 'three';

export function createScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50);

  scene.add(new THREE.HemisphereLight('#dfe9ff', '#0b1426', 1.1));
  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(1.6, 3.2, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { near: 0.5, far: 10, left: -1.5, right: 1.5, top: 2.2, bottom: -0.5 });
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  scene.add(key);
  // the rim light takes the colour of the section in front of the wheel
  const rim = new THREE.DirectionalLight('#9CCBFF', 2.6);
  rim.position.set(-2.5, 2.2, -2.5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight('#9CCBFF', 0.5);
  fill.position.set(-2, 1, 2.5);
  scene.add(fill);

  // Floor: a shadow catcher, a thin ring of light and a soft halo around it
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.ShadowMaterial({ opacity: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.64, 128),
    new THREE.MeshBasicMaterial({ color: '#9CCBFF', transparent: true, opacity: 0.55 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(ring);
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.64, 0.9, 128),
    new THREE.MeshBasicMaterial({ color: '#9CCBFF', transparent: true, opacity: 0.08, depthWrite: false }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.001;
  scene.add(halo);

  /** Size the drawing buffer and frame the avatar; portrait screens step the camera back. */
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const portrait = h > w;
    camera.position.set(0, 1.15, portrait ? 6.4 : 4.9);
    camera.lookAt(0, portrait ? 0.86 : 0.78, 0);
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, rim, floor, ring, halo, resize };
}

export type Stage = ReturnType<typeof createScene>;
