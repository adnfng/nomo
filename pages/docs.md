===== Getting started =====

Nomo turns a public GitHub repo named `.nomo` into a profile page.

Fork [the `.nomo` template](https://github.com/adnfng/.nomo) and keep the name `.nomo`. Then open `nomo.md/yourusername`.

```bash
gh repo fork adnfng/.nomo --clone
```

If a platform refuses `.md` links, use `nomo.fyi/yourusername` as a redirect for now.

See [Aidan’s page](/adnfng) for a live example.

===== Your page =====

The template is a `human.md` you edit. That file is your page.

You can also start from an empty public repo named `.nomo` and add `human.md` yourself.

```txt
.nomo/
├─ human.md
```

That is enough. One file, one page.

A photo at the top of the file becomes the header. Use a normal markdown image, and size it if you want:

```md
![image:100x140](/assets/me.jpg)
```

`/nomo.png` or `/nomo.svg` in that spot renders the Nomo mark.

Start with a tab for your name. That is the home page.

```md
![image:100x140](/assets/me.jpg)

===== Joe Bloggs =====

Designer in London.

===== Timeline =====

### 2026

Started something new.
```

Each `===== Name =====` is a tab. The first one is home. The rest get URLs like `/yourusername/timeline`.

You do not need extra files for this. Keep using one `human.md`.

If you already have pages in a `content/` folder, those still work.

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

===== Syntax =====

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
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60
[[/gallery]]

```md
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

Older `((badge))` syntax is just text. A badge that was a link is still a link.
