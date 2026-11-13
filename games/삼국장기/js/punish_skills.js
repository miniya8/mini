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
const AL_IM={};
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
const KM_IM={};
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
const SC_IM={};
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
