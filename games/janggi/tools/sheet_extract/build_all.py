from build import *
sf=pickle.load(open('sf_seg.pkl','rb')); op=pickle.load(open('op_seg.pkl','rb')); db=pickle.load(open('dbz_seg.pkl','rb')); lf=pickle.load(open('luffy_seg.pkl','rb'))
def ph(d, keep=None, ranged=None, proj=None, hit=None):
    o={k:list(d[k]) for k in ['transform','move','attack','hit','death','revert']}
    if hit is not None: o['hit']=hit
    if ranged: o['ranged']=ranged
    if proj: o['proj']=proj
    return o
M={}
# ---------- 격투가 ----------
g=sf['E_guile']; M['fighters/cho_E']=build('guile',ph(g,ranged=g['ranged'][:3],proj=g['ranged'][3:4]),tok_tr=2,out_dir='fighters',file='cho_E')
a=sf['H_akuma']; M['fighters/han_H']=build('akuma',ph(a,ranged=a['ranged'][:3],proj=a['ranged'][3:4],hit=[a['transform'][3],a['attack'][0]]),tok_tr=1,out_dir='fighters',file='han_H')
d=sf['P_dan']; M['fighters/han_P']=build('dan',ph(d),tok_tr=1,out_dir='fighters',file='han_P')
r=sf['K_ryu']; M['fighters/cho_K']=build('ryu',ph(r),tok_tr=2,out_dir='fighters',file='cho_K')
c=sf['R_chun']; M['fighters/cho_R']=build('chun',ph(c),tok_tr=2,out_dir='fighters',file='cho_R')
k=sf['C_ken']; M['fighters/han_C']=build('ken',ph(k,ranged=k['ranged'][:2],proj=k['ranged'][2:3]),tok_tr=1,out_dir='fighters',file='han_C')
# ---------- 해적단 ----------
n=op['H_nami']; M['pirates/cho_H']=build('nami',ph(n,hit=[n['hit'][0],n['hit'][3]]),tok_tr=1,out_dir='pirates',file='cho_H')
for key,file in [('A_robin','cho_A'),('A_franky','han_A'),('H_brook','han_H'),('K_luffy','cho_K'),('R_zoro','cho_R'),('C_usopp','cho_C'),('E_sanji','cho_E'),('P_chopper','cho_P')]:
    M['pirates/'+file]=build(key,ph(op[key]),tok_tr=1 if key[0] in 'AH' else 2,out_dir='pirates',file=file)
L=lf['R_luffy']; p=ph({**L}); p['transform']=L['transform']
M['pirates/han_R']=build('luffy',p,tok_tr=3,out_dir='pirates',file='han_R',tok_mult=1.7)
# ---------- 기공 전사 ----------
for key,file in [('E_trunks','han_E'),('P_krillin','cho_P'),('H_gohan','cho_H'),('A_kri2','cho_A'),('A_tien','han_A'),('H_broly','han_H'),('K_goku','cho_K'),('R_vegeta','han_R'),('C_piccolo','han_C')]:
    dd=db[key]; rg=dd.get('ranged')
    if key in ('E_trunks','C_piccolo'): p=ph(dd,ranged=rg[:2],proj=rg[2:3])
    else: p=ph(dd)
    M['saiyans/'+file]=build(key,p,tok_tr=1,out_dir='saiyans',file=file)
json.dump(M,open('manifest.json','w'),indent=0)
print(len(M))
