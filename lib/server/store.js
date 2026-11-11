import fs from 'node:fs/promises';
import path from 'node:path';
import { players, teams, news } from '../data';
import { normalizePlayer } from '../model.mjs';
const file = () => path.resolve(process.env.TIKI_DATA_FILE || 'data/catalog.json');
let queue=Promise.resolve();
function initial(){return {version:1,players:players.map(p=>({...p,demo:true,source:'Исходный демонстрационный набор: факты не проверены',season:'Не указан',updatedAt:null})),teams,news};}
export async function readRaw(){try{return JSON.parse(await fs.readFile(file(),'utf8'));}catch(e){if(e.code==='ENOENT')return initial();throw e;}}
export async function getCatalog(){const db=await readRaw();return {...db,players:db.players.map(p=>normalizePlayer(p,db.teams))};}
export function mutate(fn){const task=queue.then(async()=>{const db=await readRaw();const result=await fn(db);await fs.mkdir(path.dirname(file()),{recursive:true});const temp=file()+'.tmp';await fs.writeFile(temp,JSON.stringify(db,null,2));await fs.rename(temp,file());return result;});queue=task.catch(()=>{});return task;}
