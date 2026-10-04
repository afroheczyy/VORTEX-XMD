const { commandResponse } = require("../../utils/branding");

const questions = [
    {
        q: "What planet is known as the Red Planet?",
        a: "mars"
    },
    {
        q: "How many continents are there?",
        a: "7"
    },
    {
        q: "What is the largest ocean on Earth?",
        a: "pacific"
    },
    {
        q: "What programming language runs in a browser?",
        a: "javascript"
    },
    {
        q: "How many sides does a hexagon have?",
        a: "6"
    }
];

const active = new Map();

module.exports = {
    name: "trivia",
    aliases: ["triv"],
    category: "games",
    permission: "public",
    description: "Play a quick trivia question.",
    usage: ".trivia",

    async execute(context) {
        const key = context.remoteJid;

        if (context.args?.length) {
            const answer = context.args.join(" ").toLowerCase().trim();
            const current = active.get(key);

            if (!current) {
                return commandResponse(
`╭━━━〔 🧠 VORTEX TRIVIA 〕━━━╮
┃
┃  No active question.
┃  Use .trivia to start one.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
                );
            }

            active.delete(key);

            if (answer === current.a) {
                return commandResponse(
`╭━━━〔 🧠 VORTEX TRIVIA 〕━━━╮
┃
┃  🎉 Correct!
┃  🏆 Nice one!
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
                );
            }

            return commandResponse(
`╭━━━〔 🧠 VORTEX TRIVIA 〕━━━╮
┃
┃  ❌ Wrong!
┃  ✅ Answer : ${current.a}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const question =
            questions[Math.floor(Math.random() * questions.length)];

        active.set(key, question);

        return commandResponse(
`╭━━━〔 🧠 VORTEX TRIVIA 〕━━━╮
┃
┃  ❓ ${question.q}
┃
┃  Reply:
┃  .trivia <answer>
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
