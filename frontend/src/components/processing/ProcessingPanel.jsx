import { Button, Card } from "@heroui/react";

import ProcessingStatus from "./ProcessingStatus";

function ProcessingPanel({
  audioFiles,
  processingJob,
  isStartingProcessing,
  processingError,
  onStartProcessing,
}) {
  const status = processingJob?.status || null;

  return (
    <section className="mt-8">
      <Card className="border border-[var(--color-border)] bg-white shadow-sm">
        <Card.Header className="border-b border-[var(--color-border)] px-6 py-5">
          <Card.Title className="text-xl text-[var(--color-text-primary)]">
            AI Processing
          </Card.Title>

          <Card.Description>
            Generate the transcript and SOAP note from the uploaded
            recording.
          </Card.Description>
        </Card.Header>

        <Card.Content className="px-6 py-6">
          <div className="flex flex-col gap-5">
            {!processingJob && (
              <>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Your recording is ready. Start AI processing to
                  generate the clinical transcript and SOAP note.
                </p>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onPress={onStartProcessing}
                    isDisabled={
                      audioFiles.length === 0 ||
                      isStartingProcessing
                    }
                    className="bg-[var(--color-emerald-ink)] text-white"
                  >
                    {isStartingProcessing
                      ? "Starting..."
                      : "Start AI Processing"}
                  </Button>
                </div>
              </>
            )}

            {processingJob && (
              <div className="flex flex-col gap-4">
                <ProcessingStatus job={processingJob} />

                {status === "queued" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">
                      Your recording is queued for AI processing.
                    </p>
                  </div>
                )}

                {status === "processing" && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="text-sm text-blue-800">
                      AI processing is in progress. Whisper
                      transcription, speaker diarization, and SOAP
                      generation are running.
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      This page checks the processing status every
                      three seconds.
                    </p>
                  </div>
                )}

                {status === "completed" && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-medium text-green-800">
                      AI processing completed successfully.
                    </p>

                    <p className="mt-1 text-xs text-green-700">
                      Your transcript and SOAP note are ready for
                      review.
                    </p>
                  </div>
                )}

                {status === "failed" && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-800">
                      AI processing failed.
                    </p>

                    {processingJob.error_message && (
                      <p className="mt-1 break-words text-xs text-red-700">
                        {processingJob.error_message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {processingError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-[var(--color-danger)]">
                  {processingError}
                </p>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}

export default ProcessingPanel;