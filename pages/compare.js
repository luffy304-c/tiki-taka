import { useI18n } from '../lib/i18n';
import {useState,useEffect} from 'react';
import {useRouter} from 'next/router';
import {useCatalog} from '../lib/catalog';
import {positions,per90} from '../lib/model.mjs';
import {Shell,show} from '../components/CatalogUI';
const metrics=[['Минуты',p=>p.minutes_played],['Голы',p=>p.goals],['Ассисты',p=>p.assists],['Голы / 90',p=>per90(p,'goals')],['Ассисты / 90',p=>per90(p,'assists')],['xG',p=>p.xg],['xA',p=>p.xa],['Точность передач, %',p=>p.pass_accuracy],['Отборы / матч',p=>p.tackles_per_game]];
export default function Compare(){
  const { t: tr, locale } = useI18n();
const {players}=useCatalog();const router=useRouter();const [pos,P]=useState('Midfielder'),[season,S]=useState(''),[ids,I]=useState([]);
 useEffect(()=>{const p=players.find(x=>x.id===router.query.player);if(p){P(p.position);S(p.season||'');I([p.id]);}},[router.query.player]);
 const available=players.filter(p=>p.position===pos&&(!season||p.season===season));const selected=players.filter(p=>ids.includes(p.id));
 function toggle(id){I(old=>old.includes(id)?old.filter(x=>x!==id):old.length<4?[...old,id]:old);}
 return <Shell title={tr("Сравнение футболистов")} subtitle={tr("Выберите от двух до четырёх игроков одной позиции и сезона.")}><div className="controls"><select aria-label={tr("Позиция сравнения")} value={pos} onChange={e=>{P(e.target.value);I([]);}}>{positions.map(x=><option key={x} value={x}>{tr(x)}</option>)}</select><select aria-label={tr("Сезон сравнения")} value={season} onChange={e=>{S(e.target.value);I([]);}}><option value="">{tr("Выберите сезон")}</option>{[...new Set(players.map(p=>p.season).filter(Boolean))].map(s=><option key={s} value={s}>{tr(s)}</option>)}</select></div>{!season?<p>{tr("Сначала выберите сезон.")}</p>:<div className="pick-list">{available.map(p=><label key={p.id}><input type="checkbox" checked={ids.includes(p.id)} disabled={!ids.includes(p.id)&&ids.length>=4} onChange={()=>toggle(p.id)}/>{p.name} · {p.team}</label>)}</div>}
 {selected.length>0&&<div className="table-scroll"><table><thead><tr><th>{tr("Показатель")}</th>{selected.map(p=><th key={p.id}>{p.name}</th>)}</tr></thead><tbody>{metrics.map(([label,get])=><tr key={label}><th>{tr(label)}</th>{selected.map(p=><td key={p.id}>{tr(show(get(p)))}</td>)}</tr>)}<tr><th>{tr("Источник")}</th>{selected.map(p=><td key={p.id}>{tr(p.source||'Не указан')}<br/>{tr(p.updatedAt||'Нет даты')}<br/>{tr(p.demo!==false?'Демо':'Данные пользователя')}</td>)}</tr></tbody></table></div>}
 {selected.length>=2&&<div className="panel"><h2>{tr("Голевые действия за 90 минут")}</h2>{selected.map(p=>{const g=per90(p,'goals'),a=per90(p,'assists'),v=g==null||a==null?null:g+a;const max=Math.max(1,...selected.map(x=>(per90(x,'goals')||0)+(per90(x,'assists')||0)));return <div key={p.id} className="bar-row"><span>{p.name}: {tr(show(v))}</span><div className="bar"><div style={{width:`${v==null?0:v/max*100}%`}}/></div></div>;})}</div>}
 <p className="muted">{tr("Одинаковая позиция и сезон не устраняют различия в тактике и силе соперников. Малое игровое время делает показатели за 90 минут менее устойчивыми.")}</p></Shell>;
}
