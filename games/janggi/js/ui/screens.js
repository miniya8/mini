/* =========================================================
 * 화면 UI — 메뉴 / 꾸미기 / 대국 준비 / 설정 + 공용 위젯
 * ========================================================= */

/* 간단한 이벤트 버스 */
(function () {
  const h = {};
  MJ.on = (ev, fn) => { (h[ev] = h[ev] || []).push(fn); };
  MJ.emit = (ev, ...a) => { (h[ev] || []).forEach(fn => fn(...a)); };
})();

MJ.UI = (function () {
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const store = () => MJ.Store.get();
  const L = () => store().loadout;
  let history = ['title'];

  /* ---------------- 공용 ---------------- */
  function show(name, push = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'scr-' + name));
    if (push && history[history.length - 1] !== name) history.push(name);
    requestAnimationFrame(() => MJ.emit('screen', name));
  }
  function back() {
    history.pop();
    const prev = history[history.length - 1] || 'menu';
    show(prev, false);
  }
  function current() { return history[history.length - 1]; }

  let toastT = null;
  function toast(msg, ms) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 1800);
  }
  function banner(txt, sub, glow, kind) {
    const b = $('#banner');
    b.classList.toggle('mate', kind === 'mate');
    b.classList.toggle('ingame', current() === 'game' && kind !== 'mate'); // 대국 중엔 위쪽에 작게 → 판을 가리지 않음
    b.querySelector('.txt').textContent = txt;
    b.querySelector('.sub').textContent = sub || '';
    b.querySelector('.sub').style.display = sub ? '' : 'none';
    b.style.setProperty('--glow', glow || '#ff3b3b');
    b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
  }
  function modal(o) {
    const m = $('#modal'), box = m.querySelector('.box');
    box.innerHTML = '';
    if (o.king) { const c = el('canvas'); c.width = 180; c.height = 180; MJ.PieceArt.portrait(c.getContext('2d'), 180, 180, o.king, o.side); box.appendChild(c); }
    if (o.title) box.appendChild(el('h3', null, o.title));
    if (o.text) { const p = el('p'); p.textContent = o.text; box.appendChild(p); }
    if (o.html) box.appendChild(el('div', 'help', o.html));
    const btns = el('div', 'btns');
    (o.buttons || [{ label: '확인' }]).forEach(b => {
      const x = el('button', 'btn ' + (b.cls || ''), b.label);
      x.onclick = () => { MJ.Audio.sfx('button'); if (!b.keep) closeModal(); b.fn && b.fn(); };
      btns.appendChild(x);
    });
    box.appendChild(btns);
    m.classList.add('show');
  }
  function closeModal() { $('#modal').classList.remove('show'); }
  function confirm(title, text, yes) {
    modal({ title, text, buttons: [{ label: '예', cls: 'primary', fn: yes }, { label: '아니요' }] });
  }

  /* 선택 버튼 묶음 */
  function seg(opts, value, onChange) {
    const s = el('div', 'seg');
    opts.forEach(o => {
      const b = el('button', (o.cls || '') + (o.v === value ? ' on' : ''), o.label);
      b.onclick = () => { s.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); MJ.Audio.sfx('button'); onChange(o.v); };
      s.appendChild(b);
    });
    return s;
  }
  function toggle(on, fn) {
    const t = el('button', 'toggle' + (on ? ' on' : ''));
    t.onclick = () => { t.classList.toggle('on'); fn(t.classList.contains('on')); };
    return t;
  }
  function slider(v, fn) {
    const r = el('input'); r.type = 'range'; r.min = 0; r.max = 1; r.step = 0.01; r.value = v;
    r.oninput = () => fn(parseFloat(r.value)); return r;
  }

  /* 썸네일 그리기 */
  function thumbBoard(c, B) {
    const g = c.getContext('2d'), w = c.width, h = c.height;
    const im = MJ.Assets.img(B.image);
    if (im) g.drawImage(im, 0, 0, w, h);
    else (MJ.Terrain.textures[B.texture] || MJ.Terrain.textures.wood)(g, w, h, MJ.Terrain.seeded(7), B);
    g.strokeStyle = B.colors.line; g.lineWidth = 1.5;
    const cs = w / 5.2;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(cs * 0.6, cs * 0.6 + i * cs); g.lineTo(w - cs * 0.6, cs * 0.6 + i * cs); g.stroke();
      g.beginPath(); g.moveTo(cs * 0.6 + i * cs, cs * 0.6); g.lineTo(cs * 0.6 + i * cs, h - cs * 0.6); g.stroke(); }
    if (B.deco && B.deco[0]) { g.font = `${w * 0.3}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(B.deco[0], w * 0.75, h * 0.75); }
  }
  function thumbPiece(c, piece, skin, king) {
    const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    const sp = skin && skin.sprite ? MJ.spriteFor(skin.sprite, piece.s, piece.t) : null;
    if (sp && MJ.Assets.img(sp.sheet)) {
      // 변신한 모습으로 크게
      const r = (c.width * 0.98 / sp.frameW) * sp.tokenDiam / 2 / 1.04;
      MJ.PieceArt.draw(g, c.width / 2, c.height / 2 + c.height * 0.05, r * 1.25, piece, { skin, anim: sp.thumb });
      return;
    }
    MJ.PieceArt.draw(g, c.width / 2, c.height / 2, c.width * 0.38, piece, { skin, king, aura: false });
  }
  function portraitInto(c, king, side) { MJ.PieceArt.portrait(c.getContext('2d'), c.width, c.height, king, side); }

  /* ================= 메뉴 ================= */
  let menuRd = null;
  function initMenu() {
    menuRd = new MJ.Renderer($('#menuCanvas'), { particles: true, compact: true });
    menuRd.state.loadout = L();
    menuRd.state.board = MJ.Rules.createBoard('마상마상', '상마상마');
    refreshMenu();
  }
  function refreshMenu() {
    menuRd.state.loadout = L();
    menuRd.setBoardDef(MJ.Registry.get('board', L().board));
    menuRd.resize();
    ['cho', 'han'].forEach(s => {
      const k = MJ.Registry.get('king', L().kings[s]);
      const id = s === 'cho' ? 'Cho' : 'Han';
      portraitInto($('#menuKing' + id), k, s);
      $("#menuKing" + id + "Name").textContent = k.name;
    });
    const st = store().stats, ms = store().multiStats;
    $('#menuNick').textContent = store().profile.nick;
    const nt = $('#menuNotice'), rs = store().resume;
    if (rs) {
      nt.className = 'notice resume'; nt.dataset.act = 'resume';
      nt.textContent = `▶ 이어하기 — ${rs.setup.mode === 'ai' ? 'AI 대전' : '2인 대전'} ${rs.ply}수째`;
    } else {
      nt.className = 'notice'; delete nt.dataset.act;
      nt.textContent = "💡 꾸미기 › 기물에서 '메카닉 전투단'을 골라보세요!";
    }
    $('#menuStats').textContent = `멀티 ${ms.win}승 ${ms.lose}패 · AI ${st.win}승 ${st.lose}패`;
    titleRd && titleRd.setBoardDef(MJ.Registry.get('board', L().board));
    if (titleRd) titleRd.state.loadout = L();
  }
  MJ.on('bgm', t => { const n = $('#menuNow'); if (n) n.textContent = '🎵 ' + t.name; });
  MJ.on('bgm-list', list => { const n = $('#menuNow'); if (n && !list.length) n.textContent = '🎵 배경음: assets/audio/bgm/ 에 mp3 를 넣으면 자동 재생'; });

  /* 이미지 슬롯: data-slot="경로(확장자 없이)" → webp/png/jpg 중 있는 파일을 배경으로 */
  function slots() {
    document.querySelectorAll('[data-slot],[data-slot-logo]').forEach(node => {
      // "a|b" → a 가 없으면 b 사용 (예: title_bg 가 없으면 main_bg)
      const bases = (node.dataset.slot || node.dataset.slotLogo).split('|');
      const exts = ['webp', 'png', 'jpg', 'gif'];
      const list = [];
      bases.forEach(b => exts.forEach(e => list.push(b + '.' + e)));
      const tryN = i => {
        if (i >= list.length) return;
        const im = new Image();
        im.onload = () => { node.style.backgroundImage = `url("${list[i]}")`; node.classList.add('has-img'); };
        im.onerror = () => tryN(i + 1);
        im.src = list[i];
      };
      tryN(0);
    });
  }

  /* ================= 타이틀 ================= */
  let titleRd = null;
  function initTitle() {
    titleRd = new MJ.Renderer($('#titleCanvas'), { particles: true, compact: true });
    titleRd.state.loadout = L();
    titleRd.state.board = MJ.Rules.createBoard('상마상마', '마상마상');
    titleRd.setBoardDef(MJ.Registry.get('board', L().board));
    $('#titleVer').textContent = `v${MJ.CONFIG.version}`;
    // 타이틀에서 기물들이 가끔 변신 시연
    setInterval(() => {
      if (current() !== 'title') return;
      const B = titleRd.state.board, idxs = B.map((p, i) => (p ? i : -1)).filter(i => i >= 0);
      titleRd.demo(idxs[Math.floor(Math.random() * idxs.length)]);
    }, 1800);
  }

  function help() {
    modal({
      title: '📖 장기 규칙',
      html: `<b>목표</b> 상대 궁(왕)을 외통수로 몰면 승리. 초나라가 먼저 둡니다.<br>
        <b>궁·사</b> 궁성(X자 안) 안에서 선을 따라 한 칸.<br>
        <b>차</b> 직선으로 원하는 만큼. 궁성 대각선도 가능.<br>
        <b>포</b> 기물 하나를 뛰어넘어 이동·공격. 포끼리는 넘거나 잡을 수 없음.<br>
        <b>마</b> 직선 1칸 + 대각 1칸 (가는 길이 막히면 못 감).<br>
        <b>상</b> 직선 1칸 + 대각 2칸 (가는 길이 막히면 못 감).<br>
        <b>졸·병</b> 앞이나 옆으로 1칸. 상대 궁성 안에서는 대각선 앞으로도.<br>
        <b>장군</b> 왕이 공격받는 상태 — 반드시 피해야 합니다.<br>
        <b>한수쉼</b> 장군이 아닐 때 차례를 넘길 수 있습니다.<br>
        <b>점수</b> 차13 포7 마5 상3 사3 졸2, 한나라 덤 1.5 — ${MJ.CONFIG.moveLimit}수가 넘으면 점수로 판정.`,
      buttons: [{ label: '확인', cls: 'primary' }],
    });
  }
  function editNick() {
    const P = store().profile;
    const box = document.createElement('div');
    modal({
      title: '닉네임', text: '멀티 대전에서 상대에게 보이는 이름이에요 (최대 12자)',
      buttons: [{ label: '저장', cls: 'primary', fn: () => {
        const v = (document.getElementById('nickIn').value || '').trim().slice(0, 12);
        if (v) { P.nick = v; MJ.Store.save(); refreshMenu(); toast('닉네임을 바꿨어요'); }
      } }, { label: '취소' }],
    });
    const inp = el('input', 'text-in'); inp.id = 'nickIn'; inp.value = P.nick; inp.maxLength = 12; inp.style.marginBottom = '12px';
    const mb = $('#modal .box'); mb.insertBefore(inp, mb.querySelector('.btns'));
    void box;
  }

  /* ================= 꾸미기 ================= */
  const C = { tab: 'board', side: 'cho', type: 'ALL' };
  let prevRd = null;
  function initCustom() {
    prevRd = new MJ.Renderer($('#previewCanvas'), { particles: true, compact: true });
    prevRd.state.loadout = L();
    prevRd.state.board = MJ.Rules.createBoard('마상마상', '마상마상');
    $('#customTabs').querySelectorAll('button').forEach(b => {
      b.onclick = () => { C.tab = b.dataset.tab; $('#customTabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); MJ.Audio.sfx('button'); renderCustom(); };
    });
  }
  function openCustom() {
    show('custom');
    prevRd.state.loadout = L();
    prevRd.setBoardDef(MJ.Registry.get('board', L().board));
    renderCustom();
  }
  function saveLoadout() { MJ.Store.save(); MJ.emit('loadout'); }

  function renderCustom() {
    const sub = $('#customSub'), grid = $('#customGrid');
    sub.innerHTML = ''; grid.innerHTML = '';
    grid.style.display = 'grid';
    prevRd.state.view = (C.tab === 'king' || C.tab === 'skin') ? C.side : 'cho';
    prevRd.resize();

    if (C.tab === 'king' || C.tab === 'skin') {
      sub.appendChild(seg([{ v: 'cho', label: '초나라', cls: 'cho' }, { v: 'han', label: '한나라', cls: 'han' }], C.side, v => { C.side = v; renderCustom(); }));
    }
    if (C.tab === 'skin') {
      const chips = el('div', 'chips');
      [['ALL', '전체 적용']].concat(MJ.CONFIG.skinnableTypes.map(t => [t, MJ.pieceName(C.side, t)])).forEach(([v, n]) => {
        const b = el('button', v === C.type ? 'on' : '', n);
        b.onclick = () => { C.type = v; MJ.Audio.sfx('button'); renderCustom(); };
        chips.appendChild(b);
      });
      sub.appendChild(chips);
    }

    if (C.tab === 'skill') { renderSkillTab(sub, grid); return; }
    if (C.tab === 'preset') { grid.style.display = 'block'; renderPresetTab(sub, grid); return; }

    if (C.tab === 'board') {
      MJ.Registry.list('board').forEach(B => {
        grid.appendChild(card(B.name, B.desc, B.id === L().board, c => thumbBoard(c, B), () => {
          L().board = B.id; prevRd.setBoardDef(B); saveLoadout(); renderCustom();
        }, MJ.Assets.status(B.image) === 'ok'));
      });
      const B = MJ.Registry.get('board', L().board);
      hint(`🖼️ 배경 이미지 경로: ${B.image || '(없음)'}`, B.image);
    }

    if (C.tab === 'king') {
      const ks = MJ.Registry.list('king').sort((a, b) => score(b) - score(a));
      function score(k) { return k.side === C.side ? 2 : k.side === 'any' ? 1 : 0; }
      ks.forEach(k => {
        const tag = k.side === C.side ? '추천' : k.side === 'any' ? '공용' : '';
        grid.appendChild(card(`${k.name}`, k.title, L().kings[C.side] === k.id, c => portraitInto(c, k, C.side), () => {
          L().kings[C.side] = k.id; saveLoadout(); renderCustom();
          setTimeout(() => prevRd.demo(MJ.Rules.findKing(prevRd.state.board, C.side)), 80);
          toast(`${k.emoji || ''} ${k.name}: "${(k.quotes.select || [''])[0]}"`);
        }, MJ.Assets.status(k.portrait) === 'ok', tag));
      });
      const k = MJ.Registry.get('king', L().kings[C.side]);
      const kp = MJ.Assets.fill(k.portrait, { side: C.side });
      const kspr = k.sprite ? MJ.spriteFor(k.sprite, C.side, 'K') : null;
      hint(kspr ? `🤖 애니메이션 시트: ${kspr.sheet} · 초상: ${kp}`
        : `🖼️ 초상: ${kp || '-'}  ·  장기알: ${k.piece || '-'}`, kspr ? kspr.sheet : kp);
    }

    if (C.tab === 'skin') {
      const t = C.type;
      const list = MJ.Registry.list('skin', s => (t === 'ALL' ? !s.types : (!s.types || s.types.includes(t))));
      const showType = t === 'ALL' ? 'H' : t;
      list.forEach(s => {
        const on = t === 'ALL'
          ? MJ.CONFIG.skinnableTypes.every(x => L().skins[C.side][x] === s.id)
          : L().skins[C.side][t] === s.id;
        const spr = s.sprite ? MJ.spriteFor(s.sprite, C.side, showType) : null;
        const path = spr ? spr.sheet : MJ.Assets.fill(s.image, { side: C.side, type: showType, id: s.id });
        grid.appendChild(card(s.name, s.desc, on, c => thumbPiece(c, { s: C.side, t: showType }, s), () => {
          if (t === 'ALL') MJ.CONFIG.skinnableTypes.forEach(x => { L().skins[C.side][x] = s.id; });
          else L().skins[C.side][t] = s.id;
          saveLoadout(); renderCustom();
          // 미리보기 판에서 해당 기물 변신 시연
          const B = prevRd.state.board;
          const idx = B.findIndex(p => p && p.s === C.side && p.t === showType);
          setTimeout(() => prevRd.demo(idx), 80);
        }, MJ.Assets.status(path) === 'ok', s.sprite ? '🎬 애니' : ''));
      });
      const curId = L().skins[C.side][t === 'ALL' ? 'R' : t];
      const cur = MJ.Registry.get('skin', curId);
      const cspr = cur && cur.sprite && t !== 'ALL' ? MJ.spriteFor(cur.sprite, C.side, t) : null;
      const pat = cur && cur.sprite ? (cspr ? cspr.sheet : (cur.sprite.sheet || (cur.sprite.base + '{side}_{type}.webp'))) : cur && cur.image;
      const p = MJ.Assets.fill(pat, { side: C.side, type: t === 'ALL' ? '{type}' : t, id: curId });
      hint(`${cur && cur.sprite ? '🎬 애니메이션 시트' : '🖼️ 기물 이미지'} 경로: ${p || '(없음)'}  — type: R C H E A P · 카드를 누르면 미리보기에서 시연`, null);
    }
  }

  /* ---------- 프리셋 탭: 꾸미기 5개 저장 ---------- */
  function presetSummary(L) {
    const B = MJ.Registry.get('board', L.board), kc = MJ.Registry.get('king', L.kings.cho), kh = MJ.Registry.get('king', L.kings.han);
    const main = s => { const c = {}; Object.values(L.skins[s] || {}).forEach(id => { c[id] = (c[id] || 0) + 1; });
      const id = Object.keys(c).sort((a, b) => c[b] - c[a])[0]; const sk = MJ.Registry.get('skin', id); return sk ? sk.name : '-'; };
    const sk = (L.skills || []).map(id => (MJ.Registry.get('skill', id) || {}).icon || '').join('');
    return `🗺 ${B ? B.name : '-'}<br>👑 초 ${kc ? kc.name : '-'} · 한 ${kh ? kh.name : '-'}<br>♟ 초 ${main('cho')} · 한 ${main('han')}<br>⚡ ${sk || '없음'}`;
  }
  function renderPresetTab(sub, box) {
    sub.appendChild(el('div', 'hint-line', `지금 꾸민 장기판·왕·기물·스킬을 최대 ${MJ.Store.PRESETS}개까지 저장해 두고 한 번에 불러올 수 있어요.`));
    const P = store().presets;
    P.forEach((pr, k) => {
      const row = el('div', 'preset' + (pr ? '' : ' empty'));
      const c = el('canvas'); c.width = 128; c.height = 128;
      if (pr) { const B = MJ.Registry.get('board', pr.loadout.board); if (B) thumbBoard(c, B); }
      row.appendChild(c);
      const info = el('div', 'pi');
      if (pr) {
        info.innerHTML = `<b></b><small>${presetSummary(pr.loadout)}</small>`;
        info.querySelector('b').textContent = `${k + 1}. ${pr.name}`;
      } else info.innerHTML = `<b>${k + 1}. 빈 칸</b><small>현재 꾸미기를 저장할 수 있어요</small>`;
      row.appendChild(info);
      const btns = el('div', 'pb');
      const mk = (label, cls, fn) => { const b = el('button', 'btn ' + cls, label); b.onclick = () => { MJ.Audio.sfx('button'); fn(); }; btns.appendChild(b); };
      if (pr) {
        mk('불러오기', 'primary', () => {
          MJ.Store.loadPreset(k); saveLoadout();
          prevRd.setBoardDef(MJ.Registry.get('board', L().board)); renderCustom(); toast(`'${pr.name}' 불러왔어요`);
        });
        mk('덮어쓰기', '', () => confirm('덮어쓰기', `'${pr.name}'에 지금 꾸미기를 저장할까요?`, () => { MJ.Store.savePreset(k); renderCustom(); toast('저장했어요'); }));
        mk('이름', '', () => askName(pr.name, v => { MJ.Store.renamePreset(k, v); renderCustom(); }));
        mk('삭제', 'danger', () => confirm('삭제', `'${pr.name}'을(를) 지울까요?`, () => { MJ.Store.deletePreset(k); renderCustom(); }));
      } else {
        mk('💾 현재 꾸미기 저장', 'primary', () => askName(`프리셋 ${k + 1}`, v => { MJ.Store.savePreset(k, v); renderCustom(); toast('저장했어요'); }));
      }
      row.appendChild(btns);
      box.appendChild(row);
    });
    $('#assetHint').textContent = '💾 프리셋은 이 기기에 저장돼요';
  }
  function askName(def, done) {
    modal({ title: '이름', text: '프리셋 이름을 정해 주세요 (최대 12자)',
      buttons: [{ label: '확인', cls: 'primary', fn: () => { const v = (document.getElementById('presetName').value || '').trim().slice(0, 12); if (v) done(v); } }, { label: '취소' }] });
    const inp = el('input', 'text-in'); inp.id = 'presetName'; inp.value = def; inp.maxLength = 12; inp.style.marginBottom = '12px';
    const mb = $('#modal .box'); mb.insertBefore(inp, mb.querySelector('.btns'));
  }

  /* ---------- 스킬 탭: 4칸 장착 ---------- */
  function drawSkillIcon(c, def) {
    const g = c.getContext('2d'), w = c.width;
    g.clearRect(0, 0, w, w);
    const im = MJ.Assets.img('assets/images/skills/' + def.id + '.png');
    if (im) { g.drawImage(im, 0, 0, w, w); return; }
    const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2);
    gr.addColorStop(0, def.color || '#ffd36b'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.font = `${w * 0.55}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(def.icon, w / 2, w / 2 + w * 0.03);
  }
  function renderSkillTab(sub, grid) {
    const SC = MJ.CONFIG.skills, eq = L().skills;
    if (C.slot == null) C.slot = Math.min(eq.length, SC.slots - 1);
    const box = el('div', 'skill-slots');
    for (let k = 0; k < SC.slots; k++) {
      const def = eq[k] && MJ.Registry.get('skill', eq[k]);
      const label = SC.mode === 'slot' ? `${SC.milestones[k]}수부터` : `${k + 1}번 칸`;
      const d = el('button', 'skill-slot' + (def ? ' filled' : '') + (C.slot === k ? ' sel' : ''),
        def ? `<span class="ico">${def.icon}</span><b>${def.name}</b><small>${label}</small>` : `<span class="ico">＋</span><b>비어 있음</b><small>${label}</small>`);
      d.onclick = () => {
        MJ.Audio.sfx('button');
        if (C.slot === k && def) { eq.splice(k, 1); saveLoadout(); toast(`${def.name} 장착 해제`); }
        C.slot = Math.min(k, eq.length);
        renderCustom();
      };
      box.appendChild(d);
    }
    sub.appendChild(box);
    MJ.Registry.list('skill').forEach(def => {
      const pos = eq.indexOf(def.id);
      grid.appendChild(card(`${def.icon} ${def.name}`, def.desc, pos >= 0, c => drawSkillIcon(c, def), () => {
        if (pos >= 0) { eq.splice(pos, 1); C.slot = Math.min(C.slot, eq.length); }
        else if (C.slot < eq.length) eq[C.slot] = def.id;
        else if (eq.length < SC.slots) eq.push(def.id);
        else { toast('먼저 바꿀 칸을 고르세요'); return; }
        C.slot = Math.min(eq.length, SC.slots - 1);
        saveLoadout(); renderCustom();
      }, false, pos >= 0 ? `장착 ${pos + 1}` : ''));
    });
    $('#assetHint').textContent = SC.mode === 'slot'
      ? `⚡ ${SC.milestones.join('·')}수부터 각 칸 스킬 사용 가능 · 아이콘 이미지: assets/images/skills/{id}.png`
      : `⚡ 전체 ${SC.milestones.join('·')}수마다 1회 충전 → 장착한 스킬 중 골라 사용 (각 1번) · 아이콘: assets/images/skills/{id}.png`;
  }

  function hint(text, path) {
    const st = path ? MJ.Assets.status(path) : null;
    $('#assetHint').textContent = text + (st === 'ok' ? '  ✅ 적용 중' : st ? '  ⬜ 파일 없음 → 코드 그림 표시 중' : '');
  }

  function card(name, desc, on, draw, onClick, hasImg, tag) {
    const d = el('button', 'card' + (on ? ' on' : ''));
    const c = el('canvas'); c.width = 128; c.height = 128;
    draw(c);
    d.appendChild(c);
    d.appendChild(el('b', null, name));
    if (desc) d.appendChild(el('small', null, desc));
    if (hasImg) d.appendChild(el('span', 'badge img', 'IMG'));
    else if (tag) d.appendChild(el('span', 'badge', tag));
    d.onclick = () => { MJ.Audio.sfx('select'); onClick(); };
    return d;
  }

  /* ================= 대국 준비 ================= */
  function openSetup(mode) {
    const S = store().lastSetup;
    if (mode) S.mode = mode;
    show('setup');
    renderSetup();
  }
  function renderSetup() {
    const S = store().lastSetup, body = $('#setupBody');
    body.innerHTML = '';
    $('#setupTitle').textContent = S.mode === 'ai' ? '🤖 AI 대전 준비' : '👥 2인 대전 준비';
    const kn = s => MJ.Registry.get('king', L().kings[s]).name;
    const forms = Object.keys(MJ.CONFIG.formations).map(f => ({ v: f, label: f }));
    const add = (label, node) => { body.appendChild(el('div', 'label', label)); body.appendChild(node); };

    add('대전 방식', seg([{ v: 'ai', label: '🤖 AI 대전' }, { v: 'local', label: '👥 한 기기 2인' }], S.mode, v => { S.mode = v; renderSetup(); }));
    if (S.mode === 'ai') {
      add('내 진영 (초나라가 먼저 둡니다)', seg([{ v: 'cho', label: `초나라 · ${kn('cho')}`, cls: 'cho' }, { v: 'han', label: `한나라 · ${kn('han')}`, cls: 'han' }], S.mySide, v => { S.mySide = v; }));
      add('AI 난이도', seg(Object.entries(MJ.CONFIG.difficulties).map(([k, d]) => ({ v: k, label: d.name })), S.diff, v => { S.diff = v; }));
      add('내 차림', seg(forms, S.myForm, v => { S.myForm = v; }));
      add('AI 차림', seg([{ v: 'random', label: '🎲 랜덤' }].concat(forms), S.oppForm, v => { S.oppForm = v; }));
    } else {
      add(`초나라(${kn('cho')}) 차림`, seg(forms, S.myForm, v => { S.myForm = v; }));
      add(`한나라(${kn('han')}) 차림`, seg([{ v: 'random', label: '🎲 랜덤' }].concat(forms), S.oppForm, v => { S.oppForm = v; }));
    }
    add('한 수 제한시간', seg(MJ.CONFIG.timeLimits.map(t => ({ v: t, label: t ? t + '초' : '없음' })), S.time, v => { S.time = v; }));
    const tip = el('div', 'label', '💡 꾸미기에서 고른 장기판·왕·기물 스킨이 그대로 적용됩니다.');
    body.appendChild(tip);
  }

  /* ================= 설정 ================= */
  function openSettings() { show('settings'); renderSettings(); }
  function renderSettings() {
    const S = store().settings, body = $('#settingsBody');
    body.innerHTML = '';
    const row = (label, node) => { const r = el('div', 'row'); r.appendChild(el('label', null, label)); r.appendChild(node); body.appendChild(r); };
    body.appendChild(el('div', 'label', '소리'));
    row('🎵 배경음 (랜덤 셔플)', toggle(S.bgmOn, v => { S.bgmOn = v; MJ.Store.save(); v ? (MJ.Audio.unlock(), MJ.Audio.playBgm()) : MJ.Audio.stopBgm(); }));
    body.appendChild(slider(S.bgmVol, v => MJ.Audio.setVolume('bgmVol', v)));
    const n = MJ.Audio.tracks().length, cur = MJ.Audio.current();
    body.appendChild(el('div', 'hint-line', `인식된 곡 ${n}개 · 폴더: ${MJ.AUDIO_CONFIG.bgmAuto.folder} (bgm1.mp3, bgm2.mp3 …)` + (cur ? `<br>지금 재생: ${cur.name}` : '')));
    if (n) { const nx = el('button', 'btn small', '⏭ 다음 곡'); nx.onclick = () => { MJ.Audio.unlock(); MJ.Audio.next(); setTimeout(renderSettings, 300); }; body.appendChild(nx); }
    row('🔊 효과음', toggle(S.sfxOn, v => { S.sfxOn = v; MJ.Store.save(); }));
    body.appendChild(slider(S.sfxVol, v => MJ.Audio.setVolume('sfxVol', v)));
    body.appendChild(el('div', 'label', '화면'));
    row('🔴🟢 진영 오라 (한/초 구분 빛)', toggle(S.aura !== false, v => { S.aura = v; MJ.Store.save(); }));
    row('📳 진동', toggle(S.vibrate, v => { S.vibrate = v; MJ.Store.save(); if (v && navigator.vibrate) navigator.vibrate(30); }));
    row('📱 전체화면으로 실행', toggle(S.fullscreen, v => { S.fullscreen = v; MJ.Store.save(); v ? MJ.fullscreen(true) : MJ.fullscreen(false); }));
    row('🔆 대국 중 화면 꺼짐 방지', toggle(S.wakeLock, v => { S.wakeLock = v; MJ.Store.save(); }));
    row('✨ 지형 파티클(눈·꽃잎 등)', toggle(S.particles, v => { S.particles = v; MJ.Store.save(); }));
    row('🟢 이동 가능 칸 표시', toggle(S.hints, v => { S.hints = v; MJ.Store.save(); }));
    row('💬 왕 대사 말풍선', toggle(S.quotes, v => { S.quotes = v; MJ.Store.save(); }));
    body.appendChild(el('div', 'label', '기물 이동 속도'));
    body.appendChild(seg([{ v: 0.8, label: '느리게' }, { v: 1.2, label: '보통' }, { v: 2, label: '빠르게' }], S.animSpeed, v => { S.animSpeed = v; MJ.Store.save(); }));
    body.appendChild(el('div', 'label', '데이터'));
    const st = store().stats;
    const ms = store().multiStats;
    body.appendChild(el('div', 'row', `<label>AI 전적: ${st.played}판 ${st.win}승 ${st.lose}패 · 멀티: ${ms.played}판 ${ms.win}승 ${ms.lose}패</label>`));
    const rs = el('button', 'btn danger', '🗑 모든 꾸미기·전적 초기화'); rs.style.width = '100%';
    rs.onclick = () => confirm('초기화', '꾸미기와 전적을 모두 처음 상태로 되돌릴까요?', () => { MJ.Store.reset(); MJ.emit('loadout'); renderSettings(); toast('초기화했어요'); });
    body.appendChild(rs);
    body.appendChild(el('div', 'label', `${MJ.CONFIG.title} v${MJ.CONFIG.version}`));
  }

  function init() {
    initTitle(); initMenu(); initCustom(); slots();
    MJ.on('loadout', () => { refreshMenu(); prevRd.state.loadout = L(); });
    MJ.on('screen', n => { if (n === 'menu') refreshMenu(); if (n === 'custom') prevRd.resize(); });
    MJ.on('resize', () => { menuRd.resize(); prevRd.resize(); titleRd.resize(); });
    MJ.on('screen', n => { if (n === 'title') titleRd.resize(); });
    MJ.Assets.onLoad(() => { if (current() === 'custom') renderCustom(); });
  }

  return { init, show, back, current, toast, banner, modal, closeModal, confirm, openCustom, openSetup, openSettings, seg, help, editNick,
           refreshMenu, portraitInto, resetCustom: () => {
             const d = MJ.Store.defaults().loadout; Object.assign(L(), d); saveLoadout();
             prevRd.setBoardDef(MJ.Registry.get('board', L().board)); renderCustom(); toast('기본 꾸미기로 되돌렸어요');
           } };
})();
