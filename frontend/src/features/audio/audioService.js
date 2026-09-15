import apiClient from "../../services/apiClient";

const uploadAudio = async (consultationId, file) => {
  const formData = new FormData();

  formData.append("audio", file);

  return apiClient(`/api/audio/${consultationId}`, {
    method: "POST",
    body: formData,
  });
};

const getAudioFiles = async (consultationId) => {
  return apiClient(`/api/audio/${consultationId}`);
};

export { uploadAudio, getAudioFiles };
