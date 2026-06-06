#!/usr/bin/env node
/**
 * Advanced xfade composer with multiple transition types.
 *
 * Features:
 * - Multiple transition types (fade, wipeleft, wipeup, slideleft, circlecrop, etc.)
 * - Section-based transitions (different transitions for different sections)
 * - Audio mixing support
 * - Subtitle overlay support
 * - Progress tracking
 */

const { execSync, execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const FRAMES_DIR = path.join(__dirname, 'frames');
const OUT = path.join(__dirname, '..', 'videos', 'vicoo-promo.mp4');
const AUDIO_DIR = path.join(__dirname, '..', 'audio');
const SUBS_DIR = path.join(__dirname, '..', 'subtitles');

// Transition types for different sections
const TRANSITIONS = {
  // Opening section - dramatic transitions
  OPENING: ['fade', 'wipeleft', 'wipeup', 'fadeblack'],

  // Brand section - elegant transitions
  BRAND: ['fade', 'slideleft', 'smoothleft', 'fadeblack'],

  // Storefront section - smooth transitions
  STOREFRONT: ['fade', 'wipeleft', 'slideright', 'fadeblack'],

  // Traceability section - technical transitions
  TRACEABILITY: ['fade', 'wipeup', 'circlecrop', 'fadeblack'],

  // Auth section - clean transitions
  AUTH: ['fade', 'slideleft', 'fadeblack'],

  // Commerce section - smooth transitions
  COMMERCE: ['fade', 'wipeleft', 'smoothleft', 'fadeblack'],

  // Circular section - circular transitions
  CIRCULAR: ['fade', 'circlecrop', 'fadeblack'],

  // Community section - dynamic transitions
  COMMUNITY: ['fade', 'wipeleft', 'slideleft', 'fadeblack'],

  // Closing section - dramatic transitions
  CLOSING: ['fade', 'wipeup', 'fadeblack']
};

// Frame to section mapping
const FRAME_SECTIONS = {
  'cover_blackred': 'OPENING',
  'story_hook': 'OPENING',
  'header_unfold': 'OPENING',
  'hero_product': 'OPENING',
  'artist_portrait': 'OPENING',
  'uniqlo_partnership': 'OPENING',
  'marquee_strip': 'OPENING',
  'impact_preview': 'OPENING',
  'counters_burst': 'OPENING',
  'donation_panel': 'OPENING',
  'platforms_chip': 'OPENING',
  'web_platform': 'OPENING',
  'android_app': 'OPENING',
  'wechat_mini': 'OPENING',
  'closing_redbar': 'OPENING',

  'brand_meaning': 'BRAND',
  'brand_story': 'BRAND',
  'values_visual': 'BRAND',
  'missions': 'BRAND',
  'tech_stack': 'BRAND',

  'home': 'STOREFRONT',
  'search_filter': 'STOREFRONT',
  'shop_browse': 'STOREFRONT',
  'wishlist_save': 'STOREFRONT',
  'normal_detail': 'STOREFRONT',
  'impact_detail': 'STOREFRONT',
  'reviews': 'STOREFRONT',

  'globe_intro': 'TRACEABILITY',
  'globe_deep_dive': 'TRACEABILITY',
  'timeline': 'TRACEABILITY',
  'material_trace': 'TRACEABILITY',
  'supply_chain_map': 'TRACEABILITY',
  'carbon_footprint': 'TRACEABILITY',

  'login': 'AUTH',
  'register': 'AUTH',
  'profile': 'AUTH',

  'cart': 'COMMERCE',
  'payment_methods': 'COMMERCE',
  'checkout': 'COMMERCE',
  'order_tracking': 'COMMERCE',
  'order': 'COMMERCE',
  'certificate': 'COMMERCE',
  'certificate_detail': 'COMMERCE',
  'donation_detail': 'COMMERCE',

  'recycle': 'CIRCULAR',
  'environmental_impact': 'CIRCULAR',

  'campaigns': 'COMMUNITY',
  'campaign_detail': 'COMMUNITY',
  'artwork': 'COMMUNITY',
  'artwork_gallery': 'COMMUNITY',
  'vote': 'COMMUNITY',
  'ai': 'COMMUNITY',

  'testimonials': 'CLOSING',
  'stats_summary': 'CLOSING',
  'vision': 'CLOSING',
  'cta': 'CLOSING',
  'credits': 'CLOSING'
};

// Audio settings
const BG_MUSIC_PATH = path.join(AUDIO_DIR, 'background.mp3');
const MUSIC_VOLUME = 0.15;
const FADE_IN_DURATION = 2.0;
const FADE_OUT_DURATION = 3.0;

const XFADE_DURATION = 0.45;

const ffprobeDur = (p) => {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim();
  return parseFloat(out);
};

// Get transition type for a frame pair
function getTransition(fromFrame, toFrame) {
  const fromSection = FRAME_SECTIONS[fromFrame] || 'OPENING';
  const toSection = FRAME_SECTIONS[toFrame] || 'OPENING';

  // If sections are different, use a dramatic transition
  if (fromSection !== toSection) {
    return 'fadeblack';
  }

  // Use section-specific transitions
  const sectionTransitions = TRANSITIONS[fromSection] || TRANSITIONS.OPENING;
  return sectionTransitions[Math.floor(Math.random() * sectionTransitions.length)];
}

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

// Build video filter complex with section-based transitions
let filter = '';
let runningOffset = 0;
let lastTag = '0:v';

for (let i = 1; i < inputs.length; i++) {
  const off = runningOffset + inputs[i - 1].dur - XFADE_DURATION;
  const nextTag = i === inputs.length - 1 ? 'vout' : `vt${i}`;

  // Get frame names for section detection
  const fromFrame = path.basename(inputs[i - 1].file, '.mp4');
  const toFrame = path.basename(inputs[i].file, '.mp4');

  // Map frame numbers to node IDs (simplified)
  const frameNodeIds = [
    'cover_blackred', 'story_hook', 'header_unfold', 'hero_product',
    'artist_portrait', 'uniqlo_partnership', 'marquee_strip', 'impact_preview',
    'counters_burst', 'donation_panel', 'platforms_chip', 'web_platform',
    'android_app', 'wechat_mini', 'closing_redbar', 'brand_meaning',
    'brand_story', 'values_visual', 'missions', 'tech_stack',
    'home', 'search_filter', 'shop_browse', 'wishlist_save',
    'normal_detail', 'impact_detail', 'reviews', 'globe_intro',
    'globe_deep_dive', 'timeline', 'material_trace', 'supply_chain_map',
    'carbon_footprint', 'login', 'register', 'profile',
    'cart', 'payment_methods', 'checkout', 'order_tracking',
    'order', 'certificate', 'certificate_detail', 'donation_detail',
    'recycle', 'environmental_impact', 'campaigns', 'campaign_detail',
    'artwork', 'artwork_gallery', 'vote', 'ai',
    'testimonials', 'stats_summary', 'vision', 'cta', 'credits'
  ];

  const fromNodeId = frameNodeIds[parseInt(fromFrame) - 1] || 'unknown';
  const toNodeId = frameNodeIds[parseInt(toFrame) - 1] || 'unknown';

  const transition = getTransition(fromNodeId, toNodeId);

  filter += `[${lastTag}][${i}:v]xfade=transition=${transition}:duration=${XFADE_DURATION}:offset=${off.toFixed(3)}[${nextTag}];`;
  runningOffset = off;
  lastTag = nextTag;
}

filter = filter.slice(0, -1); // trim trailing ;

// Check for audio
const hasAudio = fs.existsSync(BG_MUSIC_PATH);
let audioFilter = '';

if (hasAudio) {
  console.log('background music found:', BG_MUSIC_PATH);

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
console.log('transitions used: fade, wipeleft, wipeup, slideleft, circlecrop, fadeblack');

try {
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  console.log('\n✅ done →', OUT);
  console.log('duration:', totalDur.toFixed(1) + 's');
  if (hasAudio) console.log('audio: background music mixed at', MUSIC_VOLUME * 100 + '% volume');
} catch (err) {
  console.error('\n❌ ffmpeg failed:', err.message);
  process.exit(1);
}
