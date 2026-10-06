const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, execFile } = require("child_process");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

const ROOT = path.join(__dirname, "../../media-api");
const DL = path.join(ROOT, "downloads");
const PORT = () => Number(process.env.MEDIA_API_PORT) || 5055;
const remote = () => !!process.env.VORTEX_API_URL;
let linked = "";
let lastRefresh = 0;
const base = () => remote() ? (linked || process.env.VORTEX_API_URL).replace(/\/+$/, "") : `http://127.0.0.1:${PORT()}`;

async function refreshLink() {
    const src = process.env.VORTEX_LINK_URL;
    if (!src || Date.now() - lastRefresh < 20000) return false;
    lastRefresh = Date.now();
    try {
        const r = await fetch(src + (src.includes("?") ? "&" : "?") + "t=" + Date.now(), { signal: AbortSignal.timeout(8000) });
        if (!r.ok) return false;
        const u = (await r.text()).trim().replace(/\/+$/, "");
        if (!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i.test(u) || u === base()) return false;
        linked = u;
        console.log("[MEDIA-API] Address updated: " + u);
        return true;
    } catch { return false; }
}
const headers = () => process.env.VORTEX_API_KEY ? { "x-api-key": process.env.VORTEX_API_KEY } : {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const tools = {};

let child = null, stopping = false, fails = 0, startedAt = 0;

const probe = (name, cmd, args) => new Promise(res =>
    execFile(cmd, args, { timeout: 8000 }, err => { tools[name] = !err; res(); }));

async function checkTools() {
    await Promise.all([
        probe("ffmpeg", "ffmpeg", ["-version"]),
        probe("python3", "python3", ["--version"]),
        probe("deno", "deno", ["--version"])
    ]);
    try {
        const dir = path.join(__dirname, "../../node_modules/youtube-dl-exec/bin");
        tools.ytdlp = fs.readdirSync(dir).some(f => f.startsWith("yt-dlp"));
    } catch { tools.ytdlp = false; }
    const show = (k, label) => console.log(`[MEDIA-API] ${tools[k] ? "OK     " : "MISSING"} ${label}`);
    show("ffmpeg", "ffmpeg (needed for video and mp3)");
    show("python3", "python3 (needed by yt-dlp)");
    show("deno", "deno (JS runtime for YouTube)");
    show("ytdlp", "yt-dlp binary (installed by npm)");
}

function cleanOld() {
    try {
        for (const f of fs.readdirSync(DL)) {
            const p = path.join(DL, f);
            if (Date.now() - fs.statSync(p).mtimeMs > 3600000) fs.rmSync(p, { force: true });
        }
    } catch {}
}

function launch() {
    startedAt = Date.now();
    child = spawn(process.execPath, ["server.js"], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(PORT()), HOST: "127.0.0.1" },
        stdio: ["ignore", "pipe", "pipe"]
    });
    const out = d => String(d).split("\n").map(s => s.trim()).filter(Boolean)
        .forEach(l => { if (!/^[╔║╚]/.test(l)) console.log("[MEDIA-API] " + l); });
    child.stdout.on("data", out);
    child.stderr.on("data", out);
    child.on("exit", code => {
        child = null;
        if (stopping) return;
        if (Date.now() - startedAt > 60000) fails = 0;
        fails++;
        const wait = Math.min(60000, 3000 * fails);
        console.log(`[MEDIA-API] stopped (code ${code}). Restarting in ${wait / 1000}s`);
        setTimeout(launch, wait);
    });
}

function start() {
    if (global.__vxMediaApi) return;
    global.__vxMediaApi = true;
    if (remote()) { console.log("[MEDIA-API] Using remote API: " + base()); return; }
    if (!fs.existsSync(path.join(ROOT, "server.js"))) { console.log("[MEDIA-API] media-api/server.js not found"); return; }
    checkTools().catch(() => {});
    cleanOld();
    launch();
    process.on("exit", () => { stopping = true; try { child && child.kill(); } catch {} });
}

async function status() {
    const once = async () => {
        try {
            const r = await fetch(base() + "/api/status", { headers: headers(), signal: AbortSignal.timeout(3000) });
            return r.ok ? await r.json() : null;
        } catch { return null; }
    };
    let s = await once();
    if (!s && remote() && await refreshLink()) s = await once();
    return s;
}

async function ready(maxMs = 15000) {
    const end = Date.now() + maxMs;
    while (Date.now() < end) {
        if (await status()) return true;
        await sleep(1000);
    }
    return false;
}

async function search(q) {
    if (!(await ready())) throw new Error("Media API is not running. Ask the owner to check .mediaapi");
    const r = await fetch(`${base()}/api/search?query=${encodeURIComponent(q)}`,
        { headers: headers(), signal: AbortSignal.timeout(20000) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.success) throw new Error(d.error || "Search failed");
    return d.results || [];
}

async function download(kind, params) {
    if (!(await ready())) throw new Error("Media API is not running. Ask the owner to check .mediaapi");
    const maxMB = Number(process.env.MEDIA_MAX_MB) || 100;
    const r = await fetch(`${base()}/api/${kind}?${new URLSearchParams(params)}`,
        { headers: headers(), signal: AbortSignal.timeout(300000) });
    if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || `API error ${r.status}`);
    }
    const len = Number(r.headers.get("content-length") || 0);
    if (len > maxMB * 1048576) {
        try { await r.body.cancel(); } catch {}
        throw new Error(`File too large (${Math.round(len / 1048576)} MB, limit ${maxMB} MB)`);
    }
    const file = path.join(os.tmpdir(), `vx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${kind === "music" ? "mp3" : "mp4"}`);
    await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(file));
    return { file, size: fs.statSync(file).size };
}

module.exports = { start, status, ready, search, download, tools, base, remote };
