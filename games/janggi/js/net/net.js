/* =========================================================
 * 멀티 대전 네트워크 (PeerJS · P2P)
 * ---------------------------------------------------------
 * - 방 만들기: 5자리 코드 생성 → 친구가 코드 입력으로 참가
 * - 서버 없이 기기끼리 직접 연결 (연결 중개만 PeerJS 공개 서버 사용)
 * - 끊김 감지(하트비트) + 재접속 시 대국 상태 동기화
 * 휴대폰 데이터망 등에서 연결이 안 되면 iceServers 에 TURN 서버를 넣으세요.
 * ========================================================= */
MJ.NET_CONFIG = {
  peerLib: 'https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js',
  prefix: 'mini-cjanggi-v1-',
  codeChars: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  codeLen: 5,
  heartbeatMs: 3000,
  timeoutMs: 12000,
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    /* TURN 예시 (직접 발급받은 값으로 교체)
    { urls: 'turn:turn.example.com:3478', username: 'user', credential: 'pass' },
    */
  ],
};

MJ.Net = (function () {
  const C = MJ.NET_CONFIG;
  let peer = null, conn = null, role = null, code = null;
  let hb = null, lastSeen = 0, alive = false;
  const handlers = {};
  const on = (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); };
  const fire = (ev, ...a) => (handlers[ev] || []).forEach(fn => fn(...a));

  let libP = null;
  function loadLib() {
    if (window.Peer) return Promise.resolve();
    if (libP) return libP;
    libP = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = C.peerLib; s.onload = res;
      s.onerror = () => { libP = null; rej(new Error('멀티 모듈을 불러오지 못했어요. 인터넷 연결을 확인하세요.')); };
      document.head.appendChild(s);
    });
    return libP;
  }
  function newCode() {
    let s = '';
    for (let i = 0; i < C.codeLen; i++) s += C.codeChars[Math.floor(Math.random() * C.codeChars.length)];
    return s;
  }
  function makePeer(id) {
    return new window.Peer(id, { debug: 0, config: { iceServers: C.iceServers } });
  }
  function errText(e) {
    const t = e && e.type;
    if (t === 'peer-unavailable') return '방을 찾을 수 없어요. 코드를 확인하거나 방장이 방을 만들었는지 확인하세요.';
    if (t === 'network' || t === 'server-error' || t === 'socket-error') return '연결 서버에 접속하지 못했어요. 인터넷을 확인하세요.';
    if (t === 'browser-incompatible') return '이 브라우저는 멀티 대전을 지원하지 않아요.';
    return '연결 오류: ' + (t || (e && e.message) || '알 수 없음');
  }

  function attach(c) {
    if (conn && conn !== c) { try { conn.close(); } catch (e) {} }
    conn = c;
    c.on('open', () => { markAlive(); fire('open'); startHeartbeat(); });
    c.on('data', d => {
      markAlive();
      if (!d || d.t === 'ping') return;
      fire('msg', d);
    });
    c.on('close', () => { if (conn === c) { setAlive(false); } });
    c.on('error', () => {});
  }
  function markAlive() { lastSeen = Date.now(); if (!alive) setAlive(true); }
  function setAlive(v) { alive = v; fire(v ? 'alive' : 'lost'); }
  function startHeartbeat() {
    clearInterval(hb);
    hb = setInterval(() => {
      if (conn && conn.open) { try { conn.send({ t: 'ping' }); } catch (e) {} }
      if (alive && Date.now() - lastSeen > C.timeoutMs) setAlive(false);
      if (peer && peer.disconnected && !peer.destroyed) { try { peer.reconnect(); } catch (e) {} }
    }, C.heartbeatMs);
  }

  /* 방 만들기 */
  async function host() {
    await loadLib();
    leave(true);
    role = 'host';
    return new Promise((res, rej) => {
      let tries = 0;
      const tryOpen = () => {
        code = newCode();
        peer = makePeer(C.prefix + code);
        peer.on('open', () => res(code));
        peer.on('connection', c => { attach(c); });
        peer.on('error', e => {
          if (e.type === 'unavailable-id' && tries++ < 5) { peer.destroy(); tryOpen(); return; }
          fire('error', errText(e)); rej(new Error(errText(e)));
        });
        peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
      };
      tryOpen();
    });
  }

  /* 코드로 참가 */
  async function join(roomCode) {
    await loadLib();
    const target = C.prefix + roomCode.toUpperCase().trim();
    if (!peer || peer.destroyed) {
      peer = makePeer();
      await new Promise((res, rej) => {
        peer.on('open', res);
        peer.on('error', e => { fire('error', errText(e)); rej(new Error(errText(e))); });
      });
      peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
    }
    role = 'guest'; code = roomCode.toUpperCase().trim();
    return new Promise((res, rej) => {
      const c = peer.connect(target, { reliable: true });
      let ok = false;
      const to = setTimeout(() => { if (!ok) rej(new Error('방에 연결하지 못했어요. 코드를 확인하거나 잠시 후 다시 시도하세요.')); }, 15000);
      peer.once && peer.once('error', e => { if (!ok) { clearTimeout(to); rej(new Error(errText(e))); } });
      attach(c);
      c.on('open', () => { ok = true; clearTimeout(to); res(); });
    });
  }

  function send(msg) {
    if (conn && conn.open) { try { conn.send(msg); return true; } catch (e) {} }
    return false;
  }
  function leave(silent) {
    clearInterval(hb);
    try { conn && conn.close(); } catch (e) {}
    try { peer && peer.destroy(); } catch (e) {}
    conn = null; peer = null; alive = false;
    if (!silent) { role = null; code = null; }
  }

  return {
    host, join, send, leave, on, loadLib,
    role: () => role, code: () => code, connected: () => !!(conn && conn.open && alive),
  };
})();
