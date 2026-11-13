/* ---------- 삼국지 장수 기마 일기토 (선공 정하기 · 초고화질 리마스터 & 리얼 칼날 격돌) ---------- */
const DP=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
function dicePair(){const a=1+Math.random()*6|0;let b;do{b=1+Math.random()*6|0}while(b==a);return[a,b]}
/* --- 일기토 사운드 (합성: 말발굽, 말울음, 리얼한 강철 칼날 챙!챙! 금속 공명음, 필살 일섬, 함성) --- */
function noiseBuf(){if(!noiseBuf.b){const b=AC.createBuffer(1,AC.sampleRate*.6|0,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseBuf.b=b}return noiseBuf.b}
function snd(type,k){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state=='suspended')AC.resume();const t=AC.currentTime,out=AC.createGain();out.gain.value=.36;out.connect(AC.destination);
const tone=(f,d,du,tp,v,fe)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=tp;o.frequency.setValueAtTime(f,t+d);if(fe)o.frequency.exponentialRampToValueAtTime(fe,t+d+du);g.gain.setValueAtTime(v,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+du);o.connect(g);g.connect(out);o.start(t+d);o.stop(t+d+du+.02)};
if(type=='clash'){
  const p=k||1;
  // 1) 칼날 마찰 고주파 금속 노이즈 (Steel Scrape)
  const n=AC.createBufferSource();n.buffer=noiseBuf();
  const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(2800+p*420,t);bp.frequency.exponentialRampToValueAtTime(1100,t+.14);bp.Q.value=4.5;
  const g=AC.createGain();g.gain.setValueAtTime(.62+p*.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.15+p*.06);
  n.connect(bp);bp.connect(g);g.connect(out);n.start(t);n.stop(t+.24+p*.06);
  // 2) 리얼한 강철 검 배음 공명 (챙~! 카앙~! Inharmonic Metallic Ringing)
  const baseF = (p===1?1780:p===2?2120:1560) + (Math.random()*160-80);
  [1.0, 1.414, 1.93, 2.67].forEach((mul, idx) => {
    const f0 = baseF * mul;
    tone(f0, idx*0.004, 0.24 + p*0.07 - idx*0.03, idx%2?'triangle':'sine', (0.34 - idx*0.06)*(1+p*0.1), f0*0.96);
  });
  // 3) 묵직한 타격 저음 (Impact Thud)
  tone(155,0,.16+p*.05,'sine',.65,36);
  tone(980+p*210,0,.11,'sawtooth',.28,340);
  if(p>=3){
    tone(110,0,.48,'sawtooth',.58,24);
    tone(580,.015,.42,'square',.30,115);
    tone(3240,.01,.38,'sine',.35,2800);
  }
}else if(type=='hoof'){
  const n=AC.createBufferSource();n.buffer=noiseBuf();const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=k?420:540;bp.Q.value=3.0;const g=AC.createGain();g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.055);n.connect(bp);bp.connect(g);g.connect(out);n.start(t);n.stop(t+.065);
}else if(type=='neigh'){
  tone(110,0,.32,'sine',.65,38);
  const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(520,t+.04);o.frequency.linearRampToValueAtTime(980,t+.18);o.frequency.linearRampToValueAtTime(640,t+.38);o.frequency.linearRampToValueAtTime(420,t+.52);
  g.gain.setValueAtTime(.01,t+.04);g.gain.linearRampToValueAtTime(.22,t+.14);g.gain.exponentialRampToValueAtTime(.001,t+.54);
  o.connect(g);g.connect(out);o.start(t+.04);o.stop(t+.56);
}else if(type=='whoosh'){
  const n=AC.createBufferSource();n.buffer=noiseBuf();const bp=AC.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.5;bp.frequency.setValueAtTime(280,t);bp.frequency.exponentialRampToValueAtTime(2200,t+.38);const g=AC.createGain();g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.5,t+.22);g.gain.exponentialRampToValueAtTime(.001,t+.45);n.connect(bp);bp.connect(g);g.connect(out);n.start(t);n.stop(t+.48);
}else if(type=='win'){
  [523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.32,'triangle',.48));
}else if(type=='lose'){
  [330,262,196].forEach((f,i)=>tone(f,i*.15,.32,'sawtooth',.26));
}}catch(e){}}

/* --- 삼국지 기마 장수 외형 프리셋 (장수 이름은 플레이어 설정 닉네임과 상대 닉네임으로 실시간 매핑!) --- */
const DW=420,DH=236;
const DUEL_ROSTER_L=[
  {baseName:'관우',title:'청룡언월도',wp:'glaive',horse:'#9e2a1c',mane:'#2a0d08',armor:'#1b7a43',trim:'#ffd54a',cape:'#c62828',helm:'#1e64b4',beard:1,plume:'#38d9a9',atkCol:'#38f2c8'},
  {baseName:'장비',title:'장팔사모',wp:'spear_snake',horse:'#5c3818',mane:'#1a0f07',armor:'#28385e',trim:'#ffb74d',cape:'#d9481e',helm:'#222a3a',beard:2,plume:'#ff5252',atkCol:'#ff9100'},
  {baseName:'조운',title:'청강검·용담창',wp:'spear',horse:'#f1f5f9',mane:'#cbd5e1',armor:'#e2e8f0',trim:'#38bdf8',cape:'#1d4ed8',helm:'#f8fafc',beard:0,plume:'#38bdf8',atkCol:'#7dd3fc'},
  {baseName:'마초',title:'호두잠금창',wp:'spear',horse:'#b07d4f',mane:'#f3e5ab',armor:'#e2e8f0',trim:'#fbbf24',cape:'#b91c1c',helm:'#f8fafc',beard:0,plume:'#f59e0b',atkCol:'#fde047'}
];
const DUEL_ROSTER_R=[
  {baseName:'장료',title:'쌍월방천극',wp:'halberd',horse:'#7a4e2d',mane:'#2b190d',armor:'#475569',trim:'#eab308',cape:'#0f766e',helm:'#94a3b8',beard:0,plume:'#facc15',atkCol:'#67e8f9'},
  {baseName:'하후돈',title:'칠성대도',wp:'glaive',horse:'#dcdde1',mane:'#8c96a6',armor:'#4b5563',trim:'#f59e0b',cape:'#b91c1c',helm:'#9ca3af',beard:1,plume:'#ef4444',atkCol:'#f87171'},
  {baseName:'허저',title:'대참마도',wp:'heavy_blade',horse:'#2f2a28',mane:'#121010',armor:'#3f3f46',trim:'#f59e0b',cape:'#991b1b',helm:'#52525b',beard:2,plume:'#f97316',atkCol:'#fb923c'},
  {baseName:'여포',title:'방천화극',wp:'ji',horse:'#a8201a',mane:'#2b0908',armor:'#27272a',trim:'#facc15',cape:'#dc2626',helm:'#eab308',beard:0,plume:'#ef4444',atkCol:'#f43f5e'}
];

let duelStageMode = 0;
let duelIdleRaf = 0, curDuelGen = [Object.assign({name:'플레이어'}, DUEL_ROSTER_L[0]), Object.assign({name:'상대'}, DUEL_ROSTER_R[0])];

function buildDuelPair(seedA, seedB){
  const idxL = ((seedA || 1) + (seedB || 2)) % DUEL_ROSTER_L.length;
  const idxR = ((seedA || 1) * 3 + (seedB || 2)) % DUEL_ROSTER_R.length;
  const myNickName = nick();
  const oppNickName = oppNick || '상대';
  const gL = Object.assign({}, DUEL_ROSTER_L[idxL], { name: myNickName });
  const gR = Object.assign({}, DUEL_ROSTER_R[idxR], { name: oppNickName });
  curDuelGen = [gL, gR];
  return curDuelGen;
}

function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}

