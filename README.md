# PV Tool — AGPL Community Edition

> **A community-maintained continuation of the last AGPL-licensed version of PV Tool.**

A browser-based visual effects engine for creating PV (Promotional Video) style kinetic typography and post-processing overlays, built with [PixiJS](https://pixijs.com/) and TypeScript.

Designed for the Japanese PV / music video community and anyone creating lyric videos, motion graphics, or real-time visual performances.

---

## 📌 About This Project

This repository is a **community-maintained continuation** of PV Tool, based on the last AGPL-licensed version published on **2026-03-18**.

- **License**: AGPL-3.0 (unchanged)
- **No commercial license** — this is a pure AGPL codebase
- **No upstream merges** — changes from the original repository after the license change are not included

**Original author**: [@DanteAlighieri13210914](https://github.com/DanteAlighieri13210914)  
**Archive reference**: [pv-tool](https://github.com/yandujun363/pv-tool) (preserved as-is)

---

## Why This Exists

The original PV Tool repository changed its license after having been distributed under AGPL-3.0. Under the terms of AGPL, the license grant for already-published versions is **perpetual and irrevocable**.

This project:
- Preserves the last AGPL-3.0 version as a stable, consistent codebase
- Provides a place for users who rely on AGPL-3.0 terms
- Maintains a clean license boundary (no mixed licensing)

---

## What It Does

PV Tool takes text (lyrics, titles, poetry) and renders them with layered visual effects in real-time — no video editing software required. Think of it as a programmable, template-driven motion graphics compositor that runs entirely in the browser.

**Core capabilities:**

- **16 preset templates** — curated visual styles ranging from clean typography to cyberpunk HUDs
- **54 configurable effects** — geometry, text layouts, overlays, textures, organic shapes, composition guides, and more
- **Custom mode** — mix and match any effects from the catalog
- **Media input** — load images or videos as background layers with automatic color extraction
- **Audio-reactive** — BPM-synced beat reactivity drives animations and camera effects
- **Motion detection** — real-time browser-based object tracking for interactive HUD overlays
- **Post-processing** — shake, zoom, tilt, glitch, hue shift, chromatic aberration
- **HiDPI support** — renders at native device pixel ratio

---

## Templates

| Template | Style |
|---|---|
| 蓝色冲击 | Bold blue geometric impact |
| 斩击 | Kinetic split with diagonal energy |
| 蓝色构成 | Deconstructed blueprint with physics formulas |
| 城市、文字、雨 | Urban rain with flowing text |
| 夜色 | Soft nocturnal atmosphere |
| 波普 | Pop art halftone and bold colors |
| 青墨 | Ink wash minimalism |
| 电脑 | Digital / cyber aesthetic |
| 战场 | High-intensity battle theme |
| 几何 | Pure geometric composition |
| 全息 | Holographic glow rings |
| 赛博监控 | Cyberpunk HUD with motion tracking |
| 情绪电影 | Cinematic emotion overlay |
| 剪影极简 | Silhouette clean minimalism |
| 歇斯底里之夜 | Radial rectangles with glowing text cards |
| 戒尺 | Ruler guides with breathing blocks |

---

## Effects Library

Effects are organized by layer and category:

- **Background** — texture fills, gradients, triangle grids, checkerboards, color blocks
- **Decoration** — geometric shapes, flowing lines, burst rays, perspective grids, composition guides (golden spiral, rule of thirds, phi grid), organic blobs, ocean waves, clouds
- **Text** — hero text, scattered text, text strips, text cards, outline text, layered text, glow cards, vertical sub-text, formula overlays, falling text rain
- **Overlay** — vignette, color mask, chromatic aberration, glitch bars, scanlines, film grain, dot screen (halftone), HUD elements
- **Motion** — real-time motion detection brackets with target tracking

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Select a template** from the dropdown, or choose "Custom" to build your own
2. **Enter text** — use `/` to separate segments (e.g. `春を告げる/夜を越えて/踊れ踊れ`)
3. **Load media** — drag in an image or video as background
4. **Load audio** — add music for beat-reactive animations
5. **Adjust parameters** — animation speed, motion intensity, segment timing, post-FX

---

## Tech Stack

- **[PixiJS 8](https://pixijs.com/)** — WebGL/WebGPU 2D rendering
- **TypeScript** — full type safety
- **Vite** — development and build tooling
- **Canvas 2D** — motion detection, texture generation, media analysis

---

## License

**AGPL-3.0 only.**

This project is licensed under the **GNU Affero General Public License v3.0**.

- Free for personal use, community projects, and open-source work
- Commercial use is permitted **as long as you comply with AGPL-3.0 terms** (including source disclosure)

Full license text: [LICENSE](./LICENSE)

> ⚠️ **Note**: This project does **not** offer a separate commercial license. If you need a proprietary/commercial license for PV Tool, please contact the original author.

---

## Original Author & Archive

This project is based on the original PV Tool by **DanteAlighieri13210914**.

All original copyright notices and author attributions are preserved in the source code.

Copyright (c) 2026 DanteAlighieri13210914. All rights reserved.

An **archive version** (unmodified, last AGPL release) is preserved at:  
[github.com/yandujun363/pv-tool](https://github.com/yandujun363/pv-tool)

---

## Contributing

Contributions are welcome.

By submitting a pull request, you agree that your contribution is licensed under AGPL-3.0. No CLA (Contributor License Agreement) is required — the standard AGPL-3.0 terms apply.

When contributing:
- Preserve existing copyright notices
- Add your own copyright notice to new files
- Ensure your changes are compatible with AGPL-3.0

---

*This project is not affiliated with, endorsed by, or maintained by the original author.*