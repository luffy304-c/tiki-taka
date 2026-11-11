import { useI18n } from '../lib/i18n';
// pages/search.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCatalog } from '../lib/catalog';
import { searchDataset } from '../lib/model.mjs';
import PlayerCard from '../components/PlayerCard';
import TeamCard from '../components/TeamCard';
import NewsCard from '../components/NewsCard';

export default function SearchPage() {
  const { t: tr, locale } = useI18n();

  const router = useRouter();
  const db = useCatalog();
  const query = router.query.q || '';
  const [results, setResults] = useState({ players: [], teams: [], news: [] });
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    setLocalSearch(query);
    if (query) {
      setResults(searchDataset(db,query));
    }
  }, [query, db.players, db.teams, db.news]);

  function handleSearch(e) {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearch.trim())}`);
    }
  }

  const total = results.players.length + results.teams.length + results.news.length;

  return (
    <div>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title"><span>{tr("Search results")}</span></h1>
          {query && <p className="page-subtitle">{tr('search.summary',{count:total.toLocaleString(locale),query})}</p>}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
          <input
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder={tr("Search players, teams, news...")}
            style={{
              flex: 1,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 16px',
              color: 'var(--text)',
              fontSize: 15,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>{tr("Search")}</button>
        </form>

        {!query && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18 }}>{tr("Type something to search players, teams, or news.")}</p>
          </div>
        )}

        {query && total === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <p style={{ fontSize: 18, marginBottom: 8 }}>{tr('No results for “{0}”',{0:query})}</p>
            <p style={{ fontSize: 14 }}>{tr("Try searching for a player name, team, or league.")}</p>
          </div>
        )}

        {/* Players results */}
        {results.players.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.02em' }}>{tr("PLAYERS ")}<span style={{ color: 'var(--accent)' }}>({tr(results.players.length)})</span>
              </h2>
              <Link href="/players" style={{ color: 'var(--accent)', fontSize: 13 }}>{tr("All players →")}</Link>
            </div>
            <div className="grid-4">
              {results.players.map(p => <PlayerCard key={p.id} player={p} />)}
            </div>
          </section>
        )}

        {/* Teams results */}
        {results.teams.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.02em' }}>{tr("TEAMS ")}<span style={{ color: 'var(--accent)' }}>({tr(results.teams.length)})</span>
              </h2>
              <Link href="/teams" style={{ color: 'var(--accent)', fontSize: 13 }}>{tr("All teams →")}</Link>
            </div>
            <div className="grid-3">
              {results.teams.map(t => <TeamCard key={t.id} team={t} />)}
            </div>
          </section>
        )}

        {/* News results */}
        {results.news.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.02em' }}>{tr("NEWS ")}<span style={{ color: 'var(--accent)' }}>({tr(results.news.length)})</span>
              </h2>
              <Link href="/news" style={{ color: 'var(--accent)', fontSize: 13 }}>{tr("All news →")}</Link>
            </div>
            <div className="grid-3">
              {results.news.map(a => <NewsCard key={a.id} article={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
