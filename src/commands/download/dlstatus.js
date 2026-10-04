const downloader =
    require("../../services/downloader");

module.exports = {
    name: "dlstatus",
    category: "download",

    aliases: [
        "downloader",
        "downloadstatus"
    ],

    description:
        "Show VORTEX downloader status.",

    permission: "public",

    async execute() {
        const version =
            await downloader.getVersion();

        downloader.cleanupOldDownloads();

        return {
            text:
                "╭━━━〔 📥 VORTEX DOWNLOADER 〕━━━╮\n" +
                "┃\n" +
                `┃ Engine  : ${version ? "🟢 ONLINE" : "🔴 OFFLINE"}\n` +
                `┃ yt-dlp  : ${version || "NOT FOUND"}\n` +
                "┃ FFmpeg  : 🟢 REQUIRED ENGINE\n" +
                `┃ Limit   : ${downloader.MAX_SIZE_MB}MB\n` +
                "┃\n" +
                "┣━━〔 COMMANDS 〕━━\n" +
                "┃ .ytmp3 <URL>\n" +
                "┃ .ytmp4 <URL>\n" +
                "┃ .song <URL>\n" +
                "┃ .video <URL>\n" +
                "┃\n" +
                "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
        };
    }
};
