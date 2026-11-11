import { useI18n } from '../lib/i18n';
import Link from 'next/link';
export function Shell({title,subtitle,children}){
  const { t: tr, locale } = useI18n();
return <section className="container workspace"><h1>{tr(title)}</h1>{subtitle&&<p className="muted">{tr(subtitle)}</p>}{children}</section>;}
export function Provenance({p}){
  const { t: tr, locale } = useI18n();
return <div className="provenance"><strong>{tr(p.demo!==false?'Демонстрационные данные':'Данные пользователя')}</strong><br/>{tr("Сезон: ")}{tr(p.season||'не указан')}{tr(" · Дата: ")}{tr(p.updatedAt||'не указана')}<br/>{tr("Источник: ")}{tr(p.source||'не указан')}</div>;}
export function PlayerTile({p}){
  const { t: tr, locale } = useI18n();
return <Link className="panel player-tile" href={`/players/${p.id}`}><div className="muted">{tr(p.position)} · {tr(p.league)}</div><h2>{p.name}</h2><p>{p.team}</p><div className="metric-row"><span>{tr("Голы ")}<b>{tr(p.goals??'—')}</b></span><span>{tr("Ассисты ")}<b>{tr(p.assists??'—')}</b></span><span>{tr("Рейтинг ")}<b>{tr(p.rating??'—')}</b></span></div><span className="muted">{tr(p.season||'Сезон не указан')} · {tr(p.demo!==false?'Демо':'Импорт')}</span></Link>;}
export function show(v){return v==null?'—':typeof v==='number'?Number(v.toFixed(2)):v;}
