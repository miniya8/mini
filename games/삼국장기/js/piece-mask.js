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
