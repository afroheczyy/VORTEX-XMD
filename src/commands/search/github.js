const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "github", aliases: ["gh", "ghuser"], category: "search",
    permission: "public", description: "Show a GitHub profile.",
    usage: ".github afroheczyy",
    async execute(context) {
        const u = (context.args?.[0] || "").trim().replace(/[^a-zA-Z0-9-]/g, "");
        if (!u) return commandResponse("🐙 Usage: .github afroheczyy");
        try {
            const r = await fetch(`https://api.github.com/users/${u}`,
                { headers: { "User-Agent": "VortexBot" }, signal: AbortSignal.timeout(10000) });
            if (!r.ok) throw new Error();
            const d = await r.json();
            const text = commandResponse(
`*🐙 ${d.name || d.login}*  (@${d.login})
${d.bio ? "_" + d.bio + "_\n" : ""}
📦 Repos     : ${d.public_repos}
👥 Followers : ${d.followers}
➡️ Following : ${d.following}
📍 ${d.location || "Unknown"}
🔗 ${d.html_url}`);
            await context.sock.sendMessage(context.remoteJid,
                { image: { url: d.avatar_url }, caption: text }, { quoted: context.message });
            return null;
        } catch { return commandResponse(`❌ No GitHub user "${u}".`); }
    }
};
