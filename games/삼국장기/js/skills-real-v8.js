/* ============================================================================
 * [핵폭탄 · 메테오 · 외계인 — 사실적·화려한 업그레이드]  js/skills-real-v8.js
 *  chat.js 안의 원본 애니메이션과 같은 타이밍(핵 1.15s 착탄 · 메테오 1.5s 주 충돌 · 외계인 1.5s 명중)에 맞춰
 *  직접 생성한 이미지(화구 난류 · 연기 덩어리 · 탄두 · 운석 · 분화구 · 플라즈마 · 견인광선 · 응결 수증기 링)로 연출합니다.
 *   ☢️ 핵폭탄 : 재돌입 탄두 낙하 → 섬광 → 난류 화구 → 응결 수증기 링 · 지면 먼지 벽 → 버섯구름(기둥+갓 말림) → 낙진
 *   ☄️ 메테오 : 대기권 돌입 화염 운석 다발 → 충돌 화구 · 분화구 · 암석 파편(불꼬리) · 용암 균열 · 연기 기둥
 *   👽 외계인 : 견인 광선 + 플라즈마 구 충전 → 플라즈마 폭발 · 전기 아크 · 산성 연기 · 이온화 잔광   (원본 UFO 위에 덧입힘)
 *  핵·메테오는 원본 캔버스를 숨기고(진동·소리·피해 처리는 원본 그대로) 이 연출로 대체하며, 외계인은 원본 위에 덧입힙니다.
 *  끄기: jgSkillsReal8.enabled = false
 * ============================================================================ */
