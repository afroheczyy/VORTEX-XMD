const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const path = require("path");

const logger = pino({
    level: "silent"
});

async function start() {
    const sessionDir = path.resolve(
        process.cwd(),
        "database/session-test"
    );

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionDir);

    const { version } =
        await fetchLatestBaileysVersion();

    console.log("");
    console.log("╔══════════════════════════════════════╗");
    console.log("║      🌀 VORTEX SESSION TEST          ║");
    console.log("╠══════════════════════════════════════╣");
    console.log("║ Loading restored authentication...   ║");
    console.log("╚══════════════════════════════════════╝");
    console.log("");

    const sock = makeWASocket({
        version,

        auth: {
            creds: state.creds,
            keys: state.keys
        },

        logger,

        browser: Browsers.windows("Chrome"),

        printQRInTerminal: false,

        markOnlineOnConnect: false,

        syncFullHistory: false
    });

    sock.ev.on(
        "creds.update",
        saveCreds
    );

    sock.ev.on(
        "connection.update",
        ({ connection, lastDisconnect }) => {

            if (connection === "open") {
                console.log("");
                console.log("╔══════════════════════════════════════╗");
                console.log("║       🌀 VORTEX SESSION TEST        ║");
                console.log("╠══════════════════════════════════════╣");
                console.log("║ STATUS : CONNECTED ✅                ║");
                console.log("║                                      ║");
                console.log("║ Restored Session ID works.           ║");
                console.log("╚══════════════════════════════════════╝");
                console.log("");
            }

            if (connection === "close") {
                const code =
                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode;

                console.log(
                    `[VORTEX] Connection closed: ${code || "unknown"}`
                );

                if (
                    code === DisconnectReason.loggedOut
                ) {
                    console.log(
                        "[VORTEX] Session is logged out."
                    );
                }

                process.exit(0);
            }
        }
    );
}

start().catch(error => {
    console.error(
        "[VORTEX TEST ERROR]",
        error.message
    );

    process.exit(1);
});
