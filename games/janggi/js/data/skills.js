/* =========================================================
 * 스킬 데이터
 * ---------------------------------------------------------
 * 규칙 (config.js 의 MJ.CONFIG.skills 에서 변경)
 *  - 꾸미기에서 4개 장착
 *  - 30수 · 60수 · 90수 · 120수가 될 때마다 스킬 1회 충전 (전체 수 기준)
 *  - 내 차례에, 수를 두기 전에 사용 (차례 소모 없음, 한 차례에 1개)
 *  - 장착한 스킬은 한 판에 각각 1번씩
 *
 * 스킬 만들기
 *  id, name, icon(이모지), color, desc
 *  icon 이미지를 쓰려면 assets/images/skills/{id}.png 를 넣으면 자동 적용
 *  target : 'none'     바로 발동
 *           'own'      내 기물 1개 선택      → args = { idx }
 *           'enemy'    상대 기물 1개 선택    → args = { idx }
 *           'own2'     내 기물 2개 선택      → args = { a, b }
 *           'captured' 잡힌 내 기물 선택     → args = { pieceId }
 *           'ownEmpty' 내 기물 1개 → 빈 칸 1개 선택 → args = { a, b }  (filter2(ctx, idx, a) 로 빈 칸 조건)
 *  filter(ctx, idx)   선택 가능한 칸 조건 (own/enemy/own2)
 *  canUse(ctx)        true 또는 사용 불가 이유(문자열)
 *  apply(ctx, args)   효과 적용. 되돌리기용 데이터를 return
 *  undo(ctx, data, args)  무르기 때 되돌림 (상태효과는 자동으로 지워짐)
 *  ai(ctx)            AI 가 쓸 때의 args (안 쓰면 null)
 *
 * ctx 도구: side, opp, board, ply, R, pieceAt(i), cells(side, fn), attacked(i),
 *          addEffect('shield'|'freeze', idx, 지속 수), captured(), place(piece, idx),
 *          remove(idx), extraMove(on), fxAt(type, idx, opts), shake(n), legalAfter(fn)
 * ========================================================= */
