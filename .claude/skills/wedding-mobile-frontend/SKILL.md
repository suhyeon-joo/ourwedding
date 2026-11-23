---
name: wedding-mobile-frontend
description: 한국 모바일 단일 페이지 웨딩 청첩장(index.html)을 구현할 때 사용하는 스킬. 표준 섹션별 마크업/스타일 패턴, 인터랙션 스니펫(D-day 카운터, 계좌 복사, 갤러리 스와이프, 핀치 줌 lightbox, 음악 토글, 카카오 공유), 애니메이션 배경 통합 패턴(Canvas 파티클, CSS 그라디언트 메시), prefers-reduced-motion 분기, 오픈그래프 메타 태그 패턴을 제공. frontend-developer 에이전트가 모션 명세를 구현 코드로 변환할 때 사용한다.
---

# Wedding Mobile Frontend — 모바일 청첩장 구현 패턴

모바일 우선 단일 HTML 청첩장 구현용 표준 패턴.

## 0. 파일 구조

```
프로젝트 루트/
├── index.html
├── style.css            (선택: 인라인 가능)
├── script.js            (선택: 인라인 가능)
├── images/              (image-artist가 생성한 이미지)
│   ├── hero.png
│   ├── divider-floral-1.png
│   └── ...
└── _workspace/          (중간 산출물)
```

소규모 프로젝트는 단일 `index.html`에 모두 인라인하는 것이 배포 편의가 좋다. 250줄 이상이 되면 분리.

## 1. 기본 HTML 골격

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{신랑} ♡ {신부} 결혼합니다</title>

  <!-- Open Graph / Kakao -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="{kakao_share.title}">
  <meta property="og:description" content="{kakao_share.description}">
  <meta property="og:image" content="https://{도메인}/images/share-card.png">
  <meta property="og:url" content="https://{도메인}/">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Fonts (Google Fonts CDN, 컨셉 시트에 따라 변경) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">

  <style>/* CSS 인라인 또는 link rel="stylesheet" */</style>
</head>
<body>
  <main class="card">
    <!-- 섹션들 -->
  </main>
  <script>/* JS 인라인 또는 src="script.js" */</script>
