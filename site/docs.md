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

`human.md` is the whole page. Photos and video go in `assets/`. In the file, point at them with `assets/me.jpg`, so they show on GitHub too.



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
**It's GitHub markdown**

`human.md` is plain markdown. It reads the same on GitHub, and Nomo lays it out as a page.

```md
![Nina Park](assets/me.jpg)

# Nina Park

Designer in Copenhagen.

## Work

- 2026 – now · [Harbor](https://harbor.dk) · Design lead
- 2023 · [Kite](https://kite.studio) · Identity and website
```



**Header photo**

An image at the very top of `human.md` becomes the header photo. Use `assets/me.jpg`, or your GitHub photo at `https://github.com/yourusername.png`.

```md
![image:100x140](assets/me.jpg)
```

Put `image:` and a size in place of the alt text to choose the size. Use `/nomo.png` there to get the Nomo mark instead.



**Tabs**

`# Your name` is your home tab. Each `##` heading after it starts another tab, with its own URL like `/yourusername/work`.

```md
# Nina Park

Designer in Copenhagen.

## Work

## Writing
```

Use `###` for a heading inside a tab. A page with no `##` headings is one page with no tabs.



**Lists that line up**

Separate parts of a list item with ` · `. The part after the first dot is muted. Put a second line in the item and it sits underneath, muted. Start an item with a year and the years line up in their own column.

```md
- [tinyqueue](https://github.com/sam/tinyqueue)
  A job queue in 300 lines of Go
- 2024 – now · Staff engineer · Acme
- 2021 · Joined Acme
```



**Links**

Links to other sites get an arrow. Links inside your page don't.



**Galleries**

Put two or more images in one paragraph and they become a gallery. Click one to open it. Video plays on a silent loop.

```md
![](assets/harbor.jpg)
![](assets/kite.webm)
![](assets/weekend.jpg)
```



**Your GitHub repos**

Put this line under a heading and Nomo fills it with your pinned GitHub repos, kept up to date.

```md
## Projects

<!-- github:pinned -->
```

On GitHub the line is hidden.



**Classic syntax**

Pages that use `===== Name =====` tabs, `{{muted}}`, `::small::`, `(([arrow links]))` and `[[gallery]]` keep working as they always have. New pages don't need them.



===== Recipes =====
**Developer**

```md
![Sam Rivera](assets/me.jpg)

# Sam Rivera

Software engineer in Toronto.
I build developer tools. Mostly TypeScript and Go.

[GitHub](https://github.com/sam) · [Email](mailto:sam@example.com)

## Projects

<!-- github:pinned -->

## Writing

- 2026 · [Why our sync engine is a log](https://example.com)
- 2025 · [Notes from rewriting a CLI in Go](https://example.com)
```



**Link in bio**

```md
![Alex Kim](assets/me.jpg)

# Alex Kim

I make videos about keyboards.

- [YouTube](https://youtube.com/@alex)
- [Instagram](https://instagram.com/alex)
- [Newsletter](https://alex.substack.com)
```



**Designer**

```md
![Nina Park](assets/me.jpg)

# Nina Park

Designer in Copenhagen. I make websites and printed things.

## Work

![](assets/harbor.jpg)
![](assets/kite.webm)
![](assets/weekend.jpg)

- 2026 · Harbor · Website
- 2025 · Kite · Identity
```



**Student**

```md
# Priya Shah

Computer science at Waterloo, class of 2027.
Looking for a summer 2026 internship in systems or infra.

[Resume](assets/resume.pdf) · [GitHub](https://github.com/priya)

## Projects

- [raft-lite](https://github.com/priya/raft-lite)
  Raft in Rust, for a distributed systems class
```
