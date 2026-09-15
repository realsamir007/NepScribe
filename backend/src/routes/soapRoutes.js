const express = require("express");

const {
  getSoapNote,
  updateSoapNote,
} = require("../controllers/soapController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/:consultationId", getSoapNote);

router.patch("/:consultationId", updateSoapNote);

module.exports = router;