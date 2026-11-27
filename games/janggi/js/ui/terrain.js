/* =========================================================
 * 지형 무늬(코드 그림) + 지형 파티클
 * 새 무늬 추가: MJ.Terrain.textures.myTexture = (g, w, h, rnd, board) => { ... }
 * 새 파티클 추가: MJ.Terrain.particles.myType = { spawn(p,w,h,rnd), update(p,dt,w,h), draw(g,p) }
 * ========================================================= */
MJ.Terrain = (function () {
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }
  function grad(g, w, h, c) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }

  const textures = {
    wood(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      g.globalAlpha = 0.18;
      for (let i = 0; i < 90; i++) {
        const y0 = rnd() * h, amp = 4 + rnd() * 10, fr = 0.004 + rnd() * 0.01;
        g.strokeStyle = rnd() > 0.5 ? '#6b3f17' : '#fff0d0';
        g.lineWidth = 0.6 + rnd() * 1.6;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + Math.sin(x * fr + i) * amp);
        g.stroke();
      }
      g.globalAlpha = 1;
    },
    grass(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      for (let i = 0; i < w * h / 90; i++) {
        const x = rnd() * w, y = rnd() * h, l = 3 + rnd() * 7;
        g.strokeStyle = `hsla(${95 + rnd() * 40},60%,${25 + rnd() * 35}%,0.55)`;
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 4, y - l); g.stroke();
      }
    },
    snow(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.4})`;
        g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 80, 8 + rnd() * 20, 0, 0, Math.PI * 2); g.fill();
      }
      for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(160,200,230,0.5)'; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
    },
    sand(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      g.globalAlpha = 0.25;
      for (let i = 0; i < 25; i++) {
        const y0 = rnd() * h; g.strokeStyle = rnd() > 0.5 ? '#a8742c' : '#fff4c9'; g.lineWidth = 2;
        g.beginPath(); for (let x = 0; x <= w; x += 10) g.lineTo(x, y0 + Math.sin(x * 0.015 + i) * 12); g.stroke();
      }
      g.globalAlpha = 1;
      for (let i = 0; i < w * h / 40; i++) { g.fillStyle = `rgba(120,80,30,${rnd() * 0.25})`; g.fillRect(rnd() * w, rnd() * h, 1.2, 1.2); }
    },
    lava(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      for (let i = 0; i < 30; i++) {
        let x = rnd() * w, y = rnd() * h;
        g.strokeStyle = `rgba(255,${80 + rnd() * 100},0,${0.35 + rnd() * 0.4})`;
        g.lineWidth = 1 + rnd() * 3; g.shadowColor = '#ff5a00'; g.shadowBlur = 12;
        g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * 70; y += (rnd() - 0.5) * 70; g.lineTo(x, y); }
        g.stroke();
      }
      g.shadowBlur = 0;
    },
    water(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 2;
      for (let i = 0; i < 70; i++) {
        const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 18;
        g.beginPath(); g.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      }
    },
    night(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      const neb = g.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.7, h * 0.3, w * 0.7);
      neb.addColorStop(0, 'rgba(140,90,255,0.25)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = neb; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${rnd()})`; g.fillRect(rnd() * w, rnd() * h, rnd() * 1.8, rnd() * 1.8); }
    },
    sakura(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      for (let i = 0; i < 120; i++) {
        g.fillStyle = `rgba(255,${150 + rnd() * 60},${180 + rnd() * 40},${0.25 + rnd() * 0.4})`;
        g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 3 + rnd() * 4, 2 + rnd() * 2, rnd() * 3, 0, Math.PI * 2); g.fill();
      }
    },
    ink(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      for (let i = 0; i < 5; i++) { // 먼 산
        g.fillStyle = `rgba(30,30,30,${0.04 + rnd() * 0.06})`;
        const by = h * (0.2 + rnd() * 0.7);
        g.beginPath(); g.moveTo(0, by);
        for (let x = 0; x <= w; x += 20) g.lineTo(x, by - Math.abs(Math.sin(x * 0.01 + i * 2)) * (40 + rnd() * 40));
        g.lineTo(w, h); g.lineTo(0, h); g.fill();
      }
    },
    stone(g, w, h, rnd, B) {
      grad(g, w, h, B.colors.bg);
      const s = 46;
      for (let y = 0; y < h; y += s) for (let x = (y / s) % 2 ? -s / 2 : 0; x < w; x += s) {
        g.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},${rnd() * 0.08})`;
        g.fillRect(x + 1, y + 1, s - 2, s - 2);
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
      }
    },
  };

  /* ---------------- 파티클 ---------------- */
  const particles = {
    snow: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vy = 18 + r() * 30; p.vx = (r() - 0.5) * 10; p.s = 1 + r() * 2.5; },
            update(p, dt, w, h) { p.y += p.vy * dt; p.x += p.vx * dt + Math.sin(p.y * 0.03) * 0.3; if (p.y > h) { p.y = -5; p.x = Math.random() * w; } },
            draw(g, p, c) { g.fillStyle = c; g.globalAlpha = 0.85; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); } },
    petal: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vy = 20 + r() * 25; p.vx = 10 + r() * 20; p.a = r() * 6; p.s = 3 + r() * 3; },
             update(p, dt, w, h) { p.y += p.vy * dt; p.x += p.vx * dt; p.a += dt * 2; if (p.y > h || p.x > w) { p.y = -5; p.x = Math.random() * w - 40; } },
             draw(g, p, c) { g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = c; g.globalAlpha = 0.85;
                             g.beginPath(); g.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 7); g.fill(); g.restore(); } },
    leaf: { spawn(p, w, h, r) { particles.petal.spawn(p, w, h, r); p.s = 4 + r() * 3; }, update(...a) { particles.petal.update(...a); },
            draw(g, p, c) { particles.petal.draw(g, p, c); } },
    ember: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vy = -(20 + r() * 40); p.vx = (r() - 0.5) * 15; p.s = 1 + r() * 2; p.life = r(); },
             update(p, dt, w, h) { p.y += p.vy * dt; p.x += p.vx * dt; p.life += dt * 0.4; if (p.y < -5 || p.life > 1.5) { p.y = h + 5; p.x = Math.random() * w; p.life = 0; } },
             draw(g, p, c) { g.fillStyle = c; g.globalAlpha = Math.max(0, 1 - p.life / 1.5); g.shadowColor = c; g.shadowBlur = 8;
                             g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); g.shadowBlur = 0; } },
    firefly: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.t = r() * 10; p.s = 1.5 + r() * 1.5; },
               update(p, dt) { p.t += dt; p.x += Math.cos(p.t * 0.7) * 0.4; p.y += Math.sin(p.t * 0.9) * 0.4; },
               draw(g, p, c) { g.fillStyle = c; g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(p.t * 2)); g.shadowColor = c; g.shadowBlur = 10;
                               g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); g.shadowBlur = 0; } },
    bubble: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vy = -(10 + r() * 25); p.s = 2 + r() * 5; },
              update(p, dt, w, h) { p.y += p.vy * dt; p.x += Math.sin(p.y * 0.05) * 0.3; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } },
              draw(g, p, c) { g.strokeStyle = c; g.globalAlpha = 0.6; g.lineWidth = 1; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.stroke(); } },
    star: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.t = r() * 10; p.s = 0.6 + r() * 1.4; },
            update(p, dt) { p.t += dt; },
            draw(g, p, c) { g.fillStyle = c; g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(p.t * 1.5)); g.fillRect(p.x, p.y, p.s, p.s); } },
    sand: { spawn(p, w, h, r) { p.x = r() * w; p.y = r() * h; p.vx = 40 + r() * 60; p.s = 0.8 + r() * 1.2; },
            update(p, dt, w) { p.x += p.vx * dt; p.y += Math.sin(p.x * 0.02) * 0.3; if (p.x > w) p.x = -5; },
            draw(g, p, c) { g.fillStyle = c; g.globalAlpha = 0.6; g.fillRect(p.x, p.y, p.s * 3, p.s); } },
  };

  function makeParticles(board, w, h) {
    const P = board.particles || {};
    const type = particles[P.type];
    if (!type) return [];
    const r = seeded(Date.now());
    const arr = [];
    const n = Math.round((P.count || 30) * Math.min(1, (w * h) / (700 * 900) + 0.35));
    for (let i = 0; i < n; i++) { const p = {}; type.spawn(p, w, h, r); arr.push(p); }
    return arr;
  }
  function updateDraw(g, board, arr, dt, w, h) {
    const P = board.particles || {}; const type = particles[P.type];
    if (!type || !arr.length) return;
    g.save();
    arr.forEach(p => { type.update(p, dt, w, h); type.draw(g, p, P.color || '#fff'); });
    g.restore();
  }

  return { textures, particles, seeded, makeParticles, updateDraw };
})();