</body>
</html>
```

## 2. 핵심 CSS 패턴

### CSS 변수 (컨셉 시트의 palette 그대로 매핑)
```css
:root {
  --color-primary: #B8A088;
  --color-secondary: #D4C5B0;
  --color-accent: #7A6347;
  --color-bg: #FAF6EF;
  --color-text: #2C2520;

  --font-ko-serif: "Noto Serif KR", serif;
  --font-en-serif: "Cormorant Garamond", serif;

  --max-w: 480px;
  --gap-section: 64px;
  --gap-block: 24px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  background: var(--color-secondary);
  color: var(--color-text);
  font-family: var(--font-ko-serif);
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

.card {
  max-width: var(--max-w);
  margin: 0 auto;
  background: var(--color-bg);
  min-height: 100vh;
  overflow: hidden;
}

section { padding: var(--gap-section) 28px; text-align: center; }
section + section { border-top: 1px solid rgba(0,0,0,0.04); }

h1, h2, h3 { font-weight: 400; letter-spacing: 0.02em; }
.en { font-family: var(--font-en-serif); font-style: italic; letter-spacing: 0.05em; }
.divider { display: block; width: 100%; height: auto; opacity: 0.85; margin: 32px auto; }
```

### Fade-in 애니메이션 (IntersectionObserver)
```css
.fade { opacity: 0; transform: translateY(16px); transition: opacity .9s ease, transform .9s ease; }
.fade.in { opacity: 1; transform: none; }
```

## 3. 표준 섹션 마크업

### 3.1 Hero
```html
<section class="hero" aria-label="청첩장 메인">
  <div class="hero-image">
    <img src="images/hero.png" alt="" fetchpriority="high" width="1024" height="1820">
  </div>
  <div class="hero-content">
    <p class="en hero-eyebrow">We're getting married</p>
    <h1 class="hero-names">
      <span>{신랑 이름}</span>
      <span class="en amp">&amp;</span>
      <span>{신부 이름}</span>
    </h1>
    <p class="hero-date">{YYYY.MM.DD} · {요일} {오후 H시 M분}</p>
    <p class="hero-venue">{장소명}</p>
  </div>
</section>
```

```css
.hero { position: relative; padding: 0; min-height: 100vh; color: var(--color-text); }
.hero-image img { width: 100%; height: 100vh; object-fit: cover; display: block; }
.hero-content {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 18px; text-align: center; padding: 0 28px;
}
.hero-eyebrow { font-size: 13px; letter-spacing: 0.3em; opacity: 0.7; }
.hero-names { display: flex; flex-direction: column; gap: 6px; font-size: 32px; font-family: var(--font-en-serif); }
.hero-names .amp { font-size: 28px; opacity: 0.6; margin: 4px 0; }
.hero-date { font-size: 15px; opacity: 0.85; margin-top: 10px; }
.hero-venue { font-size: 14px; opacity: 0.7; }
```

### 3.2 Greeting (인사말)
```html
<section class="greeting fade">
  <h2 class="en section-title">Invitation</h2>
  <p class="greeting-body">
    {줄1}<br>
    {줄2}<br><br>
    {줄3}<br>
    {줄4}
  </p>
</section>
```

### 3.3 Couple Intro
```html
<section class="couple fade">
  <img class="divider" src="images/divider-floral-1.png" alt="">
  <ul class="couple-list">
    <li>
      <p class="parents">{아버지함자} · {어머니함자} 의 {장남}</p>
      <p class="name">{신랑이름}</p>
    </li>
    <li>
      <p class="parents">{아버지함자} · {어머니함자} 의 {장녀}</p>
      <p class="name">{신부이름}</p>
    </li>
  </ul>
</section>
```

### 3.4 Calendar + D-day
```html
<section class="calendar fade">
  <h2 class="en section-title">The Day</h2>
  <p class="date-headline">{YYYY년 M월 D일 요일}<br>오후 {H시 M분}</p>
  <table class="cal" data-target="{YYYY-MM-DD}">
    <thead>
      <tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr>
    </thead>
    <tbody><!-- JS로 렌더링 --></tbody>
  </table>
  <p class="dday">D-<span id="dday-num">--</span></p>
</section>
```

캘린더 렌더 + D-day JS:
```js
(function(){
  const tbl = document.querySelector('.cal');
  if (!tbl) return;
  const target = new Date(tbl.dataset.target + 'T00:00:00');
  const y = target.getFullYear(), m = target.getMonth();
  const first = new Date(y, m, 1).getDay();
  const last = new Date(y, m+1, 0).getDate();
  const tbody = tbl.querySelector('tbody');
  let row = '<tr>' + '<td></td>'.repeat(first);
  for (let d=1; d<=last; d++){
    const cls = d === target.getDate() ? ' class="today"' : '';
    row += `<td${cls}>${d}</td>`;
    if ((first + d) % 7 === 0) { row += '</tr><tr>'; }
  }
  row += '</tr>';
  tbody.innerHTML = row;

  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.ceil((target - today) / (1000*60*60*24));
  const ddayNum = document.getElementById('dday-num');
  if (ddayNum) ddayNum.textContent = diff > 0 ? diff : (diff === 0 ? 'Day' : `+${-diff}`);
})();
```

캘린더 CSS:
```css
.cal { width: 100%; max-width: 320px; margin: 24px auto; border-collapse: collapse; }
.cal th, .cal td { padding: 10px 0; text-align: center; font-size: 14px; }
.cal th { color: var(--color-accent); font-weight: 500; }
.cal td.today {
  background: var(--color-primary); color: var(--color-bg);
  border-radius: 50%; width: 32px; height: 32px;
}
.dday { font-family: var(--font-en-serif); font-size: 22px; margin-top: 16px; color: var(--color-accent); }
```

### 3.5 Gallery (lightbox)
```html
<section class="gallery fade">
  <h2 class="en section-title">Gallery</h2>
  <div class="gallery-grid">
    <img src="images/gallery-1.jpg" alt="" loading="lazy" class="gallery-item">
    <img src="images/gallery-2.jpg" alt="" loading="lazy" class="gallery-item">
    <!-- ... -->
  </div>
</section>
<div class="lightbox" id="lightbox" hidden>
  <button class="lightbox-close" aria-label="닫기">&times;</button>
  <img class="lightbox-img" alt="">
</div>
```

```js
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox-img');
document.querySelectorAll('.gallery-item').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
});
```

### 3.6 Venue + 지도
```html
<section class="venue fade">
  <h2 class="en section-title">Location</h2>
  <p class="venue-name">{장소명} {홀이름}</p>
  <p class="venue-addr">{도로명주소}</p>
  <div id="map" style="width:100%; height:240px; border-radius:8px; background:#eee;"></div>
  <div class="directions">
    <h3>지하철</h3><p>{내용}</p>
    <h3>버스</h3><p>{내용}</p>
    <h3>주차</h3><p>{내용}</p>
  </div>
  <div class="venue-actions">
    <a class="btn" href="https://map.kakao.com/?q={URL인코딩된주소}" target="_blank" rel="noopener">카카오맵으로 보기</a>
    <a class="btn" href="https://map.naver.com/v5/search/{URL인코딩된주소}" target="_blank" rel="noopener">네이버맵으로 보기</a>
  </div>
