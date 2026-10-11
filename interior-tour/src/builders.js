// Geometry helpers and parametric furniture. All dimensions are in feet;
// the apartment root group is scaled to metres.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as T from './textures.js';

// ---------------------------------------------------------------- materials
const std = (o) => new THREE.MeshStandardMaterial(o);

export function makeMaterials() {
  const tex = {
    marble: T.marbleFloor(),
    oak: T.wood('#c9a27a', '#8f6a45'),
    oakFloor: T.wood('#b58a5f', '#7a5534', true),
    walnut: T.wood('#6b4a32', '#3b2616'),
    herring: T.herringbone(),
    quartz: T.quartz(),
    calacatta: T.quartz('#f4f1ec', '#b39c7c'),
    darkStone: T.quartz('#2d2d2f', '#6c6a66'),
    subway: T.subway(),
    bath: T.bathTile(),
    bathFloor: T.bathTile('#8e8a84', '#6c6862'),
    jali: T.jali(),
  };
  const m = {
    wall: std({ color: '#efe9e0', roughness: 0.92 }),
    wallWarm: std({ color: '#e7dccd', roughness: 0.92 }),
    wallSage: std({ color: '#a7b29c', roughness: 0.9 }),
    wallTerracotta: std({ color: '#c08a6b', roughness: 0.9 }),
    wallBlue: std({ color: '#aebfc9', roughness: 0.9 }),
    wallTaupe: std({ color: '#cbbba7', roughness: 0.9 }),
    ceiling: std({ color: '#f7f4ef', roughness: 0.95 }),
    floor: std({ map: tex.marble, roughness: 0.18, metalness: 0.0 }),
    woodFloor: std({ map: tex.oakFloor, roughness: 0.45 }),
    deck: std({ map: tex.herring, roughness: 0.6 }),
    bathFloor: std({ map: tex.bathFloor, roughness: 0.4 }),
    bathWall: std({ map: tex.bath, roughness: 0.3 }),
    skirting: std({ color: '#d9d2c7', roughness: 0.6 }),
    oak: std({ map: tex.oak, roughness: 0.5 }),
    walnut: std({ map: tex.walnut, roughness: 0.45 }),
    lacquerWhite: std({ color: '#f1ece4', roughness: 0.22 }),
    matteGrey: std({ color: '#5c5f5e', roughness: 0.6 }),
    kitchenGreen: std({ color: '#33493f', roughness: 0.45 }),
    kitchenUpper: std({ color: '#ece6dc', roughness: 0.25 }),
    quartz: std({ map: tex.quartz, roughness: 0.15 }),
    calacatta: std({ map: tex.calacatta, roughness: 0.12 }),
    darkStone: std({ map: tex.darkStone, roughness: 0.2 }),
    subway: std({ map: tex.subway, roughness: 0.15 }),
    black: std({ color: '#1c1c1e', roughness: 0.4, metalness: 0.5 }),
    blackGlass: std({ color: '#0d0d0f', roughness: 0.05, metalness: 0.3 }),
    steel: std({ color: '#c8c9cb', roughness: 0.25, metalness: 0.9 }),
    brass: std({ color: '#c09a4e', roughness: 0.3, metalness: 1.0 }),
    chrome: std({ color: '#e6e7ea', roughness: 0.08, metalness: 1.0 }),
    ceramic: std({ color: '#fbfbf9', roughness: 0.12 }),
    glass: std({ color: '#cfe0e3', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }),
    mirror: std({ color: '#c6d0d4', roughness: 0.02, metalness: 1.0 }),
    sofaFabric: std({ map: T.fabric('#b9ae9c'), roughness: 0.95 }),
    sofaGreen: std({ map: T.fabric('#56695b'), roughness: 0.95 }),
    velvetRust: std({ map: T.fabric('#a4593a'), roughness: 0.8 }),
    velvetMustard: std({ map: T.fabric('#c49a3c'), roughness: 0.8 }),
    linen: std({ map: T.fabric('#f1ece3'), roughness: 0.95 }),
    linenGrey: std({ map: T.fabric('#9fa3a2'), roughness: 0.95 }),
    linenBlue: std({ map: T.fabric('#4f6478'), roughness: 0.95 }),
    linenSage: std({ map: T.fabric('#8d9c86'), roughness: 0.95 }),
    leatherTan: std({ color: '#9a6236', roughness: 0.55 }),
    cushionA: std({ map: T.fabric('#c9824f'), roughness: 0.9 }),
    cushionB: std({ map: T.fabric('#2f4f5f'), roughness: 0.9 }),
    cushionC: std({ map: T.fabric('#e4d7bf'), roughness: 0.9 }),
    curtain: std({ color: '#f3efe6', roughness: 1, transparent: true, opacity: 0.82, side: THREE.DoubleSide }),
    curtainDark: std({ color: '#7d7466', roughness: 1, side: THREE.DoubleSide }),
    rattan: std({ color: '#a8794a', roughness: 0.8, side: THREE.DoubleSide }),
    leaf: std({ color: '#3f6b3a', roughness: 0.7, side: THREE.DoubleSide }),
    leafLight: std({ color: '#6c8f4a', roughness: 0.7, side: THREE.DoubleSide }),
    pot: std({ color: '#d8cfc2', roughness: 0.8 }),
    potDark: std({ color: '#3a3532', roughness: 0.7 }),
    terracotta: std({ color: '#b5653e', roughness: 0.85 }),
    soil: std({ color: '#3b2a1e', roughness: 1 }),
    led: new THREE.MeshBasicMaterial({ color: '#ffe3b0' }),
    ledCool: new THREE.MeshBasicMaterial({ color: '#fff6e6' }),
    lampShade: std({ color: '#f5ead6', roughness: 0.9, emissive: '#ffcf8a', emissiveIntensity: 0.6 }),
    screen: new THREE.MeshBasicMaterial({ map: T.screen() }),
    jali: std({ color: '#3a2412', emissive: '#ffffff', emissiveMap: tex.jali, emissiveIntensity: 1.2, roughness: 0.6 }),
    jaliDoor: std({ map: tex.jali, roughness: 0.5, color: '#d9b98a' }),
    railing: std({ color: '#2a2a2c', roughness: 0.5, metalness: 0.6 }),
    grass: std({ color: '#86956b', roughness: 1 }),
    concrete: std({ color: '#b7b2aa', roughness: 0.95 }),
    building: std({ color: '#d8d1c4', roughness: 0.9 }),
    buildingDark: std({ color: '#9d978d', roughness: 0.9 }),
    tree: std({ color: '#4c6e3d', roughness: 1 }),
    trunk: std({ color: '#5a4330', roughness: 1 }),
    book1: std({ color: '#8c3b2f', roughness: 0.8 }),
    book2: std({ color: '#2e4a63', roughness: 0.8 }),
    book3: std({ color: '#d7c49e', roughness: 0.8 }),
    washer: std({ color: '#f4f4f2', roughness: 0.3 }),
    fridge: std({ color: '#b9bbbd', roughness: 0.3, metalness: 0.7 }),
  };
  m._art = [
    std({ map: T.painting('brush', ['#ece3d4', '#b07a55', '#d8b98f', '#6f7a63', '#3e4a4f']), roughness: 0.9 }),
    std({ map: T.painting('landscape', ['#efe7da', '#a9b2a6', '#7e8f86', '#56645f', '#e8d6bd']), roughness: 0.9 }),
    std({ map: T.painting('botanical', ['#f1eadc', '#8a9a6b', '#b9a274', '#4a4a3c', '#e8dcc6']), roughness: 0.9 }),
    std({ map: T.painting('botanical', ['#efe6d6', '#b98a68', '#8f9b78', '#5a4636', '#eadfcc']), roughness: 0.9 }),
  ];
  m._rug = {
    drawing: std({ map: T.rug('border', ['#d9cfbf', '#7a5a45', '#b08968']), roughness: 1 }),
    living: std({ map: T.rug('abstract', ['#cfc6b8', '#8a9a83', '#c58b62', '#e8e1d5']), roughness: 1 }),
    master: std({ map: T.rug('lines', ['#e6ded2', '#b88a6e', '#9aa79a']), roughness: 1 }),
    bed: std({ map: T.rug('border', ['#c9d3d8', '#5b7083', '#e7ecef']), roughness: 1 }),
  };
  return m;
}

