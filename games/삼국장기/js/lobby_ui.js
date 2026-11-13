const SP={h:{},c:{}};
(function initSpriteSheetSlicer(){
  const CELL=140;
  const ROW_SPEC=[
    {key:'xform',count:6},
    {key:'walk',count:8},
    {key:'atk',count:8},
    {key:'hit',count:6},
    {key:'dead',count:8},
    {key:'rev',count:6}
  ];
  for(const s of ['h','c']){
    for(const t of ['R','K','G','C','N','B','P']){
      const pObj={token:[],xform:[],walk:[],dash:[],atk:[],hit:[],dead:[],rev:[]};
      SP[s][t]=pObj;
      const sheetImg=new Image();
      sheetImg.onload=function(){
        for(let r=0;r<ROW_SPEC.length;r++){
          const spec=ROW_SPEC[r],frames=[];
          for(let c=0;c<spec.count;c++){
            const cv=document.createElement('canvas');
            cv.width=CELL;cv.height=CELL;
            const ctx=cv.getContext('2d');
            ctx.drawImage(sheetImg,c*CELL,r*CELL,CELL,CELL,0,0,CELL,CELL);
            if(s==='c'&&r===0&&c===0){
              try{
                const id=ctx.getImageData(0,0,CELL,CELL),d=id.data;
                for(let py=33;py<=107;py++){
                  for(let px=33;px<=107;px++){
                    const dx=Math.abs(px-70),dy=Math.abs(py-70);
                    if(dx>35||dy>35||dx+dy>52)continue;
                    const idx=(py*CELL+px)*4,R=d[idx],G=d[idx+1],B=d[idx+2],A=d[idx+3];
                    if(A<120)continue;
                    const gb=G-B,lum=0.299*R+0.587*G+0.114*B;
                    if(t==='N'||t==='B'||t==='K'||t==='P'){
                      if(gb>3){
                        const k=Math.min(1,(gb-3)/26);
                        d[idx]=Math.round(R*(1-k)+255*k);
                        d[idx+1]=Math.round(G*(1-k)+246*k);
                        d[idx+2]=Math.round(B*(1-k)+195*k);
                      }else if(gb>-6&&lum<82){
                        d[idx]=Math.round(R*0.35);
                        d[idx+1]=Math.round(G*0.38);
                        d[idx+2]=Math.round(B*0.42);
                      }
                    }else if(t==='G'){
                      if(lum<86){
                        const k=Math.min(1,(86-lum)/32);
                        d[idx]=Math.round(R*(1-k)+255*k);
                        d[idx+1]=Math.round(G*(1-k)+246*k);
                        d[idx+2]=Math.round(B*(1-k)+195*k);
                      }
                    }
                  }
                }
                ctx.putImageData(id,0,0);
              }catch(e){}
            }
            cv.complete=true;
            frames.push({im:cv,w:CELL,h:CELL});
          }
          pObj[spec.key]=frames;
          if(spec.key==='xform')pObj.token=[frames[0]];
          if(spec.key==='walk')pObj.dash=frames;
        }
        if(typeof resize==='function')try{resize()}catch(e){}
      };
      sheetImg.src=SHEET_B64[s][t];
    }
  }
})();
const $=id=>document.getElementById(id);
/* ===== 세로/커버 화면 대응: 가로 레이아웃으로 강제 회전 ===== */
function fitScreen(){
  try{
    const w=innerWidth,h=innerHeight,g=$('g'),inG=!!g&&getComputedStyle(g).display!=='none';
    const rot=h>=w&&!inG,mh=rot?w:h,mw=rot?h:w,rs=document.documentElement;
    rs.style.setProperty('--mh',mh+'px');rs.style.setProperty('--mw',mw+'px');
    rs.classList.toggle('sh',mh<520);
    const els=Array.from(document.querySelectorAll('.mdl'));const tw=$('tw');if(tw)els.push(tw);
    els.forEach(el=>{const s=el.style;
      if(rot){s.top='0px';s.left=w+'px';s.right='auto';s.bottom='auto';s.width=h+'px';s.height=w+'px';s.transformOrigin='top left';s.transform='rotate(90deg)'}
      else{s.top='';s.left='';s.right='';s.bottom='';s.width='';s.height='';s.transformOrigin='';s.transform=''}});
    if(typeof resize==='function') try{ resize(); }catch(e){}
    window.dispatchEvent(new Event('jg-fit'));
  }catch(e){ console.error('fitScreen', e); }
}
fitScreen();
setTimeout(fitScreen, 100);
setTimeout(fitScreen, 400);
addEventListener('resize', fitScreen);
addEventListener('orientationchange', () => { setTimeout(fitScreen, 50); setTimeout(fitScreen, 300); });
if(window.visualViewport){
  visualViewport.addEventListener('resize', fitScreen);
  visualViewport.addEventListener('scroll', fitScreen);
}
document.addEventListener('visibilitychange', () => { if(!document.hidden) setTimeout(fitScreen, 50); });
try{new MutationObserver(()=>fitScreen()).observe($('g'),{attributes:true,attributeFilter:['style']})}catch(e){}
const SETUPS=[['마상마상','왼상차림','RNBG.GNBR','마·상이 같은 쪽에 묶여 좌우 균형이 좋은 기본형'],['상마상마','오른상차림','RBNG.GBNR','상이 바깥에서 마를 받쳐 주는 안정형'],['마상상마','안상차림','RNBG.GBNR','상이 안쪽에 모여 중앙 수비가 단단한 형'],['상마마상','바깥상차림','RBNG.GNBR','마가 안쪽에 있어 중앙 공격에 빨리 가담하는 형']];
let cfg={mode:'ai',lv:'고수',time:45,si:0},turn='c',over=false,inGame=false,busy=false,sel=null,lm=null,anim=null,jang=null,tleft=0,tint,conn=null,peer=null,cv,cx2,W,H,C,CX,CY,OX,OY,flip=false,bc,me='c',hostSide='c',looping=false,wk=null,aiId=0,aiWd,AC;
const toast=(t,ms=3500)=>{const e=$('tt');e.textContent=t;e.style.display='block';clearTimeout(toast.i);toast.i=setTimeout(()=>e.style.display='none',ms)};
const NK='jg_nick_perm';
function loadNick(){try{const c=document.cookie.match(/(?:^|;\s*)jg_nick_perm=([^;]*)/);return localStorage.getItem(NK)||localStorage.getItem('jg_nick')||sessionStorage.getItem(NK)||(c?decodeURIComponent(c[1]):'')||''}catch(e){return ''}}
function saveNick(v){const s=String(v||'').trim();if(!s)return;try{localStorage.setItem(NK,s);localStorage.setItem('jg_nick',s)}catch(e){}try{sessionStorage.setItem(NK,s)}catch(e){}try{document.cookie='jg_nick_perm='+encodeURIComponent(s)+';max-age=315360000;path=/;SameSite=Lax'}catch(e){}}
const nick=()=>{const el=$('ni'),el2=$('ni_ai'),v=(el&&el.value.trim())||(el2&&el2.value.trim())||loadNick();if(el&&!el.value&&v)el.value=v;if(el2&&!el2.value&&v)el2.value=v;return v||'플레이어'};
/* ---------- 화면 맞춤: 하단 내비게이션바에 가려지지 않게 ---------- */
const sab=()=>parseFloat(getComputedStyle($('sa')).paddingBottom)||0;
function fit(){const w=innerWidth,h=innerHeight,sb=sab(),st=$('st').style;document.documentElement.style.setProperty('--vh',h+'px');
if(h>=w){st.top='0px';st.left=w+'px';st.right='auto';st.bottom='auto';st.width=(h-sb)+'px';st.height=w+'px';st.transformOrigin='top left';st.transform='rotate(90deg)';st.padding='0'}else{st.top='';st.left='';st.right='';st.width='';st.height='';st.transform='';st.transformOrigin='';st.bottom=sb+'px';st.padding='0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)'}}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));if(window.visualViewport)visualViewport.addEventListener('resize',fit);fit();setTimeout(fit,300);setTimeout(fit,1200);

