const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const config = require("../../config/config");

function collectFiles(directory, base = directory) {
    const result = {};

    for (const name of fs.readdirSync(directory)) {
        const fullPath = path.join(directory, name);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            Object.assign(result, collectFiles(fullPath, base));
            continue;
        }

        const relative = path.relative(base, fullPath);

        result[relative] =
            fs.readFileSync(fullPath).toString("base64");
    }

    return result;
}

function encodeAuthDirectory(directory) {
    if (!fs.existsSync(directory)) {
        throw new Error("Authentication directory was not found");
    }

    const files = collectFiles(directory);

    if (!Object.keys(files).length) {
        throw new Error("Authentication directory is empty");
    }

    const payload = JSON.stringify({
        version: 1,
        files
    });

    return zlib
        .gzipSync(Buffer.from(payload))
        .toString("base64url");
}

function generateSessionId(directory) {
    const encodedData = encodeAuthDirectory(directory);

    return {
        sessionId:
            `${config.session.prefix}${encodedData}`,
        encodedData
    };
}

function decodeSessionId(sessionId) {
    const prefix = config.session.prefix;

    if (
        typeof sessionId !== "string" ||
        !sessionId.startsWith(prefix)
    ) {
        throw new Error("Invalid VORTEX Session ID");
    }

    try {
        const compressed = Buffer.from(
            sessionId.slice(prefix.length),
            "base64url"
        );

        const json = zlib
            .gunzipSync(compressed)
            .toString("utf8");

        const decoded = JSON.parse(json);

        if (
            decoded.version !== 1 ||
            !decoded.files
        ) {
            throw new Error();
        }

        return decoded;
    } catch {
        throw new Error("Corrupted VORTEX Session ID");
    }
}

function restoreSessionId(sessionId, targetDirectory) {
    const decoded = decodeSessionId(sessionId);
    const root = path.resolve(targetDirectory);

    fs.mkdirSync(root, { recursive: true });

    for (const [relative, encoded] of Object.entries(decoded.files)) {
        const destination = path.resolve(root, relative);

        if (
            destination !== root &&
            !destination.startsWith(root + path.sep)
        ) {
            throw new Error("Invalid session file path");
        }

        fs.mkdirSync(path.dirname(destination), {
            recursive: true
        });

        fs.writeFileSync(
            destination,
            Buffer.from(encoded, "base64")
        );
    }

    return decoded;
}

module.exports = {
    encodeAuthDirectory,
    generateSessionId,
    decodeSessionId,
    restoreSessionId
};
