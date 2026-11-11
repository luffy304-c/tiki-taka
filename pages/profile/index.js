import { useI18n } from '../../lib/i18n';
// pages/profile/index.js
// Feature 6: Gamification — XP, levels, badges, leaderboard

import { useState, useEffect } from 'react';
import { getProfile, getLevelInfo, LEVELS, BADGES } from '../../lib/gamification';
import Link from 'next/link';

export default function ProfilePage() {
  const { t: tr, locale } = useI18n();

  const [profile, setProfile] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountMode, setAccountMode] = useState('register');
  const [accountMessage, setAccountMessage] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setLevelInfo(getLevelInfo(p.xp));
    fetch('/api/account').then(r => r.json()).then(a=>{if(a.authenticated)localStorage.setItem('tt_active_account',a.username);else localStorage.removeItem('tt_active_account');const current=getProfile();setProfile(current);setLevelInfo(getLevelInfo(current.xp));setAccount(a);}).catch(() => setAccount({authenticated:false}));
  }, []);

  async function submitAccount(e) {
    e.preventDefault(); setAccountBusy(true); setAccountMessage('');
    try {
      const r=await fetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:accountMode,username:accountName,password:accountPassword})});
      const d=await r.json(); if(!r.ok)throw Error(d.error||'Не удалось выполнить запрос');
      localStorage.setItem('tt_active_account',d.username);const current=getProfile();setProfile(current);setLevelInfo(getLevelInfo(current.xp));setAccount({authenticated:true,username:d.username});setAccountPassword('');setAccountMessage(accountMode==='register'?'Аккаунт создан.':'Вы вошли в аккаунт.');
    } catch(err) { setAccountMessage(err.message); }
    finally { setAccountBusy(false); }
  }

  async function logoutAccount(){
    const r=await fetch('/api/account',{method:'DELETE'});if(r.ok){localStorage.removeItem('tt_active_account');const current=getProfile();setProfile(current);setLevelInfo(getLevelInfo(current.xp));setAccount({authenticated:false});setAccountMessage('Вы вышли из аккаунта.');}
  }

  if (!profile || !levelInfo) return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}/>
    </div>
  );

  const { current, next, xpInLevel, xpNeeded, progress } = levelInfo;
  const earnedBadges = BADGES.filter(b => profile.badges.includes(b.id));
  const missingBadges = BADGES.filter(b => !profile.badges.includes(b.id));

  return (
    <div>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title"><span>{tr("My Profile")}</span></h1>
          <p className="page-subtitle">{tr("Your football intelligence journey")}</p>
        </div>

        <section className="panel" aria-label={tr("Аккаунт пользователя")} style={{marginBottom:24}}>
          {account?.authenticated ? <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><p>{tr("Вы вошли как ")}<strong>{account.username}</strong></p><button type="button" onClick={logoutAccount}>{tr("Выйти")}</button></div> : <>
            <h2>{tr(accountMode==='register'?'Создать аккаунт':'Войти в аккаунт')}</h2>
            <p className="muted">{tr("Аккаунт пользователя не даёт доступа к управлению сайтом.")}</p>
            <form onSubmit={submitAccount}>
              <div className="form-grid">
                <label>{tr("Логин")}<input autoComplete="username" value={accountName} onChange={e=>setAccountName(e.target.value)} minLength="3" maxLength="32" required/></label>
                <label>{tr("Пароль")}<input type="password" autoComplete={accountMode==='register'?'new-password':'current-password'} value={accountPassword} onChange={e=>setAccountPassword(e.target.value)} minLength={accountMode==='register'?8:1} maxLength="128" required/></label>
              </div>
              <button disabled={accountBusy}>{tr(accountMode==='register'?'Зарегистрироваться':'Войти')}</button>
              <button type="button" className="btn btn-ghost" onClick={()=>{setAccountMode(accountMode==='register'?'login':'register');setAccountMessage('');}}>{tr(accountMode==='register'?'Уже есть аккаунт? Войти':'Создать аккаунт')}</button>
            </form>
          </>}
          {accountMessage&&<p role="status">{tr(accountMessage)}</p>}
        </section>

        {/* Level card */}
        <div style={{
          background: `linear-gradient(135deg, rgba(0,230,118,.08), var(--card))`,
          border: '1px solid rgba(0,230,118,.2)',
          borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'var(--font-display)', fontSize: 120, lineHeight: 1, color: 'rgba(0,230,118,.04)', userSelect: 'none', paddingRight: 20 }}>{tr("LVL")}{tr(current.level)}
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 16,
              background: 'rgba(0,230,118,.12)', border: '2px solid rgba(0,230,118,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0,
            }}>{tr(current.icon)}</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{tr("Level ")}{tr(current.level)}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent)', lineHeight: 1 }}>{tr(current.name)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {tr(profile.xp.toLocaleString(locale))}{tr(" XP total")}{next && <> · {tr('profile.nextLevel',{points:(next.minXP-profile.xp).toLocaleString(locale),level:tr(next.name)})}</>}
              </div>
            </div>
          </div>

          {next && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                <span>{tr(xpInLevel.toLocaleString(locale))}{tr(" XP")}</span>
                <span>{tr(xpNeeded.toLocaleString(locale))}{tr(" XP needed")}</span>
              </div>
              <div className="xp-bar-wrap">
                <div className="xp-bar-fill" style={{ width: `${progress}%` }}/>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>{tr("Next level: ")}<span style={{ color: 'var(--gold)' }}>{tr(next.icon)} {tr(next.name)}</span>
              </p>
            </>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Total XP', val: profile.xp.toLocaleString(locale), icon: '⚡', color: 'var(--gold)' },
            { label: 'Level',    val: current.level, icon: current.icon, color: 'var(--accent)' },
            { label: 'Badges',   val: earnedBadges.length, icon: '🏅', color: 'var(--orange)' },
            { label: 'Streak',   val: tr("Days: {0}",{0:profile.streak.toLocaleString(locale)}), icon: '🔥', color: 'var(--red)' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{tr(icon)}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color, lineHeight: 1, marginBottom: 4 }}>{tr(val)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{tr(label)}</div>
            </div>
          ))}
        </div>

        {/* All levels progress */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '.02em', marginBottom: 20 }}>{tr("LEVEL ")}<span style={{ color: 'var(--accent)' }}>{tr("ROADMAP")}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEVELS.map((lvl, i) => {
              const reached = profile.xp >= lvl.minXP;
              const isCurrent = current.level === lvl.level;
              return (
                <div key={lvl.level} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                  background: isCurrent ? 'rgba(0,230,118,.06)' : 'var(--bg3)',
                  border: `1px solid ${isCurrent ? 'rgba(0,230,118,.25)' : 'var(--border)'}`,
                  borderRadius: 10, opacity: reached ? 1 : .5,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: reached ? 'rgba(0,230,118,.12)' : 'var(--bg2)', border: `1px solid ${reached ? 'rgba(0,230,118,.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {tr(lvl.icon)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, color: isCurrent ? 'var(--accent)' : reached ? 'var(--text)' : 'var(--text-dim)' }}>{tr("Level ")}{tr(lvl.level)} — {tr(lvl.name)}
                        {isCurrent && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{tr("YOU ARE HERE")}</span>}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tr(lvl.minXP.toLocaleString(locale))}{tr(" XP")}</span>
                    </div>
                    {isCurrent && (
                      <div className="xp-bar-wrap" style={{ height: 4 }}>
                        <div className="xp-bar-fill" style={{ width: `${progress}%` }}/>
                      </div>
                    )}
                  </div>
                  {reached && <span style={{ fontSize: 16 }}>✅</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '.02em', marginBottom: 20 }}>{tr("EARNED ")}<span style={{ color: 'var(--accent)' }}>{tr("BADGES")}</span>
          </h2>
          {earnedBadges.length === 0 && (
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>{tr("No badges yet. Start exploring to earn your first!")}</p>
          )}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {earnedBadges.map(b => (
              <div key={b.id} style={{ background: 'var(--card)', border: '1px solid rgba(255,214,0,.2)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{tr(b.icon)}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{tr(b.name)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{tr(b.desc)}</div>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>+{tr(b.xp)}{tr(" XP")}</div>
              </div>
            ))}
          </div>

          {/* Locked badges */}
          {missingBadges.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>{tr("Still to unlock")}</h3>
              <div className="grid-4">
                {missingBadges.map(b => (
                  <div key={b.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center', opacity: .5 }}>
                    <div style={{ fontSize: 32, marginBottom: 8, filter: 'grayscale(1)' }}>{tr(b.icon)}</div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4, color: 'var(--text-muted)' }}>{tr(b.name)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>{tr(b.desc)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>+{tr(b.xp)}{tr(" XP")}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* How to earn XP */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 60 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '.02em', marginBottom: 16 }}>{tr("EARN MORE ")}<span style={{ color: 'var(--accent)' }}>{tr("XP")}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { action: 'Use AI Intel',      xp: 50, href: '/ai-core',  icon: '🧠' },
              { action: 'Run Career AI',     xp: 40, href: '/career',   icon: '📈' },
              { action: 'Scout a Player',    xp: 40, href: '/scout',    icon: '🔭' },
              { action: 'Use Football Map',  xp: 30, href: '/map',      icon: '📍' },
              { action: 'Read an article',   xp: 20, href: '/news',     icon: '📰' },
              { action: 'Search',            xp: 15, href: '/search',   icon: '🔍' },
            ].map(({ action, xp, href, icon }) => (
              <Link key={action} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <span style={{ fontSize: 20 }}>{tr(icon)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tr(action)}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>+{tr(xp)}{tr(" XP")}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
