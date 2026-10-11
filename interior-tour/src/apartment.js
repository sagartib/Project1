// The 3 BHK floor plan (BUA 1890 sft, carpet 1455 sft) and its interior design.
// Coordinates are in feet: x runs west -> east, z runs north -> south, y is up.
// The main entrance is on the west wall of the drawing room (the "W ->" arrow).
import * as THREE from 'three';
import * as B from './builders.js';

export const H = 10; // floor to ceiling
const OUT = 0.75; // external wall thickness
const IN = 0.4; // internal wall thickness

// Room footprints used for floors, labels and lights.
export const ROOMS = {
  bed2: { name: 'Bed Room 2', size: `14'0" x 10'4½"`, x0: 0, x1: 14.3, z0: 0, z1: 10.6 },
  toiletTop: { name: 'Common Toilet', size: `5'3" x 8'6"`, x0: 14.3, x1: 19.9, z0: 0, z1: 8.5 },
  pooja: { name: 'Pooja Room', size: `4'1½" x 6'1½"`, x0: 19.9, x1: 24.6, z0: 0, z1: 6.1 },
  bed3: { name: 'Bed Room 3', size: `13'1½" x 10'4½"`, x0: 24.6, x1: 37.0, z0: 0, z1: 10.6 },
  balcony: { name: 'Balcony', size: `4'3" wide`, x0: 37.0, x1: 41.3, z0: 0, z1: 10.6 },
  drawing: { name: 'Drawing Room', size: `14'7½" x 10'10½"`, x0: 0, x1: 14.3, z0: 10.6, z1: 21.6 },
  dining: { name: 'Dining', size: `10'4½" x 14'9"`, x0: 14.3, x1: 24.6, z0: 10.6, z1: 25.4 },
  living: { name: 'Living Room', size: `10'9" x 10'10½"`, x0: 24.6, x1: 35.3, z0: 10.6, z1: 21.6 },
  sitout: { name: 'Sit Out', size: `6'1½" x 10'10½"`, x0: 35.3, x1: 41.3, z0: 10.6, z1: 21.6 },
  master: { name: 'Master Bedroom', size: `14'3" x 10'10½"`, x0: 0, x1: 14.3, z0: 21.6, z1: 32.6 },
  toilet1: { name: 'Master Toilet', size: `6'0" x 7'0"`, x0: 14.3, x1: 20.3, z0: 25.4, z1: 32.6 },
  toilet2: { name: 'Toilet', size: `4'6" x 7'0"`, x0: 20.3, x1: 24.6, z0: 25.4, z1: 32.6 },
  kitchen: { name: 'Modular Kitchen', size: `12'1½" x 10'10½"`, x0: 24.6, x1: 37.0, z0: 21.6, z1: 32.6 },
  utility: { name: 'Utility', size: `4'3" wide`, x0: 37.0, x1: 41.3, z0: 21.6, z1: 32.6 },
};

