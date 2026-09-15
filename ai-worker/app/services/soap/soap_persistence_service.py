from sqlalchemy import text

from app.database import engine
from app.schemas.soap_schema import SOAPNote


def persist_soap_note(
    consultation_id: str,
    soap_note: SOAPNote,
) -> str:
    """
    Persist a generated SOAP note for a consultation.

    If a draft SOAP note already exists for the consultation,
    update it instead of creating a duplicate.
    """

    with engine.begin() as connection:
        existing_query = text("""
            SELECT id
            FROM soap_notes
            WHERE consultation_id = :consultation_id
            ORDER BY version DESC, created_at DESC
            LIMIT 1
        """)

        existing = connection.execute(
            existing_query,
            {
                "consultation_id": consultation_id,
            },
        ).fetchone()

        if existing:
            update_query = text("""
                UPDATE soap_notes
                SET
                    subjective = :subjective,
                    objective = :objective,
                    assessment = :assessment,
                    plan = :plan,
                    status = 'draft',
                    version = version + 1
                WHERE id = :soap_id
                RETURNING id
            """)

            result = connection.execute(
                update_query,
                {
                    "soap_id": existing.id,
                    "subjective": soap_note.subjective,
                    "objective": soap_note.objective,
                    "assessment": soap_note.assessment,
                    "plan": soap_note.plan,
                },
            )

            return str(result.scalar_one())

        insert_query = text("""
            INSERT INTO soap_notes (
                consultation_id,
                subjective,
                objective,
                assessment,
                plan,
                status,
                version
            )
            VALUES (
                :consultation_id,
                :subjective,
                :objective,
                :assessment,
                :plan,
                'draft',
                1
            )
            RETURNING id
        """)

        result = connection.execute(
            insert_query,
            {
                "consultation_id": consultation_id,
                "subjective": soap_note.subjective,
                "objective": soap_note.objective,
                "assessment": soap_note.assessment,
                "plan": soap_note.plan,
            },
        )

        return str(result.scalar_one())