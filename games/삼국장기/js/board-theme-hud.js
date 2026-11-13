
(function setupBoardThemeHUD(){
  const hud = document.getElementById('hud');
  if (!hud || document.getElementById('bd_theme_btn')) return;
  const btn = document.createElement('button');
  btn.id = 'bd_theme_btn';
  btn.title = '클릭하여 5종 전장 테마와 전용 이펙트를 즉시 전환합니다';

  function updateBtnLabel() {
    const meta = window.getBoardMeta ? window.getBoardMeta() : null;
    if (!meta) return;
    btn.innerHTML = `${meta.name} <span style="opacity:0.85;font-size:10px;color:#ffd54a">[${meta.trait}]</span> 🔄`;
  }

  btn.onclick = (e) => {
    e.stopPropagation();
    if (!window.pickRandomBoard) return;
    const nextIdx = ((window.curBoardIdx || 0) + 1) % 5;
    window.pickRandomBoard(nextIdx);
    updateBtnLabel();
    const meta = window.getBoardMeta ? window.getBoardMeta() : null;
    if (meta && typeof toast === 'function') {
      toast(`🗺️ 전장 변경: ${meta.name} (${meta.trait})`, 2000);
    }
  };

  const bl = document.getElementById('bl');
  if (bl && bl.parentNode === hud) {
    hud.insertBefore(btn, bl);
  } else {
    hud.appendChild(btn);
  }

  const origPick = window.pickRandomBoard;
  if (origPick) {
    window.pickRandomBoard = function(idx) {
      const r = origPick(idx);
      updateBtnLabel();
      return r;
    };
  }
  updateBtnLabel();
})();
