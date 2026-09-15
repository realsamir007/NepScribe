import apiClient from "../../services/apiClient";

const getSoapNote = async (consultationId) => {
  const response = await apiClient(`/api/soap-notes/${consultationId}`);

  return response?.soapNote || null;
};

const updateSoapNote = async (consultationId, soapNote) => {
  const response = await apiClient(`/api/soap-notes/${consultationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      subjective: soapNote.subjective,
      objective: soapNote.objective,
      assessment: soapNote.assessment,
      plan: soapNote.plan,
    }),
  });

  return response?.soapNote || null;
};

export {
  getSoapNote,
  updateSoapNote,
};