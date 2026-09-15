from app.services.transcription.transcript_persistence_service import (
    persist_transcript,
)
from app.database import engine
from sqlalchemy import text


CONSULTATION_ID = "ff6410e2-db48-49d5-a4fe-08437c0a162c"


def test_persist_transcript():
    pipeline_result = {
        "raw_text": (
            "Doctor, I have been having a cough for three weeks."
        ),
        "language": "en",
        "segments": [
            {
                "id": 0,
                "start": 0.0,
                "end": 4.2,
                "speaker": "SPEAKER_01",
                "text": (
                    "Doctor, I have been having a cough "
                    "for three weeks."
                ),
                "type": "speech",
            }
        ],
    }

    transcript_id = persist_transcript(
        consultation_id=CONSULTATION_ID,
        pipeline_result=pipeline_result,
    )

    assert transcript_id is not None

    with engine.begin() as connection:
        result = connection.execute(
            text("""
                SELECT
                    id,
                    consultation_id,
                    raw_text,
                    segments,
                    language
                FROM transcripts
                WHERE id = :transcript_id
            """),
            {
                "transcript_id": transcript_id,
            },
        ).fetchone()

    assert result is not None
    assert str(result.consultation_id) == CONSULTATION_ID
    assert result.raw_text == pipeline_result["raw_text"]
    assert result.language == "en"
    assert len(result.segments) == 1
    assert result.segments[0]["speaker"] == "SPEAKER_01"