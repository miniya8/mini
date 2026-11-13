const el=id=>document.getElementById(id),opp=()=>me=='c'?'h':'c',nm=s=>s=='c'?'초':'한',CH={key:null,log:[]};
function chLoad(){try{const o=JSON.parse(sget('jg_chat')||'null');if(o&&o.key===code&&Array.isArray(o.log))return o.log.filter(m=>m&&(m.c=='xa'||m.c=='xb'||/^xs( x[rg])?$/.test(m.c))).slice(-60)}catch(e){}return[]}
function chSync(){if(CH.key!==code){CH.key=code;CH.log=chLoad()}}
function chSave(){try{sset('jg_chat',JSON.stringify({key:code,log:CH.log.slice(-60)}))}catch(e){}}
function chShow(c,t){const l=el('xlog'),d=document.createElement('div');d.className='xm '+c+(EM.has(t)?' xe':'');d.textContent=t;l.appendChild(d);while(l.childNodes.length>120)l.removeChild(l.firstChild);l.scrollTop=l.scrollHeight}
function chAdd(c,t){chSync();CH.log.push({c,t});chSave();chShow(c,t);if((c==='xb'||c==='xs xr')&&sheetOn()&&!el('xsp').classList.contains('xo')){unread++;badge()}if(c==='xb'||c==='xs xr')tabBump('c')}
function ping(){try{if(!AC)return;if(AC.state=='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.frequency.value=880;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.14)}catch(e){}}
window.jgPanel=function(mode){const mp=mode==='mp';bgStart();rzK='';{let x=null;try{x=JSON.parse(sget('jg_x')||'null')}catch(e){}const ok=x&&sid&&x.sid===sid;TO=ok&&x.TO?x.TO:{c:0,h:0};window.DMG=ok&&x.DMG?x.DMG:{c:0,h:0};window.DMG_SK=ok&&x.DMG_SK?x.DMG_SK:{c:[],h:[]};window.SDMG=ok&&x.SDMG&&x.SDMG.c?x.SDMG:{c:{lv:0,hits:[]},h:{lv:0,hits:[]}};if(window.drawScreenDamage)setTimeout(()=>{try{window.drawScreenDamage()}catch(e){}},30);UH=ok&&Array.isArray(x.UH)?x.UH:[];GH=ok&&Array.isArray(x.GH)?x.GH:[];GD=ok&&Array.isArray(x.GD)?x.GD:[];CM=ok&&Array.isArray(x.CM)?x.CM:[];gMc=-1;lastMv=null;MV=[];punishCnt=0;specStrokes=[];updPunishBtn()}if(oidCode!==code){oid='';oidCode=code}if(UQ)clearTimeout(UQ.timer);UQ=null;UI=null;if(VQ)clearTimeout(VQ.timer);VQ=null;VI=null;lastOpen=null;byeSeen=false;awaitAck=0;lastConn=null;lastRx=Date.now();el('g').classList.toggle('xai',!mp);el('xchat').style.display='';el('xsp').classList.remove('xo');unread=0;badge();el('xcf').style.display='none';
if(mp){chSync();el('xlog').innerHTML='';chShow('xs','💬 '+oppNick+'님과의 1:1 채팅이에요. 상대에게만 보여요');CH.log.forEach(m=>chShow(m.c,m.t))}el('xcom').innerHTML='';CM.forEach(m=>comShow(m,1));setTab('c');el('xin').value='';upd()};
let lastS=0;
function chSend(){const i=el('xin'),t=i.value.trim().slice(0,100);if(!t||Date.now()-lastS<400)return;
if(!(conn&&conn.open)){toast('상대와 연결되지 않았어요',2000);return}
try{bcast({k:'chat',t,from:isSpec?'👁️'+nick():nick()})}catch(e){toast('전송에 실패했어요',2000);return}
lastS=Date.now();chAdd('xa',t);i.value='';if(matchMedia('(pointer:coarse)').matches)i.blur()}
el('xsend').onpointerdown=e=>e.preventDefault();el('xsend').onclick=chSend;
el('xin').onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229){e.preventDefault();chSend()}};
const idle=(f,n)=>{n=n||0;if(over||!inGame)return;if(anim||busy){if(n<60)setTimeout(()=>idle(f,n+1),100);return}f()};
const canPass=()=>inGame&&!over&&!anim&&!busy&&turn===me&&!chk(me);
function doPass(s){if(over||!inGame)return;UH.push(snap(s));if(UH.length>40)UH.shift();xsave();lastMv={mc:mc+1,a:s,pass:1,fresh:1};MV.push(lastMv);if(MV.length>8)MV.shift();mc++;lm=null;sel=null;toast(nm(s)+'나라가 한번 쉬었어요',2500);setTurn(s=='c'?'h':'c')}
let cfy=null;
let cfn=null;function ask(t,m,y,f,nl,n){el('xct').textContent=t;el('xcm').textContent=m;el('xcy').textContent=y;el('xcn').textContent=nl||'취소';cfy=f;cfn=n||null;el('xcf').style.display='flex'}
el('xcn').onclick=()=>{el('xcf').style.display='none';cfy=null;const n=cfn;cfn=null;if(n)n()};
el('xcy').onclick=()=>{el('xcf').style.display='none';const f=cfy;cfy=null;cfn=null;if(f)f()};
el('xpass').onclick=()=>{if(!inGame||over)return;if(UQ)return toast('무르기 응답을 기다리는 중이에요',2000);
if(turn!==me||anim||busy)return toast('내 차례에만 쉴 수 있어요',2000);
if(chk(me))return toast('장군 상태에서는 쉴 수 없어요',2500);
ask('⏸ 한번쉼','이번 차례를 쉬고 상대에게 넘길까요?','쉬기',()=>idle(()=>{
if(!canPass())return toast('지금은 쉴 수 없어요',2000);
if(cfg.mode=='mp'){if(!(conn&&conn.open))return toast('상대와 다시 연결하는 중이에요…',2500);try{bcast({k:'pass'})}catch(e){return}}
doPass(me)}))};
el('xres').onclick=()=>{if(!inGame||over)return;
ask('🏳 기권','정말 기권할까요? 이 판은 패배로 처리돼요.','기권하기',()=>idle(()=>{
if(cfg.mode=='mp'){try{bcast({k:'resign'})}catch(e){}}
note='기권했어요';end(opp())}))};
window.jgExtra=function(d){if(!d||typeof d!=='object')return false;lastRx=Date.now();if(awaitAck){awaitAck=0;sysLog('✅ 상대와 다시 연결됐어요','xs xg')}if(d.k==='hb')return true;
if(d.k==='uq'||d.k==='ua'||d.k==='ux')return undoMsg(d);
if(d.k==='vq'||d.k==='va'||d.k==='vx')return voidMsg(d);
if(d.k==='nuke'){nukeFire(d.by||side2(me));return true}
if(d.k==='meteor'){meteorFire(d.by||side2(me));return true}
if(d.k==='alien'){alienFire(d.by||side2(me));return true}
if(d.k==='kame'){kameFire(d.by||side2(me));return true}
if(d.k==='kame2'){kame2Fire(d.by||side2(me),d.sd);return true}
if(d.k==='fist'){fistFire(d.by||side2(me),d.sd);return true}
if(d.k==='hammer'){hammerFire(d.by||side2(me),d.sd);return true}
if(d.k==='gun'){gunFire(d.by||side2(me),d.sd);return true}
if(d.k==='sdraw'){if(d.s)specStrokes.push(Object.assign({},d.s,{t0:performance.now()}));return true}
if(d.k==='dmg_sync'&&d.DMG){window.DMG={c:+d.DMG.c||0,h:+d.DMG.h||0};rzK='';try{resize()}catch(e){}return true}
if(d.k==='bd_sync'&&typeof d.idx==='number'){if(window.pickRandomBoard)window.pickRandomBoard(d.idx);return true}
if(d.k==='sdmg_sync'&&d.SDMG){window.SDMG=d.SDMG;if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}return true}
if(d.k==='sclr'){specStrokes=[];toast((d.from||'관전자')+'님이 훈수 그림을 지웠어요',1800);return true}
if(d.k==='spec_join'){sysLog('👁️ '+d.nick+'님이 관전자로 입장했어요 (관전 '+d.scnt+'/4명)','xs xg');return true}
if(d.k==='spec_left'){sysLog('👁️ '+d.nick+'님이 관전을 마쳤어요 (관전 '+d.scnt+'/4명)','xs');return true}
if(d.k==='bye'){byeSeen=true;if(cfg.mode==='mp'&&inGame&&!over){sysLog('🚪 상대가 게임을 나갔어요 (로비로 이동)','xs xr');ping();idle(()=>{if(inGame&&!over)end(me,'상대가 나가서 승리!')})}return true}
if(d.k==='emo'){if(d.q!=null){const t=TA[d.q|0];if(t){chAdd('xb',t);ping()}return true}const e=String(d.e||'');if(EM.has(e)){chAdd('xb',e);ping();if(d.s)emoPop(e)}return true}
if(d.k==='did'){oid=String(d.i||'').replace(/[^\w-]/g,'').slice(0,24);oidCode=code;try{sset('jg_oid',JSON.stringify({key:code,id:oid}))}catch(e){}return true}
if(d.k==='chat'){const t=String(d.t==null?'':d.t).slice(0,100).trim();if(t){chAdd('xb',(d.from?d.from+': ':'')+t);ping()}return true}
if(d.k==='pass'){idle(()=>{if(turn===opp())doPass(opp())});return true}
if(d.k==='resign'){idle(()=>{note='상대가 기권했어요';end(me)});return true}
return false};
function upd(){if(el('g').style.display!=='block')return;
if(cfg.mode==='mp'&&conn&&conn.open&&sentTo!==conn){try{conn.send({k:'did',i:myId(),n:nick()});sentTo=conn}catch(e){}}
eb.style.display=emoSlot()?'flex':'none';netWatch();gTick();netDog();let ok=false;try{ok=canPass()}catch(e){}el('xpass').classList.toggle('xoff',!ok);el('xres').classList.toggle('xoff',!(inGame&&!over));el('xundo').classList.toggle('xoff',!((cfg.mode==='mp'||cfg.mode==='ai')&&inGame&&!over&&!UQ&&lastIdx(me)>=0));el('xvoid').classList.toggle('xoff',!(cfg.mode==='mp'&&inGame&&!over&&!VQ))}

