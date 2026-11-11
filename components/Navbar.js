import { useI18n } from '../lib/i18n';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t: tr, locale } = useI18n();

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const links = [
    { href: '/',            label: 'Главная',   icon: '⚽' },
    { href: '/leagues',     label: 'Лиги',      icon: '🏆' },
    { href: '/players',     label: 'Игроки',    icon: '👤' },
    { href: '/live-search', label: 'Внешний поиск',icon: '🔴' },
    { href: '/teams',       label: 'Клубы',     icon: '🏟️' },
    { href: '/news',        label: 'Новости',   icon: '📰' },
    { href: '/ai-core',     label: 'AI Intel',  icon: '🧠' },
    { href: '/career',      label: 'Карьера',   icon: '📈' },
    { href: '/compare', label: 'Сравнение', icon: '📊' },
    { href: '/quiz',        label: 'Тесты',     icon: '🎯' },
    { href: '/profile', label: 'Аккаунт', icon: '👤' },
    { href: '/scout',       label: 'Скаут',     icon: '🔭' },
    { href: '/map',         label: 'Карта',     icon: '📍' },
  ];

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  const isActive = (href) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60, gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚽</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '.05em' }}>{tr("TIKI")}<span style={{ color: 'var(--accent)' }}>{tr("TAKA")}</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }} className="desktop-nav">
          {links.map(({ href, label, icon }) => (
            <Link key={href} href={href} style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              color: isActive(href) ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive(href) ? 'var(--accent-dim)' : 'transparent',
              transition: 'all .2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 12 }}>{tr(icon)}</span>{tr(label)}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="desktop-nav">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 12 }}>🔍</span>
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder={tr("Search...")}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '6px 10px 6px 28px', color: 'var(--text)', width: 150, outline: 'none', fontSize: 12,
                transition: 'border-color .2s, width .2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.width = '180px'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.width = '150px'; }}
            />
          </div>
        </form>

        {/* Mobile hamburger */}
        <LanguageSwitcher />
        <button aria-label={tr('menu.toggle')} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn"
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 20, padding: 4, marginLeft: 'auto' }}>
          {tr(menuOpen ? '✕' : '☰')}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
          {links.map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 0', borderBottom: '1px solid var(--border)',
              color: isActive(href) ? 'var(--accent)' : 'var(--text)',
              fontSize: 15, fontWeight: 500,
            }}><span>{tr(icon)}</span>{tr(label)}</Link>
          ))}
          <form onSubmit={e => { handleSearch(e); setMenuOpen(false); }} style={{ marginTop: 16 }}>
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder={tr("Search...")} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', outline: 'none' }} />
          </form>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
