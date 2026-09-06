<div align="center">
  <img src="./public/nomo.svg" alt="Nomo logo" width="64" height="64" />
  <h3>NOMO</h3>
  <p>A markdown-first frontend for GitHub-backed profile pages.</p>
  <a href="https://nomo.md">Website</a> | <a href="https://nomo.md/docs">Docs</a>
  <br/><br/>
  <div>
    <a href="https://gitviews.com/">
      <img src="https://gitviews.com/repo/adnfng/nomo.svg" alt="Repo Views" />
    </a>
  </div>
</div>

---

### What Is Nomo?

**Nomo** turns a public `.nomo` GitHub repo into a profile page.

Primary routes live on `nomo.md`. There is also a `nomo.fyi` redirect layer for places like X that currently reject `.md` domains in profile links.

The route model is simple:

- `/:username` -> that user’s public `.nomo` repo (`human.md`)
- `/:username/:slug` -> a tab in `human.md`, or `.nomo/content/:slug.md`

When profile content references `/assets/...`, Nomo rewrites that path against the same repo automatically.

The app also ships with a small native shell:

- `/` for the landing page
- `/docs` for end-user docs
- `/adnfng` for the site owner’s page, loaded from this repo, not GitHub
- `/404` for the not-found fallback

---

### Getting Started

1. Install dependencies:

```bash
bun install
```

2. Start the dev server:

```bash
bun run dev
```

3. Build for production:

```bash
bun run build
```

4. Run lint:

```bash
bun run lint
```

---

### Project Structure

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

Native app pages live in:

```txt
pages/
├─ home.md
├─ docs.md
├─ changelog.md
└─ 404.md
```

Theme files live in:

```txt
public/themes/
```

---

### Content Rules

A leading markdown image becomes the header photo. Tabs come from `===== Name =====` headings in the same file. Theme follows the system color scheme.

Custom markdown supports:

- muted text with `{{...}}`
- small text with `::...::`
- arrow links with `(( [nomo](https://nomo.md) ))`
- inline image sizing like `![image:100]` and `![image:100x140]`
- gallery blocks with:

```txt
[[gallery]]
/assets/one.jpg
/assets/two.mp4
/assets/three.jpg
[[/gallery]]
```

---

### Notes

- `.nomo` is ignored locally so you can keep a personal test repo shape in the project root without committing it
- `public/nomo.svg` is the shared app icon and favicon
- Vite splits markdown, router, and React into separate chunks for production
