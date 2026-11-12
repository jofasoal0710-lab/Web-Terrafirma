/* Terrafirma · configurador del hero
   Vehículo, color, vistas y vista previa de las 20 piezas. No tiene lista propia: lee y escribe la lista del sitio
   (casillas de "Mi lista", js/main.js) a través de window.TF, así que hero, catálogo, kits, resumen y asistente siempre coinciden.
   Vive en un Shadow DOM: su CSS (css/configurador.css) no se mezcla con el del sitio.
   Imágenes: images/configurador/<vista>/<vehículo>/<pieza>.webp (ver tools/render/README.md); datos: js/configurador-data.js. */
(() => {
  'use strict';
  const TF = window.TF;
  const DATA = window.TF_CFG;
  const host = document.getElementById('configurador');
  if (!TF || !TF.ids || !DATA || !host || !host.attachShadow) { if (host) host.hidden = true; return; }   // sin configurador no dejamos un hueco: el catálogo y los kits siguen sirviendo para armar la lista
  const META = DATA;   // { views: { frente|lado|atras: { aspect, vehicles: { suv|pickup|compact: { lift, anchors } } } } }
  const IMG = '/images/configurador';
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
<link rel="stylesheet" href="/css/configurador.css">
<div class="app" id="app">
  <header class="head">
    <h2>Configura tu 4x4</h2>
    <button class="btn" type="button" id="head-cta"><span class="cta-l">Solicitar cotización</span><span class="cta-s">Cotizar</span><span id="cta-n"></span></button>
  </header>

  <section class="stage" id="stage" aria-label="Vehículo con las piezas elegidas">
    <img class="bg" src="${IMG}/fondo.webp" alt="" width="1920" height="1080">
    <div class="stagebar">
      <button class="vchip" type="button" id="veh-btn" aria-label="Cambiar de vehículo">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15.5V12l1.8-4.2a1.8 1.8 0 0 1 1.7-1.1h6.4a1.8 1.8 0 0 1 1.4.7L18 11l2 .6v3.9M4 15.5h2.2M9.8 15.5h4.4M17.8 15.5H20"/><circle cx="8" cy="16" r="1.9"/><circle cx="16" cy="16" r="1.9"/></svg>
        <span id="veh-name"></span>
        <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="views" id="views" role="radiogroup" aria-label="Vista del vehículo"></div>
    </div>
    <p class="tag"><span class="t-long">Imagen provisional: vehículos y accesorios de prueba</span><span class="t-short">Imagen provisional</span></p>
    <div class="hint" id="hint"><span id="hint-t"></span><button class="hint-btn" id="hint-b" type="button" hidden></button></div>
    <div class="vehicles" id="vehicles" role="img" aria-label="Vehículo 4x4 con las piezas que elegiste"></div>
  </section>

  <nav class="rail" role="tablist" aria-label="Secciones del configurador" aria-orientation="vertical" id="rail">
    <button class="tab" role="tab" id="tab-vehiculo" aria-controls="pane-vehiculo" aria-selected="false" tabindex="-1" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 15.5V12l1.9-4.3A2 2 0 0 1 7.2 6.5h6.6a2 2 0 0 1 1.5.7L18 10.5l2.5.7v4.3M3.5 15.5h2.3M10.2 15.5h3.6M18.2 15.5h2.3"/><circle cx="8" cy="16.5" r="2"/><circle cx="16" cy="16.5" r="2"/></svg>Vehículo</button>
    <button class="tab" role="tab" id="tab-color" aria-controls="pane-color" aria-selected="false" tabindex="-1" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5s5.5 5.8 5.5 9.4a5.5 5.5 0 0 1-11 0C6.5 9.3 12 3.5 12 3.5z"/></svg>Color</button>
    <button class="tab" role="tab" id="tab-piezas" aria-controls="pane-piezas" aria-selected="true" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3.5 17.2a1.6 1.6 0 0 0 2.3 2.3l5.8-5.8a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.1-.6-.6-2.1z"/></svg>Piezas</button>
    <button class="tab" role="tab" id="tab-kits" aria-controls="pane-kits" aria-selected="false" tabindex="-1" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 8l8.5-4 8.5 4v8.5L12 20.5l-8.5-4zM3.5 8l8.5 4 8.5-4M12 12v8.5"/></svg>Kits</button>
    <button class="tab" role="tab" id="tab-lista" aria-controls="pane-lista" aria-selected="false" tabindex="-1" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5h6M8 3h8v3H8zM6.5 5H5v15.5h14V5h-1.5M9 11h6M9 15h6"/></svg>Mi lista<span class="badge" id="badge" hidden>0</span></button>
  </nav>

  <section class="panel" id="panel">
    <div class="pane" id="pane-vehiculo" role="tabpanel" aria-labelledby="tab-vehiculo" hidden>
      <div class="bar">
        <div class="chips"><span class="note flat">Elige la silueta de tu vehículo. Las piezas que ya añadiste se conservan.</span></div>
        <div class="arrows" data-for="car-vehiculos">
          <button class="arrow prev" type="button" aria-label="Ver vehículos anteriores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="arrow next" type="button" aria-label="Ver más vehículos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
      <div class="car-wrap"><ul class="car" id="car-vehiculos" aria-label="Vehículos disponibles"></ul></div>
    </div>
    <div class="pane" id="pane-color" role="tabpanel" aria-labelledby="tab-color" hidden>
      <div class="bar">
        <div class="chips"><span class="note flat">Color del vehículo: <span id="color-name"></span>. Solo para visualizar tu vehículo; no cambia la cotización.</span></div>
      </div>
      <div class="swatches" id="swatches" role="radiogroup" aria-label="Color del vehículo"></div>
    </div>
    <div class="pane" id="pane-piezas" role="tabpanel" aria-labelledby="tab-piezas">
      <div class="bar">
        <div class="chips" id="chips" role="group" aria-label="Categorías de piezas"></div>
        <div class="arrows" data-for="car-piezas">
          <button class="arrow prev" type="button" aria-label="Ver piezas anteriores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="arrow next" type="button" aria-label="Ver más piezas"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
      <div class="car-wrap"><ul class="car" id="car-piezas" aria-label="Piezas disponibles"></ul></div>
    </div>
    <div class="pane" id="pane-kits" role="tabpanel" aria-labelledby="tab-kits" hidden>
      <div class="bar">
        <div class="chips"><span class="note flat">Tres combinaciones de partida. Se suman a tu lista y puedes ajustarlas.</span></div>
        <div class="arrows" data-for="car-kits">
          <button class="arrow prev" type="button" aria-label="Ver kits anteriores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="arrow next" type="button" aria-label="Ver más kits"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>
      <div class="car-wrap"><ul class="car" id="car-kits" aria-label="Kits sugeridos"></ul></div>
    </div>
    <div class="pane" id="pane-lista" role="tabpanel" aria-labelledby="tab-lista" hidden>
      <div class="lista" id="lista"></div>
    </div>
  </section>
  <p class="sr-only" id="status" role="status" aria-live="polite"></p>
</div>`;

  /* ------------------------------------------------------------------ *
   * Datos
   * ------------------------------------------------------------------ */
  const WHY = {
    elev: 'Más altura libre para caminos difíciles.', amort: 'Mejor control en terreno irregular.', resor: 'Soportan mejor el peso y la carga.',
    skid: 'Protege el motor y los bajos de golpes en la trocha.', rock: 'Protegen los costados de las piedras.',
    'def-del': 'Protección frontal y soporte para un winch.', 'def-tra': 'Protección trasera y base para accesorios.', winch: 'Para salir de atascos por tu cuenta.',
    remol: 'Puntos seguros para recuperar el vehículo.', recup: 'Equipo para recuperar tu 4x4 u otro vehículo.',
    rack: 'Espacio extra para equipaje en el techo.', barras: 'Base para llevar carga en el techo.', soport: 'Sujetan la carga y los accesorios.',
    snork: 'Toma de aire elevada para cruzar zonas con agua.', repu: 'Lleva la llanta de repuesto fuera de la cabina.',
    led: 'Visibilidad a larga distancia de noche.', faros: 'Más luz al frente de noche.', trab: 'Luz para trabajar cuando oscurece.',
    filtro: 'Mejor filtrado del aire en caminos con polvo.', rines: 'Ruedas pensadas para el uso fuera de carretera.',
  };
  // etiquetas de las piezas con imagen: las de arriba van en una fila y las de abajo en otra, con líneas de distinto largo
  // [dirección, punto de la caja de la pieza donde nace la línea (0..1 en x)]
  const PIN = {
    rack: ['up', 0.25], led: ['up', 0.75], snork: ['up', 0.5], barras: ['up', 0.5], soport: ['up', 0.5], trab: ['up', 0.5], recup: ['up', 0.5], filtro: ['up', 0.5],
    rock: ['down', 0.45], winch: ['down', 0.5], 'def-del': ['down', 0.5], 'def-tra': ['down', 0.5], remol: ['down', 0.3], repu: ['down', 0.5], faros: ['down', 0.5], rines: ['down', 0.25], amort: ['down', 0.3], resor: ['down', 0.7], skid: ['down', 0.5],
  };
  const GHOST = new Set(['amort', 'resor', 'skid', 'filtro']);    // piezas internas o por debajo: se ven en transparencia
  const NOSHIFT = new Set(['rines', 'amort', 'resor']);           // van en las ruedas: no suben con el kit de elevación
  const VEHICLES = [
    ['suv', 'SUV 4x4', 'Familiar de cinco puertas'],
    ['pickup', 'Pick-up', 'Cabina y caja abierta'],
    ['compact', '4x4 compacto', 'Corto, con llanta atrás'],
  ];
  const VNAME = Object.fromEntries(VEHICLES.map(([id, name]) => [id, name]));
  const VIEWS = [['frente', 'Frente'], ['lado', 'Lado'], ['atras', 'Atrás']];
  const WNAME = Object.fromEntries(VIEWS);
  // [id, nombre, color de la muestra, color con el que se tiñe la máscara (más claro: la base gris lo oscurece al multiplicar), color de la marca de selección]
  const COLORS = [
    ['blanco', 'Blanco', '#f1f1ec', '#ffffff', '#1b1c1e'], ['plata', 'Plata', '#b8bbbf', '#dcdfe3', '#1b1c1e'], ['grafito', 'Gris grafito', '#55585d', '#6f7379', '#ffffff'], ['negro', 'Negro', '#1b1c1e', '#2a2c30', '#ffffff'],
    ['azul', 'Azul', '#1f4aa8', '#2a5fd6', '#ffffff'], ['verde', 'Verde', '#1f6a3c', '#2a8a4e', '#ffffff'], ['rojo', 'Rojo', '#b3261e', '#e0342a', '#ffffff'], ['arena', 'Arena', '#c2a273', '#e6c690', '#1b1c1e'],
  ];
  const CNAME = Object.fromEntries(COLORS.map(([id, name]) => [id, name]));
  const PIN_NAME = { rack: 'Portaequipajes', snork: 'Snorkel', led: 'Barra LED', rock: 'Rock sliders', winch: 'Winch', 'def-del': 'Defensa delantera', 'def-tra': 'Defensa trasera', remol: 'Remolque', recup: 'Recuperación', barras: 'Barras de techo', soport: 'Soportes de carga', repu: 'Llanta de repuesto', faros: 'Luces LED', trab: 'Luces de trabajo', rines: 'Rines', amort: 'Amortiguadores', resor: 'Resortes', skid: 'Protector de bajos', filtro: 'Filtro de aire' };
  const PIN_SHORT = { rack: 'Rack', snork: 'Snorkel', led: 'LED', rock: 'Sliders', winch: 'Winch', 'def-del': 'Def. del.', 'def-tra': 'Def. tras.', remol: 'Remolque', recup: 'Recup.', barras: 'Barras', soport: 'Soportes', repu: 'Repuesto', faros: 'Faros', trab: 'Trabajo', rines: 'Rines', amort: 'Amort.', resor: 'Resortes', skid: 'Bajos', filtro: 'Filtro' };   // para escenarios estrechos

  // Piezas y categorías: salen del catálogo del sitio (MODS en main.js), así que los nombres nunca se desincronizan.
  const MODS = TF.mods();
  const CATS = MODS.map((m) => m.cat);
  const ITEMS = new Map();
  MODS.forEach(({ cat, items }) => items.forEach(({ id, name }) => ITEMS.set(id, {
    id, name, cat, why: WHY[id] || '',
    preview: id === 'elev' || Object.values(META.views).some((vw) => Object.values(vw.vehicles).some((v) => !!v.anchors[id])),
  })));
  // Kits: salen de las pestañas de la sección Kits del sitio
  const KITS = [...document.querySelectorAll('.kits .panel')].map((p) => [
    p.querySelector('.panel-title').textContent.trim(), p.querySelector('.panel-lead').textContent.trim(), p.dataset.items.split(',').filter((id) => ITEMS.has(id)),
  ]);

  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const el = (tag, attrs = {}, ...kids) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v); } kids.forEach((k) => n.append(k)); return n; };
  // la máscara de pintura se pone con el CSSOM (no con un atributo style)
  const masked = (node, url) => { node.style.setProperty('-webkit-mask-image', `url(${url})`); node.style.setProperty('mask-image', `url(${url})`); return node; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = () => Boolean(navigator.connection && navigator.connection.saveData);
  const KEY = 'tf-config';   // solo vehículo, color y vista; la lista la guarda el sitio (tf-lista)

  /* ------------------------------------------------------------------ *
   * Estado: la lista es la del sitio
   * ------------------------------------------------------------------ */
  let order = TF.ids();                  // ids de la lista, en el orden en que se añadieron
  let selected = new Set(order);
  const pull = () => {                   // sincroniza con la lista del sitio conservando el orden de adición
    const ids = TF.ids();
    const keep = order.filter((id) => ids.includes(id));
    ids.forEach((id) => { if (!keep.includes(id)) keep.push(id); });
    order = keep; selected = new Set(order);
  };
  let vehicle = VEHICLES[0][0];
  let color = 'azul';
  let view = VIEWS[0][0];
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && VNAME[s.v]) vehicle = s.v;
    if (s && CNAME[s.c]) color = s.c;
    if (s && WNAME[s.w]) view = s.w;
  } catch (e) { /* sin almacenamiento */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: vehicle, c: color, w: view })); } catch (e) { /* ok */ } };

  /* ------------------------------------------------------------------ *
   * Escenario: un vehículo por cada modelo y vista, con sus capas y etiquetas (se montan cuando hacen falta)
   * ------------------------------------------------------------------ */
  const vehiclesEl = $('#vehicles');
  const rigs = new Map();
  const anchorsOf = (vid, w) => META.views[w].vehicles[vid].anchors;
  let recent = [];   // las piezas elegidas más recientes (5, 4 o 3 según el ancho): solo ellas llevan etiqueta; las demás, un punto
  const labelMax = () => { const w = $('#stage').clientWidth; return w >= 820 ? 5 : w >= 520 ? 4 : 3; };
  const updateRecent = () => { recent = order.filter((id) => id !== 'elev' && ITEMS.get(id).preview).slice(-labelMax()); };
  const visibleIn = (vid, w, id) => id === 'elev' || !!anchorsOf(vid, w)[id];
  function ensureRig(vid, w) {
    const key = `${vid}|${w}`;
    if (rigs.has(key)) return rigs.get(key);
    const dir = `${IMG}/${w}/${vid}`;
    const paintN = masked(el('div', { class: 'paint p-n' }), `${dir}/mask.webp`);
    const rig = el('div', { class: 'vehicle', 'data-v': vid, 'data-w': w, 'aria-hidden': 'true' }, el('img', { class: 'layer base b-n', src: `${dir}/base.webp`, alt: '', draggable: 'false' }), paintN);
    rig.style.setProperty('--aspect', META.views[w].aspect);
    rig.style.setProperty('--liftn', META.views[w].vehicles[vid].lift);
    const layers = new Map(); const pins = new Map();
    const pts = Object.entries(anchorsOf(vid, w)).map(([id, [x0, y0, x1, y1]]) => { const [pd, fx] = PIN[id] || ['up', 0.5]; return { id, dir: pd, x: x0 + (x1 - x0) * fx, y: pd === 'up' ? y0 : y1 }; });
    const ups = pts.filter((q) => q.dir === 'up').sort((m, n) => m.x - n.x); const downs = pts.filter((q) => q.dir === 'down');
    const yTop = ups.length ? Math.min(...ups.map((q) => q.y)) : 14; const yBot = downs.length ? Math.max(...downs.map((q) => q.y)) : 0;
    rig.style.setProperty('--mt', (yTop / 100).toFixed(3));
    const SH = { end: 'calc(-100% + 3px)', center: '-50%', start: '-3px' };
    ups.forEach((q, i) => { q.sh = ups.length === 1 ? SH.center : ups.length === 2 ? [SH.end, SH.start][i] : [SH.end, SH.center, SH.start][Math.min(i, 2)]; q.dy = q.y - yTop; });
    downs.forEach((q) => { q.sh = SH.center; q.dy = yBot - q.y; });
    pts.forEach(({ id, dir: pd, x, y, sh, dy }) => {
      const pin = el('span', { class: `pin ${pd}${GHOST.has(id) ? ' ghost' : ''}${NOSHIFT.has(id) ? ' fixed' : ''}`, 'data-id': id, 'aria-hidden': 'true' }, el('i'), el('b', {}, el('span', { class: 'n-l', text: PIN_NAME[id] || ITEMS.get(id).name }), el('span', { class: 'n-s', text: PIN_SHORT[id] || PIN_NAME[id] || ITEMS.get(id).name })));
      pin.style.setProperty('--x', `${x.toFixed(2)}%`); pin.style.setProperty('--y', `${y.toFixed(2)}%`);
      pin.style.setProperty('--dy', dy.toFixed(2)); pin.style.setProperty('--sh', sh);
      rig.append(pin); pins.set(id, pin);
    });
    const r = { rig, layers, pins, dir, paintN, lift: false };
    vehiclesEl.append(rig); rigs.set(key, r);
    applyRig(r); layoutPins(r);
    return r;
  }
  // las imágenes de cada pieza se piden solo cuando se elige por primera vez (y las del vehículo elevado, al elegir el kit de elevación)
  function addLayer(r, id) {
    const img = el('img', { class: `layer${GHOST.has(id) ? ' ghost' : ''}${NOSHIFT.has(id) ? ' fixed' : ''}`, src: `${r.dir}/${id}.webp`, 'data-id': id, alt: '', draggable: 'false' });
    const firstPin = r.pins.values().next().value;
    if (firstPin) r.rig.insertBefore(img, firstPin); else r.rig.append(img);
    r.layers.set(id, img);
    requestAnimationFrame(() => img.classList.toggle('on', selected.has(id)));
  }
  function addLift(r) {
    if (r.lift) return; r.lift = true;
    const b = el('img', { class: 'layer base b-l', src: `${r.dir}/base-lift.webp`, alt: '', draggable: 'false' });
    const pt = masked(el('div', { class: 'paint p-l' }), `${r.dir}/mask-lift.webp`);
    r.paintN.after(b); b.after(pt);
  }
  function applyRig(r) {
    const lifted = selected.has('elev');
    if (lifted) addLift(r);
    r.rig.classList.toggle('lifted', lifted);
    r.pins.forEach((pin, id) => { const on = selected.has(id); if (on && !r.layers.has(id)) addLayer(r, id); pin.classList.toggle('on', on); pin.classList.toggle('lab', on && recent.includes(id)); });
    r.layers.forEach((img, id) => img.classList.toggle('on', selected.has(id)));
  }
  // coloca las etiquetas de cada fila (arriba / abajo) sin que se pisen: la que choca sube (o baja) una fila.
  // Solo cuenta las etiquetas visibles; los controles del escenario cuentan como obstáculos.
  const hit = (m, n) => m.left < n.right - 1 && n.left < m.right - 1 && m.top < n.bottom - 1 && n.top < m.bottom - 1;
  function layoutPins(r) {
    r.pins.forEach((pin) => { pin.style.setProperty('--bump', '0px'); pin.classList.remove('nolab'); });
    const obst = ['#veh-btn', '#views', '.tag'].map((q) => $(q).getBoundingClientRect());
    const rows = { up: [], down: [] };
    r.pins.forEach((pin) => { if (pin.classList.contains('lab')) rows[pin.classList.contains('up') ? 'up' : 'down'].push(pin); });
    const placed = [];
    // la etiqueta y su línea juntas no deben tocar otra etiqueta, otra línea ni los controles
    const shapes = (pin, lab) => {
      const pt = pin.getBoundingClientRect(); const rc = lab.getBoundingClientRect(); const up = pin.classList.contains('up');
      const line = { left: pt.left - 1, right: pt.left + 1, top: up ? rc.bottom : pt.top, bottom: up ? pt.top : rc.top };
      return [rc, line];
    };
    Object.values(rows).forEach((pins) => {
      pins.sort((m, n) => m.getBoundingClientRect().left - n.getBoundingClientRect().left);
      pins.forEach((pin) => {
        const lab = $('b', pin); let done = false;
        for (let bump = 0; bump <= 1 && !done; bump += 1) {
          pin.style.setProperty('--bump', `${bump * (lab.offsetHeight + 4)}px`);
          const mine = shapes(pin, lab);
          if (!mine.some((m) => placed.some((q) => hit(m, q)) || obst.some((q) => hit(m, q)))) { placed.push(...mine); done = true; }
        }
        if (!done) { pin.style.setProperty('--bump', '0px'); pin.classList.add('nolab'); }   // no cabe: queda solo el punto
      });
    });
  }
  let layoutRaf = 0;
  const relayout = () => { cancelAnimationFrame(layoutRaf); layoutRaf = requestAnimationFrame(() => { updateRecent(); rigs.forEach((r) => { applyRig(r); layoutPins(r); }); }); };
  new ResizeObserver(relayout).observe($('#stage'));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  // muestra el vehículo y la vista actuales; espera a que cargue la imagen base para no mostrar un cuadro vacío
  let showToken = 0; let warmTimer = 0;
  function showRig() {
    const key = `${vehicle}|${view}`; const r = ensureRig(vehicle, view); const token = ++showToken;
    const base = $('.base', r.rig);
    const go = () => { if (token === showToken) rigs.forEach((x, k) => x.rig.classList.toggle('active', k === key)); };
    if (base.complete) go(); else Promise.race([base.decode().catch(() => {}), new Promise((res) => setTimeout(res, 700))]).then(go);
    if (!warmTimer && !saveData()) warmTimer = setTimeout(() => warm('views'), 2500);
  }
  // tras cargar, monta en segundo plano las otras vistas del vehículo actual (y, al abrir la pestaña Vehículo, los demás vehículos)
  // para que cambiar sea instantáneo sin descargar de más si nadie lo usa
  function warm(kind) {
    if (saveData()) return;
    const todo = [];
    if (kind === 'views') VIEWS.forEach(([w]) => { if (!rigs.has(`${vehicle}|${w}`)) todo.push([vehicle, w]); });
    else VEHICLES.forEach(([vid]) => { if (!rigs.has(`${vid}|${view}`)) todo.push([vid, view]); });
    (function next() { const m = todo.shift(); if (!m) return; ensureRig(m[0], m[1]); setTimeout(next, 200); })();
  }

  /* ------------------------------------------------------------------ *
   * Tarjetas: las acciones pasan por la lista del sitio (TF)
   * ------------------------------------------------------------------ */
  const status = $('#status');
  const say = (t) => { status.textContent = ''; setTimeout(() => { status.textContent = t; }, 30); };
  const toggle = (id) => {
    const on = TF.toggle(id, true);       // silencioso: el aviso lo da este componente con el nombre de la pieza
    say(`${on ? 'Añadido' : 'Quitado'}: ${ITEMS.get(id).name}. ${order.length} en tu lista.`);
  };
  const addBtn = (id) => {
    const b = el('button', { class: 'add', type: 'button', 'aria-pressed': 'false', 'data-id': id }, el('span', { class: 'dot' }), el('span', { class: 'lbl', text: 'Añadir a mi lista' }));
    b.addEventListener('click', () => toggle(id));
    return b;
  };
  const chips = $('#chips'); let cat = 'Todas';
  ['Todas', ...CATS].forEach((c) => {
    const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(c === cat), text: c });
    b.addEventListener('click', () => {
      cat = c; $$('.chip', chips).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('#car-piezas .card').forEach((card) => { card.hidden = !(c === 'Todas' || card.dataset.cat === c); });
      $('#car-piezas').scrollTo({ left: 0 }); sync($('#car-piezas'));
    });
    chips.append(b);
  });
  const carP = $('#car-piezas');
  ITEMS.forEach((it) => {
    const li = el('li', { class: 'card', 'data-id': it.id, 'data-cat': it.cat },
      el('div', { class: 'card-top' }, el('span', { class: 'cat', text: it.cat }), ...(it.preview ? [el('span', { class: `pv${GHOST.has(it.id) ? ' ghost' : ''}`, text: GHOST.has(it.id) ? 'Vista interna' : 'Vista previa' })] : [])),
      el('h3', { text: it.name }), el('p', { text: it.why }), addBtn(it.id));
    carP.append(li);
  });
  const carK = $('#car-kits');
  KITS.forEach(([name, lead, ids], i) => {
    const ul = el('ul', { class: 'incl' }); ids.forEach((id) => ul.append(el('li', { text: ITEMS.get(id).name })));
    const b = el('button', { class: 'add', type: 'button', 'data-kit': String(i) }, el('span', { class: 'dot' }), el('span', { class: 'lbl', text: 'Añadir kit' }));
    b.addEventListener('click', () => {
      const fresh = ids.filter((id) => !selected.has(id));
      TF.add(ids, true);
      say(fresh.length ? `Kit ${name}: ${fresh.length} ${fresh.length === 1 ? 'pieza añadida' : 'piezas añadidas'}. ${order.length} en tu lista.` : `Kit ${name}: todas sus piezas ya estaban en tu lista.`);
    });
    const p = el('p', { text: lead }); p.style.flex = '0 0 auto';
    carK.append(el('li', { class: 'card', 'data-kit': String(i) }, el('div', { class: 'card-top' }, el('span', { class: 'cat', text: `${ids.length} piezas` })), el('h3', { text: name }), p, ul, b));
  });

  /* ------------------------------------------------------------------ *
   * Vehículo, color y vista
   * ------------------------------------------------------------------ */
  const carV = $('#car-vehiculos');
  VEHICLES.forEach(([vid, name, desc]) => {
    const b = el('button', { class: 'add', type: 'button', 'aria-pressed': 'false', 'data-v': vid }, el('span', { class: 'dot' }), el('span', { class: 'lbl', text: 'Elegir' }));
    b.addEventListener('click', () => setVehicle(vid, true));
    carV.append(el('li', { class: 'card veh', 'data-v': vid },
      el('div', { class: 'thumbw' }, el('img', { class: 'thumb', src: `${IMG}/frente/${vid}/thumb.webp`, alt: '', loading: 'lazy', draggable: 'false' }), masked(el('div', { class: 'paint' }), `${IMG}/frente/${vid}/thumb-mask.webp`)),
      el('div', { class: 'vtxt' }, el('span', { class: 'cat', text: desc }), el('h3', { text: name }), b)));
  });
  function setVehicle(vid, user) {
    if (!VNAME[vid]) return;
    const changed = vid !== vehicle; vehicle = vid;
    showRig();
    $('#veh-name').textContent = VNAME[vid];
    $('#veh-btn').setAttribute('aria-label', `Cambiar de vehículo. Vehículo actual: ${VNAME[vid]}`);
    $$('#car-vehiculos .card').forEach((c) => {
      const on = c.dataset.v === vid; c.classList.toggle('in', on);
      const b = $('.add', c); b.setAttribute('aria-pressed', String(on)); $('.lbl', b).textContent = on ? 'Elegido' : 'Elegir';
      b.setAttribute('aria-label', `${on ? 'Vehículo elegido' : 'Elegir vehículo'}: ${VNAME[c.dataset.v]}`);
    });
    stageLabel();
    if (user) { render(); save(); if (changed) say(`Vehículo: ${VNAME[vid]}. Tus ${order.length} piezas se conservan.`); }
  }
  const sw = $('#swatches');
  COLORS.forEach(([cid, name, shown, , ck]) => {
    const b = el('button', { class: 'sw', type: 'button', role: 'radio', 'aria-checked': 'false', 'aria-label': name, title: name, 'data-c': cid });
    b.style.setProperty('--c', shown); b.style.setProperty('--ck', ck);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    b.addEventListener('click', () => setColor(cid, true));
    b.addEventListener('keydown', (e) => {
      const i = COLORS.findIndex((c) => c[0] === cid); const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); const nx = COLORS[(i + step + COLORS.length) % COLORS.length][0]; setColor(nx, true); $(`.sw[data-c="${nx}"]`).focus(); }
    });
    sw.append(b);
  });
  function setColor(cid, user) {
    if (!CNAME[cid]) return;
    const changed = cid !== color; color = cid;
    $('#app').style.setProperty('--paint', COLORS.find((c) => c[0] === cid)[3]);
    $('#color-name').textContent = CNAME[cid];
    $$('.sw', sw).forEach((b) => { const on = b.dataset.c === cid; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    stageLabel();
    if (user) { save(); if (changed) say(`Color: ${CNAME[cid]}.`); }
  }
  const viewsEl = $('#views');
  VIEWS.forEach(([wid, name]) => {
    const b = el('button', { class: 'vw', type: 'button', role: 'radio', 'aria-checked': 'false', 'data-w': wid, text: name });
    b.addEventListener('click', () => setView(wid, true));
    b.addEventListener('keydown', (e) => {
      const i = VIEWS.findIndex((x) => x[0] === wid); const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); const nx = VIEWS[(i + step + VIEWS.length) % VIEWS.length][0]; setView(nx, true); $(`.vw[data-w="${nx}"]`).focus(); }
    });
    viewsEl.append(b);
  });
  function setView(wid, user) {
    if (!WNAME[wid]) return;
    const changed = wid !== view; view = wid;
    $$('.vw', viewsEl).forEach((b) => { const on = b.dataset.w === wid; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    showRig(); stageLabel();
    if (user) { render(); save(); if (changed) say(`Vista: ${WNAME[wid]}.`); }
  }
  const cycleView = (d) => { const i = VIEWS.findIndex((x) => x[0] === view); setView(VIEWS[(i + d + VIEWS.length) % VIEWS.length][0], true); };
  // deslizar sobre el escenario gira la vista (como en los configuradores 3D)
  { const stage = $('#stage'); let sx = 0; let sy = 0; let down = false;
    stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button, a')) return; sx = e.clientX; sy = e.clientY; down = true; });
    stage.addEventListener('pointerup', (e) => { if (!down) return; down = false; const dx = e.clientX - sx; const dy = e.clientY - sy; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) cycleView(dx < 0 ? 1 : -1); });
    stage.addEventListener('pointercancel', () => { down = false; });
    $('#hint-b').addEventListener('click', (e) => { const w = e.currentTarget.dataset.w; if (w) setView(w, true); }); }
  const stageLabel = () => { const n = order.length; vehiclesEl.setAttribute('aria-label', `${VNAME[vehicle]} color ${CNAME[color].toLowerCase()}, vista ${WNAME[view].toLowerCase()}, con ${n ? `${n} ${n === 1 ? 'pieza elegida' : 'piezas elegidas'}` : 'ninguna pieza elegida'}`); };
  $('#veh-btn').addEventListener('click', () => openTab($('#tab-vehiculo'), true));

  /* ------------------------------------------------------------------ *
   * Flechas de los carruseles
   * ------------------------------------------------------------------ */
  function sync(car) {
    const wrap = $(`.arrows[data-for="${car.id}"]`); const [prev, next] = [$('.prev', wrap), $('.next', wrap)];
    prev.disabled = car.scrollLeft < 4; next.disabled = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4;
  }
  $$('.car').forEach((car) => {
    const wrap = $(`.arrows[data-for="${car.id}"]`);
    $('.prev', wrap).addEventListener('click', () => car.scrollBy({ left: -car.clientWidth * 0.8, behavior: reduced.matches ? 'auto' : 'smooth' }));
    $('.next', wrap).addEventListener('click', () => car.scrollBy({ left: car.clientWidth * 0.8, behavior: reduced.matches ? 'auto' : 'smooth' }));
    let t = 0; car.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(() => sync(car)); }, { passive: true });
    sync(car);
  });
  addEventListener('resize', () => $$('.car').forEach(sync));

  /* ------------------------------------------------------------------ *
   * Mi lista (la misma del sitio)
   * ------------------------------------------------------------------ */
  const lista = $('#lista');
  const seen = (id) => VIEWS.filter(([w]) => visibleIn(vehicle, w, id)).map((x) => x[1]);
  const metaText = (id, it) => {
    const v = seen(id);
    if (id === 'elev') return `${it.cat} · el vehículo se eleva en todas las vistas`;
    if (!v.length) return `${it.cat} · sin vista previa aún`;
    return GHOST.has(id) ? `${it.cat} · se ve en transparencia, en: ${v.join(', ')}` : `${it.cat} · se ve en: ${v.join(', ')}`;
  };
  function renderLista() {
    const n = order.length;
    const colA = el('div', { class: 'col-a' }, el('h2', { text: n ? `Tu lista · ${n}` : 'Tu lista' }), el('p', { class: 'note tight', text: `Vehículo: ${VNAME[vehicle]}` }));
    lista.replaceChildren(colA);
    if (!n) { colA.append(el('p', { class: 'empty', text: 'Aún no has elegido nada. Añade piezas o un kit y aparecerán aquí.' })); return; }
    const rows = el('ul', { class: 'rows' });
    order.forEach((id) => {
      const it = ITEMS.get(id);
      const rm = el('button', { class: 'rm', type: 'button', 'aria-label': `Quitar ${it.name}` });
      rm.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      rm.addEventListener('click', () => toggle(id));
      rows.append(el('li', {}, el('span', {}, document.createTextNode(it.name), el('span', { class: 'meta', text: metaText(id, it) })), rm));
    });
    const send = el('button', { class: 'btn', type: 'button', text: 'Solicitar cotización' });
    const clear = el('button', { class: 'btn btn-line', type: 'button', text: 'Vaciar lista' });
    send.addEventListener('click', () => TF.request());
    clear.addEventListener('click', () => { TF.clear(true); say('Lista vacía.'); });
    colA.append(rows);
    lista.append(el('div', { class: 'col-b' }, el('div', { class: 'actions' }, send, clear), el('p', { class: 'note', text: 'Cambia de vista para ver cada pieza desde otro lado. La cotización final depende de tu vehículo.' })));
  }

  /* ------------------------------------------------------------------ *
   * Pintar todo desde un único estado
   * ------------------------------------------------------------------ */
  const badge = $('#badge'); const headCta = $('#head-cta'); const hint = $('#hint'); let lastCount = -1;
  function render() {
    $$('#car-piezas .card').forEach((c) => {
      const on = selected.has(c.dataset.id); c.classList.toggle('in', on);
      const b = $('.add', c); b.setAttribute('aria-pressed', String(on)); $('.lbl', b).textContent = on ? 'En tu lista · Quitar' : 'Añadir a mi lista';
      b.setAttribute('aria-label', `${on ? 'Quitar de mi lista' : 'Añadir a mi lista'}: ${ITEMS.get(c.dataset.id).name}`);
    });
    $$('#car-kits .card').forEach((c) => {
      const ids = KITS[+c.dataset.kit][2]; const all = ids.every((id) => selected.has(id));
      c.classList.toggle('in', all); const b = $('.add', c); b.setAttribute('aria-pressed', String(all));
      $('.lbl', b).textContent = all ? 'Kit en tu lista' : (ids.some((id) => selected.has(id)) ? 'Completar kit' : 'Añadir kit');
      b.setAttribute('aria-label', `${all ? 'Kit ya en tu lista' : 'Añadir kit'}: ${KITS[+c.dataset.kit][0]}`);
    });
    updateRecent();
    rigs.forEach((r) => { applyRig(r); layoutPins(r); });
    stageLabel();
    const n = order.length;
    badge.hidden = !n; badge.textContent = n;
    if (n !== lastCount && lastCount !== -1 && !reduced.matches) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
    lastCount = n;
    $('#cta-n').textContent = n ? `(${n})` : '';
    headCta.setAttribute('aria-label', n ? `Solicitar cotización, ${n} ${n === 1 ? 'accesorio' : 'accesorios'} en tu lista` : 'Solicitar cotización');
    const previewSel = order.filter((id) => ITEMS.get(id).preview);
    const score = (w) => previewSel.filter((id) => visibleIn(vehicle, w, id)).length;
    const hb = $('#hint-b'); let text = ''; hb.hidden = true; hb.dataset.w = '';
    if (!n) text = 'Elige piezas abajo y míralas puestas en el vehículo.';
    else if (previewSel.length && score(view) === 0) {
      text = 'Nada de tu lista se ve desde esta vista.';
      const best = VIEWS.map(([w]) => [w, score(w)]).filter(([w, sc]) => w !== view && sc > 0).sort((m, n2) => n2[1] - m[1])[0];
      if (best) { hb.hidden = false; hb.textContent = `Ver en ${WNAME[best[0]]}`; hb.dataset.w = best[0]; }
    } else if (!previewSel.length) text = 'Estas piezas se añaden a tu lista, aunque aún no tienen vista previa.';
    $('#hint-t').textContent = text; hint.hidden = !text;
    renderLista();
  }
  // la lista cambió (aquí o en el catálogo, los kits, el resumen o el asistente)
  document.addEventListener('tf:list', () => { pull(); render(); });

  /* ------------------------------------------------------------------ *
   * Pestañas
   * ------------------------------------------------------------------ */
  const tabs = $$('.tab', $('#rail'));
  function openTab(tab, focus) {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; const pane = $('#' + t.getAttribute('aria-controls')); pane.hidden = !on; if (on) { pane.classList.remove('fade'); void pane.offsetWidth; pane.classList.add('fade'); } });
    if (focus) tab.focus();
    $$('.car').forEach(sync);
    if (tab.id === 'tab-vehiculo') warm('vehicles');
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => openTab(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key; const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[k];
      if (step) { e.preventDefault(); openTab(tabs[(i + step + tabs.length) % tabs.length], true); }
      if (k === 'Home') { e.preventDefault(); openTab(tabs[0], true); }
      if (k === 'End') { e.preventDefault(); openTab(tabs[tabs.length - 1], true); }
    });
  });
  headCta.addEventListener('click', () => TF.request());

  setView(view, false);
  setVehicle(vehicle, false);
  setColor(color, false);
  render();

  // muestra el componente cuando su hoja de estilos ya cargó (evita ver un instante sin estilo)
  const reveal = () => host.classList.add('ready');
  const css = $('link[rel="stylesheet"]');
  if (css.sheet) reveal(); else { css.addEventListener('load', reveal); css.addEventListener('error', () => { host.hidden = true; }); setTimeout(reveal, 2500); }
})();
