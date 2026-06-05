# Progress Log

A day-by-day record of how this promo came together.

## Session 1 — Install + first render (~30 min)

**Goal**: Get the [nexu-io/html-video](https://github.com/nexu-io/html-video) plugin working on a Mac and produce a first cut.

- Cloned the monorepo to `tools/html-video/` on disk (~734 MB with `node_modules`).
- `pnpm install` + `pnpm -r build` worked first try. `pnpm --filter @html-video/cli smoke` passes.
- `bin.js doctor` returns 5/5: node 25.8.0, ffmpeg 8.1, chromium (ms-playwright bundle), adapter-hyperframes 0.4.x, 22 templates.
- Built a 1:1 adaptation of the existing 8-frame `vicoo-intro-hyperframes` (already in `videos/`): cover, brand meaning, transformation flow, circular loop, traceability, platforms, closing.
- Rendered at 1920×1080@30fps. **Output**: `videos/vicoo-promo.mp4` · 9.16 MB · 42.93s · h264.
- Thumbnails looked great: rust-red sweep across Smiley Sans "VICOO" in cover, etc.

## Session 2 — User feedback: wrong aesthetic (~40 min)

User said: *"I want a more modern style. Not the magazine look. Use Uniqlo's B/W/R. And use actual components from our site. And smoother motion than just fade-ins."*

So I:
- Reread `frontend/web-react/src/styles/tokens.css` to confirm VICOO already had a Uniqlo red (`#E60012` hard-coded in the header), a `monochrome` theme, and Smiley Sans as the display font.
- Surveyed the actual components: `ProductCard`, `Header`, `ImpactCounter`, `MagneticButton`, `TiltCard`, `DonationPanel`, `KineticTextMarquee`, the AI assistant page. These are the visual language of the real site.
- Rewrote 8 frames end-to-end in the B/W/R + Smiley Sans + real Unsplash product photos style. Drop in:
  - `TiltCard` 3D tilt on the marquee featured item
  - `gsap.to(obj, { val: target, onUpdate: ... })` odometer for ¥1,284,560 → counts
  - `gsap.to(track, { x: '-50%', repeat: -1 })` infinite marquee loop
  - `clipPath: inset(0 100% 0 0) → 0` wipe-in on the product hero
  - `back.out(1.7)` elastic pop on donation badges
  - `fromTo(btn, {x:0}, {x:-3, yoyo: true, repeat: 1})` magnetic-button micro-interaction
- **Output**: 35.2s · 1080p · 2.6 MB. Smoother, sharper, on-brand.

## Session 3 — Smoothing + 2K@60fps (~50 min)

User said: *"Transitions between scenes are too harsh. Can the same element flow across multiple HTMLs? And go to higher resolution and frame rate."*

- **2K + 60fps**: Set `preferences.resolution: {2560,1440}` and `fps: 60` in `project.json`. Each frame HTML now sets `body { width:2560; height:1440 }` and wraps its 1920×1080 design in a `.stage` div with `transform: scale(1.3333333)` — pixel-doubling the design without redesigning every px.
- **Smiley Sans font** copied from `frontend/web-react/src/fonts/SmileySans-Oblique.woff2` to the `frames/` dir, loaded via `@font-face` so the brand wordmark uses the real chunky display weight.
- **Real product images**: replaced CSS-painted t-shirt placeholders with the actual Unsplash URLs from `backend/app/showcase_shop_catalog.py` (春野联名 T 恤, 有机棉, 针织衫, 托特, 外套, 衬衫, 披肩, 牛仔 — 8 real items).
- **Per-frame exit animations**: every frame's GSAP timeline now ends with a `// Exit` block that fades/slides elements out in the last 0.4-0.5s. Without this, the xfade has nothing to fade from and the cross-dissolve looks like a slow cut.
- **Shared elements across frames**:
  - VICOO wordmark: cover (big, center) → header (small, top-left) → closing (big, center again)
  - 8px red top bar: header → hero → marquee → platforms → closing
  - Donation progress bar: counters → donation panel
- **Custom `xfade-compose.js`**: a Node wrapper that uses `ffmpeg xfade` to chain 28 cross-dissolves (or 8 in v3) with `duration=0.5:offset=…` between every adjacent pair. Replaces the default `concat` step that `html-video` uses.
- **Output**: 33.3s · 2K@60fps · 8.0 MB. Smooth cross-dissolves, real images, real fonts.

## Session 4 — 3-minute full user-journey coverage (~3 hr)

User said: *"Extend to 3 minutes, cover the full user experience. Use the tex/user.tex as a reference."*

I read `tex/user.tex` (the actual user manual — 466 lines, full consumer + staff guide) and identified every distinct user-facing surface:

- Brand + meaning
- Two storefronts (`/shop` and `/impact/shop`)
- Product detail (normal + impact)
- 3D Traceability Globe with supply-chain nodes
- Timeline (5-stage horizontal)
- Material trace page (stage-level records)
- Login + profile + orders + donations
- Cart drawer + checkout + order detail
- Donation certificate
- Clothing recycle (intake → resale → recycle → reinvest)
- Campaigns (1 featured + 3 grid)
- Artwork submit (kid upload + guardian consent)
- Community vote (top-3 podium)
- AI assistant chat (with real Q&A about the campaign data)

That's **20 new HTML frames** to write, on top of the 8 existing. Each one:
- Same `.stage` 1.333× scale wrapper at 2560×1440
- Same `Smiley Sans` `@font-face` local font
- Real Unsplash imagery where applicable
- Real data from `backend/app/showcase_shop_catalog.py` and `tex/user.tex`
- GSAP entry, content reveal, micro-interaction, exit animation
- The pattern is now well-practiced: ~3-4 min per frame

Wrote all 20 in batched `Write` calls. Total HTML lines added: ~5,000.

Then updated `content-graph.json` to 28 nodes + 27 sequence edges, and `project.json` to register all 28 frames with 2K60fps preferences.

- **Render**: `html-video project-render` ran 28 frames at 2K@60fps. Took ~5 minutes. Output: 28 per-frame MP4s (~50 MB total) + concatenated intermediate.
- **xfade**: 27 cross-dissolves of 0.45s each on the 150s raw timeline. Final 143.1s.
- **Output**: `videos/vicoo-promo.mp4` · 27.2 MB · **143.1s** · 2K@60fps · h264.

The xfade-compose.js was generalized to auto-discover `frames/NN.mp4` so future frame additions don't require script changes.

## Session 5 — Repo migration (this session)

User said: *"I don't want this in VICOO-esp. Make it a standalone repo. Move everything to https://github.com/Yhazrin/vicoo-presentation.git. The old repo's content can be deleted."*

- Cloned the target repo to `/tmp/vicoo-presentation`.
- `git rm -rf .` to nuke the old contents (29 leftover compositions from an earlier final-project presentation).
- Built the new structure:
  - `videos/vicoo-promo.mp4` — the deliverable
  - `frames/` — 28 HTML scenes + Smiley Sans font
  - `project/` — content-graph + project.json + 28 per-frame MP4s
  - `scripts/` — xfade-compose.js + render.sh
  - `docs/` — methodology + progress + final-deliverable
  - `README.md` + `LICENSE` + `.gitignore`
- Ready to commit and push.
