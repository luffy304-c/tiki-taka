import { normalizeLanguage } from './i18n-core.mjs';
// lib/ai.js
// Wrapper around Anthropic API for all AI features on TikiTaka

export async function callClaude(systemPrompt, userMessage, maxTokens = 800) {
  const language=normalizeLanguage(typeof document==='undefined'?'ru':document.documentElement.lang);
  const names={ru:'Russian',en:'English',kk:'Kazakh',es:'Spanish',fr:'French',de:'German',zh:'Simplified Chinese',ja:'Japanese',ko:'Korean',pt:'Portuguese'};
  systemPrompt += `\nRespond in ${names[language]}. Translate section headings into the same language.`;
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userMessage, maxTokens }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface the real error so users know what to fix
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data.text;
}

// Specific AI feature helpers

export async function getTransferInsight(playerName, fromTeam, toTeam, fee) {
  return callClaude(
    `You are TikiTaka AI — a football intelligence engine. 
     You explain transfers in terms of tactical impact, team dynamics and season outlook.
     Be concise: max 3 short paragraphs. Use football terminology but keep it understandable.
     Structure: 1) What this means tactically 2) Impact on both clubs 3) One-line verdict.
     No markdown headers. Plain text paragraphs only.`,
    `Analyze this transfer: ${playerName} moving from ${fromTeam} to ${toTeam} for ${fee}.`
  );
}

export async function getCareerPath(playerName, age, position, currentTeam, currentRating) {
  return callClaude(
    `You are a football career analyst AI. 
     You provide realistic career path projections based on real football data and patterns.
     Give: 1) Current situation assessment 2) Best-case scenario 3) Recommended next move 4) 3 ideal destination clubs with reasons.
     Be specific with club names. Keep it under 200 words total.`,
    `Player: ${playerName}, Age: ${age}, Position: ${position}, Club: ${currentTeam}, Rating: ${currentRating}/10.
     Project their career over the next 3 years.`
  );
}

export async function getScoutReport(playerName, age, value, position, goals, assists, rating) {
  return callClaude(
    `You are a football scout AI trained on Moneyball principles and modern analytics.
     Give a scouting report: 1) Hidden strengths 2) Areas of concern 3) Comparable player (famous reference) 4) Value verdict (overpriced/fair/bargain).
     Max 150 words. Be direct and opinionated like a real scout.`,
    `Scout report for: ${playerName}, ${age} years old, ${position}, Value: ${value}, Goals: ${goals}, Assists: ${assists}, Rating: ${rating}/10`
  );
}

export async function getNewsInsight(headline, excerpt) {
  return callClaude(
    `You are TikiTaka's smart news analyst. 
     For any football news, produce a structured insight in exactly this format:
     NEWS: [2-line summary]
     ANALYSIS: [3-line tactical/strategic breakdown]  
     VERDICT: [1 bold conclusion line]
     Be sharp, opinionated and insightful. No fluff.`,
    `News: "${headline}". Context: ${excerpt}`
  );
}

export async function getClubIntelligence(clubName, question) {
  return callClaude(
    `You are TikiTaka's club intelligence AI.
     You answer questions about football clubs with data-driven insight.
     Focus on: tactics, transfer strategy, season prospects, squad strengths/weaknesses.
     Keep response under 120 words. Be direct and useful.`,
    `Club: ${clubName}. Question: ${question}`
  );
}
