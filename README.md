# Terrafirma Costa Rica · sitio web

Sitio web de **Terrafirma Costa Rica** (*Serious 4x4 Accessories*), con la instalación de los accesorios en **Musmanni's Workshop**.

Es un sitio estático (HTML + CSS + JS, **sin dependencias ni paso de compilación**) listo para desplegar en [Netlify](https://www.netlify.com/).

**Incluye**

- Hero, categorías de accesorios, kits sugeridos por tipo de uso y sección de instalación en Musmanni's Workshop.
- **Cotizador**: el cliente marca los accesorios que le interesan y envía la lista con un clic al formulario.
- Galería de proyectos con filtros.
- Formulario de contacto con **Netlify Forms** (antispam honeypot) y página de gracias.
- Página 404, favicon, cabeceras de seguridad y tipografías autoalojadas.
- Responsive y accesible (teclado, `aria-*`, `prefers-reduced-motion`).

## Estructura

```
.
├── netlify.toml          # publica la carpeta public/ + cabeceras
└── public/
    ├── index.html        # página principal
    ├── gracias.html      # tras enviar el formulario
    ├── 404.html
    ├── favicon.svg
    ├── css/styles.css    # paleta en las variables :root (rojo Terrafirma)
    ├── js/main.js        # MODS (cotizador) y PROJECTS (galería)
    ├── images/           # logos de Terrafirma y Musmanni's Workshop
    └── fonts/            # Barlow y Barlow Condensed (SIL OFL)
```

## Probar en local

```bash
python3 -m http.server 8000 --directory public
# o: npx serve public
```

Abre http://localhost:8000. (El formulario solo se registra al estar desplegado en Netlify.)

## Datos pendientes de completar

En `public/index.html`, sección **Contacto**, hay cuatro campos marcados *«Por confirmar»*:
dirección de Musmanni's Workshop, teléfono/WhatsApp, correo y horario. Reemplázalos antes de publicar.

## Personalizar

| Qué | Dónde |
| --- | --- |
| Textos, categorías de accesorios, kits | `public/index.html` |
| Lista de accesorios del cotizador | `MODS` en `public/js/main.js` |
| Proyectos de la galería | `PROJECTS` en `public/js/main.js` |
| Colores | variables `:root` en `public/css/styles.css` (`--accent` y `--btn` son el rojo) |
| Logos | `public/images/` |

**Fotos reales de proyectos:** copia las imágenes a `public/images/` y añade `img: '/images/mi-foto.jpg'` al proyecto correspondiente en `PROJECTS`. Mientras no tenga `img`, se muestra una silueta marcada como «Ejemplo».

**Precios:** el sitio no muestra precios; todo se cotiza por vehículo.

> Las categorías, los accesorios del cotizador y los kits son una propuesta genérica de equipamiento 4x4. Ajústalos al catálogo real.

## Desplegar en Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elige este repositorio.
2. Netlify lee `netlify.toml` (carpeta de publicación `public`, sin comando de build). Pulsa **Deploy**.
3. Cada `git push` a la rama principal publica una nueva versión automáticamente.

**Formulario de contacto:** tras el primer despliegue, en *Site configuration → Forms* aparecerá el formulario `contacto`. Activa avisos por correo en *Form notifications*. Cada envío incluye la lista elegida en el cotizador.

**Dominio propio:** *Domain management → Add a domain*. Netlify genera el HTTPS automáticamente.

## Créditos y licencias

- Logos de Terrafirma Costa Rica y de Musmanni's Workshop: propiedad de sus respectivos titulares.
- Tipografías Barlow / Barlow Condensed © The Barlow Project Authors, bajo [SIL Open Font License 1.1](https://openfontlicense.org/).