</section>
```

카카오 지도 SDK 사용 시 (선택):
```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey={KAKAO_JS_KEY}"></script>
<script>
  const container = document.getElementById('map');
  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng({위도}, {경도}),
    level: 3
  });
  new kakao.maps.Marker({ position: map.getCenter(), map });
</script>
```

지도 SDK 키가 없으면 정적 정보(주소 + 외부 링크 버튼)만 표시.

### 3.7 Account (마음 전하실 곳)
```html
<section class="account fade">
  <h2 class="en section-title">Heart to Heart</h2>
  <p class="account-message">{account_message}</p>
  <details class="acc-group">
    <summary>신랑측 계좌번호</summary>
    <ul>
      <li>
        <span>{은행} {계좌번호}</span>
        <button class="copy" data-copy="{계좌번호}" aria-label="복사">복사</button>
      </li>
    </ul>
  </details>
  <details class="acc-group">
    <summary>신부측 계좌번호</summary>
    <ul>
      <li>
        <span>{은행} {계좌번호}</span>
        <button class="copy" data-copy="{계좌번호}" aria-label="복사">복사</button>
      </li>
    </ul>
  </details>
</section>
<div class="toast" id="toast" hidden>복사되었습니다</div>
```

```js
document.querySelectorAll('.copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const txt = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    const t = document.getElementById('toast');
    t.hidden = false;
    setTimeout(() => t.hidden = true, 1500);
  });
});
```

### 3.8 RSVP / Guestbook (정적 폼 또는 외부 링크)
간단히는 외부 폼 서비스 링크:
```html
<section class="rsvp fade">
  <h2 class="en section-title">RSVP</h2>
  <p>{rsvp_message}</p>
  <a class="btn primary" href="{외부 폼 URL}" target="_blank" rel="noopener">참석 의사 전달하기</a>
</section>
```

placeholder 처리: 외부 URL이 없으면 `href="#"`로 두고 주석으로 위치 표시.

### 3.9 Share
```html
<section class="share fade">
  <h2 class="en section-title">Share</h2>
  <button class="btn" id="share-link">링크 복사</button>
  <button class="btn" id="share-kakao">카카오톡 공유</button>
