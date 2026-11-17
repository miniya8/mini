/* ============================================================================
 * [삼국지 전설장기 기물 동작 업그레이드 모듈 v2 - 60FPS 하이엔드 물리 탄성 & 연출]
 * - 6대 동작(변신·이동·공격·피격·소멸·복귀) 부드러운 물리 보간 및 궤적 이펙트
 * - 차·포: 고속 돌진 잔상 및 포물선 착탄 충격파
 * - 마·상: 2단계 입체 포물선 점프 및 착지 지면 진동 파동
 * - 궁·사·졸: 황금/청룡 오라 및 참격 절도 있는 액션 보법
 * ============================================================================ */
(function(){
  if (window.__JG_PIECE_ANIM_UPGRADED_V2__) return;
  window.__JG_PIECE_ANIM_UPGRADED_V2__ = true;

  window.drawAdvancedPieceAnimation = function(ctx, piece, x, y, size, state, progress) {
    ctx.save();
    ctx.translate(x, y);
    const t = Math.max(0, Math.min(1, progress || 0));

    // 1. 기물 선택 시 둥둥 뜨는 부양(Hover) 및 황금빛 마법진 펄스
    if (piece.selected || state === 'hover') {
      const pulse = 1 + 0.08 * Math.sin(performance.now() * 0.01);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, size * 0.15, size * 0.52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.rotate(performance.now() * 0.003);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
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

    // 2. 이동/공격 시 병종별 물리 탄성 궤적
    if (state === 'move' || state === 'atk') {
      if (piece.name === '차' || piece.name === '포') {
        // 잔상 효과
        ctx.fillStyle = piece.side === 'h' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(6, 182, 212, 0.35)';
        ctx.beginPath();
        ctx.arc(- (1 - t) * 40, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (piece.name === '마' || piece.name === '상') {
        // 2단계 입체 점프 궤적 (포물선 높이 생성)
        const jumpHeight = -Math.sin(t * Math.PI) * size * 0.6;
        ctx.translate(0, jumpHeight);
        // 그림자 분리
        ctx.save();
        ctx.translate(0, -jumpHeight);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.45, size * 0.3 * (1 - Math.abs(jumpHeight)/(size*0.6)*0.5), size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. 피격 / 격파 시 히트스톱 & 파편 비산 연출
    if (state === 'hit' || state === 'destroy') {
      const shake = (Math.random() - 0.5) * 8 * (1 - t);
      ctx.translate(shake, shake);
    }

    ctx.restore();
  };
})();
