import { useI18n } from '../lib/i18n';
// pages/404.js
import Link from 'next/link';

export default function Custom404() {
  const { t: tr, locale } = useI18n();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>⚽</div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(60px, 12vw, 120px)',
        color: 'var(--accent)',
        lineHeight: 1,
        marginBottom: 8,
      }}>404</h1>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 4vw, 32px)',
        color: 'var(--text)',
        marginBottom: 12,
        letterSpacing: '0.02em',
      }}>{tr("OFFSIDE. PAGE NOT FOUND.")}</p>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400 }}>{tr("The page you're looking for has been transferred, retired, or never existed.")}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">{tr("← Back to Home")}</Link>
        <Link href="/news" className="btn btn-ghost">{tr("Latest News")}</Link>
      </div>
    </div>
  );
}
