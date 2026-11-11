import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_CATEGORIES } from '../lib/quiz/questions.mjs';
import { generateDuelQuiz, parseValue, parseHeight, shuffle } from '../lib/quiz/duel.mjs';
import { players, teams } from '../lib/data.js';

// Детерминированный генератор случайных чисел — тесты всегда одинаковые
function seeded(seed = 42) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

test('банк вопросов: 4 категории, у каждого вопроса 4 варианта и верный индекс', () => {
  assert.deepEqual(QUIZ_CATEGORIES.map(c => c.id), ['ucl', 'wc', 'euro', 'copa']);
  for (const cat of QUIZ_CATEGORIES) {
    assert.ok(cat.questions.length >= 10, cat.id);
    for (const q of cat.questions) {
      assert.equal(q.options.length, 4, q.q);
      assert.equal(new Set(q.options).size, 4, `повтор варианта: ${q.q}`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.q);
      assert.ok(q.fact.length > 0, q.q);
    }
  }
});

test('парсинг стоимости и роста', () => {
  assert.equal(parseValue({ value: '€200M' }), 200);
  assert.equal(parseValue({ value: '€1.5B' }), 1500);
  assert.equal(parseValue({ value: '€800K' }), 0.8);
  assert.equal(parseValue({ value: 'N/A' }), null);
  assert.equal(parseValue({ market_value_num: 75, value: '€1M' }), 75);
  assert.equal(parseHeight({ height: '180 cm' }), 180);
  assert.equal(parseHeight({}), null);
});

test('перемешивание не теряет и не дублирует элементы', () => {
  const out = shuffle([1, 2, 3, 4, 5], seeded());
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
});

test('дуэль Ямаль vs Педри: вопросы корректны и ответ однозначен', () => {
  const withTeam = players.map(p => ({ ...p, team: teams.find(t => t.id === p.teamId)?.name || p.team }));
  const a = withTeam.find(p => p.id === 'yamal');
  const b = withTeam.find(p => p.id === 'pedri');
  const quiz = generateDuelQuiz(a, b, { players: withTeam, teams }, { count: 20, rng: seeded() });
  assert.ok(quiz.length >= 8, `вопросов: ${quiz.length}`);
  for (const q of quiz) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.q);
    assert.equal(new Set(q.options).size, q.options.length, `повтор: ${q.q}`);
  }
  // Проверяем конкретные ответы
  const goals = quiz.find(q => q.q === 'У кого больше голов в сезоне?');
  assert.equal(goals.options[goals.answer], 'Lamine Yamal'); // 22 > 11
  const younger = quiz.find(q => q.q === 'Кто моложе?');
  assert.equal(younger.options[younger.answer], 'Lamine Yamal'); // 18 < 23
});

test('равные значения и отсутствующие данные не превращаются в вопросы', () => {
  const a = { id: 'a', name: 'A', goals: 5, assists: null, age: 20 };
  const b = { id: 'b', name: 'B', goals: 5, assists: 3, age: 20 };
  const quiz = generateDuelQuiz(a, b, {}, { count: 20, rng: seeded() });
  assert.equal(quiz.find(q => q.q.includes('голов в сезоне')), undefined);
  assert.equal(quiz.find(q => q.q.includes('передач')), undefined);
  assert.equal(quiz.find(q => q.q === 'Кто моложе?'), undefined);
});

test('один и тот же игрок дважды — пустой тест', () => {
  assert.deepEqual(generateDuelQuiz(players[0], players[0]), []);
});
