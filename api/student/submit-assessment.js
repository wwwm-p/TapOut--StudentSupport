import pkg from 'pg'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default async function handler(req, res) {
  try {
    const {
      first_name,
      last_name,
      student_id,
      counselor_id,
      school_id,
      answers
    } = req.body

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !student_id ||
      !counselor_id ||
      !school_id
    ) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Find student
    const studentRes = await pool.query(
      `SELECT * FROM students
       WHERE first_name = $1
       AND last_name = $2
       AND student_id = $3
       AND school_id = $4`,
      [first_name, last_name, student_id, school_id]
    )

    if (!studentRes.rows.length) {
      return res.status(404).json({ error: 'Student not found' })
    }

    const student = studentRes.rows[0]

    // Validate counselor assignment
    if (student.counselor_id !== counselor_id) {
      return res.status(403).json({
        error: 'Selected counselor does not match assigned counselor'
      })
    }

    // Insert assessment
    await pool.query(
      `INSERT INTO assessments (student_id, counselor_id, school_id, answers)
       VALUES ($1, $2, $3, $4)`,
      [student.id, counselor_id, school_id, answers || {}]
    )

    res.status(200).json({ success: true })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
