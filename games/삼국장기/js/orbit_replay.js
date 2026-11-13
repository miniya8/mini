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
