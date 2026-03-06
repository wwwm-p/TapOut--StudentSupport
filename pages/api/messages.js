// pages/api/messages.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    studentId,
    firstName,
    lastName,
    grade,
    notes,
    reason,
    urgency,
    counselor,
    counselorEmail
  } = req.body;

  if (!studentId || !firstName || !lastName || !grade || !reason || !urgency || !counselor || !counselorEmail) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const crisis = urgency === "I’m in Crisis";

  try {
    const query = `
      INSERT INTO messages
      (student_id, first_name, last_name, grade, notes, reason, urgency, counselor_username, counselor_email, crisis)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;
    await pool.query(query, [studentId, firstName, lastName, grade, notes, reason, urgency, counselor, counselorEmail, crisis]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
}
