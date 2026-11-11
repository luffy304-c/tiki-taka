import { useI18n } from '../lib/i18n';
// pages/live-search.js
//
// Страница поиска игроков через реальный RapidAPI
// Путь: /live-search

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Позиции → цвета
const posColors = {
  'Goalkeeper': { bg: 'rgba(168,85,247,.15)', text: '#a855f7', border: 'rgba(168,85,247,.3)' },
  'Defender':   { bg: 'rgba(59,130,246,.15)',  text: '#3b82f6', border: 'rgba(59,130,246,.3)' },
  'Midfielder': { bg: 'rgba(0,230,118,.15)',   text: '#00e676', border: 'rgba(0,230,118,.3)' },
  'Attacker':   { bg: 'rgba(255,61,87,.15)',   text: '#ff3d57', border: 'rgba(255,61,87,.3)' },
  'Forward':    { bg: 'rgba(255,165,0,.15)',   text: '#ffa500', border: 'rgba(255,165,0,.3)' },
};

function getPositionStyle(pos) {
  if (!pos || pos === '—') return { bg: 'rgba(255,255,255,.05)', text: '#888', border: 'rgba(255,255,255,.1)' };
  for (const [key, val] of Object.entries(posColors)) {
    if (pos.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { bg: 'rgba(255,214,0,.1)', text: '#ffd600', border: 'rgba(255,214,0,.2)' };
}

// Компонент карточки игрока
function PlayerCard({ player }) {
  const { t: tr, locale } = useI18n();

  const [imgError, setImgError] = useState(false);
  const posStyle = getPositionStyle(player.position);
  const hue = (player.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      transition: 'all .2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'var(--border-light)';
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.5)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'none';
    }}>

      {/* Фото или аватар */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '14px', flexShrink: 0,
          overflow: 'hidden', position: 'relative',
          background: `hsl(${hue},40%,18%)`,
          border: `2px solid hsl(${hue},50%,32%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {player.photo && !imgError ? (
            <img
              src={player.photo}
              alt={player.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              color: `hsl(${hue},70%,70%)`,
            }}>
              {tr((player.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase())}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            letterSpacing: '.02em',
            lineHeight: 1.1,
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{player.name}</h3>

          {/* Позиция */}
          {player.position && player.position !== '—' && (
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              background: posStyle.bg,
              color: posStyle.text,
              border: `1px solid ${posStyle.border}`,
            }}>{tr(player.position)}</span>
          )}
        </div>
      </div>

      {/* Инфо */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border)',
      }}>
        {[
          { label: 'Клуб',        value: player.team },
          { label: 'Гражданство', value: player.nationality },
          { label: 'Возраст',     value: player.age !== '—' ? `${player.age} лет` : '—' },
          { label: 'Рост',        value: player.height },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '2px' }}>
              {tr(label)}
            </div>
            <div style={{
              fontSize: '13px',
              color: value && value !== '—' ? 'var(--text)' : 'var(--text-dim)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {tr(value || '—')}
            </div>
          </div>
        ))}
      </div>

      {/* Лого команды */}
      {player.teamLogo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <img src={player.teamLogo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} onError={e => e.target.style.display='none'}/>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{player.team}</span>
        </div>
      )}
    </div>
  );
}

// Скелетон — показывается пока грузятся данные
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      animation: 'pulse 1.5s infinite',
    }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '14px', background: 'var(--border)', flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <div style={{ height: 18, background: 'var(--border)', borderRadius: 6, marginBottom: 8, width: '70%' }}/>
          <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '40%' }}/>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div style={{ height: 10, background: 'var(--border)', borderRadius: 4, marginBottom: 4, width: '60%' }}/>
            <div style={{ height: 13, background: 'var(--border)', borderRadius: 4, width: '80%' }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Главный компонент страницы ──
export default function LiveSearchPage() {
  const { t: tr, locale } = useI18n();

  const [query,   setQuery]   = useState('');        // текст в поиске
  const [players, setPlayers] = useState([]);        // найденные игроки
  const [loading, setLoading] = useState(false);     // идёт ли загрузка
  const [error,   setError]   = useState(null);      // текст ошибки
  const [searched, setSearched] = useState(false);   // делали ли поиск
  const [rawData,  setRawData]  = useState(null);    // сырые данные API (для отладки)
  const timerRef = useRef(null);                     // таймер для debounce

  // DEBOUNCE — ждём 600мс после последнего нажатия клавиши
  // чтобы не делать запрос после каждой буквы
  useEffect(() => {
    if (query.trim().length < 2) {
      setPlayers([]);
      setSearched(false);
      setError(null);
      return;
    }

    // Очищаем предыдущий таймер
    clearTimeout(timerRef.current);

    // Ставим новый таймер — запрос через 600мс
    timerRef.current = setTimeout(() => {
      fetchPlayers(query.trim());
    }, 600);

    // Очищаем таймер при размонтировании компонента
    return () => clearTimeout(timerRef.current);
  }, [query]); // запускается каждый раз когда меняется query

  // Функция запроса к нашему бэкенду
  async function fetchPlayers(searchQuery) {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Запрос идёт на НАШ бэкенд /api/football-search
      // НЕ напрямую на RapidAPI — ключ остаётся на сервере
      const res = await fetch(`/api/football-search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка запроса');
        setPlayers([]);
        return;
      }

      setPlayers(data.players || []);
      setRawData(data); // сохраняем для отладки
    } catch (err) {
      setError('Ошибка запроса');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  // Обработка ввода в поле поиска
  function handleSearch(e) {
    setQuery(e.target.value);
  }

  // Мгновенный поиск при нажатии Enter
  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      clearTimeout(timerRef.current);
      fetchPlayers(query.trim());
    }
  }

  return (
    <div><p className="data-notice">{tr("Внешний поиск игроков — не трансляция матчей. Требуются настройка RapidAPI и вход администратора.")}</p>
      <div className="container">

        {/* Заголовок */}
        <div className="page-header">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="tag tag-green">{tr("🔴 Live API")}</span>
            <span className="tag tag-blue">{tr("⚡ RapidAPI")}</span>
          </div>
          <h1 className="page-title"><span>{tr("Player search")}</span></h1>
          <p className="page-subtitle">{tr("Поиск по реальной базе данных — миллионы игроков со всего мира")}</p>
        </div>

        {/* Поле поиска */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            {/* Иконка поиска */}
            <span style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px', pointerEvents: 'none',
            }}>🔍</span>

            <input
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder={tr("Введи имя игрока... (Messi, Haaland, Mbappe)")}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              style={{
                width: '100%',
                background: 'var(--card)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 50px 14px 48px',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color .2s, box-shadow .2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,230,118,.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Спиннер загрузки внутри поля */}
            {loading && (
              <span style={{
                position: 'absolute', right: '16px', top: '50%',
                transform: 'translateY(-50%)',
                width: '20px', height: '20px',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'block',
              }}/>
            )}

            {/* Очистить */}
            {query && !loading && (
              <button
                onClick={() => { setQuery(''); setPlayers([]); setSearched(false); }}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
              >✕</button>
            )}
          </div>

          {/* Подсказка */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{tr("Попробуй:")}</span>
            {['Messi', 'Haaland', 'Mbappe', 'Ronaldo', 'Neymar', 'Bellingham'].map(name => (
              <button
                key={name}
                onClick={() => setQuery(name)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >{tr(name)}</button>
            ))}
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div style={{
            background: 'rgba(255,61,87,.08)',
            border: '1px solid rgba(255,61,87,.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ color: 'var(--red)', fontWeight: 600, marginBottom: '4px' }}>{tr("Ошибка API")}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tr(error)}</p>
              {error.includes('API ключ') && (
                <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '6px' }}>{tr("Добавь ")}<code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: '4px' }}>{tr("RAPIDAPI_KEY=твой_ключ")}</code>{tr(" в файл ")}<code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: '4px' }}>{tr(".env.local")}</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Статус поиска */}
        {searched && !loading && !error && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {players.length > 0
                ? tr('search.summary',{count:players.length.toLocaleString(locale),query})
                : tr('No results for “{0}”',{0:query})}

            </p>
          </div>
        )}

        {/* Скелетоны при загрузке */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Сетка игроков */}
        {!loading && players.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '60px',
          }}>
            {players.map((player, i) => (
              <PlayerCard key={player.id || i} player={player} />
            ))}
          </div>
        )}

        {/* Пустой экран — ничего не искали */}
        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚽</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '.02em', marginBottom: '8px' }}>{tr("НАЙДИ ЛЮБОГО ")}<span style={{ color: 'var(--accent)' }}>{tr("ИГРОКА")}</span>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-dim)', maxWidth: '400px', margin: '0 auto' }}>{tr("Введи имя футболиста — поиск идёт по реальной базе данных через RapidAPI")}</p>
          </div>
        )}

        {/* Пустой результат */}
        {searched && !loading && players.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>{tr("Игроки не найдены")}</p>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{tr("Попробуй написать имя на английском: «Messi» вместо «Месси»")}</p>
          </div>
        )}

        {/* DEBUG — сырые данные API (убери в продакшене) */}
        {rawData && players.length === 0 && searched && !loading && (
          <details style={{ marginBottom: '40px' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{tr("🔧 Сырые данные от API (для отладки)")}</summary>
            <pre style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '16px', overflow: 'auto',
              fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px',
              maxHeight: '300px',
            }}>
              {tr(JSON.stringify(rawData, null, 2))}
            </pre>
          </details>
        )}
      </div>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg);    } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
      `}</style>
    </div>
  );
}
