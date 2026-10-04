const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "aimenu",
    aliases: ["aihelp"],
    category: "ai",
    permission: "public",
    description: "Show VORTEX AI commands.",
    usage: ".aimenu",

    async execute() {
        return commandResponse(
`╭━━━〔 🤖 VORTEX AI MENU 〕━━━╮
┃
┃  ⬡ .ai <question>
┃  ⬡ .gpt <question>
┃  ⬡ .ask <question>
┃  ⬡ .aistatus
┃
┃  More AI tools coming.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
