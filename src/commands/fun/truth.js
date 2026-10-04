const { commandResponse } = require("../../utils/branding");
const truths = [
    "What's the most embarrassing thing you've done in public?",
    "What's a secret talent nobody knows you have?",
    "Who was your first crush?",
    "What's the last lie you told?",
    "What's the worst gift you've ever received?",
    "What's something you're afraid to tell your parents?",
    "What's your biggest irrational fear?",
    "Which app do you waste the most time on?",
    "What's the silliest thing you've cried over?",
    "If you could swap lives with someone here, who would it be?"
];
const dares = [
    "Send a voice note singing your favourite song.",
    "Change your WhatsApp status to 'I love VORTEX' for 1 hour.",
    "Text the 5th person in your chat list 'I miss you'.",
    "Do 15 push-ups and send proof.",
    "Speak in a funny accent for the next 5 messages.",
    "Send your best selfie face right now.",
    "Tell the group your most-played song this week.",
    "Write a two-line poem about the person above you."
];
module.exports = {
    name: "truth", aliases: ["dare", "tod"], category: "fun",
    permission: "public", description: "Random truth or dare.",
    usage: ".truth | .dare",
    async execute(context) {
        const used = (context.commandName || context.command || "").toLowerCase();
        const dare = used === "dare" ? true : used === "truth" ? false : Math.random() < 0.5;
        const list = dare ? dares : truths;
        const pick = list[Math.floor(Math.random() * list.length)];
        return commandResponse(`${dare ? "🔥 *DARE*" : "🧠 *TRUTH*"}\n\n${pick}`);
    }
};
