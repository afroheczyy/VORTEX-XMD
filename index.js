require("dotenv").config();

const {
    createSessionServer
} = require("./src/session/server");

const {
    startWhatsapp
} = require("./src/connection/whatsapp");

const config =
    require("./config/config");

const logger =
    require("./src/utils/logger");

const app =
    createSessionServer();

let server;
let whatsappSocket = null;

/*
 * START PORTAL
 */
server = app.listen(
    config.server.port,
    "0.0.0.0",
    () => {
        console.log("");
        console.log(
            "╔══════════════════════════════════════╗"
        );
        console.log(
            "║       🌀 VORTEX XMD PORTAL           ║"
        );
        console.log(
            "╠══════════════════════════════════════╣"
        );
        console.log(
            `║ Port   : ${config.server.port}                    ║`
        );
        console.log(
            "║ Status : ONLINE                       ║"
        );
        console.log(
            "║ Owner  : Hector                       ║"
        );
        console.log(
            "╚══════════════════════════════════════╝"
        );
        console.log("");
        console.log(
            `VORTEX Portal: http://127.0.0.1:${config.server.port}`
        );
    }
);

server.on(
    "error",
    error => {
        console.error(
            "[VORTEX SERVER ERROR]",
            error.message
        );

        process.exitCode = 1;
    }
);

/*
 * START WHATSAPP
 */
(async () => {
    try {
        logger.info(
            "Starting VORTEX WhatsApp engine..."
        );

        whatsappSocket =
            await startWhatsapp();

        logger.success(
            "WhatsApp engine initialized."
        );

    } catch (error) {
        logger.error(
            `WhatsApp startup failed: ${error.message}`
        );
    }
})();

/*
 * GRACEFUL SHUTDOWN
 */
async function shutdown(signal) {
    console.log("");
    logger.info(
        `Received ${signal}. Shutting down VORTEX...`
    );

    try {
        if (
            whatsappSocket?.ws
        ) {
            whatsappSocket.ws.close();
        }
    } catch {}

    try {
        if (server) {
            await new Promise(resolve => {
                server.close(() => resolve());
            });
        }
    } catch {}

    logger.success(
        "VORTEX stopped cleanly."
    );

    process.exit(0);
}

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);