/* --- 최고 사양 일기토 전장 배경 렌더링 (석양빛 볼류메트릭 광원 + 다층 산맥/성채 + 바람에 날리는 전장 군기) --- */
function drawDuelStage(g, t, camX, mode, speedAmt){
  if(mode === 1){
    // 모드 1: 황금빛 고대 제단 & 횃불 화로 전장
    const bg = g.createLinearGradient(0, 0, 0, DH);
    bg.addColorStop(0, '#140f1d');
    bg.addColorStop(0.45, '#2d232e');
    bg.addColorStop(0.48, '#3b2d26');
    bg.addColorStop(1, '#18120e');
    g.fillStyle = bg;
    g.fillRect(0, 0, DW, DH);

    // 배경 원경 고대 궁궐 실루엣 & 붉은 달/석양 광원
    const sunG = g.createRadialGradient(DW*0.5 - camX*0.08, 62, 6, DW*0.5 - camX*0.08, 62, 115);
    sunG.addColorStop(0, 'rgba(255, 215, 110, 0.55)');
    sunG.addColorStop(0.45, 'rgba(255, 90, 30, 0.24)');
    sunG.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sunG;
    g.fillRect(0, 0, DW, 120);

    // 고대 석각 기둥 & 뇌문 조각 패럴랙스
    g.save();
    const ox = (camX * 0.28) % 84;
    for(let x = -84; x < DW + 84; x += 84){
      const px = x - ox;
      // 석주 기둥과 화로
      const pg = g.createLinearGradient(px + 16, 20, px + 44, 20);
      pg.addColorStop(0, '#2a2421'); pg.addColorStop(0.5, '#544941'); pg.addColorStop(1, '#211c19');
      g.fillStyle = pg;
      g.fillRect(px + 16, 24, 28, 86);
      g.strokeStyle = 'rgba(255, 205, 95, 0.28)';
      g.lineWidth = 1.2;
      g.strokeRect(px + 19, 28, 22, 78);

      // 기둥 상단 타오르는 횃불 화로
      const flk = 0.85 + 0.2 * Math.sin(t * 14 + x);
      const fg = g.createRadialGradient(px + 30, 22, 1, px + 30, 22, 18 * flk);
      fg.addColorStop(0, 'rgba(255,255,200,0.95)');
      fg.addColorStop(0.4, 'rgba(255,120,20,0.65)');
      fg.addColorStop(1, 'rgba(255,40,0,0)');
      g.fillStyle = fg;
      g.beginPath(); g.arc(px + 30, 22, 18 * flk, 0, 7); g.fill();
    }

    // 대리석 전장 바닥 타일 원근 그리드
    const flGrad = g.createLinearGradient(0, 110, 0, DH);
    flGrad.addColorStop(0, '#3d352e');
    flGrad.addColorStop(0.3, '#4c433b');
    flGrad.addColorStop(1, '#241e1a');
    g.fillStyle = flGrad;
    g.fillRect(0, 110, DW, DH - 110);

    g.strokeStyle = 'rgba(20, 15, 12, 0.55)';
    g.lineWidth = 2;
    for(let row = 0; row < 5; row++){
      const ry = 114 + row * row * 6.5;
      g.beginPath(); g.moveTo(0, ry); g.lineTo(DW, ry); g.stroke();
    }
    const gxOff = (camX * 0.75) % 64;
    for(let x = -64; x < DW + 64; x += 64){
      const bx = x - gxOff;
      g.beginPath();
      g.moveTo(bx, 110);
      g.lineTo(bx + (bx - DW/2) * 0.45, DH);
      g.stroke();
    }
    g.restore();
  } else {
    // 모드 0: 드라마틱한 삼국지 평원 & 성곽 & 황금빛 창공
    const sky = g.createLinearGradient(0, 0, 0, 110);
    sky.addColorStop(0, '#1e4fa3');
    sky.addColorStop(0.48, '#4a89dc');
    sky.addColorStop(0.82, '#9ec9ff');
    sky.addColorStop(1, '#ffe8b8');
    g.fillStyle = sky;
    g.fillRect(0, 0, DW, 110);

    // 태양 후광(God-ray glow)
    const sun = g.createRadialGradient(DW*0.72 - camX*0.05, 42, 4, DW*0.72 - camX*0.05, 42, 95);
    sun.addColorStop(0, 'rgba(255,255,230,0.95)');
    sun.addColorStop(0.35, 'rgba(255,220,130,0.45)');
    sun.addColorStop(1, 'rgba(255,200,100,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, DW, 110);

    // 입체 구름층
    g.save();
    const clouds = [
      [45, 32, 44, 11], [145, 24, 54, 12], [260, 38, 46, 10], [360, 28, 56, 12],
      [95, 56, 34, 8], [210, 60, 42, 9], [315, 52, 36, 8]
    ];
    for(const [cx0, cy0, cw, ch] of clouds){
      const cx = ((cx0 - camX * 0.12 + t * 9) % (DW + 90) + (DW + 90)) % (DW + 90) - 45;
      g.fillStyle = 'rgba(255, 255, 255, 0.90)';
      g.beginPath();
      g.ellipse(cx, cy0, cw*0.5, ch*0.58, 0, 0, 7);
      g.ellipse(cx - cw*0.26, cy0 + 2, cw*0.34, ch*0.44, 0, 0, 7);
      g.ellipse(cx + cw*0.26, cy0 + 2, cw*0.34, ch*0.44, 0, 0, 7);
      g.fill();
    }
    g.restore();

    // 원경 설산/청산 산맥 (3겹 입체 패럴랙스)
    g.save();
    const mxOff = (camX * 0.18) % 140;
    const mGrad1 = g.createLinearGradient(0, 62, 0, 110);
    mGrad1.addColorStop(0, '#627d98'); mGrad1.addColorStop(1, '#9fb3c8');
    g.fillStyle = mGrad1;
    g.beginPath(); g.moveTo(0, 110);
    for(let x = -140; x <= DW + 140; x += 70){
      const px = x - mxOff;
      g.lineTo(px + 22, 74 + ((x/70)&1)*6);
      g.lineTo(px + 38, 65 + ((x/70)&1)*8);
      g.lineTo(px + 70, 110);
    }
    g.closePath(); g.fill();

    // 중경 능선과 성벽 망루 실루엣
    const mxOff2 = (camX * 0.34) % 110;
    g.fillStyle = '#4e6851';
    g.beginPath(); g.moveTo(0, 110);
    for(let x = -110; x <= DW + 110; x += 55){
      const px = x - mxOff2;
      g.lineTo(px + 28, 84 + ((x/55)&1)*6);
      g.lineTo(px + 55, 110);
    }
    g.closePath(); g.fill();

    // 지평선 성곽 & 펄럭이는 전장 군기
    const fxOff = (camX * 0.48) % 90;
    for(let x = -90; x <= DW + 90; x += 90){
      const fx = x - fxOff;
      g.strokeStyle = '#3e2723'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(fx + 20, 108); g.lineTo(fx + 20, 88); g.stroke();
      g.fillStyle = ((x/90)&1) ? '#d32f2f' : '#00897b';
      g.beginPath();
      g.moveTo(fx + 20, 88);
      g.quadraticCurveTo(fx + 28, 86 + Math.sin(t*10 + x)*2.5, fx + 35, 91 + Math.cos(t*10 + x)*2);
      g.lineTo(fx + 20, 95);
      g.closePath(); g.fill();
    }
    g.restore();

    // 초원 & 전장 황톳길 그라데이션
    const grd = g.createLinearGradient(0, 106, 0, DH);
    grd.addColorStop(0, '#8cd952');
    grd.addColorStop(0.18, '#5eb532');
    grd.addColorStop(0.42, '#9c7a4c');
    grd.addColorStop(0.76, '#7a5c34');
    grd.addColorStop(1, '#3d7a22');
    g.fillStyle = grd;
    g.fillRect(0, 106, DW, DH - 106);

    // 지면 디테일 (풀포기, 자갈, 전장 수레바퀴 자국)
    g.save();
    const gxOff = (camX * 0.88) % 48;
    for(let row = 0; row < 6; row++){
      const gy = 114 + row * 19;
      const step = 26 + (row % 2) * 8;
      for(let x = -48; x < DW + 48; x += step){
        const gx = x - gxOff * (0.65 + row * 0.1) + (row * 17) % 23;
        const wx = ((gx % (DW + 40)) + (DW + 40)) % (DW + 40) - 20;
        g.fillStyle = (row === 2 || row === 3) ? 'rgba(90, 62, 32, 0.65)' : (row < 2 ? '#7ed348' : '#2b6616');
        g.fillRect(wx, gy, 6, 2);
        g.fillRect(wx + 2, gy - 2, 3, 2);
        if((x + row) % 4 === 0){
          g.fillStyle = '#6e6558';
          g.beginPath(); g.ellipse(wx + 10, gy + 4, 4.2, 2.2, -0.15, 0, 7); g.fill();
          g.fillStyle = '#9e9587';
          g.beginPath(); g.ellipse(wx + 9, gy + 3.4, 2.2, 1.1, -0.15, 0, 7); g.fill();
        }
      }
    }
    g.restore();
  }

  // 격돌 질주 시 고밀도 속도선 (Anime Speed Lines)
  if(speedAmt > 0.05){
    g.save();
    g.globalAlpha = Math.min(0.55, speedAmt * 0.52);
    for(let i = 0; i < 18; i++){
      const sy = 28 + (i * 11.5) % (DH - 42);
      const sx = ((t * 1150 + i * 73) % (DW + 160)) - 80;
      const len = 50 + (i % 4) * 26;
      const lg = g.createLinearGradient(sx, sy, sx + len, sy);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,250,220,0.85)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.strokeStyle = lg;
      g.lineWidth = (i % 3 === 0) ? 2.2 : 1.2;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + len, sy); g.stroke();
    }
    g.restore();
  }
}

