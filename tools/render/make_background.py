"""Fondo de prueba para el configurador (pared oscura con manchas y suelo de concreto). Generado aquí: no es la foto de nadie.
Uso: python make_background.py <carpeta_salida>   ->   <carpeta_salida>/fondo.webp"""
import os, sys, random
from PIL import Image, ImageDraw, ImageFilter

dst = sys.argv[1]
os.makedirs(dst, exist_ok=True)
# fondo de prueba (generado aquí, no es la foto de nadie): pared oscura con manchas y suelo de concreto
BW, BH = 1920, 1080
random.seed(7)
bg = Image.new('RGB', (BW, BH)); px = ImageDraw.Draw(bg)
horizon = int(BH * 0.50)
for y in range(BH):
    if y < horizon:
        t = y / horizon; c = (int(40 + 30 * t), int(38 + 28 * t), int(40 + 26 * t))
    else:
        t = (y - horizon) / (BH - horizon); c = (int(62 + 40 * t), int(62 + 40 * t), int(64 + 38 * t))
    px.line([(0, y), (BW, y)], fill=c)
tex = Image.new('L', (BW, BH), 0); td = ImageDraw.Draw(tex)
for _ in range(220):
    x, y = random.randint(0, BW), random.randint(0, horizon)
    r = random.randint(50, 220); td.ellipse([x - r, y - r, x + r, y + r], fill=random.randint(6, 22))
bg = Image.composite(Image.new('RGB', (BW, BH), (150, 150, 150)), bg, tex.filter(ImageFilter.GaussianBlur(50)))
vig = Image.new('L', (BW, BH), 0); ImageDraw.Draw(vig).ellipse([-BW * 0.2, -BH * 0.25, BW * 1.2, BH * 1.3], fill=255)
bg = Image.composite(bg, Image.new('RGB', (BW, BH), (6, 6, 7)), vig.filter(ImageFilter.GaussianBlur(160)))
bg.save(dst + '/fondo.webp', 'WEBP', quality=82, method=6)
print('fondo', os.path.getsize(dst + '/fondo.webp') // 1024, 'KB')
