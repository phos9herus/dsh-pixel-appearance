# Changelog

## 1.8.0 — Retrospective theme

### Themes
- New **Retrospective (Review)** theme: content-guided pixel animation with four
  exclusive 8-second sub-themes — Code, Investigation, Creation, and Discussion.
- Active sessions sample the current Chat flow; new-session screens read the most
  recent non-blank session read-only and release it immediately.
- Sub-theme selection can follow content automatically or lock one of the four.
- The canvas, pixel size/shape, and materials apply to the Retrospective theme
  like the other custom themes.

### Fixes and polish
- Public README, Chinese README, plugin locale metadata, and package description
  updated for the Retrospective theme.

## 1.7.0 — Initial public release

First GitHub-ready release of the DSH Pixel Appearance plugin.

### Themes
- Native, Pixel, Response, and Static themes.
- Response theme: pointer halo, click waves, composer/caret waves, and Agent
  message-line waves.
- Static theme: local or remote picture backdrop with blur and dim.

### Appearance controls
- Seven colour palettes plus custom main/background colours.
- Canvas surface material: frosted glass or transparent, applied to every
  custom theme.
- Pixel size (6–32 px), square/rounded pixel styles, and a corner radius that
  scales with the pixel size.
- Composer and sidebar materials: native, frosted glass, or transparent, with
  colour and opacity controls.
- Configurable global blur radius.

### Response effects
- Halo style: static or breathing (2.6 s cycle, ±12% radius / ±10% brightness).
- Halo trail strength (0–100%): temporal main-colour trail pixels with
  250–2000 ms retention, fading back to the background.
- Composer wave origin: whole composer edge or text caret.
- Wave damping (0–100%) shortens reach and accelerates decay for every wave.
- `prefers-reduced-motion` fallbacks.

### Repository
- MIT licensed source.
- Self-contained Host + Client plugin with a DSH bundle patch.
- Vendored schemastery and cosmokit (MIT).
- Build and syntax checks, plus a GitHub Actions workflow.
