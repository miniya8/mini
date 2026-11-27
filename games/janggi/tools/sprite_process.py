"""스프라이트 시트 가공 도구 (메카닉 스킨 제작에 사용)
사용법: SRC 의 파일 경로를 바꾸고  python3 sprite_process.py  실행
필요: pip install pillow numpy opencv-python scipy
원본 규격: 1344x756, 6행(변신4·이동5·공격6·피격5·사망4·복귀4) 템플릿 시트

- 템플릿(6행, 프레임 4/5/6/5/4/4) 슬라이스
- 배경 투명화(색→알파 언블렌딩) + 테두리 장식/프레임 번호 제거
- 장기알 중심을 프레임 중앙에 정렬 → 모든 프레임 동일 크기
- 진영 색 변형(초: 녹색 / 한: 적색 / 원본: 사막색) + 한나라 글자 교체(兵, 漢)
출력: out/<variant>/<side>_<type>.png  (6행 x 6열 그리드, 프레임 FW x FH)
"""
import numpy as np, cv2, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

SRC = {  # 기물별 원본 시트 경로
    'R': 'src/R.webp', 'P': 'src/P.webp', 'A': 'src/A.webp', 'E': 'src/E.webp',
    'H': 'src/H.webp', 'C': 'src/C.webp', 'K': 'src/K.webp',
}
TOPS = [29, 148, 266, 384, 503, 621]
BOTS = [140, 258, 376, 495, 613, 731]
FRAMES = [4, 5, 6, 5, 4, 4]
ROWNAMES = ['transform', 'move', 'attack', 'hit', 'death', 'revert']
GX0, GW = 241.0, 174.5
PANEL_L = 249
FW, FH = 184, 120
OUT = 'out'
FONT = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'


def cell_rect(row, k):
    l = GX0 + GW * k
    r = l + GW
    return l, r, TOPS[row], BOTS[row]


def remove_bg(crop):
    """crop: HxWx3 uint8 → RGBA float"""
    c = crop.astype(np.float32)
    h, w = c.shape[:2]
    ring = np.concatenate([c[:3].reshape(-1, 3), c[-3:].reshape(-1, 3), c[:, :3].reshape(-1, 3), c[:, -3:].reshape(-1, 3)])
    bg = np.median(ring, 0)
    diff = c - bg
    d = np.sqrt((diff ** 2).sum(2))
    # 연기/먼지(배경보다 밝고 무채색 방향으로 섞인 픽셀)
    dmin, dmax = diff.min(2), diff.max(2)
    smoke = (dmin > 6) & (dmin / np.maximum(dmax, 1) > 0.45)
    near = (d < 22) | smoke
    lab, n = ndi.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    R0 = np.isin(lab, list(border))
    # 다리 사이 등 갇힌 배경 구멍도 투명 처리 (배경색과 거의 같은 큰 덩어리)
    pk, pn = ndi.label(d < 9)
    if pn:
        ps = ndi.sum(np.ones_like(d), pk, range(1, pn + 1))
        R0 |= np.isin(pk, [i + 1 for i in range(pn) if ps[i] >= 25])
    # 외곽선 안티에일리어싱 1px 까지 부드럽게
    R = ndi.binary_dilation(R0, iterations=1)
    a = np.ones((h, w), np.float32)
    sm = R0 & smoke
    a[R] = np.clip((d[R] - 10) / 48.0, 0, 1)
    a[sm] = np.clip((d[sm] - 8) / 150.0, 0, 1)
    rgb = c.copy()
    safe = np.maximum(a, 1e-3)[..., None]
    un = (c - (1 - a[..., None]) * bg) / safe
    rgb = np.where(R[..., None], np.clip(un, 0, 255), c)
    # 작은 조각 정리: 가장자리에 닿거나 오른쪽아래 모서리(프레임 번호)에 있는 작은 덩어리 제거
    m = a > 0.12
    lab2, n2 = ndi.label(m, structure=np.ones((3, 3)))
    if n2:
        sizes = ndi.sum(m, lab2, range(1, n2 + 1))
        objs = ndi.find_objects(lab2)
        for i, sl in enumerate(objs):
            ys, xs = sl
            area = sizes[i]
            touches = ys.start <= 4 or xs.start <= 4 or ys.stop >= h - 4 or xs.stop >= w - 4
            corner = xs.start >= w - 30 and ys.start >= h - 30
            # 번호/테두리 장식: 무채색에 가까운 작은 조각
            region = lab2[sl] == i + 1
            px = c[sl][region]
            sat = (px.max(1) - px.min(1)).mean() if len(px) else 0
            if (touches and area < 260 and sat < 45) or (corner and area < 160):
                a[sl][region] = 0
    out = np.dstack([rgb, a * 255]).clip(0, 255).astype(np.uint8)
    out[out[..., 3] < 3] = 0
    return out, bg


