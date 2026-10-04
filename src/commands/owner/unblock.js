const { commandResponse } = require("../../utils/branding");
const { getTarget } = require("../../utils/target");
module.exports = {
    name: "unblock", aliases: [], category: "owner", permission: "owner",
    description: "Unblock a user.", usage: ".unblock @user | reply | number",
    async execute(context) {
        const t = getTarget(context);
        if (!t) return commandResponse("✅ Usage: .unblock 233XXXXXXXXX");
        try {
            await context.sock.updateBlockStatus(t, "unblock");
            return commandResponse(`✅ Unblocked @${t.split("@")[0]}`);
        } catch { return commandResponse("❌ Couldn't unblock that user."); }
    }
};
