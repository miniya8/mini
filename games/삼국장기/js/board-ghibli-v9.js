/* ============================================================================
 * [장기판 환경 — 지브리풍 애니메이션 장면 v9]  js/board-ghibli-v9.js   (이미지: assets/images/fx/env_g*.webp 등 직접 생성)
 *  수채화 같은 뭉게구름 · 열기구 · 민들레 홀씨 · 들꽃 · 종이학 · 연 · 연등 배 · 벚꽃 가지 · 제비 · 잎사귀 요정 …
 *  맵마다 4개씩 '느긋하고 포근한' 장면을 추가합니다. (기존 환경 이벤트는 그대로, 아래 장면이 같은 주기로 섞여 나옵니다)
 *   🏜️ 사막 : 열기구 행렬 · 별이 흐르는 밤하늘 · 들꽃 만개 · 뭉게구름 그림자
 *   ❄️ 설원 : 눈 위 발자국 · 분홍 노을 눈구름 · 눈꽃 축제 · 얼음 마을 등불
 *   🌲 숲   : 민들레 홀씨 · 잎사귀 요정 · 풀밭을 쓰는 바람 · 소나기 뒤 무지개
 *   🏯 암흑 : 커다란 달과 박쥐 · 밤의 등불 행렬 · 보랏빛 안개와 별가루 · 낙엽 회오리
 *   ⚔️ 고성 : 종이학 · 연날리기 · 연등 배 강물 · 벚꽃 가지
 *  (모두 직접 만든 오리지널 일러스트이며 특정 작품의 캐릭터를 쓰지 않았습니다)
 * ============================================================================ */
