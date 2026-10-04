const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { commandResponse } = require("../../utils/branding");

async function getMedia(context) {
    const baileys = await import("@whiskeysockets/baileys");
    const msg = context.message?.message || {};
    const quoted =
        msg.extendedTextMessage?.contextInfo?.quotedMessage || {};

    const node =
        msg.imageMessage || msg.videoMessage ||
        quoted.imageMessage || quoted.videoMessage;

    if (!node) return null;

    const isVideo = !!(msg.videoMessage || quoted.videoMessage);
    const stream = await baileys.downloadContentFromMessage(
        node,
        isVideo ? "video" : "image"
    );

    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return { buffer: Buffer.concat(chunks), isVideo };
}

function toWebp(input, output, isVideo) {
    const vf =
        "scale=512:512:force_original_aspect_ratio=decrease," +
        "format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    const args = ["-y", "-i", input];
    if (isVideo) args.push("-t", "8", "-r", "15");
    args.push(
        "-vf", vf, "-c:v", "libwebp", "-quality", "60",
        "-loop", "0", "-an", "-fs", "900000", output
    );

    return new Promise((resolve, reject) =>
        execFile("ffmpeg", args, err => (err ? reject(err) : resolve()))
    );
}

module.exports = {
    name: "sticker",
    aliases: ["s", "stk"],
    category: "media",
    permission: "public",
    description: "Turn an image or short video into a sticker.",
    usage: "Reply to an image/video with .sticker",

    async execute(context) {
        let media;
        try {
            media = await getMedia(context);
        } catch (e) {
            return commandResponse("❌ Could not download that media.");
        }

        if (!media) {
            return commandResponse(
`╭━━━〔 🎨 VORTEX STICKER 〕━━━╮
┃
┃  Reply to an image or short
┃  video with .sticker
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const id = Date.now();
        const inFile = path.join(os.tmpdir(), `stk-${id}.${media.isVideo ? "mp4" : "jpg"}`);
        const outFile = path.join(os.tmpdir(), `stk-${id}.webp`);

        try {
            fs.writeFileSync(inFile, media.buffer);
            await toWebp(inFile, outFile, media.isVideo);

            await context.sock.sendMessage(
                context.remoteJid,
                { sticker: require("../../utils/stickerexif").addExif(fs.readFileSync(outFile)) },
                { quoted: context.message }
            );
            return null;
        } catch (e) {
            return commandResponse("❌ Sticker conversion failed.");
        } finally {
            for (const f of [inFile, outFile]) fs.rmSync(f, { force: true });
        }
    }
};
