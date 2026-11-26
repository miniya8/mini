/* ============================================================================
 * [선공 일기토 v12 — 군주 대 군주 격투 연출]  js/duel-v12.js
 *  window.playAnimeFirstTurnDuel(winnerSide, onComplete) 를 대체합니다. (승자/콜백 규격 동일 → 게임 규칙·멀티 동기화 영향 없음)
 *  · 내 군주(왼쪽) vs 상대 군주(오른쪽): 초상 방패 카드 + 군주 고유 무기 · 오라 · 색
 *      제갈량=깃털부채·별빛 / 손권=고정도·물보라 / 조조=의천검·붉은 번개 / 유비=쌍고검·꽃잎 / 여포=방천화극·불꽃 / 사마의=빙결 손톱·서리
 *  · 매번 다른 합(合) 대본: 돌진·격돌(막상막하)·회피·반격·치명타 · 체력바 · 피해 숫자 · 히트스톱 · 슬로모션
 *  · 약 절반 확률로 '역전': 몰리던 쪽이 각성(역전의 기세!) 후 고유 결정타로 승리
 *  · 군주별 결정타: 북두칠성 / 용오름 물기둥 / 화살비+낙뢰 / 삼형제 합격 / 적토마 돌격 / 빙옥 감옥
 *  · 2배속 · 건너뛰기 버튼 유지, 모바일: 캔버스 1장 · 해상도/입자 자동 조절 · 그림자블러 미사용
 * ============================================================================ */
