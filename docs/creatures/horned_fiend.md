# Horned Fiend v1: part breakdown

Reference (the only one): `references/creatures/horned_fiend/turnaround.svg` + `proportions.md`. HH (head height) = 0.27 m.
Model space: +Y up, faces -Z, feet on y = 0. Height 2.2 m to the horn curl, body about 2.0 m (7.5 HH).
Data: `src/kit/creatures/horned_fiend.js`. Parts come from the Step 5 kit; the head and jaw were rebuilt as a flat skull face (the parts-kit head had a dog snout).

| Part (kit) | Rig node | Size / place (m) | Material role |
|---|---|---|---|
| torso | body | pelvis at y 1.03, shoulders about 0.6 wide (2.2 HH), leaning forward, ribs, spine spikes | skin, bone |
| head (skull) | head | 0.27 tall, 0.20 wide, flat face, heavy brow, sunken sockets, nose slits, small pointed ear fins swept back | skin, eye, bone, horn |
| jaw | jaw | short and gaunt, tip stays within 0.25 HH of the brow line, mouth a little open, needle fangs | skin, bone |
| horn x2 (ram) | head | about 0.45 m along the curve, up-out then curling back and down, tips forward-out, ridged | horn |
| limb (arm) x2 | armL, armR | long: claw tips reach the knee (y about 0.5) | skin, bone |
| hand x2 | armL, armR | four hooked black claws | skin, claw |
| leg x2 | body | digitigrade: knee forward, ankle high and back | skin, bone |
| hoofFoot x2 | body | cloven hooves | skin, claw |
| tail | tail | thin, leaves the spine, reaches the floor and trails about 1 m behind, bone spike tip | skin, bone |

Proportion checks (all in `tests/horned_fiend.test.js`): at most 8000 triangles, height 2.0 to 2.3 m, head height about 1 HH, side-view jaw tip within 0.25 HH of the brow, claws at knee height, tail on the floor and about 1 m back.
