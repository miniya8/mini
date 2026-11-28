# 미니의 커스텀 장기 — 확장 가이드

이미지 없이도 모든 기물·장기판·왕이 **코드 그림(텍스트)** 으로 표시됩니다.
나중에 정해진 경로에 이미지/소리 파일만 넣으면 **코드 수정 없이 자동 교체**됩니다.

---

## 1. 폴더 구조

```
mini-janggi/
├─ index.html              ← 화면 뼈대 + 스크립트 목록 (추가 콘텐츠 구역)
├─ css/style.css           ← :root 색 변수만 바꿔도 테마 변경
├─ js/
│  ├─ config.js            ← 진영 색·글자 세트·점수·포진·AI 난이도
│  ├─ data/                ← ★ 콘텐츠 데이터 (여기만 고치면 됨)
│  │  ├─ boards.js         장기판(지형)
│  │  ├─ skins.js          기물 스킨
│  │  ├─ kings.js          왕 인물
│  │  ├─ audio.js          BGM·효과음
│  │  └─ extra/            추가 팩 (example_pack.js 참고)
│  ├─ core/                규칙·AI·저장·에셋·오디오 엔진
│  ├─ ui/                  렌더러·지형무늬·장기알그림·이펙트·화면
│  ├─ game.js              대국 진행
│  └─ main.js              부팅·버튼 연결
└─ assets/
   ├─ images/
   │  ├─ boards/           {보드id}.png        예) snow.png
   │  ├─ pieces/{스킨id}/  {side}_{type}.png   예) classic/cho_R.png
   │  ├─ pieces/mecha/     메카닉 스킨 애니메이션 시트 {side}_{type}.webp
   │  ├─ kings/            {왕id}_portrait.png, {왕id}_piece.png  (kings/mecha/ = 메카 사령관 시트)
   │  └─ ui/               title_bg · main_bg · logo  (화면 이미지 슬롯)
   └─ audio/
      ├─ bgm/              ★ mp3 넣는 곳: bgm1.mp3, bgm2.mp3 … → 자동 인식 + 랜덤 셔플
      ├─ sfx/              select, move, capture, check, invalid, win, lose, button, pass (.mp3)
      └─ voice/            왕 전용 음성 (audio.js 에 등록)
```

- `side` = `cho`(초) / `han`(한)
- `type` = `K`궁 `R`차 `C`포 `H`마 `E`상 `A`사 `P`졸·병
- 이미지는 **정사각형 투명 PNG** 권장 (256×256 이상). 꾸미기 화면 하단에 각 항목의 예상 경로와 적용 여부(✅/⬜)가 표시됩니다.

---

## 2. 이미지 넣기 (가장 쉬운 방법)

| 바꾸고 싶은 것 | 파일 위치 |
|---|---|
| 설원 장기판 배경 | `assets/images/boards/snow.png` |
| 클래식 스킨 초나라 차 | `assets/images/pieces/classic/cho_R.png` |
| 항우 초상 카드 | `assets/images/kings/hangu_portrait.png` |
| 항우 장기알 | `assets/images/kings/hangu_piece.png` |

파일이 있으면 이미지, 없으면 코드 그림. 일부만 넣어도 됩니다.

---

## 3. 새 콘텐츠 추가

`js/data/extra/` 에 새 파일을 만들고 `index.html` 의 **추가 콘텐츠** 구역에 한 줄 추가:

```html
<script src="js/data/extra/my_pack.js"></script>
```

### 장기판
```js
MJ.register('board', {
  id: 'cave', name: '수정 동굴', desc: '반짝이는 지하 전장',
  texture: 'night',                       // wood grass snow sand lava water night sakura ink stone
  colors: { bg: ['#2a1b4a', '#0a0612'], plate: 'rgba(180,140,255,0.08)', line: '#e5d8ff', palace: '#ff9cf0', mark: '#e5d8ff' },
  deco: ['💎', '🔮'], particles: { type: 'firefly', count: 20, color: '#d9b3ff' },
  image: 'assets/images/boards/cave.png', bgm: null,
});
```

### 기물 스킨
```js
MJ.register('skin', {
  id: 'ruby', name: '루비', desc: '붉은 보석',
  types: ['R','C'],                       // 생략하면 모든 기물에 사용 가능
  shape: 'hex',                           // octagon circle rounded hex square shield
  face: ['#ffd0d8', '#b0102a'], rim: 'side', rimWidth: 0.08, inner: true,
  glyphSet: 'hanja',                      // hanja hangul emoji animal (config.js 에 추가 가능)
  glyphs: { cho: { R: '紅' } },            // 특정 글자만 교체
  glyphColor: '#fff', glow: 'rgba(255,60,90,0.6)',
  image: 'assets/images/pieces/ruby/{side}_{type}.png',
});
```

