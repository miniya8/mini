
const SHEET_B64={"h": {"R": "assets/images/image_02.webp", "K": "assets/images/image_03.webp", "G": "assets/images/image_04.webp", "C": "assets/images/image_05.webp", "N": "assets/images/image_06.webp", "B": "assets/images/image_07.webp", "P": "assets/images/image_08.webp"}, "c": {"G": "assets/images/image_09.webp", "R": "assets/images/image_10.webp", "C": "assets/images/image_11.webp", "N": "assets/images/image_12.webp", "K": "assets/images/image_13.webp", "B": "assets/images/image_14.webp", "P": "assets/images/image_15.webp"}};
const SP={h:{},c:{}};
(function initSpriteSheetSlicer(){
  const CELL=140;
  const ROW_SPEC=[
    {key:'xform',count:6},
    {key:'walk',count:8},
    {key:'atk',count:8},
    {key:'hit',count:6},
    {key:'dead',count:8},
    {key:'rev',count:6}
  ];
  for(const s of ['h','c']){
    for(const t of ['R','K','G','C','N','B','P']){
      const pObj={token:[],xform:[],walk:[],dash:[],atk:[],hit:[],dead:[],rev:[]};
      SP[s][t]=pObj;
      const sheetImg=new Image();
      sheetImg.onload=function(){
        for(let r=0;r<ROW_SPEC.length;r++){
          const spec=ROW_SPEC[r],frames=[];
          for(let c=0;c<spec.count;c++){
            const cv=document.createElement('canvas');
            cv.width=CELL;cv.height=CELL;
            const ctx=cv.getContext('2d');
            ctx.drawImage(sheetImg,c*CELL,r*CELL,CELL,CELL,0,0,CELL,CELL);
            if(s==='c'&&r===0&&c===0){
              try{
                const id=ctx.getImageData(0,0,CELL,CELL),d=id.data;
                for(let py=33;py<=107;py++){
                  for(let px=33;px<=107;px++){
                    const dx=Math.abs(px-70),dy=Math.abs(py-70);
                    if(dx>35||dy>35||dx+dy>52)continue;
                    const idx=(py*CELL+px)*4,R=d[idx],G=d[idx+1],B=d[idx+2],A=d[idx+3];
                    if(A<120)continue;
                    const gb=G-B,lum=0.299*R+0.587*G+0.114*B;
                    if(t==='N'||t==='B'||t==='K'||t==='P'){
                      if(gb>3){
                        const k=Math.min(1,(gb-3)/26);
                        d[idx]=Math.round(R*(1-k)+255*k);
                        d[idx+1]=Math.round(G*(1-k)+246*k);
                        d[idx+2]=Math.round(B*(1-k)+195*k);
                      }else if(gb>-6&&lum<82){
                        d[idx]=Math.round(R*0.35);
                        d[idx+1]=Math.round(G*0.38);
                        d[idx+2]=Math.round(B*0.42);
                      }
                    }else if(t==='G'){
                      if(lum<86){
                        const k=Math.min(1,(86-lum)/32);
                        d[idx]=Math.round(R*(1-k)+255*k);
                        d[idx+1]=Math.round(G*(1-k)+246*k);
                        d[idx+2]=Math.round(B*(1-k)+195*k);
                      }
                    }
                  }
                }
                ctx.putImageData(id,0,0);
              }catch(e){}
            }
            cv.complete=true;
            frames.push({im:cv,w:CELL,h:CELL});
          }
          pObj[spec.key]=frames;
          if(spec.key==='xform')pObj.token=[frames[0]];
          if(spec.key==='walk')pObj.dash=frames;
        }
        if(typeof resize==='function')try{resize()}catch(e){}
      };
      sheetImg.src=SHEET_B64[s][t];
    }
  }
})();
const $=id=>document.getElementById(id);
/* ===== 세로/커버 화면 대응: 가로 레이아웃으로 강제 회전 ===== */
function fitScreen(){
  try{
    const w=innerWidth,h=innerHeight,g=$('g'),inG=!!g&&getComputedStyle(g).display!=='none';
    const rot=h>=w&&!inG,mh=rot?w:h,mw=rot?h:w,rs=document.documentElement;
    rs.style.setProperty('--mh',mh+'px');rs.style.setProperty('--mw',mw+'px');
    rs.classList.toggle('sh',mh<520);
    const els=Array.from(document.querySelectorAll('.mdl'));const tw=$('tw');if(tw)els.push(tw);
    els.forEach(el=>{const s=el.style;
      if(rot){s.top='0px';s.left=w+'px';s.right='auto';s.bottom='auto';s.width=h+'px';s.height=w+'px';s.transformOrigin='top left';s.transform='rotate(90deg)'}
      else{s.top='';s.left='';s.right='';s.bottom='';s.width='';s.height='';s.transformOrigin='';s.transform=''}});
    if(typeof resize==='function') try{ resize(); }catch(e){}
    window.dispatchEvent(new Event('jg-fit'));
  }catch(e){ console.error('fitScreen', e); }
}
fitScreen();
setTimeout(fitScreen, 100);
setTimeout(fitScreen, 400);
addEventListener('resize', fitScreen);
addEventListener('orientationchange', () => { setTimeout(fitScreen, 50); setTimeout(fitScreen, 300); });
if(window.visualViewport){
  visualViewport.addEventListener('resize', fitScreen);
  visualViewport.addEventListener('scroll', fitScreen);
}
document.addEventListener('visibilitychange', () => { if(!document.hidden) setTimeout(fitScreen, 50); });
try{new MutationObserver(()=>fitScreen()).observe($('g'),{attributes:true,attributeFilter:['style']})}catch(e){}
const SETUPS=[['마상마상','왼상차림','RNBG.GNBR','마·상이 같은 쪽에 묶여 좌우 균형이 좋은 기본형'],['상마상마','오른상차림','RBNG.GBNR','상이 바깥에서 마를 받쳐 주는 안정형'],['마상상마','안상차림','RNBG.GBNR','상이 안쪽에 모여 중앙 수비가 단단한 형'],['상마마상','바깥상차림','RBNG.GNBR','마가 안쪽에 있어 중앙 공격에 빨리 가담하는 형']];
let cfg={mode:'ai',lv:'고수',time:45,si:0},turn='c',over=false,inGame=false,busy=false,sel=null,lm=null,anim=null,jang=null,tleft=0,tint,conn=null,peer=null,cv,cx2,W,H,C,CX,CY,OX,OY,flip=false,bc,me='c',hostSide='c',looping=false,wk=null,aiId=0,aiWd,AC;
const toast=(t,ms=3500)=>{const e=$('tt');e.textContent=t;e.style.display='block';clearTimeout(toast.i);toast.i=setTimeout(()=>e.style.display='none',ms)};
const NK='jg_nick_perm';
function loadNick(){try{const c=document.cookie.match(/(?:^|;\s*)jg_nick_perm=([^;]*)/);return localStorage.getItem(NK)||localStorage.getItem('jg_nick')||sessionStorage.getItem(NK)||(c?decodeURIComponent(c[1]):'')||''}catch(e){return ''}}
function saveNick(v){const s=String(v||'').trim();if(!s)return;try{localStorage.setItem(NK,s);localStorage.setItem('jg_nick',s)}catch(e){}try{sessionStorage.setItem(NK,s)}catch(e){}try{document.cookie='jg_nick_perm='+encodeURIComponent(s)+';max-age=315360000;path=/;SameSite=Lax'}catch(e){}}
const nick=()=>{const el=$('ni'),el2=$('ni_ai'),v=(el&&el.value.trim())||(el2&&el2.value.trim())||loadNick();if(el&&!el.value&&v)el.value=v;if(el2&&!el2.value&&v)el2.value=v;return v||'플레이어'};
/* ---------- 화면 맞춤: 하단 내비게이션바에 가려지지 않게 ---------- */
const sab=()=>parseFloat(getComputedStyle($('sa')).paddingBottom)||0;
function fit(){const w=innerWidth,h=innerHeight,sb=sab(),st=$('st').style;document.documentElement.style.setProperty('--vh',h+'px');
if(h>=w){st.top='0px';st.left=w+'px';st.right='auto';st.bottom='auto';st.width=(h-sb)+'px';st.height=w+'px';st.transformOrigin='top left';st.transform='rotate(90deg)';st.padding='0'}else{st.top='';st.left='';st.right='';st.width='';st.height='';st.transform='';st.transformOrigin='';st.bottom=sb+'px';st.padding='0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)'}}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));if(window.visualViewport)visualViewport.addEventListener('resize',fit);fit();setTimeout(fit,300);setTimeout(fit,1200);
/* ---------- 효과음 (초나라) ---------- */
const SFXD={"cannon_attack": "data:audio/mpeg;base64,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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsToAAs0tRznpHoA+xEjXMCUKFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxNwDzol8wiekr4AAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=", "cannon_move": "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAXAAATlgAVFRUVHx8fHyoqKioqNTU1NT8/Pz9KSkpKSlVVVVVfX19fampqamp1dXV1f39/f4qKioqKlZWVlZ+fn5+qqqqqqrW1tbW/v7+/ysrKysrV1dXV39/f3+rq6urq9fX19f////8AAAAATGF2YzYwLjMxAAAAAAAAAAAAAAAAJAaBAAAAAAAAE5aTC5UnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMQAAAmQvRwUtgABixLtvx7wAyeoCAAgBIOhZ76hlf/MzN1687EsRDxOCYA4ExHVsCWTz+/ziwkA3BuDcS1bBgYOZ078zdeYHjnbe970WUpN27/e85RYspqxY53UCGGFMniAeIZDM3ddFG2lIgAABgGIukoxtFeheSn/+ImTLOgzWJxhsXkUFpyFwMhwIBSaahGgvDtMUmhPSgUZJEUsV2Hc0P3Cxz53S/9PE9/jWcUljYKHjvXRq4t7ybf/7Bit/kXVYVeQljMSiiXeFCT/+1LEBYALqPdn/PWAEXQk7Hzxi1KMzZ0blonTDR/IaAYukik0YeVNRJw8Vsx6FGq9keaGp/nFY/P+Y99XUpu4TtOXue1ku4qHTL5lz9vdvf3FFqB1M3ORB1tbGfv+jknUyksn9QD6EBomYYyAAAAvhtHsOyhvth3qQ51eoGNqhF/ipaVhV0ivmc7R/8ZaxnR9X3h/TP+fAufM9fTWt6Q6c1pFGHpvSK20yS7LEbdeO3SEHKZ7cjr78EmnVf/+wUhwEYY6lUBoiYYhAAAAqhXDlP/7UsQGAAuY2WPnrNZRchktfPYOylvqLkhpOkNhVZoK46acoKpyk51LZ/FvmmrNogGPftar4mqWOWK9mxRSGQyr06Ju6Txkem37u+oj+Sf93yGNdvPuFk9s+GtEwOYJRRQPst/0KYXiqlSICSAC+EJEaIl2EygkC0lgTiLNNCoAsjcuImmPDawYTTl861AHuxw7RqXlpJ3LWV4KsONWy8uIaXTfiKigtTia5JLCSZnPd2J7BgfChAi3J4bIf+sPHA0AFUB5mXUyEAAAmi5fCVTA//tSxAcAi/Dlaeeg1xFlmW289g2yS5kBGxwGmh7i1zJZCm5QE5gq15VuaotKNjdRfJs/vW10Zkca8MB4ivA+YizkqKgdZpLI133MTKEG3Vy12Z+7clvA8EW0njz9zGfcwwLU//uQtBeKqUMgBeEI2QoOSgXaYby+KBLH4oTNGZ0J34UlQswaVmbV7WQ2ZzXb7SuuV23lWnT+S98SOmguw2I0Xa+OnT2FWvXFxYw3DQAdLxcwHNVSmtOUO+ZBksOQQYmqljISAAC8KV0lVLQOKur/+1LECIBLyM9t7CB2UYUbbTj2IapiMPS2tGX+ibRy/T60jMpi9GrcRlUzVu53q9xc9avWtxW6ZcaS6BKObJSuCXC2nNbGvmggztyR69f6/eOX7CFBAQCBMw194XhJSv9g2pRaJmEEQABmJaKW6IpZNZKIW/eNjeoQVMOk7rFJ9wu+5Su+nCq70rfhfl1hqFZQSk0yTHTnnxS1FJY00kuMfeUSpasZJrQ6QpcK97ajiIFWTUaOUgmahQJtE73XC3iKfeEKYXqqhTESCAC8Hgr5cf/7UsQGgAogYW/nhTYRRg0uPPSNopySKsKwf5oMjfPDQws7qh9IwQI77yRGx9qXJSxLvnmzkTMiRFRZSzYLmi+RHjUwyYk4sXDwqlENk6gTEy76Ej93+ZSdUYqqhSIiSAC+IJmF25I1ISM/E+r4qf0uiR9oK2kodkicsuUIliILtqzg80BIqOYkOMkEIZASELEw0TC0DnUlilyGDI5JUyYByMVvi4B0/9T5SmF5qYUhFAAArBPAuSjqaTCczC1Rb3wuCQ6VSXbj5E0tWxRNbE+A//tSxBMACiyzbeewbRFFle489gz65uNwxyU92ObkhEizRpRBYlz0v9i22GoJyUymEEo84KCQDSoeNosfV/9RHWxRVU7GREgAl8PS3E4nFpRxNUsoYZg3hS6XIPeWFRc9RkyjZXRi2mTZsJkQLFjbp6P29b6tvncj/IivKzxaIMhJABNBcyXGzhP1tC1/+ogxS75ieZqEIRIAAKwnMgeTop1g81QfrzwSm+C+CxjfWja9bUzFmrA/yzLN5Tz2YTVbIdc+CdIxa4LZp1XRynCE9M7/+1LEH4AKJNNr57Bn0UgZrfz0jPojm5TsoZAjkJhUWPX3PRd/wvSxTVTKmQkEgJ4SEzJTcJAaZbEPFDGxVBADtGjMdKkcGXs9WKVlknett4h1jBgBkrAttQRwRApwjbOXYiMzn7JT2jnPJmAVIFEIYDVhsVtcr/3W1WGImIQxAAAAvBSh9GdyQoptkXn8mLFcOCJcCDBDGlYz2eaS5eZyimILaqAmYOseMQqRjhNm8lpoZQUciGc3I2VNWKmeMlStnP8y/w7QZk/8lYhimpiGIf/7UsQrgIpA8WnnpGfRPZLtfPSM8hBfDESEkcwEsWElypnfpgBwNHQiU1soi+dNZ3Ze6oudU+Jc9UbVCyW0gZkWbDmWZwYi0OmVgIWFgnAABIgUFSIUM+WvS1aPpJmh6nOJiHYhAkAAvBUkmEYdjNSyac6Y9r9TNB0n/mYFE7c7l93Apl0t2zJLrJ5UI/ez9jGDubdpOxzzwl4pTO2o5FMkFOQQROYIxSjN3Od/lqmKJinQhEQLl8IVMOtUKNkveETpugLvNVNRVicomE045EnL//tSxDiASdjNaeeYbxFBnmz48w3ibZh94o43UTahZ5hbDdmena6GpsZQh/6dhfTXlz2yMSgzY1jFrOL/5jR4Qf/7zlVimYmFMhABAK4hFWTG4niLYIdMQ2OidVMJaTzxXqBHag1UIiZHPU7re6q7QrxvQWBq3TWBKnh7djqkqa9LNn0z+0angQAA06URoZ/8GTx84YQ5RMQ7GIAAAFYH6BuHZYETIqtbOswLhiqEl90SdKzrK/SopSBLDwsw6Jwougn5D4pZJAUDGKm4hqmWkNn/+1LERoAKJMlp55hwUUuXrPz2DHoesSlPIUOAAPFjzCAcS029Yvf/yqSqKWKJiIQhAAAALB8W0ncwtSNBozt7pY4BFiERcEBoLQZYwTVHMiEFInwZRGgMgr0W+rrvDgKDVXoz4REsAotwzCERWFtyzNKGzrRhxC+QIav6guLuczNQxkSAACeEyFk1nFAl3CPSkNRyoe5q94e9GyAp4juIxQbPK9BSNzFEiJbTUgtPJ6FaAJGhaGMwmOEU5Bk6rRxuwukQrwMFA6LB+o9S9v8zHP/7UsRSgApMy2XnpGWRShstfPCO4mKZiIUiEkAAuiU7C/aFzTjG8v9eWikDL7ANcOFi9a/kCJhY/RTC9V14Je0XQ5wovkTtzhVrTNvDsufEY7l6dWx/ymoJa4Y+tzB56pT3nqP0OczMypCAJABeDEJyKbUmSlTQ5mMwguHVmR5zFy9lL8CUjR1RNBSDRQlgkUb0gdt+x9SKNl6hpS0IyI8yS1o8++ZL6DgYMi7l5UotQHd/SipiiAmVIRAAACoem8XzZYWaLb+GqqC4jwJUQJtl//tSxF4ACgTRaeewZ9E8mi089gyykg89tEajAIqnmkBCQ1sjBRRbV/4YhZjub09lIyBo1ISagRTiTCmYhgUQA6ULvGtf1IU3/tZIiZdSEAXxQ0ItoNt1Pq9602rEjRRJi/kd0DwNiK1eGuiXcx2uJwvz84sFjuSZk9ciRjz425KdQ3+kXzC1Q2DOea7KhV4f3fgccXYlRCpzmIiVIQIAAKwgEjHpjjEUcS9P9q5DjRan6eplTbQSJkLTduLKmaPVLNVYpo4q7neFu2kNSnkCZ3X/+1LEbACKEL1l56RskTcarPxnjDojiguO3E2vfdhAIQtDIhgOuCSkH0M/5m8sxRMTCmYgAAF4IioUsg1E2T1WoSkJ2zgfzBw5YTA1KpSYQ+mj/TiPu9PQUh8lLbMXUbhogpsjx66O6lmXFQyJ8drmSOLA4xaTTztCVmrP8yxqqmOHiHUhAAAAvB8YIi8U6ntv6YgvG432BtSCyawABEh1SxWdGph1Ojbb1yxDFGPSeEkkJY9s3dVjFT1U0DGQcjGbCA8fWYW6YRgVInI2qEq5/P/7UsR6gAo80WXnmHCRRZmsvLYNKt+wgRsvDfzYmp1KcOEOwgACwq+FwdlKta3/2Y2dQQaCk16QJBljyVcizeqhIke55STmM60Qdp+T0bzXJEW6z7lAx0UUifPinNwzDdqemW8pkvtmC4uKk9XZZX/QKhxo2mvx9CQAAADRsAaWE5YfZ8KyqLXYmmwForECuYm0WY6bNEpxFq2mjZ2eYSrJGG54ufUktg645qJChi3bcsMtrReSrE1KbAYcZaWpBIpVuChIUCLCoIqVQFybf+tJ//tSxIaAi2z9YeeYb5FUmOv89hlK9KUobuDwgAACgw3gatzBumzPcsDIKGEIsd7CSOktIAZJJazzEwxJZiawWyVkZA0qbS0MQR009xfdx7riIIu1hmkeiqkNU48xFZ5mGwZ61Ioo0PQWQl6QsAFHAIOK/XWEuwvHEAAAAB4RH4IhIxSX7GwshYFxwkjZkkWM1pISwQnZiJNDZOncz2hZKbJqRFhJDAkTMNtAnFTaaQtD2kjbCbLmrDcOTLtA1JiA6zqRvFHWRBcfHuUrdzdWm0L/+1LEjACLzMNZpZkuEXAZazz2GGppJf9cfw/hAAVFoIcbiqou//a7fCJHRRqrumSiwcpeFCiVkgn1ZMGtQEYiifO4OZ0MeQInFn85KpYkcWHMw4mNfokBHKF3pMjGQPhEocxbiSEhxpkXGdv5yiyECI6m/8TqStWP8f1kgAABYXDQuOF29RKBUNxGygWRhgBYj51IiAoSRZn1rNiblBA6T485jp6gzoWzYpSfQO2UOhd41VBj1u3pj250yqWhkKlEijqXwbWln+hI4XJIawGyQP/7UsSMgIwU4VXmpM3Bep6q9PMOOgBgoAExMz7jYDgBNUGnHKlJCkybnuMG7MDMY7ubEiW6x2LdIxyCnJxxuG2uj7ZCio2sUuYrUgUiZyemntAGdhspqmi3isozDaSbU3Cr3isR0/9KRqAL6UAAADCsHCir9ZiXj+NIHh+Cws7AZJ6KSRT1EfhW9C7uyZEiDTOBsNKKzH0RGEjSIL6LEnlSo8kloGTRIAIhy3YzY2edWUaUSNng6nKn6VagAMYxAcKgcBsi8BMDrKZ1TcMMkkGH//tSxIqAiqDDW6UkyRFanCp0dJm6dAVROpZCrTUopw6lKMMH00rXhCL2Ujiz1hlZKKbTMC/QoztMoLZlNWLOLprVNdhh26rtyRsU/K3r3e/57WHq1wqAAMcRAAAAQDAPxvPdQQT4RLokiB60lF2lq9Y46RoKohO828AVHkUkZ3mkXhJJka0dSzqOMEHlYXZ7SopMTEkZaFw9ZZE01Q2Sz3XtzL203zAoAASZgAQYIJ//mNeSJG1IjRHyFmUpoRSZak0rphrRMuVFDR9o4cD2tz3/+1LEkoCKQMlTxrDKQVueKfjQJJAQk+DgYAhiQ0k7M9Bz29CgZwVaiX6qoPi0SQpG2c+riGTeKWn+b9MyqgUAAGkwAAAwwFib/qbQCjJYSodhoBRdIioGJCwmdrTqJUSkk1kVVrm/ouzBR41jcRsiCkVX9g0FliwDQU9MBomkEKci42Ws49SoLxXzcbflfsKAkf5XcJKs2hzqwmyIj6HkIqapFsYBYmVZwsFg0TItwRNkqy4pZxUlIn4VDJw1JVxE8hFIpFLSrKE42KRSozyINf/7UsScAIo0yU3oAMSJShqouKSZcTOE1qkS4lLNs9DlNTdy+FUANUAAhWVWTSXYPkwpEQyHhsoRkggdZZQzCnT+P07jNMAu5cCvHELaMIXUaQyxyDfIQaplHKikykEWiEmiUUiTuPlIH+hBrDiFtGEO0+EmTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tSxKeAiiTNPcUkzAlFG6OAICSZqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+1LEtAPJ3IpMxI3uQAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==", "chariot_attack": "data:audio/mpeg;base64,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", "defeat": "data:audio/mpeg;base64,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", "elephant_attack": "data:audio/mpeg;base64,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FRH+K6B7P//AQuyVCos2LC4jMgIJCtVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE5QAHlHEbo4Rrgd61X4A3mQlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTFg8jkgr7BmFDAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV", "elephant_move": "data:audio/mpeg;base64,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JKzsVY5UkSI6DQNFQWgqCrp1QNBwsHYKvt8sDUjKnYKu8Gn8FUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE6YANnI8w1YyAGmKfqPc28AJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTEg8qAbTBcxIAAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV", "guard_attack": "data:audio/mpeg;base64,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n//xOyRSBvMFiINjIoQhgNpBxwekMmDbpMkZ1KqU6///8cQs4kx8VUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxMiAEzGZY/gXgBJGtCVTFRAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LEkIPAAAGkHAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==", "guard_move": "data:audio/mpeg;base64,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", "horse_attack": "data:audio/mpeg;base64,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SeBkrDUDk3ucXErwj9se57GPKiKrQo87qIfQzJxWrq8yL0ivUIAgEyQh+8oCz3t4HYtbMhIqtCUeO2skdHNECDsUBltwmvm+nmitmgFkwROhw8YEgHeQQSEkaYm0bgmiGUtLM+s/3vcm+og0el0xdsv7TyOiZgAwHK5iBB9+ElPdDYAnIbYXnNLGETiU//tSxLCACtRVPcO8aME8DSf4pI3AP1cssX1tpqe+Yds7XNu7vLMKWWw/pmdEsVxtf62dq//vp/9MqG25te6//yTv6c2/ffesSz7DycKOSq/WypXoOVVoAE2/4Op+TREU7siFREes0IdTlga9GcI+akZB5XzNPHlze8+CX1TkyX/jePlFj3fN/WchluV3e136/fb8t3esrbV/9cyn65Pi+x8V18Ch39937gAAE5J3YALQ/1hNT3kAtZDrEo1M8iadLRpsppdb0Roo5R7yt115+Vj/+1LEu4AKVIU94TxowUSP5zjUjcj95ab7bi3Eqk8pUmki8kitAN3kYlIpWmVh0KiJDlMSxjNxCI5FGBkPH3CjL1ouIObGD/Nf9ICbH+cLWZmQvUqWTYY2yzjTFfXO+TGSK0jrD82oZ+lGbhsfxr34qyglm9f/ivhQbU/i6NpzuWvLZWvxx0LIK032+tS24tfj9M3r+bz8/7UYAAoAgp6qgkgARQ+g+dlSFtzOCygKGpW8SuZiU8CoSEXnl9LRKWUdReHEREWARawsBYdESYihQP/7UsTHggq4PTFgtSaJVA2lsNMNyeqW4kKnQ6LgEFSz6A7kpL57rAYAPgA1Qy+lSZQVQ1WVGuiNP/8/0IJkYGhBImv+zlMUEIwELI6xUW9YqGQWEYZdq+LNqFjQVxb4qSAoqZ8Vb1NQBQqSAoqAiapMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tSxNACSySjKYagzcFJGiPU0A3Bqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+1LE2ABJOCUTAYVAgSGUXGQwiiiqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==", "horse_move": "data:audio/mpeg;base64,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", "king_attack": "data:audio/mpeg;base64,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B0plOmThEgYoWG4aMqvWrS1g6sDL2HP/EIPCZtZG//tSxOsDTLSPKk3hK8F8kWWJrCF7EynkArNKiGHjYDGS5ArKFCqsTqEkmkZuGpQlKDRrWTlCvCoowhBpCLCeAZYBkCCoOm8AyFtl3HYhdw1Ltl2gdNJgdCSqSGC5g59ZQ9JZZsCsPVVeV/WvuFTwNL4au4VquF7cKiWajVUIGYpImng97gkAQCDdQxHx5Uu64TeFpS6jMUDWQgIBUEl0XIGtloVV0Q05FHkhQYEuSBQJXoc0gC6jPY+nAgBSfSeTIf5eKaTtq5h1rbsRi3lHkQn/+1LE5oHLwH0sTOHpyV2P5WGcMTnTl0mqgYBdyuu6d2rUZSl8AQE40fgYSu8dCexStMREASKaGvA+kIBInBYCuYv6BaIpMmTgTqL1NZSEEAHCWiuYCDEQEZxoqVqwhMoGkS+QC25a7TLaKUx0ShlOyqzSq1uVVRqVAGL+MaM4nu3HYrJSwpA8mAW44tuL5drbYe5YVCkkGXFoOl6nV5rZYR3BqjJHEkBUdE5cTi6IQjNmMVa48RSCrtH/70Jb//6P7v91KtAADKkYiEwBRQJlbP/7UsTpg0w4eyAs4SvZgZAjgY1gAZQscPuYazwqddNyJshYFShNNlablgea0GiS1gLna8RIrs/SVAQ9/UP8KuVCp09/U921+dPBpG08/K+3LFVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxOYDS4B/HCzgy8FtEKKBnCV4VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE6AMJnG0WTD2HwR+I4AyQpUBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==", "king_move": "data:audio/mpeg;base64,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i5b3OMkHSoliXRh4KJF5uo92SYXI7lCQi1lelQQABUAAAQYVAiBJDDSFChrVqXZVJUmrjKYpciRItIRU2QsypEueCpmW2hYRHRUTNub/+1LEwICKzNVRprDKUUsYqbjTJbmVZVQ2saVLGvsZNXFbalJYuBlyqEUwaypSWRNSRRCsO7tbkkkkISAAdtEJDTx7QKKjCzWTrJm676xRuKt/qFdYp4zi7PNf2//+LMdULmVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTJgIrc4UfDpMsJOptovKYZgFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxNSAClTbL4CBIwCwgGG0EIwCVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=", "soldier_attack": "data:audio/mpeg;base64,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", "soldier_move": "data:audio/mpeg;base64,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i4CMJNVJx4EkgXKaaHjQJJGeX/po1+tgIBUBaZsycntFzJ7VbC60uexdYlUQ0RKMiUqZPdWmJJJIkqcbJROvAZHy4+be106EoyfCUDr4gjqtEEfbJT1drqYSk4kxWOT2i662llxye0suemta1q7lTurIqgQAABA0dPIjTTjJNWoyZRBUFgdB0YI0DbE4Tup5sZKpJTdKKVwu6nB7KIhGhoPlF1F0i5RJNK6VWTOJI3PjJVZNOqqqq4aqIlTTTEFNRTMuMTAwVVVVVVVVVf/7UsSKgIvs8zuGgSSJaxwk1CAwYFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxIsDyTy41qGFIwgAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="};
Object.assign(SFXD,{"f_cannon_attack": "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAoAAAhdwAMDBISGBgYHx8lJSUrKzExMTg4Pj4+RERKSkpRUVdXV11dY2NjampwcHB2dnx8fIODiYmJj4+VlZWcnKKioqiorq6utbW7u7vBwcfHx87O1NTU2trg4ODn5+3t7fPz+fn5//8AAAAATGF2YzYwLjMxAAAAAAAAAAAAAAAAJAV8AAAAAAAAIXdZzdHZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMQAAAp4jTRU9IABdJftJzDwAQAMAWwGwAaAHAcitG+JmmznVbYoIp/kHIW5hcNk6MVgmCYJgmBgSRIxW9RhcKAgKBQFAwKHEYAAMEmdRAxYoFDEIQhnggQIEDGCcEAQBBwkBAMfpA0QsAQAg/AAAA47ZrFaYLhafqUQZFH5lj+QAni8S63zphHKikne7BRUNjmdqFRax9KxXsbElUOcEM28zSh1ND29lpab5b3j7iXvndsxdsEFh+cbxn/+fO//4kDjuFgAABSSCN7kUNr/+1LEBQALSOl0/YEAGXYU7zT0jdK/vl+xdyqZVOwZeycjutgoYVjKCUzEedlGIumpbKyXotF27/8hXMtJ+18SLIUSEHcjEMdDAIlypTv+26oJQqlK+XYh+bsVQ2/er2t73b//fwNtxJEgEqW7CkHiLC+TR7GSjjIOZJK9F4VQ+1QxPlIYbxESrKPdKNql2ayX46hjcGoQiNiVG1ynXJVJGieGUqMEIfFGUEmG2kWHUlVq+1ilqWskKD5sxCjtjWq+lCISWWJogABNujCUZlHOjv/7UsQHAIvA032npGkxdJlsaaglgkkTZdJBgFYJNDI+BlJQtZdAj1lBkilRFIEHJNrrq+3xqbmuyffOSUmv/+huXO+dKXyCkOsFBpRI8EipIKgkEgMSDrvaOArO3/JBVJ3/6AqPGhABTABWqWun2us2mH9dd7pQ16FODlEgnVliURIElBdQRzAg6hNqKIhggCx8umDzYOLngmzIYYLQSFAmQECGz8SlU9SE/kNX2q//eWfCrhOvXv5ngwyCZ6z5wYTGVUwAABPAHM0RSK0JXXXg//tSxAcADCyxYOyxC9FgnmzphInyfxynbbi6ThlJAIIExsgkZlIoMSoyeEYvnRZNx7KRMPhGO7Rm6AP58LUThZUFpksk8iNMB+PY4kKsYabmWUekRTzSrdWU9qMGihoipwgIf5dT2nlH1IgAAVeAa5KopgAwKYEupGuv64LpyiI3ZU1mL2AoKgdUerARzjqBVppg0POHcIzkXPK7GjFXS86iQxUncofctVEjHHU5Cl7kMeyb/wrGknNer/TCyhaipSpQAAACmAIKIYqUY8TMBhD/+1LECAGMFK1fTT0hmWITK6mWJXr2JLknSCP9Qol4GJdhLEh9YCyB0iB5ARvJVxUsFURCjaRnTx8AjUILFgRPJjWC66zKZUq2aPTPNwhK8hl5kv6XZT0fP4666ZETwam///em3sj7F0A3KAMIhS7QAJR+UsTFXNS1HqTiWgFEKSirTNwlZDMD4vHOnJ2eJycSis0grH0pQw5MTpXGCw51SLjl1gMrrGVh1OD212ZTl1+xpk3Ij2PpyYTe57fLqjqlAAACnAOJggKPieiw0NMeSf/7UsQJAIrI82FMJE+RRZFr6ZekMrXPEWmw/EG2uq2y6Myc8kg2uOr+c50wKiHRXiaiy2EMSNpeRpCeTswjQxaxmSfblZ3oVjs8yYp93VH/zHazWp/8V2m6CZUQUwAWrHmxjK5nQo4SCYOI6JjTZDKGlaGIUpExIhWMMPaaEZDkBzUwsVRJLh84RrpKMtyN9hx2KXIthfpRuLJEYNqcHg69DZ7BYFAEOp85TQomkyAAAneAFDPQQlpJYaSChF6JSmFBIS56LeTwlCYBMPNNFLMT//tSxBMACeibZaw8wZFIGmx08w4aqyVS5EwfG3N58JATUznMqL8vVvk72hmNKxclw8BmWDG7IwDhNwcp9wmEbSSIAABe4ANYECXAP0+D/OcwVWuj4Lm0oQZIsLtPVirE2ZJOV6beMspUiNKTA38CgyKLqF9Xd5mvk+4smIzK2kHk9+zqX/ti5gzJ9LaljkK61Qmo0ECAAXeAFmoRuU3FpLEY63Jk0TA7QOzEDw8RqnwbMGMooERLDGaWJncr7yJogitLEBbxOT2bGkrYNrt0UpT/+1LEIADKhKdhrDDI0TcU7BGEjeKeGnN+7zy6zShdyxMFSLxCt3hN1AcjRRAEDmBL5bVxH6SsRBVQfF3KeSyywweaizRsuIW5XrllnJ4pabeqspeF6rdWBhAFYAYI2ZfFIRmCCS2Klt8UwNnWGjmoJDqzGnvdGA4m4SQACZeAGmHk/ipMomqcO8sCnUhkIxOnqnXspNR4wOTIoml5hIuZxiyRSlN4Kb92pAodJphRRiVC5mTm//qpBIrggRoyPkC9N3zzRI2mUAAAXeAALRSyFP/7UsQtAAmotWWnmG7RSBlsNPGKMiHk6Vpe1eSBeMwxy+k1W05phbn6GKAwMWyQM4emAmoIKA0eI5QQgoX6Ud1669I1VRqtp9XLIgd4IW1la3nDOaHDqfHpemoRosoAAAF3gDklNlD4FfdSpxYDmnlOgMJzQVsddGDiEPlidkmeojznYsPVQg3+pRvXenGJl7UYm689U3yFYzWrPrc05b1KQLqph6NFQ8s7oW0iscKokSAACAoSgChZimFR+dh0LwrAqkLCgojTCtPEF51zxBFF//tSxDsASmyxX6wkyRFAGSvxhhhzhB6zZCkCenQo8EGg80SQInaTKJKVlFfN2dzl5RPHKyr3t62dfWqm+fW/NasztT7cQAALvAAcS5yCMnUIqWIuJ8G0kUSc8cy0M3D0fyYEhmqHA4GQgU2CZleJCCagkidhn9egnlseovY1OMKG1KsekPUzqDwPztAWKKFk7tYBLDj6WQV4BC5azhOLEHLYc4T5zF1+7tx1Gzyh/n5mqWL4VSm0gQMWGtMW44ERG2W4uCoWtf1P0k1xPnvHOMz/+1LERwCKOLFfR5hvkTyY6+mDCioocMzOj9mRzl7W+KNBJDnoTwBUKlUAAAqYAAvSYay+rLH2dRyIIi0FwE8TQrrowxHy0Tp5xuYnaQMoyI0hRHBAQbQMGAi5olRJkwmmTl+ncJOXLvenlHlqgwfIjWmzWmVAz1r/UdKiDoAFivHEVtvk8rMobfRxkQf4ONCYfuhwyZxlWzCGWDVNp2tW8cHy0lUJ77jNySrEzw8yYR4pEW5dkDoiGAM9IoXnHGAsYCarlMBMNDcfvhGkUQAAAf/7UsRUgIo0kVtMJM7RRJIraYYZOnQAI2NCdlkzSV6NHh6Ev87dhpDOnaNBgWF2HzRI0OJtLIU0EA82UFAlsxjimuk69AV0ZykajB/fqqI6Wzve7b/9VjmBAacrgtapp0/lVAATMABGOBHHWlH2KM/dOCmtxiD41FJJMxScvP5L6QjhySUAZutjRz6OP91KDW0ynvdYySZq/yXw88P0tb8Ccg4thZSnrexmFV6jHqa3P4QAAAugAJhhEJMISQ6z1NNAnqTisLFhwoWFSNsoQFiB//tSxGEACiipXawkzVE+mWwpgworUqmDJQTaTk0jqaiy7E1RKk1QYSQJr5pFPTjTC3v1350o7nZm9R8LVSNpBBHf/t3Ce8A4UUQAqAAqqB0RnpYcjtDj1w41l6obdldDlEJSEXoqqzD8ZXMMl0pNPLaLIDUvmC1w0Sv44xj8KxpbgyUkU8fczsCCDCUqSlQ0ds8BzpNFCj7kAAACoAEdaCQQtwFMWxOGudr8TZloMjLIQXPljqGGmToMHDZEQNhJCKWBAREAiwkxpCVCgoYdzSD/+1LEboCKWK9dR6TJ2T6S63WGDbIi5Lm5H45TQmNBqlEGgwfe3lD4mSeGl6Q2pCSQACpQAnRegFmzqtIhLPTbQdEwKCRSbBY2NgcQCIEBpcgJVUYbgS2sY7jp4iYpzDZQqXVdSfVWHI0bwTszao9mObG+trVss8vnZN6Xdka0MhZAAAAKoAMLnRdKxACe0WaS5taCZeVXB0OCcfLnDMAYGpPPisjMBzD0pB4TLChKJ46HT0BasNzNcT05+uXVUU0EKElDl23lGSB5Rsl7poJItf/7UsR7AAo4g1lMJMtRTBcr9YSZa0w5ciAS4MC5gnkzmEAAAToAIbusl2yV9HKUfhTWJWoJ2o5ThNNkP5HM7OqozYVrTDOeVQuDGzu4b1D4TKhiua8t7CChiaINhyZg0LSmFZO/JRAQ0FJvVMKp2zGPij7d0jdv9cfBTz/3nNVQAAAeAB40xBiL7T7xNJbVyGuP63j/uwwVdD1LFLYXQwhimwdB8FxcGBMDCH3Q/iZk2cS7BvmSoyXtp8ggUiazBZvQ8gx0jQVsFUi+nH4sdq0p//tSxIaAC3CZVUwwy9F8lqrph5k7TRQu0BHPw2kGIGRlAufHEqoAqAAAUWEuyIimAkD/Jsdp/H6R6qfnQ1sjqbHaW7AUlgeh1ULQbHAuEMexQIxcOzY+AoqBV4RVhKHpWqPTRMbrcXqXMX/y9VpTKx7z7bjoVGO7vvu4JBwYecDsd2oQkAAAAAB0AEFVPsARztMEbhCnpgh/XwbO7j7D6Xx+TlI3MR6Jq1uETikKgwWCODI4HxKfrwnfbKx2kGOMp2ykJLax1Gcxp4lls/Wo0kL/+1LEhwCMJI9M7D2PQXkZaqj2Cbuca/PQkIMgAFWY+/UTreQuwVAAAVQAAGPgsWIRhiCDql79uRPv8xN9nLXIyhdrKk0KZnraSIuSnNtGrl+hkFUwWZhLrM0o85hvvW8UCcTBATvJGuKj/TRB5n7NKqidnUkdtpgCjjGW+ay/0wWmFMb74mokQAAAAoABIyoYsyWeeSnc9D2gR16qIcJEIS2roes7VkoGd4xqRHKCGzmUQNJI9jSAVBSMl5NaOQOCYrNmi2fCIgNqVdVp8rcm1v/7UsSFAQvUs1WsMG3ZgpMqaYel46WxwMnHLcAUg6YPnd1gtaHqDkQACqABEtj8NMvbZ0KZd9Vu7/u44BQniQBwQh8hJwimApIw8F4bIVLyT0ICf1dEtDKAqcDqInnw8HRbWxLVTGoAUGhm9cMKAwmFQI+HBHR6AiF3LDiaOVAAABPAABkTyqIBy6Ig0TqM4r6qtnSbgqEmrFM1NKPZFDKmVEfjA7JwZEojgccdEGMBgnHQDDxdHirUScvai9RX84+7KNoWDmqTv5dzqQxEs7v+//tSxIMBC2iJU0w9h9FZEWqphg16ouoMGGGW+e0xaAAAUAA0NSLVYfTXFvyxlM5J1qpc0SzEqXyZyPkPOAm5fzcYlUyZXSuUBmCyLpl2rLY/hGJQ9Kj4hCugcnZdHPrD/tFq9fC063atHfE4q5WsNqCc4yXTHmaqKIQAAAqgAA9LGSM6UNAgMxK0C4Fa5JAz3hopKwjXJ4ilo+Q2y6O5eKJYOimEzaw6WC8NSeVS8VAeXNKDJkcjhxtGl5jN1bn3nCiAWPKrudrqzOx69/8SNHb/+1LEiAELlNFZR6S1GWeRammHsPpnYIUQ6ABwT/StQKSsyXJKJfBTuQG0cDMfS4YEoSErqY7eQB8Yw5hVpBU4wSS0WFKryeXR74SUCMpJ2j2NEzgQUOZb8kdw8a/3M4wlj0FHpgsZClF2nAAAE8AAHMVJIyCsB8ElIAnVAn1E1FYWNIBGASAZoSIESpKcQoxTcSEgGCJQBLYSDFKcAWFKPRkMdkwxirMP70FcUhfdi6i3Ov/+/UpGWERBIAARCUeeheh6I0UvztoOmQUqS2Uxcf/7UsSKgYtUyVVHsK3RSRUq9YYNenhrIwV0LKp4vqiQSFrLCs5bOjxckMlyJKgrVsEqLR9A9CIiCKkHUrrHUp6W8pgSPuVl/EAqppE0veo5kQAAE8AApFcMc4TuH05iSF4S45jhUqOqSRDJBfiQlpkaiQFhDxsrLCdrhtRtWhtE5WdqE6wyaXFI4u/C9jL1OtBlPvJgSgiSxXMUkTaht5X/OJsHpmzv9g9FQAhfoEvTIQ9EH6nTpW2s1j/Zi+qQ3D8NhtR0dVGYzuRUlGid+hVQ//tSxJIASfh3W0ekzRlGmOrs9gl6fwdgRCQlMFwqZJSFXCjBBsu62qlU33OOMYy60WnWyUVN18wMqOdBJ7SWqnkRAAATwABioexGOxGCZMVGsgrzEAXVoAiRg0LOOCEDx4pskISGgYDaRBJYHkSQXZPxD5IugCAC7Ps9ayXx8bX/ucSD4NhQlAoofM7qwbBAVWEukRpEgATgASJyOwUlfMo3BenEOphYI5kxQsV8TZMKgtboFibRTI0jZURMKCogGhOkVXdZLNeU04pwP06FSq//+1LEnwBLKMtZR7Ct2U0aquD0lmL8DgA4QcsPVfOp0JYvpw4Q4k7CXYZEcF2oNSRAAAACeAAXO2YictaLuAqWNvtIiCaqF40j4cFsT3RzXD5GvLhSjLhiYFKJIS1pxEV5FhVVRICZw9CDQVEiQSebxnLzMdHKWdXjfu5bYvCf1BOHTRVBzIgAAFYAETGE1FkZwvwYGYUAmIAHQ4fHEoi85PhKVLzJWKISmJWlQ9HoI2Wiw2BjSQcDtCnUtLxxO37HDcv8/W+ujiZCsNE2ng/Gn//7UsSmgIpwj1lHpMuRWhsrNPSJu1///9CMJcXzv232PhQAABTAAP58b5oTG0IwsKc5QdD0HD44Eo7KKt+xMIrmjiQDEwPT5OpViIdnR8hNOGBaOF648HmB7Ba9u5iqz59kMtGanLyH8lGStDbPdfF/hRlK6f+/s2AAAAC8AAhcQ9EhGMsUosW2dUxB5UcIIhlkfljdjw8JRXWuqDA8sfkpefhyVR2EA3ahcXG5MeRKDa0P1xUfFJBRlsaNHc1LI8Yu273z/+jY2RZvNTEUSAAA//tSxK+ACtSrV6wwydFcj2po97ALAnQADQV5ukJRJkIeUYhQsB31CMLDAsNJCu8WwwMEQlH0KJUJDpksQkqwajZkksFUrIR2TEM8dLtDO5zQx5XhBicuRlcQ+Vz88c2FLG4BFNgiJIAAEeqJGhx0DeL/FIyhlEOwGgcDuXzmh2shJ1JDwntkkqDsnWoZJXrQamLagwRQKyUJzhigHC+Jc6TW6vm22djyxEW8yhGtFPjK4cerhOYWFRKAIAAClAAncgsAoW81i+JFQGsZi88M0MT/+1LEtoAK8LVVR7DJ2VCZ6mj2DXuB4cYCkShJRtLlyEJSZYVysyPqMXLNoFSxg40RpoWEaSJtEdWpjbva/uvqvd8lWX1s6SrBWHlaKEzj54J3oATAAAjQqYFYrHsDQAx2UBCHY3RBYQF5AjlrRQWNIBppw0wOv0ZKgeKC4mONFEa6tO6JUPBAWDoja/uMTJOg3xD68a3oRhaBESwf+gi7vgq1EaJJBAACmABbopfB9D5E9FjF+jS9ISXBDWksQG2QrpcsQlVWUCAcRB4iDTypiP/7UsS+gMqcqVOnsGvRSBWqEPYZeisSj2WsKGWzD5oYXL+Anl/LsCCxQUtz00I1BtCCYp1v0gQ6ht/sSFkkABGjHJQb4SAuqqJSLcYCqPw53NAKg9kSQhzREyxMTITpDIUnCxMwPtEzbEdg849rokaKa89VIJWXewgjEKdl/FEd47MNvwIPYButNqZAAAACdAAIFHiEIgGWxdhQVWtgbKobmUxCMlJPEof3hzOVp6hksTRyeZUl4aIzw7bPnhAW6WVQ+lI+GS9ItVo3ocmFa0nt//tSxMkAirytU6exKZlGFeooxJnj3FKVAjECgXIHBlhEKB7xht3HKMkEgAIC0xUCjWzIWxOu4k67sCOSVw7FJEUDydxoyySKLtPCAVWauKymiCRkzT/ZcR1rZRHtcgrfq2tWkNHSiyt8FUL2T2/oPTs63/+RWhUkAAAAA+ABFlt6Jj8Ya1GHAdaTsBZzCnBYAbikFkaRXwNR2YJNsnKDPZiMPxcSYCCikoWPQrzJVDIsjdaTkKlTLktxYmQ5jhLgnjDLsoIrnVj3hMLdpRahwQv/+1LE0wBKeKlTp6RtmTgWKiz0iepicyy+6jFlrbqnIbnjWkSSAACpgAhMlwCozxnaQ8Mt1cGbHsoheXzk0Nh0PS0UzhbBZZxV10y84cnmT+Aqlz3y4uBTimcnfQckRhhqrZtqSM5TVn+du+VW9HJXn8yeMW5by6owwAAAA8ACaSZsGMR25CYqRCxlyuijsKYShsHyI44FgEkMMQdJEhYGklqXCCmoQlQEwJ8mSDgti3gyGMrznSo6C+H1CVJyKkN4ULeznWHhbQ41RRTQJaFI/P/7UsTgAEtErUusMGvRPJEpbYYNe+NYbjp0za2hHsd//l6JIW0SIgDgAAqpc/ErDIUkVySooDyjFQfsRFGFLgCyuBA9LY6vsmaG76IOzsuRwgJHcfVp8XgYtE4tFNM0oiurPFLLesWzc+nlUt32TxxJUBBVEhYlZNV1YAAAJQAFsP1EXjuuE0JNFnq+ZU60QJUYRjmKahc0+jUkMRaFlZjDFWcxlFwGu3EQaAU51nEVQqiQi5CkHIMUkzKwK5XKowo51M5ECSIUlEcRpi7skegk//tSxOkADNCrPUw8bcFWlem1hhk73u5dx/i2lFWKrMr6nu4cywEAAAHeAA0zFT5kM5pEESaHI86XR0O6otiApOSeBsrD1EsMS0RljCCShosTlBQeEQ5PDNFrx0mXwsRLFy9cGIY6GNbnWBhHU6TyxKZA3iJ7ehUSAEgAAACQAARLbuy80vcd+FiMXm3da5AM07qiOQoTweqZ5APE5SFMSSJislxTQnhOi0FuLiLAd5/JtoIaf5tHHKXRUqU/E6hygdsqtZF5MRc1YmJRyVAJMVH/+1LE6ICNJI85TD2LyVEWKCj2Cbqa89hgaWQDNjW1iNEAgAkNFlH3IlzEV1uDAUWgd1mhyafbHJvmRkY1HQ/FAlmQvQjEShQuMjsG/Q1FUQLrCvZBoYpr1TI1CRDZpc5c6tKYw5jGe/fOwpM+z+JgAAG/CJKuUuV1oKYUvguEqYvUjY0x4mRrApCluIsjdJjIHZ8pelDbXiyFebWXHbE6SG5ZSGRwl1Vwu29i72cqmTuElFuip4gx/GWfpACWMiuJk/XStWVlsN2ddOEhy2hOyf/7UsTngAykqTbsPSvJTJUoNPYNeDq7jLTw3GywgsCADMVd8sgiAG7uKyOXMORaEREwqFAlQ/2QWlAHUTqceAtxvuBHF6UgsSEGiTxDoAtrU5NiJLabJRCBCgFwwIxucqApMyjZG0yeNPurVrrj//2vWmJbKgUWhupAAICPRi7trvfZL5r8FKxtJchjDFV0O0sZyGlIFGMRYhay4Bq3In5jDKYx5D4JlcOA3wQJwoeHDk+iDiTJU7UJO0lYtS7io02EClSfdD1I8V27eI/H9Aow//tSxOkAzISnNaw8bcE+FScRhgm5zbxopCzcrV7P10lJAAADAAAadfrQn462ZyX+eCMPs8ic+DshVPhCB8efHtKYhYR7lsSislBwcjo+FfHhDPC88MHClvkWpWpAISwkcTRIi4JapCwZvu5nx289OISuRIrVBAFxWs0SmmohZXj1R5TW26EcXs4byqXPynS8aYSzWWQE6Cxm/nWWIzgNaeP1KWLMmJK2Q8SnJETpUEpPw9ygiUJ6YsZJtqLaIRypZOotWO2mCGJJj8khieslh8H/+1LE7QGNUKMmrL04SWsS5aWHsTkTESuoMTGRywwVVgBtnpT7gRsCXr1tdgZGBkmKVapMV4BmO8NER8gg5TVEkEIHyJkB+OwlxgHccZanZZsOQ7mJWj6HCf0YtzUSVUL6URTminzAoXywsoEbp1iyxm86cdi+uOxjDsKY1QLagaxGDKBjbWH/uuM0ZkSIbjeNdGMSfPEfiEnmwIUc8V0mz2L0nw5ScpZJIhbLkxvS4K8XYlJ4nuSVXn0haEqwsU4Loh+QaWNuxfTolWWiKSxaWP/7UsToAAxIoSasvM+JU5TlqYYZedCZ5d3SU8Uvd+SOi/kQXXAzko+py0zM2HKglRrG+OFCS7GeiGAuRMzvRD0yTXLEsEZHDK9QcxkEiK6Er00PpUElL0d56sCYJie6IKkxB8xk8rY6iW1cFhCwwtK6CayWeUl5h+1MQU1FVVUDzLZdSFkPkREAJZAw8RDZ2NGoSFMSUolFWxCTHJ8aRjidHBk8FTKAk4rHbh8SiWRLqlMa1FC6yeCeYVezF12VrUed25jNFE0u7tTEf+r/9n0///tSxOoDjAChICw81MGOFONBp7G4/WDAhISXOITMteiQs1RBPX22NQEipUNFQVCR4KhqGixJYhBU6JVfZ/yrhL/5b/yX/rO8qlVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUJaDxqicLDJRGSNqJpJLqTzWMHRIIjRA5H/s5RIRGBQTEDkdr/+1LE5gPLHJsaDL0rwXuT4kGHjbmIvoqIqUX+5TCIwYpHqYRGDBpDs///+iWdv7sYREho0QO1CiQ0aIzP/WKiweiwuKmfQFRRr0xBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTlAApsnRIsJYEAy4ijpJCMfFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxM4DyyEizSSArGAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=", "f_cannon_move": "data:audio/mpeg;base64,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fJ/+Vqnfxn/olXWy0j1nWTq5FUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxIyACkRnReYYbsEnDaNElDAQVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LEnIPASAIADQAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==", "f_chariot_attack": "data:audio/mpeg;base64,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", "f_chariot_move": "data:audio/mpeg;base64,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", "f_defeat": "data:audio/mpeg;base64,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hlw1QVBVYOBqRJvF/4Eosku/5FhRRo1MQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE5AAKiD8QTLzDwL+Fo+jAjARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTWg81BSvBHmGcoAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV", "f_elephant_attack": "data:audio/mpeg;base64,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z/6AqCQTDLsVIhIkFAKKmepuwy3gJtVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE7IOMZIMILDBRAVGMoMSUmHhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTOA8sEMuhGDMJAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV", "f_elephant_move": "data:audio/mpeg;base64,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", "f_guard_attack": "data:audio/mpeg;base64,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", "f_guard_move": "data:audio/mpeg;base64,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", "f_horse_attack": "data:audio/mpeg;base64,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Fk6g5CAR9FRyRVVMgJCIinxbRDQxSUlAF+oi0N03WxCzKPcOYiC8hHIKEM5+j3QFy5ECUyBhEFTCnnQSHxwInmBOWSOtpRnLfGaKKX012oJSpIAgAHBkmnfasNAFdJFkQl4UGB9GMF2nDgjk+IWNGGpTkMpDDmOFDy0TqpamR4eyMMAgxcjp0bj80Txf//tSxKIDymCTJi08y9laEeQBp6V5otVo+ID5le3ksXLZsH9UeltCOIQBhpQoUhhC/x4QABoAgAQgs7SREVQSo+K2s2cWAm2eBynZUo4w12UQnBjBblKVpwtRSn8LoiDSLeSgL85jmSELwKgSBInNlsrFlKaKTB98+s9t00oSxcCBTsr1YlEFhU5ngAQBC9ZwHxDSaEMQwhBJzOP4e4sJeToPBfOpTltQxGn6excjyMJdUO45SlTJ/R00dK2+Rr6VIqJUkgqjSRkJI5rQpjndC2j/+1LEqwPK/I0eLT0NiU8Ro8GnpbAAAJa24G0TSZVK1ChrIwGZgbBKIJZRlNFwljUJLnDyKMyN0nJI0oG2Qg0NERMzXeWWiJlmY+/9S+zfo//+/1f+v7rOpgGAA1ZJSEa3QKIJPD6BHIiQgSYRiyBiAZyBJw5JDAo5E+S6WfKuROtDecdW5mG1YSOUBhLZ7vrb/2f+jev96f/bRff01QESm5B8rJIFw0AgEA2idvmZOkiRRav/wUJau3N3/Z5xKiOEqAqjxYd87+r//1K4t/6B1P/7UsSzA0q8hRgMvZRJSI/jBaeZeT3/9uRv7moAGDRHi/hgOwBOLKPuWo2N+InHoJT/VXlPjaaWokbCw0FAKRhVCQkBWBUBN9IuZ1oCoCEoUNf1kQl1dRJ8jHsUSCtYsHjQr3/F8iCxFUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxL0ACMRzJUewxsEQDuPdhJgoVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE1YMHSGMWZ5jAATEKnUj2GABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==", "f_horse_move": "data:audio/mpeg;base64,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", "f_king_attack": "data:audio/mpeg;base64,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OCjvka+fmXPy8oebHy05vuVr2QcFWTQZeKKQYGhq//tSxOcACxxTSUwxJwF3E6gphgz4fZbWHB98WSkUsu3dfxULPRpgq/StEFSuEFCS6pSiPYjqu0KZEvcJR5EjHSojYNAwDkoIWjYdRP2yAlQxR+HJxacCqmCjDp8XQ8g4y9iAUpGvSi8CuI2ItmWNktG9ag84AClkbRDFFeKZaijOBFKOJFhHp4zBjmE5OejIShskQVNQkgxJZ20yW02PUfCiIlWPCZxxMRkDBIXIlmHYOwUMAJ02RLKcsVj5a1FFM6HVdxCi9dyG//+lpQAY2mD/+1LE6YAMJFVBTD2CQX2V6CmGDWiDRANgOSiiFGeBSh7YXREoDw/tj6XR5EAnKisCJpiyJTQQh9ETKzS4R+z/5dkSjjEMPDhcgACqjgkYZyRJUjU87sXBkqEz/bPLsb68O6CsJfYeb0/mqgQAyJEAraAIgU5+ptySCoBCy5KInw4ny0W1Z6lJScKdZW5rNFobVaiDiDjClZlUTAzSimI1DM4mNagqGtEg0eqDoNHkHYK1hJ5L7ALsS3/yrlP8l/KyT/drctwlAEQkBzk0W8gaGf/7UsTnAAyA5UWnmG8hPY4o9PSNjIou5fLpjAdluM9QShUTx9MlyyGkkyWpkXEwjGQ2kGS8smaTnVgUY/SEn8qIpE6WasYBTN0SsUBdp3CTFiKE3HTxWp64aPNrARIqQU8ramGj3BYiMK9JIcEgK4K1TEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxOsACyxhN0ewxUFnjaVc9hjwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LE7wELgIMc7DxlwZWKXsWGPRhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==", "f_king_move": "data:audio/mpeg;base64,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JAM2c9EOTVZBsam1JrHWGOpZsoHCJ5DAWGBwGnuROVG0MJKIPElah3lVRRuMNUuMR7tjutBVlGnv+9uaCSrQAAANSRAUTSzRKEYXNHz/+1LEtIAKsK1d5hhuYVwNqjz2GUgKjq0KSbx0tw6BsOEhJ1gyXeccFCeaiSSfKqSiQFKhoShqnh0YsBPEQ86rLHuMPM3IyxXnVBVHEt/zwa52RARMhEXYeJhrGdXHJ0clYUhcNQ9mC+Bk6HkVDUVzx+lToqkIhFc4X0vR+KoqGQELJ4p/UL//irf/ioo3V/qZ/UKzKm/1ilVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsS8AAqkcUvnoM4BV4ypPPSNIFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxMSACdhhMaEww4EVi53IkbBQVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=", "f_soldier_attack": "data:audio/mpeg;base64,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", "f_soldier_move": "data:audio/mpeg;base64,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hYALUFdR5iTMQV6TaLD0jTjv+pO2zNEIG2uJG6ZM3YoxvD+DkzEUxBqWTpKDURSRIGSpyKLG5WkcOSNPI5W/96OSHA09CgqEjx4OtqCoSBqtJYKnsFSz94lO+DQ9wiDtZ2dd+Wf8qd//kQBBIUjgTzQtGJ0lSpkqRtiFCQ0NZG6KIJJphEabZRKrKkQyHg8RoG3GsVirOtuKijfxYXZ///AQSFQy7628UQaFRVvF2fiopUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVf/7UsSKAAtImz0nmHDBWwwmtPYY2FVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tSxI+DyPRk0CYFMIAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="});
const SFN={R:'chariot',N:'horse',B:'elephant',P:'soldier',G:'guard',K:'king',C:'cannon'},SFXB={};let sfxInit=false;
function sfxLoad(){if(sfxInit)return;sfxInit=true;try{AC=AC||new(window.AudioContext||webkitAudioContext)();for(const k in SFXD){const bin=atob(SFXD[k].split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);AC.decodeAudioData(u.buffer,b=>{SFXB[k]=b},()=>{})}}catch(e){sfxInit=false}}
function sfx(k){try{if(!AC||!SFXB[k])return;if(AC.state=='suspended')AC.resume();const o=AC.createBufferSource(),g=AC.createGain();o.buffer=SFXB[k];g.gain.value=.9;o.connect(g);g.connect(AC.destination);o.start()}catch(e){}}
addEventListener('pointerdown',sfxLoad);
/* ---------- 시작 화면 (2단계 메인 메뉴: 멀티 대전 / AI 대전 선택형 리마스터) ---------- */
const FR=$('fr'),FW=2576,FH=1438;
FR.innerHTML=`
  <div id="lobby_wrap">
    <div class="lb-header">
      <div class="lb-title-box">
        <div class="lb-title">⚔️ 세미니의 멀티센터 전설장기</div>
        <div class="lb-sub" id="lb_top_sub">메인 메뉴에서 [멀티 대전] 또는 [AI 대전]을 선택하세요</div>
      </div>
      <div class="lb-top-btns">
        <button type="button" class="lb-util-btn" id="lb_kibo_quick_btn">📜 기보/훈수</button>
        <button type="button" class="lb-util-btn" id="lb_rec_btn">📊 멀티 전적</button>
        <button type="button" class="lb-util-btn rp" id="lb_rp_btn">🎬 리플레이</button>
      </div>
    </div>

    <!-- [1단계: 초기 메인 화면 - 큰 버튼 2개만 표시] -->
    <div class="lb-view active" id="lb_home_view">
      <div class="lb-hero-grid">
        <div class="lb-hero-btn mp" id="lb_go_mp">
          <div class="lb-hero-icon">👥</div>
          <div class="lb-hero-title">멀티 대전</div>
          <div class="lb-hero-desc">친구와 실시간 1:1 온라인 대국<br>초대코드 방 만들기 · 코드 입장 · 4인 관전</div>
          <div class="lb-hero-tags">
            <span class="lb-hero-tag">🔑 4자리 코드 초대</span>
            <span class="lb-hero-tag">📩 수락/거절 지원</span>
            <span class="lb-hero-tag">👁️ 실시간 훈수펜 관전</span>
          </div>
        </div>
        <div class="lb-hero-btn ai" id="lb_go_ai">
          <div class="lb-hero-icon">🤖</div>
          <div class="lb-hero-title">AI 대전</div>
          <div class="lb-hero-desc">삼국지 5단계 난이도별 도전 모드<br>장기 명국 기보 연구 · 실시간 AI 훈수 교육</div>
          <div class="lb-hero-tags">
            <span class="lb-hero-tag">🏆 난이도별 도전</span>
            <span class="lb-hero-tag">🎓 AI 훈수·교육모드</span>
            <span class="lb-hero-tag">📜 정석·명국 기보</span>
          </div>
        </div>
      </div>
    </div>

    <!-- [2단계-A: 멀티 대전 상세 화면] -->
    <div class="lb-view" id="lb_mp_view">
      <div class="lb-sub-top">
        <button type="button" class="lb-back-btn" id="lb_back_from_mp">⬅ 메인 메뉴로</button>
        <div style="font-size:max(11px,calc(1.35*var(--u)));font-weight:900;color:#82b1ff">👥 멀티 대전 설정 및 입장</div>
        <div style="width:calc(6*var(--u))"></div>
      </div>
      <div class="lb-common-bar">
        <div class="lb-field">
          <div class="lb-field-label"><span>👤 플레이어 닉네임</span><small>자동 저장</small></div>
          <input id="ni" placeholder="닉네임 입력 (최대 12자)" maxlength="12" autocomplete="off">
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>⏱️ 차례 제한시간</span><small>초읽기</small></div>
          <div class="lb-seg" id="lb_time_seg"></div>
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>♟️ 내 포진(차림)</span><small>클릭 변경</small></div>
          <button type="button" class="chip on lb-setup-btn" id="lb_setup_btn"></button>
        </div>
      </div>
      <div class="lb-card sel" id="lb_card_mp" style="flex:1;justify-content:space-around">
        <div class="lb-card-head">
          <div class="lb-card-title">⚔️ 온라인 1:1 대국 & 실시간 관전 <small style="font-size:0.75em;color:#9fb8e8;font-weight:700">(P2P 즉시 연결)</small></div>
          <span class="lb-card-badge" id="lb_badge_mp">온라인 대기</span>
        </div>
        <div class="lb-card-body">
          <button type="button" class="lb-btn-gold" id="lb_mkroom_btn">💬 방 만들기 (4자리 초대코드 발급)</button>
          <div class="lb-join-row">
            <input id="ci" placeholder="초대코드 4자리 입력" maxlength="4" inputmode="numeric" style="text-align:center">
            <button type="button" class="lb-btn-blue" id="lb_join_btn">⚔️ 대국 참가하기</button>
          </div>
          <button type="button" class="lb-btn-spec" id="lb_spec_btn">👁️ 관전자로 참여하기 (최대 4명 · 판 위 실시간 훈수펜)</button>
        </div>
      </div>
    </div>

    <!-- [2단계-B: AI 대전 상세 화면 (난이도별 도전 / AI 훈수·교육 / 장기의 기보)] -->
    <div class="lb-view" id="lb_ai_view">
      <div class="lb-sub-top">
        <button type="button" class="lb-back-btn" id="lb_back_from_ai">⬅ 메인 메뉴로</button>
        <div class="lb-ai-tabs">
          <button type="button" class="lb-ai-tab on" data-aitab="chal" id="ai_tab_chal">🏆 난이도별 도전</button>
          <button type="button" class="lb-ai-tab" data-aitab="coach" id="ai_tab_coach">🎓 훈수 · 교육모드</button>
          <button type="button" class="lb-ai-tab" data-aitab="kibo" id="ai_tab_kibo">📜 장기의 기보</button>
        </div>
      </div>
      <div class="lb-common-bar" style="grid-template-columns:1fr 1fr 1fr">
        <div class="lb-field">
          <div class="lb-field-label"><span>👤 내 장수 닉네임</span><small>일기토·대국 표시</small></div>
          <input id="ni_ai" placeholder="닉네임 입력 (최대 12자)" maxlength="12" autocomplete="off">
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>⏱️ 내 차례 제한시간</span><small id="lb_lv_hint">고수 (최강 수읽기)</small></div>
          <div class="lb-seg" id="lb_time_seg_ai"></div>
        </div>
        <div class="lb-field">
          <div class="lb-field-label"><span>♟️ 내 포진(차림) 선택</span><small>클릭하여 변경</small></div>
          <button type="button" class="chip on lb-setup-btn" id="lb_setup_btn_ai"></button>
        </div>
      </div>

      <!-- 탭 1: 난이도별 도전 & 자유 대국 -->
      <div class="lb-ai-pane on" id="ai_pane_chal">
        <div class="lb-chal-grid" id="lb_lv_seg"></div>
        <button type="button" class="lb-start-btn" id="lb_start_btn">
          <span id="lb_start_txt">🎲 AI 대국 시작하기 (고수)</span>
          <small>(선공 결정 주사위 굴리기)</small>
        </button>
      </div>

      <!-- 탭 2: AI 훈수 · 교육 모드 -->
      <div class="lb-ai-pane" id="ai_pane_coach">
        <div class="lb-list-grid" id="lb_edu_list"></div>
        <button type="button" class="lb-start-btn" id="lb_coach_start_btn" style="background:linear-gradient(180deg,#1e88e5,#0d47a1);border-color:#90caf9">
          <span>🎓 AI 실시간 훈수 코칭 대국 시작</span>
          <small>(최선수 화살표 추천 · 무제한 무르기)</small>
        </button>
      </div>

      <!-- 탭 3: 장기의 기보 (정석 · 명국 도서관) -->
      <div class="lb-ai-pane" id="ai_pane_kibo">
        <div class="lb-list-grid" id="lb_kibo_list"></div>
      </div>
    </div>

    <div id="lb_card_ai" style="display:none"><span id="lb_badge_ai"></span></div>
  </div>
`;