export function buildApartment(m) {
  const root = new THREE.Group(); // static, merged later
  const ceiling = new THREE.Group(); // hidden in the dollhouse view
  const lights = [];
  const blobs = [];

  m.subway.userData.scale = 2;
  m.jaliDoor.userData.scale = 0.8;
  m.bathWall.userData.scale = 4;

  // ------------------------------------------------------------ floors
  const floorMat = { floor: m.floor, wood: m.woodFloor, bath: m.bathFloor, deck: m.deck };
  function floor(x0, z0, x1, z1, mat, y = 0) {
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    geo.rotateX(-Math.PI / 2);
    geo.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 4, p.getZ(i) / 4);
    root.add(new THREE.Mesh(geo, mat));
  }
  B.slab(-12, -1.0, -2, 44, -0.01, 35, m.concrete, root); // structural slab + corridor
  floor(0, 10.6, 35.3, 21.6, floorMat.floor); // drawing + dining + living
  floor(14.3, 21.6, 24.6, 25.4, floorMat.floor); // passage
  floor(14.3, 8.5, 24.6, 10.6, floorMat.floor); // wash area
  floor(19.9, 0, 24.6, 8.5, floorMat.floor); // pooja + front
  floor(0, 0, 14.3, 10.6, floorMat.wood); // bed 2
  floor(24.6, 0, 37.0, 10.6, floorMat.wood); // bed 3
  floor(0, 21.6, 14.3, 32.6, floorMat.wood); // master
  floor(24.6, 21.6, 37.0, 32.6, floorMat.floor); // kitchen
  floor(14.3, 0, 19.9, 8.5, floorMat.bath, 0.005);
  floor(14.3, 25.4, 24.6, 32.6, floorMat.bath, 0.005);
  floor(35.3, 10.6, 41.3, 21.6, floorMat.deck, 0.005);
  floor(37.0, 0, 41.3, 10.6, floorMat.deck, 0.005);
  floor(37.0, 21.6, 41.3, 32.6, floorMat.bath, 0.005);
  floor(-10, 9.5, 0, 17.5, m.floor); // common corridor outside the main door

  // ------------------------------------------------------------ walls
  // wall(axis, fixed, from, to, thickness, openings[]) — axis 'x' runs along x at z=fixed.
  // opening: [a, b, sill, head]
  function wall(axis, c, a0, a1, t, openings = [], mat = m.wall) {
    const ops = openings.slice().sort((p, q) => p[0] - q[0]);
    const piece = (a, b, y0, y1) => {
      if (b - a < 1e-3 || y1 - y0 < 1e-3) return;
      if (axis === 'x') B.slab(a, y0, c - t / 2, b, y1, c + t / 2, mat, root);
      else B.slab(c - t / 2, y0, a, c + t / 2, y1, b, mat, root);
    };
    let cur = a0;
    for (const [a, b, sill, head] of ops) {
      piece(cur, a, 0, H);
      piece(a, b, 0, sill);
      piece(a, b, head, H);
      cur = b;
    }
    piece(cur, a1, 0, H);
  }
  const win = (a, b, sill = 2.5, head = 7.5) => [a, b, sill, head];
  const door = (a, b, head = 7.25) => [a, b, 0, head];

  // external
  wall('x', 0, -OUT / 2, 41.3 + OUT / 2, OUT, [win(4.2, 9.2), win(16.1, 18.1, 6.5, 8.0), win(27.5, 32.5)]);
  wall('x', 32.6, -OUT / 2, 41.3 + OUT / 2, OUT, [win(4.8, 9.8), win(16.3, 18.3, 6.5, 8.0), win(21.5, 23.5, 6.5, 8.0), win(28.8, 33.3, 3.6, 7.0)]);
  wall('z', 0, 0, 32.6, OUT, [door(11.8, 15.2, 7.6)]);
  // east side: parapet + glass railing for balcony, sit-out and utility
  B.slab(41.3 - 0.25, 0, 0, 41.3 + 0.25, 1.4, 32.6, m.wall, root);
  B.slab(41.3 - 0.03, 1.4, 0.2, 41.3 + 0.03, 3.6, 32.4, m.glass, root);
  B.slab(41.3 - 0.12, 3.6, 0, 41.3 + 0.12, 3.75, 32.6, m.railing, root);
  for (let z = 0.2; z < 32.6; z += 3.6) B.slab(41.2, 1.4, z, 41.4, 3.6, z + 0.12, m.railing, root);
  // spandrel above railings up to the slab
  B.slab(41.3 - 0.25, 9.0, 0, 41.3 + 0.25, H, 32.6, m.wall, root);

  // internal
  wall('x', 10.6, 0, 14.3, IN, [door(10.7, 13.5)]);
  wall('x', 10.6, 24.6, 41.3, IN);
  wall('z', 14.3, 0, 10.6, IN);
  wall('x', 8.5, 14.3, 19.9, IN, [door(15.0, 17.4, 7)]);
  wall('z', 19.9, 0, 8.5, IN);
  wall('x', 6.1, 19.9, 24.6, IN, [door(20.4, 24.1, 7.6)]);
  wall('z', 24.6, 0, 10.6, IN, [door(7.6, 10.2)]);
  wall('z', 37.0, 0, 10.6, IN, [door(0.7, 3.7, 7.6)]);
  wall('z', 35.3, 10.6, 21.6, IN, [door(11.4, 20.8, 8.2)]);
  wall('x', 21.6, 0, 14.3, IN);
  wall('x', 21.6, 24.6, 41.3, IN);
  wall('z', 14.3, 21.6, 32.6, IN, [door(22.2, 24.6), door(27.3, 29.8, 7)]);
  wall('x', 25.4, 14.3, 24.6, IN, [door(21.0, 23.6, 7)]);
  wall('z', 20.3, 25.4, 32.6, IN);
  wall('z', 24.6, 21.6, 32.6, IN, [door(21.9, 25.0, 7.6)]);
  wall('z', 37.0, 21.6, 32.6, IN, [door(22.4, 25.0, 7.6)]);

  // skirting in the living spaces
  const skirt = (x0, z0, x1, z1) => B.slab(x0, 0, z0, x1, 0.33, z1, m.skirting, root);
  skirt(0.38, 10.8, 0.45, 11.8); skirt(0.38, 15.2, 0.45, 21.4);
  skirt(0.4, 21.38, 14.1, 21.42);

  // ------------------------------------------------------------ windows & doors
  function windowFrame(axis, c, a, b, sill, head, t = OUT) {
    const g = new THREE.Group();
    const len = b - a;
    const frame = (x0, y0, x1, y1) => axis === 'x'
      ? B.slab(a + x0, y0, c - 0.08, a + x1, y1, c + 0.08, m.black, g)
      : B.slab(c - 0.08, y0, a + x0, c + 0.08, y1, a + x1, m.black, g);
    frame(0, sill, len, sill + 0.15); frame(0, head - 0.15, len, head);
    frame(0, sill, 0.15, head); frame(len - 0.15, sill, len, head);
    frame(len / 2 - 0.06, sill, len / 2 + 0.06, head);
    if (axis === 'x') B.slab(a, sill, c - 0.02, b, head, c + 0.02, m.glass, g);
    else B.slab(c - 0.02, sill, a, c + 0.02, head, b, m.glass, g);
    // stone sill
    if (axis === 'x') B.slab(a - 0.2, sill - 0.08, c - t / 2 - 0.15, b + 0.2, sill, c + t / 2 + 0.15, m.darkStone, g);
    else B.slab(c - t / 2 - 0.15, sill - 0.08, a - 0.2, c + t / 2 + 0.15, sill, b + 0.2, m.darkStone, g);
    root.add(g);
  }
  windowFrame('x', 0, 4.2, 9.2, 2.5, 7.5);
  windowFrame('x', 0, 27.5, 32.5, 2.5, 7.5);
  windowFrame('x', 32.6, 4.8, 9.8, 2.5, 7.5);
  windowFrame('x', 32.6, 28.8, 33.3, 3.6, 7.0);
  for (const [a, b] of [[16.1, 18.1], [16.3, 18.3], [21.5, 23.5]]) {
    const z = a === 16.1 ? 0 : 32.6;
    B.slab(a, 6.5, z - 0.05, b, 8.0, z + 0.05, m.glass, root);
  }

  // hinged door leaf, open 90°. hinge at (hx,hz); leaf extends along dir vector.
  function leaf(hx, hz, dx, dz, w, h = 7.25, mat = m.oak) {
    const g = new THREE.Group();
    const len = w - 0.15;
    if (dx !== 0) B.slab(Math.min(hx, hx + dx * len), 0.05, hz - 0.06, Math.max(hx, hx + dx * len), h - 0.1, hz + 0.06, mat, g);
    else B.slab(hx - 0.06, 0.05, Math.min(hz, hz + dz * len), hx + 0.06, h - 0.1, Math.max(hz, hz + dz * len), mat, g);
    // vertical brass pull
    const px = hx + dx * (len - 0.3), pz = hz + dz * (len - 0.3);
    B.box(dx ? 0.05 : 0.2, 2.2, dz ? 0.05 : 0.2, m.brass, px, 3.5, pz, g);
    root.add(g);
  }
  function doorFrame(axis, c, a, b, head, t = IN) {
    const mat = m.walnut;
    if (axis === 'x') {
      B.slab(a - 0.15, 0, c - t / 2 - 0.05, a, head + 0.15, c + t / 2 + 0.05, mat, root);
      B.slab(b, 0, c - t / 2 - 0.05, b + 0.15, head + 0.15, c + t / 2 + 0.05, mat, root);
      B.slab(a - 0.15, head, c - t / 2 - 0.05, b + 0.15, head + 0.15, c + t / 2 + 0.05, mat, root);
    } else {
      B.slab(c - t / 2 - 0.05, 0, a - 0.15, c + t / 2 + 0.05, head + 0.15, a, mat, root);
      B.slab(c - t / 2 - 0.05, 0, b, c + t / 2 + 0.05, head + 0.15, b + 0.15, mat, root);
      B.slab(c - t / 2 - 0.05, head, a - 0.15, c + t / 2 + 0.05, head + 0.15, b + 0.15, mat, root);
    }
  }
  // main door: teak with brass inlay, swung into the drawing room against the wall
  doorFrame('z', 0, 11.8, 15.2, 7.6, OUT);
  leaf(0.4, 11.85, 1, 0, 3.4, 7.6, m.walnut);
  for (let i = 0; i < 5; i++) B.slab(0.5 + i * 0.6, 1.0, 11.97, 0.53 + i * 0.6, 6.6, 11.99, m.brass, root);
  doorFrame('x', 10.6, 10.7, 13.5, 7.25); leaf(13.45, 10.4, 0, -1, 2.8);
  doorFrame('x', 8.5, 15.0, 17.4, 7); leaf(15.05, 8.3, 0, -1, 2.4, 7, m.lacquerWhite);
  doorFrame('z', 24.6, 7.6, 10.2, 7.25); leaf(24.8, 10.15, 1, 0, 2.6);
  doorFrame('z', 14.3, 22.2, 24.6, 7.25); leaf(14.1, 22.25, -1, 0, 2.4);
  doorFrame('z', 14.3, 27.3, 29.8, 7); leaf(14.5, 29.75, 1, 0, 2.5, 7, m.lacquerWhite);
  doorFrame('x', 25.4, 21.0, 23.6, 7); leaf(23.55, 25.6, 0, 1, 2.6, 7, m.lacquerWhite);
  doorFrame('z', 24.6, 21.9, 25.0, 7.6);
  doorFrame('z', 37.0, 22.4, 25.0, 7.6);
  doorFrame('z', 37.0, 0.7, 3.7, 7.6);
  // balcony & utility glass doors (open)
  B.slab(37.25, 0.05, 3.6, 37.33, 7.5, 6.5, m.glass, root);
  B.slab(37.2, 0.05, 3.6, 37.38, 7.5, 3.7, m.black, root);
  B.slab(37.25, 0.05, 25.0, 37.33, 7.5, 27.6, m.glass, root);
  // pooja: carved jali double doors swung open
  doorFrame('x', 6.1, 20.4, 24.1, 7.6);
  B.slab(20.3, 0.1, 6.35, 20.42, 7.5, 8.1, m.jaliDoor, root);
  B.slab(24.08, 0.1, 6.35, 24.2, 7.5, 8.1, m.jaliDoor, root);
  // sliding glass door living <-> sit-out (two panels stacked, one open)
  for (const [a, b, off] of [[11.4, 14.6, 0.08], [14.4, 17.6, -0.08], [17.6, 20.8, 0.08]]) {
    if (a === 14.4) continue; // middle panel slid behind the first
    B.slab(35.3 + off - 0.03, 0.05, a, 35.3 + off + 0.03, 8.15, b, m.glass, root);
    B.slab(35.3 + off - 0.06, 0.05, a, 35.3 + off + 0.06, 8.15, a + 0.12, m.black, root);
    B.slab(35.3 + off - 0.06, 0.05, b - 0.12, 35.3 + off + 0.06, 8.15, b, m.black, root);
  }
  B.slab(35.3 - 0.2, 8.15, 11.4, 35.3 + 0.2, 8.3, 20.8, m.black, root);

  // ------------------------------------------------------------ ceiling
  B.slab(-0.4, H, -0.4, 41.7, H + 0.5, 33.0, m.ceiling, ceiling);
  // false ceiling with cove lighting over the drawing-dining-living hall
  function cove(x0, z0, x1, z1, bw = 1.6, drop = 0.9) {
    const y0 = H - drop;
    B.slab(x0, y0, z0, x1, H, z0 + bw, m.ceiling, ceiling);
    B.slab(x0, y0, z1 - bw, x1, H, z1, m.ceiling, ceiling);
    B.slab(x0, y0, z0 + bw, x0 + bw, H, z1 - bw, m.ceiling, ceiling);
    B.slab(x1 - bw, y0, z0 + bw, x1, H, z1 - bw, m.ceiling, ceiling);
    // LED strip hidden in the cove lip
    B.slab(x0 + bw - 0.06, y0 + 0.12, z0 + bw - 0.06, x1 - bw + 0.06, y0 + 0.16, z0 + bw, m.led, ceiling);
    B.slab(x0 + bw - 0.06, y0 + 0.12, z1 - bw, x1 - bw + 0.06, y0 + 0.16, z1 - bw + 0.06, m.led, ceiling);
    B.slab(x0 + bw - 0.06, y0 + 0.12, z0 + bw, x0 + bw, y0 + 0.16, z1 - bw, m.led, ceiling);
    B.slab(x1 - bw, y0 + 0.12, z0 + bw, x1 - bw + 0.06, y0 + 0.16, z1 - bw, m.led, ceiling);
    for (let x = x0 + bw / 2; x < x1; x += (x1 - x0 - bw) / 3) {
      B.downlight(m, x, z0 + bw / 2, ceiling, y0);
      B.downlight(m, x, z1 - bw / 2, ceiling, y0);
    }
  }
  cove(0.2, 10.8, 14.1, 21.4);
  cove(14.5, 11.0, 24.4, 21.4, 1.4);
  cove(24.8, 10.8, 35.1, 21.4);
  cove(0.2, 21.8, 14.1, 32.4, 1.4, 0.75);
  // simple recessed downlights elsewhere
  for (const [x, z] of [[4, 4], [10, 4], [28, 3], [33, 3], [27.5, 26], [31, 26], [34, 29], [30.5, 30.5], [17, 4], [22.3, 3], [17.2, 29], [22.4, 29], [19.5, 9.6], [19.5, 23.5], [38.3, 16], [38.3, 5], [39, 27]]) {
    B.downlight(m, x, z, ceiling);
  }

  // ------------------------------------------------------------ helpers
  const P = (g, x, z, r = 0, y = 0) => B.place(root, g, x, z, r, y);
  const blob = (x, z, w, d, rot = 0, o = 0.5) => blobs.push({ x, z, w, d, rot, o });
  const light = (x, y, z, intensity, color = '#ffd7a8', distance = 0) => lights.push({ x, y, z, intensity, color, distance });
  const art = (i, w, h, x, y, z, rot) => P(B.wallArt(m, m._art[i], w, h), x, z, rot, y);

  // ============================================================ DRAWING ROOM
  // Contemporary formal lounge: oak fluted feature wall, beige sofa, rust & mustard accents.
  {
    const fw = B.flutedPanel(m, 7.6, H - 0.9);
    P(fw, 6.4, 10.8, 0);
    art(0, 3.0, 3.8, 6.4, 5.6, 10.92, 0);
    const cred = new THREE.Group();
    B.box(5.6, 1.6, 1.3, m.walnut, 0, 1.25, 0, cred);
    B.box(5.6, 0.06, 1.3, m.darkStone, 0, 2.08, 0, cred);
    B.box(5.4, 0.04, 0.04, m.led, 0, 0.42, 0.45, cred);
    B.cyl(0.35, 0.25, 1.2, m.terracotta, -2.0, 2.7, 0, cred);
    B.cyl(0.22, 0.22, 0.6, m.ceramic, 2.1, 2.4, 0, cred);
    B.box(0.9, 0.15, 0.7, m.book1, 1.6, 2.18, 0, cred);
    P(cred, 6.6, 11.65);
    P(B.sofa(m, { w: 7.4, mat: m.sofaFabric, cushions: [m.cushionA, m.cushionC, m.cushionB] }), 6.8, 19.8, 180);
    blob(6.8, 19.8, 8, 3.6);
    P(B.armchair(m, m.velvetRust), 3.0, 15.0, 75);
    P(B.armchair(m, m.velvetMustard), 11.4, 15.8, -75);
    blob(3.0, 15.0, 3, 3); blob(11.4, 15.8, 3, 3);
    P(B.nestingTables(m), 6.8, 16.2);
    blob(6.8, 16.2, 4, 3.2);
    B.rug(m._rug.drawing, 9, 6.5, 6.8, 16.6, root);
    P(B.floorLamp(m), 2.3, 20.8);
    P(B.plant(m, { kind: 'fiddle', h: 5.5 }), 12.9, 20.4);
    P(B.shoeCabinet(m), 0.95, 18.3, 90);
    art(2, 2.6, 3.2, 13.0, 5.7, 21.38, 180);
    light(7, 8.6, 16, 9);
    light(1.5, 6.5, 13.4, 3);
  }

  // ============================================================ DINING
  {
    P(B.diningSet(m), 19.45, 16.4);
    blob(19.45, 16.4, 6, 7.5, 0, 0.55);
    P(B.pendantCluster(m, 3, 2.1, 2.9, H), 19.45, 16.4);
    // crockery unit + bar in the passage (fluted glass shutters, backlit)
    const cr = new THREE.Group();
    B.box(6.0, 2.8, 1.5, m.walnut, 0, 1.6, 0, cr);
    B.box(6.0, 0.08, 1.5, m.calacatta, 0, 3.04, 0, cr);
    B.box(6.0, 3.0, 1.0, m.walnut, 0, 6.4, -0.25, cr);
    for (let i = 0; i < 3; i++) B.box(1.95, 2.9, 0.04, m.glass, -2 + i * 2, 6.4, 0.27, cr);
    B.box(5.8, 2.8, 0.05, m.led, 0, 6.4, -0.7, cr);
    for (let i = 0; i < 4; i++) B.box(1.45, 2.6, 0.04, m.oak, -2.25 + i * 1.5, 1.6, 0.77, cr);
    B.cyl(0.18, 0.18, 0.7, m.ceramic, -1.6, 6.0, -0.2, cr); B.cyl(0.22, 0.2, 0.5, m.ceramic, 0.5, 5.9, -0.2, cr);
    B.cyl(0.2, 0.15, 0.55, m.brass, 1.8, 3.35, 0.1, cr);
    P(cr, 17.8, 24.65, 180);
    blob(17.8, 24.65, 6.4, 2);
    // wash area: floating vanity + backlit mirror
    const wa = new THREE.Group();
    B.box(2.6, 0.8, 1.6, m.walnut, 0, 2.55, 0, wa);
    B.box(2.7, 0.12, 1.7, m.darkStone, 0, 3.0, 0, wa);
    B.cyl(0.55, 0.45, 0.4, m.ceramic, 0, 3.26, 0.1, wa, 32);
    B.box(0.08, 0.6, 0.08, m.brass, 0, 3.4, -0.55, wa);
    B.box(2.2, 3.0, 0.06, m.mirror, 0, 5.4, -0.75, wa);
    B.box(2.3, 3.1, 0.04, m.led, 0, 5.4, -0.8, wa);
    P(wa, 18.6, 9.55);
    light(19.45, 8.0, 16.4, 9);
    light(19.5, 8.5, 9.6, 2.5);
    light(18.6, 8.5, 22.8, 3.6);
  }

  // ============================================================ LIVING
  {
    P(B.tvUnit(m, { w: 8, panelW: 6.4, panelH: H - 0.9, tv: 5.5 }), 29.6, 10.8);
    blob(29.6, 11.6, 8.2, 1.6, 0, 0.35);
    P(B.lSofa(m, { w: 8.8, chaise: 5.6, mat: m.sofaGreen, cushions: [m.cushionC, m.cushionA, m.cushionC] }), 29.4, 19.85, 180);
    blob(29.4, 19.3, 9.2, 4.6);
    P(B.coffeeTableRound(m, 1.5), 30.4, 15.6);
    blob(30.4, 15.6, 3.2, 3.2);
    B.rug(m._rug.living, 8.5, 6.2, 29.6, 16.0, root);
    P(B.armchair(m, m.linenGrey), 34.0, 13.0, -110);
    blob(34.0, 13.0, 3, 3);
    P(B.plant(m, { kind: 'palm', h: 5.5, pot: m.potDark }), 34.4, 20.6);
    art(3, 2.2, 2.8, 26.3, 5.8, 21.38, 180);
    art(0, 2.2, 2.8, 29.0, 5.8, 21.38, 180);
    light(29.6, 8.6, 16, 9);
    light(34.5, 6.5, 20.8, 2.5);
  }

  // ============================================================ SIT OUT
  {
    P(B.swing(m, H), 38.6, 13.6, 200);
    blob(38.6, 13.6, 3.0, 3.0);
    P(B.lounger(m, m.cushionB), 39.6, 19.6, -120);
    blob(39.6, 19.6, 2.6, 2.6);
    const st = new THREE.Group();
    B.cyl(0.7, 0.7, 0.08, m.oak, 0, 1.4, 0, st, 24); B.cyl(0.1, 0.1, 1.4, m.black, 0, 0.7, 0, st, 8);
    B.cyl(0.25, 0.2, 0.25, m.terracotta, 0, 1.56, 0, st);
    P(st, 37.6, 17.8);
    P(B.plant(m, { kind: 'bushy', h: 3.8, pot: m.terracotta, r: 0.8 }), 40.3, 11.4);
    P(B.plant(m, { kind: 'palm', h: 5, pot: m.pot }), 36.3, 21.0);
    P(B.plant(m, { kind: 'bushy', h: 2.6, pot: m.terracotta, r: 0.55 }), 40.4, 16.6);
    // vertical garden on the utility wall
    for (let i = 0; i < 14; i++) B.sphere(0.4 + (i % 3) * 0.1, i % 2 ? m.leaf : m.leafLight, 36.4 + (i % 5) * 0.9, 3.8 + Math.floor(i / 5) * 1.3, 21.3, root, 1, 1, 0.5);
    B.slab(36.0, 3.0, 21.36, 41.0, 7.5, 21.42, m.walnut, root);
    light(38.5, 8.8, 16, 4, '#ffd29a');
  }

  // ============================================================ BALCONY
  {
    P(B.lounger(m, m.cushionA), 39.0, 7.8, 180);
    blob(39.0, 7.8, 2.6, 2.6);
    P(B.plant(m, { kind: 'bushy', h: 3.2, pot: m.terracotta, r: 0.7 }), 40.3, 1.2);
    P(B.plant(m, { kind: 'fiddle', h: 4.5, pot: m.pot, r: 0.6 }), 37.9, 0.9);
    light(39, 8.8, 5, 2, '#ffd29a');
  }

  // ============================================================ MODULAR KITCHEN
  // L-shaped, handle-less (gola profile) kitchen: matte forest-green base units,
  // warm-white gloss wall units, Calacatta-look quartz top, subway backsplash,
  // tall unit with built-in oven + microwave, frost-free fridge, hob + chimney.
  {
    const K = new THREE.Group();
    const top = 3.0, depth = 2.0, baseH = 2.75;
    // run along the south wall (x 26.8 -> 36.7, back at z 32.4)
    const runS = { x0: 27.0, x1: 36.75 };
    // run along the east wall (z 23.0 -> 32.4, back at x 36.75)
    const runE = { z0: 25.3, z1: 32.4 };
    // bases
    B.slab(runS.x0, 0, 32.4 - depth, runS.x1, 0.35, 32.4 - 0.1, m.black, K);
    B.slab(runS.x0, 0.35, 32.4 - depth, runS.x1, baseH, 32.4, m.kitchenGreen, K);
    B.slab(36.75 - depth, 0, runE.z0, 36.75 - 0.1, 0.35, 32.4 - depth, m.black, K);
    B.slab(36.75 - depth, 0.35, runE.z0, 36.75, baseH, 32.4 - depth, m.kitchenGreen, K);
    // shutter seams + gola channel
    for (let x = runS.x0 + 1.5; x < runS.x1 - 0.5; x += 1.5) B.slab(x - 0.01, 0.4, 32.4 - depth - 0.01, x + 0.01, baseH - 0.3, 32.4 - depth, m.black, K);
    for (let z = runE.z0 + 1.5; z < 32.4 - depth; z += 1.5) B.slab(36.75 - depth - 0.01, 0.4, z - 0.01, 36.75 - depth, baseH - 0.3, z + 0.01, m.black, K);
    B.slab(runS.x0, baseH - 0.3, 32.4 - depth - 0.02, runS.x1 - depth, baseH - 0.2, 32.4 - depth, m.black, K);
    B.slab(36.75 - depth - 0.02, baseH - 0.3, runE.z0, 36.75 - depth, baseH - 0.2, 32.4 - depth, m.black, K);
    B.slab(runS.x0, 1.4, 32.4 - depth - 0.02, runS.x1 - depth, 1.5, 32.4 - depth, m.black, K);
    // quartz countertop
    B.slab(runS.x0 - 0.05, baseH, 32.4 - depth - 0.08, runS.x1 + 0.05, top, 32.45, m.calacatta, K);
    B.slab(36.75 - depth - 0.08, baseH, runE.z0 - 0.05, 36.8, top, 32.4 - depth, m.calacatta, K);
    // backsplash (subway tile) up to the wall units
    B.slab(runS.x0, top, 32.33, runS.x1, 5.2, 32.4, m.subway, K);
    B.slab(36.68, top, runE.z0, 36.75, 5.2, 32.4, m.subway, K);
    // sink under the window (south) with pull-out tap
    B.slab(30.0, top - 0.6, 30.7, 32.2, top + 0.005, 32.0, m.steel, K);
    B.slab(30.1, top - 0.55, 30.8, 32.1, top + 0.01, 31.9, m.black, K);
    const tap = B.cyl(0.04, 0.04, 1.3, m.black, 31.1, top + 0.65, 32.1, K, 8);
    void tap;
    B.box(0.06, 0.06, 0.7, m.black, 31.1, top + 1.28, 31.8, K);
    // hob + angled chimney on the east run
    B.slab(35.1, top, 27.0, 36.6, top + 0.04, 29.6, m.blackGlass, K);
    for (const [hx, hz] of [[35.5, 27.6], [35.5, 28.9], [36.2, 28.3]]) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 6, 24), m.steel);
      r.rotation.x = Math.PI / 2; r.position.set(hx, top + 0.07, hz); K.add(r);
    }
    B.slab(35.9, 5.6, 27.0, 36.75, 8.8, 29.6, m.black, K); // chimney box
    const hood = B.box(1.6, 0.06, 2.6, m.blackGlass, 35.85, 5.85, 28.3, K);
    hood.rotation.z = -0.45;
    B.slab(36.3, 8.8, 27.7, 36.75, H, 28.9, m.steel, K);
    // wall units: gloss white with oak open shelves & under-cabinet LED
    const wallY0 = 5.2, wallY1 = 8.6;
    B.slab(runS.x0, wallY0, 31.2, 28.8, wallY1, 32.4, m.kitchenUpper, K);
    B.slab(33.5, wallY0, 31.2, 36.75, wallY1, 32.4, m.kitchenUpper, K);
    B.slab(35.55, wallY0, runE.z0, 36.75, wallY1, 27.0, m.kitchenUpper, K);
    B.slab(35.55, wallY0, 29.6, 36.75, wallY1, 31.2, m.kitchenUpper, K);
    for (const x of [27.9, 34.6, 35.7]) B.slab(x - 0.01, wallY0, 31.18, x + 0.01, wallY1, 31.2, m.black, K);
    B.slab(runS.x0, wallY0 - 0.04, 31.4, 28.8, wallY0, 31.5, m.led, K);
    B.slab(33.5, wallY0 - 0.04, 31.4, 36.75, wallY0, 31.5, m.led, K);
    B.slab(35.75, wallY0 - 0.04, runE.z0, 35.85, wallY0, 27.0, m.led, K);
    // loft
    B.slab(runS.x0, wallY1 + 0.1, 31.2, 36.75, H, 32.4, m.oak, K);
    B.slab(35.55, wallY1 + 0.1, runE.z0, 36.75, H, 31.2, m.oak, K);
    // window-side open shelves
    // tall units on the west wall: fridge + oven/microwave tower + pantry
    B.slab(24.85, 0, 25.3, 27.1, 8.6, 27.3, m.kitchenGreen, K);
    B.slab(24.85, 0, 27.3, 27.1, 6.4, 29.9, m.fridge, K); // French-door fridge
    B.slab(27.08, 1.0, 28.55, 27.12, 5.2, 28.65, m.black, K);
    B.slab(24.85, 6.5, 27.3, 27.1, H, 29.9, m.kitchenGreen, K);
    B.slab(24.85, 8.7, 25.3, 27.1, H, 27.3, m.oak, K);
    B.slab(27.1, 3.0, 25.6, 27.14, 4.8, 27.0, m.blackGlass, K); // built-in oven
    B.slab(27.1, 5.0, 25.6, 27.14, 6.3, 27.0, m.blackGlass, K); // microwave
    B.slab(27.14, 4.75, 25.7, 27.18, 4.8, 26.9, m.steel, K);
    B.slab(24.85, 0, 29.9, 27.1, 8.6, 32.4, m.kitchenGreen, K); // pantry
    B.slab(27.1, 0.3, 31.1, 27.14, 8.3, 31.15, m.black, K);
    B.slab(24.85, 8.7, 29.9, 27.1, H, 32.4, m.oak, K);
    // accessories
    B.cyl(0.25, 0.25, 0.7, m.steel, 33.6, top + 0.35, 31.9, K); // kettle-ish
    B.box(1.3, 0.12, 0.9, m.walnut, 34.8, top + 0.06, 31.6, K); // chopping board
    B.cyl(0.2, 0.18, 0.35, m.terracotta, 27.8, top + 0.18, 31.8, K);
    for (let i = 0; i < 4; i++) B.cyl(0.13, 0.13, 0.5, i % 2 ? m.ceramic : m.potDark, 36.2, top + 0.25, 25.7 + i * 0.35, K, 12);
    P(B.plant(m, { kind: 'bushy', h: 1.6, r: 0.3, pot: m.ceramic }), 28.3, 31.8, 0, top);
    // breakfast ledge along the north wall with a floating oak shelf
    B.slab(29.0, 2.9, 21.8, 34.4, 3.05, 23.1, m.calacatta, K);
    B.slab(29.2, 0, 21.8, 29.5, 2.9, 22.9, m.kitchenGreen, K);
    B.slab(33.9, 0, 21.8, 34.2, 2.9, 22.9, m.kitchenGreen, K);
    B.slab(29.0, 6.2, 21.8, 34.4, 6.3, 22.7, m.oak, K);
    B.cyl(0.2, 0.15, 0.5, m.ceramic, 30.0, 6.55, 22.2, K, 12);
    B.cyl(0.18, 0.18, 0.4, m.terracotta, 33.2, 6.5, 22.2, K, 12);
    B.box(0.3, 0.6, 0.5, m.book1, 31.5, 6.6, 22.2, K);
    for (const x of [30.4, 32.9]) {
      B.cyl(0.55, 0.55, 0.12, m.walnut, x, 2.15, 23.7, K, 20);
      B.cyl(0.05, 0.05, 2.1, m.black, x, 1.05, 23.7, K, 8);
      B.cyl(0.4, 0.4, 0.04, m.black, x, 0.02, 23.7, K, 16);
    }
    root.add(K);
    blob(31.7, 22.6, 6, 2.2, 0, 0.4);
    // pendants over the counter
    for (const x of [30.4, 32.9]) {
      B.cyl(0.01, 0.01, 2.6, m.black, x, H - 1.3, 22.6, root, 4);
      B.cyl(0.25, 0.45, 0.7, m.black, x, H - 2.9, 22.6, root, 24);
      B.cyl(0.2, 0.2, 0.05, m.led, x, H - 3.25, 22.6, root, 16);
    }
    light(31, 8.8, 27.5, 7, '#ffe8c8');
    light(31.7, 6.4, 22.8, 3, '#ffd29a');
    light(34.5, 5.0, 29, 2, '#ffe8c8');
  }

  // ============================================================ UTILITY
  {
    const u = new THREE.Group();
    B.box(2.0, 2.8, 2.0, m.washer, 0, 1.4, 0, u);
    const door = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 8, 32), m.chrome);
    door.position.set(0, 1.3, 1.02); u.add(door);
    B.cyl(0.55, 0.55, 0.02, m.blackGlass, 0, 1.3, 1.0, u).rotation.x = Math.PI / 2;
    P(u, 39.6, 30.9, 180);
    P(B.shelves(m, 3.2, 3), 37.6, 28.4, 90, 4.0);
    B.slab(37.2, 0, 26.0, 38.2, 2.8, 27.6, m.lacquerWhite, root);
    light(39, 8.8, 27, 2);
  }

  // ============================================================ MASTER BEDROOM
  // Warm terracotta & walnut: channel-tufted headboard wall, sliding wardrobe, study/dresser.
  {
    B.slab(0.4, 0, 21.82, 14.1, H - 0.75, 21.86, m.wallTerracotta, root);
    P(B.flutedPanel(m, 8.6, H - 0.75, m.walnut, 0.3), 6.9, 21.85);
    P(B.bed(m, { w: 6, l: 6.75, frame: m.walnut, head: m.linenGrey, duvet: m.linen, throwMat: m.velvetRust, pillows: [m.linen, m.linen], accent: [m.cushionA, m.cushionC] }), 6.9, 25.75);
    blob(6.9, 25.4, 7.4, 8);
    P(B.sideTable(m, m.walnut), 2.9, 22.9); P(B.sideTable(m, m.walnut), 10.9, 22.9);
    P(B.tableLamp(m), 2.9, 22.9, 0, 1.82); P(B.tableLamp(m), 10.9, 22.9, 0, 1.82);
    // pendant lights either side of the bed
    for (const x of [2.9, 10.9]) {
      B.cyl(0.01, 0.01, 3.4, m.black, x, H - 1.7 - 0.75, 22.9, root, 4);
      B.sphere(0.3, m.led, x, H - 4.0, 22.9, root);
    }
    P(B.wardrobe(m, { w: 8.0, h: H - 0.75, d: 2, body: m.lacquerWhite, doors: 4, accentPanel: m.walnut }), 1.4, 27.6, 90);
    P(B.dresser(m), 12.6, 30.4, -90);
    B.rug(m._rug.master, 8.5, 5.5, 7.1, 28.9, root);
    P(B.plant(m, { kind: 'fiddle', h: 5 }), 3.4, 31.6);
    // window curtains
    const c1 = B.curtain(m, 1.6, 8.4, m.curtainDark); c1.position.set(4.0, 4.6, 32.15); root.add(c1);
    const c2 = B.curtain(m, 1.6, 8.4, m.curtainDark); c2.position.set(10.6, 4.6, 32.15); root.add(c2);
    const c3 = B.curtain(m, 5.0, 8.4, m.curtain, 9); c3.position.set(7.3, 4.6, 32.0); c3.scale.x = 0.25; c3.position.x = 4.8 + 0.6; root.add(c3);
    B.slab(3.0, 8.85, 31.9, 11.6, 8.95, 32.2, m.black, root);
    light(7.0, 8.6, 27.2, 8);
    light(2.9, 6, 23.2, 1.6, '#ffc98a'); light(10.9, 6, 23.2, 1.6, '#ffc98a');
  }

  // ============================================================ BED ROOM 2 (guest/kids)
  // Calm blue-grey and light oak, study desk under the north window.
  {
    B.slab(14.08, 0, 0.4, 14.12, H, 10.4, m.wallBlue, root);
    P(B.bed(m, { w: 5, l: 6.5, frame: m.oak, head: m.linenBlue, duvet: m.linen, throwMat: m.linenBlue, pillows: [m.linen, m.linen], accent: [m.cushionA] }), 10.6, 5.0, -90);
    blob(10.4, 5.0, 7.4, 6.4);
    P(B.sideTable(m, m.oak), 12.9, 1.6, -90);
    P(B.tableLamp(m), 12.9, 1.6, 0, 1.82);
    art(1, 3.6, 2.4, 14.05, 6.7, 5.0, -90);
    P(B.wardrobe(m, { w: 7.2, h: H - 0.1, d: 2, body: m.oak, doors: 4, handle: m.black }), 1.4, 4.3, 90);
    P(B.desk(m), 6.6, 1.5, 0);
    P(B.shelves(m, 3.4, 2), 6.6, 0.85, 0, 7.6);
    B.rug(m._rug.bed, 5, 6, 6.0, 6.2, root);
    const cc = B.curtain(m, 1.5, 8.2, m.curtain); cc.position.set(3.5, 4.6, 0.55); root.add(cc);
    const cd = B.curtain(m, 1.5, 8.2, m.curtain); cd.position.set(9.9, 4.6, 0.55); root.add(cd);
    B.slab(2.6, 8.85, 0.4, 10.8, 8.95, 0.6, m.black, root);
    P(B.plant(m, { kind: 'bushy', h: 2.6, r: 0.5, pot: m.pot }), 3.3, 9.5);
    light(7, 8.8, 5.3, 7);
  }

  // ============================================================ BED ROOM 3
  // Soft taupe and sage, panelled headboard wall facing the north window.
  {
    B.slab(24.8, 0, 10.38, 36.8, H, 10.42, m.wallTaupe, root);
    const pan = new THREE.Group();
    for (let i = 0; i < 6; i++) B.box(1.45, 8.0, 0.08, m.oak, -3.65 + i * 1.46, 4.0, 0.04, pan);
    B.box(8.8, 0.06, 0.4, m.led, 0, 8.1, 0.2, pan);
    P(pan, 31.6, 10.38, 180);
    P(B.bed(m, { w: 5, l: 6.5, frame: m.oak, head: m.linenSage, duvet: m.linen, throwMat: m.linenSage, pillows: [m.linen, m.linen], accent: [m.cushionC, m.cushionB] }), 31.6, 6.6, 180);
    blob(31.6, 6.9, 6.4, 7.4);
    P(B.sideTable(m, m.oak), 28.1, 9.4, 180); P(B.sideTable(m, m.oak), 35.3, 9.4, 180);
    P(B.tableLamp(m), 28.1, 9.4, 0, 1.82); P(B.tableLamp(m), 35.3, 9.4, 0, 1.82);
    P(B.wardrobe(m, { w: 6.8, h: H - 0.1, d: 2, body: m.lacquerWhite, doors: 4, handle: m.brass, accentPanel: m.oak }), 25.8, 3.8, 90);
    B.rug(m._rug.bed, 5.5, 3, 31.6, 2.0, root);
    const ce = B.curtain(m, 1.4, 8.2, m.curtainDark); ce.position.set(26.9, 4.6, 0.55); root.add(ce);
    const cf = B.curtain(m, 1.4, 8.2, m.curtainDark); cf.position.set(33.1, 4.6, 0.55); root.add(cf);
    B.slab(26, 8.85, 0.4, 34, 8.95, 0.6, m.black, root);
    light(31.4, 8.8, 5.0, 7);
    light(27.9, 5.5, 9.6, 1.4, '#ffc98a'); light(35.3, 5.5, 9.6, 1.4, '#ffc98a');
  }

  // ============================================================ POOJA
  // Walnut mandir with a backlit CNC jali, brass diyas and a marble pedestal.
  {
    const pj = new THREE.Group();
    B.box(4.0, 0.1, 0.3, m.walnut, 0, 2.6, 0, pj);
    B.box(3.6, 5.2, 0.08, m.jali, 0, 5.0, -0.4, pj);
    B.box(4.0, 2.4, 1.6, m.walnut, 0, 1.2, 0.2, pj);
    B.box(4.1, 0.12, 1.7, m.calacatta, 0, 2.46, 0.2, pj);
    for (let i = 0; i < 3; i++) B.box(1.3, 2.2, 0.04, m.oak, -1.3 + i * 1.3, 1.2, 1.02, pj);
    B.box(4.0, 0.25, 1.2, m.walnut, 0, 7.8, 0, pj);
    B.box(3.8, 0.04, 0.04, m.led, 0, 7.66, 0.3, pj);
    // idol plinth + diyas + bell
    B.box(1.1, 0.6, 0.8, m.calacatta, 0, 2.82, -0.1, pj);
    B.sphere(0.32, m.brass, 0, 3.5, -0.1, pj, 1, 1.4, 1);
    for (const x of [-1.2, 1.2]) {
      B.cyl(0.18, 0.08, 0.15, m.brass, x, 2.6, 0.5, pj, 16);
      B.sphere(0.05, m.led, x, 2.75, 0.5, pj, 1, 1.8, 1);
      B.cyl(0.04, 0.04, 1.0, m.brass, x, 3.1, -0.1, pj, 8);
      B.cyl(0.2, 0.12, 0.08, m.brass, x, 3.6, -0.1, pj, 16);
    }
    P(pj, 22.25, 0.75);
    const bell = B.cyl(0.08, 0.25, 0.35, m.brass, 22.25, 7.0, 3.5, root, 16);
    void bell;
    B.cyl(0.01, 0.01, 2.8, m.brass, 22.25, 8.6, 3.5, root, 4);
    for (let i = 0; i < 5; i++) B.cyl(0.3 - i * 0.04, 0.3 - i * 0.04, 0.02, i % 2 ? m.terracotta : m.velvetMustard, 22.25, 0.02 + i * 0.002, 4.3, root, 24);
    light(22.25, 6.0, 3.0, 4, '#ffbf70');
  }

  // ============================================================ TOILETS
  function bathroom(r, { vanityAt, wcAt, showerZone, door }) {
    // tiled walls to 7ft
    const { x0, x1, z0, z1 } = r;
    const i = 0.22;
    B.slab(x0 + i, 0, z0 + i, x1 - i, 7.2, z0 + i + 0.03, m.bathWall, root);
    B.slab(x0 + i, 0, z1 - i - 0.03, x1 - i, 7.2, z1 - i, m.bathWall, root);
    B.slab(x0 + i, 0, z0 + i, x0 + i + 0.03, 7.2, z1 - i, m.bathWall, root);
    B.slab(x1 - i - 0.03, 0, z0 + i, x1 - i, 7.2, z1 - i, m.bathWall, root);
    void door;
    const [vx, vz, vr] = vanityAt;
    const v = new THREE.Group();
    B.box(2.4, 0.9, 1.5, m.walnut, 0, 2.4, 0, v);
    B.box(2.5, 0.1, 1.6, m.calacatta, 0, 2.9, 0, v);
    B.box(1.2, 0.35, 0.9, m.ceramic, 0, 3.12, 0.1, v);
    B.box(0.06, 0.55, 0.06, m.black, 0, 3.25, -0.55, v);
    B.box(2.0, 2.6, 0.05, m.mirror, 0, 5.2, -0.72, v);
    B.box(2.1, 2.7, 0.03, m.led, 0, 5.2, -0.76, v);
    P(v, vx, vz, vr);
    const [wx, wz, wr] = wcAt;
    const wc = new THREE.Group();
    B.rbox(1.25, 1.2, 1.9, 0.35, m.ceramic, 0, 1.25, 0.15, wc);
    B.box(1.4, 2.0, 0.5, m.ceramic, 0, 2.5, -0.85, wc);
    B.box(0.5, 0.25, 0.04, m.chrome, 0, 3.0, -0.59, wc);
    P(wc, wx, wz, wr);
    const [sx0, sz0, sx1, sz1] = showerZone;
    B.slab(sx0, 0.0, sz0, sx1, 0.06, sz1, m.darkStone, root);
    B.cyl(0.45, 0.45, 0.05, m.chrome, (sx0 + sx1) / 2, 7.4, (sz0 + sz1) / 2, root, 24);
  }
  bathroom(ROOMS.toiletTop, { vanityAt: [18.9, 4.4, -90], wcAt: [15.4, 2.5, 90], showerZone: [14.6, 0.4, 17.5, 1.6] });
  B.slab(14.5, 0, 1.65, 17.0, 7.0, 1.7, m.glass, root);
  bathroom(ROOMS.toilet1, { vanityAt: [19.3, 27.6, -90], wcAt: [17.6, 31.6, 180], showerZone: [14.6, 30.0, 16.8, 32.3] });
  B.slab(16.8, 0, 30.0, 16.85, 7.0, 32.3, m.glass, root);
  bathroom(ROOMS.toilet2, { vanityAt: [23.6, 30.0, -90], wcAt: [21.3, 31.6, 180], showerZone: [20.6, 26.6, 22.4, 28.6] });
  light(17, 8.5, 4, 2.5); light(17.3, 8.5, 29, 2.5); light(22.4, 8.5, 29, 2.5);

  return { root, ceiling, lights, blobs };
}

// ------------------------------------------------------------ surroundings
// Sky dome, landscaped ground ~5 floors below and neighbouring towers.
export function buildSurroundings(m, skyTex) {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false }));
  g.add(dome);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(800, 48), m.grass);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -55; g.add(ground);
  // own tower's facade below the flat
  B.slab(-12, -55, -2, 44, -1.0, 35, m.building, g);
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, d = 160 + rnd() * 340;
    const w = 40 + rnd() * 60, h = 60 + rnd() * 140, dd = 40 + rnd() * 50;
    B.box(w, h, dd, i % 3 ? m.building : m.buildingDark, 20 + Math.cos(a) * d, -55 + h / 2, 16 + Math.sin(a) * d, g);
  }
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2, d = 70 + rnd() * 200;
    const x = 20 + Math.cos(a) * d, z = 16 + Math.sin(a) * d;
    B.cyl(0.8, 1.0, 10, m.trunk, x, -50, z, g, 6);
    B.sphere(7 + rnd() * 5, m.tree, x, -40, z, g, 1, 0.9, 1);
  }
  return g;
}
