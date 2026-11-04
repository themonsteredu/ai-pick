// 녹화용 시나리오: 선생님 수업 만들기 → 학생 입장 → 진행 통제 + 반 전체 막대그래프
// 학생들은 모두 가짜 닉네임(더미)이며, 앱의 공개 API로만 입장·응답시킨다.
import { browser, newPage, record, BASE } from './rec.mjs';
const w = ms => new Promise(r => setTimeout(r, ms));
async function api(path, body) {
  for (let i = 0; i < 4; i++) {
    try { return await (await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json(); }
    catch { await w(200); }
  }
  return {};
}
const NICKS = ['별사탕','고양이짱','민트초코','수학천재','구름빵','펭귄대장','딸기우유','번개맨','햇살','나무늘보','코딩왕','토끼발','바닐라','하늘색','다람쥐','감자칩','라면왕','초록별','파도','솜사탕','호랑이','젤리곰'];
const dummies = [];
let beat;
async function join(code, nick) { const j = await api(`/api/sessions/${code}/join`, { nickname: nick }); if (j.ok) dummies.push(j.participant.id); }

const b = await browser();
const home = await newPage(b);
await home.goto(BASE + '/'); await w(2500);
await record(home, 'home', async () => { await home.goto(BASE + '/'); await w(6500); });

const t = await newPage(b);
await t.goto(BASE + '/teacher'); await t.evaluate(() => localStorage.clear()); await t.reload(); await w(2000);
let code;
await record(t, 'teacher', async () => {
  await w(1200);
  await t.locator('#title').pressSequentially('2학년 3반', { delay: 160 }); await w(500);
  await t.getByRole('button', { name: '수업 코드 만들기' }).click(); await w(1800);
  code = await t.evaluate(() => JSON.parse(Object.entries(localStorage).find(([k]) => /teacher/i.test(k))[1]).code);
  for (const n of NICKS.slice(0, 9)) { await join(code, n); await w(520); }
  await w(2500);
});
console.log('code', code);
beat = setInterval(() => dummies.forEach(id => api(`/api/sessions/${code}/heartbeat`, { participantId: id }).catch(() => {})), 4000);

const s = await newPage(b);
await s.goto(BASE + '/join'); await w(2000);
await record(s, 'student', async () => {
  await w(1000);
  await s.locator('#code').pressSequentially(code, { delay: 180 }); await w(400);
  await s.locator('#nickname').pressSequentially('초코바', { delay: 200 }); await w(600);
  await s.getByRole('button', { name: '입장하기' }).click();
  for (const n of NICKS.slice(9, 13)) { await w(900); await join(code, n); }
  await w(1500);
});
for (const n of NICKS.slice(13)) await join(code, n);

await t.goto(BASE + '/teacher/live'); await w(3000);
// 워밍업 문항 하나: "영어 단어 뜻 물어보기" → 대부분 '빠른 AI'
const CHOICES = ['LIGHT','LIGHT','THINK','LIGHT','DEEP','LIGHT','LIGHT','PERSON','THINK','LIGHT','LIGHT','THINK','LIGHT','DEEP','LIGHT','LIGHT','THINK','LIGHT','LIGHT','PERSON','LIGHT','THINK'];
await record(t, 'live', async () => {
  await w(1500);
  await t.locator('li', { hasText: '워밍업 판별' }).getByRole('button', { name: '열기' }).click(); await w(1800);
  for (let i = 0; i < dummies.length; i++) {
    await api(`/api/sessions/${code}/answer`, { participantId: dummies[i], step: 'warmup', itemId: 'main', choice: CHOICES[i % CHOICES.length] });
    await w(180);
  }
  await w(4000);
});
// 학생 화면이 선생님을 따라 넘어가는 모습
await record(s, 'follow', async () => { await w(5000); });
clearInterval(beat);
await b.close();
