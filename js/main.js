(function () {
  'use strict';

  // Configuração: URL da publicação do Instagram (deixe vazio enquanto não houver link).
  var CONFIG = {
    instagramUrl: 'https://www.instagram.com/reel/DexVTXMus6S/'
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ondas (grafismo do banner) ---------- */
  function buildWaves(el, opts) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1200 400');
    svg.setAttribute('preserveAspectRatio', 'none');
    var g = document.createElementNS(NS, 'g');
    if (!reduce && opts.drift) g.setAttribute('class', 'drift');
    var lines = opts.lines;
    for (var i = 0; i < lines; i++) {
      var t = i / (lines - 1);
      var y0 = 120 + t * 230;
      var d = 'M-60 ' + (y0 + 40);
      for (var x = -60; x <= 1260; x += 20) {
        var y = y0
          + Math.sin(x / 190 + 0.9 - t * 1.6) * (46 - t * 14)
          + Math.sin(x / 70 + t * 5) * 6
          - (x / 1200) * 70 * (1 - t * 0.6);
        d += ' L' + x + ' ' + y.toFixed(1);
      }
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.style.opacity = (0.45 + 0.55 * (1 - t)).toFixed(2);
      g.appendChild(p);
    }
    svg.appendChild(g);
    el.appendChild(svg);
  }
  document.querySelectorAll('.hero-waves').forEach(function (e) { buildWaves(e, { lines: 30, drift: true }); });
  document.querySelectorAll('.section-waves').forEach(function (e) { buildWaves(e, { lines: 22, drift: false }); });
  document.querySelectorAll('.closing-waves').forEach(function (e) { buildWaves(e, { lines: 26, drift: true }); });

  /* ---------- Entrada suave ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el, i) {
      el.style.setProperty('--d', ((i % 4) * 0.08) + 's');
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Menu móvel ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); }
  });

  /* ---------- Galeria / lightbox ---------- */
  var box = document.getElementById('lightbox');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.gallery button'));
  var big = box.querySelector('img');
  var cap = box.querySelector('figcaption');
  var count = box.querySelector('.lb-count');
  var cur = 0, opener = null;

  function show(i) {
    cur = (i + thumbs.length) % thumbs.length;
    thumbs[cur].setAttribute('aria-label', 'Ampliar foto ' + (cur + 1) + ' de ' + thumbs.length);
    var img = thumbs[cur].querySelector('img');
    big.src = img.getAttribute('src').replace('-sm.webp', '.webp');
    big.alt = img.alt;
    cap.textContent = img.alt;
    count.textContent = (cur + 1) + ' de ' + thumbs.length;
  }
  function open(i) {
    opener = thumbs[i];
    show(i);
    if (box.showModal) box.showModal(); else box.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    if (box.close) box.close(); else box.removeAttribute('open');
  }
  thumbs.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  box.addEventListener('close', function () {
    document.documentElement.style.overflow = '';
    if (opener) opener.focus();
  });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });

  thumbs.forEach(function (b, i) { b.setAttribute('aria-label', 'Ampliar foto ' + (i + 1) + ' de ' + thumbs.length); });

  /* ---------- Vídeo na própria página ---------- */
  var reelBox = document.getElementById('reelbox');
  var reelBtn = document.getElementById('open-reel');
  var reelVid = reelBox.querySelector('video');
  reelBtn.addEventListener('click', function () { reelBox.showModal(); reelVid.preload = 'metadata'; });
  reelBox.querySelector('.lb-close').addEventListener('click', function () { reelBox.close(); });
  reelBox.addEventListener('click', function (e) { if (e.target === reelBox) reelBox.close(); });
  reelBox.addEventListener('close', function () { reelVid.pause(); reelBtn.focus(); });

  /* ---------- Instagram ---------- */
  var url = (CONFIG.instagramUrl || '').trim();
  var link = document.getElementById('ig-link');
  var soon = document.getElementById('ig-soon');
  if (/^https:\/\/(www\.)?instagram\.com\//.test(url)) {
    link.href = url;
    link.hidden = false;
    soon.hidden = true;

    var holder = document.querySelector('.ig-embed');
    var fallback = document.querySelector('.ig-fallback');
    var bq = document.createElement('blockquote');
    bq.className = 'instagram-media';
    bq.setAttribute('data-instgrm-permalink', url);
    bq.setAttribute('data-instgrm-version', '14');
    bq.style.cssText = 'width:100%;max-width:540px;margin:0 auto;background:#fff;border:0';
    holder.appendChild(bq);

    // A foto do evento só é substituída se a incorporação realmente carregar.
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    s.onload = function () {
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
      var tries = 0;
      var timer = setInterval(function () {
        if (holder.querySelector('iframe')) {
          holder.hidden = false; fallback.hidden = true; clearInterval(timer);
        } else if (++tries > 20) { clearInterval(timer); }
      }, 250);
    };
    document.body.appendChild(s);

    // Foto clicável abre a publicação enquanto (ou se) a incorporação não carrega
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Abrir a publicação no Instagram');
    var img = fallback.querySelector('img');
    img.parentNode.insertBefore(a, img); a.appendChild(img);
  }
})();
