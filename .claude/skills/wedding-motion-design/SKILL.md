---
name: wedding-motion-design
description: 한국 모바일 웨딩 청첩장의 인터랙티브 요소(갤러리 스와이프, 음악 토글, 핀치 줌, 햅틱, 카운트다운, 마이크로 인터랙션)와 애니메이션 배경(꽃잎 파티클, 그라디언트 메시, 별빛 반딧불이, SVG 플로럴 드로우, 패럴랙스)을 설계할 때 사용하는 스킬. 모션 무드별 패턴 카탈로그, vanilla 구현 스니펫, 성능·접근성(prefers-reduced-motion) 가이드를 제공. motion-designer 에이전트가 사용한다.
---

# Wedding Motion Design — 인터랙션 & 애니메이션 설계 가이드

청첩장의 모든 모션 명세 작성을 위한 카탈로그·패턴·구현 가이드. 본 스킬은 명세 작성에 필요한 옵션과 수치를 제공하며, 실제 코드 통합은 frontend-developer가 `wedding-mobile-frontend` 스킬을 통해 수행한다.

## 1. 모션 무드 매핑 (가장 먼저 결정)

컨셉 시트의 첫 번째 mood_keyword를 기준으로 모션 무드를 결정한다.

| mood_keywords 첫 키워드 | motion_mood | density | 대표 배경 모션 | 대표 트랜지션 |
|----------------------|-------------|---------|--------------|--------------|
| 차분한 / 미니멀 / 모던 | `calm-minimal` | minimal | 그라디언트 메시 매우 천천히 흐름 | 페이드 + 미세 translateY |
| 클래식 / 격식 | `elegant-classic` | balanced | SVG 보태니컬 stroke-draw + 정지 | 마스킹 텍스트 리빌 |
| 화사한 / 로맨틱 / 봄 | `romantic-lush` | balanced~rich | 꽃잎 파티클 (24-40개) | stagger + scale-in |
| 보태니컬 / 자연 | `botanical-soft` | balanced | 잎사귀 SVG 떨어지기 + 패럴랙스 | masked reveal + parallax |
| 모던 / 시크 / 흑백 | `modern-bold` | minimal | 라인 모션(stroke-dashoffset) | 빠른 페이드 + bold cut-in |
| 꿈결같은 / 부드러운 | `dreamy-soft` | balanced | 별빛/반딧불이 (faint glow) | soft blur fade |

## 2. 애니메이션 배경 카탈로그

각 패턴은 (기술 / 파라미터 / 성능 / 감속 대체)를 묶음으로 명세한다.

### A. 꽃잎 파티클 (Canvas 2D)
- **적합 무드**: romantic-lush, botanical-soft
- **기술**: Canvas 2D + requestAnimationFrame, devicePixelRatio 보정
- **파라미터 표준**:
  - count: 24 (minimal) / 32 (balanced) / 48 (rich)
  - shape: 작은 꽃잎 SVG path 또는 ellipse
  - color: palette.primary, palette.secondary mix
  - size_range: [8, 18] px
  - opacity_range: [0.3, 0.7]
  - 수직 속도: viewport_height / [10, 16]초 randomize
  - 수평 드리프트: sin wave amplitude [20, 50]px
  - 회전: [0, 360] deg, [-2, 2] deg/frame
- **성능**: 모바일 60fps 유지 (40개까지 안전), 그 이상이면 fps 측정 후 동적 감소
- **prefers-reduced-motion**: 정적 SVG 꽃잎 3-5개를 hero 모서리에 고정

### B. 그라디언트 메시 (CSS 또는 Canvas)
- **적합 무드**: calm-minimal, dreamy-soft
- **기술**: CSS `radial-gradient`를 4개 레이어로 겹치고 `background-position`을 매우 느리게 애니메이션 (40-60초 loop). 또는 Canvas로 noise mesh.
- **파라미터**:
  - 레이어 수: 3-4
  - 컬러: palette.primary, secondary, accent를 0.15-0.3 alpha로
  - duration: 45s (minimal), 30s (balanced)
- **성능**: CSS는 거의 무료. Canvas mesh는 작은 해상도(예: 640x360)로 그려서 CSS scale.
- **prefers-reduced-motion**: 정적 첫 프레임 고정

### C. 별빛 / 반딧불이 (Canvas 또는 CSS)
- **적합 무드**: dreamy-soft, romantic-lush
- **기술**: 작은 원 + box-shadow blur 또는 canvas glow
- **파라미터**:
  - count: 30
  - size: 1-3 px
  - opacity: sin(time) [0.2, 0.9]
  - color: palette.accent 약간 밝게
- **prefers-reduced-motion**: 정적 점 5-7개 고정

