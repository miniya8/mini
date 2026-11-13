(function(){
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

/* ---- 핵폭탄 이펙트: 폭탄 낙하 → 섬광 → 버섯구름, 장기판 흔들림 (약 4.6초 · 고해상도 · rAF) ---- */
let nkBusy=false,nkAt=0;const nkS={},e3=u=>1-Math.pow(1-u,3),sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const CL={hot:[255,238,160],mid:[255,150,40],red:[215,62,22],sr:[96,40,26],sg:[84,76,72]};
function nkSpr(c){const k=c.join();if(nkS[k])return nkS[k];const s=document.createElement('canvas');s.width=s.height=128;const g=s.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64),q=`${c[0]},${c[1]},${c[2]}`;
r.addColorStop(0,`rgba(${q},1)`);r.addColorStop(.5,`rgba(${q},.55)`);r.addColorStop(1,`rgba(${q},0)`);g.fillStyle=r;g.fillRect(0,0,128,128);return nkS[k]=s}
function nkSound(){try{const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());if(a.state==='suspended')a.resume();const t=a.currentTime,ti=t+1.12;
const o=a.createOscillator(),g=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(1600,t);o.frequency.exponentialRampToValueAtTime(260,ti);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04,t+.2);g.gain.linearRampToValueAtTime(.08,ti-.05);g.gain.linearRampToValueAtTime(0,ti);o.connect(g);g.connect(a.destination);o.start(t);o.stop(ti+.02);
const b=a.createOscillator(),bg=a.createGain();b.type='sine';b.frequency.setValueAtTime(90,ti);b.frequency.exponentialRampToValueAtTime(22,ti+2.2);bg.gain.setValueAtTime(.7,ti);bg.gain.exponentialRampToValueAtTime(.001,ti+2.6);b.connect(bg);bg.connect(a.destination);b.start(ti);b.stop(ti+2.7);
const len=Math.floor(a.sampleRate*3),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
const n=a.createBufferSource();n.buffer=buf;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(2400,ti);lp.frequency.exponentialRampToValueAtTime(120,ti+2.6);const ng=a.createGain();ng.gain.value=.7;n.connect(lp);lp.connect(ng);ng.connect(a.destination);n.start(ti)}catch(e){}}
function nuke(A){if(nkBusy)return;nkBusy=true;
const W=innerWidth,H=innerHeight;let d=Math.min(devicePixelRatio||1,3);while(W*d*H*d>7e6&&d>1)d-=.25;
const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:9;pointer-events:none';document.body.appendChild(c);const g=c.getContext('2d');
let rc={left:0,top:0};try{rc=cv.getBoundingClientRect()}catch(e){}
const V=side2(A),isTB=flip?(V==='h'):(V==='c'),bx=rc.left+OX+4*CX,by=rc.top+OY+(isTB?7.5:2.2)*CY,S=Math.min(W,H),cx=isFinite(bx)?bx:W/2,gy=isFinite(by)?Math.min(by,H*.95):H*(isTB?.8:.32),T=1.15,END=4.6,name=tag(A);
let sd=20261028;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
const stem=[],cap=[],skirt=[],deb=[];
for(let i=0;i<30;i++)stem.push({f:i/29,o:(rn()-.5)*2,r:.7+rn()*.6,k:rn()});
for(let i=0;i<70;i++){const a=rn()*Math.PI*2;cap.push({a,rad:Math.sqrt(rn()),r:.6+rn()*.8,k:rn()})}
for(let i=0;i<24;i++)skirt.push({a:i/24*Math.PI*2+rn()*.2,r:.8+rn()*.5,k:rn()});
const hasInd='translate' in cv.style;cv.style.willChange='transform';cv.style.pointerEvents='none';
const duck=au.volume;au.volume=Math.min(duck,.06);try{navigator.vibrate&&navigator.vibrate([40,40,40,40,500,60,300])}catch(e){}nkSound();
const spr=(k,x,y,s,a,add)=>{if(a<=.003||s<=0)return;g.globalAlpha=Math.min(1,a);g.globalCompositeOperation=add?'lighter':'source-over';g.drawImage(nkSpr(CL[k]),x-s/2,y-s/2,s,s)};
const bomb=(x,y,s,rot)=>{g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=1;g.globalCompositeOperation='source-over';
g.strokeStyle='rgba(90,235,255,.4)';g.lineWidth=s*.2;g.beginPath();g.ellipse(0,0,s*.42,s*.95,0,0,7);g.stroke();
const gr=g.createLinearGradient(-s*.4,0,s*.4,0);gr.addColorStop(0,'#2a0a0a');gr.addColorStop(.35,'#d32020');gr.addColorStop(.7,'#8a1010');gr.addColorStop(1,'#1c0505');g.fillStyle=gr;g.beginPath();g.ellipse(0,0,s*.42,s*.95,0,0,7);g.fill();
g.fillStyle='#1a1a1f';g.beginPath();g.moveTo(-s*.28,s*.72);g.quadraticCurveTo(0,s*1.4,s*.28,s*.72);g.closePath();g.fill();
g.fillStyle='#ffd54a';g.fillRect(-s*.4,-s*.12,s*.8,s*.1);
g.fillStyle='#232328';[-1,1].forEach(m=>{g.beginPath();g.moveTo(m*s*.4,-s*.5);g.lineTo(m*s*.78,-s*1.08);g.lineTo(m*s*.14,-s*.82);g.closePath();g.fill()});g.restore()};
const t0=performance.now();let last=t0,dbOn=false;
const finish=()=>{c.remove();cv.style.willChange='';cv.style.pointerEvents='';if(hasInd){cv.style.translate='';cv.style.rotate='';cv.style.scale=''}else cv.style.transform='';au.volume=Math.max(au.volume,duck>.06?duck:.3);nkBusy=false};
const frame=now=>{const t=Math.max(0,(now-t0)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';
const ti=t-T,u=Math.max(0,ti/3.1),eu=e3(Math.min(1,u));
// 흔들림 (장기판 캔버스)
const amp=t<T?S*.004*sm(.2,T,t):S*.075*Math.exp(-ti*1.25)*(1-sm(3.4,END,t));
const dx=amp*(Math.sin(t*47)*.6+Math.sin(t*83+1.3)*.3+Math.sin(t*131+.4)*.1),dy=amp*.8*(Math.sin(t*53+.7)*.6+Math.sin(t*97)*.3+Math.sin(t*149+2)*.1),rot=amp*.06*Math.sin(t*41),sc=1+(ti>=0?.05*Math.exp(-ti*5):0);
if(hasInd){cv.style.translate=dx+'px '+dy+'px';cv.style.rotate=rot+'deg';cv.style.scale=sc}else cv.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(${sc})`;
if(t<T){ // 낙하
 const k=t/T,by0=-S*.2,by1=gy-S*.04,y=by0+(by1-by0)*k*k,x=cx+Math.sin(t*5)*S*.012,s=S*.085;
 const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(70,0,0,${.45*sm(0,.5,t)})`);g.fillStyle=v;g.fillRect(0,0,W,H);
 for(let i=0;i<9;i++)spr('mid',x,y-i*s*.55,s*(1.5-i*.1),(1-i/9)*.5*k+.1,true);
 bomb(x,y,s,Math.sin(t*3)*.08);
 // 초음속 낙하 마하 콘(Sonic Mach Cone)
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=0.55*k;
 const mg=g.createLinearGradient(x,y+s,x,y-s*2.4);
 mg.addColorStop(0,'rgba(255,255,255,0.9)');mg.addColorStop(0.4,'rgba(0,229,255,0.45)');mg.addColorStop(1,'rgba(0,229,255,0)');
 g.fillStyle=mg;g.beginPath();g.moveTo(x,y+s*1.05);g.lineTo(x-s*1.25,y-s*2.2);g.lineTo(x+s*1.25,y-s*2.2);g.closePath();g.fill();
 g.restore();
 g.globalAlpha=.75+.25*Math.sin(t*22);g.globalCompositeOperation='source-over';g.font=`900 ${Math.round(S*.1)}px sans-serif`;g.textAlign='center';g.lineWidth=S*.012;g.strokeStyle='#4a0000';g.fillStyle='#ffd54a';g.strokeText('핵폭탄 투하!!',W/2,H*.16);g.fillText('핵폭탄 투하!!',W/2,H*.16)
}else{
 if(!dbOn){dbOn=true;if(window.hitCamp)window.hitCamp(V,'nuke');for(let i=0;i<110;i++){const a=-Math.PI*(.08+.84*rn()),sp=S*(.5+1.6*rn());deb.push({x:cx,y:gy-S*.02,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:1.4+1.8*rn(),a:0,s:S*(.012+.03*rn()),h:rn()<.5?'hot':'mid'})}}
 const stemH=S*1.0*eu,capR=S*(.1+.3*e3(Math.min(1,u*1.15))),capY=gy-stemH,smoke=sm(.05,.6,u),fire=Math.pow(Math.max(0,1-u),1.3);
 // 지면 먼지 벽
 const dw=S*(.3+1.5*e3(Math.min(1,ti/1.6)));spr('sr',cx,gy,dw*1.5,.55*(1-sm(1.2,3.6,ti)),false);g.save();g.translate(cx,gy);g.scale(1,.28);g.globalAlpha=.5*(1-sm(1.4,3.8,ti));g.drawImage(nkSpr(CL.sg),-dw,-dw,dw*2,dw*2);g.restore();
 // 연기층
 stem.forEach(p=>{const y=gy-p.f*stemH,x=cx+p.o*capR*.18*(1-.4*p.f)+Math.sin(t*2+p.k*9)*capR*.02;spr(p.k<.5?'sr':'sg',x,y,capR*.62*p.r*(1+.35*p.f),.62*smoke*(1-sm(3.5,END,t)))});
 skirt.forEach(p=>{const x=cx+Math.cos(p.a)*capR*1.05,y=capY+capR*.28+Math.sin(p.a)*capR*.12;spr(p.k<.5?'sr':'sg',x,y,capR*.5*p.r,.6*smoke*(1-sm(3.5,END,t)))});
 cap.forEach(p=>{const up=Math.sin(p.a)>0,x=cx+Math.cos(p.a)*p.rad*capR*1.15,y=capY-Math.sin(p.a)*p.rad*capR*(up?.62:.22)+Math.sin(t*3+p.k*6)*capR*.015;spr(p.k<.5?'sr':'sg',x,y,capR*.7*p.r,.7*smoke*(1-sm(3.5,END,t)))});
 // 불길층 (가산)
 stem.forEach(p=>{const y=gy-p.f*stemH,x=cx+p.o*capR*.18*(1-.4*p.f);spr(p.f>.6?'hot':'mid',x,y,capR*.5*p.r,.85*fire*(.4+.6*p.f),true)});
 cap.forEach(p=>{const up=Math.sin(p.a)>0,x=cx+Math.cos(p.a)*p.rad*capR*1.15,y=capY-Math.sin(p.a)*p.rad*capR*(up?.62:.22);spr(p.rad<.45?'hot':p.rad<.8?'mid':'red',x,y,capR*.62*p.r,.9*fire,true)});
 // 화구
 const rf=S*(.12+.5*e3(Math.min(1,ti/.9)));spr('hot',cx,gy-rf*.5,rf*3,Math.max(0,1-ti/1.1),true);spr('mid',cx,gy-rf*.5,rf*4.2,.8*Math.max(0,1-ti/1.5),true);
 // 충격파
 [0,.18].forEach(o=>{const q=ti-o;if(q<=0||q>1.6)return;const rr=q*S*1.7;g.globalCompositeOperation='lighter';g.globalAlpha=.7*(1-q/1.6);g.strokeStyle='rgb(255,210,150)';g.lineWidth=Math.max(1.5,S*.012*(1-q/1.6));g.beginPath();g.ellipse(cx,gy,rr,rr*.28,0,0,7);g.stroke();g.beginPath();g.arc(cx,gy-rr*.18,rr*.9,Math.PI*1.06,Math.PI*1.94);g.stroke()});
 // 파편·불씨
 deb.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.8*dt;p.a+=dt;if(p.a<p.l)spr(p.h,p.x,p.y,p.s*3,1-p.a/p.l,true)});
 // 섬광·열기
 const fl=Math.max(0,1-ti/.5);if(fl>0){g.globalCompositeOperation='source-over';g.globalAlpha=.95*fl*fl;g.fillStyle='#fff';g.fillRect(0,0,W,H)}
 const tint=.26*(1-sm(.2,3.6,ti));if(tint>0){g.globalCompositeOperation='lighter';g.globalAlpha=tint;g.fillStyle='#ff6a14';g.fillRect(0,0,W,H)}
 // 문구
 const tq=sm(0,.18,ti)*(1-sm(1.6,2.2,ti));if(tq>0){g.globalCompositeOperation='source-over';g.globalAlpha=tq;const pop=1+.25*Math.exp(-ti*7);g.save();g.translate(W/2,H*.16);g.scale(pop,pop);g.font=`900 ${Math.round(S*.09)}px sans-serif`;g.textAlign='center';g.lineWidth=S*.012;g.strokeStyle='#4a0000';g.fillStyle='#fff3b0';const s2=name+'의 핵폭탄!!';g.strokeText(s2,0,0);g.fillText(s2,0,0);g.restore()}
}
g.globalAlpha=1;g.globalCompositeOperation='source-over';
if(t<END)requestAnimationFrame(frame);else finish()};
requestAnimationFrame(frame)}
function nukeFire(A){try{comm(fill(pick(CB.nuke,'n'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}nuke(A)}

/* ---- 메테오 이펙트: 유성우 낙하 → 충돌 → 장기판 전체에 불길 (약 6.3초 · 고해상도 · rAF) ---- */
function mtSound(ms,T,END){try{const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());if(a.state==='suspended')a.resume();const t=a.currentTime;
const nb=(sec,pw)=>{const len=Math.floor(a.sampleRate*sec),bf=a.createBuffer(1,len,a.sampleRate),ch=bf.getChannelData(0);for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*(pw?Math.pow(1-i/len,pw):1);return bf};
const w=a.createBufferSource();w.buffer=nb(T+.2,0);const bp=a.createBiquadFilter();bp.type='bandpass';bp.Q.value=.8;bp.frequency.setValueAtTime(3000,t);bp.frequency.exponentialRampToValueAtTime(350,t+T);const wg=a.createGain();wg.gain.setValueAtTime(0,t);wg.gain.linearRampToValueAtTime(.3,t+T*.8);wg.gain.linearRampToValueAtTime(0,t+T+.1);w.connect(bp);bp.connect(wg);wg.connect(a.destination);w.start(t);
ms.forEach(m=>{const ti=t+m.t1,o=a.createOscillator(),g=a.createGain(),L=m.main?2.2:.45;o.type='sine';o.frequency.setValueAtTime(m.main?85:130,ti);o.frequency.exponentialRampToValueAtTime(m.main?25:50,ti+L*.8);g.gain.setValueAtTime(m.main?.7:.2,ti);g.gain.exponentialRampToValueAtTime(.001,ti+L);o.connect(g);g.connect(a.destination);o.start(ti);o.stop(ti+L+.05)});
const ti=t+T,n=a.createBufferSource();n.buffer=nb(2.6,2);const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(2200,ti);lp.frequency.exponentialRampToValueAtTime(150,ti+2.4);const ng=a.createGain();ng.gain.value=.55;n.connect(lp);lp.connect(ng);ng.connect(a.destination);n.start(ti);
const cr=a.createBufferSource();cr.buffer=nb(END-T,0);const hp=a.createBiquadFilter();hp.type='highpass';hp.frequency.value=1400;const cg=a.createGain();cg.gain.setValueAtTime(0,ti);for(let s=ti+.2;s<t+END-1;s+=.06+Math.random()*.1)cg.gain.linearRampToValueAtTime(Math.random()*.15,s);cg.gain.linearRampToValueAtTime(0,t+END);cr.connect(hp);hp.connect(cg);cg.connect(a.destination);cr.start(ti)}catch(e){}}
function meteor(A){if(nkBusy)return;nkBusy=true;
const W=innerWidth,H=innerHeight;let d=Math.min(devicePixelRatio||1,3);while(W*d*H*d>7e6&&d>1)d-=.25;
const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:9;pointer-events:none';document.body.appendChild(c);const g=c.getContext('2d');
let rc={left:0,top:0};try{rc=cv.getBoundingClientRect()}catch(e){}
const ox=rc.left+OX,oy=rc.top+OY,bw=8*CX,bh=9*CY,ok=isFinite(ox+oy+bw+bh)&&bw>0,S=Math.min(W,H);
const V=side2(A),isTB=flip?(V==='h'):(V==='c'),bx0=ok?ox-CX*.4:W*.1,bx1=ok?ox+bw+CX*.4:W*.9,by0=ok?(isTB?oy+bh*.52:oy-CY*.4):H*.1,by1=ok?(isTB?oy+bh+CY*.4:oy+bh*.48):H*.5,cx=(bx0+bx1)/2,cy=(by0+by1)/2,cw=Math.max(14,(bx1-bx0)/9),T=1.5,END=6.3,name=tag(A);
let sd=20261029;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
const dir={x:.5,y:.866},ms=[{main:1,tx:cx,ty:cy,t1:T,dur:1.45,r:S*.105,nz:[]}];
for(let i=0;i<9;i++)ms.push({main:0,tx:bx0+(bx1-bx0)*(.1+.8*rn()),ty:by0+(by1-by0)*(.1+.8*rn()),t1:.55+i*.1+rn()*.07,dur:.9+.3*rn(),r:S*(.026+.03*rn()),nz:[]});
ms.forEach(m=>{for(let i=0;i<12;i++)m.nz.push(.82+rn()*.3);m.L=(m.ty+S*.3)/dir.y;m.sp=(rn()-.5)*3;m.fired=false});
const fp=[],deb=[],pulses=[],scorch=[];let acc=0,sacc=0;
const hasInd='translate' in cv.style;cv.style.willChange='transform';cv.style.pointerEvents='none';
const duck=au.volume;au.volume=Math.min(duck,.06);try{navigator.vibrate&&navigator.vibrate([30,50,30,50,30,50,60,40,500,80,300])}catch(e){}mtSound(ms,T,END);
const spr=(k,x,y,w,h,a,add)=>{if(a<=.003||w<=0)return;g.globalAlpha=Math.min(1,a);g.globalCompositeOperation=add?'lighter':'source-over';g.drawImage(nkSpr(CL[k]),x-w/2,y-h/2,w,h)};
const body=(x,y,r,rot,nz)=>{g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.beginPath();nz.forEach((q,i)=>{const a=i/nz.length*Math.PI*2,px=Math.cos(a)*r*q,py=Math.sin(a)*r*q;i?g.lineTo(px,py):g.moveTo(px,py)});g.closePath();
const gr=g.createRadialGradient(-r*.25,-r*.25,r*.1,0,0,r*1.05);gr.addColorStop(0,'#6a3a24');gr.addColorStop(.6,'#2e1710');gr.addColorStop(1,'#120704');g.fillStyle=gr;g.fill();
g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,160,50,.95)';g.lineWidth=Math.max(1,r*.07);g.lineCap='round';
for(let i=0;i<7;i++){const a=i*.9+.3;g.beginPath();g.moveTo(Math.cos(a)*r*.1,Math.sin(a)*r*.1);g.lineTo(Math.cos(a+.25)*r*.45,Math.sin(a+.25)*r*.5);g.lineTo(Math.cos(a-.1)*r*.85,Math.sin(a-.1)*r*.85);g.stroke()}g.restore()};
const trail=(x,y,r,len)=>{const gr=g.createLinearGradient(x,y,x-dir.x*len,y-dir.y*len);gr.addColorStop(0,'rgba(255,230,160,.9)');gr.addColorStop(1,'rgba(255,90,20,0)');g.globalCompositeOperation='lighter';g.globalAlpha=1;g.strokeStyle=gr;g.lineWidth=r*1.1;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(x-dir.x*len,y-dir.y*len);g.stroke();
for(let j=0;j<16;j++){const f=j/15;spr(f<.2?'hot':f<.55?'mid':'red',x-dir.x*len*f,y-dir.y*len*f,r*(3.2-2.4*f),r*(3.2-2.4*f),(1-f)*.7,true)}};
const spawn=(x,y,big)=>{if(fp.length>560)return;fp.push({x,y,vx:(rn()-.5)*S*.05,vy:-S*(.3+.5*rn())*(big?1.25:1),l:.55+.6*rn(),a:0,w:cw*(.6+.8*rn())*(big?1.4:1),ph:rn()*6.28,k:rn()})};
const t0=performance.now();let last=t0;
const finish=()=>{c.remove();cv.style.willChange='';cv.style.pointerEvents='';if(hasInd){cv.style.translate='';cv.style.rotate='';cv.style.scale=''}else cv.style.transform='';au.volume=Math.max(au.volume,duck>.06?duck:.3);nkBusy=false};
const frame=now=>{const t=Math.max(0,(now-t0)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';
const ti=t-T,inten=sm(T-.15,T+.75,t)*(1-sm(END-1.5,END,t));
// 하늘 어둡게 + 붉은 기운
{const v=g.createRadialGradient(W/2,H/2,S*.25,W/2,H/2,Math.max(W,H)*.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(60,6,0,${.5*sm(0,.7,t)*(1-sm(END-1.2,END,t))})`);g.fillStyle=v;g.fillRect(0,0,W,H)}
// 충돌 처리
ms.forEach(m=>{if(!m.fired&&t>=m.t1){m.fired=true;if(m.main&&window.hitCamp)window.hitCamp(V,'meteor');pulses.push({t:m.t1,a:m.main?S*.065:S*.016,k:m.main?1.5:4.5});scorch.push({x:m.tx,y:m.ty,r:m.r*(m.main?7:3.2)});
 for(let i=0;i<(m.main?90:14);i++){const a=-Math.PI*(.05+.9*rn()),sp=S*(.3+1.3*rn())*(m.main?1:.5);deb.push({x:m.tx,y:m.ty,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:1+1.6*rn(),a:0,s:S*(.01+.026*rn()),h:rn()<.5?'hot':'mid'})}}});
// 장기판 흔들림
let amp=S*.004*inten*(.6+.4*Math.sin(t*19));pulses.forEach(p=>{if(t>=p.t)amp+=p.a*Math.exp(-(t-p.t)*p.k)});amp+=S*.0035*sm(.2,T,t)*(t<T?1:0);
const dx=amp*(Math.sin(t*47)*.6+Math.sin(t*83+1.3)*.3+Math.sin(t*131+.4)*.1),dy=amp*.8*(Math.sin(t*53+.7)*.6+Math.sin(t*97)*.3+Math.sin(t*149+2)*.1),rot=amp*.06*Math.sin(t*41),sc=1+(ti>=0?.05*Math.exp(-ti*5):0);
if(hasInd){cv.style.translate=dx+'px '+dy+'px';cv.style.rotate=rot+'deg';cv.style.scale=sc}else cv.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(${sc})`;
// 그을음 자국
scorch.forEach(s=>spr('sr',s.x,s.y,s.r*2.2,s.r*1.1,.5*Math.min(1,inten*1.4+.3)*(1-sm(END-1.3,END,t)),false));
// 불길 생성
const rate=inten*430;acc+=rate*dt;while(acc>=1){acc--;const big=rn()<.12;spawn(bx0+(bx1-bx0)*rn(),by0+(by1-by0)*(.12+.88*Math.pow(rn(),.6)),big)}
ms.forEach(m=>{if(!m.main&&t>m.t1&&t<END-1.6){sacc+=dt*70;while(sacc>=1){sacc--;spawn(m.tx+(rn()-.5)*m.r*5,m.ty+(rn()-.5)*m.r*3,rn()<.3)}}});
// 불길 바닥 열기
if(inten>0){const gr=g.createLinearGradient(0,by1,0,by0);gr.addColorStop(0,'rgba(255,120,20,.55)');gr.addColorStop(.6,'rgba(255,80,10,.18)');gr.addColorStop(1,'rgba(255,60,0,0)');g.globalCompositeOperation='lighter';g.globalAlpha=inten*(.75+.25*Math.sin(t*13));g.fillStyle=gr;g.fillRect(bx0,by0,bx1-bx0,by1-by0)}
// 불길 입자 (세로로 길게 늘린 불꽃 혀)
for(let i=fp.length-1;i>=0;i--){const p=fp[i];p.a+=dt;if(p.a>=p.l){fp.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;const u=p.a/p.l,w=p.w*(1-.5*u),h=w*(2.3+1.2*p.k)*(1-.15*u),sx=Math.sin(p.ph+p.a*7)*w*.22,al=(u<.1?u/.1:1)*Math.pow(1-u,.8)*.85;
 spr(u<.22?'hot':u<.6?'mid':'red',p.x+sx,p.y-h*.35,w,h,al,true);if(u>.55&&p.k<.25)spr('sr',p.x+sx,p.y-h*.9,w*1.6,h*1.1,.18*(1-u),false)}
// 유성
ms.forEach(m=>{const k=(t-(m.t1-m.dur))/m.dur;if(k<0||k>=1)return;const kk=Math.pow(k,1.5),x=m.tx-dir.x*m.L*(1-kk),y=m.ty-dir.y*m.L*(1-kk);trail(x,y,m.r,m.r*(m.main?9:6));spr('hot',x+dir.x*m.r*.3,y+dir.y*m.r*.3,m.r*5,m.r*5,.9,true);spr('mid',x,y,m.r*8,m.r*8,.6,true);body(x,y,m.r,t*m.sp,m.nz)});
// 충돌 섬광 · 충격파
ms.forEach(m=>{const q=t-m.t1;if(q<0||q>1.6)return;const R=m.r*(m.main?9:4);spr('hot',m.tx,m.ty,R*3*(1+q),R*3*(1+q),Math.max(0,1-q/(m.main?.9:.4)),true);
 if(q<(m.main?1.6:.7)){const rr=q*(m.main?S*1.5:S*.35);g.globalCompositeOperation='lighter';g.globalAlpha=.7*(1-q/(m.main?1.6:.7));g.strokeStyle='rgb(255,210,150)';g.lineWidth=Math.max(1.5,S*.01*(1-q/1.6));g.beginPath();g.ellipse(m.tx,m.ty,rr,rr*.3,0,0,7);g.stroke()}});
// 파편·불씨
deb.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.6*dt;p.a+=dt;if(p.a<p.l)spr(p.h,p.x,p.y,p.s*3,p.s*3,1-p.a/p.l,true)});
// 전체 섬광 · 열기
const fl=Math.max(0,1-ti/.5);if(ti>=0&&fl>0){g.globalCompositeOperation='source-over';g.globalAlpha=.85*fl*fl;g.fillStyle='#fff6e0';g.fillRect(0,0,W,H)}
const tint=.2*inten;if(tint>0){g.globalCompositeOperation='lighter';g.globalAlpha=tint*(.85+.15*Math.sin(t*11));g.fillStyle='#ff5a10';g.fillRect(0,0,W,H)}
// 문구
g.globalCompositeOperation='source-over';
if(t<T){g.globalAlpha=.75+.25*Math.sin(t*22);g.font=`900 ${Math.round(S*.1)}px sans-serif`;g.textAlign='center';g.lineWidth=S*.012;g.strokeStyle='#4a0000';g.fillStyle='#ffb74d';g.strokeText('메테오 소환!!',W/2,H*.16);g.fillText('메테오 소환!!',W/2,H*.16)}
else{const tq=sm(0,.18,ti)*(1-sm(1.8,2.4,ti));if(tq>0){g.globalAlpha=tq;const pop=1+.25*Math.exp(-ti*7);g.save();g.translate(W/2,H*.16);g.scale(pop,pop);g.font=`900 ${Math.round(S*.09)}px sans-serif`;g.textAlign='center';g.lineWidth=S*.012;g.strokeStyle='#4a0000';g.fillStyle='#fff3b0';const s2=name+'의 메테오!!';g.strokeText(s2,0,0);g.fillText(s2,0,0);g.restore()}}
g.globalAlpha=1;g.globalCompositeOperation='source-over';
if(t<END)requestAnimationFrame(frame);else finish()};
requestAnimationFrame(frame)}
function meteorFire(A){try{comm(fill(pick(CB.meteor,'m'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'meteor',.3)}catch(e){}meteor(A)}
/* ---- 외계인 침공 스킬 (첨부 이미지 스프라이트 활용 · 약 5.2초 · 고해상도 · rAF) ---- */
const AL_SRC={
  ufo:"assets/images/image_21.webp",
  gun:"assets/images/image_22.webp",
  bg:"assets/images/image_23.webp",
  eg:"assets/images/image_24.webp",
  bb:"assets/images/image_25.webp",
  eb:"assets/images/image_26.webp"
},AL_IM={};
for(const k in AL_SRC){const im=new Image();im.src=AL_SRC[k];AL_IM[k]=im}
function alSound(){try{const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());if(a.state==='suspended')a.resume();const t=a.currentTime;
// UFO 워블 사운드
const o1=a.createOscillator(),lfo=a.createOscillator(),lg=a.createGain(),g1=a.createGain();
o1.type='sine';o1.frequency.setValueAtTime(520,t);lfo.frequency.value=14;lg.gain.value=160;lfo.connect(o1.frequency);
g1.gain.setValueAtTime(.01,t);g1.gain.linearRampToValueAtTime(.22,t+.4);g1.gain.linearRampToValueAtTime(.18,t+3.6);g1.gain.exponentialRampToValueAtTime(.001,t+4.8);
o1.connect(g1);g1.connect(a.destination);o1.start(t);lfo.start(t);o1.stop(t+4.9);lfo.stop(t+4.9);
// 레이저 퓨퓨 & 플라즈마 폭발음
[1.0,1.35,1.7,2.05,2.4,2.75].forEach((dt,idx)=>{
  const z=a.createOscillator(),zg=a.createGain();z.type='sawtooth';
  z.frequency.setValueAtTime(1400+(idx%2)*400,t+dt);z.frequency.exponentialRampToValueAtTime(140,t+dt+.28);
  zg.gain.setValueAtTime(.28,t+dt);zg.gain.exponentialRampToValueAtTime(.001,t+dt+.3);
  z.connect(zg);zg.connect(a.destination);z.start(t+dt);z.stop(t+dt+.32);
});
// 메인 외계 에너지 대폭발 (t+1.6)
const ti=t+1.6,len=Math.floor(a.sampleRate*2.6),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.6);
const n=a.createBufferSource();n.buffer=buf;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(900,ti);bp.frequency.exponentialRampToValueAtTime(180,ti+2.4);
const ng=a.createGain();ng.gain.value=.65;n.connect(bp);bp.connect(ng);ng.connect(a.destination);n.start(ti)}catch(e){}}

function alien(A){if(nkBusy)return;nkBusy=true;
const W=innerWidth,H=innerHeight;let d=Math.min(devicePixelRatio||1,3);while(W*d*H*d>7e6&&d>1)d-=.25;
const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:9;pointer-events:none';document.body.appendChild(c);const g=c.getContext('2d');
let rc={left:0,top:0};try{rc=cv.getBoundingClientRect()}catch(e){}
const ox=rc.left+OX,oy=rc.top+OY,bw=8*CX,bh=9*CY,ok=isFinite(ox+oy+bw+bh)&&bw>0,S=Math.min(W,H);
const V=side2(A),isTB=flip?(V==='h'):(V==='c'),bx0=ok?ox:W*.15,bx1=ok?ox+bw:W*.85,by0=ok?(isTB?oy+bh*.52:oy):H*.12,by1=ok?(isTB?oy+bh:oy+bh*.48):H*.5,cx=(bx0+bx1)/2,cy=(by0+by1)/2,T=1.0,END=5.2,name=tag(A);let impDone=false;
let sd=20261030;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
const ufos=[
  {x0:cx-S*.38,y0:-S*.15,x1:cx-S*.22,y1:by0+bh*.18,s:S*.21,ph:0},
  {x0:cx,y0:-S*.2,x1:cx,y1:by0+bh*.10,s:S*.26,ph:1.7},
  {x0:cx+S*.38,y0:-S*.15,x1:cx+S*.22,y1:by0+bh*.18,s:S*.21,ph:3.4}
];
const gunners=[
  {x:bx0-S*.04,y:cy-bh*.12,flip:0,t0:.8,shots:[1.05,1.75,2.45],ty:cy-bh*.08},
  {x:bx1+S*.04,y:cy+bh*.08,flip:1,t0:.95,shots:[1.30,2.00,2.70],ty:cy+bh*.06},
  {x:bx0-S*.02,y:by1-bh*.15,flip:0,t0:1.1,shots:[1.50,2.25,2.90],ty:by1-bh*.18}
];
const blasts=[
  {x:cx,y:cy,t0:1.55,s:S*.46,tp:'eg'},
  {x:cx-bw*.26,y:cy-bh*.18,t0:1.25,s:S*.34,tp:'eb'},
  {x:cx+bw*.26,y:cy+bh*.15,t0:1.80,s:S*.36,tp:'eg'},
  {x:cx-bw*.20,y:cy+bh*.24,t0:2.15,s:S*.35,tp:'eb'},
  {x:cx+bw*.22,y:cy-bh*.22,t0:2.45,s:S*.38,tp:'eg'}
];
const orbs=[];for(let i=0;i<75;i++){const a=rn()*Math.PI*2,sp=S*(.25+1.1*rn());orbs.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t0:1.5+rn()*1.2,l:1.1+1.2*rn(),r:S*(.008+.018*rn()),c:rn()<.55?'#76ff03':'#00e5ff'})}
const hasInd='translate' in cv.style;cv.style.willChange='transform';cv.style.pointerEvents='none';
const duck=au.volume;au.volume=Math.min(duck,.06);try{navigator.vibrate&&navigator.vibrate([50,40,80,40,120,60,450])}catch(e){}alSound();
const drawIm=(k,x,y,w,h,rot,fl,al,add)=>{const im=AL_IM[k];if(!im||!im.complete||al<=.005)return;g.save();g.globalAlpha=Math.min(1,al);g.globalCompositeOperation=add?'lighter':'source-over';g.translate(x,y);if(rot)g.rotate(rot);if(fl)g.scale(-1,1);g.drawImage(im,-w/2,-h/2,w,h);g.restore()};
const t0=performance.now();
const finish=()=>{c.remove();cv.style.willChange='';cv.style.pointerEvents='';if(hasInd){cv.style.translate='';cv.style.rotate='';cv.style.scale=''}else cv.style.transform='';au.volume=Math.max(au.volume,duck>.06?duck:.3);nkBusy=false};
const frame=now=>{const t=Math.max(0,(now-t0)/1000);
g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';
const fadeOut=1-sm(END-1.0,END,t);
// 우주 배경 그라데이션
const bgA=sm(0,.5,t)*fadeOut*.62;
if(bgA>0){const v=g.createRadialGradient(cx,cy,S*.1,cx,cy,Math.max(W,H)*.75);v.addColorStop(0,`rgba(10,50,30,${bgA*.5})`);v.addColorStop(1,`rgba(2,12,28,${bgA})`);g.fillStyle=v;g.fillRect(0,0,W,H)}
// 보드 진동
const shake=t>1.0?S*.038*Math.sin((t-1)*38)*Math.exp(-(t-1.0)*.55)*fadeOut:0;
const dx=shake*Math.cos(t*65),dy=shake*Math.sin(t*79),rot=shake*.05*Math.sin(t*43);
if(hasInd){cv.style.translate=dx+'px '+dy+'px';cv.style.rotate=rot+'deg'}else cv.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg)`;

// UFO 트랙터 빔 & UFO 본체
ufos.forEach((u,idx)=>{
  const enter=e3(sm(idx*.12,T+idx*.12,t));
  const ux=u.x0+(u.x1-u.x0)*enter+Math.sin(t*3.2+u.ph)*S*.035;
  const uy=u.y0+(u.y1-u.y0)*enter+Math.cos(t*4.5+u.ph)*S*.015;
  if(t>T-.2){
    const ba=sm(T-.2,T+.3,t)*fadeOut*(.45+.2*Math.sin(t*16+idx));
    const gr=g.createLinearGradient(ux,uy,ux,by1);
    gr.addColorStop(0,`rgba(118,255,3,${ba})`);gr.addColorStop(.6,`rgba(0,229,255,${ba*.6})`);gr.addColorStop(1,'rgba(0,229,255,0)');
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.beginPath();
    g.moveTo(ux-u.s*.18,uy+u.s*.15);g.lineTo(ux+u.s*.18,uy+u.s*.15);
    g.lineTo(ux+u.s*(.65+.15*Math.sin(t*8+idx)),by1);g.lineTo(ux-u.s*(.65+.15*Math.sin(t*8+idx)),by1);
    g.closePath();g.fill();g.restore();
  }
  // UFO 수직 전격/플라즈마 빔 발사
  if(t>1.2+idx*.25&&t<3.8){
    const la=Math.sin((t-(1.2+idx*.25))/2.6*Math.PI)*fadeOut;
    drawIm(idx%2?'bb':'bg',ux,uy+(by1-uy)*.48,(by1-uy)*.95,u.s*.42,Math.PI/2,0,la*.95,true);
  }
  drawIm('ufo',ux,uy,u.s,u.s*.86,Math.sin(t*5+u.ph)*.08,0,fadeOut,false);
});

// 좌우 외계인 총잡이 출현 및 가로 레이저 빔 발사
gunners.forEach((gn,idx)=>{
  const ga=sm(gn.t0,gn.t0+.3,t)*fadeOut;if(ga<=0)return;
  const gx=gn.x+(gn.flip?-1:1)*S*.06*e3(sm(gn.t0,gn.t0+.35,t));
  const gy=gn.y+Math.sin(t*6+idx)*S*.01;
  gn.shots.forEach((st,si)=>{
    const dt=t-st;if(dt<0||dt>.55)return;
    const la=Math.sin(dt/.55*Math.PI)*fadeOut;
    const len=bw*.95,bx=gx+(gn.flip?-len*.48:len*.48);
    drawIm(si%2?'bb':'bg',bx,gy-S*.01,len,S*.11,0,gn.flip,la,true);
    drawIm(si%2?'eb':'eg',gx+(gn.flip?-len*.82:len*.82),gy,S*.24*(.7+dt),S*.24*(.7+dt),0,0,la,true);
  });
  drawIm('gun',gx,gy,S*.16,S*.15,Math.sin(t*8+idx)*.06,gn.flip,ga,false);
});

// 보드 중앙 외계 플라즈마 & 전격 대폭발 (첨부 이미지 이펙트)
blasts.forEach(b=>{
  const dt=t-b.t0;if(dt<0||dt>1.6)return;
  const u=dt/1.6,al=Math.sin(u*Math.PI)*fadeOut,sc=.55+.75*e3(Math.min(1,u*1.4));
  drawIm(b.tp,b.x,b.y,b.s*sc,b.s*sc,0,0,al,true);
});

// 플라즈마 광구 입자
g.save();g.globalCompositeOperation='lighter';
orbs.forEach(p=>{
  const dt=t-p.t0;if(dt<=0||dt>=p.l)return;
  const u=dt/p.l,px=p.x+p.vx*dt,py=p.y+p.vy*dt;
  g.globalAlpha=(1-u)*fadeOut;g.fillStyle=p.c;g.beginPath();g.arc(px,py,p.r*(1.3-.6*u),0,7);g.fill();
});
g.restore();

// 섬광 및 상단 타이틀 문구
if(t>=1.5&&!impDone){impDone=true;if(window.hitCamp)window.hitCamp(V,'alien')}if(t>1.5&&t<2.1){const fl=Math.sin((t-1.5)/.6*Math.PI);g.fillStyle=`rgba(140,255,100,${.45*fl})`;g.fillRect(0,0,W,H)}
const tq=sm(0,.2,t)*fadeOut;
if(tq>0){
  g.save();g.globalAlpha=tq;const pop=1+.2*Math.exp(-t*6);g.translate(W/2,H*.15);g.scale(pop,pop);
  g.font=`900 ${Math.round(S*.085)}px sans-serif`;g.textAlign='center';g.lineWidth=S*.012;
  g.strokeStyle='#003314';g.fillStyle='#76ff03';
  const msg=t<1.2?'🛸 외계인 함대 침공!!':name+'의 외계인 총공격!!';
  g.strokeText(msg,0,0);g.fillText(msg,0,0);g.restore();
}
if(t<END)requestAnimationFrame(frame);else finish()};
requestAnimationFrame(frame)}
function alienFire(A){try{comm(fill(pick(CB.alien,'a'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}alien(A)}

/* ---- 에네르기파(Kamehameha) 스킬 (첨부 5종 이미지 활용 · 기 모으기 → 컷인 → 초대형 광선포 발사 → 대폭발 · 약 5.4초) ---- */
const KM_SRC={
  c1:"assets/images/image_27.webp",
  c2:"assets/images/image_28.webp",
  sh:"assets/images/image_29.webp",
  fr:"assets/images/image_30.webp",
  ex:"assets/images/image_31.webp"
},KM_IM={};
for(const k in KM_SRC){const im=new Image();im.src=KM_SRC[k];KM_IM[k]=im}

function kmSound(){try{const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());if(a.state==='suspended')a.resume();const t=a.currentTime;
// 1) 기 모으기 상승 사운드 (0 ~ 2.0s)
const o1=a.createOscillator(),g1=a.createGain();
o1.type='sawtooth';o1.frequency.setValueAtTime(140,t);o1.frequency.exponentialRampToValueAtTime(880,t+1.95);
g1.gain.setValueAtTime(.01,t);g1.gain.linearRampToValueAtTime(.22,t+.4);g1.gain.linearRampToValueAtTime(.35,t+1.9);g1.gain.linearRampToValueAtTime(0,t+2.05);
o1.connect(g1);g1.connect(a.destination);o1.start(t);o1.stop(t+2.08);
// 기 스파크 펄스음
for(let i=0;i<8;i++){
  const st=t+i*.22,sp=a.createOscillator(),sg=a.createGain();
  sp.type='triangle';sp.frequency.setValueAtTime(420+i*110,st);sp.frequency.exponentialRampToValueAtTime(1200+i*150,st+.16);
  sg.gain.setValueAtTime(.15,st);sg.gain.exponentialRampToValueAtTime(.001,st+.18);
  sp.connect(sg);sg.connect(a.destination);sp.start(st);sp.stop(st+.19);
}
// 2) 발사 포효 & 에너지 빔 굉음 (2.0 ~ 3.6s)
const tb=t+1.95,o2=a.createOscillator(),g2=a.createGain();
o2.type='square';o2.frequency.setValueAtTime(320,tb);o2.frequency.exponentialRampToValueAtTime(95,tb+1.5);
g2.gain.setValueAtTime(.45,tb);g2.gain.exponentialRampToValueAtTime(.01,tb+1.6);
o2.connect(g2);g2.connect(a.destination);o2.start(tb);o2.stop(tb+1.65);
// 3) 적 진영 대폭발 충격음 (3.1 ~ 5.2s)
const ti=t+3.05,len=Math.floor(a.sampleRate*2.4),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.4);
const n=a.createBufferSource();n.buffer=buf;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(2800,ti);lp.frequency.exponentialRampToValueAtTime(130,ti+2.2);
const ng=a.createGain();ng.gain.value=.75;n.connect(lp);lp.connect(ng);ng.connect(a.destination);n.start(ti)}catch(e){}}

function kame(A){if(nkBusy)return;nkBusy=true;
const W=innerWidth,H=innerHeight;let d=Math.min(devicePixelRatio||1,3);while(W*d*H*d>7e6&&d>1)d-=.25;
const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:9;pointer-events:none';document.body.appendChild(c);const g=c.getContext('2d');
let rc={left:0,top:0};try{rc=cv.getBoundingClientRect()}catch(e){}
const ox=rc.left+OX,oy=rc.top+OY,bw=8*CX,bh=9*CY,ok=isFinite(ox+oy+bw+bh)&&bw>0,S=Math.min(W,H);
const V=side2(A),isTB=flip?(V==='h'):(V==='c');
// 공격자(A) 진영에서 상대(V) 진영으로 발사!
const sx=ok?ox+bw*.18:W*.2,sy=ok?(isTB?oy+bh*.22:oy+bh*.78):H*(isTB?.25:.75);
const tx=ok?ox+bw*.52:W*.52,ty=ok?(isTB?oy+bh*.76:oy+bh*.24):H*(isTB?.76:.24);
const END=5.4,name=tag(A);let impDone=false;
let sd=20261031;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
const rays=[],sparks=[];
for(let i=0;i<36;i++)rays.push({a:i/36*Math.PI*2+rn()*.15,l:S*(.25+rn()*.55),w:2+rn()*5,sp:3+rn()*5});
for(let i=0;i<90;i++){const a=rn()*Math.PI*2,sp=S*(.35+1.45*rn());sparks.push({vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:S*(.008+.022*rn()),l:.9+1.3*rn(),c:rn()<.5?'#fff9c4':rn()<.8?'#ff9100':'#00e5ff'})}
const hasInd='translate' in cv.style;cv.style.willChange='transform';cv.style.pointerEvents='none';
const duck=au.volume;au.volume=Math.min(duck,.06);try{navigator.vibrate&&navigator.vibrate([40,30,60,30,100,40,350,50,450])}catch(e){}kmSound();

const drawIm=(k,x,y,w,h,al,add)=>{
  const im=KM_IM[k];if(!im||!im.complete||al<=.005)return;
  g.save();g.globalAlpha=Math.min(1,al);g.globalCompositeOperation=add?'lighter':'source-over';
  g.translate(x,y);g.drawImage(im,-w/2,-h/2,w,h);g.restore();
};

const t0=performance.now();
const finish=()=>{c.remove();cv.style.willChange='';cv.style.pointerEvents='';if(hasInd){cv.style.translate='';cv.style.rotate='';cv.style.scale=''}else cv.style.transform='';au.volume=Math.max(au.volume,duck>.06?duck:.3);nkBusy=false};

const frame=now=>{
  const t=Math.max(0,(now-t0)/1000);
  g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  const fadeOut=1-sm(END-.9,END,t);

  // 배경 전장 암전 & 초사이어인 블루/골드 기운
  const bgA=sm(0,.35,t)*fadeOut*.72;
  if(bgA>0){
    const col=t<3.05?'0,35,85':'75,20,0';
    const v=g.createRadialGradient(W/2,H/2,S*.1,W/2,H/2,Math.max(W,H)*.8);
    v.addColorStop(0,`rgba(${col},${bgA*.45})`);v.addColorStop(1,`rgba(2,6,18,${bgA})`);
    g.fillStyle=v;g.fillRect(0,0,W,H);
  }

  // 단계별 장기판 진동 (기 모을 때 미세 진동 → 빔 발사 시 강진 → 폭발 시 대격진)
  const amp=(t<1.95?S*.008*sm(.2,1.9,t):t<3.05?S*.032:S*.085*Math.exp(-(t-3.05)*1.35))*fadeOut;
  const dx=amp*Math.sin(t*62),dy=amp*Math.cos(t*71),rot=amp*.055*Math.sin(t*47);
  if(hasInd){cv.style.translate=dx+'px '+dy+'px';cv.style.rotate=rot+'deg'}else cv.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg)`;

  // PHASE 1: 카~메~하~메~ 기 모으기 (0.0 ~ 1.95s) — 첨부 이미지 1, 3, 4번 활용
  if(t<2.1){
    const p1=sm(0,.25,t)*(1-sm(1.85,2.1,t));
    // 집중선 & 푸른 기공 오라
    g.save();g.globalCompositeOperation='lighter';
    const cx0=t<1.0?sx:W*.48,cy0=t<1.0?sy:H*.48;
    const rad=S*(.14+.22*Math.sin(t*9)*0.2+t*.12);
    const rg=g.createRadialGradient(cx0,cy0,0,cx0,cy0,rad*2.2);
    rg.addColorStop(0,`rgba(220,255,255,${.9*p1})`);rg.addColorStop(.4,`rgba(0,210,255,${.65*p1})`);rg.addColorStop(1,'rgba(0,110,255,0)');
    g.fillStyle=rg;g.beginPath();g.arc(cx0,cy0,rad*2.2,0,7);g.fill();
    rays.forEach((r,idx)=>{
      const a=r.a+t*.3,rIn=S*.06+Math.sin(t*15+idx)*S*.02,rOut=rIn+r.l*(.6+.4*Math.sin(t*r.sp+idx));
      g.strokeStyle=idx%2?`rgba(180,250,255,${.75*p1})`:`rgba(40,180,255,${.6*p1})`;
      g.lineWidth=r.w;g.beginPath();
      g.moveTo(cx0+Math.cos(a)*rIn,cy0+Math.sin(a)*rIn);
      g.lineTo(cx0+Math.cos(a)*rOut,cy0+Math.sin(a)*rOut);g.stroke();
    });
    g.restore();

    if(t<.75){
      const sc=.85+.25*e3(t/.75);
      drawIm('c1',sx,sy,S*.52*sc,S*.58*sc,sm(0,.18,t)*(1-sm(.62,.75,t)),false);
    }else if(t<1.42){
      const u=(t-.7)/0.72,sc=.92+.22*u;
      drawIm('c2',W*.5,H*.48,S*.72*sc,S*.52*sc,sm(.7,.82,t)*(1-sm(1.28,1.42,t)),false);
    }else{
      const u=(t-1.35)/0.7,sc=.95+.25*u;
      drawIm('sh',W*.5,H*.46,S*.76*sc,S*.46*sc,sm(1.35,1.48,t)*(1-sm(1.88,2.08,t)),false);
    }
  }

  // PHASE 2: 파앗!! 초대형 에네르기파 광선포 발사 (1.90 ~ 3.45s) — 첨부 이미지 2번 + 캔버스 초거대 에너지 빔
  if(t>=1.88&&t<3.55){
    const u=Math.min(1,(t-1.88)/0.38),bAl=sm(1.88,2.02,t)*(1-sm(3.2,3.55,t));
    // 발사 포즈 캐릭터 (첨부 이미지 2번)
    drawIm('fr',sx+S*.06,sy,S*.66,S*.48,bAl,false);

    // 시작점(손끝)에서 상대 진영(tx, ty)으로 뻗어나가는 초대형 에네르기파 빔
    const bx0=sx+S*.12,by0=sy,ex=bx0+(tx-bx0)*e3(u),ey=by0+(ty-by0)*e3(u);
    const ang=Math.atan2(ey-by0,ex-bx0),dist=Math.hypot(ex-bx0,ey-by0),bw2=S*(.18+.04*Math.sin(t*35));

    g.save();g.globalCompositeOperation='lighter';g.translate(bx0,by0);g.rotate(ang);
    // 외곽 푸른 오라 빔
    const lg=g.createLinearGradient(0,-bw2*1.4,0,bw2*1.4);
    lg.addColorStop(0,'rgba(0,140,255,0)');lg.addColorStop(.25,`rgba(0,210,255,${.85*bAl})`);
    lg.addColorStop(.5,`rgba(255,255,255,${bAl})`);lg.addColorStop(.75,`rgba(0,210,255,${.85*bAl})`);lg.addColorStop(1,'rgba(0,140,255,0)');
    g.fillStyle=lg;g.fillRect(0,-bw2*1.4,dist,bw2*2.8);
    // 코어 백색 광선
    g.fillStyle=`rgba(235,255,255,${.95*bAl})`;g.fillRect(0,-bw2*.48,dist,bw2*.96);
    // 나선형 전격 링
    g.strokeStyle=`rgba(180,250,255,${.9*bAl})`;g.lineWidth=3.5;
    g.beginPath();
    for(let x=0;x<dist;x+=8){
      const wy=Math.sin(x*.06-t*28)*bw2*.85;
      x===0?g.moveTo(x,wy):g.lineTo(x,wy);
    }
    g.stroke();
    // 빔 선단 거대 구체
    const hg=g.createRadialGradient(dist,0,0,dist,0,bw2*1.9);
    hg.addColorStop(0,`rgba(255,255,255,${bAl})`);hg.addColorStop(.55,`rgba(80,235,255,${.85*bAl})`);hg.addColorStop(1,'rgba(0,150,255,0)');
    g.fillStyle=hg;g.beginPath();g.arc(dist,0,bw2*1.9,0,7);g.fill();
    g.restore();
  }

  // PHASE 3: 상대 진영 직격 대폭발 & 장기판 파괴 (3.00 ~ 5.4s) — 첨부 이미지 5번 활용
  if(t>=3.0){
    if(!impDone){impDone=true;if(window.hitCamp)window.hitCamp(V,'kame')}
    const dt=t-3.0,exAl=sm(3.0,3.15,t)*fadeOut,sc=.75+.55*e3(Math.min(1,dt/1.2));
    // 첨부 이미지 5번(황금/오렌지 번개 대폭발)을 상대 진영 중심에 웅장하게 렌더링
    drawIm('ex',tx,ty,S*1.05*sc,S*.65*sc,exAl,false);
    drawIm('ex',tx,ty,S*.85*sc,S*.52*sc,exAl*.75,true);

    // 방사형 번개 & 폭발 파편 스파크
    g.save();g.globalCompositeOperation='lighter';
    sparks.forEach(p=>{
      if(dt>=p.l)return;
      const u=dt/p.l,px=tx+p.vx*dt,py=ty+p.vy*dt;
      g.globalAlpha=(1-u)*fadeOut;g.fillStyle=p.c;
      g.beginPath();g.arc(px,py,p.r*(1.4-.7*u),0,7);g.fill();
    });
    // 충격파 링
    if(dt<1.5){
      const rr=dt*S*1.35;
      g.globalAlpha=(1-dt/1.5)*fadeOut*.85;g.strokeStyle='#ffe57f';g.lineWidth=Math.max(2,S*.018*(1-dt/1.5));
      g.beginPath();g.arc(tx,ty,rr,0,7);g.stroke();
    }
    g.restore();

    // 직격 순간 화이트아웃/골드 플래시
    if(dt<.42){
      const fl=1-dt/.42;
      g.fillStyle=`rgba(255,248,215,${.85*fl*fl})`;g.fillRect(0,0,W,H);
    }
  }

  // 상단 임팩트 대사 연출
  const tq=sm(0,.15,t)*fadeOut;
  if(tq>0){
    g.save();g.globalAlpha=tq;const pop=1+.22*Math.exp(-(t%1.5)*6);
    g.translate(W/2,H*.14);g.scale(pop,pop);
    g.font=`900 ${Math.round(S*.088)}px sans-serif`;g.textAlign='center';g.lineWidth=S*.013;
    g.strokeStyle=t<3.0?'#001f4d':'#4a1500';
    g.fillStyle=t<3.0?'#80d8ff':'#ffd54f';
    const msg=t<1.3?'카~메~하~메~ (기 모으기!!)':t<3.0?'파앗!! 🐉 에네르기파 발사!!':name+'의 에네르기파 대폭발!!';
    g.strokeText(msg,0,0);g.fillText(msg,0,0);g.restore();
  }

  if(t<END)requestAnimationFrame(frame);else finish();
};
requestAnimationFrame(frame)}
function kameFire(A){try{comm(fill(pick(CB.kame,'k'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}kame(A)}

/* ---- 핸드폰 화면 4단계 파손(중첩 가림 완벽 방지 · 장기알 시인성 최우선 보존) 및 신규 주먹 돌파/망치/총격 스킬 ---- */
const SC_SRC={
  web_crack:"assets/images/image_32.webp",
  s1:"assets/images/image_33.webp",
  s2:"assets/images/image_34.webp",
  s3:"assets/images/image_35.webp",
  s4:"assets/images/image_36.webp",
  fist_arm:"assets/images/image_37.webp",
  fist_core:"assets/images/image_38.webp",
  fist_hole:"assets/images/image_39.webp",
  fist_hit:"assets/images/image_40.webp",
  ham_tool:"assets/images/image_41.webp",
  ham_hit:"assets/images/image_42.webp",
  gun_fire:"assets/images/image_43.webp",
  bhole:"assets/images/image_44.webp"
},SC_IM={};
for(const k in SC_SRC){const im=new Image();im.onload=()=>{if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}};im.src=SC_SRC[k];SC_IM[k]=im}

window.SDMG={c:{lv:0,hits:[]},h:{lv:0,hits:[]}};
function ensureSDMG(){
  if(!window.SDMG||typeof window.SDMG!=='object'||!window.SDMG.c||!window.SDMG.h){
    window.SDMG={c:{lv:0,hits:[]},h:{lv:0,hits:[]}};
  }
  ['c','h'].forEach(s=>{
    if(!window.SDMG[s]||typeof window.SDMG[s]!=='object')window.SDMG[s]={lv:0,hits:[]};
    window.SDMG[s].lv=Math.min(4,Math.max(0,+window.SDMG[s].lv||0));
    if(!Array.isArray(window.SDMG[s].hits))window.SDMG[s].hits=[];
    if(window.SDMG[s].hits.length>3)window.SDMG[s].hits=window.SDMG[s].hits.slice(-3);
  });
  return window.SDMG;
}

function getCampRect(side){
  const W=innerWidth,H=innerHeight;
  let rc={left:0,top:0,width:W,height:H};
  try{const r=cv.getBoundingClientRect();if(r&&r.width>0)rc=r}catch(e){}
  const isBottom=flip?(side==='h'):(side==='c');
  const ox=isFinite(OX)?rc.left+OX:W*.08;
  const oy=isFinite(OY)?rc.top+OY:H*.1;
  const bw=(isFinite(CX)&&CX>0)?8*CX:W*.84;
  const bh=(isFinite(CY)&&CY>0)?4.42*CY:H*.38;
  const padX=(isFinite(CX)&&CX>0)?CX*.42:W*.04;
  const padY=(isFinite(CY)&&CY>0)?CY*.42:H*.03;
  const x0=ox-padX,w=bw+padX*2;
  const y0=isBottom?(oy+4.55*CY):(oy-padY);
  const h=bh+padY;
  return {x0,y0,w,h,ox,oy,bw,bh,isBottom};
}

// 고품질 리얼 강화유리 파손 렌더러: 지저분한 비트맵 중첩을 제거하고 세밀한 굴절 하이라이트·방사형 테이퍼링 실금·동심원 응력선으로 부드럽고 리얼하게 표현
function drawRealisticGlassImpact(g, hx, hy, maxR, lv, tp, seedBase, alphaMul){
  let sd = (seedBase >>> 0) || 1234567;
  const rn = () => (sd = Math.imul(sd, 1664525) + 1013904223 >>> 0) / 4294967296;
  const al = (alphaMul == null ? 1 : alphaMul);
  if(al <= 0.01) return;

  g.save();
  // 1) 타격 중심부 강화유리 압착 굴절 광원 (부드러운 반투명 유리 오목 렌즈 효과)
  const coreR = maxR * (tp === 'gun' ? 0.085 : 0.12);
  const cg = g.createRadialGradient(hx, hy, coreR * 0.1, hx, hy, coreR * 2.4);
  cg.addColorStop(0, `rgba(240, 250, 255, ${0.28 * al})`);
  cg.addColorStop(0.35, `rgba(185, 230, 255, ${0.14 * al})`);
  cg.addColorStop(0.7, `rgba(12, 24, 38, ${0.18 * al})`);
  cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  g.fillStyle = cg;
  g.beginPath(); g.arc(hx, hy, coreR * 2.4, 0, Math.PI * 2); g.fill();

  // 탄흔/타격 코어 미세 크러시 링
  g.strokeStyle = `rgba(245, 252, 255, ${0.42 * al})`;
  g.lineWidth = 1.1;
  g.beginPath();
  const crushPts = 14;
  for(let i=0; i<=crushPts; i++){
    const a = (i / crushPts) * Math.PI * 2;
    const rr = coreR * (0.68 + 0.34 * rn());
    const px = hx + Math.cos(a) * rr, py = hy + Math.sin(a) * rr;
    i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
  }
  g.stroke();

  // 2) 주 방사형 유리 균열 (중심에서 끝으로 갈수록 가늘어지는 테이퍼링 & 2중 굴절 그림자/하이라이트)
  const numRays = (tp === 'gun' ? 8 : 11) + lv * 2;
  const rayNodes = [];
  g.lineCap = 'round'; g.lineJoin = 'round';

  for(let i=0; i<numRays; i++){
    let ang = (i / numRays) * Math.PI * 2 + (rn() - 0.5) * (0.35 / numRays * 6);
    let px = hx + Math.cos(ang) * coreR * 0.65;
    let py = hy + Math.sin(ang) * coreR * 0.65;
    const segs = 5 + lv;
    const totalLen = maxR * (0.38 + 0.58 * rn()) * (0.72 + lv * 0.08);
    const pts = [[px, py]];

    for(let s=1; s<=segs; s++){
      const u = s / segs;
      ang += (rn() - 0.5) * (0.18 + 0.12 * u);
      const stepLen = (totalLen / segs) * (0.82 + 0.36 * rn());
      px += Math.cos(ang) * stepLen;
      py += Math.sin(ang) * stepLen;
      pts.push([px, py]);

      // 자연스러운 미세 잔가지(Micro-fork) 분기
      if(s >= 2 && s < segs && rn() < 0.42){
        const fAng = ang + (rn() < 0.5 ? 1 : -1) * (0.28 + 0.25 * rn());
        const fLen = stepLen * (0.7 + 0.6 * rn());
        const fx1 = px + Math.cos(fAng) * fLen * 0.55;
        const fy1 = py + Math.sin(fAng) * fLen * 0.55;
        const fx2 = fx1 + Math.cos(fAng + (rn()-0.5)*0.2) * fLen * 0.45;
        const fy2 = fy1 + Math.sin(fAng + (rn()-0.5)*0.2) * fLen * 0.45;

        g.strokeStyle = `rgba(8, 18, 28, ${(0.22 * (1 - u*0.5)) * al})`;
        g.lineWidth = Math.max(0.4, 1.0 * (1 - u * 0.6));
        g.beginPath(); g.moveTo(px+0.8, py+1.0); g.lineTo(fx1+0.8, fy1+1.0); g.lineTo(fx2+0.8, fy2+1.0); g.stroke();

        g.strokeStyle = `rgba(235, 250, 255, ${(0.38 * (1 - u*0.5)) * al})`;
        g.lineWidth = Math.max(0.35, 0.85 * (1 - u * 0.6));
        g.beginPath(); g.moveTo(px, py); g.lineTo(fx1, fy1); g.lineTo(fx2, fy2); g.stroke();
      }
    }
    rayNodes.push(pts);

    // 테이퍼링 렌더링: 구간별로 선 굵기와 투명도를 부드럽게 감쇠
    for(let s=0; s<pts.length-1; s++){
      const u = s / (pts.length - 1);
      const w = Math.max(0.45, (1.55 - u * 1.15) * (0.9 + lv * 0.05));
      const segAl = (0.52 - u * 0.34) * al;
      const [x0, y0] = pts[s], [x1, y1] = pts[s+1];

      // 유리 두께 굴절 그림자 (1px 오프셋)
      g.strokeStyle = `rgba(6, 16, 28, ${segAl * 0.65})`;
      g.lineWidth = w * 1.15;
      g.beginPath(); g.moveTo(x0 + 0.9, y0 + 1.1); g.lineTo(x1 + 0.9, y1 + 1.1); g.stroke();

      // 유리 단면 스페큘러 하이라이트
      g.strokeStyle = s === 0 ? `rgba(255, 255, 255, ${segAl * 1.15})` : `rgba(225, 246, 255, ${segAl})`;
      g.lineWidth = w;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  }

  // 3) 동심원 유리 인장 응력선(Concentric Stress Webs) & 미세 유리면 반사광
  const rings = Math.min(4, 1 + lv);
  for(let rIdx=1; rIdx<=rings; rIdx++){
    for(let i=0; i<numRays; i++){
      const ptsA = rayNodes[i], ptsB = rayNodes[(i + 1) % numRays];
      const idxA = Math.min(ptsA.length - 1, rIdx + (rn() < 0.35 ? 1 : 0));
      const idxB = Math.min(ptsB.length - 1, rIdx + (rn() < 0.35 ? 1 : 0));
      if(idxA < 1 || idxB < 1 || rn() < 0.18) continue;
      const [ax, ay] = ptsA[idxA], [bx, by] = ptsB[idxB];
      const mx = (ax + bx) * 0.5 + (hx - (ax + bx) * 0.5) * 0.08;
      const my = (ay + by) * 0.5 + (hy - (ay + by) * 0.5) * 0.08;
      const ringAl = (0.34 - rIdx * 0.06) * al;

      // 은은한 조각면 빛 반사 (과하지 않게 극미량만 부여)
      if(rIdx <= 2 && rn() < 0.28){
        const [ ax0, ay0 ] = ptsA[Math.max(0, idxA - 1)];
        const [ bx0, by0 ] = ptsB[Math.max(0, idxB - 1)];
        g.fillStyle = rn() < 0.5 ? `rgba(220, 245, 255, ${0.045 * al})` : `rgba(130, 215, 255, ${0.035 * al})`;
        g.beginPath();
        g.moveTo(ax0, ay0); g.lineTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx0, by0);
        g.closePath(); g.fill();
      }

      g.strokeStyle = `rgba(10, 22, 35, ${ringAl * 0.55})`;
      g.lineWidth = 0.75;
      g.beginPath(); g.moveTo(ax+0.7, ay+0.9); g.quadraticCurveTo(mx+0.7, my+0.9, bx+0.7, by+0.9); g.stroke();

      g.strokeStyle = `rgba(230, 248, 255, ${ringAl})`;
      g.lineWidth = 0.65;
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(mx, my, bx, by); g.stroke();
    }
  }
  g.restore();
}

window.drawScreenDamage=function(){
  const scv=el('scv');if(!scv)return;
  const st=ensureSDMG();
  if(!inGame||(st.c.lv<=0&&st.h.lv<=0)){scv.style.display='none';return}
  scv.style.display='block';
  const W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2);
  if(scv.width!==Math.round(W*d)||scv.height!==Math.round(H*d)){scv.width=Math.round(W*d);scv.height=Math.round(H*d)}
  const g=scv.getContext('2d');
  g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);
  const S=Math.min(W,H);

  ['c','h'].forEach(side=>{
    const cp=st[side];if(!cp||cp.lv<=0)return;
    const lv=cp.lv,R=getCampRect(side);
    g.save();
    g.beginPath();g.rect(R.x0,R.y0,R.w,R.h);g.clip();

    const hits=cp.hits.length?cp.hits:[{tp:'fist',fx:.5,fy:.5,rot:0,stg:lv}];
    hits.forEach((h,idx)=>{
      const hx=R.ox+R.bw*(+h.fx||.5),hy=R.y0+R.h*(+h.fy||.5);
      const isMain=(idx===hits.length-1);
      const maxR=Math.min(R.bw,R.h)*(isMain?(0.36+lv*0.055):(0.26+lv*0.035));
      const seed=Math.round((+h.fx||.5)*99991+(+h.fy||.5)*77773)+idx*313+lv*19;
      const al=isMain?Math.min(0.88,0.62+lv*0.06):0.46;
      drawRealisticGlassImpact(g, hx, hy, maxR, lv, h.tp||'fist', seed, al);
    });
    g.restore();
  });
};

