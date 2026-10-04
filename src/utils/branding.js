const config = require("../../config/config");

function footer() {
    return `\n\n╰─ ${config.branding.footer} 🌀`;
}

function header(title) {
    return `╭━━━〔 ${config.branding.emoji} ${title} 〕━━━╮`;
}

function box(title, body) {
    return [
        header(title),
        "┃",
        ...String(body)
            .split("\n")
            .map(line => `┃ ${line}`),
        "┃",
        `╰━━━━━━━━━━━━━━━━━━━━━━╯`,
        footer()
    ].join("\n");
}

function commandResponse(text) {
    return `${text}${footer()}`;
}

module.exports = {
    footer,
    header,
    box,
    commandResponse
};
