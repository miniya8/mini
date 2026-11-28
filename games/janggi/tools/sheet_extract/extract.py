import numpy as np, glob, json, sys
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
F=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc',12)
def load(i):
    f=glob.glob('/mnt/user-data/uploads/'+i+'*')[0]
    return np.array(Image.open(f).convert('RGB')).astype(np.float32)
def remove_bg(c, tol=20):
    h,w=c.shape[:2]
    ring=np.concatenate([c[:2].reshape(-1,3),c[-2:].reshape(-1,3),c[:,:2].reshape(-1,3),c[:,-2:].reshape(-1,3)])
    bg=np.median(ring,0)
    d=np.sqrt(((c-bg)**2).sum(2))
    near=d<tol
    lab,n=ndi.label(near)
    border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    R=np.isin(lab,list(border))
    pk,pn=ndi.label(d<8)
    if pn:
        ps=ndi.sum(np.ones_like(d),pk,range(1,pn+1))
        R|=np.isin(pk,[k+1 for k in range(pn) if ps[k]>=40])
    R=ndi.binary_dilation(R,iterations=1)
    a=np.ones((h,w),np.float32)
    a[R]=np.clip((d[R]-6)/34.0,0,1)
    un=(c-(1-a[...,None])*bg)/np.maximum(a,1e-3)[...,None]
    rgb=np.where(R[...,None],np.clip(un,0,255),c)
    out=np.dstack([rgb,a*255]).astype(np.uint8); out[out[...,3]<4]=0
    return out,bg
def comps(rgba, text_h=18):
    m=rgba[...,3]>40
    lab,n=ndi.label(m,structure=np.ones((3,3)))
    res=[]
    for k,sl in enumerate(ndi.find_objects(lab)):
        reg=lab[sl]==k+1
        h=sl[0].stop-sl[0].start; w=sl[1].stop-sl[1].start
        px=rgba[sl][...,:3][reg].astype(int)
        sat=(px.max(1)-px.min(1)).mean(); val=px.max(1).mean()
        area=reg.sum()
        kind='obj'
        if (w<=3 and h>20) or (h<=3 and w>20): kind='line'
        elif h<=text_h and sat<40 and val<140: kind='text'
        elif area<6: kind='dust'
        res.append(dict(k=k+1,y0=sl[0].start,y1=sl[0].stop,x0=sl[1].start,x1=sl[1].stop,area=int(area),kind=kind))
    return lab,res

def frames(rgba, lab, cs, y0, y1, xmin=0, xmax=10**9, gap=3, big=80, text_ok=False):
    sel=[o for o in cs if o['kind'] in (('obj','text') if text_ok else ('obj',)) and (o['y0']+o['y1'])/2>=y0 and (o['y0']+o['y1'])/2<y1
         and (o['x0']+o['x1'])/2>=xmin and (o['x0']+o['x1'])/2<xmax]
    bigs=sorted([o for o in sel if o['area']>=big],key=lambda o:o['x0'])
    groups=[]
    for o in bigs:
        if groups and o['x0']<=groups[-1]['x1']+gap:
            g=groups[-1]; g['x1']=max(g['x1'],o['x1']); g['items'].append(o)
        else: groups.append({'x0':o['x0'],'x1':o['x1'],'items':[o]})
    for o in sel:
        if o['area']>=big: continue
        cx=(o['x0']+o['x1'])/2
        for g in groups:
            if g['x0']-3<=cx<=g['x1']+3: g['items'].append(o); break
    out=[]
    for g in groups:
        ks=[o['k'] for o in g['items']]
        Y0=min(o['y0'] for o in g['items']); Y1=max(o['y1'] for o in g['items'])
        X0=min(o['x0'] for o in g['items']); X1=max(o['x1'] for o in g['items'])
        crop=rgba[Y0:Y1,X0:X1].copy()
        m=np.isin(lab[Y0:Y1,X0:X1],ks)
        # 반투명 가장자리 포함: 마스크 약간 팽창
        m=ndi.binary_dilation(m,iterations=2)
        crop[~m]=0
        out.append(dict(img=crop,box=(X0,Y0,X1,Y1)))
    return out

def contact(fr_list, path, label=''):
    W=sum(max(f['img'].shape[1],30)+6 for f in fr_list)+10; H=max([f['img'].shape[0] for f in fr_list]+[40])+24
    im=Image.new('RGBA',(max(W,200),H),(60,60,80,255)); d=ImageDraw.Draw(im); x=5
    for n,f in enumerate(fr_list):
        p=Image.fromarray(f['img']); im.alpha_composite(p,(x,18)); d.text((x,2),str(n),fill=(255,255,0),font=F); x+=max(p.width,30)+6
    d.text((im.width-120,2),label,fill=(200,255,200),font=F)
    im.convert('RGB').save(path)

def label_centers(cs, ly0, ly1, xmin=0, xmax=10**9, join=7):
    t=[o for o in cs if o['area']>=15 and o['y0']>=ly0 and o['y1']<=ly1 and o['x0']>=xmin and o['x1']<=xmax and (o['y1']-o['y0'])<=16]
    t.sort(key=lambda o:o['x0'])
    words=[]
    for o in t:
        if words and o['x0']-words[-1][1]<=join: words[-1][1]=max(words[-1][1],o['x1'])
        else: words.append([o['x0'],o['x1']])
    return [ (a+b)/2 for a,b in words if b-a>=6 ]

