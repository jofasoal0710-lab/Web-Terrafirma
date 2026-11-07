/* Terrafirma Costa Rica · interacciones del sitio
   La lista de accesorios (casillas de "Mi lista") es la única fuente de verdad:
   el esquema del hero, los chips, el resumen y el formulario se derivan de ella.
   Edita MODS (catálogo), HOTSPOTS (piezas del esquema) y PROJECTS (fotos reales). */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * DATOS
   * ------------------------------------------------------------------ */

  // Categorías y accesorios de la lista. Ajusta los nombres al catálogo real.
  const MODS = [
    { cat: 'Suspensión', items: [
      { id: 'elev',  name: 'Kit de elevación' },
      { id: 'amort', name: 'Amortiguadores' },
      { id: 'resor', name: 'Resortes / muelles' },
    ]},
    { cat: 'Defensas y protección', items: [
      { id: 'def-del', name: 'Defensa delantera' },
      { id: 'def-tra', name: 'Defensa trasera' },
      { id: 'skid',    name: 'Protector de bajos (skid plate)' },
      { id: 'rock',    name: 'Estribos / rock sliders' },
    ]},
    { cat: 'Winches y recuperación', items: [
      { id: 'winch',  name: 'Winch' },
      { id: 'remol',  name: 'Puntos de remolque y ganchos' },
      { id: 'recup',  name: 'Equipo de recuperación' },
    ]},
    { cat: 'Techo y carga', items: [
      { id: 'rack',   name: 'Portaequipajes / canasta de techo' },
      { id: 'barras', name: 'Barras de techo' },
      { id: 'soport', name: 'Soportes para carga y accesorios' },
    ]},
    { cat: 'Snorkel y admisión', items: [
      { id: 'snork',  name: 'Snorkel' },
      { id: 'filtro', name: 'Filtro de aire de alto flujo' },
    ]},
    { cat: 'Iluminación', items: [
      { id: 'led',    name: 'Barra LED' },
      { id: 'faros',  name: 'Faros auxiliares' },
      { id: 'trab',   name: 'Luces de trabajo' },
    ]},
    { cat: 'Ruedas y neumáticos', items: [
      { id: 'at',     name: 'Neumáticos todo terreno' },
      { id: 'rines',  name: 'Rines reforzados' },
      { id: 'repu',   name: 'Soporte para llanta de repuesto' },
    ]},
  ];

  // Piezas tocables del esquema. `id` debe existir en MODS y coincidir con data-part / data-for del SVG.
  // x e y están en las unidades del viewBox (1000 x 420) y colocan la etiqueta en pantallas anchas.
  const HOTSPOTS = [
    { id: 'rack',    label: 'Portaequipajes', x: 300, y: 20 },
    { id: 'led',     label: 'Barra LED',      x: 472, y: 20 },
    { id: 'snork',   label: 'Snorkel',        x: 640, y: 20 },
    { id: 'elev',    label: 'Elevación',      x: 170, y: 392 },
    { id: 'at',      label: 'Neumáticos',     x: 330, y: 392 },
    { id: 'rock',    label: 'Estribos',       x: 500, y: 392 },
    { id: 'def-del', label: 'Defensa',        x: 690, y: 392 },
    { id: 'winch',   label: 'Winch',          x: 850, y: 392 },
  ];

  // Fotos reales de instalaciones. Mientras esté vacío, la sección "Proyectos" permanece oculta.
  // { img: '/images/proyectos/hilux.jpg', alt: 'Toyota Hilux con snorkel y portaequipajes', size: 'wide' }
  // `size` es opcional: 'wide' (ocupa más ancho) o 'tall' (ocupa más alto) para dar ritmo al mosaico.
  const PROJECTS = [];

  /* ------------------------------------------------------------------ *
   * Utilidades
   * ------------------------------------------------------------------ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, attrs = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    kids.forEach((kid) => node.append(kid));
    return node;
  };

  $('#year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ *
   * Menú móvil
   * ------------------------------------------------------------------ */
  const toggle = $('.nav-toggle');
  const nav = $('#menu');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ------------------------------------------------------------------ *
   * Mi lista (casillas = fuente de verdad)
   * ------------------------------------------------------------------ */
  const modsBox = $('#mods');
  const sumList = $('#sum-list');
  const sumEmpty = $('#sum-empty');
  const sumCount = $('#sum-count');
  const sendBtn = $('#sum-send');
  const clearBtn = $('#sum-clear');
  const message = $('#mensaje');
  const configField = $('#configuracion');
  const catalog = new Map();

  MODS.forEach(({ cat, items }, gi) => {
    const row = el('div', { class: 'mod-row', role: 'group', 'aria-labelledby': `cat-${gi}` },
      el('p', { class: 'mod-cat', id: `cat-${gi}`, text: cat }));
    const chips = el('div', { class: 'mod-chips' });
    items.forEach((item) => {
      catalog.set(item.id, { ...item, cat });
      const input = el('input', { type: 'checkbox', value: item.id, name: 'mod' });
      chips.append(el('label', { class: 'chip' }, input, el('span', { text: item.name })));
    });
    row.append(chips);
    modsBox.append(row);
  });

  const box = (id) => $(`input[name="mod"][value="${id}"]`, modsBox);
  const selected = () => $$('input[name="mod"]:checked', modsBox).map((i) => catalog.get(i.value));
  const summaryText = (list) => list.map((m) => `- ${m.name} (${m.cat})`).join('\n');

  /* ------------------------------------------------------------------ *
   * Hero: esquema tocable
   * ------------------------------------------------------------------ */
  const rig = $('.rig');
  const hotspotsBox = $('#hotspots');
  const heroChips = $('#hero-chips');
  const heroCount = $('#hero-count');
  const hsButtons = new Map();   // id -> [botón sobre el esquema, chip móvil]

  // Cada pieza del SVG puede responder a varios accesorios: data-part="rack barras soport"
  const hasAny = (node, ids) => node.dataset.part.split(' ').some((id) => ids.has(id));
  const applyParts = (svg, ids) => {
    $$('[data-part]', svg).forEach((p) => p.classList.toggle('on', hasAny(p, ids)));
    $('.body-group', svg).classList.toggle('lifted', ids.has('elev'));
  };
  const peek = (id, on) => {
    $$(`[data-part~="${id}"], [data-for="${id}"]`, rig).forEach((n) => n.classList.toggle('peek', on));
  };
  const flip = (id) => {
    const input = box(id);
    if (!input) return;
    input.checked = !input.checked;
    renderAll();
  };

  HOTSPOTS.forEach((h, i) => {
    const hs = el('button', { class: 'hs', type: 'button', 'aria-pressed': 'false', style: `--x:${h.x};--y:${h.y};--i:${i}` },
      el('span', { text: h.label }));
    const pick = el('button', { class: 'pick', type: 'button', 'aria-pressed': 'false' }, el('span', { text: h.label }));
    [hs, pick].forEach((b) => {
      b.addEventListener('click', () => flip(h.id));
      b.addEventListener('pointerenter', () => peek(h.id, true));
      b.addEventListener('pointerleave', () => peek(h.id, false));
      b.addEventListener('focus', () => peek(h.id, true));
      b.addEventListener('blur', () => peek(h.id, false));
    });
    hotspotsBox.append(hs);
    heroChips.append(el('li', {}, pick));
    hsButtons.set(h.id, [hs, pick]);
  });

  // En pantallas angostas se recorta el esquema a la silueta (sin la fila de etiquetas)
  const wide = window.matchMedia('(min-width: 1000px)');
  const setView = () => rig.setAttribute('viewBox', wide.matches ? '0 0 1000 420' : '110 36 780 320');
  setView();
  wide.addEventListener('change', setView);

  /* ------------------------------------------------------------------ *
   * Esquemas pequeños: el mismo dibujo, reutilizado en catálogo y kits
   * ------------------------------------------------------------------ */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasIO = 'IntersectionObserver' in window;
  const makeMini = (host) => {
    const svg = rig.cloneNode(true);
    ['role', 'aria-label'].forEach((a) => svg.removeAttribute(a));
    svg.setAttribute('class', 'rig mini');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '110 36 780 320');
    $$('[id]', svg).forEach((n) => n.removeAttribute('id'));
    $$('.leaders', svg).forEach((n) => n.remove());
    $$('.part', svg).forEach((p) => p.classList.remove('on', 'peek'));
    $('.body-group', svg).classList.remove('lifted');
    host.append(svg);
    return svg;
  };

  // Catálogo: al leer una categoría, sus piezas se iluminan en el esquema fijo de la izquierda
  const railRig = makeMini($('#rail-visual'));
  const rows = $$('#catalog > div');
  const lightRow = (row) => {
    rows.forEach((r) => r.classList.toggle('is-active', r === row));
    applyParts(railRig, new Set(row.dataset.parts.split(' ')));
  };
  if (hasIO) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) lightRow(e.target); }),
      { rootMargin: '-42% 0px -42% 0px' },
    );
    rows.forEach((r) => spy.observe(r));
  }
  rows.forEach((r) => r.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') lightRow(r); }));

  // Kits: al elegir uno, sus piezas se encienden una a una (explica qué añade)
  const kitRig = makeMini($('#kit-visual'));
  let kitTimers = [];
  const playKit = (items) => {
    kitTimers.forEach(clearTimeout);
    kitTimers = [];
    const wanted = new Set(items);
    const lift = $('.body-group', kitRig);
    const parts = $$('[data-part]', kitRig);
    parts.forEach((g) => g.classList.remove('on'));
    lift.classList.remove('lifted');
    let n = 0;
    parts.forEach((g) => {
      if (!hasAny(g, wanted)) return;
      const on = () => {
        g.classList.add('on');
        if (wanted.has('elev') && g.dataset.part.split(' ').includes('elev')) lift.classList.add('lifted');
      };
      if (reduced.matches) on(); else kitTimers.push(setTimeout(on, 140 + n++ * 70));
    });
  };

  // Movimiento ambiental del hero: solo mientras se ve y si el usuario no pidió menos movimiento
  if (hasIO) {
    new IntersectionObserver(
      ([e]) => rig.classList.toggle('ambient', e.isIntersecting && !reduced.matches),
      { threshold: 0.2 },
    ).observe($('.stage'));
  }

  /* ------------------------------------------------------------------ *
   * Render único
   * ------------------------------------------------------------------ */
  const renderAll = () => {
    const list = selected();
    const ids = new Set(list.map((m) => m.id));

    // resumen
    sumList.replaceChildren(...list.map((m) => el('li', { text: m.name })));
    sumEmpty.hidden = list.length > 0;
    sumCount.textContent = String(list.length);
    sendBtn.disabled = list.length === 0;
    clearBtn.hidden = list.length === 0;
    configField.value = summaryText(list);   // viaja siempre con el formulario

    // hero
    hsButtons.forEach((btns, id) => btns.forEach((b) => b.setAttribute('aria-pressed', String(ids.has(id)))));
    applyParts(rig, ids);
    $$('[data-for]', rig).forEach((l) => l.classList.toggle('on', ids.has(l.dataset.for)));
    heroCount.textContent = `(${list.length})`;
  };

  modsBox.addEventListener('change', renderAll);
  clearBtn.addEventListener('click', () => {
    $$('input[name="mod"]', modsBox).forEach((i) => { i.checked = false; });
    renderAll();
  });

  const MARK_START = '[Mi lista]';
  const MARK_END = '[/Mi lista]';
  const writeSelectionToMessage = () => {
    const block = `${MARK_START}\n${summaryText(selected())}\n${MARK_END}`;
    const text = message.value;
    const start = text.indexOf(MARK_START);
    const end = text.indexOf(MARK_END);
    // Si ya hay un bloque previo lo reemplaza; si no, lo agrega al final.
    message.value = (start !== -1 && end > start)
      ? text.slice(0, start) + block + text.slice(end + MARK_END.length)
      : (text ? `${text}\n\n` : '') + block;
  };
  sendBtn.addEventListener('click', () => {
    writeSelectionToMessage();
    $('#contacto').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('input[name="nombre"]').focus({ preventScroll: true }), 500);
  });

  /* ------------------------------------------------------------------ *
   * Kits (pestañas accesibles) que cargan piezas en la misma lista
   * ------------------------------------------------------------------ */
  const tabs = $$('#kit-tabs [role="tab"]');
  const panels = $$('.panel');
  const activeItems = () => panels.find((p) => !p.hidden).dataset.items.split(',');
  let kitsSeen = false;
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
    if (kitsSeen) playKit(activeItems());
  };
  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
  $('#kit-tabs').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const last = tabs.length - 1;
    const next = { ArrowDown: (i + 1) % tabs.length, ArrowRight: (i + 1) % tabs.length,
                   ArrowUp: (i + last) % tabs.length, ArrowLeft: (i + last) % tabs.length, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectTab(tabs[next], true);
  });
  selectTab(tabs[0]);
  if (hasIO) {
    const kitsIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      kitsSeen = true;
      playKit(activeItems());
      kitsIO.disconnect();
    }, { threshold: 0.35 });
    kitsIO.observe($('.kits'));
  } else {
    kitsSeen = true;
    playKit(activeItems());
  }

  $$('[data-add-kit]').forEach((b) => b.addEventListener('click', () => {
    b.closest('.panel').dataset.items.split(',').forEach((id) => { const input = box(id); if (input) input.checked = true; });
    renderAll();
    $('#cotizador').scrollIntoView({ behavior: 'smooth' });
  }));

  /* ------------------------------------------------------------------ *
   * Proyectos: solo aparecen si hay fotos reales (mosaico + visor ampliado)
   * ------------------------------------------------------------------ */
  if (PROJECTS.length) {
    const gallery = $('#gallery');
    const lb = $('#lightbox');
    const lbImg = $('.lb-img', lb);
    let cur = 0;
    const show = (i) => {
      cur = (i + PROJECTS.length) % PROJECTS.length;
      lbImg.src = PROJECTS[cur].img;
      lbImg.alt = PROJECTS[cur].alt;
    };
    PROJECTS.forEach((p, i) => {
      const shot = el('button', {
        class: `shot${p.size ? ` ${p.size}` : ''}`, type: 'button', 'data-reveal': '', 'aria-label': `Ampliar foto: ${p.alt}`,
      }, el('img', { src: p.img, alt: p.alt, loading: 'lazy' }));
      shot.addEventListener('click', () => { show(i); lb.showModal(); });
      gallery.append(shot);
    });
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    $('.lb-prev', lb).addEventListener('click', () => show(cur - 1));
    $('.lb-next', lb).addEventListener('click', () => show(cur + 1));
    if (PROJECTS.length < 2) { $('.lb-prev', lb).hidden = true; $('.lb-next', lb).hidden = true; }
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    $('#proyectos').hidden = false;
    $('#nav-proyectos').hidden = false;
  }

  /* ------------------------------------------------------------------ *
   * Entrada de contenido: las líneas se dibujan y luego aparece el texto
   * ------------------------------------------------------------------ */
  if (hasIO) {
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('[data-draw], [data-reveal]').forEach((n) => io.observe(n));
  }

  renderAll();
})();
