/* =========================================================
 * 장기판(지형) 데이터
 * ---------------------------------------------------------
 *  texture  : 코드로 그리는 바닥 무늬
 *             'wood' | 'grass' | 'snow' | 'sand' | 'lava' | 'water'
 *             'night' | 'sakura' | 'ink' | 'stone'
 *             (새 무늬는 js/ui/terrain.js 의 MJ.Terrain.textures 에 함수 추가)
 *  colors   : bg [위,아래] 배경, plate 판 덮개색, line 선색, palace 궁성선색, mark 점 표시색
 *  deco     : 판 바깥 여백에 흩뿌릴 이모지 장식
 *  particles: { type:'snow'|'petal'|'ember'|'firefly'|'bubble'|'star'|'sand'|'leaf', count, color }
 *  image    : 배경 이미지 경로 (있으면 texture 대신 사용, 없으면 무시)
 *  bgm      : 이 판을 고르면 우선 재생할 BGM id (선택)
 * ========================================================= */
/* ---------------------------------------------------------
 * 이미지 장기판: image + grid(이미지 속 첫/마지막 줄의 픽셀 좌표)
 *  grid: { x0, y0, x1, y1 } = 왼쪽 세로줄 x, 위 가로줄 y, 오른쪽 세로줄 x, 아래 가로줄 y
 *  기물은 이 격자 교차점에 정확히 놓입니다. (같은 템플릿이면 값 재사용)
 * --------------------------------------------------------- */
MJ.BOARD_GRID_928 = { w: 928, h: 1152, x0: 125, y0: 148, x1: 803, y1: 1030 };

