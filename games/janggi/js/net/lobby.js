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
        if (!opp && MJ.Net.role() === 'host' && !inGame) {
          joinedFlash = true;
          MJ.UI.toast(`🎉 ${String(d.nick || '상대').slice(0, 12)}님이 들어왔어요!`, 2600);
          try { MJ.Audio.sfx('chat'); } catch (e) {}
          if (store().settings.vibrate && navigator.vibrate) try { navigator.vibrate([40, 40, 80]); } catch (e) {}
        }
        opp = { nick: String(d.nick || '상대').slice(0, 12), loadout: d.loadout, form: d.form };
        if (MJ.Net.role() === 'host' && inGame) sendSync();
        render();
        break;
      case 'loadout': if (opp) opp.loadout = d.loadout; break;
      case 'guest-form': if (opp) { opp.form = d.form; render(); } break;
      case 'room': roomInfo = d; render(); break;
      case 'start': rematch = { me: false, opp: false }; startGame(d.setup); break;
      case 'sync': rematch = { me: false, opp: false }; startGame(d.setup, d.moves); break;
      case 'chat': MJ.Chat.receive(d); break;
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
    MJ.Chat.reset();
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

  const KK_SVG = '<svg class="kk" viewBox="0 0 26 24"><path fill="#191919" d="M13 1C6.4 1 1 5.2 1 10.4c0 3.3 2.2 6.2 5.6 7.9l-1.2 4.4c-.1.4.3.7.7.5l5.2-3.5c.6.1 1.1.1 1.7.1 6.6 0 12-4.2 12-9.4S19.6 1 13 1z"/></svg>';
  let autoShareFailed = false, joinedFlash = false;

  /* 방 만들기 (+ 바로 카톡 초대) */
  async function createRoom(then) {
    view = 'connecting'; render();
    try {
      await MJ.Net.host(); view = 'host'; opp = null; autoShareFailed = false; render();
      if (then === 'kakao') {
        const ok = await MJ.Invite.share(MJ.Net.code(), { auto: true });
        if (!ok) { autoShareFailed = true; render(); MJ.UI.toast('👇 카카오톡 버튼을 눌러 초대를 보내세요', 3000); }
      } else if (then === 'copy') MJ.Invite.copy(MJ.Net.code());
    } catch (e) { view = 'home'; render(); }
  }
  async function joinRoom(code) {
    code = MJ.Invite.parseCode(code);
    if (!code) { MJ.UI.toast('코드 숫자 4자리를 입력하세요'); return; }
    view = 'connecting'; render();
    try { await MJ.Net.join(code); view = 'guest'; render(); MJ.UI.toast('✅ 방에 들어왔어요!'); }
    catch (e) {
      view = 'home'; render(); MJ.UI.toast(e.message || '방에 참가하지 못했어요', 3500);
      const ci = document.querySelector('.code-boxes input'); if (ci) { ci.value = code; ci.dispatchEvent(new Event('input')); }
    }
  }

  function kingOf(loadout, side) {
    const id = loadout && loadout.kings && loadout.kings[side];
    return MJ.Registry.get('king', id) || MJ.Registry.first('king');
  }

  function render() {
    const body = $('#multiBody');
    if (!body || MJ.UI.current() !== 'multi') return;
    body.innerHTML = '';
    const P = store().profile, R = store().room;
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const label = (t, to) => (to || body).appendChild(el('div', 'label', t));
    const forms = Object.keys(MJ.CONFIG.formations).map(f => ({ v: f, label: f }));
    const busy = view === 'connecting';
    const m = store().multiStats;

    if (view === 'home' || view === 'connecting') {
      /* 내 이름 */
      const me = el('div', 'lb-me');
      me.appendChild(el('span', 'avatar', '🙂'));
      const nick = el('input'); nick.value = P.nick; nick.maxLength = 12; nick.placeholder = '닉네임';
      nick.onchange = () => { P.nick = nick.value.trim().slice(0, 12) || P.nick; MJ.Store.save(); };
      me.appendChild(nick);
      me.appendChild(el('small', '', `${m.win}승 ${m.lose}패 ✎`));
      body.appendChild(me);

      /* 초대하기 */
      const c1 = el('div', 'lb-card');
      c1.appendChild(el('h3', '', '💌 친구 초대하기'));
      c1.appendChild(el('p', '', '버튼 한 번이면 방이 만들어지고 카카오톡이 열려요.<br>친구가 링크를 누르면 바로 이 방으로 들어와요.'));
      c1.appendChild(el('div', 'lb-step', '<span>① 카톡 보내기</span><span>② 친구 입장</span><span>③ 대국 시작</span>'));
      const kk = el('button', 'btn kakao', busy ? '⏳ 방 만드는 중…' : KK_SVG + '<span>카카오톡으로 초대</span>');
      kk.disabled = busy; kk.onclick = () => createRoom('kakao');
      c1.appendChild(kk);
      const row = el('div', 'sub-row');
      const b1 = el('button', 'btn lacq', '🏠 방만 만들기'); b1.disabled = busy; b1.onclick = () => createRoom();
      const b2 = el('button', 'btn lacq', '🔗 초대 메시지 복사'); b2.disabled = busy; b2.onclick = () => createRoom('copy');
      row.appendChild(b1); row.appendChild(b2); c1.appendChild(row);
      body.appendChild(c1);

      body.appendChild(el('div', 'lb-or', '초대를 받았나요?'));

      /* 코드로 참가 */
      const c2 = el('div', 'lb-card');
      c2.appendChild(el('h3', '', '🚪 코드로 참가'));
      c2.appendChild(el('p', '', '카톡 메시지를 통째로 붙여넣어도 코드를 알아서 찾아요.'));
      const boxes = el('div', 'code-boxes');
      const N = MJ.NET_CONFIG.codeLen, cells = [];
      boxes.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)';
      boxes.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
      for (let i = 0; i < N; i++) { const c = el('div', 'cb'); cells.push(c); boxes.appendChild(c); }
      const inp = el('input'); inp.maxLength = 200; inp.autocomplete = 'off'; inp.inputMode = /^[0-9]+$/.test(MJ.NET_CONFIG.codeChars) ? 'numeric' : 'text'; inp.setAttribute('pattern', '[0-9]*');
      const paint = () => {
        const v = inp.value;
        cells.forEach((c, i) => { c.textContent = v[i] || ''; c.classList.toggle('fill', !!v[i]); c.classList.toggle('cur', i === Math.min(v.length, N - 1) && document.activeElement === inp); });
      };
      inp.oninput = () => {
        const raw = inp.value;
        const found = raw.length > N ? MJ.Invite.parseCode(raw) : null;
        inp.value = found || [...raw].filter(ch => MJ.NET_CONFIG.codeChars.includes(ch)).join('').slice(0, N);
        paint();
        if (inp.value.length === N && found) joinRoom(inp.value); // 메시지 붙여넣기 → 바로 참가
      };
      inp.onfocus = paint; inp.onblur = paint;
      inp.onkeydown = e => { if (e.key === 'Enter') joinRoom(inp.value); };
      boxes.appendChild(inp); c2.appendChild(boxes); paint();
      const jr = el('div', 'join-row');
      const pst = el('button', 'btn lacq', '📋 붙여넣기'); pst.disabled = busy;
      pst.onclick = async () => {
        try {
          const t = await navigator.clipboard.readText();
          const code = MJ.Invite.parseCode(t);
          if (!code) { MJ.UI.toast('복사한 내용에서 코드를 못 찾았어요'); return; }
          inp.value = code; paint(); joinRoom(code);
        } catch (e) { inp.focus(); MJ.UI.toast('칸을 길게 눌러 붙여넣기 하세요'); }
      };
      const go = el('button', 'btn gold-btn', busy ? '⏳ 연결 중…' : '참가하기'); go.disabled = busy;
      go.onclick = () => joinRoom(inp.value);
      jr.appendChild(pst); jr.appendChild(go); c2.appendChild(jr);
      body.appendChild(c2);

      const vs = Object.entries(m.vs).slice(-4).map(([n, r]) => `${esc(n)} ${r.win}승 ${r.lose}패`).join(' · ');
      body.appendChild(el('div', 'lb-stats', `멀티 전적 ${m.played}판 ${m.win}승 ${m.lose}패${vs ? '<br>' + vs : ''}<br>💡 서로의 왕·기물 스킨이 상대 화면에도 보여요`));
      return;
    }

    /* ---------- 대기실 ---------- */
    const code = MJ.Net.code() || '';
    const tk = el('div', 'ticket');
    tk.appendChild(el('div', 'tl', 'ROOM CODE · 방 코드'));
    const dg = el('div', 'digits', code.split('').map(c => `<span>${esc(c)}</span>`).join(''));
    dg.onclick = async () => { try { await navigator.clipboard.writeText(code); MJ.UI.toast('코드를 복사했어요'); } catch (e) {} };
    tk.appendChild(dg);
    tk.appendChild(el('div', 'tap', '코드를 누르면 복사돼요'));
    if (!opp) tk.appendChild(el('div', 'wait', (view === 'host' ? '친구를 기다리는 중' : (MJ.Net.connected() ? '방장 정보를 받는 중' : '연결 중')) + ' <span class="dots"><i></i><i></i><i></i></span>'));
    body.appendChild(tk);

    if (view === 'host' && !opp) {
      const kk = el('button', 'btn kakao' + (autoShareFailed ? ' pulse' : ''), KK_SVG + '<span>카카오톡으로 초대 보내기</span>');
      kk.style.marginTop = '12px';
      kk.onclick = () => { autoShareFailed = false; kk.classList.remove('pulse'); MJ.Invite.share(code); };
      body.appendChild(kk);
      const row = el('div', 'sub-row');
      const cp = el('button', 'btn lacq', '🔗 메시지 복사'); cp.onclick = () => MJ.Invite.copy(code);
      const ot = el('button', 'btn lacq', '📤 다른 앱 공유'); ot.onclick = () => MJ.Invite.shareOther(code);
      row.appendChild(cp); row.appendChild(ot); body.appendChild(row);
    }

    /* 선수 */
    const mySide = view === 'host' ? (R.side === 'han' ? 'han' : 'cho')
      : (roomInfo && roomInfo.side !== 'random' ? MJ.other(roomInfo.side) : 'han');
    const vsBox = el('div', 'room-vs');
    vsBox.appendChild(playerChip(P.nick + ' (나)', view === 'host' ? '👑 방장' : '참가자', true, false, kingOf(store().loadout, mySide), mySide));
    vsBox.appendChild(el('div', 'vs-mark small', 'VS'));
    const oSide = MJ.other(mySide);
    const oc = opp
      ? playerChip(opp.nick, view === 'host' ? '참가자' : '👑 방장', MJ.Net.connected(), false, kingOf(opp.loadout, oSide), oSide)
      : playerChip('대기 중…', '초대를 보내 주세요', false, true);
    if (opp && joinedFlash) { oc.classList.add('joined'); joinedFlash = false; }
    vsBox.appendChild(oc);
    body.appendChild(vsBox);

    const sec = el('div', 'lb-sec');
    if (view === 'host') {
      label('내 진영 (초나라가 먼저 둡니다)', sec);
      sec.appendChild(MJ.UI.seg([{ v: 'cho', label: '초나라', cls: 'cho' }, { v: 'han', label: '한나라', cls: 'han' }, { v: 'random', label: '🎲 랜덤' }], R.side, v => { R.side = v; MJ.Store.save(); sendRoom(); render(); }));
      label('내 차림', sec);
      sec.appendChild(MJ.UI.seg(forms, R.form, v => { R.form = v; MJ.Store.save(); sendRoom(); }));
      label('한 수 제한시간', sec);
      sec.appendChild(MJ.UI.seg(MJ.CONFIG.timeLimits.map(t => ({ v: t, label: t ? t + '초' : '없음' })), R.time, v => { R.time = v; MJ.Store.save(); sendRoom(); }));
      if (opp) sec.appendChild(el('div', 'hint-line', `상대 차림: ${esc(opp.form || '마상마상')}`));
      body.appendChild(sec);
      const go = el('button', 'btn primary big', opp ? '⚔️ 대국 시작' : '⏳ 친구가 들어오면 시작할 수 있어요');
      go.disabled = !opp;
      go.onclick = () => hostStart(false);
      body.appendChild(go);
    } else {
      if (roomInfo) {
        const sideTxt = roomInfo.side === 'random' ? '🎲 랜덤' : `방장 ${MJ.CONFIG.sides[roomInfo.side].name} → 나는 ${MJ.CONFIG.sides[MJ.other(roomInfo.side)].name}`;
        sec.appendChild(el('div', 'hint-line', `진영: ${esc(sideTxt)} · 제한시간: ${roomInfo.time ? roomInfo.time + '초' : '없음'}`));
      }
      label('내 차림', sec);
      sec.appendChild(MJ.UI.seg(forms, R.form, v => { R.form = v; MJ.Store.save(); MJ.Net.send({ t: 'guest-form', form: v }); }));
      body.appendChild(sec);
      body.appendChild(el('div', 'status-line', MJ.Net.connected() ? '⏳ 방장이 대국을 시작하기를 기다리는 중…' : '🔄 연결 중…'));
    }
    const out = el('button', 'btn ghost', '🚪 방 나가기');
    out.onclick = () => { leave(); render(); };
    body.appendChild(out);
  }

  function playerChip(name, sub, on, waiting, king, side) {
    const d = document.createElement('div');
    d.className = 'pchip' + (on ? ' on' : '') + (waiting ? ' waiting' : '');
    if (king) {
      const c = document.createElement('canvas'); c.width = 112; c.height = 112;
      try { MJ.PieceArt.portrait(c.getContext('2d'), 112, 112, king, side); } catch (e) {}
      c.style.boxShadow = `0 0 0 2px ${side === 'cho' ? '#1cffc8' : '#ff2d45'}`;
      d.appendChild(c);
    } else d.insertAdjacentHTML('beforeend', '<div class="ph">❔</div>');
    d.insertAdjacentHTML('beforeend', `<b>${esc(name)}</b><small>${esc(sub)}</small>`);
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
      const ci = document.querySelector('.code-boxes input'); if (ci) { ci.value = code; ci.dispatchEvent(new Event('input')); }
      MJ.UI.toast(e.message || '방에 참가하지 못했어요', 3500);
    }
  }

  function resendHello() { if (MJ.Net.connected()) MJ.Net.send({ t: 'loadout', loadout: store().loadout }); }
  return { open, render, autoJoin, resendHello, requestRematch, leaveToMenu, desync, back: () => { if (MJ.Net.role()) leave(); MJ.UI.back(); } };
})();
