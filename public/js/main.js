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
  // Ejemplo: { img: '/images/hilux-snorkel.jpg', alt: 'Toyota Hilux con snorkel y portaequipajes instalados' }
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
  const bodyGroup = $('#body-group');
  const hsButtons = new Map();   // id -> [botón sobre el esquema, chip móvil]

  const peek = (id, on) => {
    $$(`[data-part="${id}"], [data-for="${id}"]`, rig).forEach((n) => n.classList.toggle('peek', on));
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
    $$('[data-part]', rig).forEach((p) => p.classList.toggle('on', ids.has(p.dataset.part)));
    $$('[data-for]', rig).forEach((l) => l.classList.toggle('on', ids.has(l.dataset.for)));
    bodyGroup.classList.toggle('lifted', ids.has('elev'));
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
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
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

  $$('[data-add-kit]').forEach((b) => b.addEventListener('click', () => {
    b.closest('.panel').dataset.items.split(',').forEach((id) => { const input = box(id); if (input) input.checked = true; });
    renderAll();
    $('#cotizador').scrollIntoView({ behavior: 'smooth' });
  }));

  /* ------------------------------------------------------------------ *
   * Proyectos: solo aparecen si hay fotos reales
   * ------------------------------------------------------------------ */
  if (PROJECTS.length) {
    const gallery = $('#gallery');
    PROJECTS.forEach((p) => gallery.append(el('img', { src: p.img, alt: p.alt, loading: 'lazy' })));
    $('#proyectos').hidden = false;
    $('#nav-proyectos').hidden = false;
  }

  renderAll();
})();
