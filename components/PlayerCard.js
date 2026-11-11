import { useI18n } from '../lib/i18n';
// components/PlayerCard.js
import Link from 'next/link';

const positionColors = {
  Striker:    { bg: 'rgba(255,61,87,0.1)',   text: '#ff3d57', border: 'rgba(255,61,87,0.2)' },
  Forward:    { bg: 'rgba(255,165,0,0.1)',   text: '#ffa500', border: 'rgba(255,165,0,0.2)' },
  Winger:     { bg: 'rgba(255,214,0,0.1)',   text: '#ffd600', border: 'rgba(255,214,0,0.2)' },
  Midfielder: { bg: 'rgba(0,230,118,0.1)',   text: '#00e676', border: 'rgba(0,230,118,0.2)' },
  Defender:   { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
  Goalkeeper: { bg: 'rgba(168,85,247,0.1)',  text: '#a855f7', border: 'rgba(168,85,247,0.2)' },
  default:    { bg: 'rgba(255,255,255,0.05)', text: '#888', border: 'rgba(255,255,255,0.1)' },
};

function getRatingColor(rating) {
  if (rating >= 9.2) return '#ffd600';
  if (rating >= 8.8) return '#00e676';
  return '#3b82f6';
}

export default function PlayerCard({ player }) {
  const { t: tr, locale } = useI18n();

  const pos = positionColors[player.position] || positionColors.default;
  const rColor = getRatingColor(player.rating);

  // Generate initials avatar color from name
  const hue = player.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <Link href={`/players/${player.id}`} style={{ display: 'block' }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        {/* Top row: avatar + number + rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52,
            borderRadius: 12,
            background: `hsl(${hue},60%,25%)`,
            border: `2px solid hsl(${hue},60%,40%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            color: `hsl(${hue},80%,75%)`,
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}>
            {tr(player.name.split(' ').map(n => n[0]).join('').slice(0, 2))}
          </div>

          {/* Jersey number */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            color: 'var(--border-light)',
            lineHeight: 1,
            userSelect: 'none',
          }}>#{tr(player.number)}</div>
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          marginBottom: 4,
          color: 'var(--text)',
        }}>{player.name}</h3>

        {/* Position + nationality */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: pos.bg,
            color: pos.text,
            border: `1px solid ${pos.border}`,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>{tr(player.position)}</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-muted)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
          }}>{tr(player.nationality)}</span>
        </div>

        {/* Team */}
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
          🏟️ {player.team}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: '12px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          marginBottom: 12,
        }}>
          {[
            { label: 'Goals', val: player.goals },
            { label: 'Assists', val: player.assists },
            { label: 'Rating', val: player.rating, highlight: rColor },
          ].map(({ label, val, highlight }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: highlight || 'var(--text)',
                lineHeight: 1,
              }}>{tr(val)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{tr(label)}</div>
            </div>
          ))}
        </div>

        {/* Value */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{tr("Market Value")}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--accent)',
            fontWeight: 600,
          }}>{tr(player.value)}</span>
        </div>
      </div>
    </Link>
  );
}
