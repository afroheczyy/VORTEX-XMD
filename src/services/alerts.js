const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname, "../../database");
const CFG = path.join(DB, "alerts.json");
const CRASH = path.join(DB, "last-crash.json");
const state = { lastClose: 0, lastCode: null, lastAlert: 0 };
const seen = new WeakSet();

function enabled() {
    try { return JSON.parse(fs.readFileSync(CFG, "utf8")).enabled !== false; } catch { return true; }
}
function setEnabled(v) {
    fs.mkdirSync(DB, { recursive: true });
    fs.writeFileSync(CFG, JSON.stringify({ enabled: !!v }));
}

function record(kind, err) {
    try {
        fs.mkdirSync(DB, { recursive: true });
        fs.writeFileSync(CRASH, JSON.stringify({
            kind, at: Date.now(),
            message: String(err?.stack || err?.message || err).slice(0, 400)
        }));
    } catch {}
}

if (!global.__vortexAlerts) {
    global.__vortexAlerts = true;
    process.on("uncaughtException", e => {
        console.log("[VORTEX] Uncaught exception: " + (e?.stack || e));
        record("crash", e);
        process.exit(1);
    });
    process.on("unhandledRejection", e => {
        console.log("[VORTEX] Unhandled rejection: " + (e?.stack || e));
        record("rejection", e);
    });
}

function init(sock) {
    if (!sock?.ev || seen.has(sock)) return;
    seen.add(sock);

    sock.ev.on("connection.update", async u => {
        try {
            if (u.connection === "close") {
                state.lastClose = Date.now();
                state.lastCode = u.lastDisconnect?.error?.output?.statusCode ?? null;
                return;
            }
            if (u.connection !== "open" || !enabled()) return;
            if (Date.now() - state.lastAlert < 60000) return;
            state.lastAlert = Date.now();

            await new Promise(r => setTimeout(r, 3000));
            const me = String(sock.user?.id || "").replace(/:\d+(?=@)/, "");
            if (!me) return;

            const lines = ["🟢 *VORTEX is online*"];
            if (state.lastClose) {
                const secs = Math.round((Date.now() - state.lastClose) / 1000);
                lines.push(`🔁 Reconnected after ${secs}s (code ${state.lastCode ?? "?"})`);
            }
            try {
                const c = JSON.parse(fs.readFileSync(CRASH, "utf8"));
                const mins = Math.round((Date.now() - c.at) / 60000);
                lines.push("", `⚠️ Last ${c.kind} ${mins} min ago:`, "```" + c.message.slice(0, 250) + "```");
                fs.rmSync(CRASH, { force: true });
            } catch {}
            lines.push("", `_${new Date().toLocaleString("en-GB")}_`);

            await sock.sendMessage(me, { text: lines.join("\n") });
        } catch {}
    });
}

module.exports = { init, enabled, setEnabled };
