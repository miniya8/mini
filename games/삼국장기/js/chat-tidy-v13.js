/* ============================================================================
 * [채팅창 정리 v13]  js/chat-tidy-v13.js
 *  해설(중계)과 군주 멘트 때문에 채팅창이 지저분해지는 문제를 정리합니다.
 *   · 군주/장수 멘트는 채팅 기록에 쌓지 않고, 화면 위쪽에 잠깐 떴다 사라지는 말풍선으로 보여 줌 (8초에 1번까지)
 *   · 해설 탭: 중요 사건(잡기·장군·외통·스킬·필살기·승패 등)은 항상 남기고, 잡담성 해설은 10초에 1개만 · 한 줄로 짧게
 *   · 판 위 해설 배너: 중요 사건만 표시
 *   · 채팅 탭 위에 [해설: 요약 / 전체 / 끔] 전환 버튼 (기본: 요약, 기기에 저장)
 *  사람끼리 주고받는 채팅은 건드리지 않습니다.
 * ============================================================================ */
(function jgChatTidy() {
  if (window.jgChatTidy) return;
  const T = window.jgChatTidy = { mode: 'sum' };
  try { const m = localStorage.getItem('jg_tidy_mode'); if (m === 'all' || m === 'sum' || m === 'off') T.mode = m; } catch (e) {}
  const IMPORTANT = /잡았|잡혔|잡습|포획|장군|외통|응징|스킬|필살|승리|패배|무승부|기권|시간 ?초과|선공|무르기|접속|연결|대국 시작|종료|체크|궁성 함락|발동|일기토/;
  let lastFluff = 0, lastQuote = 0, bubble = null, bubbleTimer = 0;

  /* 한 줄 요약: 이모지/추임새 정리 후 첫 문장만 (최대 46자) */
  function shorten(t) {
    let s = String(t || '').replace(/\s+/g, ' ').trim();
    const cut = s.search(/[!?.~…](\s|$)/); if (cut > 8 && cut < s.length - 1) s = s.slice(0, cut + 1);
    if (s.length > 46) s = s.slice(0, 45) + '…';
    return s;
  }
  function showBubble(html, color) {
    if (T.mode === 'off') return;
    const now = performance.now(); if (now - lastQuote < 8000) return; lastQuote = now;
    if (!bubble) { bubble = document.createElement('div'); bubble.id = 'jg_tidy_bubble'; bubble.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(64px + env(safe-area-inset-top,0px));max-width:min(88vw,520px);z-index:60;pointer-events:none;padding:7px 12px;border-radius:12px;background:rgba(12,16,30,.86);color:#fef3c7;font:700 12.5px/1.4 "Noto Sans KR",sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.4);opacity:0;transition:opacity .25s ease, transform .25s ease;'; document.body.appendChild(bubble); }
    bubble.style.borderLeft = `4px solid ${color || '#ffd54a'}`; bubble.innerHTML = html; bubble.style.opacity = '1';
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => { if (bubble) bubble.style.opacity = '0'; }, 3200);
  }

  /* 채팅 기록(#xlog): 군주 멘트 → 말풍선으로 옮김 */
  function onXlog(node) {
    if (T.mode === 'all' || !node || node.nodeType !== 1) return;
    const txt = node.textContent || '', isQuote = /^\s*\S{0,4}\s*\[[^\]]{1,12}\]\s*"/.test(txt) || (node.style && node.style.borderLeft && /\[.+\]\s*"/.test(txt));
    if (!isQuote) return;
    const first = (node.innerHTML || '').split('<br>')[0];
    const col = (node.style && node.style.borderLeftColor) || '#ffd54a';
    node.remove();
    showBubble(first.replace(/"([^"]{60})[^"]*"/, '"$1…"'), col);
  }
  /* 해설 탭(#xcom): 잡담성 해설 제한 + 한 줄 요약 */
  function onXcom(node) {
    if (T.mode === 'all' || !node || node.nodeType !== 1) return;
    const b = node.querySelector('b'), head = b ? b.textContent : '', body = (node.textContent || '').slice(head.length).trim();
    if (IMPORTANT.test(body)) { node.lastChild && (node.lastChild.textContent = ' ' + shorten(body)); return; }
    const now = performance.now();
    if (T.mode === 'off' || now - lastFluff < 10000) { node.remove(); return; }
    lastFluff = now; if (node.lastChild) node.lastChild.textContent = ' ' + shorten(body);
  }
  /* 판 위 배너(#xcb): 중요 사건만 */
  function onBanner(b) {
    if (T.mode === 'all') return;
    if (!IMPORTANT.test(b.textContent || '')) { b.style.display = 'none'; b.classList.remove('xgo'); }
    else b.textContent = shorten(b.textContent);
  }

  /* 전환 버튼 */
  const LABEL = { sum: '💬 해설: 요약', all: '💬 해설: 전체', off: '💬 해설: 끔' };
  function addToggle() {
    if (document.getElementById('jg_tidy_btn')) return;
    const host = document.getElementById('xtabs') || document.getElementById('xchat'); if (!host) return;
    const btn = document.createElement('button'); btn.id = 'jg_tidy_btn'; btn.type = 'button'; btn.textContent = LABEL[T.mode];
    btn.style.cssText = 'margin-left:auto;padding:3px 9px;border-radius:99px;border:1px solid rgba(255,213,74,.6);background:rgba(15,23,42,.8);color:#ffd54a;font:800 11px "Noto Sans KR",sans-serif;cursor:pointer;';
    btn.onclick = e => { e.stopPropagation(); T.mode = T.mode === 'sum' ? 'off' : T.mode === 'off' ? 'all' : 'sum'; btn.textContent = LABEL[T.mode]; try { localStorage.setItem('jg_tidy_mode', T.mode); } catch (e2) {} };
    if (getComputedStyle(host).display.indexOf('flex') < 0 && host.id === 'xtabs') host.style.display = host.style.display || '';
    host.appendChild(btn);
  }

  function attach() {
    const xl = document.getElementById('xlog'), xc = document.getElementById('xcom'), xb = document.getElementById('xcb');
    if (xl && !xl.__tidy) { xl.__tidy = 1; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(onXlog))).observe(xl, { childList: true }); }
    if (xc && !xc.__tidy) { xc.__tidy = 1; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(onXcom))).observe(xc, { childList: true }); }
    if (xb && !xb.__tidy) { xb.__tidy = 1; new MutationObserver(() => { if (xb.classList.contains('xgo') && xb.style.display !== 'none') onBanner(xb); }).observe(xb, { attributes: true, attributeFilter: ['class'] }); }
    addToggle();
  }
  attach(); setInterval(attach, 2000);
})();
