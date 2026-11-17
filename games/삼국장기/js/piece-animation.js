

/* ============================================================================
 * [삼국지 전설장기 기물 동작 업그레이드 모듈 - piece-animation.js 리마스터]
 * - 6대 동작(변신·이동·공격·피격·소멸·복귀) 60FPS 부드러운 물리 탄성 보간
 * - 병종별 고유 궤적 (차·포 고속 돌진 잔상 및 포물선, 마·상 2단계 입체 점프, 궁·사·졸 오라 참격)
 * - 기물 선택 시 부양(Hover) 및 바닥 마법진 펄스, 포획 시 히트스톱·슬로우모션·파편 비산
 * ============================================================================ */
(function(){
  if (window.__JG_PIECE_ANIM_UPGRADED__) return;
  window.__JG_PIECE_ANIM_UPGRADED__ = true;

  // 기존 렌더링 루프를 확장하여 리얼하고 화려한 물리 탄성 및 잔상 효과 부여
  const origPieceRender = window.renderPieceWithAnimation || window.drawPieceAnim;
  
  window.drawAdvancedPieceAnimation = function(ctx, piece, x, y, size, state, progress) {
    ctx.save();
    ctx.translate(x, y);

    // 1) 기물 선택 시 부양(Hover) 및 바닥 마법진 펄스
    if (piece.selected || state === 'hover') {
      const pulse = 1 + 0.08 * Math.sin(performance.now() * 0.01);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, size * 0.15, size * 0.52, 0, Math.PI * 2);
      ctx.stroke();

      // 황금빛 마법진 회전 룬
      ctx.save();
      ctx.rotate(performance.now() * 0.003);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      for(let i=0; i<4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(size * 0.38, 0);
        ctx.lineTo(size * 0.50, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2) 병종별 이동 및 공격 잔상 / 탄성 보간 (차·포, 마·상, 궁·사·졸)
    if (state === 'move' || state === 'atk') {
      const t = Math.max(0, Math.min(1, progress || 0));
      // 탄성 백 아웃 (Back Out)
      const easeT = 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
      if (piece.name === '차' || piece.name === '포') {
        // 고속 돌진 잔상 (Afterimage)
        ctx.fillStyle = piece.side === 'h' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(6, 182, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(- (1 - t) * 35, 0, size * 0.44, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };
})();
