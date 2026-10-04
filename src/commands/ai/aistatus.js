const { commandResponse } = require("../../utils/branding");
const { getAIStatus } = require("../../services/ai");

module.exports = {
    name: "aistatus",
    aliases: ["aiconfig"],
    category: "ai",
    permission: "owner",
    description: "Show AI provider configuration.",
    usage: ".aistatus",

    async execute() {
        const status = getAIStatus();

        return commandResponse(
`╭━━━〔 🤖 VORTEX AI STATUS 〕━━━╮
┃
┃  Provider : ${status.provider}
┃  Model    : ${status.model}
┃  API Key  : ${status.configured ? "READY" : "NOT SET"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
