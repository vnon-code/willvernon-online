// Viewport screenshots + a single downscaled contact sheet (the only image meant for review).
// Usage: node screenshots.mjs --out DIR --sheet SHEET.jpg --widths 1440,390 [--scroll] URL...
// Uses the globally installed playwright (browsers in /opt/pw-browsers).
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(execSync("npm root -g").toString().trim() + "/");
const { chromium } = require("playwright");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const out = opt("--out", "shots"), sheet = opt("--sheet", path.join(out, "sheet.jpg"));
const widths = opt("--widths", "1440,390").split(",").map(Number);
const scroll = args.includes("--scroll") && args.splice(args.indexOf("--scroll"), 1);
const urls = args;
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: process.env.PROXY_CA_SPKI ? [`--ignore-certificate-errors-spki-list=${process.env.PROXY_CA_SPKI}`] : [] });
const shots = [];
for (const url of urls) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w > 800 ? 900 : 844 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    const slug = url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").slice(0, 60);
    try {
      await page.goto(url, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(3000);
      const f = path.join(out, `${slug}_${w}.jpg`);
      await page.screenshot({ path: f, type: "jpeg", quality: 60 });
      shots.push({ f, label: `${slug} @${w}` });
      if (scroll) {
        await page.mouse.wheel(0, 1800); await page.waitForTimeout(1500);
        const f2 = path.join(out, `${slug}_${w}_mid.jpg`);
        await page.screenshot({ path: f2, type: "jpeg", quality: 60 });
        shots.push({ f: f2, label: `${slug} @${w} scrolled` });
      }
    } catch (e) { console.error("FAIL", url, w, String(e).slice(0, 120)); }
    await ctx.close();
  }
}
// Contact sheet: grid of thumbnails rendered by the browser itself, ~1400px wide.
const cols = widths.length * (scroll ? 2 : 1) >= 3 ? 4 : 3;
const cells = shots.map(s => `<figure><img src="data:image/jpeg;base64,${fs.readFileSync(s.f).toString("base64")}"><figcaption>${s.label}</figcaption></figure>`).join("");
const p = await (await browser.newContext({ viewport: { width: 1400, height: 800 } })).newPage();
await p.setContent(`<style>body{margin:0;background:#111;color:#ccc;font:11px monospace;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px}figure{margin:0}img{width:100%;max-height:420px;object-fit:cover;object-position:top;display:block}</style>${cells}`);
await p.screenshot({ path: sheet, type: "jpeg", quality: 55, fullPage: true });
await browser.close();
console.log(`${shots.length} shots, sheet: ${sheet} (${Math.round(fs.statSync(sheet).size / 1024)} KB)`);
