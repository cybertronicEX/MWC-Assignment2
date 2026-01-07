const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate tags and summary for a given content description/title.
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<{tags: string[], summary: string}>}
 */
const generateMetadata = async (title, description) => {
    try {
        const prompt = `
      Analyze the following document metadata and generate:
      1. A list of 3-5 relevant technical tags (lowercase).
      2. A concise 1-sentence summary (max 30 words).
      
      Title: "${title}"
      Description: "${description}"
      
      Return ONLY a valid JSON object in this format:
      {
        "tags": ["tag1", "tag2"],
        "summary": "The summary text."
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown if present (e.g. ```json ... ```)
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback if AI fails
        return { tags: [], summary: "AI metadata generation failed." };
    }
};

/**
 * recommend content based on user expertise and current context.
 * (Placeholder logic for now as vector search is out of scope for simple setup)
 */
const getRecommendations = async (userExpertise, contentTitle) => {
    // Advanced implementation would use embeddings.
    // Here we just mock or use a simple prompt if needed.
    return [];
};

module.exports = {
    generateMetadata,
    getRecommendations
};
