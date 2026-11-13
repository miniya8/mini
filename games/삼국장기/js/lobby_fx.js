(function initThreeKingdomsMainScreen(){
  const fr = document.getElementById('fr');
  if (!fr) return;

  // 1) 전장 불티 & 한·초 기운 파티클(Ember) 배경 캔버스
  const ecv = document.createElement('canvas');
  ecv.id = 'lb_ember_cv';
  ecv.width = 960;
  ecv.height = 540;
  fr.appendChild(ecv);
  const ectx = ecv.getContext('2d');

  const embers = Array.from({length: 64}, (_, i) => ({
    x: Math.random() * 960,
    y: Math.random() * 540,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -0.45 - Math.random() * 0.95,
    r: 1.3 + Math.random() * 2.8,
    side: i % 2 === 0 ? 'h' : 'c',
    a: 0.4 + Math.random() * 0.6
  }));

  // 2) 초기 홈 화면 하단에 삼국지 무장 세력 배너 추가
  const homeView = document.getElementById('lb_home_view');
  if (homeView && !document.getElementById('lb_samguk_bar')) {
    const bar = document.createElement('div');
    bar.id = 'lb_samguk_bar';
    bar.className = 'lb-samguk-showcase';
    bar.innerHTML = `
      <div class="lb-sg-side">
        <span class="lb-sg-badge han">漢 촉한 무장진</span>
        <span class="lb-sg-names">유비(宮) · 관우(車) · 제갈량(士) · 조운(馬) · 황충(包) · 장비(象)</span>
      </div>
      <div class="lb-sg-center">🔥 천하쟁패 삼국지 대전 🔥</div>
      <div class="lb-sg-side">
        <span class="lb-sg-names">조조(宮) · 하후돈(車) · 사마의(士) · 장료(馬) · 조인(包) · 허저(象)</span>
        <span class="lb-sg-badge cho">楚 조위 무장진</span>
      </div>
    `;
    homeView.appendChild(bar);
  }

  // 3) 메인 카드 내 이모지를 삼국지 대표 무장(관우vs하후돈 / 유비vs조조) 실시간 전투 모션 캔버스로 교체
  const mpBtn = document.getElementById('lb_go_mp');
  const aiBtn = document.getElementById('lb_go_ai');

  function setupGeneralBanner(btn, leftSide, leftPiece, rightSide, rightPiece, badgeText) {
    if (!btn) return null;
    const iconEl = btn.querySelector('.lb-hero-icon');
    if (!iconEl) return null;
    const wrap = document.createElement('div');
    wrap.className = 'lb-hero-generals';
    wrap.innerHTML = `
      <canvas width="140" height="140" class="gen-cv-l"></canvas>
      <span class="lb-vs-emblem">${badgeText}</span>
      <canvas width="140" height="140" class="gen-cv-r"></canvas>
    `;
    iconEl.replaceWith(wrap);
    return {
      lCtx: wrap.querySelector('.gen-cv-l').getContext('2d'),
      rCtx: wrap.querySelector('.gen-cv-r').getContext('2d'),
      lSpec: { s: leftSide, t: leftPiece },
      rSpec: { s: rightSide, t: rightPiece }
    };
  }

  const mpBanner = setupGeneralBanner(mpBtn, 'h', 'R', 'c', 'R', '관우 ⚔️ 하후돈');
  const aiBanner = setupGeneralBanner(aiBtn, 'h', 'K', 'c', 'K', '유비 👑 조조');

  let tick = 0;
  function animateLobby() {
    const st = document.getElementById('st');
    if (st && getComputedStyle(st).display !== 'none') {
      tick++;
      ectx.clearRect(0, 0, 960, 540);
      for (const p of embers) {
        p.x += p.vx + Math.sin((tick + p.y) * 0.03) * 0.28;
        p.y += p.vy;
        if (p.y < -10) { p.y = 550; p.x = Math.random() * 960; }
        ectx.save();
        ectx.globalAlpha = p.a * (0.65 + 0.35 * Math.sin(tick * 0.08 + p.x));
        ectx.fillStyle = p.side === 'h' ? '#ff6d3a' : '#38f2c8';
        ectx.shadowColor = p.side === 'h' ? '#ff2a00' : '#00bfa5';
        ectx.shadowBlur = 9;
        ectx.beginPath();
        ectx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ectx.fill();
        ectx.restore();
      }

      const syncFrameIdx = Math.floor(performance.now() / 95);
      const isReady = (spec) => typeof SP !== 'undefined' && SP[spec.s] && SP[spec.s][spec.t] && SP[spec.s][spec.t].atk && SP[spec.s][spec.t].atk.length > 0;
      const drawGen = (ctx, spec, flip, fIdx) => {
        if (!ctx || !isReady(spec)) return;
        const frames = SP[spec.s][spec.t].atk;
        const f = frames[fIdx % frames.length];
        if (!f || !f.im || !f.im.complete) return;
        ctx.clearRect(0, 0, 140, 140);
        ctx.save();
        if (flip) {
          ctx.translate(140, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(f.im, 0, 0, 140, 140);
        ctx.restore();
      };

      if (mpBanner && isReady(mpBanner.lSpec) && isReady(mpBanner.rSpec)) {
        drawGen(mpBanner.lCtx, mpBanner.lSpec, false, syncFrameIdx);
        drawGen(mpBanner.rCtx, mpBanner.rSpec, true, syncFrameIdx);
      }
      if (aiBanner && isReady(aiBanner.lSpec) && isReady(aiBanner.rSpec)) {
        drawGen(aiBanner.lCtx, aiBanner.lSpec, false, syncFrameIdx);
        drawGen(aiBanner.rCtx, aiBanner.rSpec, true, syncFrameIdx);
      }
    }
    requestAnimationFrame(animateLobby);
  }
  requestAnimationFrame(animateLobby);
})();
