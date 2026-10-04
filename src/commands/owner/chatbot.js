const { commandResponse } = require("../../utils/branding");
const bot = require("../../services/chatbot");

module.exports = {
    name: "chatbot", aliases: ["cb", "away"], category: "owner",
    permission: "owner", description: "Chat like you while you're away.",
    usage: ".chatbot on|off|dms|voice|persona|clear|status",
    async execute(context) {
        const [sub, ...rest] = context.args || [];
        const db = bot.load();
        const jid = context.remoteJid;
        const flag = (rest[0] || "").toLowerCase();

        switch ((sub || "status").toLowerCase()) {
            case "on":
                db.muted = db.muted.filter(j => j !== jid);
                if (!db.enabled.includes(jid)) db.enabled.push(jid);
                bot.save(db);
                return commandResponse("🤖 Chatbot *ON* in this chat." +
                    (context.isGroup ? "\nIn groups I only answer when mentioned or replied to." : ""));
            case "off":
                db.enabled = db.enabled.filter(j => j !== jid);
                if (!db.muted.includes(jid)) db.muted.push(jid);
                bot.save(db);
                bot.clearHistory(jid);
                return commandResponse("🤖 Chatbot *OFF* in this chat.");
            case "dms":
                db.allDMs = flag === "on";
                bot.save(db);
                return commandResponse(`📩 All private chats: *${db.allDMs ? "ON" : "OFF"}*\n(Groups are never included. Use .chatbot off inside any chat to exclude it.)`);
            case "voice":
                db.voice = flag === "on";
                if (rest[1]) db.lang = rest[1].toLowerCase();
                bot.save(db);
                return commandResponse(`🎙️ Voice notes: *${db.voice ? "ON" : "OFF"}* (language: ${db.lang})`);
            case "persona": {
                const p = rest.join(" ").trim();
                if (!p) return commandResponse("🎭 Usage: .chatbot persona <how you text>\nReset: .chatbot persona reset");
                db.persona = p.toLowerCase() === "reset" ? bot.DEFAULT_PERSONA : p.slice(0, 1500);
                bot.save(db);
                bot.clearHistory();
                return commandResponse("✅ Persona updated.");
            }
            case "clear":
                bot.clearHistory(jid);
                return commandResponse("🧹 Memory for this chat cleared.");
            default:
                return commandResponse(
`🤖 *Chatbot status*

This chat : ${db.enabled.includes(jid) ? "ON ✅" : "OFF ❌"}
All DMs   : ${db.allDMs ? "ON ✅" : "OFF ❌"}
Voice     : ${db.voice ? "ON ✅" : "OFF ❌"}
Chats on  : ${db.enabled.length}
API key   : ${require("../../services/chatbot/provider").hasKey() ? "set ✅" : "missing ❌"}

.chatbot on | off | dms on | voice on | persona <text> | clear`);
        }
    }
};
