# create-nomo

Make your [Nomo](https://nomo.md) page from the terminal.

```bash
npx create-nomo
```

It uses the GitHub CLI (`gh`) to find your account, drafts a `human.md` from your public GitHub profile, shows it to you, and after you say yes, creates a public `.nomo` repo from the template and pushes it. Your page is live at `https://nomo.md/your-username`.

If you already have a `.nomo` repo, nothing is changed.

- `--dry-run` shows the draft and stops.
- `--yes` skips the question.

Needs Node 20+ and a signed-in `gh` (`gh auth login`).