def token_center(rgba):
    a = rgba[..., 3] > 128
    ys, xs = np.where(a)
    return (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2, max(xs.max() - xs.min(), ys.max() - ys.min())


def slice_sheet(path):
    im = np.array(Image.open(path).convert('RGB'))
    cells = {}
    for row in range(6):
        for k in range(FRAMES[row]):
            l, r, t, b = cell_rect(row, k)
            x0 = int(np.ceil(max(l + 3, PANEL_L + 3)))
            pr = {4: 928, 5: 1113, 6: 1289}[FRAMES[row]]
            x1 = int(np.floor(min(r, pr) - 3))
            y0, y1 = t + 4, b - 3
            crop = im[y0:y1, x0:x1]
            rgba, _ = remove_bg(crop)
            ccx, ccy = (l + r) / 2 - x0, (t + b) / 2 - y0  # 셀 중심(크롭 좌표)
            cells[(row, k)] = (rgba, ccx, ccy)
    # 장기알(0,0) 중심 기준 정렬
    tok, ccx, ccy = cells[(0, 0)]
    tx, ty, diam = token_center(tok)
    dx0, dy0 = tx - ccx, ty - ccy
    sheet = np.zeros((FH * 6, FW * 6, 4), np.uint8)
    for (row, k), (rgba, ccx, ccy) in cells.items():
        ox = int(round(FW / 2 - (ccx + dx0)))
        oy = int(round(FH / 2 - (ccy + dy0)))
        h, w = rgba.shape[:2]
        fx, fy = k * FW, row * FH
        # 프레임 범위로 클리핑해서 붙이기
        sx0, sy0 = max(0, -ox), max(0, -oy)
        dx_, dy_ = max(0, ox), max(0, oy)
        cw, ch = min(w - sx0, FW - dx_), min(h - sy0, FH - dy_)
        sheet[fy + dy_:fy + dy_ + ch, fx + dx_:fx + dx_ + cw] = rgba[sy0:sy0 + ch, sx0:sx0 + cw]
    return sheet, diam


# ---------------- 색 변형 ----------------
def recolor(sheet, mode):
    rgb = sheet[..., :3].copy()
    a = sheet[..., 3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV_FULL).astype(np.float32)  # H 0..255
    H, S, V = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    if mode in ('cho', 'han'):
        # 황갈색/나무색(색상 15~55도) 만, 불꽃(고채도 고명도)은 제외
        m = (H >= 12) & (H <= 58) & (S > 0.12) & ~((S > 0.62) & (V > 0.72))
        target = 128.0 if mode == 'cho' else 358.0
        sat_mul = 1.2 if mode == 'cho' else 1.4
        val_mul = 0.92 if mode == 'cho' else 0.9
    elif mode == 'king-han':
        m = (H >= 70) & (H <= 170) & (S > 0.12)
        target, sat_mul, val_mul = 358.0, 1.35, 1.0
    else:
        return sheet
    w = m.astype(np.float32)
    w = cv2.GaussianBlur(w, (3, 3), 0)
    nh = np.where(m, target, H)
    hsv[..., 0] = (nh % 360) * 255 / 360
    hsv[..., 1] = np.clip(S * np.where(m, sat_mul, 1) * 255, 0, 255)
    hsv[..., 2] = np.clip(V * np.where(m, val_mul, 1) * 255, 0, 255)
    out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB_FULL)
    out = (out * w[..., None] + rgb * (1 - w[..., None])).astype(np.uint8)
    return np.dstack([out, a])


