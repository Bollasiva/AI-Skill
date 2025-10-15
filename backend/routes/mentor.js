const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getChatResponse } = require("../controllers/mentorController");

// @route   POST /api/mentor/chat
// @desc    Send a message to the AI mentor and get a response
// @access  Private
router.post("/chat", auth, getChatResponse);

module.exports = router;
