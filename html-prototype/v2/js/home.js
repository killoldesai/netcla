/* Homepage only: animated hero board, weekly update loop, and the role cards for the team carousel.
   Loaded before core.js so the carousel markup exists when core.js wires it up. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = (n) => `img/char-${n}.webp`;
  const ARROW = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

  // Hero board: content per chip
  const boards = {
    software: { title: 'Customer portal', role: 'Full stack developer', ava: 'fullstack', doing: 'Building the orders API',
      rows: [['Orders API', 'cloud', 'work', 'Working on it', 62], ['CRM sync', 'fullstack', 'work', 'Working on it', 40], ['Admin roles', 'design', 'review', 'In review', 85], ['Billing export', 'cloud', 'none', 'Up next', 8]],
      done: [['Login flow', 'fullstack'], ['Invoices', 'cloud']] },
    ai: { title: 'Support assistant', role: 'AI/ML developer', ava: 'ai', doing: 'Connecting your documents',
      rows: [['Document search', 'ai', 'work', 'Working on it', 70], ['Draft replies', 'ai', 'work', 'Working on it', 48], ['Human review step', 'design', 'review', 'In review', 88], ['Form data extraction', 'fullstack', 'none', 'Up next', 5]],
      done: [['Data check', 'ai'], ['Use case agreed', 'design']] },
    cloud: { title: 'Cloud migration', role: 'DevOps engineer', ava: 'devops', doing: 'Writing Terraform modules',
      rows: [['Terraform modules', 'devops', 'work', 'Working on it', 58], ['Monitoring', 'devops', 'work', 'Working on it', 35], ['Staging environment', 'cloud', 'review', 'In review', 90], ['Production cutover', 'cloud', 'none', 'Up next', 4]],
      done: [['CI/CD pipeline', 'devops'], ['Containers', 'cloud']] },
    mobile: { title: 'Booking app', role: 'Mobile developer', ava: 'mobile', doing: 'Building push notifications',
      rows: [['Push notifications', 'mobile', 'work', 'Working on it', 55], ['Payments screen', 'design', 'work', 'Working on it', 38], ['Android build', 'mobile', 'review', 'In review', 86], ['Store release', 'mobile', 'none', 'Up next', 6]],
      done: [['iOS build', 'mobile'], ['App designs', 'design']] },
    scope: { title: 'Discovery', role: 'Project lead', ava: 'lead', doing: 'Reading your brief',
      rows: [['Users and goals', 'design', 'work', 'Working on it', 60], ['Existing systems', 'cloud', 'work', 'Working on it', 42], ['Constraints', 'design', 'review', 'In review', 80], ['Initial estimate', 'fullstack', 'none', 'Up next', 6]],
      done: [['Brief received', 'lead'], ['Call arranged', 'lead']] },
  };
  const hbRows = $('[data-hb-rows]');
  if (hbRows) {
    const hbDone = $('[data-hb-done]'), hbTitle = $('[data-hb-title]');
    const hbRole = $('[data-hb-role]'), hbAva = $('[data-hb-ava]'), hbDoing = $('[data-hb-doing]');
    const head = '<div class="tr tr--h"><span>Task</span><span>Owner</span><span>Status</span><span>Progress</span></div>';
    let typer, cycle;
    const type = (t) => {
      clearInterval(typer);
      if (reduce) { hbDoing.textContent = t; return; }
      let i = 0; hbDoing.textContent = '';
      typer = setInterval(() => { hbDoing.textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(typer); }, 38);
    };
    const render = (k) => {
      const b = boards[k];
      hbTitle.textContent = b.title; hbRole.textContent = b.role; hbAva.src = img(b.ava); type(b.doing);
      hbRows.innerHTML = head + b.rows.map(([t, o, s, l, p], i) =>
        `<div class="tr rowin" style="animation-delay:${i * 70}ms"><span>${t}</span><span class="who"><img src="${img(o)}" alt=""></span><span class="st st--${s}">${l}</span><span><i class="bar"><b style="width:0" data-w="${p}"></b></i></span></div>`).join('');
      hbDone.innerHTML = b.done.map(([t, o], i) =>
        `<div class="tr rowin" style="animation-delay:${300 + i * 70}ms"><span>${t}</span><span class="who"><img src="${img(o)}" alt=""></span><span class="st st--done">Done</span><span><i class="bar"><b style="width:100%;background:var(--s-done)"></b></i></span></div>`).join('');
      setTimeout(() => $$('[data-w]', hbRows).forEach(e => { e.style.width = e.dataset.w + '%'; }), 80);
      clearTimeout(cycle);
      if (!reduce) cycle = setTimeout(() => { // the first task moves to review, like a live board
        const r = hbRows.querySelector('.tr:nth-child(2) .st'), bar = hbRows.querySelector('.tr:nth-child(2) b');
        if (r) { r.className = 'st st--review'; r.textContent = 'In review'; bar.style.width = '92%'; }
      }, 3200);
    };
    const chips = $$('[data-chips] .chip');
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
      render(c.dataset.k);
    }));
    const go = $('[data-hero-go]'), svc = $('#f-svc'), form = $('[data-form]');
    if (go) go.addEventListener('click', () => {
      const c = chips.find(x => x.getAttribute('aria-pressed') === 'true');
      setTimeout(() => { if (c && svc) { svc.value = c.dataset.svc; form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash'); } }, 500);
    });
    render('software');

    // Weekly update checklist and cursor loop
    const upd = $$('[data-upd] li'), cur = $('[data-cursor]');
    const spots = [[0, 0], [-150, -110], [80, -170], [-60, 80], [120, 40]];
    let step = 0;
    const tick = () => {
      upd.forEach((li, i) => li.classList.toggle('on', i < step));
      const [x, y] = spots[step % spots.length]; cur.style.transform = `translate(${x}px, ${y}px)`;
      step = step >= upd.length ? 0 : step + 1;
    };
    if (!reduce) { tick(); setInterval(tick, 1500); } else upd.forEach(li => li.classList.add('on'));
  }

  // Team carousel cards (core.js wires the carousel)
  const roles = [
    { n: 'Frontend developer', d: 'Interfaces and client apps, in React and Next.js.', c: 'react', chip: 'Building your interface', h: '/hire-react-developer', icons: ['react-atom', 'code-brackets'] },
    { n: 'Backend developer', d: 'APIs, services and data, in Node.js, Python and Laravel.', c: 'node', chip: 'Designing your API', h: '/hire-nodejs-developer', icons: ['nodejs-hexagon', 'python-snake', 'api-plug'] },
    { n: 'Mobile developer', d: 'iOS, Android and cross-platform apps in Flutter, Swift and Kotlin.', c: 'mobile', chip: 'Shipping your app build', h: '/hire-flutter-developer', icons: ['flutter-diamond', 'mobile-device'] },
    { n: 'AI/ML developer', d: 'LLM features, machine learning models and data pipelines.', c: 'ai', chip: 'Connecting your documents', h: '/hire-ai-ml-developer', icons: ['brain-circuit', 'python-snake'] },
    { n: 'DevOps engineer', d: 'CI/CD pipelines, containers and Infrastructure as Code.', c: 'devops', chip: 'Automating your releases', h: '/hire-devops-engineer', icons: ['kubernetes-wheel', 'terraform-blocks', 'docker-whale'] },
    { n: 'UI/UX designer', d: 'Product interfaces, user journeys and prototypes that clarify what needs to be built.', c: 'design', chip: 'Mapping your user flows', h: '/hire-ui-ux-designer', icons: ['layers-stack'] },
  ];
  const track = $('[data-track]'), list = $('[data-rlist]');
  if (track) {
    track.innerHTML = roles.map((r) => `<article class="rcard">
      <div class="rcard__img"><img src="${img(r.c)}" alt="Illustrated ${r.n.replace('UI/UX', 'UI and UX').toLowerCase()} character" loading="lazy"><span class="rcard__pill"><img src="${img(r.c)}" alt="">${r.chip}</span></div>
      <h3>${r.n}</h3><p>${r.d}</p>
      <div class="rcard__f"><span class="hex">${r.icons.map(ic => `<span><svg aria-hidden="true"><use href="../assets/icons.svg#${ic}"/></svg></span>`).join('')}</span><a class="btn btn--ghost" href="hire.html" data-path="${r.h}">Hire ${ARROW}</a></div></article>`).join('');
    if (list) list.innerHTML = roles.map((r, i) => `<li><button type="button" role="tab" aria-selected="false" data-goto="${i}"><i><svg aria-hidden="true"><use href="#i-plus"/></svg></i><span>${r.n}<small>${r.d}</small></span></button></li>`).join('');
  }
})();
