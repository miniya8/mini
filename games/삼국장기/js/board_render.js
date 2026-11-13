/* ---------- 그리기 ---------- */
function spr(s,key,fr,x,y,o={}){const arr=SP[s.s][s.t][key];if(!arr||!arr.length)return;const f=arr[Math.floor(fr)%arr.length||0];if(!f||!f.im.complete)return;const k=(key=='token'?C*(s.t=='P'||s.t=='G'?.64:s.t=='K'?.88:.76)/Math.max(f.w,f.h):C/115*(s.t=='K'?1.16:1))*(o.sc||1),w=f.w*k,h=f.h*k;cx2.save();cx2.globalAlpha=o.a==null?1:Math.max(0,Math.min(1,o.a));cx2.translate(x+(o.dx||0),(o.feet?y+C*.45:y)+(o.dy||0));if(o.rot)cx2.rotate(o.rot);if(o.fl)cx2.scale(-1,1);cx2.drawImage(f.im,-w/2,o.feet?-h:-h/2,w,h);cx2.restore()}

const BOARD_IMGS=BOARD_THEMES.map(b=>{const im=new Image();im.onload=()=>{rzK='';try{resize()}catch(e){}};im.src=b.src;return im});
window.curBoardIdx=Math.floor(Math.random()*BOARD_THEMES.length);
window.pickRandomBoard=function(idx){
  const prev=window.curBoardIdx;
  if(typeof idx==='number'&&idx>=0&&idx<BOARD_THEMES.length){
    window.curBoardIdx=idx;
  }else{
    let next=Math.floor(Math.random()*BOARD_THEMES.length);
    if(BOARD_THEMES.length>1&&next===prev)next=(next+1+Math.floor(Math.random()*(BOARD_THEMES.length-1)))%BOARD_THEMES.length;
    window.curBoardIdx=next;
  }
  rzK='';try{resize()}catch(e){}
  return window.curBoardIdx;
};
const getBoardImg=()=>BOARD_IMGS[window.curBoardIdx||0]||BOARD_IMGS[0];
const BOARD_STYLE_META=[
  {
    key:'desert', name:'🏜️ 황토 사막 전장', trait:'모래폭풍 · 태양 신기루',
    bg:'#241508', vig:'rgba(32,15,4,0.58)',
    tintTop:'rgba(255,175,55,0.14)', tintBot:'rgba(215,95,25,0.16)',
    bevel:'rgba(255,228,135,0.52)', line:'#3b1904', glow:'rgba(255,165,30,0.35)',
    borderOuter:'#592506', borderInner:'#ffb74d', star:'#ffe082',
    slabEdge:'#8c541d', slabDeep:'#2b1304'
  },
  {
    key:'snow', name:'❄️ 설원 얼음성 전장', trait:'빙결 눈보라 · 한기 결정',
    bg:'#0a1929', vig:'rgba(4,16,32,0.60)',
    tintTop:'rgba(120,225,255,0.16)', tintBot:'rgba(180,240,255,0.14)',
    bevel:'rgba(230,252,255,0.68)', line:'#07284a', glow:'rgba(0,229,255,0.42)',
    borderOuter:'#0b3c68', borderInner:'#80d8ff', star:'#e0f7fa',
    slabEdge:'#5c8db8', slabDeep:'#091e36'
  },
  {
    key:'forest', name:'🌲 고대 숲 유적 전장', trait:'정령 반딧불 · 신목 룬',
    bg:'#0b1c10', vig:'rgba(4,18,8,0.60)',
    tintTop:'rgba(60,220,115,0.14)', tintBot:'rgba(140,215,60,0.14)',
    bevel:'rgba(185,255,168,0.48)', line:'#0d2912', glow:'rgba(105,240,174,0.38)',
    borderOuter:'#163d1e', borderInner:'#69f0ae', star:'#b9f6ca',
    slabEdge:'#4e6b48', slabDeep:'#112414'
  },
  {
    key:'dark', name:'🏯 암흑 성채 전장', trait:'심연 용암 · 흑뢰 마기',
    bg:'#120717', vig:'rgba(8,2,14,0.68)',
    tintTop:'rgba(185,30,255,0.14)', tintBot:'rgba(255,35,65,0.16)',
    bevel:'rgba(255,120,180,0.45)', line:'#1b0416', glow:'rgba(255,23,68,0.45)',
    borderOuter:'#2c061f', borderInner:'#ff4081', star:'#ff80ab',
    slabEdge:'#4a2342', slabDeep:'#120517'
  },
  {
    key:'classic', name:'⚔️ 삼국지 고성 전장', trait:'초한 패왕기 · 황룡 인장',
    bg:'#16100b', vig:'rgba(8,6,14,0.55)',
    tintTop:'rgba(0,195,175,0.12)', tintBot:'rgba(235,55,35,0.14)',
    bevel:'rgba(255,222,145,0.48)', line:'#221105', glow:'rgba(255,195,65,0.35)',
    borderOuter:'#381a08', borderInner:'#ffd54a', star:'#ffe082',
    slabEdge:'#7a4f2a', slabDeep:'#241205'
  }
];
window.getBoardMeta=()=>BOARD_STYLE_META[window.curBoardIdx||0]||BOARD_STYLE_META[0];

