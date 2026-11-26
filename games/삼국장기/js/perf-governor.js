/* ============================================================================
 * [성능 조절기]  js/perf-governor.js
 *  프레임 시간을 계속 재서 기기에 맞게 효과 품질(jgPerf.q)을 자동으로 조절합니다.
 *   q = 1.0 (60fps 근처: 전부 켬) → 0.75 → 0.55 → 0.35 (느린 기기: 입자 수 감소·블룸 끔·해상도 낮춤)
 *  각 효과 모듈은 jgPerf.q 를 읽어 입자 수 / 빛번짐 / 캔버스 해상도 / 프레임 건너뛰기를 줄입니다.
 *  수동: jgPerf.auto = false; jgPerf.q = 0.5
 * ============================================================================ */
(function jgPerfGovernor() {
  if (window.jgPerf) return;
  /* 휴대폰/저사양 감지: 시작 품질을 낮추고 상한(maxQ)을 둠 */
  const ua = navigator.userAgent || '', mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || ((navigator.maxTouchPoints || 0) > 1 && Math.min(screen.width, screen.height) < 900);
  const lowMem = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const P = window.jgPerf = { q: mobile ? (lowMem ? .5 : .7) : 1, maxQ: mobile ? .75 : 1, fps: 60, auto: true, boost: 0, mobile, lowMem: !!lowMem };
  let last = performance.now(), ema = 16.7, n = 0, lowCnt = 0, hiCnt = 0;
  function loop(now) {
    const dt = now - last; last = now;
    if (dt > 0 && dt < 250) ema = ema * .94 + dt * .06;
    if (++n % 20 === 0) {
      const fps = 1000 / ema; P.fps = fps;
      if (P.auto && !document.hidden) {
        const target = Math.min(P.maxQ, fps >= 54 ? 1 : fps >= 44 ? .8 : fps >= 34 ? .6 : fps >= 24 ? .45 : .32);
        if (target < P.q - .01) { lowCnt++; hiCnt = 0; if (lowCnt >= 1) { P.q = target; lowCnt = 0; } }          /* 느려지면 즉시 낮춤 */
        else if (target > P.q + .01) { hiCnt++; lowCnt = 0; if (hiCnt >= 4) { P.q = Math.min(target, P.q + .1); hiCnt = 0; } }  /* 회복은 천천히 */
        else { lowCnt = 0; hiCnt = 0; }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  /* 본판(#cv) 해상도: 데스크톱 최대 2배, 휴대폰 1.5배, 많이 느리면 1.25배 → 1.1배 (한 번 내려가면 그 판 동안 유지) */
  P._cvd = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
  P.cvDpr = () => { const base = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2); if (P.auto && P.q <= .45 && P._cvd > Math.min(base, 1.25)) P._cvd = Math.min(base, 1.25); if (P.auto && P.q <= .32 && P._cvd > Math.min(base, 1.1)) P._cvd = Math.min(base, 1.1); return Math.min(base, P._cvd); };
  P.n = k => Math.max(1, Math.round(k * P.q));            /* 개수 스케일 */
  P.dpr = (cap) => Math.min(window.devicePixelRatio || 1, cap) * (P.mobile ? .75 : 1) * (P.q >= .8 ? 1 : P.q >= .5 ? .85 : .7);   /* 캔버스 해상도 */
  /* 큰 컷신이 도는 동안 환경 레이어를 쉬게 해 합성 비용을 줄임 */
  P.cinema = 0; P.cinemaOn = () => { P.cinema++; }; P.cinemaOff = () => { P.cinema = Math.max(0, P.cinema - 1); };
  P.bloomOK = () => P.q >= .6 && !(P.mobile && P.lowMem);
})();
