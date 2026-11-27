"""무장 스프라이트 시트 정리: 8x6 그리드(140px) 투명 시트에서 얇은 세로/가로 잔선 제거"""
import numpy as np, os
from PIL import Image
from scipy import ndimage as ndi
M = {
 'han': {'H':'a99449f5','P':'a912fec7','A':'3727a88c','E':'845c024f','K':'804fc0c5','R':'b3957620','C':'bba10196'},
 'cho': {'H':'16fb24d3','A':'d2316d1e','E':'2e0d2bcf','K':'e8b535c6','P':'f8e6c627','R':'c94c1342','C':'ed8f93a6'},
}
OUT='/home/claude/mini-janggi/assets/images'
os.makedirs(OUT+'/pieces/warlord',exist_ok=True); os.makedirs(OUT+'/kings/warlord',exist_ok=True)
removed=0
for side,d in M.items():
  for t,i in d.items():
    a=np.array(Image.open(f'/mnt/user-data/uploads/{i}-image.webp').convert('RGBA'))
    al=a[...,3]>20
    lab,n=ndi.label(al,structure=np.ones((3,3)))
    for k,sl in enumerate(ndi.find_objects(lab)):
      h=sl[0].stop-sl[0].start; w=sl[1].stop-sl[1].start
      if (w<=4 and h>=25) or (h<=4 and w>=25):   # 잔선
        a[sl][lab[sl]==k+1]=0; removed+=1
    # 스프라이트에 붙은 얇은 세로선: 해당 열만 길게 이어지고 양옆은 비어있는 경우
    for r in range(6):
      band=a[r*140:(r+1)*140]
      m=band[...,3]>8
      run=np.zeros(m.shape[1],int)
      for x in range(m.shape[1]):
        col=m[:,x]
        if col.sum()<30: continue
        # 최장 연속 길이
        best=cur=0
        for v in col:
          cur=cur+1 if v else 0; best=max(best,cur)
        run[x]=best
      for x in range(2,m.shape[1]-4):
        if run[x]>=35:
          left=m[:,max(0,x-4):x-1].sum(1); right=m[:,x+2:x+5].sum(1)
          lonely=(m[:,x] & (left==0) & (right==0)).sum()
          if lonely>=25:
            for xx in (x-1,x,x+1):
              colmask=m[:,xx] & (m[:,max(0,xx-4):xx-1].sum(1)==0) | (m[:,xx] & (m[:,xx+2:xx+5].sum(1)==0))
              band[colmask,xx]=0
            removed+=1
      a[r*140:(r+1)*140]=band
    a[a[...,3]<6]=0
    dst = f'{OUT}/kings/warlord/{side}_K.webp' if t=='K' else f'{OUT}/pieces/warlord/{side}_{t}.webp'
    Image.fromarray(a).save(dst, quality=88, alpha_quality=95, method=6)
print('lines removed',removed)
