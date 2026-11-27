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
]);
