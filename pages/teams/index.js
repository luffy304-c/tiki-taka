import { useI18n } from '../../lib/i18n';
// pages/teams/index.js
import { useState } from 'react';
import TeamCard from '../../components/TeamCard';
import { useCatalog } from '../../lib/catalog';



export default function TeamsPage() {
  const { t: tr, locale } = useI18n();

  const {teams} = useCatalog();
  const leagues = ['All', ...new Set(teams.map(t => t.league))];
  const [activeLeague, setActiveLeague] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = teams
    .filter(t => activeLeague === 'All' || t.league === activeLeague)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.country.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title"><span>{tr("Clubs")}</span></h1>
          <p className="page-subtitle">{tr('clubs.count',{count:teams.length.toLocaleString(locale),leagues:leagues.length-1})}</p>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tr("Search clubs...")}
          style={{
            width: '100%',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 16px',
            color: 'var(--text)',
            fontSize: 15,
            outline: 'none',
            marginBottom: 16,
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        {/* League filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {leagues.map(league => (
            <button key={league}
              onClick={() => setActiveLeague(league)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: activeLeague === league ? 'var(--accent)' : 'var(--border)',
                background: activeLeague === league ? 'var(--accent-dim)' : 'transparent',
                color: activeLeague === league ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>{tr(league)}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid-3" style={{ marginBottom: 60 }}>
          {filtered.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
