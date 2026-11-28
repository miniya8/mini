"""추출한 프레임 → 게임용 표준 시트(행: 변신/이동/공격/피격/사망/복귀/원거리/투사체) + 매니페스트"""
import pickle, json, os, numpy as np
from PIL import Image
FW, FH = 200, 150          # 프레임 칸 크기
BASE = 126                 # 캐릭터 발 위치(y)
CHAR_H = 92                # 이동 프레임 캐릭터 평균 키
TOK = 66                   # 장기알 지름
ORDER = ['transform','move','attack','hit','death','revert','ranged','proj']
OUT='/home/claude/mini-janggi/assets/images/pieces'

def pil(f): return Image.fromarray(f['img'])
def centroid_x(a):
    m=a[...,3]>180
    if m.sum()<10: m=a[...,3]>40
    ys,xs=np.where(m); return xs.mean() if len(xs) else a.shape[1]/2
def place(canvas, img, mode, k):
    w,h=img.size; nw,nh=max(1,round(w*k)),max(1,round(h*k))
    im=img.resize((nw,nh),Image.LANCZOS)
    a=np.array(im)
    if mode=='center': x=FW/2-nw/2; y=FH/2-nh/2
    else:
        cx=centroid_x(a)*1.0
        x=FW/2-cx; y=BASE-nh
    canvas.alpha_composite(im,(int(round(x)),int(round(y)))) if 0<=x and 0<=y and x+nw<=FW and y+nh<=FH else paste_clip(canvas,im,int(round(x)),int(round(y)))
def paste_clip(canvas, im, x, y):
    sx,sy=max(0,-x),max(0,-y); x2,y2=max(0,x),max(0,y)
    w=min(im.width-sx, FW-x2); h=min(im.height-sy, FH-y2)
    if w<=0 or h<=0: return
    canvas.alpha_composite(im.crop((sx,sy,sx+w,sy+h)),(x2,y2))

def build(name, phases, tok_tr=1, plain_token=None, proj=None, out_dir='x', file='x', tok_mult=1.0):
    ph={k:[f for f in v if f] for k,v in phases.items() if v}
    def rh(f):
        m=(f['img'][...,3]>160).sum(1)>=3
        ys=np.where(m)[0]
        return (ys.max()-ys.min()+1) if len(ys) else f['img'].shape[0]
    def rw(f):
        m=(f['img'][...,3]>160).sum(0)>=3
        xs=np.where(m)[0]
        return (xs.max()-xs.min()+1) if len(xs) else f['img'].shape[1]
    mv=[rh(f) for f in ph.get('move',[])]
    sc=CHAR_H/np.median(mv)
    tk=plain_token or ph['revert'][-1]
    st=TOK*tok_mult/max(rh(tk),rw(tk))
    rows=[]
    anims={}
    for p in ORDER:
        frs=ph.get(p)
        if not frs: continue
        cells=[]
        for j,f in enumerate(frs):
            cv=Image.new('RGBA',(FW,FH),(0,0,0,0))
            if p=='proj':
                im=pil(f); k=min(sc, (FW-4)/im.width)
                place(cv,im,'center',k)
            elif (p=='transform' and j<tok_tr) or p=='revert':
                place(cv,pil(f),'center',st if (p=='revert' or j<tok_tr) else sc)
            else: place(cv,pil(f),'bottom',sc)
            cells.append(cv)
        anims[p]={'row':len(rows),'n':len(cells)}
        rows.append(cells)
    cols=max(len(r) for r in rows)
    sheet=Image.new('RGBA',(cols*FW,len(rows)*FH),(0,0,0,0))
    for r,cells in enumerate(rows):
        for c,cv in enumerate(cells): sheet.alpha_composite(cv,(c*FW,r*FH))
    os.makedirs(f'{OUT}/{out_dir}',exist_ok=True)
    sheet.save(f'{OUT}/{out_dir}/{file}.webp',quality=86,alpha_quality=90,method=6)
    nrev=anims['revert']['n']
    tf={'transform':list(range(tok_tr)),'revert':[nrev-1]}
    return {'file':file,'anims':anims,'tokenFrames':tf}
