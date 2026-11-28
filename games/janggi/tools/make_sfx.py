"""시네마틱 효과음 합성기 (numpy) → assets/audio/sfx/*.mp3
장군(check) · 외통(mate) · 승리(win) · 패배(lose) · 폭죽(firework) · 쾅(slam)
python3 tools/make_sfx.py
"""
import numpy as np, subprocess, os, wave
SR = 44100
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio', 'sfx')

def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, d=0.3, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e
def lp(x, fc):  # one-pole lowpass
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lp_fast(x, fc, n=2):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(n, fc / (SR / 2), 'low', output='sos'), x)
def hp(x, fc, n=2):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(n, fc / (SR / 2), 'high', output='sos'), x)
def bp(x, lo, hi, n=2):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(n, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)
def noise(d): return rng.standard_normal(int(SR * d))
def pad(x, d):
    n = int(SR * d)
    return np.pad(x, (0, max(0, n - len(x))))[:n]
def at(buf, x, t0, g=1.0):
    i = int(SR * t0); j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g
def reverb(x, dur=2.2, wet=0.35, damp=3500, pre=0.02):
    from scipy.signal import fftconvolve
    n = int(SR * dur)
    ir = rng.standard_normal((2, n)) * np.exp(-np.arange(n) / SR * 6.9 / dur)
    ir = np.stack([lp_fast(ir[0], damp), lp_fast(ir[1], damp * 0.9)])
    ir[:, :int(SR * pre)] = 0
    ir /= np.abs(ir).sum(1, keepdims=True) ** 0.5 * 12
    L = len(x) + n
    st = np.stack([np.pad(fftconvolve(x, ir[0]), (0, 1))[:L], np.pad(fftconvolve(x, ir[1]), (0, 1))[:L]])
    dry = np.stack([np.pad(x, (0, n)), np.pad(x, (0, n))])
    return dry * (1 - wet) + st * wet * 3
def save(name, st, gain_db=-1.0):
    if st.ndim == 1: st = np.stack([st, st])
    # 소프트 클리핑 + 정규화
    pk = np.abs(st).max() or 1
    st = np.tanh(st / pk * 1.6) / np.tanh(1.6) * 10 ** (gain_db / 20)
    # 꼬리 무음 자르기
    lv = np.abs(st).max(0); idx = np.where(lv > 10 ** (-50 / 20))[0]
    if len(idx): st = st[:, :min(st.shape[1], idx[-1] + int(SR * 0.1))]
    # 끝 페이드
    f = min(len(st[0]), int(SR * 0.15)); st[:, -f:] *= np.linspace(1, 0, f)
    pcm = (st.T * 32767).astype('<i2')
    wav = f'/tmp/{name}.wav'
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    out = os.path.join(OUT, name + '.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', out], check=True)
    print('saved', out, round(len(st[0]) / SR, 2), 's')

# ---------- 재료 ----------
def taiko(f0=70, d=1.2, g=1.0):
    t = t_(d); f = f0 * (1 + 1.6 * np.exp(-t * 28))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.45, 5)
    skin = bp(noise(d), 300, 2500) * env(len(t), 0.001, 0.05, 6) * 0.6
    sub = np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR) * env(len(t), 0.003, 0.7, 4) * 0.7
    return (body + skin + sub) * g
def gong(f0=110, d=4.0, g=1.0):
    t = t_(d); y = np.zeros_like(t)
    ratios = [1, 1.47, 2.09, 2.56, 3.14, 3.92, 4.53, 5.37, 6.2]
    for i, r in enumerate(ratios):
        a = 1 / (1 + i * 0.55); fr = f0 * r * (1 + 0.012 * np.sin(2 * np.pi * (0.3 + i * 0.07) * t))
        y += a * np.sin(2 * np.pi * np.cumsum(fr) / SR + rng.random() * 6) * np.exp(-t * (0.9 + i * 0.35))
    y *= np.minimum(1, t / 0.03)
    hit = hp(noise(0.25), 1500) * env(int(SR * 0.25), 0.001, 0.06, 5)
    return (y * 0.5 + pad(hit, d) * 0.35) * g
