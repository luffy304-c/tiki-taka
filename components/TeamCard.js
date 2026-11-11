import { useI18n } from '../lib/i18n';
// components/TeamCard.js
import Link from 'next/link';

export default function TeamCard({ team }) {
  const { t: tr, locale } = useI18n();

  return (
    <Link href={`/teams/${team.id}`} style={{ display: 'block' }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${team.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        {/* Color accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: team.color,
        }}/>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          {/* Club initials badge */}
          <div style={{
            width: 54, height: 54,
            background: `${team.color}22`,
            border: `2px solid ${team.color}44`,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            color: team.color,
            letterSpacing: '0.05em',
          }}>{team.shortName}</div>

          {/* Trophy count */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              color: 'var(--gold)',
              lineHeight: 1,
            }}>{tr(team.trophies)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{tr("Titles")}</div>
          </div>
        </div>

        {/* Team name */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          marginBottom: 6,
          color: 'var(--text)',
        }}>{team.name}</h3>

        {/* League + Country */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: `${team.color}18`,
            color: team.color,
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>{tr(team.league)}</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-muted)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
          }}>{tr(team.country)}</span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
          {tr((team.description || '').slice(0, 100))}...
        </p>

        {/* Footer stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)',
        }}>
          {[
            { label: 'Founded', val: team.founded },
            { label: 'Stadium Cap', val: (team.capacity == null ? '—' : Number(team.capacity).toLocaleString(locale)) },
            { label: 'Players', val: team.playerCount },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{tr(val)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{tr(label)}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
