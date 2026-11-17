/* ============================================================================
 * [삼국지 전설장기 메인 화면 및 로비 안정화 패치]
 * ============================================================================ */
(function() {
  function forceShowLobby() {
    const st = document.getElementById('st');
    if (st) {
      st.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 99999 !important; background: #000 !important;';
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceShowLobby);
  } else {
    forceShowLobby();
  }
  window.addEventListener('load', forceShowLobby);
  setTimeout(forceShowLobby, 100);
  setTimeout(forceShowLobby, 500);
})();