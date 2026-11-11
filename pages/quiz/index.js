// pages/quiz/index.js
// Раздел «Тесты»: 4 тематических теста + «Дуэль» двух игроков.
import { useState, useMemo } from 'react';
import { useI18n } from '../../lib/i18n';
import { useCatalog } from '../../lib/catalog';
import { Shell } from '../../components/CatalogUI';
import { QUIZ_CATEGORIES, getCategory } from '../../lib/quiz/questions.mjs';
import { generateDuelQuiz, shuffle } from '../../lib/quiz/duel.mjs';
import { addXP, awardBadge } from '../../lib/gamification';

const QUESTIONS_PER_QUIZ = 10;

// Перемешиваем варианты ответа и пересчитываем индекс правильного,
// чтобы правильный ответ не стоял всегда на одном месте.
function prepare(questions) {
  return shuffle(questions).slice(0, QUESTIONS_PER_QUIZ).map(q => {
    const correct = q.options[q.answer];
    const options = shuffle(q.options);
    return { ...q, options, answer: options.indexOf(correct) };
  });
}

// ─── Прохождение теста ───
function QuizRunner({ title, questions, onExit, onRestart }) {
  const { t: tr } = useI18n();
  const [index, setIndex] = useState(0);      // номер текущего вопроса
  const [chosen, setChosen] = useState(null); // какой вариант выбран (null — ещё не ответил)
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null); // итог после последнего вопроса

  const q = questions[index];

  function choose(i) {
    if (chosen !== null) return; // второй раз ответить нельзя
    setChosen(i);
    if (i === q.answer) setScore(s => s + 1);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setChosen(null);
      return;
    }
    // Последний вопрос — считаем итог и начисляем XP
    const xp = addXP('quiz_complete');
    const perfect = score === questions.length;
    const badge = perfect ? awardBadge('quiz_master') : null;
    setResult({ xp: xp.gained, badge });
  }

  if (result) {
    const percent = Math.round((score / questions.length) * 100);
    const verdict = percent === 100 ? 'Идеально! Ты настоящий эксперт.'
      : percent >= 70 ? 'Отличный результат!'
      : percent >= 40 ? 'Неплохо, но есть куда расти.'
      : 'Попробуй ещё раз — получится лучше.';
    return (
      <div className="panel quiz-result">
        <div className="muted">{tr(title)}</div>
        <div className="quiz-score">{score} / {questions.length}</div>
        <p>{tr(verdict)}</p>
        <p className="muted">+{result.xp} XP{result.badge ? ` · ${tr('Новый значок')}: ${result.badge.icon} ${result.badge.name}` : ''}</p>
        <div className="controls">
          <button onClick={onRestart}>{tr('Пройти ещё раз')}</button>
          <button onClick={onExit}>{tr('Все тесты')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="quiz-top">
        <span className="muted">{tr(title)}</span>
        <span className="muted">{tr('Вопрос')} {index + 1} / {questions.length} · {tr('Счёт')}: {score}</span>
      </div>
      <div className="xp-bar-wrap"><div className="xp-bar-fill" style={{ width: `${(index / questions.length) * 100}%` }} /></div>

      <h2 className="quiz-question">{q.q}</h2>

      <div className="quiz-options">
        {q.options.map((opt, i) => {
          // Подсвечиваем после ответа: правильный — зелёным, неверно выбранный — красным
          let state = '';
          if (chosen !== null && i === q.answer) state = 'correct';
          else if (chosen === i) state = 'wrong';
          return (
            <button key={opt} className={`quiz-option ${state}`} onClick={() => choose(i)} disabled={chosen !== null}>
              {opt}
            </button>
          );
        })}
      </div>

      {chosen !== null && (
        <div className={`insight-box ${chosen === q.answer ? '' : 'wrong'}`} style={{ marginTop: 16 }}>
          <div className="insight-label">{chosen === q.answer ? tr('Верно!') : tr('Неверно')}</div>
          <p>{q.fact}</p>
        </div>
      )}

      {chosen !== null && (
        <button style={{ marginTop: 16 }} onClick={next}>
          {index + 1 < questions.length ? tr('Следующий вопрос') : tr('Посмотреть результат')}
        </button>
      )}
    </div>
  );
}

// ─── Выбор двух игроков для дуэли ───
function DuelSetup({ onStart }) {
  const { t: tr } = useI18n();
  const { players, teams } = useCatalog();
  const sorted = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players]);
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [error, setError] = useState('');

  function start() {
    const p1 = players.find(p => p.id === id1);
    const p2 = players.find(p => p.id === id2);
    if (!p1 || !p2) return setError('Выберите двух игроков.');
    if (p1.id === p2.id) return setError('Выберите двух разных игроков.');
    // build — функция, которая каждый раз собирает новый набор вопросов
    const build = () => generateDuelQuiz(p1, p2, { players, teams }, { count: QUESTIONS_PER_QUIZ });
    if (build().length < 3) return setError('Недостаточно данных об этих игроках для теста.');
    onStart(`${p1.name} vs ${p2.name}`, build);
  }

  const select = (value, set, label) => (
    <label>{tr(label)}
      <select value={value} onChange={e => { set(e.target.value); setError(''); }}>
        <option value="">{tr('— выберите —')}</option>
        {sorted.map(p => <option key={p.id} value={p.id}>{p.name} · {p.team}</option>)}
      </select>
    </label>
  );

  return (
    <div className="panel">
      <h2>⚔️ {tr('Дуэль игроков')}</h2>
      <p className="muted">{tr('Выберите двух футболистов — вопросы составятся по их данным из каталога TikiTaka.')}</p>
      <div className="controls">
        {select(id1, setId1, 'Игрок 1')}
        <span className="quiz-vs">VS</span>
        {select(id2, setId2, 'Игрок 2')}
        <button onClick={start} disabled={!id1 || !id2}>{tr('Начать дуэль')}</button>
      </div>
      {error && <p role="alert" style={{ color: 'var(--red)' }}>{tr(error)}</p>}
    </div>
  );
}

