const express = require("express");

const {
  createConsultation,
  getMyConsultations,
  getConsultationById,
} = require("../controllers/consultationController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createConsultation);
router.get("/", getMyConsultations);
router.get("/:id", getConsultationById);

module.exports = router;