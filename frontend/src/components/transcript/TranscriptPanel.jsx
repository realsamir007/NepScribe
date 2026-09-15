function TranscriptPanel({ transcript, isLoading }) {
  if (isLoading) {
    return (
      <section className="mt-8">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Transcript
          </h2>

          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Loading transcript...
          </p>
        </div>
      </section>
    );
  }

  if (!transcript) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Transcript
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            AI-generated conversation transcript
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="whitespace-pre-wrap rounded-lg bg-stone-50 p-5 text-sm leading-7 text-[var(--color-text-secondary)]">
            {transcript.raw_text || "No transcript available."}
          </div>

          {transcript.language && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Detected language: {transcript.language}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default TranscriptPanel;