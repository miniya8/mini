/* =========================================================
 * 멀티 대전 로비 (방 만들기 / 코드로 참가 / 대기실 / 재대결 / 재접속)
 * ========================================================= */
MJ.Lobby = (function () {
  const $ = s => document.querySelector(s);
  const store = () => MJ.Store.get();
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let view = 'home';          // home | connecting | host | guest
  let opp = null;             // {nick, loadout, form}
  let roomInfo = null;        // 게스트가 받은 방 설정
  let lastHostSide = null, rematch = { me: false, opp: false }, rejoinT = null, inGame = false;

  function myHello() {
    return { t: 'hello', nick: store().profile.nick, loadout: store().loadout, form: store().room.form, ver: MJ.CONFIG.version };
  }

  /* ---------- 네트워크 이벤트 ---------- */
  MJ.Net.on('open', () => { MJ.Net.send(myHello()); if (MJ.Net.role() === 'host') sendRoom(); });
  MJ.Net.on('error', msg => { if (view === 'connecting') { view = 'home'; render(); } MJ.UI.toast(msg, 3500); });
  MJ.Net.on('lost', () => {
    if (inGame) {
      MJ.Game.setNetLost(true);
      MJ.UI.toast('⚠️ 상대 연결이 끊겼어요. 재접속을 기다립니다…', 4000);
      if (MJ.Net.role() === 'guest') scheduleRejoin();
    } else if (view === 'host') { opp = null; render(); MJ.UI.toast('상대가 나갔어요'); }
    else if (view === 'guest') { scheduleRejoin(); render(); }
  });
  MJ.Net.on('alive', () => {
    clearTimeout(rejoinT);
    if (inGame) { MJ.Game.setNetLost(false); MJ.UI.toast('✅ 상대와 다시 연결됐어요'); }
    render();
  });
  MJ.Net.on('msg', d => {
    switch (d.t) {
      case 'hello':
        opp = { nick: String(d.nick || '상대').slice(0, 12), loadout: d.loadout, form: d.form };
        if (MJ.Net.role() === 'host' && inGame) sendSync();
        render();
        break;
      case 'guest-form': if (opp) { opp.form = d.form; render(); } break;
      case 'room': roomInfo = d; render(); break;
      case 'start': rematch = { me: false, opp: false }; startGame(d.setup); break;
      case 'sync': rematch = { me: false, opp: false }; startGame(d.setup, d.moves); break;
      case 'sync-req': if (MJ.Net.role() === 'host') sendSync(); break;
      case 'rematch':
        rematch.opp = true;
        MJ.UI.toast(`${opp ? opp.nick : '상대'}님이 재대결을 원해요!`, 3000);
        tryRematch();
        break;
      case 'bye':
        MJ.UI.toast(`${opp ? opp.nick : '상대'}님이 방을 나갔어요`, 3000);
        if (MJ.Net.role() === 'guest') { leave(); MJ.UI.show('menu'); }
        else { opp = null; inGame = false; render(); }
        break;
      default: MJ.Game.remote(d);
    }
  });

  function scheduleRejoin() {
    clearTimeout(rejoinT);
    const code = MJ.Net.code();
    if (!code) return;
    rejoinT = setTimeout(() => {
      if (MJ.Net.connected()) return;
      MJ.Net.join(code).catch(() => scheduleRejoin());
    }, 4000);
  }

  /* ---------- 방장 ---------- */
  function resolveHostSide() {
    const s = store().room.side;
    return s === 'random' ? (Math.random() < 0.5 ? 'cho' : 'han') : s;
  }
  function sendRoom() {
    const R = store().room;
    MJ.Net.send({ t: 'room', side: R.side, time: R.time, form: R.form, nick: store().profile.nick });
  }
  function hostStart(swap) {
    if (!opp) { MJ.UI.toast('상대가 아직 들어오지 않았어요'); return; }
    const R = store().room;
    const hostSide = swap && lastHostSide ? MJ.other(lastHostSide) : resolveHostSide();
    lastHostSide = hostSide;
    const gSide = MJ.other(hostSide);
    const forms = { [hostSide]: R.form, [gSide]: opp.form || '마상마상' };
    const base = { mode: 'online', forms, time: R.time };
    const mine = Object.assign({}, base, { mySide: hostSide, myNick: store().profile.nick, oppNick: opp.nick, oppLoadout: opp.loadout });
    const theirs = Object.assign({}, base, { mySide: gSide, myNick: opp.nick, oppNick: store().profile.nick, oppLoadout: store().loadout });
    MJ.Net.send({ t: 'start', setup: theirs });
    rematch = { me: false, opp: false };
    startGame(mine);
  }
  function sendSync() {
    const st = MJ.Game.state();
    if (!st || !opp) return;
    const theirs = Object.assign({}, st.setup, {
      mySide: MJ.other(st.mySide), myNick: opp.nick, oppNick: store().profile.nick, oppLoadout: store().loadout,
    });
    MJ.Net.send({ t: 'sync', setup: theirs, moves: MJ.Game.moveList() });
  }

  function startGame(setup, moves) {
    inGame = true;
    MJ.UI.closeModal();
    MJ.Game.start(setup, { replay: moves });
  }

  function requestRematch() {
    rematch.me = true;
    MJ.Net.send({ t: 'rematch' });
    MJ.UI.toast('재대결을 신청했어요. 상대를 기다리는 중…', 3000);
    tryRematch();
  }
  function tryRematch() {
    if (rematch.me && rematch.opp && MJ.Net.role() === 'host') hostStart(true);
  }
  function desync() { if (MJ.Net.role() === 'host') sendSync(); else MJ.Net.send({ t: 'sync-req' }); }

  function leave() {
    clearTimeout(rejoinT);
    MJ.Net.send({ t: 'bye' });
    setTimeout(() => MJ.Net.leave(), 150);
    opp = null; roomInfo = null; inGame = false; view = 'home';
  }
  function leaveToMenu() { MJ.Game.stopTimer(); leave(); MJ.UI.show('menu'); }

  /* ---------- 화면 ---------- */
  function open() {
    MJ.UI.show('multi');
    if (!MJ.Net.role()) view = 'home';
    inGame = false;
    render();
    MJ.Net.loadLib().catch(e => MJ.UI.toast(e.message, 4000));
  }

  function render() {
    const body = $('#multiBody');
    if (!body || MJ.UI.current() !== 'multi') return;
    body.innerHTML = '';
    const P = store().profile, R = store().room;
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const label = t => body.appendChild(el('div', 'label', t));
    const forms = Object.keys(MJ.CONFIG.formations).map(f => ({ v: f, label: f }));

    if (view === 'home' || view === 'connecting') {
      label('닉네임');
      const nick = el('input', 'text-in'); nick.value = P.nick; nick.maxLength = 12;
      nick.onchange = () => { P.nick = nick.value.trim().slice(0, 12) || P.nick; MJ.Store.save(); };
      body.appendChild(nick);

      const box = el('div', 'multi-cards');
      const c1 = el('div', 'mcard');
      c1.innerHTML = '<div class="mcard-ico">🏠</div><b>방 만들기</b><small>코드를 만들어 친구를 초대해요</small>';
      const b1 = el('button', 'btn primary', '방 만들기');
      b1.disabled = view === 'connecting';
      b1.onclick = async () => {
        view = 'connecting'; render();
        try { await MJ.Net.host(); view = 'host'; opp = null; render(); }
        catch (e) { view = 'home'; render(); }
      };
      c1.appendChild(b1);

      const c2 = el('div', 'mcard');
      c2.innerHTML = '<div class="mcard-ico">🚪</div><b>코드로 참가</b><small>친구가 알려준 5자리 코드를 입력해요</small>';
      const code = el('input', 'text-in code-in'); code.placeholder = 'ABCDE'; code.maxLength = MJ.NET_CONFIG.codeLen;
      code.oninput = () => { code.value = code.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
      const b2 = el('button', 'btn', '참가하기');
      b2.disabled = view === 'connecting';
      b2.onclick = async () => {
        if (code.value.length < MJ.NET_CONFIG.codeLen) { MJ.UI.toast('코드 5자리를 입력하세요'); return; }
        P.nick = nick.value.trim().slice(0, 12) || P.nick; MJ.Store.save();
        view = 'connecting'; render();
        try { await MJ.Net.join(code.value); view = 'guest'; render(); }
        catch (e) { view = 'home'; render(); MJ.UI.toast(e.message, 3500); }
      };
      c2.appendChild(code); c2.appendChild(b2);
      box.appendChild(c1); box.appendChild(c2);
      body.appendChild(box);
      if (view === 'connecting') body.appendChild(el('div', 'status-line', '⏳ 연결 중…'));
      const m = store().multiStats;
      label(`멀티 전적: ${m.played}판 ${m.win}승 ${m.lose}패`);
      const vs = Object.entries(m.vs).slice(-5).map(([n, r]) => `${esc(n)} ${r.win}승 ${r.lose}패`).join(' · ');
      if (vs) body.appendChild(el('div', 'hint-line', vs));
      body.appendChild(el('div', 'hint-line', '💡 두 기기 모두 인터넷에 연결되어 있어야 해요. 서로의 꾸미기(왕·기물 스킨)가 상대 화면에도 보여요.'));
      return;
    }

    /* 대기실 공통: 코드 */
    const codeBox = el('div', 'room-code');
    codeBox.innerHTML = `<small>방 코드</small><div class="code">${esc(MJ.Net.code())}</div>`;
    body.appendChild(codeBox);
    if (view === 'host' && !opp) {
      const row = el('div', 'invite-row');
      const kk = el('button', 'btn kakao', '💬 카카오톡 초대');
      kk.onclick = () => MJ.Invite.share(MJ.Net.code());
      const cp = el('button', 'btn', '📋 복사');
      cp.onclick = () => MJ.Invite.copy(MJ.Net.code());
      row.appendChild(kk); row.appendChild(cp);
      body.appendChild(row);
    }

    const vsBox = el('div', 'room-vs');
    vsBox.appendChild(playerChip(P.nick + ' (나)', view === 'host' ? '👑 방장' : '참가자', true));
    vsBox.appendChild(el('div', 'vs-mark small', 'VS'));
    vsBox.appendChild(opp
      ? playerChip(opp.nick, view === 'host' ? '참가자' : '👑 방장', MJ.Net.connected())
      : playerChip('대기 중…', '친구에게 코드를 알려주세요', false, true));
    body.appendChild(vsBox);

    if (view === 'host') {
      label('내 진영 (초나라가 먼저 둡니다)');
      body.appendChild(MJ.UI.seg([{ v: 'cho', label: '초나라', cls: 'cho' }, { v: 'han', label: '한나라', cls: 'han' }, { v: 'random', label: '🎲 랜덤' }], R.side, v => { R.side = v; MJ.Store.save(); sendRoom(); }));
      label('내 차림');
      body.appendChild(MJ.UI.seg(forms, R.form, v => { R.form = v; MJ.Store.save(); sendRoom(); }));
      label('한 수 제한시간');
      body.appendChild(MJ.UI.seg(MJ.CONFIG.timeLimits.map(t => ({ v: t, label: t ? t + '초' : '없음' })), R.time, v => { R.time = v; MJ.Store.save(); sendRoom(); }));
      if (opp) body.appendChild(el('div', 'hint-line', `상대 차림: ${esc(opp.form || '마상마상')}`));
      const go = el('button', 'btn primary big', opp ? '⚔️ 대국 시작' : '⏳ 상대를 기다리는 중…');
      go.disabled = !opp;
      go.onclick = () => hostStart(false);
      body.appendChild(go);
    } else {
      if (roomInfo) {
        const sideTxt = roomInfo.side === 'random' ? '🎲 랜덤' : `방장 ${MJ.CONFIG.sides[roomInfo.side].name} → 나는 ${MJ.CONFIG.sides[MJ.other(roomInfo.side)].name}`;
        body.appendChild(el('div', 'hint-line', `진영: ${esc(sideTxt)} · 제한시간: ${roomInfo.time ? roomInfo.time + '초' : '없음'}`));
      }
      label('내 차림');
      body.appendChild(MJ.UI.seg(forms, R.form, v => { R.form = v; MJ.Store.save(); MJ.Net.send({ t: 'guest-form', form: v }); }));
      body.appendChild(el('div', 'status-line', MJ.Net.connected() ? '⏳ 방장이 대국을 시작하기를 기다리는 중…' : '🔄 연결 중…'));
    }
    const out = el('button', 'btn ghost', '🚪 방 나가기');
    out.onclick = () => { leave(); render(); };
    body.appendChild(out);
  }

  function playerChip(name, sub, on, waiting) {
    const d = document.createElement('div');
    d.className = 'pchip' + (on ? ' on' : '') + (waiting ? ' waiting' : '');
    d.innerHTML = `<b>${esc(name)}</b><small>${esc(sub)}</small>`;
    return d;
  }

  /* 초대 링크로 들어온 경우: 바로 참가 */
  async function autoJoin(code) {
    MJ.UI.show('menu');
    MJ.UI.show('multi');
    inGame = false; view = 'connecting'; render();
    try {
      await MJ.Net.join(code);
      view = 'guest'; render();
      MJ.UI.toast('방에 참가했어요! 방장이 시작하면 대국이 시작돼요', 3000);
    } catch (e) {
      view = 'home'; render();
      const ci = document.querySelector('.code-in'); if (ci) ci.value = code;
      MJ.UI.toast(e.message || '방에 참가하지 못했어요', 3500);
    }
  }

  return { open, render, autoJoin, requestRematch, leaveToMenu, desync, back: () => { if (MJ.Net.role()) leave(); MJ.UI.back(); } };
})();
