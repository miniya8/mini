/* =========================================================
 * 멀티 대전 실시간 채팅
 * - 오른쪽 메뉴 패널의 💬 버튼 → 채팅 창 (빠른 문구 + 직접 입력)
 * - 상대 메시지는 상대 카드 안 말풍선으로 잠깐 표시 (장기판은 가리지 않음)
 * 빠른 문구는 아래 QUICK 배열만 고치면 됩니다.
 * ========================================================= */
MJ.Chat = (function () {
  const QUICK = ['안녕하세요! 👋', '잘 부탁해요 🙏', '좋은 수네요 👍', '잠시만요…', '아이고! 😱', 'ㅋㅋㅋ', '한 판 더? 🔄', '수고하셨습니다 🙇'];
  const MAX = 80;
  const $ = s => document.querySelector(s);
  let log = [], unread = 0, isOpen = false, lastSend = 0;

  function nickMe() { return MJ.Store.get().profile.nick; }
  function nickOpp() { const st = MJ.Game.state(); return st && st.nicks ? st.nicks[MJ.other(st.mySide)] : '상대'; }

  function send(text) {
    text = String(text || '').trim().slice(0, MAX);
    if (!text) return;
    if (Date.now() - lastSend < 700) { MJ.UI.toast('조금만 천천히 보내 주세요'); return; }
    if (!MJ.Net.send({ t: 'chat', text })) { MJ.UI.toast('연결이 끊겨 보낼 수 없어요'); return; }
    lastSend = Date.now();
    push({ me: true, nick: nickMe(), text });
  }
  function receive(msg) {
    const text = String(msg.text || '').slice(0, MAX);
    if (!text) return;
    push({ me: false, nick: nickOpp(), text });
    if (!isOpen) { unread++; badge(); }
    MJ.Audio.sfx('chat');
    MJ.Game.showChat && MJ.Game.showChat(text);
  }
  function push(m) { log.push(m); if (log.length > 100) log.shift(); render(); }

  function badge() {
    document.querySelectorAll('.chat-badge').forEach(b => { b.textContent = unread > 9 ? '9+' : unread; b.style.display = unread ? '' : 'none'; });
  }
  function render() {
    const list = $('#chatList');
    if (!list) return;
    list.innerHTML = '';
    log.forEach(m => {
      const row = document.createElement('div');
      row.className = 'cmsg' + (m.me ? ' me' : '');
      const n = document.createElement('small'); n.textContent = m.nick;
      const t = document.createElement('span'); t.textContent = m.text;
      row.appendChild(n); row.appendChild(t); list.appendChild(row);
    });
    list.scrollTop = list.scrollHeight;
  }
  function open() {
    isOpen = true; unread = 0; badge();
    const sh = $('#chatSheet'); sh.classList.add('show');
    const q = $('#chatQuick');
    if (!q.childElementCount) QUICK.forEach(t => {
      const b = document.createElement('button'); b.textContent = t; b.onclick = () => send(t); q.appendChild(b);
    });
    render();
  }
  function close() { isOpen = false; $('#chatSheet').classList.remove('show'); const i = $('#chatInput'); i && i.blur(); }
  function toggle() { isOpen ? close() : open(); }
  function reset() { log = []; unread = 0; badge(); render(); close(); }

  function init() {
    const f = $('#chatForm');
    if (f) f.addEventListener('submit', e => { e.preventDefault(); const i = $('#chatInput'); send(i.value); i.value = ''; });
    const c = $('#chatClose'); if (c) c.onclick = close;
    badge();
  }
  return { init, send, receive, open, close, toggle, reset, QUICK };
})();
