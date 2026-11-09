# Terrafirma Costa Rica · sitio web

Sitio web de **Terrafirma Costa Rica** (*Serious 4x4 Accessories*), con la instalación de los accesorios en **Musmanni's Workshop**.

Es un sitio estático (HTML + CSS + JS, **sin dependencias ni paso de compilación**) listo para desplegar en [Netlify](https://www.netlify.com/).

**Incluye**

- **Hero interactivo:** un esquema técnico del 4x4 donde cada accesorio se toca para añadirlo a la lista (en móvil, las mismas piezas aparecen como chips).
- Catálogo por categorías, **kits sugeridos** por tipo de uso (se cargan en la misma lista) y sección de instalación en Musmanni's Workshop.
- **Mi lista**: el cliente revisa lo que eligió y envía la lista con un clic al formulario.
- Sección **Proyectos** con fotos reales (filtros por tipo de trabajo, visor con deslizamiento y botón para añadir a la lista los accesorios de cada foto): permanece oculta hasta que existan.
- **Asistente de preguntas** («¿Dudas? Pregunta»): contesta lo que ya dice el sitio, recomienda accesorios con 4 preguntas y, si no sabe algo, lo dice y deja la pregunta escrita en el formulario. No usa IA ni servidor.
- Formulario de contacto con **Netlify Forms** (antispam honeypot) y página de gracias.
- Página 404, favicon, cabeceras de seguridad y tipografías autoalojadas.
- Responsive y accesible (teclado, `aria-*`, `prefers-reduced-motion`).

## Estructura

```
.
├── netlify.toml          # publica la carpeta public/ + cabeceras
├── PRODUCT.md            # qué es el sitio, voz, hechos que no se inventan
├── DESIGN.md             # sistema de diseño, movimiento y decisiones
├── .claude/skills/       # skills de diseño (ver su README)
└── public/
    ├── index.html        # página principal
    ├── gracias.html      # tras enviar el formulario
    ├── 404.html
    ├── favicon.svg
    ├── css/styles.css    # paleta en las variables :root (rojo Terrafirma)
    ├── js/main.js        # MODS (catálogo), HOTSPOTS (piezas del esquema) y PROJECTS (fotos)
    ├── js/assistant.js   # asistente de preguntas: INTENTS (respuestas), ADVISOR y WHY (recomendador)
    ├── images/           # logos de Terrafirma y Musmanni's Workshop
    └── fonts/            # Barlow y Barlow Condensed (SIL OFL)
```

## Probar en local

```bash
python3 -m http.server 8000 --directory public
# o: npx serve public
```

Abre http://localhost:8000. (El formulario solo se registra al estar desplegado en Netlify.)

## Datos de contacto (WhatsApp, teléfono, correo, dirección, horario)

Hoy la página solo muestra datos reales: Musmanni's Workshop e Instagram. Para añadir el resto, edita `CONTACT` al inicio de `public/js/main.js`; los campos vacíos no se muestran:

```js
const CONTACT = { whatsapp: '50688887777', phone: '+506 2222 3333', email: 'info@tudominio.cr', address: '...', hours: 'L-V 8:00 a 17:00' };
```

Con `whatsapp` (código de país y solo dígitos) aparecen los botones **Escribir por WhatsApp** en "Mi lista" y en Contacto, con la lista elegida ya escrita en el mensaje.

## Personalizar

| Qué | Dónde |
| --- | --- |
| Textos, categorías de accesorios, kits | `public/index.html` |
| Catálogo de "Mi lista" | `MODS` en `public/js/main.js` |
| Piezas tocables del esquema y su posición | `HOTSPOTS` en `public/js/main.js` y el `<svg class="rig">` de `public/index.html` (`data-part` debe coincidir con el `id` de `MODS`) |
| Fotos de proyectos | `PROJECTS` en `public/js/main.js` |
| Preguntas y respuestas del asistente | `INTENTS` en `public/js/assistant.js` |
| Recomendador del asistente (qué sugiere según las respuestas) | `ADVISOR` y `WHY` en `public/js/assistant.js` |
| Colores y tipografía | variables `:root` en `public/css/styles.css` (`--red` rellena, `--red-text` para texto); ver `DESIGN.md` |
| Logos | `public/images/` |

**Fotos reales de proyectos:** copia las imágenes a `public/images/proyectos/` (JPG o WebP, idealmente de unos 1600 px de ancho y menos de 300 KB cada una) y añade una entrada a `PROJECTS` en `public/js/main.js`:

```js
{ img: '/images/proyectos/hilux.jpg', alt: 'Toyota Hilux con snorkel y portaequipajes',
  size: 'wide', tags: ['overland', 'carga'], vehicle: 'Toyota Hilux 2018', items: ['snork', 'rack'] }
```

Solo `img` y `alt` son obligatorios; el resto es opcional:

- `size`: `'wide'` o `'tall'`, da ritmo al mosaico.
- `tags`: tipo de trabajo. Con dos o más etiquetas distintas aparecen solos los filtros. Nombres ya traducidos: `suspension`, `proteccion`, `overland`, `carga`, `luces`, `recuperacion`, `ruedas` (cualquier otro se muestra tal cual, con la primera letra en mayúscula).
- `vehicle`: texto que se ve en el visor.
- `items`: ids de `MODS` instalados en ese vehículo. El visor los lista y ofrece **Añadir estos accesorios a mi lista**.

La sección **Proyectos**, su visor ampliado (flechas, Esc y deslizar con el dedo) y el enlace del menú aparecen solos en cuanto haya al menos una foto. Antes de publicar una foto, confirma que tienes derecho a usarla y que no muestra placas, rostros o datos de clientes sin su permiso.

**Asistente de preguntas:** vive en `public/js/assistant.js`. Cada entrada de `INTENTS` tiene una pregunta (`q`), palabras que la activan (`keys`, sin importar tildes ni mayúsculas) y la respuesta (`a`). Para añadir una respuesta con un dato del negocio (tiempos, formas de pago), agrega una entrada nueva **solo cuando el dato sea real**: el asistente nunca debe inventar. La garantía ya está, atribuida al fabricante (24 meses según su FAQ); cuando Terrafirma Costa Rica confirme sus propios términos, edita la entrada `garantia`. Lo que no reconoce lo deriva al equipo con la pregunta ya escrita en el formulario. Las respuestas de contacto, ubicación y horario usan `CONTACT` y se completan solas cuando esos datos existen.

Para que una pregunta con IA real (respuestas libres) sea posible hace falta una función de Netlify con una clave de API, límite de uso y control de abuso; hoy el sitio no tiene backend a propósito.

**Precios:** el sitio no muestra precios; todo se cotiza por vehículo.

> Las categorías y los nombres del cotizador siguen los tipos de producto de la gama del fabricante ([terrafirma4x4.com/products](https://terrafirma4x4.com/products)); los kits son una propuesta de partida. Ajústalos a lo que Terrafirma Costa Rica tenga y cotice (ver `PRODUCT.md`: qué está confirmado y qué no).

## Desplegar en Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elige este repositorio.
2. Netlify lee `netlify.toml` (carpeta de publicación `public`, sin comando de build). Pulsa **Deploy**.
3. Cada `git push` a la rama principal publica una nueva versión automáticamente.

**Formulario de contacto:** tras el primer despliegue, en *Site configuration → Forms* aparecerá el formulario `contacto`. Activa avisos por correo en *Form notifications*. Cada envío incluye la lista elegida en el cotizador.

**Dominio propio:** *Domain management → Add a domain*. Netlify genera el HTTPS automáticamente. Al cambiar de dominio, actualiza la URL `https://terrafirma-costarica.netlify.app` en `public/index.html` (`canonical`, `og:url`, `og:image` y el JSON-LD), `public/robots.txt` y `public/sitemap.xml`.

**Imagen al compartir y iconos:** `public/og-image.png` (1200×630) es lo que se ve al compartir el enlace por WhatsApp o redes. Para cambiarla, sustitúyela por otra del mismo tamaño. Los iconos están en `public/favicon.ico`, `favicon.svg` y `apple-touch-icon.png`.

## Créditos y licencias

- Logos de Terrafirma Costa Rica y de Musmanni's Workshop: propiedad de sus respectivos titulares.
- Tipografías Barlow / Barlow Condensed © The Barlow Project Authors, bajo [SIL Open Font License 1.1](https://openfontlicense.org/).
