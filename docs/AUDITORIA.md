# Auditoría de diseño y funcionamiento

**Sitio:** https://terrafirma-costarica.netlify.app · **Fecha:** 7 de noviembre de 2026
**Alcance:** la página publicada (escritorio y móvil), medida antes y después de las correcciones.

## Método y límites
- Rúbrica de Impeccable: 5 dimensiones (0–4) para lo técnico y las 10 heurísticas de Nielsen (0–4) para el diseño.
- Mediciones con Chromium automatizado sobre producción: móvil con red lenta (1,6 Mb/s, 150 ms) y CPU 4× más lenta; contraste de todo el texto visible; prueba de impacto de cada control; recorrido con teclado; sin JavaScript; 10 tamaños de pantalla; fotogramas durante las animaciones; envío del formulario **simulado** (la solicitud no llega a Netlify).
- **No se ejecutó el detector de Impeccable** (el entorno bloqueó su lanzador) ni Lighthouse. **No se probó con un teléfono real ni con un lector de pantalla real.** Las notas son una estimación del propio auditor, no una certificación.

## Puntuación (0–4 por dimensión)
| Dimensión | Antes | Después | Qué la movió |
| --- | :-: | :-: | --- |
| Accesibilidad | 3 | 4 | Avisos `aria-live`, contraste 4,53 → 4,95:1, alternativa sin JS, sección actual en el menú, campos inválidos visibles |
| Rendimiento | 3 | 4 | LCP 1,66 → 1,01 s, TBT 324 → 96 ms, 163 KB en 10 peticiones, caché configurada (CLS 0,038, sin cambio) |
| Temas y tokens | 3 | 3 | Sin cambios: quedan colores sueltos dentro del SVG |
| Responsive | 3 | 3 | El hero ya cabe en portátiles; en teléfonos de 640 px de alto el botón sigue bajo el pliegue |
| Integridad de implementación | 3 | 4 | Favicon propio (antes el logo de Netlify), metadatos completos, sin cajas vacías |
| **Total** | **15/20** | **18/20** | |

**Heurísticas de Nielsen:** 26/40 → 32/40 (estimado). Suben visibilidad del estado, consistencia, estética, prevención y recuperación de errores y flexibilidad. Siguen en 2 los puntos de **ayuda** (no hay preguntas frecuentes) y quedan sin resolver los canales de contacto directo.

## Hallazgos
| # | Prioridad | Hallazgo | Estado |
| --- | :-: | --- | --- |
| 1 | P0 | No hay WhatsApp, teléfono ni correo: solo el formulario. En Costa Rica el WhatsApp es el canal principal | **Falta tu dato.** El botón ya está construido: `CONTACT` en `public/js/main.js` |
| 2 | P0 | No hay fotos reales de trabajos: la confianza depende de un dibujo | **Faltan tus fotos.** La galería y el visor ya están listos |
| 3 | P1 | En portátiles de 1366×768, 1536×864 y 1280×720 el botón del hero y la fila inferior de etiquetas quedaban fuera de pantalla | Corregido |
| 4 | P1 | `/favicon.ico` servía el logo por defecto de Netlify | Corregido (favicon.ico, apple-touch-icon propios) |
| 5 | P1 | Sin imagen al compartir el enlace (`og:image`), sin `canonical`, `og:url` ni `twitter:card` | Corregido (imagen 1200×630 con el esquema del sitio) |
| 6 | P1 | SEO: título de 75 caracteres, descripción de 197, sin `robots.txt` ni `sitemap.xml`, sin datos estructurados | Corregido |
| 7 | P1 | Sin JavaScript, "Mi lista" era una caja vacía con un botón muerto | Corregido (aviso con alternativa) |
| 8 | P1 | Textos "Por confirmar" visibles en la página pública | Corregido (solo se muestran datos reales) |
| 9 | P1 | El distintivo "Powered by Netlify" tapa el botón del hero y los chips en móvil | **Fuera del código.** Lo inyecta Netlify; revisa en tu panel si tu plan permite ocultarlo |
| 10 | P2 | Al cambiar la lista no se avisa a lectores de pantalla | Corregido |
| 11 | P2 | La lista se perdía al recargar o volver atrás | Corregido (se recuerda en el navegador; la página de gracias la borra) |
| 12 | P2 | Formulario: sin campos inválidos resaltados, sin estado de envío (doble envío posible), mensaje obligatorio aun con lista | Corregido |
| 13 | P2 | Dos verbos para la misma acción ("Pedir" y "Solicitar" cotización) y botón del hero "Ver mi lista (0)" con la lista vacía | Corregido |
| 14 | P2 | Sin sección actual marcada en el menú | Corregido |
| 15 | P2 | Rojo con 4,53:1 (justo en el límite) y hover que aclaraba y bajaba el contraste | Corregido (4,95:1; el hover oscurece) |
| 16 | P2 | Imágenes sin caché (`max-age=0`) | Corregido |
| 17 | P2 | No hay preguntas frecuentes (compatibilidad, garantía, tiempos de instalación) | **Falta información del negocio** |
| 18 | P3 | En teléfonos de 640 px de alto el botón del hero queda bajo el pliegue | Pendiente (idea: barra fija con "Ver mi lista" cuando haya piezas) |
| 19 | P3 | 21 casillas en "Mi lista" = 21 paradas de tabulación | Pendiente (aceptable; mejorable con navegación por flechas) |
| 20 | P3 | CLS 0,038 por el cambio de fuente con red lenta | Pendiente (dentro de "bueno"; se reduce con una fuente de respaldo de métricas iguales) |
| 21 | P3 | Sin política CSP | Pendiente (probar antes: podría interferir con el distintivo de Netlify) |
| 22 | P3 | Dominio `netlify.app` | Decisión tuya: un dominio propio mejora confianza y SEO. Al cambiarlo, actualizar las URL indicadas en el README |
| 23 | P3 | Sin analítica | Decisión tuya: sin ella no se puede medir cuántos piden cotización |

## Qué se verificó y está bien
- Contraste ≥ 4,5:1 en todos los textos medidos (123 en escritorio, 118 en móvil); sin controles tapados; sin errores de consola ni peticiones fallidas.
- Sin desborde horizontal de 320 a 1920 px, ni con texto al 200 %.
- Fotogramas estables (p95 16,7 ms) incluso con CPU 4× más lenta y con el movimiento ambiental activo.
- Foco visible en todos los controles; el primer control del teclado es el salto al contenido.
- El formulario envía los 9 campos esperados (`form-name`, `nombre`, `email`, `telefono`, `vehiculo`, `uso`, `mensaje`, `configuracion`, `bot-field`) a `/gracias.html`.
- Cabeceras de seguridad de Netlify (HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) presentes.

## Pendientes que necesitan tu información
1. **WhatsApp, teléfono, correo, dirección y horario** → `CONTACT` en `public/js/main.js`.
2. **Fotos reales** → `public/images/proyectos/` y `PROJECTS` en el mismo archivo.
3. **Preguntas frecuentes** reales del negocio.
4. **Decisiones:** dominio propio y analítica.