def boom(d=2.0, g=1.0, f0=48):
    t = t_(d); f = f0 * (1 + 2.5 * np.exp(-t * 9))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 1.0, 3.2)
    n = lp_fast(noise(d), 900) * env(len(t), 0.002, 0.6, 3.5) * 1.6
    crack = hp(noise(d), 2500) * env(len(t), 0.0005, 0.04, 6) * 0.9
    return (s + n + crack) * g
def whoosh_up(d=0.45, g=1.0):
    n = noise(d); t = t_(d); out = np.zeros_like(n)
    seg = 64
    for i in range(0, len(n), int(SR * 0.01)):
        pass
    # 상승 필터 대신 구간별 대역통과 가중
    fcs = np.geomspace(300, 6000, 12); parts = []
    for k, fc in enumerate(fcs):
        w = np.exp(-((t / d - k / (len(fcs) - 1)) ** 2) / 0.02)
        out += bp(n, fc * 0.7, min(fc * 1.4, SR / 2 - 100)) * w
    out *= (t / d) ** 1.5
    return out * g
def zap(d=0.6, g=1.0):
    t = t_(d); f = 1800 * np.exp(-t * 4) + 120
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + bp(noise(d), 2000, 8000) * 0.8
    y *= (rng.random(len(t)) > 0.35) * env(len(t), 0.001, 0.25, 4)
    return y * g
def brass(freq, d, g=1.0, vib=5.0):
    t = t_(d); y = np.zeros_like(t)
    fr = freq * (1 + 0.006 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / 0.3))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    for h in range(1, 14):
        y += np.sin(h * ph) / h ** 1.05 * (1 if h < 6 else 0.6)
    a = np.minimum(1, t / 0.04); rel = np.minimum(1, (d - t) / 0.12).clip(0, 1)
    bright = lp_fast(y, 2200) * 0.6 + lp_fast(y, 5200) * 0.4 * np.minimum(1, t / 0.08)
    return bright * a * rel * g
def choir(freqs, d, g=1.0):
    t = t_(d); y = np.zeros_like(t)
    for fq in freqs:
        for det in (-0.004, 0, 0.005):
            fr = fq * (1 + det) * (1 + 0.004 * np.sin(2 * np.pi * 5.3 * t + rng.random() * 6))
            saw = 2 * ((np.cumsum(fr) / SR) % 1) - 1
            y += saw
    # 모음 'ah' 포먼트
    v = bp(y, 650, 1150, 2) * 1.0 + bp(y, 1000, 1450, 2) * 0.6 + bp(y, 2500, 3000, 2) * 0.25
    a = np.minimum(1, t / 0.6); rel = np.minimum(1, (d - t) / 0.8).clip(0, 1)
    return v * a * rel * g
def timpani_roll(f0, d, g=1.0):
    out = np.zeros(int(SR * d)); k = 0; tt = 0
    while tt < d - 0.1:
        x = taiko(f0, 0.5, 0.35 + 0.65 * tt / d); at(out, x, tt); tt += 0.055 + rng.random() * 0.01
    return out * g
def cymbal(d=2.5, g=1.0):
    t = t_(d); n = hp(noise(d), 4000) * np.exp(-t * 1.6) * np.minimum(1, t / 0.005)
    return n * g

# ---------- 1. 장군 ----------
def make_check():
    D = 2.6; b = np.zeros(int(SR * D))
    at(b, whoosh_up(0.32, 0.7), 0.0)
    at(b, zap(0.5, 0.5), 0.28)
    at(b, taiko(62, 1.4, 1.3), 0.32)
    at(b, taiko(95, 1.0, 0.8), 0.32)
    at(b, boom(1.6, 0.9, 52), 0.32)
    at(b, gong(140, 2.2, 0.75), 0.33)
    at(b, brass(146.8, 0.55, 0.55), 0.36); at(b, brass(220, 0.55, 0.4), 0.36)  # 짧은 호른 경고음
    st = reverb(b, 1.6, 0.3)
    save('check', st, -0.5)

