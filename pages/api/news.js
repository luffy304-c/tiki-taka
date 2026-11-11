// pages/api/news.js
// REST API endpoint for news articles
// GET /api/news            → returns all articles
// GET /api/news?id=1       → returns a single article
// GET /api/news?trending=true → returns trending articles

import {getCatalog} from '../../lib/server/store';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {news} = await getCatalog();
  res.setHeader('Cache-Control','no-store');
  const { id, trending, category } = req.query;

  if (id) {
    const article = news.find(x=>x.id===id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    return res.status(200).json(article);
  }

  let result = [...news];

  if (trending === 'true') {
    result = result.filter(n => n.trending);
  }

  if (category) {
    result = result.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }

  // Sort by date descending
  result.sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.status(200).json({ total: result.length, news: result });
}
