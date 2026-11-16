"""Builds logo layers (mark, leaves, lockups, partner logos) into public/media/logo.
Run from ghargrow-web:  python -I scripts/process-logos.py"""
import os, sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'media', 'logo')
MEDIA = r'C:\Users\Rayan\OneDrive\Desktop\Ghrghar Group\Media\GHRGHAR GROUP\Ghargrow Agro-Industries'
BR = os.path.join(MEDIA, 'Logo', 'logo', 'Branding', 'GHARGROW NEW LOGO')
os.makedirs(OUT, exist_ok=True)


def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bb)


def white(im):
    w = Image.new('RGBA', im.size, (255, 255, 255, 0))
    w.putalpha(im.getchannel('A'))
    return w


def save(im, name, maxw=None):
    if maxw and im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, name + '.png')
    im.save(p, optimize=True)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB')


# Mark: from stacked logo 3.png (mark + Arabic). Take the top cluster only.
src = Image.open(os.path.join(BR, '3.png')).convert('RGBA')
a = src.getchannel('A').point(lambda v: 255 if v > 8 else 0)
w, h = src.size
rows = [any(a.getpixel((x, y)) for x in range(0, w, 3)) for y in range(h)]
# first opaque run of rows = the mark
start = rows.index(True)
end = start
while end < h and any(rows[end:end + 25]):
    end += 1
mark = trim(src.crop((0, start, w, end)))
save(mark, 'mark', 600)
save(white(mark), 'mark-white', 600)

# Split leaves (top-left cluster above the G body) from the G body.
mw, mh = mark.size
ma = mark.getchannel('A').point(lambda v: 255 if v > 8 else 0)
# leaves live in the top ~32% and left ~45% of the mark
cut_y = None
for y in range(int(mh * 0.15), int(mh * 0.5)):
    # first row where the right half becomes opaque = top of the G body
    if any(ma.getpixel((x, y)) for x in range(int(mw * 0.5), mw, 2)):
        cut_y = y
        break
leaves_box = (0, 0, int(mw * 0.48), cut_y + 2)
leaves = Image.new('RGBA', mark.size, (0, 0, 0, 0))
leaves.paste(mark.crop(leaves_box), leaves_box[:2])
body = mark.copy()
clear = Image.new('RGBA', (leaves_box[2], leaves_box[3]), (0, 0, 0, 0))
# body = mark minus anything in the leaves box that is above the G's own top-left stroke
body.paste(clear, leaves_box[:2])
# restore G stroke pixels inside the box: G left stroke starts below cut_y within that region
save(leaves, 'mark-leaves', 600)
save(body, 'mark-body', 600)
save(white(leaves), 'mark-leaves-white', 600)
save(white(body), 'mark-body-white', 600)
print('leaf cut at', cut_y, 'of', mh)

# Horizontal lockups
for f, n in (('5.png', 'lockup'), ('6.png', 'lockup-light')):
    save(trim(Image.open(os.path.join(BR, f)).convert('RGBA')), n, 900)

# Partner logos
for f, n in (('Ghargrow Logos (12).png', 'western'), ('Ghargrow Logos (13).png', 'claas')):
    save(trim(Image.open(os.path.join(MEDIA, f)).convert('RGBA')), n, 600)
