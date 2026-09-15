import {
  getProcessingStatusClasses,
} from "../../features/processing/processingUtils";

function ProcessingStatus({ job }) {
  if (!job) {
    return null;
  }

  const status = job.status || "unknown";

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-stone-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Processing Status
        </p>

        <p className="mt-1 break-all text-xs text-[var(--color-text-muted)]">
          Job ID: {job.id || "Unavailable"}
        </p>
      </div>

      <span
        className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getProcessingStatusClasses(
          status,
        )}`}
      >
        {status}
      </span>
    </div>
  );
}

export default ProcessingStatus;