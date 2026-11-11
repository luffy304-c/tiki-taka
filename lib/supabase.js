// lib/supabase.js
// Supabase клиент — используется везде в проекте

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  // В dev режиме просто предупреждаем, не крашим
  if (typeof window !== 'undefined') {
    console.warn('⚠️  Supabase env vars missing. Add to .env.local');
  }
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder'
);

// ─────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────
export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('league, name');
  if (error) throw error;
  return data;
}

export async function getTeamById(id) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertTeam(team) {
  const { data, error } = await supabase
    .from('teams')
    .upsert(team, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeam(id) {
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────
// PLAYERS
// ─────────────────────────────────────────
export async function getPlayers(filters = {}) {
  let query = supabase
    .from('players')
    .select(`*, teams(name, short_name, league, color, country)`)
    .order('rating', { ascending: false });

  if (filters.teamId)   query = query.eq('team_id', filters.teamId);
  if (filters.position) query = query.eq('position', filters.position);
  if (filters.league)   query = query.eq('teams.league', filters.league);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPlayerById(id) {
  const { data, error } = await supabase
    .from('players')
    .select(`*, teams(*)`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertPlayer(player) {
  const { data, error } = await supabase
    .from('players')
    .upsert(player, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────
// NEWS
// ─────────────────────────────────────────
export async function getNews(filters = {}) {
  let query = supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.trending) query = query.eq('trending', true);
  if (filters.limit)    query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getNewsById(id) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertNews(article) {
  const { data, error } = await supabase
    .from('news')
    .upsert(article, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNews(id) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────
export async function searchAll(query) {
  const q = query.trim();
  const [playersRes, teamsRes, newsRes] = await Promise.all([
    supabase.from('players').select('*, teams(name,league,color)')
      .or(`name.ilike.%${q}%,position.ilike.%${q}%,nationality.ilike.%${q}%`),
    supabase.from('teams').select('*')
      .or(`name.ilike.%${q}%,league.ilike.%${q}%,country.ilike.%${q}%,short_name.ilike.%${q}%`),
    supabase.from('news').select('*')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`),
  ]);
  return {
    players: playersRes.data || [],
    teams:   teamsRes.data   || [],
    news:    newsRes.data    || [],
  };
}

// ─────────────────────────────────────────
// PHOTO UPLOAD
// ─────────────────────────────────────────
export async function uploadPlayerPhoto(playerId, file) {
  const ext  = file.name.split('.').pop();
  const path = `players/${playerId}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('tiki-taka-media')
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;

  const { data } = supabase.storage
    .from('tiki-taka-media')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadTeamLogo(teamId, file) {
  const ext  = file.name.split('.').pop();
  const path = `teams/${teamId}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('tiki-taka-media')
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;

  const { data } = supabase.storage
    .from('tiki-taka-media')
    .getPublicUrl(path);

  return data.publicUrl;
}
