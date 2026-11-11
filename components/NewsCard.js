import { useI18n } from '../lib/i18n';
// components/NewsCard.js
import Link from 'next/link';

function formatDate(dateStr, locale) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Each category gets a color
const categoryColors = {
  'La Liga': '#ef4444',
  'Premier League': '#8b5cf6',
  'Bundesliga': '#f97316',
  'Ligue 1': '#3b82f6',
  'Champions League': '#f59e0b',
  'Analysis': '#10b981',
  'default': '#6366f1',
};

export default function NewsCard({ article, featured = false }) {
  const { t: tr, locale } = useI18n();

  const catColor = categoryColors[article.category] || categoryColors.default;

  if (featured) {
    return (
      <Link href={`/news/${article.id}`} style={{ display: 'block' }}>
        <article style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-light)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          {/* Accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3, background: `linear-gradient(90deg, ${catColor}, transparent)`,
          }}/>

          {article.trending && (
            <div style={{ marginBottom: 14 }}>
              <span className="tag tag-red">{tr("🔥 Trending")}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: 4,
              background: `${catColor}20`,
              color: catColor,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>{tr(article.category)}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{tr(formatDate(article.date, locale))}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>· {tr(article.readTime)}{tr(" min read")}</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3vw, 30px)',
            letterSpacing: '0.01em',
            lineHeight: 1.15,
            marginBottom: 12,
            color: 'var(--text)',
          }}>{article.title}</h2>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16, maxWidth: 620 }}>
            {article.excerpt}
          </p>

          {article.insight && (
            <div style={{
              background: 'var(--accent-dim)',
              border: '1px solid rgba(0,230,118,0.2)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: '0 8px 8px 0',
              padding: '10px 14px',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, marginBottom: 2 }}>{tr("⚡ AI Insight")}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{article.insight}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{tr("By ")}{article.author}</span>
            <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>{tr("Read more →")}</span>
          </div>
        </article>
      </Link>
    );
  }

  // Standard card
  return (
    <Link href={`/news/${article.id}`} style={{ display: 'block' }}>
      <article style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = 'var(--card-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'var(--card)';
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: `${catColor}20`,
            color: catColor,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>{tr(article.category)}</span>
          {article.trending && <span className="tag tag-red" style={{ fontSize: 10 }}>{tr("Trending")}</span>}
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          letterSpacing: '0.01em',
          lineHeight: 1.2,
          marginBottom: 8,
          color: 'var(--text)',
        }}>{article.title}</h3>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
          {tr(article.excerpt.slice(0, 110))}...
        </p>

        {article.insight && (
          <div style={{
            background: 'var(--accent-dim)',
            borderLeft: '2px solid var(--accent)',
            padding: '8px 10px',
            borderRadius: '0 6px 6px 0',
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ⚡ {tr(article.insight.slice(0, 90))}...
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{tr(formatDate(article.date, locale))}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{tr(article.readTime)}{tr(" min")}</span>
        </div>
      </article>
    </Link>
  );
}
