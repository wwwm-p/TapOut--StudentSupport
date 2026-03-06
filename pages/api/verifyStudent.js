// pages/api/verifyStudent.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { studentId, firstName, lastName } = req.body;

  if (!studentId || !firstName || !lastName) {
    return res.status(400).json({ valid: false, error: 'Missing required fields' });
  }

  try {
    const query = `
      SELECT * FROM users
      WHERE student_id = $1 AND first_name = $2 AND last_name = $3
    `;
    const result = await pool.query(query, [studentId, firstName, lastName]);

    if (result.rowCount === 0) {
      return res.status(200).json({ valid: false });
    }

    res.status(200).json({ valid: true, student: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, error: 'Database error' });
  }
}
