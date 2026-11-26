/* ============================================================================
 * [군주 응징 스킬 v6.1 — 6군주 완전 차별화 + 화려하고 부드러운 업그레이드]  js/warlord-punish-v6.js
 *  warlord-system.js 의 window.warlordPunishFire 를 대체합니다(호출 규격·멀티 동기화 seed 동일).
 *
 *   🌌 제갈량 : [팔진천기] 밤하늘 → 북두칠성 별자리(빛 리본) → 팔문금쇄가 부드럽게 닫힘 → 태극 수축 · 별빛 기둥
 *   🌊 손  권 : [파천노도] 초승달 수압검기 3연참 → 3겹 장강 해일(누선·물보라·안개) → 물이 빠지며 물결
 *   ⚡ 조  조 : [패왕난무] 그림자 분신 3체의 6연 성형 참격(붉은 잔상) → 암청 뇌전망 · 낙뢰
 *   🌸 유  비 : [도원쌍검] 복사꽃 소용돌이 → 비취·황금 쌍검 이중 나선 → 도원결의 3중 고리 · 만개 · 꽃비
 *   🔱 여  포 : [방천귀신격] 귀신 기운 오라 → 방천화극 강하 → 슬로모션 착탄 · 분화구 · 불길 · 균열
 *   🐺 사마의 : [낭고빙결] 시간 정지 · 오로라 · 늑대 영혼 → 중력 소용돌이 → 내파 · 4방위 연쇄뇌전 · 빙정
 *
 *  v6.1 공통 개선(부드럽게): 장면 전체 블룸(빛번짐) · 방사형 부드러운 섬광(화면 전체 깜빡임 제거)
 *                           · 착탄 슬로모션 + 줌 펀치 + 감쇠 진동 · 모든 등장/퇴장 곡선 완만화 · 방사형 색조(비네트형)
 *  피해/흔적 처리는 기존대로 window.hitCamp(...) · window.hitScreen(...) 을 그대로 호출합니다.
 *  끄기(기존 연출 복귀): jgWarlordPunish6.enabled = false
 * ============================================================================ */
