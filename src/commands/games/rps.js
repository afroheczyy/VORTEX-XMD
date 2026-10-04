const { commandResponse } = require("../../utils/branding");

const choices = ["rock", "paper", "scissors"];

module.exports = {
    name: "rps",
    aliases: ["rockpaper", "rockpaperscissors"],
    category: "games",
    permission: "public",
    description: "Play rock paper scissors.",
    usage: ".rps <rock|paper|scissors>",

    async execute(context) {
        const player = context.args?.[0]?.toLowerCase();

        if (!choices.includes(player)) {
            return commandResponse(
`╭━━━〔 ✊ VORTEX RPS 〕━━━╮
┃
┃  Choose:
┃  ✊ rock
┃  📄 paper
┃  ✂️ scissors
┃
┃  Example:
┃  .rps rock
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const bot = choices[Math.floor(Math.random() * choices.length)];

        let result;

        if (player === bot) {
            result = "🤝 DRAW";
        } else if (
            (player === "rock" && bot === "scissors") ||
            (player === "paper" && bot === "rock") ||
            (player === "scissors" && bot === "paper")
        ) {
            result = "🏆 YOU WIN";
        } else {
            result = "🤖 VORTEX WINS";
        }

        return commandResponse(
`╭━━━〔 ✊ VORTEX RPS 〕━━━╮
┃
┃  👤 You    : ${player}
┃  🤖 VORTEX : ${bot}
┃
┃  ${result}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
