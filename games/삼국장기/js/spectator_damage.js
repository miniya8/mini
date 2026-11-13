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
