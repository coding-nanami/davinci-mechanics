# Da Vinci's Living Codex

Two of Leonardo da Vinci's machines, the ornithopter and the self-propelled cart, drawn in ink on a notebook leaf and rebuilt in timber, in the browser. Everything is generated in code: the geometry, the paper, the ink lines and the sound. There are no image, model or audio files.

Live: https://davinci-mechanics.vercel.app

## Run it

Open `index.html` in a browser. It is one file with no build step. It needs a network connection the first time, to fetch three.js (pinned to 0.170.0 on jsDelivr) and the IM Fell English fonts (Google Fonts, SIL Open Font Licence).

## What you can do on the page

The sheet lies on a walnut desk. The instruments lie on the strip of desk below the sheet, so nothing covers the drawing.

- Scroll, hold Space, or turn the brass crank (bottom left) to drive the machine. It coasts when you stop. Tap the crank to stop the machine, tap again to start it.
- Drag the brass rider on the lower edge of the sheet to move the border between the ink sketch and the timber model. Push it to either edge for all ink or all timber; two quick taps put it back in the middle. With a mouse you can also drag the line itself.
- Slide the brass rule (bottom right) to pull the machine apart while it keeps moving.
- Hover a part to see its name, click or tap it for a note written on the page.
- Drag the hand mirror over the mirror writing to read it. Click the mirror to turn the whole page.
- Top right: `Sound` turns on the synthesised audio.

Keys: `1` `2` `3` ink / half / timber, `M` mirror, `S` sound, `+` `-` zoom, `Esc` close a note.

On a phone the same objects are sized for a thumb. On a tall screen the machine starts three-quarter on so both wings fit, the mirror writing and the mirror move to the foot of the sheet, part notes are written across the page under the machine, and the names in the pulled-apart view go in two columns down the margins.

## Maker tools

Visitors do not see the recording tools. Add `#maker=1` to the address to get them (`#maker=0` hides them again; the setting is not stored):

- `Record` (top right) opens a drawer: Workbench / Cinematic mode, the 20 s story and the 15 s looping cut, recording frames (9:16, 1:1, 16:9) and a clean frame.
- A speed plaque with an AUTO switch beside the crank, and an INK / HALF / TIMBER plate.
- Extra keys: `R` record drawer, `H` clean frame, `C` captions, `A` auto-drive.

An address that already asks for a recording state (`mode`, `preset`, `ar`, `clean`, `rec` or `t` in the hash) turns the maker tools on by itself, so old recording links keep working.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. This is the source; edit it directly. |
| `build.mjs` | Build step: minifies the inline CSS and scripts into `dist/index.html` for publishing. |
| `og.jpg` | Preview image for link cards. |
| `index-v1.html` | The first version of this page, kept for comparison. |
| `cart-original.html` | The cart-only page the project started from. |
| `compare.html`, `compare/` | Drag-to-compare screenshots of the first version against the second. |
| `compare-v3.html`, `compare/v3/` | Drag-to-compare screenshots of the second version against the current one (phone layout, desk strip, rider). |

The published site is `dist/index.html` (built), not the source `index.html`. `index-v1.html`, `cart-original.html`, the compare pages and `compare/` stay in the repository only.

## Build and deploy

The deployed page is minified so it is awkward to read and copy; the source stays `index.html`.

```
node build.mjs        # writes dist/index.html (inline CSS and JS minified by esbuild) + dist/og.jpg
vercel deploy --prod --yes --scope coding-nanami dist
```

esbuild is fetched on demand via `npx`; nothing is added to the repository. `dist/` is generated and git-ignored; `build.mjs` copies the Vercel project link into it so the deploy targets the same `davinci-mechanics` project. Minifying only slows down casual copying — the code is still visible in the browser.

## Starting states for testing and recording

The URL hash sets a starting state, for example:

- `#mode=cine&preset=viral&t=9.6` — the 15 s cut, paused at 9.6 s
- `#style=ink&explode=100&auto=0&phase=1.2&az=0.87` — ink sketch, fully pulled apart, frozen
- `#m=cart` — open on the cart
- `#ar=9:16&clean=1` — portrait recording frame without controls
- `#nohint=1` — no hand-written prompts and no opening slide of the divider

`window.__seek(t)` jumps the cinematic timeline to `t` seconds. `window.__codex` exposes the live state and the setters used in testing.

## Accuracy

The machines are reconstructions made for this page, not measured copies of the drawings. The Italian mirror-script lines and the notes on the parts were written for this page and have not been checked by a historian.

## Licence

No licence has been chosen yet.