/* --- 기마 장수 초고화질 관절 & 광택 갑주 & 리얼한 칼날 잔상(Blade Trail) 렌더링 --- */
function drawMountedGeneral(g, gen, x, y, dir, state, phase, weapAng, recoil, fallen, swingVel){
  g.save();
  g.translate(x, y);

  // 지면 입체 그림자
  g.fillStyle = 'rgba(10, 16, 8, 0.52)';
  g.beginPath();
  g.ellipse(0, 26, 38, 8.5, 0, 0, Math.PI * 2);
  g.fill();

  let horsePitch = 0, bobY = 0;
  if(state === 'run'){
    bobY = Math.sin(phase * 2) * 3.4;
    horsePitch = Math.cos(phase * 2) * 0.095;
  } else if(state === 'rear'){
    horsePitch = -0.36;
    bobY = -9;
  } else if(state === 'hit'){
    horsePitch = 0.16;
    bobY = 2.5;
  } else {
    bobY = Math.sin(phase) * 1.3;
  }

  g.save();
  if(dir < 0) g.scale(-1, 1);
  g.translate(0, bobY);
  g.rotate(horsePitch);

  function drawHorseLeg(hx, hy, a1, a2, isBackLayer){
    const L1 = 13.5, L2 = 12.5;
    const kx = hx + Math.sin(a1) * L1, ky = hy + Math.cos(a1) * L1;
    const fx = kx + Math.sin(a1 + a2) * L2, fy = ky + Math.cos(a1 + a2) * L2;
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#140b06'; g.lineWidth = 7.5;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
    g.strokeStyle = isBackLayer ? '#3d1e10' : gen.horse; g.lineWidth = 4.8;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
    // 무릎 보호구 & 발굽 금장
    g.fillStyle = gen.trim;
    g.beginPath(); g.arc(kx, ky, 2.0, 0, 7); g.fill();
    g.fillStyle = '#1a1614'; g.strokeStyle = '#000'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(fx + 1.6, fy + 1, 4.0, 2.5, 0, 0, 7); g.fill(); g.stroke();
    g.restore();
  }

  let fl1, fl2, fr1, fr2, bl1, bl2, br1, br2;
  if(state === 'run'){
    fl1 = 0.58 * Math.sin(phase) + 0.26;
    fl2 = -0.58 * Math.max(0, Math.cos(phase)) - 0.16;
    fr1 = 0.58 * Math.sin(phase + 0.85) + 0.26;
    fr2 = -0.58 * Math.max(0, Math.cos(phase + 0.85)) - 0.16;
    bl1 = 0.54 * Math.sin(phase + 3.1) - 0.22;
    bl2 = 0.52 * Math.max(0, -Math.cos(phase + 3.1)) + 0.18;
    br1 = 0.54 * Math.sin(phase + 3.95) - 0.22;
    br2 = 0.52 * Math.max(0, -Math.cos(phase + 3.95)) + 0.18;
  } else if(state === 'rear'){
    fl1 = 0.88 + Math.sin(phase * 3) * 0.22; fl2 = -0.98;
    fr1 = 0.58 + Math.cos(phase * 3) * 0.22; fr2 = -0.88;
    bl1 = 0.22; bl2 = 0.15;
    br1 = 0.12; br2 = 0.20;
  } else {
    const paw = Math.max(0, Math.sin(phase * 1.5)) * 0.24;
    fl1 = 0.12 + paw; fl2 = -paw * 1.4;
    fr1 = -0.05; fr2 = 0.05;
    bl1 = -0.14; bl2 = 0.14;
    br1 = -0.04; br2 = 0.08;
  }

  drawHorseLeg(-16, 4, bl1, bl2, true);
  drawHorseLeg(15, 3, fl1, fl2, true);

  // 말 꼬리
  g.save();
  const tailWave = Math.sin(phase * 2.4) * 5.5;
  const tailDroop = state === 'run' ? 1.5 : 8.5;
  g.strokeStyle = '#140c08'; g.lineWidth = 7.5; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-22, -4);
  g.quadraticCurveTo(-35, -6 + tailDroop * 0.4 + tailWave * 0.5, -44, 2 + tailDroop + tailWave);
  g.stroke();
  g.strokeStyle = gen.mane; g.lineWidth = 4.8; g.stroke();
  g.restore();

  // 말 몸통 & 입체 근육 음영 & 황금 마갑(Barding)
  g.save();
  g.fillStyle = gen.horse;
  g.strokeStyle = '#140b06';
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(-22, -6);
  g.bezierCurveTo(-26, -15, -14, -15, 0, -13);
  g.bezierCurveTo(14, -14, 25, -12, 25, -1);
  g.bezierCurveTo(25, 9, 12, 10, -2, 9);
  g.bezierCurveTo(-15, 10, -24, 6, -22, -6);
  g.closePath();
  g.fill(); g.stroke();

  const sheen = g.createLinearGradient(0, -14, 0, 8);
  sheen.addColorStop(0, 'rgba(255,255,255,0.28)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.32)');
  g.fillStyle = sheen; g.fill();

  // 화려한 비단 안장 & 금장 마갑
  g.fillStyle = gen.cape;
  g.strokeStyle = gen.trim;
  g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(-14, -13); g.lineTo(10, -13); g.lineTo(13, 3.5); g.lineTo(-16, 3.5);
  g.closePath(); g.fill(); g.stroke();

  g.fillStyle = gen.trim;
  g.beginPath(); g.arc(21.5, -2, 3.5, 0, 7); g.fill();
  g.restore();

  drawHorseLeg(-12, 5, br1, br2, false);
  drawHorseLeg(18, 4, fr1, fr2, false);

  // 말 목 & 머리 & 금속 면갑(Chanfron)
  g.save();
  const headNod = Math.sin(phase * 2 + 0.6) * 0.085;
  g.translate(18, -9);
  g.rotate(headNod);

  g.fillStyle = gen.mane; g.strokeStyle = '#140c08'; g.lineWidth = 1.5;
  for(let i = 0; i < 4; i++){
    g.beginPath();
    g.ellipse(-2 + i*2, -6 - i*3.5, 5.2, 2.6, -0.5 + Math.sin(phase*2+i)*0.15, 0, 7);
    g.fill(); g.stroke();
  }

  g.fillStyle = gen.horse; g.strokeStyle = '#140b06'; g.lineWidth = 2.2;
  g.beginPath();
  g.moveTo(-4, 6); g.lineTo(4, -18); g.lineTo(10, -23); g.lineTo(11, -17);
  g.lineTo(22, -9); g.lineTo(18, -3); g.lineTo(9, -6); g.lineTo(5, 8);
  g.closePath(); g.fill(); g.stroke();

  // 말 이마 황금 면갑
  g.fillStyle = gen.trim;
  g.beginPath(); g.moveTo(9, -18); g.lineTo(21, -9.5); g.lineTo(18, -7.5); g.lineTo(8, -15); g.closePath(); g.fill();

  g.fillStyle = '#fff'; g.beginPath(); g.arc(11, -13, 2.1, 0, 7); g.fill();
  g.fillStyle = '#111'; g.beginPath(); g.arc(11.6, -13, 1.1, 0, 7); g.fill();
  g.strokeStyle = gen.trim; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(8, -17); g.lineTo(17, -6); g.lineTo(-14, -4); g.stroke();
  g.restore();

  // 기마 장수 본체
  g.save();
  if(fallen > 0){
    g.translate(-fallen * 40, -fallen * 15 + fallen * fallen * 29);
    g.rotate(-fallen * 2.5);
  } else {
    g.translate(-2 - recoil * 6.5, -14);
    g.rotate((state === 'run' ? 0.13 : 0) - recoil * 0.24);
  }

  // 역동적인 망토
  const capeFlap = Math.sin(phase * 2.5) * 6.5 + (state === 'run' ? 9 : 2.5);
  const capeG = g.createLinearGradient(-6, -16, -34, 4);
  capeG.addColorStop(0, gen.cape); capeG.addColorStop(1, '#2b0808');
  g.fillStyle = capeG; g.strokeStyle = '#1a0c08'; g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-6, -16);
  g.quadraticCurveTo(-23, -19 - capeFlap * 0.4, -34 - capeFlap * 0.5, -5 + capeFlap * 0.6);
  g.quadraticCurveTo(-20, 3 + capeFlap * 0.3, -5, -2);
  g.closePath(); g.fill(); g.stroke();

  // 다리 & 갑주 몸통
  g.fillStyle = gen.armor; g.strokeStyle = '#111'; g.lineWidth = 2;
  rr(g, -4, -3, 11, 13, 4); g.fill(); g.stroke();
  g.fillStyle = '#1e2433'; rr(g, -2, 7, 11, 6, 2); g.fill(); g.stroke();

  const armG = g.createLinearGradient(-9, -20, 9, 0);
  armG.addColorStop(0, gen.armor); armG.addColorStop(0.5, '#ffffff33'); armG.addColorStop(1, gen.armor);
  g.fillStyle = gen.armor; g.strokeStyle = '#111'; g.lineWidth = 2.2;
  rr(g, -9, -20, 18, 19, 5); g.fill();
  g.fillStyle = armG; g.fill(); g.stroke();

  g.fillStyle = gen.trim;
  g.fillRect(-8, -8, 16, 3.8);
  g.beginPath(); g.arc(1, -13, 3.8, 0, 7); g.fill();

  g.fillStyle = gen.armor; g.strokeStyle = gen.trim; g.lineWidth = 1.7;
  g.beginPath(); g.ellipse(-5, -16, 6.8, 4.6, -0.3, 0, 7); g.fill(); g.stroke();

  // 장수 머리 & 투구
  g.save();
  g.translate(1, -26);
  g.fillStyle = '#f5c6a5'; g.strokeStyle = '#1a0f08'; g.lineWidth = 1.8;
  g.beginPath(); g.arc(0, 0, 7.3, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#111'; g.fillRect(2, -2, 3, 2);
  g.beginPath(); g.moveTo(1, -3.6); g.lineTo(6, -2); g.stroke();

  if(gen.beard === 1){
    g.fillStyle = '#18181b';
    g.beginPath();
    g.moveTo(2, 3); g.quadraticCurveTo(9, 11, 5 - Math.sin(phase*2)*2, 18);
    g.quadraticCurveTo(0, 13, 0, 4); g.closePath(); g.fill();
  } else if(gen.beard === 2){
    g.fillStyle = '#271c15';
    g.beginPath(); g.arc(2, 4, 5.5, -0.3, 3.5); g.fill();
  }

  g.fillStyle = gen.helm; g.strokeStyle = '#111'; g.lineWidth = 1.8;
  g.beginPath(); g.arc(-0.5, -2, 7.8, Math.PI * 0.95, Math.PI * 2.15); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = gen.trim; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(-7.2, -2); g.lineTo(7.2, -2); g.stroke();

  g.fillStyle = gen.plume;
  g.beginPath();
  g.moveTo(-2, -9);
  g.quadraticCurveTo(-13, -17 - Math.sin(phase*2.2)*2.5, -19, -8 + Math.cos(phase*2.2)*2.5);
  g.quadraticCurveTo(-9, -7, -2, -7);
  g.closePath(); g.fill();
  g.restore();

  // 오른팔 & 장병기 + 실시간 칼날 모션 블러 스미어(Blade Smear Trail)
  g.save();
  g.translate(2, -15);
  g.rotate(weapAng);

  // 칼날 휘두를 때 강철 검기 잔상 (swingVel이 있을 때)
  if(swingVel && Math.abs(swingVel) > 0.15){
    g.save();
    g.globalCompositeOperation = 'lighter';
    const trailSpan = Math.min(1.15, Math.abs(swingVel) * 0.85) * (swingVel > 0 ? -1 : 1);
    const tg = g.createRadialGradient(0, 0, 26, 0, 0, 62);
    tg.addColorStop(0, 'rgba(255,255,255,0)');
    tg.addColorStop(0.55, gen.atkCol + '66');
    tg.addColorStop(0.88, '#ffffffcc');
    tg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = tg;
    g.beginPath();
    g.moveTo(26, 0);
    g.arc(0, 0, 60, Math.min(0, trailSpan), Math.max(0, trailSpan));
    g.closePath();
    g.fill();
    g.restore();
  }

  // 무기 자루
  g.strokeStyle = '#1a0d06'; g.lineWidth = 4.8;
  g.beginPath(); g.moveTo(-24, 0); g.lineTo(40, 0); g.stroke();
  g.strokeStyle = '#9c522b'; g.lineWidth = 2.6;
  g.beginPath(); g.moveTo(-24, 0); g.lineTo(40, 0); g.stroke();

  // 붉은 영(술)
  g.fillStyle = '#ef4444';
  g.beginPath();
  g.moveTo(35, 0); g.quadraticCurveTo(31, 8 + Math.sin(phase*3)*2.5, 25, 5.5);
  g.quadraticCurveTo(29, 1, 35, 0); g.fill();

  // 강철 칼날/창날 (금속 그라데이션 & 예리한 날끝 하이라이트)
  const bladeG = g.createLinearGradient(36, -8, 60, 6);
  bladeG.addColorStop(0, '#ffffff');
  bladeG.addColorStop(0.45, '#cbd5e1');
  bladeG.addColorStop(0.8, '#64748b');
  bladeG.addColorStop(1, '#f8fafc');
  g.fillStyle = bladeG;
  g.strokeStyle = '#0f172a';
  g.lineWidth = 1.5;

  if(gen.wp === 'glaive' || gen.wp === 'heavy_blade'){
    g.beginPath();
    g.moveTo(36, -1.5);
    g.quadraticCurveTo(50, -10.5, 62, -4.5);
    g.quadraticCurveTo(53, 4.5, 36, 3.2);
    g.closePath(); g.fill(); g.stroke();
    // 칼날 백색 예리한 날선
    g.strokeStyle = '#ffffff'; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(38, -2); g.quadraticCurveTo(50, -9, 61, -4.2); g.stroke();
    g.fillStyle = '#fbbf24'; g.beginPath(); g.arc(36, 0, 3.5, 0, 7); g.fill();
  } else if(gen.wp === 'spear_snake'){
    g.beginPath();
    g.moveTo(36, -2.2); g.lineTo(44, -4.5); g.lineTo(51, 0); g.lineTo(61, -2.5);
    g.lineTo(52, 3.5); g.lineTo(44, 1.2); g.lineTo(36, 3.2);
    g.closePath(); g.fill(); g.stroke();
  } else if(gen.wp === 'ji' || gen.wp === 'halberd'){
    g.beginPath();
    g.moveTo(36, -2.8); g.lineTo(60, 0); g.lineTo(36, 2.8); g.closePath();
    g.fill(); g.stroke();
    g.lineWidth = 2.0; g.strokeStyle = '#f8fafc';
    g.beginPath(); g.arc(43, -5.5, 6.2, 0.25, 2.85); g.stroke();
  } else {
    g.beginPath();
    g.moveTo(36, 0); g.lineTo(46, -4.5); g.lineTo(61, 0); g.lineTo(46, 4.5); g.closePath();
    g.fill(); g.stroke();
  }

  g.fillStyle = gen.armor; g.strokeStyle = '#111'; g.lineWidth = 1.8;
  rr(g, -4, -4, 11, 8, 3); g.fill(); g.stroke();
  g.fillStyle = '#f5c6a5'; g.beginPath(); g.arc(7, 0, 3.5, 0, 7); g.fill(); g.stroke();

  g.restore();
  g.restore();
  g.restore();

  // 장수 머리 위 닉네임 이름표 배지 (낙마 전까지 선명하게 표시)
  if(fallen <= 0.1 && gen.name){
    g.save();
    g.translate(0, bobY - 58);
    g.font = "900 10px 'Malgun Gothic',sans-serif";
    const tw = Math.max(36, g.measureText(gen.name).width + 14);
    g.fillStyle = dir > 0 ? 'rgba(12, 48, 38, 0.86)' : 'rgba(62, 14, 14, 0.86)';
    g.strokeStyle = dir > 0 ? '#38f2c8' : '#ff8a80';
    g.lineWidth = 1.2;
    rr(g, -tw/2, -9, tw, 15, 7);
    g.fill(); g.stroke();
    g.fillStyle = '#ffffff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(gen.name, 0, -1);
    g.restore();
  }

  g.restore();
}

