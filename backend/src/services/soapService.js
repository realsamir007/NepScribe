const pool = require("../config/database");

const getLatestSoapNoteByConsultationId = async (consultationId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      consultation_id,
      subjective,
      objective,
      assessment,
      plan,
      status,
      version,
      created_at
    FROM soap_notes
    WHERE consultation_id = $1
    ORDER BY version DESC, created_at DESC
    LIMIT 1
    `,
    [consultationId]
  );

  return result.rows[0] || null;
};

const updateSoapNote = async (
  consultationId,
  subjective,
  objective,
  assessment,
  plan
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get the current/latest SOAP note
    const latestResult = await client.query(
      `
      SELECT
        id,
        version
      FROM soap_notes
      WHERE consultation_id = $1
      ORDER BY version DESC, created_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [consultationId]
    );

    if (latestResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const latestNote = latestResult.rows[0];
    const nextVersion = latestNote.version + 1;

    // Create a new reviewed version instead of overwriting the AI draft
    const result = await client.query(
      `
      INSERT INTO soap_notes (
        consultation_id,
        subjective,
        objective,
        assessment,
        plan,
        status,
        version
      )
      VALUES ($1, $2, $3, $4, $5, 'reviewed', $6)
      RETURNING
        id,
        consultation_id,
        subjective,
        objective,
        assessment,
        plan,
        status,
        version,
        created_at
      `,
      [
        consultationId,
        subjective,
        objective,
        assessment,
        plan,
        nextVersion,
      ]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getLatestSoapNoteByConsultationId,
  updateSoapNote,
};