### D. SVG 보태니컬 stroke-draw
- **적합 무드**: elegant-classic, botanical-soft
- **기술**: SVG path에 `stroke-dasharray` + `stroke-dashoffset` 애니메이션 (한 번 그려진 후 정지)
- **파라미터**:
  - draw duration: 3-5s
  - 트리거: 페이지 로드 또는 섹션 진입 시 한 번
- **성능**: 매우 가벼움 (단발 애니메이션)
- **prefers-reduced-motion**: 처음부터 완성된 path 표시

### E. 패럴랙스 레이어 (Scroll-driven)
- **적합 무드**: 모든 무드. 다른 배경과 조합 가능
- **기술**: scroll 위치에 따라 배경 이미지 transform: translateY(scrollY * factor). IntersectionObserver로 viewport 외 일시정지.
- **파라미터**:
  - 레이어 수: 2-3 (먼 배경 0.2x, 중경 0.5x)
- **성능**: scroll handler에 throttle/passive listener 사용
- **prefers-reduced-motion**: factor를 0으로 강등 (정적 배경)

### F. 라인 모션 (Modern bold)
- **적합 무드**: modern-bold
- **기술**: SVG 가는 선이 섹션 사이를 그려나가는 stroke 애니메이션. 단색 accent.
- **파라미터**: stroke-width 1px, accent 색, 진입 시 0→1 draw
- **prefers-reduced-motion**: 처음부터 완성

## 3. 인터랙션 인벤토리 (표준 청첩장 기준)

각 인터랙션은 (위치 / 트리거 / 동작 / 시각적 피드백 / 햅틱 / 접근성) 6항목으로 명세.

| 인터랙션 | 위치 | 트리거 | 동작 |
|---------|------|--------|------|
| 음악 토글 | hero 우상단 (sticky) 또는 footer | 첫 사용자 인터랙션 / 토글 클릭 | BGM 재생/정지, 음표 + 이퀄라이저 3바 애니메이션 |
| 갤러리 스와이프 | gallery 섹션 | 좌우 swipe (≥50px threshold) | 슬라이드 전환, 인디케이터 dot 갱신 |
| 갤러리 자동 재생 | gallery 섹션 | viewport 진입 + 5초 간격 | 자동 슬라이드, 인터랙션 시 일시정지 |
| 핀치 줌 (lightbox) | 갤러리 클릭 → lightbox | 핀치 / 더블탭 | scale 1↔3, transform-origin 손가락 중심 |
| 계좌 복사 | account 섹션 각 항목 | 버튼 클릭 | 클립보드 복사, 토스트 페이드인, vibrate(15) |
| 카카오톡 공유 | share 섹션 | 버튼 클릭 | Kakao SDK 가능하면 SDK, 아니면 링크 복사 폴백 |
| 링크 복사 | share 섹션 | 버튼 클릭 | navigator.clipboard, 토스트 |
| 카운트다운(D-day) | calendar 섹션 | 섹션 진입 | 0부터 실제 D-day까지 카운트업, ease-out 1.2s |
| 캘린더 펄스 | calendar의 today 셀 | 섹션 진입 | scale 1→1.1→1 부드러운 pulse 3회 |
| 길찾기 버튼 | venue 섹션 | 클릭 | 카카오맵·네이버맵 외부 링크, hover/active scale 0.96 |
| 방명록 작성 | guestbook 섹션 | 입력 | 외부 폼 또는 mailto 링크. 입력 시 placeholder 페이드 |
| RSVP 폼 | rsvp 섹션 | 외부 링크 또는 인라인 라디오 | 답변 시 체크 마크 swap |
| 햅틱 피드백 | 모든 주요 버튼 | 클릭 | navigator.vibrate(10-20) 지원 시 |
| 스크롤 인디케이터 | hero 하단 | scroll 시작 시 페이드아웃 | 이중 화살표 bounce 애니메이션 |
| 첫 인터랙션 게이트 | 페이지 진입 시 (선택) | "초대장 열기" 버튼 클릭 | 봉투/카드 페이드 인. 음악 자동재생 가능 시점 확보. |

## 4. 스크롤 시퀀스 패턴

### Stagger Reveal
연속된 자식 요소들에 0.08-0.15s 간격으로 트랜지션 적용. CSS 변수로 `--stagger-i: N` 설정 후 `transition-delay: calc(var(--stagger-i) * 0.1s)`.

### Masked Text Reveal
부모에 overflow:hidden + 자식 textElement에 transform: translateY(100%) → 0. 진입 시 마스킹된 텍스트가 위에서 아래로 드러남.

### Split Char (한국어 주의)
한국어는 글자 단위 split이 영문보다 무거움. 30자 이하 짧은 헤드라인에만 사용. 자모 단위 분해 금지.