window.hitScreen=function(targetSide,tp,fx,fy,rot,incLv){
  const st=ensureSDMG();
  const cp=st[targetSide];if(!cp)return;
  if(incLv!==false)cp.lv=Math.min(4,(+cp.lv||0)+1);
  if(incLv===false)return;
  const nfx=fx!=null?Math.round(fx*1000)/1000:.5;
  const nfy=fy!=null?Math.round(fy*1000)/1000:.5;
  const nrot=rot!=null?Math.round(rot*100)/100:0;
  const newHit={tp:tp||'fist',fx:nfx,fy:nfy,rot:nrot,stg:cp.lv};
  const nearIdx=cp.hits.findIndex(h=>Math.hypot((+h.fx||.5)-nfx,(+h.fy||.5)-nfy)<0.28);
  if(nearIdx>=0)cp.hits[nearIdx]=newHit;
  else{
    cp.hits.push(newHit);
    if(cp.hits.length>3)cp.hits.shift();
  }
  xsave();
  if(cfg.mode==='mp'&&!isSpec)snd2({k:'sdmg_sync',SDMG:window.SDMG});
  try{window.drawScreenDamage()}catch(e){}
};

function brutalShatterSound(atDelay,intensity){
  try{
    const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());
    if(a.state==='suspended')a.resume();
    const t=a.currentTime+(atDelay||0), mul=intensity||1;
    const o=a.createOscillator(),og=a.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(175*mul,t);o.frequency.exponentialRampToValueAtTime(24,t+.38);
    og.gain.setValueAtTime(Math.min(1,.82*mul),t);og.gain.exponentialRampToValueAtTime(.001,t+.42);
    o.connect(og);og.connect(a.destination);o.start(t);o.stop(t+.44);

    const sub=a.createOscillator(),sg=a.createGain();
    sub.type='sine';sub.frequency.setValueAtTime(92,t);sub.frequency.exponentialRampToValueAtTime(20,t+.46);
    sg.gain.setValueAtTime(Math.min(1,.90*mul),t);sg.gain.exponentialRampToValueAtTime(.001,t+.48);
    sub.connect(sg);sg.connect(a.destination);sub.start(t);sub.stop(t+.50);

    const len=Math.floor(a.sampleRate*.65),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
    for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.55);
    const n=a.createBufferSource();n.buffer=buf;
    const hp=a.createBiquadFilter();hp.type='bandpass';hp.frequency.value=2800;hp.Q.value=0.9;
    const ng=a.createGain();ng.gain.setValueAtTime(Math.min(1,.72*mul),t);ng.gain.exponentialRampToValueAtTime(.001,t+.62);
    n.connect(hp);hp.connect(ng);ng.connect(a.destination);n.start(t);

    [3100,4200,5400,6700].forEach((f,i)=>{
      const dt=i*.024,c=a.createOscillator(),cg=a.createGain();
      c.type='sine';c.frequency.setValueAtTime(f,t+dt);c.frequency.exponentialRampToValueAtTime(f*.72,t+dt+.22);
      cg.gain.setValueAtTime(.18*mul,t+dt);cg.gain.exponentialRampToValueAtTime(.001,t+dt+.24);
      c.connect(cg);cg.connect(a.destination);c.start(t+dt);c.stop(t+dt+.26);
    });
  }catch(e){}
}

