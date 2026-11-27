/* =========================================================
 * 미니의 커스텀 장기 - 전역 설정
 * 색상, 이름, 글자, 점수, 포진 등 게임 전반의 기본값.
 * 여기 값을 바꾸면 게임 전체에 반영됩니다.
 * ========================================================= */
window.MJ = window.MJ || {};

MJ.CONFIG = {
  title: '미니의 커스텀 장기',
  subtitle: 'MINI CUSTOM JANGGI',
  version: '1.4.0',

  /* 에셋 폴더 (이미지/소리 경로의 기준) */
  assetBase: 'assets/',

  /* 진영 색상 — 'side', 'sideDark', 'sideLight' 토큰이 이 값으로 바뀝니다 */
  sides: {
    cho: { name: '초나라', short: '楚', color: '#11a08c', dark: '#06574c', light: '#c4f3ea', aura: '#1cffc8' },
    han: { name: '한나라', short: '漢', color: '#d8343a', dark: '#7c1216', light: '#ffd4d0', aura: '#ff2d45' },
  },

  pieceTypes: ['K', 'R', 'C', 'H', 'E', 'A', 'P'],
  /* 꾸미기에서 스킨을 바꿀 수 있는 기물 (K=왕은 '왕' 탭에서 따로 고름) */
  skinnableTypes: ['R', 'C', 'H', 'E', 'A', 'P'],
  pieceNames: { K: '궁', R: '차', C: '포', H: '마', E: '상', A: '사', P: '졸' },
  pieceNamesBySide: { cho: { P: '졸' }, han: { P: '병' } },

  /* 점수(덤 포함 계가용) */
  pieceValues: { K: 0, R: 13, C: 7, H: 5, E: 3, A: 3, P: 2 },
  hanBonus: 1.5,

  /* 기물 크기 비율 (칸 크기 대비) */
  pieceScale: { K: 0.96, R: 0.84, C: 0.84, H: 0.84, E: 0.84, A: 0.70, P: 0.70 },

  /* 글자 세트 — 스킨의 glyphSet 으로 선택. 새 세트도 자유롭게 추가 */
  glyphSets: {
    hanja: {
      cho: { K: '楚', R: '車', C: '包', H: '馬', E: '象', A: '士', P: '卒' },
      han: { K: '漢', R: '車', C: '包', H: '馬', E: '象', A: '士', P: '兵' },
    },
    hangul: {
      cho: { K: '초', R: '차', C: '포', H: '마', E: '상', A: '사', P: '졸' },
      han: { K: '한', R: '차', C: '포', H: '마', E: '상', A: '사', P: '병' },
    },
    emoji: {
      cho: { K: '👑', R: '🛞', C: '💥', H: '🐎', E: '🐘', A: '🛡️', P: '⚔️' },
      han: { K: '👑', R: '🛞', C: '💥', H: '🐎', E: '🐘', A: '🛡️', P: '🗡️' },
    },
    animal: {
      cho: { K: '🐯', R: '🐻', C: '🦔', H: '🐴', E: '🐘', A: '🐼', P: '🐣' },
      han: { K: '🦁', R: '🐗', C: '🐡', H: '🦓', E: '🦛', A: '🐨', P: '🐥' },
    },
  },

  /* 포진(차림) — 자기 진영에서 바라본 왼쪽부터 2,3,7,8번째 줄 */
  formations: {
    '마상마상': ['H', 'E', 'H', 'E'],
    '상마상마': ['E', 'H', 'E', 'H'],
    '마상상마': ['H', 'E', 'E', 'H'],
    '상마마상': ['E', 'H', 'H', 'E'],
  },

  difficulties: {
    easy:   { name: '초보', depth: 1, timeMs: 300,  blunder: 0.40, jitter: 2.0 },
    normal: { name: '중수', depth: 3, timeMs: 900,  blunder: 0.10, jitter: 0.6 },
    hard:   { name: '고수', depth: 5, timeMs: 1800, blunder: 0.00, jitter: 0.0 },
  },

  /* 이 수(양쪽 합)를 넘으면 점수로 승패 판정 */
  moveLimit: 200,
  timeLimits: [0, 30, 60, 120],

  /* 스킬: 장착 4개, 전체 수가 milestones 에 도달할 때마다 1회 충전
   * mode 'charge' = 충전된 횟수만큼 장착 스킬 중 아무거나 / 'slot' = n번째 칸은 n번째 충전 수부터 */
  skills: { slots: 4, milestones: [30, 60, 90, 120], mode: 'charge',
            aiDefault: ['shield', 'freeze', 'revive', 'haste'], playerDefault: ['shield', 'freeze', 'revive', 'haste'] },

  /* 진영 구분 오라: ring(장기알 테두리 링) · ground(발밑 빛) · outline(변신 시 외곽 빛) */
  aura: { ring: true, ground: true, outline: true, strength: 1 },
};

/* 진영 색 토큰 해석: 'side' → 실제 색 */
MJ.resolveColor = function (c, side) {
  const s = MJ.CONFIG.sides[side] || MJ.CONFIG.sides.cho;
  if (c === 'side') return s.color;
  if (c === 'sideDark') return s.dark;
  if (c === 'sideLight') return s.light;
  return c;
};
MJ.pieceName = function (side, t) {
  const o = MJ.CONFIG.pieceNamesBySide[side];
  return (o && o[t]) || MJ.CONFIG.pieceNames[t];
};
MJ.other = s => (s === 'cho' ? 'han' : 'cho');
