/* Terrafirma Costa Rica · interacciones del sitio
   La lista de accesorios (casillas de "Mi lista") es la única fuente de verdad:
   el esquema del hero, los chips, el resumen y el formulario se derivan de ella.
   Edita MODS (catálogo), HOTSPOTS (piezas del esquema) y PROJECTS (fotos reales). */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * DATOS
   * ------------------------------------------------------------------ */

  // Categorías y accesorios de la lista. Siguen los tipos de producto de la gama del fabricante (terrafirma4x4.com/products).
  // Ajusta los nombres a lo que Terrafirma Costa Rica tenga y cotice.
  const MODS = [
    { cat: 'Suspensión', items: [
      { id: 'elev',  name: 'Kit de elevación' },
      { id: 'amort', name: 'Amortiguadores' },
      { id: 'resor', name: 'Resortes helicoidales' },
    ]},
    { cat: 'Protección', items: [
      { id: 'skid',    name: 'Protector de bajos (skid plate)' },
      { id: 'rock',    name: 'Estribos / rock sliders' },
    ]},
    { cat: 'Defensas y recuperación', items: [
      { id: 'def-del', name: 'Defensa delantera' },
      { id: 'def-tra', name: 'Defensa trasera' },
      { id: 'winch',   name: 'Winch eléctrico' },
      { id: 'remol',   name: 'Puntos de remolque y enganches' },
      { id: 'recup',   name: 'Accesorios de recuperación y gatos' },
    ]},
    { cat: 'Expedición', items: [
      { id: 'rack',   name: 'Portaequipajes de techo' },
      { id: 'barras', name: 'Barras de techo' },
      { id: 'soport', name: 'Soportes y accesorios para el portaequipajes' },
      { id: 'snork',  name: 'Snorkel (toma de aire elevada)' },
      { id: 'repu',   name: 'Soporte para llanta de repuesto' },
    ]},
    { cat: 'Iluminación', items: [
      { id: 'led',    name: 'Barra LED' },
      { id: 'faros',  name: 'Luces de conducción LED' },
      { id: 'trab',   name: 'Luces de trabajo' },
    ]},
    { cat: 'Rendimiento', items: [
      { id: 'filtro', name: 'Filtro de aire de espuma' },
    ]},
    { cat: 'Ruedas', items: [
      { id: 'rines',  name: 'Rines de acero o aleación' },
    ]},
  ];

  // Piezas tocables del esquema. `id` debe existir en MODS y coincidir con data-part / data-for del SVG.
  // x e y están en las unidades del viewBox (1000 x 420) y colocan la etiqueta en pantallas anchas.
  const HOTSPOTS = [
    { id: 'rack',    label: 'Portaequipajes', x: 300, y: 20 },
    { id: 'led',     label: 'Barra LED',      x: 472, y: 20 },
    { id: 'snork',   label: 'Snorkel',        x: 640, y: 20 },
    { id: 'elev',    label: 'Elevación',      x: 170, y: 392 },
    { id: 'rines',   label: 'Rines',          x: 330, y: 392 },
    { id: 'rock',    label: 'Estribos',       x: 500, y: 392 },
    { id: 'def-del', label: 'Defensa',        x: 690, y: 392 },
    { id: 'winch',   label: 'Winch',          x: 850, y: 392 },
  ];

  // Datos de contacto. Los campos vacíos no se muestran.
  // `whatsapp` con código de país y solo dígitos (ej. '50688887777') activa los botones de WhatsApp,
  // que envían la lista elegida ya escrita en el mensaje.
  const CONTACT = { whatsapp: '', phone: '', email: '', address: '', hours: '' };

  // Fotos reales de instalaciones. Mientras esté vacío, la sección "Proyectos" permanece oculta.
  // { img: '/images/proyectos/hilux.jpg', alt: 'Toyota Hilux con snorkel y portaequipajes',
  //   size: 'wide', tags: ['overland'], vehicle: 'Toyota Hilux 2018', items: ['snork', 'rack', 'led'] }
  // Opcionales: `size` ('wide' o 'tall', da ritmo al mosaico), `tags` (crean los filtros), `vehicle` (se muestra en el visor)
  // e `items` (ids de MODS: el visor ofrece añadir esos accesorios a la lista).
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
  const heroCta = $('#hero-cta');
  const heroCtaLabel = $('#hero-cta-label');
  const status = $('#list-status');
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
  /* La lista se recuerda en este navegador (solo los ids): sobrevive a recargar o volver atrás. */
  const STORE = 'tf-lista';
  const loadSaved = () => { try { const v = JSON.parse(localStorage.getItem(STORE) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const save = (ids) => { try { if (ids.length) localStorage.setItem(STORE, JSON.stringify(ids)); else localStorage.removeItem(STORE); } catch (e) { /* sin almacenamiento */ } };

  /* WhatsApp (solo si CONTACT.whatsapp tiene número) */
  const waDigits = CONTACT.whatsapp.replace(/\D/g, '');
  const waLinks = [];
  const waUrl = (list) => `https://wa.me/${waDigits}?text=${encodeURIComponent(list.length
    ? `Hola, quiero cotizar estos accesorios para mi 4x4:\n${summaryText(list)}`
    : 'Hola, quiero cotizar accesorios para mi 4x4.')}`;
  const waButton = (cls) => { const a = el('a', { class: cls, href: '#', target: '_blank', rel: 'noopener', text: 'Escribir por WhatsApp' }); waLinks.push(a); return a; };
  if (waDigits) {
    sendBtn.after(waButton('btn btn-line btn-block'));
    $('.contact-grid .lead-sm').after(waButton('btn btn-line'));
  }
  const info = $('#contact-info');
  [['WhatsApp', waDigits && `+${waDigits}`, waDigits && `https://wa.me/${waDigits}`],
   ['Teléfono', CONTACT.phone, CONTACT.phone && `tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`],
   ['Correo', CONTACT.email, CONTACT.email && `mailto:${CONTACT.email}`],
   ['Dirección', CONTACT.address],
   ['Horario', CONTACT.hours]].forEach(([dt, dd, href]) => {
    if (!dd) return;
    info.append(el('div', {}, el('dt', { text: dt }), el('dd', {}, href ? el('a', { href, text: dd }) : document.createTextNode(dd))));
  });

  let ready = false;       // los avisos para lectores de pantalla empiezan tras la primera interacción
  let lastCount = 0;
  const plural = (n) => `${n} ${n === 1 ? 'accesorio' : 'accesorios'}`;

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
    heroCount.textContent = list.length ? `(${list.length})` : '';
    heroCtaLabel.textContent = list.length ? 'Ver mi lista' : 'Armar mi lista';
    heroCta.setAttribute('aria-label', list.length ? `Ver mi lista, ${plural(list.length)}` : 'Armar mi lista de accesorios');

    // formulario: con una lista elegida el mensaje pasa a ser opcional
    message.required = list.length === 0;
    message.placeholder = list.length ? 'Opcional: cuéntanos algo más sobre tu 4x4. Ya incluimos tu lista.' : '¿Qué te gustaría instalar en tu 4x4?';

    save([...ids]);
    waLinks.forEach((a) => { a.href = waUrl(list); });
    if (ready && list.length !== lastCount) {
      status.textContent = list.length ? `${plural(list.length)} en tu lista` : 'Tu lista está vacía';
      [sumCount, heroCount].forEach((n) => { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); });
    }
    lastCount = list.length;
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

  const form = $('form[name="contacto"]');
  const submitBtn = $('button[type="submit"]', form);
  form.addEventListener('submit', () => {
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Enviando…';
  });
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-busy');
    submitBtn.textContent = 'Enviar solicitud';
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
   * Catálogo de fotos: solo aparece si hay fotos reales (filtros + mosaico + visor)
   * ------------------------------------------------------------------ */
  if (PROJECTS.length) {
    const TAGS = { suspension: 'Suspensión', proteccion: 'Protección', overland: 'Overland', carga: 'Techo y carga', luces: 'Iluminación', recuperacion: 'Recuperación', ruedas: 'Ruedas' };
    const tagLabel = (t) => TAGS[t] || t.charAt(0).toUpperCase() + t.slice(1);
    const gallery = $('#gallery');
    const filters = $('#gallery-filters');
    const gStatus = $('#gallery-status');
    const lb = $('#lightbox');
    const lbImg = $('.lb-img', lb);
    const lbBar = $('#lb-bar');
    const lbAdd = $('#lb-add');
    let active = 'todos';
    let cur = 0;
    let shown = PROJECTS.map((_, i) => i);   // índices visibles según el filtro

    const shots = PROJECTS.map((p, i) => {
      const shot = el('button', {
        class: `shot${p.size ? ` ${p.size}` : ''}`, type: 'button', 'data-reveal': '', 'aria-label': `Ampliar foto: ${p.alt}`,
      }, el('img', { src: p.img, alt: p.alt, loading: 'lazy' }));
      shot.addEventListener('click', () => { cur = shown.indexOf(i); show(); lb.showModal(); });
      gallery.append(shot);
      return shot;
    });

    const tags = [...new Set(PROJECTS.flatMap((p) => p.tags || []))];
    if (tags.length > 1) {
      [['todos', 'Todos'], ...tags.map((t) => [t, tagLabel(t)])].forEach(([key, label]) => {
        const b2 = el('button', { class: 'pick', type: 'button', 'aria-pressed': String(key === active), 'data-tag': key }, el('span', { text: label }));
        b2.addEventListener('click', () => {
          active = key;
          $$('[data-tag]', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b2)));
          shown = PROJECTS.map((p, i) => i).filter((i) => key === 'todos' || (PROJECTS[i].tags || []).includes(key));
          shots.forEach((s, i) => {
            const on = shown.includes(i);
            if (on && s.hidden) { s.hidden = false; s.classList.add('in'); s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; s.classList.add('shot-in'); }
            if (!on) { s.hidden = true; s.classList.remove('shot-in'); }
          });
          gStatus.textContent = `Mostrando ${shown.length} ${shown.length === 1 ? 'foto' : 'fotos'}`;
        });
        filters.append(b2);
      });
      filters.hidden = false;
    }

    function show() {
      const i = shown[cur];
      const p = PROJECTS[i];
      lbImg.src = p.img;
      lbImg.alt = p.alt;
      $('#lb-count').textContent = `${cur + 1} / ${shown.length}`;
      $('#lb-vehicle').textContent = p.vehicle || '';
      $('#lb-vehicle').hidden = !p.vehicle;
      $('#lb-items').replaceChildren(...(p.items || []).filter((id) => catalog.has(id)).map((id) => el('li', { text: catalog.get(id).name })));
      lbAdd.hidden = !(p.items && p.items.some((id) => catalog.has(id)));
      lbAdd.textContent = 'Añadir estos accesorios a mi lista';
      lbAdd.removeAttribute('aria-disabled');
      [-1, 1].forEach((d) => { const q = PROJECTS[shown[(cur + d + shown.length) % shown.length]]; if (q) new Image().src = q.img; });   // precarga vecinas
    }
    const step = (d) => { cur = (cur + d + shown.length) % shown.length; show(); };
    lbAdd.addEventListener('click', () => {
      if (lbAdd.getAttribute('aria-disabled') === 'true') return;   // aria-disabled (no disabled): el foco se queda y las flechas siguen funcionando
      const p = PROJECTS[shown[cur]];
      const ids = (p.items || []).filter((id) => catalog.has(id));
      ids.forEach((id) => { const input = box(id); if (input) input.checked = true; });
      renderAll();
      lbAdd.textContent = `Añadido: ya tienes ${selected().length} en tu lista`;
      lbAdd.setAttribute('aria-disabled', 'true');
    });
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    $('.lb-prev', lb).addEventListener('click', () => step(-1));
    $('.lb-next', lb).addEventListener('click', () => step(1));
    if (PROJECTS.length < 2) { $('.lb-prev', lb).hidden = true; $('.lb-next', lb).hidden = true; }
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    // deslizar con el dedo o el puntero
    let sx = 0;
    let sy = 0;
    lbImg.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
    lbImg.addEventListener('pointerup', (e) => {
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    });
    $('#proyectos').hidden = false;
    $('#nav-proyectos').hidden = false;
  }

  /* ------------------------------------------------------------------ *
   * Navegación: marca la sección que se está viendo
   * ------------------------------------------------------------------ */
  if (hasIO) {
    const navLinks = $$('#menu a[href^="#"]:not(.btn)');
    const watched = [$('#inicio'), $('#contacto'), ...navLinks.map((a) => $(a.getAttribute('href')))].filter(Boolean);
    const navSpy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === `#${e.target.id}`) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }), { rootMargin: '-45% 0px -50% 0px' });
    watched.forEach((s) => navSpy.observe(s));
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

  loadSaved().forEach((id) => { const input = box(id); if (input) input.checked = true; });
  renderAll();
  ready = true;

  /* API mínima que usa el asistente (assistant.js) */
  window.TF = {
    contact: CONTACT,
    waEnabled: Boolean(waDigits),
    waUrl: () => waUrl(selected()),
    name: (id) => (catalog.get(id) || {}).name || id,
    count: () => selected().length,
    add: (ids) => { ids.forEach((id) => { const input = box(id); if (input) input.checked = true; }); renderAll(); return selected().length; },
    go: (sel) => { const t = $(sel); if (t) t.scrollIntoView({ behavior: 'smooth' }); },
    askTeam: (q) => {
      message.value = `${message.value ? `${message.value}\n\n` : ''}Pregunta: ${q}`;
      $('#contacto').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => $('input[name="nombre"]').focus({ preventScroll: true }), 500);
    },
  };
})();
