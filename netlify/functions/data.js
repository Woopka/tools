import { neon } from '@netlify/neon';
const sql = neon();

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const token = req.headers.token;

  if (!token) return res.json({ notes: [], checkToday: false });

  try {
    if (req.method === 'GET') {
      const data = await sql`
        SELECT check_date, notes FROM users WHERE id = ${token}
      `;
      if (data.length === 0) return res.json({ notes: [], checkToday: false });

      const today = new Date().toLocaleDateString();
      return res.json({
        notes: data[0].notes || [],
        checkToday: data[0].check_date === today
      });
    }

    if (req.method === 'POST') {
      const body = JSON.parse(req.body);
      const user = await sql`SELECT * FROM users WHERE id = ${token}`;
      if (user.length === 0) return res.json({ ok: 0 });

      if (body.type === 'check') {
        await sql`
          UPDATE users SET check_date = ${body.date} WHERE id = ${token}
        `;
      }

      if (body.type === 'note') {
        const notes = user[0].notes || [];
        notes.unshift({ text: body.text, time: body.time });
        await sql`
          UPDATE users SET notes = ${notes} WHERE id = ${token}
        `;
      }
    }
  } catch (e) {}

  return res.json({ ok: 1 });
};
