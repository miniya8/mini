const VAL={R:13,C:7,N:5,B:3,G:3,P:2,K:0};
let B;
function init(sc,sh){B=[];for(let y=0;y<10;y++)B.push(new Array(9).fill(null));
for(let x=0;x<9;x++){const a=sc[x],b=sh[8-x];if(a!='.')B[9][x]={t:a,s:'c'};if(b!='.')B[0][x]={t:b,s:'h'};if(x%2==0){B[3][x]={t:'P',s:'h'};B[6][x]={t:'P',s:'c'}}}
B[1][4]={t:'K',s:'h'};B[8][4]={t:'K',s:'c'};for(const x of[1,7]){B[2][x]={t:'C',s:'h'};B[7][x]={t:'C',s:'c'}}}
const inB=(x,y)=>x>=0&&x<9&&y>=0&&y<10,inP=(x,y)=>x>=3&&x<=5&&(y<=2||y>=7),sp=(a,b)=>(a<=2)==(b<=2);
const onD=(x,y)=>inP(x,y)&&((x==4&&(y==1||y==8))||((x==3||x==5)&&[0,2,7,9].includes(y)));
const ds=(x,y,dx,dy)=>{const nx=x+dx,ny=y+dy;return onD(x,y)&&inP(nx,ny)&&sp(y,ny)&&onD(nx,ny)?[nx,ny]:null};
const OR=[[1,0],[-1,0],[0,1],[0,-1]],DG=[[1,1],[1,-1],[-1,1],[-1,-1]];
function rays(x,y){const R=[];for(const[dx,dy]of OR){const r=[];let a=x+dx,b=y+dy;while(inB(a,b)){r.push([a,b]);a+=dx;b+=dy}R.push(r)}
for(const[dx,dy]of DG){const r=[];let c=[x,y],n;while(n=ds(c[0],c[1],dx,dy)){r.push(n);c=n}if(r.length)R.push(r)}return R}
function moves(b,x,y){const p=b[y][x],s=p.s,r=[];const add=(a,c)=>{if(!inB(a,c))return false;const q=b[c][a];if(q&&q.s==s)return false;r.push([a,c]);return true};
switch(p.t){
case'R':for(const ry of rays(x,y))for(const[a,c]of ry){if(!b[c][a])add(a,c);else{add(a,c);break}}break;
case'C':for(const ry of rays(x,y)){let i=ry.findIndex(([a,c])=>b[c][a]);if(i<0||b[ry[i][1]][ry[i][0]].t=='C')continue;for(let j=i+1;j<ry.length;j++){const[a,c]=ry[j],q=b[c][a];if(!q)add(a,c);else{if(q.t!='C')add(a,c);break}}}break;
case'N':for(const[a,c]of OR){if(!inB(x+a,y+c)||b[y+c][x+a])continue;for(const k of[-1,1])add(a?x+2*a:x+k,a?y+k:y+2*c)}break;
case'B':for(const[a,c]of OR){if(!inB(x+a,y+c)||b[y+c][x+a])continue;for(const k of[-1,1]){const m1=a?[x+2*a,y+k]:[x+k,y+2*c];if(!inB(m1[0],m1[1])||b[m1[1]][m1[0]])continue;add(a?x+3*a:x+2*k,a?y+2*k:y+3*c)}}break;
case'G':case'K':for(const[a,c]of OR){const nx=x+a,ny=y+c;if(inP(nx,ny)&&sp(y,ny))add(nx,ny)}for(const[a,c]of DG){const n=ds(x,y,a,c);if(n)add(n[0],n[1])}break;
case'P':{const f=s=='c'?-1:1;add(x-1,y);add(x+1,y);add(x,y+f);for(const a of[-1,1]){const n=ds(x,y,a,f);if(n)add(n[0],n[1])}}}
return r}
const mk=m=>{const q=B[m[3]][m[2]];B[m[3]][m[2]]=B[m[1]][m[0]];B[m[1]][m[0]]=null;return q},un=(m,q)=>{B[m[1]][m[0]]=B[m[3]][m[2]];B[m[3]][m[2]]=q};
function all(s){const r=[];for(let y=0;y<10;y++)for(let x=0;x<9;x++){const p=B[y][x];if(p&&p.s==s)for(const[a,c]of moves(B,x,y))r.push([x,y,a,c])}return r}
function chk(s){let kx=-1,ky=-1;for(let y=0;y<10;y++)for(let x=0;x<9;x++){const p=B[y][x];if(p&&p.t=='K'&&p.s==s){kx=x;ky=y}}if(kx<0)return true;const o=s=='c'?'h':'c';return all(o).some(m=>m[2]==kx&&m[3]==ky)}
function legal(s){return all(s).filter(m=>{const q=mk(m);const c=chk(s);un(m,q);return!c})}
/* ===== AI ===== */
let PS=0,nodes=0,dl=0,stop=false;
function ev(s,pos){let v=0;for(let y=0;y<10;y++)for(let x=0;x<9;x++){const p=B[y][x];if(!p)continue;let a=VAL[p.t]*10;
if(pos){const adv=p.s=='c'?9-y:y;if(p.t=='P')a+=adv*1.3+(x>=2&&x<=6?1:0);else if((p.t=='G'||p.t=='B')&&inP(x,y))a+=2.5;else if((p.t=='C'||p.t=='R')&&x>=2&&x<=6)a+=1.5;else if(p.t=='N'&&(x==0||x==8))a-=2}
v+=p.s==s?a:-a}return v}
const cv_=m=>B[m[3]][m[2]]?VAL[B[m[3]][m[2]].t]+1:0;
function qs(al,be,s,qd){const st=ev(s,1);if(qd==0||st>=be)return st;if(st>al)al=st;const o=s=='c'?'h':'c';const ms=all(s).filter(m=>B[m[3]][m[2]]);ms.sort((a,b)=>cv_(b)-cv_(a));
for(const m of ms){const q=mk(m);const v=q.t=='K'?10000:-qs(-be,-al,o,qd-1);un(m,q);if(v>al){al=v;if(al>=be)return al}}return al}
function sr(d,al,be,s){if(d==0)return PS?qs(al,be,s,3):ev(s,0);if(!(++nodes&511)&&Date.now()>dl)stop=true;if(stop)return 0;const o=s=='c'?'h':'c';const ms=all(s);if(!ms.length)return-9000;ms.sort((a,b)=>cv_(b)-cv_(a));
for(const m of ms){const q=mk(m);const v=(q&&q.t=='K')?10000+d:-sr(d-1,-be,-al,o);un(m,q);if(stop)return 0;if(v>al){al=v;if(al>=be)break}}return al}
/* d:최대 수읽기, r:무작위 실수확률, n:평가 흔들림(판단 오차), p:위치 평가+교환 계산, t:생각시간(ms) */
const LV={'초보1':{d:1,t:200,k:4,n:30,r:.15},'초보2':{d:2,t:300,k:3,n:20,r:.08},'초보3':{d:3,t:500,k:3,n:12,r:.04},'중수':{d:5,t:1200,k:2,n:4,r:0},'고수':{d:30,t:2500,k:2,n:3,r:0},'_q':{d:3,t:300,k:1,n:0,r:0}};
/* ===== 스마트 AI 엔진 v2 (고속 수읽기 · 전위검색 · 장군 연장 · 교환 계산) ===== */
const E_MATE=30000,E_INF=32000;
const E_MAT=[0,130,70,50,30,30,0,20];
const E_TI={R:1,C:2,N:3,B:4,G:5,K:6,P:7},E_TN=['','R','C','N','B','G','K','P'];
let E_rdy=false,E_RAYS,E_NT,E_BT,E_ST,E_PT,E_NA,E_BA,E_SA,E_PA,E_PV,E_Z1,E_Z2,E_S1=0x5bd1e995|0,E_S2=0x1b873593|0;
const E_bd=new Int8Array(90),E_kp=[-1,-1];
let E_h1=0,E_h2=0,E_ev=0;
const E_TS=1<<20,E_TM=E_TS-1;
let E_tk=null,E_tmv,E_ts,E_td,E_tf;
const E_MV=new Int32Array(256*80),E_SC=new Int32Array(256*80);
const E_K1=new Int32Array(80),E_K2=new Int32Array(80),E_HI=new Int32Array(2*8100);
let E_nodes=0,E_stop=false,E_dl=0,E_tlOn=false;

