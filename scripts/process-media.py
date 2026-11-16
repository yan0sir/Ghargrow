"""Builds web-ready media for the Ghargrow site from the brand media library.

Run from the ghargrow-web folder:  python -I scripts/process-media.py
Source library path is MEDIA below. Output goes to public/media/.
Requires: Pillow, and ffmpeg-static (npm devDependency).
"""
import os, sys, subprocess, shutil
from PIL import Image, ImageOps, ImageFilter, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'media')
FF = os.path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe')
MEDIA = r'C:\Users\Rayan\OneDrive\Desktop\Ghrghar Group\Media\GHRGHAR GROUP\Ghargrow Agro-Industries'

def P(*parts):
    return os.path.join(MEDIA, *parts)

CLAAS = P('CLAAS CONTENT', '2024-10-28_06-49-58')
WEST = P('الخريف', 'Western Marketing Material', 'Photos')
BALER = P('صور الكباسة بعد التعديل', 'غرغار 1')
DRONE = P('صور كباسة درون')
SEEDS = P('صور سماد و بذور-20250721T110743Z-1-001', 'صور سماد و بذور')
EXPO = P('مقاطع تصوير ارضي-20250526T062807Z-1-001', 'مقاطع تصوير ارضي')
PARTS = P('قطع الغيار مترجم', 'قطع الغيار مترجم', 'فرااااس')
PARTS2 = P('new Content', 'STRUCTURE, COMPONENTS & PARTS', 'Parts')
ICTRL = P('new Content', 'iControl New Panel')
MOVIES = P('CLAAS CONTENT', 'Claas', 'CLAAS Movies')


def listdir_imgs(d):
    ex = ('.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff')
    return [os.path.join(d, x) for x in sorted(os.listdir(d)) if x.lower().endswith(ex) and not x.startswith('._')]


def nth(d, i, extra=()):
    files = listdir_imgs(d)
    for e in extra:
        files += listdir_imgs(e)
    return files[i]


def load(src):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    return im


def save_webp(im, dst, width, q=78):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
    im.save(dst, 'WEBP', quality=q, method=5)
    print('  ', os.path.relpath(dst, OUT), im.size, os.path.getsize(dst) // 1024, 'KB')


def photo(src, name, width=1800, crop=None):
    dst = os.path.join(OUT, 'img', name + '.webp')
    if os.path.exists(dst):
        return
    im = load(src).convert('RGB')
    if crop:  # crop = (l,t,r,b) fractions
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    save_webp(im, dst, width)


def cutout(src, name, width=1600, thresh=232):
    """Remove a near-white studio background by flood-filling from the borders."""
    dst = os.path.join(OUT, 'cutout', name + '.webp')
    if os.path.exists(dst):
        return
    im = load(src).convert('RGBA')
    if im.width > width * 1.5:
        im = im.resize((int(width * 1.5), round(im.height * width * 1.5 / im.width)), Image.LANCZOS)
    rgb = im.convert('RGB')
    w, h = rgb.size
    # near-white -> 255, else 0
    white = rgb.point(lambda v: 255 if v >= thresh else 0).convert('L')
    r, g, b = rgb.split()
    wr = r.point(lambda v: 255 if v >= thresh else 0)
    wg = g.point(lambda v: 255 if v >= thresh else 0)
    wb = b.point(lambda v: 255 if v >= thresh else 0)
    from PIL import ImageChops
    white = ImageChops.multiply(ImageChops.multiply(wr, wg), wb)
    # flood from border pixels: mark background as 128
    mask = white.copy()
    seeds = [(x, 0) for x in range(0, w, 7)] + [(x, h - 1) for x in range(0, w, 7)] + \
            [(0, y) for y in range(0, h, 7)] + [(w - 1, y) for y in range(0, h, 7)]
    for s in seeds:
        if mask.getpixel(s) == 255:
            ImageDraw.floodfill(mask, s, 128)
    bg = mask.point(lambda v: 255 if v == 128 else 0)
    bg = bg.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    alpha = ImageOps.invert(bg)
    im.putalpha(ImageChops.multiply(im.getchannel('A'), alpha))
    bbox = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    save_webp(im, dst, width, q=82)


def ff(args):
    subprocess.run([FF, '-loglevel', 'error', '-y'] + args, check=True)


def sequence(src, name, start, dur, fps=30, crop_w=None):
    """Frame sequence for scroll scrubbing: desktop (1600w) + mobile (720w)."""
    for tag, w, q in (('d', 1440, 55), ('m', 720, 55)):
        d = os.path.join(OUT, 'seq', name, tag)
        if os.path.isdir(d) and os.listdir(d):
            continue
        os.makedirs(d, exist_ok=True)
        vf = f'fps={fps},scale={w}:-2'
        if tag == 'm' and crop_w:
            # portrait-ish crop for phones: keep centre
            vf = f'fps={fps},crop=ih*{crop_w}:ih,scale={w}:-2'
        ff(['-ss', str(start), '-t', str(dur), '-i', src, '-vf', vf,
            '-c:v', 'libwebp', '-quality', str(q), '-compression_level', '4', os.path.join(d, '%04d.webp')])
        n = len(os.listdir(d))
        size = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d)) // 1024
        print('  ', f'seq/{name}/{tag}', n, 'frames', size, 'KB')


