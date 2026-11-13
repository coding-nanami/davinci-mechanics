// The tally behind the last leaf ("What shall he build next?").
//
//   GET  /api/vote            -> { counts: { crossbow, car, knight } }
//   POST /api/vote { id }     -> adds one mark for that machine, answers with the new counts
//
// Runs as a Vercel function. The counts live in one Redis hash (Upstash, through its REST API, so there is nothing to
// install). The page allows one mark per browser; that is only a note in the visitor's own browser and is easy to get
// round, so this side also allows at most three marks a day from one network address. The address itself is never
// stored: only a keyed hash of it, and that is deleted after a day.
const crypto = require('node:crypto');

const IDS = ['crossbow', 'car', 'knight'];
const PER_DAY = 3;
const BASE = process.env.KV_REST_API_URL, TOKEN = process.env.KV_REST_API_TOKEN;
// Only the published site writes to the real tally; preview deployments and local runs keep their own.
const NS = process.env.VERCEL_ENV === 'production' ? 'codex' : 'codex-test';

async function redis(commands) {
  const r = await fetch(BASE + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error('store answered ' + r.status);
  return (await r.json()).map((x) => { if (x.error) throw new Error(x.error); return x.result; });
}
function counts(flat) {
  const out = Object.fromEntries(IDS.map((k) => [k, 0]));
  for (let i = 0; flat && i + 1 < flat.length; i += 2) if (flat[i] in out) out[flat[i]] = Math.max(0, parseInt(flat[i + 1], 10) || 0);
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!BASE || !TOKEN) return res.status(503).json({ error: 'no tally is connected to this deployment' });
  try {
    if (req.method === 'GET') {
      const [flat] = await redis([['HGETALL', NS + ':votes']]);
      res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=20');
      return res.status(200).json({ counts: counts(flat) });
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'GET or POST' }); }

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
    const id = body && body.id;
    if (!IDS.includes(id)) return res.status(400).json({ error: 'unknown machine' });

    // marks are made on the page itself, not sent from some other site
    const origin = req.headers.origin, host = req.headers['x-forwarded-host'] || req.headers.host;
    if (origin) {
      let from = '';
      try { from = new URL(origin).host; } catch (e) { /* not an address */ }
      if (from !== host) return res.status(403).json({ error: 'marks are made on the page' });
    }

    const ip = String(req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
    const who = NS + ':seen:' + crypto.createHmac('sha256', TOKEN).update(ip).digest('hex').slice(0, 24);
    const [, seen] = await redis([['SET', who, 0, 'EX', 86400, 'NX'], ['INCR', who]]);
    if (seen > PER_DAY) {
      const [flat] = await redis([['HGETALL', NS + ':votes']]);
      return res.status(429).json({ error: 'enough marks from this address today', counts: counts(flat) });
    }
    const [, flat] = await redis([['HINCRBY', NS + ':votes', id, 1], ['HGETALL', NS + ':votes']]);
    return res.status(200).json({ counts: counts(flat), marked: id });
  } catch (e) {
    return res.status(502).json({ error: 'the tally could not be reached' });
  }
};