# ---------- 2. 외통 ----------
def make_mate():
    D = 5.0; b = np.zeros(int(SR * D))
    at(b, whoosh_up(0.7, 0.8), 0.0)
    for k, tt in enumerate([0.68, 0.98]):
        at(b, taiko(55 - k * 6, 1.6, 1.4), tt); at(b, boom(2.4, 1.0, 44), tt)
    at(b, gong(98, 4.2, 1.0), 0.99)
    at(b, cymbal(3.0, 0.5), 0.99)
    at(b, choir([146.8, 220, 293.7, 349.2], 3.6, 0.55), 1.0)       # Dm
    at(b, brass(73.4, 3.0, 0.5), 1.0); at(b, brass(110, 3.0, 0.35), 1.0)
    st = reverb(b, 3.0, 0.4)
    save('mate', st, -0.5)

# ---------- 3. 승리 팡파르 ----------
def make_win():
    D = 5.2; b = np.zeros(int(SR * D))
    C4, E4, G4, C5, E5, G5 = 261.6, 329.6, 392.0, 523.3, 659.3, 784.0
    seq = [(0.00, G4, 0.14), (0.15, G4, 0.14), (0.30, G4, 0.14), (0.45, C5, 0.55),
           (1.02, G4, 0.2), (1.24, C5, 0.2), (1.46, E5, 0.25)]
    for t0, f, d in seq:
        at(b, brass(f, d + 0.08, 0.55), t0); at(b, brass(f / 2, d + 0.08, 0.3), t0)
        at(b, taiko(110, 0.3, 0.25), t0)
    # 마지막 큰 화음 + 팀파니 롤 + 심벌
    for f, gg in [(C4, .45), (E4, .38), (G4, .38), (C5, .5), (E5, .3), (G5, .25), (C4 / 2, .35)]:
        at(b, brass(f, 3.0, gg), 1.75)
    at(b, choir([C4, E4, G4, C5], 3.2, 0.35), 1.75)
    at(b, timpani_roll(98, 1.0, 0.45), 0.75)
    at(b, taiko(65, 1.6, 1.2), 1.75); at(b, cymbal(3.2, 0.7), 1.75)
    # 반짝이
    for k in range(14):
        tt = 1.8 + k * 0.12; f = [C5 * 2, E5 * 2, G5 * 2][k % 3]
        at(b, np.sin(2 * np.pi * f * t_(0.4)) * env(int(SR * 0.4), 0.002, 0.15, 5) * 0.12, tt)
    st = reverb(b, 2.6, 0.32)
    save('win', st, -0.8)

# ---------- 4. 패배 ----------
def make_lose():
    D = 4.6; b = np.zeros(int(SR * D))
    at(b, taiko(50, 1.8, 1.2), 0.0); at(b, gong(82, 4.4, 0.9), 0.02)
    notes = [(0.25, 293.7), (0.85, 277.2), (1.45, 261.6), (2.05, 233.1)]
    for t0, f in notes:
        at(b, brass(f, 0.75, 0.35, vib=4), t0); at(b, brass(f / 2, 0.75, 0.25, vib=4), t0)
    at(b, choir([116.5, 146.8, 174.6], 2.4, 0.4), 2.05)
    st = reverb(b, 3.2, 0.45, damp=2200)
    save('lose', st, -1.5)

# ---------- 5. 폭죽 ----------
def make_firework():
    D = 2.2; b = np.zeros(int(SR * D))
    t = t_(0.55); f = 900 + 1700 * (t / 0.55)
    whistle = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12 * np.minimum(1, t / 0.05) + hp(noise(0.55), 3000) * 0.05
    at(b, whistle, 0.0)
    at(b, boom(1.3, 0.9, 70), 0.55)
    for k in range(70):  # 탁탁 크래클
        tt = 0.7 + rng.random() * 1.2
        c = hp(noise(0.02), 2500) * env(int(SR * 0.02), 0.0005, 0.006, 5) * (0.2 + rng.random() * 0.35)
        at(b, c, tt)
    st = reverb(b, 1.8, 0.35)
    save('firework', st, -3)

# ---------- 6. 쾅 (글자 등장) ----------
def make_slam():
    D = 1.4; b = np.zeros(int(SR * D))
    at(b, taiko(75, 1.0, 1.2), 0.0); at(b, boom(1.2, 0.6, 60), 0.0)
    at(b, gong(220, 1.3, 0.35), 0.0)
    save('slam', reverb(b, 1.2, 0.25), -1.5)

if __name__ == '__main__':
    make_check(); make_mate(); make_win(); make_lose(); make_firework(); make_slam()
