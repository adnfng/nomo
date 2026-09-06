===== Customization =====
**Your page is the profile.**

```txt
.nomo/
├─ human.md
└─ assets/
   └─ me.jpg
```

The template is a .nomo repo with `human.md` and an `assets/` folder.
Drop photos and video in assets/. In the file, point at them with `/assets/me.jpg`.




**Adding images:**

![image:100x140](https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop)

A normal image at the top of `human.md` becomes the avatar.
Swap `assets/me.jpg` for yours and resize if needed.


```md
![image:100x140](/assets/me.jpg)
```

adding `/nomo.png` or `/nomo.svg` in that spot adds the Nomo mark.




**Want to add tabs?**

```md
===== Nina Park =====

Designer in Copenhagen.

===== Work =====

{{::2026::}}

Started something new.
```

`===== Name =====` is a tab. The first one is home.
The rest get URLs like `/yourusername/work`.

Keep it in one `human.md`. Extra files in `content/` still work if you already have them.




**How to add a gallery:**

[[gallery]]
https://images.unsplash.com/photo-1626470601402-5c6e8b2dc8d7?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1625039162908-19d625adbaac?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60
[[/gallery]]

A list of images or video. Click one to open it in lightbox view.

```md
[[gallery]]
/assets/one.jpg
/assets/two.webm
/assets/three.jpg
[[/gallery]]
```



===== Syntax =====
**The marks.**

```md
{{muted text}}
::small text::
{{::muted and small::}}
```

{{muted text}}
::small text::
{{::muted and small::}}




**Links**

```md
[nomo](https://nomo.md)
(([nomo](https://nomo.md)))
```

[nomo](https://nomo.md)
(([nomo](https://nomo.md)))

A normal link stays a normal link.
Wrap it in `(( ))` for the up-right arrow.




**Images**

```md
![image:180](/assets/me.jpg)
![image:100x140](/assets/me.jpg)
```

![image:180](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop) ![image:100x140](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop)




**Gallery**

```md
[[gallery]]
/assets/one.jpg
/assets/two.webm
[[/gallery]]
```

[[gallery]]
https://images.unsplash.com/photo-1626470601402-5c6e8b2dc8d7?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1625039162908-19d625adbaac?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?w=800&auto=format&fit=crop&q=60
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60
[[/gallery]]


**Tabs**

```md
===== Home =====

===== Work =====
```


