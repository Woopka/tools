import { neon } from '@netlify/neon';
const sql = neon();

export default async (req) => {
  const token = req.headers.token;
  if (!token) return { notes: [], checkToday: false };

  if (req.method === 'GET') {
    const data = await sql`SELECT check_date, notes FROM users WHERE id=${token}`;
    if (data.length === 0) return { notes: [], checkToday: false };
    const today = new Date().toLocaleDateString();
    return {
      notes: data[0].notes || [],
      checkToday: data[0].check_date === today
    };
  }

  if (req.method === 'POST') {
    const body = JSON.parse(req.body);
    const user = await sql`SELECT * FROM users WHERE id=${token}`;
    if (user.length === 0) return { ok: 0 };

    if (body.type === 'check') {
      await sql`UPDATE users SET check_date=${body.date} WHERE id=${token}`;
    }
    if (body.type === 'note') {
      const notes = user[0].notes || [];
      notes.unshift({ text: body.text, time: body.time });
      await sql`UPDATE users SET notes=${JSON.stringify(notes)} WHERE id=${token}`;
    }
  }
  return { ok: 1 };
};
