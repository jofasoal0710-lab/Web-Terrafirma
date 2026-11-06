# APEX Garage · sitio web de modificaciones de autos

Sitio estático (HTML + CSS + JS, **sin dependencias ni paso de compilación**) listo para desplegar en [Netlify](https://www.netlify.com/).

**Incluye**

- Hero, servicios, packs (Stage 1/2/3), proceso y contacto.
- **Cotizador interactivo**: el cliente marca mejoras, ve un estimado y lo envía con un clic al formulario.
- Galería de proyectos con filtros.
- Formulario de contacto con **Netlify Forms** (con antispam honeypot) y página de gracias.
- Página 404, favicon SVG, cabeceras de seguridad y tipografías autoalojadas.
- Responsive, accesible (navegación por teclado, `aria-*`, `prefers-reduced-motion`).

## Estructura

```
.
├── netlify.toml          # publica la carpeta public/ + cabeceras
└── public/
    ├── index.html        # página principal
    ├── gracias.html      # tras enviar el formulario
    ├── 404.html
    ├── favicon.svg
    ├── css/styles.css
    ├── js/main.js        # CONFIG, MODS (cotizador) y PROJECTS (galería)
    └── fonts/            # Barlow y Barlow Condensed (SIL OFL)
```

## Probar en local

```bash
python3 -m http.server 8000 --directory public
# o: npx serve public
```

Abre http://localhost:8000. (El formulario solo se registra al estar desplegado en Netlify.)

## Personalizar

| Qué | Dónde |
| --- | --- |
| Nombre del taller, textos, dirección, teléfono, correo, horario | `public/index.html` |
| Moneda y formato de precios | `CONFIG` en `public/js/main.js` |
| Mejoras y precios del cotizador | `MODS` en `public/js/main.js` |
| Precios de los packs | `data-price` en `public/index.html` (sección *Packs*) |
| Proyectos de la galería | `PROJECTS` en `public/js/main.js` |
| Colores | variables `:root` en `public/css/styles.css` (`--accent` es el naranja) |

**Fotos reales:** copia las imágenes a `public/images/` y añade `img: '/images/mi-foto.jpg'` al proyecto correspondiente en `PROJECTS`. Mientras no tenga `img`, se muestra una silueta marcada como «Ejemplo».

> Todos los textos, precios, direcciones y datos de contacto son **de ejemplo**. Reemplázalos antes de publicar.

## Desplegar en Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elige este repositorio.
2. Netlify lee `netlify.toml` (carpeta de publicación `public`, sin comando de build). Pulsa **Deploy**.
3. Cada `git push` a la rama principal publica una nueva versión automáticamente.

**Formulario de contacto:** tras el primer despliegue, en *Site configuration → Forms* aparecerá el formulario `contacto`. Activa avisos por correo en *Form notifications*. Los envíos incluyen la configuración elegida en el cotizador.

**Dominio propio:** *Domain management → Add a domain*. Netlify genera el HTTPS automáticamente.

## Licencias

Código del sitio: tuyo para usar y modificar. Tipografías Barlow / Barlow Condensed © The Barlow Project Authors, bajo [SIL Open Font License 1.1](https://openfontlicense.org/).
