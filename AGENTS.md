# Working on Nomo

Nomo renders a public `.nomo/human.md` from GitHub at `nomo.md/<username>`. This file is for working on the Nomo site itself. The guide for setting up a page is `public/AGENTS.md`.

## Run it

- `bun install`, then `bun dev`
- `bun run check` before you're done: types, lint, tests, build
- `NOMO_PREVIEW_DIR=../my/.nomo bun dev` shows a local `.nomo` folder at `/preview`

## Where things are

- `src/app/` holds routes. `[[...path]]` renders home, docs, changelog and every profile.
- `src/lib/content/` parses `human.md`: tabs, header, galleries. It has no DOM or Next imports, so it's tested directly.
- `src/lib/markdown/` renders markdown and the custom syntax.
- `site/*.md` are the site's own pages. They are markdown, rendered by the same engine users get.
- `src/proxy.ts` sets 404 status and logs crawler visits.

## Design rules

- One 450px column. Geist 400/500, and Geist Mono for code only.
- Colors come from the CSS variables in `src/styles/index.css`. No new colors, gradients or shadows.
- Hierarchy comes from muted and small text, not boxes or big headings.
- Motion is 140–220ms with `cubic-bezier(0.23, 1, 0.32, 1)`, and is off under reduced motion.
- New native pages are markdown in `site/`. New UI should look like part of the text.
- Check light and dark themes, and widths of 540px and under.

## Changes

- Add a user-facing line under `Unreleased` in `site/changelog.md`. Write what the user gets, in plain words.
- Keep `human.md` compatible. Pages that render today must render the same way. The tests in `tests/fixtures` are the contract.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
