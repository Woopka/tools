import { neon } from '@netlify/neon';
const sql = neon();

export default async (req) => {
  const { action, u, p } = JSON.parse(req.body);
  try {
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
      return { ok: 1 };
    }
    if (action === 'login') {
      const res = await sql`SELECT id FROM users WHERE username=${u} AND password=${p}`;
      if (res.length === 0) return { ok: 0 };
      return { token: res[0].id.toString() };
    }
  } catch (e) {}
  return { ok: 0 };
};
