const fs = require("fs");
const { commandResponse } = require("../../utils/branding");
const api = require("../../services/mediaapi");

const cool = new Map();
const MAX_MIN = Number(process.env.MEDIA_MAX_MIN) || 20;
const isYT = v => /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(v);

module.exports = {
    name: "play", aliases: ["song", "music"], category: "download",
    permission: "public", description: "Search a song and send it as audio.",
    usage: ".play burna boy last last",
    async execute(context) {
        const q = (context.args || []).join(" ").trim();
        if (!q) return commandResponse("🎵 Usage: .play song name\nor .play https://youtu.be/...");
        const who = String(context.sender || context.remoteJid);
        if (Date.now() - (cool.get(who) || 0) < 15000) return commandResponse("⏳ Wait a few seconds between downloads.");
        cool.set(who, Date.now());
        if (cool.size > 500) cool.clear();

        const { sock, remoteJid, message } = context;
        let file;
        try {
            let url, pick = null;
            if (isYT(q)) {
                url = q.startsWith("http") ? q : "https://" + q;
                await sock.sendMessage(remoteJid, { text: "🎵 Downloading..." }, { quoted: message });
            } else {
                const results = await api.search(q);
                pick = results[0];
                if (!pick) return commandResponse(`❌ Nothing found for "${q}".`);
                if (pick.seconds > MAX_MIN * 60) return commandResponse(`❌ That one is ${pick.duration}. The limit is ${MAX_MIN} min.`);
                url = pick.url;
                const caption = `*🎵 ${pick.title}*\n\n👤 ${pick.author || "Unknown"}\n⏱️ ${pick.duration}\n👁️ ${Number(pick.views || 0).toLocaleString()} views\n\n_Downloading..._`;
                try { await sock.sendMessage(remoteJid, { image: { url: pick.thumbnail }, caption }, { quoted: message }); }
                catch { await sock.sendMessage(remoteJid, { text: caption }, { quoted: message }); }
            }
            const dl = await api.download("music", { url });
            file = dl.file;
            const name = (pick ? pick.title : "vortex-audio").replace(/[^\w\s.-]/g, "").trim().slice(0, 60) || "audio";
            await sock.sendMessage(remoteJid, { audio: { url: file }, mimetype: "audio/mpeg", fileName: name + ".mp3" }, { quoted: message });
            return null;
        } catch (e) {
            return commandResponse("❌ " + String(e.message).slice(0, 160));
        } finally {
            if (file) fs.rmSync(file, { force: true });
        }
    }
};
