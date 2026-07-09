# Alienz Alive — Redesign Prototype

Dark, editorial, typography-led rebuild of [alienzalive.com](https://alienzalive.com)
(direction: broke.nyc). Next.js 15 + Tailwind 4 + framer-motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # prerenders all 104 routes statically
```

- **Content**: `data/content.json` is a copy of `../audit/content-export.json`
  (the crawl export). No copy is hard-coded; no placeholder text anywhere.
  Re-copy the file after any audit change and rebuild.
- **Images** hotlink the live WordPress uploads on purpose (no re-hosting
  without approval) — see `../MIGRATION_NOTES.md` §3.
- **Platform-agnostic by design**: plain `<img>`, props-driven components,
  no Next-specific tricks in shared components, systematic class naming.
  Framer/Webflow mapping per component in `../MIGRATION_NOTES.md` §2.
- Prototype is `noindex` and must not be deployed publicly.