// 공통 리얼 크리스탈 유리 파편 렌더러 (깔끔하고 투명한 스페큘러 조각)
function drawCrystallineShard(g, p, fadeOut){
  const u = p.a / p.l;
  const r = p.r * (p.sc || 1);
  g.save();
  g.translate(p.x, p.y);
  g.rotate(p.rot);
  const al = (1 - u) * fadeOut * 0.85;
  const gr = g.createLinearGradient(-r, -r, r, r);
  gr.addColorStop(0, `rgba(255, 255, 255, ${al})`);
  gr.addColorStop(0.45, `rgba(200, 240, 255, ${al * 0.65})`);
  gr.addColorStop(1, `rgba(110, 185, 230, ${al * 0.25})`);
  g.fillStyle = gr;
  g.strokeStyle = `rgba(255, 255, 255, ${al * 0.95})`;
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(0, -r);
  g.lineTo(r * 0.82, -r * 0.15);
  g.lineTo(r * 0.35, r * 0.88);
  g.lineTo(-r * 0.76, r * 0.42);
  g.closePath();
  g.fill();
  g.stroke();
  g.restore();
}

/* ---- 1) 👊 주먹(Fist): 지저분한 파편/글리치를 걷어내고 묵직하고 매끄러운 3D 주먹 충격파 & 리얼 강화유리 파열 ---- */
function fist(A,seed){
  if(nkBusy)return;nkBusy=true;
  const W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2.2),S=Math.min(W,H);
  const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);
  c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:24;pointer-events:none';
  document.body.appendChild(c);const g=c.getContext('2d');
  const gEl=el('g')||document.body;
  const V=side2(A),R=getCampRect(V);
  let sd=(seed||Date.now())>>>0;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;

  const fxMain=0.25+rn()*0.50,fyMain=0.26+rn()*0.48;
  const punches=[
    {t0:0.06,tHit:0.26,fx:Math.min(.80,Math.max(.20,fxMain-(0.15+rn()*0.06))),fy:Math.min(.78,Math.max(.22,fyMain+(rn()-.5)*0.14)),rot:-0.14+(rn()-.5)*0.15,sc:0.74,main:false,done:false},
    {t0:0.38,tHit:0.58,fx:Math.min(.80,Math.max(.20,fxMain+(0.15+rn()*0.06))),fy:Math.min(.78,Math.max(.22,fyMain+(rn()-.5)*0.14)),rot:0.14+(rn()-.5)*0.15,sc:0.82,main:false,done:false},
    {t0:0.72,tHit:0.98,fx:fxMain,fy:fyMain,rot:(rn()-.5)*0.12,sc:1.10,main:true,done:false}
  ];

  const shards=[];
  const END=2.85,name=tag(A);
  const duck=au.volume;au.volume=Math.min(duck,.05);
  try{navigator.vibrate&&navigator.vibrate([60,40,90,50,120,60,380])}catch(e){}
  brutalShatterSound(0.26,0.72);
  brutalShatterSound(0.58,0.85);
  brutalShatterSound(0.98,1.25);

  const tStart=performance.now();let last=tStart;
  const finish=()=>{c.remove();gEl.style.transform='';gEl.style.filter='';cv.style.transform='';au.volume=Math.max(au.volume,duck>.05?duck:.3);nkBusy=false};
  const frame=now=>{
    const t=Math.max(0,(now-tStart)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    const fadeOut=1-sm(END-.55,END,t);
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);

    let shakeAmp=0;
    punches.forEach(p=>{
      const hx=R.ox+R.bw*p.fx,hy=R.y0+R.h*p.fy;
      if(t>=p.tHit&&!p.done){
        p.done=true;
        window.hitScreen(V,'fist',p.fx,p.fy,p.rot,p.main);
        if(p.main&&window.hitCamp)window.hitCamp(V,'fist',{fx:p.fx,fy:p.fy,rot:p.rot});
        const cnt=p.main?38:16;
        for(let i=0;i<cnt;i++){
          const a=rn()*Math.PI*2,sp=S*(.28+1.05*rn())*(p.main?1.15:.75);
          shards.push({
            x:hx,y:hy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-S*.18,
            r:S*(.008+.018*rn()),rot:rn()*6.28,vr:(rn()-.5)*16,
            sc:1,vsc:p.main?0.8:0.35,l:0.75+0.85*rn(),a:0
          });
        }
      }
      if(t>=p.tHit){
        const q=t-p.tHit;
        shakeAmp+=S*(p.main?.075:.035)*Math.exp(-q*(p.main?4.2:7.0));
      }
    });

    const dx=shakeAmp*Math.sin(t*68),dy=shakeAmp*Math.cos(t*76);
    const punchZoom=t>=0.98&&t<1.42?(1+0.038*Math.exp(-(t-0.98)*7.5)):1;
    gEl.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${punchZoom})`;

    const coreIm=SC_IM.fist_core;
    punches.forEach((p,idx)=>{
      if(t<p.t0)return;
      const hx=R.ox+R.bw*p.fx,hy=R.y0+R.h*p.fy;
      const dur=p.tHit-p.t0,q=t-p.tHit;
      const holdEnd=p.main?1.55:0.42;
      if(q>holdEnd)return;
      const fadeP=q>holdEnd-0.32?Math.max(0,(holdEnd-q)/0.32):1;
      const baseSz=Math.min(R.bw*.44,S*.38)*p.sc;

      // 타격 지점의 매끄러운 리얼 강화유리 크랙
      if(q>=0){
        const crkProgress = Math.min(1, q / 0.09);
        g.save();
        g.beginPath(); g.rect(R.x0, R.y0, R.w, R.h); g.clip();
        drawRealisticGlassImpact(g, hx, hy, baseSz * (p.main ? 1.15 : 0.78) * crkProgress, p.main ? 3 : 1, 'fist', idx*997 + 101, fadeP * fadeOut * 0.85);
        g.restore();
      }

      // 3D 주먹 타격 모션 (지저분한 배경 구멍 데칼 없이 깔끔한 입체 펀치와 굴절 파동만 표현)
      if(coreIm&&coreIm.complete){
        let fistSc=0.25;
        if(t<p.tHit){
          const u=(t-p.t0)/dur;
          fistSc=0.25+1.10*Math.pow(u,2.4);
        }else if(q<0.10){
          fistSc=1.35-0.25*(q/0.10);
        }else{
          const retract=sm(p.main?0.55:0.12,holdEnd,q);
          fistSc=1.10*(1-retract*0.55);
        }
        const fw=baseSz*0.78*fistSc,fh=fw*(coreIm.height/coreIm.width);
        g.save();g.translate(hx,hy);g.rotate(p.rot);
        g.globalAlpha=fadeP*fadeOut*(q>0.15?Math.max(0,1-(q-0.15)/(holdEnd-0.15)):0.95);
        g.shadowColor='rgba(0,0,0,0.75)';g.shadowBlur=18*fistSc;
        g.drawImage(coreIm,-fw/2,-fh/2,fw,fh);
        g.restore();
      }

      // 부드러운 공기 굴절 소닉 링
      if(q>=0&&q<0.65){
        const uR=q/0.65, rr=(1-Math.pow(1-uR,2.6))*S*(p.main?0.85:0.48);
        g.save();g.globalCompositeOperation='lighter';
        g.globalAlpha=(1-uR)*fadeOut*(p.main?0.68:0.45);
        const rg=g.createRadialGradient(hx,hy,Math.max(1,rr*0.82),hx,hy,rr);
        rg.addColorStop(0,'rgba(255,255,255,0)');
        rg.addColorStop(0.7,p.main?'rgba(255,180,190,0.55)':'rgba(200,240,255,0.45)');
        rg.addColorStop(1,'rgba(255,255,255,0)');
        g.fillStyle=rg;g.beginPath();g.arc(hx,hy,rr,0,7);g.fill();
        g.strokeStyle=`rgba(255,255,255,${(1-uR)*0.75})`;
        g.lineWidth=Math.max(1.2,S*0.012*(1-uR));
        g.beginPath();g.arc(hx,hy,rr*0.92,0,7);g.stroke();
        g.restore();
      }
    });

    shards.forEach(p=>{
      p.a+=dt;if(p.a>=p.l)return;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.8*dt;p.rot+=p.vr*dt;p.sc+=p.vsc*dt;
      drawCrystallineShard(g, p, fadeOut);
    });

    const tq=sm(0,.10,t)*fadeOut;
    if(tq>0){
      const lv=(window.SDMG&&window.SDMG[V])?window.SDMG[V].lv:1;
      g.save();g.globalAlpha=tq;
      g.translate(W/2,H*.12);
      g.font=`900 ${Math.round(S*.066)}px 'Malgun Gothic',sans-serif`;g.textAlign='center';g.lineWidth=S*.011;
      g.strokeStyle='rgba(20,5,8,0.9)';g.fillStyle='#ffd54a';
      const msg=t<0.98?'👊 철권 3연타 강타!':`${name}의 주먹 강타! (${nm(V)} 진영 파손 ${lv}단계)`;
      g.strokeText(msg,0,0);g.fillText(msg,0,0);g.restore();
    }
    if(t<END)requestAnimationFrame(frame);else finish();
  };
  requestAnimationFrame(frame);
}
function fistFire(A,sd){try{comm(fill(pick(CB.fist,'f'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}fist(A,sd)}

/* ---- 2) 🔨 망치(Hammer): 부드러운 궤적과 리얼한 강화유리/장기판 파쇄 연출 ---- */
function hammerSound(t1,t2){
  try{
    const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());
    if(a.state==='suspended')a.resume();
    const t0=a.currentTime;
    [t1,t2].forEach((delay,idx)=>{
      const ti=t0+delay,mul=idx===1?1.25:0.9;
      [680,1120,1680,2480].forEach((f,i)=>{
        const o=a.createOscillator(),og=a.createGain();
        o.type='triangle';o.frequency.setValueAtTime(f,ti);o.frequency.exponentialRampToValueAtTime(f*.45,ti+.32);
        og.gain.setValueAtTime(.20*mul,ti);og.gain.exponentialRampToValueAtTime(.001,ti+.35);
        o.connect(og);og.connect(a.destination);o.start(ti);o.stop(ti+.36);
      });
    });
  }catch(e){}
}

function hammer(A,seed){
  if(nkBusy)return;nkBusy=true;
  const W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2.2),S=Math.min(W,H);
  const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);
  c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:24;pointer-events:none';
  document.body.appendChild(c);const g=c.getContext('2d');
  const gEl=el('g')||document.body;
  const V=side2(A),R=getCampRect(V);
  let sd=(seed||(Date.now()+101))>>>0;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;

  const fx1=0.22+rn()*0.56,fy1=0.24+rn()*0.52,rot1=(rn()-.5)*0.5;
  const fx2=Math.min(.80,Math.max(.20,fx1+(rn()-.5)*0.20)),fy2=Math.min(.78,Math.max(.22,fy1+(rn()-.5)*0.18)),rot2=(rn()-.5)*0.6;
  const strikes=[
    {t0:0.00,tHit:0.38,fx:fx1,fy:fy1,rot:rot1,sc:0.90,main:false,done:false},
    {t0:0.52,tHit:0.96,fx:fx2,fy:fy2,rot:rot2,sc:1.12,main:true,done:false}
  ];

  const shards=[],sparks=[];
  const END=2.95,name=tag(A);
  const duck=au.volume;au.volume=Math.min(duck,.05);
  try{navigator.vibrate&&navigator.vibrate([80,40,220,50,100,40,420])}catch(e){}
  try{snd('whoosh');hammerSound(0.38,0.96);brutalShatterSound(0.38,0.85);brutalShatterSound(0.96,1.3)}catch(e){}

  const tStart=performance.now();let last=tStart;
  const finish=()=>{c.remove();gEl.style.transform='';gEl.style.filter='';cv.style.transform='';au.volume=Math.max(au.volume,duck>.05?duck:.3);nkBusy=false};
  const frame=now=>{
    const t=Math.max(0,(now-tStart)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    const fadeOut=1-sm(END-.55,END,t);
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);

    let shakeAmp=0;
    strikes.forEach(st=>{
      const hx=R.ox+R.bw*st.fx,hy=R.y0+R.h*st.fy;
      if(t>=st.tHit&&!st.done){
        st.done=true;
        window.hitScreen(V,'hammer',st.fx,st.fy,st.rot,st.main);
        if(st.main&&window.hitCamp)window.hitCamp(V,'hammer',{fx:st.fx,fy:st.fy,rot:st.rot});
        const cnt=st.main?42:20;
        for(let i=0;i<cnt;i++){
          const a=rn()*Math.PI*2,sp=S*(.32+1.15*rn())*(st.main?1.15:.8);
          shards.push({
            x:hx,y:hy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-S*.20,
            r:S*(.009+.019*rn()),rot:rn()*6.28,vr:(rn()-.5)*18,
            sc:1,vsc:st.main?0.85:0.4,l:0.8+0.95*rn(),a:0
          });
        }
        for(let i=0;i<(st.main?36:18);i++){
          const a=rn()*Math.PI*2,sp=S*(.35+1.25*rn());
          sparks.push({x:hx,y:hy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:.38+.45*rn(),a:0,col:rn()<.6?'#ffe082':'#80d8ff'});
        }
      }
      if(t>=st.tHit){
        const q=t-st.tHit;
        shakeAmp+=S*(st.main?.085:.045)*Math.exp(-q*(st.main?3.8:6.0));
      }
    });

    const dx=shakeAmp*Math.cos(t*72),dy=shakeAmp*Math.sin(t*82);
    const zSc=t>=0.96&&t<1.42?(1+0.042*Math.exp(-(t-0.96)*7.0)):1;
    gEl.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${zSc})`;

    strikes.forEach((st,sIdx)=>{
      if(t<st.tHit)return;
      const q=t-st.tHit,hx=R.ox+R.bw*st.fx,hy=R.y0+R.h*st.fy;
      const crkSc=Math.min(1,q/0.08);
      g.save();g.beginPath();g.rect(R.x0,R.y0,R.w,R.h);g.clip();
      drawRealisticGlassImpact(g, hx, hy, Math.min(R.bw,R.h)*(st.main?0.46:0.32)*crkSc, st.main?3:2, 'hammer', sIdx*773+55, fadeOut*0.88);
      g.restore();

      if(q<0.68){
        const uR=q/0.68, rr=(1-Math.pow(1-uR,2.5))*S*(st.main?0.92:0.55);
        g.save();g.globalCompositeOperation='lighter';
        g.globalAlpha=(1-uR)*fadeOut*0.65;
        g.strokeStyle=st.main?'#80d8ff':'#ffe082';
        g.lineWidth=Math.max(1.5,S*0.014*(1-uR));
        g.beginPath();g.arc(hx,hy,rr,0,7);g.stroke();
        g.restore();
      }
    });

    const toolIm=SC_IM.ham_tool;
    if(toolIm&&toolIm.complete){
      const activeSt=t<strikes[1].t0?strikes[0]:strikes[1];
      const hx0=R.ox+R.bw*activeSt.fx,hy0=R.y0+R.h*activeSt.fy;
      const dtHit=t-activeSt.tHit;
      const toolAl=t<activeSt.tHit?sm(activeSt.t0,activeSt.t0+.08,t):(activeSt.main?1-sm(.45,1.25,dtHit):1-sm(.08,.22,dtHit));
      if(toolAl>0.01){
        const dur=activeSt.tHit-activeSt.t0;
        const sw=t<activeSt.tHit?Math.pow((t-activeSt.t0)/dur,2.3):1-Math.sin(Math.min(1,dtHit/(activeSt.main?.35:.15))*Math.PI)*(activeSt.main?.18:.42);
        const ang=(1-sw)*1.05;
        const hx=hx0+S*.18+(1-sw)*S*.16,hy=hy0-S*.14-(1-sw)*S*.14;
        const hw=S*.64*activeSt.sc,hh=hw*(toolIm.height/toolIm.width);
        g.save();g.globalAlpha=toolAl*fadeOut;
        g.shadowColor='rgba(0,0,0,0.65)';g.shadowBlur=16;
        g.translate(hx+hw*.35,hy+hh*.25);g.rotate(ang);
        g.drawImage(toolIm,-hw*.85,-hh*.75,hw,hh);
        g.restore();
      }
    }

    g.save();g.globalCompositeOperation='lighter';
    sparks.forEach(p=>{
      p.a+=dt;if(p.a>=p.l)return;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.8*dt;
      const u=p.a/p.l;g.globalAlpha=(1-u)*fadeOut*0.85;
      g.strokeStyle=p.col;g.lineWidth=2.0;
      g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);g.stroke();
    });
    g.restore();

    shards.forEach(p=>{
      p.a+=dt;if(p.a>=p.l)return;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.9*dt;p.rot+=p.vr*dt;p.sc+=p.vsc*dt;
      drawCrystallineShard(g, p, fadeOut);
    });

    const tq=sm(0,.10,t)*fadeOut;
    if(tq>0){
      const lv=(window.SDMG&&window.SDMG[V])?window.SDMG[V].lv:1;
      g.save();g.globalAlpha=tq;
      g.translate(W/2,H*.12);
      g.font=`900 ${Math.round(S*.066)}px 'Malgun Gothic',sans-serif`;g.textAlign='center';g.lineWidth=S*.011;
      g.strokeStyle='rgba(8,18,28,0.9)';g.fillStyle='#80d8ff';
      const msg=t<0.96?'🔨 중장갑 해머 2연속 강타!':`${name}의 해머 분쇄! (${nm(V)} 진영 파손 ${lv}단계)`;
      g.strokeText(msg,0,0);g.fillText(msg,0,0);g.restore();
    }
    if(t<END)requestAnimationFrame(frame);else finish();
  };
  requestAnimationFrame(frame);
}
function hammerFire(A,sd){try{comm(fill(pick(CB.hammer,'h'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}hammer(A,sd)}

/* ---- 3) 🔫 총격(Gunshot): 깔끔하고 날카로운 강화유리 관통 탄흔 & 리얼 탄피/머즐플래시 ---- */
function gunShotSound(shots){
  try{
    const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());
    if(a.state==='suspended')a.resume();
    const t=a.currentTime;
    shots.forEach((st,idx)=>{
      const ti=t+st;
      const len=Math.floor(a.sampleRate*.28),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
      for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.8);
      const n=a.createBufferSource();n.buffer=buf;
      const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(1600,ti);bp.frequency.exponentialRampToValueAtTime(240,ti+.26);
      const ng=a.createGain();ng.gain.setValueAtTime(0.85,ti);ng.gain.exponentialRampToValueAtTime(.001,ti+.28);
      n.connect(bp);bp.connect(ng);ng.connect(a.destination);n.start(ti);

      const o=a.createOscillator(),og=a.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(260,ti);o.frequency.exponentialRampToValueAtTime(36,ti+.18);
      og.gain.setValueAtTime(.75,ti);og.gain.exponentialRampToValueAtTime(.001,ti+.20);
      o.connect(og);o.connect(a.destination);o.start(ti);o.stop(ti+.21);
    });
  }catch(e){}
}

function gun(A,seed){
  if(nkBusy)return;nkBusy=true;
  const W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2.2),S=Math.min(W,H);
  const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);
  c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:24;pointer-events:none';
  document.body.appendChild(c);const g=c.getContext('2d');
  const gEl=el('g')||document.body;
  const V=side2(A),R=getCampRect(V),END=3.1,name=tag(A);
  let sd=(seed||(Date.now()+202))>>>0;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;

  const shots=[];
  for(let i=0;i<5;i++){
    shots.push({
      t:0.22+i*0.24,
      fx:0.18+rn()*0.64,
      fy:0.20+rn()*0.60,
      rot:(rn()-.5)*1.5,
      fired:false
    });
  }
  const sparks=[],shards=[],casings=[];
  const duck=au.volume;au.volume=Math.min(duck,.05);
  try{navigator.vibrate&&navigator.vibrate([70,130,70,130,70,130,70,130,140])}catch(e){}
  gunShotSound(shots.map(s=>s.t));
  const t0=performance.now();let last=t0,mainStepDone=false;
  const finish=()=>{c.remove();gEl.style.transform='';gEl.style.filter='';cv.style.transform='';au.volume=Math.max(au.volume,duck>.05?duck:.3);nkBusy=false};
  const frame=now=>{
    const t=Math.max(0,(now-t0)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    const fadeOut=1-sm(END-.55,END,t);
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);

    let shakeAmp=0;
    shots.forEach((sh,sIdx)=>{
      const hx=R.ox+R.bw*sh.fx,hy=R.y0+R.h*sh.fy;
      if(t>=sh.t&&!sh.fired){
        sh.fired=true;
        if(!mainStepDone&&window.hitCamp)window.hitCamp(V,'gun',{fx:sh.fx,fy:sh.fy,rot:sh.rot});
        window.hitScreen(V,'gun',sh.fx,sh.fy,sh.rot,!mainStepDone);
        mainStepDone=true;
        for(let i=0;i<18;i++){
          const a=rn()*Math.PI*2,sp=S*(.3+1.05*rn());
          sparks.push({x:hx,y:hy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:.28+.35*rn(),a:0,c:rn()<.65?'#ffd54a':'#ffffff'});
        }
        for(let i=0;i<12;i++){
          const a=rn()*Math.PI*2,sp=S*(.25+.85*rn());
          shards.push({x:hx,y:hy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-S*.12,r:S*(.006+.014*rn()),rot:rn()*6.28,vr:(rn()-.5)*16,sc:1,vsc:0.3,l:.65+.75*rn(),a:0});
        }
        casings.push({
          x:W*.78,y:R.y0+R.h*.42,
          vx:S*(.18+rn()*.22),vy:-S*(.38+rn()*.20),
          rot:rn()*6.28,vr:14+rn()*12,l:1.15,a:0
        });
      }
      if(t>=sh.t){
        const q=t-sh.t;
        shakeAmp+=S*.042*Math.exp(-q*10);
      }
    });

    const dx=shakeAmp*Math.cos(t*82),dy=shakeAmp*Math.sin(t*94);
    gEl.style.transform=`translate3d(${dx}px,${dy}px,0)`;

    shots.forEach((sh,idx)=>{
      if(t<sh.t)return;
      const q=t-sh.t,hx=R.ox+R.bw*sh.fx,hy=R.y0+R.h*sh.fy;
      g.save();g.beginPath();g.rect(R.x0,R.y0,R.w,R.h);g.clip();
      drawRealisticGlassImpact(g, hx, hy, Math.min(R.bw,R.h)*0.24*Math.min(1,q/0.06), 2, 'gun', idx*613+99, fadeOut*0.86);
      g.restore();

      if(q<0.14){
        const u=q/0.14,mr=S*(0.09*(1-u*0.4));
        g.save();g.globalCompositeOperation='lighter';
        const fg=g.createRadialGradient(hx,hy,0,hx,hy,mr);
        fg.addColorStop(0,`rgba(255,255,255,${1-u})`);
        fg.addColorStop(0.45,`rgba(255,200,60,${(1-u)*0.8})`);
        fg.addColorStop(1,'rgba(255,80,0,0)');
        g.fillStyle=fg;g.beginPath();g.arc(hx,hy,mr,0,7);g.fill();
        g.restore();
      }
    });

    const gunIm=SC_IM.gun_tool;
    if(gunIm&&gunIm.complete){
      let rec=0;
      shots.forEach(sh=>{if(t>=sh.t&&t<sh.t+.16)rec=Math.max(rec,Math.sin((t-sh.t)/.16*Math.PI))});
      const gw=S*.48,gh=gw*(gunIm.height/gunIm.width);
      const gx=W*.82+rec*S*.035,gy=R.y0+R.h*.52-rec*S*.03;
      g.save();g.globalAlpha=sm(0,.12,t)*(1-sm(END-.65,END-.2,t));
      g.shadowColor='rgba(0,0,0,0.65)';g.shadowBlur=14;
      g.translate(gx,gy);g.rotate(-0.10+rec*0.20);
      g.drawImage(gunIm,-gw/2,-gh/2,gw,gh);
      g.restore();
    }

    casings.forEach(cs=>{
      cs.a+=dt;if(cs.a>=cs.l)return;
      cs.x+=cs.vx*dt;cs.y+=cs.vy*dt;cs.vy+=S*1.8*dt;cs.rot+=cs.vr*dt;
      g.save();g.translate(cs.x,cs.y);g.rotate(cs.rot);
      g.globalAlpha=(1-cs.a/cs.l)*fadeOut;
      const cg=g.createLinearGradient(-7,-3,7,3);
      cg.addColorStop(0,'#fff59d');cg.addColorStop(0.5,'#ffb300');cg.addColorStop(1,'#8d6e63');
      g.fillStyle=cg;g.strokeStyle='#3e2723';g.lineWidth=0.9;
      g.fillRect(-6,-2.5,12,5);g.strokeRect(-6,-2.5,12,5);
      g.restore();
    });

    g.save();g.globalCompositeOperation='lighter';
    sparks.forEach(p=>{
      p.a+=dt;if(p.a>=p.l)return;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.4*dt;
      const u=p.a/p.l;g.globalAlpha=(1-u)*fadeOut;
      g.strokeStyle=p.c;g.lineWidth=1.8;
      g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.028,p.y-p.vy*.028);g.stroke();
    });
    g.restore();

    shards.forEach(p=>{
      p.a+=dt;if(p.a>=p.l)return;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.7*dt;p.rot+=p.vr*dt;
      drawCrystallineShard(g, p, fadeOut);
    });

    const tq=sm(0,.10,t)*fadeOut;
    if(tq>0){
      const lv=(window.SDMG&&window.SDMG[V])?window.SDMG[V].lv:1;
      g.save();g.globalAlpha=tq;
      g.translate(W/2,H*.12);
      g.font=`900 ${Math.round(S*.066)}px 'Malgun Gothic',sans-serif`;g.textAlign='center';g.lineWidth=S*.011;
      g.strokeStyle='rgba(20,10,2,0.9)';g.fillStyle='#ffd54a';
      const msg=t<1.2?'🔫 대구경 철갑탄 정밀 사격!':`${name}의 연속 사격! (${nm(V)} 진영 파손 ${lv}단계)`;
      g.strokeText(msg,0,0);g.fillText(msg,0,0);g.restore();
    }
    if(t<END)requestAnimationFrame(frame);else finish();
  };
  requestAnimationFrame(frame);
}
function gunFire(A,sd){try{comm(fill(pick(CB.gun,'g'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}gun(A,sd)}

/* ---- 4) 💥 에네르기파 2(Kamehameha 2): 이질적인 사각형 외부 GIF 박스를 완전히 제거하고, 인게임 삼국지 대장군 각성 모션 + 초고밀도 창룡 플라즈마 나선 파동포로 전장과 완벽히 조화되도록 리마스터 ---- */
function kame2(A,seed){
  if(nkBusy)return;nkBusy=true;
  const W=innerWidth,H=innerHeight;let d=Math.min(devicePixelRatio||1,2.2);while(W*d*H*d>7e6&&d>1)d-=.25;
  const c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);
  c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:24;pointer-events:none';
  document.body.appendChild(c);const g=c.getContext('2d');
  const gEl=el('g')||document.body;
  const V=side2(A),R=getCampRect(V),RA=getCampRect(A),S=Math.min(W,H);
  let sd=(seed||(Date.now()+777))>>>0;const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;

  // 공격자(A) 본진 중앙에서 각성하여 상대(V) 진영 중심부로 쏘아 올리는 자연스러운 전장 구도
  const sx=RA.ox+RA.bw*0.50, sy=RA.y0+RA.h*0.52;
  const fxHit=0.46+(rn()-.5)*0.14, fyHit=0.48+(rn()-.5)*0.14;
  const tx=R.ox+R.bw*fxHit, ty=R.y0+R.h*fyHit;

  const isHan=(A==='h');
  const colCore='#ffffff';
  const colPrimary=isHan?'#ffab00':'#00e5ff';
  const colSecondary=isHan?'#ff1744':'#2979ff';
  const colAccent='#ffe57f';

  const END=4.6,name=tag(A);let impDone=false;
  const chargeOrbs=[],sparks=[],shards=[];
  for(let i=0;i<56;i++){
    chargeOrbs.push({
      ang:rn()*Math.PI*2,
      dist:S*(0.18+rn()*0.42),
      sp:1.4+rn()*2.2,
      sz:S*(0.004+rn()*0.010),
      col:i%3===0?colAccent:i%2===0?colPrimary:'#ffffff'
    });
  }
  for(let i=0;i<85;i++){
    const a=rn()*Math.PI*2,sp=S*(.35+1.45*rn());
    sparks.push({vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:S*(.006+.018*rn()),l:.85+1.25*rn(),c:rn()<.45?'#ffffff':rn()<.8?colPrimary:colAccent});
  }
  for(let i=0;i<42;i++){
    const a=rn()*Math.PI*2,sp=S*(.30+1.15*rn());
    shards.push({x:tx,y:ty,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-S*.16,r:S*(.008+.018*rn()),rot:rn()*6.28,vr:(rn()-.5)*16,sc:1,vsc:0.5,l:.9+1.0*rn(),a:0});
  }

  const duck=au.volume;au.volume=Math.min(duck,.05);
  try{navigator.vibrate&&navigator.vibrate([50,30,90,30,150,40,380,50,420])}catch(e){}
  kmSound();
  brutalShatterSound(2.25,1.35);

  const t0=performance.now();let last=t0;
  const finish=()=>{c.remove();gEl.style.transform='';gEl.style.filter='';cv.style.transform='';au.volume=Math.max(au.volume,duck>.05?duck:.3);nkBusy=false};

  const frame=now=>{
    const t=Math.max(0,(now-t0)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);
    const fadeOut=1-sm(END-.75,END,t);

    // 전장 분위기 조명 (공격자 진영에서 상대 진영으로 흐르는 시네마틱 그라데이션)
    const bgA=sm(0,.25,t)*fadeOut*0.64;
    if(bgA>0){
      const focusX=t<1.25?sx:tx, focusY=t<1.25?sy:ty;
      const v=g.createRadialGradient(focusX,focusY,S*.06,W/2,H/2,Math.max(W,H)*.85);
      v.addColorStop(0,isHan?`rgba(255,140,0,${bgA*0.42})`:`rgba(0,195,255,${bgA*0.42})`);
      v.addColorStop(0.55,`rgba(8,16,34,${bgA*0.72})`);
      v.addColorStop(1,`rgba(2,5,12,${bgA*0.88})`);
      g.fillStyle=v;g.fillRect(0,0,W,H);
    }

    // 절제되고 묵직한 카메라 진동
    const amp=(t<1.2?S*.008*sm(.1,1.2,t):t<2.25?S*.026:S*.078*Math.exp(-(t-2.25)*2.1))*fadeOut;
    const dx=amp*Math.sin(t*72),dy=amp*Math.cos(t*84);
    const zSc=t>=2.25&&t<2.75?(1+0.045*Math.exp(-(t-2.25)*7)):1;
    gEl.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${zSc})`;

    // 1단계: 인게임 삼국지 대장군(궁/차) 초각성 기 모으기 연출 (사각형 GIF 박스를 완전히 대체!)
    if(t<3.4){
      const auraAl=sm(0,.18,t)*(1-sm(2.85,3.4,t))*fadeOut;
      const pulse=0.85+0.15*Math.sin(t*18);
      const auraR=S*(0.24+0.08*sm(0,1.2,t))*pulse;

      g.save();g.globalCompositeOperation='lighter';
      // 바닥 각성 마법진 (원근 타원 링)
      g.save();g.translate(sx,sy+S*0.05);g.scale(1,0.46);
      for(const [rMul,rotSp,w] of [[1.05,2.2,2.4],[0.76,-3.1,1.6]]){
        g.save();g.rotate(t*rotSp);
        g.strokeStyle=colPrimary;g.globalAlpha=auraAl*0.75;g.lineWidth=w;
        g.setLineDash([14,8]);
        g.beginPath();g.arc(0,0,auraR*rMul,0,Math.PI*2);g.stroke();
        g.restore();
      }
      g.restore();

      // 대장군 주변 다중 방사형 오라 광원
      const ag=g.createRadialGradient(sx,sy,0,sx,sy,auraR*1.45);
      ag.addColorStop(0,`rgba(255,255,255,${0.92*auraAl})`);
      ag.addColorStop(0.32,isHan?`rgba(255,190,40,${0.72*auraAl})`:`rgba(0,229,255,${0.72*auraAl})`);
      ag.addColorStop(0.68,isHan?`rgba(255,40,20,${0.32*auraAl})`:`rgba(20,90,255,${0.32*auraAl})`);
      ag.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=ag;g.beginPath();g.arc(sx,sy,auraR*1.45,0,7);g.fill();

      // 중심으로 수렴하는 고밀도 기공 입자
      chargeOrbs.forEach((o,idx)=>{
        const prog=((t*o.sp + idx*0.13)%1);
        const curD=o.dist*(1-prog);
        const curA=o.ang+t*1.8+prog*2.2;
        const ox=sx+Math.cos(curA)*curD, oy=sy+Math.sin(curA)*curD*0.78;
        g.globalAlpha=auraAl*Math.sin(prog*Math.PI);
        g.fillStyle=o.col;
        g.beginPath();g.arc(ox,oy,o.sz*(0.6+0.8*(1-prog)),0,7);g.fill();
      });
      g.restore();

      // 인게임 대장군(왕/차) 공격 모션 스프라이트 렌더링 (전장 그래픽과 100% 일체화)
      const heroFrames=(typeof SP!=='undefined'&&SP[A]&&SP[A].K&&SP[A].K.atk&&SP[A].K.atk.length)?SP[A].K.atk:
                       (typeof SP!=='undefined'&&SP[A]&&SP[A].R&&SP[A].R.atk)?SP[A].R.atk:null;
      if(heroFrames&&heroFrames.length){
        const fIdx=t<1.2?Math.min(3,Math.floor((t/1.2)*4)):(4+(Math.floor((t-1.2)*12)%Math.max(1,heroFrames.length-4)));
        const hf=heroFrames[fIdx%heroFrames.length];
        if(hf&&hf.im&&hf.im.complete){
          const hSz=S*0.30*(1+0.08*sm(0,1.2,t));
          g.save();
          g.globalAlpha=auraAl;
          g.shadowColor=colPrimary;g.shadowBlur=24;
          g.drawImage(hf.im,sx-hSz/2,sy-hSz/2,hSz,hSz);
          g.restore();
        }
      }

      // 손끝에 응축되는 고밀도 플라즈마 코어 구체
      const coreScale=t<1.2?e3(t/1.2):(1+0.15*Math.sin(t*35));
      const cr=S*0.075*coreScale;
      g.save();g.globalCompositeOperation='lighter';
      const cg=g.createRadialGradient(sx,sy,0,sx,sy,cr*2.2);
      cg.addColorStop(0,`rgba(255,255,255,${auraAl})`);
      cg.addColorStop(0.4,isHan?`rgba(255,230,110,${0.9*auraAl})`:`rgba(120,245,255,${0.9*auraAl})`);
      cg.addColorStop(1,'rgba(0,150,255,0)');
      g.fillStyle=cg;g.beginPath();g.arc(sx,sy,cr*2.2,0,7);g.fill();
      g.restore();
    }

    // 2단계: 초각성 에네르기파 2 나선 플라즈마 광선포 발사 (1.15s ~ 3.45s)
    if(t>=1.15&&t<3.45){
      const u=Math.min(1,(t-1.15)/0.36);
      const bAl=sm(1.15,1.28,t)*(1-sm(2.95,3.45,t))*fadeOut;
      const ex=sx+(tx-sx)*e3(u), ey=sy+(ty-sy)*e3(u);
      const ang=Math.atan2(ey-sy,ex-sx), dist=Math.hypot(ex-sx,ey-sx);
      const bw2=S*(0.14+0.025*Math.sin(t*38))*(t>=2.25?1.18:1.0);

      g.save();g.globalCompositeOperation='lighter';g.translate(sx,sy);g.rotate(ang);

      // 외곽 부드러운 플라즈마 오라 글로우
      const og=g.createLinearGradient(0,-bw2*2.2,0,bw2*2.2);
      og.addColorStop(0,'rgba(0,0,0,0)');
      og.addColorStop(0.2,isHan?`rgba(255,60,20,${0.35*bAl})`:`rgba(0,110,255,${0.35*bAl})`);
      og.addColorStop(0.5,isHan?`rgba(255,190,40,${0.75*bAl})`:`rgba(0,229,255,${0.75*bAl})`);
      og.addColorStop(0.8,isHan?`rgba(255,60,20,${0.35*bAl})`:`rgba(0,110,255,${0.35*bAl})`);
      og.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=og;
      g.beginPath();g.roundRect(0,-bw2*2.2,dist,bw2*4.4,bw2*2.2);g.fill();

      // 메인 고밀도 에너지 스트림
      const mg=g.createLinearGradient(0,-bw2,0,bw2);
      mg.addColorStop(0,'rgba(255,255,255,0)');
      mg.addColorStop(0.22,isHan?`rgba(255,215,64,${0.92*bAl})`:`rgba(64,228,255,${0.92*bAl})`);
      mg.addColorStop(0.5,`rgba(255,255,255,${bAl})`);
      mg.addColorStop(0.78,isHan?`rgba(255,215,64,${0.92*bAl})`:`rgba(64,228,255,${0.92*bAl})`);
      mg.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=mg;
      g.beginPath();g.roundRect(0,-bw2,dist,bw2*2,bw2);g.fill();

      // 광선포를 휘감는 2중 나선(Double Helix) 용맥 파동 및 충격파 링
      for(const sign of [-1,1]){
        g.strokeStyle=sign>0?`rgba(255,248,190,${0.88*bAl})`:`rgba(160,248,255,${0.88*bAl})`;
        g.lineWidth=2.8;
        g.beginPath();
        for(let x=0;x<=dist;x+=10){
          const wy=sign*Math.sin(x*0.048-t*34)*bw2*1.05;
          x===0?g.moveTo(x,wy):g.lineTo(x,wy);
        }
        g.stroke();
      }
      // 광선 축을 따라 빠르게 전진하는 쇼크웨이브 링
      for(let r=0;r<5;r++){
        const rx=((t*2.8+r*0.2)%1)*dist;
        g.strokeStyle=`rgba(255,255,255,${0.65*bAl*(1-rx/dist*0.4)})`;
        g.lineWidth=2.0;
        g.beginPath();g.ellipse(rx,0,bw2*0.28,bw2*1.25,0,0,Math.PI*2);g.stroke();
      }

      // 발사구 & 탄착점 고열 플라즈마 구체
      for(const [px0,radMul] of [[0,1.4],[dist,2.1]]){
        const hg=g.createRadialGradient(px0,0,0,px0,0,bw2*radMul);
        hg.addColorStop(0,`rgba(255,255,255,${bAl})`);
        hg.addColorStop(0.45,isHan?`rgba(255,200,50,${0.88*bAl})`:`rgba(80,235,255,${0.88*bAl})`);
        hg.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=hg;g.beginPath();g.arc(px0,0,bw2*radMul,0,7);g.fill();
      }
      g.restore();
    }

    // 3단계: 상대 진영 장기판 대분열(hitCamp) + 리얼 강화유리 파손(hitScreen) 작렬 (t >= 2.25s)
    if(t>=2.25){
      if(!impDone){
        impDone=true;
        if(window.hitCamp)window.hitCamp(V,'kame2',{fx:fxHit,fy:fyHit,rot:Math.atan2(ty-sy,tx-sx)});
        if(window.hitScreen)window.hitScreen(V,'fist',fxHit,fyHit,(rn()-.5)*0.25,true);
      }
      const q=t-2.25;
      // 탄착 지점 리얼 강화유리 크랙 확산
      g.save();g.beginPath();g.rect(R.x0,R.y0,R.w,R.h);g.clip();
      drawRealisticGlassImpact(g, tx, ty, Math.min(R.bw,R.h)*0.48*Math.min(1,q/0.12), 3, 'kame2', 777123, fadeOut*0.85);
      g.restore();

      // 다중 플라즈마 돔 & 충격파 링
      g.save();g.globalCompositeOperation='lighter';
      if(q<1.35){
        const uD=q/1.35, dr=(1-Math.pow(1-uD,2.4))*S*0.68;
        const dg=g.createRadialGradient(tx,ty,0,tx,ty,dr);
        dg.addColorStop(0,`rgba(255,255,255,${(1-uD)*0.9*fadeOut})`);
        dg.addColorStop(0.45,isHan?`rgba(255,180,30,${(1-uD)*0.65*fadeOut})`:`rgba(0,229,255,${(1-uD)*0.65*fadeOut})`);
        dg.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=dg;g.beginPath();g.arc(tx,ty,dr,0,7);g.fill();

        const rr=(1-Math.pow(1-uD,2.8))*S*1.15;
        g.strokeStyle=colPrimary;
        g.globalAlpha=(1-uD)*fadeOut*0.85;
        g.lineWidth=Math.max(2,S*0.018*(1-uD));
        g.beginPath();g.arc(tx,ty,rr,0,7);g.stroke();
      }
      sparks.forEach(p=>{
        if(q>=p.l)return;
        const u=q/p.l,px=tx+p.vx*q,py=ty+p.vy*q;
        g.globalAlpha=(1-u)*fadeOut*0.9;g.fillStyle=p.c;
        g.beginPath();g.arc(px,py,p.r*(1.3-.7*u),0,7);g.fill();
      });
      g.restore();

      shards.forEach(p=>{
        p.a+=dt;if(p.a>=p.l)return;
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=S*1.8*dt;p.rot+=p.vr*dt;p.sc+=p.vsc*dt;
        drawCrystallineShard(g, p, fadeOut);
      });

      if(q<.28){
        const fl=1-q/.28;
        g.fillStyle=`rgba(230,252,255,${.62*fl*fl})`;
        g.fillRect(0,0,W,H);
      }
    }

    // 상단 시네마틱 타이틀
    const tq=sm(0,.12,t)*fadeOut;
    if(tq>0){
      g.save();g.globalAlpha=tq;
      g.translate(W/2,H*.12);
      g.font=`900 ${Math.round(S*.070)}px 'Malgun Gothic',sans-serif`;g.textAlign='center';g.lineWidth=S*.012;
      g.strokeStyle='rgba(4,12,26,0.92)';g.fillStyle=t<2.25?colPrimary:'#ffd54a';
      const msg=t<1.15?`⚡ ${name} 대장군 초각성 기 응축!`:t<2.25?'💥 창룡 에네르기파 2 발사!!':`${name}의 초각성 에네르기파 2 작렬!`;
      g.strokeText(msg,0,0);g.fillText(msg,0,0);g.restore();
    }

    if(t<END)requestAnimationFrame(frame);else finish();
  };
  requestAnimationFrame(frame);
}
function kame2Fire(A,sd){try{comm(fill(pick(CB.kame2,'k2'+Date.now()%97),{A:tag(A),V:tag(side2(A))}),'nuke',.3)}catch(e){}kame2(A,sd)}

/* ---- 응징 스킬(핵폭탄 / 메테오 / 외계인 / 에네르기파 / 에네르기파 2 / 주먹 / 망치 / 총격) 직접 선택 발동 버튼 ---- */
['xp_nuke','xp_meteor','xp_alien','xp_kame','xp_kame2','xp_fist','xp_hammer','xp_gun'].forEach(id=>{
  const b=el(id);if(!b)return;
  b.onpointerdown=ev=>ev.preventDefault();
  b.onclick=()=>{
    if(!inGame||over||isSpec)return;
    if(punishCnt<=0)return toast('상대 시간초과 또는 상대 차(車)를 잡으면 충전됩니다!',2200);
    if(nkBusy)return toast('이미 공격 이펙트가 진행 중이에요!',1500);
    const sk=b.getAttribute('data-sk'),sd=(Date.now()^(Math.random()*0x7fffffff))>>>0;
    punishCnt--;updPunishBtn();
    if(cfg.mode==='mp')snd2({k:sk,by:me,sd});
    if(sk==='nuke')nukeFire(me);
    else if(sk==='meteor')meteorFire(me);
    else if(sk==='alien')alienFire(me);
    else if(sk==='kame')kameFire(me);
    else if(sk==='kame2')kame2Fire(me,sd);
    else if(sk==='fist')fistFire(me,sd);
    else if(sk==='hammer')hammerFire(me,sd);
    else if(sk==='gun')gunFire(me,sd);
  };
});

/* ---- 관전자 전용: 실시간 훈수 펜 & 경로 화살표 그리기 (포인터 캡처 및 터치/마우스 완벽 검증) ---- */
let specStrokes=[],specMode='pen',specCol='#ff3b30',curStroke=null;
const spCols=['#ff3b30','#ffd60a','#30d158','#5ac8fa'];
['xsp_pen','xsp_arr'].forEach(id=>{const b=el(id);if(b)b.onclick=()=>{specMode=id==='xsp_pen'?'pen':'arr';el('xsp_pen').classList.toggle('xon',specMode==='pen');el('xsp_arr').classList.toggle('xon',specMode==='arr');toast(specMode==='pen'?'✏️ 자유펜 모드: 장기판 위에 드래그해서 낙서하세요':'↗️ 화살표 모드: 출발점부터 도착점까지 드래그하세요',1800)}});
spCols.forEach((c,i)=>{const b=el('xsp_c'+i);if(b)b.onclick=()=>{specCol=c;spCols.forEach((_,j)=>el('xsp_c'+j).classList.toggle('xon',i===j))}});
if(el('xsp_clr'))el('xsp_clr').onclick=()=>{specStrokes=[];curStroke=null;snd2({k:'sclr',from:'👁️'+nick()});toast('훈수 그림을 모두 지웠어요',1500)};
window.jgSpecNotice=function(sn,cnt,joined){
  sysLog('👁️ '+sn+'님이 '+(joined?'관전자로 입장했어요':'관전을 마쳤어요')+' (관전 '+cnt+'/4명)',joined?'xs xg':'xs');
};
const toGrid=(clientX,clientY)=>{
  const cEl=cv||$('cv');if(!cEl||!CX||!CY)return[0,0];
  const r=cEl.getBoundingClientRect();
  let gx=(clientX-r.left-OX)/CX,gy=(clientY-r.top-OY)/CY;
  if(flip){gx=8-gx;gy=9-gy}
  return[Math.round(gx*100)/100,Math.round(gy*100)/100];
};
const fromGrid=(gx,gy)=>{
  const x=flip?8-gx:gx,y=flip?9-gy:gy;
  return[OX+x*CX,OY+y*CY];
};
{
  const cEl=$('cv');
  cEl.addEventListener('pointerdown',e=>{
    if(!isSpec||!inGame||over)return;
    e.preventDefault();e.stopPropagation();
    try{cEl.setPointerCapture(e.pointerId)}catch(x){}
    const[gx,gy]=toGrid(e.clientX,e.clientY);
    if(gx<-1.2||gx>9.2||gy<-1.2||gy>10.2)return;
    curStroke={id:e.pointerId,mode:specMode,col:specCol,nick:nick().slice(0,8),pts:[[gx,gy]],t0:performance.now()};
  },{passive:false});
  cEl.addEventListener('pointermove',e=>{
    if(!curStroke||!isSpec||(curStroke.id!=null&&e.pointerId!==curStroke.id))return;
    e.preventDefault();
    const[gx,gy]=toGrid(e.clientX,e.clientY);
    if(curStroke.mode==='arr'){curStroke.pts[1]=[gx,gy]}
    else{const last=curStroke.pts[curStroke.pts.length-1];if(Math.hypot(gx-last[0],gy-last[1])>.04&&curStroke.pts.length<240)curStroke.pts.push([gx,gy])}
  },{passive:false});
  const finishStroke=e=>{
    if(!curStroke||!isSpec||(curStroke.id!=null&&e&&e.pointerId!=null&&e.pointerId!==curStroke.id))return;
    try{if(e&&e.pointerId!=null)cEl.releasePointerCapture(e.pointerId)}catch(x){}
    const s=curStroke;curStroke=null;
    if(s.mode==='arr'&&s.pts.length<2)return;
    s.t0=performance.now();specStrokes.push(s);
    snd2({k:'sdraw',s:{mode:s.mode,col:s.col,nick:s.nick,pts:s.pts}});
  };
  cEl.addEventListener('pointerup',finishStroke);
  cEl.addEventListener('pointercancel',finishStroke);
}
window.jgDrawSpec=function(g,now){
  const DURATION=15000;
  specStrokes=specStrokes.filter(s=>now-s.t0<DURATION);
  const list=curStroke?specStrokes.concat([curStroke]):specStrokes;
  if(!list.length)return;
  g.save();g.lineCap='round';g.lineJoin='round';
  list.forEach(s=>{
    const age=now-s.t0,al=age>DURATION-2500?Math.max(0,(DURATION-age)/2500):1;
    if(!s.pts||!s.pts.length||al<=0)return;
    g.globalAlpha=al*.92;g.strokeStyle=s.col||'#ff3b30';g.fillStyle=s.col||'#ff3b30';
    g.shadowColor='rgba(0,0,0,0.85)';g.shadowBlur=6;
    if(s.mode==='arr'&&s.pts.length>=2){
      const[x0,y0]=fromGrid(s.pts[0][0],s.pts[0][1]),[x1,y1]=fromGrid(s.pts[1][0],s.pts[1][1]);
      const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);
      if(L>4){
        const ux=dx/L,uy=dy/L,hs=Math.max(12,C*.32),bx=x1-ux*hs*.7,by=y1-uy*hs*.7,nx=-uy,ny=ux;
        g.lineWidth=Math.max(4.5,C*.12);
        g.beginPath();g.moveTo(x0,y0);g.lineTo(bx,by);g.stroke();
        g.beginPath();g.moveTo(x1,y1);g.lineTo(bx+nx*hs*.68,by+ny*hs*.68);g.lineTo(bx-nx*hs*.68,by-ny*hs*.68);g.closePath();g.fill();
      }
    }else{
      g.lineWidth=Math.max(4,C*.1);
      g.beginPath();
      s.pts.forEach((p,i)=>{const[x,y]=fromGrid(p[0],p[1]);if(i===0)g.moveTo(x,y);else g.lineTo(x,y)});
      if(s.pts.length===1){const[x,y]=fromGrid(s.pts[0][0],s.pts[0][1]);g.arc(x,y,Math.max(3.5,C*.07),0,7);g.fill()}
      else g.stroke();
    }
    if(s.nick){
      const[lx,ly]=fromGrid(s.pts[0][0],s.pts[0][1]);
      g.font=`900 ${Math.max(11,Math.round(C*.24))}px sans-serif`;
      g.lineWidth=3;g.strokeStyle='#000';g.strokeText('👁️'+s.nick,lx+6,ly-6);
      g.fillStyle='#fff';g.fillText('👁️'+s.nick,lx+6,ly-6);
    }
  });
  g.restore();
};

/* ---- 4단계 고강도 리얼 장기판 파괴 렌더링 (깊은 폭격 크레이터·3D 쪼개진 나무 단면·방사형 대균열·파편 더미) ---- */
window.DMG={c:0,h:0};
const CR_SRC=[
  "assets/images/image_45.webp",
  "assets/images/image_46.webp",
  "assets/images/image_47.webp",
  "assets/images/image_48.webp",
  "assets/images/image_49.webp"
],CR_IM=[];
CR_SRC.forEach(src=>{const im=new Image();im.onload=()=>{if(window.DMG&&(DMG.c||DMG.h)){rzK='';try{resize()}catch(e){}}};im.src=src;CR_IM.push(im)});
window.jgDmg=s=>Math.min(4,Math.max(0,(window.DMG&&window.DMG[s])||0));
window.DMG_SK={c:[],h:[]};
function ensureDmgSk(){
  if(!window.DMG_SK||typeof window.DMG_SK!=='object')window.DMG_SK={c:[],h:[]};
  if(!Array.isArray(window.DMG_SK.c))window.DMG_SK.c=[];
  if(!Array.isArray(window.DMG_SK.h))window.DMG_SK.h=[];
  return window.DMG_SK;
}

window.hitCamp=function(s,sk,extra){
  if(!window.DMG)window.DMG={c:0,h:0};
  window.DMG[s]=Math.min(4,(window.DMG[s]||0)+1);
  const dsk=ensureDmgSk();
  const skillType=sk||'nuke';
  dsk[s].push({
    sk:skillType,
    lv:window.DMG[s],
    fx:(extra&&extra.fx!=null)?extra.fx:(0.26+(dsk[s].length*0.21)%0.48),
    fy:(extra&&extra.fy!=null)?extra.fy:(0.28+(dsk[s].length*0.18)%0.44),
    rot:(extra&&extra.rot!=null)?extra.rot:((dsk[s].length%2?1:-1)*0.22)
  });
  if(dsk[s].length>6)dsk[s]=dsk[s].slice(-6);
  if(window.jgTriggerBoardSplit)try{window.jgTriggerBoardSplit(s,skillType)}catch(e){}
  xsave();
  if(cfg.mode==='mp'&&!isSpec)snd2({k:'dmg_sync',DMG:window.DMG,DMG_SK:window.DMG_SK});
  rzK='';try{resize()}catch(e){}
};

window.jgSplitAnim={c:null,h:null};
window.jgTriggerBoardSplit=function(side,sk){
  const colMap={
    nuke:['#ff6d00','#ffd54a','#ff1744'],
    meteor:['#ff3d00','#ffab00','#dd2c00'],
    alien:['#76ff03','#00e5ff','#00c853'],
    kame:['#00e5ff','#ffffff','#2979ff'],
    kame2:['#00e5ff','#ffe57f','#00b0ff'],
    fist:['#ff5252','#ffd54a','#8d5524'],
    hammer:['#80d8ff','#cfd8dc','#4dd0e1'],
    gun:['#ffd54a','#ff9100','#fff59d']
  };
  const cols=colMap[sk]||colMap.nuke;
  const rocks=[];
  for(let i=0;i<28;i++){
    const a=Math.random()*Math.PI*2,sp=0.38+Math.random()*1.15;
    rocks.push({
      fx:0.18+Math.random()*0.64,
      fy:0.15+Math.random()*0.65,
      vx:Math.cos(a)*sp,
      vy:Math.sin(a)*sp-0.48,
      sz:0.045+Math.random()*0.085,
      rot:Math.random()*6.28,
      vr:(Math.random()-0.5)*12,
      col:i%3===0?cols[0]:i%3===1?'#a17449':'#5c3818'
    });
  }
  window.jgSplitAnim[side]={t0:performance.now(),sk:sk||'nuke',cols,rocks,lv:(window.DMG&&window.DMG[side])||1};
};

// 정교한 지각 단층 및 보조 균열 트리 생성기
function buildTectonicCanyons(xMin,bw,yEdge,dir,bh,C,lv,side){
  let sd=side==='c'?73856093:19349663;
  const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
  const canyons=[];
  // 1) 메인 대단층 (장기판 진영을 가로지르며 양쪽으로 벌어지게 만드는 주 협곡)
  const mainPts=[];
  const steps=14+lv*2;
  const cx=xMin+bw*(side==='c'?0.22:0.78);
  const cy=yEdge-dir*C*0.18; // 외곽 테두리 밖에서부터 시작해 테두리까지 실제로 쪼개짐
  const tx=xMin+bw*(side==='c'?0.78:0.22);
  const ty=yEdge+dir*bh*(0.58+lv*0.08);
  for(let i=0;i<=steps;i++){
    const u=i/steps;
    const envelope=Math.sin(u*Math.PI);
    const jx=(i===0||i===steps)?0:(rn()-0.5)*C*(0.28+lv*0.04);
    const jy=(i===0||i===steps)?0:(rn()-0.5)*C*0.16;
    const wMul=(0.35+0.65*envelope)*(0.78+0.35*rn())*(0.62+lv*0.20);
    mainPts.push({
      x:cx+(tx-cx)*u+jx,
      y:cy+(ty-cy)*u+jy,
      w:C*(0.11+0.11*wMul)
    });
  }
  canyons.push(mainPts);

  // 2) Lv2 이상: 주 단층에서 갈라져 나오는 Y자 지각 분기 단층
  if(lv>=2){
    const branchPts=[];
    const bSteps=10;
    const mid=mainPts[Math.floor(mainPts.length*0.42)];
    const bx1=xMin+bw*(side==='c'?0.14:0.86);
    const by1=yEdge+dir*bh*(0.68+lv*0.05);
    for(let i=0;i<=bSteps;i++){
      const u=i/bSteps;
      const wMul=Math.pow(1-u*0.75,0.8)*(0.55+lv*0.16);
      branchPts.push({
        x:mid.x+(bx1-mid.x)*u+(i>0?(rn()-0.5)*C*0.22:0),
        y:mid.y+(by1-mid.y)*u+(i>0?(rn()-0.5)*C*0.14:0),
        w:C*(0.08+0.08*wMul)
      });
    }
    canyons.push(branchPts);
  }

  // 3) Lv3~4: 측면 외곽 절벽까지 쪼개는 3차 단층
  if(lv>=3){
    const subPts=[];
    const sSteps=9;
    const p0=mainPts[Math.floor(mainPts.length*0.64)];
    const sx1=side==='c'?(xMin+bw+C*0.15):(xMin-C*0.15);
    const sy1=yEdge+dir*bh*0.44;
    for(let i=0;i<=sSteps;i++){
      const u=i/sSteps;
      subPts.push({
        x:p0.x+(sx1-p0.x)*u+(i>0?(rn()-0.5)*C*0.18:0),
        y:p0.y+(sy1-p0.y)*u+(i>0?(rn()-0.5)*C*0.14:0),
        w:C*0.11*(1-u*0.45)*(0.75+lv*0.12)
      });
    }
    canyons.push(subPts);
  }
  return canyons;
}

// 장기판이 실제로 좌우/외곽으로 벌어지는(Plate Separation) 효과를 렌더링 (게임 조작 및 기물 위치 방해 0%)
window.jgDrawBoardSplitPlates=function(g,drawRawBoardImg,st){
  ['c','h'].forEach(side=>{
    const lv=window.jgDmg(side);
    if(!lv||lv<=0)return;
    const isBottom=flip?(side==='h'):(side==='c');
    const yMin=isBottom?OY+4.52*CY:OY-CY*0.55;
    const yMax=isBottom?OY+9*CY+CY*0.55:OY+4.48*CY;
    const yEdge=isBottom?OY+9*CY:OY;
    const dir=isBottom?-1:1;
    const xMin=OX,xMax=OX+8*CX,bw=xMax-xMin,bh=4.48*CY;
    const canyons=buildTectonicCanyons(xMin,bw,yEdge,dir,bh,C,lv,side);
    const mainPts=canyons[0];
    if(!mainPts||mainPts.length<2)return;

    // 실시간 대분열 충격 직후에는 더 크게 벌어졌다가 탄성 있게 자리잡음
    let animBoost=0;
    const spAnim=window.jgSplitAnim&&window.jgSplitAnim[side];
    if(spAnim){
      const dt=(performance.now()-spAnim.t0)*0.001;
      if(dt>=0&&dt<2.4)animBoost=Math.sin(Math.min(1,dt/0.18)*Math.PI*0.5)*Math.exp(-dt*1.6)*C*0.085;
    }
    const shiftPx=C*(0.026+lv*0.018)+animBoost; // 약 2px ~ 6.5px의 세련되고 리얼한 지각 벌어짐 유격

    // 단층 좌측 판(Left Tectonic Plate)과 우측 판(Right Tectonic Plate)을 각각 클리핑하여 바깥쪽으로 미세 이동
    for(const plateSign of [-1, 1]){
      g.save();
      g.beginPath();
      if(plateSign < 0){
        g.moveTo(xMin - CX*0.6, yMin);
        for(let i=0;i<mainPts.length;i++)g.lineTo(mainPts[i].x, mainPts[i].y);
        g.lineTo(xMin - CX*0.6, yMax);
      }else{
        g.moveTo(xMax + CX*0.6, yMin);
        for(let i=0;i<mainPts.length;i++)g.lineTo(mainPts[i].x, mainPts[i].y);
        g.lineTo(xMax + CX*0.6, yMax);
      }
      g.closePath();
      g.clip();
      g.translate(plateSign * shiftPx, dir * shiftPx * 0.28);
      drawRawBoardImg(g);
      g.restore();
    }

    // 장기판 외곽 테두리가 단층에 의해 실제로 끊어지고 어긋난 3D 절단면(Split Rim Gap) 표현
    const pEdge=mainPts[0];
    const gapW=pEdge.w*1.25+shiftPx*1.8;
    g.save();
    // 테두리가 벌어진 틈새의 어두운 심연과 양쪽 나무/석판 두께 단면
    g.fillStyle=st.slabDeep||'#120802';
    g.beginPath();
    g.rect(pEdge.x - gapW, yEdge - C*0.14, gapW*2, C*0.28);
    g.fill();

    // 벌어진 테두리 좌우 절단면 입체 두께
    for(const sgn of [-1, 1]){
      const rx = pEdge.x + sgn * gapW;
      g.fillStyle = sgn < 0 ? (st.slabEdge||'#7a4f2a') : (st.slabDeep||'#2b1405');
      g.beginPath();
      g.moveTo(rx, yEdge - C*0.11);
      g.lineTo(rx + sgn*C*0.09, yEdge - C*0.07);
      g.lineTo(rx + sgn*C*0.07, yEdge + C*0.11);
      g.lineTo(rx, yEdge + C*0.09);
      g.closePath();
      g.fill();
    }
    g.restore();
  });
};

// 바위/목재 절벽 해칭(층리) 및 미세 잔균열 렌더링 보조 함수
function drawFineRockFractures(g, originX, originY, baseAng, len, depth, rn, st){
  if(depth <= 0 || len < 4) return;
  let px = originX, py = originY, ang = baseAng;
  const segs = 3 + depth;
  const step = len / segs;

  g.save();
  g.lineCap = 'round';
  for(let s=0; s<segs; s++){
    const u = s / segs;
    ang += (rn() - 0.5) * 0.45;
    const nx = px + Math.cos(ang) * step * (0.75 + 0.5 * rn());
    const ny = py + Math.sin(ang) * step * (0.75 + 0.5 * rn());
    const w = Math.max(0.5, (depth * 0.85) * (1 - u * 0.65));

    // 베벨 하이라이트 (우하단 0.8px)
    g.strokeStyle = st.bevel || 'rgba(255,225,160,0.42)';
    g.lineWidth = w;
    g.beginPath(); g.moveTo(px+0.8, py+0.8); g.lineTo(nx+0.8, ny+0.8); g.stroke();

    // 깊은 실금 본체
    g.strokeStyle = 'rgba(10, 5, 2, 0.85)';
    g.lineWidth = w * 1.1;
    g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();

    px = nx; py = ny;
    if(s === 1 && depth > 1 && rn() < 0.65){
      drawFineRockFractures(g, px, py, ang + (rn()<0.5?1:-1)*(0.45+0.35*rn()), len*0.58, depth-1, rn, st);
    }
  }
  g.restore();
}

function drawCampDamage(g,side,lv,debrisOnly){
  if(!lv||lv<=0)return;
  const bIdx=window.curBoardIdx||0;
  const st=BOARD_STYLE_META[bIdx]||BOARD_STYLE_META[0];
  const isBottom=flip?(side==='h'):(side==='c');
  const yMin=isBottom?OY+4.52*CY:OY-CY*.48;
  const yMax=isBottom?OY+9*CY+CY*.48:OY+4.48*CY;
  const yEdge=isBottom?OY+9*CY:OY;
  const dir=isBottom?-1:1;
  const xMin=OX,xMax=OX+8*CX,bw=xMax-xMin,bh=4.48*CY;
  let sd=side==='c'?918273:546372;
  const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
  const dsk=ensureDmgSk()[side];
  const lastSk=(dsk.length?dsk[dsk.length-1].sk:(side==='c'?'nuke':'meteor'));
  const canyons=buildTectonicCanyons(xMin,bw,yEdge,dir,bh,C,lv,side);

  // 실시간 벌어짐 보너스 반영
  let animBoost=0;
  const spAnim=window.jgSplitAnim&&window.jgSplitAnim[side];
  if(spAnim){
    const dt=(performance.now()-spAnim.t0)*0.001;
    if(dt>=0&&dt<2.4)animBoost=Math.sin(Math.min(1,dt/0.18)*Math.PI*0.5)*Math.exp(-dt*1.6)*C*0.07;
  }
  const splitExtra=C*(0.018+lv*0.014)+animBoost;

  if(!debrisOnly){
    g.save();
    g.beginPath();g.rect(xMin-CX*.55,yMin,bw+CX*1.1,yMax-yMin);g.clip();

    // 1. 고밀도 다층 3D 지각 단층 & 장기판 벌어짐 협곡(Multi-Strata Tectonic Chasm) 렌더링
    canyons.forEach((pts,cIdx)=>{
      if(pts.length<2)return;
      const leftRim=[],rightRim=[],step1L=[],step1R=[],step2L=[],step2R=[],abyssL=[],abyssR=[];
      const normals=[];

      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        const pPrev=pts[Math.max(0,i-1)],pNext=pts[Math.min(pts.length-1,i+1)];
        const dx=pNext.x-pPrev.x,dy=pNext.y-pPrev.y,L=Math.hypot(dx,dy)||1;
        const nx=-dy/L,ny=dx/L;
        normals.push([nx,ny]);
        const w = p.w + (cIdx===0 ? splitExtra : splitExtra*0.5);

        // 비대칭 톱니 단면으로 인위적인 직선 느낌 완전 제거
        const jagL = 0.82 + 0.36 * rn();
        const jagR = 0.82 + 0.36 * rn();
        leftRim.push([p.x + nx*w*jagL, p.y + ny*w*jagL]);
        rightRim.unshift([p.x - nx*w*jagR, p.y - ny*w*jagR]);

        // 1단 상부 파쇄 암반/목재 단층 (빛을 받는 사면과 그늘진 사면 구분)
        step1L.push([p.x + nx*w*jagL*0.76, p.y + ny*w*jagL*0.76 + dir*C*0.032]);
        step1R.unshift([p.x - nx*w*jagR*0.76, p.y - ny*w*jagR*0.76 + dir*C*0.032]);

        // 2단 중부 암벽 층리 단층
        step2L.push([p.x + nx*w*jagL*0.48, p.y + ny*w*jagL*0.48 + dir*C*0.068]);
        step2R.unshift([p.x - nx*w*jagR*0.48, p.y - ny*w*jagR*0.48 + dir*C*0.068]);

        // 3단 최심부 심연 크레바스 바닥
        abyssL.push([p.x + nx*w*0.24, p.y + ny*w*0.24 + dir*C*0.095]);
        abyssR.unshift([p.x - nx*w*0.24, p.y - ny*w*0.24 + dir*C*0.095]);
      }

      const polyRim = leftRim.concat(rightRim);
      const polyStep1 = step1L.concat(step1R);
      const polyStep2 = step2L.concat(step2R);
      const polyAbyss = abyssL.concat(abyssR);

      // (A) 단층 외곽 그을음 & 앰비언트 오클루전 그림자
      g.save();
      g.shadowColor='rgba(0,0,0,0.88)';
      g.shadowBlur=Math.max(8, C*0.22);
      g.fillStyle=st.slabEdge||'#6e4720';
      g.beginPath();polyRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      g.restore();

      // (B) 1단 파쇄 절벽면 (상판이 쪼개진 밝은 속살 단면)
      const cliffGrad = g.createLinearGradient(xMin, yEdge, xMax, yEdge + dir*bh*0.7);
      cliffGrad.addColorStop(0, st.slabEdge||'#7d5228');
      cliffGrad.addColorStop(0.5, '#4a2c11');
      cliffGrad.addColorStop(1, st.slabDeep||'#2b1506');
      g.fillStyle = cliffGrad;
      g.beginPath();polyRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

      // (C) 2단 깊은 암반 단층
      g.fillStyle = '#211005';
      g.beginPath();polyStep1.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

      // (D) 절벽 수직 층리(Rock Striation Lines): 단면이 평평해 보이지 않도록 가장자리에서 심연으로 내려가는 암석 결 표현
      g.strokeStyle = 'rgba(255, 220, 160, 0.22)';
      g.lineWidth = 0.9;
      g.beginPath();
      for(let i=0; i<leftRim.length; i++){
        g.moveTo(leftRim[i][0], leftRim[i][1]);
        g.lineTo(step2L[i][0], step2L[i][1]);
        const rIdx = rightRim.length - 1 - i;
        g.moveTo(rightRim[rIdx][0], rightRim[rIdx][1]);
        g.lineTo(step2R[rIdx][0], step2R[rIdx][1]);
      }
      g.stroke();

      g.strokeStyle = 'rgba(0, 0, 0, 0.65)';
      g.lineWidth = 1.1;
      g.beginPath();
      for(let i=0; i<step1L.length; i+=2){
        g.moveTo(step1L[i][0], step1L[i][1]);
        g.lineTo(abyssL[i][0], abyssL[i][1]);
      }
      g.stroke();

      // (E) 3단 & 최심부 심연 바닥
      g.fillStyle = '#0d0603';
      g.beginPath();polyStep2.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      g.fillStyle = '#040201';
      g.beginPath();polyAbyss.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

      // (F) 심연 바닥에서 은은하게 배어 나오는 마그마/플라즈마 광맥 (위쪽에 식은 암석 브릿지 조각들을 덮어 과하지 않고 리얼하게 표현)
      const coreCol=lastSk==='kame'||lastSk==='kame2'?'#00e5ff':lastSk==='alien'?'#76ff03':lastSk==='hammer'?'#80d8ff':'#ff5722';
      g.save();
      g.strokeStyle=coreCol;
      g.shadowColor=coreCol;g.shadowBlur=6;
      g.globalAlpha=0.68;
      g.lineWidth=Math.max(1.4,C*(0.028+lv*0.008)*(cIdx===0?1:0.65));
      g.setLineDash([C*0.22, C*0.11, C*0.08, C*0.14]); // 암석 조각에 가려져 끊겨 보이는 리얼한 심연 광맥
      g.beginPath();
      pts.forEach((p,i)=>i?g.lineTo(p.x,p.y+dir*C*0.06):g.moveTo(p.x,p.y+dir*C*0.06));
      g.stroke();
      g.restore();

      // (G) 쪼개진 상판 모서리의 날카로운 3D 베벨 하이라이트 (빛을 받는 쪽은 밝게, 반대쪽은 짙은 음영)
      g.strokeStyle = st.bevel || 'rgba(255, 230, 175, 0.72)';
      g.lineWidth = Math.max(1.3, C*0.032);
      g.beginPath();
      leftRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      g.stroke();

      g.strokeStyle = 'rgba(15, 7, 2, 0.85)';
      g.lineWidth = Math.max(1.4, C*0.035);
      g.beginPath();
      rightRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      g.stroke();

      // (H) 단층 양옆으로 뻗어나가는 리얼한 미세 암석 잔균열(Micro-fissures)
      for(let i=1; i<pts.length-1; i+=2){
        const [nx, ny] = normals[i];
        const sideSgn = (i % 4 === 1) ? 1 : -1;
        const baseX = sideSgn > 0 ? leftRim[i][0] : rightRim[pts.length - 1 - i][0];
        const baseY = sideSgn > 0 ? leftRim[i][1] : rightRim[pts.length - 1 - i][1];
        const outAng = Math.atan2(ny * sideSgn, nx * sideSgn) + (rn() - 0.5) * 0.5;
        drawFineRockFractures(g, baseX, baseY, outAng, C * (0.28 + 0.26 * rn()) * (0.8 + lv * 0.1), 2, rn, st);
      }
    });

    // 2. 응징 스킬별 고정밀 3D 크레이터 & 파쇄흔 (다층 단면 + 방사형 파열망)
    const activeHits=dsk.length?dsk:[
      {sk:'nuke',lv:1,fx:0.28,fy:0.26,rot:0.1},
      ...(lv>=2?[{sk:'meteor',lv:2,fx:0.72,fy:0.34,rot:-0.2}]:[]),
      ...(lv>=3?[{sk:'kame2',lv:3,fx:0.48,fy:0.52,rot:0.15}]:[]),
      ...(lv>=4?[{sk:'fist',lv:4,fx:0.35,fy:0.62,rot:-0.12}]:[])
    ];

    activeHits.forEach((hit,hIdx)=>{
      const cx=xMin+bw*hit.fx,cy=yEdge+dir*bh*hit.fy;
      const sk=hit.sk;
      g.save();

      // 공통: 크레이터 주변 방사형 지면 실금
      const rayCnt = sk==='gun' ? 5 : 8;
      for(let r=0; r<rayCnt; r++){
        const a = (r / rayCnt) * Math.PI * 2 + (rn() - 0.5) * 0.4;
        const rStart = C * (sk==='gun' ? 0.14 : 0.36);
        drawFineRockFractures(g, cx + Math.cos(a)*rStart, cy + Math.sin(a)*rStart, a, C*(0.32 + 0.28*rn()), 2, rn, st);
      }

      if(sk==='kame'||sk==='kame2'){
        // 에네르기파 1·2: 초고열 플라즈마에 녹아내린 3D 유리화 협곡(Vitrified Plasma Trench)
        g.translate(cx,cy);g.rotate(hit.rot||-0.25);
        const len=C*(2.1+lv*0.24),th=C*(0.32+lv*0.04);
        // 외곽 그을림 후광
        const sg=g.createRadialGradient(0,0,th*0.2,0,0,len*0.55);
        sg.addColorStop(0,'rgba(4,12,24,0.85)');
        sg.addColorStop(0.6,'rgba(8,22,38,0.45)');
        sg.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=sg;
        g.beginPath();g.ellipse(0,0,len*0.58,th*1.35,0,0,7);g.fill();

        // 다각형 파쇄 트렌치 외벽 및 내벽
        const tPts=16,outerT=[],innerT=[];
        for(let i=0;i<tPts;i++){
          const a=(i/tPts)*Math.PI*2;
          const j=0.82+0.32*rn();
          outerT.push([Math.cos(a)*len*0.48*j, Math.sin(a)*th*0.65*j]);
          innerT.push([Math.cos(a)*len*0.36*j, Math.sin(a)*th*0.38*j + dir*C*0.03]);
        }
        g.fillStyle=st.slabEdge||'#4a3219';
        g.beginPath();outerT.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
        g.strokeStyle='rgba(190,245,255,0.65)';g.lineWidth=1.3;g.stroke();

        g.fillStyle='#051020';
        g.beginPath();innerT.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

        // 바닥에 잔류하는 푸른 플라즈마 결정 줄기
        g.strokeStyle='#00e5ff';g.lineWidth=1.8;g.globalAlpha=0.75;
        g.beginPath();g.moveTo(-len*0.32,0);g.lineTo(len*0.32,0);g.stroke();
      }else if(sk==='gun'){
        // 권총 사격: 정교한 3D 베벨 철갑탄 관통공 군집
        for(let b=0;b<4;b++){
          const bx=cx+Math.cos(b*1.6+hIdx)*C*0.44*(b===0?0:1);
          const by=cy+Math.sin(b*1.9+hIdx)*C*0.34*(b===0?0:1);
          const br=C*(b===0?0.17:0.12);
          // 탄흔 주변 그을음
          const bg=g.createRadialGradient(bx,by,br*0.2,bx,by,br*2.1);
          bg.addColorStop(0,'rgba(15,8,2,0.85)');
          bg.addColorStop(0.55,'rgba(40,22,8,0.38)');
          bg.addColorStop(1,'rgba(0,0,0,0)');
          g.fillStyle=bg;g.beginPath();g.arc(bx,by,br*2.1,0,7);g.fill();

          // 쪼개진 탄흔 외곽 암석 링
          g.fillStyle=st.slabEdge||'#7a4f2a';
          g.strokeStyle=st.bevel||'rgba(255,225,160,0.75)';
          g.lineWidth=1.1;
          g.beginPath();
          for(let k=0;k<10;k++){
            const a=(k/10)*Math.PI*2, rr=br*(0.9+0.35*rn());
            k===0?g.moveTo(bx+Math.cos(a)*rr,by+Math.sin(a)*rr):g.lineTo(bx+Math.cos(a)*rr,by+Math.sin(a)*rr);
          }
          g.closePath();g.fill();g.stroke();

          // 깊은 관통 구멍 심연
          g.fillStyle='#060301';
          g.beginPath();g.arc(bx,by+dir*C*0.02,br*0.65,0,7);g.fill();
        }
      }else{
        // 핵폭탄 / 메테오 / 주먹 / 해머 / 외계인: 고정밀 4단 입체 함몰 크레이터(3D Stepped Impact Crater)
        const rx=C*(0.58+lv*0.065),ry=C*(0.44+lv*0.05);
        // 1) 폭격 그을음 후광
        const scorchG=g.createRadialGradient(cx,cy,rx*0.2,cx,cy,rx*1.55);
        scorchG.addColorStop(0,'rgba(12,6,2,0.82)');
        scorchG.addColorStop(0.55,'rgba(28,14,5,0.42)');
        scorchG.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=scorchG;
        g.beginPath();g.ellipse(cx,cy,rx*1.55,ry*1.55,0,0,7);g.fill();

        const pts=20,outer=[],mid1=[],mid2=[],deep=[];
        for(let i=0;i<pts;i++){
          const a=(i/pts)*Math.PI*2;
          const j1=0.78+rn()*0.34, j2=0.58+rn()*0.28, j3=0.38+rn()*0.22, j4=0.20+rn()*0.16;
          outer.push([cx+Math.cos(a)*rx*j1, cy+Math.sin(a)*ry*j1]);
          mid1.push([cx+Math.cos(a)*rx*j2, cy+Math.sin(a)*ry*j2+dir*C*0.028]);
          mid2.push([cx+Math.cos(a)*rx*j3, cy+Math.sin(a)*ry*j3+dir*C*0.055]);
          deep.push([cx+Math.cos(a)*rx*j4, cy+Math.sin(a)*ry*j4+dir*C*0.082]);
        }

        // 외곽 함몰 단턱 (상판 절단면)
        g.fillStyle=st.slabEdge||'#8a5a2b';
        g.beginPath();outer.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
        g.strokeStyle=st.bevel||'rgba(255,228,170,0.68)';g.lineWidth=1.3;g.stroke();

        // 중단 파쇄 암석층
        g.fillStyle='#42240c';
        g.beginPath();mid1.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

        // 경사면 층리 해칭선 (입체감 부여)
        g.strokeStyle='rgba(0,0,0,0.55)';g.lineWidth=0.9;
        g.beginPath();
        for(let i=0;i<pts;i++){
          g.moveTo(outer[i][0],outer[i][1]);g.lineTo(mid2[i][0],mid2[i][1]);
        }
        g.stroke();

        // 심부 암반층
        g.fillStyle='#1c0d04';
        g.beginPath();mid2.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

        // 최심부 코어 (스킬 속성별 잔류 열기/에너지)
        const cCol = sk==='alien'?'#00e676':sk==='hammer'?'#80d8ff':sk==='fist'?'#ff5252':'#ff6d00';
        const lg=g.createRadialGradient(cx,cy+dir*C*.07,1,cx,cy+dir*C*.07,rx*0.36);
        lg.addColorStop(0,cCol);
        lg.addColorStop(0.55,'#2b0902');
        lg.addColorStop(1,'#080301');
        g.fillStyle=lg;
        g.beginPath();deep.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      }
      g.restore();
    });

    // 3. 장기판 외곽 모서리가 충격으로 쪼개져 나간 입체 절벽 파손 (Lv2~4)
    if(lv>=2){
      const notches=[
        {x:xMin-C*.04,y:yEdge-dir*C*.04,rx:C*(0.42+lv*0.16),ry:C*(0.32+lv*0.12)},
        {x:xMin+bw*0.76,y:yEdge-dir*C*.04,rx:C*(0.48+lv*0.18),ry:C*(0.32+lv*0.14)},
        ...(lv>=3?[
          {x:xMax+C*.04,y:yEdge+dir*bh*0.28,rx:C*(0.38+lv*0.14),ry:C*(0.48+lv*0.16)}
        ]:[]),
        ...(lv>=4?[
          {x:xMin-C*.04,y:yEdge+dir*bh*0.42,rx:C*0.75,ry:C*0.68}
        ]:[])
      ];
      notches.forEach(n=>{
        const pts=14,poly=[];
        for(let i=0;i<pts;i++){
          const a=(i/pts)*Math.PI*2,rad=0.58+rn()*0.48;
          poly.push([n.x+Math.cos(a)*n.rx*rad,n.y+Math.sin(a)*n.ry*rad]);
        }
        g.fillStyle=st.slabEdge||'#7a491d';
        g.beginPath();poly.forEach(([px,py],i)=>{const wy=py+dir*C*.09;if(i===0)g.moveTo(px,wy);else g.lineTo(px,wy)});g.closePath();g.fill();
        g.strokeStyle=st.bevel||'#f7d89c';g.lineWidth=1.2;g.stroke();
        g.fillStyle='#2e1605';
        g.beginPath();poly.forEach(([px,py],i)=>{const wy=py+dir*C*.045;if(i===0)g.moveTo(px,wy);else g.lineTo(px,wy)});g.closePath();g.fill();
        g.fillStyle='#070912';
        g.beginPath();poly.forEach(([px,py],i)=>{if(i===0)g.moveTo(px,py);else g.lineTo(px,py)});g.closePath();g.fill();
      });
    }
    g.restore();
  }else{
    // 기물 교차점을 100% 피해서 단층 주변에만 자연스럽게 흩어지는 3D 입체 암석/목재 파편
    g.save();
    const chipCnt=lv===1?8:lv===2?14:lv===3?22:30;
    for(let i=0;i<chipCnt;i++){
      const cx=xMin+bw*(0.05+rn()*0.90),cy=yEdge+dir*bh*(0.04+rn()*0.82);
      const gx=(cx-OX)/CX,gy=(cy-OY)/CY;
      // 기물이 놓이는 교차점 반경 0.34칸 이내에는 파편을 절대 그리지 않아 게임 방해 0% 보장
      if(Math.hypot(gx-Math.round(gx),gy-Math.round(gy))<0.34)continue;
      const ang=rn()*Math.PI*2,len=C*(0.065+rn()*0.12)*(0.8+lv*0.08),th=len*(0.38+rn()*0.32);
      g.save();g.translate(cx,cy);g.rotate(ang);
      // 파편 그림자
      g.fillStyle='rgba(5,2,1,0.58)';
      g.beginPath();
      g.moveTo(-len/2+1.8,-th*.3+2.2);g.lineTo(len*.45+1.8,-th/2+2.2);g.lineTo(len/2+1.8,th*.25+2.2);g.lineTo(-len*.35+1.8,th/2+2.2);
      g.closePath();g.fill();
      // 파편 상단 입체면
      g.fillStyle=rn()<.5?(st.slabEdge||'#b88344'):'#6e4720';
      g.strokeStyle='#1f0d02';g.lineWidth=0.8;
      g.beginPath();
      g.moveTo(-len/2,-th*.3);g.lineTo(len*.45,-th/2);g.lineTo(len/2,th*.25);g.lineTo(-len*.35,th/2);
      g.closePath();g.fill();g.stroke();
      // 파편 모서리 하이라이트
      g.strokeStyle='rgba(255,235,190,0.55)';g.lineWidth=0.7;
      g.beginPath();g.moveTo(-len/2,-th*.3);g.lineTo(len*.45,-th/2);g.stroke();
      g.restore();
    }
    g.restore();
  }
}
window.jgDrawBoardDamage=function(g){
  drawCampDamage(g,'c',window.jgDmg('c'),false);
  drawCampDamage(g,'h',window.jgDmg('h'),false);
};
window.jgDrawBoardDebris=function(g){
  drawCampDamage(g,'c',window.jgDmg('c'),true);
  drawCampDamage(g,'h',window.jgDmg('h'),true);
};

/* ==== 실시간 갈라진 장기판 단층 심연 광맥 호흡 & 분열 쇼크웨이브 ==== */
window.jgDrawBoardLiveCracks=function(g,now){
  const t=now*0.001;
  ['c','h'].forEach(side=>{
    const lv=window.jgDmg(side);
    const spAnim=window.jgSplitAnim&&window.jgSplitAnim[side];
    if(lv<=0&&!spAnim)return;
    const isBottom=flip?(side==='h'):(side==='c');
    const yEdge=isBottom?OY+9*CY:OY;
    const dir=isBottom?-1:1;
    const xMin=OX,bw=8*CX,bh=4.48*CY;
    const dsk=ensureDmgSk()[side];
    const lastSk=(dsk.length?dsk[dsk.length-1].sk:(side==='c'?'nuke':'meteor'));

    if(lv>0){
      const canyons=buildTectonicCanyons(xMin,bw,yEdge,dir,bh,C,lv,side);
      const pulse=0.5+0.5*Math.sin(t*3.2+(side==='c'?0:2.1));
      const glowCol=lastSk==='kame'||lastSk==='kame2'?'#00e5ff':lastSk==='alien'?'#76ff03':lastSk==='hammer'?'#80d8ff':'#ff5722';
      g.save();
      g.globalCompositeOperation='lighter';
      canyons.forEach((pts,ci)=>{
        g.strokeStyle=glowCol;
        g.globalAlpha=(0.12+0.12*pulse)*(ci===0?1:0.65);
        g.lineWidth=Math.max(1.5,C*(0.038+0.012*pulse));
        g.setLineDash([C*0.18, C*0.14]);
        g.beginPath();
        pts.forEach((p,i)=>i?g.lineTo(p.x,p.y+dir*C*0.06):g.moveTo(p.x,p.y+dir*C*0.06));
        g.stroke();
      });
      g.restore();
    }

    if(spAnim){
      const dt=(now-spAnim.t0)*0.001;
      if(dt>2.4){window.jgSplitAnim[side]=null;return}
      const u=dt/2.4,fade=1-u;
      const canyons=buildTectonicCanyons(xMin,bw,yEdge,dir,bh,C,spAnim.lv||1,side);
      g.save();
      g.globalCompositeOperation='lighter';
      if(canyons[0]){
        g.strokeStyle=spAnim.cols[0];
        g.shadowColor=spAnim.cols[1];g.shadowBlur=14;
        g.globalAlpha=Math.min(0.85,fade*1.1);
        g.lineWidth=C*(0.16*(1-u*0.7));
        g.beginPath();
        canyons[0].forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));
        g.stroke();
      }
      spAnim.rocks.forEach(rk=>{
        const rx=xMin+bw*rk.fx+rk.vx*C*2.1*dt;
        const ry=yEdge+dir*bh*rk.fy+(rk.vy*dt+0.92*dt*dt)*C*2.1;
        const sz=C*rk.sz*(1-u*0.45);
        g.save();
        g.globalCompositeOperation='source-over';
        g.globalAlpha=Math.max(0,fade*0.88);
        g.translate(rx,ry);g.rotate(rk.rot+rk.vr*dt);
        g.fillStyle=rk.col;g.strokeStyle='#1a0902';g.lineWidth=1.0;
        g.beginPath();
        g.moveTo(-sz,-sz*0.5);g.lineTo(sz*0.8,-sz*0.7);g.lineTo(sz,sz*0.6);g.lineTo(-sz*0.7,sz*0.8);
        g.closePath();g.fill();g.stroke();
        g.restore();
      });
      g.restore();
    }
  });
};

/* ==== 5종 장기판 테마별 은은한 환경 파티클 (장기판 중앙 그림/파문 제거) ==== */
const THEME_PARTICLES=Array.from({length:32},(_,i)=>({
  u:Math.random(),
  v:Math.random(),
  s:0.4+Math.random()*0.8,
  sp:0.15+Math.random()*0.38,
  ph:Math.random()*Math.PI*2,
  id:i
}));

window.jgDrawBoardThemeFX=function(g,now){
  if(!CX||!CY)return;
  const bIdx=window.curBoardIdx||0;
  const t=now*0.001;
  const gw=8*CX,gh=9*CY;

  g.save();
  g.beginPath();g.rect(OX-CX*0.55,OY-CY*0.55,gw+CX*1.1,gh+CY*1.1);g.clip();

  if(bIdx===0){
    THEME_PARTICLES.forEach(p=>{
      const px0=OX+((p.u+t*p.sp*0.28)%1)*gw;
      const py0=OY+((p.v+Math.sin(t*1.4+p.ph)*0.03+1)%1)*gh;
      const al=0.22+0.20*Math.sin(t*3.0+p.ph);
      g.fillStyle=p.id%3===0?'rgba(255,235,150,'+al+')':'rgba(245,170,65,'+al+')';
      g.beginPath();g.arc(px0,py0,Math.max(1.2,C*0.028*p.s),0,7);g.fill();
    });
  }else if(bIdx===1){
    THEME_PARTICLES.forEach(p=>{
      const px0=OX+((p.u+Math.sin(t*0.8+p.ph)*0.05+1)%1)*gw;
      const py0=OY+((p.v+t*p.sp*0.14)%1)*gh;
      const r=Math.max(1.3,C*0.034*p.s);
      const al=0.28+0.28*Math.sin(t*2.6+p.ph);
      g.fillStyle=`rgba(235,252,255,${al})`;
      g.beginPath();g.arc(px0,py0,r*0.8,0,7);g.fill();
    });
  }else if(bIdx===2){
    g.save();g.globalCompositeOperation='lighter';
    THEME_PARTICLES.forEach(p=>{
      const px0=OX+((p.u+Math.sin(t*0.5+p.ph)*0.07+1)%1)*gw;
      const py0=OY+((p.v-t*p.sp*0.07+10)%1)*gh;
      const pulse=0.5+0.5*Math.sin(t*3.2+p.ph);
      const r=Math.max(2.0,C*0.062*p.s*(0.6+0.4*pulse));
      const rg=g.createRadialGradient(px0,py0,0,px0,py0,r);
      const isGold=p.id%3===0;
      rg.addColorStop(0,isGold?`rgba(255,250,160,${0.62*pulse})`:`rgba(140,255,180,${0.62*pulse})`);
      rg.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=rg;
      g.beginPath();g.arc(px0,py0,r,0,7);g.fill();
    });
    g.restore();
  }else if(bIdx===3){
    g.save();g.globalCompositeOperation='lighter';
    THEME_PARTICLES.forEach(p=>{
      const px0=OX+((p.u+Math.sin(t*1.1+p.ph)*0.04+1)%1)*gw;
      const py0=OY+((p.v-t*p.sp*0.15+10)%1)*gh;
      const al=0.28+0.32*Math.sin(t*3.8+p.ph);
      const r=Math.max(1.3,C*0.038*p.s);
      g.fillStyle=p.id%2===0?`rgba(255,40,95,${al})`:`rgba(200,80,255,${al})`;
      g.beginPath();g.arc(px0,py0,r,0,7);g.fill();
    });
    g.restore();
  }else{
    g.save();g.globalCompositeOperation='lighter';
    THEME_PARTICLES.forEach(p=>{
      const px0=OX+((p.u+Math.sin(t*0.8+p.ph)*0.04+1)%1)*gw;
      const py0=OY+((p.v-t*p.sp*0.12+10)%1)*gh;
      const isTopHalf=py0<OY+4.5*CY;
      const isChoSide=flip?!isTopHalf:isTopHalf;
      const al=0.25+0.28*Math.sin(t*3.2+p.ph);
      g.fillStyle=isChoSide?`rgba(40,235,200,${al})`:`rgba(255,95,45,${al})`;
      g.beginPath();g.arc(px0,py0,Math.max(1.3,C*0.034*p.s),0,7);g.fill();
    });
    g.restore();
  }
  g.restore();
};

/* ==== 1. 게임 시작 시 3D 오빗(Orbit) 카메라 장기판 생성 및 기물 낙하 연출 ==== */
let orbCanvas=null,orbRaf=0;
function orbitIntroSound(){
  try{
    const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());
    if(a.state==='suspended')a.resume();
    const t=a.currentTime;
    // 웅장한 오빗 카메라 회전 스윕 사운드
    const len=Math.floor(a.sampleRate*2.1),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
    for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.sin(i/len*Math.PI);
    const n=a.createBufferSource();n.buffer=buf;
    const bp=a.createBiquadFilter();bp.type='bandpass';bp.Q.value=2.2;
    bp.frequency.setValueAtTime(180,t);bp.frequency.exponentialRampToValueAtTime(1400,t+1.4);bp.frequency.exponentialRampToValueAtTime(320,t+2.05);
    const ng=a.createGain();ng.gain.setValueAtTime(.01,t);ng.gain.linearRampToValueAtTime(.28,t+.9);ng.gain.exponentialRampToValueAtTime(.001,t+2.1);
    n.connect(bp);bp.connect(ng);ng.connect(a.destination);n.start(t);

    // 장기알 연속 착지 타격음 (다다다닥!)
    for(let i=0;i<10;i++){
      const ti=t+.55+i*.095,o=a.createOscillator(),og=a.createGain();
      o.type='triangle';o.frequency.setValueAtTime(220+i*18,ti);o.frequency.exponentialRampToValueAtTime(55,ti+.07);
      og.gain.setValueAtTime(.18,ti);og.gain.exponentialRampToValueAtTime(.001,ti+.08);
      o.connect(og);og.connect(a.destination);o.start(ti);o.stop(ti+.09);
    }
    // 카메라 고정 임팩트 북소리 (t+1.75s)
    const td=t+1.72,bo=a.createOscillator(),bg=a.createGain();
    bo.type='sine';bo.frequency.setValueAtTime(135,td);bo.frequency.exponentialRampToValueAtTime(28,td+.55);
    bg.gain.setValueAtTime(.7,td);bg.gain.exponentialRampToValueAtTime(.001,td+.6);
    bo.connect(bg);bg.connect(a.destination);bo.start(td);bo.stop(td+.62);
  }catch(e){}
}

window.jgStartOrbit=function(){
  if(!cv||!B)return;
  if(orbRaf)cancelAnimationFrame(orbRaf);
  if(orbCanvas){try{orbCanvas.remove()}catch(e){}orbCanvas=null}
  busy=true;
  orbitIntroSound();
  try{navigator.vibrate&&navigator.vibrate([30,60,30,60,120])}catch(e){}

  const c=orbCanvas=document.createElement('canvas');
  c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:26;pointer-events:none';
  document.body.appendChild(c);
  const g=c.getContext('2d');
  cv.style.opacity='0';

  // 기물 목록 수집 (궁 -> 대물 -> 졸/병 순으로 낙하 타이밍 배정)
  const pieces=[];
  const orderWeight={K:0,R:1,C:2,N:3,B:4,G:5,P:6};
  for(let y=0;y<10;y++){
    for(let x=0;x<9;x++){
      const p=B[y][x];
      if(p){
        const gx=flip?8-x:x,gy=flip?9-y:y;
        const w=orderWeight[p.t]??5;
        const tDrop=0.48+w*0.11+(Math.abs(gx-4)*0.025)+(p.s==='c'?0:0.04);
        pieces.push({p,x,y,gx,gy,t0:tDrop,dur:0.42});
      }
    }
  }

  // 오빗 주변 황금 입자
  const orbs=[];
  for(let i=0;i<45;i++){
    orbs.push({ang:Math.random()*6.28,rad:0.35+Math.random()*0.55,z:(Math.random()-.5)*180,sp:1.2+Math.random()*1.8,sz:2+Math.random()*3.5,col:i%2?'#ffd54a':'#40c4ff'});
  }

  const DUR=2.25,LOCK=1.75,tStart=performance.now();
  const finish=()=>{
    if(orbRaf){cancelAnimationFrame(orbRaf);orbRaf=0}
    if(orbCanvas){try{orbCanvas.remove()}catch(e){}orbCanvas=null}
    cv.style.opacity='1';
    if(inGame&&!over){busy=false;setTurn(turn)}
  };

  const step=now=>{
    if(!inGame||over){finish();return}
    const t=Math.max(0,(now-tStart)/1000);
    const W0=innerWidth,H0=innerHeight,d=Math.min(devicePixelRatio||1,2.2);
    if(c.width!==Math.round(W0*d)||c.height!==Math.round(H0*d)){c.width=Math.round(W0*d);c.height=Math.round(H0*d)}
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W0,H0);

    let rc={left:0,top:0,width:W0,height:H0};
    try{const r=cv.getBoundingClientRect();if(r&&r.width>0)rc=r}catch(e){}
    const bx=rc.left+OX+4*CX,by=rc.top+OY+4.5*CY,S=Math.min(W0,H0);

    // 오빗 카메라 파라미터: u=0 -> 1 동안 3D 회전(yaw) + 기울기(pitch) + 줌(zoom)이 완벽한 2D 정면 뷰로 수렴
    const u=Math.min(1,t/LOCK);
    // 부드러운 3차 이징 (easeInOutCubic / easeOutBack)
    const ease=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
    const easeOut=1-Math.pow(1-u,3.2);
    const yaw=(1-easeOut)*(-1.32*Math.PI); // 약 -238도 회전하며 정위치 안착
    const pitch=(1-ease)*1.12;             // 64도 입체 틸트에서 0도 정면으로 수렴
    const zoom=u<0.75?(0.52+0.56*(u/0.75)):(1.08-0.08*((u-0.75)/0.25));
    const fov=Math.max(W0,H0)*1.35;

    const cyaw=Math.cos(yaw),syaw=Math.sin(yaw),cpit=Math.cos(pitch),spit=Math.sin(pitch);
    const proj=(lx,ly,lz)=>{
      const rx=lx*cyaw-ly*syaw,ry=lx*syaw+ly*cyaw,rz=lz;
      const px3=rx,py3=ry*cpit-rz*spit,pz3=ry*spit+rz*cpit;
      const k=(fov/(fov+pz3))*zoom;
      return [bx+px3*k,by+py3*k,k,pz3];
    };

    // 배경 암전 (착지 후 자연스럽게 투명해지며 실제 보드 노출)
    const bgAl=t<LOCK?0.88:0.88*(1-sm(LOCK,DUR,t));
    if(bgAl>0.01){
      const bgGr=g.createRadialGradient(bx,by,S*.08,bx,by,Math.max(W0,H0)*.75);
      bgGr.addColorStop(0,`rgba(28,20,12,${bgAl*0.85})`);
      bgGr.addColorStop(1,`rgba(6,8,16,${bgAl})`);
      g.fillStyle=bgGr;g.fillRect(0,0,W0,H0);
    }
    if(t>=LOCK){cv.style.opacity=String(sm(LOCK,LOCK+0.25,t))}

    // 오빗 궤도 링 & 입자
    if(t<DUR){
      const ringAl=sm(0,.25,t)*(1-sm(LOCK-.2,LOCK+.2,t));
      if(ringAl>0.01){
        g.save();g.globalCompositeOperation='lighter';
        [4.8*CX,5.6*CX].forEach((rad,ri)=>{
          g.beginPath();
          for(let i=0;i<=64;i++){
            const a=(i/64)*Math.PI*2+t*(ri?1.5:-2.0);
            const[sx,sy]=proj(Math.cos(a)*rad,Math.sin(a)*rad,0);
            i===0?g.moveTo(sx,sy):g.lineTo(sx,sy);
          }
          g.strokeStyle=ri?`rgba(64,196,255,${ringAl*.45})`:`rgba(255,213,74,${ringAl*.6})`;
          g.lineWidth=2.2;g.stroke();
        });
        orbs.forEach(o=>{
          const a=o.ang+t*o.sp,r=o.rad*Math.max(8*CX,9*CY)*0.65;
          const[sx,sy,k]=proj(Math.cos(a)*r,Math.sin(a)*r,o.z*(1-easeOut));
          g.globalAlpha=ringAl*0.8;g.fillStyle=o.col;
          g.beginPath();g.arc(sx,sy,Math.max(1,o.sz*k),0,7);g.fill();
        });
        g.restore();
      }
    }

    // 3D 장기판 나무 슬랩 렌더링 (두께감 있는 3D 육면체 + 상판)
    const boardFade=t<LOCK?sm(0,.25,t):(1-sm(LOCK+.05,DUR,t));
    if(boardFade>0.01){
      g.save();g.globalAlpha=boardFade;
      const hw=4*CX+CX*.45,hh=4.5*CY+CY*.42,th=Math.max(18,C*.42)*(1-ease*0.7);
      const topCorners=[[-hw,-hh,0],[hw,-hh,0],[hw,hh,0],[-hw,hh,0]].map(p=>proj(p[0],p[1],p[2]));
      const botCorners=[[-hw,-hh,-th],[hw,-hh,-th],[hw,hh,-th],[-hw,hh,-th]].map(p=>proj(p[0],p[1],p[2]));

      // 장기판 하단 그림자
      const shCorners=[[-hw*1.04,-hh*1.04,-th*1.6],[hw*1.04,-hh*1.04,-th*1.6],[hw*1.04,hh*1.04,-th*1.6],[-hw*1.04,hh*1.04,-th*1.6]].map(p=>proj(p[0],p[1],p[2]));
      g.fillStyle='rgba(0,0,0,0.55)';
      g.beginPath();shCorners.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();

      // 4개 옆면(두께) 깊이 정렬 후 그리기
      const faces=[0,1,2,3].map(i=>{
        const j=(i+1)%4;
        const zAvg=(topCorners[i][3]+topCorners[j][3]+botCorners[i][3]+botCorners[j][3])/4;
        return {i,j,zAvg};
      }).sort((a,b)=>b.zAvg-a.zAvg);

      faces.forEach((f,fi)=>{
        const {i,j}=f;
        g.fillStyle=i%2===0?'#7a491d':'#5c3411';
        g.strokeStyle='#3b1f08';g.lineWidth=1.2;
        g.beginPath();
        g.moveTo(topCorners[i][0],topCorners[i][1]);
        g.lineTo(topCorners[j][0],topCorners[j][1]);
        g.lineTo(botCorners[j][0],botCorners[j][1]);
        g.lineTo(botCorners[i][0],botCorners[i][1]);
        g.closePath();g.fill();g.stroke();
      });

      // 장기판 상판 (금빛 목재 그라데이션)
      const gr=g.createLinearGradient(topCorners[0][0],topCorners[0][1],topCorners[2][0],topCorners[2][1]);
      gr.addColorStop(0,'#f2cf88');gr.addColorStop(0.5,'#e2b468');gr.addColorStop(1,'#c78d3e');
      g.fillStyle=gr;
      g.beginPath();topCorners.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
      g.strokeStyle='#ffd54a';g.lineWidth=2.2*(1-ease*.5);g.stroke();

      // 격자선이 오빗 회전 중 레이저처럼 그려지는 연출
      const lineProg=sm(0.1,1.05,t);
      if(lineProg>0){
        g.strokeStyle='#2b1405';g.lineWidth=Math.max(1.4,C*.048*zoom);g.lineCap='round';
        g.beginPath();
        // 가로선 10개
        for(let r=0;r<10;r++){
          const p=Math.min(1,Math.max(0,(lineProg*1.3-r*0.03)));
          if(p<=0)continue;
          const ly=(r-4.5)*CY,lx0=-4*CX,lx1=-4*CX+8*CX*p;
          const[x0,y0]=proj(lx0,ly,0),[x1,y1]=proj(lx1,ly,0);
          g.moveTo(x0,y0);g.lineTo(x1,y1);
        }
        // 세로선 9개
        for(let col=0;col<9;col++){
          const p=Math.min(1,Math.max(0,(lineProg*1.3-col*0.03)));
          if(p<=0)continue;
          const lx=(col-4)*CX,ly0=-4.5*CY,ly1=-4.5*CY+9*CY*p;
          const[x0,y0]=proj(lx,ly0,0),[x1,y1]=proj(lx,ly1,0);
          g.moveTo(x0,y0);g.lineTo(x1,y1);
        }
        // 궁성 대각선
        if(lineProg>0.5){
          for(const py0 of[0,7]){
            const[a0,b0]=proj(-1*CX,(py0-4.5)*CY,0),[a1,b1]=proj(1*CX,(py0+2-4.5)*CY,0);
            const[a2,b2]=proj(1*CX,(py0-4.5)*CY,0),[a3,b3]=proj(-1*CX,(py0+2-4.5)*CY,0);
            g.moveTo(a0,b0);g.lineTo(a1,b1);g.moveTo(a2,b2);g.lineTo(a3,b3);
          }
        }
        g.stroke();
      }

      // 32개 장기알 3D 공중 낙하 및 착지 충격파
      const activePieces=[];
      pieces.forEach(item=>{
        const dt=t-item.t0;if(dt<0)return;
        const pu=Math.min(1,dt/item.dur);
        const dropEase=1-Math.pow(1-pu,3);
        const lz=(1-dropEase)*S*0.55;
        const lx=(item.gx-4)*CX,ly=(item.gy-4.5)*CY;
        const[sx,sy,k,pz3]=proj(lx,ly,lz);
        const[shx,shy,shk]=proj(lx,ly,0);
        activePieces.push({item,pu,dt,sx,sy,k,pz3,shx,shy,shk});
      });
      // 카메라 먼 쪽부터 깊이 정렬
      activePieces.sort((a,b)=>b.pz3-a.pz3);
      activePieces.forEach(({item,pu,dt,sx,sy,k,shx,shy,shk})=>{
        const {p}=item;
        // 보드 위 그림자
        g.fillStyle=`rgba(0,0,0,${0.35*pu})`;
        g.beginPath();g.ellipse(shx,shy+2,C*.28*shk*(0.5+0.5*pu),C*.22*shk*(0.5+0.5*pu),0,0,7);g.fill();
        // 착지 순간 황금/청록 파동 링
        if(pu>=1&&dt<item.dur+0.28){
          const ru=(dt-item.dur)/0.28;
          g.strokeStyle=p.s==='c'?`rgba(64,255,190,${1-ru})`:`rgba(255,100,64,${1-ru})`;
          g.lineWidth=2.2*(1-ru);
          g.beginPath();g.arc(shx,shy,C*(0.35+0.45*ru)*shk,0,7);g.stroke();
        }
        // 기물 토큰 스프라이트 렌더링
        const arr=SP[p.s]&&SP[p.s][p.t]&&SP[p.s][p.t].token;
        const f=arr&&arr[0];
        if(f&&f.im&&f.im.complete){
          const sz=C*(p.t==='P'||p.t==='G'?.64:p.t==='K'?.88:.76)/Math.max(f.w,f.h)*k*(pu<1?1.18-0.18*pu:1+0.12*Math.exp(-(dt-item.dur)*18));
          const pw=f.w*sz,ph=f.h*sz;
          g.save();g.globalAlpha=Math.min(1,pu*2)*boardFade;
          g.drawImage(f.im,sx-pw/2,sy-ph/2,pw,ph);
          g.restore();
        }
      });
      g.restore();
    }

    // 카메라 락인 순간 골드 플래시 & "⚔️ 대국 개시!" 타이틀 연출
    if(t>=LOCK-0.08){
      const dt=t-LOCK;
      if(dt>=0&&dt<0.32){
        const fl=1-dt/0.32;
        g.fillStyle=`rgba(255,245,200,${0.48*fl*fl})`;
        g.fillRect(0,0,W0,H0);
      }
      const bannerAl=sm(LOCK-0.08,LOCK+0.06,t)*(1-sm(DUR-0.28,DUR,t));
      if(bannerAl>0.01){
        const pop=1+0.32*Math.exp(-Math.max(0,dt)*9);
        g.save();g.globalAlpha=bannerAl;
        g.translate(bx,by);g.scale(pop,pop);
        g.fillStyle='rgba(10,12,20,0.82)';
        g.strokeStyle='#ffd54a';g.lineWidth=2.5;
        const bw2=Math.min(W0*.82,340),bh2=S*.15;
        g.beginPath();g.roundRect(-bw2/2,-bh2/2,bw2,bh2,14);g.fill();g.stroke();
        g.font=`900 ${Math.round(S*.075)}px 'Malgun Gothic',sans-serif`;
        g.textAlign='center';g.textBaseline='middle';
        g.lineWidth=S*.012;g.strokeStyle='#2b1100';g.fillStyle='#ffd54a';
        g.strokeText('⚔️ 대국 개시!!',0,0);g.fillText('⚔️ 대국 개시!!',0,0);
        g.restore();
      }
    }

    if(t<DUR)orbRaf=requestAnimationFrame(step);
    else finish();
  };
  orbRaf=requestAnimationFrame(step);
};

/* ==== 2. 승패 결정 시 스매시 컷(Smash Cut) 전환 및 승리자(Winner) 하이라이트 연출 ==== */
let smashRaf=0,ovRaf=0,smashCanvas=null;
function smashCutSound(isWin,isDraw){
  try{
    const a=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());
    if(a.state==='suspended')a.resume();
    const t=a.currentTime;
    // 1) 스매시 컷 묵직한 하드 컷 슬래시 & 서브베이스 드롭 (0.0s)
    const sub=a.createOscillator(),sg=a.createGain();
    sub.type='sine';sub.frequency.setValueAtTime(160,t);sub.frequency.exponentialRampToValueAtTime(24,t+.45);
    sg.gain.setValueAtTime(.95,t);sg.gain.exponentialRampToValueAtTime(.001,t+.48);
    sub.connect(sg);sg.connect(a.destination);sub.start(t);sub.stop(t+.5);

    const len=Math.floor(a.sampleRate*.28),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);
    for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2);
    const n=a.createBufferSource();n.buffer=buf;
    const hp=a.createBiquadFilter();hp.type='highpass';hp.frequency.value=1200;
    const ng=a.createGain();ng.gain.setValueAtTime(.85,t);ng.gain.exponentialRampToValueAtTime(.001,t+.26);
    n.connect(hp);hp.connect(ng);ng.connect(a.destination);n.start(t);

    // 2) 승리 도장 쾅! 타격음 & 팡파르 화음 (t+0.32s)
    const ts=t+.32,st=a.createOscillator(),stg=a.createGain();
    st.type='triangle';st.frequency.setValueAtTime(190,ts);st.frequency.exponentialRampToValueAtTime(32,ts+.35);
    stg.gain.setValueAtTime(.85,ts);stg.gain.exponentialRampToValueAtTime(.001,ts+.38);
    st.connect(stg);stg.connect(a.destination);st.start(ts);st.stop(ts+.4);

    const chords=isDraw?[392,494,587]:isWin?[523.25,659.25,783.99,1046.5]:[392,466.16,587.33,783.99];
    chords.forEach((f,i)=>{
      const ti=t+.18+i*.06,o=a.createOscillator(),og=a.createGain();
      o.type='triangle';o.frequency.setValueAtTime(f,ti);
      og.gain.setValueAtTime(.22,ti);og.gain.exponentialRampToValueAtTime(.001,ti+1.1);
      o.connect(og);og.connect(a.destination);o.start(ti);o.stop(ti+1.15);
    });
  }catch(e){}
}

window.jgSmashEnd=function(w,msg){
  if(orbRaf){cancelAnimationFrame(orbRaf);orbRaf=0}
  if(orbCanvas){try{orbCanvas.remove()}catch(e){}orbCanvas=null}
  if(smashRaf){cancelAnimationFrame(smashRaf);smashRaf=0}
  if(ovRaf){cancelAnimationFrame(ovRaf);ovRaf=0}
  if(smashCanvas){try{smashCanvas.remove()}catch(e){}smashCanvas=null}
  cv.style.opacity='1';

  const gEl=el('g')||document.body,ovEl=el('ov'),ovCard=el('ovcard'),ovWin=el('ovwin'),ovBadge=el('ovbadge');
  const winnerNick=w?(w===me?nick():(cfg.mode==='mp'?(isSpec?(w==='c'?cNick:hNick):oppNick):'COM('+cfg.lv+')')):'';
  const factionTxt=w==='c'?'초(楚)나라':w==='h'?'한(漢)나라':'무승부';
  const isMyWin=w&&w===me;

  if(ovBadge){
    ovBadge.textContent=w?(isSpec?'👑 SMASH CUT · 대국 결착':(isMyWin?'👑 VICTORY · 천하통일':'⚡ SMASH CUT · 대국 종료')):'🤝 SMASH CUT · 무승부';
    ovBadge.style.background=w==='c'?'linear-gradient(90deg,#00e676,#00897b)':w==='h'?'linear-gradient(90deg,#ff5252,#c62828)':'linear-gradient(90deg,#ffd54a,#ff8f00)';
    ovBadge.style.color='#fff';
  }
  if(ovWin){
    ovWin.textContent=w?`🏆 ${factionTxt} [${winnerNick}] 승리!!`:'🤝 호각지세 · 무승부!';
  }

  smashCutSound(isMyWin,!w);
  try{navigator.vibrate&&navigator.vibrate([90,40,180,50,350])}catch(e){}

  // PHASE 1: 스매시 컷 전체화면 임팩트 캔버스 (흑백 반전 프리즈 프레임 + 대각선 섬광 슬래시 + 셔터 슬램)
  if(ovEl)ovEl.style.display='none';
  const sc=smashCanvas=document.createElement('canvas');
  sc.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:42;pointer-events:none';
  document.body.appendChild(sc);
  const sg=sc.getContext('2d');
  const t0=performance.now(),SMASH_DUR=0.62;

  const smashFrame=now=>{
    const t=Math.max(0,(now-t0)/1000);
    const W0=innerWidth,H0=innerHeight,d=Math.min(devicePixelRatio||1,2.2),S=Math.min(W0,H0);
    if(sc.width!==Math.round(W0*d)||sc.height!==Math.round(H0*d)){sc.width=Math.round(W0*d);sc.height=Math.round(H0*d)}
    sg.setTransform(d,0,0,d,0,0);sg.clearRect(0,0,W0,H0);

    if(t<0.15){
      // 1) 만화/액션 영화식 흑백 반전 하드 컷 + 카메라 줌 스냅
      const inv=t<0.075;
      gEl.style.filter=inv?'contrast(2.6) saturate(0) invert(1)':'contrast(2.2) grayscale(1) brightness(1.15)';
      gEl.style.transform=`scale(${1.14-t*0.4}) rotate(${inv?-2.2:1.8}deg)`;
      // 강렬한 방사형 스매시 집중선
      sg.save();
      sg.strokeStyle=inv?'#000':'#fff';
      for(let i=0;i<72;i++){
        const a=(i/72)*Math.PI*2+t*8;
        const r0=S*(0.18+(i%3)*0.05),r1=Math.max(W0,H0)*0.95;
        sg.lineWidth=1.5+(i%4)*1.8;
        sg.beginPath();sg.moveTo(W0/2+Math.cos(a)*r0,H0/2+Math.sin(a)*r0);
        sg.lineTo(W0/2+Math.cos(a)*r1,H0/2+Math.sin(a)*r1);sg.stroke();
      }
      // 대각선 스매시 슬래시 섬광
      sg.strokeStyle='#ffd54a';sg.lineWidth=S*0.045;
      sg.beginPath();sg.moveTo(0,H0*0.82);sg.lineTo(W0,H0*0.18);sg.stroke();
      sg.strokeStyle='#fff';sg.lineWidth=S*0.018;sg.stroke();
      sg.restore();
    }else{
      gEl.style.filter='';
      const shk=Math.max(0,1-(t-0.15)/0.35)*S*0.035;
      gEl.style.transform=shk>0?`translate(${(Math.random()-.5)*shk}px,${(Math.random()-.5)*shk}px)`:'';
      if(ovEl&&ovEl.style.display!=='flex'){
        ovEl.style.display='flex';
        startWinnerCanvas(w,winnerNick,factionTxt);
      }
      // 대각선 스매시 셔터가 양쪽으로 갈라지며 승리자 화면 노출
      const u=Math.min(1,(t-0.15)/(SMASH_DUR-0.15));
      const slide=Math.pow(u,2.2)*Math.max(W0,H0)*1.1;
      sg.save();
      sg.fillStyle=w==='c'?'#041f18':w==='h'?'#260505':'#0b1020';
      sg.strokeStyle='#ffd54a';sg.lineWidth=6;
      // 상단 슬래시 패널
      sg.beginPath();
      sg.moveTo(-slide,H0*0.82-slide);sg.lineTo(W0-slide,H0*0.18-slide);
      sg.lineTo(W0-slide,-H0);sg.lineTo(-slide,-H0);sg.closePath();sg.fill();sg.stroke();
      // 하단 슬래시 패널
      sg.beginPath();
      sg.moveTo(slide,H0*0.82+slide);sg.lineTo(W0+slide,H0*0.18+slide);
      sg.lineTo(W0+slide,H0*2);sg.lineTo(slide,H0*2);sg.closePath();sg.fill();sg.stroke();
      sg.restore();
    }

    if(t<SMASH_DUR)smashRaf=requestAnimationFrame(smashFrame);
    else{
      gEl.style.filter='';gEl.style.transform='';
      if(smashCanvas){try{smashCanvas.remove()}catch(e){}smashCanvas=null}
    }
  };
  smashRaf=requestAnimationFrame(smashFrame);
};

function startWinnerCanvas(w,winnerNick,factionTxt){
  const c=el('ovcv'),ovEl=el('ov'),ovCard=el('ovcard');
  if(!c||!ovEl)return;
  const g=c.getContext('2d');
  const colMain=w==='c'?'#00e676':w==='h'?'#ff5252':'#ffd54a';
  const colSub=w==='c'?'#00bfa5':w==='h'?'#ff8a65':'#90caf9';
  const colRgb=w==='c'?'0,230,118':w==='h'?'255,82,82':'255,213,74';

  const confetti=[];
  for(let i=0;i<75;i++){
    confetti.push({
      x:Math.random(),y:Math.random()*1.2-0.2,
      vx:(Math.random()-.5)*0.12,vy:0.18+Math.random()*0.32,
      w:6+Math.random()*8,h:3+Math.random()*5,
      rot:Math.random()*6.28,vr:(Math.random()-.5)*8,
      c:['#ffd54a',colMain,'#ffffff',colSub][i%4]
    });
  }

  const t0=performance.now();let last=t0;
  const drawOv=now=>{
    if(!ovEl||ovEl.style.display==='none'){ovRaf=0;return}
    const t=Math.max(0,(now-t0)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    const W0=ovEl.clientWidth||innerWidth,H0=ovEl.clientHeight||innerHeight,d=Math.min(devicePixelRatio||1,2),S=Math.min(W0,H0);
    if(c.width!==Math.round(W0*d)||c.height!==Math.round(H0*d)){c.width=Math.round(W0*d);c.height=Math.round(H0*d)}
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W0,H0);

    // 카드 상단 여유 공간 중심 계산
    const cardH=(ovCard&&ovCard.offsetHeight)||190;
    const cx=W0/2,cy=Math.max(S*0.28,(H0-cardH)*0.46);

    // 1) 스매시 컷 배경 방사형 집중선 & 진영 컬러 오라
    const gr=g.createRadialGradient(cx,cy,S*0.04,cx,cy,Math.max(W0,H0)*0.7);
    gr.addColorStop(0,`rgba(${colRgb},0.42)`);
    gr.addColorStop(0.45,`rgba(${colRgb},0.12)`);
    gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(0,0,W0,H0);

    g.save();g.translate(cx,cy);g.rotate(t*0.35);
    for(let i=0;i<36;i++){
      const a=(i/36)*Math.PI*2;
      g.fillStyle=i%2?`rgba(${colRgb},0.09)`:'rgba(255,213,74,0.05)';
      g.beginPath();g.moveTo(0,0);
      g.arc(0,0,Math.max(W0,H0),a,a+Math.PI/36);g.closePath();g.fill();
    }
    g.restore();

    // 2) 승리 진영 대장군(궁/차/포) 캐릭터 일러스트 스매시 슬램 등장
    const side=w||'c';
    const uHero=Math.min(1,t/0.26);
    const heroScale=uHero<1?(2.1-1.1*e3(uHero)):(1+0.03*Math.sin(t*3.5));

    const drawHero=(pType,ox,oy,scMul,al)=>{
      const arr=SP[side]&&SP[side][pType]&&(SP[side][pType].atk||SP[side][pType].token);
      const f=arr&&arr[0];
      if(!f||!f.im||!f.im.complete)return;
      const k=Math.min(W0*0.62/f.w,S*0.52/f.h)*scMul*heroScale;
      g.save();g.globalAlpha=al*Math.min(1,t*6);
      g.shadowColor=colMain;g.shadowBlur=22;
      g.drawImage(f.im,cx+ox-f.w*k/2,cy+oy-f.h*k/2,f.w*k,f.h*k);
      g.restore();
    };

    if(w){
      // 좌우 호위 대장(차/포) + 중앙 국왕(궁) 승리 포메이션
      drawHero('R',-S*0.26,S*0.03,0.72,0.78);
      drawHero('C',S*0.26,S*0.03,0.72,0.78);
      drawHero('K',0,-S*0.02,1.08,1.0);
    }else{
      // 무승부일 경우 초·한 국왕 대치 연출
      const fC=SP.c&&SP.c.K&&SP.c.K.atk&&SP.c.K.atk[0];
      const fH=SP.h&&SP.h.K&&SP.h.K.atk&&SP.h.K.atk[0];
      if(fC&&fC.im.complete){
        const k=Math.min(W0*0.45/fC.w,S*0.42/fC.h)*heroScale;
        g.drawImage(fC.im,cx-S*0.2-fC.w*k/2,cy-fC.h*k/2,fC.w*k,fC.h*k);
      }
      if(fH&&fH.im.complete){
        const k=Math.min(W0*0.45/fH.w,S*0.42/fH.h)*heroScale;
        g.drawImage(fH.im,cx+S*0.2-fH.w*k/2,cy-fH.h*k/2,fH.w*k,fH.h*k);
      }
    }

    // 3) 스매시 컷 대형 낙관(도장) "천하통일 / 勝" 쾅 찍히는 연출 (t >= 0.24s)
    if(t>=0.24){
      const dtStamp=t-0.24,su=Math.min(1,dtStamp/0.16);
      const stScale=su<1?(2.8-1.8*Math.pow(su,0.5)):(1+0.12*Math.exp(-(dtStamp-0.16)*14));
      const sx=cx+S*0.26,sy=cy-S*0.16,sr=S*0.115;
      g.save();
      g.translate(sx,sy);g.rotate(-0.22);g.scale(stScale,stScale);
      g.fillStyle='rgba(185,18,18,0.92)';
      g.strokeStyle='#ffd54a';g.lineWidth=3.5;
      g.shadowColor='#000';g.shadowBlur=14;
      g.beginPath();g.roundRect(-sr,-sr,sr*2,sr*2,10);g.fill();g.stroke();
      g.strokeStyle='rgba(255,235,180,0.7)';g.lineWidth=1.5;
      g.strokeRect(-sr*0.84,-sr*0.84,sr*1.68,sr*1.68);
      g.fillStyle='#fff6d0';g.textAlign='center';g.textBaseline='middle';
      g.font=`900 ${Math.round(sr*1.05)}px serif`;
      g.fillText(w?(w==='c'?'楚勝':'漢勝'):'和局',0,-sr*0.12);
      g.font=`900 ${Math.round(sr*0.36)}px sans-serif`;
      g.fillText(w?'천하통일':'무승부',0,sr*0.58);
      g.restore();
    }

    // 4) 상단 스매시 컷 레터박스 슬래시 바 & 금빛 꽃가루(Confetti)
    confetti.forEach(p=>{
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
      if(p.y>1.1){p.y=-0.1;p.x=Math.random()}
      g.save();g.translate(p.x*W0,p.y*H0);g.rotate(p.rot);
      g.fillStyle=p.c;g.globalAlpha=0.85;
      g.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      g.restore();
    });

    ovRaf=requestAnimationFrame(drawOv);
  };
  ovRaf=requestAnimationFrame(drawOv);
}


/* ==== 3. 리플레이 (다시보기) 저장 · 목록 메뉴 · 보드 재생 시스템 ==== */
const RPK='jg_replays';
let curReplay=null,isReplay=false,rpData=null,rpIdx=0,rpPlaying=false,rpTimer=0,rpSpd=1;

function loadReplays(){
  try{
    const a=JSON.parse(localStorage.getItem(RPK)||'[]');
    return Array.isArray(a)?a:[];
  }catch(e){return[]}
}
function saveReplays(list){
  try{localStorage.setItem(RPK,JSON.stringify(list.slice(0,25)))}catch(e){}
}
function recordReplaySave(){
  if(!curReplay||!curReplay.moves||!curReplay.moves.length||isReplay)return;
  const list=loadReplays();
  const idx=list.findIndex(x=>x&&x.id===curReplay.id);
  const copy=JSON.parse(JSON.stringify(curReplay));
  if(idx>=0)list[idx]=copy;
  else list.unshift(copy);
  saveReplays(list);
}

// begin 후킹: 새 대국 시작 시 초기 배치 및 메타데이터 기록
const _beginOrig=begin;
begin=function(m,sc,sh,mode){
  if(!isReplay&&window.pickRandomBoard){
    const bIdx=window.pickRandomBoard();
    const bInfo=BOARD_THEMES[bIdx];
    if(mode==='mp'&&!isSpec&&typeof host!=='undefined'&&host){
      setTimeout(()=>{try{snd2({k:'bd_sync',idx:bIdx})}catch(e){}},180);
    }
    if(bInfo)setTimeout(()=>{try{toast('🗺️ 이번 대국 전장: '+bInfo.name,2300)}catch(e){}},350);
  }
  if(!isReplay){
    if(curReplay&&curReplay.moves&&curReplay.moves.length)recordReplaySave();
    const now=new Date(),pad=n=>String(n).padStart(2,'0');
    const dt=`${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const myN=nick(),opN=mode==='mp'?(oppNick||'상대'):('COM('+cfg.lv+')');
    curReplay={
      id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),
      dt,
      mode,
      me:m,
      sc:sc||SETUPS[cfg.si][2],
      sh:sh||SETUPS[cfg.si][2],
      cNick:m==='c'?myN:opN,
      hNick:m==='h'?myN:opN,
      moves:[],
      res:'대국 진행중',
      w:null,
      CM:[],
      GH:[0.5]
    };
  }
  $('g').classList.remove('xrep');
  return _beginOrig.apply(this,arguments);
};

// doMove 후킹: 매 수 이동 기록
const _doMoveRp=doMove;
doMove=function(m){
  if(!isReplay&&!anim&&!over&&curReplay){
    const p=B[m[1]]&&B[m[1]][m[0]],q=B[m[3]]&&B[m[3]][m[2]];
    curReplay.moves.push({
      type:'mv',
      s:turn,
      m:[m[0],m[1],m[2],m[3]],
      p:p?p.t:'',
      v:q?q.t:null
    });
    setTimeout(()=>{
      if(curReplay){
        curReplay.CM=CM?CM.slice():[];
        curReplay.GH=GH?GH.slice():[];
        recordReplaySave();
      }
    },60);
  }
  return _doMoveRp.apply(this,arguments);
};

// doPass 후킹: 한번쉼 기록
const _doPassRp=doPass;
doPass=function(s){
  if(!isReplay&&!over&&inGame&&curReplay){
    curReplay.moves.push({type:'pass',s});
    curReplay.CM=CM?CM.slice():[];
    curReplay.GH=GH?GH.slice():[];
    recordReplaySave();
  }
  return _doPassRp.apply(this,arguments);
};

// doUndo 후킹: 무르기 시 리플레이 수순 동기화
const _doUndoRp=doUndo;
doUndo=function(to){
  const ok=_doUndoRp.apply(this,arguments);
  if(ok&&!isReplay&&curReplay&& Array.isArray(curReplay.moves)){
    curReplay.moves.length=Math.max(0,to);
    recordReplaySave();
  }
  return ok;
};

// end 후킹: 대국 종료 시 결과 저장
const _endRp=end;
end=function(w,msg){
  if( isReplay ){
    rpStopPlay();
    return;
  }
  _endRp.apply(this,arguments);
  if(curReplay){
    curReplay.w=w;
    curReplay.res=msg||(w?(w==='c'?'초':'한')+'나라 승리!':'무승부');
    curReplay.CM=CM?CM.slice():[];
    curReplay.GH=GH?GH.slice():[];
    recordReplaySave();
  }
};

// lobby 후킹: 로비 이동 시 리플레이 타이머 정리 및 저장
const _lobbyRp=lobby;
lobby=function(){
  rpStopPlay();
  if(isReplay){
    isReplay=false;
    $('g').classList.remove('xrep','xspec');
  }else if(curReplay&&curReplay.moves&&curReplay.moves.length){
    recordReplaySave();
  }
  return _lobbyRp.apply(this,arguments);
};
el('bl').onclick=lobby;
el('ob').onclick=lobby;

function rpStopPlay(){
  rpPlaying=false;
  clearTimeout(rpTimer);
  const pb=el('xr_play');
  if(pb){pb.textContent='▶️ 재생';pb.classList.remove('xon')}
}

function rpApplyState(targetIdx){
  if(!rpData)return;
  anim=null;busy=false;jang=null;sel=null;
  init(rpData.sc||'RNBG.GNBR',rpData.sh||'RNBG.GNBR');
  lm=null;turn='c';mc=0;
  const maxIdx=Math.max(0,Math.min(targetIdx,rpData.moves.length));
  for(let i=0;i<maxIdx;i++){
    const mv=rpData.moves[i];
    if(mv.type==='mv'&&mv.m){
      mk(mv.m);
      lm=mv.m.slice();
      turn=mv.s==='c'?'h':'c';
    }else if(mv.type==='pass'){
      lm=null;
      turn=mv.s==='c'?'h':'c';
    }
    mc=i+1;
  }
  rpIdx=maxIdx;
  $('nc').classList.toggle('on',turn==='c');
  $('nh').classList.toggle('on',turn==='h');
  $('tn').textContent=`🎬 리플레이 (${rpIdx}/${rpData.moves.length}수)`;
  $('tm').textContent=rpIdx===0?'시작':`${rpIdx}수`;
  const stEl=el('xr_step'),slEl=el('xrslider');
  if(stEl)stEl.textContent=`${rpIdx} / ${rpData.moves.length}수`;
  if(slEl){slEl.max=String(rpData.moves.length);slEl.value=String(rpIdx)}
  // 해설창 및 전황 게이지 동기화
  try{
    const e=gEval();
    const p=(rpData.GH&&rpData.GH[rpIdx]!=null)?rpData.GH[rpIdx]:Math.min(.97,Math.max(.03,1/(1+Math.exp(-e.d/7.5))));
    const c=Math.round(p*100);
    el('xgf').style.width=c+'%';
    el('xgl').textContent='초 '+c+'%';
    el('xgr').textContent=(100-c)+'% 한';
    el('xgn').textContent=`전력 초 ${e.a.toFixed(1)} : 한 ${e.b.toFixed(1)} (${rpData.res||''})`;
    const comEl=el('xcom');
    if(comEl&&Array.isArray(rpData.CM)){
      comEl.innerHTML='';
      rpData.CM.filter(m=>m.n<=rpIdx).forEach(m=>comShow(m,1));
    }
  }catch(e){}
}

function rpScheduleNext(){
  clearTimeout(rpTimer);
  if(!rpPlaying||!rpData)return;
  if(rpIdx>=rpData.moves.length){
    rpStopPlay();
    toast(`🏁 리플레이 종료: ${rpData.res||'대국 완료'}`,3000);
    return;
  }
  if(anim||busy){
    rpTimer=setTimeout(rpScheduleNext,120);
    return;
  }
  rpStepNext(true);
}

function rpStepNext(withAnim){
  if(!rpData||rpIdx>=rpData.moves.length){
    rpStopPlay();
    return;
  }
  if(anim)rpApplyState(rpIdx);
  const mv=rpData.moves[rpIdx];
  rpIdx++;
  if(withAnim&&mv.type==='mv'&&mv.m){
    const m=mv.m;
    const p=B[m[1]]&&B[m[1]][m[0]],q=mk(m);
    if(p){
      mc=rpIdx;lm=m.slice();sel=null;
      const dist=Math.max(Math.abs(m[2]-m[0]),Math.abs(m[3]-m[1]));
      const spdMul=rpSpd===2?0.52:1;
      const D=(480+95*dist)*spdMul,A=(q?780:0)*spdMul;
      anim={p,m,q,t0:performance.now(),D,A,dist,o:mv.s==='c'?'h':'c',T:[480*spdMul,480*spdMul+D,480*spdMul+D+A,480*spdMul+D+A+450*spdMul]};
      const stEl=el('xr_step'),slEl=el('xrslider');
      if(stEl)stEl.textContent=`${rpIdx} / ${rpData.moves.length}수`;
      if(slEl)slEl.value=String(rpIdx);
      $('tn').textContent=`🎬 리플레이 (${rpIdx}/${rpData.moves.length}수)`;
      $('tm').textContent=`${rpIdx}수`;
      // 애니메이션 완료 후 다음 수 예약
      const waitMs=anim.T[3]+180;
      if(rpPlaying){
        clearTimeout(rpTimer);
        rpTimer=setTimeout(()=>{
          rpApplyState(rpIdx);
          if(rpPlaying)rpScheduleNext();
        },waitMs);
      }else{
        clearTimeout(rpTimer);
        rpTimer=setTimeout(()=>rpApplyState(rpIdx),waitMs);
      }
      return;
    }
  }
  rpApplyState(rpIdx);
  if(rpPlaying){
    rpTimer=setTimeout(rpScheduleNext,rpSpd===2?500:950);
  }
}

window.startReplay=function(rep){
  if(!rep||!Array.isArray(rep.moves)||!rep.moves.length){
    toast('재생할 수순 기록이 없는 대국이에요.',2500);
    return;
  }
  rpStopPlay();
  clearInterval(tint);
  if(orbRaf){cancelAnimationFrame(orbRaf);orbRaf=0}
  if(orbCanvas){try{orbCanvas.remove()}catch(e){}orbCanvas=null}
  if(smashRaf){cancelAnimationFrame(smashRaf);smashRaf=0}
  if(ovRaf){cancelAnimationFrame(ovRaf);ovRaf=0}
  if(smashCanvas){try{smashCanvas.remove()}catch(e){}smashCanvas=null}
  isReplay=true;isSpec=false;over=true;inGame=false;busy=false;anim=null;jang=null;sel=null;
  rpData=JSON.parse(JSON.stringify(rep));
  me=rpData.me||'c';
  flip=me==='h';
  CM=Array.isArray(rpData.CM)?rpData.CM.slice():[];
  GH=Array.isArray(rpData.GH)?rpData.GH.slice():[];
  window.DMG={c:0,h:0};
  window.SDMG={c:{lv:0,hits:[]},h:{lv:0,hits:[]}};
  if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}
  el('xrpm').style.display='none';
  el('xrp').style.display='none';
  el('ov').style.display='none';
  el('dc').style.display='none';
  el('rm').style.display='none';
  el('st').style.display='none';
  el('g').style.display='block';
  el('g').classList.remove('xspec','xai');
  el('g').classList.add('xrep');
  cv=$('cv');cx2=cv.getContext('2d');cv.style.opacity='1';cv.style.transform='';
  $('nc').textContent='초 '+(rpData.cNick||'초나라');
  $('nh').textContent='한 '+(rpData.hNick||'한나라');
  const rb=$('rcbadge');if(rb)rb.style.display='none';
  const tt=el('xr_title');
  if(tt)tt.textContent=`🎬 ${rpData.cNick||'초'} vs ${rpData.hNick||'한'} (${rpData.dt||''})`;
  setTab('m');
  fitScreen();
  rzK='';resize();
  rpApplyState(0);
  if(!looping){looping=true;requestAnimationFrame(loop)}
  toast('🎬 리플레이 모드입니다. 하단/우측 버튼이나 슬라이더로 수순을 조작하세요!',3200);
  // 자동으로 0.6초 뒤 재생 시작
  rpPlaying=true;
  const pb=el('xr_play');if(pb){pb.textContent='⏸ 일시정지';pb.classList.add('xon')}
  rpTimer=setTimeout(rpScheduleNext,650);
};

