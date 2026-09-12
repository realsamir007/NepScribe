import time
from sqlalchemy import text

from app.database import engine


def get_and_claim_next_job():
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

        if not job:
            return None

        update_query = text("""
            UPDATE processing_jobs
            SET
                status = 'processing',
                started_at = NOW()
            WHERE id = :job_id
        """)

        connection.execute(
            update_query,
            {"job_id": job.id}
        )

    return job


def mark_job_completed(job_id):
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
            {"job_id": job_id}
        )


def mark_job_failed(job_id, error_message):
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
                "error_message": error_message,
            }
        )

def run_worker():
    print("NepScribe AI worker started.")

    while True:
        job = get_and_claim_next_job()

        if not job:
            print("No queued jobs. Waiting...")
            time.sleep(5)
            continue

        print("Claimed processing job:")
        print(f"Job ID: {job.id}")
        print(f"Consultation ID: {job.consultation_id}")

        try:
            print("Processing job...")

            # AI processing will go here later

            mark_job_completed(job.id)

            print(f"Job {job.id} completed successfully.")

        except Exception as error:
            print(f"Job {job.id} failed: {error}")

            mark_job_failed(
                job.id,
                str(error)
            )


if __name__ == "__main__":
    run_worker()
