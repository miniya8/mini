/* ============================================================================
 * [장기판 찢어짐 효과 v8]  js/board-tear-v8.js    (이미지: assets/images/fx/tear_edge.webp · tear_void.webp · tear_shard.webp)
 *  검·창 군주 스킬(조조 6연참 · 유비 쌍검 · 여포 방천화극 · 손권 수압검기)에서
 *  '장기판 자체가 찢어지는' 표현을 만듭니다.
 *   1) 판 캔버스를 스냅샷으로 떠서, 찢김선 양쪽 판 조각을 바깥으로 밀어 벌어진 틈을 만들고
 *   2) 틈 안쪽은 성운이 비치는 공허 이미지로 채우고
 *   3) 찢어진 가장자리 이미지(섬유가 삐져나온 겉면 입술)를 양쪽에 붙이고
 *   4) 그림자 · 틈에서 새어나오는 속성 빛(불/얼음/전기/물…)과 날아가는 판 조각을 더합니다.
 *  jgTear.snap() → 스냅샷 / jgTear.make(spec, M, snap) → 찢김 레이어 / jgTear.draw(g, cut, q, alpha, rgb, t)
 * ============================================================================ */
(function jgTearModule() {
  if (window.jgTear) return;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const DIR = 'assets/images/fx/', IM = {};
  const load = n => { const i = new Image(); i.src = DIR + n + '.webp'; return i; };
  IM.edge = load('tear_edge'); IM.void = load('tear_void'); IM.ribbon = load('wl_ribbon'); IM.glow = load('v2_glow_y');
  const ok = im => !!im && im.complete && im.naturalWidth > 0;
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const tc = {};
  function tinted(img, key, rgb, a) { const id = key + rgb + a; if (tc[id]) return tc[id]; const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }

  /* 판 캔버스 스냅샷 (해상도 상한 1100px) */
  function snap() {
    const cvB = document.getElementById('cv'); if (!cvB || !cvB.width || !cvB.height) return null;
    const sc = Math.min(1, 1100 / cvB.width), c = document.createElement('canvas'); c.width = Math.max(2, Math.round(cvB.width * sc)); c.height = Math.max(2, Math.round(cvB.height * sc));
    try { c.getContext('2d').drawImage(cvB, 0, 0, c.width, c.height); } catch (e) { return null; }
    return c;
  }

  /* spec: { x, y, ang, len, gap, mode:'full'|'half', seed } — x,y = 찢김선 중심(half 는 뿌리), ang = 방향(rad) */
  function make(spec, M, sn) {
    const L = spec.len, G = spec.gap, half = spec.mode === 'half', rng = mulberry((spec.seed || 1) * 7919);
    const pad = Math.ceil(G * 3.2 + 14), Wb = G * 1.7, lw = Math.ceil(L + pad * 2), lh = Math.ceil((G * 1.7 + Wb) * 2 + 24), ox = half ? pad : lw / 2, oy = lh / 2;
    const layer = document.createElement('canvas'); layer.width = lw; layer.height = lh; const lc = layer.getContext('2d');
    const N = Math.max(10, Math.ceil(L / 6)), xs = [], top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = half ? u * L : (u - .5) * L;
      const prof = half ? Math.pow(1 - u, .8) * Math.min(1, u * 16 + .3) : Math.pow(Math.sin(Math.PI * u), .75);
      const nz = .78 + .22 * Math.sin(u * 21 + (spec.seed || 1)) + (rng() - .5) * .22, h = Math.max(.4, G * prof * nz), jt = (rng() - .5) * G * .55 * (i % 2 ? 1 : .45), jb = (rng() - .5) * G * .55 * (i % 2 ? .45 : 1);
      xs.push(x); top.push(-(h + jt)); bot.push(h + jb);
    }
    /* 1) 벌어진 판 조각 : 스냅샷을 바깥으로 밀어 그림 + 바깥쪽으로 갈수록 투명 */
    if (sn && M && !(window.jgPerf && window.jgPerf.q < .5)) {
      const tb = document.createElement('canvas'); tb.width = lw; tb.height = lh; const t2 = tb.getContext('2d'), shift = G * .5;
      [-1, 1].forEach(side => {
        const edge = side < 0 ? top : bot; t2.save(); t2.translate(ox, oy); t2.beginPath();
        for (let i = 0; i <= N; i++) i ? t2.lineTo(xs[i], edge[i]) : t2.moveTo(xs[i], edge[i]);
        for (let i = N; i >= 0; i--) t2.lineTo(xs[i], edge[i] + side * Wb);
        t2.closePath(); t2.clip();
        t2.translate(0, side * shift); t2.rotate(-spec.ang); t2.translate(-spec.x, -spec.y);
        t2.drawImage(sn, M.br.left, M.br.top, M.br.width, M.br.height); t2.restore();
      });
      t2.globalCompositeOperation = 'destination-in'; const span = 2 * (G * 1.4 + Wb), p1 = Wb / span, mk = t2.createLinearGradient(0, oy - (G * 1.4 + Wb), 0, oy + (G * 1.4 + Wb));
      mk.addColorStop(0, 'rgba(0,0,0,0)'); mk.addColorStop(p1, 'rgba(0,0,0,1)'); mk.addColorStop(1 - p1, 'rgba(0,0,0,1)'); mk.addColorStop(1, 'rgba(0,0,0,0)');
      t2.fillStyle = mk; t2.fillRect(0, 0, lw, lh); lc.drawImage(tb, 0, 0);
    }
    /* 2) 공허 (그림자 포함) */
    lc.save(); lc.translate(ox, oy); lc.beginPath();
    for (let i = 0; i <= N; i++) i ? lc.lineTo(xs[i], top[i]) : lc.moveTo(xs[i], top[i]);
    for (let i = N; i >= 0; i--) lc.lineTo(xs[i], bot[i]); lc.closePath();
    lc.shadowColor = 'rgba(0,0,0,.75)'; lc.shadowBlur = G * 1.2; lc.fillStyle = '#050208'; lc.fill(); lc.shadowBlur = 0; lc.clip();
    if (ok(IM.void)) { lc.fillStyle = lc.createPattern(IM.void, 'repeat'); lc.fillRect(-ox, -oy, lw, lh); }
    const ig = lc.createLinearGradient(0, -G * 1.4, 0, G * 1.4); ig.addColorStop(0, `rgba(${spec.rgb || '255,160,80'},.5)`); ig.addColorStop(.28, 'rgba(0,0,0,.25)'); ig.addColorStop(.5, 'rgba(0,0,0,.55)'); ig.addColorStop(.72, 'rgba(0,0,0,.25)'); ig.addColorStop(1, `rgba(${spec.rgb || '255,160,80'},.5)`);
    lc.fillStyle = ig; lc.fillRect(-ox, -G * 1.6, lw, G * 3.2); lc.restore();
    /* 3) 찢어진 가장자리 이미지 (겉면 입술 + 섬유) */
    if (ok(IM.edge)) {
      const sc = clamp(G * .012, .26, 1.0), tw = 128 * sc, y70 = 70 * sc, hSp = 96 * sc, ES = tinted(IM.edge, 'te', '60,34,12', .5);
      const yAt = (arr, x) => { const f = (x - xs[0]) / (xs[N] - xs[0]) * N, i = clamp(Math.floor(f), 0, N - 1), k = f - i; return arr[i] * (1 - k) + arr[i + 1] * k; };
      lc.save(); lc.translate(ox, oy);
      for (let x = xs[0]; x < xs[N]; x += tw * .92) {
        const xc = clamp(x + tw / 2, xs[0], xs[N]), gapHere = yAt(bot, xc) - yAt(top, xc); if (gapHere < 2.2) continue;
        const sx = ((Math.floor((x - xs[0]) / (tw * .92)) * 128) % 512 + 512) % 512;
        lc.drawImage(ES, sx, 0, 128, 96, x, yAt(top, xc) - y70 + 1, tw, hSp);
        lc.save(); lc.translate(0, yAt(bot, xc) - 1); lc.scale(1, -1); lc.drawImage(ES, sx, 0, 128, 96, x, -y70, tw, hSp); lc.restore();
      }
      lc.restore();
    }
    return { layer, lw, lh, ox, oy, spec, half, L, G, N, xs, top, bot };
  }

  /* 그리기 : q = 열림(0~1, 칼날이 지나간 비율), a = 전체 투명도 */
  function draw(g, cut, q, a, rgb, t) {
    if (!cut || a <= .004 || q <= 0) return; const { layer, lw, lh, ox, oy, spec, half, L, G } = cut;
    g.save(); g.translate(spec.x, spec.y); g.rotate(spec.ang); g.translate(-ox, -oy);
    const rx = q >= 1 ? lw : ox + (half ? 0 : -L / 2) + L * q + (half ? 0 : 0);
    g.beginPath(); g.rect(0, 0, Math.max(1, rx), lh); g.clip(); g.globalAlpha = clamp(a, 0, 1); g.drawImage(layer, 0, 0);
    /* 틈에서 새어나오는 속성 빛 */
    const xa = half ? 0 : -L / 2, xb = xa + L * Math.min(1, q), pul = .75 + .25 * Math.sin((t || 0) * 11 + spec.seed), col = rgb || spec.rgb || '255,170,90';
    if (ok(IM.ribbon) && xb - xa > 4) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a * .26 * pul, 0, 1); g.drawImage(tinted(IM.ribbon, 'tr', col, .9), ox + xa, oy - G * 1.5, xb - xa, G * 3.0); g.globalAlpha = clamp(a * .07 * pul, 0, 1); g.drawImage(IM.ribbon, ox + xa, oy - G * .45, xb - xa, G * .9); }
    if (ok(IM.glow) && q < 1) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a * .55, 0, 1); g.drawImage(tinted(IM.glow, 'tg', col, .85), ox + xb - G * 2.4, oy - G * 2.4, G * 4.8, G * 4.8); }
    g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  /* 칼날이 지나가는 끝점(월드 좌표) */
  function tip(cut, q) { const { spec, half, L } = cut, xa = half ? 0 : -L / 2, x = xa + L * clamp(q, 0, 1), c = Math.cos(spec.ang), s = Math.sin(spec.ang); return [spec.x + c * x, spec.y + s * x]; }
  function pointAt(cut, u) { const { spec, half, L } = cut, xa = half ? 0 : -L / 2, x = xa + L * clamp(u, 0, 1), c = Math.cos(spec.ang), s = Math.sin(spec.ang); return [spec.x + c * x, spec.y + s * x]; }

  window.jgTear = { snap, make, draw, tip, pointAt };
})();