/* --- 상단 삼국지 일기토 체력(HP) 게이지 & 닉네임 장수명 + 하단 대사창 --- */
function drawDuelHUD(g, genL, genR, hpL, hpR, dialogTxt){
  g.save();
  const barW = 152, barH = 11, y0 = 9;
  // 좌측 (내 닉네임 장수)
  g.fillStyle = 'rgba(10, 14, 26, 0.86)';
  rr(g, 10, y0, barW + 4, barH + 19, 6); g.fill();
  g.strokeStyle = '#ffd54a'; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = '#1e222d';
  g.fillRect(14, y0 + 4, barW - 4, barH - 2);
  const wL = Math.max(0, Math.min(1, hpL / 100)) * (barW - 4);
  const grL = g.createLinearGradient(14, 0, 14 + barW, 0);
  grL.addColorStop(0, '#00e676'); grL.addColorStop(1, '#ffd54a');
  g.fillStyle = hpL < 30 ? '#ff1744' : grL;
  g.fillRect(14, y0 + 4, wL, barH - 2);
  g.font = "900 10.5px 'Malgun Gothic',sans-serif";
  g.fillStyle = '#fff'; g.textAlign = 'left';
  g.fillText('⚔️ ' + genL.name, 14, y0 + 24);
  g.fillStyle = '#ffd54a'; g.textAlign = 'right';
  g.fillText(Math.ceil(hpL) + '%', 10 + barW, y0 + 24);

  // 우측 (상대 닉네임 장수)
  const rx0 = DW - 14 - barW;
  g.fillStyle = 'rgba(10, 14, 26, 0.86)';
  rr(g, rx0, y0, barW + 4, barH + 19, 6); g.fill();
  g.strokeStyle = '#ffd54a'; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = '#1e222d';
  g.fillRect(rx0 + 4, y0 + 4, barW - 4, barH - 2);
  const wR = Math.max(0, Math.min(1, hpR / 100)) * (barW - 4);
  const grR = g.createLinearGradient(rx0 + 4, 0, rx0 + barW, 0);
  grR.addColorStop(0, '#ffd54a'); grR.addColorStop(1, '#ff5252');
  g.fillStyle = hpR < 30 ? '#ff1744' : grR;
  g.fillRect(rx0 + 4 + (barW - 4 - wR), y0 + 4, wR, barH - 2);
  g.font = "900 10.5px 'Malgun Gothic',sans-serif";
  g.fillStyle = '#ffd54a'; g.textAlign = 'left';
  g.fillText(Math.ceil(hpR) + '%', rx0 + 6, y0 + 24);
  g.fillStyle = '#fff'; g.textAlign = 'right';
  g.fillText(genR.name + ' ⚔️', rx0 + barW, y0 + 24);

  // 중앙 상단 一騎討 배지
  g.fillStyle = '#4a1208';
  g.strokeStyle = '#ffd54a';
  g.lineWidth = 1.8;
  rr(g, DW/2 - 34, 8, 68, 24, 12);
  g.fill(); g.stroke();
  g.font = "900 12px 'Malgun Gothic',sans-serif";
  g.fillStyle = '#ffe36b';
  g.textAlign = 'center';
  g.fillText('一騎討', DW/2, 24);

  // 하단 삼국지 일기토 대사 배너
  if(dialogTxt){
    g.fillStyle = 'rgba(8, 12, 22, 0.88)';
    g.strokeStyle = 'rgba(255, 213, 74, 0.9)';
    g.lineWidth = 1.5;
    rr(g, 14, DH - 32, DW - 28, 25, 7);
    g.fill(); g.stroke();
    g.font = "800 11.5px 'Malgun Gothic',sans-serif";
    g.fillStyle = '#fff8dc';
    g.textAlign = 'center';
    g.fillText(dialogTxt, DW/2, DH - 15);
  }
  g.restore();
}

