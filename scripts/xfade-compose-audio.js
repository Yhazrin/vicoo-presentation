#!/usr/bin/env node
/**
 * Enhanced xfade composer with audio support.
 * Composes per-frame MP4s into the final video with:
 * - Smooth cross-dissolve transitions
 * - Background music mixing
 * - Optional English subtitles
 */

const { execSync, execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const FRAMES_DIR = path.join(__dirname, 'frames');
const OUT = path.join(__dirname, '..', 'videos', 'vicoo-promo.mp4');
const AUDIO_DIR = path.join(__dirname, '..', 'audio');
const SUBS_DIR = path.join(__dirname, '..', 'subtitles');
const XFADE_DURATION = 0.45;
const TRANSITION = 'fade';

// Audio settings
const BG_MUSIC_PATH = path.join(AUDIO_DIR, 'background.mp3');
const MUSIC_VOLUME = 0.15; // Background music volume (0-1)
const FADE_IN_DURATION = 2.0; // Music fade in at start
const FADE_OUT_DURATION = 3.0; // Music fade out at end

const ffprobeDur = (p) => {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim();
  return parseFloat(out);
};

// Discover frame files
const files = fs.readdirSync(FRAMES_DIR)
  .filter(f => /^\d+\.mp4$/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));

if (files.length === 0) {
  console.error('No frame MP4s found in', FRAMES_DIR);
  process.exit(1);
}

const inputs = files.map(f => {
  const p = path.join(FRAMES_DIR, f);
  return { file: p, dur: ffprobeDur(p) };
});

console.log('per-frame durations:');
inputs.forEach((inp, i) => console.log(`  ${i + 1}: ${inp.dur.toFixed(3)}s`));

// Compute total duration
const totalDur = inputs.reduce((s, x) => s + x.dur, 0) - XFADE_DURATION * (inputs.length - 1);
console.log(`total output duration: ${totalDur.toFixed(3)}s`);

// Build video filter complex
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

// Check for audio
const hasAudio = fs.existsSync(BG_MUSIC_PATH);
let audioFilter = '';

if (hasAudio) {
  console.log('background music found:', BG_MUSIC_PATH);

  // Audio filter: fade in, volume, fade out
  const fadeOutStart = totalDur - FADE_OUT_DURATION;
  audioFilter = `[${inputs.length}:a]volume=${MUSIC_VOLUME},afade=t=in:st=0:d=${FADE_IN_DURATION},afade=t=out:st=${fadeOutStart.toFixed(1)}:d=${FADE_OUT_DURATION}[aout]`;

  filter += ';' + audioFilter;
} else {
  console.log('no background music found, outputting video only');
  console.log('to add music, place background.mp3 in:', AUDIO_DIR);
}

// Check for subtitles
const subsPath = path.join(SUBS_DIR, 'english.srt');
const hasSubs = fs.existsSync(subsPath);

if (hasSubs) {
  console.log('subtitles found:', subsPath);
  // Add subtitle filter
  filter += `;[vout]subtitles='${subsPath.replace(/\\/g, '/').replace(/:/g, '\\:')}':force_style='FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2'[vout]`;
}

// Remove trailing semicolons
filter = filter.replace(/;+$/, '');

// Build command
const args = [];
inputs.forEach(inp => args.push('-i', inp.file));

if (hasAudio) {
  args.push('-i', BG_MUSIC_PATH);
}

args.push('-filter_complex', filter);
args.push('-map', '[vout]');

if (hasAudio) {
  args.push('-map', '[aout]');
}

args.push(
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-y',
  OUT
);

console.log('\nrunning ffmpeg xfade composite' + (hasAudio ? ' with audio' : '') + '...');
console.log('command:', 'ffmpeg', args.slice(0, 10).join(' '), '...');

try {
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  console.log('\n✅ done →', OUT);
  console.log('duration:', totalDur.toFixed(1) + 's');
  if (hasAudio) console.log('audio: background music mixed at', MUSIC_VOLUME * 100 + '% volume');
} catch (err) {
  console.error('\n❌ ffmpeg failed:', err.message);
  process.exit(1);
}
