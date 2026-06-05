#!/usr/bin/env bash
# Re-render the VICOO promo from source.
#
# Prerequisites:
#   1. Clone & build the html-video monorepo:
#        git clone https://github.com/nexu-io/html-video.git
#        cd html-video && pnpm install && pnpm -r build
#   2. Copy the project into the html-video project store:
#        cp -r project/ <html-video>/.html-video/projects/proj_6ee4e1be-bbf/
#      (the directory is created by html-video on first project-create)
#   3. ffmpeg + chromium (playwright bundles) must be on PATH.
#
# Usage:
#   ./scripts/render.sh           # full pipeline (~6-8 min on M-series Mac)
#   ./scripts/render.sh frames    # only render per-frame MP4s (~5 min)
#   ./scripts/render.sh xfade     # only run xfade composite on existing per-frame MP4s (~30s)
#   ./scripts/render.sh audio     # run xfade with audio mixing (~30s)
#   ./scripts/render.sh subs      # run xfade with subtitles (~30s)

set -euo pipefail

# Resolve the repo root (one level up from this script)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HTML_VIDEO="${HTML_VIDEO:-/Users/yanghaoze/Desktop/PROJECT/VICOO-esp/tools/html-video}"
PROJ_DIR="$HTML_VIDEO/.html-video/projects/proj_6ee4e1be-bbf"
CLI="$HTML_VIDEO/packages/cli/dist/bin.js"

phase="${1:-all}"

# Sync source into the html-video project
sync_sources() {
  echo "→ syncing frames/, project.json, content-graph.json into $PROJ_DIR"
  mkdir -p "$PROJ_DIR/frames"
  cp "$REPO_ROOT/frames/"*.html "$REPO_ROOT/frames/"*.woff2 "$PROJ_DIR/frames/" 2>/dev/null || true
  cp "$REPO_ROOT/project/content-graph.json" "$PROJ_DIR/content-graph.json"
  cp "$REPO_ROOT/project/project.json" "$PROJ_DIR/project.json"
}

# Render per-frame MP4s
render_frames() {
  echo "→ rendering 56 per-frame MP4s at 2560x1440@60fps"
  rm -f "$PROJ_DIR/frames/"*.mp4 "$PROJ_DIR/frames/concat.txt"
  cd "$HTML_VIDEO"
  "$CLI" project-render proj_6ee4e1be-bbf --output "$PROJ_DIR/../tmp.mp4" --stream-progress
  echo "→ per-frame MP4s ready in $PROJ_DIR/frames/"
}

# Cross-dissolve composite (video only)
composite_xfade() {
  echo "→ running ffmpeg xfade composite (video only)"
  cp "$REPO_ROOT/scripts/xfade-compose.js" "$PROJ_DIR/xfade-compose.js"
  cd "$PROJ_DIR"
  node xfade-compose.js
  copy_output
}

# Cross-dissolve composite with audio
composite_audio() {
  echo "→ running ffmpeg xfade composite with audio"
  cp "$REPO_ROOT/scripts/xfade-compose-audio.js" "$PROJ_DIR/xfade-compose-audio.js"
  mkdir -p "$PROJ_DIR/audio" "$PROJ_DIR/subtitles"
  cp "$REPO_ROOT/audio/"* "$PROJ_DIR/audio/" 2>/dev/null || true
  cp "$REPO_ROOT/subtitles/"* "$PROJ_DIR/subtitles/" 2>/dev/null || true
  cd "$PROJ_DIR"
  node xfade-compose-audio.js
  copy_output
}

# Copy output to repo
copy_output() {
  # Try multiple possible output locations
  for src in "$PROJ_DIR/../vicoo-promo.mp4" "$PROJ_DIR/vicoo-promo.mp4"; do
    if [ -f "$src" ]; then
      cp "$src" "$REPO_ROOT/videos/vicoo-promo.mp4"
      rm -f "$PROJ_DIR/../tmp.mp4"
      echo "✓ final video → $REPO_ROOT/videos/vicoo-promo.mp4"
      return 0
    fi
  done
  echo "⚠ output not found, check ffmpeg logs"
  return 1
}

case "$phase" in
  frames)
    sync_sources
    render_frames
    ;;
  xfade)
    composite_xfade
    ;;
  audio)
    composite_audio
    ;;
  all)
    sync_sources
    render_frames
    # Use audio composer if background music exists
    if [ -f "$REPO_ROOT/audio/background.mp3" ]; then
      echo "→ background music detected, using audio composer"
      composite_audio
    else
      echo "→ no background music, using video-only composer"
      composite_xfade
    fi
    ;;
  *)
    echo "Usage: $0 [all|frames|xfade|audio]"
    echo ""
    echo "  all     - Full pipeline: sync + render frames + composite"
    echo "  frames  - Only render per-frame MP4s"
    echo "  xfade   - Only run xfade composite (video only)"
    echo "  audio   - Run xfade composite with audio mixing"
    exit 1
    ;;
esac
