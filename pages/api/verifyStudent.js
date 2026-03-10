// pages/api/verifyStudent.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      valid: false,
      error: 'Method not allowed'
    });
  }

  const { studentId, firstName, lastName, grade } = req.body;

  if (!studentId || !firstName || !lastName || !grade) {
    return res.status(400).json({
      valid: false,
      error: 'Missing required fields'
    });
  }

  try {

    let student = null;

    // -----------------------------
    // 1️⃣ Try verifying student (SIS / users table)
    // -----------------------------
    try {

      const studentResult = await pool.query(
        'SELECT student_id, first_name, last_name, grade FROM users WHERE student_id=$1',
        [studentId]
      );

      if (studentResult.rowCount > 0) {

        const dbStudent = studentResult.rows[0];

        if (
          dbStudent.first_name.trim().toLowerCase() === firstName.trim().toLowerCase() &&
          dbStudent.last_name.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          String(dbStudent.grade) === String(grade)
        ) {
          student = dbStudent;
        }

      }

    } catch (verifyError) {
      // If users table doesn't exist yet, allow demo verification
      console.warn("Student verification table not ready yet.");
      student = {
        student_id: studentId,
        first_name: firstName,
        last_name: lastName,
        grade: grade
      };
    }

    if (!student) {
      return res.status(200).json({ valid: false });
    }

    // -----------------------------
    // 2️⃣ Load counselors from database
    // -----------------------------
    let counselors = [];

    try {

      const counselorResult = await pool.query(
        'SELECT username, email, name FROM counselors ORDER BY name'
      );

      counselors = counselorResult.rows;

    } catch (counselorError) {

      console.warn("Counselor table not ready, using example counselors.");

      counselors = [
        { username: 'counselor1', email: 'counselor1@example.com', name: 'Counselor One' },
        { username: 'counselor2', email: 'counselor2@example.com', name: 'Counselor Two' },
        { username: 'counselor3', email: 'counselor3@example.com', name: 'Counselor Three' }
      ];
    }

    // -----------------------------
    // 3️⃣ Return student + counselors
    // -----------------------------
    return res.status(200).json({
      valid: true,
      student,
      counselors
    });

  } catch (err) {

    console.error('VerifyStudent API error:', err);

    return res.status(500).json({
      valid: false,
      error: 'Database error'
    });
  }

}
