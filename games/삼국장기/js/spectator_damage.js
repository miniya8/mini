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

/* ============================================================================
 * [장기판 리얼 물리 파괴 렌더링 엔진 v3 — Ultra-Realistic Tectonic & Material Fracture]
 * - 5대 전장 재질(사막 사암 / 설원 빙하 / 고대 신목·석재 / 암흑 흑요석 / 고성 목재)별 고유 파단면 & 광물 광택
 * - 상판 뒤틀림(Warped Plate Shift) + 5단 계단식 절벽(Strata) + 심연 크레바스 마그마/냉기/마력 맥동
 * - 스킬별 고유 물리 흔적(핵폭탄 유리화 분화구, 메테오 용암 협곡, 에네르기파 초열 플라즈마 슬래시,
 *   주먹 함몰 크레이터, 망치 빙결 방사 파쇄, 총격 철갑 관통공, 외계인 부식 분화구)
 * - 기물 착점(교차점) 100% 시인성 보존 & 오프스크린 고성능 캐싱
 * ============================================================================ */
window.DMG={c:0,h:0};
const CR_IM=[];
CR_SRC.forEach(src=>{const im=new Image();im.onload=()=>{if(window.DMG&&(DMG.c||DMG.h)){rzK='';try{resize()}catch(e){}}};im.src=src;CR_IM.push(im)});
window.jgDmg=s=>Math.min(4,Math.max(0,(window.DMG&&window.DMG[s])||0));
window.DMG_SK={c:[],h:[]};
function ensureDmgSk(){
  if(!window.DMG_SK||typeof window.DMG_SK!=='object')window.DMG_SK={c:[],h:[]};
  if(!Array.isArray(window.DMG_SK.c))window.DMG_SK.c=[];
  if(!Array.isArray(window.DMG_SK.h))window.DMG_SK.h=[];
  return window.DMG_SK;
}

// 5대 전장별 고유 물리 재질 팔레트 (목재/석재/빙하/흑요석의 실제 파단면 색상 & 입자 질감)
const BOARD_MATERIAL_PROFILES=[
  // 0: 황토 사막 (사암 & 건조 목재)
  {
    topRim:'#e8be78', midStrata1:'#9c6124', midStrata2:'#542e0c', deepRock:'#211003', abyss:'#070301',
    striationLight:'rgba(255,232,175,0.34)', striationDark:'rgba(18,7,1,0.72)',
    scorchInner:'rgba(22,10,2,0.86)', scorchOuter:'rgba(65,32,8,0.42)',
    veinCore:'#ff6d00', veinGlow:'#ffab40', chipCols:['#d49b4b','#8f561e','#59310b'],
    specType:'sandstone'
  },
  // 1: 설원 얼음성 (고밀도 빙하 & 청옥석)
  {
    topRim:'#e8fbff', midStrata1:'#6ab3db', midStrata2:'#1f5c8a', deepRock:'#082442', abyss:'#020a17',
    striationLight:'rgba(255,255,255,0.58)', striationDark:'rgba(4,24,48,0.75)',
    scorchInner:'rgba(6,28,54,0.82)', scorchOuter:'rgba(35,115,175,0.38)',
    veinCore:'#00e5ff', veinGlow:'#84ffff', chipCols:['#e0f7fa','#80d8ff','#29b6f6'],
    specType:'glacier'
  },
  // 2: 고대 숲 유적 (이끼 화강암 & 고목)
  {
    topRim:'#b7d69c', midStrata1:'#5a7549', midStrata2:'#2d4224', deepRock:'#121f0e', abyss:'#040a03',
    striationLight:'rgba(215,255,190,0.36)', striationDark:'rgba(8,18,6,0.76)',
    scorchInner:'rgba(12,24,10,0.85)', scorchOuter:'rgba(38,68,28,0.40)',
    veinCore:'#69f0ae', veinGlow:'#b9f6ca', chipCols:['#9cb886','#5e784e','#364a2b'],
    specType:'granite'
  },
  // 3: 암흑 성채 (흑요석 & 지옥 용암암)
  {
    topRim:'#c97aa8', midStrata1:'#5e284b', midStrata2:'#2d0e26', deepRock:'#130412', abyss:'#040105',
    striationLight:'rgba(255,165,220,0.40)', striationDark:'rgba(10,1,12,0.82)',
    scorchInner:'rgba(14,3,16,0.88)', scorchOuter:'rgba(62,14,52,0.44)',
    veinCore:'#ff1744', veinGlow:'#ff80ab', chipCols:['#9e527e','#592144','#2b0c21'],
    specType:'obsidian'
  },
  // 4: 삼국지 고성 (중후한 옻칠 느티나무 & 청동 테두리)
  {
    topRim:'#e6ba73', midStrata1:'#8c5222', midStrata2:'#4a260b', deepRock:'#1f0e03', abyss:'#060201',
    striationLight:'rgba(255,226,165,0.38)', striationDark:'rgba(16,6,1,0.75)',
    scorchInner:'rgba(18,8,2,0.86)', scorchOuter:'rgba(54,26,7,0.42)',
    veinCore:'#ff5722', veinGlow:'#ffd54a', chipCols:['#cc9245','#854d1e','#4d280b'],
    specType:'hardwood'
  }
];

