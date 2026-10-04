const { commandResponse } = require("../../utils/branding");
const L = [
    "your WiFi signal has more confidence than you. 📶",
    "you replied 'on my way' while still in bed. 🛏️",
    "your phone battery lasts shorter than your plans. 🔋",
    "you read the message, thought about replying, then lived your life. 💀",
    "you have 400 unread chats and still say 'I'm not on my phone much'. 😭",
    "your 'five minutes' is a full season of a series. ⏰",
    "you open the fridge every ten minutes hoping it changed. 🧊"
];
module.exports = {
    name: "roast", aliases: ["burn"], category: "fun",
    permission: "public", description: "A light-hearted roast.",
    usage: ".roast <name>",
    async execute(context) {
        const who = (context.args || []).join(" ").trim() || "you";
        const line = L[Math.floor(Math.random() * L.length)];
        return commandResponse(`🔥 *Roast*\n\n${who}, ${line}\n\n(just joking 😄)`);
    }
};
