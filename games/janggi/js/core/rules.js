/* =========================================================
 * 장기 규칙 엔진
 * 판: 길이 90 배열 (index = row*9 + col), row 0 = 위(한), row 9 = 아래(초)
 * 기물: { s:'cho'|'han', t:'K'|'R'|'C'|'H'|'E'|'A'|'P', id:number }
 * 수:   { from, to, cap(잡힌 기물 또는 null) }
 * ========================================================= */
MJ.Rules = (function () {
  const W = 9, H = 10;
  const idx = (r, c) => r * W + c;
  const rc = i => [Math.floor(i / W), i % W];
  const inB = (r, c) => r >= 0 && r < H && c >= 0 && c < W;

  /* 궁성 */
  const PALACE = new Set([3, 4, 5, 12, 13, 14, 21, 22, 23, 66, 67, 68, 75, 76, 77, 84, 85, 86]);
  const DIAG = { 3: [13], 5: [13], 21: [13], 23: [13], 13: [3, 5, 21, 23],
                 66: [76], 68: [76], 84: [76], 86: [76], 76: [66, 68, 84, 86] };
  const DIAG_LINES = [[3, 13, 23], [5, 13, 21], [66, 76, 86], [68, 76, 84]];
  const palaceOf = i => (i < 45 ? 'top' : 'bottom');

  let uid = 1;
  function P(s, t) { return { s, t, id: uid++ }; }

  /* 스킬 상태효과: frozen(움직일 수 없음), shield(잡을 수 없음) — 기물 id 집합 */
  const fx = { frozen: new Set(), shield: new Set() };
  function setFx(frozen, shield) { fx.frozen = new Set(frozen || []); fx.shield = new Set(shield || []); }
  const capOk = q => !fx.shield.has(q.id);

  /* 포진 배치. form 은 자기 진영 시점 왼쪽→오른쪽 */
  function createBoard(choForm, hanForm) {
    const F = MJ.CONFIG.formations;
    uid = 1; // 매 판 같은 id → 멀티/이어하기 동기화
    const b = new Array(90).fill(null);
    const back = (row, side, form) => {
      const f = F[form] || F['마상마상'];
      const cols = side === 'cho' ? [1, 2, 6, 7] : [7, 6, 2, 1]; // 한은 반대편에서 바라봄
      b[idx(row, 0)] = P(side, 'R'); b[idx(row, 8)] = P(side, 'R');
      b[idx(row, 3)] = P(side, 'A'); b[idx(row, 5)] = P(side, 'A');
      cols.forEach((c, k) => { b[idx(row, c)] = P(side, f[k]); });
    };
    back(0, 'han', hanForm);
    b[idx(1, 4)] = P('han', 'K');
    b[idx(2, 1)] = P('han', 'C'); b[idx(2, 7)] = P('han', 'C');
    [0, 2, 4, 6, 8].forEach(c => { b[idx(3, c)] = P('han', 'P'); });
    back(9, 'cho', choForm);
    b[idx(8, 4)] = P('cho', 'K');
    b[idx(7, 1)] = P('cho', 'C'); b[idx(7, 7)] = P('cho', 'C');
    [0, 2, 4, 6, 8].forEach(c => { b[idx(6, c)] = P('cho', 'P'); });
    b.forEach((p, i) => { if (p) p.home = i; });
    return b;
  }

  /* 의사 합법수(왕 안전 미검사) */
  function genMoves(b, side, out) {
    out = out || [];
    for (let i = 0; i < 90; i++) {
      const p = b[i];
      if (p && p.s === side && !fx.frozen.has(p.id)) genPiece(b, i, p, out);
    }
    return out;
  }

  function push(b, out, from, to, side) {
    const q = b[to];
    if (q && (q.s === side || !capOk(q))) return false;
    out.push({ from, to, cap: q });
    return true;
  }

  function genPiece(b, i, p, out) {
    const [r, c] = rc(i);
    const side = p.s;
    switch (p.t) {
      case 'K': case 'A': {
        const pal = palaceOf(i);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (!inB(nr, nc)) return;
          const j = idx(nr, nc);
          if (PALACE.has(j) && palaceOf(j) === pal) push(b, out, i, j, side);
        });
        (DIAG[i] || []).forEach(j => push(b, out, i, j, side));
        break;
      }
      case 'R': {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc;
          while (inB(nr, nc)) {
            const j = idx(nr, nc);
            if (b[j]) { if (b[j].s !== side && capOk(b[j])) out.push({ from: i, to: j, cap: b[j] }); break; }
            out.push({ from: i, to: j, cap: null });
            nr += dr; nc += dc;
          }
        });
        DIAG_LINES.forEach(line => {
          const k = line.indexOf(i);
          if (k < 0) return;
          [-1, 1].forEach(d => {
            let m = k + d;
            while (m >= 0 && m < 3) {
              const j = line[m];
              if (b[j]) { if (b[j].s !== side && capOk(b[j])) out.push({ from: i, to: j, cap: b[j] }); break; }
              out.push({ from: i, to: j, cap: null });
              m += d;
            }
          });
        });
        break;
      }
      case 'C': {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc, jumped = false;
          while (inB(nr, nc)) {
            const j = idx(nr, nc), q = b[j];
            if (!jumped) {
              if (q) { if (q.t === 'C') break; jumped = true; }
            } else {
              if (q) { if (q.t !== 'C' && q.s !== side && capOk(q)) out.push({ from: i, to: j, cap: q }); break; }
              out.push({ from: i, to: j, cap: null });
            }
            nr += dr; nc += dc;
          }
        });
        DIAG_LINES.forEach(line => {
          const k = line.indexOf(i);
          if (k !== 0 && k !== 2) return;
          const mid = b[line[1]], j = line[2 - k], q = b[j];
          if (mid && mid.t !== 'C' && (!q || (q.s !== side && q.t !== 'C' && capOk(q)))) out.push({ from: i, to: j, cap: q });
        });
        break;
      }
      case 'H': {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          const mr = r + dr, mc = c + dc;
          if (!inB(mr, mc) || b[idx(mr, mc)]) return;
          const opts = dr ? [[r + 2 * dr, c - 1], [r + 2 * dr, c + 1]] : [[r - 1, c + 2 * dc], [r + 1, c + 2 * dc]];
          opts.forEach(([tr, tc]) => { if (inB(tr, tc)) push(b, out, i, idx(tr, tc), side); });
        });
        break;
      }
      case 'E': {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          const mr = r + dr, mc = c + dc;
          if (!inB(mr, mc) || b[idx(mr, mc)]) return;
          const diags = dr ? [[dr, -1], [dr, 1]] : [[-1, dc], [1, dc]];
          diags.forEach(([ddr, ddc]) => {
            const m2r = mr + ddr, m2c = mc + ddc;
            if (!inB(m2r, m2c) || b[idx(m2r, m2c)]) return;
            const tr = m2r + ddr, tc = m2c + ddc;
            if (inB(tr, tc)) push(b, out, i, idx(tr, tc), side);
          });
        });
        break;
      }
      case 'P': {
        const f = side === 'cho' ? -1 : 1;
        [[f, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (inB(nr, nc)) push(b, out, i, idx(nr, nc), side);
        });
        (DIAG[i] || []).forEach(j => { if (rc(j)[0] === r + f) push(b, out, i, j, side); });
        break;
      }
    }
  }

  function findKing(b, side) {
    for (let i = 0; i < 90; i++) { const p = b[i]; if (p && p.t === 'K' && p.s === side) return i; }
    return -1;
  }

  function inCheck(b, side) {
    const k = findKing(b, side);
    if (k < 0) return true;
    const ms = genMoves(b, MJ.other(side));
    for (let n = 0; n < ms.length; n++) if (ms[n].to === k) return true;
    return false;
  }

  function make(b, m) { b[m.to] = b[m.from]; b[m.from] = null; }
  function unmake(b, m) { b[m.from] = b[m.to]; b[m.to] = m.cap; }

  function legalMoves(b, side) {
    return genMoves(b, side).filter(m => { make(b, m); const ok = !inCheck(b, side); unmake(b, m); return ok; });
  }
  function legalFrom(b, side, from) { return legalMoves(b, side).filter(m => m.from === from); }

  function material(b, side) {
    let s = side === 'han' ? MJ.CONFIG.hanBonus : 0;
    b.forEach(p => { if (p && p.s === side) s += MJ.CONFIG.pieceValues[p.t]; });
    return s;
  }

  return { W, H, idx, rc, inB, PALACE, DIAG, createBoard, setFx, fx, genMoves, legalMoves, legalFrom,
           inCheck, findKing, make, unmake, material };
})();
