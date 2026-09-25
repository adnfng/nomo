{{::Unreleased::}}

- Nomo is now MIT licensed.
- The setup command now creates your own `.nomo` repo from the template, instead of cloning ours.
- Pages arrive fully rendered, so they show up faster and search engines and AI assistants can read them.
- Every page has its own title and description, taken from your `human.md`.
- A page that doesn't exist now returns a real 404.
- Nomo now uses Geist and Geist Mono.
- Links to your page now show a card with your photo, name and first line.
- Search engines see who the page belongs to, with links to your GitHub, X and other profiles.
- Add `.md` to any page to get its source, for example `nomo.md/adnfng.md`.
- Visiting `nomo.md/<username>` for someone without a page shows a preview built from their GitHub profile, with a link to make it theirs.
- Nomo now has a sitemap, `robots.txt`, and an `llms.txt` for AI assistants.
- A new home page. Type your GitHub username to see your page, or a preview of it.
- The docs are now Quickstart, Syntax and Recipes, with ready-made pages for developers, designers, students and link-in-bio.
- The template is now a developer page with Projects and Writing.
- Agents can draft your first `human.md` from your GitHub profile, and they ask before pushing.
- Make it yours: sign in with GitHub from your preview and Nomo creates your `.nomo` repo with the preview as your first draft. Then copy a prompt for your agent, or clone and edit.
- `npx create-nomo` does the same from the terminal, and shows you the draft first.
- A Nomo skill for coding agents, in `skills/nomo`.
- Honest comparisons with a GitHub README, Linktree, Carrd and a hand-built site, plus a way off Bento, Read.cv and Polywork, at `/compare`.
- A badge for your GitHub profile README: `nomo.md/badge.svg?user=you`.
- Analytics start fresh. No cookies, no stored IPs, and Do Not Track is respected. The old counter stopped at 645 views and 237 visits across 4 profiles.


{{::0.2.0::}}

- Tabs now live in `human.md` to keep it simple in a single page.
- Updated the docs for template support and syntax.
- Changelog added.
- `.nomo` now ships as beginner template.
- Added support for small text with `:: ::`
- Supporting both normal links and arrow links with syntax.
- Dropped badges w/ legacy support to render as normal text or links.
- Updated home with setup prompt agents can follow from `AGENTS.md`
- `/analytics` counts visits, views, and profiles from now on


{{::0.1.9::}}

- Light and dark theming now through toggle.
- Dropped frontmatter for theme, font, and layout w/ legacy support.
- Updated Markdown styling, spacings for legibility.
- Square bullets 
- A very spinny new logo


{{::0.1.2::}}

- nomo.fyi for sites that block `.md` links
- social cards


{{::0.1.1::}}

- pages from a public GitHub `.nomo` repo
- extra pages as separate files under `content/`
- images from `assets/`


{{::0.1.0::}}

- first version
