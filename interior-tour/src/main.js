import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeMaterials } from './builders.js';
import { buildApartment, buildSurroundings, H } from './apartment.js';
import { sky } from './textures.js';
import { cameraAt, labelAt, DURATION } from './tour.js';

const FT = 0.3048;
const params = new URLSearchParams(location.search);
const RENDER_MODE = params.has('render');
const EXPORT_MODE = params.has('export');
const W = +params.get('w') || window.innerWidth;
const Hh = +params.get('h') || window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: params.get('aa') !== '0', preserveDrawingBuffer: RENDER_MODE });
renderer.setPixelRatio(RENDER_MODE ? 1 : Math.min(devicePixelRatio, 2));
renderer.setSize(W, Hh);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
// Image-based reflections only on glossy materials: sampling the env map on every
// matte wall/fabric pixel nearly doubles software-rendering time for little visual gain.
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(66, W / Hh, 0.05, 2000);

// ---------------------------------------------------------------- build
const m = makeMaterials();
// name materials after their palette key so exported meshes stay identifiable
for (const [k, v] of Object.entries(m)) {
  if (v.isMaterial) v.name = k;
  else if (Array.isArray(v)) v.forEach((x, i) => { x.name = `${k}${i}`; });
  else for (const [k2, x] of Object.entries(v)) x.name = `${k}_${k2}`;
}
const { root, ceiling, lights, blobs } = buildApartment(m);
for (const mat of Object.values(m).flat()) {
  if (mat.isMeshStandardMaterial && (mat.roughness < 0.42 || mat.metalness > 0.4)) {
    mat.envMap = envMap;
    mat.envMapIntensity = 0.55;
  }
}

// soft contact-shadow blobs under furniture (the path-traced export gets real shadows)
if (!EXPORT_MODE) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.55, 'rgba(255,255,255,0.6)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  for (const b of blobs) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: tex, transparent: true, opacity: b.o, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(b.w * 1.25, b.d * 1.25), mat);
    p.rotation.x = -Math.PI / 2; p.rotation.z = b.rot;
    p.position.set(b.x, 0.03, b.z);
    p.userData.noMerge = true;
    p.renderOrder = 1;
    root.add(p);
  }
}

// Merge static meshes by material to keep draw calls low.
function mergeStatic(group) {
  group.updateMatrixWorld(true);
  const inv = group.matrixWorld.clone().invert();
  const buckets = new Map();
  const keep = [];
  group.traverse((o) => {
    if (!o.isMesh) return;
    if (o.userData.noMerge) { keep.push(o); return; }
    let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    if (!buckets.has(o.material)) buckets.set(o.material, []);
    buckets.get(o.material).push(geo);
  });
  const out = new THREE.Group();
  for (const [mat, geos] of buckets) {
    const mesh = new THREE.Mesh(mergeGeometries(geos, false), mat);
    mesh.name = mat.name;
    const transparent = mat.transparent || mat.isMeshBasicMaterial;
    mesh.castShadow = !transparent;
    mesh.receiveShadow = !mat.isMeshBasicMaterial;
    out.add(mesh);
  }
  for (const k of keep) { k.updateMatrixWorld(); const w = k.matrixWorld.clone(); out.add(k); k.matrix.copy(w); k.matrix.decompose(k.position, k.quaternion, k.scale); }
  return out;
}

const world = new THREE.Group();
world.scale.setScalar(FT);
scene.add(world);
const apt = mergeStatic(root);
const ceil = mergeStatic(ceiling);
world.add(apt, ceil);
const surroundings = buildSurroundings(m, sky());
world.add(surroundings);
surroundings.traverse((o) => { if (o.isMesh) o.receiveShadow = false; });

// ---------------------------------------------------------------- lights
scene.add(new THREE.HemisphereLight('#eef2f5', '#c2b39e', 1.35));
const sun = new THREE.DirectionalLight('#ffe2bd', 3.2);
sun.position.set(-6, 14, 14);
sun.target.position.set(6.3, 0, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
for (const l of lights.filter((l) => l.intensity >= 3.5)) {
  const p = new THREE.PointLight(l.color, l.intensity, l.distance * FT, 2);
  p.position.set(l.x * FT, l.y * FT, l.z * FT);
  scene.add(p);
}

// ---------------------------------------------------------------- tour
const label = document.getElementById('label');
const titleEl = label.querySelector('h1'), subEl = label.querySelector('p');
const fadeEl = document.getElementById('fade');
let ceilingShown = null;

function setCeiling(show) {
  if (show === ceilingShown) return;
  ceilingShown = show;
  ceil.visible = show;
  renderer.shadowMap.needsUpdate = true;
}

function applyTour(t) {
  const { pos, tgt } = cameraAt(t);
  camera.position.copy(pos).multiplyScalar(FT);
  camera.lookAt(tgt.clone().multiplyScalar(FT));
  setCeiling(pos.y < H + 1);
  const lab = labelAt(t);
  if (lab) { titleEl.textContent = lab.title; subEl.textContent = lab.sub; label.style.opacity = lab.opacity; }
  else label.style.opacity = 0;
  const fade = Math.max(0, 1 - t / 0.8, (t - (DURATION - 1.5)) / 1.5);
  fadeEl.style.opacity = Math.min(1, fade);
}

if (EXPORT_MODE) {
  // Export the model (metres) for the path-traced renders: apartment, ceiling and surroundings minus the sky dome.
  window.exportGLB = async () => {
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    apt.name = 'apartment'; ceil.name = 'ceiling'; surroundings.name = 'surroundings';
    surroundings.remove(surroundings.children[0]);
    const out = new THREE.Group();
    out.scale.setScalar(FT);
    out.add(apt, ceil, surroundings);
    const buf = await new GLTFExporter().parseAsync(out, { binary: true, maxTextureSize: 2048 });
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { glb: btoa(bin), lights };
  };
  window.ready = true;
} else if (RENDER_MODE) {
  document.body.classList.add('render');
  window.renderAt = (t) => { applyTour(t); renderer.render(scene, camera); window.__info = { ...renderer.info.render, calls: renderer.info.render.calls, programs: renderer.info.programs.length }; return true; };
  window.ready = true;
} else {
  // Interactive: play the guided tour, or switch to free orbit (dollhouse).
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.target.set(20.6 * FT, 0, 16.3 * FT);
  let playing = true, t = 0, last = performance.now();
  const slider = document.getElementById('scrub');
  const playBtn = document.getElementById('play');
  const modeBtn = document.getElementById('mode');
  slider.max = DURATION;
  slider.addEventListener('input', () => { t = +slider.value; });
  playBtn.addEventListener('click', () => { playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; });
  modeBtn.addEventListener('click', () => {
    controls.enabled = !controls.enabled;
    modeBtn.textContent = controls.enabled ? 'Guided tour' : 'Free orbit';
    document.body.classList.toggle('free', controls.enabled);
    if (controls.enabled) {
      camera.position.set(-10 * FT, 48 * FT, 52 * FT);
      controls.update(); label.style.opacity = 0; fadeEl.style.opacity = 0;
    }
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (controls.enabled) {
      controls.update();
      setCeiling(camera.position.y < H * FT);
    } else {
      if (playing) { t += dt; if (t > DURATION) t = 0; slider.value = t; }
      applyTour(t);
    }
    renderer.render(scene, camera);
  });
}
