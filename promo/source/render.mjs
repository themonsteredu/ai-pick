import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/compose.html');
await p.evaluate(async () => { for (const wt of [400, 700, 900]) await document.fonts.load(`${wt} 40px "S-Core Dream"`, '가나다'); await document.fonts.ready; });
const total = await p.evaluate(() => window.TOTAL);
const mode = process.argv[2];
if (mode === 'test') {
  fs.mkdirSync('shots', { recursive: true });
  for (const t of process.argv.slice(3).map(Number)) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: `shots/c-${t}.jpg`, quality: 80, type: 'jpeg' }); }
} else {
  fs.rmSync('out', { recursive: true, force: true }); fs.mkdirSync('out');
  const n = Math.round(total * 30);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / 30);
    await p.screenshot({ path: `out/${String(i).padStart(5,'0')}.jpg`, type: 'jpeg', quality: 95 });
    if (i % 150 === 0) console.log(i, '/', n);
  }
}
console.log('total', total);
await b.close();
