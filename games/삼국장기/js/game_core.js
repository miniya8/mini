/* ---------- 게임 ---------- */
function startAI(isCoach){
  window.coachMode=!!isCoach;
  window.coachHints=[];
  const o=SETUPS[Math.random()*4|0],mine=SETUPS[cfg.si][2];
  oppNick=isCoach?`🎓훈수코치(${cfg.lv})`:`COM(${cfg.lv})`;
  if(isCoach){
    begin('c',mine,o[2],'ai');
    $('g').classList.add('xcoach');
    toast('🎓 AI 훈수·교육 모드가 시작되었습니다! 황금색 화살표로 최선수를 추천해 드립니다.',3500);
    setTimeout(()=>{if(window.updateCoachHints)window.updateCoachHints()},350);
    return;
  }
  $('g').classList.remove('xcoach');
  const[a,b]=dicePair();
  const go=first=>{const m=first?'c':'h';toast(`COM 포진: ${o[0]}`,2500);begin(m,m=='c'?mine:o[2],m=='h'?mine:o[2],'ai')};
  diceShow(a,b,true,f=>{if(f)pickFirst(go);else{const comFirst=Math.random()<.75;$('dres').textContent=`😮 일기토에서 승리한 COM이 ${comFirst?'선공(초나라)':'후공(한나라)'}을 선택했어요`;setTimeout(()=>go(!comFirst),1700)}});
}
function begin(m,sc,sh,mode){isSpec=false;$('g').classList.remove('xspec');if(window.jgPanel)try{jgPanel(mode)}catch(e){}mc=0;sfxLoad();dTok++;$('dc').style.display='none';rmS=rmO=false;$('oa').disabled=false;$('os').textContent='';cfg.mode=mode;me=m;flip=m=='h';init(sc,sh);turn='c';over=false;inGame=true;busy=false;sel=null;lm=null;anim=null;jang=null;aiId++;$('st').style.display='none';$('g').style.display='block';$('ov').style.display='none';fitScreen();
function updHudNames(cn,hn){
  const showCode=(cfg.mode==='mp'&&code);
  const cTag=showCode&&(me==='c'||isSpec)?` [코드:${code}]`:'';
  const hTag=showCode&&(me==='h')?` [코드:${code}]`:'';
  $('nc').textContent='초 '+cn+cTag;
  $('nh').textContent='한 '+hn+hTag;
  const rb=$('rcbadge');
  if(rb){
    if(showCode){
      rb.style.display='inline-block';
      rb.textContent='🔑 방코드: '+code;
      rb.onclick=()=>{try{navigator.clipboard.writeText(code);toast('방 초대코드 ['+code+'] 복사 완료!',2000)}catch(e){toast('방 초대코드: '+code,3000)}};
    }else{
      rb.style.display='none';
    }
  }
}
const n=nick();updHudNames(m=='c'?n:oppNick,m=='h'?n:oppNick);cv=$('cv');cx2=cv.getContext('2d');if(!wk&&mode=='ai')mkWorker();resize();setTurn('c');if(!looping){looping=true;requestAnimationFrame(loop)}if(window.jgStartOrbit&&!RESUMED){try{window.jgStartOrbit()}catch(e){}}RESUMED=false}
let rzK='';function resize(){if(!cv||!cv.offsetWidth)return;const k=cv.offsetWidth+'x'+cv.offsetHeight+'@'+(devicePixelRatio||1)+(flip?'f':'n')+sab()+'h'+($('hud')?$('hud').offsetHeight:0);if(k===rzK&&bc)return;rzK=k;const d=Math.min(devicePixelRatio||1,2);W=cv.offsetWidth||innerWidth;H=cv.offsetHeight||innerHeight;cv.width=W*d;cv.height=H*d;cx2.setTransform(d,0,0,d,0,0);cx2.imageSmoothingQuality='high';
const top=($('hud')&&$('hud').offsetHeight)||46,mx=Math.max(26,W*.095),aH=H-top-(innerHeight<560?4:10)-sab();let cx=(W-2*mx)/8,cy=aH/11.2;if(cy>cx*1.45)cy=cx*1.45;else if(cx>cy*1.22)cx=cy*1.22;
CX=cx;CY=cy;C=Math.min(cx,cy);OX=(W-8*cx)/2;OY=top+(aH-9*cy)/2;bc=document.createElement('canvas');bc.width=W*d;bc.height=H*d;const g=bc.getContext('2d');g.setTransform(d,0,0,d,0,0);board(g);if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}}addEventListener('resize',resize);
const px=(x,y)=>{const[a,b]=flip?[8-x,9-y]:[x,y];return[OX+a*CX,OY+b*CY]};
function setTurn(s){turn=s;save();tleft=cfg.time;$('nc').classList.toggle('on',s=='c');$('nh').classList.toggle('on',s=='h');$('tn').textContent=isSpec?('👁️관전중('+(s=='c'?'초':'한')+' 차례)'):(s==me?'내 차례':'상대 차례');clearInterval(tint);$('tm').textContent='0:'+String(cfg.time).padStart(2,'0');
tint=setInterval(()=>{if(over||anim||busy)return;tleft--;$('tm').textContent='0:'+String(Math.max(tleft,0)).padStart(2,'0');if(tleft<=0){tleft=cfg.time;if(window.jgTO)jgTO(turn);}},1000);
if(cfg.mode=='ai'&&s!=me){const id=aiId;setTimeout(()=>{if(!over&&!anim&&!busy&&turn==s&&id==aiId)aiThink(s)},500)}}
function play(m){if(isSpec)return;if(cfg.mode=='mp'){if(!(conn&&conn.open)){toast('상대와 다시 연결하는 중이에요…',2500);return}bcast({k:'mv',m})}doMove(m)}
function doMove(m){if(anim||over)return;mc++;const p=B[m[1]][m[0]],q=mk(m);sel=null;lm=m;const dist=Math.max(Math.abs(m[2]-m[0]),Math.abs(m[3]-m[1])),D=480+95*dist,A=q?780:0;anim={p,m,q,t0:performance.now(),D,A,dist,o:turn=='c'?'h':'c',T:[480,480+D,480+D+A,480+D+A+500]};save()}
function fin(){const o=anim.o,s=anim.p.s,t=anim.p.t;anim=null;clearInterval(tint);turn=o;const L=legal(o),ck=chk(o);
if(!L.length){if(ck){busy=true;jang={t0:performance.now(),s,t,mate:1};boom();setTimeout(()=>{busy=false;end(s)},1500)}else if(!legal(s).length)end(null);else{toast((o=='c'?'초':'한')+' 한수쉼 (둘 곳이 없어 차례를 넘깁니다)');setTurn(s)}return}
if(ck){busy=true;jang={t0:performance.now(),s,t};boom();setTimeout(()=>{busy=false;if(!over)setTurn(o)},1300)}else setTurn(o)}
function end(w,msg){over=true;inGame=false;save();clearInterval(tint);$('ot').textContent=msg||(w?(w=='c'?'초':'한')+'나라 승리!'+(w==me?' 🎉':''):'무승부');$('oa').style.display=(cfg.mode=='ai'||(conn&&conn.open))?'':'none';$('oa').disabled=false;if($('od'))$('od').style.display='none';$('os').textContent='';$('ov').style.display='flex'}
function lobby(){clearInterval(tint);over=true;inGame=false;aiId++;closeNet();save();if($('ni')&&!$('ni').value)$('ni').value=loadNick();if($('scv'))$('scv').style.display='none';$('g').style.display='none';$('rm').style.display='none';$('st').style.display='none';$('st').style.display='flex';cv.style.transform='';fitScreen();fit();}
$('ob').onclick=$('bl').onclick=lobby;
$('oa').onclick=()=>{if(cfg.mode=='ai'){startAI();return}if(!(conn&&conn.open)){toast('상대가 나가서 다시 할 수 없어요');$('oa').style.display='none';return}rmS=true;conn.send({k:'rm'});$('oa').disabled=true;$('os').textContent='상대의 응답을 기다리는 중…';if(rmO&&isHost)hostStart()};
function boom(){try{AC=AC||new(window.AudioContext||webkitAudioContext)();const a=AC,o=a.createOscillator(),g=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(260,a.currentTime);o.frequency.exponentialRampToValueAtTime(40,a.currentTime+.6);g.gain.setValueAtTime(.3,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.7);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.75)}catch(e){}}
$('cv').addEventListener('pointerdown',e=>{if(over||anim||busy||turn!=me)return;const r=cv.getBoundingClientRect();let a=Math.round((e.clientX-r.left-OX)/CX),b=Math.round((e.clientY-r.top-OY)/CY);if(a<0||a>8||b<0||b>9)return;if(flip){a=8-a;b=9-b}
if(sel){const m=sel.L.find(z=>z[2]==a&&z[3]==b);if(m){play(m);return}}const p=B[b][a];if(p&&p.s==me){sel={x:a,y:b,L:legal(me).filter(z=>z[0]==a&&z[1]==b)}}else sel=null});

