const consultationService = require("../services/consultationService");

async function createConsultation(req, res) {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const consultation =
      await consultationService.createConsultation(
        req.user.userId,
        title
      );

    res.status(201).json({
      message: "Consultation created successfully",
      consultation,
    });
  } catch (error) {
    console.error("Create consultation error:", error);

    res.status(500).json({
      message: "Failed to create consultation",
    });
  }
}

async function getMyConsultations(req, res) {
  try {
    const consultations =
      await consultationService.getConsultationsByUser(
        req.user.userId
      );

    res.json({
      consultations,
    });
  } catch (error) {
    console.error("Get consultations error:", error);

    res.status(500).json({
      message: "Failed to fetch consultations",
    });
  }
}

async function getConsultationById(req, res) {
  try {
    const { id } = req.params;

    const consultation =
      await consultationService.getConsultationById(
        id,
        req.user.userId
      );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found",
      });
    }

    res.json({
      consultation,
    });
  } catch (error) {
    console.error("Get consultation error:", error);

    res.status(500).json({
      message: "Failed to fetch consultation",
    });
  }
}

module.exports = {
  createConsultation,
  getMyConsultations,
  getConsultationById,
};