// pages/api/verifyStudent.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { studentId, firstName, lastName } = req.body;
  if (!studentId || !firstName || !lastName) return res.status(400).json({ valid: false });

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE student_id=$1 AND first_name=$2 AND last_name=$3`,
      [studentId, firstName, lastName]
    );
    res.status(200).json({ valid: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false });
  }
}
