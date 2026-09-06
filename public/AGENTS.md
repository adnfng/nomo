# Set up a Nomo page

A public GitHub repo named `.nomo` with a `human.md` is the page at `nomo.md/username`. No account. No CMS.

If a site blocks `.md` links, the same page is `nomo.fyi/username`.

## If they do not have the repo yet

Create a public GitHub repo named `.nomo` from https://github.com/adnfng/.nomo

```bash
gh repo fork adnfng/.nomo --clone
```

or

```bash
git clone https://github.com/adnfng/.nomo.git
```

The name must be `.nomo`. It must be public. The owner is the user. Then work in that folder.

## What to edit

- `human.md` is the whole page
- `assets/` is photos and video
- A leading image is the header photo: `![image:100x140](/assets/me.jpg)`
- `/nomo.png` or `/nomo.svg` in that spot is the Nomo mark

Ask who they are. Do not invent a biography. If they already told you, write from that.

## Syntax

Tabs. The first one is home.

```md
===== Their Name =====

===== Work =====
```

- Mute: `{{this}}`
- Small: `::this::`
- Both: `{{::2026::}}`
- Link: `[nomo](https://nomo.md)`
- Arrow link: `(([nomo](https://nomo.md)))`
- Image size: `![image:180](/assets/me.jpg)` or `![image:100x140](/assets/me.jpg)`

```md
[[gallery]]
/assets/one.jpg
/assets/two.webm
[[/gallery]]
```

A blank line is a paragraph. A single line break stays close.

No YAML frontmatter. No `[[timeline]]`. `((plain text))` is just text.

## Voice

Write as them. Short. No marketing.

## Done

Commit and push to the default branch. The page is `nomo.md/theirusername`. GitHub can take a few seconds. Show them that URL.
