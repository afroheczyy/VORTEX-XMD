const { commandResponse } = require("../../utils/branding");
const voice = require("../../services/chatbot/voice");

module.exports = {
    name: "transcribe", aliases: ["stt", "totext"], category: "media",
    permission: "owner", description: "Turn a voice note into text.",
    usage: "Reply to a voice note with .transcribe",
    async execute(context) {
        if (!voice.hasKey()) return commandResponse("❌ Add GROQ_API_KEY (or set CHAT_PROVIDER=groq with CHAT_API_KEY).");
        const q = context.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || {};
        const a = q.audioMessage;
        if (!a) return commandResponse("🎙️ Reply to a voice note with .transcribe");
        try {
            const text = await voice.transcribe(await voice.download(a));
            return commandResponse(text ? `🎙️ *Transcript*\n\n${text}` : "❌ Couldn't hear anything in that.");
        } catch { return commandResponse("❌ Transcription failed."); }
    }
};
