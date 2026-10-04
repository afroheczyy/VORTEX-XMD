const crypto = require("crypto");
const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "uuid", aliases: ["guid"], category: "search",
    permission: "public", description: "Generate a random UUID.",
    usage: ".uuid",
    async execute() {
        return commandResponse(`🆔 *UUID*\n\n${crypto.randomUUID()}`);
    }
};
