// Procedural canvas textures, so the project needs no external image assets.
import * as THREE from 'three';

let seed = 1337;
export function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const rr = (a, b) => a + (b - a) * rand();

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function toTex(c, { repeat = true, color = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

function noise(ctx, w, h, amount, alpha = 0.05) {
  for (let i = 0; i < amount; i++) {
    const v = Math.floor(rr(0, 255));
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(rr(0, w), rr(0, h), rr(1, 3), rr(1, 3));
  }
}

function veins(ctx, w, h, count, color, maxWidth) {
  for (let i = 0; i < count; i++) {
    let x = rr(0, w), y = rr(0, h);
    let a = rr(-0.6, 0.6) + (rand() > 0.5 ? 0 : Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = rr(0.4, maxWidth);
    ctx.globalAlpha = rr(0.15, 0.55);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = Math.floor(rr(40, 120));
    for (let s = 0; s < steps; s++) {
      a += rr(-0.35, 0.35);
      x += Math.cos(a) * 8; y += Math.sin(a) * 8;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Large-format (2'x4') Italian-marble-look vitrified tiles. Texture covers 4ft x 4ft.
export function marbleFloor() {
  const S = 1024;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = '#ebe6de';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 2; i++) {
    const g = ctx.createRadialGradient(rr(0, S), rr(0, S), 10, rr(0, S), rr(0, S), S * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(220,212,200,0.0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  }
  veins(ctx, S, S, 22, '#b9afa3', 2.2);
  veins(ctx, S, S, 10, '#9d9284', 1.2);
  noise(ctx, S, S, 8000, 0.03);
  // grout: tiles are 2ft x 4ft -> vertical line at middle, horizontal at edge
  ctx.fillStyle = 'rgba(150,140,128,0.55)';
  ctx.fillRect(0, 0, S, 2);
  ctx.fillRect(0, 0, 2, S);
  ctx.fillRect(S / 2, 0, 2, S);
  return toTex(c);
}

// Quartz / marble slab with fine veins (countertops, table tops). Texture covers 4ft.
export function quartz(base = '#f2efea', vein = '#a8a29a') {
  const S = 1024;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  veins(ctx, S, S, 14, vein, 1.8);
  noise(ctx, S, S, 6000, 0.025);
  return toTex(c);
}

// Wood planks. `planks` true draws plank joints (flooring), else continuous veneer.
// Texture covers 4ft (u) x 4ft (v), grain runs along u.
export function wood(base = '#b98b5e', dark = '#8a5f3a', planks = false) {
  const W = 1024, H = 1024;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  const rows = planks ? 8 : 1;
  const rowH = H / rows;
  for (let r = 0; r < rows; r++) {
    const y0 = r * rowH;
    if (planks) {
      const shade = rr(-18, 18);
      ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 240 : 0},${shade > 0 ? 220 : 0},${Math.abs(shade) / 255})`;
      ctx.fillRect(0, y0, W, rowH);
    }
    for (let i = 0; i < (planks ? 26 : 140); i++) {
      const y = y0 + rr(0, rowH);
      ctx.strokeStyle = dark;
      ctx.globalAlpha = rr(0.05, 0.25);
      ctx.lineWidth = rr(0.5, 2.5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * rr(0.5, 3));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (planks) {
      ctx.fillStyle = 'rgba(60,40,25,0.55)';
      ctx.fillRect(0, y0, W, 2);
      const off = rr(0, W);
      ctx.fillRect(off, y0, 2, rowH);
      ctx.fillRect((off + W / 2) % W, y0, 2, rowH);
    }
  }
  noise(ctx, W, H, 5000, 0.03);
  return toTex(c);
}

// Herringbone wooden deck for the sit-out. Texture covers 4ft.
export function herringbone() {
  const S = 1024;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = '#8c6644';
  ctx.fillRect(0, 0, S, S);
  const L = 256, Wd = 64;
  for (let k = -8; k < 16; k++) {
    for (let j = -4; j < 12; j++) {
      const x = j * L / 2 + k * 0, y = k * Wd * 2 + j * Wd * 0;
      for (const dir of [0, 1]) {
        ctx.save();
        ctx.translate(j * Wd * 2 + (dir ? Wd : 0), k * Wd * 2 - j * Wd * 2 + (dir ? 0 : 0));
        ctx.rotate(dir ? Math.PI / 4 : -Math.PI / 4);
        const tone = Math.floor(rr(110, 160));
        ctx.fillStyle = `rgb(${tone + 20},${tone - 10},${tone - 45})`;
        ctx.fillRect(0, 0, L, Wd);
        ctx.strokeStyle = 'rgba(40,25,15,0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, L, Wd);
        ctx.restore();
      }
      void x; void y;
    }
  }
  noise(ctx, S, S, 6000, 0.04);
  return toTex(c);
}

// Glossy subway tiles for the kitchen backsplash. Texture covers 2ft.
export function subway(color = '#f3efe7', grout = '#cfc7bb') {
  const S = 512;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, S, S);
  const tw = S / 4, th = S / 8;
  for (let r = 0; r < 8; r++) {
    for (let k = -1; k < 5; k++) {
      const x = k * tw + (r % 2 ? tw / 2 : 0);
      const v = Math.floor(rr(-6, 6));
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, r * th + 2, tw - 4, th - 4);
      ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 100})`;
      ctx.fillRect(x + 2, r * th + 2, tw - 4, th - 4);
    }
  }
  return toTex(c);
}

// Large format matte bathroom tiles. Texture covers 4ft.
export function bathTile(color = '#bdb8b0', grout = '#8f8a83') {
  const S = 512;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, S, S);
  veins(ctx, S, S, 6, '#9a948c', 1.0);
  noise(ctx, S, S, 4000, 0.04);
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, S, 2); ctx.fillRect(0, S / 2, S, 2);
  ctx.fillRect(0, 0, 2, S); ctx.fillRect(S / 2, 0, 2, S);
  return toTex(c);
}

// Subtle woven fabric.
export function fabric(base = '#9a9a8c') {
  const S = 256;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < S; i += 3) {
    ctx.fillStyle = `rgba(255,255,255,${rr(0.02, 0.06)})`;
    ctx.fillRect(0, i, S, 1);
    ctx.fillStyle = `rgba(0,0,0,${rr(0.02, 0.06)})`;
    ctx.fillRect(i, 0, 1, S);
  }
  noise(ctx, S, S, 2000, 0.04);
  return toTex(c);
}

// Rugs with modern geometric patterns. Returns a non-repeating texture.
export function rug(style, colors) {
  const S = 1024;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, S, S);
  if (style === 'border') {
    ctx.strokeStyle = colors[1]; ctx.lineWidth = 26;
    ctx.strokeRect(60, 60, S - 120, S - 120);
    ctx.strokeStyle = colors[2]; ctx.lineWidth = 6;
    ctx.strokeRect(110, 110, S - 220, S - 220);
  } else if (style === 'abstract') {
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = colors[1 + (i % (colors.length - 1))];
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(rr(0, S), rr(0, S), rr(80, 260), rr(40, 160), rr(0, 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (style === 'lines') {
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = colors[1 + (i % (colors.length - 1))];
      ctx.lineWidth = rr(3, 14);
      ctx.beginPath();
      const y = rr(0, S);
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(S * 0.3, y + rr(-200, 200), S * 0.6, y + rr(-200, 200), S, y + rr(-100, 100));
      ctx.stroke();
    }
  }
  for (let i = 0; i < 40000; i++) {
    ctx.fillStyle = `rgba(${rand() > 0.5 ? '255,255,255' : '0,0,0'},0.05)`;
    ctx.fillRect(rr(0, S), rr(0, S), 2, 2);
  }
  return toTex(c, { repeat: false });
}

// Abstract wall art.
export function art(palette, style = 'arches') {
  const W = 512, H = 640;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, W, H);
  if (style === 'arches') {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = palette[1 + (i % (palette.length - 1))];
      const r = rr(90, 180);
      const x = rr(r, W - r);
      const y = rr(H * 0.4, H * 0.95);
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 0);
      ctx.lineTo(x + r, H); ctx.lineTo(x - r, H);
      ctx.fill();
    }
    ctx.fillStyle = palette[palette.length - 1];
    ctx.beginPath(); ctx.arc(rr(100, 400), rr(100, 220), 50, 0, Math.PI * 2); ctx.fill();
  } else if (style === 'waves') {
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = palette[1 + (i % (palette.length - 1))];
      ctx.beginPath();
      const y0 = H * (i / 9);
      ctx.moveTo(0, y0);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, y0 + Math.sin(x / 60 + i) * 30);
      ctx.lineTo(W, H); ctx.lineTo(0, H);
      ctx.fill();
    }
  } else {
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = palette[1 + (i % (palette.length - 1))];
      ctx.fillRect(rr(0, W * 0.7), rr(0, H * 0.8), rr(80, 260), rr(60, 240));
    }
  }
  noise(ctx, W, H, 6000, 0.05);
  return toTex(c, { repeat: false });
}

