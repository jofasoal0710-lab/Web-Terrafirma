/* APEX Garage · interacciones del sitio
   Edita los bloques CONFIG, MODS y PROJECTS para personalizar precios y proyectos. */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * CONFIG
   * ------------------------------------------------------------------ */
  const CONFIG = {
    // Formato de precios. Ejemplos: 'en-US' + 'USD' -> $2,490 · 'es-MX' + 'MXN' -> $2,490
    //                              'es-CO' + 'COP' -> $ 2.490 · 'es-ES' + 'EUR' -> 2490 €
    locale: 'en-US',
    currency: 'USD',
  };

  // Mejoras del cotizador. Precio = piezas + instalación (referencial).
  const MODS = [
    { cat: 'Motor y ECU', items: [
      { id: 'ecu',    name: 'Reprogramación de ECU (Stage 1)',  price: 650 },
      { id: 'filtro', name: 'Filtro de aire de alto flujo',     price: 180 },
      { id: 'inter',  name: 'Intercooler de mayor capacidad',   price: 1150 },
    ]},
    { cat: 'Escape', items: [
      { id: 'catback', name: 'Escape catback en acero inox.',   price: 980 },
      { id: 'down',    name: 'Downpipe de alto flujo',          price: 820 },
    ]},
    { cat: 'Suspensión', items: [
      { id: 'resortes', name: 'Resortes deportivos',            price: 420 },
      { id: 'coil',     name: 'Coilovers regulables',           price: 1450 },
      { id: 'barras',   name: 'Barras estabilizadoras',         price: 360 },
    ]},
    { cat: 'Frenos', items: [
      { id: 'pastillas', name: 'Pastillas deportivas',          price: 240 },
      { id: 'discos',    name: 'Discos ranurados (eje)',        price: 520 },
      { id: 'bbk',       name: 'Kit big brake',                 price: 2400 },
    ]},
    { cat: 'Ruedas', items: [
      { id: 'rines',   name: 'Rines ligeros 18"–19"',           price: 1600 },
      { id: 'llantas', name: 'Neumáticos de alto rendimiento',  price: 780 },
    ]},
    { cat: 'Estética', items: [
      { id: 'wrap', name: 'Wrap completo de color',             price: 2300 },
      { id: 'kit',  name: 'Kit aerodinámico (labio + alerón)',  price: 1100 },
      { id: 'led',  name: 'Iluminación LED y faros',            price: 450 },
    ]},
  ];

  // Proyectos de la galería. Para usar fotos reales agrega `img: '/images/archivo.jpg'`
  // (coloca los archivos en public/images/). Sin `img` se muestra una silueta de ejemplo.
  const PROJECTS = [
    { title: 'Hot hatch Stage 2',     cat: 'rendimiento', spec: 'ECU · downpipe · intercooler',  color: '#ff4d1c' },
    { title: 'Coupé bajado',          cat: 'suspension',  spec: 'Coilovers · rines 19"',         color: '#3b82f6' },
    { title: 'Sedán wrap mate',       cat: 'estetica',    spec: 'Wrap satinado · LED',           color: '#22c55e' },
    { title: 'Proyecto de pista',     cat: 'rendimiento', spec: 'Big brake · semi-slick · turbo', color: '#eab308' },
    { title: 'Daily deportivo',       cat: 'suspension',  spec: 'Resortes · barras estab.',      color: '#a855f7' },
    { title: 'Kit aero y detalles',   cat: 'estetica',    spec: 'Labio · alerón · difusor',      color: '#e5e7eb' },
  ];

  /* ------------------------------------------------------------------ *
   * Utilidades
   * ------------------------------------------------------------------ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = new Intl.NumberFormat(CONFIG.locale, {
    style: 'currency', currency: CONFIG.currency, maximumFractionDigits: 0,
  });
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

  /* ------------------------------------------------------------------ *
   * Año del pie y precios de los packs con el formato de moneda
   * ------------------------------------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
  $$('[data-price]').forEach((n) => { n.textContent = money.format(Number(n.dataset.price)); });

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
   * Cotizador
   * ------------------------------------------------------------------ */
  const modsBox = $('#mods');
  const sumList = $('#sum-list');
  const sumEmpty = $('#sum-empty');
  const sumTotal = $('#sum-total');
  const sendBtn = $('#sum-send');
  const clearBtn = $('#sum-clear');
  const message = $('#mensaje');
  const configField = $('#configuracion');
  const catalog = new Map();

  MODS.forEach(({ cat, items }) => {
    const group = el('fieldset', { class: 'mod-group' }, el('legend', { text: cat }));
    items.forEach((item) => {
      catalog.set(item.id, item);
      const input = el('input', { type: 'checkbox', value: item.id, name: 'mod' });
      const label = el('label', { class: 'mod' }, input,
        el('span', { class: 'mod-name', text: item.name }),
        el('span', { class: 'mod-price', text: money.format(item.price) }));
      group.append(label);
    });
    modsBox.append(group);
  });

  const selected = () => $$('input[name="mod"]:checked', modsBox).map((i) => catalog.get(i.value));
  const summaryText = (list) => list.length
    ? list.map((m) => `- ${m.name}: ${money.format(m.price)}`).join('\n') +
      `\nTotal estimado: ${money.format(list.reduce((s, m) => s + m.price, 0))}`
    : '';

  const renderSummary = () => {
    const list = selected();
    const total = list.reduce((s, m) => s + m.price, 0);
    sumList.replaceChildren(...list.map((m) =>
      el('li', {}, el('span', { text: m.name }), el('span', { text: money.format(m.price) }))));
    sumEmpty.hidden = list.length > 0;
    sumTotal.textContent = money.format(total);
    sendBtn.disabled = list.length === 0;
    clearBtn.hidden = list.length === 0;
    configField.value = summaryText(list);   // viaja siempre con el formulario
  };

  modsBox.addEventListener('change', renderSummary);
  clearBtn.addEventListener('click', () => {
    $$('input[name="mod"]', modsBox).forEach((i) => { i.checked = false; });
    renderSummary();
  });

  const MARK_START = '[Mi configuración]';
  const MARK_END = '[/Mi configuración]';
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

  // Botones "Pedir Stage X" rellenan el mensaje
  $$('[data-pack]').forEach((a) => a.addEventListener('click', () => {
    if (!message.value.trim()) message.value = `Hola, me interesa el pack ${a.dataset.pack}. `;
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
      shot.innerHTML = '<svg viewBox="0 0 640 230" aria-hidden="true"><use href="#car"/></svg>';
      shot.append(el('span', { class: 'sample', text: 'Ejemplo' }));
    }
    const fig = el('figure', { class: 'project reveal', 'data-cat': p.cat, style: `--tile:${p.color};color:${p.color}` },
      shot,
      el('figcaption', {}, el('h3', { text: p.title }), el('p', { text: p.spec })));
    gallery.append(fig);
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
