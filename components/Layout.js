import { useI18n } from '../lib/i18n';
// components/Layout.js
import Navbar from './Navbar';
import Link from 'next/link';

export default function Layout({ children }) {
  const { t: tr, locale } = useI18n();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 0',
        marginTop: 80,
        background: 'var(--bg2)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚽</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              letterSpacing: '0.05em',
            }}>{tr("TIKI")}<span style={{ color: 'var(--accent)' }}>{tr("TAKA")}</span></span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{tr("© 2025 TikiTaka. The beautiful game, beautifully covered.")}</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['/', '/news', '/players', '/teams'].map((href, i) => (
              <Link key={href} href={href} style={{
                color: 'var(--text-dim)',
                fontSize: 13,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
              >{tr(['Home','News','Players','Teams'][i])}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