function E_init(){
  if(E_rdy)return;E_rdy=true;
  E_RAYS=[];E_NT=[];E_BT=[];E_ST=[];E_PT=[[],[]];E_NA=[];E_BA=[];E_SA=[];E_PA=[[],[]];
  for(let i=0;i<90;i++){E_NA[i]=[];E_BA[i]=[];E_SA[i]=[];E_PA[0][i]=[];E_PA[1][i]=[]}
  for(let y=0;y<10;y++)for(let x=0;x<9;x++){
    const sq=y*9+x;
    E_RAYS[sq]=rays(x,y).map(r=>r.map(([a,c])=>c*9+a));
    const nt=[],bt=[],st=[];
    for(const[a,c]of OR){
      if(!inB(x+a,y+c))continue;
      const l1=(y+c)*9+x+a;
      for(const k of[-1,1]){
        const tx=a?x+2*a:x+k,ty=a?y+k:y+2*c;
        if(!inB(tx,ty))continue;
        nt.push([l1,ty*9+tx]);
        const fx=a?x+3*a:x+2*k,fy=a?y+2*k:y+3*c;
        if(inB(fx,fy))bt.push([l1,ty*9+tx,fy*9+fx]);
      }
    }
    for(const[a,c]of OR){const nx=x+a,ny=y+c;if(inB(nx,ny)&&inP(nx,ny)&&sp(y,ny))st.push(ny*9+nx)}
    for(const[a,c]of DG){const n=ds(x,y,a,c);if(n)st.push(n[1]*9+n[0])}
    E_NT[sq]=nt;E_BT[sq]=bt;E_ST[sq]=st;
    for(const si of[0,1]){
      const f=si?1:-1,pt=[];
      if(inB(x-1,y))pt.push(y*9+x-1);
      if(inB(x+1,y))pt.push(y*9+x+1);
      if(inB(x,y+f))pt.push((y+f)*9+x);
      for(const a of[-1,1]){const n=ds(x,y,a,f);if(n)pt.push(n[1]*9+n[0])}
      E_PT[si][sq]=pt;
    }
  }
  for(let sq=0;sq<90;sq++){
    for(const[l,t]of E_NT[sq])E_NA[t].push([sq,l]);
    for(const[l1,l2,t]of E_BT[sq])E_BA[t].push([sq,l1,l2]);
    for(const t of E_ST[sq])E_SA[t].push(sq);
    for(const si of[0,1])for(const t of E_PT[si][sq])E_PA[si][t].push(sq);
  }
  /* 기물 가치 + 위치 점수 (초 기준 +, 한 기준 -) */
  E_PV=new Int32Array(15*90);
  for(let v=-7;v<=7;v++){
    if(!v)continue;const t=Math.abs(v),c=v>0;
    for(let y=0;y<10;y++)for(let x=0;x<9;x++){
      const d=c?9-y:y,cx=Math.abs(x-4),pal=x>=3&&x<=5&&(d<=2||d>=7);
      let a=E_MAT[t];
      if(t===1){a+=(4-cx)+(d>=5?3:0)+(d>=7&&x>=3&&x<=5?3:0)}
      else if(t===2){a+=(cx<=2?2:0)+(d>=2&&d<=6?2:0)+(d>=7&&x>=3&&x<=5?2:0)}
      else if(t===3){a+=Math.round((4-cx)*1.5)+(d>=2&&d<=7?3:0)-((x===0||x===8)?4:0)+(d>=7&&x>=3&&x<=5?3:0)}
      else if(t===4){a+=(d<=4?2:-2)+(cx<=2?1:0)}
      else if(t===5){a+=(d<=2?3:0)}
      else if(t===6){a+=(x===4?2:0)}
      else if(t===7){a+=d*3+(cx<=2?2:0)+(d>=7?6:0)}
      E_PV[(v+7)*90+y*9+x]=c?a:-a;
    }
  }
  let s=0x2545F491|0;const rnd=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s|0};
  E_Z1=new Int32Array(15*90);E_Z2=new Int32Array(15*90);
  for(let i=0;i<15*90;i++){E_Z1[i]=rnd();E_Z2[i]=rnd()}
}
function E_ttInit(){
  if(E_tk)return;
  E_tk=new Int32Array(E_TS);E_tmv=new Int32Array(E_TS);E_ts=new Int32Array(E_TS);E_td=new Int8Array(E_TS).fill(-1);E_tf=new Int8Array(E_TS);
}
/* 현재 B(객체 배열)를 고속 보드로 변환 */
function E_load(){
  E_bd.fill(0);E_kp[0]=E_kp[1]=-1;E_h1=E_h2=0;E_ev=0;
  for(let y=0;y<10;y++)for(let x=0;x<9;x++){
    const p=B[y][x];if(!p)continue;
    const v=E_TI[p.t]*(p.s=='c'?1:-1),sq=y*9+x;
    E_bd[sq]=v;E_h1^=E_Z1[(v+7)*90+sq];E_h2^=E_Z2[(v+7)*90+sq];E_ev+=E_PV[(v+7)*90+sq];
    if(p.t=='K')E_kp[p.s=='c'?0:1]=sq;
  }
}
/* 수 생성 (caps=true면 잡는 수만) */
function E_gen(sd,caps,o){
  let n=o;const bd=E_bd;
  for(let sq=0;sq<90;sq++){
    const pv=bd[sq];if(pv*sd<=0)continue;
    const p=pv*sd;let tg,q;
    const add=(t)=>{const cp=bd[t];E_MV[n]=sq|(t<<7)|((cp+8)<<14);E_SC[n]=cp?100000+E_MAT[Math.abs(cp)]*16-(E_MAT[p]>>3):0;n++};
    if(p===1){
      const rs=E_RAYS[sq];
      for(let r=0;r<rs.length;r++){const ray=rs[r];
        for(let i=0;i<ray.length;i++){const t=ray[i];q=bd[t];
          if(q===0){if(!caps)add(t)}else{if(q*sd<0)add(t);break}}}
    }else if(p===2){
      const rs=E_RAYS[sq];
      for(let r=0;r<rs.length;r++){const ray=rs[r],L=ray.length;let i=0;
        while(i<L&&bd[ray[i]]===0)i++;
        if(i>=L)continue;
        if(bd[ray[i]]===2||bd[ray[i]]===-2)continue;
        for(let j=i+1;j<L;j++){const t=ray[j];q=bd[t];
          if(q===0){if(!caps)add(t)}else{if(q*sd<0&&q!==2&&q!==-2)add(t);break}}}
    }else if(p===3){
      const nt=E_NT[sq];
      for(let i=0;i<nt.length;i++){if(bd[nt[i][0]]!==0)continue;const t=nt[i][1];q=bd[t];
        if(q*sd>0||(caps&&q===0))continue;add(t)}
    }else if(p===4){
      const bt=E_BT[sq];
      for(let i=0;i<bt.length;i++){const e=bt[i];if(bd[e[0]]!==0||bd[e[1]]!==0)continue;const t=e[2];q=bd[t];
        if(q*sd>0||(caps&&q===0))continue;add(t)}
    }else if(p===5||p===6){
      const st=E_ST[sq];
      for(let i=0;i<st.length;i++){const t=st[i];q=bd[t];if(q*sd>0||(caps&&q===0))continue;add(t)}
    }else{
      const pt=E_PT[sd>0?0:1][sq];
      for(let i=0;i<pt.length;i++){const t=pt[i];q=bd[t];if(q*sd>0||(caps&&q===0))continue;add(t)}
    }
  }
  return n-o;
}
/* 칸 k가 e편(+1 초/-1 한)에게 공격받는지 */
function E_atk(k,e){
  const bd=E_bd,rs=E_RAYS[k];
  for(let r=0;r<rs.length;r++){const ray=rs[r],L=ray.length;let i=0;
    while(i<L&&bd[ray[i]]===0)i++;
    if(i>=L)continue;
    const p=bd[ray[i]];
    if(p===e)return true;
    if(p!==2&&p!==-2){let j=i+1;while(j<L&&bd[ray[j]]===0)j++;if(j<L&&bd[ray[j]]===2*e)return true}
  }
  const na=E_NA[k];for(let i=0;i<na.length;i++){if(bd[na[i][0]]===3*e&&bd[na[i][1]]===0)return true}
  const ba=E_BA[k];for(let i=0;i<ba.length;i++){const a=ba[i];if(bd[a[0]]===4*e&&bd[a[1]]===0&&bd[a[2]]===0)return true}
  const sa=E_SA[k];for(let i=0;i<sa.length;i++){const q=bd[sa[i]];if(q===5*e||q===6*e)return true}
  const pa=E_PA[e>0?0:1][k];for(let i=0;i<pa.length;i++){if(bd[pa[i]]===7*e)return true}
  return false;
}
function E_make(m){
  const f=m&127,t=(m>>7)&127,p=E_bd[f],q=E_bd[t];
  E_bd[t]=p;E_bd[f]=0;
  const pi=(p+7)*90;
  E_h1^=E_Z1[pi+f]^E_Z1[pi+t];E_h2^=E_Z2[pi+f]^E_Z2[pi+t];
  E_ev+=E_PV[pi+t]-E_PV[pi+f];
  if(q){const qi=(q+7)*90+t;E_h1^=E_Z1[qi];E_h2^=E_Z2[qi];E_ev-=E_PV[qi]}
  if(p===6)E_kp[0]=t;else if(p===-6)E_kp[1]=t;
}
function E_unmake(m,h1,h2,ev){
  const f=m&127,t=(m>>7)&127,q=((m>>14)&15)-8,p=E_bd[t];
  E_bd[f]=p;E_bd[t]=q;E_h1=h1;E_h2=h2;E_ev=ev;
  if(p===6)E_kp[0]=f;else if(p===-6)E_kp[1]=f;
}
/* 잡는 수만 읽는 정적 탐색 (교환 계산) */
function E_q(al,be,ply,sd,qd){
  if((++E_nodes&1023)===0&&E_tlOn&&Date.now()>E_dl)E_stop=true;
  if(E_stop)return 0;
  const st=sd*E_ev+4;
  if(st>=be)return st;
  if(qd>=6||ply>=70)return st;
  if(st>al)al=st;
  const mo=ply*256;
  const n=E_gen(sd,true,mo);
  for(let i=0;i<n;i++){
    let bi=mo+i,bs=E_SC[bi];
    for(let j=mo+i+1;j<mo+n;j++)if(E_SC[j]>bs){bs=E_SC[j];bi=j}
    const m=E_MV[bi];E_MV[bi]=E_MV[mo+i];E_SC[bi]=E_SC[mo+i];E_MV[mo+i]=m;E_SC[mo+i]=bs;
    const cap=Math.abs(((m>>14)&15)-8);
    if(cap===6)return E_MATE-ply;
    if(st+E_MAT[cap]+60<al&&cap!==1)continue;
    const h1=E_h1,h2=E_h2,ev=E_ev,ap=Math.abs(E_bd[m&127]);
    E_make(m);
    if(E_atk(E_kp[sd>0?0:1],-sd)||(E_MAT[ap]>E_MAT[cap]+5&&E_atk((m>>7)&127,-sd))){E_unmake(m,h1,h2,ev);continue}
    const v=-E_q(-be,-al,ply+1,-sd,qd+1);
    E_unmake(m,h1,h2,ev);
    if(E_stop)return 0;
    if(v>al){al=v;if(al>=be)return al}
  }
  return al;
}
function E_ab(d,al,be,ply,sd,chk){
  if((++E_nodes&1023)===0&&E_tlOn&&Date.now()>E_dl)E_stop=true;
  if(E_stop)return 0;
  if(ply>=70)return sd*E_ev;
  if(d<=0)return E_q(al,be,ply,sd,0);
  const orig=al,k1=sd<0?E_h1^E_S1:E_h1,k2=sd<0?E_h2^E_S2:E_h2,ix=k1&E_TM;
  let tm=0;
  if(E_tk[ix]===k2){
    tm=E_tmv[ix];
    if(E_td[ix]>=d){
      let s=E_ts[ix];if(s>E_MATE-200)s-=ply;else if(s<-E_MATE+200)s+=ply;
      const f=E_tf[ix];
      if(f===0)return s;
      if(f===1&&s>=be)return s;
      if(f===2&&s<=al)return s;
    }
  }
  const mo=ply*256,n=E_gen(sd,false,mo),hb=sd>0?0:8100;
  for(let i=mo;i<mo+n;i++){
    const m=E_MV[i];
    if(m===tm)E_SC[i]=1000000;
    else if(E_SC[i]===0){
      if(m===E_K1[ply])E_SC[i]=90000;else if(m===E_K2[ply])E_SC[i]=89000;
      else E_SC[i]=E_HI[hb+(m&127)*90+((m>>7)&127)];
    }
  }
  let best=-E_INF,bm=0,lc=0;
  for(let i=0;i<n;i++){
    let bi=mo+i,bs=E_SC[bi];
    for(let j=mo+i+1;j<mo+n;j++)if(E_SC[j]>bs){bs=E_SC[j];bi=j}
    const m=E_MV[bi];E_MV[bi]=E_MV[mo+i];E_SC[bi]=E_SC[mo+i];E_MV[mo+i]=m;E_SC[mo+i]=bs;
    const cp=((m>>14)&15)-8,h1=E_h1,h2=E_h2,ev=E_ev;
    E_make(m);
    if(E_atk(E_kp[sd>0?0:1],-sd)){E_unmake(m,h1,h2,ev);continue}
    lc++;
    const gc=E_atk(E_kp[sd>0?1:0],sd),nd=d-1+((gc&&ply<40)?1:0);
    let v;
    if(lc===1)v=-E_ab(nd,-be,-al,ply+1,-sd,gc);
    else{
      const r=(d>=3&&lc>5&&!cp&&!gc&&!chk&&bs<80000)?1:0;
      v=-E_ab(nd-r,-al-1,-al,ply+1,-sd,gc);
      if(v>al&&v<be&&!E_stop)v=-E_ab(nd,-be,-al,ply+1,-sd,gc);
    }
    E_unmake(m,h1,h2,ev);
    if(E_stop)return 0;
    if(v>best){best=v;bm=m;
      if(v>al){al=v;
        if(al>=be){
          if(!cp){if(E_K1[ply]!==m){E_K2[ply]=E_K1[ply];E_K1[ply]=m}E_HI[hb+(m&127)*90+((m>>7)&127)]+=d*d}
          break}}}
  }
  if(lc===0)return chk?-E_MATE+ply:0;
  let s=best;if(s>E_MATE-200)s+=ply;else if(s<-E_MATE+200)s-=ply;
  if(E_td[ix]<=d||E_tk[ix]!==k2){E_tk[ix]=k2;E_tmv[ix]=bm;E_ts[ix]=s;E_td[ix]=d;E_tf[ix]=best>=be?1:(best<=orig?2:0)}
  return best;
}
/* 루트 탐색: 반복 심화, 상위 multi개 수를 점수와 함께 반환 */
function E_root(sd,maxD,timeMs,multi){
  E_init();E_ttInit();E_load();
  const si=sd>0?0:1;
  const n=E_gen(sd,false,0),rm=[];
  for(let i=0;i<n;i++){
    const m=E_MV[i],h1=E_h1,h2=E_h2,ev=E_ev;
    E_make(m);
    if(!E_atk(E_kp[si],-sd))rm.push({m,s:E_SC[i]});
    E_unmake(m,h1,h2,ev);
  }
  if(!rm.length)return{list:[],depth:0};
  if(rm.length===1)return{list:[[0,rm[0].m]],depth:0};
  rm.sort((a,b)=>b.s-a.s);
  E_K1.fill(0);E_K2.fill(0);E_HI.fill(0);
  const t0=Date.now();E_dl=t0+timeMs;
  let list=rm.map(r=>[0,r.m]),dep=0;
  multi=Math.max(1,Math.min(multi||1,rm.length));
  for(let d=1;d<=maxD;d++){
    E_stop=false;E_tlOn=d>=3;E_nodes=0;
    const cur=[];let kth=-E_INF,aborted=false;
    for(let i=0;i<rm.length;i++){
      const m=rm[i].m,h1=E_h1,h2=E_h2,ev=E_ev;
      E_make(m);
      const gc=E_atk(E_kp[sd>0?1:0],sd);
      const al=cur.length>=multi?kth:-E_INF;
      let v=-E_ab(d-1+(gc?1:0),-E_INF,-al,1,-sd,gc);
      E_unmake(m,h1,h2,ev);
      if(E_stop){aborted=true;break}
      cur.push([v,m]);
      if(cur.length>=multi){cur.sort((a,b)=>b[0]-a[0]);kth=cur[multi-1][0]}
    }
    if(aborted)break;
    cur.sort((a,b)=>b[0]-a[0]);
    list=cur;dep=d;
    for(let i=0;i<rm.length;i++)rm[i].m=cur[i][1];
    if(cur[0][0]>E_MATE-100||cur[0][0]<-E_MATE+100)break;
    if(d>=3&&Date.now()-t0>timeMs*.45)break;
  }
  return{list,depth:dep};
}
const E_xy=m=>{const f=m&127,t=(m>>7)&127;return[f%9,(f/9)|0,t%9,(t/9)|0]};
/* 난이도: d 최대 수읽기, t 생각시간(ms), k 후보 수, n 점수 흔들림(실수), r 차선수 선택 확률 */
function aiPick(s,lv){
  const c=LV[lv]||LV['중수'],sd=s=='c'?1:-1;
  const res=E_root(sd,c.d,c.t,c.k||1);
  const L=res.list;if(!L.length)return null;
  if(L.length===1)return E_xy(L[0][1]);
  let pick=L[0];
  const kk=Math.min(L.length,c.k||1);
  if(kk>1){
    if(c.r&&Math.random()<c.r){pick=L[1+((Math.random()*(kk-1))|0)]}
    else{
      /* 점수 차이가 작은 수들 중에서 고름 (변화를 주되 손해 없는 수만) */
      let bs=-1e9;
      for(let i=0;i<kk;i++){
        const v=L[i][0]+(Math.random()*2-1)*(c.n||0);
        if(v>bs){bs=v;pick=L[i]}
      }
    }
  }
  return E_xy(pick[1]);
}
/* 훈수용: 최선수 상위 n개 (점수는 현재 둘 차례 기준, 100=기물 1점) */
function E_hint(s,n,t){
  const sd=s=='c'?1:-1,res=E_root(sd,14,t,n);
  return{list:res.list.slice(0,n).map(x=>({m:E_xy(x[1]),sc:x[0]})),depth:res.depth};
}
