/* =========================================================
 * 큰 연출 — 장군 · 외통 · 승리 · 패배
 *  - 판 위 효과(번개·충격파·파편)는 장기판 렌더러 안에서 기물·선 "아래"에 그림 → 판을 가리지 않음
 *  - 화면 가장자리 빛(비네트)·섬광은 아주 짧게
 *  - 대국이 끝난 뒤에만 전체 화면 오버레이(폭죽·빛줄기·금화·재)를 사용
 *  사용: MJ.Spectacle.check(rd, {from:[idx...], king:idx, side, mine})
 *        MJ.Spectacle.end(rd, {win, mate, winner, loserKing, from:[idx...]})
 * ========================================================= */
MJ.Spectacle = (function () {
  let cv, g, W = 0, H = 0, dpr = 1, items = [], running = false, last = 0, timers = [];
  let vig, flashEl;
  const S = () => MJ.Store.get().settings;
  const C = s => MJ.CONFIG.sides[s];

  function init() {
    cv = document.createElement('canvas'); cv.id = 'fxOverlay'; document.body.appendChild(cv);
    g = cv.getContext('2d');
    vig = document.createElement('div'); vig.id = 'fxVignette'; document.body.appendChild(vig);
    flashEl = document.createElement('div'); flashEl.id = 'fxFlash'; document.body.appendChild(flashEl);
    resize(); window.addEventListener('resize', resize);
  }
  function resize() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  function later(ms, fn) { const t = setTimeout(() => { timers = timers.filter(x => x !== t); fn(); }, ms); timers.push(t); }
  function stop() {
    timers.forEach(clearTimeout); timers = []; items = [];
    if (g) g.clearRect(0, 0, cv.width, cv.height);
    if (vig) vig.className = '';
    document.body.classList.remove('fx-defeat', 'fx-celebrate');
  }

  /* ---------- 화면 효과 ---------- */
  function flash(color, ms, op) {
    flashEl.style.setProperty('--fc', color || '#fff'); flashEl.style.setProperty('--fo', op == null ? 0.55 : op);
    flashEl.style.setProperty('--fd', (ms || 260) + 'ms');
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
  }
  function vignette(color, mode) {
    vig.style.setProperty('--vc', color);
    vig.className = ''; void vig.offsetWidth; vig.className = mode || 'pulse';
  }
  function screenShake(px, ms) {
    const el = document.querySelector('#scr-game'); if (!el) return;
    el.style.setProperty('--sh', (px || 8) + 'px');
    el.classList.remove('fx-shake'); void el.offsetWidth; el.classList.add('fx-shake');
    later(ms || 500, () => el.classList.remove('fx-shake'));
  }
  function buzz(p) { if (S().vibrate && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }
  function screenXY(rd, idx) {
    const c = document.querySelector('#gameCanvas').getBoundingClientRect(), [x, y] = rd.toXY(idx);
    return [c.left + x, c.top + y];
  }

  /* ---------- 오버레이 루프 ---------- */
  function add(it) {
    it.t = 0; items.push(it);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
  }
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; it.t += dt;
      if (it.t >= it.life) { items.splice(i, 1); continue; }
      it.update && it.update(dt); it.draw(g);
    }
    if (items.length) requestAnimationFrame(loop);
    else { running = false; g.clearRect(0, 0, W, H); }
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];

  /* 집중선 (만화식 속도선) */
  function focusLines(x, y, color, life, hole) {
    const n = 70;
    add({ life: life || 0.7, seed: 0, lines: null,
      update() { const k = Math.floor(this.t / 0.06); if (k !== this.seed || !this.lines) { this.seed = k; this.lines = Array.from({ length: n }, () => ({ a: Math.random() * 6.283, w: rand(0.004, 0.018), r0: rand(0.42, 0.62) })); } },
      draw(g) {
        const a = this.t < 0.1 ? this.t / 0.1 : 1 - (this.t - 0.1) / (this.life - 0.1), R = Math.hypot(W, H);
        g.save(); g.globalAlpha = a * 0.85; g.fillStyle = color || '#fff';
        if (hole) { g.beginPath(); g.rect(0, 0, W, H); g.rect(hole.right, hole.top, -hole.width, hole.height); g.clip('evenodd'); } // 장기판 위엔 안 그림
        this.lines.forEach(l => {
          const r0 = Math.min(W, H) * l.r0;
          g.beginPath(); g.moveTo(x + Math.cos(l.a - l.w) * R, y + Math.sin(l.a - l.w) * R);
          g.lineTo(x + Math.cos(l.a) * r0, y + Math.sin(l.a) * r0); g.lineTo(x + Math.cos(l.a + l.w) * R, y + Math.sin(l.a + l.w) * R); g.fill();
        });
        g.restore();
      } });
  }
  /* 회전하는 빛줄기 */
  function godRays(x, y, color, life) {
    add({ life, draw(g) {
      const k = this.t / this.life, a = Math.min(1, this.t / 0.5) * (k > 0.8 ? (1 - k) / 0.2 : 1), R = Math.hypot(W, H);
      g.save(); g.translate(x, y); g.rotate(this.t * 0.35); g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.6);
      gr.addColorStop(0, hexA(color, 0.26 * a)); gr.addColorStop(0.7, hexA(color, 0.05 * a)); gr.addColorStop(1, hexA(color, 0));
      g.fillStyle = gr;
      for (let i = 0; i < 14; i++) { g.rotate(Math.PI * 2 / 14); g.beginPath(); g.moveTo(0, 0); g.lineTo(R, -R * 0.06); g.lineTo(R, R * 0.06); g.fill(); }
      const core = g.createRadialGradient(0, 0, 0, 0, 0, Math.min(W, H) * 0.35);
      core.addColorStop(0, `rgba(255,250,220,${0.25 * a})`); core.addColorStop(1, 'rgba(255,250,220,0)');
      g.fillStyle = core; g.beginPath(); g.arc(0, 0, Math.min(W, H) * 0.35, 0, 7); g.fill();
      g.restore();
    } });
  }
  /* 폭죽 */
  const FW_COLS = [['#ffd34d', '#fff3b0'], ['#ff4d6d', '#ffc2d1'], ['#4dd2ff', '#d0f4ff'], ['#7dff8a', '#e3ffe6'], ['#c77dff', '#f0d9ff'], ['#ff9f1c', '#ffe1b3']];
  function firework(tx, ty, cols, sound) {
    const sx = tx + rand(-40, 40), sy = H + 10, T = 0.55;
    cols = cols || pick(FW_COLS);
    if (sound !== false) MJ.Audio.play('firework', { vol: rand(0.35, 0.6), rate: rand(0.88, 1.15) });
    add({ life: T, trail: [], update() {
      const k = this.t / T, e = 1 - Math.pow(1 - k, 2);
      this.x = sx + (tx - sx) * e; this.y = sy + (ty - sy) * e;
      this.trail.push([this.x, this.y]); if (this.trail.length > 12) this.trail.shift();
    }, draw(g) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = cols[1]; g.lineCap = 'round';
      this.trail.forEach((p, i) => { if (!i) return; const q = this.trail[i - 1]; g.globalAlpha = i / this.trail.length; g.lineWidth = 1 + i * 0.25; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(p[0], p[1]); g.stroke(); });
      g.restore();
    } });
    later(T * 1000, () => {
      const n = 90 + ((Math.random() * 50) | 0), sp = rand(170, 260), ring = Math.random() < 0.35;
      const ps = Array.from({ length: n }, (_, i) => {
        const a = ring ? i / n * 6.283 : Math.random() * 6.283, v = ring ? sp : sp * Math.sqrt(Math.random());
        return { x: tx, y: ty, px: tx, py: ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: Math.random() < 0.75 ? cols[0] : cols[1], tw: Math.random() * 6 };
      });
      add({ life: 1.9, update(dt) { ps.forEach(p => { p.px = p.x; p.py = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.975; p.vy = p.vy * 0.975 + 70 * dt; }); },
        draw(g) {
          const k = this.t / this.life;
          g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
          if (this.t < 0.18) { const gr = g.createRadialGradient(tx, ty, 0, tx, ty, 120); gr.addColorStop(0, `rgba(255,255,255,${0.8 * (1 - this.t / 0.18)})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(tx, ty, 120, 0, 7); g.fill(); }
          ps.forEach(p => {
            const tw = k > 0.5 ? (0.5 + 0.5 * Math.sin(this.t * 30 + p.tw)) : 1;
            g.globalAlpha = (1 - k) * tw; g.strokeStyle = p.c; g.lineWidth = 2.2 * (1 - k * 0.6);
            g.beginPath(); g.moveTo(p.px - (p.x - p.px) * 2.5, p.py - (p.y - p.py) * 2.5); g.lineTo(p.x, p.y); g.stroke();
          });
          g.restore();
        } });
    });
  }
  /* 금화·꽃가루 비 */
  function goldRain(life, n) {
    const ps = Array.from({ length: n || 90 }, () => ({ x: Math.random() * W, y: -Math.random() * H * 0.8, vy: rand(140, 300), vx: rand(-30, 30), a: Math.random() * 6, va: rand(-6, 6), s: rand(5, 10), coin: Math.random() < 0.45, c: pick(['#ffd34d', '#ff5a5f', '#4dd2ff', '#7dff8a', '#ffffff', '#c77dff']) }));
    add({ life, update(dt) { ps.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; if (p.y > H + 20 && this.t < this.life - 2) { p.y = -20; p.x = Math.random() * W; } }); },
      draw(g) {
        g.save(); g.globalAlpha = Math.min(1, (this.life - this.t) / 1.2);
        ps.forEach(p => {
          g.save(); g.translate(p.x, p.y); g.rotate(p.a);
          if (p.coin) { g.scale(Math.cos(p.a * 2), 1); const gr = g.createLinearGradient(-p.s, -p.s, p.s, p.s); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.5, '#ffc93c'); gr.addColorStop(1, '#b07a1c'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, p.s * 0.8, 0, 7); g.fill(); }
          else { g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
          g.restore();
        });
        g.restore();
      } });
  }
  /* 패배: 금 간 화면 + 재 */
  function cracks(x, y, life) {
    const lines = [];
    for (let i = 0; i < 11; i++) {
      let a = i / 11 * 6.283 + rand(-0.2, 0.2), px = x, py = y; const pts = [[px, py]];
      const L = rand(0.35, 0.7) * Math.hypot(W, H);
      for (let d = 0; d < L; d += rand(18, 40)) { a += rand(-0.35, 0.35); px += Math.cos(a) * 30; py += Math.sin(a) * 30; pts.push([px, py]); }
      lines.push(pts);
    }
    add({ life, draw(g) {
      const k = Math.min(1, this.t / 0.25), fade = Math.min(1, (this.life - this.t) / 1);
      g.save(); g.lineJoin = 'round'; g.globalAlpha = fade;
      lines.forEach(pts => {
        const m = Math.max(2, Math.floor(pts.length * k));
        g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 4; g.beginPath(); pts.slice(0, m).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
        g.strokeStyle = 'rgba(235,240,255,.85)'; g.lineWidth = 1.4; g.stroke();
      });
      g.restore();
    } });
  }
  function ash(life) {
    const ps = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, vy: rand(-40, 30), vx: rand(-15, 15), s: rand(1, 3.5), ember: Math.random() < 0.4, ph: Math.random() * 6 }));
    add({ life, update(dt) { ps.forEach(p => { p.x += (p.vx + Math.sin(this.t * 2 + p.ph) * 12) * dt; p.y += (p.ember ? -Math.abs(p.vy) - 20 : Math.abs(p.vy) + 10) * dt; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10; }); },
      draw(g) {
        g.save(); g.globalAlpha = Math.min(1, this.t / 0.8, (this.life - this.t) / 1.2);
        ps.forEach(p => { g.fillStyle = p.ember ? `rgba(255,${120 + (p.ph * 20 | 0)},60,0.9)` : 'rgba(180,180,190,0.6)'; if (p.ember) { g.shadowColor = '#ff6a00'; g.shadowBlur = 8; } else g.shadowBlur = 0; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); });
        g.restore();
      } });
  }
  function hexA(hex, a) {
    const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
  }

  /* ================= 장군 ================= */
  function check(rd, o) {
    const col = C(o.side).aura || C(o.side).color;
    const [kx, ky] = rd.toXY(o.king);
    // 판 위 (기물 아래 층)
    (o.from || []).forEach((f, i) => { const [fx, fy] = rd.toXY(f); rd.fx('bolt', { x: fx, y: fy, x2: kx, y2: ky, color: col, life: 0.85, delay: i * 0.06 }); });
    rd.fx('shock', { x: kx, y: ky, color: '#ff3030', life: 0.7, max: 3.6 });
    rd.fx('shock', { x: kx, y: ky, color: '#ffd34d', life: 0.8, delay: 0.12, max: 4.6 });
    rd.fx('shock', { x: kx, y: ky, color: col, life: 0.95, delay: 0.24, max: 5.6 });
    rd.fx('burst', { x: kx, y: ky, n: 70, colors: ['#ffffff', '#ffd34d', '#ff4d4d', col] });
    rd.fx('sigil', { x: kx, y: ky, color: '#ff3b3b', life: 1.3 });
    rd.shake(22);
    // 화면 가장자리 (판은 가리지 않음)
    const [sx, sy] = screenXY(rd, o.king);
    focusLines(sx, sy, 'rgba(255,255,255,0.9)', 0.55, document.querySelector('#gameCanvas').getBoundingClientRect());
    flash(o.mine ? '#ff2a2a' : '#ffffff', 220, o.mine ? 0.35 : 0.28);
    vignette(o.mine ? '#ff1a1a' : col, 'pulse');
    screenShake(o.mine ? 10 : 7, 520);
    MJ.Audio.duck(2.2);
    buzz(o.mine ? [120, 60, 120, 60, 220] : [60, 40, 90]);
  }

  /* ================= 대국 종료 ================= */
  function end(rd, o) {
    const wcol = C(o.winner).aura || C(o.winner).color;
    const win = o.win;
    MJ.Audio.duck(o.mate ? 9 : 7);
    if (o.loserKing >= 0) {
      const [kx, ky] = rd.toXY(o.loserKing);
      (o.from || []).forEach((f, i) => { const [fx, fy] = rd.toXY(f); rd.fx('bolt', { x: fx, y: fy, x2: kx, y2: ky, color: wcol, life: 1.2, delay: i * 0.08 }); });
      if (o.mate) {
        [0, 0.15, 0.3, 0.5].forEach((d, i) => rd.fx('shock', { x: kx, y: ky, color: ['#ffffff', '#ffd34d', wcol, '#ff3030'][i], life: 1.1 + d, delay: d, max: 6 + i * 1.5 }));
        rd.fx('burst', { x: kx, y: ky, n: 160, speed: 13, life: 1.6, colors: ['#ffffff', '#ffd34d', '#ff8c3a', wcol] });
        rd.fx('sigil', { x: kx, y: ky, color: '#ffd34d', life: 2.2 });
      } else rd.fx('shock', { x: kx, y: ky, color: wcol, life: 0.9, max: 4 });
    }
    rd.shake(o.mate ? 34 : 16);
    const [cx, cy] = o.loserKing >= 0 ? screenXY(rd, o.loserKing) : [W / 2, H / 2];
    if (o.mate) {
      MJ.Audio.play('mate');
      flash('#ffffff', 600, 0.85); focusLines(cx, cy, 'rgba(255,240,200,0.95)', 0.9);
      screenShake(14, 900); buzz([200, 80, 200, 80, 400]);
    } else { MJ.Audio.play('slam'); flash('#ffffff', 300, 0.4); screenShake(8, 400); buzz(win ? [60, 40, 60] : 200); }

    const dly = o.mate ? 1100 : 500;
    if (win) {
      document.body.classList.add('fx-celebrate');
      later(dly - 300, () => { vignette('#ffd34d', 'hold'); godRays(W / 2, H * 0.42, '#ffd34d', o.mate ? 9 : 6); });
      later(dly + 150, () => MJ.Audio.play('win'));
      const N = o.mate ? 16 : 9, dur = o.mate ? 6500 : 4200;
      for (let i = 0; i < N; i++) later(dly + i * (dur / N) + rand(-80, 80), () => firework(rand(W * 0.12, W * 0.88), rand(H * 0.12, H * 0.48), null, i % 2 === 0));
      later(dly + 300, () => goldRain(o.mate ? 8 : 5.5, o.mate ? 120 : 80));
    } else {
      later(o.mate ? 500 : 200, () => {
        document.body.classList.add('fx-defeat');
        vignette('#5a0000', 'hold'); cracks(cx, cy, o.mate ? 3.4 : 2.7); MJ.Audio.play('slam', { vol: 0.8, rate: 0.85 });
      });
      later(dly + 100, () => MJ.Audio.play('lose'));
      later(dly, () => ash(8));
    }
  }

  return { init, check, end, stop, firework, flash, vignette };
})();
