# Set up a Nomo page

Nomo is a free personal page made from one markdown file. A public GitHub repo named `.nomo` with a `human.md` in it is the page at `https://nomo.md/username`. There's no account and no build step. If a site blocks `.md` links, the same page is at `https://nomo.fyi/username`.

## 1. Find the repo

Check whether they already have one:

```bash
gh repo view "$(gh api user --jq .login)/.nomo" --json url
```

If it exists, clone it (`gh repo clone theirusername/.nomo`) and edit it. Do not create a new one.

If it doesn't, create it from the template:

```bash
gh repo create .nomo --public --clone --template adnfng/.nomo
```

Without `gh`, send them to https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public and clone the repo it creates.

The name must be `.nomo`, it must be public, and it must belong to them. Then work in that folder.

## 2. Draft from their GitHub profile

Ask if you can use their public GitHub profile for a first draft. If they say yes:

```bash
gh api user --jq '{login, name, bio, blog, company, location, twitter_username}'
gh api user/social_accounts
gh api "users/$(gh api user --jq .login)/repos?sort=pushed&per_page=10" --jq '.[] | select(.fork | not) | {name, description, html_url}'
```

Write the draft from that. Then ask two or three short questions to fill the gaps: what they do now, what they want people to find, and which projects to show. Do not invent a biography. If they already told you who they are, write from that.

## 3. What to edit

- `human.md` is the whole page. It's plain GitHub markdown.
- `assets/` holds photos and video. Replace `assets/me.jpg` with their photo, or use their GitHub avatar (`https://github.com/theirusername.png`).

## Syntax

```md
![Their Name](assets/me.jpg)

# Their Name

One line about what they do.

[GitHub](https://github.com/them) · [Email](mailto:them@example.com)

## Projects

<!-- github:pinned -->

## Work

- 2024 – now · [Company](https://example.com) · Role
- 2021 · Earlier role
```

- An image at the very top is the header photo. `![image:100x140](assets/me.jpg)` sets its size. `/nomo.png` there shows the Nomo mark.
- `# Their Name` is the home tab. Each `##` heading starts another tab. Use `###` for headings inside a tab.
- In a list item, ` · ` separates parts and mutes what follows. Items that start with a year line up in a date column.
- Links to other sites get an arrow on their own.
- Two or more images in one paragraph become a gallery.
- `<!-- github:pinned -->` lists their pinned GitHub repos and stays current.
- A blank line is a paragraph. A single line break keeps lines close.
- No YAML frontmatter.

Pages that already use `===== Name =====` tabs and `{{muted}}` keep working. Keep their style when editing them; don't mix the two in one file.

## Voice

Write as them, in the first person. Short sentences. No marketing words.

## Done

Show them the draft and ask before you push. Then commit and push to the default branch. The page is `https://nomo.md/theirusername`, live within about a minute. Show them that URL, and mention they can add `.md` to it to see the source.
