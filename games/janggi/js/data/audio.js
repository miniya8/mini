/* =========================================================
 * 배경음(BGM) · 효과음(SFX) 데이터
 * ---------------------------------------------------------
 * [BGM] assets/audio/bgm/ 폴더에 mp3 를 넣으면 끝 — 코드 수정 없음.
 *   · 파일 이름은 bgm1.mp3, bgm2.mp3, bgm3.mp3 … (번호가 중간에 비어도 됨)
 *   · 폴더 목록을 보여주는 서버(로컬 서버 등)에서는 아무 이름이나 인식
 *   · 게임 중 매번 랜덤 셔플(한 바퀴 다 돌 때까지 중복 없음)
 *
 * [효과음] 파일이 없으면 자동으로 합성음(synth)으로 재생됩니다.
 *   찾는 순서:  {key}_{왕voice}  →  {key}_{진영}  →  {key}
 *   예) 항우로 장군을 부르면 'check_hangu' → 'check_cho' → 'check'
 *   그래서 'check_hangu' 하나만 등록하면 항우 전용 장군 음성이 됩니다.
 * ========================================================= */
MJ.AUDIO_CONFIG = {
  /* folder: BGM 폴더, prefix+번호.mp3 탐색(1~max), batch: 한 번에 확인할 개수, gap: 허용하는 빈 번호 */
  bgmAuto: { enabled: true, folder: 'assets/audio/bgm/', prefix: 'bgm', max: 200, batch: 20, gap: 6 },
};

/* 이름을 직접 붙여 등록하고 싶을 때만 사용 (보통은 필요 없음)
MJ.register('bgm', { id: 'battle', name: '결전', src: 'assets/audio/bgm/battle.mp3' });
*/

MJ.register('sfx', [
  { id: 'select',  src: 'assets/audio/sfx/select.mp3',  synth: { wave: 'triangle', freq: 880, dur: 0.06, vol: 0.25 } },
  { id: 'move',    src: 'assets/audio/sfx/move.mp3',    synth: { wave: 'wood', freq: 220, dur: 0.12, vol: 0.6 } },
  { id: 'capture', src: 'assets/audio/sfx/capture.mp3', synth: { wave: 'slash', freq: 600, dur: 0.25, vol: 0.5 } },
  { id: 'check',   src: 'assets/audio/sfx/check.mp3',   synth: { wave: 'gong', freq: 150, dur: 1.2, vol: 0.7 } },
  { id: 'invalid', src: 'assets/audio/sfx/invalid.mp3', synth: { wave: 'square', freq: 140, dur: 0.12, vol: 0.2 } },
  { id: 'win',     src: 'assets/audio/sfx/win.mp3',     synth: { wave: 'fanfare', freq: 523, dur: 1.4, vol: 0.5 } },
  { id: 'lose',    src: 'assets/audio/sfx/lose.mp3',    synth: { wave: 'sad', freq: 330, dur: 1.4, vol: 0.45 } },
  { id: 'button',  src: 'assets/audio/sfx/button.mp3',  synth: { wave: 'sine', freq: 660, dur: 0.05, vol: 0.2 } },
  { id: 'skill',   src: 'assets/audio/sfx/skill.mp3',   synth: { wave: 'fanfare', freq: 784, dur: 0.9, vol: 0.4 } },
  { id: 'pass',    src: 'assets/audio/sfx/pass.mp3',    synth: { wave: 'sine', freq: 392, dur: 0.18, vol: 0.3 } },
  /* 진영/왕 전용 예시 (파일 넣고 주석 해제)
  { id: 'move_han',     src: 'assets/audio/sfx/fire_move.wav' },
  { id: 'move_cho',     src: 'assets/audio/sfx/ice_move.wav' },
  { id: 'check_hangu',  src: 'assets/audio/voice/hangu_check.mp3' },
  */
]);