function drawPalaceEmblem(g,cx,cy,r,bIdx,isTop){
  // 장기판 내부 한문 및 이질적인 문양 제거 (깔끔한 정통 격자 유지)
}

function drawBoardTerrainProps(g, bIdx){
  if(!CX||!CY)return;
  const gw=8*CX, gh=9*CY;
  // 장기판 중앙(초하한계) 그림을 모두 제거하고 외곽 네 모서리에만 전장 장식 배치
  const corners = [
    [OX - CX*0.34, OY - CY*0.28, -1, -1],
    [OX + gw + CX*0.34, OY - CY*0.28, 1, -1],
    [OX - CX*0.34, OY + gh + CY*0.28, -1, 1],
    [OX + gw + CX*0.34, OY + gh + CY*0.28, 1, 1]
  ];
  g.save();
  if(bIdx === 0){
    for(const [cx, cy, sx, sy] of corners){
      g.save(); g.translate(cx, cy);
      g.fillStyle = 'rgba(20, 8, 2, 0.5)';
      g.beginPath(); g.ellipse(3, 8, C*0.28, C*0.12, 0, 0, 7); g.fill();
      const obG = g.createLinearGradient(-C*0.14, -C*0.42, C*0.14, C*0.10);
      obG.addColorStop(0, '#ffe082'); obG.addColorStop(0.5, '#d99b38'); obG.addColorStop(1, '#6e420c');
      g.fillStyle = obG; g.strokeStyle = '#3b1904'; g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(0, -C*0.46); g.lineTo(C*0.14, -C*0.28); g.lineTo(C*0.17, C*0.08);
      g.lineTo(-C*0.17, C*0.08); g.lineTo(-C*0.14, -C*0.28); g.closePath();
      g.fill(); g.stroke();
      g.restore();
    }
  } else if(bIdx === 1){
    for(const [cx, cy] of corners){
      g.save(); g.translate(cx, cy);
      g.fillStyle = 'rgba(4, 24, 48, 0.5)';
      g.beginPath(); g.ellipse(0, 7, C*0.30, C*0.13, 0, 0, 7); g.fill();
      for(const [ox, oy, sc, rot] of [[-C*0.10, 2, 0.70, -0.22], [C*0.10, 3, 0.75, 0.24], [0, 0, 0.95, 0]]){
        g.save(); g.translate(ox, oy); g.rotate(rot); g.scale(sc, sc);
        const cg = g.createLinearGradient(-C*0.12, -C*0.44, C*0.12, C*0.08);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.45, '#80d8ff'); cg.addColorStop(1, '#0277bd');
        g.fillStyle = cg; g.strokeStyle = '#e0f7fa'; g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(0, -C*0.48); g.lineTo(C*0.13, -C*0.20); g.lineTo(C*0.10, C*0.08);
        g.lineTo(-C*0.10, C*0.08); g.lineTo(-C*0.13, -C*0.20); g.closePath();
        g.fill(); g.stroke();
        g.restore();
      }
      g.restore();
    }
  } else if(bIdx === 2){
    for(const [cx, cy] of corners){
      g.save(); g.translate(cx, cy);
      g.fillStyle = '#2e4c27'; g.strokeStyle = '#13260f'; g.lineWidth = 1.3;
      g.beginPath(); g.ellipse(0, 4, C*0.28, C*0.14, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#789082'; g.strokeStyle = '#26382e'; g.lineWidth = 1.2;
      g.fillRect(-C*0.09, -C*0.28, C*0.18, C*0.28); g.strokeRect(-C*0.09, -C*0.28, C*0.18, C*0.28);
      g.fillStyle = '#69f0ae';
      g.fillRect(-C*0.04, -C*0.22, C*0.08, C*0.10);
      g.fillStyle = '#4e6b58';
      g.beginPath(); g.moveTo(0, -C*0.42); g.lineTo(C*0.19, -C*0.26); g.lineTo(-C*0.19, -C*0.26); g.closePath();
      g.fill(); g.stroke();
      g.restore();
    }
  } else if(bIdx === 3){
    for(const [cx, cy] of corners){
      g.save(); g.translate(cx, cy);
      g.fillStyle = '#1f1024'; g.strokeStyle = '#ff4081'; g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(-C*0.19, C*0.08); g.lineTo(-C*0.12, -C*0.32); g.lineTo(0, -C*0.44);
      g.lineTo(C*0.12, -C*0.32); g.lineTo(C*0.19, C*0.08); g.closePath();
      g.fill(); g.stroke();
      const fg = g.createRadialGradient(0, -C*0.22, 1, 0, -C*0.22, C*0.20);
      fg.addColorStop(0, '#ffffff'); fg.addColorStop(0.4, '#ff1744'); fg.addColorStop(1, 'rgba(170,0,255,0)');
      g.fillStyle = fg;
      g.beginPath(); g.arc(0, -C*0.22, C*0.20, 0, 7); g.fill();
      g.restore();
    }
  } else {
    for(const [cx, cy, sx, sy] of corners){
      g.save(); g.translate(cx, cy);
      const isTopCorner = sy < 0;
      const isChoCorner = flip ? !isTopCorner : isTopCorner;
      g.fillStyle = '#4a3b32'; g.strokeStyle = '#1f140e'; g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(-C*0.21, C*0.10); g.lineTo(-C*0.16, -C*0.22);
      g.lineTo(C*0.16, -C*0.22); g.lineTo(C*0.21, C*0.10); g.closePath();
      g.fill(); g.stroke();
      g.strokeStyle = '#ffd54a'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(0, -C*0.23); g.lineTo(0, -C*0.54); g.stroke();
      g.fillStyle = isChoCorner ? '#00897b' : '#c62828';
      g.beginPath();
      g.moveTo(0, -C*0.52); g.lineTo(sx*C*0.24, -C*0.45); g.lineTo(0, -C*0.36); g.closePath();
      g.fill(); g.stroke();
      g.restore();
    }
  }
  g.restore();
}

