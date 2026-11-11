export const positions = ['Goalkeeper','Defender','Midfielder','Winger','Forward','Striker'];
export const numbers = ['age','number','goals','assists','rating','appearances','minutes_played','xg','xa','pass_accuracy','tackles_per_game','interceptions_pg','shots_per_game','dribbles_per_game','clean_sheets','market_value_num'];
export function normalizePlayer(p, teams) {
  const t = teams.find(t => t.id === (p.teamId ?? p.team_id));
  return {...p, teamId:p.teamId ?? p.team_id ?? '', team_id:p.teamId ?? p.team_id ?? '', team:t?.name || '', teams:t || null, league:t?.league || '', number:p.number ?? p.jersey_number ?? null, value:p.value ?? p.market_value ?? 'N/A', photoUrl:p.photoUrl ?? p.photo_url ?? '', tags:Array.isArray(p.tags)?p.tags:[]};
}
export function validatePlayer(p, teams) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw Error('Некорректный игрок');
  const out = {};
  for (const key of ['id','name','position','nationality','teamId','season','source','updatedAt','description','value','foot','height','photoUrl']) {
    out[key] = String(p[key] ?? '').trim();
    if(out[key].length > (key==='description'?5000:600)) throw Error(`Слишком длинное поле ${key}`);
  }
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(out.id)) throw Error('ID: 1–80 латинских букв, цифр, _ или -');
  if(!out.name || !positions.includes(out.position)) throw Error('Укажите имя и допустимую позицию');
  if(!teams.some(t=>t.id===out.teamId)) throw Error(`Неизвестный клуб: ${out.teamId}`);
  if(!out.season || !out.source || !/^\d{4}-\d{2}-\d{2}$/.test(out.updatedAt) || Number.isNaN(Date.parse(out.updatedAt)) || (!Number.isNaN(Date.parse(out.updatedAt)) && new Date(out.updatedAt).toISOString().slice(0,10)!==out.updatedAt)) throw Error('Укажите сезон, источник и дату YYYY-MM-DD');
  if(out.photoUrl && !/^https?:\/\//i.test(out.photoUrl)) throw Error('Фото: только ссылка http/https');
  out.demo = p.demo !== false;
  for(const key of numbers) {
    const v = p[key]; out[key] = v === '' || v == null ? null : Number(v);
    if(out[key]!==null && (!Number.isFinite(out[key]) || out[key]<0 || out[key]>10000000)) throw Error(`Некорректное число: ${key}`);
  }
  for(const key of ['age','number','goals','assists','appearances','minutes_played','clean_sheets']) if(out[key]!=null && !Number.isInteger(out[key])) throw Error(`${key}: требуется целое число`);
  if(out.rating>10 || out.pass_accuracy>100 || out.age>100 || out.number>999) throw Error('Рейтинг 0–10, точность передач 0–100, возраст 0–100');
  out.tags = Array.isArray(p.tags)?p.tags.map(String).slice(0,20):[];
  return out;
}
export function per90(p, key) {return p.minutes_played > 0 && p[key] != null ? p[key]*90/p.minutes_played : null;}
export function searchDataset(db,query) {
 const q=String(query).toLowerCase();
 const match=o=>Object.values(o).some(v=>typeof v==='string'&&v.toLowerCase().includes(q));
 return {players:db.players.filter(match), teams:db.teams.filter(match), news:db.news.filter(match)};
}
export function rankPlayers(players, weights) {
 const metrics={goals:p=>per90(p,'goals'),assists:p=>per90(p,'assists'),pass_accuracy:p=>p.pass_accuracy,tackles_per_game:p=>p.tackles_per_game};
 const keys=Object.keys(metrics).filter(k=>Number(weights[k])>0);
 if(!keys.length) return [];
 const eligible=players.filter(p=>keys.every(k=>metrics[k](p)!=null && Number.isFinite(metrics[k](p))));
 const ranges=Object.fromEntries(keys.map(k=>{const v=eligible.map(metrics[k]);return [k,[Math.min(...v),Math.max(...v)]];}));
 const total=keys.reduce((s,k)=>s+Number(weights[k]),0);
 return eligible.map(p=>{
   const parts=keys.map(k=>{const value=metrics[k](p),[min,max]=ranges[k];const normalized=max===min?0.5:(value-min)/(max-min);return {key:k,value,points:100*normalized*Number(weights[k])/total};});
   return {...p,score:parts.reduce((s,x)=>s+x.points,0),parts};
 }).sort((a,b)=>b.score-a.score || String(a.name||a.id).localeCompare(String(b.name||b.id)));
}
