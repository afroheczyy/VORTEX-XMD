const fs = require("fs");

const downloader =
    require("../../services/downloader");

module.exports = {
    name: "ytmp3",

    category: "download",

    aliases: [
        "song",
        "audio",
        "play"
    ],

    description:
        "Search and download music as MP3.",

    permission: "public",

    async execute({
        args,
        sock,
        remoteJid,
        message
    }) {
        const input =
            args.join(" ").trim();

        if (!input) {
            return {
                text:
                    "🎵 *VORTEX PLAY*\n\n" +
                    "Use:\n" +
                    ".play <song name>\n" +
                    ".song <song name>\n" +
                    ".ytmp3 <YouTube URL>\n\n" +
                    "Example:\n" +
                    ".play Calm Down"
            };
        }

        let media = null;

        try {
            media =
                await downloader.downloadAudio(
                    input
                );

            await sock.sendMessage(
                remoteJid,
                {
                    audio:
                        fs.readFileSync(
                            media.filePath
                        ),
                    mimetype:
                        "audio/mpeg",
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
                    "❌ *PLAY FAILED*\n\n" +
                    error.message
            };

        } finally {
            if (media) {
                media.cleanup();
            }
        }
    }
};
