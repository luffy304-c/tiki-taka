import { useI18n } from '../../lib/i18n';
// pages/map/index.js
// Feature 3: Football Around You
// Interactive map with football pitches, "find a game", team builder

import { useState } from 'react';

const MOCK_PITCHES = [
  { id: 1, name: 'Gorky Park Pitch A', type: 'Artificial', size: '11v11', price: 8000, rating: 4.7, available: true,  lat: 43.262, lng: 76.954, players: 14, distance: '1.2 km' },
  { id: 2, name: 'Medeu Complex',       type: 'Natural',    size: '11v11', price: 12000, rating: 4.9, available: false, lat: 43.175, lng: 77.013, players: 0,  distance: '8.5 km' },
  { id: 3, name: 'Almaty Sports Hub',   type: 'Artificial', size: '5v5',  price: 4000,  rating: 4.3, available: true,  lat: 43.250, lng: 76.945, players: 7,  distance: '2.1 km' },
  { id: 4, name: 'City Football Park',  type: 'Artificial', size: '7v7',  price: 6000,  rating: 4.5, available: true,  lat: 43.268, lng: 76.935, players: 11, distance: '0.8 km' },
  { id: 5, name: 'Olympic Training Base', type: 'Natural', size: '11v11', price: 15000, rating: 4.8, available: true, lat: 43.241, lng: 76.959, players: 8,  distance: '3.4 km' },
  { id: 6, name: 'Rahat Mini Pitch',    type: 'Artificial', size: '5v5',  price: 3000,  rating: 4.1, available: true,  lat: 43.257, lng: 76.950, players: 4,  distance: '0.5 km' },
];

const MOCK_PLAYERS_NEARBY = [
  { name: 'Arman K.', pos: 'Striker',    rating: 7.2, age: 22, available: true,  dist: '0.3 km' },
  { name: 'Dias M.',  pos: 'Midfielder', rating: 6.8, age: 26, available: true,  dist: '1.1 km' },
  { name: 'Ruslan T.', pos: 'Defender',  rating: 7.5, age: 24, available: false, dist: '1.8 km' },
  { name: 'Berik S.', pos: 'Goalkeeper', rating: 7.9, age: 28, available: true,  dist: '2.2 km' },
  { name: 'Nurlan A.', pos: 'Winger',    rating: 6.5, age: 20, available: true,  dist: '2.5 km' },
];

const POSITIONS_NEEDED = ['GK', 'CB1', 'CB2', 'LB', 'RB', 'CM1', 'CM2', 'CAM', 'LW', 'RW', 'ST'];

