import { useI18n } from '../lib/i18n';
// pages/index.js — TikiTaka v2 Homepage
import Link from 'next/link';
import NewsCard from '../components/NewsCard';
import PlayerCard from '../components/PlayerCard';
import { useCatalog } from '../lib/catalog';
import { useEffect, useState } from 'react';
import { getProfile, getLevelInfo } from '../lib/gamification';

const FEATURES = [
  { href:'/ai-core',  icon:'🧠', label:'AI Intel',    tag:'AI Core',    color:'#a78bfa', desc:'Ask anything. Get football intelligence, not just stats.' },
  { href:'/career',   icon:'📈', label:'Career AI',   tag:'Career Path',color:'#3b82f6', desc:'Illustrative AI scenarios, not validated predictions.' },
  { href:'/scout',    icon:'🔭', label:'Scout Mode',  tag:'Hidden Gems',color:'#f97316', desc:'Find undervalued players. Moneyball for the modern fan.' },
  { href:'/map',      icon:'📍', label:'Near Me',     tag:'Real World', color:'#00e676', desc:'Demonstration of pitches and team selection.' },
  { href:'/news',     icon:'⚡', label:'Smart News',  tag:'AI Analysis',color:'#ffd600', desc:'Every article = news + analysis + verdict. Not info — understanding.' },
  { href:'/profile',  icon:'🏅', label:'My Profile',  tag:'Gamification',color:'#ff3d57', desc:'Level up. Earn badges. Become a Football Sage.' },
];

