// pages/api/messages.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
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
    counselorEmail,
    dateTime
  } = req.body;

  if (!studentId || !firstName || !lastName || !grade || !reason || !urgency || !counselorEmail) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  const crisis = urgency === "I’m in Crisis";

  try {

    const insertQuery = `
      INSERT INTO messages
      (student_id, first_name, last_name, grade, counselor, counselor_email, notes, reason, urgency, crisis, date_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `;

    const values = [
      studentId,
      firstName,
      lastName,
      grade,
      counselor,
      counselorEmail,
      notes,
      reason,
      urgency,
      crisis,
      dateTime || new Date()
    ];

    // Insert message for counselor
    await pool.query(insertQuery, values);

    // Crisis messages also go to admin
    if (crisis) {

      const adminEmail = 'admin@example.com';

      const adminValues = [
        studentId,
        firstName,
        lastName,
        grade,
        'admin',
        adminEmail,
        notes,
        reason,
        urgency,
        crisis,
        dateTime || new Date()
      ];

      await pool.query(insertQuery, adminValues);
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    console.error('Messages API error:', err);

    return res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }

}