window.openReplayMenu=function(){
  if(curReplay&&curReplay.moves&&curReplay.moves.length&&!isReplay)recordReplaySave();
  const list=loadReplays();
  const boxEl=el('xrpm_list'),subEl=el('xrpm_sub');
  if(!boxEl)return;
  boxEl.innerHTML='';
  if(!list.length){
    if(subEl)subEl.textContent='아직 저장된 리플레이 대국이 없습니다. 한 판 두면 자동으로 저장돼요!';
    const empty=document.createElement('div');
    empty.style.cssText='padding:24px 10px;text-align:center;color:#9aa8c7;font-size:14px';
    empty.textContent='저장된 다시보기 기록이 없어요 🎲';
    boxEl.appendChild(empty);
  }else{
    if(subEl)subEl.textContent=`최근 대국 ${list.length}건이 저장되어 있어요. [▶️ 보드 재생]을 눌러 감상하세요!`;
    list.forEach((item,idx)=>{
      const row=document.createElement('div');
      row.className='xrp_item';
      const info=document.createElement('div');
      info.className='xrp_info';
      const t1=document.createElement('div');
      t1.className='xrp_title';
      const badge=item.mode==='mp'?'[멀티]':'[AI]';
      t1.textContent=`${badge} 초 ${item.cNick||'초'} vs 한 ${item.hNick||'한'}`;
      const t2=document.createElement('div');
      t2.className='xrp_sub';
      t2.textContent=`${item.dt||''} · 총 ${(item.moves&&item.moves.length)||0}수 · ${item.res||'종료'}`;
      info.append(t1,t2);
      const acts=document.createElement('div');
      acts.className='xrp_acts';
      const bPlay=document.createElement('button');
      bPlay.className='xrp_play';
      bPlay.textContent='▶️ 보드 재생';
      bPlay.onclick=()=>window.startReplay(item);
      const bDel=document.createElement('button');
      bDel.className='xrp_del';
      bDel.textContent='🗑️';
      bDel.title='이 리플레이 삭제';
      bDel.onclick=()=>{
        const cur=loadReplays().filter(x=>x&&x.id!==item.id);
        saveReplays(cur);
        window.openReplayMenu();
      };
      acts.append(bPlay,bDel);
      row.append(info,acts);
      boxEl.appendChild(row);
    });
  }
  el('xrpm').style.display='flex';
};

