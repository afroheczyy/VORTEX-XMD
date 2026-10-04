const { commandResponse } = require("../../utils/branding");
const { getPack, setPack } = require("../../utils/stickerexif");

module.exports = {
    name: "setpack", aliases: ["packname", "stickerpack"], category: "media",
    permission: "owner", description: "Set the pack name and author on stickers.",
    usage: ".setpack VORTEX XMD | Hector",
    async execute(context) {
        const raw = (context.args || []).join(" ").trim();
        if (!raw) {
            const p = getPack();
            return commandResponse(`🏷️ *Sticker pack*\n\nPack   : ${p.pack}\nAuthor : ${p.author}\n\nChange: .setpack My Pack | My Name`);
        }
        const [pack, ...rest] = raw.split("|");
        const author = rest.join("|").trim() || getPack().author;
        setPack(pack.trim().slice(0, 40), author.slice(0, 40));
        return commandResponse(`✅ New stickers will show:\nPack   : ${pack.trim()}\nAuthor : ${author}`);
    }
};
