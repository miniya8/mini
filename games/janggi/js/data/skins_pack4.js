/* =========================================================
 * 기물 스킨 팩 4 — 판타지 기사단 + 영웅 왕 7종 (사용자 제공 시트를 가공)
 *  - 판타지 기사단: 포(마법사)·상(엘프 궁수)·마(페가수스 기사)는 원거리 공격
 *  - 영웅 왕: 왕 꾸미기에서 선택 → 궁이 그 캐릭터로 변신
 * 시트 가공: tools/sheet_extract/fantasy_seg.py, kings_seg.py → build_fantasy.py, build_kings.py
 * ========================================================= */
MJ.SPRITE_FANTASY = { base: 'assets/images/pieces/fantasy/', frameW: 200, frameH: 150, tokenDiam: 66, fps: 11, face: 1,
  manifest: {"cho_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_R":{"file":"cho_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":2},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_R":{"file":"cho_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":2},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_C":{"file":"cho_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":3},"revert":{"row":5,"n":3},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[2]}},"han_C":{"file":"cho_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":3},"revert":{"row":5,"n":3},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[2]}},"cho_E":{"file":"cho_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":3},"revert":{"row":5,"n":3},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[2]}},"han_E":{"file":"cho_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":3},"revert":{"row":5,"n":3},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[2]}},"cho_H":{"file":"cho_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":4},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":3},"revert":{"row":5,"n":3},"ranged":{"row":6,"n":1},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[2]}},"han_H":{"file":"cho_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":4},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":3},"revert":{"row":5,"n":3},"ranged":{"row":6,"n":1},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[2]}},"cho_A":{"file":"cho_A","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_A":{"file":"cho_A","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_P":{"file":"cho_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"han_P":{"file":"cho_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}}} };

MJ.register('skin', [{
  id: 'fantasy', name: '판타지 기사단', desc: '왕·기사·마법사·엘프 궁수·페가수스 기사로 변신! 마법·화살·번개 원거리 공격', tags: ['판타지'],
  shape: 'octagon', face: ['#f6dfae', '#c8955a'], rim: '#6b4220', rimWidth: 0.08, inner: true,
  glyphSet: 'hanja', glyphColor: 'side', font: '"Noto Serif KR", serif', codeToken: true,
  sprite: MJ.SPRITE_FANTASY,
}]);

const HERO = (file, m) => ({ base: 'assets/images/pieces/kingpack/', frameW: 200, frameH: 150, tokenDiam: 66, fps: 11, face: 1, manifest: { cho_K: m, han_K: m } });
MJ.register('king', [
  {
    id: 'hero-goku', side: 'any', name: '오공', title: '초사이어인 전사', glyph: { cho: '楚', han: '漢' }, emoji: '🐉',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ffd23a' },
    sprite: HERO('goku', {"file":"goku","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["기를 모은다!", "간다!"], check: ['장군이다!', '에너지파 간다!'],
      capture: ["에너지파 간다!", "더 강한 놈 없어?"], checked: ["꽤 하는데!", "이제 시작이야!"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-goku',
  },
  {
    id: 'hero-luffy', side: 'any', name: '루피', title: '해적왕이 될 남자', glyph: { cho: '楚', han: '漢' }, emoji: '👒',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ff4a4a' },
    sprite: HERO('luffy', {"file":"luffy","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":5},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["출항이다!", "고무고무~!"], check: ['장군이다!', '고무고무 총!'],
      capture: ["고무고무 총!", "배고프다~"], checked: ["아프잖아!", "아직 안 졌어!"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-luffy',
  },
  {
    id: 'hero-ryu', side: 'any', name: '류', title: '방랑하는 격투가', glyph: { cho: '楚', han: '漢' }, emoji: '🥋',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#7ec8ff' },
    sprite: HERO('ryu', {"file":"ryu","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["진정한 승부를!", "간다!"], check: ['장군이다!', '파동권!'],
      capture: ["파동권!", "승룡권!"], checked: ["좋은 공격이다", "아직이다!"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-ryu',
  },
  {
    id: 'hero-saber', side: 'any', name: '세이버', title: '기사왕', glyph: { cho: '楚', han: '漢' }, emoji: '⚔️',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#7fb4ff' },
    sprite: HERO('saber', {"file":"saber","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["검을 들겠다", "나아가라!"], check: ['장군이다!', '승리의 검을!'],
      capture: ["승리의 검을!", "물러서라!"], checked: ["이 정도로는…", "기사의 긍지에 걸고!"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-saber',
  },
  {
    id: 'hero-naruto', side: 'any', name: '나루토', title: '불꽃의 닌자', glyph: { cho: '楚', han: '漢' }, emoji: '🍥',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ff9a2a' },
    sprite: HERO('naruto', {"file":"naruto","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["간다니깐!", "포기 안 해!"], check: ['장군이다!', '나선환!'],
      capture: ["나선환!", "분신술!"], checked: ["아직이다니깐!", "절대 안 져!"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-naruto',
  },
  {
    id: 'hero-mario', side: 'any', name: '마리오', title: '버섯 왕국의 영웅', glyph: { cho: '楚', han: '漢' }, emoji: '🍄',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ff3b3b' },
    sprite: HERO('mario', {"file":"mario","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["렛츠고!", "야호!"], check: ['장군이다!', '파이어볼!'],
      capture: ["파이어볼!", "점프!"], checked: ["으악!", "다시 간다!"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-mario',
  },
  {
    id: 'hero-sephiroth', side: 'any', name: '세피로스', title: '검은 날개의 검사', glyph: { cho: '楚', han: '漢' }, emoji: '🪽',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#b28cff' },
    sprite: HERO('sephiroth', {"file":"sephiroth","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}),
    quotes: {
      select: ["어둠이 깨어난다", "흥…"], check: ['장군이다!', '사라져라'],
      capture: ["사라져라", "추억 속에 잠들어라"], checked: ["재미있군", "소용없다"],
      win: ['내가 이겼다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    voice: 'hero-sephiroth',
  },
]);
