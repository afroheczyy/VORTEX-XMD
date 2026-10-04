const { commandResponse } = require("../../utils/branding");
const L = [
    "You light up every chat you enter. 🌟", "Your energy is unmatched. 🔥",
    "You make hard things look easy. 💪", "You're the kind of person people are glad to know. 🤝",
    "Your sense of humour is elite. 😂", "You're more capable than you think. 🚀",
    "You have great taste, no cap. 👌", "The group is better with you in it. ❤️",
    "You're doing better than you give yourself credit for. 🌱", "Big brain, bigger heart. 🧠"
];
module.exports = {
    name: "compliment", aliases: ["praise", "hype"], category: "fun",
    permission: "public", description: "Get a random compliment.",
    usage: ".compliment [name]",
    async execute(context) {
        const who = (context.args || []).join(" ").trim();
        const line = L[Math.floor(Math.random() * L.length)];
        return commandResponse(`💖 *Compliment*\n\n${who ? who + ", " : ""}${line}`);
    }
};
