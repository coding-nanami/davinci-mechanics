# Da Vinci's Living Codex

Two of Leonardo da Vinci's machines, the ornithopter and the self-propelled cart, drawn in ink on a notebook leaf and rebuilt in timber, in the browser. Everything is generated in code: the geometry, the paper, the ink lines and the sound. There are no image, model or audio files.

Live: https://davinci-mechanics.vercel.app

## Run it

Open `index.html` in a browser. It is one file with no build step. It needs a network connection the first time, to fetch three.js (pinned to 0.170.0 on jsDelivr) and the IM Fell English fonts (Google Fonts, SIL Open Font Licence).

## What you can do on the page

- Scroll, hold Space, or turn the brass crank to drive the machine. It coasts when you stop.
- Drag the brass grip on the ink line to move the border between the ink sketch and the timber model.
- Slide the brass rule to pull the machine apart while it keeps moving.
- Hover a part to see its name, click it for a note written in the margin.
- Drag the hand mirror over the mirror writing to read it. Click the mirror to turn the whole page.
- Top right: `Sound` turns on the synthesised audio. `Record` opens the maker tools: a cinematic mode with a 20 s story and a 15 s looping cut, recording frames (9:16, 1:1, 16:9) and a clean frame.

Keys: `1` `2` `3` ink / half / timber, `M` mirror, `S` sound, `R` record drawer, `H` clean frame, `+` `-` zoom, `Esc` close.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. This is the source; edit it directly. |
| `og.jpg` | Preview image for link cards. |
| `index-v1.html` | The first version of this page, kept for comparison. |
| `cart-original.html` | The cart-only page the project started from. |
| `compare.html`, `compare/` | Drag-to-compare screenshots of the first version against the current one. |

Only `index.html` and `og.jpg` are deployed (see `.vercelignore`).

## Starting states for testing and recording

The URL hash sets a starting state, for example:

- `#mode=cine&preset=viral&t=9.6` — the 15 s cut, paused at 9.6 s
- `#style=ink&explode=100&auto=0&phase=1.2&az=0.87` — ink sketch, fully pulled apart, frozen
- `#m=cart` — open on the cart
- `#ar=9:16&clean=1` — portrait recording frame without controls

`window.__seek(t)` jumps the cinematic timeline to `t` seconds.

## Accuracy

The machines are reconstructions made for this page, not measured copies of the drawings. The Italian mirror-script lines and the notes on the parts were written for this page and have not been checked by a historian.

## Licence

No licence has been chosen yet.
