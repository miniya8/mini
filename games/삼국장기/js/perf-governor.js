/* ============================================================================
 * [성능 조절기]  js/perf-governor.js
 *  프레임 시간을 계속 재서 기기에 맞게 효과 품질(jgPerf.q)을 자동으로 조절합니다.
 *   q = 1.0 (60fps 근처: 전부 켬) → 0.75 → 0.55 → 0.35 (느린 기기: 입자 수 감소·블룸 끔·해상도 낮춤)
 *  각 효과 모듈은 jgPerf.q 를 읽어 입자 수 / 빛번짐 / 캔버스 해상도 / 프레임 건너뛰기를 줄입니다.
 *  수동: jgPerf.auto = false; jgPerf.q = 0.5
 * ============================================================================ */
(function jgPerfGovernor() {
  if (window.jgPerf) return;
  const P = window.jgPerf = { q: 1, fps: 60, auto: true, boost: 0 };
  let last = performance.now(), ema = 16.7, n = 0, lowCnt = 0, hiCnt = 0;
  function loop(now) {
    const dt = now - last; last = now;
    if (dt > 0 && dt < 250) ema = ema * .94 + dt * .06;
    if (++n % 20 === 0) {
      const fps = 1000 / ema; P.fps = fps;
      if (P.auto && !document.hidden) {
        const target = fps >= 54 ? 1 : fps >= 44 ? .8 : fps >= 34 ? .6 : fps >= 24 ? .45 : .32;
        if (target < P.q - .01) { lowCnt++; hiCnt = 0; if (lowCnt >= 1) { P.q = target; lowCnt = 0; } }          /* 느려지면 즉시 낮춤 */
        else if (target > P.q + .01) { hiCnt++; lowCnt = 0; if (hiCnt >= 4) { P.q = Math.min(target, P.q + .1); hiCnt = 0; } }  /* 회복은 천천히 */
        else { lowCnt = 0; hiCnt = 0; }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  P.n = k => Math.max(1, Math.round(k * P.q));            /* 개수 스케일 */
  P.dpr = (cap) => Math.min(window.devicePixelRatio || 1, cap) * (P.q >= .8 ? 1 : P.q >= .5 ? .85 : .7);   /* 캔버스 해상도 */
  P.bloomOK = () => P.q >= .6;
})();
