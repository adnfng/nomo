===== Quickstart =====
**A page in a minute.**

1. Make a public repo called `.nomo` from the template.
2. Edit `human.md`. It's markdown.
3. Push. Your page is at `nomo.md/your-username`.

```bash
gh repo create .nomo --public --clone --template adnfng/.nomo
cd .nomo
```

{{::No terminal? (([Use the template on GitHub](https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public))), then edit `human.md` in the browser.::}}



**What's in the repo**

```txt
.nomo/
├─ human.md
└─ assets/
   └─ me.jpg
```

`human.md` is the whole page. Photos and video go in `assets/`. In the file, point at them with `/assets/me.jpg`.



**Let your agent do it**

```
Set up my Nomo page. Follow https://nomo.md/AGENTS.md
```

It works in Claude Code, Cursor, Codex and anything else that can run `gh`. The agent creates the repo, drafts `human.md` from your GitHub profile, and asks before pushing.



**Good to know**

- The repo has to be public, named `.nomo`, with `human.md` at the top, on `main` or `master`.
- Changes show up about a minute after you push.
- Add `.md` to your page URL to see the file Nomo reads, like `nomo.md/adnfng.md`.
- If a site blocks `.md` links, share `nomo.fyi/you`. It's the same page.



===== Syntax =====
**Header photo**

![image:100x140](https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop)

An image at the very top of `human.md` becomes the header photo. Set its size after `image:`.

```md
![image:100x140](/assets/me.jpg)
```

Use `/nomo.png` or `/nomo.svg` there to get the Nomo mark instead.



**Tabs**

```md
===== Nina Park =====

Designer in Copenhagen.

===== Work =====

{{::2026::}}
Started something new.
```

`===== Name =====` starts a tab. The first one is your home page, and its name is your name. The others get their own URL, like `/yourusername/work`.

Keep everything in one `human.md`. Extra files in `content/` still work if you already have them.



**Muted and small text**

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

A normal link stays a normal link. Wrap it in `(( ))` to add the arrow.



**Images**

```md
![image:180](/assets/me.jpg)
![image:100x140](/assets/me.jpg)
```

![image:180](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop) ![image:100x140](https://images.unsplash.com/photo-1545285446-ff15b9e9b9b9?q=80&w=1470&auto=format&fit=crop)

`image:180` sets the width. `image:100x140` sets width and height.



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

Photos and video, one per line. Click one to open it. Video plays on a silent loop.



**Spacing**

A blank line starts a new paragraph. A single line break keeps the lines close. More blank lines add more space.



===== Recipes =====
**Developer**

```md
![image:100x140](/assets/me.jpg)

===== Sam Rivera =====

Software engineer in Toronto.
I build developer tools. Mostly TypeScript and Go.

[GitHub](https://github.com/sam) · [Email](mailto:sam@example.com)

===== Projects =====

[tinyqueue](https://github.com/sam/tinyqueue) {{A job queue in 300 lines of Go.}}
[dotfiles](https://github.com/sam/dotfiles) {{How my machine is set up.}}

===== Writing =====

{{::2026::}}
[Why our sync engine is a log](https://example.com)
```



**Link in bio**

```md
![image:88x88](/assets/me.jpg)

===== Alex Kim =====

I make videos about keyboards.

(([YouTube](https://youtube.com/@alex)))
(([Instagram](https://instagram.com/alex)))
(([Newsletter](https://alex.substack.com)))
```



**Designer**

```md
![image:100x140](/assets/me.jpg)

===== Nina Park =====

Designer in Copenhagen. I make websites and printed things.

===== Work =====

[[gallery]]
/assets/harbor.jpg
/assets/kite.webm
/assets/weekend.jpg
[[/gallery]]

Harbor {{website, 2026}}
Kite {{identity, 2025}}
```



**Student**

```md
===== Priya Shah =====

Computer science at Waterloo, class of 2027.
Looking for a summer 2026 internship in systems or infra.

[Resume](/assets/resume.pdf) · [GitHub](https://github.com/priya)

===== Projects =====

[raft-lite](https://github.com/priya/raft-lite) {{Raft in Rust, for a distributed systems class.}}
```
