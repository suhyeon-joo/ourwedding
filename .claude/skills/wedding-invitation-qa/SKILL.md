---
name: wedding-invitation-qa
description: 완성된 한국 모바일 웨딩 청첩장(index.html + assets)의 정보 정합성, 모바일 반응형, 접근성, 인터랙션 동작, 모션 명세 구현도, prefers-reduced-motion 대체안 작동을 검증할 때 사용하는 스킬. 컨셉 시트·카피·이미지 매니페스트·모션 명세와 실제 HTML/JS를 경계면 교차 비교하는 체크리스트와 자동 검증 패턴을 제공. invitation-qa 에이전트가 사용한다.
---

# Wedding Invitation QA — 검증 체크리스트와 패턴

청첩장의 정합성·반응형·접근성·인터랙션을 체계적으로 검증한다.

## 0. 검증 입력

```
_workspace/01_concept-director_concept-sheet.md   # 진실의 원천 (truth source: 정보)
_workspace/02_copy-writer_copy.md
_workspace/03_image-artist_manifest.md
_workspace/04_motion-designer_motion-spec.md      # 진실의 원천 (truth source: 모션)
_workspace/05_frontend-developer_summary.md
index.html (+ style.css + script.js)
images/ 폴더 내용
audio/ 폴더 (BGM 사용 시)
```

원칙: **컨셉 시트가 정보의 진실의 원천, 모션 명세가 인터랙션·애니메이션의 진실의 원천**. HTML이 둘 중 하나와 다르면 HTML이 틀린 것.

## 1. 정보 정합성 (가장 중요)

### 1.1 자동화 검증 — grep 기반 교차 비교
컨셉 시트의 핵심 값을 추출하여 HTML에서 검색:

```bash
# 신랑신부 이름이 HTML에 정확히 등장하는지
grep -F "{신랑이름}" index.html
grep -F "{신부이름}" index.html

# 부모님 함자
grep -F "{groom_father}" index.html
grep -F "{bride_father}" index.html

# 날짜 (다양한 표기로 등장 가능 — 적어도 하나는 일치해야)
grep -F "{YYYY}" index.html
grep -F "{M월 D일}" index.html

# 장소
grep -F "{venue}" index.html

# 컬러 팔레트가 CSS 변수로 적용됐는지
grep -F "{primary HEX}" index.html
```

### 1.2 카피 누락 검증
```bash
# 카피의 각 섹션 헤더에 대응하는 내용이 HTML에 존재하는가
# greeting 섹션의 본문 첫 줄을 추출하여 grep
```

### 1.3 이미지 참조/존재 교차 검증
```bash
# 매니페스트에 등록된 모든 파일이 images/ 폴더에 존재하는가
# 매니페스트의 file 경로를 추출하여 ls로 확인
ls images/

# HTML에서 참조하는 모든 이미지 src가 실제 존재하는가
grep -oE 'src="images/[^"]+"' index.html | sort -u
```

## 2. 모바일 반응형

### 2.1 기준 너비 검증
- 375px 너비에서 가로 스크롤 발생 여부 → CSS에 `overflow-x: hidden` 또는 `max-width: 100%` 적용 확인
- 모든 컨테이너의 padding이 좌우 합 56px 이하인지 (320px 단말 고려 시)
- 폰트 크기 14px 이상 (가독성)

### 2.2 viewport 메타 태그
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
누락이면 FAIL.

### 2.3 이미지 폭 처리
모든 `<img>`가 `max-width: 100%; height: auto` 또는 명시적 width/height + `object-fit` 적용 확인.

## 3. 접근성

### 3.1 alt 속성
```bash
# alt 누락 검증
grep -oE '<img[^>]*>' index.html | grep -v 'alt='
```
결과가 비어있어야 PASS. 빈 alt(`alt=""`)는 장식용 이미지에 한해 허용.

### 3.2 시멘틱 태그
- `<main>`, `<section>`, `<header>`, `<footer>` 사용
- heading 계층: `<h1>` 1회, 이후 `<h2>` 사용 (스킵 없음)

### 3.3 컬러 대비
컨셉 시트의 `text` 컬러 vs `background` 컬러 명도 대비를 WCAG 계산기로 확인 (목표: 4.5:1 이상). 본 스킬에서는 다음 패턴만 자동 점검:
- `--color-text`와 `--color-bg`가 모두 매우 밝거나 모두 매우 어둡지 않은가
- 대비가 약한 경우 WARNING

