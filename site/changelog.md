{{::2.0.0::}}

Nomo has been rewritten from the ground up. How pages are written, how they load and how you get started are all new. Your page is now plain GitHub markdown, so the same file reads well on GitHub and on nomo.md. Anyone can see a preview of their page before writing a line, and pages load faster and are easier to find and share. Every page that worked before still works, with nothing to change.


**Writing your page**

- Write in plain GitHub markdown. `# Your name` starts your page and each `##` heading becomes a tab.
- Lists with ` · ` line up into tidy rows, with years in their own column.
- Put `<!-- github:pinned -->` under any heading to list your pinned GitHub repos, always up to date.
- A run of images becomes a gallery, and links to other sites get an arrow on their own.
- Pages written with `=====` tabs look exactly as they did.


**Getting started**

- Visit `nomo.md/your-username` to see a preview of your page, built from your GitHub profile.
- Press Make it yours on the preview and sign in with GitHub. Nomo creates your `.nomo` repo with the preview as your first draft.
- Prefer the terminal? `npx create-nomo` does the same and shows you the draft first.
- Or ask your coding agent. It drafts your first `human.md` from your GitHub profile and asks before pushing. There's a Nomo skill you can install with `gh`, too.
- The template is a developer page with Projects and Writing, ready to edit. The docs have starting points for designers, students and link-in-bio pages.


**Sharing and being found**

- Pages load fully rendered, so they show up quickly and search engines and AI assistants can read them.
- Every page gets its own title and description from your `human.md`.
- Links to your page show a clean card with your photo, name, a short line about you and your Nomo badge.
- Search engines can tell the page is yours and connect it to your GitHub, X and other profiles.
- Add `.md` to any page to read its source, for example `nomo.md/adnfng.md`.
- Show off your page with a badge in your GitHub profile README: `nomo.md/badge.svg?user=you`.


**Around the site**

- A new home page. Type your GitHub username to jump to your page, or a preview of it.
- Docs, Agents, Compare and Changelog each have a tab. The docs cover a quickstart, the syntax and recipes.
- Compare shows how Nomo stacks up against a GitHub README, Linktree, Carrd and a hand-built site, and how to move over from Bento, Read.cv and Polywork.
- The footer stays at the bottom of the screen without covering your page, and shows when the page was last updated.
- A back link to home appears once you've left it.
- Addresses that don't match a page or a GitHub account get a proper not-found page.
- A sitemap, `robots.txt` and `llms.txt` help search engines and AI assistants find their way around.
- Set in Geist and Geist Mono.


**Privacy and licence**

- Analytics use no cookies and store no IP addresses, and Do Not Track is respected. Counts start fresh with this release.
- Nomo is MIT licensed.


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