const SFN={R:'chariot',N:'horse',B:'elephant',P:'soldier',G:'guard',K:'king',C:'cannon'},SFXB={};let sfxInit=false;
function sfxLoad(){if(sfxInit)return;sfxInit=true;try{AC=AC||new(window.AudioContext||webkitAudioContext)();for(const k in SFXD){const bin=atob(SFXD[k].split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);AC.decodeAudioData(u.buffer,b=>{SFXB[k]=b},()=>{})}}catch(e){sfxInit=false}}
function sfx(k){try{if(!AC||!SFXB[k])return;if(AC.state=='suspended')AC.resume();const o=AC.createBufferSource(),g=AC.createGain();o.buffer=SFXB[k];g.gain.value=.9;o.connect(g);g.connect(AC.destination);o.start()}catch(e){}}
addEventListener('pointerdown',sfxLoad);
/* ---------- 시작 화면 (2단계 메인 메뉴: 멀티 대전 / AI 대전 선택형 리마스터) ---------- */
const FR=$('fr'),FW=2576,FH=1438;
FR.innerHTML=`
  <div id="lobby_wrap">
    <div class="lb-header">
      <div class="lb-title-box">
        <div class="lb-title">⚔️ 세미니의 멀티센터 전설장기</div>
        <div class="lb-sub" id="lb_top_sub">메인 메뉴에서 [멀티 대전] 또는 [AI 대전]을 선택하세요</div>
      </div>
      <div class="lb-top-btns">
        <button type="button" class="lb-util-btn" id="lb_kibo_quick_btn">📜 기보/훈수</button>
        <button type="button" class="lb-util-btn" id="lb_rec_btn">📊 멀티 전적</button>
        <button type="button" class="lb-util-btn rp" id="lb_rp_btn">🎬 리플레이</button>
      </div>
    </div>

    <!-- [1단계: 초기 메인 화면 - 큰 버튼 2개만 표시] -->
    <div class="lb-view active" id="lb_home_view">
      <div class="lb-hero-grid">
        <div class="lb-hero-btn mp" id="lb_go_mp">
          <div class="lb-hero-icon">👥</div>
          <div class="lb-hero-title">멀티 대전</div>
          <div class="lb-hero-desc">친구와 실시간 1:1 온라인 대국<br>초대코드 방 만들기 · 코드 입장 · 4인 관전</div>
          <div class="lb-hero-tags">
            <span class="lb-hero-tag">🔑 4자리 코드 초대</span>
            <span class="lb-hero-tag">📩 수락/거절 지원</span>
            <span class="lb-hero-tag">👁️ 실시간 훈수펜 관전</span>
          </div>
        </div>
        <div class="lb-hero-btn ai" id="lb_go_ai">
          <div class="lb-hero-icon">🤖</div>
          <div class="lb-hero-title">AI 대전</div>
          <div class="lb-hero-desc">삼국지 5단계 난이도별 도전 모드<br>장기 명국 기보 연구 · 실시간 AI 훈수 교육</div>
          <div class="lb-hero-tags">
            <span class="lb-hero-tag">🏆 난이도별 도전</span>
            <span class="lb-hero-tag">🎓 AI 훈수·교육모드</span>
            <span class="lb-hero-tag">📜 정석·명국 기보</span>
          </div>
        </div>
      </div>
    </div>

    <!-- [2단계-A: 멀티 대전 상세 화면] -->
    <div class="lb-view" id="lb_mp_view">
      <div class="lb-sub-top">
        <button type="button" class="lb-back-btn" id="lb_back_from_mp">⬅ 메인 메뉴로</button>
        <div style="font-size:max(11px,calc(1.35*var(--u)));font-weight:900;color:#82b1ff">👥 멀티 대전 설정 및 입장</div>
        <div style="width:calc(6*var(--u))"></div>
      </div>
      <div class="lb-common-bar">
        <div class="lb-field">
          <div class="lb-field-label"><span>👤 플레이어 닉네임</span><small>자동 저장</small></div>
          <input id="ni" placeholder="닉네임 입력 (최대 12자)" maxlength="12" autocomplete="off">
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>⏱️ 차례 제한시간</span><small>초읽기</small></div>
          <div class="lb-seg" id="lb_time_seg"></div>
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>♟️ 내 포진(차림)</span><small>클릭 변경</small></div>
          <button type="button" class="chip on lb-setup-btn" id="lb_setup_btn"></button>
        </div>
      </div>
      <div class="lb-card sel" id="lb_card_mp" style="flex:1;justify-content:space-around">
        <div class="lb-card-head">
          <div class="lb-card-title">⚔️ 온라인 1:1 대국 & 실시간 관전 <small style="font-size:0.75em;color:#9fb8e8;font-weight:700">(P2P 즉시 연결)</small></div>
          <span class="lb-card-badge" id="lb_badge_mp">온라인 대기</span>
        </div>
        <div class="lb-card-body">
          <button type="button" class="lb-btn-gold" id="lb_mkroom_btn">💬 방 만들기 (4자리 초대코드 발급)</button>
          <div class="lb-join-row">
            <input id="ci" placeholder="초대코드 4자리 입력" maxlength="4" inputmode="numeric" style="text-align:center">
            <button type="button" class="lb-btn-blue" id="lb_join_btn">⚔️ 대국 참가하기</button>
          </div>
          <button type="button" class="lb-btn-spec" id="lb_spec_btn">👁️ 관전자로 참여하기 (최대 4명 · 판 위 실시간 훈수펜)</button>
        </div>
      </div>
    </div>

    <!-- [2단계-B: AI 대전 상세 화면 (난이도별 도전 / AI 훈수·교육 / 장기의 기보)] -->
    <div class="lb-view" id="lb_ai_view">
      <div class="lb-sub-top">
        <button type="button" class="lb-back-btn" id="lb_back_from_ai">⬅ 메인 메뉴로</button>
        <div class="lb-ai-tabs">
          <button type="button" class="lb-ai-tab on" data-aitab="chal" id="ai_tab_chal">🏆 난이도별 도전</button>
          <button type="button" class="lb-ai-tab" data-aitab="coach" id="ai_tab_coach">🎓 훈수 · 교육모드</button>
          <button type="button" class="lb-ai-tab" data-aitab="kibo" id="ai_tab_kibo">📜 장기의 기보</button>
        </div>
      </div>
      <div class="lb-common-bar" style="grid-template-columns:1fr 1fr 1fr">
        <div class="lb-field">
          <div class="lb-field-label"><span>👤 내 장수 닉네임</span><small>일기토·대국 표시</small></div>
          <input id="ni_ai" placeholder="닉네임 입력 (최대 12자)" maxlength="12" autocomplete="off">
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>⏱️ 내 차례 제한시간</span><small id="lb_lv_hint">고수 (최강 수읽기)</small></div>
          <div class="lb-seg" id="lb_time_seg_ai"></div>
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>♟️ 내 포진(차림) 선택</span><small>클릭하여 변경</small></div>
          <button type="button" class="chip on lb-setup-btn" id="lb_setup_btn_ai"></button>
        </div>
      </div>

      <!-- 탭 1: 난이도별 도전 & 자유 대국 -->
      <div class="lb-ai-pane on" id="ai_pane_chal">
        <div class="lb-chal-grid" id="lb_lv_seg"></div>
        <button type="button" class="lb-start-btn" id="lb_start_btn">
          <span id="lb_start_txt">🎲 AI 대국 시작하기 (고수)</span>
          <small>(선공 결정 주사위 굴리기)</small>
        </button>
      </div>

      <!-- 탭 2: AI 훈수 · 교육 모드 -->
      <div class="lb-ai-pane" id="ai_pane_coach">
        <div class="lb-list-grid" id="lb_edu_list"></div>
        <button type="button" class="lb-start-btn" id="lb_coach_start_btn" style="background:linear-gradient(180deg,#1e88e5,#0d47a1);border-color:#90caf9">
          <span>🎓 AI 실시간 훈수 코칭 대국 시작</span>
          <small>(최선수 화살표 추천 · 무제한 무르기)</small>
        </button>
      </div>

      <!-- 탭 3: 장기의 기보 (정석 · 명국 도서관) -->
      <div class="lb-ai-pane" id="ai_pane_kibo">
        <div class="lb-list-grid" id="lb_kibo_list"></div>
      </div>
    </div>

    <div id="lb_card_ai" style="display:none"><span id="lb_badge_ai"></span></div>
  </div>
`;

