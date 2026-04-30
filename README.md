# BadgeGen

Browser-based badge / seal designer built with Angular 21 signals and Tailwind. No backend, no server-side rendering — designs live entirely in the browser and can be shared via URL hash, exported as PNG/SVG, or saved as JSON.

## Features

- 15 shape presets (shield, circle, hexagon, star, ribbon, gem, seal, …) and 30+ Google Fonts
- 11 decoration types (star, heart, laurel, ribbon-bow, wing, sparkles, trophy, medal, crown, check, custom image upload)
- Drag-to-position with center snapping; pointer events so it works on touch devices
- Keyboard support: `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` for undo/redo, `Delete` to remove the selected element, arrow keys to nudge (Shift = ×10)
- Templates gallery (Hackathon Winner, Verified, Hall of Fame, …) for one-click presets
- Export PNG (configurable canvas size) and SVG, plus JSON save/load and a UTF-safe shareable URL
- Autosaves to `localStorage` so a refresh keeps your design

## Getting started

Prerequisites: Node.js 20+

```bash
npm install
npm run dev      # serves on http://localhost:4200
npm run build    # production build into dist/
```

## Project layout

```
src/
  app.component.{ts,html}        Root layout (3-column editor)
  components/
    badge-preview.component.ts   SVG canvas, drag/keyboard, export
    badge-main-controls.component.ts  Shape, gradient, border, presets
    badge-extras.component.ts    Typography, decorations, layers
    badge-templates.component.ts Starter template gallery
    toast-host.component.ts      Inline notifications
  services/
    badge.store.ts               Signal-based state, undo/redo, autosave
    badge-types.ts               BadgeDesign / Decoration / ExtraText
    badge-templates.ts           Starter template definitions
    shape-defs.ts                Shape-as-data layer config
    toast.service.ts
```

## Sharing

Click **Share Design** to copy a URL with the design encoded as a base64url payload in `#`. Visiting the URL restores the exact design. The hash is also written into the address bar so it can be copied manually if clipboard access is blocked.
