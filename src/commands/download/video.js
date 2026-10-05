const fs = require("fs");
const { commandResponse } = require("../../utils/branding");
const api = require("../../services/mediaapi");

const cool = new Map();
const MAX_MIN = Number(process.env.MEDIA_MAX_VIDEO_MIN) || 12;
const isYT = v => /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(v);

module.exports = {
    name: "video", aliases: ["vid"], category: "download",
    permission: "public", description: "Search a video and send it (360p by default).",
    usage: ".video funny cat   or   .video 720 funny cat",
    async execute(context) {
        let args = [...(context.args || [])];
        let quality = "360";
        if (["360", "480", "720"].includes(args[0])) quality = args.shift();
        const q = args.join(" ").trim();
        if (!q) return commandResponse("🎬 Usage: .video funny cat\nQuality: .video 720 funny cat (360, 480 or 720)");
        const who = String(context.sender || context.remoteJid);
        if (Date.now() - (cool.get(who) || 0) < 20000) return commandResponse("⏳ Wait a few seconds between downloads.");
        cool.set(who, Date.now());
        if (cool.size > 500) cool.clear();

        const { sock, remoteJid, message } = context;
        let file;
        try {
            let url, pick = null;
            if (isYT(q)) {
                url = q.startsWith("http") ? q : "https://" + q;
                await sock.sendMessage(remoteJid, { text: `🎬 Downloading ${quality}p...` }, { quoted: message });
            } else {
                const results = await api.search(q);
                pick = results[0];
                if (!pick) return commandResponse(`❌ Nothing found for "${q}".`);
                if (pick.seconds > MAX_MIN * 60) return commandResponse(`❌ That one is ${pick.duration}. The limit is ${MAX_MIN} min.`);
                url = pick.url;
                const caption = `*🎬 ${pick.title}*\n\n👤 ${pick.author || "Unknown"}\n⏱️ ${pick.duration}\n📺 ${quality}p\n\n_Downloading..._`;
                try { await sock.sendMessage(remoteJid, { image: { url: pick.thumbnail }, caption }, { quoted: message }); }
                catch { await sock.sendMessage(remoteJid, { text: caption }, { quoted: message }); }
            }
            const dl = await api.download("video", { url, quality });
            file = dl.file;
            const title = (pick ? pick.title : "vortex-video").replace(/[^\w\s.-]/g, "").trim().slice(0, 60) || "video";
            if (dl.size > 16 * 1048576) {
                await sock.sendMessage(remoteJid, { document: { url: file }, mimetype: "video/mp4", fileName: title + ".mp4" }, { quoted: message });
            } else {
                await sock.sendMessage(remoteJid, { video: { url: file }, caption: "🎬 " + title }, { quoted: message });
            }
            return null;
        } catch (e) {
            return commandResponse("❌ " + String(e.message).slice(0, 160));
        } finally {
            if (file) fs.rmSync(file, { force: true });
        }
    }
};
