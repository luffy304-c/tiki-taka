// lib/quiz/duel.mjs
// Генератор теста «Дуэль»: берёт двух игроков и сам придумывает вопросы
// по их данным из каталога. Вопрос попадает в тест, только если
// данные есть у обоих и ответ однозначный (например, голы не равны).

// ─── Вспомогательные функции ───

// Перемешивание массива (алгоритм Фишера–Йетса).
// rng можно подменить в тестах, чтобы результат был предсказуемым.
export function shuffle(array, rng = Math.random) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// "€200M" → 200, "€1.5B" → 1500, "€800K" → 0.8. Если не получилось — null.
export function parseValue(p) {
  if (Number.isFinite(p.market_value_num)) return p.market_value_num;
  const m = String(p.value ?? p.market_value ?? '').replace(',', '.').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = (m[2] || 'M').toUpperCase();
  return unit === 'B' ? n * 1000 : unit === 'K' ? n / 1000 : n;
}

// "180 cm" → 180
export function parseHeight(p) {
  const m = String(p.height ?? '').match(/(\d{3})/);
  return m ? Number(m[1]) : null;
}

const has = v => v !== null && v !== undefined && Number.isFinite(Number(v));

// Вопрос «кто из двоих больше/меньше?». Варианты — имена игроков.
function compare(a, b, get, text, { lower = false, fact }) {
  const va = get(a), vb = get(b);
  if (!has(va) || !has(vb) || Number(va) === Number(vb)) return null;
  const aWins = lower ? va < vb : va > vb;
  return {
    q: text,
    options: [a.name, b.name],
    answer: aWins ? 0 : 1,
    fact: fact(va, vb),
  };
}

// Вопрос с четырьмя вариантами: правильный + три «отвлекающих».
function pickOne(text, correct, pool, fact, rng) {
  const distractors = shuffle([...new Set(pool.filter(x => x && x !== correct))], rng).slice(0, 3);
  if (!correct || distractors.length < 3) return null;
  const options = shuffle([correct, ...distractors], rng);
  return { q: text, options, answer: options.indexOf(correct), fact };
}

// Числовые варианты рядом с правильным числом: 22 → [19, 22, 24, 27]
function numberOptions(correct, rng) {
  const set = new Set([correct]);
  const steps = shuffle([-5, -3, -2, -1, 1, 2, 3, 4, 6], rng);
  for (const s of steps) {
    if (set.size === 4) break;
    if (correct + s >= 0) set.add(correct + s);
  }
  return shuffle([...set], rng).map(String);
}

// ─── Главная функция ───
// p1, p2   — игроки из каталога
// catalog  — { players, teams } для отвлекающих вариантов
// count    — сколько вопросов вернуть
export function generateDuelQuiz(p1, p2, catalog = {}, { count = 8, rng = Math.random } = {}) {
  if (!p1 || !p2 || p1.id === p2.id) return [];
  const allPlayers = catalog.players || [];
  const allTeams = catalog.teams || [];
  const questions = [];

  // 1. Сравнения «кто больше»
  questions.push(
    compare(p1, p2, p => p.goals, 'У кого больше голов в сезоне?', {
      fact: (a, b) => `${p1.name}: ${a} · ${p2.name}: ${b}`,
    }),
    compare(p1, p2, p => p.assists, 'У кого больше голевых передач?', {
      fact: (a, b) => `${p1.name}: ${a} · ${p2.name}: ${b}`,
    }),
    compare(p1, p2, p => p.rating, 'У кого выше рейтинг TikiTaka?', {
      fact: (a, b) => `${p1.name}: ${a} · ${p2.name}: ${b}`,
    }),
    compare(p1, p2, parseValue, 'Кто стоит дороже на трансферном рынке?', {
      fact: (a, b) => `${p1.name}: €${a}M · ${p2.name}: €${b}M`,
    }),
    compare(p1, p2, p => p.age, 'Кто моложе?', {
      lower: true,
      fact: (a, b) => `${p1.name}: ${a} лет · ${p2.name}: ${b} лет`,
    }),
    compare(p1, p2, parseHeight, 'Кто выше ростом?', {
      fact: (a, b) => `${p1.name}: ${a} см · ${p2.name}: ${b} см`,
    }),
  );

  // 2. Вопросы про каждого из двух игроков
  const teamNames = allTeams.map(t => t.name);
  const nations = allPlayers.map(p => p.nationality);
  for (const p of [p1, p2]) {
    questions.push(
      pickOne(`За какой клуб играет ${p.name}?`, p.team, teamNames, `${p.name} — игрок клуба ${p.team}.`, rng),
      pickOne(`Какое гражданство у игрока ${p.name}?`, p.nationality, nations, `${p.name}: ${p.nationality}.`, rng),
    );
    if (Number.isInteger(p.number) && p.number > 0) {
      const options = numberOptions(p.number, rng);
      questions.push({
        q: `Под каким номером играет ${p.name}?`,
        options,
        answer: options.indexOf(String(p.number)),
        fact: `${p.name} выходит под номером ${p.number}.`,
      });
    }
  }

  // 3. Вопросы, которые имеют смысл, только если игроки различаются
  if (p1.foot && p2.foot && p1.foot !== p2.foot && [p1.foot, p2.foot].includes('Left')) {
    questions.push({
      q: 'Кто из них левша?',
      options: [p1.name, p2.name],
      answer: p1.foot === 'Left' ? 0 : 1,
      fact: `${p1.name}: ${p1.foot === 'Left' ? 'левая' : 'правая'} нога · ${p2.name}: ${p2.foot === 'Left' ? 'левая' : 'правая'} нога`,
    });
  }
  if (has(p1.goals) && has(p1.assists) && has(p2.goals) && has(p2.assists)) {
    const total = p1.goals + p1.assists + p2.goals + p2.assists;
    const options = numberOptions(total, rng);
    questions.push({
      q: `Сколько у них голов + ассистов на двоих?`,
      options,
      answer: options.indexOf(String(total)),
      fact: `${p1.name}: ${p1.goals}+${p1.assists} · ${p2.name}: ${p2.goals}+${p2.assists} = ${total}`,
    });
  }

  // Убираем пустые (null), перемешиваем и берём нужное количество
  return shuffle(questions.filter(Boolean), rng).slice(0, count);
}