### Stroke Draw (SVG 텍스트)
영문 캘리그래피에 적용 가능. 한국어는 글리프 path 추출이 까다로워 권장하지 않음.

### Number Count-up (D-day)
requestAnimationFrame으로 0 → target 보간. ease-out으로 마지막 30%에서 부드럽게 감속.

## 5. vanilla 구현 패턴 (frontend-developer 가이드)

motion-designer는 명세에 다음 스니펫 형태를 참고로 첨부할 수 있다.

### 꽃잎 파티클 (Canvas)
```js
class Petal {
  constructor(W, H){ this.reset(W,H,true); }
  reset(W,H,init){
    this.x = Math.random()*W;
    this.y = init ? Math.random()*H : -20;
    this.size = 8 + Math.random()*10;
    this.rot = Math.random()*Math.PI*2;
    this.rotSpeed = (Math.random()-0.5)*0.04;
    this.dur = 8000 + Math.random()*6000;
    this.start = performance.now() - (init?Math.random()*this.dur:0);
    this.swayAmp = 20 + Math.random()*30;
    this.swayPhase = Math.random()*Math.PI*2;
    this.opacity = 0.3 + Math.random()*0.4;
  }
  step(now,W,H){
    const t = (now - this.start) / this.dur;
    if (t > 1) { this.reset(W,H,false); return; }
    this.y = -20 + (H+40)*t;
    this.x += Math.sin(now/1000 + this.swayPhase) * 0.5;
    this.rot += this.rotSpeed;
  }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = 'var actual color';
    ctx.beginPath();
    ctx.ellipse(0,0,this.size*0.4,this.size,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}
```

### prefers-reduced-motion 분기
```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  // 정적 SVG 꽃잎만 렌더, canvas 애니메이션 안 함
} else {
  // 풀 애니메이션
}
```

### IntersectionObserver 기반 viewport 외 일시정지
```js
const obs = new IntersectionObserver(([e]) => {
  e.isIntersecting ? animation.start() : animation.pause();
}, { threshold: 0 });
obs.observe(canvas);
```

### 카운트업 (D-day)
```js
function countUp(el, target, dur=1200){
  const start = performance.now();
  function tick(now){
    const t = Math.min(1,(now-start)/dur);
    const eased = 1 - Math.pow(1-t,3);
    el.textContent = Math.round(target*eased);
    if (t<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

### 갤러리 스와이프 (touch)
```js
let startX=0, dx=0;
gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dx=0; }, {passive:true});
gallery.addEventListener('touchmove', e => { dx = e.touches[0].clientX - startX; }, {passive:true});
gallery.addEventListener('touchend', () => {
  if (Math.abs(dx) > 50) dx > 0 ? prev() : next();
});
```

## 6. 성능 가이드

| 패턴 | 모바일 영향 | 권장 한계 |
|------|-----------|----------|
| Canvas 파티클 | CPU/GPU | 동시 80개, 단일 캔버스 |
| CSS 그라디언트 메시 | GPU only (compositor) | 무제한, blend-mode 주의 |
| box-shadow blur | 매우 무거움 | 정적 요소만, 애니메이션 금지 |
| filter: blur() | 매우 무거움 | 정적 + 작은 영역만 |
| transform / opacity | GPU 가속 | 가장 안전 |
| width/height/top/left 애니메이션 | layout 트리거 | 금지 |
| backdrop-filter | 무거움 | 작은 영역(토스트, 버튼)만 |

원칙: 모든 애니메이션은 `transform`과 `opacity`만 변화. `will-change`는 모션 직전에만 추가.

## 7. 접근성 체크리스트

- [ ] 모든 무한 루프 모션이 `prefers-reduced-motion`에서 정적 대체로 강등됨
- [ ] 자동 재생 캐러셀이 사용자 인터랙션 시 일시정지
- [ ] 음악 토글이 명확히 보이고 키보드(Enter/Space) 접근 가능
- [ ] 빠른 점멸(>3Hz) 없음 (광과민성)
- [ ] 모든 인터랙티브 버튼에 `aria-label`
- [ ] 토스트가 `role="status"` 또는 `aria-live="polite"` 포함

## 8. 명세 작성 체크리스트

- [ ] motion_mood, density, performance_budget 결정
- [ ] 애니메이션 배경 1-2종 선택 (3종 이상은 시각적 과부하)
- [ ] 인터랙션 인벤토리에서 청첩장에 필요한 항목 모두 명시
- [ ] 각 모션에 prefers-reduced-motion 대체안 명시
- [ ] easing/duration 토큰을 CSS 변수 형태로 정리
- [ ] 구현 우선순위(Must/Should/Nice-to-have) 표시
