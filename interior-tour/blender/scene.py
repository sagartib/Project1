"""Photoreal Cycles renders of the apartment model exported by export-glb.mjs.

Usage (with the `bpy` module installed, or inside Blender):
    python blender/scene.py --glb build/apartment.glb --out output/photoreal \
        [--shots drawing,living] [--w 1920 --h 1080] [--samples 256] [--margin 1.12]

Coordinates in SHOTS are the same feet-based plan coordinates used by the
three.js model (x west->east, z north->south, y up).
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Vector

FT = 0.3048
H = 10.0  # ceiling height (ft)


def plan(x, y, z):
    """Plan coordinates (ft, Y-up) -> Blender world (m, Z-up)."""
    return Vector((x * FT, -z * FT, y * FT))


# name: (camera pos, look-at, focal length mm). Cameras are kept level
# (verticals stay vertical, like architectural photography); the look-at
# height is reproduced with lens shift instead of tilt.
SHOTS = {
    'overview': ((-14, 44, 52), (20.6, 0, 16.3), 30, 'Overview'),
    'foyer': ((13.0, 4.6, 11.9), (2.5, 4.4, 19.5), 16, 'Drawing Room'),
    'drawing': ((11.8, 4.6, 18.2), (3.5, 4.4, 11.0), 16, 'Drawing Room'),
    'hall': ((1.6, 4.8, 16.2), (30, 4.6, 15.6), 18, 'Drawing · Dining · Living'),
    'dining': ((23.4, 4.6, 24.6), (17.0, 4.0, 13.0), 16, 'Dining'),
    'living': ((34.9, 4.6, 15.6), (26.0, 4.4, 12.6), 16, 'Living Room'),
    'sitout': ((37.0, 4.4, 20.7), (39.8, 4.2, 11.0), 16, 'Sit Out'),
    'kitchen': ((27.8, 4.7, 24.4), (35.0, 4.0, 30.5), 16, 'Modular Kitchen'),
    'kitchen2': ((34.6, 4.7, 24.1), (26.5, 4.0, 29.5), 16, 'Modular Kitchen'),
    'master': ((11.0, 4.6, 32.0), (5.0, 4.2, 22.5), 16, 'Master Bedroom'),
    'master2': ((2.9, 4.6, 29.6), (12.0, 4.2, 23.6), 16, 'Master Bedroom'),
    'pooja': ((22.25, 4.4, 12.6), (22.25, 4.2, 0.0), 30, 'Pooja Room'),
    'bed3': ((27.6, 4.6, 1.2), (33.0, 4.0, 9.5), 16, 'Bed Room 3'),
    'bed2': ((3.0, 4.6, 9.9), (12.5, 4.0, 3.5), 16, 'Bed Room 2'),
}

# Room light boxes (ft): x0, x1, z0, z1, watts. Soft ceiling area lights that
# stand in for the cove/downlight bounce of a finished interior.
ROOM_LIGHTS = [
    (0.0, 14.3, 10.6, 21.6, 220),   # drawing
    (14.3, 24.6, 10.6, 25.4, 240),  # dining + passage
    (24.6, 35.3, 10.6, 21.6, 220),  # living
    (35.3, 41.3, 10.6, 21.6, 90),   # sit-out
    (37.0, 41.3, 0.0, 10.6, 60),    # balcony
    (24.6, 37.0, 21.6, 32.6, 260),  # kitchen
    (37.0, 41.3, 21.6, 32.6, 60),   # utility
    (0.0, 14.3, 21.6, 32.6, 200),   # master
    (0.0, 14.3, 0.0, 10.6, 180),    # bed 2
    (24.6, 37.0, 0.0, 10.6, 180),   # bed 3
    (19.9, 24.6, 0.0, 6.1, 50),     # pooja
    (14.3, 24.6, 6.1, 10.6, 60),    # wash area
    (14.3, 19.9, 0.0, 8.5, 60),     # toilet
    (14.3, 20.3, 25.4, 32.6, 60),   # master toilet
    (20.3, 24.6, 25.4, 32.6, 50),   # toilet 2
]


# ----------------------------------------------------------------- materials
def principled(mat):
    for n in mat.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            return n
    return None


def set_inputs(bsdf, **kw):
    names = {
        'roughness': 'Roughness', 'metallic': 'Metallic', 'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness',
        'sheen': 'Sheen Weight', 'sheen_rough': 'Sheen Roughness', 'spec': 'Specular IOR Level',
    }
    for k, v in kw.items():
        bsdf.inputs[names[k]].default_value = v


def base_color_socket(bsdf):
    s = bsdf.inputs['Base Color']
    return s.links[0].from_socket if s.is_linked else None


def add_bump(mat, bsdf, strength=0.08, distance=0.002, bevel=0.0):
    nt = mat.node_tree
    normal_in = None
    col = base_color_socket(bsdf)
    if bevel:
        bv = nt.nodes.new('ShaderNodeBevel')
        bv.inputs['Radius'].default_value = bevel
        bv.samples = 6
        normal_in = bv.outputs['Normal']
    if col is not None and strength:
        bump = nt.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = strength
        bump.inputs['Distance'].default_value = distance
        nt.links.new(col, bump.inputs['Height'])
        if normal_in is not None:
            nt.links.new(normal_in, bump.inputs['Normal'])
        normal_in = bump.outputs['Normal']
    if normal_in is not None:
        nt.links.new(normal_in, bsdf.inputs['Normal'])


def tint_texture(mat, bsdf, rgb):
    col = base_color_socket(bsdf)
    if col is None:
        return
    nt = mat.node_tree
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 1.0
    nt.links.new(col, mix.inputs['A'])
    mix.inputs['B'].default_value = (*rgb, 1)
    nt.links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])


def rebuild(mat, build):
    nt = mat.node_tree
    tex = None
    for n in nt.nodes:
        if n.type == 'TEX_IMAGE':
            tex = n.image
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    shader = build(nt, tex)
    nt.links.new(shader, out.inputs['Surface'])


def emission(color, strength, tex_image=None):
    def build(nt, tex):
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs['Color'].default_value = (*color, 1)
        em.inputs['Strength'].default_value = strength
        img = tex_image or tex
        if img is not None:
            t = nt.nodes.new('ShaderNodeTexImage')
            t.image = img
            nt.links.new(t.outputs['Color'], em.inputs['Color'])
        return em.outputs['Emission']
    return build


def _glossy_black(nt):
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0.005, 0.005, 0.006, 1)
    b.inputs['Roughness'].default_value = 0.04
    return b.outputs['BSDF']


def clear_glass(nt, tex):
    # Thin architectural glass: a faint reflection over full transparency, so
    # sunlight and views pass through without refraction noise.
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    gl = nt.nodes.new('ShaderNodeBsdfGlossy')
    gl.inputs['Roughness'].default_value = 0.0
    fr = nt.nodes.new('ShaderNodeFresnel')
    fr.inputs['IOR'].default_value = 1.5
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(fr.outputs['Fac'], mix.inputs['Fac'])
    nt.links.new(tr.outputs['BSDF'], mix.inputs[1])
    nt.links.new(gl.outputs['BSDF'], mix.inputs[2])
    return mix.outputs['Shader']


def sheer(nt, tex):
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    tl = nt.nodes.new('ShaderNodeBsdfTranslucent')
    tl.inputs['Color'].default_value = (0.95, 0.92, 0.86, 1)
    mix = nt.nodes.new('ShaderNodeMixShader')
    mix.inputs['Fac'].default_value = 0.55
    nt.links.new(tr.outputs['BSDF'], mix.inputs[1])
    nt.links.new(tl.outputs['BSDF'], mix.inputs[2])
    return mix.outputs['Shader']


def jali_panel(nt, tex):
    # warm backlit jali: emission through the pattern over dark walnut
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = tex
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (1.0, 0.72, 0.38, 1)
    em.inputs['Strength'].default_value = 6.0
    bs = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bs.inputs['Base Color'].default_value = (0.08, 0.04, 0.02, 1)
    bs.inputs['Roughness'].default_value = 0.5
    mix = nt.nodes.new('ShaderNodeMixShader')
    sep = nt.nodes.new('ShaderNodeRGBToBW')
    nt.links.new(t.outputs['Color'], sep.inputs['Color'])
    nt.links.new(sep.outputs['Val'], mix.inputs['Fac'])
    nt.links.new(bs.outputs['BSDF'], mix.inputs[1])
    nt.links.new(em.outputs['Emission'], mix.inputs[2])
    return mix.outputs['Shader']


WOOD = {'oak', 'walnut', 'woodFloor', 'deck', 'herring', 'jaliDoor'}
FABRIC = {'sofaFabric', 'sofaGreen', 'velvetRust', 'velvetMustard', 'linen', 'linenGrey', 'linenBlue', 'linenSage',
          'cushionA', 'cushionB', 'cushionC', 'curtainDark'}
STONE = {'quartz', 'calacatta', 'darkStone'}
CABINET = {'lacquerWhite', 'kitchenGreen', 'kitchenUpper', 'matteGrey'}


def fix_materials():
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        name = mat.name.split('.')[0]
        bsdf = principled(mat)
        if name in ('led', 'ledCool'):
            rebuild(mat, emission((1.0, 0.75, 0.45) if name == 'led' else (1.0, 0.88, 0.7), 6.0 if name == 'led' else 12.0))
        elif name == 'lampShade':
            rebuild(mat, emission((1.0, 0.8, 0.55), 3.0))
        elif name == 'screen':
            # TV switched off: glossy black panel
            rebuild(mat, lambda nt, tex: _glossy_black(nt))
        elif name == 'jali':
            rebuild(mat, jali_panel)
        elif name == 'glass':
            rebuild(mat, clear_glass)
        elif name == 'curtain':
            rebuild(mat, sheer)
        elif bsdf is None:
            continue
        elif name == 'floor':
            set_inputs(bsdf, roughness=0.05, spec=0.6)
            tint_texture(mat, bsdf, (0.93, 0.86, 0.76))  # warm beige marble
        elif name in ('bathFloor', 'bathWall', 'subway'):
            set_inputs(bsdf, roughness=0.12)
        elif name in STONE:
            set_inputs(bsdf, roughness=0.08)
            add_bump(mat, bsdf, strength=0, bevel=0.006)
        elif name in WOOD:
            set_inputs(bsdf, roughness=0.38 if name == 'woodFloor' else 0.45)
            add_bump(mat, bsdf, strength=0.06, bevel=0.004 if name in ('oak', 'walnut') else 0)
        elif name in FABRIC:
            set_inputs(bsdf, roughness=0.9, sheen=0.6, sheen_rough=0.4, spec=0.2)
            add_bump(mat, bsdf, strength=0.25, distance=0.003)
        elif name in CABINET:
            set_inputs(bsdf, roughness=0.18 if name != 'kitchenGreen' else 0.4, coat=0.3 if name != 'kitchenGreen' else 0.0)
            add_bump(mat, bsdf, strength=0, bevel=0.004)
        elif name.startswith('wall') or name in ('ceiling', 'skirting'):
            set_inputs(bsdf, roughness=0.85, spec=0.3)
            if name == 'wall':
                bsdf.inputs['Base Color'].default_value = (0.72, 0.62, 0.50, 1)  # warm beige paint
            elif name == 'ceiling':
                bsdf.inputs['Base Color'].default_value = (0.85, 0.82, 0.77, 1)
        elif name in ('ceramic',):
            set_inputs(bsdf, roughness=0.1, coat=0.6)
        elif name in ('fridge', 'steel'):
            set_inputs(bsdf, roughness=0.22, metallic=1.0)
        elif name in ('leaf', 'leafLight'):
            set_inputs(bsdf, roughness=0.45, sheen=0.2)
            bsdf.inputs['Subsurface Weight'].default_value = 0.15  # light glowing through leaves
            bsdf.inputs['Base Color'].default_value = (0.05, 0.12, 0.03, 1) if name == 'leaf' else (0.12, 0.2, 0.05, 1)


# ----------------------------------------------------------------- lighting
def setup_world(sun_elev=32, sun_rot=215, strength=0.9):
    world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    sky = nt.nodes.new('ShaderNodeTexSky')
    for t in ('MULTIPLE_SCATTERING', 'NISHITA', 'HOSEK_WILKIE'):
        try:
            sky.sky_type = t
            break
        except TypeError:
            continue
    if hasattr(sky, 'sun_elevation'):
        sky.sun_elevation = math.radians(sun_elev)
        sky.sun_rotation = math.radians(sun_rot)
    if hasattr(sky, 'sun_disc'):
        sky.sun_disc = False
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.inputs['Strength'].default_value = strength
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(sky.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])

    sun = bpy.data.lights.new('Sun', 'SUN')
    sun.energy = 4.0
    sun.angle = math.radians(1.5)
    sun.color = (1.0, 0.9, 0.78)
    ob = bpy.data.objects.new('Sun', sun)
    ob.rotation_euler = (math.radians(90 - sun_elev), 0, math.radians(sun_rot - 180))
    bpy.context.collection.objects.link(ob)


def kelvin(k):
    # approximate blackbody -> linear RGB for warm white lamps
    return {2700: (1.0, 0.66, 0.38), 3000: (1.0, 0.72, 0.46), 3500: (1.0, 0.8, 0.6), 4000: (1.0, 0.86, 0.72)}[k]


def add_light(name, kind, loc, energy, color, radius=0.05, size=None, rot=None, spot=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    if kind in ('POINT', 'SPOT'):
        ld.shadow_soft_size = radius
    if kind == 'SPOT':
        ld.spot_size = math.radians(spot or 75)
        ld.spot_blend = 0.65
    if kind == 'AREA':
        ld.shape = 'RECTANGLE'
        ld.size, ld.size_y = size
    ob = bpy.data.objects.new(name, ld)
    ob.location = loc
    if rot:
        ob.rotation_euler = rot
    bpy.context.collection.objects.link(ob)
    ob.visible_camera = False
    return ob


# False-ceiling coves in the hall and master bedroom (ft): x0, z0, x1, z1, border, drop.
COVES = [(0.2, 10.8, 14.1, 21.4, 1.6, 0.9), (14.5, 11.0, 24.4, 21.4, 1.4, 0.9),
         (24.8, 10.8, 35.1, 21.4, 1.6, 0.9), (0.2, 21.8, 14.1, 32.4, 1.4, 0.75)]
DOWNLIGHTS = [(4, 4), (10, 4), (28, 3), (33, 3), (27.5, 26), (31, 26), (34, 29), (30.5, 30.5), (17, 4), (22.3, 3),
              (17.2, 29), (22.4, 29), (19.5, 9.6), (19.5, 23.5), (38.3, 16), (38.3, 5), (39, 27)]
# (x, y, z, watts) glowing lamps and pendants
LAMPS = [(2.9, 3.1, 22.9, 6), (10.9, 3.1, 22.9, 6), (28.1, 3.1, 9.4, 5), (35.3, 3.1, 9.4, 5), (12.9, 3.1, 1.6, 5),
         (2.3, 5.1, 20.8, 8), (19.45, 7.2, 14.3, 10), (19.45, 7.2, 16.4, 10), (19.45, 7.2, 18.5, 10),
         (30.4, 6.7, 22.6, 8), (32.9, 6.7, 22.6, 8), (2.9, 6.0, 22.9, 4), (10.9, 6.0, 22.9, 4), (22.25, 3.6, 1.0, 6)]


def setup_room_lights(k=2700):
    warm = kelvin(k)
    # gentle fill per room (the soft bounce of a lit home)
    for i, (x0, x1, z0, z1, watts) in enumerate(ROOM_LIGHTS):
        ob = add_light(f'fill{i}', 'AREA', plan((x0 + x1) / 2, H - 0.3, (z0 + z1) / 2), watts * 0.35, warm,
                       size=((x1 - x0 - 2) * FT, (z1 - z0 - 2) * FT))
        ob.data.spread = math.radians(180)
        ob.visible_glossy = False
    # downlights: narrow-ish warm spots that throw scallops on walls and pools on the floor
    spots = list(DOWNLIGHTS)
    for x0, z0, x1, z1, bw, drop in COVES:
        x = x0 + bw / 2
        while x < x1:
            spots += [(x, z0 + bw / 2, H - drop), (x, z1 - bw / 2, H - drop)]
            x += (x1 - x0 - bw) / 3
    for i, sp in enumerate(spots):
        x, z = sp[0], sp[1]
        y = sp[2] if len(sp) > 2 else H
        add_light(f'spot{i}', 'SPOT', plan(x, y - 0.08, z), 22, warm, radius=0.03, spot=70)
    # cove strips: hidden linear lights that wash the ceiling
    for j, (x0, z0, x1, z1, bw, drop) in enumerate(COVES):
        y = H - drop + 0.2
        edges = [((x0 + x1) / 2, z0 + bw - 0.15, (x1 - x0 - 2 * bw), 0.2), ((x0 + x1) / 2, z1 - bw + 0.15, (x1 - x0 - 2 * bw), 0.2),
                 (x0 + bw - 0.15, (z0 + z1) / 2, 0.2, (z1 - z0 - 2 * bw)), (x1 - bw + 0.15, (z0 + z1) / 2, 0.2, (z1 - z0 - 2 * bw))]
        for e, (cx, cz, sx, sz) in enumerate(edges):
            length = max(sx, sz)
            add_light(f'cove{j}_{e}', 'AREA', plan(cx, y, cz), 9 * length, kelvin(3000),
                      size=(sx * FT, sz * FT), rot=(math.pi, 0, 0))
    for i, (x, y, z, w) in enumerate(LAMPS):
        add_light(f'lamp{i}', 'POINT', plan(x, y, z), w * 4, kelvin(2700), radius=0.06)


# ----------------------------------------------------------------- camera
def make_camera(pos, tgt, lens, w, h, level=True):
    cam_data = bpy.data.cameras.new('Cam')
    cam_data.lens = lens
    cam_data.sensor_width = 36
    cam_data.clip_start = 0.05
    cam_data.clip_end = 2000
    cam = bpy.data.objects.new('Cam', cam_data)
    bpy.context.collection.objects.link(cam)
    p, t = plan(*pos), plan(*tgt)
    d = t - p
    yaw = math.atan2(d.y, d.x) - math.pi / 2
    if level:
        cam.rotation_euler = (math.radians(90), 0, yaw)
        # lens shift to place the target height where a tilted camera would
        horiz = math.hypot(d.x, d.y)
        sensor_h = 36 * h / w
        shift = (d.z / horiz) * lens / sensor_h * (sensor_h / 36)
        cam_data.shift_y = max(-0.3, min(0.3, shift))
    else:
        pitch = math.atan2(d.z, math.hypot(d.x, d.y))
        cam.rotation_euler = (math.radians(90) + pitch, 0, yaw)
    cam.location = p
    return cam


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument('--glb', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--shots', default=','.join(SHOTS))
    ap.add_argument('--w', type=int, default=1920)
    ap.add_argument('--h', type=int, default=1080)
    ap.add_argument('--samples', type=int, default=256)
    ap.add_argument('--threads', type=int, default=0)
    ap.add_argument('--save-blend', default='')
    ap.add_argument('--exposure', type=float, default=-0.2)
    ap.add_argument('--look', default='AgX - Punchy')
    ap.add_argument('--kelvin', type=int, default=2700)
    a = ap.parse_args(argv)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(a.glb))
    fix_materials()
    setup_world()
    setup_room_lights(a.kelvin)

    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = a.samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.02
    cy.use_denoising = True
    cy.denoiser = 'OPENIMAGEDENOISE'
    cy.max_bounces = 8
    cy.diffuse_bounces = 4
    cy.glossy_bounces = 4
    cy.transparent_max_bounces = 12
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.blur_glossy = 1.0
    cy.sample_clamp_indirect = 8.0
    if a.threads:
        sc.render.threads_mode = 'FIXED'
        sc.render.threads = a.threads
    sc.render.resolution_x, sc.render.resolution_y = a.w, a.h
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 94
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = a.look
    except TypeError:
        print('unknown look', a.look)
    sc.view_settings.exposure = a.exposure

    os.makedirs(a.out, exist_ok=True)
    ceiling = [o for o in bpy.data.objects if o.name.startswith('ceiling') or (o.parent and o.parent.name.startswith('ceiling'))]
    if a.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.save_blend))
    for name in a.shots.split(','):
        pos, tgt, lens, _ = SHOTS[name]
        overview = name == 'overview'
        for o in ceiling:
            o.hide_render = overview
        cam = make_camera(pos, tgt, lens, a.w, a.h, level=not overview)
        sc.camera = cam
        sc.render.filepath = os.path.join(os.path.abspath(a.out), f'{name}.jpg')
        bpy.ops.render.render(write_still=True)
        print('rendered', name, flush=True)


if __name__ == '__main__':
    main()
