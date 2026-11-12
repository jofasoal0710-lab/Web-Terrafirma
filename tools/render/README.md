# Imágenes del configurador

Las imágenes de `public/images/configurador/` **no son fotos**: son renders de **vehículos y accesorios de prueba** (formas sencillas, modeladas desde cero en Blender) que sirven para que el configurador funcione mientras llegan los modelos y las fotos reales. Están rotuladas en la página como «Imagen provisional: vehículos y accesorios de prueba». No representan ningún modelo ni producto real, y no se usó ningún modelo de terceros.

Esta carpeta guarda cómo se hicieron, para poder regenerarlas o cambiarlas.

## Cómo está armado

Cada vista (`frente`, `lado`, `atras`) y vehículo (`suv`, `pickup`, `compact`) es una **pila de imágenes WebP con la misma cámara y encuadre**:

| Archivo | Qué es |
| --- | --- |
| `base.webp` | El vehículo en gris neutro, sobre fondo transparente |
| `mask.webp` | Máscara de la pintura (blanco = carrocería). El navegador la usa para teñir el color elegido con `mix-blend-mode: multiply` |
| `base-lift.webp`, `mask-lift.webp` | El mismo vehículo con la carrocería elevada (kit de elevación). Las ruedas no suben |
| `<id>.webp` | Una capa por accesorio visible en esa vista (`winch`, `snork`, `rock`…; los ids son los de `MODS` en `public/js/main.js`). Amortiguadores, resortes, protector de bajos y filtro de aire se dibujan en transparencia («rayos X») |
| `thumb.webp`, `thumb-mask.webp` | Miniatura del vehículo para el selector (solo vista `frente`) |
| `../fondo.webp` | Fondo de taller generado (no es la foto de nadie) |

`public/js/configurador-data.js` guarda, por vista y vehículo, la proporción de la imagen, cuánto sube el kit de elevación y **dónde está cada pieza** (caja en %), que es de donde salen los puntos y las etiquetas. Una pieza que apenas se ve en una vista (< 30 % de su área máxima) no se dibuja ni se etiqueta en ella.

El pintado, las capas, el giro entre vistas y la lista viven en `public/js/configurador.js` + `public/css/configurador.css` (Shadow DOM). El componente **no tiene lista propia**: lee y escribe las casillas de «Mi lista» a través de `window.TF`.

## Regenerar

Necesitas Python 3.11+ con Blender como módulo y Pillow:

```bash
python3 -m venv venv
./venv/bin/pip install bpy==5.2.3 pillow
tools/render/render_all.sh ./venv/bin/python ./render-out
```

Es un proceso largo en CPU (3 vistas × 3 vehículos × ~20 capas): déjalo corriendo; puede pasar de una hora. Después copia el resultado:

```bash
cp -r render-out/publico/frente render-out/publico/lado render-out/publico/atras render-out/publico/fondo.webp public/images/configurador/
cp render-out/publico/configurador-data.js public/js/
```

Scripts:

- `blender_parts.py`: modela el vehículo y sus piezas y renderiza una capa por llamada (`MODE=basefix|lift|parts`, `VIEW=frente|lado|atras`).
- `process_views.py`: recorta cada vista a un encuadre común, crea las máscaras y miniaturas, decide qué piezas se ven en cada vista y escribe `configurador-data.js`.
- `make_background.py`: genera `fondo.webp`.
- `render_all.sh`: los encadena.

## Cuando lleguen los modelos o fotos reales

1. **Modelos 3D reales** (de Land Rover u otros): cambia la creación del vehículo en `blender_parts.py` por la importación del modelo, manteniendo los mismos grupos (`body`, `wheels`, `floor`) y la misma cámara, o sustituye los renders por los propios con el mismo nombre de archivo y encuadre. Si cambia la proporción de la imagen, `process_views.py` actualiza `configurador-data.js`.
2. **Fotos reales de producto**: el componente solo necesita que cada capa encaje con su base; no depende de cómo se hizo.
3. Quita el rótulo «Imagen provisional…» (`.tag` en `public/js/configurador.js`) cuando las imágenes ya sean reales.
4. Si añades un vehículo nuevo: agrégalo a `VEHICLES` en `public/js/configurador.js` y a `render_all.sh`.
