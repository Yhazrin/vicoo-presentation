# Changelog

All notable changes to the VICOO Promo Video project will be documented in this file.

## [2.0.0] - 2026-06-06

### Added
- **56 HTML frames** (expanded from 28) covering all user-facing surfaces
- **8 new frame types**: Artist Portrait, UNIQLO Partnership, Impact Preview, Web Platform, Android App, WeChat Mini Program, Reviews, Certificate Detail
- **Audio mixing support** via `xfade-compose-audio.js`
- **Multi-language subtitles** (English, Chinese, Japanese, Korean)
- **Performance-optimized render pipeline** via `render-optimized.sh`
- **Analytics tracking system** via `analytics.js`
- **Advanced xfade composer** with section-based transitions via `xfade-compose-advanced.js`
- **Comprehensive optimization report** in `docs/optimization-report.md`

### Enhanced
- **All 56 frames** optimized with advanced GSAP animations:
  - clipPath wipes for image reveals
  - Shine sweep effects
  - Elastic pop animations (back.out(2))
  - Pulse ring effects on globe nodes
  - Orbit rotation animations
  - Glow effects with radial gradients
  - Particle floating animations
  - Staggered scale transitions
  - Magnetic micro-interactions
  - Button sweep effects
  - Infinite ticker animations
  - Card hover effects

### Changed
- **Duration**: 143s → 300s (5:00)
- **Resolution**: 2560×1440 @ 60fps maintained
- **Frame count**: 28 → 56
- **Sections**: 8 → 9 (added CIRCULAR section)

### Technical
- Updated `content-graph.json` with 56 nodes + 55 edges
- Updated `project.json` with 56 frame entries
- Added render progress tracking with ETA
- Added incremental rendering support
- Added section-based transition mapping

## [1.0.0] - 2026-06-05

### Added
- Initial 28-frame promotional video
- HTML-to-video pipeline using html-video
- GSAP 3.14 animations
- Smiley Sans brand font
- Unsplash product imagery
- ffmpeg xfade cross-dissolve transitions
- 2K@60fps output

### Technical
- Self-contained HTML frames (no build step)
- 1920×1080 design scaled to 2560×1440
- GSAP timeline animations
- clipPath wipe transitions
- Odometer counter animations
- Magnetic button effects

---

## Version History

| Version | Date | Frames | Duration | Key Features |
|---------|------|--------|----------|--------------|
| 2.0.0 | 2026-06-06 | 56 | 5:00 | Audio, 4 languages, analytics, advanced transitions |
| 1.0.0 | 2026-06-05 | 28 | 2:23 | Initial release, GSAP animations, 2K@60fps |

---

*For detailed commit history, see [GitHub](https://github.com/Yhazrin/vicoo-presentation/commits/main)*
