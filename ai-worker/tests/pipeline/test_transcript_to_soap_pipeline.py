from app.database import engine
from app.schemas.soap_schema import SOAPNote
from app.services.soap.soap_persistence_service import (
    persist_soap_note,
)
from app.services.soap.soap_pipeline_service import (
    generate_and_validate_soap,
)
from sqlalchemy import text


CONSULTATION_ID = "ff6410e2-db48-49d5-a4fe-08437c0a162c"


def build_transcript() -> str:
    return (
        "SPEAKER_01: Doctor, I have been having a cough "
        "for three weeks.\n"
        "SPEAKER_00: Is it worse at night?\n"
        "SPEAKER_01: Yes, it is worse at night.\n"
        "SPEAKER_00: Please follow up if the symptoms continue."
    )


def test_transcript_to_soap_pipeline():
    transcript = build_transcript()

    result = generate_and_validate_soap(
        transcript=transcript,
        top_k=3,
    )

    soap_note = result["soap_note"]
    validation = result["validation"]
    
    print("\nGenerated SOAP note:")
    print("Subjective:", soap_note.subjective)
    print("Objective:", soap_note.objective)
    print("Assessment:", soap_note.assessment)
    print("Plan:", soap_note.plan)

    print("\nValidation result:")
    print(validation)

    assert isinstance(soap_note, SOAPNote)

    assert soap_note.subjective is not None
    assert soap_note.objective is not None
    assert soap_note.assessment is not None
    assert soap_note.plan is not None

    soap_id = persist_soap_note(
        consultation_id=CONSULTATION_ID,
        soap_note=soap_note,
    )

    assert soap_id is not None

    with engine.begin() as connection:
        stored = connection.execute(
            text("""
                SELECT
                    id,
                    consultation_id,
                    subjective,
                    objective,
                    assessment,
                    plan,
                    status,
                    version
                FROM soap_notes
                WHERE id = :soap_id
            """),
            {
                "soap_id": soap_id,
            },
        ).fetchone()

    assert stored is not None
    assert str(stored.consultation_id) == CONSULTATION_ID
    assert stored.status == "draft"
    assert stored.version >= 1
    assert validation["is_valid"] is True