const path = require("path");

const config = require("../../config/config");
const { generateSessionId } = require("./generator");

const sessionDir = path.resolve(
    process.cwd(),
    config.whatsapp.sessionDir
);

if (!require("fs").existsSync(sessionDir)) {
    throw new Error("VORTEX session directory does not exist.");
}

const result = generateSessionId(sessionDir);

console.log("");
console.log("╔══════════════════════════════════════╗");
console.log("║       🌀 VORTEX SESSION RECOVERY     ║");
console.log("╠══════════════════════════════════════╣");
console.log("║ Status : SESSION FOUND                ║");
console.log("║                                      ║");
console.log("║ Your Session ID is ready.             ║");
console.log("╚══════════════════════════════════════╝");
console.log("");
console.log(result.sessionId);
console.log("");