// ---------------------------------------------------------------- geometry
// Re-map box UVs so a material's texture is applied at a fixed world scale
// (one texture tile = `scale` feet) instead of stretching per face.
function worldUV(geo, w, h, d, scale) {
  const uv = geo.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0] / scale, uv.getY(i) * dims[f][1] / scale);
    }
  }
  uv.needsUpdate = true;
}

const texScale = (mat) => (mat.map || mat.emissiveMap) && mat.map?.wrapS === THREE.RepeatWrapping ? (mat.userData.scale || 4) : 0;

export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
  const g = new THREE.BoxGeometry(w, h, d);
  const s = texScale(mat);
  if (s) worldUV(g, w, h, d, s);
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.set(x, y, z);
  if (parent) parent.add(mesh);
  return mesh;
}

// Axis-aligned box given min/max corners (architecture convenience).
export function slab(x0, y0, z0, x1, y1, z1, mat, parent) {
  return box(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), mat,
    (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent);
}

export function rbox(w, h, d, r, mat, x = 0, y = 0, z = 0, parent) {
  const g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.set(x, y, z);
  if (parent) parent.add(mesh);
  return mesh;
}

export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, parent, seg = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  mesh.position.set(x, y, z);
  if (parent) parent.add(mesh);
  return mesh;
}

export function sphere(r, mat, x = 0, y = 0, z = 0, parent, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  if (parent) parent.add(mesh);
  return mesh;
}

export function plane(w, h, mat, x, y, z, rx = 0, ry = 0, parent) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, 0);
  if (parent) parent.add(mesh);
  return mesh;
}

