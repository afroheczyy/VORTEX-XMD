const { commandResponse } = require("../../utils/branding");
const { getTarget, isSelf } = require("../../utils/target");
module.exports = {
    name: "block", aliases: [], category: "owner", permission: "owner",
    description: "Block a user.", usage: ".block @user | reply | number",
    async execute(context) {
        const t = getTarget(context);
        if (!t) return commandResponse("🚫 Usage: .block 233XXXXXXXXX\n(or mention / reply to someone)");
        if (isSelf(context.sock, t)) return commandResponse("❌ You can't block yourself.");
        try {
            await context.sock.updateBlockStatus(t, "block");
            return commandResponse(`🚫 Blocked @${t.split("@")[0]}`);
        } catch { return commandResponse("❌ Couldn't block that user."); }
    }
};
