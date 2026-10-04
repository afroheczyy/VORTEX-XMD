const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "binary", aliases: ["bin"], category: "search",
    permission: "public", description: "Convert text to binary and back.",
    usage: ".binary encode Hi | .binary decode 01001000 01101001",
    async execute(context) {
        const [mode, ...rest] = context.args || [];
        const text = rest.join(" ").trim();
        const m = (mode || "").toLowerCase();
        if (!["encode", "decode"].includes(m) || !text)
            return commandResponse("💻 Usage:\n.binary encode Hi\n.binary decode 01001000 01101001");
        try {
            const out = m === "encode"
                ? Array.from(Buffer.from(text, "utf8")).map(b => b.toString(2).padStart(8, "0")).join(" ")
                : Buffer.from(text.split(/\s+/).map(b => parseInt(b, 2))).toString("utf8");
            return commandResponse(`💻 *${m}d*\n\n${out}`);
        } catch { return commandResponse("❌ Invalid input."); }
    }
};