// Place a group at (x, z) on the floor, rotated about Y (degrees).
export function place(parent, g, x, z, rotDeg = 0, y = 0) {
  g.position.set(x, y, z);
  g.rotation.y = THREE.MathUtils.degToRad(rotDeg);
  parent.add(g);
  return g;
}

// ---------------------------------------------------------------- furniture
// Convention: furniture is built facing +z (front at +z), origin at the
// centre of its footprint on the floor.

export function sofa(m, { w = 7, d = 3.1, mat = m.sofaFabric, seats = 3, legs = m.black, cushions = [] } = {}) {
  const g = new THREE.Group();
  const armW = 0.55, baseH = 0.55, seatH = 1.45;
  box(w, 0.08, d - 0.2, legs, 0, 0.3, 0, g); // plinth shadow line
  rbox(w, baseH, d, 0.1, mat, 0, 0.6, 0, g);
  rbox(w - 2 * armW, 0.5, d - 0.25, 0.15, mat, 0, 0.6 + baseH / 2 + 0.2, 0, g).position.y = seatH - 0.1;
  const sw = (w - 2 * armW) / seats;
  for (let i = 0; i < seats; i++) {
    rbox(sw - 0.05, 0.45, d - 0.75, 0.18, mat, -w / 2 + armW + sw * (i + 0.5), seatH + 0.2, 0.3, g);
    const back = rbox(sw - 0.08, 1.35, 0.6, 0.25, mat, -w / 2 + armW + sw * (i + 0.5), seatH + 0.95, -d / 2 + 0.45, g);
    back.rotation.x = -0.12;
  }
  rbox(w, 1.7, 0.45, 0.15, mat, 0, 1.4, -d / 2 + 0.22, g);
  for (const sx of [-1, 1]) rbox(armW, 1.25, d, 0.18, mat, sx * (w / 2 - armW / 2), 1.2, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.06, 0.04, 0.33, legs, sx * (w / 2 - 0.3), 0.16, sz * (d / 2 - 0.3), g, 8);
  cushions.forEach((cm, i) => {
    const n = cushions.length;
    const x = (i - (n - 1) / 2) * ((w - 2 * armW) / n);
    const c = rbox(1.25, 1.25, 0.35, 0.15, cm, x, seatH + 1.0, -d / 2 + 0.95, g);
    c.rotation.x = -0.25; c.rotation.z = (i % 2 ? 0.08 : -0.08);
  });
  return g;
}

export function lSofa(m, { w = 8.5, d = 3.1, chaise = 5.5, mat = m.sofaGreen, cushions = [] } = {}) {
  const g = sofa(m, { w, d, mat, seats: 3, cushions });
  // chaise on the right (+x) side, extending forward
  const c = new THREE.Group();
  rbox(d, 0.55, chaise - d + 0.3, 0.1, mat, 0, 0.6, 0, c);
  rbox(d - 0.6, 0.45, chaise - d, 0.18, mat, -0.05, 1.55, 0, c);
  rbox(0.55, 1.25, chaise - d + 0.3, 0.18, mat, d / 2 - 0.27, 1.2, 0, c);
  c.position.set(w / 2 - d / 2, 0, d / 2 + (chaise - d) / 2 - 0.15);
  g.add(c);
  // the arm on that side is replaced by the chaise arm
  g.children.filter((ch) => ch.geometry?.parameters?.width === 0.55 && ch.position.x > 0).forEach((ch) => g.remove(ch));
  return g;
}

export function armchair(m, mat = m.velvetRust) {
  const g = new THREE.Group();
  rbox(2.6, 0.5, 2.6, 0.15, mat, 0, 1.15, 0.05, g);
  const back = rbox(2.6, 1.5, 0.5, 0.22, mat, 0, 1.9, -1.05, g);
  back.rotation.x = -0.15;
  for (const sx of [-1, 1]) rbox(0.4, 0.9, 2.4, 0.15, mat, sx * 1.25, 1.35, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const l = cyl(0.05, 0.035, 0.95, m.walnut, sx * 1.05, 0.47, sz * 1.0, g, 8);
    l.rotation.z = sx * 0.1; l.rotation.x = -sz * 0.1;
  }
  return g;
}

export function coffeeTableRound(m, r = 1.6, top = m.calacatta) {
  const g = new THREE.Group();
  cyl(r, r, 0.12, top, 0, 1.35, 0, g, 48);
  cyl(r * 0.45, r * 0.55, 1.29, m.walnut, 0, 0.65, 0, g, 32);
  return g;
}

export function nestingTables(m) {
  const g = new THREE.Group();
  cyl(1.5, 1.5, 0.1, m.darkStone, -0.5, 1.3, 0, g, 40);
  cyl(1.45, 1.45, 0.05, m.black, -0.5, 1.22, 0, g, 40);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    cyl(0.04, 0.04, 1.2, m.brass, -0.5 + Math.cos(a) * 1.2, 0.6, Math.sin(a) * 1.2, g, 6);
  }
  cyl(1.0, 1.0, 0.1, m.oak, 1.1, 1.0, 0.5, g, 40);
  cyl(0.6, 0.7, 0.95, m.oak, 1.1, 0.47, 0.5, g, 24);
  // decor
  cyl(0.35, 0.25, 0.6, m.ceramic, -0.9, 1.65, -0.3, g, 20);
  box(0.9, 0.12, 0.65, m.book2, -0.2, 1.41, 0.3, g);
  box(0.8, 0.1, 0.6, m.book3, -0.2, 1.52, 0.3, g);
  return g;
}

