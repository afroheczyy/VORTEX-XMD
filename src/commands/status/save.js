const automation = require("../../services/automation");

module.exports = {
    name: "save",

    aliases: [
        "savestatus",
        "statussave"
    ],

    description:
        "Save the replied WhatsApp Status",

    permission: "owner",

    async execute({ sock, message }) {
        const saved =
            await automation.saveStatus(
                sock,
                message
            );

        if (!saved) {
            return {
                text:
                    "❌ I couldn't save this status.\n\n" +
                    "Reply to an image, video, or audio status with:\n" +
                    ".save"
            };
        }

        return {
            text:
                "╭━━━〔 💾 STATUS SAVED 〕━━━╮\n" +
                "┃\n" +
                "┃ ✅ Status media saved successfully.\n" +
                "┃\n" +
                "┃ 📁 VORTEX status storage\n" +
                "┃ 🌀 Powered by Hector\n" +
                "┃\n" +
                "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
        };
    }
};
