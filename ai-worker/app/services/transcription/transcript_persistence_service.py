from sqlalchemy import text

from app.database import engine


def persist_transcript(
    consultation_id: str,
    pipeline_result: dict,
) -> str:
    """
    Persist the processed transcript for a consultation.

    If a transcript already exists for the consultation, update it.
    Otherwise, create a new transcript record.
    """

    raw_text = pipeline_result.get("raw_text", "")
    segments = pipeline_result.get("segments", [])
    language = pipeline_result.get("language")

    if not raw_text:
        raise ValueError(
            "Cannot persist transcript: raw_text is empty."
        )

    if not isinstance(segments, list):
        raise ValueError(
            "Cannot persist transcript: segments must be a list."
        )

    with engine.begin() as connection:
        existing_query = text("""
            SELECT id
            FROM transcripts
            WHERE consultation_id = :consultation_id
            ORDER BY created_at DESC
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
                UPDATE transcripts
                SET
                    raw_text = :raw_text,
                    segments = CAST(:segments AS jsonb),
                    language = :language
                WHERE id = :transcript_id
                RETURNING id
            """)

            result = connection.execute(
                update_query,
                {
                    "transcript_id": existing.id,
                    "raw_text": raw_text,
                    "segments": _serialize_segments(segments),
                    "language": language,
                },
            )

            return str(result.scalar_one())

        insert_query = text("""
            INSERT INTO transcripts (
                consultation_id,
                raw_text,
                segments,
                language
            )
            VALUES (
                :consultation_id,
                :raw_text,
                CAST(:segments AS jsonb),
                :language
            )
            RETURNING id
        """)

        result = connection.execute(
            insert_query,
            {
                "consultation_id": consultation_id,
                "raw_text": raw_text,
                "segments": _serialize_segments(segments),
                "language": language,
            },
        )

        return str(result.scalar_one())


def _serialize_segments(segments: list[dict]) -> str:
    """
    Convert transcript segments into JSON for PostgreSQL JSONB.
    """
    import json

    return json.dumps(segments)