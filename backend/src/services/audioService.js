const pool = require("../config/database");

async function createAudioFile(
  consultationId,
  fileName,
  filePath,
  mimeType
) {
  const query = `
    INSERT INTO audio_files (
      consultation_id,
      file_name,
      file_path,
      mime_type
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      consultation_id,
      file_name,
      file_path,
      mime_type,
      duration_seconds,
      created_at;
  `;

  const result = await pool.query(query, [
    consultationId,
    fileName,
    filePath,
    mimeType,
  ]);

  return result.rows[0];
}

async function getAudioFilesByConsultation(
  consultationId
) {
  const query = `
    SELECT
      id,
      consultation_id,
      file_name,
      file_path,
      mime_type,
      duration_seconds,
      created_at
    FROM audio_files
    WHERE consultation_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [consultationId]);

  return result.rows;
}

module.exports = {
  createAudioFile,
  getAudioFilesByConsultation,
};