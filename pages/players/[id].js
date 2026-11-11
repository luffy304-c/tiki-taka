import { useI18n } from '../../lib/i18n';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useCatalog} from '../../lib/catalog';
import {per90} from '../../lib/model.mjs';
import {Shell,Provenance,show} from '../../components/CatalogUI';
export default function Player(){
  const { t: tr, locale } = useI18n();
const {players}=useCatalog();const {id}=useRouter().query;const p=players.find(x=>x.id===id);if(!p)return <Shell title={tr("Игрок не найден")}><Link href="/players">{tr("Вернуться к каталогу")}</Link></Shell>;
 const stats=[['Возраст',p.age],['Матчи',p.appearances],['Минуты',p.minutes_played],['Голы',p.goals],['Ассисты',p.assists],['Голы / 90',per90(p,'goals')],['Ассисты / 90',per90(p,'assists')],['xG',p.xg],['xA',p.xa],['Точность передач, %',p.pass_accuracy],['Отборы / матч',p.tackles_per_game],['Рейтинг источника',p.rating]];
 return <Shell title={p.name} subtitle={`${tr(p.position)} · ${p.team} · ${tr(p.nationality||'—')}`}><Provenance p={p}/><Link className="btn btn-primary" href={`/compare?player=${p.id}`}>{tr("Сравнить игрока")}</Link><div className="cards-grid">{stats.map(([label,value])=><div className="panel" key={label}><div className="muted">{tr(label)}</div><strong className="big-number">{tr(show(value))}</strong></div>)}</div><p className="muted">{tr("«—» означает отсутствие данных. Показатели за 90 минут рассчитываются только при известном игровом времени.")}</p><p>{p.description}</p></Shell>;
}