### 왕
```js
MJ.register('king', {
  id: 'cao', side: 'any', name: '조조', title: '난세의 간웅', glyph: '曹', emoji: '🦅',
  colors: { face: ['#eee', '#555'], rim: '#111', glyph: '#111', aura: '#9ad' },
  quotes: { select: ['…'], check: ['…'], capture: ['…'], checked: ['…'], win: ['…'], lose: ['…'] },
  portrait: 'assets/images/kings/cao_portrait.png', piece: 'assets/images/kings/cao_piece.png', voice: 'cao',
});
```

### BGM (코드 수정 없음)
- `assets/audio/bgm/` 에 `bgm1.mp3`, `bgm2.mp3`, `bgm3.mp3` … 를 넣으면 끝. 번호가 중간에 비어도 됩니다.
- 폴더 목록을 보여주는 로컬 서버로 실행하면 파일 이름이 무엇이든 전부 인식됩니다.
- 재생은 항상 랜덤 셔플 (모든 곡이 한 번씩 나온 뒤 다시 섞임, 같은 곡 연속 없음).
- 탐색 범위 등은 `js/data/audio.js` 의 `MJ.AUDIO_CONFIG.bgmAuto`.

### 효과음
기본 키: `select move capture check invalid win lose button pass`
찾는 순서: `{키}_{왕voice}` → `{키}_{진영}` → `{키}` → 합성음
```js
MJ.register('sfx', [
  { id: 'move_han', src: 'assets/audio/sfx/fire_move.wav' },     // 한나라 전용 이동음
  { id: 'check_hangu', src: 'assets/audio/voice/hangu_check.mp3' } // 항우 전용 장군 음성
]);
```

### 애니메이션(스프라이트) 스킨
메카닉처럼 변신·이동·공격·피격·사망·복귀 동작이 있는 스킨:
```js
MJ.register('skin', {
  id: 'knight', name: '기사단', desc: '…',
  shape: 'octagon', face: ['#eee', '#999'], rim: 'side', glyphSet: 'hanja', glyphColor: 'side', // 시트가 없을 때 대체 그림
  sprite: MJ.spriteDef('assets/images/pieces/knight/{side}_{type}.webp'),
});
```
- 시트 규격: 6행 × 6열, 한 칸 184×120px, 장기알 중심이 칸 정중앙, 장기알 지름 86px
  - 0행 변신(4) · 1행 이동(5) · 2행 공격(6) · 3행 피격(5) · 4행 사망(4) · 5행 장기알 복귀(4)
- 원본 시트(1344×756 템플릿)를 `tools/sprite_process.py` 로 돌리면 배경 투명화·번호 제거·정렬·진영 색 변형·한나라 글자(兵/漢) 교체까지 자동으로 만들어집니다.
- 규격이 다르면 `MJ.spriteDef(경로, { frameW, frameH, tokenDiam, anims:{…} })` 로 덮어쓰기.
- 왕에도 `sprite:` 를 넣으면 애니메이션 왕이 됩니다 (`kings.js` 의 메카 사령관 참고).

### 기물마다 프레임 수가 다른 스킨 (manifest 방식)
```js
MJ.register('skin', { id: 'my-pack', name: '…', codeToken: true,
  sprite: { base: 'assets/images/pieces/my-pack/', frameW: 200, frameH: 150, tokenDiam: 66, fps: 11, face: 1,
    manifest: { cho_R: { file: 'cho_R', anims: { transform:{row:0,n:4}, move:{row:1,n:5}, attack:{row:2,n:6},
      hit:{row:3,n:4}, death:{row:4,n:4}, revert:{row:5,n:4}, ranged:{row:6,n:3}, proj:{row:7,n:1} }, tokenFrames:{ transform:[0], revert:[3] } } } } });
```
- 없는 진영·기물 조합은 manifest 에서 빠지면 코드 그림으로 나오고, 다른 진영 시트 파일을 `file` 로 빌려 쓸 수도 있어요.
- `ranged` + `proj` 가 있으면 2칸 이상 떨어진 상대를 잡을 때 투사체(장풍 등)를 날립니다.
- `codeToken: true` 면 대기 상태 장기알을 코드로 그려 같은 나라 알 색을 통일합니다.
- 불규칙한 원본 시트 변환 도구: `tools/sheet_extract/`