const RK='jg_rec';let note='',oid='',oidCode=null,sentTo=null,TO={c:0,h:0};
function myId(){try{let i=localStorage.getItem('jg_did');if(!i||i.length<8){i=Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('jg_did',i)}return i}catch(e){return 'x'+Math.random().toString(36).slice(2,10)}}
function oidGet(){if(oid&&oidCode===code)return oid;try{const o=JSON.parse(sget('jg_oid')||'null');if(o&&o.key===code&&o.id)return o.id}catch(e){}return''}
function recLoad(){try{const o=JSON.parse(localStorage.getItem(RK)||'null');if(o&&typeof o==='object')return{w:+o.w||0,l:+o.l||0,d:+o.d||0,h:Array.isArray(o.h)?o.h.slice(0,50):[],p:(o.p&&typeof o.p==='object')?o.p:{}}}catch(e){}return{w:0,l:0,d:0,h:[],p:{}}}
function recAdd(r){const o=recLoad(),t=new Date(),p=n=>String(n).padStart(2,'0'),id=oidGet(),nn=String(oppNick).slice(0,12),pk=id||('n:'+nn);o[r]++;
o.h.unshift({t:p(t.getMonth()+1)+'/'+p(t.getDate())+' '+p(t.getHours())+':'+p(t.getMinutes()),n:nn,r,i:id});o.h=o.h.slice(0,50);
const q=o.p[pk]=Object.assign({n:'',w:0,l:0,d:0},o.p[pk]);q.n=nn;q[r]++;
const ks=Object.keys(o.p);if(ks.length>100){const g=k=>o.p[k].w+o.p[k].l+o.p[k].d;ks.sort((x,y)=>g(x)-g(y)).slice(0,ks.length-100).forEach(k=>delete o.p[k])}
try{localStorage.setItem(RK,JSON.stringify(o))}catch(e){}return{o,q}}
const recTxt=o=>'통산 '+o.w+'승 '+o.l+'패'+(o.d?' '+o.d+'무':'');
const _end=end;end=function(w,msg){const was=inGame&&!over&&cfg.mode==='mp',wg=inGame&&!over;_end.apply(this,arguments);if(wg){try{commEnd(w,msg)}catch(e){}bgStop(true)}if(was&&msg)sysLog('🏁 '+msg,'xs xg');if(window.jgSmashEnd)try{window.jgSmashEnd(w,msg)}catch(e){};
if(voidG){el('os').textContent='🤝 무효판 · 전적에 기록되지 않아요'}else if(was){const x=recAdd(w==null?'d':(w===me?'w':'l'));el('os').textContent=(note?note+' · ':'')+recTxt(x.o)+' / 이 상대와 '+x.q.w+'승 '+x.q.l+'패'+(x.q.d?' '+x.q.d+'무':'')}else if(note)el('os').textContent=note;note='';voidG=false};
const _lobby=lobby;lobby=function(){bgStop(true);const a=arguments,self=this;if(inGame&&!over&&cfg.mode==='mp'){if(leaving)return;leaving=true;recAdd('l');snd2({k:'bye'});setTimeout(()=>{leaving=false;_lobby.apply(self,a)},200);return}return _lobby.apply(this,a)};el('bl').onclick=lobby;
el('xrec').onclick=()=>{const o=recLoad(),l=el('xrl'),tot=x=>(+x.w||0)+(+x.l||0)+(+x.d||0);el('xrs').textContent=tot(o)?recTxt(o):'아직 기록이 없어요';l.innerHTML='';
const row=(a,b,c,k)=>{const d=document.createElement('div'),x=document.createElement('span'),y=document.createElement('span'),z=document.createElement('span');d.className='xh';x.textContent=a;y.textContent=b;z.textContent=c;if(k)z.className=k;d.append(x,y,z);l.appendChild(d)};
const hd=t=>{const d=document.createElement('div');d.textContent=t;d.style.cssText='color:#f1cf86;font-weight:700;padding:6px 4px 2px;font-size:13px';l.appendChild(d)};
const ps=Object.values(o.p).sort((a,b)=>tot(b)-tot(a)).slice(0,20);
if(ps.length){hd('상대별 전적 (기기 기준)');ps.forEach(q=>row('',String(q.n||'?').slice(0,12),(+q.w||0)+'승 '+(+q.l||0)+'패'+(q.d?' '+q.d+'무':'')))}
if(o.h.length){hd('최근 기록');o.h.slice(0,30).forEach(h=>row(String(h.t||''),'vs '+String(h.n||'?').slice(0,12),h.r=='w'?'승':h.r=='l'?'패':'무',h.r=='w'?'xw':h.r=='l'?'xl':''))}
el('xrd').style.display='flex'};
el('xrc').onclick=()=>el('xrd').style.display='none';
const SW=['아 진짜 답답해 죽겠네!!','이 느림보야 빨리 둬라 ㅅㅂ!!','장기 두다 날 새겠다 ㅅㅂ!!','손이 없냐 발이 없냐!! 빨리 둬!!','야 ㅅㅂ 잠들었냐!! 빨리 둬라!!','아 뭐하냐고 진짜 ㅅㅂ!!'];
let punishCnt=0;
function updPunishBtn(){const pb=el('xpbar'),ct=el('xpcnt');if(!pb)return;if(inGame&&!over&&!isSpec&&punishCnt>0){pb.style.display='flex';if(ct)ct.textContent='(보유: '+punishCnt+'회)'}else{pb.style.display='none'}}
window.jgTO=function(s){if(over||!inGame)return;if(cfg.mode!=='mp'&&s!==me)return;const n=++TO[s];xsave();try{commTO(s,n)}catch(e){}const t=el('xto'),m=el('xtm'),f=el('xfl');
m.textContent=n==1?'⏰ 시간초과!!':SW[(n-2)%SW.length];m.className=n==1?'':'xsm';el('xts').textContent=nm(s)+'나라 시간초과 '+n+'회';
try{const r=cv.getBoundingClientRect();t.style.left=(r.left+OX+4*CX)+'px';t.style.top=(r.top+OY+4.5*CY)+'px'}catch(e){}
t.style.display='flex';[t,f].forEach(x=>{x.classList.remove('xgo');void x.offsetWidth;x.classList.add('xgo')});try{boom();snd('clash',3)}catch(e){}
if(!isSpec&&s!==me){punishCnt++;updPunishBtn();toast('⚡ 상대가 시간초과했습니다! 우측/하단 [응징 발동] 버튼으로 랜덤 공격을 날리세요!',3800)}
else if(cfg.mode==='ai'&&s===me){setTimeout(()=>{if(!inGame||over||nkBusy)return;const sk=['nuke','meteor','alien','kame','kame2','fist','hammer','gun'][Math.random()*8|0];if(sk==='nuke')nukeFire(side2(me));else if(sk==='meteor')meteorFire(side2(me));else if(sk==='alien')alienFire(side2(me));else if(sk==='kame')kameFire(side2(me));else if(sk==='kame2')kame2Fire(side2(me));else if(sk==='fist')fistFire(side2(me));else if(sk==='hammer')hammerFire(side2(me));else gunFire(side2(me))},1200)}};
el('xto').onanimationend=()=>{el('xto').style.display='none'};
const EN=[],EH=[],EM=new Set(),eb=el('xemo');
function emoSlot(){return inGame&&!over&&cfg.time>0&&tleft/cfg.time<.4&&(cfg.mode==='mp'||turn===me)}
function emoPop(e){const t=el('xem');t.textContent=e;try{const r=cv.getBoundingClientRect();t.style.left=(r.left+OX+4*CX)+'px';t.style.top=(r.top+OY+4.5*CY)+'px'}catch(x){}t.style.display='block';t.classList.remove('xgo');void t.offsetWidth;t.classList.add('xgo')}
el('xem').onanimationend=()=>{el('xem').style.display='none'};
[[EN,0],[EH,1]].forEach(([a,s])=>a.forEach(e=>{const b=document.createElement('button');b.textContent=e;if(s)b.className='xhot';b.onpointerdown=ev=>ev.preventDefault();
b.onclick=()=>{if(!emoSlot())return toast('남은 시간이 30% 미만일 때만 쓸 수 있어요',2000);if(!(conn&&conn.open))return toast('상대와 연결되지 않았어요',2000);if(Date.now()-lastS<600)return;
try{conn.send({k:'emo',e,s})}catch(x){return}lastS=Date.now();chAdd('xa',e);if(s)emoPop(e)};eb.appendChild(b)}));

