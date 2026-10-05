const { commandResponse } = require("../../utils/branding");
const Q = [
    ["always be 10 minutes late", "always be 20 minutes early"],
    ["have unlimited data but no WiFi", "have WiFi but only 1 GB data"],
    ["lose your phone for a month", "lose your best friend for a week"],
    ["be famous but broke", "be rich but unknown"],
    ["only eat jollof forever", "never eat jollof again"],
    ["travel to the past", "travel to the future"],
    ["speak every language", "talk to animals"],
    ["never sleep and never be tired", "sleep 12 hours and be super productive"],
    ["have no social media", "have no music"],
    ["fly but only 1 metre high", "run at 100 km/h but only on Sundays"],
    ["always say what you think", "never be able to speak your mind"],
    ["live in a big city", "live in a quiet village"]
];
module.exports = {
    name: "wyr", aliases: ["wouldyourather", "rather"], category: "fun",
    permission: "public", description: "Would you rather question.",
    usage: ".wyr",
    async execute() {
        const [a, b] = Q[Math.floor(Math.random() * Q.length)];
        return commandResponse(`🤔 *WOULD YOU RATHER*\n\n🅰️ ${a}\n\n🅱️ ${b}\n\n_Reply A or B!_`);
    }
};
