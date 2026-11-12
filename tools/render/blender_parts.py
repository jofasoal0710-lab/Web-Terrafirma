"""Vehículos de prueba (SUV, pick-up y compacto) y sus piezas, modelados y renderizados por capas con Blender (bpy, Cycles en CPU).
Cada vehículo se renderiza con la misma cámara y luces, así que las capas encajan entre sí al apilarlas.
Uso: python blender_parts.py <suv|pickup|compact> <carpeta_salida> <ancho> <muestras>
Variables de entorno:
  VIEW=frente|lado|atras
  MODE=parts   -> capas de piezas externas (con el vehículo como "holdout") y en transparencia (rayos X) para piezas internas
  MODE=lift    -> vehículo elevado (carrocería sube, ruedas no): base_lift.png + mask_lift.png + lift.json (desplazamiento en píxeles)
  MODE=basefix -> base_neutral.png y mask.png (vehículo gris neutro y su máscara de pintura; el compacto no trae la llanta de repuesto: es la pieza «repu»)"""
import sys, os, math, time, json
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

KIND = sys.argv[1]
OUT = sys.argv[2]
W = int(sys.argv[3])
SAMPLES = int(sys.argv[4])
H = round(W * 9 / 16)
MODE = os.environ.get('MODE', 'parts')
VIEW = os.environ.get('VIEW', 'frente')
LIFT = 0.14
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'


