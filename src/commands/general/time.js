const { commandResponse } = require("../../utils/branding");
const config = require("../../../config/config");

module.exports = {
    name: "time",
    aliases: ["clock"],
    category: "general",
    permission: "public",
    description: "Show the current bot time.",
    usage: ".time",

    async execute() {
        const now = new Date();

        const time = new Intl.DateTimeFormat("en-GH", {
            timeZone: config.bot.timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(now);

        const date = new Intl.DateTimeFormat("en-GH", {
            timeZone: config.bot.timezone,
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(now);

        return commandResponse(
`╭━━━〔 🕐 VORTEX TIME 〕━━━╮
┃
┃  📅 Date : ${date}
┃  🕐 Time : ${time}
┃  🌍 Zone : ${config.bot.timezone}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
