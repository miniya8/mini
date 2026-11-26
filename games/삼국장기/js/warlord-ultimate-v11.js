/* ============================================================================
 * [군주 필살기 v11 — 응징과 완전히 다른, 군주별 전용 필살기]  js/warlord-ultimate-v11.js
 *  50/100/150수 해금 '군주 스킬'을 필살기로 연출합니다. (응징 스킬 연출을 재사용하지 않음)
 *  ─ 컷인도 군주마다 모양·등장 방식이 다르고, 본 공격은 적 진영 전체를 덮는 규모입니다.
 *   🌌 제갈량 [臥龍天機] 달 모양 원형 컷인 → 동남풍이 불어 화공의 불벽이 진영을 휩쓸고 → 북두칠성 7줄기 별빛 기둥 → 팔괘 수렴
 *   🌊 손  권 [江東怒濤] 물결 컷인 → 거대한 소용돌이 + 용오름 물기둥 3개가 휘돌다 → 한가운데로 무너지며 대해일
 *   ⚡ 조  조 [覇王天命] 위로 떨어지는 군기 컷인 → 하늘을 덮는 조조의 위압 → 만 발의 화살비 → 황금 낙뢰 왕관 · 魏 각인
 *   🌸 유  비 [桃園雙劍] 세 갈래 참격 컷인 → 관우 청룡언월도 횡참 → 장비 장팔사모 관통 → 유비 쌍검 X참 → 도원결의 세 기둥
 *   🔱 여  포 [天下無雙] 산산조각 맞춰지는 컷인 → 불타는 적토마 돌격 → 방천화극 회전 회오리 → 귀신 강림 대폭발
 *   🐺 사마의 [狼顧氷獄] 서리 컷인 → 보름달 앞 늑대의 포효 → 진영 전체에 얼음 기둥 감옥 → 산산이 깨지는 빙옥
 *  모바일: 캔버스 1장만 사용 · 성능 조절기(jgPerf) 연동(해상도·입자·블룸) · 컷신 중 환경 레이어 정지 · 그림자블러 미사용
 *  끄기: jgUltimate11.enabled = false  (이전 컷인 방식으로 돌아감)
 * ============================================================================ */
