/**
 * Proxy IPN PayDunya → API JobEtu (`POST .../api/webhooks/paydunya`).
 * URL publique : https://<ton-front>.vercel.app/paydunia/hasPaied (rewrite vercel.json).
 * Variable Vercel (serveur) : JOBETU_PAYDUNYA_WEBHOOK_TARGET = URL complète du webhook backend.
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed');
    return;
  }

  const target = process.env.JOBETU_PAYDUNYA_WEBHOOK_TARGET?.trim().replace(/\/$/, '');
  if (!target) {
    res.status(500).send('JOBETU_PAYDUNYA_WEBHOOK_TARGET is not set');
    return;
  }

  const body = await readRawBody(req);
  const ct = req.headers['content-type'] ?? 'application/octet-stream';

  const upstream = await fetch(target, {
    method: 'POST',
    headers: { 'content-type': ct },
    body: body.length ? body : undefined,
  });

  const text = await upstream.text();
  res.status(upstream.status).send(text);
}
