/* =========================================================
 * 왕(궁) 인물 데이터
 * ---------------------------------------------------------
 *  side     : 'han' | 'cho' | 'any' (추천 진영 — 실제로는 아무 진영에나 사용 가능)
 *  glyph    : 장기알에 새길 글자
 *  emoji    : 초상 카드에 쓰는 상징 (이미지가 없을 때)
 *  colors   : face [위,아래], rim, glyph, aura(오라 빛)
 *  shape    : 장기알 모양 (생략 시 octagon)
 *  quotes   : 상황별 대사 — select(선택), check(장군), capture(큰 기물 잡음),
 *             checked(장군 당함), win, lose
 *  portrait : 초상 이미지 경로 (없으면 텍스트 초상)
 *  piece    : 장기판 위 왕 알 이미지 경로 (없으면 코드 그림)
 *  voice    : 효과음 접미사. 예) 'hangu' → sfx 'check_hangu' 가 있으면 그 소리 사용
 * ========================================================= */
MJ.register('king', [
  /* ---------- 삼국 무장 (애니메이션 왕, 진영별 외형) ---------- */
  {
    id: 'warlord-king', side: 'any', name: '무장 군주', title: '한왕 · 초왕 (진영별 외형)',
    glyph: { cho: '초', han: '한' }, emoji: '👑',
    colors: { face: ['#ffe2a0', '#b02020'], rim: '#ffd36b', glyph: '#ffe7a8', aura: '#ffd36b' },
    sprite: Object.assign({}, MJ.SPRITE_WARLORD, { sheet: 'assets/images/kings/warlord/{side}_K.webp' }),
    quotes: {
      select: ['짐이 직접 나선다.', '전군, 나를 따르라!'],
      check: ['장군이다! 목을 내놓아라!', '천하의 주인은 하나뿐!'],
      capture: ['감히 짐의 앞을 막다니.', '베어라!'],
      checked: ['호위병은 어디 있느냐!', '물러서지 마라!'],
      win: ['천하는 짐의 것이다!'], lose: ['패배라니… 믿을 수 없다.'],
    },
    portrait: 'assets/images/kings/warlord/{side}_portrait.png', voice: 'warlord',
  },
  /* ---------- 메카닉 (애니메이션 왕) ---------- */
  {
    id: 'mecha-commander', side: 'any', name: '메카 사령관', title: '강철 군단 총사령관',
    glyph: { cho: '楚', han: '漢' }, emoji: '🤖',
    colors: { face: ['#d6f0d0', '#3c7a3a'], rim: '#c9a24a', glyph: '#1d3a1b', aura: '#7dffb0' },
    sprite: MJ.spriteDef('assets/images/kings/mecha/{side}_K.webp'),
    quotes: {
      select: ['사령관 기동.', '전 부대, 대기하라.'],
      check: ['목표 포착. 장군!', '전 화력 집중! 장군이다!'],
      capture: ['적 유닛 파괴 확인.', '격파 완료.'],
      checked: ['경고! 본진이 공격받고 있다!', '방어 프로토콜 가동!'],
      win: ['작전 성공. 전장을 장악했다.'], lose: ['시스템… 다운…'],
    },
    portrait: 'assets/images/kings/mecha/{side}_portrait.png', voice: 'mecha',
  },
  /* ---------- 기본 왕 (1개만 유지) ---------- */
  {
    id: 'mini', side: 'any', name: '미니', title: '미니 대왕', glyph: '미', emoji: '🐰', shape: 'circle',
    colors: { face: ['#ffffff', '#ffd6ec'], rim: '#ff5aa5', glyph: '#ff3d97', aura: '#ff9ccd' },
    quotes: {
      select: ['미니가 간다!', '어디로 갈까~?'],
      check: ['장군이야! 깜짝 놀랐지?', '미니 등장! 장군~!'],
      capture: ['냠! 맛있다!', '데려간다~'],
      checked: ['으앗! 반칙이야!', '히잉…'],
      win: ['미니 최고! 우승!'], lose: ['한 판만 더 해줘~'],
    },
    portrait: 'assets/images/kings/mini_portrait.png', piece: 'assets/images/kings/mini_piece.png', voice: 'mini',
  },
]);
