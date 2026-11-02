# Tools
- `sheet.mjs <name>`: headless Chromium renders `lab/` front, side, three-quarter and top (lit, and flat-white silhouette), puts them next to `references/creatures/<name>/{front,side,three,top}.png`, scores the silhouette overlap (front and side need 0.80), and writes `previews/<name>/sheet.png`, `index.html` and `scores.json`. Needs Playwright; set `THREE_DIR` to a local three.js checkout if jsDelivr is blocked.
- `shot.mjs "<query>" out.png [WxH]`: one screenshot of the lab, plus draw calls, triangles and lights (the phone budget numbers).
- `blender/` (optional): headless Blender Python scripts for AO/normal bakes. Never required to run the site.
