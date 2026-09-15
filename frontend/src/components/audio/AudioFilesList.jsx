import { Card } from "@heroui/react";

function AudioFilesList({ audioFiles, isLoading }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Uploaded Recordings
      </h2>

      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Audio files associated with this consultation.
      </p>

      {isLoading && (
        <Card className="mt-5">
          <Card.Content className="py-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Loading recordings...
            </p>
          </Card.Content>
        </Card>
      )}

      {!isLoading && audioFiles.length === 0 && (
        <Card className="mt-5">
          <Card.Content className="py-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No recordings uploaded yet.
            </p>
          </Card.Content>
        </Card>
      )}

      {!isLoading && audioFiles.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {audioFiles.map((audioFile) => (
            <Card key={audioFile.id}>
              <Card.Content className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-all font-medium text-[var(--color-text-primary)]">
                    {audioFile.file_name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Uploaded{" "}
                    {new Date(
                      audioFile.created_at,
                    ).toLocaleString()}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                  Audio
                </span>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default AudioFilesList;