/* ---- 조롱 랜덤 채팅 ---- */
const TA=['아직도 생각 중이야? 😴','해 뜨겠다 빨리 둬 ㅋㅋ','거북이도 너보단 빠르겠다 🐢','기다리다 라면 불었다 🍜','혹시 화면 멈춘 거 아니지? 🧊','장기판에 뿌리내리겠다 ㅋㅋ','생각한다고 수가 나오냐 ㅋㅋ','나 기다리다 늙겠다 👴','지금 계산기 두드리는 중이냐? 🧮','시간 다 가는데 괜찮냐? ㅋㅋ'];

/* ---- 무르기 (상대 승인 필요) ---- */
let UH=[],UQ=null,UI=null;
const snap=w=>({B:JSON.parse(JSON.stringify(B)),mc,lm:lm?lm.slice():null,w});
const lastIdx=s=>{for(let i=UH.length-1;i>=0;i--)if(UH[i].w===s)return i;return-1};
const _dm=doMove;doMove=function(m){if(!anim&&!over){try{const pc=B[m[1]][m[0]],vc=B[m[3]][m[2]];lastMv={mc:mc+1,a:turn,p:pc?pc.t:'',v:vc?vc.t:null,m:[m[0],m[1],m[2],m[3]],fresh:1};MV.push(lastMv);if(MV.length>8)MV.shift();
if(vc&&vc.t==='R'&&pc&&pc.s!==vc.s){
  if(!isSpec&&pc.s===me){
    punishCnt++;updPunishBtn();
    sysLog('🔥 상대 차(車) 포획! [응징 파괴 스킬 +1 충전] (보유: '+punishCnt+'회)','xs xg');
    toast('🔥 상대 차(車)를 잡았습니다! 응징 파괴 스킬 1회 충전!',3200);
  }else if(cfg.mode==='ai'&&pc.s!==me){
    sysLog('😱 AI가 내 차(車)를 포획하여 응징 스킬을 발동합니다!','xs xr');
    setTimeout(()=>{if(!inGame||over)return;const sk=['nuke','meteor','alien','kame','kame2','fist','hammer','gun'][Math.random()*8|0];if(sk==='nuke')nukeFire(side2(me));else if(sk==='meteor')meteorFire(side2(me));else if(sk==='alien')alienFire(side2(me));else if(sk==='kame')kameFire(side2(me));else if(sk==='kame2')kame2Fire(side2(me));else if(sk==='fist')fistFire(side2(me));else if(sk==='hammer')hammerFire(side2(me));else gunFire(side2(me))},900);
  }
}}catch(e){}UH.push(snap(turn));if(UH.length>40)UH.shift();xsave();if(UI){UI=null;el('xcf').style.display='none';toast('상대가 수를 두어 무르기 요청이 취소됐어요',2500)}}return _dm.apply(this,arguments)};
const _pl=play;play=function(){if(UQ){toast('무르기 응답을 기다리는 중이에요',2000);return}return _pl.apply(this,arguments)};
function doUndo(to){const i=UH.findIndex(h=>h.mc===to);if(i<0||over||!inGame)return false;const h=UH[i];UH.length=i;xsave();B=JSON.parse(JSON.stringify(h.B));mc=h.mc;lm=h.lm?h.lm.slice():null;sel=null;anim=null;busy=false;jang=null;setTurn(h.w);try{commUndo(h.w)}catch(e){}return true}
const snd2=o=>{try{bcast(o)}catch(e){}};
el('xundo').onclick=()=>{if(cfg.mode!=='mp'||!inGame||over)return;
if(UQ)return toast('상대의 응답을 기다리는 중이에요',2000);
if(!(conn&&conn.open))return toast('상대와 연결되지 않았어요',2000);
if(lastIdx(me)<0)return toast('무를 수가 없어요',2000);
ask('↩ 무르기','내 마지막 수를 무르자고 상대에게 요청할까요? 상대가 허락해야 무를 수 있어요.','요청하기',()=>idle(()=>{
const i=lastIdx(me);if(i<0||!(conn&&conn.open))return toast('무를 수가 없어요',2000);
const r=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
UQ={r,to:UH[i].mc,timer:setTimeout(()=>{if(UQ&&UQ.r===r){snd2({k:'ux',r});UQ=null;toast('응답이 없어 무르기 요청을 취소했어요',2500)}},30000)};
snd2({k:'uq',r,to:UQ.to,cur:mc});toast('무르기를 요청했어요. 상대의 응답을 기다려요…',3000)}))};
function respond(ok,why){const u=UI;if(!u)return;UI=null;
if(!ok){snd2({k:'ua',r:u.r,ok:0,why:why||0});return}
idle(()=>{if(over||!inGame||mc!==u.cur){snd2({k:'ua',r:u.r,ok:0,why:2});toast('그 사이 상황이 바뀌어 무르기가 취소됐어요',2500);return}
if(doUndo(u.to)){snd2({k:'ua',r:u.r,ok:1});toast('무르기를 허락했어요',2500)}else snd2({k:'ua',r:u.r,ok:0,why:1})})}
function undoMsg(d){const r=String(d.r||'').slice(0,24);
if(d.k==='uq'){if(!inGame||over||cfg.mode!=='mp')return true;const to=+d.to,cur=+d.cur;
if(!Number.isFinite(to)||!Number.isFinite(cur)||UH.findIndex(h=>h.mc===to&&h.w===(me=='c'?'h':'c'))<0){snd2({k:'ua',r,ok:0,why:1});return true}
UI={r,to,cur};const ph=String(d.p||'').replace(/[<>]/g,'').slice(0,24);if(ph)sysLog('🙇 '+nmOf(opp())+'님의 굴욕 멘트: “'+ph+'” (무르기 요청)','xs xr');ask('↩ 무르기 요청','상대가 마지막 수를 무르자고 해요.'+(ph?' 굴욕 멘트: “'+ph+'”.':'')+' 허락할까요?','허락',()=>respond(true),'거절',()=>respond(false));return true}
if(d.k==='ux'){if(UI&&UI.r===r){UI=null;cfy=null;cfn=null;el('xcf').style.display='none';toast('상대가 무르기 요청을 취소했어요',2500)}return true}
if(d.k==='ua'){if(!UQ||UQ.r!==r)return true;clearTimeout(UQ.timer);const q=UQ;UQ=null;
if(d.ok)idle(()=>{toast(doUndo(q.to)?'무르기가 허락됐어요 ↩':'무르기에 실패했어요',2500)});
else toast(d.why==2?'그 사이 상황이 바뀌어 무르기가 취소됐어요':d.why?'무를 수 없는 상황이에요':'상대가 무르기를 거절했어요 🙅',2500);return true}
return true}

/* ---- 저장 도우미 · 접속 로그 ---- */
const sget=k=>{try{return sessionStorage.getItem(k)||localStorage.getItem(k)}catch(e){return null}};
const sset=(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}try{localStorage.setItem(k,v)}catch(e){}};
function xsave(){sset('jg_x',JSON.stringify({sid,UH,TO,DMG:window.DMG||{c:0,h:0},SDMG:window.SDMG||{c:{lv:0,hits:[]},h:{lv:0,hits:[]}},GH,GD,CM}))}
let lastOpen=null,byeSeen=false,leaving=false;
function sysLog(t,c){const d=new Date(),p=n=>String(n).padStart(2,'0');chAdd(c||'xs','['+p(d.getHours())+':'+p(d.getMinutes())+'] '+t)}
function netWatch(){if(cfg.mode!=='mp'||!inGame||over){lastOpen=null;lastConn=null;return}const o=!!(conn&&conn.open);if(lastOpen===null){lastOpen=o;lastConn=conn;return}
if(o===lastOpen){if(o&&conn!==lastConn){lastConn=conn;awaitAck=Date.now();sysLog('🔌 새 연결로 바뀌었어요. 상대 응답을 확인하는 중…','xs')}return}
lastOpen=o;lastConn=conn;
if(!o){if(!byeSeen){sysLog(navigator.onLine===false?'⚠️ 내 인터넷 연결이 끊겼어요. 다시 연결 중…':'⚠️ 상대와의 연결이 끊겼어요 (튕김·화면 전환·네트워크 문제). 2분 안에 돌아오지 않으면 승리 처리돼요','xs xr');ping();try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}}}
else{byeSeen=false;awaitAck=Date.now();sysLog('🔌 접속됐어요. 상대 응답을 확인하는 중…','xs');snd2({k:'hb'})}}

