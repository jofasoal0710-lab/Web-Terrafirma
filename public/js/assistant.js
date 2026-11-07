/* Terrafirma · asistente de preguntas
   Respuestas guiadas, sin servidor ni IA: solo contesta con datos que ya están en el sitio y, cuando no
   sabe algo, lo dice y lo deriva al equipo (deja la pregunta escrita en el formulario).
   Edita INTENTS (preguntas y respuestas), ADVISOR (recomendador) y WHY (razones) para cambiar su conocimiento. */
(() => {
  'use strict';
  const TF = window.TF;
  const root = document.getElementById('assistant');
  if (!TF || !root) return;

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v); }
    kids.forEach((k) => n.append(k));
    return n;
  };
  const launcher = $('#as-launcher');
  const panel = $('#as-panel');
  const log = $('#as-log');
  const actions = $('#as-actions');
  const form = $('#as-form');
  const input = $('#as-input');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small = window.matchMedia('(max-width: 640px)');
  const C = TF.contact;
  const IG = 'https://www.instagram.com/terrafirma_cr/';

  /* ------------------------------------------------------------------ *
   * Conocimiento: solo hechos que ya están en la página
   * ------------------------------------------------------------------ */
  const go = (label, sel) => ({ label, run: () => { TF.go(sel); if (small.matches) close(false); } });
  const href = (label, url) => ({ label, href: url });
  const teamAsk = () => ({ label: 'Enviar mi pregunta al equipo', run: () => sendToTeam() });
  const startList = () => go('Armar mi lista', '#inicio');

  const INTENTS = [
    { id: 'cotizacion', q: '¿Cómo pido una cotización?',
      keys: ['cotiz', 'presupuesto', 'pedir', 'solicitar', 'como compro', 'comprar', 'adquirir', 'pedido'],
      a: () => ['Arma tu lista de accesorios: toca las piezas del vehículo en el inicio, elige un kit o márcalos en «Mi lista». Luego pulsa «Solicitar cotización» y completa el formulario.',
        'La cotización final depende de tu vehículo, de la disponibilidad y de la instalación.'],
      next: () => [startList(), go('Ir al formulario', '#contacto')] },
    { id: 'asesor', q: '¿Qué kit me conviene?', keys: ['recomiend', 'conviene', 'que kit', 'cual kit', 'sugier', 'aconsej', 'que necesito', 'que instalar', 'que le pongo', 'ayudame a elegir', 'asesor'],
      a: () => ['Te hago cuatro preguntas cortas sobre cómo usas tu 4x4 y te sugiero accesorios.'], then: () => startAdvisor() },
    { id: 'kits', q: '¿Qué kits hay?', keys: ['kit', 'kits', 'paquete', 'combo', 'combinacion'],
      a: () => ['Hay tres kits de partida: «Trocha y diario», «Overland y viajes» y «Expedición». Puedes añadirlos a tu lista y ajustarla a tu vehículo.'],
      next: () => [go('Ver los kits', '#kits'), { label: 'Recomiéndame accesorios', run: () => { say('user', 'Recomiéndame accesorios'); reply(byId('asesor')); } }] },
    { id: 'instalacion', q: '¿Dónde se instalan?', keys: ['instal', 'montaje', 'montan', 'taller', 'musmanni', 'colocan', 'donde ponen'],
      a: () => ["Los accesorios Terrafirma se instalan en Musmanni's Workshop. El montaje es profesional y se hace una revisión final antes de entregarte el vehículo."],
      next: () => [go('Ver la instalación', '#instalacion'), go('Agenda tu instalación', '#contacto')] },
    { id: 'precios', q: '¿Cuánto cuesta?', keys: ['precio', 'cuanto cuesta', 'cuanto cuestan', 'cuanto vale', 'cuanto valen', 'costo', 'valor', 'cuanto sale', 'tarifa', 'cuanto es'],
      a: () => ['En esta página no mostramos precios: todo se cotiza según tu vehículo y lo que quieras instalar.', 'Arma tu lista y pide la cotización; es el camino más rápido.'],
      next: () => [startList()] },
    { id: 'compat', q: '¿Sirve para mi vehículo?', keys: ['compatib', 'sirve', 'funciona con', 'mi carro', 'mi vehiculo', 'mi camioneta', 'mi pick', 'mi jeep', 'mi 4x4', 'hilux', 'land cruiser', 'jimny', 'defender', 'modelo'],
      a: () => ['La compatibilidad depende de la marca, el modelo y el año de tu vehículo.', 'Indícalo en el formulario (marca, modelo y año) y lo confirmamos al cotizar.'],
      next: () => [go('Ir al formulario', '#contacto')] },
    { id: 'productos', q: '¿Qué accesorios hay?', keys: ['accesorio', 'producto', 'categoria', 'que venden', 'que manejan', 'que tienen', 'catalogo', 'suspension', 'defensa', 'winch', 'snorkel', 'portaequipaje', 'iluminacion', 'neumatico', 'llanta', 'rin'],
      a: () => ['Puedes elegir entre estas categorías: suspensión y elevación, defensas y protección, winches y recuperación, techo y carga, snorkel y admisión, iluminación, y ruedas y neumáticos.', 'La disponibilidad depende de tu vehículo y la confirmamos al cotizar.'],
      next: () => [go('Ver accesorios', '#accesorios'), startList()] },
    { id: 'contacto', q: '¿Cómo los contacto?', keys: ['contact', 'whatsapp', 'telefono', 'llamar', 'correo', 'email', 'escribir', 'instagram', 'redes', 'hablar con', 'persona', 'humano', 'numero'],
      a: () => {
        const l = ['Puedes escribirnos con el formulario de contacto de esta página, o por Instagram (@terrafirma_cr).'];
        if (TF.waEnabled) l.push('También por WhatsApp, con tu lista ya escrita en el mensaje.');
        if (C.phone) l.push(`Teléfono: ${C.phone}.`);
        if (C.email) l.push(`Correo: ${C.email}.`);
        return l;
      },
      next: () => [go('Ir al formulario', '#contacto'), href('Abrir Instagram', IG), ...(TF.waEnabled ? [href('Escribir por WhatsApp', TF.waUrl())] : [])] },
    { id: 'ubicacion', q: '¿Dónde están?', keys: ['donde estan', 'ubicacion', 'direccion', 'como llego', 'mapa', 'sucursal', 'donde queda', 'donde quedan'],
      a: () => (C.address ? [`Musmanni's Workshop: ${C.address}.`] : ["Los accesorios se instalan en Musmanni's Workshop, pero no tengo la dirección en este asistente.", 'Pregúntala por el formulario o por Instagram.']),
      next: () => (C.address ? [go('Ir al formulario', '#contacto')] : [teamAsk(), href('Abrir Instagram', IG)]) },
    { id: 'horario', q: '¿Cuál es el horario?', keys: ['horario', 'abren', 'cierran', 'atienden', 'abierto', 'a que hora'],
      a: () => (C.hours ? [`Horario: ${C.hours}.`] : ['No tengo el horario en este asistente.', 'Pregúntalo por el formulario o por Instagram.']),
      next: () => (C.hours ? [] : [teamAsk(), href('Abrir Instagram', IG)]) },
    { id: 'sin-dato', q: null, keys: ['garantia', 'cuanto tarda', 'demora', 'dias', 'entrega', 'stock', 'inventario', 'disponibilidad', 'pago', 'tarjeta', 'sinpe', 'financi', 'cuotas', 'envio', 'importa', 'factura'],
      a: () => ['Ese dato no lo tengo en este asistente y prefiero no inventarlo.', 'Puedo dejar tu pregunta escrita en el formulario para que el equipo te responda.'],
      next: () => [teamAsk(), href('Abrir Instagram', IG)] },
    { id: 'saludo', q: null, keys: ['hola', 'buenas', 'buenos dias', 'buen dia', 'buenas tardes', 'buenas noches', 'saludos', 'que tal'],
      a: () => ['Hola. ¿En qué te ayudo? Elige una pregunta o escribe la tuya.'], next: () => [] },
    { id: 'gracias', q: null, keys: ['gracias', 'perfecto', 'excelente', 'genial', 'listo'],
      a: () => ['Con gusto. Si te falta algo, aquí estoy.'], next: () => [] },
  ];
  const SUGGESTED = ['cotizacion', 'asesor', 'instalacion', 'precios', 'compat', 'contacto'];
  const byId = (id) => INTENTS.find((i) => i.id === id);

  /* ---- Recomendador: razona con las respuestas del visitante ---- */
  const WHY = {
    skid: 'Protege el motor y los bajos de golpes en la trocha',
    rock: 'Protege los costados de las piedras',
    faros: 'Más luz al frente de noche',
    amort: 'Mejor control en terreno irregular',
    resor: 'Soportan mejor el peso y la carga',
    elev: 'Más altura libre para caminos difíciles',
    rack: 'Espacio extra para equipaje en el techo',
    barras: 'Base para llevar carga en el techo',
    soport: 'Sujetan la carga y los accesorios',
    led: 'Visibilidad a larga distancia de noche',
    trab: 'Luz para trabajar cuando oscurece',
    at: 'Neumáticos con más agarre fuera del asfalto',
    'def-del': 'Protección frontal y soporte para un winch',
    'def-tra': 'Protección trasera y base para accesorios',
    winch: 'Para salir de atascos por tu cuenta',
    remol: 'Puntos seguros para recuperar el vehículo',
    recup: 'Equipo para recuperar tu 4x4 u otro vehículo',
    snork: 'Toma de aire elevada para cruzar zonas con agua',
    filtro: 'Mejor filtrado del aire en caminos con polvo',
  };
  const ADVISOR = {
    uso: { q: '¿Cómo usas tu 4x4?', options: [
      ['diario', 'Diario y trocha ocasional', ['skid', 'rock', 'faros', 'amort']],
      ['overland', 'Overland y viajes', ['elev', 'rack', 'led', 'at']],
      ['trabajo', 'Trabajo y carga', ['amort', 'resor', 'rack', 'barras', 'def-tra', 'trab']],
      ['extremo', 'Off-road exigente', ['def-del', 'winch', 'remol', 'recup', 'elev', 'skid', 'at']]] },
    terreno: { q: '¿Qué terreno encuentras? Marca todo lo que aplique.', multi: true, options: [
      ['barro', 'Barro y atascos', ['winch', 'remol', 'recup', 'at']],
      ['rios', 'Ríos y zonas con agua', ['snork', 'filtro']],
      ['piedras', 'Piedras y rocas', ['skid', 'rock', 'def-del']],
      ['largos', 'Caminos largos de tierra', ['amort', 'at']]] },
    carga: { q: '¿Llevas equipaje o carga en el techo?', options: [
      ['si', 'Sí, llevo carga', ['rack', 'soport']], ['no', 'No, casi no llevo', []]] },
    noche: { q: '¿Sales o viajas de noche?', options: [
      ['si', 'Sí, de noche también', ['led', 'faros']], ['no', 'No, casi siempre de día', []]] },
  };
  const ORDER = ['elev', 'amort', 'resor', 'def-del', 'def-tra', 'skid', 'rock', 'winch', 'remol', 'recup', 'rack', 'barras', 'soport', 'snork', 'filtro', 'led', 'faros', 'trab', 'at'];
  const recommend = (a) => {
    const set = new Set();
    const add = (ids) => ids.forEach((id) => set.add(id));
    add(ADVISOR.uso.options.find((o) => o[0] === a.uso)[2]);
    a.terreno.forEach((t) => add(ADVISOR.terreno.options.find((o) => o[0] === t)[2]));
    add(ADVISOR.carga.options.find((o) => o[0] === a.carga)[2]);
    add(ADVISOR.noche.options.find((o) => o[0] === a.noche)[2]);
    if (a.carga === 'no') ['rack', 'barras', 'soport'].forEach((id) => set.delete(id));
    if (a.noche === 'no') ['led', 'faros', 'trab'].forEach((id) => set.delete(id));
    return ORDER.filter((id) => set.has(id));
  };

  /* ------------------------------------------------------------------ *
   * Conversación
   * ------------------------------------------------------------------ */
  let started = false;
  let lastText = '';
  let timer = 0;
  let advisor = null;

  const say = (role, content) => {
    const bubble = el('div', { class: `as-msg as-${role}` });
    (Array.isArray(content) ? content : [content]).forEach((c) => {
      if (c && c.list) bubble.append(el('ul', {}, ...c.list.map((t) => el('li', { text: t }))));
      else bubble.append(el('p', { text: c }));
    });
    log.append(bubble);
    log.scrollTop = log.scrollHeight;
    return bubble;
  };
  const setActions = (list, opts = {}) => {
    actions.replaceChildren(...list.map((a) => {
      if (a.href) return el('a', { class: 'as-chip', href: a.href, target: '_blank', rel: 'noopener', text: a.label });
      const b = el('button', { class: 'as-chip', type: 'button', text: a.label });
      if (opts.toggle) b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => a.run(b));
      return b;
    }));
  };
  const suggestions = () => setActions(SUGGESTED.map((id) => { const it = byId(id); return { label: it.q, run: () => { say('user', it.q); lastText = it.q; reply(it); } }; }));

  const reply = (intent) => {
    advisor = null;
    say('bot', intent.a());
    if (intent.then) { intent.then(); return; }
    const next = intent.next ? intent.next() : [];
    setActions([...next, { label: 'Otra pregunta', run: () => suggestions() }]);
  };

  const sendToTeam = () => {
    TF.askTeam(lastText || 'Tengo una consulta.');
    say('bot', 'Listo: dejé tu pregunta escrita en el formulario. Completa tus datos y envíala.');
    setActions([{ label: 'Otra pregunta', run: () => suggestions() }]);
    if (small.matches) close(false);
  };

  /* ---- flujo del recomendador ---- */
  const startAdvisor = () => { advisor = { uso: null, terreno: [], carga: null, noche: null, step: 'uso' }; ask('uso'); };
  const ask = (step) => {
    const def = ADVISOR[step];
    advisor.step = step;
    say('bot', def.q);
    if (def.multi) {
      const picked = new Set();
      const list = def.options.map(([key, label]) => ({ label, run: (b) => { if (picked.has(key)) { picked.delete(key); b.setAttribute('aria-pressed', 'false'); } else { picked.add(key); b.setAttribute('aria-pressed', 'true'); } } }));
      setActions(list, { toggle: true });
      const go2 = el('button', { class: 'as-chip as-primary', type: 'button', text: 'Continuar' });
      go2.addEventListener('click', () => {
        const labels = def.options.filter(([k]) => picked.has(k)).map(([, l]) => l);
        say('user', labels.length ? labels.join(', ') : 'Ninguno en especial');
        advisor.terreno = [...picked];
        next(step);
      });
      actions.append(go2);
      return;
    }
    setActions(def.options.map(([key, label]) => ({ label, run: () => { say('user', label); advisor[step] = key; next(step); } })));
  };
  const next = (step) => {
    const order = ['uso', 'terreno', 'carga', 'noche'];
    const i = order.indexOf(step);
    if (i < order.length - 1) ask(order[i + 1]); else finish();
  };
  const finish = () => {
    const ids = recommend(advisor);
    advisor = null;
    say('bot', [`Con lo que me cuentas, te sugiero ${ids.length} accesorios:`, { list: ids.map((id) => `${TF.name(id)}: ${WHY[id]}.`) },
      'Es una orientación general, no una recomendación técnica: la compatibilidad con tu vehículo se confirma al cotizar.']);
    setActions([
      { label: `Añadir los ${ids.length} a mi lista`, run: () => {
        const n = TF.add(ids);
        say('bot', `Listo: añadí ${ids.length} accesorios. Ahora tienes ${n} en tu lista.`);
        setActions([
          { label: 'Ver el esquema', run: () => { TF.go('#inicio'); if (small.matches) close(false); } },
          { label: 'Solicitar cotización', run: () => { document.getElementById('sum-send').click(); if (small.matches) close(false); } },
          { label: 'Otra pregunta', run: () => suggestions() }]);
      } },
      { label: 'Empezar de nuevo', run: () => { say('user', 'Empezar de nuevo'); startAdvisor(); } },
      { label: 'Otra pregunta', run: () => suggestions() }]);
  };

  /* ---- comprensión de texto libre (sin acentos, por raíces de palabra) ---- */
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const match = (text) => {
    const t = norm(text);
    const words = t.split(' ');
    let best = null;
    let bestScore = 0;
    INTENTS.forEach((it) => {
      let score = 0;
      it.keys.forEach((k) => {
        const hit = k.includes(' ') ? (` ${t} `).includes(` ${k} `)
          : k.length >= 5 ? words.some((w) => w.startsWith(k)) : words.includes(k);
        if (hit) score += k.length;
      });
      if (score > bestScore) { best = it; bestScore = score; }
    });
    return bestScore >= 3 ? best : null;
  };
  const answer = (text) => {
    lastText = text;
    const it = match(text);
    if (it) { reply(it); return; }
    advisor = null;
    say('bot', ['No tengo una respuesta para eso y prefiero no inventarla.', 'Puedo dejar tu pregunta escrita en el formulario para que el equipo te responda, o escribirnos por Instagram.']);
    setActions([teamAsk(), href('Abrir Instagram', IG), ...(TF.waEnabled ? [href('Escribir por WhatsApp', TF.waUrl())] : []), { label: 'Otra pregunta', run: () => suggestions() }]);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    say('user', text);
    answer(text);
  });

  /* ------------------------------------------------------------------ *
   * Abrir y cerrar
   * ------------------------------------------------------------------ */
  function open() {
    clearTimeout(timer);
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => panel.classList.add('open'));
    panel.focus({ preventScroll: true });
    if (!started) {
      started = true;
      say('bot', ['Hola, soy el asistente de Terrafirma. Respondo con la información de esta página y, si no la tengo, te conecto con el equipo.', 'Elige una pregunta o escribe la tuya.']);
      suggestions();
    }
  }
  function close(returnFocus = true) {
    panel.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
    if (reduced.matches) panel.hidden = true; else timer = setTimeout(() => { panel.hidden = true; }, 200);
    if (returnFocus) launcher.focus({ preventScroll: true });
  }
  launcher.addEventListener('click', () => (panel.hidden || !panel.classList.contains('open') ? open() : close()));
  $('.as-close', panel).addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });

  root.hidden = false;
})();
