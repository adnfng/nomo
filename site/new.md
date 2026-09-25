%% ask
**Make your Nomo page.**

{{Type your GitHub username. You'll see a preview of your page, and you can make it yours from there.}}

[[username]]

%% intro
**Make nomo.md/%user% yours.**

{{Your page is one markdown file in a public `.nomo` repo on your GitHub. Your agent can set it up in a few minutes.}}

%% agent
**Tell your agent**

```
Make my Nomo page at nomo.md/%user%. Draft it from my GitHub profile and show me before you push. Follow https://nomo.md/AGENTS.md
```

{{::Paste it into Claude Code, Cursor, Codex or any agent that can run `gh`. It creates the repo, asks a few questions, and waits for your okay.::}}

%% signin
**Or sign in with GitHub**

Nomo creates a public `.nomo` repo in your account. The preview becomes your first `human.md`, and your GitHub photo becomes the header photo. The page is live right after.

(([Continue with GitHub](/api/claim/start?user=%user%)))

{{::You can only claim your own username. Nomo asks for access to create that one repo, keeps no account, and discards the sign-in once the repo exists.::}}

%% manual
**Or do it yourself**

```bash
gh repo create .nomo --public --clone --template adnfng/.nomo
```

{{::No terminal? (([Use the template on GitHub](https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public)))::}}

%% error-mismatch
{{You signed in as @%as%. You can only claim your own page, so sign in as @%user%, or go to (([nomo.md/%as%](/%as%))).}}

%% error-expired
{{That sign-in took too long. Try again.}}

%% error-cancelled
{{Sign-in was cancelled. Nothing was changed.}}

%% error-github
{{GitHub didn't let Nomo create the repo. Try again, or do it yourself below.}}
