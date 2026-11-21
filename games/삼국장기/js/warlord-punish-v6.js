/* ============================================================================
 * [군주 응징 스킬 v6 — 6군주 완전 차별화]  js/warlord-punish-v6.js
 *  warlord-system.js 의 window.warlordPunishFire 를 대체합니다(호출 규격·멀티 동기화 seed 동일).
 *  기존 '스매시컷 / FPV' 공통 틀과 비슷한 비주얼을 모두 버리고, 군주마다 연출 문법 자체를 바꿨습니다.
 *
 *   🌌 제갈량 : [팔진천기] 밤하늘 전환 → 북두칠성이 별자리로 내려앉고 → 팔문금쇄 8개 문이 닫히며 → 태극 수축 후 별빛 기둥  (고요 · 기하학 · 화면 흔들림 없음)
 *   🌊 손  권 : [파천노도] 초승달 수압검기 3연참 → 장강 해일이 한쪽에서 밀려와 진영을 휩쓸고 누선이 파도 위를 달림 → 물이 빠지며 물결 잔상
 *   ⚡ 조  조 : [패왕난무] 어둠 속 그림자 분신 3체가 교차 질주하며 6연 성형 참격(타격마다 번쩍임) → 암청 뇌전망 + 3줄기 낙뢰
 *   🌸 유  비 : [도원쌍검] 복사꽃이 소용돌이쳐 모이고 → 비취·황금 쌍검이 이중 나선으로 강하해 꽂힘 → 도원결의 3중 고리 + 꽃이 만개하고 꽃비
 *   🔱 여  포 : [방천귀신격] 적흑 먹구름 소용돌이 → 방천화극이 혜성처럼 내리꽂히고 히트스톱 → 초대형 분화구·방사 균열·암석 파편·강한 진동
 *   🐺 사마의 : [낭고빙결] 시간이 얼어붙고 서리가 번짐 → 늑대 영혼이 뒤돌아봄 → 중력 소용돌이로 빨려듦 → 내파 후 4방위 연쇄뇌전 + 빙정
 *
 *  피해/흔적 처리는 기존대로 window.hitCamp(...) · window.hitScreen(...) 을 그대로 호출합니다.
 *  끄기(기존 연출 복귀): jgWarlordPunish6.enabled = false
 * ============================================================================ */
