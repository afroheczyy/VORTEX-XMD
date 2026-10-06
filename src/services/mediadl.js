const fs = require("fs");
const os = require("os");
const path = require("path");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");
const api = require("./mediaapi");

const headers = () => (process.env.VORTEX_API_KEY ? { "x-api-key": process.env.VORTEX_API_KEY } : {});

async function fetchMedia(url, type = "auto") {
    if (!(await api.ready())) throw new Error("Media API is not running. Check .mediaapi");
    const maxMB = Number(process.env.MEDIA_MAX_MB) || 100;

    const r = await fetch(`${api.base()}/api/dl?${new URLSearchParams({ url, type })}`,
        { headers: headers(), signal: AbortSignal.timeout(300000) });

    if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || `API error ${r.status}`);
    }

    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const len = Number(r.headers.get("content-length") || 0);
    if (len > maxMB * 1048576) {
        try { await r.body.cancel(); } catch {}
        throw new Error(`File too large (${Math.round(len / 1048576)} MB, limit ${maxMB} MB)`);
    }

    const kind = ct.startsWith("image/") ? "image" : ct.startsWith("audio/") ? "audio" : "video";
    const ext = kind === "image" ? (ct.includes("png") ? "png" : "jpg") : kind === "audio" ? "mp3" : "mp4";
    const file = path.join(os.tmpdir(), `vx-dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`);

    await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(file));
    return { file, size: fs.statSync(file).size, kind };
}

module.exports = { fetchMedia };