MJ.register('skill', [
  {
    id: 'shield', name: '철벽 방어', icon: '🛡️', color: '#4fb3ff',
    desc: '내 기물 하나를 상대의 다음 2턴 동안 잡히지 않게 보호해요. (궁 제외)',
    target: 'own',
    filter: (ctx, i) => ctx.pieceAt(i).t !== 'K',
    apply(ctx, a) { ctx.addEffect('shield', a.idx, 4); ctx.fxAt('ring', a.idx, { color: '#4fb3ff', life: 0.9 }); },
    ai(ctx) {
      let best = null, bv = 4;
      ctx.cells(ctx.side, p => p.t !== 'K').forEach(i => {
        const v = MJ.CONFIG.pieceValues[ctx.pieceAt(i).t];
        if (v > bv && ctx.attacked(i)) { bv = v; best = i; }
      });
      return best == null ? null : { idx: best };
    },
  },
  {
    id: 'freeze', name: '빙결 봉인', icon: '❄️', color: '#9be8ff',
    desc: '상대 기물 하나를 상대의 다음 2턴 동안 움직이지 못하게 얼려요. (궁 제외)',
    target: 'enemy',
    filter: (ctx, i) => ctx.pieceAt(i).t !== 'K',
    apply(ctx, a) { ctx.addEffect('freeze', a.idx, 4); ctx.fxAt('sparks', a.idx, { color: '#bff4ff', n: 30 }); },
    ai(ctx) {
      let best = null, bv = 4;
      ctx.cells(ctx.opp, p => p.t !== 'K').forEach(i => {
        const v = MJ.CONFIG.pieceValues[ctx.pieceAt(i).t];
        if (v > bv) { bv = v; best = i; }
      });
      return best == null ? null : { idx: best };
    },
  },
  {
    id: 'revive', name: '부활', icon: '💫', color: '#ffd36b',
    desc: '잡힌 내 기물 하나를 처음 자리로 되살려요. (그 자리가 비어 있어야 함)',
    target: 'captured',
    canUse: ctx => (ctx.captured().length ? true : '되살릴 수 있는 기물이 없어요'),
    apply(ctx, a) {
      const c = ctx.captured().find(x => x.piece.id === a.pieceId);
      if (!c) return null;
      ctx.place(c.piece, c.piece.home);
      ctx.fxAt('ring', c.piece.home, { color: '#ffd36b', life: 1 });
      ctx.fxAt('sparks', c.piece.home, { color: '#fff3b0', n: 26 });
      return { idx: c.piece.home };
    },
    undo(ctx, d) { if (d) ctx.remove(d.idx); },
    ai(ctx) {
      const list = ctx.captured().sort((x, y) => MJ.CONFIG.pieceValues[y.piece.t] - MJ.CONFIG.pieceValues[x.piece.t]);
      return list.length && MJ.CONFIG.pieceValues[list[0].piece.t] >= 3 ? { pieceId: list[0].piece.id } : null;
    },
  },
  {
    id: 'swap', name: '위치 교환', icon: '🔄', color: '#c38bff',
    desc: '내 기물 두 개의 자리를 서로 바꿔요. (궁·사 제외, 내 궁이 장군 받게 되면 불가)',
    target: 'own2',
    filter: (ctx, i) => !'KA'.includes(ctx.pieceAt(i).t),
    valid: (ctx, a) => ctx.legalAfter(b => { const t = b[a.a]; b[a.a] = b[a.b]; b[a.b] = t; }),
    apply(ctx, a) {
      const b = ctx.board, t = b[a.a]; b[a.a] = b[a.b]; b[a.b] = t;
      ctx.fxAt('ring', a.a, { color: '#c38bff' }); ctx.fxAt('ring', a.b, { color: '#c38bff' });
      return a;
    },
    undo(ctx, d) { const b = ctx.board, t = b[d.a]; b[d.a] = b[d.b]; b[d.b] = t; },
    ai: () => null,
  },
  {
    id: 'haste', name: '질풍 연속', icon: '⚡', color: '#ffe14d',
    desc: '이번 차례에 한 수를 더 둬요. (첫 수로 장군을 부르면 추가 수는 사라짐)',
    target: 'none',
    apply(ctx) { ctx.extraMove(true); },
    undo(ctx) { ctx.extraMove(false); },
    ai(ctx) { return ctx.anyCapture() ? {} : null; },
  },
  /* ---------- 추가 스킬 ---------- */
  {
    id: 'teleport', name: '순간 이동', icon: '🌀', color: '#7ad7ff',
    desc: '내 기물 하나를 우리 진영 쪽 빈 칸으로 순간 이동시켜요. (궁·사 제외, 내 궁이 위험해지면 불가)',
    target: 'ownEmpty',
    filter: (ctx, i) => !'KA'.includes(ctx.pieceAt(i).t),
    // 우리 진영 절반(초: 아래 5줄, 한: 위 5줄)의 빈 칸
    filter2: (ctx, i) => !ctx.pieceAt(i) && (ctx.side === 'cho' ? Math.floor(i / 9) >= 5 : Math.floor(i / 9) <= 4),
    valid: (ctx, a) => ctx.legalAfter(b => { b[a.b] = b[a.a]; b[a.a] = null; }),
    apply(ctx, a) {
      const b = ctx.board; b[a.b] = b[a.a]; b[a.a] = null;
      ctx.fxAt('ring', a.a, { color: '#7ad7ff', life: 0.7 }); ctx.fxAt('sparks', a.b, { color: '#bdf0ff', n: 24 });
      return a;
    },
    undo(ctx, d) { const b = ctx.board; b[d.a] = b[d.b]; b[d.b] = null; },
    ai: () => null,
  },
  {
    id: 'purify', name: '정화', icon: '✨', color: '#fff6b0',
    desc: '내 기물에 걸린 빙결과 상대 기물의 철벽 방어를 모두 없애요.',
    target: 'none',
    canUse: ctx => (ctx.effects().some(e => (e.type === 'freeze' && e.victim === ctx.side) || (e.type === 'shield' && e.side !== ctx.side)) ? true : '없앨 효과가 없어요'),
    apply(ctx) {
      const gone = ctx.removeEffects(e => (e.type === 'freeze' && e.victim === ctx.side) || (e.type === 'shield' && e.side !== ctx.side));
      ctx.flash('#fff6b0');
      return { gone };
    },
    undo(ctx, d) { ctx.restoreEffects(d.gone); },
    ai: ctx => (ctx.effects().some(e => e.type === 'freeze' && e.victim === ctx.side) ? {} : null),
  },
  {
    id: 'rally', name: '진격 나팔', icon: '📯', color: '#ffb347',
    desc: '앞이 비어 있는 내 졸·병이 모두 한 칸씩 전진해요. (내 궁이 위험해지면 그 졸은 멈춤)',
    target: 'none',
    canUse: ctx => (ctx.rallyMoves().length ? true : '전진할 수 있는 졸이 없어요'),
    apply(ctx) {
      const mv = ctx.rallyMoves();
      mv.forEach(([f, t]) => { ctx.board[t] = ctx.board[f]; ctx.board[f] = null; ctx.fxAt('ring', t, { color: '#ffb347', life: 0.6 }); });
      return { mv };
    },
    undo(ctx, d) { d.mv.slice().reverse().forEach(([f, t]) => { ctx.board[f] = ctx.board[t]; ctx.board[t] = null; }); },
    ai: ctx => (ctx.rallyMoves().length >= 3 ? {} : null),
  },
  {
    id: 'barrier', name: '궁성 결계', icon: '🏯', color: '#9ab8ff',
    desc: '우리 궁성 안의 내 기물(궁 제외)을 상대의 다음 2턴 동안 모두 보호해요.',
    target: 'none',
    canUse: ctx => (ctx.palaceGuards().length ? true : '궁성 안에 보호할 기물이 없어요'),
    apply(ctx) { ctx.palaceGuards().forEach(i => { ctx.addEffect('shield', i, 4); ctx.fxAt('ring', i, { color: '#9ab8ff', life: 0.8 }); }); },
    ai: ctx => (ctx.palaceGuards().some(i => ctx.attacked(i)) ? {} : null),
  },
  {
    id: 'firebomb', name: '화공', icon: '🔥', color: '#ff6a3d',
    desc: '상대 졸·병 하나를 불태워 없애요.',
    target: 'enemy',
    filter: (ctx, i) => ctx.pieceAt(i).t === 'P',
    apply(ctx, a) {
      const p = ctx.pieceAt(a.idx); ctx.remove(a.idx);
      ctx.fxAt('sparks', a.idx, { color: '#ff8a3d', n: 36 }); ctx.fxAt('ring', a.idx, { color: '#ff3d2d', life: 0.8 }); ctx.shake(10);
      return { idx: a.idx, p };
    },
    undo(ctx, d) { ctx.place(d.p, d.idx); },
    ai(ctx) {
      // 가장 많이 전진한 상대 졸
      let best = null, bv = -1;
      ctx.cells(ctx.opp, p => p.t === 'P').forEach(i => {
        const r = Math.floor(i / 9), adv = ctx.opp === 'cho' ? 9 - r : r;
        if (adv > bv) { bv = adv; best = i; }
      });
      return best == null ? null : { idx: best };
    },
  },
]);
