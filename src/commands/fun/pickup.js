const { commandResponse } = require("../../utils/branding");
const L = [
    "Are you WiFi? Because I'm feeling a strong connection.",
    "Do you have a map? I keep getting lost in your smile.",
    "Are you a charger? Because my energy goes up when you're around.",
    "Is your name Google? Because you have everything I'm searching for.",
    "Are you jollof? Because everyone fights over you.",
    "Do you believe in love at first text, or should I message again?",
    "You must be a keyboard, because you're just my type.",
    "If you were a command, you'd be .alive. You make my day.",
    "Are you a bank? Because you have my interest.",
    "Is it hot, or is it just you and my phone at 1 percent?"
];
module.exports = {
    name: "pickup", aliases: ["pickupline", "flirt"], category: "fun",
    permission: "public", description: "A cheesy pickup line.",
    usage: ".pickup",
    async execute() {
        return commandResponse(`😏 *Pickup line*\n\n${L[Math.floor(Math.random() * L.length)]}`);
    }
};
