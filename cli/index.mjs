#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const TEMPLATE = 'adnfng/.nomo';
const SITE = process.env.NOMO_SITE ?? 'https://nomo.md';
const args = new Set(process.argv.slice(2));
const yes = args.has('--yes') || args.has('-y');
const dryRun = args.has('--dry-run');

const dim = text => (process.stdout.isTTY ? `\x1b[2m${text}\x1b[0m` : text);

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function checkGh() {
  try {
    run('gh', ['--version']);
  } catch {
    fail(`create-nomo needs the GitHub CLI. Install it from https://cli.github.com, run \`gh auth login\`, then try again.\nOr make the repo in the browser: https://github.com/new?template_owner=adnfng&template_name=.nomo&name=.nomo&visibility=public`);
  }
  try {
    return run('gh', ['api', 'user', '--jq', '.login']);
  } catch {
    fail('Sign in to GitHub first: `gh auth login`');
  }
}

function repoExists(login) {
  try {
    run('gh', ['repo', 'view', `${login}/.nomo`, '--json', 'url']);
    return true;
  } catch {
    return false;
  }
}

async function draft(login) {
  try {
    const response = await fetch(`${SITE}/api/draft/${login}`, { signal: AbortSignal.timeout(8_000) });
    if (response.ok) return await response.text();
  } catch {}
  return null;
}

async function confirm(question) {
  if (yes) return true;
  if (!process.stdin.isTTY) fail('Run it in a terminal, or pass --yes.');
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await prompt.question(`${question} ${dim('(Y/n)')} `)).trim().toLowerCase();
  prompt.close();
  return answer === '' || answer === 'y' || answer === 'yes';
}

async function waitForTemplate(folder) {
  for (let attempt = 0; attempt < 10 && !existsSync(join(folder, 'human.md')); attempt++) {
    await new Promise(resolve => setTimeout(resolve, 1_000));
    try {
      run('git', ['pull', '--quiet'], { cwd: folder });
    } catch {}
  }
}

async function saveAvatar(login, folder) {
  try {
    const response = await fetch(`https://github.com/${login}.png?size=400`, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return false;
    mkdirSync(join(folder, 'assets'), { recursive: true });
    writeFileSync(join(folder, 'assets', 'me.jpg'), Buffer.from(await response.arrayBuffer()));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const login = checkGh();
  const url = `${SITE}/${login.toLowerCase()}`;
  console.log(`\nMaking a Nomo page for @${login}.`);

  if (repoExists(login)) {
    console.log(`\nYou already have a .nomo repo, so nothing was changed.\nYour page: ${url}\nEdit it: gh repo clone ${login}/.nomo\n`);
    return;
  }

  const markdown = await draft(login);
  console.log(markdown ? `\nHere's a first draft from your GitHub profile:\n\n${dim(markdown.trim())}\n` : '\nCouldn’t reach Nomo for a draft, so the page will start from the template.\n');
  if (dryRun) return;

  if (existsSync('.nomo')) fail('There is already a .nomo folder here. Run this somewhere else.');
  if (!await confirm(`Create github.com/${login}/.nomo (public) and publish this?`)) return console.log('\nNothing was changed.\n');

  run('gh', ['repo', 'create', '.nomo', '--public', '--clone', '--template', TEMPLATE, '--description', `My page on Nomo: ${url}`], { stdio: ['ignore', 'pipe', 'inherit'] });
  const folder = join(process.cwd(), '.nomo');
  await waitForTemplate(folder);

  if (markdown) {
    const photo = await saveAvatar(login, folder);
    writeFileSync(join(folder, 'human.md'), photo ? markdown : markdown.replace(/^!\[image:88x88\]\([^)]*\)\n\n/, ''));
    run('git', ['add', '-A'], { cwd: folder });
    run('git', ['commit', '--quiet', '-m', 'Start my page from my GitHub profile'], { cwd: folder });
    run('git', ['push', '--quiet'], { cwd: folder });
  }

  console.log(`\nYour page is live at ${url}\nIt can take a minute to show up.\n\nEdit .nomo/human.md and push to change it. Or ask your agent:\n${dim('  My Nomo page is in ./.nomo. Help me make human.md mine. Follow https://nomo.md/AGENTS.md')}\n`);
}

main().catch(error => fail(error instanceof Error ? error.message : String(error)));
