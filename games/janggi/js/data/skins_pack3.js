/* =========================================================
 * 기물 스킨 팩 3 — 격투가 / 해적단 / 기공 전사 (사용자 제공 시트를 가공)
 * ---------------------------------------------------------
 * 기물마다 프레임 수가 달라서 manifest 방식 사용:
 *   sprite.manifest['진영_기물'] = { file, anims:{행이름:{row,n}}, tokenFrames }
 *   시트 규격: 한 칸 200x150, 행 순서 transform/move/attack/hit/death/revert/(ranged)/(proj)
 *   ranged + proj 가 있으면 2칸 이상 떨어진 상대를 잡을 때 투사체(장풍 등)를 날립니다.
 * 시트가 없는 진영·기물 조합은 같은 팩의 다른 진영 시트를 빌려 씁니다.
 * codeToken: 장기알(대기) 상태는 코드로 그린 원목 알로 통일 → 같은 나라 알 색이 항상 같음
 * ※ 이 팩의 캐릭터는 기존 작품의 캐릭터라 개인 플레이용으로만 쓰세요.
 * ========================================================= */

MJ.SPRITE_FIGHTERS = { base: 'assets/images/pieces/fighters/', frameW: 200, frameH: 150, tokenDiam: 66, fps: 11, face: 1,
  manifest: {"cho_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":5}},"tokenFrames":{"transform":[0,1],"revert":[4]}},"cho_R":{"file":"cho_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_E":{"file":"cho_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":3},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_H":{"file":"han_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":2},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":3},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_C":{"file":"han_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_P":{"file":"han_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_H":{"file":"han_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":2},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":3},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_P":{"file":"han_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_C":{"file":"han_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":5}},"tokenFrames":{"transform":[0,1],"revert":[4]}},"han_R":{"file":"cho_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"han_E":{"file":"cho_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":4},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":3},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0,1],"revert":[3]}}} };

