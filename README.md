# Nomo

Nomo is a markdown-first site renderer built with React and Vite. Each file in `pages/` becomes a route, and YAML frontmatter controls presentation for that page.

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
theme: light
font: system
fontsize: 14.4px
---
```

Supported keys:

- `theme`: `light` or `dark`
- `font`: `system` for the system stack, or a Google Font family name like `Open Sans`
- `fontsize`: base page font size; numbers are treated as pixel values

`fontSize` is still accepted as a compatibility fallback, but `fontsize` is the canonical key.

## Themes

Theme files live in `public/themes/` and are loaded at runtime based on frontmatter.

Theme shape:

```json
{
  "name": "Light",
  "semantic": {
    "background": "#ffffff",
    "surface": "#f5f5f5",
    "border": "#e5e5e5",
    "text": "#000000",
    "muted": "#737373",
    "subtle": "#a3a3a3",
    "link": "#000000",
    "accent": "#60a5fa",
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

You can size markdown images by adding dimensions to the alt text:

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