if(el('xrpm_close'))el('xrpm_close').onclick=()=>{el('xrpm').style.display='none'};
if(el('xrpm_clr'))el('xrpm_clr').onclick=()=>{
  saveReplays([]);
  curReplay=null;
  window.openReplayMenu();
  toast('리플레이 기록을 모두 삭제했어요',2000);
};
if(el('ov_rp'))el('ov_rp').onclick=()=>{
  if(curReplay&&curReplay.moves&&curReplay.moves.length){
    recordReplaySave();
    window.startReplay(curReplay);
  }else{
    window.openReplayMenu();
  }
};
if(el('xr_first'))el('xr_first').onclick=()=>{rpStopPlay();rpApplyState(0)};
if(el('xr_prev'))el('xr_prev').onclick=()=>{rpStopPlay();rpApplyState(rpIdx-1)};
if(el('xr_next'))el('xr_next').onclick=()=>{rpStopPlay();rpStepNext(true)};
if(el('xr_last'))el('xr_last').onclick=()=>{rpStopPlay();if(rpData)rpApplyState(rpData.moves.length)};
if(el('xr_play'))el('xr_play').onclick=()=>{
  if(!rpData)return;
  if(rpPlaying){
    rpStopPlay();
  }else{
    if(rpIdx>=rpData.moves.length)rpApplyState(0);
    rpPlaying=true;
    const pb=el('xr_play');
    if(pb){pb.textContent='⏸ 일시정지';pb.classList.add('xon')}
    rpScheduleNext();
  }
};
if(el('xr_spd'))el('xr_spd').onclick=()=>{
  rpSpd=rpSpd===1?2:1;
  el('xr_spd').textContent=`⚡ ${rpSpd}x`;
  el('xr_spd').classList.toggle('xon',rpSpd===2);
};
if(el('xr_flip'))el('xr_flip').onclick=()=>{
  flip=!flip;rzK='';resize();
};
if(el('xr_list'))el('xr_list').onclick=()=>{
  rpStopPlay();
  window.openReplayMenu();
};
if(el('xr_com'))el('xr_com').onclick=()=>{
  rpStopPlay();
  openRp();
};
if(el('xr_exit'))el('xr_exit').onclick=()=>lobby();
if(el('xrslider'))el('xrslider').oninput=e=>{
  rpStopPlay();
  rpApplyState(+e.target.value||0);
};


