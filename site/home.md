![](/nomo.png)

===== Nomo =====
**Your personal site is one markdown file.**

{{A free, open-source page at nomo.md/you. It's made from a `human.md` in your GitHub, with no account and no build step.}}

[[username]]

{{::Type your GitHub username to see your page, or a preview of it.::}}



**AGENTS.md is for your agents. human.md is for humans.**

Make a public repo called `.nomo` and put a `human.md` in it. That file is your page. Push a change and it's live within a minute.

```bash
gh repo create .nomo --public --clone --template adnfng/.nomo
```

{{::No terminal? (([Use the template on GitHub](https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public)))::}}



**Or tell your agent:**

```
Set up my Nomo page. Follow https://nomo.md/AGENTS.md
```



**It looks like this.**

```md
![image:100x140](/assets/me.jpg)

===== Sam Rivera =====

Software engineer in Toronto.
I build developer tools. Mostly TypeScript and Go.

[GitHub](https://github.com/sam) · [Email](mailto:sam@example.com)

===== Projects =====

[tinyqueue](https://github.com/sam/tinyqueue) {{A job queue in 300 lines.}}
```

Tabs, photos, galleries and small or muted text. All of it is markdown. (([See the syntax](/docs/syntax)))



**People on Nomo**

- (([Aidan Fang](/adnfng))) {{designer, Shanghai}}
- (([Nikit Hamal](/nikithamal))) {{Android developer, Nepal}}
- (([verycracked](/verycracked))) {{design engineer, San Francisco}}



**It can't be taken away.**

Bento, Read.cv and Polywork all shut down, and the pages people made there went with them. A Nomo page is a file in your own repo. If Nomo disappeared tomorrow, you'd still have it, and any markdown viewer could show it.



**Compared to the usual**

- **A GitHub profile README** lives inside GitHub's layout. Nomo gives you a page of your own.
- **Linktree** is a list of links on someone else's account. Nomo is your own words, in your repo.
- **Carrd** gives you more design control, and your own domain for $19 a year. Nomo is free and it's text, but there are no custom domains yet.
- **A hand-built site** can be anything, but you look after the build, hosting and domain. Nomo is one file.

{{::(([More comparisons](/compare)))::}}



**Questions**

**Is it free?** Yes. Nomo is free and MIT licensed.

**How fast do edits show up?** About a minute after you push.

**Can my agent write it?** Yes. Point it at (([AGENTS.md](/AGENTS.md))). It creates the repo and writes a first draft from your GitHub profile, and asks before it pushes anything.

**Can I use my own domain?** Not yet. Your page lives at `nomo.md/you`, and `nomo.fyi/you` works too for sites that block `.md` links.

**Can the repo be private?** No. Nomo reads the public `human.md`, the same file anyone can see on GitHub.

**What if Nomo shuts down?** You keep `human.md`. It's plain markdown in your repo, so you can render it anywhere.



{{::See an (([example page](/adnfng))). Read the (([docs](/docs))).::}}
