/* ============================================================================
 * [기물 표시 다듬기 v16]  js/piece-polish-v16.js
 *  기물을 골랐을 때 '갈 수 있는 자리' 표시를 새로 그립니다 (piece-animation.js 의 표시 루프에서 호출).
 *   · 빈자리: 진영 색으로 숨 쉬는 빛 구슬 + 바깥으로 번지는 물결 고리 (자리마다 박자가 조금씩 어긋남)
 *   · 잡을 수 있는 적: 붉은 빛 + 회전하는 점선 고리 + 조여드는 조준 꺾쇠 4개
 *   · 고른 기물에서 각 자리로 아주 옅은 빛줄기
 *  빛 구슬은 진영 색별로 한 번만 만들어 두고 복사만 해서 가볍습니다.
 *  끄기: jgPiecePolish.enabled = false  (원래 초록 점 표시로 돌아감)
 * ============================================================================ */
(function jgPiecePolish16() {
  if (window.jgPiecePolish) return;
  const PP = window.jgPiecePolish = { enabled: true };
  const orbs = {};
  function orb(rgb) {
    if (orbs[rgb]) return orbs[rgb];
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, `rgba(${rgb},.95)`); gr.addColorStop(.45, `rgba(${rgb},.35)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return (orbs[rgb] = c);
  }
  const SIDE = { c: '90,240,200', h: '255,150,110' };
  window.jgDrawMoveHints = function (g, sel, now) {
    if (!PP.enabled || !sel || !sel.L) return false;
    const Cc = (typeof C === 'number' && C > 2) ? C : 30, p0 = px(sel.x, sel.y), me2 = (typeof B !== 'undefined' && B[sel.y] && B[sel.y][sel.x]) ? B[sel.y][sel.x].s : 'c', rgb = SIDE[me2] || SIDE.c, o = orb(rgb), oR = orb('255,70,60');
    g.save();
    /* 고른 기물에서 각 자리로 옅은 빛줄기 */
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const m of sel.L) { const [X, Y] = px(m[2], m[3]), cap = !!B[m[3]][m[2]]; const gr = g.createLinearGradient(p0[0], p0[1], X, Y); gr.addColorStop(0, `rgba(${cap ? '255,90,80' : rgb},0)`); gr.addColorStop(1, `rgba(${cap ? '255,90,80' : rgb},.22)`); g.strokeStyle = gr; g.lineWidth = Math.max(1.5, Cc * .06); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(X, Y); g.stroke(); }
    for (const m of sel.L) {
      const [X, Y] = px(m[2], m[3]), cap = !!B[m[3]][m[2]], ph = now / 1000 * 1.3 + (m[2] * .37 + m[3] * .53), pu = .5 + .5 * Math.sin(ph * Math.PI * 2);
      if (!cap) {
        const z = Cc * (.78 + .14 * pu); g.globalAlpha = 1; g.drawImage(o, X - z / 2, Y - z / 2, z, z);
        const rq = (ph % 1); g.globalAlpha = (1 - rq) * .9; g.strokeStyle = `rgb(${rgb})`; g.lineWidth = Math.max(1.2, Cc * .035); g.beginPath(); g.arc(X, Y, Cc * (.16 + .3 * rq), 0, Math.PI * 2); g.stroke();
      } else {
        const z = Cc * (1.3 + .15 * pu); g.globalAlpha = .7; g.drawImage(oR, X - z / 2, Y - z / 2, z, z);
        g.save(); g.translate(X, Y); g.rotate(now / 700); g.globalAlpha = .85 + .15 * pu; g.strokeStyle = 'rgb(255,110,95)'; g.lineWidth = Math.max(1.8, Cc * .05); g.setLineDash([Cc * .16, Cc * .1]); g.beginPath(); g.arc(0, 0, Cc * .5, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.restore();
        const r = Cc * (.62 - .08 * pu), L = Cc * .2; g.globalAlpha = 1; g.strokeStyle = 'rgb(255,215,200)'; g.lineWidth = Math.max(2, Cc * .06);
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.moveTo(X + sx * r, Y + sy * (r - L)); g.lineTo(X + sx * r, Y + sy * r); g.lineTo(X + sx * (r - L), Y + sy * r); g.stroke(); });
      }
    }
    g.restore(); return true;
  };
})();
