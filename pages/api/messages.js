// pages/api/messages.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

// -----------------------------
// Student API: send message to assigned counselor
// -----------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    student_id,
    counselor_username,
    notes = '',
    reason,
    urgency
  } = req.body;

  if (!student_id || !counselor_username || !reason || !urgency) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const crisis = urgency === "I’m in Crisis";

  try {
    // -----------------------------
    // Lookup counselor_id
    // -----------------------------
    const counselorResult = await pool.query(
      'SELECT counselor_id FROM counselors WHERE username=$1 AND active=TRUE',
      [counselor_username]
    );
    if (counselorResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Counselor not found or inactive' });
    }
    const counselor_id = counselorResult.rows[0].counselor_id;

    // -----------------------------
    // Verify student exists
    // -----------------------------
    const studentResult = await pool.query(
      'SELECT student_id FROM users WHERE student_id=$1',
      [student_id]
    );
    if (studentResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Student not found' });
    }

    // -----------------------------
    // Verify counselor assignment
    // -----------------------------
    const assignmentResult = await pool.query(
      'SELECT 1 FROM student_counselor_assignments WHERE student_id=$1 AND counselor_id=$2',
      [student_id, counselor_id]
    );
    if (assignmentResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Counselor not assigned to this student' });
    }

    // -----------------------------
    // Insert message
    // -----------------------------
    await pool.query(
      `INSERT INTO messages (student_id, counselor_id, notes, reason, urgency, crisis)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [student_id, counselor_id, notes, reason, urgency, crisis]
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Messages API error:', err);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
}