/* --- 일기토 대기 화면 --- */
function arenaIdle(seedA, seedB){
  cancelAnimationFrame(duelIdleRaf);
  buildDuelPair(seedA, seedB);
  duelStageMode = ((seedA || 1) + (seedB || 2)) % 2;

  const cv = $('da');
  if(!cv) return;
  const g = cv.getContext('2d'), d = Math.min(devicePixelRatio || 1, 3);
  cv.width = DW * d; cv.height = DH * d;

  const tStart = performance.now();
  function idleLoop(now){
    if($('dc').style.display === 'none') return;
    const t = (now - tStart) / 1000;
    curDuelGen[0].name = nick();
    curDuelGen[1].name = oppNick || '상대';
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, DW, DH);
    drawDuelStage(g, t, 0, duelStageMode, 0);
    drawMountedGeneral(g, curDuelGen[0], 108, 156, 1, 'idle', t * 3.2, -1.42 + Math.sin(t * 3) * 0.08, 0, 0, 0);
    drawMountedGeneral(g, curDuelGen[1], DW - 108, 156, -1, 'idle', t * 3.2 + 1.2, -0.55 + Math.cos(t * 3) * 0.08, 0, 0, 0);
    drawDuelHUD(g, curDuelGen[0], curDuelGen[1], 100, 100, `🐎 [${curDuelGen[0].name}] vs [${curDuelGen[1].name}] — 일기토 승리자가 선공을 차지합니다!`);
    duelIdleRaf = requestAnimationFrame(idleLoop);
  }
  duelIdleRaf = requestAnimationFrame(idleLoop);
}

