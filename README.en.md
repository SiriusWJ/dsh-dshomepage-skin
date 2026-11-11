# dsh-desktop-skin

The DeepSeek Harness homepage background — WebGL fluid light, dot grid and a digital point-cloud whale — for the **DSH 0.2.x desktop app** and `dsh web`. Dark and light palettes included.

This repository is a DSH 0.2.2-rc.1 port of [yushi-xxh/dsh-homepage-skin](https://github.com/yushi-xxh/dsh-homepage-skin) (MIT). The visuals stay the same; the shell selectors, version declarations and desktop-only layers were rewritten so the skin actually renders in the current desktop build.

| Dark | Light |
| --- | --- |
| ![dark](docs/compare-dark.png) | ![light](docs/compare-light.png) |

## Compatibility

| Item | Value |
| --- | --- |
| Target runtime | DSH `>=0.2.2-rc.1 <0.3.0` (`engines.dsh`) |
| Tested against | DSH 0.2.2-rc.1 (desktop shell 44.7.0, Windows x64) |
| Other host | `dsh web` 0.2.x |
| Dependencies | Client slot `settings.general.item`, `ctx.locale`, `@deepseek-ai/dsh-client-store` only |

Changes since upstream 0.1.13:

- Shell selectors no longer hard-code the 0.1 CSS Module hashes (`.pI_x6G_*`). 0.2.x is addressed through the stable `data-slot` contract — `[data-slot="root"] > div` (AppFrame), `[data-slot="sidebar"]`, `[data-slot="main.conversation"]` — with the old class names kept as fallbacks, so `dsh web` 0.1.x still works.
- Covers the opaque layers the 0.2.x desktop shell adds: the frame / center column fill under the Windows title bar and the title-bar drag strip (`:before`).
- Declares `engines.dsh` plus 0.2.2 peer dependencies; without that, 0.2.2 skips the bundle as version-incompatible at boot.
- Plugin name, settings namespace and localStorage key are `dsh-desktop-skin`, so it can coexist with the upstream plugin.

## Install

Desktop (recommended): install `SiriusWJ/dsh-desktop-skin` from the plugin market, or

```sh
dsh plugin --profile desktop add github:SiriusWJ/dsh-desktop-skin
```

`dsh web`:

```sh
dsh plugin --profile web add github:SiriusWJ/dsh-desktop-skin
```

## Usage

Settings → General → **Homepage Skin · Desktop**. On by default; turning it off removes every canvas and style immediately.

- Dark / light palette follows the built-in appearance (`body[data-ds-dark-theme]`).
- `prefers-reduced-motion: reduce` keeps a static frame without animation.
- Below 768px the whale and grid stay hidden to avoid covering content.

### Verification (2026-11-11, DSH 0.2.2-rc.1)

- Installed from a local path into a throwaway profile and restarted: the page mounts `data-dsh-desktop-skin`, three canvases, and `[data-slot="root"] > div` computes to a transparent background.
- Settings → General shows **Homepage Skin · Desktop**; toggling off removes the background immediately and toggling on restores it.
- Both palettes follow `body[data-ds-dark-theme]`; screenshots in `docs/` were captured from the same-version `dsh web` page (1576×860).
- Not covered: the desktop window's Windows title-bar layer was not screenshot-verified; the `[data-windows-titlebar]` rules need a visual check after restarting the desktop app.

## Layout

```
lib/index.js         host half (no-op loader entry)
lib/client.js        browser half: engine + slot registration
cordis.patch.yml     bundle patch layer
package.json         dsh.bundle / dsh.client manifest, engines.dsh
```

## License & attribution

MIT. Visuals, shaders and the whale point cloud come from [yushi-xxh/dsh-homepage-skin](https://github.com/yushi-xxh/dsh-homepage-skin), copyright the original author; this repository only ports and maintains the DSH 0.2.x desktop support.