/* ==== 4. AI 훈수 · 교육 모드 (최선수 화살표 추천 & 전술 실습) 및 명국 기보 도서관 ==== */
const PIECE_KR={R:'차',C:'포',N:'마',B:'상',G:'사',K:'궁',P:'졸'};
function mToKiboStr(no,s,m,p,v){
  const sn=s==='c'?'초':'한';
  const pn=PIECE_KR[p]||(s==='c'?'병':'졸');
  const vn=v?(` (${PIECE_KR[v]||'기물'} 획득)`):'';
  return `${no}수 [${sn}] ${pn}(${m[0]+1},${m[1]+1}→${m[2]+1},${m[3]+1})${vn}`;
}

window.coachSeq=0;window.coachHints=[];
/* 훈수: 별도 AI 스레드에서 깊게 수읽기 후 추천 1·2순위를 표시 (화면이 멈추지 않음) */
window.updateCoachHints=function(){
  window.coachHints=[];
  if(!window.coachMode||!inGame||over||turn!==me)return;
  const id=++window.coachSeq,msgEl=el('xch_msg');
  if(msgEl)msgEl.innerHTML='🤔 최선수를 깊이 분석하는 중입니다...';
  try{
    if(wk)wk.postMessage({k:'hint',id,s:me,n:2,t:1800,B});
    else setTimeout(()=>{let r=null;try{r=E_hint(me,2,700)}catch(e){}window.coachRes({k:'hint',id,r})},30);
  }catch(e){}
};
window.coachRes=function(d){
  if(!d||d.id!==window.coachSeq||!window.coachMode||!inGame||over||turn!==me)return;
  try{
    const r=d.r;if(!r||!r.list||!r.list.length)return;
    const o=me==='c'?'h':'c',L=legal(me),scored=[];
    for(const h of r.list){
      const m=h.m;
      if(!L.some(z=>z.join()===m.join()))continue;
      const p=B[m[1]][m[0]],q=mk(m),givesChk=chk(o);un(m,q);
      let reason='진영 정비 및 행마 길 확보';
      if(q&&givesChk)reason=`${PIECE_KR[q.t]} 타격과 동시에 장군! 결정적 공세`;
      else if(q)reason=`상대 ${PIECE_KR[q.t]}(${VAL[q.t]}점) 획득으로 전력 우위 확보`;
      else if(givesChk)reason='날카로운 장군으로 상대 궁성 압박';
      else if(p&&(p.t==='N'||p.t==='B')&&(m[1]===9||m[1]===0))reason=`${PIECE_KR[p.t]} 중앙 진출로 공격로 개방`;
      else if(p&&p.t==='C'&&m[2]===4)reason='면포 배치로 궁성 수비 및 중앙 장악';
      else if(p&&p.t==='R')reason='차(車)의 기동력을 살린 요충지 선점';
      scored.push({m,sc:h.sc,p:p?p.t:'P',q:q?q.t:null,reason});
    }
    if(!scored.length)return;
    window.coachHints=scored.slice(0,2);
    const msgEl=el('xch_msg'),h1=window.coachHints[0];
    if(msgEl&&h1){
      const pName=PIECE_KR[h1.p]||'기물',ev=(h1.sc/10),evs=Math.abs(h1.sc)>25000?(h1.sc>0?'승리 확정':'위험'):`형세 ${ev>=0?'+':''}${ev.toFixed(1)}점`;
      msgEl.innerHTML=`🥇 <b>추천 1순위</b>: <b>${pName}(${h1.m[0]+1},${h1.m[1]+1}→${h1.m[2]+1},${h1.m[3]+1})</b> — ${h1.reason} <span style="opacity:.75">(${evs} · ${r.depth}수 앞까지 분석)</span>`;
    }
  }catch(e){}
};

