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
  cp "$REPO_ROOT/project/content-graph.json" "$REPO_DIR/project.json" "$PROJ_DIR/" 2>/dev/null || true
  cp "$REPO_ROOT/project/content-graph.json" "$PROJ_DIR/content-graph.json"
  cp "$REPO_ROOT/project/project.json" "$PROJ_DIR/project.json"
}

# Render per-frame MP4s
render_frames() {
  echo "→ rendering 28 per-frame MP4s at 2560x1440@60fps"
  rm -f "$PROJ_DIR/frames/"*.mp4 "$PROJ_DIR/frames/concat.txt"
  cd "$HTML_VIDEO"
  "$CLI" project-render proj_6ee4e1be-bbf --output "$PROJ_DIR/../tmp.mp4" --stream-progress
  echo "→ per-frame MP4s ready in $PROJ_DIR/frames/"
}

# Cross-dissolve composite
composite_xfade() {
  echo "→ running ffmpeg xfade composite"
  cp "$REPO_ROOT/scripts/xfade-compose.js" "$PROJ_DIR/xfade-compose.js"
  cd "$PROJ_DIR"
  node xfade-compose.js
  cp "$PROJ_DIR/../vicoo-promo.mp4" "$REPO_ROOT/videos/vicoo-promo.mp4" 2>/dev/null || \
    node -e "const fs=require('fs');const path=require('path');const f=path.join('$PROJ_DIR/..','vicoo-promo.mp4');if(fs.existsSync(f))fs.copyFileSync(f,path.join('$REPO_ROOT/videos','vicoo-promo.mp4'));"
  rm -f "$PROJ_DIR/../tmp.mp4"
  echo "✓ final video → $REPO_ROOT/videos/vicoo-promo.mp4"
}

case "$phase" in
  frames)
    sync_sources
    render_frames
    ;;
  xfade)
    composite_xfade
    ;;
  all)
    sync_sources
    render_frames
    composite_xfade
    ;;
  *)
    echo "Usage: $0 [all|frames|xfade]"
    exit 1
    ;;
esac