(function jgUltimate11Module() {
  if (window.jgUltimate11) return;
  const U = window.jgUltimate11 = { enabled: true, bloom: .5 };
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  const smooth = k => { k = clamp(k, 0, 1); return k * k * k * (k * (k * 6 - 15) + 10); };
  const outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const outQuint = k => 1 - Math.pow(1 - clamp(k, 0, 1), 5);
  const inCubic = k => Math.pow(clamp(k, 0, 1), 3);
  const outBack = k => { k = clamp(k, 0, 1); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const kk = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const hash = (i, s) => { const r = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return r - Math.floor(r); };
  const Q = () => window.jgPerf ? window.jgPerf.q : 1, LOW = () => Q() < .6;
  const hexRGB = h => { h = String(h || '#ffffff').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };

  /* ---------- 이미지 ---------- */
  const IM = {}, L = (k, n) => { const i = new Image(); i.src = 'assets/images/fx/' + n + '.webp'; IM[k] = i; };
  ['firewall', 'volley', 'spout', 'whirl', 'glaive', 'spear', 'horse', 'icepillar', 'speed', 'brush', 'burst', 'seal'].forEach(n => L(n, 'ult_' + n));
  ['bagua', 'starflare', 'sword', 'halberd', 'fissure', 'wolf', 'ice', 'petal', 'rock', 'ribbon', 'softflash', 'foam', 'orb'].forEach(n => L(n, 'wl_' + n));
  ['sparks', 'glow_o', 'glow_b', 'glow_g', 'glow_y', 'glow_p', 'shock_o', 'shock_b', 'shock_g', 'shock_y', 'shock_p', 'bolt_y', 'bolt_b', 'bolt_p', 'flame_o', 'flame_p', 'vignette'].forEach(n => L(n, 'v2_' + n));
  ['moon', 'frost', 'cloud', 'rainbow'].forEach(n => L(n, 'env_' + n)); L('billow', 'fx_billow'); L('vapor', 'fx_vapor');
  IM.por = {}; ['zhuge', 'sunquan', 'caocao', 'liubei', 'lvbu', 'simayi'].forEach(id => { const i = new Image(); i.src = 'assets/images/warlords/' + id + '.jpg'; IM.por[id] = i; });
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
  const tc = {};
  function tint(img, key, rgb, a) { const id = key + '|' + rgb + '|' + a; if (tc[id]) return tc[id]; if (!ok(img)) return img; const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }

  /* ---------- 소리 ---------- */
  let AC = null; const ac = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  const sfxOn = () => !(window.jgEnv3 && window.jgEnv3.sfx === false);
  function tone(type, f0, f1, dur, vol, delay) { if (!sfxOn()) return; const a = ac(); if (!a) return; try { const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .03); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .05); } catch (e) {} }
  function noise(dur, ft, f0, f1, vol, delay) { if (!sfxOn()) return; const a = ac(); if (!a) return; try { const t0 = a.currentTime + (delay || 0), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.4); const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = ft; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t0); } catch (e) {} }

  /* ---------- 좌표 ---------- */
  function metrics(V) {
    const cvB = document.getElementById('cv'), W = window.innerWidth, H = window.innerHeight, r = cvB ? cvB.getBoundingClientRect() : { left: 0, top: 46, width: W, height: H - 46 };
    const isTop = (typeof flip !== 'undefined' && flip) ? (V === 'c') : (V === 'h'), hasG = typeof OX === 'number' && typeof CX === 'number' && CX > 5;
    const cx = hasG ? CX : r.width / 9, cy = hasG ? CY : r.height / 10, gl = r.left + (hasG ? OX : r.width * .1), gt = r.top + (hasG ? OY : r.height * .08);
    const camp = { x0: gl - cx * .4, w: 8 * cx + cx * .8, y0: isTop ? gt - cy * .4 : gt + 4.55 * cy, h: 4.42 * cy + cy * .4 };
    return { W, H, S: Math.min(r.width, r.height), br: { left: r.left, top: r.top, width: r.width, height: r.height }, isTop, camp, cx: camp.x0 + camp.w / 2, cy: camp.y0 + camp.h / 2, cell: Math.min(cx, cy) };
  }

  /* ---------- 파티클(모바일: 개수 자동 축소) ---------- */
  const SHEET = { spark: ['sparks', 64, 64], billow: ['billow', 256, 256], petal: ['petal', 64, 64], ice: ['ice', 128, 128], rock: ['rock', 64, 64], foam: ['foam', 128, 128] };
  function sp(P, o) { const q = Q(); if (q < .95 && o.kind !== 'rock' && Math.random() > Math.max(.3, q)) return; if (P.length >= Math.round(360 * Math.max(.45, q))) return; P.push(Object.assign({ kind: 'spark', cell: 0, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, rot: 0, vr: 0, size: 10, a: 1, life: 1.4, age: 0, rgb: null, ta: .8, add: true, grow: 0, fadeIn: 0 }, o)); }
  function stepPT(P, g, dt) {
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.age += dt; if (p.age >= p.life) { P.splice(i, 1); continue; }
      const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const sh = SHEET[p.kind], img = IM[sh[0]]; if (!ok(img)) continue; const k = p.age / p.life, a = p.a * (p.fadeIn ? smooth(p.age / p.fadeIn) : 1) * (1 - smooth((k - .55) / .45)); if (a <= .01) continue;
      const s = p.size * (1 + p.grow * k), src = p._s || (p._s = (p.rgb && p.kind !== 'petal' && p.kind !== 'rock') ? tint(img, p.kind, p.rgb, p.ta) : img);
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1);
      g.save(); g.translate(p.x, p.y); if (p.rot) g.rotate(p.rot); g.drawImage(src, p.cell * sh[1], 0, sh[1], sh[2], -s / 2, -s / 2, s, s); g.restore();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function burst(P, x, y, n, o) { n = window.jgPerf ? window.jgPerf.n(n) : n; for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(o.v0, o.v1); sp(P, Object.assign({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * (o.sq || .8) + (o.up || 0), life: rnd(o.l0 || .7, o.l1 || 1.6), size: rnd(o.s0, o.s1), rot: rnd(0, TAU), vr: rnd(-6, 6) }, o.p || {}, o.pf ? o.pf(i) : {})); } }

  /* ---------- 그리기 도구 ---------- */
  const img = (g, im, x, y, w, h, a, rot, add) => { if (!ok(im) || a <= .004) return; g.save(); if (add) g.globalCompositeOperation = 'lighter'; g.translate(x, y); if (rot) g.rotate(rot); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); };
  const glow = (g, key, x, y, s, a) => img(g, IM[key], x, y, s, s, a, 0, true);
  const flash = (g, x, y, s, rgb, a) => img(g, tint(IM.softflash, 'sf', rgb, .8), x, y, s, s, a * .6, 0, true);
  function ribbon(g, x0, y0, x1, y1, w, rgb, a) { const im = IM.ribbon; if (!ok(im) || a <= .004) return; const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy); if (Ln < 1) return; g.save(); g.globalCompositeOperation = 'lighter'; g.translate((x0 + x1) / 2, (y0 + y1) / 2); g.rotate(Math.atan2(dy, dx)); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tint(im, 'rb', rgb, .75), -Ln / 2, -w / 2, Ln, w); g.restore(); }
  function shock(g, key, x, y, s, k, a, flat) { const im = IM[key]; if (!ok(im) || a <= .004 || k < 0 || k >= 1) return; const f = Math.min(7, (k * 8) | 0); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || .58); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -s / 2, -s / 2, s, s); g.restore(); }
  function bolt(g, key, x0, y0, x1, y1, w, a, fr) { const im = IM[key]; if (!ok(im) || a <= .004) return; const L2 = Math.hypot(x1 - x0, y1 - y0); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x0, y0); g.rotate(Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (fr % 6) * 256, 0, 256, 512, -w / 2, 0, w, L2); g.restore(); }
  const vig = (g, M, rgb, a) => { if (a > .004 && ok(IM.vignette)) { g.save(); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tint(IM.vignette, 'vg', rgb, 1), 0, 0, M.W, M.H); g.restore(); } };
  const wash = (g, M, rgb, a) => { if (a > .004) { g.save(); g.fillStyle = `rgba(${rgb},${clamp(a, 0, 1)})`; g.fillRect(0, 0, M.W, M.H); g.restore(); } };

  /* ====================================================================
   *  컷인 스타일 (군주별로 모양·등장 방식이 다름)
   * ==================================================================== */
  function panelPath(g, style, x, y, w, h, t) {
    g.beginPath();
    if (style === 'moon') { g.arc(x + w / 2, y + h / 2, Math.min(w, h) * .5, 0, TAU); }
    else if (style === 'wave') { g.moveTo(x, y + h * .12); for (let i = 0; i <= 24; i++) { const u = i / 24; g.lineTo(x + w * u, y + h * .08 + Math.sin(u * 9 + t * 6) * h * .05); } g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); }
    else if (style === 'banner') { g.moveTo(x + w * .1, y); g.lineTo(x + w * .9, y); g.lineTo(x + w * .9, y + h); g.lineTo(x + w * .5, y + h * .88); g.lineTo(x + w * .1, y + h); g.closePath(); }
    else if (style === 'frost') { g.ellipse(x + w / 2, y + h / 2, w * .48, h * .5, 0, 0, TAU); }
    else { const sk = w * .14; g.moveTo(x + sk, y); g.lineTo(x + w, y); g.lineTo(x + w - sk, y + h); g.lineTo(x, y + h); g.closePath(); }
  }
  const CUT = { zhuge: 'moon', sunquan: 'wave', caocao: 'banner', liubei: 'triple', lvbu: 'shatter', simayi: 'frost' };
  function drawCutin(g, M, w, t, T1, st) {
    const W = M.W, H = M.H, S = Math.min(W, H), pc = st.pc, sc = st.sc, style = CUT[w.id] || 'para', por = IM.por[w.id];
    const inA = smooth(kk(t, 0, .28)), out = smooth(kk(t, T1 - .1, T1 + .3)), cutA = 1 - out;
    wash(g, M, '0,0,0', .6 * inA * cutA); if (!LOW()) vig(g, M, pc, .7 * inA * cutA);
    const cx = W / 2, cy = H * .42;
    if (ok(IM.speed)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.rotate(t * (style === 'shatter' ? 1.2 : .5) * (style === 'wave' ? -1 : 1)); const z = Math.max(W, H) * (LOW() ? 1.25 : 1.7); g.globalAlpha = .5 * smooth(kk(t, .05, .45)) * cutA; g.drawImage(tint(IM.speed, 'us', sc, .8), -z / 2, -z / 2, z, z); g.restore(); }
    /* 스타일별 배경 장식 */
    if (style === 'moon' && ok(IM.bagua)) { const z = S * 1.15 * outBack(kk(t, .1, .7)); img(g, tint(IM.bagua, 'bg', sc, .5), cx, cy, z, z, .8 * cutA, t * .6, true); for (let i = 0; i < (LOW() ? 3 : 9); i++) glow(g, 'glow_y', cx + Math.cos(i * .7 + t) * S * .5, cy + Math.sin(i * 1.3) * S * .4, S * .06, (.5 + .5 * Math.sin(t * 6 + i)) * cutA); }
    if (style === 'banner') { g.save(); g.globalAlpha = .22 * cutA; g.fillStyle = `rgb(${sc})`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${S * .9}px "Noto Serif KR",serif`; g.fillText('위', cx, cy); g.restore(); if (Math.random() < .2) bolt(g, 'bolt_y', cx + rnd(-.5, .5) * W, 0, cx + rnd(-.3, .3) * W, H * .5, S * .25, .5 * cutA, (Math.random() * 6) | 0); }
    if (style === 'shatter' && Math.random() < .3) bolt(g, 'bolt_p', rnd(0, W), 0, rnd(0, W), H * rnd(.3, .7), S * .25, .55 * cutA, (Math.random() * 6) | 0);
    if (ok(IM.burst)) { const q = outBack(kk(t, .12, .6)); img(g, tint(IM.burst, 'ub', sc, .7), cx, cy, S * 1.2 * q, S * 1.2 * q, .5 * cutA, -.12 + Math.sin(t * 4) * .02, true); }
    /* 초상 패널 */
    const pw = style === 'moon' || style === 'frost' ? S * .78 : W * .8, ph = style === 'moon' ? S * .78 : style === 'banner' ? H * .58 : H * .5;
    let px0 = cx - pw / 2, py0 = cy - ph / 2;
    const ein = outBack(kk(t, .18, .74));
    if (style === 'moon') py0 += (1 - ein) * H * .9; else if (style === 'wave') py0 += (1 - ein) * H; else if (style === 'banner') py0 -= (1 - ein) * H; else if (style === 'frost') {} else if (style === 'para' || style === 'triple') px0 -= (1 - ein) * W * 1.1;
    px0 += W * 1.1 * smooth(kk(t, T1 - .05, T1 + .35)) * (style === 'banner' ? 0 : 1); if (style === 'banner') py0 -= H * smooth(kk(t, T1 - .05, T1 + .35));
    const drawPortrait = (ga) => { if (!ok(por)) return; const s2 = Math.max(pw / por.naturalWidth, ph / por.naturalHeight) * (1.06 + .05 * kk(t, .3, 2.0)), iw = por.naturalWidth * s2, ih = por.naturalHeight * s2; ga.drawImage(por, px0 + pw / 2 - iw / 2, py0 + ph * .2 - ih * .14, iw, ih); };
    if (cutA > .01) {
      g.save(); g.globalAlpha = cutA;
      if (style === 'triple') {
        /* 세 갈래 띠가 번갈아 들어와 하나의 초상이 됨 */
        for (let k2 = 0; k2 < 3; k2++) { const off = (1 - outBack(kk(t, .18 + k2 * .12, .7 + k2 * .1))) * W * (k2 % 2 ? 1.1 : -1.1); g.save(); g.beginPath(); const y0 = py0 + ph * k2 / 3, sk = pw * .12; g.moveTo(px0 + sk + off, y0); g.lineTo(px0 + pw + off, y0); g.lineTo(px0 + pw - sk * .33 + off, y0 + ph / 3); g.lineTo(px0 + sk * .67 + off, y0 + ph / 3); g.closePath(); g.clip(); g.translate(off, 0); g.fillStyle = '#10101c'; g.fillRect(px0, py0, pw, ph); drawPortrait(g); g.restore(); g.save(); g.strokeStyle = `rgba(${sc},1)`; g.lineWidth = 3; g.beginPath(); g.moveTo(px0 + off, py0 + ph * k2 / 3); g.lineTo(px0 + pw + off, py0 + ph * k2 / 3); g.stroke(); g.restore(); }
      } else if (style === 'shatter') {
        /* 9조각이 날아와 맞춰짐 */
        for (let k2 = 0; k2 < 9; k2++) { const cx2 = px0 + pw * ((k2 % 3) + .5) / 3, cy2 = py0 + ph * (((k2 / 3) | 0) + .5) / 3, q2 = outBack(kk(t, .15 + k2 * .045, .55 + k2 * .045)), ox = (1 - q2) * (hash(k2, 1) - .5) * W * 1.4, oy = (1 - q2) * (hash(k2, 2) - .5) * H * 1.2, rr = (1 - q2) * (hash(k2, 3) - .5) * 3;
          g.save(); g.translate(cx2 + ox, cy2 + oy); g.rotate(rr); g.translate(-cx2, -cy2); g.beginPath(); g.rect(px0 + pw * (k2 % 3) / 3, py0 + ph * ((k2 / 3) | 0) / 3, pw / 3 + 1, ph / 3 + 1); g.clip(); g.fillStyle = '#10101c'; g.fillRect(px0, py0, pw, ph); drawPortrait(g); g.restore(); }
        g.save(); g.strokeStyle = `rgba(${sc},${smooth(kk(t, .6, .8))})`; g.lineWidth = 4; g.strokeRect(px0, py0, pw, ph); g.restore();
      } else {
        g.save(); panelPath(g, style, px0, py0, pw, ph, t); g.save(); g.clip(); g.fillStyle = '#10101c'; g.fillRect(px0, py0, pw, ph); drawPortrait(g);
        const gr = g.createLinearGradient(0, py0, 0, py0 + ph); gr.addColorStop(0, `rgba(${pc},0)`); gr.addColorStop(1, `rgba(${pc},.55)`); g.fillStyle = gr; g.fillRect(px0, py0, pw, ph);
        if (style === 'frost' && ok(IM.frost)) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .7 * (1 - smooth(kk(t, .3, 1.2))) + .15; g.drawImage(IM.frost, px0, py0, pw, ph); }
        g.restore(); g.strokeStyle = `rgba(${sc},1)`; g.lineWidth = 5; g.stroke(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${sc},.35)`; g.lineWidth = 16; g.stroke(); g.restore();
        if (style === 'frost') { const ey = py0 + ph * .32; [-1, 1].forEach(s => glow(g, 'glow_b', cx + s * pw * .12, ey, S * .14 * (.7 + .3 * Math.sin(t * 9)), .8 * smooth(kk(t, .6, .9)) * cutA)); }
        if (style === 'wave' && Math.random() < .6) sp(st.P, { kind: 'foam', cell: (Math.random() * 4) | 0, x: px0 + Math.random() * pw, y: py0 + ph * .1, vx: rnd(-40, 40), vy: -rnd(60, 200), ay: 400, size: S * rnd(.04, .09), life: 1, rgb: '220,248,255', add: false });
      }
      g.restore();
    }
    /* 제목 */
    const ta = smooth(kk(t, .55, .95)) * cutA, wipe = outQuint(kk(t, .55, 1.15));
    if (ta > .01) {
      const by = Math.min(H * .86, py0 + ph + H * .075 + (style === 'moon' ? 0 : 0));
      if (ok(IM.brush)) { g.save(); g.globalAlpha = .9 * ta; g.translate(cx, by); g.rotate(style === 'banner' ? 0 : -.04); g.drawImage(tint(IM.brush, 'ubr', pc, .85), 0, 0, 1024, 256, -W * .5, -H * .07, W * wipe, H * .14); g.restore(); }
      g.save(); g.beginPath(); g.rect(0, by - H * .09, W * wipe, H * .2); g.clip(); g.translate(cx, by); g.rotate(style === 'banner' ? 0 : -.04); g.textAlign = 'center'; g.textBaseline = 'middle'; const fs = Math.min(W * .17, H * .1); g.font = `900 ${fs}px "Noto Serif KR","Nanum Myeongjo","Songti SC",serif`; g.lineJoin = 'round'; g.lineWidth = fs * .16; g.strokeStyle = 'rgba(10,6,0,.95)'; g.globalAlpha = ta; g.strokeText(st.title, 0, 0); g.fillStyle = '#fff6d6'; g.fillText(st.title, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${sc},.45)`; g.fillText(st.title, 0, 0); g.restore();
      g.save(); g.globalAlpha = ta; g.textAlign = 'center'; g.textBaseline = 'middle'; const f2 = Math.min(W * .05, H * .03); g.font = `800 ${f2}px "Noto Serif KR",serif`; g.lineWidth = f2 * .25; g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineJoin = 'round'; g.strokeText(`${w.name} · ${st.sub}`, cx, by + H * .095); g.fillStyle = `rgb(${sc})`; g.fillText(`${w.name} · ${st.sub}`, cx, by + H * .095); g.restore();
    }
    const fl = Math.max(0, 1 - Math.abs(t - T1) * 5); if (fl > 0) flash(g, cx, cy, Math.max(W, H) * 1.8, sc, fl * 1.4);
  }

  /* ====================================================================
   *  군주별 필살 공격 (t: 공격 시작 후 초) — hits: 피해 처리 시각과 위치(진영 비율)
   * ==================================================================== */
  const ULT = {
    /* 🌌 제갈량 : 동남풍 화공 + 칠성 별빛 기둥 + 팔괘 수렴 */
    zhuge: { dur: 4.3, hits: [[1.7, .5, .5], [2.3, .25, .45], [2.9, .75, .55]], stamp: 2.35, sub: '동 남 풍 화 공',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.6, 4.3));
        wash(g, M, '4,10,40', .45 * smooth(kk(t, 0, .4)) * out); vig(g, M, '255,120,40', .35 * smooth(kk(t, .8, 1.4)) * out);
        for (let i = 0; i < (LOW() ? 6 : 12); i++) { const y = C.y0 + C.h * (i + .5) / (LOW() ? 6 : 12), u = ((t * (.8 + hash(i, 1) * .6) + hash(i, 2)) % 1.3) - .15, x = M.br.left + M.br.width * (1.1 - u * 1.3); ribbon(g, x, y, x + S * .5, y - S * .04, S * .02, '200,240,255', .55 * out * smooth(kk(t, 0, .3))); }
        const fw = IM.firewall; if (ok(fw)) { const prog = kk(t, .7, 2.6), front = C.x0 + C.w * (1.15 - prog * 1.3); for (let r = 0; r < 3; r++) { const y = C.y0 + C.h * (.35 + r * .3), hgt = C.h * .62, a = smooth(kk(t, .7, 1.0)) * (1 - smooth(kk(t, 2.8, 3.6))); g.save(); g.beginPath(); g.rect(front, C.y0 - C.h * .3, C.x0 + C.w - front + C.w * .2, C.h * 1.4); g.clip(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * (r === 1 ? 1 : .75); const off = ((t * 300 + r * 200) % (C.w * 1.0)); g.drawImage(fw, C.x0 - off, y - hgt, C.w * 1.0, hgt); g.drawImage(fw, C.x0 - off + C.w, y - hgt, C.w * 1.0, hgt); g.restore(); }
          if (prog > 0 && prog < 1) for (let i = 0; i < 2; i++) sp(st.P, { kind: 'spark', cell: pick([0, 6, 7]), x: front + rnd(0, S * .05), y: C.y0 + Math.random() * C.h, vx: -S * rnd(.2, .5), vy: -rnd(40, 160), size: S * rnd(.01, .025), life: rnd(.8, 1.6), rgb: '255,170,70' }); }
        const pos = Array.from({ length: 7 }, (_, i) => [C.x0 + C.w * (.12 + i * .127), C.y0 + C.h * (.3 + .35 * Math.sin(i * 1.7))]);
        pos.forEach(([x, y], i) => { const ts = .2 + i * .1, a = smooth(kk(t, ts, ts + .3)) * out; glow(g, 'glow_y', x, M.br.top + S * .05, S * .14, a); img(g, IM.starflare, x, M.br.top + S * .05, S * .12, S * .12, a, t + i, true); const bq = kk(t, 1.55 + i * .05, 1.75 + i * .05); if (bq > 0 && bq < 1) { ribbon(g, x, M.br.top, x, y, S * .09 * (1 - bq), '255,238,170', 1); ribbon(g, x, M.br.top, x, y, S * .03, '255,255,255', 1 - bq); } const fa = 1 - smooth(kk(t, 1.75 + i * .05, 2.6)); if (t > 1.7) { glow(g, 'glow_y', x, y, S * .35, fa * .8); shock(g, 'shock_y', x, y, S * .5, kk(t, 1.72 + i * .05, 2.5), fa, .5); } });
        if (ok(IM.bagua)) { const bq = kk(t, 2.4, 3.4), z = M.S * 1.2 * (1 - .75 * smooth(bq)), a = smooth(kk(t, 2.3, 2.6)) * (1 - smooth(kk(t, 3.3, 3.6))); img(g, tint(IM.bagua, 'zb', '120,220,255', .4), M.cx, M.cy, z, z * .62, a * .9, t * 2, true); if (t > 3.35 && t < 3.9) flash(g, M.cx, M.cy, S * 2, '255,240,200', (1 - kk(t, 3.35, 3.9)) * 1.2); }
      } },
    /* 🌊 손권 : 대소용돌이 + 용오름 3개 + 대해일 */
    sunquan: { dur: 4.2, hits: [[1.3, .25, .5], [2.35, .5, .5], [2.9, .75, .45]], stamp: 2.4, sub: '적 벽 노 도',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.5, 4.2)), cx = M.cx, cy = M.cy;
        wash(g, M, '0,40,60', .42 * smooth(kk(t, 0, .4)) * out); vig(g, M, '60,200,230', .5 * out);
        if (ok(IM.whirl)) { const z = S * (.4 + .9 * outCubic(kk(t, 0, 1.2))) * (t > 2.3 ? 1 - .6 * smooth(kk(t, 2.3, 2.6)) : 1), a = smooth(kk(t, 0, .5)) * (1 - smooth(kk(t, 2.4, 3.0))); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.scale(1, .62); g.rotate(-t * 3); g.globalAlpha = a * .85; g.drawImage(tint(IM.whirl, 'wh', '90,210,240', .75), -z / 2, -z / 2, z, z); g.rotate(t * 1.4); g.globalAlpha = a * .5; g.drawImage(tint(IM.whirl, 'wh2', '210,250,255', .6), -z * .3, -z * .3, z * .6, z * .6); g.restore(); }
        const sp0 = IM.spout; if (ok(sp0)) for (let i = 0; i < 3; i++) { const a0 = i * TAU / 3 + t * 1.6 * (1 - smooth(kk(t, 1.8, 2.3))), rr = S * .32 * (1 - smooth(kk(t, 1.9, 2.3))), x = cx + Math.cos(a0) * rr, y = cy + Math.sin(a0) * rr * .5, hq = outBack(kk(t, .5 + i * .15, 1.2 + i * .15)), hh = S * 1.1 * hq * (1 - smooth(kk(t, 2.2, 2.5))), ww = S * .42; if (hh > 2) { g.save(); g.translate(x, y); g.rotate(Math.sin(t * 3 + i) * .08); g.globalAlpha = .95 * out; g.drawImage(sp0, -ww / 2, -hh, ww, hh); g.restore(); if (Math.random() < .5) sp(st.P, { kind: 'foam', cell: (Math.random() * 4) | 0, x: x + rnd(-ww * .4, ww * .4), y: y - hh * rnd(.2, 1), vx: rnd(-120, 120), vy: -rnd(20, 120), ay: S * 1.2, size: S * rnd(.04, .09), life: rnd(.6, 1.2), rgb: '220,248,255', add: false }); } }
        if (t > 2.35) { const q = t - 2.35; flash(g, cx, cy, S * 2.6, '200,245,255', (1 - smooth(kk(q, 0, .5))) * 1.2); shock(g, 'shock_b', cx, cy, S * 2.0, kk(q, 0, 1.1), .9, .55); shock(g, 'shock_g', cx, cy, S * 1.4, kk(q, .1, 1.1), .7, .55); if (ok(IM.vapor)) img(g, IM.vapor, cx, cy, S * (.4 + 2.4 * outQuint(kk(q, 0, 1))), S * (.4 + 2.4 * outQuint(kk(q, 0, 1))) * .36, (1 - smooth(kk(q, .3, 1.2))) * .8, 0, true);
          if (!st.d1) { st.d1 = 1; burst(st.P, cx, cy, 60, { v0: S * .3, v1: S * 1.5, s0: S * .04, s1: S * .12, up: -S * 1.0, sq: 1, l0: .9, l1: 1.9, p: { kind: 'foam', rgb: '225,250,255', ay: S * 2.2, add: false }, pf: j => ({ cell: j % 4 }) }); burst(st.P, cx, cy, 40, { v0: S * .3, v1: S * 1.2, s0: S * .012, s1: S * .03, up: -S * .7, p: { kind: 'spark', rgb: '200,245,255', ay: S * 1.6 }, pf: j => ({ cell: [0, 1, 3][j % 3] }) }); }
          if (ok(IM.rainbow) && q > .6) img(g, IM.rainbow, cx, cy - S * .1, S * 1.4, S * .7, .35 * smooth(kk(q, .6, 1.2)) * out, 0, false); }
      } },
    /* ⚡ 조조 : 위압의 거대한 그림자 + 만 발의 화살비 + 황금 낙뢰 왕관 */
    caocao: { dur: 4.2, hits: [[1.3, .5, .4], [2.6, .5, .55], [2.9, .3, .5]], stamp: 2.65, sub: '만 전 천 뇌',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.5, 4.2)), cx = M.cx, cy = M.cy;
        wash(g, M, '20,0,6', .5 * smooth(kk(t, 0, .4)) * out); vig(g, M, '200,20,30', .55 * out);
        const por = IM.por.caocao; if (ok(por)) { g.save(); g.globalAlpha = .22 * smooth(kk(t, 0, .6)) * (1 - smooth(kk(t, 2.4, 3.2))); g.globalCompositeOperation = 'lighter'; const z = M.H * .9, iw = por.naturalWidth * z / por.naturalHeight; g.drawImage(tint(por, 'cp', '255,60,40', .55), M.W / 2 - iw / 2, M.H * .02, iw, z); g.restore(); }
        const vo = IM.volley; if (ok(vo)) { const a = smooth(kk(t, .4, .7)) * (1 - smooth(kk(t, 2.1, 2.5))); if (a > .01) { g.save(); g.beginPath(); g.rect(M.br.left, M.br.top, M.br.width, M.br.height); g.clip(); for (let l = 0; l < (LOW() ? 1 : 2); l++) { const T = S * (.7 + l * .3), off = (t * S * (1.6 + l * .6)) % T; g.globalAlpha = a * (l ? .65 : 1); for (let yy = M.br.top - T; yy < M.br.top + M.br.height + T; yy += T) for (let xx = M.br.left - T; xx < M.br.left + M.br.width + T; xx += T) g.drawImage(vo, xx - off * .53, yy + off, T, T); } g.restore();
            if (Math.random() < .9) for (let i = 0; i < 2; i++) { const x = C.x0 + Math.random() * C.w, y = C.y0 + Math.random() * C.h; sp(st.P, { kind: 'spark', cell: pick([3, 4]), x, y, vx: rnd(-60, 60), vy: -rnd(30, 120), size: S * rnd(.012, .022), life: .4, rgb: '255,220,160' }); } } }
        for (let i = 0; i < 5; i++) { const tb = 2.1 + i * .1, bq = kk(t, tb, tb + .45); if (bq > 0 && bq < 1) { const x = C.x0 + C.w * (.1 + i * .2); bolt(g, 'bolt_y', x, M.br.top - S * .1, x + rnd(-8, 8), C.y0 + C.h * (.3 + .4 * hash(i, 3)), S * .35, (1 - bq) * (.6 + .4 * Math.abs(Math.sin(t * 50 + i))), ((t / .05) | 0) + i); } }
        if (t > 2.6) { const q = t - 2.6; bolt(g, 'bolt_y', cx, M.br.top - S * .2, cx, cy, S * .7, (1 - smooth(kk(q, 0, .5))), ((t / .04) | 0)); flash(g, cx, cy, S * 2.6, '255,230,160', (1 - smooth(kk(q, 0, .5))) * 1.2); shock(g, 'shock_y', cx, cy, S * 2.0, kk(q, 0, 1.1), .9, .55); shock(g, 'shock_o', cx, cy, S * 1.3, kk(q, .1, 1.1), .8, .55);
          g.save(); g.globalAlpha = (1 - smooth(kk(q, .9, 1.5))) * smooth(kk(q, 0, .12)); g.textAlign = 'center'; g.textBaseline = 'middle'; const fs = S * .5 * (1 + .25 * (1 - outBack(kk(q, 0, .25)))); g.font = `900 ${fs}px "Noto Serif KR",serif`; g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,200,90,.85)'; g.translate(cx, cy); g.scale(1, .62); g.fillText('위', 0, 0); g.restore();
          if (!st.d1) { st.d1 = 1; burst(st.P, cx, cy, 60, { v0: S * .3, v1: S * 1.4, s0: S * .012, s1: S * .03, up: -S * .4, p: { kind: 'spark', rgb: '255,210,110', ay: S * 1.2 }, pf: j => ({ cell: [0, 1, 3, 4][j % 4] }) }); } }
      } },
    /* 🌸 유비 : 관우 언월도 횡참 → 장비 장팔사모 관통 → 유비 쌍검 X참 → 도원결의 세 기둥 */
    liubei: { dur: 4.3, hits: [[1.05, .5, .45], [1.75, .5, .55], [2.5, .5, .5]], stamp: 2.55, sub: '삼 형 제 합 격',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.6, 4.3)), cx = M.cx, cy = M.cy;
        wash(g, M, '20,10,20', .38 * smooth(kk(t, 0, .4)) * out); vig(g, M, '255,170,200', .45 * out);
        if (Math.random() < .7 * out) sp(st.P, { kind: 'petal', cell: (Math.random() * 5) | 0, x: M.br.left - 10, y: M.br.top + Math.random() * M.br.height, vx: S * rnd(.4, .8), vy: rnd(-30, 30), vr: rnd(-4, 4), rot: rnd(0, TAU), size: S * rnd(.04, .07), life: 2.4, add: false });
        /* ① 관우: 언월도 대횡참(왼→오 원호) */
        const gq = kk(t, .55, 1.15); if (gq > 0 && t < 1.7 && ok(IM.glaive)) { const ang = -2.4 + 2.6 * outCubic(gq), Lg = S * 1.1, piv = [C.x0 - S * .05, cy + S * .1]; for (let k2 = 0; k2 < 5; k2++) { const a2 = ang - k2 * .12; ribbon(g, piv[0] + Math.cos(a2) * Lg * .5, piv[1] + Math.sin(a2) * Lg * .5, piv[0] + Math.cos(a2) * Lg, piv[1] + Math.sin(a2) * Lg, S * .08, '90,255,170', (1 - k2 * .18) * .8 * (1 - smooth(kk(t, 1.15, 1.6)))); } g.save(); g.translate(piv[0], piv[1]); g.rotate(ang + Math.PI / 2); g.globalAlpha = 1 - smooth(kk(t, 1.2, 1.6)); g.drawImage(IM.glaive, -Lg * .1, -Lg, Lg * .21, Lg); g.restore(); }
        if (t > 1.05 && !st.t1) { st.t1 = 1; st.tear(M, { x: cx, y: cy - S * .04, ang: 0, len: C.w * 1.0, gap: S * .035, mode: 'full', seed: 91, rgb: '90,255,170' }, 1.05); burst(st.P, cx, cy, 30, { v0: S * .2, v1: S * .9, s0: S * .012, s1: S * .03, up: -S * .3, p: { kind: 'spark', rgb: '120,255,180', ay: S }, pf: j => ({ cell: [3, 4, 0][j % 3] }) }); }
        /* ② 장비: 장팔사모 관통(아래→위) */
        const sq = kk(t, 1.3, 1.75); if (sq > 0 && t < 2.3 && ok(IM.spear)) { const y = M.br.top + M.br.height * (1.1 - 1.2 * inCubic(sq)), Ls = S * 1.2; ribbon(g, cx, M.br.top + M.br.height, cx, y, S * .07, '255,220,110', .8 * (1 - smooth(kk(t, 1.8, 2.2)))); g.save(); g.translate(cx, y); g.globalAlpha = 1 - smooth(kk(t, 1.8, 2.2)); g.drawImage(IM.spear, -Ls * .0625, -Ls * .1, Ls * .125, Ls); g.restore(); }
        if (t > 1.75) { const q = t - 1.75; shock(g, 'shock_y', cx, cy, S * 1.4, kk(q, 0, .9), .9, .55); flash(g, cx, cy, S * 1.6, '255,230,150', (1 - smooth(kk(q, 0, .4))) * .9); }
        /* ③ 유비: 쌍검 X참 */
        const xq = kk(t, 2.15, 2.5); if (xq > 0 && ok(IM.sword)) { [-1, 1].forEach((s, j) => { const a2 = s * .75, Ls = S * .9 * outCubic(xq), fa = 1 - smooth(kk(t, 2.6, 3.0)); ribbon(g, cx - Math.cos(a2) * Ls * .6, cy - Math.sin(a2) * Ls * .6, cx + Math.cos(a2) * Ls * .6, cy + Math.sin(a2) * Ls * .6, S * .05, j ? '255,215,90' : '60,240,170', fa); g.save(); g.translate(cx + Math.cos(a2) * Ls * .45, cy + Math.sin(a2) * Ls * .45); g.rotate(a2 + Math.PI / 2); g.globalAlpha = fa; g.globalCompositeOperation = 'lighter'; g.drawImage(IM.sword, j * 96, 0, 96, 512, -S * .04, -S * .22, S * .08, S * .44); g.restore(); }); }
        if (t > 2.5 && !st.t2) { st.t2 = 1; st.tear(M, { x: cx, y: cy, ang: .75, len: S * .9, gap: S * .032, mode: 'full', seed: 92, rgb: '255,215,90' }, 2.5); st.tear(M, { x: cx, y: cy, ang: -.75, len: S * .9, gap: S * .032, mode: 'full', seed: 93, rgb: '60,240,170' }, 2.55); burst(st.P, cx, cy, 50, { v0: S * .2, v1: S * 1.0, s0: S * .04, s1: S * .07, up: -S * .3, l0: 1.2, l1: 2.4, p: { kind: 'petal', ay: S * .3, add: false }, pf: () => ({ cell: (Math.random() * 5) | 0 }) }); }
        /* ④ 도원결의 세 기둥 */
        if (t > 2.6) { const q = t - 2.6, fa = (1 - smooth(kk(q, .8, 1.5))); [['60,240,170', -1], ['255,215,90', 0], ['255,120,120', 1]].forEach(([rgb, s]) => { const x = cx + s * S * .22; ribbon(g, x, M.br.top, x, cy, S * .14 * smooth(kk(q, 0, .2)), rgb, .8 * fa); ribbon(g, x, M.br.top, x, cy, S * .04, '255,255,255', .7 * fa); }); flash(g, cx, cy, S * 2.2, '255,200,220', (1 - smooth(kk(q, 0, .6))) * 1.1); }
      } },
    /* 🔱 여포 : 불타는 적토마 돌격 → 방천화극 회전 회오리 → 귀신 강림 대폭발 */
    lvbu: { dur: 4.2, hits: [[1.1, .3, .5], [2.0, .5, .5], [2.65, .5, .5]], stamp: 2.7, sub: '적 토 무 쌍',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.5, 4.2)), cx = M.cx, cy = M.cy;
        wash(g, M, '30,0,8', .5 * smooth(kk(t, 0, .4)) * out); vig(g, M, '220,20,40', .55 * out);
        if (t < 2.6 && Math.random() < .2) bolt(g, 'bolt_p', rnd(M.br.left, M.br.left + M.br.width), M.br.top - S * .1, rnd(M.br.left, M.br.left + M.br.width), M.br.top + M.br.height * rnd(.2, .5), S * .3, .5, (Math.random() * 6) | 0);
        /* ① 적토마 돌격 */
        const hq = kk(t, .3, 1.5); if (hq > 0 && hq < 1 && ok(IM.horse)) { const x = M.br.left - S * .4 + (M.br.width + S * .8) * hq, y = cy + Math.sin(hq * 8) * S * .03, f = ((t * 14) | 0) & 3, hw = S * .75, hh = hw * .75; for (let gh = (LOW() ? 1 : 3); gh >= 1; gh--) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .25 / gh; g.drawImage(IM.horse, f * 256, 0, 256, 192, x - hw / 2 - gh * S * .12, y - hh / 2, hw, hh); g.restore(); } ribbon(g, x - S * .9, y, x - S * .1, y, S * .2, '255,60,40', .7); g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(IM.horse, f * 256, 0, 256, 192, x - hw / 2, y - hh / 2, hw, hh); g.restore(); glow(g, 'glow_o', x, y, S * .8, .6);
          for (let i = 0; i < 2; i++) sp(st.P, { kind: 'spark', cell: pick([0, 6, 7]), x: x - hw * .3 + rnd(-10, 10), y: y + rnd(-hh * .3, hh * .4), vx: -S * rnd(.2, .5), vy: -rnd(40, 160), size: S * rnd(.015, .035), life: rnd(.6, 1.2), rgb: pick(['255,90,40', '255,180,80']) }); if (Math.random() < .5) st.trail.push({ x: x - hw * .2, y: y + hh * .35, t }); }
        st.trail.forEach((p, i) => { const q = t - p.t, a = (1 - smooth(kk(q, .6, 1.8))) * out, im = IM.flame_o; if (a > .01 && ok(im)) { const f = ((t * 13 + i) | 0) % 8, fw = S * .1; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(im, (f % 4) * 128, ((f / 4) | 0) * 192, 128, 192, p.x - fw / 2, p.y - fw * 1.5, fw, fw * 1.5); g.restore(); } });
        /* ② 방천화극 회전 회오리 */
        const vq = kk(t, 1.4, 2.6); if (vq > 0 && t < 2.75) { const a = smooth(kk(t, 1.4, 1.7)) * (1 - smooth(kk(t, 2.55, 2.75))), z = S * (.6 + .5 * smooth(vq)); if (ok(IM.whirl)) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.scale(1, .6); g.rotate(t * 9); g.globalAlpha = a * .9; g.drawImage(tint(IM.whirl, 'lw', '255,50,70', .75), -z / 2, -z / 2, z, z); g.restore(); }
          if (ok(IM.halberd)) { const HL = S * .85; for (let k2 = 0; k2 < (LOW() ? 1 : 3); k2++) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.rotate(t * 14 - k2 * .35); g.globalAlpha = a * (k2 ? .3 : 1); g.drawImage(IM.halberd, -HL / 6, -HL / 2, HL / 3, HL); g.restore(); } }
          if (Math.random() < .8) { const an = rnd(0, TAU), rr = S * rnd(.3, .6); sp(st.P, { kind: 'rock', cell: (Math.random() * 4) | 0, x: cx + Math.cos(an) * rr, y: cy + Math.sin(an) * rr * .6, vx: -Math.cos(an) * rr * 1.5 - Math.sin(an) * rr * 2, vy: -Math.sin(an) * rr * .9 + Math.cos(an) * rr * 1.2, size: S * rnd(.02, .04), life: .6, rot: rnd(0, TAU), vr: 10, add: false }); } }
        /* ③ 귀신 강림 대폭발 */
        if (t > 2.65) { const q = t - 2.65; flash(g, cx, cy, S * 2.8, '255,80,110', (1 - smooth(kk(q, 0, .5))) * 1.3); if (ok(IM.burst)) img(g, tint(IM.burst, 'lb', '255,60,90', .75), cx, cy, S * (.5 + 1.6 * outQuint(kk(q, 0, .7))), S * (.5 + 1.6 * outQuint(kk(q, 0, .7))), (1 - smooth(q / .9)) * .9, q, true); shock(g, 'shock_p', cx, cy, S * 2.1, kk(q, 0, 1.1), .9, .6); shock(g, 'shock_o', cx, cy, S * 1.4, kk(q, .1, 1.1), .8, .6);
          if (ok(IM.fissure)) img(g, tint(IM.fissure, 'lf', '210,30,90', .6), cx, cy, S * 1.4 * outQuint(kk(q, 0, .5)), S * 1.4 * outQuint(kk(q, 0, .5)), (.7 - .5 * kk(q, .8, 1.5)) * out, 0, true);
          if (!st.d1) { st.d1 = 1; for (let i = 0; i < 4; i++) st.tear(M, { x: cx, y: cy, ang: i * TAU / 4 + .4, len: S * .55, gap: S * .04, mode: 'half', seed: 70 + i, rgb: '255,60,90' }, 2.65); burst(st.P, cx, cy, 22, { v0: S * .4, v1: S * 1.3, s0: S * .03, s1: S * .07, up: -S * .7, l0: 1.2, l1: 2.2, p: { kind: 'rock', ay: S * 2.4, add: false } }); burst(st.P, cx, cy, 50, { v0: S * .3, v1: S * 1.4, s0: S * .012, s1: S * .03, up: -S * .3, p: { kind: 'spark', rgb: '255,90,120', ay: S }, pf: j => ({ cell: [0, 3, 4][j % 3] }) }); } }
      } },
    /* 🐺 사마의 : 보름달 늑대 포효 → 진영 전체 얼음 기둥 감옥 → 산산이 깨지는 빙옥 */
    simayi: { dur: 4.3, hits: [[1.9, .5, .45], [2.75, .5, .55], [3.0, .25, .5]], stamp: 2.8, sub: '빙 옥 봉 인',
      frame(g, t, dt, M, st) {
        const C = M.camp, S = M.S, out = 1 - smooth(kk(t, 3.6, 4.3)), cx = M.cx, cy = M.cy;
        wash(g, M, '6,12,50', .5 * smooth(kk(t, 0, .4)) * out); vig(g, M, '120,190,255', .55 * out);
        const mo = IM.moon; if (ok(mo)) { const z = S * 1.0, my = M.br.top + S * (.5 - .25 * outCubic(kk(t, 0, 1))); img(g, mo, M.W / 2, my, z, z, .9 * (1 - smooth(kk(t, 1.8, 2.4))), 0, false); }
        const wa = smooth(kk(t, .3, .7)) * (1 - smooth(kk(t, 1.6, 2.1))); if (wa > .01 && ok(IM.wolf)) { const z = S * .8 * (1 + .06 * Math.sin(t * 20) * kk(t, .8, 1.3)), wy = M.br.top + S * .45; img(g, IM.wolf, M.W / 2, wy, z, z, wa, 0, false); const ey = wy - z * .5 + z * .39; [-1, 1].forEach(s => glow(g, 'glow_b', M.W / 2 + s * z * .195, ey, S * .2, wa)); if (t > .8 && t < 1.6) { shock(g, 'shock_b', M.W / 2, wy, S * 1.8, kk(t, .8, 1.6), .7, .9); } }
        const pil = IM.icepillar; if (ok(pil)) { const n = LOW() ? 8 : 12; for (let i = 0; i < n; i++) { const u = (i % 4 + .5) / 4, v = (((i / 4) | 0) + .5) / (n / 4), x = C.x0 + C.w * u + (hash(i, 1) - .5) * S * .06, y = C.y0 + C.h * v, ts = 1.35 + hash(i, 2) * .5, gq = outBack(kk(t, ts, ts + .3)), shatter = t > 2.75; if (gq <= 0 || shatter) continue; const ph = S * (.32 + .14 * hash(i, 3)) * gq, pw = ph * .33; g.save(); g.translate(x, y); g.globalAlpha = .95 * out; g.drawImage(pil, -pw / 2, -ph, pw, ph); g.restore(); glow(g, 'glow_b', x, y - ph * .4, ph * .9, .3 * gq); if (gq < 1 && Math.random() < .4) sp(st.P, { kind: 'ice', cell: (Math.random() * 4) | 0, x, y, vx: rnd(-80, 80), vy: -rnd(40, 160), ay: S, size: S * rnd(.03, .06), life: .8, rgb: '170,225,255', ta: .55 }); } }
        if (ok(IM.frost) && t > 1.3) { const fz = smooth(kk(t, 1.3, 2.0)) * (1 - smooth(kk(t, 3.0, 3.8))); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35 * fz; g.drawImage(IM.frost, C.x0, C.y0, C.w, C.h); g.restore(); }
        if (t > 2.75) { const q = t - 2.75; flash(g, cx, cy, S * 2.8, '220,240,255', (1 - smooth(kk(q, 0, .5))) * 1.3); shock(g, 'shock_b', cx, cy, S * 2.2, kk(q, 0, 1.1), .9, .58); if (!st.d1) { st.d1 = 1; for (let i = 0; i < 12; i++) { const u = (i % 4 + .5) / 4, v = (((i / 4) | 0) + .5) / 3; burst(st.P, C.x0 + C.w * u, C.y0 + C.h * v, 7, { v0: S * .2, v1: S * .9, s0: S * .04, s1: S * .09, up: -S * .5, l0: .9, l1: 1.8, p: { kind: 'ice', rgb: '180,230,255', ta: .55, ay: S * 1.6 }, pf: j => ({ cell: j % 4 }) }); } burst(st.P, cx, cy, 40, { v0: S * .2, v1: S * 1.2, s0: S * .012, s1: S * .03, up: -S * .3, p: { kind: 'spark', rgb: '200,235,255', ay: S * .5 }, pf: j => ({ cell: [0, 3, 4][j % 3] }) }); } }
      } }
  };

  /* ---------- 실행 ---------- */
  function runUlt(A, w, seed) {
    const sc0 = ULT[w.id]; if (!sc0) return false;
    const V = A === 'c' ? 'h' : 'c', T1 = 1.9, st = { P: [], trail: [], pc: hexRGB(w.primary), sc: hexRGB(w.secondary), title: String(w.sealText || ''), sub: String(w.actionName || '').replace(/^[^\w가-힣一-龥]+/, '').trim() };
    let sd = (seed >>> 0) || 1; const rn = () => (sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296;
    if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(true); if (window.jgPerf) window.jgPerf.cinemaOn();
    const ov = document.createElement('canvas'); ov.id = 'jg_ult11_cv'; ov.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9994;pointer-events:none;'; document.body.appendChild(ov);
    const g = ov.getContext('2d'), smA = document.createElement('canvas'), sa = smA.getContext('2d'), cvB = document.getElementById('cv'), tears = [], snap = window.jgTear ? window.jgTear.snap() : null;
    st.tear = (M, spec, t0) => { if (!window.jgTear || (Q() < .5 && tears.length >= 2)) return; try { tears.push({ cut: window.jgTear.make(spec, M, Q() < .5 ? null : snap), t0, rgb: spec.rgb }); } catch (e) {} };
    const t0 = performance.now(); let done = false, last = t0, fno = 0, hitI = 0, punch = 0, ptime = 0, stampSfx = false;
    noise(.9, 'bandpass', 400, 4000, .18); tone('sawtooth', 90, 300, .5, .08); tone('sine', 140, 52, 1.2, .26, .62);
    const cleanup = () => { if (done) return; done = true; try { ov.remove(); } catch (e) {} if (cvB) { cvB.style.transform = ''; cvB.style.transformOrigin = ''; } if (window.jgPerf) window.jgPerf.cinemaOff(); if (typeof window.jgPunishBusy === 'function') window.jgPunishBusy(false); };
    function frame(now) {
      if (done) return; const T = U.debugT != null ? U.debugT : (now - t0) / 1000, dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
      const M = metrics(V), dpr = window.jgPerf ? window.jgPerf.dpr(1.25) : Math.min(window.devicePixelRatio || 1, 1.25), pw = Math.round(M.W * dpr), ph = Math.round(M.H * dpr);
      if (ov.width !== pw || ov.height !== ph) { ov.width = pw; ov.height = ph; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, M.W, M.H);
      const ta = T - T1;
      if (ta >= -.05) { const sh = punch > .01 ? punch * M.S * .012 : 0; g.save(); if (sh) g.translate(Math.sin(ptime * 60) * sh, Math.cos(ptime * 53) * sh);
        for (const e of tears) { const q = smooth(kk(ta, e.t0, e.t0 + .3)), a = 1 - smooth(kk(ta, sc0.dur - .8, sc0.dur - .2)); if (q > 0 && a > .01) window.jgTear.draw(g, e.cut, q, a, e.rgb, ta); }
        try { sc0.frame(g, Math.max(0, ta), dt, M, st); } catch (e) { console.warn('ult11', e); }
        stepPT(st.P, g, dt); g.restore();
        /* 피해 처리 */
        while (hitI < sc0.hits.length && ta >= sc0.hits[hitI][0]) { const h = sc0.hits[hitI++]; try { if (typeof window.hitCamp === 'function' && !U.noHit && (!LOW() || hitI === 2)) window.hitCamp(V, 'warlord_' + w.id, { fx: h[1], fy: h[2], rot: (rn() - .5) * .3 }); } catch (e) {} if (hitI === 2) { try { if (typeof window.hitScreen === 'function' && Q() >= .6) window.hitScreen(V, 'warlord', h[1], h[2], 0, true); } catch (e) {} } punch = hitI === 2 ? 1.2 : .7; ptime = 0; try { navigator.vibrate && navigator.vibrate(hitI === 2 ? [80, 40, 160] : 40); } catch (e) {} if (hitI === 2) { tone('sine', 80, 30, 1.4, .3); noise(1.2, 'lowpass', 1500, 80, .24); } }
        /* 필살 도장 */
        const sq = ta - sc0.stamp; if (sq > -.01) { if (!stampSfx) { stampSfx = true; tone('sine', 90, 36, .9, .26); } const a = (sq < 1.4 ? 1 : 1 - smooth(kk(sq, 1.4, 1.9))), pop = outBack(kk(sq, 0, .24)), z = M.S * .52 * (1 + (1 - pop) * 1.8);
          g.save(); g.translate(M.W * .5, M.H * .25); g.rotate(-.14); g.globalAlpha = clamp(a, 0, 1) * smooth(kk(sq, 0, .08)); if (ok(IM.seal)) g.drawImage(tint(IM.seal, 'se', st.sc, .55), -z / 2, -z / 2, z, z); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${z * .42}px "Noto Serif KR","Songti SC",serif`; g.lineJoin = 'round'; g.lineWidth = z * .035; g.strokeStyle = 'rgba(30,0,0,.9)'; g.fillStyle = '#e8261c'; g.strokeText('필살', 0, -z * .02); g.fillText('필살', 0, -z * .02); g.font = `800 ${z * .12}px "Noto Serif KR",serif`; g.fillStyle = `rgb(${st.sc})`; g.fillText(sc0.sub, 0, z * .27); g.restore(); }
      }
      if (T < T1 + .5) drawCutin(g, M, w, T, T1, st);
      /* 시네마 바 */
      const total = T1 + sc0.dur, barH = M.H * .1 * smooth(kk(T, 0, .3)) * (1 - smooth(kk(T, total - .5, total))); g.fillStyle = '#000'; g.fillRect(0, 0, M.W, barH); g.fillRect(0, M.H - barH, M.W, barH); if (barH > 2) { g.fillStyle = `rgba(${st.sc},.9)`; g.fillRect(0, barH - 2, M.W, 2); g.fillRect(0, M.H - barH, M.W, 2); }
      /* 블룸(가능한 기기만, 격프레임 갱신) */
      if (!window.jgPerf || window.jgPerf.bloomOK()) { const a1 = Math.max(2, Math.round(pw / 6)), b1 = Math.max(2, Math.round(ph / 6)); if (smA.width !== a1 || smA.height !== b1) { smA.width = a1; smA.height = b1; } if ((fno++ & 1) === 0) { sa.clearRect(0, 0, a1, b1); sa.drawImage(ov, 0, 0, a1, b1); } g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = U.bloom; g.drawImage(smA, 0, 0, pw, ph); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      /* 카메라 펀치 */
      if (cvB && punch > .01 && !U.noPunch) { ptime += dt; punch *= Math.pow(.02, dt / .7); const z2 = 1 + .02 * punch, sx = M.S * .008 * punch * Math.sin(ptime * 40), sy = M.S * .008 * punch * Math.cos(ptime * 35); cvB.style.transformOrigin = '50% 50%'; cvB.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) scale(${z2.toFixed(4)})`; if (punch <= .012) { cvB.style.transform = ''; cvB.style.transformOrigin = ''; } }
      if (T < total || U.debugT != null) requestAnimationFrame(frame); else cleanup();
    }
    requestAnimationFrame(frame); setTimeout(cleanup, (T1 + sc0.dur + 4) * 1000);
    return true;
  }

  /* ---------- 군주 스킬(action) 연결: 이전 컷인 방식보다 바깥에서 가로챔 ---------- */
  function install() {
    const orig = window.triggerWarlordSkillImpact; if (typeof orig !== 'function' || orig.__u11) return;
    const fn = function (side, id, kind, fx, fy, rot, varIdx) {
      if (kind === 'action' && U.enabled && ULT[id]) { const wl = (window.JG_WARLORDS || []).find(x => x.id === id); if (wl) { try { if (runUlt(side === 'h' || side === 'c' ? side : (typeof me !== 'undefined' ? me : 'c'), wl, Math.floor((Number(fx) || Math.random()) * 1e6) ^ 777)) return { idx: 0, variation: { name: '필살기' } }; } catch (e) { console.warn('ult11', e); } } }
      return orig.apply(this, arguments);
    };
    fn.__u11 = true; fn.__ult = true; fn.__orig = orig; window.triggerWarlordSkillImpact = fn;
  }
  install(); setInterval(install, 1200);
  U.test = (id, side) => { const wl = (window.JG_WARLORDS || []).find(x => x.id === id); if (wl) runUlt(side || 'c', wl, 4242); };
})();
