const consultationService = require("../services/consultationService");
const transcriptService = require("../services/transcriptService");

const getTranscript = async (req, res) => {
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

    const transcript =
      await transcriptService.getTranscriptByConsultationId(
        consultationId
      );

    if (!transcript) {
      return res.status(404).json({
        message: "Transcript not found",
      });
    }

    return res.status(200).json({
      transcript,
    });
  } catch (error) {
    console.error("Get transcript error:", error);

    return res.status(500).json({
      message: "Failed to retrieve transcript",
    });
  }
};

module.exports = {
  getTranscript,
};