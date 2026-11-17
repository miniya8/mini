/* ============================================================================
 * [삼국지 전설장기 군주 선택 · 개성 일기토 · 전장 특수 연출/행동 통합 모듈]
 * 파일 위치: js/warlord-system.js
 * 주요 기능:
 * 1. 선공 결정 일기토(선공 결정전) 직전 6대 삼국지 군주 선택 모달 자동 호출 & 로비 미리보기
 * 2. 일기토(모달 캔버스 & 풀스크린 2D 애니메이션)에서 군주별 무기·오라·필살기·대사 차별화
 * 3. 장기 대국 중 군주별 상황 자동 문구/이펙트(출진·격파·장군·멍군·승리) 및
 *    전용 특수 행동 버튼(대국당 1회 필살 연출 + 언제든 외치는 군주 명언/오라)
 * 4. AI 대전 자동 라이벌 군주 매칭 & 멀티플레이어(PeerJS) 양측 군주 실시간 동기화
 * ============================================================================ */
(function initSamgukjiWarlordSystem() {
  if (window.__JG_WARLORD_SYSTEM_LOADED__) return;
  window.__JG_WARLORD_SYSTEM_LOADED__ = true;

  /* --------------------------------------------------------------------------
   * 1. 삼국지 6대 군주 데이터 정의
   * -------------------------------------------------------------------------- */
  const WARLORDS = [
    {
      id: 'liubei',
      name: '유비',
      hanja: '劉備',
      faction: '촉한 · 인덕의 황숙',
      icon: '🐉',
      weapon: '자웅일대검(雌雄一對劍)',
      duelSkill: '쌍검합벽 · 도원결의(桃園結義)',
      duelDesc: '관우·장비의 환영과 함께 삼형제 비취 검기로 적을 압도합니다.',
      primary: '#10b981',
      secondary: '#fbbf24',
      glow: 'rgba(16, 185, 129, 0.85)',
      bgGrad: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
      effectType: 'peach_blossom',
      actionName: '🤝 도원결의 격려',
      actionDesc: '도원의 맹세를 외쳐 아군 진영 전체에 비취·황금빛 수호 오라와 벚꽃 검기를 전개합니다.',
      duelLines: {
        intro: '도원의 맹세로 천하의 대의를 세우리라!',
        clash: '자웅일대검이여, 의리의 빛을 발하라!',
        win: '인덕이 패도를 이기는 법! 촉한이 선공을 취하겠소!',
        lose: '훌륭한 무예로군. 허나 대국의 승패는 이제부터요.'
      },
      quotes: {
        start: '짐과 함께 천하를 바로잡을 영웅들은 전진하라!',
        capture: '대의를 가로막는 자, 자웅검 아래 무릎 꿇으라!',
        captureBig: '적의 주력을 꺾었소! 도원의 의리가 하늘에 닿았도다!',
        check: '장군! 하늘이 돕고 백성이 따르니 피할 곳은 없소!',
        defend: '끝까지 버텨라! 인의의 성벽은 결코 무너지지 않는다!',
        action: '도원에서 맺은 의리, 오늘 이 장기판 위에서 영원하리라!',
        shout: '물고기가 물을 만난 듯, 우리의 진격은 멈추지 않소!',
        victory: '천하가 안정을 되찾았도다! 모두 짐의 용장들 덕분이오!'
      }
    },
    {
      id: 'caocao',
      name: '조조',
      hanja: '曹操',
      faction: '위나라 · 난세의 패왕',
      icon: '🔥',
      weapon: '의천검 · 청강검(倚天·靑釭)',
      duelSkill: '패왕위압 · 천하호령(天下號令)',
      duelDesc: '진홍빛 패왕의 뇌전과 쌍검의 화염 폭풍으로 상대를 짓누릅니다.',
      primary: '#ef4444',
      secondary: '#f59e0b',
      glow: 'rgba(239, 68, 68, 0.85)',
      bgGrad: 'linear-gradient(135deg, #7f1d1d 0%, #111827 100%)',
      effectType: 'crimson_lightning',
      actionName: '⚔️ 패왕 호령(威壓)',
      actionDesc: '패왕의 위압을 내뿜어 장기판 전역에 진홍빛 뇌전과 화염 충격파를 내리꽂습니다.',
      duelLines: {
        intro: '난세를 평정할 자는 오직 나 조맹덕뿐이다!',
        clash: '의천검의 칼날 앞에 감히 누가 서느냐!',
        win: '하하하! 천명이 내게 있으니 선공 또한 나의 것이다!',
        lose: '재미있군… 하지만 전쟁은 머리싸움이다!'
      },
      quotes: {
        start: '전군 출격하라! 오늘 이 판의 주인은 나 조맹덕이다!',
        capture: '무능한 자는 도태될 뿐! 다음 수를 내놓아라!',
        captureBig: '적의 대들보가 부러졌군! 패왕의 진격을 막을 자 없다!',
        check: '장군! 네놈의 궁성은 이미 내 손아귀 안에 있다!',
        defend: '고작 이 정도로 나를 꺾을 수 있을 것 같으냐!',
        action: '천하가 나를 저버릴지언정, 내가 천하를 저버리진 않는다!',
        shout: '병법의 요체는 허와 실! 네 수읽기는 이미 간파당했다!',
        victory: '천하통일의 패업이 완성되었다! 와하하하!'
      }
    },
    {
      id: 'sunquan',
      name: '손권',
      hanja: '孫權',
      faction: '동오 · 강동의 젊은 호랑이',
      icon: '🌊',
      weapon: '고정도(古錠刀)',
      duelSkill: '적벽수군진 · 파천노도(破天怒濤)',
      duelDesc: '거대한 청룡 해일과 불화살을 일으켜 고정의 명도로 일섬합니다.',
      primary: '#06b6d4',
      secondary: '#38bdf8',
      glow: 'rgba(6, 182, 212, 0.85)',
      bgGrad: 'linear-gradient(135deg, #164e63 0%, #0f172a 100%)',
      effectType: 'azure_tide',
      actionName: '🌊 적벽 동남풍',
      actionDesc: '동남풍을 불러 청룡 해일과 황금 불꽃 소용돌이로 전장의 흐름을 뒤바꿉니다.',
      duelLines: {
        intro: '강동의 호랑이가 웅크린 발톱을 드러낼 때다!',
        clash: '고정도의 칼끝에 장강의 파도를 실어 베어주마!',
        win: '강동의 물결이 승리했다! 동오가 선공을 잡는다!',
        lose: '수세에 몰려도 적벽의 불길처럼 되살아날 것이다!'
      },
      quotes: {
        start: '장강의 험준한 물결처럼 난공불략의 진을 펼쳐라!',
        capture: '강동의 기병과 수군 앞에 빈틈을 보였구나!',
        captureBig: '적벽의 화공처럼 적의 핵심 병력을 불태웠다!',
        check: '장군! 밀려오는 파도를 막을 제방은 남아있지 않다!',
        defend: '강동의 방패는 철벽이다! 쉽게 뚫리지 않는다!',
        action: '동남풍이 불어온다! 적벽의 불길로 전장을 삼켜라!',
        shout: '아버님과 형님이 일군 강동의 기세를 보여주마!',
        victory: '삼국의 정립을 넘어 동오가 천하의 주인이 되었다!'
      }
    },
    {
      id: 'lvbu',
      name: '여포',
      hanja: '呂布',
      faction: '군웅 · 천하무쌍 비장',
      icon: '⚡',
      weapon: '방천화극(方天畫戟)',
      duelSkill: '귀신강림 · 방천무쌍격(方天無雙擊)',
      duelDesc: '적토마의 질주와 방천화극의 초거대 자색 참격으로 전장을 뒤흔듭니다.',
      primary: '#a855f7',
      secondary: '#f43f5e',
      glow: 'rgba(168, 85, 247, 0.9)',
      bgGrad: 'linear-gradient(135deg, #581c87 0%, #1e1b4b 100%)',
      effectType: 'musou_slash',
      actionName: '🔱 무쌍 포효(鬼神)',
      actionDesc: '방천화극을 내리찍어 화면을 뒤흔드는 자색 충격파와 귀신 오라를 폭발시킵니다.',
      duelLines: {
        intro: '인중여포 마중적토! 내 앞에 설 자 누구냐!',
        clash: '방천화극 한 휘두름에 천지가 갈라진다!',
        win: '크하하하! 내 무력을 당해낼 자는 세상에 없다! 내가 선공이다!',
        lose: '칫… 다음엔 단칼에 두 동강 내주마!'
      },
      quotes: {
        start: '덤벼라! 혼자서라도 너희 전군을 밟아주마!',
        capture: '약해 빠졌군! 방천화극의 녹이 될 가치도 없다!',
        captureBig: '크하하! 대장급 기물도 내 일격엔 종잇장일 뿐!',
        check: '장군! 목을 씻고 기다려라, 여봉선이 간다!',
        defend: '호오, 제법이군! 내 피가 끓어오르기 시작했다!',
        action: '귀신이 강림했다! 누구든 내 앞을 막으면 베어버린다!',
        shout: '적토마여 달려라! 이 장기판을 부숴버리자!',
        victory: '천하무쌍 여봉선 앞에 모든 영웅이 무릎을 꿇었다!'
      }
    },
    {
      id: 'zhuge',
      name: '제갈량',
      hanja: '諸葛亮',
      faction: '촉한 · 와룡 승상',
      icon: '🪶',
      weapon: '백우선(白羽扇)',
      duelSkill: '팔진도 · 천기누설(天機漏洩)',
      duelDesc: '북두칠성과 팔괘 진법을 소환해 하늘의 별빛 광선으로 제압합니다.',
      primary: '#3b82f6',
      secondary: '#fde047',
      glow: 'rgba(59, 130, 246, 0.85)',
      bgGrad: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      effectType: 'star_bagua',
      actionName: '🌌 팔진도 천기',
      actionDesc: '장기판 위에 황금 팔괘 마법진과 북두칠성을 전개하여 신묘한 기운을 불어넣습니다.',
      duelLines: {
        intro: '천문을 읽고 지리를 꿰뚫으니, 승부는 이미 정해졌소.',
        clash: '백우선 한 번에 팔진도의 신비가 열리나니!',
        win: '별빛이 촉을 비추니, 와룡이 먼저 한 수를 두겠소.',
        lose: '천기가 잠시 흐려졌을 뿐, 백 수 앞을 내다보겠소.'
      },
      quotes: {
        start: '진법은 완성되었소. 부디 후회 없는 한 수를 두시구려.',
        capture: '이미 세 수 전에 예측했던 포석이었소.',
        captureBig: '상대의 핵심 기물이 함정에 빠졌군. 형세가 기울었소.',
        check: '장군! 팔진도의 출구는 어디에도 없소이다.',
        defend: '금낭묘계(錦囊妙計)가 있으니 당황할 것 없소.',
        action: '하늘의 별자리와 땅의 팔진도가 오늘 우리의 승리를 증명하리라!',
        shout: '사불급설(駟不及舌), 한 번 놓은 수는 돌이킬 수 없소.',
        victory: '천하삼분지계를 넘어 대통일의 위업을 달성하였소!'
      }
    },
    {
      id: 'simayi',
      name: '사마의',
      hanja: '司馬懿',
      faction: '위진 · 낭고의 지략가',
      icon: '🐺',
      weapon: '흑철선 · 낭고비수',
      duelSkill: '낭고지상 · 암영빙옥(暗影氷獄)',
      duelDesc: '얼어붙은 빙결 안개와 늑대의 환영으로 상대의 틈을 차갑게 꿰뚫습니다.',
      primary: '#6366f1',
      secondary: '#94a3b8',
      glow: 'rgba(99, 102, 241, 0.85)',
      bgGrad: 'linear-gradient(135deg, #312e81 0%, #090d16 100%)',
      effectType: 'frost_wolf',
      actionName: '🐺 낭고의 응시',
      actionDesc: '차가운 빙청빛 늑대의 눈빛과 암영 파동으로 전장을 얼어붙게 만듭니다.',
      duelLines: {
        intro: '조급한 자가 먼저 무너지는 법… 끝까지 지켜보마.',
        clash: '낭고의 발톱은 가장 치명적인 순간에 드러난다!',
        win: '빙결의 그림자가 너를 덮쳤다. 내가 먼저 시작하지.',
        lose: '훌륭하군… 하지만 최후에 웃는 자는 나 사마의다.'
      },
      quotes: {
        start: '서두를 것 없다. 상대가 스스로 자멸할 때까지 기다릴 뿐.',
        capture: '덫에 걸렸군. 빈틈이 너무 컸어.',
        captureBig: '네 가장 믿음직한 장수가 이제 내 손에 사라졌다.',
        check: '장군… 숨통이 조여오는 기분이 어떠한가?',
        defend: '어리석군. 그 정도의 공격은 이미 대비해 두었다.',
        action: '낭고의 눈은 결코 놓치지 않는다… 전장의 모든 수를 꿰뚫어주마!',
        shout: '인내하고 또 인내하라. 승리는 가장 오래 버티는 자의 것이다.',
        victory: '모든 영웅이 사라진 자리, 최후의 승자는 나 사마의다!'
      }
    }
  ];

  const getWarlord = (id) => WARLORDS.find(w => w.id === id) || WARLORDS[0];
  const savedId = () => {
    try { return localStorage.getItem('jg_selected_warlord') || 'liubei'; } catch (e) { return 'liubei'; }
  };

  window.JG_WARLORDS = WARLORDS;
  window.JG_MY_WARLORD = savedId();
  window.JG_OPP_WARLORD = 'caocao';
  window.__JG_WARLORD_MATCH_READY__ = false;
  window.__JG_WARLORD_ACT_USED__ = false;
  window.__JG_WARLORD_SHOUT_CD__ = 0;

  /* --------------------------------------------------------------------------
   * 2. Web Audio API 군주 전용 효과음 합성기
   * -------------------------------------------------------------------------- */
  function playWarlordSfx(type) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ac = window.__JG_WL_AC || (window.__JG_WL_AC = new Ctx());
      if (ac.state === 'suspended') ac.resume();
      const now = ac.currentTime;

      const osc = ac.createOscillator();
      const gain = ac.createGain();
      if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.14);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain); gain.connect(ac.destination);
        osc.start(now); osc.stop(now + 0.19);
      } else if (type === 'action' || type === 'check') {
        // 웅장한 전고(북소리) + 금속 검기 공명
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.55);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain); gain.connect(ac.destination);
        osc.start(now); osc.stop(now + 0.62);

        const osc2 = ac.createOscillator();
        const gain2 = ac.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(520, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(880, now + 0.35);
        gain2.gain.setValueAtTime(0.14, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc2.connect(gain2); gain2.connect(ac.destination);
        osc2.start(now + 0.05); osc2.stop(now + 0.44);
      }
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
   * 3. 스타일시트 주입
   * -------------------------------------------------------------------------- */
  function injectStyles() {
    if (document.getElementById('jg_warlord_css')) return;
    const st = document.createElement('style');
    st.id = 'jg_warlord_css';
    st.textContent = `
      #jg_wl_modal {
        position: fixed; inset: 0; z-index: 9995;
        background: radial-gradient(circle at center, rgba(15, 23, 42, 0.94) 0%, rgba(3, 7, 18, 0.98) 100%);
        display: none; align-items: center; justify-content: center;
        padding: 12px; font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
        backdrop-filter: blur(8px);
      }
      .jg-wl-box {
        width: 100%; max-width: 880px; max-height: 92vh;
        background: linear-gradient(180deg, #111827 0%, #090d16 100%);
        border: 2px solid #d4af37; border-radius: 18px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9), 0 0 28px rgba(212, 175, 55, 0.25);
        display: flex; flex-direction: column; overflow: hidden; color: #f8fafc;
      }
      .jg-wl-head {
        padding: 14px 20px; background: linear-gradient(90deg, #1e293b, #0f172a);
        border-bottom: 1px solid rgba(212, 175, 55, 0.35);
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
      }
      .jg-wl-head h2 { margin: 0; font-size: 19px; font-weight: 900; color: #fde047; letter-spacing: -0.3px; }
      .jg-wl-sub { font-size: 12.5px; color: #cbd5e1; margin-top: 3px; }
      .jg-wl-body {
        padding: 14px 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
      }
      .jg-wl-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(235px, 1fr)); gap: 10px;
      }
      .jg-wl-card {
        position: relative; border-radius: 14px; padding: 12px 14px;
        border: 2px solid rgba(148, 163, 184, 0.28);
        cursor: pointer; transition: all 0.18s ease;
        display: flex; flex-direction: column; gap: 6px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
      }
      .jg-wl-card:hover { transform: translateY(-2px); border-color: #fde047; }
      .jg-wl-card.active {
        border-color: #fde047;
        box-shadow: 0 0 0 2px rgba(253, 224, 71, 0.45), 0 12px 26px rgba(0, 0, 0, 0.7);
      }
      .jg-wl-card-top { display: flex; align-items: center; gap: 10px; }
      .jg-wl-avatar {
        width: 48px; height: 48px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 25px; font-weight: 900; border: 2px solid #fde047;
        background: rgba(0, 0, 0, 0.45); flex-shrink: 0;
        position: relative;
      }
      .jg-wl-hanja {
        position: absolute; bottom: -4px; right: -4px;
        background: #991b1b; color: #fef08a; border: 1px solid #fde047;
        font-size: 10px; font-weight: 900; padding: 1px 4px; border-radius: 4px;
      }
      .jg-wl-name { font-size: 16.5px; font-weight: 900; color: #fff; }
      .jg-wl-fac { font-size: 11.5px; font-weight: 700; color: #fde047; }
      .jg-wl-tag {
        font-size: 11.5px; padding: 4px 8px; border-radius: 7px;
        background: rgba(0, 0, 0, 0.42); border: 1px solid rgba(255,255,255,0.12);
        color: #e2e8f0; line-height: 1.35;
      }
      .jg-wl-detail {
        padding: 12px 16px; border-radius: 12px;
        background: rgba(30, 41, 59, 0.78); border: 1px solid rgba(212, 175, 55, 0.45);
        display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;
      }
      .jg-wl-confirm {
        padding: 12px 26px; border-radius: 999px; border: 2px solid #fef08a;
        background: linear-gradient(180deg, #eab308 0%, #b45309 100%);
        color: #fff; font-size: 15.5px; font-weight: 900; cursor: pointer;
        box-shadow: 0 6px 20px rgba(234, 179, 8, 0.45); transition: transform 0.14s;
      }
      .jg-wl-confirm:hover { transform: scale(1.03); }

      /* 일기토 모달(#dc) 내 군주 대치 바 */
      #jg_duel_vs_bar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        max-width: 440px; margin: 0 auto 8px; padding: 8px 10px;
        border-radius: 12px; background: rgba(15, 23, 42, 0.9);
        border: 1.5px solid #d4af37;
      }
      .jg-duel-side {
        flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px;
      }
      .jg-duel-side b { font-size: 13.5px; color: #fff; }
      .jg-duel-side span { font-size: 11px; color: #fde047; font-weight: 700; }
      .jg-duel-side small { font-size: 10.5px; color: #93c5fd; }

      /* 대국 중 군주 전용 패널 & 액션 버튼 */
      #jg_warlord_panel {
        margin: 4px 0; padding: 7px 9px; border-radius: 10px;
        background: linear-gradient(90deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92));
        border: 1.5px solid #d4af37;
        display: flex; align-items: center; justify-content: space-between; gap: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.45);
      }
      .jg-wp-info { display: flex; align-items: center; gap: 7px; min-width: 0; }
      .jg-wp-ico {
        width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #fde047;
        display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0;
      }
      .jg-wp-txt { display: flex; flex-direction: column; min-width: 0; }
      .jg-wp-txt b { font-size: 12px; color: #fde047; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .jg-wp-txt small { font-size: 10px; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .jg-wp-btns { display: flex; gap: 5px; flex-shrink: 0; }
      .jg-wp-btn {
        padding: 5px 9px; border-radius: 8px; border: 1.5px solid #fde047;
        font-size: 11.5px; font-weight: 900; color: #fff; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4); transition: all 0.15s;
      }
      .jg-wp-btn:disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.8); }

      /* 대국 중 군주 컷인 배너 */
      #jg_warlord_cutin {
        position: fixed; left: 50%; top: 15%; transform: translate(-50%, -10px) scale(0.92);
        z-index: 9850; pointer-events: none; opacity: 0;
        transition: opacity 0.25s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        max-width: 92vw; width: 460px;
      }
      #jg_warlord_cutin.show {
        opacity: 1; transform: translate(-50%, 0) scale(1);
      }
      .jg-cutin-inner {
        padding: 12px 18px; border-radius: 14px;
        border: 2px solid #fde047;
        box-shadow: 0 14px 38px rgba(0,0,0,0.85), 0 0 24px rgba(253,224,71,0.35);
        display: flex; align-items: center; gap: 12px; color: #fff;
      }
      .jg-cutin-seal {
        width: 52px; height: 52px; border-radius: 12px; border: 2px solid #fde047;
        background: rgba(0,0,0,0.45); display: flex; flex-direction: column;
        align-items: center; justify-content: center; flex-shrink: 0;
      }
      .jg-cutin-seal span { font-size: 22px; line-height: 1; }
      .jg-cutin-seal b { font-size: 11px; color: #fde047; margin-top: 2px; }
      .jg-cutin-msg { flex: 1; min-width: 0; }
      .jg-cutin-title { font-size: 12px; font-weight: 900; color: #fde047; margin-bottom: 3px; }
      .jg-cutin-quote { font-size: 14.5px; font-weight: 800; line-height: 1.35; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
    `;
    document.head.appendChild(st);
  }

  /* --------------------------------------------------------------------------
   * 4. 선공 결정 일기토 전 군주 선택 모달 UI
   * -------------------------------------------------------------------------- */
  function ensureWarlordModal() {
    injectStyles();
    let modal = document.getElementById('jg_wl_modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'jg_wl_modal';
    modal.innerHTML = `
      <div class="jg-wl-box">
        <div class="jg-wl-head">
          <div>
            <h2>👑 출진 군주 선택 — 삼국지 영웅전</h2>
            <div class="jg-wl-sub" id="jg_wl_modal_sub">선공 결정 일기토에 출전할 군주를 선택하세요. 군주마다 일기토 필살기와 장기 전장 고유 행동·연출이 다릅니다!</div>
          </div>
          <button type="button" id="jg_wl_close_btn" style="display:none;padding:6px 12px;border-radius:8px;border:1px solid #64748b;background:#1e293b;color:#fff;font-weight:800;cursor:pointer;">✕ 닫기</button>
        </div>
        <div class="jg-wl-body">
          <div class="jg-wl-grid" id="jg_wl_grid"></div>
          <div class="jg-wl-detail" id="jg_wl_detail"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  window.openWarlordSelectModal = function(opts = {}) {
    const modal = ensureWarlordModal();
    const grid = document.getElementById('jg_wl_grid');
    const detail = document.getElementById('jg_wl_detail');
    const closeBtn = document.getElementById('jg_wl_close_btn');
    const subEl = document.getElementById('jg_wl_modal_sub');

    const previewOnly = !!opts.previewOnly;
    closeBtn.style.display = previewOnly ? 'inline-block' : 'none';
    closeBtn.onclick = () => { modal.style.display = 'none'; };

    if (opts.mode === 'mp') {
      subEl.textContent = '멀티 대전: 선공 결정 일기토에 출전할 내 군주를 선택하면 상대방 화면에도 실시간 반영됩니다!';
    } else if (previewOnly) {
      subEl.textContent = '다음 대국에서 출진할 기본 군주를 미리 살펴보고 선택할 수 있습니다.';
    } else {
      subEl.textContent = '선공 결정 일기토 직전입니다! 출전할 군주를 선택하고 [이 군주로 일기토 출진!]을 누르세요.';
    }

    let currentPick = window.JG_MY_WARLORD || 'liubei';

    function renderSelection() {
      const selW = getWarlord(currentPick);
      grid.innerHTML = WARLORDS.map(w => `
        <div class="jg-wl-card ${w.id === currentPick ? 'active' : ''}" data-wl="${w.id}" style="background:${w.bgGrad};">
          <div class="jg-wl-card-top">
            <div class="jg-wl-avatar" style="border-color:${w.secondary};box-shadow:0 0 12px ${w.glow};">
              ${w.icon}
              <span class="jg-wl-hanja">${w.hanja}</span>
            </div>
            <div>
              <div class="jg-wl-name">${w.name}</div>
              <div class="jg-wl-fac" style="color:${w.secondary};">${w.faction}</div>
            </div>
          </div>
          <div class="jg-wl-tag">⚔️ <b>일기토:</b> ${w.duelSkill}</div>
          <div class="jg-wl-tag">✨ <b>전장 행동:</b> ${w.actionName}</div>
        </div>
      `).join('');

      grid.querySelectorAll('.jg-wl-card').forEach(card => {
        card.onclick = () => {
          currentPick = card.getAttribute('data-wl');
          playWarlordSfx('select');
          renderSelection();
        };
      });

      detail.innerHTML = `
        <div style="flex:1;min-width:240px;">
          <div style="font-size:15px;font-weight:900;color:#fde047;margin-bottom:4px;">
            ${selW.icon} ${selW.name}(${selW.hanja}) · 전용 무기: ${selW.weapon}
          </div>
          <div style="font-size:12.5px;color:#e2e8f0;line-height:1.45;">
            • <b>일기토 필살기 [${selW.duelSkill}]:</b> ${selW.duelDesc}<br>
            • <b>장기 전장 행동 [${selW.actionName}]:</b> ${selW.actionDesc}<br>
            • <b>대표 명언:</b> <i style="color:#fef08a;">"${selW.duelLines.intro}"</i>
          </div>
        </div>
        <button type="button" class="jg-wl-confirm" id="jg_wl_confirm_btn">
          ${previewOnly ? '👑 이 군주로 기본 설정' : '⚔️ ' + selW.name + ' 선택 완료 · 일기토 출진!'}
        </button>
      `;

      document.getElementById('jg_wl_confirm_btn').onclick = () => {
        window.JG_MY_WARLORD = currentPick;
        try { localStorage.setItem('jg_selected_warlord', currentPick); } catch (e) {}
        playWarlordSfx('action');
        updateLobbyWarlordBadge();
        modal.style.display = 'none';
        if (typeof opts.onConfirm === 'function') {
          opts.onConfirm(currentPick);
        }
      };
    }

    renderSelection();
    modal.style.display = 'flex';
  };

  /* --------------------------------------------------------------------------
   * 5. 로비 화면에 현재 군주 선택 버튼/배지 추가
   * -------------------------------------------------------------------------- */
  function updateLobbyWarlordBadge() {
    const w = getWarlord(window.JG_MY_WARLORD);
    let btn = document.getElementById('lb_warlord_btn');
    const topBtns = document.querySelector('.lb-top-btns');
    if (topBtns && !btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'lb_warlord_btn';
      btn.className = 'lb-util-btn';
      btn.style.cssText = 'border-color:#fde047;background:linear-gradient(180deg,#78350f,#451a03);color:#fef08a;font-weight:900;';
      btn.onclick = () => window.openWarlordSelectModal({ previewOnly: true });
      topBtns.prepend(btn);
    }
    if (btn) {
      btn.textContent = `${w.icon} 군주: ${w.name}`;
    }
  }

  /* --------------------------------------------------------------------------
   * 6. 선공 결정 일기토(#dc) 및 풀스크린 2D 일기토 군주별 특색 연동
   * -------------------------------------------------------------------------- */
  function pickDistinctAiWarlord(myId) {
    const pool = WARLORDS.filter(w => w.id !== myId);
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  function enhanceDuelModalWithWarlords() {
    const dc = document.getElementById('dc');
    if (!dc) return;
    const myW = getWarlord(window.JG_MY_WARLORD);
    const oppW = getWarlord(window.JG_OPP_WARLORD);

    const card = dc.querySelector('.card');
    const da = document.getElementById('da');
    if (card && da) {
      let vsBar = document.getElementById('jg_duel_vs_bar');
      if (!vsBar) {
        vsBar = document.createElement('div');
        vsBar.id = 'jg_duel_vs_bar';
        card.insertBefore(vsBar, da);
      }
      vsBar.innerHTML = `
        <div class="jg-duel-side">
          <b>${myW.icon} ${myW.name} (${myW.hanja})</b>
          <span>${myW.weapon}</span>
          <small>${myW.duelSkill}</small>
        </div>
        <div style="font-size:18px;font-weight:900;color:#fde047;padding:0 6px;">VS</div>
        <div class="jg-duel-side">
          <b>${oppW.icon} ${oppW.name} (${oppW.hanja})</b>
          <span>${oppW.weapon}</span>
          <small>${oppW.duelSkill}</small>
        </div>
      `;
    }

    const dn1 = document.getElementById('dn1');
    const dn2 = document.getElementById('dn2');
    if (dn1) dn1.textContent = `${myW.icon} ${myW.name} [${myW.weapon}]`;
    if (dn2) dn2.textContent = `${oppW.icon} ${oppW.name} [${oppW.weapon}]`;

    // 일기토 출진 버튼(#drb)에 군주 필살기 명칭 표시
    const drb = document.getElementById('drb');
    if (drb && !drb.dataset.wlHooked) {
      drb.dataset.wlHooked = '1';
      drb.addEventListener('click', () => {
        playWarlordSfx('action');
      }, true);
    }
    if (drb) {
      drb.textContent = `⚔️ ${myW.name} 일기토 출진! (${myW.duelSkill.split('·')[0].trim()})`;
    }

    // #da 캔버스 위에 두 군주 대치 프리뷰 애니메이션
    if (da && !da.dataset.wlAnimRunning) {
      da.dataset.wlAnimRunning = '1';
      const ctx = da.getContext('2d');
      function drawModalDuelPreview() {
        if (dc.style.display === 'none') {
          da.dataset.wlAnimRunning = '';
          return;
        }
        requestAnimationFrame(drawModalDuelPreview);
        const w1 = getWarlord(window.JG_MY_WARLORD);
        const w2 = getWarlord(window.JG_OPP_WARLORD);
        const t = performance.now() * 0.001;
        const W = da.width, H = da.height;

        ctx.clearRect(0, 0, W, H);
        // 좌우 세력 배경
        const gL = ctx.createLinearGradient(0, 0, W * 0.55, H);
        gL.addColorStop(0, w1.primary);
        gL.addColorStop(1, '#090d16');
        ctx.fillStyle = gL;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(W * 0.54, 0); ctx.lineTo(W * 0.46, H); ctx.lineTo(0, H);
        ctx.closePath(); ctx.fill();

        const gR = ctx.createLinearGradient(W * 0.45, 0, W, H);
        gR.addColorStop(0, '#090d16');
        gR.addColorStop(1, w2.primary);
        ctx.fillStyle = gR;
        ctx.beginPath();
        ctx.moveTo(W * 0.54, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(W * 0.46, H);
        ctx.closePath(); ctx.fill();

        // 중앙 에너지 충돌 스파크
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = 18 + Math.sin(t * 8) * 6;
        const cg = ctx.createRadialGradient(W * 0.5, H * 0.5, 2, W * 0.5, H * 0.5, pulse * 2.2);
        cg.addColorStop(0, '#ffffff');
        cg.addColorStop(0.4, w1.secondary);
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(W * 0.5, H * 0.5, pulse * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 좌측 군주 아바타 & 무기 오라
        const bob1 = Math.sin(t * 3.5) * 4;
        const bob2 = Math.cos(t * 3.5) * 4;
        drawMiniWarlordAvatar(ctx, w1, W * 0.24, H * 0.48 + bob1, 36, t);
        drawMiniWarlordAvatar(ctx, w2, W * 0.76, H * 0.48 + bob2, 36, -t);

        // 하단 출사표 대사
        ctx.fillStyle = 'rgba(0,0,0,0.68)';
        ctx.fillRect(0, H - 34, W, 34);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px "Malgun Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`"${w1.duelLines.intro}"`, W * 0.5, H - 13);
      }
      requestAnimationFrame(drawModalDuelPreview);
    }
  }

  function drawMiniWarlordAvatar(ctx, w, x, y, r, rotPhase) {
    ctx.save();
    ctx.translate(x, y);
    // 회전 룬 링
    ctx.save();
    ctx.rotate(rotPhase * 1.4);
    ctx.strokeStyle = w.secondary;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 6]);
    ctx.beginPath(); ctx.arc(0, 0, r + 8, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = w.primary;
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.font = `${Math.round(r * 0.95)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(w.icon, 0, 1);
    ctx.restore();
  }

  /* --------------------------------------------------------------------------
   * 7. 풀스크린 2D 애니메이션 일기토(playAnimeFirstTurnDuel) 군주 특색 오버라이드
   * -------------------------------------------------------------------------- */
  window.playAnimeFirstTurnDuel = function(winnerSide, onComplete) {
    const winS = (winnerSide === 'h' || winnerSide === 'c') ? winnerSide : 'c';
    const mySide = (typeof me !== 'undefined' && (me === 'h' || me === 'c')) ? me : 'c';
    const myW = getWarlord(window.JG_MY_WARLORD);
    const oppW = getWarlord(window.JG_OPP_WARLORD);

    const leftW = myW;
    const rightW = oppW;
    const playerWon = (winS === mySide);

    let finished = false;
    let speedMul = 1.0;
    let rafId = 0;

    const wrap = document.createElement('div');
    wrap.id = 'jg_anime_duel_ov';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#050814;display:flex;align-items:center;justify-content:center;user-select:none;overflow:hidden;';

    const cv = document.createElement('canvas');
    cv.style.cssText = 'width:100%;height:100%;display:block;';
    wrap.appendChild(cv);

    const ctrlBox = document.createElement('div');
    ctrlBox.style.cssText = 'position:absolute;top:16px;right:18px;display:flex;gap:10px;z-index:10;';
    const btnSpd = document.createElement('button');
    btnSpd.textContent = '⏩ 2× 빠른 진행';
    btnSpd.style.cssText = 'padding:8px 14px;border-radius:99px;border:1.5px solid #ffd54a;background:rgba(15,23,42,0.85);color:#ffd54a;font-weight:800;font-size:13px;cursor:pointer;';
    const btnSkip = document.createElement('button');
    btnSkip.textContent = '⏭ 건너뛰기';
    btnSkip.style.cssText = 'padding:8px 16px;border-radius:99px;border:1.5px solid #fff;background:linear-gradient(180deg,#e53935,#b71c1c);color:#fff;font-weight:900;font-size:13px;cursor:pointer;';
    ctrlBox.appendChild(btnSpd);
    ctrlBox.appendChild(btnSkip);
    wrap.appendChild(ctrlBox);
    document.body.appendChild(wrap);

    const cleanup = () => {
      if (finished) return;
      finished = true;
      if (rafId) cancelAnimationFrame(rafId);
      wrap.style.transition = 'opacity 0.25s ease';
      wrap.style.opacity = '0';
      setTimeout(() => {
        try { wrap.remove(); } catch (e) {}
        if (typeof onComplete === 'function') onComplete(winS);
      }, 250);
    };

    btnSpd.onclick = (e) => {
      e.stopPropagation();
      speedMul = speedMul === 1.0 ? 2.0 : 1.0;
      btnSpd.textContent = speedMul > 1 ? '⚡ 2× 적용중' : '⏩ 2× 빠른 진행';
    };
    btnSkip.onclick = (e) => { e.stopPropagation(); cleanup(); };

    const g = cv.getContext('2d');
    let elapsed = 0;
    let lastT = performance.now();
    const TOTAL_DUR = 4.6;

    function renderWarlordDuel(now) {
      if (finished) return;
      const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)) * speedMul;
      lastT = now;
      elapsed += dt;
      const t = elapsed;

      const W = window.innerWidth || 960;
      const H = window.innerHeight || 540;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const S = Math.min(W, H);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      // 여포 등 강타 시 화면 진동
      if (t >= 1.0 && t < 2.7 && (leftW.id === 'lvbu' || rightW.id === 'lvbu' || leftW.id === 'caocao')) {
        g.translate(Math.sin(t * 75) * 5, Math.cos(t * 68) * 4);
      }

      // 1) 양 군주 고유 세력 컬러 대각선 배경
      const splitShift = t >= 1.0 && t < 2.7 ? Math.sin(t * 42) * S * 0.02 : 0;
      const bgL = g.createLinearGradient(0, 0, W * 0.6, H);
      bgL.addColorStop(0, '#090d16');
      bgL.addColorStop(1, leftW.primary);
      g.fillStyle = bgL;
      g.beginPath();
      g.moveTo(0, 0); g.lineTo(W * 0.54 + splitShift, 0); g.lineTo(W * 0.46 + splitShift, H); g.lineTo(0, H);
      g.closePath(); g.fill();

      const bgR = g.createLinearGradient(W * 0.4, 0, W, H);
      bgR.addColorStop(0, rightW.primary);
      bgR.addColorStop(1, '#090d16');
      g.fillStyle = bgR;
      g.beginPath();
      g.moveTo(W * 0.54 + splitShift, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(W * 0.46 + splitShift, H);
      g.closePath(); g.fill();

      // 2) 군주 위치 계산
      let lx = W * 0.25, ly = H * 0.54;
      let rx = W * 0.75, ry = H * 0.54;
      let lScale = 1.0, rScale = 1.0;

      if (t < 0.9) {
        const u = 1 - Math.pow(1 - t / 0.9, 3);
        lx = -S * 0.15 + (W * 0.28 + S * 0.15) * u;
        rx = W + S * 0.15 - (W * 0.28 + S * 0.15) * u;
      } else if (t < 2.7) {
        const clash = Math.sin((t - 0.9) * 14);
        lx = W * 0.39 + clash * S * 0.045;
        rx = W * 0.61 - clash * S * 0.045;
        lScale = 1.15;
        rScale = 1.15;
      } else {
        const u = Math.min(1, (t - 2.7) / 0.5);
        if (playerWon) {
          lx = W * 0.39 + (W * 0.50 - W * 0.39) * u;
          rx = W * 0.61 + S * 0.28 * u;
          lScale = 1.35;
          rScale = 0.82;
        } else {
          rx = W * 0.61 - (W * 0.61 - W * 0.50) * u;
          lx = W * 0.39 - S * 0.28 * u;
          rScale = 1.35;
          lScale = 0.82;
        }
      }

      // 3) 군주별 고유 필살기 이펙트 (0.9 ~ 2.8s)
      if (t >= 0.9 && t < 2.85) {
        drawWarlordDuelSignatureFX(g, leftW, lx, ly, W * 0.5, H * 0.52, S, t, 1);
        drawWarlordDuelSignatureFX(g, rightW, rx, ry, W * 0.5, H * 0.52, S, t, -1);
      }

      // 4) 양 군주 대형 메달리온 & 무기 명판 렌더링
      drawDuelWarlordHero(g, leftW, lx, ly, S * 0.15 * lScale, t, playerWon && t >= 2.7);
      drawDuelWarlordHero(g, rightW, rx, ry, S * 0.15 * rScale, -t, !playerWon && t >= 2.7);

      // 5) 상단 타이틀 & 하단 대사 자막
      g.save();
      g.textAlign = 'center';
      g.font = `900 ${Math.round(S * 0.052)}px 'Malgun Gothic', sans-serif`;
      g.lineWidth = Math.max(4, S * 0.01);
      g.strokeStyle = '#000';
      g.fillStyle = '#fde047';

      const topText = t < 0.9
        ? `⚔️ ${leftW.name}(${leftW.weapon}) VS ${rightW.name}(${rightW.weapon})`
        : (t < 2.7
          ? `💥 [${leftW.duelSkill.split('·')[0].trim()}] VS [${rightW.duelSkill.split('·')[0].trim()}]`
          : (playerWon
            ? `👑 ${leftW.name} 일기토 승리! — ${winS === 'c' ? '초(楚)' : '한(漢)'} 선공 획득!`
            : `🔥 ${rightW.name} 일기토 승리! — ${winS === 'c' ? '초(楚)' : '한(漢)'} 선공 획득!`));
      g.strokeText(topText, W * 0.5, H * 0.12);
      g.fillText(topText, W * 0.5, H * 0.12);

      // 하단 군주 고유 대사 박스
      const quoteText = t < 0.9
        ? `${leftW.icon} ${leftW.name}: "${leftW.duelLines.intro}"`
        : (t < 2.7
          ? `⚡ ${leftW.duelLines.clash}  /  ${rightW.duelLines.clash}`
          : (playerWon
            ? `${leftW.icon} ${leftW.name}: "${leftW.duelLines.win}"`
            : `${rightW.icon} ${rightW.name}: "${rightW.duelLines.win}"`));

      g.fillStyle = 'rgba(5, 8, 20, 0.82)';
      g.fillRect(W * 0.08, H * 0.82, W * 0.84, S * 0.095);
      g.strokeStyle = '#fde047';
      g.lineWidth = 2;
      g.strokeRect(W * 0.08, H * 0.82, W * 0.84, S * 0.095);

      g.fillStyle = '#fef08a';
      g.font = `800 ${Math.round(S * 0.032)}px 'Malgun Gothic', sans-serif`;
      g.fillText(quoteText, W * 0.5, H * 0.875);
      g.restore();

      if (t < TOTAL_DUR) {
        rafId = requestAnimationFrame(renderWarlordDuel);
      } else {
        cleanup();
      }
    }

    rafId = requestAnimationFrame(renderWarlordDuel);
  };

  function drawDuelWarlordHero(g, w, x, y, r, t, isWinner) {
    g.save();
    g.translate(x, y);
    g.shadowColor = isWinner ? '#fde047' : w.primary;
    g.shadowBlur = isWinner ? 36 : 18;

    // 외곽 육각/원형 룬
    g.save();
    g.rotate(t * 1.2);
    g.strokeStyle = w.secondary;
    g.lineWidth = 4;
    g.setLineDash([14, 8]);
    g.beginPath(); g.arc(0, 0, r * 1.22, 0, Math.PI * 2); g.stroke();
    g.restore();

    g.fillStyle = '#0f172a';
    g.strokeStyle = isWinner ? '#fde047' : w.primary;
    const ctxStrokeWidth = isWinner ? 6 : 4;
    g.lineWidth = ctxStrokeWidth;
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.stroke();

    g.shadowBlur = 0;
    g.font = `${Math.round(r * 0.92)}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(w.icon, 0, -r * 0.08);

    g.fillStyle = '#fff';
    g.font = `900 ${Math.round(r * 0.34)}px 'Malgun Gothic', sans-serif`;
    g.fillText(`${w.name}(${w.hanja})`, 0, r * 0.56);
    g.restore();
  }

  function drawWarlordDuelSignatureFX(g, w, sx, sy, cx, cy, S, t, dir) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    if (w.id === 'liubei') {
      // 자웅일대검 비취 쌍검기 + 도원 꽃잎
      for (let k = -1; k <= 1; k += 2) {
        g.strokeStyle = k === -1 ? '#10b981' : '#fbbf24';
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(sx, sy + k * 25);
        g.quadraticCurveTo((sx + cx) * 0.5, cy + Math.sin(t * 18 + k) * 90, cx, cy);
        g.stroke();
      }
    } else if (w.id === 'caocao') {
      // 패왕 적홍 낙뢰
      g.strokeStyle = '#ef4444';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(cx - dir * S * 0.1, cy - S * 0.38);
      g.lineTo(cx, cy - S * 0.12);
      g.lineTo(cx + dir * S * 0.08, cy + S * 0.05);
      g.lineTo(cx, cy + S * 0.25);
      g.stroke();
    } else if (w.id === 'sunquan') {
      // 청룡 해일 파동
      for (let r = 1; r <= 3; r++) {
        g.strokeStyle = 'rgba(6, 182, 212, 0.75)';
        g.lineWidth = 5;
        g.beginPath();
        g.arc(sx, sy, ((t * 260 + r * 70) % (S * 0.45)), -0.7, 0.7);
        g.stroke();
      }
    } else if (w.id === 'lvbu') {
      // 방천화극 거대 초승달 참격
      g.strokeStyle = '#d946ef';
      g.lineWidth = 10;
      g.beginPath();
      g.arc(cx, cy, S * 0.24, t * 8, t * 8 + Math.PI * 1.1);
      g.stroke();
    } else if (w.id === 'zhuge') {
      // 팔진도 북두칠성 광선
      g.strokeStyle = '#fde047';
      g.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const ang = t * 2 + (i * Math.PI) / 3;
        g.beginPath();
        g.moveTo(cx + Math.cos(ang) * S * 0.22, cy + Math.sin(ang) * S * 0.22);
        g.lineTo(cx, cy);
        g.stroke();
      }
    } else {
      // 사마의 빙결 늑대 발톱
      g.strokeStyle = '#818cf8';
      g.lineWidth = 5;
      for (let c = -1; c <= 1; c++) {
        g.beginPath();
        g.moveTo(cx - S * 0.16, cy + c * 26 - 30);
        g.lineTo(cx + S * 0.16, cy + c * 26 + 30);
        g.stroke();
      }
    }
    g.restore();
  }

  /* --------------------------------------------------------------------------
   * 8. 장기 플레이 중 군주별 특별 문구 · 보드 이펙트 · 전용 행동 시스템
   * -------------------------------------------------------------------------- */
  const activeBoardEffects = [];

  function spawnWarlordBoardEffect(warlordId, gx, gy, intensity = 1) {
    const w = getWarlord(warlordId);
    activeBoardEffects.push({
      w,
      gx: typeof gx === 'number' ? gx : 4,
      gy: typeof gy === 'number' ? gy : 4.5,
      t0: performance.now(),
      dur: intensity > 1 ? 2400 : 1500,
      intensity
    });
  }

  // 대국 중 군주 컷인 배너 표시
  window.showWarlordCutin = function(warlordId, label, quoteText, gx, gy, intensity = 1) {
    injectStyles();
    const w = getWarlord(warlordId);
    let el = document.getElementById('jg_warlord_cutin');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jg_warlord_cutin';
      document.body.appendChild(el);
    }
    el.innerHTML = `
      <div class="jg-cutin-inner" style="background:${w.bgGrad};border-color:${w.secondary};">
        <div class="jg-cutin-seal" style="border-color:${w.secondary};">
          <span>${w.icon}</span>
          <b>${w.hanja}</b>
        </div>
        <div class="jg-cutin-msg">
          <div class="jg-cutin-title">${w.name} · ${label}</div>
          <div class="jg-cutin-quote">"${quoteText}"</div>
        </div>
      </div>
    `;
    el.classList.add('show');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove('show'), intensity > 1 ? 3200 : 2300);

    spawnWarlordBoardEffect(warlordId, gx, gy, intensity);

    // 채팅/해설 로그에도 군주 대사 기록
    const xlog = document.getElementById('xlog');
    if (xlog) {
      const p = document.createElement('div');
      p.style.cssText = `padding:3px 6px;margin:2px 0;border-left:3px solid ${w.secondary};font-size:11.5px;color:#fef08a;background:rgba(15,23,42,0.55);`;
      p.textContent = `${w.icon} [${w.name}] "${quoteText}"`;
      xlog.appendChild(p);
      xlog.scrollTop = xlog.scrollHeight;
    }
  };

  // 플레이어 전용 특수 행동 발동 (대국당 1회)
  window.triggerMyWarlordAction = function() {
    if (window.__JG_WARLORD_ACT_USED__) return;
    window.__JG_WARLORD_ACT_USED__ = true;
    const w = getWarlord(window.JG_MY_WARLORD);
    playWarlordSfx('action');
    window.showWarlordCutin(w.id, `${w.actionName} 발동!!`, w.quotes.action, 4, 4.5, 2);

    // 여포/조조 등 강렬한 행동 시 보드 캔버스 진동 효과
    const cvEl = document.getElementById('cv');
    if (cvEl) {
      cvEl.animate([
        { transform: 'translate(0,0)' },
        { transform: 'translate(-6px, 4px)' },
        { transform: 'translate(6px, -4px)' },
        { transform: 'translate(-4px, -3px)' },
        { transform: 'translate(0,0)' }
      ], { duration: 420 });
    }

    // 멀티플레이어 동기화 전송
    if (typeof bcast === 'function') {
      try { bcast({ k: 'warlord_act', id: w.id, kind: 'action' }); } catch (e) {}
    }
    updateInGameWarlordPanel();
  };

  // 플레이어 군주 명언 외치기 (쿨다운 8초)
  window.triggerMyWarlordShout = function() {
    const now = Date.now();
    if (now < window.__JG_WARLORD_SHOUT_CD__) return;
    window.__JG_WARLORD_SHOUT_CD__ = now + 8000;
    const w = getWarlord(window.JG_MY_WARLORD);
    playWarlordSfx('select');
    window.showWarlordCutin(w.id, '군주 호령', w.quotes.shout, 4, (typeof me !== 'undefined' && me === 'h') ? 1 : 8, 1);
    if (typeof bcast === 'function') {
      try { bcast({ k: 'warlord_act', id: w.id, kind: 'shout' }); } catch (e) {}
    }
  };

  function updateInGameWarlordPanel() {
    injectStyles();
    const xsp = document.getElementById('xsp');
    const xact = document.getElementById('xact');
    if (!xsp || !xact) return;

    let panel = document.getElementById('jg_warlord_panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'jg_warlord_panel';
      xsp.insertBefore(panel, xact);
    }

    const w = getWarlord(window.JG_MY_WARLORD);
    const used = !!window.__JG_WARLORD_ACT_USED__;
    panel.innerHTML = `
      <div class="jg-wp-info">
        <div class="jg-wp-ico" style="background:${w.bgGrad};border-color:${w.secondary};">${w.icon}</div>
        <div class="jg-wp-txt">
          <b>${w.name} (${w.hanja})</b>
          <small>${w.weapon}</small>
        </div>
      </div>
      <div class="jg-wp-btns">
        <button type="button" class="jg-wp-btn" id="jg_wl_act_btn" ${used ? 'disabled' : ''} style="background:${w.bgGrad};border-color:${w.secondary};">
          ${used ? '✓ 발동완료' : w.actionName}
        </button>
        <button type="button" class="jg-wp-btn" id="jg_wl_shout_btn" style="background:#1e293b;border-color:#94a3b8;">
          💬 호령
        </button>
      </div>
    `;
    document.getElementById('jg_wl_act_btn').onclick = window.triggerMyWarlordAction;
    document.getElementById('jg_wl_shout_btn').onclick = window.triggerMyWarlordShout;
  }

  // 장기판 좌표 기반 60FPS 군주 전용 특수 이펙트 오버레이 캔버스
  function initWarlordBoardFxLoop() {
    if (document.getElementById('jg_warlord_fx_cv')) return;
    const fcv = document.createElement('canvas');
    fcv.id = 'jg_warlord_fx_cv';
    fcv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:16;';
    document.body.appendChild(fcv);
    const fg = fcv.getContext('2d');

    function loopFx(now) {
      requestAnimationFrame(loopFx);
      if (!activeBoardEffects.length) {
        if (fcv.width > 0) fg.clearRect(0, 0, fcv.width, fcv.height);
        return;
      }
      const W = window.innerWidth || 960;
      const H = window.innerHeight || 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (fcv.width !== Math.round(W * dpr) || fcv.height !== Math.round(H * dpr)) {
        fcv.width = Math.round(W * dpr);
        fcv.height = Math.round(H * dpr);
      }
      fg.setTransform(dpr, 0, 0, dpr, 0, 0);
      fg.clearRect(0, 0, W, H);

      for (let i = activeBoardEffects.length - 1; i >= 0; i--) {
        const ef = activeBoardEffects[i];
        const p = (now - ef.t0) / ef.dur;
        if (p >= 1) {
          activeBoardEffects.splice(i, 1);
          continue;
        }
        let cx = W * 0.5, cy = H * 0.5, cell = 44;
        if (typeof px === 'function' && typeof C !== 'undefined') {
          const pt = px(ef.gx, ef.gy);
          cx = pt[0]; cy = pt[1]; cell = C;
        }
        const alpha = Math.sin(p * Math.PI);
        const rad = cell * (1.2 + p * 2.8 * ef.intensity);

        fg.save();
        fg.globalCompositeOperation = 'lighter';
        fg.globalAlpha = Math.min(1, alpha * 1.15);

        // 군주별 고유 보드 이펙트 렌더링
        if (ef.w.id === 'liubei') {
          // 도원 벚꽃 & 비취 쌍검 파동
          fg.strokeStyle = '#10b981';
          fg.lineWidth = 4;
          fg.beginPath(); fg.arc(cx, cy, rad, 0, Math.PI * 2); fg.stroke();
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2 + p * 4;
            const r2 = rad * 0.85;
            fg.fillStyle = k % 2 === 0 ? '#fbcfe8' : '#fde047';
            fg.beginPath();
            fg.arc(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, 4.5, 0, Math.PI * 2);
            fg.fill();
          }
        } else if (ef.w.id === 'caocao') {
          // 패왕 적홍 뇌전 & 화염 고리
          fg.strokeStyle = '#ef4444';
          fg.lineWidth = 5;
          fg.beginPath(); fg.arc(cx, cy, rad, 0, Math.PI * 2); fg.stroke();
          fg.strokeStyle = '#fbbf24';
          fg.lineWidth = 2.5;
          for (let b = 0; b < 6; b++) {
            const ang = (b / 6) * Math.PI * 2 + p * 3;
            fg.beginPath();
            fg.moveTo(cx, cy);
            fg.lineTo(cx + Math.cos(ang + 0.2) * rad * 0.55, cy + Math.sin(ang + 0.2) * rad * 0.55);
            fg.lineTo(cx + Math.cos(ang) * rad * 1.15, cy + Math.sin(ang) * rad * 1.15);
            fg.stroke();
          }
        } else if (ef.w.id === 'sunquan') {
          // 청룡 해일 동심원 + 불화살 입자
          for (let ring = 0; ring < 3; ring++) {
            fg.strokeStyle = ring === 1 ? '#f97316' : '#06b6d4';
            fg.lineWidth = 4 - ring;
            fg.beginPath(); fg.arc(cx, cy, rad * (0.55 + ring * 0.25), 0, Math.PI * 2); fg.stroke();
          }
        } else if (ef.w.id === 'lvbu') {
          // 방천화극 자색·진홍 십자 참격
          fg.strokeStyle = '#d946ef';
          fg.lineWidth = 7;
          fg.beginPath();
          fg.moveTo(cx - rad, cy - rad * 0.7); fg.lineTo(cx + rad, cy + rad * 0.7);
          fg.moveTo(cx + rad, cy - rad * 0.7); fg.lineTo(cx - rad, cy + rad * 0.7);
          fg.stroke();
        } else if (ef.w.id === 'zhuge') {
          // 팔괘 별자리 마법진
          fg.strokeStyle = '#fde047';
          fg.lineWidth = 3;
          fg.save();
          fg.translate(cx, cy);
          fg.rotate(p * 3);
          fg.strokeRect(-rad * 0.65, -rad * 0.65, rad * 1.3, rad * 1.3);
          fg.rotate(Math.PI / 4);
          fg.strokeRect(-rad * 0.65, -rad * 0.65, rad * 1.3, rad * 1.3);
          fg.restore();
        } else {
          // 사마의 빙청 늑대 결계 파편
          fg.strokeStyle = '#818cf8';
          fg.lineWidth = 4;
          for (let s = 0; s < 8; s++) {
            const a = (s / 8) * Math.PI * 2 - p * 2.5;
            fg.beginPath();
            fg.moveTo(cx + Math.cos(a) * rad * 0.3, cy + Math.sin(a) * rad * 0.3);
            fg.lineTo(cx + Math.cos(a) * rad * 1.1, cy + Math.sin(a) * rad * 1.1);
            fg.stroke();
          }
        }
        fg.restore();
      }
    }
    requestAnimationFrame(loopFx);
  }

  /* --------------------------------------------------------------------------
   * 9. 기존 게임 함수(startAI, begin, doMove, fin, end, onData, #dc 감시) 안전 후킹
   * -------------------------------------------------------------------------- */
  function hookGameLifecycle() {
    updateLobbyWarlordBadge();
    initWarlordBoardFxLoop();

    // 1) AI 대전 시작 전 군주 선택 모달 강제 선행
    if (typeof window.startAI === 'function' && !window.startAI.__wlHooked) {
      const origStartAI = window.startAI;
      const wrappedStartAI = function(isCoach) {
        if (!window.__JG_WARLORD_MATCH_READY__) {
          window.openWarlordSelectModal({
            mode: isCoach ? 'coach' : 'ai',
            onConfirm: (pickedId) => {
              window.JG_MY_WARLORD = pickedId;
              window.JG_OPP_WARLORD = pickDistinctAiWarlord(pickedId);
              window.__JG_WARLORD_MATCH_READY__ = true;
              origStartAI.call(this, isCoach);
            }
          });
          return;
        }
        return origStartAI.apply(this, arguments);
      };
      wrappedStartAI.__wlHooked = true;
      window.startAI = wrappedStartAI;
    }

    // 2) 일기토 모달(#dc)이 열릴 때 군주 선택 여부 체크 & 일기토 UI 강화
    const dc = document.getElementById('dc');
    if (dc && !dc.dataset.wlObserved) {
      dc.dataset.wlObserved = '1';
      const obs = new MutationObserver(() => {
        const isShown = dc.style.display && dc.style.display !== 'none';
        if (!isShown) return;

        if (!window.__JG_WARLORD_MATCH_READY__) {
          dc.style.display = 'none';
          window.openWarlordSelectModal({
            mode: (typeof cfg !== 'undefined' && cfg.mode === 'mp') ? 'mp' : 'ai',
            onConfirm: (pickedId) => {
              window.JG_MY_WARLORD = pickedId;
              if (typeof cfg === 'undefined' || cfg.mode !== 'mp') {
                window.JG_OPP_WARLORD = pickDistinctAiWarlord(pickedId);
              } else if (typeof bcast === 'function') {
                try { bcast({ k: 'warlord_pick', id: pickedId }); } catch (e) {}
              }
              window.__JG_WARLORD_MATCH_READY__ = true;
              dc.style.display = 'flex';
              enhanceDuelModalWithWarlords();
            }
          });
        } else {
          enhanceDuelModalWithWarlords();
        }
      });
      obs.observe(dc, { attributes: true, attributeFilter: ['style'] });
    }

    // 3) 대국 시작(begin) 시 군주 패널 초기화 & 출사표 연출
    if (typeof window.begin === 'function' && !window.begin.__wlHooked) {
      const origBegin = window.begin;
      const wrappedBegin = function(m, sc, sh, mode) {
        const res = origBegin.apply(this, arguments);
        window.__JG_WARLORD_MATCH_READY__ = false; // 다음 대국/다시하기 때 다시 선택 가능하도록 초기화
        window.__JG_WARLORD_ACT_USED__ = false;
        window.__JG_WARLORD_AI_ACTED__ = false;
        if (!window.JG_OPP_WARLORD || window.JG_OPP_WARLORD === window.JG_MY_WARLORD) {
          window.JG_OPP_WARLORD = pickDistinctAiWarlord(window.JG_MY_WARLORD);
        }
        updateInGameWarlordPanel();

        // HUD에 군주 아이콘 표시
        const myW = getWarlord(window.JG_MY_WARLORD);
        const oppW = getWarlord(window.JG_OPP_WARLORD);
        const nc = document.getElementById('nc');
        const nh = document.getElementById('nh');
        if (nc && nh) {
          if (m === 'c') {
            nc.textContent = `${myW.icon} ${nc.textContent}`;
            nh.textContent = `${oppW.icon} ${nh.textContent}`;
          } else {
            nh.textContent = `${myW.icon} ${nh.textContent}`;
            nc.textContent = `${oppW.icon} ${nc.textContent}`;
          }
        }

        setTimeout(() => {
          window.showWarlordCutin(myW.id, '전군 출진!', myW.quotes.start, 4, m === 'h' ? 1 : 8, 1);
        }, 650);
        return res;
      };
      wrappedBegin.__wlHooked = true;
      window.begin = wrappedBegin;
    }

    // 4) 기물 이동 및 포획 시(doMove) 군주별 특별 대사 & 보드 이펙트
    if (typeof window.doMove === 'function' && !window.doMove.__wlHooked) {
      const origDoMove = window.doMove;
      const wrappedDoMove = function(m) {
        const moverSide = typeof turn !== 'undefined' ? turn : 'c';
        const targetPiece = (typeof B !== 'undefined' && B[m[3]]) ? B[m[3]][m[2]] : null;
        const res = origDoMove.apply(this, arguments);

        if (targetPiece) {
          const isMe = (typeof me !== 'undefined' && moverSide === me);
          const w = getWarlord(isMe ? window.JG_MY_WARLORD : window.JG_OPP_WARLORD);
          const isBig = (targetPiece.t === 'R' || targetPiece.t === 'C'); // 차(R)·포(C) 격파
          const qTxt = isBig ? w.quotes.captureBig : w.quotes.capture;
          window.showWarlordCutin(w.id, isBig ? '주력 격파!!' : '적군 격파!', qTxt, m[2], m[3], isBig ? 1.6 : 1);
        } else if (typeof mc !== 'undefined' && mc === 12 && typeof cfg !== 'undefined' && cfg.mode === 'ai' && !window.__JG_WARLORD_AI_ACTED__) {
          // AI 중반 특수 행동 발동
          window.__JG_WARLORD_AI_ACTED__ = true;
          const oppW = getWarlord(window.JG_OPP_WARLORD);
          setTimeout(() => {
            if (typeof over !== 'undefined' && !over) {
              playWarlordSfx('action');
              window.showWarlordCutin(oppW.id, `${oppW.actionName} 발동!`, oppW.quotes.action, 4, 4.5, 1.8);
            }
          }, 900);
        }
        return res;
      };
      wrappedDoMove.__wlHooked = true;
      window.doMove = wrappedDoMove;
    }

    // 5) 장군(chk) 발생 시(fin) 군주별 장군 호령 연출
    if (typeof window.fin === 'function' && !window.fin.__wlHooked) {
      const origFin = window.fin;
      const wrappedFin = function() {
        const attackerSide = (typeof anim !== 'undefined' && anim && anim.p) ? anim.p.s : null;
        const defenderSide = (typeof anim !== 'undefined' && anim) ? anim.o : null;
        const res = origFin.apply(this, arguments);

        if (typeof jang !== 'undefined' && jang && attackerSide) {
          const isMeAtk = (typeof me !== 'undefined' && attackerSide === me);
          const atkW = getWarlord(isMeAtk ? window.JG_MY_WARLORD : window.JG_OPP_WARLORD);
          window.showWarlordCutin(atkW.id, '장군(將軍) 호령!', atkW.quotes.check, 4, defenderSide === 'h' ? 1 : 8, 1.5);
        }
        return res;
      };
      wrappedFin.__wlHooked = true;
      window.fin = wrappedFin;
    }

    // 6) 대국 종료(end) 시 승리 군주 천하통일 배너
    if (typeof window.end === 'function' && !window.end.__wlHooked) {
      const origEnd = window.end;
      const wrappedEnd = function(wSide, msg) {
        const res = origEnd.apply(this, arguments);
        if (wSide === 'c' || wSide === 'h') {
          const isMeWin = (typeof me !== 'undefined' && wSide === me);
          const winW = getWarlord(isMeWin ? window.JG_MY_WARLORD : window.JG_OPP_WARLORD);
          const os = document.getElementById('os');
          if (os) {
            os.innerHTML = `<div style="margin-top:6px;padding:8px 12px;border-radius:10px;background:${winW.bgGrad};border:1.5px solid ${winW.secondary};color:#fef08a;font-weight:800;font-size:13px;">${winW.icon} ${winW.name}: "${winW.quotes.victory}"</div>`;
          }
        }
        return res;
      };
      wrappedEnd.__wlHooked = true;
      window.end = wrappedEnd;
    }

    // 7) 멀티플레이어 PeerJS 수신 데이터(onData) 군주 동기화
    if (typeof window.onData === 'function' && !window.onData.__wlHooked) {
      const origOnData = window.onData;
      const wrappedOnData = function(d) {
        if (d && d.k === 'warlord_pick' && d.id) {
          window.JG_OPP_WARLORD = d.id;
          enhanceDuelModalWithWarlords();
          return;
        }
        if (d && d.k === 'warlord_act' && d.id) {
          const oppW = getWarlord(d.id);
          playWarlordSfx('action');
          const txt = d.kind === 'shout' ? oppW.quotes.shout : oppW.quotes.action;
          const lbl = d.kind === 'shout' ? '상대 군주 호령' : `상대 ${oppW.actionName} 발동!`;
          window.showWarlordCutin(oppW.id, lbl, txt, 4, 4.5, d.kind === 'shout' ? 1 : 2);
          return;
        }
        return origOnData.apply(this, arguments);
      };
      wrappedOnData.__wlHooked = true;
      window.onData = wrappedOnData;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookGameLifecycle);
  } else {
    hookGameLifecycle();
  }
  setTimeout(hookGameLifecycle, 400);
})();
