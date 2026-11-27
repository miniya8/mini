/* =========================================================
 * 부팅 + 버튼 연결
 * 버튼에 data-act="이름" 을 달고 아래 ACTIONS 에 함수 추가하면 동작합니다.
 * ========================================================= */
(function () {
  const ACTIONS = {
    'enter': () => { MJ.Audio.unlock(); if (MJ.Store.get().settings.fullscreen) MJ.fullscreen(true); MJ.UI.show('menu'); },
    'resume': () => MJ.Game.resume(),
    'multi': () => MJ.Lobby.open(),
    'multi-back': () => MJ.Lobby.back(),
    'help': () => MJ.UI.help(),
    'nick': () => MJ.UI.editNick(),
    'setup-ai': () => MJ.UI.openSetup('ai'),
    'setup-local': () => MJ.UI.openSetup('local'),
    'custom': () => MJ.UI.openCustom(),
    'settings': () => MJ.UI.openSettings(),
    'back': () => MJ.UI.back(),
    'custom-reset': () => MJ.UI.confirm('꾸미기 초기화', '장기판·왕·기물 스킨을 기본으로 되돌릴까요?', MJ.UI.resetCustom),
    'start': () => { MJ.Store.save(); MJ.Game.start(MJ.Store.get().lastSetup); },
    'undo': () => MJ.Game.undo(),
    'pass': () => MJ.Game.pass(),
    'resign': () => MJ.Game.resign(),
    'game-menu': () => MJ.Game.menu(),
  };
  MJ.ACTIONS = ACTIONS; // 외부 팩에서 MJ.ACTIONS.myAction = fn 으로 확장 가능

  /* 전체화면 (안드로이드 크롬 등 지원 브라우저만) */
  MJ.fullscreen = function (on) {
    const d = document, el = d.documentElement;
    try {
      if (on && !d.fullscreenElement && el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      if (!on && d.fullscreenElement && d.exitFullscreen) d.exitFullscreen().catch(() => {});
    } catch (e) {}
  };

  function boot() {
    MJ.Store.load();
    MJ.UI.init();
    MJ.Game.init();

    document.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const fn = ACTIONS[b.dataset.act];
      if (fn) { MJ.Audio.sfx('button'); fn(); }
    });
    // 첫 터치에 오디오 시작 (모바일 정책)
    const unlock = () => { MJ.Audio.unlock(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);

    let rt = null;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => MJ.emit('resize'), 120); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
    // 휴대폰: 길게 누르기 메뉴 / 핀치 확대 막기
    document.addEventListener('contextmenu', e => { if (!e.target.closest('input,textarea')) e.preventDefault(); });
    document.addEventListener('gesturestart', e => e.preventDefault());
    // (더블탭 확대는 CSS touch-action: manipulation 으로 막음)
    // 링크로 들어오면 바로 멀티 참가 (?room=CODE)
    MJ.Invite && MJ.Invite.checkLink();
    // 안드로이드 뒤로가기 대신 화면 내 뒤로
    document.addEventListener('visibilitychange', () => { if (document.hidden) MJ.Audio.pauseBgm(); else if (MJ.Audio.isUnlocked()) MJ.Audio.resumeBgm(); });

    MJ.Audio.autoScan();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { MJ.emit('resize'); MJ.UI.refreshMenu(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
