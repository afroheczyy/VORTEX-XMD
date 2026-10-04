const fs = require("fs");

const downloader =
    require("../../services/downloader");

module.exports = {
    name: "ytmp3",

    aliases: [
        "song",
        "audio"
    ],

    description:
        "Download audio from a supported URL.",

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
                    "🎵 *VORTEX YTMP3*\n\n" +
                    "Use:\n" +
                    ".ytmp3 <URL>\n\n" +
                    "Example:\n" +
                    ".ytmp3 https://..."
            };
        }

        let media = null;

        try {
            media =
                await downloader.downloadAudio(
                    url
                );

            await sock.sendMessage(
                remoteJid,
                {
                    audio:
                        fs.readFileSync(
                            media.filePath
                        ),
                    mimetype: "audio/mpeg",
                    fileName:
                        `${media.title}.mp3`
                },
                {
                    quoted: message
                }
            );

            return null;

        } catch (error) {
            return {
                text:
                    "❌ *YTMP3 FAILED*\n\n" +
                    error.message
            };

        } finally {
            if (media) {
                media.cleanup();
            }
        }
    }
};
