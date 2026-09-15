import { Button, Card } from "@heroui/react";

function AudioUploadCard({
  selectedFile,
  isUploading,
  error,
  success,
  onFileChange,
  onUpload,
}) {
  return (
    <section className="mt-8">
      <Card className="border border-[var(--color-border)] bg-white shadow-sm">
        <Card.Header className="border-b border-[var(--color-border)] px-6 py-5">
          <Card.Title className="text-xl text-[var(--color-text-primary)]">
            Upload Audio
          </Card.Title>

          <Card.Description>
            Select an audio recording from your computer.
          </Card.Description>
        </Card.Header>

        <Card.Content className="px-6 py-6">
          <div className="flex flex-col gap-5">
            <label
              htmlFor="audio-file"
              className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-stone-50 px-6 py-8 text-center transition hover:border-[var(--color-emerald-ink)] hover:bg-stone-100"
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {selectedFile
                  ? selectedFile.name
                  : "Choose an audio file"}
              </span>

              <span className="mt-2 text-xs text-[var(--color-text-muted)]">
                MP3, WAV, M4A, or other supported audio format
              </span>

              <input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={onFileChange}
                className="sr-only"
              />
            </label>

            {selectedFile && (
              <div className="rounded-lg bg-stone-50 px-4 py-3">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Selected:{" "}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {selectedFile.name}
                  </span>
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-[var(--color-success)]">
                  {success}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onPress={onUpload}
                isDisabled={!selectedFile || isUploading}
                className="bg-[var(--color-emerald-ink)] text-white"
              >
                {isUploading ? "Uploading..." : "Upload Audio"}
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}

export default AudioUploadCard;