#!/usr/bin/env node
/**
 * VICOO Promo Video Analytics System
 *
 * Tracks viewer engagement metrics for each frame:
 * - Frame completion rates
 * - Drop-off points
 * - Replay statistics
 * - Average watch time per frame
 *
 * Usage:
 *   node scripts/analytics.js --generate-report
 *   node scripts/analytics.js --track-event <event_type> <frame_id> <data>
 */

const fs = require('fs');
const path = require('path');

const ANALYTICS_DIR = path.join(__dirname, '..', 'analytics');
const EVENTS_FILE = path.join(ANALYTICS_DIR, 'events.jsonl');
const REPORT_FILE = path.join(ANALYTICS_DIR, 'report.md');

// Ensure analytics directory exists
if (!fs.existsSync(ANALYTICS_DIR)) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
}

// Event types
const EVENT_TYPES = {
  FRAME_START: 'frame_start',
  FRAME_COMPLETE: 'frame_complete',
  FRAME_DROP: 'frame_drop',
  VIDEO_START: 'video_start',
  VIDEO_COMPLETE: 'video_complete',
  REPLAY: 'replay',
  SHARE: 'share',
  CLICK: 'click'
};

// Track an event
function trackEvent(eventType, frameId, data = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    frameId: frameId,
    data: data
  };

  fs.appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');
  console.log(`[Analytics] ${eventType}: ${frameId}`, data);
}

// Read all events
function readEvents() {
  if (!fs.existsSync(EVENTS_FILE)) {
    return [];
  }

  const content = fs.readFileSync(EVENTS_FILE, 'utf-8');
  return content.trim().split('\n').filter(Boolean).map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

// Generate analytics report
function generateReport() {
  const events = readEvents();

  if (events.length === 0) {
    console.log('No analytics data found. Start tracking events first.');
    return;
  }

  // Calculate metrics
  const frameMetrics = {};
  const videoStarts = events.filter(e => e.type === EVENT_TYPES.VIDEO_START).length;
  const videoCompletes = events.filter(e => e.type === EVENT_TYPES.VIDEO_COMPLETE).length;
  const replays = events.filter(e => e.type === EVENT_TYPES.REPLAY).length;
  const shares = events.filter(e => e.type === EVENT_TYPES.SHARE).length;

  // Per-frame metrics
  events.forEach(event => {
    if (!frameMetrics[event.frameId]) {
      frameMetrics[event.frameId] = {
        starts: 0,
        completes: 0,
        drops: 0,
        totalWatchTime: 0
      };
    }

    const metrics = frameMetrics[event.frameId];

    switch (event.type) {
      case EVENT_TYPES.FRAME_START:
        metrics.starts++;
        break;
      case EVENT_TYPES.FRAME_COMPLETE:
        metrics.completes++;
        break;
      case EVENT_TYPES.FRAME_DROP:
        metrics.drops++;
        break;
    }
  });

  // Calculate completion rates
  const frameCompletionRates = {};
  Object.keys(frameMetrics).forEach(frameId => {
    const metrics = frameMetrics[frameId];
    if (metrics.starts > 0) {
      frameCompletionRates[frameId] = (metrics.completes / metrics.starts * 100).toFixed(1);
    }
  });

  // Find drop-off points
  const dropOffPoints = Object.entries(frameMetrics)
    .filter(([_, m]) => m.drops > 0)
    .sort((a, b) => b[1].drops - a[1].drops)
    .slice(0, 5);

  // Generate report
  const report = `# VICOO Promo Video Analytics Report

Generated: ${new Date().toISOString()}

## Overview

| Metric | Value |
|--------|-------|
| Total Events | ${events.length} |
| Video Starts | ${videoStarts} |
| Video Completions | ${videoCompletes} |
| Completion Rate | ${videoStarts > 0 ? (videoCompletes / videoStarts * 100).toFixed(1) : 0}% |
| Replays | ${replays} |
| Shares | ${shares} |

## Frame Completion Rates

| Frame ID | Completion Rate | Starts | Completes | Drops |
|----------|----------------|--------|-----------|-------|
${Object.entries(frameCompletionRates)
  .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
  .map(([id, rate]) => {
    const m = frameMetrics[id];
    return `| ${id} | ${rate}% | ${m.starts} | ${m.completes} | ${m.drops} |`;
  })
  .join('\n')}

## Top Drop-off Points

${dropOffPoints.length > 0 ? dropOffPoints.map(([id, m]) => {
  return `- **${id}**: ${m.drops} drops (${((m.drops / m.starts) * 100).toFixed(1)}% drop rate)`;
}).join('\n') : 'No significant drop-off points detected.'}

## Recommendations

${generateRecommendations(frameCompletionRates, dropOffPoints)}

## Event Distribution

${Object.entries(
  events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {})
).map(([type, count]) => `- **${type}**: ${count} events`).join('\n')}
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`\n[Analytics] Report generated: ${REPORT_FILE}`);
  console.log(report);
}

// Generate recommendations based on data
function generateRecommendations(completionRates, dropOffPoints) {
  const recommendations = [];

  // Check for low completion rates
  const lowCompletionFrames = Object.entries(completionRates)
    .filter(([_, rate]) => parseFloat(rate) < 70)
    .map(([id, _]) => id);

  if (lowCompletionFrames.length > 0) {
    recommendations.push(`### Low Completion Frames
The following frames have completion rates below 70%:
${lowCompletionFrames.map(f => `- ${f}`).join('\n')}

**Recommendation**: Review these frames for:
- Content engagement (is it compelling enough?)
- Duration (is it too long?)
- Visual quality (is it visually appealing?)
- Transitions (are they smooth?)`);
  }

  // Check for high drop-off points
  if (dropOffPoints.length > 0) {
    recommendations.push(`### High Drop-off Points
${dropOffPoints.slice(0, 3).map(([id, m]) => {
  return `- **${id}**: ${m.drops} drops`;
}).join('\n')}

**Recommendation**: These frames may need:
- More engaging content
- Better animations
- Shorter duration
- Smoother transitions`);
  }

  // General recommendations
  recommendations.push(`### General Optimization Tips
1. **Audio**: Add background music to increase engagement
2. **Transitions**: Use smooth xfade transitions between frames
3. **Animations**: Add micro-interactions and hover effects
4. **Content**: Ensure each frame tells a clear story
5. **Duration**: Keep frames between 4-6 seconds for optimal engagement`);

  return recommendations.join('\n\n');
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--generate-report')) {
  generateReport();
} else if (args.includes('--track-event')) {
  const eventIndex = args.indexOf('--track-event');
  const eventType = args[eventIndex + 1];
  const frameId = args[eventIndex + 2];
  const data = args[eventIndex + 3] ? JSON.parse(args[eventIndex + 3]) : {};

  if (!eventType || !frameId) {
    console.error('Usage: node analytics.js --track-event <event_type> <frame_id> [data]');
    process.exit(1);
  }

  trackEvent(eventType, frameId, data);
} else if (args.includes('--list-events')) {
  const events = readEvents();
  console.log(`Total events: ${events.length}`);
  events.slice(-10).forEach(e => {
    console.log(`  ${e.timestamp} - ${e.type}: ${e.frameId}`);
  });
} else {
  console.log('VICOO Promo Video Analytics System');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/analytics.js --generate-report    Generate analytics report');
  console.log('  node scripts/analytics.js --track-event <type> <frame_id> [data]');
  console.log('  node scripts/analytics.js --list-events        List recent events');
  console.log('');
  console.log('Event Types:');
  Object.entries(EVENT_TYPES).forEach(([key, value]) => {
    console.log(`  ${value}`);
  });
}
