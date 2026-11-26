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
  ['dragonhead', 'scale', 'glacier', 'rockspike'].forEach(n => L(n, 'skl_' + n)); ['burn', 'lichten', 'ice', 'fault'].forEach(n => L('d_' + n, 'dmg_' + n));
  ['sparks', 'glow_o', 'glow_b', 'glow_y', 'glow_p', 'shock_o', 'shock_b', 'shock_y', 'shock_p', 'bolt_b', 'bolt_y', 'bolt_p', 'flame_o', 'vignette'].forEach(n => L(n, 'v2_' + n));
  ['ice', 'rock', 'ribbon', 'softflash', 'fissure', 'net'].forEach(n => L(n, 'wl_' + n)); L('billow', 'fx_billow'); L('vapor', 'fx_vapor'); L('fireball', 'fx_fireball'); L('frost', 'env_frost'); L('firewall', 'ult_firewall');
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
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
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.9, 4.6));
        wash(g, M, '30,6,0', .4 * smooth(kk(t, 0, .4)) * out); vig(g, M, '255,90,20', .5 * out);
        /* 용의 경로: 하늘 위에서 S자로 휘감아 내려와 진영을 가로지름 */
        const path = u => { const x = M.br.left + M.br.width * (1.15 - 1.3 * u), y = C.y0 + C.h * (.5 + .35 * Math.sin(u * 5.5)) - (1 - smooth(kk(u, 0, .35))) * M.H * .6; return [x, y]; };
        const head = clamp((t - .1) / 2.3, 0, 1.2), segs = LOW() ? 14 : 24;
        if (ok(IM.scale)) for (let i = segs; i >= 1; i--) { const u = head - i * .028; if (u < 0 || u > 1.05) continue; const [x, y] = path(u), s = S * (.13 - i * .0035) * (1 + .1 * Math.sin(t * 9 + i)); img(g, IM.scale, x, y, s, s, out, t * 3 + i, true); if (i % 4 === 0 && Math.random() < .5) sp(st.P, { kind: 'spark', cell: pick([0, 6, 7]), x, y, vx: rnd(-40, 40), vy: -rnd(30, 120), size: S * rnd(.012, .028), life: rnd(.6, 1.2), rgb: '255,150,60' }); }
        if (head <= 1.05 && ok(IM.dragonhead)) { const [x, y] = path(head), [x2, y2] = path(Math.max(0, head - .02)), ang = Math.atan2(y - y2, x - x2), z = S * .42; glow(g, 'glow_o', x, y, z * 1.6, .7 * out); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.rotate(ang); if (Math.cos(ang) < 0) g.scale(1, -1); g.globalAlpha = out; g.drawImage(IM.dragonhead, -z * .5, -z * .4, z, z * .8); g.restore();
          /* 화염 브레스: 진영을 향해 */
          if (t > .85 && t < 2.6) { const bx = x + Math.cos(ang) * z * .45, by = y + Math.sin(ang) * z * .3, ta = Math.atan2(C.y0 + C.h * .55 - by, (M.cx + (x - M.cx) * .2) - bx); for (let i = 0; i < (LOW() ? 2 : 4); i++) sp(st.P, { kind: 'billow', cell: (Math.random() * 4) | 0, x: bx, y: by, vx: Math.cos(ta + rnd(-.25, .25)) * S * rnd(.7, 1.2), vy: Math.sin(ta + rnd(-.25, .25)) * S * rnd(.7, 1.2), drag: .96, size: S * rnd(.08, .16), grow: 1.4, life: rnd(.6, 1.0), rgb: pick(['255,150,40', '255,90,20', '255,210,120']), add: true });
            if (Math.random() < .6) st.burnPts.push([bx + Math.cos(ta) * S * .6, by + Math.sin(ta) * S * .6]); } }
        if (ok(IM.firewall) && t > 1.0) { const a = smooth(kk(t, 1.0, 1.3)) * (1 - smooth(kk(t, 2.8, 3.8))); g.save(); g.beginPath(); g.rect(C.x0, C.y0 - C.h * .5, C.w, C.h * 1.5); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .9; const off = (t * 220) % C.w; g.drawImage(IM.firewall, C.x0 - off, C.y0 + C.h * .25, C.w, C.h * .75); g.drawImage(IM.firewall, C.x0 - off + C.w, C.y0 + C.h * .25, C.w, C.h * .75); g.restore(); }
        if (t > this.impact) { const q = t - this.impact; flash(g, M.cx, M.cy, S * 2.4, '255,170,80', (1 - smooth(kk(q, 0, .5))) * 1.1); shock(g, 'shock_o', M.cx, M.cy, S * 1.6, kk(q, 0, 1.1), .9, .55); if (ok(IM.fireball)) { const fs = S * (.3 + .4 * outCubic(kk(q, 0, .8))), f = Math.min(7, (kk(q, 0, 1.4) * 8) | 0); g.save(); g.globalAlpha = 1 - smooth(kk(q, 1.0, 1.6)); g.drawImage(IM.fireball, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, M.cx - fs / 2, M.cy - fs * .6, fs, fs); g.restore(); } }
      } },
    /* ⛈️ 뇌신 폭풍 */
    meteor: { end: 5.4, impact: 1.5, dmg: 'lichten',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 4.6, 5.4));
        wash(g, M, '6,8,24', .55 * smooth(kk(t, 0, .5)) * out); vig(g, M, '90,120,255', .45 * out);
        if (ok(IM.billow)) for (let i = 0; i < (LOW() ? 5 : 9); i++) { const u = ((i * .137 + t * .03) % 1.2) - .1, x = M.br.left + M.br.width * u, y = M.br.top + S * (.04 + .05 * Math.sin(i * 1.7 + t)), z = S * (.45 + .2 * Math.sin(i)); g.save(); g.globalAlpha = .85 * smooth(kk(t, 0, .6)) * out; g.drawImage(tint(IM.billow, 'st', '40,40,70', .85), (i % 4) * 256, 0, 256, 256, x - z / 2, y - z / 2, z, z); g.restore(); }
        /* 연속 낙뢰 */
        st.next = st.next || .45; if (t > st.next && t < 4.2) { st.next = t + (t < 1.5 ? rnd(.08, .16) : rnd(.25, .5)); const x = C.x0 + C.w * rnd(.05, .95), y = C.y0 + C.h * rnd(.15, .9); st.bolts.push({ x, y, t0: t, f: (Math.random() * 6) | 0, big: false }); st.scars.push([x, y]); noise(.25, 'highpass', 5000, 900, .1); }
        if (t > 1.5 && !st.main) { st.main = 1; [-1, 0, 1].forEach(d => st.bolts.push({ x: M.cx + d * S * .12, y: M.cy, t0: t + Math.abs(d) * .05, f: (Math.random() * 6) | 0, big: true })); tone('sawtooth', 120, 30, 1.1, .16); noise(1, 'lowpass', 2000, 80, .22); }
        for (let i = st.bolts.length - 1; i >= 0; i--) { const b = st.bolts[i], q = (t - b.t0) / (b.big ? .7 : .35); if (q < 0) continue; if (q >= 1) { st.bolts.splice(i, 1); continue; } const w = S * (b.big ? .55 : .26), a = (1 - q) * (.55 + .45 * Math.abs(Math.sin(t * 60 + i))); bolt(g, b.big ? 'bolt_y' : 'bolt_b', b.x + rnd(-3, 3), M.br.top - S * .05, b.x, b.y, w, a, b.f + ((t / .05) | 0)); glow(g, b.big ? 'glow_y' : 'glow_b', b.x, b.y, S * (b.big ? .9 : .35), a); if (q < .12) { flash(g, b.x, b.y, S * (b.big ? 2.4 : .9), '200,220,255', (b.big ? 1.2 : .6) * (1 - q / .12)); if (!b.sp) { b.sp = 1; for (let k = 0; k < (b.big ? 30 : 10); k++) sp(st.P, { kind: 'spark', cell: pick([3, 4, 5]), x: b.x, y: b.y, vx: rnd(-1, 1) * S * .6, vy: -rnd(.1, .7) * S, ay: S * 1.2, size: S * rnd(.01, .025), life: rnd(.4, .9), rgb: '180,210,255' }); } } }
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
    vortex: { end: 3.8, impact: 1.25, dmg: 'ice', own: true, hits: [[1.25, .5, .5], [1.55, .3, .55], [1.75, .7, .45]],
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.1, 3.8));
        wash(g, M, '4,16,40', .45 * smooth(kk(t, 0, .4)) * out); vig(g, M, '120,200,255', .5 * out);
        if (ok(IM.frost)) { const fz = smooth(kk(t, .1, .9)) * out; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18 * fz; g.drawImage(IM.frost, M.br.left, M.br.top, M.br.width, M.br.height); g.restore(); }
        const fq = kk(t, .2, this.impact), gx = M.cx, gy = M.cy, z = S * .75;
        if (t < this.impact + .05 && ok(IM.glacier)) { const y0 = Math.max(M.br.top - z * .3, gy - S * 1.1), y = y0 + (gy - y0) * fq * fq; { const sh = .25 + .75 * fq; g.save(); g.globalAlpha = .45 * fq; g.fillStyle = '#0a1a30'; g.beginPath(); g.ellipse(gx, gy + z * .1, z * .5 * sh, z * .16 * sh, 0, 0, TAU); g.fill(); g.restore(); } g.save(); g.translate(gx, y - z * .2); g.rotate(fq * .6); g.drawImage(IM.glacier, -z / 2, -z / 2, z, z); g.restore(); ribbon(g, gx, y - z, gx, y, z * .6, '200,235,255', .35 * fq); if (Math.random() < .5) sp(st.P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: gx + rnd(-z * .3, z * .3), y: y, vx: rnd(-50, 50), vy: -rnd(20, 80), size: S * rnd(.02, .04), life: .6, rgb: '200,235,255' }); }
        if (t > this.impact) { const q = t - this.impact; if (!st.d) { st.d = 1; for (let i = 0; i < (LOW() ? 24 : 44); i++) sp(st.P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: gx, y: gy, vx: rnd(-1, 1) * S * 1.0, vy: -rnd(.2, 1.1) * S, ay: S * 1.8, size: S * rnd(.05, .12), life: rnd(1, 1.8), rgb: '190,230,255', rot: rnd(0, TAU), vr: rnd(-6, 6) }); for (let i = 0; i < 10; i++) sp(st.P, { kind: 'billow', cell: i % 4, x: gx + rnd(-.3, .3) * C.w, y: gy, vx: rnd(-120, 120), vy: -rnd(10, 50), size: S * rnd(.18, .3), grow: 1.2, life: 2.2, rgb: '225,245,255', add: false }); tone('sine', 300, 60, .8, .14); noise(.9, 'highpass', 6000, 800, .18); }
          flash(g, gx, gy, S * 2.4, '220,240,255', (1 - smooth(kk(q, 0, .45))) * 1.2); shock(g, 'shock_b', gx, gy, S * 2.0, kk(q, 0, 1.1), .9, .55); if (ok(IM.vapor)) img(g, IM.vapor, gx, gy, S * (.4 + 2.2 * outCubic(kk(q, 0, 1))), S * (.4 + 2.2 * outCubic(kk(q, 0, 1))) * .36, (1 - smooth(kk(q, .3, 1.2))) * .8, 0, true); }
      } }
  };

  /* ====================================================================
   *  장기판 파손 데칼 (성질별 이미지) — 판 캔버스 바닥층에 캐시해서 그림
   * ==================================================================== */
  const DEC = { c: [], h: [] };
  function campCv(side) { const isBottom = (typeof flip !== 'undefined' && flip) ? (side === 'h') : (side === 'c'); return { x0: OX - CX * .42, w: 8 * CX + CX * .84, y0: isBottom ? (OY + 4.55 * CY) : (OY - CY * .42), h: 4.42 * CY + CY * .42 }; }
  function addDecal(side, type, fx, fy, rot) { const L2 = DEC[side]; if (!L2) return; L2.push({ type, fx, fy, rot: rot == null ? rnd(-.6, .6) : rot, s: rnd(.85, 1.15), seed: Math.random() * 1000 }); while (L2.length > 10) L2.shift(); dDirty = true; }
  let dc = null, dg = null, dDirty = true, dSig = '', lastMc = 0;
  function drawDecal(g, d, cx, cy, C) {
    const R = (k) => { const r = Math.sin(d.seed + k * 12.9898) * 43758.5453; return r - Math.floor(r); };
    g.save(); g.translate(cx, cy); g.rotate(d.rot); g.globalAlpha = .92;
    if (d.type === 'burn' && ok(IM.d_burn)) { g.globalAlpha = .72; g.drawImage(IM.d_burn, -C * 2.0 * d.s, -C * .45 * d.s, C * 4.0 * d.s, C * .9 * d.s); for (let i = 0; i < 3; i++) { const z = C * (.8 + R(i) * .6); g.drawImage(IM.d_burn, (R(i + 3) - .5) * C * 3, (R(i + 6) - .5) * C * 1.4 - z * .2, z * 1.6, z * .5); } }
    else if (d.type === 'lichten' && ok(IM.d_lichten)) { g.globalAlpha = .8; const z = C * 3.0 * d.s; g.drawImage(IM.d_lichten, -z / 2, -z / 2, z, z); }
    else if (d.type === 'ice' && ok(IM.d_ice)) { const z = C * 3.4 * d.s; g.drawImage(IM.d_ice, -z / 2, -z / 2, z, z * .85); if (ok(IM.ice)) for (let i = 0; i < 5; i++) { const a = R(i) * TAU, r = C * (.4 + R(i + 9) * .9), s2 = C * (.5 + R(i + 4) * .4); g.save(); g.translate(Math.cos(a) * r, Math.sin(a) * r * .8); g.rotate(R(i + 2) * TAU); g.drawImage(tint(IM.ice, 'dic', '200,235,255', .4), ((i % 4)) * 128, 0, 128, 128, -s2 / 2, -s2 / 2, s2, s2); g.restore(); } }
    else if (d.type === 'fault' && ok(IM.d_fault)) { g.drawImage(IM.d_fault, -C * 3.2 * d.s, -C * .65 * d.s, C * 6.4 * d.s, C * 1.3 * d.s); if (ok(IM.rock)) for (let i = 0; i < 6; i++) { const s2 = C * (.28 + R(i) * .3); g.save(); g.translate((R(i + 3) - .5) * C * 5, (R(i + 7) - .5) * C * 1.6); g.rotate(R(i + 1) * TAU); g.drawImage(IM.rock, ((i % 4)) * 64, 0, 64, 64, -s2 / 2, -s2 / 2, s2, s2); g.restore(); } }
    g.restore();
  }
  function hookGround() {
    const orig = window.jgDrawBoardThemeFX; if (orig && orig.__n14) return;
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
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(dc, 0, 0); g.restore();
      } catch (e) {}
    };
    fn.__n14 = true; window.jgDrawBoardThemeFX = fn;
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
    const S = window.jgSkillFx; if (!S || typeof S.start !== 'function' || S.start.__n14) return;
    const os = S.start;
    S.start = function (sk, V) { if (N14.enabled && SC[sk] && !SC[sk].own) { hide = { n: 1, z: sk === 'kame2' ? '24' : '9', until: performance.now() + 900 }; try { run(sk, V); } catch (e) {} return; } return os.apply(this, arguments); };
    S.start.__n14 = true;
  }
  /* 차원와류포 슬롯 → 빙하 붕괴 (원본 함수 대체, 동기화 seed 유지) */
  function hookVortex() {
    const ov = window.jgVortexFire; if (ov && ov.__n14) return;
    const fn = function (attackerSide, seed) {
      if (!N14.enabled) return ov && ov.apply(this, arguments);
      if (typeof window.jgPunishBusy === 'function' && window.jgPunishBusy()) return;
      if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(true);
      const A = (attackerSide === 'h' || attackerSide === 'c') ? attackerSide : (typeof me !== 'undefined' ? me : 'c'), V = A === 'c' ? 'h' : 'c', scn = SC.vortex;
      run('vortex', V, seed); let hi = 0; tone('sine', 900, 200, .9, .06);
      const tick = () => { const now = performance.now() - st0; while (hi < scn.hits.length && now / 1000 >= scn.hits[hi][0]) { const h = scn.hits[hi++]; try { window.hitCamp && window.hitCamp(V, 'vortex', { fx: h[1], fy: h[2], rot: 0 }); } catch (e) {} if (hi === 1) try { window.hitScreen && Q() >= .6 && window.hitScreen(V, 'fist', h[1], h[2], 0, true); } catch (e) {} } if (hi < scn.hits.length) requestAnimationFrame(tick); else setTimeout(() => { if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); }, (scn.end - scn.hits[scn.hits.length - 1][0]) * 1000); };
      const st0 = performance.now(); requestAnimationFrame(tick);
    };
    fn.__n14 = true; window.jgVortexFire = fn;
  }
  /* hitCamp: 새 스킬 4종은 예전 불탄 자국 대신 성질별 파손 데칼을 남김 */
  function hookHit() {
    const hc = window.hitCamp; if (typeof hc !== 'function' || hc.__n14) return;
    const fn = function (side, sk, extra) {
      const mine = N14.enabled && SC[sk]; const S1 = window.jgSkillFx, prev = S1 ? S1.enabled : undefined;
      if (mine && S1) S1.enabled = false;
      let r; try { r = hc.apply(this, arguments); } finally { if (mine && S1) S1.enabled = prev; }
      if (mine) { try { const hits = (window.DMG_SK && window.DMG_SK[side]) || [], last = hits[hits.length - 1] || {}, fx = extra && extra.fx != null ? extra.fx : (last.fx != null ? last.fx : .5), fy = extra && extra.fy != null ? extra.fy : (last.fy != null ? last.fy : .5); addDecal(side, SC[sk].dmg, fx, fy, sk === 'nuke' ? rnd(-.3, .3) : null); if (sk === 'meteor') for (let i = 0; i < 2; i++) addDecal(side, 'lichten', clamp(fx + rnd(-.3, .3), .08, .92), clamp(fy + rnd(-.3, .3), .1, .9)); if (sk === 'nuke') addDecal(side, 'burn', clamp(fx + rnd(-.25, .25), .1, .9), clamp(fy + rnd(-.25, .25), .1, .9)); } catch (e) {} }
      return r;
    };
    fn.__n14 = true; window.hitCamp = fn;
  }
  function installAll() { hookStart(); hookVortex(); hookHit(); hookGround(); }
  installAll(); setInterval(installAll, 1200);
  N14.test = (sk, V) => { if (sk === 'vortex') return window.jgVortexFire(V === 'h' ? 'c' : 'h', 1); run(sk, V || 'h'); setTimeout(() => window.hitCamp && window.hitCamp(V || 'h', sk), SC[sk].impact * 1000); };
  N14.decal = addDecal;
})();
