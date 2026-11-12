"""Procesa las vistas con las 19 capas de piezas, la versión elevada y las máscaras de pintura.
Cada vista tiene su propio recorte común. Una pieza cuenta como visible en una vista si tiene ≥ 30 % del área que tiene donde más se ve
(o ≥ 4000 px), y al menos 60 px.
Uso: python process_views.py <carpeta_img> vista:vehiculo=carpeta [...]
Cada carpeta tiene: base_neutral.png, mask.png, base_lift.png, mask_lift.png, lift.json y las 19 capas .png"""
import sys, os, json
from PIL import Image, ImageChops

dst = sys.argv[1]
jobs = {}
for a in sys.argv[2:]:
    left, d = a.split('=', 1)
    view, veh = left.split(':')
    jobs.setdefault(view, {})[veh] = d

LAYERS = ['def-del', 'def-tra', 'remol', 'recup', 'barras', 'soport', 'repu', 'faros', 'trab', 'rines', 'winch', 'rack', 'snork', 'rock', 'led', 'amort', 'resor', 'skid', 'filtro']
PAD, FEATHER, MIN_SHARE, MIN_ABS, MIN_FLOOR = 130, 140, 0.30, 2800, 60


def rgba(path):
    return Image.open(path).convert('RGBA')


def mask_of(path):
    r, g, b, a = rgba(path).split()
    m = ImageChops.multiply(r, a)
    return Image.merge('RGBA', (Image.new('L', m.size, 255),) * 3 + (m,))


def ramp(length):
    row = Image.new('L', (length, 1))
    row.putdata([round(255 * min(1, i / FEATHER, (length - 1 - i) / FEATHER)) for i in range(length)])
    return row


def bbox(im, thr):
    return im.getchannel('A').point(lambda a: 255 if a > thr else 0).getbbox()


meta = {'views': {}}
areas = {}
anchors_all = {}
for view, vehs in jobs.items():
    data = {}
    boxes = []
    for v, d in vehs.items():
        data[v] = {'base': rgba(f'{d}/base_neutral.png'), 'lift': rgba(f'{d}/base_lift.png'), **{n: rgba(f'{d}/{n}.png') for n in LAYERS}}
        boxes += [bbox(im, 90) for im in data[v].values()]
    boxes = [b for b in boxes if b]
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes); x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    W, H = next(iter(data.values()))['base'].size
    crop = (max(0, x0 - PAD), max(0, y0 - PAD), min(W, x1 + PAD), min(H, y1 + PAD))
    cw, ch = crop[2] - crop[0], crop[3] - crop[1]
    feather = ImageChops.multiply(ramp(cw).resize((cw, ch)), ramp(ch).resize((ch, 1)).rotate(90, expand=True).resize((cw, ch)))
    print(f'vista {view}: recorte {crop} -> {cw}x{ch}')
    meta['views'][view] = {'aspect': round(cw / ch, 4), 'vehicles': {}}
    for v, layers in data.items():
        d = vehs[v]
        os.makedirs(f'{dst}/{view}/{v}', exist_ok=True)
        lift_px = json.load(open(f'{d}/lift.json'))['px']
        meta['views'][view]['vehicles'][v] = {'anchors': {}, 'lift': round(100 * lift_px / ch, 3)}
        for n, im in layers.items():
            c = im.crop(crop)
            if n in ('base', 'lift'):
                r, g, b, a = c.split(); c = Image.merge('RGBA', (r, g, b, ImageChops.multiply(a, feather)))
                name = 'base' if n == 'base' else 'base-lift'
                mk = mask_of(f'{d}/mask.png' if n == 'base' else f'{d}/mask_lift.png').crop(crop)
                mk.save(f'{dst}/{view}/{v}/{"mask" if n == "base" else "mask-lift"}.webp', 'WEBP', lossless=True, method=6, exact=True)
                if n == 'base' and view == 'frente':
                    bb = bbox(c, 90); p = 14
                    tbox = (max(0, bb[0] - p), max(0, bb[1] - p), min(cw, bb[2] + p), min(ch, bb[3] + p))
                    t = c.crop(tbox); t.thumbnail((360, 160)); t.save(f'{dst}/{view}/{v}/thumb.webp', 'WEBP', quality=84, method=6, exact=True)
                    mt = mk.crop(tbox); mt.thumbnail((360, 160)); assert mt.size == t.size
                    mt.save(f'{dst}/{view}/{v}/thumb-mask.webp', 'WEBP', lossless=True, method=6, exact=True)
                c.save(f'{dst}/{view}/{v}/{name}.webp', 'WEBP', quality=86, method=6, exact=True)
            else:
                alpha = c.getchannel('A').point(lambda a: 255 if a > 24 else 0)
                bb = alpha.getbbox()
                areas.setdefault((v, n), {})[view] = alpha.histogram()[255] if bb else 0
                if bb:
                    anchors_all[(view, v, n)] = [round(100 * bb[0] / cw, 2), round(100 * bb[1] / ch, 2), round(100 * bb[2] / cw, 2), round(100 * bb[3] / ch, 2)]
                    c.save(f'{dst}/{view}/{v}/{n}.webp', 'WEBP', quality=86, method=6, exact=True)

print('\nvisibilidad por pieza (área en px y % del máximo entre vistas):')
hidden = 0
for (v, n), per in sorted(areas.items(), key=lambda kv: (kv[0][1], kv[0][0])):
    mx = max(per.values()) or 1
    row = []
    for view, cnt in per.items():
        vis = cnt >= MIN_FLOOR and (cnt >= MIN_SHARE * mx or cnt >= MIN_ABS) and (view, v, n) in anchors_all
        row.append(f'{view}:{cnt}({round(100 * cnt / mx)}%){"" if vis else " OCULTA"}')
        if vis:
            meta['views'][view]['vehicles'][v]['anchors'][n] = anchors_all[(view, v, n)]
        else:
            hidden += 1
            f = f'{dst}/{view}/{v}/{n}.webp'
            if os.path.exists(f):
                os.remove(f)
    print(f'  {n:8s} {v:8s} ' + '  '.join(row))

json.dump(meta, open(f'{dst}/meta.json', 'w'))
HEADER = ('/* Datos del configurador (generado por tools/render/process_views.py; no editar a mano).\n'
          '   Por vista: proporción de la imagen y, por vehículo, el desplazamiento del kit de elevación (en % del alto) y la caja (en %) de cada pieza visible. */\n')
open(f'{dst}/configurador-data.js', 'w', encoding='utf-8').write(HEADER + 'window.TF_CFG = ' + json.dumps(meta, separators=(',', ':')) + ';\n')
tot = sum(os.path.getsize(os.path.join(a, f)) for a, _, fs in os.walk(dst) for f in fs) // 1024
print(f'\ncapas ocultas por vista: {hidden}; total en disco: {tot} KB')
for view in meta['views']:
    print(view, {v: d['lift'] for v, d in meta['views'][view]['vehicles'].items()})
