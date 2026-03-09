# Nomo

Nomo is a markdown-first site renderer built with React and Vite. Each file in `pages/` becomes a route, and YAML frontmatter controls presentation for that page.

The product model is simple: a public `.nomo` repo on GitHub with a `human.md` file as the source for a profile page.

## Getting Started

```bash
bun install
bun run dev
```

Other useful commands:

```bash
bun run build
bun run lint
```

## How Routing Works

Every markdown file in `pages/` becomes a route based on its filename.

- `pages/home.md` -> `/`
- `pages/test-page.md` -> `/test-page`
- `pages/docs.md` -> `/docs`

## Frontmatter

Each page can define presentation options in YAML frontmatter:

```yaml
---
align: top
theme: light
font: system
fontsize: 14.4px
---
```

Supported keys:

- `align`: `top`, `middle`, or `bottom` to vertically place the page content within the viewport
- `theme`: `light`, `dark`, or `adn`
- `font`: `system` for the system stack, or a Google Font family name like `Open Sans`
- `fontsize`: base page font size; numbers are treated as pixel values

`fontSize` is still accepted as a compatibility fallback, but `fontsize` is the canonical key.

The app-level `Created with nomo.` footer stays pinned to the bottom of the page regardless of content alignment.

## Themes

Theme files live in `public/themes/` and are loaded at runtime based on frontmatter.

Theme shape:

```json
{
  "name": "Light",
  "semantic": {
    "background": "#ffffff",
    "border": "#e5e5e5",
    "text": "#000000",
    "muted": "#737373",
    "subtle": "#a3a3a3",
    "link": "#000000",
    "code": "#f5f5f5"
  }
}
```

The `semantic` keys are applied directly to CSS variables on the document root.

## Markdown Styles

Markdown styling now lives in a single file:

- `src/styles/index.css`: layout, tokens, and markdown rules

## Previewing Markdown

`pages/test-page.md` is the specimen page for markdown rendering. Use it to inspect headings, lists, tables, code blocks, blockquotes, rules, and footnotes while adjusting styles.

## Image Sizing

Markdown images and videos support inline sizing by adding dimensions to the alt text:

```md
![avatar:100x170](https://github.com/adnfng.png)
```

This renders the image inside a `100px` by `170px` frame using `cover`.

```md
![avatar:100](https://github.com/adnfng.png)
```

This sets the image width to `100px` and preserves the original aspect ratio.

## Badges

You can create inline badges with double parentheses:

```md
((design))
```

You can also wrap markdown links:

```md
(([x](https://x.com/adnfng)))
```

## Muted Text

You can render muted inline copy with double braces:

```md
{{muted text}}
```

Links also work inside muted spans:

```md
{{[docs](https://example.com)}}
```

## Gallery

Use the gallery block syntax for mixed image and video grids:

```md
[[gallery]]
/assets/one.jpg
/assets/two.mp4
/assets/three.jpg
[[/gallery]]
```

You can also set a fixed item width:

```md
[[gallery:64]]
/assets/one.jpg
/assets/two.jpg
[[/gallery]]
```

Or a fixed width and height:

```md
[[gallery:64x96]]
/assets/one.jpg
/assets/two.jpg
[[/gallery]]
```

Behavior:

- default layout uses 3 columns with `16:9` media frames
- custom widths increase or decrease the number of columns
- fixed width and height uses a cover frame
- click opens a lightbox with a blurred overlay
- videos autoplay, loop, and stay muted by default
- gallery items support both images and videos
