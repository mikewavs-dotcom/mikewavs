# Alienz Alive — Migration Notes
### From the coded prototype to Framer **or** Webflow (platform decision deliberately left to the client)

Everything below assumes three inputs, all in this repo:

- `audit/content-export.json` — canonical content (verified 1:1 against the prototype: 647 automated checks, 0 mismatches — see `audit/verification-report.txt` / `audit/verify.py`)
- `audit/asset-manifest.csv` — all 157 media assets with original WP URLs and suggested new filenames
- `prototype/` — the reference implementation (Next.js + Tailwind, every page real content)

---

## 1. CMS collection schemas

`content-export.json` maps 1:1 to these collections. Field names below work as Framer CMS fields or Webflow CMS Collection fields.

### Artists (11 items — `artists[]`)
| Field | Type | Source key |
|---|---|---|
| Name | Plain text | `name` |
| Slug | Slug | `slug` (keep exact — live URLs are `/artist/{slug}/`) |
| Portrait | Image | `ogImage` (fallback `images[0]`) |
| Bio | Rich text | `bio[]` (paragraphs) |
| Latest Video URL | Link | `latestVideoEmbed` |
| New Release | Reference → Releases | `newRelease` |
| Tour Note | Plain text | `tourNote` |
| Socials | Multi-link / repeater | `socials[]` (Webflow: 6 individual link fields is the pragmatic route) |
| Gallery | Multi-image | `images[]` |

### Releases (~60 items — `artists[].discography[]` + home `recap2025`)
| Field | Type | Source key |
|---|---|---|
| Title | Plain text | `title` (**nullable** — some live tiles are cover-only; never invent titles) |
| Cover | Image | `image` |
| Stream URL | Link | `streamUrl` (fvr.fan / aux.bio / vyd.co / Spotify) |
| Artist | Reference → Artists | parent artist |

### News (42 items — `news[]`)
| Field | Type | Source key |
|---|---|---|
| Title | Plain text | `title` |
| Slug | Slug | `slug` (posts live at site **root**, not `/news/…` — see §4) |
| Date | Date | `date` |
| Categories | Multi-reference → Categories | `categories[]` |
| Featured Image | Image | `featuredImage` |
| Body | Rich text | `bodyHtml` (real WP HTML; Webflow rich text will need a one-time cleanup pass of WP div/figure wrappers; Framer accepts HTML via API import) |
| External URL | Link | `url` when `isExternalLink: true` (4 items: Billboard, HOT97, HotNewHipHop, The Grind Magazine — these are **link-out cards**, no local body) |
| Stream Links | Link(s) | `streamLinks[]` |

### Videos (25 items — `videos[]`)
Title, Slug, YouTube URL/ID, Poster (`ogImage`), Artist (plain text on live site), Date, Categories.

### Categories (16 — `categories[]`) and Products (2 — `products[]`) as listed in the export.

## 2. Component map (prototype → platform)

