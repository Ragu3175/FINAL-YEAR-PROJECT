const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/chat
 * Send a message to the AI Assistant
 */
router.post('/', authMiddleware, chatController.sendMessage);

module.exports = router;
