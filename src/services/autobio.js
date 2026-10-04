const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../database/autobio.json");
const DEFAULT = "🌀 VORTEX XMD | {time} | up {uptime}";
const seen = new WeakSet();
let timer = null;

function load() {
    try { return { enabled: false, text: DEFAULT, ...JSON.parse(fs.readFileSync(FILE, "utf8")) }; }
    catch { return { enabled: false, text: DEFAULT }; }
}
function save(d) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(d));
}

function render(t) {
    const tz = process.env.BOT_TZ || "Africa/Accra";
    const s = Math.floor(process.uptime());
    const up = s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : `${Math.floor(s / 60)}m`;
    const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date());
    const date = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "short" }).format(new Date());
    return t.replace(/\{time\}/g, time).replace(/\{date\}/g, date).replace(/\{uptime\}/g, up).slice(0, 139);
}

async function tick(sock) {
    try {
        const d = load();
        if (d.enabled) await sock.updateProfileStatus(render(d.text));
    } catch {}
}

function start(sock) {
    if (timer) clearInterval(timer);
    if (!load().enabled) return;
    tick(sock);
    timer = setInterval(() => tick(sock), 10 * 60 * 1000);
    timer.unref?.();
}

function init(sock) {
    if (!sock?.ev || seen.has(sock)) return;
    seen.add(sock);
    sock.ev.on("connection.update", u => { if (u.connection === "open") start(sock); });
}

module.exports = { init, start, load, save, render, DEFAULT };
