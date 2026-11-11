import { useI18n } from '../../lib/i18n';
// pages/news/[id].js
import Link from 'next/link';
import {useCatalog} from '../../lib/catalog';
import {useRouter} from 'next/router';

// This tells Next.js which pages to pre-build
function formatDate(dateStr, locale) {
  return new Date(dateStr).toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ArticlePage() {
  const { t: tr, locale } = useI18n();

 const db=useCatalog();const {id}=useRouter().query;const article=db.news.find(n=>n.id===id); const related=db.news.filter(n=>n.id!==id).slice(0,3);
  if (!article) return <div className="container" style={{ padding: '80px 0' }}>{tr("Article not found.")}</div>;

  return (
    <div>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-dim)' }}>
          <Link href="/" style={{ color: 'var(--text-dim)' }}>{tr("Home")}</Link>
          <span>/</span>
          <Link href="/news" style={{ color: 'var(--text-dim)' }}>{tr("News")}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{tr(article.category)}</span>
        </div>

        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          {/* Category + trending */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <span className="tag tag-muted">{tr(article.category)}</span>
            {article.trending && <span className="tag tag-red">{tr("🔥 Trending")}</span>}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 5vw, 54px)',
            lineHeight: 1.05,
            letterSpacing: '0.01em',
            marginBottom: 16,
          }}>{article.title}</h1>

          {/* Meta */}
          <div style={{
            display: 'flex', gap: 16, alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 28,
            paddingBottom: 28,
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              color: 'var(--accent)',
            }}>{tr(article.author[0])}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{article.author}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{tr(formatDate(article.date, locale))}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              {tr(article.readTime)}{tr(" min read")}</div>
          </div>

          {/* Excerpt */}
          <p style={{
            fontSize: 18,
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: 24,
            fontWeight: 300,
          }}>{article.excerpt}</p>

          {/* AI Insight box */}
          {article.insight && (
            <div style={{
              background: 'var(--accent-dim)',
              border: '1px solid rgba(0,230,118,0.25)',
              borderLeft: '4px solid var(--accent)',
              borderRadius: '0 12px 12px 0',
              padding: '16px 20px',
              marginBottom: 28,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tr("AI Insight")}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{article.insight}</p>
            </div>
          )}

          {/* Article body */}
          <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text)' }}>
            {article.content.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: 20 }}>{tr(para)}</p>
            ))}
          </div>

          {/* Tags */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{tr("Tags")}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {article.tags.map(tag => (
                <Link key={tag} href={`/search?q=${tag}`} style={{
                  padding: '4px 12px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >#{tr(tag)}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Related articles */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            letterSpacing: '0.02em',
            marginBottom: 24,
          }}>{tr("MORE ")}<span style={{ color: 'var(--accent)' }}>{tr("STORIES")}</span></h2>
          <div className="grid-3">
            {related.map(art => {
              const catColors = { 'La Liga': '#ef4444', 'Champions League': '#f59e0b', default: '#6366f1' };
              const cc = catColors[art.category] || catColors.default;
              return (
                <Link key={art.id} href={`/news/${art.id}`} style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'block',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ fontSize: 11, color: cc, fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase' }}>{tr(art.category)}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.2, marginTop: 6, marginBottom: 8 }}>{tr(art.title)}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{tr(art.excerpt.slice(0, 80))}...</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
