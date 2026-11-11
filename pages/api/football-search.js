import {requireAdmin} from '../../lib/server/auth';
// pages/api/football-search.js
//
// BACKEND маршрут — API ключ хранится здесь, на сервере
// Фронтенд никогда не видит ключ напрямую
//
// Как это работает:
// 1. Пользователь вводит имя на странице
// 2. Фронтенд делает запрос → /api/football-search?q=messi
// 3. Этот файл получает запрос, добавляет API ключ, идёт на RapidAPI
// 4. Возвращает данные фронтенду

export default async function handler(req, res) {
  if(process.env.ENABLE_FOOTBALL_SEARCH !== 'true')return res.status(503).json({error:'Внешняя функция отключена. Основной каталог работает без неё.'});
  if(!requireAdmin(req,res))return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Читаем параметр поиска из URL.
  // Поддерживаем оба варианта:
  //   /api/football-search?q=ronaldo      ← короткий вариант
  //   /api/football-search?search=ronaldo ← стандартный вариант
  // req.query — объект с ВСЕМИ параметрами после ? в URL
  const q = (req.query.q || req.query.search || '').trim();

  if (q.length < 2) {
    return res.status(400).json({ error: 'Нужно минимум 2 символа для поиска' });
  }

  // Проверяем что API ключ есть в переменных окружения
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'API ключ не найден. Добавь RAPIDAPI_KEY в .env.local'
    });
  }

  try {
    // Делаем запрос к RapidAPI — с сервера, не с браузера
    const response = await fetch(
      `https://free-api-live-football-data.p.rapidapi.com/football-players-search?search=${encodeURIComponent(q)}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(20000),
        headers: {
          'X-RapidAPI-Key':  apiKey,   // ← ключ берётся из .env.local
          'X-RapidAPI-Host': 'free-api-live-football-data.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Ошибка API: ${response.status}`,
        detail: errorText,
      });
    }

    const data = await response.json();

    // Нормализуем данные — приводим к удобному формату
    // У разных API разная структура, поэтому обрабатываем осторожно
    const players = normalizeResponse(data);

    return res.status(200).json({
      query: q,
      total: players.length,
      players,
    });

  } catch (error) {
    console.error('Server error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

// Функция нормализации — приводит ответ API к нашему формату
function normalizeResponse(data) {
  // API может вернуть разную структуру
  // Пробуем найти массив игроков
  let raw = [];

  if (Array.isArray(data)) {
    raw = data;
  } else if (data?.response && Array.isArray(data.response)) {
    raw = data.response;
  } else if (data?.players && Array.isArray(data.players)) {
    raw = data.players;
  } else if (data?.data && Array.isArray(data.data)) {
    raw = data.data;
  } else if (data?.results && Array.isArray(data.results)) {
    raw = data.results;
  }

  // Приводим каждого игрока к единому формату
  return raw.map(item => {
    const p = item?.player || item;
    const stats = item?.statistics?.[0] || {};

    return {
      id:          p?.id        || p?.player_id || Math.random(),
      name:        p?.name      || p?.player_name || p?.strPlayer || 'Неизвестно',
      photo:       p?.photo     || p?.strCutout  || p?.strThumb  || p?.image || null,
      nationality: p?.nationality || p?.strNationality || '—',
      age:         p?.age       || p?.intAge || '—',
      height:      p?.height    || p?.strHeight || '—',
      weight:      p?.weight    || p?.strWeight || '—',
      position:    stats?.games?.position || p?.position || p?.strPosition || '—',
      team:        stats?.team?.name      || p?.team     || p?.strTeam || '—',
      teamLogo:    stats?.team?.logo      || null,
    };
  });
}
