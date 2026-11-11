import { useI18n } from '../../lib/i18n';
// pages/teams/[id].js
import Link from 'next/link';
import {useCatalog} from '../../lib/catalog';
import {useRouter} from 'next/router';
import PlayerCard from '../../components/PlayerCard';

export default function TeamPage() {
  const { t: tr, locale } = useI18n();

 const db=useCatalog();const {id}=useRouter().query;const team=db.teams.find(t=>t.id===id); const teamPlayers=db.players.filter(p=>p.teamId===id);
  if (!team) return <div className="container" style={{ padding: '80px 0' }}>{tr("Team not found.")}</div>;

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '56px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 25% 50%, ${team.color}18 0%, transparent 60%)`,
        }}/>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${team.color}, transparent)`,
        }}/>

        <div className="container">
          <div style={{ marginBottom: 20, display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-dim)' }}>
            <Link href="/" style={{ color: 'var(--text-dim)' }}>{tr("Home")}</Link>
            <span>/</span>
            <Link href="/teams" style={{ color: 'var(--text-dim)' }}>{tr("Teams")}</Link>
            <span>/</span>
            <span>{team.shortName}</span>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Badge */}
            <div style={{
              width: 100, height: 100,
              background: `${team.color}20`,
              border: `3px solid ${team.color}50`,
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: team.color,
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}>{team.shortName}</div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px',
                  background: `${team.color}20`,
                  border: `1px solid ${team.color}40`,
                  borderRadius: 4,
                  fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: team.color, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{tr(team.league)}</span>
                <span className="tag tag-muted">{tr(team.country)}</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 60px)',
                lineHeight: 1,
                letterSpacing: '0.02em',
                marginBottom: 8,
              }}>{team.name}</h1>

              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{tr("Est. ")}{tr(team.founded)} · {team.stadium} ({(tr(team.capacity == null ? '—' : Number(team.capacity).toLocaleString(locale)))}{tr(" cap) · Manager: ")}{team.manager}
              </p>
            </div>

            {/* Trophy count */}
            <div style={{
              background: 'rgba(255,214,0,0.08)',
              border: '2px solid rgba(255,214,0,0.3)',
              borderRadius: 16,
              padding: '16px 24px',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, lineHeight: 1, color: 'var(--gold)' }}>🏆</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--gold)' }}>{tr(team.trophies)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{tr("League Titles")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Founded', val: team.founded, icon: '📅' },
            { label: 'Stadium', val: team.stadium, icon: '🏟️' },
            { label: 'Capacity', val: (team.capacity == null ? '—' : Number(team.capacity).toLocaleString(locale)), icon: '👥' },
            { label: 'Manager', val: team.manager, icon: '🧑‍💼' },
          ].map(({ label, val, icon }) => (
            <div key={label} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{tr(icon)}</div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{tr(val)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tr(label)}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 40,
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.02em', marginBottom: 10 }}>{tr("ABOUT THE CLUB")}</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{team.description}</p>
        </div>

        {/* Featured Players */}
        {teamPlayers.length > 0 && (
          <>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, letterSpacing: '0.02em', marginBottom: 20,
            }}>{tr("FEATURED ")}<span style={{ color: team.color }}>{tr("PLAYERS")}</span></h2>
            <div className="grid-4">
              {teamPlayers.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