export function sideTable(m, mat = m.oak) {
  const g = new THREE.Group();
  box(1.6, 0.15, 1.3, mat, 0, 1.75, 0, g);
  box(1.6, 0.85, 1.3, mat, 0, 1.25, 0, g);
  box(1.4, 0.04, 0.02, m.brass, 0, 1.25, 0.66, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.1, 0.83, 0.1, m.black, sx * 0.7, 0.41, sz * 0.55, g);
  return g;
}

export function tableLamp(m) {
  const g = new THREE.Group();
  sphere(0.32, m.ceramic, 0, 0.32, 0, g, 1, 1.1, 1);
  cyl(0.03, 0.03, 0.5, m.brass, 0, 0.85, 0, g, 8);
  cyl(0.35, 0.5, 0.65, m.lampShade, 0, 1.3, 0, g, 24);
  return g;
}

export function floorLamp(m) {
  const g = new THREE.Group();
  cyl(0.6, 0.6, 0.08, m.black, 0, 0.04, 0, g, 24);
  cyl(0.04, 0.04, 5.2, m.brass, 0, 2.6, 0, g, 8);
  cyl(0.55, 0.7, 0.9, m.lampShade, 0, 5.1, 0, g, 24);
  return g;
}

export function bed(m, { w = 6, l = 6.75, frame = m.walnut, head = m.linenGrey, duvet = m.linen, throwMat = m.linenSage, pillows = [m.linen, m.linen], accent = [], headH = 3.4, wings = false } = {}) {
  const g = new THREE.Group();
  // frame sits with headboard at z = -l/2
  box(w + 0.3, 0.9, l + 0.2, frame, 0, 0.65, 0.05, g);
  box(w + 0.1, 0.18, l, m.black, 0, 0.12, 0.05, g);
  rbox(w, 0.85, l - 0.2, 0.15, m.linen, 0, 1.5, 0.05, g);
  // duvet draped over the lower two-thirds
  const dl = l * 0.72;
  rbox(w + 0.25, 0.25, dl, 0.1, duvet, 0, 1.95, l / 2 - dl / 2 + 0.12, g);
  for (const sx of [-1, 1]) box(0.08, 0.8, dl, duvet, sx * (w / 2 + 0.12), 1.5, l / 2 - dl / 2 + 0.12, g);
  box(w + 0.3, 0.8, 0.08, duvet, 0, 1.5, l / 2 + 0.25, g);
  rbox(w + 0.32, 0.28, 1.4, 0.1, throwMat, 0, 2.0, l / 2 - 1.0, g);
  // upholstered headboard with vertical channels
  const hw = w + 1.2, hh = headH;
  if (wings) for (const sx of [-1, 1]) rbox(0.6, hh + 0.4, 1.1, 0.2, head, sx * (hw / 2 + 0.25), (hh + 0.4) / 2 + 0.5, -l / 2 + 0.3, g);
  box(hw, hh, 0.3, frame, 0, hh / 2 + 0.6, -l / 2 - 0.1, g);
  const n = 8;
  for (let i = 0; i < n; i++) {
    rbox(hw / n - 0.06, hh - 0.6, 0.35, 0.15, head, -hw / 2 + (hw / n) * (i + 0.5), hh / 2 + 0.7, -l / 2 + 0.1, g);
  }
  pillows.forEach((pm, i) => {
    const px = (i - (pillows.length - 1) / 2) * (w / pillows.length);
    const p = rbox(w / pillows.length - 0.3, 0.55, 1.5, 0.25, pm, px, 2.25, -l / 2 + 1.1, g);
    p.rotation.x = -0.5;
  });
  accent.forEach((am, i) => {
    const px = (i - (accent.length - 1) / 2) * 1.3;
    const p = rbox(1.2, 1.1, 0.35, 0.15, am, px, 2.45, -l / 2 + 1.75, g);
    p.rotation.x = -0.35;
  });
  return g;
}

export function wardrobe(m, { w = 7, h = 8.5, d = 2, body = m.lacquerWhite, doors = 4, handle = m.brass, accentPanel = null } = {}) {
  const g = new THREE.Group();
  box(w, h, d, body, 0, h / 2, 0, g);
  const dw = w / doors;
  for (let i = 0; i < doors; i++) {
    const mat = accentPanel && (i === 1 || i === doors - 2) ? accentPanel : body;
    box(dw - 0.03, h - 0.5, 0.06, mat, -w / 2 + dw * (i + 0.5), h / 2 + 0.2, d / 2 + 0.03, g);
    // full-height profile handle
    const hx = -w / 2 + dw * (i + 0.5) + (i % 2 ? -1 : 1) * (dw / 2 - 0.12);
    box(0.05, 2.6, 0.08, handle, hx, 4.0, d / 2 + 0.09, g);
  }
  box(w, 0.25, d - 0.1, m.black, 0, 0.12, -0.05, g); // recessed plinth
  // loft shutters line
  box(w - 0.02, 0.02, 0.04, m.black, 0, h - 1.4, d / 2 + 0.07, g);
  return g;
}