const mS=$('lb_card_mp'),aS=$('lb_card_ai');
const LV_DESC={'초보1':'초보1 (황건적 토벌 · 입문)','초보2':'초보2 (호로관 전투 · 기초)','초보3':'초보3 (적벽대전 · 중급)','중수':'중수 (한중 공방전 · 숙련)','고수':'고수 (오장원 결전 · 최강)'};
const CHAL_STAGES=[
  {lv:'초보1',step:'1단계 도전',boss:'⚔️ 황건적 장각',desc:'장기 입문용 · 실수가 잦음'},
  {lv:'초보2',step:'2단계 도전',boss:'🐎 호로관 화웅',desc:'기초 행마와 기물 교환'},
  {lv:'초보3',step:'3단계 도전',boss:'🔥 적벽의 주유',desc:'포진 전개와 기본 전술'},
  {lv:'중수',step:'4단계 도전',boss:'🐉 한중왕 유비',desc:'탄탄한 수읽기와 공방'},
  {lv:'고수',step:'5단계 최종',boss:'👑 대승상 조조',desc:'정밀 탐색 · 최강 기력'}
];

window.coachMode=false;
window.coachHints=[];

function loadChal(){
  try{return JSON.parse(localStorage.getItem('jg_chal')||'{}')||{}}catch(e){return{}}
}
function saveChalWin(lv){
  try{
    const d=loadChal();
    d[lv]=(d[lv]||0)+1;
    localStorage.setItem('jg_chal',JSON.stringify(d));
    renderChalCards();
  }catch(e){}
}
window.saveChalWin=saveChalWin;