</section>
```

```js
document.getElementById('share-link')?.addEventListener('click', async () => {
  await navigator.clipboard.writeText(location.href);
  const t = document.getElementById('toast');
  t.textContent = '링크가 복사되었습니다';
  t.hidden = false;
  setTimeout(() => { t.hidden = true; t.textContent = '복사되었습니다'; }, 1500);
});
// 카카오톡 공유 SDK는 키가 필요하므로, 없으면 링크 복사로 대체.
```

## 4. 토스트 / 공통 컴포넌트
```css
.btn {
  display: inline-block; padding: 12px 22px; margin: 8px 6px;
  border: 1px solid var(--color-primary); background: transparent;
  color: var(--color-text); font-family: var(--font-ko-serif); font-size: 14px;
  border-radius: 4px; cursor: pointer; text-decoration: none;
  transition: all .2s ease;
}
.btn:hover { background: var(--color-primary); color: var(--color-bg); }
.btn.primary { background: var(--color-primary); color: var(--color-bg); }
.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: rgba(0,0,0,0.8); color: white; padding: 10px 18px;
  border-radius: 20px; font-size: 13px; z-index: 999;
}
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.lightbox-img { max-width: 92vw; max-height: 90vh; }
.lightbox-close { position: absolute; top: 16px; right: 20px; background: none; border: 0; color: white; font-size: 30px; cursor: pointer; }
```

## 5. Fade-in 인터랙션
```js
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.fade').forEach(el => io.observe(el));
```

## 6. 카카오 공유 (선택, 키 있을 때만)

`<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" integrity="..." crossorigin="anonymous"></script>` 로드 후 `Kakao.init(KEY)`. 키가 없으면 og 메타 태그만으로도 카카오톡 공유 시 미리보기는 표시된다.

## 7. 모션 명세 통합

### 7.0 기본 원칙
- 모션 명세(`_workspace/04_motion-designer_motion-spec.md`)의 토큰을 `:root`에 추가하고, 명세된 파라미터를 코드 상수로 그대로 옮긴다.
- **모든 무한 루프 모션은 prefers-reduced-motion 분기 필수**. 분기 안 하면 QA에서 즉시 FAIL.
- canvas 애니메이션은 IntersectionObserver로 viewport 밖에서 일시정지하여 배터리·CPU 절약.

### 7.1 reduced-motion 헬퍼 (모든 JS 진입점에서 먼저 체크)
```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isReduced = () => reducedMotion.matches;
reducedMotion.addEventListener('change', () => location.reload()); // 단순 처리
```

### 7.2 꽃잎 파티클 배경 (Canvas 2D)
```html
<canvas class="bg-petals" aria-hidden="true"></canvas>
<svg class="bg-petals-static" aria-hidden="true" hidden>
  <!-- prefers-reduced-motion 시 표시할 정적 꽃잎 SVG -->
</svg>
```
```css
.bg-petals { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.card { position: relative; z-index: 1; }
@media (prefers-reduced-motion: reduce) {
  .bg-petals { display: none; }
  .bg-petals-static { display: block; }
}
```
```js
(function setupPetals(){
  if (isReduced()) return;
  const canvas = document.querySelector('.bg-petals');
  const ctx = canvas.getContext('2d');
  const dpr = devicePixelRatio || 1;
  let W, H, petals=[];
  const COUNT = 24;            // 명세값
  const COLOR = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

  function resize(){
    W = canvas.clientWidth = innerWidth;
    H = canvas.clientHeight = innerHeight;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  class Petal {
    constructor(init){ this.reset(init); }
    reset(init){
      this.x = Math.random()*W;
      this.y = init ? Math.random()*H : -20;
      this.size = 8 + Math.random()*10;
      this.rot = Math.random()*Math.PI*2;
      this.rotSpeed = (Math.random()-0.5)*0.04;
      this.dur = 8000 + Math.random()*6000;
      this.start = performance.now() - (init?Math.random()*this.dur:0);
      this.swayPhase = Math.random()*Math.PI*2;
      this.opacity = 0.3 + Math.random()*0.4;
    }
    step(now){
      const t = (now - this.start) / this.dur;
      if (t >= 1) { this.reset(false); return; }
      this.y = -20 + (H+40)*t;
      this.x += Math.sin(now/1000 + this.swayPhase) * 0.5;
      this.rot += this.rotSpeed;
    }
    draw(){
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = COLOR;
      ctx.beginPath();
      ctx.ellipse(0,0,this.size*0.4,this.size,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }
  function start(){
    resize();
    petals = Array.from({length: COUNT}, () => new Petal(true));
    let running = true;
    const io = new IntersectionObserver(([e]) => running = e.isIntersecting);
    io.observe(canvas);
    addEventListener('resize', resize, {passive:true});
    function loop(now){
      if (running){
        ctx.clearRect(0,0,W,H);
        petals.forEach(p => { p.step(now); p.draw(); });
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  start();
})();
```

