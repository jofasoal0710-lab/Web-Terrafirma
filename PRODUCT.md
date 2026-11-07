# Producto: Terrafirma Costa Rica

## Qué es
Sitio web de **Terrafirma Costa Rica** (*Serious 4x4 Accessories*): accesorios para 4x4 y pick-ups. Los accesorios se instalan en **Musmanni's Workshop**, el taller aliado.

## Superficie y modo
- Una sola página pública (más `gracias` y `404`), modo **Persuade**: el visitante decide y actúa.
- **La acción de la categoría:** pedir una cotización con la lista de lo que quiere instalar. Por eso el hero es la herramienta para armar esa lista, no una imagen.

## Visitantes
Dueños de 4x4 y pick-ups en Costa Rica que quieren equipar su vehículo para trocha, viajes (overland), trabajo o expedición. Suelen entrar desde el teléfono.

## Voz
Español de Costa Rica, directo y concreto. Verbos simples, frases cortas, sin exageraciones. Los botones nombran lo que hacen ("Añadir a mi lista", "Solicitar cotización"). Sin signos de exclamación salvo en la página de gracias.

## Marca (fijada por el cliente)
- Logo de Terrafirma Costa Rica: texto blanco con la "M" roja sobre negro (`public/images/terrafirma-logo-white.png`).
- Logo de Musmanni's Workshop: verde oscuro y negro, **siempre sobre tarjeta blanca** (`public/images/musmannis-workshop.webp`).
- Paleta de la marca: negro, blanco y rojo. No se cambia.

## Hechos y límites (no inventar)
- **Sin precios:** todo se cotiza por vehículo. No mostrar cifras ni "desde".
- **Sin cifras de resultados, años de experiencia ni testimonios.**
- **Datos de contacto pendientes** (no se muestran hasta tenerlos): WhatsApp, teléfono, correo, dirección de Musmanni's y horario. Se configuran en `CONTACT` (`public/js/main.js`). El Instagram es `@terrafirma_cr`.
- Las categorías y accesorios del catálogo son una propuesta genérica de equipamiento 4x4; confirmar contra el catálogo real.
- La sección **Proyectos** permanece oculta hasta que existan fotos reales de instalaciones (`PROJECTS` en `public/js/main.js`).

## Asistente de preguntas (límites)
- Contesta **solo con lo que ya dice el sitio**. Si no lo sabe, lo dice y ofrece enviar la pregunta al equipo (queda escrita en el formulario).
- **Nunca inventa** garantía, tiempos de instalación, precios, compatibilidad por modelo, dirección, horario ni formas de pago. Esas respuestas se añaden en `INTENTS` (`public/js/assistant.js`) cuando el cliente confirme el dato.
- El recomendador sugiere accesorios según uso, terreno, carga y viaje de noche; es orientación, no una cotización, y siempre pasa por «Mi lista».
- No es IA generativa ni usa servidor. Una versión con IA requeriría una función de Netlify, clave de API, límites de uso y revisión de privacidad.

## Pendiente de recibir
Fotos reales de instalaciones y de producto (con vehículo y accesorios instalados para el catálogo); datos de contacto; catálogo real; datos de negocio para el asistente (garantía, tiempos, pagos).