function getMatProfile(){
  return BOARD_MATERIAL_PROFILES[window.curBoardIdx||0]||BOARD_MATERIAL_PROFILES[0];
}

// 기물 교차점 보호 가중치 계산 (교차점 중심 0.36칸 이내는 시각적 간섭 최소화)
function getIntersectionClearance(x, y){
  if(!OX||!OY||!CX||!CY)return 1;
  const gx=(x-OX)/CX, gy=(y-OY)/CY;
  if(gx<-0.5||gx>8.5||gy<-0.5||gy>9.5)return 1;
  const dist=Math.hypot(gx-Math.round(gx), gy-Math.round(gy));
  return Math.min(1, Math.max(0.18, (dist-0.12)/0.32));
}

window.hitCamp=function(s,sk,extra){
  if(!window.DMG)window.DMG={c:0,h:0};
  window.DMG[s]=Math.min(4,(window.DMG[s]||0)+1);
  const dsk=ensureDmgSk();
  const skillType=sk||'nuke';
  // 타격 지점이 장기판 교차점 정중앙과 겹치지 않고 자연스러운 칸 사이/단층 주변에 찍히도록 보정
  const rawFx=(extra&&extra.fx!=null)?extra.fx:(0.24+(dsk[s].length*0.23)%0.52);
  const rawFy=(extra&&extra.fy!=null)?extra.fy:(0.26+(dsk[s].length*0.19)%0.46);
  dsk[s].push({
    sk:skillType,
    lv:window.DMG[s],
    fx:rawFx,
    fy:rawFy,
    rot:(extra&&extra.rot!=null)?extra.rot:((dsk[s].length%2?1:-1)*0.24)
  });
  if(dsk[s].length>6)dsk[s]=dsk[s].slice(-6);
  if(window.jgTriggerBoardSplit)try{window.jgTriggerBoardSplit(s,skillType)}catch(e){}
  xsave();
  if(cfg.mode==='mp'&&!isSpec)snd2({k:'dmg_sync',DMG:window.DMG,DMG_SK:window.DMG_SK});
  rzK='';try{resize()}catch(e){}
};

window.jgSplitAnim={c:null,h:null};
window.jgTriggerBoardSplit=function(side,sk){
  const mat=getMatProfile();
  const colMap={
    nuke:['#ff6d00','#ffd54a','#ff1744'],
    meteor:['#ff3d00','#ffab00','#dd2c00'],
    alien:['#76ff03','#00e5ff','#00c853'],
    kame:['#00e5ff','#ffffff','#2979ff'],
    kame2:['#00e5ff','#ffe57f','#00b0ff'],
    fist:['#ff5252','#ffd54a',mat.midStrata1],
    hammer:['#80d8ff','#e0f7fa',mat.topRim],
    gun:['#ffd54a','#ff9100','#fff59d']
  };
  const cols=colMap[sk]||colMap.nuke;
  const rocks=[];
  // 입체 파편(36개) + 미세 목재/석재 부스러기 스플린터
  for(let i=0;i<36;i++){
    const a=Math.random()*Math.PI*2,sp=0.35+Math.random()*1.25;
    const isSplinter=i>=22;
    rocks.push({
      fx:0.16+Math.random()*0.68,
      fy:0.14+Math.random()*0.68,
      vx:Math.cos(a)*sp,
      vy:Math.sin(a)*sp-0.55,
      sz:isSplinter?(0.025+Math.random()*0.045):(0.045+Math.random()*0.085),
      aspect:isSplinter?(2.2+Math.random()*1.8):(0.65+Math.random()*0.5),
      rot:Math.random()*6.28,
      vr:(Math.random()-0.5)*14,
      col:i%4===0?cols[0]:mat.chipCols[i%mat.chipCols.length],
      edgeCol:mat.topRim
    });
  }
  window.jgSplitAnim[side]={t0:performance.now(),sk:sk||'nuke',cols,rocks,lv:(window.DMG&&window.DMG[side])||1};
};

