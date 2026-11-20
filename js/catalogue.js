/* MissReno catalogue page: builds the cards from js/catalogue-data.js, opens a large view with the
   specification when a card is tapped, and runs the quantity estimator. No prices are shown anywhere. */
(function () {
  'use strict';
  var data = window.MR_CATALOGUE;
  var d = document;
  var mount = d.getElementById('catalogue');
  if (!data || !mount) return;

  var WA = '60128350133';
  function wa(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* keep the last two words of a line together, so no word sits alone on the last line */
  function tie(s) { s = esc(s); var i = s.lastIndexOf(' '); if (i < 0) return s; var j = s.lastIndexOf(' ', i - 1); s = s.slice(0, i) + '&nbsp;' + s.slice(i + 1); return j < 0 ? s : s.slice(0, j) + '&nbsp;' + s.slice(j + 1); }
  function nums(size) { return (size.match(/[\d.]+/g) || []).map(Number); }
  function sizeHtml(size) { return esc(size).replace(/ × /g, ' &times; ').replace(/ (\S+) mm$/, '&nbsp;$1&nbsp;mm'); }

  var all = [], byCode = {};
  data.ranges.forEach(function (r) { r.items.forEach(function (it) { it.range = r; all.push(it); byCode[it.code] = it; }); });

  /* ---- filters and cards ---- */
  var f = '<div class="filters" role="group" aria-label="Filter by range" data-filter-group=".cat-sec" data-attr="range">' +
    '<button type="button" aria-pressed="true" data-f="all">All <i>' + all.length + '</i></button>' +
    data.ranges.map(function (r) { return '<button type="button" aria-pressed="false" data-f="' + r.id + '">' + esc(r.name) + ' <i>' + r.items.length + '</i></button>'; }).join('') + '</div>';
  var s = data.ranges.map(function (r) {
    return '<section class="cat-sec" id="cat-' + r.id + '" data-cat="' + r.id + '" aria-labelledby="h-' + r.id + '"><div class="cat-head"><div><p class="eyebrow">' + esc(r.type) + '</p><h2 id="h-' + r.id + '">' + esc(r.name) + '</h2></div>' +
      '<ul class="cat-facts">' + r.facts.map(function (x) { return '<li>' + tie(x) + '</li>'; }).join('') + '</ul></div><div class="cgrid">' +
      r.items.map(function (it) {
        return '<button type="button" class="ccard2" data-code="' + it.code + '" aria-haspopup="dialog" aria-label="See design ' + it.code + ', ' + esc(it.finish) + ', larger">' +
          '<span class="sw"><img src="img/catalogue/' + it.code + '.webp" alt="' + esc(r.name) + ' ' + esc(r.type.toLowerCase()) + ', design ' + it.code + ', ' + esc(it.finish) + '" loading="lazy" decoding="async" width="235" height="235"></span>' +
          '<b>' + it.code + '</b><span class="fin">' + esc(it.finish) + '</span><span class="sz">' + sizeHtml(it.size) + '</span></button>';
      }).join('') + '</div></section>';
  }).join('');
  mount.innerHTML = f + s;

  /* ---- large view ---- */
  var hdrWa = d.querySelector('.wa-round'), hdrHref = hdrWa ? hdrWa.getAttribute('href') : '', hdrLabel = hdrWa ? hdrWa.getAttribute('aria-label') : '';
  var box, cur = -1, lastFocus, list = all;
  function visibleList() {
    var on = d.querySelector('[data-filter-group] [aria-pressed="true"]');
    var k = on ? on.getAttribute('data-f') : 'all';
    return k === 'all' ? all : all.filter(function (it) { return it.range.id === k; });
  }
  function build() {
    box = d.createElement('div');
    box.className = 'cview'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'cv-title');
    box.innerHTML = '<div class="cv-card"><button class="cv-x" type="button" aria-label="Close">&times;</button>' +
      '<div class="cv-media"><img alt=""><button class="cv-p" type="button" aria-label="Previous design">&#8249;</button><button class="cv-n" type="button" aria-label="Next design">&#8250;</button></div>' +
      '<div class="cv-body"><p class="eyebrow cv-type"></p><h2 id="cv-title"></h2><p class="cv-about"></p>' +
      '<dl class="cv-spec"></dl><ul class="cat-facts cv-facts"></ul>' +
      '<div class="cv-est"><p class="cv-est-h">Estimate how many you need</p><div class="est-row"><label><span class="cv-l1">Wall width</span><input type="number" inputmode="decimal" min="0.1" step="0.1" placeholder="e.g. 3.5" class="cv-w"><i>m</i></label><label><span class="cv-l2">Wall height</span><input type="number" inputmode="decimal" min="0.1" step="0.1" placeholder="e.g. 2.8" class="cv-h"><i>m</i></label></div><p class="cv-out" aria-live="polite"></p></div>' +
      '<p class="cv-note fine">Estimated quantity only. For more information, contact our team. The green WhatsApp button now mentions this&nbsp;design&nbsp;code.</p>' +
      '<div class="cv-links"><a class="link cv-gal" href="#">See finished projects</a><span class="cv-count fine"></span></div></div></div>';
    d.body.appendChild(box);
    box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('cv-x')) close(); });
    box.querySelector('.cv-p').addEventListener('click', function () { show(cur - 1); });
    box.querySelector('.cv-n').addEventListener('click', function () { show(cur + 1); });
    box.querySelector('.cv-w').addEventListener('input', est);
    box.querySelector('.cv-h').addEventListener('input', est);
    var sx = 0;
    box.querySelector('.cv-media').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.querySelector('.cv-media').addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  }
  function q(sel) { return box.querySelector(sel); }
  function show(i) {
    cur = (i + list.length) % list.length;
    var it = list[cur], r = it.range, n = nums(it.size);
    q('.cv-media img').src = 'img/catalogue/' + it.code + '.webp';
    q('.cv-media img').alt = r.name + ' design ' + it.code + ', ' + it.finish;
    q('.cv-type').textContent = r.type;
    q('#cv-title').innerHTML = esc(r.name) + ' <span>' + it.code + '</span>';
    q('.cv-about').innerHTML = tie(r.about);
    var spec = [['Design code', it.code], ['Finish', it.finish], ['Size', sizeHtml(it.size)]];
    if (n.length >= 2) spec.push(['One ' + r.unit + ' covers', area(n) + ' m&sup2;']);
    spec.push(['Good for', tie(r.use)]);
    q('.cv-spec').innerHTML = spec.map(function (p) { return '<div><dt>' + p[0] + '</dt><dd>' + (p[0] === 'Finish' ? esc(p[1]) : p[1]) + '</dd></div>'; }).join('');
    q('.cv-facts').innerHTML = r.facts.map(function (x) { return '<li>' + tie(x) + '</li>'; }).join('');
    var ceil = r.mode === 'ceiling';
    q('.cv-l1').textContent = ceil ? 'Ceiling width' : 'Wall width';
    q('.cv-l2').textContent = ceil ? 'Ceiling length' : 'Wall height';
    q('.cv-gal').href = r.gallery;
    q('.cv-gal').innerHTML = 'See finished ' + esc(r.name) + '&nbsp;projects';
    q('.cv-media img').scrollIntoView && (box.scrollTop = 0);
    q('.cv-count').textContent = (cur + 1) + ' of ' + list.length;
    est();
    if (hdrWa) {
      hdrWa.href = wa('Hi MissReno, I would like to ask about ' + r.name + ' design ' + it.code + ' (' + it.finish + ', ' + it.size + ').');
      hdrWa.setAttribute('aria-label', 'Ask MissReno about ' + r.name + ' design ' + it.code + ' on WhatsApp');
      hdrWa.classList.add('has-code');
    }
    try { history.replaceState(null, '', '#d-' + it.code); } catch (e) {}
  }
  function area(n) { return (n[0] * n[1] / 1e6).toFixed(n[0] * n[1] < 1e5 ? 3 : 2).replace(/\.?0+$/, ''); }
  /* pieces needed: lay the long side of the piece along the height (or length), round every row and column up to a full piece */
  function count(n, w, h) {
    var L = Math.max(n[0], n[1]) / 1000, S = Math.min(n[0], n[1]) / 1000;
    return Math.ceil(w / S - 1e-9) * Math.ceil(h / L - 1e-9);
  }
  function est() {
    var it = list[cur], n = nums(it.size), out = q('.cv-out');
    var w = parseFloat(q('.cv-w').value), h = parseFloat(q('.cv-h').value);
    if (!(w > 0 && h > 0) || n.length < 2) { out.innerHTML = 'Type the size of your wall or ceiling in metres to see how many ' + it.range.unit + 's&nbsp;to&nbsp;get.'; return; }
    var c = count(n, w, h);
    out.innerHTML = '<b>About ' + c + ' ' + it.range.unit + (c === 1 ? '' : 's') + '</b> for ' + (w * h).toFixed(1) + '&nbsp;m&sup2;, rounded up to full&nbsp;' + it.range.unit + 's.';
  }
  function open(code) {
    if (!box) build();
    list = visibleList();
    var i = list.indexOf(byCode[code]);
    if (i < 0) { list = all; i = all.indexOf(byCode[code]); }
    if (i < 0) return;
    lastFocus = d.activeElement;
    box.classList.add('on'); d.body.style.overflow = 'hidden';
    show(i); q('.cv-x').focus({ preventScroll: true }); box.scrollTop = 0;
    d.addEventListener('keydown', key);
  }
  function close() {
    box.classList.remove('on'); d.body.style.overflow = '';
    d.removeEventListener('keydown', key);
    if (hdrWa) { hdrWa.href = hdrHref; hdrWa.setAttribute('aria-label', hdrLabel); hdrWa.classList.remove('has-code'); }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus) lastFocus.focus();
  }
  function key(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && !/INPUT/.test(e.target.tagName)) show(cur - 1);
    else if (e.key === 'ArrowRight' && !/INPUT/.test(e.target.tagName)) show(cur + 1);
    else if (e.key === 'Tab') {
      var f = [].slice.call(box.querySelectorAll('button,a,input')).filter(function (x) { return x.offsetParent; });
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }
  mount.addEventListener('click', function (e) { var b = e.target.closest('.ccard2'); if (b) open(b.getAttribute('data-code')); });
  var m = /^#d-(\d+)$/.exec(location.hash); if (m) setTimeout(function () { open(m[1]); }, 60);

  /* ---- standalone estimator (pick a range and size) ---- */
  var E = d.getElementById('estimate');
  if (E) {
    var selR = E.querySelector('[name=range]'), selS = E.querySelector('[name=size]'), inW = E.querySelector('[name=w]'), inH = E.querySelector('[name=h]'), outE = E.querySelector('.est-out'), sendE = E.querySelector('.est-send');
    var l1 = E.querySelector('.l1'), l2 = E.querySelector('.l2');
    selR.innerHTML = data.ranges.map(function (r) { return '<option value="' + r.id + '">' + esc(r.name) + ', ' + esc(r.type.toLowerCase()) + '</option>'; }).join('');
    var want = (/[?&]range=(\w+)/.exec(location.search) || [])[1]; if (want && data.ranges.some(function (r) { return r.id === want; })) selR.value = want;
    function rangeNow() { return data.ranges.filter(function (r) { return r.id === selR.value; })[0]; }
    function fillSizes() {
      var r = rangeNow(), seen = {};
      selS.innerHTML = r.items.filter(function (it) { if (seen[it.size]) return false; seen[it.size] = 1; return true; })
        .map(function (it) { return '<option>' + esc(it.size) + '</option>'; }).join('');
      selS.parentNode.hidden = selS.options.length < 2;
      var ceil = r.mode === 'ceiling'; l1.textContent = ceil ? 'Ceiling width' : 'Wall width'; l2.textContent = ceil ? 'Ceiling length' : 'Wall height';
      calc();
    }
    function calc() {
      var r = rangeNow(), n = nums(selS.value), w = parseFloat(inW.value), h = parseFloat(inH.value);
      if (!(w > 0 && h > 0)) { outE.innerHTML = 'Type your measurements in metres. We round up to full ' + r.unit + 's, so a 3.5&nbsp;m wall with 2.9&nbsp;m panels counts the&nbsp;extra&nbsp;piece.'; sendE.hidden = true; return; }
      var c = count(n, w, h);
      outE.innerHTML = '<b>About ' + c + ' ' + r.unit + (c === 1 ? '' : 's') + ' of ' + esc(r.name) + '</b><span>' + w + ' m &times; ' + h + ' m = ' + (w * h).toFixed(1) + ' m&sup2;. Size ' + sizeHtml(selS.value) + '.</span>';
      sendE.hidden = false;
      sendE.href = wa('Hi MissReno, I used the estimator on your website: ' + r.name + ' (' + selS.value + ') for an area of ' + w + ' m x ' + h + ' m. It says about ' + c + ' ' + r.unit + 's. Can you confirm and advise?');
    }
    selR.addEventListener('change', fillSizes); selS.addEventListener('change', calc); inW.addEventListener('input', calc); inH.addEventListener('input', calc);
    fillSizes();
  }
})();
