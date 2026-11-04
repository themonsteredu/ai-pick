import { chromium } from 'playwright';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const FF = process.env.FFMPEG || 'ffmpeg';
const DPR = Number(process.env.DPR || 2);
const BASE = process.env.BASE || 'http://localhost:3000';
export async function browser() { return chromium.launch(); }
export async function newPage(b) {
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: DPR });
  return ctx.newPage();
}
export async function record(page, name, actions) {
  const dir = `clips/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async f => {
    const i = frames.length; frames.push(f.metadata.timestamp);
    fs.writeFileSync(`${dir}/${String(i).padStart(5,'0')}.jpg`, Buffer.from(f.data, 'base64'));
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1600*DPR, maxHeight: 900*DPR, everyNthFrame: 1 });
  const start = Date.now() / 1000;
  await actions();
  const end = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  // 프레임 간격을 그대로 살려 30fps 고정 영상으로
  let list = '';
  frames.forEach((t, i) => { const next = i + 1 < frames.length ? frames[i + 1] : end; list += `file '${String(i).padStart(5,'0')}.jpg'\nduration ${Math.max(0.001, next - t).toFixed(4)}\n`; });
  list += `file '${String(frames.length - 1).padStart(5,'0')}.jpg'\n`;
  fs.writeFileSync(`${dir}/list.txt`, list);
  execFileSync(FF, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-vf', `fps=30,scale=${1600*DPR}:${900*DPR}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', `clips/${name}.mp4`]);
  console.log(name, frames.length, 'frames', (end - start).toFixed(1), 's');
}
export { BASE };
