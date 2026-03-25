const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found.");
    process.exit(1);
}

const https = require('https');
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            if (parsedData.models) {
                const supportedModels = parsedData.models
                    .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name);
                console.log("Available models for generateContent:");
                console.log(supportedModels.join('\\n'));
            } else {
                console.log(parsedData);
            }
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
