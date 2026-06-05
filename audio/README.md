# Audio Setup

Place your background music file here as `background.mp3`.

## Recommended Audio

- **Format**: MP3 or WAV
- **Duration**: 5+ minutes (will be looped if shorter)
- **Style**: Ambient, cinematic, or lo-fi background music
- **Volume**: Will be mixed at 15% volume by default

## Free Music Sources

- [Pixabay Music](https://pixabay.com/music/) — Royalty-free
- [Free Music Archive](https://freemusicarchive.org/) — Creative Commons
- [YouTube Audio Library](https://studio.youtube.com/channel/audio) — Free for YouTube

## Usage

```bash
# With audio
node scripts/xfade-compose-audio.js

# Without audio (original behavior)
node scripts/xfade-compose.js
```

## Audio Settings

Edit `scripts/xfade-compose-audio.js` to adjust:
- `MUSIC_VOLUME` — Background music volume (0-1, default: 0.15)
- `FADE_IN_DURATION` — Fade in at start (default: 2.0s)
- `FADE_OUT_DURATION` — Fade out at end (default: 3.0s)
