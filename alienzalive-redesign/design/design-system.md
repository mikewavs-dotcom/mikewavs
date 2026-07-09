# Alienz Alive — Design System
### Dark editorial redesign · direction: broke.nyc, voice: Alienz Alive manifesto

> "WE ARE CHOSEN TO SERVE / WE ARE CHALLENGED TO GROW / WE ARE DESTINED FOR GREATNESS."
> The type IS the design. Photography and cover art punctuate it; they don't carry it.

---

## 1. Principles

1. **Type carries the weight.** Headlines set at poster scale (12–18vw on landmark moments) do the work hero images usually do. Images appear as tactile artifacts — poster wall, cover art, torn-edge crops — not as decorative backgrounds.
2. **Near-black, not gray.** True `#000` base. Contrast comes from white ink and one loud accent. No gradients-as-decoration, no glassmorphism, no SaaS card chrome.
3. **Editorial pacing.** Generous negative space between sections. One idea per viewport. Rhythm: BIG statement → dense index → BIG statement.
4. **Motion is punctuation, not wallpaper.** A scroll-gated entry, a marquee, hover reveals on the poster wall. Everything else is instant. Duration scale is short; easing is decisive.
5. **The manifesto is the brand.** Declarative all-caps statements from the real About copy recur as section interstitials across the site.

---

## 2. Color tokens

Derived from the live brand: the Sonaar theme config ships `color_base: rgb(204, 218, 0)` — the Alienz Alive chartreuse — on black.

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#000000` | Page base, everywhere |
| `--color-bg-raised` | `#0A0A0A` | Cards/rows on hover, sticky bars |
| `--color-ink` | `#FFFFFF` | Primary text |
| `--color-ink-dim` | `#9C9C9C` | Metadata, dates, captions |
| `--color-ink-faint` | `#5A5A5A` | Disabled, deep de-emphasis |
| `--color-accent` | `#CCDA00` | The chartreuse. Links-on-hover, active states, selection, kickers, the one loud thing per viewport |
| `--color-accent-ink` | `#000000` | Text on accent fills |
| `--color-line` | `rgba(255,255,255,0.14)` | Hairline rules, table row separators |
| `--color-line-strong` | `rgba(255,255,255,0.32)` | Emphasized rules (section heads) |
| `--color-danger` | `#FF3B30` | Form errors only |

Rules:
- Accent never sits on accent. Accent text on black, or black text on accent fill. Both pass AA at display sizes; body-size accent text is bold-weight only.
- `::selection` is accent bg + black ink, site-wide. Cheap, tactile, on-brand.

## 3. Typography

Consolidates the live site's six loaded families down to one superfamily (Archivo is already in the current brand mix — continuity, and it's on Google Fonts so it survives Framer and Webflow).

| Token | Face | Use |
|-------|------|-----|
| `--font-display` | **Archivo Black** | Headlines, artist names, manifesto lines. Always tight: `letter-spacing: -0.02em`, `line-height: 0.9–0.95`, usually uppercase |
| `--font-body` | **Archivo** 400/500/700 | Body, bios, news articles. `line-height: 1.6` |
| `--font-meta` | **Archivo** 500, uppercase, `letter-spacing: 0.12em`, 11–13px | Kickers, dates, categories, nav, footer legal — the "labels" voice |

Type scale (fluid, clamp-based — maps to Framer/Webflow breakpoint styles):

| Token | Size | Use |
|-------|------|-----|
| `--text-poster` | `clamp(4rem, 14vw, 13rem)` | Entry gate "ALIENZ ALIVE", roster letters, 404 |
| `--text-h1` | `clamp(3rem, 8vw, 7.5rem)` | Page titles, artist names |
| `--text-h2` | `clamp(2rem, 5vw, 4rem)` | Section heads, manifesto lines |
| `--text-h3` | `clamp(1.4rem, 2.6vw, 2.25rem)` | Card titles, news headlines in lists |
| `--text-lg` | `1.25rem` | Lede paragraphs, pull quotes body |
| `--text-base` | `1rem` | Body |
| `--text-sm` | `0.875rem` | Secondary body |
| `--text-meta` | `0.75rem` | Meta voice (uppercase tracked) |

## 4. Spacing & layout

- Base unit **4px**; component scale `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`.
- Section rhythm: `--space-section: clamp(96px, 14vh, 200px)` vertical between homepage sections; interior pages `clamp(64px, 10vh, 128px)`.
- Grid: 12-col, `max-width: none` — the site bleeds full-width like broke.nyc; content measures via padding `clamp(16px, 4vw, 64px)` gutters. Prose (bios, articles) capped at `65ch`.
- Hairline rules (`--color-line`) separate stacked list rows — the "index/table" look is a core motif (news index, roster list view, discography rows).

