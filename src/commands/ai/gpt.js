const { commandResponse } = require("../../utils/branding");
const { askAI } = require("../../services/ai");

module.exports = {
    name: "gpt",
    aliases: ["gptai"],
    category: "ai",
    permission: "public",
    description: "Chat with the configured GPT provider.",
    usage: ".gpt <question>",

    async execute(context) {
        const prompt = context.args?.join(" ").trim();

        if (!prompt) {
            return commandResponse(
`╭━━━〔 🤖 VORTEX GPT 〕━━━╮
┃
┃  Usage:
┃  .gpt <question>
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const answer = await askAI(prompt);

        return commandResponse(
`╭━━━〔 🤖 VORTEX GPT 〕━━━╮
┃
┃  ${answer.replace(/\n/g, "\n┃  ")}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
