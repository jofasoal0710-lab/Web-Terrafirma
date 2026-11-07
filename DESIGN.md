# Diseño: Terrafirma Costa Rica

Sistema vigente en `public/css/styles.css`. Revisado con las guías de Impeccable, `frontend-design`, Emil Kowalski y Motion Design.

## Idea central
El hero **es la herramienta**: un esquema técnico del 4x4 donde cada accesorio se toca para añadirlo a la lista. La lista (las casillas de "Mi lista") es la única fuente de verdad; el esquema, los chips, el resumen y el formulario se derivan de ella. Todo lo demás apoya esa acción.

## Color
Neutros puros, sin tinte (negro y blanco de la marca) y un solo acento, el rojo de la "M" del logo.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#000000` | Fondo de página |
| `--bg-alt` | `#0d0d0d` | Secciones alternas |
| `--surface` | `#151515` | Resumen y formulario |
| `--line` / `--line-strong` | `#262626` / `#3d3d3d` | Divisores y bordes |
| `--text` / `--muted` | `#f4f4f1` / `#a9a9a4` | Texto principal y secundario |
| `--red` | `#e32b22` | Rellenos (botón, chip elegido). Texto blanco encima |
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
- **Un solo momento autorado:** al cargar, el esquema se dibuja (1,1 s) y las etiquetas entran en cascada (45 ms entre ellas).
- Todo lo demás responde a una acción: pulsar (`scale .97`, 140 ms), activar una pieza (color y relleno, 220 ms), elevar la suspensión (el 4x4 sube 14 px, 260 ms).
- Curva única: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out fuerte). Sin `ease-in`, sin `transition: all`, nada parte de `scale(0)`.
- Efectos `hover` solo con `(hover: hover) and (pointer: fine)`. Con `prefers-reduced-motion` no hay animaciones.
- Sin animaciones de entrada por scroll ni tarjetas que se elevan.

## Superficies del navegador
Selección de texto roja, cursor (`caret-color`) rojo, barra de desplazamiento oscura, anillo de foco rojo con desplazamiento, cifras tabulares en contadores.

## Accesibilidad
Contraste ≥ 4,5:1 en texto, objetivos táctiles ≥ 44 px en móvil, foco visible, esquema con `role="img"` y controles reales (`button`, `checkbox`, pestañas con flechas), sin dependencia de JS para leer el contenido.

## Responsive
- **≥ 1000 px:** etiquetas alrededor del esquema con líneas guía.
- **< 1000 px:** el esquema se recorta a la silueta y las mismas piezas aparecen como chips debajo.
- **< 960 px:** menú en hamburguesa.

## Qué no cambiar sin consultar
Logos, paleta de la marca (negro, blanco, rojo), el principio "sin precios" y la sección Proyectos oculta hasta tener fotos reales.
