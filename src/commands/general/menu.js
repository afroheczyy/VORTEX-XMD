const fs = require("fs");
const path = require("path");
const { getCategories } = require("../../core/commandRegistry");
const config = require("../../../config/config");
const { commandResponse } = require("../../utils/branding");

const STYLE_FILE = path.join(__dirname, "../../../database/menu-style.json");
const BANNER = path.join(__dirname, "../../../database/menu-banner.jpg");
const STYLES = ["app", "elite", "vortex", "classic", "box", "minimal", "neon"];
const DEFAULT_STYLE = "app";

const INFO = {
    general: ["CORE SYSTEM", "⚡"], ai: ["ARTIFICIAL INTELLIGENCE", "🤖"],
    fun: ["FUN & ENTERTAINMENT", "🎭"], games: ["GAMES & ARCADE", "🎮"],
    group: ["GROUP MANAGEMENT", "👥"], status: ["STATUS & AUTOMATION", "👀"],
    download: ["DOWNLOADER", "📥"], media: ["MEDIA TOOLS", "🎨"],
    search: ["SEARCH & TOOLS", "🔎"], vip: ["VIP FEATURES", "💎"],
    owner: ["OWNER PANEL", "👑"], system: ["SYSTEM", "⚙️"]
};
const ORDER = Object.keys(INFO);

function savedStyle() {
    try {
        const s = JSON.parse(fs.readFileSync(STYLE_FILE, "utf8")).style;
        return STYLES.includes(s) ? s : DEFAULT_STYLE;
    } catch { return DEFAULT_STYLE; }
}

function uptime() {
    const s = Math.floor(process.uptime());
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
}

function pairs(names) {
    const out = [];
    for (let i = 0; i < names.length; i += 2) {
        const l = `.${names[i]}`;
        out.push(names[i + 1] ? l.padEnd(16) + `.${names[i + 1]}` : l);
    }
    return out;
}

