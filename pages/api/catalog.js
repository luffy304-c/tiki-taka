import {getCatalog,mutate} from '../../lib/server/store';
import {requireAdmin} from '../../lib/server/auth';
import {validatePlayer} from '../../lib/model.mjs';
export const config={api:{bodyParser:{sizeLimit:'2mb'}}};
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');
 try{
 if(req.method==='GET')return res.json(await getCatalog());
 if(!['POST','DELETE'].includes(req.method))return res.status(405).end();
 if(!requireAdmin(req,res))return;
 const {type,records,id}=req.body||{};
 if(!['players','teams'].includes(type))throw Error('Неизвестный тип данных');
 const result=await mutate(db=>{
 if(req.method==='DELETE'){
 if(!db[type].some(x=>x.id===id))throw Error('Запись не найдена');
 if(type==='teams'&&db.players.some(p=>(p.teamId||p.team_id)===id))throw Error('Сначала перенесите или удалите игроков клуба');
 db[type]=db[type].filter(x=>x.id!==id);return {count:1};
 }
 if(!Array.isArray(records)||records.length<1||records.length>2000)throw Error('От 1 до 2000 записей за запрос');
 const clean=records.map(p=>{
 if(type==='players')return validatePlayer(p,db.teams);
 if(!p||! /^[a-zA-Z0-9_-]{1,80}$/.test(p.id||'')||!p.name?.trim()||!p.league?.trim())throw Error('Клуб: ID, название и лига обязательны');
 const t={};for(const k of ['id','name','league','country','shortName','stadium','manager','description']){t[k]=String(p[k]||'').trim();if(t[k].length>5000)throw Error('Слишком длинное поле');}t.shortName=t.shortName||t.name.slice(0,3);t.color=/^#[\da-f]{6}$/i.test(p.color||'')?p.color:'#00e676';return t;
 });
 if(new Set(clean.map(p=>p.id)).size!==clean.length)throw Error('Повторяющиеся ID внутри загрузки');
 for(const p of clean){const index=db[type].findIndex(x=>x.id===p.id);if(index<0)db[type].push(p);else db[type][index]={...db[type][index],...p};}
 return {count:clean.length};
 });return res.json({ok:true,...result});
 }catch(e){res.status(400).json({error:e.message});}
}
