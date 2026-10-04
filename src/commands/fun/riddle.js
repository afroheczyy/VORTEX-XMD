const { commandResponse } = require("../../utils/branding");
const R = [
    ["What has hands but can't clap?", "A clock"],
    ["What gets wetter the more it dries?", "A towel"],
    ["What has a neck but no head?", "A bottle"],
    ["What can you catch but not throw?", "A cold"],
    ["What has keys but can't open locks?", "A keyboard"],
    ["The more you take, the more you leave behind. What am I?", "Footsteps"],
    ["What has many teeth but can't bite?", "A comb"],
    ["What runs but never walks?", "Water"]
];
module.exports = {
    name: "riddle", aliases: ["puzzle"], category: "fun",
    permission: "public", description: "Get a riddle. The answer comes in 30 seconds.",
    usage: ".riddle",
    async execute(context) {
        const [q, a] = R[Math.floor(Math.random() * R.length)];
        setTimeout(() => {
            context.sock.sendMessage(context.remoteJid,
                { text: `💡 *Answer:* ${a}` }, { quoted: context.message }).catch(() => {});
        }, 30000);
        return commandResponse(`🧩 *RIDDLE*\n\n${q}\n\n⏳ Answer in 30 seconds...`);
    }
};