const mS=$('lb_card_mp'),aS=$('lb_card_ai');
const LV_DESC={'초보1':'초보1 (황건적 토벌 · 입문)','초보2':'초보2 (호로관 전투 · 기초)','초보3':'초보3 (적벽대전 · 중급)','중수':'중수 (한중 공방전 · 숙련)','고수':'고수 (오장원 결전 · 최강)'};
const CHAL_STAGES=[
  {lv:'초보1',step:'1단계 도전',boss:'⚔️ 황건적 장각',desc:'장기 입문용 · 실수가 잦음'},
  {lv:'초보2',step:'2단계 도전',boss:'🐎 호로관 화웅',desc:'기초 행마와 기물 교환'},
  {lv:'초보3',step:'3단계 도전',boss:'🔥 적벽의 주유',desc:'포진 전개와 기본 전술'},
  {lv:'중수',step:'4단계 도전',boss:'🐉 한중왕 유비',desc:'탄탄한 수읽기와 공방'},
  {lv:'고수',step:'5단계 최종',boss:'👑 대승상 조조',desc:'정밀 탐색 · 최강 기력'}
];

window.coachMode=false;
window.coachHints=[];

function loadChal(){
  try{return JSON.parse(localStorage.getItem('jg_chal')||'{}')||{}}catch(e){return{}}
}
function saveChalWin(lv){
  try{
    const d=loadChal();
    d[lv]=(d[lv]||0)+1;
    localStorage.setItem('jg_chal',JSON.stringify(d));
    renderChalCards();
  }catch(e){}
}
window.saveChalWin=saveChalWin;