### 3.4 lang 속성
`<html lang="ko">` 명시 확인. 누락이면 FAIL.

## 4. 인터랙션 동작

### 4.1 D-day 카운터
- `data-target` 속성이 컨셉 시트의 `ceremony.date`와 일치하는지
- JS의 D-day 계산 코드가 존재하는지 (코드 검토)

### 4.2 계좌 복사
- `data-copy` 속성에 계좌번호가 들어있는지 (placeholder 그대로 두는 경우 WARNING으로 표시)
- `navigator.clipboard.writeText` + `execCommand` 폴백이 모두 존재하는지

### 4.3 Lightbox
- `.gallery-item` 클릭 핸들러 존재 여부
- 배경 클릭 시 닫히는 핸들러 존재 여부

### 4.4 Fade-in
- `IntersectionObserver` 사용 여부
- `.fade` 클래스 사용 일관성

## 5. 배포 준비

### 5.1 외부 리소스 HTTPS
```bash
grep -oE '(src|href)="http://[^"]*"' index.html
```
결과가 비어있어야 PASS (모든 외부 리소스 https://).

### 5.2 og 메타 태그
- og:title, og:description, og:image, og:url 모두 존재
- og:image는 절대 URL (도메인 placeholder 허용)
- 카피의 `kakao_share.title/description`과 일치

### 5.3 Placeholder 가시성
사용자가 채워야 할 값(계좌번호, 외부 폼 URL, 카카오 SDK 키, 도메인 등)이 명확히 구분되어야 함. 검증 패턴:
```bash
grep -oE '\[[^\]]*\]' index.html         # 대괄호 placeholder
grep -oE '\{[A-Z_]+\}' index.html        # 중괄호 + 대문자 placeholder
```
이런 표기가 남아있다면, `_workspace/05_frontend-developer_summary.md`에 placeholder 위치가 안내됐는지 교차 확인.

## 6. 모션 명세 구현도 (motion-spec ↔ HTML/JS 교차 비교)

### 6.1 자동화 검증 — grep 패턴

```bash
# prefers-reduced-motion 분기가 존재하는가 (없으면 즉시 FAIL)
grep -F "prefers-reduced-motion" index.html style.css script.js 2>/dev/null

# 모션 명세에 정의된 토큰이 :root에 동기화되었는가
grep -F "--ease-emphasized" style.css index.html
grep -F "--dur-base" style.css index.html

# 명세된 파티클 count가 코드 상수와 일치하는가
# (명세에 'count: 24'이면 코드에서 'COUNT = 24' 또는 유사 상수 grep)

# layout 트리거 속성 애니메이션 금지 검증
grep -nE "transition:[^;]*\b(width|height|top|left|margin|padding)\b" style.css index.html
# 결과가 비어야 PASS

# IntersectionObserver 사용 여부 (배경 모션 일시정지)
grep -F "IntersectionObserver" script.js index.html
```

### 6.2 명세-구현 매핑 검증
명세의 각 항목(애니메이션 배경, 스크롤 시퀀스, 인터랙티브 요소)에 대해 다음 매핑을 표로 작성:

| 명세 항목 | 명세값 | 구현 위치 | 구현값 | 결과 |
|----------|-------|---------|-------|------|
| 꽃잎 파티클 count | 24 | script.js:42 | 24 | PASS |
| 꽃잎 duration | 8-14s | script.js:51 | 8000-14000ms | PASS |
| ease-emphasized | cubic-bezier(0.2,0,0,1) | style.css:18 | cubic-bezier(0.2, 0, 0, 1) | PASS |
| 카운트업 D-day | 1.2s | script.js:101 | 1200 | PASS |
| 음악 토글 aria-pressed | yes | index.html:55 | yes | PASS |
| reduced-motion 분기 (꽃잎) | 정적 SVG 5개 | style.css:200, html:18 | 구현됨 | PASS |
| reduced-motion 분기 (mesh) | animation:none | style.css:230 | 구현됨 | PASS |
| ... | | | | |

### 6.3 prefers-reduced-motion 동작 시뮬레이션
- DevTools "Emulate CSS prefers-reduced-motion: reduce" 시 페이지가 깨지지 않고 정적 대체 시각이 표시되어야 함
- 정적 대체가 시각적으로 컨셉 시트의 톤과 부합해야 함 (모션이 사라지면 빈 페이지가 되는 것은 안 됨)

### 6.4 인터랙션 수동 점검 (코드 + 시뮬레이션)
- [ ] 갤러리 좌/우 스와이프 → 슬라이드 전환
- [ ] 갤러리 자동 슬라이드 → 5초 간격, 터치 시 일시정지
- [ ] 갤러리 lightbox 핀치 줌 → max scale 3, 더블탭 토글
- [ ] 음악 토글 → 첫 클릭 시 재생 시도, aria-pressed 토글
- [ ] 계좌 복사 → 클립보드 + 토스트 + (지원 시) vibrate
- [ ] D-day 카운트업 → 섹션 진입 시 0→target
- [ ] 외부 링크 → 카카오맵/네이버맵/RSVP 폼 새 탭

## 7. 점진적 검증 (incremental QA)

전체 완성 후 1회 검증이 아니라, 각 모듈 완성 직후 점진적으로 실행:

| 시점 | 검증 항목 |
|------|----------|
| concept-director 직후 | 컨셉 시트 yaml 형식 / 필수 필드 누락 |
| copy-writer 직후 | 카피 섹션 헤더 / 부모 함자 정확성 / 글자수 제한 |
| image-artist 직후 | images/ 파일 존재 / 매니페스트 무결성 |
| motion-designer 직후 | 모션 명세 yaml / 모든 모션에 reduced-motion 대체안 명시 / Must 우선순위 표시 |
| frontend-developer 직후 | 정합성·반응형·접근성·인터랙션·모션 구현도 전체 |

## 8. QA 리포트 형식

`_workspace/06_invitation-qa_report.md`로 저장.

```markdown
# QA Report — {YYYY-MM-DD}

## 요약
- 전체 결과: PASS / FAIL
- PASS: N / FAIL: M / WARNING: K

## 1. 정보 정합성
| 항목 | 컨셉시트 값 | HTML 값 | 결과 |
|------|------------|---------|------|
| 신랑이름 | "..." | "..." | PASS |
| 신부이름 | "..." | "..." | PASS |
| 예식일 | YYYY-MM-DD | YYYY.MM.DD | PASS |
| 장소 | "..." | "..." | PASS |
| 주소 | "..." | "..." | PASS |
| 신랑 부 | "..." | "..." | PASS |
| 신랑 모 | "..." | "..." | PASS |
| 신부 부 | "..." | "..." | PASS |
| 신부 모 | "..." | "..." | PASS |
| primary 컬러 | #... | #... | PASS |
| ... | | | |

## 2. 모바일 반응형
- viewport 메타: PASS
- max-width 480px 카드: PASS
- 가로 스크롤: PASS (없음)

## 3. 접근성
- 모든 이미지 alt: PASS
- 시멘틱 태그: PASS
- 컬러 대비: WARNING (계산 필요)
- lang 속성: PASS

## 4. 인터랙션
- D-day 카운터: PASS
- 계좌 복사: PASS
- Lightbox: PASS
- Fade-in: PASS

## 5. 배포 준비
- HTTPS 외부 리소스: PASS
- og 메타 태그: PASS
- Placeholder 가시성: WARNING (계좌번호 placeholder 5개 — summary에 안내됨)

## 발견된 이슈와 수정 제안
- [ ] index.html:42 — D-day 계산이 D-1 오차 → 수정: `Math.ceil` → `Math.round` (영향 적음, 우선순위 낮음)
- [ ] index.html:78 — 부모 함자에서 어머니 함자 한 글자 누락
```

## 9. 자동화 우선 원칙

본 스킬의 검증은 가능한 한 grep/diff/find로 자동화한다. 사람이 눈으로 봐야만 알 수 있는 항목(시각적 균형, 컬러 조화, 모션 감각)만 정성적 평가로 남긴다. 자동 검증 우선이 회귀(regression) 방지에 결정적이다.

특히 모션은 회귀가 자주 발생한다. 명세-구현 매핑 표를 매 QA마다 새로 작성하지 말고, 이전 리포트의 표를 비교해 변경된 셀만 강조하여 회귀 여부를 즉시 판별한다.