if(el('xch_hint'))el('xch_hint').onclick=()=>{
  if(!window.coachMode)return;
  const h1=window.coachHints&&window.coachHints[0];
  if(h1){
    toast(`💡 훈수 추천: ${PIECE_KR[h1.p]}(${h1.m[0]+1},${h1.m[1]+1}→${h1.m[2]+1},${h1.m[3]+1}) - ${h1.reason}`,3200);
  }else{
    window.updateCoachHints();toast('🤔 최선수를 분석 중이에요. 잠시만 기다려 주세요',1800);
  }
};
if(el('xch_auto'))el('xch_auto').onclick=()=>{
  if(!window.coachMode||!inGame||over||anim||busy||turn!==me)return;
  if(!window.coachHints.length){window.updateCoachHints();toast('🤔 최선수를 분석 중이에요. 잠시 후 다시 눌러 주세요',1800);return}
  play(window.coachHints[0].m);
};

// 훈수 화살표를 보드 위에 렌더링 (jgDrawSpec 확장)
const _origDrawSpec=window.jgDrawSpec;
window.jgDrawSpec=function(g,now){
  if(_origDrawSpec)try{_origDrawSpec(g,now)}catch(e){}
  if(window.coachMode&&inGame&&!over&&!anim&&turn===me&&window.coachHints&&window.coachHints.length){
    g.save();
    window.coachHints.forEach((h,idx)=>{
      const [x0,y0]=px(h.m[0],h.m[1]),[x1,y1]=px(h.m[2],h.m[3]);
      const col=idx===0?'#ffd54a':'#52c3ff';
      const pulse=0.75+0.25*Math.sin(now/180);
      g.strokeStyle=col;
      g.fillStyle=col;
      g.lineWidth=(idx===0?5:3.5);
      g.globalAlpha=idx===0?0.92*pulse:0.7;
      g.shadowColor='#000';
      g.shadowBlur=8;
      g.beginPath();
      g.moveTo(x0,y0);
      g.lineTo(x1,y1);
      g.stroke();
      const ang=Math.atan2(y1-y0,x1-x0),hl=C*0.32;
      g.beginPath();
      g.moveTo(x1,y1);
      g.lineTo(x1-hl*Math.cos(ang-0.42),y1-hl*Math.sin(ang-0.42));
      g.lineTo(x1-hl*Math.cos(ang+0.42),y1-hl*Math.sin(ang+0.42));
      g.closePath();
      g.fill();
      g.font=`900 ${Math.round(C*0.26)}px sans-serif`;
      g.textAlign='center';
      g.fillStyle='#fff';
      g.fillText(idx===0?'🥇추천1':'🥈추천2',(x0+x1)/2,(y0+y1)/2-8);
    });
    g.restore();
  }
};