def loop(src, name, start, dur, width=1280, crf=30, crop=None):
    dst = os.path.join(OUT, 'video', name + '.mp4')
    if os.path.exists(dst):
        return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    vf = f'scale={width}:-2'
    if crop:
        vf = crop + ',' + vf
    ff(['-ss', str(start), '-t', str(dur), '-i', src, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow',
        '-crf', str(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst])
    ff(['-ss', str(start + 0.2), '-i', src, '-frames:v', '1', '-vf', vf, '-c:v', 'libwebp', '-quality', '70',
        os.path.join(OUT, 'video', name + '.webp')])
    print('  ', 'video/' + name, os.path.getsize(dst) // 1024, 'KB')


def main():
    print('logos')
    ld = os.path.join(OUT, 'logo')
    os.makedirs(ld, exist_ok=True)
    print('photos')
    # Tractors & machinery (CLAAS official dealer imagery)
    photo(nth(CLAAS, 1), 'axion-road')
    photo(nth(CLAAS, 3), 'disco-field')
    photo(nth(CLAAS, 6), 'disco-front')
    photo(nth(CLAAS, 7), 'liner-detail')
    photo(nth(CLAAS, 10), 'liner-aerial')
    photo(nth(CLAAS, 11), 'dominator-wheat')
    photo(nth(CLAAS, 13), 'combine-dust')
    photo(nth(CLAAS, 15), 'combine-field')
    photo(nth(CLAAS, 17), 'field-aerial')
    photo(nth(CLAAS, 18), 'field-coast')
    photo(nth(CLAAS, 2), 'axion-cab')
    photo(nth(CLAAS, 9), 'disco-studio')
    photo(P('LEXION_8700_in_corn.jpg'), 'combine-corn')
    photo(P('111.jpg'), 'signing-1')
    photo(P('2.jpg'), 'signing-2')
    photo(P('3.jpg'), 'signing-3')
    # Western irrigation
    for i, n in ((0, 'pivot-sunrise'), (1, 'icontrol-field'), (3, 'pivot-pink'), (5, 'icontrol-sunset'),
                 (7, 'pivot-wheel'), (9, 'pivot-small'), (12, 'pivot-spray'), (16, 'pivot-spray-2'),
                 (21, 'linear-pivot'), (23, 'pivot-long'), (26, 'pivot-nozzles'), (8, 'icontrol-open')):
        photo(nth(WEST, i), n)
    # Ghargrow in Libya — balers, bales, team, aerials
    # Sheet indices below come from contact sheets that sampled N of M files: file = int(i * M / N)
    farm = listdir_imgs(BALER) + listdir_imgs(DRONE) + listdir_imgs(SEEDS)
    fr = len(farm) / 48
    for i, n in ((0, 'team-duo'), (2, 'baler-pivot'), (4, 'baler-pivot-2'), (7, 'baler-pivot-3'),
                 (12, 'markant-close'), (13, 'markant-side'), (15, 'bale-stack'), (16, 'bale-stack-2'),
                 (19, 'team-field'), (22, 'team-line'), (27, 'agronomist'), (33, 'pivot-circles'),
                 (35, 'aerial-baler'), (38, 'aerial-baler-2'), (37, 'aerial-field'), (42, 'seeds-alfalfa'),
                 (45, 'fertilizer'), (47, 'fertilizer-2')):
        photo(farm[int(i * fr)], n, 1200 if i >= 42 else 1800)
    # Expo & people
    expo = listdir_imgs(EXPO) + listdir_imgs(P('صور معرض'))
    er = len(expo) / 48
    for i, n in ((10, 'expo-booth'), (16, 'expo-booth-2'), (33, 'expo-film'), (44, 'expo-team'),
                 (46, 'expo-team-2'), (42, 'expo-pivot'), (1, 'expo-outdoor'), (15, 'expo-meeting')):
        photo(expo[int(i * er)], n, 1400)
    # Spare parts (indices into the full, unsampled list)
    parts = listdir_imgs(PARTS) + listdir_imgs(PARTS2)
    for i, n in ((0, 'nozzles'), (4, 'microswitch'), (73, 'contactor'), (8, 'coupler'), (10, 'tower-box'),
                 (15, 'bevel-gear'), (79, 'center-drive'), (20, 'tire'), (22, 'icontrol'), (23, 'icontrol-panel'),
                 (37, 'pickup-cylinder'), (40, 'pulley'), (41, 'worm-gear'), (26, 'sprocket'), (47, 'sprinkler'),
                 (49, 'grease'), (50, 'timer'), (54, 'fuel-filter'), (56, 'cabin-filter'),
                 (62, 'hydraulic-filter'), (64, 'main-filter'), (16, 'gearbox'), (69, 'rubber-coupling'),
                 (71, 'bearing'), (78, 'collector-ring'), (19, 'air-valve'), (92, 'pressure-regulator'),
                 (24, 'icontrol-open')):
        photo(parts[i], 'part-' + n, 900)

    print('cutouts')
    cutout(nth(CLAAS, 19), 'axion')           # studio AXION on white
    cutout(P('I-Wob-Up3-Type-Rotary-Sprinkler-for-Center-Pivot-Irrigation-System.webp'), 'iwob', 900)

    print('sequences')
    a900 = os.path.join(MOVIES, '_Master_AXION_900_Produkfilm_2017_EN.mp4')
    sequence(a900, 'axion', 117.5, 2.2, fps=30, crop_w=0.75)
    bg = os.path.join(OUT, 'img', 'hero-background.webp')
    if not os.path.exists(bg):
        save_webp(Image.open(os.path.join(OUT, 'img', 'Hero background.png')).convert('RGB'), bg, 2400, q=80)

    print('video loops')
    loop(P('new Content', 'Videos', 'Pivot - Ukraine 2019.mp4'), 'pivot-sunset', 76.2, 7.5)
    loop(P('new Content', 'Videos', 'Pivot - Ukraine 2019.mp4'), 'pivot-endgun', 88.2, 6)
    loop(P('CLAAS CONTENT', 'drone', 'drone', 'DJI_20241215112436_0022_D.MP4'), 'hq-drone', 2, 8, width=720)
    loop(os.path.join(MOVIES, '_Master_AXION_900_Produkfilm_2017_EN.mp4'), 'axion-field', 102.3, 4)
    loop(P('CLAAS CONTENT', '2024-10-28_06-49-58', '3.11 DOMINATOR Walkaround.mp4'), 'dominator', 16, 6)
    loop(P('CLAAS CONTENT', 'Claas', 'CLAAS Movies', 'QUADRANT 5300 Demotour Trailer (ID 348258)_23.mp4'), 'quadrant', 10, 6)
    loop(P('CLAAS CONTENT', 'Claas', 'CLAAS Movies', 'DISCO Move.mp4'), 'disco', 4, 6)
    print('done')


if __name__ == '__main__':
    main()
