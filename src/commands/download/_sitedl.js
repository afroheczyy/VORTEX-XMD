const fs = require("fs");
const { commandResponse } = require("../../utils/branding");
const { fetchMedia } = require("../../services/mediadl");

const cool = new Map();

function make({ name, aliases, icon, label, hosts, type = "auto" }) {
    return {
        name, aliases, category: "download", permission: "public",
        description: `Download from ${label}.`,
        usage: `.${name} <link>`,
        async execute(context) {
            const { sock, remoteJid, message } = context;
            let link = (context.args?.[0] || "").trim();

            if (!link) {
                const q = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const t = q?.conversation || q?.extendedTextMessage?.text || "";
                link = (t.match(/https?:\/\/\S+/) || [""])[0];
            }
            if (!link) return commandResponse(`${icon} Usage: .${name} <${label} link>\n(or reply to a message that has the link)`);
            if (!/^https?:\/\//i.test(link)) link = "https://" + link;

            let host;
            try { host = new URL(link).hostname.toLowerCase().replace(/^www\./, ""); }
            catch { return commandResponse("❌ That isn't a valid link."); }
            if (hosts && !hosts.test(host)) return commandResponse(`❌ That isn't a ${label} link.`);

            const who = String(context.sender || remoteJid);
            if (Date.now() - (cool.get(who) || 0) < 20000) return commandResponse("⏳ Wait a few seconds between downloads.");
            cool.set(who, Date.now());
            if (cool.size > 500) cool.clear();

            let file;
            try {
                await sock.sendMessage(remoteJid, { text: `${icon} Downloading from ${label}...` }, { quoted: message });
                const dl = await fetchMedia(link, type);
                file = dl.file;
                const cap = `${icon} ${label}`;

                if (dl.kind === "image") {
                    await sock.sendMessage(remoteJid, { image: { url: file }, caption: cap }, { quoted: message });
                } else if (dl.kind === "audio") {
                    await sock.sendMessage(remoteJid, { audio: { url: file }, mimetype: "audio/mpeg", fileName: name + ".mp3" }, { quoted: message });
                } else if (dl.size > 16 * 1048576) {
                    await sock.sendMessage(remoteJid, { document: { url: file }, mimetype: "video/mp4", fileName: name + ".mp4" }, { quoted: message });
                } else {
                    await sock.sendMessage(remoteJid, { video: { url: file }, caption: cap }, { quoted: message });
                }
                return null;
            } catch (e) {
                return commandResponse("❌ " + String(e.message).slice(0, 160));
            } finally {
                if (file) fs.rmSync(file, { force: true });
            }
        }
    };
}

module.exports = { make };
