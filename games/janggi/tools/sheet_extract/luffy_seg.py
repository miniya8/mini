from extract import *
import pickle
from PIL import Image, ImageDraw
c=load('9dfbbc4b'); rgba,bg=remove_bg(c,12)
rows=[('token',12,140,1),('transform',150,272,4),('move',282,410,5),('attack',420,562,6),('hit',574,718,6),('death',733,840,4),('revert',854,1012,4)]
d={}
for p,y0,y1,n in rows: d[p]=segment_n(rgba,y0,y1,135,1536,n)
pickle.dump({'R_luffy':d},open('luffy_seg.pkl','wb'))
fl=[];lbl=[]
for p,frs in d.items():
    for k,f in enumerate(frs): fl.append(f); lbl.append(p[:2]+str(k))
W=sum((f['img'].shape[1] if f else 20)+6 for f in fl)+10; H=max(f['img'].shape[0] for f in fl if f)+26
im=Image.new('RGBA',(W,H),(60,60,80,255)); dr=ImageDraw.Draw(im); x=5
for f,l in zip(fl,lbl):
    if f: im.alpha_composite(Image.fromarray(f['img']),(x,22))
    dr.text((x,2),l,fill=(255,255,0),font=F); x+=(f['img'].shape[1] if f else 20)+6
im=im.resize((im.width//3,im.height//3)); im.convert('RGB').save('luffy_seg.jpg'); print(im.size)