// ─── Страница ───
export default function QuizPage() {
  const { t: tr } = useI18n();
  // mode: null — список тестов, 'duel' — выбор игроков, или id категории
  const [mode, setMode] = useState(null);
  const [active, setActive] = useState(null); // { title, questions, build }
  const [runKey, setRunKey] = useState(0);    // меняем, чтобы перезапустить тест с нуля

  function startCategory(id) {
    const cat = getCategory(id);
    setMode(id);
    const build = () => prepare(cat.questions);
    setActive({ title: cat.title, questions: build(), build });
    setRunKey(k => k + 1);
  }

  function startDuel(title, build) {
    setActive({ title, questions: build(), build });
    setRunKey(k => k + 1);
  }

  // Новый набор вопросов (другой порядок) и сброс прогресса
  function restart() {
    setActive({ ...active, questions: active.build() });
    setRunKey(k => k + 1);
  }

  function exit() { setMode(null); setActive(null); }

  return (
    <Shell title="Тесты" subtitle="Проверь свои знания футбола и заработай XP.">
      {mode && <button onClick={exit}>← {tr('Все тесты')}</button>}

      {!mode && (
        <div className="cards-grid">
          {QUIZ_CATEGORIES.map(c => (
            <button key={c.id} className="panel quiz-card" style={{ border: '1px solid var(--border)', borderTop: `3px solid ${c.color}` }} onClick={() => startCategory(c.id)}>
              <span className="quiz-icon">{c.icon}</span>
              <h2>{tr(c.title)}</h2>
              <span className="muted">{QUESTIONS_PER_QUIZ} {tr('вопросов')}</span>
            </button>
          ))}
          <button className="panel quiz-card" style={{ border: '1px solid var(--border)', borderTop: '3px solid var(--red)' }} onClick={() => setMode('duel')}>
            <span className="quiz-icon">⚔️</span>
            <h2>{tr('Дуэль игроков')}</h2>
            <span className="muted">{tr('Тест по двум выбранным игрокам')}</span>
          </button>
        </div>
      )}

      {mode === 'duel' && !active && <DuelSetup onStart={startDuel} />}

      {active && (
        <QuizRunner key={runKey} title={active.title} questions={active.questions} onExit={exit} onRestart={restart} />
      )}
    </Shell>
  );
}
