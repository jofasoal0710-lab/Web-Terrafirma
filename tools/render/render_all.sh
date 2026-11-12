#!/bin/sh
# Regenera todas las imágenes del configurador (largo en CPU: puede pasar de una hora) y los datos de las vistas.
#
#   tools/render/render_all.sh <python-con-bpy> [carpeta_de_trabajo]
#
# <python-con-bpy>: intérprete con el paquete `bpy` y `Pillow` instalados (pip install bpy==5.2.3 pillow, en un entorno virtual).
# Resultado, dentro de <carpeta_de_trabajo> (por defecto ./render-out):
#   publico/frente|lado|atras/<vehiculo>/*.webp, publico/fondo.webp, publico/configurador-data.js
# Para publicarlo: copiar publico/{frente,lado,atras,fondo.webp} a public/images/configurador/ y configurador-data.js a public/js/.
set -e
PY=${1:?indica el python que tiene bpy, p. ej. ./venv/bin/python}
WORK=${2:-./render-out}
HERE=$(cd "$(dirname "$0")" && pwd)
SAMPLES=40                      # muestras de Cycles para la base (las piezas usan 28)
mkdir -p "$WORK/capas" "$WORK/publico"

for view in frente lado atras; do
  if [ "$view" = "frente" ]; then W=1920; else W=1600; fi
  for veh in suv pickup compact; do
    out="$WORK/capas/${view}_${veh}"
    mkdir -p "$out"
    echo "== $view $veh: base y máscara";  MODE=basefix VIEW=$view "$PY" -I "$HERE/blender_parts.py" $veh "$out" $W $SAMPLES
    echo "== $view $veh: elevado";          MODE=lift    VIEW=$view "$PY" -I "$HERE/blender_parts.py" $veh "$out" $W $SAMPLES
    echo "== $view $veh: piezas";           MODE=parts PARTS_SAMPLES=28 VIEW=$view "$PY" -I "$HERE/blender_parts.py" $veh "$out" $W $SAMPLES
  done
done

JOBS=""
for view in frente lado atras; do for veh in suv pickup compact; do JOBS="$JOBS $view:$veh=$WORK/capas/${view}_${veh}"; done; done
# shellcheck disable=SC2086
"$PY" -I "$HERE/process_views.py" "$WORK/publico" $JOBS
"$PY" -I "$HERE/make_background.py" "$WORK/publico"
echo "Listo: $WORK/publico"