// 정교한 다중 지각 단층 트리 생성기 (장기판 외곽에서 내부로 파고드는 현실적 균열 패턴)
function buildTectonicCanyons(xMin,bw,yEdge,dir,bh,C,lv,side){
  let sd=side==='c'?73856093:19349663;
  const rn=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;
  const canyons=[];

  // 1) 메인 대단층 (외곽 테두리를 쪼개고 진영 내부로 깊이 파고드는 주 협곡)
  const mainPts=[];
  const steps=16+lv*2;
  const cx=xMin+bw*(side==='c'?0.24:0.76);
  const cy=yEdge-dir*C*0.20;
  const tx=xMin+bw*(side==='c'?0.76:0.24);
  const ty=yEdge+dir*bh*(0.56+lv*0.075);
  for(let i=0;i<=steps;i++){
    const u=i/steps;
    const envelope=Math.sin(Math.pow(u,0.85)*Math.PI);
    const jx=(i===0||i===steps)?0:(rn()-0.5)*C*(0.24+lv*0.035);
    const jy=(i===0||i===steps)?0:(rn()-0.5)*C*0.14;
    const wMul=(0.32+0.68*envelope)*(0.80+0.32*rn())*(0.58+lv*0.18);
    mainPts.push({
      x:cx+(tx-cx)*u+jx,
      y:cy+(ty-cy)*u+jy,
      w:C*(0.095+0.105*wMul)
    });
  }
  canyons.push(mainPts);

  // 2) Lv2 이상: 주 단층에서 갈라져 나오는 Y자 지각 분기 단층
  if(lv>=2){
    const branchPts=[];
    const bSteps=11;
    const mid=mainPts[Math.floor(mainPts.length*0.40)];
    const bx1=xMin+bw*(side==='c'?0.13:0.87);
    const by1=yEdge+dir*bh*(0.66+lv*0.045);
    for(let i=0;i<=bSteps;i++){
      const u=i/bSteps;
      const wMul=Math.pow(1-u*0.78,0.82)*(0.52+lv*0.15);
      branchPts.push({
        x:mid.x+(bx1-mid.x)*u+(i>0?(rn()-0.5)*C*0.20:0),
        y:mid.y+(by1-mid.y)*u+(i>0?(rn()-0.5)*C*0.13:0),
        w:C*(0.072+0.075*wMul)
      });
    }
    canyons.push(branchPts);
  }

  // 3) Lv3~4: 반대편 외곽 절벽까지 쪼개는 3차 단층
  if(lv>=3){
    const subPts=[];
    const sSteps=10;
    const p0=mainPts[Math.floor(mainPts.length*0.62)];
    const sx1=side==='c'?(xMin+bw+C*0.16):(xMin-C*0.16);
    const sy1=yEdge+dir*bh*0.42;
    for(let i=0;i<=sSteps;i++){
      const u=i/sSteps;
      subPts.push({
        x:p0.x+(sx1-p0.x)*u+(i>0?(rn()-0.5)*C*0.16:0),
        y:p0.y+(sy1-p0.y)*u+(i>0?(rn()-0.5)*C*0.12:0),
        w:C*0.095*(1-u*0.42)*(0.72+lv*0.12)
      });
    }
    canyons.push(subPts);
  }
  return canyons;
}

// 장기판 상판이 단층을 경계로 좌우로 물리적 유격(Plate Separation & Subtle Tilt)을 일으키는 효과
window.jgDrawBoardSplitPlates=function(g,drawRawBoardImg,st){
  const mat=getMatProfile();
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

    let animBoost=0;
    const spAnim=window.jgSplitAnim&&window.jgSplitAnim[side];
    if(spAnim){
      const dt=(performance.now()-spAnim.t0)*0.001;
      if(dt>=0&&dt<2.4)animBoost=Math.sin(Math.min(1,dt/0.16)*Math.PI*0.5)*Math.exp(-dt*1.6)*C*0.075;
    }
    // 기물 좌표 착시를 유발하지 않는 최적의 현실적 벌어짐 간격 (2px ~ 5.5px)
    const shiftPx=C*(0.022+lv*0.015)+animBoost;

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
      g.translate(plateSign * shiftPx, dir * shiftPx * 0.25);
      drawRawBoardImg(g);
      g.restore();
    }

    // 장기판 외곽 테두리가 단층에 의해 실제로 끊어지고 어긋난 3D 절단면(Split Rim Gap)
    const pEdge=mainPts[0];
    const gapW=pEdge.w*1.18+shiftPx*1.7;
    g.save();
    g.fillStyle=mat.abyss;
    g.beginPath();
    g.rect(pEdge.x - gapW, yEdge - C*0.13, gapW*2, C*0.26);
    g.fill();

    for(const sgn of [-1, 1]){
      const rx = pEdge.x + sgn * gapW;
      g.fillStyle = sgn < 0 ? mat.midStrata1 : mat.deepRock;
      g.beginPath();
      g.moveTo(rx, yEdge - C*0.10);
      g.lineTo(rx + sgn*C*0.085, yEdge - C*0.065);
      g.lineTo(rx + sgn*C*0.065, yEdge + C*0.10);
      g.lineTo(rx, yEdge + C*0.085);
      g.closePath();
      g.fill();
      g.strokeStyle = mat.topRim;
      g.lineWidth = 0.9;
      g.stroke();
    }
    g.restore();
  });
};

