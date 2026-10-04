const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "../../database");

function findImage(name) {
    const list = [path.join(DIR, "banners", name + ".jpg"), path.join(DIR, "menu-banner.jpg")];
    return list.find(f => fs.existsSync(f)) || null;
}

async function sendCard(context, name, text) {
    const f = findImage(name);
    if (!f) return text;
    try {
        await context.sock.sendMessage(context.remoteJid,
            { image: fs.readFileSync(f), caption: text }, { quoted: context.message });
        return null;
    } catch { return text; }
}

module.exports = { sendCard, findImage };
