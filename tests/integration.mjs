// Isolated production server; never touches data/catalog.json or external services.
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const dir=await mkdtemp(path.join(tmpdir(),'tiki-test-'));
const password=crypto.randomBytes(20).toString('hex'),port=Number(process.env.TEST_PORT||3161),base=`http://127.0.0.1:${port}`;
let server,logs='';
async function start(){server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{env:{...process.env,ADMIN_PASSWORD:password,TIKI_DATA_FILE:path.join(dir,'catalog.json'),ENABLE_AI:'false',ENABLE_FOOTBALL_SEARCH:'false'},stdio:['ignore','pipe','pipe']});server.stdout.on('data',c=>logs+=c);server.stderr.on('data',c=>logs+=c);for(let i=0;i<100;i++){try{if((await fetch(base+'/api/session')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Test server did not start: '+logs);}
async function stop(){if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));}}
async function req(url,method='GET',body,cookie,origin){return fetch(base+url,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},body:body?JSON.stringify(body):undefined});}
try{
 await start();
 const initial=await (await req('/api/catalog')).json();assert.ok(initial.players.length>0);
 assert.equal((await req('/api/catalog','POST',{type:'players',records:[]})).status,401);
 assert.equal((await req('/api/session','POST',{password:'wrong'})).status,401);
 const login=await req('/api/session','POST',{password});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));
 assert.equal((await req('/api/catalog','POST',{type:'players',records:[]},cookie,'https://evil.example')).status,403);
 const p={id:'integration_player',name:'Integration Player',position:'Midfielder',teamId:initial.teams[0].id,season:'TEST',source:'synthetic test',updatedAt:'2026-09-30',goals:3,assists:2,minutes_played:270,demo:true};
 assert.equal((await req('/api/catalog','POST',{type:'players',records:[p,{...p,id:'bad',goals:-1}]},cookie)).status,400);
 assert.equal((await (await req('/api/catalog')).json()).players.some(x=>x.id===p.id),false,'invalid batch must not partially save');
 assert.equal((await req('/api/catalog','POST',{type:'players',records:[p]},cookie)).status,200);
 assert.equal((await (await req('/api/players?id='+p.id)).json()).name,p.name);
 assert.equal((await (await req('/api/search?q=Integration')).json()).players[0].id,p.id);
 await stop();await start();
 assert.equal((await (await req('/api/catalog')).json()).players.find(x=>x.id===p.id).goals,3,'must survive restart');
 assert.equal((await req('/api/catalog','POST',{type:'players',records:[{...p,name:'Changed Player',goals:4}]},cookie)).status,200);
 assert.equal((await (await req('/api/players?id='+p.id)).json()).goals,4);
 const simultaneous=await Promise.all(['parallel_a','parallel_b'].map(id=>req('/api/catalog','POST',{type:'players',records:[{...p,id}]},cookie)));assert.ok(simultaneous.every(r=>r.ok));
 const disk=JSON.parse(await readFile(path.join(dir,'catalog.json'),'utf8'));assert.ok(['parallel_a','parallel_b'].every(id=>disk.players.some(x=>x.id===id)));
 assert.equal((await req('/api/catalog','DELETE',{type:'teams',id:p.teamId},cookie)).status,400);
 assert.equal((await req('/api/catalog','DELETE',{type:'players',id:p.id},cookie)).status,200);
 assert.equal((await req('/api/players?id='+p.id)).status,404);
 assert.equal((await req('/api/ai','POST',{userMessage:'test'},cookie)).status,503);
 assert.equal((await req('/api/football-search?q=test','GET',null,cookie)).status,503);
 for(const route of ['/','/players','/teams','/leagues','/news','/search?q=test','/compare','/scout','/admin','/career','/ai-core','/map','/profile','/live-search'])assert.equal((await req(route)).status,200,route);
 await req('/api/session','DELETE',null,cookie);
 console.log('PASS: protected writes, login, CSRF, atomic import, shared reads/search, persistence after restart, updates, concurrent writes, FK protection, deletion, disabled paid services, 14 page routes.');
}finally{await stop();await rm(dir,{recursive:true,force:true});}
