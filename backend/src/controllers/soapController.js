const consultationService = require("../services/consultationService");
const soapService = require("../services/soapService");

const getSoapNote = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation =
      await consultationService.getConsultationById(
        consultationId,
        req.user.userId
      );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found",
      });
    }

    const soapNote =
      await soapService.getLatestSoapNoteByConsultationId(
        consultationId
      );

    if (!soapNote) {
      return res.status(404).json({
        message: "SOAP note not found",
      });
    }

    return res.status(200).json({
      soapNote,
    });
  } catch (error) {
    console.error("Get SOAP note error:", error);

    return res.status(500).json({
      message: "Failed to retrieve SOAP note",
    });
  }
};

const updateSoapNote = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation =
      await consultationService.getConsultationById(
        consultationId,
        req.user.userId
      );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found",
      });
    }

    const {
      subjective,
      objective,
      assessment,
      plan,
    } = req.body;

    // Require all SOAP fields for a complete reviewed version
    if (
      typeof subjective !== "string" ||
      typeof objective !== "string" ||
      typeof assessment !== "string" ||
      typeof plan !== "string"
    ) {
      return res.status(400).json({
        message:
          "subjective, objective, assessment, and plan are required",
      });
    }

    const soapNote = await soapService.updateSoapNote(
      consultationId,
      subjective,
      objective,
      assessment,
      plan
    );

    if (!soapNote) {
      return res.status(404).json({
        message: "SOAP note not found",
      });
    }

    return res.status(200).json({
      message: "SOAP note reviewed successfully",
      soapNote,
    });
  } catch (error) {
    console.error("Update SOAP note error:", error);

    return res.status(500).json({
      message: "Failed to update SOAP note",
    });
  }
};

module.exports = {
  getSoapNote,
  updateSoapNote,
};