const { commandResponse } = require("../../utils/branding");

const quotes = [
    "Great things take time. Keep building. 🌀",
    "Discipline beats motivation when motivation disappears. ⚡",
    "Small progress is still progress. 🚀",
    "Build quietly. Let the results make the noise. 🔥",
    "Your future is built by what you do today. 💯"
];

module.exports = {
    name: "quote",
    aliases: ["quotes"],
    category: "fun",
    permission: "public",
    description: "Get a random motivational quote.",
    usage: ".quote",

    async execute() {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        return commandResponse(
`╭━━━〔 💭 VORTEX QUOTE 〕━━━╮
┃
┃  "${quote}"
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