function showLobbyScreen(scr){
  $('lb_home_view').classList.toggle('active',scr==='home');
  $('lb_mp_view').classList.toggle('active',scr==='mp');
  $('lb_ai_view').classList.toggle('active',scr==='ai');
  const sub=$('lb_top_sub');
  if(sub){
    if(scr==='home')sub.textContent='메인 메뉴에서 [멀티 대전] 또는 [AI 대전]을 선택하세요';
    else if(scr==='mp')sub.textContent='친구와 1:1 온라인 대국 또는 최대 4명 실시간 관전';
    else sub.textContent='난이도별 AI 도전 · 실시간 훈수 코칭 · 장기 명국 기보 학습';
  }
}
window.showLobbyScreen=showLobbyScreen;

function switchAiTab(tab){
  ['chal','coach','kibo'].forEach(k=>{
    const tb=$('ai_tab_'+k),pn=$('ai_pane_'+k);
    if(tb)tb.classList.toggle('on',k===tab);
    if(pn)pn.classList.toggle('on',k===tab);
  });
}
['chal','coach','kibo'].forEach(k=>{
  const tb=$('ai_tab_'+k);
  if(tb)tb.onclick=()=>switchAiTab(k);
});

$('lb_go_mp').onclick=()=>{setMode('mp');showLobbyScreen('mp')};
$('lb_go_ai').onclick=()=>{setMode('ai');showLobbyScreen('ai')};
$('lb_back_from_mp').onclick=()=>showLobbyScreen('home');
$('lb_back_from_ai').onclick=()=>showLobbyScreen('home');
$('lb_kibo_quick_btn').onclick=()=>{setMode('ai');showLobbyScreen('ai');switchAiTab('kibo')};

