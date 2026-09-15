const pool = require("../config/database");

const getTranscriptByConsultationId = async (consultationId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      consultation_id,
      raw_text,
      segments,
      language,
      created_at
    FROM transcripts
    WHERE consultation_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [consultationId]
  );

  return result.rows[0] || null;
};

module.exports = {
  getTranscriptByConsultationId,
};