const { commandResponse } = require("../../utils/branding");

const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
    "I told my computer I needed a break. Now it won't stop sending me KitKat ads. 😂",
    "Why was the JavaScript developer sad? Because he didn't know how to null his feelings. 😭",
    "A SQL query walks into a bar and asks: Can I join you? 🍺",
    "Why do developers love keyboards? Because they have all the right keys. 😂"
];

module.exports = {
    name: "joke",
    aliases: ["jokes"],
    category: "fun",
    permission: "public",
    description: "Get a random joke.",
    usage: ".joke",

    async execute() {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        return commandResponse(
`╭━━━〔 😂 VORTEX JOKE 〕━━━╮
┃
┃  ${joke}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
