import {requireAdmin} from '../../lib/server/auth';
// pages/api/ai.js
// Single proxy endpoint for all AI features
// All calls to Claude API go through here — keeps API key server-side only

export default async function handler(req, res) {
  if(process.env.ENABLE_AI !== 'true')return res.status(503).json({error:'Внешняя функция отключена. Основной каталог работает без неё.'});
  if(!requireAdmin(req,res))return;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Check API key exists first — give a clear error if missing
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'NO_API_KEY',
      message: 'ANTHROPIC_API_KEY не найден. Создай файл .env.local с ключом.',
    });
  }

  const {systemPrompt,userMessage,maxTokens=800}=req.body||{};
  if(typeof userMessage!=='string'||userMessage.length>8000||(systemPrompt!=null&&(typeof systemPrompt!=='string'||systemPrompt.length>8000))||!Number.isInteger(maxTokens)||maxTokens<1||maxTokens>1500)return res.status(400).json({error:'Некорректные параметры запроса'});
  if (!userMessage) return res.status(400).json({ error: 'userMessage is required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: AbortSignal.timeout(20000),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',   // актуальная быстрая модель
        max_tokens: maxTokens,
        system: 'These are illustrative opinions, not validated predictions. Never invent missing statistics; state limitations and data provenance. '+(systemPrompt || 'You are TikiTaka AI.'),
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic API error:', JSON.stringify(err));
      return res.status(500).json({ error: 'AI service error', detail: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (error) {
    console.error('AI route error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
