#!/usr/bin/env node
/**
 * Compose per-frame MP4s into the final video using ffmpeg xfade for smooth cross-dissolves.
 * Auto-discovers all frames/NN.mp4 in the frames dir and outputs to videos/vicoo-promo.mp4
 */

const { execSync, execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const FRAMES_DIR = path.join(__dirname, 'frames');
const OUT = path.join(__dirname, '..', '..', '..', '..', '..', 'videos', 'vicoo-promo.mp4');
const XFADE_DURATION = 0.45; // seconds
const TRANSITION = 'fade';

const ffprobeDur = (p) => {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim();
  return parseFloat(out);
};

const files = fs.readdirSync(FRAMES_DIR)
  .filter(f => /^\d+\.mp4$/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));
const inputs = files.map(f => {
  const p = path.join(FRAMES_DIR, f);
  return { file: p, dur: ffprobeDur(p) };
});

console.log('per-frame durations:');
inputs.forEach((inp, i) => console.log(`  ${i+1}: ${inp.dur.toFixed(3)}s`));

// Compute output timeline offsets
const totalDur = inputs.reduce((s, x) => s + x.dur, 0) - XFADE_DURATION * (inputs.length - 1);
console.log(`total output duration: ${totalDur.toFixed(3)}s (with ${XFADE_DURATION}s xfade between each pair)`);

// Build filter complex
let filter = '';
let runningOffset = 0;
let lastTag = '0:v';
for (let i = 1; i < inputs.length; i++) {
  const off = runningOffset + inputs[i - 1].dur - XFADE_DURATION;
  const nextTag = i === inputs.length - 1 ? 'vout' : `vt${i}`;
  filter += `[${lastTag}][${i}:v]xfade=transition=${TRANSITION}:duration=${XFADE_DURATION}:offset=${off.toFixed(3)}[${nextTag}];`;
  runningOffset = off;
  lastTag = nextTag;
}
filter = filter.slice(0, -1); // trim trailing ;

// Build command
const args = [];
inputs.forEach(inp => args.push('-i', inp.file));
args.push(
  '-filter_complex', filter,
  '-map', '[vout]',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  '-y',
  OUT
);

console.log('running ffmpeg xfade composite...');
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('done → ' + OUT);
