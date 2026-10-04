const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "groups", aliases: ["grouplist", "mygroups"], category: "owner",
    permission: "owner", description: "List the groups the bot is in.",
    usage: ".groups",
    async execute(context) {
        try {
            const all = Object.values(await context.sock.groupFetchAllParticipating());
            const lines = all.slice(0, 40).map((g, i) => `${i + 1}. ${g.subject} (${g.participants.length})`);
            const more = all.length > 40 ? `\n…and ${all.length - 40} more` : "";
            return commandResponse(`👥 *Groups: ${all.length}*\n\n${lines.join("\n")}${more}`);
        } catch { return commandResponse("❌ Couldn't fetch the groups."); }
    }
};
