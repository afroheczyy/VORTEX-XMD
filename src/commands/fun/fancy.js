const { commandResponse } = require("../../utils/branding");
const styles = {
    "Bold": [0x1D5D4, 0x1D5EE],
    "Bold Italic": [0x1D63C, 0x1D656],
    "Mono": [0x1D670, 0x1D68A],
    "Circled": [0x24B6, 0x24D0]
};
function conv(text, [up, low]) {
    return Array.from(text).map(ch => {
        const c = ch.charCodeAt(0);
        if (c >= 65 && c <= 90) return String.fromCodePoint(up + c - 65);
        if (c >= 97 && c <= 122) return String.fromCodePoint(low + c - 97);
        return ch;
    }).join("");
}
module.exports = {
    name: "fancy", aliases: ["font", "style"], category: "fun",
    permission: "public", description: "Turn text into fancy fonts.",
    usage: ".fancy <text>",
    async execute(context) {
        const text = (context.args || []).join(" ").trim().slice(0, 100);
        if (!text) return commandResponse("✨ Usage: .fancy VORTEX");
        const out = Object.entries(styles).map(([n, s]) => `*${n}*\n${conv(text, s)}`).join("\n\n");
        return commandResponse(`✨ *Fancy Text*\n\n${out}`);
    }
};
