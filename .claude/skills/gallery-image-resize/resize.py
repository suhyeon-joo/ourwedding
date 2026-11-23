#!/usr/bin/env python3
"""웨딩 사진 웹용 리사이즈 (원본 20MB+ → 약 1MB JPEG).

사용법
  # 갤러리: 폴더 안 원본을 자연수 정렬 후 01.jpg, 02.jpg ... 로 번호를 붙여 저장
  python resize.py gallery --src <원본 폴더> --out <출력 폴더> [--start 1] [--max-edge 1600] [--max-mb 1.0]

  # 단일 파일: 대문(히어로) 등 한 장만 저장
  python resize.py single --src <원본 파일> --out <출력 파일> [--max-edge 1600] [--max-mb 1.0]

동작
  - EXIF 회전 보정 후 긴 변을 max-edge 이하로 줄인다 (확대는 하지 않음).
  - JPEG 품질을 85부터 낮추고, 그래도 크면 긴 변을 10%씩 줄여 max-mb 이하로 맞춘다.
  - 저장 시 EXIF(촬영 위치 등 메타데이터)를 포함하지 않는다.
  - 원본은 건드리지 않는다. 원본 이동은 SKILL.md 절차에서 따로 한다.
"""
import argparse
import io
import os
import re
import sys

from PIL import Image, ImageOps


def natural_key(name):
    """파일명의 첫 숫자열로 정렬 (LOWE8049 < LOWE32530)."""
    m = re.search(r"(\d+)", name)
    return (int(m.group(1)) if m else 0, name)


def encode_under(img, max_edge, max_bytes):
    """max_edge 와 품질을 조절해 max_bytes 이하 JPEG 바이트를 만든다."""
    w, h = img.size
    scale = min(1.0, max_edge / max(w, h))
    base = img.convert("RGB")
    if scale < 1.0:
        base = base.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    while True:
        for quality in range(85, 59, -5):
            buf = io.BytesIO()
            base.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
            if buf.tell() <= max_bytes:
                return buf.getvalue(), base.size, quality
        # 품질 60 에서도 크면 해상도를 10% 낮춰 다시 시도
        nw, nh = round(base.size[0] * 0.9), round(base.size[1] * 0.9)
        if nw < 600 or nh < 600:
            # 더 줄이면 화질이 너무 떨어지므로 마지막 결과를 그대로 반환
            buf = io.BytesIO()
            base.save(buf, format="JPEG", quality=60, optimize=True, progressive=True)
            return buf.getvalue(), base.size, 60
        base = base.resize((nw, nh), Image.LANCZOS)


def process(src, dst, max_edge, max_bytes):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        data, size, quality = encode_under(im, max_edge, max_bytes)
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    with open(dst, "wb") as f:
        f.write(data)
    return len(data), size, quality


def report(src, dst, nbytes, size, quality):
    print(f"{os.path.basename(src)} -> {dst}  {nbytes / 1048576:.2f} MB  {size[0]}x{size[1]}  q={quality}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="mode", required=True)

    g = sub.add_parser("gallery")
    g.add_argument("--src", required=True)
    g.add_argument("--out", required=True)
    g.add_argument("--start", type=int, default=1)
    g.add_argument("--max-edge", type=int, default=1600)
    g.add_argument("--max-mb", type=float, default=1.0)

    s = sub.add_parser("single")
    s.add_argument("--src", required=True)
    s.add_argument("--out", required=True)
    s.add_argument("--max-edge", type=int, default=1600)
    s.add_argument("--max-mb", type=float, default=1.0)

    a = ap.parse_args()
    max_bytes = int(a.max_mb * 1048576)

    if a.mode == "single":
        n, size, q = process(a.src, a.out, a.max_edge, max_bytes)
        report(a.src, a.out, n, size, q)
        return

    files = [f for f in os.listdir(a.src) if f.lower().endswith((".jpg", ".jpeg"))]
    files.sort(key=natural_key)
    if not files:
        sys.exit(f"원본 JPG가 없습니다: {a.src}")
    width = max(2, len(str(a.start + len(files) - 1)))
    for i, name in enumerate(files):
        dst = os.path.join(a.out, f"{a.start + i:0{width}d}.jpg")
        n, size, q = process(os.path.join(a.src, name), dst, a.max_edge, max_bytes)
        report(name, dst, n, size, q)
    print(f"완료: {len(files)}장 → {a.out}")


if __name__ == "__main__":
    main()
