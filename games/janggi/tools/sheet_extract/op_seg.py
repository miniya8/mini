from extract import *
import pickle
from PIL import Image, ImageDraw
res={}
# --- 시트 2: 나미/로빈/프랑키/브룩
c=load('01e1eac9'); rgba,bg=remove_bg(c,20); lab,cs=comps(rgba); cl=clean_text(rgba,lab,cs)
bands={'H_nami':(65,162),'A_robin':(253,351),'A_franky':(442,539),'H_brook':(630,727)}
ph=[('transform',125,400,4),('move',400,620,5),('attack',620,858,5),('hit',858,1038,4),('death',1038,1168,3),('revert',1168,1344,3)]
for name,(y0,y1) in bands.items():
    res[name]={p:segment_n(cl,y0,y1,a,b,n) for p,a,b,n in ph}
# --- 표 시트: 루피/조로/우솝/상디/쵸파 (칸 = F 라벨)
c=load('33394bc7'); rgba,bg=remove_bg(c,20); lab,cs=comps(rgba)
cl=clean_text(rgba,lab,cs)
V=[123,173,222,270,322,365,408,451,494,542,585,628,671,714,757,800,841,881,922,962,1002,1042,1082,1122,1162,1201,1240,1279,1318]
Hl=[24,56,95,191,230,326,365,462,500,595,634,730]
rgba2=rgba.copy(); px=c.astype(int)
gray=((px.max(2)-px.min(2))<22)&(px.mean(2)>120)&(px.mean(2)<225)
for x in V:
    for xx in range(x-2,x+3): rgba2[gray[:,xx],xx]=0
for y in Hl:
    for yy in range(y-2,y+3): rgba2[yy,gray[yy]]=0
lab2,cs2=comps(rgba2); cl2=clean_text(rgba2,lab2,cs2)
rows={'K_luffy':(95,191),'R_zoro':(230,326),'C_usopp':(365,462),'E_sanji':(500,595),'P_chopper':(634,730)}
cuts=[4,5,6,5,4,4]; names=['transform','move','attack','hit','death','revert']
cen=[(V[j]+V[j+1])/2 for j in range(28)]
for name,(y0,y1) in rows.items():
    fr=segment_n(cl2,y0+2,y1-2,124,1318,28)
    d={};k=0
    for nm,n in zip(names,cuts): d[nm]=fr[k:k+n]; k+=n
    res[name]=d
pickle.dump(res,open('op_seg.pkl','wb'))
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
S=Image.new('RGB',(W,H)); y=0
for i in rowsimg: S.paste(i,(0,y)); y+=i.height+4
S=S.resize((S.width*6//10,S.height*6//10)); S.save('op_seg.jpg',quality=85); print(S.size)
