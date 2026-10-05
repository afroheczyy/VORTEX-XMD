const fs = require("fs");

const downloader =
    require("../../services/downloader");

module.exports = {
    name: "ytmp4",

    category: "download",

    aliases: [
        "ytvideo"
    ],

    description:
        "Search and download YouTube video as MP4.",

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
                    "🎬 *VORTEX VIDEO*\n\n" +
                    "Use:\n" +
                    ".video <video name>\n" +
                    ".ytmp4 <YouTube URL>\n\n" +
                    "Example:\n" +
                    ".video Calm Down\n\n" +
                    "Quality:\n" +
                    ".video Calm Down 720"
            };
        }

        let quality = 720;

        const last =
            args[args.length - 1];

        if (
            ["360", "480", "720"]
                .includes(last)
        ) {
            quality =
                Number(last);
        }

        const query =
            (
                ["360", "480", "720"]
                    .includes(last)
                    ? args.slice(0, -1)
                    : args
            ).join(" ").trim();

        let media = null;

        try {
            media =
                await downloader.downloadVideo(
                    query,
                    quality
                );

            await sock.sendMessage(
                remoteJid,
                {
                    video:
                        fs.readFileSync(
                            media.filePath
                        ),
                    mimetype:
                        "video/mp4",
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
                    "❌ *VIDEO FAILED*\n\n" +
                    error.message
            };

        } finally {
            if (media) {
                media.cleanup();
            }
        }
    }
};
