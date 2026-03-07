---
theme: light
font: system
fontsize: 14.4px
---

# Markdown Preview

This page is a full specimen for the markdown renderer. It covers copy, hierarchy, lists, tables, code, quotes, task lists, and footnotes in one place.

[Jump back home](/)

---

## Headings
# Heading One

## Heading Two

### Heading Three

#### Heading Four

##### Heading Five

###### Heading Six

## Paragraphs And Inline Formatting

Regular body copy should feel calm and readable at the configured base size.
You can mix **bold**, *italic*, ***bold italic***, ~~strikethrough~~, `inline code`, and bare URLs like https://example.com in the same paragraph.

Markdown also handles long-form writing:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere, sapien sed cursus feugiat, arcu risus faucibus nibh, quis sodales nulla nibh sit amet velit. Curabitur volutpat, turpis vitae viverra blandit, metus mauris condimentum est, sed tincidunt enim nibh at ipsum.

## Lists

- Unordered lists support nested structure
- They work well for notes
- They should keep spacing tight

1. Ordered lists keep sequence obvious
2. Useful for process steps
3. Easy to scan

- Mixed content can include `code`
- Or a [link](https://example.com)
- Or emphasis with **strong text**

- Task lists are part of GFM
- [x] Theme frontmatter is parsed
- [x] Base font size is applied
- [ ] Add image-specific markdown polish later if needed

## Blockquote

> Good markdown defaults should disappear into the reading experience.
>
> The preview page should make rendering gaps obvious fast.

## Code

Inline code sits inside text, while fenced blocks should preserve whitespace and alignment:

```ts
type Frontmatter = {
  theme: "light" | "dark";
  font: string;
  fontsize: string;
};

export function describePage(page: Frontmatter) {
  return `${page.theme} / ${page.font} / ${page.fontsize}`;
}
```

```bash
bun run dev
bun run build
bun run lint
```

## Table

| Token | Purpose | Example |
| --- | --- | --- |
| `background` | Page background | Main canvas |
| `surface` | Secondary panels | Cards, callouts |
| `code` | Code treatment | Inline code, code blocks |

## Images

Sized image with width and height:

![avatar:100x170](https://github.com/adnfng.png)

Sized image with width only:

![avatar:100](https://github.com/adnfng.png)

## Badges

Plain badge: ((design))

Linked badge: (([x](https://x.com/adnfng)))

## Gallery

[[gallery]]
https://github.com/adnfng.png
https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4
/assets/chatcut.jpg
[[/gallery]]

## Horizontal Rule

---

## Footnotes

Footnotes are useful for references in longer docs.[^theme] They also test superscript and footnote layout.[^font]

[^theme]: The page theme comes from frontmatter and loads the matching JSON file.
[^font]: Fonts use the system stack when `font: system`, otherwise the page requests the named Google Font.