| Prototype component | Framer | Webflow |
|---|---|---|
| `EntryGate` (scroll-gated intro) | Scroll transform on a sticky frame (Scroll Section / effects), or port the component as a Framer code component — it's already props-driven with no routing dependencies | Sticky section + "while page is scrolling" interaction scrubbing scale/opacity. The click-to-skip affordance needs a second click interaction that collapses the 220vh wrapper |
| `RosterViews` List/Grid toggle | Variants on a CMS-list container; toggle switches variant | **The one React-state interaction.** Use Webflow Tabs (styled as the GRID/LIST buttons) wrapping two collection lists bound to the same collection. Costs a duplicate DOM render; acceptable at 9–11 items |
| `Marquee` | Ticker component (built-in) | CSS keyframes (the prototype's CSS is copy-pasteable) or a loop interaction |
| Poster-wall hover (grayscale→color, tilt) | Hover variants | Hover state + transform; the `--tilt` per-item variance can be approximated with nth-child classes |
| `VideoEmbed` click-to-load | Framer YouTube component (already lazy) | Native YouTube embed (lazy attribute), or Lightbox for the click-to-load behavior |
| `NewsletterForm` | Framer Forms (hook up ESP) | Webflow Forms. Fields: Name, Email, Phone, Birthday (home) / First+Last Name, Email, Phone, Birthday (community). **Where submissions go is an open decision** — live site stores MetForm entries in WP (form id 3893) and an Elementor form; nothing is visibly wired to an ESP. Existing entries should be exported from WP before the site is retired |
| `AudioPlayer` | Code component (ships in prototype, keyboard-accessible) | No native equivalent; embed or custom code block. **But see §5 — there is currently no hosted audio to play** |
| `NewsIndex`, `ReleaseRail`, `SectionHead`, footer | Straight CMS lists / layout | Straight collection lists / layout. Class naming in the prototype is systematic (`index-row`, `poster`, `rail`, `meta`, `display`, `gutter`) and maps to BEM-ish Webflow classes |

Motion rules (durations, easings, `prefers-reduced-motion` fallbacks) are tokenized in `design/design-system.md` §5 — both platforms can honor them natively; nothing else depends on React state.

## 3. Assets

- All images currently **hotlink the live WordPress uploads** (deliberate: no re-hosting without approval). Before the WP hosting is cancelled, bulk-download everything in `asset-manifest.csv` and re-upload to the target platform using the `suggested_filename` column.
- Several artist photos are 3000px+ originals (`MV_01276.jpg` is 3072w); let Framer/Webflow generate responsive variants.
- The logo: `ALIENZ-ALIVE-LOGO-rev_icon-copy-2-1.png`. The prototype uses a type-set wordmark instead — decide which to keep.

## 4. URL & redirect plan (SEO)

Preserve these path patterns 1:1 (both platforms support root-level CMS slugs; in Webflow, root-level news slugs require the "pages as collection" workaround or accept a `/news/` prefix + 301s):
- `/artist/{slug}/` (11), news posts at root `/{slug}/` (38), `/videos/{slug}/` (25), `/category/{slug}/`, `/about-alienz-alive/`, `/meet-the-founder/`, `/alienz-alive-artists/`, `/alienz-alive-news-archive/`, `/music-news/`, `/community/`, `/shop/`, `/product/{slug}/`

301 these (WordPress cruft, do not rebuild — full list with reasons in `audit/sitemap.json` / `content-inventory.md`):
- `/music-parallax/`, `/music-slider/`, `/music-store/`, `/tour-grid/`, `/under-construction-coming-soon-page/`, `/holiday_home/`, `/block/*`, `/artist/` (bare archive), `/category/general/`, `/locations.kml`

Fix at migration (flagged, needs client sign-off):
- Nav "Alienz Archive" points at `/news-3-columns` → **404 on the live site**. Prototype points it at `/alienz-alive-news-archive/`.
- Post slug `copy-of-hollyn-twm-heat-up-on-winter-lp` is actually "Single: TJ Carroll – Time To Waste" — re-slug + 301.
- Category slug `alienz-alive-awards` displays as "Alienz Alive Music" — re-slug or rename for coherence.

## 5. Functional decisions still open (human, not technical)

1. **Platform**: Framer (code components port directly; commerce needs a third party) vs Webflow (native ecommerce & forms; roster toggle and audio player need workarounds). The prototype deliberately favors neither.
2. **Commerce**: live shop is WooCommerce with 2 products ($40 tees, no size variants configured). Options: Webflow Ecommerce, Shopify Buy Button (works in both platforms), or retire the shop until merch matters. Prototype ships shop/product/cart/checkout pages with real data and an unwired Add-to-cart.
3. **Audio**: no hosted audio exists on the live site — the Sonaar player is empty chrome; all listening is outbound smart links. Keep the link-out model (recommended; it's how fans already use the site) or source real audio files, in which case `prototype/src/components/AudioPlayer.tsx` is ready.
4. **Newsletter destination** (§2, forms row) + export existing MetForm entries from WP.
5. **"Designed by Wavs Digital" footer credit** — preserved in the prototype; keep/replace/remove is the client's call.
6. **Roster gaps**: Alex Jean and IMRSQD have full artist pages but are absent from the live roster grid (reproduced as-is); Rodney "Darkchild" Jerkins appears in the home hero with no artist page (prototype links his tile to Meet The Founder). Confirm intent.
7. **Community page** is a stub (H1 + signup form) on the live site — expand or leave.
8. All 16 content flags in `audit/content-export.json → flags` (includes: "Place Holder" heading on Meet The Founder, Jon Keith press block on the KVNG FLVCKO/Hollyn pages, empty Darkchild Sessions caption, missing Investment video embed, West Indies socials pointing at Jon Keith's accounts, copyright link to sonaar.io).

## 6. Rebuilding order (either platform)

1. Create CMS collections (§1) and import from `content-export.json` (both platforms accept JSON→CSV import or API push; the file's arrays are import-ready).
2. Re-upload assets (§3), swap URLs.
3. Build global header/footer + tokens from `design/design-system.md`.
4. Templates in this order (mirrors prototype routes): Home → Artist roster → Artist detail → News index/article → Videos → Shop/product → Community/utility.
5. Wire redirects (§4).
6. Point DNS only after the flags in §5 have owners.