function showLobbyScreen(scr){
  $('lb_home_view').classList.toggle('active',scr==='home');
  $('lb_mp_view').classList.toggle('active',scr==='mp');
  $('lb_ai_view').classList.toggle('active',scr==='ai');
  const sub=$('lb_top_sub');
  if(sub){
    if(scr==='home')sub.textContent='메인 메뉴에서 [멀티 대전] 또는 [AI 대전]을 선택하세요';
    else if(scr==='mp')sub.textContent='친구와 1:1 온라인 대국 또는 최대 4명 실시간 관전';
    else sub.textContent='난이도별 AI 도전 · 실시간 훈수 코칭 · 장기 명국 기보 학습';
  }
}
window.showLobbyScreen=showLobbyScreen;

function switchAiTab(tab){
  ['chal','coach','kibo'].forEach(k=>{
    const tb=$('ai_tab_'+k),pn=$('ai_pane_'+k);
    if(tb)tb.classList.toggle('on',k===tab);
    if(pn)pn.classList.toggle('on',k===tab);
  });
}
['chal','coach','kibo'].forEach(k=>{
  const tb=$('ai_tab_'+k);
  if(tb)tb.onclick=()=>switchAiTab(k);
});

$('lb_go_mp').onclick=()=>{setMode('mp');showLobbyScreen('mp')};
$('lb_go_ai').onclick=()=>{setMode('ai');showLobbyScreen('ai')};
$('lb_back_from_mp').onclick=()=>showLobbyScreen('home');
$('lb_back_from_ai').onclick=()=>showLobbyScreen('home');
$('lb_kibo_quick_btn').onclick=()=>{setMode('ai');showLobbyScreen('ai');switchAiTab('kibo')};

