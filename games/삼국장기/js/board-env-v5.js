/* ============================================================================
 * [장기판 환경 연출 v5]  js/board-env-v5.js   (이미지: assets/images/fx/env_*.webp, v2_*.webp)
 *  기존 board-effects-v4.js 의 단조로운 '상시 환경'(점·연기 몇 개)을 대체하는 맵별 풍경 레이어입니다.
 *  - 바닥층(말 아래) : 모래 물결 · 서리 결정+얼음 광택 · 나뭇잎 그림자/햇살 얼룩+신목 룬 · 용암 균열 · 황룡 인장
 *  - 공기층(말 위)   : 구름·안개 뱅크 · 오로라 · 3겹 눈보라 · 낙엽 · 반딧불 · 혼령 · 불씨/재 · 횃불 · 깃발 · 성광
 *  - 연출 이벤트     : 회전초 · 독수리/까마귀 그림자 · 오로라 폭발 · 먼 번개 · 황룡 인장 맥동 · 북소리
 *  - 기물 잡기 반응  : 맵별 파편 폭발(모래먼지/얼음결정/낙엽/용암불씨/황금불꽃)
 *  기존 날씨 이벤트(45종)는 그대로 둡니다.  끄기: jgEnv5.enabled = false
 * ============================================================================ */
