const config = require("../../config/config");

function parseMessage(text) {
    if (!text || typeof text !== "string") {
        return null;
    }

    const prefix = config.bot.prefix;

    if (!text.startsWith(prefix)) {
        return null;
    }

    const body = text
        .slice(prefix.length)
        .trim();

    if (!body) {
        return null;
    }

    const parts = body.split(/\s+/);

    const command = parts
        .shift()
        .toLowerCase();

    return {
        prefix,
        command,
        args: parts,
        text: parts.join(" "),
        raw: text
    };
}

module.exports = {
    parseMessage
};