// Fluted / slatted wood wall panel (centred on x, built on a wall plane at z=0 facing +z).
export function flutedPanel(m, w, h, mat = m.oak, pitch = 0.22) {
  const g = new THREE.Group();
  box(w, h, 0.08, m.walnut, 0, h / 2, 0.04, g);
  const n = Math.floor(w / pitch);
  for (let i = 0; i < n; i++) {
    const c = cyl(pitch * 0.42, pitch * 0.42, h, mat, -w / 2 + pitch * (i + 0.5), h / 2, 0.1, g, 8);
    c.scale.z = 0.6;
  }
  return g;
}

export function tvUnit(m, { w = 8, panelW = 6.5, panelH = 9.0, tv = 5.0, panel = 'fluted' } = {}) {
  const g = new THREE.Group();
  if (panel === 'marble') {
    // book-matched marble slab framed by walnut fins
    box(panelW, panelH, 0.12, m.calacatta, 0, panelH / 2, 0.06, g);
    for (const sx of [-1, 1]) box(0.35, panelH, 0.3, m.walnut, sx * (panelW / 2 + 0.17), panelH / 2, 0.15, g);
    box(panelW, 0.05, 0.1, m.led, 0, panelH - 0.2, 0.15, g);
  } else g.add(flutedPanel(m, panelW, panelH));
  // TV
  const tvW = tv * 0.87, tvH = tv * 0.49;
  box(tvW + 0.1, tvH + 0.1, 0.12, m.black, 0, 4.6, 0.32, g);
  plane(tvW, tvH, m.screen, 0, 4.6, 0.385, 0, 0, g);
  // floating console with fluted shutters
  box(w, 1.25, 1.5, m.walnut, 0, 1.45, 0.75, g);
  box(w, 0.06, 1.5, m.darkStone, 0, 2.1, 0.75, g);
  box(w - 0.3, 0.04, 0.04, m.led, 0, 0.82, 1.2, g); // underside LED glow
  for (let i = 0; i < 4; i++) box(w / 4 - 0.05, 1.1, 0.04, m.oak, -w / 2 + (w / 4) * (i + 0.5), 1.45, 1.52, g);
  // decor
  cyl(0.25, 0.3, 0.9, m.ceramic, w / 2 - 0.6, 2.58, 0.7, g);
  cyl(0.18, 0.18, 0.5, m.potDark, -w / 2 + 0.6, 2.38, 0.6, g);
  // shelf + LED on panel
  box(1.6, 0.08, 0.7, m.walnut, panelW / 2 + 1.2, 5.6, 0.4, g);
  box(1.6, 0.08, 0.7, m.walnut, panelW / 2 + 1.2, 4.2, 0.4, g);
  box(0.35, 0.8, 0.6, m.book2, panelW / 2 + 0.7, 4.65, 0.4, g);
  box(0.3, 0.7, 0.6, m.book1, panelW / 2 + 1.0, 4.6, 0.4, g);
  sphere(0.3, m.brass, panelW / 2 + 1.6, 5.95, 0.4, g);
  return g;
}

export function rug(mat, w, d, x, z, parent) {
  const r = box(w, 0.04, d, mat, x, 0.02, z, parent);
  return r;
}

export function wallArt(m, artMat, w, h) {
  const g = new THREE.Group();
  box(w + 0.2, h + 0.2, 0.12, m.walnut, 0, 0, 0.06, g);
  plane(w, h, artMat, 0, 0, 0.125, 0, 0, g);
  return g;
}

