import time
import traceback

from sqlalchemy import text

from app.database import engine


POLL_INTERVAL_SECONDS = 5


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
    """
    Process one claimed job.

    The actual audio-to-SOAP pipeline will be added in Phase 7.2
    and later phases.
    """

    print("Processing job...")
    print(f"Job ID: {job.id}")
    print(f"Consultation ID: {job.consultation_id}")

    # Temporary Phase 7.1 placeholder.
    # The real pipeline will be called here in Phase 7.2.
    print("Phase 7.1 connection test completed.")


def run_worker():
    """
    Continuously poll for queued processing jobs.
    """

    print("NepScribe AI worker started.")
    print(f"Polling every {POLL_INTERVAL_SECONDS} seconds.")

    while True:
        try:
            job = get_and_claim_next_job()

            if job is None:
                print("No queued jobs. Waiting...")
                time.sleep(POLL_INTERVAL_SECONDS)
                continue

            print("Claimed processing job.")

            try:
                process_job(job)
                mark_job_completed(job.id)

                print(f"Job {job.id} completed successfully.")

            except Exception as error:
                error_message = str(error)

                print(f"Job {job.id} failed: {error_message}")
                traceback.print_exc()

                mark_job_failed(
                    job.id,
                    error_message,
                )

        except Exception as error:
            print(f"Worker-level error: {error}")
            traceback.print_exc()
            time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    run_worker()