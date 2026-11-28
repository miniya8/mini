/* =========================================================
 * 카카오톡 초대 + 초대 링크로 바로 참가
 * ---------------------------------------------------------
 * 초대 메시지:  ⚔️ 장기 한 판! 코드 1234  + 링크
 * 링크를 누르면 게임이 열리면서 그 방에 바로 참가합니다 (?room=1234)
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
  // SDK 공유 카드에 쓰는 그림 (웹에 올린 주소 기준)
  image: 'assets/images/ui/share.jpg',
  cardTitle: '⚔️ 미니의 커스텀 장기',
  cardDesc: code => `장기 한 판 어때? 코드 ${code} · 누르면 바로 참가`,
  // 공유가 안 될 때: 메시지를 복사하고 카카오톡 앱을 열어 줌 (붙여넣기만 하면 끝)
  openAppAfterCopy: true,
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
      const link = { mobileWebUrl: u, webUrl: u };
      const img = new URL(K.image, location.href).href;
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: { title: K.cardTitle, description: K.cardDesc(code), imageUrl: img, imageWidth: 400, imageHeight: 600, link },
        buttons: [{ title: K.buttonTitle, link }],
      });
      return true;
    } catch (e) {
      try { // 그림 카드가 안 되면 텍스트 카드
        window.Kakao.Share.sendDefault({ objectType: 'text', text: K.inviteText(code), link: { mobileWebUrl: u, webUrl: u }, buttonTitle: K.buttonTitle });
        return true;
      } catch (e2) { return false; }
    }
  }

  const isAndroid = () => /Android/i.test(navigator.userAgent);
  const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inKakao = () => /KAKAOTALK/i.test(navigator.userAgent);

  function viaAndroid(code) {
    if (!isAndroid()) return false;
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
    } catch (e) { return !!(e && e.name === 'AbortError'); } // 사용자가 닫은 경우도 처리 완료로 봄
  }

  function openKakaoApp() {
    if (!K.openAppAfterCopy || !(isAndroid() || isIOS()) || inKakao()) return;
    setTimeout(() => { location.href = 'kakaotalk://launch'; }, 350);
  }

  async function writeClip(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      try { // 예전 방식
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
      } catch (e2) { return false; }
    }
  }

  /* 메시지 복사 (+ 카카오톡 열기) */
  async function copy(code, openApp) {
    const msg = message(code);
    if (await writeClip(msg)) {
      MJ.UI.toast(openApp ? '복사했어요! 카카오톡에서 붙여넣기만 하세요' : '초대 메시지를 복사했어요', 3000);
      if (openApp) openKakaoApp();
      return true;
    }
    MJ.UI.modal({ title: '초대 메시지', text: msg + '\n\n길게 눌러 복사한 뒤 카카오톡에 보내세요.' });
    return false;
  }

  /* 카카오톡으로 초대: SDK → (안드로이드) 카톡 직접 → 공유창 → 복사+카톡 열기
   * opts.auto: 방 만들기 직후 자동 호출 — 실패해도 조용히 false 반환 (버튼을 다시 누르게) */
  async function share(code, opts) {
    const auto = opts && opts.auto;
    if (!url(code) && !auto) MJ.UI.toast('파일로 실행 중이라 코드만 보내요 (링크 초대는 웹에 올린 버전에서)', 3000);
    if (await viaSdk(code)) return true;
    if (viaAndroid(code)) {
      // 카카오톡이 안 열리면(앱 없음/미지원 브라우저) 공유창 → 복사
      setTimeout(async () => { if (!document.hidden) { if (!(await viaShareSheet(code))) copy(code, true); } }, 1500);
      return true;
    }
    if (await viaShareSheet(code)) return true;
    if (auto) return false;
    return copy(code, true);
  }
  /* 카카오톡 말고 다른 앱(문자 등) */
  async function shareOther(code) { if (!(await viaShareSheet(code))) copy(code); }

  /* 붙여넣은 글에서 방 코드 찾기 (링크 / "코드 1234" / 4자리 숫자) */
  const keep = t => [...String(t || '').toUpperCase()].filter(c => MJ.NET_CONFIG.codeChars.includes(c)).join('');
  function parseCode(text) {
    const N = MJ.NET_CONFIG.codeLen;
    text = String(text || '');
    let m = text.match(/[?&#]room[=-]([A-Za-z0-9]+)/);
    if (m) return keep(m[1]).slice(0, N);
    m = text.match(/코드\s*[:：]?\s*([A-Za-z0-9]+)/);
    if (m && keep(m[1]).length === N) return keep(m[1]);
    const all = keep(text);
    if (all.length === N) return all;
    const toks = text.toUpperCase().split(/[^A-Z0-9]+/).filter(t => t.length === N && keep(t) === t);
    return toks.length ? toks[toks.length - 1] : '';
  }


  /* 링크로 들어왔을 때: ?room=1234 또는 #room-1234 */
  function checkLink() {
    const q = new URLSearchParams(location.search);
    let code = q.get('room');
    const h = location.hash.match(/^#room-([A-Za-z0-9]+)/);
    if (!code && h) code = h[1];
    if (!code) return false;
    code = keep(code).slice(0, MJ.NET_CONFIG.codeLen);
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    MJ.Lobby.autoJoin(code);
    return true;
  }

  return { share, shareOther, url, message, checkLink, copy, parseCode };
})();
