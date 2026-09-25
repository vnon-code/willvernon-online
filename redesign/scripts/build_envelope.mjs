#!/usr/bin/env node
/**
 * RETIRED (Phase 2b, D-brutalist-grid.md §6): the SignalScope OGL hero this
 * script fed was deleted along with `ogl` and src/data/scope-envelope.json.
 * Kept here only as a record of how that envelope was authored; do not run
 * it and do not resurrect scope-envelope.json without also resurrecting a
 * consumer for it.
 *
 * build_envelope.mjs — bakes a build-time RMS amplitude envelope for the
 * SignalScope idle-mode traces from the real "Catching Flies - Silver
 * Linings (vnon Bootleg)" stems.
 *
 * Usage:
 *   node redesign/scripts/build_envelope.mjs
 *
 * Reads the 5 mp3 stems from public/audio/ (checked-in git-lfs-free audio,
 * see CLAUDE.md — never touch R2), decodes them with the pure-JS/WASM
 * `mpg123-decoder` package (no ffmpeg / no numpy needed in this
 * environment), downsamples each stem to a small RMS envelope, and writes
 * the result to src/data/scope-envelope.json.
 *
 * This script is a one-time authoring step. Its OUTPUT is committed to the
 * repo (src/data/scope-envelope.json); `npm run build` never re-runs it and
 * never decodes audio at build or runtime. Re-run by hand only if the
 * source stems change.
 *
 * Output shape:
 *   {
 *     "track": "Catching Flies - Silver Linings (vnon Bootleg)",
 *     "generatedAt": "<ISO date>",
 *     "points": 128,
 *     "stems": [
 *       { "name": "drums", "file": "...", "duration": 123.4, "envelope": [0..1, ...] },
 *       ...
 *     ]
 *   }
 *
 * BPM/key are included only if found in redesign/content/index.json or
 * music.json's extracted js_data; none were present at authoring time, so
 * they are omitted rather than invented.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MPEGDecoder } from 'mpg123-decoder';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const audioDir = path.join(repoRoot, 'public/audio');
const outFile = path.join(repoRoot, 'src/data/scope-envelope.json');

const POINTS = 128;

const STEMS = [
  { name: 'drums', file: 'Silver Linings Bootleg Drums.mp3' },
  { name: 'bass', file: 'Silver Linings Bootleg Bass 2.mp3' },
  { name: 'melody', file: 'Silver Linings Bootleg Melody.mp3' },
  { name: 'atmos', file: 'Silver Linings Bootleg Atmos.mp3' },
  { name: 'vocals', file: 'Silver Linings Bootleg Vocals 2.mp3' },
];

/** Downsample a mono Float32Array to `points` RMS values, normalised 0..1. */
function rmsEnvelope(mono, points) {
  const windowSize = Math.max(1, Math.floor(mono.length / points));
  const raw = [];
  for (let i = 0; i < points; i++) {
    const start = i * windowSize;
    const end = i === points - 1 ? mono.length : start + windowSize;
    let sumSquares = 0;
    let n = 0;
    for (let j = start; j < end && j < mono.length; j++) {
      const s = mono[j];
      sumSquares += s * s;
      n++;
    }
    raw.push(n > 0 ? Math.sqrt(sumSquares / n) : 0);
  }
  const max = raw.reduce((m, v) => Math.max(m, v), 0) || 1;
  return raw.map((v) => Math.round((v / max) * 1000) / 1000);
}

async function decodeStem(filePath) {
  const bytes = new Uint8Array(await readFile(filePath));
  const decoder = new MPEGDecoder();
  await decoder.ready;
  const { channelData, samplesDecoded, sampleRate } = decoder.decode(bytes);
  decoder.free();

  const channels = channelData.length;
  const mono = new Float32Array(samplesDecoded);
  for (let i = 0; i < samplesDecoded; i++) {
    let sum = 0;
    for (let c = 0; c < channels; c++) sum += channelData[c][i] || 0;
    mono[i] = sum / channels;
  }

  return {
    duration: Math.round((samplesDecoded / sampleRate) * 100) / 100,
    envelope: rmsEnvelope(mono, POINTS),
  };
}

async function main() {
  const stems = [];
  for (const stem of STEMS) {
    const filePath = path.join(audioDir, stem.file);
    process.stdout.write(`decoding ${stem.file} ... `);
    const { duration, envelope } = await decodeStem(filePath);
    stems.push({ name: stem.name, file: `/audio/${stem.file}`, duration, envelope });
    console.log(`ok (${duration}s, ${envelope.length} pts)`);
  }

  const out = {
    track: 'Catching Flies - Silver Linings (vnon Bootleg)',
    generatedAt: new Date().toISOString().slice(0, 10),
    points: POINTS,
    stems,
  };

  const json = JSON.stringify(out);
  await writeFile(outFile, json + '\n', 'utf8');
  const kb = Buffer.byteLength(json, 'utf8') / 1024;
  console.log(`wrote ${outFile} (${kb.toFixed(2)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
