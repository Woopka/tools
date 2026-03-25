import { neon } from '@netlify/neon';
const sql = neon();

export default async (req) => {
  try {
    const { action, u, p } = JSON.parse(req.body || '{}');

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
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: 1 })
      };
    }

    if (action === 'login') {
      const resData = await sql`
        SELECT id FROM users WHERE username=${u} AND password=${p}
      `;
      if (resData.length === 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({ ok: 0 })
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ token: resData[0].id.toString() })
      };
    }
  } catch (e) {}

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: 0 })
  };
};
