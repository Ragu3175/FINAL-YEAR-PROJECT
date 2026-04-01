const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Initialize Groq API
const groqApiKey = process.env.GROQ_API_KEY;
const groqModelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

console.log('Gemini API Key Status:', geminiApiKey ? `Present (${geminiApiKey.substring(0, 8)}...)` : 'MISSING');
console.log('Groq API Key Status:', groqApiKey ? `Present (${groqApiKey.substring(0, 8)}...)` : 'MISSING');

// Startup Diagnostic Test
(async () => {
    // Test Groq
    if (groq) {
        try {
            await groq.chat.completions.create({
                messages: [{ role: 'user', content: 'test' }],
                model: groqModelName
            });
            console.log(`✅ AI Service: Groq Connection Verified (${groqModelName})`);
        } catch (error) {
            console.error('❌ AI Service: Groq Startup test failed:', error.message);
        }
    }
    
    // Test Gemini
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: geminiModelName });
            await model.generateContent("test");
            console.log(`✅ AI Service: Gemini Connection Verified (${geminiModelName})`);
        } catch (error) {
            console.error('❌ AI Service: Gemini Startup test failed:', error.message);
        }
    }
})();

/**
 * Generate a response using AI (Primary: Groq, Fallback: Gemini)
 */
const generateResponse = async (userPrompt, dashboardContext = null, dbHistoryContext = null) => {
    try {
        let finalContext = '';
        const readmePath = path.join(__dirname, '../../../README.md');
        if (fs.existsSync(readmePath)) {
            finalContext = fs.readFileSync(readmePath, 'utf8');
        }

        const fullSystemPrompt = `System: You are SafeDrive AI Assistant, a helpful AI integrated into the SafeDrive AI project.
Your goal is to help users understand the project, its features, and monitor live vehicle telemetry.

CRITICAL PROJECT CONTEXT:
${finalContext}

---

LIVE DASHBOARD CONTEXT (Current real-time data visible to user):
${dashboardContext ? JSON.stringify(dashboardContext, null, 2) : 'No live data available currently.'}

---

DATABASE HISTORY CONTEXT (Recent violations and history for querying):
${dbHistoryContext || 'No recent history found.'}

---

GUIDELINES:
1. Be concise, professional, and friendly.
2. If a user asks about their current speed, sensor readings, or status, refer strictly to the LIVE DASHBOARD CONTEXT.
3. If they ask about past history, previous violations, refer strictly to the DATABASE HISTORY CONTEXT.
4. If you don't know the answer based on the context, politely say so.
5. Use markdown for better readability.`;

        console.log('Generating AI Response for prompt...');

        // Try Groq First
        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: fullSystemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    model: groqModelName
                });
                return completion.choices[0].message.content;
            } catch (err) {
                console.warn('⚠️ Groq generation failed, falling back to Gemini...', err.message);
            }
        }

        // Fallback to Gemini
        if (genAI) {
            const model = genAI.getGenerativeModel({ model: geminiModelName });
            const combinedPrompt = `${fullSystemPrompt}\n\nUser Question: ${userPrompt}`;
            const result = await model.generateContent(combinedPrompt);
            const response = await result.response;
            return response.text();
        }

        throw new Error("No AI providers configured or available.");
    } catch (error) {
        console.error('CRITICAL: AI Service Error:', error);
        throw new Error(`AI Assistant Error: ${error.message}`);
    }
};

module.exports = {
    generateResponse
};
