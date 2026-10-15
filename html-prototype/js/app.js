/* Netofficials homepage prototype: vanilla versions of the design system behaviours. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* Sticky header */
  var header = $('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var nav = $('[data-nav]');
  var toggle = $('[data-nav-toggle]');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('nx-nav--open');
      nav.classList.toggle('nx-nav--open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    });
    $$('.nx-nav__menu a', nav).forEach(function (a) {
      a.addEventListener('click', function () { if (nav.classList.contains('nx-nav--open')) toggle.click(); });
    });
  }

  /* Hero headline: words rise in */
  var split = $('[data-split]');
  if (split && !reduce) {
    var i = 0;
    var wrap = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'word';
            s.style.animationDelay = (i++ * 60) + 'ms';
            s.textContent = part;
            frag.appendChild(s);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) { wrap(child); }
      });
    };
    split.setAttribute('aria-label', split.textContent.replace(/\s+/g, ' ').trim());
    wrap(split);
  }

  /* Sliding indicator for tabs and segmented control */
  function placeIndicator(list, ind) {
    var active = list.querySelector('[aria-selected="true"], [aria-checked="true"]');
    if (!active || !ind) return;
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }

  /* Tabs */
  $$('[data-tabs]').forEach(function (root) {
    var list = $('[role="tablist"]', root);
    var ind = $('.nx-tabs__ind', root);
    var tabs = $$('[role="tab"]', root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      placeIndicator(list, ind);
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (idx + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault();
        select(tabs[n], true);
      });
    });
    placeIndicator(list, ind);
    window.addEventListener('resize', function () { placeIndicator(list, ind); });
    if (document.fonts) document.fonts.ready.then(function () { placeIndicator(list, ind); });
  });

  /* Segmented control driving the engagement model card */
  $$('[data-seg]').forEach(function (root) {
    var ind = $('.nx-seg__thumb', root);
    var opts = $$('[role="radio"]', root);
    function select(opt, focus) {
      opts.forEach(function (o) { var on = o === opt; o.setAttribute('aria-checked', String(on)); o.tabIndex = on ? 0 : -1; });
      placeIndicator(root, ind);
      $$('[data-model]', root.closest('section') || document).forEach(function (m) { m.hidden = m.getAttribute('data-model') !== opt.getAttribute('data-value'); });
      if (focus) opt.focus();
    }
    opts.forEach(function (o, idx) {
      o.addEventListener('click', function () { select(o); });
      o.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select(opts[(idx + d + opts.length) % opts.length], true);
      });
    });
    placeIndicator(root, ind);
    window.addEventListener('resize', function () { placeIndicator(root, ind); });
    if (document.fonts) document.fonts.ready.then(function () { placeIndicator(root, ind); });
  });

  /* Accordion: one open at a time */
  $$('[data-accordion]').forEach(function (root) {
    var triggers = $$('.nx-acc__trigger', root);
    function set(t, open) {
      t.setAttribute('aria-expanded', String(open));
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.setAttribute('data-open', String(open));
      var inner = panel.firstElementChild;
      if (open) inner.removeAttribute('inert'); else inner.setAttribute('inert', '');
    }
    triggers.forEach(function (t) {
      t.addEventListener('click', function () {
        var open = t.getAttribute('aria-expanded') !== 'true';
        triggers.forEach(function (o) { set(o, o === t ? open : false); });
      });
    });
  });

  /* Carousel */
  $$('[data-carousel]').forEach(function (root) {
    var track = $('.nx-car__track', root);
    var slides = $$('.nx-car__slide', root);
    var prev = $('[data-car-prev]', root);
    var next = $('[data-car-next]', root);
    var bar = $('[data-car-progress]', root);
    var idx = 0;
    function per() { return parseInt(getComputedStyle(root).getPropertyValue('--nx-per'), 10) || 1; }
    function max() { return Math.max(0, slides.length - per()); }
    function render() {
      var p = per();
      idx = Math.min(idx, max());
      track.style.transform = 'translateX(' + (-idx * 100 / p) + '%)';
      slides.forEach(function (s, i) {
        var vis = i >= idx && i < idx + p;
        if (vis) { s.removeAttribute('aria-hidden'); s.removeAttribute('inert'); }
        else { s.setAttribute('aria-hidden', 'true'); s.setAttribute('inert', ''); }
      });
      prev.disabled = idx === 0;
      next.disabled = idx >= max();
      if (bar) bar.style.width = ((idx + p) / slides.length * 100) + '%';
    }
    function go(n) { idx = Math.max(0, Math.min(max(), n)); render(); }
    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    });
    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    track.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (dx < -40) go(idx + 1); else if (dx > 40) go(idx - 1);
    });
    track.addEventListener('click', function (e) { if (e.detail && Math.abs(e.movementX || 0) > 2) e.preventDefault(); });
    window.addEventListener('resize', render);
    render();
  });

  /* Scroll reveal, and the process steps fill in order */
  var reveals = $$('.nx-reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('nx-reveal--in'); });
    $$('[data-steps] .nx-step').forEach(function (s) { s.classList.add('nx-step--active'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('nx-reveal--in');
        if (en.target.classList.contains('nx-step')) {
          var delay = parseInt(en.target.style.getPropertyValue('--nx-delay'), 10) || 0;
          setTimeout(function () { en.target.classList.add('nx-step--active'); }, delay + 300);
        }
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Code window types itself, then the assistant answers */
  var code = $('[data-typing]');
  if (code) {
    var lines = $$('.nx-code__line', code);
    var dots = $('[data-chat-dots]');
    var answer = $('[data-chat-answer]');
    var finishChat = function () { if (dots) dots.hidden = true; if (answer) answer.hidden = false; };
    if (reduce) { finishChat(); }
    else {
      lines.forEach(function (l) { l.style.visibility = 'hidden'; });
      var caret = document.createElement('span');
      caret.className = 'nx-code__caret';
      caret.setAttribute('aria-hidden', 'true');
      var n = 0;
      var timer = setInterval(function () {
        if (n >= lines.length) { clearInterval(timer); setTimeout(finishChat, 400); return; }
        lines[n].style.visibility = 'visible';
        lines[n].appendChild(caret);
        n++;
      }, 360);
    }
  }

  /* Gentle parallax on the hero phone */
  var par = $$('[data-parallax]');
  if (par.length && !reduce) {
    var ticking = false;
    var apply = function () {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var mid = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = 'translateY(' + (mid * parseFloat(el.getAttribute('data-parallax'))) + 'px)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
    apply();
  }

  /* Toasts */
  var holder = $('[data-toasts]');
  function toast(tone, title, desc) {
    var t = document.createElement('div');
    t.className = 'nx-toast nx-toast--' + tone;
    t.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
    var icon = tone === 'success' ? '#i-check' : '#i-x';
    t.innerHTML = '<span class="nx-toast__icon" aria-hidden="true"><svg width="16" height="16"><use href="' + icon + '"/></svg></span>' +
      '<div class="nx-toast__body"><div class="nx-toast__title"></div><div class="nx-toast__desc"></div></div>' +
      '<button type="button" class="nx-toast__close" aria-label="Dismiss"><svg width="16" height="16" aria-hidden="true"><use href="#i-x"/></svg></button>';
    t.querySelector('.nx-toast__title').textContent = title;
    t.querySelector('.nx-toast__desc').textContent = desc;
    t.querySelector('button').addEventListener('click', function () { t.remove(); });
    holder.prepend(t);
    setTimeout(function () { t.remove(); }, 6000);
  }

  /* Service preselection: hero chips and every "Discuss..." link fill the form */
  var serviceSelect = $('#f-service');
  function preselect(value) {
    if (!serviceSelect || !value) return;
    serviceSelect.value = value;
    serviceSelect.dispatchEvent(new Event('change'));
  }
  var chips = $$('[data-chip]');
  var picked = null;
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      picked = c.getAttribute('data-chip');
      chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
    });
  });
  var go = $('[data-starter-go]');
  if (go) go.addEventListener('click', function () { if (picked) preselect(picked); });
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { preselect(a.getAttribute('data-service')); });
  });

  /* Contact form (prototype: validates and shows a toast, sends nothing) */
  var form = $('[data-form]');
  if (form) {
    var messages = { 'f-name': 'Tell us your name.', 'f-email': 'Enter a valid work email so we can reply.', 'f-service': 'Choose the closest service.', 'f-goal': 'Add a sentence or two about the project.' };
    var setError = function (input, msg) {
      var field = input.closest('.nx-field');
      var hint = field.querySelector('.nx-field__hint');
      if (msg) {
        field.classList.add('nx-field--error');
        input.setAttribute('aria-invalid', 'true');
        if (!hint) { hint = document.createElement('span'); hint.className = 'nx-field__hint'; hint.id = input.id + '-hint'; field.appendChild(hint); }
        hint.setAttribute('data-default', hint.getAttribute('data-default') || hint.textContent);
        hint.textContent = msg;
        input.setAttribute('aria-describedby', hint.id);
      } else {
        field.classList.remove('nx-field--error');
        input.removeAttribute('aria-invalid');
        if (hint) {
          var d = hint.getAttribute('data-default');
          if (d) hint.textContent = d; else hint.remove();
        }
      }
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      Object.keys(messages).forEach(function (id) {
        var input = document.getElementById(id);
        var bad = !input.value.trim() || !input.checkValidity();
        setError(input, bad ? messages[id] : null);
        if (bad && !first) first = input;
      });
      if (first) { first.focus(); toast('danger', 'A few details missing', 'Check the highlighted fields.'); return; }
      form.reset();
      chips.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      toast('success', 'Brief received', 'We will reply to arrange a conversation. (Preview only, nothing was sent.)');
    });
  }

  /* Back to top */
  var top = $('[data-to-top]');
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); $('a, button').focus(); });

  /* Mobile sticky CTA: shows after the hero, hides near the form */
  var mcta = $('[data-mcta]');
  var hero = $('.hero, .page-hero');
  var formArea = $('#contact') || $('[data-form]');
  if (mcta && hero && 'IntersectionObserver' in window) {
    var heroGone = false, formOn = false;
    var sync = function () { mcta.classList.toggle('is-visible', heroGone && !formOn); };
    new IntersectionObserver(function (en) { heroGone = !en[0].isIntersecting; sync(); }).observe(hero);
    if (formArea) new IntersectionObserver(function (en) { formOn = en[0].isIntersecting; sync(); }, { threshold: 0.1 }).observe(formArea);
  }

  /* Sticky section sub-nav: highlights the section in view */
  var subnav = $('[data-subnav]');
  if (subnav && 'IntersectionObserver' in window) {
    var links = $$('a[href^="#"]', subnav);
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          if (on) { a.setAttribute('aria-current', 'true'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (tg) { spy.observe(tg); });
  }

  /* Theme switch */
  var themeBtn = $('[data-theme-toggle]');
  if (themeBtn) {
    var saved = null;
    try { saved = localStorage.getItem('nx-theme'); } catch (e) { saved = null; }
    var setTheme = function (dark) {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      themeBtn.setAttribute('aria-checked', String(dark));
      try { localStorage.setItem('nx-theme', dark ? 'dark' : 'light'); } catch (e) { /* storage blocked */ }
    };
    if (saved === 'dark') setTheme(true);
    themeBtn.addEventListener('click', function () { setTheme(themeBtn.getAttribute('aria-checked') !== 'true'); });
  }

  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
