const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors()); 
app.use(express.json());

// Initialize Gemini AI with your key from the .env file
const apiKey = process.env.GEMINI_API_KEY || ""; 
const genAI = new GoogleGenerativeAI(apiKey);

async function generateWithRetry(model, prompt, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            const errorMessage = err.message || "";
            // Fail fast for authentication, not found, or quota exceeded errors
            if (errorMessage.includes("403") || errorMessage.includes("404") || errorMessage.includes("429") || errorMessage.includes("quota")) {
                throw err;
            }
            if (i === retries - 1) throw err;
            const delay = Math.pow(2, i) * 1000;
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

// Endpoint to handle AI synchronization requests
app.post('/api/sync', async (req, res) => {
    const { text, type, role } = req.body;

    if (!text || !type || !role) {
        return res.status(400).json({ error: "Missing parameters: text, type, and role are required." });
    }

    try {
        // Using gemini-2.5-flash which is confirmed supported by the user's API key region
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = "";
        switch (type) {
            case 'bio':
                prompt = `Act as a Professional LinkedIn Profile Architect. The target role is ${role}. Transform the following raw user data into a high-impact, story-driven "About" section: ${text}`;
                break;
            case 'head':
                prompt = `Act as a Tech Recruiter. Create ONE powerful 220-character LinkedIn headline for a ${role} using skills derived from: ${text}. Use pipes (|) to separate key skill areas.`;
                break;
            case 'skill':
                prompt = `Act as a Career Mentor. For someone targeting a ${role} position, identify 3 specific technical skill gaps and 2 recommended certifications based on this profile data: ${text}`;
                break;
            case 'post':
                prompt = `Act as a Social Media Manager. Write an engaging LinkedIn professional update for a ${role} based on this information: ${text}. Include 3 relevant industry hashtags.`;
                break;
            default:
                return res.status(400).json({ error: "Invalid synchronization type provided." });
        }

        const output = await generateWithRetry(model, prompt);
        res.json({ success: true, data: output });

    } catch (error) {
        console.error("AI Server Error:", error);
        res.status(500).json({ error: "The AI engine failed to process the request. Check your API key and connection." });
    }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 LinkSync Backend active at http://localhost:${PORT}`);
        console.log(`Ready to process AI requests for your 3D Frontend.`);
    });
}

// Export for Vercel serverless function
module.exports = app;