function board(g){
  const bIdx=window.curBoardIdx||0;
  const st=BOARD_STYLE_META[bIdx]||BOARD_STYLE_META[0];
  g.fillStyle=st.bg;
  g.fillRect(0,0,W,H);
  const curIm=getBoardImg();
  const gw=8*CX,gh=9*CY;
  const drawRawBoardImg=(ctx)=>{
    if(curIm&&curIm.complete&&curIm.naturalWidth){
      const imW=gw/(678/928),imH=gh/(881/1152);
      const imX=OX-(125/928)*imW;
      ctx.save();
      if(flip){
        const imY=OY-(148/1152)*imH;
        ctx.drawImage(curIm,imX,imY,imW,imH);
      }else{
        const imY=OY-(123/1152)*imH;
        ctx.translate(0,2*imY+imH);
        ctx.scale(1,-1);
        ctx.drawImage(curIm,imX,imY,imW,imH);
      }
      ctx.restore();
    }else{
      const gr=ctx.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#ecc77f');gr.addColorStop(1,'#d09a4c');
      ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    }
  };

  if(curIm&&curIm.complete&&curIm.naturalWidth){
    g.save();
    g.globalAlpha=0.36;
    g.drawImage(curIm,0,0,W,H);
    g.restore();
  }
  drawRawBoardImg(g);

  // 장기판이 파괴 단계(Lv1~4)일 때 실제로 단층을 따라 상판이 좌우/외곽으로 쩍 벌어지는 물리적 유격(Board Split Shift) 표현
  if(window.jgDrawBoardSplitPlates)try{window.jgDrawBoardSplitPlates(g,drawRawBoardImg,st)}catch(e){}

  g.save();
  const bdGrad=g.createLinearGradient(OX,OY,OX,OY+gh);
  bdGrad.addColorStop(0,st.tintTop);
  bdGrad.addColorStop(0.5,'rgba(0,0,0,0)');
  bdGrad.addColorStop(1,st.tintBot);
  g.fillStyle=bdGrad;
  g.fillRect(OX-CX*0.45,OY-CY*0.45,gw+CX*0.9,gh+CY*0.9);
  g.restore();

  const vg=g.createRadialGradient(OX+4*CX,OY+4.5*CY,Math.min(gw,gh)*0.48,OX+4*CX,OY+4.5*CY,Math.max(W,H)*0.78);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,st.vig);
  g.fillStyle=vg;
  g.fillRect(0,0,W,H);

  // 격자선을 먼저 그린 뒤, 그 위로 장기판 파손/균열/구멍이 입체적으로 파고들도록 순서 조정 (깨진 곳에서 격자선도 같이 끊어져 리얼함 극대화)
  g.save();
  g.lineCap='round';
  g.strokeStyle=st.bevel;
  g.shadowColor=st.glow;
  g.shadowBlur=5;
  g.lineWidth=Math.max(2.6,C*.068);
  g.beginPath();
  for(let i=0;i<10;i++){g.moveTo(OX,OY+i*CY+1);g.lineTo(OX+8*CX,OY+i*CY+1)}
  for(let i=0;i<9;i++){g.moveTo(OX+i*CX+1,OY);g.lineTo(OX+i*CX+1,OY+9*CY)}
  for(const y of[0,7]){g.moveTo(OX+3*CX+1,OY+y*CY+1);g.lineTo(OX+5*CX+1,OY+(y+2)*CY+1);g.moveTo(OX+5*CX+1,OY+y*CY+1);g.lineTo(OX+3*CX+1,OY+(y+2)*CY+1)}
  g.stroke();

  g.strokeStyle=st.line;
  g.lineWidth=Math.max(1.8,C*.044);
  g.shadowColor='rgba(0,0,0,0.72)';
  g.shadowBlur=2;
  g.beginPath();
  for(let i=0;i<10;i++){g.moveTo(OX,OY+i*CY);g.lineTo(OX+8*CX,OY+i*CY)}
  for(let i=0;i<9;i++){g.moveTo(OX+i*CX,OY);g.lineTo(OX+i*CX,OY+9*CY)}
  for(const y of[0,7]){g.moveTo(OX+3*CX,OY+y*CY);g.lineTo(OX+5*CX,OY+(y+2)*CY);g.moveTo(OX+5*CX,OY+y*CY);g.lineTo(OX+3*CX,OY+(y+2)*CY)}
  g.stroke();

  g.strokeStyle=st.borderOuter;
  g.lineWidth=Math.max(4.2,C*.105);
  g.strokeRect(OX-C*0.04,OY-C*0.04,gw+C*0.08,gh+C*0.08);
  g.strokeStyle=st.borderInner;
  g.lineWidth=Math.max(1.5,C*.036);
  g.strokeRect(OX-C*0.08,OY-C*0.08,gw+C*0.16,gh+C*0.16);

  const pts=[[0,3],[2,3],[4,3],[6,3],[8,3],[0,6],[2,6],[4,6],[6,6],[8,6],[1,2],[7,2],[1,7],[7,7],[4,1],[4,8]];
  g.fillStyle=st.star;
  g.strokeStyle=st.line;
  g.lineWidth=1.1;
  for(const[px0,py0]of pts){
    const[X,Y]=px(px0,py0),sr=Math.max(2.4,C*0.052);
    g.beginPath();g.arc(X,Y,sr,0,7);g.fill();g.stroke();
  }
  g.restore();

  // 장기판 입체 균열 · 벌어진 단층 협곡 · 크레이터 렌더링
  if(window.jgDrawBoardDamage)try{window.jgDrawBoardDamage(g)}catch(e){}

  // 장기판 외곽 모서리 지형지물
  try{drawBoardTerrainProps(g, bIdx)}catch(e){}
  if(window.jgDrawBoardDebris)try{window.jgDrawBoardDebris(g)}catch(e){}
}
function drawLM(now){const g=cx2,[x0,y0]=px(lm[0],lm[1]),[x1,y1]=px(lm[2],lm[3]),p=B[lm[3]][lm[2]],pu=.5+.5*Math.sin(now/260);g.save();g.lineCap='round';g.lineJoin='round';
/* 출발 칸: 반투명 말(잔상) + 흰 점선 원 */
g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(x0,y0,C*.5,0,7);g.fill();if(p)spr(p,'token',0,x0,y0,{a:.4});
g.setLineDash([C*.15,C*.1]);g.lineWidth=Math.max(2.5,C*.07);g.strokeStyle='#fff';g.shadowColor='#000';g.shadowBlur=5;g.beginPath();g.arc(x0,y0,C*.5,0,7);g.stroke();g.setLineDash([]);g.shadowBlur=0;
/* 이동 화살표 (출발 → 도착) */
const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);if(L>C*1.1){const ux=dx/L,uy=dy/L,ax=x0+ux*C*.56,ay=y0+uy*C*.56,bx=x1-ux*C*.6,by=y1-uy*C*.6,hs=C*.26,nx=-uy,ny=ux;
for(const[w,col]of[[Math.max(6,C*.17),'rgba(0,0,0,.55)'],[Math.max(3,C*.09),'#ffd54a']]){g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();g.beginPath();g.moveTo(bx+ux*hs*1.1,by+uy*hs*1.1);g.lineTo(bx+nx*hs,by+ny*hs);g.lineTo(bx-nx*hs,by-ny*hs);g.closePath();g.fill();g.stroke()}}
/* 도착 칸: 노란 빛나는 링 */
g.fillStyle=`rgba(255,213,74,${.14+.1*pu})`;g.beginPath();g.arc(x1,y1,C*.54,0,7);g.fill();g.strokeStyle='#ffd54a';g.lineWidth=Math.max(3,C*.08);g.shadowColor='#ffd54a';g.shadowBlur=C*(.25+.25*pu);g.beginPath();g.arc(x1,y1,C*.54,0,7);g.stroke();
g.restore()}
const ez=t=>t<0?0:t>1?1:t;
function drawJang(now){const t=(now-jang.t0)/1300;if(t>=1){jang=null;cv.style.transform='';return}const g=cx2,xm=W/2,ym=OY+4.5*CY,R=Math.max(W,H),col=jang.s=='c'?'60,255,190':'255,80,40',e=Math.sin(Math.min(t*1.15,1)*Math.PI);
cv.style.transform=`translate(${(Math.random()-.5)*C*.35*(1-t)}px,${(Math.random()-.5)*C*.35*(1-t)}px)`;
g.save();g.fillStyle=`rgba(0,0,0,${.55*e})`;g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
const gr=g.createRadialGradient(xm,ym,0,xm,ym,R*(.15+.4*t));gr.addColorStop(0,`rgba(${col},${.6*(1-t)})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(0,0,W,H);
for(let i=0;i<3;i++){const r=(t*1.5-i*.16)*R*.55;if(r>0){g.strokeStyle=`rgba(${col},${Math.max(0,1-t-i*.1)})`;g.lineWidth=11-i*3;g.beginPath();g.arc(xm,ym,r,0,7);g.stroke()}}
g.lineWidth=3;for(let i=0;i<28;i++){const a=i/28*6.283+t*.4,r0=C*1.4+t*C*2,r1=r0+R*.45*(.5+Math.sin(i*12.9)*.3);g.strokeStyle=`rgba(255,255,255,${.55*(1-t)})`;g.beginPath();g.moveTo(xm+Math.cos(a)*r0,ym+Math.sin(a)*r0);g.lineTo(xm+Math.cos(a)*r1,ym+Math.sin(a)*r1);g.stroke()}
g.globalCompositeOperation='source-over';
const f=(SP[jang.s][jang.t].atk||[])[0];if(f&&f.im.complete){const k=Math.min(W*.95/f.w,C*7.5/f.h)*(.85+.3*t);g.globalAlpha=Math.min(1,e*1.4)*.9;g.drawImage(f.im,xm-f.w*k/2,ym-f.h*k/2,f.w*k,f.h*k);g.globalAlpha=1}
const pop=1+.5*Math.exp(-t*7)*Math.cos(t*20),tx=jang.mate?'외통!':'장군!';g.translate(xm,ym);g.scale(pop,pop);g.textAlign='center';g.textBaseline='middle';g.font=`900 ${C*2.6}px 'Malgun Gothic',sans-serif`;g.lineJoin='round';g.lineWidth=C*.3;g.strokeStyle='#200';g.shadowColor=`rgb(${col})`;g.shadowBlur=C*1.2;g.strokeText(tx,0,0);
const gg=g.createLinearGradient(0,-C*1.2,0,C*1.2);gg.addColorStop(0,'#fff6b0');gg.addColorStop(.5,'#ffcf30');gg.addColorStop(1,'#ff7a1a');g.fillStyle=gg;g.fillText(tx,0,0);g.shadowBlur=0;g.font=`900 ${C*.95}px serif`;g.fillStyle=`rgb(${col})`;g.fillText(jang.mate?'詰':'將軍',0,-C*2);
g.restore();if(t<.1){g.fillStyle=`rgba(255,255,255,${.7*(1-t/.1)})`;g.fillRect(0,0,W,H)}}
function frame(now){cx2.clearRect(0,0,W,H);cx2.save();cx2.setTransform(1,0,0,1,0,0);cx2.drawImage(bc,0,0);cx2.restore();
if(window.jgDrawBoardLiveCracks)try{window.jgDrawBoardLiveCracks(cx2,now)}catch(e){}
if(window.jgDrawBoardThemeFX)try{window.jgDrawBoardThemeFX(cx2,now)}catch(e){}
if(lm&&!anim)drawLM(now);
for(let y=0;y<10;y++)for(let x=0;x<9;x++){const p=B[y][x];if(!p||(anim&&anim.m[2]==x&&anim.m[3]==y))continue;const[X,Y]=px(x,y),cs=y<=4?'h':'c',dlv=(window.jgDmg&&window.jgDmg(cs))||0, hsh=Math.sin(x*12.9898+y*78.233)*43758.5453,r1=hsh-Math.floor(hsh),r2=(hsh*1.7)-Math.floor(hsh*1.7);if(dlv>0){cx2.save();const hg=cx2.createRadialGradient(X,Y,C*0.12,X,Y,C*0.48);hg.addColorStop(0,'rgba(20,14,8,0.68)');hg.addColorStop(0.75,'rgba(255,220,140,0.22)');hg.addColorStop(1,'rgba(0,0,0,0)');cx2.fillStyle=hg;cx2.beginPath();cx2.arc(X,Y,C*0.48,0,7);cx2.fill();cx2.restore();}spr(p,'token',0,X,Y,dlv>0?{rot:(r1-.5)*.085*dlv,dx:(r1-.5)*C*.035*dlv,dy:(r2-.5)*C*.035*dlv}:{});if(sel&&sel.x==x&&sel.y==y){cx2.strokeStyle='#fff';cx2.lineWidth=3;cx2.beginPath();cx2.arc(X,Y,C*.5,0,7);cx2.stroke()}}
if(sel)for(const m of sel.L){const[X,Y]=px(m[2],m[3]),c=B[m[3]][m[2]];cx2.fillStyle=c?'#ff3b3bcc':'#2ecc71cc';cx2.beginPath();cx2.arc(X,Y,c?C*.3:C*.16,0,7);cx2.fill()}
if(anim){const A=anim,t=now-A.t0,[a,b,c,d]=A.T,p=A.p,q=A.q,[X0,Y0]=px(A.m[0],A.m[1]),[X1,Y1]=px(A.m[2],A.m[3]);
const dx=X1-X0,dy=Y1-Y0,fl=Math.abs(dx)>2?(dx<0):(X1>W*0.55),dirX=fl?-1:1;
const standX=q?Math.max(C*0.6,Math.min(W-C*0.6,X1-dirX*C*0.78)):X1;
const standY=q?(Y1+(Math.abs(dx)<=2?(dy>0?-C*0.18:C*0.18):0)):Y1;
{const pf=p.s=='h'?'f_':'';if(!A.sm&&t>=200){A.sm=1;sfx(pf+SFN[p.t]+'_move')}if(q&&!A.sa&&t>=b){A.sa=1;sfx(pf+SFN[p.t]+'_attack')}}if(q&&!A.sd&&t>=b+250){A.sd=1;sfx((q.s=='h'?'f_':'')+'defeat')}
if(q){
  const qFl=!fl;
  if(t<b){spr(q,'token',0,X1,Y1,{a:1});}
  else if(t<b+A.A*0.55){
    const uh=ez((t-b)/(A.A*0.55)),kb=Math.sin(uh*Math.PI*0.5)*dirX*C*0.28;
    spr(q,'hit',uh*5.99,X1+kb,Y1,{feet:1,fl:qFl,sc:1.08});
  }
  else if(t<d){
    const ud=ez((t-(b+A.A*0.55))/(d-(b+A.A*0.55))),kb=dirX*C*(0.28+0.14*ud);
    spr(q,'dead',ud*7.99,X1+kb,Y1+C*.06,{feet:1,fl:qFl,sc:1.05,a:ud>0.85?1-(ud-0.85)/0.15:1});
  }
}
if(t<a){const u=ez(t/a);spr(p,'xform',u*5.99,X0,Y0,{feet:u>0.35?1:0,fl,sc:1.05});}
else if(t<b){
  const u=ez((t-a)/A.D),e=u*u*(3-2*u),tx=q?standX:X1,ty=q?standY:Y1;
  const x=X0+(tx-X0)*e,y=Y0+(ty-Y0)*e-Math.sin(u*Math.PI*(1+A.dist))*C*.06;
  spr(p,q&&u>.3?'dash':'walk',(t-a)/70,x,y,{feet:1,fl,sc:1.08});
}
else if(t<c){
  const u=ez((t-b)/A.A),lunge=Math.sin(u*Math.PI)*dirX*C*0.14;
  spr(p,'atk',u*7.99,standX+lunge,standY,{feet:1,fl,sc:1.22});
}
else if(t<d){
  const u=ez((t-c)/(d-c)),e=u*u*(3-2*u),rx=standX+(X1-standX)*e,ry=standY+(Y1-standY)*e;
  spr(p,'rev',u*5.99,rx,ry,{feet:u<0.45?1:0,fl,sc:1.05});
}
else fin()}
if(window.jgDrawSpec)try{window.jgDrawSpec(cx2,now)}catch(e){}if(jang)drawJang(now)}
function loop(now){if($('g').style.display!='block'){looping=false;return}try{frame(now)}catch(e){console.error(e)}requestAnimationFrame(loop)}
