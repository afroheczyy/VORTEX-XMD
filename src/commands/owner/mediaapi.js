const { commandResponse } = require("../../utils/branding");
const api = require("../../services/mediaapi");

module.exports = {
    name: "mediaapi", aliases: ["apistatus"], category: "owner",
    permission: "owner", description: "Check the media download API.",
    usage: ".mediaapi",
    async execute() {
        const s = await api.status();
        const t = api.tools;
        const yn = v => (v === undefined ? "?" : v ? "✅" : "❌");
        return commandResponse(
`*🎬 MEDIA API*

Mode    : ${api.remote() ? "Remote" : "Built-in"}
Address : ${api.base()}
Status  : ${s ? "Online ✅" : "Offline ❌"}
${s ? `Active  : ${s.activeDownloads}/${s.maxConcurrent}\nUptime  : ${s.uptime}s\n` : ""}
ffmpeg ${yn(t.ffmpeg)}  python3 ${yn(t.python3)}  deno ${yn(t.deno)}  yt-dlp ${yn(t.ytdlp)}

${s ? "" : "Check the console for lines starting with [MEDIA-API]."}`);
    }
};
