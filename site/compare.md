===== Overview =====
**Nomo compared to other personal sites.**

Nomo is a free page at `nomo.md/you`, made from one markdown file in your GitHub. It suits a developer who wants a simple personal site or portfolio they fully own, written by hand or by an agent.

It's not the right pick if you need your own domain today, a visual editor, a shop, or a big custom design.

- (([GitHub profile README](/compare/github-readme))) {{when to use which}}
- (([Linktree](/compare/linktree))) {{a list of links vs a page}}
- (([Carrd](/compare/carrd))) {{design control vs one file}}
- (([A hand-built site](/compare/hand-built))) {{Astro, Hugo, Jekyll, GitHub Pages}}
- (([Bento](/compare/bento))), (([Read.cv](/compare/read-cv))) and (([Polywork](/compare/polywork))) {{all shut down}}



**At a glance**

- **Price:** free. MIT licensed.
- **Where it lives:** `human.md` in a public repo called `.nomo`, in your GitHub account.
- **Editing:** any editor, GitHub's web editor, or your coding agent. Push, and it's live in about a minute.
- **What you get:** tabs, a photo, images, galleries, video, links, and small or muted text. Light and dark themes.
- **Readable by machines:** server-rendered pages, a social card, structured data, and the raw markdown at `nomo.md/you.md`.
- **Not yet:** custom domains, analytics for your own page.



===== GitHub README =====
**Nomo vs a GitHub profile README**

A profile README is a `README.md` in a repo named after your username. It shows at the top of `github.com/you`.

- **Use a README** for a short intro to people already looking at your code. It sits above your pinned repos and contribution graph, inside GitHub's layout.
- **Use Nomo** for a page of your own to put in your bio, email signature or CV. It has tabs, a photo, galleries, and nothing else on the page.

They work well together. Both are markdown in your GitHub, and you can link each one from the other.

```md
[My page](https://nomo.md/you)
```



===== Linktree =====
**Nomo vs Linktree**

Linktree is a list of buttons on an account you rent. It's quick, and it has themes, a shop, and analytics on paid plans.

- **Use Linktree** if all you need is a set of links, especially for a creator audience, and you want click stats.
- **Use Nomo** if you want to say who you are, not only where to find you. It's your own words in your repo, free, and a list of links is one of the things it does well.

A link-in-bio page on Nomo:

```md
![image:88x88](/assets/me.jpg)

===== Sam Rivera =====

Writing about developer tools.

(([Newsletter](https://example.com)))
(([YouTube](https://youtube.com/@sam)))
(([GitHub](https://github.com/sam)))
```

{{::More in the (([recipes](/docs/recipes))).::}}



===== Carrd =====
**Nomo vs Carrd**

Carrd builds one-page sites in a visual editor. It gives you far more design control, and a custom domain on its Pro Standard plan for $19 a year.

- **Use Carrd** if you want to design the page yourself, need your own domain today, or want forms and embeds.
- **Use Nomo** if you'd rather write than design. It's free, it's a text file you can diff and hand to an agent, and it looks good without any choices.



===== Hand-built =====
**Nomo vs a hand-built site**

A site you build with Astro, Hugo, Jekyll or Next.js and host on GitHub Pages, Netlify or Vercel can be anything at all.

- **Build your own** if the site is itself the portfolio piece, or you want a blog with RSS, your own domain, and full control.
- **Use Nomo** if you'd rather not keep a build, hosting and dependencies running for a page that changes twice a year. It's one file, and there's nothing to upgrade.

If you outgrow Nomo, `human.md` is plain markdown. Take it with you.



===== Bento =====
**Bento alternative**

Bento made grid-style link-in-bio pages. Linktree bought it in 2023 and shut it down in February 2025, and pages had to move or disappear.

Nomo can't go away like that. Your page is `human.md` in your own GitHub repo. If Nomo shut down, you'd still have the file, and any markdown viewer could show it.

Moving from Bento: list your links and a line about you, then start with the (([link-in-bio recipe](/docs/recipes))). Or ask your agent:

```
Make me a Nomo page from these links. Follow https://nomo.md/AGENTS.md
```



===== Read.cv =====
**Read.cv alternative**

Read.cv was a clean, professional profile for designers and developers. Its team joined Perplexity and the service shut down in 2025.

Nomo keeps the same quiet, text-first feel: a photo, a few lines about you, and tabs for work, writing or a timeline. The difference is that the page is a file you own.

If you exported your Read.cv profile, give it to your agent:

```
Turn my Read.cv export into a Nomo page. Follow https://nomo.md/AGENTS.md
```



===== Polywork =====
**Polywork alternative**

Polywork let people share a timeline of what they worked on. It shut down in January 2025.

A timeline on Nomo is a tab in `human.md`:

```md
===== Timeline =====

**2026** Shipped tinyqueue 1.0 {{A job queue in 300 lines.}}

**2025** Joined Acme as a staff engineer.

**2024** Spoke at JSConf about background jobs.
```

It's in your repo, so it stays as long as you want it to.
