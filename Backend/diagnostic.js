const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'e:/Raguram/FINAL-YEAR-PROJECT/Backend/.env' });

const listModels = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log('Testing with key:', key ? key.substring(0, 5) + '...' : 'MISSING');

    if (!key) {
        console.error('GEMINI_API_KEY is not defined in .env');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // We use a low-level fetch or the SDK's internal ability if possible
        // The SDK doesn't have a direct listModels helper that's easy to use without the client
        // But we can try to initialize different models

        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`✅ Model ${modelName} is AVAILABLE`);
            } catch (e) {
                console.log(`❌ Model ${modelName} FAILED: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Diagnostic Error:', error);
    }
};

listModels();
