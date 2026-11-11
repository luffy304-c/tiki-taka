import { useI18n } from '../../lib/i18n';
// pages/career/index.js
// Feature 2: Career Path AI
// Select a player → AI generates career projection, best clubs, scenarios

import { useState } from 'react';
import Link from 'next/link';
import { useCatalog } from '../../lib/catalog';
import { callClaude } from '../../lib/ai';
import { addXP, awardBadge } from '../../lib/gamification';

function AIThinking() {
  const { t: tr, locale } = useI18n();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0' }}>
      <div className="ai-thinking"><span/><span/><span/></div>
      <span style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{tr("Projecting career path...")}</span>
    </div>
  );
}

const SCENARIOS = [
  { id: 'stay', label: 'Stays at current club', icon: '🏠' },
  { id: 'topclub', label: 'Moves to top-5 league', icon: '🚀' },
  { id: 'injury', label: 'Suffers major injury', icon: '🩺' },
  { id: 'peak', label: 'Everything goes right', icon: '👑' },
];

export default function CareerPage() {
  const { t: tr, locale } = useI18n();

  const {players} = useCatalog();
  const [selectedId, setSelectedId] = useState(players[0]?.id);
  const selectedPlayer = players.find(p=>p.id===selectedId)||players[0];
  const setSelectedPlayer = p=>setSelectedId(p.id);
  const [scenario, setScenario] = useState('topclub');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = players.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function runCareerAI() {
    setLoading(true);
    setResult('');
    const scLabel = SCENARIOS.find(s => s.id === scenario)?.label || scenario;
    try {
      const text = await callClaude(
        `You are TikiTaka's Career Path AI — a football career projection engine.
         Using only the supplied data, write a clearly hypothetical scenario. Do not present it as a prediction.
         
         Structure your response as plain text:
         
         CURRENT ASSESSMENT
         [2-3 lines on where the player is now in their career]
         
         SCENARIO: ${scLabel.toUpperCase()}
         [3-4 lines projecting what happens in this scenario]
         
         PEAK RATING PROJECTION
         [Explain why a reliable numerical prediction is not possible from this profile]
         
         IDEAL DESTINATION CLUBS
         [3 clubs with 1-line reason each]
         
         CAREER VERDICT
         [One bold, decisive conclusion about their career ceiling]`,
        `Player: ${selectedPlayer.name}
         Age: ${selectedPlayer.age}
         Position: ${selectedPlayer.position}  
         Current club: ${selectedPlayer.team}
         Rating: ${selectedPlayer.rating}/10
         Goals this season: ${selectedPlayer.goals}
         Assists: ${selectedPlayer.assists}
         Market value: ${selectedPlayer.value}
         Nationality: ${selectedPlayer.nationality}
         
         Scenario selected: ${scLabel}`
      );
      setResult(text);
      addXP('use_career');
      awardBadge('career_analyst');
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  }

  if(!selectedPlayer)return <div className="container">{tr("Добавьте игрока в каталог.")}</div>;
  const hue = selectedPlayer.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div><p className="data-notice">{tr("Сценарий генерирует внешний ИИ. Это иллюстрация, не проверенный прогноз карьеры. Требуются настройка API и вход администратора.")}</p>
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className="tag tag-blue">{tr("📈 Career AI")}</span>
            <span className="tag tag-green">{tr("⚽ Real Data")}</span>
          </div>
          <h1 className="page-title"><span>{tr("Career AI")}</span></h1>
          <p className="page-subtitle">{tr("Like FIFA Career Mode — but on real data. Pick a player, choose a scenario, get a projection.")}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Left: Player picker */}
          <div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>{tr("Select Player")}</p>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tr("Search...")}
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', outline: 'none', fontSize: 13, marginBottom: 12, transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {filtered.map(p => {
                  const ph = p.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
                  const active = selectedPlayer.id === p.id;
                  return (
                    <div key={p.id} onClick={() => { setSelectedPlayer(p); setResult(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                        background: active ? 'var(--accent-dim)' : 'transparent',
                        border: `1px solid ${active ? 'rgba(0,230,118,.25)' : 'transparent'}`,
                        transition: 'all .15s',
                      }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `hsl(${ph},50%,22%)`, border: `1px solid hsl(${ph},60%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, color: `hsl(${ph},80%,70%)`, flexShrink: 0 }}>
                        {tr(p.name.split(' ').map(n => n[0]).join('').slice(0,2))}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, color: active ? 'var(--accent)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{tr(p.position)} · {tr(p.age)}{tr("y")}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: p.rating >= 9 ? 'var(--gold)' : 'var(--accent)', fontWeight: 600 }}>{tr(p.rating)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scenario selector */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>{tr("Career Scenario")}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SCENARIOS.map(s => (
                  <button key={s.id} onClick={() => setScenario(s.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    background: scenario === s.id ? 'var(--accent-dim)' : 'var(--bg3)',
                    border: `1px solid ${scenario === s.id ? 'rgba(0,230,118,.3)' : 'var(--border)'}`,
                    color: scenario === s.id ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: scenario === s.id ? 600 : 400, transition: 'all .2s',
                  }}>
                    <span style={{ fontSize: 16 }}>{tr(s.icon)}</span>{tr(s.label)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {/* Selected player card */}
            <div style={{ background: `linear-gradient(135deg, hsl(${hue},40%,12%), var(--card))`, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 70, height: 70, borderRadius: 14, background: `hsl(${hue},50%,20%)`, border: `2px solid hsl(${hue},60%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, color: `hsl(${hue},80%,72%)` }}>
                  {tr(selectedPlayer.name.split(' ').map(n => n[0]).join('').slice(0,2))}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '.02em', lineHeight: 1 }}>{selectedPlayer.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{tr(selectedPlayer.position)} · {selectedPlayer.team}{tr(" · Age ")}{tr(selectedPlayer.age)}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {selectedPlayer.tags?.map(t => <span key={t} className="tag tag-green" style={{ fontSize: 10 }}>{tr(t)}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: selectedPlayer.rating >= 9 ? 'var(--gold)' : 'var(--accent)', lineHeight: 1 }}>{tr(selectedPlayer.rating)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{tr("Rating")}</div>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                {[
                  { l: 'Goals', v: selectedPlayer.goals },
                  { l: 'Assists', v: selectedPlayer.assists },
                  { l: 'Value', v: selectedPlayer.value },
                  { l: 'Foot', v: selectedPlayer.foot },
                ].map(({ l, v }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{tr(v)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{tr(l)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Run button */}
            <button onClick={runCareerAI} disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, fontWeight: 700, marginBottom: 20, opacity: loading ? .6 : 1 }}>
              {loading ? tr('Projecting...') : tr('career.project',{scenario:tr(SCENARIOS.find(s => s.id === scenario)?.label)})}
            </button>

            {loading && <AIThinking />}

            {/* AI Result */}
            {result && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', animation: 'fadeIn .4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18 }}>📈</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '.02em' }}>{tr("CAREER PROJECTION")}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tr("AI Generated")}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {tr(result)}
                </div>
              </div>
            )}

            {!result && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <p>{tr("Select a scenario above and run the Career AI to see a full projection.")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 320px"] {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
