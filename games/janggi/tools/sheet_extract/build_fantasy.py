from build import *
f=pickle.load(open('fantasy_seg.pkl','rb'))
def base(d): return {k:list(d[k]) for k in ['transform','move','attack','hit','death'] if k in d}
M={}
R=f['R']
for t,tok in [('K',1),('R',1),('C',1),('E',1),('H',1),('A',1),('P',2)]:
    d=f[t]; p=base(d)
    if t=='R': p['move']=d['move'][:2]
    if 'revert' in d: p['revert']=list(d['revert'])
    else: p['revert']=[R['revert'][0],R['revert'][1],d['token'][0]]
    if t=='C': p['ranged']=[d['ranged'][0],d['ranged'][1]]; p['proj']=[d['ranged'][4]]
    if t=='E': p['ranged']=[d['ranged'][0],d['ranged'][1]]; p['proj']=[d['ranged'][2]]
    if t=='H': p['ranged']=[d['ranged'][0]]; p['proj']=[d['ranged'][3]]
    M['cho_'+t]=build(t,p,tok_tr=tok,out_dir='fantasy',file='cho_'+t)
    M['han_'+t]=M['cho_'+t]
json.dump(M,open('fantasy_manifest.json','w'),separators=(',',':'))
print(len(M))
