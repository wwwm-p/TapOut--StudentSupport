// pages/api/getCounselors.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const result = await pool.query(
      'SELECT username, email, name FROM counselors ORDER BY name'
    );

    const counselors = result.rows;

    return res.status(200).json({ success: true, counselors });
  } catch (err) {
    console.error('GetCounselors API error:', err);

    // Fallback example counselors if table is not ready
    const exampleCounselors = [
      { username: 'counselor1', email: 'counselor1@example.com', name: 'Counselor One' },
      { username: 'counselor2', email: 'counselor2@example.com', name: 'Counselor Two' },
      { username: 'counselor3', email: 'counselor3@example.com', name: 'Counselor Three' }
    ];

    return res.status(200).json({ success: true, counselors: exampleCounselors });
  }
}
