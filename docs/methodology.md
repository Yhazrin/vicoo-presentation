# Methodology

How the VICOO brand promo was designed and built.

## 1. Goal

A 3-minute promotional video for **VICOO-ESP** that walks a viewer through the entire user journey — from the brand cover, through both storefronts, deep into the 3D traceability globe, through the donation flow, to the admin back-office — using real components from the actual web app, not abstract marketing visuals.

**Three hard constraints** (from the user):
1. **Black / white / red** aesthetic in the spirit of UNIQLO (VICOO's partner on the welfare program), not the 1990s print-magazine look that the rest of the VICOO-ESP design system uses.
2. **Built from real web components** — `ProductCard`, `Header`, `ImpactCounter`, `DonationPanel`, `CartDrawer`, `TiltCard`, `Marquee`, the AI assistant — not generic placeholders.
3. **Smooth, expressive motion** — clipPath wipes, odometer counters, 3D tilts, magnetic buttons, marquee loops, elastic pops, certificate stamps. Not just fadeIn/translateY.

**Stretch goal (achieved)**: smooth cross-fade transitions between scenes, shared elements that flow across scene boundaries, 2K@60fps, real product photography from the Unsplash URLs in `backend/app/showcase_shop_catalog.py`.

## 2. Tool choice

**Decision: use [nexu-io/html-video](https://github.com/nexu-io/html-video) rather than Remotion, Motion Canvas, or hand-rolling ffmpeg.**

Why:
- Apache-2.0, no per-render fees, no vendor lock-in
- The default `hyperframes` engine is perfect for this use case: HTML+CSS+GSAP → headless Chromium recording → ffmpeg encode. Authoring is plain HTML, no React build step.
- The v0.8 `content-graph` storyboard format fits a multi-scene promo exactly: 28 nodes + 27 `sequence` edges.
- Already packaged as a monorepo I could `pnpm install` once and reuse for all future VICOO video work.

Install footprint is 734 MB with `node_modules`, but the output artifacts (HTML frames, project.json, per-frame MP4s) are tiny and live in this repo.

## 3. Architecture

### One frame = one HTML file

Each scene in the promo is a fully self-contained HTML document:

```
frames/01-cover_blackred.html
frames/02-header_unfold.html
...
frames/28-ai.html
```

Every frame:
- Renders at **1920×1080** internally, then CSS-scaled **1.333×** to fill a **2560×1440** viewport. This means all the design values (px, font sizes, grid columns) stay readable as the 1080p design but record at 2K.
- Loads **Smiley Sans** from the local `SmileySans-Oblique.woff2` (the actual brand font from `frontend/web-react/src/fonts/`).
- Has a `gsap.timeline({ paused: true })` registered on `window.__timelines["<frame-id>"]`.
- The timeline is auto-`play()`ed on the `load` event so the recording captures the animation in real time.
- Has a `// Exit` block at the end of the timeline that fades/slides content out, so when the per-frame MP4s are stitched with `xfade` the boundary dissolves naturally.

### The content graph

`project/content-graph.json` is the storyboard:

```json
{
  "schemaVersion": 1,
  "intent": "promo",
  "nodes": [
    { "id": "cover_blackred", "durationSec": 4 },
    { "id": "header_unfold",  "durationSec": 4 },
    ...
  ],
  "edges": [
    { "from": "cover_blackred", "to": "header_unfold", "kind": "sequence" },
    ...
  ]
}
```

`html-video`'s orchestrator topo-sorts the edges to derive play order, then renders each frame in sequence.

### The project

`project/project.json` is the orchestrator's view of the same project:

```json
{
  "preferences": {
    "resolution": { "width": 2560, "height": 1440 },
    "fps": 60
  },
  "frames": [
    { "graphNodeId": "cover_blackred", "htmlPath": "...", "durationSec": 4, "order": 0 },
    ...
  ]
}
```

`html-video project-render` reads this and:
1. For each frame, launches headless Chromium at 2560×1440@60fps
2. Navigates to `file://…/frames/NN-name.html`
3. Waits the frame's `durationSec`
4. Records via Playwright's `recordVideo` → `webm`
5. ffmpeg transcodes the webm → MP4 with `-t <durationSec> -c:v libx264 -crf 20 -pix_fmt yuv420p`
6. Concats the per-frame MP4s with a single `ffmpeg -f concat` (which I then replace with `xfade` post-processing)

## 4. Design system

### Palette (B/W/R + paper)
| Token | Hex | Use |
|---|---|---|
| Ink (primary text) | `#1A1A16` | Headlines, primary content |
| Ink-faded (secondary) | `#4A4540` | Body, captions |
| Sepia mid | `#7A6A58` | Photo credits, meta |
| **Uniqlo red (accent)** | `#E60012` | 8px top bars, badges, CTAs, donate % indicators, verification stamps, progress fills |
| Paper | `#F5F0E8` / `#0A0A0A` | Light and dark scene backgrounds |

The red is used as **emphasis only**, never as a fill for large surfaces. The black and white do the heavy lifting. The Smiley Sans display weight 400 provides the chunky "headline" feel that Uniqlo's branding evokes.

### Typography
- **Smiley Sans 得意黑** (locally hosted) — display + brand logos (VICOO, UNIQLO)
- **Inter 300-900** (Google Fonts) — body, labels
- **Noto Sans SC 300-900** (Google Fonts) — Chinese body copy
- **JetBrains Mono 400-700** (Google Fonts) — meta labels, timestamps, certificate numbers

### Layout grid
- **Stage pattern**: each frame wraps its 1920×1080 design in a `.stage` div with `transform: scale(1.3333333)`, so the chromium viewport at 2560×1440 captures a pixel-doubled version of the design without redesigning every px value.
- **Asymmetric grids** (e.g. `grid-template-columns: 1.6fr 1fr`) instead of centered symmetry.
- **8px top red bar** on every light scene, to keep a continuous visual rhythm with the dark scenes (which use the same red in their `8px top bar` or full-screen red sweep).

### Motion principles
| Principle | Implementation |
|---|---|
| **Editorial precision** | Linear eases (`power1`, `power2`) for text, "expo" for big entrances |
| **Spring overshoot** | `back.out(1.7)` for badges, vote buttons, certificate stamp — 1× per scene only |
| **3D tilt** | `rotationY/X` on `TiltCard` with `transformPerspective: 1000` for the marquee featured item |
| **Magnetic pull** | `gsap.fromTo(btn, {x:0}, {x:-3, yoyo:true, repeat:1})` for primary CTAs |
| **Odometer counters** | `gsap.to(obj, {val: target, onUpdate: () => el.innerText = Math.floor(obj.val).toLocaleString()})` for donation totals, item counts, percentages |
| **Marquee loop** | `gsap.to(track, {x: '-50%', duration: 12, ease: 'none', repeat: -1})` paused initially, played in a `tl.call()` after the cards have entered |
| **Continuous** | Each frame's timeline ends with an `// Exit` block that fades/slides elements out in the last 0.4-0.5s. This is what makes the xfade composite feel smooth. |

## 5. Cross-fade composition

After `html-video project-render` produces 28 per-frame MP4s in `frames/01.mp4 … frames/28.mp4`, `scripts/xfade-compose.js` runs:

```js
[0:v][1:v]xfade=transition=fade:duration=0.45:offset=3.95[vt1];
[vt1][2:v]xfade=transition=fade:duration=0.45:offset=7.85[vt2];
... (26 more)
```

Each `offset` is the time in the output timeline where the cross-dissolve begins. The chain produces 27 cross-dissolves of 0.45s each, eating ~12s of overlap from the 150s raw timeline → 143s final.

`xfade-compose.js` is a thin wrapper that:
- Auto-discovers all `frames/NN.mp4` (not hardcoded to 28)
- Probes each frame's actual duration with `ffprobe`
- Builds the chained filter graph
- Calls `ffmpeg` with `execFileSync` (no shell-escape issues)
- Encodes with `libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart` (broad player compatibility)

## 6. What changed across versions

| Version | Frames | Resolution | FPS | Length | Theme |
|---|---|---|---|---|---|
| v1 (first render) | 8 | 1920×1080 | 30 | 42.9s | 1990s print magazine editorial (paper, Playfair, sepia) |
| v2 (re-design) | 8 | 1920×1080 | 30 | 35.2s | Uniqlo B/W/R (Smiley Sans, Helvetica, red) |
| v3 (smoothing) | 8 | 2560×1440 | 60 | 33.3s | + xfade cross-dissolves + per-frame exit anims + shared elements |
| **v4 (3-min full coverage)** | **28** | **2560×1440** | **60** | **143.1s** | **+ complete user journey: dual storefronts, globe, timeline, auth, cart, checkout, order, certificate, recycle, campaigns, artwork, vote, AI** |

v1 was the first pass — beautiful but the wrong aesthetic. v2 was the user's requested pivot to B/W/R. v3 added the polish. v4 is the one that ships.
