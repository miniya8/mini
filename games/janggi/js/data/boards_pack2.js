/* =========================================================
 * 장기판 팩 2 — 정사각 이미지 장기판 12종
 * grid.xs = 세로줄 9개의 x 좌표, grid.ys = 가로줄 10개의 y 좌표 (이미지 픽셀)
 * 그림마다 격자 간격이 조금씩 달라서 줄마다 위치를 따로 적어 둠
 * ========================================================= */
MJ.register('board', [
  {
    id: 'dragon-wood', name: '용문 원목판', desc: '황동 장식과 용 문양이 새겨진 원목판',
    image: 'assets/images/boards/dragon-wood.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [81, 127, 172, 217, 264, 311, 355, 398, 440], ys: [50, 95, 140, 186, 231, 276, 321, 366, 412, 457] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'none', count: 0, color: '#f3e0b0' },
  },
  {
    id: 'sakura-valley', name: '벚꽃 계곡', desc: '폭포와 누각이 보이는 봄 계곡',
    image: 'assets/images/boards/sakura-valley.webp', fitMargin: 0.75,
    grid: { w: 506, h: 509, xs: [64, 111, 157, 204, 253, 302, 349, 395, 441], ys: [50, 95, 141, 187, 232, 277, 322, 369, 415, 461] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'petal', count: 30, color: '#ffc2d6' },
  },
  {
    id: 'cyber-holo', name: '사이버 홀로그램', desc: '푸른 빛 격자의 미래 전술판',
    image: 'assets/images/boards/cyber-holo.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [56, 103, 154, 204, 255, 304, 353, 401, 447], ys: [55, 96, 139, 183, 228, 272, 316, 360, 407, 455] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'star', count: 30, color: '#7fe7ff' },
  },
  {
    id: 'stone-dragon', name: '석조 쌍룡판', desc: '두 마리 용이 지키는 돌판',
    image: 'assets/images/boards/stone-dragon.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [89, 133, 176, 219, 263, 308, 349, 392, 432], ys: [53, 96, 138, 183, 226, 268, 311, 354, 397, 441] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'none', count: 0, color: '#ffffff' },
  },
  {
    id: 'spring-garden', name: '봄 정원', desc: '정자와 연못이 있는 꽃 정원',
    image: 'assets/images/boards/spring-garden.webp', fitMargin: 0.75,
    grid: { w: 506, h: 509, xs: [70, 117, 161, 207, 253, 300, 345, 390, 436], ys: [52, 95, 138, 181, 224, 267, 309, 352, 396, 441] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'petal', count: 26, color: '#ffb7cd' },
  },
  {
    id: 'steampunk', name: '스팀펑크 공방', desc: '톱니바퀴와 증기 장치의 금속판',
    image: 'assets/images/boards/steampunk.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [79, 125, 169, 214, 259, 305, 351, 396, 441], ys: [51, 94, 137, 181, 225, 269, 312, 355, 398, 441] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'ember', count: 18, color: '#ffb347' },
  },
  {
    id: 'heaven-palace', name: '천상궁', desc: '구름 위 황금 용의 궁전',
    image: 'assets/images/boards/heaven-palace.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [65, 115, 163, 213, 262, 311, 360, 407, 455], ys: [59, 104, 148, 194, 239, 282, 326, 368, 414, 459] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'star', count: 40, color: '#fff3b0' },
  },
  {
    id: 'moon-sakura', name: '달밤 벚꽃', desc: '보름달 아래 등불과 벚꽃',
    image: 'assets/images/boards/moon-sakura.webp', fitMargin: 0.75,
    grid: { w: 506, h: 509, xs: [58, 106, 154, 203, 253, 302, 351, 400, 447], ys: [58, 104, 148, 194, 238, 281, 325, 367, 412, 454] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'petal', count: 36, color: '#ffb7e0' },
  },
  {
    id: 'neon-dragon', name: '네온 용봉', desc: '네온 용과 봉황의 도시',
    image: 'assets/images/boards/neon-dragon.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [50, 101, 151, 202, 254, 305, 355, 405, 456], ys: [58, 103, 148, 194, 238, 281, 325, 367, 410, 455] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'star', count: 40, color: '#c9a6ff' },
  },
  {
    id: 'fire-dragon', name: '화룡 성채', desc: '불타는 성과 황금 화룡',
    image: 'assets/images/boards/fire-dragon.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [65, 114, 162, 212, 261, 310, 359, 408, 457], ys: [45, 89, 134, 180, 227, 274, 321, 369, 415, 462] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'ember', count: 50, color: '#ff8a2a' },
  },
  {
    id: 'ocean-palace', name: '해저 궁전', desc: '돌고래와 산호의 바닷속',
    image: 'assets/images/boards/ocean-palace.webp', fitMargin: 0.75,
    grid: { w: 506, h: 509, xs: [58, 106, 154, 203, 253, 302, 351, 400, 449], ys: [46, 90, 134, 180, 227, 274, 321, 368, 415, 461] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'bubble', count: 30, color: '#dff6ff' },
  },
  {
    id: 'fairy-forest', name: '요정의 숲', desc: '폭포와 성이 보이는 마법의 숲',
    image: 'assets/images/boards/fairy-forest.webp', fitMargin: 0.75,
    grid: { w: 509, h: 509, xs: [51, 101, 152, 203, 254, 304, 355, 405, 455], ys: [46, 90, 135, 181, 227, 274, 321, 369, 415, 462] },
    colors: { bg: ['#1b1626', '#0d0a14'], plate: 'rgba(0,0,0,0)', line: '#000', palace: '#000', mark: '#000' },
    particles: { type: 'firefly', count: 22, color: '#ffe48a' },
  },
]);
