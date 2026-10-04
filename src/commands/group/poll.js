const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "poll", aliases: ["vote"], category: "group",
    permission: "admin", description: "Create a poll.",
    usage: ".poll Question | Option 1 | Option 2",
    async execute(context) {
        const parts = (context.args || []).join(" ").split("|").map(s => s.trim()).filter(Boolean);
        if (parts.length < 3)
            return commandResponse("📊 Usage:\n.poll Best food? | Jollof | Waakye | Fufu");
        const [name, ...values] = parts;
        try {
            await context.sock.sendMessage(context.remoteJid, {
                poll: { name: name.slice(0, 100), values: values.slice(0, 12), selectableCount: 1 }
            });
            return null;
        } catch { return commandResponse("❌ Couldn't create the poll."); }
    }
};
