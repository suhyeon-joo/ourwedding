---
name: gallery-image-resize
description: 청첩장 갤러리·대문 사진 원본(20MB+)을 웹용 약 1MB JPEG로 줄이고, 갤러리 파일명을 01.jpg, 02.jpg ... 순번으로 바꾸고, index.html 슬라이드와 대문 이미지 경로를 맞출 때 사용. "사진 리사이즈", "이미지 용량 줄여", "갤러리 넘버링", "파일명 번호", "대문 사진 바꿔", "이미지 로딩 개선" 요청에 트리거.
---

# 갤러리 · 대문 이미지 리사이즈

원본 사진(장당 17~26MB)을 웹용 JPEG(긴 변 1600px 이하, 1MB 이하)로 줄이고, 번호 파일명으로 정리한 뒤 페이지에 반영하는 절차다.

## 언제 쓰나

- `images/gallery/` 에 원본(`LOWE*.jpg` 등 대용량 파일)이 새로 들어왔을 때
- 대문 사진을 바꿀 때 (예: `images/8162_1.jpg`)
- 사진을 추가·삭제한 뒤 번호를 다시 붙여야 할 때

## 원칙

- 원본은 저장소 안에 두지 않는다. 원본은 `E:\source\wedding-letter\_originals\` (저장소 바깥)로 옮겨 보관한다. 저장소에 올리면 용량이 커지고 촬영 메타데이터가 노출된다.
- 웹용 파일은 `images/gallery/01.jpg` 형식이다. 원본 파일명은 쓰지 않는다.
- 정렬은 파일명의 첫 숫자열 기준이다 (`LOWE8049` < `LOWE32530`). 순서를 바꾸려면 원본 이름을 바꾸거나 `--start`로 조정한다.
- 대문은 `images/8162_1.jpg` 로 저장하고 `index.html` 의 `hero` 경로와 `width`/`height`를 실제 크기에 맞춘다.

## 절차

1. **원본 위치 확인**: `images/gallery/` 의 원본(`LOWE*.jpg`)과 대문 원본 파일 이름을 확인한다.
2. **갤러리 리사이즈 + 번호 붙이기**
   ```
   python .claude/skills/gallery-image-resize/resize.py gallery --src images/gallery --out images/gallery
   ```
   - 원본과 출력이 같은 폴더이므로, 출력 이름(`01.jpg`…)이 원본과 겹치지 않는지 먼저 확인한다. 겹치면 원본을 먼저 옮긴다.
3. **대문 리사이즈**
   ```
   python .claude/skills/gallery-image-resize/resize.py single --src images/gallery/LOWE8162-1.jpg --out images/8162_1.jpg
   ```
4. **원본 이동**: 원본 파일을 `_originals/` 로 옮긴다. 저장소 바깥 경로를 쓴다.
   ```
   mkdir -p ../_originals/gallery && mv images/gallery/LOWE*.jpg ../_originals/gallery/
   ```
5. **결과 확인**: 모든 파일이 1MB 이하인지 확인한다. 이 스킬 스크립트는 파일마다 크기·해상도·품질을 출력한다.
6. **index.html 반영**
   - 갤러리 `<li class="slide">` 개수를 파일 수에 맞추고, `img src`를 `images/gallery/NN.jpg`로 맞춘다. 슬라이더 카운터 `1 / N`도 함께 고친다.
   - 대문 `<img src="images/hero.jpg" …>` 를 `images/8162_1.jpg` 로 바꾸고 `width`/`height`를 실제 크기로 맞춘다.
   - `node --check script.js` 로 스크립트 문법을 확인하고, `node scripts/build.mjs` 로 빌드가 되는지 본다.
7. **.gitignore**: `images/gallery/LOWE*.jpg` 가 혹시 다시 들어와도 올라가지 않도록 규칙을 추가한다.

## 검증 체크리스트

- [ ] `images/gallery/` 에 `01.jpg`~`NN.jpg` 만 있고 모두 1MB 이하
- [ ] 저장소 안에 20MB 이상 파일이 남아 있지 않음 (`images/gallery`, `images/8162_1.jpg`)
- [ ] `index.html` 의 슬라이드 수 = 파일 수, 카운터 `1 / N` 일치
- [ ] 대문 `src` 가 `images/8162_1.jpg` 이고 파일이 존재
- [ ] 원본은 `_originals/` 에 있고 저장소 밖

## 주의

- Pillow 가 필요하다 (`pip install pillow`). 이 저장소는 Python 3.12 + Pillow 13 에서 확인했다.
- 1MB 는 품질을 85→60까지 낮추고 긴 변을 줄여서 맞춘다. 결과가 1MB를 넘으면 스크립트가 해상도를 10%씩 더 줄인다.
