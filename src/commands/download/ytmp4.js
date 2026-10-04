const fs = require("fs");

const downloader =
    require("../../services/downloader");

module.exports = {
    name: "ytmp4",
    category: "download",

    aliases: [
        "video",
        "ytvideo"
    ],

    description:
        "Download video from a supported URL.",

    permission: "public",

    async execute({
        args,
        sock,
        remoteJid,
        message
    }) {
        const url =
            args[0];

        if (!url) {
            return {
                text:
                    "🎬 *VORTEX YTMP4*\n\n" +
                    "Use:\n" +
                    ".ytmp4 <URL>\n\n" +
                    "Example:\n" +
                    ".ytmp4 https://..."
            };
        }

        let media = null;

        try {
            media =
                await downloader.downloadVideo(
                    url
                );

            await sock.sendMessage(
                remoteJid,
                {
                    video:
                        fs.readFileSync(
                            media.filePath
                        ),
                    mimetype: "video/mp4",
                    fileName:
                        `${media.title}.mp4`
                },
                {
                    quoted: message
                }
            );

            return null;

        } catch (error) {
            return {
                text:
                    "❌ *YTMP4 FAILED*\n\n" +
                    error.message
            };

        } finally {
            if (media) {
                media.cleanup();
            }
        }
    }
};