function setMode(m){
  cfg.mode=m;
  if(mS)mS.classList.toggle('sel',m=='mp');
  if(aS)aS.classList.toggle('sel',m=='ai');
  const stTxt=$('lb_start_txt');
  if(stTxt)stTxt.textContent=`🎲 AI 도전 대국 시작 (${cfg.lv})`;
}

const lvB={};
function renderChalCards(){
  const seg=$('lb_lv_seg');
  if(!seg)return;
  seg.innerHTML='';
  const ch=loadChal();
  CHAL_STAGES.forEach(st=>{
    const n=st.lv,wins=ch[n]||0;
    const stars=wins>=3?'★★★':wins===2?'★★☆':wins===1?'★☆☆':'☆☆☆';
    const b=document.createElement('div');
    b.className='lb-chal-card'+(cfg.lv===n?' on':'');
    b.innerHTML=`
      <span class="lb-chal-step">${st.step}</span>
      <div class="lb-chal-name">${n}</div>
      <div class="lb-chal-boss">${st.boss}</div>
      <div class="lb-chal-stars" title="승리 ${wins}회">${stars} <small style="color:#9ec0ff">(${wins}승)</small></div>
    `;
    b.onclick=e=>{
      e.stopPropagation();
      cfg.lv=n;
      for(const k in lvB)lvB[k].classList.toggle('on',k==n);
      const hint=$('lb_lv_hint');if(hint)hint.textContent=LV_DESC[n]||n;
      setMode('ai');
    };
    seg.appendChild(b);
    lvB[n]=b;
  });
}
renderChalCards();

const tB={},tB_ai={};
[30,45,60].forEach(n=>{
  const mkT=(holder,mapObj)=>{
    const b=document.createElement('button');
    b.type='button';b.className='chip';b.textContent=n+'초';
    b.onclick=()=>{
      cfg.time=n;
      for(const k in tB)tB[k].classList.toggle('on',k==n);
      for(const k in tB_ai)tB_ai[k].classList.toggle('on',k==n);
    };
    holder.appendChild(b);
    mapObj[n]=b;
  };
  mkT($('lb_time_seg'),tB);
  mkT($('lb_time_seg_ai'),tB_ai);
});

const sB=$('lb_setup_btn'),sB_ai=$('lb_setup_btn_ai');
sB.onclick=sB_ai.onclick=()=>{drawSetups();$('md').style.display='flex'};
function showSetup(){
  const s=SETUPS[cfg.si],txt=`${cfg.si+1}. ${s[0]} (${s[1]}) ▾`;
  if(sB)sB.textContent=txt;
  if(sB_ai)sB_ai.textContent=txt;
}
function drawSetups(){$('sl').innerHTML='';SETUPS.forEach((s,i)=>{const b=document.createElement('button');b.className='op'+(i==cfg.si?' on':'');b.innerHTML=`<b>${i+1}. ${s[0]}</b> <small>(${s[1]})</small><span>${s[3]}</span>`;b.onclick=()=>{cfg.si=i;showSetup();$('md').style.display='none'};$('sl').appendChild(b)})}
$('mx').onclick=()=>$('md').style.display='none';