(function jgWarlordPunishV6() {
  if (window.__JG_WLP6__) return;
  window.__JG_WLP6__ = true;
  const W6 = window.jgWarlordPunish6 = { enabled: true };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const inCubic = k => Math.pow(clamp(k, 0, 1), 3);
  const outBack = k => { k = clamp(k, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const kk = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  /* ---------- 이미지 ---------- */
  const DIR = 'assets/images/fx/', IM = {};
  const load = n => { const im = new Image(); im.src = DIR + n + '.webp'; return im; };
  ['taiji', 'bagua', 'starflare', 'crescent', 'wave', 'ship', 'slash', 'cloak', 'net', 'sword', 'petal', 'halberd', 'fissure', 'rock', 'wolf', 'ice', 'orb', 'gravity'].forEach(n => IM[n] = load('wl_' + n));
  ['glow_o', 'glow_b', 'glow_g', 'glow_y', 'glow_p', 'shock_y', 'shock_o', 'shock_b', 'shock_p', 'shock_g', 'bolt_b', 'bolt_y', 'bolt_p', 'bolt_g', 'sparks', 'rays_y', 'rays_o', 'vignette'].forEach(n => IM[n] = load('v2_' + n));
  ['cloud', 'frost', 'snow'].forEach(n => IM['e_' + n] = load('env_' + n));
  const ok = im => !!im && im.complete && im.naturalWidth > 0;
  const tc = {};
  function tinted(img, key, rgb, a) {
    const id = key + rgb; if (tc[id]) return tc[id];
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
    try { const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .015); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .05); } catch (e) {}
  }
  function noise(dur, ftype, f0, f1, vol, delay) {
    if (!sfxOn()) return; const a = ac(); if (!a) return;
    try { const t0 = a.currentTime + (delay || 0), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
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
  function addD(g, img, sx, sy, sw, sh, dx, dy, dw, dh, a) { if (!ok(img) || a <= .004) return; g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); }
  function spr(g, img, x, y, w, h, a, rot, fx) {
    if (!ok(img) || a <= .004) return; g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (fx) g.scale(fx, 1); g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, -w / 2, -h / 2, w, h); g.restore();
  }
  function cell(g, img, cw, ch, n, x, y, w, a, rot) {
    if (!ok(img) || a <= .004) return; const h = w * ch / cw; g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.globalAlpha = clamp(a, 0, 1); g.drawImage(img, n * cw, 0, cw, ch, -w / 2, -h / 2, w, h); g.restore();
  }
  function glow(g, key, x, y, size, a) { const im = IM[key]; if (!ok(im)) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, x - size / 2, y - size / 2, size, size); g.restore(); }
  function line(g, x0, y0, x1, y1, w, rgb, a) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    g.strokeStyle = `rgba(${rgb},${a * .45})`; g.lineWidth = w * 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore();
  }
  function ring(g, x, y, r, w, rgb, a, flat) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || 1);
    g.strokeStyle = `rgba(${rgb},${a * .5})`; g.lineWidth = w * 2.6; g.beginPath(); g.arc(0, 0, Math.max(1, r), 0, TAU); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${a * .9})`; g.lineWidth = w; g.beginPath(); g.arc(0, 0, Math.max(1, r), 0, TAU); g.stroke(); g.restore();
  }
  function shockSprite(g, key, x, y, size, k, a, flat) {
    const im = IM[key]; if (!ok(im)) return; const f = Math.min(7, (clamp(k, 0, 1) * 8) | 0);
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || .6); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -size / 2, -size / 2, size, size); g.restore();
  }
  function wash(g, M, rgb, a) { if (a <= .003) return; g.save(); g.globalAlpha = 1; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(M.br.left, M.br.top, M.br.width, M.br.height); g.restore(); }
  function vig(g, M, rgb, a) { const im = IM.vignette; if (!ok(im) || a <= .003) return; g.save(); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tinted(im, 'v', rgb, 1), M.br.left, M.br.top, M.br.width, M.br.height); g.restore(); }

  /* ---------- 파티클 ---------- */
  const SHEET = { spark: ['sparks', 64, 64], petal: ['petal', 64, 64], rock: ['rock', 64, 64], ice: ['ice', 128, 128], cloud: ['e_cloud', 256, 256], flake: ['e_snow', 64, 64] };
  function newRun() { return { P: [] }; }
  function sp(run, o) { if (run.P.length > 360) run.P.shift(); run.P.push(Object.assign({ kind: 'spark', cell: 0, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, sway: 0, swf: 1, ph: 0, rot: 0, vr: 0, size: 8, a: 1, life: 1.5, age: 0, rgb: '255,255,255', add: true, grow: 0, ta: .85, fadeIn: 0 }, o)); }
  function stepPT(run, g, dt) {
    for (let i = run.P.length - 1; i >= 0; i--) {
      const p = run.P[i]; p.age += dt; if (p.age >= p.life) { run.P.splice(i, 1); continue; }
      const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const sh = SHEET[p.kind], img = IM[sh[0]]; if (!ok(img)) continue; const k = p.age / p.life;
      let a = p.a * (p.fadeIn ? ease(p.age / p.fadeIn) : 1) * (1 - ease((k - .7) / .3)); if (a <= .01) continue;
      const s = p.size * (1 + p.grow * k), x = p.x + p.sway * Math.sin(p.age * p.swf + p.ph), src = p.rgb && (p.kind === 'spark' || p.kind === 'cloud' || p.kind === 'flake' || p.kind === 'ice') ? tinted(img, p.kind, p.rgb, p.ta) : img;
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1);
      g.save(); g.translate(x, p.y); if (p.rot) g.rotate(p.rot); g.drawImage(src, p.cell * sh[1], 0, sh[1], sh[2], -s / 2, -s / 2, s, s); g.restore();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function burst(run, x, y, n, o) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(o.v0, o.v1); sp(run, Object.assign({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * (o.sq || .8) + (o.up || 0), life: rnd(o.l0 || .7, o.l1 || 1.6), size: rnd(o.s0, o.s1), rot: rnd(0, TAU), vr: rnd(-6, 6) }, o.p || {}, o.pf ? o.pf(i) : {})); } }

  /* ====================================================================
   *  🌌 제갈량 — 팔진천기 : 별자리 → 팔문금쇄 → 태극 수축 → 별빛 기둥
   * ==================================================================== */
  const DIPPER = [[0, 0], [.2, .05], [.25, .24], [.04, .21], [-.16, .31], [-.36, .37], [-.55, .27]];
  function zhuge(R) {
    const M0 = R.M(), stars = [], tw = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), ph: rnd(0, 6), s: rnd(.4, 1) }));
    return {
      dur: 3.7, impactT: 2.35, shake: 0,
      start() { [0, 1, 2, 3, 4, 5, 6].forEach(i => tone('sine', 660 * Math.pow(1.122, i * 1.6), 660 * Math.pow(1.122, i * 1.6) * .98, .7, .06, .38 + i * .16)); },
      onImpact() { tone('sine', 196, 98, 1.6, .16); tone('triangle', 784, 784, 1.2, .07); noise(1.1, 'lowpass', 900, 120, .12); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, cx = M.camp.x0 + M.camp.w / 2, cy = M.camp.y0 + M.camp.h / 2;
        const night = ease(kk(t, 0, .6)) * (1 - ease(kk(t, 3.0, 3.7)));
        wash(g, M, '4,10,40', .42 * night);
        for (const s of tw) { const a = night * s.s * (.4 + .6 * Math.sin(t * 3 + s.ph) * Math.sin(t * 1.3 + s.ph)); glow(g, 'glow_y', A.left + A.width * s.x, A.top + A.height * s.y, S * .03 * s.s + 4, a * .6); }
        const D = S * .62, pos = DIPPER.map(p => [tx + (p[0] + .1) * D, ty + (p[1] - .17) * D * .85]);
        /* 팔괘 링 */
        const ra = ease(kk(t, 1.15, 1.9)) * (1 - ease(kk(t, 3.0, 3.6))), contract = t > 1.9 ? ease(kk(t, 1.9, 2.35)) : 0, rz = S * (1.02 - contract * .8) * (1.25 - .25 * outCubic(kk(t, 1.15, 1.9)));
        if (ra > .01) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .62); g.rotate(t * .55 * (1 + contract * 3)); g.globalAlpha = ra * .95; g.drawImage(IM.bagua, -rz / 2, -rz / 2, rz, rz); g.restore(); }
        /* 팔문 금쇄 : 8개 문이 안쪽으로 닫힘 */
        for (let i = 0; i < 8; i++) {
          const t0 = 1.5 + i * .075, q = ease(kk(t, t0, t0 + .32)); if (q <= 0 || t > 2.5) continue;
          const a = i * TAU / 8 + t * .0, r0 = S * .5, r1 = r0 * (1 - .78 * q), fa = (1 - ease(kk(t, 2.3, 2.5)));
          line(g, tx + Math.cos(a) * r1 * 1, ty + Math.sin(a) * r1 * .62, tx + Math.cos(a) * r0, ty + Math.sin(a) * r0 * .62, 4, '110,210,255', .75 * fa);
        }
        /* 북두칠성 */
        const fadeC = 1 - ease(kk(t, 2.9, 3.5));
        for (let i = 0; i < 7; i++) {
          const ts = .32 + i * .15, q = kk(t, ts, ts + .35); if (q <= 0) continue; const [x, y] = pos[i], pop = outBack(q);
          const beam = (1 - ease(kk(t, ts, ts + .45))) * .8; if (beam > .02) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x, y - S * .5, x, y); gr.addColorStop(0, 'rgba(255,230,140,0)'); gr.addColorStop(1, `rgba(255,236,170,${beam})`); g.fillStyle = gr; g.fillRect(x - S * .012, y - S * .5, S * .024, S * .5); g.restore(); }
          g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1; spr(g, IM.starflare, x, y, S * .17 * pop, S * .17 * pop, fadeC, t * .4 + i); g.restore();
          if (i > 0) { const lq = ease(kk(t, ts, ts + .3)), [px, py] = pos[i - 1]; line(g, px, py, px + (x - px) * lq, py + (y - py) * lq, 1.8, '255,215,100', .8 * fadeC); }
        }
        /* 충격: 태극 + 별빛 기둥 */
        if (t >= this.impactT) {
          const q = t - this.impactT, qa = 1 - ease(kk(q, .5, 1.2));
          for (let i = 0; i < 7; i++) line(g, pos[i][0], pos[i][1], tx, ty, 3, '255,225,130', (1 - ease(kk(q, 0, .5))) * .9);
          const col = g.createLinearGradient(0, A.top, 0, ty); col.addColorStop(0, 'rgba(255,240,190,0)'); col.addColorStop(.7, `rgba(255,244,200,${.5 * qa})`); col.addColorStop(1, `rgba(255,255,255,${.7 * qa})`);
          g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = col; const cw = S * (.16 * (1 - ease(kk(q, .35, 1.1))) + .03); g.fillRect(tx - cw / 2, A.top, cw, ty - A.top); g.restore();
          const ts = S * .5 * (.35 + outBack(q / .35) * .75) * (1 - ease(kk(q, .8, 1.3)) * .4); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .8); g.rotate(q * 5); g.globalAlpha = .8 * (1 - ease(kk(q, .7, 1.3))); g.drawImage(IM.taiji, -ts / 2, -ts / 2, ts, ts); g.restore();
          glow(g, 'glow_y', tx, ty, S * .7 * (1 - q * .3), (1 - ease(kk(q, 0, .9))) * .42);
          shockSprite(g, 'shock_y', tx, ty, S * 1.3, q / .9, 1 - q * .5, .6); shockSprite(g, 'shock_b', tx, ty, S * .9, (q - .12) / .9, .9, .6);
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; burst(R.run, tx, ty, 34, { v0: 60, v1: 330, s0: S * .014, s1: S * .034, up: -140, l0: 1, l1: 2.2, p: { kind: 'spark', cell: 3, rgb: '255,226,140', ay: 60 }, pf: i => ({ cell: [3, 4, 5, 0][i % 4] }) }); }
      }
    };
  }

  /* ====================================================================
   *  🌊 손권 — 파천노도 : 초승달 3연참 → 장강 해일(누선) → 물 빠짐
   * ==================================================================== */
  function sunquan(R) {
    const dir = R.dir, ships = [0, 1, 2].map(i => ({ u: (i + .5) / 3, ph: rnd(0, 6) }));
    return {
      dur: 3.7, impactT: 1.5, shake: .008,
      start() { noise(1.0, 'bandpass', 300, 1800, .13, .05); [0, 1, 2].forEach(i => noise(.3, 'highpass', 2500, 800, .1, .18 + i * .2)); noise(1.5, 'lowpass', 500, 100, .16, 1.0); },
      onImpact() { tone('sine', 90, 40, 1.2, .2); noise(1.2, 'lowpass', 1200, 200, .2); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, C = M.camp, cy = C.y0 + C.h / 2;
        wash(g, M, '6,50,70', .26 * ease(kk(t, 0, .5)) * (1 - ease(kk(t, 3.0, 3.7))));
        /* 초승달 수압검기 3연참 */
        for (let i = 0; i < 3; i++) {
          const t0 = .12 + i * .2, q = kk(t, t0, t0 + .55); if (q <= 0 || q >= 1) continue;
          const yy = ty + (i - 1) * S * .11, x0 = dir > 0 ? A.left - S * .3 : A.left + A.width + S * .3, x1 = dir > 0 ? A.left + A.width + S * .3 : A.left - S * .3, x = x0 + (x1 - x0) * outCubic(q), w = S * .62, h = w * .5;
          for (let tr = 3; tr >= 0; tr--) { const xt = x - dir * tr * S * .05; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(xt, yy); g.rotate(dir > 0 ? .16 * (i - 1) : Math.PI - .16 * (i - 1)); g.globalAlpha = (1 - q * .3) * (1 - tr * .22); g.drawImage(IM.crescent, -w / 2, -h / 2, w, h); g.restore(); }
          if (!R['cs' + i] && Math.abs(x - tx) < S * .12) { R['cs' + i] = 1; burst(R.run, tx, yy, 16, { v0: 80, v1: 360, s0: S * .014, s1: S * .03, up: -80, p: { kind: 'spark', rgb: '150,225,255', ay: 520 }, pf: j => ({ cell: [3, 4, 5, 0][j % 4] }) }); R['cl' + i] = t; noise(.18, 'highpass', 3000, 1500, .1); }
        }
        for (let i = 0; i < 3; i++) { const ct = R['cl' + i]; if (ct != null) { const q = (t - ct) / .9; if (q < 1) line(g, C.x0, ty + (i - 1) * S * .11, C.x0 + C.w, ty + (i - 1) * S * .11, 2.5, '170,235,255', (1 - q) * .9); } }
        /* 장강 해일 */
        const wq = kk(t, .95, 2.35), front = dir > 0 ? C.x0 - S * .15 + (C.w + S * .45) * outCubic(wq) : C.x0 + C.w + S * .15 - (C.w + S * .45) * outCubic(wq), inX = dir > 0 ? C.x0 - S * .6 : C.x0 + C.w + S * .6;
        const drain = ease(kk(t, 2.4, 3.6)), wetA = (1 - drain);
        if (wq > 0) {
          g.save(); g.beginPath(); g.rect(C.x0 - 6, C.y0 - 6, C.w + 12, C.h + 12); g.clip();
          const x0 = Math.min(front, inX), wdt = Math.abs(front - inX), cover = dir > 0 ? [C.x0, front] : [front, C.x0 + C.w]; const wx = Math.min(cover[0], cover[1]), ww = Math.abs(cover[1] - cover[0]);
          const gr = g.createLinearGradient(dir > 0 ? C.x0 : C.x0 + C.w, 0, front, 0); gr.addColorStop(0, `rgba(20,110,150,${.3 * wetA})`); gr.addColorStop(.7, `rgba(30,150,190,${.4 * wetA})`); gr.addColorStop(1, `rgba(130,220,240,${.55 * wetA})`);
          g.fillStyle = gr; g.fillRect(dir > 0 ? C.x0 : front, C.y0, ww, C.h);
          g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(190,245,255,${.22 * wetA})`; g.lineWidth = 1.2;
          for (let i = 0; i < 9; i++) { const yy = C.y0 + C.h * (i + .5) / 9; g.beginPath(); for (let x = wx; x <= wx + ww; x += 10) { const y2 = yy + Math.sin(x * .05 + t * 4 + i) * 4; x === wx ? g.moveTo(x, y2) : g.lineTo(x, y2); } g.stroke(); }
          g.globalCompositeOperation = 'source-over';
          if (wq < 1) { const dh = C.h * 1.3, dd = S * .42; g.save(); g.translate(front, C.y0 + C.h / 2); g.rotate(dir > 0 ? Math.PI / 2 : -Math.PI / 2); g.globalAlpha = 1; g.drawImage(IM.wave, -dh / 2, -dd * .35, dh, dd); g.restore();
            ships.forEach((sh, i) => { const sy = C.y0 + C.h * sh.u, bob = Math.sin(t * 5 + sh.ph) * S * .012, sz = S * .17; g.save(); g.translate(front - dir * S * .09, sy + bob); g.rotate(Math.sin(t * 4 + sh.ph) * .12); if (dir < 0) g.scale(-1, 1); g.globalAlpha = .95; g.drawImage(IM.ship, -sz / 2, -sz * .75 / 2, sz, sz * .75); g.restore(); });
            if (Math.random() < .9) for (let i = 0; i < 3; i++) sp(R.run, { kind: 'spark', cell: pick([0, 1, 2, 6]), x: front - dir * rnd(0, S * .06), y: rnd(C.y0, C.y0 + C.h), vx: dir * rnd(60, 240), vy: -rnd(40, 220), ay: 520, life: rnd(.5, 1), size: S * rnd(.012, .028), rgb: '200,245,255', a: .9 }); }
          g.restore();
        }
        /* 착수: 물기둥 + 파문 */
        if (t >= this.impactT) { const q = t - this.impactT; shockSprite(g, 'shock_b', tx, ty, S * 1.2, q / 1.0, 1 - q * .35, .55); if (q > .2) shockSprite(g, 'shock_g', tx, ty, S * .9, (q - .2) / 1.0, .6, .55); glow(g, 'glow_b', tx, ty, S * .9, (1 - ease(kk(q, 0, .8))) * .9);
          if (q > 1.2 && q < 2.9) { const k2 = ((q - 1.2) % .75) / .75; ring(g, tx, ty, S * .42 * k2, 2, '190,240,255', (1 - k2) * .6 * wetA, .55); } }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; burst(R.run, tx, ty, 46, { v0: 90, v1: 480, s0: S * .014, s1: S * .036, up: -420, sq: 1, l0: .9, l1: 1.9, p: { kind: 'spark', rgb: '190,240,255', ay: 780 }, pf: j => ({ cell: [0, 1, 2, 6, 7][j % 5] }) }); burst(R.run, tx, ty, 10, { v0: 30, v1: 130, s0: S * .12, s1: S * .24, l0: 1.4, l1: 2.2, up: -60, p: { kind: 'cloud', rgb: '215,245,255', add: false, a: .5, grow: .8 }, pf: j => ({ cell: j % 4 }) }); }
      }
    };
  }

  /* ====================================================================
   *  ⚡ 조조 — 패왕난무 : 분신 3체 · 6연 성형 참격(번쩍임) → 암청 뇌전망
   * ==================================================================== */
  function caocao(R) {
    const base = R.rn() * Math.PI, ang = i => base + i * Math.PI / 6 * 1.0 + (i % 2 ? .0 : 0), cl = [0, 1, 2].map(i => ({ a: base + i * TAU / 3 }));
    const SL = Array.from({ length: 6 }, (_, n) => ({ t0: .6 + n * .13, a: base + n * Math.PI / 6 + Math.PI / 12, v: n % 4, c: n % 3 }));
    return {
      dur: 3.2, impactT: 1.55, shake: .012,
      start() { SL.forEach(s => noise(.12, 'highpass', 4500, 1800, .14, s.t0 - .02)); },
      onImpact() { noise(1.3, 'lowpass', 1500, 120, .22); tone('sawtooth', 120, 40, .9, .12); tone('square', 1800, 300, .15, .05); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, dark = ease(kk(t, 0, .35)) * (1 - ease(kk(t, 2.6, 3.2)));
        wash(g, M, '14,0,12', .4 * dark); vig(g, M, '150,10,20', .5 * dark);
        /* 분신 */
        cl.forEach((c, i) => {
          const appear = ease(kk(t, .12 + i * .08, .5)), out = 1 - ease(kk(t, 1.45, 1.8)); if (appear <= 0) return;
          const cur = SL.filter(s => s.c === i && t >= s.t0 - .02), last = cur[cur.length - 1]; let x = tx + Math.cos(c.a) * S * .36, y = ty + Math.sin(c.a) * S * .36 * .8; let a = appear * out;
          const sz = S * .3;
          if (last) { const q = kk(t, last.t0 - .02, last.t0 + .09); const ex = tx - Math.cos(last.a) * S * .4, ey = ty - Math.sin(last.a) * S * .32, sx = tx + Math.cos(last.a) * S * .4, sy = ty + Math.sin(last.a) * S * .32; x = sx + (ex - sx) * ease(q); y = sy + (ey - sy) * ease(q);
            for (let tr = 4; tr >= 1; tr--) { const qq = clamp(q - tr * .12, 0, 1), xx = sx + (ex - sx) * ease(qq), yy = sy + (ey - sy) * ease(qq); cell(g, IM.cloak, 192, 320, last.c, xx, yy, sz, a * (.45 - tr * .08), 0); } }
          cell(g, IM.cloak, 192, 320, i, x, y, sz, a, 0);
          g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 'glow_o', x, y - sz * .1, sz * .9, a * .35); g.restore();
        });
        /* 6연 참격 */
        let flash = 0;
        SL.forEach((s, n) => {
          const q = t - s.t0; if (q < 0) return;
          if (!s._f) { s._f = 1; R.shakeKick(S * .012); burst(R.run, tx, ty, 14, { v0: 120, v1: 560, s0: S * .012, s1: S * .028, up: -60, p: { kind: 'spark', rgb: pick(['255,200,90', '255,90,60']), ay: 380 }, pf: j => ({ cell: [3, 4, 5][j % 3] }) }); }
          flash = Math.max(flash, q < .05 ? 1 : (q < .1 ? .4 : 0));
          const L = S * 1.0, h = L * .15, hold = 1 - ease(kk(t, 1.6, 2.3)), grow = outCubic(kk(q, 0, .1)), a = (q < .5 ? 1 : .75) * hold;
          g.save(); g.translate(tx, ty); g.rotate(s.a); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .85; g.drawImage(IM.slash, 0, s.v * 128, 512, 128, -L * grow / 2, -h / 2, L * grow, h); g.restore();
        });
        if (flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,235,220,${.22 * flash})`; g.fillRect(A.left, A.top, A.width, A.height); g.restore(); }
        /* 암청 뇌전망 + 3줄기 낙뢰 */
        if (t >= this.impactT) {
          const q = t - this.impactT, grow = outCubic(kk(q, 0, .22)), sz = S * 1.25 * grow, fa = 1 - ease(kk(q, .8, 1.5));
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.rotate(.3); g.globalAlpha = fa * (.75 + .25 * Math.sin(q * 60)); g.drawImage(IM.net, -sz / 2, -sz / 2, sz, sz); g.restore();
          glow(g, 'glow_b', tx, ty, S * 1.1, (1 - ease(kk(q, 0, .7))) * .9); glow(g, 'glow_o', tx, ty, S * .7, (1 - ease(kk(q, 0, .5))));
          shockSprite(g, 'shock_o', tx, ty, S * 1.2, q / .8, 1 - q * .5, .6); shockSprite(g, 'shock_b', tx, ty, S * 1.6, (q - .1) / .9, .7, .55);
          [-1, 0, 1].forEach((d, i) => { const bq = kk(q, i * .05, i * .05 + .5); if (bq <= 0 || bq >= 1) return; const f = ((q / .05) | 0) % 6, h = ty - A.top + S * .1, w = h * .5; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (.55 + .45 * Math.abs(Math.sin(q * 55 + i))) * (1 - bq); g.translate(tx + d * S * .07, ty); g.drawImage(IM.bolt_y, f * 256, 0, 256, 512, -w / 2, -h, w, h); g.restore(); });
          if (q < .15) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${(1 - q / .15) * .5})`; g.fillRect(A.left, A.top, A.width, A.height); g.restore(); }
        }
        stepPT(R.run, g, dt);
      }
    };
  }

  /* ====================================================================
   *  🌸 유비 — 도원쌍검 : 복사꽃 소용돌이 → 비취·황금 이중 나선 쌍검 → 3중 고리 · 만개 · 꽃비
   * ==================================================================== */
  function liubei(R) {
    const sw = Array.from({ length: 70 }, () => ({ r0: rnd(.45, 1.15), a0: rnd(0, TAU), w: rnd(1.4, 2.8), c: (Math.random() * 5) | 0, s: rnd(.5, 1), ph: rnd(0, 6) }));
    const trail = [[], []], flowers = Array.from({ length: 9 }, (_, i) => ({ a: i * TAU / 9 + rnd(-.2, .2), r: rnd(.14, .3), s: rnd(.6, 1.1), t: .1 * i }));
    return {
      dur: 3.7, impactT: 1.55, shake: .006,
      start() { [0, 1].forEach(i => tone('sine', i ? 880 : 660, i ? 860 : 650, 1.0, .07, .5 + i * .06)); noise(.8, 'bandpass', 800, 3000, .06, .5); },
      onImpact() { tone('sine', 523, 520, 1.6, .14); tone('sine', 784, 780, 1.6, .1, .04); tone('triangle', 1046, 1040, 1.2, .06, .08); noise(.5, 'highpass', 3000, 1500, .08); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, C = M.camp, fade = 1 - ease(kk(t, 3.0, 3.7));
        wash(g, M, '255,175,205', .17 * ease(kk(t, 0, .6)) * fade);
        /* 꽃잎 소용돌이 */
        const sq = kk(t, .05, 1.5);
        sw.forEach(p => { const r = p.r0 * S * (1 - ease(sq)) * (t > 1.55 ? 0 : 1), a = p.a0 + t * p.w * (1 + sq * 1.6), x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r * .75 - Math.sin(sq * Math.PI) * S * .05; if (t > 1.55 || r < 2) return; cell(g, IM.petal, 64, 64, p.c, x, y, S * .05 * p.s, .95 * ease(kk(t, 0, .3)), a * 2 + p.ph); });
        /* 쌍검 이중 나선 */
        const dq = kk(t, .4, 1.55), land = t >= 1.55;
        [0, 1].forEach(j => {
          const rad = S * .13 * (1 - ease(kk(dq, .75, 1))) , ang = j * Math.PI + t * 8.5, h0 = Math.min(S * .75, ty - A.top + S * .8), x = tx + Math.cos(ang) * rad, y0 = ty - (1 - inCubic(dq)) * h0 - S * .02, y = y0 + Math.sin(ang) * rad * .35;
          if (!land) { trail[j].push([x, y, t]); if (trail[j].length > 22) trail[j].shift(); }
          const rgb = j ? '255,215,90' : '60,240,170';
          for (let i = 1; i < trail[j].length; i++) { const a = trail[j][i - 1], b = trail[j][i], al = i / trail[j].length * (land ? Math.max(0, 1 - (t - 1.55) * 2.2) : 1); line(g, a[0], a[1], b[0], b[1], 2 * (i / trail[j].length) + .6, rgb, al * .75); }
          const sh = S * (land ? .26 : .44), gx = land ? tx + (j ? 1 : -1) * S * .035 : x, gy = land ? ty - sh * .42 : y - sh * .46, al = (t > .4 ? 1 : 0) * (land ? 1 - ease(kk(t, 2.6, 3.2)) : ease(kk(t, .4, .7)));
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(gx, gy); g.rotate(land ? (j ? .05 : -.05) : .0); g.globalAlpha = al; g.drawImage(IM.sword, j * 96, 0, 96, 512, -sh * .09, -sh / 2, sh * .18, sh); g.restore();
        });
        /* 착지: 쌍기둥 + 도원결의 3중 고리 + 만개 */
        if (land) {
          const q = t - 1.55, qa = 1 - ease(kk(q, .4, 1.4));
          [['60,240,170', -1], ['255,215,90', 1]].forEach(([rgb, s]) => { const gr = g.createLinearGradient(0, ty - S * .9, 0, ty); gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(1, `rgba(${rgb},${.8 * qa})`); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(tx + s * S * .035 - S * .022, ty - S * .9, S * .044, S * .9); g.restore(); });
          ['255,150,190', '255,215,110', '70,240,170'].forEach((rgb, i) => { const rq = kk(q, i * .14, i * .14 + 1.0); if (rq > 0 && rq < 1) ring(g, tx, ty, S * (.1 + .5 * outCubic(rq)), 3.2 - i * .6, rgb, (1 - rq) * .95, .62); });
          glow(g, 'glow_y', tx, ty, S * .95, (1 - ease(kk(q, 0, 1))) * .8);
          flowers.forEach(f => { const fq = kk(q, f.t * .6, f.t * .6 + .5), out = 1 - ease(kk(t, 2.9, 3.6)); if (fq <= 0) return; const x = tx + Math.cos(f.a) * S * f.r * 1.5 * (.5 + fq * .5), y = ty + Math.sin(f.a) * S * f.r * 1.5 * .72 * (.5 + fq * .5); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 'glow_y', x, y, S * .12, .3 * out); g.restore(); cell(g, IM.petal, 64, 64, 5, x, y, S * .09 * outBack(fq) * f.s, out, f.a); });
          /* 꽃비 */
          if (t < 3.0 && Math.random() < .95) for (let i = 0; i < 2; i++) sp(R.run, { kind: 'petal', cell: (Math.random() * 5) | 0, x: rnd(C.x0, C.x0 + C.w), y: C.y0 - S * .05, vx: rnd(-10, 22), vy: rnd(70, 130), sway: rnd(22, 46), swf: rnd(1.2, 2.2), ph: rnd(0, 6), vr: rnd(-3, 3), rot: rnd(0, TAU), size: S * rnd(.04, .075), life: rnd(2.2, 3.4), add: false, a: .95 });
        }
        stepPT(R.run, g, dt);
        if (land && !this._d) { this._d = 1; burst(R.run, tx, ty, 62, { v0: 80, v1: 420, s0: S * .04, s1: S * .075, up: -120, l0: 1.2, l1: 2.6, p: { kind: 'petal', add: false, ay: 90, sway: 16, swf: 4, drag: .985 }, pf: () => ({ cell: (Math.random() * 5) | 0 }) }); burst(R.run, tx, ty, 26, { v0: 40, v1: 240, s0: S * .014, s1: S * .03, up: -120, p: { kind: 'spark', rgb: pick(['255,215,100', '110,255,190']), ay: 40 }, pf: j => ({ cell: [3, 4, 0][j % 3], rgb: j % 2 ? '255,215,100' : '110,255,190' }) }); }
      }
    };
  }

  /* ====================================================================
   *  🔱 여포 — 방천귀신격 : 적흑 먹구름 → 방천화극 강하 → 히트스톱 · 분화구 · 방사 균열 · 암석
   * ==================================================================== */
  function lvbu(R) {
    const side = R.dir, rocks = Array.from({ length: 22 }, () => ({ a: rnd(0, TAU), v: rnd(.3, 1.0), s: rnd(.03, .075), c: (Math.random() * 4) | 0, vr: rnd(-8, 8), up: rnd(.4, 1.2) })), fr = rnd(0, TAU);
    return {
      dur: 3.5, impactT: 1.3, shake: .03, hitstop: .12,
      start() { tone('sawtooth', 60, 48, .9, .08); noise(.7, 'bandpass', 200, 1400, .1, .55); },
      onImpact() { tone('sine', 78, 28, 1.5, .34); noise(1.4, 'lowpass', 900, 60, .3); tone('square', 220, 40, .5, .1); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, out = 1 - ease(kk(t, 3.0, 3.5)), pul = .8 + .2 * Math.sin(t * 9);
        const om = ease(kk(t, 0, .5)); wash(g, M, '26,0,14', .48 * om * out); vig(g, M, '190,10,40', (.45 * pul * om) * out);
        /* 먹구름 소용돌이 */
        for (let i = 0; i < 7; i++) { const a = t * .9 + i * TAU / 7, r = S * (.34 + .06 * Math.sin(t * 2 + i)) * (1 - .3 * kk(t, .6, 1.3)); g.globalAlpha = 1; const im = IM.e_cloud; if (ok(im)) { g.globalAlpha = .5 * om * out; g.drawImage(tinted(im, 'cl', '70,8,40', .95), (i % 4) * 256, 0, 256, 256, tx + Math.cos(a) * r - S * .28, ty + Math.sin(a) * r * .7 - S * .55 - S * .28, S * .56, S * .56); } }
        if (t < 1.3 && Math.random() < .35) { const f = (Math.random() * 6) | 0, h = S * rnd(.4, .8), w = h * .5, x = tx + rnd(-.5, .5) * S; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55; g.drawImage(IM.bolt_p, f * 256, 0, 256, 512, x - w / 2, ty - S * .9, w, h); g.restore(); }
        /* 적토마 질주 속도선 */
        const sk = kk(t, .35, 1.0); if (sk > 0 && sk < 1) for (let i = 0; i < 9; i++) { const yy = ty + (i - 4) * S * .06 + Math.sin(i * 7) * S * .02, x1 = A.left + A.width * (1.1 - ease(sk) * 1.3 + i * .02), L = S * (.5 + (i % 3) * .2); line(g, x1, yy, x1 + L * side * -1, yy + (i - 4) * 2, 2.2, '255,60,70', (1 - Math.abs(sk - .5) * 1.6) * .7); }
        /* 방천화극 강하 */
        const hq = kk(t, .55, 1.3), hs = { x: tx - side * S * .55, y: Math.max(A.top - S * .8, ty - S * 1.0) }, hp = inCubic(hq), hx = hs.x + (tx - hs.x) * hp, hy = hs.y + (ty - hs.y) * hp, dang = Math.atan2(ty - hs.y, tx - hs.x), HL = S * .95;
        if (t < 1.3 + .02 || t > this.impactT) {
          const planted = t >= this.impactT, a = planted ? (1 - ease(kk(t, 2.7, 3.3))) : ease(kk(t, .5, .7));
          if (!planted) for (let gh = 3; gh >= 1; gh--) { const q2 = clamp(hq - gh * .06, 0, 1), xx = hs.x + (tx - hs.x) * inCubic(q2), yy = hs.y + (ty - hs.y) * inCubic(q2); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(xx - Math.cos(dang) * HL * .5, yy - Math.sin(dang) * HL * .5); g.rotate(dang + Math.PI / 2); g.globalAlpha = a * (.4 - gh * .08); g.drawImage(IM.halberd, -HL / 6, -HL / 2, HL / 3, HL); g.restore(); }
          g.save(); g.globalCompositeOperation = 'lighter'; g.translate(planted ? tx : hx - Math.cos(dang) * HL * .5, planted ? ty - HL * .36 : hy - Math.sin(dang) * HL * .5); g.rotate(planted ? .1 : dang + Math.PI / 2); g.globalAlpha = a; g.drawImage(IM.halberd, -HL / 6, -HL / 2, HL / 3, HL); g.restore();
        }
        /* 착탄 */
        if (t >= this.impactT) {
          const q = t - this.impactT, gr = ease(kk(q, 0, .35)), rr = S * .72 * outCubic(kk(q, 0, .45));
          const crat = g.createRadialGradient(tx, ty, 0, tx, ty, S * .34 * gr + 1); crat.addColorStop(0, `rgba(6,0,6,${.92 * out})`); crat.addColorStop(.7, `rgba(40,4,26,${.7 * out})`); crat.addColorStop(1, 'rgba(40,4,26,0)'); g.save(); g.translate(tx, ty); g.scale(1, .8); g.translate(-tx, -ty); g.fillStyle = crat; g.beginPath(); g.arc(tx, ty, S * .34 * gr + 1, 0, TAU); g.fill(); g.restore();
          g.save(); g.beginPath(); g.arc(tx, ty, rr, 0, TAU); g.clip(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.rotate(fr); const fs = S * 1.3; g.globalAlpha = (.7 + .2 * Math.sin(q * 11)) * out; g.drawImage(IM.fissure, -fs / 2, -fs / 2, fs, fs); g.restore();
          glow(g, 'glow_p', tx, ty, S * .85, (1 - ease(kk(q, 0, .8))) * .5); glow(g, 'glow_o', tx, ty, S * .5, (.3 + .2 * Math.sin(q * 10)) * out);
          shockSprite(g, 'shock_p', tx, ty, S * 1.5, q / .9, 1 - q * .5, .62); shockSprite(g, 'shock_o', tx, ty, S * 1.1, (q - .08) / .9, .9, .62); shockSprite(g, 'shock_y', tx, ty, S * 1.9, (q - .2) / 1.0, .5, .6);
          for (let i = 0; i < 8; i++) { const bq = kk(q, i * .015, i * .015 + .55); if (bq <= 0 || bq >= 1) continue; const ang = i * TAU / 8 + fr, L = S * (.35 + outCubic(bq) * .5), f = ((q / .05 + i) | 0) % 6; g.save(); g.translate(tx, ty); g.rotate(ang - Math.PI / 2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - bq) * (.6 + .4 * Math.sin(q * 50 + i)); g.drawImage(IM.bolt_p, f * 256, 0, 256, 512, -L * .25, 0, L * .5, L); g.restore(); }
          if (q < .1) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,230,240,${(1 - q / .1) * .35})`; g.fillRect(A.left, A.top, A.width, A.height); g.restore(); }
          if (q < 2 && Math.random() < .5) sp(R.run, { kind: 'spark', cell: pick([6, 7, 0]), x: tx + rnd(-1, 1) * S * .25, y: ty + rnd(-.5, .5) * S * .2, vy: -rnd(30, 110), vx: rnd(-20, 20), life: rnd(1.2, 2.4), size: S * rnd(.01, .024), rgb: pick(['255,70,100', '210,90,255']) });
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1;
          rocks.forEach(r => sp(R.run, { kind: 'rock', cell: r.c, x: tx, y: ty, vx: Math.cos(r.a) * S * r.v * 1.3, vy: Math.sin(r.a) * S * r.v * .9 - S * r.up * 1.1, ay: S * 2.6, rot: rnd(0, TAU), vr: r.vr, size: S * r.s, life: rnd(1.2, 2.1), add: false, a: 1, drag: .995 }));
          burst(R.run, tx, ty, 12, { v0: 100, v1: 420, s0: S * .22, s1: S * .4, l0: 1.6, l1: 2.6, sq: .5, p: { kind: 'cloud', rgb: '90,60,70', add: false, a: .6, grow: 1.1, drag: .96 }, pf: j => ({ cell: j % 4 }) });
          burst(R.run, tx, ty, 34, { v0: 150, v1: 640, s0: S * .014, s1: S * .034, up: -160, p: { kind: 'spark', ay: 600 }, pf: j => ({ cell: [3, 4, 5, 0][j % 4], rgb: j % 2 ? '255,80,110' : '215,110,255' }) }); }
      }
    };
  }

  /* ====================================================================
   *  🐺 사마의 — 낭고빙결 : 시간 정지 → 늑대 영혼의 뒤돌아봄 → 중력 소용돌이 → 내파 · 4방위 연쇄뇌전 · 빙정
   * ==================================================================== */
  function simayi(R) {
    const flakes = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: rnd(.5, 1), v: rnd(.01, .03) })), cards = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    return {
      dur: 3.8, impactT: 2.3, shake: .01,
      start() { tone('sine', 55, 110, 2.2, .1); tone('sine', 58, 116, 2.2, .06, .05); noise(.9, 'highpass', 5000, 3000, .04, 1.1); },
      onImpact() { tone('sine', 120, 30, 1.2, .28); noise(.5, 'lowpass', 2400, 200, .2); [0, 1, 2, 3].forEach(i => noise(.18, 'bandpass', 3200, 900, .13, .1 + i * .1)); [0, 1, 2].forEach(i => noise(.1, 'highpass', 6000, 3500, .08, .5 + i * .12)); },
      frame(g, t, dt, M) {
        const { tx, ty, S } = R, A = M.br, C = M.camp, cx = C.x0 + C.w / 2, cy = C.y0 + C.h / 2, out = 1 - ease(kk(t, 3.2, 3.8)), fz = ease(kk(t, 0, .7));
        wash(g, M, '8,16,60', .36 * fz * out);
        /* 서리 번짐 (가장자리 → 안쪽) */
        if (ok(IM.e_frost)) { g.save(); g.beginPath(); g.rect(A.left, A.top, A.width, A.height); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .16 * fz * out; const T = S * .9; for (let yy = A.top; yy < A.top + A.height; yy += T) for (let xx = A.left; xx < A.left + A.width; xx += T) g.drawImage(IM.e_frost, xx, yy, T + 1, T + 1); g.restore(); vig(g, M, '120,190,255', .55 * fz * out); }
        g.globalAlpha = .6 * fz * out; flakes.forEach(f => { f.y += f.v * dt * .4; if (f.y > 1) f.y = 0; cell(g, IM.e_snow, 64, 64, 4 + ((f.s * 3) | 0) % 4, A.left + A.width * f.x, A.top + A.height * f.y, S * .03 * f.s, .6 * fz * out, 0); });
        /* 늑대 영혼 : 옆을 보다가 뒤돌아봄 */
        const wq = kk(t, .45, 1.0), turn = ease(kk(t, 1.0, 1.28)), wa = ease(kk(t, .45, .9)) * (1 - ease(kk(t, 1.75, 2.15))), wsz = S * .85, wsx = .38 + .62 * outBack(turn) - (turn >= 1 ? 0 : 0);
        if (wa > .01) {
          g.save(); g.translate(cx, cy - S * .05); g.scale(Math.max(.05, wsx), 1); g.globalAlpha = wa * .92; g.drawImage(IM.wolf, -wsz / 2, -wsz / 2, wsz, wsz); g.restore();
          const ea = (turn > .3 ? 1 : 0) * wa, flare = Math.max(0, 1 - Math.abs(t - 1.14) * 4);
          [-1, 1].forEach(s => { const ex = cx + s * wsz * .195 * wsx, ey = cy - S * .05 - wsz * .5 + wsz * .39; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(ex, ey); g.rotate(s * .35); g.globalAlpha = ea; const gr = g.createRadialGradient(0, 0, 0, 0, 0, wsz * .08); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(120,220,255,.95)'); gr.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, wsz * .09, wsz * .035, 0, 0, TAU); g.fill(); g.restore(); glow(g, 'glow_b', ex, ey, wsz * (.3 + .35 * flare), ea * (.5 + .5 * flare)); });
          if (flare > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(140,200,255,${flare * .22})`; g.fillRect(A.left, A.top, A.width, A.height); g.restore(); }
        }
        /* 조준 레티클 */
        const rq = kk(t, .85, 1.6); if (rq > 0 && t < 2.3) for (let i = 0; i < 3; i++) { const q = clamp(rq * 1.3 - i * .12, 0, 1), px = cx + (tx - cx) * ease(q) + (1 - ease(q)) * Math.sin(i * 2.1 + t * 3) * S * .25, py = cy + (ty - cy) * ease(q) + (1 - ease(q)) * Math.cos(i * 1.7 + t * 3) * S * .12, rr = S * (.05 + .05 * (1 - ease(q))); ring(g, px, py, rr, 1.6, '140,215,255', .8 * (1 - ease(kk(t, 2.0, 2.3))), 1); line(g, px - rr * 1.6, py, px + rr * 1.6, py, 1.2, '170,225,255', .5); line(g, px, py - rr * 1.6, px, py + rr * 1.6, 1.2, '170,225,255', .5); }
        /* 중력 소용돌이 + 암영 구체 */
        const gq = kk(t, 1.5, 2.3);
        if (gq > 0 && t < this.impactT + .3) { const gs = S * (1.3 - 1.0 * ease(gq)); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(tx, ty); g.scale(1, .8); g.rotate(-t * (3 + gq * 8)); g.globalAlpha = ease(gq) * (1 - ease(kk(t, 2.3, 2.6))); g.drawImage(IM.gravity, -gs / 2, -gs / 2, gs, gs); g.restore();
          const dk = g.createRadialGradient(tx, ty, S * .05, tx, ty, S * 1.0 * (1 - .35 * gq)); dk.addColorStop(0, 'rgba(0,0,10,0)'); dk.addColorStop(1, `rgba(0,0,12,${.5 * ease(gq)})`); g.fillStyle = dk; g.fillRect(A.left, A.top, A.width, A.height);
          const os = S * .26 * ease(kk(t, 1.7, 2.3)); if (os > 1) spr(g, IM.orb, tx, ty, os * 1.4, os * 1.4, 1, t * 3);
          if (Math.random() < .85) { const a = rnd(0, TAU), rr = S * rnd(.3, .6); sp(R.run, { kind: 'spark', cell: pick([0, 1, 3]), x: tx + Math.cos(a) * rr, y: ty + Math.sin(a) * rr * .8, vx: -Math.cos(a) * rr * 1.9, vy: -Math.sin(a) * rr * 1.5, life: .55, size: S * rnd(.012, .026), rgb: '140,200,255' }); } }
        /* 내파 → 4방위 연쇄뇌전 + 빙정 */
        if (t >= this.impactT) {
          const q = t - this.impactT, fa = 1 - ease(kk(q, 1.0, 1.5));
          glow(g, 'glow_b', tx, ty, S * 1.0, (1 - ease(kk(q, 0, .5))) * .95); const flash = Math.max(0, 1 - q / .12); if (flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(210,235,255,${flash * .6})`; g.fillRect(A.left, A.top, A.width, A.height); g.restore(); }
          for (let i = 0; i < 4; i++) { const oq = outCubic(kk(q, .05, .4)), ox = tx + cards[i][0] * S * .38 * oq, oy = ty + cards[i][1] * S * .3 * oq;
            if (oq > 0) { const f = ((q / .05 + i) | 0) % 6, dx = ox - tx, dy = oy - ty, L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx); g.save(); g.translate(tx, ty); g.rotate(ang - Math.PI / 2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = fa * (.55 + .45 * Math.abs(Math.sin(q * 48 + i))); g.drawImage(IM.bolt_b, f * 256, 0, 256, 512, -L * .3, 0, L * .6, L); g.restore();
              spr(g, IM.orb, ox, oy, S * .12, S * .12, fa, q * 5); glow(g, 'glow_b', ox, oy, S * .3, fa * (.6 + .4 * Math.sin(q * 30 + i))); } }
          [.2, .36, .52].forEach((r, i) => ring(g, tx, ty, S * r * (1 - ease(kk(q, 0, .3)) * .0) * outCubic(kk(q, i * .06, .5 + i * .06)), 2.6, '120,170,255', (1 - ease(kk(q, .5, 1.4))) * .8, .8));
          g.save(); g.beginPath(); g.arc(tx, ty, S * .55 * outCubic(kk(q, 0, .9)), 0, TAU); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .3 * (1 - ease(kk(q, 1.0, 1.5))); if (ok(IM.e_frost)) { const T = S * .7; g.drawImage(IM.e_frost, tx - T / 2, ty - T / 2, T, T); } g.restore();
          shockSprite(g, 'shock_b', tx, ty, S * 1.4, q / .9, 1 - q * .5, .6);
        }
        stepPT(R.run, g, dt);
        if (t >= this.impactT && !this._d) { this._d = 1; burst(R.run, tx, ty, 30, { v0: 120, v1: 520, s0: S * .05, s1: S * .1, up: -120, l0: 1.2, l1: 2.2, p: { kind: 'ice', rgb: '150,215,255', ay: 420, drag: .985, ta: .6 }, pf: j => ({ cell: j % 4 }) }); burst(R.run, tx, ty, 26, { v0: 80, v1: 360, s0: S * .014, s1: S * .03, up: -100, p: { kind: 'spark', rgb: '170,215,255', ay: 120 }, pf: j => ({ cell: [3, 4, 5, 0][j % 4] }) }); }
      }
    };
  }

  const BUILD = { zhuge, sunquan, caocao, liubei, lvbu, simayi };

  /* ---------- 실행 틀 ---------- */
  function runCinematic(A, V, w, seed) {
    const mk = BUILD[w.id]; if (!mk) return false;
    let sd = (seed || Date.now()) >>> 0; const rn = () => (sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296;
    const fx = .30 + rn() * .40, fy = .28 + rn() * .36, rot = (rn() - .5) * .35, dirR = rn() < .5 ? -1 : 1;
    const ov = document.createElement('canvas'); ov.id = 'jg_wlp6_cv'; ov.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9993;pointer-events:none;'; document.body.appendChild(ov); const g = ov.getContext('2d');
    const run = newRun(), R = { run, rn, dir: dirR, tx: 0, ty: 0, S: 1, M: () => metrics(V), shakeKick(a) { shakeAmp = Math.max(shakeAmp, a); } };
    let shakeAmp = 0, shakeT = 0, t = 0, last = performance.now(), impacted = false, freeze = 0, done = false;
    const scene = mk(R), cvB = document.getElementById('cv');
    try { scene.start && scene.start(); } catch (e) {}
    const cleanup = () => { if (done) return; done = true; try { ov.remove(); } catch (e) {} if (cvB) cvB.style.transform = ''; if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); };
    function frame(now) {
      if (done) return;
      const rdt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
      const M = metrics(V), dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (ov.width !== Math.round(M.W * dpr) || ov.height !== Math.round(M.H * dpr)) { ov.width = Math.round(M.W * dpr); ov.height = Math.round(M.H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, M.W, M.H);
      R.S = M.S; R.tx = M.br.left + M.br.width * fx; R.ty = M.br.top + M.br.height * (M.isTop ? (.14 + fy * .32) : (.54 + fy * .32));
      let dt = rdt; if (W6.debugT != null) { dt = .016; t = W6.debugT; } else if (freeze > 0) { freeze -= rdt; dt = 0; } else t += rdt;
      g.save(); g.beginPath(); g.rect(M.br.left, M.br.top - M.S * .9, M.br.width, M.br.height + M.S * .9); g.clip();
      try { scene.frame(g, t, dt, M); } catch (e) { console.warn('wlp6', e); }
      g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      if (!impacted && t >= scene.impactT) {
        impacted = true; try { scene.onImpact && scene.onImpact(); } catch (e) {}
        try { if (typeof window.hitCamp === 'function') window.hitCamp(V, 'warlord_' + w.id, { fx, fy, rot }); } catch (e) {}
        try { if (typeof window.hitScreen === 'function') window.hitScreen(V, 'warlord', fx, fy, rot, true); } catch (e) {}
        try { navigator.vibrate && navigator.vibrate(w.id === 'lvbu' ? [90, 40, 220] : [40, 30, 90]); } catch (e) {}
        shakeAmp = Math.max(shakeAmp, M.S * (scene.shake || 0)); shakeT = 0; if (scene.hitstop) freeze = scene.hitstop;
      }
      if (cvB) { if (shakeAmp > .2) { shakeT += rdt; const d = Math.max(0, 1 - shakeT / .55) * shakeAmp, sx = d * Math.sin(shakeT * 90), sy = d * Math.cos(shakeT * 83); cvB.style.transform = d > .2 ? `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)` : ''; if (shakeT > .6) { shakeAmp = 0; cvB.style.transform = ''; } } }
      if (t < scene.dur || W6.debugT != null) requestAnimationFrame(frame); else cleanup();
    }
    requestAnimationFrame(frame);
    setTimeout(cleanup, (scene.dur + 2.5) * 1000 + 1500);
    return true;
  }

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
