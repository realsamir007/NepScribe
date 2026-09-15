import apiClient from "../../services/apiClient";

const getConsultations = async () => {
  return apiClient("/api/consultations");
};

const getConsultation = async (consultationId) => {
  const response = await apiClient(
    `/api/consultations/${consultationId}`,
  );

  return response?.consultation || null;
};

const createConsultation = async (title) => {
  return apiClient("/api/consultations", {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
};

export {
  getConsultations,
  getConsultation,
  createConsultation,
};