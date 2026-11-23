---
name: wedding-imagery-gpt-image2
description: 한국 모바일 웨딩 청첩장에 필요한 시각 자산(히어로 이미지, 플로럴 모티프, 섹션 디바이더, AI 일러스트 부부, 캘리그래픽 텍스처)을 gpt-image2로 생성할 때 사용하는 스킬. 청첩장 전용 이미지 인벤토리, gpt-image2 프롬프트 템플릿, 일관된 스타일 유지 전략을 제공. image-artist 에이전트가 사용한다.
---

# Wedding Imagery via gpt-image2

청첩장 시각 자산을 gpt-image2(`gpt-image-2`)로 생성하기 위한 인벤토리·프롬프트·실행 가이드.

## 0. 실행 흐름

1. 컨셉 시트의 `imagery_direction`, `palette`, `mood_keywords` 확인
2. 본 스킬의 "1. 이미지 인벤토리" 표를 기반으로 필요 이미지 종류·개수 확정
3. 각 이미지마다 본 스킬의 "3. 프롬프트 템플릿"과 컨셉을 결합하여 영문 프롬프트 작성
4. **글로벌 스킬 `gpt-image2`를 호출**하여 실제 이미지 생성 (모델: `gpt-image-2` 고정)
5. `images/` 폴더에 저장 → 매니페스트 작성

## 1. 이미지 인벤토리 (표준)

| 종류 | 필수/선택 | 종횡비 | 권장 크기 | 용도 |
|------|---------|-------|----------|------|
| hero | 필수 | 9:16 | 1024×1820 | 메인 풀스크린 배경 |
| hero-overlay-text-art | 선택 | 9:16 | 1024×1820 | hero 위 영문 캘리그래피 |
| divider-floral-1 | 필수 | 16:5 (와이드) | 1280×400 | 인사말 ↔ 신랑신부 구분 |
| divider-floral-2 | 선택 | 16:5 | 1280×400 | venue ↔ account 구분 |
| corner-ornament | 선택 | 1:1 | 512×512 | 각 섹션 상단 코너 장식 |
| couple-illustration | imagery_direction이 "AI 일러스트"면 필수 | 4:5 | 1024×1280 | 부부 캐릭터 일러스트 |
| gallery-placeholder | 사진 없을 시 | 1:1 또는 4:5 | 1024×1024 | 갤러리 자리 채울 일러스트 |
| account-icon | 선택 | 1:1 | 256×256 | 마음 전하실 곳 도장 느낌 |
| share-card | 선택 | 1.91:1 | 1200×630 | og:image, 카카오 공유 미리보기 |
| footer-flora | 선택 | 16:5 | 1280×400 | 푸터 보태니컬 장식 |

## 2. 일관된 스타일 유지

모든 이미지는 동일한 화풍을 유지해야 한다. 첫 이미지(보통 hero) 생성 시 결정한 스타일을 후속 프롬프트에 명시적으로 인용한다.

**스타일 인용 패턴** (모든 후속 프롬프트 끝에 추가):
```
Same illustration style as the hero image: {스타일 요약, 예: "soft watercolor, muted dusty rose palette, hand-painted texture, off-white background"}.
```

## 3. 프롬프트 템플릿 (영문, gpt-image2)

### 공통 헤더
모든 프롬프트 시작에 다음 컨텍스트를 포함:
```
A piece of visual art for a Korean wedding invitation web page.
Color palette: primary {primary HEX}, secondary {secondary HEX}, accent {accent HEX}, background {background HEX}.
Mood: {mood keywords}.
```

### 3.1 Hero (보태니컬 컨셉 예시)
```
A vertical 9:16 hero image for a minimal Korean wedding invitation.
Soft watercolor botanical illustration: gentle eucalyptus and small wildflower stems
arranged delicately on a {background HEX} ivory background, leaving generous empty space
in the center for typography overlay. Painted texture, muted sage greens
({primary HEX}, {secondary HEX}) with subtle dusty rose accents. No text in image.
Elegant, calm, hand-painted, high-resolution.
```

### 3.2 Hero (모던 시크 컨셉 예시)
```
A vertical 9:16 minimalist photograph-style hero image. Out-of-focus warm cream paper texture
({background HEX}) with a single delicate shadow line drawing of two simple silhouette figures
walking together in the lower third. Plenty of empty space at top for text overlay.
Mood: calm, modern, monochrome with a hint of {accent HEX}.
No actual text in the image. Clean, gallery-quality.
```