### 성능(휴대폰) 최적화
- 대기 중인 장기알과 오라는 미리 그려 둔 그림을 재사용 (매 프레임 그리기 비용 감소)
- 연출이 없을 땐 화면 갱신을 20~30fps로 낮춰 배터리 절약, 애니메이션 중에만 60fps
- 꾸미기 구성의 시트·장기판 이미지를 미리 불러와 첫 변신 때 끊김 방지

### 이미지 장기판 (격자 맞춤)
```js
MJ.register('board', {
  id: 'my-board', name: '내 장기판', desc: '…',
  image: 'assets/images/boards/my-board.webp',
  grid: { w: 928, h: 1152, x0: 125, y0: 148, x1: 803, y1: 1030 }, // 이미지 속 첫/마지막 줄 위치(px)
  colors: { bg: ['#333', '#111'], line: '#000' }, particles: { type: 'ember', count: 14, color: '#ffb25a' },
  fitMargin: 0.6, // 격자 바깥으로 보여줄 여백 (칸 기준)
});
```
- 같은 템플릿(928×1152)으로 만든 판은 `grid: MJ.BOARD_GRID_928` 그대로 쓰면 됩니다.
- 격자 간격이 고르지 않은 그림은 줄마다 좌표를 적습니다: `grid: { w, h, xs: [세로줄 9개 x], ys: [가로줄 10개 y] }` (`js/data/boards_pack2.js` 참고)
- `tools/board_grid_peaks.py` 로 그림 속 줄 위치 후보를 뽑아볼 수 있어요 (궁성 X 중심 = 5번째 세로줄).
- 기물은 이미지 격자 교차점에 정확히 놓이고, 게임 화면 판 영역도 이미지 비율에 맞춰집니다.

### 삼국 무장 스킨 (8×6 시트)
- 시트 규격: 8열 × 6행, 한 칸 140px, 투명 배경. 행: 변신6 · 이동8 · 공격8 · 피격6 · 사망8 · 복귀6
- 경로: `assets/images/pieces/warlord/{cho|han}_{R|C|H|E|A|P}.webp`, 왕: `assets/images/kings/warlord/{cho|han}_K.webp`
- 같은 규격의 새 시트는 `Object.assign({}, MJ.SPRITE_WARLORD, { sheet: '경로/{side}_{type}.webp' })` 로 바로 스킨 등록.
- `tools/sprite_clean_grid.py` 로 시트의 잔선(얇은 세로/가로 줄)을 지울 수 있습니다.

### 스킬
- 규칙: `MJ.CONFIG.skills` — `milestones: [30,60,90,120]` 수마다 1회 충전, `slots: 4` 장착, `mode: 'charge'`(충전식) 또는 `'slot'`(n번째 칸은 n번째 수부터)
- 스킬 정의: `js/data/skills.js` (파일 맨 위에 형식 설명). 새 스킬은 `MJ.register('skill', {...})` 로 추가하면 꾸미기 › ⚡ 스킬 탭에 바로 나타납니다.
- 아이콘 이미지: `assets/images/skills/{id}.png` 를 넣으면 이모지 대신 표시.
- 예시 스킬: 철벽 방어 / 빙결 봉인 / 부활 / 위치 교환 / 질풍 연속 / 순간 이동 / 정화 / 진격 나팔 / 궁성 결계 / 화공
- 상태효과 `shield`(잡히지 않음)·`freeze`(움직이지 못함)는 규칙 엔진에 연결되어 AI·멀티에서도 그대로 적용됩니다.
- 멀티 대전에서는 스킬 사용이 상대에게 전송되고, 무르기·재접속 동기화에도 포함됩니다.

### 장기알 상태 색 통일
- 한 진영의 기물은 장기알(대기) 상태일 때 모두 그 진영 **대표 스킨**(가장 많이 쓴 스킨, 같으면 차의 스킨) 모양으로 그려집니다.
- 스프라이트 스킨에 `kingSprite` 를 넣으면 궁 알도 같은 모양이 됩니다.

### 꾸미기 프리셋
- 꾸미기 › 💾 저장 탭. 칸 수는 `js/core/storage.js` 의 `PRESETS` (기본 5).

### 게임 화면 오른쪽 메뉴 패널
- `index.html` 의 `#sideSlot` — 스킬 4칸 + 무르기·한수쉼·기권·메뉴. 채팅 등도 이 안에 `sp-sec` 블록으로 추가하면 됩니다.

### 스킨별 효과음
- 찾는 순서: `{종류}_{스킨}_{기물}` → `{종류}_{스킨}` → `{종류}_{왕voice}` → `{종류}_{진영}` → `{종류}` (종류: transform·move·capture)
- 예) `assets/audio/sfx/capture_fighters_C.mp3` 를 넣고 `js/data/audio.js` 에 같은 id 로 등록 → 격투가 포의 공격음
- 파일이 없으면 스킨별 합성음(휙·퍽·쾅·슈웅·위잉·레이저·챙)이 나와요.

