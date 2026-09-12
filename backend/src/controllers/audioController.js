const fs = require("fs");
const path = require("path");

const consultationService = require("../services/consultationService");
const audioService = require("../services/audioService");

async function uploadAudio(req, res) {
  try {
    const { consultationId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Audio file is required",
      });
    }

    const consultation =
      await consultationService.getConsultationById(
        consultationId,
        req.user.userId
      );

    if (!consultation) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Consultation not found",
      });
    }

    // Normalize MIME type based on the file extension.
    // Some clients, such as Postman on macOS, may send
    // application/octet-stream for audio files.
    const extension = path
      .extname(req.file.originalname)
      .toLowerCase();

    const mimeTypeMap = {
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4",
      ".mp4": "audio/mp4",
      ".webm": "audio/webm",
      ".ogg": "audio/ogg",
    };

    const normalizedMimeType =
      mimeTypeMap[extension] || req.file.mimetype;

    const audioFile =
      await audioService.createAudioFile(
        consultationId,
        req.file.originalname,
        req.file.path,
        normalizedMimeType
      );

    res.status(201).json({
      message: "Audio uploaded successfully",
      audioFile,
    });
  } catch (error) {
    console.error("Audio upload error:", error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Failed to upload audio",
    });
  }
}

async function getAudioFiles(req, res) {
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

    const audioFiles =
      await audioService.getAudioFilesByConsultation(
        consultationId
      );

    res.json({
      audioFiles,
    });
  } catch (error) {
    console.error("Get audio files error:", error);

    res.status(500).json({
      message: "Failed to fetch audio files",
    });
  }
}

module.exports = {
  uploadAudio,
  getAudioFiles,
};