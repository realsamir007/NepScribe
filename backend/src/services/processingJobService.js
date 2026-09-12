const pool = require("../config/database");

async function createProcessingJob(consultationId) {
  const query = `
    INSERT INTO processing_jobs (
      consultation_id,
      status
    )
    VALUES ($1, 'queued')
    RETURNING
      id,
      consultation_id,
      status,
      error_message,
      started_at,
      completed_at,
      created_at;
  `;

  const result = await pool.query(query, [
    consultationId,
  ]);

  return result.rows[0];
}

async function getProcessingJobsByConsultation(
  consultationId
) {
  const query = `
    SELECT
      id,
      consultation_id,
      status,
      error_message,
      started_at,
      completed_at,
      created_at
    FROM processing_jobs
    WHERE consultation_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [
    consultationId,
  ]);

  return result.rows;
}

async function getProcessingJobById(
  jobId,
  consultationId
) {
  const query = `
    SELECT
      id,
      consultation_id,
      status,
      error_message,
      started_at,
      completed_at,
      created_at
    FROM processing_jobs
    WHERE id = $1
      AND consultation_id = $2;
  `;

  const result = await pool.query(query, [
    jobId,
    consultationId,
  ]);

  return result.rows[0];
}

module.exports = {
  createProcessingJob,
  getProcessingJobsByConsultation,
  getProcessingJobById,
};