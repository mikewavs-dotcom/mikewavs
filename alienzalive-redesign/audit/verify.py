#!/usr/bin/env python3
"""Phase 4: verify every prototype page contains its real content
from content-export.json. Reports any mismatch."""
import json, re, html as hm, urllib.request, sys

BASE = "http://localhost:3311"
d = json.load(open("/home/user/mikewavs/alienzalive-redesign/audit/content-export.json"))

cache = {}
def get(path):
    if path not in cache:
        with urllib.request.urlopen(BASE + path, timeout=30) as r:
            cache[path] = r.read().decode("utf-8", "replace")
    return cache[path]

def norm(s):
    s = hm.unescape(s or "")
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("&", " ")
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()

problems = []
checked = 0

def expect(path, needle, label, min_len=4):
    global checked
    checked += 1
    hay = norm(get(path))
    n = norm(needle)
    if len(n) < min_len:
        return
    if n not in hay:
        problems.append(f"{path} :: MISSING {label} :: {needle[:90]!r}")

def expect_raw(path, needle, label):
    global checked
    checked += 1
    if hm.unescape(needle) not in hm.unescape(get(path)):
        problems.append(f"{path} :: MISSING(raw) {label} :: {needle[:90]!r}")

# ---- Artists ----
for a in d["artists"]:
    p = f"/artist/{a['slug']}/"
    expect(p, a["name"], "name")
    for i, para in enumerate(a["bio"]):
        expect(p, para, f"bio[{i}]")
    for x in a["discography"]:
        if x["streamUrl"]:
            expect_raw(p, x["streamUrl"], "discography streamUrl")
        if x["title"]:
            expect(p, x["title"], "discography title")
    for pr in a["press"]:
        expect(p, pr["title"], "press title")
    for s in a["socials"]:
        expect_raw(p, s["url"], "social url")
    for mv in a["musicVideos"]:
        if mv["title"]:
            expect(p, mv["title"], "music video title")
    if a["tourNote"]:
        expect(p, a["tourNote"], "tour note")

# ---- News posts ----
for n in d["news"]:
    if n["isExternalLink"]:
        expect_raw("/alienz-alive-news-archive/", n["url"], "external press link in archive")
        expect("/alienz-alive-news-archive/", n["title"], "external press title in archive")
        continue
    p = f"/{n['slug']}/"
    expect(p, n["title"], "title")
    body = norm(n["bodyText"])
    # sample 3 slices across the body
    for tag, frag in [("start", body[:120]), ("middle", body[len(body)//2:len(body)//2+120]), ("end", body[-120:])]:
        if len(frag) > 20:
            checked += 1
            if frag not in norm(get(p)):
                problems.append(f"{p} :: MISSING body {tag} :: {frag[:80]!r}")
    for s in n["streamLinks"]:
        expect_raw(p, s, "stream link")
    expect_raw("/alienz-alive-news-archive/", f"/{n['slug']}/", "archive listing link")

# ---- Videos ----
for v in d["videos"]:
    p = f"/videos/{v['slug']}/"
    if v["title"]:
        expect(p, v["title"], "video title")
    if v["youtubeId"]:
        expect_raw(p, v["youtubeId"], "youtube id")

# ---- Products ----
for pr in d["products"]:
    p = f"/product/{pr['slug']}/"
    expect(p, pr["name"], "product name")
    expect_raw(p, pr["price"], "price")
    if pr["description"]:
        expect(p, pr["description"][:100], "description")
    expect("/shop/", pr["name"], "shop listing")

# ---- Core pages ----
for line in d["pages"]["about"]["manifesto"]:
    expect("/about-alienz-alive/", line, "manifesto line")
mf = d["pages"]["meetTheFounder"]
for para in mf["bio"]:
    expect("/meet-the-founder/", para, "founder bio")
for q in mf["pullQuotes"]:
    expect("/meet-the-founder/", q, "pull quote")
expect("/meet-the-founder/", mf["scripture"]["reference"], "scripture ref")
expect("/meet-the-founder/", mf["scripture"]["heading"], "scripture heading")
if mf["scripture"]["quote"]:
    expect("/meet-the-founder/", mf["scripture"]["quote"], "scripture quote")

for t in d["pages"]["artistsRoster"]["tiles"]:
    expect("/alienz-alive-artists/", t["name"], "roster tile")
    expect_raw("/alienz-alive-artists/", t["image"], "roster tile image")

h = d["pages"]["home"]
for x in h["heroArtists"]:
    expect("/", x["name"], "hero artist")
    expect_raw("/", x["image"], "hero artist image")
for line in h["missionBlurb"]:
    expect("/", line, "mission line")
expect("/", h["eventsSection"]["empty"], "events empty state")
for x in h["featuredNews"]:
    expect("/", x["title"], "featured news")
for grp in ("newReleases", "featuredReleases"):
    for x in h["recap2025"][grp]:
        if x["streamUrl"]:
            expect_raw("/", x["streamUrl"], f"recap {grp} stream")
        if x["title"]:
            expect("/", x["title"], f"recap {grp} title")
for f in h["newsletter"]["fields"]:
    expect("/", f["name"], "newsletter field")
expect_raw("/", h["playlist"]["url"], "playlist url")
expect("/", h["playlist"]["heading"], "playlist heading")

c = d["pages"]["community"]
for f in c["form"]["fields"]:
    expect("/community/", f["name"], "community field")
expect("/community/", c["form"]["heading"], "community form heading")

# footer on every template type
for p in ["/", "/about-alienz-alive/", "/artist/gawvi/", "/shop/"]:
    expect(p, d["site"]["footer"]["copyright"], "footer copyright")
    expect(p, d["site"]["footer"]["credit"]["text"], "footer credit")
    for s in d["site"]["footer"]["socials"]:
        expect_raw(p, s["url"], "footer social")

# categories
for cat in d["categories"]:
    if cat["count"] > 0:
        expect(f"/category/{cat['slug']}/", cat["name"], "category heading")

print(f"CHECKS RUN: {checked}")
print(f"PROBLEMS: {len(problems)}")
for p in problems:
    print(" -", p)
sys.exit(1 if problems else 0)
