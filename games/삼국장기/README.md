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
- 모바일 최적화: 본판 해상도 자동 조절(휴대폰 1.5배→느리면 1.25/1.1배), 바닥 환경을 작은 오버레이로 이동, 그을음·균열 캐시, 쉬는 캔버스 클리어 생략, 예전 선 줄기 환경(remaster-v2) 중지, 컷신 중 환경 레이어 일시정지, 저사양에서 입자·블룸·큰 스프라이트 감소
- 영상 적용(사용자 제공 GIF 5개 → assets/images/fx/cine_*.webp, 17MB→약 2MB): 화룡 강림(화산 황무지→용 컷인 + 판 위 용암 균열), 뇌신 폭풍(폭풍 하늘 번개→토네이도 컷인 + 판 위 번개 토네이도), 빙하 붕괴(빙하 컷인 + 얼음 운석·결정 빙하). *_glow 는 밝기를 투명도로 바꾼 판 위 합성용
- 장기판 선 지키기: 환경·스킬·응징·필살기 효과층에서 격자선 자리만 비워 선이 항상 보임(기물은 선 위, 제목·컷인은 그대로). 끄기: jgPieceMask.lines=false
- 🧪 테스트 장기판: test.html (또는 index.html?test) — 스킬·필살기·응징·환경·기물 연출을 골라 바로 재생. 새 연출은 js/test-board-v17.js 의 NEW 목록에 한 줄 추가
- js/hook-guard.js: 여러 모듈이 같은 함수를 1~1.5초마다 서로 다시 감싸며 효과가 중복 실행되던 버그 수정(플레이할수록 느려지던 원인)
- js/board-beauty-v15.js: 장기판 꾸밈(궁성 문양·모서리 장식·가장자리 그늘·빛 쓸림, 전장별 색). 끄기: jgBoardBeauty.enabled=false
- js/piece-polish-v16.js: 기물 선택 시 이동 표시(빛 구슬·물결 고리·잡기 조준 꺾쇠). 끄기: jgPiecePolish.enabled=false
- 속성별 잔류 효과: 불(잔불)·번개(전기)·얼음(반짝임·냉기)·용암(끓는 빛·연기)·산(거품)·플라즈마(푸른 잔광)·성창(빛가루)·꽃잎. 군주 공격도 속성 자국을 남김
- 필살기 임팩트 컷: 주 타격 순간 흑백 반전 컷(군주 색). 끄기: jgUltimate11.noImpactFrame=true
- js/skills-new-v14.js: 삭제된 핵폭탄·메테오·에네르기파2·차원와류포 자리에 새 스킬 4종(화룡 강림·뇌신 폭풍·대지 분쇄·빙하 붕괴). 스킬 성질별 장기판 파손(그을음·번개 흉터·용암 단층·빙결) 이미지. 끄기: jgSkillsNew14.enabled=false
- js/chat-tidy-v13.js: 채팅창 정리(군주 멘트는 말풍선, 해설은 중요 사건 위주·한 줄 요약, [해설: 요약/전체/끔] 버튼)
- 한자 제거: 화면에 나오는 모든 한문을 한글로 바꿈(말판 이미지 포함: 차·마·상·사·포·졸·병·한·초)
- js/duel-v12.js: 선공 일기토 개편 — 내 군주 vs 상대 군주(초상·무기·오라가 군주별로 다름), 매번 다른 합 대본(격돌·회피·치명타), 약 55% 확률 역전(각성), 군주별 결정타, 2배속·건너뛰기. 끄기: jgDuel12.enabled=false
- 군주 필살기 해금: 50/100/150수(AI도 같은 시점에 사용)
- js/warlord-ultimate-v11.js: 군주 필살기(30/60/90수 군주 스킬) 전용 연출 6종 — 군주별 컷인 모양·등장 방식·본 공격이 모두 다름(응징 연출 재사용 안 함). 모바일 최적화(캔버스 1장, 성능 조절기 연동). 끄기: jgUltimate11.enabled=false
- js/perf-governor.js: 기기 성능에 맞춰 효과 품질(jgPerf.q)을 자동 조절(느리면 입자·블룸·해상도 감소). 수동: jgPerf.auto=false; jgPerf.q=0.5
- js/piece-mask.js: 환경 효과가 장기알을 가리지 않도록 기물 위치를 비움. 끄기: jgPieceMask.enabled=false
- warlord-punish-v6.js: 군주 스킬(30/60/90수 해금) 필살기 컷신 포함. 끄기: jgWarlordPunish6.ultimate=false
- warlord-system.js: 수 카운터가 항상 0이던 문제 수정(mc 사용)
- js/skills-real-v8.js: 핵폭탄·메테오·외계인 사실적 업그레이드(원본과 같은 타이밍에 맞춰 연출, 핵·메테오는 원본 캔버스를 숨기고 대체). 끄기: jgSkillsReal8.enabled=false
- js/board-tear-v8.js: 군주 검·창 스킬의 장기판 찢어짐(조조·유비·여포·손권). 이미지 tear_*.webp
- 마법진은 군주 스킬(warlord-punish-v6.js)에서만 사용. 일반 스킬은 속성 효과(불·얼음·전기)
- js/warlord-punish-v6.js: 군주 6명 응징 스킬 완전 차별화 v6.1(제갈량·손권·조조·유비·여포·사마의) + 블룸·슬로모션·줌펀치로 화려하고 부드럽게. 기존 연출 복귀: jgWarlordPunish6.enabled=false, 빛번짐 세기: jgWarlordPunish6.bloom / jgSkillFx2.bloom
- assets/images/fx/wl_*.webp: warlord-punish-v6.js가 쓰는 군주 전용 이미지
- js/board-scenes-v7.js: 맵 컨셉별 이미지 환경 장면 15종(대상·모래회오리·독수리 / 눈의 정령·함박눈·얼음유성 / 발광버섯·빛줄기·정령덩굴 / 혼불·까마귀·마법진 / 하늘등·백학·벚꽃). board-effects-v4.js의 선/도형 입자·링·번개·덩굴·참격도 이미지로 교체됨
- js/board-ghibli-v9.js: 지브리풍 애니메이션 환경 장면 20종(맵마다 4개). 환경 이벤트 길이 4.4배(jgEnv3.wdur), 이벤트 사이 간격 단축
- js/board-env-v5.js: 5개 전장별 환경 풍경 레이어(바닥 질감·구름·오로라·눈보라·낙엽·반딧불·혼령·횃불·깃발·이벤트·기물 잡기 반응). 끄려면 jgEnv5.enabled=false
- assets/images/fx/env_*.webp: board-env-v5.js가 쓰는 환경 이미지
- js/skill-fx.js: 응징 스킬 불·균열·그을음 효과
- js/skill-fx-v2.js: 응징 스킬 화려함 레이어(충전 마법진·충격파·낙뢰·불기둥·성광·기술명 배너). 끄려면 jgSkillFx2.enabled=false
- assets/images/fx/v2_*.webp: skill-fx-v2.js가 쓰는 생성 이미지(충격파·번개·불꽃·마법진·성광·글로우·불똥·연기·비네트)
- assets/images/: 게임 배경과 말 이미지

## 편집할 때

파일과 폴더 이름을 유지하고 필요한 파일만 수정하세요. 이미지 파일을 바꾸는 경우 기존 파일명을 유지하면 별도 코드 수정 없이 적용됩니다. 다른 컴퓨터나 폴더로 옮길 때는 이 폴더 전체를 함께 옮기세요. PeerJS 연결 기능은 원본처럼 인터넷 연결이 필요합니다.
