const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "toimg",
    aliases: ["toimage", "unsticker"],
    category: "media",
    permission: "public",
    description: "Turn a sticker back into an image.",
    usage: "Reply to a sticker with .toimg",

    async execute(context) {
        const quoted =
            context.message?.message?.extendedTextMessage
                ?.contextInfo?.quotedMessage;

        const node = quoted?.stickerMessage;
        if (!node) {
            return commandResponse("❌ Reply to a sticker with .toimg");
        }

        const id = Date.now();
        const inFile = path.join(os.tmpdir(), `img-${id}.webp`);
        const outFile = path.join(os.tmpdir(), `img-${id}.png`);

        try {
            const baileys = await import("@whiskeysockets/baileys");
            const stream = await baileys.downloadContentFromMessage(node, "sticker");
            const chunks = [];
            for await (const c of stream) chunks.push(c);
            fs.writeFileSync(inFile, Buffer.concat(chunks));

            await new Promise((res, rej) =>
                execFile("ffmpeg", ["-y", "-i", inFile, "-frames:v", "1", outFile],
                    err => (err ? rej(err) : res()))
            );

            await context.sock.sendMessage(
                context.remoteJid,
                { image: fs.readFileSync(outFile), caption: "🖼️ Done" },
                { quoted: context.message }
            );
            return null;
        } catch (e) {
            return commandResponse("❌ Conversion failed.");
        } finally {
            for (const f of [inFile, outFile]) fs.rmSync(f, { force: true });
        }
    }
};
