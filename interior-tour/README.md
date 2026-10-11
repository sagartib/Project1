# 3 BHK Interior Design & Virtual Tour

Interior design for the 3 BHK apartment (**BUA 1890 sft · Carpet 1455 sft**, west-facing entrance),
modelled to the dimensions on the brochure floor plan and presented as a rendered walkthrough video plus an
interactive 3D tour.

- **Photoreal video:** `output/virtual-tour-photoreal.mp4` (1920×1080, path-traced in Blender Cycles)
- **Photoreal stills:** `output/photoreal/` (one Full HD render per room)
- **Interactive:** open `index.html` through any static server (`npx serve .`), then use the guided tour or switch to free orbit (dollhouse view).

## Design concept — "Warm Modern"

Calm, light backgrounds (warm white walls, large-format Italian-marble-look vitrified tiles) layered with natural
oak and walnut, matte black and brushed brass details, and a palette of sage, terracotta, rust and mustard.
Fluted wood panels, cove-lit false ceilings and soft furnishings carry the look through every room.

| Element | Specification |
|---|---|
| Flooring (living, dining, kitchen) | 2'×4' marble-look vitrified tiles, gloss |
| Flooring (bedrooms) | Engineered oak planks |
| Sit-out & balcony | Herringbone wooden deck |
| Toilets | Matte grey large-format tiles, walls tiled to 7' |
| Ceilings | Gypsum false ceiling with warm (3000K) cove LED + recessed downlights in the hall and master bedroom |
| Hardware | Matte black window frames, brass profile handles and door pulls |

## Room by room

**Foyer & Drawing Room** (14'7½" × 10'10½")
Teak main door with brass inlay strips. Floating shoe cabinet with backlit plinth and a brass-framed mirror at the
entry. Floor-to-ceiling oak fluted feature wall with abstract art and a walnut credenza. Beige 3-seater sofa,
rust and mustard velvet accent chairs, marble-and-brass nesting tables, bordered rug, floor lamp and fiddle-leaf fig.

**Dining** (10'4½" × 14'9")
6-seater Calacatta-look marble table on walnut pedestals, linen chairs with mustard accents, trio of brass dome
pendants. Walnut crockery unit with backlit fluted-glass display. Floating wash-basin vanity with backlit mirror
outside the common toilet.

**Living Room** (10'9" × 10'10½")
Oak fluted TV wall with a floating walnut console (stone top, underglow LED), side shelves. Sage-green L-shaped
sofa with chaise, round marble coffee table, abstract rug, accent armchair, art pair above the sofa. Sliding glass
door to the sit-out.

**Sit Out** (6'1½" × 10'10½")
Herringbone deck, hanging rattan egg swing, lounge chair, side table, terracotta planters and a vertical garden
wall on walnut battens.

**Modular Kitchen** (12'1½" × 10'10½")
- **Layout:** L-shaped. Hob and chimney on the east wall, sink under the south window, tall units on the west wall.
- **Base units:** handle-less shutters with a black gola profile, matte forest-green finish, 2'9" carcass height, recessed black plinth.
- **Countertop:** Calacatta-look quartz with an eased edge.
- **Backsplash:** warm white gloss subway tiles.
- **Wall units:** warm-white high-gloss, with under-cabinet LED strips and an oak loft up to the ceiling.
- **Appliances:** 3-burner glass hob, angled black-glass chimney, built-in oven and microwave in a tall unit, French-door refrigerator.
- **Storage:** full-height pantry unit, plus pull-out (tandem) drawers in the base units.
- **Sink:** single-bowl stainless steel with a matte black pull-out tap.
- **Breakfast ledge:** quartz ledge on the north wall with two walnut stools, black pendants and a floating oak shelf.
- **Utility:** front-load washer, storage unit and open shelves. It is reached through a glass door.

**Master Bedroom** (14'3" × 10'10½")
Terracotta wall with full-height walnut fluted headboard panel, king bed with channel-tufted grey headboard,
walnut side tables with ceramic lamps and pendant drops. 4-door lacquer + walnut wardrobe with brass handles,
walnut dresser with round brass mirror, layered curtains, line-pattern rug.

**Bed Room 2** (14'0" × 10'4½")
Blue-grey accent wall, queen bed with blue channel headboard, full-height oak wardrobe, study desk with task lamp
under the north window, wall shelves, sheer curtains.

**Bed Room 3** (13'1½" × 10'4½")
Taupe wall with oak panelled headboard backdrop and LED wash, queen bed in sage linens, white + oak wardrobe with
brass handles, door to the balcony.

**Pooja Room** (4'1½" × 6'1½")
Walnut mandir with backlit CNC jali panel, Calacatta pedestal, brass diyas and bell, carved jali double doors.

**Toilets**
Walnut floating vanity with quartz top and backlit mirror, wall-hung WC, glass shower partitions, dark stone shower floor.

## How it is built

The model is procedural [three.js](https://threejs.org) code with no external assets. All dimensions are in feet,
taken from the floor plan.

| File | Contents |
|---|---|
| `src/apartment.js` | Floor plan: walls, openings, floors, ceilings, plus every room's furniture layout |
| `src/builders.js` | Materials and parametric furniture (sofas, beds, wardrobes, kitchen parts and more) |
| `src/textures.js` | Canvas-generated marble, wood, tile, fabric, rug and art textures |
| `src/tour.js` | Camera path and room captions |
| `render.mjs` | Renders the real-time tour frame by frame in headless Chromium |
| `export-glb.mjs` | Exports the model to glTF for Blender |
| `blender/scene.py` | Cycles materials, lighting, cameras and rendering |
| `video/make_video.py` | Builds the walkthrough video from the stills |

### Photoreal renders (Blender Cycles)

The same model is exported to glTF and path-traced in Cycles, using:

- realistic materials: mirror-polished marble, wood grain bump, fabric sheen, bevelled edges
- warm 2700K downlights and hidden cove strips that wash the ceiling
- lamps and pendants, plus afternoon sun and sky through the windows

Cameras are kept level, like architectural photography. The video is cut from the stills with slow push-ins and pans,
captions and crossfades.

```bash
pip install bpy==5.2.2                       # Blender as a Python module (Python 3.13)
node export-glb.mjs                          # -> build/apartment.glb
python blender/scene.py --glb build/apartment.glb --out output/photoreal --samples 56
python3 video/make_video.py --stills output/photoreal --out output/virtual-tour-photoreal.mp4
```

Shot list, lighting and material finishes are in `blender/scene.py`; captions and timing are in `video/make_video.py`.

### Real-time preview (three.js)

```bash
npm install
node render.mjs                                  # full video -> output/virtual-tour.mp4
node render.mjs --stills 20.5,40.5 --outdir out  # individual frames
node render.mjs --from 0 --to 50 --noencode 1    # render a time range (for parallel workers)
```

To change a finish, edit the material colours in `src/builders.js` (`makeMaterials`) or the layout in
`src/apartment.js`, then re-render.
