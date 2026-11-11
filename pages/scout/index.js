import { useI18n } from '../../lib/i18n';
import {useState} from 'react';
import Link from 'next/link';
import {useCatalog} from '../../lib/catalog';
import {positions,rankPlayers} from '../../lib/model.mjs';
import {Shell,show} from '../../components/CatalogUI';
const labels={goals:'Голы / 90',assists:'Ассисты / 90',pass_accuracy:'Точность передач',tackles_per_game:'Отборы / матч'};
export default function Scout(){
  const { t: tr, locale } = useI18n();
const {players}=useCatalog();const [pos,P]=useState('Midfielder'),[season,S]=useState(''),[league,L]=useState(''),[age,A]=useState(35),[mins,M]=useState(450),[weights,W]=useState({goals:30,assists:30,pass_accuracy:20,tackles_per_game:20});
 const pool=players.filter(p=>p.position===pos&&season&&p.season===season&&(!league||p.league===league)&&p.age!=null&&p.age<=age&&(p.minutes_played||0)>=mins);
 const ranked=rankPlayers(pool,weights);
 return <Shell title={tr("Подбор футболистов")} subtitle={tr("Прозрачный рейтинг по вашим критериям. Работает без внешнего ИИ.")}><div className="controls"><label>{tr("Позиция")}<select value={pos} onChange={e=>P(e.target.value)}>{positions.map(p=><option key={p} value={p}>{tr(p)}</option>)}</select></label><label>{tr("Сезон")}<select value={season} onChange={e=>S(e.target.value)}><option value="">{tr("Выберите")}</option>{[...new Set(players.map(p=>p.season).filter(Boolean))].map(x=><option key={x} value={x}>{tr(x)}</option>)}</select></label><label>{tr("Лига")}<select value={league} onChange={e=>L(e.target.value)}><option value="">{tr("Все")}</option>{[...new Set(players.map(p=>p.league).filter(Boolean))].map(x=><option key={x} value={x}>{tr(x)}</option>)}</select></label><label>{tr("Возраст до")}<input type="number" min="1" max="100" value={age} onChange={e=>A(+e.target.value)}/></label><label>{tr("Минимум минут")}<input type="number" min="0" value={mins} onChange={e=>M(+e.target.value)}/></label></div>
 <div className="panel"><h2>{tr("Важность показателей")}</h2>{Object.keys(weights).map(k=><label className="weight" key={k}>{tr(labels[k])}: {tr(weights[k])}<input type="range" min="0" max="100" value={weights[k]} onChange={e=>W({...weights,[k]:+e.target.value})}/></label>)}<p className="muted">{tr("Вес 0 исключает показатель. Каждый показатель переводится в диапазон 0–1 среди подходящих игроков; итог = взвешенное среднее × 100. При одинаковых значениях используется 0,5. Рейтинг относительный и меняется вместе с выборкой.")}</p></div>
 <p>{tr("Подходят по фильтрам: ")}{tr(pool.length)}. {tr('scout.complete',{count:ranked.length.toLocaleString(locale)})}.</p>{!ranked.length&&<p>{tr("Нет данных для выбранных условий. Загрузите CSV с минутами и нужными показателями либо измените веса. Пример есть в админке.")}</p>}
 {ranked.map((p,i)=><div className="panel" key={p.id}><h2>{tr(i+1)}. <Link href={`/players/${p.id}`}>{p.name}</Link> — {tr(show(p.score))}/100</h2><p>{p.team} · {tr(p.demo!==false?'Демонстрационные данные':'Данные пользователя')}</p>{p.parts.map(x=><p key={x.key}>{tr(labels[x.key])}: {tr(show(x.value))}{tr(" → вклад ")}{tr(show(x.points))}{tr(" балла")}</p>)}</div>)}</Shell>;
}
