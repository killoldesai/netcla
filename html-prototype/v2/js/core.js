/* Netofficials v2 shared behaviours. Everything is driven by data attributes; see components.html. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header shadow and mobile menu: [data-hdr], [data-menu] controlling #mnav
  const hdr = $('[data-hdr]');
  if (hdr) { const f = () => hdr.classList.toggle('is-scrolled', scrollY > 8); addEventListener('scroll', f, { passive: true }); f(); }
  const mb = $('[data-menu]'), mn = $('#mnav');
  if (mb && mn) mb.addEventListener('click', () => {
    const o = mn.classList.toggle('open');
    mb.setAttribute('aria-expanded', o); mb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    const u = mb.querySelector('use'); if (u) u.setAttribute('href', o ? '#i-x' : '#i-menu');
  });

  // Enquiry form pre-fill: [data-pre="Service name"] on links, or ?svc= in the URL
  const svc = $('#f-svc'), form = $('[data-form]');
  const prefill = (v) => {
    if (!v || !svc) return;
    const opt = [...svc.options].find(o => o.value === v || o.text === v);
    if (!opt) return;
    svc.value = opt.value || opt.text;
    if (form) { form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash'); }
  };
  $$('[data-pre]').forEach(a => a.addEventListener('click', () => setTimeout(() => prefill(a.dataset.pre), 500)));
  const q = new URLSearchParams(location.search).get('svc'); if (q) prefill(q);

  // Chips that only toggle a pressed state and remember a service: [data-chips] > .chip[data-svc]
  $$('[data-chips]').forEach(g => {
    if (g.hasAttribute('data-chips-custom')) return;
    const chips = $$('.chip', g);
    chips.forEach(c => c.addEventListener('click', () => chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)))));
    const go = g.parentElement.querySelector('[data-chips-go]');
    if (go) go.addEventListener('click', () => { const c = chips.find(x => x.getAttribute('aria-pressed') === 'true'); setTimeout(() => prefill(c && c.dataset.svc), 500); });
  });

  // Tabs: [data-tabs] > [role=tablist] > [role=tab][aria-controls], panels anywhere with matching id
  $$('[data-tabs]').forEach(root => {
    const tabs = $$('[role=tab]', root);
    const pick = (i, f) => tabs.forEach((t, j) => {
      const p = document.getElementById(t.getAttribute('aria-controls')), on = i === j;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (p) { p.hidden = !on; if (on) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } }
      if (on && f) t.focus();
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(i));
      t.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key]; if (k) { e.preventDefault(); pick((i + k + tabs.length) % tabs.length, true); } });
    });
    const start = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    pick(start < 0 ? 0 : start);
  });

  // Feature accordion with visual: [data-accs] > .accs__item > .accs__btn, visuals .accs__vis > [data-vis="0"]
  $$('[data-accs]').forEach(root => {
    const items = $$('.accs__item', root), vis = $$('.accs__vis > [data-vis]', root);
    let i = 0, timer;
    const show = (n) => {
      i = (n + items.length) % items.length;
      items.forEach((it, j) => { it.setAttribute('aria-expanded', String(j === i)); $('.accs__btn', it).setAttribute('aria-expanded', String(j === i)); });
      vis.forEach(v => v.classList.toggle('on', +v.dataset.vis === i));
    };
    const auto = () => { clearInterval(timer); if (!reduce && root.dataset.accs !== 'manual') timer = setInterval(() => show(i + 1), 6000); };
    items.forEach((it, j) => $('.accs__btn', it).addEventListener('click', () => { show(j); auto(); }));
    root.addEventListener('mouseenter', () => { clearInterval(timer); root.classList.add('is-paused'); });
    root.addEventListener('mouseleave', () => { root.classList.remove('is-paused'); auto(); });
    show(0); auto();
  });

  // Card carousel: [data-carousel] containing .car__track > cards, [data-prev], [data-next], .car__dots,
  // optional list buttons [data-goto="n"]. Add data-autoplay for a 5 second rotation.
  $$('[data-carousel]').forEach(root => {
    const track = $('.car__track', root); if (!track) return;
    const cards = [...track.children], dots = $('.car__dots', root), list = $$('[data-goto]', root);
    if (dots) dots.innerHTML = cards.map(() => '<i></i>').join('');
    const dd = dots ? [...dots.children] : [];
    let ci = 0, timer;
    const go = (n) => {
      ci = (n + cards.length) % cards.length;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      const w = cards[0].offsetWidth + gap, view = track.parentElement.offsetWidth;
      const max = Math.max(0, cards.length * w - gap - view);
      track.style.transform = `translateX(${-Math.min(ci * w, max)}px)`;
      cards.forEach((c, j) => c.classList.toggle('on', j === ci));
      dd.forEach((d, j) => d.classList.toggle('on', j === ci));
      list.forEach(b => b.setAttribute('aria-selected', String(+b.dataset.goto === ci)));
    };
    const restart = () => { clearInterval(timer); if (!reduce && root.hasAttribute('data-autoplay')) timer = setInterval(() => go(ci + 1), 5000); };
    $$('[data-prev]', root).forEach(b => b.addEventListener('click', () => { go(ci - 1); restart(); }));
    $$('[data-next]', root).forEach(b => b.addEventListener('click', () => { go(ci + 1); restart(); }));
    list.forEach(b => b.addEventListener('click', () => { go(+b.dataset.goto); restart(); }));
    cards.forEach((c, j) => c.addEventListener('click', e => { if (j !== ci) { e.preventDefault(); go(j); restart(); } }));
    addEventListener('resize', () => go(ci));
    go(0); restart();
  });

  // Horizontal scroller with buttons: [data-scroller] > .irow, buttons [data-scroll="-1" | "1"]
  $$('[data-scroller]').forEach(root => {
    const row = $('.irow', root) || $('[data-scroll-track]', root); if (!row) return;
    $$('[data-scroll]', root).forEach(b => b.addEventListener('click', () => row.scrollBy({ left: +b.dataset.scroll * 368, behavior: 'smooth' })));
  });

  // Parallax: [data-parallax] section with children [data-speed="0.1"]
  $$('[data-parallax]').forEach(sec => {
    const els = $$('[data-speed]', sec);
    const f = () => {
      if (innerWidth < 960) { els.forEach(e => e.style.transform = ''); return; }
      const r = sec.getBoundingClientRect(), mid = r.top + r.height / 2 - innerHeight / 2;
      els.forEach(e => { const v = Math.max(-70, Math.min(70, mid * +e.dataset.speed)); e.style.transform = `translateY(${v}px)`; });
    };
    if (!reduce) { addEventListener('scroll', f, { passive: true }); addEventListener('resize', f); f(); }
  });

  // Marquee: [data-marquee] track is duplicated for a seamless loop
  $$('[data-marquee]').forEach(t => { const clone = t.innerHTML; t.insertAdjacentHTML('beforeend', clone); [...t.children].slice(t.children.length / 2).forEach(c => c.setAttribute('aria-hidden', 'true')); });

  // Typing text: [data-typing="text to type"]
  $$('[data-typing]').forEach(el => {
    const txt = el.dataset.typing; if (reduce) { el.textContent = txt; return; }
    let started = false;
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; let i = 0; const t = setInterval(() => { el.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(t); }, 32); } });
    io.observe(el);
  });

  // Counters for real numbers only: [data-count="2011"]
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, start = +(el.dataset.from || 0); if (reduce) { el.textContent = end; return; }
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
    io.observe(el);
  });

  // Filters: one or more [data-filter] groups > button[data-f="all"|tag]; items [data-cat="tag tag"] inside [data-filter-items].
  // With several groups an item shows only when it matches every group's choice.
  const fgroups = $$('[data-filter]'), fitems = $$('[data-filter-items] [data-cat]');
  const applyFilters = () => {
    const picks = fgroups.map(g => (g.querySelector('button[aria-pressed="true"]') || {}).dataset?.f || 'all');
    fitems.forEach(it => { const tags = it.dataset.cat.split(' '); it.classList.toggle('is-hidden', !picks.every(f => f === 'all' || tags.includes(f))); });
  };
  fgroups.forEach(g => $$('button[data-f]', g).forEach(b => b.addEventListener('click', () => {
    $$('button[data-f]', g).forEach(x => x.setAttribute('aria-pressed', String(x === b))); applyFilters();
  })));

  // Table of contents highlight: [data-toc] links to #ids
  $$('[data-toc]').forEach(nav => {
    const links = $$('a[href^="#"]', nav), map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = map.get(e.target.id); if (a) a.classList.add('on'); } }), { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((a, id) => { const t = document.getElementById(id); if (t) io.observe(t); });
  });

  // Reveal on scroll (.rv) and workflow line drawing ([data-wf] / [data-draw])
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }) : null;
  $$('.rv, [data-wf], [data-draw]').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // Demo form validation: [data-form] with required fields; note in [data-note]
  $$('[data-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const note = $('[data-note]', f);
    const miss = $$('[required]', f).filter(x => !x.value.trim());
    if (miss.length) { miss[0].focus(); if (note) { note.textContent = 'Please fill in the required fields.'; delete note.dataset.ok; } return; }
    if (note) { note.textContent = 'Preview only. On the live site this sends your message.'; note.dataset.ok = ''; }
  }));
})();
