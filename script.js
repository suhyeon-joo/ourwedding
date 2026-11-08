/* =========================================================
   이상엽 ♡ 주수현 모바일 청첩장 — script.js
   Vanilla JS. 꽃잎 배경 · 캘린더/D-day · 사진 슬라이더 · 라이트박스 ·
   계좌 복사 · 음악 · 공유
   ========================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------
  // 설정 (필요 시 값을 채워 주세요)
  // ---------------------------------------------------------
  // 배포 시 config.js(.env 의 SITE_URL, RSVP_FORM_URL)에서 주입됨
  const CFG             = window.APP_CONFIG || {};
  const RSVP_FORM_URL   = CFG.rsvpFormUrl || '';
  const SHARE_URL       = () => CFG.siteUrl || location.href.split('#')[0];
  const SHARE_TITLE     = '이상엽 ♡ 주수현 결혼합니다';
  const SHARE_DESC      = '2027년 3월 1일 월요일 오후 12시 30분\n선릉 르비르모어 클리타홀';
  const TARGET_DATE     = { y: 2027, m: 3, d: 1 };   // 예식일
  const AUTOPLAY_MS     = 4500;

  // ---------------------------------------------------------
  // 헬퍼
  // ---------------------------------------------------------
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = () => reducedMotion.matches;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const haptic = (n) => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };

  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => { t.hidden = true; }, 520);
    }, 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e2) { return false; }
    }
  }

  // ---------------------------------------------------------
  // 1. 스크롤 리빌
  // ---------------------------------------------------------
  function setupReveal() {
    const targets = $$('.reveal');
    if (!targets.length) return;
    if (isReduced() || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));
  }

  // ---------------------------------------------------------
  // 2. 꽃잎이 흩날리는 배경
  // ---------------------------------------------------------
  function setupPetals() {
    if (isReduced()) return;
    const canvas = $('.bg-petals');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const COLORS = ['#E9CFD4', '#EBD3D8', '#E3E3E3', '#D9D9D9'];
    let W = 0, H = 0, petals = [], count = 24, running = true;
    let frames = 0, measureStart = 0;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Petal {
      constructor(init) { this.reset(init); }
      reset(init) {
        this.baseX = Math.random() * W;
        this.x = this.baseX;
        this.y = init ? Math.random() * H : -30;
        this.size = 7 + Math.random() * 8;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.dur = 14000 + Math.random() * 8000;
        this.start = performance.now() - (init ? Math.random() * this.dur : 0);
        this.swayAmp = 20 + Math.random() * 24;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.opacity = 0.35 + Math.random() * 0.3;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      step(now) {
        const t = (now - this.start) / this.dur;
        if (t > 1) { this.reset(false); return; }
        this.y = -30 + (H + 60) * t;
        this.x = this.baseX + Math.sin(now / 1000 + this.swayPhase) * this.swayAmp;
        this.rot += this.rotSpeed;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.42, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const spawn = () => { petals = Array.from({ length: count }, () => new Petal(true)); };

    function loop(now) {
      if (running) {
        ctx.clearRect(0, 0, W, H);
        for (const p of petals) { p.step(now); p.draw(); }
        frames++;
        if (!measureStart) measureStart = now;
        if (now - measureStart > 5000) {
          const fps = (frames / (now - measureStart)) * 1000;
          if (fps < 50 && count > 12) { count = 12; spawn(); }
          measureStart = 0; frames = 0;
        }
      }
      requestAnimationFrame(loop);
    }

    resize(); spawn();
    requestAnimationFrame(loop);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      running = document.visibilityState !== 'hidden';
    });
  }

  // ---------------------------------------------------------
  // 3. 캘린더 + D-day
  // ---------------------------------------------------------
  function setupCalendar() {
    const body = $('#calendar-body');
    if (!body) return;
    const { y, m, d } = TARGET_DATE;
    const first = new Date(y, m - 1, 1).getDay();
    const last = new Date(y, m, 0).getDate();

    let html = '<tr>';
    for (let i = 0; i < first; i++) html += '<td></td>';
    for (let day = 1; day <= last; day++) {
      const dow = (first + day - 1) % 7;
      const cls = [];
      if (dow === 0) cls.push('sun');
      if (dow === 6) cls.push('sat');
      if (day === d) cls.push('is-target');
      html += `<td${cls.length ? ` class="${cls.join(' ')}"` : ''}>${day}</td>`;
      if ((first + day) % 7 === 0 && day !== last) html += '</tr><tr>';
    }
    const tail = (first + last) % 7;
    if (tail) for (let i = tail; i < 7; i++) html += '<td></td>';
    body.innerHTML = html + '</tr>';

    const out = $('#dday-text');
    if (!out) return;
    const render = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diff = Math.round((new Date(y, m - 1, d) - today) / 86400000);
      if (diff > 0) out.textContent = `D-${diff}`;
      else if (diff === 0) out.textContent = 'D-day · 오늘 결혼합니다';
      else out.textContent = `D+${-diff}`;
    };
    render();
    // 페이지를 열어 둔 채 날짜가 바뀌거나 다시 돌아왔을 때 오늘 기준으로 갱신
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    setInterval(render, 60 * 1000);
  }

  // ---------------------------------------------------------
  // 4. 사진 슬라이더 (스와이프 · 화살표 · 점 · 자동재생)
  // ---------------------------------------------------------
  let slider = null;
  function setupSlider() {
    const viewport = $('#slider-viewport');
    const track = $('#slider-track');
    if (!viewport || !track) return;
    const slides = $$('.slide', track);
    const N = slides.length;
    if (!N) return;
    const dotsWrap = $('#slider-dots');
    const countEl = $('#slider-count');
    let idx = 0, startX = 0, dx = 0, dragging = false, moved = false;
    let auto = null, inView = false, userPaused = false, resumeTimer = null;

    const many = N > 8;
    let bar = null;
    if (many) {
      dotsWrap.innerHTML = '<div class="slider-progress"><span></span></div>';
      bar = $('span', dotsWrap);
    }
    const dots = many ? [] : slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slider-dot';
      b.setAttribute('aria-label', `사진 ${i + 1}로 이동`);
      b.addEventListener('click', () => { go(i); pause(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      idx = ((i % N) + N) % N;
      track.style.transform = `translateX(${-idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('is-active', k === idx));
      slides.forEach((s, k) => {
        s.setAttribute('aria-label', `${k + 1} / ${N}`);
        s.setAttribute('aria-hidden', k === idx ? 'false' : 'true');
        const btn = $('.slide-btn', s);
        if (btn) btn.tabIndex = k === idx ? 0 : -1;
      });
      if (countEl) countEl.textContent = `${idx + 1} / ${N}`;
      if (bar) bar.style.width = `${((idx + 1) / N) * 100}%`;
    }

    function startAuto() {
      if (isReduced() || userPaused || !inView || N < 2) return;
      stopAuto();
      auto = setInterval(() => go(idx + 1), AUTOPLAY_MS);
    }
    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
    function pause(ms = 8000) {
      userPaused = true; stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { userPaused = false; startAuto(); }, ms);
    }

    // 포인터(터치 · 마우스) 드래그
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('.slider-nav')) return;
      dragging = true; moved = false; startX = e.clientX; dx = 0;
      track.classList.add('is-dragging');
      stopAuto();
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        moved = true;
        if (!viewport.hasPointerCapture(e.pointerId)) viewport.setPointerCapture(e.pointerId);
      }
      if (moved) track.style.transform = `translateX(calc(${-idx * 100}% + ${dx}px))`;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const th = Math.max(50, viewport.clientWidth * 0.15);
      if (dx <= -th) { go(idx + 1); haptic(8); }
      else if (dx >= th) { go(idx - 1); haptic(8); }
      else go(idx);
      pause();
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // 화살표 · 키보드
    $('#slider-prev')?.addEventListener('click', () => { go(idx - 1); haptic(8); pause(); });
    $('#slider-next')?.addEventListener('click', () => { go(idx + 1); haptic(8); pause(); });
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(idx - 1); pause(); }
      if (e.key === 'ArrowRight') { go(idx + 1); pause(); }
    });

    // 사진 탭 → 라이트박스 (스와이프 직후 클릭은 무시)
    slides.forEach((s, i) => {
      $('.slide-btn', s)?.addEventListener('click', () => {
        if (moved) { moved = false; return; }
        openLightbox(i);
      });
    });

    // 화면에 보일 때만 자동재생
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        inView = en.isIntersecting;
        inView ? startAuto() : stopAuto();
      }, { threshold: 0.4 }).observe(viewport);
    }
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);

    go(0);
    slider = { go, get index() { return idx; }, count: N, slides };
  }

  // ---------------------------------------------------------
  // 5. 라이트박스 (좌우 이동 · 스와이프)
  // ---------------------------------------------------------
  let lb = null;
  function openLightbox(i) { if (lb) lb.open(i); }

  function setupLightbox() {
    const box = $('#lightbox');
    const img = $('#lightbox-img');
    const closeBtn = $('#lightbox-close');
    const countEl = $('#lightbox-count');
    if (!box || !img || !closeBtn || !slider) return;
    const srcs = slider.slides.map(s => $('img', s));
    const N = slider.count;
    let cur = 0, prevFocus = null, tx = 0, ty = 0;

    function show(i) {
      cur = ((i % N) + N) % N;
      img.src = srcs[cur].currentSrc || srcs[cur].src;
      img.alt = srcs[cur].alt || '';
      if (countEl) countEl.textContent = `${cur + 1} / ${N}`;
    }
    function open(i) {
      show(i);
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      prevFocus = document.activeElement;
      closeBtn.focus();
      haptic(12);
    }
    function close() {
      box.classList.remove('is-open');
      setTimeout(() => {
        box.hidden = true;
        document.body.style.overflow = '';
        slider.go(cur);
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      }, isReduced() ? 0 : 220);
    }

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    $('#lightbox-prev')?.addEventListener('click', () => show(cur - 1));
    $('#lightbox-next')?.addEventListener('click', () => show(cur + 1));
    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });

    // 한 손가락 스와이프로 이전/다음 (핀치 확대 중에는 무시)
    box.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { tx = null; return; }
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (tx === null || e.changedTouches.length !== 1) return;
      const ddx = e.changedTouches[0].clientX - tx;
      const ddy = e.changedTouches[0].clientY - ty;
      const zoomed = window.visualViewport && window.visualViewport.scale > 1.05;
      if (!zoomed && Math.abs(ddx) > 60 && Math.abs(ddx) > Math.abs(ddy) * 1.5) {
        show(ddx < 0 ? cur + 1 : cur - 1);
        haptic(8);
      }
      tx = null;
    });

    lb = { open };
  }

  // ---------------------------------------------------------
  // 6. 계좌 복사
  // ---------------------------------------------------------
  function setupCopy() {
    $$('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await copyText(btn.dataset.copy || '');
        if (ok) {
          btn.classList.add('is-copied');
          haptic(15);
          showToast('계좌번호가 복사되었습니다');
          setTimeout(() => btn.classList.remove('is-copied'), 1400);
        } else {
          showToast('복사에 실패했습니다. 직접 선택해 주세요');
        }
      });
    });
  }

  // ---------------------------------------------------------
  // 7. 음악
  // ---------------------------------------------------------
  function setupMusic() {
    const btn = $('#music-toggle');
    const audio = $('#bgm');
    if (!btn || !audio) return;
    audio.volume = 0;

    function fade(target, dur) {
      const from = audio.volume, t0 = performance.now();
      (function tick(now) {
        const t = Math.min(1, (now - t0) / dur);
        audio.volume = from + (target - from) * t;
        if (t < 1) requestAnimationFrame(tick);
        else if (target === 0) audio.pause();
      })(t0);
    }

    btn.addEventListener('click', async () => {
      haptic(10);
      try {
        if (audio.paused) {
          await audio.play();
          btn.setAttribute('aria-pressed', 'true');
          fade(0.4, 1500);
        } else {
          fade(0, 600);
          btn.setAttribute('aria-pressed', 'false');
        }
      } catch (e) {
        showToast('음원을 재생할 수 없습니다');
      }
    });
  }

  // ---------------------------------------------------------
  // 8. 공유 · 링크 복사 · RSVP
  // ---------------------------------------------------------
  function setupShare() {
    $('#link-copy-btn')?.addEventListener('click', async () => {
      const ok = await copyText(SHARE_URL());
      showToast(ok ? '청첩장 링크가 복사되었습니다' : '복사에 실패했습니다');
    });

    $('#share-btn')?.addEventListener('click', async () => {
      haptic(15);
      if (navigator.share) {
        try { await navigator.share({ title: SHARE_TITLE, text: SHARE_DESC, url: SHARE_URL() }); } catch (e) {}
        return;
      }
      const ok = await copyText(SHARE_URL());
      showToast(ok ? '청첩장 링크가 복사되었습니다' : '복사에 실패했습니다');
    });

    const rsvp = $('[data-placeholder="rsvp"]');
    if (rsvp) {
      if (RSVP_FORM_URL) {
        rsvp.href = RSVP_FORM_URL;
        rsvp.target = '_blank';
        rsvp.rel = 'noopener';
      } else {
        rsvp.addEventListener('click', (e) => {
          e.preventDefault();
          showToast('참석 의사 폼은 준비 중입니다');
        });
      }
    }
  }

  // ---------------------------------------------------------
  // 9. 지도 이미지 → 네이버 지도 (새 탭이 막히면 현재 탭으로 이동)
  // ---------------------------------------------------------
  function setupMap() {
    const link = $('#map-link');
    if (!link) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const w = window.open(link.href, '_blank');
      if (w) { try { w.opener = null; } catch (err) {} }
      else location.href = link.href;
    });
  }

  // ---------------------------------------------------------
  function init() {
    setupMap();
    setupReveal();
    setupPetals();
    setupCalendar();
    setupSlider();
    setupLightbox();
    setupCopy();
    setupMusic();
    setupShare();
    const onChange = () => location.reload();
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onChange);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
