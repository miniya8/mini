/* =========================================================
 * 장기판 렌더러 (캔버스)
 *  - 지형 배경 캐시 → 하이라이트 → 기물 → 애니메이션 → 이펙트 → 파티클
 *  - 게임 화면과 꾸미기 미리보기에서 함께 사용
 * ========================================================= */
MJ.Renderer = function (canvas, opt) {
  opt = opt || {};
  const g = canvas.getContext('2d');
  const R = MJ.Rules;
  const self = this;
  let W = 0, H = 0, dpr = 1, cell = 40, cx = 40, cy = 40, ox = 0, oy = 0, imgRect = null, gxs = null, gys = null;
  let bgCache = null, bgDirty = true, parts = [], fxList = [], actors = [], scripts = [], clock = 0;
  const hiddenIdx = new Set();
  let last = performance.now(), shake = 0, running = true;

  /* 외부에서 채우는 상태 */
  this.state = {
    board: new Array(90).fill(null),
    view: 'cho',            // 아래쪽에 보일 진영
    boardDef: MJ.Registry.first('board'),
    loadout: null,          // {skins:{cho:{R:'id'}}, kings:{cho:'id'}}
    selected: -1, targets: [], lastMove: null, checkIdx: -1,
  };

  /* 좌표 변환 */
  function toXY(i) {
    let [r, c] = R.rc(i);
    if (self.state.view === 'han') { r = 9 - r; c = 8 - c; }
    if (gxs) return [gxs[c], gys[r]];
    return [ox + c * cx, oy + r * cy];
  }
  this.toXY = toXY;
  this.hit = function (px, py) {
    let c, r;
    if (gxs) {
      c = gxs.reduce((b, v, k) => (Math.abs(v - px) < Math.abs(gxs[b] - px) ? k : b), 0);
      r = gys.reduce((b, v, k) => (Math.abs(v - py) < Math.abs(gys[b] - py) ? k : b), 0);
      if (Math.hypot((px - gxs[c]) / cx, (py - gys[r]) / cy) > 0.72) return -1;
    } else {
      c = Math.round((px - ox) / cx); r = Math.round((py - oy) / cy);
      if (!R.inB(r, c)) return -1;
      if (Math.hypot((px - (ox + c * cx)) / cx, (py - (oy + r * cy)) / cy) > 0.72) return -1;
    }
    if (self.state.view === 'han') { r = 9 - r; c = 8 - c; }
    return R.idx(r, c);
  };
  this.cell = () => cell;

  this.resize = function () {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, opt.maxDpr || 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    layout();
    bgDirty = true;
    if (opt.particles !== false) parts = MJ.Terrain.makeParticles(self.state.boardDef, W, H);
  };

  /* 판 배치: 이미지 장기판이면 이미지 속 격자에 맞춤, 아니면 코드 판 */
  function boardImage() {
    const B = self.state.boardDef;
    return B && B.grid && B.image ? MJ.Assets.img(B.image) : null;
  }
  function layout() {
    const B = self.state.boardDef, im = boardImage();
    if (im) {
      const G = gridOf(B), k = im.width / (G.w || im.width);
      // 격자 + 여백(칸의 0.6배)이 화면에 꽉 차게 — 바깥 성벽 장식은 일부 잘릴 수 있음
      const m = B.fitMargin != null ? B.fitMargin : 0.6;
      const gw = (G.x1 - G.x0) * k, gh = (G.y1 - G.y0) * k;
      const s = Math.min(W / (gw + gw / 8 * m * 2), H / (gh + gh / 9 * m * 2));
      cx = gw / 8 * s; cy = gh / 9 * s;
      ox = (W - gw * s) / 2; oy = (H - gh * s) / 2;
      imgRect = { x: ox - G.x0 * k * s, y: oy - G.y0 * k * s, w: im.width * s, h: im.height * s };
      gxs = G.xs ? G.xs.map(v => imgRect.x + v * k * s) : null;
      gys = G.ys ? G.ys.map(v => imgRect.y + v * k * s) : null;
      cell = Math.min(cx, cy);
    } else {
      imgRect = null; gxs = gys = null;
      const pad = opt.pad != null ? opt.pad : (opt.compact ? 0.62 : 0.7);
      cell = Math.min(W / (8 + pad * 2), H / (9 + pad * 2));
      cx = cy = cell;
      ox = (W - cell * 8) / 2; oy = (H - cell * 9) / 2;
    }
  }
  /* grid 에 xs/ys(줄별 좌표)가 있으면 첫/마지막 줄로 x0..y1 계산 */
  function gridOf(B) {
    const G = B.grid;
    if (G.xs) return Object.assign({}, G, { x0: G.xs[0], x1: G.xs[8], y0: G.ys[0], y1: G.ys[9] });
    return G;
  }
  /* 판 영역의 권장 가로:세로 비율 (화면 배치용) */
  this.aspect = function () {
    const B = self.state.boardDef, im = boardImage();
    if (B && B.grid) {
      const G = gridOf(B), m = B.fitMargin != null ? B.fitMargin : 0.6;
      const gw = G.x1 - G.x0, gh = G.y1 - G.y0;
      return (gw + gw / 8 * m * 2) / (gh + gh / 9 * m * 2);
    }
    const pad = opt.pad != null ? opt.pad : 0.7;
    return (8 + pad * 2) / (9 + pad * 2);
  };

  this.setBoardDef = function (def) {
    self.state.boardDef = def; bgDirty = true; layout();
    parts = opt.particles === false ? [] : MJ.Terrain.makeParticles(def, W, H);
  };
  this.invalidate = () => { bgDirty = true; };
  MJ.Assets.onLoad(() => { bgDirty = true; });

  /* ---------- 배경(지형 + 판) ---------- */
  /* 판 선만 따로 그린 그림 — 이펙트·파티클 위에 다시 덧그려서 선이 항상 보이게 */
  let linesCache = null;
  function buildLines() {
    const B = self.state.boardDef, C = B.colors || {};
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    const b = c.getContext('2d'); b.scale(dpr, dpr);
    const P = (r, cc) => (gxs ? [gxs[cc], gys[r]] : [ox + cc * cell, oy + r * cell]);
    const isImg = !!(gxs || (imgRect && B.grid));
    b.globalAlpha = isImg ? 0.6 : 1;
    b.strokeStyle = C.line || '#000'; b.lineCap = 'round';
    b.lineWidth = Math.max(1, cell * (isImg ? 0.022 : 0.03));
    b.beginPath();
    for (let r = 0; r < 10; r++) { const [x0, y0] = P(r, 0), [x1, y1] = P(r, 8); b.moveTo(x0, y0); b.lineTo(x1, y1); }
    for (let cc = 0; cc < 9; cc++) { const [x0, y0] = P(0, cc), [x1, y1] = P(9, cc); b.moveTo(x0, y0); b.lineTo(x1, y1); }
    b.stroke();
    b.strokeStyle = C.palace || C.line || '#000'; b.lineWidth = Math.max(1, cell * (isImg ? 0.025 : 0.04));
    b.beginPath();
    [[0, 2], [7, 9]].forEach(([r0, r1]) => {
      let [a, bb] = [P(r0, 3), P(r1, 5)]; b.moveTo(a[0], a[1]); b.lineTo(bb[0], bb[1]);
      [a, bb] = [P(r0, 5), P(r1, 3)]; b.moveTo(a[0], a[1]); b.lineTo(bb[0], bb[1]);
    });
    b.stroke();
    linesCache = c;
  }

  function buildBg() {
    buildLines();
    const B = self.state.boardDef;
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    const b = c.getContext('2d');
    b.scale(dpr, dpr);
    const im = MJ.Assets.img(B.image);
    if (im && B.grid && imgRect) {
      // 이미지 장기판: 여백은 배경색, 이미지는 통째로 (격자는 이미지에 그려져 있음)
      const gr = b.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, B.colors.bg[0]); gr.addColorStop(1, B.colors.bg[1]);
      b.fillStyle = gr; b.fillRect(0, 0, W, H);
      b.drawImage(im, imgRect.x, imgRect.y, imgRect.w, imgRect.h);
      bgCache = c; bgDirty = false;
      return;
    }
    if (im) {
      const s = Math.max(W / im.width, H / im.height);
      b.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s);
    } else {
      const fn = MJ.Terrain.textures[B.texture] || MJ.Terrain.textures.wood;
      fn(b, W, H, MJ.Terrain.seeded(B.id.length * 9973 + 7), B);
    }
    // 장식 이모지 (여백)
    if (B.deco && B.deco.length) {
      const rnd = MJ.Terrain.seeded(42 + B.id.length);
      b.globalAlpha = 0.85;
      const n = 14;
      for (let k = 0; k < n; k++) {
        const ch = B.deco[Math.floor(rnd() * B.deco.length)];
        const sz = cell * (0.35 + rnd() * 0.25);
        let x, y;
        const edge = k % 4;
        if (edge === 0) { x = rnd() * W; y = rnd() * Math.max(oy - cell * 0.4, sz); }
        else if (edge === 1) { x = rnd() * W; y = H - rnd() * Math.max(oy - cell * 0.4, sz); }
        else if (edge === 2) { x = rnd() * Math.max(ox - cell * 0.4, sz); y = rnd() * H; }
        else { x = W - rnd() * Math.max(ox - cell * 0.4, sz); y = rnd() * H; }
        b.font = `${sz}px serif`; b.textAlign = 'center'; b.textBaseline = 'middle';
        b.fillText(ch, x, y);
      }
      b.globalAlpha = 1;
    }
    // 판 덮개
    const C = B.colors;
    const pad = cell * 0.42;
    b.fillStyle = C.plate || 'rgba(0,0,0,0)';
    b.fillRect(ox - pad, oy - pad, cell * 8 + pad * 2, cell * 9 + pad * 2);
    b.strokeStyle = C.line; b.lineWidth = Math.max(2, cell * 0.06);
    b.strokeRect(ox - pad, oy - pad, cell * 8 + pad * 2, cell * 9 + pad * 2);
    // 격자
    b.lineWidth = Math.max(1, cell * 0.03);
    b.beginPath();
    for (let r = 0; r < 10; r++) { b.moveTo(ox, oy + r * cell); b.lineTo(ox + 8 * cell, oy + r * cell); }
    for (let c2 = 0; c2 < 9; c2++) { b.moveTo(ox + c2 * cell, oy); b.lineTo(ox + c2 * cell, oy + 9 * cell); }
    b.stroke();
    // 궁성 대각선
    b.strokeStyle = C.palace || C.line; b.lineWidth = Math.max(1.5, cell * 0.04);
    b.beginPath();
    [[0, 2], [7, 9]].forEach(([r0, r1]) => {
      b.moveTo(ox + 3 * cell, oy + r0 * cell); b.lineTo(ox + 5 * cell, oy + r1 * cell);
      b.moveTo(ox + 5 * cell, oy + r0 * cell); b.lineTo(ox + 3 * cell, oy + r1 * cell);
    });
    b.stroke();
    // 포/졸 자리 표시
    b.strokeStyle = C.mark || C.line; b.lineWidth = Math.max(1, cell * 0.025);
    const marks = [[2, 1], [2, 7], [7, 1], [7, 7], [3, 0], [3, 2], [3, 4], [3, 6], [3, 8], [6, 0], [6, 2], [6, 4], [6, 6], [6, 8]];
    const m = cell * 0.12, gap = cell * 0.06;
    marks.forEach(([r, c2]) => {
      const x = ox + c2 * cell, y = oy + r * cell;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        if ((c2 === 0 && sx < 0) || (c2 === 8 && sx > 0)) return;
        b.beginPath(); b.moveTo(x + sx * gap, y + sy * (gap + m)); b.lineTo(x + sx * gap, y + sy * gap); b.lineTo(x + sx * (gap + m), y + sy * gap); b.stroke();
      });
    });
    bgCache = c; bgDirty = false;
  }

  function skinFor(p) {
    const L = self.state.loadout;
    const id = L && L.skins[p.s] && L.skins[p.s][p.t];
    return MJ.Registry.get('skin', id) || MJ.Registry.get('skin', 'classic');
  }
  function kingFor(side) {
    const L = self.state.loadout;
    return MJ.Registry.get('king', L && L.kings[side]) || MJ.Registry.first('king');
  }
  this.kingFor = kingFor;
  function radius(p) { return cell * 0.5 * MJ.CONFIG.pieceScale[p.t]; }

  /* 진영 대표 스킨: 가장 많이 쓴 스킨 (같으면 차의 스킨) → 장기알 상태 색 통일 */
  function mainSkin(side) {
    const L = self.state.loadout, sk = L && L.skins && L.skins[side];
    if (!sk) return MJ.Registry.get('skin', 'classic');
    const cnt = {};
    Object.values(sk).forEach(id => { cnt[id] = (cnt[id] || 0) + 1; });
    let best = sk.R, bn = cnt[sk.R] || 0;
    Object.keys(cnt).forEach(id => { if (cnt[id] > bn) { best = id; bn = cnt[id]; } });
    return MJ.Registry.get('skin', best) || MJ.Registry.get('skin', 'classic');
  }
  this.mainSkin = mainSkin;
  /* ---------- 성능: 대기 상태 장기알·오라를 미리 그려 둔 그림으로 재사용 ---------- */
  const pcache = new Map(), acache = new Map();
  MJ.Assets.onLoad(() => { pcache.clear(); });
  let msMemo = null, msKey = '';
  function mainSkinFast(side) {
    const L = self.state.loadout, key = L ? JSON.stringify(L.skins) : '';
    if (key !== msKey) { msKey = key; msMemo = { cho: mainSkin('cho'), han: mainSkin('han') }; pcache.clear(); }
    return msMemo[side];
  }
  function auraImg(side, R) {
    const key = side + '|' + Math.round(R * dpr);
    let c = acache.get(key);
    if (!c) {
      const S2 = R * 3.2; c = document.createElement('canvas');
      c.width = c.height = Math.ceil(S2 * dpr);
      const cg = c.getContext('2d'); cg.setTransform(dpr, 0, 0, dpr, 0, 0); cg.translate(S2 / 2, S2 / 2);
      MJ.PieceArt.aura(cg, R, side, 'token', 1);
      acache.set(key, c);
      if (acache.size > 40) acache.delete(acache.keys().next().value);
    }
    return c;
  }
  function idleImg(p, R) {
    if (!(R > 1) || !(dpr > 0)) return null;
    const sk = skinFor(p), ms = mainSkinFast(p.s), kg = p.t === 'K' ? kingFor(p.s) : null;
    // 대기 모습이 아직 안 불러온 시트에 의존하면 캐시하지 않음
    let need = null;
    if (!ms.codeToken) {
      if (p.t === 'K') need = ms.kingSprite ? MJ.spriteFor(ms.kingSprite, p.s, 'K') : null;
      else need = ms.sprite ? MJ.spriteFor(ms.sprite, p.s, p.t) : null;
    }
    if (need && !MJ.Assets.img(need.sheet)) return null;
    const key = [p.s, p.t, sk.id, ms.id, kg ? kg.id : '', Math.round(R * dpr)].join('|');
    let c = pcache.get(key);
    if (!c) {
      const S2 = R * 5; c = document.createElement('canvas');
      c.width = c.height = Math.ceil(S2 * dpr);
      const cg = c.getContext('2d'); cg.setTransform(dpr, 0, 0, dpr, 0, 0);
      MJ.PieceArt.draw(cg, S2 / 2, S2 / 2, R, p, { skin: sk, king: kg, tokenSkin: ms, aura: false, glowPulse: 0.5 });
      pcache.set(key, c);
      if (pcache.size > 120) pcache.delete(pcache.keys().next().value);
    }
    return c;
  }
  function drawIdle(p, x, y, pulse) {
    const R = radius(p), img = idleImg(p, R);
    if (!img) return false;
    if (MJ.Store.get().settings.aura !== false) {
      const a = auraImg(p.s, R), S2 = R * 3.2;
      g.globalAlpha = 0.7 + 0.3 * pulse; g.drawImage(a, x - S2 / 2, y - S2 / 2, S2, S2); g.globalAlpha = 1;
    }
    const S2 = R * 5;
    g.drawImage(img, x - S2 / 2, y - S2 / 2, S2, S2);
    return true;
  }

  function drawPiece(p, x, y, extra) {
    if (extra && !extra.anim && !extra.selected && extra.alpha == null && !extra.scale && !extra.rotate && !extra.noCache) {
      if (drawIdle(p, x, y, 0.5 + 0.5 * Math.sin(performance.now() / 400))) return;
    }
    MJ.PieceArt.draw(g, x, y, radius(p), p, Object.assign({
      skin: skinFor(p), king: p.t === 'K' ? kingFor(p.s) : null, tokenSkin: mainSkinFast(p.s),
      glowPulse: 0.5 + 0.5 * Math.sin(performance.now() / 400),
      aura: MJ.Store.get().settings.aura !== false,
    }, extra || {}));
  }

  /* 직전 이동 경로: 마·상은 꺾이는 길, 나머지는 직선 */
  function movePath(m, t) {
    const [r0, c0] = R.rc(m.from), [r1, c1] = R.rc(m.to);
    const dr = r1 - r0, dc = c1 - c0, sr = Math.sign(dr), sc = Math.sign(dc);
    const pts = [[r0, c0]];
    if (t === 'H' && Math.abs(dr) + Math.abs(dc) === 3) {
      pts.push(Math.abs(dr) === 2 ? [r0 + sr, c0] : [r0, c0 + sc]);
    } else if (t === 'E' && Math.abs(dr) + Math.abs(dc) === 5) {
      if (Math.abs(dr) === 3) { pts.push([r0 + sr, c0], [r0 + 2 * sr, c0 + sc]); }
      else { pts.push([r0, c0 + sc], [r0 + sr, c0 + 2 * sc]); }
    }
    pts.push([r1, c1]);
    return pts.map(([r, c]) => toXY(R.idx(r, c)));
  }
  function drawLastPath(m, piece, now) {
    const pts = movePath(m, piece.t);
    const col = (MJ.CONFIG.sides[piece.s] || {}).aura || '#fff';
    const end = pts[pts.length - 1], prev = pts[pts.length - 2];
    const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
    const stopR = cell * 0.48;
    const tip = [end[0] - Math.cos(ang) * stopR, end[1] - Math.sin(ang) * stopR];
    const line = pts.slice(0, -1).concat([tip]);
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    // 바깥 빛
    g.strokeStyle = col; g.globalAlpha = 0.35; g.lineWidth = cell * 0.22; g.shadowColor = col; g.shadowBlur = cell * 0.3;
    g.beginPath(); line.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    // 흐르는 점선
    g.globalAlpha = 0.95; g.shadowBlur = 0; g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, cell * 0.07);
    g.setLineDash([cell * 0.16, cell * 0.12]); g.lineDashOffset = -(now / 25) % (cell * 0.28);
    g.beginPath(); line.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.setLineDash([]);
    // 꺾이는 지점
    g.fillStyle = col;
    pts.slice(1, -1).forEach(([x, y]) => { g.beginPath(); g.arc(x, y, cell * 0.09, 0, 7); g.fill(); });
    // 출발 자리 (발자국)
    const [fx, fy] = pts[0];
    g.strokeStyle = col; g.lineWidth = Math.max(2, cell * 0.06); g.setLineDash([cell * 0.1, cell * 0.07]);
    g.beginPath(); g.arc(fx, fy, cell * 0.34, 0, 7); g.stroke(); g.setLineDash([]);
    g.globalAlpha = 0.25; g.fillStyle = col; g.beginPath(); g.arc(fx, fy, cell * 0.34, 0, 7); g.fill();
    // 화살촉
    g.globalAlpha = 1; g.fillStyle = '#fff'; g.shadowColor = col; g.shadowBlur = 8;
    const ah = cell * 0.22;
    g.beginPath(); g.moveTo(tip[0], tip[1]);
    g.lineTo(tip[0] - Math.cos(ang - 0.5) * ah, tip[1] - Math.sin(ang - 0.5) * ah);
    g.lineTo(tip[0] - Math.cos(ang + 0.5) * ah, tip[1] - Math.sin(ang + 0.5) * ah);
    g.closePath(); g.fill();
    // 도착 자리 바닥 빛
    g.globalAlpha = 0.3; g.fillStyle = col; g.shadowBlur = 0;
    g.beginPath(); g.arc(end[0], end[1], cell * 0.55, 0, 7); g.fill();
    g.restore();
  }

  /* 스킬 상태 표시: shield(파란 보호막) / freeze(얼음) + 남은 턴 */
  function drawMarks(m, x, y, rr, now) {
    g.save();
    if (m.shield) {
      const k = 0.5 + 0.5 * Math.sin(now / 300);
      const gr = g.createRadialGradient(x, y, rr * 0.6, x, y, rr * 1.35);
      gr.addColorStop(0, 'rgba(80,180,255,0)'); gr.addColorStop(1, `rgba(80,180,255,${0.35 + k * 0.2})`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr * 1.35, 0, 7); g.fill();
      g.strokeStyle = 'rgba(160,220,255,0.9)'; g.lineWidth = Math.max(1.5, rr * 0.08);
      g.beginPath(); g.arc(x, y, rr * 1.3, 0, 7); g.stroke();
    }
    if (m.freeze) {
      g.fillStyle = 'rgba(190,240,255,0.38)'; g.beginPath(); g.arc(x, y, rr * 1.05, 0, 7); g.fill();
      g.strokeStyle = 'rgba(230,250,255,0.95)'; g.lineWidth = Math.max(1.5, rr * 0.07);
      for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; g.beginPath(); g.moveTo(x + Math.cos(t) * rr * 0.9, y + Math.sin(t) * rr * 0.9); g.lineTo(x + Math.cos(t) * rr * 1.2, y + Math.sin(t) * rr * 1.2); g.stroke(); }
    }
    // 뱃지
    const icons = (m.shield ? '🛡' : '') + (m.freeze ? '❄' : '');
    const turns = Math.max(m.shield || 0, m.freeze || 0);
    const bx = x + rr * 0.85, by = y - rr * 0.85, br = Math.max(7, rr * 0.38);
    g.fillStyle = 'rgba(10,20,40,0.85)'; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill();
    g.font = `${br * 1.1}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    g.fillText(Array.from(icons)[0] || '', bx, by + 1);
    g.font = `800 ${br * 0.8}px sans-serif`; g.fillStyle = '#ffe14d'; g.fillText(turns, bx + br * 0.9, by + br * 0.8);
    g.restore();
  }

  /* ---------- 공개 API ---------- */
  function spriteOf(p) {
    const sk = p.t === 'K' ? kingFor(p.s) : skinFor(p);
    const sp = sk && sk.sprite ? MJ.spriteFor(sk.sprite, p.s, p.t) : null;
    if (!sp) return null;
    return MJ.Assets.img(sp.sheet) ? sp : null;
  }
  this.spriteOf = spriteOf;

  /* 배우(애니메이션 중인 기물) */
  function actor(piece, idx) {
    const [x, y] = toXY(idx);
    const a = { piece, x, y, sp: spriteOf(piece), anim: null, t0: 0, loop: false, flip: false, alpha: 1, hop: 0, scale: 1, tw: null };
    actors.push(a);
    return a;
  }
  function play(a, name, loop) {
    if (!a.sp) { a.anim = null; return 0; }
    a.anim = name; a.t0 = clock; a.loop = !!loop;
    return a.sp.anims[name].n / (a.sp.fps * speed());
  }
  function tween(a, x, y, dur, hop) { a.tw = { x0: a.x, y0: a.y, x1: x, y1: y, t0: clock, dur, hop: hop || 0 }; }
  function frameOf(a) {
    if (!a.sp || !a.anim) return null;
    const A = a.sp.anims[a.anim];
    let f = Math.floor((clock - a.t0) * a.sp.fps * speed());
    f = a.loop ? f % A.n : Math.min(A.n - 1, f);
    return [a.anim, f];
  }
  const speed = () => (MJ.Store.get().settings.animSpeed || 1) * 0.82; // 기물 속도 약간 느리게
  function defaultFlip(piece) { return piece.s !== self.state.view; } // 위쪽 진영은 왼쪽을 봄

  /* 스크립트(제너레이터) 실행기: yield 초 */
  function run(gen) {
    scripts.push({ it: gen, wait: 0 });
    if (document.hidden || !canvas.offsetParent) flush(); // 화면이 안 보이면 연출 생략
  }
  /* 진행 중인 연출을 즉시 끝냄 (백그라운드 전환 등) */
  function flush() {
    let guard = 0;
    while (scripts.length && guard++ < 1000) {
      const s = scripts[0];
      const r = s.it.next();
      if (r.done) scripts.shift();
    }
    actors.length = 0; hiddenIdx.clear();
  }
  this.flush = flush;
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  /* 수 연출: 변신 → 이동 → (공격 → 피격·사망) → 장기알 복귀 */
  this.animateMove = function (m, piece, cb) {
    cb = typeof cb === 'function' ? { done: cb } : (cb || {});
    hiddenIdx.add(m.to);
    run((function* () {
      const A = actor(piece, m.from);
      const V = m.cap ? actor(m.cap, m.to) : null;
      const [fx, fy] = toXY(m.from), [tx, ty] = toXY(m.to);
      const dx = tx - fx, dy = ty - fy, dist = Math.hypot(dx, dy);
      A.flip = Math.abs(dx) > 1 ? dx < 0 : defaultFlip(piece);
      if (V) V.flip = !A.flip;
      const sp = A.sp, spd = speed();
      if (sp) yield play(A, 'transform');
      // 원거리 공격: 시트에 ranged + proj 가 있고 2칸 이상 떨어진 상대를 잡을 때
      const canRanged = V && sp && sp.anims.ranged && sp.anims.proj && dist >= cell * 1.9;
      let rest = 0;
      if (canRanged) {
        A.flip = dx < -1 ? true : dx > 1 ? false : defaultFlip(piece);
        const tot = play(A, 'ranged');
        yield tot * 0.7;
        // 투사체 발사
        const P = actor(piece, m.from); P.sp = sp; P.proj = true; P.anim = 'proj'; P.t0 = clock; P.loop = true;
        P.rot = Math.atan2(dy, dx); P.scale = 1;
        const fly = Math.max(0.18, dist / (cell * 14)) / spd;
        tween(P, tx, ty, fly, 0);
        yield fly;
        remove(P);
        cb.impact && cb.impact();
      } else {
        // 이동 (잡는 수면 상대 앞에서 멈춤)
        const stop = V && sp ? Math.min(cell * 0.8, dist * 0.6) : 0;
        const ex = tx - (dx / (dist || 1)) * stop, ey = ty - (dy / (dist || 1)) * stop;
        const travel = Math.max(0.22, dist / (cell * (sp ? 5.5 : 9))) / spd;
        if (sp) play(A, 'move', true); else A.scale = 1.1;
        tween(A, ex, ey, travel, sp ? cell * 0.08 : cell * 0.25);
        yield travel;
        A.scale = 1;
        if (V) {
          if (sp) {
            const total = play(A, 'attack');
            const hitAt = (sp.impact / sp.anims.attack.n) * total;
            yield hitAt; rest = total - hitAt;
          }
          cb.impact && cb.impact();
        }
      }
      if (V) {
        if (V.sp) {
          const h = play(V, 'hit');
          yield Math.max(h * 0.6, rest);
          const d = play(V, 'death');
          if (sp && !canRanged) play(A, 'attack'), (A.t0 -= (sp.anims.attack.n - 1) / (sp.fps * spd)); // 마지막 자세 유지
          yield d + 0.15 / spd;
        } else {
          yield Math.max(0.2 / spd, rest);
        }
        V.fade = { t0: clock, dur: 0.3 / spd };
        yield 0.2 / spd;
        if (sp) { const back = (canRanged ? Math.max(0.22, dist / (cell * 7)) : 0.2) / spd; play(A, 'move', true); tween(A, tx, ty, back, 0); yield back; }
        else { tween(A, tx, ty, 0.12, 0); yield 0.12; }
        remove(V);
      } else {
        cb.arrive && cb.arrive();
      }
      if (sp) yield play(A, 'revert');
      remove(A);
      hiddenIdx.delete(m.to);
      cb.done && cb.done();
    })());
  };
  /* 제자리 시연 (꾸미기 미리보기용) */
  this.demo = function (idx) {
    const p = self.state.board[idx];
    if (!p || hiddenIdx.has(idx)) return;
    hiddenIdx.add(idx);
    run((function* () {
      const A = actor(p, idx);
      A.flip = defaultFlip(p);
      if (A.sp) {
        yield play(A, 'transform');
        play(A, 'move', true); yield 0.7;
        yield play(A, 'attack');
        yield play(A, 'revert');
      } else { A.scale = 1.25; yield 0.4; }
      remove(A); hiddenIdx.delete(idx);
    })());
  };
  function remove(a) { const i = actors.indexOf(a); if (i >= 0) actors.splice(i, 1); }
  this.fx = function (type, o) {
    const e = MJ.Effects.create(type, Object.assign({ r: cell * 0.5, w: W, h: H }, o));
    if (e) fxList.push(e);
  };
  this.fxAt = function (type, idx, o) { const [x, y] = toXY(idx); self.fx(type, Object.assign({ x, y }, o)); };
  this.shake = function (s) { shake = Math.max(shake, s || 10); };
  this.stop = () => { running = false; };
  this.busy = () => scripts.length > 0;

  /* ---------- 프레임 ---------- */
  let lastDraw = 0;
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!canvas.offsetParent) { last = now; return; } // 화면에 안 보이면 쉼
    // 성능: 연출이 없을 땐 프레임 수를 낮춰 배터리 절약 (파티클 있으면 30fps, 없으면 20fps)
    const S0 = self.state;
    const active = scripts.length || fxList.length || shake > 0 || (S0.skillTargets && S0.skillTargets.length) || S0.checkIdx >= 0 || bgDirty;
    const parts0 = MJ.Store.get().settings.particles && parts.length;
    const minGap = active ? 0 : (parts0 ? 32 : 48);
    if (now - lastDraw < minGap) return;
    lastDraw = now;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (bgDirty || !bgCache) { layout(); buildBg(); MJ.emit && MJ.emit('board-layout', self); }
    const S = self.state;

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    let sx = 0, sy = 0;
    if (shake > 0) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; shake = Math.max(0, shake - dt * 40); }
    g.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
    g.drawImage(bgCache, 0, 0, W, H);

    // 직전 수 경로 표시 (기물이 실제로 지나간 길)
    if (S.lastMove && S.board[S.lastMove.to]) drawLastPath(S.lastMove, S.board[S.lastMove.to], now);

    // 장군 경고
    if (S.checkIdx >= 0) {
      const [x, y] = toXY(S.checkIdx);
      const k = 0.5 + 0.5 * Math.sin(now / 120);
      g.save(); g.fillStyle = `rgba(255,30,30,${0.25 + k * 0.3})`;
      g.beginPath(); g.arc(x, y, cell * (0.55 + k * 0.1), 0, 7); g.fill(); g.restore();
    }

    // 이동 중인 기물의 도착칸은 정지 그림에서 제외
    clock += dt;
    for (let k = scripts.length - 1; k >= 0; k--) {
      const s = scripts[k];
      s.wait -= dt;
      while (s.wait <= 0) {
        const r = s.it.next();
        if (r.done) { scripts.splice(k, 1); break; }
        s.wait += r.value || 0;
      }
    }
    // ── 그리는 순서: 이펙트·파티클(아래) → 판 선 → 움직이는 기물 → 서 있는 기물 → 선택 표시(맨 위)
    //    → 기물과 판 선은 어떤 연출에도 가려지지 않음 (게임 플레이 우선)
    if (MJ.Store.get().settings.particles) { g.save(); g.globalAlpha = 0.75; MJ.Terrain.updateDraw(g, S.boardDef, parts, dt, W, H); g.restore(); }
    MJ.Effects.step(fxList, g, dt);
    if (linesCache) g.drawImage(linesCache, 0, 0, W, H);

    // 애니메이션 중인 기물 (아래쪽에 있는 것부터)
    actors.slice().sort((a, b) => a.y - b.y).forEach(a => {
      let hop = 0;
      if (a.tw) {
        const u = Math.min(1, (clock - a.tw.t0) / a.tw.dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        a.x = a.tw.x0 + (a.tw.x1 - a.tw.x0) * e; a.y = a.tw.y0 + (a.tw.y1 - a.tw.y0) * e;
        hop = Math.sin(u * Math.PI) * a.tw.hop;
        if (u >= 1) a.tw = null;
      }
      let alpha = 1;
      if (a.fade) alpha = Math.max(0, 1 - (clock - a.fade.t0) / a.fade.dur);
      if (a.proj) drawPiece(a.piece, a.x, a.y, { anim: frameOf(a), rotate: a.rot, aura: false, alpha: 1, flip: false });
      else drawPiece(a.piece, a.x, a.y - hop, { anim: frameOf(a), flip: a.flip, alpha, scale: a.scale });
    });

    // 서 있는 기물 (항상 맨 위)
    for (let i = 0; i < 90; i++) {
      const p = S.board[i];
      if (!p || hiddenIdx.has(i)) continue;
      const [x, y] = toXY(i);
      drawPiece(p, x, y, { selected: i === S.selected });
      if (S.marks && S.marks.has(p.id)) drawMarks(S.marks.get(p.id), x, y, radius(p), now);
    }

    // 스킬 대상 선택 표시
    if (S.skillTargets && S.skillTargets.length) {
      const k = 0.5 + 0.5 * Math.sin(now / 160);
      g.save();
      g.strokeStyle = S.skillColor || '#c38bff'; g.shadowColor = S.skillColor || '#c38bff'; g.shadowBlur = 12;
      g.lineWidth = Math.max(2, cell * 0.07);
      S.skillTargets.forEach(i => { const [x, y] = toXY(i); g.beginPath(); g.arc(x, y, cell * (0.5 + k * 0.08), 0, 7); g.stroke(); });
      g.restore();
    }

    // 이동 가능 칸
    if (S.targets && S.targets.length) {
      S.targets.forEach(m => {
        const [x, y] = toXY(m.to);
        g.save();
        if (m.cap) {
          g.strokeStyle = 'rgba(255,60,60,0.95)'; g.lineWidth = cell * 0.07;
          g.beginPath(); g.arc(x, y, cell * 0.46, 0, 7); g.stroke();
        } else {
          g.fillStyle = 'rgba(40,255,160,0.85)'; g.shadowColor = '#3cffb0'; g.shadowBlur = 8;
          g.beginPath(); g.arc(x, y, cell * 0.13, 0, 7); g.fill();
        }
        g.restore();
      });
    }
  }
  requestAnimationFrame(frame);
};
