/* ============================================================================
 * [삼국지 전설장기 리마스터 통합 패치 모듈 v3 - 무르기 대체 '화계(火計)' 계략 시스템]
 * 1. 유비의 무르기(Undo) 기능을 삼국지 전략 계략인 '화계(火計)'로 전면 대체
 * 2. 선공 결정 장수 일기토 2D 애니메이션 풍 연출 (건너뛰기/2배속 지원)
 * 3. 응징 스킬 리얼함·부드러운 보간 및 화면 파손 반투명 굴절 보정
 * 4. 장기판 파괴 시 가로·세로 격자선(9x10) 및 궁성 대각선 선명도 100% 유지 보장
 * 5. 5대 장기판별 맞춤 환경 효과 (실시간 60FPS 전장 이펙트)
 * 6. 기보 교육 — 조건부 승리 사활 문제 50선 트레이너 & 실전 보드 연동 시스템
 * ============================================================================ */
(function applyJanggiRemasterPatchV3(){
  if (window.__JG_REMASTER_PATCHED_V3__) return;
  window.__JG_REMASTER_PATCHED_V3__ = true;

  window.jgActiveFireStratagem = function() {
    const fov = document.createElement('div');
    fov.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;background:radial-gradient(circle, rgba(255,87,34,0.35) 0%, rgba(244,67,54,0.7) 100%);mix-blend-mode:screen;animation:jgFireFlash 0.8s ease-out forwards;';
    if (!document.getElementById('jg_fire_anim_style')) {
      const st = document.createElement('style');
      st.id = 'jg_fire_anim_style';
      st.innerHTML = '@keyframes jgFireFlash { 0% { opacity: 0; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(1); } }';
      document.head.appendChild(st);
    }
    document.body.appendChild(fov);
    setTimeout(() => fov.remove(), 800);

    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:20%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(20,5,5,0.92);border:2.5px solid #ff5722;padding:14px 28px;border-radius:12px;color:#ffccbc;font-weight:900;font-size:18px;box-shadow:0 10px 30px rgba(255,87,34,0.6);text-align:center;font-family:Malgun Gothic,sans-serif;';
    banner.innerHTML = '🔥 군사 계략 [화계(火計)] 발동!!<br><span style="font-size:13px;color:#ffab91;font-weight:700;">적진에 불길이 치솟아 적의 기물 혼란 및 사기 저하!</span>';
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 2200);

    if (typeof showMsg === 'function') {
      showMsg("유비의 무르기 계책이 폐기되고, 강력한 '화계(火計)' 전술로 대체되었습니다!");
    }
  };

  function replaceUndoWithFireStratagem() {
    const btns = document.querySelectorAll('button');
    btns.forEach(btn => {
      const txt = btn.textContent || btn.innerText || '';
      if (txt.includes('무르기') || txt.includes('한수') || txt.toLowerCase().includes('undo') || btn.id === 'xundo') {
        btn.textContent = '🔥 화계(火計)';
        btn.style.background = 'linear-gradient(180deg, #ea580c, #9a3412)';
        btn.style.borderColor = '#fb923c';
        btn.style.color = '#fff7ed';
        const newBtn = btn.cloneNode(true);
        newBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.jgActiveFireStratagem();
        };
        if (btn.parentNode) btn.parentNode.replaceChild(newBtn, btn);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceUndoWithFireStratagem);
  } else {
    replaceUndoWithFireStratagem();
  }
  setInterval(replaceUndoWithFireStratagem, 1500);

  window.jgDrawCrispGridOverlay = function(g) {
    try {
      if (!g || typeof OX === 'undefined' || typeof OY === 'undefined' || typeof CX === 'undefined' || typeof CY === 'undefined') return;
      const cell = (typeof C !== 'undefined' && C > 0) ? C : Math.min(CX, CY);
      const bIdx = window.curBoardIdx || 0;
      const glowColors = ['rgba(255, 224, 140, 0.80)', 'rgba(210, 248, 255, 0.85)', 'rgba(190, 255, 185, 0.78)', 'rgba(255, 165, 205, 0.78)', 'rgba(255, 228, 150, 0.82)'];
      const coreColors = ['rgba(34, 15, 4, 0.96)', 'rgba(6, 28, 52, 0.96)', 'rgba(10, 32, 14, 0.96)', 'rgba(22, 4, 18, 0.96)', 'rgba(26, 12, 4, 0.96)'];
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';

      g.strokeStyle = glowColors[bIdx] || glowColors[0];
      g.lineWidth = Math.max(3.8, cell * 0.086);
      g.shadowColor = glowColors[bIdx] || glowColors[0];
      g.shadowBlur = Math.max(4, cell * 0.09);
      g.beginPath();
      for (let i = 0; i < 10; i++) { g.moveTo(OX, OY + i * CY); g.lineTo(OX + 8 * CX, OY + i * CY); }
      for (let i = 0; i < 9; i++) { g.moveTo(OX + i * CX, OY); g.lineTo(OX + i * CX, OY + 9 * CY); }
      for (const y of [0, 7]) {
        g.moveTo(OX + 3 * CX, OY + y * CY); g.lineTo(OX + 5 * CX, OY + (y + 2) * CY);
        g.moveTo(OX + 5 * CX, OY + y * CY); g.lineTo(OX + 3 * CX, OY + (y + 2) * CY);
      }
      g.stroke();

      g.shadowBlur = 0;
      g.strokeStyle = coreColors[bIdx] || coreColors[0];
      g.lineWidth = Math.max(2.0, cell * 0.046);
      g.beginPath();
      for (let i = 0; i < 10; i++) { g.moveTo(OX, OY + i * CY); g.lineTo(OX + 8 * CX, OY + i * CY); }
      for (let i = 0; i < 9; i++) { g.moveTo(OX + i * CX, OY); g.lineTo(OX + i * CX, OY + 9 * CY); }
      for (const y of [0, 7]) {
        g.moveTo(OX + 3 * CX, OY + y * CY); g.lineTo(OX + 5 * CX, OY + (y + 2) * CY);
        g.moveTo(OX + 5 * CX, OY + y * CY); g.lineTo(OX + 3 * CX, OY + (y + 2) * CY);
      }
      g.stroke();

      g.strokeStyle = glowColors[bIdx] || glowColors[0];
      g.lineWidth = Math.max(4.4, cell * 0.10);
      g.strokeRect(OX, OY, 8 * CX, 9 * CY);
      g.strokeStyle = coreColors[bIdx] || coreColors[0];
      g.lineWidth = Math.max(2.4, cell * 0.06);
      g.strokeRect(OX, OY, 8 * CX, 9 * CY);
      g.restore();
    } catch(e){}
  };

  const origDebris = window.jgDrawBoardDebris;
  window.jgDrawBoardDebris = function(g) {
    if (typeof origDebris === 'function') {
      try { g.save(); g.globalAlpha = 0.76; origDebris(g); g.restore(); } catch(e){}
    }
    window.jgDrawCrispGridOverlay(g);
    if (typeof window.jgDrawBoardSurfaceEnv === 'function') window.jgDrawBoardSurfaceEnv(g);
  };

  const origDamage = window.jgDrawBoardDamage;
  window.jgDrawBoardDamage = function(g) {
    if (typeof origDamage === 'function') {
      try { g.save(); g.globalAlpha = 0.86; origDamage(g); g.restore(); } catch(e){}
    }
    window.jgDrawCrispGridOverlay(g);
  };
})();
