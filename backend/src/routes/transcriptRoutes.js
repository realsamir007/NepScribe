const express = require("express");

const {
  getTranscript,
} = require("../controllers/transcriptController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/:consultationId", getTranscript);

module.exports = router;