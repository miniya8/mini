/* ============================================================================
 * [응징 스킬 연출 강화 모듈 v2]  js/skill-fx-v2.js
 *  skill-fx.js(불·균열·그을음) 위에 겹쳐지는 '화려함 레이어'입니다. 게임 로직에는 영향 없음.
 *  - 발동 전 : 상대 진영 바닥에 팔괘 마법진이 떠오르고 기운이 빨려 들어감(충전)
 *  - 타격    : 코어 섬광 · 이중 충격파 · 성광(갓레이) · 마법진 · 낙뢰/전기 아크 · 불기둥
 *              불똥/불씨/연기 · 화면 비네트 섬광 · 금빛 기술명 배너(검광 스윕)
 *  - 여운    : 진영 위로 불씨가 오래 흩날림
 *  - 이미지  : assets/images/fx/v2_*.webp (충격파·번개·불꽃·마법진·성광·글로우·불똥·연기·비네트)
 *  끄기: jgSkillFx2.enabled = false
 * ============================================================================ */
(function jgSkillFx2Module() {
  if (window.__JG_SKILLFX2__) return;
  window.__JG_SKILLFX2__ = true;
  const F2 = window.jgSkillFx2 = { enabled: true };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const outBack = k => { k = clamp(k, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

  /* ---------- 이미지 ---------- */
  const DIR = 'assets/images/fx/';
  const IM = {};
  const load = n => { const im = new Image(); im.src = DIR + n + '.webp'; return im; };
  ['o', 'b', 'g', 'y', 'p'].forEach(k => { IM['shock_' + k] = load('v2_shock_' + k); IM['rays_' + k] = load('v2_rays_' + k); IM['rune_' + k] = load('v2_rune_' + k); IM['glow_' + k] = load('v2_glow_' + k); });
  ['b', 'y', 'g', 'p'].forEach(k => { IM['bolt_' + k] = load('v2_bolt_' + k); });
  ['o', 'b', 'g', 'p'].forEach(k => { IM['flame_' + k] = load('v2_flame_' + k); });
  IM.sparks = load('v2_sparks'); IM.smoke = load('v2_smoke'); IM.vig = load('v2_vignette');
  const ok = im => !!im && im.complete && im.naturalWidth > 0;

  const RGB = { o: '255,150,60', b: '90,190,255', g: '130,255,120', y: '255,215,80', p: '210,100,255' };
  const tcache = {};
  function tinted(key, img, rgb, a) {
    const id = key + '|' + rgb; if (tcache[id]) return tcache[id];
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height);
    return (tcache[id] = c);
  }

  /* ---------- 스킬별 테마 ----------
   * c: 색(o주황 b푸른 g녹색 y금색 p보라)  bolt: 번개색  flame: 불기둥색  rune: 마법진  rays: 성광  big: 규모 */
  const TH = {
    nuke:   { c: 'o', flame: 'o', rune: 'o', rays: 'o', sky: 0, arc: 3, big: 1.5, smoke: 1.3, rain: 'o', title: '核  大爆發', sub: '핵폭탄', charge: 1 },
    meteor: { c: 'o', flame: 'o', rune: 'o', rays: 'o', sky: 0, arc: 2, big: 1.35, smoke: 1.1, rain: 'o', title: '隕石  墜落', sub: '메테오', charge: 1 },
    alien:  { c: 'g', flame: 'g', rune: 'g', rays: 'g', bolt: 'g', sky: 1, arc: 5, big: 1.2, smoke: .5, rain: 'g', title: '異星  光線', sub: '외계인', charge: 1 },
    kame:   { c: 'b', flame: 'b', rune: 'b', rays: 'b', bolt: 'b', sky: 0, arc: 6, big: 1.2, smoke: .3, rain: 'b', title: '氣功波', sub: '에네르기파', charge: 1 },
    kame2:  { c: 'b', flame: 'b', rune: 'b', rays: 'b', bolt: 'b', sky: 1, arc: 8, big: 1.5, smoke: .4, rain: 'b', title: '破壞  光線', sub: '에네르기파 2', charge: 1 },
    warlord:         { c: 'y', rune: 'y', rays: 'y', bolt: 'y', sky: 2, arc: 4, big: 1.25, smoke: .3, rain: 'y', title: '君主  必殺', sub: '군주 필살응징', charge: 1 },
    warlord_liubei:  { c: 'g', rune: 'g', rays: 'g', bolt: 'g', sky: 1, arc: 5, big: 1.2, smoke: .25, rain: 'g', title: '仁義  雙劍', sub: '쌍검합벽', charge: 1 },
    warlord_lvbu:    { c: 'p', flame: 'p', rune: 'p', rays: 'p', bolt: 'p', sky: 3, arc: 6, big: 1.45, smoke: .6, rain: 'p', title: '天下  無雙', sub: '방천귀신격', charge: 1 },
    warlord_simayi:  { c: 'b', rune: 'b', rays: 'b', bolt: 'b', sky: 1, arc: 5, big: 1.2, smoke: .3, rain: 'b', title: '狼顧  氷結', sub: '낭고빙결', charge: 1 },
    warlord_caocao:  { c: 'o', flame: 'o', rune: 'o', rays: 'y', bolt: 'y', sky: 3, arc: 5, big: 1.35, smoke: .4, rain: 'o', title: '霸王  雷電', sub: '패왕뇌전', charge: 1 },
    warlord_sunquan: { c: 'b', rune: 'b', rays: 'b', bolt: 'b', sky: 1, arc: 5, big: 1.25, smoke: .3, rain: 'b', title: '破天  怒濤', sub: '파천노도', charge: 1 },
    warlord_zhuge:   { c: 'y', rune: 'y', rays: 'y', bolt: 'y', sky: 2, arc: 5, big: 1.25, smoke: .25, rain: 'y', title: '八陣  天機', sub: '와룡성광포', charge: 1 },
    skyfall: { c: 'y', rune: 'y', rays: 'y', bolt: 'y', sky: 5, arc: 6, big: 1.5, smoke: .4, rain: 'y', title: '天罰  星槍', sub: '천벌성창', charge: 1 },
    vortex:  { c: 'b', rune: 'b', rays: 'b', bolt: 'b', sky: 1, arc: 8, big: 1.5, smoke: .3, rain: 'b', title: '次元  渦流砲', sub: '차원와류포', charge: 1 },
    /* 주먹·망치·총: 불 없이 충격파와 파편 위주 */
    fist:   { c: 'y', sky: 0, arc: 0, big: .8, smoke: .8, small: 1 },
    hammer: { c: 'b', sky: 0, arc: 0, big: .85, smoke: .6, small: 1 },
    gun:    { c: 'o', sky: 0, arc: 0, big: .6, smoke: .3, small: 1 }
  };

  /* ---------- 오버레이 캔버스 ---------- */
  let cvO = null, go = null, W = 0, H = 0, RC = { left: 0, top: 0, width: 0, height: 0 }, lastT = 0;
  function ensureCanvas() {
    if (cvO) return true;
    if (!document.body) return false;
    cvO = document.createElement('canvas'); cvO.id = 'jg_skillfx2_cv';
    cvO.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:11;';
    document.body.appendChild(cvO); go = cvO.getContext('2d');
    return true;
  }
  const gameVisible = () => {
    const g = document.getElementById('g');
    return !!g && g.style.display !== 'none' && typeof cv !== 'undefined' && !!cv && cv.offsetWidth > 0 && cv.offsetHeight > 0;
  };
  const cell = () => (typeof C === 'number' && C > 0) ? C : (typeof CX === 'number' ? CX : 40);
  function campRect(side) {
    const isBottom = flip ? (side === 'h') : (side === 'c');
    const ox = RC.left + OX, oy = RC.top + OY, bw = 8 * CX, bh = 4.42 * CY, padX = CX * .42, padY = CY * .42;
    return { x0: ox - padX, w: bw + padX * 2, y0: isBottom ? (oy + 4.55 * CY) : (oy - padY), h: bh + padY, isBottom };
  }

  /* ---------- 데이터 ---------- */
  const FX = [], PT = [];
  let charge = null;
  const hitState = {};

  function addFx(o) { if (FX.length > 90) FX.shift(); o.t0 = performance.now(); FX.push(o); return o; }
  function sp(o) {
    if (PT.length > 420) PT.shift();
    const p = Object.assign({ type: 'spark', x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, age: 0, life: 1, size: 8, a: 1, rgb: RGB.o, rot: 0, vr: 0, grow: 0, cellN: 0, add: true }, o);
    PT.push(p); return p;
  }

  /* ---------- 그리기 도우미 ---------- */
  function addDraw(g, img, sx, sy, sw, sh, dx, dy, dw, dh, a) {
    if (!ok(img) || a <= 0.004) return;
    g.globalAlpha = clamp(a, 0, 1);
    g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  /* ---------- 개별 이펙트 ---------- */
  /* 코어 섬광 */
  function fxGlow(x, y, c, size, life, delay) {
    addFx({ delay: delay || 0, life, fn(g, k) {
      const img = IM['glow_' + c]; if (!ok(img)) return;
      const s = size * (.4 + .85 * outCubic(k * 3)) * (1 - .3 * k), a = Math.pow(1 - k, 1.25);
      g.globalCompositeOperation = 'lighter';
      addDraw(g, img, 0, 0, 256, 256, x - s / 2, y - s / 2, s, s, a);
      const s2 = s * .45; addDraw(g, IM['glow_y'], 0, 0, 256, 256, x - s2 / 2, y - s2 / 2, s2, s2, a * .8);
    } });
  }
  /* 충격파 링 (8프레임 시트, 바닥에 눕힘) */
  function fxShock(x, y, c, size, life, delay, flat) {
    addFx({ delay: delay || 0, life, fn(g, k) {
      const img = IM['shock_' + c]; if (!ok(img)) return;
      const f = Math.min(7, (k * 8) | 0), sx = (f % 4) * 256, sy = ((f / 4) | 0) * 256;
      g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(x, y + cell() * .12); g.scale(1, flat || .56);
      addDraw(g, img, sx, sy, 256, 256, -size / 2, -size / 2, size, size, 1 - k * .35);
      g.restore();
    } });
  }
  /* 성광(갓레이) */
  function fxRays(x, y, c, size, life, delay) {
    const dir = Math.random() < .5 ? 1 : -1;
    addFx({ delay: delay || 0, life, fn(g, k, age) {
      const img = IM['rays_' + c]; if (!ok(img)) return;
      const a = ease(k * 7) * Math.pow(1 - k, 1.15), s = size * (.8 + .35 * outCubic(k));
      g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(x, y); g.rotate(age * .32 * dir);
      addDraw(g, img, 0, 0, 512, 512, -s / 2, -s / 2, s, s, a);
      g.rotate(-age * .6 * dir); const s2 = s * .62; addDraw(g, img, 0, 0, 512, 512, -s2 / 2, -s2 / 2, s2, s2, a * .8);
      g.restore();
    } });
  }
  /* 마법진 (바닥, 천천히 회전) */
  function fxRune(x, y, c, size, life, delay, fadeIn) {
    const dir = Math.random() < .5 ? 1 : -1, fi = fadeIn || .12;
    addFx({ delay: delay || 0, life, fn(g, k, age) {
      const img = IM['rune_' + c]; if (!ok(img)) return;
      const a = ease(k / fi) * (1 - ease((k - .62) / .38)), grow = .86 + .14 * outCubic(k * 4);
      g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(x, y + cell() * .1); g.scale(1, .54);
      g.rotate(age * .5 * dir); const s = size * grow; addDraw(g, img, 0, 0, 512, 512, -s / 2, -s / 2, s, s, a * .9);
      g.rotate(-age * 1.05 * dir); const s2 = s * .6; addDraw(g, img, 0, 0, 512, 512, -s2 / 2, -s2 / 2, s2, s2, a * .75);
      g.restore();
    } });
  }
  /* 낙뢰 : 하늘에서 내리꽂힘 */
  function fxSkyBolt(x, y, c, delay, wMul) {
    const flip = Math.random() < .5 ? -1 : 1, f0 = (Math.random() * 6) | 0, life = rnd(.42, .62);
    addFx({ delay, life, fn(g, k, age) {
      const img = IM['bolt_' + c]; if (!ok(img)) return;
      const f = (f0 + ((age / .06) | 0)) % 6, h = Math.max(cell() * 3, y - RC.top + cell() * .5), w = h * .5 * (wMul || 1.15);
      const a = (.55 + .45 * Math.abs(Math.sin(age * 52))) * Math.pow(1 - k, .8);
      g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(x, y); g.scale(flip, 1);
      addDraw(g, img, f * 256, 0, 256, 512, -w / 2, -h, w, h, a);
      addDraw(g, img, f * 256, 0, 256, 512, -w / 2, -h, w, h, a * .6);
      g.restore();
    } });
  }
  /* 전기 아크 : 충격 지점에서 사방으로 뻗음 */
  function fxArc(x, y, c, ang, len, delay) {
    const f0 = (Math.random() * 6) | 0, life = rnd(.3, .5);
    addFx({ delay, life, fn(g, k, age) {
      const img = IM['bolt_' + c]; if (!ok(img)) return;
      const f = (f0 + ((age / .05) | 0)) % 6, L = len * (.55 + .45 * outCubic(k * 4)), a = (.5 + .5 * Math.abs(Math.sin(age * 60))) * Math.pow(1 - k, .9);
      g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(x, y + cell() * .1); g.scale(1, .72); g.rotate(ang - Math.PI / 2);
      addDraw(g, img, f * 256, 0, 256, 512, -L * .25, 0, L * .5, L, a);
      g.restore();
    } });
  }
  /* 불기둥 (프레임 애니메이션) */
  function fxFlame(x, y, c, w, life, delay) {
    const seed = (Math.random() * 8) | 0, fps = rnd(11, 16), ph = rnd(0, 6);
    addFx({ delay, life, fn(g, k, age) {
      const img = IM['flame_' + c]; if (!ok(img)) return;
      const f = (seed + ((age * fps) | 0)) % 8, a = ease(k * 5) * (1 - ease((k - .68) / .32)) * .92;
      const h = w * 1.55 * (.88 + .18 * Math.sin(age * 9 + ph)), sw = w * (1 + .06 * Math.sin(age * 7 + ph)), ox = Math.sin(age * 2.6 + ph) * w * .05;
      g.globalCompositeOperation = 'lighter';
      addDraw(g, img, (f % 4) * 128, ((f / 4) | 0) * 192, 128, 192, x - sw / 2 + ox, y + cell() * .18 - h, sw, h, a);
    } });
  }
  /* 화면 비네트 섬광 */
  function fxScreen(c, life, str) {
    addFx({ delay: 0, life, fn(g, k) {
      const vig = IM.vig; if (!ok(vig)) return;
      const t = tinted('vig', vig, RGB[c], .9);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = clamp(Math.pow(1 - k, 1.4) * (str || .85), 0, 1);
      g.drawImage(t, RC.left, RC.top, RC.width, RC.height);
      if (k < .2) { g.globalAlpha = (1 - k / .2) * .28 * (str || 1); g.fillStyle = `rgb(${RGB[c]})`; g.fillRect(RC.left, RC.top, RC.width, RC.height); }
    } });
  }
  /* 기술명 배너 */
  function fxBanner(title, sub, c, delay) {
    const FONT = '"Noto Serif KR","Nanum Myeongjo","Noto Serif CJK KR","Songti SC","Batang",serif';
    addFx({ delay: delay || 0, life: 2.1, top: true, fn(g, k, age) {
      const cx = RC.left + RC.width / 2, cy = RC.top + RC.height * .45, size = clamp(RC.width * .082, 26, 96);
      const sc = outBack(age / .38), a = ease(age / .12) * (1 - ease((age - 1.65) / .45));
      if (a <= .01) return;
      g.save(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
      g.translate(cx, cy); g.rotate(-.025); g.scale(sc, sc);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${size}px ${FONT}`;
      const wd = Math.min(RC.width * .94, g.measureText(title).width + size * .6);
      /* 위아래 금선 */
      const ln = g.createLinearGradient(-wd / 2, 0, wd / 2, 0); ln.addColorStop(0, `rgba(${RGB[c]},0)`); ln.addColorStop(.5, 'rgba(255,248,210,.95)'); ln.addColorStop(1, `rgba(${RGB[c]},0)`);
      g.fillStyle = ln; g.fillRect(-wd / 2, -size * .72, wd, 3); g.fillRect(-wd / 2, size * .72, wd, 3);
      g.shadowColor = `rgba(${RGB[c]},.95)`; g.shadowBlur = size * .42;
      g.lineJoin = 'round'; g.lineWidth = size * .15; g.strokeStyle = 'rgba(25,10,0,.92)'; g.strokeText(title, 0, 0);
      const fg = g.createLinearGradient(0, -size * .55, 0, size * .55); fg.addColorStop(0, '#fffdf2'); fg.addColorStop(.45, '#ffe9a0'); fg.addColorStop(1, `rgb(${RGB[c]})`);
      g.fillStyle = fg; g.fillText(title, 0, 0);
      g.shadowBlur = 0;
      /* 검광 스윕 */
      const sw = -wd / 2 + (wd + size) * clamp((age - .25) / .6, 0, 1) - size * .3;
      if (age > .25 && age < .9) {
        const sg = g.createLinearGradient(sw - size * .35, 0, sw + size * .35, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.95)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = sg; g.fillText(title, 0, 0);
      }
      if (sub) {
        g.font = `800 ${size * .3}px ${FONT}`; g.lineWidth = size * .07; g.strokeStyle = 'rgba(20,8,0,.9)'; g.strokeText(sub, 0, size * .95); g.fillStyle = '#fff3c4'; g.fillText(sub, 0, size * .95);
      }
      g.restore();
    } });
  }
  /* 진영 위로 흩날리는 불씨 */
  function fxEmberRain(side, c, life) {
    let acc = 0, last = performance.now();
    addFx({ delay: .3, life, fn(g, k) {
      const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
      acc += dt * 26 * Math.pow(1 - k, 1.3);
      const cr = campRect(side);
      while (acc >= 1) {
        acc -= 1;
        sp({ type: 'ember', x: cr.x0 + Math.random() * cr.w, y: cr.y0 + cr.h * rnd(.35, 1), vx: rnd(-14, 22), vy: -rnd(30, 95), ay: -6, drag: .995, life: rnd(2.4, 4.6), size: cell() * rnd(.07, .16), rgb: RGB[c], cellN: pick([6, 7, 0]), flick: rnd(8, 16) });
      }
    } });
  }

  /* ---------- 파티클 ---------- */
  function updatePT(dt) {
    for (let i = PT.length - 1; i >= 0; i--) {
      const p = PT[i]; p.age += dt;
      if (p.age >= p.life) { PT.splice(i, 1); continue; }
      p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.ay * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
  }
  function drawPT(g) {
    const sheet = IM.sparks, smk = IM.smoke;
    for (const p of PT) {
      const k = p.age / p.life;
      if (p.type === 'smoke') {
        if (!ok(smk)) continue;
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = clamp(p.a * (1 - k) * ease(k * 6), 0, 1);
        const s = p.size * (1 + p.grow * k);
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.drawImage(smk, p.cellN * 256, 0, 256, 256, -s / 2, -s / 2, s, s); g.restore();
        continue;
      }
      if (!ok(sheet)) continue;
      const t = tinted('sp', sheet, p.rgb, .8);
      let a = (1 - k) * p.a, s = p.size;
      if (p.type === 'ember') a *= .55 + .45 * Math.sin(p.age * p.flick + p.x);
      if (p.type === 'spark') s *= (1 - k * .55);
      if (p.type === 'glow') s *= (1 + k * .8);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a, 0, 1);
      g.save(); g.translate(p.x, p.y); if (p.type === 'spark') g.rotate(p.rot);
      g.drawImage(t, p.cellN * 64, 0, 64, 64, -s, -s, s * 2, s * 2); g.restore();
    }
  }
  function burst(x, y, c, pw, th) {
    const cl = cell(), rgb = RGB[c];
    for (let i = 0, n = (46 * pw) | 0; i < n; i++) {   // 불똥
      const a = rnd(0, TAU), v = rnd(160, 620) * (.7 + th.big * .4);
      sp({ type: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8 - 140, ay: 640, drag: .987, life: rnd(.7, 1.7), size: cl * rnd(.14, .32), rgb, cellN: pick([3, 4, 5]), rot: rnd(0, TAU), vr: rnd(-6, 6) });
    }
    for (let i = 0, n = (14 * pw) | 0; i < n; i++) {   // 큰 빛 알갱이
      const a = rnd(0, TAU), v = rnd(30, 200);
      sp({ type: 'glow', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .7 - 40, drag: .97, life: rnd(.6, 1.3), size: cl * rnd(.25, .55), a: .8, rgb, cellN: pick([0, 1, 2]) });
    }
    for (let i = 0, n = (28 * pw) | 0; i < n; i++) {   // 불씨
      sp({ type: 'ember', x: x + rnd(-cl, cl), y: y + rnd(-cl * .4, cl * .4), vx: rnd(-50, 50), vy: -rnd(50, 190), ay: -10, drag: .99, life: rnd(2, 5), size: cl * rnd(.07, .17), rgb, cellN: pick([6, 7, 0]), flick: rnd(8, 18) });
    }
    for (let i = 0, n = Math.round(8 * th.smoke * pw); i < n; i++) {   // 연기
      sp({ type: 'smoke', x: x + rnd(-cl, cl), y: y + rnd(-cl * .3, cl * .5), vx: rnd(-30, 30), vy: -rnd(25, 80), life: rnd(2.2, 4), size: cl * rnd(1.2, 2.2), grow: 1.6, a: .5, rot: rnd(0, TAU), vr: rnd(-.3, .3), cellN: (Math.random() * 4) | 0, add: false });
    }
  }

  /* ---------- 충전(발동 전) ---------- */
  function startCharge(sk, V) {
    const th = TH[sk]; if (!th || !th.charge || !gameVisible()) return;
    charge = { sk, V, th, t0: performance.now(), acc: 0, off: 0 };
  }
  function drawCharge(g, now, dt) {
    if (!charge) return;
    const age = (now - charge.t0) / 1000;
    if (age > 6.5) { charge = null; return; }
    const th = charge.th, c = th.c, cr = campRect(charge.V), x = cr.x0 + cr.w / 2, y = cr.y0 + cr.h * .52, cl = cell();
    const a = ease(age / .9) * (1 - ease((age - 5.6) / .9));
    const img = IM['rune_' + c];
    g.globalCompositeOperation = 'lighter';
    if (ok(img)) {
      const s = Math.min(cr.w * 1.02, cl * 8.2) * (.78 + .22 * outCubic(age / 1.1));
      g.save(); g.translate(x, y); g.scale(1, .54); g.rotate(age * .6); addDraw(g, img, 0, 0, 512, 512, -s / 2, -s / 2, s, s, a * .75);
      g.rotate(-age * 1.3); const s2 = s * .62; addDraw(g, img, 0, 0, 512, 512, -s2 / 2, -s2 / 2, s2, s2, a * .6); g.restore();
    }
    const gl = IM['glow_' + c];
    if (ok(gl)) { const pulse = .7 + .3 * Math.sin(age * 9), s = cl * (1.2 + Math.min(age, 2.5) * 1.1) * pulse; addDraw(g, gl, 0, 0, 256, 256, x - s / 2, y - s / 2, s, s, a * .7); }
    charge.acc += dt * 38 * a;
    while (charge.acc >= 1) {   // 기운이 중심으로 빨려 들어감
      charge.acc -= 1;
      const ang = rnd(0, TAU), R = cl * rnd(2.6, 4.2), life = rnd(.7, 1.1), sx = x + Math.cos(ang) * R, sy = y + Math.sin(ang) * R * .55;
      sp({ type: 'spark', x: sx, y: sy, vx: (x - sx) / life, vy: (y - sy) / life, life, size: cl * rnd(.1, .2), rgb: RGB[c], cellN: pick([0, 1, 3]), a: .9 });
    }
  }

  /* ---------- 타격 ---------- */
  function onHit(side, sk, extra) {
    const th = TH[sk]; if (!th || !F2.enabled || !gameVisible()) return;
    RC = cv.getBoundingClientRect();
    const now = performance.now(), st = hitState[sk] || (hitState[sk] = { n: 0, t: 0 });
    if (now - st.t > 3200) st.n = 0;
    st.t = now; const major = st.n === 0; st.n++;
    charge = null;
    const hits = (window.DMG_SK && window.DMG_SK[side]) || [], last = hits[hits.length - 1] || { fx: .5, fy: .5, rot: 0 };
    const fx = extra && extra.fx != null ? extra.fx : last.fx, fy = extra && extra.fy != null ? extra.fy : last.fy;
    const cr = campRect(side), x = cr.x0 + fx * cr.w, y = cr.y0 + fy * cr.h, cl = cell(), c = th.c;
    const pw = (major ? 1 : .6) * (th.small ? .6 : 1), R = Math.min(cl * 5.0 * th.big, cr.w * .6) * (major ? 1 : .72);

    fxGlow(x, y, c, R * .95, major ? .75 : .55);
    fxShock(x, y, c, R * 1.1, .85, 0, .56);
    if (!th.small) fxShock(x, y, c === 'y' ? 'o' : c, R * 1.5, 1.1, .14, .52);
    if (major && !th.small) fxShock(x, y, 'y', R * 1.95, 1.35, .3, .5);
    if (th.rays && !th.small) fxRays(x, y, th.rays, R * 1.5, major ? 1.5 : 1.0);
    if (th.rune && !th.small) fxRune(x, y, th.rune, R * (major ? 1.55 : 1.15), major ? 3.2 : 2.2, 0, .1);
    if (th.bolt) {
      for (let i = 0; i < th.sky * (major ? 1 : .6); i++) fxSkyBolt(x + rnd(-1.1, 1.1) * cl * (1 + i * .5), y + rnd(-.3, .3) * cl, th.bolt, i * .07 + (major ? 0 : .02));
      const na = Math.round(th.arc * (major ? 1 : .6));
      for (let i = 0; i < na; i++) fxArc(x, y, th.bolt, (i / Math.max(1, na)) * TAU + rnd(-.3, .3), cl * rnd(2.4, 4.6) * th.big, rnd(.02, .5));
    }
    if (th.flame && !th.small) {
      const nf = major ? 9 : 5;
      for (let i = 0; i < nf; i++) {
        const a = rnd(0, TAU), d = Math.sqrt(Math.random()) * cl * 2.6 * th.big;
        fxFlame(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, th.flame, cl * rnd(1.15, 2.1), rnd(2.6, 4.4), rnd(.05, 1.4));
      }
    }
    burst(x, y, c, pw, th);
    if (major) {
      fxScreen(c, 1.5, th.small ? .45 : .9);
      if (!th.small) { fxBanner(th.title, th.sub, c, .05); if (th.rain) fxEmberRain(side, th.rain, 7); }
    } else fxScreen(c, .8, .4);
  }

  /* ---------- 갱신/그리기 ---------- */
  function runFx(g, now, top) {
    for (let i = FX.length - 1; i >= 0; i--) {
      const f = FX[i]; if (!!f.top !== top) continue;
      const age = (now - f.t0) / 1000 - f.delay;
      if (age < 0) continue;
      const k = age / f.life; if (k >= 1) { FX.splice(i, 1); continue; }
      g.save();
      try { f.fn(g, k, age); } catch (e) { FX.splice(i, 1); }
      g.restore();
    }
  }
  function draw(g, now, dt) {
    drawCharge(g, now, dt);
    runFx(g, now, false);
    updatePT(dt);
    g.save(); drawPT(g); g.restore();
    runFx(g, now, true);   /* 기술명 배너는 맨 위에 */
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!ensureCanvas()) return;
    const dt = Math.min(.05, Math.max(.001, (now - (lastT || now)) / 1000)); lastT = now;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5), Wn = window.innerWidth, Hn = window.innerHeight;
    if (cvO.width !== Math.round(Wn * dpr) || cvO.height !== Math.round(Hn * dpr)) { cvO.width = Math.round(Wn * dpr); cvO.height = Math.round(Hn * dpr); }
    W = Wn; H = Hn;
    go.setTransform(dpr, 0, 0, dpr, 0, 0); go.clearRect(0, 0, W, H);
    if (!F2.enabled || !gameVisible()) { if (FX.length || PT.length || charge) { FX.length = 0; PT.length = 0; charge = null; } return; }
    if (!FX.length && !PT.length && !charge) return;
    RC = cv.getBoundingClientRect();
    go.save(); go.beginPath(); go.rect(RC.left, RC.top, RC.width, RC.height); go.clip();
    draw(go, performance.now(), dt);
    go.restore();
  }

  /* ---------- 훅 연결 (다른 모듈이 덮어써도 다시 연결) ---------- */
  function hook() {
    const hc = window.hitCamp;
    if (typeof hc === 'function' && !hc.__sfx2) {
      const w = function (s, sk, extra) {
        const r = hc.apply(this, arguments);
        try { onHit(s, sk || 'nuke', extra); } catch (e) {}
        return r;
      };
      w.__sfx2 = true; if (hc.__sfx) w.__sfx = true;
      window.hitCamp = w;
    }
    const S = window.jgSkillFx;
    if (S && typeof S.start === 'function' && !S.start.__sfx2) {
      const os = S.start;
      S.start = function (sk, V) {
        const r = os.apply(this, arguments);
        try { startCharge(sk, V); } catch (e) {}
        return r;
      };
      S.start.__sfx2 = true;
    }
  }
  hook(); setInterval(hook, 1500);

  F2.test = function (sk, side) {
    const s = side || (window.me === 'c' ? 'h' : 'c');
    if (window.jgSkillFx && window.jgSkillFx.start) window.jgSkillFx.start(sk, s);
    setTimeout(() => window.hitCamp(s, sk), 1400);
  };
  F2.clear = () => { FX.length = 0; PT.length = 0; charge = null; };
  requestAnimationFrame(loop);
})();
