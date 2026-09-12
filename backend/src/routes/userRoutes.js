const express = require("express");

const {
  createUser,
  getAllUsers,
  getUserById,
  getCurrentUser,
} = require("../controllers/userController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);

router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;