// 재질 결을 따라 자연스럽게 갈라지는 다중 미세 잔균열(Micro-Fracture Tree)
function drawFineRockFractures(g, originX, originY, baseAng, len, depth, rn, mat){
  if(depth <= 0 || len < 4) return;
  let px = originX, py = originY, ang = baseAng;
  const segs = 3 + depth;
  const step = len / segs;

  g.save();
  g.lineCap = 'round';
  for(let s=0; s<segs; s++){
    const u = s / segs;
    // 사암/빙하/목재 결에 따른 자연스러운 굴절각
    const kink = mat.specType==='glacier' ? 0.58 : mat.specType==='hardwood' ? 0.26 : 0.42;
    ang += (rn() - 0.5) * kink;
    const nx = px + Math.cos(ang) * step * (0.75 + 0.45 * rn());
    const ny = py + Math.sin(ang) * step * (0.75 + 0.45 * rn());
    const clear = getIntersectionClearance((px+nx)*0.5, (py+ny)*0.5);
    const w = Math.max(0.45, (depth * 0.78) * (1 - u * 0.65));

    g.globalAlpha = 0.35 + 0.65 * clear;
    // 우하단 0.7px 입체 베벨 하이라이트
    g.strokeStyle = mat.striationLight;
    g.lineWidth = w;
    g.beginPath(); g.moveTo(px+0.75, py+0.75); g.lineTo(nx+0.75, ny+0.75); g.stroke();

    // 깊은 균열 실금 본체
    g.strokeStyle = mat.abyss;
    g.lineWidth = w * 1.08;
    g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();

    px = nx; py = ny;
    if(s === 1 && depth > 1 && rn() < 0.68){
      drawFineRockFractures(g, px, py, ang + (rn()<0.5?1:-1)*(0.42+0.38*rn()), len*0.56, depth-1, rn, mat);
    }
  }
  g.restore();
}

