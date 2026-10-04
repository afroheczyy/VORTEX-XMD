const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");

const ROOT = path.join(__dirname, "../../..");
const run = (cmd, args) => new Promise((res, rej) =>
    execFile(cmd, args, { cwd: ROOT, timeout: 180000, maxBuffer: 5 * 1024 * 1024 },
        (err, out, errOut) => (err ? rej(new Error((errOut || err.message).trim())) : res(out.trim()))));

module.exports = {
    name: "update", aliases: ["upgrade", "gitpull"], category: "owner",
    permission: "owner", description: "Pull the latest code from GitHub and restart.",
    usage: ".update | .update check",
    async execute(context) {
        const say = t => context.sock.sendMessage(context.remoteJid,
            { text: commandResponse(t) }, { quoted: context.message });

        if (!fs.existsSync(path.join(ROOT, ".git")))
            return commandResponse("❌ This server isn't linked to GitHub yet.\nDo the one-time setup first.");

        try {
            await run("git", ["fetch", "origin"]);
            const branch = await run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
            const behind = parseInt(await run("git", ["rev-list", "--count", `HEAD..origin/${branch}`]), 10);

            if (!behind) return commandResponse("✅ Already up to date.");

            const log = await run("git", ["log", "--pretty=• %s", `HEAD..origin/${branch}`]);
            if ((context.args?.[0] || "").toLowerCase() === "check")
                return commandResponse(`🆕 *${behind} update(s) available*\n\n${log}\n\nSend .update to install.`);

            const before = await run("git", ["rev-parse", "HEAD"]);
            await run("git", ["pull", "--ff-only", "origin", branch]);
            const changed = await run("git", ["diff", "--name-only", before, "HEAD"]);

            let note = "";
            if (/package(-lock)?\.json/.test(changed)) {
                await say("📦 New packages found, installing...");
                await run("npm", ["install", "--no-audit", "--no-fund"]);
                note = "\n📦 Packages updated.";
            }

            await say(`✅ *Updated (${behind})*\n\n${log}${note}\n\n🔄 Restarting...`);
            setTimeout(() => process.exit(0), 2000);
            return null;
        } catch (e) {
            return commandResponse(`❌ Update failed:\n${e.message.slice(0, 300)}`);
        }
    }
};