export function plant(m, { h = 4.5, pot = m.pot, r = 0.7, leaf = m.leaf, kind = 'fiddle' } = {}) {
  const g = new THREE.Group();
  cyl(r, r * 0.8, r * 1.6, pot, 0, r * 0.8, 0, g, 20);
  cyl(r * 0.92, r * 0.92, 0.05, m.soil, 0, r * 1.58, 0, g, 20);
  const base = r * 1.6;
  if (kind === 'fiddle') {
    cyl(0.04, 0.05, h - base, m.trunk, 0, base + (h - base) / 2, 0, g, 6);
    for (let i = 0; i < 44; i++) {
      const y = base + 0.6 + (i / 44) * (h - base - 0.6);
      const a = i * 2.4;
      const sz = rr(0.26, 0.4) * (1 - (i / 44) * 0.35);
      const leafMesh = sphere(sz, leaf, Math.cos(a) * 0.45, y, Math.sin(a) * 0.45, g, 1, 0.18, 1.5);
      leafMesh.rotation.y = -a; leafMesh.rotation.z = rr(0.2, 0.9);
    }
  } else if (kind === 'palm') {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const stem = cyl(0.02, 0.03, h - base, m.trunk, Math.cos(a) * 0.3, base + (h - base) / 2, Math.sin(a) * 0.3, g, 5);
      stem.rotation.z = Math.cos(a) * 0.25; stem.rotation.x = -Math.sin(a) * 0.25;
      const top = sphere(0.7, leaf, Math.cos(a) * 0.9, h - 0.2, Math.sin(a) * 0.9, g, 1.3, 0.15, 0.5);
      top.rotation.y = -a; top.rotation.z = Math.cos(a) * 0.4;
    }
  } else { // bushy: dense clusters of small leaves
    const n = Math.round(70 * (h / 3));
    for (let i = 0; i < n; i++) {
      const u = rr(0, 1), a = rr(0, Math.PI * 2), rad = Math.sqrt(u) * r * 1.3;
      const y = base + 0.2 + rr(0, h - base - 0.2) * (1 - u * 0.35);
      const lf = sphere(rr(0.14, 0.24), i % 3 ? leaf : m.leafLight, Math.cos(a) * rad, y, Math.sin(a) * rad, g, 1, 0.22, 1.9);
      lf.rotation.set(rr(-0.8, 0.8), a, rr(-0.6, 0.6));
    }
  }
  return g;
}
const rr = (a, b) => a + (b - a) * T.rand();

export function diningSet(m, { top = m.calacatta, chairA = m.linenGrey, chairB = m.velvetMustard } = {}) {
  const g = new THREE.Group();
  // table: long axis along z
  const L = 6.5, W = 3.4;
  rbox(W, 0.14, L, 0.06, top, 0, 2.45, 0, g);
  for (const sz of [-1, 1]) {
    box(0.25, 2.3, 2.2, m.walnut, 0, 1.15, sz * 2.0, g);
    box(2.4, 0.2, 0.3, m.walnut, 0, 0.1, sz * 2.0, g);
  }
  // chairs: 3 per side, plus none at ends (aisle)
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
    const c = diningChair(m, i === 1 ? chairB : chairA);
    place(g, c, sx * 2.25, (i - 1) * 2.0, sx > 0 ? -90 : 90);
  }
  // centrepiece
  cyl(0.5, 0.35, 0.2, m.ceramic, 0, 2.62, 0, g);
  sphere(0.18, m.terracotta, 0.12, 2.78, 0.05, g);
  sphere(0.16, m.terracotta, -0.1, 2.76, -0.1, g);
  cyl(0.06, 0.08, 0.5, m.brass, 0, 2.77, 1.5, g, 12);
  cyl(0.06, 0.08, 0.5, m.brass, 0, 2.77, -1.5, g, 12);
  return g;
}

export function diningChair(m, mat) {
  const g = new THREE.Group();
  rbox(1.55, 0.3, 1.5, 0.12, mat, 0, 1.55, 0, g);
  const back = rbox(1.55, 1.4, 0.25, 0.12, mat, 0, 2.35, -0.72, g);
  back.rotation.x = -0.12;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const l = cyl(0.045, 0.035, 1.42, m.walnut, sx * 0.62, 0.7, sz * 0.6, g, 8);
    l.rotation.x = sz * 0.06;
  }
  return g;
}

export function pendantCluster(m, n = 3, spread = 2.0, drop = 2.6, ceilingY = 10) {
  const g = new THREE.Group();
  box(spread * (n - 1) + 1.0, 0.08, 0.5, m.black, 0, ceilingY - 0.04, 0, g);
  for (let i = 0; i < n; i++) {
    const z = (i - (n - 1) / 2) * spread;
    cyl(0.01, 0.01, drop, m.black, 0, ceilingY - drop / 2, z, g, 4);
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.brass);
    shade.position.set(0, ceilingY - drop + 0.2, z);
    g.add(shade);
    sphere(0.22, m.led, 0, ceilingY - drop + 0.12, z, g);
  }
  return g;
}

export function chandelierRing(m, r = 1.6, ceilingY = 10, drop = 2.2) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 8, 64), m.brass);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = ceilingY - drop;
  g.add(ring);
  const ringLed = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 6, 64), m.led);
  ringLed.rotation.x = Math.PI / 2;
  ringLed.position.y = ceilingY - drop - 0.06;
  g.add(ringLed);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const wire = cyl(0.008, 0.008, drop, m.black, Math.cos(a) * r, ceilingY - drop / 2, Math.sin(a) * r, g, 3);
    void wire;
  }
  return g;
}

export function downlight(m, x, z, parent, ceilingY = 10) {
  cyl(0.2, 0.2, 0.03, m.ledCool, x, ceilingY - 0.02, z, parent, 16);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 4, 16), m.black);
  rim.rotation.x = Math.PI / 2; rim.position.set(x, ceilingY - 0.03, z);
  parent.add(rim);
}

