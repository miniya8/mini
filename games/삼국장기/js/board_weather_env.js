/* ============================================================================
 * [장기판 환경 특화 모듈 v4 — 부드러운 대기감 · 상시 환경 · 빛 번짐 · 잔상 리본] — 5대 전장이 말 이동·기물 잡기·장군·날씨 변화에 직접 반응
 *   🏜️ 황토 사막  : 모래 먼지 발자국 · 모래 폭발+회오리 · 모래폭풍 · 구름 그림자 · 먼지 회오리 행렬
 *   ❄️ 설원 얼음성 : 서리 결정 궤적 · 얼음 파쇄+결빙 · 눈보라 · 오로라 개방 · 다이아몬드 더스트
 *   🌲 고대 숲 유적 : 낙엽·포자 궤적 · 신목 뿌리 폭발+꽃 개화 · 소나기 · 안개 흐름 · 반딧불 군무
 *   🏯 암흑 성채  : 마기 불씨 궤적 · 암흑 화염 폭발+용암 균열 · 번개 폭풍 · 용암 분출 · 핏빛 달
 *   ⚔️ 삼국지 고성 : 황금 불꽃 궤적 · 전고 충격파+참격 · 화살비 · 출정 북소리 · 노을
 * ============================================================================ */
(function jgEnvSpecialV3(){
  if (window.__JG_ENV3__) return;
  window.__JG_ENV3__ = true;
  const E3 = window.jgEnv3 = { enabled: true, sfx: true, weather: true };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm01 = k => k * k * (3 - 2 * k);
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);

  let cvO = null, go = null, Wd = 0, Hd = 0;
  const PS = [], FX = [], SPAWN = [], DEC = [];
  let wx = null, nextWx = 0, lastJang = null, lastT = 0, flash = 0, flashCol = '255,255,255', label = null;
  let tintA = 0, tintCol = '0,0,0', flashX = null, flashY = null, rib = [];
  const amb = {};
  E3.ambient = true;

  /* ---------- 부드러운 원형 스프라이트 캐시 (고성능 파티클) ---------- */
  const spriteCache = {};
  function puffSprite(col) {
    const key = col.join(',');
    if (spriteCache[key]) return spriteCache[key];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${key},1)`); gr.addColorStop(.18, `rgba(${key},.82)`); gr.addColorStop(.38, `rgba(${key},.5)`); gr.addColorStop(.6, `rgba(${key},.22)`); gr.addColorStop(.82, `rgba(${key},.06)`); gr.addColorStop(1, `rgba(${key},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (spriteCache[key] = c);
  }

  /* 가장자리가 자연스럽게 사라지는 타원형 대기 색감 */
  function atmo(g, col, a, cx, cy, rx, ry) {
    if (a <= 0.003) return;
    g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, rx * .1, 0, 0, rx);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.5, `rgba(${col},${a * .72})`); gr.addColorStop(.8, `rgba(${col},${a * .28})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  }
  function glow(g, col, a, x, y, r) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.max(0, a); g.drawImage(puffSprite(col), x - r, y - r, r * 2, r * 2); g.restore(); }

  /* ---------- 사운드 (아주 작은 합성음, 환경특화 버튼으로 끌 수 있음) ---------- */
  function ac() {
    try {
      if (!E3.sfx) return null;
      if (typeof AC === 'undefined' || !AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function noiseBurst(dur, ftype, f0, f1, vol, Q) {
    const a = ac(); if (!a) return;
    try {
      const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.4);
      const s = a.createBufferSource(); s.buffer = b;
      const f = a.createBiquadFilter(); f.type = ftype; f.Q.value = Q || 1; f.frequency.setValueAtTime(f0, a.currentTime); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), a.currentTime + dur);
      const g = a.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
    } catch (e) {}
  }
  function tone(type, f0, f1, dur, vol, delay) {
    const a = ac(); if (!a) return;
    try {
      const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02);
    } catch (e) {}
  }
  const SFX = {
    impact: [
      () => { noiseBurst(.55, 'lowpass', 1100, 160, .22, 1); tone('sine', 90, 40, .4, .14); },
      () => { noiseBurst(.4, 'highpass', 3800, 2500, .15, 1); tone('sine', 2100, 900, .3, .05); tone('triangle', 1500, 700, .22, .04, .05); },
      () => { noiseBurst(.3, 'bandpass', 1600, 900, .12, 2); tone('sine', 520, 820, .25, .05); tone('sine', 780, 1170, .25, .04, .08); },
      () => { tone('sawtooth', 130, 42, .55, .16); noiseBurst(.45, 'lowpass', 900, 120, .17, 1); },
      () => { tone('sine', 120, 52, .4, .3); noiseBurst(.14, 'bandpass', 3200, 2200, .09, 3); }
    ],
    check: [
      () => noiseBurst(1.3, 'bandpass', 500, 2400, .13, .8),
      () => { noiseBurst(1.5, 'bandpass', 900, 400, .11, .7); tone('sine', 1800, 2400, .5, .03); },
      () => noiseBurst(1.2, 'bandpass', 1200, 700, .10, .6),
      () => { noiseBurst(1.1, 'lowpass', 1400, 80, .3, 1); tone('sawtooth', 70, 30, .9, .14); },
      () => { tone('sine', 120, 52, .35, .32); tone('sine', 120, 52, .35, .32, .32); tone('sine', 100, 44, .5, .36, .64); }
    ]
  };

  /* ---------- 오버레이 캔버스 ---------- */
  function ensureCanvas() {
    if (cvO) return true;
    if (!document.body) return false;
    cvO = document.createElement('canvas');
    cvO.id = 'jg_env3_cv';
    cvO.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:12;';
    document.body.appendChild(cvO);
    go = cvO.getContext('2d');
    return true;
  }
  const gameVisible = () => {
    const g = document.getElementById('g');
    return !!g && g.style.display !== 'none' && typeof cv !== 'undefined' && !!cv && cv.offsetWidth > 0 && cv.offsetHeight > 0;
  };
  /* 장기판 좌표(게임 캔버스 기준) → 화면 좌표 */
  let RC = { left: 0, top: 0 };
  const P = (gx, gy) => { const p = px(gx, gy); return [RC.left + p[0], RC.top + p[1]]; };
  const BR = () => ({ x: RC.left + OX, y: RC.top + OY, w: 8 * CX, h: 9 * CY });

  /* ---------- 파티클 ---------- */
  function sp(type, x, y, o) {
    const p = Object.assign({ type, x, y, vx: 0, vy: 0, ay: 0, drag: 1, age: 0, life: 1, size: 4, a: 1, grow: 0, rot: 0, vr: 0, col: [255, 255, 255], add: false, len: 0, sway: 0, swf: 1, ph: 0 }, o || {});
    if (PS.length > 520) PS.shift();
    PS.push(p); return p;
  }
  function drawParticle(g, p) {
    const k = p.age / p.life, a = (p.fadeIn ? Math.min(1, k * 6) : 1) * (1 - k * k) * p.a;
    if (a <= 0.004) return;
    const s = p.size * (1 + p.grow * k);
    g.globalAlpha = a;
    switch (p.type) {
      case 'puff': { const sp0 = puffSprite(p.col); g.drawImage(sp0, p.x - s, p.y - s, s * 2, s * 2); break; }
      case 'dot': { g.fillStyle = `rgb(${p.col})`; g.beginPath(); g.arc(p.x, p.y, Math.max(.6, s), 0, TAU); g.fill(); break; }
      case 'streak': { g.strokeStyle = `rgb(${p.col})`; g.lineWidth = Math.max(.8, s); g.lineCap = 'round'; const l = p.len, m = Math.hypot(p.vx, p.vy) || 1; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx / m * l, p.y - p.vy / m * l); g.stroke(); break; }
      case 'shard': { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = `rgb(${p.col})`; g.beginPath(); g.moveTo(s, 0); g.lineTo(-s * .6, s * .55); g.lineTo(-s * .35, -s * .6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = .8; g.stroke(); g.restore(); break; }
      case 'leaf': { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = `rgb(${p.col})`; g.beginPath(); g.ellipse(0, 0, s, s * .46, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(20,60,20,.45)'; g.lineWidth = .7; g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.stroke(); g.restore(); break; }
      case 'crystal': { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.strokeStyle = `rgb(${p.col})`; g.lineWidth = Math.max(.9, s * .16); g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < 3; i++) { const an = i * Math.PI / 3; g.moveTo(Math.cos(an) * s, Math.sin(an) * s); g.lineTo(-Math.cos(an) * s, -Math.sin(an) * s); } g.stroke(); g.restore(); break; }
      case 'petal': { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = `rgb(${p.col})`; g.beginPath(); g.ellipse(0, 0, s, s * .55, 0, 0, TAU); g.fill(); g.restore(); break; }
    }
  }
  function updateParticles(dt) {
    for (let i = PS.length - 1; i >= 0; i--) {
      const p = PS[i]; p.age += dt;
      if (p.age >= p.life) { PS.splice(i, 1); continue; }
      if (p.orbit) {
        p.ang += p.angV * dt; p.rad += p.radV * dt; p.cy -= p.rise * dt;
        p.x = p.cx + Math.cos(p.ang) * p.rad; p.y = p.cy + Math.sin(p.ang) * p.rad * .42;
      } else {
        p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.ay * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.sway) p.x += Math.sin(p.age * p.swf + p.ph) * p.sway * dt;
      }
    }
  }
  function orbitBurst(cx, cy, n, col, rad0, rad1, rise, life, size) {
    for (let i = 0; i < n; i++) {
      const p = sp('puff', cx, cy, { col, size, a: .55, life: life * rnd(.7, 1.1), grow: .6 });
      p.orbit = true; p.cx = cx; p.cy = cy; p.ang = rnd(0, TAU); p.angV = rnd(5, 9); p.rad = rnd(rad0, rad0 * 1.4); p.radV = (rad1 - rad0) / life; p.rise = rise * rnd(.6, 1.2);
    }
  }

  /* ---------- 고정 효과(링/덩굴/번개/참격) ---------- */
  function ring(x, y, r0, r1, life, col, lw, flat, delay) { FX.push({ k: 'ring', x, y, r0, r1, life, age: -(delay || 0), col, lw, flat: flat || 1 }); }
  function bolt(x0, y0, x1, y1, life, col, w) {
    const pts = [[x0, y0]], n = 9, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (let i = 1; i < n; i++) { const t = i / n, off = rnd(-1, 1) * L * .07; pts.push([x0 + dx * t + nx * off, y0 + dy * t + ny * off]); }
    pts.push([x1, y1]);
    FX.push({ k: 'bolt', pts, life, age: 0, col, w });
  }
  function vines(x, y, n, len, life) {
    const arms = [];
    for (let i = 0; i < n; i++) arms.push({ ang: i / n * TAU + rnd(-.25, .25), len: len * rnd(.7, 1.15), curl: rnd(-1.1, 1.1) });
    FX.push({ k: 'vine', x, y, arms, life, age: 0 });
  }
  function slash(x, y, ang, len, life, col) { FX.push({ k: 'slash', x, y, ang, len, life, age: 0, col }); }
  function drawFX(g, f) {
    const k = f.age / f.life; if (k < 0 || k > 1) return;
    if (f.k === 'ring') {
      const e = 1 - Math.pow(1 - k, 3), r = f.r0 + (f.r1 - f.r0) * e;
      g.save(); g.translate(f.x, f.y); g.scale(1, f.flat); g.strokeStyle = `rgba(${f.col},${(1 - k) * .9})`; g.lineWidth = Math.max(1, f.lw * (1 - k * .7)); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
      g.fillStyle = `rgba(${f.col},${(1 - k) * .08})`; g.fill(); g.restore();
    } else if (f.k === 'bolt') {
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineJoin = 'round'; g.lineCap = 'round';
      const a = (1 - k) * (Math.random() < .25 ? .55 : 1);
      g.strokeStyle = `rgba(${f.col},${a * .35})`; g.lineWidth = f.w * 4; g.beginPath(); f.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = f.w; g.beginPath(); f.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); g.restore();
    } else if (f.k === 'vine') {
      const grow = Math.min(1, f.age / (f.life * .45)), a = f.age < f.life * .6 ? 1 : 1 - (f.age - f.life * .6) / (f.life * .4);
      g.save(); g.lineCap = 'round'; g.globalAlpha = Math.max(0, a);
      f.arms.forEach(m => {
        const steps = 14, L = m.len * grow; g.strokeStyle = '#3fae4e'; g.lineWidth = Math.max(1.6, L * .07); g.beginPath(); g.moveTo(f.x, f.y);
        for (let i = 1; i <= steps; i++) { const t = i / steps, an = m.ang + m.curl * t * 1.4, r = L * t; g.lineTo(f.x + Math.cos(an) * r, f.y + Math.sin(an) * r * .75); }
        g.stroke();
        g.strokeStyle = '#a5f58a'; g.lineWidth = Math.max(.8, L * .02); g.stroke();
        const ex = f.x + Math.cos(m.ang + m.curl * 1.4) * L, ey = f.y + Math.sin(m.ang + m.curl * 1.4) * L * .75;
        g.fillStyle = '#c8ff9e'; g.beginPath(); g.arc(ex, ey, Math.max(1.5, L * .05), 0, TAU); g.fill();
      }); g.restore();
    } else if (f.k === 'pillar') {
      const e = Math.min(1, k * 3.2), a = (1 - k) * (1 - k), h = f.h * e, w = f.w * (1 - k * .4);
      g.save(); g.globalCompositeOperation = 'lighter';
      const lg = g.createLinearGradient(0, f.y, 0, f.y - h); lg.addColorStop(0, `rgba(${f.col},${.8 * a})`); lg.addColorStop(.6, `rgba(${f.col},${.28 * a})`); lg.addColorStop(1, `rgba(${f.col},0)`);
      g.fillStyle = lg; g.beginPath(); g.moveTo(f.x - w, f.y); g.lineTo(f.x - w * .3, f.y - h); g.lineTo(f.x + w * .3, f.y - h); g.lineTo(f.x + w, f.y); g.closePath(); g.fill(); g.restore();
    } else if (f.k === 'slash') {
      g.save(); g.translate(f.x, f.y); g.rotate(f.ang); g.globalCompositeOperation = 'lighter';
      const e = 1 - Math.pow(1 - Math.min(1, k * 2.2), 3), L = f.len * e, a = 1 - k;
      const lg = g.createLinearGradient(-L, 0, L, 0); lg.addColorStop(0, `rgba(${f.col},0)`); lg.addColorStop(.5, `rgba(255,255,255,${a})`); lg.addColorStop(1, `rgba(${f.col},0)`);
      g.fillStyle = lg; g.beginPath(); g.moveTo(-L, 0); g.quadraticCurveTo(0, -f.len * .16 * (1 - k * .6), L, 0); g.quadraticCurveTo(0, f.len * .04, -L, 0); g.fill(); g.restore();
    }
  }

  /* ---------- 장기판 바닥에 남는 환경 흔적 (장기알 아래에 그려짐) ---------- */
  function addDecal(gx, gy, theme) { DEC.push({ gx, gy, theme, born: performance.now() }); if (DEC.length > 16) DEC.shift(); }
  function drawDecals(g, now) {
    if (!E3.enabled) return;
    for (let i = DEC.length - 1; i >= 0; i--) {
      const d = DEC[i], age = (now - d.born) / 1000, life = 9;
      if (age > life) { DEC.splice(i, 1); continue; }
      const a = (age < .4 ? age / .4 : 1) * (age > life - 2.5 ? (life - age) / 2.5 : 1);
      const [X, Y] = px(d.gx, d.gy), r = C * .66;
      g.save(); g.translate(X, Y); g.globalAlpha = a * .9;
      if (d.theme === 0) { /* 모래 더미 + 물결 무늬 */
        const gr = g.createRadialGradient(0, 0, r * .1, 0, 0, r); gr.addColorStop(0, 'rgba(232,196,128,.75)'); gr.addColorStop(1, 'rgba(210,160,90,0)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r, r * .8, 0, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(120,80,35,.45)'; g.lineWidth = 1.2; for (let k = 1; k <= 3; k++) { g.beginPath(); g.ellipse(0, 0, r * k * .3, r * k * .24, 0, .2, Math.PI * 1.6); g.stroke(); }
      } else if (d.theme === 1) { /* 결빙: 육각 서리 결정 */
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(210,245,255,.65)'); gr.addColorStop(1, 'rgba(120,210,255,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(240,253,255,.85)'; g.lineWidth = 1.3; g.beginPath();
        for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; g.moveTo(0, 0); g.lineTo(Math.cos(an) * r * .95, Math.sin(an) * r * .95); const bx = Math.cos(an) * r * .55, by = Math.sin(an) * r * .55; g.moveTo(bx, by); g.lineTo(bx + Math.cos(an + .9) * r * .28, by + Math.sin(an + .9) * r * .28); g.moveTo(bx, by); g.lineTo(bx + Math.cos(an - .9) * r * .28, by + Math.sin(an - .9) * r * .28); }
        g.stroke();
      } else if (d.theme === 2) { /* 개화: 꽃잎 5장 */
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(120,255,160,.45)'); gr.addColorStop(1, 'rgba(60,200,100,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
        for (let k = 0; k < 5; k++) { g.save(); g.rotate(k / 5 * TAU + .3); g.fillStyle = k % 2 ? 'rgba(255,230,240,.9)' : 'rgba(255,170,205,.9)'; g.beginPath(); g.ellipse(r * .34, 0, r * .3, r * .15, 0, 0, TAU); g.fill(); g.restore(); }
        g.fillStyle = 'rgba(255,240,140,.95)'; g.beginPath(); g.arc(0, 0, r * .12, 0, TAU); g.fill();
      } else if (d.theme === 3) { /* 용암 균열: 맥동하는 붉은 금 */
        const pulse = .6 + .4 * Math.sin(now * .006 + d.born);
        g.strokeStyle = `rgba(255,${90 + 60 * pulse | 0},40,${.85 * pulse})`; g.lineWidth = 2; g.shadowColor = '#ff3d00'; g.shadowBlur = 8; g.beginPath();
        for (let k = 0; k < 7; k++) { const an = k / 7 * TAU + d.born % 1; let x = 0, y = 0; g.moveTo(0, 0); for (let s = 0; s < 3; s++) { const l = r * (.34 + s * .12); x += Math.cos(an + (s % 2 ? .35 : -.3)) * l; y += Math.sin(an + (s % 2 ? .35 : -.3)) * l; g.lineTo(x, y); } }
        g.stroke();
      } else { /* 고성: 그을린 균열 + 불씨 */
        g.strokeStyle = 'rgba(30,18,10,.8)'; g.lineWidth = 1.6; g.beginPath();
        for (let k = 0; k < 8; k++) { const an = k / 8 * TAU + .2; g.moveTo(0, 0); g.lineTo(Math.cos(an) * r * .5, Math.sin(an) * r * .5); g.lineTo(Math.cos(an + .3) * r * .9, Math.sin(an + .3) * r * .9); }
        g.stroke();
        const em = .5 + .5 * Math.sin(now * .008 + d.born); g.fillStyle = `rgba(255,190,70,${.7 * em})`;
        for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(Math.cos(k * 1.7) * r * .45, Math.sin(k * 2.3) * r * .4, 1.6, 0, TAU); g.fill(); }
      }
      g.restore();
    }
  }

  /* ---------- 이동 궤적 (테마별) ---------- */
  function trail(x, y, theme, side, dt) {
    const s = C;
    if (theme === 0) {
      sp('puff', x + rnd(-3, 3), y + s * .28, { col: [215, 170, 100], size: s * rnd(.16, .26), a: .5, life: rnd(.55, .9), vy: rnd(-14, -4), vx: rnd(-12, 12), grow: 1.6 });
      if (Math.random() < .5) sp('dot', x, y + s * .3, { col: [150, 105, 55], size: rnd(.8, 1.6), a: .9, life: .5, vx: rnd(-40, 40), vy: rnd(-45, -15), ay: 160 });
    } else if (theme === 1) {
      sp('dot', x + rnd(-s * .25, s * .25), y + rnd(-s * .1, s * .3), { col: [230, 252, 255], size: rnd(.9, 2), a: .95, life: rnd(.4, .8), vx: rnd(-10, 10), vy: rnd(-12, 6), add: true });
      if (Math.random() < .4) sp('crystal', x + rnd(-s * .3, s * .3), y + s * .2, { col: [200, 240, 255], size: rnd(s * .06, s * .12), a: .9, life: rnd(.5, .9), vr: rnd(-3, 3), vy: 8 });
    } else if (theme === 2) {
      if (Math.random() < .6) sp('leaf', x + rnd(-s * .2, s * .2), y + s * .1, { col: pick([[90, 190, 80], [140, 210, 80], [210, 190, 70], [70, 160, 90]]), size: rnd(s * .07, s * .12), a: .95, life: rnd(.8, 1.3), vx: rnd(-26, 26), vy: rnd(-26, -6), ay: 28, vr: rnd(-5, 5), rot: rnd(0, TAU) });
      sp('dot', x + rnd(-s * .3, s * .3), y + rnd(-s * .2, s * .25), { col: [170, 255, 190], size: rnd(1, 2), a: .9, life: rnd(.6, 1.1), vy: rnd(-22, -8), add: true });
    } else if (theme === 3) {
      sp('dot', x + rnd(-s * .22, s * .22), y + s * .2, { col: pick([[255, 70, 90], [200, 60, 255], [255, 130, 60]]), size: rnd(1, 2.4), a: 1, life: rnd(.5, 1), vx: rnd(-18, 18), vy: rnd(-48, -16), add: true });
      if (Math.random() < .5) sp('puff', x + rnd(-6, 6), y + s * .1, { col: [40, 10, 55], size: s * rnd(.14, .22), a: .5, life: rnd(.6, 1), vy: rnd(-18, -6), grow: 1.3 });
    } else {
      sp('dot', x + rnd(-s * .22, s * .22), y + s * .22, { col: [255, 215, 90], size: rnd(1, 2.2), a: 1, life: rnd(.4, .85), vx: rnd(-26, 26), vy: rnd(-40, -10), ay: 70, add: true });
      const rc = side === 'h' ? [255, 90, 70] : [70, 230, 210];
      sp('puff', x, y + s * .05, { col: rc, size: s * rnd(.14, .2), a: .35, life: .45, grow: .8, add: true });
    }
  }

  /* ---------- 기물 잡기 충격 (테마별) ---------- */
  function impact(gx, gy, theme) {
    const [x, y] = P(gx, gy), s = C * 1.35;
    addDecal(gx, gy, theme);
    try { SFX.impact[theme](); } catch (e) {}
    const bright = [[255, 225, 160], [200, 245, 255], [190, 255, 190], [255, 120, 170], [255, 225, 130]][theme];
    sp('puff', x, y, { col: bright, size: s * 1.8, a: .95, life: .3, add: true });
    sp('puff', x, y, { col: bright, size: s * 3.2, a: .38, life: .85, grow: .5, add: true });
    FX.push({ k: 'pillar', x, y: y + s * .1, h: s * 3.8, w: s * .42, life: .62, age: 0, col: bright.join(',') });
    flashX = x; flashY = y; flash = Math.max(flash, .1); flashCol = bright.join(',');
    if (theme === 0) { /* 모래 폭발 + 회오리 */
      for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + rnd(-.2, .2), v = rnd(60, 180); sp('puff', x, y + s * .1, { col: [225, 178, 105], size: s * rnd(.24, .4), a: .9, life: rnd(.7, 1.2), vx: Math.cos(a) * v, vy: Math.sin(a) * v * .55 - 20, drag: .93, grow: 1.5 }); }
      for (let i = 0; i < 44; i++) { const a = rnd(0, TAU), v = rnd(80, 300); sp('dot', x, y, { col: [180, 130, 70], size: rnd(.9, 2.2), a: 1, life: rnd(.6, 1.2), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, ay: 520 }); }
      ring(x, y + s * .12, s * .1, s * 1.5, .75, '240,200,130', s * .09, .45);
      orbitBurst(x, y + s * .1, 26, [225, 185, 115], s * .12, s * .55, s * 1.3, 1.3, s * .16);
    } else if (theme === 1) { /* 얼음 파쇄 + 결빙 */
      for (let i = 0; i < 26; i++) { const a = rnd(0, TAU), v = rnd(90, 320); sp('shard', x, y, { col: pick([[200, 245, 255], [150, 220, 255], [235, 252, 255]]), size: rnd(s * .07, s * .17), a: 1, life: rnd(.7, 1.3), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 110, ay: 480, vr: rnd(-12, 12), rot: rnd(0, TAU) }); }
      for (let i = 0; i < 7; i++) { const a = rnd(0, TAU), v = rnd(40, 150); sp('crystal', x, y, { col: [230, 252, 255], size: rnd(s * .1, s * .2), a: 1, life: rnd(.8, 1.4), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, ay: 120, vr: rnd(-4, 4), add: true }); }
      ring(x, y, s * .1, s * 1.4, .7, '190,240,255', s * .1, .6); ring(x, y, s * .05, s * .8, .5, '255,255,255', s * .06, .6, .08);
      sp('puff', x, y, { col: [200, 245, 255], size: s * 1.1, a: .8, life: .35, add: true });
    } else if (theme === 2) { /* 신목 뿌리 폭발 + 개화 */
      vines(x, y, 8, s * 1.15, 1.7);
      for (let i = 0; i < 30; i++) { const a = rnd(0, TAU), v = rnd(70, 240); sp(Math.random() < .75 ? 'leaf' : 'petal', x, y, { col: pick([[90, 200, 90], [150, 220, 90], [255, 190, 215], [255, 235, 240]]), size: rnd(s * .07, s * .14), a: 1, life: rnd(.9, 1.6), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 70, ay: 120, drag: .96, vr: rnd(-8, 8), rot: rnd(0, TAU) }); }
      for (let i = 0; i < 16; i++) sp('dot', x, y, { col: [180, 255, 190], size: rnd(1, 2.5), a: 1, life: rnd(.8, 1.5), vx: rnd(-80, 80), vy: rnd(-120, -20), add: true });
      ring(x, y, s * .1, s * 1.3, .8, '130,255,170', s * .09, .6);
    } else if (theme === 3) { /* 암흑 화염 폭발 + 마기 번개 */
      for (let i = 0; i < 16; i++) { const a = rnd(-Math.PI * .95, -Math.PI * .05), v = rnd(70, 250); sp('puff', x, y, { col: pick([[255, 80, 60], [255, 140, 50], [190, 60, 255], [255, 60, 120]]), size: s * rnd(.2, .38), a: .75, life: rnd(.6, 1.1), vx: Math.cos(a) * v * .6, vy: Math.sin(a) * v, drag: .95, grow: 1.3, add: true }); }
      for (let i = 0; i < 40; i++) { const a = rnd(0, TAU), v = rnd(80, 260); sp('dot', x, y, { col: pick([[255, 160, 60], [255, 70, 90]]), size: rnd(1, 2.4), a: 1, life: rnd(.5, 1.1), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, ay: 280, add: true }); }
      for (let i = 0; i < 3; i++) { const a = rnd(0, TAU); bolt(x, y, x + Math.cos(a) * s * 1.5, y + Math.sin(a) * s * 1.1, .35, '200,90,255', 2); }
      ring(x, y, s * .08, s * 1.4, .7, '255,70,80', s * .09, .5); ring(x, y, s * .05, s * .9, .5, '190,70,255', s * .06, .5, .07);
      flash = Math.max(flash, .16); flashCol = '255,80,120';
    } else { /* 전고 충격파 + 참격 */
      ring(x, y, s * .12, s * 1.6, .8, '255,215,110', s * .1, .55); ring(x, y, s * .08, s * 1.05, .6, '255,255,230', s * .06, .55, .1);
      slash(x, y, -.6, s * 1.9, .45, '255,215,110'); slash(x, y, .6, s * 1.9, .45, '255,170,90'); slash(x, y, Math.PI * .5, s * 1.5, .4, '255,240,180');
      for (let i = 0; i < 38; i++) { const a = rnd(0, TAU), v = rnd(100, 320); sp('dot', x, y, { col: pick([[255, 220, 100], [255, 160, 70], [255, 245, 200]]), size: rnd(1, 2.4), a: 1, life: rnd(.4, .9), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, ay: 260, add: true }); }
      sp('puff', x, y, { col: [255, 220, 130], size: s * 1.0, a: .8, life: .3, add: true });
    }
  }

  /* ---------- 장군(체크) 반응 ---------- */
  function addSpawner(life, fn) { SPAWN.push({ age: 0, life, fn }); }
  function checkFx(kx, ky, mate) {
    const theme = window.curBoardIdx || 0, B0 = BR(), S = Math.min(Wd, Hd), big = mate ? 1.6 : 1;
    flashX = kx; flashY = ky;
    { const br = [[255, 225, 160], [200, 245, 255], [190, 255, 190], [255, 120, 170], [255, 225, 130]][theme]; FX.push({ k: 'pillar', x: kx, y: ky + C * .2, h: C * 5, w: C * .6, life: .9, age: 0, col: br.join(',') }); glow(go, br, .0, kx, ky, 1); sp('puff', kx, ky, { col: br, size: C * 2.6, a: .7, life: .6, grow: .6, add: true }); }
    try { SFX.check[theme](); } catch (e) {}
    if (theme === 0) { /* 모래폭풍 돌풍 */
      addSpawner(2.4 * big, (dt, k) => { for (let i = 0; i < 6; i++) sp('streak', B0.x - 30, rnd(B0.y, B0.y + B0.h), { col: [225, 180, 110], size: rnd(1, 2.4), len: S * rnd(.07, .16), a: .7, life: rnd(.55, .9), vx: S * rnd(1.4, 2.3), vy: S * rnd(.02, .18) }); if (Math.random() < .4) sp('puff', B0.x - 20, rnd(B0.y, B0.y + B0.h), { col: [215, 170, 100], size: S * rnd(.09, .16), a: .35, life: 1, vx: S * 1.5, grow: 1 }); });
      tintA = Math.max(tintA, .22); tintCol = '210,160,90';
      ring(kx, ky, C * .3, C * 1.6, .9, '240,200,130', C * .07, .5);
    } else if (theme === 1) { /* 눈보라 돌풍 + 서리 */
      addSpawner(2.4 * big, (dt) => { for (let i = 0; i < 7; i++) sp('streak', rnd(B0.x - S * .1, B0.x + B0.w), B0.y - 20, { col: [235, 252, 255], size: rnd(1, 2.2), len: S * rnd(.06, .13), a: .85, life: rnd(.6, 1), vx: S * rnd(.55, .95), vy: S * rnd(.7, 1.2) }); });
      ring(kx, ky, C * .3, C * 1.7, .9, '190,240,255', C * .08, .6); flash = .22; flashCol = '200,240,255'; tintA = Math.max(tintA, .2); tintCol = '170,225,255';
      for (let i = 0; i < 8; i++) sp('crystal', kx, ky, { col: [235, 252, 255], size: rnd(C * .1, C * .2), a: 1, life: 1.1, vx: rnd(-90, 90), vy: rnd(-90, 20), ay: 70, vr: rnd(-4, 4), add: true });
    } else if (theme === 2) { /* 숲바람 낙엽 군무 */
      addSpawner(2.4 * big, (dt) => { for (let i = 0; i < 4; i++) sp('leaf', B0.x - 20, rnd(B0.y, B0.y + B0.h), { col: pick([[90, 190, 80], [150, 215, 80], [215, 190, 70], [70, 160, 90]]), size: rnd(C * .08, C * .15), a: 1, life: rnd(.9, 1.5), vx: S * rnd(.9, 1.6), vy: rnd(-60, 60), vr: rnd(-9, 9), rot: rnd(0, TAU) }); });
      ring(kx, ky, C * .3, C * 1.6, .9, '130,255,170', C * .08, .6); vines(kx, ky, 6, C * .9, 1.3);
    } else if (theme === 3) { /* 하늘에서 내리꽂는 흑뢰 */
      bolt(kx + rnd(-C, C), B0.y - C * 2, kx, ky, .55, '200,90,255', 3.2); bolt(kx + rnd(-C * 2, C * 2), B0.y - C * 2, kx + rnd(-C, C), ky + C * .3, .4, '255,80,120', 2);
      flash = .5; flashCol = '230,200,255'; tintA = Math.max(tintA, .3); tintCol = '40,0,60';
      ring(kx, ky, C * .2, C * 1.8, .8, '255,70,110', C * .09, .5);
      for (let i = 0; i < 24; i++) sp('dot', kx, ky, { col: [255, 90, 150], size: rnd(1, 2.4), a: 1, life: .8, vx: rnd(-170, 170), vy: rnd(-190, 30), ay: 300, add: true });
    } else { /* 전고 3연타 */
      for (let i = 0; i < 3; i++) ring(B0.x + B0.w / 2, B0.y + B0.h / 2, C * .5, Math.max(B0.w, B0.h) * .75, .9, i % 2 ? '255,110,80' : '255,215,110', C * .13, .62, i * .32);
      flash = .22; flashCol = '255,200,100'; tintA = Math.max(tintA, .18); tintCol = '150,40,20';
      ring(kx, ky, C * .3, C * 1.7, .9, '255,215,110', C * .08, .55);
    }
  }

  /* ---------- 환경 이벤트(날씨) ---------- */
  const WX = [
    [ // 사막
      { name: '🌪️ 모래폭풍이 몰려옵니다!', dur: 6.5, draw: 'sandstorm' },
      { name: '☁️ 구름 그림자가 장기판을 스쳐갑니다', dur: 9, draw: 'cloudshadow' },
      { name: '🌀 먼지 회오리 행렬!', dur: 7, draw: 'dustdevils' }],
    [ // 설원
      { name: '🌨️ 눈보라가 휘몰아칩니다!', dur: 7, draw: 'blizzard' },
      { name: '🌌 오로라가 하늘을 수놓습니다', dur: 8, draw: 'aurora' },
      { name: '💎 다이아몬드 더스트가 반짝입니다', dur: 5.5, draw: 'glints' }],
    [ // 숲
      { name: '🌧️ 숲에 소나기가 내립니다', dur: 7, draw: 'rain' },
      { name: '🌫️ 안개가 숲길을 감쌉니다', dur: 9, draw: 'mist' },
      { name: '✨ 반딧불 정령들의 군무!', dur: 8, draw: 'fireflies' }],
    [ // 암흑
      { name: '⚡ 번개 폭풍이 성채를 강타합니다!', dur: 6.5, draw: 'storm' },
      { name: '🌋 용암 지맥이 분출합니다!', dur: 6, draw: 'geyser' },
      { name: '🌑 핏빛 달이 떠오릅니다', dur: 8, draw: 'bloodmoon' }],
    [ // 고성
      { name: '🏹 화살비가 쏟아집니다!', dur: 4.8, draw: 'arrows' },
      { name: '🥁 출정 북소리가 울립니다!', dur: 6.5, draw: 'drums' },
      { name: '🌇 노을이 성을 물들입니다', dur: 8, draw: 'dusk' }]
  ];
  function startWeather(theme, idx) {
    const list = WX[theme] || WX[0], def = list[idx == null ? (Math.random() * list.length) | 0 : idx];
    wx = { def, t0: performance.now(), last: 0, acc: 0, seed: Math.random() * 100, bolts: 0 };
    label = { text: def.name, t0: performance.now() };
    if (def.draw === 'sandstorm') try { SFX.check[0](); } catch (e) {}
    if (def.draw === 'storm') try { tone('sawtooth', 90, 38, .7, .1); } catch (e) {}
    if (def.draw === 'drums') try { tone('sine', 110, 50, .3, .22); } catch (e) {}
  }
  function drawWeather(g, now, dt) {
    if (!wx) return;
    const el = Math.max(0, (now - wx.t0) / 1000), k = el / wx.def.dur;
    if (k >= 1) { wx = null; nextWx = now + rnd(16000, 30000); return; }
    const env = ease(Math.min(1, Math.min(k / .2, (1 - k) / .28))), B0 = BR(), S = Math.min(Wd, Hd), kind = wx.def.draw;
    const tint = (col, a) => atmo(g, col, a, B0.x + B0.w / 2, B0.y + B0.h / 2, B0.w * 1.08, B0.h * .84);
    wx.acc += dt;
    const every = (sec, fn) => { while (wx.acc >= sec) { wx.acc -= sec; fn(); } };
    if (kind === 'sandstorm') {
      tint('210,160,90', .26 * env);
      for (let i = 0; i < Math.ceil(6 * env); i++) sp('streak', B0.x - 30, rnd(B0.y, B0.y + B0.h), { col: [230, 185, 115], size: rnd(1, 2.4), len: S * rnd(.07, .16), a: .6, life: rnd(.6, 1), vx: S * rnd(1.2, 2.2), vy: S * rnd(.02, .2) });
      if (Math.random() < .3 * env) sp('puff', B0.x - 30, rnd(B0.y, B0.y + B0.h), { col: [215, 170, 100], size: S * rnd(.1, .18), a: .3, life: 1.2, vx: S * 1.3, grow: 1 });
    } else if (kind === 'cloudshadow') {
      const gs = puffSprite([0, 0, 0]);
      for (let i = 0; i < 3; i++) { const cx = B0.x - B0.w * .4 + (B0.w * 1.8) * ((k * 1.1 + i * .27) % 1), cy = B0.y + B0.h * (.2 + i * .32), rw = B0.w * (.45 + i * .06), rh = B0.h * .2; g.globalAlpha = .22 * env; g.drawImage(gs, cx - rw, cy - rh, rw * 2, rh * 2); }
      g.globalAlpha = 1;
    } else if (kind === 'dustdevils') {
      for (let d = 0; d < 3; d++) {
        const cx = B0.x + B0.w * ((.1 + d * .33 + k * .5) % 1), cy = B0.y + B0.h * (.25 + d * .25);
        if (Math.random() < .7 * env) orbitBurst(cx, cy, 2, [220, 178, 108], S * .01, S * .06, S * .12, .9, S * .02);
      }
    } else if (kind === 'blizzard') {
      tint('215,238,255', .2 * env);
      for (let i = 0; i < Math.ceil(7 * env); i++) sp('streak', rnd(B0.x - S * .2, B0.x + B0.w), B0.y - 20, { col: [240, 252, 255], size: rnd(1, 2.2), len: S * rnd(.04, .1), a: .8, life: rnd(.7, 1.2), vx: S * rnd(.45, .9), vy: S * rnd(.55, 1.1) });
    } else if (kind === 'aurora') {
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        const bx = B0.x + B0.w * (i / 6), col = i % 3 === 0 ? '90,255,170' : i % 3 === 1 ? '90,210,255' : '190,130,255', h = B0.h * (.3 + .1 * Math.sin(el * 1.3 + i));
        const sway = Math.sin(el * .9 + i * 1.4) * B0.w * .05, gr = g.createLinearGradient(0, B0.y, 0, B0.y + h);
        gr.addColorStop(0, `rgba(${col},${.3 * env})`); gr.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = gr; g.beginPath(); g.moveTo(bx - B0.w * .07 + sway, B0.y); g.lineTo(bx + B0.w * .07 + sway, B0.y); g.lineTo(bx + B0.w * .03 + sway * 1.6, B0.y + h); g.lineTo(bx - B0.w * .03 + sway * 1.6, B0.y + h); g.closePath(); g.fill();
      } g.restore();
    } else if (kind === 'glints') {
      every(.07, () => { sp('crystal', rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), { col: [240, 253, 255], size: rnd(C * .07, C * .17), a: 1, life: rnd(.5, .9), vr: rnd(-2, 2), add: true }); });
    } else if (kind === 'rain') {
      tint('40,70,70', .17 * env);
      for (let i = 0; i < Math.ceil(11 * env); i++) sp('streak', rnd(B0.x - S * .1, B0.x + B0.w + S * .1), B0.y - 20, { col: [190, 225, 245], size: 1, len: S * .05, a: .55, life: rnd(.45, .7), vx: -S * .25, vy: S * 1.5 });
      every(.09, () => ring(rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), 1, C * rnd(.2, .35), .5, '190,230,255', 1.2, .5));
    } else if (kind === 'mist') {
      every(.4, () => sp('puff', B0.x - S * .1, rnd(B0.y, B0.y + B0.h), { col: [225, 245, 232], size: S * rnd(.22, .4), a: .22 * env, life: 6, vx: S * rnd(.06, .12), grow: .5 }));
    } else if (kind === 'fireflies') {
      every(.05, () => sp('dot', rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), { col: pick([[200, 255, 150], [150, 255, 200], [255, 250, 160]]), size: rnd(1.4, 3), a: 1, life: rnd(1.6, 2.8), vx: rnd(-22, 22), vy: rnd(-26, 8), add: true, fadeIn: true }));
    } else if (kind === 'storm') {
      tint('30,10,50', .22 * env);
      wx.bolts -= dt;
      if (wx.bolts <= 0) { wx.bolts = rnd(.5, 1.3); const bx = rnd(B0.x, B0.x + B0.w); bolt(bx, B0.y - C, bx + rnd(-C * 2, C * 2), rnd(B0.y + B0.h * .3, B0.y + B0.h * .9), .4, '200,100,255', 2.6); flash = Math.max(flash, .42); flashCol = '225,200,255'; try { noiseBurst(.9, 'lowpass', 1200, 80, .2, 1); } catch (e) {} }
    } else if (kind === 'geyser') {
      [.2, .5, .8].forEach((f, i) => {
        const vx0 = B0.x + B0.w * f, vy0 = B0.y + B0.h;
        if (Math.random() < .8 * env) { sp('puff', vx0, vy0, { col: [255, 110, 40], size: C * .6, a: .6, life: .35, add: true }); }
        for (let j = 0; j < Math.ceil(3 * env); j++) sp('dot', vx0 + rnd(-C * .3, C * .3), vy0, { col: pick([[255, 140, 50], [255, 80, 40], [255, 200, 90]]), size: rnd(1.2, 3), a: 1, life: rnd(.9, 1.7), vx: rnd(-60, 60), vy: -S * rnd(.4, 1), ay: S * 1.1, add: true });
      });
      const gr = g.createLinearGradient(0, B0.y + B0.h, 0, B0.y + B0.h * .65); gr.addColorStop(0, `rgba(255,70,20,${.28 * env})`); gr.addColorStop(1, 'rgba(255,70,20,0)'); g.fillStyle = gr; g.fillRect(B0.x, B0.y + B0.h * .6, B0.w, B0.h * .4);
    } else if (kind === 'bloodmoon') {
      tint('120,10,20', .13 * env);
      const mx = B0.x + B0.w * .82, my = B0.y + B0.h * .07, mr = S * .07;
      g.save(); g.globalCompositeOperation = 'lighter'; const gs = puffSprite([255, 40, 40]); g.globalAlpha = .5 * env; g.drawImage(gs, mx - mr * 4, my - mr * 4, mr * 8, mr * 8); g.globalAlpha = 1; g.restore();
      g.fillStyle = `rgba(190,20,30,${.75 * env})`; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      every(.12, () => sp('dot', rnd(B0.x, B0.x + B0.w), B0.y - 10, { col: [120, 110, 110], size: rnd(1, 2), a: .7, life: rnd(2, 3.2), vx: rnd(-12, 12), vy: rnd(24, 52) }));
    } else if (kind === 'arrows') {
      every(.07, () => { const ax = rnd(B0.x - S * .1, B0.x + B0.w), ay = B0.y - 30; sp('streak', ax, ay, { col: [240, 225, 170], size: 1.4, len: S * .09, a: .55, life: .6, vx: S * .42, vy: S * 1.25 }); });
    } else if (kind === 'drums') {
      const beat = Math.floor(el / .9);
      if (beat !== wx.lastBeat) { wx.lastBeat = beat; ring(B0.x, B0.y + B0.h * .5, C * .3, B0.w * .55, .85, '255,215,110', C * .12, 1.7); ring(B0.x + B0.w, B0.y + B0.h * .5, C * .3, B0.w * .55, .85, '255,215,110', C * .12, 1.7); flash = Math.max(flash, .08); flashCol = '255,190,90'; tone('sine', 110, 50, .3, .2); }
    } else if (kind === 'dusk') {
      const gr = g.createLinearGradient(0, B0.y, 0, B0.y + B0.h); gr.addColorStop(0, `rgba(255,140,50,${.26 * env})`); gr.addColorStop(1, `rgba(255,90,40,${.06 * env})`); g.fillStyle = gr; g.fillRect(B0.x - C * .5, B0.y - C * .5, B0.w + C, B0.h + C);
      every(.1, () => sp('dot', rnd(B0.x, B0.x + B0.w), B0.y + B0.h * rnd(.5, 1), { col: [255, 200, 100], size: rnd(1, 2.4), a: .9, life: rnd(1.5, 2.6), vy: -rnd(16, 40), vx: rnd(-10, 10), add: true }));
    }
  }


  /* ---------- 상시 환경 (장기판 분위기에 어우러지는 은은한 상시 연출) ---------- */
  function ambientSpawn(dt, theme) {
    if (!E3.ambient || document.hidden || PS.length > 340) return;
    const B0 = BR(), S = Math.min(Wd, Hd);
    const tick = (key, sec, fn) => { amb[key] = (amb[key] || 0) + dt; let n = 0; while (amb[key] >= sec && n++ < 3) { amb[key] -= sec; fn(); } if (amb[key] > sec * 3) amb[key] = 0; };
    const pickc = a => a[(Math.random() * a.length) | 0];
    if (theme === 0) {
      tick('m', .09, () => sp('puff', B0.x - S * .05, rnd(B0.y, B0.y + B0.h), { col: [236, 202, 142], size: rnd(S * .008, S * .02), a: .24, life: rnd(4, 7), vx: S * rnd(.05, .12), vy: rnd(-6, 6), sway: rnd(4, 12), swf: rnd(.8, 2), ph: rnd(0, 6), add: true, fadeIn: true }));
      tick('s', 2.0, () => sp('streak', B0.x - 20, rnd(B0.y, B0.y + B0.h), { col: [240, 206, 142], size: 1.4, len: S * rnd(.1, .2), a: .16, life: 2.6, vx: S * .28, vy: S * .015 }));
    } else if (theme === 1) {
      tick('f1', .06, () => sp('puff', rnd(B0.x - S * .1, B0.x + B0.w + S * .1), B0.y - 12, { col: [240, 252, 255], size: rnd(S * .006, S * .011), a: .75, life: rnd(7, 11), vy: S * rnd(.05, .085), vx: S * rnd(-.012, .02), sway: rnd(6, 16), swf: rnd(.7, 1.6), ph: rnd(0, 6), add: true, fadeIn: true }));
      tick('f2', .4, () => sp('puff', rnd(B0.x, B0.x + B0.w), B0.y - 20, { col: [220, 244, 255], size: rnd(S * .018, S * .034), a: .3, life: 10, vy: S * rnd(.045, .07), sway: rnd(8, 18), swf: rnd(.5, 1), ph: rnd(0, 6), add: true, fadeIn: true }));
      tick('g', .6, () => sp('crystal', rnd(B0.x, B0.x + B0.w), rnd(B0.y, B0.y + B0.h), { col: [240, 253, 255], size: rnd(C * .05, C * .12), a: .9, life: rnd(.7, 1.2), vr: rnd(-1.5, 1.5), add: true }));
    } else if (theme === 2) {
      tick('p', .1, () => sp('puff', rnd(B0.x, B0.x + B0.w), B0.y + B0.h + 10, { col: [255, 246, 172], size: rnd(S * .006, S * .015), a: .55, life: rnd(5, 8), vy: -S * rnd(.02, .05), vx: rnd(-6, 6), sway: rnd(6, 14), swf: rnd(.8, 1.8), ph: rnd(0, 6), add: true, fadeIn: true }));
      tick('l', 2.2, () => sp('leaf', B0.x + rnd(0, B0.w), B0.y - 10, { col: pickc([[90, 190, 80], [150, 212, 80], [215, 190, 70]]), size: rnd(C * .07, C * .11), a: .9, life: 7, vy: S * rnd(.03, .06), vx: S * .02, sway: rnd(14, 28), swf: rnd(1, 2), vr: rnd(-2, 2), rot: rnd(0, TAU) }));
    } else if (theme === 3) {
      tick('e', .09, () => sp('dot', rnd(B0.x, B0.x + B0.w), B0.y + B0.h + 6, { col: pickc([[255, 120, 60], [255, 70, 90], [190, 80, 255]]), size: rnd(1, 2.6), a: .95, life: rnd(3, 6), vy: -S * rnd(.05, .12), vx: rnd(-8, 8), sway: rnd(6, 16), swf: rnd(1, 2.4), ph: rnd(0, 6), add: true }));
      tick('fog', 1.0, () => sp('puff', rnd(B0.x - S * .05, B0.x + B0.w), B0.y + B0.h * rnd(.75, 1.02), { col: [78, 24, 100], size: S * rnd(.14, .26), a: .22, life: 7, vx: S * rnd(-.03, .05), vy: -S * .008, grow: .6, fadeIn: true }));
    } else {
      tick('t', .08, () => { const sx = Math.random() < .5 ? B0.x - C * .2 : B0.x + B0.w + C * .2; sp('dot', sx, B0.y + B0.h * rnd(.15, .9), { col: pickc([[255, 210, 110], [255, 160, 70], [255, 240, 190]]), size: rnd(1, 2.4), a: .95, life: rnd(1.8, 3.4), vy: -S * rnd(.04, .1), vx: rnd(-10, 10), sway: rnd(6, 12), swf: rnd(1.4, 2.8), ph: rnd(0, 6), add: true }); });
      tick('sm', .9, () => { const sx = Math.random() < .5 ? B0.x - C * .15 : B0.x + B0.w + C * .15; sp('puff', sx, B0.y + B0.h * rnd(.2, .9), { col: [165, 150, 138], size: S * rnd(.05, .09), a: .13, life: 4, vy: -S * .03, vx: rnd(-6, 6), grow: 1.1, fadeIn: true }); });
    }
  }
  function ambientDraw(g, now, theme) {
    if (!E3.ambient) return;
    const B0 = BR(), S = Math.min(Wd, Hd), t = now * .001;
    if (theme === 0) {
      glow(g, [255, 226, 150], .13 + .05 * Math.sin(t * .8), B0.x + B0.w * .9, B0.y - C * .3, B0.w * .95);
    } else if (theme === 1) {
      glow(g, [190, 235, 255], .10 + .04 * Math.sin(t * .6), B0.x + B0.w * (.3 + .1 * Math.sin(t * .15)), B0.y + B0.h * .05, B0.w * .9);
      glow(g, [225, 250, 255], .05 + .03 * Math.sin(t * .9 + 2), B0.x + B0.w * .85, B0.y + B0.h * .8, B0.w * .7);
    } else if (theme === 2) {
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const bx = B0.x + B0.w * (.12 + i * .34) + Math.sin(t * .25 + i) * B0.w * .03, a = .075 + .035 * Math.sin(t * .7 + i * 1.7), wTop = B0.w * .07, wBot = B0.w * .2;
        const gr = g.createLinearGradient(0, B0.y, 0, B0.y + B0.h * .95); gr.addColorStop(0, `rgba(255,252,195,${a})`); gr.addColorStop(1, 'rgba(255,252,195,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(bx - wTop, B0.y); g.lineTo(bx + wTop, B0.y); g.lineTo(bx + wBot + B0.w * .18, B0.y + B0.h * .95); g.lineTo(bx - wBot + B0.w * .18, B0.y + B0.h * .95); g.closePath(); g.fill();
      } g.restore();
    } else if (theme === 3) {
      const pulse = .7 + .3 * Math.sin(t * 1.5);
      g.save(); g.globalCompositeOperation = 'lighter';
      const gr = g.createLinearGradient(0, B0.y + B0.h * 1.04, 0, B0.y + B0.h * .55); gr.addColorStop(0, `rgba(255,70,40,${.16 * pulse})`); gr.addColorStop(1, 'rgba(255,70,40,0)');
      g.fillStyle = gr; g.fillRect(B0.x - C, B0.y + B0.h * .5, B0.w + C * 2, B0.h * .6);
      g.restore();
      glow(g, [190, 70, 255], .08 * pulse, B0.x + B0.w * .5, B0.y - C * .2, B0.w * .8);
    } else {
      const fl = .8 + .2 * Math.sin(t * 9) * Math.sin(t * 3.7) + .06 * Math.sin(t * 23);
      glow(g, [255, 170, 70], .13 * fl, B0.x - C * .3, B0.y + B0.h * .3, B0.h * .34);
      glow(g, [255, 170, 70], .13 * fl, B0.x + B0.w + C * .3, B0.y + B0.h * .7, B0.h * .34);
      glow(g, [255, 150, 60], .08 * fl, B0.x + B0.w + C * .3, B0.y + B0.h * .25, B0.h * .26);
    }
  }
  const RIBC = [[245, 195, 115], [175, 238, 255], [145, 255, 165], [212, 100, 255], [255, 215, 120]];
  function drawRibbon(g, now, theme) {
    while (rib.length && now - rib[0].t > 480) rib.shift();
    if (rib.length < 2) return;
    const col = RIBC[theme] || RIBC[4];
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < rib.length; i++) {
        const a = rib[i - 1], b = rib[i], k = i / rib.length, age = (now - b.t) / 480, al = Math.max(0, 1 - age) * k;
        g.strokeStyle = pass === 0 ? `rgba(${col},${al * .5})` : `rgba(255,255,255,${al * .75})`;
        g.lineWidth = pass === 0 ? C * .42 * k : C * .12 * k;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
    }
    g.restore();
  }

  /* ---------- 메인 루프 ---------- */
  function frameLoop(now) {
    requestAnimationFrame(frameLoop);
    if (!ensureCanvas()) return;
    const dt = Math.min(.05, Math.max(.001, (now - (lastT || now)) / 1000)); lastT = now;
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (cvO.width !== Math.round(W * dpr) || cvO.height !== Math.round(H * dpr)) { cvO.width = Math.round(W * dpr); cvO.height = Math.round(H * dpr); }
    Wd = W; Hd = H;
    go.setTransform(dpr, 0, 0, dpr, 0, 0); go.clearRect(0, 0, W, H);
    const vis = gameVisible(), fab = document.getElementById('jg_remaster_fab');
    if (fab) fab.style.display = vis ? 'none' : 'flex';   /* 대국 중에는 하단 환경/사활 버튼을 숨겨 채팅창을 가리지 않음 */
    if (!E3.enabled || !vis) { PS.length = 0; FX.length = 0; SPAWN.length = 0; rib.length = 0; wx = null; label = null; return; }
    RC = cv.getBoundingClientRect();
    const inPlay = (typeof inGame !== 'undefined') && inGame && !over;
    const theme = window.curBoardIdx || 0;

    /* 이벤트 감지: 이동/기물 잡기 */
    try {
      const A = (typeof anim !== 'undefined') ? anim : null;
      if (A && A.T) {
        if (!A.__e3) A.__e3 = { imp: false, land: false, acc: 0 };
        const t = now - A.t0, a = A.T[0], b = A.T[1], [X0, Y0] = P(A.m[0], A.m[1]), [X1, Y1] = P(A.m[2], A.m[3]);
        if (t >= a && t < b) {
          const u = clamp((t - a) / A.D, 0, 1), e = u * u * (3 - 2 * u), tx = A.q ? X1 - (X1 > X0 ? 1 : -1) * C * .5 : X1, ty = A.q ? Y1 : Y1;
          const cx_ = X0 + (tx - X0) * e, cy_ = Y0 + (ty - Y0) * e, E = A.__e3;
          if (E.lx == null) { E.lx = cx_; E.ly = cy_; }
          const n = Math.min(4, Math.floor(Math.hypot(cx_ - E.lx, cy_ - E.ly) / (C * .16)));
          for (let i = 1; i <= n; i++) { const f = i / n; trail(E.lx + (cx_ - E.lx) * f, E.ly + (cy_ - E.ly) * f, theme, A.p.s, dt); }
          if (n > 0) { E.lx = cx_; E.ly = cy_; }
          rib.push({ x: cx_, y: cy_, t: now }); if (rib.length > 30) rib.shift();
        }
        if (A.q && !A.__e3.imp && t >= b + 130) { A.__e3.imp = true; impact(A.m[2], A.m[3], theme); }
        if (!A.q && !A.__e3.land && t >= b) { A.__e3.land = true; trail(X1, Y1, theme, A.p.s, dt); trail(X1, Y1, theme, A.p.s, dt); }
      }
      if (typeof jang !== 'undefined' && jang && jang !== lastJang) {
        lastJang = jang;
        let kp = null; for (let y = 0; y < 10 && !kp; y++) for (let x = 0; x < 9; x++) { const q = B[y][x]; if (q && q.t === 'K' && q.s !== jang.s) { kp = [x, y]; break; } }
        if (kp) { const [kx, ky] = P(kp[0], kp[1]); checkFx(kx, ky, !!jang.mate); }
      }
    } catch (e) {}

    /* 환경 이벤트 스케줄 */
    if (E3.weather && inPlay && !wx) { if (!nextWx) nextWx = now + rnd(9000, 16000); else if (now >= nextWx) startWeather(theme); }
    if (!inPlay) { nextWx = 0; }

    /* 클리핑: 장기판 캔버스 영역(상단 HUD 제외) */
    const hudH = (document.getElementById('hud') || {}).offsetHeight || 0;
    go.save(); go.beginPath(); go.rect(RC.left, RC.top + hudH, RC.width, RC.height - hudH); go.clip();

    ambientSpawn(dt, theme); ambientDraw(go, now, theme);
    drawWeather(go, now, dt); drawRibbon(go, now, theme);
    for (let i = SPAWN.length - 1; i >= 0; i--) { const s = SPAWN[i]; s.age += dt; if (s.age > s.life) { SPAWN.splice(i, 1); continue; } try { s.fn(dt, s.age / s.life); } catch (e) {} }
    if (tintA > .004) { atmo(go, tintCol, tintA, RC.left + RC.width / 2, RC.top + RC.height / 2, RC.width * .95, RC.height * .72); tintA *= Math.pow(.25, dt); }
    for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.age += dt; if (f.age > f.life) { FX.splice(i, 1); continue; } drawFX(go, f); }
    updateParticles(dt);
    for (let i = 0; i < PS.length; i++) { const p = PS[i]; if (p.add) { go.globalCompositeOperation = 'lighter'; drawParticle(go, p); go.globalCompositeOperation = 'source-over'; } else drawParticle(go, p); }
    go.globalAlpha = 1;
    if (flash > .004) { const fx = flashX == null ? RC.left + RC.width / 2 : flashX, fy = flashY == null ? RC.top + RC.height / 2 : flashY; go.save(); go.globalCompositeOperation = 'lighter'; const fr = Math.max(RC.width, RC.height) * 1.1, fg = go.createRadialGradient(fx, fy, 0, fx, fy, fr); fg.addColorStop(0, `rgba(${flashCol},${Math.min(1, flash * 2.2)})`); fg.addColorStop(.35, `rgba(${flashCol},${flash * .8})`); fg.addColorStop(1, `rgba(${flashCol},${flash * .12})`); go.fillStyle = fg; go.fillRect(RC.left, RC.top, RC.width, RC.height); go.restore(); flash *= Math.pow(.02, dt); }
    go.restore();

    /* 환경 이벤트 안내 문구 */
    if (label) {
      const el = Math.max(0, (now - label.t0) / 1000), a = el < .4 ? el / .4 : el > 2.6 ? Math.max(0, 1 - (el - 2.6) / .6) : 1;
      if (el > 3.2) label = null; else {
        go.save(); go.globalAlpha = a * .95; go.font = '800 ' + Math.round(Math.max(13, Math.min(W, H) * .034)) + 'px sans-serif'; go.textAlign = 'center';
        const tx = RC.left + RC.width / 2, ty = RC.top + hudH + Math.max(24, Math.min(W, H) * .06);
        const tw = go.measureText(label.text).width + 28, th = Math.max(26, Math.min(W, H) * .056); go.fillStyle = 'rgba(10,8,20,.55)'; go.beginPath(); if (go.roundRect) go.roundRect(tx - tw / 2, ty - th * .72, tw, th, th / 2); else go.rect(tx - tw / 2, ty - th * .72, tw, th); go.fill(); go.strokeStyle = 'rgba(255,240,190,.35)'; go.lineWidth = 1; go.stroke(); go.fillStyle = '#fff6d6'; go.fillText(label.text, tx, ty); go.restore();
      }
    }
  }

  /* ---------- 바닥 흔적을 기존 보드 FX 렌더 단계에 연결 (장기알 아래) ---------- */
  function hookGround() {
    const orig = window.jgDrawBoardThemeFX;
    if (orig && orig.__e3) return;
    window.jgDrawBoardThemeFX = function (g, now) {
      if (typeof orig === 'function') orig.apply(this, arguments);
      try { drawDecals(g, now); } catch (e) {}
    };
    window.jgDrawBoardThemeFX.__e3 = true;
  }

  /* ---------- 컨트롤 버튼 ---------- */
  function addButton() {
    const bar = document.getElementById('jg_remaster_fab');
    if (!bar) return false;
    if (document.getElementById('jg_env3_btn')) return true;
    const b = document.createElement('button');
    b.id = 'jg_env3_btn';
    const refresh = () => { b.innerHTML = '✨ 환경특화 ' + (E3.enabled ? 'ON' : 'OFF'); b.style.opacity = E3.enabled ? 1 : .6; };
    b.style.cssText = 'padding:9px 14px;border-radius:99px;border:1.5px solid #a78bfa;background:rgba(30,20,60,0.92);color:#ede9fe;font-weight:800;font-size:12.5px;cursor:pointer;box-shadow:0 4px 14px #0008;';
    b.onclick = () => { E3.enabled = !E3.enabled; refresh(); };
    refresh(); bar.appendChild(b); return true;
  }

  /* ---------- 외부 API (테스트/수동 실행) ---------- */
  E3.impact = (gx, gy, th) => impact(gx, gy, th == null ? (window.curBoardIdx || 0) : th);
  E3.check = (gx, gy) => { const [x, y] = P(gx == null ? 4 : gx, gy == null ? 1 : gy); checkFx(x, y, false); };
  E3.weatherNow = (idx) => startWeather(window.curBoardIdx || 0, idx);
  E3.trail = (gx, gy) => { const [x, y] = P(gx, gy); trail(x, y, window.curBoardIdx || 0, 'c', .03); };

  hookGround();
  requestAnimationFrame(frameLoop);
  let tries = 0; const iv = setInterval(() => { if (addButton() || ++tries > 60) clearInterval(iv); }, 500);
})();