const nI=$('ni'),nI_ai=$('ni_ai'),cI=$('ci');
cI.onclick=e=>{e.stopPropagation();setMode('mp')};
const initNickVal=loadNick();
if(nI)nI.value=initNickVal;
if(nI_ai)nI_ai.value=initNickVal;
['input','change','blur'].forEach(ev=>{
  if(nI)nI.addEventListener(ev,()=>{const v=nI.value.trim();if(nI_ai&&nI_ai.value!==nI.value)nI_ai.value=nI.value;if(v)saveNick(v)});
  if(nI_ai)nI_ai.addEventListener(ev,()=>{const v=nI_ai.value.trim();if(nI&&nI.value!==nI_ai.value)nI.value=nI_ai.value;if(v)saveNick(v)});
});
addEventListener('pageshow',()=>{const v=loadNick();if(nI&&!nI.value)nI.value=v;if(nI_ai&&!nI_ai.value)nI_ai.value=v});
$('lb_mkroom_btn').onclick=e=>{e.stopPropagation();if(nI.value.trim())saveNick(nI.value);setMode('mp');mkRoom()};
$('lb_join_btn').onclick=e=>{e.stopPropagation();if(nI.value.trim())saveNick(nI.value);setMode('mp');joinRoom(cI.value,false)};
$('lb_spec_btn').onclick=e=>{e.stopPropagation();if(nI.value.trim())saveNick(nI.value);setMode('mp');joinRoom(cI.value,true)};
$('lb_rp_btn').onclick=()=>{if(window.openReplayMenu)window.openReplayMenu()};
$('lb_rec_btn').onclick=()=>{if($('xrec'))$('xrec').click()};
$('lb_start_btn').onclick=()=>{
  const nv=(nI_ai&&nI_ai.value.trim())||(nI&&nI.value.trim());
  if(nv)saveNick(nv);
  window.coachMode=false;
  startAI();
};
$('lb_coach_start_btn').onclick=()=>{
  const nv=(nI_ai&&nI_ai.value.trim())||(nI&&nI.value.trim());
  if(nv)saveNick(nv);
  window.coachMode=true;
  startAI(true);
};
if(lvB['고수'])lvB['고수'].classList.add('on');
if(tB[45])tB[45].classList.add('on');
if(tB_ai[45])tB_ai[45].classList.add('on');
setMode('ai');showSetup();
/* ---------- AI 스레드 ---------- */
function mkWorker(){try{const src=$('rules').textContent+';onmessage=e=>{const d=e.data;B=d.B;if(d.k==="hint"){let r=null;try{r=E_hint(d.s,d.n,d.t)}catch(x){}postMessage({k:"hint",id:d.id,r});return}let m=null;try{m=aiPick(d.s,d.lv)}catch(x){}postMessage({id:d.id,m})}';wk=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));wk.onmessage=e=>{const d=e.data;if(d&&d.k==='hint'){if(window.coachRes)window.coachRes(d);return}aiDone(d)};wk.onerror=()=>{wk=null}}catch(e){wk=null}}
function aiThink(s){const id=++aiId,lv=cfg.lv;clearTimeout(aiWd);aiWd=setTimeout(()=>{if(aiId==id&&!anim&&!over){aiId++;aiDone({id:aiId,m:null})}},9000);
if(wk)wk.postMessage({id,s,lv,B});else setTimeout(()=>{let m=null;try{m=aiPick(s,lv)}catch(e){}aiDone({id,m})},30)}
function aiDone(d){if(d.id!=aiId||over||anim||busy||turn==me)return;clearTimeout(aiWd);let m=d.m;if(!m){try{m=aiPick(turn,'_q')}catch(e){m=null}if(!m){const L=legal(turn);m=L.length?L[Math.random()*L.length|0]:null}}if(m)doMove(m)}
/* ---------- P2P (친구 초대 1:1 + 최대 4명 관전자) ---------- */
function lib(){if(window.Peer)return true;toast('P2P 모듈을 불러오지 못했어요. 인터넷 연결 확인 후 새로고침해 주세요');return false}
let specs=[],isSpec=false,wantSpec=false,cNick='',hNick='';
function bcast(msg,ex){if(conn&&conn.open&&conn!==ex){try{conn.send(msg)}catch(e){}}specs.forEach(s=>{if(s.c&&s.c.open&&s.c!==ex){try{s.c.send(msg)}catch(e){}}})}
function closeNet(){try{conn&&conn.close()}catch(e){}specs.forEach(s=>{try{s.c&&s.c.close()}catch(e){}});specs=[];try{peer&&peer.destroy()}catch(e){}conn=peer=null;isSpec=false}
let code='',rmS=false,rmO=false,isHost=false,hostDice=false,hostReady=null,dTok=0,dTimer=0,gs=null,mc=0,sid='',dropT=0,jTok=0,jLast=0,RESUMED=false;
function keepAlive(pr){pr.on('disconnected',()=>{setTimeout(()=>{if(peer===pr&&!pr.destroyed){try{pr.reconnect()}catch(e){}}},1000)})}
function mkRoom(c0,tries){if(!lib())return;tries=tries||0;closeNet();code=c0||String(1000+Math.random()*9000|0);isHost=true;isSpec=false;if(!c0&&!tries)toast('방을 여는 중…',4000);const pr=peer=new Peer('sjg-'+code);keepAlive(pr);if(!c0)setTimeout(()=>{if(peer===pr&&!pr.open&&$('rm').style.display!='flex')toast('서버 연결 대기 중…',3500)},6000);
pr.on('open',()=>{if(peer!==pr)return;if(!c0){clearTimeout(toast.i);$('tt').style.display='none'}$('rc').textContent=code;if(!(inGame&&!over)){$('rs').textContent='상대 입장 대기 중…';$('rm').style.display='flex'}save()});
pr.on('connection',c=>{if(peer!==pr)return;netEvents(c);c.on('open',()=>{setTimeout(()=>{if(c._isSpec||c._handled)return;if(conn&&conn.open){addSpec(c,'관전자');return}conn=c;clearTimeout(dropT);if(inGame&&!over&&cfg.mode=='mp')sendSync();else{isHost=true;oppNick='상대';hostOfferInvite(c)}},600)})});
pr.on('error',e=>{if(peer!==pr)return;if(e.type=='unavailable-id'){if(c0){if(tries<15)setTimeout(()=>{if(peer===pr)mkRoom(c0,tries+1)},2000);else toast('방을 다시 열지 못했어요.',4000)}else mkRoom()}else toast('연결 오류: '+e.type)})}

/* 간결하고 깔끔한 초대 메시지 */
function inviteText(){
  const isHttp=location.protocol.startsWith('http');
  const base=isHttp?location.href.split('#')[0].split('?')[0]:'';
  const u=(base&&base.length<=90)?(base+'#'+code):'';
  const shortMsg=u?`[전설장기] 코드: ${code}\n${u}`:`[전설장기] 초대코드: ${code}`;
  return{
    title:'전설장기 초대',
    shareText:`[전설장기] 초대코드: ${code}`,
    copyText:shortMsg,
    codeOnly:String(code),
    url:u||undefined
  };
}
$('rsh').onclick=()=>{
  const d=inviteText();
  if(navigator.share){
    const shObj=d.url?{title:d.title,text:d.shareText,url:d.url}:{title:d.title,text:d.copyText};
    navigator.share(shObj).catch(()=>{});
  }else $('rcp').click();
};
$('rcp').onclick=()=>{
  const d=inviteText();
  (navigator.clipboard?navigator.clipboard.writeText(d.copyText):Promise.reject())
    .then(()=>toast('초대장을 복사했어요! ('+d.codeOnly+')',2500))
    .catch(()=>toast('초대코드: '+code,3000));
};
if($('rco'))$('rco').onclick=()=>{
  (navigator.clipboard?navigator.clipboard.writeText(String(code)):Promise.reject())
    .then(()=>toast('방 코드 ['+code+'] 복사 완료!',2200))
    .catch(()=>toast('방 코드: '+code,3000));
};
$('rx').onclick=()=>{$('rm').style.display='none';closeNet();save()};

/* 상대에게 초대 거절 신호 전송 (접속 전 링크 거절 포함) */
function sendDeclineToCode(targetCode,reason){
  if(!lib()||!/^\d{4}$/.test(targetCode||''))return;
  try{
    const tempPeer=new Peer();
    const cleanup=()=>{setTimeout(()=>{try{tempPeer.destroy()}catch(e){}},600)};
    const timer=setTimeout(cleanup,5000);
    tempPeer.on('open',()=>{
      try{
        const tc=tempPeer.connect('sjg-'+targetCode,{reliable:true});
        tc.on('open',()=>{
          try{tc.send({k:'inv_decline',nick:nick(),reason:reason||'거절'})}catch(e){}
          clearTimeout(timer);
          cleanup();
        });
        tc.on('error',()=>{clearTimeout(timer);cleanup()});
      }catch(e){clearTimeout(timer);cleanup()}
    });
    tempPeer.on('error',()=>{clearTimeout(timer);cleanup()});
  }catch(e){}
}

