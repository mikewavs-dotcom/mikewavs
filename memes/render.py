#!/usr/bin/env python3
"""Render @wavs_digital arcade memes.

Each spec in specs/<slug>.json becomes <slug>.mp4 (1080x1350, H.264, seamless loop) and
<slug>.caption.txt next to this script.

    python3 render.py                      # render every spec
    python3 render.py specs/foo.json       # render one
    python3 render.py --check              # lint and layout-check only, no video
    python3 render.py --stills 0.5,1.2,3   # also save PNG stills at those times (to --stills-dir)

Needs: Python 3.10+, playwright (Chromium), ffmpeg.
"""
import argparse
import asyncio
import json
import os
import pathlib
import re
import subprocess
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent
TEMPLATE = ROOT / "template" / "meme.html"
FONTS = ["700 60px Inter", "600 60px Inter", "500 30px Inter", "20px PS2P", "20px JBM"]

# Words a reader gets through in about 3 seconds on a feed.
MAX_WORDS = 14
CTA_PATTERNS = [
    r"link in bio", r"in bio", r"https?://", r"www\.", r"\.com\b", r"\bdm\b", r"comment", r"tag a",
    r"share this", r"follow (us|me|@)", r"book a", r"sign up", r"click", r"\btap\b",
]


def visible(text):
    return text.replace("*", "").replace("\n", " ")


def lint(spec):
    errors, warns = [], []
    texts = {
        "setup": spec["setup"]["text"],
        "punch": spec["punch"]["text"],
        "punch.label": spec["punch"].get("label", ""),
        "caption": spec.get("caption", ""),
    }
    for k, v in texts.items():
        if "—" in v or "–" in v:
            errors.append(f"{k}: em or en dash, use a period, comma or colon")
    if "\u2019" in texts["punch"] or "\u2018" in texts["punch"]:
        warns.append("punch: use straight apostrophes, curly ones render wide in the pixel font")
    cap = texts["caption"]
    if not cap:
        errors.append("caption is missing")
    if "\n" in cap:
        errors.append("caption must be one line")
    for pat in CTA_PATTERNS:
        if re.search(pat, cap, re.I) or re.search(pat, visible(texts["setup"] + " " + texts["punch"]), re.I):
            errors.append(f"call to action or link found ({pat}); the website lives in the bio only")
    words = len(visible(texts["setup"]).split()) + len(visible(texts["punch"]).split())
    if words > MAX_WORDS:
        warns.append(f"{words} words on screen, aim for {MAX_WORDS} or fewer to read in under 3 seconds")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", spec["slug"]):
        errors.append("slug must be lowercase words joined by hyphens")
    return errors, warns


async def render_one(browser, spec_path, out_dir, check_only, stills, stills_dir):
    spec = json.loads(spec_path.read_text())
    slug = spec["slug"]
    errors, warns = lint(spec)
    page = await browser.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
    await page.goto(TEMPLATE.as_uri())
    await page.evaluate("fs => Promise.all(fs.map(f => document.fonts.load(f)))", FONTS)
    result = await page.evaluate("s => window.build(s)", spec)
    await page.evaluate("document.fonts.ready.then(() => true)")
    warns += result["warnings"]

    print(f"\n{slug}")
    for e in errors:
        print(f"  LINT ERROR  {e}")
    for w in warns:
        print(f"  LAYOUT WARNING  {w}")
    if not errors and not warns:
        print("  ALL OK")
    if errors or check_only:
        await page.close()
        return not errors

    fps = spec.get("fps", 30)
    dur = spec.get("duration", 5.0)
    n = round(dur * fps)
    out = out_dir / f"{slug}.mp4"
    ff = subprocess.Popen(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "image2pipe", "-framerate", str(fps), "-c:v", "png", "-i", "-",
            "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
            "-t", f"{dur}",
            "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
            "-profile:v", "high", "-r", str(fps), "-movflags", "+faststart",
            "-c:a", "aac", "-b:a", "96k",
            str(out),
        ],
        stdin=subprocess.PIPE,
    )
    for i in range(n):
        await page.evaluate("t => window.renderAt(t)", i / fps)
        ff.stdin.write(await page.screenshot(type="png"))
    ff.stdin.close()
    if ff.wait() != 0:
        raise SystemExit(f"ffmpeg failed for {slug}")

    for t in stills:
        await page.evaluate("t => window.renderAt(t)", t)
        stills_dir.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(stills_dir / f"{slug}-{t:.2f}s.png"))

    (out_dir / f"{slug}.caption.txt").write_text(spec["caption"].strip() + "\n")
    print(f"  wrote {out.relative_to(ROOT.parent)} ({out.stat().st_size / 1e6:.1f} MB, {n} frames)")
    await page.close()
    return True


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("specs", nargs="*", type=pathlib.Path)
    ap.add_argument("--out", type=pathlib.Path, default=ROOT)
    ap.add_argument("--check", action="store_true", help="lint and layout-check only")
    ap.add_argument("--stills", default="", help="comma-separated times (s) to save as PNG")
    ap.add_argument("--stills-dir", type=pathlib.Path, default=ROOT / "stills")
    ap.add_argument("--jobs", type=int, default=2)
    a = ap.parse_args()
    specs = a.specs or sorted((ROOT / "specs").glob("*.json"))
    stills = [float(x) for x in a.stills.split(",") if x.strip()]
    a.out.mkdir(parents=True, exist_ok=True)

    exe = os.environ.get("CHROMIUM_PATH")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=exe or None,
            args=["--font-render-hinting=none", "--disable-lcd-text", "--force-color-profile=srgb"],
        )
        sem = asyncio.Semaphore(max(1, a.jobs))

        async def run(sp):
            async with sem:
                return await render_one(browser, sp.resolve(), a.out, a.check, stills, a.stills_dir)

        ok = await asyncio.gather(*(run(s) for s in specs))
        await browser.close()
    if not all(ok):
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
