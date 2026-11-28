# 불규칙한 스프라이트 시트 → 게임용 시트 변환 도구

1. `extract.py` : 배경 제거(색→알파), 글자/라벨 제거, 프레임 분리(`segment_n`: 구간 안에서 n개로 자동 분할)
2. `*_seg.py`  : 시트별로 행(y 범위)과 단계별 x 범위·프레임 수를 적어 프레임을 뽑음 → `*.pkl`
3. `build_all.py` : 프레임을 표준 칸(200x150)에 정렬(캐릭터는 발 기준, 장기알·이펙트는 가운데)
   → `assets/images/pieces/<팩>/<진영>_<기물>.webp` + `manifest.json`
4. manifest 를 `js/data/skins_pack3.js` 의 `MJ.SPRITE_<팩>.manifest` 에 넣으면 끝

필요: `pip install pillow numpy scipy`
