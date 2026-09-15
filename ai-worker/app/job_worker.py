import time
import traceback

from sqlalchemy import text

from app.database import engine

from pathlib import Path

from app.pipelines.audio_to_transcript_pipeline import (
    run_audio_to_transcript_pipeline,
)
from app.services.transcription.transcript_persistence_service import (
    persist_transcript,
)
from app.services.soap.soap_pipeline_service import (
    generate_and_validate_soap,
)
from app.services.soap.soap_persistence_service import (
    persist_soap_note,
)

POLL_INTERVAL_SECONDS = 5

def get_audio_for_consultation(consultation_id):
    query = text("""
        SELECT file_path
        FROM audio_files
        WHERE consultation_id = :consultation_id
        ORDER BY created_at DESC
        LIMIT 1
    """)

    with engine.connect() as connection:
        result = connection.execute(
            query,
            {
                "consultation_id": consultation_id,
            },
        ).fetchone()

    if result is None:
        raise FileNotFoundError(
            f"No audio file found for consultation: {consultation_id}"
        )

    return result.file_path


def update_consultation_status(consultation_id, status):
    query = text("""
        UPDATE consultations
        SET status = :status
        WHERE id = :consultation_id
    """)

    with engine.begin() as connection:
        connection.execute(
            query,
            {
                "consultation_id": consultation_id,
                "status": status,
            },
        )


def get_and_claim_next_job():
    """
    Atomically claim the oldest queued processing job.

    FOR UPDATE SKIP LOCKED allows multiple workers to run safely
    without claiming the same job.
    """

    query = text("""
        SELECT
            id,
            consultation_id
        FROM processing_jobs
        WHERE status = 'queued'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    """)

    with engine.begin() as connection:
        result = connection.execute(query)
        job = result.fetchone()

        if job is None:
            return None

        update_query = text("""
            UPDATE processing_jobs
            SET
                status = 'processing',
                started_at = NOW(),
                error_message = NULL
            WHERE id = :job_id
        """)

        connection.execute(
            update_query,
            {"job_id": job.id},
        )

    return job


def mark_job_completed(job_id):
    """
    Mark a processing job as completed.
    """

    query = text("""
        UPDATE processing_jobs
        SET
            status = 'completed',
            completed_at = NOW(),
            error_message = NULL
        WHERE id = :job_id
    """)

    with engine.begin() as connection:
        connection.execute(
            query,
            {"job_id": job_id},
        )


def mark_job_failed(job_id, error_message):
    """
    Mark a processing job as failed and save the error.
    """

    query = text("""
        UPDATE processing_jobs
        SET
            status = 'failed',
            completed_at = NOW(),
            error_message = :error_message
        WHERE id = :job_id
    """)

    with engine.begin() as connection:
        connection.execute(
            query,
            {
                "job_id": job_id,
                "error_message": error_message[:4000],
            },
        )

def process_job(job):
    consultation_id = str(job.consultation_id)

    print("=" * 60)
    print("Starting AI processing")
    print(f"Job ID: {job.id}")
    print(f"Consultation ID: {consultation_id}")
    print("=" * 60)

    update_consultation_status(
        consultation_id,
        "processing",
    )

    # ---------------------------------------------------------
    # Step 1: Get audio
    # ---------------------------------------------------------
    audio_path = get_audio_for_consultation(
        consultation_id
    )

    print(f"Audio path: {audio_path}")

    if not Path(audio_path).exists():
        raise FileNotFoundError(
            f"Audio file does not exist: {audio_path}"
        )

    # ---------------------------------------------------------
    # Step 2: Audio -> Transcript
    # ---------------------------------------------------------
    print("Running audio-to-transcript pipeline...")

    pipeline_result = run_audio_to_transcript_pipeline(
        audio_path
    )

    print(
        f"Transcript generated with "
        f"{len(pipeline_result['segments'])} cleaned segments."
    )

    # ---------------------------------------------------------
    # Step 3: Persist transcript
    # ---------------------------------------------------------
    transcript_id = persist_transcript(
        consultation_id=consultation_id,
        pipeline_result=pipeline_result,
    )

    print(f"Transcript persisted: {transcript_id}")

    # ---------------------------------------------------------
    # Step 4: Prepare speaker-attributed transcript
    # ---------------------------------------------------------
    transcript_for_soap = "\n".join(
        f"{segment['speaker']}: {segment['text']}"
        for segment in pipeline_result["segments"]
    )

    print("Speaker-attributed transcript prepared.")

    # ---------------------------------------------------------
    # Step 5: Transcript -> RAG -> Qwen3 -> SOAP
    # ---------------------------------------------------------
    print("Generating SOAP note...")

    soap_result = generate_and_validate_soap(
        transcript=transcript_for_soap,
        top_k=3,
    )

    soap_note = soap_result["soap_note"]

    print("SOAP note generated.")

    # ---------------------------------------------------------
    # Step 6: Persist SOAP note
    # ---------------------------------------------------------
    soap_id = persist_soap_note(
        consultation_id=consultation_id,
        soap_note=soap_note,
    )

    print(f"SOAP note persisted: {soap_id}")

    # ---------------------------------------------------------
    # Step 7: Mark consultation complete
    # ---------------------------------------------------------
    update_consultation_status(
        consultation_id,
        "completed",
    )

    print("=" * 60)
    print("AI processing completed successfully.")
    print("=" * 60)


def process_next_job():
    job = get_and_claim_next_job()

    if job is None:
        print("No queued jobs.")
        return False

    print("Claimed processing job.")

    try:
        process_job(job)
        mark_job_completed(job.id)

        print(f"Job {job.id} completed successfully.")
        return True

    except Exception as error:
        error_message = str(error)

        print(
            f"Job {job.id} failed: {error_message}"
        )

        traceback.print_exc()

        mark_job_failed(
            job.id,
            error_message,
        )

        update_consultation_status(
            str(job.consultation_id),
            "failed",
        )

        return False

def run_worker():
    print("NepScribe AI worker started.")
    print(
        f"Polling every {POLL_INTERVAL_SECONDS} seconds."
    )

    while True:
        try:
            processed = process_next_job()

            if not processed:
                time.sleep(POLL_INTERVAL_SECONDS)

        except Exception as error:
            print(f"Worker-level error: {error}")
            traceback.print_exc()
            time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    run_worker()