### 3.3 Hero (AI 일러스트 부부)
```
A vertical 9:16 illustrated wedding scene for a Korean couple's invitation.
Soft watercolor illustration: a stylized couple in modern formal wear standing closely,
back-three-quarter view from a distance, surrounded by gentle wildflowers,
warm {background HEX} ivory background. Faces non-specific, gentle and dreamy.
Color palette: {primary HEX}, {secondary HEX}, {accent HEX}.
No text in image. Romantic, hand-painted texture, square brush strokes.
```

### 3.4 Divider Floral (가로 와이드)
```
A horizontal 16:5 wide ornamental divider for a wedding invitation.
A single thin horizontal line in {accent HEX} centered vertically, with a small cluster
of watercolor wildflowers and leaves growing from the center of the line in
{primary HEX} and {secondary HEX}. Transparent or {background HEX} background.
Minimal, elegant, asymmetric balance. No text.
```

### 3.5 Corner Ornament
```
A 1:1 square corner ornament for a wedding invitation section.
Watercolor floral spray (small leaves and tiny buds) anchored at the top-left corner,
flowing diagonally toward the lower-right with empty negative space.
Colors: {primary HEX} and {secondary HEX}. Background: {background HEX}.
Soft hand-painted texture, no text.
```

### 3.6 Couple Illustration (4:5)
```
A 4:5 portrait wedding couple illustration in soft watercolor.
A stylized Korean couple standing close together facing forward, dressed in
modern minimal wedding attire (groom in dark suit, bride in simple ivory dress).
Faces shown gently and abstractly, not photorealistic; soft expressions.
Background: {background HEX} cream with subtle {primary HEX} floral accents at edges.
Hand-painted, calm, dreamy. No text.
```

### 3.7 Gallery Placeholder
```
A 1:1 square placeholder illustration for a wedding photo gallery slot.
Soft watercolor still life: a small bouquet of mixed wildflowers in {primary HEX}
and {secondary HEX} on a {background HEX} background. Off-center, asymmetric composition,
generous negative space. Hand-painted texture, no text.
```

### 3.8 Account Icon (작은 도장 느낌)
```
A 1:1 minimal icon-style mark in {accent HEX} on a transparent or {background HEX} background.
A simple line drawing of a small envelope with a tiny flower sprig on top.
Hand-drawn feel, not flat vector. No text.
```

### 3.9 Share Card (1.91:1, og:image)
```
A 1200x630 wedding announcement card image for social media share preview.
Watercolor wedding theme with {primary HEX} and {secondary HEX} botanical elements
framing the edges, a generous empty cream {background HEX} center area for typography overlay.
No text rendered in image (typography will be added separately or via overlay text option).
Elegant, magazine-cover composition.
```

### 3.10 Footer Flora
```
A horizontal 16:5 wedding footer ornament. A symmetric arc of gentle leaves and small
flowers in {primary HEX} and {secondary HEX} stretching across the bottom of the frame,
on a {background HEX} background. Soft watercolor, calm and grounding. No text.
```

## 4. gpt-image2 호출 패턴

글로벌 `gpt-image2` 스킬을 활용한다. 핵심 호출 옵션:

- 모델: `gpt-image-2` (고정)
- 출력: PNG (투명 배경 필요 시 `transparent: true`)
- 텍스트 렌더링이 필요한 경우(예: hero 위 캘리그래피)에는 gpt-image2의 강한 텍스트 렌더링 능력을 활용. 단 한국어 텍스트는 GPT Image 2도 가끔 깨질 수 있으므로 영문 위주로.

이미지 생성 후 저장 경로:
```
/Users/robin/Downloads/wedding-invitation-letter/images/{filename}.png
```

## 5. 매니페스트 작성

`_workspace/03_image-artist_manifest.md`로 저장.

```markdown
# Image Manifest

## hero
- file: images/hero.png
- size: 1024x1820
- alt: "{한국어 alt 텍스트}"
- usage: hero 섹션 풀스크린 배경
- prompt: |
    {실제 사용한 영문 프롬프트}

## divider-floral-1
- file: images/divider-floral-1.png
- size: 1280x400
- alt: "꽃 장식 디바이더"
- usage: 인사말과 신랑신부 소개 섹션 사이
- prompt: |
    ...
```

## 6. 체크리스트

생성 후 확인:
- [ ] 모든 이미지가 동일한 화풍(스타일 인용 적용)
- [ ] 컨셉 시트의 컬러 팔레트가 이미지에 자연스럽게 반영됨
- [ ] 텍스트가 들어가야 할 자리에는 충분한 빈 공간이 있음
- [ ] 파일이 `images/` 폴더에 정확히 저장됨
- [ ] 매니페스트의 모든 항목에 alt 텍스트와 prompt가 기록됨
- [ ] 실존 인물 묘사가 없음 (저작권 안전)
