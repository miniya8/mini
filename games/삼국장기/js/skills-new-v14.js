/* ============================================================================
 * [새 응징 스킬 4종 v14]  js/skills-new-v14.js   (이미지: assets/images/fx/skl_*.webp · dmg_*.webp 직접 생성)
 *  삭제된 핵폭탄 · 메테오 · 에네르기파2 · 차원와류포 자리에 새 스킬을 넣습니다.
 *  (버튼·AI·멀티 동기화 경로는 기존 슬롯을 그대로 써서 안정적으로 동작)
 *   🔥 화룡 강림  (핵폭탄 자리)    : 불타는 용이 하늘을 휘감아 내려와 진영을 화염 브레스로 휩쓸고 지나감 → [그을린 불 자국 + 남은 불씨]
 *   ⛈️ 뇌신 폭풍  (메테오 자리)    : 먹구름이 몰려와 낙뢰가 연달아 내리꽂히고 마지막 삼중 낙뢰 → [번개 흉터(가지 무늬) + 감전 그을음]
 *   🧊 빙하 붕괴  (차원와류포 자리) : 거대한 빙하 덩어리가 떨어져 산산조각 → [얼어붙은 판 + 박힌 얼음 파편]
 *   🌋 대지 분쇄  (에네르기파2 자리): 땅울림 → 지각이 갈라지며 용암 균열이 내달리고 바위 기둥이 솟구침 → [용암 단층 균열 + 바위 잔해]
 *  장기판 파손은 스킬 성질별로 다른 이미지로 남고(판을 다시 시작하거나 피해가 회복되면 사라짐), 기물은 가리지 않습니다.
 * ============================================================================ */
