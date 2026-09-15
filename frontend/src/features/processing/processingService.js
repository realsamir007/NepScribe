import apiClient from "../../services/apiClient";

const createProcessingJob = async (consultationId) => {
  const response = await apiClient(
    `/api/processing-jobs/${consultationId}`,
    {
      method: "POST",
    },
  );

  return response?.processingJob || response?.job || response;
};

const getProcessingJobs = async (consultationId) => {
  const response = await apiClient(
    `/api/processing-jobs/${consultationId}`,
  );

  return (
    response?.processingJobs ||
    response?.processing_jobs ||
    response?.jobs ||
    []
  );
};

const getProcessingJob = async (consultationId, jobId) => {
  const response = await apiClient(
    `/api/processing-jobs/${consultationId}/${jobId}`,
  );

  return response?.processingJob || response?.job || response;
};

export {
  createProcessingJob,
  getProcessingJobs,
  getProcessingJob,
};