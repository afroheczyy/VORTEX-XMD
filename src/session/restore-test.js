const fs = require("fs");
const path = require("path");

const {
    restoreSessionId
} = require("./generator");

const sessionId = process.argv[2];

if (!sessionId) {
    console.error("Usage: node src/session/restore-test.js 'VORTEX-XMD~...'");
    process.exit(1);
}

const target =
    path.resolve(
        process.cwd(),
        "database/session-test"
    );

try {
    fs.rmSync(target, {
        recursive: true,
        force: true
    });

    restoreSessionId(
        sessionId,
        target
    );

    const files =
        fs.readdirSync(target);

    console.log("");
    console.log("╔══════════════════════════════════════╗");
    console.log("║       🌀 VORTEX SESSION RESTORE      ║");
    console.log("╠══════════════════════════════════════╣");
    console.log("║ Status : SUCCESS                     ║");
    console.log(`║ Files  : ${String(files.length).padEnd(28)}║`);
    console.log("║ Target : database/session-test       ║");
    console.log("╚══════════════════════════════════════╝");
    console.log("");

} catch (error) {
    console.error("");
    console.error("[VORTEX RESTORE ERROR]", error.message);
    process.exit(1);
}
