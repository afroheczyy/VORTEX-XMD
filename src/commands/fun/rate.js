const crypto = require("crypto");
const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "rate", aliases: ["rating"], category: "fun",
    permission: "public", description: "Rate anything out of 100.",
    usage: ".rate my cooking",
    async execute(context) {
        const thing = (context.args || []).join(" ").trim();
        if (!thing) return commandResponse("⭐ Usage: .rate my cooking");
        const pct = crypto.createHash("md5").update(thing.toLowerCase()).digest()[0] % 101;
        return commandResponse(`⭐ *Rating*\n\n"${thing}"\n\nScore: *${pct}/100*`);
    }
};
