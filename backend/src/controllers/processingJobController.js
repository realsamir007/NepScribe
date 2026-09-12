const consultationService = require("../services/consultationService");
const processingJobService = require("../services/processingJobService");

async function createProcessingJob(req, res) {
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

    const job =
      await processingJobService.createProcessingJob(
        consultationId
      );

    res.status(201).json({
      message: "Processing job created successfully",
      job,
    });
  } catch (error) {
    console.error(
      "Create processing job error:",
      error
    );

    res.status(500).json({
      message: "Failed to create processing job",
    });
  }
}

async function getProcessingJobs(req, res) {
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

    const jobs =
      await processingJobService
        .getProcessingJobsByConsultation(
          consultationId
        );

    res.json({
      jobs,
    });
  } catch (error) {
    console.error(
      "Get processing jobs error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch processing jobs",
    });
  }
}

async function getProcessingJobById(req, res) {
  try {
    const {
      consultationId,
      jobId,
    } = req.params;

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

    const job =
      await processingJobService.getProcessingJobById(
        jobId,
        consultationId
      );

    if (!job) {
      return res.status(404).json({
        message: "Processing job not found",
      });
    }

    res.json({
      job,
    });
  } catch (error) {
    console.error(
      "Get processing job error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch processing job",
    });
  }
}

module.exports = {
  createProcessingJob,
  getProcessingJobs,
  getProcessingJobById,
};