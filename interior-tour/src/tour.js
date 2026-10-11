// Camera choreography for the virtual tour (feet). Each key: [time s, position, look-at].
import * as THREE from 'three';

const C = [20.6, 0, 16.3]; // apartment centre
const keys = [];
// 1) dollhouse orbit with ceilings removed
for (let i = 0; i <= 5; i++) {
  const t = i * 2.2;
  const a = THREE.MathUtils.degToRad(115 + i * 26);
  keys.push([t, [C[0] + Math.cos(a) * 33, 40 - i * 1.5, C[2] + Math.sin(a) * 33], [C[0], 0, C[2]]]);
}
// 2) swoop down to the main door, then walk through the home
const E = 5.3; // eye height
keys.push(
  [14.0, [-17, 13, 13.5], [4, 4, 14.5]],
  [17.0, [-5.5, E, 13.5], [8, 4.6, 15.5]],
  [20.5, [1.8, E, 13.5], [8, 3.8, 19.5]],
  [24.5, [5.0, E, 14.0], [6.4, 4.8, 10.6]],
  [28.5, [9.5, E, 17.6], [20, 4.2, 16.5]],
  [32.5, [15.5, E, 21.0], [20.5, 3.4, 15.0]],
  [36.5, [22.0, E, 12.4], [29.6, 4.3, 10.8]],
  [40.5, [26.5, E, 13.4], [31, 3.5, 20]],
  [44.5, [32.6, E, 16.2], [41, 4.2, 15.5]],
  [48.5, [37.2, E, 15.6], [39.6, 3.4, 21.0]],
  [52.5, [33.4, E, 17.4], [22, 4.6, 22.5]],
  [56.5, [21.5, E, 22.6], [30, 4.0, 27.5]],
  [60.5, [27.0, E, 24.0], [34.5, 3.8, 29.5]],
  [64.5, [29.6, E, 25.6], [36.5, 4.2, 28.2]],
  [68.5, [31.4, E, 25.4], [31.0, 3.8, 32.6]],
  [72.5, [28.0, E, 25.3], [25.5, 4.6, 28.5]],
  [75.5, [25.8, E, 23.5], [15, 4.6, 23.6]],
  [78.5, [18.5, E, 22.7], [6, 4.2, 25.5]],
  [81.5, [13.2, E, 23.4], [8, 3.6, 28]],
  [85.5, [10.6, 5.6, 31.4], [6.9, 3.0, 22.6]],
  [89.5, [8.0, 5.4, 31.2], [1.5, 4.5, 27]],
  [93.0, [11.1, E, 27.0], [12, 4.6, 22.5]],
  [96.0, [14.0, E, 23.4], [20, 4.6, 20]],
  [99.5, [18.0, E, 20.0], [21, 4.5, 8]],
  [103.0, [22.2, E, 10.3], [22.25, 4.2, 0.5]],
  [106.5, [23.4, E, 9.0], [30, 4.5, 8.8]],
  [110.0, [26.6, E, 8.9], [32, 3.2, 5.5]],
  [114.0, [27.8, 5.4, 2.3], [31.6, 3.0, 9.0]],
  [118.0, [34.3, E, 2.2], [41, 4.2, 4]],
  [121.5, [39.1, E, 2.4], [39.3, 3.5, 9.5]],
  [125.0, [35.0, E, 2.2], [26, 4.5, 8.5]],
  [128.5, [25.8, E, 8.9], [16, 4.6, 10]],
  [131.5, [19.0, E, 11.6], [12, 4.6, 9]],
  [134.5, [12.1, E, 12.2], [12.1, 4.6, 5]],
  [137.0, [11.6, E, 9.2], [6, 4.0, 5]],
  [140.0, [5.0, E, 9.2], [12.5, 3.2, 4.8]],
  [144.0, [4.0, 5.4, 8.0], [6.6, 3.8, 0.5]],
  [148.0, [8.5, 5.6, 9.6], [6.5, 4.6, 0.5]],
);

export const DURATION = 148;

export const LABELS = [
  [0, 12.5, '3 BHK Residence — Modern Interiors', 'BUA 1890 sft · Carpet 1455 sft · West facing entrance'],
  [15.5, 29, 'Drawing Room', `14'7½" x 10'10½" · oak fluted feature wall, rust & mustard accents`],
  [29, 34.5, 'Dining', `10'4½" x 14'9" · 6-seater marble top, brass pendants, backlit crockery unit`],
  [34.5, 44, 'Living Room', `10'9" x 10'10½" · fluted TV wall, sage L-sofa, cove-lit false ceiling`],
  [44, 52.5, 'Sit Out', `6'1½" x 10'10½" · herringbone deck, swing chair, vertical garden`],
  [57, 75, 'Modular Kitchen', `12'1½" x 10'10½" · L-shaped handle-less, quartz top, tall appliance unit`],
  [81.5, 93, 'Master Bedroom', `14'3" x 10'10½" · terracotta & walnut, 4-door wardrobe, dresser`],
  [100, 106.5, 'Pooja Room', `4'1½" x 6'1½" · walnut mandir with backlit jali, jali doors`],
  [108.5, 118, 'Bed Room 3', `13'1½" x 10'4½" · taupe panelled headboard wall, sage linens`],
  [119, 124.5, 'Balcony', `4'3" wide · deck flooring, lounger, planters`],
  [135, 148, 'Bed Room 2', `14'0" x 10'4½" · blue-grey & oak, study desk, wardrobe`],
];

const v = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return new THREE.Vector3().addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t)
    .addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1)
    .addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t)
    .addScaledVector(p3, 0.5 * t3 - 0.5 * t2);
}

// Returns camera position and look target (feet) at time t.
export function cameraAt(t) {
  t = THREE.MathUtils.clamp(t, 0, DURATION);
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1][0] <= t) i++;
  const k = (j) => keys[THREE.MathUtils.clamp(j, 0, keys.length - 1)];
  const [t0] = k(i), [t1] = k(i + 1);
  const u = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
  const pos = catmull(v(k(i - 1)[1]), v(k(i)[1]), v(k(i + 1)[1]), v(k(i + 2)[1]), u);
  const tgt = catmull(v(k(i - 1)[2]), v(k(i)[2]), v(k(i + 1)[2]), v(k(i + 2)[2]), u);
  return { pos, tgt };
}

export function labelAt(t) {
  for (const [a, b, title, sub] of LABELS) {
    if (t >= a && t <= b) {
      const fade = Math.min(1, (t - a) / 0.8, (b - t) / 0.8);
      return { title, sub, opacity: Math.max(0, fade) };
    }
  }
  return null;
}
