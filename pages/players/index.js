import { useI18n } from '../../lib/i18n';
import {useState} from 'react';
import {useCatalog} from '../../lib/catalog';
import {positions} from '../../lib/model.mjs';
import {Shell,PlayerTile} from '../../components/CatalogUI';
export default function PlayersPage(){
  const { t: tr, locale } = useI18n();
const {players,teams}=useCatalog();const [q,Q]=useState(''),[position,P]=useState(''),[league,L]=useState(''),[season,S]=useState('');
 const filtered=players.filter(p=>(!q||(p.name+' '+p.team).toLowerCase().includes(q.toLowerCase()))&&(!position||p.position===position)&&(!league||p.league===league)&&(!season||p.season===season));
 return <Shell title={tr("Футболисты")} subtitle={tr("Единый каталог: изменения в админке доступны во всех разделах.")}><div className="controls"><input aria-label={tr("Поиск игрока")} placeholder={tr("Игрок или клуб")} value={q} onChange={e=>Q(e.target.value)}/><select aria-label={tr("Позиция")} value={position} onChange={e=>P(e.target.value)}><option value="">{tr("Все позиции")}</option>{positions.map(x=><option key={x} value={x}>{tr(x)}</option>)}</select><select aria-label={tr("Лига")} value={league} onChange={e=>L(e.target.value)}><option value="">{tr("Все лиги")}</option>{[...new Set(teams.map(t=>t.league))].map(x=><option key={x} value={x}>{tr(x)}</option>)}</select><select aria-label={tr("Сезон")} value={season} onChange={e=>S(e.target.value)}><option value="">{tr("Все сезоны")}</option>{[...new Set(players.map(p=>p.season).filter(Boolean))].map(x=><option key={x} value={x}>{tr(x)}</option>)}</select></div><p>{tr("Найдено: ")}{tr(filtered.length)}</p><div className="cards-grid">{filtered.map(p=><PlayerTile key={p.id} p={p}/>)}</div>{!filtered.length&&<p>{tr("Нет игроков по выбранным условиям.")}</p>}</Shell>;
}
