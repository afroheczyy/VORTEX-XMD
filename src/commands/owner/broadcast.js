const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "broadcast", aliases: ["bc"], category: "owner", permission: "owner",
    description: "Send a message to all groups.", usage: ".broadcast <message>",
    async execute(context) {
        const text = (context.args || []).join(" ").trim();
        if (!text) return commandResponse("📢 Usage: .broadcast Hello everyone");
        const groups = Object.keys(await context.sock.groupFetchAllParticipating());
        await context.sock.sendMessage(context.remoteJid,
            { text: `📢 Sending to ${groups.length} groups...` }, { quoted: context.message });
        let ok = 0;
        for (const g of groups) {
            try {
                await context.sock.sendMessage(g, { text: `📢 *VORTEX BROADCAST*\n\n${text}` });
                ok++;
            } catch {}
            await new Promise(r => setTimeout(r, 2500));
        }
        return commandResponse(`✅ Delivered to ${ok}/${groups.length} groups.`);
    }
};
