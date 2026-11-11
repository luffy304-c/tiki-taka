import { useI18n } from '../../lib/i18n';
// pages/leagues/index.js
// Все лиги с клубами — разделение по лигам
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {useCatalog} from '../../lib/catalog';

const LEAGUES = [
  { id:'premier_league', name:'Premier League', country:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', color:'#3D185A', bg:'rgba(61,24,90,0.12)' },
  { id:'la_liga',        name:'La Liga',        country:'Spain',   flag:'🇪🇸', color:'#EE2737', bg:'rgba(238,39,55,0.1)' },
  { id:'bundesliga',     name:'Bundesliga',     country:'Germany', flag:'🇩🇪', color:'#D50000', bg:'rgba(213,0,0,0.1)' },
  { id:'serie_a',        name:'Serie A',        country:'Italy',   flag:'🇮🇹', color:'#003189', bg:'rgba(0,49,137,0.1)' },
  { id:'ligue_1',        name:'Ligue 1',        country:'France',  flag:'🇫🇷', color:'#0055A4', bg:'rgba(0,85,164,0.1)' },
];

// Импортируем fallback данные

export default function LeaguesPage() {
  const { t: tr, locale } = useI18n();

  const {teams}=useCatalog();
 const [activeLeague,setActiveLeague]=useState('premier_league');
 const loading=false, useStatic=false;

  // Нормализация — supabase использует snake_case, static использует camelCase
  function normalize(t) {
    return {
      id:          t.id,
      name:        t.name,
      shortName:   t.short_name || t.shortName || t.name.slice(0,3).toUpperCase(),
      country:     t.country,
      league:      t.league,
      founded:     t.founded,
      stadium:     t.stadium,
      capacity:    t.capacity,
      manager:     t.manager,
      trophies:    t.trophies,
      color:       t.color || '#888',
      squadValue:  t.squad_value || t.squadValue || 'N/A',
      description: t.description || '',
      logoUrl:     t.logo_url || t.logoUrl || null,
    };
  }

  const leagueMap = {
    premier_league: 'Premier League',
    la_liga:        'La Liga',
    bundesliga:     'Bundesliga',
    serie_a:        'Serie A',
    ligue_1:        'Ligue 1',
  };

  const activeName   = leagueMap[activeLeague];
  const leagueTeams  = teams.map(normalize).filter(t => t.league === activeName);
  const activeMeta   = LEAGUES.find(l => l.id === activeLeague);

  return (
    <div>
      <div className="container">
        <div className="page-header">
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
            <span className="tag tag-green">{tr("🏆 5 Лиг")}</span>
            <span className="tag tag-muted">{tr(teams.length)}{tr(" клубов")}</span>
            {useStatic && <span className="tag tag-gold">{tr("⚡ Demo данные")}</span>}
          </div>
          <h1 className="page-title"><span>{tr("World leagues")}</span></h1>
          <p className="page-subtitle">{tr("Топ-5 европейских лиг — клубы, стадионы, составы")}</p>
        </div>

        {/* League tabs */}
        <div style={{
          display:'flex', gap:0,
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:6, marginBottom:32, flexWrap:'wrap',
        }}>
          {LEAGUES.map(lg => {
            const active = activeLeague === lg.id;
            const cnt = teams.map(normalize).filter(t => t.league === lg.name).length;
            return (
              <button key={lg.id} onClick={() => setActiveLeague(lg.id)} style={{
                flex:'1 1 auto', display:'flex', alignItems:'center', justifyContent:'center',
                gap:8, padding:'12px 16px', borderRadius:10, cursor:'pointer',
                background: active ? lg.bg : 'transparent',
                border: `1px solid ${active ? lg.color+'44' : 'transparent'}`,
                color: active ? lg.color : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
                fontSize:13, transition:'all .2s', fontFamily:'var(--font-body)',
                minWidth:120,
              }}>
                <span style={{ fontSize:18 }}>{tr(lg.flag)}</span>
                <span>{tr(lg.name)}</span>
                {cnt > 0 && <span style={{ fontSize:11, background: active ? lg.color+'22' : 'var(--bg3)', color: active ? lg.color : 'var(--text-dim)', padding:'1px 6px', borderRadius:4, fontFamily:'var(--font-mono)' }}>{tr(cnt)}</span>}
              </button>
            );
          })}
        </div>

        {/* League header */}
        {activeMeta && (
          <div style={{
            background:`linear-gradient(135deg, ${activeMeta.bg}, var(--card))`,
            border:`1px solid ${activeMeta.color}33`,
            borderRadius:'var(--radius-lg)', padding:'24px 28px', marginBottom:28,
            display:'flex', gap:20, alignItems:'center', flexWrap:'wrap',
          }}>
            <div style={{ fontSize:48 }}>{tr(activeMeta.flag)}</div>
            <div style={{ flex:1 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,42px)', letterSpacing:'.02em', color:activeMeta.color, lineHeight:1 }}>
                {tr(activeMeta.name)}
              </h2>
              <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:14 }}>
                {tr(activeMeta.country)} · {tr(leagueTeams.length)}{tr(" клубов в базе")}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:36, color:activeMeta.color, lineHeight:1 }}>{tr(leagueTeams.length)}</div>
              <div style={{ fontSize:11, color:'var(--text-dim)', fontFamily:'var(--font-mono)', textTransform:'uppercase' }}>{tr("Клубов")}</div>
            </div>
          </div>
        )}

        {/* Teams grid */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24, height:220, animation:'pulse 1.5s infinite' }}/>
            ))}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:60 }}>
            {leagueTeams.map(team => (
              <LeagueTeamCard key={team.id} team={team} leagueColor={activeMeta?.color} />
            ))}
            {leagueTeams.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🏟️</div>
                <p>{tr("Нет клубов в этой лиге.")}</p>
                <Link href="/admin" style={{ color:'var(--accent)', marginTop:8, display:'inline-block' }}>{tr("Добавить через Admin →")}</Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}

