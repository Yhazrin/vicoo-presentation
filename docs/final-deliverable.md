# Final Deliverable

## Specs

| | |
|---|---|
| **File** | `videos/vicoo-promo.mp4` |
| **Duration** | 143.1 seconds (2:23) |
| **Resolution** | 2560×1440 (2K, QHD) |
| **Frame rate** | 60 fps |
| **Codec** | h264, yuv420p, CRF 20, `+faststart` |
| **Size** | 27.2 MB |
| **Bitrate** | ~1.5 Mbps |
| **Audio** | None (silent — original brief didn't ask for it) |
| **Frames** | 8,586 total |

## Frame-by-frame timeline

| # | Frame | Section | Theme | Real data shown |
|---|---|---|---|---|
| 01 | `cover_blackred` | OPENING | VICOO big wordmark + red sweep + tagline | "MADE TO CIRCULATE" |
| 02 | `header_unfold` | OPENING | Uniqlo red bar + full nav + CART 3 + hero copy | "Children's art, worn by everyone" |
| 03 | `hero_product` | OPENING | Spring 联名 T 恤 detail w/ size selector + 28% donation badge | ¥178 / 林一一 age 8 / 春的色彩 |
| 04 | `marquee_strip` | OPENING | 8 product cards horizontal GSAP loop + 3D TiltCard | full SHOWCASE_REGULAR catalog |
| 05 | `counters_burst` | OPENING | 3 odometer ImpactCounters + 6 stats | ¥1,284,560 / 4,872 / 12,431 |
| 06 | `donation_panel` | OPENING | Donation form: amount preset + impact preview + red fill wipe | ¥100 → 1 student, 1 semester |
| 07 | `platforms_chip` | OPENING | Web / 小程序 / Android 3-platform chips | 1,284 products / 4,872 artworks |
| 08 | `closing_redbar` | OPENING | Black background + huge "MADE TO CIRCULATE" + red sweep | "为下一个孩子，继续画下去" |
| 09 | `brand_meaning` | BRAND | VI / COO etymology + circled-O motif | — |
| 10 | `missions` | BRAND | 4 pillars: Creative · Traceable · Circular · Charitable | — |
| 11 | `home` | STOREFRONT | Consumer home / + GSAP marquee ticker | "32 SCHOOLS · 1,284 PRODUCTS · 12,431 ARTWORKS · ¥1.2M DONATED · 98.7% TRACEABLE" |
| 12 | `shop_browse` | STOREFRONT | /shop 4×2 product grid with filter chips | all 8 SHOWCASE_REGULAR items |
| 13 | `normal_detail` | STOREFRONT | /shop/:id normal product + 5 reviews | ¥159 · GOTS · 4.8★ |
| 14 | `impact_detail` | STOREFRONT | /impact/shop/:id impact product + 5-stage supply chain + linked campaign | ¥178 · 28% donate · 5 stages |
| 15 | `globe_intro` | TRACEABILITY | 3D globe 7 nodes + 5 arcs + side timeline | CN/TR/IN/FR/US/BR/KE nodes · 5 stages with carbon |
| 16 | `timeline` | TRACEABILITY | Horizontal 5-stage timeline + stage-3 detail panel | "STAGE 03 / 05 · 60% progress" |
| 17 | `material_trace` | TRACEABILITY | Material records table + 5 stage cards w/ cert badges | GOTS · BLUESIGN · OEKO-TEX · CARBON-NEUTRAL |
| 18 | `login` | AUTH | Left dark / right white signin split | "Hello, again." + lihua@example.com |
| 19 | `profile` | AUTH | User profile + 3 orders + 3 donation certs | 莉华 · ¥1,440 donated · 3 certs |
| 20 | `cart` | COMMERCE | Cart drawer over dimmed background + impact line | "本订单将向美育基金捐赠 ¥77 (12.7%)" |
| 21 | `checkout` | COMMERCE | Checkout form + order summary + Place Order | 4 steps · 微信支付 selected |
| 22 | `order` | COMMERCE | Order detail w/ 5-step shipment status | "SHIPPED · EST. 2026-05-01" |
| 23 | `certificate` | COMMERCE | Donation certificate card + TRUE stamp + actions | "VC-2026Q2-128456-SH" |
| 24 | `recycle` | CIRCULAR | Clothing recycle pickup form + 4-node loop diagram | Intake → Resale → Recycle → Reinvest |
| 25 | `campaigns` | COMMUNITY | 1 featured + 3 grid campaign cards | 「春的色彩」200/500 · 87% |
| 26 | `artwork` | COMMUNITY | Artwork submit form + drop zone + guardian consent | "我家的春天" by 林一一 |
| 27 | `vote` | COMMUNITY | Top-3 vote podium + live ticker | "3,419 VOTES · 12,431 voters · 3 days left" |
| 28 | `ai` | COMMUNITY | AI assistant chat w/ 4 real Q&A bubbles | "200/500 件 · 87% · 预计 2026-07-15" |

## Coverage check against `tex/user.tex`

Every user-facing surface listed in the official VICOO user manual is shown in the video:

| tex/user.tex section | Covered in frame(s) |
|---|---|
| 2 storefronts (`/shop`, `/impact/shop`) | 11, 12, 14 |
| Product detail (normal vs impact) | 13, 14 |
| Traceability Globe (immersive 3D) | 15 |
| Timeline + stage-level fields | 16, 17 |
| Cart drawer | 20 |
| Checkout | 21 |
| Order detail | 22 |
| Auth (login + register, profile) | 18, 19 |
| Reviews | 13 |
| AI assistant | 28 |
| Donate + certificate | 6, 23 |
| Clothing recycle | 24 |
| Campaigns (themed) | 25 |
| Artwork submit | 26 |
| Community vote | 27 |
| Three platforms (web + mini program + android) | 7 |

That's **16 of the 16** main user-facing surfaces covered, with 28 scenes pacing the walkthrough.

## Visual identity consistency

Every frame uses the same design language, checked end-to-end:

- **One red bar** at the top of every light scene (8px, `#E60012`) — continuous visual rhythm
- **One Smiley Sans wordmark** in every brand callout (VICOO / UNIQLO)
- **One Uniqlo red `#E60012` accent** on every CTA, badge, progress fill, donate percentage
- **Two background modes** — paper `#F5F0E8` for product surfaces, ink `#0A0A0A` for impact/globe/counter scenes. The transitions between them dissolve, never hard-cut.

## Motion vocabulary

The 28 frames together use these GSAP techniques, in order of frequency:

| Technique | Used in | Count |
|---|---|---|
| Stagger entry (`tl.to(..., {stagger: 0.06-0.15})`) | most frames | ~50 uses |
| `clipPath` wipe (`inset(0 100% 0 0) → 0`) | cover, hero, profile | 4 frames |
| Odometer counter (`gsap.to(obj, {val, onUpdate})`) | hero price, counters, vote, ai | 5 frames |
| `back.out(1.7)` elastic pop | badges, vote buttons, cart badge, cert stamp | 8 frames |
| `expo.out` / `power3.out` for big entrances | h1, wordmark, image | 12 frames |
| `gsap.to(track, {x: '-50%', repeat:-1})` infinite marquee | home, marquee | 2 frames |
| `rotationY/X` 3D tilt | marquee featured card | 1 frame |
| Magnetic button (`x: -3, yoyo: true, repeat: 1`) | cart, donate, cta | 6 frames |
| `scale: 0 → 1` radial reveal (globe nodes, vote podium) | globe, vote | 2 frames |
| `gsap.fromTo(send, {scale:1}, {scale:1.15, yoyo:1, repeat:1})` send button | ai | 1 frame |
| `xPercent / yPercent` slide-out exits | most exits | every frame |

## Reusability

The 28 frame HTMLs are a *design system in code*. To make a new frame:

1. Copy any existing `frames/NN-name.html` as a starting point
2. Replace the content inside `<div class="stage">`
3. Add a node to `project/content-graph.json` with `durationSec`
4. Add a frame entry to `project/project.json`'s `frames[]`
5. Re-run `scripts/render.sh`

Each frame is fully self-contained. No shared CSS, no shared JS modules. The cost of duplication is worth the cost of explicitness when each frame has its own unique layout.

## Where to find what

- **The video** → `videos/vicoo-promo.mp4`
- **Per-frame HTML** (edit any scene) → `frames/NN-name.html`
- **The storyboard graph** → `project/content-graph.json`
- **The render config** (resolution, fps, frame order) → `project/project.json`
- **The cross-dissolve script** → `scripts/xfade-compose.js`
- **The re-render wrapper** → `scripts/render.sh`
- **How it was built** → `docs/methodology.md`
- **When it was built** → `docs/progress.md`
- **What it covers** → this file, `docs/final-deliverable.md`
