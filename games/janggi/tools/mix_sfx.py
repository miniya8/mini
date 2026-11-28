"""실제 녹음 효과음(Mixkit 무료 효과음)을 겹쳐서 게임용 큰 연출음 만들기
원본: tools/sfx_sources/<번호>.mp3  (https://mixkit.co/free-sound-effects/ , Mixkit 무료 라이선스)
결과: assets/audio/sfx/{check,mate,win,lose,firework,slam}.mp3
python3 tools/mix_sfx.py
"""
import numpy as np, subprocess, os
SR = 44100
D = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(D, 'sfx_sources'); OUT = os.path.join(D, '..', 'assets', 'audio', 'sfx')
NAMES = {  # 출처 제목 (Mixkit)
    1143: 'Cinematic whoosh deep impact', 2794: 'Heavy sword hit', 546: 'Cinematic mystery trailer drum hit',
    619: 'Cinematic church bell hit', 2908: 'Movie trailer epic impact', 2782: 'Epic impact afar explosion',
    1286: 'Cinematic impact thunder', 631: 'Grand brass fanfare', 462: 'Huge crowd cheering victory',
    633: 'Game over dark orchestra', 3103: 'Fast whistle firework', 2994: 'Clear firework explosions', 563: 'Drum deep impact',
}
def load(i):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(SRC, f'{i}.mp3'), '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return (np.frombuffer(raw, '<i2').reshape(-1, 2).T / 32768).astype(np.float32)
def mix(parts, dur, fade=0.4):
    """parts: (번호, 원본 시작 초, 넣을 위치 초, 음량 dB)"""
    out = np.zeros((2, int(SR * dur)), np.float32)
    for i, s0, at, db in parts:
        x = load(i)[:, int(SR * s0):]
        a = int(SR * at); n = min(x.shape[1], out.shape[1] - a)
        if n > 0: out[:, a:a + n] += x[:, :n] * 10 ** (db / 20)
    f = int(SR * fade); out[:, -f:] *= np.linspace(1, 0, f) ** 2
    return out
def save(name, st, peak_db=-1.0):
    st = st / (np.abs(st).max() or 1) * 10 ** (peak_db / 20)
    pcm = (st.T * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ac', '2', '-ar', str(SR), '-i', '-', '-codec:a', 'libmp3lame', '-b:a', '160k',
                    os.path.join(OUT, name + '.mp3')], input=pcm, check=True)
    print('saved', name, round(st.shape[1] / SR, 2), 's')

# 장군: 쿵(드럼) + 검 쨍 + 깊은 충격 + 종소리 — 바로 터짐
save('check', mix([(1143, 0.35, 0.0, 0), (2794, 0.05, 0.0, -3), (546, 0.0, 0.0, -2), (619, 0.1, 0.02, -9)], 2.8, 0.8))
# 외통: 원거리 대폭발(즉시) + 트레일러 대타격 + 천둥
save('mate', mix([(2782, 0.0, 0.0, 0), (2908, 0.75, 0.0, -1), (1286, 0.45, 0.05, -4), (619, 0.1, 0.1, -10)], 4.6, 1.2))
# 승리: 웅장한 금관 팡파르 + 관중 환호
save('win', mix([(631, 0.1, 0.0, 0), (462, 0.5, 0.6, -11)], 6.0, 1.5))
# 패배: 어두운 오케스트라 + 낮은 종
save('lose', mix([(633, 0.0, 0.0, 0), (619, 0.1, 0.0, -12)], 4.2, 1.2))
# 폭죽: 휘익~ 펑 (0.55초에 터지도록 맞춤) + 탁탁
save('firework', mix([(3103, 0.0, 0.12, 0), (2994, 0.1, 0.5, -6)], 2.6, 0.6), -3)
# 쾅
save('slam', mix([(563, 0.12, 0.0, 0), (2794, 0.05, 0.0, -8)], 1.7, 0.5), -1.5)
