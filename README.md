<div align="center">
  <img src="./public/nomo.svg" alt="Nomo" width="64" height="64" />
  <h3>Nomo</h3>
  <p>Your personal site is one markdown file.</p>
  <a href="https://nomo.md">Website</a>
  ·
  <a href="https://nomo.md/docs">Docs</a>
  ·
  <a href="https://nomo.md/changelog">Changelog</a>
</div>

<br />

<p align="center"><a href="https://nomo.md/adnfng"><img src="https://nomo.md/api/og/adnfng" alt="A Nomo page" width="600" /></a></p>

Nomo is a free personal site for developers, made from one markdown file in your GitHub. Make a public repo called `.nomo`, put a `human.md` in it, and it's your page at `https://nomo.md/your-username`. No account, no build step, nothing to host.

**AGENTS.md is for your agents. human.md is for humans.**

## Start

```bash
gh repo create .nomo --public --clone --template adnfng/.nomo
```

Edit `human.md`, push, and open `https://nomo.md/your-username`. No terminal? [Use the template on GitHub](https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public).

Or tell your agent:

```
Set up my Nomo page. Follow https://nomo.md/AGENTS.md
```

Or type your GitHub username on [nomo.md](https://nomo.md) to see a preview of your page first.

## Why

- **You own it.** Bento, Read.cv and Polywork shut down and took people's pages with them. A Nomo page is a file in your repo. If Nomo went away you'd still have it.
- **It's markdown.** Tabs, photos, galleries, and small and muted text are a few bits of syntax on top. [See the syntax](https://nomo.md/docs/syntax).
- **Agents can write it.** One file with a short [guide](https://nomo.md/AGENTS.md) is easy for Claude Code, Cursor or Codex to set up and keep current.
- **Machines can read it.** Pages are rendered on the server with proper metadata, and `nomo.md/you.md` returns the source.

## Badge

Add this to your GitHub profile README:

```md
[![nomo.md/you](https://nomo.md/badge.svg?user=you)](https://nomo.md/you)
```

Add `&theme=light` for a light badge.

## Develop

```bash
bun install
bun dev
```

`bun run check` runs types, lint, tests and a build. See [AGENTS.md](./AGENTS.md) for how the code is laid out, and [.env.example](./.env.example) for settings. To preview a local `.nomo` folder, set `NOMO_PREVIEW_DIR` and open `/preview`.

Pull requests are welcome. Anything a user can see gets a line in [the changelog](./site/changelog.md).

## License

[MIT](./LICENSE)