/* --- 본 일기토 애니메이션: 기마 돌격 → 챙! 챙챙! 채앵! 카앙! 초고속 리얼 칼날 격돌 & 불똥 → 필살 일섬 & 낙마! --- */
function arena(a, b, tok, done){
  cancelAnimationFrame(duelIdleRaf);
  const cv = $('da'), g = cv.getContext('2d'), d = Math.min(devicePixelRatio || 1, 3);
  cv.width = DW * d; cv.height = DH * d;

  const [genL, genR] = buildDuelPair(a, b);
  const stMode = (a + b) % 2;

  const f = a > b, wi = f ? 0 : 1, lo = 1 - wi;
  const T0 = performance.now();
  // 8차례의 초고밀도 칼날 격돌 타임라인 (챙! -> 챙챙!! -> 채앵!! -> 카앙! -> 챙!챙! -> 콰아앙!! -> 번쩍!! -> 필살일섬!!)
  const CL = [0.38, 0.53, 0.70, 1.18, 1.34, 1.52, 1.98, 2.22];
  const TX = ['챙!', '챙챙!!', '채앵!!', '카앙!', '챙! 챙!', '콰아앙!!', '번쩍!!', '필살일섬!!'];
  const SHT = 2.38;
  const ez = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
  const lp = (p, q, u) => p + (q - p) * u;
  const COL = ['#ffffff', '#fff59d', '#ffca28', '#ff6d00', '#38f2c8'];

  let sp = [], dust = [], slashes = [], bladeGlints = [], popWords = [], rg = [], fired = [0,0,0,0,0,0,0,0];
  let shake = 0, flash = 0, last = 0, hoofT = 0, shat = 0, s2 = 0, fin = 0;
  let hp = [100, 100], targetHp = [100, 100];
  let flyWeap = null;

  snd('neigh');

  function frame(now){
    if(tok != dTok) return;
    const t = (now - T0) / 1000, dt = Math.min(0.05, Math.max(0.001, t - last));
    last = t;
    genL.name = nick();
    genR.name = oppNick || '상대';

    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, DW, DH);

    if(t < SHT && t - hoofT > 0.09){
      hoofT = t;
      snd('hoof', (t * 10 | 0) & 1);
    }

    // 8번의 리얼 칼날 격돌 이벤트
    CL.forEach((tc, i) => {
      if(t >= tc && !fired[i]){
        fired[i] = 1;
        const isFin = (i === 7);
        const cxHit = DW/2 + ((i % 2 === 0) ? -8 : 8);
        const cyHit = 128 + ((i % 3) - 1) * 7;

        // 1) 단조 강철 불똥 스파크 (지면 탄성 바운스 포함)
        const nSp = 28 + i * 8;
        for(let k = 0; k < nSp; k++){
          const an = Math.random() * 6.283, v = 110 + Math.random() * 240 + (isFin ? 90 : i * 18);
          sp.push({
            x: cxHit, y: cyHit,
            vx: Math.cos(an)*v, vy: Math.sin(an)*v - 55,
            l: 0.42 + Math.random()*0.38, m: 0.78,
            c: COL[k % 5], w: 1.5 + (k % 3) * 0.9
          });
        }

        // 2) 예리한 초승달 칼날 검기 아크 (다중 교차 베기)
        const baseAng = (i % 2 === 0 ? -0.55 : 0.55) + (i * 0.25);
        slashes.push({
          x: cxHit, y: cyHit,
          ang: baseAng,
          col: isFin ? (wi === 0 ? genL.atkCol : genR.atkCol) : (i % 2 === 0 ? '#38f2c8' : '#ffab00'),
          t0: t, big: isFin
        });
        // 교차 패링 검기 추가
        slashes.push({
          x: cxHit, y: cyHit,
          ang: -baseAng + 0.4,
          col: '#ffffff',
          t0: t, big: false
        });

        // 3) 칼날 맞부딪힘 십자 섬광(Blade Lock Cross-Glint) & 예리한 강철 직선 참격선
        bladeGlints.push({
          x: cxHit, y: cyHit,
          ang: (i * 0.65) % 3.14,
          t0: t,
          sc: isFin ? 1.85 : (0.95 + (i % 3) * 0.22)
        });

        // 4) 충격파 링 & 칼날 의성어 팝업 (챙! 챙챙! 채앵! 카앙!)
        rg.push({t0: t, r: i, x: cxHit, y: cyHit});
        popWords.push({
          s: TX[i], t0: t,
          x: DW/2 + ((i % 2 === 0) ? -42 : 42) + (i === 7 ? (wi===0?-28:28) : 0),
          y: 58 + (i % 3) * 12,
          rot: (i % 2 === 0 ? -0.10 : 0.10),
          big: isFin || i === 5
        });

        shake = 5.5 + i * 2.2;
        flash = 0.24 + i * 0.06;
        snd('clash', isFin ? 3 : (i >= 4 ? 2 : 1));

        // 체력 게이지 단계적 감소
        const hpSteps = [
          [88, 89], [76, 75], [64, 62], [51, 53],
          [39, 38], [28, 25], [25, 14], [24, 0]
        ];
        targetHp[wi] = hpSteps[i][0];
        targetHp[lo] = hpSteps[i][1];
        if(isFin){ shake = 19; flash = 0.88; }
      }
    });

    hp[0] += (targetHp[0] - hp[0]) * Math.min(1, dt * 15);
    hp[1] += (targetHp[1] - hp[1]) * Math.min(1, dt * 15);

    let X = [90, DW - 90], dir = [1, -1], wAng = [-1.45, -0.55], st = ['run', 'run'], rec = [0, 0], fall = [0, 0], swV = [0, 0];
    let camX = Math.sin(t * 2.5) * 26, camZoom = 1.0, speedAmt = 0.6;
    let dlg = `⚔️ [${genL.name}] vs [${genR.name}] — 불꽃 튀는 창검 일기토 격돌!`;

    if(t < 0.38){
      const u = ez(t / 0.38);
      X[0] = lp(68, DW/2 - 32, u);
      X[1] = lp(DW - 68, DW/2 + 32, u);
      wAng[0] = lp(-1.58, -0.10, u * u);
      wAng[1] = lp(-0.72, -0.08, u * u);
      swV[0] = swV[1] = u * 1.1;
      speedAmt = 0.88;
      dlg = `🐎 [${genL.name}] "내 칼을 받아라!" vs [${genR.name}] — 전속력 기마 돌격!`;
    } else if(t < 0.84){
      // 제 1·2·3합 초고속 챙! 챙챙!! 채앵!! 칼날 교차
      const sub = (t - 0.38) / 0.46;
      const bounce = Math.sin(sub * Math.PI * 3) * 15;
      X[0] = DW/2 - 30 - Math.abs(bounce);
      X[1] = DW/2 + 30 + Math.abs(bounce);
      wAng[0] = -0.25 + Math.sin(t * 42) * 0.78;
      wAng[1] = -0.25 + Math.cos(t * 42) * 0.78;
      swV[0] = Math.cos(t * 42); swV[1] = -Math.sin(t * 42);
      rec[0] = rec[1] = Math.exp(-((t - 0.38) % 0.16) * 14) * 0.65;
      camZoom = 1.05;
      dlg = `⚔️ 챙! 챙챙!! 채앵!! — 눈에 보이지 않는 초고속 칼날 공방!`;
    } else if(t < 1.14){
      // 교차 돌파 후 회마(回馬)
      const u = ez((t - 0.84) / 0.30);
      X[0] = lp(DW/2 - 26, DW - 76, u);
      X[1] = lp(DW/2 + 26, 76, u);
      dir[0] = u > 0.76 ? -1 : 1;
      dir[1] = u > 0.76 ? 1 : -1;
      st[0] = st[1] = u > 0.70 ? 'rear' : 'run';
      wAng[0] = -1.25; wAng[1] = -1.15;
      camX += (u - 0.5) * 65;
      speedAmt = 0.92;
      dlg = `🌪️ 스쳐 지나가며 말머리를 돌리는 회마(回馬) 창술!`;
    } else if(t < 1.72){
      // 좌우 진영 교체 후 제 4·5·6합 카앙! 챙!챙! 콰아앙!! 맹공
      const u = ez(Math.min(1, (t - 1.14) / 0.14));
      const eb = t > 1.18 ? Math.abs(Math.sin((t - 1.18) * 16)) * 15 : 0;
      X[0] = lp(DW - 76, DW/2 + 30, u) + eb;
      X[1] = lp(76, DW/2 - 30, u) - eb;
      dir[0] = -1; dir[1] = 1;
      wAng[0] = -0.18 + Math.sin(t * 46) * 0.82;
      wAng[1] = -0.18 + Math.cos(t * 46) * 0.82;
      swV[0] = Math.cos(t * 46); swV[1] = -Math.sin(t * 46);
      rec[0] = rec[1] = t > 1.18 ? 0.55 : 0;
      camZoom = 1.07;
      dlg = `⚡ 카앙! 챙! 챙! 콰아앙!! — 검기가 전장 하늘을 가릅니다!`;
    } else if(t < 1.94){
      const u = ez((t - 1.72) / 0.22);
      X[0] = lp(DW/2 + 28, 80, u);
      X[1] = lp(DW/2 - 28, DW - 80, u);
      dir[0] = u > 0.62 ? 1 : -1;
      dir[1] = u > 0.62 ? -1 : 1;
      wAng[0] = -1.55; wAng[1] = -1.55;
      dlg = `🔥 [${wi === 0 ? genL.name : genR.name}] "이 한 칼에 승부를 내겠다! 천하무쌍 일섬!!"`;
    } else if(t < SHT){
      const u = ez(Math.min(1, (t - 1.94) / 0.16));
      X[0] = lp(80, DW/2 - 24, u);
      X[1] = lp(DW - 80, DW/2 + 24, u);
      dir[0] = 1; dir[1] = -1;
      wAng[wi] = t < 2.22 ? -1.65 : 0.34;
      wAng[lo] = t < 2.22 ? -0.45 : -0.95;
      swV[wi] = 1.5;
      rec[lo] = t >= 2.22 ? 1.25 : 0;
      camZoom = 1.10;
      speedAmt = 1.0;
      dlg = `💥 필살일섬(必殺一閃)!! 승패가 갈립니다!!`;
    } else {
      const u = ez((t - SHT) / 0.55);
      X[wi] = lp(wi === 0 ? DW/2 - 24 : DW/2 + 24, DW/2 + (wi === 0 ? -16 : 16), u);
      X[lo] = lp(lo === 0 ? DW/2 - 24 : DW/2 + 24, lo === 0 ? 50 : DW - 50, u);
      dir[0] = 1; dir[1] = -1;
      st[wi] = 'rear'; st[lo] = 'hit';
      wAng[wi] = -1.35 + Math.sin(t * 8) * 0.12;
      wAng[lo] = 0.5;
      fall[lo] = Math.min(1.2, (t - SHT) * 1.9);
      speedAmt = 0;
      dlg = `🏆 [${wi === 0 ? genL.name : genR.name}] 일기토 승리! 선공 선택권을 차지합니다!`;
    }

    if(t < SHT && Math.random() < 0.7){
      for(let i = 0; i < 2; i++){
        dust.push({
          x: X[i] - dir[i] * 18 + (Math.random() - 0.5) * 10,
          y: 178 + (Math.random() - 0.5) * 6,
          vx: -dir[i] * (38 + Math.random() * 48),
          vy: -12 - Math.random() * 24,
          r: 4 + Math.random() * 6,
          l: 0.45 + Math.random() * 0.25
        });
      }
    }

    if(t >= SHT && !shat){
      shat = 1;
      const lx = X[lo], ly = 140;
      flyWeap = {x: lx, y: ly - 15, vx: (lo === 0 ? -68 : 68), vy: -165, rot: 0, vr: (lo === 0 ? -15 : 15)};
      for(let k = 0; k < 65; k++){
        const an = Math.random() * 6.283, v = 110 + Math.random() * 240;
        sp.push({x: lx, y: ly, vx: Math.cos(an)*v, vy: Math.sin(an)*v - 55, l: 0.55 + Math.random()*0.4, m: 0.88, c: COL[k % 5], w: 2.2});
      }
      rg.push({t0: t, r: 6, x: lx, y: ly});
      popWords.push({s: '낙마(落馬)!!', t0: t, x: DW/2, y: 64, rot: -0.05, big: true});
      shake = 22; flash = 0.88;
      snd('clash', 3);
    }
    if(t >= SHT + 0.14 && !s2){
      s2 = 1;
      snd(f ? 'win' : 'lose');
    }

    shake = Math.max(0, shake - dt * 34);
    g.save();
    // 역동적 카메라 줌 & 진동
    g.translate(DW/2 + (Math.random() - 0.5) * shake, DH/2 + (Math.random() - 0.5) * shake);
    g.scale(camZoom, camZoom);
    g.translate(-DW/2, -DH/2);

    // 1) 전장 배경
    drawDuelStage(g, t, camX, stMode, speedAmt);

    // 2) 말발굽 흙먼지
    dust = dust.filter(q => q.l > 0);
    for(const q of dust){
      q.l -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += dt * 8.5;
      g.fillStyle = stMode === 1 ? `rgba(130, 120, 108, ${q.l * 0.72})` : `rgba(162, 136, 94, ${q.l * 0.78})`;
      g.beginPath(); g.arc(q.x, q.y, q.r, 0, 7); g.fill();
    }

    // 3) 충격파 파동 링
    for(const r of rg){
      const u = (t - r.t0) / 0.42;
      if(u >= 0 && u < 1){
        g.save();
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = `rgba(255, 235, 140, ${(1 - u) * 0.85})`;
        g.lineWidth = Math.max(1, 5.0 - u * 4.0);
        g.beginPath(); g.arc(r.x, r.y, 10 + u * (68 + r.r * 12), 0, 7); g.stroke();
        g.restore();
      }
    }

    // 4) 두 기마 무장 (머리 위 닉네임 배지 & 칼날 모션 블러 포함)
    const phase = t * 18.5;
    drawMountedGeneral(g, genL, X[0], 156, dir[0], st[0], phase, wAng[0], rec[0], fall[0], swV[0]);
    drawMountedGeneral(g, genR, X[1], 156, dir[1], st[1], phase + 1.4, wAng[1], rec[1], fall[1], swV[1]);

    // 5) 날아가는 패배자의 무기
    if(flyWeap){
      if(flyWeap.y < 168){
        flyWeap.x += flyWeap.vx * dt;
        flyWeap.y += flyWeap.vy * dt;
        flyWeap.vy += 420 * dt;
        flyWeap.rot += flyWeap.vr * dt;
      }
      g.save();
      g.translate(flyWeap.x, flyWeap.y);
      g.rotate(flyWeap.rot);
      g.strokeStyle = '#6b3410'; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(-22, 0); g.lineTo(22, 0); g.stroke();
      g.fillStyle = '#e2e8f0';
      g.beginPath(); g.moveTo(20, -4.5); g.lineTo(34, 0); g.lineTo(20, 4.5); g.closePath(); g.fill();
      g.restore();
    }

    // 6) 리얼한 칼날 검기 아크(Crescent Blade Slashes) + 십자 칼날 섬광(Blade Glints) + 강철 스파크
    g.save();
    g.globalCompositeOperation = 'lighter';

    slashes = slashes.filter(s => t - s.t0 < 0.26);
    for(const s of slashes){
      const u = (t - s.t0) / 0.26;
      const rad = (s.big ? 54 : 34) + u * 32;
      g.save();
      g.translate(s.x, s.y);
      g.rotate(s.ang);
      g.globalAlpha = 1 - u * u;
      // 외곽 컬러 검기
      g.strokeStyle = s.col;
      g.lineWidth = (s.big ? 15 : 8.5) * (1 - u);
      g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, rad, -1.22, 1.22); g.stroke();
      // 중심 백색 예리한 칼날 코어
      g.strokeStyle = '#ffffff';
      g.lineWidth = (s.big ? 6 : 3.2) * (1 - u);
      g.beginPath(); g.arc(0, 0, rad, -1.05, 1.05); g.stroke();
      g.restore();
    }

    // 칼날이 맞부딪힐 때 번쩍이는 십자 금속 섬광 & 일자 참격선
    bladeGlints = bladeGlints.filter(bg => t - bg.t0 < 0.20);
    for(const bg of bladeGlints){
      const u = (t - bg.t0) / 0.20;
      const al = 1 - u;
      g.save();
      g.translate(bg.x, bg.y);
      g.rotate(bg.ang);
      g.globalAlpha = al;
      const len = (48 + u * 35) * bg.sc;
      // 예리한 교차 칼날 섬광선 2개
      for(const a of [0, 1.57, 0.78]){
        g.save();
        g.rotate(a);
        const lFactor = a === 0.78 ? 0.55 : 1.0;
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(-len * lFactor, 0);
        g.lineTo(0, -3.2 * al * bg.sc);
        g.lineTo(len * lFactor, 0);
        g.lineTo(0, 3.2 * al * bg.sc);
        g.closePath();
        g.fill();
        g.restore();
      }
      // 중심 코어 플레어
      const fg = g.createRadialGradient(0, 0, 0, 0, 0, 22 * bg.sc);
      fg.addColorStop(0, 'rgba(255,255,255,1)');
      fg.addColorStop(0.5, 'rgba(255,230,130,0.75)');
      fg.addColorStop(1, 'rgba(255,140,0,0)');
      g.fillStyle = fg;
      g.beginPath(); g.arc(0, 0, 22 * bg.sc, 0, 7); g.fill();
      g.restore();
    }

    // 강철 불똥 스파크 (지면 충돌 시 튕김!)
    sp = sp.filter(q => q.l > 0);
    for(const q of sp){
      q.l -= dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 310 * dt;
      if(q.y > 176 && q.vy > 0){
        q.y = 176;
        q.vy = -q.vy * 0.45;
        q.vx *= 0.82;
      }
      g.strokeStyle = q.c;
      g.globalAlpha = Math.max(0, q.l / q.m);
      g.lineWidth = q.w || 2.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(q.x, q.y);
      g.lineTo(q.x - q.vx * 0.048, q.y - q.vy * 0.048);
      g.stroke();
    }
    g.restore();

    // 7) 섬광 & 다중 칼날 타격 의성어(챙! 챙챙! 채앵! 카앙!) & 승리 왕관
    if(flash > 0){
      g.fillStyle = `rgba(255, 250, 220, ${Math.min(0.52, flash * 0.52)})`;
      g.fillRect(-15, -15, DW + 30, DH + 30);
      flash = Math.max(0, flash - dt * 4.2);
    }

    popWords = popWords.filter(pw => t - pw.t0 < 0.44);
    for(const pw of popWords){
      const u = (t - pw.t0) / 0.44;
      const pop = 1 + 0.58 * Math.exp(-u * 10);
      g.save();
      g.translate(pw.x, pw.y - u * 10);
      g.scale(pop, pop);
      g.rotate(pw.rot);
      g.globalAlpha = 1 - u * u;
      g.font = `900 ${pw.big ? 27 : 22}px 'Malgun Gothic',sans-serif`;
      g.textAlign = 'center';
      g.lineJoin = 'round';
      g.lineWidth = 5.5;
      g.strokeStyle = '#1f0802';
      g.strokeText(pw.s, 0, 0);
      const tg = g.createLinearGradient(0, -14, 0, 6);
      tg.addColorStop(0, '#ffffff');
      tg.addColorStop(0.45, '#ffe57f');
      tg.addColorStop(1, pw.big ? '#ff6d00' : '#ffb300');
      g.fillStyle = tg;
      g.fillText(pw.s, 0, 0);
      g.restore();
    }

    if(t >= SHT + 0.08){
      const u = Math.min(1, (t - SHT - 0.08) / 0.3);
      g.font = Math.round(24 * (1 + 0.5 * Math.exp(-u * 5))) + 'px serif';
      g.textAlign = 'center';
      g.fillText('👑', X[wi], 82);
    }

    g.restore();

    // 8) 상단 일기토 체력바 & 하단 실황 대사 (카메라 줌 밖에서 고정 표시)
    drawDuelHUD(g, genL, genR, hp[0], hp[1], dlg);

    if(t >= 2.75 && !fin){ fin = 1; done(); }
    if(t < 3.45) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function pickFirst(cb){
  $('dp').textContent = '';
  $('dres').textContent = `🎉 [${nick()}] 장수 일기토 승리! 선공(초나라) 또는 후공(한나라)을 선택하세요`;
  $('dpk').style.display = 'flex';
  $('pf').onclick = () => { $('dpk').style.display = 'none'; cb(true); };
  $('pb').onclick = () => { $('dpk').style.display = 'none'; cb(false); };
}

