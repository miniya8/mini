/* =========================================================
 * 게임 진행 컨트롤러
 * 모드: 'ai' (컴퓨터), 'local' (한 기기 2인), 'online' (멀티 대전)
 * ========================================================= */
MJ.Game = (function () {
  const R = MJ.Rules;
  const $ = s => document.querySelector(s);
  let rd = null, st = null, timerId = null, bubbleT = {};

  const settings = () => MJ.Store.get().settings;
  const myLoadout = () => MJ.Store.get().loadout;
  const lo = () => (st && st.loadout) || myLoadout();
  const king = side => MJ.Registry.get('king', lo().kings[side]) || MJ.Registry.first('king');
  const pick = arr => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : '');
  const sideName = s => MJ.CONFIG.sides[s].name;

  /* ---- 휴대폰: 진동 / 화면 꺼짐 방지 / 이어하기 저장 ---- */
  function buzz(p) { if (settings().vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }
  let wake = null;
  async function keepAwake(on) {
    try {
      if (on && settings().wakeLock && 'wakeLock' in navigator && !wake) {
        wake = await navigator.wakeLock.request('screen');
        wake.addEventListener('release', () => { wake = null; });
      } else if (!on && wake) { await wake.release(); wake = null; }
    } catch (e) { wake = null; }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && st && !st.over && MJ.UI.current() === 'game') keepAwake(true); });
  function saveResume() {
    if (!st || st.mode === 'online') return;
    const S = MJ.Store.get();
    S.resume = st.over ? null : { setup: Object.assign({}, st.setup, { forms: st.forms }), moves: moveList(), ply: st.ply, at: Date.now() };
    MJ.Store.save();
  }

  function init() {
    rd = new MJ.Renderer($('#gameCanvas'), { particles: true, pad: 0.56 });
    MJ.__gameRd = rd; // 디버그·확장용
    const cv = $('#gameCanvas');
    cv.addEventListener('pointerdown', e => {
      const r = cv.getBoundingClientRect();
      onTap(rd.hit(e.clientX - r.left, e.clientY - r.top));
    });
    MJ.on('screen', n => {
      keepAwake(n === 'game' && st && !st.over);
      if (n !== 'game') return;
      rd.setBoardDef(MJ.Registry.get('board', myLoadout().board));
      if (st && st.mode !== 'online') st.loadout = myLoadout();
      rd.state.loadout = lo(); rd.resize(); hud();
    });
    MJ.on('resize', () => rd.resize());
    // 이미지 장기판은 이미지 비율에 맞춰 판 영역 크기 조정
    MJ.on('board-layout', r => {
      if (r !== rd) return;
      const wrap = $('#gameCanvas').parentElement, a = rd.aspect().toFixed(4);
      if (wrap.dataset.aspect !== a) { wrap.dataset.aspect = a; wrap.style.aspectRatio = a; requestAnimationFrame(() => rd.resize()); }
    });
    MJ.on('loadout', () => { if (st && st.mode !== 'online') { st.loadout = myLoadout(); rd.state.loadout = lo(); } });
  }

  /* 온라인: 내 진영은 내 꾸미기, 상대 진영은 상대 꾸미기 */
  function mergeLoadout(mySide, opp) {
    const me = myLoadout(), o = MJ.other(mySide);
    const out = { board: me.board, kings: {}, skins: {} };
    out.kings[mySide] = me.kings[mySide]; out.skins[mySide] = Object.assign({}, me.skins[mySide]);
    out.kings[o] = (opp && opp.kings && opp.kings[o]) || me.kings[o];
    out.skins[o] = Object.assign({}, me.skins[o], (opp && opp.skins && opp.skins[o]) || {});
    return out;
  }

  /* ---------- 시작 ----------
   * setup: { mode, mySide, diff, myForm, oppForm, time, forms?, oppLoadout?, oppNick?, myNick? }
   * opts : { replay: [moves] }  (재접속 동기화) */
  function start(setup, opts) {
    opts = opts || {};
    const forms = Object.keys(MJ.CONFIG.formations);
    const mySide = setup.mode === 'local' ? 'cho' : setup.mySide;
    let F = setup.forms;
    if (!F) {
      const opp = setup.oppForm === 'random' ? forms[Math.floor(Math.random() * forms.length)] : setup.oppForm;
      F = mySide === 'cho' ? { cho: setup.myForm, han: opp } : { cho: opp, han: setup.myForm };
    }
    stopTimer();
    inbox = [];
    st = {
      setup: Object.assign({}, setup), mode: setup.mode, mySide, aiSide: setup.mode === 'ai' ? MJ.other(mySide) : null,
      diff: setup.diff, board: R.createBoard(F.cho, F.han), turn: 'cho', history: [], over: false,
      thinking: false, ply: 0, timeLeft: setup.time, forms: F, waitingUndo: false, rematch: {},
      loadout: setup.mode === 'online' ? mergeLoadout(mySide, setup.oppLoadout) : myLoadout(),
      nicks: { [mySide]: setup.myNick || '나', [MJ.other(mySide)]: setup.oppNick || '상대' },
      effects: [], extra: { cho: 0, han: 0 }, skillPly: -1, targeting: null,
    };
    st.skills = { cho: { eq: skillSet('cho', mySide, setup), used: [] }, han: { eq: skillSet('han', mySide, setup), used: [] } };
    refreshFx();
    Object.assign(rd.state, { board: st.board, view: mySide, selected: -1, targets: [], lastMove: null, checkIdx: -1, loadout: st.loadout, skillTargets: null });
    document.querySelectorAll('.pcard').forEach(el => { el.dataset.key = ''; });
    MJ.UI.show('game');

    if (opts.replay && opts.replay.length) {
      opts.replay.forEach(mv => applySilent(mv));
      MJ.UI.toast('🔄 대국을 이어서 진행합니다');
    } else {
      MJ.UI.banner('대국 시작!', `초 ${F.cho}  vs  한 ${F.han}`, '#ffcf5a');
      setTimeout(() => say('cho', 'select'), 900);
    }
    keepAwake(true);
    startTurn();
  }

  /* 애니메이션 없이 수 적용 (동기화용) */
  function applySilent(mv) {
    if (mv.s) { useSkill(st.turn, mv.s, mv.a, { remote: true, silent: true }); return; }
    const mover = st.turn;
    if (mv.p) { st.history.push({ pass: true, side: st.turn, prevLast: rd.state.lastMove, prevCheck: -1 }); st.turn = MJ.other(st.turn); st.ply++; refreshFx(); }
    else {
      const m = R.legalFrom(st.board, st.turn, mv.f).find(x => x.to === mv.t);
      if (!m) return;
      st.history.push({ m, side: st.turn, prevLast: rd.state.lastMove, prevCheck: rd.state.checkIdx });
      R.make(st.board, m); rd.state.lastMove = m;
      advanceTurn(mover);
    }
    rd.state.checkIdx = R.inCheck(st.board, st.turn) ? R.findKing(st.board, st.turn) : -1;
  }
  function moveList() {
    return st ? st.history.map(h => (h.skill ? { s: h.skill, a: h.args } : h.pass ? { p: 1 } : { f: h.m.from, t: h.m.to })) : [];
  }

  /* 수를 둔 뒤 차례 넘기기 (질풍 연속이면 같은 쪽이 한 번 더) */
  function advanceTurn(mover) {
    const opp = MJ.other(mover);
    st.ply++;
    const h = st.history[st.history.length - 1];
    let kept = false;
    if (st.extra[mover]) {
      st.extra[mover] = 0; h.extraUsed = true;
      if (!R.inCheck(st.board, opp)) kept = true;
    }
    st.turn = kept ? mover : opp;
    refreshFx();
    return kept;
  }

  /* ================= 스킬 ================= */
  const SK = () => MJ.CONFIG.skills;
  function skillSet(side, mySide, setup) {
    const mine = (myLoadout().skills || []).slice();
    if (setup.mode === 'local') return mine;
    if (setup.mode === 'ai') return side === mySide ? mine : SK().aiDefault.slice();
    return side === mySide ? mine : ((setup.oppLoadout && setup.oppLoadout.skills) || []).slice();
  }
  function charges(side) {
    const earned = SK().milestones.filter(m => st.ply >= m).length;
    return Math.max(0, earned - st.skills[side].used.length);
  }
  function nextMilestone() { return SK().milestones.find(m => st.ply < m); }
  function refreshFx() {
    if (!st) return;
    const live = st.effects.filter(e => st.ply < e.until);
    const freeze = live.filter(e => e.type === 'freeze').map(e => e.id);
    const shield = live.filter(e => e.type === 'shield').map(e => e.id);
    R.setFx(freeze, shield);
    const marks = new Map();
    live.forEach(e => { const m = marks.get(e.id) || {}; m[e.type] = Math.ceil((e.until - st.ply) / 2); marks.set(e.id, m); });
    rd.state.marks = marks;
  }
  function revivedIds() { return new Set(st.history.filter(h => h.skill === 'revive' && h.args).map(h => h.args.pieceId)); }
  function makeCtx(side, entry) {
    const board = st.board, opp = MJ.other(side);
    const ctx = {
      side, opp, board, ply: st.ply, R, st,
      pieceAt: i => board[i],
      cells: (s, f) => board.map((p, i) => (p && p.s === s && (!f || f(p, i)) ? i : -1)).filter(i => i >= 0),
      attacked: i => R.genMoves(board, MJ.other(board[i].s)).some(m => m.to === i),
      anyCapture: () => R.legalMoves(board, side).some(m => m.cap),
      addEffect: (type, idx, plies) => { const e = { type, id: board[idx].id, until: st.ply + plies, side }; st.effects.push(e); entry && entry.effects.push(e); },
      captured: () => {
        const rv = revivedIds();
        return st.history.filter(h => h.m && h.m.cap && h.m.cap.s === side && !rv.has(h.m.cap.id))
          .map(h => ({ piece: h.m.cap })).filter(c => c.piece.home != null && !board[c.piece.home]);
      },
      place: (p, i) => { board[i] = p; },
      remove: i => { board[i] = null; },
      extraMove: on => { st.extra[side] = on ? 1 : 0; },
      fxAt: (t, i, o) => rd.fxAt(t, i, o),
      shake: n => rd.shake(n),
      legalAfter: fn => { const b = board.slice(); fn(b); return !R.inCheck(b, side); },
    };
    return ctx;
  }
  function skillTargets(side, def) {
    const ctx = makeCtx(side);
    const who = def.target === 'enemy' ? MJ.other(side) : side;
    return ctx.cells(who, (p, i) => !def.filter || def.filter(ctx, i));
  }
  /* 사용 가능 여부: true 또는 이유 */
  function canUseSkill(side, id) {
    if (!st || st.over) return '대국 중이 아니에요';
    const def = MJ.Registry.get('skill', id);
    if (!def) return '없는 스킬';
    const S = st.skills[side];
    if (!S.eq.includes(id)) return '장착하지 않은 스킬';
    if (S.used.includes(id)) return '이미 사용했어요';
    if (SK().mode === 'slot') { const k = S.eq.indexOf(id); if (st.ply < SK().milestones[k]) return `${SK().milestones[k]}수부터 사용 가능`; }
    else if (charges(side) <= 0) { const n = nextMilestone(); return n ? `${n}수에 충전돼요` : '충전이 없어요'; }
    if (st.skillPly === st.ply) return '한 차례에 스킬은 1번만';
    if (st.turn !== side) return '내 차례에만 사용';
    if (rd.busy()) return '연출 중';
    if (def.canUse) { const r = def.canUse(makeCtx(side)); if (r !== true) return r; }
    if ((def.target === 'own' || def.target === 'enemy' || def.target === 'own2') && !skillTargets(side, def).length) return '대상이 없어요';
    return true;
  }
  function useSkill(side, id, args, o) {
    o = o || {};
    const def = MJ.Registry.get('skill', id);
    if (!def) return false;
    const entry = { skill: id, side, args: args || {}, effects: [], prevLast: rd.state.lastMove, prevCheck: rd.state.checkIdx };
    const ctx = makeCtx(side, entry);
    if (def.valid && !def.valid(ctx, entry.args)) { if (!o.silent) MJ.UI.toast('그렇게 쓰면 내 궁이 위험해져요'); return false; }
    entry.data = def.apply(ctx, entry.args);
    st.history.push(entry);
    st.skills[side].used.push(id);
    st.skillPly = st.ply;
    refreshFx();
    rd.state.checkIdx = R.inCheck(st.board, st.turn) ? R.findKing(st.board, st.turn)
      : (R.inCheck(st.board, MJ.other(side)) ? R.findKing(st.board, MJ.other(side)) : -1);
    if (st.mode === 'online' && !o.remote) MJ.Net.send({ t: 'skill', id, a: entry.args, ply: st.ply });
    if (!o.silent) {
      MJ.UI.banner(`${def.icon} ${def.name}`, `${sideName(side)} 스킬 발동!`, def.color || MJ.CONFIG.sides[side].color);
      MJ.Audio.sfx('skill', side, king(side).voice);
      rd.shake(6); buzz([30, 30, 60]);
    }
    hud(); saveResume();
    return true;
  }
  function undoSkillEntry(h) {
    const def = MJ.Registry.get('skill', h.skill);
    if (def && def.undo) def.undo(makeCtx(h.side), h.data, h.args);
    st.effects = st.effects.filter(e => !h.effects.includes(e));
    const u = st.skills[h.side].used; const k = u.lastIndexOf(h.skill); if (k >= 0) u.splice(k, 1);
    st.skillPly = -1;
  }

  /* 스킬 버튼 → 대상 선택 */
  function pressSkill(id) {
    if (!st) return;
    const side = st.mode === 'local' ? st.turn : st.mySide;
    if (st.targeting && st.targeting.id === id) { cancelTargeting(); return; }
    if (!controllable()) { MJ.UI.toast('지금은 사용할 수 없어요'); return; }
    const ok = canUseSkill(side, id);
    if (ok !== true) { MJ.UI.toast(ok); MJ.Audio.sfx('invalid'); return; }
    const def = MJ.Registry.get('skill', id);
    clearSel();
    if (def.target === 'none') {
      MJ.UI.confirm(`${def.icon} ${def.name}`, def.desc + '\n\n지금 사용할까요?', () => useSkill(side, id, {}));
      return;
    }
    if (def.target === 'captured') {
      const list = makeCtx(side).captured();
      MJ.UI.modal({
        title: `${def.icon} ${def.name}`, text: '되살릴 기물을 고르세요',
        buttons: list.map(c => ({ label: `${MJ.pieceName(c.piece.s, c.piece.t)} (+${MJ.CONFIG.pieceValues[c.piece.t]})`, cls: 'primary', fn: () => useSkill(side, id, { pieceId: c.piece.id }) }))
          .concat([{ label: '취소' }]),
      });
      return;
    }
    st.targeting = { id, side, picks: [] };
    rd.state.skillTargets = skillTargets(side, def);
    rd.state.skillColor = def.color;
    MJ.UI.toast(def.target === 'enemy' ? '대상 상대 기물을 누르세요' : def.target === 'own2' ? '자리를 바꿀 내 기물 2개를 누르세요' : '대상 내 기물을 누르세요', 2500);
    hud();
  }
  function cancelTargeting() { st.targeting = null; rd.state.skillTargets = null; hud(); }
  function tapTargeting(i) {
    const T = st.targeting, def = MJ.Registry.get('skill', T.id);
    if (!rd.state.skillTargets.includes(i)) { cancelTargeting(); MJ.UI.toast('스킬 사용을 취소했어요'); return; }
    if (def.target === 'own2') {
      if (T.picks.includes(i)) return;
      T.picks.push(i);
      rd.state.skillTargets = rd.state.skillTargets.filter(x => x !== i);
      rd.state.selected = i;
      if (T.picks.length < 2) return;
      const args = { a: T.picks[0], b: T.picks[1] };
      cancelTargeting(); rd.state.selected = -1;
      useSkill(T.side, T.id, args);
      return;
    }
    cancelTargeting();
    useSkill(T.side, T.id, { idx: i });
  }

  /* AI 스킬 사용 */
  function aiSkill() {
    const side = st.aiSide;
    for (const id of st.skills[side].eq) {
      if (canUseSkill(side, id) !== true) continue;
      const def = MJ.Registry.get('skill', id);
      if (!def.ai) continue;
      const args = def.ai(makeCtx(side));
      if (args && useSkill(side, id, args)) return true;
    }
    return false;
  }

  function controllable() {
    if (!st || st.over || st.thinking || rd.busy() || st.waitingUndo) return false;
    return st.mode === 'local' || st.turn === st.mySide;
  }

  /* ---------- 입력 ---------- */
  function onTap(i) {
    if (!controllable()) return;
    if (st.targeting) { tapTargeting(i); return; }
    if (i < 0) return;
    const S = rd.state, p = st.board[i];
    const mv = (S._legal || []).find(m => m.to === i);
    if (S.selected >= 0 && mv) { doMove(mv); return; }
    if (p && p.s === st.turn) {
      if (S.selected === i) { clearSel(); return; }
      S.selected = i;
      const legal = R.legalFrom(st.board, st.turn, i);
      S.targets = settings().hints ? legal : [];
      S._legal = legal;
      MJ.Audio.sfx('select', p.s);
      if (p.t === 'K' && Math.random() < 0.5) say(p.s, 'select');
      if (!legal.length) MJ.UI.toast('이 기물은 지금 움직일 수 없어요');
      return;
    }
    if (S.selected >= 0) MJ.Audio.sfx('invalid');
    clearSel();
  }
  function clearSel() { rd.state.selected = -1; rd.state.targets = []; rd.state._legal = null; }

  /* ---------- 수 두기 ---------- */
  function doMove(m, remote) {
    const piece = st.board[m.from];
    const side = st.turn, voice = king(side).voice;
    if (st.mode === 'online' && !remote) MJ.Net.send({ t: 'move', f: m.from, to: m.to, ply: st.ply });
    st.history.push({ m, side, prevLast: rd.state.lastMove, prevCheck: rd.state.checkIdx });
    R.make(st.board, m);
    clearSel();
    rd.state.lastMove = m;
    rd.state.checkIdx = -1;
    stopTimer();
    rd.animateMove(m, piece, {
      impact: () => {
        rd.fxAt('slash', m.to, { color: MJ.CONFIG.sides[side].light });
        rd.fxAt('sparks', m.to, { color: MJ.CONFIG.sides[side].color });
        rd.fxAt('text', m.to, { text: `${MJ.pieceName(m.cap.s, m.cap.t)} 격파! +${MJ.CONFIG.pieceValues[m.cap.t]}`, color: '#fff36b', size: rd.cell() * 0.42 });
        rd.shake(m.cap.t === 'R' ? 12 : 6);
        buzz(m.cap.t === 'R' ? 70 : 40);
        MJ.Audio.sfx('capture', side, voice);
        if ('RCH'.includes(m.cap.t)) say(side, 'capture');
      },
      arrive: () => {
        rd.fxAt('ring', m.to, { color: 'rgba(255,255,255,0.7)', life: 0.4 });
        MJ.Audio.sfx('move', side, voice);
      },
      done: () => afterMove(side),
    });
    hud();
  }

  function afterMove(mover) {
    if (!st || st.over) return;
    if (advanceTurn(mover)) {
      MJ.UI.banner('⚡ 한 번 더!', `${sideName(mover)} 연속 행동`, '#ffe14d');
      rd.state.checkIdx = -1;
      return startTurn();
    }
    const defender = st.turn;
    const checked = R.inCheck(st.board, defender);
    rd.state.checkIdx = checked ? R.findKing(st.board, defender) : -1;
    const legal = R.legalMoves(st.board, defender);

    if (checked && !legal.length) return end(mover, '왕이 빠져나갈 곳이 없습니다', 'mate');
    if (checked) {
      const k = king(mover);
      MJ.UI.banner('장군!', `${k.name}: "${pick(k.quotes.check)}"`, MJ.CONFIG.sides[mover].color);
      MJ.Audio.sfx('check', mover, k.voice);
      rd.shake(14);
      buzz([70, 50, 110]);
      setTimeout(() => say(defender, 'checked'), 1200);
    }
    if (st.ply >= MJ.CONFIG.moveLimit) return endByScore();
    if (!legal.length) {
      MJ.UI.toast(`${sideName(defender)}은(는) 둘 수 있는 수가 없어 한수쉼`);
      if (st.mode !== 'online' || defender === st.mySide) return passTurn(true);
    }
    startTurn();
  }

  function startTurn() {
    hud();
    stopTimer();
    if (!st || st.over) return;
    saveResume();
    if (st.mode === 'online' && st.turn === st.mySide && st.ply > 0) buzz(18);
    st.timeLeft = st.setup.time;
    if (st.setup.time > 0 && (st.mode === 'local' || st.turn === st.mySide)) {
      timerId = setInterval(() => {
        if (rd.busy() || st.waitingUndo) return;
        st.timeLeft = Math.max(0, st.timeLeft - 0.25);
        hudTimer();
        if (st.timeLeft <= 0) timeout();
      }, 250);
    }
    if (st.mode === 'ai' && st.turn === st.aiSide) aiMove();
    if (st.mode === 'online') setTimeout(pumpInbox, 0);
  }
  function stopTimer() { clearInterval(timerId); timerId = null; }

  function timeout() {
    stopTimer();
    if (st.targeting) cancelTargeting();
    MJ.UI.banner('시간초과!', '', '#ff9a3c');
    if (R.inCheck(st.board, st.turn)) {
      const legal = R.legalMoves(st.board, st.turn);
      doMove(legal[Math.floor(Math.random() * legal.length)]);
    } else passTurn(true);
  }

  function aiMove() {
    st.thinking = true;
    hud();
    const delay = 380 + Math.random() * 300;
    const me = st;
    setTimeout(() => {
      if (st !== me || st.over) return;
      if (st.diff !== 'easy' || Math.random() < 0.5) {
        if (aiSkill()) { setTimeout(() => { st.thinking = false; if (st === me && !st.over) aiMove(); }, 1100); return; }
      }
      const m = MJ.AI.think(st.board, st.aiSide, st.diff);
      st.thinking = false;
      if (!m) { passTurn(true); return; }
      const real = R.legalFrom(st.board, st.aiSide, m.from).find(x => x.to === m.to);
      doMove(real || m);
    }, delay);
  }

  /* ---------- 한수쉼 / 무르기 / 기권 ---------- */
  function passTurn(auto, remote) {
    if (!auto && !remote) {
      if (!controllable()) return;
      if (R.inCheck(st.board, st.turn)) { MJ.UI.toast('장군 상태에서는 한수쉼을 할 수 없어요'); MJ.Audio.sfx('invalid'); return; }
    }
    if (st.mode === 'online' && !remote) MJ.Net.send({ t: 'pass', ply: st.ply });
    clearSel();
    if (st.targeting) cancelTargeting();
    const ph = { pass: true, side: st.turn, prevLast: rd.state.lastMove, prevCheck: rd.state.checkIdx };
    if (st.extra[st.turn]) { st.extra[st.turn] = 0; ph.extraUsed = true; }
    st.history.push(ph);
    MJ.Audio.sfx('pass');
    if (!auto) MJ.UI.toast(`${sideName(st.turn)} 한수쉼`);
    st.turn = MJ.other(st.turn);
    st.ply++;
    refreshFx();
    startTurn();
  }

  function popPly(n) {
    for (let k = 0; k < n; k++) {
      const h = st.history.pop();
      if (!h) break;
      if (h.skill) undoSkillEntry(h);
      else {
        if (!h.pass) R.unmake(st.board, h.m);
        st.ply--;
        if (h.extraUsed) st.extra[h.side] = 1;
      }
      st.turn = h.side;
      rd.state.lastMove = h.prevLast; rd.state.checkIdx = h.prevCheck;
    }
    refreshFx();
    if (st.targeting) cancelTargeting();
    clearSel();
    MJ.Audio.sfx('pass');
    MJ.UI.toast('↶ 한 수 물렀어요');
    startTurn();
  }

  function undo() {
    if (!st || st.over || st.thinking || rd.busy()) return;
    if (!st.history.length) { MJ.UI.toast('무를 수가 없어요'); return; }
    if (st.mode === 'online') {
      const last = st.history[st.history.length - 1];
      if (last.side !== st.mySide) { MJ.UI.toast('방금 내가 둔 수만 무를 수 있어요'); return; }
      if (st.waitingUndo) return;
      st.waitingUndo = true;
      MJ.Net.send({ t: 'undo-req', ply: st.ply });
      MJ.UI.toast('상대에게 무르기를 요청했어요…', 3000);
      return;
    }
    let n = 1;
    if (st.mode === 'ai') {
      n = 0;
      for (let k = st.history.length - 1; k >= 0; k--) { n++; if (st.history[k].side === st.mySide) break; }
      if (st.history[st.history.length - n].side !== st.mySide) { MJ.UI.toast('무를 수가 없어요'); return; }
    }
    popPly(n);
  }

  function resign() {
    if (!st || st.over) return;
    const loser = st.mode === 'local' ? st.turn : st.mySide;
    MJ.UI.confirm('기권', `${sideName(loser)}이(가) 기권할까요?`, () => {
      if (st.mode === 'online') MJ.Net.send({ t: 'resign' });
      end(MJ.other(loser), `${sideName(loser)} 기권`);
    });
  }

  /* ---------- 멀티: 상대 메시지 ---------- */
  /* 상대 수가 내 연출 도중에 도착하면 줄 세웠다가 처리 */
  let inbox = [];
  function pumpInbox() {
    while (inbox.length && st && !st.over && !rd.busy() && st.turn !== st.mySide) {
      const msg = inbox.shift();
      if (msg.t === 'move') {
        const m = R.legalFrom(st.board, st.turn, msg.f).find(x => x.to === msg.to);
        if (m) doMove(m, true); else { inbox = []; MJ.Lobby.desync(); }
      } else if (msg.t === 'skill') {
        if (!useSkill(st.turn, msg.id, msg.a, { remote: true })) { inbox = []; MJ.Lobby.desync(); }
      } else passTurn(true, true);
    }
  }
  function remote(msg) {
    if (!st || st.mode !== 'online') return;
    if (msg.t === 'move' || msg.t === 'pass' || msg.t === 'skill') { if (!st.over) { inbox.push(msg); pumpInbox(); } return; }
    switch (msg.t) {
      case 'resign': if (!st.over) end(st.mySide, `${st.nicks[MJ.other(st.mySide)]} 기권`); break;
      case 'undo-req':
        MJ.UI.modal({
          title: '무르기 요청', text: `${st.nicks[MJ.other(st.mySide)]}님이 한 수 무르기를 요청했어요.`,
          buttons: [
            { label: '허락', cls: 'primary', fn: () => { MJ.Net.send({ t: 'undo-ok' }); popPly(1); } },
            { label: '거절', fn: () => MJ.Net.send({ t: 'undo-no' }) },
          ],
        });
        break;
      case 'undo-ok': st.waitingUndo = false; popPly(1); break;
      case 'undo-no': st.waitingUndo = false; MJ.UI.toast('상대가 무르기를 거절했어요'); break;
    }
  }

  /* ---------- 종료 ---------- */
  function endByScore() {
    const c = R.material(st.board, 'cho'), h = R.material(st.board, 'han');
    end(c > h ? 'cho' : 'han', `${MJ.CONFIG.moveLimit}수 도달 — 점수 판정 (초 ${c} : 한 ${h})`);
  }

  function end(winner, reason, kind) {
    const mate = kind === 'mate';
    if (st.over) return;
    st.over = true;
    stopTimer(); clearSel(); hud();
    saveResume(); keepAwake(false);
    const wk = king(winner), lk = king(MJ.other(winner));
    const iWon = st.mode === 'local' || winner === st.mySide;
    const S = MJ.Store.get();
    if (st.mode === 'ai') { S.stats.played++; iWon ? S.stats.win++ : S.stats.lose++; }
    if (st.mode === 'online') {
      const m = S.multiStats; m.played++; iWon ? m.win++ : m.lose++;
      const opp = st.nicks[MJ.other(st.mySide)];
      m.vs[opp] = m.vs[opp] || { win: 0, lose: 0 }; iWon ? m.vs[opp].win++ : m.vs[opp].lose++;
    }
    MJ.Store.save();
    const me = st;
    setTimeout(() => {
      if (st !== me) return;
      if (mate) {
        // 외통 승리 전용 연출
        MJ.UI.banner(iWon ? '외통승리!' : '외통패배', `${sideName(winner)} · ${reason}`, MJ.CONFIG.sides[winner].aura || MJ.CONFIG.sides[winner].color, 'mate');
        rd.shake(20);
        const ki = R.findKing(st.board, MJ.other(winner));
        if (ki >= 0) { rd.fxAt('sparks', ki, { color: '#fff36b', n: 40 }); rd.fxAt('ring', ki, { color: '#ff4d4d', life: 1.2 }); }
      } else {
        MJ.UI.banner(st.mode === 'local' ? `${MJ.CONFIG.sides[winner].short} 승리!` : iWon ? '승리!' : '패배…', reason, MJ.CONFIG.sides[winner].color);
      }
      MJ.Audio.sfx(iWon ? 'win' : 'lose', winner, wk.voice);
      buzz(iWon ? [60, 40, 60, 40, 140] : 200);
      if (iWon) rd.fx('confetti', {});
      say(winner, 'win'); say(MJ.other(winner), 'lose');
    }, 500);
    setTimeout(() => {
      if (st !== me) return;
      const buttons = st.mode === 'online'
        ? [
          { label: '🔄 재대결 신청', cls: 'primary', fn: () => MJ.Lobby.requestRematch() },
          { label: '🏠 로비로', fn: () => MJ.Lobby.leaveToMenu() },
        ]
        : [
          { label: '🔄 다시하기', cls: 'primary', fn: () => start(st.setup) },
          { label: '🎨 꾸미고 다시', fn: () => { MJ.UI.show('menu'); MJ.UI.openCustom(); } },
          { label: '🏠 로비로', fn: () => MJ.UI.show('menu') },
        ];
      MJ.UI.modal({
        king: wk, side: winner,
        title: mate ? (st.mode === 'local' ? `🏆 ${sideName(winner)} 외통승리!` : iWon ? '🏆 외통승리!' : '외통패배')
          : st.mode === 'local' ? `${sideName(winner)} 승리` : iWon ? '🎉 승리!' : '패배',
        text: `${reason}\n\n${wk.name}: "${pick(wk.quotes.win)}"\n${lk.name}: "${pick(lk.quotes.lose)}"`,
        buttons,
      });
    }, 2100);
  }

  /* ---------- HUD ---------- */
  function say(side, kind) {
    if (!settings().quotes || !st) return;
    const k = king(side), txt = pick(k.quotes[kind]);
    if (!txt) return;
    const card = side === rd.state.view ? $('#cardBottom') : $('#cardTop');
    const b = card.querySelector('.bubble'); if (!b) return;
    b.textContent = txt; b.classList.add('show');
    clearTimeout(bubbleT[side]); bubbleT[side] = setTimeout(() => b.classList.remove('show'), 2300);
  }

  function hud() {
    if (!st) return;
    const view = rd.state.view;
    fillCard($('#cardBottom'), view);
    fillCard($('#cardTop'), MJ.other(view));
    renderSkillBar();
    const undoBtn = document.querySelector('[data-act="undo"]');
    if (undoBtn) undoBtn.disabled = !st.history.length || st.over;
  }
  function fillCard(el, side) {
    const k = king(side), S = MJ.CONFIG.sides[side];
    const key = side + ':' + k.id;
    if (el.dataset.key !== key) {
      el.dataset.key = key;
      el.innerHTML = `<canvas width="120" height="120"></canvas>
        <div class="info"><div class="name"><span class="kname"></span><span class="side-badge" style="background:${S.color}">${S.name}</span></div>
        <div class="caps"></div></div>
        <div class="score"><span class="who"></span><b class="pts"></b><span class="timer"></span></div>
        <div class="bubble"></div>`;
      el.querySelector('.kname').textContent = k.name;
      MJ.UI.portraitInto(el.querySelector('canvas'), k, side);
    }
    const rv = revivedIds();
    const caps = st.history.filter(h => h.m && h.side === side && h.m.cap && !rv.has(h.m.cap.id))
      .map(h => MJ.PieceArt.glyphOf(MJ.Registry.get('skin', 'classic'), h.m.cap, null));
    el.querySelector('.caps').textContent = caps.length ? caps.join('') : k.title;
    let skEl = el.querySelector('.skmini');
    if (!skEl) { skEl = document.createElement('span'); skEl.className = 'skmini'; el.querySelector('.name').appendChild(skEl); }
    const SS = st.skills[side];
    skEl.innerHTML = SS.eq.map(id => { const d = MJ.Registry.get('skill', id); return d ? `<i class="${SS.used.includes(id) ? 'u' : ''}">${d.icon}</i>` : ''; }).join('');
    el.querySelector('.pts').textContent = R.material(st.board, side);
    let who = '';
    if (st.mode === 'ai') who = side === st.mySide ? '나' : `AI·${MJ.CONFIG.difficulties[st.diff].name}`;
    if (st.mode === 'online') who = st.nicks[side] + (side !== st.mySide && st.netLost ? ' ⚠️' : '');
    el.querySelector('.who').textContent = st.thinking && side === st.aiSide ? '생각 중…' : who;
    el.classList.toggle('turn', st.turn === side && !st.over);
    hudTimer();
  }
  /* 스킬 바 (내 스킬 4칸) */
  function skillIcon(def) {
    const p = 'assets/images/skills/' + def.id + '.png';
    return MJ.Assets.img(p) ? `<img src="${p}" alt="">` : `<span class="ico">${def.icon}</span>`;
  }
  function renderSkillBar() {
    const bar = $('#skillBar');
    if (!bar || !st) return;
    const side = st.mode === 'local' ? st.turn : st.mySide;
    const S = st.skills[side];
    const ch = SK().mode === 'charge' ? charges(side) : null;
    const nx = nextMilestone();
    const cg = $('#skCharge'), nxEl = $('#skNext');
    if (cg) { cg.textContent = ch != null ? ch : ''; cg.classList.toggle('on', ch > 0); }
    if (nxEl) nxEl.textContent = nx ? `다음 ${nx}수` : '충전 완료';
    let html = '';
    for (let k = 0; k < SK().slots; k++) {
      const id = S.eq[k], def = id && MJ.Registry.get('skill', id);
      if (!def) { html += '<button class="sk empty" disabled><span class="ico">＋</span><small>빈 칸</small></button>'; continue; }
      const used = S.used.includes(id);
      const ok = canUseSkill(side, id) === true;
      const active = st.targeting && st.targeting.id === id;
      const lock = SK().mode === 'slot' && st.ply < SK().milestones[k] ? `${SK().milestones[k]}수` : '';
      html += `<button class="sk${used ? ' used' : ''}${ok ? ' ready' : ''}${active ? ' active' : ''}" data-skill="${id}" style="--skc:${def.color || '#ffd36b'}">
        ${skillIcon(def)}<small>${used ? '사용함' : lock || def.name}</small></button>`;
    }
    bar.innerHTML = html;
    bar.querySelectorAll('[data-skill]').forEach(b => { b.onclick = () => pressSkill(b.dataset.skill); });
  }

  function hudTimer() {
    if (!st) return;
    document.querySelectorAll('.pcard').forEach(el => {
      const t = el.querySelector('.timer'); if (!t) return;
      const side = el.id === 'cardBottom' ? rd.state.view : MJ.other(rd.state.view);
      if (st.setup.time > 0 && st.turn === side && !st.over && timerId) {
        t.textContent = ' ⏱' + Math.ceil(st.timeLeft);
        t.classList.toggle('low', st.timeLeft <= st.setup.time * 0.3);
      } else t.textContent = '';
    });
  }

  function menu() {
    const S = settings();
    MJ.UI.modal({
      title: '☰ 메뉴', text: st ? `${st.ply}수째 · 초 ${st.forms.cho} / 한 ${st.forms.han}` : '',
      buttons: [
        { label: '▶ 계속하기', cls: 'primary' },
        { label: '⏭ 다음 곡', keep: true, fn: () => { MJ.Audio.unlock(); MJ.Audio.next(); MJ.UI.toast('다음 곡'); } },
        { label: S.sfxOn ? '🔇 효과음 끄기' : '🔊 효과음 켜기', fn: () => { S.sfxOn = !S.sfxOn; MJ.Store.save(); } },
        { label: '⚙️ 설정', fn: () => MJ.UI.openSettings() },
        { label: '🏠 로비로 (대국 종료)', cls: 'danger', fn: () => quitToMenu() },
      ],
    });
  }
  function quitToMenu() {
    stopTimer(); keepAwake(false);
    if (st) {
      if (st.mode === 'online' && !st.over) MJ.Net.send({ t: 'resign' });
      else if (!st.over) saveResume(); // 로비로 나가도 이어하기 가능
      st.over = true;
    }
    if (st && st.mode === 'online') MJ.Lobby.leaveToMenu(); else MJ.UI.show('menu');
  }
  function setNetLost(v) { if (st) { st.netLost = v; document.querySelectorAll('.pcard').forEach(el => { el.dataset.key = ''; }); hud(); } }

  function resume() {
    const R0 = MJ.Store.get().resume;
    if (!R0) return;
    start(R0.setup, { replay: R0.moves });
  }

  return { init, start, undo, resume, pressSkill, useSkill, canUseSkill, pass: () => passTurn(false), resign, menu, remote, moveList, setNetLost,
           state: () => st, stopTimer };
})();