(function jgDuel12() {
  if (window.__JG_DUEL12__) return; window.__JG_DUEL12__ = true;
  const D12 = window.jgDuel12 = { enabled: true };
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[(Math.random() * a.length) | 0], clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k), smooth = k => { k = clamp(k, 0, 1); return k * k * k * (k * (k * 6 - 15) + 10); };
  const outCubic = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3), outBack = k => { k = clamp(k, 0, 1); const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }, inQuad = k => clamp(k, 0, 1) ** 2;
  const kk = (t, a, b) => clamp((t - a) / (b - a), 0, 1), Q = () => window.jgPerf ? window.jgPerf.q : 1, LOW = () => Q() < .6;
  const hexRGB = h => { h = String(h || '#ffffff').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };

  /* ---------- 이미지 ---------- */
  const IM = {}, L = (k, p) => { const i = new Image(); i.src = 'assets/images/' + p; IM[k] = i; };
  ['sword', 'halberd', 'ice', 'petal', 'slash', 'starflare', 'bagua', 'ribbon', 'softflash', 'foam', 'rock', 'wolf'].forEach(n => L(n, 'fx/wl_' + n + '.webp'));
  ['sparks', 'glow_o', 'glow_b', 'glow_g', 'glow_y', 'glow_p', 'shock_o', 'shock_b', 'shock_g', 'shock_y', 'shock_p', 'bolt_y', 'bolt_b', 'bolt_p', 'flame_o', 'vignette'].forEach(n => L(n, 'fx/v2_' + n + '.webp'));
  ['speed', 'burst', 'volley', 'spout', 'horse', 'icepillar', 'glaive', 'spear', 'brush'].forEach(n => L(n, 'fx/ult_' + n + '.webp'));
  L('billow', 'fx/fx_billow.webp'); L('cloud', 'fx/env_cloud.webp');
  IM.por = {}; ['zhuge', 'sunquan', 'caocao', 'liubei', 'lvbu', 'simayi'].forEach(id => { const i = new Image(); i.src = 'assets/images/warlords/' + id + '.jpg'; IM.por[id] = i; });
  const ok = im => !!im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0));
  const tc = {}; function tint(img, key, rgb, a) { const id = key + '|' + rgb + '|' + a; if (tc[id]) return tc[id]; if (!ok(img)) return img; const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }

  /* ---------- 소리 ---------- */
  let AC = null; const ac = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  const sfxOn = () => !(window.jgEnv3 && window.jgEnv3.sfx === false);
  function tone(type, f0, f1, dur, vol) { if (!sfxOn()) return; const a = ac(); if (!a) return; try { const t0 = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .02); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .05); } catch (e) {} }
  function noise(dur, ft, f0, f1, vol) { if (!sfxOn()) return; const a = ac(); if (!a) return; try { const t0 = a.currentTime, n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5); const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = ft; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t0); } catch (e) {} }
  const SFX = { clash() { noise(.25, 'highpass', 5000, 1500, .16); tone('square', 1600, 400, .12, .04); }, hit() { tone('sine', 120, 50, .35, .22); noise(.2, 'lowpass', 1800, 200, .14); }, crit() { tone('sawtooth', 200, 40, .6, .14); noise(.5, 'lowpass', 2400, 120, .22); }, whoosh() { noise(.3, 'bandpass', 600, 2600, .08); }, awaken() { tone('sine', 110, 440, 1.0, .12); noise(1, 'bandpass', 300, 3000, .1); }, ko() { tone('sine', 90, 30, 1.4, .3); noise(1.2, 'lowpass', 1500, 80, .26); } };

  /* ---------- 군주별 외형/무기/오라 ---------- */
  const STY = {
    zhuge: { weapon: 'fan', aura: 'star', key: 'y', fin: 'stars', cry: '천기가 나를 돕는다!' },
    sunquan: { weapon: 'sword1', aura: 'water', key: 'b', fin: 'spout', cry: '강동의 파도를 받아라!' },
    caocao: { weapon: 'sword0', aura: 'thunder', key: 'o', fin: 'volley', cry: '천하는 나의 것!' },
    liubei: { weapon: 'twin', aura: 'petal', key: 'g', fin: 'brothers', cry: '도원의 맹세로!' },
    lvbu: { weapon: 'halberd', aura: 'fire', key: 'p', fin: 'horse', cry: '천하무쌍 여봉선이다!' },
    simayi: { weapon: 'claw', aura: 'frost', key: 'b', fin: 'ice', cry: '얼어붙어라…' }
  };
  const getW = id => (window.JG_WARLORDS || []).find(x => x.id === id) || null;

  /* ---------- 파티클 ---------- */
  const SHEET = { spark: ['sparks', 64, 64], petal: ['petal', 64, 64], ice: ['ice', 128, 128], rock: ['rock', 64, 64], foam: ['foam', 128, 128], billow: ['billow', 256, 256] };
  function sp(P, o) { const q = Q(); if (q < .95 && o.kind !== 'rock' && Math.random() > Math.max(.35, q)) return; if (P.length > Math.round(320 * Math.max(.45, q))) return; P.push(Object.assign({ kind: 'spark', cell: 0, x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 1, rot: 0, vr: 0, size: 8, a: 1, life: 1, age: 0, rgb: null, add: true, grow: 0 }, o)); }
  function stepPT(P, g, dt) { for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.age += dt; if (p.age >= p.life) { P.splice(i, 1); continue; } const dg = Math.pow(p.drag, dt * 60); p.vx *= dg; p.vy = p.vy * dg + p.ay * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; const sh = SHEET[p.kind], im = IM[sh[0]]; if (!ok(im)) continue; const k = p.age / p.life, a = p.a * (1 - smooth((k - .55) / .45)); if (a <= .01) continue; const s = p.size * (1 + p.grow * k), src = p._s || (p._s = (p.rgb && p.kind !== 'petal' && p.kind !== 'rock') ? tint(im, p.kind, p.rgb, .8) : im); g.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; g.globalAlpha = clamp(a, 0, 1); g.save(); g.translate(p.x, p.y); if (p.rot) g.rotate(p.rot); g.drawImage(src, p.cell * sh[1], 0, sh[1], sh[2], -s / 2, -s / 2, s, s); g.restore(); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  const img = (g, im, x, y, w, h, a, rot, add) => { if (!ok(im) || a <= .004) return; g.save(); if (add) g.globalCompositeOperation = 'lighter'; g.translate(x, y); if (rot) g.rotate(rot); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); };
  const glow = (g, key, x, y, s, a) => img(g, IM[key], x, y, s, s, a, 0, true);
  const flash = (g, x, y, s, rgb, a) => img(g, tint(IM.softflash, 'sf', rgb, .8), x, y, s, s, a * .6, 0, true);
  function shock(g, key, x, y, s, k, a, flat) { const im = IM[key]; if (!ok(im) || a <= .004 || k < 0 || k >= 1) return; const f = Math.min(7, (k * 8) | 0); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, flat || .5); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (f % 4) * 256, ((f / 4) | 0) * 256, 256, 256, -s / 2, -s / 2, s, s); g.restore(); }
  function ribbon(g, x0, y0, x1, y1, w, rgb, a) { const im = IM.ribbon; if (!ok(im) || a <= .004) return; const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy); if (Ln < 1) return; g.save(); g.globalCompositeOperation = 'lighter'; g.translate((x0 + x1) / 2, (y0 + y1) / 2); g.rotate(Math.atan2(dy, dx)); g.globalAlpha = clamp(a, 0, 1); g.drawImage(tint(im, 'rb', rgb, .75), -Ln / 2, -w / 2, Ln, w); g.restore(); }
  function bolt(g, key, x0, y0, x1, y1, w, a, fr) { const im = IM[key]; if (!ok(im) || a <= .004) return; const L2 = Math.hypot(x1 - x0, y1 - y0); g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x0, y0); g.rotate(Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2); g.globalAlpha = clamp(a, 0, 1); g.drawImage(im, (fr % 6) * 256, 0, 256, 512, -w / 2, 0, w, L2); g.restore(); }

  /* ---------- 대본 생성 (승자는 고정, 과정은 매번 다름) ---------- */
  function makeScript(winner) {
    const lo = winner === 'L' ? 'R' : 'L', comeback = Math.random() < .55, ev = [];
    let hp = { L: 100, R: 100 };
    const add = (type, att, dmg) => { const def = att === 'L' ? 'R' : 'L'; if (dmg) hp[def] = Math.max(1, hp[def] - dmg); ev.push({ type, att, def, dmg, hpAfter: { L: hp.L, R: hp.R } }); };
    if (comeback) {
      if (Math.random() < .5) add('clash', lo, 0); add(pick(['hit', 'crit']), lo, 30 + (Math.random() * 10 | 0)); if (Math.random() < .4) add('dodge', winner, 0); add('hit', lo, hp[winner] - (14 + (Math.random() * 10 | 0)));
      ev.push({ type: 'awaken', att: winner, hpAfter: { L: hp.L, R: hp.R } });
      add('crit', winner, 40 + (Math.random() * 10 | 0)); add('hit', winner, Math.max(5, hp[lo] - 22));
    } else {
      add('clash', winner, 0); add('hit', winner, 22 + (Math.random() * 10 | 0)); add(pick(['hit', 'dodge']), lo, Math.random() < .5 ? 0 : 18); add(pick(['crit', 'hit']), winner, 30 + (Math.random() * 8 | 0)); if (Math.random() < .5) add('clash', lo, 0);
    }
    ev.push({ type: 'finisher', att: winner, def: lo, hpAfter: { L: winner === 'L' ? hp.L : 0, R: winner === 'R' ? hp.R : 0 } });
    /* 시간표 */
    let t = 1.35; const dur = { clash: .8, hit: .78, crit: .95, dodge: .72, awaken: 1.1, finisher: 1.8 }; ev.forEach(e => { e.t0 = t; e.d = dur[e.type]; t += e.d; }); return { ev, end: t + 1.4, comeback };
  }

  /* ---------- 본체 ---------- */
  function playDuel(winnerSide, onComplete) {
    const winS = (winnerSide === 'h' || winnerSide === 'c') ? winnerSide : 'c', mySide = (typeof me !== 'undefined' && (me === 'h' || me === 'c')) ? me : 'c';
    const list = window.JG_WARLORDS || [], myW = getW(window.JG_MY_WARLORD) || list[0], oppW = getW(window.JG_OPP_WARLORD) || list.find(x => x.id !== (myW && myW.id)) || list[1] || myW;
    if (!myW || !oppW) return false;
    const F = { L: { w: myW, st: STY[myW.id] || STY.zhuge, pc: hexRGB(myW.primary), sc: hexRGB(myW.secondary), name: myW.name, side: 'L' }, R: { w: oppW, st: STY[oppW.id] || STY.caocao, pc: hexRGB(oppW.primary), sc: hexRGB(oppW.secondary), name: oppW.name, side: 'R' } };
    const winner = winS === mySide ? 'L' : 'R', S0 = makeScript(winner), P = [], texts = [];
    let finished = false, speed = 1, raf = 0, T = 0, last = performance.now(), hitStop = 0, slow = 1, shake = 0, hp = { L: 100, R: 100 }, disp = { L: 100, R: 100 }, fired = new Set();
    if (window.jgPerf) window.jgPerf.cinemaOn();
    const wrap = document.createElement('div'); wrap.id = 'jg_anime_duel_ov'; wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#05060c;user-select:none;overflow:hidden;touch-action:none;';
    const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block;'; wrap.appendChild(cv);
    const box = document.createElement('div'); box.style.cssText = 'position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:14px;display:flex;gap:8px;z-index:10;';
    const bS = document.createElement('button'), bK = document.createElement('button'); bS.textContent = '⏩ 2×'; bK.textContent = '⏭ 건너뛰기';
    bS.style.cssText = 'padding:8px 14px;border-radius:99px;border:1.5px solid #ffd54a;background:rgba(15,23,42,.85);color:#ffd54a;font-weight:800;font-size:13px;'; bK.style.cssText = 'padding:8px 14px;border-radius:99px;border:1.5px solid #fff;background:linear-gradient(180deg,#e53935,#b71c1c);color:#fff;font-weight:900;font-size:13px;';
    box.appendChild(bS); box.appendChild(bK); wrap.appendChild(box); document.body.appendChild(wrap);
    const g = cv.getContext('2d');
    const cleanup = () => { if (finished) return; finished = true; if (raf) cancelAnimationFrame(raf); if (window.jgPerf) window.jgPerf.cinemaOff(); wrap.style.transition = 'opacity .3s ease'; wrap.style.opacity = '0'; setTimeout(() => { try { wrap.remove(); } catch (e) {} if (typeof onComplete === 'function') onComplete(winS); }, 300); };
    bS.onclick = e => { e.stopPropagation(); speed = speed === 1 ? 2 : 1; bS.textContent = speed > 1 ? '⚡ 2× 적용중' : '⏩ 2×'; };
    bK.onclick = e => { e.stopPropagation(); cleanup(); };
    const say = (txt, side, col, big) => texts.push({ txt, side, col, big, t0: T });

    /* 카드(군주 외형) 그리기 */
    function drawFighter(f, x, y, sz, lean, flashA, awakened, alpha) {
      const por = IM.por[f.w.id], st = f.st, dir = f.side === 'L' ? 1 : -1, w = sz * .72, h = sz;
      g.save(); g.translate(x, y); g.rotate(lean * dir); g.globalAlpha = alpha;
      /* 오라 */
      const auraK = { star: 'glow_y', water: 'glow_b', thunder: 'glow_o', petal: 'glow_g', fire: 'glow_o', frost: 'glow_b' }[st.aura];
      glow(g, auraK, 0, -h * .1, sz * (awakened ? 2.2 : 1.5), (awakened ? .85 : .45) * alpha * (.8 + .2 * Math.sin(T * 7)));
      if (awakened) glow(g, 'glow_' + ({ y: 'y', b: 'b', o: 'o', g: 'g', p: 'p' }[st.key]), 0, -h * .1, sz * 1.6, .6 * alpha);
      /* 방패 모양 초상 */
      g.beginPath(); g.moveTo(-w / 2, -h / 2 + w * .2); g.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + w * .2, -h / 2); g.lineTo(w / 2 - w * .2, -h / 2); g.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + w * .2); g.lineTo(w / 2, h * .22); g.quadraticCurveTo(w / 2, h * .42, 0, h / 2); g.quadraticCurveTo(-w / 2, h * .42, -w / 2, h * .22); g.closePath();
      g.save(); g.clip(); g.fillStyle = '#0d0f1a'; g.fillRect(-w / 2, -h / 2, w, h); if (ok(por)) { const s2 = Math.max(w / por.naturalWidth, h / por.naturalHeight) * 1.08, iw = por.naturalWidth * s2, ih = por.naturalHeight * s2; if (dir < 0) g.scale(-1, 1); g.drawImage(por, -iw / 2, -h / 2 - ih * .02, iw, ih); if (dir < 0) g.scale(-1, 1); }
      const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, `rgba(${f.pc},0)`); gr.addColorStop(1, `rgba(${f.pc},.6)`); g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h);
      if (flashA > .01) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${flashA})`; g.fillRect(-w / 2, -h / 2, w, h); g.globalCompositeOperation = 'source-over'; }
      g.restore(); g.lineWidth = Math.max(3, sz * .025); g.strokeStyle = `rgb(${f.sc})`; g.stroke(); g.globalCompositeOperation = 'lighter'; g.lineWidth = sz * .06; g.strokeStyle = `rgba(${f.sc},.25)`; g.stroke(); g.globalCompositeOperation = 'source-over';
      /* 무기 */
      const wx = dir * w * .52, wy = h * .05, wr = (-.6 + lean * 2.4) * dir;
      if (st.weapon === 'halberd' && ok(IM.halberd)) { g.save(); g.translate(wx, wy); g.rotate(wr); g.globalCompositeOperation = 'lighter'; g.drawImage(IM.halberd, -sz * .14, -sz * .62, sz * .28, sz * .84); g.restore(); }
      else if (st.weapon === 'twin' && ok(IM.sword)) { [0, 1].forEach(k => { g.save(); g.translate(wx + dir * k * sz * .06, wy); g.rotate(wr + (k ? .3 : -.1) * dir); g.globalCompositeOperation = 'lighter'; g.drawImage(IM.sword, k * 96, 0, 96, 512, -sz * .05, -sz * .5, sz * .1, sz * .55); g.restore(); }); }
      else if ((st.weapon === 'sword0' || st.weapon === 'sword1') && ok(IM.sword)) { g.save(); g.translate(wx, wy); g.rotate(wr); g.globalCompositeOperation = 'lighter'; g.drawImage(IM.sword, (st.weapon === 'sword1' ? 1 : 0) * 96, 0, 96, 512, -sz * .06, -sz * .55, sz * .12, sz * .62); g.restore(); }
      else if (st.weapon === 'fan') { g.save(); g.translate(wx, wy - h * .1); g.rotate(wr); g.fillStyle = 'rgba(250,250,255,.92)'; g.beginPath(); g.moveTo(0, sz * .08); g.arc(0, sz * .08, sz * .2, -Math.PI * .85, -Math.PI * .15); g.closePath(); g.fill(); g.strokeStyle = 'rgba(160,170,200,.9)'; g.lineWidth = 1; for (let k = 0; k < 7; k++) { const a = -Math.PI * .85 + k * Math.PI * .7 / 6; g.beginPath(); g.moveTo(0, sz * .08); g.lineTo(Math.cos(a) * sz * .2, sz * .08 + Math.sin(a) * sz * .2); g.stroke(); } g.restore(); glow(g, 'glow_y', wx, wy - h * .18, sz * .3, .5 * alpha); }
      else if (st.weapon === 'claw' && ok(IM.ice)) { g.save(); g.translate(wx, wy); g.rotate(wr); g.globalCompositeOperation = 'lighter'; g.drawImage(tint(IM.ice, 'cl', '160,220,255', .5), 0, 0, 128, 128, -sz * .14, -sz * .14, sz * .28, sz * .28); g.restore(); }
      /* 이름표 */
      g.restore();
    }

    function frame(now) {
      if (finished) return;
      const rdt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
      let dt = rdt * speed; if (hitStop > 0) { hitStop -= rdt; dt = 0; } else dt *= slow;
      T += dt; if (slow < 1) slow = Math.min(1, slow + rdt * .8);
      const W = window.innerWidth || 960, H = window.innerHeight || 540, dpr = window.jgPerf ? window.jgPerf.dpr(1.5) : Math.min(window.devicePixelRatio || 1, 1.5);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const S = Math.min(W, H), port = H > W, gy = H * (port ? .52 : .6), sz = Math.min(port ? W * .47 : H * .5, H * .4), homeL = W * (port ? .26 : .3), homeR = W * (port ? .74 : .7);
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      g.save(); if (shake > .2) { g.translate(Math.sin(T * 90) * shake, Math.cos(T * 77) * shake); shake *= Math.pow(.02, rdt); }
      /* 배경: 대각 분할 + 군주색 + 집중선 */
      const split = W * .5 + Math.sin(T * .8) * W * .02;
      g.fillStyle = `rgb(${F.L.pc})`; g.globalAlpha = .55; g.beginPath(); g.moveTo(0, 0); g.lineTo(split + W * .06, 0); g.lineTo(split - W * .06, H); g.lineTo(0, H); g.fill();
      g.fillStyle = `rgb(${F.R.pc})`; g.beginPath(); g.moveTo(split + W * .06, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(split - W * .06, H); g.fill(); g.globalAlpha = 1;
      if (ok(IM.vignette)) { g.globalAlpha = .9; g.drawImage(tint(IM.vignette, 'vg', '0,0,0', 1), 0, 0, W, H); g.globalAlpha = 1; }
      if (ok(IM.speed)) img(g, tint(IM.speed, 'sp', '255,255,255', .5), W / 2, gy - sz * .2, Math.max(W, H) * 1.6, Math.max(W, H) * 1.6, .18 + .1 * Math.sin(T * 3), T * .2, true);
      if (ok(IM.cloud) && !LOW()) for (let i = 0; i < 3; i++) { const u = ((T * .05 + i * .37) % 1.4) - .2; g.globalAlpha = .12; g.drawImage(IM.cloud, (i % 4) * 256, 0, 256, 256, W * u - S * .3, H * (.12 + i * .1), S * .6, S * .3); } g.globalAlpha = 1;
      /* 땅 + 그림자 */
      const grd = g.createLinearGradient(0, gy + sz * .45, 0, H); grd.addColorStop(0, 'rgba(0,0,0,.0)'); grd.addColorStop(1, 'rgba(0,0,0,.65)'); g.fillStyle = grd; g.fillRect(0, gy + sz * .45, W, H);
      ribbon(g, 0, gy + sz * .5, W, gy + sz * .5, S * .02, '255,230,170', .35);

      /* 현재 사건 */
      let e = null; for (const x of S0.ev) if (T >= x.t0 && T < x.t0 + x.d) { e = x; break; }
      const pos = { L: { x: homeL, lean: 0, fl: 0, a: 1 }, R: { x: homeR, lean: 0, fl: 0, a: 1 } };
      const awak = S0.ev.find(x => x.type === 'awaken'), awakened = side => awak && awak.att === side && T >= awak.t0 + .4;
      /* 입장 */
      const ent = outBack(kk(T, .1, .9)); pos.L.x = homeL - (1 - ent) * W * .6; pos.R.x = homeR + (1 - ent) * W * .6;
      if (T > .15 && !fired.has('intro')) { fired.add('intro'); SFX.whoosh(); }
      if (T > 1.0 && !fired.has('vs')) { fired.add('vs'); say('一 騎 討 ち', 'C', '255,230,160', 1); SFX.clash(); }
      if (e) {
        const k = (T - e.t0) / e.d, A = e.att, Dd = e.def, ax = A === 'L' ? homeL : homeR, dx = Dd === 'L' ? homeL : homeR, mid = (homeL + homeR) / 2, dirA = A === 'L' ? 1 : -1;
        if (e.type === 'clash') { const c = Math.sin(clamp(k / .45, 0, 1) * Math.PI / 2); pos.L.x = homeL + (mid - S * .1 - homeL) * c * (k < .65 ? 1 : 1 - (k - .65) / .35); pos.R.x = homeR + (mid + S * .1 - homeR) * c * (k < .65 ? 1 : 1 - (k - .65) / .35); pos.L.lean = .15 * c; pos.R.lean = .15 * c;
          if (k > .42 && !fired.has(e)) { fired.add(e); hitStop = .08; shake = S * .02; SFX.clash(); say(pick(['막상막하!', '불꽃 튀는 격돌!', '칼날이 맞부딪친다!']), 'C', '255,240,200', 0); for (let i = 0; i < 26; i++) sp(P, { kind: 'spark', cell: pick([3, 4, 5]), x: mid, y: gy - sz * .2, vx: rnd(-1, 1) * S * .9, vy: rnd(-1, .5) * S * .7, ay: S * 1.4, size: S * rnd(.012, .03), life: rnd(.4, .9), rgb: '255,220,140', rot: rnd(0, TAU) }); }
          if (k > .42 && k < .8) { shock(g, 'shock_y', mid, gy - sz * .2, S * .7, (k - .42) / .38, .9, 1); flash(g, mid, gy - sz * .2, S * .9, '255,240,200', (1 - (k - .42) / .38) * 1.1); } }
        else if (e.type === 'hit' || e.type === 'crit') { const crit = e.type === 'crit', dash = Math.sin(clamp(k / .35, 0, 1) * Math.PI / 2), back = k > .55 ? smooth((k - .55) / .45) : 0; pos[A].x = ax + (dx - dirA * sz * .55 - ax) * dash * (1 - back); pos[A].lean = .35 * dash * (1 - back);
          const rec = k > .36 ? Math.sin(clamp((k - .36) / .3, 0, 1) * Math.PI) : 0; pos[Dd].x = dx + dirA * S * .09 * rec; pos[Dd].lean = -.25 * rec; pos[Dd].fl = k > .36 ? Math.max(0, 1 - (k - .36) / .15) : 0;
          if (k > .36 && !fired.has(e)) { fired.add(e); hp[Dd] = e.hpAfter[Dd]; hitStop = crit ? .14 : .07; shake = S * (crit ? .035 : .02); if (crit) { SFX.crit(); slow = .35; } else SFX.hit(); texts.push({ txt: (crit ? '치명타! ' : '') + '-' + e.dmg, side: Dd, col: crit ? '255,90,60' : '255,240,220', big: crit ? 1 : 0, t0: T, num: 1 });
            const hx = dx, hy = gy - sz * .15, key = F[A].st.key; for (let i = 0; i < (crit ? 40 : 22); i++) sp(P, { kind: 'spark', cell: pick([0, 3, 4]), x: hx, y: hy, vx: dirA * rnd(.2, 1.2) * S, vy: rnd(-.9, .4) * S, ay: S * 1.4, size: S * rnd(.012, .03), life: rnd(.4, 1), rgb: F[A].sc, rot: rnd(0, TAU) });
            const au = F[A].st.aura; if (au === 'petal') for (let i = 0; i < 14; i++) sp(P, { kind: 'petal', cell: (Math.random() * 5) | 0, x: hx, y: hy, vx: rnd(-.6, .6) * S, vy: rnd(-.6, .1) * S, ay: S * .4, size: S * rnd(.03, .05), life: 1.3, add: false, rot: rnd(0, TAU), vr: rnd(-6, 6) }); if (au === 'frost') for (let i = 0; i < 10; i++) sp(P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: hx, y: hy, vx: rnd(-.6, .6) * S, vy: rnd(-.7, .1) * S, ay: S * 1.2, size: S * rnd(.04, .07), life: 1, rgb: '180,230,255' }); if (au === 'water') for (let i = 0; i < 10; i++) sp(P, { kind: 'foam', cell: (Math.random() * 4) | 0, x: hx, y: hy, vx: rnd(-.6, .6) * S, vy: rnd(-.8, 0) * S, ay: S * 1.5, size: S * rnd(.05, .09), life: .9, rgb: '220,248,255', add: false }); if (au === 'fire') for (let i = 0; i < 10; i++) sp(P, { kind: 'spark', cell: pick([6, 7, 0]), x: hx, y: hy, vx: rnd(-.4, .4) * S, vy: -rnd(.2, .7) * S, size: S * rnd(.02, .045), life: 1.1, rgb: '255,110,40' }); }
          if (k > .3 && k < .62 && ok(IM.slash)) { const sk2 = (k - .3) / .32, ang = (dirA > 0 ? -.5 : Math.PI + .5) + sk2 * .9 * dirA; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(dx, gy - sz * .15); g.rotate(ang); g.globalAlpha = (1 - sk2) * .95; g.drawImage(tint(IM.slash, 'sl', F[A].sc, .5), 0, ((e.t0 * 7) | 0) % 4 * 128, 512, 128, -sz * .7, -sz * .14, sz * 1.4, sz * .28); g.restore(); }
          if (k > .36 && k < .9) { shock(g, 'shock_' + F[A].st.key, dx, gy - sz * .15, S * (crit ? 1 : .6), (k - .36) / .54, .9, .8); flash(g, dx, gy - sz * .15, S * (crit ? 1.4 : .8), F[A].sc, (1 - (k - .36) / .3) * (crit ? 1.2 : .8)); }
          if (crit && k > .36 && k < .7 && F[A].st.aura === 'thunder') bolt(g, 'bolt_y', dx, 0, dx, gy, S * .3, 1 - (k - .36) / .34, (T * 20) | 0); }
        else if (e.type === 'dodge') { const dash = Math.sin(clamp(k / .4, 0, 1) * Math.PI / 2), back = k > .55 ? smooth((k - .55) / .45) : 0; pos[A].x = ax + (dx - dirA * sz * .6 - ax) * dash * (1 - back); pos[A].lean = .3 * dash * (1 - back); const ev2 = Math.sin(clamp((k - .25) / .4, 0, 1) * Math.PI); pos[Dd].x = dx + dirA * S * .16 * ev2; pos[Dd].a = 1 - .5 * ev2;
          if (k > .35 && !fired.has(e)) { fired.add(e); SFX.whoosh(); texts.push({ txt: '회피!', side: Dd, col: '170,230,255', t0: T }); }
          if (k > .25 && k < .7) for (let gh = 1; gh <= 2; gh++) drawFighter(F[Dd], pos[Dd].x - dirA * gh * S * .05, gy, sz, 0, 0, false, .18 / gh); }
        else if (e.type === 'awaken') { pos[A].lean = Math.sin(T * 30) * .03; if (!fired.has(e)) { fired.add(e); SFX.awaken(); slow = .4; say('역전의 기세!!', A, F[A].sc, 1); setTimeout(() => say(F[A].st.cry, A, '255,255,255', 0), 350); }
          const ax2 = pos[A].x; glow(g, 'glow_' + F[A].st.key, ax2, gy - sz * .2, sz * (2 + k), .7 * Math.sin(k * Math.PI)); shock(g, 'shock_' + F[A].st.key, ax2, gy + sz * .3, S * 1.2, k, .9, .35); if (ok(IM.speed)) img(g, tint(IM.speed, 'aw', F[A].sc, .8), ax2, gy - sz * .2, S * 1.6, S * 1.6, .5 * Math.sin(k * Math.PI), T * 2, true);
          if (Math.random() < .8) sp(P, { kind: 'spark', cell: pick([6, 7, 0]), x: ax2 + rnd(-sz * .4, sz * .4), y: gy + sz * .3, vy: -rnd(.3, .8) * S, vx: rnd(-.05, .05) * S, size: S * rnd(.012, .03), life: rnd(.8, 1.4), rgb: F[A].sc }); }
        else if (e.type === 'finisher') { finisher(e, k, pos, gy, sz, S, W, H, homeL, homeR); }
      }
      /* 패자 KO 후 */
      const fin = S0.ev[S0.ev.length - 1], kof = T - (fin.t0 + fin.d * .62);
      if (kof > 0) { const lo = fin.def; pos[lo].x += (lo === 'L' ? -1 : 1) * S * .5 * outCubic(kof / .8); pos[lo].lean = (lo === 'L' ? -1 : 1) * -.9 * outCubic(kof / .8); pos[lo].a = 1 - smooth(kof / 1.2); }
      /* 군주 카드 */
      const bob = s => Math.sin(T * 3 + (s === 'L' ? 0 : 1.5)) * S * .006;
      ['L', 'R'].forEach(s => { const p = pos[s]; g.save(); g.globalAlpha = .35 * p.a; g.fillStyle = '#000'; g.beginPath(); g.ellipse(p.x, gy + sz * .52, sz * .36, sz * .06, 0, 0, TAU); g.fill(); g.restore(); drawFighter(F[s], p.x, gy + bob(s), sz, p.lean, p.fl, awakened(s), p.a); });
      stepPT(P, g, dt);
      g.restore();
      /* 체력바 (화면 흔들림 영향 없음) */
      ['L', 'R'].forEach(s => { disp[s] += (hp[s] - disp[s]) * Math.min(1, rdt * 6); const bw = W * .4, bx = s === 'L' ? W * .05 : W * .55, by = H * (port ? .14 : .08), bh = Math.max(10, H * .018);
        g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.fillStyle = 'rgba(255,80,60,.85)'; const wv = bw * disp[s] / 100; g.fillRect(s === 'L' ? bx : bx + bw - wv, by, wv, bh); g.fillStyle = `rgb(${F[s].sc})`; const wh = bw * hp[s] / 100; g.fillRect(s === 'L' ? bx : bx + bw - wh, by, wh, bh);
        g.font = `900 ${Math.max(13, S * .042)}px "Noto Serif KR",serif`; g.textAlign = s === 'L' ? 'left' : 'right'; g.textBaseline = 'bottom'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineJoin = 'round'; const nm = `${F[s].w.icon || ''} ${F[s].name}`; g.strokeText(nm, s === 'L' ? bx : bx + bw, by - 4); g.fillStyle = '#fff6d6'; g.fillText(nm, s === 'L' ? bx : bx + bw, by - 4); });
      /* 글자 */
      for (let i = texts.length - 1; i >= 0; i--) { const tx = texts[i], q = (T - tx.t0) / (tx.big ? 1.5 : 1.0); if (q >= 1) { texts.splice(i, 1); continue; } const x = tx.side === 'C' ? W / 2 : tx.side === 'L' ? homeL : homeR, y = (tx.side === 'C' ? H * .3 : gy - sz * .72) - (tx.num ? q * S * .12 : 0), sc = tx.big ? outBack(kk(q, 0, .18)) : 1, fs = Math.max(16, S * (tx.big ? .09 : .055));
        g.save(); g.globalAlpha = 1 - smooth((q - .7) / .3); g.translate(x, y); g.scale(sc, sc); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${fs}px "Noto Serif KR",serif`; g.lineJoin = 'round'; g.lineWidth = fs * .18; g.strokeStyle = 'rgba(10,5,0,.92)'; g.strokeText(tx.txt, 0, 0); g.fillStyle = `rgb(${tx.col})`; g.fillText(tx.txt, 0, 0); g.restore(); }
      /* 결과 */
      if (kof > .3) { const q = kof - .3, wS = fin.att, fs = Math.min(W * .16, H * .1); g.save(); g.globalAlpha = smooth(kk(q, 0, .2)); g.translate(W / 2, H * .3); g.scale(outBack(kk(q, 0, .3)), outBack(kk(q, 0, .3))); g.textAlign = 'center'; g.textBaseline = 'middle'; if (ok(IM.brush)) g.drawImage(tint(IM.brush, 'rb2', F[wS].pc, .85), 0, 0, 1024, 256, -W * .48, -fs * .8, W * .96, fs * 1.6); g.font = `900 ${fs}px "Noto Serif KR",serif`; g.lineWidth = fs * .16; g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,.9)'; const msg = (wS === 'L' ? '先攻 획득!' : '상대 先攻'); g.strokeText(msg, 0, 0); g.fillStyle = '#fff3c4'; g.fillText(msg, 0, 0); g.font = `800 ${fs * .32}px "Noto Serif KR",serif`; g.lineWidth = fs * .06; g.strokeText(`${F[wS].name} 승리${S0.comeback ? ' · 대역전!' : ''}`, 0, fs * .75); g.fillStyle = `rgb(${F[wS].sc})`; g.fillText(`${F[wS].name} 승리${S0.comeback ? ' · 대역전!' : ''}`, 0, fs * .75); g.restore(); }
      if (T > S0.end) { cleanup(); return; }
      raf = requestAnimationFrame(frame);
    }

    /* 군주별 결정타 */
    function finisher(e, k, pos, gy, sz, S, W, H, homeL, homeR) {
      const A = e.att, Dd = e.def, f = F[A], tx = Dd === 'L' ? homeL : homeR, ty = gy - sz * .1, dirA = A === 'L' ? 1 : -1, type = f.st.fin;
      if (!fired.has('fin0')) { fired.add('fin0'); say(`${f.name} 결정타!`, 'C', f.sc, 1); SFX.whoosh(); }
      pos[A].lean = .2 * Math.sin(k * Math.PI);
      if (type === 'stars') { for (let i = 0; i < 7; i++) { const x = tx + (i - 3) * S * .07, ts = .15 + i * .05, q = kk(k, ts, ts + .2); if (q > 0) { img(g, IM.starflare, x, H * .08, S * .1, S * .1, 1 - kk(k, .8, 1), k * 4, true); if (q < 1) ribbon(g, x, H * .08, x, ty, S * .06 * (1 - q), '255,236,170', 1); } } if (ok(IM.bagua) && k > .5) img(g, tint(IM.bagua, 'fb', '120,220,255', .4), tx, ty + sz * .4, S * .9 * (1.2 - k * .5), S * .4, (1 - kk(k, .8, 1)), k * 3, true); }
      else if (type === 'spout') { const q = outBack(kk(k, .1, .5)); if (ok(IM.spout)) for (let i = -1; i <= 1; i++) { const hh = S * .9 * q * (1 - kk(k, .75, 1)), ww = S * .3; g.save(); g.translate(tx + i * S * .14, gy + sz * .5); g.rotate(Math.sin(T * 4 + i) * .08); g.globalAlpha = .95; g.drawImage(IM.spout, -ww / 2, -hh, ww, hh); g.restore(); } if (Math.random() < .8) sp(P, { kind: 'foam', cell: (Math.random() * 4) | 0, x: tx + rnd(-S * .2, S * .2), y: gy, vx: rnd(-.4, .4) * S, vy: -rnd(.3, 1) * S, ay: S * 1.6, size: S * rnd(.05, .1), life: 1, rgb: '220,248,255', add: false }); }
      else if (type === 'volley') { if (ok(IM.volley) && k < .7) { g.save(); g.beginPath(); g.rect(tx - S * .45, 0, S * .9, gy + sz * .5); g.clip(); const Tt = S * .6, off = (T * S * 2.2) % Tt; g.globalAlpha = 1 - kk(k, .55, .7); for (let yy = -Tt; yy < gy + Tt; yy += Tt) for (let xx = tx - S * .45 - Tt; xx < tx + S * .45 + Tt; xx += Tt) g.drawImage(IM.volley, xx - off * .53, yy + off, Tt, Tt); g.restore(); } if (k > .55 && k < .85) bolt(g, 'bolt_y', tx, 0, tx, ty, S * .45, 1 - kk(k, .55, .85), (T * 25) | 0); }
      else if (type === 'brothers') { const q1 = kk(k, .05, .3), q2 = kk(k, .3, .5), q3 = kk(k, .5, .7); if (q1 > 0 && q1 < 1 && ok(IM.glaive)) { g.save(); g.translate(tx - dirA * S * .3, ty); g.rotate((-1.8 + 2.2 * outCubic(q1)) * dirA + (dirA < 0 ? Math.PI : 0)); g.drawImage(IM.glaive, -S * .05, -S * .55, S * .11, S * .55); g.restore(); ribbon(g, tx - S * .3, ty - S * .2, tx + S * .3, ty + S * .1, S * .06, '90,255,170', 1 - q1); } if (q2 > 0 && q2 < 1 && ok(IM.spear)) { const y = H - (H - ty) * outCubic(q2); g.save(); g.translate(tx, y); g.drawImage(IM.spear, -S * .03, -S * .05, S * .06, S * .5); g.restore(); } if (q3 > 0 && q3 < 1) { ribbon(g, tx - S * .25, ty - S * .25, tx + S * .25, ty + S * .25, S * .05, '255,215,90', 1 - q3); ribbon(g, tx + S * .25, ty - S * .25, tx - S * .25, ty + S * .25, S * .05, '60,240,170', 1 - q3); } }
      else if (type === 'horse') { const q = kk(k, .05, .6); if (q > 0 && q < 1 && ok(IM.horse)) { const x = (A === 'L' ? -S * .4 : W + S * .4) + dirA * (W + S * .8) * q, fr = ((T * 14) | 0) & 3, hw = S * .7; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, gy - sz * .05); if (dirA < 0) g.scale(-1, 1); g.drawImage(IM.horse, fr * 256, 0, 256, 192, -hw / 2, -hw * .375, hw, hw * .75); g.restore(); ribbon(g, x - dirA * S * .8, gy, x, gy, S * .2, '255,60,40', .8); for (let i = 0; i < 2; i++) sp(P, { kind: 'spark', cell: pick([0, 6, 7]), x: x - dirA * hw * .3, y: gy + rnd(-sz * .2, sz * .2), vx: -dirA * rnd(.2, .5) * S, vy: -rnd(.1, .5) * S, size: S * rnd(.015, .035), life: 1, rgb: '255,90,40' }); } }
      else if (type === 'ice') { if (ok(IM.icepillar)) for (let i = 0; i < 7; i++) { const x = tx + (i - 3) * S * .075, q = outBack(kk(k, .08 + Math.abs(i - 3) * .04, .4 + Math.abs(i - 3) * .04)), hh = S * (.35 + .12 * (3 - Math.abs(i - 3)) / 3) * q * (k > .72 ? 0 : 1), ww = hh * .33; if (hh > 1) { g.save(); g.translate(x, gy + sz * .5); g.drawImage(IM.icepillar, -ww / 2, -hh, ww, hh); g.restore(); } } if (k > .72 && !fired.has('shatter')) { fired.add('shatter'); for (let i = 0; i < 26; i++) sp(P, { kind: 'ice', cell: (Math.random() * 4) | 0, x: tx + rnd(-S * .25, S * .25), y: gy, vx: rnd(-1, 1) * S * .7, vy: -rnd(.3, 1.1) * S, ay: S * 1.6, size: S * rnd(.04, .08), life: 1.2, rgb: '180,230,255' }); } }
      /* 공통: 결정타 착탄 */
      if (k > .6 && !fired.has('finhit')) { fired.add('finhit'); hp[Dd] = 0; hitStop = .16; shake = S * .045; slow = .3; SFX.ko(); texts.push({ txt: 'K.O.', side: Dd, col: '255,80,60', big: 1, t0: T }); for (let i = 0; i < 46; i++) sp(P, { kind: 'spark', cell: pick([0, 3, 4]), x: tx, y: ty, vx: rnd(-1, 1) * S * 1.1, vy: rnd(-1, .3) * S, ay: S * 1.3, size: S * rnd(.012, .034), life: rnd(.6, 1.3), rgb: f.sc }); }
      if (k > .6) { const q = (k - .6) / .4; shock(g, 'shock_' + f.st.key, tx, ty, S * 1.5, q, .95, .7); flash(g, tx, ty, S * 2.2, f.sc, (1 - smooth(q)) * 1.3); if (ok(IM.burst)) img(g, tint(IM.burst, 'fbst', f.sc, .7), tx, ty, S * (.4 + 1.2 * outCubic(q)), S * (.4 + 1.2 * outCubic(q)), (1 - smooth(q)) * .85, q, true); }
    }
    raf = requestAnimationFrame(frame);
    return true;
  }

  function install() {
    const cur = window.playAnimeFirstTurnDuel; if (cur && cur.__d12) return;
    const orig = cur;
    const fn = function (winnerSide, onComplete) { if (D12.enabled) { try { if (playDuel(winnerSide, onComplete)) return; } catch (e) { console.warn('duel12', e); } } if (typeof orig === 'function') return orig.apply(this, arguments); if (typeof onComplete === 'function') onComplete(winnerSide); };
    fn.__d12 = true; window.playAnimeFirstTurnDuel = fn;
  }
  install(); setInterval(install, 1500);
  D12.test = (w) => window.playAnimeFirstTurnDuel(w || 'c', () => { D12.lastDone = true; });
})();
