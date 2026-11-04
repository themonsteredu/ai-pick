# 배경음악 직접 합성 (저작권 문제 없음). 밝은 C장조: C - G - Am - F
import numpy as np, wave
SR=44100; DUR=52.4; N=int(SR*DUR); t=np.arange(N)/SR
BPM=100; beat=60/BPM; bar=beat*4
def mid(m): return 440*2**((m-69)/12)
prog=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]]
out=np.zeros(N); rng=np.random.default_rng(7)
def env_adsr(n,a,r):
    e=np.ones(n); ai=int(a*SR); ri=int(r*SR)
    e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
chord_len=bar*2
# 패드
k=0; start=0.0
while start<DUR:
    ch=prog[k%4]; n=int(min(chord_len+1.0,DUR-start)*SR); s0=int(start*SR)
    tt=np.arange(n)/SR; sig=np.zeros(n)
    for m in ch+[ch[0]-12]:
        f=mid(m)
        for d in (-0.1,0.1):
            ff=f*2**(d/12)
            sig+=np.sin(2*np.pi*ff*tt)+0.22*np.sin(2*np.pi*2*ff*tt)+0.06*np.sin(2*np.pi*3*ff*tt)
    sig*=env_adsr(n,1.0,1.2)*0.032
    out[s0:s0+n]+=sig[:N-s0]; start+=chord_len; k+=1
# 마림바 같은 아르페지오 (8분음표)
step=beat/2; i=0; tcur=1.2
while tcur<DUR-2.5:
    ch=prog[int(tcur/chord_len)%4]
    pat=[0,1,2,1,2,0,2,1]; m=ch[pat[i%8]]+12
    n=int(0.5*SR); s0=int(tcur*SR); tt=np.arange(n)/SR; f=mid(m)
    sig=(np.sin(2*np.pi*f*tt)+0.25*np.sin(2*np.pi*4*f*tt)*np.exp(-tt*30))*np.exp(-tt*9)*0.07
    e=min(n,N-s0); out[s0:s0+e]+=sig[:e]; tcur+=step; i+=1
# 킥 + 하이햇 (첫 화면 소개 뒤부터 아웃트로 전까지)
K0, K1 = 5.0, 46.0
tcur=K0
while tcur<K1:
    n=int(0.3*SR); s0=int(tcur*SR); tt=np.arange(n)/SR
    f=55+85*np.exp(-tt*30); ph=2*np.pi*np.cumsum(f)/SR
    out[s0:s0+n]+=np.sin(ph)*np.exp(-tt*10)*0.2
    for off in (beat/2,):
        h0=int((tcur+off)*SR); hn=int(0.045*SR)
        if h0+hn<N: out[h0:h0+hn]+=rng.standard_normal(hn)*np.exp(-np.arange(hn)/SR*95)*0.018
    tcur+=beat
# 베이스
for bi in range(int(DUR/beat)):
    tb=bi*beat
    if tb<K0 or tb>K1: continue
    ch=prog[int(tb/chord_len)%4]; f=mid(ch[0]-24)
    n=int(beat*SR*0.9); s0=int(tb*SR); tt=np.arange(n)/SR
    sig=np.sin(2*np.pi*f*tt)*np.minimum(1,tt*60)*np.exp(-tt*2.5)*0.11
    out[s0:s0+n]+=sig[:N-s0]
fade=np.ones(N); fi=int(1.0*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(3.5*SR); fade[-fo:]=np.linspace(1,0,fo)**1.5
out*=fade
for d,g in ((0.21,0.25),(0.39,0.14),(0.63,0.07)):
    di=int(d*SR); out[di:]+=out[:-di]*g
out/=np.max(np.abs(out))*1.12
st=np.stack([out,np.roll(out,int(0.012*SR))],1)
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
print('ok')
