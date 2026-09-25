![](/nomo.png)

===== Nomo =====
**Your personal site is one markdown file.**

{{A free, open-source page at nomo.md/you, made from a `human.md` in your GitHub. No account, no build step.}}

[[username]]

{{::Type your GitHub username to see your page, or a preview of it.::}}





**Start with the template**

```bash
gh repo create .nomo --public --clone --template adnfng/.nomo
```

{{::Or tell your agent. (([See how](/agents)))::}}





**It's plain markdown**

```md
![Sam Rivera](assets/me.jpg)

# Sam Rivera

Software engineer in Toronto.

## Projects

- [tinyqueue](https://github.com/sam/tinyqueue) · A job queue in 300 lines
```

{{::`# Your name` is home and each `##` is a tab. (([See the syntax](/docs/syntax)))::}}





**People on Nomo**

- (([Aidan Fang](/adnfng))) {{designer, Shanghai}}
- (([Nikit Hamal](/nikithamal))) {{Android developer, Nepal}}
- (([verycracked](/verycracked))) {{design engineer, San Francisco}}





**Questions**


Is it free?
{{Yes. Nomo is free and MIT licensed.}}


How fast do edits show up?
{{About a minute after you push.}}


Does it look right on GitHub too?
{{Yes. `human.md` is plain GitHub markdown, so it reads fine in the repo.}}


Can I use my own domain?
{{Not yet. Your page lives at `nomo.md/you`, and `nomo.fyi/you` works for sites that block `.md` links.}}


Can the repo be private?
{{No. Nomo reads the public `human.md`, the same file anyone can see on GitHub.}}


What if Nomo shuts down?
{{You keep `human.md`. It's plain markdown in your repo, so you can render it anywhere.}}


Where's the code?
{{On (([GitHub](https://github.com/adnfng/nomo))). Issues and pull requests are welcome.}}
