/* ============================================================================
 * [응징 스킬 연출 강화 모듈 v1]  js/skill-fx.js
 *  - [이미지 활용] 불 사진 3종(주황/푸른/녹색 변환) + 균열·구멍 이미지 15종(장기판 파손 자국)
 *  - 불이 번지는 화염 시스템 : 점화 → 활활 → 번짐 → 잦아듦 (불꽃·연기·불씨·열기 빛)
 *  - 스킬별 개성 : 핵(대화염+버섯연기+재) · 운석(용암불+파편) · 외계인(녹색 플라즈마+기포)
 *                에네르기파(푸른 불꽃+전류) · 주먹(균열 불씨) · 망치(서리 안개) · 총(총탄 불꽃+연기)
 *  - 기물에 불이 옮겨붙고, 바닥에 그을음/서리/균열 흔적이 남음
 *  - 발동 전 조준 경고, 타격 순간 코믹 이펙트 글자(쾅!, 퍽! …), 작은 효과음
 *  게임 로직(점수·진행)에는 영향을 주지 않는 순수 시각/청각 효과입니다.
 * ============================================================================ */
(function jgSkillFxModule() {
  if (window.__JG_SKILLFX__) return;
  window.__JG_SKILLFX__ = true;
  const SF = window.jgSkillFx = { enabled: true, sfx: true };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const easeOutBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

  /* ---------- 불꽃 색 팔레트 (밝은 심지 → 노랑 → 주황 → 빨강 → 그을음) ---------- */
  const PAL = {
    fire:  [[255, 236, 170], [255, 190, 72], [255, 120, 30], [205, 48, 16], [80, 22, 12]],
    green: [[225, 255, 200], [170, 250, 90], [80, 220, 60], [25, 140, 60], [10, 60, 30]],
    blue:  [[235, 248, 255], [150, 215, 255], [60, 160, 250], [35, 85, 225], [15, 35, 130]],
    frost: [[255, 255, 255], [215, 245, 255], [150, 215, 255], [100, 170, 235], [60, 110, 190]]
  };
  const GLOW = { fire: [255, 150, 60], green: [120, 255, 120], blue: [90, 190, 255], frost: [170, 225, 255] };
  const ARC = { fire: '255,200,120', green: '170,255,150', blue: '170,235,255', frost: '210,240,255' };

  const spriteCache = {};
  function sprite(rgb) {
    const key = rgb.join(',');
    if (spriteCache[key]) return spriteCache[key];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${key},1)`); gr.addColorStop(.2, `rgba(${key},.85)`); gr.addColorStop(.42, `rgba(${key},.5)`);
    gr.addColorStop(.65, `rgba(${key},.2)`); gr.addColorStop(.85, `rgba(${key},.05)`); gr.addColorStop(1, `rgba(${key},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (spriteCache[key] = c);
  }

  /* ---------- 오버레이 캔버스 ---------- */
  let cvO = null, go = null, W = 0, H = 0, RC = { left: 0, top: 0, width: 0, height: 0 };
  function ensureCanvas() {
    if (cvO) return true;
    if (!document.body) return false;
    cvO = document.createElement('canvas'); cvO.id = 'jg_skillfx_cv';
    cvO.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:11;';
    document.body.appendChild(cvO); go = cvO.getContext('2d');
    return true;
  }
  const gameVisible = () => {
    const g = document.getElementById('g');
    return !!g && g.style.display !== 'none' && typeof cv !== 'undefined' && !!cv && cv.offsetWidth > 0 && cv.offsetHeight > 0;
  };
  /* 장기판 좌표(실수 가능) ↔ 화면 좌표 */
  const toScreen = (gx, gy) => { const p = px(gx, gy); return [RC.left + p[0], RC.top + p[1]]; };
  const fromScreen = (sx, sy) => {
    let gx = (sx - RC.left - OX) / CX, gy = (sy - RC.top - OY) / CY;
    if (flip) { gx = 8 - gx; gy = 9 - gy; }
    return [gx, gy];
  };
  /* 진영 영역 (chat.js getCampRect와 동일 규칙) */
  function campRect(side) {
    const isBottom = flip ? (side === 'h') : (side === 'c');
    const ox = RC.left + OX, oy = RC.top + OY, bw = 8 * CX, bh = 4.42 * CY, padX = CX * .42, padY = CY * .42;
    return { x0: ox - padX, w: bw + padX * 2, y0: isBottom ? (oy + 4.55 * CY) : (oy - padY), h: bh + padY, isBottom };
  }
  function inCamp(side, gx, gy) {
    const [sx, sy] = toScreen(gx, gy), r = campRect(side);
    return sx >= r.x0 && sx <= r.x0 + r.w && sy >= r.y0 && sy <= r.y0 + r.h;
  }

  /* ---------- 사운드 (작게) ---------- */
  function ac() {
    try {
      if (!SF.sfx) return null;
      if (typeof AC === 'undefined' || !AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function noise(dur, type, f0, f1, vol, Q) {
    const a = ac(); if (!a) return;
    try {
      const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.3);
      const s = a.createBufferSource(); s.buffer = b;
      const f = a.createBiquadFilter(); f.type = type; f.Q.value = Q || 1; f.frequency.setValueAtTime(f0, a.currentTime); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), a.currentTime + dur);
      const g = a.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
    } catch (e) {}
  }
  const whoosh = (vol) => noise(.9, 'bandpass', 300, 2600, vol || .12, .8);
  const crackle = (vol) => noise(.05 + Math.random() * .05, 'highpass', 2800 + Math.random() * 2000, 1200, vol, 1);

  /* ---------- 데이터 ---------- */
  const PS = [], NODES = [], ARCS = [], RINGS = [], TXT = [], SCORCH = [], SMK = [];
  let zeroSince = 0, ctx = null, warn = null, lastT = 0, flash = 0, flashCol = '255,200,120', flashX = 0, flashY = 0, crackAcc = 0;

  function sp(o) {
    if (PS.length > 760) PS.shift();
    const p = Object.assign({ type: 'dot', x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, age: 0, life: 1, size: 3, a: 1, pal: 'fire', seed: 0, sway: 0, swf: 6, rot: 0, vr: 0, grow: 0 }, o);
    PS.push(p); return p;
  }

  /* ---------- 스킬별 프로필 ---------- */
  const PROF = {
    nuke:   { pal: 'fire',  flame: true, tint: 'o', life: 16, n0: 10, rad: 2.5, r: .44, spread: true,  maxN: 32, smoke: 1.7, ash: true,  scorch: 2.8, pieces: true,  pr: 3.4, txt: ['💥 쾅!!', '☢️ BOOM!!', '🔥 대폭발!'], col: '255,150,60' },
    meteor: { pal: 'fire',  flame: true, tint: 'o', life: 14, n0: 7,  rad: 2.0, r: .42, spread: true,  maxN: 26, smoke: 1.3, scatter: 6, scorch: 2.3, pieces: true,  pr: 2.7, txt: ['☄️ 쿠쾅!!', '🔥 운석 직격!', '🌋 용암 폭발!'], col: '255,120,40' },
    alien:  { pal: 'green', flame: true, tint: 'g', life: 11, n0: 8,  rad: 1.9, r: .44, spread: false, maxN: 22, smoke: .5,  bubbles: true, arcs: true, scorch: 1.9, pieces: true, pr: 2.3, txt: ['👽 지지직!', '🛸 광선 직격!', '☣️ 녹아내린다!'], col: '150,255,120' },
    kame:   { pal: 'blue',  flame: true, tint: 'b', life: 10, n0: 7,  rad: 1.7, r: .44, spread: false, maxN: 18, smoke: .3,  arcs: true,    scorch: 1.7, pieces: true, pr: 2.1, txt: ['🐉 파앗!', '⚡ 에네르기 폭발!', '💥 기가 폭발한다!'], col: '120,200,255' },
    kame2:  { pal: 'blue',  flame: true, tint: 'b', life: 13, n0: 9,  rad: 2.3, r: .5,  spread: false, maxN: 24, smoke: .4,  arcs: true, line: 4, scorch: 2.3, pieces: true, pr: 2.7, txt: ['🌌 콰아앙!!', '💫 파괴 광선!', '⚡ 장기판이 갈라진다!'], col: '130,215,255' },
    warlord:         { pal: 'frost', flame: false, life: 7, n0: 0, rad: 1.5, r: .42, spread: false, maxN: 0, smoke: .35, scorch: 0, pieces: false, pr: 0, txt: ['💥 콰광!!', '⚔️ 군주 필살!', '🌪️ 진영 파쇄!'], col: '253,224,71' },
    warlord_liubei:  { pal: 'frost', flame: false, life: 7, n0: 0, rad: 1.5, r: .42, spread: false, maxN: 0, smoke: .25, scorch: 0, pieces: false, pr: 0, txt: ['⚔️ 쌍검합벽!', '🐉 도원천공참!', '✨ 인의의 일격!'], col: '16,185,129' },
    warlord_lvbu:    { pal: 'frost', flame: false, life: 8, n0: 0, rad: 1.8, r: .48, spread: false, maxN: 0, smoke: .45, scorch: 0, pieces: false, pr: 0, txt: ['⚡ 천하무쌍!', '🔱 방천귀신격!', '💥 대지 붕괴!'], col: '217,70,239' },
    warlord_simayi:  { pal: 'frost', flame: false, life: 7, n0: 0, rad: 1.6, r: .44, spread: false, maxN: 0, smoke: .30, scorch: 0, pieces: false, pr: 0, txt: ['🐺 낭고빙결!', '❄️ 암영파쇄진!', '👁️ 천명 간파!'], col: '129,140,248' },
    warlord_caocao:  { pal: 'frost', flame: false, life: 7, n0: 0, rad: 1.7, r: .45, spread: false, maxN: 0, smoke: .35, scorch: 0, pieces: false, pr: 0, txt: ['⚡ 패왕뇌전!', '⚔️ 천하호령!', '💥 위왕 강림!'], col: '248,113,113' },
    warlord_sunquan: { pal: 'frost', flame: false, life: 7, n0: 0, rad: 1.6, r: .44, spread: false, maxN: 0, smoke: .30, scorch: 0, pieces: false, pr: 0, txt: ['🌊 파천노도!', '⚔️ 강동수군참!', '🌀 해일 강타!'], col: '56,189,248' },
    warlord_zhuge:   { pal: 'frost', flame: false, life: 7, n0: 0, rad: 1.6, r: .44, spread: false, maxN: 0, smoke: .25, scorch: 0, pieces: false, pr: 0, txt: ['🌌 팔진천기!', '🪶 와룡성광포!', '✨ 천기누설!'], col: '253,224,71' },
    skyfall: { pal: 'frost', flame: false, life: 9, n0: 0, rad: 2.0, r: .46, spread: false, maxN: 0, smoke: .35, scorch: 0, pieces: false, pr: 0, txt: ['⚡ 천벌성창!', '🌟 성광 낙뢰!', '💥 대지 분쇄!'], col: '253,224,71' },
    vortex:  { pal: 'blue',  flame: false, life: 9, n0: 0, rad: 2.1, r: .46, spread: false, maxN: 0, smoke: .30, scorch: 0, pieces: false, pr: 0, txt: ['🌀 차원와류포!', '💫 삼각 초신성!', '⚡ 시공 파쇄!'], col: '56,189,248' }
  };


  /* ---------- 이미지 자산 : 불 사진 · 균열/구멍 아틀라스 ---------- */
  const FXDIR = 'assets/images/fx/';
  const FIMG = {};
  ['f1', 'f2', 'f3'].forEach(k => ['o', 'b', 'g'].forEach(t => { const im = new Image(); im.src = FXDIR + k + '_' + t + '.webp'; FIMG[k + '_' + t] = im; }));
  const CATLAS = new Image(); CATLAS.src = FXDIR + 'crack_atlas.webp';
  const CR = [["c4", 0, 0, 154, 149], ["c4", 158, 0, 96, 157], ["c4", 258, 0, 139, 116], ["c4", 401, 0, 134, 100], ["c4", 539, 0, 116, 167], ["c4", 659, 0, 162, 135], ["c4", 825, 0, 162, 99], ["c4", 0, 171, 116, 97], ["c4", 120, 171, 178, 125], ["c4", 302, 171, 135, 128], ["c4", 441, 171, 148, 125], ["c4", 593, 171, 154, 118], ["c5", 0, 303, 360, 250], ["c5", 364, 303, 230, 181], ["c5", 598, 303, 350, 129]];
  const okImg = im => !!im && im.complete && im.naturalWidth > 0;
  const CLS = { small: [7, 9, 3], mid: [0, 2, 6, 8], net: [4, 5, 10, 11, 1], big: [12, 13, 14] };
  const CLSW = { small: .85, mid: 1.5, net: 2.4, big: 3.6 };
  const CRK = [];
  function addCrack(gx, gy, cls, o) {
    const d = Object.assign({ gx, gy, idx: pick(CLS[cls]), cls, sc: 1, rot: rnd(-.6, .6) + (Math.random() < .5 ? 0 : Math.PI), born: performance.now(), delay: 0, life: 1e9, hot: null, hotLife: 12, flipX: Math.random() < .5, seed: rnd(0, 1000) }, o || {});
    /* 파편: 충격 때 튀어나와 구멍 주변에 쌓이는 돌/나무 조각 */
    const nr = { big: 11, mid: 6, small: 2, net: 0 }[cls] || 0; d.rub = [];
    for (let i = 0; i < nr; i++) d.rub.push({ a: rnd(0, TAU), d: rnd(.42, .95), r: rnd(.05, .12), rot: rnd(0, TAU), tone: rnd(0, 1), v: rnd(.7, 1.3) });
    CRK.push(d);
    if (CRK.length > 64) CRK.shift();
  }
  const tintCache = {};
  function tinted(idx, col) {
    const key = idx + '|' + col; if (tintCache[key]) return tintCache[key];
    const r = CR[idx], c = document.createElement('canvas'); c.width = r[3]; c.height = r[4];
    const g = c.getContext('2d'); g.drawImage(CATLAS, r[1], r[2], r[3], r[4], 0, 0, r[3], r[4]);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, r[3], r[4]);
    return (tintCache[key] = c);
  }
  /* 스킬별 균열/구멍 구성 : [종류, 개수, 퍼짐(칸), 크기배율] */
  const CRACKSPEC = {
    nuke:   [['big', 1, 0, 1.0], ['mid', 3, 2.7, 1.1], ['net', 4, 3.5, 1.1], ['small', 4, 3.8, 1]],
    meteor: [['big', 1, 0, .9], ['mid', 2, 2.5, 1], ['net', 3, 3.3, 1], ['small', 3, 3.5, 1]],
    alien:  [['mid', 2, 1.5, .95], ['net', 3, 2.5, .9], ['small', 2, 2.1, .8]],
    kame:   [['mid', 1, 0, 1], ['net', 3, 2.3, 1]],
    kame2:  [['mid', 1, 0, 1.1], ['net', 3, 2.7, 1.1], ['small', 2, 2.1, .9]],
    fist:   [['mid', 1, 0, 1.05], ['net', 2, 1.7, .9]],
    hammer: [['net', 2, 0, 1.2], ['mid', 1, 1.3, .8], ['net', 2, 2.1, 1]],
    gun:    [['small', 1, 0, .85]],
    warlord:         [['big', 1, 0, 0.95], ['mid', 2, 1.8, 0.9], ['net', 3, 2.4, 0.95]],
    warlord_zhuge:   [['big', 1, 0, 0.95], ['net', 4, 2.4, 1.05], ['small', 4, 2.8, 0.9]],
    warlord_sunquan: [['mid', 3, 1.4, 1.05], ['net', 3, 2.2, 1.0]],
    warlord_caocao:  [['mid', 3, 1.6, 1.00], ['net', 4, 2.4, 1.05], ['small', 3, 2.6, 0.85]],
    warlord_liubei:  [['mid', 2, 1.2, 1.00], ['net', 3, 2.1, 0.95], ['small', 2, 2.4, 0.85]],
    warlord_lvbu:    [['big', 1, 0, 1.22], ['mid', 3, 2.3, 1.05], ['net', 5, 3.0, 1.10]],
    warlord_simayi:  [['big', 1, 0, 0.92], ['small', 4, 2.2, 0.95], ['net', 3, 2.5, 1.00]],
    skyfall: [['big', 1, 0, 1.15], ['mid', 3, 2.2, 1.05], ['net', 4, 2.8, 1.05]],
    vortex:  [['big', 1, 0, 1.10], ['mid', 2, 1.8, 1.00], ['net', 4, 2.6, 1.05], ['small', 4, 2.5, 0.90]]
  };
  const HOTCOL = {
    nuke: '255,110,40', meteor: '255,100,35', alien: '120,255,110',
    kame: '110,190,255', kame2: '120,200,255', hammer: '200,235,255',
    warlord_zhuge: '253,224,71', warlord_sunquan: '56,189,248', warlord_caocao: '244,63,94',
    warlord_liubei: '16,185,129', warlord_lvbu: '217,70,239', warlord_simayi: '129,140,248', skyfall: '253,224,71', vortex: '56,189,248'
  };
  function spawnCracks(side, sk, gx, gy, rot) {
    (CRACKSPEC[sk] || []).forEach(([cls, cnt, spread, scl]) => {
      for (let i = 0; i < cnt; i++) {
        const a = rnd(0, TAU), d = spread * Math.sqrt(Math.random()), x = gx + Math.cos(a) * d, y = gy + Math.sin(a) * d * .8;
        if (!inCamp(side, x, y)) continue;
        addCrack(x, y, cls, { sc: scl * rnd(.9, 1.15), delay: i === 0 && spread === 0 ? 0 : rnd(.08, .7), hot: HOTCOL[sk] || null, hotLife: sk === 'hammer' ? 3.5 : (sk === 'nuke' ? 16 : 11) });
      }
    });
    /* 광선이 지나간 선형 균열 */
    if (sk === 'kame2') for (let i = 1; i <= 3; i++) { const x = gx - Math.cos(rot) * i * 1.2, y = gy - Math.sin(rot) * i * 1.2; if (inCamp(side, x, y)) addCrack(x, y, 'net', { sc: .9, rot: rot + rnd(-.3, .3), delay: i * .1, hot: HOTCOL.kame2, hotLife: 9 }); }
  }
  function drawCracks(g, now) {
    if (!okImg(CATLAS)) return;
    for (let i = CRK.length - 1; i >= 0; i--) {
      const c = CRK[i], age = (now - c.born) / 1000 - c.delay;
      if (age < 0) continue;
      const r = CR[c.idx], [X, Y] = px(c.gx, c.gy), w = CLSW[c.cls] * CX * c.sc, sc = w / r[3], h = r[4] * sc;
      const slam = ease(age / .3), pop = 1.2 - .2 * slam, ab = slam;
      const stl = (typeof BOARD_STYLE_META !== 'undefined' && BOARD_STYLE_META[window.curBoardIdx || 0]) || {};
      g.save(); g.translate(X, Y); g.rotate(c.rot); g.scale((c.flipX ? -1 : 1) * pop, pop);
      /* 구멍 둘레의 어두운 그림자: 판이 눌려 파인 깊이감 */
      if (c.cls !== 'net') { const ao = g.createRadialGradient(0, 0, w * .08, 0, 0, w * .66); ao.addColorStop(0, 'rgba(0,0,0,.5)'); ao.addColorStop(.55, 'rgba(0,0,0,.26)'); ao.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = ab; g.fillStyle = ao; g.beginPath(); g.ellipse(0, 0, w * .66, h * .6, 0, 0, TAU); g.fill(); }
      g.globalAlpha = ab * .32; g.drawImage(tinted(c.idx, 'rgb(255,238,205)'), -w / 2 - 1.3, -h / 2 - 1.3, w, h);   /* 어두운 판에서도 보이도록 밝은 테두리 */
      g.globalAlpha = ab * .96; g.drawImage(CATLAS, r[1], r[2], r[3], r[4], -w / 2, -h / 2, w, h);
      /* 파편: 0.6초 동안 바깥으로 튀어나가 자리를 잡고, 이후 그림자와 함께 남음 */
      if (c.rub && c.rub.length) {
        const fl = ease(age / .6), base = stl.slabEdge || '#6a5a48';
        c.rub.forEach(q => {
          const dd = q.d * fl, qx = Math.cos(q.a) * dd * w * .5, qy = Math.sin(q.a) * dd * h * .5 - Math.sin(Math.PI * Math.min(1, age / .6)) * C * .35 * q.v, rr = q.r * w;
          g.save(); g.translate(qx, qy); g.rotate(q.rot + age * (1 - fl) * 6);
          g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(rr * .25, rr * .45, rr * .95, rr * .4, 0, 0, TAU); g.fill();
          g.fillStyle = base; g.globalAlpha = ab * (.75 + .25 * q.tone); g.beginPath(); g.moveTo(-rr, -rr * .2); g.lineTo(-rr * .3, -rr * .8); g.lineTo(rr * .7, -rr * .5); g.lineTo(rr, rr * .3); g.lineTo(0, rr * .75); g.closePath(); g.fill();
          g.strokeStyle = 'rgba(255,235,200,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-rr, -rr * .2); g.lineTo(-rr * .3, -rr * .8); g.lineTo(rr * .7, -rr * .5); g.stroke();
          g.restore();
        });
      }
      if (c.hot) {
        const hotA = Math.max(0, 1 - age / c.hotLife) * ab;
        if (hotA > .02) { const pulse = .65 + .35 * Math.sin(now * .006 + c.gx * 3); g.globalCompositeOperation = 'lighter'; g.globalAlpha = hotA * pulse * .75; g.shadowColor = 'rgb(' + c.hot + ')'; g.shadowBlur = C * .3; g.drawImage(tinted(c.idx, 'rgb(' + c.hot + ')'), -w / 2, -h / 2, w, h); g.shadowBlur = 0; }
      }
      g.restore();
    }
  }
  /* 사진 불꽃: 가로줄 단위로 흔들어 일렁임을 만들고, 두 장을 번갈아 섞어 불규칙한 타오름을 표현 */
  /* 사진의 일부(세로로 좁게 잘라낸 부분)를 천천히 훑으며 그려서, 길쭉하고 매번 다른 불길을 만든다 */
  const CWF = { f1: .34, f2: .4, f3: .62 };
  const FFW = 128, FFH = 256, ffc = document.createElement('canvas'); ffc.width = FFW; ffc.height = FFH; const ffg = ffc.getContext('2d');
  function drawWavy(g, img, key, cx, by, w, alpha, hMul, t, seed, flip) {
    if (alpha < .02) return;
    const iw = img.naturalWidth, ih = img.naturalHeight, cw = iw * CWF[key], sx0 = (iw - cw) * (.5 + .5 * Math.sin(t * .33 + seed)), aspect = ih / cw, h = w * aspect * hMul;
    if (h < 2) return;
    /* 잘라낸 사진 가장자리가 네모로 보이지 않도록 좌우·위아래를 부드럽게 지움 */
    const th = Math.min(FFH, Math.round(FFW * aspect));
    ffg.globalCompositeOperation = 'source-over'; ffg.clearRect(0, 0, FFW, FFH); ffg.drawImage(img, sx0, 0, cw, ih, 0, 0, FFW, th);
    ffg.globalCompositeOperation = 'destination-in';
    let gr = ffg.createLinearGradient(0, 0, FFW, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.3, 'rgba(0,0,0,1)'); gr.addColorStop(.7, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ffg.fillStyle = gr; ffg.fillRect(0, 0, FFW, FFH);
    gr = ffg.createLinearGradient(0, 0, 0, th); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.25, 'rgba(0,0,0,1)'); gr.addColorStop(.8, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ffg.fillStyle = gr; ffg.fillRect(0, 0, FFW, th);
    g.save(); g.globalAlpha = Math.min(1, alpha); g.translate(cx, by + h * .06); if (flip) g.scale(-1, 1);
    const sk = Math.sin(t * 3.3 + seed) * .16 + Math.sin(t * 7.9 + seed * 2) * .05, sx = 1 + .06 * Math.sin(t * 5.7 + seed * 1.3);
    g.transform(1, 0, sk, 1, 0, 0);               /* 위쪽일수록 크게 흔들리는 전단 변형 → 부드러운 일렁임 */
    g.drawImage(ffc, 0, 0, FFW, th, -w * sx / 2, -h, w * sx, h);
    g.restore();
  }
  function drawFlamePhoto(g, n, I, X, Y, now) {
    const tint = n.prof.tint || 'o', t = now * .001, big = n.r >= n.prof.r * 1.3;
    const kA = big ? 'f1' : (((n.seed * 7) | 0) % 2 ? 'f2' : 'f3'), kB = ((n.seed * 3) | 0) % 2 ? 'f3' : 'f2';
    const A = FIMG[kA + '_' + tint], B = FIMG[kB + '_' + tint];
    if (!okImg(A) || !okImg(B)) return false;
    const rr = n.r * C, Ic = clamp(I, 0, 1.1), W0 = rr * (n.piece ? 2.3 : (big ? 4.1 : 3.1)) * (.8 + .3 * Ic), flick = .94 + .1 * Math.sin(t * 9 + n.seed) + .05 * Math.sin(t * 23 + n.seed * 3);
    const mix = .5 + .5 * Math.sin(t * 2.3 + n.seed), flip = (((n.seed * 13) | 0) & 1) === 1, al = clamp(Ic, 0, 1) * (.82 + .18 * Math.sin(t * 17 + n.seed * 2)), by = Y + rr * .4, hm = Math.pow(Ic, .85) * flick;
    g.save(); g.globalCompositeOperation = 'lighter';
    drawWavy(g, A, kA, X, by, W0, al * (1 - mix * .6), hm, t, n.seed, flip);
    drawWavy(g, B, kB, X, by, W0 * .92, al * (.4 + mix * .6), hm * .94, t, n.seed + 1.7, !flip);
    g.restore(); return true;
  }
  /* ---------- 화염 노드 ---------- */
  function addNode(gx, gy, prof, o) {
    if (NODES.length >= 60) return null;
    const n = Object.assign({ gx, gy, r: prof.r, born: performance.now(), delay: 0, life: prof.life, base: 1, pal: prof.pal, seed: rnd(0, 100), acc: 0, spT: rnd(.7, 1.6), gen: 0, prof, piece: false, glowAcc: 0 }, o || {});
    NODES.push(n); return n;
  }
  function intensity(n, age) {
    if (age < 0) return 0;
    const dec = Math.min(4.5, n.life * .32);
    let I = age < 1.1 ? ease(age / 1.1) : 1;
    const rem = n.life - age; if (rem < dec) I = Math.min(I, ease(rem / dec));
    return I * n.base * (1 + .16 * Math.sin(age * 5 + n.seed) + .08 * Math.sin(age * 11.3 + n.seed * 2));
  }
  function emitFlame(n, I, X, Y) {
    const rr = n.r * C, windv = 10 * Math.sin(performance.now() * .0007 + n.seed);
    sp({ type: 'flame', pal: n.pal, x: X + rnd(-.4, .4) * rr, y: Y + rnd(-.1, .25) * rr, vx: windv + rnd(-10, 10), vy: -rr * rnd(1.5, 2.7) * (.6 + .6 * I), ay: -rr * 1.1, drag: .985,
      life: rnd(.55, 1.05) * (.7 + .5 * I), size: rr * rnd(.34, .58) * (.55 + .5 * I), seed: rnd(0, 6), sway: rr * rnd(.7, 1.3), swf: rnd(5, 9) });
  }

  /* ---------- 타격(점화) ---------- */
  function onHit(side, sk, extra) {
    if (!SF.enabled || !gameVisible()) return;
    const prof = PROF[sk]; if (!prof) return;
    RC = cv.getBoundingClientRect();
    const hits = (window.DMG_SK && window.DMG_SK[side]) || [], last = hits[hits.length - 1] || { fx: .5, fy: .5, rot: 0 };
    const fx = extra && extra.fx != null ? extra.fx : last.fx, fy = extra && extra.fy != null ? extra.fy : last.fy, rot = extra && extra.rot != null ? extra.rot : (last.rot || 0);
    const cr = campRect(side), sx = cr.x0 + fx * cr.w, sy = cr.y0 + fy * cr.h, [gx, gy] = fromScreen(sx, sy);
    warn = null;
    startFire(side, sk, prof, gx, gy, sx, sy, rot);
  }
  function startFire(side, sk, prof, gx, gy, sx, sy, rot) {
    const now = performance.now();
    /* 장기판 파손 : 균열·구멍 이미지 */
    spawnCracks(side, sk, gx, gy, rot);
    const burns = prof.flame || prof.pal === 'frost';
    /* 메인 화염 (불이 날 만한 스킬 / 서리 스킬만) */
    if (burns) addNode(gx, gy, prof, { r: prof.r * 1.35, base: 1.15, gen: 0, delay: 0 });
    for (let i = 0; burns && i < prof.n0; i++) {
      const a = rnd(0, TAU), d = prof.rad * Math.sqrt(Math.random()) * .9;
      const ngx = gx + Math.cos(a) * d, ngy = gy + Math.sin(a) * d * .8;
      if (!inCamp(side, ngx, ngy)) continue;
      addNode(ngx, ngy, prof, { delay: rnd(.05, 1.4), base: rnd(.7, 1.05), life: prof.life * rnd(.75, 1), gen: 1 });
    }
    /* 운석 파편 불 */
    if (burns && prof.scatter) for (let i = 0; i < prof.scatter; i++) {
      const ngx = gx + rnd(-3.6, 3.6), ngy = gy + rnd(-2.2, 2.2);
      if (inCamp(side, ngx, ngy)) addNode(ngx, ngy, prof, { delay: rnd(.2, 1.8), base: rnd(.55, .9), r: prof.r * rnd(.6, .9), life: prof.life * rnd(.6, .9), gen: 2 });
    }
    /* 광선이 지나간 그을린 줄 */
    if (burns && prof.line) for (let i = 1; i <= prof.line; i++) {
      const ngx = gx - Math.cos(rot) * i * .9, ngy = gy - Math.sin(rot) * i * .9;
      if (inCamp(side, ngx, ngy)) addNode(ngx, ngy, prof, { delay: i * .12, base: .8, r: prof.r * .75, life: prof.life * .8, gen: 2 });
    }
    /* 기물에 옮겨붙는 불 */
    if (burns && prof.pieces && typeof B !== 'undefined') {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 9; x++) {
        if (!B[y][x]) continue;
        const d = Math.hypot(x - gx, (y - gy) * .9);
        if (d > prof.pr || !inCamp(side, x, y)) continue;
        if (Math.random() < clamp(1.15 - d / (prof.pr * 1.05), .25, 1))
          addNode(x, y, prof, { piece: true, r: prof.r * .55, base: rnd(.55, .85), delay: .35 + d * .28 + rnd(0, .6), life: prof.life * rnd(.5, .75), gen: 3, spT: 99 });
      }
    }
    /* 그을음/서리 자국 */
    if (prof.scorch) { SCORCH.push({ gx, gy, r: prof.scorch, born: now, life: 40, pal: prof.pal, seed: rnd(0, 99) }); if (SCORCH.length > 18) SCORCH.shift(); }
    /* 주먹: 불 대신 흙먼지와 돌조각 */
    if (sk === 'fist') { for (let i = 0; i < 16; i++) sp({ type: 'smoke', x: sx + rnd(-C * .6, C * .6), y: sy + rnd(-C * .2, C * .3), vx: rnd(-90, 90), vy: -rnd(20, 80), life: rnd(1.2, 2.4), size: C * rnd(.3, .6), grow: 1.8, a: .42, under: 1 }); for (let i = 0; i < 22; i++) { const a = rnd(0, TAU), v = rnd(80, 300); sp({ type: 'dot', x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, ay: 560, life: rnd(.6, 1.3), size: rnd(1.2, 2.8), a: .95, col: [150, 125, 95] }); } }
    /* 폭발 섬광·충격 링 */
    flash = Math.max(flash, .38); flashCol = prof.col; flashX = sx; flashY = sy;
    for (let i = 0; i < 2; i++) RINGS.push({ x: sx, y: sy + C * .2, r0: C * .2, r1: C * (2.6 + prof.rad), life: 1.1 + i * .3, age: -i * .12, col: prof.col, lw: C * .16, flat: .55 });
    for (let i = 0; i < 46; i++) {
      const a = rnd(0, TAU), v = rnd(120, 480) * (prof.rad / 2 + .6);
      sp({ type: 'spark', x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, ay: 520, drag: .985, life: rnd(.7, 1.6), size: rnd(1.2, 2.8), pal: prof.pal });
    }
    for (let i = 0; i < 12; i++) sp({ type: 'smoke', x: sx + rnd(-C, C), y: sy + rnd(-C * .5, C * .5), vx: rnd(-40, 40), vy: -rnd(30, 90), life: rnd(2, 3.6), size: C * rnd(.5, .9), grow: 1.8, a: .3 });
    if (sk === 'nuke') SMK.push({ x: sx, y: sy, born: now, dur: 9 });
    /* 코믹 글자 */
    TXT.push({ x: sx, y: Math.max(RC.top + C * 3.2, sy - C * .6), text: pick(prof.txt), col: prof.col, t0: now, life: 1.9, rot: rnd(-.12, .12), size: Math.max(22, C * 1.05) });
    setTimeout(() => { if (NODES.length || sk === 'fist') TXT.push({ x: sx, y: Math.max(RC.top + C * 4.4, sy - C * 1.5), text: sk === 'fist' ? '💢 균열!' : prof.pal === 'frost' ? '❄️ 서리!' : prof.pal === 'blue' ? '⚡ 감전!' : prof.pal === 'green' ? '☣️ 부식!' : '🔥 불붙었다!', col: prof.col, t0: performance.now(), life: 1.6, rot: rnd(-.08, .08), size: Math.max(16, C * .6) }); }, 900);
    try { if (prof.pal === 'frost') noise(.6, 'highpass', 4200, 2400, .12, 1); else if (prof.flame) whoosh(.14); else noise(.35, 'lowpass', 900, 120, .18, 1); } catch (e) {}
  }

  /* ---------- 개별 타격(총탄·주먹·망치) 소규모 연출 ---------- */
  function microHit(side, fx, fy) {
    if (!SF.enabled || !ctx || performance.now() - ctx.t0 > 14000 || !gameVisible()) return;
    const prof = PROF[ctx.sk]; if (!prof || !['gun', 'fist', 'hammer'].includes(ctx.sk)) return;
    RC = cv.getBoundingClientRect();
    const cr = campRect(side), sx = cr.x0 + (fx == null ? .5 : fx) * cr.w, sy = cr.y0 + (fy == null ? .5 : fy) * cr.h;
    const n = ctx.sk === 'gun' ? 14 : 22;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), v = rnd(80, ctx.sk === 'gun' ? 320 : 420);
      sp({ type: ctx.sk === 'hammer' ? 'shard' : 'spark', x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, ay: 480, drag: .985, life: rnd(.5, 1.2), size: rnd(1.2, 2.6) + (ctx.sk === 'hammer' ? 2 : 0), pal: prof.pal, rot: rnd(0, TAU), vr: rnd(-12, 12) });
    }
    for (let i = 0; i < 5; i++) sp({ type: 'smoke', x: sx + rnd(-8, 8), y: sy, vx: rnd(-14, 14), vy: -rnd(25, 70), life: rnd(1.4, 2.4), size: C * rnd(.2, .35), grow: 1.8, a: .28 });
    RINGS.push({ x: sx, y: sy, r0: C * .08, r1: C * (ctx.sk === 'gun' ? .7 : 1.4), life: .6, age: 0, col: prof.col, lw: C * .08, flat: .6 });
    const [gx, gy] = fromScreen(sx, sy);
    if (ctx.sk === 'hammer' && Math.random() < .5) addNode(gx, gy, prof, { r: prof.r * .7, base: .75, life: prof.life * rnd(.6, 1), gen: 4, spT: 99 });
    if (ctx.sk === 'gun') { addCrack(gx, gy, 'small', { sc: rnd(.75, 1), hot: '255,170,60', hotLife: 2.2, life: 36 }); try { crackle(.1); } catch (e) {} }
    else if (ctx.sk === 'fist') addCrack(gx, gy, 'net', { sc: rnd(.55, .8), life: 36 });
    else if (ctx.sk === 'hammer') addCrack(gx, gy, 'net', { sc: rnd(.6, .9), hot: '200,235,255', hotLife: 3, life: 36 });
  }

  /* ---------- 갱신 ---------- */
  function update(dt, now) {
    /* 화염 노드 */
    for (let i = NODES.length - 1; i >= 0; i--) {
      const n = NODES[i], age = (now - n.born) / 1000 - n.delay, tail = n.prof.pal === 'frost' ? 0 : 4.5;
      if (age > n.life + tail) { NODES.splice(i, 1); continue; }
      if (age < 0) continue;
      const [X, Y] = toScreen(n.gx, n.gy), prof = n.prof;
      if (!n.ign) { n.ign = 1; if (prof.pal !== 'frost') { sp({ type: 'glowpuff', x: X, y: Y - n.r * C * .3, life: .45, size: n.r * C * 1.6, vy: -20, pal: n.pal, a: .55 }); for (let q = 0; q < 6; q++) sp({ type: 'ember', pal: n.pal, x: X + rnd(-4, 4), y: Y, vx: rnd(-40, 40), vy: -rnd(60, 160), life: rnd(.7, 1.6), size: rnd(1, 2.2), sway: rnd(8, 18), swf: rnd(2, 5), seed: rnd(0, 6) }); } }
      /* 잔불: 불길이 사그라든 뒤에도 연기와 불씨가 서서히 식어감 */
      if (age > n.life) {
        const sm = 1 - (age - n.life) / tail, rr0 = n.r * C;
        if (Math.random() < dt * 7 * sm) sp({ type: 'smoke', x: X + rnd(-rr0 * .4, rr0 * .4), y: Y - rr0 * .4, vx: rnd(-8, 10), vy: -rnd(18, 44), life: rnd(2, 3.4), size: rr0 * rnd(.4, .7), grow: 2.2, a: .2 * sm, sway: rr0 * .4, swf: rnd(1, 2), seed: rnd(0, 6) });
        if (Math.random() < dt * 5 * sm) sp({ type: 'ember', pal: n.pal, x: X + rnd(-rr0 * .5, rr0 * .5), y: Y, vx: rnd(-10, 10), vy: -rnd(20, 60), life: rnd(1, 2), size: rnd(.9, 1.7), sway: rnd(6, 14), swf: rnd(2, 4), seed: rnd(0, 6) });
        continue;
      }
      const I = intensity(n, age); if (I <= 0.01) continue;
      n.acc += (n.piece ? 5 : 9) * I * dt * (prof.pal === 'frost' ? .35 : 1);
      let c = 0; while (n.acc >= 1 && c++ < 6) { n.acc -= 1; if (prof.pal !== 'frost' && !(okImg(FIMG.f1_o) && okImg(FIMG.f2_o))) emitFlame(n, I, X, Y); }
      const rr = n.r * C;
      if (prof.pal === 'frost') {
        if (Math.random() < .5 * I) sp({ type: 'mist', x: X + rnd(-rr, rr), y: Y + rnd(-rr * .3, rr * .4), vx: rnd(-12, 12), vy: -rnd(10, 30), life: rnd(1.8, 3), size: rr * rnd(.9, 1.6), grow: 1.4, a: .22 });
        if (Math.random() < .3 * I) sp({ type: 'glint', x: X + rnd(-rr, rr), y: Y + rnd(-rr * .6, rr * .5), life: rnd(.5, 1), size: rnd(C * .05, C * .12), rot: rnd(0, TAU), vr: rnd(-2, 2), pal: 'frost' });
      } else {
        if (Math.random() < .2 * I * (prof.smoke || .4)) sp({ type: 'smoke', x: X + rnd(-rr * .4, rr * .4), y: Y - rr * rnd(.6, 1.3), vx: rnd(-12, 14), vy: -rnd(22, 60), life: rnd(2, 3.6), size: rr * rnd(.7, 1.2), grow: 2.2, a: .36, sway: rr * .5, swf: rnd(1, 2.4), seed: rnd(0, 6) });
        if (Math.random() < .22 * I) sp({ type: 'ember', pal: n.pal, x: X + rnd(-rr * .5, rr * .5), y: Y - rr * rnd(.2, .8), vx: rnd(-18, 18), vy: -rnd(40, 120), life: rnd(1, 2.4), size: rnd(1, 2.2), sway: rnd(8, 20), swf: rnd(2, 5), seed: rnd(0, 6) });
        if (prof.bubbles && Math.random() < .12 * I) sp({ type: 'bubble', x: X + rnd(-rr, rr), y: Y + rnd(-rr * .3, rr * .3), vy: -rnd(15, 40), life: rnd(.8, 1.5), size: rnd(C * .05, C * .12), pal: n.pal });
      }
      /* 불 번짐 */
      if (prof.spread && !n.piece && age > n.spT && age < n.life * .55 && I > .6 && NODES.length < prof.maxN) {
        n.spT = age + rnd(.9, 1.9);
        const a = pick([0, 1, 2, 3, 4, 5, 6, 7]) * TAU / 8, ngx = n.gx + Math.cos(a) * rnd(.8, 1.3), ngy = n.gy + Math.sin(a) * rnd(.8, 1.3);
        const vside = ctx ? ctx.V : null;
        if ((!vside || inCamp(vside, ngx, ngy)) && !NODES.some(m => !m.piece && Math.hypot(m.gx - ngx, m.gy - ngy) < .65)) addNode(ngx, ngy, prof, { base: n.base * .82, life: Math.max(3, n.life * .6 - age * .2), delay: .2, gen: n.gen + 1, r: n.r * .92 });
      }
    }
    /* 전류/플라즈마 아크 */
    const last = NODES[NODES.length - 1];
    if (NODES.length > 1 && NODES[0].prof.arcs && Math.random() < dt * 4.5) {
      const live = NODES.filter(n => (now - n.born) / 1000 > n.delay + .5);
      if (live.length > 1) {
        const a = pick(live), cand = live.filter(m => m !== a && Math.hypot(m.gx - a.gx, m.gy - a.gy) < 3.4), b = cand.length ? pick(cand) : null;
        if (b) { const [x0, y0] = toScreen(a.gx, a.gy), [x1, y1] = toScreen(b.gx, b.gy), pts = [[x0, y0]], nn = 7, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
          for (let i = 1; i < nn; i++) pts.push([x0 + dx * i / nn + (-dy / L) * rnd(-1, 1) * L * .08, y0 + dy * i / nn + (dx / L) * rnd(-1, 1) * L * .08]); pts.push([x1, y1]);
          ARCS.push({ pts, age: 0, life: rnd(.12, .24), col: ARC[a.pal] || ARC.blue }); try { if (Math.random() < .5) crackle(.08); } catch (e) {} }
      }
    }
    /* 핵 버섯구름 연기 기둥 */
    for (let i = SMK.length - 1; i >= 0; i--) {
      const m = SMK[i], age = (now - m.born) / 1000;
      if (age > m.dur) { SMK.splice(i, 1); continue; }
      const k = age / m.dur;
      for (let j = 0; j < 2; j++) sp({ type: 'smoke', x: m.x + rnd(-C * .5, C * .5) * (1 + k * 1.5), y: m.y - rnd(0, C * (3 + k * 5)), vx: rnd(-20, 20), vy: -rnd(50, 110) * (1 - k * .5), life: rnd(2.8, 4.8), size: C * rnd(.9, 1.6) * (1 + k), grow: 1.6, a: .26 * (1 - k * .5), under: 1 });
      if (Math.random() < .5) sp({ type: 'glowpuff', x: m.x + rnd(-C, C), y: m.y - rnd(0, C * 2), life: rnd(.8, 1.6), size: C * rnd(.6, 1.2), vy: -rnd(30, 70), pal: 'fire', a: .4 * (1 - k) });
    }
    /* 핵/운석 재(ash) */
    if (NODES.length && NODES[0].prof.ash && Math.random() < dt * 22) sp({ type: 'dot', x: RC.left + Math.random() * RC.width, y: RC.top - 8, vx: rnd(-10, 14), vy: rnd(28, 70), life: rnd(5, 8), size: rnd(1, 2.2), a: .6, sway: rnd(8, 18), swf: rnd(.8, 1.8), seed: rnd(0, 6), col: [150, 140, 135] });
    /* 파티클 */
    for (let i = PS.length - 1; i >= 0; i--) {
      const p = PS[i]; p.age += dt; if (p.age >= p.life) { PS.splice(i, 1); continue; }
      const dr = Math.pow(p.drag, dt * 60); p.vx *= dr; p.vy = p.vy * dr + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.sway) p.x += Math.sin(p.age * p.swf + p.seed) * p.sway * dt;
    }
    for (let i = RINGS.length - 1; i >= 0; i--) { const r = RINGS[i]; r.age += dt; if (r.age > r.life) RINGS.splice(i, 1); }
    for (let i = ARCS.length - 1; i >= 0; i--) { const a = ARCS[i]; a.age += dt; if (a.age > a.life) ARCS.splice(i, 1); }
    for (let i = TXT.length - 1; i >= 0; i--) { if ((now - TXT[i].t0) / 1000 > TXT[i].life) TXT.splice(i, 1); }
    /* 불 타는 소리(지글지글) */
    if (NODES.length) { crackAcc += dt; const tot = Math.min(1, NODES.length / 14); if (crackAcc > .14) { crackAcc = 0; if (Math.random() < .55 * tot) try { crackle(.05 * tot + .015); } catch (e) {} } }
  }

  /* ---------- 그리기 ---------- */
  function drawFlameParticle(g, p) {
    const k = p.age / p.life, pal = PAL[p.pal] || PAL.fire, idx = clamp(k * (pal.length - 1), 0, pal.length - 1.001), i0 = Math.floor(idx), fa = idx - i0;
    const s = p.size * (1 - .5 * Math.pow(k, 1.4)), al = (k < .12 ? k / .12 : 1) * (1 - k * k) * .34;
    if (al < .01 || s < .5) return;
    const w = s * 1.9, h = s * 3.1, x = p.x, y = p.y - h * .55;
    g.globalAlpha = al * (1 - fa * .5); g.drawImage(sprite(pal[i0]), x - w / 2, y - h / 2, w, h);
    g.globalAlpha = al * fa; g.drawImage(sprite(pal[i0 + 1]), x - w / 2, y - h / 2, w, h);
  }
  /* 부드럽게 일렁이는 불길 (곡선 혀 5개 + 안쪽 밝은 심지) */
  function drawTongues(g, n, I, X, Y, now) {
    const pal = PAL[n.pal]; if (!pal || n.pal === 'frost') return;
    const rr = n.r * C, t = now * .001, cnt = n.piece ? 3 : 5, wind = Math.sin(t * .7 + n.seed) * rr * .25;
    for (let i = 0; i < cnt; i++) {
      const ph = n.seed + i * 1.9, f = cnt > 1 ? (i - (cnt - 1) / 2) / ((cnt - 1) / 2) : 0;
      const flick = .5 + .5 * Math.sin(t * 6.5 + ph) * .6 + .5 * Math.sin(t * 12.7 + ph * 2.1) * .4;
      const hgt = rr * (1.35 + 1.0 * flick) * I * (1 - Math.abs(f) * .38) * (n.piece ? .85 : 1.25), wid = rr * (.42 - Math.abs(f) * .1) * (.65 + .35 * I);
      const bx = X + f * rr * .72, by = Y + rr * .18, sway = Math.sin(t * 3.6 + ph) * rr * .32 + wind, tipx = bx + sway, tipy = by - hgt;
      const gr = g.createLinearGradient(0, by, 0, tipy);
      gr.addColorStop(0, `rgba(${pal[1]},${.62 * I})`); gr.addColorStop(.3, `rgba(${pal[2]},${.55 * I})`); gr.addColorStop(.72, `rgba(${pal[3]},${.26 * I})`); gr.addColorStop(1, `rgba(${pal[4]},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(bx - wid, by);
      g.bezierCurveTo(bx - wid * 1.15, by - hgt * .45, tipx - wid * .5 + sway * .25, by - hgt * .74, tipx, tipy);
      g.bezierCurveTo(tipx + wid * .5 + sway * .25, by - hgt * .7, bx + wid * 1.15, by - hgt * .42, bx + wid, by); g.closePath(); g.fill();
      if (i === Math.floor(cnt / 2)) { /* 가운데 혀에 밝은 심지 */
        const h2 = hgt * .55, g2 = g.createLinearGradient(0, by, 0, by - h2); g2.addColorStop(0, `rgba(${pal[0]},${.75 * I})`); g2.addColorStop(1, `rgba(${pal[1]},0)`);
        g.fillStyle = g2; g.beginPath(); g.moveTo(bx - wid * .5, by); g.quadraticCurveTo(bx - wid * .45 + sway * .2, by - h2 * .6, bx + sway * .35, by - h2); g.quadraticCurveTo(bx + wid * .45 + sway * .2, by - h2 * .6, bx + wid * .5, by); g.closePath(); g.fill();
      }
    }
  }
  function draw(g, now) {
    /* 경고 조준 */
    if (warn) {
      const age = (now - warn.t0) / 1000;
      if (age > 8) warn = null; else {
        const cr = campRect(warn.V), cx = cr.x0 + cr.w / 2, cy = cr.y0 + cr.h / 2, R = Math.min(cr.w, cr.h * 1.6) * .42, pul = .5 + .5 * Math.sin(age * 7), fadeIn = ease(age / .5), col = PROF[warn.sk].col;
        g.save(); g.globalAlpha = fadeIn; g.globalCompositeOperation = 'lighter';
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4); gr.addColorStop(0, `rgba(${col},${.05 + .06 * pul})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(cr.x0, cr.y0, cr.w, cr.h);
        g.translate(cx, cy); g.strokeStyle = `rgba(${col},${.55 + .35 * pul})`; g.lineWidth = Math.max(2, C * .07);
        g.rotate(age * 1.4); g.setLineDash([C * .5, C * .3]); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke(); g.setLineDash([]);
        g.rotate(-age * 2.8); g.beginPath(); g.arc(0, 0, R * .62, 0, TAU); g.stroke(); g.rotate(age * 1.4);
        g.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.moveTo(Math.cos(a) * R * .35, Math.sin(a) * R * .35); g.lineTo(Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12); } g.stroke();
        g.restore();
        g.save(); g.globalAlpha = fadeIn * (.6 + .4 * pul); g.font = '900 ' + Math.round(Math.max(13, C * .52)) + 'px sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.7)'; const lb = '⚠ 응징 접근!'; g.strokeText(lb, cx, cy - R - C * .3); g.fillStyle = `rgb(${col})`; g.fillText(lb, cx, cy - R - C * .3); g.restore();
      }
    }
    /* 열기 빛 (바닥 조명) */
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const n of NODES) {
      const age = (now - n.born) / 1000 - n.delay; if (age < 0) continue;
      const I = intensity(n, age); if (I < .02) continue;
      const [X, Y] = toScreen(n.gx, n.gy), gl = GLOW[n.pal] || GLOW.fire, rr = n.r * C * (n.piece ? 3 : 4.2) * (.8 + .25 * I);
      g.globalAlpha = clamp(.2 * I * (.85 + .15 * Math.sin(now * .02 + n.seed)), 0, .4); g.drawImage(sprite(gl), X - rr, Y - rr * .8, rr * 2, rr * 1.6);
    }
    g.restore();
    /* 불길 */
    let photoCount = 0;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const n of NODES) {
      const age = (now - n.born) / 1000 - n.delay; if (age < 0 || age > n.life) continue;
      const I = intensity(n, age); if (I < .03) continue;
      const [X, Y] = toScreen(n.gx, n.gy);
      if (!(photoCount < 22 && drawFlamePhoto(g, n, clamp(I, 0, 1.25), X, Y, now) && ++photoCount)) drawTongues(g, n, clamp(I, 0, 1.25), X, Y, now);
    }
    g.restore();
    /* 연기(아래층) → 불꽃(가산) → 불씨/불똥 → 전류 → 링 → 글자 */
    for (const p of PS) {
      if (p.type !== 'smoke' && p.type !== 'mist') continue;
      const k = p.age / p.life, s = p.size * (1 + p.grow * k), al = p.a * (k < .15 ? k / .15 : 1) * (1 - k) * (p.type === 'mist' ? 1 : 1);
      if (al < .004) continue;
      g.globalAlpha = al; g.drawImage(sprite(p.type === 'mist' ? [200, 230, 255] : (p.under ? [60, 50, 48] : [70, 62, 58])), p.x - s, p.y - s, s * 2, s * 2);
    }
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of PS) {
      const k = p.age / p.life;
      if (p.type === 'flame') drawFlameParticle(g, p);
      else if (p.type === 'glowpuff') { const s = p.size * (1 + k), al = p.a * (1 - k); g.globalAlpha = al; g.drawImage(sprite(PAL.fire[2]), p.x - s, p.y - s, s * 2, s * 2); }
      else if (p.type === 'ember') { const pal = PAL[p.pal] || PAL.fire, c = pal[Math.min(3, Math.floor(k * 3.5))], al = (1 - k) * (.5 + .5 * Math.sin(p.age * 30 + p.seed)); g.globalAlpha = Math.max(0, al); g.fillStyle = `rgb(${c})`; g.beginPath(); g.arc(p.x, p.y, p.size * (1 - k * .5), 0, TAU); g.fill(); }
      else if (p.type === 'spark') { const pal = PAL[p.pal] || PAL.fire, c = pal[Math.min(2, Math.floor(k * 3))], m = Math.hypot(p.vx, p.vy) || 1, l = Math.min(C * .8, m * .05); g.globalAlpha = (1 - k) * .95; g.strokeStyle = `rgb(${c})`; g.lineWidth = Math.max(1, p.size * .6); g.lineCap = 'round'; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx / m * l, p.y - p.vy / m * l); g.stroke(); }
      else if (p.type === 'shard') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = (1 - k) * .9; g.fillStyle = 'rgb(215,245,255)'; g.beginPath(); g.moveTo(p.size, 0); g.lineTo(-p.size * .6, p.size * .5); g.lineTo(-p.size * .4, -p.size * .55); g.closePath(); g.fill(); g.restore(); }
      else if (p.type === 'glint') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = Math.sin(Math.PI * k); g.strokeStyle = 'rgb(235,250,255)'; g.lineWidth = Math.max(1, p.size * .18); g.beginPath(); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.moveTo(Math.cos(a) * p.size, Math.sin(a) * p.size); g.lineTo(-Math.cos(a) * p.size, -Math.sin(a) * p.size); } g.stroke(); g.restore(); }
      else if (p.type === 'bubble') { g.globalAlpha = (1 - k) * .8; g.strokeStyle = 'rgb(190,255,150)'; g.lineWidth = 1.3; g.beginPath(); g.arc(p.x, p.y, p.size * (1 + k * .6), 0, TAU); g.stroke(); }
      else if (p.type === 'dot') { g.globalCompositeOperation = 'source-over'; g.globalAlpha = Math.min(p.a, 1) * (1 - k); g.fillStyle = `rgb(${p.col || [200, 200, 200]})`; g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fill(); g.globalCompositeOperation = 'lighter'; }
    }
    /* 전류 */
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const a of ARCS) {
      const k = a.age / a.life, al = (1 - k) * (Math.random() < .3 ? .5 : 1);
      g.globalAlpha = al; g.strokeStyle = `rgba(${a.col},.45)`; g.lineWidth = 5; g.beginPath(); a.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 1.6; g.beginPath(); a.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
    }
    /* 충격 링 */
    for (const r of RINGS) {
      if (r.age < 0) continue;
      const k = r.age / r.life, e = 1 - Math.pow(1 - k, 3), rad = r.r0 + (r.r1 - r.r0) * e;
      g.save(); g.translate(r.x, r.y); g.scale(1, r.flat); g.globalAlpha = (1 - k) * .9; g.strokeStyle = `rgb(${r.col})`; g.lineWidth = Math.max(1.5, r.lw * (1 - k * .75)); g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.stroke(); g.restore();
    }
    g.restore();
    /* 폭발 섬광 */
    if (flash > .004) {
      g.save(); g.globalCompositeOperation = 'lighter'; const fr = Math.max(RC.width, RC.height) * 1.0, fg = g.createRadialGradient(flashX, flashY, 0, flashX, flashY, fr);
      fg.addColorStop(0, `rgba(${flashCol},${Math.min(1, flash * 2)})`); fg.addColorStop(.3, `rgba(${flashCol},${flash * .7})`); fg.addColorStop(1, `rgba(${flashCol},0)`); g.fillStyle = fg; g.fillRect(RC.left, RC.top, RC.width, RC.height); g.restore();
    }
    /* 코믹 글자 */
    for (const t of TXT) {
      const age = (now - t.t0) / 1000, k = age / t.life, pop = easeOutBack(Math.min(1, age / .28)), al = k > .7 ? 1 - (k - .7) / .3 : 1;
      g.save(); g.globalAlpha = al; g.translate(t.x, t.y - age * C * .35); g.rotate(t.rot); g.scale(pop, pop);
      g.font = `900 ${Math.round(t.size)}px sans-serif`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = Math.max(5, t.size * .2); g.strokeStyle = 'rgba(20,6,0,.92)'; g.strokeText(t.text, 0, 0);
      const grd = g.createLinearGradient(0, -t.size * .6, 0, t.size * .3); grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, `rgb(${t.col})`); g.fillStyle = grd; g.fillText(t.text, 0, 0); g.restore();
    }
    g.globalAlpha = 1;
  }

  /* ---------- 바닥 그을음 / 서리 (장기알 아래에 그려짐) ---------- */
  function drawScorch(g, now) {
    if (!SF.enabled) return;
    for (let i = SCORCH.length - 1; i >= 0; i--) {
      const s = SCORCH[i], age = (now - s.born) / 1000;
      const a = ease(age / .8) * (s.hole ? Math.max(.4, Math.exp(-age / 40)) : (.4 + .6 * Math.exp(-age / 30))), [X, Y] = px(s.gx, s.gy), r = s.r * C;
      g.save(); g.translate(X, Y);
      if (s.hole) { g.fillStyle = `rgba(10,6,4,${.7 * a})`; g.beginPath(); g.arc(0, 0, C * .07, 0, TAU); g.fill(); g.strokeStyle = `rgba(255,170,60,${.7 * a * Math.max(0, 1 - age / 4)})`; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, C * .1, 0, TAU); g.stroke(); g.restore(); continue; }
      if (s.pal === 'frost') {
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(215,245,255,${.5 * a})`); gr.addColorStop(1, 'rgba(150,215,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r, r * .82, 0, 0, TAU); g.fill();
        g.strokeStyle = `rgba(240,253,255,${.8 * a})`; g.lineWidth = 1.3; g.beginPath(); for (let k = 0; k < 8; k++) { const an = k / 8 * TAU + s.seed; g.moveTo(0, 0); g.lineTo(Math.cos(an) * r * .95, Math.sin(an) * r * .8); } g.stroke();
      } else {
        const gr = g.createRadialGradient(0, 0, r * .05, 0, 0, r); gr.addColorStop(0, `rgba(8,5,3,${.62 * a})`); gr.addColorStop(.6, `rgba(20,12,8,${.38 * a})`); gr.addColorStop(1, 'rgba(20,12,8,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r, r * .84, 0, 0, TAU); g.fill();
        /* 식어가는 불씨 균열 */
        const glowA = Math.max(0, 1 - age / 14) * a, gc = s.pal === 'green' ? '140,255,110' : s.pal === 'blue' ? '120,200,255' : '255,120,40', pulse = .6 + .4 * Math.sin(now * .006 + s.seed);
        if (glowA > .02) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${gc},${.8 * glowA * pulse})`; g.lineWidth = Math.max(1.3, C * .035); g.shadowColor = `rgb(${gc})`; g.shadowBlur = 8; g.beginPath(); for (let k = 0; k < 9; k++) { const an = k / 9 * TAU + s.seed; let x = 0, y = 0; g.moveTo(0, 0); for (let q = 0; q < 3; q++) { const l = r * (.28 + q * .14); x += Math.cos(an + (q % 2 ? .4 : -.35)) * l; y += Math.sin(an + (q % 2 ? .4 : -.35)) * l * .84; g.lineTo(x, y); } } g.stroke(); }
      }
      g.restore();
    }
  }
  function hookGround() {
    const orig = window.jgDrawBoardThemeFX;
    if (orig && orig.__sfx) return;
    window.jgDrawBoardThemeFX = function (g, now) {
      if (typeof orig === 'function') orig.apply(this, arguments);
      try { drawScorch(g, now); drawCracks(g, now); } catch (e) {}
    };
    window.jgDrawBoardThemeFX.__sfx = true;
  }

  /* ---------- 메인 루프 ---------- */
  function loop(now) {
    requestAnimationFrame(loop);
    if (!ensureCanvas()) return;
    const dt = Math.min(.05, Math.max(.001, (now - (lastT || now)) / 1000)); lastT = now;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5), Wn = window.innerWidth, Hn = window.innerHeight;
    if (cvO.width !== Math.round(Wn * dpr) || cvO.height !== Math.round(Hn * dpr)) { cvO.width = Math.round(Wn * dpr); cvO.height = Math.round(Hn * dpr); }
    W = Wn; H = Hn;
    go.setTransform(dpr, 0, 0, dpr, 0, 0); go.clearRect(0, 0, W, H);
    if (!SF.enabled || !gameVisible()) { if (PS.length || NODES.length || warn) { PS.length = 0; NODES.length = 0; ARCS.length = 0; RINGS.length = 0; TXT.length = 0; SMK.length = 0; warn = null; } return; }
    RC = cv.getBoundingClientRect();
    try { const dmgSum = (window.jgDmg ? (window.jgDmg('c') || 0) + (window.jgDmg('h') || 0) : 1); if (dmgSum === 0 && (CRK.length || SCORCH.length) && now - (ctx ? ctx.t0 : 0) > 20000) { zeroSince = zeroSince || now; if (now - zeroSince > 3000) { CRK.length = 0; SCORCH.length = 0; zeroSince = 0; } } else zeroSince = 0; } catch (e) {}
    update(dt, now);
    go.save(); go.beginPath(); go.rect(RC.left, RC.top, RC.width, RC.height); go.clip();
    draw(go, now);
    go.restore();
    if (flash > .004) flash *= Math.pow(.04, dt);
  }

  /* ---------- 훅 연결 ---------- */
  SF.start = function (sk, V) {
    try {
      if (!SF.enabled || !PROF[sk]) return;
      ctx = { sk, V, t0: performance.now() };
      if (gameVisible()) warn = { sk, V, t0: performance.now() };
    } catch (e) {}
  };
  function hook() {
    const hc = window.hitCamp;
    if (typeof hc === 'function' && !hc.__sfx) {
      window.hitCamp = function (s, sk, extra) {
        const r = hc.apply(this, arguments);
        try { if (ctx) ctx.V = s; onHit(s, sk || (ctx && ctx.sk) || 'nuke', extra); } catch (e) {}
        return r;
      };
      window.hitCamp.__sfx = true;
    }
    const hsr = window.hitScreen;
    if (typeof hsr === 'function' && !hsr.__sfx) {
      window.hitScreen = function (targetSide, tp, fx, fy) {
        const r = hsr.apply(this, arguments);
        try { microHit(targetSide, fx, fy); } catch (e) {}
        return r;
      };
      window.hitScreen.__sfx = true;
    }
  }
  hook(); hookGround();
  /* 테스트/수동 실행용 */
  SF.test = function (sk, side) {
    SF.start(sk, side || (window.me === 'c' ? 'h' : 'c'));
    setTimeout(() => window.hitCamp(side || (window.me === 'c' ? 'h' : 'c'), sk), 700);
  };
  SF.clear = () => { CRK.length = 0; NODES.length = 0; PS.length = 0; SCORCH.length = 0; ARCS.length = 0; RINGS.length = 0; TXT.length = 0; SMK.length = 0; warn = null; };
  requestAnimationFrame(loop);
})();
