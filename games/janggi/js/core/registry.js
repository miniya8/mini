/* =========================================================
 * 미니의 커스텀 장기 - 레지스트리 (확장의 중심)
 * ---------------------------------------------------------
 * 모든 콘텐츠(장기판, 기물 스킨, 왕, BGM, 효과음)는
 * MJ.register(종류, 데이터) 로 등록됩니다.
 *
 *   MJ.register('board', { id:'myboard', name:'내 장기판', ... });
 *   MJ.register('skin',  [ {...}, {...} ]);   // 배열도 가능
 *
 * 종류(kind): 'board' | 'skin' | 'king' | 'bgm' | 'sfx'
 * 새 js 파일을 만들어 index.html 의 "추가 콘텐츠" 구역에
 * <script> 한 줄만 넣으면 게임 전체(꾸미기 화면 포함)에 반영됩니다.
 * ========================================================= */
window.MJ = window.MJ || {};

MJ.Registry = (function () {
  const stores = {};
  const listeners = [];

  function store(kind) {
    if (!stores[kind]) stores[kind] = new Map();
    return stores[kind];
  }
  function add(kind, item) {
    if (!item || !item.id) { console.warn('[MJ] id 없는 항목은 등록할 수 없어요:', kind, item); return; }
    const prev = store(kind).get(item.id);
    // 같은 id 를 다시 등록하면 덮어쓰기(일부 필드만 바꾸는 패치도 가능)
    store(kind).set(item.id, prev && item.$patch ? Object.assign({}, prev, item) : item);
    listeners.forEach(fn => fn(kind, item));
  }
  function addMany(kind, arr) { arr.forEach(it => add(kind, it)); }
  function get(kind, id) { return store(kind).get(id) || null; }
  function list(kind, filter) {
    const arr = Array.from(store(kind).values()).filter(it => !it.hidden);
    return filter ? arr.filter(filter) : arr;
  }
  function first(kind) { return list(kind)[0] || null; }
  function onChange(fn) { listeners.push(fn); }
  return { add, addMany, get, list, first, onChange };
})();

MJ.register = function (kind, data) {
  Array.isArray(data) ? MJ.Registry.addMany(kind, data) : MJ.Registry.add(kind, data);
};
