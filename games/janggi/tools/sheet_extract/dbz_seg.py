from extract import *
import pickle
from PIL import Image, ImageDraw
S={'E_trunks':('267da461',102,True),'P_krillin':('89b82721',98,False),'H_gohan':('b7096cdd',100,False),'A_kri2':('5bcccdce',100,False),
   'A_tien':('c457ccb1',106,True),'A_goku':('0ed7196c',102,True),'H_broly':('29681100',98,False),'K_goku':('e682ed34',101,False),
   'R_vegeta':('ec9a951f',100,False),'C_piccolo':('bb031e4b',99,True)}
ph=[('transform',108,316,4),('move',316,528,5),('attack',528,782,6),('hit',782,982,5),('death',982,1142,4),('revert',1142,1319,4)]
res={}
for name,(sid,ly,rng) in S.items():
    c=load(sid); rgba,bg=remove_bg(c,20); lab,cs=comps(rgba); cl=clean_text(rgba,lab,cs)
    d={p:segment_n(cl,30,ly,a,b,n) for p,a,b,n in ph}
    if rng: d['ranged']=segment_n(cl,ly+8,cl.shape[0],300,760,3 if name!='A_tien' else 2)
    res[name]=d
pickle.dump(res,open('dbz_seg.pkl','wb'))
rowsimg=[]
for name,d in res.items():
    fl=[];lbl=[]
    for p,frs in d.items():
        for k,f in enumerate(frs): fl.append(f); lbl.append(p[:2]+str(k))
    W=sum((f['img'].shape[1] if f else 20)+6 for f in fl)+80; H=max(f['img'].shape[0] for f in fl if f)+26
    im=Image.new('RGBA',(W,H),(60,60,80,255)); dr=ImageDraw.Draw(im); x=80; dr.text((2,2),name,fill=(200,255,200),font=F)
    for f,l in zip(fl,lbl):
        if f: im.alpha_composite(Image.fromarray(f['img']),(x,22))
        dr.text((x,2),l,fill=(255,255,0),font=F); x+=(f['img'].shape[1] if f else 20)+6
    rowsimg.append(im)
W=max(i.width for i in rowsimg); H=sum(i.height+4 for i in rowsimg)
Sx=Image.new('RGB',(W,H)); y=0
for i in rowsimg: Sx.paste(i,(0,y)); y+=i.height+4
Sx.save('dbz_seg.jpg',quality=85); print(Sx.size)
