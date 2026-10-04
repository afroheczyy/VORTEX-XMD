const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "base64", aliases: ["b64"], category: "search",
    permission: "public", description: "Encode or decode Base64.",
    usage: ".base64 encode <text> | .base64 decode <text>",
    async execute(context) {
        const [mode, ...rest] = context.args || [];
        const text = rest.join(" ");
        if (!["encode", "decode"].includes((mode || "").toLowerCase()) || !text)
            return commandResponse("🔐 Usage:\n.base64 encode Hello\n.base64 decode SGVsbG8=");
        try {
            const out = mode.toLowerCase() === "encode"
                ? Buffer.from(text, "utf8").toString("base64")
                : Buffer.from(text, "base64").toString("utf8");
            return commandResponse(`🔐 *${mode.toLowerCase()}d*\n\n${out}`);
        } catch { return commandResponse("❌ Invalid input."); }
    }
};
