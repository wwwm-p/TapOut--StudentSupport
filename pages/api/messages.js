// pages/api/messages.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

// -----------------------------
// Student API: send message to assigned counselor / admin
// -----------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    studentId,
    firstName,
    lastName,
    grade,
    notes = '',
    reason,
    urgency,
    counselor,
    counselorEmail
  } = req.body;

  if (!studentId || !firstName || !lastName || !grade || !reason || !urgency) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const crisis = urgency === "I’m in Crisis";

  try {
    // -----------------------------
    // Verify student exists
    // -----------------------------
    const studentResult = await pool.query(
      'SELECT student_id FROM users WHERE student_id=$1',
      [studentId]
    );
    if (studentResult.rowCount === 0) {
      return res.status(400).json({ success: false, error: 'Student not found' });
    }

    // -----------------------------
    // Insert into messages table
    // -----------------------------
    const insertQuery = `
      INSERT INTO messages (student_id, counselor_email, notes, reason, urgency, crisis, date_time)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
    `;

    // ✅ Crisis messages go to admin + counselor
    if (crisis) {
      // Example admin email for crisis
      const adminEmail = 'admin@example.com';
      // Insert for counselor
      await pool.query(insertQuery, [studentId, counselorEmail, notes, reason, urgency, crisis]);
      // Insert for admin
      await pool.query(insertQuery, [studentId, adminEmail, notes, reason, urgency, crisis]);
    } else {
      // Non-crisis: insert only for selected counselor
      await pool.query(insertQuery, [studentId, counselorEmail, notes, reason, urgency, crisis]);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Messages API error:', err);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
}
