# Producto: Terrafirma Costa Rica

## Qué es
Sitio web de **Terrafirma Costa Rica** (*Serious 4x4 Accessories*): accesorios para 4x4 y pick-ups. Los accesorios se instalan en **Musmanni's Workshop**, el taller aliado.

## Superficie y modo
- Una sola página pública (más `gracias` y `404`), modo **Persuade**: el visitante decide y actúa.
- **La acción de la categoría:** pedir una cotización con la lista de lo que quiere instalar. Por eso el hero es la herramienta para armar esa lista, no una imagen: un configurador donde se elige vehículo, color y vista, y se ven las piezas puestas.

## Visitantes
Dueños de 4x4 y pick-ups en Costa Rica, con Land Rover (Defender, Discovery, Range Rover) destacado porque es la especialidad de la marca, que quieren equipar su vehículo para trocha, viajes (overland), trabajo o expedición. Suelen entrar desde el teléfono.

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
- **Fuente del catálogo:** las 7 categorías y los nombres de los 20 accesorios siguen los tipos de producto de la gama del fabricante, https://terrafirma4x4.com/products (Terrafirma 4x4, Reino Unido, de Allmakes 4x4; leído el 9-nov-2026). Solo se usan **nombres de tipos de producto**: no se copian fotos, textos descriptivos ni números de parte del fabricante sin permiso expreso.
- **Sin confirmar (no afirmar en el sitio):** qué productos tiene o cotiza realmente Terrafirma Costa Rica; si es distribuidor autorizado (en el buscador de distribuidores del fabricante Costa Rica solo aparece como país seleccionable, sin distribuidor listado). Los **neumáticos** no forman parte de la gama del fabricante y se quitaron del sitio por decisión del cliente (nov-2026); no reponerlos sin confirmarlo. Si alguien los pregunta, el asistente deriva la consulta al equipo.
- La gama del fabricante incluye además dirección, frenos, transmisión y diferenciales, interior, exterior, carpas de techo, toldos, cajas de almacenaje y mercancía. No tienen pieza en el esquema, por eso se mencionan en el texto del catálogo y el asistente remite a preguntar.
- **Garantía:** solo se cita la que **publica el fabricante** en su FAQ (24 meses contra defectos de materiales y mano de obra, términos concretos según el distribuidor local), siempre atribuida a él y aclarando que los términos en Costa Rica los confirma el equipo.
- La sección **Proyectos** permanece oculta hasta que existan fotos reales de instalaciones (`PROJECTS` en `public/js/main.js`).
- **Imágenes del configurador provisionales:** los tres vehículos (SUV, pick-up y compacto), sus colores y las 20 vistas previas son renders de prueba hechos para este sitio, **no** representan ningún modelo, marca ni producto real de Terrafirma ni del fabricante, y el sitio los rotula como «Imagen provisional: vehículos y accesorios de prueba». Las vistas previas muestran dónde va cada pieza, no su aspecto real ni su compatibilidad con un modelo concreto. No presentarlas como fotos del producto; reemplazarlas cuando haya modelos o fotos reales y quitar el rótulo.
- Los colores del configurador son una muestra para visualizar el vehículo; no implican ofrecer pintura ni que un color esté disponible.

## Asistente de preguntas (límites)
- Contesta **solo con lo que ya dice el sitio**. Si no lo sabe, lo dice y ofrece enviar la pregunta al equipo (queda escrita en el formulario).
- **Nunca inventa** tiempos de instalación, precios, compatibilidad por modelo, dirección, horario ni formas de pago. La garantía solo la cita como dato publicado por el fabricante. Esas respuestas se añaden en `INTENTS` (`public/js/assistant.js`) cuando el cliente confirme el dato.
- El recomendador sugiere accesorios según uso, terreno, carga y viaje de noche; es orientación, no una cotización, y siempre pasa por «Mi lista».
- No es IA generativa ni usa servidor. Una versión con IA requeriría una función de Netlify, clave de API, límites de uso y revisión de privacidad.

## Pendiente de recibir
Fotos reales de instalaciones y de producto (con vehículo y accesorios instalados para el catálogo); modelos 3D o fotos de los vehículos reales (Land Rover Defender, Discovery y Range Rover primero) para sustituir los de prueba del configurador; datos de contacto; catálogo real; datos de negocio para el asistente (términos de garantía en Costa Rica, tiempos, pagos); qué productos de la gama se ofrecen.
