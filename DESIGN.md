# Diseño: Terrafirma Costa Rica

Sistema vigente en `public/css/styles.css`. Revisado con las guías de Impeccable, `frontend-design`, Emil Kowalski y Motion Design.

## Idea central
El hero **es la herramienta**: un esquema técnico del 4x4 donde cada accesorio se toca para añadirlo a la lista. La lista (las casillas de "Mi lista") es la única fuente de verdad; el esquema, los chips, el resumen y el formulario se derivan de ella. Cada uno de los 20 accesorios del catálogo tiene su pieza en el esquema, y ese mismo dibujo se reutiliza en el catálogo y en los kits. Todo lo demás apoya esa acción.

## Color
Neutros puros, sin tinte (negro y blanco de la marca) y un solo acento, el rojo de la "M" del logo.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#000000` | Fondo de página |
| `--bg-alt` | `#0d0d0d` | Secciones alternas |
| `--surface` | `#151515` | Resumen y formulario |
| `--line` / `--line-strong` | `#262626` / `#3d3d3d` | Divisores y bordes |
| `--text` / `--muted` | `#f4f4f1` / `#a9a9a4` | Texto principal y secundario |
| `--red` | `#d9261c` | Rellenos (botón, chip elegido). Texto blanco encima: 4,95:1. Al pasar el cursor oscurece (`--red-hover: #c21f16`), nunca aclara |
| `--red-text` | `#ff5b4d` | Texto, líneas y foco sobre negro (contraste ≥ 4,5:1) |

## Tipografía
- **Barlow Condensed 700**, mayúsculas, solo para títulos (h1 hasta 5,5 rem, h2 hasta 3,5 rem, h3 1,5 rem). Eco del logo.
- **Barlow 400/500/600** para todo lo demás. Botones, chips, etiquetas y navegación en minúsculas.
- Cuerpo 1,0625 rem / 1,65; medida máxima ≈ 52–62 caracteres. `text-wrap: balance` en títulos.
- Autoalojadas (`public/fonts/`, subset latino).

## Forma y estructura
- Esquinas casi rectas (`--r: 3px`). Sin tarjetas iguales de icono + título + texto; el catálogo es una lista editorial con divisores finos.
- Los divisores y bordes **codifican información** (separan grupos), no decoran.
- Sin etiquetas "eyebrow" sobre los títulos, sin texto con degradado, sin barras de color laterales, sin sombras duras.
- Los números 1–4 solo aparecen en "Cómo trabajamos", porque es una secuencia real.

## Movimiento (personalidad: precisa y rápida, sin rebote)
**Lenguaje:** *un plano técnico que se dibuja.* Primero se trazan las líneas y después entra el contenido. Es el mismo gesto en todo el sitio, así que no es una entrada idéntica por sección sino una sola idea con distintos materiales.

- **Hero:** el esquema se dibuja al cargar (1,1 s) y las etiquetas entran en cascada (45 ms entre ellas). Después, un movimiento ambiental muy lento (el suelo avanza y el dibujo de las ruedas gira), solo mientras el hero está en pantalla y nunca con `prefers-reduced-motion`.
- **Catálogo:** un esquema fijo a la izquierda ilumina las piezas de la categoría que se está leyendo (seguimiento del scroll). Los divisores se dibujan de izquierda a derecha y luego aparece el texto.
- **Kits:** al elegir un kit, sus piezas se encienden una a una (70 ms entre piezas) y, si incluye elevación, el vehículo sube. Es movimiento que explica qué añade cada kit.
- **Instalación:** el logo se revela con un recorte vertical; las líneas de los pasos se dibujan.
- **Respuesta a acciones:** pulsar (`scale .97`, 140 ms), activar una pieza (color y relleno, 220 ms), elevar la suspensión (el 4x4 sube 14 px, 260 ms).
- **Galería de fotos reales (cuando exista):** mosaico con revelado por recorte, zoom 1,03 dentro del marco al pasar el cursor y visor ampliado con teclado y deslizamiento. Al filtrar, las fotos que vuelven a verse entran con un fundido corto (260 ms) y el resultado se anuncia en una región `aria-live`.
- **Casillas de «Mi lista»:** cada chip lleva un punto de estado (aro vacío → relleno al elegir) para que el estado se lea sin depender del color; el contador da un pequeño pulso al cambiar.
- **Línea de progreso:** una línea roja bajo la cabecera avanza con el scroll (`animation-timeline: scroll()`, solo donde el navegador lo soporta).
- **Asistente:** el panel sube 8 px y aparece (220 ms). Cada mensaje entra con un fundido corto (200 ms); con `prefers-reduced-motion` todo aparece al instante.
- Curva única: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out fuerte). Sin `ease-in`, sin `transition: all`, nada parte de `scale(0)`. Efectos `hover` solo con `(hover: hover) and (pointer: fine)`.
- **Con `prefers-reduced-motion` no hay animaciones** y todo aparece en su estado final.
- Nota técnica: el recorte de revelado se aplica a la *imagen hija*, nunca al contenedor que observa el `IntersectionObserver` (un contenedor totalmente recortado nunca cuenta como visible).

## Asistente de preguntas
Botón fijo abajo a la izquierda («¿Dudas? Pregunta»; en móvil, solo el icono de 52 px) que abre un panel **no modal**: la página sigue usable detrás. Registro `role="log"`, foco al abrir y al cerrar, Esc cierra. Respuestas cortas con botones de acción (ir a una sección, abrir WhatsApp, armar la lista). Texto siempre insertado con `textContent`. **No aparece en el primer pantallazo**: ahí vive «Armar mi lista» y el botón la tapaba en portátiles; entra con un fundido en cuanto el visitante hace scroll (unos 300 px) y se queda mientras el panel esté abierto. Va abajo a la izquierda porque la insignia «Powered by Netlify» ocupa la esquina inferior derecha.

## Superficies del navegador
Selección de texto roja, cursor (`caret-color`) rojo, barra de desplazamiento oscura, anillo de foco rojo con desplazamiento, cifras tabulares en contadores.

## Accesibilidad
Contraste ≥ 4,5:1 en texto, objetivos táctiles ≥ 44 px en móvil, foco visible, esquema con `role="img"` y controles reales (`button`, `checkbox`, pestañas con flechas), sin dependencia de JS para leer el contenido.

## Ajuste a la pantalla
El esquema del hero se dimensiona con la altura disponible (`--hero-chrome`) para que el titular, el esquema completo y el botón quepan en portátiles de 720 a 900 px de alto. Nunca baja de 820 px de ancho: por debajo las etiquetas se solaparían.

## Responsive
- **≥ 1000 px:** etiquetas alrededor del esquema con líneas guía.
- **< 1000 px:** el esquema se recorta a la silueta y las mismas piezas aparecen como chips debajo.
- **< 960 px:** menú en hamburguesa.

## Qué no cambiar sin consultar
Logos, paleta de la marca (negro, blanco, rojo), el principio "sin precios" y la sección Proyectos oculta hasta tener fotos reales.