def replace_glyph(sheet, frames, new_char):
    """장기알 프레임의 글자를 지우고 새 글자를 새김"""
    for (row, k) in frames:
        fx, fy = k * FW, row * FH
        fr = sheet[fy:fy + FH, fx:fx + FW].copy()
        al = fr[..., 3] > 128
        ys, xs = np.where(al)
        if not len(xs):
            continue
        cx, cy = FW / 2, FH / 2
        diam = min(xs.max() - xs.min(), ys.max() - ys.min())
        rr = int(diam * 0.31)
        x0, x1, y0, y1 = int(cx - rr), int(cx + rr), int(cy - rr), int(cy + rr)
        rgb = fr[..., :3]
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        reg = np.zeros(al.shape, bool); reg[y0:y1, x0:x1] = True
        # 글자는 장기알 면보다 확실히 어두움
        face_v = np.median(hsv[..., 2][reg & al])
        glyph = reg & al & (hsv[..., 2] < face_v * 0.72)
        if glyph.sum() < 30:
            continue
        ink = rgb[glyph].reshape(-1, 3)
        ink_col = tuple(int(v) for v in np.percentile(ink, 25, axis=0))
        mask = cv2.dilate(glyph.astype(np.uint8) * 255, np.ones((3, 3), np.uint8), iterations=2)
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        fixed = cv2.inpaint(bgr, mask, 6, cv2.INPAINT_TELEA)
        fixed = cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(np.dstack([fixed, fr[..., 3]]))
        # 글자: 2배 해상도로 그려서 축소(부드럽게)
        S2 = 4
        big = Image.new('RGBA', (FW * S2, FH * S2), (0, 0, 0, 0))
        d = ImageDraw.Draw(big)
        fs = int(rr * 1.62 * S2)
        font = ImageFont.truetype(FONT, fs, index=2)  # TC
        bb = d.textbbox((0, 0), new_char, font=font)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        px, py = cx * S2 - tw / 2 - bb[0], cy * S2 - th / 2 - bb[1]
        # 음각 느낌: 아래 밝은 선 + 진한 글자
        hl = tuple(min(255, int(v * 1.0 + 70)) for v in ink_col)
        d.text((px, py + S2 * 1.0), new_char, font=font, fill=hl + (110,))
        d.text((px, py), new_char, font=font, fill=ink_col + (255,))
        small = big.resize((FW, FH), Image.LANCZOS)
        pil = Image.alpha_composite(pil, small)
        out = np.array(pil)
        out[..., 3] = fr[..., 3]  # 원래 실루엣 유지
        sheet[fy:fy + FH, fx:fx + FW] = out
    return sheet


TOKEN_FRAMES = [(0, 0), (5, 2), (5, 3)]

if __name__ == '__main__':
    meta = {}
    for t, sid in SRC.items():
        sheet, diam = slice_sheet(sid)
        meta[t] = int(diam)
        if t == 'K':
            cho = sheet.copy()
            han = recolor(sheet.copy(), 'king-han')
            han = replace_glyph(han, TOKEN_FRAMES, '漢')
            variants = {'mecha': {'cho': cho, 'han': han}, 'mecha-desert': {'cho': cho, 'han': han}}
        else:
            orig = sheet
            hanP = (lambda s: replace_glyph(s, TOKEN_FRAMES, '兵')) if t == 'P' else (lambda s: s)
            variants = {
                'mecha': {'cho': recolor(orig.copy(), 'cho'), 'han': hanP(recolor(orig.copy(), 'han'))},
                'mecha-desert': {'cho': orig.copy(), 'han': hanP(orig.copy())},
            }
        for vn, sides in variants.items():
            os.makedirs(f'{OUT}/{vn}', exist_ok=True)
            for side, sh in sides.items():
                Image.fromarray(sh).save(f'{OUT}/{vn}/{side}_{t}.webp', quality=90, alpha_quality=100, method=6)
    json.dump({'frameW': FW, 'frameH': FH, 'tokenDiam': meta, 'rows': dict(zip(ROWNAMES, FRAMES))}, open(f'{OUT}/meta.json', 'w'), indent=1)
    print(meta)
