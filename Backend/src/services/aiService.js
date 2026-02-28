const { GoogleGenerativeAI } = require('@google-generative-ai/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Service to handle AI interactions using Gemini
 */
const generateResponse = async (userPrompt, projectContext = '') => {
    try {
        // If no context provided, try to read README.md
        let finalContext = projectContext;
        if (!finalContext) {
            const readmePath = path.join(__dirname, '../../../README.md');
            if (fs.existsSync(readmePath)) {
                finalContext = fs.readFileSync(readmePath, 'utf8');
            }
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are SafeDrive AI Assistant, a helpful AI integrated into the SafeDrive AI project.
      Your goal is to help users understand the project, its features, and how it works.
      
      CRITICAL CONTEXT ABOUT THE PROJECT:
      ${finalContext}
      
      GUIDELINES:
      1. Be concise, professional, and friendly.
      2. If a user asks about features, sensors, or tech stack, refer to the provided context.
      3. If you don't know the answer based on the context, politely say so and offer to help with general project-related questions.
      4. Do not make up information that isn't in the context for specific project details.
      5. Use markdown for better readability (bolding, lists, etc.).`
        });

        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in AI Service:', error);
        throw new Error('Failed to generate AI response. Make sure your GEMINI_API_KEY is valid.');
    }
};

module.exports = {
    generateResponse
};
