/* ============================================================================
 * [테스트 장기판 v17]  js/test-board-v17.js
 *  index.html?test 로 열면(또는 test.html) 바로 연습 대국이 시작되고, 화면 아래 '🧪' 패널에서
 *  스킬 · 군주 필살기 · 응징 · 환경 이벤트 · 장기판 · 기물 연출을 하나씩 골라 바로 재생해 볼 수 있습니다.
 *   · ★ 새로 추가 탭: 최근에 추가·수정된 연출만 모아 둠 (새 기능을 넣을 때 여기에 한 줄 추가)
 *   · 테스트 중에는 AI가 두지 않고 시간 제한도 멈춤 · 일반 대국/멀티 대국에는 영향 없음
 *   · 오른쪽 위에 현재 프레임(fps)과 성능 단계 표시
 * ============================================================================ */
(function jgTestBoard17() {
  if (window.jgTestBoard) return;
  const TB = window.jgTestBoard = {};
  const isTest = /[?&]test\b/.test(location.search) || /test\.html$/.test(location.pathname);
  TB.active = false;

  /* ---------- 새로 추가된 항목 (새 연출을 넣으면 여기에 추가) ---------- */
  const NEW = [
    ['🎬 화룡 강림 (영상)', () => fire('nuke')], ['🎬 뇌신 폭풍 (영상)', () => fire('meteor')], ['🎬 빙하 붕괴 (영상)', () => fire('vortex')], ['📏 선 확인: 눈보라', () => { window.pickRandomBoard(1); setTimeout(() => window.jgEnv3.weatherNow(7), 500); }], ['📏 선 확인: 모래폭풍', () => { window.pickRandomBoard(0); setTimeout(() => window.jgEnv3.weatherNow(0), 500); }], ['🌋 대지 분쇄', () => fire('kame2')],
    ['🎨 속성 자국 7종', () => allDecals()], ['💥 임팩트 컷(필살기)', () => ult('lvbu')], ['🌸 유비 꽃잎 자국', () => ult('liubei')],
    ['🎯 이동 표시(차 선택)', () => selectDemo()], ['🏯 장기판 꾸밈 순환', () => cycleMaps()], ['⚔️ 잡기 연출', () => captureDemo()], ['🤺 일기토', () => duel()]
  ];
  const SKILLS = [['🔥 화룡 강림', 'nuke'], ['⛈️ 뇌신 폭풍', 'meteor'], ['🌋 대지 분쇄', 'kame2'], ['🧊 빙하 붕괴', 'vortex'], ['👽 외계인', 'alien'], ['🐉 에네르기파', 'kame'], ['⚡ 천벌성창', 'skyfall']];
  const WL = [['zhuge', '제갈량'], ['sunquan', '손권'], ['caocao', '조조'], ['liubei', '유비'], ['lvbu', '여포'], ['simayi', '사마의']];
  const MAPS = ['🏜️ 사막', '❄️ 설원', '🌲 숲', '🌑 암흑', '🏯 고성'];

  const me_ = () => (typeof me !== 'undefined' ? me : 'c'), opp = () => (me_() === 'c' ? 'h' : 'c');
  const busy = () => typeof window.jgPunishBusy === 'function' && window.jgPunishBusy();
  function say(t) { try { if (typeof toast === 'function') toast(t, 1600); } catch (e) {} }
  function fire(sk) { if (busy()) return say('이전 연출이 끝나면 다시 눌러 주세요'); if (typeof window.jgExtra === 'function') window.jgExtra({ k: sk, by: me_(), sd: (Math.random() * 1e9) | 0 }); }
  function punish(id) { if (busy()) return say('이전 연출이 끝나면 다시 눌러 주세요'); window.JG_MY_WARLORD = id; if (window.jgWarlordPunish6 && window.jgWarlordPunish6.test) window.jgWarlordPunish6.test(id, me_()); }
  function ult(id) { if (busy()) return say('이전 연출이 끝나면 다시 눌러 주세요'); window.JG_MY_WARLORD = id; if (window.jgUltimate11 && window.jgUltimate11.test) window.jgUltimate11.test(id, me_()); }
  function allDecals() { const N = window.jgSkillsNew14; if (!N || !N.decal) return; [['burn', .2, .3], ['lichten', .55, .25], ['ice', .85, .3], ['fault', .3, .65], ['acid', .7, .7], ['plasma', .15, .85], ['holy', .5, .85]].forEach(([k, x, y]) => N.decal(opp(), k, x, y, 0)); say('불·번개·얼음·용암·산·플라즈마·성창 자국'); }
  function clearAll() { try { window.jgExtra && window.jgExtra({ k: 'dmg_sync', DMG: { c: 0, h: 0 } }); } catch (e) {} try { window.jgSkillsNew14 && window.jgSkillsNew14.clear && window.jgSkillsNew14.clear(); } catch (e) {} say('장기판 피해를 지웠어요'); }
  function resetBoard() { try { begin(me_(), SETUPS[0][2], SETUPS[1][2], 'ai'); setTimeout(freeze, 300); } catch (e) {} }
  function selectDemo() { try { if (typeof anim !== 'undefined' && anim) return; const y0 = me_() === 'c' ? 9 : 0, yb = me_() === 'c' ? 6 : 3; if (B[yb][0] && B[yb][0].s === me_()) B[yb][0] = null; sel = null; const L = typeof legal === 'function' ? legal(me_()).filter(m => m[0] === 0 && m[1] === y0) : []; sel = { x: 0, y: y0, L }; say('갈 수 있는 자리와 잡을 수 있는 적 표시'); } catch (e) { console.warn(e); } }
  function captureDemo() { try { if (typeof anim !== 'undefined' && anim) return; const y = me_() === 'c' ? 6 : 3, ny = me_() === 'c' ? 5 : 4; if (!B[y][4] || B[y][4].s !== me_()) B[y][4] = { t: 'P', s: me_() }; B[ny][4] = { t: 'P', s: opp() }; turn = me_(); doMove([4, y, 4, ny]); } catch (e) { console.warn(e); } }
  function duel() { const a = WL[(Math.random() * 6) | 0][0]; let b = WL[(Math.random() * 6) | 0][0]; if (b === a) b = WL[(WL.findIndex(x => x[0] === a) + 1) % 6][0]; window.JG_MY_WARLORD = a; window.JG_OPP_WARLORD = b; window.playAnimeFirstTurnDuel(Math.random() < .5 ? 'c' : 'h', () => freeze()); }
  let mapTimer = 0; function cycleMaps() { clearInterval(mapTimer); let i = 0; const go = () => { if (i >= 5) { clearInterval(mapTimer); return; } window.pickRandomBoard(i++); }; go(); mapTimer = setInterval(go, 2600); }
  function freeze() { try { cfg.mode = 'local'; } catch (e) {} }

  /* ---------- 화면 ---------- */
  const css = `#jg_tb_btn{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:10050;width:54px;height:54px;border-radius:50%;border:2px solid #ffd54a;background:radial-gradient(circle at 35% 30%,#3b2a6b,#140c2a);color:#ffe9a8;font-size:24px;box-shadow:0 6px 20px rgba(0,0,0,.5)}
#jg_tb{position:fixed;left:0;right:0;bottom:0;z-index:10049;max-height:46vh;display:none;flex-direction:column;background:rgba(14,10,28,.94);border-top:2px solid #ffd54a;color:#f5ecd2;font:600 13px/1.35 "Noto Sans KR",sans-serif;padding-bottom:env(safe-area-inset-bottom,0px);backdrop-filter:blur(6px)}
#jg_tb.on{display:flex}#jg_tb header{display:flex;align-items:center;gap:8px;padding:8px 12px 6px}#jg_tb header b{font-size:14.5px;color:#ffd54a}#jg_tb .fps{margin-left:auto;font-size:11.5px;color:#a7f3d0}
#jg_tb nav{display:flex;gap:6px;padding:0 10px 6px;overflow-x:auto;scrollbar-width:none}#jg_tb nav button{flex:none;padding:6px 11px;border-radius:99px;border:1px solid rgba(255,213,74,.45);background:transparent;color:#f5ecd2;font:700 12.5px "Noto Sans KR",sans-serif}
#jg_tb nav button.sel{background:#ffd54a;color:#1a1030}#jg_tb .grid{overflow-y:auto;padding:4px 10px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:7px}
#jg_tb .grid button{padding:10px 8px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));color:#fff;font:700 12.5px "Noto Sans KR",sans-serif;text-align:left;min-height:42px}
#jg_tb .grid button:active{transform:scale(.97);background:rgba(255,213,74,.25)}#jg_tb .grid h4{grid-column:1/-1;margin:6px 2px 0;font-size:12px;color:#ffd54a;font-weight:800}`;
  function tabs() {
    const T = {
      '★ 새로 추가': NEW,
      '스킬': SKILLS.map(([n, k]) => [n, () => fire(k)]),
      '필살기': WL.map(([id, n]) => [`👑 ${n} 필살기`, () => ult(id)]),
      '응징': WL.map(([id, n]) => [`⚔️ ${n} 응징`, () => punish(id)]),
      '환경': null,
      '기타': [['⚔️ 잡기 연출', captureDemo], ['🎯 이동 표시', selectDemo], ['🤺 일기토', duel], ['🧹 피해 지우기', clearAll], ['♻️ 판 새로 시작', resetBoard], ['🏯 전장 순환', cycleMaps]]
    };
    return T;
  }
  function render(panel, name) {
    const grid = panel.querySelector('.grid'); grid.innerHTML = '';
    panel.querySelectorAll('nav button').forEach(b => b.classList.toggle('sel', b.textContent === name));
    const add = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.onclick = e => { e.stopPropagation(); try { fn(); } catch (er) { console.warn(er); } }; grid.appendChild(b); };
    const head = t => { const h = document.createElement('h4'); h.textContent = t; grid.appendChild(h); };
    if (name === '환경') {
      head('전장 고르기'); MAPS.forEach((n, i) => add(n, () => { window.pickRandomBoard(i); setTimeout(() => render(panel, '환경'), 400); }));
      head('이 전장의 환경 이벤트'); const names = (window.jgEnv3 && window.jgEnv3.list) ? window.jgEnv3.list() : [];
      names.forEach((n, i) => add(n.replace(/합니다$|갑니다$|습니다$|납니다$|입니다$/, '…'), () => window.jgEnv3.weatherNow(i)));
      return;
    }
    (tabs()[name] || []).forEach(([l, f]) => add(l, f));
  }
  function build() {
    if (document.getElementById('jg_tb')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const btn = document.createElement('button'); btn.id = 'jg_tb_btn'; btn.textContent = '🧪'; btn.title = '테스트 장기판'; document.body.appendChild(btn);
    const panel = document.createElement('div'); panel.id = 'jg_tb'; panel.innerHTML = '<header><b>🧪 테스트 장기판</b><span class="fps"></span></header><nav></nav><div class="grid"></div>'; document.body.appendChild(panel);
    const nav = panel.querySelector('nav'); Object.keys(tabs()).forEach(n => { const b = document.createElement('button'); b.textContent = n; b.onclick = e => { e.stopPropagation(); render(panel, n); }; nav.appendChild(b); });
    btn.onclick = () => { panel.classList.toggle('on'); btn.style.bottom = panel.classList.contains('on') ? `calc(46vh + 10px)` : ''; };
    render(panel, '★ 새로 추가'); panel.classList.add('on'); btn.style.bottom = 'calc(46vh + 10px)';
    setInterval(() => { const f = panel.querySelector('.fps'); if (f && window.jgPerf) f.textContent = `${Math.round(window.jgPerf.fps)} fps · 품질 ${Math.round(window.jgPerf.q * 100)}%`; try { if (TB.active) tleft = cfg.time; } catch (e) {} }, 500);
  }
  TB.open = function () {
    TB.active = true; build();
    try { if (typeof inGame === 'undefined' || !inGame) begin(me_(), SETUPS[0][2], SETUPS[1][2], 'ai'); } catch (e) {}
    setTimeout(freeze, 300);
  };
  /* 대국 시작 직후 자동 열기 (?test) */
  if (isTest) { const t0 = Date.now(), iv = setInterval(() => { if (typeof begin === 'function' && typeof SETUPS !== 'undefined' && document.body) { clearInterval(iv); setTimeout(TB.open, 600); } else if (Date.now() - t0 > 15000) clearInterval(iv); }, 200); }
})();
