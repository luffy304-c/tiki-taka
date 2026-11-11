import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const attempts=new Map();
const file=()=>process.env.TIKI_USERS_FILE||path.join(process.cwd(),'data','accounts.json');
const readUsers=()=>{try{const v=JSON.parse(fs.readFileSync(file(),'utf8'));return Array.isArray(v)?v:[];}catch{return [];}};
const writeUsers=users=>{const f=file();fs.mkdirSync(path.dirname(f),{recursive:true});const tmp=f+'.tmp';fs.writeFileSync(tmp,JSON.stringify(users,null,2),{mode:0o600});fs.renameSync(tmp,f);};
const equal=(a,b)=>{const x=crypto.createHash('sha256').update(String(a)).digest(),y=crypto.createHash('sha256').update(String(b)).digest();return crypto.timingSafeEqual(x,y);};
const key=()=>process.env.ADMIN_PASSWORD||'tiki-account-session-key';
export function accountCount(){return readUsers().length;}
export function accounts(){return readUsers().map(({username,createdAt})=>({username,createdAt}));}
export function canonicalAccount(username){return readUsers().find(x=>x.username.toLowerCase()===(typeof username==='string'?username.trim().toLowerCase():''))?.username||'';}
export function createAccount(username,password){
 username=typeof username==='string'?username.trim():'';
 if(!/^[\p{L}\p{N}_.-]{3,32}$/u.test(username))throw Error('Имя аккаунта: 3–32 буквы, цифры, точка, дефис или подчёркивание');
 if(typeof password!=='string'||password.length<12)throw Error('Пароль должен содержать не менее 12 символов');
 const users=readUsers();if(users.some(u=>u.username.toLowerCase()===username.toLowerCase()))throw Error('Аккаунт с таким именем уже существует');
 const salt=crypto.randomBytes(16).toString('hex'),hash=crypto.scryptSync(password,salt,64).toString('hex');
 users.push({username,salt,hash,createdAt:new Date().toISOString()});writeUsers(users);return {username};
}
export function verifyAccount(username,password){const u=readUsers().find(x=>x.username.toLowerCase()===(typeof username==='string'?username.trim().toLowerCase():''));if(!u||typeof password!=='string')return false;return equal(crypto.scryptSync(password,u.salt,64).toString('hex'),u.hash);}
export function configured(){return accountCount()>0||(process.env.ADMIN_PASSWORD||'').length>=12;}
export function checkPassword(value){return (process.env.ADMIN_PASSWORD||'').length>=12&&typeof value==='string'&&equal(value,process.env.ADMIN_PASSWORD);}
export function checkSetupCode(value){return typeof value==='string'&&typeof process.env.ADMIN_SETUP_CODE==='string'&&process.env.ADMIN_SETUP_CODE.length>=12&&equal(value,process.env.ADMIN_SETUP_CODE);}
function sign(payload){return crypto.createHmac('sha256',key()).update(payload).digest('hex');}
export function isAdmin(req){if(!configured())return false;const raw=req.cookies.tt_admin||'';const [expiry,identity,sig]=raw.split('.');const payload=`${expiry}.${identity}`;let username='';try{if(identity?.startsWith('u_'))username=Buffer.from(identity.slice(2),'base64url').toString();}catch{}return /^\d+$/.test(expiry||'')&&Number(expiry)>Date.now()&&identity&&typeof sig==='string'&&equal(sig,sign(payload))&&(identity==='legacy'||readUsers().some(u=>u.username===username));}
export function cookie(res,logout=false,identity='legacy'){const expiry=String(Date.now()+8*3600000),token=identity==='legacy'?'legacy':'u_'+Buffer.from(identity).toString('base64url'),payload=`${expiry}.${token}`;res.setHeader('Set-Cookie',`tt_admin=${logout?'':payload+'.'+sign(payload)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${logout?0:28800}${process.env.COOKIE_SECURE==='true'?'; Secure':''}`);}
export function sameOrigin(req){const origin=req.headers.origin;return !origin || (()=>{try{return new URL(origin).host===req.headers.host;}catch{return false;}})();}
export function requireAdmin(req,res){if(!sameOrigin(req)){res.status(403).json({error:'Недопустимый источник запроса'});return false;}if(!isAdmin(req)){res.status(401).json({error:'Войдите как администратор'});return false;}return true;}
export function loginAllowed(req){const now=Date.now(),key=req.socket.remoteAddress||'local';for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);const record=attempts.get(key)||{count:0,until:now+600000};record.count++;attempts.set(key,record);return record.count<=10;}
