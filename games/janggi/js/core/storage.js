/* =========================================================
 * 저장소 — 꾸미기 설정, 환경설정, 전적을 브라우저에 저장
 * 저장 구조가 바뀌면 version 을 올리고 migrate 에 처리 추가
 * ========================================================= */
MJ.Store = (function () {
  const KEY = 'miniCustomJanggi.save';
  const VERSION = 1;
  const PRESETS = 5; // 꾸미기 프리셋 저장 칸 수

  function defaults() {
    const skins = {};
    ['cho', 'han'].forEach(s => {
      skins[s] = {};
      MJ.CONFIG.skinnableTypes.forEach(t => { skins[s][t] = 'warlord'; });
    });
    return {
      version: VERSION,
      loadout: { board: 'castle-yard', kings: { cho: 'warlord-king', han: 'warlord-king' }, skins, skills: MJ.CONFIG.skills.playerDefault.slice() },
      settings: { bgmVol: 0.45, sfxVol: 0.8, bgmOn: true, sfxOn: true,
                  particles: true, hints: true, quotes: true, animSpeed: 1.2,
                  aura: true, vibrate: true, fullscreen: true, wakeLock: true },
      resume: null,
      presets: [null, null, null, null, null],
      lastSetup: { mode: 'ai', mySide: 'cho', diff: 'normal', myForm: '마상마상', oppForm: 'random', time: 0 },
      stats: { played: 0, win: 0, lose: 0, draw: 0 },
      multiStats: { played: 0, win: 0, lose: 0, vs: {} },
      profile: { nick: '' },
      room: { side: 'random', form: '마상마상', time: 60 },
    };
  }

  function deepMerge(base, over) {
    if (!over || typeof over !== 'object') return base;
    Object.keys(over).forEach(k => {
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = deepMerge(base[k], over[k]);
      else base[k] = over[k];
    });
    return base;
  }

  /* 삭제된 콘텐츠 id 가 저장돼 있으면 기본값으로 되돌림 */
  function fixLoadout(L) {
    const Rg = MJ.Registry, D = defaults().loadout;
    L.kings = L.kings || {}; L.skins = L.skins || { cho: {}, han: {} };
    if (!Rg.get('board', L.board)) L.board = Rg.get('board', D.board) ? D.board : (Rg.first('board') || {}).id;
    ['cho', 'han'].forEach(s => {
      if (!Rg.get('king', L.kings[s])) L.kings[s] = Rg.get('king', D.kings[s]) ? D.kings[s] : Rg.first('king').id;
      L.skins[s] = L.skins[s] || {};
      MJ.CONFIG.skinnableTypes.forEach(t => {
        const sk = Rg.get('skin', L.skins[s][t]);
        if (!sk || (sk.types && !sk.types.includes(t))) L.skins[s][t] = Rg.get('skin', D.skins[s][t]) ? D.skins[s][t] : 'classic';
      });
    });
    if (!Array.isArray(L.skills)) L.skills = MJ.CONFIG.skills.playerDefault.slice();
    L.skills = L.skills.filter(id => Rg.get('skill', id)).slice(0, MJ.CONFIG.skills.slots);
    return L;
  }
  function validate(d) {
    fixLoadout(d.loadout);
    if (!Array.isArray(d.presets)) d.presets = [];
    while (d.presets.length < PRESETS) d.presets.push(null);
    d.presets.length = PRESETS;
    if (!d.profile.nick) d.profile.nick = '장기왕' + Math.floor(1000 + Math.random() * 9000);
    return d;
  }

  let data = null;
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* 무시 */ }
    data = validate(deepMerge(defaults(), saved));
    return data;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 저장 불가 환경 */ } }
  function get() { return data || load(); }
  function reset() { data = validate(defaults()); save(); return data; }

  /* ---------- 꾸미기 프리셋 (최대 5개) ---------- */
  const clone = o => JSON.parse(JSON.stringify(o));
  function savePreset(k, name) {
    const d = get();
    d.presets[k] = { name: name || (d.presets[k] && d.presets[k].name) || `프리셋 ${k + 1}`, loadout: clone(d.loadout), at: Date.now() };
    save();
  }
  function loadPreset(k) {
    const d = get(), P = d.presets[k];
    if (!P) return false;
    const L = fixLoadout(clone(P.loadout));
    Object.keys(L).forEach(key => { d.loadout[key] = L[key]; });
    save();
    return true;
  }
  function deletePreset(k) { get().presets[k] = null; save(); }
  function renamePreset(k, name) { const P = get().presets[k]; if (P && name) { P.name = name; save(); } }

  return { load, save, get, reset, defaults, fixLoadout, savePreset, loadPreset, deletePreset, renamePreset, PRESETS };
})();