/* ---- 전황 게이지 · 그래프 ---- */
let GH=[],gMc=-1,GD=[],CM=[],lastMv=null,MV=[];
function gEval(){let a=0,b=1.5;for(let y=0;y<10;y++)for(let x=0;x<9;x++){const q=B[y][x];if(q){if(q.s==='c')a+=VAL[q.t];else b+=VAL[q.t]}}
const pos=Math.max(-1.5,Math.min(1.5,(ev('c',1)-ev('c',0))/10)),mob=Math.max(-1.5,Math.min(1.5,(all('c').length-all('h').length)*.05));
let d=(a-b)+pos+mob;if(chk('h'))d+=.5;if(chk('c'))d-=.5;return{d,a,b}}
function gTxt(){const p=GH.length?GH[GH.length-1]:null;if(p==null)return;const c=Math.round(p*100);el('xgs').textContent='초 '+c+'%  vs  한 '+(100-c)+'%'}
function gUpd(){try{const e=gEval();let pi=mc-1;while(pi>=0&&GD[pi]==null)pi--;
const prevD=pi>=0?GD[pi]:null,prevP=pi>=0?GH[pi]:null,dS=prevD==null?e.d:prevD*.45+e.d*.55;
let p=Math.min(.97,Math.max(.03,1/(1+Math.exp(-dS/7.5))));if(prevP!=null)p=Math.min(prevP+.15,Math.max(prevP-.15,p));p=Math.round(p*1000)/1000;
GH.length=mc;GD.length=mc;GH[mc]=p;GD[mc]=Math.round(dS*100)/100;
const c=Math.round(p*100);el('xgf').style.width=c+'%';el('xgl').textContent='초 '+c+'%';el('xgr').textContent=(100-c)+'% 한';el('xgn').textContent='전력 초 '+e.a.toFixed(1)+' : 한 '+e.b.toFixed(1);
if(prevP!=null&&Math.abs(p-prevP)>=.08){const g=el('xgb');g.classList.remove('xp');void g.offsetWidth;g.classList.add('xp')}
const l=lastMv&&lastMv.fresh&&lastMv.mc===mc?lastMv:null;
if(l){l.fresh=0;try{commentate(l,prevP,p,e)}catch(x){}}else if(mc===0&&!CM.length){comm(fill(pick(CB.start,'s0'),{C:tag('c'),H:tag('h')}),'start',0)}
gTxt();if(el('xgd').style.display==='flex')gDraw();if(cfg.mode==='mp')xsave()}catch(x){}}
/* ---- 축구 해설 ---- */
const PN={R:'차',C:'포',N:'마',B:'상',G:'사',P:'졸',K:'궁'},side2=s=>s==='c'?'h':'c';
const pname=(t,s)=>t==='P'&&s==='h'?'병':(PN[t]||'말');
const jo=(w,x,y)=>{const c=w.charCodeAt(w.length-1)-44032;return w+((c>=0&&c<11172&&c%28)?x:y)};
const nmOf=s=>s===me?nick():(cfg.mode==='mp'?(oppNick||'상대'):'COM'),tag=s=>{const n=nmOf(s);return n==='COM'?n:n+'님'};
const rnd=k=>{k=String(k);let h=1779033703^k.length;for(let i=0;i<k.length;i++){h=Math.imul(h^k.charCodeAt(i),3432918353);h=h<<13|h>>>19}h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^h>>>16)>>>0)/4294967296};
const rr=k=>rnd((sid||'x')+':'+mc+':'+k),pick=(a,k)=>a[Math.floor(rr(k)*a.length)];
const jo2={'이':['이','가'],'을':['을','를'],'은':['은','는']};
const fill=(t,c)=>t.replace(/\{([PQTX])(이|을|은)\}/g,(m,k,j)=>jo(c[k]||'말',jo2[j][0],jo2[j][1])).replace(/\{([A-Z]{1,2})\}/g,(m,k)=>c[k]==null?'':c[k]);
const CB={
start:['🎙 안녕하세요 시청자 여러분!! 오늘의 빅매치, 초나라 {C} 대 한나라 {H}!! 지금 첫 수를 둡니다, 킥오프!!','🎙 경기장이 후끈 달아올랐습니다!! 초나라 {C}, 한나라 {H}, 숨 막히는 한 판이 시작됩니다!!','🎙 장기 팬 여러분 반갑습니다! 초 {C} 선수, 한 {H} 선수, 오늘 누가 웃을까요!!','🎙 해설석에 앉았습니다! {C} 대 {H}, 이 승부 놓치면 후회합니다!!'],
chk2:['게다가 장군까지!!','그것도 장군으로!! 이건 무섭습니다!!','거기에 장군!! {V}, 정신이 없어요!!','덤으로 장군!! 몰아칩니다!!'],
cf1:['{V}의 응수는 단 한 가지뿐!!','피할 길이 딱 하나 남았습니다!!'],cf2:['{V}, 선택지가 거의 없습니다!','응수할 길이 몇 개 안 남았어요!'],
rev:['🔥 역전!! 이제 {L}, 앞서갑니다!!','🌪️ 흐름이 완전히 바뀌었습니다!! {L}, 단숨에 앞서 나가요!!','🔄 순식간에 뒤집혔습니다!! {L}의 시대가 열립니다!!','🎢 롤러코스터 승부!! 이제 {L}가 웃습니다!!'],
swing:['📈 분위기가 확 달라졌어요!','🧠 조용한 한 수였지만 효과는 폭발적!!'],
to:['⏰ 아~ {A}, 시간이 다 됐습니다!! 장고에 빠졌어요! {V}, 하품 중…','⌛ {A}의 시계가 빨간불!! 어서 두셔야 합니다!!','🐌 느긋하네요 {A}!! 시간은 {V}의 편입니다!!'],
to2:['🐢 {A}의 시계가 또 바닥났습니다!! 심판이 손목시계를 쳐다보네요!','😴 {V}, 기다리다 졸고 있어요!! {A}, 제발 한 수만 둬 주세요!!','⏳ 또 시간초과!! {A}, 이쯤이면 시간이 {A}를 기다려 주는 건가요?!','🥱 {V}, 하품이 세 번째입니다!! {A}, 빨리요!!'],
undo:['↩️ 무르기 성사!! {A}의 수가 없던 일이 됩니다!! 심판도 눈을 의심해요!!','⏪ 시간을 되돌렸습니다!! {A}, 한 번의 기회를 얻었어요!!','🧽 지우개 등장!! {A}의 수가 깔끔하게 사라졌습니다!!'],
end:['🏁 경기 종료!! {W}, 승리!! {L}, 아쉽게 무너졌습니다. 정말 박진감 넘치는 한 판이었어요!!','🏆 끝났습니다!! {W}의 완벽한 마무리!! {L}, 고개를 떨굽니다!!','🎉 승자는 {W}!! {L}, 정말 잘 싸웠습니다!!','👑 오늘의 주인공은 {W}!! {L}, 다음엔 꼭 복수하세요!!'],
res:['🏳️ {L}, 백기를 듭니다!! {W}, 승리를 거머쥡니다!!','🏳️ 항복 선언!! {L}의 용단, {W}가 웃습니다!!','🏳️ {L}, 여기까지입니다. {W}, 승리!!'],
left:['🚪 {L}, 경기장을 떠납니다!! 부전승으로 {W} 승리!!','🚪 {L}의 자리가 비었습니다!! {W}, 부전승!!','🚪 {L}, 도망… 아니 퇴장!! {W}의 승리로 끝납니다!!'],
fist:['👊 분노의 철권 작렬!! {A}가 주먹으로 {V} 진영 쪽 액정을 그대로 가격합니다!!','💥 콰아앙!! {A}의 핵주먹이 {V} 진영 화면에 꽂히며 강화유리가 박살납니다!!','👊 샷건 발동!! {A}가 {V} 진영 쪽 화면에 정권을 꽂아 넣습니다!!','⚡ 핸드폰 액정 파손!! {A}의 주먹 강타에 {V} 진영 액정이 갈라집니다!!'],hammer:['🔨 오함마 등장!! {A}가 거대한 쇠망치로 {V} 진영 화면을 내려찍습니다!!','💥 쨍그랑!! {A}의 망치질에 {V} 진영 쪽 액정이 깨지며 빛이 번집니다!!','🔨 {A}가 망치로 {V} 진영 화면을 직격해 유리에 금이 갑니다!!','⚡ 콰광!! {A}의 풀스윙 망치 타격에 {V} 진영 쪽 강화유리가 파손됩니다!!'],gun:['🔫 실탄 사격 개시!! {A}가 권총을 난사해 {V} 진영 화면에 총알구멍을 뚫습니다!!','💥 탕! 탕! 탕! 탕! {A}의 총격에 {V} 진영 쪽 액정이 관통당합니다!!','🔫 화면 피격!! {A}가 쏜 총탄이 {V} 진영 유리에 탄흔을 남깁니다!!','⚡ 스나이퍼 {A}!! {V} 진영 화면 곳곳에 정밀 총격을 퍼붓습니다!!'],kame2:['💥 초사이어인 3 풀파워 에네르기파 2 작렬!! {A}의 극초대형 기공포가 {V}의 장기판과 액정을 통째로 분쇄합니다!!','⚡ 에네르기파 2 발사!! {A}가 폭발시킨 청백색 섬광 에너지파가 {V} 진영을 대각선으로 관통하며 초토화합니다!!','🔥 한계 돌파 에네르기파 2!! {V}의 장기판이 거대한 기공 파동에 휩쓸려 산산조각 납니다!!'],kame:['🐉 에네르기파(カメハメ波) 발사!! {A}의 초사이어인 블루 오라가 폭발하며 {V}의 진영을 관통합니다!!','💥 카~메~하~메~ 파앗!! {A}가 모은 초대형 기공포가 {V}의 장기판을 집어삼킵니다!!','⚡ 푸른 기공파가 화면을 가릅니다!! {V}, 에네르기파 직격탄에 진영이 초토화됩니다!!','🔥 초사이어인 강림!! {A}의 풀파워 에네르기파가 {V}의 진영을 대폭발시킵니다!!'],alien:['👽 UFO 출현!! {A}가 외계인 침공군을 소환해 {V}의 진영을 초토화합니다!!','🛸 우주선에서 외계인 특공대가 내려옵니다!! {V}, 플라즈마 레이저를 피하세요!!','👽 삐리삐리!! {A}의 외계인 함대가 장기판을 레이저로 지져버립니다!!','🛸 외계인 총공격!! 초록빛 산성 에너지와 전격 빔이 {V}의 진영을 덮칩니다!!'],meteor:['메테오 소환!! {A}의 하늘에서 불덩이가 쏟아집니다!!','{V}, 위를 보세요!! {A}의 메테오가 장기판을 덮칩니다!!','판 전체가 불바다!! {A}, 이건 너무 화려한 반칙 아닙니까?!','불의 비가 내립니다!! {A}의 메테오 샤워!!','장기판이 활활 타오릅니다!! {A}, 소방관을 불러야겠어요!!'],nuke:['핵폭탄 투하!! {A}, {V}의 진영을 통째로 날려버립니다!!','경보 발령!! {A}의 핵폭탄이 장기판 한복판에 떨어집니다!!','판이 흔들립니다!! {A}가 버튼을 눌렀어요, {V} 괜찮으십니까?!','심판 대피하세요!! {A}의 핵폭탄 투하!!','이건 반칙 아닙니까?! {A}, 핵폭탄을 꺼냈습니다!!'],voidg:['🤝 무효판 선언!! 두 분의 합의로 이 판은 없던 일이 됩니다!!','🧾 기록에 남지 않는 판!! 서로 웃으며 마무리합니다!!','🕊️ 무효판!! 승패 없이 깔끔하게 정리됩니다!!'],draw:['🤝 무승부!! 승부를 가리지 못했습니다!! 박수를 보냅니다!!','🤝 팽팽했던 승부, 무승부로 끝납니다!!']};
const BD={
adv:['{A}의 {P이} {Z} {VB}','{A}, {P을} 앞으로 내보냅니다. {Z} {VB}','{Z} {P이} {VB} — {A}의 선택입니다','{A}의 {P은} 전진 중! {Z} {VB}','한 수 한 수 쌓아 갑니다. {A}의 {P이} {Z} {VB}','{A}, 서두르지 않습니다. {P이} {Z} {VB}','{P이} {Z} {VB}! {A}의 전진 배치!','{A}가 {P을} 한 걸음 밀어 올립니다. {Z} {VB}'],
ret:['{A}, {P을} 뒤로 물립니다. 일단 수비부터!','{A}의 {P이} 한 걸음 후퇴! 신중하네요','물러설 땐 물러서는 법! {A}, {P을} 거둬들입니다','{A}의 {P이} 뒤로 슬쩍… 방어 태세!','{A}, 후퇴도 전략입니다. {P이} 자리를 바꿉니다','{A}의 {P이} 한 발 빼는군요. 진용을 정비합니다'],
side:['{A}의 {P이} 옆으로 슬금슬금 {VB}','{A}, {P을} 옆으로 돌립니다. 각도를 재는 걸까요','{P이} 측면으로 이동! {A}의 노림수가 있을까요','{A}, 정면 대신 옆길로! {P이} {Z} 자리를 잡습니다','{A}의 {P은} 게걸음 중!','{A}, {P을} 슬쩍 비켜 세웁니다. 의도가 궁금하네요'],
deep:['{A}의 {P이} {Z} 침투합니다! {V}, 뒤가 간질간질하죠?','과감합니다! {A}, {P을} {Z} 밀어 넣습니다!','{Z}까지 파고드는 {A}의 {P}! 적진이 술렁입니다','{A}의 {P이} 적진 한복판에 깃발을 꽂습니다!','{V}, 조심하세요! {A}의 {P이} {Z} 도착했습니다','겁이 없네요 {A}! {P이} {Z} 들어갑니다'],
pal:['{A}의 {P이} {V}의 궁성 문을 두드립니다!','궁성 입장! {A}, 아슬아슬한 곳까지 왔어요!','{V}의 안방에 {A}의 {P이} 들어섰습니다!','{A}, 궁성 코앞에서 {P을} 세웁니다. 숨 막히는 압박!','{V}, 궁성이 시끌시끌합니다! {A}의 {P이} 진입!'],
open:['{N}수째, 첫 걸음은 {A}의 {P}! 어떤 그림을 그릴까요','{A}, 포문을 엽니다! {P이} {VB}','판이 열렸습니다! {A}의 {P이} 먼저 움직입니다','탐색전입니다. {A}, {P을} 슬쩍 건드려 봅니다','본격적인 전투 전 몸풀기! {A}의 {P이} {VB}'],
thr:['{A}의 {P이} {V}의 {T을} 정조준!! {V}, 눈치채셨나요?','{P이} 자리를 잡자마자 {V}의 {T을} 노립니다!','칼끝이 {V}의 {T}에게 향했습니다! {A}, 노림수가 날카롭습니다','{A}, 은근슬쩍 {V}의 {T을} 겨냥합니다. 이건 위협적이에요!','{V}의 {T}, 안전하지 않습니다! {A}의 {P이} 바라보고 있어요'],
hang:['어어? {A}, 그 자리는 위험한데요?! {V}의 {X이} 노리고 있습니다!','{A}의 {P}, 공짜 선물이 될 수도 있습니다! {V}, 눈이 반짝입니다','이거 괜찮은 겁니까 {A}?! {P이} 위험 지대에 서 있어요!','아슬아슬합니다! {V}의 {X이} {A}의 {P을} 노려보고 있어요!','{A}, 대담한 건지 무모한 건지… {P이} 사선에 섰습니다!'],
rep:['{A}, 아까 그 자리로 되돌아옵니다?! 탁구 치시나요?','왔다갔다 왔다갔다~ {A}의 {P}, 갈팡질팡합니다','{A}의 {P이} 제자리걸음! 시간을 벌려는 걸까요?','같은 길을 또 걷는 {A}! 장고의 흔적입니다','{P이} 원위치! {A}, 뭔가 깨달았나 봅니다'],
chk:['{A}, {V}의 궁을 압박합니다! {V}, 식은땀이 주르륵!!','매서운 장군!! {A}의 {P이} {V}의 궁을 노립니다!','장군입니다!! 관중석이 술렁입니다!! {V}, 침착해야 해요!','{A}의 {P이} 칼을 겨눴습니다! {V}, 어떻게 막아낼까요!!','숨 막히는 장군!! {V}의 궁이 흔들립니다!','장군이요~!! {A}의 {P이} 궁을 향해 달려듭니다!'],
cB:['이럴 수가!! {A}의 {P이} {V}의 차를 통째로 삼킵니다!! 판이 뒤집어집니다!!','골~~~ 아니 차입니다!! {A}, 천금 같은 한 방으로 {V}의 차를 잡아냅니다!!','{V}, 이건 뼈아픕니다!! 차를 내주고 말았어요! {A}의 기세가 무섭습니다!!','{A}의 {P이} {V}의 차를 낚아챕니다!! 이건 경기를 좌우할 한 수!!','대형 사고!! {V}의 차가 사라졌습니다!! {A}, 환호하는 중!!'],
cM:['{A}의 {P이} {V}의 포를 낚아챕니다!! 이건 큽니다 큽니다!!','날카로운 침투!! {A}, {V}의 포를 그대로 가져갑니다!!','{V}의 포가 사라졌습니다!! {A}, 아주 영리한 플레이!!','포 사냥 성공!! {A}의 {P이} 깔끔하게 마무리합니다!!','{V}, 포를 잃었습니다!! 이건 쓰립니다!!'],
cD:['{A}의 {P이} {V}의 {Q을} 낚아챕니다! 분위기가 확 넘어옵니다!','정확합니다! {A}, {V}의 {Q을} 놓치지 않습니다!','{A}, 깔끔하게 {Q} 하나 챙겨갑니다! {V}, 표정이 굳어요!','{V}의 {Q이} 쓰러졌습니다! {A}의 {P이} 멋지게 해냈어요!','{A}의 {P}, 사냥 성공! {V}의 {Q}, 아쉽게 퇴장합니다'],
cS:['{A}, {Q} 하나 슬쩍~ 야금야금 갑니다!','작지만 알찬 수확! {A}, {V}의 {Q을} 가져갑니다!','{V}의 {Q이} 쓰러졌습니다. 작은 균열이 시작될까요?','{A}의 {P이} {Q} 하나를 톡! 티끌 모아 태산!','{Q} 한 마리 포획! {V}, 아직 괜찮습니다!'],
rec:['{A}, 곧바로 되받아칩니다!! {Q을} 가져가며 맞교환!!','눈에는 눈, 이에는 이!! {A}의 {P이} {Q을} 되찾습니다!!','복수는 즉시!! {A}, {V}의 {Q을} 낚아챕니다!!','{V}가 가져간 자리, {A}의 {P이} 다시 점령합니다!','주고받는 난타전!! {A}의 {P이} {Q을} 되받아칩니다!!'],
mate:['외통수!!! {A}의 {P이} 마지막 문을 닫습니다!! {V}, 더 이상 피할 곳이 없어요!!','끝났습니다!! 외통수!! {V}의 궁이 갈 곳을 잃었어요!!','장군에 멍군도 못 부릅니다!! {A}, 완벽한 마무리!!','{A}의 {P이} 결정타!! {V}, 도망칠 길이 없습니다!!'],
pass:['{A}, 한 수 쉬어갑니다. 여유일까요, 시간 끌기일까요?','{A}의 한수쉼!! 차 한잔 하자는 건가요? {V}, 당황한 기색!','쉬어가는 한 수! {A}, 이 정적… 뭔가 준비 중일지도 모릅니다!','{A}, 이번 차례는 패스!! 칼을 갈고 있는 걸까요?','한수쉼 선언! {A}, 여유가 넘칩니다. 아니면 할 게 없는 걸까요?']};
const EJ={mate:['🏁','☠️'],cB:['🚨','💥','😱'],cM:['🔥','⚡','😮'],cD:['⚔️','🎯','👏'],cS:['🗡️','🐜','👀'],rec:['🔁','🤺','⚖️'],chk:['🚨','🔔','😤'],hang:['😵','🤭','😬'],thr:['🎯','👁️','🧲'],rep:['🔄','🏓','🌀'],pal:['🏯','🚪','🕵️'],deep:['🚀','🧗','🌊'],open:['🎬','🆕','🌅'],adv:['➡️','👣','⬆️'],ret:['↩️','🐌','🛡️'],side:['↔️','🧭','🦀'],pass:['😴','🍵','🕊️']};
const EX=['자,','오,','어어?','이야~','흠,','캬~','와,','네,','자자,','오호?','헉,','보세요,','잠깐!','아니,','허허,','음~','하하,','이런,','좋아요,','호오,','어머,','자 보시죠,','그렇죠,','아하,','어라?'];
const VBP={R:['쭉 미끄러집니다','직선으로 내달립니다','번개처럼 달립니다','시원하게 질주합니다'],C:['훌쩍 넘어갑니다','포신을 돌립니다','다리를 놓고 점프합니다','포물선을 그립니다'],N:['도약합니다','사뿐히 뜁니다','날렵하게 튀어 오릅니다','깡충 뜁니다'],B:['성큼성큼 건너갑니다','큰 걸음을 내딛습니다','우아하게 활보합니다'],G:['조용히 자리를 옮깁니다','궁성을 단단히 지킵니다','살며시 이동합니다'],P:['한 칸 전진합니다','씩씩하게 나아갑니다','용감하게 한 발 내딛습니다','터벅터벅 걸어갑니다'],K:['조심스레 움직입니다','살금살금 자리를 바꿉니다','눈치를 보며 옮겨 갑니다']};
const TL={tie:['지금은 호각입니다.','전력은 거의 같아요.','저울이 팽팽합니다.'],lead:['우세는 {LD}, 격차는 {DF}입니다.','현재 {LD} 쪽이 {DF} 앞서 있어요.','전력상 {LD}가 {DF} 정도 앞섭니다.'],cnt:['남은 말은 초 {NC}개, 한 {NH}개.','병력은 초 {NC} 대 한 {NH}!','판 위에는 초 {NC}개, 한 {NH}개가 남았습니다.'],num:['어느덧 {N}수째입니다.','{N}수째, 승부는 계속됩니다.','벌써 {N}번째 수!'],ph:{o:['아직 초반, 탐색전이 이어집니다.','초반 포석이 한창입니다.'],m:['중반 승부처로 접어듭니다.','중반전, 슬슬 불꽃이 튑니다.'],e:['이제 종반 승부입니다!','말이 줄어든 종반, 한 수 한 수가 승부처!','종반전! 실수 하나가 곧 패배!']},pc:['승률은 초 {PC}% 대 한 {PH}%.','게이지는 초 {PC} : 한 {PH}!','현재 승률 초 {PC}%, 한 {PH}%.']};
const JK={R:['차(車)라고 차(茶)만 마시는 건 아니죠~ ☕','차가 달린다~ 차(車)차차! 💃','차(車) 막힐 땐 우회하세요~ 장기판이라 우회가 안 되네요 ㅋㅋ'],C:['포(包)기하지 마세요! 포가 열심히 날고 있잖아요~','포(包)장 이사 아니고 포(包)격입니다! 💣','포(包)인트는 포! 이건 못 참죠~'],N:['마(馬)! 이게 말(馬)이 되는 소리입니까! 🐴','마(馬)음 급해지네요~ 마(馬)음!','말(馬)이 달리면 말(言)도 필요 없죠~'],B:['상(象)상도 못 한 한 수! 상(象)상!','상(象) 받을 만한 한 수입니다! 🏅','코끼리 상(象)이 코로 장기를 둡니다~ 🐘'],G:['사(士)고 쳤습니다! 사(士)고!','사(士)수생처럼 궁성을 지킵니다~ 📚','사(士)랑하는 궁을 지키려 합니다~ 💕'],P:['졸(卒)졸졸 따라다니는 졸! 💧','졸(卒)지 마세요! 졸(卒)음 주의!','작은 졸이 큰일을 냅니다~ 졸(卒)개의 반란!'],K:['궁(宮)금하죠? 궁(宮)의 운명이!','궁(宮)지에 몰리지 마세요~ 궁(宮)색하게 ㅋㅋ','궁(宮)이 흔들립니다… 궁(宮)한 처지!']};
const GJ=['장기판 위의 영화는 장기 상영 중입니다~ 🎬','장군이요~ 멍군! 멍멍! 🐶','시간이 금이라는데 이 판은 금광입니다 ⏱️','수 싸움엔 소금 말고 눈치가 필요하죠 🧂','두 분 다 땀이 한 근입니다 💦','관중석에선 팝콘이 동났다고 합니다 🍿','이 승부, 영화로 만들면 천만 관객입니다 🎥','해설위원도 손에 땀이 납니다 😅','심장이 쫄깃쫄깃~ 장기 쫄깃! 💓','한 수 접어줄 때도 있는 법! 😏','장기 두다 허리 나가겠습니다 ㅋㅋ','오늘 판은 소장각입니다 📺','이 정도면 장기(長技)자랑 대회!','수(手)가 수(水)처럼 흐릅니다~ 🌊'];
const TT=['{V}, 손이 얼어붙었나요? 핫팩 드릴까요? 🔥','{V}, 그 수는 AI도 울고 갑니다 ㅋㅋ 🤖','{V}, 장기판 처음 보시나요? 😏','{V}, 고민하시는 동안 저는 점심 먹고 왔습니다 🍚','{A}, 여유 만만! {V}는 땀이 뻘뻘~ 💦','{V}, 지금 표정 관리 안 되시죠? 😂','{A}의 미소가 심상치 않습니다 😎','{V}, 기도하세요… 🙏 아니면 무르기를…','{V}, 혹시 눈 감고 두시나요? 👀','{V}, 괜찮아요. 져도 울진 않죠? 휴지 준비했습니다 🧻','{A}, 오늘 컨디션 최고조! {V}, 분발하세요! 📣','{V}, 아직 안 끝났어요… 아마도요 ㅋㅋ'];
let ucc=0,ucm=0,curTab='c';
const tabsOn=()=>getComputedStyle(el('xtabs')).display!=='none';
function tabBadge(){const x=el('xtcb'),y=el('xtmb');x.textContent=ucc>9?'9+':ucc;x.style.display=ucc?'block':'none';y.textContent=ucm>9?'9+':ucm;y.style.display=ucm?'block':'none'}
function setTab(t){curTab=t;const c=el('xchat');c.classList.toggle('tc',t==='c');c.classList.toggle('tm',t==='m');el('xtc').classList.toggle('xon',t==='c');el('xtm').classList.toggle('xon',t==='m');if(t==='c')ucc=0;else ucm=0;tabBadge();const l=el(t==='c'?'xlog':'xcom');l.scrollTop=l.scrollHeight}
function tabBump(t){if(!tabsOn()||curTab===t)return;if(t==='c')ucc++;else ucm++;tabBadge()}
el('xtc').onclick=()=>setTab('c');el('xtm').onclick=()=>setTab('m');
function comShow(m,q){const l=el('xcom'),d=document.createElement('div'),b=document.createElement('b');d.className='xcl';b.textContent=m.n+'수';d.append(b,document.createTextNode(' '+m.t));l.appendChild(d);while(l.childNodes.length>160)l.removeChild(l.firstChild);l.scrollTop=l.scrollHeight;if(!q)tabBump('m')}
function banner(t,big){const b=el('xcb');b.textContent=t;b.classList.toggle('xq',!big);try{const r=cv.getBoundingClientRect(),h=($('hud')&&$('hud').offsetHeight)||46;b.style.left=(r.left+6)+'px';b.style.width=(r.width-12)+'px';b.style.top=(r.top+h+6)+'px'}catch(e){}b.style.display='block';b.classList.remove('xgo');void b.offsetWidth;b.classList.add('xgo')}
el('xcb').onanimationend=()=>{el('xcb').style.display='none'};
function comm(t,k,sw,nb){const m={n:mc,t,k,sw:sw||0};CM.push(m);if(CM.length>160)CM.shift();comShow(m);if(cfg.mode==='mp')xsave();if(!nb)banner(t,/^(cap|chk|mate|rev|swing|end|to|undo|start|pass)$/.test(k))}
const tlPool=(tk,c)=>tk==='lead'?(Math.abs(c._df)<1?TL.tie:TL.lead):tk==='ph'?TL.ph[c._ph]:TL[tk];
function compose(cat,c,plain){const used=new Set(CM.map(m=>m.t));let t='';
for(let i=0;i<16;i++){const k='a'+i;t=pick(BD[cat],'b'+k);
if(!plain){t=pick(EJ[cat]||['🎙'],'j'+k)+' '+(rr('x'+k)<.5?pick(EX,'x'+k)+' ':'')+t;
if(rr('t'+k)<.6){const tk=pick(['lead','cnt','num','ph','pc'],'y'+k);t+=' '+pick(tlPool(tk,c),'l'+k)}
if(rr('q'+k)<.45){const q=rr('z'+k);t+=' '+(q<.4?pick(JK[c._pt]||GJ,'q'+k):q<.7?pick(GJ,'q'+k):pick(TT,'q'+k))}}
t=fill(t,c);if(!used.has(t))return t}
return t+' ('+c.N+'수)'}
function commentate(l,pp,p,e){const A=l.a,Vs=side2(A),c={A:tag(A),V:tag(Vs),C:tag('c'),H:tag('h'),N:mc,PC:Math.round(p*100),PH:100-Math.round(p*100),_pt:l.p};
let nc=0,nh=0;for(let y=0;y<10;y++)for(let x=0;x<9;x++){const q=B[y][x];if(q){if(q.s==='c')nc++;else nh++}}
c.NC=nc;c.NH=nh;c._ph=mc<=10?'o':(nc+nh<=14?'e':'m');const df=e.a-(e.b-1.5),ad=Math.abs(df);c._df=df;c.LD=tag(df>=0?'c':'h');
c.DF=ad<2.5?'졸 하나':ad<4?'상(사) 하나':ad<6?'마 하나':ad<9?'포 하나':ad<14?'차 하나':'차 하나 이상';
const dp=pp==null?0:p-pp,adv=A==='c'?dp:-dp,val=l.v?VAL[l.v]:0,lead=x=>x>=.5?'c':'h';
const flip=pp!=null&&Math.abs(pp-.5)>=.04&&lead(pp)!==lead(p)&&Math.abs(p-.5)>=.03;c.L=tag(lead(p));
let cat='pass',kind='pass',ck=false,rp=-1,mate=false;
if(!l.pass){const[x1,y1,x2,y2]=l.m,mp=B[y2][x2];c.P=pname(l.p,A);c.Q=l.v?pname(l.v,Vs):'';
const fwd=A==='c'?y1-y2:y2-y1,rank=A==='c'?9-y2:y2,pal=x2>=3&&x2<=5&&(Vs==='c'?y2>=7:y2<=2);
c.Z=pal?'적 궁성 앞':rank>=7?'적진 깊숙이':rank>=4?'중원에서':'자기 진영에서';c.VB=pick(VBP[l.p]||['움직입니다'],'vb');
const tg=mp?moves(B,x2,y2).map(([a,b])=>B[b][a]).filter(q=>q&&q.s===Vs&&q.t!=='K').sort((a,b)=>VAL[b.t]-VAL[a.t])[0]:null;if(tg)c.T=pname(tg.t,Vs);
let mn=99;all(Vs).forEach(mm=>{if(mm[2]===x2&&mm[3]===y2){const q=B[mm[1]][mm[0]];if(VAL[q.t]<mn){mn=VAL[q.t];c.X=pname(q.t,Vs)}}});
const hang=mn<99&&l.p!=='K'&&mn<VAL[l.p];ck=chk(Vs);rp=ck?legal(Vs).length:-1;mate=ck&&rp===0;
const pv=MV.length>=2?MV[MV.length-2]:null,recap=l.v&&pv&&!pv.pass&&pv.v&&pv.a!==A&&pv.m&&pv.m[2]===x2&&pv.m[3]===y2;
const pm=MV.slice(0,-1).reverse().find(q=>q.a===A&&!q.pass),rep=pm&&pm.m&&pm.m[0]===x2&&pm.m[1]===y2&&pm.m[2]===x1&&pm.m[3]===y1;
cat=mate?'mate':l.v?(recap?'rec':val>=13?'cB':val>=7?'cM':val>=3?'cD':'cS'):ck?'chk':hang?'hang':(tg&&VAL[tg.t]>=3)?'thr':rep?'rep':pal?'pal':rank>=7?'deep':mc<=2?'open':fwd>0?'adv':fwd<0?'ret':'side';
kind=l.v?'cap':mate?'mate':ck?'chk':'mv'}
let t=compose(cat,c,mate);
if(!mate){if(l.v&&ck)t+=' '+pick(CB.chk2,'c2');if(ck){if(rp===1)t+=' '+pick(CB.cf1,'c3');else if(rp>1&&rp<=3)t+=' '+pick(CB.cf2,'c3')}
if(flip&&!l.pass){t+=' '+pick(CB.rev,'r');if(kind==='mv')kind='rev'}else if(kind==='mv'&&Math.abs(dp)>=.10){kind='swing'}}
comm(fill(t,c),kind,Math.max(Math.abs(dp),val/40))}
function commTO(s,n){comm(fill(pick(n>1?CB.to2:CB.to,'t'+n),{A:tag(s),V:tag(side2(s))}),'to',0)}
function commUndo(s){MV=[];lastMv=null;comm(fill(pick(CB.undo,'u'),{A:tag(s)}),'undo',0)}
function commEnd(w,msg){const W=w?tag(w):'',L=w?tag(side2(w)):'',pf=GH.length?GH[GH.length-1]:.5;
comm(fill(pick(w==null?(voidG?CB.voidg:CB.draw):/기권/.test(note)?CB.res:msg?CB.left:CB.end,'e'),{W,L}),'end',0);
comm('📋 총 '+mc+'수 · 최종 전황 초 '+Math.round(pf*100)+'% : 한 '+(100-Math.round(pf*100))+'% · 🎙 해설 다시보기에서 명장면을 확인하세요!','sum',0,1)}
function openRp(){const g=GH.filter(v=>v!=null),mx=g.length?Math.max(...g):.5,mn=g.length?Math.min(...g):.5;let fl=0,ls=null;
g.forEach(v=>{if(Math.abs(v-.5)<.04)return;const s=v>=.5?'c':'h';if(ls&&s!==ls)fl++;ls=s});
el('xrps').textContent='총 '+mc+'수 · 초 최고 '+Math.round(mx*100)+'% / 한 최고 '+Math.round((1-mn)*100)+'% · 역전 '+fl+'회';gDraw(el('xrcv'));
const row=(n,t,box)=>{const d=document.createElement('div'),b=document.createElement('b');d.className='xrl';b.textContent=n;d.append(b,document.createTextNode(t));box.appendChild(d)};
const H=el('xrph'),Lb=el('xrpl');H.innerHTML='';Lb.innerHTML='';
const hl=CM.filter(m=>m.sw>=.05&&m.k!=='end'&&m.k!=='sum').sort((a,b)=>b.sw-a.sw).slice(0,3);
if(hl.length){const h=document.createElement('div');h.textContent='🎬 하이라이트 TOP '+hl.length;h.style.cssText='font-weight:800;padding:4px 0';H.appendChild(h);hl.forEach((m,i)=>row(['🥇','🥈','🥉'][i]+' '+m.n+'수',m.t,H))}
if(!CM.length){const d=document.createElement('div');d.className='xrl';d.textContent='아직 해설이 없어요';Lb.appendChild(d)}
CM.forEach(m=>row(m.n+'수',m.t,Lb));el('xrp').style.display='flex';Lb.scrollTop=Lb.scrollHeight}
el('orp').onclick=openRp;el('xgr2').onclick=()=>{el('xgd').style.display='none';openRp()};el('xrpc').onclick=()=>el('xrp').style.display='none';
function gTick(){if(!inGame||over||anim||!B||gMc===mc)return;gMc=mc;gUpd()}
function gDraw(c){c=c||el('xgcv');const g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);g.fillStyle='#0b1226';g.fillRect(0,0,w,h);
const v=[];let last=.5;for(let i=0;i<GH.length;i++){if(GH[i]!=null)last=GH[i];v.push(last)}
g.strokeStyle='#ffffff2a';g.lineWidth=1;[.25,.5,.75].forEach(q=>{g.setLineDash(q==.5?[]:[4,4]);g.beginPath();g.moveTo(0,h*(1-q));g.lineTo(w,h*(1-q));g.stroke()});g.setLineDash([]);
g.font='bold 11px sans-serif';g.textAlign='left';g.fillStyle='#3fd9a0';g.fillText('초 우세',6,12);g.fillStyle='#ff6a5a';g.fillText('한 우세',6,h-4);
if(v.length<2){g.fillStyle='#c9d3ee';g.font='14px sans-serif';g.textAlign='center';g.fillText('수를 두면 그래프가 그려져요',w/2,h/2);return}
const X=i=>8+(w-16)*i/(v.length-1),Y=q=>h-10-(h-20)*q;
g.beginPath();g.moveTo(X(0),Y(.5));v.forEach((q,i)=>g.lineTo(X(i),Y(q)));g.lineTo(X(v.length-1),Y(.5));g.closePath();g.fillStyle='#ffffff14';g.fill();
g.lineWidth=2.5;g.lineJoin='round';for(let i=1;i<v.length;i++){g.strokeStyle=(v[i]+v[i-1])/2>=.5?'#3fd9a0':'#ff6a5a';g.beginPath();g.moveTo(X(i-1),Y(v[i-1]));g.lineTo(X(i),Y(v[i]));g.stroke()}
const lp=v[v.length-1];g.fillStyle=lp>=.5?'#3fd9a0':'#ff6a5a';g.beginPath();g.arc(X(v.length-1),Y(lp),4.5,0,7);g.fill()}
el('xgm').onclick=()=>{gDraw();gTxt();el('xgd').style.display='flex'};
el('xgc').onclick=()=>el('xgd').style.display='none';

