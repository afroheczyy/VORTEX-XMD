const { commandResponse } = require("../../utils/branding");

const answers = [
    "🎱 Definitely yes.",
    "🎱 No doubt about it.",
    "🎱 Most likely.",
    "🎱 Ask again later.",
    "🎱 The signs are unclear.",
    "🎱 Probably not.",
    "🎱 Absolutely not.",
    "🎱 My sources say yes.",
    "🎱 I wouldn't count on it."
];

module.exports = {
    name: "8ball",
    aliases: ["eightball"],
    category: "fun",
    permission: "public",
    description: "Ask the magic 8-ball a question.",
    usage: ".8ball <question>",

    async execute(context) {
        if (!context.args?.length) {
            return commandResponse(
`╭━━━〔 🎱 VORTEX 8BALL 〕━━━╮
┃
┃  Ask me a question.
┃
┃  Example:
┃  .8ball Will I become rich?
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const answer = answers[Math.floor(Math.random() * answers.length)];

        return commandResponse(
`╭━━━〔 🎱 VORTEX 8BALL 〕━━━╮
┃
┃  ❓ ${context.args.join(" ")}
┃
┃  ${answer}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
