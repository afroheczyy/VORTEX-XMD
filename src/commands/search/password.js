const crypto = require("crypto");
const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "password", aliases: ["genpass", "pass"], category: "search",
    permission: "public", description: "Generate a strong random password.",
    usage: ".password [length]",
    async execute(context) {
        const len = Math.min(64, Math.max(8, parseInt(context.args?.[0]) || 16));
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
        let pw = "";
        for (let i = 0; i < len; i++) pw += chars[crypto.randomInt(chars.length)];
        return commandResponse(`🔐 *Password (${len})*\n\n\`${pw}\`\n\n⚠️ Use this in a private chat only.`);
    }
};