(function jgSkillsReal8() {
  if (window.jgSkillsReal8) return;
  const R8 = window.jgSkillsReal8 = { enabled: true, bloom: .5 };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const smooth = k => { k = clamp(k, 0, 1); return k * k * k * (k * (k * 6 - 15) + 10); };
  const outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const outQuint = k => 1 - Math.pow(1 - clamp(k, 0, 1), 5);
  const inCubic = k => Math.pow(clamp(k, 0, 1), 3);
  const kk = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  /* ---------- 이미지 ---------- */
  const DIR = 'assets/images/fx/', IM = {};
  const load = n => { const i = new Image(); i.src = DIR + n + '.webp'; return i; };
  ['fx_fireball', 'fx_plasma_burst', 'fx_billow', 'fx_vapor', 'fx_warhead', 'fx_meteor_rock', 'fx_crater', 'fx_plasma', 'fx_beam', 'fx_ash', 'skl_ufo', 'wl_rock', 'wl_softflash', 'wl_ribbon'].forEach(n => IM[n] = load(n));
  ['sparks', 'glow_o', 'glow_g', 'glow_y', 'glow_b', 'shock_o', 'shock_g', 'shock_y', 'bolt_g', 'bolt_y', 'vignette'].forEach(n => IM['v2_' + n] = load('v2_' + n));
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
  const tc = {};
  function tinted(img, key, rgb, a) { const id = key + rgb + a; if (tc[id]) return tc[id]; const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }

  /* ---------- 장기판 좌표 ---------- */
  function metrics(V) {
    const W = window.innerWidth, H = window.innerHeight, S = Math.min(W, H), cvB = document.getElementById('cv');
    const r = cvB ? cvB.getBoundingClientRect() : { left: 0, top: 46, width: W, height: H - 46 };
    const isTop = (typeof flip !== 'undefined' && flip) ? (V === 'c') : (V === 'h');
    const hasG = typeof OX === 'number' && typeof CX === 'number' && CX > 5 && CY > 5, cx = hasG ? CX : r.width / 9, cy = hasG ? CY : r.height / 10;
    const gl = r.left + (hasG ? OX : r.width * .1), gt = r.top + (hasG ? OY : r.height * .08);
    const camp = { x0: gl - cx * .4, w: 8 * cx + cx * .8, y0: isTop ? gt - cy * .4 : gt + 4.55 * cy, h: 4.42 * cy + cy * .4 };
    return { W, H, S, isTop, br: { left: r.left, top: r.top, width: r.width, height: r.height }, camp, cx: camp.x0 + camp.w / 2, cy: camp.y0 + camp.h / 2, gt, gh: 9 * cy, gw: 8 * cx, gl };
  }

  /* ---------- 파티클 ---------- */
  const SHEET = { billow: ['fx_billow', 256, 256], spark: ['v2_sparks', 64, 64], rock: ['wl_rock', 64, 64], ash: ['fx_ash', 32, 32] };
  function sp(run, o) { const q = window.jgPerf ? window.jgPerf.q : 1; if (q < .95 && o && o.kind !== 'rock' && Math.random() > Math.max(.25, q * .9)) return; if (run.P.length >= Math.round(420 * Math.max(.45, q))) return; run.P.push(Object.assign({ kind: 'billow', cell: 0, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, rot: 0, vr: 0, size: 20, a: 1, life: 2, age: 0, rgb: null, ta: .5, add: false, grow: 0, fadeIn: .15, sway: 0, swf: 1, ph: Math.random() * 6 }, o)); }
  function stepPT(run, g, dt) {
    for (let i = run.P.length - 1; i >= 0; i--) {
      const p = run.P[i]; p.age += dt; if (p.age >= p.life) { run.P.splice(i, 1); continue; }
      const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const sh = SHEET[p.kind], img = IM[sh[0]]; if (!ok(img)) continue; const k = p.age / p.life, a = p.a * (p.fadeIn ? smooth(p.age / p.fadeIn) : 1) * (1 - smooth((k - .5) / .5)); if (a <= .008) continue;
      const s = p.size * (1 + p.grow * k), src = p._src || (p._src = p.rgb ? tinted(img, p.kind, p.rgb, p.ta) : img);
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1);
      g.save(); g.translate(p.x + p.sway * Math.sin(p.age * p.swf + p.ph), p.y); if (p.rot) g.rotate(p.rot); g.drawImage(src, p.cell * sh[1], 0, sh[1], sh[2], -s / 2, -s / 2, s, s * sh[2] / sh[1]); g.restore();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function glow(g, key, x, y, size, a) { const im = IM[key]; if (!ok(im) || a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, x - size / 2, y - size / 2, size, size); g.restore(); }
  function flash(g, x, y, size, rgb, a) { const im = IM.wl_softflash; if (!ok(im) || a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1); g.drawImage(tinted(im, 'sf', rgb, .85), x - size / 2, y - size / 2, size, size); g.restore(); }
  function shock(g, key, x, y, size, k, a, flat) {
    const im = IM[key]; if (!ok(im) || a <= .004 || k < 0) return; const kc = clamp(k, 0, .999), f = Math.min(7, (kc * 8) | 0), f2 = Math.min(7, f + 1), mix = kc * 8 - f;
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || .55);
    g.globalAlpha = clamp(a * (1 - mix), 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size); g.globalAlpha = clamp(a * mix, 0, 1); g.drawImage(im, (f2 % 4) * 256, ((f2 / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size); g.restore();
  }
  /* 난류 화구 (8프레임 보간) */
  function fireball(g, sheet, x, y, size, k, a, add) {
    const im = IM[sheet]; if (!ok(im) || a <= .004) return; const kc = clamp(k, 0, .999) * 7.999, f = Math.min(7, kc | 0), f2 = Math.min(7, f + 1), mix = kc - f;
    g.save(); g.globalCompositeOperation = add ? 'lighter' : 'source-over'; g.translate(x, y);
    g.globalAlpha = clamp(a * (1 - mix), 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size);
    g.globalAlpha = clamp(a * mix, 0, 1); g.drawImage(im, (f2 % 4) * 256, ((f2 / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size); g.restore();
  }
  function vignette(g, M, rgb, a) { const im = IM.v2_vignette; if (!ok(im) || a <= .004) return; g.save(); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tinted(im, 'v', rgb, 1), 0, 0, M.W, M.H); g.restore(); }
  function crater(g, x, y, size, a, rgb) { const im = IM.fx_crater; if (!ok(im) || a <= .004) return; g.save(); g.translate(x, y); g.scale(1, .86); g.globalAlpha = clamp(a, 0, 1); g.drawImage(rgb ? tinted(im, 'cr', rgb, .5) : im, -size / 2, -size / 2, size, size); g.restore(); }

  /* ====================================================================
   *  ☢️ 핵폭탄 — 착탄 1.15s · 종료 4.6s
   * ==================================================================== */
  function nuke(R, M) {
    const T = 1.15, END = 4.6, S = M.S, bx = M.cx, by = M.cy + M.camp.h * .12;
    let stemAcc = 0, capDone = false, ashAcc = 0, pxAcc = 0;
    return {
      END, bloom: .55,
      frame(g, t, dt) {
        const ti = t - T, fall = t < T;
        /* 하늘 · 대기 */
        vignette(g, M, '80,10,0', .35 * smooth(kk(t, 0, .6)) * (1 - smooth(kk(t, 3.6, END))));
        if (fall) {
          const k = t / T, y = -S * .2 + (by - S * .03 + S * .2) * k * k, x = bx + Math.sin(t * 5) * S * .008, h = S * .26;
          /* 재돌입 항적 */
          pxAcc += dt * 60; while (pxAcc >= 1) { pxAcc -= 1; sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: x + rnd(-S * .008, S * .008), y: y - h * .2, vx: rnd(-14, 14), vy: -rnd(10, 60), size: S * rnd(.05, .09), a: .5 * k + .1, life: rnd(.9, 1.5), rgb: '120,110,105', ta: .55, grow: 1.4 }); }
          sp(R.run, { kind: 'spark', cell: pick([0, 1, 3]), x: x + rnd(-S * .01, S * .01), y: y + h * .1, vx: rnd(-60, 60), vy: -rnd(60, 220), size: S * rnd(.012, .026), a: 1, life: rnd(.3, .7), rgb: '255,170,70', add: true, fadeIn: 0 });
          glow(g, 'v2_glow_o', x, y - h * .18, S * .26, .7 * k); glow(g, 'v2_glow_y', x, y - h * .18, S * .12, .8 * k);
          if (ok(IM.fx_warhead)) { g.save(); g.translate(x, y); g.rotate(Math.PI + Math.sin(t * 3) * .05); g.globalAlpha = 1; g.drawImage(IM.fx_warhead, -h * .15, -h * .5, h * .3, h); g.restore(); }
          /* 지면 예고 : 먼지 파문 */
          shock(g, 'v2_shock_o', bx, by, S * .5, k * .5, .25 * k, .45);
        }
        if (!fall) {
          const e = clamp(ti, 0, 99);
          if (!this._d) {
            this._d = 1;
            for (let i = 0; i < 28; i++) { const a = rnd(0, TAU), v = S * rnd(.35, 1.25); sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: bx + Math.cos(a) * S * .05, y: by + Math.sin(a) * S * .015, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .32, drag: .975, size: S * rnd(.12, .24), a: .55, life: rnd(2, 3.4), rgb: '150,118,84', ta: .5, grow: 1.1, fadeIn: .12 }); }
            for (let i = 0; i < 64; i++) { const a = -Math.PI * (.05 + .9 * Math.random()), v = S * rnd(.4, 1.6); sp(R.run, { kind: 'spark', cell: pick([0, 1, 3, 4]), x: bx, y: by - S * .02, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: S * 1.7, drag: .99, size: S * rnd(.012, .03), a: 1, life: rnd(1, 2.6), rgb: pick(['255,200,90', '255,120,40', '255,230,170']), add: true, fadeIn: 0 }); }
            for (let i = 0; i < 22; i++) { const a = -Math.PI * (.12 + .76 * Math.random()), v = S * rnd(.4, 1.2); sp(R.run, { kind: 'rock', cell: (Math.random() * 4) | 0, x: bx, y: by, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: S * 1.8, rot: rnd(0, TAU), vr: rnd(-8, 8), size: S * rnd(.018, .045), a: 1, life: rnd(1.4, 2.4), fadeIn: 0 }); }
          }
          /* 섬광 */
          const fl = Math.pow(Math.max(0, 1 - e / .42), 1.6);
          flash(g, bx, by, S * 3.4, '255,244,225', fl * 1.0); flash(g, bx, by, S * 1.4, '190,215,255', fl * .8);
          /* 지면 흔적(분화구/그을음) */
          crater(g, bx, by, S * (.5 + .7 * outCubic(kk(e, 0, 1.2))), smooth(kk(e, .1, .8)) * .75 * (1 - smooth(kk(t, 3.9, END))), null);
          /* 화구 */
          const fk = kk(e, 0, 2.1), fa = 1 - smooth(kk(e, 1.5, 2.6)), fs = S * (.24 + .62 * outCubic(kk(e, 0, 1.4)));
          fireball(g, 'fx_fireball', bx, by - fs * (.18 + .42 * smooth(kk(e, 0, 2))), fs, fk, fa, false);
          fireball(g, 'fx_fireball', bx - S * .07, by - fs * .1, fs * .55, clamp(fk * 1.2, 0, 1), fa * .9, false);
          fireball(g, 'fx_fireball', bx + S * .08, by - fs * .06, fs * .45, clamp(fk * 1.3, 0, 1), fa * .85, false);
          glow(g, 'v2_glow_o', bx, by - fs * .3, fs * 2.2, (1 - smooth(kk(e, 0, 1.9))) * .6);
          /* 응결 수증기 링 + 충격파 */
          const vk = outQuint(kk(e, 0, 1.0)), va = (1 - smooth(kk(e, .45, 1.4)));
          if (ok(IM.fx_vapor) && va > .01) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(bx, by + S * .01); g.scale(1, .34); g.globalAlpha = va * .85; const vs = S * (.2 + 1.7 * vk); g.drawImage(IM.fx_vapor, -vs / 2, -vs / 2, vs, vs); g.restore(); }
          shock(g, 'v2_shock_o', bx, by, S * 2.0, kk(e, 0, 1.3), (1 - kk(e, .6, 1.3)) * .9, .34); shock(g, 'v2_shock_y', bx, by, S * 1.3, kk(e, .08, 1.0), .6, .34);
          /* 버섯구름 : 기둥 */
          if (e < 1.9) { stemAcc += dt * 18; while (stemAcc >= 1) { stemAcc -= 1; const h = clamp(e / 1.9, 0, 1); sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: bx + rnd(-1, 1) * S * .035, y: by - S * .02, vx: rnd(-1, 1) * S * .03, vy: -S * rnd(.42, .62) * (1.1 - h * .5), drag: .985, size: S * rnd(.1, .16), a: .75, life: rnd(2.6, 3.8), grow: .55, fadeIn: .2, sway: S * .006, swf: 2 }); } }
          /* 버섯구름 : 갓이 말려 올라감 */
          if (e > .55 && e < 1.7) { const h = ease((e - .55) / 1.15); for (let i = 0; i < 2; i++) { const a = rnd(0, TAU); sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: bx + Math.cos(a) * S * .06, y: by - S * (.16 + .52 * h), vx: Math.cos(a) * S * rnd(.16, .3), vy: -S * rnd(.04, .14) + Math.sin(a) * S * .03, ay: S * .1, drag: .97, size: S * rnd(.13, .2), a: .85, life: rnd(2.4, 3.4), grow: .5, fadeIn: .15 }); } }
          /* 불길 층(가산) : 갓 · 기둥 안쪽이 달궈짐 */
          const hot = (1 - smooth(kk(e, .8, 3))) * .5; glow(g, 'v2_glow_o', bx, by - S * (.2 + .45 * smooth(kk(e, .3, 1.9))), S * .9, hot);
          /* 열기 색조 */
          vignette(g, M, '255,120,30', .3 * (1 - smooth(kk(e, .2, 3.0))));
          /* 낙진 */
          if (e > 1.4 && e < 3.6) { ashAcc += dt * 40; while (ashAcc >= 1) { ashAcc -= 1; sp(R.run, { kind: 'ash', cell: (Math.random() * 4) | 0, x: rnd(M.br.left, M.br.left + M.br.width), y: M.br.top - 10, vx: rnd(-10, 14), vy: S * rnd(.05, .13), rot: rnd(0, TAU), vr: rnd(-2, 2), size: S * rnd(.012, .03), a: .85, life: rnd(3, 5), fadeIn: .3, sway: 14, swf: 2 }); } }
        }
        stepPT(R.run, g, dt);
      }
    };
  }

  /* ====================================================================
   *  ☄️ 메테오 — 주 충돌 1.5s · 종료 6.3s
   * ==================================================================== */
  function meteor(R, M) {
    let frameNo = 0; const T = 1.5, END = 6.3, S = M.S, cx = M.cx, cy = M.cy, dir = { x: .5, y: .866 }, ms = [{ main: 1, tx: cx, ty: cy, t1: T, dur: 1.45, r: S * .105 }];
    for (let i = 0; i < 9; i++) ms.push({ main: 0, tx: M.camp.x0 + M.camp.w * (.1 + .8 * Math.random()), ty: M.camp.y0 + M.camp.h * (.1 + .8 * Math.random()), t1: .55 + i * .1 + Math.random() * .07, dur: .9 + .3 * Math.random(), r: S * (.026 + .03 * Math.random()) });
    ms.forEach(m => { m.L = (m.ty + S * .3) / dir.y; m.fired = false; m.fb = null; });
    return {
      END, bloom: .55,
      frame(g, t, dt) {
        frameNo++; vignette(g, M, '70,8,0', .4 * smooth(kk(t, 0, .7)) * (1 - smooth(kk(t, END - 1.4, END))));
        const lit = { v: 0 };
        ms.forEach(m => {
          const p0 = m.t1 - m.dur, k = kk(t, p0, m.t1);
          if (k > 0 && k < 1) {
            const dist = m.L * (1 - k), x = m.tx - dir.x * dist, y = m.ty - dir.y * dist, hs = m.r * (m.main ? 3.1 : 3.4), tail = Math.atan2(dir.y, dir.x);
            /* 화염 꼬리 + 연기 꼬리 */
            const n = m.main ? 2 : ((frameNo & 1) ? 1 : 0); for (let i = 0; i < n; i++) { sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: x - dir.x * m.r * rnd(.5, 1.6), y: y - dir.y * m.r * rnd(.5, 1.6), vx: -dir.x * S * .08 + rnd(-20, 20), vy: -dir.y * S * .05, size: m.r * rnd(1.4, 2.6), a: .55, life: rnd(.9, 1.6), rgb: pick(['255,150,60', '90,80,75']), ta: .45, grow: 1.2, fadeIn: .08, add: Math.random() < .35 }); }
            sp(R.run, { kind: 'spark', cell: pick([0, 1, 3]), x: x - dir.x * m.r, y: y - dir.y * m.r, vx: rnd(-80, 80) - dir.x * S * .2, vy: rnd(-80, 80) - dir.y * S * .2, size: m.r * rnd(.25, .55), a: 1, life: rnd(.4, .9), rgb: '255,190,90', add: true, fadeIn: 0 });
            glow(g, 'v2_glow_o', x, y, hs * 2.6, .75); glow(g, 'v2_glow_y', x, y, hs * 1.1, .8);
            if (ok(IM.fx_meteor_rock)) { g.save(); g.translate(x, y); g.rotate(tail - Math.PI / 2 + k * 3); g.globalAlpha = 1; g.drawImage(IM.fx_meteor_rock, -hs / 2, -hs / 2, hs, hs); g.restore(); }
          }
          if (!m.fired && t >= m.t1) {
            m.fired = true; m.tt = t; const mn = m.main, sz = m.r * (mn ? 5.4 : 5), n1 = mn ? 90 : 16;
            for (let i = 0; i < n1; i++) { const a = -Math.PI * (.05 + .9 * Math.random()), v = S * rnd(.3, mn ? 1.5 : .8); sp(R.run, { kind: 'spark', cell: pick([0, 1, 3, 4]), x: m.tx, y: m.ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: S * 1.7, drag: .99, size: S * rnd(.01, mn ? .028 : .018), a: 1, life: rnd(.9, 2.3), rgb: pick(['255,190,80', '255,110,40', '255,235,170']), add: true, fadeIn: 0 }); }
            for (let i = 0; i < (mn ? 26 : 5); i++) { const a = -Math.PI * (.1 + .8 * Math.random()), v = S * rnd(.3, mn ? 1.1 : .6); sp(R.run, { kind: 'rock', cell: (Math.random() * 4) | 0, x: m.tx, y: m.ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: S * 1.8, rot: rnd(0, TAU), vr: rnd(-8, 8), size: S * rnd(.018, mn ? .05 : .03), a: 1, life: rnd(1.3, 2.3), fadeIn: 0 }); }
            for (let i = 0; i < (mn ? 22 : 6); i++) { const a = rnd(0, TAU), v = S * rnd(.2, mn ? .8 : .4); sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: m.tx + Math.cos(a) * m.r * .5, y: m.ty + Math.sin(a) * m.r * .2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .35 - S * .05, drag: .975, size: m.r * rnd(1.6, 3), a: .55, life: rnd(1.8, 3.2), rgb: '140,108,78', ta: .5, grow: 1, fadeIn: .1 }); }
          }
          if (m.fired) {
            const e = t - m.tt, mn = m.main, sz = m.r * (mn ? 5.4 : 5);
            /* 분화구 + 달궈진 균열 */
            crater(g, m.tx, m.ty, sz * (.4 + .6 * outCubic(kk(e, 0, .5))) * (mn ? 1.45 : 1.9), smooth(kk(e, .05, .5)) * (mn ? .85 : .6) * (1 - smooth(kk(t, END - 1.2, END))), null);
            const fa = 1 - smooth(kk(e, mn ? 1.1 : .5, mn ? 2.0 : .9)); fireball(g, 'fx_fireball', m.tx, m.ty - sz * .1 - sz * .5 * smooth(kk(e, 0, 1.6)), sz * (.6 + .9 * outCubic(kk(e, 0, .9))), kk(e, 0, mn ? 1.8 : .9), fa, false);
            glow(g, 'v2_glow_o', m.tx, m.ty, sz * 2.6, (1 - smooth(kk(e, 0, mn ? 1.6 : .8))) * .7);
            shock(g, 'v2_shock_o', m.tx, m.ty, sz * 2.4, kk(e, 0, .9), (1 - kk(e, .4, .95)) * .9, .55);
            if (mn) { shock(g, 'v2_shock_y', m.tx, m.ty, sz * 1.8, kk(e, .1, 1.1), .6, .55); const vs = sz * (.4 + 2.6 * outQuint(kk(e, 0, 1))); if (ok(IM.fx_vapor)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(m.tx, m.ty); g.scale(1, .34); g.globalAlpha = (1 - smooth(kk(e, .4, 1.2))) * .6; g.drawImage(IM.fx_vapor, -vs / 2, -vs / 2, vs, vs); g.restore(); }
              if (e < 2.6 && Math.random() < .7) sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: m.tx + rnd(-1, 1) * m.r, y: m.ty, vx: rnd(-1, 1) * S * .02, vy: -S * rnd(.12, .26), size: m.r * rnd(1.4, 2.4), a: .7, life: rnd(2.6, 3.6), grow: .8, fadeIn: .2 });
              if (e < 3.4 && Math.random() < .5) sp(R.run, { kind: 'spark', cell: pick([6, 7, 0]), x: m.tx + rnd(-1, 1) * sz * .5, y: m.ty + rnd(-.3, .3) * sz * .3, vx: rnd(-14, 14), vy: -rnd(40, 130), size: S * rnd(.008, .018), a: 1, life: rnd(1.4, 2.6), rgb: '255,150,60', add: true });
              lit.v = Math.max(lit.v, (1 - smooth(kk(e, .2, 3.4))) * .3); }
          }
        });
        if (lit.v > .01) vignette(g, M, '255,110,30', lit.v);
        stepPT(R.run, g, dt);
      }
    };
  }

  /* ====================================================================
   *  👽 외계인 — 명중 1.5s · 종료 5.2s (원본 UFO 위에 덧입힘)
   * ==================================================================== */
  function alien(R, M) {
    const T = 1.5, END = 5.2, S = M.S, bx = M.cx, by = M.cy, top = M.camp.y0, ufos = [[bx - S * .22, top + M.gh * .18], [bx, top + M.gh * .10], [bx + S * .22, top + M.gh * .18]];
    let arcAcc = 0;
    return {
      END, bloom: .55, over: true,
      frame(g, t, dt) {
        const e = t - T;
        /* 비행선 3대: 위에서 내려와 맴돌다 공격 후 위로 사라짐 */
        if (ok(IM.skl_ufo)) ufos.forEach(([ux, uy], i) => { const inQ = smooth(kk(t, i * .08, .55 + i * .08)), outQ = smooth(kk(t, END - 1.3, END - .3)), y = uy - (1 - inQ) * S * .9 - outQ * S * .9 + Math.sin(t * 3 + i) * S * .01, x = ux + Math.sin(t * 1.7 + i * 2) * S * .015, z = S * (i === 1 ? .34 : .27), a = inQ * (1 - outQ); if (a < .01) return; glow(g, 'v2_glow_g', x, y + z * .25, z * 1.4, .35 * a * (.7 + .3 * Math.sin(t * 9 + i))); g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(Math.sin(t * 2.2 + i) * .06); g.drawImage(IM.skl_ufo, -z / 2, -z * .31, z, z * .625); g.restore(); });
        /* 견인 · 충전 광선 */
        const bq = smooth(kk(t, .45, 1.2)) * (1 - smooth(kk(t, T, T + .35)));
        if (bq > .01 && ok(IM.fx_beam)) ufos.forEach(([ux, uy], i) => { const L = Math.hypot(bx - ux, by - uy), a = Math.atan2(by - uy, bx - ux); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(ux, uy); g.rotate(a - Math.PI / 2); g.globalAlpha = bq * (.55 + .2 * Math.sin(t * 24 + i)); g.drawImage(IM.fx_beam, -L * .09, 0, L * .18, L); g.restore(); });
        /* 플라즈마 구 충전 */
        const pq = smooth(kk(t, .6, T)), ps = S * (.04 + .22 * pq) * (e < 0 ? 1 : Math.max(0, 1 - e / .2));
        if (ps > 2 && ok(IM.fx_plasma)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(bx, by - S * .02); g.rotate(t * 6); g.globalAlpha = .95; g.drawImage(IM.fx_plasma, -ps, -ps, ps * 2, ps * 2); g.restore(); glow(g, 'v2_glow_g', bx, by, ps * 4, .6 * pq); }
        if (t < T) { arcAcc += dt * 50 * pq; while (arcAcc >= 1) { arcAcc -= 1; ufos.forEach(([ux, uy]) => { if (Math.random() < .4) { const a = Math.atan2(by - uy, bx - ux), L = Math.hypot(bx - ux, by - uy) * rnd(.3, .7); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(ux, uy); g.rotate(a - Math.PI / 2); g.globalAlpha = .5; g.drawImage(IM.v2_bolt_g, ((Math.random() * 6) | 0) * 256, 0, 256, 512, -L * .2, 0, L * .4, L); g.restore(); } }); } }
        if (e >= 0) {
          if (!this._d) {
            this._d = 1;
            for (let i = 0; i < 16; i++) { const a = rnd(0, TAU); this['arc' + i] = { a, L: S * rnd(.3, .7), f: (Math.random() * 6) | 0, t0: rnd(0, .35) }; }
            for (let i = 0; i < 70; i++) { const a = rnd(0, TAU), v = S * rnd(.2, 1.0); sp(R.run, { kind: 'spark', cell: pick([0, 1, 3, 4]), x: bx, y: by, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8, drag: .985, size: S * rnd(.01, .026), a: 1, life: rnd(.8, 2), rgb: pick(['150,255,190', '110,255,160', '230,255,240']), add: true, fadeIn: 0 }); }
            for (let i = 0; i < 16; i++) { sp(R.run, { kind: 'billow', cell: (Math.random() * 4) | 0, x: bx + rnd(-1, 1) * S * .06, y: by + rnd(-.4, .4) * S * .05, vx: rnd(-1, 1) * S * .05, vy: -S * rnd(.06, .2), size: S * rnd(.1, .2), a: .6, life: rnd(2.4, 3.8), rgb: '60,200,110', ta: .55, grow: 1, fadeIn: .2, add: false }); }
          }
          fireball(g, 'fx_plasma_burst', bx, by - S * .03, S * (.3 + .6 * outCubic(kk(e, 0, 1.0))), kk(e, 0, 1.5), 1 - smooth(kk(e, .9, 1.8)), true);
          if (!window.jgPerf || window.jgPerf.q >= .6) fireball(g, 'fx_plasma_burst', bx - S * .1, by + S * .06, S * (.22 + .3 * outCubic(kk(e, .15, 1))), kk(e, .15, 1.5), (1 - smooth(kk(e, .9, 1.7))) * .9, true);
          if (!window.jgPerf || window.jgPerf.q >= .6) fireball(g, 'fx_plasma_burst', bx + S * .11, by - S * .07, S * (.2 + .28 * outCubic(kk(e, .3, 1.1))), kk(e, .3, 1.6), (1 - smooth(kk(e, 1, 1.8))) * .85, true);
          flash(g, bx, by, S * 2.4, '190,255,210', Math.pow(Math.max(0, 1 - e / .4), 1.5) * .9); flash(g, bx, by, S * 1.1, '255,255,255', Math.pow(Math.max(0, 1 - e / .22), 1.5));
          shock(g, 'v2_shock_g', bx, by, S * 1.7, kk(e, 0, 1.1), (1 - kk(e, .5, 1.1)) * .9, .55);
          /* 전기 아크 */
          for (let i = 0; i < 16; i++) { const A = this['arc' + i]; if (!A) continue; const q = kk(e, A.t0, A.t0 + .7); if (q <= 0 || q >= 1) continue; const f = (A.f + ((e / .05) | 0)) % 6, L = A.L * (.4 + .6 * outCubic(q * 2)); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(bx, by); g.scale(1, .8); g.rotate(A.a - Math.PI / 2); g.globalAlpha = (1 - smooth(q)) * (.5 + .5 * Math.abs(Math.sin(e * 50 + i))); g.drawImage(IM.v2_bolt_g, f * 256, 0, 256, 512, -L * .26, 0, L * .52, L); g.restore(); }
          /* 이온화 잔광 */
          const ia = (1 - smooth(kk(e, 1.0, 3.2))) * (.6 + .4 * Math.sin(e * 12)); glow(g, 'v2_glow_g', bx, by, S * 1.3, ia * .5); vignette(g, M, '60,255,140', .25 * (1 - smooth(kk(e, .4, 3.0))));
          if (e < 2.4 && Math.random() < .5) sp(R.run, { kind: 'spark', cell: pick([6, 7, 0]), x: bx + rnd(-1, 1) * S * .25, y: by + rnd(-1, 1) * S * .15, vx: rnd(-14, 14), vy: -rnd(30, 120), size: S * rnd(.008, .018), a: 1, life: rnd(1.2, 2.2), rgb: '150,255,190', add: true });
        }
        stepPT(R.run, g, dt);
      }
    };
  }

  const SCN = { alien };   /* 핵폭탄·메테오는 삭제됨 → skills-new-v14.js 의 새 스킬이 그 자리를 사용 */

  /* ---------- 실행 틀 ---------- */
  let hide = { n: 0, until: 0 };
  function run(sk, V) {
    const M = metrics(V), mk = SCN[sk]; if (!mk) return;
    const ov = document.createElement('canvas'); ov.id = 'jg_real8_cv'; ov.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9;pointer-events:none;'; document.body.appendChild(ov);
    const g = ov.getContext('2d'), sm = document.createElement('canvas'), sm2 = document.createElement('canvas'), sg = sm.getContext('2d'), sg2 = sm2.getContext('2d');
    const R = { run: { P: [] } }, scene = mk(R, M); let t0 = performance.now(), last = t0, fno = 0, done = false; if (window.jgPerf) window.jgPerf.cinemaOn();
    const cleanup = () => { if (done) return; done = true; if (window.jgPerf) window.jgPerf.cinemaOff(); try { ov.remove(); } catch (e) {} };
    function frame(now) {
      if (done) return;
      const dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now; const t = (now - t0) / 1000;
      if (!R8.enabled) { cleanup(); return; }
      const Mx = metrics(V); Object.assign(M, { W: Mx.W, H: Mx.H, S: Mx.S, br: Mx.br }); const dpr = (window.jgPerf ? window.jgPerf.dpr(1) : 1), pw = Math.round(M.W * dpr), ph = Math.round(M.H * dpr);
      if (ov.width !== pw || ov.height !== ph) { ov.width = pw; ov.height = ph; }
      const a1 = Math.max(2, Math.round(pw / 5)), b1 = Math.max(2, Math.round(ph / 5)), a2 = Math.max(2, Math.round(pw / 14)), b2 = Math.max(2, Math.round(ph / 14)); if (sm.width !== a1 || sm.height !== b1) { sm.width = a1; sm.height = b1; } if (sm2.width !== a2 || sm2.height !== b2) { sm2.width = a2; sm2.height = b2; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, M.W, M.H);
      try { scene.frame(g, t, dt); } catch (e) { console.warn('real8', e); }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      const bl = clamp((scene.bloom || .5) * R8.bloom * 2, 0, 1);
      if (bl > .01 && (!window.jgPerf || window.jgPerf.bloomOK())) { if ((fno++ & 1) === 0) { sg.imageSmoothingQuality = 'high'; sg.clearRect(0, 0, a1, b1); sg.drawImage(ov, 0, 0, a1, b1); sg2.imageSmoothingQuality = 'high'; sg2.clearRect(0, 0, a2, b2); sg2.drawImage(sm, 0, 0, a2, b2); }
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = bl * .6; g.drawImage(sm, 0, 0, pw, ph); g.globalAlpha = bl * .5; g.drawImage(sm2, 0, 0, pw, ph); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      if (window.jgPieceMask) window.jgPieceMask.carveLines(g);
      if (t < scene.END + .4) requestAnimationFrame(frame); else cleanup();
    }
    requestAnimationFrame(frame); setTimeout(cleanup, (scene.END + 2) * 1000);
    if (!scene.over) hide = { n: 1, until: performance.now() + 900 };   /* 핵·메테오 : 원본 캔버스 숨김 */
  }
  /* 원본이 만드는 z-index:9 캔버스를 숨김(진동·사운드·피해 처리는 그대로 진행) */
  try { new MutationObserver(list => { for (const m of list) for (const n of m.addedNodes) { if (n && n.tagName === 'CANVAS' && n.style && n.style.zIndex === '9' && n.id !== 'jg_real8_cv' && hide.n > 0 && performance.now() < hide.until) { hide.n--; n.style.display = 'none'; try { const c2 = n.getContext('2d'); n.width = 1; n.height = 1; const noop = () => {}, gr = () => ({ addColorStop: noop }); ['drawImage', 'fillRect', 'strokeRect', 'clearRect', 'fill', 'stroke', 'fillText', 'strokeText', 'arc', 'ellipse', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'clip', 'save', 'restore', 'translate', 'rotate', 'scale', 'transform', 'setTransform', 'putImageData', 'setLineDash'].forEach(k => { c2[k] = noop; }); c2.createRadialGradient = gr; c2.createLinearGradient = gr; c2.createPattern = () => null; c2.measureText = () => ({ width: 0 }); } catch (e2) {} } } }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}

  /* ---------- 훅 ---------- */
  function hook() {
    const S = window.jgSkillFx; if (!S || typeof S.start !== 'function' || __jgHas(S.start, '__r8')) return;
    const os = S.start;
    S.start = function (sk, V) { const r = os.apply(this, arguments); try { if (R8.enabled && SCN[sk]) { hide = { n: 1, until: performance.now() + 900 };   /* 외계인도 원래 그림은 숨기고(피해 처리는 유지) 다듬은 연출만 그림 — 두 겹으로 그려 무겁던 문제 */ run(sk, V); } } catch (e) { console.warn('real8 start', e); } return r; };
    S.start.__r8 = true; S.start.__prev = os;
  }
  hook(); setInterval(hook, 1200);
  R8.test = function (sk, V) { run(sk, V || 'h'); };
})();