def cut_frames(rgba, y0, y1, centers, half=75, x_lo=None, x_hi=None):
    out=[]
    for j,cx in enumerate(centers):
        lo=(centers[j-1]+cx)/2 if j>0 else cx-half
        hi=(centers[j+1]+cx)/2 if j<len(centers)-1 else cx+half
        lo=int(max(lo,cx-half, x_lo if x_lo is not None else 0)); hi=int(min(hi,cx+half, x_hi if x_hi is not None else rgba.shape[1]))
        crop=rgba[y0:y1,lo:hi].copy()
        m=crop[...,3]>20
        if not m.any(): out.append(None); continue
        ys,xs=np.where(m)
        out.append(dict(img=crop[ys.min():ys.max()+1, xs.min():xs.max()+1], box=(lo+xs.min(),y0+ys.min(),lo+xs.max()+1,y0+ys.max()+1), cx=cx))
    return out

def assign_frames(rgba, lab, cs, y0, y1, centers, xmin=0, xmax=10**9, header=14):
    """라벨 중심(centers)마다 그 열에 속하는 덩어리를 모아 프레임 생성 (헤더 글자·큰 기준알 제외)"""
    n=len(centers)
    bounds=[]
    for j,cx in enumerate(centers):
        sp=(centers[j+1]-cx) if j<n-1 else (cx-centers[j-1] if j>0 else 120)
        sp0=(cx-centers[j-1]) if j>0 else sp
        bounds.append((cx-sp0/2, cx+sp/2))
    sel=[]
    for o in cs:
        cy=(o['y0']+o['y1'])/2; cxo=(o['x0']+o['x1'])/2
        if not (y0<=cy<y1): continue
        if cxo<xmin or cxo>xmax: continue
        h=o['y1']-o['y0']
        if o['kind'] in ('text','line'): continue
        if h<=15 and o['y0']<y0+header and o['area']<400: continue   # 헤더 글자
        if o['area']<3: continue
        sel.append(o)
    out=[]
    for j,(lo,hi) in enumerate(bounds):
        ks=[]
        for o in sel:
            w=o['x1']-o['x0']; cxo=(o['x0']+o['x1'])/2
            if w>(hi-lo)*1.3:   # 여러 칸에 걸친 덩어리 → 잘라서 사용
                if o['x1']>lo and o['x0']<hi: ks.append((o['k'],True))
            elif lo<=cxo<hi: ks.append((o['k'],False))
        if not ks: out.append(None); continue
        reg=np.zeros(rgba.shape[:2],bool)
        L=lab
        for k,cut in ks:
            m=(L==k)
            if cut:
                mm=np.zeros_like(m); a=int(max(lo,0)); b=int(min(hi,rgba.shape[1])); mm[:,a:b]=m[:,a:b]; m=mm
            reg|=m
        reg=ndi.binary_dilation(reg,iterations=2) & (rgba[...,3]>0)
        ys,xs=np.where(reg)
        Y0,Y1,X0,X1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        crop=rgba[Y0:Y1,X0:X1].copy(); crop[~reg[Y0:Y1,X0:X1]]=0
        out.append(dict(img=crop,box=(X0,Y0,X1,Y1),cx=centers[j]))
    return out

def clean_text(rgba, lab, cs, keep_area=1500):
    """글자(라벨/헤더)로 보이는 덩어리 제거"""
    out=rgba.copy()
    for o in cs:
        h=o['y1']-o['y0']; w=o['x1']-o['x0']
        if o['kind']=='line' or o['kind']=='text':
            out[lab==o['k']]=0; continue
        if h<=17 and o['area']<keep_area:
            sl=(slice(o['y0'],o['y1']),slice(o['x0'],o['x1']))
            reg=lab[sl]==o['k']
            px=rgba[sl][...,:3][reg].astype(int)
            sat=(px.max(1)-px.min(1)).mean(); val=px.max(1).mean()
            if sat<45 and val<160: out[sl][reg]=0
    return out

def segment_n(rgba, y0, y1, x0, x1, n, thr=2):
    a=(rgba[y0:y1,x0:x1,3]>30).sum(0).astype(float)
    on=a>thr
    runs=[];s=None
    for x,v in enumerate(on):
        if v and s is None: s=x
        if not v and s is not None: runs.append([s,x]); s=None
    if s is not None: runs.append([s,len(on)])
    runs=[r for r in runs if a[r[0]:r[1]].sum()>40]
    # 아주 작은 조각은 가까운 덩어리에 붙임
    def merge_small():
        changed=True
        while changed and len(runs)>1:
            changed=False
            for k,r in enumerate(runs):
                if r[1]-r[0]<10:
                    j=k-1 if k>0 and (k==len(runs)-1 or r[0]-runs[k-1][1] < runs[k+1][0]-r[1]) else k+1
                    lo,hi=min(runs[j][0],r[0]),max(runs[j][1],r[1]); runs[min(j,k)]=[lo,hi]; runs.pop(max(j,k)); changed=True; break
    merge_small()
    while len(runs)>n:
        gaps=[runs[k+1][0]-runs[k][1] for k in range(len(runs)-1)]
        k=int(np.argmin(gaps)); runs[k]=[runs[k][0],runs[k+1][1]]; runs.pop(k+1)
    while len(runs)<n:
        k=int(np.argmax([r[1]-r[0] for r in runs])); r=runs[k]; w=r[1]-r[0]
        mid=r[0]+int(w*0.2)+int(np.argmin(a[r[0]+int(w*0.2):r[0]+int(w*0.8)]))
        runs[k]=[r[0],mid]; runs.insert(k+1,[mid,r[1]])
    out=[]
    for r in runs:
        crop=rgba[y0:y1,x0+r[0]:x0+r[1]]
        m=crop[...,3]>20
        ys,xs=np.where(m)
        if not len(ys): out.append(None); continue
        out.append(dict(img=crop[ys.min():ys.max()+1,xs.min():xs.max()+1].copy(),box=(x0+r[0]+xs.min(),y0+ys.min(),x0+r[0]+xs.max()+1,y0+ys.max()+1)))
    return out
