/* ---------- AI 스레드 ---------- */
function mkWorker(){try{let rulesSrc=$('rules')?$('rules').textContent:'';
if(!rulesSrc||!rulesSrc.trim()){
  try{const xhr=new XMLHttpRequest();xhr.open('GET','js/rules_ai.js',false);xhr.send(null);if(xhr.status===200||xhr.status===0)rulesSrc=xhr.responseText;}catch(ex){}
}
const src=rulesSrc+';onmessage=e=>{const d=e.data;B=d.B;if(d.k==="hint"){let r=null;try{r=E_hint(d.s,d.n,d.t)}catch(x){}postMessage({k:"hint",id:d.id,r});return}let m=null;try{m=aiPick(d.s,d.lv)}catch(x){}postMessage({id:d.id,m})}';wk=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));wk.onmessage=e=>{const d=e.data;if(d&&d.k==='hint'){if(window.coachRes)window.coachRes(d);return}aiDone(d)};wk.onerror=()=>{wk=null}}catch(e){wk=null}}
function aiThink(s){const id=++aiId,lv=cfg.lv;clearTimeout(aiWd);aiWd=setTimeout(()=>{if(aiId==id&&!anim&&!over){aiId++;aiDone({id:aiId,m:null})}},9000);
if(wk)wk.postMessage({id,s,lv,B});else setTimeout(()=>{let m=null;try{m=aiPick(s,lv)}catch(e){}aiDone({id,m})},30)}
function aiDone(d){if(d.id!=aiId||over||anim||busy||turn==me)return;clearTimeout(aiWd);let m=d.m;if(!m){try{m=aiPick(turn,'_q')}catch(e){m=null}if(!m){const L=legal(turn);m=L.length?L[Math.random()*L.length|0]:null}}if(m)doMove(m)}
/* ---------- P2P (친구 초대 1:1 + 최대 4명 관전자) ---------- */
function lib(){if(window.Peer)return true;toast('P2P 모듈을 불러오지 못했어요. 인터넷 연결 확인 후 새로고침해 주세요');return false}
let specs=[],isSpec=false,wantSpec=false,cNick='',hNick='';
function bcast(msg,ex){if(conn&&conn.open&&conn!==ex){try{conn.send(msg)}catch(e){}}specs.forEach(s=>{if(s.c&&s.c.open&&s.c!==ex){try{s.c.send(msg)}catch(e){}}})}
function closeNet(){try{conn&&conn.close()}catch(e){}specs.forEach(s=>{try{s.c&&s.c.close()}catch(e){}});specs=[];try{peer&&peer.destroy()}catch(e){}conn=peer=null;isSpec=false}
let code='',rmS=false,rmO=false,isHost=false,hostDice=false,hostReady=null,dTok=0,dTimer=0,gs=null,mc=0,sid='',dropT=0,jTok=0,jLast=0,RESUMED=false;
function keepAlive(pr){pr.on('disconnected',()=>{setTimeout(()=>{if(peer===pr&&!pr.destroyed){try{pr.reconnect()}catch(e){}}},1000)})}
function mkRoom(c0,tries){if(!lib())return;tries=tries||0;closeNet();code=c0||String(1000+Math.random()*9000|0);isHost=true;isSpec=false;if(!c0&&!tries)toast('방을 여는 중…',4000);const pr=peer=new Peer('sjg-'+code);keepAlive(pr);if(!c0)setTimeout(()=>{if(peer===pr&&!pr.open&&$('rm').style.display!='flex')toast('서버 연결 대기 중…',3500)},6000);
pr.on('open',()=>{if(peer!==pr)return;if(!c0){clearTimeout(toast.i);$('tt').style.display='none'}$('rc').textContent=code;if(!(inGame&&!over)){$('rs').textContent='상대 입장 대기 중…';$('rm').style.display='flex'}save()});
pr.on('connection',c=>{if(peer!==pr)return;netEvents(c);c.on('open',()=>{setTimeout(()=>{if(c._isSpec||c._handled)return;if(conn&&conn.open){addSpec(c,'관전자');return}conn=c;clearTimeout(dropT);if(inGame&&!over&&cfg.mode=='mp')sendSync();else{isHost=true;oppNick='상대';hostOfferInvite(c)}},600)})});
pr.on('error',e=>{if(peer!==pr)return;if(e.type=='unavailable-id'){if(c0){if(tries<15)setTimeout(()=>{if(peer===pr)mkRoom(c0,tries+1)},2000);else toast('방을 다시 열지 못했어요.',4000)}else mkRoom()}else toast('연결 오류: '+e.type)})}

