const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'c:/Users/Prash/linksync-ai/backend/.env' });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("Test");
    console.log(result.response.text());
  } catch (e) {
    console.error(e.message);
  }
}
run();
