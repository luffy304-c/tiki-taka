import { useI18n } from '../../lib/i18n';
import {useCatalog} from '../../lib/catalog';
// pages/ai-core/index.js
// Feature 1: Персональный футбольный интеллект (AI Core)
// Ask anything about football — get intelligent, structured answers

import { useState, useEffect } from 'react';
import { callClaude } from '../../lib/ai';
import { addXP, awardBadge } from '../../lib/gamification';

const QUICK_QUESTIONS = [
  { q: 'What does the Mbappé transfer mean for Real Madrid?', club: 'Real Madrid CF' },
  { q: 'Should Barcelona invest in a new striker this summer?', club: 'FC Barcelona' },
  { q: 'Will Manchester City win the Champions League this season?', club: 'Manchester City' },
  { q: 'How will Haaland\'s injury affect City\'s title race?', club: 'Manchester City' },
  { q: 'Is PSG finally building a real team or just collecting stars?', club: 'PSG' },
  { q: 'What tactical system suits Bayern Munich best right now?', club: 'Bayern Munich' },
];

const TRANSFER_EXAMPLES = [
  { player: 'Lamine Yamal', from: 'FC Barcelona', to: 'Real Madrid', fee: '€250M' },
  { player: 'Erling Haaland', from: 'Man City', to: 'Real Madrid', fee: '€200M' },
  { player: 'Jude Bellingham', from: 'Real Madrid', to: 'Liverpool', fee: '€180M' },
];

function AIThinking() {
  const { t: tr, locale } = useI18n();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
      <div className="ai-thinking"><span/><span/><span/></div>
      <span style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{tr("AI analysing...")}</span>
    </div>
  );
}

function ResultCard({ text, title, color = 'var(--accent)' }) {
  const { t: tr, locale } = useI18n();

  if (!text) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginTop: 20,
      animation: 'fadeIn .4s ease',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {tr(title)}
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
        {tr(text)}
      </div>
    </div>
  );
}

export default function AICoreePage() {
  const { t: tr, locale } = useI18n();

  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [transferPlayer, setTransferPlayer] = useState('');
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [transferResult, setTransferResult] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  async function handleQuestion(q) {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const text = await callClaude(
        `You are TikiTaka AI — a football intelligence engine that turns data into decisions.
         Answer in exactly this structure (plain text, no markdown):
         SITUATION: [2 lines explaining the current state]
         IMPACT: [2 lines on what this means]
         VERDICT: [1 decisive conclusion]`,
        query
      );
      setResult(text);
      addXP('use_ai');
      awardBadge('ai_user');
    } catch {
      setResult('AI service unavailable. Please add ANTHROPIC_API_KEY to your .env.local file.');
    }
    setLoading(false);
  }

  async function handleTransfer() {
    if (!transferPlayer || !transferFrom || !transferTo) return;
    setTransferLoading(true);
    setTransferResult('');
    try {
      const text = await callClaude(
        `You are TikiTaka's transfer analyst. Analyse football transfers with tactical depth.
         Structure your answer as plain text:
         TACTICAL IMPACT: [what changes tactically for the buying club]
         FOR BOTH CLUBS: [1 line each — what seller loses, what buyer gains]
         MARKET VERDICT: [Is the fee fair? One sentence.]`,
        `Transfer: ${transferPlayer} from ${transferFrom} to ${transferTo} for ${transferFee || 'undisclosed'}.`
      );
      setTransferResult(text);
      addXP('use_ai');
    } catch {
      setTransferResult('AI service unavailable. Add ANTHROPIC_API_KEY to .env.local.');
    }
    setTransferLoading(false);
  }

  return (
    <div><p className="data-notice">{tr("Внешний ИИ: ответы могут содержать ошибки. Автоматической проверки актуальности нет. Функция отключена по умолчанию.")}</p>
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="tag tag-purple">{tr("🧠 AI Powered")}</span>
            <span className="tag tag-green">{tr("⚡ Real Insights")}</span>
          </div>
          <h1 className="page-title"><span>{tr("AI Intel")}</span></h1>
          <p className="page-subtitle">{tr("Not just data — understanding. Ask anything about football.")}</p>
        </div>

        {/* ── SECTION 1: Ask Anything ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '.02em', marginBottom: 6 }}>{tr("ASK THE ")}<span style={{ color: 'var(--accent)' }}>{tr("AI")}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{tr("\"What does this mean for my club?\" — get structured football intelligence.")}</p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuestion()}
              placeholder={tr("e.g. Should Barcelona sign a new striker this summer?")}
              style={{
                flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px', color: 'var(--text)', outline: 'none', fontSize: 14,
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={() => handleQuestion()} disabled={loading || !question.trim()}
              className="btn btn-primary" style={{ flexShrink: 0, opacity: (!question.trim() || loading) ? .5 : 1 }}>
              {tr(loading ? '...' : 'Analyse →')}
            </button>
          </div>

          {/* Quick question chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_QUESTIONS.map(({ q }) => (
              <button key={q} onClick={() => { setQuestion(tr(q)); handleQuestion(tr(q)); }}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all .2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >{tr(q)}</button>
            ))}
          </div>

          {loading && <AIThinking />}
          <ResultCard text={result} title={tr("AI Football Intelligence")} />
        </div>

        {/* ── SECTION 2: Transfer Analyser ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '.02em', marginBottom: 6 }}>{tr("TRANSFER ")}<span style={{ color: 'var(--accent)' }}>{tr("ANALYSER")}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>{tr("Enter any transfer — real or hypothetical — and get a full tactical breakdown.")}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Player Name', val: transferPlayer, set: setTransferPlayer, placeholder: tr('Example: {0}',{0:'Pedri'}) },
              { label: 'From Club', val: transferFrom, set: setTransferFrom, placeholder: tr('Example: {0}',{0:'FC Barcelona'}) },
              { label: 'To Club', val: transferTo, set: setTransferTo, placeholder: tr('Example: {0}',{0:'Man City'}) },
              { label: 'Transfer Fee', val: transferFee, set: setTransferFee, placeholder: tr('Example: {0}',{0:'€90M'}) },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{tr(label)}</label>
                <input value={val} onChange={e => set(e.target.value)} placeholder={tr(placeholder)}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', outline: 'none', fontSize: 13, transition: 'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}
          </div>

          {/* Example buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center' }}>{tr("Try:")}</span>
            {TRANSFER_EXAMPLES.map(ex => (
              <button key={ex.player} onClick={() => { setTransferPlayer(ex.player); setTransferFrom(ex.from); setTransferTo(ex.to); setTransferFee(ex.fee); }}
                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {tr(ex.player)} → {tr(ex.to)}
              </button>
            ))}
          </div>

          <button onClick={handleTransfer}
            disabled={transferLoading || !transferPlayer || !transferFrom || !transferTo}
            className="btn btn-primary"
            style={{ opacity: (transferLoading || !transferPlayer || !transferFrom || !transferTo) ? .5 : 1 }}>
            {tr(transferLoading ? 'Analysing...' : '⚡ Analyse Transfer')}
          </button>

          {transferLoading && <AIThinking />}
          <ResultCard text={transferResult} title={tr("Transfer Analysis")} color="var(--blue)" />
        </div>

        {/* ── SECTION 3: What this means for your club ── */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '.02em', marginBottom: 6 }}>{tr("CLUB ")}<span style={{ color: 'var(--accent)' }}>{tr("INTELLIGENCE")}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{tr("Pick a club, ask a specific question — get tailored insight.")}</p>
          <ClubIntelWidget />
        </div>
      </div>
    </div>
  );
}

