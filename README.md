# Nomo

Nomo is a markdown-first frontend for GitHub-backed profile pages.

The app has a small native shell:

- `/` for the landing page
- `/docs` for end-user docs
- `/404` as the not-found fallback

Everything else is treated as a GitHub username. Nomo fetches `human.md` from that user's public `.nomo` repo and renders it as a page.

## Local Development

```bash
bun install
bun run dev
```

Other useful commands:

```bash
bun run build
bun run lint
```

## How It Works

The profile route model is:

- `/:username` -> `.nomo/human.md`
- `/:username/:slug` -> `.nomo/content/:slug.md`

When profile content references `/assets/...`, Nomo rewrites that path against the same GitHub repo.

## Project Structure

```txt
src/
├─ App.tsx
├─ styles/
│  └─ index.css
└─ lib/
   ├─ content/
   │  ├─ pages.ts
   │  ├─ paths.ts
   │  └─ types.ts
   ├─ markdown/
   │  ├─ components.tsx
   │  ├─ Gallery.tsx
   │  ├─ media.ts
   │  └─ plugins.ts
   └─ theme/
      └─ pagePresentation.ts
```

Native app pages live in `pages/`:

```txt
pages/
├─ home.md
├─ docs.md
└─ 404.md
```

Theme JSON files live in `public/themes/`.

## Content Rules

Frontmatter supports:

- `align`
- `theme`
- `font`
- `fontsize`

Custom markdown currently supports:

- badges with `((...))`
- muted text with `{{...}}`
- inline image sizing like `![image:100]` and `![image:100x140]`
- gallery blocks with:

```txt
[[gallery]]
/assets/one.jpg
/assets/two.mp4
/assets/three.jpg
[[/gallery]]
```

## Notes

- `.nomo` is ignored locally so you can keep a personal test repo shape in the project root without committing it
- `public/nomo.svg` is the shared app icon/favicon
- Vite is configured to split markdown, router, and React into separate chunks for cleaner production output
