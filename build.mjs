// Build the published page from the readable source.
//
//   node build.mjs
//
// Reads index.html (the source you edit) and writes dist/index.html, with the
// inline CSS and both inline scripts minified by esbuild — variable names
// mangled, comments and whitespace gone — so the deployed page is about a
// third smaller. The source of truth stays index.html.
//
// esbuild is fetched on demand through `npx --yes esbuild`; nothing is added to
// the repository or committed.

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SRC = 'index.html', OUT_DIR = 'dist', OUT = OUT_DIR + '/index.html';

function esbuild(code, args) {
  const r = spawnSync('npx', ['--yes', 'esbuild', ...args], { input: code, encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) { process.stderr.write(r.stderr || ''); throw new Error('esbuild failed: ' + args.join(' ')); }
  return r.stdout.replace(/\n$/, '');
}
const minCss = (c) => esbuild(c, ['--minify', '--loader=css']);
const minJs = (c, esm) => esbuild(c, ['--minify', '--loader=js', ...(esm ? ['--format=esm'] : [])]);

// Replace the inner text of the first <tag ...>…</tag> block, found by its opening marker.
function replaceBlock(html, openMarker, closeTag, transform) {
  const open = html.indexOf(openMarker);
  if (open < 0) throw new Error('block not found: ' + openMarker);
  const inStart = html.indexOf('>', open) + 1;
  const inEnd = html.indexOf(closeTag, inStart);
  if (inEnd < 0) throw new Error('close not found for: ' + openMarker);
  return html.slice(0, inStart) + transform(html.slice(inStart, inEnd)) + html.slice(inEnd);
}

let html = readFileSync(SRC, 'utf8');

// 1. inline stylesheet
html = replaceBlock(html, '<style>', '</style>', minCss);

// 2. import map: valid JSON, so just drop the whitespace
html = replaceBlock(html, '<script type="importmap">', '</script>', (j) => JSON.stringify(JSON.parse(j)));

// 3. the two <script> bodies after it: the small classic one, then the module.
//    Walk the remaining scripts in order; skip the importmap already handled.
let from = html.indexOf('</script>', html.indexOf('<script type="importmap">')) + '</script>'.length;
for (;;) {
  const open = html.indexOf('<script', from);
  if (open < 0) break;
  const inStart = html.indexOf('>', open) + 1;
  const inEnd = html.indexOf('</script>', inStart);
  const tag = html.slice(open, inStart);
  const body = html.slice(inStart, inEnd);
  const out = minJs(body, /type="module"/.test(tag));
  html = html.slice(0, inStart) + out + html.slice(inEnd);
  from = inStart + out.length + '</script>'.length;
}

// collapse the blank lines between the <head>/<body> tags; leave text nodes alone
html = html.replace(/>\n\s+</g, '><').replace(/\n{2,}/g, '\n');

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html);
copyFileSync('og.jpg', OUT_DIR + '/og.jpg');

// The one server-side piece: the tally for the last leaf. Vercel turns any file under api/ into a function.
mkdirSync(OUT_DIR + '/api', { recursive: true });
copyFileSync('api/vote.js', OUT_DIR + '/api/vote.js');

// Carry the Vercel project link into dist, so `vercel deploy dist` publishes to
// the same davinci-mechanics project instead of trying to create a new one.
if (existsSync('.vercel/project.json')) {
  mkdirSync(OUT_DIR + '/.vercel', { recursive: true });
  copyFileSync('.vercel/project.json', OUT_DIR + '/.vercel/project.json');
}

const before = readFileSync(SRC).length, after = Buffer.byteLength(html);
console.log(`${OUT}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB (${(100 - after / before * 100).toFixed(0)}% smaller)`);
