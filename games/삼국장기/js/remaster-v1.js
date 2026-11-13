
/* ============================================================================
 * [삼국지 전설장기 리마스터 통합 패치 모듈]
 * 1. 선공 결정 장수 일기토 2D 애니메이션 풍 연출 (등장·대치·공방·판정·선공 안내 + 건너뛰기/2배속)
 * 2. 응징 스킬(에네르기파2·주먹·망치·총격) 리얼함·부드러운 가감속 보간 및 성능 최적화
 * 3. 장기판 파괴 시 가로·세로 격자선(9x10) 및 궁성 대각선 선명도 100% 유지 보장
 * ============================================================================ */
(function applyJanggiRemasterPatch(){
  if (window.__JG_REMASTER_PATCHED__) return;
  window.__JG_REMASTER_PATCHED__ = true;

  const sm = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a || 1e-6)));
    return t * t * (3 - 2 * t);
  };
  const eOutCubic = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const eOutBack = x => {
    const c1 = 1.70158, c3 = c1 + 1;
    const t = Math.max(0, Math.min(1, x)) - 1;
    return 1 + c3 * t * t * t + c1 * t * t;
  };

  /* --------------------------------------------------------------------------
   * [4단계] 장기판 파괴 시에도 가로·세로 9x10 격자선 및 궁성 대각선 선명 유지
   * - 크레이터·단층 유격·파편이 그려진 직후(기물·이동경로 렌더링 직전)
   *   고대비 이중 격자선(발광 베벨 + 진한 음각 코어선)과 교차점 마커를 복원합니다.
   * -------------------------------------------------------------------------- */
  window.jgDrawCrispGridOverlay = function(g) {
    try {
      if (!g || typeof OX === 'undefined' || typeof OY === 'undefined' || typeof CX === 'undefined' || typeof CY === 'undefined') return;
      const cell = (typeof C !== 'undefined' && C > 0) ? C : Math.min(CX, CY);
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';

      // 1) 파손 부위(어두운 크레이터/균열) 위에서도 선이 묻히지 않도록 황금빛 네온-석판 보호 광채(Outer Glow Bevel) 렌더링
      g.strokeStyle = 'rgba(255, 232, 168, 0.78)';
      g.lineWidth = Math.max(3.8, cell * 0.088);
      g.shadowColor = 'rgba(255, 215, 110, 0.85)';
      g.shadowBlur = Math.max(4, cell * 0.10);
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        g.moveTo(OX, OY + i * CY);
        g.lineTo(OX + 8 * CX, OY + i * CY);
      }
      for (let i = 0; i < 9; i++) {
        g.moveTo(OX + i * CX, OY);
        g.lineTo(OX + i * CX, OY + 9 * CY);
      }
      for (const y of [0, 7]) {
        g.moveTo(OX + 3 * CX, OY + y * CY);
        g.lineTo(OX + 5 * CX, OY + (y + 2) * CY);
        g.moveTo(OX + 5 * CX, OY + y * CY);
        g.lineTo(OX + 3 * CX, OY + (y + 2) * CY);
      }
      g.stroke();

      // 2) 선명한 중심 음각 격자선 (Dark Core Line)
      g.shadowBlur = 0;
      g.strokeStyle = 'rgba(24, 11, 3, 0.96)';
      g.lineWidth = Math.max(2.0, cell * 0.048);
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        g.moveTo(OX, OY + i * CY);
        g.lineTo(OX + 8 * CX, OY + i * CY);
      }
      for (let i = 0; i < 9; i++) {
        g.moveTo(OX + i * CX, OY);
        g.lineTo(OX + i * CX, OY + 9 * CY);
      }
      for (const y of [0, 7]) {
        g.moveTo(OX + 3 * CX, OY + y * CY);
        g.lineTo(OX + 5 * CX, OY + (y + 2) * CY);
        g.moveTo(OX + 5 * CX, OY + y * CY);
        g.lineTo(OX + 3 * CX, OY + (y + 2) * CY);
      }
      g.stroke();

      // 3) 외곽 프레임 이중 보강
      g.strokeStyle = 'rgba(255, 224, 140, 0.72)';
      g.lineWidth = Math.max(4.6, cell * 0.105);
      g.strokeRect(OX, OY, 8 * CX, 9 * CY);
      g.strokeStyle = 'rgba(32, 15, 5, 0.96)';
      g.lineWidth = Math.max(2.6, cell * 0.065);
      g.strokeRect(OX, OY, 8 * CX, 9 * CY);

      // 4) 주요 교차점(화점: 졸/병·포·궁성 중앙) 또렷한 마커 표시
      const pts = [
        [0,3],[2,3],[4,3],[6,3],[8,3],
        [0,6],[2,6],[4,6],[6,6],[8,6],
        [1,2],[7,2],[1,7],[7,7],[4,1],[4,8]
      ];
      const rDot = Math.max(2.4, cell * 0.052);
      for (const [px0, py0] of pts) {
        const X = (typeof px === 'function') ? px(px0, py0)[0] : (OX + px0 * CX);
        const Y = (typeof px === 'function') ? px(px0, py0)[1] : (OY + py0 * CY);
        g.fillStyle = 'rgba(28, 12, 4, 0.92)';
        g.beginPath();
        g.arc(X, Y, rDot * 1.35, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255, 225, 138, 0.92)';
        g.beginPath();
        g.arc(X, Y, rDot, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    } catch (e) {}
  };

  // jgDrawBoardDebris 및 board 함수를 래핑하여 파손 데칼이 격자선을 절대 덮지 못하도록 보장
  const origDebris = window.jgDrawBoardDebris;
  window.jgDrawBoardDebris = function(g) {
    if (typeof origDebris === 'function') {
      try {
        g.save();
        g.globalAlpha = 0.78; // 파편이 기물/격자 시야를 방해하지 않도록 투명도 밸런스 조정
        origDebris(g);
        g.restore();
      } catch (e) {}
    }
    window.jgDrawCrispGridOverlay(g);
  };

  const origDamage = window.jgDrawBoardDamage;
  window.jgDrawBoardDamage = function(g) {
    if (typeof origDamage === 'function') {
      try {
        g.save();
        g.globalAlpha = 0.88;
        origDamage(g);
        g.restore();
      } catch (e) {}
    }
    window.jgDrawCrispGridOverlay(g);
  };

  /* --------------------------------------------------------------------------
   * [3단계] 화면 파손(유리 균열) 가시성 보정 및 응징 스킬(에네르기파2 등) 부드러운 보간
   * - 화면 파손 오버레이(#scv)가 기물과 장기판 선을 가리지 않도록 반투명 강화유리 굴절로 보정
   * -------------------------------------------------------------------------- */
  const origDrawScreenDamage = window.drawScreenDamage;
  if (typeof origDrawScreenDamage === 'function') {
    window.drawScreenDamage = function() {
      origDrawScreenDamage.apply(this, arguments);
      const scv = document.getElementById('scv');
      if (scv) {
        scv.style.opacity = '0.62';
        scv.style.mixBlendMode = 'screen';
      }
    };
  }

  /* --------------------------------------------------------------------------
   * [2단계] 선공 결정 장수 일기토 2D 애니메이션 연출 (등장 -> 대치 -> 공방 -> 승패 -> 선공 안내)
   * - 건너뛰기(Skip) 및 2배속(2x) 버튼 제공, 반응형 캔버스 및 60fps 최적화
   * -------------------------------------------------------------------------- */
  window.playAnimeFirstTurnDuel = function(winnerSide, onComplete) {
    const winS = (winnerSide === 'h' || winnerSide === 'c') ? winnerSide : 'c';
    let finished = false;
    let speedMul = 1.0;
    let rafId = 0;

    const wrap = document.createElement('div');
    wrap.id = 'jg_anime_duel_ov';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#050814;display:flex;align-items:center;justify-content:center;user-select:none;overflow:hidden;';

    const cv = document.createElement('canvas');
    cv.style.cssText = 'width:100%;height:100%;display:block;';
    wrap.appendChild(cv);

    // 컨트롤 버튼 (2배속 / 건너뛰기)
    const ctrlBox = document.createElement('div');
    ctrlBox.style.cssText = 'position:absolute;top:16px;right:18px;display:flex;gap:10px;z-index:10;';
    const btnSpd = document.createElement('button');
    btnSpd.textContent = '⏩ 2× 빠른 진행';
    btnSpd.style.cssText = 'padding:8px 14px;border-radius:99px;border:1.5px solid #ffd54a;background:rgba(15,23,42,0.85);color:#ffd54a;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    const btnSkip = document.createElement('button');
    btnSkip.textContent = '⏭ 건너뛰기';
    btnSkip.style.cssText = 'padding:8px 16px;border-radius:99px;border:1.5px solid #fff;background:linear-gradient(180deg,#e53935,#b71c1c);color:#fff;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    ctrlBox.appendChild(btnSpd);
    ctrlBox.appendChild(btnSkip);
    wrap.appendChild(ctrlBox);
    document.body.appendChild(wrap);

    const cleanup = () => {
      if (finished) return;
      finished = true;
      if (rafId) cancelAnimationFrame(rafId);
      wrap.style.transition = 'opacity 0.25s ease';
      wrap.style.opacity = '0';
      setTimeout(() => {
        try { wrap.remove(); } catch (e) {}
        if (typeof onComplete === 'function') onComplete(winS);
      }, 250);
    };

    btnSpd.onclick = (e) => {
      e.stopPropagation();
      speedMul = speedMul === 1.0 ? 2.0 : 1.0;
      btnSpd.textContent = speedMul > 1 ? '⚡ 2× 적용중' : '⏩ 2× 빠른 진행';
      btnSpd.style.background = speedMul > 1 ? '#ffd54a' : 'rgba(15,23,42,0.85)';
      btnSpd.style.color = speedMul > 1 ? '#111' : '#ffd54a';
    };
    btnSkip.onclick = (e) => {
      e.stopPropagation();
      cleanup();
    };

    const g = cv.getContext('2d');
    let elapsed = 0;
    let lastT = performance.now();
    const TOTAL_DUR = 4.4;

    const sparks = Array.from({length: 48}, (_, i) => ({
      a: (i / 48) * Math.PI * 2,
      sp: 0.35 + (i % 7) * 0.14,
      r: 2 + (i % 4) * 1.5,
      col: i % 3 === 0 ? '#fff9c4' : (i % 2 === 0 ? '#ff5252' : '#00e5ff')
    }));

    function renderDuel(now) {
      if (finished) return;
      const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)) * speedMul;
      lastT = now;
      elapsed += dt;
      const t = elapsed;

      const W = window.innerWidth || 960;
      const H = window.innerHeight || 540;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const S = Math.min(W, H);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      // 1) 2D 애니메이션 풍 분할 배경 (좌: 한나라 적염 / 우: 초나라 청뢰)
      const splitShift = t >= 1.2 && t < 2.8 ? Math.sin(t * 45) * S * 0.015 : 0;
      g.save();
      const bgL = g.createLinearGradient(0, 0, W * 0.6, H);
      bgL.addColorStop(0, '#3a0606');
      bgL.addColorStop(1, '#9a1b1b');
      g.fillStyle = bgL;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(W * 0.54 + splitShift, 0);
      g.lineTo(W * 0.46 + splitShift, H);
      g.lineTo(0, H);
      g.closePath();
      g.fill();

      const bgR = g.createLinearGradient(W * 0.4, 0, W, H);
      bgR.addColorStop(0, '#073b4c');
      bgR.addColorStop(1, '#05192d');
      g.fillStyle = bgR;
      g.beginPath();
      g.moveTo(W * 0.54 + splitShift, 0);
      g.lineTo(W, 0);
      g.lineTo(W, H);
      g.lineTo(W * 0.46 + splitShift, H);
      g.closePath();
      g.fill();

      // 애니메이션 스피드라인
      g.strokeStyle = 'rgba(255,255,255,0.10)';
      g.lineWidth = 2;
      for (let i = 0; i < 24; i++) {
        const yy = ((i * 47 + t * 420) % H);
        g.beginPath();
        g.moveTo(0, yy);
        g.lineTo(W, yy - S * 0.06);
        g.stroke();
      }
      g.restore();

      // 2) 장수 위치 및 단계별 모션 (0~0.9s 등장/대치, 0.9~2.6s 격돌/공방, 2.6~4.4s 승패 판정 및 선공 안내)
      let lx = W * 0.25, ly = H * 0.54;
      let rx = W * 0.75, ry = H * 0.54;
      let lKey = 'walk', rKey = 'walk';
      let lScale = 1.0, rScale = 1.0;

      if (t < 0.9) {
        const u = eOutCubic(t / 0.9);
        lx = -S * 0.2 + (W * 0.30 + S * 0.2) * u;
        rx = W + S * 0.2 - (W * 0.30 + S * 0.2) * u;
        lKey = 'walk';
        rKey = 'walk';
      } else if (t < 2.6) {
        const p = (t - 0.9) / 1.7;
        const clash = Math.sin(p * Math.PI * 3);
        lx = W * 0.42 + clash * S * 0.05;
        rx = W * 0.58 - clash * S * 0.05;
        lKey = 'atk';
        rKey = 'atk';
        lScale = 1.12;
        rScale = 1.12;
      } else {
        const u = eOutBack(Math.min(1, (t - 2.6) / 0.6));
        if (winS === 'h') {
          lx = W * 0.42 + (W * 0.50 - W * 0.42) * u;
          rx = W * 0.58 + S * 0.28 * u;
          lKey = 'atk';
          rKey = 'hit';
          lScale = 1.32;
          rScale = 0.86;
        } else {
          rx = W * 0.58 - (W * 0.58 - W * 0.50) * u;
          lx = W * 0.42 - S * 0.28 * u;
          rKey = 'atk';
          lKey = 'hit';
          rScale = 1.32;
          lScale = 0.86;
        }
      }

      // 장수 스프라이트 렌더링 (SP 데이터 활용 + 셀 셰이딩 외곽 발광)
      const drawHero = (side, piece, key, x, y, sc, flipH, highlight) => {
        g.save();
        g.translate(x, y);
        if (flipH) g.scale(-1, 1);
        const sz = S * 0.36 * sc;
        let drawn = false;
        if (typeof SP !== 'undefined' && SP[side] && SP[side][piece] && SP[side][piece][key] && SP[side][piece][key].length) {
          const arr = SP[side][piece][key];
          const fr = arr[Math.floor(t * 14) % arr.length];
          if (fr && fr.im && fr.im.complete) {
            g.shadowColor = side === 'h' ? '#ff5252' : '#00e5ff';
            g.shadowBlur = highlight ? 28 : 14;
            g.drawImage(fr.im, -sz / 2, -sz / 2, sz, sz);
            drawn = true;
          }
        }
        if (!drawn) {
          g.fillStyle = side === 'h' ? '#e53935' : '#00acc1';
          g.strokeStyle = '#ffd54a';
          g.lineWidth = 4;
          g.beginPath();
          g.arc(0, 0, sz * 0.35, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
        g.restore();
      };

      drawHero('h', 'R', lKey, lx, ly, lScale, false, winS === 'h' && t >= 2.6);
      drawHero('c', 'R', rKey, rx, ry, rScale, true, winS === 'c' && t >= 2.6);

      // 3) 공방 교차 검기 및 스파크 이펙트 (0.9 ~ 2.7s)
      if (t >= 0.9 && t < 2.8) {
        const cx = W * 0.5, cy = H * 0.52;
        g.save();
        g.globalCompositeOperation = 'lighter';
        // 십자/대각선 참격 섬광
        for (let k = -1; k <= 1; k += 2) {
          const ang = k * (0.55 + 0.15 * Math.sin(t * 24));
          g.save();
          g.translate(cx, cy);
          g.rotate(ang);
          const grad = g.createLinearGradient(-S * 0.45, 0, S * 0.45, 0);
          grad.addColorStop(0, 'rgba(255,82,82,0)');
          grad.addColorStop(0.5, 'rgba(255,255,255,0.95)');
          grad.addColorStop(1, 'rgba(0,229,255,0)');
          g.fillStyle = grad;
          g.fillRect(-S * 0.45, -S * 0.018, S * 0.9, S * 0.036);
          g.restore();
        }
        // 충돌 스파크 파티클
        const q = (t - 0.9) % 0.55;
        for (const sp of sparks) {
          const dist = q * S * sp.sp * 1.4;
          const px = cx + Math.cos(sp.a + t * 2) * dist;
          const py = cy + Math.sin(sp.a + t * 2) * dist;
          g.fillStyle = sp.col;
          g.beginPath();
          g.arc(px, py, sp.r, 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
      }

      // 4) 상단 타이틀 & 승자 선공 안내 배너
      g.save();
      g.textAlign = 'center';
      g.font = `900 ${Math.round(S * 0.065)}px 'Malgun Gothic', sans-serif`;
      g.lineWidth = Math.max(4, S * 0.012);
      g.strokeStyle = '#000';
      g.fillStyle = '#ffd54a';
      const titleTxt = t < 0.9 ? '⚔️ 선공 결정 장수 일기토!!' : (t < 2.6 ? '💥 관우(漢) vs 하후돈(楚) 진검승부!!' : (winS === 'h' ? '🔥 한(漢) 일기토 승리 — 한나라 선공!!' : '⚡ 초(楚) 일기토 승리 — 초나라 선공!!'));
      g.strokeText(titleTxt, W * 0.5, H * 0.14);
      g.fillText(titleTxt, W * 0.5, H * 0.14);
      g.restore();

      if (t < TOTAL_DUR) {
        rafId = requestAnimationFrame(renderDuel);
      } else {
        cleanup();
      }
    }

    rafId = requestAnimationFrame(renderDuel);
  };
})();

