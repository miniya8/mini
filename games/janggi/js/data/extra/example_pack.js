/* =========================================================
 * 추가 콘텐츠 팩 예시
 * ---------------------------------------------------------
 * 이렇게 별도 파일로 만들어 index.html 의 "추가 콘텐츠" 구역에
 * <script> 한 줄만 넣으면 장기판·스킨·왕·음악이 늘어납니다.
 * 기존 파일은 전혀 건드리지 않아도 돼요.
 * ========================================================= */

/* 새 장기판 — 기존 무늬(texture)를 재활용하고 색만 바꿈 */
MJ.register('board', {
  id: 'autumn', name: '단풍 계곡', desc: '붉게 물든 가을 산',
  texture: 'grass',
  colors: { bg: ['#f2a65a', '#b5482a'], plate: 'rgba(255,240,220,0.15)', line: '#3a1608', palace: '#fff1c2', mark: '#3a1608' },
  deco: ['🍁', '🍂', '🌰', '🦊'], particles: { type: 'leaf', count: 26, color: '#ff8a3d' },
  image: 'assets/images/boards/autumn.png',
});

/* 새 기물 스킨 예시 (주석을 풀면 꾸미기에 추가됨)
MJ.register('skin', {
  id: 'sakura-pearl', name: '벚꽃 진주', desc: '분홍빛 진주로 만든 알',
  shape: 'circle', face: ['#ffffff', '#ffc9da'], rim: 'side', rimWidth: 0.08, inner: true,
  glyphSet: 'hanja', glyphColor: 'side', font: '"Noto Serif KR", serif',
  image: 'assets/images/pieces/sakura-pearl/{side}_{type}.png',
});
*/

/* 새 왕 예시 (주석을 풀면 꾸미기에 추가됨)
MJ.register('king', {
  id: 'seonbi', side: 'any', name: '김선비', title: '장기 고수 선비', glyph: '金', emoji: '🪭',
  colors: { face: ['#fffbe8', '#d9c48a'], rim: '#3d2f10', glyph: '#3d2f10', aura: '#fff2a8' },
  quotes: {
    select: ['허허, 어디 보자.', '장기는 마음으로 두는 것이네.'],
    check: ['장군이요! 에헴.', '여기서 멍군 못 하면 끝이라네.'],
    capture: ['이건 내가 가져가겠네.', '공짜는 사양하지 않지.'],
    checked: ['멍군이요!', '어허, 이런.'],
    win: ['한 수 배우고 가시게.'], lose: ['훈수꾼이 문제였어…'],
  },
  portrait: 'assets/images/kings/seonbi_portrait.png', piece: 'assets/images/kings/seonbi_piece.png', voice: 'seonbi',
});
*/