// setTurn 및 end 확장: 코칭 모드 힌트 자동 갱신 및 도전모드 승리 저장
const _setTurnCoach=setTurn;
setTurn=function(s){
  _setTurnCoach.apply(this,arguments);
  if(window.coachMode)window.coachHints=[];
  if(window.coachMode&&s===me&&inGame&&!over){
    setTimeout(()=>{if(window.updateCoachHints)window.updateCoachHints()},220);
  }
};

const _endChal=end;
end=function(w,msg){
  const wasAi=(cfg.mode==='ai'&&!isReplay&&!window.coachMode);
  _endChal.apply(this,arguments);
  if(wasAi&&w===me&&window.saveChalWin){
    window.saveChalWin(cfg.lv);
  }
};

// 무르기: 멀티(상대 승인) / AI 대전 / 훈수 모드 모두 지원 — 무르려면 '짧은 굴욕 멘트'를 직접 적어야 함
const HUM_SAMPLES=['저는 손이 미끄러진 초보입니다','한 번만 봐주세요 형님…','방금 수는 제 실수였습니다 ㅠㅠ','장기 접고 싶은 심정입니다','다음엔 꼭 제대로 두겠습니다','제 손가락을 용서해 주세요','어젯밤 꿈에서 둔 수였어요','저는 무르기 장인입니다 🙇','눈이 장식인가 봅니다','이번 한 번만 시간을 돌려주세요'];
function humPrompt(cb){
  let m=document.getElementById('jg_hum_modal');
  if(!m){
    m=document.createElement('div');m.id='jg_hum_modal';
    m.style.cssText='position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.74);display:none;align-items:center;justify-content:center;padding:16px';
    m.innerHTML='<div style="width:min(380px,100%);background:#241a0e;border:2px solid #c9a24a;border-radius:14px;padding:16px;color:#ffe9b0;box-shadow:0 10px 40px #000a">'
      +'<div style="font-size:18px;font-weight:900;margin-bottom:6px">🙇 무르기 굴욕 선언</div>'
      +'<div style="font-size:13px;opacity:.88;line-height:1.5;margin-bottom:10px">무르려면 <b>짧은 굴욕 멘트</b>를 직접 적어야 해요. (2~20자)<br>적은 멘트는 채팅에 공개됩니다!</div>'
      +'<input id="jg_hum_in" maxlength="20" autocomplete="off" placeholder="예) 한 번만 봐주세요 형님…" style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid #c9a24a;background:#150f08;color:#fff;font-size:15px">'
      +'<div id="jg_hum_cnt" style="text-align:right;font-size:11px;opacity:.7;margin:3px 0 10px">0/20</div>'
      +'<div style="display:flex;gap:8px"><button id="jg_hum_rnd" style="flex:1;padding:9px 4px;border-radius:8px;border:1px solid #c9a24a;background:#3b2b17;color:#ffe9b0;font-weight:800;cursor:pointer">🎲 추천 멘트</button>'
      +'<button id="jg_hum_no" style="flex:1;padding:9px 4px;border-radius:8px;border:1px solid #777;background:#2a2a2a;color:#ddd;font-weight:800;cursor:pointer">취소</button>'
      +'<button id="jg_hum_ok" style="flex:1.6;padding:9px 4px;border-radius:8px;border:1px solid #ffcf5a;background:linear-gradient(180deg,#d4881c,#8a4a0a);color:#fff;font-weight:900;cursor:pointer">선언하고 무르기</button></div></div>';
    document.body.appendChild(m);
  }
  const inp=document.getElementById('jg_hum_in'),cnt=document.getElementById('jg_hum_cnt');
  inp.value='';cnt.textContent='0/20';m.style.display='flex';setTimeout(()=>{try{inp.focus()}catch(e){}},60);
  const close=()=>{m.style.display='none'};
  inp.oninput=()=>{cnt.textContent=inp.value.length+'/20'};
  document.getElementById('jg_hum_rnd').onclick=()=>{inp.value=HUM_SAMPLES[Math.random()*HUM_SAMPLES.length|0];cnt.textContent=inp.value.length+'/20'};
  document.getElementById('jg_hum_no').onclick=close;
  const ok=()=>{
    const v=inp.value.replace(/[<>]/g,'').trim();
    if(v.length<2)return toast('굴욕 멘트를 2자 이상 적어야 무를 수 있어요 🙇',2200);
    close();cb(v);
  };
  document.getElementById('jg_hum_ok').onclick=ok;
  inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok()}};
}
el('xundo').onclick=()=>{
  if(!inGame||over)return;
  if(anim||busy)return toast('수가 진행 중이에요. 잠시 후 다시 눌러 주세요',1800);
  if(cfg.mode==='mp'){
    if(UQ)return toast('상대의 응답을 기다리는 중이에요',2000);
    if(!(conn&&conn.open))return toast('상대와 연결되지 않았어요',2000);
    if(lastIdx(me)<0)return toast('무를 수가 없어요',2000);
    humPrompt(ph=>idle(()=>{
      const i=lastIdx(me);if(i<0||!(conn&&conn.open))return toast('무를 수가 없어요',2000);
      const r=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      UQ={r,to:UH[i].mc,timer:setTimeout(()=>{if(UQ&&UQ.r===r){snd2({k:'ux',r});UQ=null;toast('응답이 없어 무르기 요청을 취소했어요',2500)}},30000)};
      snd2({k:'uq',r,to:UQ.to,cur:mc,p:ph});
      sysLog('🙇 '+nick()+': “'+ph+'” (무르기 요청)','xs xr');
      toast('무르기를 요청했어요. 상대의 응답을 기다려요…',3000);
    }));
  }else if(cfg.mode==='ai'){
    if(lastIdx(me)<0)return toast('무를 수 있는 이전 수가 없어요',2000);
    humPrompt(ph=>{
      if(over||!inGame||anim)return;
      const j=lastIdx(me);if(j<0)return toast('무를 수 있는 이전 수가 없어요',2000);
      aiId++;clearTimeout(aiWd);               /* 진행 중이던 AI 계산 결과 무효화 */
      if(doUndo(UH[j].mc)){
        sysLog('🙇 '+nick()+': “'+ph+'” (무르기)','xs xr');
        toast('↩ 무르기 완료! “'+ph+'”',2800);
        if(window.coachMode&&window.updateCoachHints)setTimeout(window.updateCoachHints,200);
      }else toast('무를 수 없는 상황이에요',2000);
    });
  }
};

// 전술/행마 실습 시나리오 데이터
const EDU_LESSONS=[
  {
    title:'📘 1교시: 원앙마·면포 포진 코칭 대국',
    sub:'포(包)를 궁 앞에 두는 면포 수비와 마·상 전개법을 AI 실시간 화살표 훈수로 배웁니다.',
    tag:'입문 필수 · 실시간 훈수',
    action:()=>{cfg.si=0;cfg.lv='초보1';showSetup();startAI(true)}
  },
  {
    title:'⚔️ 2교시: 양차(車) 합세 공격 실습',
    sub:'양쪽 차(車)의 길을 빠르게 열어 상대 궁성을 정면 압박하는 공격 전술을 실습합니다.',
    tag:'초중급 공격 전술',
    action:()=>{cfg.si=1;cfg.lv='초보2';showSetup();startAI(true)}
  },
  {
    title:'🛡️ 3교시: 안상(內象) 철벽 수비와 역습',
    sub:'상(象)을 안쪽으로 배치해 중앙을 튼튼히 지키고 포와 마로 역습하는 실전 코칭입니다.',
    tag:'수비 후 역습 전술',
    action:()=>{cfg.si=3;cfg.lv='초보3';showSetup();startAI(true)}
  },
  {
    title:'👑 4교시: 중수·고수 실전 수읽기 코칭',
    sub:'강력한 중수 AI를 상대로 매 수 최선수 1·2순위 훈수와 무제한 무르기로 기력을 높입니다.',
    tag:'심화 수읽기 완성',
    action:()=>{cfg.si=2;cfg.lv='중수';showSetup();startAI(true)}
  }
];

function renderEduList(){
  const box=$('lb_edu_list');
  if(!box)return;
  box.innerHTML='';
  EDU_LESSONS.forEach(item=>{
    const card=document.createElement('div');
    card.className='lb-item-card';
    card.innerHTML=`
      <div class="lb-item-title">${item.title}</div>
      <div class="lb-item-sub">${item.sub}</div>
      <div class="lb-item-foot"><span>${item.tag}</span><span>▶️ 실습 시작</span></div>
    `;
    card.onclick=item.action;
    box.appendChild(card);
  });
}
renderEduList();

// 명국 · 정석 기보 도서관 데이터
const PRO_KIBOS=[
  {
    id:'pro_kibo_1',
    title:'📜 [정석 기보 1] 귀마 대 원앙마 표준 정석',
    sub:'초반 병·졸 차길 열기부터 면포 안착, 중앙 마·상 전개까지의 가장 표준적인 정석 수순입니다.',
    dt:'정석 교본 제1국',
    mode:'ai',me:'c',
    sc:'RNBG.GBNR',sh:'RNBG.GNBR',
    cNick:'초(귀마정석)',hNick:'한(원앙마정석)',
    res:'중앙 균형 정석 완료',
    moves:[
      {type:'mv',s:'c',m:[8,6,7,6],p:'P',v:null},
      {type:'mv',s:'h',m:[0,3,1,3],p:'P',v:null},
      {type:'mv',s:'c',m:[7,9,6,7],p:'N',v:null},
      {type:'mv',s:'h',m:[1,0,2,2],p:'N',v:null},
      {type:'mv',s:'c',m:[7,7,4,7],p:'C',v:null},
      {type:'mv',s:'h',m:[1,2,4,2],p:'C',v:null},
      {type:'mv',s:'c',m:[5,9,5,8],p:'G',v:null},
      {type:'mv',s:'h',m:[3,0,3,1],p:'G',v:null},
      {type:'mv',s:'c',m:[1,9,2,7],p:'N',v:null},
      {type:'mv',s:'h',m:[6,0,6,2],p:'N',v:null},
      {type:'mv',s:'c',m:[6,9,4,6],p:'B',v:null},
      {type:'mv',s:'h',m:[2,0,4,3],p:'B',v:null}
    ],
    CM:[
      {n:1,t:'1수: 초가 우측 병(兵)을 쓸어 차(車)의 활로를 먼저 확보합니다.',sw:0.06},
      {n:4,t:'4수: 양측 모두 마(馬)를 위로 진출시켜 정석적인 귀마·원앙마 진형을 갖춥니다.',sw:0.06},
      {n:6,t:'6수: 포(包)가 궁 앞으로 넘어와 핵심 수비 대형인 면포(面包)를 완성합니다.',sw:0.08},
      {n:12,t:'12수: 상(象)이 중앙 요충지로 진출하며 공수 밸런스가 완벽한 중반전으로 돌입합니다.',sw:0.09}
    ],
    GH:[0.5,0.52,0.5,0.53,0.5,0.52,0.5,0.51,0.5,0.52,0.5,0.53,0.52]
  },
  {
    id:'pro_kibo_2',
    title:'🔥 [명국 기보 2] 적벽의 화공 — 양차 속공 격파국',
    sub:'초반 양차의 기동력을 극대화하여 상대의 좌우 측면을 흔들고 중원을 돌파하는 공격형 명국입니다.',
    dt:'삼국지 명국선 제2국',
    mode:'ai',me:'c',
    sc:'RNBG.GNBR',sh:'RNBG.GBNR',
    cNick:'초(주유 속공진)',hNick:'한(조조 본진)',
    res:'초나라 속공 우세승',
    moves:[
      {type:'mv',s:'c',m:[0,6,1,6],p:'P',v:null},
      {type:'mv',s:'h',m:[8,3,7,3],p:'P',v:null},
      {type:'mv',s:'c',m:[0,9,0,5],p:'R',v:null},
      {type:'mv',s:'h',m:[7,0,6,2],p:'N',v:null},
      {type:'mv',s:'c',m:[0,5,3,5],p:'R',v:null},
      {type:'mv',s:'h',m:[7,2,4,2],p:'C',v:null},
      {type:'mv',s:'c',m:[1,9,2,7],p:'N',v:null},
      {type:'mv',s:'h',m:[8,0,8,4],p:'R',v:null},
      {type:'mv',s:'c',m:[7,7,4,7],p:'C',v:null},
      {type:'mv',s:'h',m:[8,4,5,4],p:'R',v:null},
      {type:'mv',s:'c',m:[3,5,3,3],p:'R',v:null},
      {type:'mv',s:'h',m:[4,3,3,3],p:'P',v:null}
    ],
    CM:[
      {n:3,t:'3수: 초의 차(車)가 빠르게 4칸 전진하며 선제 주도권을 잡습니다!',sw:0.08},
      {n:5,t:'5수: 중앙 요충지 4줄로 차를 수평 이동하여 한의 중원을 강력히 압박합니다.',sw:0.1},
      {n:11,t:'11수: 과감한 차의 돌파로 한나라의 전열을 무너뜨리는 명장면입니다!',sw:0.15}
    ],
    GH:[0.5,0.53,0.51,0.56,0.53,0.59,0.55,0.58,0.54,0.58,0.55,0.68,0.64]
  },
  {
    id:'pro_kibo_3',
    title:'🛡️ [전술 기보 3] 양귀마 대 안상 — 견고한 공방전',
    sub:'양귀마의 균형 잡힌 공격과 안상 포진의 단단한 중앙 수비가 맞붙는 정통파 기보입니다.',
    dt:'포진 전술 교본 제3국',
    mode:'ai',me:'c',
    sc:'RNBG.GBNR',sh:'NBGR.RGBN',
    cNick:'초(양귀마)',hNick:'한(안상포진)',
    res:'정통 중반 수읽기 교본',
    moves:[
      {type:'mv',s:'c',m:[4,6,4,5],p:'P',v:null},
      {type:'mv',s:'h',m:[4,3,4,4],p:'P',v:null},
      {type:'mv',s:'c',m:[1,9,2,7],p:'N',v:null},
      {type:'mv',s:'h',m:[1,0,3,3],p:'B',v:null},
      {type:'mv',s:'c',m:[7,9,6,7],p:'N',v:null},
      {type:'mv',s:'h',m:[7,0,5,3],p:'B',v:null},
      {type:'mv',s:'c',m:[4,5,4,4],p:'P',v:'P'},
      {type:'mv',s:'h',m:[3,3,5,6],p:'B',v:null},
      {type:'mv',s:'c',m:[7,7,4,7],p:'C',v:null},
      {type:'mv',s:'h',m:[1,2,4,2],p:'C',v:null}
    ],
    CM:[
      {n:2,t:'2수: 중앙 병·졸을 맞부딪치며 치열한 중원 쟁탈전이 시작됩니다.',sw:0.07},
      {n:6,t:'6수: 한나라가 양쪽 상(象)을 중앙으로 모으는 안상 진형으로 철벽 방어망을 구축합니다.',sw:0.08},
      {n:7,t:'7수: 초가 중앙 졸을 취하며 포(包)의 다리를 확보합니다.',sw:0.12}
    ],
    GH:[0.5,0.52,0.5,0.52,0.5,0.53,0.5,0.58,0.52,0.56,0.54]
  },
  {
    id:'pro_kibo_4',
    title:'🎬 [내 기보 보관함] 최근 대국 리플레이 열기',
    sub:'내가 직접 두었던 AI 대국 및 멀티 대국의 전체 기보와 전황 그래프·해설을 보드 위에서 복기합니다.',
    dt:'내 대국 자동 저장소',
    isMyReplay:true
  }
];

function renderKiboList(){
  const box=$('lb_kibo_list');
  if(!box)return;
  box.innerHTML='';
  PRO_KIBOS.forEach(kb=>{
    const card=document.createElement('div');
    card.className='lb-item-card';
    card.innerHTML=`
      <div class="lb-item-title">${kb.title}</div>
      <div class="lb-item-sub">${kb.sub}</div>
      <div class="lb-item-foot"><span>${kb.dt}</span><span>${kb.isMyReplay?'📂 보관함 열기':'▶️ 기보 감상'}</span></div>
    `;
    card.onclick=()=>{
      if(kb.isMyReplay){
        if(window.openReplayMenu)window.openReplayMenu();
      }else if(window.startReplay){
        window.startReplay(kb);
      }
    };
    box.appendChild(card);
  });
}
renderKiboList();

setInterval(upd,300);
if(inGame){try{jgPanel(cfg.mode);if(cfg.mode==='mp')sysLog('🔄 화면이 다시 불러와져서 대국을 이어갔어요','xs xg');resize()}catch(e){}}
})();