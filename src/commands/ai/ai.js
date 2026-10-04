const { commandResponse } = require("../../utils/branding");
const { askAI } = require("../../services/ai");

module.exports = {
    name: "ai",
    aliases: ["ask", "chat"],
    category: "ai",
    permission: "public",
    description: "Ask VORTEX AI anything.",
    usage: ".ai <question>",

    async execute(context) {
        const prompt = context.args?.join(" ").trim();

        if (!prompt) {
            return commandResponse(
`╭━━━〔 🤖 VORTEX AI 〕━━━╮
┃
┃  Ask me anything.
┃
┃  Example:
┃  .ai explain JavaScript
┃  .ai write a funny caption
┃  .ai who is Rimuru?
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const answer = await askAI(prompt);

        return commandResponse(
`╭━━━〔 🤖 VORTEX AI 〕━━━╮
┃
┃  ${answer.replace(/\n/g, "\n┃  ")}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
