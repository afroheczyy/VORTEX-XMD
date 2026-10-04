const express = require("express");
const path = require("path");

const config = require("../../config/config");
const {
    startPairing
} = require("./pair");

const {
    generateSessionId
} = require("./generator");

const {
    getSessionDirectory,
    hasSession
} = require("../utils/auth");

const router = express.Router();
const jobs = new Map();

router.get("/status", (req, res) => {
    res.json({
        success: true,
        bot: config.botName,
        version: config.version,
        status: "online"
    });
});

router.post("/pair", async (req, res) => {
    try {
        const number =
            String(req.body?.number || "")
                .replace(/\D/g, "");

        if (!number) {
            return res.status(400).json({
                success: false,
                error: "WhatsApp number is required"
            });
        }

        const result =
            await startPairing(number, jobs);

        return res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error(
            "[VORTEX PAIRING ERROR]",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post("/test/:jobId", async (req, res) => {
    try {
        const job = jobs.get(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: "Pairing job not found"
            });
        }

        if (!job.sessionId) {
            return res.status(400).json({
                success: false,
                error: "Session ID is not ready yet"
            });
        }

        const testDir = path.resolve(
            process.cwd(),
            "database/session-test"
        );

        const fs = require("fs");

        fs.rmSync(testDir, {
            recursive: true,
            force: true
        });

        fs.mkdirSync(testDir, {
            recursive: true
        });

        const {
            restoreSessionId
        } = require("./generator");

        const restored =
            restoreSessionId(
                job.sessionId,
                testDir
            );

        const files =
            Object.keys(restored.files || {});

        return res.json({
            success: true,
            status: "restore_success",
            files: files.length,
            message:
                "Session ID successfully decoded and restored."
        });

    } catch (error) {
        console.error(
            "[VORTEX SESSION TEST ERROR]",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get("/status/:jobId", (req, res) => {
    const job =
        jobs.get(req.params.jobId);

    if (!job) {
        return res.status(404).json({
            success: false,
            error: "Pairing job not found"
        });
    }

    return res.json({
        success: true,
        status: job.status,
        code: job.code,
        sessionId: job.sessionId,
        error: job.error
    });
});

/*
 * Recover Session ID from the existing
 * permanent VORTEX authentication folder.
 */
router.get("/recover", (req, res) => {
    try {
        const sessionDir =
            getSessionDirectory(config);

        if (!hasSession(sessionDir)) {
            return res.status(404).json({
                success: false,
                error: "No saved VORTEX session found"
            });
        }

        const result =
            generateSessionId(sessionDir);

        return res.json({
            success: true,
            status: "recovered",
            sessionId: result.sessionId
        });

    } catch (error) {
        console.error(
            "[VORTEX RECOVERY ERROR]",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: "Session recovery failed"
        });
    }
});

const app = express();

app.use(express.json());

app.use(
    express.static(
        path.resolve(
            process.cwd(),
            "public"
        )
    )
);

app.use(
    "/api/session",
    router
);

module.exports = {
    createSessionServer: () => app
};
