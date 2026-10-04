const fs = require("fs");
const path = require("path");

function getSessionDirectory(config) {
    return path.resolve(
        process.cwd(),
        config.whatsapp.sessionDir
    );
}

function hasSession(sessionDir) {
    if (!fs.existsSync(sessionDir)) {
        return false;
    }

    return fs.readdirSync(sessionDir).length > 0;
}

module.exports = {
    getSessionDirectory,
    hasSession
};
