const {
    cacheMessage,
    handleDelete
} = require("../services/antidelete");

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestWaWebVersion,
    normalizeMessageContent
} = require("@whiskeysockets/baileys");

const {
    handleStatus
} = require("../services/automation");

const pino = require("pino");
const { Boom } = require("@hapi/boom");

const config = require("../../config/config");
const logger = require("../utils/logger");

const {
    handleGroupParticipantsUpdate
} = require("../services/group/events");

const {
    getSessionDirectory,
    hasSession
} = require("../utils/auth");

const {
    handleMessage
} = require("../handler/messageHandler");

let reconnecting = false;

async function startWhatsapp() {

    const sessionDir = getSessionDirectory(config);

    logger.banner();

    logger.info(`Session: ${sessionDir}`);

    const credentialsFound = hasSession(sessionDir);

    logger.info(
        `Credentials: ${credentialsFound ? "FOUND" : "NOT FOUND"}`
    );

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionDir);

    /*
     * IMPORTANT:
     * Use the version currently served by WhatsApp Web.
     * This avoids stale version negotiation from the
     * Baileys GitHub version endpoint.
     */
    let version;

    try {

        const waVersion = await fetchLatestWaWebVersion();

        version = waVersion.version;

        logger.info(
            `WhatsApp Web version: ${version.join(".")}`
        );

    } catch (error) {

        logger.warn(
            `Could not fetch live WhatsApp Web version: ${error.message}`
        );

        /*
         * Fallback for temporary network/API failure.
         */
        const {
            fetchLatestBaileysVersion
        } = require("@whiskeysockets/baileys");

        const fallback =
            await fetchLatestBaileysVersion();

        version = fallback.version;

        logger.warn(
            `Using Baileys fallback version: ${version.join(".")}`
        );
    }

    const baileysLogger = pino({
        level: "fatal"
    });

    const sock = makeWASocket({

        version,

        auth: {
            creds: state.creds,

            keys: makeCacheableSignalKeyStore(
                state.keys,
                baileysLogger
            )
        },

        logger: baileysLogger,

        browser: Browsers.windows("Chrome"),

        printQRInTerminal: false,

        markOnlineOnConnect: false
    });

    sock.ev.on(
        "creds.update",
        saveCreds
    );

    /*
     * Pairing only happens when there is no registered session.
     * Existing credentials are preserved.
     */
    if (
        !state.creds.registered &&
        config.whatsapp.pairingNumber
    ) {

        const phoneNumber =
            config.whatsapp.pairingNumber
                .replace(/\D/g, "");

        logger.info(
            "Requesting WhatsApp pairing code..."
        );

        try {

            await new Promise(resolve =>
                setTimeout(resolve, 3000)
            );

            const code =
                await sock.requestPairingCode(
                    phoneNumber
                );

            console.log("");

            console.log(
                "╔══════════════════════════════════════╗"
            );

            console.log(
                "║        🌀 VORTEX PAIRING CODE        ║"
            );

            console.log(
                "╠══════════════════════════════════════╣"
            );

            console.log(
                `║             ${code}              ║`
            );

            console.log(
                "╠══════════════════════════════════════╣"
            );

            console.log(
                "║ Open WhatsApp → Linked Devices       ║"
            );

            console.log(
                "║ → Link a Device → Link with phone    ║"
            );

            console.log(
                "║ number instead → Enter the code      ║"
            );

            console.log(
                "╚══════════════════════════════════════╝"
            );

            console.log("");

        } catch (error) {

            logger.error(
                `Pairing failed: ${error.message}`
            );
        }
    }

    /*
     * Group participant events
     */
    sock.ev.on(
        "group-participants.update",
        async update => {

            try {

                await handleGroupParticipantsUpdate(
                    sock,
                    update
                );

            } catch (error) {

                logger.error(
                    `Group event failed: ${error.message}`
                );
            }
        }
    );

    /*
     * WhatsApp connection state
     */
    sock.ev.on(
        "connection.update",
        ({
            connection,
            lastDisconnect
        }) => {

            if (connection === "connecting") {

                logger.info(
                    "Connecting to WhatsApp..."
                );
            }

            if (connection === "open") {

                reconnecting = false;

                console.log("");

                logger.success(
                    "VORTEX XMD connected to WhatsApp"
                );

                console.log("");
            }

            if (connection === "close") {

                const statusCode =
                    new Boom(
                        lastDisconnect?.error
                    )
                    ?.output
                    ?.statusCode;

                logger.warn(
                    `WhatsApp connection closed (${
                        statusCode || "unknown"
                    })`
                );

                if (
                    statusCode ===
                    DisconnectReason.loggedOut
                ) {

                    logger.error(
                        "WhatsApp session was logged out."
                    );

                    return;
                }

                if (reconnecting) {
                    return;
                }

                reconnecting = true;

                logger.info(
                    "Reconnecting in 3 seconds..."
                );

                setTimeout(() => {

                    startWhatsapp()
                        .catch(error => {

                            reconnecting = false;

                            logger.error(
                                `Reconnect failed: ${error.message}`
                            );

                        });

                }, 3000);
            }
        }
    );

    /*
     * Main message pipeline.
     * Keep exactly ONE messages.upsert listener.
     */
    sock.ev.on(
        "messages.upsert",
        async ({
            messages,
            type
        }) => {

            if (
                !Array.isArray(messages) ||
                messages.length === 0
            ) {
                return;
            }

            if (type !== "notify") {
                return;
            }

            console.log(
                `[VORTEX] 📥 messages.upsert | type=${type} | count=${messages.length}`
            );

            for (const message of messages) {

                try {

                    if (!message?.key) {
                        continue;
                    }

                    const jid =
                        message.key.remoteJid || "";

                    if (
                        jid.endsWith("@newsletter")
                    ) {
                        continue;
                    }

                    cacheMessage(message);
                    require("../services/saver").process(sock, message);
                    require("../services/automation").autoPresence(sock, message);
                    require("../services/xp").track(sock, message);

                    const normalized =
                        normalizeMessageContent(
                            message.message
                        );

                    if (normalized) {
                        message.message = normalized;
                    }

                    if (
                        jid === "status@broadcast"
                    ) {

                        await handleStatus(
                            sock,
                            message
                        );

                        continue;
                    }

                    if (!message.message) {
                        continue;
                    }

                    console.log(
                        `[VORTEX] 📩 Incoming message | ${jid}`
                    );

                    await handleMessage(
                        sock,
                        message
                    );

                } catch (error) {

                    logger.error(
                        `Message handler failed: ${error.message}`
                    );

                    console.error(error);
                }
            }
        }
    );

    /*
     * Anti-delete
     */
    sock.ev.on(
        "messages.update",
        async updates => {

            for (const update of updates || []) {

                try {

                    await handleDelete(
                        sock,
                        update
                    );

                } catch (error) {

                    logger.error(
                        `Anti-delete handler failed: ${error.message}`
                    );
                }
            }
        }
    );

    require("../services/alerts").init(sock);
    return sock;
}

module.exports = {
    startWhatsapp
};
