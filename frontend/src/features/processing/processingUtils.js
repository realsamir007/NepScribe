const isActiveProcessingStatus = (status) => {
  return status === "queued" || status === "processing";
};

const isFinishedProcessingStatus = (status) => {
  return status === "completed" || status === "failed";
};

const getProcessingStatusClasses = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";

    case "failed":
      return "bg-red-100 text-red-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "queued":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-stone-100 text-stone-700";
  }
};

export {
  isActiveProcessingStatus,
  isFinishedProcessingStatus,
  getProcessingStatusClasses,
};