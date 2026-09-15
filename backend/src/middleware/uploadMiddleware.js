const multer = require("multer");
const path = require("path");
const fs = require("fs");

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const consultationId = req.params.consultationId;

    const uploadDirectory = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "storage",
      "audio",
      consultationId
    );

    fs.mkdirSync(uploadDirectory, {
      recursive: true,
    });

    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const fileName = `audio-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

const uploadAudio = multer({
  storage: audioStorage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    console.log("Uploaded file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const allowedExtensions = [
      ".mp3",
      ".wav",
      ".m4a",
      ".mp4",
      ".webm",
      ".ogg",
    ];

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(`Unsupported audio format: ${extension}`)
      );
    }

    cb(null, true);
  },
});

module.exports = uploadAudio;