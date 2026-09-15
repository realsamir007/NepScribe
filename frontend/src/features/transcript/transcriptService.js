import apiClient from "../../services/apiClient";

const getTranscript = async (consultationId) => {
  const response = await apiClient(`/api/transcripts/${consultationId}`);

  return response?.transcript || null;
};

export { getTranscript };