const axios = require("axios");

const PROVIDER = process.env.AI_PROVIDER || "openai";
const MODEL = process.env.AI_MODEL || "gpt-6-luna";

async function askAI(prompt) {
    if (!prompt || !prompt.trim()) {
        throw new Error("Please provide a question.");
    }

    if (PROVIDER !== "openai") {
        throw new Error(`AI provider "${PROVIDER}" is not configured yet.`);
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY is not configured. Add your API key to .env first."
        );
    }

    const response = await axios.post(
        "https://api.openai.com/v1/responses",
        {
            model: MODEL,
            input: prompt
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            timeout: 60000
        }
    );

    return (
        response.data?.output_text ||
        "❌ AI returned an empty response."
    );
}

function getAIStatus() {
    return {
        provider: PROVIDER,
        model: MODEL,
        configured: Boolean(process.env.OPENAI_API_KEY)
    };
}

module.exports = {
    askAI,
    getAIStatus
};
