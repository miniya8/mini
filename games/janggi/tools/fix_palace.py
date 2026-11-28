"""궁성 선이 한 줄 위에 잘못 그려진 그림 장기판 고치기
사용: python3 tools/fix_palace.py <보드id> [<보드id> ...]   (원본은 *.orig.webp 로 보관)
- 잘못된 X(아래 궁성이 6~8줄) 지우고(inpaint) → 올바른 7~9줄에 같은 색·굵기로 다시 그림
"""
import sys, json, subprocess, os, numpy as np, cv2
from PIL import Image
def grids():
    js = subprocess.check_output(['node', '-e', """
global.MJ={register(k,d){(Array.isArray(d)?d:[d]).forEach(x=>{if(k==='board'&&x.image)out.push(x)})}};const out=[];
const vm=require('vm');vm.runInThisContext('var MJ=global.MJ;');
for(const f of ['js/data/boards_pack2.js']) vm.runInThisContext(require('fs').readFileSync(f,'utf8'));
console.log(JSON.stringify(out))"""])
    return {b['id']: b for b in json.loads(js)}
B = grids()
for bid in sys.argv[1:]:
    b = B[bid]; path = b['image']; orig = 'tools/board_originals/' + os.path.basename(path).replace('.webp', '.orig.webp')
    if not os.path.exists(orig): os.rename(path, orig)
    im = np.array(Image.open(orig).convert('RGB')); g = b['grid']
    sx = im.shape[1] / g['w']; sy = im.shape[0] / g['h']
    xs = [x * sx for x in g['xs']]; ys = [y * sy for y in g['ys']]
    cw = xs[1] - xs[0]
    P = lambda c, r: (int(round(xs[c])), int(round(ys[r])))
    # 선 굵기·색: 4번째 줄 가로선 (궁성 밖) 단면
    y = int(round(ys[4])); x = int((xs[1] + xs[2]) / 2)
    col = im[y - 12:y + 13, x].astype(int); lum = col.sum(1)
    on = lum > lum.min() + (lum.max() - lum.min()) * 0.55
    lw = max(2, int(on.sum())); lc = tuple(int(v) for v in np.median(col[on], 0))
    print(bid, 'line width', lw, 'color', lc)
    # 장식(교차점 원) 조각 보관
    R = int(cw * 0.22); cx, cy = P(4, 7)
    orn = im[cy - R:cy + R + 1, cx - R:cx + R + 1].copy()
    # 지울 영역: 잘못된 X + 장식
    mask = np.zeros(im.shape[:2], np.uint8)
    cv2.line(mask, P(3, 6), P(5, 8), 255, lw * 3 + 4); cv2.line(mask, P(5, 6), P(3, 8), 255, lw * 3 + 4)
    cv2.circle(mask, (cx, cy), R, 255, -1)
    keep = np.zeros_like(mask)  # 가로·세로 선은 남김
    for c in range(9): cv2.line(keep, (int(xs[c]), 0), (int(xs[c]), im.shape[0]), 255, lw + 4)
    for r in range(10): cv2.line(keep, (0, int(ys[r])), (im.shape[1], int(ys[r])), 255, lw + 4)
    mask[keep > 0] = 0
    cv2.circle(mask, (cx, cy), R, 255, -1)  # 장식은 선까지 통째로 지우고 아래에서 선을 다시 그림
    out = cv2.inpaint(im, mask, 3, cv2.INPAINT_TELEA)
    seg = out.copy()
    cv2.line(seg, (cx - R - 2, cy), (cx + R + 2, cy), lc, lw, cv2.LINE_AA); cv2.line(seg, (cx, cy - R - 2), (cx, cy + R + 2), lc, lw, cv2.LINE_AA)
    out = seg
    # 올바른 X (7~9줄) — 빛번짐 + 선
    layer = np.zeros_like(out)
    cv2.line(layer, P(3, 7), P(5, 9), lc, lw + 1, cv2.LINE_AA); cv2.line(layer, P(5, 7), P(3, 9), lc, lw + 1, cv2.LINE_AA)
    glow = cv2.GaussianBlur(layer, (0, 0), lw * 1.6)
    out = np.clip(out.astype(int) + glow.astype(int) * 0.9, 0, 255).astype(np.uint8)
    lm = layer.max(2) > 0
    a = (layer.max(2, keepdims=True) / max(1, max(lc))).clip(0, 1)
    out = (out * (1 - a) + layer * a).astype(np.uint8)
    # 장식을 올바른 궁성 중심(4,8)에 밝기 최대 합성
    nx, ny = P(4, 8)
    reg = out[ny - R:ny + R + 1, nx - R:nx + R + 1]
    out[ny - R:ny + R + 1, nx - R:nx + R + 1] = np.maximum(reg, orn)
    Image.fromarray(out).save(path, quality=90, method=6)
    print('saved', path)