function drawCampDamage(g,side,lv,debrisOnly){
  if(!lv||lv<=0)return;
  const mat=getMatProfile();
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

  let animBoost=0;
  const spAnim=window.jgSplitAnim&&window.jgSplitAnim[side];
  if(spAnim){
    const dt=(performance.now()-spAnim.t0)*0.001;
    if(dt>=0&&dt<2.4)animBoost=Math.sin(Math.min(1,dt/0.16)*Math.PI*0.5)*Math.exp(-dt*1.6)*C*0.065;
  }
  const splitExtra=C*(0.015+lv*0.012)+animBoost;

  if(!debrisOnly){
    g.save();
    g.beginPath();g.rect(xMin-CX*.55,yMin,bw+CX*1.1,yMax-yMin);g.clip();

    // 1. 고밀도 5단 입체 지각 단층 협곡(Multi-Strata Tectonic Chasm) 렌더링
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
        const w = p.w + (cIdx===0 ? splitExtra : splitExtra*0.45);

        const jagL = 0.80 + 0.38 * rn();
        const jagR = 0.80 + 0.38 * rn();
        leftRim.push([p.x + nx*w*jagL, p.y + ny*w*jagL]);
        rightRim.unshift([p.x - nx*w*jagR, p.y - ny*w*jagR]);

        // 1단 상부 쪼개진 단면 (전장 고유 암석/목재/빙하 속살)
        step1L.push([p.x + nx*w*jagL*0.74, p.y + ny*w*jagL*0.74 + dir*C*0.030]);
        step1R.unshift([p.x - nx*w*jagR*0.74, p.y - ny*w*jagR*0.74 + dir*C*0.030]);

        // 2단 중부 층리 절벽
        step2L.push([p.x + nx*w*jagL*0.46, p.y + ny*w*jagL*0.46 + dir*C*0.064]);
        step2R.unshift([p.x - nx*w*jagR*0.46, p.y - ny*w*jagR*0.46 + dir*C*0.064]);

        // 3단 최심부 심연 크레바스
        abyssL.push([p.x + nx*w*0.22, p.y + ny*w*0.22 + dir*C*0.092]);
        abyssR.unshift([p.x - nx*w*0.22, p.y - ny*w*0.22 + dir*C*0.092]);
      }

      const polyRim = leftRim.concat(rightRim);
      const polyStep1 = step1L.concat(step1R);
      const polyStep2 = step2L.concat(step2R);
      const polyAbyss = abyssL.concat(abyssR);

      // (A) 단층 외곽 앰비언트 오클루전(AO) 그림자
      g.save();
      g.shadowColor='rgba(0,0,0,0.85)';
      g.shadowBlur=Math.max(7, C*0.20);
      g.fillStyle=mat.midStrata1;
      g.beginPath();polyRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      g.restore();

      // (B) 1단 파쇄 절벽면 (재질별 그라데이션)
      const cliffGrad = g.createLinearGradient(xMin, yEdge, xMax, yEdge + dir*bh*0.7);
      cliffGrad.addColorStop(0, mat.topRim);
      cliffGrad.addColorStop(0.35, mat.midStrata1);
      cliffGrad.addColorStop(1, mat.midStrata2);
      g.fillStyle = cliffGrad;
      g.beginPath();polyRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

      // (C) 2단 깊은 암반 단층
      g.fillStyle = mat.midStrata2;
      g.beginPath();polyStep1.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

      // (D) 수직 절벽 층리 해칭 (입체 암석/목재 결 표현)
      g.strokeStyle = mat.striationLight;
      g.lineWidth = 0.85;
      g.beginPath();
      for(let i=0; i<leftRim.length; i++){
        g.moveTo(leftRim[i][0], leftRim[i][1]);
        g.lineTo(step2L[i][0], step2L[i][1]);
        const rIdx = rightRim.length - 1 - i;
        g.moveTo(rightRim[rIdx][0], rightRim[rIdx][1]);
        g.lineTo(step2R[rIdx][0], step2R[rIdx][1]);
      }
      g.stroke();

      g.strokeStyle = mat.striationDark;
      g.lineWidth = 1.05;
      g.beginPath();
      for(let i=0; i<step1L.length; i+=2){
        g.moveTo(step1L[i][0], step1L[i][1]);
        g.lineTo(abyssL[i][0], abyssL[i][1]);
      }
      g.stroke();

      // (E) 3단 & 최심부 심연 바닥
      g.fillStyle = mat.deepRock;
      g.beginPath();polyStep2.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      g.fillStyle = mat.abyss;
      g.beginPath();polyAbyss.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

      // (F) 심연 바닥의 은은한 속성 에너지 광맥 (암석 브릿지에 끊겨 보이며 과한 눈부심 방지)
      const coreCol=lastSk==='kame'||lastSk==='kame2'?'#00e5ff':lastSk==='alien'?'#76ff03':lastSk==='hammer'?'#80d8ff':mat.veinCore;
      g.save();
      g.strokeStyle=coreCol;
      g.shadowColor=coreCol;g.shadowBlur=5;
      g.globalAlpha=0.62;
      g.lineWidth=Math.max(1.3,C*(0.024+lv*0.007)*(cIdx===0?1:0.65));
      g.setLineDash([C*0.20, C*0.12, C*0.07, C*0.15]);
      g.beginPath();
      pts.forEach((p,i)=>i?g.lineTo(p.x,p.y+dir*C*0.06):g.moveTo(p.x,p.y+dir*C*0.06));
      g.stroke();
      g.restore();

      // (G) 쪼개진 상판 테두리의 날카로운 3D 베벨 하이라이트 & 반대편 음영
      g.strokeStyle = mat.topRim;
      g.lineWidth = Math.max(1.2, C*0.028);
      g.beginPath();
      leftRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      g.stroke();

      g.strokeStyle = mat.abyss;
      g.lineWidth = Math.max(1.3, C*0.032);
      g.beginPath();
      rightRim.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      g.stroke();

      // (H) 단층 양옆으로 뻗어나가는 미세 잔균열 트리
      for(let i=1; i<pts.length-1; i+=2){
        const [nx, ny] = normals[i];
        const sideSgn = (i % 4 === 1) ? 1 : -1;
        const baseX = sideSgn > 0 ? leftRim[i][0] : rightRim[pts.length - 1 - i][0];
        const baseY = sideSgn > 0 ? leftRim[i][1] : rightRim[pts.length - 1 - i][1];
        const outAng = Math.atan2(ny * sideSgn, nx * sideSgn) + (rn() - 0.5) * 0.48;
        drawFineRockFractures(g, baseX, baseY, outAng, C * (0.26 + 0.24 * rn()) * (0.8 + lv * 0.1), 2, rn, mat);
      }
    });

    // 2. 응징 스킬별 맞춤형 3D 크레이터 & 물리 파괴흔
    const activeHits=dsk.length?dsk:[
      {sk:'nuke',lv:1,fx:0.28,fy:0.26,rot:0.1},
      ...(lv>=2?[{sk:'meteor',lv:2,fx:0.72,fy:0.34,rot:-0.2}]:[]),
      ...(lv>=3?[{sk:'kame2',lv:3,fx:0.48,fy:0.52,rot:0.15}]:[]),
      ...(lv>=4?[{sk:'fist',lv:4,fx:0.35,fy:0.62,rot:-0.12}]:[])
    ];

    activeHits.forEach((hit,hIdx)=>{
      const cx=xMin+bw*hit.fx,cy=yEdge+dir*bh*hit.fy;
      const sk=hit.sk;
      const clear=getIntersectionClearance(cx,cy);
      g.save();
      // 기물 교차점 위에서는 투명도를 자동 낮춰 기물 식별성 최우선 보장
      g.globalAlpha = 0.55 + 0.45 * clear;

      // 방사형 미세 균열망
      const rayCnt = sk==='gun' ? 5 : sk==='hammer' ? 10 : 8;
      for(let r=0; r<rayCnt; r++){
        const a = (r / rayCnt) * Math.PI * 2 + (rn() - 0.5) * 0.38;
        const rStart = C * (sk==='gun' ? 0.13 : 0.32);
        drawFineRockFractures(g, cx + Math.cos(a)*rStart, cy + Math.sin(a)*rStart, a, C*(0.28 + 0.26*rn()), 2, rn, mat);
      }

      if(sk==='kame'||sk==='kame2'){
        // 에네르기파: 초고열 플라즈마에 녹아 유리화된 협곡(Vitrified Plasma Trench)
        g.translate(cx,cy);g.rotate(hit.rot||-0.25);
        const len=C*(1.95+lv*0.22),th=C*(0.28+lv*0.035);
        const sg=g.createRadialGradient(0,0,th*0.2,0,0,len*0.54);
        sg.addColorStop(0,'rgba(4,14,28,0.82)');
        sg.addColorStop(0.6,'rgba(8,26,46,0.40)');
        sg.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=sg;
        g.beginPath();g.ellipse(0,0,len*0.56,th*1.30,0,0,7);g.fill();

        const tPts=16,outerT=[],innerT=[];
        for(let i=0;i<tPts;i++){
          const a=(i/tPts)*Math.PI*2;
          const j=0.82+0.30*rn();
          outerT.push([Math.cos(a)*len*0.46*j, Math.sin(a)*th*0.62*j]);
          innerT.push([Math.cos(a)*len*0.34*j, Math.sin(a)*th*0.36*j + dir*C*0.028]);
        }
        g.fillStyle=mat.midStrata1;
        g.beginPath();outerT.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
        g.strokeStyle='rgba(190,248,255,0.72)';g.lineWidth=1.2;g.stroke();

        g.fillStyle='#041224';
        g.beginPath();innerT.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

        g.strokeStyle='#00e5ff';g.lineWidth=1.6;g.globalAlpha*=0.78;
        g.beginPath();g.moveTo(-len*0.30,0);g.lineTo(len*0.30,0);g.stroke();
      }else if(sk==='gun'){
        // 권총 사격: 정교한 3D 철갑탄 관통공 군집 + 화약 그을음
        for(let b=0;b<4;b++){
          const bx=cx+Math.cos(b*1.6+hIdx)*C*0.40*(b===0?0:1);
          const by=cy+Math.sin(b*1.9+hIdx)*C*0.30*(b===0?0:1);
          const br=C*(b===0?0.15:0.11);
          const bg=g.createRadialGradient(bx,by,br*0.2,bx,by,br*2.0);
          bg.addColorStop(0,mat.scorchInner);
          bg.addColorStop(0.55,mat.scorchOuter);
          bg.addColorStop(1,'rgba(0,0,0,0)');
          g.fillStyle=bg;g.beginPath();g.arc(bx,by,br*2.0,0,7);g.fill();

          g.fillStyle=mat.midStrata1;
          g.strokeStyle=mat.topRim;
          g.lineWidth=1.05;
          g.beginPath();
          for(let k=0;k<10;k++){
            const a=(k/10)*Math.PI*2, rr=br*(0.9+0.34*rn());
            k===0?g.moveTo(bx+Math.cos(a)*rr,by+Math.sin(a)*rr):g.lineTo(bx+Math.cos(a)*rr,by+Math.sin(a)*rr);
          }
          g.closePath();g.fill();g.stroke();

          g.fillStyle=mat.abyss;
          g.beginPath();g.arc(bx,by+dir*C*0.02,br*0.62,0,7);g.fill();
        }
      }else{
        // 핵폭탄 / 메테오 / 주먹 / 해머 / 외계인: 4단 입체 함몰 크레이터
        const rx=C*(0.52+lv*0.055),ry=C*(0.40+lv*0.045);
        const scorchG=g.createRadialGradient(cx,cy,rx*0.2,cx,cy,rx*1.50);
        scorchG.addColorStop(0,mat.scorchInner);
        scorchG.addColorStop(0.55,mat.scorchOuter);
        scorchG.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=scorchG;
        g.beginPath();g.ellipse(cx,cy,rx*1.50,ry*1.50,0,0,7);g.fill();

        const pts=20,outer=[],mid1=[],mid2=[],deep=[];
        for(let i=0;i<pts;i++){
          const a=(i/pts)*Math.PI*2;
          const j1=0.78+rn()*0.32, j2=0.58+rn()*0.26, j3=0.38+rn()*0.20, j4=0.20+rn()*0.15;
          outer.push([cx+Math.cos(a)*rx*j1, cy+Math.sin(a)*ry*j1]);
          mid1.push([cx+Math.cos(a)*rx*j2, cy+Math.sin(a)*ry*j2+dir*C*0.026]);
          mid2.push([cx+Math.cos(a)*rx*j3, cy+Math.sin(a)*ry*j3+dir*C*0.052]);
          deep.push([cx+Math.cos(a)*rx*j4, cy+Math.sin(a)*ry*j4+dir*C*0.078]);
        }

        // 1단 외곽 함몰 단턱
        g.fillStyle=mat.midStrata1;
        g.beginPath();outer.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
        g.strokeStyle=mat.topRim;g.lineWidth=1.2;g.stroke();

        // 2단 중단 파쇄 암석층
        g.fillStyle=mat.midStrata2;
        g.beginPath();mid1.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

        // 경사면 층리 해칭
        g.strokeStyle=mat.striationDark;g.lineWidth=0.85;
        g.beginPath();
        for(let i=0;i<pts;i++){
          g.moveTo(outer[i][0],outer[i][1]);g.lineTo(mid2[i][0],mid2[i][1]);
        }
        g.stroke();

        // 3단 심부 암반층
        g.fillStyle=mat.deepRock;
        g.beginPath();mid2.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();

        // 4단 최심부 코어 (스킬 속성별 잔류 에너지)
        const cCol = sk==='alien'?'#00e676':sk==='hammer'?'#80d8ff':sk==='fist'?'#ff5252':mat.veinCore;
        const lg=g.createRadialGradient(cx,cy+dir*C*.065,1,cx,cy+dir*C*.065,rx*0.34);
        lg.addColorStop(0,cCol);
        lg.addColorStop(0.55,mat.deepRock);
        lg.addColorStop(1,mat.abyss);
        g.fillStyle=lg;
        g.beginPath();deep.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      }
      g.restore();
    });

    // 3. 장기판 외곽 모서리가 충격으로 쪼개져 나간 입체 절벽 파손 (Lv2~4)
    if(lv>=2){
      const notches=[
        {x:xMin-C*.04,y:yEdge-dir*C*.04,rx:C*(0.38+lv*0.14),ry:C*(0.28+lv*0.11)},
        {x:xMin+bw*0.76,y:yEdge-dir*C*.04,rx:C*(0.44+lv*0.16),ry:C*(0.28+lv*0.12)},
        ...(lv>=3?[
          {x:xMax+C*.04,y:yEdge+dir*bh*0.28,rx:C*(0.35+lv*0.13),ry:C*(0.44+lv*0.14)}
        ]:[]),
        ...(lv>=4?[
          {x:xMin-C*.04,y:yEdge+dir*bh*0.42,rx:C*0.68,ry:C*0.62}
        ]:[])
      ];
      notches.forEach(n=>{
        const pts=14,poly=[];
        for(let i=0;i<pts;i++){
          const a=(i/pts)*Math.PI*2,rad=0.58+rn()*0.46;
          poly.push([n.x+Math.cos(a)*n.rx*rad,n.y+Math.sin(a)*n.ry*rad]);
        }
        g.fillStyle=mat.midStrata1;
        g.beginPath();poly.forEach(([px,py],i)=>{const wy=py+dir*C*.085;if(i===0)g.moveTo(px,wy);else g.lineTo(px,wy)});g.closePath();g.fill();
        g.strokeStyle=mat.topRim;g.lineWidth=1.15;g.stroke();
        g.fillStyle=mat.midStrata2;
        g.beginPath();poly.forEach(([px,py],i)=>{const wy=py+dir*C*.042;if(i===0)g.moveTo(px,wy);else g.lineTo(px,wy)});g.closePath();g.fill();
        g.fillStyle=mat.abyss;
        g.beginPath();poly.forEach(([px,py],i)=>{if(i===0)g.moveTo(px,py);else g.lineTo(px,py)});g.closePath();g.fill();
      });
    }
    g.restore();
  }else{
    // 기물 교차점 반경 0.36칸 이내를 100% 회피해 배치되는 3D 입체 파편(Chip & Splinter)
    g.save();
    const chipCnt=lv===1?10:lv===2?18:lv===3?26:34;
    for(let i=0;i<chipCnt;i++){
      const cx=xMin+bw*(0.05+rn()*0.90),cy=yEdge+dir*bh*(0.04+rn()*0.82);
      const gx=(cx-OX)/CX,gy=(cy-OY)/CY;
      if(Math.hypot(gx-Math.round(gx),gy-Math.round(gy))<0.36)continue;
      const ang=rn()*Math.PI*2;
      const isSplinter=(i%3===0);
      const len=C*(isSplinter?(0.08+rn()*0.13):(0.055+rn()*0.095))*(0.8+lv*0.07);
      const th=len*(isSplinter?(0.22+rn()*0.14):(0.42+rn()*0.28));

      g.save();g.translate(cx,cy);g.rotate(ang);
      // 파편 투영 그림자
      g.fillStyle='rgba(4,2,1,0.52)';
      g.beginPath();
      g.moveTo(-len/2+1.6,-th*.3+2.0);g.lineTo(len*.45+1.6,-th/2+2.0);g.lineTo(len/2+1.6,th*.25+2.0);g.lineTo(-len*.35+1.6,th/2+2.0);
      g.closePath();g.fill();
      // 파편 상단 재질면
      g.fillStyle=mat.chipCols[i%mat.chipCols.length];
      g.strokeStyle=mat.abyss;g.lineWidth=0.75;
      g.beginPath();
      g.moveTo(-len/2,-th*.3);g.lineTo(len*.45,-th/2);g.lineTo(len/2,th*.25);g.lineTo(-len*.35,th/2);
      g.closePath();g.fill();g.stroke();
      // 파편 상부 하이라이트 엣지
      g.strokeStyle=mat.topRim;g.lineWidth=0.65;
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

/* ==== 실시간 갈라진 장기판 단층 심연 광맥 호흡 & 열기 아지랑이·분열 쇼크웨이브 ==== */
window.jgDrawBoardLiveCracks=function(g,now){
  const t=now*0.001;
  const mat=getMatProfile();
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
      const pulse=0.5+0.5*Math.sin(t*3.0+(side==='c'?0:2.1));
      const glowCol=lastSk==='kame'||lastSk==='kame2'?'#00e5ff':lastSk==='alien'?'#76ff03':lastSk==='hammer'?'#80d8ff':mat.veinCore;
      g.save();
      g.globalCompositeOperation='lighter';
      canyons.forEach((pts,ci)=>{
        g.strokeStyle=glowCol;
        g.globalAlpha=(0.10+0.11*pulse)*(ci===0?1:0.60);
        g.lineWidth=Math.max(1.4,C*(0.032+0.010*pulse));
        g.setLineDash([C*0.18, C*0.14]);
        g.beginPath();
        pts.forEach((p,i)=>i?g.lineTo(p.x,p.y+dir*C*0.06):g.moveTo(p.x,p.y+dir*C*0.06));
        g.stroke();

        // 단층 틈새에서 피어오르는 은은한 열기/냉기 연기 입자 (플레이 방해 없는 초경량 연출)
        if(ci===0 && lv>=2){
          for(let k=2; k<pts.length-2; k+=3){
            const p=pts[k];
            const phase=(t*0.55 + k*0.37) % 1;
            const sy=p.y + dir*C*0.04 - phase*C*0.42;
            const sx=p.x + Math.sin(t*2.2 + k)*C*0.06;
            const sr=C*(0.04 + 0.08*phase);
            g.globalAlpha=(1-phase)*0.11;
            g.fillStyle=mat.veinGlow;
            g.beginPath();g.arc(sx,sy,sr,0,7);g.fill();
          }
        }
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
        g.shadowColor=spAnim.cols[1];g.shadowBlur=12;
        g.globalAlpha=Math.min(0.80,fade*1.05);
        g.lineWidth=C*(0.14*(1-u*0.7));
        g.beginPath();
        canyons[0].forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));
        g.stroke();
      }
      spAnim.rocks.forEach(rk=>{
        const rx=xMin+bw*rk.fx+rk.vx*C*2.0*dt;
        const ry=yEdge+dir*bh*rk.fy+(rk.vy*dt+0.95*dt*dt)*C*2.0;
        const sz=C*rk.sz*(1-u*0.42);
        const asp=rk.aspect||1;
        g.save();
        g.globalCompositeOperation='source-over';
        g.globalAlpha=Math.max(0,fade*0.86);
        g.translate(rx,ry);g.rotate(rk.rot+rk.vr*dt);
        g.fillStyle=rk.col;g.strokeStyle=mat.abyss;g.lineWidth=0.9;
        g.beginPath();
        g.moveTo(-sz*asp,-sz*0.45);g.lineTo(sz*0.8*asp,-sz*0.65);g.lineTo(sz*asp,sz*0.55);g.lineTo(-sz*0.7*asp,sz*0.75);
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
