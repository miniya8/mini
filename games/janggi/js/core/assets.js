/* =========================================================
 * 이미지 에셋 로더
 * - MJ.Assets.img(path) : 로드 완료면 Image, 아니면 null (로드 시작)
 * - 파일이 없으면 기억해 두고 다시 시도하지 않음 → 텍스트 그림으로 대체
 * - 이미지가 새로 로드되면 onLoad 콜백으로 화면 갱신
 * ========================================================= */
MJ.Assets = (function () {
  const cache = new Map(); // path -> {state:'loading'|'ok'|'missing', img}
  const listeners = [];

  function fill(pattern, vars) {
    if (!pattern) return null;
    return pattern.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));
  }

  function img(path) {
    if (!path) return null;
    let e = cache.get(path);
    if (!e) {
      const im = new Image();
      e = { state: 'loading', img: im };
      cache.set(path, e);
      im.onload = () => { e.state = 'ok'; listeners.forEach(fn => fn(path)); };
      im.onerror = () => { e.state = 'missing'; };
      im.src = path;
    }
    return e.state === 'ok' ? e.img : null;
  }
  function status(path) { const e = cache.get(path); return e ? e.state : 'unknown'; }
  function onLoad(fn) { listeners.push(fn); }

  /* 꾸미기 구성에 필요한 스프라이트 시트·장기판 이미지를 미리 불러옴 (첫 변신 때 끊김 방지) */
  function preloadLoadout(L) {
    if (!L) return;
    const B = MJ.Registry.get('board', L.board); if (B && B.image) img(B.image);
    ['cho', 'han'].forEach(s => {
      MJ.CONFIG.skinnableTypes.concat('K').forEach(t => {
        const sk = t === 'K' ? MJ.Registry.get('king', L.kings[s]) : MJ.Registry.get('skin', (L.skins[s] || {})[t]);
        const sp = sk && sk.sprite && MJ.spriteFor(sk.sprite, s, t);
        if (sp) img(sp.sheet);
      });
    });
  }

  return { img, fill, status, onLoad, preloadLoadout };
})();