## 5. Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything entering / revealing |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` | Layout shifts (list↔grid toggle) |
| `--dur-fast` | `150ms` | Hover states |
| `--dur-med` | `400ms` | Reveals, view toggles |
| `--dur-slow` | `800ms` | Entry gate, hero sequences |

Motion inventory (deliberately short):
1. **Entry gate (home only):** black screen, poster-scale "WE ARE / ALIENZ ALIVE" pinned; scrolling scrubs the wordmark (scale down + rise) and reveals the site beneath. Skippable: any click/keypress/one full scroll completes it; respects `prefers-reduced-motion` (gate renders as a static first section).
2. **Poster wall hover:** roster/grid items — image desaturated at rest, full color + slight `rotate(-1deg … 1deg)` (index-seeded, feels hand-pinned) + accent name flash on hover.
3. **Row hover (list views):** row background to `--bg-raised`, title slides `8px` right, trailing "→" fades in.
4. **Marquee:** manifesto lines ticker between sections (pausable, `prefers-reduced-motion` → static line).
5. **Section reveal:** headlines rise `24px` + fade on first scroll into view. Once. Nothing re-animates.

Everything here maps to Webflow-native scroll/hover interactions or Framer variants — no React-state-dependent motion except the list/grid toggle (noted in MIGRATION_NOTES).

## 6. Components

| Component | Notes |
|-----------|-------|
| `SiteHeader` | Sticky, black, hairline bottom rule. Wordmark left, nav right; nav collapses to full-screen overlay menu (poster-type links) on mobile |
| `EntryGate` | Home-only scroll-gated intro (see Motion 1) |
| `Marquee` | Manifesto ticker, accent text on black or inverted band |
| `ArtistRoster` | **List/Grid toggle.** Grid = poster wall (tall 2:3 tiles, torn-poster hover). List = full-bleed index rows, artist name at `--text-h1`, thumbnail follows cursor (desktop) |
| `ArtistHero` | Artist name at poster scale overlapping portrait; meta row (genre, socials) beneath |
| `ReleaseRail` | Horizontal scroll rail of square cover art; each card: cover, title (meta voice), "STREAM NOW ↗" accent link (fvr.fan/aux.bio) |
| `VideoCard` / `VideoWall` | 16:9 YouTube lazy embeds (click-to-load poster first — perf + privacy) |
| `NewsIndex` | Editorial index rows: date (meta) — headline (`--text-h3` display) — category chip. External press items get "↗ SOURCE" suffix and open out |
| `NewsArticle` | `65ch` prose, display pull quotes, real body HTML from export |
| `PressLogoRow` | Outlets (Billboard, HOT97, The Source…) as text badges in meta voice |
| `NewsletterForm` | Name / Email / Phone / Birthday + SUBSCRIBE. Accent focus rings, inline validation, keyboard accessible |
| `EventsBlock` | Renders real empty state: "No upcoming events scheduled yet. Stay tuned!" — designed as a deliberate editorial moment, not an apology |
| `PlaylistBlock` | "OFFICIAL PLAYLIST / HEAVENLY MADE" + Apple Music link-out |
| `AudioPlayer` | Fully keyboard-operable play/pause/scrub/skip bar component. **Note:** the live site hosts no audio files (Sonaar player chrome ships empty; all listening is outbound smart links). Component is built and documented, wired to render only when a release has an `audioUrl` |
| `ShopGrid` / `ProductPage` | Poster-wall product tiles; real product data (2 tees, $40) |
| `SiteFooter` | Manifesto line, social icons, legal, **"Designed by Wavs Digital" credit preserved pending client decision** |

## 7. Accessibility baseline

- Semantic landmarks (`header/nav/main/footer`), one `h1` per page, heading order preserved from content.
- All interactive elements keyboard-reachable; visible accent focus ring (`outline: 2px solid var(--color-accent); outline-offset: 3px`).
- Entry gate and marquee honor `prefers-reduced-motion: reduce`.
- Images: alt text from real context (artist name, release title, article headline). Decorative poster-wall duplicates get `alt=""`.
- Click-to-load video embeds are buttons with accessible names ("Play: <video title>").
- Color contrast: white on black 21:1; dim ink #9C9C9C on black 5.9:1 (AA); accent #CCDA00 on black 13.9:1 (AAA); black on accent 13.9:1.

## 8. Voice & content rules

- Manifesto copy is reproduced verbatim — never paraphrased.
- Kickers use the site's own vocabulary: "ALIENZ ARCHIVE", "THE ROSTER", "OFFICIAL PLAYLIST".
- Dates in meta voice: `JUL 01 2026`.
- All streaming links open in new tabs with `rel="noopener"`; external press marked with ↗.
