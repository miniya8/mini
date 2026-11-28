from extract import *
import pickle
from PIL import Image, ImageDraw
c=load('379b8341')
# 표 격자선 지우기: 무채색 선 → 배경색으로
bg=np.array([239,239,239],np.float32)
sat=c.max(2)-c.min(2); val=c.max(2)
grey=(sat<18)&(val<225)&(val>120)
H,W=grey.shape
colf=grey.mean(0); rowf=grey.mean(1)
for x in np.where(colf>0.35)[0]:
    for dx in (-1,0,1):
        xx=min(max(x+dx,0),W-1); m=grey[:,xx]|((sat[:,xx]<25)&(val[:,xx]<235)); c[m,xx]=bg
for y in np.where(rowf>0.35)[0]:
    for dy in (-1,0,1):
        yy=min(max(y+dy,0),H-1); m=grey[yy,:]|((sat[yy,:]<25)&(val[yy,:]<235)); c[yy,m]=bg
rgba,_=remove_bg(c,20); lab,cs=comps(rgba); cl=clean_text(rgba,lab,cs)
names=['goku','luffy','ryu','saber','naruto','mario','sephiroth']
res={}
for k,n in enumerate(names):
    y0=69+100*k+2; y1=143+100*k-1
    d={}
    d['token']=segment_n(cl,y0,y1,2,101,1)
    d['transform']=segment_n(cl,y0,y1,104,316,4)
    d['move']=segment_n(cl,y0,y1,319,538,5)
    d['attack']=segment_n(cl,y0,y1,541,797,6)
    d['hit']=segment_n(cl,y0,y1,800,1001,5)
    d['death']=segment_n(cl,y0,y1,1004,1165,4)
    d['revert']=segment_n(cl,y0,y1,1168,1329,4)
    res[n]=d
pickle.dump(res,open('kings_seg.pkl','wb'))
rowsimg=[]
for name,d in res.items():
    fl=[];lbl=[]
    for ph,frs in d.items():
        for k,f in enumerate(frs): fl.append(f); lbl.append(ph[:2]+str(k))
    W2=sum((f['img'].shape[1] if f else 20)+6 for f in fl)+60; H2=max(f['img'].shape[0] for f in fl if f)+26
    im=Image.new('RGBA',(W2,H2),(60,60,80,255)); dr=ImageDraw.Draw(im); x=56; dr.text((2,2),name,fill=(200,255,200),font=F)
    for f,l in zip(fl,lbl):
        if f: im.alpha_composite(Image.fromarray(f['img']),(x,22))
        dr.text((x,2),l,fill=(255,255,0),font=F); x+=(f['img'].shape[1] if f else 20)+6
    rowsimg.append(im)
W2=max(i.width for i in rowsimg); H2=sum(i.height+4 for i in rowsimg)
S=Image.new('RGB',(W2,H2)); y=0
for i in rowsimg: S.paste(i,(0,y)); y+=i.height+4
S.save('kings_seg.jpg',quality=85); print(S.size)
