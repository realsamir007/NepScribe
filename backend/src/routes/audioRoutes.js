const express = require("express");

const {
  uploadAudio,
  getAudioFiles,
} = require("../controllers/audioController");

const authenticateToken = require("../middleware/authMiddleware");
const uploadAudioMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/:consultationId",
  uploadAudioMiddleware.single("audio"),
  uploadAudio
);

router.get(
  "/:consultationId",
  getAudioFiles
);

module.exports = router;