**Let your agent make your page.**

{{Paste this into Claude Code, Cursor, Codex or any agent that can run `gh`.}}

```
Set up my Nomo page. Follow https://nomo.md/AGENTS.md
```

{{::It creates your `.nomo` repo, drafts `human.md` from your GitHub profile, asks a few questions, and asks before it pushes.::}}





**Already have a page?**

```
My Nomo page lives in github.com/yourusername/.nomo. Clone it and help me update human.md. Follow https://nomo.md/AGENTS.md
```





**Install the skill**

```bash
npx skills add adnfng/nomo
```

{{::Your agent then knows Nomo whenever you ask for a personal site, portfolio or link in bio.::}}





**What agents can read**

- (([AGENTS.md](/AGENTS.md))) {{the setup guide}}
- (([llms.txt](/llms.txt))) {{what Nomo is, in one file}}
- `nomo.md/you.md` {{the markdown behind any page}}
