/* =========================================================
 * 장기 AI — 알파베타 + 반복 심화, 난이도별 실수 확률
 * 난이도 수치는 config.js 의 difficulties 에서 조절
 * ========================================================= */
MJ.AI = (function () {
  const R = MJ.Rules;
  const V = { K: 10000, R: 13, C: 7, H: 5, E: 3, A: 3, P: 2 };
  const KING_CAP = 50000;

  /* 위치 가산점 (초 기준 row; 한은 뒤집어 사용) */
  function posBonus(p, i) {
    const r = Math.floor(i / 9), c = i % 9;
    const adv = p.s === 'cho' ? 9 - r : r; // 전진 정도
    const center = 4 - Math.abs(c - 4);
    switch (p.t) {
      case 'P': return (adv >= 4 ? (adv - 3) * 0.25 : 0) + (adv >= 7 && c >= 3 && c <= 5 ? 0.4 : 0);
      case 'H': return center * 0.06 + (adv >= 3 && adv <= 6 ? 0.2 : 0);
      case 'C': return center * 0.04;
      case 'R': return adv >= 6 ? 0.25 : 0;
      case 'E': return center * 0.03;
      default: return 0;
    }
  }

  function evaluate(b, side) {
    let s = 0;
    for (let i = 0; i < 90; i++) {
      const p = b[i];
      if (!p) continue;
      const v = V[p.t] + posBonus(p, i);
      s += p.s === side ? v : -v;
    }
    s += side === 'han' ? MJ.CONFIG.hanBonus : -MJ.CONFIG.hanBonus;
    return s;
  }

  function order(ms) {
    return ms.sort((a, b) => (b.cap ? V[b.cap.t] * 10 : 0) - (a.cap ? V[a.cap.t] * 10 : 0));
  }

  let deadline = 0, nodes = 0;
  const ABORT = {};

  function negamax(b, side, depth, alpha, beta) {
    if ((++nodes & 1023) === 0 && performance.now() > deadline) throw ABORT;
    if (depth === 0) return quiesce(b, side, alpha, beta, 3);
    const ms = order(R.genMoves(b, side));
    if (!ms.length) return -999;
    let best = -Infinity;
    for (const m of ms) {
      if (m.cap && m.cap.t === 'K') return KING_CAP + depth;
      R.make(b, m);
      const sc = -negamax(b, MJ.other(side), depth - 1, -beta, -alpha);
      R.unmake(b, m);
      if (sc > best) best = sc;
      if (sc > alpha) alpha = sc;
      if (alpha >= beta) break;
    }
    return best;
  }

  /* 잡기 수만 조금 더 읽어 수평선 효과 완화 */
  function quiesce(b, side, alpha, beta, qd) {
    const stand = evaluate(b, side);
    if (qd === 0) return stand;
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    const caps = order(R.genMoves(b, side).filter(m => m.cap));
    for (const m of caps) {
      if (m.cap.t === 'K') return KING_CAP;
      R.make(b, m);
      const sc = -quiesce(b, MJ.other(side), -beta, -alpha, qd - 1);
      R.unmake(b, m);
      if (sc >= beta) return sc;
      if (sc > alpha) alpha = sc;
    }
    return alpha;
  }

  /* 메인: 최선수 반환 (없으면 null = 한수쉼) */
  function think(board, side, diffKey) {
    const D = MJ.CONFIG.difficulties[diffKey] || MJ.CONFIG.difficulties.normal;
    const b = board.slice();
    const legal = R.legalMoves(b, side);
    if (!legal.length) return null;

    deadline = performance.now() + D.timeMs;
    nodes = 0;
    let scored = legal.map(m => ({ m, s: 0 }));
    for (let d = 1; d <= D.depth; d++) {
      try {
        const next = [];
        let alpha = -Infinity;
        // 이전 깊이 결과 순으로 탐색(가지치기 효율)
        for (const it of scored) {
          R.make(b, it.m);
          const s = -negamax(b, MJ.other(side), d - 1, -Infinity, -alpha + 0.001);
          R.unmake(b, it.m);
          next.push({ m: it.m, s });
          if (s > alpha) alpha = s;
        }
        scored = next.sort((x, y) => y.s - x.s);
      } catch (e) {
        if (e !== ABORT) throw e;
        break;
      }
    }
    // 동점 다양화 + 난이도별 흔들기
    scored.forEach(it => { it.s += (Math.random() - 0.5) * D.jitter; });
    scored.sort((x, y) => y.s - x.s);

    if (D.blunder > 0 && Math.random() < D.blunder && scored.length > 1) {
      // 실수: 상위 몇 개 중 하나 (단, 왕을 바로 내주는 수는 피함)
      const pool = scored.slice(1, Math.min(scored.length, diffKey === 'easy' ? 8 : 3))
        .filter(it => it.s > -KING_CAP / 2);
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)].m;
    }
    return scored[0].m;
  }

  return { think, evaluate };
})();
