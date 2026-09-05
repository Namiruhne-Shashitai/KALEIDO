import type { Palette } from './types';

/* Deterministic RNG */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${((h % 360) + 360) % 360}, ${s}%, ${l}%, ${a})`;
}

export function paletteFor(seed: number): string[] {
  const r = mulberry(seed);
  const base = Math.floor(r() * 360);
  return [
    hsl(base, 82, 62), hsl(base + 42, 88, 58), hsl(base + 160, 74, 55),
    hsl(base + 210, 80, 60), hsl(base + 300, 70, 64), hsl(base + 90, 60, 70),
  ];
}

/* Kaleidoscope art generator — the KaleidoEngine */
export function kaleido(seedStr: string, size = 512): string {
  const seed = hashStr(seedStr);
  const r = mulberry(seed);
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const cx = size / 2, cy = size / 2;
  const pal = paletteFor(seed);
  const dark = 8 + r() * 8;
  ctx.fillStyle = hsl(hashStr(seedStr + 'bg') % 360, 30, dark);
  ctx.fillRect(0, 0, size, size);

  const segments = 8 + Math.floor(r() * 5) * 2;
  const layers = 5 + Math.floor(r() * 3);
  const maxR = size * 0.52;

  for (let L = 0; L < layers; L++) {
    const rOuter = maxR * (1 - L / (layers + 0.6)) * (0.82 + r() * 0.3);
    const rInner = rOuter * (0.35 + r() * 0.35);
    const color = pal[Math.floor(r() * pal.length)];
    const color2 = pal[Math.floor(r() * pal.length)];
    const shape = Math.floor(r() * 4);
    const rot0 = r() * Math.PI * 2;
    for (let s = 0; s < segments; s++) {
      const ang = rot0 + (s / segments) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      for (const mirror of [1, -1]) {
        ctx.save();
        ctx.scale(mirror, 1);
        ctx.globalAlpha = 0.82;
        ctx.fillStyle = mirror === 1 ? color : color2;
        ctx.beginPath();
        if (shape === 0) { // petal
          ctx.moveTo(rInner, 0);
          ctx.quadraticCurveTo(rOuter * 0.8, rOuter * 0.22, rOuter, 0);
          ctx.quadraticCurveTo(rOuter * 0.8, -rOuter * 0.22, rInner, 0);
        } else if (shape === 1) { // triangle shard
          ctx.moveTo(rInner, 0);
          ctx.lineTo(rOuter, rOuter * 0.16);
          ctx.lineTo(rOuter * 0.9, -rOuter * 0.12);
        } else if (shape === 2) { // arc band
          ctx.arc(0, 0, rOuter, -0.16, 0.16);
          ctx.arc(0, 0, rInner, 0.16, -0.16, true);
        } else { // orb
          ctx.arc(rOuter * 0.72, 0, rOuter * 0.14, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    // sparkle dots ring
    if (r() > 0.4) {
      ctx.fillStyle = pal[Math.floor(r() * pal.length)];
      for (let s = 0; s < segments; s++) {
        const ang = rot0 + ((s + 0.5) / segments) * Math.PI * 2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * rOuter * 0.95, cy + Math.sin(ang) * rOuter * 0.95, size * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // core
  const coreR = size * (0.05 + r() * 0.05);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.4);
  g.addColorStop(0, hsl(hashStr(seedStr) % 360, 90, 78));
  g.addColorStop(1, 'transparent');
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, coreR * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffffdd';
  ctx.beginPath(); ctx.arc(cx, cy, coreR * 0.5, 0, Math.PI * 2); ctx.fill();

  return c.toDataURL('image/jpeg', 0.82);
}

export function avatarArt(seedStr: string, size = 384): string {
  // rounded clipping is applied via CSS (rounded-full + overflow-hidden)
  return kaleido(seedStr, size);
}

/* ---------- color extraction ---------- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function lum(r: number, g: number, b: number) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
function mix(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hex1); const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
function shade(hex: string, l: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => v + (l > 0 ? (255 - v) * l : v * l);
  return rgbToHex(f(r), f(g), f(b));
}

export function extractPaletteFromImage(dataUrl: string): Promise<Palette> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 48; c.height = 48;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 48, 48);
      const data = ctx.getImageData(0, 0, 48, 48).data;
      const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
      let sumL = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        sumL += lum(r, g, b);
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat < 0.18) continue;
        let hue = 0;
        if (max === r) hue = ((g - b) / (max - min)) % 6;
        else if (max === g) hue = (b - r) / (max - min) + 2;
        else hue = (r - g) / (max - min) + 4;
        const hk = Math.round((((hue * 60) + 360) % 360) / 24);
        const e = buckets.get(hk) ?? { r: 0, g: 0, b: 0, n: 0 };
        e.r += r; e.g += g; e.b += b; e.n++;
        buckets.set(hk, e);
      }
      const isDark = sumL / (48 * 48) < 0.45;
      const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
      const avg = (e: { r: number; g: number; b: number; n: number }) => rgbToHex(e.r / e.n, e.g / e.n, e.b / e.n);
      const dom = sorted.length ? avg(sorted[0]) : (isDark ? '#241a33' : '#efe9f6');
      const accents = sorted.slice(0, 4).map(avg);
      while (accents.length < 3) accents.push(shade(dom, accents.length % 2 ? 0.4 : -0.3));
      const bg = isDark ? shade(dom, -0.82) : shade(dom, 0.86);
      const surface = isDark ? shade(dom, -0.72) : shade(dom, 0.78);
      const surface2 = isDark ? shade(dom, -0.6) : shade(dom, 0.68);
      const text = isDark ? shade(dom, 0.88) : shade(dom, -0.85);
      const sub = mix(text, bg, 0.42);
      const line = mix(bg, text, 0.16);
      const boost = (h: string) => mix(h, isDark ? '#ffffff' : '#000000', isDark ? 0.12 : 0.05);
      resolve({ bg, surface, surface2, text, sub, line, a1: boost(accents[0]), a2: boost(accents[1] ?? accents[0]), a3: boost(accents[2] ?? accents[0]) });
    };
    img.onerror = () => resolve(PRESETS.prism.dark);
    img.src = dataUrl;
  });
}

/* ---------- theme presets ---------- */
export const PRESETS: Record<string, { dark: Palette; light: Palette }> = {
  prism: {
    dark: { bg: '#14101c', surface: '#1e1828', surface2: '#2a2138', text: '#f6f0fa', sub: '#a99fbd', line: '#382c4a', a1: '#ff5c7a', a2: '#ffb03a', a3: '#35d0ba' },
    light: { bg: '#f4f1f8', surface: '#ffffffee' as string, text: '#241a33', sub: '#6f6586', line: '#e2dcee', a1: '#e8446d', a2: '#e08a00', a3: '#0ea893', surface2: '#ece6f5' },
  },
  sunset: {
    dark: { bg: '#1c1014', surface: '#291721', surface2: '#38202d', text: '#fbf0ee', sub: '#c09aa6', line: '#4a2c3c', a1: '#ff6d4d', a2: '#ffc857', a3: '#f74f8b' },
    light: { bg: '#faf1ee', surface: '#fffaf7ee' as string, surface2: '#f6e4de', text: '#33181f', sub: '#8a6570', line: '#eed8d2', a1: '#e8502e', a2: '#d99a00', a3: '#d63a72' },
  },
  ocean: {
    dark: { bg: '#0c1520', surface: '#122233', surface2: '#1a3049', text: '#eef6fb', sub: '#8fb0c6', line: '#24405c', a1: '#29c5ff', a2: '#3ef2c0', a3: '#ff8e6e' },
    light: { bg: '#eef6fa', surface: '#fbfeffee' as string, surface2: '#dcebf3', text: '#122636', sub: '#5c7c92', line: '#d2e2ec', a1: '#0093d0', a2: '#00b28a', a3: '#e05f3d' },
  },
  candy: {
    dark: { bg: '#1d1220', surface: '#2b1a30', surface2: '#3b2542', text: '#fdf1f8', sub: '#c39fb6', line: '#4e3058', a1: '#ff7ac2', a2: '#7ee8a2', a3: '#ffd166' },
    light: { bg: '#fbf1f7', surface: '#fffafd' as string, surface2: '#f7e2ef', text: '#38142e', sub: '#94627f', line: '#f0d9e7', a1: '#e84fa4', a2: '#23b56a', a3: '#d99a00' },
  },
  forest: {
    dark: { bg: '#0e1712', surface: '#15241b', surface2: '#1e3326', text: '#eef8f0', sub: '#93b39e', line: '#2a4736', a1: '#5ad47a', a2: '#e8d44d', a3: '#6ecbe0' },
    light: { bg: '#eef7f0', surface: '#fafff8' as string, surface2: '#dcefe2', text: '#14291c', sub: '#5d7f69', line: '#d3e6da', a1: '#1f9e4d', a2: '#b39700', a3: '#2293ad' },
  },
  mono: {
    dark: { bg: '#131316', surface: '#1c1c21', surface2: '#26262d', text: '#f2f2f5', sub: '#9a9aa6', line: '#33333c', a1: '#e8e8f0', a2: '#9a9aa6', a3: '#5f5f6e' },
    light: { bg: '#f2f2f4', surface: '#fcfcfd' as string, surface2: '#e6e6ea', text: '#1a1a20', sub: '#6a6a76', line: '#dcdce2', a1: '#1a1a20', a2: '#6a6a76', a3: '#9a9aa6' },
  },
};

export const GRADIENT_PRESETS: { id: string; c1: string; c2: string; c3: string; angle: number }[] = [
  { id: 'g_aurora', c1: '#1b6f5a', c2: '#243b8f', c3: '#0d1b2a', angle: 130 },
  { id: 'g_lava', c1: '#8f1d1d', c2: '#e07b1f', c3: '#2a0e0e', angle: 120 },
  { id: 'g_lagoon', c1: '#0e7490', c2: '#134e4a', c3: '#0b1220', angle: 150 },
  { id: 'g_bloom', c1: '#a21caf', c2: '#be123c', c3: '#1e1030', angle: 115 },
  { id: 'g_citrus', c1: '#b45309', c2: '#3f6212', c3: '#151a10', angle: 140 },
  { id: 'g_nebula', c1: '#312e81', c2: '#0f766e', c3: '#0a0f1e', angle: 125 },
];

export function gradientCss(g: { c1: string; c2: string; c3: string; angle: number }): string {
  return `linear-gradient(${g.angle}deg, ${g.c1}, ${g.c2} 55%, ${g.c3})`;
}

/* ---------- app icon ---------- */
export function makeIconDataUrl(opts: { img?: string; logo: boolean }): Promise<string> {
  return new Promise((resolve) => {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d')!;
    const finish = (bgDrawn: boolean) => {
      if (!bgDrawn) {
        const g = ctx.createLinearGradient(0, 0, size, size);
        g.addColorStop(0, '#2a1a3e'); g.addColorStop(0.55, '#14101c'); g.addColorStop(1, '#0d2a26');
        ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
        // prism art
        const pal = ['#ff5c7a', '#ffb03a', '#35d0ba', '#5ac8fa'];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.save(); ctx.translate(size / 2, size / 2); ctx.rotate(a);
          ctx.fillStyle = pal[i % 4] + 'cc';
          ctx.beginPath();
          ctx.moveTo(40, 0); ctx.lineTo(200, 34); ctx.lineTo(200, -34); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
      if (opts.logo) {
        ctx.fillStyle = 'rgba(10,8,16,0.55)';
        ctx.beginPath(); ctx.arc(size / 2, size / 2, 108, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 18; ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2 - 58);
        ctx.lineTo(size / 2 + 56, size / 2 + 44);
        ctx.lineTo(size / 2 - 56, size / 2 + 44);
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(size / 2, size / 2 + 2, 14, 0, Math.PI * 2); ctx.fill();
      }
      resolve(c.toDataURL('image/png'));
    };
    // rounded mask
    const rad = size * 0.225;
    ctx.beginPath();
    ctx.moveTo(rad, 0); ctx.lineTo(size - rad, 0); ctx.arcTo(size, 0, size, rad, rad);
    ctx.lineTo(size, size - rad); ctx.arcTo(size, size, size - rad, size, rad);
    ctx.lineTo(rad, size); ctx.arcTo(0, size, 0, size - rad, rad);
    ctx.lineTo(0, rad); ctx.arcTo(0, 0, rad, 0, rad);
    ctx.closePath(); ctx.clip();
    if (opts.img) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        finish(true);
      };
      img.onerror = () => finish(false);
      img.src = opts.img;
    } else finish(false);
  });
}

/* ---------- image helpers ---------- */
export function fileToDataUrl(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = rd.result as string;
    };
    rd.onerror = reject;
    rd.readAsDataURL(file);
  });
}
