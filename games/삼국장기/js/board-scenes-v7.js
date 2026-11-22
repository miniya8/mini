/* ============================================================================
 * [장기판 환경 장면 v7]  js/board-scenes-v7.js   (이미지: assets/images/fx/env_*.webp, v2_*.webp, wl_*.webp)
 *  board-effects-v4.js 의 환경 이벤트 시스템에 '이미지로 그린' 맵 컨셉별 장면 15종을 추가합니다.
 *   🏜️ 사막   : 대상(낙타 행렬) · 모래 회오리 행렬 · 독수리 떼(그림자)
 *   ❄️ 설원   : 눈의 정령 · 함박눈(3겹) · 얼음 유성
 *   🌲 숲     : 발광 버섯 군락 · 나뭇잎 빛줄기 · 정령 덩굴
 *   🏯 암흑   : 혼불 · 까마귀 떼 · 마법진 솟구침
 *   ⚔️ 고성   : 하늘등 · 백학 · 벚꽃잎
 *  (선·원·타원으로만 그리던 기존 입자/번개/덩굴/링/참격도 board-effects-v4.js 에서 이미지로 교체되었습니다)
 * ============================================================================ */
(function jgScenes7Module() {
  if (window.jgScenes7) return;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const outBack = k => { k = clamp(k, 0, 1); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const fract = v => v - Math.floor(v);
  const E3 = () => window.jgEnv3 || {}, IM = () => E3().img || {}, API = () => E3().api || {};
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
  const tint = (im, key, rgb, a) => API().tintI ? API().tintI(im, key, rgb, a) : im;
  function put(g, im, sx, sy, sw, sh, cx, cy, w, h, a, rot, flip) {
    if (!ok(im) || a <= .004) return; g.save(); g.translate(cx, cy); if (rot) g.rotate(rot); if (flip) g.scale(-1, 1); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, sx, sy, sw, sh, -w / 2, -h / 2, w, h); g.restore();
  }
  const glowAt = (g, key, x, y, size, a) => { const im = IM()[key]; if (!ok(im) || a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, x - size / 2, y - size / 2, size, size); g.restore(); };
  const st = (wx, kind) => (wx.s7 && wx.s7.kind === kind) ? wx.s7 : (wx.s7 = { kind, seed: wx.seed || Math.random() * 100, t0: 0, list: [] });
  const R = (s, i, k) => fract(Math.sin((i + 1) * 12.9898 + k * 78.233 + s * 3.17) * 43758.5453);

  const SCENES = {
    /* ---------------- 🏜️ 사막 ---------------- */
    s7_caravan(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('230,170,100', .1 * env); const s = st(wx, 's7_caravan'), IMs = IM(), cam = IMs.camel; if (!ok(cam)) return;
      [[.27, 1, 1, .0], [.78, -1, .8, .12]].forEach(([yy, dir, sp, off], row) => {
        const n = 4 - row, gap = C * 2.3, prog = clamp(el / (wx.dur * .98) * sp + off, 0, 1.4), span = B0.w + gap * (n + 2), x0 = dir > 0 ? B0.x - gap * (n + 1) : B0.x + B0.w + gap * 2;
        for (let i = 0; i < n; i++) {
          const x = x0 + dir * (span * prog) + (dir > 0 ? i * gap : -i * gap) * (dir > 0 ? 1 : -1) * 1 - (dir > 0 ? 0 : 0), y = B0.y + B0.h * yy + Math.sin(el * 1.2 + i) * C * .03, f = ((el * 6 + i) | 0) & 3, w = C * (1.9 - row * .2), h = w * .8;
          g.save(); g.globalAlpha = .2 * env; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x, y + h * .42, w * .5, h * .1, 0, 0, TAU); g.fill(); g.restore();
          put(g, cam, f * 160, 0, 160, 128, x, y, w, h, .92 * env, 0, dir < 0);
          if (Math.random() < .25 * env) API().sp('puff', x - dir * w * .3, y + h * .42, { col: [214, 176, 118], size: C * rnd(.25, .45), a: .3, life: 1.4, vx: -dir * rnd(8, 24), vy: -rnd(6, 20), grow: 1 });
        }
      });
    },
    s7_funnels(g, el, env, B0, S, C, wx, dt, tn) {
      tn('210,160,90', .1 * env); const s = st(wx, 's7_funnels'), fu = IM().funnel; if (!ok(fu)) return;
      if (!s.list.length) for (let i = 0; i < 4; i++) s.list.push({ x: B0.x + B0.w * (i + .5) / 4, y: B0.y + B0.h * (.35 + .5 * R(s.seed, i, 1)), v: (R(s.seed, i, 2) - .5) * S * .08, ph: R(s.seed, i, 3) * 6, sc: .85 + R(s.seed, i, 4) * .5 });
      s.list.forEach((f, i) => {
        f.x += f.v * dt; if (f.x < B0.x - C) f.x = B0.x + B0.w + C; if (f.x > B0.x + B0.w + C) f.x = B0.x - C; const H = C * 7.2 * f.sc, Wd = H * .5, sw = Math.sin(el * 1.1 + f.ph) * C * .35;
        for (let l = 0; l < 3; l++) { g.save(); g.translate(f.x + sw * (1 + l * .3), f.y); g.scale(1 + l * .12 + Math.sin(el * 3 + l + f.ph) * .04, 1); g.globalAlpha = (.5 - l * .12) * env; g.drawImage(fu, -Wd / 2, -H, Wd, H); g.restore(); }
        if (Math.random() < .5 * env) API().sp('puff', f.x + rnd(-Wd * .3, Wd * .3), f.y, { col: [214, 176, 118], size: C * rnd(.5, .9), a: .3, life: 1.6, vx: rnd(-30, 30), vy: -rnd(10, 40), grow: 1.2 });
      });
    },
    s7_vultures(g, el, env, B0, S, C, wx, dt, tn) {
      tn('230,170,100', .08 * env); const bd = IM().bird; if (!ok(bd)) return; const cx = B0.x + B0.w / 2, cy = B0.y + B0.h / 2, s = st(wx, 's7_vultures');
      for (let i = 0; i < 5; i++) {
        const a = el * (.34 + i * .02) + i * TAU / 5, rx = B0.w * (.34 + .06 * R(s.seed, i, 1)), ry = B0.h * (.3 + .05 * R(s.seed, i, 2)), x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, tang = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx), f = ((el * 4 + i) | 0) & 3, sz = C * (2.2 + R(s.seed, i, 3) * .6);
        g.save(); g.translate(x + C * .35, y + C * .6); g.rotate(tang); g.globalAlpha = .22 * env; g.drawImage(tint(bd, 'vs', '0,0,0', 1), f * 64, 0, 64, 48, -sz / 2, -sz * .375, sz, sz * .75); g.restore();
        put(g, bd, f * 64, 0, 64, 48, x, y, sz * .9, sz * .67, .9 * env, tang);
      }
    },
    /* ---------------- ❄️ 설원 ---------------- */
    s7_snowspirits(g, el, env, B0, S, C, wx, dt, tn) {
      tn('150,200,255', .12 * env); const w = IM().wisp; if (!ok(w)) return; const s = st(wx, 's7_snowspirits');
      for (let i = 0; i < 9; i++) {
        const u = fract(R(s.seed, i, 1) + el * (.012 + .01 * R(s.seed, i, 2)) * (i % 2 ? 1 : -1)), x = B0.x + B0.w * u, y = B0.y + B0.h * (.15 + .7 * R(s.seed, i, 3)) + Math.sin(el * .8 + i * 1.7) * C * .8, dirn = i % 2 ? 1 : -1, sz = C * (2.6 + R(s.seed, i, 4) * 1.4);
        glowAt(g, 'v2_glow_b', x, y, sz * .9, .35 * env); g.save(); g.globalCompositeOperation = 'lighter'; put(g, tint(w, 'wi', '170,225,255', .9), (i % 4) * 128, 0, 128, 128, x, y, sz, sz, .75 * env, 0, dirn > 0); g.restore();
        if (Math.random() < .5 * env) API().sp('dot', x - dirn * sz * .25, y, { col: [220, 245, 255], size: rnd(1, 2.2), a: .9, life: rnd(.9, 1.6), vy: rnd(6, 20), add: true });
      }
    },
    s7_heavysnow(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('215,236,255', .16 * env); const sp = API().sp, gust = Math.sin(el * .5) * 20;
      every(.05, () => sp('crystal', rnd(B0.x - S * .1, B0.x + B0.w + S * .1), B0.y - 20, { col: [240, 250, 255], size: rnd(C * .1, C * .3), a: .95, life: 8, vy: S * rnd(.09, .2), vx: gust + rnd(-10, 10), sway: rnd(8, 26), swf: rnd(.6, 1.4), vr: rnd(-1.4, 1.4) }));
      every(.09, () => sp('dot', rnd(B0.x, B0.x + B0.w), B0.y - 10, { col: [235, 246, 255], size: rnd(1, 2), a: .8, life: 7, vy: S * rnd(.05, .09), vx: gust * .5, add: true }));
      every(.5, () => sp('puff', rnd(B0.x, B0.x + B0.w), B0.y + B0.h * rnd(.75, 1.0), { col: [225, 240, 255], size: S * rnd(.1, .17), a: .2, life: 4.2, vx: S * .02, grow: 1, fadeIn: true }));
    },
    s7_icemeteor(g, el, env, B0, S, C, wx, dt, tn) {
      tn('150,210,255', .14 * env); const s = st(wx, 's7_icemeteor'), mt = IM().meteor, api = API(); s.acc = (s.acc || 0) + dt;
      if (s.acc > .75 && env > .3) { s.acc = 0; const x = rnd(B0.x, B0.x + B0.w), ty = rnd(B0.y + B0.h * .25, B0.y + B0.h * .9); s.list.push({ x: x - S * .35, y: B0.y - S * .3, tx: x, ty, v: S * 1.25, t: 0 }); }
      for (let i = s.list.length - 1; i >= 0; i--) {
        const m = s.list[i], dx = m.tx - m.x, dy = m.ty - m.y, L = Math.hypot(dx, dy), step = m.v * dt; m.t += dt;
        if (L <= step) { api.ring(m.tx, m.ty, C * .2, C * 2.6, .8, '170,230,255', C * .1, .5); for (let j = 0; j < 12; j++) api.sp('crystal', m.tx, m.ty, { col: [225, 250, 255], size: rnd(C * .12, C * .3), a: 1, life: rnd(1, 2), vx: rnd(-120, 120), vy: -rnd(40, 160), ay: 260, vr: rnd(-4, 4), add: true }); api.sp('puff', m.tx, m.ty, { col: [230, 245, 255], size: C * 1.4, a: .5, life: 1, grow: 1.4 }); s.list.splice(i, 1); continue; }
        m.x += dx / L * step; m.y += dy / L * step; if (ok(mt)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(m.x, m.y); g.rotate(Math.atan2(dy, dx) - Math.PI / 2); const h = C * 7, w = h * .4; g.globalAlpha = env; g.drawImage(tint(mt, 'im', '120,200,255', .65), 0, 0, 128, 320, -w / 2, -h * .82, w, h); g.restore(); }
        glowAt(g, 'v2_glow_b', m.x, m.y, C * 2.4, .6 * env);
      }
    },
    /* ---------------- 🌲 숲 ---------------- */
    s7_shrooms(g, el, env, B0, S, C, wx, dt, tn) {
      tn('20,70,60', .12 * env); const sh = IM().shroom; if (!ok(sh)) return; const s = st(wx, 's7_shrooms');
      if (!s.list.length) for (let i = 0; i < 18; i++) { const side = i % 3; s.list.push({ x: side === 0 ? B0.x + C * .1 : side === 1 ? B0.x + B0.w - C * .1 : B0.x + B0.w * (.08 + .84 * R(s.seed, i, 1)), y: side === 2 ? B0.y + B0.h * (R(s.seed, i, 2) > .5 ? 1.01 : .02) : B0.y + B0.h * R(s.seed, i, 2), c: i % 3, rgb: ['150,255,235', '255,170,235', '190,255,170'][i % 3], t: R(s.seed, i, 3) * 3, sz: C * (1.5 + R(s.seed, i, 4) * 1.0), g: ['glow_b', 'glow_p', 'glow_g'][i % 3] }); }
      s.list.forEach((m, i) => {
        const q = clamp((el - m.t) / 1.2, 0, 1), a = env * (.6 + .4 * Math.sin(el * 2 + i)), w = m.sz * outBack(q); if (q <= 0) return;
        glowAt(g, 'v2_' + m.g, m.x, m.y - w * .3, w * 1.5, .28 * a * q); put(g, tint(sh, 'sr', m.rgb, .45), m.c * 96, 0, 96, 96, m.x, m.y - w * .3, w, w, .98 * env * q);
        if (Math.random() < .08 * env) API().sp('dot', m.x + rnd(-w * .3, w * .3), m.y - w * .6, { col: m.rgb.split(',').map(Number), size: rnd(1.2, 2.6), a: .9, life: rnd(2, 3.5), vy: -rnd(10, 28), vx: rnd(-8, 8), add: true });
      });
    },
    s7_sunbeams(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('255,236,170', .06 * env); const rb = IM().wl_ribbon, s = st(wx, 's7_sunbeams'); if (ok(rb)) for (let i = 0; i < 6; i++) {
        const bx = B0.x + B0.w * (i / 5 - .1) + Math.sin(el * .25 + i) * C * .5, L = B0.h * 1.45, ang = 1.15, a = (.2 + .1 * Math.sin(el * .7 + i * 1.9)) * env;
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(bx, B0.y - C * .3); g.rotate(ang); g.globalAlpha = a; g.drawImage(tint(rb, 'sb', '255,240,180', .8), 0, -C * (1.1 + .5 * (i % 2)), L, C * (2.2 + (i % 2))); g.restore();
      }
      const ry = IM().v2_rays_y; if (ok(ry)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(B0.x + B0.w * .05, B0.y - C * .5); g.rotate(el * .03); g.globalAlpha = .16 * env; g.drawImage(ry, -B0.w * .8, -B0.w * .8, B0.w * 1.6, B0.w * 1.6); g.restore(); }
      every(.07, () => API().sp('dot', rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), { col: [255, 244, 190], size: rnd(1, 2.4), a: .9, life: rnd(2, 4), vx: rnd(-6, 8), vy: rnd(-10, 6), add: true }));
      every(.6, () => API().sp('leaf', rnd(B0.x, B0.x + B0.w), B0.y - 10, { col: [110, 200, 90], size: rnd(C * .1, C * .17), a: .95, life: 8, vy: S * rnd(.04, .08), vx: rnd(4, 22), sway: rnd(18, 36), swf: rnd(1, 2), vr: rnd(-2, 2) }));
    },
    s7_vinegrow(g, el, env, B0, S, C, wx, dt, tn) {
      tn('30,90,50', .12 * env); const vn = IM().vine; if (!ok(vn)) return; const s = st(wx, 's7_vinegrow');
      for (let i = 0; i < 12; i++) {
        const left = i % 2 === 0, row = (i >> 1) / 5.5, x = left ? B0.x - C * .15 : B0.x + B0.w + C * .15, y = B0.y + B0.h * (.04 + .92 * row), q = ease(clamp((el - R(s.seed, i, 1) * 2.5) / 3.2, 0, 1)), H = C * (4.2 + 2 * R(s.seed, i, 2)) * (.25 + .75 * q), rot = (left ? 1 : -1) * (1.05 + .12 * Math.sin(el * .8 + i)) - Math.PI / 2 + Math.PI / 2;
        if (q <= 0) continue; g.save(); g.translate(x, y); g.rotate((left ? 1 : -1) * 1.0 + Math.sin(el * .9 + i) * .06); if (!left) g.scale(-1, 1); g.globalAlpha = env * .95; g.drawImage(vn, -H * .45, -H * .96, H * .9, H); g.restore();
        glowAt(g, 'v2_glow_g', x + (left ? 1 : -1) * H * .72, y - H * .35, C * 1.3, .3 * env * q);
        if (Math.random() < .03 * env) API().sp('leaf', x + (left ? 1 : -1) * H * .5, y - H * .3, { col: [110, 210, 100], size: rnd(C * .08, C * .15), a: .95, life: 3, vy: S * .05, sway: 14, swf: 3, vr: rnd(-2, 2) });
      }
    },
    /* ---------------- 🏯 암흑 ---------------- */
    s7_soulfire(g, el, env, B0, S, C, wx, dt, tn) {
      tn('40,10,60', .14 * env); const fl = IM().v2_flame_p, s = st(wx, 's7_soulfire'); if (!ok(fl)) return;
      for (let i = 0; i < 16; i++) {
        const per = 6 + R(s.seed, i, 1) * 3, ph = fract((el + R(s.seed, i, 2) * per) / per), x = B0.x + B0.w * R(s.seed, i, 3) + Math.sin(el * 1.1 + i * 2) * C * .6, y = B0.y + B0.h * (1.02 - ph * 1.1), a = Math.sin(ph * Math.PI) * env, w = C * (.9 + R(s.seed, i, 4) * .5), f = ((el * 11 + i * 3) | 0) % 8, rgb = i % 2 ? '140,255,180' : '200,130,255';
        glowAt(g, i % 2 ? 'v2_glow_g' : 'v2_glow_p', x, y - w * .4, w * 3, .45 * a); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .95; g.drawImage(tint(fl, 'sf', rgb, .6), (f % 4) * 128, ((f / 4) | 0) * 192, 128, 192, x - w / 2, y - w * 1.5, w, w * 1.5); g.restore();
      }
    },
    s7_crows(g, el, env, B0, S, C, wx, dt, tn) {
      tn('30,10,40', .18 * env); const bd = IM().bird; if (!ok(bd)) return; const s = st(wx, 's7_crows');
      for (let wv = 0; wv < 2; wv++) for (let i = 0; i < 9; i++) {
        const dir = wv ? -1 : 1, prog = clamp((el - wv * 3.5) / 6.5, 0, 1.2), x = (dir > 0 ? B0.x - C * 3 : B0.x + B0.w + C * 3) + dir * (B0.w + C * 6) * prog + dir * -(i % 3) * C * 1.0, y = B0.y + B0.h * (.2 + .14 * wv + .06 * (i % 3)) + Math.sin(el * 2 + i * 1.3) * C * .45 + (i >> 2) * C * .7, f = ((el * 9 + i) | 0) & 3, sz = C * (.95 + R(s.seed, i, wv) * .3);
        if (prog <= 0 || prog >= 1.15) continue; g.save(); g.globalAlpha = .2 * env; g.translate(x + C * .5, y + C * 1.1); g.drawImage(tint(bd, 'cr', '0,0,0', 1), f * 64, 0, 64, 48, -sz / 2, -sz * .3, sz, sz * .5); g.restore();
        put(g, bd, f * 64, 0, 64, 48, x, y, sz, sz * .75, .95 * env, 0, dir < 0);
      }
    },
    s7_runes(g, el, env, B0, S, C, wx, dt, tn) {
      tn('60,10,90', .16 * env); const s = st(wx, 's7_runes'), api = API();
      if (!s.list.length) for (let i = 0; i < 3; i++) s.list.push({ x: B0.x + B0.w * (.2 + .3 * i + (R(s.seed, i, 1) - .5) * .12), y: B0.y + B0.h * (.25 + .5 * R(s.seed, i, 2)), t: i * 1.6, sz: C * (4.2 + R(s.seed, i, 3) * 1.8), key: i % 2 ? 'v2_rune_g' : 'v2_rune_p', dir: i % 2 ? -1 : 1 });
      s.list.forEach((r, i) => {
        const q = clamp((el - r.t) / 1.2, 0, 1), out = 1 - ease(clamp((el - (wx.dur * .8 - r.t * .4)) / 1.5, 0, 1)), a = ease(q) * out * env, im = IM()[r.key]; if (a <= .01 || !ok(im)) return;
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(r.x, r.y); g.scale(1, .55); g.rotate(el * .45 * r.dir); g.globalAlpha = a * .75; g.drawImage(im, -r.sz / 2, -r.sz / 2, r.sz, r.sz); g.rotate(-el * .9 * r.dir); g.globalAlpha = a * .5; g.drawImage(im, -r.sz * .3, -r.sz * .3, r.sz * .6, r.sz * .6); g.restore();
        glowAt(g, r.key === 'v2_rune_g' ? 'v2_glow_g' : 'v2_glow_p', r.x, r.y, r.sz * .8, .35 * a);
        const rb = IM().wl_ribbon; if (ok(rb)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(r.x, r.y); g.rotate(-Math.PI / 2); g.globalAlpha = a * .35; g.drawImage(tint(rb, 'rr', r.key === 'v2_rune_g' ? '140,255,170' : '200,130,255', .8), 0, -C * .4, r.sz * .9, C * .8); g.restore(); }
        if (Math.random() < .5 * a) api.sp('dot', r.x + rnd(-r.sz * .3, r.sz * .3), r.y + rnd(-r.sz * .1, r.sz * .1), { col: r.key === 'v2_rune_g' ? [140, 255, 170] : [200, 130, 255], size: rnd(1.2, 2.6), a: 1, life: rnd(1, 2), vy: -rnd(30, 90), add: true });
      });
    },
    /* ---------------- ⚔️ 고성 ---------------- */
    s7_lanterns(g, el, env, B0, S, C, wx, dt, tn) {
      tn('255,150,60', .08 * env); const ln = IM().lantern, s = st(wx, 's7_lanterns'); if (!ok(ln)) return;
      for (let i = 0; i < 22; i++) {
        const per = 8 + R(s.seed, i, 1) * 4, ph = fract((el + R(s.seed, i, 2) * per) / per), x = B0.x + B0.w * (R(s.seed, i, 3) * 1.1 - .05) + Math.sin(el * .7 + i * 2.1) * C * .7, y = B0.y + B0.h * (1.12 - ph * 1.3), a = Math.sin(clamp(ph, 0, 1) * Math.PI) ** .6 * env, w = C * (.55 + R(s.seed, i, 4) * .55) * (1 - ph * .25), fl = .75 + .25 * Math.sin(el * 7 + i * 3);
        glowAt(g, 'v2_glow_o', x, y, w * 4.2, .55 * a * fl); put(g, ln, (i % 3) * 96, 0, 96, 128, x, y, w, w * 1.33, a, Math.sin(el * .9 + i) * .08);
      }
    },
    s7_cranes(g, el, env, B0, S, C, wx, dt, tn) {
      tn('255,230,200', .06 * env); const bd = IM().bird; if (!ok(bd)) return; const prog = clamp(el / (wx.dur * .95), 0, 1.15), dir = (wx.seed | 0) % 2 ? 1 : -1;
      for (let i = 0; i < 7; i++) {
        const row = i === 0 ? 0 : Math.ceil(i / 2), side = i === 0 ? 0 : (i % 2 ? 1 : -1), baseX = (dir > 0 ? B0.x - C * 4 : B0.x + B0.w + C * 4) + dir * (B0.w + C * 8) * prog - dir * row * C * 1.6, baseY = B0.y + B0.h * .38 + (side * row * C * .9) + Math.sin(el * 1.3 + i) * C * .2, f = ((el * 5 + i) | 0) & 3, sz = C * 1.7;
        glowAt(g, 'v2_glow_y', baseX, baseY, sz * 1.8, .2 * env); put(g, tint(bd, 'cn', '255,255,255', 1), f * 64, 0, 64, 48, baseX, baseY, sz, sz * .75, .95 * env, -dir * .08, dir < 0);
        if (Math.random() < .12 * env) API().sp('dot', baseX - dir * sz * .4, baseY, { col: [255, 255, 235], size: rnd(1, 2), a: .8, life: 1.2, vy: rnd(6, 20), add: true });
      }
    },
    s7_petals(g, el, env, B0, S, C, wx, dt, tn, every) {
      tn('255,190,215', .08 * env); const sp = API().sp, wind = S * (.1 + .05 * Math.sin(el * .6));
      every(.035, () => sp('petal', B0.x - C * rnd(0, 2), rnd(B0.y - 20, B0.y + B0.h * .9), { col: [[255, 190, 215], [255, 230, 238], [255, 170, 200]][(Math.random() * 3) | 0], size: rnd(C * .08, C * .16), a: .95, life: rnd(4, 7), vx: wind * rnd(.7, 1.6), vy: rnd(14, 60), sway: rnd(14, 34), swf: rnd(1.4, 3), vr: rnd(-3, 3), rot: rnd(0, TAU) }));
      every(.5, () => sp('puff', B0.x - C, rnd(B0.y, B0.y + B0.h), { col: [255, 205, 225], size: S * rnd(.08, .14), a: .12, life: 5, vx: wind * .6, grow: 1, fadeIn: true }));
    }
  };

  window.jgScenes7 = {
    kinds: Object.keys(SCENES),
    draw(kind, g, now, dt, env, k, el, B0, S, tintFn, every, wx, C) {
      const fn = SCENES[kind]; if (!fn) return; const cell = C || (S / 12);
      wx.dur = wx.dur || 10; g.save(); try { fn(g, el, env, B0, S, cell, wx, dt, tintFn, every); } finally { g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    }
  };
})();
