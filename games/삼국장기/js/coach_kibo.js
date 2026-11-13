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
