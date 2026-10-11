"""Cuts the photoreal Cycles stills into a walkthrough video.

Each room shot gets a slow camera move (push-in or pan), a caption and a
crossfade into the next; title and end cards bookend the tour.

    python3 video/make_video.py --stills output/photoreal --out output/virtual-tour-photoreal.mp4
"""
import argparse
import os
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
HERE = os.path.dirname(os.path.abspath(__file__))
SERIF = os.path.join(HERE, 'fonts', 'CormorantGaramond-SemiBold.ttf')
SANS = os.path.join(HERE, 'fonts', 'Manrope-Medium.ttf')
CREAM, MUTED, BRASS, INK = (247, 240, 230), (222, 210, 192), (201, 164, 106), (22, 19, 16)

# (still, title, subtitle, seconds, motion)
SHOTS = [
    ('overview', '3 BHK Residence', 'BUA 1890 sft  ·  Carpet 1455 sft  ·  West-facing entrance', 6.0, 'orbit'),
    ('foyer', 'Drawing Room', "14'7½\" x 10'10½\"  ·  beige lounge seating, rust & mustard accents", 5.5, 'pan_r'),
    ('drawing', 'Drawing Room', 'Oak fluted feature wall, walnut credenza, mirrored shoe cabinet at the entry', 5.0, 'push'),
    ('hall', 'Drawing · Dining · Living', 'One open hall under cove-lit false ceilings', 5.5, 'push'),
    ('dining', 'Dining', "10'4½\" x 14'9\"  ·  6-seater marble table, brass pendants, wash counter", 5.5, 'pan_l'),
    ('living', 'Living Room', "10'9\" x 10'10½\"  ·  fluted TV wall, sage L-sofa, sliding door to sit-out", 5.5, 'push'),
    ('sitout', 'Sit Out', "6'1½\" x 10'10½\"  ·  herringbone deck, swing chair, vertical garden", 5.0, 'pan_r'),
    ('kitchen', 'Modular Kitchen', "12'1½\" x 10'10½\"  ·  L-shaped, handle-less, quartz top, subway backsplash", 6.0, 'push'),
    ('kitchen2', 'Modular Kitchen', 'Tall unit with built-in oven & microwave, French-door fridge, pantry', 5.5, 'pan_l'),
    ('master', 'Master Bedroom', "14'3\" x 10'10½\"  ·  walnut fluted headboard wall, terracotta accents", 5.5, 'push'),
    ('master2', 'Master Bedroom', '4-door wardrobe, walnut dresser with brass mirror, attached toilet', 5.0, 'pan_r'),
    ('pooja', 'Pooja Room', "4'1½\" x 6'1½\"  ·  walnut mandir with backlit jali, carved jali doors", 5.0, 'push'),
    ('bed3', 'Bed Room 3', "13'1½\" x 10'4½\"  ·  oak panelled headboard wall, sage linens", 5.0, 'pan_l'),
    ('bed2', 'Bed Room 2', "14'0\" x 10'4½\"  ·  blue-grey & oak, study desk, full-height wardrobe", 5.5, 'push'),
]
# Captions for the Luxury beige & wood scheme (same shots, different design notes).
LUXE = {
    'foyer': "14'7½\" x 10'10½\"  ·  beige bouclé sofa and lounge chairs, brass floor lamp",
    'drawing': 'Cream wall panelling with mouldings, walnut credenza, botanical art',
    'hall': 'Cream, walnut and marble under cove-lit false ceilings',
    'dining': "10'4½\" x 14'9\"  ·  walnut table, upholstered chairs, gold ring chandelier",
    'living': "10'9\" x 10'10½\"  ·  marble TV wall with walnut fins, beige L-sofa, ceiling fan",
    'sitout': "6'1½\" x 10'10½\"  ·  herringbone deck, swing chair, planters",
    'kitchen': "12'1½\" x 10'10½\"  ·  cream lacquer L-kitchen, marble backsplash, quartz top",
    'kitchen2': 'Cream tall unit with built-in oven & microwave, French-door fridge, pantry',
    'master': "14'3\" x 10'10½\"  ·  walnut veneer wall with LED reveal, wingback headboard",
    'master2': 'Walnut wardrobe & dresser, brass mirror, ceiling fan',
    'bed3': "13'1½\" x 10'4½\"  ·  oak panelled wall, sand & olive linens",
    'bed2': "14'0\" x 10'4½\"  ·  greige & oak, study desk, full-height wardrobe",
}
PASTEL = {
    'foyer': "14'7½\" x 10'10½\"  ·  blush sofa, butter & mint lounge chairs",
    'drawing': 'Blush moulded wall panelling, white-oak credenza, pastel art',
    'hall': 'Blush, mint and powder blue under cove-lit ceilings',
    'dining': "10'4½\" x 14'9\"  ·  white-oak table, mint & blush chairs, brass pendants",
    'living': "10'9\" x 10'10½\"  ·  powder-blue fluted TV wall, powder-blue L-sofa",
    'sitout': "6'1½\" x 10'10½\"  ·  herringbone deck, swing chair, planters",
    'kitchen': "12'1½\" x 10'10½\"  ·  powder-blue L-kitchen, white uppers, subway tiles",
    'kitchen2': 'Powder-blue tall unit with oven & microwave, French-door fridge',
    'master': "14'3\" x 10'10½\"  ·  blush walls, white-oak fluted panel, lavender headboard",
    'master2': 'White-oak wardrobe & dresser, brass mirror',
    'bed3': "13'1½\" x 10'4½\"  ·  lavender walls, oak panelling, peach linens",
    'bed2': "14'0\" x 10'4½\"  ·  mint walls, oak wardrobe, study desk",
}
XFADE = 1.0
TITLE_SECS, END_SECS = 3.5, 4.0


