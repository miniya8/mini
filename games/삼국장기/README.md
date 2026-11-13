# 세미니의 멀티센터 전설장기1 — 모듈 분리 구조 안내

기존 단일 HTML(약 7.4MB)을 **대용량 리소스(이미지·효과음)**와 **기능별 코드 파일**로 분리했습니다.
`index.html`을 실행하면 기존과 100% 동일하게 동작하며, 앞으로 수정할 때는 해당 기능의 파일만 열어서 수정하면 됩니다.

## 폴더 및 파일 구성

### 1. 메인 진입점
- `index.html` (10 KB) : 전체 HTML 뼈대 및 CSS/JS/리소스 파일 연결

### 2. 스타일시트 (`css/`)
- `css/core.css` (6.6 KB) : 기본 레이아웃, 장기판 캔버스, 모달, 주사위/결과 오버레이 스타일
- `css/hud_chat.css` (16.9 KB) : 상단 HUD, 채팅창, 전황 게이지, 스킬 버튼, 관전 훈수펜, 리플레이 바 스타일
- `css/lobby.css` (19.2 KB) : 로비 화면, 2단계 메인 메뉴(멀티/AI), 삼국지 군막 리마스터 테마 스타일

### 3. 기능별 스크립트 (`js/`)
- `js/rules_ai.js` (16.1 KB) : 장기 행마 규칙, 장군/외통 판정, 고속 알파베타 AI 엔진 및 훈수 수읽기
- `js/lobby_ui.js` (20.7 KB) : 기물 스프라이트 슬라이싱, 화면 비율/회전 맞춤, 닉네임·포진·시간 설정 로비 UI
- `js/lobby_fx.js` (4.7 KB) : 로비 배경 삼국지 불티(Ember) 파티클 연출
- `js/p2p_network.js` (17.9 KB) : AI 워커 스레드 관리 및 PeerJS 기반 1:1 멀티 대전·최대 4인 관전 네트워크
- `js/duel.js` (46.1 KB) : 선공 결정 삼국지 장수 일기토 미니게임 애니메이션 및 사운드
- `js/game_core.js` (8.7 KB) : 대국 진행 루프, 턴 관리, 수 입력 처리, 상태 저장/복원
- `js/board_render.js` (17.7 KB) : 장기판 격자·기물·이동 궤적·장군 연출 캔버스 렌더링
- `js/board_theme_hud.js` (1.3 KB) : 상단 HUD 전장 테마 즉시 전환 버튼
- `js/board_weather_env.js` (49.9 KB) : 5대 전장별 날씨·상시 환경 이펙트(모래폭풍, 눈보라, 번개 등)
- `js/chat_commentary.js` (54.2 KB) : 실시간 채팅, 조롱 이모티콘, 무르기, 무효판, 전황 그래프, AI 축구식 해설, BGM
- `js/punish_skills.js` (83.1 KB) : 응징 스킬 8종(핵폭탄, 메테오, 외계인, 에네르기파 1·2, 주먹, 망치, 총격) 및 화면 파손 연출
- `js/spectator_damage.js` (34.3 KB) : 관전자 전용 실시간 훈수펜/화살표 및 4단계 장기판 파괴 렌더링
- `js/orbit_replay.js` (36.6 KB) : 대국 시작 3D 오빗 카메라 기물 낙하 연출 및 기보 리플레이 재생기
- `js/coach_kibo.js` (17.4 KB) : AI 실시간 훈수·교육 모드 및 명국 기보 도서관
- `js/remaster_patch.js` (106.9 KB) : 일기토·스킬·장기판 환경 통합 리마스터 패치 모듈

### 4. 대용량 Base64 미디어 리소스 (`assets/`)
- `assets/lobby_bg.jpg` (204.3 KB) : 로비 배경 이미지
- `assets/piece_sprites.js` (4.5 MB) : 초·한 14종 기물 애니메이션 스프라이트 시트
- `assets/board_themes.js` (853.7 KB) : 5종 전장 배경 이미지 데이터
- `assets/skills_media.js` (790.2 KB) : 스킬 및 장기판/화면 파손 스프라이트 데이터
- `assets/sfx_data.js` (242.7 KB) : 초·한 기물 이동/공격/패배 효과음 데이터
