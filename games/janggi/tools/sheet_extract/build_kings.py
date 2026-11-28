from build import *
f=pickle.load(open('kings_seg.pkl','rb'))
M={}
for n,d in f.items():
    def ok(lst):
        lst=[x for x in lst if x]
        ar=[(x['img'][...,3]>100).sum() for x in lst]; med=np.median(ar)
        return [x for x,a in zip(lst,ar) if a>med*0.25]
    p={k:(ok(d[k]) if k in ('move','attack','hit') else [x for x in d[k] if x]) for k in ['transform','move','attack','hit','death','revert']}
    M[n]=build(n,p,tok_tr=1,out_dir='kingpack',file=n)
json.dump(M,open('kings_manifest.json','w'),separators=(',',':'))
print(json.dumps(M)[:300])
