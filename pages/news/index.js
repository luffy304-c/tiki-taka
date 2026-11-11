import { useI18n } from '../../lib/i18n';
// pages/news/index.js — Smart News with AI insight toggle
import { useState } from 'react';
import Link from 'next/link';
import NewsCard from '../../components/NewsCard';
import { useCatalog } from '../../lib/catalog';
import { callClaude } from '../../lib/ai';



export default function NewsPage() {
  const { t: tr, locale } = useI18n();

  const {news} = useCatalog();
  const categories = ['All', ...new Set(news.map(n => n.category))];
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [aiInsights, setAiInsights] = useState({});  // id -> {loading, text}

  const filtered = news
    .filter(n => activeCategory === 'All' || n.category === activeCategory)
    .sort((a, b) => sort === 'newest'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date));

  async function getSmartInsight(article) {
    setAiInsights(prev => ({ ...prev, [article.id]: { loading: true, text: '' } }));
    try {
      const text = await callClaude(
        `You are TikiTaka's Smart News analyst.
         Respond in exactly this format (plain text):
         NEWS: [2-line summary]
         ANALYSIS: [3-line tactical/strategic breakdown]
         VERDICT: [1 decisive conclusion line]`,
        `"${article.title}". ${article.excerpt}`
      );
      setAiInsights(prev => ({ ...prev, [article.id]: { loading: false, text } }));
    } catch {
      setAiInsights(prev => ({ ...prev, [article.id]: { loading: false, text: 'Add ANTHROPIC_API_KEY to .env.local' } }));
    }
  }

  return (
    <div>
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className="tag tag-blue">{tr("📰 Smart News")}</span>
            <span className="tag tag-green">{tr("⚡ AI Insights")}</span>
          </div>
          <h1 className="page-title"><span>{tr("Football news")}</span></h1>
          <p className="page-subtitle">{tr('news.count',{count:news.length.toLocaleString(locale)})}</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
                background: activeCategory === cat ? 'var(--accent-dim)' : 'transparent',
                color: activeCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.05em', transition: 'all .2s',
              }}>{tr(cat)}</button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text)', cursor: 'pointer', fontSize: 13 }}>
            <option value="newest">{tr("Newest First")}</option>
            <option value="oldest">{tr("Oldest First")}</option>
          </select>
        </div>

        {/* Smart News Grid — each card has AI insight button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 60 }}>
          {filtered.map((article, i) => {
            const insight = aiInsights[article.id];
            const isFirst = i === 0;
            const catColors = { 'La Liga':'#ef4444','Premier League':'#8b5cf6','Bundesliga':'#f97316','Ligue 1':'#3b82f6','Champions League':'#f59e0b','Analysis':'#10b981' };
            const cc = catColors[article.category] || '#6366f1';

            return (
              <div key={article.id} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                borderTop: isFirst ? `3px solid ${cc}` : undefined,
              }}>
                <div style={{ padding: isFirst ? '24px 28px' : '18px 22px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: `${cc}20`, color: cc, fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{tr(article.category)}</span>
                    {article.trending && <span className="tag tag-red" style={{ fontSize: 10 }}>{tr("🔥 Trending")}</span>}
                    <span style={{ color: 'var(--text-dim)', fontSize: 12, marginLeft: 'auto' }}>{tr(article.readTime)}{tr(" min read")}</span>
                  </div>

                  {/* Title */}
                  <Link href={`/news/${article.id}`}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: isFirst ? 'clamp(20px,3vw,28px)' : 18, letterSpacing: '.01em', lineHeight: 1.2, marginBottom: 8, cursor: 'pointer', transition: 'color .2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text)'}
                    >{article.title}</h3>
                  </Link>

                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                    {article.excerpt}
                  </p>

                  {/* AI Smart Insight section */}
                  {!insight && (
                    <button onClick={() => getSmartInsight(article)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, background: 'var(--accent-dim)', border: '1px solid rgba(0,230,118,.2)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)' }}>{tr("⚡ Get AI Insight")}</button>
                  )}

                  {insight?.loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="ai-thinking"><span/><span/><span/></div>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tr("Analysing...")}</span>
                    </div>
                  )}

                  {insight?.text && (
                    <div className="insight-box">
                      <div className="insight-label">{tr("⚡ Smart Analysis")}</div>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{tr(insight.text)}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{tr("By ")}{article.author} · {tr(new Date(article.date).toLocaleDateString(locale,{month:'short',day:'numeric'}))}</span>
                    <Link href={`/news/${article.id}`} style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 500 }}>{tr("Read full story →")}</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
