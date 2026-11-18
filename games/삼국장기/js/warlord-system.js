/* ============================================================================
 * [UI 정리 & 장기판 파손/격자선 시인성 개선 패치]
 * 1. 채팅창(#xlog) 상단 군주 아이콘 옆 명언 및 스킬 UI 제거 (아이콘은 유지)
 * 2. 장기판 파손 부위 반경 축소 및 그을음 투명도 완화
 * 3. 파손 부위 위에서도 선명히 보이는 밝은 황금·아이보리·시안 격자선 색상 적용
 * ============================================================================ */
(function applyJanggiCleanAndLineColorPatch() {
  if (window.__JG_CLEAN_LINE_PATCHED__) return;
  window.__JG_CLEAN_LINE_PATCHED__ = true;

  /* --------------------------------------------------------------------------
   * 1. 채팅창(#xlog) 위 군주 아이콘 옆 명언 & 스킬 요소 제거
   * -------------------------------------------------------------------------- */
  const QUOTE_SKILL_KEYWORDS = [
    '명언', '호령', '스킬', '책략', '도원결의', '패왕의 칙령', '적벽 화공',
    '방천화극', '팔진도', '공성계', '화계', '무르기 대체', '💬', '⚔️', '🛡️', '🔥'
  ];

  function isQuoteOrSkillNode(el) {
    if (!el || el.nodeType !== 1) return false;
    // 군주 초상화(아이콘) 자체는 절대 제거하지 않음
    if (el.tagName === 'IMG' || el.tagName === 'CANVAS') return false;
    if (el.querySelector && el.querySelector('img, canvas')) return false;

    const cls = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';
    const id = (el.id || '').toLowerCase();
    if (
      cls.includes('quote') || cls.includes('skill') || cls.includes('stratagem') ||
      cls.includes('speech') || cls.includes('desc') ||
      id.includes('quote') || id.includes('skill') || id.includes('leader_ui')
    ) {
      return true;
    }

    const txt = (el.textContent || '').trim();
    if (!txt) return false;

    // 따옴표로 둘러싸인 명언 문구 감지
    if (/^[“"'].+[”"']$/.test(txt) || txt.includes('“') || txt.includes('”')) {
      return true;
    }

    // 버튼이나 보조 라벨 중 명언·스킬 키워드 포함 여부 확인
    if (el.tagName === 'BUTTON' || el.children.length === 0) {
      return QUOTE_SKILL_KEYWORDS.some(kw => txt.includes(kw));
    }
    return false;
  }

  function cleanWarlordChatHeader() {
    // 1) 상단/별도 주입된 군주 스킬 바 제거
    const floatingLeaderUi = document.getElementById('jg_leader_ui');
    if (floatingLeaderUi) floatingLeaderUi.remove();

    // 2) 채팅창(#xlog) 바로 위 영역의 군주 아이콘 옆 명언·스킬 제거
    const xlog = document.getElementById('xlog');
    if (!xlog || !xlog.parentElement) return;

    const container = xlog.parentElement;
    Array.from(container.children).forEach(child => {
      if (child === xlog) return;
      // #xlog 위에 위치한 군주 정보 패널 탐색
      const hasPortrait = child.querySelector('img, canvas, [class*="portrait"], [class*="avatar"], [class*="icon"], [class*="warlord"], [class*="leader"]');
      if (!hasPortrait && !child.textContent) return;

      // 패널 내부의 버튼 및 텍스트 블록 중 명언/스킬 요소만 선별 제거
      const candidates = child.querySelectorAll('button, div, span, p, small');
      candidates.forEach(node => {
        if (isQuoteOrSkillNode(node)) {
          node.remove();
        }
      });
    });
  }

  // 초기 실행 및 턴 변경/동적 렌더링 시에도 명언·스킬이 다시 생기지 않도록 감시
  function initChatHeaderCleaner() {
    cleanWarlordChatHeader();
    const xlog = document.getElementById('xlog');
    const target = (xlog && xlog.parentElement) ? xlog.parentElement : document.body;
    const observer = new MutationObserver(() => cleanWarlordChatHeader());
    observer.observe(target, { childList: true, subtree: true });
  }

  /* --------------------------------------------------------------------------
   * 2. 파손 시에도 선명하게 보이는 장기판 격자선 색상 변경 (이중 고대비 스트로크)
   * -------------------------------------------------------------------------- */
  window.jgDrawCrispGridOverlay = function(g) {
    try {
      if (!g || typeof OX === 'undefined' || typeof OY === 'undefined' || typeof CX === 'undefined' || typeof CY === 'undefined') return;
      const cell = (typeof C !== 'undefined' && C > 0) ? C : Math.min(CX, CY);
      const bIdx = window.curBoardIdx || 0;

      // 어두운 파손 크레이터 위에서도 선명하게 드러나는 밝은 고시인성 선 색상
      const brightLineColors = [
        'rgba(255, 242, 185, 0.98)', // 0: 황토 사막 - 밝은 금빛 아이보리
        'rgba(215, 252, 255, 0.98)', // 1: 설원 얼음성 - 선명한 빙하 시안
        'rgba(210, 255, 214, 0.98)', // 2: 고대 숲 유적 - 밝은 에메랄드 민트
        'rgba(255, 214, 165, 0.98)', // 3: 암흑 성채 - 밝은 앰버 골드
        'rgba(255, 238, 170, 0.98)'  // 4: 삼국지 고성(기본) - 고대비 황금 아이보리
      ];

      // 밝은 배경에서도 선 윤곽을 잡아주는 짙은 외곽 테두리 색상
      const darkOutlineColors = [
        'rgba(38, 14, 4, 0.92)',
        'rgba(6, 26, 48, 0.92)',
        'rgba(8, 30, 12, 0.92)',
        'rgba(24, 4, 18, 0.94)',
        'rgba(36, 14, 4, 0.92)'
      ];

      const lineColor = brightLineColors[bIdx] || brightLineColors[4];
      const outlineColor = darkOutlineColors[bIdx] || darkOutlineColors[4];

      const traceGridPaths = () => {
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
      };

      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';

      // 1단계: 짙은 외곽 테두리 선 (밝은 판 위 시인성 확보)
      g.strokeStyle = outlineColor;
      g.lineWidth = Math.max(4.0, cell * 0.092);
      traceGridPaths();
      g.stroke();

      // 2단계: 밝은 황금·아이보리·시안 중심 선 (어두운 파손 부위 위 시인성 확보)
      g.shadowColor = lineColor;
      g.shadowBlur = Math.max(3, cell * 0.06);
      g.strokeStyle = lineColor;
      g.lineWidth = Math.max(2.1, cell * 0.048);
      traceGridPaths();
      g.stroke();

      // 3단계: 외곽 테두리 이중 보강
      g.shadowBlur = 0;
      g.strokeStyle = outlineColor;
      g.lineWidth = Math.max(4.4, cell * 0.10);
      g.strokeRect(OX, OY, 8 * CX, 9 * CY);

      g.strokeStyle = lineColor;
      g.lineWidth = Math.max(2.3, cell * 0.055);
      g.strokeRect(OX, OY, 8 * CX, 9 * CY);

      // 4단계: 16개 주요 화점(교차점) 마커
      const pts = [
        [0,3],[2,3],[4,3],[6,3],[8,3],
        [0,6],[2,6],[4,6],[6,6],[8,6],
        [1,2],[7,2],[1,7],[7,7],[4,1],[4,8]
      ];
      const rDot = Math.max(2.3, cell * 0.05);
      for (const [px0, py0] of pts) {
        const X = (typeof px === 'function') ? px(px0, py0)[0] : (OX + px0 * CX);
        const Y = (typeof px === 'function') ? px(px0, py0)[1] : (OY + py0 * CY);
        g.fillStyle = outlineColor;
        g.beginPath();
        g.arc(X, Y, rDot * 1.4, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = lineColor;
        g.beginPath();
        g.arc(X, Y, rDot, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    } catch (e) {}
  };

  /* --------------------------------------------------------------------------
   * 3. 장기판 파손 부위 크기 축소 (좌표는 유지하고 파손 반경만 약 26% 축소)
   * -------------------------------------------------------------------------- */
  function runWithReducedDamageRadius(g, fn, radiusScale, alpha) {
    if (typeof fn !== 'function') return;
    const origArc = g.arc;
    const origEllipse = g.ellipse;
    g.save();
    g.globalAlpha = alpha;
    g.arc = function(x, y, r, sAngle, eAngle, counterclockwise) {
      return origArc.call(this, x, y, r * radiusScale, sAngle, eAngle, counterclockwise);
    };
    if (typeof origEllipse === 'function') {
      g.ellipse = function(x, y, rx, ry, rot, sAngle, eAngle, counterclockwise) {
        return origEllipse.call(this, x, y, rx * radiusScale, ry * radiusScale, rot, sAngle, eAngle, counterclockwise);
      };
    }
    try {
      fn(g);
    } catch (e) {
    } finally {
      g.arc = origArc;
      if (typeof origEllipse === 'function') g.ellipse = origEllipse;
      g.restore();
    }
  }

  const prevDebris = window.jgDrawBoardDebris;
  window.jgDrawBoardDebris = function(g) {
    runWithReducedDamageRadius(g, prevDebris, 0.74, 0.56);
    window.jgDrawCrispGridOverlay(g);
    if (typeof window.jgDrawBoardSurfaceEnv === 'function') {
      window.jgDrawBoardSurfaceEnv(g);
    }
  };

  const prevDamage = window.jgDrawBoardDamage;
  window.jgDrawBoardDamage = function(g) {
    runWithReducedDamageRadius(g, prevDamage, 0.74, 0.66);
    window.jgDrawCrispGridOverlay(g);
  };

  // 화면 유리 균열 오버레이도 약간 더 은은하게 조정
  const prevScreenDmg = window.drawScreenDamage;
  if (typeof prevScreenDmg === 'function') {
    window.drawScreenDamage = function() {
      prevScreenDmg.apply(this, arguments);
      const scv = document.getElementById('scv');
      if (scv) {
        scv.style.opacity = '0.42';
        scv.style.mixBlendMode = 'screen';
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatHeaderCleaner);
  } else {
    initChatHeaderCleaner();
  }
})();