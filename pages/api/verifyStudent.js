// pages/api/verifyStudent.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

// -----------------------------
// Student API: verify student and fetch assigned counselors
// -----------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { studentId, firstName, lastName, grade } = req.body;

  if (!studentId || !firstName || !lastName || !grade) {
    return res.status(400).json({ valid: false, error: 'Missing required fields' });
  }

  try {
    // -----------------------------
    // 1️⃣ Verify student exists in database
    // -----------------------------
    const studentResult = await pool.query(
      'SELECT student_id, first_name, last_name, grade FROM users WHERE student_id=$1',
      [studentId]
    );

    if (studentResult.rowCount === 0) {
      // Student not found
      return res.status(200).json({ valid: false });
    }

    const student = studentResult.rows[0];

    // Optional: verify firstName, lastName, grade match exactly
    if (
      student.first_name.toLowerCase() !== firstName.toLowerCase() ||
      student.last_name.toLowerCase() !== lastName.toLowerCase() ||
      String(student.grade) !== String(grade)
    ) {
      return res.status(200).json({ valid: false });
    }

    // -----------------------------
    // 2️⃣ Return assigned counselors
    // Example placeholders for SIS / demo purposes
    // -----------------------------
    const counselors = [
      { username: 'counselor1', email: 'counselor1@example.com' },
      { username: 'counselor2', email: 'counselor2@example.com' },
      { username: 'counselor3', email: 'counselor3@example.com' }
    ];

    // -----------------------------
    // 3️⃣ Return empty messages and notes for demo
    // -----------------------------
    const messages = [];
    const notes = [];

    // -----------------------------
    // 4️⃣ Return full response
    // -----------------------------
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