MJ.SPRITE_PIRATES = { base: 'assets/images/pieces/pirates/', frameW: 200, frameH: 150, tokenDiam: 66, fps: 11, face: 1,
  manifest: {"cho_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_R":{"file":"cho_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_C":{"file":"cho_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_E":{"file":"cho_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_P":{"file":"cho_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"cho_H":{"file":"cho_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":5},"hit":{"row":3,"n":2},"death":{"row":4,"n":3},"revert":{"row":5,"n":3}},"tokenFrames":{"transform":[0],"revert":[2]}},"cho_A":{"file":"cho_A","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":5},"hit":{"row":3,"n":4},"death":{"row":4,"n":3},"revert":{"row":5,"n":3}},"tokenFrames":{"transform":[0],"revert":[2]}},"han_R":{"file":"han_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":6},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1,2],"revert":[3]}},"han_A":{"file":"han_A","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":5},"hit":{"row":3,"n":4},"death":{"row":4,"n":3},"revert":{"row":5,"n":3}},"tokenFrames":{"transform":[0],"revert":[2]}},"han_H":{"file":"han_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":5},"hit":{"row":3,"n":4},"death":{"row":4,"n":3},"revert":{"row":5,"n":3}},"tokenFrames":{"transform":[0],"revert":[2]}},"han_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"han_C":{"file":"cho_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"han_E":{"file":"cho_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}},"han_P":{"file":"cho_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0,1],"revert":[3]}}} };

MJ.SPRITE_SAIYANS = { base: 'assets/images/pieces/saiyans/', frameW: 200, frameH: 150, tokenDiam: 66, fps: 11, face: 1,
  manifest: {"cho_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_P":{"file":"cho_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_H":{"file":"cho_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_A":{"file":"cho_A","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_R":{"file":"han_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_C":{"file":"han_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"cho_E":{"file":"han_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_E":{"file":"han_E","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_A":{"file":"han_A","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_H":{"file":"han_H","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_R":{"file":"han_R","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_C":{"file":"han_C","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4},"ranged":{"row":6,"n":2},"proj":{"row":7,"n":1}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_K":{"file":"cho_K","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}},"han_P":{"file":"cho_P","anims":{"transform":{"row":0,"n":4},"move":{"row":1,"n":5},"attack":{"row":2,"n":6},"hit":{"row":3,"n":5},"death":{"row":4,"n":4},"revert":{"row":5,"n":4}},"tokenFrames":{"transform":[0],"revert":[3]}}} };

MJ.register('skin', [
  {
    id: 'fighters', name: '격투가 군단', desc: '장기알이 격투가로 변신! 장풍·기공 원거리 공격', tags: ['애니메이션'],
    shape: 'octagon', face: ['#f6dfae', '#c8955a'], rim: '#6b4220', rimWidth: 0.08, inner: true,
    glyphSet: 'hanja', glyphColor: 'side', font: '"Noto Serif KR", serif', codeToken: true,
    sprite: MJ.SPRITE_FIGHTERS,
  },
  {
    id: 'pirates', name: '밀짚 해적단', desc: '해적들이 장기판 위에서 대모험!', tags: ['애니메이션'],
    shape: 'octagon', face: ['#f6dfae', '#c8955a'], rim: '#6b4220', rimWidth: 0.08, inner: true,
    glyphSet: 'hanja', glyphColor: 'side', font: '"Noto Serif KR", serif', codeToken: true,
    sprite: MJ.SPRITE_PIRATES,
  },
  {
    id: 'saiyans', name: '기공 전사단', desc: '기를 모아 변신! 에너지파 원거리 공격', tags: ['애니메이션'],
    shape: 'octagon', face: ['#f6dfae', '#c8955a'], rim: '#6b4220', rimWidth: 0.08, inner: true,
    glyphSet: 'hanja', glyphColor: 'side', font: '"Noto Serif KR", serif', codeToken: true,
    sprite: MJ.SPRITE_SAIYANS,
  },
]);

MJ.register('king', [
  {
    id: 'fighter-king', side: 'any', name: '격투왕', title: '격투가 군단의 왕', glyph: { cho: '楚', han: '漢' }, emoji: '🥋',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ffd36b' },
    sprite: MJ.SPRITE_FIGHTERS,
    quotes: {
      select: ['출격 준비 완료!', '가자!'], check: ['장군이다!', '도망칠 곳은 없다!'],
      capture: ['한 방에 끝!', '다음 상대 나와!'], checked: ['큭, 아직이다!', '방심했나…'],
      win: ['승리다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    portrait: 'assets/images/kings/fighter-king_portrait.png', voice: 'fighter-king',
  },
  {
    id: 'pirate-king', side: 'any', name: '해적왕', title: '밀짚 해적단 선장', glyph: { cho: '楚', han: '漢' }, emoji: '🏴‍☠️',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ffd36b' },
    sprite: MJ.SPRITE_PIRATES,
    quotes: {
      select: ['출격 준비 완료!', '가자!'], check: ['장군이다!', '도망칠 곳은 없다!'],
      capture: ['한 방에 끝!', '다음 상대 나와!'], checked: ['큭, 아직이다!', '방심했나…'],
      win: ['승리다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    portrait: 'assets/images/kings/pirate-king_portrait.png', voice: 'pirate-king',
  },
  {
    id: 'saiyan-king', side: 'any', name: '기공왕', title: '기공 전사단의 왕', glyph: { cho: '楚', han: '漢' }, emoji: '⚡',
    colors: { face: ['#f6dfae', '#c8955a'], rim: '#6b4220', glyph: '#3a2410', aura: '#ffd36b' },
    sprite: MJ.SPRITE_SAIYANS,
    quotes: {
      select: ['출격 준비 완료!', '가자!'], check: ['장군이다!', '도망칠 곳은 없다!'],
      capture: ['한 방에 끝!', '다음 상대 나와!'], checked: ['큭, 아직이다!', '방심했나…'],
      win: ['승리다!'], lose: ['다음엔 꼭 이긴다…'],
    },
    portrait: 'assets/images/kings/saiyan-king_portrait.png', voice: 'saiyan-king',
  },
]);