function ClubIntelWidget() {
  const { t: tr, locale } = useI18n();

  const {teams} = useCatalog();
  const [selectedId,setSelectedId]=useState(teams[0]?.id);
  const selectedTeam=teams.find(t=>t.id===selectedId)||teams[0];
  const setSelectedTeam=t=>setSelectedId(t.id);
  const [customQ, setCustomQ] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const TEAM_QUESTIONS = [
    'What are their main weaknesses this season?',
    'Should they buy or build in the next window?',
    'Can they win the league this year?',
    'What position do they need to strengthen most?',
  ];

  async function ask(q) {
    setLoading(true);
    setResult('');
    try {
      const text = await callClaude(
        `You are a football club analyst. Give sharp, data-informed answers about football clubs.
         Keep it under 100 words. Be opinionated and direct. Plain text only.`,
        `About ${selectedTeam.name} (${selectedTeam.league}): ${q}`
      );
      setResult(text);
      addXP('use_ai');
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  }

  if(!selectedTeam)return <p>{tr("Добавьте клуб в каталог.")}</p>;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
      {/* Club selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {teams.map(t => (
          <button key={t.id} onClick={() => { setSelectedTeam(t); setResult(''); }}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13,
              background: selectedTeam.id === t.id ? `${t.color}22` : 'var(--bg3)',
              border: `1px solid ${selectedTeam.id === t.id ? t.color + '55' : 'var(--border)'}`,
              color: selectedTeam.id === t.id ? t.color : 'var(--text-muted)',
              cursor: 'pointer', fontWeight: selectedTeam.id === t.id ? 600 : 400, transition: 'all .2s',
            }}>{t.shortName}</button>
        ))}
      </div>

      {/* Club info line */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${selectedTeam.color}22`, border: `1px solid ${selectedTeam.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', color: selectedTeam.color, fontSize: 13 }}>{tr(selectedTeam.shortName)}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{tr(selectedTeam.name)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{tr(selectedTeam.league)}{tr(" · Manager: ")}{tr(selectedTeam.manager)}</div>
        </div>
      </div>

      {/* Preset questions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {TEAM_QUESTIONS.map(q => (
          <button key={q} onClick={() => ask(q)}
            style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = selectedTeam.color; e.currentTarget.style.color = selectedTeam.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >{tr(q)}</button>
        ))}
      </div>

      {/* Custom question */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={customQ} onChange={e => setCustomQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && customQ.trim() && ask(customQ)}
          placeholder={tr("Ask your own question...")}
          style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', outline: 'none', fontSize: 13, transition: 'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={() => customQ.trim() && ask(customQ)} disabled={loading || !customQ.trim()}
          className="btn btn-primary" style={{ flexShrink: 0, fontSize: 13, opacity: (!customQ.trim() || loading) ? .5 : 1 }}>{tr("Ask")}</button>
      </div>

      {loading && <AIThinking />}
      {result && (
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10, fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>
          {tr(result)}
        </div>
      )}
    </div>
  );
}
