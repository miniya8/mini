/* =========================================================
 * 카카오톡 초대 + 초대 링크로 바로 참가
 * ---------------------------------------------------------
 * 초대 메시지:  ⚔️ 장기 한 판! 코드 ABCDE  + 링크
 * 링크를 누르면 게임이 열리면서 그 방에 바로 참가합니다 (?room=ABCDE)
 *
 * 보내는 방법 (위에서부터 가능한 것 사용)
 *  1) 카카오 SDK — jsKey 를 넣으면 카카오톡 공유 카드로 전송 (버튼: 바로 참가)
 *     · developers.kakao.com 에서 앱 생성 → JavaScript 키 복사
 *     · [플랫폼 > Web] 에 게임을 올린 사이트 도메인 등록
 *  2) 안드로이드 — 카카오톡 공유 화면을 바로 엶 (키 필요 없음)
 *  3) 아이폰 등 — 휴대폰 공유창 → 카카오톡 선택
 *  4) 모두 안 되면 — 메시지를 복사 → 카카오톡에 붙여넣기
 * ※ 링크 초대는 게임을 웹(https)에 올렸을 때 동작. 파일로 직접 열면 코드만 전송됩니다.
 * ========================================================= */
MJ.KAKAO_CONFIG = {
  jsKey: '',   // 예) 'a1b2c3d4e5f6...'  (비워두면 SDK 없이 동작)
  sdk: 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js',
  inviteText: code => `⚔️ 장기 한 판! 코드 ${code}`,
  buttonTitle: '바로 참가',
};

MJ.Invite = (function () {
  const K = MJ.KAKAO_CONFIG;

  function url(code) {
    if (!/^https?:/.test(location.protocol)) return null;
    return location.origin + location.pathname + '?room=' + encodeURIComponent(code);
  }
  function message(code) {
    const u = url(code);
    return K.inviteText(code) + (u ? '\n' + u : '');
  }

  let sdkP = null;
  function loadSdk() {
    if (window.Kakao) return Promise.resolve();
    if (sdkP) return sdkP;
    sdkP = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = K.sdk; s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = () => { sdkP = null; rej(); };
      document.head.appendChild(s);
    });
    return sdkP;
  }

  async function viaSdk(code) {
    const u = url(code);
    if (!K.jsKey || !u) return false;
    try {
      await loadSdk();
      if (!window.Kakao.isInitialized()) window.Kakao.init(K.jsKey);
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: K.inviteText(code),
        link: { mobileWebUrl: u, webUrl: u },
        buttonTitle: K.buttonTitle,
      });
      return true;
    } catch (e) { return false; }
  }

  function viaAndroid(code) {
    if (!/Android/i.test(navigator.userAgent)) return false;
    const intent = 'intent:#Intent;action=android.intent.action.SEND;type=text/plain;'
      + 'S.android.intent.extra.TEXT=' + encodeURIComponent(message(code)) + ';package=com.kakao.talk;end';
    location.href = intent;
    return true;
  }

  async function viaShareSheet(code) {
    if (!navigator.share) return false;
    try {
      const u = url(code);
      await navigator.share(u ? { text: K.inviteText(code), url: u } : { text: message(code) });
      return true;
    } catch (e) { return e && e.name === 'AbortError'; } // 사용자가 닫은 경우도 처리 완료로 봄
  }

  async function copy(code) {
    const msg = message(code);
    try { await navigator.clipboard.writeText(msg); MJ.UI.toast('초대 메시지를 복사했어요. 카카오톡에 붙여넣기 하세요', 3000); }
    catch (e) { MJ.UI.modal({ title: '초대 메시지', text: msg + '\n\n길게 눌러 복사한 뒤 카카오톡에 보내세요.' }); }
  }

  async function share(code) {
    if (!url(code)) MJ.UI.toast('파일로 실행 중이라 코드만 보내요 (링크 초대는 웹에 올린 버전에서)', 3000);
    if (await viaSdk(code)) return;
    if (viaAndroid(code)) {
      // 카카오톡이 안 열리면(앱 없음/미지원 브라우저) 공유창으로
      setTimeout(async () => { if (!document.hidden) { if (!(await viaShareSheet(code))) copy(code); } }, 1500);
      return;
    }
    if (await viaShareSheet(code)) return;
    copy(code);
  }

  /* 링크로 들어왔을 때: ?room=ABCDE 또는 #room-ABCDE */
  function checkLink() {
    const q = new URLSearchParams(location.search);
    let code = q.get('room');
    const h = location.hash.match(/^#room-([A-Za-z0-9]+)/);
    if (!code && h) code = h[1];
    if (!code) return false;
    code = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, MJ.NET_CONFIG.codeLen);
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    MJ.Lobby.autoJoin(code);
    return true;
  }

  return { share, url, message, checkLink, copy };
})();
