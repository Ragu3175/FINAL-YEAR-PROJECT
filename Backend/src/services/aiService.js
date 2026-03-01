const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key Status:', apiKey ? `Present (${apiKey.substring(0, 8)}...)` : 'MISSING');
const genAI = new GoogleGenerativeAI(apiKey);

// Startup Diagnostic Test
(async () => {
    if (!apiKey) return;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent("test");
        console.log('✅ AI Service: Gemini Connection Verified');
    } catch (error) {
        console.error('❌ AI Service: Startup test failed:', error.message);
        if (error.message.includes('404')) {
            console.error('   TIP: This 404 usually means the API is not enabled for this key or the model name is restricted.');
        }
    }
})();

/**
 * Generate a response using Gemini AI
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
            model: "gemini-1.5-flash"
        });

        const fullPrompt = `System: You are SafeDrive AI Assistant, a helpful AI integrated into the SafeDrive AI project.
      Your goal is to help users understand the project, its features, and how it works.
      
      CRITICAL CONTEXT ABOUT THE PROJECT:
      ${finalContext}
      
      GUIDELINES:
      1. Be concise, professional, and friendly.
      2. If a user asks about features, sensors, or tech stack, refer to the provided context.
      3. If you don't know the answer based on the context, politely say so.
      4. Use markdown for better readability.
      
      User Question: ${userPrompt}`;

        console.log('Generating AI Response with prompt length:', fullPrompt.length);
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error('CRITICAL: AI Service Error:', error);
        throw new Error(`AI Assistant Error: ${error.message}`);
    }
};

module.exports = {
    generateResponse
};
