const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'e:/Raguram/FINAL-YEAR-PROJECT/Backend/.env' });

const listModels = async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log('No models found:', data);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
};

listModels();