/* ---------- 상태 저장·복원 (화면 회전/재로딩 대비) ---------- */
function save(){try{const g=(inGame&&!over)?{mode:cfg.mode,B,turn:anim?anim.o:turn,me,lm,mc,oppNick,time:cfg.time,hostSide,isHost,code,sid}:null;
const o={t:Date.now(),cfg:{lv:cfg.lv,time:cfg.time,si:cfg.si,mode:cfg.mode},room:(peer&&isHost&&code&&!g)?{code}:null,game:g},j=JSON.stringify(o);try{localStorage.setItem('jg_st',j)}catch(e){}try{sessionStorage.setItem('jg_st',j)}catch(e){}}catch(e){}}
function resumeGame(g){oppNick=g.oppNick||'상대';cfg.time=g.time||cfg.time;isHost=!!g.isHost;code=g.code||'';sid=g.sid||'';hostSide=g.hostSide;
begin(g.me,'RNBG.GNBR','RNBG.GNBR',g.mode);B=g.B;lm=g.lm||null;mc=g.mc||0;setTurn(g.turn);toast('화면이 다시 불러와져서 대국을 이어갑니다',3500);
if(g.mode=='mp'&&lib()){if(isHost)mkRoom(code);else doJoin(true)}}
function boot(){let o=null;try{o=JSON.parse(localStorage.getItem('jg_st')||sessionStorage.getItem('jg_st')||'null')}catch(e){}if(!o)return;
const c=o.cfg||{};if(c.lv&&lvB[c.lv]){cfg.lv=c.lv;for(const k in lvB)lvB[k].classList.toggle('on',k==c.lv)}if(c.time&&tB[c.time]){cfg.time=c.time;for(const k in tB)tB[k].classList.toggle('on',k==c.time)}if(c.si>=0&&c.si<4){cfg.si=c.si;showSetup()}if(c.mode=='ai'||c.mode=='mp')setMode(c.mode);
if(Date.now()-o.t>20*60*1000)return;const g=o.game;
if(g&&g.B&&(g.mode=='ai'||g.mode=='mp')){try{RESUMED=true;resumeGame(g)}catch(e){console.error('resume failed',e);try{localStorage.removeItem('jg_st');sessionStorage.removeItem('jg_st')}catch(x){}}}else if(o.room&&o.room.code&&lib()){try{RESUMED=true;mkRoom(o.room.code)}catch(e){console.error(e)}}}
function wake(){if(peer&&peer.disconnected&&!peer.destroyed){try{peer.reconnect()}catch(e){}}if(inGame&&!over&&cfg.mode=='mp'&&!isHost&&!(conn&&conn.open)&&Date.now()-jLast>5000)doJoin(true)}
document.addEventListener('visibilitychange',()=>{save();if(!document.hidden)wake()});addEventListener('online',wake);addEventListener('pageshow',wake);addEventListener('pagehide',save);addEventListener('resize',save);addEventListener('orientationchange',save);
boot();setInterval(save,2000);
