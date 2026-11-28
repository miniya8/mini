from extract import *
import pickle
from PIL import Image, ImageDraw
c=load('47403011'); rgba,bg=remove_bg(c,20); lab,cs=comps(rgba); cl=clean_text(rgba,lab,cs)
names=['K','R','C','E','H','A','P']
ranged={'C':6,'E':5,'H':5}
res={}
def equal_n(img,y0,y1,x0,x1,n):
    out=[]; w=(x1-x0)/n
    for i in range(n):
        a=int(x0+i*w); b=int(x0+(i+1)*w)
        crop=img[y0:y1,a:b]; m=crop[...,3]>20; ys,xs=np.where(m)
        out.append(dict(img=crop[ys.min():ys.max()+1,xs.min():xs.max()+1].copy(),box=(a,y0,b,y1)) if len(ys) else None)
    return out
# 원거리 칸 위쪽 안내 글자 지우기
for k,n in enumerate(names):
    if n in ranged:
        yt=51+100*k
        cl[yt:yt+37,1108:1344]=0; cl[yt:yt+100,1106:1117]=0
for k,n in enumerate(names):
    y0=51+100*k+22; y1=151+100*k-1
    d={}
    d['token']=segment_n(cl,y0,y1,0,97,1)
    d['transform']=segment_n(cl,y0,y1,100,298,4)
    d['move']=segment_n(cl,y0,y1,301,521,4) if n in 'RH' else segment_n(cl,y0,y1,301,521,5)
    d['attack']=segment_n(cl,y0,y1,524,784,6)
    d['hit']=segment_n(cl,y0,y1,787,992,5)
    if n in ranged:
        d['death']=segment_n(cl,y0,y1,995,1108,3)
        d['ranged']=segment_n(cl,y0,y1,1112,1344,ranged[n])
    else:
        d['death']=segment_n(cl,y0,y1,995,1163,4)
        d['revert']=segment_n(cl,y0,y1,1167,1344,4)
    res[n]=d
pickle.dump(res,open('fantasy_seg.pkl','wb'))
rowsimg=[]
for name,d in res.items():
    fl=[];lbl=[]
    for ph,frs in d.items():
        for k,f in enumerate(frs): fl.append(f); lbl.append(ph[:2]+str(k))
    W=sum((f['img'].shape[1] if f else 20)+6 for f in fl)+40; H=max(f['img'].shape[0] for f in fl if f)+26
    im=Image.new('RGBA',(W,H),(60,60,80,255)); dr=ImageDraw.Draw(im); x=30; dr.text((2,2),name,fill=(200,255,200),font=F)
    for f,l in zip(fl,lbl):
        if f: im.alpha_composite(Image.fromarray(f['img']),(x,22))
        dr.text((x,2),l,fill=(255,255,0),font=F); x+=(f['img'].shape[1] if f else 20)+6
    rowsimg.append(im)
W=max(i.width for i in rowsimg); H=sum(i.height+4 for i in rowsimg)
S=Image.new('RGB',(W,H)); y=0
for i in rowsimg: S.paste(i,(0,y)); y+=i.height+4
S.save('fantasy_seg.jpg',quality=85); print(S.size)
