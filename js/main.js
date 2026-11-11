/* MissReno website. Shared script. No dependencies.
   Everything here is progressive: the pages read and work without it. */
(function () {
  'use strict';

  /* ---- Settings (edit here) ---- */
  var CONFIG = {
    whatsapp: '60128350133',   // international format, no plus sign
    showPrices: false,         // set true to reveal the "from RM__" lines on style cards, once MissReno agrees
    open: { days: [1, 2, 3, 4, 5, 6], from: 8.5, to: 17 }   // showroom hours in Kota Kinabalu time (1 = Monday). Public holidays are not handled.
  };

  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function waLink(text) { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text); }
  root.classList.remove('no-js');
  root.classList.add('js');

  /* ---- Mobile menu ---- */
  var drawer = $('#drawer'), openBtn = $('#menuOpen'), closeBtn = $('#menuClose');
  function setMenu(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.style.overflow = open ? 'hidden' : '';
    d.body.classList.toggle('menu-open', open);
    (open ? closeBtn : openBtn).focus();
  }
  if (drawer && openBtn && closeBtn) {
    openBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) setMenu(false); });
    d.addEventListener('click', function (e) { if (drawer.classList.contains('open') && !drawer.contains(e.target) && !openBtn.contains(e.target)) setMenu(false); });
  }

  /* ---- Scroll: header firms up after the top; hero photo drifts ---- */
  var hdr = $('#hdr'), media = $('.hero-media');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('solid', y > 40);
    if (media && !reduce && y < innerHeight * 1.2) media.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- Hero: video fade-in and pause control ---- */
  var pause = $('#pause'), heroImg = $('.hero-media img'), heroVid = $('.hero-media video');
  if (heroVid) {
    var ready = function () { heroVid.classList.add('ready'); };
    if (heroVid.readyState >= 3) ready(); else heroVid.addEventListener('canplay', ready);
  }
  if (pause) {
    var paused = reduce;
    var apply = function () {
      if (heroImg) heroImg.style.animationPlayState = paused ? 'paused' : 'running';
      if (heroVid) { paused ? heroVid.pause() : heroVid.play().catch(function () {}); }
      pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pause.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
      var u = pause.querySelector('use'); if (u) u.setAttribute('href', paused ? '#i-play' : '#i-pause');
    };
    pause.addEventListener('click', function () { paused = !paused; apply(); });
    if (reduce) apply();
  }

  /* ---- "Open now" chip, worked out in Kota Kinabalu time ---- */
  var chip = $('#openChip'), chipText = $('#openText');
  if (chip && chipText && window.Intl) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
      var names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var day = names.indexOf(get('weekday')), now = (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60;
      var o = CONFIG.open, isDay = function (n) { return o.days.indexOf(n) !== -1; };
      if (day >= 0) {
        if (isDay(day) && now >= o.from && now < o.to) {
          chip.classList.add('open');
          chipText.textContent = 'Showroom open now, until 5:00 PM';
        } else if (isDay(day) && now < o.from) {
          chipText.textContent = 'Showroom opens today at 8:30 AM';
        } else {
          var n = 1; while (n < 8 && !isDay((day + n) % 7)) n++;
          chipText.textContent = 'Showroom opens ' + (n === 1 ? 'tomorrow' : names[(day + n) % 7]) + ' at 8:30 AM';
        }
      }
    } catch (e) { /* keep the default text */ }
  }

  /* ---- Scroll reveal and counters ---- */
  function count(el) {
    var t = parseFloat(el.getAttribute('data-count'));
    if (reduce || !t) return;
    var start = null;
    function f(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1400, 1);
      el.textContent = Math.round(t * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(f);
    }
    el.textContent = '0';
    requestAnimationFrame(f);
  }
  var targets = $$('.rv-up, .rv-img, .steps, #stats');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }
  $$('[data-stagger]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 80) + 'ms'; });
  });
  /* drop the stagger delay once shown, so hover effects answer at once */
  $$('[data-stagger] > *').forEach(function (c) {
    c.addEventListener('transitionend', function once(e) { if (e.propertyName === 'opacity') { c.style.transitionDelay = ''; c.removeEventListener('transitionend', once); } });
  });

  /* ---- Statement: words light up as you scroll through it ---- */
  $$('[data-words]').forEach(function (el) {
    if (reduce) return;
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    var words = el.innerHTML.trim().split(/ +/);
    el.setAttribute('aria-label', label);
    el.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    var spans = $$('.w', el), raf = false;
    function paint() {
      raf = false;
      var r = el.getBoundingClientRect(), vh = innerHeight;
      var p = (vh * 0.88 - r.top) / (vh * 0.5 + r.height);
      var n = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
    }
    addEventListener('scroll', function () { if (!raf) { raf = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('resize', paint);
    paint();
  });

  /* ---- Logo rows scroll slowly; hover to pause ---- */
  $$('[data-marquee]').forEach(function (m) {
    var ul = $('ul', m);
    if (!ul || reduce) return;
    $$('li', ul).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c); });
    m.classList.add('run');
  });

  /* ---- Glass cards: a soft light follows the pointer ---- */
  if (finePointer) {
    $$('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---- How it works: steps play one after another; a click takes over ---- */
  $$('[data-flow]').forEach(function (flow) {
    var steps = $$('.flow-step', flow), figs = $$('.flow-view figure', flow);
    var cur = 0, timer = null, TIME = 5000, userTook = false, visible = false;
    flow.style.setProperty('--flow-time', TIME + 'ms');
    function show(i) {
      cur = (i + steps.length) % steps.length;
      steps.forEach(function (b, n) { b.setAttribute('aria-pressed', n === cur ? 'true' : 'false'); });
      figs.forEach(function (f, n) { f.classList.toggle('on', n === cur); });
    }
    function stop() { clearInterval(timer); timer = null; flow.classList.remove('auto'); }
    function play() {
      if (reduce || userTook || timer || !visible) return;
      flow.classList.add('auto');
      show(cur);
      timer = setInterval(function () { show(cur + 1); }, TIME);
    }
    steps.forEach(function (b, n) {
      b.addEventListener('click', function () { userTook = true; stop(); show(n); });
    });
    flow.addEventListener('mouseenter', stop);
    flow.addEventListener('mouseleave', play);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) play(); else stop(); }, { threshold: 0.35 }).observe(flow);
    }
  });

  /* ---- Who we help: the panel under the pointer (or the one tapped or focused) opens ---- */
  $$('[data-panels]').forEach(function (wrap) {
    var ps = $$('.panel', wrap);
    function open(p) { ps.forEach(function (x) { x.classList.toggle('on', x === p); }); }
    ps.forEach(function (p) {
      if (finePointer) p.addEventListener('mouseenter', function () { open(p); });
      p.addEventListener('focus', function () { open(p); });
      p.addEventListener('click', function () { open(p); });
    });
  });

  /* ---- Range photos: arrows move one photo; swiping works too; the dots follow ---- */
  $$('[data-slider]').forEach(function (sl) {
    var track = $('.slides', sl), dots = $$('.dots i', sl), n = track.children.length;
    function index() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) { track.scrollTo({ left: ((i + n) % n) * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); }
    $('.sl-prev', sl).addEventListener('click', function () { go(index() - 1); });
    $('.sl-next', sl).addEventListener('click', function () { go(index() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
    });
    var t;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () { var i = index(); dots.forEach(function (d, k) { d.classList.toggle('on', k === i); }); }, 60);
    }, { passive: true });
  });

  /* ---- Product ranges: a coverflow. The centre card opens the range in a sheet on the same page ---- */
  var cf = $('[data-cflow]:not([data-link])'), modal = $('#rmodal');
  var openRange = function () {}, closeRange = function () {};
  if (modal) {
    var panels = $$('.rpanel', modal), tabs = $$('.rm-tab', modal), sheet = $('.rm-sheet', modal), lastTrigger = null, current = 0;
    var setPanel = function (i) {
      current = (i + panels.length) % panels.length;
      panels.forEach(function (p, k) { p.classList.toggle('on', k === current); });
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === current); });
      var tr = $('.slides', panels[current]); if (tr) tr.scrollLeft = 0;
      $$('.dots i', panels[current]).forEach(function (dt, k) { dt.classList.toggle('on', k === 0); });
      sheet.scrollTop = 0;
      if (cf && cf.goTo) cf.goTo(current);
    };
    openRange = function (i, keepHash) {
      setPanel(i);
      modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
      d.body.classList.add('rm-lock');
      if (!keepHash && history.replaceState) history.replaceState(null, '', '#' + panels[current].id);
      var c = $('.rm-close', modal); if (c) c.focus();
    };
    closeRange = function () {
      if (!modal.classList.contains('open')) return;
      modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
      d.body.classList.remove('rm-lock');
      if (history.replaceState && location.hash.indexOf('#range-') === 0) history.replaceState(null, '', location.pathname + location.search + '#ranges');
      if (lastTrigger) lastTrigger.focus();
    };
    $$('[data-close]', modal).forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); closeRange(); }); });
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { setPanel(k); if (history.replaceState) history.replaceState(null, '', '#' + panels[k].id); }); });
    addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeRange();
      else if (e.key === 'ArrowRight' && e.target.tagName !== 'INPUT') { setPanel(current + 1); }
      else if (e.key === 'ArrowLeft' && e.target.tagName !== 'INPUT') { setPanel(current - 1); }
      else if (e.key === 'Tab') {   /* keep focus inside the sheet */
        var f = $$('a[href],button:not([disabled]),[tabindex="0"]', sheet).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var fromHash = function () {
      var h = location.hash.replace('#', '');
      var k = panels.map(function (p) { return p.id; }).indexOf(h);
      if (k > -1) openRange(k, true); else if (modal.classList.contains('open')) closeRange();
    };
    addEventListener('hashchange', fromHash);
    if (location.hash.indexOf('#range-') === 0) fromHash();
  }
  $$('[data-cflow]').forEach(function (cf) {
    var sec = cf.closest('section') || d;
    var stage = $('.cf-stage', cf), cards = $$('.cf-card', stage), n = cards.length, act = 0;
    var info = $('.cf-info', sec), title = $('.cf-title', sec), desc = $('.cf-desc', sec), dots = $$('.cf-dots button', sec);
    var layout = function () {
      var w = cards[0].offsetWidth;
      var linear = cf.hasAttribute('data-link');
      cards.forEach(function (c, i) {
        var o = linear ? i - act : ((i - act) % n + n) % n; if (!linear && o > n / 2) o -= n;
        var a = Math.abs(o), sgn = o < 0 ? -1 : 1;
        var x = a === 0 ? 0 : a === 1 ? 0.8 * w : a === 2 ? 1.42 * w : 1.8 * w;
        var sc = a === 0 ? 1 : a === 1 ? 0.86 : a === 2 ? 0.74 : 0.6;
        var ry = a === 0 ? 0 : a === 1 ? 16 : a === 2 ? 26 : 30;
        c.style.transform = 'translate3d(' + (sgn * x).toFixed(1) + 'px,0,' + (-a * 70) + 'px) rotateY(' + (sgn * ry * -1) + 'deg) scale(' + sc + ')';
        c.style.zIndex = String(20 - a);
        var hid = a > (linear ? 3 : 2);
        c.style.opacity = hid ? '0' : '1';
        c.style.pointerEvents = hid ? 'none' : '';
        c.tabIndex = a === 0 ? 0 : -1;
        c.classList.toggle('is-active', a === 0);
        c.setAttribute('aria-hidden', hid ? 'true' : 'false');
      });
      if (linear) {
        var shift = innerWidth > 760 ? (act - (n - 1 - act)) * 0.22 * w : 0;
        stage.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
        cf.classList.toggle('at-start', act === 0); cf.classList.toggle('at-end', act === n - 1);
      }
      dots.forEach(function (b, k) { b.classList.toggle('on', k === act); });
    };
    var goTo = function (i, quiet) {
      var next = cf.hasAttribute('data-link') ? Math.max(0, Math.min(n - 1, i)) : (i + n) % n;
      if (next === act && quiet !== 'force') return;
      act = next; layout();
      if (info && title && desc) {
        info.classList.add('swap');
        setTimeout(function () { title.textContent = cards[act].getAttribute('data-title'); desc.textContent = cards[act].getAttribute('data-desc'); info.classList.remove('swap'); }, reduce ? 0 : 220);
      }
    };
    cf.goTo = function (i) { goTo(i); };
    cf.querySelector('.cf-prev').addEventListener('click', function () { goTo(act - 1); });
    cf.querySelector('.cf-next').addEventListener('click', function () { goTo(act + 1); });
    dots.forEach(function (b, k) { b.addEventListener('click', function () { goTo(k); }); });
    cf.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(act + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(act - 1); }
    });
    cards.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        if (dragged) return;
        if (i === act) { if (cf.hasAttribute('data-link')) { location.href = c.getAttribute('href'); } else { lastTrigger = c; openRange(i); } } else goTo(i);
      });
      c.addEventListener('focus', function () { if (i !== act) goTo(i); });
      c.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
    /* drag or swipe */
    var sx = 0, sy = 0, down = false, dragged = false;
    stage.addEventListener('pointerdown', function (e) { down = true; dragged = false; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - sy)) { down = false; dragged = true; goTo(dx < 0 ? act + 1 : act - 1); setTimeout(function () { dragged = false; }, 350); }
    });
    addEventListener('pointerup', function () { down = false; });
    addEventListener('resize', layout);
    layout();
  });
  /* the sheet's own photo sliders (set up above) need no extra code */

  /* ---- Filters (projects page, styles) ---- */
  $$('[data-filter-group]').forEach(function (group) {
    var buttons = $$('button', group);
    var items = $$(group.getAttribute('data-filter-group'));
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        var run = function () {
          buttons.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          items.forEach(function (it) {
            var cats = (it.getAttribute('data-cat') || '').split(' ');
            it.classList.toggle('hide', f !== 'all' && cats.indexOf(f) === -1);
            it.classList.add('in');
          });
        };
        if (d.startViewTransition && !reduce) d.startViewTransition(run); else run();
      });
    });
  });

  /* ---- Price lines on style cards (hidden until showPrices is true) ---- */
  if (CONFIG.showPrices) $$('.price').forEach(function (p) { p.classList.remove('hide'); });

  /* ---- FAQ: smooth open and close ---- */
  $$('details').forEach(function (dt) {
    var s = $('summary', dt), a = $('.ans', dt);
    if (!s || !a || reduce || !a.animate) return;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (dt.open) {
        var h = a.offsetHeight;
        var an = a.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)' });
        an.onfinish = function () { dt.open = false; };
      } else {
        dt.open = true;
        var h2 = a.offsetHeight;
        a.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });

  /* ---- Contact form: builds a WhatsApp message (no server needed) ---- */
  var form = $('#waForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements['name'].value.trim();
      var phone = form.elements['phone'].value.trim();
      var kind = (form.querySelector('input[name=kind]:checked') || {}).value || '';
      var err = $('#formErr');
      if (!name || !phone) { err.textContent = 'Please add your name and WhatsApp number.'; return; }
      if (!/^[+0-9 ()-]{8,}$/.test(phone)) { err.textContent = 'Please check your WhatsApp number.'; return; }
      err.textContent = '';
      var msg = 'Hi MissReno, I am ' + name + '. I would like a quote for ' + (kind ? kind.toLowerCase() : 'a wall or ceiling upgrade') + '. My WhatsApp number is ' + phone + '. I will send a photo of my space here.';
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }

  /* ---- Before and after slider (optional, see README) ---- */
  $$('.ba').forEach(function (ba) {
    var input = $('input', ba);
    if (!input) return;
    var set = function () { ba.style.setProperty('--pos', input.value + '%'); };
    input.addEventListener('input', set);
    set();
  });

  /* ---- Footer year ---- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