function render(style, ctx) {
    const { sections, total, prefix } = ctx;
    const mem = (process.memoryUsage().rss / 1048576).toFixed(0);
    const date = new Date().toDateString();
    const L = [];

    if (style === "elite") {
        L.push("*🌀 VORTEX XMD*", "_Command Center_", "━━━━━━━━━━━━━━━━━━", "",
            `👤 Owner      ${config.owner.shortName}`,
            `⚡ Prefix     ${prefix}`,
            `📦 Commands   ${total}`,
            `⏱️ Uptime     ${uptime()}`,
            `💾 Memory     ${mem} MB`,
            "🟢 Status     Online", "", "━━━━━━━━━━━━━━━━━━", "");
        for (const s of sections) {
            L.push(`*${s.icon} ${s.name}* · ${s.names.length}`,
                s.names.map(n => "`" + prefix + n + "`").join("  "), "");
        }
        L.push("━━━━━━━━━━━━━━━━━━",
            `_${prefix}menu <category> · ${prefix}menu <style>_`,
            `_Styles: ${STYLES.join(", ")}_`);
        return L.join("\n");
    }

    if (style === "classic") {
        L.push("*🌀 VORTEX XMD*", "━━━━━━━━━━━━━━━━━━",
            `👤 Owner : ${config.owner.shortName}`, `⚡ Prefix : ${prefix}`,
            `📦 Cmds : ${total}`, `⏱️ Uptime : ${uptime()}`, "━━━━━━━━━━━━━━━━━━", "");
        for (const s of sections) {
            L.push(`┌─ ${s.icon} *${s.name}*`);
            s.names.forEach(n => L.push(`│ ◦ ${prefix}${n}`));
            L.push("└──────────", "");
        }
    } else if (style === "box") {
        L.push("╔══════════════════╗", "║  🌀 VORTEX XMD  ║", "╚══════════════════╝",
            `👤 ${config.owner.shortName}  •  ⚡ ${prefix}  •  📦 ${total}`, "");
        for (const s of sections) {
            L.push(`╔═〔 ${s.icon} ${s.name} 〕`);
            pairs(s.names).forEach(p => L.push(`║ ${p}`));
            L.push("╚══════════════", "");
        }
    } else if (style === "minimal") {
        L.push("*VORTEX XMD*", `${total} commands • prefix ${prefix} • up ${uptime()}`, "");
        for (const s of sections) {
            L.push(`${s.icon} *${s.name}*`, s.names.map(n => `${prefix}${n}`).join("  "), "");
        }
    } else if (style === "neon") {
        L.push("▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰", "⟦ 🌀 V O R T E X  X M D ⟧", "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
            `⟫ OWNER  ▸ ${config.owner.shortName}`, `⟫ PREFIX ▸ ${prefix}`,
            `⟫ CMDS   ▸ ${total}`, `⟫ UPTIME ▸ ${uptime()}`, `⟫ RAM    ▸ ${mem} MB`, "");
        for (const s of sections) {
            L.push(`▱▱ ${s.icon} ${s.name} ▱▱`);
            s.names.forEach(n => L.push(`  ⟫ ${prefix}${n}`));
            L.push("");
        }
    } else {
        L.push("╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮",
            "┃       🌀  V O R T E X  X M D       ┃",
            "┃        ── COMMAND CENTER ──        ┃",
            "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯", "",
            "╭━━━〔 👑 BOT PROFILE 〕━━━╮", "┃",
            `┃  👤 Owner    : ${config.owner.shortName}`,
            `┃  🤖 Version  : ${config.version}`,
            `┃  ⚡ Prefix   : ${prefix}`,
            `┃  📦 Commands : ${total}`,
            `┃  ⏱️ Uptime   : ${uptime()}`,
            `┃  💾 Memory   : ${mem} MB`,
            `┃  📅 Date     : ${date}`,
            "┃  🟢 Status   : ONLINE", "┃", "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯", "");
        for (const s of sections) {
            L.push(`╭━━〔 ${s.icon} ${s.name} 〕━━╮`);
            pairs(s.names).forEach(p => L.push(`┃ ${p}`));
            L.push("╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯", "");
        }
    }

    L.push(`💡 ${prefix}menu <style|category>`, `🎨 Styles: ${STYLES.join(", ")}`);
    return L.join("\n");
}

module.exports = {
    name: "menu",
    aliases: ["help", "commands"],
    category: "general",
    permission: "public",
    description: "Display the VORTEX XMD command center.",
    usage: ".menu [style|category]",

    async execute(context) {
        const cats = getCategories();
        const keys = [...ORDER, ...Object.keys(cats).filter(k => !ORDER.includes(k))];
        const arg = (context.args?.[0] || "").toLowerCase();

        let sections = keys.filter(k => cats[k]?.length).map(k => ({
            key: k,
            name: (INFO[k] || [k.toUpperCase()])[0],
            icon: (INFO[k] || [])[1] || "•",
            names: cats[k].map(c => c.name).sort((a, b) => a.localeCompare(b))
        }));

        const total = sections.reduce((n, s) => n + s.names.length, 0);
        let style = STYLES.includes(arg) ? arg : savedStyle();
        if (style === "app" && arg && !STYLES.includes(arg)) style = "elite";
        if (style === "app") {
            await require("../../services/menunav").sendMain(context, sections, total, cats);
            return null;
        }

        if (arg && !STYLES.includes(arg)) {
            const only = sections.filter(s => s.key === arg);
            if (!only.length) return commandResponse(`❌ Unknown style or category: ${arg}`);
            sections = only;
        }

        const text = commandResponse(render(style, { sections, total, prefix: config.bot.prefix }));

        if (fs.existsSync(BANNER)) {
            try {
                await context.sock.sendMessage(context.remoteJid, {
                    image: fs.readFileSync(BANNER),
                    caption: `🌀 *VORTEX XMD* • ${total} commands`
                }, { quoted: context.message });
            } catch {}
        }
        return text;
    }
};
