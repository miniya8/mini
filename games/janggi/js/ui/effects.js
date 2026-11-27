/* =========================================================
 * 이펙트 — 베기, 불꽃, 링, 떠오르는 글자, 꽃가루
 * 새 이펙트: MJ.Effects.types.myFx = { init(e), update(e,dt), draw(g,e) }
 *           사용: renderer.fx('myFx', {x, y, ...})
 * ========================================================= */
MJ.Effects = (function () {
  const types = {
    slash: {
      init(e) { e.life = 0.45; e.ang = Math.random() * Math.PI; },
      draw(g, e) {
        const k = e.t / e.life, len = e.r * 2.6;
        g.save(); g.translate(e.x, e.y); g.rotate(e.ang);
        g.globalAlpha = 1 - k; g.strokeStyle = e.color || '#fff'; g.shadowColor = e.color || '#fff'; g.shadowBlur = 18;
        [-0.25, 0, 0.25].forEach((o, i) => {
          g.lineWidth = (3 - i * 0.6) * (1 - k) + 1;
          g.beginPath(); g.moveTo(-len * Math.min(1, k * 3), o * e.r); g.lineTo(len * Math.min(1, k * 3), o * e.r + e.r * 0.2); g.stroke();
        });
        g.restore();
      },
    },
    sparks: {
      init(e) {
        e.life = 0.7;
        e.ps = Array.from({ length: e.n || 22 }, () => {
          const a = Math.random() * Math.PI * 2, v = (0.6 + Math.random()) * e.r * 4;
          return { x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 1 + Math.random() * 3 };
        });
      },
      update(e, dt) { e.ps.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.93; p.vy = p.vy * 0.93 + 60 * dt; }); },
      draw(g, e) {
        g.save(); g.translate(e.x, e.y); g.globalAlpha = 1 - e.t / e.life;
        g.fillStyle = e.color || '#ffd36b'; g.shadowColor = e.color || '#ffd36b'; g.shadowBlur = 8;
        e.ps.forEach(p => { g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); });
        g.restore();
      },
    },
    ring: {
      init(e) { e.life = e.life || 0.6; },
      draw(g, e) {
        const k = e.t / e.life;
        g.save(); g.globalAlpha = 1 - k; g.strokeStyle = e.color || '#fff'; g.lineWidth = 4 * (1 - k) + 1;
        g.beginPath(); g.arc(e.x, e.y, e.r * (0.6 + k * 1.6), 0, 7); g.stroke(); g.restore();
      },
    },
    text: {
      init(e) { e.life = e.life || 1.1; },
      draw(g, e) {
        const k = e.t / e.life;
        g.save(); g.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        g.font = `900 ${e.size || 22}px "Black Han Sans", sans-serif`; g.textAlign = 'center';
        g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.fillStyle = e.color || '#fff';
        const y = e.y - k * 40;
        g.strokeText(e.text, e.x, y); g.fillText(e.text, e.x, y); g.restore();
      },
    },
    confetti: {
      init(e) {
        e.life = 3.2;
        const cols = ['#ff5a5f', '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#ffffff'];
        e.ps = Array.from({ length: 140 }, () => ({
          x: Math.random() * e.w, y: -Math.random() * e.h * 0.5, vy: 80 + Math.random() * 160,
          vx: (Math.random() - 0.5) * 60, a: Math.random() * 6, va: (Math.random() - 0.5) * 10,
          c: cols[Math.floor(Math.random() * cols.length)], s: 4 + Math.random() * 5,
        }));
      },
      update(e, dt) { e.ps.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; }); },
      draw(g, e) {
        g.save(); g.globalAlpha = Math.min(1, (e.life - e.t) * 2);
        e.ps.forEach(p => { g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
        g.restore();
      },
    },
  };

  function create(type, opts) {
    const T = types[type]; if (!T) return null;
    const e = Object.assign({ type, t: 0, life: 1 }, opts);
    T.init && T.init(e);
    return e;
  }
  function step(list, g, dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i], T = types[e.type];
      e.t += dt;
      if (e.t >= e.life) { list.splice(i, 1); continue; }
      T.update && T.update(e, dt);
      T.draw(g, e);
    }
  }
  return { types, create, step };
})();
