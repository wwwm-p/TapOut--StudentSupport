import pkg from 'pg'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default async function handler(req, res) {
  try {
    const { school_id } = req.query

    if (!school_id) {
      return res.status(400).json({ error: 'Missing school_id' })
    }

    const result = await pool.query(
      `SELECT id, name
       FROM users
       WHERE role = 'counselor'
       AND is_visible = true
       AND school_id = $1
       ORDER BY name ASC`,
      [school_id]
    )

    res.status(200).json(result.rows)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
