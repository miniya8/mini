from extract import *
import pickle
rows={'A':[(60,132),(306,376),(552,624)],'B':[(166,236),(412,480),(658,728)]}
P={'4cf3098e':['E_guile','H_akuma','P_dan'],'56e29ef8':['K_ryu','R_chun','C_ken']}
ranged_n={'E_guile':4,'H_akuma':4,'P_dan':3,'C_ken':4}
res={}
for sid,names in P.items():
    c=load(sid); rgba,bg=remove_bg(c,20); lab,cs=comps(rgba); cl=clean_text(rgba,lab,cs)
    # 헤더 글자 영역: 어둡고 무채색인 픽셀 제거
    for (ya,yb) in rows['A']+rows['B']:
        for (xa,xb) in [(108,210),(405,495),(790,860),(712,775),(1020,1300)]:
            box=cl[ya:ya+24,xa:xb]; px=box[...,:3].astype(int)
            dark=(px.max(2)<130)&((px.max(2)-px.min(2))<45)
            box[dark]=0
    for r,name in enumerate(names):
        ya=rows['A'][r]; yb=rows['B'][r]
        d={}
        d['transform']=segment_n(cl,*ya,108,402,4)
        d['move']=segment_n(cl,*ya,402,790,5)
        d['attack']=segment_n(cl,*ya,790,1344,6)
        d['hit']=segment_n(cl,*yb,108,402,4)
        d['death']=segment_n(cl,*yb,402,712,4)
        if name=='K_ryu': d['revert']=segment_n(cl,*yb,712,1100,5)
        else:
            d['revert']=segment_n(cl,*yb,712,1008,4)
            if name in ranged_n: d['ranged']=segment_n(cl,*yb,1008,1344,ranged_n[name])
        res[name]=d
pickle.dump(res,open('sf_seg.pkl','wb'))
# 대조표
from PIL import Image, ImageDraw
rowsimg=[]
for name,d in res.items():
    fl=[];lbl=[]
    for ph,frs in d.items():
        for k,f in enumerate(frs): fl.append(f); lbl.append(ph[:2]+str(k))
    W=sum((f['img'].shape[1] if f else 20)+6 for f in fl)+80; H=max(f['img'].shape[0] for f in fl if f)+26
    im=Image.new('RGBA',(W,H),(60,60,80,255)); dr=ImageDraw.Draw(im); x=80; dr.text((2,2),name,fill=(200,255,200),font=F)
    for f,l in zip(fl,lbl):
        if f: im.alpha_composite(Image.fromarray(f['img']),(x,22))
        dr.text((x,2),l,fill=(255,255,0),font=F); x+=(f['img'].shape[1] if f else 20)+6
    rowsimg.append(im)
W=max(i.width for i in rowsimg); H=sum(i.height+4 for i in rowsimg)
S=Image.new('RGB',(W,H)); y=0
for i in rowsimg: S.paste(i,(0,y)); y+=i.height+4
S.save('sf_seg.jpg',quality=85); print(S.size)
