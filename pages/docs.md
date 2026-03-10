---
theme: system
font: system
fontsize: 15px
align: top
---

![nomo:28](/nomo.svg)

Nomo starts with one public GitHub repo: `.nomo`.

Inside it, you add `human.md`. That becomes your main page at `nomo.md/githubusername`.

If a platform refuses `.md` links, you can use `nomo.fyi/githubusername` as a redirect for now.

#### Repo setup

Create a public repo named `.nomo`.

Add `human.md` to the root.

Write your page in markdown.

Open it at `nomo.md/githubusername`.

```txt
.nomo/
├─ human.md
```

#### Content & assets

If you want local images or video, add an `assets/` folder.

If you want more pages, add a `content/` folder.

```txt
.nomo/
├─ human.md
├─ content/
│  ├─ blogpost.md
│  └─ project.md
└─ assets/
   ├─ image.png
   └─ avatar.png
```

Reference local files like this:

```md
![portrait](/assets/me.jpg)
```

Link to extra pages like this:

```md
[blogpost](/content/blogpost)
```

That route becomes `nomo.md/githubusername/blogpost`.

Internal Nomo links stay in the same tab. External links open in a new tab.

#### Frontmatter

```yaml
---
align: top
theme: system
font: system
fontsize: 14.4px
---
```

`align` can be `top`, `middle`, or `bottom`.

`theme` can be `light`, `dark`, `adn`, or `system`.

`font` can be `system` or a Google Font name like `Open Sans`.

`fontsize` sets the base font size.

#### Custom markdown

Muted text looks like {{this}}.

```md
{{muted text}}
```

Badges look like ((this)).

Linked badges work too: (([example](https://example.com))).

```md
((this))
(([example](https://example.com)))
```

Images support sizing with a fixed width or a fixed frame:

![nomo:180](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) ![nomo:100x140](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

```md
![image:180](image.png)
![image:100x140](image.png)
```

Galleries use the same markdown-first block syntax:

[[gallery]]
https://images.unsplash.com/photo-1626470601402-5c6e8b2dc8d7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZXhwZXJpbWVudGFsfGVufDB8fDB8fHww
https://images.unsplash.com/photo-1625039162908-19d625adbaac?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGV4cGVyaW1lbnRhbHxlbnwwfHwwfHx8MA%3D%3D
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZXhwZXJpbWVudGFsfGVufDB8fDB8fHww
[[/gallery]]

```txt
[[gallery]]
/assets/one.jpg
/assets/two.mp4
/assets/three.jpg
[[/gallery]]
```
