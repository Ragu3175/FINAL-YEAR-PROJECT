const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'e:/Raguram/FINAL-YEAR-PROJECT/Backend/.env' });

const finalTest = async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("hi");
            const response = await result.response;
            if (response.text()) {
                console.log(`WORKING_MODEL:${modelName}`);
                return;
            }
        } catch (e) {
            console.log(`MODEL_FAILED:${modelName}`);
            console.log(`ERROR_DETAILS:${e.message}`);
            if (e.stack) console.log(e.stack);
        }
    }
    console.log("NO_WORKING_MODELS");
};

finalTest();