/* 간결하고 깔끔한 초대 메시지 */
function inviteText(){
  const isHttp=location.protocol.startsWith('http');
  const base=isHttp?location.href.split('#')[0].split('?')[0]:'';
  const u=(base&&base.length<=90)?(base+'#'+code):'';
  const shortMsg=u?`[전설장기] 코드: ${code}\n${u}`:`[전설장기] 초대코드: ${code}`;
  return{
    title:'전설장기 초대',
    shareText:`[전설장기] 초대코드: ${code}`,
    copyText:shortMsg,
    codeOnly:String(code),
    url:u||undefined
  };
}
$('rsh').onclick=()=>{
  const d=inviteText();
  if(navigator.share){
    const shObj=d.url?{title:d.title,text:d.shareText,url:d.url}:{title:d.title,text:d.copyText};
    navigator.share(shObj).catch(()=>{});
  }else $('rcp').click();
};
$('rcp').onclick=()=>{
  const d=inviteText();
  (navigator.clipboard?navigator.clipboard.writeText(d.copyText):Promise.reject())
    .then(()=>toast('초대장을 복사했어요! ('+d.codeOnly+')',2500))
    .catch(()=>toast('초대코드: '+code,3000));
};
if($('rco'))$('rco').onclick=()=>{
  (navigator.clipboard?navigator.clipboard.writeText(String(code)):Promise.reject())
    .then(()=>toast('방 코드 ['+code+'] 복사 완료!',2200))
    .catch(()=>toast('방 코드: '+code,3000));
};
$('rx').onclick=()=>{$('rm').style.display='none';closeNet();save()};

/* 상대에게 초대 거절 신호 전송 (접속 전 링크 거절 포함) */
function sendDeclineToCode(targetCode,reason){
  if(!lib()||!/^\d{4}$/.test(targetCode||''))return;
  try{
    const tempPeer=new Peer();
    const cleanup=()=>{setTimeout(()=>{try{tempPeer.destroy()}catch(e){}},600)};
    const timer=setTimeout(cleanup,5000);
    tempPeer.on('open',()=>{
      try{
        const tc=tempPeer.connect('sjg-'+targetCode,{reliable:true});
        tc.on('open',()=>{
          try{tc.send({k:'inv_decline',nick:nick(),reason:reason||'거절'})}catch(e){}
          clearTimeout(timer);
          cleanup();
        });
        tc.on('error',()=>{clearTimeout(timer);cleanup()});
      }catch(e){clearTimeout(timer);cleanup()}
    });
    tempPeer.on('error',()=>{clearTimeout(timer);cleanup()});
  }catch(e){}
}