### 7.3 그라디언트 메시 배경 (CSS only)
```css
.bg-mesh {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(at 15% 20%, var(--color-primary) 0%, transparent 40%),
    radial-gradient(at 80% 30%, var(--color-secondary) 0%, transparent 40%),
    radial-gradient(at 30% 80%, var(--color-accent) 0%, transparent 40%);
  opacity: 0.18;
  background-size: 200% 200%;
  animation: meshShift 45s ease-in-out infinite alternate;
}
@keyframes meshShift {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}
@media (prefers-reduced-motion: reduce){
  .bg-mesh { animation: none; }
}
```

### 7.4 음악 토글 (BGM)
```html
<button class="music-toggle" aria-label="배경 음악 켜기/끄기" aria-pressed="false">
  <span class="ico-note" aria-hidden="true">♪</span>
  <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
</button>
<audio id="bgm" src="audio/bgm.mp3" loop preload="none"></audio>
<!-- placeholder: audio/bgm.mp3 — 사용자가 직접 추가 필요 -->
```
```css
.music-toggle { position: fixed; top: 14px; right: 14px; z-index: 50;
  width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--color-primary);
  background: rgba(255,255,255,0.7); backdrop-filter: blur(6px); cursor: pointer;
  display: grid; place-items: center; transition: transform .15s ease; }
.music-toggle:active { transform: scale(0.94); }
.music-toggle .eq { display: none; gap: 2px; align-items: end; height: 12px; }
.music-toggle .eq i { display: block; width: 2px; background: var(--color-accent);
  animation: eqBounce 0.7s ease-in-out infinite alternate; }
.music-toggle .eq i:nth-child(2){ animation-delay: 0.15s; }
.music-toggle .eq i:nth-child(3){ animation-delay: 0.3s; }
@keyframes eqBounce { 0%{height:3px;} 100%{height:12px;} }
.music-toggle[aria-pressed="true"] .ico-note { display: none; }
.music-toggle[aria-pressed="true"] .eq { display: inline-flex; }
@media (prefers-reduced-motion: reduce){
  .music-toggle .eq i { animation: none; height: 8px; }
}
```
```js
(function(){
  const btn = document.querySelector('.music-toggle');
  const audio = document.getElementById('bgm');
  if (!btn || !audio) return;
  btn.addEventListener('click', async () => {
    if (audio.paused){
      try { await audio.play(); btn.setAttribute('aria-pressed','true'); }
      catch(e){ /* 자동재생 정책 차단 시 사용자에게 안내 가능 */ }
    } else {
      audio.pause(); btn.setAttribute('aria-pressed','false');
    }
    if (navigator.vibrate) navigator.vibrate(10);
  });
})();
```

