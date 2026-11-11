// pages/api/players.js
// REST API endpoint for players
// GET  /api/players        → returns all players
// GET  /api/players?id=1   → returns a single player

import {getCatalog} from '../../lib/server/store';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {players} = await getCatalog();
  res.setHeader('Cache-Control','no-store');
  const { id, position, team } = req.query;

  // Return single player by id
  if (id) {
    const player = players.find(x=>x.id===id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    return res.status(200).json(player);
  }

  // Return filtered list
  let result = [...players];

  if (position) {
    result = result.filter(p => p.position.toLowerCase() === position.toLowerCase());
  }

  if (team) {
    result = result.filter(p => p.team.toLowerCase().includes(team.toLowerCase()));
  }

  return res.status(200).json({
    total: result.length,
    players: result,
  });
}
