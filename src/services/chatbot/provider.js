const URLS = {
    openai: "https://api.openai.com/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    gemini: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    deepseek: "https://api.deepseek.com/chat/completions"
};

const provider = () => (process.env.CHAT_PROVIDER || "anthropic").toLowerCase();

function key() {
    const p = provider();
    return process.env.CHAT_API_KEY ||
        (p === "anthropic" ? process.env.ANTHROPIC_API_KEY : p === "openai" ? process.env.OPENAI_API_KEY : "") || "";
}

function hasKey() {
    const k = key();
    return !!k && !/your_key_here/i.test(k);
}

async function ask(system, history) {
    const p = provider();
    const k = key();
    try {
        if (p === "anthropic") {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "content-type": "application/json", "x-api-key": k, "anthropic-version": "2023-06-01" },
                body: JSON.stringify({
                    model: process.env.CHAT_MODEL || "claude-haiku-4-5-20251001",
                    max_tokens: 300, system, messages: history
                }),
                signal: AbortSignal.timeout(30000)
            });
            if (!res.ok) { console.log(`[VORTEX] Chatbot API error ${res.status} (anthropic)`); return ""; }
            const d = await res.json();
            return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
        }

        if (!URLS[p]) { console.log(`[VORTEX] Unknown CHAT_PROVIDER: ${p}`); return ""; }
        const model = process.env.CHAT_MODEL;
        if (!model) { console.log("[VORTEX] Set CHAT_MODEL for provider " + p); return ""; }

        const body = { model, messages: [{ role: "system", content: system }, ...history] };
        body[p === "openai" ? "max_completion_tokens" : "max_tokens"] = 400;

        const res = await fetch(URLS[p], {
            method: "POST",
            headers: { "content-type": "application/json", authorization: "Bearer " + k },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(30000)
        });
        if (!res.ok) { console.log(`[VORTEX] Chatbot API error ${res.status} (${p})`); return ""; }
        const d = await res.json();
        return String(d.choices?.[0]?.message?.content || "").trim();
    } catch (e) {
        console.log("[VORTEX] Chatbot provider failed: " + e.message);
        return "";
    }
}

module.exports = { ask, hasKey, provider };
