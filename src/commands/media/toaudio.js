const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "toaudio", aliases: ["tomp3", "mp3"], category: "media",
    permission: "public", description: "Convert a video to audio.",
    usage: "Reply to a video with .toaudio",
    async execute(context) {
        const q = context.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || {};
        const m = context.message?.message || {};
        const node = q.videoMessage || q.audioMessage || m.videoMessage;
        if (!node) return commandResponse("🎵 Reply to a video with .toaudio");
        const id = Date.now();
        const inF = path.join(os.tmpdir(), `ta-${id}.mp4`);
        const outF = path.join(os.tmpdir(), `ta-${id}.mp3`);
        try {
            const b = await import("@whiskeysockets/baileys");
            const stream = await b.downloadContentFromMessage(node, node.mimetype?.startsWith("audio") ? "audio" : "video");
            const chunks = [];
            for await (const c of stream) chunks.push(c);
            fs.writeFileSync(inF, Buffer.concat(chunks));
            await new Promise((res, rej) =>
                execFile("ffmpeg", ["-y", "-i", inF, "-vn", "-acodec", "libmp3lame", "-q:a", "4", outF],
                    e => (e ? rej(e) : res())));
            await context.sock.sendMessage(context.remoteJid,
                { audio: fs.readFileSync(outF), mimetype: "audio/mpeg" }, { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ Conversion failed."); }
        finally { for (const f of [inF, outF]) fs.rmSync(f, { force: true }); }
    }
};