def mat(name, color, metallic=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = strength
    return m


PAINT = mat('pintura', (0.8, 0.8, 0.8), 0.35, 0.26)
BLACK = mat('negro', (0.015, 0.015, 0.016), 0.2, 0.45)
GLASS = mat('vidrio', (0.01, 0.012, 0.016), 0.0, 0.05)
TIRE = mat('llanta', (0.02, 0.02, 0.02), 0.0, 0.85)
RIM = mat('rin', (0.35, 0.36, 0.38), 0.9, 0.3)
STEEL = mat('acero', (0.08, 0.08, 0.085), 0.85, 0.38)
LAMP = mat('faro', (1, 1, 0.95), 0.0, 0.1, emit=(1, 0.96, 0.85), strength=6)
TAIL = mat('piloto', (0.6, 0.02, 0.02), 0.0, 0.2, emit=(1, 0.05, 0.03), strength=1.5)
LED = mat('led', (1, 1, 1), 0.0, 0.1, emit=(1, 0.97, 0.9), strength=12)
RED = mat('rojo', (0.62, 0.03, 0.02), 0.1, 0.4)
ORANGE = mat('naranja', (0.9, 0.34, 0.03), 0.05, 0.5)
OLIVE = mat('oliva', (0.12, 0.17, 0.06), 0.1, 0.55)
GUN = mat('rin_nuevo', (0.07, 0.07, 0.08), 0.9, 0.28)
LIGHT = mat('rayo', (0.62, 0.63, 0.66), 0.9, 0.3)
XRAY = mat('rayosx', (1.0, 0.42, 0.35), 0.0, 0.5, emit=(1.0, 0.28, 0.22), strength=0.9)

groups = {}


def add(group, obj, material=None, bevel=0.0):
    if material:
        obj.data.materials.append(material)
    if bevel:
        bpy.context.view_layer.objects.active = obj
        m = obj.modifiers.new('bisel', 'BEVEL'); m.width = bevel; m.segments = 4; m.limit_method = 'ANGLE'
    bpy.ops.object.shade_smooth()
    groups.setdefault(group, []).append(obj)
    return obj


def box(group, loc, size, material, bevel=0.03, rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)   # (por defecto también reinicia la posición)
    if rot:
        o.rotation_euler = rot
    return add(group, o, material, bevel)


def cyl(group, loc, radius, depth, material, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    return add(group, bpy.context.object, material)


def torus(group, loc, major, minor, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, rotation=rot, major_radius=major, minor_radius=minor, major_segments=36, minor_segments=10)
    return add(group, bpy.context.object, material)


# dimensiones de cada vehículo (iguales a las de los renders anteriores)
DIM = {
    'suv':     dict(FB=2.34, RX=-2.31, W=0.95, ROOF=2.01, RX0=-1.95, RX1=1.25, WX=(1.42, -1.42), WR=0.42, TRACK=0.85, HOOD=1.31, FX=2.30),
    'pickup':  dict(FB=2.72, RX=-2.66, W=0.975, ROOF=1.91, RX0=-0.75, RX1=1.45, WX=(1.75, -1.65), WR=0.46, TRACK=0.85, HOOD=1.25, FX=2.65),
    'compact': dict(FB=1.80, RX=-1.78, W=0.85, ROOF=1.91, RX0=-1.65, RX1=1.25, WX=(1.10, -1.10), WR=0.40, TRACK=0.78, HOOD=1.20, FX=1.75),
}
D = DIM[KIND]


def arches(body, xs, radius, z, y=0.8):
    for sx in xs:
        for sy in (1, -1):
            arch = cyl('hidden', (sx, sy * y, z), radius, 0.7, BLACK, rot=(math.pi / 2, 0, 0))
            arch.hide_render = True
            bm = body.modifiers.new('arco', 'BOOLEAN'); bm.operation = 'DIFFERENCE'; bm.object = arch; bm.solver = 'EXACT'


def wheels(xs, tire_r, rim_r, y):
    for sx in xs:
        for sy in (1, -1):
            cyl('wheels', (sx, sy * y, tire_r), tire_r, 0.3, TIRE, rot=(math.pi / 2, 0, 0))
            cyl('wheels', (sx, sy * (y + 0.15), tire_r), rim_r, 0.06, RIM, rot=(math.pi / 2, 0, 0))


# ---------- vehículos base (sin accesorios; carrocería = 'body', ruedas = 'wheels') ----------
def base_suv():
    body = box('body', (0, 0, 0.88), (4.6, 1.9, 0.86), PAINT, 0.12)
    arches(body, (1.42, -1.42), 0.55, 0.45, 0.78)
    box('body', (-0.35, 0, 1.62), (3.2, 1.74, 0.78), PAINT, 0.12)
    box('body', (-0.35, 0, 1.66), (3.0, 1.79, 0.46), GLASS, 0.05)
    for x in (-1.6, -0.9, -0.15, 0.55):
        box('body', (x, 0, 1.66), (0.07, 1.82, 0.5), PAINT, 0.02)
    box('body', (1.02, 0, 1.58), (0.4, 1.7, 0.7), GLASS, 0.05).rotation_euler[1] = math.radians(28)
    wheels((1.42, -1.42), 0.42, 0.27, 0.85)
    box('body', (2.34, 0, 0.55), (0.14, 1.9, 0.22), BLACK, 0.04)
    box('body', (2.32, 0, 0.98), (0.05, 1.1, 0.22), BLACK, 0.02)
    for sy in (1, -1):
        box('body', (2.32, sy * 0.75, 1.02), (0.06, 0.34, 0.16), LAMP, 0.03)
        box('body', (-2.31, sy * 0.78, 1.0), (0.05, 0.22, 0.28), TAIL, 0.02)


def base_pickup():
    body = box('body', (0, 0, 0.86), (5.3, 1.95, 0.78), PAINT, 0.12)
    arches(body, (1.75, -1.65), 0.58, 0.46)
    box('body', (0.35, 0, 1.55), (2.2, 1.8, 0.72), PAINT, 0.12)
    box('body', (0.3, 0, 1.6), (2.0, 1.84, 0.42), GLASS, 0.05)
    for x in (-0.5, 0.2, 0.9):
        box('body', (x, 0, 1.6), (0.07, 1.87, 0.46), PAINT, 0.02)
    box('body', (1.4, 0, 1.52), (0.34, 1.72, 0.62), GLASS, 0.05).rotation_euler[1] = math.radians(28)
    for sy in (1, -1):
        box('body', (-1.7, sy * 0.92, 1.46), (1.95, 0.09, 0.44), PAINT, 0.03)
    box('body', (-2.64, 0, 1.46), (0.09, 1.95, 0.44), PAINT, 0.03)
    box('body', (-1.7, 0, 1.27), (1.9, 1.78, 0.05), BLACK, 0.01)
    wheels((1.75, -1.65), 0.46, 0.3, 0.85)
    box('body', (2.72, 0, 0.55), (0.14, 1.95, 0.24), BLACK, 0.04)
    box('body', (2.67, 0, 1.0), (0.05, 1.15, 0.24), BLACK, 0.02)
    for sy in (1, -1):
        box('body', (2.66, sy * 0.78, 1.05), (0.06, 0.34, 0.16), LAMP, 0.03)
        box('body', (-2.66, sy * 0.82, 1.06), (0.05, 0.22, 0.3), TAIL, 0.02)


def base_compact():     # sin llanta de repuesto: ahora es la pieza «repu»
    body = box('body', (0, 0, 0.85), (3.5, 1.7, 0.7), PAINT, 0.1)
    arches(body, (1.1, -1.1), 0.52, 0.44)
    box('body', (-0.2, 0, 1.52), (2.9, 1.62, 0.78), PAINT, 0.08)
    box('body', (-0.2, 0, 1.58), (2.7, 1.66, 0.46), GLASS, 0.04)
    for x in (-1.2, -0.45, 0.3, 0.95):
        box('body', (x, 0, 1.58), (0.07, 1.69, 0.5), PAINT, 0.02)
    box('body', (1.22, 0, 1.5), (0.12, 1.5, 0.62), GLASS, 0.03).rotation_euler[1] = math.radians(10)
    wheels((1.1, -1.1), 0.4, 0.26, 0.78)
    box('body', (1.8, 0, 0.5), (0.12, 1.7, 0.2), BLACK, 0.04)
    box('body', (1.77, 0, 0.98), (0.05, 0.95, 0.22), BLACK, 0.02)
    for sy in (1, -1):
        box('body', (1.76, sy * 0.62, 1.0), (0.06, 0.3, 0.2), LAMP, 0.03)
        box('body', (-1.78, sy * 0.7, 0.98), (0.05, 0.2, 0.28), TAIL, 0.02)


# ---------- piezas ----------
def p_defdel():
    x = D['FB'] + 0.17
    box('def-del', (x, 0, 0.50), (0.2, 2 * D['W'] + 0.10, 0.28), STEEL, 0.04)
    for sy in (1, -1):
        cyl('def-del', (x + 0.02, sy * 0.50, 0.78), 0.045, 0.62, STEEL, verts=20)
        box('def-del', (x - 0.03, sy * (D['W'] - 0.05), 0.62), (0.16, 0.12, 0.5), STEEL, 0.03)
    cyl('def-del', (x + 0.02, 0, 1.05), 0.045, 1.1, STEEL, rot=(math.pi / 2, 0, 0), verts=20)


def p_deftra():
    x = D['RX'] - 0.15
    box('def-tra', (x, 0, 0.5), (0.2, 2 * D['W'] + 0.10, 0.26), STEEL, 0.04)
    for sy in (1, -1):
        box('def-tra', (x + 0.01, sy * (D['W'] + 0.03), 0.74), (0.18, 0.1, 0.32), STEEL, 0.03)


def p_remol():
    for x in (D['FB'] + 0.07, D['RX'] - 0.07):
        for sy in (1, -1):
            torus('remol', (x, sy * 0.55, 0.36), 0.06, 0.015, RED, rot=(math.pi / 2, 0, math.radians(35)))
            box('remol', (x, sy * 0.55, 0.43), (0.05, 0.05, 0.06), RED, 0.01)


def p_recup():
    x = D['RX'] - 0.10
    cyl('recup', (x, -0.55, 1.2), 0.03, 1.15, STEEL, verts=16)
    box('recup', (x - 0.02, -0.55, 1.8), (0.1, 0.16, 0.1), RED, 0.02)
    box('recup', (x, -0.55, 0.62), (0.14, 0.2, 0.06), STEEL, 0.01)
    cx = (D['RX0'] + D['RX1']) / 2
    for sy in (1, -1):
        box('recup', (cx - 0.1, sy * 0.42, D['ROOF'] + 0.05), (1.3, 0.3, 0.05), ORANGE, 0.015)


def p_barras():
    span = D['RX1'] - D['RX0']
    for f in (0.2, 0.5, 0.8):
        x = D['RX0'] + span * f
        box('barras', (x, 0, D['ROOF'] + 0.04), (0.07, 2 * D['W'] - 0.28, 0.055), STEEL, 0.015)
        for sy in (1, -1):
            box('barras', (x, sy * (D['W'] - 0.18), D['ROOF'] + 0.01), (0.1, 0.08, 0.04), STEEL, 0.01)


def p_soport():
    for sy in (1, -1):
        x = D['RX0'] + 0.35
        box('soport', (x, sy * 0.55, D['ROOF'] + 0.28), (0.34, 0.16, 0.44), OLIVE if sy > 0 else RED, 0.025)
        box('soport', (x, sy * 0.55, D['ROOF'] + 0.53), (0.14, 0.10, 0.05), BLACK, 0.015)
        box('soport', (x, sy * 0.55, D['ROOF'] + 0.04), (0.42, 0.22, 0.04), STEEL, 0.01)


def p_repu():
    r = 0.36 if KIND == 'compact' else 0.4
    z = 1.2 if KIND == 'pickup' else 1.05
    x = D['RX'] - 0.22
    cyl('repu', (x, 0, z), r, 0.24, TIRE, rot=(0, math.pi / 2, 0))
    cyl('repu', (x - 0.13, 0, z), 0.21, 0.05, RIM, rot=(0, math.pi / 2, 0))
    box('repu', (x + 0.12, 0, z - 0.46), (0.1, 0.34, 0.1), STEEL, 0.02)
    box('repu', (x + 0.10, 0, z), (0.06, 0.16, 0.16), STEEL, 0.015)


def p_faros():
    for sy in (1, -1):
        cyl('faros', (D['FB'] + 0.07, sy * 0.5, 0.80), 0.10, 0.1, BLACK, rot=(0, math.pi / 2, 0), verts=32)
        cyl('faros', (D['FB'] + 0.125, sy * 0.5, 0.80), 0.082, 0.02, LAMP, rot=(0, math.pi / 2, 0), verts=32)


def p_trab():
    for sy in (1, -1):
        box('trab', (D['RX0'] + 0.03, sy * 0.72, D['ROOF'] + 0.08), (0.1, 0.16, 0.10), BLACK, 0.02)
        box('trab', (D['RX0'] - 0.025, sy * 0.72, D['ROOF'] + 0.08), (0.02, 0.13, 0.07), LED, 0.005)


def p_rines():
    wr = D['WR']
    for sx in D['WX']:
        for sy in (1, -1):
            y = sy * (D['TRACK'] + 0.21)
            cyl('rines', (sx, y, wr), wr * 0.80, 0.09, GUN, rot=(math.pi / 2, 0, 0))
            cyl('rines', (sx, y + sy * 0.05, wr), wr * 0.16, 0.04, LIGHT, rot=(math.pi / 2, 0, 0), verts=24)
            for k in range(6):
                s = box('rines', (sx, y + sy * 0.05, wr), (wr * 1.34, 0.03, 0.05), LIGHT, 0.005)
                s.rotation_euler[1] = math.radians(30 * k)


def p_winch():
    x = D['FB'] + 0.36
    cyl('winch', (x, 0, 0.5), 0.10, 0.5, BLACK, rot=(math.pi / 2, 0, 0), verts=32)
    box('winch', (x - 0.12, 0, 0.5), (0.14, 0.62, 0.2), STEEL, 0.03)
    box('winch', (x + 0.13, 0, 0.44), (0.06, 0.34, 0.12), STEEL, 0.02)
    box('winch', (x + 0.16, 0, 0.32), (0.05, 0.07, 0.14), RED, 0.015)


# piezas internas o por debajo: se dibujan en transparencia (rayos X)
def x_amort():
    for sx in D['WX']:
        for sy in (1, -1):
            cyl('amort', (sx + 0.0, sy * (D['TRACK'] - 0.14), 0.90), 0.045, 0.66, XRAY, verts=20)
            box('amort', (sx, sy * (D['TRACK'] - 0.14), 1.25), (0.14, 0.1, 0.05), XRAY, 0.01)
            box('amort', (sx, sy * (D['TRACK'] - 0.14), 0.56), (0.12, 0.08, 0.05), XRAY, 0.01)


def x_resor():
    for sx in D['WX']:
        for sy in (1, -1):
            for k in range(7):
                torus('resor', (sx + 0.0, sy * (D['TRACK'] - 0.38), 0.6 + k * 0.085), 0.11, 0.017, XRAY)


def x_skid():
    x0, x1 = D['WX'][1], D['WX'][0]
    length = (x1 - x0) + 0.9
    box('skid', ((x0 + x1) / 2, 0, 0.40), (length, 2 * D['W'] - 0.40, 0.06), XRAY, 0.02)
    box('skid', ((x0 + x1) / 2, 0, 0.46), (length * 0.7, 0.3, 0.06), XRAY, 0.01)


def x_filtro():
    cyl('filtro', (D['FX'] - 0.8, -0.45, D['HOOD'] - 0.12), 0.13, 0.34, XRAY, rot=(0, math.pi / 2, 0), verts=32)
    cyl('filtro', (D['FX'] - 0.45, -0.45, D['HOOD'] - 0.12), 0.05, 0.4, XRAY, rot=(0, math.pi / 2, 0), verts=20)



# piezas anteriores (portaequipajes, snorkel, rock sliders, barra LED), por vehículo
def o_suv():
    for sy in (1, -1):
        box('rack', (-0.35, sy * 0.8, 2.12), (2.9, 0.05, 0.07), STEEL, 0.015)
        for x in (-1.45, 1.0):
            box('rack', (x, sy * 0.8, 2.04), (0.08, 0.08, 0.16), STEEL, 0.01)
    for x in (-1.6, -0.9, -0.2, 0.5, 1.0):
        box('rack', (x, 0, 2.13), (0.06, 1.65, 0.06), STEEL, 0.015)
    cyl('snork', (0.78, -0.93, 1.55), 0.07, 1.25, BLACK, verts=24)
    box('snork', (0.9, -0.93, 2.2), (0.32, 0.2, 0.24), BLACK, 0.06)
    box('snork', (0.98, -0.93, 2.2), (0.04, 0.17, 0.2), STEEL, 0.01)
    for sy in (1, -1):
        cyl('rock', (-0.1, sy * 1.0, 0.5), 0.075, 2.3, STEEL, rot=(0, math.pi / 2, 0), verts=24)
        for x in (-1.0, 0.0, 0.8):
            box('rock', (x, sy * 0.96, 0.6), (0.1, 0.1, 0.22), STEEL, 0.02)
    box('led', (0.95, 0, 2.26), (0.07, 1.2, 0.07), LED, 0.02)
    for sy in (1, -1):
        box('led', (0.95, sy * 0.4, 2.2), (0.05, 0.06, 0.1), STEEL, 0.01)


def o_pickup():
    for sy in (1, -1):
        box('rack', (0.3, sy * 0.74, 2.1), (2.1, 0.05, 0.07), STEEL, 0.015)
        for x in (-0.5, 1.1):
            box('rack', (x, sy * 0.74, 2.0), (0.08, 0.08, 0.16), STEEL, 0.01)
    for x in (-0.55, -0.05, 0.45, 0.95):
        box('rack', (x, 0, 2.11), (0.06, 1.6, 0.06), STEEL, 0.015)
    cyl('snork', (1.42, -0.98, 1.45), 0.07, 1.3, BLACK, verts=24)
    box('snork', (1.52, -0.98, 2.14), (0.32, 0.2, 0.24), BLACK, 0.06)
    box('snork', (1.6, -0.98, 2.14), (0.04, 0.17, 0.2), STEEL, 0.01)
    for sy in (1, -1):
        cyl('rock', (0.05, sy * 1.02, 0.5), 0.075, 2.6, STEEL, rot=(0, math.pi / 2, 0), verts=24)
        for x in (-0.9, 0.1, 1.0):
            box('rock', (x, sy * 0.98, 0.6), (0.1, 0.1, 0.22), STEEL, 0.02)
    box('led', (1.45, 0, 2.2), (0.07, 1.25, 0.07), LED, 0.02)
    for sy in (1, -1):
        box('led', (1.45, sy * 0.42, 2.14), (0.05, 0.06, 0.1), STEEL, 0.01)


def o_compact():
    for sy in (1, -1):
        box('rack', (-0.25, sy * 0.7, 2.06), (2.5, 0.05, 0.07), STEEL, 0.015)
        for x in (-1.3, 0.85):
            box('rack', (x, sy * 0.7, 1.96), (0.08, 0.08, 0.16), STEEL, 0.01)
    for x in (-1.1, -0.5, 0.1, 0.7):
        box('rack', (x, 0, 2.07), (0.06, 1.5, 0.06), STEEL, 0.015)
    cyl('snork', (0.98, -0.9, 1.45), 0.07, 1.25, BLACK, verts=24)
    box('snork', (1.08, -0.9, 2.1), (0.3, 0.2, 0.24), BLACK, 0.06)
    box('snork', (1.16, -0.9, 2.1), (0.04, 0.17, 0.2), STEEL, 0.01)
    for sy in (1, -1):
        cyl('rock', (0.0, sy * 0.92, 0.47), 0.07, 1.9, STEEL, rot=(0, math.pi / 2, 0), verts=24)
        for x in (-0.7, 0.0, 0.7):
            box('rock', (x, sy * 0.88, 0.57), (0.09, 0.09, 0.2), STEEL, 0.02)
    box('led', (0.85, 0, 2.17), (0.07, 1.05, 0.07), LED, 0.02)
    for sy in (1, -1):
        box('led', (0.85, sy * 0.36, 2.11), (0.05, 0.06, 0.1), STEEL, 0.01)


EXTERNAL = [('def-del', p_defdel), ('def-tra', p_deftra), ('remol', p_remol), ('recup', p_recup), ('barras', p_barras), ('soport', p_soport),
            ('repu', p_repu), ('faros', p_faros), ('trab', p_trab), ('rines', p_rines), ('winch', p_winch)]
GHOST = [('amort', x_amort), ('resor', x_resor), ('skid', x_skid), ('filtro', x_filtro)]

{'suv': base_suv, 'pickup': base_pickup, 'compact': base_compact}[KIND]()
if MODE == 'parts':
    for _, fn in EXTERNAL + GHOST:
        fn()
    {'suv': o_suv, 'pickup': o_pickup, 'compact': o_compact}[KIND]()

# ---------- escena (idéntica a la de los renders anteriores) ----------
bpy.ops.mesh.primitive_plane_add(size=40)
floor = bpy.context.object
floor.is_shadow_catcher = True
groups['floor'] = [floor]

world = bpy.data.worlds.new('estudio'); scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.9, 0.92, 0.95, 1); bg.inputs['Strength'].default_value = 0.55


def area(loc, energy, size):
    bpy.ops.object.light_add(type='AREA', location=loc)
    l = bpy.context.object
    l.data.energy = energy; l.data.size = size
    l.rotation_euler = (Vector((0, 0, 0.8)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


VIEWS = {'frente': ((8.4, -6.6, 2.1), (0.1, 0.0, 1.0), 46), 'lado': ((0.0, -12.5, 1.5), (0.0, 0.0, 1.0), 60), 'atras': ((-8.4, -6.6, 2.1), (-0.1, 0.0, 1.0), 46)}
CAM_LOC, CAM_TARGET, CAM_LENS = VIEWS[VIEW]
DELTA = math.atan2(CAM_LOC[1], CAM_LOC[0]) - math.atan2(-6.6, 8.4)


def rot(loc):
    c, s = math.cos(DELTA), math.sin(DELTA)
    return (loc[0] * c - loc[1] * s, loc[0] * s + loc[1] * c, loc[2])


area(rot((5, -6, 7)), 1800, 8)
area(rot((-6, 5, 4)), 700, 6)
area(rot((9, 4, 2.5)), 500, 4)
bpy.ops.object.camera_add(location=CAM_LOC)
cam = bpy.context.object
cam.data.lens = CAM_LENS
cam.rotation_euler = (Vector(CAM_TARGET) - cam.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam


def render(name, show, holdout=()):
    for g, objs in groups.items():
        for o in objs:
            if g == 'hidden':
                continue
            o.hide_render = g not in show
            o.is_holdout = g in holdout
    scene.render.filepath = os.path.join(OUT, f'{name}.png')
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'{KIND} {VIEW} {name}: {time.time() - t:.1f} s', flush=True)


def emission_mat(name, value):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (value, value, value, 1); em.inputs['Strength'].default_value = 1.0
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    return m


def render_base_and_mask(base_name, mask_name):
    render(base_name, {'body', 'wheels', 'floor'})
    white, black = emission_mat('mascara_blanca', 1.0), emission_mat('mascara_negra', 0.0)
    for g in ('body', 'wheels'):
        for o in groups[g]:
            was_paint = PAINT in list(o.data.materials)
            o.data.materials.clear()
            o.data.materials.append(white if was_paint else black)
    scene.view_settings.view_transform = 'Standard'
    scene.cycles.samples = 24
    scene.cycles.use_denoising = False
    render(mask_name, {'body', 'wheels'})


if MODE == 'parts':
    scene.cycles.samples = int(os.environ.get('PARTS_SAMPLES', SAMPLES))
    for pid in [x[0] for x in EXTERNAL] + ['rack', 'snork', 'rock', 'led']:
        render(pid, {'body', 'wheels', pid}, holdout={'body', 'wheels'})
    for pid, _ in GHOST:
        render(pid, {pid})
elif MODE == 'lift':
    bpy.context.view_layer.update()   # sin esto la cámara aún no tiene su matriz y la proyección sale mal
    cam_obj = scene.camera
    z0 = 1.0
    p0 = world_to_camera_view(scene, cam_obj, Vector((0, 0, z0)))
    p1 = world_to_camera_view(scene, cam_obj, Vector((0, 0, z0 + LIFT)))
    json.dump({'px': round((p1.y - p0.y) * H, 2), 'H': H, 'lift_m': LIFT}, open(os.path.join(OUT, 'lift.json'), 'w'))
    for g in ('body', 'hidden'):
        for o in groups[g]:
            o.location.z += LIFT
    render_base_and_mask('base_lift', 'mask_lift')
elif MODE == 'basefix':
    render_base_and_mask('base_neutral', 'mask')
print('LISTO', KIND, VIEW, MODE, flush=True)
