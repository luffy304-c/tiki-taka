// pages/api/teams.js
// REST API endpoint for teams
// GET /api/teams        → returns all teams
// GET /api/teams?id=1   → returns a single team

import {getCatalog} from '../../lib/server/store';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {teams} = await getCatalog();
  res.setHeader('Cache-Control','no-store');
  const { id, league } = req.query;

  if (id) {
    const team = teams.find(x=>x.id===id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    return res.status(200).json(team);
  }

  let result = [...teams];

  if (league) {
    result = result.filter(t => t.league.toLowerCase().includes(league.toLowerCase()));
  }

  return res.status(200).json({ total: result.length, teams: result });
}
