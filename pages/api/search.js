// pages/api/search.js
// REST API for search
// GET /api/search?q=mbappe → returns matching players, teams, news

import {getCatalog} from '../../lib/server/store';
import {searchDataset} from '../../lib/model.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  const results = searchDataset(await getCatalog(),q.trim());
  const total = results.players.length + results.teams.length + results.news.length;

  return res.status(200).json({ query: q, total, ...results });
}
