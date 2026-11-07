/* Terrafirma Costa Rica · interacciones del sitio
   Edita MODS (lista del cotizador) y PROJECTS (galería) para personalizar el contenido. */
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

  // Proyectos de la galería. Para usar fotos reales agrega `img: '/images/archivo.jpg'`
  // (coloca los archivos en public/images/). Sin `img` se muestra una silueta de ejemplo.
  const PROJECTS = [
    { title: 'Pick-up elevada',        cat: 'suspension', spec: 'Kit de elevación · neumáticos todo terreno', color: '#4f8a43' },
    { title: '4x4 para la trocha',     cat: 'proteccion', spec: 'Defensas · protector de bajos · estribos',   color: '#c9a66b' },
    { title: 'SUV de viaje',           cat: 'overland',   spec: 'Portaequipajes · snorkel · luces LED',       color: '#e5e7eb' },
    { title: 'Expedición con winch',   cat: 'proteccion', spec: 'Winch · puntos de remolque · defensa',       color: '#e0562b' },
    { title: 'Suspensión de largo recorrido', cat: 'suspension', spec: 'Amortiguadores · resortes · barras',  color: '#5b87b5' },
    { title: 'Camper overland',        cat: 'overland',   spec: 'Techo · iluminación · almacenaje',           color: '#8e6bbf' },
  ];

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
   * Cotizador (lista de accesorios)
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

  MODS.forEach(({ cat, items }) => {
    const group = el('fieldset', { class: 'mod-group' }, el('legend', { text: cat }));
    items.forEach((item) => {
      catalog.set(item.id, { ...item, cat });
      const input = el('input', { type: 'checkbox', value: item.id, name: 'mod' });
      group.append(el('label', { class: 'mod' }, input, el('span', { class: 'mod-name', text: item.name })));
    });
    modsBox.append(group);
  });

  const selected = () => $$('input[name="mod"]:checked', modsBox).map((i) => catalog.get(i.value));
  const summaryText = (list) => list.map((m) => `- ${m.name} (${m.cat})`).join('\n');

  const renderSummary = () => {
    const list = selected();
    sumList.replaceChildren(...list.map((m) => el('li', { text: m.name })));
    sumEmpty.hidden = list.length > 0;
    sumCount.textContent = String(list.length);
    sendBtn.disabled = list.length === 0;
    clearBtn.hidden = list.length === 0;
    configField.value = summaryText(list);   // viaja siempre con el formulario
  };

  modsBox.addEventListener('change', renderSummary);
  clearBtn.addEventListener('click', () => {
    $$('input[name="mod"]', modsBox).forEach((i) => { i.checked = false; });
    renderSummary();
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

  // Botones "Cotizar este kit" rellenan el mensaje
  $$('[data-pack]').forEach((a) => a.addEventListener('click', () => {
    if (!message.value.trim()) message.value = `Hola, me interesa el kit "${a.dataset.pack}" para mi 4x4. `;
  }));

  renderSummary();

  /* ------------------------------------------------------------------ *
   * Galería con filtros
   * ------------------------------------------------------------------ */
  const gallery = $('#gallery');
  PROJECTS.forEach((p) => {
    const shot = el('div', { class: 'shot' });
    if (p.img) {
      shot.append(el('img', { src: p.img, alt: p.title, loading: 'lazy' }));
    } else {
      shot.innerHTML = '<svg viewBox="0 0 640 260" aria-hidden="true"><use href="#rig"/></svg>';
      shot.append(el('span', { class: 'sample', text: 'Ejemplo' }));
    }
    gallery.append(el('figure', { class: 'project reveal', 'data-cat': p.cat, style: `--tile:${p.color};color:${p.color}` },
      shot,
      el('figcaption', {}, el('h3', { text: p.title }), el('p', { text: p.spec }))));
  });

  const chips = $$('.chip');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const f = chip.dataset.filter;
    $$('.project', gallery).forEach((p) => { p.hidden = !(f === 'todos' || p.dataset.cat === f); });
  }));

  /* ------------------------------------------------------------------ *
   * Animaciones de entrada
   * ------------------------------------------------------------------ */
  const items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach((n) => io.observe(n));
  } else {
    items.forEach((n) => n.classList.add('in'));
  }
})();