function setMode(m){
  cfg.mode=m;
  if(mS)mS.classList.toggle('sel',m=='mp');
  if(aS)aS.classList.toggle('sel',m=='ai');
  const stTxt=$('lb_start_txt');
  if(stTxt)stTxt.textContent=`🎲 AI 도전 대국 시작 (${cfg.lv})`;
}

const lvB={};
function renderChalCards(){
  const seg=$('lb_lv_seg');
  if(!seg)return;
  seg.innerHTML='';
  const ch=loadChal();
  CHAL_STAGES.forEach(st=>{
    const n=st.lv,wins=ch[n]||0;
    const stars=wins>=3?'★★★':wins===2?'★★☆':wins===1?'★☆☆':'☆☆☆';
    const b=document.createElement('div');
    b.className='lb-chal-card'+(cfg.lv===n?' on':'');
    b.innerHTML=`
      <span class="lb-chal-step">${st.step}</span>
      <div class="lb-chal-name">${n}</div>
      <div class="lb-chal-boss">${st.boss}</div>
      <div class="lb-chal-stars" title="승리 ${wins}회">${stars} <small style="color:#9ec0ff">(${wins}승)</small></div>
    `;
    b.onclick=e=>{
      e.stopPropagation();
      cfg.lv=n;
      for(const k in lvB)lvB[k].classList.toggle('on',k==n);
      const hint=$('lb_lv_hint');if(hint)hint.textContent=LV_DESC[n]||n;
      setMode('ai');
    };
    seg.appendChild(b);
    lvB[n]=b;
  });
}
renderChalCards();

