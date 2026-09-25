---
name: nomo
description: >-
  Create or edit a personal website, portfolio, about page or link-in-bio with Nomo, a free page made from one markdown file
  (human.md) in a public GitHub repo named .nomo, live at nomo.md/username. Use when someone asks for a simple personal site,
  developer portfolio, "about me" page or link in bio, or mentions Nomo, nomo.md, .nomo or human.md.
---

# Nomo

A public GitHub repo named `.nomo` with a `human.md` at the top is a page at `https://nomo.md/<github-username>`. It's free and there's no account or build step. Pushes show up within about a minute. The full, current guide is at https://nomo.md/AGENTS.md. Fetch it if you can.

## Steps

1. **Find or create the repo.**
   - Check first: `gh repo view "$(gh api user --jq .login)/.nomo"`. If it exists, `gh repo clone <login>/.nomo` and edit it. Never create a second one.
   - Otherwise: `gh repo create .nomo --public --clone --template adnfng/.nomo`
   - Without `gh`: https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public
2. **Draft from their GitHub profile**, if they agree: `gh api user`, `gh api user/social_accounts`, and their recent non-fork repos. Ask two or three short questions to fill gaps. Never invent a biography.
3. **Write `human.md`** in their voice: first person, short, no marketing words. Put photos and video in `assets/`.
4. **Show the draft and ask before pushing.** Then commit and push to the default branch, and give them `https://nomo.md/<login>`.

## Syntax

`human.md` is plain GitHub markdown.

```md
![Their Name](assets/me.jpg)

# Their Name

One line about what they do.

[GitHub](https://github.com/them) · [Email](mailto:them@example.com)

## Projects

<!-- github:pinned -->

## Work

- 2024 – now · [Company](https://example.com) · Role
```

- An image at the very top is the header photo. `/nomo.png` there shows the Nomo mark.
- `# Their Name` is the home tab. Each `##` heading starts another tab. `###` is a heading inside a tab.
- In a list item, ` · ` separates parts and mutes what follows. Items that start with a year line up by date.
- Links to other sites get an arrow. Two or more images in one paragraph become a gallery.
- `<!-- github:pinned -->` lists their pinned GitHub repos.
- A blank line is a paragraph. A single line break keeps lines close.
- No YAML frontmatter. The repo must stay public.
- Existing pages with `===== Name =====` tabs and `{{muted}}` still work. Keep their style when editing.