/* ---- 일반 폰 세로: 채팅 시트 · 전체화면 ---- */
let unread=0;
const sheetOn=()=>{const b=el('xchb');return !!b&&getComputedStyle(b).display!=='none'};
function badge(){const b=el('xbd');b.textContent=unread>9?'9+':unread;b.style.display=unread?'block':'none'}
el('xchb').onclick=()=>{const o=el('xsp').classList.toggle('xo');if(o){unread=0;badge();const l=el('xlog');l.scrollTop=l.scrollHeight}};
{const fb=el('xfs'),de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen;
if(!rq)fb.remove();else fb.onclick=e=>{e.stopPropagation();try{if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const r=rq.call(de);if(r&&r.catch)r.catch(()=>toast('전체화면을 지원하지 않는 환경이에요',2000))}}catch(x){}}}
/* ---- 재접속 감시: 끊긴 채 멈춰 있으면 다시 접속 시도 ---- */
let wdT=0,wdN=0,errT={},lastRx=Date.now(),rxConn=null,awaitAck=0,hbT=0,lastConn=null;document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastRx=Date.now();if(awaitAck)awaitAck=Date.now()}});
function netDog(){if(cfg.mode!=='mp'||!inGame||over||!window.Peer){wdN=0;return}
const t0=Date.now();if(rxConn!==conn){rxConn=conn;lastRx=t0}
if(conn&&conn.open){if(t0-hbT>3000){hbT=t0;snd2({k:'hb'})}
if(awaitAck&&t0-awaitAck>8000){awaitAck=0;sysLog('⚠️ 상대가 응답하지 않아요. 연결을 새로 잡아요…','xs xr');try{conn.close()}catch(e){}return}
if(!document.hidden&&t0-lastRx>12000){sysLog('⚠️ 상대 신호가 12초째 없어요. 연결을 새로 잡아요…','xs xr');lastRx=t0;try{conn.close()}catch(e){}return}
wdN=0;return}
const now=Date.now();if(now-wdT<8000)return;wdT=now;wdN++;
if(isHost){if(!peer||peer.destroyed||(!peer.open&&wdN>2)||wdN%5===0){sysLog('🔁 방을 다시 여는 중…','xs xr');try{mkRoom(code)}catch(e){}}else if(peer.disconnected){try{peer.reconnect()}catch(e){}}}
else if(now-jLast>15000){sysLog('🔁 상대에게 다시 접속하는 중…'+(wdN>1?' ('+wdN+')':''),'xs xr');try{doJoin(true)}catch(e){}}}
{let n=0;const patch=()=>{if(!window.Peer||!Peer.prototype||Peer.__x)return !!(window.Peer&&Peer.__x);Peer.__x=1;const E=Peer.prototype.emit;
Peer.prototype.emit=function(t){if((t==='error'||t==='disconnected')&&cfg.mode==='mp'&&inGame&&!over){const ty=t==='error'?(arguments[1]&&arguments[1].type||'?'):'서버 연결 끊김',k=Date.now();if(!(errT[ty]>k-10000)){errT[ty]=k;try{sysLog('⚠️ 연결 오류: '+ty,'xs xr')}catch(x){}}}return E.apply(this,arguments)};return true};
if(!patch()){const iv=setInterval(()=>{if(patch()||++n>40)clearInterval(iv)},500)}}

