const aiService = require('../services/aiService');

/**
 * Chat Controller
 */
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Optional: Get user role/name for personalization if needed
        // const userName = req.user?.name || 'User';

        const response = await aiService.generateResponse(message);

        res.status(200).json({
            success: true,
            reply: response
        });
    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error in chat assistant'
        });
    }
};

module.exports = {
    sendMessage
};
