const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const DB = path.join(__dirname, "../../../database");

module.exports = {
    name: "backup", aliases: ["savecreds"], category: "owner",
    permission: "owner", description: "Send your login and settings to your DM.",
    usage: ".backup",
    async execute(context) {
        const me = String(context.sock.user?.id || "").replace(/:\d+(?=@)/, "");
        const files = [path.join(DB, "session", "creds.json")]
            .concat(fs.existsSync(DB)
                ? fs.readdirSync(DB).filter(f => f.endsWith(".json")).map(f => path.join(DB, f))
                : [])
            .filter(f => fs.existsSync(f));
        if (!files.length) return commandResponse("❌ Nothing to back up.");
        for (const f of files) {
            await context.sock.sendMessage(me, {
                document: fs.readFileSync(f),
                mimetype: "application/json",
                fileName: path.basename(f)
            });
        }
        return commandResponse(`✅ Sent ${files.length} file(s) to your DM.\n⚠️ creds.json is your login. Keep it private and never forward it.`);
    }
};
