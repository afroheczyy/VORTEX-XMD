const { commandResponse } = require("../../utils/branding");

const games = new Map();

module.exports = {
    name: "guess",
    aliases: ["guessnumber"],
    category: "games",
    permission: "public",
    description: "Guess a number between 1 and 10.",
    usage: ".guess <number>",

    async execute(context) {
        const key = context.remoteJid;
        const guess = Number(context.args?.[0]);

        if (!Number.isInteger(guess) || guess < 1 || guess > 10) {
            return commandResponse(
`╭━━━〔 🎯 VORTEX GUESS 〕━━━╮
┃
┃  Guess a number from 1–10.
┃
┃  Example:
┃  .guess 7
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        let target = games.get(key);

        if (!target) {
            target = Math.floor(Math.random() * 10) + 1;
            games.set(key, target);
        }

        if (guess === target) {
            games.delete(key);

            return commandResponse(
`╭━━━〔 🎯 VORTEX GUESS 〕━━━╮
┃
┃  🎉 Correct!
┃  🔢 Number : ${target}
┃
┃  New number generated.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        return commandResponse(
`╭━━━〔 🎯 VORTEX GUESS 〕━━━╮
┃
┃  ❌ Wrong guess!
┃  🔥 Try ${guess < target ? "higher" : "lower"}.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