// Pooja unit backlit CNC jali panel (emissive map).
export function jali() {
  const S = 512;
  const [c, ctx] = canvas(S);
  ctx.fillStyle = '#2a1a0c';
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = '#ffd38a';
  const n = 8, cell = S / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = i * cell + cell / 2, cy = j * cell + cell / 2;
      ctx.save();
      ctx.translate(cx, cy);
      for (let k = 0; k < 8; k++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, cell * 0.22, cell * 0.07, cell * 0.17, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath(); ctx.arc(0, 0, cell * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  return toTex(c);
}

// Content for TV screens.
export function screen() {
  const W = 512, H = 288;
  const [c, ctx] = canvas(W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0d2b45'); g.addColorStop(0.5, '#1f6f8b'); g.addColorStop(1, '#f2a65a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(10,20,30,0.85)';
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(140, 150); ctx.lineTo(230, 210); ctx.lineTo(340, 120); ctx.lineTo(W, H); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,210,0.9)';
  ctx.beginPath(); ctx.arc(390, 90, 26, 0, Math.PI * 2); ctx.fill();
  return toTex(c, { repeat: false });
}

// Soft vertical gradient used for the sky dome.
export function sky() {
  const [c, ctx] = canvas(16, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#6f9fd1');
  g.addColorStop(0.45, '#bcd6ec');
  g.addColorStop(0.52, '#f3e6d2');
  g.addColorStop(1, '#a9a596');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 512);
  return toTex(c, { repeat: false });
}