def ease(u):
    return u * u * (3 - 2 * u)


def font(path, size):
    return ImageFont.truetype(path, size)


def spaced(draw, xy, text, fnt, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking


def caption_layer(title, sub):
    """RGBA overlay: soft lower-left shade, title, brass rule, subtitle, corner mark."""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shade = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shade).rectangle((0, H - 330, W, H), fill=150)
    shade = shade.filter(ImageFilter.GaussianBlur(120))
    lay.paste((12, 9, 6, 255), (0, 0), shade)
    d = ImageDraw.Draw(lay)
    d.text((96, H - 228), title, font=font(SERIF, 84), fill=CREAM + (255,))
    d.rectangle((100, H - 118, 104, H - 82), fill=BRASS + (255,))
    d.text((122, H - 118), sub, font=font(SANS, 28), fill=MUTED + (255,))
    spaced(d, (W - 330, 58), 'VIRTUAL TOUR', font(SERIF, 26), CREAM + (215,), 7)
    return lay


def card(lines):
    img = Image.new('RGB', (W, H), INK)
    d = ImageDraw.Draw(img)
    y = H // 2 - sum(s for _, s, _ in lines) // 2 - 40
    for text, size, kind in lines:
        if kind == 'rule':
            d.rectangle((W // 2 - 40, y + 10, W // 2 + 40, y + 12), fill=BRASS)
            y += 40
            continue
        f = font(SERIF if kind == 'serif' else SANS, size)
        tw = d.textlength(text, font=f)
        d.text(((W - tw) / 2, y), text, font=f, fill=CREAM if kind == 'serif' else MUTED)
        y += int(size * 1.35)
    return img


def moved(img, motion, u):
    """Return the frame for progress u (0..1) of a camera move over a still."""
    u = ease(u)
    if motion == 'push':
        z = 1.0 + 0.085 * u
        cx, cy = img.width / 2, img.height / 2
    elif motion == 'orbit':
        z = 1.12 - 0.1 * u
        cx, cy = img.width * (0.47 + 0.06 * u), img.height / 2
    else:
        z = 1.1
        span = img.width * (1 - 1 / z) / 2
        cx = img.width / 2 + (span * (2 * u - 1)) * (1 if motion == 'pan_r' else -1)
        cy = img.height / 2
    cw, ch = img.width / z, img.height / z
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return img.transform((W, H), Image.Transform.EXTENT, box, Image.Resampling.BICUBIC)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stills', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--theme', default='warm')
    a = ap.parse_args()

    shots = [s for s in SHOTS if os.path.exists(os.path.join(a.stills, s[0] + '.jpg'))]
    notes = {'luxe': LUXE, 'pastel': PASTEL}.get(a.theme, {})
    shots = [(n, t, notes.get(n, sub), secs, mo) for n, t, sub, secs, mo in shots]
    design = {'luxe': 'Luxury Beige & Wood', 'pastel': 'Pastel'}.get(a.theme, 'Warm Modern')
    title = card([('3 BHK Residence', 120, 'serif'), ('', 0, 'rule'), (f'{design} Interior Design  ·  Virtual Tour', 40, 'sans'),
                  ('BUA 1890 sft   ·   Carpet Area 1455 sft', 32, 'sans')])
    finishes = {'luxe': 'Cream panelling  ·  walnut veneer  ·  beige marble  ·  gold accents  ·  cream modular kitchen',
                'pastel': 'Blush  ·  mint  ·  powder blue  ·  lavender  ·  white oak & brass  ·  powder-blue modular kitchen'}.get(
        a.theme, 'Marble-look floors  ·  oak & walnut  ·  cove lighting  ·  L-shaped modular kitchen')
    end = card([(f'{design} Interiors', 96, 'serif'), ('', 0, 'rule'),
                (finishes, 32, 'sans'),
                ('Drawing · Dining · Living · Kitchen · 3 Bedrooms · Pooja · Sit Out', 32, 'sans')])
    # timeline: segments overlap by XFADE seconds
    segs = [('card', title, TITLE_SECS, None)]
    for name, t, sub, secs, motion in shots:
        img = Image.open(os.path.join(a.stills, name + '.jpg')).convert('RGB')
        segs.append(('shot', (img, caption_layer(t, sub)), secs, motion))
    segs.append(('card', end, END_SECS, None))
    starts, t = [], 0.0
    for s in segs:
        starts.append(t)
        t += s[2] - XFADE
    total = t + XFADE

    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
                           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a.out], stdin=subprocess.PIPE)

    def render_seg(i, tt):
        kind, data, secs, motion = segs[i]
        u = min(1.0, max(0.0, (tt - starts[i]) / secs))
        if kind == 'card':
            return data
        img, cap = data
        frame = moved(img, motion, u).convert('RGBA')
        # caption fades in after the crossfade and out before the next one
        alpha = min(1.0, max(0.0, (tt - starts[i] - 0.6) / 0.6), max(0.0, (starts[i] + secs - 0.5 - tt) / 0.6))
        if alpha > 0:
            c = cap.copy()
            c.putalpha(c.getchannel('A').point(lambda v: int(v * alpha)))
            frame = Image.alpha_composite(frame, c)
        return frame.convert('RGB')

    n = int(total * FPS)
    for f in range(n):
        tt = f / FPS
        active = [i for i in range(len(segs)) if starts[i] <= tt < starts[i] + segs[i][2]]
        frame = render_seg(active[0], tt)
        if len(active) > 1:
            b = render_seg(active[1], tt)
            frame = Image.blend(frame, b, ease((tt - starts[active[1]]) / XFADE))
        # fade from / to black at the very start and end
        k = min(1.0, tt / 0.8, (total - tt) / 1.0)
        if k < 1:
            frame = Image.blend(Image.new('RGB', (W, H), INK), frame, max(0.0, k))
        ff.stdin.write(frame.tobytes())
        if f % 150 == 0:
            print(f'frame {f}/{n}', flush=True)
    ff.stdin.close()
    ff.wait()
    print('wrote', a.out, f'{total:.1f}s')


if __name__ == '__main__':
    main()
