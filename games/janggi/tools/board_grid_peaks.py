import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import median_filter, uniform_filter1d
from scipy.signal import find_peaks
ids='a0bbe2d0 9be2f3dd 303bda73 b97744c7 a32c75c6 3900a558 cff922d1 0e26df3c 4008e557 6b478a83 707cbc43 413a31cc'.split()
F=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc',11)
for n,i in enumerate(ids):
    im=Image.open(f'/mnt/user-data/uploads/{i}-image.png').convert('RGB')
    g=np.array(im).astype(float).mean(2)
    hp=np.abs(g-median_filter(g,size=9))
    colp=uniform_filter1d(hp,25,axis=0).mean(0); rowp=uniform_filter1d(hp,25,axis=1).mean(1)
    pc,_=find_peaks(colp,distance=25,prominence=0.8); pr,_=find_peaks(rowp,distance=25,prominence=0.8)
    big=im.resize((im.width*2,im.height*2)); d=ImageDraw.Draw(big)
    for x in pc: d.line((2*x,0,2*x,14),fill=(255,0,255),width=3); d.text((2*x+2,14),str(x),fill=(255,255,0),font=F)
    for y in pr: d.line((0,2*y,14,2*y),fill=(255,0,255),width=3); d.text((16,2*y-6),str(y),fill=(255,255,0),font=F)
    big.save(f'pk_{n+1:02d}.png')
    print(n+1,i,'X',list(pc),'Y',list(pr))
