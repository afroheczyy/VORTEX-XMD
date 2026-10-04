const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
    generateSessionId
} = require("./generator");

const logger = pino({
    level: "silent"
});

function cleanNumber(number) {
    return String(number || "").replace(/\D/g, "");
}

function createJobId() {
    return crypto.randomBytes(8).toString("hex");
}

async function startPairing(number, jobs) {
    const phoneNumber = cleanNumber(number);

    if (!phoneNumber || phoneNumber.length < 8) {
        throw new Error("Invalid WhatsApp number");
    }

    const jobId = createJobId();

    const temporaryDir = path.resolve(
        process.cwd(),
        `database/session-generator/${jobId}`
    );

    const permanentDir = path.resolve(
        process.cwd(),
        "database/session"
    );

    fs.rmSync(temporaryDir, {
        recursive: true,
        force: true
    });

    fs.mkdirSync(temporaryDir, {
        recursive: true
    });

    fs.mkdirSync(permanentDir, {
        recursive: true
    });

    const job = {
        id: jobId,
        number: phoneNumber,
        status: "starting",
        code: null,
        sessionId: null,
        error: null,
        createdAt: Date.now(),
        sock: null,
        sessionDir: temporaryDir,
        pairingRequested: false,
        finished: false
    };

    jobs.set(jobId, job);

    async function connect() {
        if (job.finished) return;

        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(temporaryDir);

        const { version } =
            await fetchLatestBaileysVersion();

        console.log(
            `[VORTEX] Starting WhatsApp socket for ${phoneNumber}`
        );

        const sock = makeWASocket({
            version,

            auth: {
                creds: state.creds,

                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    logger
                )
            },

            logger,

            browser: Browsers.windows("Chrome"),

            printQRInTerminal: false,

            markOnlineOnConnect: false,

            syncFullHistory: false
        });

        job.sock = sock;

        /*
         * Track credential writes.
         *
         * Baileys can emit multiple creds.update events.
         * We keep the latest save promise so that before
         * generating the Session ID we can wait for the
         * final credential write to finish.
         */
        let pendingCredentialSave = Promise.resolve();

        sock.ev.on(
            "creds.update",
            update => {
                pendingCredentialSave =
                    pendingCredentialSave
                        .catch(() => {})
                        .then(() => saveCreds(update));
            }
        );

        sock.ev.on(
            "connection.update",
            async ({
                connection,
                lastDisconnect
            }) => {
                if (job.finished) return;

                if (connection === "open") {
                    console.log(
                        "[VORTEX] WhatsApp connection OPEN"
                    );

                    try {
                        job.status =
                            "generating_session";

                        /*
                         * Allow the connection state to settle.
                         */
                        await delay(3000);

                        /*
                         * Make sure the most recent credentials
                         * have actually been written to disk.
                         */
                        await pendingCredentialSave;

                        /*
                         * Small additional safety delay for
                         * filesystem writes.
                         */
                        await delay(1500);

                        /*
                         * Generate the Session ID from the
                         * COMPLETE authentication directory.
                         */
                        const sessionInfo =
                            generateSessionId(
                                temporaryDir
                            );

                        job.sessionId =
                            sessionInfo.sessionId;

                        /*
                         * Replace the permanent session with
                         * the finalized authentication state.
                         */
                        fs.rmSync(
                            permanentDir,
                            {
                                recursive: true,
                                force: true
                            }
                        );

                        fs.mkdirSync(
                            permanentDir,
                            {
                                recursive: true
                            }
                        );

                        fs.cpSync(
                            temporaryDir,
                            permanentDir,
                            {
                                recursive: true
                            }
                        );

                        console.log(
                            "[VORTEX] Authentication state saved permanently"
                        );

                        job.status =
                            "completed";

                        console.log(
                            "[VORTEX] Session generated successfully"
                        );

                        /*
                         * MESSAGE 1
                         * Connection confirmation.
                         */
                        try {
                            await sock.sendMessage(
                                `${phoneNumber}@s.whatsapp.net`,
                                {
                                    text:
`╭━━━〔 🌀 VORTEX XMD 〕━━━╮
┃
┃  ✅ *WHATSAPP CONNECTED*
┃
┃  Your VORTEX session has
┃  been generated successfully.
┃
┃  🤖 Bot     : VORTEX XMD
┃  👑 Owner   : Hector
┃  ⚡ Version : 1.0.0
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

Powered by Hector 🌀`
                                }
                            );

                            console.log(
                                "[VORTEX] Connection message sent"
                            );

                        } catch (error) {
                            console.log(
                                "[VORTEX] Connection message failed:",
                                error.message
                            );
                        }

                        /*
                         * MESSAGE 2
                         *
                         * The Session ID is intentionally
                         * sent ALONE so WhatsApp's copy
                         * action copies only the ID.
                         */
                        try {
                            await delay(700);

                            await sock.sendMessage(
                                `${phoneNumber}@s.whatsapp.net`,
                                {
                                    text: sessionInfo.sessionId
                                }
                            );

                            console.log(
                                "[VORTEX] Session ID sent"
                            );

                        } catch (error) {
                            console.log(
                                "[VORTEX] Session ID message failed:",
                                error.message
                            );
                        }

                        /*
                         * MESSAGE 3
                         * Welcome message.
                         */
                        try {
                            await delay(700);

                            await sock.sendMessage(
                                `${phoneNumber}@s.whatsapp.net`,
                                {
                                    text:
`╭━━━〔 🌀 VORTEX XMD 〕━━━╮
┃
┃  👋 *WELCOME TO VORTEX XMD*
┃
┃  Your session is ready.
┃
┃  🔐 Keep your Session ID private.
┃  ⚠️ Never share it publicly.
┃
┃  Type *.menu* to explore
┃  the VORTEX features.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

Powered by Hector 🌀`
                                }
                            );

                            console.log(
                                "[VORTEX] Welcome message sent"
                            );

                        } catch (error) {
                            console.log(
                                "[VORTEX] Welcome message failed:",
                                error.message
                            );
                        }

                        /*
                         * Give WhatsApp/Baileys time to finish
                         * sending the three messages.
                         */
                        await delay(3000);

                        job.finished = true;

                        try {
                            sock.ws?.close();
                        } catch {}

                        job.sock = null;

                        /*
                         * Only temporary pairing files are
                         * removed. Permanent session remains.
                         */
                        fs.rmSync(
                            temporaryDir,
                            {
                                recursive: true,
                                force: true
                            }
                        );

                        console.log(
                            "[VORTEX] Temporary pairing files removed"
                        );

                    } catch (error) {
                        job.status =
                            "failed";

                        job.error =
                            error.message;

                        job.finished = true;

                        console.log(
                            "[VORTEX] Session generation failed:",
                            error.message
                        );

                        try {
                            sock.ws?.close();
                        } catch {}

                        fs.rmSync(
                            temporaryDir,
                            {
                                recursive: true,
                                force: true
                            }
                        );
                    }

                    return;
                }

                if (connection === "close") {
                    const statusCode =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;

                    console.log(
                        `[VORTEX] WhatsApp socket closed: ${statusCode || "unknown"}`
                    );

                    /*
                     * Baileys 515 means the socket needs
                     * to restart after pairing/linking.
                     */
                    if (
                        statusCode ===
                        DisconnectReason.restartRequired
                    ) {
                        console.log(
                            "[VORTEX] WhatsApp requested socket restart..."
                        );

                        job.status =
                            "reconnecting";

                        job.sock = null;

                        await delay(1000);

                        if (!job.finished) {
                            await connect();
                        }

                        return;
                    }

                    /*
                     * If pairing has not completed and the
                     * socket closes, reconnect.
                     */
                    if (
                        !state.creds.registered &&
                        !job.finished
                    ) {
                        console.log(
                            "[VORTEX] Pairing socket closed before completion. Reconnecting..."
                        );

                        job.status =
                            "reconnecting";

                        job.sock = null;

                        await delay(2000);

                        if (!job.finished) {
                            await connect();
                        }

                        return;
                    }

                    if (!job.finished) {
                        job.status =
                            statusCode ===
                            DisconnectReason.loggedOut
                                ? "logged_out"
                                : "failed";

                        job.error =
                            statusCode ===
                            DisconnectReason.loggedOut
                                ? "WhatsApp session was logged out"
                                : `WhatsApp connection closed (${statusCode || "unknown"})`;

                        console.log(
                            `[VORTEX] ${job.error}`
                        );
                    }
                }
            }
        );

        /*
         * Request pairing code only once.
         */
        if (
            !state.creds.registered &&
            !job.pairingRequested
        ) {
            job.pairingRequested = true;

            job.status =
                "requesting_code";

            await delay(3000);

            let code =
                await sock.requestPairingCode(
                    phoneNumber
                );

            code =
                code
                    ?.match(/.{1,4}/g)
                    ?.join("-") ||
                code;

            job.code = code;

            job.status =
                "waiting";

            console.log(
                `[VORTEX] Pairing code generated for ${phoneNumber}`
            );
        }
    }

    try {
        await connect();

        return {
            jobId,
            code: job.code,
            status: job.status
        };

    } catch (error) {
        job.status =
            "failed";

        job.error =
            error.message;

        job.finished = true;

        console.log(
            "[VORTEX] Pairing error:",
            error.message
        );

        try {
            job.sock?.ws?.close();
        } catch {}

        fs.rmSync(
            temporaryDir,
            {
                recursive: true,
                force: true
            }
        );

        throw error;
    }
}

module.exports = {
    startPairing
};
