const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "wordcount", aliases: ["wc", "count"], category: "search",
    permission: "public", description: "Count words and characters.",
    usage: ".wordcount <text> (or reply to a message)",
    async execute(context) {
        let t = (context.args || []).join(" ").trim();
        if (!t) {
            const q = context.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            t = q?.conversation || q?.extendedTextMessage?.text || "";
        }
        if (!t) return commandResponse("🔢 Usage: .wordcount your text here");
        const words = t.split(/\s+/).filter(Boolean).length;
        return commandResponse(`🔢 *Count*\n\nWords      : ${words}\nCharacters : ${t.length}\nNo spaces  : ${t.replace(/\s/g, "").length}`);
    }
};
