const express = require("express");

const {
  createProcessingJob,
  getProcessingJobs,
  getProcessingJobById,
} = require("../controllers/processingJobController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/:consultationId",
  createProcessingJob
);

router.get(
  "/:consultationId",
  getProcessingJobs
);

router.get(
  "/:consultationId/:jobId",
  getProcessingJobById
);

module.exports = router;