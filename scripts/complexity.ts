import { ESLint } from 'eslint';
const eslint = new ESLint({ overrideConfig: { rules: { complexity: ['warn', 0] } } });
const results = await eslint.lintFiles(['src']);
const rows = results.flatMap(file => file.messages.filter(message => message.ruleId === 'complexity').map(message => ({
  file: file.filePath.replace(process.cwd() + '/', ''), line: message.line,
  complexity: Number(message.message.match(/complexity of (\d+)/)?.[1]),
  function: message.message.split(' has a complexity')[0],
}))).sort((a, b) => b.complexity - a.complexity);
console.table(rows.filter(row => row.complexity > 10));
console.log(`${rows.length} functions; ${rows.filter(row => row.complexity > 10).length} above 10; maximum ${rows[0]?.complexity ?? 0}.`);
