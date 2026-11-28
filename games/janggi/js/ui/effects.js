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

    /* ===== 장군·외통 연출 (판 위 · 기물 아래 층) ===== */
    // 번개 줄기: x,y → x2,y2
    bolt: {
      init(e) { e.life = e.life || 0.8; e.seed = 0; e.pts = null; e.delay = e.delay || 0; },
      update(e) {
        const k = Math.floor((e.t) / 0.045);
        if (k !== e.seed || !e.pts) { e.seed = k; e.pts = jag(e.x, e.y, e.x2, e.y2, 7, e.r * 0.55); e.br = branch(e.pts, e.r); }
      },
      draw(g, e) {
        if (e.t < e.delay) return;
        const k = (e.t - e.delay) / (e.life - e.delay), a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
        const c = e.color || '#7fd8ff';
        const path = pts => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
        g.globalAlpha = a * 0.45; g.strokeStyle = c; g.shadowColor = c; g.shadowBlur = 26; g.lineWidth = e.r * 0.38; path(e.pts);
        g.globalAlpha = a * 0.9; g.lineWidth = e.r * 0.14; path(e.pts); e.br.forEach(b => { g.lineWidth = e.r * 0.07; path(b); });
        g.globalAlpha = a; g.strokeStyle = '#ffffff'; g.shadowBlur = 8; g.lineWidth = Math.max(1.5, e.r * 0.06); path(e.pts);
        g.restore();
      },
    },
    // 충격파: 두꺼운 링 + 안쪽 섬광
    shock: {
      init(e) { e.life = e.life || 0.7; e.delay = e.delay || 0; e.max = e.max || 3.2; },
      draw(g, e) {
        if (e.t < e.delay) return;
        const k = Math.min(1, (e.t - e.delay) / (e.life - e.delay)), ease = 1 - Math.pow(1 - k, 3);
        const R = e.r * (0.3 + ease * e.max), c = e.color || '#ff3b3b';
        g.save(); g.globalCompositeOperation = 'lighter';
        if (k < 0.35) {
          const gr = g.createRadialGradient(e.x, e.y, 0, e.x, e.y, R);
          gr.addColorStop(0, `rgba(255,255,255,${0.7 * (1 - k / 0.35)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(e.x, e.y, R, 0, 7); g.fill();
        }
        g.globalAlpha = 1 - k; g.strokeStyle = c; g.shadowColor = c; g.shadowBlur = 20;
        g.lineWidth = e.r * 0.42 * (1 - k) + 1; g.beginPath(); g.arc(e.x, e.y, R, 0, 7); g.stroke();
        g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, e.r * 0.08 * (1 - k)); g.beginPath(); g.arc(e.x, e.y, R * 0.96, 0, 7); g.stroke();
        g.restore();
      },
    },
    // 불꽃 파편 (꼬리 있는 섬광 입자)
    burst: {
      init(e) {
        e.life = e.life || 1.1;
        const cols = e.colors || ['#fff4b0', '#ffb347', '#ff4d4d', '#ffffff'];
        e.ps = Array.from({ length: e.n || 60 }, () => {
          const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random() * 1.2) * e.r * (e.speed || 9);
          return { x: e.x, y: e.y, px: e.x, py: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: cols[(Math.random() * cols.length) | 0], w: 1 + Math.random() * 2.5 };
        });
      },
      update(e, dt) { e.ps.forEach(p => { p.px = p.x; p.py = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.9; p.vy = p.vy * 0.9 + e.r * 3 * dt; }); },
      draw(g, e) {
        const k = e.t / e.life;
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.lineCap = 'round';
        e.ps.forEach(p => { g.strokeStyle = p.c; g.lineWidth = p.w; g.beginPath(); g.moveTo(p.px - (p.x - p.px) * 2, p.py - (p.y - p.py) * 2); g.lineTo(p.x, p.y); g.stroke(); });
        g.restore();
      },
    },
    // 왕 주위 마법진 (장군 순간)
    sigil: {
      init(e) { e.life = e.life || 1.2; },
      draw(g, e) {
        const k = e.t / e.life, a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8, R = e.r * (1.5 - 0.3 * k), c = e.color || '#ff3b3b';
        g.save(); g.translate(e.x, e.y); g.rotate(e.t * 2.2); g.globalCompositeOperation = 'lighter';
        g.globalAlpha = a; g.strokeStyle = c; g.shadowColor = c; g.shadowBlur = 16; g.lineWidth = 2.5;
        g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke();
        g.setLineDash([e.r * 0.25, e.r * 0.15]); g.beginPath(); g.arc(0, 0, R * 0.82, 0, 7); g.stroke(); g.setLineDash([]);
        for (let i = 0; i < 6; i++) { const t = i / 6 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(t) * R, Math.sin(t) * R); g.lineTo(Math.cos(t + 2.09) * R, Math.sin(t + 2.09) * R); g.stroke(); }
        g.restore();
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

  /* 지그재그 번개 경로 */
  function jag(x1, y1, x2, y2, depth, amp) {
    let pts = [[x1, y1], [x2, y2]];
    for (let d = 0; d < 5; d++) {
      const out = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i], mx = (ax + bx) / 2, my = (ay + by) / 2;
        const nx = -(by - ay), ny = bx - ax, L = Math.hypot(nx, ny) || 1, o = (Math.random() - 0.5) * amp / (d + 1) * 2;
        out.push([mx + nx / L * o, my + ny / L * o], pts[i]);
      }
      pts = out;
    }
    return pts;
  }
  function branch(pts, r) {
    const out = [];
    for (let k = 0; k < 3; k++) {
      const i = 3 + ((Math.random() * (pts.length - 6)) | 0), [x, y] = pts[i], a = Math.random() * Math.PI * 2, L = r * (0.6 + Math.random());
      out.push(jag(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, 3, r * 0.3).slice(0, 12));
    }
    return out;
  }

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
