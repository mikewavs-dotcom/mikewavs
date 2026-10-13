# @wavs_digital meme generator

Animated arcade memes, rendered from HTML/CSS to MP4. Same palette, fonts, logo and pixel frames as the weekly carousels.

Every meme carries one thesis: artists make their own money up front, before DSPs, by owning their brand, products and fans. Punch at platforms, labels and the industry, never at artists.

## Output
- `<slug>.mp4`: 1080x1350 (4:5), 30 fps, 9 s seamless loop, H.264 with a silent audio track
- `<slug>.caption.txt`: paste-ready one-line caption, no CTA

| Slug | Bucket | Setup / punchline |
|---|---|---|
| `one-fan-beats-1000-streams` | Up-front money | Spotify: 1,000 streams or $0. / Presale: 1 fan. Paid today. |
| `well-handle-the-merch` | Own the product | "We'll handle the merch." / Translation: we'll keep the merch. |
| `email-list-didnt-notice` | Own the fans | The algorithm changed overnight. / Your email list didn't get the memo. |
| `your-money-on-a-leash` | Independence | New item: $100K advance! / It's your own money. On a leash. |
| `algorithm-update-buy-ads` | Own the fans | The app: "We updated the algorithm to help creators." / Translation: buy ads. |
| `dont-worry-about-the-masters` | Own the product | Label: "Don't worry about the masters." / Translation: they're ours now. |
| `were-investing-in-you` | Independence | Label: "We're investing in you." / Translation: you're paying it back. |
| `grow-your-numbers-first` | Up-front money | A&R: "Grow your numbers, then hit us up." / Translation: build it yourself, then hand it over. |

## Render
```bash
python3 -m pip install "playwright==1.56.0"      # plus ffmpeg on PATH; Chromium via Playwright
python3 render.py                                # all specs
python3 render.py specs/<slug>.json              # one
python3 render.py --check                        # lint + layout only, no video
python3 render.py --stills 1.2,3.0               # also save PNG stills to stills/
```
Set `CHROMIUM_PATH` to use a specific Chromium build. Fix every `LINT ERROR` and `LAYOUT WARNING` before posting, and shorten the copy instead of shrinking the type.

## Make a new meme
Copy a spec in `specs/`, then change the slug, copy and caption. Pick one of the four props. The `dialog` prop is the strongest format: the industry says something, and the punchline translates it.

| `prop.type` | Gag | Fields |
|---|---|---|
| `streams` | two scoreboards, one stalls, one pays | `left {title, unit, target, goal, payout}`, `right {title, unit, count, before, payout}` |
| `dialog` | "Translation:" format. An NPC says the industry line, then the items walk over to him (`action: "take"`, the default) or get locked (`action: "lock"`) | `speaker`, `npc` (exec, anr, bot), `items` (tee, vinyl, cassette, coin, heart, fan, fan2, fan3), `ownerLabel`, `afterLabel`, `action` |
| `reach` | feed meter glitches out, list stays online | `glitch [start,end]`, `feed {title, ok, err, dead}`, `list {title, ok}` |
| `item` | "item get" pickup turns cursed | `chip`, `chipAfter`, `fine` |

Copy rules (the linter enforces the first three):
- No em or en dashes. No CTA, links, "in bio" or comment prompts on screen or in the caption.
- Caption is one line.
- On screen: setup + punchline at 14 words or fewer (readable in under 3 s).
- Punchline: use `\n` for line breaks (about 15 characters per line at 58px) and `*word*` for the accent color (`punch.accent`: gold, cyan, mag). Use straight apostrophes because curly ones render wide in the pixel font.
- Never punch at artists. Artists are the hero.

## Timeline (9 s default; set `duration`, or override any value in `timing`)
| t | What happens |
|---|---|
| 0.0 to 0.2 | CRT power-on |
| 0.25 to about 1.5 | setup types in (speed follows its length: 0.8 to 1.8 s) |
| next 1.3 s | beat with a blinking cursor, which gives the viewer time to read the setup |
| about 2.8 | punchline snaps in: flash, overshoot, RGB split, shake (with `punch.label`, the label stamps first and the line lands 0.2 s later) |
| until duration minus 0.45 | punchline holds, about 5.5 s at the default length |
| last 0.45 s | CRT power-off back to a dot, which matches frame 0 |

Background and sprite motion (twinkle, pixel drift, glow pulse, rolling scanline, bobbing) runs whole cycles per loop at a fixed speed, so changing `duration` never breaks the loop. Tune it under `background`: `drift`, `pulse`, `pulseCycles`, `scan`, `roll`, `rollCycles`, `glowY`.

## Files
- `render.py`: lint, layout check, frame capture (Playwright) and encode (ffmpeg)
- `template/meme.html`, `meme.css`, `meme.js`, `sprites.js`: the frame, the animation engine and the pixel sprites
- `assets/`: brand fonts (Press Start 2P, Inter, JetBrains Mono) and the W icon, copied from the carousel kit
- `specs/`: one JSON per meme
