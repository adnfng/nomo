---
theme: system
font: system
fontsize: 15px
align: top
---

![nomo:28](/nomo.svg)


#### Content & Assets

If you want local images or video or additional pages, add them to an `assets/` folder or `content/` folder respectively.

```txt
.nomo/
├─ human.md
├─ content/
│  ├─ blogpost.md
│  ├─ project.md
├─ assets/
│  ├─ image.png
│  ├─ avatar.png
```

Then reference them directly in markdown. For example, if you have an image in `assets/me.jpg`, you can reference it like this:

```md
![portrait](/assets/me.jpg)
```

And for additional pages in `content/`, you can link to them like this:

```md
[blogpost](/content/blogpost)
```

Nomo automatically handles content routing for you, so clicking the link will take you to `nomo.md/githubusername/blogpost`.



#### Frontmatter

```yaml
---
align: top
theme: system
font: system
fontsize: 14.4px
---
```

Frontmatter controls the presentation of the page, giving you control over the layout, theme, and font. Supported keys are:

`align` Can be `top`, `middle`, or `bottom`.

`theme` can be `light`, `dark`, or `system`.

`font` can be `system` or a Google Font name like `Open Sans`.

`fontsize` sets the base font size.



#### Custom markdown

Nomo comes with a set of custom markdown flavours and elements to help you style your page.


##### Muted text looks like {{this}}.

```md
{{muted text}}
```


Badges look like ((this)) and linked badges work too: (([example](https://example.com))). 

```md
((this))
(([example](https://example.com)))
```



![nomo:180](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) ![nomo:100x140](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

Images support sizing, using obsidian syntax. You can chose to set a fixed width, or control both width and height. using the following syntax:

```md
![image:180](image.png)
![image:100x140](image.png)
```



[[gallery]]
https://images.unsplash.com/photo-1626470601402-5c6e8b2dc8d7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZXhwZXJpbWVudGFsfGVufDB8fDB8fHww
https://images.unsplash.com/photo-1625039162908-19d625adbaac?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGV4cGVyaW1lbnRhbHxlbnwwfHwwfHx8MA%3D%3D
https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZXhwZXJpbWVudGFsfGVufDB8fDB8fHww
[[/gallery]]
Nomo also has a custom component for image galleries. Images in a gallery with open as a lightbox when clicked and viewed.

```txt
[[gallery:192x108]]
/assets/one.jpg
/assets/two.mp4
/assets/three.jpg
[[/gallery]]
```