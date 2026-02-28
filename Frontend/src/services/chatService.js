import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Send a message to the AI Assistant
 * @param {string} message - User message
 * @returns {Promise<string>} - AI response
 */
export const sendMessage = async (message) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/chat`,
            { message },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data.reply;
    } catch (error) {
        console.error('Chat Service Error:', error);
        throw new Error(error.response?.data?.message || 'Failed to get response from AI assistant');
    }
};

const chatService = {
    sendMessage
};

export default chatService;