(function jgGhibli9() {
  if (window.jgScenes9) return;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const outBack = k => { k = clamp(k, 0, 1); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const fract = v => v - Math.floor(v);
  const R = (s, i, k) => fract(Math.sin((i + 1) * 12.9898 + k * 78.233 + s * 3.17) * 43758.5453);
  const E3 = () => window.jgEnv3 || {}, API = () => E3().api || {}, E3IM = () => E3().img || {};
  const DIR = 'assets/images/fx/', IM = {};
  ['gcloud', 'dandelion', 'balloon', 'kite', 'footprint', 'wildflower', 'origami', 'boat', 'grass', 'milkyway', 'moon', 'cherry', 'swallow', 'fairy'].forEach(n => { const i = new Image(); i.src = DIR + 'env_' + n + '.webp'; IM[n] = i; });
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
  const tc = {};
  function tint(img, key, rgb, a) { const id = key + rgb + a; if (tc[id]) return tc[id]; const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }
  function put(g, im, sx, sy, sw, sh, cx, cy, w, h, a, rot, flip) { if (!ok(im) || a <= .004) return; g.save(); g.translate(cx, cy); if (rot) g.rotate(rot); if (flip) g.scale(-1, 1); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, sx, sy, sw, sh, -w / 2, -h / 2, w, h); g.restore(); }
  const glow = (g, key, x, y, size, a) => { const im = E3IM()[key]; if (!ok(im) || a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, x - size / 2, y - size / 2, size, size); g.restore(); };
  const st = (wx, kind) => (wx.s9 && wx.s9.kind === kind) ? wx.s9 : (wx.s9 = { kind, seed: wx.seed || Math.random() * 100, list: [], acc: 0 });
  let CB = null;
  const cloud = (g, i, x, y, w, a, rgb, ta) => { const im = IM.gcloud; if (!ok(im)) return; if (CB) { const e1 = ease(clamp((x - (CB.x - w * .15)) / (w * .45), 0, 1)), e2 = ease(clamp(((CB.x + CB.w + w * .15) - x) / (w * .45), 0, 1)); a *= e1 * e2; if (a <= .004) return; } const src = rgb ? tint(im, 'gc', rgb, ta || .45) : im; g.save(); g.globalAlpha = clamp(a, 0, 1); g.drawImage(src, (i % 2) * 512, ((i / 2) | 0) * 320, 512, 320, x - w / 2, y - w * .31, w, w * .625); g.restore(); };
  const WASH = (tn, rgb, a, env) => tn(rgb, a * env);

  const SCENES = {
    /* ================= 🏜️ 사막 ================= */
    s9_balloons(g, el, env, B0, S, C, wx, dt, tn) {
      WASH(tn, '255,210,150', .1, env); const s = st(wx, 's9_balloons'), b = IM.balloon; if (!ok(b)) return;
      for (let i = 0; i < 5; i++) {
        const sp = .55 + R(s.seed, i, 1) * .5, prog = clamp((el / wx.dur) * sp + R(s.seed, i, 2) * .25 - .1, -.2, 1.25), depth = .6 + R(s.seed, i, 3) * .7, w = C * 4.2 * depth;
        const x = B0.x - w * .6 + (B0.w + w * 1.2) * prog, base = B0.y + B0.h * (.78 - .5 * R(s.seed, i, 4)), y = base - Math.sin(prog * 3) * C * .6 - prog * C * 1.2 + Math.sin(el * .7 + i) * C * .12, a = env * ease(Math.min(1, (prog + .2) * 6)) * (1 - ease((prog - 1) * 5));
        if (a <= .01) continue;
        g.save(); g.globalAlpha = .16 * a; g.fillStyle = '#3a2a40'; g.beginPath(); g.ellipse(x + C * .8, y + B0.h * .12, w * .34, w * .12, 0, 0, TAU); g.fill(); g.restore();
        put(g, b, (i % 3) * 160, 0, 160, 240, x, y, w, w * 1.5, a, Math.sin(el * .9 + i * 1.7) * .05);
        if (Math.random() < .03 * env) API().sp('dot', x + rnd(-w * .3, w * .3), y + w * .5, { col: [255, 236, 190], size: rnd(1.2, 2.4), a: .9, life: 1.4, vy: rnd(8, 20), add: true });
      }
    },
    s9_nightsky(g, el, env, B0, S, C, wx, dt, tn) {
      const s = st(wx, 's9_nightsky'), mw = IM.milkyway, mo = IM.moon; const d = ease(Math.min(1, el / 5));
      g.save(); const gr = g.createRadialGradient(B0.x + B0.w / 2, B0.y + B0.h * .35, B0.w * .1, B0.x + B0.w / 2, B0.y + B0.h * .5, B0.h * .85); gr.addColorStop(0, `rgba(30,40,110,${.12 * env * d})`); gr.addColorStop(1, `rgba(8,10,44,${.44 * env * d})`); g.fillStyle = gr; g.fillRect(B0.x - C, B0.y - C, B0.w + 2 * C, B0.h + 2 * C); g.restore();
      if (ok(mw)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(B0.x + B0.w * (.5 + .05 * Math.sin(el * .05)), B0.y + B0.h * .3); g.rotate(-.42); g.globalAlpha = .85 * env * d; const w = B0.h * 1.15; g.drawImage(mw, -w / 2, -w * .125, w, w * .25); g.restore(); }
      for (let i = 0; i < 46; i++) { const x = B0.x + B0.w * R(s.seed, i, 1), y = B0.y + B0.h * R(s.seed, i, 2) * .75, tw = .35 + .65 * Math.pow(Math.sin(el * (1.2 + R(s.seed, i, 3)) + i) * .5 + .5, 2); glow(g, 'v2_glow_y', x, y, C * (.22 + .3 * R(s.seed, i, 4)), tw * .6 * env * d); }
      if (ok(mo)) { g.save(); g.globalAlpha = .95 * env * d; const z = C * 4.2, mx = B0.x + B0.w * .8, my = B0.y + B0.h * .13; g.drawImage(mo, mx - z / 2, my - z / 2, z, z); g.restore(); }
      s.acc += dt; if (s.acc > 2.4 && env > .4) { s.acc = 0; s.list.push({ x: B0.x + B0.w * rnd(.2, .9), y: B0.y + B0.h * rnd(.02, .3), vx: -S * rnd(.5, .8), vy: S * rnd(.25, .4), t: 0 }); }
      const rb = E3IM().wl_ribbon; for (let i = s.list.length - 1; i >= 0; i--) { const m = s.list[i]; m.t += dt; m.x += m.vx * dt; m.y += m.vy * dt; if (m.t > 1.1) { s.list.splice(i, 1); continue; } const a = Math.sin(clamp(m.t / 1.1, 0, 1) * Math.PI) * env; glow(g, 'v2_glow_y', m.x, m.y, C * .8, a); if (ok(rb)) { const L = C * 5, ang = Math.atan2(m.vy, m.vx); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(m.x, m.y); g.rotate(ang + Math.PI); g.globalAlpha = a * .8; g.drawImage(rb, 0, -C * .22, L, C * .44); g.restore(); } }
    },
    s9_superbloom(g, el, env, B0, S, C, wx, dt, tn) {
      WASH(tn, '255,225,170', .08, env); const s = st(wx, 's9_superbloom'), fl = IM.wildflower; if (!ok(fl)) return;
      if (!s.list.length) for (let i = 0; i < 46; i++) { const side = R(s.seed, i, 1); let x, y; if (side < .28) { x = B0.x + C * R(s.seed, i, 2) * .9; y = B0.y + B0.h * R(s.seed, i, 3); } else if (side < .56) { x = B0.x + B0.w - C * R(s.seed, i, 2) * .9; y = B0.y + B0.h * R(s.seed, i, 3); } else if (side < .78) { x = B0.x + B0.w * R(s.seed, i, 2); y = B0.y + B0.h * (1 - .035 * R(s.seed, i, 3)); } else { x = B0.x + B0.w * R(s.seed, i, 2); y = B0.y + B0.h * .035 * R(s.seed, i, 3) + C * .6; } s.list.push({ x, y, c: i % 5, t: R(s.seed, i, 4) * wx.dur * .4, sz: C * (.8 + R(s.seed, i, 5) * .9) }); }
      s.list.forEach((f, i) => { const q = clamp((el - f.t) / 1.8, 0, 1); if (q <= 0) return; const sw = Math.sin(el * 1.3 + i) * .08, a = env * ease(q * 2.4); g.save(); g.translate(f.x, f.y); g.rotate(sw); g.globalAlpha = a; const w = f.sz * outBack(q); g.drawImage(fl, f.c * 96, 0, 96, 128, -w * .375, -w, w * .75, w); g.restore(); });
      s.bf = (s.bf || 0) + dt; if (s.bf > 1.6 && env > .5) { s.bf = 0; API().sp('butterfly', B0.x - C, B0.y + B0.h * rnd(.2, .8), { col: [[255, 200, 120], [200, 170, 255], [255, 170, 190]][(Math.random() * 3) | 0], size: C * .16, a: .95, life: 14, vx: S * .06, vy: rnd(-12, 12), sway: 18, swf: 2 }); }
      if (Math.random() < .25 * env) API().sp('dot', B0.x + B0.w * Math.random(), B0.y + B0.h * (.6 + .4 * Math.random()), { col: [255, 240, 170], size: rnd(1.2, 2.4), a: .85, life: rnd(2.5, 4), vy: -rnd(8, 22), vx: rnd(-6, 10), add: true });
    },
    s9_cloudshade(g, el, env, B0, S, C, wx, dt, tn) {
      const s = st(wx, 's9_cloudshade'); if (!ok(IM.gcloud)) return;
      for (let i = 0; i < 5; i++) { const sp = .35 + R(s.seed, i, 1) * .3, u = fract(R(s.seed, i, 2) + el * .012 * sp), x = B0.x - B0.w * .3 + B0.w * 1.6 * u, y = B0.y + B0.h * (.12 + .7 * R(s.seed, i, 3)), w = B0.w * (.5 + .4 * R(s.seed, i, 4));
        const fe = ease(clamp((x - (B0.x - w * .15)) / (w * .45), 0, 1)) * ease(clamp(((B0.x + B0.w + w * .15) - x) / (w * .45), 0, 1)); g.save(); g.globalAlpha = .13 * env * fe; const sh = tint(IM.gcloud, 'cs', '30,20,60', 1); g.translate(x + C * 1.2, y + C * .8); g.scale(1, .5); g.drawImage(sh, (i % 2) * 512, (((i / 2) | 0) % 2) * 320, 512, 320, -w / 2, -w * .31, w, w * .625); g.restore(); }
      for (let i = 0; i < 4; i++) { const u = fract(R(s.seed, i + 9, 2) + el * .01), x = B0.x - B0.w * .3 + B0.w * 1.6 * u, y = B0.y - C * .3 + B0.h * .16 * R(s.seed, i, 6); cloud(g, i, x, y, B0.w * (.55 + .25 * R(s.seed, i, 7)), .62 * env); }
      const sw = IM.swallow; if (ok(sw)) for (let i = 0; i < 5; i++) { const u = fract(el * .028 + i * .045), x = B0.x - C * 2 + (B0.w + C * 4) * u, y = B0.y + B0.h * (.3 + .08 * Math.sin(u * 6 + i)) + i * C * .5, f = ((el * 9 + i) | 0) & 3, z = C * 1.2, al = env * Math.sin(clamp(u, 0, 1) * Math.PI) ** .4; put(g, sw, f * 64, 0, 64, 48, x, y, z, z * .75, al, Math.sin(u * 6 + i) * .15); }
    },
    /* ================= ❄️ 설원 ================= */
    s9_footprints(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('190,215,255', .06 * env); const s = st(wx, 's9_footprints'), fp = IM.footprint; if (!ok(fp)) return;
      if (!s.list.length) for (let tr = 0; tr < 3; tr++) { const y0 = B0.y + B0.h * (.22 + .28 * tr + .08 * R(s.seed, tr, 1)), dir = tr % 2 ? -1 : 1, n = 24, kind = tr === 2 ? 1 : 0; for (let i = 0; i < n; i++) { const u = i / (n - 1), x = dir > 0 ? B0.x - C * .5 + (B0.w + C) * u : B0.x + B0.w + C * .5 - (B0.w + C) * u, y = y0 + Math.sin(u * 6 + tr) * C * 1.1 + (i % 2 ? C * .22 : -C * .22), ang = Math.atan2(Math.cos(u * 6 + tr) * 6 * C * 1.1 / (B0.w), dir) * 0 + (dir > 0 ? 0 : Math.PI); s.list.push({ x, y, t: tr * wx.dur * .22 + u * wx.dur * .34, kind, ang: ang + (i % 2 ? .12 : -.12), sz: C * (kind ? .5 : .62) }); } }
      s.list.forEach(p => { const q = el - p.t; if (q < 0) return; const a = env * ease(q / .6) * (1 - ease((q - wx.dur * .42) / 4)); if (a <= .01) return; put(g, fp, p.kind * 64, 0, 64, 64, p.x, p.y, p.sz, p.sz, a * .9, p.ang + Math.PI / 2); if (q < .12 && !p.puff) { p.puff = 1; API().sp('puff', p.x, p.y, { col: [235, 245, 255], size: C * .5, a: .3, life: 1.2, vy: -10, grow: 1 }); } });
      const lead = s.list.filter(p => el - p.t > 0 && el - p.t < .5).pop(); if (lead) { glow(g, 'v2_glow_b', lead.x, lead.y, C * 1.2, .35 * env); if (Math.random() < .5) API().sp('dot', lead.x, lead.y, { col: [225, 245, 255], size: rnd(1.2, 2.4), a: 1, life: 1.2, vy: -rnd(8, 24), add: true }); }
      every(.12, () => API().sp('dot', rnd(B0.x, B0.x + B0.w), B0.y - 8, { col: [240, 250, 255], size: rnd(1, 2.2), a: .85, life: 7, vy: S * rnd(.05, .1), vx: rnd(-6, 10), add: true }));
    },
    s9_snowcloud(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('255,205,215', .09 * env); const s = st(wx, 's9_snowcloud'); if (!ok(IM.gcloud)) return;
      for (let i = 0; i < 5; i++) { const u = fract(R(s.seed, i, 2) + el * .008 * (.6 + R(s.seed, i, 1))), x = B0.x - B0.w * .3 + B0.w * 1.6 * u, y = B0.y + B0.h * (.04 + .22 * R(s.seed, i, 3)), w = B0.w * (.55 + .35 * R(s.seed, i, 4)); cloud(g, i, x, y, w, .7 * env, i % 2 ? '255,196,214' : '196,214,255', .45); }
      every(.06, () => API().sp('crystal', rnd(B0.x - 20, B0.x + B0.w + 20), B0.y - 10, { col: [255, 246, 252], size: rnd(C * .1, C * .26), a: .95, life: 8, vy: S * rnd(.06, .13), vx: rnd(-6, 12), sway: rnd(8, 20), swf: rnd(.7, 1.4), vr: rnd(-1.2, 1.2) }));
      every(.35, () => API().sp('dot', rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), { col: [255, 235, 245], size: rnd(1.4, 2.6), a: .9, life: rnd(.8, 1.4), add: true }));
    },
    s9_snowfestival(g, el, env, B0, S, C, wx, dt, tn) {
      tn('200,225,255', .1 * env); const sn = E3IM().snow, s = st(wx, 's9_snowfestival'); if (!ok(sn)) return;
      for (let i = 0; i < 16; i++) { const per = 12 + R(s.seed, i, 1) * 6, ph = fract((el + R(s.seed, i, 2) * per) / per), x = B0.x + B0.w * R(s.seed, i, 3) + Math.sin(el * .5 + i * 2) * C * .8, y = B0.y - C + (B0.h + C * 2) * ph, sz = C * (1 + 2.4 * R(s.seed, i, 4)), a = env * Math.sin(ph * Math.PI) ** .6, hue = ['255,255,255', '200,225,255', '255,215,235', '210,255,240'][i % 4];
        glow(g, 'v2_glow_b', x, y, sz * 1.8, .22 * a); g.save(); g.translate(x, y); g.rotate(el * .3 * (i % 2 ? 1 : -1) + i); g.globalAlpha = a * .95; g.drawImage(tint(sn, 'sf', hue, .55), (i % 4) * 64, 0, 64, 64, -sz / 2, -sz / 2, sz, sz); g.restore(); }
      if (Math.random() < .3 * env) API().sp('dot', B0.x + B0.w * Math.random(), B0.y + B0.h * Math.random(), { col: [255, 245, 255], size: rnd(1.4, 2.8), a: 1, life: rnd(.6, 1.2), add: true });
    },
    s9_icelamps(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('255,190,130', .07 * env); const ln = E3IM().lantern, s = st(wx, 's9_icelamps'); if (!ok(ln)) return;
      for (let i = 0; i < 10; i++) { const left = i % 2 === 0, row = (i >> 1) / 4.2, x = left ? B0.x + C * .1 : B0.x + B0.w - C * .1, y = B0.y + B0.h * (.06 + .88 * row), t0 = R(s.seed, i, 1) * wx.dur * .35, q = clamp((el - t0) / 2.2, 0, 1), fl = .78 + .22 * Math.sin(el * 6 + i * 3), sw = Math.sin(el * .9 + i) * C * .1, sz = C * 1.15;
        if (q <= 0) continue; glow(g, 'v2_glow_o', x + sw, y, sz * 3.4, .5 * q * fl * env); put(g, ln, (i % 3) * 96, 0, 96, 128, x + sw, y, sz, sz * 1.33, ease(q) * env, sw / C * .6); }
      every(.2, () => API().sp('puff', B0.x + B0.w * Math.random(), B0.y + B0.h, { col: [235, 245, 255], size: S * rnd(.08, .13), a: .15, life: 4, vy: -rnd(6, 16), grow: 1, fadeIn: true }));
      every(.09, () => API().sp('crystal', rnd(B0.x, B0.x + B0.w), B0.y - 8, { col: [245, 252, 255], size: rnd(C * .08, C * .2), a: .9, life: 8, vy: S * rnd(.05, .1), sway: 12, swf: 1, vr: rnd(-1, 1) }));
    },
    /* ================= 🌲 숲 ================= */
    s9_dandelions(g, el, env, B0, S, C, wx, dt, tn) {
      tn('255,250,215', .07 * env); const dn = IM.dandelion, s = st(wx, 's9_dandelions'); if (!ok(dn)) return;
      for (let i = 0; i < 20; i++) { const per = 16 + R(s.seed, i, 1) * 10, ph = fract((el + R(s.seed, i, 2) * per) / per), x = B0.x - C + (B0.w + C * 2) * ph + Math.sin(el * .8 + i * 1.9) * C * .7, y = B0.y + B0.h * (.92 - .8 * R(s.seed, i, 3)) - ph * B0.h * .22 + Math.sin(el * 1.1 + i) * C * .5, sz = C * (1.4 + R(s.seed, i, 4) * 1.2), a = env * Math.sin(ph * Math.PI) ** .5;
        glow(g, 'v2_glow_y', x, y - sz * .2, sz * 1.5, .3 * a); put(g, dn, (i % 4) * 96, 0, 96, 96, x, y, sz, sz, a, Math.sin(el * .9 + i) * .35 + .2); }
      const ry = E3IM().v2_rays_y; if (ok(ry)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(B0.x + B0.w * .9, B0.y - C * .5); g.rotate(el * .03); g.globalAlpha = .13 * env; g.drawImage(ry, -B0.w * .7, -B0.w * .7, B0.w * 1.4, B0.w * 1.4); g.restore(); }
    },
    s9_fairies(g, el, env, B0, S, C, wx, dt, tn) {
      tn('120,230,170', .06 * env); const fr = IM.fairy, s = st(wx, 's9_fairies'); if (!ok(fr)) return;
      for (let i = 0; i < 9; i++) { const sp = .25 + R(s.seed, i, 1) * .3, cx = B0.x + B0.w * (.15 + .7 * R(s.seed, i, 2)), cy = B0.y + B0.h * (.15 + .7 * R(s.seed, i, 3)), a = el * sp + i * 1.7, x = cx + Math.cos(a) * B0.w * .22 + Math.sin(a * 2.1) * C * .6, y = cy + Math.sin(a * 1.3) * B0.h * .14, f = ((el * 10 + i * 3) | 0) & 3, sz = C * (.95 + R(s.seed, i, 4) * .5), al = env * (.7 + .3 * Math.sin(el * 3 + i));
        glow(g, 'v2_glow_g', x, y + sz * .1, sz * 2.8, .5 * al); glow(g, 'v2_glow_y', x, y + sz * .1, sz * 1.2, .5 * al); put(g, fr, f * 64, 0, 64, 64, x, y, sz, sz, al, Math.sin(a) * .2, Math.cos(a) < 0);
        if (Math.random() < .5 * env) API().sp('dot', x + rnd(-4, 4), y + sz * .2, { col: i % 2 ? [190, 255, 210] : [255, 245, 170], size: rnd(1.2, 2.6), a: .95, life: rnd(1, 1.8), vy: rnd(6, 24), vx: rnd(-10, 10), add: true }); }
    },
    s9_meadowwind(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('150,230,150', .06 * env); const gr = IM.grass, s = st(wx, 's9_meadowwind'); if (!ok(gr)) return;
      const pos = [], n = 26; for (let i = 0; i < n; i++) { const u = i / (n - 1); pos.push([B0.x + B0.w * u, B0.y + B0.h * (1.005 + .008 * Math.sin(i * 2)), 1]); } for (let i = 0; i < 12; i++) { const u = i / 11; pos.push([B0.x + C * .1, B0.y + B0.h * (.12 + .84 * u), .7], [B0.x + B0.w - C * .1, B0.y + B0.h * (.12 + .84 * u), .7]); }
      pos.forEach(([x, y, k], i) => { const gust = Math.sin(el * 1.6 - x * .012 + i * .3) * .16 + Math.sin(el * .6 + x * .004) * .1, sz = C * (1.25 + R(s.seed, i, 1) * .8) * k, grow = ease(clamp(el / 2.2 - R(s.seed, i, 2) * .5, 0, 1)); g.save(); g.translate(x, y); g.rotate(gust); g.globalAlpha = env * grow * .95; g.drawImage(gr, (i % 3) * 128, 0, 128, 128, -sz / 2, -sz * grow, sz, sz * grow); g.restore(); });
      every(.1, () => API().sp('leaf', B0.x - C, B0.y + B0.h * rnd(.1, 1), { col: [[110, 200, 90], [170, 220, 100], [230, 200, 90]][(Math.random() * 3) | 0], size: rnd(C * .1, C * .2), a: .95, life: 9, vx: S * rnd(.12, .22), vy: rnd(-16, 12), sway: rnd(10, 26), swf: rnd(1.5, 3), vr: rnd(-4, 4) }));
      every(.35, () => API().sp('petal', B0.x - C, B0.y + B0.h * rnd(.2, 1), { col: [255, 235, 245], size: rnd(C * .06, C * .12), a: .9, life: 8, vx: S * rnd(.1, .2), vy: rnd(-10, 14), sway: 14, swf: 2.4, vr: rnd(-4, 4) }));
    },
    s9_rainbowshower(g, el, env, B0, S, C, wx, dt, tn, every) {
      const s = st(wx, 's9_rainbowshower'), rb = E3IM().rainbow, ph = el / wx.dur, rain = ph < .45 ? Math.min(1, ph / .1) : Math.max(0, 1 - (ph - .45) / .12);
      tn(rain > .3 ? '140,170,200' : '255,240,200', (rain > .3 ? .12 : .08) * env);
      if (rain > .05) every(.03, () => API().sp('streak', rnd(B0.x - C, B0.x + B0.w + C), B0.y - 10, { col: [190, 225, 245], size: 1, len: C * rnd(.5, .9), a: .6 * rain, life: .9, vx: -S * .06, vy: S * rnd(1.1, 1.5), spr: 'drop' }));
      if (rain > .05) every(.1, () => API().ring && API().ring(rnd(B0.x, B0.x + B0.w), B0.y + B0.h * rnd(.4, .98), C * .1, C * .55, .7, '190,225,245', 1, .5));
      if (ph > .5 && ok(rb)) { const w = B0.w * 1.32, a = ease((ph - .5) / .14) * env * (1 - ease((ph - .94) / .06)); g.save(); g.globalAlpha = a * .85; g.drawImage(rb, B0.x + B0.w / 2 - w / 2, B0.y + B0.h * .92 - w * .5, w, w * .5); g.restore(); const ry = E3IM().v2_rays_y; if (ok(ry)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(B0.x + B0.w * .1, B0.y - C * .5); g.rotate(el * .03); g.globalAlpha = a * .2; g.drawImage(ry, -B0.w * .7, -B0.w * .7, B0.w * 1.4, B0.w * 1.4); g.restore(); } if (Math.random() < .4 * a) API().sp('dot', rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), { col: [255, 255, 235], size: rnd(1.4, 2.8), a: 1, life: rnd(.6, 1.2), add: true }); }
    },
    /* ================= 🏯 암흑 ================= */
    s9_bigmoon(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('60,30,100', .16 * env); const mo = IM.moon, s = st(wx, 's9_bigmoon'); const rise = ease(Math.min(1, el / 6));
      if (ok(mo)) { const z = B0.w * 1.05, mx = B0.x + B0.w * .62, my = B0.y + B0.h * (.3 - .1 * rise) + (1 - rise) * B0.h * .35; g.save(); g.globalAlpha = .9 * env; g.drawImage(mo, mx - z / 2, my - z / 2, z, z); g.restore(); glow(g, 'v2_glow_y', mx, my, z * 1.1, .2 * env); }
      if (ok(IM.gcloud)) for (let i = 0; i < 3; i++) { const u = fract(R(s.seed, i, 2) + el * .012), x = B0.x - B0.w * .3 + B0.w * 1.6 * u, y = B0.y + B0.h * (.16 + .1 * i); cloud(g, i, x, y, B0.w * (.5 + .2 * i), .55 * env, '70,40,120', .7); }
      s.acc += dt; if (s.acc > 2.2 && env > .4) { s.acc = 0; for (let k = 0; k < 5; k++) API().sp('bat', B0.x - C * (1 + k * .5), B0.y + B0.h * rnd(.12, .5), { col: [20, 10, 30], size: C * .16, a: 1, life: 14, vx: S * rnd(.07, .11), vy: rnd(-10, 10), sway: 20, swf: 2.2 }); }
    },
    s9_nightparade(g, el, env, B0, S, C, wx, dt, tn) {
      tn('50,20,80', .12 * env); const ln = E3IM().lantern, fr = IM.fairy, s = st(wx, 's9_nightparade'); if (!ok(ln)) return;
      for (let i = 0; i < 9; i++) { const u = fract(el * .02 + i / 9 - .1), x = B0.x - C + (B0.w + C * 2) * u, y = B0.y + B0.h * (.42 + .12 * Math.sin(u * 5 + 1)) + Math.sin(el * 1.1 + i) * C * .25, sz = C * 1.2, a = env * ease(Math.min(1, el / 3)) * Math.sin(clamp(u, 0, 1) * Math.PI) ** .4, fl = .8 + .2 * Math.sin(el * 7 + i);
        glow(g, 'v2_glow_p', x, y, sz * 4, .45 * a * fl); glow(g, 'v2_glow_o', x, y, sz * 2.4, .5 * a * fl); put(g, ln, (i % 3) * 96, 0, 96, 128, x, y, sz, sz * 1.33, a, Math.sin(el + i) * .06);
        if (ok(fr)) { const f = ((el * 9 + i) | 0) & 3, fx = x + sz * .9, fy = y - sz * .6 + Math.sin(el * 2 + i) * C * .2; glow(g, 'v2_glow_p', fx, fy, sz * 1.6, .4 * a); put(g, tint(fr, 'fp', '220,170,255', .6), f * 64, 0, 64, 64, fx, fy, sz * .7, sz * .7, a * .9); } }
    },
    s9_stardust(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('90,50,140', .14 * env); const s = st(wx, 's9_stardust'); if (ok(IM.gcloud)) for (let i = 0; i < 4; i++) { const u = fract(R(s.seed, i, 2) + el * .01 * (.6 + R(s.seed, i, 1))), x = B0.x - B0.w * .3 + B0.w * 1.6 * u, y = B0.y + B0.h * (.55 + .4 * R(s.seed, i, 3)); cloud(g, i, x, y, B0.w * (.6 + .3 * R(s.seed, i, 4)), .4 * env, '150,100,210', .75); }
      every(.05, () => API().sp('dot', rnd(B0.x, B0.x + B0.w), B0.y - 8, { col: [255, 240, 205], size: rnd(1.4, 3), a: 1, life: rnd(4, 7), vy: S * rnd(.03, .08), vx: rnd(-8, 8), sway: 8, swf: 1.4, add: true }));
      s.acc += dt; if (s.acc > 1.6 && env > .4) { s.acc = 0; s.list.push({ x: B0.x + B0.w * rnd(.2, 1), y: B0.y + B0.h * rnd(0, .3), vx: -S * rnd(.5, .9), vy: S * rnd(.3, .5), t: 0 }); }
      const rb = E3IM().wl_ribbon; for (let i = s.list.length - 1; i >= 0; i--) { const m = s.list[i]; m.t += dt; m.x += m.vx * dt; m.y += m.vy * dt; if (m.t > 1) { s.list.splice(i, 1); continue; } const a = Math.sin(clamp(m.t, 0, 1) * Math.PI) * env; glow(g, 'v2_glow_y', m.x, m.y, C * .8, a); if (ok(rb)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(m.x, m.y); g.rotate(Math.atan2(m.vy, m.vx) + Math.PI); g.globalAlpha = a * .8; g.drawImage(tint(rb, 'sd', '230,200,255', .7), 0, -C * .2, C * 5, C * .4); g.restore(); } }
    },
    s9_leafwhirl(g, el, env, B0, S, C, wx, dt, tn) {
      tn('120,60,30', .1 * env); const lf = E3IM().leaf, s = st(wx, 's9_leafwhirl'); if (!ok(lf)) return; const cx = B0.x + B0.w * (.5 + .12 * Math.sin(el * .15)), cy = B0.y + B0.h * .55;
      for (let i = 0; i < 46; i++) { const k = i / 46, a = el * (1.1 + k * .5) + i * 2.4, r = (.06 + .5 * ((i * .37 + el * .05) % 1)) * B0.w, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .55 - (r / B0.w) * B0.h * .25, sz = C * (.28 + .22 * R(s.seed, i, 1)), al = env * Math.sin(clamp(r / (B0.w * .56), 0, 1) * Math.PI) ** .6; if (al <= .01) continue;
        g.save(); g.translate(x, y); g.rotate(a * 1.4); g.globalAlpha = al; g.drawImage(tint(lf, 'lw', ['230,130,50', '200,80,40', '240,190,70'][i % 3], .8), (i % 6) * 64, 0, 64, 64, -sz / 2, -sz / 2, sz, sz); g.restore(); }
    },
    /* ================= ⚔️ 고성 ================= */
    s9_origami(g, el, env, B0, S, C, wx, dt, tn) {
      tn('255,235,225', .06 * env); const og = IM.origami, s = st(wx, 's9_origami'); if (!ok(og)) return;
      for (let i = 0; i < 14; i++) { const per = 14 + R(s.seed, i, 1) * 8, ph = fract((el + R(s.seed, i, 2) * per) / per), a = ph * 6 + i, x = B0.x + B0.w * (.2 + .6 * R(s.seed, i, 3)) + Math.cos(a) * B0.w * .12 * ph + ph * B0.w * .12 * (i % 2 ? 1 : -1), y = B0.y + B0.h * (1.05 - ph * 1.15), sz = C * (1.05 + R(s.seed, i, 4) * .5), al = env * Math.sin(ph * Math.PI) ** .5, f = ((el * 6 + i) | 0) & 3, rgb = i % 4 === 0 ? '255,170,185' : i % 4 === 1 ? '190,220,255' : null;
        glow(g, 'v2_glow_y', x, y, sz * 2, .18 * al); const im = rgb ? tint(og, 'og', rgb, .55) : og; put(g, im, f * 96, 0, 96, 80, x, y, sz, sz * .83, al, Math.sin(a) * .15 - .15, i % 2 === 0);
        if (Math.random() < .08 * env) API().sp('dot', x, y, { col: [255, 245, 220], size: rnd(1.2, 2.4), a: .9, life: 1.4, vy: rnd(8, 24), add: true }); }
    },
    s9_kites(g, el, env, B0, S, C, wx, dt, tn) {
      tn('255,225,190', .06 * env); const kt = IM.kite, s = st(wx, 's9_kites'); if (!ok(kt)) return;
      for (let i = 0; i < 4; i++) { const ax = B0.x + B0.w * (.12 + .25 * i), ay = B0.y + B0.h * 1.02, x = ax + Math.sin(el * .5 + i * 1.7) * B0.w * .12 + Math.sin(el * 1.3 + i) * C * .5, y = B0.y + B0.h * (.16 + .2 * R(s.seed, i, 1)) + Math.sin(el * .8 + i * 2) * C * 1.1, tilt = Math.sin(el * .9 + i) * .22, sz = C * (2.8 + R(s.seed, i, 2) * 1.2), a = env * ease(Math.min(1, el / 2.5 - i * .15));
        g.save(); g.globalAlpha = .5 * a; g.strokeStyle = 'rgba(255,248,235,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + x) / 2 + Math.sin(el * 2 + i) * C, (ay + y) / 2, x, y + sz * .25); g.stroke(); g.restore();
        g.save(); g.translate(x, y); g.rotate(tilt); g.globalAlpha = a; g.drawImage(kt, (i % 3) * 128, 0, 128, 256, -sz * .3, -sz * .1, sz * .6, sz * 1.2); g.restore(); }
    },
    s9_lanternriver(g, el, env, B0, S, C, wx, dt, tn) {
      tn('255,170,100', .08 * env); const bt = IM.boat, s = st(wx, 's9_lanternriver'); if (!ok(bt)) return; const ry = B0.y + B0.h * .5;
      for (let i = 0; i < 8; i++) { const u = fract(el * .018 + i / 8), x = B0.x - C + (B0.w + C * 2) * u, y = ry + Math.sin(el * 1.4 + i * 2) * C * .1 + (i % 2 ? C * .45 : -C * .4), sz = C * 1.5, a = env * Math.sin(clamp(u, 0, 1) * Math.PI) ** .5, fl = .8 + .2 * Math.sin(el * 7 + i * 3);
        glow(g, 'v2_glow_o', x, y - sz * .2, sz * 2.6, .3 * a * fl); put(g, bt, 0, 0, 128, 96, x, y, sz, sz * .75, a, Math.sin(el * 1.4 + i) * .04);
        if (Math.random() < .08 * env) API().ring && API().ring(x, y + sz * .3, C * .1, C * .6, .8, '255,200,140', 1, .4); if (Math.random() < .1 * env) API().sp('dot', x, y - sz * .3, { col: [255, 220, 150], size: rnd(1.2, 2.4), a: .95, life: 1.8, vy: -rnd(10, 30), add: true }); }
    },
    s9_cherrybranch(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('255,205,220', .08 * env); const ch = IM.cherry; if (ok(ch)) { const grow = ease(Math.min(1, el / 3)); [[0, 1], [1, -1]].forEach(([k, d]) => { const w = B0.w * .8, x = d > 0 ? B0.x - C * .2 : B0.x + B0.w + C * .2, y = B0.y - C * .3 + k * C * .6; g.save(); g.translate(x, y); g.rotate(Math.sin(el * .7 + k) * .02 * d); if (d < 0) g.scale(-1, 1); g.globalAlpha = env * grow; g.drawImage(ch, 0, 0, w * grow, w * .5 * grow); g.restore(); }); }
      every(.04, () => API().sp('petal', rnd(B0.x - C, B0.x + B0.w * .6), B0.y - 6, { col: [[255, 196, 214], [255, 226, 236], [250, 170, 200]][(Math.random() * 3) | 0], size: rnd(C * .07, C * .15), a: .95, life: rnd(6, 10), vx: S * rnd(.04, .14), vy: rnd(22, 60), sway: rnd(14, 34), swf: rnd(1.4, 3), vr: rnd(-3, 3) }));
      every(.5, () => API().sp('puff', B0.x - C, B0.y + B0.h * rnd(.1, .8), { col: [255, 210, 225], size: S * rnd(.08, .14), a: .12, life: 5, vx: S * .06, grow: 1, fadeIn: true }));
    }
  };

  window.jgScenes9 = {
    kinds: Object.keys(SCENES),
    draw(kind, g, now, dt, env, k, el, B0, S, tintFn, every, wx, C) {
      const fn = SCENES[kind]; if (!fn) return; const cell = C || (S / 12); wx.dur = wx.dur || 20; CB = B0;
      g.save(); try { fn(g, el, env, B0, S, cell, wx, dt, tintFn, every); } finally { g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    }
  };
})();
