---
nomo:
  version: 2
  layout: portfolio
  name: Nomo
  avatar: /nomo.png
  pages:
    - label: Nomo
      href: /
    - label: Docs
      href: /content/docs
    - label: Changelog
      href: /content/changelog
theme: light
---

Nomo starts with one public GitHub repo: `.nomo`.

Inside it, you add `human.md`. That file is your page at `nomo.md/yourusername`.

If a platform refuses `.md` links, you can use `nomo.fyi/yourusername` as a redirect for now.

#### One file

Create a public repo named `.nomo`.

Add `human.md` to the root and write in markdown.

Open it at `nomo.md/yourusername`.

```txt
.nomo/
├─ human.md
```

That is enough. One file, one page.

#### More tabs

To add another tab, put a heading like this at the bottom of the same `human.md`:

```md
===== Timeline =====

### 2026

Started something new.

===== Gallery =====

[[gallery]]
/assets/one.jpg
/assets/two.webm
[[/gallery]]
```

Everything above the first `=====` is your main page. Each `===== Name =====` becomes a tab. The name in the heading is the tab label, and the URL is `/yourusername/name`.

So `===== Timeline =====` is `nomo.md/yourusername/timeline`. Opening that link goes straight to that tab.

You do not need extra files for this. Keep using one `human.md`.

If you already have pages in a `content/` folder, those still work.

#### Images and files

Add an `assets/` folder for images and video.

```md
![portrait](/assets/me.jpg)
```

```txt
.nomo/
├─ human.md
└─ assets/
   ├─ me.jpg
   └─ film.webm
```

Internal Nomo links stay in the same tab. External links open in a new tab.

#### Frontmatter

Optional settings at the top of `human.md`:

```yaml
---
nomo:
  version: 2
  layout: portfolio
  name: Your Name
  avatar: /assets/me.jpg
theme: light
---
```

`name` is the first tab. `avatar` is the photo above the tabs.

`theme` can be `light`, `dark`, or `system`. `font` can be `system`, `Helvetica Neue`, or a Google Font name. `fontsize` sets the base size.

#### Markdown extras

Muted text looks like {{this}}.

```md
{{muted text}}
```

Images can be sized by width, or given a fixed frame:

![portrait:180](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop) ![portrait:100x140](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop)

```md
![image:180](/assets/me.jpg)
![image:100x140](/assets/me.jpg)
```

The same syntax works with a video file. Videos loop, muted, with no controls.

Galleries:

[[gallery]]
https://images.unsplash.com/photo-1626470601402-5c6e8b2dc8d7?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1625039162908-19d625adbaac?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60
[[/gallery]]

```txt
[[gallery]]
/assets/one.jpg
/assets/two.webm
/assets/three.jpg
[[/gallery]]
```

A timeline block turns headings into quiet labels:

[[timeline]]
### 2026

Started something new.

### 2025

Shipped the first version.
[[/timeline]]

```md
[[timeline]]
### 2026

Started something new.
[[/timeline]]
```

Older `((badge))` and `(( [link](https://nomo.md) ))` syntax still works. Badges now render as muted text, and linked badges render as ordinary links.
