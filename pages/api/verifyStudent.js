// pages/api/verifyStudent.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ valid: false, error: 'Missing studentId' });
  }

  try {
    // 1️⃣ Verify student exists
    const studentResult = await pool.query(
      'SELECT student_id, first_name, last_name, grade, metadata FROM users WHERE student_id=$1',
      [studentId]
    );
    if (studentResult.rowCount === 0) {
      return res.status(200).json({ valid: false });
    }
    const student = studentResult.rows[0];

    // 2️⃣ Fetch assigned active counselors
    const counselorsResult = await pool.query(`
      SELECT c.counselor_id, c.username, c.email
      FROM student_counselor_assignments sca
      JOIN counselors c ON sca.counselor_id = c.counselor_id
      WHERE sca.student_id=$1 AND c.active=TRUE
    `, [studentId]);
    const counselors = counselorsResult.rows;
    const counselorIds = counselors.map(c => c.counselor_id);

    // 3️⃣ Fetch messages from assigned counselors
    let messages = [];
    if (counselorIds.length > 0) {
      const messagesResult = await pool.query(`
        SELECT id, counselor_id, notes, reason, urgency, crisis, date_time, read
        FROM messages
        WHERE student_id=$1 AND counselor_id = ANY($2)
        ORDER BY date_time DESC
      `, [studentId, counselorIds]);
      messages = messagesResult.rows;
    }

    // 4️⃣ Fetch notes / past appointments
    let notes = [];
    if (counselorIds.length > 0) {
      const notesResult = await pool.query(`
        SELECT id, counselor_id, note, note_type, date_created
        FROM student_notes
        WHERE student_id=$1 AND counselor_id = ANY($2)
        ORDER BY date_created DESC
      `, [studentId, counselorIds]);
      notes = notesResult.rows;
    }

    return res.status(200).json({
      valid: true,
      student,
      counselors,
      messages,
      notes
    });

  } catch (err) {
    console.error('VerifyStudent API error:', err);
    return res.status(500).json({ valid: false, error: 'Database error' });
  }
}
