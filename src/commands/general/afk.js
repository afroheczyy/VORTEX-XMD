const { commandResponse } = require("../../utils/branding");
const afk = require("../../services/afk");

module.exports = {
    name: "afk", aliases: ["away"], category: "general",
    permission: "public", description: "Set yourself away. People who tag you get told.",
    usage: ".afk gone to eat",
    async execute(context) {
        const reason = (context.args || []).join(" ").trim().slice(0, 100) || "Away";
        afk.set(context.message, context.sock, reason);
        return commandResponse(`💤 You are now AFK\n📝 ${reason}\n\nSend any message to come back.`);
    }
};
