#!/usr/bin/env node
// Bakes static media derivatives for v2 (dev-only; never runs in Workers Builds).
//   1. Posters: first-second frame of every R2 video referenced in src/content/*.json
//      -> public/img/posters/<name>.webp (1280w)
//   2. Derivatives: local images in src/content/*.json over 500 KB (PNG/JPG) -> webp
//      under 500 KB at <= 2400 px wide; animated GIFs over 2 MB -> looping webm + poster.
//   3. Manifest src/data/media.json: { posters: {url: {src,w,h}}, images: {path: {w,h,derived?}},
//      gifs: {path: {webm, poster, w, h}} } so components can set width/height/poster.
// Originals are never modified or removed; their URLs stay in the DOM (parity).
// Tools: npm i --prefix /tmp/mediatools sharp ffmpeg-static  (MEDIA_TOOLS=/tmp/mediatools)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TOOLS = process.env.MEDIA_TOOLS || '/tmp/mediatools';
const require = createRequire(path.join(TOOLS, 'package.json'));
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');

const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const PUB = path.join(ROOT, 'public');
const OUT_MANIFEST = path.join(ROOT, 'src/data/media.json');
const text = fs.readdirSync(path.join(ROOT, 'src/content'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => fs.readFileSync(path.join(ROOT, 'src/content', f), 'utf8'))
  .join('\n');

const prev = fs.existsSync(OUT_MANIFEST) ? JSON.parse(fs.readFileSync(OUT_MANIFEST, 'utf8')) : {};
const manifest = { posters: prev.posters || {}, images: {}, gifs: prev.gifs || {} };

const slug = (s) => decodeURIComponent(s).replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

// 1. posters
const videos = [...new Set(text.match(/https:\/\/assets\.willvernon\.online\/[^"\\<>]+?\.(?:mp4|webm|mov)/g) || [])];
fs.mkdirSync(path.join(PUB, 'img/posters'), { recursive: true });
for (const url of videos) {
  const name = slug(url.split('/').slice(-2).join('-'));
  const rel = `/img/posters/${name}.webp`;
  const dest = path.join(PUB, rel);
  if (!fs.existsSync(dest)) {
    const tmp = `/tmp/poster-${name}.png`;
    const vid = `/tmp/poster-${name}.mp4`;
    // ffmpeg-static can't do HTTPS through the proxy; fetch with curl (proxy CA aware) first.
    execFileSync('curl', ['-sSfL', '--retry', '3', '-o', vid, encodeURI(url)], { timeout: 600000 });
    try {
      execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '1', '-i', vid, '-frames:v', '1', tmp], { timeout: 120000 });
    } catch {
      execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', vid, '-frames:v', '1', tmp], { timeout: 120000 });
    }
    fs.rmSync(vid);
    await sharp(tmp).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 72 }).toFile(dest);
    fs.rmSync(tmp);
  }
  const m = await sharp(dest).metadata();
  manifest.posters[url] = { src: rel, w: m.width, h: m.height };
  console.log('poster', rel, m.width, m.height);
}

// 2. local images
const locals = [...new Set((text.match(/(?<=["'(\s])\/?img\/[^"\\\s)]+\.(?:png|jpe?g|webp|gif|svg)/gi) || []).map((u) => '/' + u.replace(/^\//, '')))];
fs.mkdirSync(path.join(PUB, 'img/derived'), { recursive: true });
for (const u of locals) {
  const file = path.join(PUB, decodeURIComponent(u));
  if (!fs.existsSync(file)) { console.warn('missing', u); continue; }
  const size = fs.statSync(file).size;
  const ext = path.extname(file).toLowerCase();
  if (ext === '.svg') continue;
  const meta = await sharp(file, { animated: false }).metadata();
  const entry = { w: meta.width, h: meta.height, bytes: size };
  if (ext === '.gif' && size > 2_000_000) {
    const base = slug(u.replace(/^\/img\//, ''));
    const webm = `/img/derived/${base}.webm`;
    const poster = `/img/derived/${base}-poster.webp`;
    if (!fs.existsSync(path.join(PUB, webm))) {
      execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', file, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(min(iw\\,1600)/2)*2:-2', path.join(PUB, webm)], { timeout: 600000 });
      await sharp(file, { animated: false }).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(PUB, poster));
    }
    manifest.gifs[u] = { webm, poster, w: meta.width, h: meta.height };
    console.log('gif', u, '->', webm, fs.statSync(path.join(PUB, webm)).size);
  } else if (size > 500_000 && ext !== '.gif') {
    const base = slug(u.replace(/^\/img\//, ''));
    const rel = `/img/derived/${base}.webp`;
    const dest = path.join(PUB, rel);
    if (!fs.existsSync(dest)) {
      for (const [w, q] of [[2400, 70], [2000, 64], [1600, 60], [1280, 56]]) {
        await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality: q }).toFile(dest);
        if (fs.statSync(dest).size < 480_000) break;
      }
    }
    const dm = await sharp(dest).metadata();
    entry.derived = { src: rel, w: dm.width, h: dm.height, bytes: fs.statSync(dest).size };
    console.log('derived', u, '->', rel, entry.derived.bytes);
  }
  manifest.images[u] = entry;
}
fs.mkdirSync(path.dirname(OUT_MANIFEST), { recursive: true });
fs.writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
console.log(`posters ${Object.keys(manifest.posters).length}, images ${Object.keys(manifest.images).length}, gifs ${Object.keys(manifest.gifs).length}`);
