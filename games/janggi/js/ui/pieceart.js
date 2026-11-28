/* =========================================================
 * 장기알 그리기 — 이미지가 있으면 이미지, 없으면 코드로 그림
 * MJ.PieceArt.draw(ctx, x, y, radius, piece, opts)
 *   piece : {s, t}
 *   opts  : { skin, king, selected, alpha, glowPulse }
 * ========================================================= */
MJ.PieceArt = (function () {
  function shapePath(g, shape, r) {
    g.beginPath();
    switch (shape) {
      case 'circle': g.arc(0, 0, r, 0, Math.PI * 2); break;
      case 'square': g.rect(-r * 0.88, -r * 0.88, r * 1.76, r * 1.76); break;
      case 'rounded': roundRect(g, -r * 0.9, -r * 0.9, r * 1.8, r * 1.8, r * 0.35); break;
      case 'hex': poly(g, 6, r, Math.PI / 6); break;
      case 'shield':
        g.moveTo(-r * 0.85, -r * 0.8); g.lineTo(r * 0.85, -r * 0.8); g.lineTo(r * 0.85, r * 0.1);
        g.quadraticCurveTo(r * 0.7, r * 0.75, 0, r); g.quadraticCurveTo(-r * 0.7, r * 0.75, -r * 0.85, r * 0.1);
        g.closePath(); break;
      default: poly(g, 8, r, Math.PI / 8);
    }
  }
  function poly(g, n, r, rot) {
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2;
      i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
  }
  function roundRect(g, x, y, w, h, r) {
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------- 진영 오라 (한/초 구분) ----------
   * mode 'token' : 장기알 주위 진영색 링 + 은은한 빛
   * mode 'unit'  : 변신한 유닛 발밑 타원 빛  */
  function aura(g, r, side, mode, pulse) {
    const A = MJ.CONFIG.aura, c = MJ.CONFIG.sides[side].aura || MJ.CONFIG.sides[side].color;
    const k = (A.strength || 1) * (0.75 + 0.25 * (pulse == null ? 0.5 : pulse));
    g.save();
    if (mode === 'token' && A.ring) {
      const gr = g.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 1.35);
      gr.addColorStop(0, hexA(c, 0.55 * k)); gr.addColorStop(1, hexA(c, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.35, 0, Math.PI * 2); g.fill();
      g.strokeStyle = hexA(c, 0.95); g.lineWidth = Math.max(2, r * 0.13);
      g.shadowColor = c; g.shadowBlur = r * 0.6 * k;
      g.beginPath(); g.arc(0, 0, r * 1.06, 0, Math.PI * 2); g.stroke();
    } else if (mode === 'unit' && A.ground) {
      g.translate(0, r * 0.95);
      g.scale(1, 0.32);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.25);
      gr.addColorStop(0, hexA(c, 0.85 * k)); gr.addColorStop(0.6, hexA(c, 0.35 * k)); gr.addColorStop(1, hexA(c, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.25, 0, Math.PI * 2); g.fill();
      g.strokeStyle = hexA(c, 0.9); g.lineWidth = Math.max(2, r * 0.09);
      g.beginPath(); g.arc(0, 0, r * 1.0, 0, Math.PI * 2); g.stroke();
    }
    g.restore();
  }
  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
  }

  /* 왕 정의를 스킨 형태로 변환 */
  function kingAsSkin(king) {
    return {
      shape: king.shape || 'octagon', face: king.colors.face, rim: king.colors.rim, rimWidth: 0.1, inner: true,
      glyphColor: king.colors.glyph, glow: king.colors.aura, font: '"Noto Serif KR", serif',
      image: king.piece, glyphs: null, isKing: true, sprite: king.sprite || null, id: king.id,
    };
  }

  function glyphOf(skin, piece, king) {
    if (piece.t === 'K' && king) return typeof king.glyph === 'object' ? (king.glyph[piece.s] || '王') : king.glyph;
    if (skin.glyphs && skin.glyphs[piece.s] && skin.glyphs[piece.s][piece.t]) return skin.glyphs[piece.s][piece.t];
    const set = MJ.CONFIG.glyphSets[skin.glyphSet || 'hanja'] || MJ.CONFIG.glyphSets.hanja;
    return set[piece.s][piece.t];
  }

  function draw(g, x, y, r, piece, o) {
    o = o || {};
    const king = piece.t === 'K' ? o.king : null;
    let skin = king ? kingAsSkin(king) : (o.skin || MJ.Registry.get('skin', 'classic'));
    // 장기알 상태(대기) → 진영 대표 스킨으로 통일
    if (!o.anim && o.tokenSkin) {
      const ts = o.tokenSkin;
      if (ts.codeToken) skin = Object.assign({}, ts, { sprite: null, image: null }); // 코드로 그린 통일 장기알
      else if (piece.t === 'K') skin = Object.assign({}, ts, { sprite: ts.kingSprite || null, image: null, isKing: true });
      else skin = ts;
    }
    const side = piece.s;
    const col = c => MJ.resolveColor(c, side);

    g.save();
    g.translate(x, y);
    if (o.alpha != null) g.globalAlpha = o.alpha;
    if (o.rotate) g.rotate(o.rotate);
    if (o.scale) g.scale(o.scale, o.scale);

    // 스프라이트(애니메이션 시트) 우선
    const sp = skin.sprite ? MJ.spriteFor(skin.sprite, side, piece.t) : null;
    if (sp) {
      const sheet = MJ.Assets.img(sp.sheet);
      if (sheet) {
        const [an, fi] = o.anim || sp.idle;
        const A = sp.anims[an] || sp.anims.transform;
        const f = Math.max(0, Math.min(A.n - 1, fi | 0));
        const k = (r * 2 * (o.tokenFit || 1.04)) / sp.tokenDiam;
        const dw = sp.frameW * k, dh = sp.frameH * k;
        const TF = sp.tokenFrames || { transform: [0], revert: [2, 3, 4, 5] };
        const isToken = !!(TF[an] && TF[an].includes(f));
        if (o.aura !== false) aura(g, r, side, isToken ? 'token' : 'unit', o.glowPulse);
        if (!isToken && !!o.flip !== (sp.face < 0)) g.scale(-1, 1); // 시트가 왼쪽을 보면(face:-1) 반대로, 장기알 상태는 뒤집지 않음
        if (o.selected) { g.shadowColor = '#fff36b'; g.shadowBlur = r * 0.7; }
        else if (o.aura !== false && MJ.CONFIG.aura.outline) {
          g.shadowColor = MJ.CONFIG.sides[side].aura || MJ.CONFIG.sides[side].color;
          g.shadowBlur = r * (isToken ? 0.25 : 0.45);
        }
        g.drawImage(sheet, f * sp.frameW, A.row * sp.frameH, sp.frameW, sp.frameH, -dw / 2, -dh / 2, dw, dh);
        if (o.selected) { g.shadowBlur = r * 0.4; g.drawImage(sheet, f * sp.frameW, A.row * sp.frameH, sp.frameW, sp.frameH, -dw / 2, -dh / 2, dw, dh); }
        g.restore();
        return;
      }
    }
    // 이미지 우선
    const path = MJ.Assets.fill(skin.image, { side, type: piece.t, id: skin.id || (o.skin ? o.skin.id : '') });
    const im = MJ.Assets.img(path);

    // 선택 / 오라
    if (o.selected || (king && o.aura !== false)) {
      const pulse = o.glowPulse != null ? o.glowPulse : 0.5;
      g.save();
      g.shadowColor = o.selected ? '#fff36b' : col(skin.glow || '#fff');
      g.shadowBlur = r * (o.selected ? 0.9 : 0.5 + pulse * 0.4);
      g.fillStyle = 'rgba(0,0,0,0.01)';
      shapePath(g, skin.shape, r * 1.02); g.fill();
      g.restore();
    }

    if (im) {
      if (o.aura !== false) aura(g, r, side, 'token', o.glowPulse);
      const s = r * 2 * (skin.imageScale || 1.15);
      g.drawImage(im, -s / 2, -s / 2, s, s);
      if (o.selected) { g.strokeStyle = '#fff36b'; g.lineWidth = r * 0.12; shapePath(g, 'circle', r * 1.05); g.stroke(); }
      g.restore();
      return;
    }

    // 진영 오라
    if (o.aura !== false) aura(g, r, side, 'token', o.glowPulse);

    // 그림자
    g.save();
    g.translate(r * 0.06, r * 0.12);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    shapePath(g, skin.shape, r); g.fill();
    g.restore();

    // 빛
    if (skin.glow) { g.shadowColor = col(skin.glow); g.shadowBlur = r * 0.45; }

    // 몸체
    const gr = g.createLinearGradient(0, -r, 0, r);
    gr.addColorStop(0, col(skin.face[0])); gr.addColorStop(1, col(skin.face[1]));
    g.fillStyle = gr;
    shapePath(g, skin.shape, r); g.fill();
    g.shadowBlur = 0;

    // 테두리
    g.lineWidth = r * (skin.rimWidth || 0.07);
    g.strokeStyle = col(skin.rim);
    if (skin.pixel) g.lineJoin = 'miter';
    shapePath(g, skin.shape, r - g.lineWidth / 2); g.stroke();

    // 안쪽 링
    if (skin.inner) {
      g.lineWidth = Math.max(1, r * 0.035);
      g.globalAlpha *= 0.55;
      shapePath(g, skin.shape, r * 0.8); g.stroke();
      g.globalAlpha = o.alpha != null ? o.alpha : 1;
    }

    // 하이라이트
    g.save();
    shapePath(g, skin.shape, r); g.clip();
    const hl = g.createLinearGradient(0, -r, 0, 0);
    hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fillRect(-r, -r, r * 2, r);
    g.restore();

    // 낙관 / 진영 점
    if (skin.seal || skin.sideDot) {
      g.fillStyle = MJ.CONFIG.sides[side].color;
      if (skin.seal) g.fillRect(r * 0.38, r * 0.38, r * 0.3, r * 0.3);
      else { g.beginPath(); g.arc(0, r * 0.68, r * 0.12, 0, 7); g.fill(); }
    }

    // 글자
    const ch = glyphOf(skin, piece, king);
    const fs = r * (piece.t === 'K' ? 1.05 : 1.0) * (skin.glyphScale || 1);
    g.font = `900 ${fs}px ${skin.font || 'serif'}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = col(skin.glyphColor || 'side');
    if (skin.glow && !skin.isKing) { g.shadowColor = col(skin.glow); g.shadowBlur = r * 0.2; }
    g.fillText(ch, 0, r * 0.06);
    g.restore();
  }

  /* 초상 카드 (이미지 없으면 큰 글자 + 이모지) */
  function portrait(g, w, h, king, side) {
    g.clearRect(0, 0, w, h);
    const im = MJ.Assets.img(MJ.Assets.fill(king.portrait, { side }));
    if (im) { g.drawImage(im, 0, 0, w, h); return; }
    const c = MJ.CONFIG.sides[side];
    const sp = king.sprite ? MJ.spriteFor(king.sprite, side, 'K') : null;
    const sheet = sp && MJ.Assets.img(sp.sheet);
    if (sheet) {
      const gr0 = g.createRadialGradient(w / 2, h * 0.45, 4, w / 2, h / 2, w * 0.75);
      gr0.addColorStop(0, c.light); gr0.addColorStop(1, c.dark);
      g.fillStyle = gr0; g.fillRect(0, 0, w, h);
      const [an, fi] = sp.thumb;
      const A = sp.anims[an];
      const k = (w * 1.05) / sp.frameH;
      const dw = sp.frameW * k, dh = sp.frameH * k;
      g.drawImage(sheet, fi * sp.frameW, A.row * sp.frameH, sp.frameW, sp.frameH, (w - dw) / 2, (h - dh) / 2 + h * 0.04, dw, dh);
      return;
    }
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, king.colors.face[0]); gr.addColorStop(1, c.color);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.15)';
    g.beginPath(); g.arc(w * 0.5, h * 0.55, w * 0.42, 0, 7); g.fill();
    g.font = `${w * 0.36}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(king.emoji || '', w * 0.78, h * 0.22);
    g.font = `900 ${w * 0.5}px "Noto Serif KR", serif`;
    g.fillStyle = king.colors.glyph; g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 6;
    g.fillText(typeof king.glyph === 'object' ? king.glyph[side] : king.glyph, w * 0.5, h * 0.58);
    g.shadowBlur = 0;
  }

  return { draw, portrait, shapePath, glyphOf, aura };
})();