let preAccepted=false;
function showInviteModal(targetCode,hostName,timeSec,isConnected){
  const m=$('inv_mdl'),msg=$('inv_msg'),sub=$('inv_sub'),bOk=$('inv_ok'),bSp=$('inv_sp'),bNo=$('inv_no');
  if(!m)return;
  msg.textContent=hostName?`[${hostName}]님의 대국 초대`:`방 코드 [${targetCode}] 대국 초대`;
  sub.textContent=timeSec?`제한시간 ${timeSec}초 · 수락하면 선공 결정 주사위를 굴립니다.`:`대국에 참여하거나 거절할 수 있습니다.`;
  bSp.style.display=isConnected?'none':'';
  m.style.display='flex';
  bOk.onclick=()=>{
    m.style.display='none';
    if(history.replaceState&&location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    if(isConnected){
      if(conn&&conn.open){
        conn.send({k:'inv_accept',nick:nick()});
        toast('초대를 수락했습니다! 잠시만 기다려 주세요…',2000);
      }
    }else{
      preAccepted=true;
      setMode('mp');
      joinRoom(targetCode,false);
    }
  };
  bSp.onclick=()=>{
    m.style.display='none';
    if(history.replaceState&&location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    setMode('mp');
    joinRoom(targetCode,true);
  };
  bNo.onclick=()=>{
    m.style.display='none';
    if(history.replaceState&&location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    if(isConnected&&conn&&conn.open){
      try{conn.send({k:'inv_decline',nick:nick()})}catch(e){}
      setTimeout(()=>closeNet(),300);
    }else{
      sendDeclineToCode(targetCode,'초대 거절');
    }
    toast('초대를 거절했습니다.',2500);
  };
}

function hostOfferInvite(c){
  if(!c||!c.open)return;
  $('rs').textContent=`${oppNick}님에게 대국 수락을 요청 중…`;
  try{c.send({k:'inv_offer',nick:nick(),time:cfg.time})}catch(e){}
}

function doJoin(resume){const tok=++jTok;jLast=Date.now();try{peer&&peer.destroy()}catch(e){}const pr=peer=new Peer();keepAlive(pr);let tries=0;
const go=()=>{if(tok!=jTok||peer!==pr)return;const c=conn=pr.connect('sjg-'+code,{reliable:true});netEvents(c);c.on('open',()=>{if(tok!=jTok)return;if(wantSpec||isSpec){c.send({k:'join_spec',nick:nick()})}else if(resume){c.send({k:'hello',sid});sendSync()}else{c.send({k:'hello_p',nick:nick(),accepted:preAccepted});preAccepted=false}})};
pr.on('open',()=>{if(tok==jTok)go()});
pr.on('error',e=>{if(tok!=jTok)return;if(e.type=='peer-unavailable'){const max=resume?25:7;if(++tries<max){if(!resume)toast(`방을 찾는 중… (${tries}/${max-1})`,1800);setTimeout(()=>{if(tok==jTok&&!(conn&&conn.open))go()},2000)}else toast('방을 찾지 못했어요. 코드를 다시 확인해 주세요.',4000)}else toast('연결 오류: '+e.type)})}
function joinRoom(c,asSpec){if(!lib())return;if(!/^\d{4}$/.test(c||''))return toast('받은 코드 4자리를 입력하세요');closeNet();isHost=false;wantSpec=!!asSpec;isSpec=!!asSpec;code=c;toast(asSpec?'관전자로 접속 중…':'접속 중…',3500);doJoin(false)}
function sendSync(){try{const msg={k:'sync',mc,B,turn:anim?anim.o:turn,lm,over,DMG:window.DMG||{c:0,h:0},SDMG:window.SDMG||{c:{lv:0,hits:[]},h:{lv:0,hits:[]}},cNick:me=='c'?nick():oppNick,hNick:me=='h'?nick():oppNick};bcast(msg)}catch(e){}}
function onSync(d){clearTimeout(dropT);if(d.cNick)cNick=d.cNick;if(d.hNick)hNick=d.hNick;if(isSpec){if(!inGame){beginSpec(d)}else{B=d.B;mc=d.mc;lm=d.lm;if(d.DMG)window.DMG={c:+d.DMG.c||0,h:+d.DMG.h||0};if(d.SDMG){window.SDMG=d.SDMG;if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}}updHudNames(cNick,hNick);rzK='';try{resize()}catch(e){}setTurn(d.turn);if(d.over&&!over)end(null,'대국 종료');else if(!d.over&&over){over=false;$('ov').style.display='none'}}return}if(d.DMG){window.DMG={c:+d.DMG.c||0,h:+d.DMG.h||0};rzK='';try{resize()}catch(e){}}if(d.SDMG){window.SDMG=d.SDMG;if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}}if(!inGame||over)return;if(d.mc>mc){anim=null;busy=false;jang=null;sel=null;B=d.B;mc=d.mc;lm=d.lm;setTurn(d.turn);toast('상대와 다시 연결됐어요',2500)}else if(d.mc<mc)sendSync();else toast('상대와 다시 연결됐어요',2500)}
function addSpec(c,n){c._isSpec=true;c._handled=true;if(conn===c)conn=null;specs=specs.filter(s=>s.c&&s.c.open&&s.c!==c);if(specs.length>=4){try{c.send({k:'spec_full'});setTimeout(()=>c.close(),400)}catch(e){}return}const sn=String(n||'관전자').slice(0,12);specs.push({c,nick:sn});const cn=me=='c'?nick():oppNick,hn=me=='h'?nick():oppNick;try{c.send({k:'spec_ok',mc,B,turn:anim?anim.o:turn,lm,over,DMG:window.DMG||{c:0,h:0},SDMG:window.SDMG||{c:{lv:0,hits:[]},h:{lv:0,hits:[]}},time:cfg.time,sid,cNick:cn,hNick:hn,scnt:specs.length})}catch(e){}bcast({k:'spec_join',nick:sn,scnt:specs.length});if(window.jgSpecNotice)window.jgSpecNotice(sn,specs.length,true)}
function handleInviteDecline(byNick){
  const who=byNick||oppNick||'상대';
  dTok++;clearInterval(dTimer);
  $('dc').style.display='none';
  if($('inv_mdl'))$('inv_mdl').style.display='none';
  gs=null;hostReady=null;hostDice=false;
  if(isHost){
    try{conn&&conn.close()}catch(e){}
    conn=null;
    if(!inGame){
      $('rc').textContent=code;
      $('rs').textContent=`❌ ${who}님이 초대를 거절했습니다. 다른 상대를 기다리는 중…`;
      $('rm').style.display='flex';
    }
    toast(`❌ ${who}님이 초대를 거절했습니다.`,3500);
  }else{
    closeNet();
    toast('대국 초대를 거절했습니다.',2500);
  }
}
function netEvents(c){c.on('data',d=>{c._handled=true;if(c._isSpec){onSpecData(c,d);return}
if(d&&d.k=='inv_decline'){
  const by=d.nick||oppNick||'상대';
  if(c===conn)conn=null;
  try{c.close()}catch(e){}
  handleInviteDecline(by);
  return;
}
if(d&&d.k=='join_spec'){addSpec(c,d.nick);return}if(c!==conn){if(d&&d.k=='hello_p'&&conn&&conn.open){addSpec(c,d.nick);return}if(d&&d.k=='hello'&&d.sid&&d.sid==sid){const o=conn;conn=c;try{o&&o.close()}catch(e){}clearTimeout(dropT);sendSync()}else if(d&&d.k=='hello_p'&&!(conn&&conn.open)){conn=c;clearTimeout(dropT);if(inGame&&!over&&cfg.mode=='mp')sendSync();else{isHost=true;oppNick=d.nick||'상대';if(d.accepted)hostStart();else hostOfferInvite(c)}}else{addSpec(c,d&&d.nick);return}return}onData(d)});
c.on('close',()=>{if(c._isSpec){const idx=specs.findIndex(s=>s.c===c);if(idx>=0){const sn=specs[idx].nick;specs.splice(idx,1);bcast({k:'spec_left',nick:sn,scnt:specs.length});if(window.jgSpecNotice)window.jgSpecNotice(sn,specs.length,false)}return}if(c!==conn)return;
if(inGame&&!over&&cfg.mode=='mp'){if(isSpec){toast('방장과의 연결이 끊겼어요',3000);return}toast('상대 연결이 끊겼어요. 다시 연결을 기다리는 중…',4000);clearTimeout(dropT);dropT=setTimeout(()=>{if(inGame&&!over&&!(conn&&conn.open))end(me,'상대가 나가서 승리!')},120000);if(!isHost)setTimeout(()=>{if(inGame&&!over&&!(conn&&conn.open))doJoin(true)},1500);return}
if(!inGame){if($('inv_mdl'))$('inv_mdl').style.display='none';if($('dc').style.display=='flex'){dTok++;clearInterval(dTimer);$('dc').style.display='none';if(isHost){conn=null;$('rs').textContent='상대가 나갔습니다. 다시 기다리는 중…';$('rm').style.display='flex'}else toast('상대가 나갔어요')}else if(isHost&&$('rm').style.display=='flex'){conn=null;$('rs').textContent='상대 입장 대기 중…'}if(over){$('oa').style.display='none';if($('od'))$('od').style.display='none';$('os').textContent='상대가 나갔어요'}}})}
let oppNick='상대';
function onSpecData(c,d){if(!d||typeof d!=='object')return;const sp=specs.find(s=>s.c===c);const sn=sp?sp.nick:(d.nick||'관전자');
if(d.k==='chat'||d.k==='emo'||d.k==='sdraw'||d.k==='sclr'){d.from='👁️'+sn;bcast(d,c);if(window.jgExtra)window.jgExtra(d)}}
function beginSpec(d){isSpec=true;wantSpec=false;cfg.mode='mp';cfg.time=d.time||cfg.time;sid=d.sid||'';cNick=d.cNick||'초나라';hNick=d.hNick||'한나라';oppNick=cNick+' vs '+hNick;me='s';flip=false;
if(d.B&&d.B.length)B=d.B;else init(SETUPS[0][2],SETUPS[0][2]);
if(window.jgPanel)try{jgPanel('mp')}catch(e){}
window.DMG=d.DMG&&typeof d.DMG==='object'?{c:+d.DMG.c||0,h:+d.DMG.h||0}:{c:0,h:0};window.SDMG=d.SDMG&&typeof d.SDMG==='object'?d.SDMG:{c:{lv:0,hits:[]},h:{lv:0,hits:[]}};if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}
mc=d.mc||0;lm=d.lm||null;turn=d.turn||'c';over=!!d.over;inGame=true;busy=false;sel=null;anim=null;jang=null;
sfxLoad();dTok++;$('dc').style.display='none';$('rm').style.display='none';$('st').style.display='none';$('g').style.display='block';$('ov').style.display='none';
$('g').classList.add('xspec');fitScreen();
updHudNames(cNick,hNick);cv=$('cv');cx2=cv.getContext('2d');rzK='';resize();setTurn(turn);
if(!looping){looping=true;requestAnimationFrame(loop)}
toast('👁️ 관전자로 입장했어요! 우측/하단 훈수펜으로 판 위에 경로·낙서를 그릴 수 있어요',4000)}
function onData(d){if(d&&d.k=='join_spec'&&isHost){addSpec(conn,d.nick);return}
if(d&&d.k=='spec_full'){toast('관전석(최대 4명)이 모두 찼어요!',4000);closeNet();return}
if(d&&d.k=='spec_ok'){beginSpec(d);return}
if(d&&d.k=='inv_offer'){
  oppNick=d.nick||'방장';
  cfg.time=d.time||cfg.time;
  clearTimeout(toast.i);$('tt').style.display='none';
  showInviteModal(code,oppNick,cfg.time,true);
  return;
}
if(d&&d.k=='inv_accept'){
  oppNick=d.nick||oppNick||'상대';
  if(isHost)hostStart();
  return;
}
if(d&&d.k=='inv_decline'){
  handleInviteDecline(d.nick);
  return;
}
if(isHost&&d&&(d.k==='chat'||d.k==='emo'||d.k==='mv'||d.k==='pass'||d.k==='resign'||d.k==='nuke'||d.k==='meteor'||d.k==='alien'||d.k==='kame'||d.k==='fist'||d.k==='hammer'||d.k==='gun'||d.k==='dmg_sync'||d.k==='sdmg_sync'||d.k==='sdraw'||d.k==='sclr')){if(d.k==='chat'||d.k==='emo')d.from=oppNick;bcast(d,conn)}
if(window.jgExtra&&jgExtra(d))return;
if(d.k=='start'){if($('inv_mdl'))$('inv_mdl').style.display='none';isSpec=false;$('g').classList.remove('xspec');cfg.time=d.time;oppNick=d.nick;sid=d.sid||'';const mine=SETUPS[cfg.si][2];conn.send({k:'ready',nick:nick(),setup:mine});const[hd,gd]=d.dice;gs={mine,setup:d.setup,done:false,g:null};
diceShow(gd,hd,false,f=>{if(!gs)return;gs.done=true;if(f)pickFirst(first=>{if(!gs)return;gs.g=first?'c':'h';conn.send({k:'pick',hs:first?'h':'c'});guestGo()});else guestGo()},()=>{if(conn&&conn.open)try{conn.send({k:'inv_decline',nick:nick()})}catch(e){}handleInviteDecline(nick())})}
else if(d.k=='ready'){oppNick=d.nick||'상대';if(curDuelGen&&curDuelGen[1])curDuelGen[1].name=oppNick;if($('dc').style.display=='flex')$('dn2').textContent=`🐎 ${oppNick} (${curDuelGen&&curDuelGen[1]?curDuelGen[1].title:'무장'})`;hostReady=d.setup;hostGo()}
else if(d.k=='pick'){if(isHost){hostSide=d.hs;hostDice=true;hostGo()}else if(gs){gs.g=d.hs=='c'?'h':'c';guestGo()}}
else if(d.k=='rm'){
  rmO=true;
  if(rmS&&isHost){
    if($('od'))$('od').style.display='none';
    hostStart();
  }else if(over&&!rmS){
    $('os').textContent=`📩 ${oppNick||'상대'}님이 재대국을 요청했어요!`;
    if($('od')){
      $('od').style.display='';
      $('od').onclick=()=>{
        rmO=false;
        $('od').style.display='none';
        $('os').textContent='재대국 초대를 거절했습니다.';
        if(conn&&conn.open)try{conn.send({k:'rm_no',nick:nick()})}catch(e){}
      };
    }
  }
}
else if(d.k=='rm_no'){
  rmS=false;rmO=false;
  $('oa').disabled=false;
  if($('od'))$('od').style.display='none';
  $('os').textContent=`❌ ${d.nick||oppNick||'상대'}님이 재대국을 거절했습니다.`;
  toast(`❌ ${d.nick||oppNick||'상대'}님이 재대국 초대를 거절했습니다.`,3500);
}
else if(d.k=='hello_p'){
  oppNick=d.nick||'상대';
  if(isHost){
    if(inGame&&!over&&cfg.mode=='mp')sendSync();
    else if(d.accepted)hostStart();
    else hostOfferInvite(conn);
  }
}
else if(d.k=='hello'){}
else if(d.k=='sync')onSync(d)
else if(d.k=='mv'&&inGame&&!over){if(isSpec&&anim)fin();if(!anim&&legal(turn).some(z=>z.join()==d.m.join()))doMove(d.m)}}
function guestGo(){if(!gs||!gs.done||gs.g==null)return;const{g,mine,setup}=gs;gs=null;begin(g,g=='c'?mine:setup,g=='h'?mine:setup,'mp')}
function hostStart(){const c=conn;if(!c||!c.open)return;rmS=rmO=false;if($('od'))$('od').style.display='none';const[hd,gd]=dicePair();hostSide=null;hostDice=false;hostReady=null;$('rm').style.display='none';
sid=Math.random().toString(36).slice(2,10);c.send({k:'start',time:cfg.time,nick:nick(),setup:SETUPS[cfg.si][2],dice:[hd,gd],sid});
diceShow(hd,gd,false,f=>{if(f)pickFirst(first=>{hostSide=first?'c':'h';c.send({k:'pick',hs:hostSide});hostDice=true;hostGo()})},()=>{if(c&&c.open)try{c.send({k:'inv_decline',nick:nick()})}catch(e){}handleInviteDecline(nick())})}
function hostGo(){if(!hostDice||hostReady==null||!hostSide)return;const mine=SETUPS[cfg.si][2],o=hostReady;hostReady=null;hostDice=false;begin(hostSide,hostSide=='c'?mine:o,hostSide=='h'?mine:o,'mp');setTimeout(()=>sendSync(),300)}