function LeagueTeamCard({ team, leagueColor }) {
  const { t: tr, locale } = useI18n();

  const color = team.color || leagueColor || '#888';
  return (
    <Link href={`/teams/${team.id}`} style={{ display:'block' }}>
      <div style={{
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'20px',
        cursor:'pointer', transition:'all .2s', position:'relative', overflow:'hidden',
        borderTop:`3px solid ${color}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 10px 30px ${color}22`; e.currentTarget.style.borderColor='var(--border-light)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)'; }}>

        <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
          {/* Logo / initials */}
          <div style={{
            width:54, height:54, borderRadius:12, flexShrink:0,
            background: team.logoUrl ? 'transparent' : `${color}18`,
            border:`2px solid ${color}44`,
            display:'flex', alignItems:'center', justifyContent:'center',
            overflow:'hidden',
          }}>
            {team.logoUrl
              ? <img src={team.logoUrl} alt={team.name} style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
              : <span style={{ fontFamily:'var(--font-display)', fontSize:15, color, letterSpacing:'.04em' }}>{team.shortName}</span>
            }
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, letterSpacing:'.02em', lineHeight:1.1, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {team.name}
            </h3>
            <p style={{ fontSize:12, color:'var(--text-dim)' }}>{tr(team.country)}{tr(" · Est. ")}{tr(team.founded)}</p>
          </div>

          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--gold)', lineHeight:1 }}>{tr(team.trophies)}</div>
            <div style={{ fontSize:9, color:'var(--text-dim)', fontFamily:'var(--font-mono)', textTransform:'uppercase' }}>{tr("Titles")}</div>
          </div>
        </div>

        <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {team.description}
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, paddingTop:12, borderTop:'1px solid var(--border)' }}>
          {[
            { l:'Stadium',  v: team.stadium ? team.stadium.split(' ').slice(-2).join(' ') : '—' },
            { l:'Manager',  v: team.manager ? team.manager.split(' ').pop() : '—' },
            { l:'Value',    v: team.squadValue || '—' },
          ].map(({ l, v }) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:11, color:'var(--text)', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{tr(v)}</div>
              <div style={{ fontSize:9, color:'var(--text-dim)', fontFamily:'var(--font-mono)', textTransform:'uppercase', marginTop:2 }}>{tr(l)}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