export function curtain(m, w, h, mat = m.curtain, folds = 0) {
  const n = folds || Math.max(6, Math.round(w * 2.2));
  const geo = new THREE.PlaneGeometry(w, h, n * 4, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, Math.sin((x / w) * n * Math.PI * 2) * 0.12);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

export function desk(m) {
  const g = new THREE.Group();
  box(4.2, 0.12, 2.0, m.oak, 0, 2.45, 0, g);
  box(1.4, 0.6, 1.8, m.lacquerWhite, 1.3, 2.05, 0, g);
  for (const sx of [-1]) for (const sz of [-1, 1]) box(0.1, 2.4, 0.1, m.black, sx * 2.0, 1.2, sz * 0.9, g);
  box(0.1, 2.4, 1.9, m.black, 2.0, 1.2, 0, g);
  // laptop + lamp + books
  box(1.1, 0.04, 0.8, m.steel, -0.4, 2.53, 0.1, g);
  const scr = box(1.1, 0.75, 0.03, m.black, -0.4, 2.9, -0.32, g); scr.rotation.x = -0.2;
  cyl(0.18, 0.22, 0.05, m.black, -1.6, 2.53, -0.5, g, 12);
  const arm = cyl(0.025, 0.025, 1.2, m.black, -1.6, 3.1, -0.5, g, 6); arm.rotation.z = 0.3;
  sphere(0.17, m.brass, -1.42, 3.68, -0.5, g, 1, 0.6, 1);
  box(0.3, 0.7, 0.55, m.book1, 1.6, 2.86, -0.6, g);
  box(0.28, 0.65, 0.55, m.book3, 1.3, 2.84, -0.6, g);
  // chair
  const c = diningChair(m, m.linenBlue);
  place(g, c, -0.3, 1.5, 180);
  return g;
}

export function dresser(m) {
  const g = new THREE.Group();
  box(4.0, 2.6, 1.6, m.walnut, 0, 1.6, 0, g);
  for (let i = 0; i < 3; i++) box(3.9, 0.02, 0.02, m.black, 0, 0.75 + i * 0.85, 0.81, g);
  box(1.2, 0.04, 0.04, m.brass, 0, 1.2, 0.82, g);
  box(1.2, 0.04, 0.04, m.brass, 0, 2.05, 0.82, g);
  box(4.0, 0.3, 1.6, m.black, 0, 0.15, -0.05, g);
  // round mirror above
  const mir = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), m.mirror);
  mir.position.set(0, 5.3, -0.7); g.add(mir);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.06, 8, 64), m.brass);
  frame.position.set(0, 5.3, -0.7); g.add(frame);
  cyl(0.25, 0.2, 0.6, m.ceramic, 1.4, 3.2, 0, g);
  box(0.8, 0.12, 0.6, m.book3, -1.2, 2.96, 0.1, g);
  return g;
}

export function shoeCabinet(m) {
  const g = new THREE.Group();
  box(4.5, 2.6, 1.3, m.oak, 0, 1.8, 0, g); // floating
  for (let i = 0; i < 3; i++) box(1.48, 2.5, 0.04, m.lacquerWhite, -1.5 + i * 1.5, 1.8, 0.66, g);
  box(4.4, 0.04, 0.04, m.led, 0, 0.48, 0.4, g);
  box(4.5, 0.08, 1.3, m.darkStone, 0, 3.14, 0, g);
  const mir = box(2.4, 3.8, 0.06, m.mirror, 0, 5.4, -0.55, g);
  void mir;
  box(2.6, 4.0, 0.04, m.brass, 0, 5.4, -0.6, g);
  cyl(0.3, 0.25, 0.7, m.potDark, 1.6, 3.53, 0, g);
  return g;
}

export function lounger(m, mat = m.cushionC) {
  const g = new THREE.Group();
  box(2.3, 0.15, 2.3, m.walnut, 0, 1.0, 0, g);
  rbox(2.2, 0.35, 2.2, 0.12, mat, 0, 1.25, 0, g);
  const back = rbox(2.2, 1.6, 0.35, 0.12, mat, 0, 2.0, -0.95, g);
  back.rotation.x = -0.3;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.05, 0.05, 1.0, m.walnut, sx * 1.0, 0.5, sz * 1.0, g, 6);
  return g;
}

export function swing(m, ceilingY = 10) {
  // hanging egg chair
  const g = new THREE.Group();
  // egg-shaped rattan shell with the opening facing +z
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.5, 28, 18, 0.8 * Math.PI, 1.4 * Math.PI, 0.08 * Math.PI, 0.82 * Math.PI), m.rattan);
  shell.scale.set(1, 1.45, 1);
  shell.position.y = 2.9;
  g.add(shell);
  rbox(2.0, 0.35, 1.8, 0.15, m.cushionC, 0, 1.55, 0.1, g);
  cyl(0.03, 0.03, ceilingY - 4.6, m.black, 0, (ceilingY + 4.6) / 2, 0, g, 6);
  return g;
}

export function shelves(m, w = 3, n = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    box(w, 0.1, 0.9, m.walnut, 0, i * 1.3, 0, g);
    box(0.3, 0.75, 0.6, i % 2 ? m.book2 : m.book1, -w / 2 + 0.4, i * 1.3 + 0.43, 0, g);
    box(0.25, 0.7, 0.6, m.book3, -w / 2 + 0.7, i * 1.3 + 0.4, 0, g);
    cyl(0.2, 0.16, 0.5, i % 2 ? m.ceramic : m.terracotta, w / 2 - 0.5, i * 1.3 + 0.3, 0, g, 12);
  }
  return g;
}

