const { active } = require('./status');
const allowedMenus = new Set(['제육볶음', '쌀국수', '김치찌개', '초밥', '마라탕', '돈까스']);
const headers = () => ({ apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' });
async function getVotes() {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/votes?select=menu`, { headers: headers() });
  if (!response.ok) throw new Error('Supabase read failed');
  return (await response.json()).reduce((all, row) => ({ ...all, [row.menu]: (all[row.menu] || 0) + 1 }), {});
}
module.exports = async (req, res) => {
  if (!active()) return res.status(410).json({ error: 'Service closed' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return res.status(503).json({ error: 'Supabase is not configured' });
  try {
    if (req.method === 'POST') { const { menu } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}; if (!allowedMenus.has(menu)) return res.status(400).json({ error: 'Invalid menu' }); const inserted = await fetch(`${process.env.SUPABASE_URL}/rest/v1/votes`, { method: 'POST', headers: { ...headers(), Prefer: 'return=minimal' }, body: JSON.stringify({ menu }) }); if (!inserted.ok) throw new Error('Supabase insert failed'); }
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    res.setHeader('Cache-Control', 'no-store'); return res.status(200).json(await getVotes());
  } catch { return res.status(502).json({ error: 'Could not reach Supabase' }); }
};
