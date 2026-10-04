const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "shorten", aliases: ["short", "tinyurl"], category: "search",
    permission: "public", description: "Shorten a long link.",
    usage: ".shorten <link>",
    async execute(context) {
        const link = (context.args?.[0] || "").trim();
        if (!/^https?:\/\//i.test(link)) return commandResponse("🔗 Usage: .shorten https://example.com/very/long/link");
        try {
            const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`,
                { signal: AbortSignal.timeout(10000) });
            const out = (await r.text()).trim();
            if (!out.startsWith("http")) throw new Error();
            return commandResponse(`🔗 *Short link*\n\n${out}`);
        } catch { return commandResponse("❌ Couldn't shorten that link."); }
    }
};
