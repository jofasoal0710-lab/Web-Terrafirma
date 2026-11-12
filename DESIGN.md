# Diseño: Terrafirma Costa Rica

Sistema vigente en `public/css/styles.css`. Revisado con las guías de Impeccable, `frontend-design`, Emil Kowalski y Motion Design.

## Idea central
El hero **es la herramienta**: un configurador donde el cliente elige vehículo, color y vista, añade accesorios y los ve puestos en el vehículo. La lista (las casillas de "Mi lista") es la única fuente de verdad; el configurador, el resumen, el formulario, el catálogo, los kits y el asistente se derivan de ella (`window.TF` y el evento `tf:list`); el configurador solo guarda aparte vehículo, color y vista (`tf-config`). Cada uno de los 20 accesorios del catálogo tiene su vista previa. El esquema de líneas anterior se conserva en pequeño en el catálogo y en los kits. Todo lo demás apoya esa acción.

**Imágenes provisionales:** los vehículos y accesorios del configurador son renders de prueba (formas sencillas, sin marca ni modelo reales), rotulados en pantalla como «Imagen provisional». El componente no depende de cómo se hicieron: se sustituyen por modelos o fotos reales manteniendo nombre y encuadre (`tools/render/README.md`).

**Cómo está hecho:** un componente en Shadow DOM (`js/configurador.js` + `css/configurador.css`) para que sus clases (`.tab`, `.chip`, `.btn`, `.card`…) no choquen con las del sitio. Cada vista es una pila de imágenes WebP con la misma cámara: base gris neutra, máscara de pintura (el color se aplica con `mix-blend-mode: multiply`), versión elevada y una capa por accesorio. Solo se descarga lo que se ve (unos 125 KB al entrar; el resto, al elegir otra vista, vehículo o pieza). Si el configurador no carga, el hueco del hero se oculta y la lista se arma desde el catálogo y los kits.

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

- **Configurador (hero):** cada pieza aparece con un fundido corto y baja unos píxeles a su sitio (260 ms); una línea guía se dibuja desde un punto sobre la pieza hasta su etiqueta (solo las 5 piezas más recientes en pantalla ancha, 4 en media y 3 en estrecha, para que no se amontonen). El kit de elevación sube la carrocería y arrastra las capas que van con ella; las ruedas, el resorte y el amortiguador no. Cambiar de color, vehículo o vista es un fundido de 240–260 ms. Con `prefers-reduced-motion` todo aparece al instante.
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
Contraste ≥ 4,5:1 en texto, objetivos táctiles ≥ 44 px en el sitio (≥ 40 px en los controles del configurador), foco visible, controles reales (`button`, `checkbox`, pestañas con flechas, vistas y colores como `radiogroup`), sin dependencia de JS para leer el contenido. El vehículo es una imagen decorativa (`aria-hidden` en sus capas): lo que cambia se anuncia en una región `aria-live` («Añadido: Winch. 3 en tu lista.»). Se puede cambiar de vista con las flechas del teclado o deslizando sobre el vehículo.

## Ajuste a la pantalla
En escritorio el configurador mide entre 720 y 860 px de alto (`.cfg`, 88 % de la altura de la ventana): el escenario necesita unos 400 px para que el vehículo y las etiquetas no queden pequeños, así que en portátiles de 720 a 900 px el catálogo de piezas asoma por debajo del primer pantallazo. En 1280×720 se ve el titular, el vehículo completo y el botón «Solicitar cotización».

## Responsive
- **≥ 900 px:** pestañas en una columna a la izquierda (Vehículo, Color, Piezas, Kits, Mi lista), escenario a la derecha y el carrusel de piezas debajo.
- **< 900 px:** las pestañas pasan a una fila bajo el escenario; las etiquetas usan nombres cortos y el botón de la cabecera dice «Cotizar».
- **< 960 px:** menú en hamburguesa.

## Qué no cambiar sin consultar
Logos, paleta de la marca (negro, blanco, rojo), el principio "sin precios" y la sección Proyectos oculta hasta tener fotos reales.