(function jgEnv5Module() {
  if (window.__JG_ENV5__) return;
  window.__JG_ENV5__ = true;
  const E5 = window.jgEnv5 = { enabled: true, density: 1 };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);

  /* ---------- 이미지 ---------- */
  const DIR = 'assets/images/fx/', IM = {};
  const load = n => { const im = new Image(); im.src = DIR + n + '.webp'; return im; };
  ['cloud', 'snow', 'leaf', 'aurora', 'dapple_s', 'dapple_l', 'wisp', 'bird', 'tumble', 'lava', 'ripple_a', 'frost'].forEach(n => IM[n === 'ripple_a' ? 'rippleA' : n] = load('env_' + n));
  ['flame_o', 'flame_p', 'glow_o', 'glow_y', 'glow_g', 'glow_p', 'glow_b', 'sparks', 'shock_y', 'shock_o', 'shock_g', 'shock_p', 'shock_b', 'rays_y', 'rays_o', 'rune_g', 'rune_p', 'bolt_p', 'vignette'].forEach(n => IM[n] = load('v2_' + n));
  const ok = im => !!im && im.complete && im.naturalWidth > 0;
  const SH = { snow: [64, 64], leaf: [64, 64], spark: [64, 64], cloud: [256, 256], wisp: [128, 128] };
  const SRC = { snow: 'snow', leaf: 'leaf', spark: 'sparks', cloud: 'cloud', wisp: 'wisp' };
  const tc = {};
  function tinted(img, key, rgb, a) {
    const id = key + rgb; if (tc[id]) return tc[id];
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height);
    return (tc[id] = c);
  }

  /* ---------- 오버레이 캔버스 (z-index 10 : 말 위 · 스킬 이펙트 아래) ---------- */
  let cvO = null, go = null, W = 0, H = 0, RC = { left: 0, top: 0, width: 0, height: 0 }, lastT = 0, themeNow = -1;
  function ensureCanvas() {
    if (cvO) return true; if (!document.body) return false;
    cvO = document.createElement('canvas'); cvO.id = 'jg_env5_cv';
    cvO.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:10;opacity:.72;';
    document.body.appendChild(cvO); go = cvO.getContext('2d'); return true;
  }
  const gameVisible = () => { const g = document.getElementById('g'); return !!g && g.style.display !== 'none' && typeof cv !== 'undefined' && !!cv && cv.offsetWidth > 0 && cv.offsetHeight > 0; };
  const active = () => E5.enabled && (!window.jgEnv3 || window.jgEnv3.enabled !== false);
  const cl = () => (typeof C === 'number' && C > 0) ? C : (typeof CX === 'number' ? CX : 40);
  const BR = () => ({ x: RC.left + OX, y: RC.top + OY, w: 8 * CX, h: 9 * CY });
  const PX = (gx, gy) => { const p = px(gx, gy); return [RC.left + p[0], RC.top + p[1]]; };

  /* ---------- 상태 ---------- */
  const PS = [], FXL = [], CB = [], FF = [], WS = [], SETS = [];
  const acc = {};
  let flashA = 0, flashRGB = '190,120,255', aurBoost = 0, sealPulse = null, nextSet = 0;
  const tick = (key, sec, fn, dt) => { acc[key] = (acc[key] || 0) + dt * Math.max(.4, window.jgPerf ? window.jgPerf.q : 1); let n = 0; while (acc[key] >= sec && n++ < 3) { acc[key] -= sec; fn(); } if (acc[key] > sec * 3) acc[key] = 0; };

  function sp(o) {
    if (PS.length > 300) PS.shift();
    PS.push(Object.assign({ kind: 'spark', cell: 6, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, sway: 0, swf: 1, ph: 0, rot: 0, vr: 0, size: 8, a: 1, life: 3, age: 0, rgb: '255,255,255', add: true, fadeIn: false, grow: 0, ta: .85 }, o));
  }
  function addFx(o) { if (FXL.length > 40) FXL.shift(); o.t0 = performance.now(); FXL.push(o); }
  function drawPS(g, dt) {
    for (let i = PS.length - 1; i >= 0; i--) {
      const p = PS[i]; p.age += dt;
      if (p.age >= p.life) { PS.splice(i, 1); continue; }
      const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const k = p.age / p.life, [cw, ch] = SH[p.kind], img = IM[SRC[p.kind]]; if (!ok(img)) continue;
      const t = tinted(img, p.kind, p.rgb, p.ta);
      let a = p.a * (p.fadeIn ? ease(p.age / .9) : 1) * (1 - ease((k - .72) / .28));
      if (p.kind === 'spark' && p.cell >= 6) a *= .6 + .4 * Math.sin(p.age * 9 + p.ph * 3);
      if (a <= .01) continue;
      const s = p.size * (1 + p.grow * k), x = p.x + p.sway * Math.sin(p.age * p.swf + p.ph);
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1);
      g.save(); g.translate(x, p.y); if (p.rot || p.vr) g.rotate(p.rot); g.drawImage(t, p.cell * cw, 0, cw, ch, -s / 2, -s * ch / cw / 2, s, s * ch / cw); g.restore();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function cloud(g, x, y, w, h, cell, rgb, a) {
    const img = IM.cloud; if (!ok(img)) return;
    g.globalAlpha = clamp(a, 0, 1); g.drawImage(tinted(img, 'cl', rgb, .9), cell * 256, 0, 256, 256, x - w / 2, y - h / 2, w, h);
  }
  function addDraw(g, img, sx, sy, sw, sh, dx, dy, dw, dh, a) { if (!ok(img) || a <= .004) return; g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); }

  /* ---------- 맵 구성 ---------- */
  const TONE = [[95, 50, 12, .3], [20, 60, 110, .3], [4, 32, 10, .34], [44, 0, 56, .38], [55, 28, 6, .3]];
  const TORCH = {
    0: [[-.6, 2.4, 'o'], [8.6, 2.4, 'o'], [-.6, 6.6, 'o'], [8.6, 6.6, 'o']],
    3: [[-.6, 2.2, 'p'], [8.6, 2.2, 'p'], [-.6, 6.8, 'p'], [8.6, 6.8, 'p']],
    4: [[-.6, 1.6, 'o'], [8.6, 1.6, 'o'], [-.6, 4.5, 'o'], [8.6, 4.5, 'o'], [-.6, 7.4, 'o'], [8.6, 7.4, 'o']]
  };
  function setupTheme(t) {
    themeNow = t; PS.length = 0; FXL.length = 0; CB.length = 0; FF.length = 0; WS.length = 0; SETS.length = 0; flashA = 0; aurBoost = 0; sealPulse = null;
    for (const k in acc) delete acc[k];
    const nCl = [5, 4, 4, 6, 4][t] || 4;
    for (let i = 0; i < nCl; i++) CB.push({ u: Math.random(), v: rnd(.1, .95), w: rnd(.55, 1.0), h: rnd(.22, .4), vx: rnd(.012, .03) * (t === 0 ? 3 : 1), cell: (Math.random() * 4) | 0, a: rnd(.5, 1) });
    if (t === 2) for (let i = 0; i < 22; i++) FF.push({ x: Math.random(), y: Math.random(), tx: Math.random(), ty: Math.random(), ph: rnd(0, 6), sp: rnd(.02, .05), hue: Math.random() < .3 ? '170,255,200' : '255,244,150' });
    if (t === 3) for (let i = 0; i < 6; i++) WS.push({ u: Math.random(), v: rnd(.1, .9), vx: rnd(.012, .03) * (Math.random() < .5 ? -1 : 1), ph: rnd(0, 6), cell: i % 4, rgb: i % 2 ? '190,110,255' : '120,225,255', sz: rnd(1.6, 2.8) });
    nextSet = performance.now() + rnd(9000, 16000);
  }

  /* ================== 바닥층 (장기알 아래) ================== */
  function tile(g, img, x, y, w, h, T, ox, oy) {
    if (!ok(img)) return; const sx = ((ox % T) + T) % T, sy = ((oy % T) + T) % T;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (let ty = y - sy; ty < y + h; ty += T) for (let tx = x - sx; tx < x + w; tx += T) g.drawImage(img, tx, ty, T + 1, T + 1);
    g.restore();
  }
  /* 바닥 레이어: 저해상도 오프스크린에 일정 주기(품질에 따라 90~340ms)로만 그려 두고, 매 프레임은 두 번 복사만 합니다(모바일 최적화) */
  let gcA = null, gcL = null, gcKey = '', gcLast = 0;
  const mkC = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(2, w); c.height = Math.max(2, h); return { cv: c, g: c.getContext('2d') }; };
  function renderGround(gA, gL, s, t, bx, by, bw, bh, C0, direct, offx, offy) {
    const A = () => { if (direct) gA.globalCompositeOperation = 'source-over'; }, L = () => { if (direct) gL.globalCompositeOperation = 'lighter'; };
    if (t === 0) {          /* 사막: 모래 물결 + 열기 */
      A(); gA.globalAlpha = .3; tile(gA, IM.rippleA, bx, by, bw, bh, C0 * 6.5, s * 7, s * 1.5);
      gA.globalAlpha = .09 + .03 * Math.sin(s * .5); gA.fillStyle = 'rgb(255,214,140)'; gA.fillRect(bx, by, bw, bh * .5);
    } else if (t === 1) {   /* 설원: 서리 결정 + 얼음 광택 스윕 */
      L(); gL.globalAlpha = .045 + .02 * Math.sin(s * .8); tile(gL, IM.frost, bx, by, bw, bh, C0 * 8, 0, 0);
      gL.globalAlpha = .03 + .02 * Math.sin(s * 1.3 + 2); tile(gL, IM.frost, bx, by, bw, bh, C0 * 5.5, 70, 40);
      const ph = (s * .09) % 1.6 - .3, gx0 = bx + (bw + bh) * ph - bh, gr = gL.createLinearGradient(gx0, by + bh, gx0 + bh, by); gr.addColorStop(0, 'rgba(200,240,255,0)'); gr.addColorStop(.5, 'rgba(225,250,255,.2)'); gr.addColorStop(1, 'rgba(200,240,255,0)');
      gL.globalAlpha = 1; gL.fillStyle = gr; gL.fillRect(bx, by, bw, bh);
    } else if (t === 2) {   /* 숲: 잎 그림자·햇살 얼룩 */
      A(); gA.globalAlpha = .13; tile(gA, IM.dapple_s, bx, by, bw, bh, C0 * 10, -s * 9, s * 4);
      L(); gL.globalAlpha = .06 + .025 * Math.sin(s * .7); tile(gL, IM.dapple_l, bx, by, bw, bh, C0 * 12, s * 6, -s * 3);
    } else if (t === 3) {   /* 암흑: 갈라진 땅 틈의 용암 */
      const pulse = .6 + .4 * Math.sin(s * 1.4), z = C0 * 12; L();
      gL.globalAlpha = (.07 + .07 * pulse); tile(gL, IM.lava, bx, by, bw, bh, z, s * 2, s * 1.2);
      gL.globalAlpha = .035 * pulse; tile(gL, IM.lava, bx, by, bw, bh, z * .6, -s * 3, 30);
    } else {                /* 고성: 횃불 빛웅덩이 */
      L(); [[-.6, 1.6], [8.6, 1.6], [-.6, 4.5], [8.6, 4.5], [-.6, 7.4], [8.6, 7.4]].forEach((q, i) => { const p0 = px(q[0], q[1]), p2 = [p0[0] + (offx || 0), p0[1] + (offy || 0)], fl = .7 + .3 * Math.sin(s * 7 + i * 2) * Math.sin(s * 3.1 + i), gm = IM.glow_o; if (ok(gm)) { const z = C0 * 6.5; gL.globalAlpha = .26 * fl; gL.drawImage(gm, p2[0] - z / 2, p2[1] - z / 2, z, z); } });
    }
  }
  function drawGround(g, now) {
    if (!E5.cvGround || !active() || !gameVisible() || E5.noGround) return;
    const t = (window.curBoardIdx || 0), bx = OX - CX * .3, by = OY - CY * .3, bw = 8 * CX + CX * .6, bh = 9 * CY + CY * .6, C0 = cl();
    const q = window.jgPerf ? window.jgPerf.q : 1, k = q >= .8 ? .5 : q >= .5 ? .4 : .3, key = [t, Math.round(bw), Math.round(bh), k].join();
    if (key !== gcKey) { gcA = mkC(Math.round(bw * k), Math.round(bh * k)); gcL = mkC(Math.round(bw * k), Math.round(bh * k)); gcKey = key; gcLast = 0; }
    const interval = q >= .8 ? 90 : q >= .5 ? 170 : 340;
    if (now - gcLast > interval) {
      gcLast = now;
      [gcA, gcL].forEach(c => { c.g.setTransform(1, 0, 0, 1, 0, 0); c.g.clearRect(0, 0, c.cv.width, c.cv.height); c.g.setTransform(k, 0, 0, k, -bx * k, -by * k); c.g.globalCompositeOperation = 'source-over'; });
      renderGround(gcA.g, gcL.g, now * .001, t, bx, by, bw, bh, C0);
    }
    g.save(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(gcA.cv, bx, by, bw, bh); g.globalCompositeOperation = 'lighter'; g.drawImage(gcL.cv, bx, by, bw, bh); g.restore();
  }

  function hookGround() {
    const orig = window.jgDrawBoardThemeFX;
    if (orig && orig.__e5) return;
    const w = function (g, now) { if (typeof orig === 'function') orig.apply(this, arguments); try { drawGround(g, now); } catch (e) {} };
    w.__e5 = true; if (orig && orig.__e3) w.__e3 = true; if (orig && orig.__sfx) w.__sfx = true;
    window.jgDrawBoardThemeFX = w;
  }

  /* ================== 공기층 ================== */
  function drawClouds(g, B, t, dt, rgb, aBase, yMin, yMax) {
    for (const c of CB) {
      c.u += c.vx * dt * (t === 0 ? 1.4 : 1); if (c.u > 1.45) { c.u = -.45; c.v = rnd(yMin, yMax); c.cell = (Math.random() * 4) | 0; }
      cloud(g, B.x + B.w * c.u, B.y + B.h * clamp(c.v, yMin, yMax), B.w * c.w, B.h * c.h, c.cell, rgb, aBase * c.a);
    }
    g.globalAlpha = 1;
  }
  function torches(g, t, now, dt) {
    const list = TORCH[t]; if (!list) return; const C0 = cl(), s = now * .001;
    list.forEach((q, i) => {
      const [x, y] = PX(q[0], q[1]), col = q[2], fl = .78 + .22 * Math.sin(s * 11 + i * 2) * Math.sin(s * 4.3 + i) + .06 * Math.sin(s * 27 + i);
      g.globalCompositeOperation = 'lighter';
      addDraw(g, IM['glow_' + (col === 'p' ? 'p' : 'o')], 0, 0, 256, 256, x - C0 * 2.4, y - C0 * 2.4, C0 * 4.8, C0 * 4.8, .36 * fl);
      const img = IM['flame_' + col]; if (ok(img)) { const f = ((s * 13 + i * 3) | 0) % 8, w = C0 * .78, h = w * 1.55; addDraw(g, img, (f % 4) * 128, ((f / 4) | 0) * 192, 128, 192, x - w / 2, y + C0 * .12 - h, w, h, .95); }
      g.globalCompositeOperation = 'source-over';
      tick('tf' + i, .22, () => sp({ kind: 'spark', cell: pick([6, 7, 0]), x: x + rnd(-4, 4), y: y - C0 * .5, vx: rnd(-14, 14) + (q[0] < 0 ? -6 : 6), vy: -rnd(40, 110), ay: -8, life: rnd(1.3, 2.6), size: C0 * rnd(.08, .15), rgb: col === 'p' ? '210,120,255' : '255,170,70', ph: rnd(0, 6) }), dt);
      if (t === 4 || t === 3) tick('ts' + i, 1.1, () => sp({ kind: 'cloud', cell: (Math.random() * 4) | 0, x: x + rnd(-3, 3), y: y - C0 * 1.1, vx: rnd(-6, 10), vy: -rnd(18, 32), life: 4.2, size: C0 * rnd(1.1, 1.7), a: t === 3 ? .13 : .1, rgb: t === 3 ? '90,40,120' : '170,160,150', grow: 1.3, rot: rnd(0, TAU), vr: rnd(-.2, .2), fadeIn: true, add: false }), dt);
    });
  }
  function flag(g, x, y, len, hh, dir, col, glyph, s, ph) {
    const N = 12; g.save();
    g.strokeStyle = '#3b2412'; g.lineWidth = Math.max(2, hh * .09); g.beginPath(); g.moveTo(x, y - hh * .62); g.lineTo(x, y + hh * .75); g.stroke();
    g.fillStyle = '#ffd54a'; g.beginPath(); g.arc(x, y - hh * .66, Math.max(2, hh * .07), 0, TAU); g.fill();
    const top = [], bot = [];
    for (let i = 0; i <= N; i++) { const u = i / N, w = Math.sin(s * 4.2 + u * 5.2 + ph) * hh * .13 * u, px_ = x + dir * u * len; top.push([px_, y - hh * .5 + w]); bot.push([px_ - dir * u * len * .08, y + hh * .22 + w * 1.1]); }
    const gr = g.createLinearGradient(x, 0, x + dir * len, 0); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    g.fillStyle = gr; g.beginPath(); g.moveTo(top[0][0], top[0][1]); top.forEach(p => g.lineTo(p[0], p[1])); for (let i = N; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,215,90,.95)'; g.lineWidth = Math.max(1, hh * .035); g.stroke();
    const m = Math.floor(N * .45), cx_ = (top[m][0] + bot[m][0]) / 2, cy_ = (top[m][1] + bot[m][1]) / 2;
    g.fillStyle = 'rgba(255,230,150,.95)'; g.font = `900 ${Math.max(9, len * .5)}px "Noto Serif KR",serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, cx_, cy_);
    g.restore();
  }
  function drawBirds(g, o, now) {
    const img = IM.bird; if (!ok(img)) return;
    const age = (now - o.t0) / 1000, k = age / o.life; if (k > 1) return false;
    o.birds.forEach(b => {
      const x = o.x0 + (o.x1 - o.x0) * k + b.dx, y = o.y0 + (o.y1 - o.y0) * k + b.dy + Math.sin(age * 1.3 + b.ph) * o.sz * .2, f = ((age * (o.fps) + b.ph * 2) | 0) & 3;
      g.globalAlpha = o.a * ease(k * 6) * (1 - ease((k - .88) / .12)); const sc = o.sz * b.s, ang = Math.atan2(o.y1 - o.y0, o.x1 - o.x0);
      g.save(); g.translate(x, y); g.rotate(ang + (o.x1 > o.x0 ? 0 : Math.PI) * 0); if (o.x1 < o.x0) g.scale(-1, 1); g.drawImage(img, f * 64, 0, 64, 48, -sc / 2, -sc * .375, sc, sc * .75); g.restore();
    });
    g.globalAlpha = 1; return true;
  }
  function startSet(t, B) {
    const C0 = cl(), now = performance.now();
    if (t === 0 && Math.random() < .55) {      /* 회전초 */
      const y = B.y + B.h * rnd(.3, .75); SETS.push({ k: 'tumble', t0: now, life: rnd(18, 24), x0: B.x - C0, x1: B.x + B.w + C0, y, hop: rnd(.2, .5) * C0, sz: C0 * rnd(.7, .95) });
    } else if (t === 0 || t === 2 || t === 4) {  /* 새 그림자 무리 */
      const n = t === 4 ? 5 : 4, ltr = Math.random() < .5, yA = B.y + B.h * rnd(.1, .7), yB = yA + B.h * rnd(-.3, .3);
      SETS.push({ k: 'birds', t0: now, life: rnd(15, 21), x0: ltr ? B.x - C0 * 2 : B.x + B.w + C0 * 2, x1: ltr ? B.x + B.w + C0 * 2 : B.x - C0 * 2, y0: yA, y1: yB, sz: t === 4 ? C0 * 1.0 : C0 * 1.5, fps: t === 4 ? 9 : 5, a: t === 2 ? .22 : .32, birds: Array.from({ length: n }, (_, i) => ({ dx: (i - n / 2) * C0 * rnd(.9, 1.5) * (ltr ? -1 : 1), dy: rnd(-.8, .8) * C0, s: rnd(.8, 1.15), ph: rnd(0, 6) })) });
    } else if (t === 1) {                       /* 오로라 폭발 */
      aurBoost = 1; SETS.push({ k: 'aur', t0: now, life: 24 });
    } else if (t === 3) {                       /* 먼 번개 */
      SETS.push({ k: 'bolt', t0: now, life: 1.1, x: Math.random() < .5 ? B.x - C0 * .15 : B.x + B.w + C0 * .15, h: B.h * rnd(.35, .65), f0: (Math.random() * 6) | 0 }); flashA = .5; flashRGB = '190,120,255';
    }
  }
  function drawSets(g, B, now) {
    for (let i = SETS.length - 1; i >= 0; i--) {
      const o = SETS[i], age = (now - o.t0) / 1000, k = age / o.life; if (k >= 1) { SETS.splice(i, 1); continue; }
      g.save();
      if (o.k === 'tumble') {
        const x = o.x0 + (o.x1 - o.x0) * k, hop = Math.abs(Math.sin(age * 2.6)) * o.hop, y = o.y - hop, a = ease(k * 8) * (1 - ease((k - .9) / .1));
        g.globalAlpha = .22 * a; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x, o.y + o.sz * .3, o.sz * (.45 - hop / o.sz * .2), o.sz * .13, 0, 0, TAU); g.fill();
        if (ok(IM.tumble)) { g.globalAlpha = .9 * a; g.translate(x, y); g.rotate(age * 4.2); g.drawImage(IM.tumble, -o.sz / 2, -o.sz / 2, o.sz, o.sz); }
      } else if (o.k === 'birds') {
        if (drawBirds(g, Object.assign(o, { t0: o.t0 }), now) === false) { SETS.splice(i, 1); }
      } else if (o.k === 'bolt') {
        const img = IM.bolt_p; if (ok(img)) {
          const f = (o.f0 + ((age / .06) | 0)) % 6, a = (.5 + .5 * Math.abs(Math.sin(age * 55))) * Math.pow(1 - k, .8), w = o.h * .5;
          g.globalCompositeOperation = 'lighter'; addDraw(g, img, f * 256, 0, 256, 512, o.x - w / 2, B.y - cl() * .3, w, o.h, a); addDraw(g, img, f * 256, 0, 256, 512, o.x - w / 2, B.y - cl() * .3, w, o.h, a * .6);
          if (age > .5 && age < .56) { flashA = Math.max(flashA, .35); }
        }
      } else if (o.k === 'aur') { /* aurBoost 관리용 */ aurBoost = Math.sin(k * Math.PI); }
      g.restore();
    }
    if (!SETS.some(o => o.k === 'aur')) aurBoost *= .98;
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  /* 맵별 공기층 */
  function drawAir(g, B, t, now, dt) {
    const s = now * .001, C0 = cl(), S = Math.min(RC.width, RC.height);
    /* 공통 분위기 톤 */
    const tn = TONE[t] || TONE[4];
    if (ok(IM.vignette)) { g.globalAlpha = tn[3] + .05 * Math.sin(s * .6); g.drawImage(tinted(IM.vignette, 'vg', `${tn[0]},${tn[1]},${tn[2]}`, 1), RC.left, RC.top, RC.width, RC.height); g.globalAlpha = 1; }

    if (t === 0) {            /* ===== 황토 사막 ===== */
      g.globalCompositeOperation = 'lighter';
      if (ok(IM.rays_y)) { const z = B.w * 1.9; g.save(); g.translate(B.x + B.w * .95, B.y - C0 * .6); g.rotate(s * .04); addDraw(g, IM.rays_y, 0, 0, 512, 512, -z / 2, -z / 2, z, z, .1 + .04 * Math.sin(s * .7)); g.restore(); }
      g.globalCompositeOperation = 'source-over';
      drawClouds(g, B, t, dt, '218,172,108', .13, .15, .95);
      const wind = 1 + .5 * Math.sin(s * .35);
      tick('sand', .03 / E5.density, () => sp({ kind: 'spark', cell: pick([0, 1, 2, 6]), x: B.x - C0, y: rnd(B.y, B.y + B.h), vx: rnd(150, 340) * wind, vy: rnd(-12, 40), sway: rnd(2, 8), swf: rnd(3, 7), ph: rnd(0, 6), size: C0 * rnd(.05, .11), a: rnd(.3, .6), life: rnd(2.2, 4), rgb: '236,200,140', ta: .75 }), dt);
      tick('dust', 1.4, () => sp({ kind: 'cloud', cell: (Math.random() * 4) | 0, x: B.x - C0 * 2, y: B.y + B.h * rnd(.5, 1.0), vx: rnd(80, 150), vy: -rnd(2, 12), life: rnd(5, 8), size: C0 * rnd(2.6, 4.2), a: .11, rgb: '222,180,118', grow: .5, fadeIn: true, add: false, rot: rnd(0, TAU), vr: rnd(-.1, .1) }), dt);
      torches(g, t, now, dt);
    } else if (t === 1) {     /* ===== 설원 얼음성 ===== */
      /* 오로라 */
      const A = IM.aurora; if (ok(A)) {
        g.globalCompositeOperation = 'lighter'; const N = 26, sw = B.w * 1.2 / N, top = B.y - C0 * .1, hh = B.h * (.34 + .1 * aurBoost), al = .22 + .12 * Math.sin(s * .5) + .38 * aurBoost;
        for (let layer = 0; layer < 2; layer++) {
          for (let i = 0; i < N; i++) {
            const u = i / N, off = Math.sin(s * (.5 + layer * .2) + u * 6.5 + layer * 2) * C0 * .55 * (1 + aurBoost), hv = hh * (.78 + .22 * Math.sin(s * .8 + u * 9 + layer));
            addDraw(g, A, (u * 1024) | 0, 0, Math.ceil(1024 / N) + 1, 256, B.x - B.w * .1 + i * sw, top + off - (layer ? C0 * .6 : 0), sw + 1, hv, al * (layer ? .6 : 1) * (.6 + .4 * Math.sin(s * 1.1 + u * 12)));
          }
        }
        g.globalCompositeOperation = 'source-over';
      }
      drawClouds(g, B, t, dt, '214,236,255', .07, .55, 1.0);
      const gust = Math.sin(s * .27) * 26 + (Math.sin(s * .9) * 8);
      tick('far', .06 / E5.density, () => sp({ kind: 'snow', cell: pick([4, 5, 6, 7]), x: rnd(B.x - B.w * .2, B.x + B.w * 1.1), y: B.y - 14, vx: gust * .5 + rnd(-6, 6), vy: rnd(24, 40), sway: rnd(6, 14), swf: rnd(.8, 1.6), ph: rnd(0, 6), size: C0 * rnd(.07, .11), a: .6, life: rnd(9, 13), rgb: '240,252,255', ta: .6 }), dt);
      tick('mid', .16 / E5.density, () => sp({ kind: 'snow', cell: (Math.random() * 4) | 0, x: rnd(B.x - B.w * .2, B.x + B.w * 1.1), y: B.y - 20, vx: gust + rnd(-8, 8), vy: rnd(40, 66), sway: rnd(10, 22), swf: rnd(.7, 1.4), ph: rnd(0, 6), size: C0 * rnd(.14, .22), a: .85, life: rnd(7, 10), rgb: '232,248,255', ta: .55, rot: rnd(0, TAU), vr: rnd(-1.2, 1.2) }), dt);
      tick('near', .7 / E5.density, () => sp({ kind: 'snow', cell: (Math.random() * 4) | 0, x: rnd(B.x - B.w * .2, B.x + B.w * 1.1), y: B.y - 30, vx: gust * 1.4 + rnd(-10, 10), vy: rnd(90, 135), sway: rnd(14, 30), swf: rnd(.6, 1.2), ph: rnd(0, 6), size: C0 * rnd(.3, .46), a: .42, life: rnd(4.5, 6.5), rgb: '225,244,255', ta: .5, rot: rnd(0, TAU), vr: rnd(-1.6, 1.6) }), dt);
      tick('gl', .22, () => sp({ kind: 'spark', cell: pick([3, 4, 5]), x: rnd(B.x, B.x + B.w), y: rnd(B.y, B.y + B.h), life: rnd(.7, 1.2), size: C0 * rnd(.18, .34), a: .9, rgb: '230,250,255', rot: rnd(0, TAU), ph: rnd(0, 6) }), dt);
    } else if (t === 2) {     /* ===== 고대 숲 유적 ===== */
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const bx = B.x + B.w * (.08 + i * .27) + Math.sin(s * .22 + i) * B.w * .03, a = .075 + .035 * Math.sin(s * .6 + i * 1.7), wT = B.w * .06, wB = B.w * .17;
        const gr = g.createLinearGradient(0, B.y, 0, B.y + B.h * .95); gr.addColorStop(0, `rgba(255,252,190,${a})`); gr.addColorStop(1, 'rgba(255,252,190,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(bx - wT, B.y); g.lineTo(bx + wT, B.y); g.lineTo(bx + wB + B.w * .2, B.y + B.h * .95); g.lineTo(bx - wB + B.w * .2, B.y + B.h * .95); g.closePath(); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      drawClouds(g, B, t, dt, '196,232,208', .11, .6, 1.02);
      tick('lf', 1.0 / E5.density, () => sp({ kind: 'leaf', cell: (Math.random() * 6) | 0, x: rnd(B.x - B.w * .1, B.x + B.w * 1.05), y: B.y - 16, vx: rnd(6, 28), vy: rnd(28, 48), sway: rnd(26, 52), swf: rnd(.9, 1.8), ph: rnd(0, 6), size: C0 * rnd(.26, .38), a: .92, life: rnd(11, 15), rgb: pick(['96,196,84', '152,214,80', '218,190,70', '70,170,110']), ta: .8, rot: rnd(0, TAU), vr: rnd(-2, 2), add: false }), dt);
      tick('mote', .13 / E5.density, () => sp({ kind: 'spark', cell: pick([6, 7]), x: rnd(B.x, B.x + B.w), y: B.y + B.h + 8, vx: rnd(-6, 8), vy: -rnd(10, 30), sway: rnd(8, 16), swf: rnd(.8, 1.8), ph: rnd(0, 6), size: C0 * rnd(.07, .15), a: .8, life: rnd(6, 10), rgb: '255,240,160', fadeIn: true }), dt);
      /* 반딧불 */
      for (const f of FF) {
        const dx = f.tx - f.x, dy = f.ty - f.y; f.x += dx * f.sp * dt * 6; f.y += dy * f.sp * dt * 6; if (Math.hypot(dx, dy) < .03) { f.tx = Math.random(); f.ty = Math.random(); }
        const x = B.x + B.w * f.x + Math.sin(s * 1.7 + f.ph) * C0 * .15, y = B.y + B.h * f.y + Math.cos(s * 1.3 + f.ph) * C0 * .12, pu = .35 + .65 * Math.pow(.5 + .5 * Math.sin(s * 2.1 + f.ph * 3), 1.5);
        g.globalCompositeOperation = 'lighter'; addDraw(g, tinted(IM.glow_y, 'gy', f.hue, .7), 0, 0, 256, 256, x - C0 * .6, y - C0 * .6, C0 * 1.2, C0 * 1.2, .55 * pu);
        addDraw(g, tinted(IM.sparks, 'ff', f.hue, .9), 6 * 64, 0, 64, 64, x - C0 * .2, y - C0 * .2, C0 * .4, C0 * .4, pu);
      }
      g.globalCompositeOperation = 'source-over';
    } else if (t === 3) {     /* ===== 암흑 성채 ===== */
      const pulse = .7 + .3 * Math.sin(s * 1.5);
      g.globalCompositeOperation = 'lighter';
      const gr = g.createLinearGradient(0, B.y + B.h * 1.04, 0, B.y + B.h * .5); gr.addColorStop(0, `rgba(255,70,40,${.2 * pulse})`); gr.addColorStop(1, 'rgba(255,70,40,0)'); g.fillStyle = gr; g.fillRect(B.x - C0, B.y + B.h * .5, B.w + C0 * 2, B.h * .6);
      addDraw(g, IM.glow_p, 0, 0, 256, 256, B.x + B.w * .5 - B.w * .5, B.y - C0 * .6, B.w, B.w * .6, .16 * pulse);
      g.globalCompositeOperation = 'source-over';
      drawClouds(g, B, t, dt, '70,26,96', .2, .55, 1.02);
      /* 혼령 */
      for (const w of WS) {
        w.u += w.vx * dt; if (w.u > 1.2) w.u = -.2; if (w.u < -.2) w.u = 1.2;
        const x = B.x + B.w * w.u, y = B.y + B.h * (w.v + Math.sin(s * .5 + w.ph) * .07), sz = C0 * w.sz, im = tinted(IM.wisp, 'ws', w.rgb, .9);
        g.globalCompositeOperation = 'lighter'; g.save(); g.translate(x, y); if (w.vx > 0) g.scale(-1, 1); g.globalAlpha = .55 + .2 * Math.sin(s * 2 + w.ph); g.drawImage(im, w.cell * 128, 0, 128, 128, -sz / 2, -sz / 2, sz, sz); g.restore();
      }
      g.globalCompositeOperation = 'source-over';
      tick('em', .06 / E5.density, () => sp({ kind: 'spark', cell: pick([6, 7, 0]), x: rnd(B.x, B.x + B.w), y: B.y + B.h + 6, vx: rnd(-10, 14), vy: -rnd(40, 120), sway: rnd(6, 18), swf: rnd(1, 2.4), ph: rnd(0, 6), size: C0 * rnd(.06, .14), a: .95, life: rnd(3, 6.5), rgb: pick(['255,120,60', '255,70,90', '200,90,255']) }), dt);
      tick('ash', .45, () => sp({ kind: 'spark', cell: 7, x: rnd(B.x - C0, B.x + B.w), y: B.y - 12, vx: rnd(-6, 14), vy: rnd(14, 30), sway: rnd(8, 18), swf: rnd(.8, 1.6), ph: rnd(0, 6), size: C0 * rnd(.06, .12), a: .5, life: 9, rgb: '150,140,150', add: false }), dt);
      torches(g, t, now, dt);
    } else {                  /* ===== 삼국지 고성 ===== */
      g.globalCompositeOperation = 'lighter';
      if (ok(IM.rays_o)) { const z = B.w * 1.9; g.save(); g.translate(B.x + B.w * .05, B.y - C0 * .8); g.rotate(-s * .035); addDraw(g, IM.rays_o, 0, 0, 512, 512, -z / 2, -z / 2, z, z, .1 + .03 * Math.sin(s * .6)); g.restore(); }
      g.globalCompositeOperation = 'source-over';
      drawClouds(g, B, t, dt, '168,150,132', .09, .6, 1.0);
      tick('gd', .16 / E5.density, () => sp({ kind: 'spark', cell: pick([6, 7, 0]), x: rnd(B.x, B.x + B.w), y: B.y + B.h * rnd(.2, 1), vx: rnd(-6, 10), vy: -rnd(6, 22), sway: rnd(8, 16), swf: rnd(.8, 1.8), ph: rnd(0, 6), size: C0 * rnd(.06, .13), a: .75, life: rnd(5, 9), rgb: '255,216,120', fadeIn: true }), dt);
      torches(g, t, now, dt);
      const fl = [[-.38, 3.25, -1, ['#b3201a', '#e4472a'], '한'], [8.38, 3.25, 1, ['#b3201a', '#e4472a'], '한'], [-.38, 5.75, -1, ['#0f7f7a', '#26b5a8'], '초'], [8.38, 5.75, 1, ['#0f7f7a', '#26b5a8'], '초']];
      fl.forEach((q, i) => { const [x, y] = PX(q[0], q[1]); flag(g, x, y, C0 * .6, C0 * 1.25, q[2], q[3], q[4], s, i * 1.3); });
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    drawPS(g, dt);
  }

  /* ---------- 기물 잡기 반응 ---------- */
  function onCapture(gx, gy, t) {
    const [x, y] = PX(gx, gy), C0 = cl(), now = performance.now();
    const shock = ['shock_o', 'shock_b', 'shock_g', 'shock_p', 'shock_y'][t], glw = ['glow_o', 'glow_b', 'glow_g', 'glow_p', 'glow_y'][t];
    addFx({ life: .9, fn(g, k) { const im = IM[shock]; if (!ok(im)) return; const f = Math.min(7, (k * 8) | 0), z = C0 * 4.2; g.globalCompositeOperation = 'lighter'; g.save(); g.translate(x, y + C0 * .1); g.scale(1, .58); addDraw(g, im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -z / 2, -z / 2, z, z, 1 - k * .3); g.restore(); const z2 = C0 * 3.4 * (.5 + k * .5); addDraw(g, IM[glw], 0, 0, 256, 256, x - z2 / 2, y - z2 / 2, z2, z2, (1 - k) * .9); } });
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), v = rnd(90, 330), c = Math.cos(a) * v, d = Math.sin(a) * v * .8;
      if (t === 0) sp({ kind: 'cloud', cell: (Math.random() * 4) | 0, x, y, vx: c * .35, vy: d * .3 - 20, life: rnd(1.4, 2.4), size: C0 * rnd(1.1, 2), a: .35, rgb: '226,184,120', grow: 1.2, add: false, rot: rnd(0, TAU), vr: rnd(-.4, .4), drag: .96 });
      else if (t === 1) sp({ kind: 'snow', cell: (Math.random() * 4) | 0, x, y, vx: c, vy: d - 60, ay: 380, life: rnd(.9, 1.7), size: C0 * rnd(.2, .4), a: .95, rgb: '215,244,255', rot: rnd(0, TAU), vr: rnd(-8, 8), drag: .985 });
      else if (t === 2) sp({ kind: 'leaf', cell: (Math.random() * 6) | 0, x, y, vx: c * .8, vy: d * .8 - 80, ay: 200, sway: 14, swf: 5, life: rnd(1.3, 2.4), size: C0 * rnd(.24, .4), a: .95, rgb: pick(['96,196,84', '152,214,80', '218,190,70']), rot: rnd(0, TAU), vr: rnd(-7, 7), add: false, drag: .985 });
      else sp({ kind: 'spark', cell: pick([3, 4, 5, 0]), x, y, vx: c * 1.1, vy: d * 1.1 - 100, ay: 520, life: rnd(.7, 1.6), size: C0 * rnd(.14, .3), a: 1, rgb: t === 3 ? pick(['255,110,50', '200,90,255', '255,70,90']) : '255,215,90', rot: rnd(0, TAU), vr: rnd(-6, 6), drag: .987 });
    }
    if (t === 3) for (let i = 0; i < 4; i++) sp({ kind: 'cloud', cell: (Math.random() * 4) | 0, x: x + rnd(-8, 8), y, vx: rnd(-20, 20), vy: -rnd(20, 50), life: 3, size: C0 * rnd(1.2, 2), a: .3, rgb: '70,26,96', grow: 1.3, add: false, fadeIn: true });
  }
  function pollAnim(t) {
    const A = (typeof anim !== 'undefined') ? anim : null;
    if (A && A.T && A.q && A.hit) { if (!A.__e5) { A.__e5 = true; try { onCapture(A.m[2], A.m[3], t); } catch (e) {} } }
  }

  /* ---------- 메인 루프 ---------- */
  let skipN = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!ensureCanvas()) return;
    const _t0 = performance.now(); try { loopBody(now); } finally { E5.ms = (E5.ms || 0) * .9 + (performance.now() - _t0) * .1; }
  }
  function loopBody(now) {
    if (window.jgPerf && window.jgPerf.cinema > 0) { if (cvO.style.visibility !== 'hidden') cvO.style.visibility = 'hidden'; return; } else if (cvO.style.visibility === 'hidden') cvO.style.visibility = '';
    if (window.jgPerf && window.jgPerf.q < .8 && ((skipN++) & 1)) return;
    const dt = Math.min(.05, Math.max(.001, (now - (lastT || now)) / 1000)); lastT = now;
    const dpr = (window.jgPerf ? window.jgPerf.dpr(1) : Math.min(window.devicePixelRatio || 1, 1)) * .8, Wn = window.innerWidth, Hn = window.innerHeight;
    if (cvO.width !== Math.round(Wn * dpr) || cvO.height !== Math.round(Hn * dpr)) { cvO.width = Math.round(Wn * dpr); cvO.height = Math.round(Hn * dpr); }
    W = Wn; H = Hn; go.setTransform(dpr, 0, 0, dpr, 0, 0); go.clearRect(0, 0, W, H);
    if (window.jgEnv3 && window.jgEnv3.ambient !== false) window.jgEnv3.ambient = false;   /* 구 상시환경 대체 */
    if (!active() || !gameVisible()) { PS.length = 0; FXL.length = 0; return; }
    RC = cv.getBoundingClientRect();
    const t = window.curBoardIdx || 0; if (t !== themeNow) setupTheme(t);
    const inPlay = (typeof inGame !== 'undefined') && inGame && !over;
    pollAnim(t);
    const B = BR(), hudH = (document.getElementById('hud') || {}).offsetHeight || 0, tn = performance.now();
    if (inPlay && tn > nextSet) { startSet(t, B); nextSet = tn + rnd(14000, 30000); }
    go.save(); go.beginPath(); go.rect(RC.left, RC.top + hudH, RC.width, RC.height - hudH); go.clip();
    if (!E5.noGround && !E5.cvGround) renderGround(go, go, tn * .001, t, RC.left + OX - CX * .3, RC.top + OY - CY * .3, 8 * CX + CX * .6, 9 * CY + CY * .6, cl(), true, RC.left, RC.top);
    go.globalAlpha = 1; go.globalCompositeOperation = 'source-over';
    if (!E5.noAir) { drawAir(go, B, t, tn, dt); drawSets(go, B, tn); }
    for (let i = FXL.length - 1; i >= 0; i--) { const f = FXL[i], age = (tn - f.t0) / 1000, k = age / f.life; if (k >= 1) { FXL.splice(i, 1); continue; } go.save(); try { f.fn(go, k, age); } catch (e) { FXL.splice(i, 1); } go.restore(); }
    if (flashA > .01) { go.globalCompositeOperation = 'lighter'; go.globalAlpha = flashA; if (ok(IM.vignette)) go.drawImage(tinted(IM.vignette, 'vg', flashRGB, 1), RC.left, RC.top, RC.width, RC.height); go.fillStyle = `rgba(${flashRGB},${flashA * .3})`; go.globalAlpha = 1; go.fillRect(RC.left, RC.top, RC.width, RC.height); flashA *= Math.pow(.03, dt); }
    go.restore(); go.globalAlpha = 1; go.globalCompositeOperation = 'source-over';
    if (window.jgPieceMask) window.jgPieceMask.carve(go, RC);
  }
  setInterval(hookGround, 1500); hookGround();
  E5.test = function (kind) { const B = BR(); const t = window.curBoardIdx || 0; if (kind === 'set') startSet(t, B); else if (kind === 'capture') onCapture(4, 4, t); };
  requestAnimationFrame(loop);
})();
