/* ============================================================================
 * [기물 보호 마스크]  js/piece-mask.js
 *  환경 효과(구름·안개·눈·낙엽·조명 등)가 장기알을 가리지 않도록, 효과 캔버스에서
 *  현재 판 위의 기물 위치마다 부드러운 구멍을 뚫습니다(destination-out). 판/격자선/말은 그대로 보입니다.
 *  jgPieceMask.carve(ctx, rect)  — ctx: 효과 캔버스(CSS px 좌표계), rect: #cv 의 getBoundingClientRect()
 *  jgPieceMask.strength = 1 (0이면 끔)
 * ============================================================================ */
(function jgPieceMaskModule() {
  if (window.jgPieceMask) return;
  const M = window.jgPieceMask = { strength: 1, enabled: true };
  const hole = document.createElement('canvas'); hole.width = hole.height = 96;
  (function () { const g = hole.getContext('2d'), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.58, 'rgba(0,0,0,1)'); gr.addColorStop(.8, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 96, 96); })();
  /* 장기판 선 지키기: 효과층에서 격자선(가로 10·세로 9·궁성 대각선) 자리만 얇게 지워, 아래 판의 선이 항상 또렷하게 보이게 함.
   *  기물은 판 캔버스에서 선 위에 그려지므로 그대로 선 위에 남음.  끄기: jgPieceMask.lines = false */
  M.lines = true; let LP = null, LK = '';
  M.carveLines = function (g) {
    if (!M.lines || !g) return;
    try {
      if (typeof px !== 'function' || typeof CX !== 'number' || CX < 5) return;
      const cvB = document.getElementById('cv'); if (!cvB) return;
      const rc = cvB.getBoundingClientRect(), cr = g.canvas.getBoundingClientRect(); if (!cr.width || !rc.width) return;
      const sx = g.canvas.width / cr.width, sy = g.canvas.height / cr.height;
      const key = [rc.left, rc.top, rc.width, rc.height, OX, OY, CX, CY, (typeof flip !== 'undefined' && flip) ? 1 : 0].map(v => Math.round(v * 4)).join();
      if (key !== LK) {
        LK = key; LP = new Path2D(); const P = (x, y) => { const p = px(x, y); return [rc.left + p[0], rc.top + p[1]]; }, seg = (a, b) => { LP.moveTo(a[0], a[1]); LP.lineTo(b[0], b[1]); };
        for (let x = 0; x < 9; x++) seg(P(x, 0), P(x, 9));
        for (let y = 0; y < 10; y++) seg(P(0, y), P(8, y));
        [[3, 0, 5, 2], [5, 0, 3, 2], [3, 7, 5, 9], [5, 7, 3, 9]].forEach(([a, b, c, d]) => seg(P(a, b), P(c, d)));
      }
      const w = Math.max(1.6, Math.min(CX, CY) * .05);
      g.save(); g.setTransform(sx, 0, 0, sy, -cr.left * sx, -cr.top * sy); g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round';
      g.globalAlpha = .45; g.lineWidth = w * 2.8; g.stroke(LP); g.globalAlpha = 1; g.lineWidth = w; g.stroke(LP); g.restore();
    } catch (e) {}
  };
  M.carve = function (g, rc, k) {
    if (!M.enabled || M.strength <= 0) return;
    try {
      const board = (typeof B !== 'undefined') ? B : null; if (!board || typeof px !== 'function') return;
      const C = (typeof CX === 'number' && CX > 5) ? Math.min(CX, typeof CY === 'number' ? CY : CX) : 40, D = C * 1.34 * (k || 1);
      g.save(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = Math.min(1, M.strength);
      for (let r = 0; r < board.length; r++) { const row = board[r]; if (!row) continue; for (let c = 0; c < row.length; c++) { if (!row[c]) continue; const p = px(c, r); g.drawImage(hole, rc.left + p[0] - D / 2, rc.top + p[1] - D / 2, D, D); } }
      /* 이동 중인 기물(애니메이션) */
      const A = (typeof anim !== 'undefined') ? anim : null; if (A && A.m && A.cur) { g.drawImage(hole, rc.left + A.cur[0] - D / 2, rc.top + A.cur[1] - D / 2, D, D); }
      g.restore();
    } catch (e) {}
  };
})();