const tB={},tB_ai={};
[30,45,60].forEach(n=>{
  const mkT=(holder,mapObj)=>{
    const b=document.createElement('button');
    b.type='button';b.className='chip';b.textContent=n+'초';
    b.onclick=()=>{
      cfg.time=n;
      for(const k in tB)tB[k].classList.toggle('on',k==n);
      for(const k in tB_ai)tB_ai[k].classList.toggle('on',k==n);
    };
    holder.appendChild(b);
    mapObj[n]=b;
  };
  mkT($('lb_time_seg'),tB);
  mkT($('lb_time_seg_ai'),tB_ai);
});

const sB=$('lb_setup_btn'),sB_ai=$('lb_setup_btn_ai');
sB.onclick=sB_ai.onclick=()=>{drawSetups();$('md').style.display='flex'};
function showSetup(){
  const s=SETUPS[cfg.si],txt=`${cfg.si+1}. ${s[0]} (${s[1]}) ▾`;
  if(sB)sB.textContent=txt;
  if(sB_ai)sB_ai.textContent=txt;
}
function drawSetups(){$('sl').innerHTML='';SETUPS.forEach((s,i)=>{const b=document.createElement('button');b.className='op'+(i==cfg.si?' on':'');b.innerHTML=`<b>${i+1}. ${s[0]}</b> <small>(${s[1]})</small><span>${s[3]}</span>`;b.onclick=()=>{cfg.si=i;showSetup();$('md').style.display='none'};$('sl').appendChild(b)})}
$('mx').onclick=()=>$('md').style.display='none';

const nI=$('ni'),nI_ai=$('ni_ai'),cI=$('ci');
cI.onclick=e=>{e.stopPropagation();setMode('mp')};
const initNickVal=loadNick();
if(nI)nI.value=initNickVal;
if(nI_ai)nI_ai.value=initNickVal;
['input','change','blur'].forEach(ev=>{
  if(nI)nI.addEventListener(ev,()=>{const v=nI.value.trim();if(nI_ai&&nI_ai.value!==nI.value)nI_ai.value=nI.value;if(v)saveNick(v)});
  if(nI_ai)nI_ai.addEventListener(ev,()=>{const v=nI_ai.value.trim();if(nI&&nI.value!==nI_ai.value)nI.value=nI_ai.value;if(v)saveNick(v)});
});
addEventListener('pageshow',()=>{const v=loadNick();if(nI&&!nI.value)nI.value=v;if(nI_ai&&!nI_ai.value)nI_ai.value=v});
$('lb_mkroom_btn').onclick=e=>{e.stopPropagation();if(nI.value.trim())saveNick(nI.value);setMode('mp');mkRoom()};
$('lb_join_btn').onclick=e=>{e.stopPropagation();if(nI.value.trim())saveNick(nI.value);setMode('mp');joinRoom(cI.value,false)};
$('lb_spec_btn').onclick=e=>{e.stopPropagation();if(nI.value.trim())saveNick(nI.value);setMode('mp');joinRoom(cI.value,true)};
$('lb_rp_btn').onclick=()=>{if(window.openReplayMenu)window.openReplayMenu()};
$('lb_rec_btn').onclick=()=>{if($('xrec'))$('xrec').click()};
$('lb_start_btn').onclick=()=>{
  const nv=(nI_ai&&nI_ai.value.trim())||(nI&&nI.value.trim());
  if(nv)saveNick(nv);
  window.coachMode=false;
  startAI();
};
$('lb_coach_start_btn').onclick=()=>{
  const nv=(nI_ai&&nI_ai.value.trim())||(nI&&nI.value.trim());
  if(nv)saveNick(nv);
  window.coachMode=true;
  startAI(true);
};
if(lvB['고수'])lvB['고수'].classList.add('on');
if(tB[45])tB[45].classList.add('on');
if(tB_ai[45])tB_ai[45].classList.add('on');
setMode('ai');showSetup();
