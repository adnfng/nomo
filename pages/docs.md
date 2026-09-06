===== Customization =====
**Your page is a file.**

The template is a .nomo repo with `human.md` and an `assets/` folder.
Drop photos and video in assets/. In the file, point at them with `/assets/me.jpg`.

```txt
.nomo/
├─ human.md
└─ assets/
   └─ me.jpg
```



**The photo**

A normal image at the top of `human.md` becomes the header.
Size it if you want. Swap `assets/me.jpg` for yours.

![portrait:100x140](https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop)

```md
![image:100x140](/assets/me.jpg)
```

`/nomo.png` or `/nomo.svg` in that spot is the Nomo mark.



**Tabs**

`===== Name =====` is a tab. The first one is home.
The rest get URLs like `/yourusername/work`.

```md
===== Nina Park =====

Designer in Copenhagen.

===== Work =====

{{::2026::}}

Started something new.
```

Keep it in one `human.md`. Extra files in `content/` still work if you already have them.



**Mute, small, arrows**

`{{this}}` goes quiet. Useful for dates, roles, or links you don’t want to shout.

{{September 2026 — present}}

```md
{{muted text}}
```

`::this::` is smaller than the body.
Dates often stack it with mute: `{{::2026::}}`.

A normal `[link](url)` has no icon.
`(([nomo](https://nomo.md)))` adds the up-right arrow.

The [syntax](/docs/syntax) tab is the short list.



**Gallery**

A list of images or video. Click one to open it.

[[gallery]]
https://images.unsplash.com/photo-1626470601402-5c6e8b2dc8d7?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1625039162908-19d625adbaac?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60
[[/gallery]]

```md
[[gallery]]
/assets/one.jpg
/assets/two.webm
/assets/three.jpg
[[/gallery]]
```

Videos loop, with no controls.

===== Syntax =====
**The marks.**

Mute, small, or both:

```md
{{muted text}}
::small text::
{{::muted and small::}}
```

{{muted text}}
::small text::
{{::muted and small::}}



**Links**

A normal link stays a normal link.
Wrap it in `(( ))` for the up-right arrow.

```md
[nomo](https://nomo.md)
(([nomo](https://nomo.md)))
```

[nomo](https://nomo.md)
(([nomo](https://nomo.md)))



**Images**

```md
![image:180](/assets/me.jpg)
![image:100x140](/assets/me.jpg)
```

![portrait:180](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop) ![portrait:100x140](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop)



**Gallery**

```md
[[gallery]]
/assets/one.jpg
/assets/two.webm
[[/gallery]]
```



**Tabs**

```md
===== Home =====

===== Work =====
```



`((this))` is still plain text.
`(([nomo](https://nomo.md)))` is the arrow link.
