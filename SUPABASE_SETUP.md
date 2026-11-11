> Справочный файл прежней версии. Исправленное приложение использует локальный каталог; см. README.md.

# 🗄️ Подключение Supabase к TikiTaka

## Шаг 1 — Создай аккаунт Supabase

1. Иди на **[supabase.com](https://supabase.com)** → "Start your project" (бесплатно)
2. Войди через GitHub
3. Нажми **"New Project"**
4. Название: `tiki-taka`, регион: **EU West** (Frankfurt)
5. Придумай пароль к БД и сохрани его
6. Нажми **"Create new project"** — ждёшь ~2 минуты

---

## Шаг 2 — Создай таблицы

1. В левом меню: **SQL Editor** → **New Query**
2. Скопируй весь файл `supabase-schema.sql` из папки проекта
3. Вставь в редактор → **Run** (Ctrl+Enter)
4. Должно написать "Success"

---

## Шаг 3 — Создай Storage Bucket для фотографий

1. В левом меню: **Storage** → **New bucket**
2. Название: `tiki-taka-media`
3. Поставь галку **Public bucket** ✅
4. Нажми **"Create bucket"**

Потом настрой политики:
1. Нажми на bucket → **Policies** → **New policy**
2. Выбери **"For full customization"**
3. Policy name: `Public read`
4. Allowed operation: **SELECT**
5. Target roles: `anon`, `authenticated`
6. Policy definition: `true`
7. Нажми **"Review"** → **"Save policy"**

---

## Шаг 4 — Получи API ключи

1. В левом меню: **Project Settings** → **API**
2. Скопируй:
   - **Project URL** (вид: `https://xxxxx.supabase.co`)
   - **anon / public key** (длинный JWT токен)
   - **service_role key** (только для seed скрипта!)

---

## Шаг 5 — Добавь ключи в проект

Создай файл `.env.local` в папке `tiki-taka/`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://твой-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Шаг 6 — Заполни базу данными (seed)

```bash
cd tiki-taka
npm install
node scripts/seed.mjs
```

Ты увидишь:
```
🌱 Seeding Supabase...
📋 Inserting teams...
  ✅ 33 teams inserted
👤 Inserting players...
  ✅ 76 players inserted
📰 Inserting news...
  ✅ 6 articles inserted
🎉 Seed complete!
```

---

## Шаг 7 — Запусти проект

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

---

## Шаг 8 — Деплой на Vercel

1. Запуши код на GitHub
2. На [vercel.com](https://vercel.com) → New Project → импортируй репозиторий
3. В **Environment Variables** добавь все переменные из `.env.local`
4. Deploy!

---

## Как добавлять фотографии игроков

1. Зайди на `/admin` → вкладка **"Добавить игрока"** (или **"Редактировать"**)
2. Нажми **"Загрузить фото"** — выбери JPG/PNG/WEBP
3. Предпросмотр появится сразу
4. Нажми **"Сохранить игрока"** — фото автоматически загружается в Supabase Storage
5. URL фото сохраняется в поле `photo_url` в таблице `players`

**Форматы фото:** JPG, PNG, WEBP до 5MB  
**Рекомендуемый размер:** квадратное, минимум 300×300px

---

## Структура базы данных

```
leagues     — лиги (La Liga, Premier League и т.д.)
teams       — клубы (название, цвет, стадион, менеджер...)
players     — игроки (статистика, фото, стоимость...)
news        — статьи и новости
```

---

## FAQ

**Q: Сайт работает без Supabase?**  
A: Да! Все страницы автоматически переключаются на demo-данные из `lib/data.js`. Ты увидишь жёлтую метку "⚡ Demo данные".

**Q: Как обновить статистику игрока?**  
A: `/admin` → Игроки → нажми "Ред." напротив игрока → измени данные → Сохранить.

**Q: Как добавить нового игрока который не был в seed?**  
A: `/admin` → вкладка "Добавить игрока" → заполни форму → загрузи фото → Сохранить.