let preAccepted=false;
function showInviteModal(targetCode,hostName,timeSec,isConnected){
  const m=$('inv_mdl'),msg=$('inv_msg'),sub=$('inv_sub'),bOk=$('inv_ok'),bSp=$('inv_sp'),bNo=$('inv_no');
  if(!m)return;
  msg.textContent=hostName?`[${hostName}]님의 대국 초대`:`방 코드 [${targetCode}] 대국 초대`;
  sub.textContent=timeSec?`제한시간 ${timeSec}초 · 수락하면 선공 결정 주사위를 굴립니다.`:`대국에 참여하거나 거절할 수 있습니다.`;
  bSp.style.display=isConnected?'none':'';
  m.style.display='flex';
  bOk.onclick=()=>{
    m.style.display='none';
    if(history.replaceState&&location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    if(isConnected){
      if(conn&&conn.open){
        conn.send({k:'inv_accept',nick:nick()});
        toast('초대를 수락했습니다! 잠시만 기다려 주세요…',2000);
      }
    }else{
      preAccepted=true;
      setMode('mp');
      joinRoom(targetCode,false);
    }
  };
  bSp.onclick=()=>{
    m.style.display='none';
    if(history.replaceState&&location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    setMode('mp');
    joinRoom(targetCode,true);
  };
  bNo.onclick=()=>{
    m.style.display='none';
    if(history.replaceState&&location.hash)try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    if(isConnected&&conn&&conn.open){
      try{conn.send({k:'inv_decline',nick:nick()})}catch(e){}
      setTimeout(()=>closeNet(),300);
    }else{
      sendDeclineToCode(targetCode,'초대 거절');
    }
    toast('초대를 거절했습니다.',2500);
  };
}

function hostOfferInvite(c){
  if(!c||!c.open)return;
  $('rs').textContent=`${oppNick}님에게 대국 수락을 요청 중…`;
  try{c.send({k:'inv_offer',nick:nick(),time:cfg.time})}catch(e){}
}

function doJoin(resume){const tok=++jTok;jLast=Date.now();try{peer&&peer.destroy()}catch(e){}const pr=peer=new Peer();keepAlive(pr);let tries=0;
const go=()=>{if(tok!=jTok||peer!==pr)return;const c=conn=pr.connect('sjg-'+code,{reliable:true});netEvents(c);c.on('open',()=>{if(tok!=jTok)return;if(wantSpec||isSpec){c.send({k:'join_spec',nick:nick()})}else if(resume){c.send({k:'hello',sid});sendSync()}else{c.send({k:'hello_p',nick:nick(),accepted:preAccepted});preAccepted=false}})};
pr.on('open',()=>{if(tok==jTok)go()});
pr.on('error',e=>{if(tok!=jTok)return;if(e.type=='peer-unavailable'){const max=resume?25:7;if(++tries<max){if(!resume)toast(`방을 찾는 중… (${tries}/${max-1})`,1800);setTimeout(()=>{if(tok==jTok&&!(conn&&conn.open))go()},2000)}else toast('방을 찾지 못했어요. 코드를 다시 확인해 주세요.',4000)}else toast('연결 오류: '+e.type)})}
function joinRoom(c,asSpec){if(!lib())return;if(!/^\d{4}$/.test(c||''))return toast('받은 코드 4자리를 입력하세요');closeNet();isHost=false;wantSpec=!!asSpec;isSpec=!!asSpec;code=c;toast(asSpec?'관전자로 접속 중…':'접속 중…',3500);doJoin(false)}
function sendSync(){try{const msg={k:'sync',mc,B,turn:anim?anim.o:turn,lm,over,DMG:window.DMG||{c:0,h:0},SDMG:window.SDMG||{c:{lv:0,hits:[]},h:{lv:0,hits:[]}},cNick:me=='c'?nick():oppNick,hNick:me=='h'?nick():oppNick};bcast(msg)}catch(e){}}
function onSync(d){clearTimeout(dropT);if(d.cNick)cNick=d.cNick;if(d.hNick)hNick=d.hNick;if(isSpec){if(!inGame){beginSpec(d)}else{B=d.B;mc=d.mc;lm=d.lm;if(d.DMG)window.DMG={c:+d.DMG.c||0,h:+d.DMG.h||0};if(d.SDMG){window.SDMG=d.SDMG;if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}}updHudNames(cNick,hNick);rzK='';try{resize()}catch(e){}setTurn(d.turn);if(d.over&&!over)end(null,'대국 종료');else if(!d.over&&over){over=false;$('ov').style.display='none'}}return}if(d.DMG){window.DMG={c:+d.DMG.c||0,h:+d.DMG.h||0};rzK='';try{resize()}catch(e){}}if(d.SDMG){window.SDMG=d.SDMG;if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}}if(!inGame||over)return;if(d.mc>mc){anim=null;busy=false;jang=null;sel=null;B=d.B;mc=d.mc;lm=d.lm;setTurn(d.turn);toast('상대와 다시 연결됐어요',2500)}else if(d.mc<mc)sendSync();else toast('상대와 다시 연결됐어요',2500)}
function addSpec(c,n){c._isSpec=true;c._handled=true;if(conn===c)conn=null;specs=specs.filter(s=>s.c&&s.c.open&&s.c!==c);if(specs.length>=4){try{c.send({k:'spec_full'});setTimeout(()=>c.close(),400)}catch(e){}return}const sn=String(n||'관전자').slice(0,12);specs.push({c,nick:sn});const cn=me=='c'?nick():oppNick,hn=me=='h'?nick():oppNick;try{c.send({k:'spec_ok',mc,B,turn:anim?anim.o:turn,lm,over,DMG:window.DMG||{c:0,h:0},SDMG:window.SDMG||{c:{lv:0,hits:[]},h:{lv:0,hits:[]}},time:cfg.time,sid,cNick:cn,hNick:hn,scnt:specs.length})}catch(e){}bcast({k:'spec_join',nick:sn,scnt:specs.length});if(window.jgSpecNotice)window.jgSpecNotice(sn,specs.length,true)}
function handleInviteDecline(byNick){
  const who=byNick||oppNick||'상대';
  dTok++;clearInterval(dTimer);
  $('dc').style.display='none';
  if($('inv_mdl'))$('inv_mdl').style.display='none';
  gs=null;hostReady=null;hostDice=false;
  if(isHost){
    try{conn&&conn.close()}catch(e){}
    conn=null;
    if(!inGame){
      $('rc').textContent=code;
      $('rs').textContent=`❌ ${who}님이 초대를 거절했습니다. 다른 상대를 기다리는 중…`;
      $('rm').style.display='flex';
    }
    toast(`❌ ${who}님이 초대를 거절했습니다.`,3500);
  }else{
    closeNet();
    toast('대국 초대를 거절했습니다.',2500);
  }
}
function netEvents(c){c.on('data',d=>{c._handled=true;if(c._isSpec){onSpecData(c,d);return}
if(d&&d.k=='inv_decline'){
  const by=d.nick||oppNick||'상대';
  if(c===conn)conn=null;
  try{c.close()}catch(e){}
  handleInviteDecline(by);
  return;
}
if(d&&d.k=='join_spec'){addSpec(c,d.nick);return}if(c!==conn){if(d&&d.k=='hello_p'&&conn&&conn.open){addSpec(c,d.nick);return}if(d&&d.k=='hello'&&d.sid&&d.sid==sid){const o=conn;conn=c;try{o&&o.close()}catch(e){}clearTimeout(dropT);sendSync()}else if(d&&d.k=='hello_p'&&!(conn&&conn.open)){conn=c;clearTimeout(dropT);if(inGame&&!over&&cfg.mode=='mp')sendSync();else{isHost=true;oppNick=d.nick||'상대';if(d.accepted)hostStart();else hostOfferInvite(c)}}else{addSpec(c,d&&d.nick);return}return}onData(d)});
c.on('close',()=>{if(c._isSpec){const idx=specs.findIndex(s=>s.c===c);if(idx>=0){const sn=specs[idx].nick;specs.splice(idx,1);bcast({k:'spec_left',nick:sn,scnt:specs.length});if(window.jgSpecNotice)window.jgSpecNotice(sn,specs.length,false)}return}if(c!==conn)return;
if(inGame&&!over&&cfg.mode=='mp'){if(isSpec){toast('방장과의 연결이 끊겼어요',3000);return}toast('상대 연결이 끊겼어요. 다시 연결을 기다리는 중…',4000);clearTimeout(dropT);dropT=setTimeout(()=>{if(inGame&&!over&&!(conn&&conn.open))end(me,'상대가 나가서 승리!')},120000);if(!isHost)setTimeout(()=>{if(inGame&&!over&&!(conn&&conn.open))doJoin(true)},1500);return}
if(!inGame){if($('inv_mdl'))$('inv_mdl').style.display='none';if($('dc').style.display=='flex'){dTok++;clearInterval(dTimer);$('dc').style.display='none';if(isHost){conn=null;$('rs').textContent='상대가 나갔습니다. 다시 기다리는 중…';$('rm').style.display='flex'}else toast('상대가 나갔어요')}else if(isHost&&$('rm').style.display=='flex'){conn=null;$('rs').textContent='상대 입장 대기 중…'}if(over){$('oa').style.display='none';if($('od'))$('od').style.display='none';$('os').textContent='상대가 나갔어요'}}})}
let oppNick='상대';
function onSpecData(c,d){if(!d||typeof d!=='object')return;const sp=specs.find(s=>s.c===c);const sn=sp?sp.nick:(d.nick||'관전자');
if(d.k==='chat'||d.k==='emo'||d.k==='sdraw'||d.k==='sclr'){d.from='👁️'+sn;bcast(d,c);if(window.jgExtra)window.jgExtra(d)}}
function beginSpec(d){isSpec=true;wantSpec=false;cfg.mode='mp';cfg.time=d.time||cfg.time;sid=d.sid||'';cNick=d.cNick||'초나라';hNick=d.hNick||'한나라';oppNick=cNick+' vs '+hNick;me='s';flip=false;
if(d.B&&d.B.length)B=d.B;else init(SETUPS[0][2],SETUPS[0][2]);
if(window.jgPanel)try{jgPanel('mp')}catch(e){}
window.DMG=d.DMG&&typeof d.DMG==='object'?{c:+d.DMG.c||0,h:+d.DMG.h||0}:{c:0,h:0};window.SDMG=d.SDMG&&typeof d.SDMG==='object'?d.SDMG:{c:{lv:0,hits:[]},h:{lv:0,hits:[]}};if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}
mc=d.mc||0;lm=d.lm||null;turn=d.turn||'c';over=!!d.over;inGame=true;busy=false;sel=null;anim=null;jang=null;
sfxLoad();dTok++;$('dc').style.display='none';$('rm').style.display='none';$('st').style.display='none';$('g').style.display='block';$('ov').style.display='none';
$('g').classList.add('xspec');fitScreen();
updHudNames(cNick,hNick);cv=$('cv');cx2=cv.getContext('2d');rzK='';resize();setTurn(turn);
if(!looping){looping=true;requestAnimationFrame(loop)}
toast('👁️ 관전자로 입장했어요! 우측/하단 훈수펜으로 판 위에 경로·낙서를 그릴 수 있어요',4000)}
function onData(d){if(d&&d.k=='join_spec'&&isHost){addSpec(conn,d.nick);return}
if(d&&d.k=='spec_full'){toast('관전석(최대 4명)이 모두 찼어요!',4000);closeNet();return}
if(d&&d.k=='spec_ok'){beginSpec(d);return}
if(d&&d.k=='inv_offer'){
  oppNick=d.nick||'방장';
  cfg.time=d.time||cfg.time;
  clearTimeout(toast.i);$('tt').style.display='none';
  showInviteModal(code,oppNick,cfg.time,true);
  return;
}
if(d&&d.k=='inv_accept'){
  oppNick=d.nick||oppNick||'상대';
  if(isHost)hostStart();
  return;
}
if(d&&d.k=='inv_decline'){
  handleInviteDecline(d.nick);
  return;
}
if(isHost&&d&&(d.k==='chat'||d.k==='emo'||d.k==='mv'||d.k==='pass'||d.k==='resign'||d.k==='nuke'||d.k==='meteor'||d.k==='alien'||d.k==='kame'||d.k==='fist'||d.k==='hammer'||d.k==='gun'||d.k==='dmg_sync'||d.k==='sdmg_sync'||d.k==='sdraw'||d.k==='sclr')){if(d.k==='chat'||d.k==='emo')d.from=oppNick;bcast(d,conn)}
if(window.jgExtra&&jgExtra(d))return;
if(d.k=='start'){if($('inv_mdl'))$('inv_mdl').style.display='none';isSpec=false;$('g').classList.remove('xspec');cfg.time=d.time;oppNick=d.nick;sid=d.sid||'';const mine=SETUPS[cfg.si][2];conn.send({k:'ready',nick:nick(),setup:mine});const[hd,gd]=d.dice;gs={mine,setup:d.setup,done:false,g:null};
diceShow(gd,hd,false,f=>{if(!gs)return;gs.done=true;if(f)pickFirst(first=>{if(!gs)return;gs.g=first?'c':'h';conn.send({k:'pick',hs:first?'h':'c'});guestGo()});else guestGo()},()=>{if(conn&&conn.open)try{conn.send({k:'inv_decline',nick:nick()})}catch(e){}handleInviteDecline(nick())})}
else if(d.k=='ready'){oppNick=d.nick||'상대';if(curDuelGen&&curDuelGen[1])curDuelGen[1].name=oppNick;if($('dc').style.display=='flex')$('dn2').textContent=`🐎 ${oppNick} (${curDuelGen&&curDuelGen[1]?curDuelGen[1].title:'무장'})`;hostReady=d.setup;hostGo()}
else if(d.k=='pick'){if(isHost){hostSide=d.hs;hostDice=true;hostGo()}else if(gs){gs.g=d.hs=='c'?'h':'c';guestGo()}}
else if(d.k=='rm'){
  rmO=true;
  if(rmS&&isHost){
    if($('od'))$('od').style.display='none';
    hostStart();
  }else if(over&&!rmS){
    $('os').textContent=`📩 ${oppNick||'상대'}님이 재대국을 요청했어요!`;
    if($('od')){
      $('od').style.display='';
      $('od').onclick=()=>{
        rmO=false;
        $('od').style.display='none';
        $('os').textContent='재대국 초대를 거절했습니다.';
        if(conn&&conn.open)try{conn.send({k:'rm_no',nick:nick()})}catch(e){}
      };
    }
  }
}
else if(d.k=='rm_no'){
  rmS=false;rmO=false;
  $('oa').disabled=false;
  if($('od'))$('od').style.display='none';
  $('os').textContent=`❌ ${d.nick||oppNick||'상대'}님이 재대국을 거절했습니다.`;
  toast(`❌ ${d.nick||oppNick||'상대'}님이 재대국 초대를 거절했습니다.`,3500);
}
else if(d.k=='hello_p'){
  oppNick=d.nick||'상대';
  if(isHost){
    if(inGame&&!over&&cfg.mode=='mp')sendSync();
    else if(d.accepted)hostStart();
    else hostOfferInvite(conn);
  }
}
else if(d.k=='hello'){}
else if(d.k=='sync')onSync(d)
else if(d.k=='mv'&&inGame&&!over){if(isSpec&&anim)fin();if(!anim&&legal(turn).some(z=>z.join()==d.m.join()))doMove(d.m)}}
function guestGo(){if(!gs||!gs.done||gs.g==null)return;const{g,mine,setup}=gs;gs=null;begin(g,g=='c'?mine:setup,g=='h'?mine:setup,'mp')}
function hostStart(){const c=conn;if(!c||!c.open)return;rmS=rmO=false;if($('od'))$('od').style.display='none';const[hd,gd]=dicePair();hostSide=null;hostDice=false;hostReady=null;$('rm').style.display='none';
sid=Math.random().toString(36).slice(2,10);c.send({k:'start',time:cfg.time,nick:nick(),setup:SETUPS[cfg.si][2],dice:[hd,gd],sid});
diceShow(hd,gd,false,f=>{if(f)pickFirst(first=>{hostSide=first?'c':'h';c.send({k:'pick',hs:hostSide});hostDice=true;hostGo()})},()=>{if(c&&c.open)try{c.send({k:'inv_decline',nick:nick()})}catch(e){}handleInviteDecline(nick())})}
function hostGo(){if(!hostDice||hostReady==null||!hostSide)return;const mine=SETUPS[cfg.si][2],o=hostReady;hostReady=null;hostDice=false;begin(hostSide,hostSide=='c'?mine:o,hostSide=='h'?mine:o,'mp');setTimeout(()=>sendSync(),300)}
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
/* ---------- 게임 ---------- */
function startAI(isCoach){
  window.coachMode=!!isCoach;
  window.coachHints=[];
  const o=SETUPS[Math.random()*4|0],mine=SETUPS[cfg.si][2];
  oppNick=isCoach?`🎓훈수코치(${cfg.lv})`:`COM(${cfg.lv})`;
  if(isCoach){
    begin('c',mine,o[2],'ai');
    $('g').classList.add('xcoach');
    toast('🎓 AI 훈수·교육 모드가 시작되었습니다! 황금색 화살표로 최선수를 추천해 드립니다.',3500);
    setTimeout(()=>{if(window.updateCoachHints)window.updateCoachHints()},350);
    return;
  }
  $('g').classList.remove('xcoach');
  const[a,b]=dicePair();
  const go=first=>{const m=first?'c':'h';toast(`COM 포진: ${o[0]}`,2500);begin(m,m=='c'?mine:o[2],m=='h'?mine:o[2],'ai')};
  diceShow(a,b,true,f=>{if(f)pickFirst(go);else{const comFirst=Math.random()<.75;$('dres').textContent=`😮 일기토에서 승리한 COM이 ${comFirst?'선공(초나라)':'후공(한나라)'}을 선택했어요`;setTimeout(()=>go(!comFirst),1700)}});
}
function begin(m,sc,sh,mode){isSpec=false;$('g').classList.remove('xspec');if(window.jgPanel)try{jgPanel(mode)}catch(e){}mc=0;sfxLoad();dTok++;$('dc').style.display='none';rmS=rmO=false;$('oa').disabled=false;$('os').textContent='';cfg.mode=mode;me=m;flip=m=='h';init(sc,sh);turn='c';over=false;inGame=true;busy=false;sel=null;lm=null;anim=null;jang=null;aiId++;$('st').style.display='none';$('g').style.display='block';$('ov').style.display='none';fitScreen();
function updHudNames(cn,hn){
  const showCode=(cfg.mode==='mp'&&code);
  const cTag=showCode&&(me==='c'||isSpec)?` [코드:${code}]`:'';
  const hTag=showCode&&(me==='h')?` [코드:${code}]`:'';
  $('nc').textContent='초 '+cn+cTag;
  $('nh').textContent='한 '+hn+hTag;
  const rb=$('rcbadge');
  if(rb){
    if(showCode){
      rb.style.display='inline-block';
      rb.textContent='🔑 방코드: '+code;
      rb.onclick=()=>{try{navigator.clipboard.writeText(code);toast('방 초대코드 ['+code+'] 복사 완료!',2000)}catch(e){toast('방 초대코드: '+code,3000)}};
    }else{
      rb.style.display='none';
    }
  }
}
const n=nick();updHudNames(m=='c'?n:oppNick,m=='h'?n:oppNick);cv=$('cv');cx2=cv.getContext('2d');if(!wk&&mode=='ai')mkWorker();resize();setTurn('c');if(!looping){looping=true;requestAnimationFrame(loop)}if(window.jgStartOrbit&&!RESUMED){try{window.jgStartOrbit()}catch(e){}}RESUMED=false}
let rzK='';function resize(){if(!cv||!cv.offsetWidth)return;const k=cv.offsetWidth+'x'+cv.offsetHeight+'@'+(devicePixelRatio||1)+(flip?'f':'n')+sab()+'h'+($('hud')?$('hud').offsetHeight:0);if(k===rzK&&bc)return;rzK=k;const d=Math.min(devicePixelRatio||1,2);W=cv.offsetWidth||innerWidth;H=cv.offsetHeight||innerHeight;cv.width=W*d;cv.height=H*d;cx2.setTransform(d,0,0,d,0,0);cx2.imageSmoothingQuality='high';
const top=($('hud')&&$('hud').offsetHeight)||46,mx=Math.max(26,W*.095),aH=H-top-(innerHeight<560?4:10)-sab();let cx=(W-2*mx)/8,cy=aH/11.2;if(cy>cx*1.45)cy=cx*1.45;else if(cx>cy*1.22)cx=cy*1.22;
CX=cx;CY=cy;C=Math.min(cx,cy);OX=(W-8*cx)/2;OY=top+(aH-9*cy)/2;bc=document.createElement('canvas');bc.width=W*d;bc.height=H*d;const g=bc.getContext('2d');g.setTransform(d,0,0,d,0,0);board(g);if(window.drawScreenDamage)try{window.drawScreenDamage()}catch(e){}}addEventListener('resize',resize);
const px=(x,y)=>{const[a,b]=flip?[8-x,9-y]:[x,y];return[OX+a*CX,OY+b*CY]};
function setTurn(s){turn=s;save();tleft=cfg.time;$('nc').classList.toggle('on',s=='c');$('nh').classList.toggle('on',s=='h');$('tn').textContent=isSpec?('👁️관전중('+(s=='c'?'초':'한')+' 차례)'):(s==me?'내 차례':'상대 차례');clearInterval(tint);$('tm').textContent='0:'+String(cfg.time).padStart(2,'0');
tint=setInterval(()=>{if(over||anim||busy)return;tleft--;$('tm').textContent='0:'+String(Math.max(tleft,0)).padStart(2,'0');if(tleft<=0){tleft=cfg.time;if(window.jgTO)jgTO(turn);}},1000);
if(cfg.mode=='ai'&&s!=me){const id=aiId;setTimeout(()=>{if(!over&&!anim&&!busy&&turn==s&&id==aiId)aiThink(s)},500)}}
function play(m){if(isSpec)return;if(cfg.mode=='mp'){if(!(conn&&conn.open)){toast('상대와 다시 연결하는 중이에요…',2500);return}bcast({k:'mv',m})}doMove(m)}
function doMove(m){if(anim||over)return;mc++;const p=B[m[1]][m[0]],q=mk(m);sel=null;lm=m;const dist=Math.max(Math.abs(m[2]-m[0]),Math.abs(m[3]-m[1])),D=460+88*dist,A=q?860:0;anim={p,m,q,t0:performance.now(),D,A,dist,o:turn=='c'?'h':'c',T:[440,440+D,440+D+A,440+D+A+480],ghosts:[],sparks:[],rings:[]};save()}
function fin(){const o=anim.o,s=anim.p.s,t=anim.p.t;anim=null;clearInterval(tint);turn=o;const L=legal(o),ck=chk(o);
if(!L.length){if(ck){busy=true;jang={t0:performance.now(),s,t,mate:1};boom();setTimeout(()=>{busy=false;end(s)},1500)}else if(!legal(s).length)end(null);else{toast((o=='c'?'초':'한')+' 한수쉼 (둘 곳이 없어 차례를 넘깁니다)');setTurn(s)}return}
if(ck){busy=true;jang={t0:performance.now(),s,t};boom();setTimeout(()=>{busy=false;if(!over)setTurn(o)},1300)}else setTurn(o)}
function end(w,msg){over=true;inGame=false;save();clearInterval(tint);$('ot').textContent=msg||(w?(w=='c'?'초':'한')+'나라 승리!'+(w==me?' 🎉':''):'무승부');$('oa').style.display=(cfg.mode=='ai'||(conn&&conn.open))?'':'none';$('oa').disabled=false;if($('od'))$('od').style.display='none';$('os').textContent='';$('ov').style.display='flex'}
function lobby(){clearInterval(tint);over=true;inGame=false;aiId++;closeNet();save();if($('ni')&&!$('ni').value)$('ni').value=loadNick();if($('scv'))$('scv').style.display='none';$('g').style.display='none';$('rm').style.display='none';$('st').style.display='none';$('st').style.display='flex';cv.style.transform='';fitScreen();fit();}
$('ob').onclick=$('bl').onclick=lobby;
$('oa').onclick=()=>{if(cfg.mode=='ai'){startAI();return}if(!(conn&&conn.open)){toast('상대가 나가서 다시 할 수 없어요');$('oa').style.display='none';return}rmS=true;conn.send({k:'rm'});$('oa').disabled=true;$('os').textContent='상대의 응답을 기다리는 중…';if(rmO&&isHost)hostStart()};
function boom(){try{AC=AC||new(window.AudioContext||webkitAudioContext)();const a=AC,o=a.createOscillator(),g=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(260,a.currentTime);o.frequency.exponentialRampToValueAtTime(40,a.currentTime+.6);g.gain.setValueAtTime(.3,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.7);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.75)}catch(e){}}
let selLiftT=0,selPrevKey='';
$('cv').addEventListener('pointerdown',e=>{if(over||anim||busy||turn!=me)return;const r=cv.getBoundingClientRect();let a=Math.round((e.clientX-r.left-OX)/CX),b=Math.round((e.clientY-r.top-OY)/CY);if(a<0||a>8||b<0||b>9)return;if(flip){a=8-a;b=9-b}
if(sel){const m=sel.L.find(z=>z[2]==a&&z[3]==b);if(m){play(m);return}}const p=B[b][a];if(p&&p.s==me){const nk=a+','+b;if(selPrevKey!==nk){selLiftT=performance.now();selPrevKey=nk}sel={x:a,y:b,L:legal(me).filter(z=>z[0]==a&&z[1]==b)}}else{sel=null;selPrevKey=''}});
/* ---------- 고품질 기물 스프라이트 · 입체 그림자 · 병종별 물리 애니메이션 ---------- */
function drawPieceShadow(g,x,y,r,z,alphaMul=1){
  const lift=Math.max(0,z||0),k=Math.max(0.42,1-lift/(C*1.85));
  g.save();
  g.globalAlpha=Math.max(0.08,0.44*k*alphaMul);
  const sg=g.createRadialGradient(x,y+C*.26,r*.08,x,y+C*.26,r*k);
  sg.addColorStop(0,'rgba(4,6,12,0.88)');
  sg.addColorStop(0.62,'rgba(8,10,18,0.42)');
  sg.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=sg;
  g.beginPath();
  g.ellipse(x,y+C*.26,r*k,r*0.42*k,0,0,Math.PI*2);
  g.fill();
  g.restore();
}
function spr(s,key,fr,x,y,o={}){
  const arr=SP[s.s]&&SP[s.s][s.t]&&SP[s.s][s.t][key];
  if(!arr||!arr.length)return;
  const f=arr[Math.floor(fr)%arr.length||0];
  if(!f||!f.im.complete)return;
  const baseK=(key=='token'?C*(s.t=='P'||s.t=='G'?.64:s.t=='K'?.88:.76)/Math.max(f.w,f.h):C/115*(s.t=='K'?1.16:1));
  const sx=(o.sx!=null?o.sx:1)*(o.sc||1),sy=(o.sy!=null?o.sy:1)*(o.sc||1);
  const w=f.w*baseK*sx,h=f.h*baseK*sy;
  const z=o.z||0;
  if(o.shadow){
    drawPieceShadow(cx2,x+(o.dx||0),y+(o.dy||0),C*(key=='token'?.42:.48),z,o.a==null?1:o.a);
  }
  cx2.save();
  cx2.globalAlpha=o.a==null?1:Math.max(0,Math.min(1,o.a));
  if(o.comp)cx2.globalCompositeOperation=o.comp;
  cx2.translate(x+(o.dx||0),(o.feet?y+C*.45:y)+(o.dy||0)-z);
  if(o.rot)cx2.rotate(o.rot);
  if(o.fl)cx2.scale(-1,1);
  if(o.glow){
    cx2.shadowColor=o.glowCol||(s.s=='c'?'rgba(64,235,255,0.85)':'rgba(255,140,60,0.85)');
    cx2.shadowBlur=o.glow;
  }
  cx2.drawImage(f.im,-w/2,o.feet?-h:-h/2,w,h);
  cx2.restore();
}
const BOARD_THEMES=[
  {key:"desert",name:"🏜️ 황토 사막 전장",src:"assets/images/image_16.webp"},
  {key:"snow",name:"❄️ 설원 얼음성 전장",src:"assets/images/image_17.webp"},
  {key:"forest",name:"🌲 고대 숲 유적 전장",src:"assets/images/image_18.webp"},
  {key:"dark",name:"🏯 암흑 성채 전장",src:"assets/images/image_19.webp"},
  {key:"classic",name:"⚔️ 삼국지 고성 전장",src:"assets/images/image_20.webp"}
];
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

  if(window.jgDrawBoardDamage)try{window.jgDrawBoardDamage(g)}catch(e){}
  try{drawBoardTerrainProps(g, bIdx)}catch(e){}
  if(window.jgDrawBoardDebris)try{window.jgDrawBoardDebris(g)}catch(e){}
}
function drawLM(now){const g=cx2,[x0,y0]=px(lm[0],lm[1]),[x1,y1]=px(lm[2],lm[3]),p=B[lm[3]][lm[2]],pu=.5+.5*Math.sin(now/240);g.save();g.lineCap='round';g.lineJoin='round';
/* 출발 칸: 반투명 말(잔상) + 회전하는 점선 링 */
g.fillStyle='rgba(255,255,255,.16)';g.beginPath();g.arc(x0,y0,C*.48,0,7);g.fill();if(p)spr(p,'token',0,x0,y0,{a:.34});
g.save();g.translate(x0,y0);g.rotate(now*0.0012);g.setLineDash([C*.14,C*.1]);g.lineWidth=Math.max(2.2,C*.06);g.strokeStyle='rgba(255,255,255,0.88)';g.shadowColor='#000';g.shadowBlur=4;g.beginPath();g.arc(0,0,C*.48,0,7);g.stroke();g.restore();
/* 이동 화살표 + 흐르는 광맥 펄스 */
const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);if(L>C*1.05){const ux=dx/L,uy=dy/L,ax=x0+ux*C*.54,ay=y0+uy*C*.54,bx=x1-ux*C*.58,by=y1-uy*C*.58,hs=C*.25,nx=-uy,ny=ux;
for(const[w,col]of[[Math.max(6,C*.16),'rgba(0,0,0,.55)'],[Math.max(2.8,C*.085),'#ffd54a']]){g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();g.beginPath();g.moveTo(bx+ux*hs*1.1,by+uy*hs*1.1);g.lineTo(bx+nx*hs,by+ny*hs);g.lineTo(bx-nx*hs,by-ny*hs);g.closePath();g.fill();g.stroke()}
const flow=(now%900)/900,fx=ax+(bx-ax)*flow,fy=ay+(by-ay)*flow;
g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,250,210,${0.75*Math.sin(flow*Math.PI)})`;g.beginPath();g.arc(fx,fy,C*.11,0,7);g.fill();g.globalCompositeOperation='source-over';}
/* 도착 칸: 이중 노란 빛나는 링 */
g.fillStyle=`rgba(255,213,74,${.12+.09*pu})`;g.beginPath();g.arc(x1,y1,C*.53,0,7);g.fill();
g.strokeStyle='#ffd54a';g.lineWidth=Math.max(2.8,C*.075);g.shadowColor='#ffd54a';g.shadowBlur=C*(.22+.22*pu);g.beginPath();g.arc(x1,y1,C*(.51+.03*pu),0,7);g.stroke();
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
function easeMove(u){u=Math.max(0,Math.min(1,u));return u*u*u*(u*(u*6-15)+10)}
function easeOutBackSoft(u){u=Math.max(0,Math.min(1,u));const c1=1.35,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2)}

/* ---------- 병종별 고유 3D 물리 궤적 계산기 (차·포·마·상·궁·사·졸 특화) ---------- */
function calcPieceMotion(A,u,X0,Y0,tx,ty){
  u=Math.max(0,Math.min(1,u));
  const pt=A.p.t,dx=tx-X0,dy=ty-Y0,dist=A.dist||1;
  if(pt==='R'){
    // 차(車): 로켓처럼 치고 나가는 고속 질주 + 앞기울임 + 지면 스키밍
    const e=u<0.15?(u*u/0.15*0.6):(1-Math.pow(1-u,2.7));
    const spd=Math.sin(Math.min(1,u*1.25)*Math.PI);
    return{
      x:X0+dx*e,
      y:Y0+dy*e,
      z:Math.sin(u*Math.PI)*C*0.14,
      sx:1+0.12*spd,
      sy:1-0.08*spd,
      tilt:(dx>=0?1:-1)*0.11*spd,
      stage:1
    };
  }
  if(pt==='C'){
    // 포(包): 포대를 뛰어넘는 웅장한 고포물선 + 정점 공중 2단 도약
    const e=easeMove(u);
    const arcH=C*(0.85+Math.min(1.1,dist*0.15));
    const doubleHop=Math.sin(u*Math.PI)+0.22*Math.sin(u*Math.PI*2);
    const z=Math.max(0,doubleHop*arcH);
    const vNorm=Math.cos(u*Math.PI);
    return{
      x:X0+dx*e,
      y:Y0+dy*e,
      z,
      sx:1-0.08*Math.sin(u*Math.PI),
      sy:1+0.11*Math.sin(u*Math.PI),
      tilt:(dx>=0?1:-1)*0.09*vNorm,
      stage:u<0.5?0:1
    };
  }
  if(pt==='N'){
    // 마(馬): 장기의 '일(日)자' 행마를 재현한 2단계 꺾임 도약 (1단계: 직선 멱 돌파 -> 2단계: 대각선 공중 도약)
    const gx=A.m[2]-A.m[0],gy=A.m[3]-A.m[1];
    let legGx=0,legGy=0;
    if(Math.abs(gx)===2){legGx=Math.sign(gx)}else{legGy=Math.sign(gy)}
    const [LX,LY]=px(A.m[0]+legGx,A.m[1]+legGy);
    const wx=X0+(LX-X0)*0.85,wy=Y0+(LY-Y0)*0.85;
    if(u<0.36){
      const u1=u/0.36,e1=u1*u1*(2-u1);
      return{
        x:X0+(wx-X0)*e1,
        y:Y0+(wy-Y0)*e1,
        z:Math.sin(u1*Math.PI)*C*0.16,
        sx:1+0.09*Math.sin(u1*Math.PI),
        sy:1-0.06*Math.sin(u1*Math.PI),
        tilt:(wx-X0>=0?1:-1)*0.08,
        stage:0
      };
    }else{
      const u2=(u-0.36)/0.64,e2=easeMove(u2);
      const jump=Math.sin(u2*Math.PI);
      return{
        x:wx+(tx-wx)*e2,
        y:wy+(ty-wy)*e2,
        z:jump*C*0.86,
        sx:1-0.09*jump,
        sy:1+0.13*jump,
        tilt:(tx-wx>=0?1:-1)*0.12*Math.cos(u2*Math.PI),
        stage:1
      };
    }
  }
  if(pt==='B'){
    // 상(象): 장기의 '용(用)자' 행마를 재현한 묵직한 직선 돌진 후 거대 대각선 점프
    const gx=A.m[2]-A.m[0],gy=A.m[3]-A.m[1];
    let legGx=0,legGy=0;
    if(Math.abs(gx)===3){legGx=Math.sign(gx)}else{legGy=Math.sign(gy)}
    const [LX,LY]=px(A.m[0]+legGx,A.m[1]+legGy);
    const wx=X0+(LX-X0)*0.82,wy=Y0+(LY-Y0)*0.82;
    if(u<0.30){
      const u1=u/0.30,e1=u1*u1;
      return{
        x:X0+(wx-X0)*e1,
        y:Y0+(wy-Y0)*e1,
        z:Math.sin(u1*Math.PI)*C*0.12,
        sx:1+0.11*Math.sin(u1*Math.PI),
        sy:1-0.09*Math.sin(u1*Math.PI),
        tilt:(wx-X0>=0?1:-1)*0.07,
        stage:0
      };
    }else{
      const u2=(u-0.30)/0.70,e2=easeMove(u2);
      const jump=Math.sin(u2*Math.PI);
      return{
        x:wx+(tx-wx)*e2,
        y:wy+(ty-wy)*e2,
        z:jump*C*1.12,
        sx:1-0.10*jump,
        sy:1+0.14*jump,
        tilt:(tx-wx>=0?1:-1)*0.10*Math.cos(u2*Math.PI),
        stage:1
      };
    }
  }
  if(pt==='G'){
    // 사(士): 책사의 S자 유영 보법
    const e=easeMove(u),L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
    const weave=Math.sin(u*Math.PI*2)*C*0.18*Math.sin(u*Math.PI);
    return{
      x:X0+dx*e+nx*weave,
      y:Y0+dy*e+ny*weave,
      z:Math.sin(u*Math.PI)*C*0.36,
      sx:1,sy:1,
      tilt:weave*0.008,
      stage:1
    };
  }
  if(pt==='K'){
    // 궁(將): 제왕의 위엄 있는 부양 이동
    const e=easeMove(u);
    return{
      x:X0+dx*e,
      y:Y0+dy*e,
      z:Math.sin(u*Math.PI)*C*0.32,
      sx:1+0.03*Math.sin(u*Math.PI),
      sy:1+0.03*Math.sin(u*Math.PI),
      tilt:0,
      stage:1
    };
  }
  // 졸/병(P): 2단 경쾌한 돌격 스텝
  const e=easeMove(u),hops=Math.abs(Math.sin(u*Math.PI*2));
  return{
    x:X0+dx*e,
    y:Y0+dy*e,
    z:hops*C*0.26,
    sx:1+0.07*(1-hops),
    sy:1-0.05*(1-hops)+0.06*hops,
    tilt:(dx>=0?1:-1)*0.06*Math.sin(u*Math.PI),
    stage:u<0.5?0:1
  };
}
window.jgCalcPieceMotion=calcPieceMotion;

/* ---------- 병종별 고속 에너지 궤적 & 포격 탄환 렌더링 ---------- */
function drawMoveTrail(x0,y0,x1,y1,u,dist,now,side,A){
  const g=cx2;
  const isCho=side=='c';
  const rgb=isCho?'95,222,255':'255,175,75';
  const coreRgb=isCho?'225,252,255':'255,244,195';
  const pt=A?A.p.t:'P';
  const point=v=>{
    if(A){
      const m=calcPieceMotion(A,v,x0,y0,x1,y1);
      return [m.x,m.y-m.z,m.x,m.y];
    }
    return [x0+(x1-x0)*v,y0+(y1-y0)*v-Math.sin(v*Math.PI*(1+dist))*C*.075,x0+(x1-x0)*v,y0+(y1-y0)*v];
  };
  g.save();
  g.globalCompositeOperation='lighter';
  g.lineCap='round';
  g.lineJoin='round';

  // 1) 지상 그림자 안내선 (지면 투영 경로)
  const steps=12;
  for(let i=steps;i>=1;i--){
    const v1=Math.max(0,u-(i-1)*(0.45/steps)),v0=Math.max(0,u-i*(0.45/steps));
    if(v1<=0.001)continue;
    const a=(1-i/(steps+1))*Math.min(1,u*5)*0.42;
    const p0=point(v0),p1=point(v1);
    // 지상 투영 궤적
    g.strokeStyle='rgba('+rgb+','+(a*0.35)+')';
    g.lineWidth=C*(0.02+(1-i/steps)*0.04);
    g.beginPath();g.moveTo(p0[2],p0[3]);g.lineTo(p1[2],p1[3]);g.stroke();
    // 공중 본체 궤적
    g.strokeStyle='rgba('+rgb+','+a+')';
    g.lineWidth=C*((pt==='R'?0.045:0.03)+(1-i/steps)*(pt==='R'?0.12:0.085));
    g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke();
    // 코어 하이라이트
    g.strokeStyle='rgba('+coreRgb+','+(a*0.75)+')';
    g.lineWidth=C*(0.01+(1-i/steps)*0.03);
    g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke();
  }

  // 2) 포(包) 공중 포대 도약 시 공중 발판 링 & 포탄 오라
  if(pt==='C'&&u>0.38&&u<0.78){
    const mid=point(0.5),bu=(u-0.38)/0.40,ba=Math.sin(bu*Math.PI);
    g.strokeStyle='rgba('+coreRgb+','+(0.75*ba)+')';
    g.lineWidth=Math.max(1.5,C*0.032);
    g.beginPath();
    g.ellipse(mid[0],mid[1]+C*0.18,C*(0.16+bu*0.42),C*(0.07+bu*0.16),0,0,Math.PI*2);
    g.stroke();
  }

  // 3) 현재 위치 집중 오라 헤일로
  const [tx,ty]=point(u),pulse=.5+.5*Math.sin(now/65);
  g.globalAlpha=.24+.22*pulse;
  const halo=g.createRadialGradient(tx,ty,0,tx,ty,C*(pt==='R'?0.58:0.46));
  halo.addColorStop(0,'rgba('+coreRgb+',.85)');
  halo.addColorStop(0.5,'rgba('+rgb+',.45)');
  halo.addColorStop(1,'rgba('+rgb+',0)');
  g.fillStyle=halo;
  g.beginPath();g.arc(tx,ty,C*(pt==='R'?0.58:0.46),0,Math.PI*2);g.fill();
  g.restore();
}

/* ---------- 병종별 맞춤형 필살 타격 이펙트 ---------- */
function drawStrikeFX(x,y,u,dirX,side,pieceType,sx,sy){
  if(u<0||u>1)return;
  const g=cx2,t=easeMove(u),fade=Math.sin(Math.PI*u);
  const isCho=side=='c';
  const rgb=isCho?'110,232,255':'255,195,95';
  const coreRgb=isCho?'235,254,255':'255,248,210';
  const pt=pieceType||'R';

  g.save();
  g.globalCompositeOperation='lighter';

  // 포(包) 전용: 발사 위치에서 타격 지점으로 날아가는 고열 포탄 & 착탄 폭풍
  if(pt==='C'&&sx!=null&&sy!=null&&u<0.55){
    const pu=u/0.55,pe=1-Math.pow(1-pu,2);
    const bx=sx+(x-sx)*pe,by=sy+(y-sy)*pe-Math.sin(pu*Math.PI)*C*0.45;
    const bg=g.createRadialGradient(bx,by,0,bx,by,C*0.36);
    bg.addColorStop(0,'rgba(255,255,255,0.98)');
    bg.addColorStop(0.4,'rgba('+rgb+',0.85)');
    bg.addColorStop(1,'rgba('+rgb+',0)');
    g.fillStyle=bg;
    g.beginPath();g.arc(bx,by,C*0.36,0,Math.PI*2);g.fill();
    g.strokeStyle='rgba('+coreRgb+',0.8)';g.lineWidth=C*0.07;
    g.beginPath();g.moveTo(sx,sy);g.lineTo(bx,by);g.stroke();
  }

  g.translate(x,y);
  // 충격파 링
  const r=C*(.22+t*.68);
  g.globalAlpha=.85*fade;
  g.strokeStyle='rgba('+rgb+','+(.6+.35*fade)+')';
  g.lineWidth=Math.max(1.8,C*.045);
  g.beginPath();g.arc(0,0,r,-1.3+t*1.2,2.0+t*1.2);g.stroke();

  if(pt==='G'){
    // 사(士): 팔괘 마법진 회전 섬광
    g.save();g.rotate(t*4.5);
    g.strokeStyle='rgba('+coreRgb+','+(0.8*fade)+')';
    g.lineWidth=Math.max(1.5,C*0.03);
    for(let k=0;k<2;k++){
      g.rotate(Math.PI/4);
      g.strokeRect(-r*0.58,-r*0.58,r*1.16,r*1.16);
    }
    g.restore();
  }else if(pt==='B'){
    // 상(象): 지면 분쇄 수직 충격파 + 방사형 파편선
    g.strokeStyle='rgba('+coreRgb+','+(0.85*fade)+')';
    g.lineWidth=Math.max(2,C*0.05);
    g.beginPath();g.ellipse(0,C*0.16,r*1.15,r*0.42,0,0,Math.PI*2);g.stroke();
    for(let i=0;i<10;i++){
      const a=-Math.PI*(0.1+0.8*(i/9)),rr=r*(0.4+0.7*t);
      g.beginPath();g.moveTo(Math.cos(a)*rr*0.3,Math.sin(a)*rr*0.3);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);g.stroke();
    }
  }else{
    // 차·마·궁·졸: 예리한 다중 참격(Slash Arcs) + 교차 섬광
    g.save();
    g.rotate(dirX<0?Math.PI:0);
    for(let i=0;i<3;i++){
      const k=i-1,yy=k*C*.14,lead=(1-t)*C*.78;
      g.globalAlpha=(.82-Math.abs(k)*.16)*fade;
      g.strokeStyle=i===1?'rgba('+coreRgb+',0.95)':'rgba('+rgb+',0.85)';
      g.lineWidth=Math.max(1.2,C*(.068-Math.abs(k)*.014));
      g.beginPath();
      g.moveTo(-lead,-C*.38+yy);
      g.quadraticCurveTo(C*.08,-C*.16+yy,C*.38,C*.12+yy);
      g.stroke();
    }
    g.restore();
  }

  // 임팩트 중심 십자 섬광(Cross Glint)
  if(u>0.18&&u<0.65){
    const gu=Math.sin(((u-0.18)/0.47)*Math.PI),gl=C*0.72*gu;
    g.fillStyle='rgba(255,255,255,'+(0.92*gu)+')';
    for(const ang of [0.35,-0.35]){
      g.save();g.rotate(ang);
      g.beginPath();g.moveTo(-gl,0);g.lineTo(0,-C*0.04*gu);g.lineTo(gl,0);g.lineTo(0,C*0.04*gu);g.closePath();g.fill();
      g.restore();
    }
  }
  g.restore();
}

function drawLandingFX(x,y,u,side,pieceType){
  if(u<0||u>.55)return;
  const g=cx2,t=u/.55,heavy=(pieceType==='B'||pieceType==='R'||pieceType==='C');
  const r=C*(.18+t*(heavy?0.72:0.54)),fade=1-t,rgb=side=='c'?'120,230,255':'255,204,105';
  g.save();g.translate(x,y);g.globalCompositeOperation='lighter';
  g.globalAlpha=.75*fade;g.strokeStyle='rgba('+rgb+',.92)';g.lineWidth=Math.max(1.2,C*(heavy?0.036:0.026)*(1-t*0.5));
  g.beginPath();g.ellipse(0,C*.16,r,r*.36,0,0,Math.PI*2);g.stroke();
  if(heavy){
    g.globalAlpha=.48*fade;
    g.beginPath();g.ellipse(0,C*.16,r*0.64,r*0.23,0,0,Math.PI*2);g.stroke();
  }
  const rays=heavy?10:8;
  for(let i=0;i<rays;i++){
    const a=i*Math.PI*2/rays+t*.35,rr=r*(.76+Math.sin(i*4.2)*.08);
    g.globalAlpha=.72*fade;
    g.beginPath();g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr*0.45+C*0.14);
    g.lineTo(Math.cos(a)*(rr+C*.10),Math.sin(a)*(rr+C*.10)*0.45+C*0.14);g.stroke();
  }
  g.restore();
}

/* ---------- 기물 선택 룬 마법진 & 이동 가능 칸 전술 마커 ---------- */
function drawSelectedAura(g,X,Y,side,now,lift){
  const t=now*0.001,rgb=side=='c'?'64,235,255':'255,190,75';
  g.save();
  g.translate(X,Y+C*0.16);
  g.scale(1,0.52);
  g.globalCompositeOperation='lighter';
  // 외곽 회전 이중 룬 링
  for(const [rad,sp,w,al] of [[C*0.64,1.6,2.4,0.85],[C*0.48,-2.4,1.6,0.65]]){
    g.save();g.rotate(t*sp);
    g.strokeStyle=`rgba(${rgb},${al})`;
    g.lineWidth=w;
    g.setLineDash([C*0.16,C*0.10]);
    g.beginPath();g.arc(0,0,rad,0,Math.PI*2);g.stroke();
    g.restore();
  }
  // 내부 빛나는 코어 글로우
  const rg=g.createRadialGradient(0,0,C*0.05,0,0,C*0.62);
  rg.addColorStop(0,`rgba(${rgb},0.42)`);
  rg.addColorStop(1,`rgba(${rgb},0)`);
  g.fillStyle=rg;
  g.beginPath();g.arc(0,0,C*0.62,0,Math.PI*2);g.fill();
  g.restore();
}

function drawMoveTargets(g,selObj,now){
  const t=now*0.001,pu=0.5+0.5*Math.sin(t*5.5);
  g.save();
  for(const m of selObj.L){
    const [X,Y]=px(m[2],m[3]),target=B[m[3]][m[2]];
    if(target){
      // 적 기물 포획 가능 칸: 회전하는 적색 전술 조준경(Reticle)
      const r=C*(0.36+0.04*pu);
      g.save();g.translate(X,Y);
      const rg=g.createRadialGradient(0,0,r*0.2,0,0,r*1.25);
      rg.addColorStop(0,'rgba(255,59,48,0.34)');
      rg.addColorStop(1,'rgba(255,59,48,0)');
      g.fillStyle=rg;g.beginPath();g.arc(0,0,r*1.25,0,Math.PI*2);g.fill();

      g.rotate(t*1.8);
      g.strokeStyle='rgba(255,75,65,0.92)';
      g.lineWidth=Math.max(2.2,C*0.055);
      g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.stroke();
      for(let i=0;i<4;i++){
        g.rotate(Math.PI/2);
        g.beginPath();g.moveTo(r*0.75,0);g.lineTo(r*1.18,0);g.stroke();
      }
      g.restore();
    }else{
      // 일반 이동 칸: 맥동하는 에메랄드/청록 웨이포인트 링 + 코어 도트
      const r=C*(0.17+0.03*pu);
      g.save();g.translate(X,Y);
      g.strokeStyle=`rgba(56,239,145,${0.55+0.35*pu})`;
      g.lineWidth=Math.max(1.6,C*0.04);
      g.beginPath();g.arc(0,0,r*1.35,0,Math.PI*2);g.stroke();
      g.fillStyle='rgba(72,245,155,0.88)';
      g.shadowColor='#00e676';g.shadowBlur=6;
      g.beginPath();g.arc(0,0,r*0.72,0,Math.PI*2);g.fill();
      g.restore();
    }
  }
  g.restore();
}

function frame(now){cx2.clearRect(0,0,W,H);cx2.save();cx2.setTransform(1,0,0,1,0,0);cx2.drawImage(bc,0,0);cx2.restore();
if(window.jgDrawBoardLiveCracks)try{window.jgDrawBoardLiveCracks(cx2,now)}catch(e){}
if(window.jgDrawBoardThemeFX)try{window.jgDrawBoardThemeFX(cx2,now)}catch(e){}
if(lm&&!anim)drawLM(now);

const inCheckSide=(!over&&!anim&&typeof chk==='function')?(chk('c')?'c':(chk('h')?'h':null)):null;

// 1) 보드 위 정지 기물 렌더링 (입체 그림자 + 미세 호흡 + 선택 부양 효과)
for(let y=0;y<10;y++)for(let x=0;x<9;x++){
  const p=B[y][x];
  if(!p||(anim&&anim.m[2]==x&&anim.m[3]==y))continue;
  const[X,Y]=px(x,y),cs=y<=4?'h':'c',dlv=(window.jgDmg&&window.jgDmg(cs))||0;
  const hsh=Math.sin(x*12.9898+y*78.233)*43758.5453,r1=hsh-Math.floor(hsh),r2=(hsh*1.7)-Math.floor(hsh*1.7);
  const isSel=!!(sel&&sel.x==x&&sel.y==y);

  if(dlv>0){
    cx2.save();
    const hg=cx2.createRadialGradient(X,Y,C*0.12,X,Y,C*0.48);
    hg.addColorStop(0,'rgba(20,14,8,0.68)');hg.addColorStop(0.75,'rgba(255,220,140,0.22)');hg.addColorStop(1,'rgba(0,0,0,0)');
    cx2.fillStyle=hg;cx2.beginPath();cx2.arc(X,Y,C*0.48,0,7);cx2.fill();
    cx2.restore();
  }

  // 장군 당한 궁(K) 바닥 경고 펄스
  if(p.t==='K'&&inCheckSide===p.s){
    const cp=0.5+0.5*Math.sin(now/110);
    cx2.save();cx2.translate(X,Y+C*0.14);cx2.scale(1,0.55);
    cx2.strokeStyle=`rgba(255,45,35,${0.55+0.4*cp})`;cx2.lineWidth=Math.max(2.5,C*0.07);
    cx2.beginPath();cx2.arc(0,0,C*(0.52+0.12*cp),0,Math.PI*2);cx2.stroke();
    cx2.restore();
  }

  // 선택된 기물 바닥 룬 마법진
  if(isSel){
    const liftU=easeOutBackSoft(Math.min(1,(now-selLiftT)/180));
    drawSelectedAura(cx2,X,Y,p.s,now,liftU);
  }

  // 미세 호흡 & 부양 계산
  const breathPhase=now*0.0028+(x*0.7+y*1.1);
  const breath=Math.sin(breathPhase);
  const liftZ=isSel?(easeOutBackSoft(Math.min(1,(now-selLiftT)/180))*C*0.16+Math.sin(now*0.006)*C*0.025):(p.t==='K'||p.t==='R'?(Math.max(0,breath)*C*0.018):0);
  const bScale=isSel?1.08:(1+breath*(p.t==='K'?0.016:0.009));

  const opt=dlv>0?{
    rot:(r1-.5)*.085*dlv,
    dx:(r1-.5)*C*.035*dlv,
    dy:(r2-.5)*C*.035*dlv,
    z:liftZ,
    sc:bScale,
    shadow:true,
    glow:isSel?14:(p.t==='K'?7:0),
    glowCol:isSel?'rgba(255,235,130,0.95)':(p.s=='c'?'rgba(64,235,255,0.5)':'rgba(255,150,70,0.5)')
  }:{
    z:liftZ,
    sc:bScale,
    shadow:true,
    glow:isSel?14:(p.t==='K'?7:0),
    glowCol:isSel?'rgba(255,235,130,0.95)':(p.s=='c'?'rgba(64,235,255,0.5)':'rgba(255,150,70,0.5)')
  };
  spr(p,'token',0,X,Y,opt);
}

// 2) 선택된 기물의 이동 가능 칸 표시
if(sel)drawMoveTargets(cx2,sel,now);

// 3) 이동 및 전투 시퀀스 (병종별 궤적 · 잔상 · 히트스톱 · 탄성 복귀)
if(anim){
  const A=anim,t=now-A.t0,[a,b,c,d]=A.T,p=A.p,q=A.q,[X0,Y0]=px(A.m[0],A.m[1]),[X1,Y1]=px(A.m[2],A.m[3]);
  const dx=X1-X0,dy=Y1-Y0,fl=Math.abs(dx)>2?(dx<0):(X1>W*0.55),dirX=fl?-1:1;
  const standX=q?Math.max(C*0.6,Math.min(W-C*0.6,X1-dirX*C*0.78)):X1;
  const standY=q?(Y1+(Math.abs(dx)<=2?(dy>0?-C*0.18:C*0.18):0)):Y1;

  {const pf=p.s=='h'?'f_':'';if(!A.sm&&t>=180){A.sm=1;sfx(pf+SFN[p.t]+'_move')}if(q&&!A.sa&&t>=b){A.sa=1;sfx(pf+SFN[p.t]+'_attack')}}
  if(q&&!A.sd&&t>=b+240){A.sd=1;sfx((q.s=='h'?'f_':'')+'defeat')}

  // 피격 기물(q) 렌더링
  if(q){
    const qFl=!fl;
    if(t<b){
      // 공격자가 접근할수록 긴장 반응(미세 떨림)
      const prog=t>a?Math.max(0,((t-a)/A.D-0.45)/0.55):0;
      const shiver=prog>0?Math.sin(now*0.09)*C*0.03*prog:0;
      spr(q,'token',0,X1,Y1,{a:1,dx:shiver,shadow:true,sc:1+0.02*prog});
    }else if(t<b+A.A*0.56){
      const rawUh=ez((t-b)/(A.A*0.56));
      // 찰나의 히트스톱 보간
      const uh=rawUh<0.28?rawUh*1.35:(rawUh<0.38?0.378:(0.378+(rawUh-0.38)/0.62*0.622));
      const kb=Math.sin(Math.min(1,uh*1.15)*Math.PI*0.5)*dirX*C*0.34;
      const hitZ=Math.sin(Math.min(1,uh*1.2)*Math.PI)*C*0.16;
      drawStrikeFX(X1,Y1,Math.min(1,rawUh*1.75),dirX,p.s,p.t,standX,standY);
      spr(q,'hit',uh*5.99,X1+kb,Y1,{feet:1,fl:qFl,sc:1.10,z:hitZ,shadow:true,glow:12,glowCol:'rgba(255,90,70,0.9)'});
    }else if(t<d){
      const ud=ez((t-(b+A.A*0.56))/(d-(b+A.A*0.56))),kb=dirX*C*(0.34+0.16*ud);
      spr(q,'dead',ud*7.99,X1+kb,Y1+C*.06,{feet:1,fl:qFl,sc:1.06,a:ud>0.82?1-(ud-0.82)/0.18:1,shadow:ud<0.65});
    }
  }

  // 공격/이동 기물(p) 렌더링
  if(t<a){
    // 변신(xform): 석판 균열 → 장수 현현 + 바닥 충격파 & 팝 스케일
    const u=ez(t/a),pop=u>0.45?(1+0.12*Math.sin(((u-0.45)/0.55)*Math.PI)):(1-0.06*Math.sin(u/0.45*Math.PI));
    const rgb=p.s=='c'?'100,230,255':'255,190,85';
    cx2.save();cx2.translate(X0,Y0+C*0.16);cx2.scale(1,0.52);cx2.globalCompositeOperation='lighter';
    cx2.strokeStyle=`rgba(${rgb},${Math.sin(u*Math.PI)*0.85})`;
    cx2.lineWidth=Math.max(1.5,C*0.045);
    cx2.beginPath();cx2.arc(0,0,C*(0.24+u*0.44),0,Math.PI*2);cx2.stroke();
    cx2.restore();
    spr(p,'xform',u*5.99,X0,Y0,{feet:u>0.35?1:0,fl,sc:1.06*pop,shadow:true,glow:10});
  }else if(t<b){
    // 이동(walk / dash): 병종별 고유 3D 물리 궤적 + 고속 잔상(Afterimages)
    const u=ez((t-a)/A.D),tx=q?standX:X1,ty=q?standY:Y1;
    const mot=calcPieceMotion(A,u,X0,Y0,tx,ty);
    drawMoveTrail(X0,Y0,tx,ty,u,A.dist,now,p.s,A);

    // 잔상 버퍼 업데이트 및 렌더링 (최대 5중 실루엣 잔상)
    const animKey=(q&&u>.28)||(p.t==='R'&&A.dist>=2)?'dash':'walk';
    const frIdx=(t-a)/52;
    if(!A.lastGhostT||now-A.lastGhostT>26){
      A.lastGhostT=now;
      A.ghosts.push({x:mot.x,y:mot.y,z:mot.z,fr:frIdx,key:animKey,sx:mot.sx,sy:mot.sy,rot:mot.tilt,t:now});
      if(A.ghosts.length>5)A.ghosts.shift();
    }
    for(let gi=0;gi<A.ghosts.length;gi++){
      const gh=A.ghosts[gi],age=(now-gh.t)/150;
      if(age>=1)continue;
      const ga=(1-age)*(p.t==='R'||p.t==='G'?0.34:0.22);
      spr(p,gh.key,gh.fr,gh.x,gh.y,{feet:1,fl,sc:1.08,sx:gh.sx,sy:gh.sy,rot:gh.rot,z:gh.z,a:ga,comp:'lighter'});
    }

    spr(p,animKey,frIdx,mot.x,mot.y,{
      feet:1,fl,
      sc:1.10+.03*Math.sin(u*Math.PI),
      sx:mot.sx,sy:mot.sy,
      rot:mot.tilt,
      z:mot.z,
      shadow:true,
      glow:p.t==='R'||p.t==='C'?10:6
    });
  }else if(t<c){
    // 필살 공격(atk): 히트스톱 + 돌진 런지 + 병종별 타격 이펙트
    const rawU=ez((t-b)/A.A);
    const u=rawU<0.32?rawU*1.32:(rawU<0.42?0.422:(0.422+(rawU-0.42)/0.58*0.578));
    const lunge=Math.sin(u*Math.PI)*dirX*C*(p.t==='C'?0.08:0.18);
    const jumpAtk=(p.t==='N'||p.t==='B'||p.t==='R')?Math.sin(u*Math.PI)*C*0.18:0;
    drawStrikeFX(X1,Y1,Math.min(1,rawU*1.65),dirX,p.s,p.t,standX,standY);
    spr(p,'atk',u*7.99,standX+lunge,standY,{
      feet:1,fl,
      sc:1.24+.07*Math.sin(u*Math.PI),
      z:jumpAtk,
      shadow:true,
      glow:16
    });
  }else if(t<d){
    // 안착 및 복귀(rev): 목표 칸 이동 + 장수→기물 변신 + 탄성 착지 바운스
    const u=ez((t-c)/(d-c)),e=easeMove(u),rx=standX+(X1-standX)*e,ry=standY+(Y1-standY)*e;
    if(!q)drawLandingFX(X1,Y1,u,p.s,p.t);
    const settle=u>0.55?Math.sin(((u-0.55)/0.45)*Math.PI):0;
    const bounceZ=u<0.45?Math.sin((u/0.45)*Math.PI)*C*0.12:0;
    spr(p,'rev',u*5.99,rx,ry,{
      feet:u<0.45?1:0,
      fl,
      sc:1.05,
      sx:1+0.11*settle,
      sy:1-0.09*settle,
      z:bounceZ,
      shadow:true
    });
  }else fin();
}
if(window.jgDrawSpec)try{window.jgDrawSpec(cx2,now)}catch(e){}if(jang)drawJang(now)}
function loop(now){if($('g').style.display!='block'){looping=false;return}try{frame(now)}catch(e){console.error(e)}requestAnimationFrame(loop)}
/* ---------- 상태 저장·복원 (화면 회전/재로딩 대비) ---------- */
function save(){try{const g=(inGame&&!over)?{mode:cfg.mode,B,turn:anim?anim.o:turn,me,lm,mc,oppNick,time:cfg.time,hostSide,isHost,code,sid}:null;
const o={t:Date.now(),cfg:{lv:cfg.lv,time:cfg.time,si:cfg.si,mode:cfg.mode},room:(peer&&isHost&&code&&!g)?{code}:null,game:g},j=JSON.stringify(o);try{localStorage.setItem('jg_st',j)}catch(e){}try{sessionStorage.setItem('jg_st',j)}catch(e){}}catch(e){}}
function resumeGame(g){oppNick=g.oppNick||'상대';cfg.time=g.time||cfg.time;isHost=!!g.isHost;code=g.code||'';sid=g.sid||'';hostSide=g.hostSide;
begin(g.me,'RNBG.GNBR','RNBG.GNBR',g.mode);B=g.B;lm=g.lm||null;mc=g.mc||0;setTurn(g.turn);toast('화면이 다시 불러와져서 대국을 이어갑니다',3500);
if(g.mode=='mp'&&lib()){if(isHost)mkRoom(code);else doJoin(true)}}
function boot(){let o=null;try{o=JSON.parse(localStorage.getItem('jg_st')||sessionStorage.getItem('jg_st')||'null')}catch(e){}if(!o)return;
const c=o.cfg||{};if(c.lv&&lvB[c.lv]){cfg.lv=c.lv;for(const k in lvB)lvB[k].classList.toggle('on',k==c.lv)}if(c.time&&tB[c.time]){cfg.time=c.time;for(const k in tB)tB[k].classList.toggle('on',k==c.time)}if(c.si>=0&&c.si<4){cfg.si=c.si;showSetup()}if(c.mode=='ai'||c.mode=='mp')setMode(c.mode);
if(Date.now()-o.t>20*60*1000)return;const g=o.game;
if(g&&g.B&&(g.mode=='ai'||g.mode=='mp')){try{RESUMED=true;resumeGame(g)}catch(e){console.error('resume failed',e);try{localStorage.removeItem('jg_st');sessionStorage.removeItem('jg_st')}catch(x){}}}else if(o.room&&o.room.code&&lib()){try{RESUMED=true;mkRoom(o.room.code)}catch(e){console.error(e)}}}
function wake(){if(peer&&peer.disconnected&&!peer.destroyed){try{peer.reconnect()}catch(e){}}if(inGame&&!over&&cfg.mode=='mp'&&!isHost&&!(conn&&conn.open)&&Date.now()-jLast>5000)doJoin(true)}
document.addEventListener('visibilitychange',()=>{save();if(!document.hidden)wake()});addEventListener('online',wake);addEventListener('pageshow',wake);addEventListener('pagehide',save);addEventListener('resize',save);addEventListener('orientationchange',save);
boot();setInterval(save,2000);
