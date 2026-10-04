const fs = require("fs");
const path = require("path");
const config = require("../../config/config");

const BANNER = path.join(__dirname, "../../database/menu-banner.jpg");
const TTL = 10 * 60 * 1000;
const LINE = "━━━━━━━━━━━━━━━━━━";
const sessions = new Map();

const clean = j => String(j || "").replace(/:\d+(?=@)/, "");
const who = m => clean(m?.key?.participant || m?.key?.remoteJid);
const emoji = n => String(n).split("").map(d => d + "\uFE0F\u20E3").join("");
const short = (s, n) => {
    s = String(s || "").replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
};

function uptime() {
    const s = Math.floor(process.uptime());
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
}

function remember(sent, state) {
    const id = sent?.key?.id;
    if (!id) return;
    sessions.set(id, { ...state, at: Date.now() });
    const now = Date.now();
    for (const [k, v] of sessions) if (now - v.at > TTL) sessions.delete(k);
    while (sessions.size > 100) sessions.delete(sessions.keys().next().value);
}

async function post(sock, message, content, state) {
    const sent = await sock.sendMessage(message.key.remoteJid, content, { quoted: message });
    remember(sent, state);
}

function mainText(sections, total) {
    const p = config.bot.prefix;
    const rows = sections.map((s, i) => `${emoji(i + 1)}  ${s.icon} ${s.name} · ${s.cmds.length}`);
    return [
        "*🌀 VORTEX XMD*", "_Interactive menu_", LINE,
        `👤 ${config.owner.shortName}   ⚡ ${p}   📦 ${total}`,
        `⏱️ ${uptime()}   🟢 Online`, LINE, "",
        ...rows, "", LINE,
        "_↩️ Reply to this message with a number_"
    ].join("\n");
}

async function sendMain(context, sections, total, cats) {
    const full = sections.map(s => ({
        key: s.key, name: s.name, icon: s.icon,
        cmds: (cats[s.key] || []).slice().sort((a, b) => a.name.localeCompare(b.name))
    }));
    const text = mainText(full, total);
    const content = fs.existsSync(BANNER)
        ? { image: fs.readFileSync(BANNER), caption: text }
        : { text };
    await post(context.sock, context.message, content,
        { level: "main", sections: full, total, owner: who(context.message) });
}

async function showMain(sock, message, st) {
    await post(sock, message, { text: mainText(st.sections, st.total) },
        { level: "main", sections: st.sections, total: st.total, owner: st.owner });
}

async function showCat(sock, message, st, i) {
    const p = config.bot.prefix;
    const s = st.sections[i];
    const rows = s.cmds.map((c, k) =>
        `${emoji(k + 1)}  *${p}${c.name}*${c.description ? "  _" + short(c.description, 30) + "_" : ""}`);
    const text = [`*${s.icon} ${s.name}*`, LINE, ...rows, LINE,
        "_↩️ Reply with a number to open · 0 = back_"].join("\n");
    await post(sock, message, { text },
        { level: "cat", sections: st.sections, total: st.total, owner: st.owner, catIndex: i });
}

async function showCmd(sock, message, st, k) {
    const p = config.bot.prefix;
    const c = st.sections[st.catIndex].cmds[k];
    const usage = c.usage || `${p}${c.name}`;
    const aliases = (c.aliases || []).map(a => p + a).join(", ");
    const runnable = !/[<|]/.test(usage) && !/reply/i.test(usage);
    const text = [
        `*${p}${c.name}*`, c.description ? `_${c.description}_` : "", LINE,
        `📌 Usage: ${usage}`,
        aliases ? `🔁 Aliases: ${aliases}` : "",
        `🔐 Access: ${c.permission || "public"}`, LINE,
        runnable ? "_▶️ Reply *run* to execute · 0 = back_" : "_ℹ️ Needs extra text. Type it yourself · 0 = back_"
    ].filter(Boolean).join("\n");
    await post(sock, message, { text },
        { level: "cmd", sections: st.sections, total: st.total, owner: st.owner,
          catIndex: st.catIndex, cmd: { name: c.name }, runnable });
}

async function handle(sock, message, text, runCommand) {
    const id = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const st = id && sessions.get(id);
    if (!st) return false;
    if (Date.now() - st.at > TTL) { sessions.delete(id); return false; }

    const t = String(text || "").trim().toLowerCase();
    if (!/^(\d{1,3}|run|back|menu)$/.test(t)) return false;
    if (String(message.key.remoteJid).endsWith("@g.us") && st.owner && who(message) !== st.owner) return false;

    const n = /^\d+$/.test(t) ? parseInt(t, 10) : null;
    const back = n === 0 || t === "back";

    if (t === "menu") { await showMain(sock, message, st); return true; }

    if (st.level === "main") {
        if (n >= 1 && n <= st.sections.length) { await showCat(sock, message, st, n - 1); return true; }
        return false;
    }
    if (st.level === "cat") {
        if (back) { await showMain(sock, message, st); return true; }
        if (n >= 1 && n <= st.sections[st.catIndex].cmds.length) { await showCmd(sock, message, st, n - 1); return true; }
        return false;
    }
    if (st.level === "cmd") {
        if (back) { await showCat(sock, message, st, st.catIndex); return true; }
        if (t === "run") {
            if (!st.runnable) {
                await sock.sendMessage(message.key.remoteJid,
                    { text: "ℹ️ That command needs extra text. Type it yourself." }, { quoted: message });
                return true;
            }
            const fake = { ...message, message: { conversation: config.bot.prefix + st.cmd.name } };
            await runCommand(sock, fake);
            return true;
        }
    }
    return false;
}

module.exports = { sendMain, handle };
