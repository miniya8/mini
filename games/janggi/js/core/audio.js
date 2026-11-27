/* =========================================================
 * 오디오 매니저 — BGM 재생목록 + 효과음 (파일 없으면 합성음)
 * ========================================================= */
MJ.Audio = (function () {
  let ctx = null, master = null, unlocked = false;
  const sfxCache = new Map(); // id -> {state, el}
  let bgmEl = null, current = null, queue = [];

  const S = () => MJ.Store.get().settings;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    }
    return ctx;
  }

  /* 첫 터치 때 오디오 잠금 해제 (모바일 자동재생 정책) */
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    const c = ac(); if (c && c.state === 'suspended') c.resume();
    if (S().bgmOn) playBgm();
  }

  /* ---------------- 효과음 ---------------- */
  function probeSfx(def) {
    let e = sfxCache.get(def.id);
    if (e) return e;
    e = { state: def.src ? 'loading' : 'missing', el: null };
    sfxCache.set(def.id, e);
    if (def.src) {
      const el = new Audio();
      el.preload = 'auto';
      el.oncanplaythrough = () => { e.state = 'ok'; };
      el.onerror = () => { e.state = 'missing'; };
      el.src = def.src;
      e.el = el;
    }
    return e;
  }

  /* key 와 문맥(진영, 왕 voice)으로 가장 구체적인 효과음 선택 */
  function resolve(key, side, voice) {
    const ids = [];
    if (voice) ids.push(key + '_' + voice);
    if (side) ids.push(key + '_' + side);
    ids.push(key);
    for (const id of ids) {
      const d = MJ.Registry.get('sfx', id);
      if (!d) continue;
      const e = probeSfx(d);
      if (e.state === 'ok') return { file: e.el, def: d };
      if (id === key || d.synth) return { def: d, synthOnly: e.state !== 'ok' };
    }
    return null;
  }

  function sfx(key, side, voice) {
    if (!S().sfxOn) return;
    const r = resolve(key, side, voice);
    if (!r) return;
    if (r.file) {
      const n = r.file.cloneNode();
      n.volume = S().sfxVol;
      n.play().catch(() => {});
    } else if (r.def.synth) synth(r.def.synth);
  }

  function synth(o) {
    const c = ac(); if (!c || !unlocked) return;
    const t = c.currentTime, vol = (o.vol || 0.4) * S().sfxVol;
    const g = c.createGain(); g.connect(master);
    const osc = (type, f, start, dur, v) => {
      const os = c.createOscillator(), gg = c.createGain();
      os.type = type; os.frequency.setValueAtTime(f, t + start);
      gg.gain.setValueAtTime(0.0001, t + start);
      gg.gain.exponentialRampToValueAtTime(v, t + start + 0.01);
      gg.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      os.connect(gg); gg.connect(g); os.start(t + start); os.stop(t + start + dur + 0.05);
      return os;
    };
    g.gain.value = 1;
    switch (o.wave) {
      case 'wood': { // 딱! 나무 부딪히는 소리
        const n = noise(c, 0.08); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 3;
        const gg = c.createGain(); gg.gain.setValueAtTime(vol, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        n.connect(bp); bp.connect(gg); gg.connect(g); n.start(t);
        osc('triangle', o.freq, 0, 0.1, vol * 0.6);
        break;
      }
      case 'slash': {
        const n = noise(c, o.dur); const hp = c.createBiquadFilter(); hp.type = 'highpass';
        hp.frequency.setValueAtTime(800, t); hp.frequency.exponentialRampToValueAtTime(6000, t + o.dur);
        const gg = c.createGain(); gg.gain.setValueAtTime(vol, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
        n.connect(hp); hp.connect(gg); gg.connect(g); n.start(t);
        osc('sawtooth', 180, 0.02, 0.15, vol * 0.4);
        break;
      }
      case 'gong':
        osc('sine', o.freq, 0, o.dur, vol); osc('sine', o.freq * 2.01, 0, o.dur * 0.7, vol * 0.4);
        osc('triangle', o.freq * 3.2, 0, o.dur * 0.4, vol * 0.2); break;
      case 'fanfare':
        [0, 4, 7, 12].forEach((s, k) => osc('triangle', o.freq * Math.pow(2, s / 12), k * 0.13, 0.5, vol)); break;
      case 'sad':
        [0, -2, -4, -7].forEach((s, k) => osc('sine', o.freq * Math.pow(2, s / 12), k * 0.25, 0.6, vol)); break;
      default:
        osc(o.wave || 'sine', o.freq || 440, 0, o.dur || 0.1, vol);
    }
  }
  function noise(c, dur) {
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf; return s;
  }

  /* ---------------- BGM ----------------
   * assets/audio/bgm/ 폴더의 mp3 를 자동으로 찾아 매번 랜덤 셔플 재생
   *  1) 폴더 목록을 읽을 수 있는 서버면 → 파일 이름 상관없이 전부 인식
   *  2) 아니면 bgm1.mp3, bgm2.mp3 … 번호 파일을 찾음 (중간 번호가 비어도 OK)
   * ------------------------------------ */
  let scanDone = false, lastId = null;
  const scanWaiters = [];
  function addTrack(src, name) {
    const id = 'bgm:' + src;
    if (!MJ.Registry.get('bgm', id)) MJ.register('bgm', { id, name, src, auto: true });
  }
  function probe(src) {
    return new Promise(res => {
      const el = new Audio(); let done = false;
      const fin = ok => { if (done) return; done = true; el.src = ''; res(ok); };
      el.preload = 'metadata';
      el.onloadedmetadata = () => fin(true); el.onerror = () => fin(false);
      setTimeout(() => fin(false), 4000);
      el.src = src;
    });
  }
  async function scanListing(A) {
    try {
      const r = await fetch(A.folder, { cache: 'no-store' });
      if (!r.ok) return 0;
      const html = await r.text();
      const re = /href="([^"?#]+\.(?:mp3|m4a|ogg|wav))"/gi;
      let m, n = 0;
      while ((m = re.exec(html))) {
        const file = decodeURIComponent(m[1].split('/').pop());
        addTrack(A.folder + encodeURIComponent(file), file.replace(/\.[^.]+$/, ''));
        n++;
      }
      return n;
    } catch (e) { return 0; }
  }
  async function scanNumbered(A) {
    let found = 0, start = 1;
    while (start <= A.max) {
      const nums = [];
      for (let i = start; i < start + A.batch && i <= A.max; i++) nums.push(i);
      const res = await Promise.all(nums.map(n => probe(A.folder + A.prefix + n + '.mp3').then(ok => ok && n)));
      const hits = res.filter(Boolean);
      hits.forEach(n => addTrack(A.folder + A.prefix + n + '.mp3', A.prefix + n));
      found += hits.length;
      if (!hits.length || Math.max(...hits) < start + A.batch - A.gap) break; // 뒤쪽 번호가 비면 종료
      start += A.batch;
    }
    return found;
  }
  async function autoScan(done) {
    const A = MJ.AUDIO_CONFIG.bgmAuto;
    if (A.enabled) {
      const n = await scanListing(A);
      if (!n) await scanNumbered(A);
    }
    scanDone = true;
    buildQueue();
    scanWaiters.splice(0).forEach(fn => fn());
    done && done();
    MJ.emit && MJ.emit('bgm-list', tracks());
  }

  function tracks() { return MJ.Registry.list('bgm').filter(t => t.src); }

  /* 셔플 가방: 모든 곡이 한 번씩 나온 뒤 다시 섞음, 같은 곡 연속 금지 */
  function buildQueue() {
    queue = tracks().map(t => t.id);
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; }
    if (queue.length > 1 && queue[0] === lastId) queue.push(queue.shift());
  }

  function stopBgm() {
    if (bgmEl) { bgmEl.pause(); bgmEl.onended = null; bgmEl.onerror = null; bgmEl = null; }
    current = null;
  }

  function playBgm(id) {
    if (!unlocked) return;
    if (!scanDone) { scanWaiters.push(() => playBgm(id)); return; }
    stopBgm();
    if (!S().bgmOn) return;
    if (!id) { if (!queue.length) buildQueue(); id = queue.shift(); }
    const t = MJ.Registry.get('bgm', id);
    if (!t) return;
    current = t; lastId = id;
    bgmEl = new Audio(t.src);
    bgmEl.volume = S().bgmVol;
    bgmEl.onended = () => playBgm();
    bgmEl.onerror = () => { MJ.Registry.add('bgm', Object.assign({}, t, { hidden: true })); setTimeout(() => playBgm(), 50); };
    bgmEl.play().catch(() => {});
    MJ.emit && MJ.emit('bgm', t);
  }
  function pauseBgm() { if (bgmEl) bgmEl.pause(); }
  function resumeBgm() { if (bgmEl && S().bgmOn) bgmEl.play().catch(() => {}); else if (S().bgmOn) playBgm(); }

  function next() { playBgm(); }

  function setVolume(kind, v) {
    S()[kind] = v;
    if (kind === 'bgmVol' && bgmEl) bgmEl.volume = v;
    MJ.Store.save();
  }

  return { unlock, sfx, playBgm, stopBgm, pauseBgm, resumeBgm, next, setVolume, autoScan, tracks,
           current: () => current, isUnlocked: () => unlocked, rebuild: buildQueue };
})();