export default function MapPage() {
  const { t: tr, locale } = useI18n();

  const [activeTab, setActiveTab] = useState('pitches');
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [teamPositions, setTeamPositions] = useState({});
  const [filter, setFilter] = useState('all');

  function togglePosition(pos) {
    setTeamPositions(prev => {
      const next = { ...prev };
      if (next[pos]) delete next[pos];
      else next[pos] = MOCK_PLAYERS_NEARBY.find(p => !Object.values(next).includes(p.name) && p.available)?.name || 'Open slot';
      return next;
    });
  }

  const filteredPitches = MOCK_PITCHES.filter(p =>
    filter === 'all' || (filter === 'available' && p.available) || p.size.includes(filter)
  );

  return (
    <div>
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className="tag tag-blue">{tr("📍 Демонстрация")}</span>
            <span className="tag tag-green">{tr("🤝 Social")}</span>
          </div>
          <h1 className="page-title">{tr("FOOTBALL ")}<span>{tr("NEAR YOU")}</span></h1>
          <p className="page-subtitle">{tr("Демонстрационные площадки и участники. Реального поиска и бронирования пока нет.")}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'pitches', label: '🏟️ Find Pitches' },
            { id: 'players', label: '👥 Players Nearby' },
            { id: 'team', label: '⚽ Build My Team' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '10px 20px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === id ? 'var(--accent)' : 'transparent'}`,
              color: activeTab === id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', marginBottom: -1,
            }}>{tr(label)}</button>
          ))}
        </div>

        {/* ── TAB: PITCHES ── */}
        {activeTab === 'pitches' && (
          <div>
            {/* Fake map area */}
            <div style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              height: 280, marginBottom: 24, position: 'relative', overflow: 'hidden',
            }}>
              {/* Map grid lines */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .15 }}>
                {[...Array(12)].map((_, i) => <line key={`h${i}`} x1="0" y1={i*24} x2="100%" y2={i*24} stroke="#00e676" strokeWidth=".5"/>)}
                {[...Array(24)].map((_, i) => <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="100%" stroke="#00e676" strokeWidth=".5"/>)}
              </svg>

              {/* Pitch markers */}
              {MOCK_PITCHES.map((pitch, i) => (
                <button key={pitch.id} onClick={() => setSelectedPitch(pitch === selectedPitch ? null : pitch)} style={{
                  position: 'absolute',
                  left: `${15 + (i % 3) * 28}%`,
                  top: `${20 + Math.floor(i/3) * 42}%`,
                  width: 36, height: 36, borderRadius: '50%',
                  background: pitch.available ? 'rgba(0,230,118,.2)' : 'rgba(255,61,87,.2)',
                  border: `2px solid ${pitch.available ? 'var(--accent)' : 'var(--red)'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'all .2s', zIndex: 2,
                  transform: selectedPitch?.id === pitch.id ? 'scale(1.3)' : 'scale(1)',
                }}>🏟️</button>
              ))}

              {/* "You are here" marker */}
              <div style={{ position: 'absolute', left: '48%', top: '45%', width: 14, height: 14, background: 'var(--blue)', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 0 0 4px rgba(59,130,246,.3)', zIndex: 3 }}/>

              {/* Map label */}
              <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'rgba(10,10,15,.7)', padding: '4px 10px', borderRadius: 6 }}>{tr("📍 Almaty, Kazakhstan · 6 pitches found")}</div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tr("🟢 Available  🔴 Booked  🔵 You")}</div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all','available','5v5','7v7','11v11'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  background: filter === f ? 'var(--accent-dim)' : 'var(--bg3)',
                  border: `1px solid ${filter === f ? 'rgba(0,230,118,.3)' : 'var(--border)'}`,
                  color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', transition: 'all .2s',
                }}>{tr(f === 'all' ? 'All Pitches' : f === 'available' ? '✓ Available Now' : f)}</button>
              ))}
            </div>

            {/* Pitch list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 60 }}>
              {filteredPitches.map(pitch => (
                <div key={pitch.id} onClick={() => setSelectedPitch(pitch === selectedPitch ? null : pitch)}
                  style={{
                    background: 'var(--card)', border: `1px solid ${selectedPitch?.id === pitch.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '16px 20px', cursor: 'pointer', transition: 'all .2s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{pitch.name}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
                          background: pitch.available ? 'rgba(0,230,118,.1)' : 'rgba(255,61,87,.1)',
                          color: pitch.available ? 'var(--accent)' : 'var(--red)',
                          border: `1px solid ${pitch.available ? 'rgba(0,230,118,.2)' : 'rgba(255,61,87,.2)'}`,
                        }}>{tr(pitch.available ? 'AVAILABLE' : 'BOOKED')}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span>📏 {tr(pitch.size)}</span>
                        <span>🌱 {tr(pitch.type)}</span>
                        <span>📍 {tr(pitch.distance)}</span>
                        <span>⭐ {tr(pitch.rating)}</span>
                        {pitch.players > 0 && <span>👥 {tr(pitch.players)}{tr(" players waiting")}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>{tr(pitch.price.toLocaleString(locale))}{tr(" ₸/h")}</div>
                      {pitch.available && (
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px', marginTop: 8 }}
                          onClick={e => { e.stopPropagation(); alert(tr("Demo only: booking is not available for {name}.",{name:pitch.name})); }}>{tr("Book Now")}</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: PLAYERS NEARBY ── */}
        {activeTab === 'players' && (
          <div style={{ marginBottom: 60 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>{tr("Real players near you looking for a game. Tap to invite.")}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_PLAYERS_NEARBY.map(p => (
                <div key={p.name} style={{
                  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-muted)' }}>
                      {tr(p.name.split(' ').map(n => n[0]).join(''))}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tr(p.pos)}{tr(" · Age ")}{tr(p.age)} · {tr(p.dist)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>{tr(p.rating)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tr("Rating")}</div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      background: p.available ? 'rgba(0,230,118,.1)' : 'rgba(255,255,255,.04)',
                      color: p.available ? 'var(--accent)' : 'var(--text-dim)',
                      border: `1px solid ${p.available ? 'rgba(0,230,118,.2)' : 'var(--border)'}`,
                    }}>{tr(p.available ? 'Available' : 'Busy')}</span>
                    {p.available && (
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
                        onClick={() => alert(tr("Demo invitation for {name}. No message was sent.",{name:p.name}))}>{tr("Invite")}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: BUILD TEAM ── */}
        {activeTab === 'team' && (
          <div style={{ marginBottom: 60 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{tr("Click positions to fill your 11. The system finds available players nearby.")}</p>

            {/* Formation visualiser */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(0,100,40,.15) 0%, rgba(0,60,20,.08) 100%)',
              border: '1px solid rgba(0,200,80,.15)', borderRadius: 16,
              padding: '32px 24px', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px',
              position: 'relative',
            }}>
              {/* Pitch lines */}
              <div style={{ position: 'absolute', inset: '15px 20px', border: '1px solid rgba(0,230,118,.1)', borderRadius: 8, pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', left: '20%', right: '20%', top: '50%', transform: 'translateY(-50%)', height: 1, background: 'rgba(0,230,118,.08)', pointerEvents: 'none' }}/>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* ST */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PosSlot pos="ST" filled={teamPositions['ST']} onClick={() => togglePosition('ST')} />
                </div>
                {/* LW CAM RW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                  {['LW','CAM','RW'].map(p => <PosSlot key={p} pos={p} filled={teamPositions[p]} onClick={() => togglePosition(p)} />)}
                </div>
                {/* CM CM */}
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 30px' }}>
                  {['CM','CM2'].map(p => <PosSlot key={p} pos={p.replace('2','')} filled={teamPositions[p]} onClick={() => togglePosition(p)} />)}
                </div>
                {/* LB CB CB RB */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}>
                  {['LB','CB','CB2','RB'].map(p => <PosSlot key={p} pos={p.replace('2','')} filled={teamPositions[p]} onClick={() => togglePosition(p)} />)}
                </div>
                {/* GK */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PosSlot pos="GK" filled={teamPositions['GK']} onClick={() => togglePosition('GK')} />
                </div>
              </div>
            </div>

            {/* Team summary */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', maxWidth: 400, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '.02em' }}>{tr("MY TEAM")}</span>
                <span style={{ fontSize: 13, color: Object.keys(teamPositions).length === 11 ? 'var(--accent)' : 'var(--text-dim)' }}>
                  {tr(Object.keys(teamPositions).length)}{tr("/11 filled")}</span>
              </div>
              <div className="xp-bar-wrap" style={{ marginBottom: 16 }}>
                <div className="xp-bar-fill" style={{ width: `${(Object.keys(teamPositions).length / 11) * 100}%` }}/>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: Object.keys(teamPositions).length < 2 ? .5 : 1 }}
                onClick={() => alert(tr("Demo team selected on this page. No share link is created."))}
              >
                {tr(Object.keys(teamPositions).length === 11 ? '🚀 Ready to Play!' : `Fill ${11 - Object.keys(teamPositions).length} more spots`)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PosSlot({ pos, filled, onClick }) {
  const { t: tr, locale } = useI18n();

  return (
    <button onClick={onClick} style={{
      width: 52, height: 52, borderRadius: 10,
      background: filled ? 'rgba(0,230,118,.15)' : 'rgba(255,255,255,.04)',
      border: `1.5px solid ${filled ? 'rgba(0,230,118,.4)' : 'rgba(255,255,255,.1)'}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all .2s',
    }}>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: filled ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 600, lineHeight: 1 }}>{tr(pos)}</span>
      {filled && <span style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, maxWidth: 44, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr(filled.split(' ')[0])}</span>}
    </button>
  );
}
