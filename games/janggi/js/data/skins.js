/* =========================================================
 * 기물 스킨 데이터
 * ---------------------------------------------------------
 * 필드 설명
 *  id        : 고유 영문 id (저장 데이터에 쓰임 — 바꾸지 마세요)
 *  name/desc : 꾸미기 화면에 표시
 *  types     : 적용 가능한 기물. 생략하면 전체 ('R','C','H','E','A','P')
 *  shape     : 'octagon' | 'circle' | 'rounded' | 'hex' | 'square' | 'shield'
 *  ※ 기본 스킨은 '클래식 원목' 하나만 남기고 정리함. 새 스킨은 아래 형식으로 추가.
 *  face      : [위쪽색, 아래쪽색] 그라데이션. 'side'/'sideLight'/'sideDark' 토큰 가능
 *  rim       : 테두리 색,  rimWidth : 테두리 두께(반지름 비율)
 *  inner     : 안쪽 장식 링 표시 여부
 *  glyphSet  : config.js 의 glyphSets 이름 (hanja/hangul/emoji/animal ...)
 *  glyphs    : 특정 글자만 바꾸고 싶을 때 { cho:{R:'車'}, han:{...} }
 *  glyphColor: 글자 색 (토큰 가능), font : CSS 폰트
 *  glow      : 은은한 빛 색 (null 이면 없음)
 *  image     : 이미지 경로 패턴. {side} {type} {id} 가 치환됩니다.
 *              예) 'assets/images/pieces/{id}/{side}_{type}.png'
 *              파일이 없으면 자동으로 텍스트(코드 그림)로 표시됩니다.
 *  imageScale: 이미지 크기 배율 (기본 1.15)
 *  kingSprite: (스프라이트 스킨) 장기알 상태에서 궁도 같은 모양으로 보이게 할 궁 시트
 *
 * ※ 장기알 상태 색 통일: 한 진영의 기물은 서 있을 때(장기알) 모두 그 진영의
 *   '대표 스킨'(가장 많이 쓴 스킨, 같으면 차의 스킨) 모양으로 그려집니다.
 *   변신·이동·공격할 때만 기물마다 고른 스킨이 보여요.
 * ========================================================= */
/* ---------------------------------------------------------
 * 스프라이트(애니메이션) 스킨 공통 규격
 *  sprite.sheet : 시트 경로 패턴 ({side} {type} 치환)
 *  시트 = 6행 x 6열 그리드, 한 칸 frameW x frameH, 장기알 중심이 칸 정중앙
 *   0행 transform(장기알→변신) 1행 move(이동) 2행 attack(공격)
 *   3행 hit(피격) 4행 death(사망) 5행 revert(장기알로 복귀)
 *  tokenDiam : 시트 속 장기알 지름(px) → 판 위 크기 맞춤에 사용
 *  impact    : 공격 몇 번째 프레임에서 상대가 맞는지 (0부터)
 *  새 스프라이트 시트는 tools/sprite_process.py 로 같은 규격을 만들 수 있어요.
 * --------------------------------------------------------- */
MJ.SPRITE_STD = {
  frameW: 184, frameH: 120, tokenDiam: 86, fps: 12, impact: 3, face: 1,
  anims: {
    transform: { row: 0, n: 4 }, move: { row: 1, n: 5, loop: true }, attack: { row: 2, n: 6 },
    hit: { row: 3, n: 5 }, death: { row: 4, n: 4 }, revert: { row: 5, n: 4 },
  },
  idle: ['transform', 0],       // 판 위에 서 있을 때 = 장기알 모습
  thumb: ['transform', 3],      // 꾸미기 카드 썸네일 = 변신한 모습
};
MJ.spriteDef = (sheet, extra) => Object.assign({}, MJ.SPRITE_STD, { sheet }, extra || {});

/* 삼국 무장 시트 규격: 8열 x 6행, 한 칸 140px, 공격 방향 = 오른쪽 (face: 1, 왼쪽이면 -1) */
MJ.SPRITE_WARLORD = {
  frameW: 140, frameH: 140, tokenDiam: 110, fps: 12, impact: 4, face: 1,
  anims: {
    transform: { row: 0, n: 6 }, move: { row: 1, n: 8, loop: true }, attack: { row: 2, n: 8 },
    hit: { row: 3, n: 6 }, death: { row: 4, n: 8 }, revert: { row: 5, n: 6 },
  },
  idle: ['revert', 5], thumb: ['transform', 5],
  tokenFrames: { transform: [0, 1, 2], revert: [2, 3, 4, 5] },
};

MJ.register('skin', [
  {
    id: 'warlord', name: '삼국 무장', desc: '장기알이 한·초의 장수로 변신! (진영별 다른 장수)',
    shape: 'octagon', face: ['#e04848', '#8a1414'], rim: 'side', rimWidth: 0.08, inner: true,
    glyphSet: 'hangul', glyphColor: '#ffe7a8', font: '"Black Han Sans", sans-serif',
    sprite: Object.assign({}, MJ.SPRITE_WARLORD, { sheet: 'assets/images/pieces/warlord/{side}_{type}.webp' }),
    // 장기알 상태 통일용: 이 스킨이 진영의 대표 스킨일 때 궁 알도 같은 모양으로
    kingSprite: Object.assign({}, MJ.SPRITE_WARLORD, { sheet: 'assets/images/kings/warlord/{side}_K.webp' }),
    tags: ['애니메이션'],
  },
  {
    id: 'mecha', name: '메카닉 전투단', desc: '장기알이 전투 로봇으로 변신! (진영색)',
    shape: 'octagon', face: ['#cde9c8', '#3f7a3c'], rim: 'side', rimWidth: 0.08, inner: true,
    glyphSet: 'hanja', glyphColor: 'sideDark', font: '"Noto Serif KR", serif',
    sprite: MJ.spriteDef('assets/images/pieces/mecha/{side}_{type}.webp'),
    kingSprite: MJ.spriteDef('assets/images/kings/mecha/{side}_K.webp'),
    tags: ['애니메이션'],
  },
  {
    id: 'mecha-desert', name: '메카닉 (사막 원본색)', desc: '원본 사막 도장 · 진영은 테두리 빛으로 구분',
    shape: 'octagon', face: ['#f0d6a8', '#b98a52'], rim: 'side', rimWidth: 0.08, inner: true,
    glyphSet: 'hanja', glyphColor: '#4a2a10', font: '"Noto Serif KR", serif',
    sprite: MJ.spriteDef('assets/images/pieces/mecha-desert/{side}_{type}.webp', { sideGlow: true }),
    tags: ['애니메이션'],
  },
  {
    id: 'classic', name: '클래식 원목', desc: '전통 장기알의 따뜻한 나뭇결',
    shape: 'octagon', face: ['#f8e6bd', '#d6ae72'], rim: '#7a4e24', rimWidth: 0.07, inner: true,
    glyphSet: 'hanja', glyphColor: 'side', font: '"Noto Serif KR", "Nanum Myeongjo", serif',
    image: 'assets/images/pieces/classic/{side}_{type}.png',
  },
]);
