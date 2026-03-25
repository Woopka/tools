import { neon } from '@netlify/neon';
const sql = neon();

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { action, u, p } = JSON.parse(req.body);

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        check_date TEXT,
        notes JSONB DEFAULT '[]'::JSONB
      )
    `;

    if (action === 'reg') {
      await sql`INSERT INTO users (username, password) VALUES (${u}, ${p})`;
      return res.json({ ok: 1 });
    }

    if (action === 'login') {
      const resData = await sql`
        SELECT id FROM users WHERE username = ${u} AND password = ${p}
      `;
      if (resData.length === 0) return res.json({ ok: 0 });
      return res.json({ token: resData[0].id.toString() });
    }
  } catch (e) {}

  return res.json({ ok: 0 });
};
