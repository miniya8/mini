/* ============================================================================
 * [장기판 꾸미기 v15]  js/board-beauty-v15.js   (이미지: assets/images/fx/board_*.webp 직접 생성)
 *  장기판 바닥층(기물·격자선 아래)에 그립니다.
 *   · 궁성 문양: 양쪽 궁성 아래에 진영 색(한=붉은색 · 초=청록색)의 원형 문양이 은은하게 숨 쉬듯 빛남
 *   · 모서리 장식: 판 네 모서리에 금속 덩굴 장식 (전장마다 금·은·청동 등 색이 다름)
 *   · 가장자리 그늘: 판 테두리를 살짝 어둡게 해 판이 또렷하게 떠 보이게 함
 *   · 빛 쓸림: 12초마다 판 위로 부드러운 빛이 한 번 지나감
 *  성능: 정적인 부분은 크기·전장이 바뀔 때만 한 번 그려 두고, 매 프레임은 복사 + 그라데이션 1장만 그림
 *  끄기: jgBoardBeauty.enabled = false
 * ============================================================================ */
(function jgBoardBeauty15() {
  if (window.jgBoardBeauty) return;
  const BB = window.jgBoardBeauty = { enabled: true };
  const IM = {}, L = (k, n) => { const i = new Image(); i.src = 'assets/images/fx/' + n + '.webp'; i.onload = () => { cacheKey = ''; }; IM[k] = i; };
  L('corner', 'board_corner'); L('seal', 'board_seal');
  const ok = im => !!im && im.complete && im.naturalWidth > 0;
  /* 전장별 장식 색 [모서리 색(null=원래 금색), 모서리 틴트 세기, 빛 쓸림 색] */
  const THEME = [
    ['255,214,140', .0, '255,230,170'],   /* 0 황토 사막: 금 */
    ['200,230,255', .55, '220,245,255'],  /* 1 설원: 은빛 */
    ['190,230,150', .4, '220,255,190'],   /* 2 숲: 청동·연두 */
    ['215,170,255', .5, '230,200,255'],   /* 3 암흑 성채: 보랏빛 은 */
    ['255,214,140', .0, '255,225,160']    /* 4 고성: 금 */
  ];
  let cache = null, cg = null, cacheKey = '';
  const tc = {};
  function tint(img, rgb, a) { const id = rgb + '|' + a; if (!a) return img; if (tc[id]) return tc[id]; const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, c.width, c.height); return (tc[id] = c); }

  function geom() {
    if (typeof px !== 'function' || typeof CX !== 'number' || CX < 5) return null;
    const p = [px(0, 0), px(8, 0), px(0, 9), px(8, 9)], xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), C: Math.min(CX, CY), palH: px(4, 1), palC: px(4, 8) };
  }
  /* 정적인 장식을 캐시 캔버스에 그림 (판 캔버스와 같은 좌표계) */
  function build(g, G, th) {
    const cvEl = g.canvas, w = cvEl.width, h = cvEl.height;
    if (!cache) { cache = document.createElement('canvas'); cg = cache.getContext('2d'); }
    cache.width = w; cache.height = h; cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, w, h);
    const m = g.getTransform ? g.getTransform() : null; if (m) cg.setTransform(m);
    const C = G.C, T = THEME[th] || THEME[0];
    /* 가장자리 그늘 */
    const pad = C * .55, bx = G.x0 - pad, by = G.y0 - pad, bw = G.x1 - G.x0 + pad * 2, bh = G.y1 - G.y0 + pad * 2;
    const edge = (x0, y0, x1, y1) => { const gr = cg.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,.32)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); return gr; };
    const e = C * .9;
    cg.fillStyle = edge(bx, 0, bx + e, 0); cg.fillRect(bx, by, e, bh); cg.fillStyle = edge(bx + bw, 0, bx + bw - e, 0); cg.fillRect(bx + bw - e, by, e, bh);
    cg.fillStyle = edge(0, by, 0, by + e); cg.fillRect(bx, by, bw, e); cg.fillStyle = edge(0, by + bh, 0, by + bh - e); cg.fillRect(bx, by + bh - e, bw, e);
    /* 강(가운데 두 줄 사이) 살짝 밝게 */
    const rv = px(0, 4), rv2 = px(0, 5), ry0 = Math.min(rv[1], rv2[1]), ry1 = Math.max(rv[1], rv2[1]);
    const rg = cg.createLinearGradient(0, ry0, 0, ry1); rg.addColorStop(0, `rgba(${T[2]},0)`); rg.addColorStop(.5, `rgba(${T[2]},.07)`); rg.addColorStop(1, `rgba(${T[2]},0)`); cg.fillStyle = rg; cg.fillRect(G.x0, ry0, G.x1 - G.x0, ry1 - ry0);
    /* 모서리 장식 */
    if (ok(IM.corner)) {
      const src = tint(IM.corner, T[0], T[1]), z = C * 2.2, o = C * .66;
      [[G.x0 - o, G.y0 - o, 0], [G.x1 + o, G.y0 - o, Math.PI / 2], [G.x1 + o, G.y1 + o, Math.PI], [G.x0 - o, G.y1 + o, -Math.PI / 2]].forEach(([x, y, r]) => { cg.save(); cg.translate(x, y); cg.rotate(r); cg.globalAlpha = .92; cg.drawImage(src, 0, 0, z, z); cg.restore(); });
    }
  }
  function drawSeals(g, G, now) {
    if (!ok(IM.seal)) return;
    const z = G.C * 2.55, br = .5 + .5 * Math.sin(now / 1400);
    [[G.palH, '255,110,80'], [G.palC, '70,230,205']].forEach(([p, rgb], i) => {
      g.save(); g.translate(p[0], p[1]); g.rotate(now / 26000 * (i ? -1 : 1)); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .2 + .1 * (i ? 1 - br : br);
      g.drawImage(tint(IM.seal, rgb, 1), -z / 2, -z / 2, z, z); g.restore();
    });
  }
  function drawSheen(g, G, now, th) {
    const T = THEME[th] || THEME[0], per = 12000, q = (now % per) / per; if (q > .28) return;
    const k = q / .28, w = G.x1 - G.x0, h = G.y1 - G.y0, d = w + h, x = G.x0 - h + d * k * 1.25;
    const a = Math.sin(k * Math.PI) * .12, gr = g.createLinearGradient(x, G.y1, x + h * .6, G.y0);
    gr.addColorStop(0, `rgba(${T[2]},0)`); gr.addColorStop(.5, `rgba(${T[2]},${a})`); gr.addColorStop(1, `rgba(${T[2]},0)`);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(G.x0 - G.C * .4, G.y0 - G.C * .4, w + G.C * .8, h + G.C * .8); g.restore();
  }

  const HAS = (f, t) => { for (let i = 0; f && i < 80; i++, f = f.__prev) if (f[t]) return true; return false; };
  function hook() {
    const orig = window.jgDrawBoardThemeFX; if (HAS(orig, '__bb15')) return;
    const fn = function (g, now) {
      /* 장식은 다른 바닥 효과보다 먼저(가장 아래) 그림 */
      if (BB.enabled) try {
        const G = geom();
        if (G) {
          const th = window.curBoardIdx || 0, key = [g.canvas.width, g.canvas.height, Math.round(G.x0), Math.round(G.y0), Math.round(G.C * 10), th, (typeof flip !== 'undefined' && flip) ? 1 : 0].join();
          if (key !== cacheKey) { build(g, G, th); cacheKey = key; }
          g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cache, 0, 0); g.restore();
          drawSeals(g, G, now); drawSheen(g, G, now, th);
        }
      } catch (e) {}
      if (typeof orig === 'function') return orig.apply(this, arguments);
    };
    fn.__bb15 = true; fn.__prev = orig;
    ['__e3', '__e5', '__sfx', '__n14', '__crispGridTop'].forEach(k => { if (HAS(orig, k)) fn[k] = true; });
    window.jgDrawBoardThemeFX = fn;
  }
  hook(); setInterval(hook, 1500);
})();