// Classic wall panelling: raised moulding frames on a painted panel.
export function mouldingWall(m, w, h, mat = m.lacquerWhite) {
  const g = new THREE.Group();
  box(w, h, 0.05, mat, 0, h / 2, 0.025, g);
  const cols = Math.max(2, Math.round(w / 3.2));
  const fw = (w - 0.6 * (cols + 1)) / cols;
  const frame = (cx, y0, y1) => {
    const t = 0.12, d = 0.08;
    box(fw, t, d, mat, cx, y0, 0.08, g); box(fw, t, d, mat, cx, y1, 0.08, g);
    box(t, y1 - y0, d, mat, cx - fw / 2, (y0 + y1) / 2, 0.08, g); box(t, y1 - y0, d, mat, cx + fw / 2, (y0 + y1) / 2, 0.08, g);
  };
  for (let i = 0; i < cols; i++) {
    const cx = -w / 2 + 0.6 + fw / 2 + i * (fw + 0.6);
    frame(cx, 0.9, 2.9);
    frame(cx, 3.5, h - 0.9);
  }
  box(w, 0.15, 0.12, mat, 0, 3.2, 0.08, g); // dado rail
  return g;
}

// Walnut veneer wall with vertical grooves and an LED reveal at the top.
export function veneerWall(m, w, h, mat = m.walnut) {
  const g = new THREE.Group();
  const n = Math.round(w / 1.5), pw = w / n;
  for (let i = 0; i < n; i++) box(pw - 0.03, h - 0.4, 0.1, mat, -w / 2 + pw * (i + 0.5), (h - 0.4) / 2, 0.05, g);
  box(w, 0.06, 0.12, m.led, 0, h - 0.35, 0.08, g);
  box(w, 0.3, 0.14, mat, 0, h - 0.15, 0.07, g);
  return g;
}

export function ceilingFan(m, ceilingY = 10) {
  const g = new THREE.Group();
  cyl(0.05, 0.05, 1.0, m.brass, 0, ceilingY - 0.5, 0, g, 8);
  cyl(0.45, 0.4, 0.35, m.brass, 0, ceilingY - 1.15, 0, g, 24);
  sphere(0.3, m.lampShade, 0, ceilingY - 1.35, 0, g, 1, 0.5, 1);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Group();
    box(2.4, 0.04, 0.55, m.walnut, 1.6, 0, 0, b);
    b.position.y = ceilingY - 1.1;
    b.rotation.y = (i / 3) * Math.PI * 2 + 0.4;
    b.children[0].rotation.x = 0.12;
    g.add(b);
  }
  return g;
}

// Alternative design schemes applied to the shared material palette.
export const THEMES = ['warm', 'luxe'];
export function applyTheme(m, theme) {
  if (theme !== 'luxe') return;
  const set = (mat, color, extra = {}) => { mat.color.set(color); Object.assign(mat, extra); };
  const fab = (mat, color) => { mat.map = T.fabric(color); mat.needsUpdate = true; };
  // walls: warm cream with greige accents
  set(m.wall, '#efe6d8'); set(m.wallTerracotta, '#d9c9b2'); set(m.wallBlue, '#ddd2c2');
  set(m.wallTaupe, '#d6c6ae'); set(m.wallSage, '#ddd0bc');
  // upholstery: beige bouclé, camel and cream with muted olive/terracotta cushions
  fab(m.sofaFabric, '#d8ccb8'); fab(m.sofaGreen, '#d2c4ac'); fab(m.velvetRust, '#e4d9c7');
  fab(m.velvetMustard, '#b89670'); fab(m.linenGrey, '#d6cab6'); fab(m.linenBlue, '#b9a68c');
  fab(m.linenSage, '#cdbfa6'); fab(m.cushionA, '#a9714f'); fab(m.cushionB, '#7b7d5a'); fab(m.cushionC, '#efe6d6');
  set(m.curtainDark, '#b9a689');
  // kitchen: cream lacquer bases & tall units, warm-white uppers, marble backsplash
  set(m.kitchenGreen, '#e6dccb', { roughness: 0.25 });
  set(m.kitchenUpper, '#f1eadf');
  m.subway.map = m.calacatta.map; m.subway.userData.scale = 4; m.subway.needsUpdate = true;
  // rugs in sand and taupe
  m._rug.drawing.map = T.rug('abstract', ['#d9cebe', '#b8a48a', '#cbbca6', '#a48f78']);
  m._rug.living.map = T.rug('border', ['#d4c8b6', '#9c8670', '#e6dccd']);
  m._rug.master.map = T.rug('abstract', ['#ded3c3', '#bfae96', '#a8957f']);
  m._rug.bed.map = T.rug('lines', ['#e2d8c9', '#b29f86', '#c9b9a2']);
  for (const r of Object.values(m._rug)) r.needsUpdate = true;
}