MJ.register('board', [
  {
    id: 'castle-yard', name: '석성 연병장', desc: '횃불과 북이 놓인 성벽 안 훈련장',
    image: 'assets/images/boards/castle-yard.webp', grid: MJ.BOARD_GRID_928, texture: 'stone',
    colors: { bg: ['#6b5a48', '#3d3128'], plate: 'rgba(0,0,0,0)', line: '#3a2a1a', palace: '#3a2a1a', mark: '#3a2a1a' },
    particles: { type: 'ember', count: 14, color: '#ffb25a' },
  },
  {
    id: 'desert-camp', name: '사막 야영지', desc: '천막과 토성 사이의 붉은 모래 전장',
    image: 'assets/images/boards/desert-camp.webp', grid: MJ.BOARD_GRID_928, texture: 'sand',
    colors: { bg: ['#c8714a', '#8a4a2c'], plate: 'rgba(0,0,0,0)', line: '#4a2a12', palace: '#4a2a12', mark: '#4a2a12' },
    particles: { type: 'sand', count: 30, color: '#ffd9a8' },
  },
  {
    id: 'dark-fortress', name: '흑성 요새', desc: '어둠 속 횃불만이 빛나는 요새',
    image: 'assets/images/boards/dark-fortress.webp', grid: MJ.BOARD_GRID_928, texture: 'stone',
    colors: { bg: ['#2a2a2e', '#111114'], plate: 'rgba(0,0,0,0)', line: '#c9b89a', palace: '#c9b89a', mark: '#c9b89a' },
    particles: { type: 'ember', count: 24, color: '#ff8a2a' },
  },
  {
    id: 'snow-fortress', name: '설원 성채', desc: '눈 덮인 침엽수와 얼음 성벽',
    image: 'assets/images/boards/snow-fortress.webp', grid: MJ.BOARD_GRID_928, texture: 'snow',
    colors: { bg: ['#eaf3fb', '#b9d3e8'], plate: 'rgba(0,0,0,0)', line: '#2b4660', palace: '#2b4660', mark: '#2b4660' },
    particles: { type: 'snow', count: 55, color: '#ffffff' },
  },
  {
    id: 'forest-camp', name: '숲속 진지', desc: '바위와 고목 사이 이끼 낀 전장',
    image: 'assets/images/boards/forest-camp.webp', grid: MJ.BOARD_GRID_928, texture: 'grass',
    colors: { bg: ['#5f7a3a', '#2f4220'], plate: 'rgba(0,0,0,0)', line: '#1d2d10', palace: '#1d2d10', mark: '#1d2d10' },
    particles: { type: 'leaf', count: 16, color: '#a6d36a' },
  },
  {
    id: 'wood', name: '기본 원목판', desc: '할아버지 댁 마루의 그 장기판',
    texture: 'wood',
    colors: { bg: ['#e7c48a', '#c99a5a'], plate: 'rgba(255,240,210,0.10)', line: '#3b2412', palace: '#3b2412', mark: '#3b2412' },
    deco: [], particles: { type: 'none' },
    image: 'assets/images/boards/wood.png',
  },
  {
    id: 'grass', name: '푸른 초원', desc: '바람이 부는 넓은 들판',
    texture: 'grass',
    colors: { bg: ['#7ccf6a', '#3f9a45'], plate: 'rgba(235,255,220,0.18)', line: '#1d3d14', palace: '#7a2b0f', mark: '#1d3d14' },
    deco: ['🌳', '🌼', '🌿', '🍀', '🌲'], particles: { type: 'leaf', count: 18, color: '#9be07c' },
    image: 'assets/images/boards/grass.png',
  },
  {
    id: 'snow', name: '설원 요새', desc: '눈이 소복이 쌓인 북방 진지',
    texture: 'snow',
    colors: { bg: ['#f4fbff', '#bcd8ec'], plate: 'rgba(255,255,255,0.25)', line: '#2b4660', palace: '#1c6fa8', mark: '#2b4660' },
    deco: ['⛄', '🌲', '❄️', '🏔️'], particles: { type: 'snow', count: 70, color: '#ffffff' },
    image: 'assets/images/boards/snow.png',
  },
  {
    id: 'desert', name: '황금 사막', desc: '모래바람 속 오아시스 결전',
    texture: 'sand',
    colors: { bg: ['#f6d98f', '#d6a353'], plate: 'rgba(255,245,210,0.15)', line: '#5c3a12', palace: '#8b2d0f', mark: '#5c3a12' },
    deco: ['🌵', '🐪', '🏜️', '🦂'], particles: { type: 'sand', count: 45, color: '#fff0c0' },
    image: 'assets/images/boards/desert.png',
  },
  {
    id: 'volcano', name: '화산 분화구', desc: '용암이 흐르는 위험한 전장',
    texture: 'lava',
    colors: { bg: ['#3a1510', '#120605'], plate: 'rgba(0,0,0,0.25)', line: '#ffb066', palace: '#ff5a1f', mark: '#ffb066' },
    deco: ['🌋', '🔥', '🪨'], particles: { type: 'ember', count: 55, color: '#ff8a2a' },
    image: 'assets/images/boards/volcano.png', bgm: null,
  },
  {
    id: 'ocean', name: '푸른 바다', desc: '물 위에 떠 있는 수상 장기판',
    texture: 'water',
    colors: { bg: ['#4fc3f7', '#0b5f9e'], plate: 'rgba(220,245,255,0.18)', line: '#06263f', palace: '#ffffff', mark: '#06263f' },
    deco: ['🐬', '🐚', '🐠', '⛵', '🐙'], particles: { type: 'bubble', count: 30, color: '#dff6ff' },
    image: 'assets/images/boards/ocean.png',
  },
  {
    id: 'night', name: '별빛 밤하늘', desc: '은하수 아래 고요한 한 판',
    texture: 'night',
    colors: { bg: ['#1b2350', '#05060f'], plate: 'rgba(120,140,255,0.08)', line: '#c9d3ff', palace: '#ffd86b', mark: '#c9d3ff' },
    deco: ['🌙', '⭐', '✨', '🪐'], particles: { type: 'star', count: 60, color: '#ffffff' },
    image: 'assets/images/boards/night.png',
  },
  {
    id: 'sakura', name: '벚꽃 정원', desc: '꽃잎이 흩날리는 봄날',
    texture: 'sakura',
    colors: { bg: ['#ffe3ec', '#f5b3c8'], plate: 'rgba(255,255,255,0.25)', line: '#6b2a43', palace: '#b8325f', mark: '#6b2a43' },
    deco: ['🌸', '🌷', '🦋', '🍡'], particles: { type: 'petal', count: 40, color: '#ffb7cd' },
    image: 'assets/images/boards/sakura.png',
  },
  {
    id: 'ink', name: '수묵 산수화', desc: '한 폭의 동양화 위에서',
    texture: 'ink',
    colors: { bg: ['#f7f2e6', '#e3d8bf'], plate: 'rgba(255,255,255,0.0)', line: '#1a1a1a', palace: '#b3261e', mark: '#1a1a1a' },
    deco: ['🏯', '🎋', '⛰️', '🪷'], particles: { type: 'none' },
    image: 'assets/images/boards/ink.png',
  },
  {
    id: 'castle', name: '고성 석판', desc: '오래된 성곽 바닥의 돌판',
    texture: 'stone',
    colors: { bg: ['#9a9a9e', '#5c5d63'], plate: 'rgba(255,255,255,0.06)', line: '#18191c', palace: '#e0c060', mark: '#18191c' },
    deco: ['🏰', '🛡️', '⚔️', '🕯️'], particles: { type: 'firefly', count: 16, color: '#ffe48a' },
    image: 'assets/images/boards/castle.png',
  },
]);
