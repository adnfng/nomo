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

- `human.md` is the whole page.
- `assets/` holds photos and video. Replace `assets/me.jpg` with their photo, or use their GitHub avatar (`https://github.com/theirusername.png`).
- An image at the top is the header photo: `![image:100x140](/assets/me.jpg)`
- `/nomo.png` or `/nomo.svg` in that spot shows the Nomo mark instead.

## Syntax

Tabs. The first one is home, and its name is their name.

```md
===== Their Name =====

===== Projects =====
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

A blank line is a paragraph. A single line break keeps lines close.

No YAML frontmatter. No `[[timeline]]`. `((plain text))` is just text.

## Voice

Write as them, in the first person. Short sentences. No marketing words.

## Done

Show them the draft and ask before you push. Then commit and push to the default branch. The page is `https://nomo.md/theirusername`, live within about a minute. Show them that URL, and mention they can add `.md` to it to see the source.
