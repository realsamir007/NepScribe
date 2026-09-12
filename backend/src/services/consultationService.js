const pool = require("../config/database");

async function createConsultation(userId, title) {
  const query = `
    INSERT INTO consultations (user_id, title)
    VALUES ($1, $2)
    RETURNING id, user_id, title, status, created_at;
  `;

  const result = await pool.query(query, [userId, title]);

  return result.rows[0];
}

async function getConsultationsByUser(userId) {
  const query = `
    SELECT id, user_id, title, status, created_at
    FROM consultations
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
}

async function getConsultationById(consultationId, userId) {
  const query = `
    SELECT id, user_id, title, status, created_at
    FROM consultations
    WHERE id = $1
      AND user_id = $2;
  `;

  const result = await pool.query(query, [
    consultationId,
    userId,
  ]);

  return result.rows[0];
}

module.exports = {
  createConsultation,
  getConsultationsByUser,
  getConsultationById,
};