### 전황 게이지
- `js/game.js` 의 `renderEval` — 기물 점수+위치 평가를 확률로 바꿔 표시 (`/ 7` 값이 작을수록 민감).

### 멀티 채팅
- `js/net/chat.js` — 빠른 문구는 `QUICK` 배열, 최대 글자 수 `MAX`.

### 화면 이미지 슬롯
`assets/images/ui/` 에 `title_bg`, `main_bg`, `logo` 이름으로 webp/png/jpg 를 넣으면 자동 적용.
다른 곳에도 HTML 요소에 `data-slot="assets/images/ui/이름"` 을 달면 같은 방식으로 동작합니다.

### 멀티 대전
- PeerJS(P2P) 방 코드 방식. 설정은 `js/net/net.js` 의 `MJ.NET_CONFIG`.
- 휴대폰 데이터망끼리 연결이 안 되면 `iceServers` 에 TURN 서버를 추가하세요.
- 서로의 꾸미기(왕·기물 스킨)가 상대 화면에도 표시됩니다. 상대에게 없는 스킨은 클래식으로 보여요.

### 카카오톡 초대
- 멀티 대전 첫 화면의 **카카오톡으로 초대** 한 번 → 방 만들기 + 카카오톡 열기까지 자동. 메시지 `⚔️ 장기 한 판! 코드 ABCDE` + 링크. 링크를 누르면 그 방에 바로 참가.
- 받는 쪽: 카톡 메시지를 통째로 **붙여넣기** 해도 코드를 찾아서 바로 참가 (`MJ.Invite.parseCode`).
- 공유가 막히면 메시지를 복사하고 카카오톡 앱을 열어 줌 (`openAppAfterCopy`). 카드 그림은 `assets/images/ui/share.jpg`.
- 문구는 `js/net/invite.js` 의 `MJ.KAKAO_CONFIG.inviteText`.
- 카카오 공유 카드(바로 참가 버튼)로 보내려면 `jsKey` 에 카카오 JavaScript 키를 넣고, 카카오 개발자 콘솔에 사이트 도메인을 등록.
- 키가 없으면 안드로이드는 카카오톡 공유창을 바로 열고, 아이폰은 공유창에서 카카오톡 선택.
- 링크 초대는 게임을 https 웹에 올렸을 때만 동작 (파일로 직접 열면 코드만 전송).

### 게임 화면 오른쪽 빈 공간 (메뉴·채팅 자리)
- `index.html` 의 `<aside class="side-slot" id="sideSlot">` 가 장기판 8 : 2 의 오른쪽 칸입니다. 여기에 넣으면 됩니다.
- 비율은 `css/style.css` 의 `.play-row .board-wrap { flex: 8 }`, `.side-slot { flex: 2 }`.

### 진영 구분 오라
- 색: `MJ.CONFIG.sides.cho.aura` / `han.aura`, 켜고 끄기·세기: `MJ.CONFIG.aura`. 설정 화면에서도 끌 수 있음.

### 기존 항목 일부만 수정 (패치)
```js
MJ.register('skin', { id: 'classic', $patch: true, rim: '#000' });
```

### 숨기기
```js
MJ.register('board', { id: 'volcano', $patch: true, hidden: true });
```

---

## 4. 코드 레벨 확장 포인트

| 확장 | 위치 |
|---|---|
| 새 지형 무늬 | `MJ.Terrain.textures.이름 = (g, w, h, rnd, board) => {}` |
| 새 파티클 | `MJ.Terrain.particles.이름 = { spawn, update, draw }` |
| 새 이펙트 | `MJ.Effects.types.이름 = { init, update, draw }` → `renderer.fxAt('이름', idx)` |
| 새 글자 세트 | `MJ.CONFIG.glyphSets.이름 = { cho:{…}, han:{…} }` |
| 새 장기알 모양 | `js/ui/pieceart.js` 의 `shapePath` switch 에 case 추가 |
| 새 버튼 동작 | HTML 에 `data-act="x"` + `MJ.ACTIONS.x = () => {}` |
| AI 난이도 | `MJ.CONFIG.difficulties` (depth, timeMs, blunder, jitter) |
| 진영 색 | `MJ.CONFIG.sides` |

저장 데이터는 브라우저 localStorage(`miniCustomJanggi.save`)에 있고, 삭제된 콘텐츠 id 는 자동으로 기본값으로 돌아갑니다.