/* ---- 무효판 (상대 동의 필요 · 전적 미기록) ---- */
let VQ=null,VI=null,voidG=false;
el('xvoid').onclick=()=>{if(cfg.mode!=='mp'||!inGame||over)return;
if(VQ)return toast('상대의 응답을 기다리는 중이에요',2000);
if(UQ||UI)return toast('무르기 처리 중이에요',2000);
if(!(conn&&conn.open))return toast('상대와 연결되지 않았어요',2000);
ask('🤝 무효판','서로 동의하면 이 판을 없던 일로 해요. 승패 전적에 기록되지 않아요. 상대에게 요청할까요?','요청하기',()=>{
if(over||!inGame||!(conn&&conn.open))return;const r=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
VQ={r,timer:setTimeout(()=>{if(VQ&&VQ.r===r){snd2({k:'vx',r});VQ=null;toast('응답이 없어 무효판 요청을 취소했어요',2500)}},30000)};
snd2({k:'vq',r});toast('무효판을 요청했어요. 상대의 응답을 기다려요…',3000)})};
function endVoid(){idle(()=>{if(!inGame||over)return;voidG=true;end(null,'무효판')})}
function voidMsg(d){const r=String(d.r||'').slice(0,24);
if(d.k==='vq'){if(!inGame||over||cfg.mode!=='mp')return true;
if(VQ){clearTimeout(VQ.timer);VQ=null;snd2({k:'va',r,ok:1});endVoid();return true}
if(UI||VI||UQ){snd2({k:'va',r,ok:0,why:3});return true}
VI={r};ask('🤝 무효판 요청','상대가 이 판을 무효판으로 하자고 해요. 승패 전적에 기록되지 않아요. 허락할까요?','허락',()=>{if(!VI||VI.r!==r)return;VI=null;snd2({k:'va',r,ok:1});endVoid()},'거절',()=>{if(VI&&VI.r===r){VI=null;snd2({k:'va',r,ok:0})}});return true}
if(d.k==='vx'){if(VI&&VI.r===r){VI=null;cfy=null;cfn=null;el('xcf').style.display='none';toast('상대가 무효판 요청을 취소했어요',2500)}return true}
if(d.k==='va'){if(!VQ||VQ.r!==r)return true;clearTimeout(VQ.timer);VQ=null;if(d.ok)endVoid();else toast(d.why===3?'상대가 다른 요청을 처리 중이에요':'상대가 무효판을 거절했어요 🙅',2500);return true}
return true}
/* ---- BGM: 게임 중 랜덤 연속 재생 (bgm1~6.mp3) ---- */
const BG=['bgm1.mp3','bgm2.mp3','bgm3.mp3','bgm4.mp3','bgm5.mp3','bgm6.mp3'],BN=['Majiwaru Michi','Kami no Itte','Liyue','Moon in One’s Cup','비익련리','얼음연못'];
let bgOn=true,bgWant=false,bgQ=[],bgLast=-1,bgCur=-1,bgFail=0,bgFT=0;try{bgOn=localStorage.getItem('jg_bgm')!=='0'}catch(e){}
const au=new Audio();au.preload='auto';au.volume=.3;
function bgBtn(){el('xbg').textContent=bgOn?'🎵':'🔇'}
function bgPick(){if(!bgQ.length){bgQ=BG.map((_,i)=>i);for(let i=bgQ.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[bgQ[i],bgQ[j]]=[bgQ[j],bgQ[i]]}}let i=bgQ.pop();if(i===bgLast&&bgQ.length){const k=bgQ.pop();bgQ.push(i);i=k}return i}
function bgPlay(){if(!bgWant||!bgOn)return;const i=bgPick();bgLast=bgCur=i;au.src=BG[i];const pr=au.play();if(pr&&pr.then)pr.then(()=>{bgFail=0;toast('🎵 '+BN[i],2200)}).catch(()=>{})}
au.onended=()=>bgPlay();
au.onerror=()=>{if(!bgWant||!bgOn)return;if(++bgFail<=BG.length)setTimeout(bgPlay,200);else if(bgFail===BG.length+1)toast('BGM 파일을 찾을 수 없어요 (bgm1~6.mp3)',3000)};
function bgStart(){clearInterval(bgFT);au.volume=.3;bgWant=true;bgBtn();if(bgOn)bgPlay()}
function bgStop(fade){bgWant=false;clearInterval(bgFT);if(!fade||au.paused){au.pause();return}let v=au.volume;bgFT=setInterval(()=>{v-=.03;if(v<=0){clearInterval(bgFT);au.pause();au.volume=.3}else au.volume=v},100)}
const bgUnlock=()=>{if(bgWant&&bgOn&&au.paused){if(au.src&&bgCur>=0&&!au.ended){const pr=au.play();if(pr&&pr.catch)pr.catch(()=>{})}else bgPlay()}};
['pointerdown','touchend','click','keydown'].forEach(t=>addEventListener(t,bgUnlock,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)au.pause();else bgUnlock()});
el('xbg').onclick=()=>{bgOn=!bgOn;try{localStorage.setItem('jg_bgm',bgOn?'1':'0')}catch(e){}bgBtn();if(bgOn){if(bgWant)bgPlay()}else au.pause()};
bgBtn();
/* bgm7.mp3, bgm8.mp3 … 번호만 이어서 폴더에 넣으면 자동으로 목록에 추가 (연속 2개가 없으면 탐색 종료) */
(async()=>{let miss=0;for(let n=7;n<=60&&miss<2;n++){const f='bgm'+n+'.mp3';
const ok=await new Promise(r=>{const t=new Audio();let d=0;const fin=v=>{if(d)return;d=1;t.onerror=t.onloadedmetadata=null;try{t.removeAttribute('src');t.load()}catch(e){}r(v)};t.preload='metadata';t.onloadedmetadata=()=>fin(true);t.onerror=()=>fin(false);setTimeout(()=>fin(false),5000);t.src=f});
if(ok){miss=0;BG.push(f);BN.push('BGM '+n);bgQ=[]}else miss++}})();
