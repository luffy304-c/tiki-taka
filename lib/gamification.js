// lib/gamification.js
// Gamification system: XP, levels, badges, streaks
// Uses localStorage for persistence (no database needed for MVP)

export const LEVELS = [
  { level: 1, name: 'Ball Boy',       minXP: 0,     icon: '⚽', color: '#888' },
  { level: 2, name: 'Sunday Striker', minXP: 200,   icon: '👟', color: '#3b82f6' },
  { level: 3, name: 'Semi-Pro',       minXP: 600,   icon: '🎯', color: '#8b5cf6' },
  { level: 4, name: 'Pro Scout',      minXP: 1200,  icon: '🔭', color: '#f97316' },
  { level: 5, name: 'Analyst',        minXP: 2000,  icon: '📊', color: '#00e676' },
  { level: 6, name: 'Tactician',      minXP: 3500,  icon: '🧠', color: '#ffd600' },
  { level: 7, name: 'Football Sage',  minXP: 6000,  icon: '👑', color: '#ff3d57' },
];

export const BADGES = [
  { id: 'first_search',   name: 'First Scout',      desc: 'Used search for the first time',  icon: '🔍', xp: 50 },
  { id: 'news_reader',    name: 'News Junkie',       desc: 'Read 5 articles',                 icon: '📰', xp: 100 },
  { id: 'ai_user',        name: 'AI Whisperer',      desc: 'Used AI Intel for the first time',icon: '🤖', xp: 150 },
  { id: 'scout_mode',     name: 'Hidden Gems',       desc: 'Found a player in Scout mode',    icon: '💎', xp: 200 },
  { id: 'career_analyst', name: 'Career Guru',       desc: 'Ran a Career Path analysis',      icon: '📈', xp: 200 },
  { id: 'daily_login',    name: 'Daily Fan',         desc: 'Visited 3 days in a row',         icon: '🔥', xp: 100 },
  { id: 'team_explorer',  name: 'Club Connoisseur',  desc: 'Visited all 6 team pages',        icon: '🏟️', xp: 120 },
  { id: 'map_explorer',   name: 'Pitchfinder',       desc: 'Used Football Map feature',       icon: '📍', xp: 80  },
  { id: 'quiz_master',    name: 'Quiz Master',       desc: 'Scored 100% in a quiz',           icon: '🎯', xp: 150 },
];

export const XP_ACTIONS = {
  page_visit:    10,
  read_article:  20,
  use_ai:        50,
  use_scout:     40,
  use_career:    40,
  use_map:       30,
  search:        15,
  admin_add:     60,
  quiz_complete: 30,
};

// Safe localStorage helpers (works with SSR)
function getStore() {
  if (typeof window === 'undefined') return null;
  try {
    const account = localStorage.getItem('tt_active_account');
    const raw = localStorage.getItem(account ? `tt_profile_${account}` : 'tt_profile');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveStore(data) {
  if (typeof window === 'undefined') return;
  try {
    const account = localStorage.getItem('tt_active_account');
    localStorage.setItem(account ? `tt_profile_${account}` : 'tt_profile', JSON.stringify(data));
  } catch {}
}

export function getProfile() {
  const stored = getStore();
  return stored || {
    xp: 0,        // start with some XP so it feels alive
    badges: [],
    streak: 0,
    lastVisit: new Date().toISOString(),
    articlesRead: 0,
    teamsVisited: [],
  };
}

export function addXP(action) {
  const profile = getProfile();
  const gained = XP_ACTIONS[action] || 10;
  profile.xp += gained;
  saveStore(profile);
  return { gained, total: profile.xp, level: getLevelInfo(profile.xp) };
}

export function awardBadge(badgeId) {
  const profile = getProfile();
  if (profile.badges.includes(badgeId)) return null;
  profile.badges.push(badgeId);
  const badge = BADGES.find(b => b.id === badgeId);
  if (badge) profile.xp += badge.xp;
  saveStore(profile);
  return badge;
}

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const xpInLevel = xp - current.minXP;
  const xpNeeded = next ? next.minXP - current.minXP : 999;
  const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);
  return { current, next, xpInLevel, xpNeeded, progress };
}