function diceShow(a, b, manual, cb, onCancel){
  const tok = ++dTok;
  clearInterval(dTimer);
  $('dc').style.display = 'flex';
  arenaIdle(a, b);
  $('dn1').textContent = `🐎 ${curDuelGen[0].name} (${curDuelGen[0].title})`;
  $('dn2').textContent = `🐎 ${curDuelGen[1].name} (${curDuelGen[1].title})`;
  $('dres').textContent = '';
  $('dpk').style.display = 'none';

  const go = () => {
    if(tok != dTok) return;
    curDuelGen[0].name = nick();
    curDuelGen[1].name = oppNick || '상대';
    $('dn1').textContent = `🐎 ${curDuelGen[0].name} (${curDuelGen[0].title})`;
    $('dn2').textContent = `🐎 ${curDuelGen[1].name} (${curDuelGen[1].title})`;
    $('drb').style.display = 'none';
    if(manual) $('drx').style.display = 'none';
    $('dp').textContent = `⚔️ [${curDuelGen[0].name}] vs [${curDuelGen[1].name}] — 일기토 격돌!`;
    arena(a, b, tok, () => {
      if(tok != dTok) return;
      const f = a > b;
      $('dp').textContent = `⚔️ 일기토 결과: [${f ? curDuelGen[0].name : curDuelGen[1].name}] 장수 승리!`;
      $('dres').textContent = f ? `🎉 [${curDuelGen[0].name}]님이 일기토에서 승리했습니다!` : `😮 [${curDuelGen[1].name}] 장수가 일기토에서 승리했습니다… 상대가 진영을 고르는 중`;
      cb(f);
    });
  };
  $('drx').textContent = manual ? '취소' : '❌ 대국 거절';
  $('drx').onclick = () => { cancelAnimationFrame(duelIdleRaf); dTok++; $('dc').style.display = 'none'; if(onCancel) onCancel(); };
  if(manual){
    $('dp').textContent = `[${nick()}] 장수와 [${oppNick}] 장수의 일기토(一騎討) 대결로 선공/후공을 결정합니다!`;
    $('drb').style.display = '';
    $('drx').style.display = '';
    $('drb').onclick = go;
  } else {
    $('drb').style.display = 'none';
    $('drx').style.display = onCancel ? '' : 'none';
    go();
  }
}
if(/^#\d{4}$/.test(location.hash)){
  cI.value=location.hash.slice(1);
  setMode('mp');
  setTimeout(()=>{if(RESUMED)return;showInviteModal(cI.value,'',0,false)},500);
}
