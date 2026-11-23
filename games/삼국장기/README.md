# 세미니의 멀티센터 전설장기1 - 분리된 편집용 파일

index.html을 열어 실행합니다. HTML, CSS, JavaScript, 이미지 자료가 폴더별로 나뉘어 있어 필요한 부분만 찾아 수정할 수 있습니다.

## 주요 파일

- index.html: 화면 요소와 파일 연결 순서
- styles/main.css: 기본 화면과 게임판 스타일
- styles/samgukji-lobby.css: 삼국지 로비 효과
- styles/board-theme-hud.css: 장기판 테마 HUD
- js/rules.js: 장기 규칙과 기본 게임 로직
- js/piece-animation.js: 말 이미지와 애니메이션 자료
- js/chat.js: 채팅, 기권, 한 번 쉼 패널
- js/three-kingdoms-main-screen.js: 메인 화면 효과
- js/board-theme-hud.js: 테마 HUD 동작
- js/remaster-v1.js, js/remaster-v2.js, js/board-effects-v4.js: 추가 패치와 보드 효과
- js/skills-real-v8.js: 핵폭탄·메테오·외계인 사실적 업그레이드(원본과 같은 타이밍에 맞춰 연출, 핵·메테오는 원본 캔버스를 숨기고 대체). 끄기: jgSkillsReal8.enabled=false
- js/board-tear-v8.js: 군주 검·창 스킬의 장기판 찢어짐(조조·유비·여포·손권). 이미지 tear_*.webp
- 마법진은 군주 스킬(warlord-punish-v6.js)에서만 사용. 일반 스킬은 속성 효과(불·얼음·전기)
- js/warlord-punish-v6.js: 군주 6명 응징 스킬 완전 차별화 v6.1(제갈량·손권·조조·유비·여포·사마의) + 블룸·슬로모션·줌펀치로 화려하고 부드럽게. 기존 연출 복귀: jgWarlordPunish6.enabled=false, 빛번짐 세기: jgWarlordPunish6.bloom / jgSkillFx2.bloom
- assets/images/fx/wl_*.webp: warlord-punish-v6.js가 쓰는 군주 전용 이미지
- js/board-scenes-v7.js: 맵 컨셉별 이미지 환경 장면 15종(대상·모래회오리·독수리 / 눈의 정령·함박눈·얼음유성 / 발광버섯·빛줄기·정령덩굴 / 혼불·까마귀·마법진 / 하늘등·백학·벚꽃). board-effects-v4.js의 선/도형 입자·링·번개·덩굴·참격도 이미지로 교체됨
- js/board-env-v5.js: 5개 전장별 환경 풍경 레이어(바닥 질감·구름·오로라·눈보라·낙엽·반딧불·혼령·횃불·깃발·이벤트·기물 잡기 반응). 끄려면 jgEnv5.enabled=false
- assets/images/fx/env_*.webp: board-env-v5.js가 쓰는 환경 이미지
- js/skill-fx.js: 응징 스킬 불·균열·그을음 효과
- js/skill-fx-v2.js: 응징 스킬 화려함 레이어(충전 마법진·충격파·낙뢰·불기둥·성광·기술명 배너). 끄려면 jgSkillFx2.enabled=false
- assets/images/fx/v2_*.webp: skill-fx-v2.js가 쓰는 생성 이미지(충격파·번개·불꽃·마법진·성광·글로우·불똥·연기·비네트)
- assets/images/: 게임 배경과 말 이미지

## 편집할 때

파일과 폴더 이름을 유지하고 필요한 파일만 수정하세요. 이미지 파일을 바꾸는 경우 기존 파일명을 유지하면 별도 코드 수정 없이 적용됩니다. 다른 컴퓨터나 폴더로 옮길 때는 이 폴더 전체를 함께 옮기세요. PeerJS 연결 기능은 원본처럼 인터넷 연결이 필요합니다.