export default function Home() {
  const { t: tr, locale } = useI18n();

  const {news, players, teams} = useCatalog();
  const trendingNews = news.filter(n => n.trending);
  const latestNews = news.slice(0, 3);
  const topPlayers = players.slice(0, 4);
  const [profile, setProfile] = useState(null);
  const [lvl, setLvl] = useState(null);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setLvl(getLevelInfo(p.xp));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ position:'relative', overflow:'hidden', padding:'64px 0 56px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 15% 50%, rgba(0,230,118,.07) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(100,100,200,.06) 0%, transparent 50%)', pointerEvents:'none' }}/>
        <div className="container">
          <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
            <span className="tag tag-green">{tr("⚽ Каталог")}</span>
            <span className="tag tag-purple">{tr("🧠 AI Powered")}</span>
            <span className="tag tag-orange">{tr("🔭 Scout Mode")}</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(52px,8vw,100px)', lineHeight:.95, letterSpacing:'.01em', marginBottom:20 }}>{tr("FOOTBALL +")}<br/><span style={{ color:'var(--accent)' }}>{tr("INTELLIGENCE")}</span><br/>{tr("+ LIFE.")}</h1>
          <p style={{ fontSize:17, color:'var(--text-muted)', lineHeight:1.7, marginBottom:28, maxWidth:560 }}>{tr("TikiTaka is not another stats app. It's a football intelligence platform — AI-powered analysis, career projections, scout reports, and real-world connections.")}</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link href="/ai-core" className="btn btn-primary" style={{ padding:'12px 24px', fontSize:15, fontWeight:700 }}>{tr("🧠 Try AI Intel →")}</Link>
            <Link href="/scout"   className="btn btn-ghost"   style={{ padding:'12px 24px', fontSize:15 }}>{tr("🔭 Scout Mode")}</Link>
          </div>
        </div>
      </section>

      {/* ── 6 FEATURE CARDS ── */}
      <section style={{ padding:'60px 0', background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,44px)', letterSpacing:'.02em' }}>{tr("7 FEATURES THAT CHANGE ")}<span style={{ color:'var(--accent)' }}>{tr("HOW YOU SEE FOOTBALL")}</span>
            </h2>
          </div>
          <div className="grid-3">
            {FEATURES.map(({ href, icon, label, tag, color, desc }) => (
              <Link key={href} href={href} style={{ display:'block' }}>
                <div style={{
                  background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
                  padding:'24px', cursor:'pointer', transition:'all .2s', height:'100%',
                  borderTop:`3px solid ${color}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${color}22`; e.currentTarget.style.borderColor='var(--border-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)'; }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>{tr(icon)}</div>
                  <div style={{ marginBottom:8 }}>
                    <span style={{ padding:'2px 8px', borderRadius:4, background:`${color}18`, color, fontSize:10, fontFamily:'var(--font-mono)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{tr(tag)}</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, letterSpacing:'.02em', marginBottom:8 }}>{tr(label)}</h3>
                  <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{tr(desc)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── XP BANNER ── */}
      {profile && lvl && (
        <section style={{ padding:'24px 0', background:'linear-gradient(135deg, rgba(0,230,118,.06), transparent)', borderBottom:'1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <div style={{ fontSize:28 }}>{tr(lvl.current.icon)}</div>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{tr("Level ")}{tr(lvl.current.level)} — {tr(lvl.current.name)}</span>
                  <span style={{ fontSize:12, color:'var(--accent)', fontFamily:'var(--font-mono)', fontWeight:700 }}>⚡ {tr(profile.xp.toLocaleString(locale))}{tr(" XP")}</span>
                </div>
                <div className="xp-bar-wrap">
                  <div className="xp-bar-fill" style={{ width:`${lvl.progress}%` }}/>
                </div>
              </div>
              <Link href="/profile" className="btn btn-ghost" style={{ fontSize:13, flexShrink:0 }}>{tr("View Profile →")}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TRENDING NEWS ── */}
      <section style={{ padding:'60px 0' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:28 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,38px)', letterSpacing:'.02em' }}>{tr("🔥 TRENDING ")}<span style={{ color:'var(--accent)' }}>{tr("NOW")}</span>
            </h2>
            <Link href="/news" style={{ color:'var(--accent)', fontSize:14, fontWeight:500 }}>{tr("All news →")}</Link>
          </div>
          {trendingNews.slice(0,1).map(a => <div key={a.id} style={{ marginBottom:20 }}><NewsCard article={a} featured /></div>)}
          <div className="grid-2">
            {trendingNews.slice(1).map(a => <NewsCard key={a.id} article={a} />)}
          </div>
        </div>
      </section>

      {/* ── TOP PLAYERS ── */}
      <section style={{ padding:'60px 0', background:'var(--bg2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:28 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,38px)', letterSpacing:'.02em' }}>{tr("⭐ TOP ")}<span style={{ color:'var(--accent)' }}>{tr("PLAYERS")}</span>
            </h2>
            <Link href="/players" style={{ color:'var(--accent)', fontSize:14, fontWeight:500 }}>{tr("All players →")}</Link>
          </div>
          <div className="grid-4">
            {topPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        </div>
      </section>

      {/* ── AI DEMO PROMO ── */}
      <section style={{ padding:'60px 0' }}>
        <div className="container">
          <div style={{
            background:'linear-gradient(135deg, rgba(0,230,118,.06), rgba(100,100,200,.04))',
            border:'1px solid rgba(0,230,118,.2)', borderRadius:'var(--radius-lg)',
            padding:'40px 48px', display:'flex', gap:32, alignItems:'center', flexWrap:'wrap',
          }}>
            <div style={{ flex:1, minWidth:260 }}>
              <span className="tag tag-green" style={{ marginBottom:14, display:'inline-flex' }}>{tr("🧠 AI Core")}</span>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,40px)', letterSpacing:'.02em', marginBottom:12 }}>{tr("ASK ANYTHING ABOUT ")}<span style={{ color:'var(--accent)' }}>{tr("FOOTBALL")}</span>
              </h2>
              <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.7, marginBottom:20 }}>{tr("\"What does this transfer mean for my club?\" — TikiTaka AI turns raw football data into real decisions.")}</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <Link href="/ai-core" className="btn btn-primary">{tr("Try AI Intel →")}</Link>
                <Link href="/career"  className="btn btn-ghost">{tr("Career Projections")}</Link>
              </div>
            </div>
            <div style={{ flexShrink:0 }}>
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 20px', width:280 }}>
                {[
                  { q:'Transfer impact?', a:'Strengthens attack +23%' },
                  { q:'Title chances?',   a:'From 45% → 67% likely' },
                  { q:'Scout: hidden gems?', a:'3 players under €50M' },
                ].map(({ q, a }) => (
                  <div key={q} style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:4, fontFamily:'var(--font-mono)' }}>❓ {tr(q)}</div>
                    <div style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>⚡ {tr(a)}</div>
                  </div>
                ))}
                <div style={{ fontSize:11, color:'var(--text-dim)', fontFamily:'var(--font-mono)', textAlign:'center' }}>{tr("Powered by Claude AI")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLUBS STRIP ── */}
      <section style={{ padding:'40px 0', background:'var(--bg2)', borderTop:'1px solid var(--border)' }}>
        <div className="container">
          <p style={{ color:'var(--text-dim)', fontSize:12, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:16 }}>{tr("Featured Clubs")}</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            {teams.map(t => (
              <Link key={t.id} href={`/teams/${t.id}`} style={{
                padding:'8px 16px', background:`${t.color}15`, border:`1px solid ${t.color}30`,
                borderRadius:8, color:t.color, fontSize:13, fontWeight:600, fontFamily:'var(--font-mono)',
                letterSpacing:'.04em', transition:'all .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background=`${t.color}25`}
              onMouseLeave={e => e.currentTarget.style.background=`${t.color}15`}
              >{t.shortName}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
