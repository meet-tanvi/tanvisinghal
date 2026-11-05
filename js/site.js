/* Shared behaviour for all pages. The site stays usable with JavaScript off:
   document links open the first page image directly. */

(function () {
  'use strict';

  /* Mobile menu */
  var menuBtn = document.getElementById('menu-btn');
  var siteNav = document.getElementById('site-nav');
  if (menuBtn && siteNav) {
    var setMenu = function (open) {
      siteNav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', function () { setMenu(!siteNav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!siteNav.contains(e.target) && !menuBtn.contains(e.target)) { setMenu(false); }
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setMenu(false); }
    });
  }

  /* Light and dark mode. Light is the default; the head script applies a saved choice before the page paints. */
  var themeBtn = document.getElementById('theme');
  if (themeBtn) {
    var rootEl = document.documentElement;
    var renderTheme = function () {
      var dark = rootEl.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeBtn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    };
    themeBtn.addEventListener('click', function () {
      var dark = rootEl.getAttribute('data-theme') !== 'dark';
      if (dark) { rootEl.setAttribute('data-theme', 'dark'); } else { rootEl.removeAttribute('data-theme'); }
      try { localStorage.setItem('tsPortfolioTheme', dark ? 'dark' : 'light'); } catch (e) { /* choice lasts for this page only */ }
      renderTheme();
    });
    renderTheme();
  }

  /* Copy email */
  var copy = document.getElementById('copy-email');
  if (copy) {
    copy.addEventListener('click', function () {
      var address = copy.getAttribute('data-email');
      function done(label) {
        copy.textContent = label;
        setTimeout(function () { copy.textContent = 'Copy email'; }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(function () { done('Copied'); }, function () { done('Press Ctrl+C'); });
      } else {
        done(address);
      }
    });
  }

  /* Document reader */
  var DOCS = {
    book: { prefix: 'assets/book/p-', total: 88, title: 'A Journey Towards Infinity' },
    'case': { prefix: 'assets/case/c-', total: 8, title: 'From Vaults to Screens, BFI Replay case study' },
    csr: { prefix: 'assets/csr/s-', total: 18, title: 'Partnerships for Society' },
    lives: { prefix: 'assets/lives/p-', total: 51, title: 'Lighting Lives' },
    smiles: { prefix: 'assets/smiles/p-', total: 27, title: 'Powering Smiles' },
    sym: { prefix: 'assets/press/sym-', total: 2, title: 'Press release, REC Foundation CSR Symposium' },
    dis: { prefix: 'assets/press/dis-', total: 2, title: 'Press release, Integrated Digital Platform workshop' },
    res: { prefix: 'assets/press/res-', total: 1, title: 'Press release, Annual financial results FY21' },
    gb: { prefix: 'assets/press/gb-', total: 2, title: 'Press release, Inaugural Euro-Yen green bond' },
    growth: { prefix: 'assets/ads/growth-', total: 1, title: "REC: Energizing India's Growth Story" },
    cmd: { prefix: 'assets/ads/cmd-', total: 1, title: "Chairman's message to shareholders" },
    fortune: { prefix: 'assets/ads/fortune-', total: 1, title: 'Funding a Powerful Future' },
    smart: { prefix: 'assets/ads/smart-', total: 2, title: 'Smart metering campaign' }
  };

  var triggers = document.querySelectorAll('[data-doc]');
  if (triggers.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'reader';
    dlg.setAttribute('aria-labelledby', 'reader-title');
    dlg.innerHTML =
      '<div class="reader-bar">' +
        '<span class="reader-title" id="reader-title"></span>' +
        '<span class="reader-count" id="reader-count" aria-live="polite"></span>' +
        '<button class="reader-close" type="button" id="reader-close">Close</button>' +
      '</div>' +
      '<div class="reader-stage" id="reader-stage">' +
        '<button class="nb prev" type="button" id="reader-prev" aria-label="Previous page">&#8249;</button>' +
        '<img id="reader-img" alt="">' +
        '<button class="nb next" type="button" id="reader-next" aria-label="Next page">&#8250;</button>' +
      '</div>';
    document.body.appendChild(dlg);

    var doc = null, page = 1, opener = null, startX = null;
    var img = dlg.querySelector('#reader-img');
    var count = dlg.querySelector('#reader-count');
    var prev = dlg.querySelector('#reader-prev');
    var next = dlg.querySelector('#reader-next');

    function src(n) { return doc.prefix + (n < 10 ? '0' + n : n) + '.jpg'; }
    function show(n) {
      page = Math.min(doc.total, Math.max(1, n));
      img.src = src(page);
      img.alt = 'Page ' + page + ' of ' + doc.title;
      count.textContent = doc.total > 1 ? 'Page ' + page + ' of ' + doc.total : '';
      prev.hidden = next.hidden = doc.total === 1;
      prev.disabled = page === 1;
      next.disabled = page === doc.total;
      if (page < doc.total) { new Image().src = src(page + 1); }
    }
    function close() { dlg.close(); }

    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) {
        var key = t.getAttribute('data-doc');
        if (!DOCS[key]) { return; }
        e.preventDefault();
        doc = DOCS[key];
        opener = t;
        dlg.querySelector('#reader-title').textContent = doc.title;
        show(parseInt(t.getAttribute('data-start') || '1', 10));
        dlg.showModal();
        document.body.style.overflow = 'hidden';
      });
    });

    dlg.addEventListener('close', function () {
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if (opener) { opener.focus(); }
    });
    dlg.querySelector('#reader-close').addEventListener('click', close);
    prev.addEventListener('click', function () { show(page - 1); });
    next.addEventListener('click', function () { show(page + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(page + 1); }
      if (e.key === 'ArrowLeft') { show(page - 1); }
    });
    var stage = dlg.querySelector('#reader-stage');
    stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (startX === null) { return; }
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { show(page + (dx < 0 ? 1 : -1)); }
    });
  }

})();
