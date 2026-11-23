/* =========================================================
   모바일 청첩장 — script.js
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
  // 신랑·신부 이름은 빌드 시 환경변수(GROOM_NAME, BRIDE_NAME)에서 주입됨
  const NAMES           = {
    groom: (CFG.names && CFG.names.groom) || '신랑',
    bride: (CFG.names && CFG.names.bride) || '신부'
  };
  const SHARE_TITLE     = `${NAMES.groom} ♡ ${NAMES.bride} 결혼합니다`;
  const SHARE_DESC      = '2027년 3월 1일 월요일 오후 12시 30분\n선릉 르비르모어 클리타홀';
  const TARGET_DATE     = { y: 2027, m: 3, d: 1 };   // 예식일
  const AUTOPLAY_MS     = 4500;
  // 공휴일 표시 (빨간색 + 굵기 + 범례 텍스트로 병행)
  const HOLIDAYS        = { '2027-03-01': '삼일절' };
  // 캘린더 저장용 일정 (예식 시작 12:30, 소요 2시간으로 가정 — 필요 시 수정)
  const EVENT = {
    title:    `${NAMES.groom} ♡ ${NAMES.bride} 결혼식`,
    start:    '20270301T123000',
    end:      '20270301T143000',
    location: '선릉 르비르모어 클리타홀 (서울 강남구 테헤란로 406 샹제리제센터 A동 2층)',
    details:  '2027년 3월 1일 월요일 오후 12시 30분'
  };
  // 참석 의사 · 방명록 재전송 간격 (스팸 방지)
  const SUBMIT_GAP_MS   = 30 * 1000;

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
    // 고정 범위: 예식일이 들어 있는 주(일요일 시작)를 정중앙 줄에 두고 앞뒤 2주씩 → 2/14(일) ~ 3/20(토), 5주
    const pad = (n) => String(n).padStart(2, '0');
    const target = new Date(y, m - 1, d);
    const start = new Date(target);
    start.setDate(target.getDate() - target.getDay() - 14);
    const targetKey = `${y}-${pad(m)}-${pad(d)}`;
    const WEEKS = 5;
    let html = '';
    for (let w = 0; w < WEEKS; w++) {
      html += '<tr>';
      for (let k = 0; k < 7; k++) {
        const cur = new Date(start);
        cur.setDate(start.getDate() + w * 7 + k);
        const key = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
        const cls = [];
        if (k === 0) cls.push('sun');
        if (k === 6) cls.push('sat');
        if (cur.getMonth() !== m - 1) cls.push('other');
        if (HOLIDAYS[key]) cls.push('holiday');
        if (key === targetKey) cls.push('is-target');
        const title = HOLIDAYS[key] ? ` title="${HOLIDAYS[key]}"` : '';
        html += `<td${cls.length ? ` class="${cls.join(' ')}"` : ''}${title}>${cur.getDate()}</td>`;
      }
      html += '</tr>';
    }
    body.innerHTML = html;

    setupSaveDate();

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

  // 캘린더 저장: 구글 캘린더 링크 + ics 파일
  function setupSaveDate() {
    const gLink = $('#cal-google');
    if (gLink) {
      const q = new URLSearchParams({
        action: 'TEMPLATE',
        text: EVENT.title,
        dates: `${EVENT.start}/${EVENT.end}`,
        ctz: 'Asia/Seoul',
        location: EVENT.location,
        details: EVENT.details
      });
      gLink.href = `https://calendar.google.com/calendar/render?${q.toString()}`;
    }
    $('#cal-ics')?.addEventListener('click', () => {
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const esc = (s) => s.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ourwedding//wedding-invitation//KO',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:wedding-${EVENT.start}@ourwedding`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${EVENT.start}`,   // floating(현지) 시간: 한국에서 보는 기기 기준
        `DTEND:${EVENT.end}`,
        `SUMMARY:${esc(EVENT.title)}`,
        `LOCATION:${esc(EVENT.location)}`,
        `DESCRIPTION:${esc(EVENT.details)}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding-2027-03-01.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
      haptic(10);
    });
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
  // 5-1. 갤러리 접기/펼치기 (슬라이드 이미지로 썸네일 그리드를 만든다)
  // ---------------------------------------------------------
  // 3x3(한 페이지 9장) + 페이지네이션. 사진 목록은 슬라이드에서 가져온다.
  function setupGalleryGrid() {
    const toggle = $('#gallery-toggle');
    const expand = $('#gallery-expand');
    const grid = $('#gallery-grid');
    const pager = $('#grid-pager');
    if (!toggle || !expand || !grid || !pager || !slider) return;

    const PER_PAGE = 9;
    const items = slider.slides.map((s, i) => ({ i, src: $('img', s).getAttribute('src') }));
    const pages = Math.ceil(items.length / PER_PAGE);
    const label = `전체 사진 펼쳐 보기 (${items.length}장)`;
    let page = 0;
    toggle.textContent = label;

    function renderPage(p) {
      page = Math.min(Math.max(p, 0), pages - 1);
      const start = page * PER_PAGE;
      grid.innerHTML = items.slice(start, start + PER_PAGE).map((it) =>
        `<li><button type="button" data-index="${it.i}" aria-label="사진 ${it.i + 1} 크게 보기"><img src="${it.src}" alt="" loading="lazy" decoding="async"></button></li>`
      ).join('');
      renderPager();
    }

    function renderPager() {
      if (pages <= 1) { pager.innerHTML = ''; return; }
      const btn = (label, p, attrs = '') =>
        `<button type="button" data-page="${p}" ${attrs}>${label}</button>`;
      let html = btn('‹ 이전', page - 1, page === 0 ? 'disabled aria-label="이전 페이지 없음"' : 'aria-label="이전 페이지"');
      for (let p = 0; p < pages; p++) {
        html += btn(String(p + 1), p, p === page ? 'aria-current="page" aria-label="현재 페이지 ' + (p + 1) + '"' : `aria-label="${p + 1}페이지"`);
      }
      html += btn('다음 ›', page + 1, page === pages - 1 ? 'disabled aria-label="다음 페이지 없음"' : 'aria-label="다음 페이지"');
      pager.innerHTML = html;
    }

    // 사진 탭 → 라이트박스 (슬라이드 인덱스 기준)
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-index]');
      if (b) openLightbox(Number(b.dataset.index));
    });

    // 페이지 번호 · 이전/다음
    pager.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-page]');
      if (!b || b.disabled) return;
      renderPage(Number(b.dataset.page));
      haptic(6);
      expand.scrollIntoView({ block: 'nearest', behavior: isReduced() ? 'auto' : 'smooth' });
    });

    toggle.addEventListener('click', () => {
      const open = expand.hidden;
      if (open) renderPage(page);
      expand.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '접기' : label;
      haptic(8);
    });
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

  }

  // ---------------------------------------------------------
  // 8-1. 참석 의사(RSVP) · 방명록 폼 → Apps Script 웹앱 (scripts/apps-script/Code.gs)
  //  - 응답은 no-cors 로 보내므로 성공 여부를 읽을 수 없음 → 전송 완료 기준으로 안내
  //  - 숨은 입력칸(website)이 채워지면 전송하지 않음 (스팸 방지)
  //  - 같은 기기에서 SUBMIT_GAP_MS 안에 재전송 불가
  // ---------------------------------------------------------
  function setupForms() {
    const endpoint = RSVP_FORM_URL;
    const sanitize = (s) => String(s || '').trim();

    function gapLeft(key) {
      try {
        const last = Number(localStorage.getItem(key) || 0);
        return SUBMIT_GAP_MS - (Date.now() - last);
      } catch (e) { return 0; }
    }
    function markSubmitted(key) {
      try { localStorage.setItem(key, String(Date.now())); } catch (e) {}
    }

    async function send(payload) {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    }

    function bindForm({ form, type, status, submit, key, validate, build, doneMsg }) {
      if (!form) return;
      const btn = submit;
      if (!endpoint) {
        btn.disabled = true;
        status.textContent = '';
        // status.textContent = '참석 의사 접수는 준비 중입니다.';
        status.classList.remove('is-error');
        return;
      }
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        if (fd.get('website')) return; // 봇 차단: 아무 응답 없이 종료
        const err = validate(fd);
        if (err) {
          status.textContent = err;
          status.classList.add('is-error');
          return;
        }
        const wait = gapLeft(key);
        if (wait > 0) {
          status.textContent = `잠시 후 다시 보내 주세요 (${Math.ceil(wait / 1000)}초)`;
          status.classList.add('is-error');
          return;
        }
        btn.disabled = true;
        status.classList.remove('is-error');
        status.textContent = '전송 중입니다…';
        try {
          await send({ type, ...build(fd), ts: new Date().toISOString() });
          markSubmitted(key);
          status.textContent = doneMsg;
          form.reset();
          if (type === 'guestbook') {
            updateGbCount();
            setTimeout(loadGuestbookList, 1500); // 서버 저장 반영 시간 여유
          }
        } catch (e2) {
          status.textContent = '전송에 실패했습니다. 네트워크를 확인하고 다시 시도해 주세요.';
          status.classList.add('is-error');
        } finally {
          btn.disabled = false;
        }
      });
    }

    bindForm({
      form: $('#rsvp-form'),
      type: 'rsvp',
      status: $('#rsvp-status'),
      submit: $('#rsvp-submit'),
      key: 'wl_last_rsvp',
      validate: (fd) => (sanitize(fd.get('name')) ? '' : '성함을 입력해 주세요.'),
      build: (fd) => ({
        name: sanitize(fd.get('name')).slice(0, 20),
        attend: fd.get('attend') || '참석',
        guests: Number(fd.get('guests')) || 0,
        meal: fd.get('meal') || '예'
      }),
      doneMsg: '전달되었습니다. 감사합니다.'
    });

    const gbText = $('#gb-form textarea');
    function updateGbCount() {
      const c = $('#gb-count');
      if (c && gbText) c.textContent = `${gbText.value.length} / 200`;
    }
    gbText?.addEventListener('input', updateGbCount);

    bindForm({
      form: $('#gb-form'),
      type: 'guestbook',
      status: $('#gb-status'),
      submit: $('#gb-submit'),
      key: 'wl_last_guestbook',
      validate: (fd) => {
        if (!sanitize(fd.get('name'))) return '이름을 입력해 주세요.';
        if (!sanitize(fd.get('message'))) return '메시지를 입력해 주세요.';
        return '';
      },
      build: (fd) => ({
        name: sanitize(fd.get('name')).slice(0, 20),
        message: sanitize(fd.get('message')).slice(0, 200),
        publicOk: fd.get('publicOk') === 'yes' ? 'yes' : 'no'
      }),
      doneMsg: '방명록에 남겨 주셔서 감사합니다.'
    });
  }

  // ---------------------------------------------------------
  // 8-2. 공개 동의한 방명록 목록 (Apps Script GET ?action=list) — 고정 높이 스크롤 박스
  // ---------------------------------------------------------
  function loadGuestbookList() {
    const box = $('#gb-list');
    const status = $('#gb-list-status');
    if (!box || !status) return;
    const endpoint = RSVP_FORM_URL;
    if (!endpoint) {
      status.textContent = '메시지 목록은 준비 중입니다.';
      return;
    }
    // 응답이 멈추면 8초 뒤 중단해서 "불러오는 중"이 계속 남지 않게 함
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 8000);
    fetch(endpoint + (endpoint.includes('?') ? '&' : '?') + 'action=list', {
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timer);
        if (!data || !data.ok || !Array.isArray(data.items)) throw new Error('bad_response');
        const items = data.items;
        box.replaceChildren();
        status.classList.remove('is-error');
        if (!items.length) {
          status.textContent = '아직 공개된 메시지가 없습니다.';
          return;
        }
        status.textContent = `총 ${items.length}개의 메시지`;
        for (const it of items) {
          const li = document.createElement('li');
          li.className = 'gb-item';
          const head = document.createElement('div');
          head.className = 'gb-item-head';
          const who = document.createElement('strong');
          who.textContent = it.name || '';
          const when = document.createElement('time');
          when.textContent = it.date || '';
          head.append(who, when);
          const body = document.createElement('p');
          body.textContent = it.message || '';
          li.append(head, body);
          box.appendChild(li);
        }
      })
      .catch((err) => {
        clearTimeout(timer);
        // 개발자 도구 콘솔에서 원인 확인용
        console.warn('[guestbook] 목록 불러오기 실패:', err && err.message);
        status.textContent = '메시지를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
        status.classList.add('is-error');
      });
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
    setupGalleryGrid();
    setupCopy();
    setupMusic();
    setupShare();
    setupForms();
    loadGuestbookList();
    const onChange = () => location.reload();
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onChange);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