(function jgSkillsNew14() {
  if (window.jgSkillsNew14) return;
  const N14 = window.jgSkillsNew14 = { enabled: true };
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[(Math.random() * a.length) | 0], clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = k => { k = clamp(k, 0, 1); return k * k * k * (k * (k * 6 - 15) + 10); }, outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3), inCubic = k => clamp(k, 0, 1) ** 3, outBack = k => { k = clamp(k, 0, 1); const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const kk = (t, a, b) => clamp((t - a) / (b - a), 0, 1), Q = () => window.jgPerf ? window.jgPerf.q : 1, LOW = () => Q() < .6;

  /* ---------- 이미지 ---------- */
  const IM = {}, L = (k, n) => { const i = new Image(); i.src = 'assets/images/fx/' + n + '.webp'; IM[k] = i; };
  ['dragonhead', 'scale', 'glacier', 'rockspike'].forEach(n => L(n, 'skl_' + n)); ['burn', 'lichten', 'ice', 'fault', 'acid', 'plasma', 'holy', 'bloom'].forEach(n => L('d_' + n, 'dmg_' + n)); L('petal', 'wl_petal'); L('smoke', 'env_smoke'); L('starflare', 'wl_starflare');
  ['sparks', 'glow_o', 'glow_b', 'glow_y', 'glow_p', 'shock_o', 'shock_b', 'shock_y', 'shock_p', 'bolt_b', 'bolt_y', 'bolt_p', 'flame_o', 'vignette'].forEach(n => L(n, 'v2_' + n));
  ['ice', 'rock', 'ribbon', 'softflash', 'fissure', 'net'].forEach(n => L(n, 'wl_' + n)); L('billow', 'fx_billow'); L('vapor', 'fx_vapor'); L('fireball', 'fx_fireball'); L('frost', 'env_frost'); L('firewall', 'ult_firewall');
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
  /* ---------- 영상 장면 (사용자 제공 GIF 5개 → 묶음 webp, 원본 3초 · 장면 사이는 부드럽게 섞음) ----------
   *  cine_*      : 영상 컷인 창용(불투명)       cine_*_glow : 판 위에 겹치는 용(어두운 부분 투명, 빛나는 부분만) */
  const CLIP = { wasteland: [15, 448, 252], dragon: [20, 448, 252], stormsky: [15, 448, 252], tornado: [15, 448, 252], ice: [20, 448, 252], wasteland_glow: [15, 384, 216], tornado_glow: [15, 384, 216] }, CLEN = 3.0;
  Object.keys(CLIP).forEach(k => { const i = new Image(); i.decoding = 'async'; i.src = 'assets/images/fx/cine_' + k + '.webp'; CLIP[k].push(i); });
  /* 게임 시작 후 한가할 때 영상 그림을 미리 풀고 한 번 그려 두어 첫 재생 끊김을 막음 (메모리가 적은 폰은 생략) */
  setTimeout(() => { if (window.jgPerf && window.jgPerf.lowMem) return; const tiny = document.createElement('canvas'); tiny.width = tiny.height = 2; const tg = tiny.getContext('2d'); Object.keys(CLIP).forEach((k, n) => setTimeout(() => { const i = CLIP[k][3]; const warm = () => { try { tg.drawImage(i, 0, 0, 2, 2); } catch (e) {} }; try { (i.decode ? i.decode() : Promise.resolve()).then(warm, warm); } catch (e) {} }, n * 400)); }, 3500);
  function clip(g, key, ct, x, y, w, h, a, glowMode) {
    const c = CLIP[key]; if (!c || a <= .004) return; const [n, FW, FH, im] = c; if (!ok(im)) return;
    const f = clamp(ct / CLEN * n, 0, n - 1.001), f0 = Math.floor(f), f1 = Math.min(n - 1, f0 + 1), mx = LOW() ? 0 : f - f0, sx = k => (k % 5) * FW, sy = k => ((k / 5) | 0) * FH;
    g.save();
    if (glowMode) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a * (1 - mx), 0, 1); g.drawImage(im, sx(f0), sy(f0), FW, FH, x, y, w, h); if (mx > .02) { g.globalAlpha = clamp(a * mx, 0, 1); g.drawImage(im, sx(f1), sy(f1), FW, FH, x, y, w, h); } }
    else { g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, sx(f0), sy(f0), FW, FH, x, y, w, h); if (mx > .02) { g.globalAlpha = clamp(a * mx, 0, 1); g.drawImage(im, sx(f1), sy(f1), FW, FH, x, y, w, h); } }
    g.restore();
  }
  /* 영상 컷인 창: 진영 위에 떠올라 재생되다가 착탄 순간 터지며 사라짐 */
  function cinePanel(g, M, st, t, tIn, tOut, rgb, draw, burst) {
    const inQ = outBack(kk(t, tIn, tIn + .3)), outQ = kk(t, tOut, tOut + .28), vis = smooth(kk(t, tIn, tIn + .15)) * (1 - smooth(outQ)); if (vis <= .004) { if (outQ >= 1 && !st.pb) { st.pb = 1; } return; }
    const W = M.W, H = M.H, pw = Math.min(W * .94, M.camp.w * 1.18), ph = pw * 9 / 16, cx = M.cx, cy = clamp(M.cy, ph / 2 + H * .09, H - ph / 2 - H * .09);
    /* 화면 어둡게 + 위아래 시네마 띠 */
    g.save(); g.fillStyle = `rgba(0,0,0,${.5 * vis})`; g.fillRect(0, 0, W, H); const bh = H * .085 * vis; g.fillStyle = '#000'; g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh); g.fillStyle = `rgba(${rgb},${.9 * vis})`; g.fillRect(0, bh - 2, W, 2); g.fillRect(0, H - bh, W, 2); g.restore();
    g.save(); g.translate(cx, cy); g.rotate(-.03 + .03 * (1 - inQ)); const sc = (.78 + .22 * inQ) * (1 + .22 * outQ); g.scale(sc, sc); g.globalAlpha = vis;
    g.save(); g.beginPath(); g.rect(-pw / 2, -ph / 2, pw, ph); g.clip(); g.fillStyle = '#000'; g.fillRect(-pw / 2, -ph / 2, pw, ph);
    const kb = 1.04 + .08 * kk(t, tIn, tOut); draw(g, -pw * kb / 2, -ph * kb / 2, pw * kb, ph * kb);
    if (outQ > 0) { g.fillStyle = `rgba(255,255,255,${.8 * Math.sin(outQ * Math.PI)})`; g.fillRect(-pw / 2, -ph / 2, pw, ph); }
    g.restore();
    /* 테두리: 진영 색 이중선 + 빛 */
    g.lineJoin = 'round'; g.strokeStyle = `rgba(${rgb},1)`; g.lineWidth = 3; g.strokeRect(-pw / 2, -ph / 2, pw, ph); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${rgb},.35)`; g.lineWidth = 12; g.strokeRect(-pw / 2, -ph / 2, pw, ph); g.restore();
    if (outQ > 0 && !st.pb) { st.pb = 1; burst && burst(cx, cy, pw, ph); }
  }

  const tc = {}; function tint(img, key, rgb, a) { const id = key + '|' + rgb + '|' + a; if (tc[id]) return tc[id]; if (!ok(img)) return img; const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }

  /* ---------- 소리 ---------- */
  let AC = null; const ac = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  const sfxOn = () => !(window.jgEnv3 && window.jgEnv3.sfx === false);
  function tone(type, f0, f1, dur, vol, dl) { if (!sfxOn()) return; const a = ac(); if (!a) return; try { const t0 = a.currentTime + (dl || 0), o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .03); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .05); } catch (e) {} }
  function noise(dur, ft, f0, f1, vol, dl) { if (!sfxOn()) return; const a = ac(); if (!a) return; try { const t0 = a.currentTime + (dl || 0), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.3); const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = ft; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t0); } catch (e) {} }

  /* ---------- 좌표 ---------- */
  function campScreen(V) {
    const cvB = document.getElementById('cv'), W = window.innerWidth, H = window.innerHeight, r = cvB ? cvB.getBoundingClientRect() : { left: 0, top: 46, width: W, height: H - 46 };
    const isTop = (typeof flip !== 'undefined' && flip) ? (V === 'c') : (V === 'h'), hasG = typeof OX === 'number' && typeof CX === 'number' && CX > 5;
    const cx = hasG ? CX : r.width / 9, cy = hasG ? CY : r.height / 10, gl = r.left + (hasG ? OX : r.width * .1), gt = r.top + (hasG ? OY : r.height * .08);
    const camp = { x0: gl - cx * .4, w: 8 * cx + cx * .8, y0: isTop ? gt - cy * .4 : gt + 4.55 * cy, h: 4.42 * cy + cy * .4 };
    return { W, H, S: Math.min(r.width, r.height), br: { left: r.left, top: r.top, width: r.width, height: r.height }, camp, cx: camp.x0 + camp.w / 2, cy: camp.y0 + camp.h / 2, cell: Math.min(cx, cy), isTop };
  }

  /* ---------- 파티클 ---------- */
  const SHEET = { spark: ['sparks', 64, 64], billow: ['billow', 256, 256], ice: ['ice', 128, 128], rock: ['rock', 64, 64] };
  function sp(P, o) { const q = Q(); if (q < .95 && o.kind !== 'rock' && Math.random() > Math.max(.3, q)) return; if (P.length > Math.round(340 * Math.max(.45, q))) return; P.push(Object.assign({ kind: 'spark', cell: 0, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, rot: 0, vr: 0, size: 8, a: 1, life: 1, age: 0, rgb: null, add: true, grow: 0 }, o)); }
  function stepPT(P, g, dt) { for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.age += dt; if (p.age >= p.life) { P.splice(i, 1); continue; } const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; const sh = SHEET[p.kind], im = IM[sh[0]]; if (!ok(im)) continue; const k = p.age / p.life, a = p.a * (1 - smooth((k - .55) / .45)); if (a <= .01) continue; const s = p.size * (1 + p.grow * k), src = p._s || (p._s = (p.rgb && p.kind !== 'rock') ? tint(im, p.kind, p.rgb, .75) : im); g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1); g.save(); g.translate(p.x, p.y); if (p.rot) g.rotate(p.rot); g.drawImage(src, p.cell * sh[1], 0, sh[1], sh[2], -s / 2, -s / 2, s, s); g.restore(); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  const img = (g, im, x, y, w, h, a, rot, add) => { if (!ok(im) || a <= .004) return; g.save(); if (add) g.globalCompositeOperation = 'lighter'; g.translate(x, y); if (rot) g.rotate(rot); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); };
  const glow = (g, key, x, y, s, a) => img(g, IM[key], x, y, s, s, a, 0, true);
  const flash = (g, x, y, s, rgb, a) => img(g, tint(IM.softflash, 'sf', rgb, .8), x, y, s, s, a * .6, 0, true);
  function shock(g, key, x, y, s, k, a, flat) { const im = IM[key]; if (!ok(im) || a <= .004 || k < 0 || k >= 1) return; const f = Math.min(7, (k * 8) | 0); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || .55); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -s / 2, -s / 2, s, s); g.restore(); }
  function bolt(g, key, x0, y0, x1, y1, w, a, fr) { const im = IM[key]; if (!ok(im) || a <= .004) return; const L2 = Math.hypot(x1 - x0, y1 - y0); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x0, y0); g.rotate(Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (fr % 6) * 256, 0, 256, 512, -w / 2, 0, w, L2); g.restore(); }
  function ribbon(g, x0, y0, x1, y1, w, rgb, a) { const im = IM.ribbon; if (!ok(im) || a <= .004) return; const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy); if (Ln < 1) return; g.save(); g.globalCompositeOperation = 'lighter'; g.translate((x0 + x1) / 2, (y0 + y1) / 2); g.rotate(Math.atan2(dy, dx)); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tint(im, 'rb', rgb, .75), -Ln / 2, -w / 2, Ln, w); g.restore(); }
  const vig = (g, M, rgb, a) => { if (a > .004 && ok(IM.vignette)) { g.save(); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tint(IM.vignette, 'vg', rgb, 1), 0, 0, M.W, M.H); g.restore(); } };
  const wash = (g, M, rgb, a) => { if (a > .004) { g.save(); g.fillStyle = `rgba(${rgb},${clamp(a, 0, 1)})`; g.fillRect(0, 0, M.W, M.H); g.restore(); } };

  /* ====================================================================
   *  장면들 (t: 스킬 시작 후 초)  — impact: 원본이 피해를 주는 시각에 맞춤
   * ==================================================================== */
  const SC = {
    /* 🔥 화룡 강림 */
    nuke: { end: 4.6, impact: 1.15, dmg: 'burn',
      /* 영상 컷인: 화산 황무지 → 불 뿜는 용 (착탄 순간 터짐) */
      top(g, t, dt, M, st) {
        cinePanel(g, M, st, t, 0, 1.0, '255,140,50', (gg, x, y, w, h) => { const xf = smooth(kk(t, .15, .45)); clip(gg, 'wasteland', .9 + t * 1.2, x, y, w, h, 1 - xf); clip(gg, 'dragon', .35 + t * 1.9, x, y, w, h, xf); },
          (cx, cy, pw, ph) => { for (let i = 0; i < 36; i++) sp(st.P, { kind: 'spark', cell: pick([0, 6, 7]), x: cx + rnd(-.5, .5) * pw, y: cy + rnd(-.5, .5) * ph, vx: rnd(-1, 1) * M.S * .7, vy: rnd(-1, .3) * M.S * .6, ay: M.S * .8, size: M.S * rnd(.012, .03), life: rnd(.6, 1.2), rgb: pick(['255,150,60', '255,210,120']) }); noise(.6, 'lowpass', 2400, 120, .2); });
      },
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.9, 4.6));
        /* 영상의 용암 균열이 진영 위로 번지고 터짐 (어두운 부분은 투명) */
        if (t > 1.0) { const a = smooth(kk(t, 1.0, 1.4)) * out, wv = C.w * 1.32, hv = Math.max(wv * 9 / 16, C.h * 1.25), ry = C.y0 + C.h / 2 - hv / 2, ct = .95 + (t - 1.0) * .85, x0 = C.x0 + C.w / 2 - wv / 2; clip(g, 'wasteland_glow', ct, x0, ry, wv, hv, a, true); if (!LOW()) clip(g, 'wasteland_glow', ct, x0, ry, wv, hv, a * .7, true); glow(g, 'glow_o', M.cx, M.cy, S * 1.2, .25 * a); }
        wash(g, M, '30,6,0', .4 * smooth(kk(t, 0, .4)) * out); vig(g, M, '255,90,20', .5 * out);
        /* 용의 경로: 하늘 위에서 S자로 휘감아 내려와 진영을 가로지름 */
        const path = u => { const x = M.br.left + M.br.width * (1.15 - 1.3 * u), y = C.y0 + C.h * (.5 + .35 * Math.sin(u * 5.5)) - (1 - smooth(kk(u, 0, .35))) * M.H * .6; return [x, y]; };
        const hr = clamp((t - .55) / 2.3, 0, 1.2), head = hr + .075 * Math.sin(Math.min(hr, 1) * TAU), segs = LOW() ? 14 : 24;
        if (ok(IM.scale)) for (let i = segs; i >= 1; i--) { const u = head - i * .028; if (u < 0 || u > 1.05) continue; const [x, y] = path(u), s = S * (.13 - i * .0035) * (1 + .1 * Math.sin(t * 9 + i)); img(g, IM.scale, x, y, s, s, out, t * 3 + i, i % 3 === 0); if (i % 4 === 0 && Math.random() < .5) sp(st.P, { kind: 'spark', cell: pick([0, 6, 7]), x, y, vx: rnd(-40, 40), vy: -rnd(30, 120), size: S * rnd(.012, .028), life: rnd(.6, 1.2), rgb: '255,150,60' }); }
        if (head <= 1.05 && ok(IM.dragonhead)) { const [x, y] = path(head), [x2, y2] = path(Math.max(0, head - .02)), ang = Math.atan2(y - y2, x - x2), z = S * .56; glow(g, 'glow_o', x, y, z * 1.6, .7 * out); g.save(); g.translate(x, y); g.rotate(ang); if (Math.cos(ang) < 0) g.scale(1, -1); g.globalAlpha = out; g.drawImage(IM.dragonhead, -z * .62, -z * .4, z, z * .667); g.restore();
          /* 화염 브레스: 진영을 향해 */
          if (t > .85 && t < 2.6) { const bx = x + Math.cos(ang) * z * .45, by = y + Math.sin(ang) * z * .3, ta = Math.atan2(C.y0 + C.h * .55 - by, (M.cx + (x - M.cx) * .2) - bx); for (let i = 0; i < (LOW() ? 2 : 4); i++) sp(st.P, { kind: 'billow', cell: (Math.random() * 4) | 0, x: bx, y: by, vx: Math.cos(ta + rnd(-.25, .25)) * S * rnd(.7, 1.2), vy: Math.sin(ta + rnd(-.25, .25)) * S * rnd(.7, 1.2), drag: .96, size: S * rnd(.07, .13), grow: 1.3, life: rnd(.55, .9), a: .7, rgb: pick(['255,150,40', '255,90,20', '255,190,90']), add: true });
            if (Math.random() < .6) st.burnPts.push([bx + Math.cos(ta) * S * .6, by + Math.sin(ta) * S * .6]); } }
        if (ok(IM.firewall) && t > 1.0) { const a = .6 * smooth(kk(t, 1.0, 1.3)) * (1 - smooth(kk(t, 2.8, 3.8))); g.save(); g.beginPath(); g.rect(C.x0, C.y0 - C.h * .5, C.w, C.h * 1.5); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .9; const off = (t * 220) % C.w; g.drawImage(IM.firewall, C.x0 - off, C.y0 + C.h * .25, C.w, C.h * .75); g.drawImage(IM.firewall, C.x0 - off + C.w, C.y0 + C.h * .25, C.w, C.h * .75); g.restore(); }
        if (t > this.impact) { const q = t - this.impact; flash(g, M.cx, M.cy, S * 2.4, '255,170,80', (1 - smooth(kk(q, 0, .5))) * 1.1); shock(g, 'shock_o', M.cx, M.cy, S * 1.6, kk(q, 0, 1.1), .9, .55); if (ok(IM.fireball)) { const fs = S * (.3 + .4 * outCubic(kk(q, 0, .8))), f = Math.min(7, (kk(q, 0, 1.4) * 8) | 0); g.save(); g.globalAlpha = 1 - smooth(kk(q, 1.0, 1.6)); g.drawImage(IM.fireball, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, M.cx - fs / 2, M.cy - fs * .6, fs, fs); g.restore(); } }
      } },
    /* ⛈️ 뇌신 폭풍 */
    meteor: { end: 5.4, impact: 1.5, dmg: 'lichten',
      /* 영상 컷인: 폭풍 하늘에 번개 → 번개 토네이도 (삼중 낙뢰와 함께 터짐) */
      top(g, t, dt, M, st) {
        cinePanel(g, M, st, t, 0, 1.3, '170,200,255', (gg, x, y, w, h) => { const xf = smooth(kk(t, .75, 1.05)); clip(gg, 'stormsky', t * 1.55, x, y, w, h, 1 - xf); clip(gg, 'tornado', .5 + (t - .75) * 1.6, x, y, w, h, xf); const lt = kk(t, .38, .6); if (lt > 0 && lt < 1) { gg.save(); gg.globalCompositeOperation = 'lighter'; gg.fillStyle = `rgba(200,215,255,${.45 * Math.sin(lt * Math.PI)})`; gg.fillRect(x, y, w, h); gg.restore(); } },
          (cx, cy, pw, ph) => { for (let i = 0; i < 30; i++) sp(st.P, { kind: 'spark', cell: pick([3, 4, 5]), x: cx + rnd(-.5, .5) * pw, y: cy + rnd(-.5, .5) * ph, vx: rnd(-1, 1) * M.S * .8, vy: rnd(-1, .4) * M.S * .6, ay: M.S, size: M.S * rnd(.01, .026), life: rnd(.5, 1), rgb: '190,215,255' }); });
        if (t > .38 && !st.pl) { st.pl = 1; noise(.35, 'highpass', 5000, 800, .12); tone('sawtooth', 140, 40, .7, .08); }
      },
      frame(g, t, dt, M, st) {
        /* 영상의 번개 토네이도가 진영 한가운데 솟음 (어두운 부분은 투명) */
        if (t > 1.25) { const C2 = M.camp, a = smooth(kk(t, 1.25, 1.7)) * (1 - smooth(kk(t, 4.2, 5.0))), wv = C2.w * 1.25, hv = wv * 9 / 16 * 1.7, x = C2.x0 + C2.w / 2 - wv / 2 + Math.sin(t * 1.3) * C2.w * .04, y = C2.y0 + C2.h * 1.0 - hv, ct = .6 + (t - 1.25) * .8; glow(g, 'glow_b', x + wv / 2, y + hv * .55, M.S * 1.1, .35 * a); clip(g, 'tornado_glow', ct, x, y, wv, hv, a, true); if (!LOW()) clip(g, 'tornado_glow', ct, x, y, wv, hv, a * .75, true); }
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 4.6, 5.4));
        wash(g, M, '6,8,24', .55 * smooth(kk(t, 0, .5)) * out); vig(g, M, '90,120,255', .45 * out);
        if (ok(IM.billow)) for (let i = 0; i < (LOW() ? 5 : 9); i++) { const u = ((i * .137 + t * .03) % 1.2) - .1, x = M.br.left + M.br.width * u, y = M.br.top + S * (.04 + .05 * Math.sin(i * 1.7 + t)), z = S * (.45 + .2 * Math.sin(i)); g.save(); g.globalAlpha = .85 * smooth(kk(t, 0, .6)) * out; g.drawImage(tint(IM.billow, 'st', '40,40,70', .85), (i % 4) * 256, 0, 256, 256, x - z / 2, y - z / 2, z, z); g.restore(); }
        /* 연속 낙뢰 */
        /* 비: 굵기·길이가 다른 빗줄기 (한 번의 경로로 그려 가벼움) */
        { const n = LOW() ? 26 : 54, a = .32 * smooth(kk(t, .3, 1.0)) * out; if (a > .01) { g.save(); g.strokeStyle = `rgba(185,205,255,${a})`; g.lineWidth = Math.max(1, S * .0035); g.beginPath(); for (let i = 0; i < n; i++) { const hx = Math.sin(i * 91.7) * 43758.5, h1 = hx - Math.floor(hx), sp2 = .9 + h1 * .6, yy = ((t * S * 2.6 * sp2 + h1 * 9999) % (M.br.height + S * .2)) + M.br.top - S * .1, xx = M.br.left + (((i * .6180339) % 1) * M.br.width) - (yy - M.br.top) * .18, ln = S * (.04 + .04 * h1); g.moveTo(xx, yy); g.lineTo(xx - ln * .18, yy + ln); } g.stroke(); g.restore(); } }
        const lit = st.bolts.reduce((m2, b) => Math.max(m2, Math.max(0, 1 - (t - b.t0) / .18) * (b.big ? 1.4 : .7)), 0); if (lit > .02) flash(g, M.W / 2, M.br.top + S * .05, S * 2.0, '205,215,255', lit * .32);
        st.next = st.next || .45; if (t > st.next && t < 4.2) { st.next = t + (t < 1.5 ? rnd(.08, .16) : rnd(.25, .5)); const x = C.x0 + C.w * rnd(.05, .95), y = C.y0 + C.h * rnd(.15, .9); st.bolts.push({ x, y, t0: t, f: (Math.random() * 6) | 0, big: false }); st.scars.push([x, y]); noise(.25, 'highpass', 5000, 900, .1); }
        if (t > 1.5 && !st.main) { st.main = 1; [-1, 0, 1].forEach(d => st.bolts.push({ x: M.cx + d * S * .12, y: M.cy, t0: t + Math.abs(d) * .05, f: (Math.random() * 6) | 0, big: true })); tone('sawtooth', 120, 30, 1.1, .16); noise(1, 'lowpass', 2000, 80, .22); }
        for (let i = st.bolts.length - 1; i >= 0; i--) { const b = st.bolts[i], q = (t - b.t0) / (b.big ? .7 : .35); if (q < 0) continue; if (q >= 1) { st.bolts.splice(i, 1); continue; } const w = S * (b.big ? .55 : .26), a = (1 - q) * (.55 + .45 * Math.abs(Math.sin(t * 60 + i))); bolt(g, b.big ? 'bolt_y' : 'bolt_b', b.x + rnd(-3, 3), M.br.top - S * .05, b.x, b.y, w, a, b.f + ((t / .05) | 0)); glow(g, b.big ? 'glow_y' : 'glow_b', b.x, b.y, S * (b.big ? .5 : .32), a * (b.big ? .75 : 1)); if (q < .12) { flash(g, b.x, b.y, S * (b.big ? 1.8 : .8), '190,210,255', (b.big ? .65 : .45) * (1 - q / .12)); if (!b.sp) { b.sp = 1; for (let k = 0; k < (b.big ? 30 : 10); k++) sp(st.P, { kind: 'spark', cell: pick([3, 4, 5]), x: b.x, y: b.y, vx: rnd(-1, 1) * S * .6, vy: -rnd(.1, .7) * S, ay: S * 1.2, size: S * rnd(.01, .025), life: rnd(.4, .9), rgb: '180,210,255' }); } } }
        if (t > this.impact) { const q = t - this.impact; shock(g, 'shock_b', M.cx, M.cy, S * 1.8, kk(q, 0, 1.1), .9, .55); if (ok(IM.net)) img(g, tint(IM.net, 'sn', '140,180,255', .5), M.cx, M.cy, S * 1.3 * outCubic(kk(q, 0, .3)), S * 1.3 * outCubic(kk(q, 0, .3)) * .7, (1 - smooth(kk(q, .6, 1.6))) * .8, 0, true); }
      } },
    /* 🌋 대지 분쇄 */
    kame2: { end: 4.6, impact: 2.25, dmg: 'fault',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.9, 4.6));
        wash(g, M, '24,10,0', .42 * smooth(kk(t, 0, .5)) * out); vig(g, M, '255,110,30', .4 * smooth(kk(t, 1.0, 1.6)) * out);
        st.shake = t < 2.25 ? S * .006 * smooth(kk(t, 0, 2.2)) : S * .03 * Math.max(0, 1 - (t - 2.25) / .8);
        if (Math.random() < .3 * out) sp(st.P, { kind: 'rock', cell: (Math.random() * 4) | 0, x: C.x0 + Math.random() * C.w, y: C.y0 + Math.random() * C.h, vx: rnd(-20, 20), vy: -rnd(40, 140), ay: S * 1.5, size: S * rnd(.012, .025), life: .7, add: false, rot: rnd(0, TAU), vr: rnd(-8, 8) });
        /* 갈라지는 단층선(진영을 가로질러 내달림) */
        if (!st.lines) { st.lines = []; for (let i = 0; i < 3; i++) { const y0 = C.y0 + C.h * (.25 + i * .25) + rnd(-.05, .05) * C.h, pts = [[C.x0 - S * .05, y0]]; let x = C.x0, y = y0; while (x < C.x0 + C.w + S * .05) { x += S * rnd(.03, .06); y = clamp(y + S * rnd(-.03, .03), C.y0 + C.h * .08, C.y0 + C.h * .92); pts.push([x, y]); } st.lines.push({ pts, t0: 1.0 + i * .25 }); } }
        st.lines.forEach((ln, i) => { const q = kk(t, ln.t0, ln.t0 + .9), n = Math.floor(ln.pts.length * q), a = out; if (n < 2) return; g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = `rgba(20,8,4,${.85 * a})`; g.lineWidth = S * .022; g.beginPath(); ln.pts.slice(0, n).forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,120,30,${.85 * a * (.7 + .3 * Math.sin(t * 9 + i))})`; g.lineWidth = S * .008; g.stroke(); g.restore(); const tip = ln.pts[n - 1]; if (q < 1) { glow(g, 'glow_o', tip[0], tip[1], S * .25, .9); if (Math.random() < .7) sp(st.P, { kind: 'spark', cell: pick([0, 6]), x: tip[0], y: tip[1], vx: rnd(-60, 60), vy: -rnd(60, 200), ay: S, size: S * rnd(.012, .028), life: .7, rgb: '255,140,50' }); } });
        /* 바위 기둥 분출 */
        if (t > this.impact) { const q = t - this.impact; if (!st.sp) { st.sp = []; for (let i = 0; i < (LOW() ? 6 : 10); i++) st.sp.push([C.x0 + C.w * (.08 + .84 * Math.random()), C.y0 + C.h * (.2 + .7 * Math.random()), rnd(.7, 1.3), rnd(0, .25)]); for (let i = 0; i < 26; i++) sp(st.P, { kind: 'rock', cell: (Math.random() * 4) | 0, x: M.cx + rnd(-.3, .3) * C.w, y: M.cy, vx: rnd(-1, 1) * S * .7, vy: -rnd(.4, 1.2) * S, ay: S * 2.2, size: S * rnd(.025, .06), life: rnd(1, 1.8), add: false, rot: rnd(0, TAU), vr: rnd(-8, 8) }); for (let i = 0; i < 10; i++) sp(st.P, { kind: 'billow', cell: i % 4, x: M.cx + rnd(-.4, .4) * C.w, y: M.cy, vx: rnd(-80, 80), vy: -rnd(20, 70), size: S * rnd(.15, .28), grow: 1, life: 2.2, rgb: '120,90,60', add: false }); tone('sine', 60, 25, 1.4, .3); noise(1.3, 'lowpass', 900, 60, .26); }
          st.sp.forEach(([x, y, s, d0]) => { const g2 = outBack(kk(q, d0, d0 + .25)) * (1 - smooth(kk(t, 3.6, 4.4))), hh = S * .32 * s * g2, ww = hh * .5; if (hh > 1 && ok(IM.rockspike)) { g.save(); g.translate(x, y); g.drawImage(IM.rockspike, -ww / 2, -hh, ww, hh); g.restore(); } });
          flash(g, M.cx, M.cy, S * 2.2, '255,150,70', (1 - smooth(kk(q, 0, .5))) * .9); shock(g, 'shock_o', M.cx, M.cy, S * 1.9, kk(q, 0, 1.1), .85, .5); }
      } },
    /* 🧊 빙하 붕괴 (원본 함수를 대체하므로 피해 시각을 직접 정함) */
    vortex: { end: 4.3, impact: 1.7, dmg: 'ice', own: true, hits: [[1.7, .5, .5], [2.0, .3, .55], [2.2, .7, .45]],
      /* 영상 컷인: 운석과 빙하 (빙하가 떨어지기 직전 얼음 조각으로 깨짐) */
      top(g, t, dt, M, st) {
        cinePanel(g, M, st, t, 0, 1.05, '160,225,255', (gg, x, y, w, h) => clip(gg, 'ice', .25 + t * 1.9, x, y, w, h, 1),
          (cx, cy, pw, ph) => { for (let i = 0; i < (LOW() ? 18 : 34); i++) sp(st.P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: cx + rnd(-.5, .5) * pw, y: cy + rnd(-.5, .5) * ph, vx: rnd(-1, 1) * M.S * .8, vy: rnd(-1, .5) * M.S * .7, ay: M.S * 1.6, size: M.S * rnd(.04, .09), life: rnd(.7, 1.3), rgb: '190,232,255', rot: rnd(0, TAU), vr: rnd(-8, 8) }); tone('sine', 1200, 300, .5, .08); noise(.5, 'highpass', 7000, 1500, .14); });
      },
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.6, 4.3));
        wash(g, M, '4,16,40', .45 * smooth(kk(t, 0, .4)) * out); vig(g, M, '120,200,255', .5 * out);
        if (ok(IM.frost)) { const fz = smooth(kk(t, .1, .9)) * out; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18 * fz; g.drawImage(IM.frost, M.br.left, M.br.top, M.br.width, M.br.height); g.restore(); }
        const fq = kk(t, 1.0, this.impact), gx = M.cx, gy = M.cy, z = S * .56;
        /* 첨부 영상처럼 푸른 꼬리를 단 얼음 운석이 비스듬히 쏟아짐 */
        { const n = LOW() ? 4 : 8; for (let i = 0; i < n; i++) { const h1 = Math.sin(i * 77.7) * 43758.5 % 1, h = Math.abs(h1), t0 = .85 + i * .09, q = kk(t, t0, t0 + .55); if (q <= 0 || q >= 1) continue; const ex = C.x0 + C.w * (.1 + .8 * ((i * .618) % 1)), ey = C.y0 + C.h * (.25 + .6 * h), sx2 = ex + S * .55, sy2 = ey - S * .95, x = sx2 + (ex - sx2) * q * q, y = sy2 + (ey - sy2) * q * q, tl = S * .32; ribbon(g, x + tl * .5, y - tl * .86, x, y, S * .045, '150,215,255', .85); glow(g, 'glow_b', x, y, S * .16, .9); if (ok(IM.ice)) { const zc = S * .075; g.save(); g.translate(x, y); g.rotate(t * 6 + i); g.drawImage(tint(IM.ice, 'cm', '210,240,255', .3), (i % 4) * 128, 0, 128, 128, -zc / 2, -zc / 2, zc, zc); g.restore(); } if (q > .9 && !st['c' + i]) { st['c' + i] = 1; for (let k = 0; k < 6; k++) sp(st.P, { kind: 'ice', cell: k % 4, x: ex, y: ey, vx: rnd(-1, 1) * S * .35, vy: -rnd(.1, .5) * S, ay: S * 1.4, size: S * rnd(.02, .045), life: .7, rgb: '190,232,255' }); } } }
        if (t < this.impact + .05 && t > .95 && ok(IM.glacier)) { const y0 = Math.max(M.br.top - z * .3, gy - S * 1.1), y = y0 + (gy - y0) * fq * fq; { const sh = .25 + .75 * fq; g.save(); g.globalAlpha = .45 * fq; g.fillStyle = '#0a1a30'; g.beginPath(); g.ellipse(gx, gy + z * .1, z * .5 * sh, z * .16 * sh, 0, 0, TAU); g.fill(); g.restore(); } g.save(); g.translate(gx, y - z * .2); g.rotate(fq * .6); g.drawImage(IM.glacier, -z / 2, -z / 2, z, z); g.restore(); ribbon(g, gx, y - z, gx, y, z * .6, '200,235,255', .35 * fq); if (Math.random() < .5) sp(st.P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: gx + rnd(-z * .3, z * .3), y: y, vx: rnd(-50, 50), vy: -rnd(20, 80), size: S * rnd(.02, .04), life: .6, rgb: '200,235,255' }); }
        if (t > this.impact) { const q = t - this.impact; if (!st.d) { st.d = 1; for (let i = 0; i < (LOW() ? 24 : 44); i++) sp(st.P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: gx, y: gy, vx: rnd(-1, 1) * S * 1.0, vy: -rnd(.2, 1.1) * S, ay: S * 1.8, size: S * rnd(.05, .12), life: rnd(1, 1.8), rgb: '190,230,255', rot: rnd(0, TAU), vr: rnd(-6, 6) }); for (let i = 0; i < 7; i++) sp(st.P, { kind: 'billow', cell: i % 4, x: gx + rnd(-.3, .3) * C.w, y: gy, vx: rnd(-120, 120), vy: -rnd(10, 50), size: S * rnd(.16, .26), grow: 1.1, life: 1.6, a: .42, rgb: '225,245,255', add: false }); tone('sine', 300, 60, .8, .14); noise(.9, 'highpass', 6000, 800, .18); }
          flash(g, gx, gy, S * 2.4, '220,240,255', (1 - smooth(kk(q, 0, .45))) * 1.2); shock(g, 'shock_b', gx, gy, S * 2.0, kk(q, 0, 1.1), .9, .55); if (ok(IM.vapor)) img(g, IM.vapor, gx, gy, S * (.4 + 2.2 * outCubic(kk(q, 0, 1))), S * (.4 + 2.2 * outCubic(kk(q, 0, 1))) * .36, (1 - smooth(kk(q, .3, 1.2))) * .8, 0, true); }
      } }
  };

  /* ====================================================================
   *  장기판 파손 데칼 (성질별 이미지) — 판 캔버스 바닥층에 캐시해서 그림
   * ==================================================================== */
  const DEC = { c: [], h: [] };
  function campCv(side) { const isBottom = (typeof flip !== 'undefined' && flip) ? (side === 'h') : (side === 'c'); return { x0: OX - CX * .42, w: 8 * CX + CX * .84, y0: isBottom ? (OY + 4.55 * CY) : (OY - CY * .42), h: 4.42 * CY + CY * .42 }; }
  function addDecal(side, type, fx, fy, rot) { const L2 = DEC[side]; if (!L2) return; L2.push({ type, fx, fy, rot: rot == null ? rnd(-.6, .6) : rot, s: rnd(.85, 1.15), seed: Math.random() * 1000, born: performance.now() }); while (L2.length > 10) L2.shift(); dDirty = true; }
  let dc = null, dg = null, dDirty = true, dSig = '', lastMc = 0;
  /* 속성별 잔류 효과: 불=일렁이는 잔불 · 번개=지지직 전기 · 얼음=반짝임과 냉기 · 용암=끓는 빛과 연기 · 산=부글거림 · 플라즈마=푸른 잔광 · 성창=떠오르는 빛가루 */
  const LIN = { burn: 14, lichten: 8, ice: 12, fault: 14, acid: 12, plasma: 9, holy: 10, bloom: 10 };
  const LIVE = {
    burn(g, d, x, y, C, now, age, f, R) { const im = IM.flame_o; if (!ok(im)) return; const n = LOW() ? 3 : 6; g.save(); g.translate(x, y); g.rotate(d.rot); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const fx = (R(i) - .5) * C * 3.4, fr = ((now / 70 + i * 3) | 0) % 8, fl = .75 + .25 * Math.sin(now / 90 + i * 2), z = C * (.42 + R(i + 5) * .35) * fl * (1 - age / LIN.burn * .5); g.globalAlpha = .85 * f; g.drawImage(im, (fr % 4) * 128, ((fr / 4) | 0) * 192, 128, 192, fx - z / 2, -z * 1.3 + (R(i + 9) - .5) * C * .4, z, z * 1.5); } g.restore(); glow(g, 'glow_o', x, y, C * 3, .25 * f * (.8 + .2 * Math.sin(now / 120))); },
    lichten(g, d, x, y, C, now, age, f, R) { const k = ((now / 110) | 0); if (Math.sin(k * 12.3 + d.seed) > .35) { const a0 = (Math.sin(k * 7.7 + d.seed) * .5 + .5) * TAU, r0 = C * 1.3; bolt(g, 'bolt_b', x, y, x + Math.cos(a0) * r0, y + Math.sin(a0) * r0 * .8, C * .55, .8 * f, k); } glow(g, 'glow_b', x, y, C * (1.6 + .4 * Math.sin(now / 60)), .35 * f); },
    ice(g, d, x, y, C, now, age, f, R) { const n = LOW() ? 3 : 6; for (let i = 0; i < n; i++) { const tw = Math.max(0, Math.sin(now / 380 + i * 2.1 + d.seed)), px2 = x + (R(i) - .5) * C * 2.6, py2 = y + (R(i + 3) - .5) * C * 2; if (tw > .2) img(g, IM.starflare, px2, py2, C * .55 * tw, C * .55 * tw, tw * f, now / 900, true); } if (ok(IM.smoke) && !LOW()) { for (let i = 0; i < 2; i++) { const u = ((now / 5200 + i * .5 + d.seed) % 1), z = C * (1.4 + u * 1.2); g.save(); g.globalAlpha = .22 * Math.sin(u * Math.PI) * f; g.drawImage(IM.smoke, i * 128, 0, 128, 128, x - z / 2 + (u - .5) * C, y - z / 2 - u * C * .6, z, z); g.restore(); } } },
    fault(g, d, x, y, C, now, age, f, R) { g.save(); g.translate(x, y); g.rotate(d.rot); for (let i = 0; i < 4; i++) { const px2 = (R(i) - .5) * C * 5, pu = .55 + .45 * Math.sin(now / 260 + i * 1.7); glow(g, 'glow_o', px2, 0, C * 1.4 * pu, .5 * f); } if (ok(IM.smoke)) for (let i = 0; i < (LOW() ? 1 : 3); i++) { const u = ((now / 3000 + i / 3 + d.seed) % 1), px2 = (R(i + 7) - .5) * C * 4.4, z = C * (.6 + u * 1.3); g.globalAlpha = .35 * Math.sin(u * Math.PI) * f; g.drawImage(tint(IM.smoke, 'fsm', '70,55,45', .6), (i % 4) * 128, 0, 128, 128, px2 - z / 2, -z / 2 - u * C * 1.8, z, z); } g.restore(); },
    acid(g, d, x, y, C, now, age, f, R) { const n = LOW() ? 3 : 6; for (let i = 0; i < n; i++) { const ph = ((now / 900 + R(i) * 3) % 1), px2 = x + (R(i + 2) - .5) * C * 1.8, py2 = y + (R(i + 4) - .5) * C * 1.3, r = C * (.08 + .14 * ph); g.save(); g.globalAlpha = (1 - ph) * .8 * f; g.strokeStyle = 'rgba(190,255,130,1)'; g.lineWidth = Math.max(1, C * .03); g.beginPath(); g.arc(px2, py2, r, 0, TAU); g.stroke(); g.restore(); } glow(g, 'glow_y', x, y, C * 2.2, .15 * f); },
    plasma(g, d, x, y, C, now, age, f, R) { glow(g, 'glow_b', x, y, C * (2.2 + .3 * Math.sin(now / 200)), .45 * f); for (let i = 0; i < (LOW() ? 2 : 4); i++) { const u = ((now / 1400 + i / 4 + d.seed) % 1), a = R(i) * TAU, r = C * (.4 + u * 1.1); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - u) * .8 * f; g.fillStyle = 'rgba(150,210,255,1)'; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * .8 - u * C * .5, C * .05 * (1 - u) + 1, 0, TAU); g.fill(); g.restore(); } },
    bloom(g, d, x, y, C, now, age, f, R) { const im = IM.petal; if (!ok(im)) return; for (let i = 0; i < (LOW() ? 3 : 6); i++) { const u = ((now / 3200 + i / 6 + d.seed) % 1), px2 = x + (R(i) - .5) * C * 2.6 + Math.sin(u * 6 + i) * C * .3, py2 = y - C * .4 + u * C * 1.2, z = C * .32; g.save(); g.globalAlpha = Math.sin(u * Math.PI) * .9 * f; g.translate(px2, py2); g.rotate(u * 6 + i); g.drawImage(im, (i % 5) * 64, 0, 64, 64, -z / 2, -z / 2, z, z); g.restore(); } glow(g, 'glow_y', x, y, C * 2, .12 * f); },
    holy(g, d, x, y, C, now, age, f, R) { const pu = .6 + .4 * Math.sin(now / 300); glow(g, 'glow_y', x, y, C * 2.4 * pu, .35 * f); for (let i = 0; i < (LOW() ? 3 : 6); i++) { const u = ((now / 2200 + i / 6 + d.seed) % 1), px2 = x + (R(i) - .5) * C * 2.2; img(g, IM.starflare, px2, y - u * C * 2.4, C * .35 * (1 - u * .5), C * .35 * (1 - u * .5), Math.sin(u * Math.PI) * f, now / 700, true); } }
  };
  function drawLive(g, now) {
    if (typeof CX !== 'number') return; const C = Math.min(CX, CY);
    ['c', 'h'].forEach(s => { const cr = campCv(s); DEC[s].forEach(d => { const L3 = LIN[d.type], age = (now - (d.born || 0)) / 1000; if (!L3 || age > L3 || age < 0) return; const fade = smooth(kk(age, 0, .4)) * (1 - smooth(kk(age, L3 * .6, L3))), R = k => { const r = Math.sin(d.seed + k * 12.9898) * 43758.5453; return r - Math.floor(r); }; try { LIVE[d.type](g, d, cr.x0 + d.fx * cr.w, cr.y0 + d.fy * cr.h, C, now, age, fade, R); } catch (e) {} }); });
  }
  function drawDecal(g, d, cx, cy, C) {
    const R = (k) => { const r = Math.sin(d.seed + k * 12.9898) * 43758.5453; return r - Math.floor(r); };
    g.save(); g.translate(cx, cy); g.rotate(d.rot); g.globalAlpha = .92;
    if (d.type === 'burn' && ok(IM.d_burn)) { g.globalAlpha = .72; g.drawImage(IM.d_burn, -C * 2.0 * d.s, -C * .45 * d.s, C * 4.0 * d.s, C * .9 * d.s); for (let i = 0; i < 3; i++) { const z = C * (.8 + R(i) * .6); g.drawImage(IM.d_burn, (R(i + 3) - .5) * C * 3, (R(i + 6) - .5) * C * 1.4 - z * .2, z * 1.6, z * .5); } }
    else if (d.type === 'lichten' && ok(IM.d_lichten)) { g.globalAlpha = .8; const z = C * 3.0 * d.s; g.drawImage(IM.d_lichten, -z / 2, -z / 2, z, z); }
    else if (d.type === 'ice' && ok(IM.d_ice)) { const z = C * 3.4 * d.s; g.drawImage(IM.d_ice, -z / 2, -z / 2, z, z * .85); if (ok(IM.ice)) for (let i = 0; i < 5; i++) { const a = R(i) * TAU, r = C * (.4 + R(i + 9) * .9), s2 = C * (.5 + R(i + 4) * .4); g.save(); g.translate(Math.cos(a) * r, Math.sin(a) * r * .8); g.rotate(R(i + 2) * TAU); g.drawImage(tint(IM.ice, 'dic', '200,235,255', .4), ((i % 4)) * 128, 0, 128, 128, -s2 / 2, -s2 / 2, s2, s2); g.restore(); } }
    else if (d.type === 'acid' && ok(IM.d_acid)) { const z = C * 2.9 * d.s; g.globalAlpha = .85; g.drawImage(IM.d_acid, -z / 2, -z / 2, z, z * .8); }
    else if (d.type === 'plasma' && ok(IM.d_plasma)) { const z = C * 3.1 * d.s; g.globalAlpha = .85; g.drawImage(IM.d_plasma, -z / 2, -z / 2, z, z * .82); }
    else if (d.type === 'bloom' && ok(IM.d_bloom)) { const z = C * 3.3 * d.s; g.globalAlpha = .9; g.drawImage(IM.d_bloom, -z / 2, -z / 2, z, z * .85); }
    else if (d.type === 'holy' && ok(IM.d_holy)) { const z = C * 3.0 * d.s; g.globalAlpha = .8; g.drawImage(IM.d_holy, -z / 2, -z / 2, z, z * .85); }
    else if (d.type === 'fault' && ok(IM.d_fault)) { g.drawImage(IM.d_fault, -C * 3.2 * d.s, -C * .65 * d.s, C * 6.4 * d.s, C * 1.3 * d.s); if (ok(IM.rock)) for (let i = 0; i < 6; i++) { const s2 = C * (.28 + R(i) * .3); g.save(); g.translate((R(i + 3) - .5) * C * 5, (R(i + 7) - .5) * C * 1.6); g.rotate(R(i + 1) * TAU); g.drawImage(IM.rock, ((i % 4)) * 64, 0, 64, 64, -s2 / 2, -s2 / 2, s2, s2); g.restore(); } }
    g.restore();
  }
  function hookGround() {
    const orig = window.jgDrawBoardThemeFX; const __hasHook=(f,t)=>{for(let i=0;f&&i<80;i++,f=f.__prev)if(f[t])return true;return false}; if (__hasHook(orig, '__n14')) return;
    const fn = function (g, now) {
      if (typeof orig === 'function') orig.apply(this, arguments);
      try {
        /* 피해가 회복되었거나 새 판이면 데칼 제거 */
        if (typeof mc !== 'undefined') { if (mc < lastMc && (DEC.c.length || DEC.h.length)) { DEC.c.length = 0; DEC.h.length = 0; dDirty = true; } lastMc = mc; }   /* 새 판(수 카운터 감소) → 초기화 */
        if (window.jgDmg) ['c', 'h'].forEach(s => { if (DEC[s].length && (window.jgDmg(s) || 0) === 0) { DEC[s].length = 0; dDirty = true; } });
        if (!DEC.c.length && !DEC.h.length) return;
        const cvEl = g.canvas, w = cvEl.width, h = cvEl.height, sig = w + 'x' + h + (typeof flip !== 'undefined' && flip ? 'f' : 'n');
        if (!dc || dc.width !== w || dc.height !== h) { dc = document.createElement('canvas'); dc.width = w; dc.height = h; dg = dc.getContext('2d'); dDirty = true; }
        if (dDirty || sig !== dSig) { dDirty = false; dSig = sig; dg.setTransform(1, 0, 0, 1, 0, 0); dg.clearRect(0, 0, w, h); const m = g.getTransform ? g.getTransform() : null; if (m) dg.setTransform(m); const C = Math.min(CX, CY); ['c', 'h'].forEach(s => { const cr = campCv(s); DEC[s].forEach(d => drawDecal(dg, d, cr.x0 + d.fx * cr.w, cr.y0 + d.fy * cr.h, C)); }); }
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(dc, 0, 0); g.restore(); drawLive(g, now);
      } catch (e) {}
    };
    fn.__n14 = true; fn.__prev = orig; window.jgDrawBoardThemeFX = fn;
  }

  /* ====================================================================
   *  실행 틀
   * ==================================================================== */
  let hide = { n: 0, z: '', until: 0 };
  function run(sk, V, seed) {
    const scn = SC[sk]; if (!scn) return null;
    const ov = document.createElement('canvas'); ov.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9;pointer-events:none;'; ov.id = 'jg_n14_cv'; document.body.appendChild(ov);
    const g = ov.getContext('2d'), st = { P: [], burnPts: [], bolts: [], scars: [], shake: 0 }, t0 = performance.now(), cvB = document.getElementById('cv');
    let last = t0, done = false; if (window.jgPerf) window.jgPerf.cinemaOn();
    const cleanup = () => { if (done) return; done = true; try { ov.remove(); } catch (e) {} if (cvB) cvB.style.transform = ''; if (window.jgPerf) window.jgPerf.cinemaOff(); };
    function frame(now) {
      if (done) return; const t = N14.debugT != null ? N14.debugT : (now - t0) / 1000, dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
      const M = campScreen(V), dpr = window.jgPerf ? window.jgPerf.dpr(1.25) : Math.min(window.devicePixelRatio || 1, 1.25);
      if (ov.width !== Math.round(M.W * dpr) || ov.height !== Math.round(M.H * dpr)) { ov.width = Math.round(M.W * dpr); ov.height = Math.round(M.H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, M.W, M.H);
      try { scn.frame(g, t, dt, M, st); } catch (e) { console.warn('n14', e); }
      stepPT(st.P, g, dt);
      if (window.jgPieceMask) window.jgPieceMask.carveLines(g);
      if (scn.top) try { scn.top(g, t, dt, M, st); } catch (e) { console.warn('n14top', e); }   /* 영상 컷인 창은 선 위에 */
      if (cvB && st.shake > .3) cvB.style.transform = `translate3d(${(Math.sin(t * 70) * st.shake).toFixed(1)}px,${(Math.cos(t * 61) * st.shake).toFixed(1)}px,0)`; else if (cvB && cvB.style.transform) cvB.style.transform = '';
      if (t < scn.end || N14.debugT != null) requestAnimationFrame(frame); else cleanup();
    }
    requestAnimationFrame(frame); setTimeout(cleanup, (scn.end + 3) * 1000);
    return st;
  }
  /* 원본 연출 캔버스 숨김: 핵·메테오(z9), 에네르기파2(z24) */
  try { new MutationObserver(list => { for (const m of list) for (const n of m.addedNodes) { if (n && n.tagName === 'CANVAS' && n.style && n.id !== 'jg_n14_cv' && hide.n > 0 && performance.now() < hide.until && n.style.zIndex === hide.z) { hide.n--; n.style.display = 'none'; try { const c2 = n.getContext('2d'); n.width = 1; n.height = 1; const noop = () => {}, gr = () => ({ addColorStop: noop }); ['drawImage', 'fillRect', 'strokeRect', 'clearRect', 'fill', 'stroke', 'fillText', 'strokeText', 'arc', 'ellipse', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'clip', 'save', 'restore', 'translate', 'rotate', 'scale', 'transform', 'setTransform', 'putImageData', 'setLineDash'].forEach(k => { c2[k] = noop; }); c2.createRadialGradient = gr; c2.createLinearGradient = gr; c2.createPattern = () => null; c2.measureText = () => ({ width: 0 }); } catch (e2) {} } } }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}

  /* jgSkillFx.start 훅: 핵/메테오/에네르기파2 슬롯이 시작될 때 새 연출 실행 */
  function hookStart() {
    const S = window.jgSkillFx; if (!S || typeof S.start !== 'function' || __jgHas(S.start, '__n14')) return;
    const os = S.start;
    S.start = function (sk, V) { if (N14.enabled && sk === 'alien') { const S2 = window.jgSkillFx, pv = S2.enabled; S2.enabled = false; try { return os.apply(this, arguments); } finally { S2.enabled = pv; } }   /* 외계인: 옛 효과층은 건너뜀(새 연출과 산성 자국이 대신함 · 휴대폰에서 매우 무거웠음) */
      if (N14.enabled && SC[sk] && !SC[sk].own) { hide = { n: 1, z: sk === 'kame2' ? '24' : '9', until: performance.now() + 900 }; try { run(sk, V); } catch (e) {} return; } return os.apply(this, arguments); };
    S.start.__n14 = true; S.start.__prev = os;
  }
  /* 차원와류포 슬롯 → 빙하 붕괴 (원본 함수 대체, 동기화 seed 유지) */
  function hookVortex() {
    const ov = window.jgVortexFire; if (__jgHas(ov, '__n14')) return;
    const fn = function (attackerSide, seed) {
      if (!N14.enabled) return ov && ov.apply(this, arguments);
      if (typeof window.jgPunishBusy === 'function' && window.jgPunishBusy()) return;
      if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(true);
      const A = (attackerSide === 'h' || attackerSide === 'c') ? attackerSide : (typeof me !== 'undefined' ? me : 'c'), V = A === 'c' ? 'h' : 'c', scn = SC.vortex;
      run('vortex', V, seed); let hi = 0; tone('sine', 900, 200, .9, .06);
      const tick = () => { const now = performance.now() - st0; while (hi < scn.hits.length && now / 1000 >= scn.hits[hi][0]) { const h = scn.hits[hi++]; try { window.hitCamp && window.hitCamp(V, 'vortex', { fx: h[1], fy: h[2], rot: 0 }); } catch (e) {} if (hi === 1) try { window.hitScreen && Q() >= .6 && window.hitScreen(V, 'fist', h[1], h[2], 0, true); } catch (e) {} } if (hi < scn.hits.length) requestAnimationFrame(tick); else setTimeout(() => { if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); }, (scn.end - scn.hits[scn.hits.length - 1][0]) * 1000); };
      const st0 = performance.now(); requestAnimationFrame(tick);
    };
    fn.__n14 = true; fn.__prev = ov; window.jgVortexFire = fn;
  }
  /* hitCamp: 새 스킬 4종은 예전 불탄 자국 대신 성질별 파손 데칼을 남김 */
  const lastWl = {};
  function hookHit() {
    const hc = window.hitCamp; if (typeof hc !== 'function' || __jgHas(hc, '__n14')) return;
    const fn = function (side, sk, extra) {
      const mine = N14.enabled && SC[sk], quiet = mine || (N14.enabled && (sk === 'alien' || (typeof sk === 'string' && sk.indexOf('warlord_') === 0)));   /* 군주 공격도 자체 연출+속성 자국이 있어 옛 효과층은 건너뜀 */ const S1 = window.jgSkillFx, prev = S1 ? S1.enabled : undefined;
      if (quiet && S1) S1.enabled = false;
      let r; try { r = hc.apply(this, arguments); } finally { if (quiet && S1) S1.enabled = prev; }
      const WLT = { zhuge: 'holy', sunquan: 'plasma', caocao: 'lichten', liubei: 'bloom', lvbu: 'fault', simayi: 'ice' }, wid = typeof sk === 'string' && sk.indexOf('warlord_') === 0 ? sk.slice(8) : null;
      let extraType = N14.enabled ? (({ alien: 'acid', kame: 'plasma', skyfall: 'holy' })[sk] || (wid && WLT[wid]) || null) : null;
      if (extraType && wid) { const now2 = performance.now(), key = side + wid; if (now2 - (lastWl[key] || 0) < 1500) extraType = null; else lastWl[key] = now2; if (wid === 'lvbu' && extraType) { try { addDecal(side, 'burn', rnd(.25, .75), rnd(.25, .75)); } catch (e) {} } }
      if (extraType) { try { const fx = extra && extra.fx != null ? extra.fx : rnd(.3, .7), fy = extra && extra.fy != null ? extra.fy : rnd(.3, .7); addDecal(side, extraType, fx, fy); } catch (e) {} }
      if (mine) { try { const hits = (window.DMG_SK && window.DMG_SK[side]) || [], last = hits[hits.length - 1] || {}, fx = extra && extra.fx != null ? extra.fx : (last.fx != null ? last.fx : .5), fy = extra && extra.fy != null ? extra.fy : (last.fy != null ? last.fy : .5); addDecal(side, SC[sk].dmg, fx, fy, sk === 'nuke' ? rnd(-.3, .3) : null); if (sk === 'meteor') for (let i = 0; i < 2; i++) addDecal(side, 'lichten', clamp(fx + rnd(-.3, .3), .08, .92), clamp(fy + rnd(-.3, .3), .1, .9)); if (sk === 'nuke') addDecal(side, 'burn', clamp(fx + rnd(-.25, .25), .1, .9), clamp(fy + rnd(-.25, .25), .1, .9)); } catch (e) {} }
      return r;
    };
    fn.__n14 = true; fn.__prev = hc; window.hitCamp = fn;
  }
  function installAll() { hookStart(); hookVortex(); hookHit(); hookGround(); }
  installAll(); setInterval(installAll, 1200);
  N14.test = (sk, V) => { if (sk === 'vortex') return window.jgVortexFire(V === 'h' ? 'c' : 'h', 1); run(sk, V || 'h'); setTimeout(() => window.hitCamp && window.hitCamp(V || 'h', sk), SC[sk].impact * 1000); };
  N14.decal = addDecal;
  N14.clear = () => { DEC.c.length = 0; DEC.h.length = 0; dDirty = true; };
})();
