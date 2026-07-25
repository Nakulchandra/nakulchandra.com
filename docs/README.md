# Nakul Chandra — personal site

Static implementation of `Nakul Chandra.dc.html` from the
[Website rebrand design](https://claude.ai/design/p/1d016ec6-e27e-4802-b51d-10c2a2aaa385)
Claude Design project.

No build step and no framework. Serve the folder:

```sh
python3 -m http.server 4173
```

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Nav, hero, stats, services, companies, testimonials, video, contact, footer |
| `styles.css` | Design tokens + component styles, incl. the 1000px / 680px breakpoints |
| `script.js` | Testimonial carousel, scroll reveals, logo motion, click-to-play video |
| `assets/` | Logos and headshot |

## What changed from the design file

The `.dc.html` source is a Claude Design component. These constructs were
resolved into plain web code:

- `<x-dc>` / `<helmet>` wrappers → standard `<head>` + `<body>`
- `{{ … }}` bindings and the `DCLogic` class → `script.js`
- `<sc-if value="{{ videoPlaying }}">` → the poster button swaps itself for the
  YouTube iframe on click, so the embed is only requested if someone plays it
- `style-hover="…"` attributes → real CSS `:hover` rules
- ~200 inline `style` attributes → classes in `styles.css`
- `support.js` and `image-slot.js` → dropped. `support.js` is the Claude Design
  runtime, and no `<image-slot>` element was ever used — every image is a plain
  `<img>`.

The component props became module-level config: `logoMotion` and
`scrollReveals` at the top of `script.js`, and `headingStyle` as the static
`data-headfx="highlight"` attribute on each section heading.

### Content edits requested after import

- Page title is now **"Nakul Chandra | Agency Growth Partner & Technology
  Consultant"**.
- The **IT Consulting** service card was replaced with **AI Integration &
  Consulting**.
- Each company **logo panel is now a link** to that company's site, matching
  the company-name link beside it. The logo link carries `aria-hidden="true"`
  and `tabindex="-1"` so screen-reader and keyboard users get one link per row
  instead of two identical ones; the whole 280×110 panel is the mouse target.

### Additions on top of the design

Skip link, focus-visible outlines, `prefers-reduced-motion` support, arrow-key
control and pause-on-focus for the carousel, autoplay pause when the tab is
hidden, page metadata (title, description, canonical, Open Graph, Twitter card,
favicon), and JSON-LD structured data (`WebSite` + `Person`).

The scroll-reveal has a **safety net**: below-the-fold elements start at
`opacity: 0`, and `IntersectionObserver` callbacks can be withheld entirely in
some rendering contexts. Without a fallback that content would stay invisible
forever, so `script.js` also reveals on scroll and force-reveals everything
3 seconds after `load` if neither path has run.

## ⚠️ Two things to confirm

**1. The production domain is assumed to be `https://nakulchandra.com/`.**
It is inferred from the contact email and hard-coded in the canonical link,
the Open Graph / Twitter tags, and the JSON-LD. If the real domain differs,
update those in `index.html` — Open Graph requires absolute URLs, so a wrong
domain means broken social previews.

**2. `assets/nakul-headshot.png` (23 MB) is no longer used and should not ship.**
That file is actually a 5464×8192 JPEG with a `.png` extension. The site loads
`assets/nakul-headshot.jpg` instead — the same photo resized to 933×1400 at
186 KB (127× smaller). The original was left in place rather than deleted;
archive it outside the deploy folder.

## Asset provenance

| File | Source |
| --- | --- |
| `logo-nc.png`, `logo-dwa-full.webp`, `logo-uiux.png` | Design project |
| `logo-wpdd.svg`, `logo-rsm.webp` | wpdevdesk.us |
| `nakul-headshot.jpg` | Resized from the supplied original |

`logo-wpdd.svg` and `logo-rsm.webp` could not be retrieved from the design
project: the Design MCP caps file reads at 256 KiB, and those two came back
truncated. They were re-sourced from the live WP Dev Desk site, which serves
the same artwork — the SVG matches the design asset's 522×109 dimensions
exactly. Every image in `assets/` has been verified structurally intact
(PNG chunk CRCs, RIFF payload length, JPEG EOI marker).