(function jgWarlordPunishV6() {
  if (window.__JG_WLP6__) return;
  window.__JG_WLP6__ = true;
  const W6 = window.jgWarlordPunish6 = { enabled: true, bloom: .55, ultimate: true };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const smooth = k => { k = clamp(k, 0, 1); return k * k * k * (k * (k * 6 - 15) + 10); };
  const outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const outQuint = k => 1 - Math.pow(1 - clamp(k, 0, 1), 5);
  const inCubic = k => Math.pow(clamp(k, 0, 1), 3);
  const inOut = k => ease(k);
  const outBack = k => { k = clamp(k, 0, 1); const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const kk = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const LOWQ = () => !!(window.jgPerf && window.jgPerf.q < .6);
  const hash = (i, s) => { const r = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return r - Math.floor(r); };

  /* ---------- 이미지 ---------- */
  const DIR = 'assets/images/fx/', IM = {};
  const load = n => { const im = new Image(); im.src = DIR + n + '.webp'; return im; };
  ['taiji', 'bagua', 'starflare', 'crescent', 'wave', 'ship', 'slash', 'cloak', 'net', 'sword', 'petal', 'halberd', 'fissure', 'rock', 'wolf', 'ice', 'orb', 'gravity', 'ribbon', 'bokeh', 'foam', 'aura', 'softflash'].forEach(n => IM[n] = load('wl_' + n));
  ['glow_o', 'glow_b', 'glow_g', 'glow_y', 'glow_p', 'shock_y', 'shock_o', 'shock_b', 'shock_p', 'shock_g', 'bolt_b', 'bolt_y', 'bolt_p', 'bolt_g', 'sparks', 'flame_o', 'flame_p', 'vignette'].forEach(n => IM[n] = load('v2_' + n));
  ['cloud', 'frost', 'snow'].forEach(n => IM['e_' + n] = load('env_' + n)); IM.tshard = load('tear_shard'); IM.ice = load('wl_ice'); ['speed', 'brush', 'burst', 'seal'].forEach(n => IM['ult_' + n] = load('ult_' + n)); IM.por = {}; ['zhuge', 'sunquan', 'caocao', 'liubei', 'lvbu', 'simayi'].forEach(id => { const i = new Image(); i.src = 'assets/images/warlords/' + id + '.jpg'; IM.por[id] = i; });
  const ok = im => !!im && im.complete && im.naturalWidth > 0;
  const tc = {};
  function tinted(img, key, rgb, a) {
    const id = key + rgb + a; if (tc[id]) return tc[id];
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height);
    return (tc[id] = c);
  }

  /* ---------- 사운드 (합성음, 군주별 음색) ---------- */
  let AC = null;
  function ac() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } }
  const sfxOn = () => !(window.jgEnv3 && window.jgEnv3.sfx === false);
  function tone(type, f0, f1, dur, vol, delay) {
    if (!sfxOn()) return; const a = ac(); if (!a) return;
    try { const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .03); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .05); } catch (e) {}
  }
  function noise(dur, ftype, f0, f1, vol, delay) {
    if (!sfxOn()) return; const a = ac(); if (!a) return;
    try { const t0 = a.currentTime + (delay || 0), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
      const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = ftype; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t0); } catch (e) {}
  }

  /* ---------- 장기판 좌표 ---------- */
  function metrics(V) {
    const cvB = document.getElementById('cv'), W = window.innerWidth, H = window.innerHeight;
    const r = cvB ? cvB.getBoundingClientRect() : { left: 0, top: 46, width: W, height: H - 46 };
    const br = { left: r.left, top: r.top, width: r.width, height: r.height }, S = Math.min(br.width, br.height);
    const isTop = (typeof flip !== 'undefined' && flip) ? (V === 'c') : (V === 'h');
    const hasG = typeof OX === 'number' && typeof CX === 'number' && CX > 5 && CY > 5, cx = hasG ? CX : br.width / 9, cy = hasG ? CY : br.height / 10;
    const gl = br.left + (hasG ? OX : br.width * .1), gt = br.top + (hasG ? OY : br.height * .08);
    const camp = { x0: gl - cx * .4, w: 8 * cx + cx * .8, y0: isTop ? gt - cy * .4 : gt + 4.55 * cy, h: 4.42 * cy + cy * .4 };
    return { W, H, br, S, isTop, cvB, camp, cell: (typeof C === 'number' && C > 0) ? C : Math.min(cx, cy), gl, gt, gw: 8 * cx, gh: 9 * cy };
  }

  /* ---------- 그리기 도구 ---------- */
  let BG = null;   /* 배경(색조) 전용 레이어 : 블룸 대상에서 제외 */
  function addD(g, img, sx, sy, sw, sh, dx, dy, dw, dh, a) { if (!ok(img) || a <= .004) return; g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); }
  function spr(g, img, x, y, w, h, a, rot, fx) {
    if (!ok(img) || a <= .004) return; g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (fx) g.scale(fx, 1); g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, -w / 2, -h / 2, w, h); g.restore();
  }
  function cell(g, img, cw, ch, n, x, y, w, a, rot) {
    if (!ok(img) || a <= .004) return; const h = w * ch / cw; g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, n * cw, 0, cw, ch, -w / 2, -h / 2, w, h); g.restore();
  }
  function glow(g, key, x, y, size, a) { const im = IM[key]; if (!ok(im) || a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, x - size / 2, y - size / 2, size, size); g.restore(); }
  function softFlash(g, x, y, size, rgb, a) { if (!ok(IM.softflash) || a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a * .6, 0, 1); g.drawImage(tinted(IM.softflash, 'sf', rgb, .8), x - size / 2, y - size / 2, size, size); g.restore(); }
  function ribbon(g, x0, y0, x1, y1, w, rgb, a) {
    const im = IM.ribbon; if (!ok(im) || a <= .004) return; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < 1) return;
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate((x0 + x1) / 2, (y0 + y1) / 2); g.rotate(Math.atan2(dy, dx)); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tinted(im, 'rb', rgb, .75), -L / 2, -w / 2, L, w); g.restore();
  }
  function arcRibbon(g, cx, cy, r, a0, a1, w, rgb, al, flat) {
    const N = 6; let px = cx + Math.cos(a0) * r, py = cy + Math.sin(a0) * r * (flat || 1);
    for (let i = 1; i <= N; i++) { const a = a0 + (a1 - a0) * i / N, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * (flat || 1); ribbon(g, px, py, x, y, w, rgb, al * Math.sin(i / N * Math.PI) ** .5); px = x; py = y; }
  }
  function ring(g, x, y, r, w, rgb, a, flat) {
    if (a <= .004) return; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || 1);
    g.strokeStyle = `rgba(${rgb},${a * .35})`; g.lineWidth = w * 3.4; g.beginPath(); g.arc(0, 0, Math.max(1, r), 0, TAU); g.stroke();
    g.strokeStyle = `rgba(${rgb},${a * .6})`; g.lineWidth = w * 1.6; g.beginPath(); g.arc(0, 0, Math.max(1, r), 0, TAU); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${a * .55})`; g.lineWidth = Math.max(.8, w * .6); g.beginPath(); g.arc(0, 0, Math.max(1, r), 0, TAU); g.stroke(); g.restore();
  }
  function shockSprite(g, key, x, y, size, k, a, flat) {
    const im = IM[key]; if (!ok(im) || a <= .004 || k < 0) return; const kc = clamp(k, 0, .999), f = Math.min(7, (kc * 8) | 0), f2 = Math.min(7, f + 1), mix = kc * 8 - f;
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || .6);
    if (LOWQ()) { g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size); g.restore(); return; }   /* 저사양: 프레임 보간 생략 */
    g.globalAlpha = clamp(a * (1 - mix), 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size);
    g.globalAlpha = clamp(a * mix, 0, 1); g.drawImage(im, (f2 % 4) * 256, ((f2 / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size); g.restore();
  }
  /* 방사형 색조(비네트형): 가운데는 옅게, 가장자리는 짙게 → 평평한 사각 오버레이보다 자연스러움 */
  function wash(g, M, rgb, a) {
    if (a <= .003) return; const gg = BG || g, cx = M.br.left + M.br.width / 2, cy = M.br.top + M.br.height / 2, R = Math.hypot(M.br.width, M.br.height) * .5;
    const gr = gg.createRadialGradient(cx, cy, R * .12, cx, cy, R); gr.addColorStop(0, `rgba(${rgb},${a * .55})`); gr.addColorStop(1, `rgba(${rgb},${Math.min(1, a * 1.25)})`);
    gg.save(); gg.fillStyle = gr; gg.fillRect(M.br.left, M.br.top, M.br.width, M.br.height); gg.restore();
  }
  function vig(g, M, rgb, a) { const im = IM.vignette, gg = BG || g; if (!ok(im) || a <= .003) return; gg.save(); gg.globalAlpha = clamp(a, 0, 1); gg.drawImage(tinted(im, 'v', rgb, 1), M.br.left, M.br.top, M.br.width, M.br.height); gg.restore(); }
  /* 떠다니는 보케 빛방울 */
  function bokeh(g, M, t, rgb, n, a, seed) {
    const im = IM.bokeh; if (!ok(im) || a <= .004 || LOWQ()) return; const tt = tinted(im, 'bk', rgb, .85);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const u = hash(i, seed), v = hash(i + 50, seed), sp = .012 + .02 * hash(i + 9, seed), x = M.br.left + M.br.width * ((u + .03 * Math.sin(t * .6 + i)) % 1), y = M.br.top + M.br.height * (((v - t * sp) % 1 + 1) % 1), s = M.S * (.035 + .075 * hash(i + 3, seed));
      g.globalAlpha = a * (.25 + .75 * Math.pow(Math.sin(t * 1.1 + i * 2.3) * .5 + .5, 1.6)); g.drawImage(tt, (i % 4) * 128, 0, 128, 128, x - s / 2, y - s / 2, s, s);
    }
    g.restore();
  }

  /* ---------- 파티클 ---------- */
  const SHEET = { spark: ['sparks', 64, 64], petal: ['petal', 64, 64], rock: ['rock', 64, 64], ice: ['ice', 128, 128], cloud: ['e_cloud', 256, 256], flake: ['e_snow', 64, 64], foam: ['foam', 128, 128], bokeh: ['bokeh', 128, 128], tshard: ['tshard', 64, 64] };
  function newRun() { return { P: [] }; }
  function sp(run, o) { if (window.jgPerf && window.jgPerf.q < .95 && Math.random() > Math.max(.3, window.jgPerf.q)) return; if (run.P.length >= Math.round(400 * Math.max(.5, window.jgPerf ? window.jgPerf.q : 1))) return; run.P.push(Object.assign({ kind: 'spark', cell: 0, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, sway: 0, swf: 1, ph: 0, rot: 0, vr: 0, size: 8, a: 1, life: 1.5, age: 0, rgb: '255,255,255', add: true, grow: 0, ta: .85, fadeIn: 0 }, o)); }
  function stepPT(run, g, dt) {
    for (let i = run.P.length - 1; i >= 0; i--) {
      const p = run.P[i]; p.age += dt; if (p.age >= p.life) { run.P.splice(i, 1); continue; }
      const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const sh = SHEET[p.kind], img = IM[sh[0]]; if (!ok(img)) continue; const k = p.age / p.life;
      const a = p.a * (p.fadeIn ? ease(p.age / p.fadeIn) : 1) * (1 - smooth((k - .55) / .45)); if (a <= .01) continue;
      const s = p.size * (1 + p.grow * k), x = p.x + p.sway * Math.sin(p.age * p.swf + p.ph), src = p._src || (p._src = (p.rgb && p.kind !== 'rock' && p.kind !== 'petal' && p.kind !== 'tshard' ? tinted(img, p.kind, p.rgb, p.ta) : img));
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1);
      g.save(); g.translate(x, p.y); if (p.rot) g.rotate(p.rot); g.drawImage(src, p.cell * sh[1], 0, sh[1], sh[2], -s / 2, -s / 2, s, s); g.restore();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function burst(run, x, y, n, o) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(o.v0, o.v1); sp(run, Object.assign({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * (o.sq || .8) + (o.up || 0), life: rnd(o.l0 || .7, o.l1 || 1.6), size: rnd(o.s0, o.s1), rot: rnd(0, TAU), vr: rnd(-6, 6) }, o.p || {}, o.pf ? o.pf(i) : {})); } }
  /* 별 가루/빛 알갱이 : 천천히 떠오르는 부드러운 반짝임 */
  function motes(run, x, y, n, rgb, S, spread, up) { for (let i = 0; i < n; i++) sp(run, { kind: 'spark', cell: pick([0, 1, 6, 7]), x: x + rnd(-1, 1) * spread, y: y + rnd(-.4, .4) * spread * .6, vx: rnd(-12, 12), vy: -rnd(up * .4, up), sway: rnd(6, 16), swf: rnd(1, 2.4), ph: rnd(0, 6), size: S * rnd(.012, .03), a: .9, life: rnd(1.8, 3.4), rgb, fadeIn: .25 }); }

  /* ====================================================================
   *  🌌 제갈량 — 팔진천기
   * ==================================================================== */
  const DIPPER = [[0, 0], [.2, .05], [.25, .24], [.04, .21], [-.16, .31], [-.36, .37], [-.55, .27]];
  function zhuge(R) {
    const tw = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random(), ph: rnd(0, 6), s: rnd(.4, 1) }));
    return {
      dur: 3.9, impactT: 2.4, shake: 0, zoom: .006, bloom: .8,
      start() { DIPPER.forEach((_, i) => tone('sine', 660 * Math.pow(1.122, i * 1.6), 660 * Math.pow(1.122, i * 1.6) * .98, .8, .05, .38 + i * .16)); },
      onImpact() { tone('sine', 196, 98, 1.8, .14); tone('triangle', 784, 784, 1.4, .06); noise(1.2, 'lowpass', 900, 120, .1); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, cx = M.camp.x0 + M.camp.w / 2, cy = M.camp.y0 + M.camp.h / 2;
        const night = smooth(kk(t, 0, .8)) * (1 - smooth(kk(t, 3.1, 3.9)));
        wash(g, M, '4,12,44', .4 * night); bokeh(g, M, t, '255,226,150', 14, .5 * night, 3);
        for (const s of tw) { const a = night * s.s * (.35 + .65 * Math.pow(Math.sin(t * 2.4 + s.ph) * .5 + .5, 1.5)); glow(g, 'glow_y', A.left + A.width * s.x, A.top + A.height * s.y, S * .035 * s.s + 5, a * .55); }
        const D = S * .62, pos = DIPPER.map(p => [tx + (p[0] + .1) * D, ty + (p[1] - .17) * D * .85]);
        /* 팔괘 링 (이중 역회전) */
        const rin = smooth(kk(t, 1.1, 1.95)), rout = 1 - smooth(kk(t, 3.1, 3.7)), contract = smooth(kk(t, 1.95, 2.4)), rz = S * (1.02 - contract * .78) * (1.2 - .2 * outCubic(kk(t, 1.1, 1.95))), ra = rin * rout;
        if (ra > .01) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .62); g.rotate(t * .5 * (1 + contract * 3)); g.globalAlpha = ra * .9; g.drawImage(IM.bagua, -rz / 2, -rz / 2, rz, rz); g.rotate(-t * 1.1 * (1 + contract * 3)); g.globalAlpha = ra * .45; g.drawImage(IM.bagua, -rz * .31, -rz * .31, rz * .62, rz * .62); g.restore(); }
        /* 팔문 금쇄 : 부드러운 빛 리본이 안으로 모임 */
        for (let i = 0; i < 8; i++) {
          const t0 = 1.55 + i * .08, q = smooth(kk(t, t0, t0 + .42)); if (q <= 0) continue;
          const fa = smooth(kk(t, t0, t0 + .15)) * (1 - smooth(kk(t, 2.3, 2.6))), a = i * TAU / 8, r0 = S * .5, r1 = r0 * (1 - .8 * q);
          ribbon(g, tx + Math.cos(a) * r1, ty + Math.sin(a) * r1 * .62, tx + Math.cos(a) * r0, ty + Math.sin(a) * r0 * .62, S * .05, '110,215,255', .8 * fa);
        }
        /* 북두칠성 */
        const fadeC = 1 - smooth(kk(t, 2.9, 3.6));
        for (let i = 0; i < 7; i++) {
          const ts = .32 + i * .15, q = kk(t, ts, ts + .45); if (q <= 0) continue; const [x, y] = pos[i], pop = outBack(q);
          const beam = (1 - smooth(kk(t, ts, ts + .6))) * .7; if (beam > .02) ribbon(g, x, y - S * .5, x, y, S * .07, '255,230,150', beam);
          spr(g, IM.starflare, x, y, S * .17 * pop, S * .17 * pop, fadeC * .9, t * .35 + i); glow(g, 'glow_y', x, y, S * .18 * pop, .3 * fadeC);
          if (i > 0) { const lq = smooth(kk(t, ts, ts + .4)), [px, py] = pos[i - 1]; ribbon(g, px, py, px + (x - px) * lq, py + (y - py) * lq, S * .028, '255,214,110', .85 * fadeC); }
          if (q < 1 && Math.random() < .5) motes(R.run, x, y, 1, '255,226,150', S, S * .01, 50);
        }
        /* 충격: 태극 + 별빛 기둥 */
        if (t >= this.impactT - .02) {
          const q = Math.max(0, t - this.impactT), qa = 1 - smooth(kk(q, .5, 1.3));
          for (let i = 0; i < 7; i++) ribbon(g, pos[i][0], pos[i][1], tx, ty, S * .03, '255,225,140', (1 - smooth(kk(q, 0, .6))) * .85);
          const cw = S * (.2 * (1 - smooth(kk(q, .3, 1.2))) + .04); ribbon(g, tx, A.top - S * .1, tx, ty, cw, '255,238,180', .42 * qa); ribbon(g, tx, A.top - S * .1, tx, ty, cw * .3, '255,255,255', .45 * qa);
          const ts = S * .46 * (.3 + outBack(q / .45) * .8) * (1 - smooth(kk(q, .8, 1.4)) * .35); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .82); g.rotate(q * 4); g.globalAlpha = .5 * (1 - smooth(kk(q, .8, 1.4))); g.drawImage(IM.taiji, -ts / 2, -ts / 2, ts, ts); g.restore();
          softFlash(g, tx, ty, S * 1.5, '255,226,150', (1 - smooth(kk(q, 0, .8))) * .35); glow(g, 'glow_b', tx, ty, S * .9, (1 - smooth(kk(q, 0, 1))) * .25);
          shockSprite(g, 'shock_y', tx, ty, S * 1.35, q / 1.0, .6 * (1 - q * .4), .6); shockSprite(g, 'shock_b', tx, ty, S * .95, (q - .15) / 1.0, .5, .6);
          ring(g, tx, ty, S * .62 * outCubic(kk(q, 0, .9)), 2, '255,226,150', (1 - smooth(kk(q, .3, .9))) * .7, .6);
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; motes(R.run, tx, ty, 48, '255,226,150', S, S * .35, 150); burst(R.run, tx, ty, 26, { v0: 60, v1: 300, s0: S * .014, s1: S * .032, up: -120, l0: 1.2, l1: 2.4, p: { kind: 'spark', rgb: '255,226,140', ay: 50, fadeIn: .1 }, pf: i => ({ cell: [3, 4, 5, 0][i % 4] }) }); }
        if (t > this.impactT && t < 3.3 && Math.random() < .6) motes(R.run, tx, ty, 1, '255,226,150', S, S * .4, 120);
      }
    };
  }

  /* ====================================================================
   *  🌊 손권 — 파천노도
   * ==================================================================== */
  function sunquan(R) {
    const dir = R.dir, ships = [0, 1, 2].map(i => ({ u: (i + .5) / 3, ph: rnd(0, 6) }));
    return {
      dur: 3.9, impactT: 1.5, shake: .006, zoom: .014, bloom: .7,
      start() { noise(1.1, 'bandpass', 300, 1800, .1, .05); [0, 1, 2].forEach(i => noise(.3, 'highpass', 2500, 800, .08, .18 + i * .2)); noise(1.6, 'lowpass', 500, 100, .14, 1.0); },
      onImpact() { tone('sine', 90, 40, 1.4, .18); noise(1.3, 'lowpass', 1200, 200, .18); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, C = M.camp, out = 1 - smooth(kk(t, 3.1, 3.9));
        wash(g, M, '6,52,74', .3 * smooth(kk(t, 0, .6)) * out); bokeh(g, M, t, '170,235,255', 12, .45 * smooth(kk(t, 0, .6)) * out, 7);
        R.drawTears(g, t);
        for (let i = 0; i < 3; i++) { const e = R['tc' + i]; if (e && t < e.fade0) { const qq = smooth(kk(t, e.t0, e.t0 + e.grow)); if (Math.random() < .9) { const [px, py] = window.jgTear.pointAt(e.cut, Math.random() * qq); sp(R.run, { kind: 'foam', cell: (Math.random() * 4) | 0, x: px, y: py, vx: rnd(-40, 40), vy: -S * rnd(.12, .5), ay: S * 1.4, size: S * rnd(.04, .1), a: .85, life: rnd(.5, 1.1), rgb: '215,246,255', rot: rnd(0, TAU), vr: rnd(-3, 3) }); } } }
        /* 초승달 수압검기 3연참 + 물방울 꼬리 */
        for (let i = 0; i < 3; i++) {
          const t0 = .12 + i * .2, q = kk(t, t0, t0 + .6); if (q <= 0 || q >= 1) continue;
          const yy = ty + (i - 1) * S * .11, x0 = dir > 0 ? A.left - S * .3 : A.left + A.width + S * .3, x1 = dir > 0 ? A.left + A.width + S * .3 : A.left - S * .3, x = x0 + (x1 - x0) * outCubic(q), w = S * .64, h = w * .5, fa = smooth(kk(q, 0, .12)) * (1 - smooth(kk(q, .8, 1)));
          ribbon(g, x - dir * S * .5, yy, x, yy, S * .06, '140,225,255', .55 * fa);
          for (let tr = 4; tr >= 0; tr--) { const xt = x - dir * tr * S * .05; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(xt, yy); g.rotate(dir > 0 ? .16 * (i - 1) : Math.PI - .16 * (i - 1)); g.globalAlpha = fa * (1 - tr * .2); g.drawImage(IM.crescent, -w / 2, -h / 2, w, h); g.restore(); }
          if (Math.random() < .8) sp(R.run, { kind: 'foam', cell: (Math.random() * 4) | 0, x: x - dir * rnd(0, S * .2), y: yy + rnd(-.1, .1) * S, vx: -dir * rnd(20, 90), vy: rnd(-60, 20), ay: 220, size: S * rnd(.05, .1), a: .7, life: rnd(.7, 1.2), rgb: '200,240,255', rot: rnd(0, TAU), vr: rnd(-2, 2) });
          if (!R['cs' + i] && Math.abs(x - tx) < S * .12) { R['cs' + i] = 1; R['cl' + i] = t; R['tc' + i] = R.tear({ x: C.x0 + C.w / 2, y: yy, ang: dir > 0 ? 0 : Math.PI, len: C.w * 1.04, gap: S * .03, mode: 'full', seed: 70 + i, rgb: '110,225,255' }, { t0: t, grow: .4, fade0: 2.9, fade1: 3.6 }, M); R.shards(tx, yy, 6, S, null); burst(R.run, tx, yy, 14, { v0: 80, v1: 340, s0: S * .014, s1: S * .03, up: -80, p: { kind: 'spark', rgb: '170,230,255', ay: 520 }, pf: j => ({ cell: [3, 4, 5, 0][j % 4] }) }); noise(.2, 'highpass', 3000, 1500, .08); }
        }
        for (let i = 0; i < 3; i++) { const ct = R['cl' + i]; if (ct != null) { const q = (t - ct) / 1.0; if (q < 1) ribbon(g, C.x0, ty + (i - 1) * S * .11, C.x0 + C.w, ty + (i - 1) * S * .11, S * .03, '170,235,255', (1 - smooth(q)) * .8); } }
        /* 장강 해일 (3겹) */
        const wq = kk(t, .95, 2.4), ew = outCubic(wq), front = dir > 0 ? C.x0 - S * .15 + (C.w + S * .45) * ew : C.x0 + C.w + S * .15 - (C.w + S * .45) * ew;
        const drain = smooth(kk(t, 2.5, 3.7)), wetA = 1 - drain;
        if (wq > 0) {
          g.save(); g.beginPath(); g.rect(C.x0 - 6, C.y0 - 6, C.w + 12, C.h + 12); g.clip();
          const cover = dir > 0 ? [C.x0, front] : [front, C.x0 + C.w], wx = Math.min(cover[0], cover[1]), ww = Math.abs(cover[1] - cover[0]);
          const gr = g.createLinearGradient(dir > 0 ? C.x0 : C.x0 + C.w, 0, front, 0); gr.addColorStop(0, `rgba(20,110,150,${.12 * wetA})`); gr.addColorStop(.7, `rgba(30,150,190,${.22 * wetA})`); gr.addColorStop(1, `rgba(140,225,245,${.3 * wetA})`);
          g.fillStyle = gr; { const NS = 14, fx0 = dir > 0 ? C.x0 : front; for (let si = 0; si < NS; si++) { g.globalAlpha = .25 + .75 * Math.pow(Math.sin(Math.PI * (si + .5) / NS), .8); g.fillRect(fx0, C.y0 + C.h * si / NS, ww, C.h / NS + 1); } g.globalAlpha = 1; }
          g.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 12; i++) { const yy = C.y0 + C.h * (i + .5) / 12; g.strokeStyle = `rgba(200,248,255,${.2 * wetA * (.5 + .5 * Math.sin(t * 3 + i))})`; g.lineWidth = 1.4; g.beginPath(); for (let x = wx; x <= wx + ww; x += 8) { const y2 = yy + Math.sin(x * .045 + t * 3.6 + i * 1.3) * 5 + Math.sin(x * .11 - t * 2 + i) * 2; x === wx ? g.moveTo(x, y2) : g.lineTo(x, y2); } g.stroke(); }
          g.globalCompositeOperation = 'source-over';
          if (wq < 1) {
            const dh = C.h * 1.35, dd = S * .44;
            [[.0, .9], [.12, .5], [.24, .28]].forEach(([off, al]) => { g.save(); g.translate(front - dir * S * off, C.y0 + C.h / 2); g.rotate(dir > 0 ? Math.PI / 2 : -Math.PI / 2); g.globalAlpha = al * smooth(kk(wq, 0, .12)); g.drawImage(IM.wave, -dh / 2, -dd * .35, dh, dd); g.restore(); });
            ships.forEach(sh => { const sy = C.y0 + C.h * sh.u, bob = Math.sin(t * 5 + sh.ph) * S * .012, sz = S * .17; g.save(); g.translate(front - dir * S * .1, sy + bob); g.rotate(Math.sin(t * 4 + sh.ph) * .12); if (dir < 0) g.scale(-1, 1); g.globalAlpha = .92 * smooth(kk(wq, 0, .1)); g.drawImage(IM.ship, -sz / 2, -sz * .75 / 2, sz, sz * .75); g.restore(); });
            for (let i = 0; i < 4; i++) sp(R.run, { kind: 'foam', cell: (Math.random() * 4) | 0, x: front - dir * rnd(0, S * .08), y: rnd(C.y0, C.y0 + C.h), vx: dir * rnd(60, 220), vy: -rnd(40, 200), ay: 500, size: S * rnd(.04, .1), a: .8, life: rnd(.6, 1.1), rgb: '215,246,255', rot: rnd(0, TAU), vr: rnd(-3, 3) });
          }
          /* 안개 */
          if (ok(IM.e_cloud)) for (let i = 0; i < 4; i++) { g.globalAlpha = .13 * wetA * smooth(kk(wq, .2, .8)); g.drawImage(tinted(IM.e_cloud, 'cl', '190,240,250', .9), (i % 4) * 256, 0, 256, 256, wx + ww * (i / 4) - S * .15 + Math.sin(t * .5 + i) * S * .05, C.y0 + C.h * (.15 + .2 * i) - S * .1, S * .5, S * .4); }
          g.restore();
        }
        if (t >= this.impactT - .02) {
          const q = Math.max(0, t - this.impactT);
          shockSprite(g, 'shock_b', tx, ty, S * 1.25, q / 1.1, .9 * (1 - q * .3), .55); shockSprite(g, 'shock_g', tx, ty, S * .9, (q - .2) / 1.1, .6, .55);
          softFlash(g, tx, ty, S * 1.3, '170,235,255', (1 - smooth(kk(q, 0, .8))) * .55); glow(g, 'glow_b', tx, ty, S * .8, (1 - smooth(kk(q, 0, .8))) * .45);
          for (let i = 0; i < 3; i++) { const rq = kk(q, .25 + i * .3, 1.4 + i * .3); if (rq > 0 && rq < 1) ring(g, tx, ty, S * (.1 + .42 * outCubic(rq)), 2.2, '190,242,255', (1 - rq) * .7 * wetA, .55); }
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; burst(R.run, tx, ty, 44, { v0: 90, v1: 460, s0: S * .014, s1: S * .034, up: -420, sq: 1, l0: .9, l1: 1.9, p: { kind: 'spark', rgb: '190,240,255', ay: 780 }, pf: j => ({ cell: [0, 1, 2, 6, 7][j % 5] }) }); burst(R.run, tx, ty, 18, { v0: 60, v1: 340, s0: S * .06, s1: S * .14, up: -380, sq: 1, l0: .9, l1: 1.8, p: { kind: 'foam', rgb: '220,248,255', ay: 700, a: .85 }, pf: j => ({ cell: j % 4 }) }); burst(R.run, tx, ty, 8, { v0: 30, v1: 120, s0: S * .14, s1: S * .26, l0: 1.6, l1: 2.4, up: -60, p: { kind: 'cloud', rgb: '215,245,255', add: false, a: .4, grow: .8 }, pf: j => ({ cell: j % 4 }) }); }
      }
    };
  }

  /* ====================================================================
   *  ⚡ 조조 — 패왕난무
   * ==================================================================== */
  function caocao(R) {
    const base = R.rn() * Math.PI, cl = [0, 1, 2].map(i => ({ a: base + i * TAU / 3 })), zaps = [];
    const SL = Array.from({ length: 6 }, (_, n) => ({ t0: .62 + n * .14, a: base + n * Math.PI / 6 + Math.PI / 12, v: n % 4, c: n % 3 }));
    return {
      dur: 3.3, impactT: 1.62, shake: .01, zoom: .016, bloom: .75,
      start() { SL.forEach(s => noise(.14, 'highpass', 4500, 1800, .12, s.t0 - .02)); },
      onImpact() { noise(1.4, 'lowpass', 1500, 120, .2); tone('sawtooth', 120, 40, 1, .1); tone('square', 1800, 300, .18, .04); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, dark = smooth(kk(t, 0, .45)) * (1 - smooth(kk(t, 2.7, 3.3)));
        wash(g, M, '16,0,14', .42 * dark); vig(g, M, '160,12,24', .5 * dark); bokeh(g, M, t, '255,120,90', 10, .35 * dark, 11);
        if (ok(IM.e_cloud)) for (let i = 0; i < 4; i++) { g.globalAlpha = .16 * dark; g.drawImage(tinted(IM.e_cloud, 'cl', '150,20,40', .9), (i % 4) * 256, 0, 256, 256, A.left + A.width * (((i * .31 + t * .02) % 1.3) - .15) - S * .3, ty - S * .5 + (i - 1.5) * S * .22, S * .6, S * .45); }
        /* 분신 */
        R.drawTears(g, t);
        cl.forEach((c, i) => {
          const appear = smooth(kk(t, .14 + i * .08, .6)), out = 1 - smooth(kk(t, 1.5, 1.95)); if (appear <= 0) return;
          const cur = SL.filter(s => s.c === i && t >= s.t0 - .03), last = cur[cur.length - 1]; let x = tx + Math.cos(c.a) * S * .37, y = ty + Math.sin(c.a) * S * .37 * .8; const a = appear * out, sz = S * .34;
          if (last) { const q = kk(t, last.t0 - .03, last.t0 + .1); const ex = tx - Math.cos(last.a) * S * .42, ey = ty - Math.sin(last.a) * S * .34, sx = tx + Math.cos(last.a) * S * .42, sy = ty + Math.sin(last.a) * S * .34; x = sx + (ex - sx) * smooth(q); y = sy + (ey - sy) * smooth(q);
            for (let tr = 5; tr >= 1; tr--) { const qq = clamp(q - tr * .1, 0, 1), xx = sx + (ex - sx) * smooth(qq), yy = sy + (ey - sy) * smooth(qq); g.save(); g.globalCompositeOperation = 'lighter'; cell(g, IM.cloak, 192, 320, last.c, xx, yy, sz, a * (.36 - tr * .05), 0); g.restore(); } }
          cell(g, IM.cloak, 192, 320, i, x, y, sz, a, 0); glow(g, 'glow_o', x, y - sz * .1, sz * 1.0, a * .38);
        });
        /* 6연 참격 : 붉은 잔상 + 금빛 날 */
        SL.forEach((s, n) => {
          const q = t - s.t0; if (q < 0) return;
          if (!s._f) { s._f = 1; R.kick(S * .01); R.tear({ x: tx, y: ty, ang: s.a, len: S * 1.0, gap: S * .032, mode: 'full', seed: 200 + n, rgb: '120,170,255' }, { t0: s.t0, grow: .16, fade0: 2.6, fade1: 3.3 }, M); R.shards(tx, ty, 7, S, s.a, 1.0); for (let z = 0; z < 4; z++) zaps.push({ a: s.a + rnd(-.9, .9) + (z % 2 ? Math.PI : 0), L: S * rnd(.28, .55), t0: s.t0, f: (Math.random() * 6) | 0 }); burst(R.run, tx, ty, 14, { v0: 120, v1: 540, s0: S * .012, s1: S * .026, up: -60, p: { kind: 'spark', rgb: pick(['255,200,90', '255,100,60']), ay: 380 }, pf: j => ({ cell: [3, 4, 5][j % 3] }) }); }
          const L = S * 1.0, h = L * .16, hold = 1 - smooth(kk(t, 1.65, 2.5)), grow = outQuint(kk(q, 0, .12)), a = (q < .5 ? 1 : .75) * hold;
          g.save(); g.translate(tx, ty); g.rotate(s.a); g.globalCompositeOperation = 'lighter';
          g.globalAlpha = a * .7; g.drawImage(tinted(IM.slash, 'sl', '255,60,55', .6), 0, s.v * 128, 512, 128, -L * grow / 2, -h / 2, L * grow, h);
          g.globalAlpha = a * .16; g.drawImage(IM.slash, 0, s.v * 128, 512, 128, -L * grow / 2 * 1.04, -h * .35, L * grow * 1.04, h * .7); g.restore();
          ribbon(g, tx - Math.cos(s.a) * L * .5 * grow, ty - Math.sin(s.a) * L * .5 * grow, tx + Math.cos(s.a) * L * .5 * grow, ty + Math.sin(s.a) * L * .5 * grow, S * .024, '255,214,120', a * (1 - smooth(kk(q, 0, .9))) * .55);
          if (q < .16) softFlash(g, tx, ty, S * 1.0, '255,150,110', (1 - q / .16) * .2);
        });
        for (const z of zaps) { const zq = kk(t - z.t0, 0, .34); if (zq <= 0 || zq >= 1) continue; const f = (z.f + (((t - z.t0) / .05) | 0)) % 6, L = z.L * (.5 + .5 * outCubic(zq * 2)); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.rotate(z.a - Math.PI / 2); g.globalAlpha = (1 - smooth(zq)) * (.45 + .45 * Math.abs(Math.sin(t * 60 + z.a))); g.drawImage(IM.bolt_b, f * 256, 0, 256, 512, -L * .24, 0, L * .48, L); g.restore(); }
        /* 암청 뇌전망 + 3줄기 낙뢰 */
        if (t >= this.impactT - .02) {
          const q = Math.max(0, t - this.impactT), grow = outCubic(kk(q, 0, .3)), sz = S * 1.25 * grow, fa = 1 - smooth(kk(q, .9, 1.6));
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.rotate(.3); g.globalAlpha = fa * (.62 + .18 * Math.sin(q * 50)); g.drawImage(IM.net, -sz / 2, -sz / 2, sz, sz); g.restore();
          softFlash(g, tx, ty, S * 1.6, '120,150,255', (1 - smooth(kk(q, 0, .8))) * .35); softFlash(g, tx, ty, S * .9, '255,170,100', (1 - smooth(kk(q, 0, .6))) * .3);
          shockSprite(g, 'shock_o', tx, ty, S * 1.2, q / .9, .55 * (1 - q * .4), .6); shockSprite(g, 'shock_b', tx, ty, S * 1.6, (q - .1) / 1.0, .45, .55);
          [-1, 0, 1].forEach((d, i) => { const bq = kk(q, i * .05, i * .05 + .55); if (bq <= 0 || bq >= 1) return; const f = ((q / .05) | 0) % 6, h = ty - A.top + S * .2, w = h * .5; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .75 * (.5 + .5 * Math.abs(Math.sin(q * 55 + i))) * (1 - smooth(bq)); g.translate(tx + d * S * .07, ty); g.drawImage(IM.bolt_y, f * 256, 0, 256, 512, -w / 2, -h, w, h); g.restore(); });
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; motes(R.run, tx, ty, 30, '255,120,80', S, S * .3, 120); }
      }
    };
  }

  /* ====================================================================
   *  🌸 유비 — 도원쌍검
   * ==================================================================== */
  function liubei(R) {
    const sw = Array.from({ length: 70 }, () => ({ r0: rnd(.45, 1.15), a0: rnd(0, TAU), w: rnd(1.4, 2.8), c: (Math.random() * 5) | 0, s: rnd(.5, 1), ph: rnd(0, 6) }));
    const trail = [[], []], flowers = Array.from({ length: 12 }, (_, i) => ({ a: i * TAU / 12 + rnd(-.15, .15), r: rnd(.14, .34), s: rnd(.6, 1.1), t: .06 * i }));
    return {
      dur: 3.9, impactT: 1.6, shake: .004, zoom: .01, bloom: .85,
      start() { [0, 1].forEach(i => tone('sine', i ? 880 : 660, i ? 860 : 650, 1.1, .06, .5 + i * .06)); noise(.9, 'bandpass', 800, 3000, .05, .5); },
      onImpact() { tone('sine', 523, 520, 1.8, .12); tone('sine', 784, 780, 1.8, .09, .04); tone('triangle', 1046, 1040, 1.4, .05, .08); noise(.6, 'highpass', 3000, 1500, .06); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, C = M.camp, fade = 1 - smooth(kk(t, 3.1, 3.9)), inn = smooth(kk(t, 0, .7));
        wash(g, M, '255,170,205', .2 * inn * fade); bokeh(g, M, t, '255,190,215', 16, .6 * inn * fade, 5); bokeh(g, M, t + 3, '255,226,150', 8, .4 * inn * fade, 17);
        R.drawTears(g, t);
        /* 꽃잎 소용돌이 */
        const sq = kk(t, .05, 1.6);
        sw.forEach(p => { const r = p.r0 * S * (1 - smooth(sq)), a = p.a0 + t * p.w * (1 + sq * 1.6), x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r * .75 - Math.sin(sq * Math.PI) * S * .05, al = smooth(kk(t, 0, .35)) * (1 - smooth(kk(sq, .8, 1))); if (al <= .01 || r < 2) return; glow(g, 'glow_y', x, y, S * .06 * p.s, al * .2); cell(g, IM.petal, 64, 64, p.c, x, y, S * .05 * p.s, .95 * al, a * 2 + p.ph); });
        /* 쌍검 이중 나선 */
        const dq = kk(t, .4, 1.6), land = t >= 1.6;
        [0, 1].forEach(j => {
          const rad = S * .14 * (1 - smooth(kk(dq, .75, 1))), ang = j * Math.PI + t * 8.5, h0 = Math.min(S * .75, ty - A.top + S * .8), x = tx + Math.cos(ang) * rad, y0 = ty - (1 - inCubic(dq)) * h0 - S * .02, y = y0 + Math.sin(ang) * rad * .35;
          if (!land) { trail[j].push([x, y]); if (trail[j].length > 26) trail[j].shift(); }
          const rgb = j ? '255,215,90' : '60,240,170', tf = land ? Math.max(0, 1 - (t - 1.6) * 2) : 1;
          for (let i = 1; i < trail[j].length; i++) { const a = trail[j][i - 1], b = trail[j][i], al = (i / trail[j].length) * tf; ribbon(g, a[0], a[1], b[0], b[1], S * .04 * (i / trail[j].length) + 2, rgb, al * .8); }
          const sh = S * (land ? .27 : .46), gx = land ? tx + (j ? 1 : -1) * S * .035 : x, gy = land ? ty - sh * .42 : y - sh * .46, al = land ? (1 - smooth(kk(t, 2.7, 3.3))) : smooth(kk(t, .4, .75));
          glow(g, j ? 'glow_y' : 'glow_g', gx, gy + sh * .35, sh * .55, al * .55);
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(gx, gy); g.globalAlpha = al; g.drawImage(IM.sword, j * 96, 0, 96, 512, -sh * .09, -sh / 2, sh * .18, sh); g.restore();
        });
        /* 착지 */
        if (land && !this._tr) { this._tr = 1; R.tear({ x: tx, y: ty, ang: -.62, len: S * .95, gap: S * .034, mode: 'full', seed: 31, rgb: '90,255,190' }, { t0: 1.6, grow: .32, fade0: 3.0, fade1: 3.7 }, M); R.tear({ x: tx, y: ty, ang: .62, len: S * .95, gap: S * .034, mode: 'full', seed: 32, rgb: '255,220,120' }, { t0: 1.66, grow: .32, fade0: 3.0, fade1: 3.7 }, M); R.shards(tx, ty, 14, S, null); }
        if (t >= this.impactT - .02) {
          const q = Math.max(0, t - this.impactT), qa = 1 - smooth(kk(q, .4, 1.5));
          [['60,240,170', -1], ['255,215,90', 1]].forEach(([rgb, s]) => { ribbon(g, tx + s * S * .035, ty - S * .95, tx + s * S * .035, ty, S * .11, rgb, .75 * qa); ribbon(g, tx + s * S * .035, ty - S * .95, tx + s * S * .035, ty, S * .035, '255,255,255', .6 * qa); });
          softFlash(g, tx, ty, S * 1.5, '255,190,215', (1 - smooth(kk(q, 0, 1.0))) * .5); softFlash(g, tx, ty, S * .9, '255,226,150', (1 - smooth(kk(q, 0, .8))) * .45);
          ['255,150,190', '255,215,110', '70,240,170'].forEach((rgb, i) => { const rq = kk(q, i * .15, i * .15 + 1.1); if (rq > 0 && rq < 1) ring(g, tx, ty, S * (.1 + .52 * outCubic(rq)), 3 - i * .5, rgb, (1 - rq) * .95, .62); });
          flowers.forEach(f => { const fq = kk(q, f.t * .6, f.t * .6 + .6), out = 1 - smooth(kk(t, 3.0, 3.8)); if (fq <= 0) return; const e = outCubic(fq), x = tx + Math.cos(f.a) * S * f.r * 1.6 * (.4 + e * .6), y = ty + Math.sin(f.a) * S * f.r * 1.6 * .72 * (.4 + e * .6); glow(g, 'glow_y', x, y, S * .15, .3 * out * e); cell(g, IM.petal, 64, 64, 5, x, y, S * .1 * outBack(fq) * f.s, out, f.a + q * .3); });
          if (t < 3.1) for (let i = 0; i < 2; i++) if (Math.random() < .9) sp(R.run, { kind: 'petal', cell: (Math.random() * 5) | 0, x: rnd(C.x0, C.x0 + C.w), y: C.y0 - S * .05, vx: rnd(-10, 22), vy: rnd(60, 120), sway: rnd(22, 46), swf: rnd(1.2, 2.2), ph: rnd(0, 6), vr: rnd(-3, 3), rot: rnd(0, TAU), size: S * rnd(.04, .075), life: rnd(2.4, 3.6), add: false, a: .95 });
        }
        stepPT(R.run, g, dt);
        if (land && !this._d) { this._d = 1; burst(R.run, tx, ty, 62, { v0: 80, v1: 420, s0: S * .04, s1: S * .075, up: -120, l0: 1.4, l1: 2.8, p: { kind: 'petal', add: false, ay: 90, sway: 16, swf: 4, drag: .985 }, pf: () => ({ cell: (Math.random() * 5) | 0 }) }); motes(R.run, tx, ty, 46, '255,226,150', S, S * .3, 110); }
      }
    };
  }

  /* ====================================================================
   *  🔱 여포 — 방천귀신격
   * ==================================================================== */
  function lvbu(R) {
    const side = R.dir, rocks = Array.from({ length: 22 }, () => ({ a: rnd(0, TAU), v: rnd(.3, 1.0), s: rnd(.03, .075), c: (Math.random() * 4) | 0, vr: rnd(-8, 8), up: rnd(.4, 1.2) })), fr = rnd(0, TAU);
    return {
      dur: 3.7, impactT: 1.35, shake: .026, zoom: .03, bloom: .6, slow: [.14, .3],
      start() { tone('sawtooth', 60, 48, 1, .07); noise(.8, 'bandpass', 200, 1400, .09, .55); },
      onImpact() { tone('sine', 78, 28, 1.6, .32); noise(1.5, 'lowpass', 900, 60, .28); tone('square', 220, 40, .6, .09); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, out = 1 - smooth(kk(t, 3.1, 3.7)), pul = .85 + .15 * Math.sin(t * 8), om = smooth(kk(t, 0, .6));
        wash(g, M, '28,0,16', .44 * om * out); vig(g, M, '200,12,44', .42 * pul * om * out); bokeh(g, M, t, '255,90,120', 8, .3 * om * out, 21);
        R.drawTears(g, t);
        /* 귀신 기운 오라 + 먹구름 */
        const aq = smooth(kk(t, .15, 1.3)) * (t < this.impactT ? 1 : 1 - smooth(kk(t, this.impactT, this.impactT + .8)) * .6);
        if (aq > .01 && ok(IM.aura)) { const az = S * (.5 + .55 * aq); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .8); g.rotate(t * 1.1); g.globalAlpha = aq * .75 * out; g.drawImage(IM.aura, -az / 2, -az / 2, az, az); if (!LOWQ()) { g.rotate(-t * 2); g.globalAlpha = aq * .45 * out; g.drawImage(IM.aura, -az * .35, -az * .35, az * .7, az * .7); } g.restore(); }
        for (let i = 0, nc = LOWQ() ? 3 : 5; i < nc; i++) { const a = t * .9 + i * TAU / nc, r = S * (.34 + .06 * Math.sin(t * 2 + i)) * (1 - .3 * kk(t, .6, 1.3)); if (ok(IM.e_cloud)) { g.globalAlpha = .46 * om * out; g.drawImage(tinted(IM.e_cloud, 'cl', '70,8,40', .95), (i % 4) * 256, 0, 256, 256, tx + Math.cos(a) * r - S * .28, ty + Math.sin(a) * r * .7 - S * .55 - S * .28, S * .56, S * .56); } }
        if (t < 1.35 && Math.random() < .3) { const f = (Math.random() * 6) | 0, h = S * rnd(.4, .8), w = h * .5, x = tx + rnd(-.5, .5) * S; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .45; g.drawImage(IM.bolt_p, f * 256, 0, 256, 512, x - w / 2, ty - S * .9, w, h); g.restore(); }
        /* 적토마 질주 속도선 */
        const sk = kk(t, .35, 1.05); if (sk > 0 && sk < 1) for (let i = 0, ns = LOWQ() ? 4 : 9; i < ns; i++) { const yy = ty + (i - 4) * S * .06 + Math.sin(i * 7) * S * .02, x1 = A.left + A.width * (1.1 - smooth(sk) * 1.3 + i * .02), L = S * (.5 + (i % 3) * .2); ribbon(g, x1, yy, x1 + L * side * -1, yy + (i - 4) * 2, S * .012 + 2, '255,70,90', Math.sin(sk * Math.PI) * .6); }
        /* 방천화극 강하 */
        const hq = kk(t, .55, 1.35), hs = { x: tx - side * S * .55, y: Math.max(A.top - S * .8, ty - S * 1.0) }, hp = inCubic(hq), hx = hs.x + (tx - hs.x) * hp, hy = hs.y + (ty - hs.y) * hp, dang = Math.atan2(ty - hs.y, tx - hs.x), HL = S * .95;
        const planted = t >= this.impactT, ha = planted ? (1 - smooth(kk(t, 2.8, 3.4))) : smooth(kk(t, .5, .75));
        if (ha > .01) {
          if (!planted) { ribbon(g, hs.x, hs.y, hx, hy, S * .06, '255,70,100', .5 * hp * ha); for (let gh = LOWQ() ? 0 : 3; gh >= 1; gh--) { const q2 = clamp(hq - gh * .06, 0, 1), xx = hs.x + (tx - hs.x) * inCubic(q2), yy = hs.y + (ty - hs.y) * inCubic(q2); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(xx - Math.cos(dang) * HL * .5, yy - Math.sin(dang) * HL * .5); g.rotate(dang + Math.PI / 2); g.globalAlpha = ha * (.4 - gh * .08); g.drawImage(IM.halberd, -HL / 6, -HL / 2, HL / 3, HL); g.restore(); } }
          const px = planted ? tx : hx - Math.cos(dang) * HL * .5, py = planted ? ty - HL * .36 : hy - Math.sin(dang) * HL * .5;
          glow(g, 'glow_p', px, py + (planted ? HL * .25 : 0), HL * .6, ha * .45);
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(px, py); g.rotate(planted ? .1 : dang + Math.PI / 2); g.globalAlpha = ha; g.drawImage(IM.halberd, -HL / 6, -HL / 2, HL / 3, HL); g.restore();
        }
        /* 착탄 */
        if (t >= this.impactT - .02) {
          const q = Math.max(0, t - this.impactT), gr = smooth(kk(q, 0, .4));
          const cr = S * .34 * gr + 1, crat = g.createRadialGradient(tx, ty, 0, tx, ty, cr); crat.addColorStop(0, `rgba(6,0,6,${.9 * out})`); crat.addColorStop(.7, `rgba(40,4,26,${.65 * out})`); crat.addColorStop(1, 'rgba(40,4,26,0)'); g.save(); g.translate(tx, ty); g.scale(1, .8); g.translate(-tx, -ty); g.fillStyle = crat; g.beginPath(); g.arc(tx, ty, cr, 0, TAU); g.fill(); g.restore();
          const fs = S * (.4 + .9 * outQuint(kk(q, 0, .55))); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.rotate(fr); g.globalAlpha = smooth(kk(q, 0, .15)) * (.7 + .2 * Math.sin(q * 10)) * out * .5; g.drawImage(tinted(IM.fissure, 'fi', '200,30,120', .6), -fs / 2, -fs / 2, fs, fs); g.restore();
          softFlash(g, tx, ty, S * 1.7, '255,110,170', (1 - smooth(kk(q, 0, .8))) * .4); glow(g, 'glow_o', tx, ty, S * .5, (.3 + .2 * Math.sin(q * 10)) * out);
          shockSprite(g, 'shock_p', tx, ty, S * 1.5, q / 1.0, .6 * (1 - q * .35), .62); shockSprite(g, 'shock_o', tx, ty, S * 1.1, (q - .08) / 1.0, .5, .62); shockSprite(g, 'shock_y', tx, ty, S * 1.9, (q - .2) / 1.1, .28, .6);
          const az = S * (.5 + 1.0 * outCubic(kk(q, 0, .9))); if (ok(IM.aura)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .72); g.rotate(q * .8); g.globalAlpha = (1 - smooth(kk(q, .2, 1.1))) * .55; g.drawImage(IM.aura, -az / 2, -az / 2, az, az); g.restore(); }
          /* 불길 혀 */
          for (let i = 0, nf = LOWQ() ? 5 : 10; i < nf; i++) { const fa = fr + i * TAU / nf, fr2 = S * (.16 + .12 * hash(i, 3)), fx = tx + Math.cos(fa) * fr2, fy = ty + Math.sin(fa) * fr2 * .7, ft = kk(q, .08 + hash(i, 5) * .25, 2.2), fo = smooth(kk(ft, 0, .15)) * (1 - smooth(kk(ft, .6, 1))), fw = S * (.14 + .08 * hash(i, 8)), f = ((q * 13 + i * 3) | 0) % 8, im = IM[i % 2 ? 'flame_p' : 'flame_o']; if (fo > .01 && ok(im)) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = fo * .85; g.drawImage(im, (f % 4) * 128, ((f / 4) | 0) * 192, 128, 192, fx - fw / 2, fy + S * .02 - fw * 1.5, fw, fw * 1.5); g.restore(); } }
          for (let i = 0, nb = LOWQ() ? 4 : 8; i < nb; i++) { const bq = kk(q, i * .02, i * .02 + .6); if (bq <= 0 || bq >= 1) continue; const ang = i * TAU / 8 + fr, L = S * (.35 + outCubic(bq) * .5), f = ((q / .05 + i) | 0) % 6; g.save(); g.translate(tx, ty); g.rotate(ang - Math.PI / 2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .7 * (1 - smooth(bq)) * (.55 + .4 * Math.sin(q * 50 + i)); g.drawImage(IM.bolt_p, f * 256, 0, 256, 512, -L * .25, 0, L * .5, L); g.restore(); }
          if (q < 2 && Math.random() < .5) sp(R.run, { kind: 'spark', cell: pick([6, 7, 0]), x: tx + rnd(-1, 1) * S * .25, y: ty + rnd(-.5, .5) * S * .2, vy: -rnd(30, 110), vx: rnd(-20, 20), life: rnd(1.2, 2.4), size: S * rnd(.01, .024), rgb: pick(['255,70,100', '210,90,255']), fadeIn: .2 });
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1;
          for (let i = 0; i < 6; i++) R.tear({ x: tx, y: ty, ang: fr + i * TAU / 6 + (hash(i, 7) - .5) * .5, len: S * (.5 + .38 * hash(i, 9)), gap: S * (.034 + .02 * hash(i, 11)), mode: 'half', seed: 60 + i, rgb: '255,70,100' }, { t0: this.impactT, grow: .28, fade0: 2.9, fade1: 3.5 }, M);
          R.shards(tx, ty, 18, S, null);
          rocks.forEach(r => sp(R.run, { kind: 'rock', cell: r.c, x: tx, y: ty, vx: Math.cos(r.a) * S * r.v * 1.3, vy: Math.sin(r.a) * S * r.v * .9 - S * r.up * 1.1, ay: S * 2.6, rot: rnd(0, TAU), vr: r.vr, size: S * r.s, life: rnd(1.3, 2.2), add: false, a: 1, drag: .995 }));
          burst(R.run, tx, ty, 12, { v0: 100, v1: 420, s0: S * .22, s1: S * .4, l0: 1.8, l1: 2.8, sq: .5, p: { kind: 'cloud', rgb: '90,60,70', add: false, a: .5, grow: 1.1, drag: .96 }, pf: j => ({ cell: j % 4 }) });
          burst(R.run, tx, ty, 34, { v0: 150, v1: 640, s0: S * .014, s1: S * .034, up: -160, p: { kind: 'spark', ay: 600 }, pf: j => ({ cell: [3, 4, 5, 0][j % 4], rgb: j % 2 ? '255,80,110' : '215,110,255' }) }); }
      }
    };
  }

  /* ====================================================================
   *  🐺 사마의 — 낭고빙결
   * ==================================================================== */
  function simayi(R) {
    const flakes = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: rnd(.5, 1), v: rnd(.01, .03) })), cards = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    return {
      dur: 3.9, impactT: 2.35, shake: .008, zoom: .02, bloom: .8,
      start() { tone('sine', 55, 110, 2.4, .09); tone('sine', 58, 116, 2.4, .05, .05); noise(1, 'highpass', 5000, 3000, .035, 1.1); },
      onImpact() { tone('sine', 120, 30, 1.3, .26); noise(.6, 'lowpass', 2400, 200, .18); [0, 1, 2, 3].forEach(i => noise(.2, 'bandpass', 3200, 900, .11, .1 + i * .1)); [0, 1, 2].forEach(i => noise(.12, 'highpass', 6000, 3500, .07, .5 + i * .12)); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, C = M.camp, cx = C.x0 + C.w / 2, cy = C.y0 + C.h / 2, out = 1 - smooth(kk(t, 3.2, 3.9)), fz = smooth(kk(t, 0, .8));
        wash(g, M, '8,16,64', .38 * fz * out); bokeh(g, M, t, '150,200,255', 12, .45 * fz * out, 31);
        /* 서리 + 오로라 리본 */
        if (ok(IM.e_frost)) { g.save(); g.beginPath(); g.rect(A.left, A.top, A.width, A.height); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .15 * fz * out; const T = S * .9; for (let yy = A.top; yy < A.top + A.height; yy += T) for (let xx = A.left; xx < A.left + A.width; xx += T) g.drawImage(IM.e_frost, xx, yy, T + 1, T + 1); g.restore(); vig(g, M, '120,190,255', .5 * fz * out); }
        for (let i = 0; i < 3; i++) { const y0 = A.top + A.height * (.12 + i * .08), amp = S * .05; let px = A.left - 10, py = y0; for (let s = 1; s <= 14; s++) { const x = A.left + A.width * s / 14, y = y0 + Math.sin(s * .7 + t * (.6 + i * .2) + i * 2) * amp; ribbon(g, px, py, x, y, S * .09, i % 2 ? '120,150,255' : '110,230,255', .17 * fz * out); px = x; py = y; } }
        flakes.forEach(f => { f.y += f.v * dt * .4; if (f.y > 1) f.y = 0; cell(g, IM.e_snow, 64, 64, 4 + ((f.s * 3) | 0) % 4, A.left + A.width * f.x, A.top + A.height * f.y, S * .03 * f.s, .6 * fz * out, 0); });
        if (t < 1.3 && Math.random() < .35) { const side = Math.random() < .5 ? 0 : 1; sp(R.run, { kind: 'ice', cell: (Math.random() * 4) | 0, x: side ? A.left + A.width - S * rnd(.02, .08) : A.left + S * rnd(.02, .08), y: rnd(A.top, A.top + A.height), size: S * rnd(.05, .1), a: .8, life: rnd(1.8, 3), rgb: '150,215,255', ta: .55, rot: rnd(0, TAU), fadeIn: .5 }); }
        /* 늑대 영혼 : 옆을 보다가 뒤돌아봄 (유령 이중 이미지) */
        const turn = smooth(kk(t, 1.0, 1.32)), wa = smooth(kk(t, .45, .95)) * (1 - smooth(kk(t, 1.75, 2.25))), wsz = S * .85, wsx = .38 + .62 * outBack(turn);
        if (wa > .01) {
          glow(g, 'glow_b', cx, cy - S * .05, wsz * 1.4, wa * .4);
          [[1.12, .28], [1.0, .92]].forEach(([k, al]) => { g.save(); g.translate(cx, cy - S * .05); g.scale(Math.max(.05, wsx * k), k); g.globalAlpha = wa * al; g.drawImage(k > 1 ? tinted(IM.wolf, 'wf', '120,170,255', .7) : IM.wolf, -wsz / 2, -wsz / 2, wsz, wsz); g.restore(); });
          const ea = smooth(kk(turn, .2, .7)) * wa, flare = Math.max(0, 1 - Math.abs(t - 1.14) * 3.5);
          [-1, 1].forEach(s => { const ex = cx + s * wsz * .195 * wsx, ey = cy - S * .05 - wsz * .5 + wsz * .39; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(ex, ey); g.rotate(s * .35); g.globalAlpha = ea; const gr = g.createRadialGradient(0, 0, 0, 0, 0, wsz * .08); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(120,220,255,.95)'); gr.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, wsz * .09, wsz * .035, 0, 0, TAU); g.fill(); g.restore(); glow(g, 'glow_b', ex, ey, wsz * (.3 + .35 * flare), ea * (.5 + .5 * flare)); });
          if (flare > 0) softFlash(g, cx, cy - S * .15, S * 1.6, '140,200,255', flare * .3);
          if (Math.random() < .6) sp(R.run, { kind: 'spark', cell: pick([6, 7, 0]), x: cx + rnd(-1, 1) * wsz * .3, y: cy - S * .1 + rnd(-.3, .3) * wsz, vy: -rnd(20, 70), vx: rnd(-10, 10), size: S * rnd(.012, .028), rgb: '150,215,255', life: rnd(1.2, 2), fadeIn: .3 });
        }
        /* 조준 레티클 */
        const rq = kk(t, .85, 1.65); if (rq > 0 && t < 2.35) for (let i = 0; i < 3; i++) { const q = clamp(rq * 1.3 - i * .12, 0, 1), px = cx + (tx - cx) * smooth(q) + (1 - smooth(q)) * Math.sin(i * 2.1 + t * 3) * S * .25, py = cy + (ty - cy) * smooth(q) + (1 - smooth(q)) * Math.cos(i * 1.7 + t * 3) * S * .12, rr = S * (.05 + .05 * (1 - smooth(q))), ra = smooth(kk(rq, 0, .15)) * (1 - smooth(kk(t, 2.0, 2.35))); ring(g, px, py, rr, 1.6, '140,215,255', .8 * ra, 1); ribbon(g, px - rr * 1.8, py, px + rr * 1.8, py, S * .012 + 1, '170,225,255', .5 * ra); ribbon(g, px, py - rr * 1.8, px, py + rr * 1.8, S * .012 + 1, '170,225,255', .5 * ra); }
        /* 중력 소용돌이 + 암영 구체 */
        const gq = kk(t, 1.5, 2.35);
        if (gq > 0 && t < this.impactT + .35) { const gs = S * (1.3 - 1.0 * smooth(gq)), ga = smooth(gq) * (1 - smooth(kk(t, 2.35, 2.7))); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .8); g.rotate(-t * (3 + gq * 8)); g.globalAlpha = ga; g.drawImage(IM.gravity, -gs / 2, -gs / 2, gs, gs); g.restore();
          for (let i = 0; i < 4; i++) { const a0 = t * (3 + gq * 6) + i * TAU / 4, rr = S * (.5 - .3 * smooth(gq)); arcRibbon(g, tx, ty, rr, a0, a0 + .9, S * .03, '130,190,255', ga * .6, .8); }
          const dk = g.createRadialGradient(tx, ty, S * .05, tx, ty, S * 1.0 * (1 - .35 * gq)); dk.addColorStop(0, 'rgba(0,0,10,0)'); dk.addColorStop(1, `rgba(0,0,12,${.45 * smooth(gq)})`); (BG || g).fillStyle = dk; (BG || g).fillRect(A.left, A.top, A.width, A.height);
          const os = S * .26 * smooth(kk(t, 1.7, 2.35)); if (os > 1) { glow(g, 'glow_b', tx, ty, os * 2.2, .5 * ga); spr(g, IM.orb, tx, ty, os * 1.4, os * 1.4, 1, t * 3); }
          if (Math.random() < .85) { const a = rnd(0, TAU), rr = S * rnd(.3, .6); sp(R.run, { kind: 'spark', cell: pick([0, 1, 3]), x: tx + Math.cos(a) * rr, y: ty + Math.sin(a) * rr * .8, vx: -Math.cos(a) * rr * 1.9, vy: -Math.sin(a) * rr * 1.5, life: .55, size: S * rnd(.012, .026), rgb: '140,200,255' }); } }
        /* 내파 → 4방위 연쇄뇌전 + 빙정 */
        if (t >= this.impactT - .02) {
          const q = Math.max(0, t - this.impactT), fa = 1 - smooth(kk(q, 1.0, 1.55));
          for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + hash(i, 4) * .4, ln = S * (.16 + .12 * hash(i, 6)), gq = outCubic(kk(q, i * .018, .5 + hash(i, 8) * .2)), sz = S * (.1 + .08 * hash(i, 2)) * gq, ia = (1 - smooth(kk(q, 1.4, 2.0))) * .95; if (gq <= 0 || ia <= .01) continue; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx + Math.cos(a) * ln * gq, ty + Math.sin(a) * ln * gq * .72); g.rotate(a + Math.PI / 2); g.globalAlpha = ia; g.drawImage(tinted(IM.ice, 'sp', '150,215,255', .5), (i % 4) * 128, 0, 128, 128, -sz / 2, -sz, sz, sz * 1.4); g.restore(); }
          softFlash(g, tx, ty, S * 1.8, '180,215,255', (1 - smooth(kk(q, 0, .7))) * .6); glow(g, 'glow_b', tx, ty, S * 1.0, (1 - smooth(kk(q, 0, .6))) * .7);
          for (let i = 0; i < 4; i++) { const oq = outCubic(kk(q, .05, .45)), ox = tx + cards[i][0] * S * .38 * oq, oy = ty + cards[i][1] * S * .3 * oq;
            if (oq > 0) { const f = ((q / .05 + i) | 0) % 6, dx = ox - tx, dy = oy - ty, L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx); g.save(); g.translate(tx, ty); g.rotate(ang - Math.PI / 2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = fa * (.5 + .45 * Math.abs(Math.sin(q * 48 + i))); g.drawImage(IM.bolt_b, f * 256, 0, 256, 512, -L * .3, 0, L * .6, L); g.restore();
              spr(g, IM.orb, ox, oy, S * .12, S * .12, fa, q * 5); glow(g, 'glow_b', ox, oy, S * .3, fa * (.6 + .4 * Math.sin(q * 30 + i))); } }
          [.2, .36, .52].forEach((r, i) => ring(g, tx, ty, S * r * outCubic(kk(q, i * .06, .55 + i * .06)), 2.6, '120,170,255', (1 - smooth(kk(q, .5, 1.5))) * .8, .8));
          g.save(); g.beginPath(); g.arc(tx, ty, S * .55 * outCubic(kk(q, 0, .9)), 0, TAU); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .28 * (1 - smooth(kk(q, 1.0, 1.6))); if (ok(IM.e_frost)) { const T = S * .7; g.drawImage(IM.e_frost, tx - T / 2, ty - T / 2, T, T); } g.restore();
          shockSprite(g, 'shock_b', tx, ty, S * 1.4, q / 1.0, .85 * (1 - q * .4), .6);
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; burst(R.run, tx, ty, 30, { v0: 120, v1: 520, s0: S * .05, s1: S * .1, up: -120, l0: 1.3, l1: 2.4, p: { kind: 'ice', rgb: '150,215,255', ay: 420, drag: .985, ta: .6 }, pf: j => ({ cell: j % 4 }) }); motes(R.run, tx, ty, 30, '170,215,255', S, S * .3, 120); }
      }
    };
  }

  const BUILD = { zhuge, sunquan, caocao, liubei, lvbu, simayi };

  /* ---------- 실행 틀 (레이어 합성 · 블룸 · 슬로모션 · 줌 펀치) ---------- */
  function runCinematic(A, V, w, seed, opt) {
    opt = opt || {};
    const mk = BUILD[w.id]; if (!mk) return false;
    let sd = (seed || Date.now()) >>> 0; const rn = () => (sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296;
    const fx = .30 + rn() * .40, fy = .28 + rn() * .36, rot = (rn() - .5) * .35, dirR = rn() < .5 ? -1 : 1;
    const ov = document.createElement('canvas'); ov.id = 'jg_wlp6_cv'; ov.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9993;pointer-events:none;'; document.body.appendChild(ov);
    const g = ov.getContext('2d'), mkc = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d')]; };
    const [smA, sma] = mkc(), [smB, smb] = mkc();
    const run = newRun();
    let impactT = -1, fno = 0, shakeAmp = 0, punch = 0, ptime = 0, t = 0, last = performance.now(), impacted = false, done = false, slowLeft = 0, slowDur = 1, slowF = 1;
    const tearSnap = window.jgTear ? window.jgTear.snap() : null, tears = [];
    const R = { run, rn, dir: dirR, tx: 0, ty: 0, S: 1, M: () => metrics(V), kick(a) { shakeAmp = Math.max(shakeAmp, a); punch = Math.max(punch, .5); },
      /* 장기판 찢김 : spec(위치·각도·길이·틈·모드) , o(t0 시작 · grow 열리는 시간 · fade0/fade1 사라짐) */
      tear(spec, o, M) { if (!window.jgTear || W6.noTear) return null; if (window.jgPerf && window.jgPerf.q < .5 && tears.length >= 3) return null; try { const cut = window.jgTear.make(spec, M, tearSnap); const e = Object.assign({ cut, t0: 0, grow: .3, fade0: 9, fade1: 10, rgb: spec.rgb }, o); tears.push(e); return e; } catch (err) { return null; } },
      drawTears(g, t) { for (const e of tears) { const q = smooth(kk(t, e.t0, e.t0 + e.grow)), a = 1 - smooth(kk(t, e.fade0, e.fade1)); if (q > 0 && a > .004) window.jgTear.draw(g, e.cut, q, a, e.rgb, t); } },
      shards(x, y, n, S, ang, spread) { for (let i = 0; i < n; i++) { const a = (ang == null ? rnd(0, TAU) : ang + rnd(-1, 1) * (spread || 1.2)), v = S * rnd(.25, .9); sp(run, { kind: 'tshard', cell: (Math.random() * 4) | 0, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8 - S * rnd(.2, .6), ay: S * 2.2, rot: rnd(0, TAU), vr: rnd(-9, 9), size: S * rnd(.035, .08), life: rnd(.9, 1.7), add: false, a: 1, drag: .995 }); } } };
    const scene = mk(R), cvB = document.getElementById('cv'); if (window.jgPerf) window.jgPerf.cinemaOn();
    try { scene.start && scene.start(); } catch (e) {}
    const cleanup = () => { if (done) return; done = true; BG = null; if (window.jgPerf) window.jgPerf.cinemaOff(); try { ov.remove(); } catch (e) {} if (cvB) { cvB.style.transform = ''; cvB.style.transformOrigin = ''; } if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); };
    function frame(now) {
      if (done) return;
      const rdt = Math.min(.08, Math.max(.001, (now - last) / 1000)); last = now;
      const M = metrics(V), dpr = window.jgPerf ? window.jgPerf.dpr(1.25) : Math.min(window.devicePixelRatio || 1, 1.25), pw = Math.round(M.W * dpr), ph = Math.round(M.H * dpr);
      if (ov.width !== pw || ov.height !== ph) { ov.width = pw; ov.height = ph; }
      const a1 = Math.max(2, Math.round(pw / 5)), b1 = Math.max(2, Math.round(ph / 5)), a2 = Math.max(2, Math.round(pw / 14)), b2 = Math.max(2, Math.round(ph / 14));
      if (smA.width !== a1 || smA.height !== b1) { smA.width = a1; smA.height = b1; } if (smB.width !== a2 || smB.height !== b2) { smB.width = a2; smB.height = b2; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, M.W, M.H); BG = null;
      R.S = M.S; R.tx = M.br.left + M.br.width * fx; R.ty = M.br.top + M.br.height * (M.isTop ? (.14 + fy * .32) : (.54 + fy * .32));
      /* 시간: 슬로모션은 완만하게 돌아옴 */
      let ts = 1; if (slowLeft > 0) { ts = slowF + (1 - slowF) * smooth(1 - slowLeft / slowDur); slowLeft -= rdt; }
      let dt = rdt * ts; if (W6.debugT != null) { dt = .016; t = W6.debugT; } else t += dt;
      g.save(); g.beginPath(); g.rect(M.br.left, M.br.top - M.S * .9, M.br.width, M.br.height + M.S * .9); g.clip();
      try { scene.frame(g, t, dt, M); } catch (e) { console.warn('wlp6', e); }
      g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      /* 필살기 : 착탄 순간 만화식 폭발 별 + 이중 충격 링 */
      if (opt.ult && impactT >= 0 && ok(IM.ult_burst)) { const q = (t - impactT) / .8; if (q >= 0 && q < 1) { const sc = hexRGB(w.secondary || '#ffd54a'); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(R.tx, R.ty); g.rotate(q * .6); const z = M.S * (.5 + 1.5 * outQuint(q)); g.globalAlpha = (1 - smooth(q)) * .85; g.drawImage(tinted(IM.ult_burst, 'ub', sc, .7), -z / 2, -z / 2, z, z); g.restore(); ring(g, R.tx, R.ty, M.S * 1.0 * outQuint(q), 5, sc, (1 - q) * .9, .6); ring(g, R.tx, R.ty, M.S * .6 * outQuint(clamp(q * 1.3, 0, 1)), 3, '255,255,255', (1 - q) * .8, .6); } }
      /* 블룸(저해상도 확대 가산) : 같은 캔버스에서 바로 처리 */
      const bl = clamp((scene.bloom == null ? .6 : scene.bloom) * W6.bloom * (1 + punch * .25) * (opt.ult ? 1.25 : 1), 0, 1.2);
      if (bl > .01 && (!window.jgPerf || window.jgPerf.bloomOK())) {
        if ((fno++ & 1) === 0) { sma.imageSmoothingQuality = 'high'; sma.clearRect(0, 0, a1, b1); sma.drawImage(ov, 0, 0, a1, b1); smb.imageSmoothingQuality = 'high'; smb.clearRect(0, 0, a2, b2); smb.drawImage(smA, 0, 0, a2, b2); }
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
        g.globalAlpha = clamp(bl, 0, 1); g.drawImage(smA, 0, 0, pw, ph); g.globalAlpha = clamp(bl * .85, 0, 1); g.drawImage(smB, 0, 0, pw, ph); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (!impacted && t >= scene.impactT) {
        impacted = true; impactT = t; try { scene.onImpact && scene.onImpact(); } catch (e) {}
        try { if (typeof window.hitCamp === 'function') window.hitCamp(V, 'warlord_' + w.id, { fx, fy, rot }); } catch (e) {}
        try { if (typeof window.hitScreen === 'function' && !(window.jgPerf && window.jgPerf.q < .6)) window.hitScreen(V, 'warlord', fx, fy, rot, true); } catch (e) {}
        try { navigator.vibrate && navigator.vibrate(w.id === 'lvbu' ? [90, 40, 220] : [40, 30, 90]); } catch (e) {}
        shakeAmp = Math.max(shakeAmp, M.S * (scene.shake || 0) * (opt.ult ? 1.6 : 1)); punch = opt.ult ? 1.5 : 1; ptime = 0; const sl = scene.slow || [.42, .32]; slowF = sl[0]; slowDur = sl[1]; slowLeft = slowDur;
      }
      /* 줌 펀치 + 감쇠 진동 (부드러운 저주파) */
      if (cvB && (punch > .003) && !W6.noPunch) {
        ptime += rdt; punch *= Math.pow(.015, rdt / .75); const z = 1 + (scene.zoom || .012) * punch, sx = shakeAmp * punch * (Math.sin(ptime * 31) + .5 * Math.sin(ptime * 53)), sy = shakeAmp * punch * (Math.cos(ptime * 27) + .5 * Math.cos(ptime * 47));
        cvB.style.transformOrigin = `${R.tx - M.br.left}px ${R.ty - M.br.top}px`; cvB.style.transform = `translate3d(${sx.toFixed(2)}px,${sy.toFixed(2)}px,0) scale(${z.toFixed(4)})`;
        if (punch < .004) { cvB.style.transform = ''; cvB.style.transformOrigin = ''; punch = 0; }
      }
      if (t < scene.dur || W6.debugT != null) requestAnimationFrame(frame); else cleanup();
    }
    requestAnimationFrame(frame);
    setTimeout(cleanup, (scene.dur + 3) * 1000 + 1500);
    return true;
  }

  /* ====================================================================
   *  ✨ 필살기 컷신 (군주 스킬: 30/60/90수 해금)  — 만화/애니메이션식 컷인 + 본 공격 + 필살 도장
   * ==================================================================== */
  const hexRGB = h => { h = String(h || '#ffffff').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
  const U_DUR = { zhuge: 3.9, sunquan: 3.9, caocao: 3.3, liubei: 3.9, lvbu: 3.7, simayi: 3.9 }, U_IMP = { zhuge: 2.4, sunquan: 1.5, caocao: 1.62, liubei: 1.6, lvbu: 1.35, simayi: 2.35 };
  const U_SUB = { zhuge: '星 辰 落 下', sunquan: '怒 濤 滅 敵', caocao: '覇 王 亂 舞', liubei: '桃 園 雙 劍', lvbu: '無 雙 亂 擊', simayi: '氷 結 狼 顧' };
  function runUltimate(A, w, seed) {
    const V = A === 'c' ? 'h' : 'c', pc = hexRGB(w.primary), sc = hexRGB(w.secondary), CUT = 2.15, post = (U_DUR[w.id] || 3.8) + .7;
    if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(true);
    const ov = document.createElement('canvas'); ov.id = 'jg_ult_cv'; ov.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9994;pointer-events:none;'; document.body.appendChild(ov); const g = ov.getContext('2d');
    const por = IM.por[w.id], t0 = performance.now(); let started = false, done = false, sfx1 = false, sfx2 = false, sfx3 = false;
    const cleanup = () => { if (done) return; done = true; try { ov.remove(); } catch (e) {} };
    const title = String(w.sealText || ''), sub = String(w.actionName || '').replace(/^[^\w가-힣一-龥]+/, '').trim();
    function frame(now) {
      if (done) return; const t = W6.debugU != null ? W6.debugU : (now - t0) / 1000, M = metrics(V), dpr = Math.min(window.devicePixelRatio || 1, 1.5), W = M.W, H = M.H, S = Math.min(W, H);
      if (ov.width !== Math.round(W * dpr) || ov.height !== Math.round(H * dpr)) { ov.width = Math.round(W * dpr); ov.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      if (!sfx1 && t > .02) { sfx1 = true; noise(.9, 'bandpass', 400, 4000, .2); tone('sawtooth', 90, 300, .5, .09); }
      if (!sfx2 && t > .62) { sfx2 = true; tone('sine', 140, 52, 1.2, .3); noise(.5, 'lowpass', 1800, 150, .22); }
      const inA = smooth(kk(t, 0, .28)), cutA = 1 - smooth(kk(t, CUT - .05, CUT + .5)), tt = t - CUT, shk = Math.max(0, 1 - Math.abs(t - .75) * 5) * 6 + Math.max(0, 1 - Math.abs(tt - (U_IMP[w.id] || 1.5)) * 4) * 8 * (started ? 1 : 0);
      g.save(); g.translate(Math.sin(t * 90) * shk, Math.cos(t * 83) * shk);
      /* 암전 + 색 비네트 */
      g.fillStyle = `rgba(0,0,0,${.62 * inA * cutA})`; g.fillRect(-20, -20, W + 40, H + 40); if (ok(IM.vignette)) { g.globalAlpha = .75 * inA * cutA; g.drawImage(tinted(IM.vignette, 'uv', pc, 1), 0, 0, W, H); g.globalAlpha = 1; }
      const cx = W / 2, cy = H * .43;
      /* 집중선 + 폭발 별 */
      if (ok(IM.ult_speed)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.rotate(t * .5); const z = Math.max(W, H) * 1.7; g.globalAlpha = .6 * smooth(kk(t, .05, .45)) * cutA; g.drawImage(tinted(IM.ult_speed, 'us', sc, .8), -z / 2, -z / 2, z, z); g.restore(); }
      if (ok(IM.ult_burst)) { const q = outBack(kk(t, .12, .6)); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.rotate(-.12 + Math.sin(t * 4) * .02); const z = S * 1.25 * q; g.globalAlpha = .55 * cutA; g.drawImage(tinted(IM.ult_burst, 'ub2', sc, .75), -z / 2, -z / 2, z, z); g.restore(); }
      /* 초상 패널 (평행사변형 컷인) */
      const pw = W * .8, ph = H * .5, slide = 1 - outBack(kk(t, .18, .72)), out = smooth(kk(t, CUT - .05, CUT + .35)), px0 = cx - pw / 2 + (-W * 1.1) * slide + W * 1.1 * out, py0 = cy - ph / 2, sk = pw * .14;
      if (cutA > .01) {
        for (let gh = 3; gh >= 0; gh--) { const off = gh * (slide * W * .12 + 8) * (1 - out * .5); g.save(); g.globalAlpha = (gh ? .14 : 1) * cutA; g.translate(-off, 0); g.beginPath(); g.moveTo(px0 + sk, py0); g.lineTo(px0 + pw, py0); g.lineTo(px0 + pw - sk, py0 + ph); g.lineTo(px0, py0 + ph); g.closePath();
          if (gh) { g.fillStyle = `rgba(${sc},.5)`; g.fill(); } else { g.save(); g.clip(); g.fillStyle = '#10101c'; g.fillRect(px0, py0, pw, ph); if (ok(por)) { const sc2 = Math.max(pw / por.naturalWidth, ph / por.naturalHeight) * (1.08 + .05 * kk(t, .3, 2.2)), iw = por.naturalWidth * sc2, ih = por.naturalHeight * sc2; g.drawImage(por, px0 + pw / 2 - iw / 2 - sk * .2, py0 + ph * .18 - ih * .12 + (ih - ph) * -.0, iw, ih); }
            const gr = g.createLinearGradient(0, py0, 0, py0 + ph); gr.addColorStop(0, `rgba(${pc},0)`); gr.addColorStop(1, `rgba(${pc},.55)`); g.fillStyle = gr; g.fillRect(px0, py0, pw, ph); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${sc},${.12 + .08 * Math.sin(t * 9)})`; g.fillRect(px0, py0, pw, ph); g.restore();
            g.lineJoin = 'miter'; g.strokeStyle = `rgba(${sc},1)`; g.lineWidth = 5; g.shadowColor = `rgba(${sc},.95)`; g.shadowBlur = 22; g.stroke(); g.shadowBlur = 0; }
          g.restore(); }
      }
      /* 붓글씨 제목 + 소제목 */
      const ta = smooth(kk(t, .55, .95)) * cutA, wipe = outQuint(kk(t, .55, 1.15));
      if (ta > .01) {
        const by = py0 + ph + H * .075; if (ok(IM.ult_brush)) { g.save(); g.globalAlpha = .9 * ta; g.translate(cx, by); g.rotate(-.04); const bw = W * 1.0 * wipe; g.drawImage(tinted(IM.ult_brush, 'ubr', pc, .85), 0, 0, 1024, 256, -W * .5, -H * .07, bw, H * .14); g.restore(); }
        g.save(); g.beginPath(); g.rect(0, by - H * .09, W * wipe, H * .2); g.clip(); g.translate(cx, by); g.rotate(-.04); g.textAlign = 'center'; g.textBaseline = 'middle'; const fs = Math.min(W * .17, H * .1); g.font = `900 ${fs}px "Noto Serif KR","Nanum Myeongjo","Songti SC",serif`; g.lineJoin = 'round'; g.lineWidth = fs * .16; g.strokeStyle = 'rgba(10,6,0,.95)'; g.shadowColor = `rgba(${sc},.95)`; g.shadowBlur = fs * .45; g.globalAlpha = ta; g.strokeText(title, 0, 0); g.fillStyle = '#fff6d6'; g.fillText(title, 0, 0); g.shadowBlur = 0; const lg = g.createLinearGradient(0, -fs / 2, 0, fs / 2); lg.addColorStop(0, 'rgba(255,255,255,.0)'); lg.addColorStop(1, `rgba(${sc},.55)`); g.fillStyle = lg; g.fillText(title, 0, 0); g.restore();
        g.save(); g.globalAlpha = ta; g.textAlign = 'center'; g.textBaseline = 'middle'; const f2 = Math.min(W * .05, H * .03); g.font = `800 ${f2}px "Noto Serif KR",serif`; g.lineWidth = f2 * .25; g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineJoin = 'round'; g.strokeText(`${w.name} · ${sub}`, cx, by + H * .095); g.fillStyle = `rgb(${sc})`; g.fillText(`${w.name} · ${sub}`, cx, by + H * .095);
        g.font = `900 ${f2 * .9}px "Noto Serif KR",serif`; g.fillStyle = '#ff5a4a'; g.strokeText('必殺技', px0 + pw - sk * .6 - f2 * 1.8, py0 + f2 * 1.1); g.fillText('必殺技', px0 + pw - sk * .6 - f2 * 1.8, py0 + f2 * 1.1); g.restore();
      }
      /* 컷인 끝: 흰 섬광 후 본 공격 시작 */
      const fl = Math.max(0, 1 - Math.abs(t - CUT) * 5); if (fl > 0 && ok(IM.ult_burst)) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .8); gr.addColorStop(0, `rgba(255,255,255,${fl * .9})`); gr.addColorStop(1, `rgba(${sc},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); }
      g.restore();
      /* 시네마 바 : 컷인 동안 + 본 공격 내내 */
      const barH = H * .11 * smooth(kk(t, 0, .3)) * (1 - smooth(kk(t, CUT + post - .5, CUT + post))); g.fillStyle = '#000'; g.fillRect(0, 0, W, barH); g.fillRect(0, H - barH, W, barH); if (barH > 2) { g.fillStyle = `rgba(${sc},.9)`; g.fillRect(0, barH - 2, W, 2); g.fillRect(0, H - barH, W, 2); }
      if (!started && t >= CUT) { started = true; if (!runCinematic(A, V, w, seed, { ult: true }) && typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); }
      /* 필살 도장 */
      const sT = CUT + (U_IMP[w.id] || 1.5) + .02, sq = t - sT;
      if (started && sq > -.01) { const a = (sq < 1.5 ? 1 : 1 - smooth(kk(sq, 1.5, 2.0))), pop = outBack(kk(sq, 0, .24)), z = S * .56 * (1 + (1 - pop) * 1.8); if (!sfx3) { sfx3 = true; tone('sine', 90, 36, .9, .3); noise(.4, 'lowpass', 1400, 120, .2); }
        g.save(); g.translate(W * .5 + (sq < .3 ? Math.sin(sq * 140) * 6 : 0), H * .27); g.rotate(-.14); g.globalAlpha = clamp(a, 0, 1) * smooth(kk(sq, 0, .08));
        if (ok(IM.ult_seal)) g.drawImage(IM.ult_seal, -z / 2, -z / 2, z, z); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${z * .42}px "Noto Serif KR","Songti SC",serif`; g.lineJoin = 'round'; g.lineWidth = z * .035; g.strokeStyle = 'rgba(60,0,0,.9)'; g.fillStyle = '#e8261c'; g.shadowColor = 'rgba(255,60,40,.9)'; g.shadowBlur = z * .08; g.strokeText('必殺', 0, -z * .02); g.fillText('必殺', 0, -z * .02); g.shadowBlur = 0; g.font = `800 ${z * .13}px "Noto Serif KR",serif`; g.fillStyle = '#ffe9c4'; g.fillText(U_SUB[w.id] || '', 0, z * .27); g.restore(); }
      if (t > CUT + post) { cleanup(); return; } requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame); setTimeout(cleanup, (CUT + post + 4) * 1000);
    return true;
  }
  function installUlt() {
    const orig = window.triggerWarlordSkillImpact; if (typeof orig !== 'function' || orig.__ult) return;
    const fn = function (side, id, kind, fx, fy, rot, varIdx) {
      if (kind === 'action' && W6.ultimate && BUILD[id]) { const wl = (window.JG_WARLORDS || []).find(x => x.id === id); if (wl) { try { runUltimate(side === 'h' || side === 'c' ? side : (typeof me !== 'undefined' ? me : 'c'), wl, Math.floor((Number(fx) || Math.random()) * 1e6) ^ 4242); return { idx: 0, variation: { name: '필살 컷신' } }; } catch (e) { console.warn('ult', e); } } }
      return orig.apply(this, arguments);
    };
    fn.__ult = true; fn.__orig = orig; window.triggerWarlordSkillImpact = fn;
  }
  installUlt(); setInterval(installUlt, 1200);

  /* ---------- window.warlordPunishFire 대체 ---------- */
  function install() {
    const orig = window.warlordPunishFire;
    if (typeof orig !== 'function' || orig.__v6) return;
    const fire = function (attackerSide, warlordId, seed) {
      if (!W6.enabled) return orig.apply(this, arguments);
      const me_ = (typeof me !== 'undefined') ? me : 'c', A = (attackerSide === 'h' || attackerSide === 'c') ? attackerSide : me_, V = A === 'c' ? 'h' : 'c';
      const list = window.JG_WARLORDS || [], id = warlordId || (A === me_ ? window.JG_MY_WARLORD : window.JG_OPP_WARLORD), w = list.find(x => x.id === id);
      if (!w || !BUILD[w.id]) return orig.apply(this, arguments);
      if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(true);
      try { if (typeof comm === 'function' && typeof tag === 'function') comm(`👑 ${tag(A)}의 군주 [${w.name}] 필살 응징 [${w.punishFull}] 발동!!`, 'nuke', .35); } catch (e) {}
      try { if (window.showWarlordCutin) window.showWarlordCutin(w.id, `${w.punishFull} 발동!`, w.quotes && w.quotes.punish, 4, V === 'h' ? 1 : 8, 1.8, null, true); } catch (e) {}
      if (!runCinematic(A, V, w, seed)) { if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); return orig.apply(this, arguments); }
    };
    fire.__v6 = true; fire.__orig = orig; window.warlordPunishFire = fire;
  }
  install(); setInterval(install, 1200);
  W6.test = function (id, side) { const s = side || (typeof me !== 'undefined' ? me : 'c'); window.warlordPunishFire(s, id, 12345); };
})();