### 7.5 갤러리 스와이프 + 핀치 줌 lightbox
```js
(function(){
  const wrap = document.querySelector('.gallery-grid');
  if (!wrap) return;
  const items = [...wrap.querySelectorAll('.gallery-item')];
  let idx = 0, autoTimer;

  function show(i){
    idx = (i + items.length) % items.length;
    items.forEach((el, k) => el.classList.toggle('active', k===idx));
  }
  function next(){ show(idx+1); }
  function prev(){ show(idx-1); }
  function startAuto(){ autoTimer = setInterval(next, 5000); }
  function stopAuto(){ clearInterval(autoTimer); }

  let startX=0, dx=0;
  wrap.addEventListener('touchstart', e => { stopAuto(); startX = e.touches[0].clientX; dx=0; }, {passive:true});
  wrap.addEventListener('touchmove', e => { dx = e.touches[0].clientX - startX; }, {passive:true});
  wrap.addEventListener('touchend', () => {
    if (Math.abs(dx) > 50) (dx>0 ? prev() : next());
    if (navigator.vibrate) navigator.vibrate(10);
    startAuto();
  });

  // viewport 진입 시 자동 시작
  new IntersectionObserver(([e]) => e.isIntersecting ? startAuto() : stopAuto())
    .observe(wrap);

  show(0);
})();

// lightbox 핀치 줌
(function(){
  const lb = document.getElementById('lightbox');
  const img = lb?.querySelector('.lightbox-img');
  if (!lb || !img) return;
  let scale = 1, lastDist = 0, originX=0, originY=0, lastTap=0;
  function setTransform(){ img.style.transform = `translate(${originX}px,${originY}px) scale(${scale})`; }
  img.addEventListener('touchstart', e => {
    if (e.touches.length === 2){
      const [a,b] = e.touches;
      lastDist = Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY);
    } else if (e.touches.length === 1){
      const now = Date.now();
      if (now - lastTap < 300){ scale = scale === 1 ? 2.4 : 1; originX=originY=0; setTransform(); }
      lastTap = now;
    }
  }, {passive:true});
  img.addEventListener('touchmove', e => {
    if (e.touches.length === 2){
      const [a,b] = e.touches;
      const d = Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY);
      scale = Math.max(1, Math.min(3, scale * (d / lastDist)));
      lastDist = d; setTransform();
    }
  }, {passive:true});
  img.addEventListener('touchend', () => { lastDist = 0; });
})();
```

### 7.6 카운트업 D-day
```js
function countUp(el, target, dur=1200){
  if (isReduced()){ el.textContent = target; return; }
  const start = performance.now();
  function tick(now){
    const t = Math.min(1,(now-start)/dur);
    const eased = 1 - Math.pow(1-t,3);
    el.textContent = Math.round(target*eased);
    if (t<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
new IntersectionObserver(([e],obs) => {
  if (e.isIntersecting){
    const el = document.getElementById('dday-num');
    countUp(el, parseInt(el.dataset.target,10));
    obs.disconnect();
  }
}).observe(document.querySelector('.calendar'));
```

### 7.7 햅틱 + 토스트 (강화)
```js
function toast(msg='복사되었습니다'){
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  if (navigator.vibrate) navigator.vibrate(15);
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => t.hidden = true, 1500);
}
```
토스트 요소에는 `role="status"` 또는 `aria-live="polite"` 추가.

### 7.8 모션 토큰 (`:root` 동기화)
모션 명세의 토큰을 그대로 옮긴다:
```css
:root {
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast: 0.2s;
  --dur-base: 0.4s;
  --dur-slow: 0.9s;
  --dur-bg-loop: 12s;
}
.fade { transition: opacity var(--dur-slow) var(--ease-standard), transform var(--dur-slow) var(--ease-standard); }
.btn { transition: transform var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard); }
.btn:active { transform: scale(0.96); }
```

## 8. 체크리스트

- [ ] 컨셉 시트의 palette HEX가 CSS 변수로 정확히 매핑됨
- [ ] 컨셉 시트의 typography가 Google Fonts URL과 font-family에 정확히 적용됨
- [ ] 카피 파일의 모든 섹션이 HTML에 사용됨
- [ ] 이미지 매니페스트의 모든 파일이 HTML에서 참조됨
- [ ] **모션 명세의 Must 항목이 모두 구현됨**
- [ ] **모션 명세의 토큰(`--ease-*`, `--dur-*`)이 :root에 정의됨**
- [ ] **모든 무한 루프 모션이 prefers-reduced-motion 분기 처리됨**
- [ ] viewport 메타 태그가 `viewport-fit=cover` 포함
- [ ] og 메타 태그(title/description/image) 설정됨
- [ ] 모든 `<img>`에 alt, loading="lazy"(hero 제외)
- [ ] 모바일 375px 너비에서 가로 스크롤 없음
- [ ] D-day 카운터가 컨셉 시트 날짜로 정확히 작동
- [ ] 계좌 복사가 navigator.clipboard 폴백 포함
- [ ] 음악 토글이 첫 사용자 인터랙션 후 작동, aria-pressed 토글 처리
- [ ] 캔버스 애니메이션이 IntersectionObserver로 viewport 외 일시정지
