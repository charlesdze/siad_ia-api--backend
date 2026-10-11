const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the simple SDK, it's usually in the generative model service.
    // But we can try to initialize one and see.
    console.log("Checking model...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}

run();
