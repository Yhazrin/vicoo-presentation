# VICOO Brand Promo

A 2K@60fps, 2:23-long brand promotional video for **VICOO** — a cross-platform e-commerce ecosystem that turns children's artwork into traceable, sustainable apparel in partnership with UNIQLO.

> *From a child's drawing to a transparent future.*

This repository contains the **final deliverable** plus all **engineering source files** used to produce it. The video is generated locally on a Mac via the [nexu-io/html-video](https://github.com/nexu-io/html-video) HTML-to-video pipeline (HTML + CSS + GSAP → headless Chromium recording → ffmpeg encode → xfade composite).

---

## What's inside

| Path | What it is |
|---|---|
| `videos/vicoo-promo.mp4` | **The final video.** 143s, 2560×1440@60fps, 27.2 MB. |
| `frames/01-…28-….html` | The 28 self-contained animated HTML "scenes". Each one renders to one 4-7s clip. |
| `frames/SmileySans-Oblique.woff2` | Local Smiley Sans (得意黑) brand font, loaded by every frame. |
| `project/content-graph.json` | The storyboard graph: 28 nodes + 27 `sequence` edges that drive play order. |
| `project/project.json` | html-video project metadata: frame order, durations, resolution (2K), fps (60). |
| `project/per-frame-mp4s/01.mp4 … 28.mp4` | The 28 per-frame MP4s produced by `project-render` (intermediate artifacts, useful for verification). |
| `scripts/xfade-compose.js` | Node script that runs `ffmpeg xfade` on the per-frame MP4s to produce the final video with cross-dissolves. |
| `scripts/render.sh` | One-shot shell wrapper for the full re-render pipeline. |
| `docs/methodology.md` | How the video was made: architecture, design system, motion principles. |
| `docs/progress.md` | Day-by-day development log: v1 editorial → v2 modern B/W/R → v3 3-min full coverage. |
| `docs/final-deliverable.md` | Frame-by-frame breakdown, technical specs, and a thumbnail contact sheet. |
| `LICENSE` | Apache-2.0 (same as upstream). |

---

## Re-rendering from source

The html-video monorepo (734 MB with `node_modules`) is **not** included in this repo. It is installed once on the build machine under `tools/html-video/`. The setup is reproducible:

```bash
# 1. Install html-video from upstream
git clone https://github.com/nexu-io/html-video.git
cd html-video && pnpm install && pnpm -r build

# 2. (one time) Copy the Smiley Sans brand font next to the frames
cp frontend/web-react/src/fonts/SmileySans-Oblique.woff2 \
   .html-video/projects/proj_6ee4e1be-bbf/frames/

# 3. Drop the source frames into the html-video project
cp -r frames/* .html-video/projects/proj_6ee4e1be-bbf/frames/

# 4. Run the full pipeline
./scripts/render.sh
```

`scripts/render.sh` will:
1. `cd` into the html-video project
2. Run `html-video project-render` to produce the 28 per-frame MP4s
3. Run `node scripts/xfade-compose.js` to stitch them with xfade cross-dissolves
4. Write the final video to `videos/vicoo-promo.mp4`

Total time on an M-series Mac: ~6-8 minutes.

---

## Tooling

| Layer | Tool | Why |
|---|---|---|
| HTML authoring | Hand-written, no framework | Each scene is one self-contained file with inline CSS + GSAP. No build step. |
| Animation | [GSAP 3.14](https://gsap.com/) via CDN | Stagger, odometer counters, magnetic buttons, TiltCard 3D, marquee loop, elastic pop, clipPath wipe. |
| Brand font | [Smiley Sans 得意黑](https://github.com/atelier-anchor/smiley-sans) (locally hosted) | The actual font used across VICOO-ESP (frontend/web-react/src/fonts). |
| Product imagery | [Unsplash](https://unsplash.com) URLs from `backend/app/showcase_shop_catalog.py` | Real product images, consistent with the showcase catalog. |
| Render | [nexu-io/html-video](https://github.com/nexu-io/html-video) | Headless Chromium records each HTML scene → webm → ffmpeg libx264 → per-frame MP4. |
| Cross-dissolve | `ffmpeg xfade` filter (custom Node wrapper) | Chained `[a][b]xfade=duration=0.45:offset=…` to stitch the 28 clips into one continuous video. |

---

## Acknowledgements

- **[nexu-io/html-video](https://github.com/nexu-io/html-video)** — Apache-2.0, the HTML-to-video meta-layer this whole pipeline is built on
- **[heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)** — the engine under the hood
- **[VICOO-ESP](https://github.com/Yhazrin/VICOO-esp)** — the project this promo is for
- **[Smiley Sans](https://github.com/atelier-anchor/smiley-sans)** — 得意黑, the brand font

---

## License

Apache-2.0 — see [LICENSE](./LICENSE).
